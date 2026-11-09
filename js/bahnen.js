// „Symmetrie festhalten“ im Modus „Gitter und Basis“ (#121): Bahnen von Motiven unter einer
// Ebenengruppe, Vertreter je Bahn und Umrechnung auf die konventionelle Zelle einer bestimmten Gruppe.
// Entscheidungen in CLAUDE.md („Symmetrie festhalten“ in „Gitter und Basis“).
//
// Die Gruppe steht in der gegebenen Zelle in der Aufstellung nach ITA. Orientierung eines Motivs:
// O = D(winkel) · S^spiegel mit der Drehung D (im Uhrzeigersinn, y nach unten, wie motivKart) und der
// Spiegelung S an der eigenen y-Achse (x → −x). Das Bild unter einer Operation mit kartesischem
// Drehanteil C hat die Orientierung C · O.

import { anwenden, mod1, lage, gruppe } from './symmetrie.js';
import { ebenengruppe } from './ebenengruppen.js';
import { TOL as TOL_BESTIMMUNG } from './bestimmung.js';
import { metrik, kart, kartMatrix, grad } from './zeichnung.js';
import { MOTIVE, motivKart, chiral } from './motive.js';

/** @import { Vec2, Mat2, Grad } from '../lib/common/js/typen.js' */
/** @import { Gruppe, Op } from './symmetrie.js' */
/** @import { Metrik } from './zeichnung.js' */
/** @import { Basiseintrag } from './motive.js' */
/** @import { Bestimmung } from './bestimmung.js' */

/** Orientierung als Matrix (kartesisch). @param {Pick<Basiseintrag, 'winkel' | 'spiegel'>} e @returns {Mat2} */
export function orientierung(e) {
  const w = ((e.winkel ?? 0) * Math.PI) / 180;
  const c = Math.cos(w); const n = Math.sin(w); const sx = e.spiegel ? -1 : 1;
  return [[c * sx, -n], [n * sx, c]];
}

/**
 * Winkel und Spiegelung zu einer orthogonalen Matrix N (Umkehrung von orientierung()). Bei einem
 * achiralen Motiv entfällt die Spiegelung: Es ist zu seiner y-Achse symmetrisch, D · S wirkt wie D.
 * @param {Mat2} N @param {string} motiv @returns {{ winkel: Grad, spiegel?: true }}
 */
export function ausOrientierung(N, motiv) {
  const gespiegelt = N[0][0] * N[1][1] - N[0][1] * N[1][0] < 0;
  // D = N · S, falls gespiegelt (S² = 1); Winkel aus der ersten Spalte von D
  const d0 = gespiegelt ? -N[0][0] : N[0][0]; const d1 = gespiegelt ? -N[1][0] : N[1][0];
  const w = Math.round(((Math.atan2(d1, d0) * 180) / Math.PI) * 1e9) / 1e9;
  return { winkel: grad(umlauf(w)), ...(gespiegelt && chiral(motiv) ? { spiegel: /** @type {true} */ (true) } : {}) };
}

/** Winkel in 0° bis unter 360° (wie umlauf() in zustand.js, hier ohne dessen Abhängigkeiten). @param {number} w */
const umlauf = (w) => { const r = ((w % 360) + 360) % 360; return r >= 360 ? 0 : r; };

/** @type {(A: Mat2, B: Mat2) => Mat2} */
const mal = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];

/** Abstand modulo Gitter (komponentenweise, Bruchkoordinaten). @param {Vec2} p @param {Vec2} q */
const abstandMod = (p, q) => Math.max(...[0, 1].map((i) => { const d = p[i] - q[i]; return Math.abs(d - Math.round(d)); }));

/**
 * Bahn eines Motivs: seine Bilder unter den Operationen der Gruppe, Lagen in [0, 1)². Fallen Bilder
 * auf derselben Lage zusammen (spezielle Lage, mit der Toleranz der Bestimmung), bleibt nur das erste, also das Bild der Identität
 * (Operationen in der Reihenfolge von g.alle, die Identität zuerst). Das erste Bild ist der Eintrag
 * selbst, mit seiner Lage in [0, 1)². Das Gitter M muss zum System der Gruppe passen, sonst ein Fehler.
 * @type {(g: Gruppe, M: Metrik, e: Basiseintrag) => Basiseintrag[]}
 */
export const motivBahn = (g, M, e) => bilderMitOperation(g, M, e).map((b) => b.bild);

/**
 * Bild eines Motivs unter einer Operation (Lage in [0, 1)²), ohne Prüfung auf Zusammenfallen.
 * @param {Op} op @param {Metrik} M @param {Basiseintrag} e @param {string} [name] Symbol der Gruppe, für die Fehlermeldung @returns {Basiseintrag}
 */
export function bildUnter(op, M, e, name = '') {
  const K = kartMatrix(M, op.R);
  // nur, wenn das Gitter zum System der Gruppe passt (sorgt der Aufrufer dafür); sonst wäre K keine Drehung
  if (Math.abs(K[0][0] * K[0][0] + K[1][0] * K[1][0] - 1) > 1e-6 || Math.abs(K[0][0] * K[0][1] + K[1][0] * K[1][1]) > 1e-6) {
    throw new Error(`Gitter passt nicht zur Gruppe${name ? ` ${name}` : ''}`);
  }
  /** @type {Basiseintrag} */
  const bild = { motiv: e.motiv, p: /** @type {Vec2} */ (anwenden(op, e.p).map(mod1)), ...ausOrientierung(mal(K, orientierung(e)), e.motiv) };
  if (e.farbe !== undefined) bild.farbe = e.farbe;
  if (e.groesse !== undefined) bild.groesse = e.groesse;
  return bild;
}

/**
 * Wie motivBahn(), mit der Nummer der Operation in g.alle je Bild (zum Ziehen und Bearbeiten eines Bildes).
 * @param {Gruppe} g @param {Metrik} M @param {Basiseintrag} e @returns {{ bild: Basiseintrag, op: number }[]}
 */
export function bilderMitOperation(g, M, e) {
  /** @type {{ bild: Basiseintrag, op: number }[]} */
  const out = [];
  g.alle.forEach((op, i) => {
    const p = /** @type {Vec2} */ (anwenden(op, e.p).map(mod1));
    if (out.some((b) => abstandMod(b.bild.p, p) < TOL_BESTIMMUNG)) return;
    out.push({ bild: bildUnter(op, M, e, g.daten.symbol), op: i });
  });
  return out;
}

/**
 * Vertreter, dessen Bild unter der Operation op das Motiv b ist (Umkehrung von bildUnter(); Lage in [0, 1)²).
 * Damit gehen Ziehen und Bearbeiten eines Bildes an den Vertreter (CLAUDE.md, „Symmetrie festhalten“).
 * @param {Op} op @param {Metrik} M @param {Basiseintrag} b @returns {Basiseintrag}
 */
export function vertreterVon(op, M, b) {
  const d = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0];
  /** @type {Op} */
  const inv = { R: [[op.R[1][1] / d, -op.R[0][1] / d], [-op.R[1][0] / d, op.R[0][0] / d]], t: [0, 0] };
  const t = [inv.R[0][0] * op.t[0] + inv.R[0][1] * op.t[1], inv.R[1][0] * op.t[0] + inv.R[1][1] * op.t[1]];
  inv.t = [-t[0], -t[1]];
  return bildUnter(inv, M, b);
}

/**
 * Passt das Motiv eines Vertreters nicht zur Lagesymmetrie? Dann bildet eine Operation seine Lage auf sich ab,
 * aber das Motiv auf ein anderes (CLAUDE.md, „Zusammenfallende Bilder“); die Bestimmung ergibt eine kleinere Gruppe.
 * @param {Gruppe} g @param {Metrik} M @param {Basiseintrag} e
 */
export function passtNichtZurLage(g, M, e) {
  const p = /** @type {Vec2} */ (e.p.map(mod1));
  return g.alle.some((op) => {
    const q = /** @type {Vec2} */ (anwenden(op, p).map(mod1));
    return abstandMod(q, p) < TOL_BESTIMMUNG && !gleichesMotiv(bildUnter(op, M, { ...e, p }), { ...e, p });
  });
}

/** Alle Motive der Struktur: die Bahnen der Vertreter nacheinander. @param {Gruppe} g @param {Metrik} M @param {Basiseintrag[]} vertreter */
export const ausschreiben = (g, M, vertreter) => vertreter.flatMap((e) => motivBahn(g, M, e));

/**
 * Gleiche Motive: Motiv, Farbe und Grösse gleich, Lage gleich modulo Gitter und dieselben Punkte
 * (die eigene Symmetrie zählt: ein um 90° gedrehtes Quadrat ist dasselbe).
 * @param {Basiseintrag} a @param {Basiseintrag} b @param {number} [tol]
 */
export function gleichesMotiv(a, b, tol = TOL_BESTIMMUNG) {
  if (a.motiv !== b.motiv || (a.farbe ?? 0) !== (b.farbe ?? 0)) return false;
  const ga = a.groesse ?? MOTIVE[a.motiv].groesse; const gb = b.groesse ?? MOTIVE[b.motiv].groesse;
  if (Math.abs(ga - gb) > 1e-9 || abstandMod(a.p, b.p) >= tol) return false;
  // Punkte relativ zur Mitte (kartesisch, |a| = 1), mit derselben Toleranz wie die Lage, mindestens 1e-6 der Grösse
  const pa = motivKart(a); const pb = motivKart(b);
  const t = Math.max(1e-6 * ga, tol);
  return pa.every((x) => pb.some((y) => x.art === y.art && Math.hypot(x.c[0] - y.c[0], x.c[1] - y.c[1]) < t));
}

/**
 * Vertreter je Bahn (beim Einschalten von „Symmetrie festhalten“): Jedes Motiv wird Vertreter, ausser
 * es ist schon Bild eines früheren Vertreters (gleichesMotiv()). Verglichen wird mit der Toleranz der
 * Bestimmung, und ein Vertreter rastet mit ihr auf eine spezielle Lage ein: Was die Bestimmung als
 * symmetrisch erkennt, fällt so ganz zusammen. Bei der bestimmten Gruppe einer Struktur bleibt je Bahn
 * genau ein Motiv.
 * @param {Gruppe} g @param {Metrik} M @param {Basiseintrag[]} basis @param {number} [tol] @returns {Basiseintrag[]}
 */
export function vertreter(g, M, basis, tol = TOL_BESTIMMUNG) {
  /** @type {Basiseintrag[]} */
  const out = [];
  /** @type {Basiseintrag[]} */
  const bilder = [];
  for (const e of basis) {
    if (bilder.some((b) => gleichesMotiv(b, e, tol))) continue;
    const v = { ...e, p: lage(g, e.p, tol).punkt };
    out.push(v);
    bilder.push(...motivBahn(g, M, v));
  }
  return out;
}

/**
 * Konventionelle Zelle mit derselben Händigkeit wie die gegebene (det > 0). bestimme() wählt unter
 * gleichwertigen Zellen die, die der gegebenen am nächsten liegt; das kann eine linkshändige sein (z. B.
 * −a, b). Da metrik() jede Zelle gleich händig darstellt, ergäbe die Umrechnung dann ein Spiegelbild.
 * Abhilfe ohne Wechsel der Aufstellung, Ursprung fest: a′ → −a′ (schiefwinklig, rechteckig, quadratisch;
 * die Spiegelung x → −x gehört zum Normalisator dieser Gruppen) bzw. a′ ↔ b′ (hexagonal, γ bleibt 120°).
 * tests/bahnen.test.mjs prüft, dass die Gruppe danach in der neuen Zelle in der Aufstellung nach ITA steht.
 * @param {Mat2} Z Spalten: konventionelle a′, b′ in Bruchkoordinaten der gegebenen Zelle
 * @param {import('./ebenengruppen.js').System} system
 * @returns {Mat2}
 */
export function rechtshaendig(Z, system) {
  if (Z[0][0] * Z[1][1] - Z[0][1] * Z[1][0] > 0) return Z;
  return system === 'hexagonal' ? [[Z[0][1], Z[0][0]], [Z[1][1], Z[1][0]]] : [[-Z[0][0], Z[0][1]], [-Z[1][0], Z[1][1]]];
}

/**
 * Struktur auf die konventionelle Zelle und den Ursprung nach ITA einer Bestimmung r umrechnen
 * (Übernahme der bestimmten Gruppe). Die neue Zelle wird wie jede gegebene Zelle mit |a| = 1 und b
 * waagrecht dargestellt (metrik()); das Bild dreht sich also mit, Motive drehen und skalieren gleich.
 * Die Zelle wird vorher rechtshändig gemacht (rechtshaendig()), damit das Bild nur gedreht, nicht gespiegelt wird.
 * Ergebnis: neue Metrik und die Motive mit Lagen in der neuen Zelle, ohne Doppelte (ist die gegebene Zelle
 * grösser, fallen Motive zusammen). Noch nicht auf Vertreter reduziert; ist die neue Zelle zentriert und
 * grösser als die gegebene, fehlen die Bilder unter der Zentrierung, bis vertreter() und ausschreiben() sie ergänzen.
 * @param {{ ba: number, gamma: Grad, basis: Basiseintrag[] }} st @param {Bestimmung} r
 * @returns {{ ba: number, gamma: Grad, basis: Basiseintrag[] }}
 */
export function umrechnen(st, r) {
  const M = metrik(st);
  const Z = rechtshaendig(r.zelle, r.gruppe.system);
  const a = kart(M, [Z[0][0], Z[1][0]]); const b = kart(M, [Z[0][1], Z[1][1]]);
  const la = Math.hypot(...a); const lb = Math.hypot(...b);
  // exakt nach dem System der Gruppe (sonst entscheiden Rundungsfehler, welche der gleichwertigen Zellen die
  // Bestimmung danach wählt, z. B. γ = 120,00000000000001); sonst auf 1e-9 gerundet
  const sys = r.gruppe.system;
  const rund = (/** @type {number} */ x) => Math.round(x * 1e9) / 1e9;
  const ba = sys === 'quadratisch' || sys === 'hexagonal' ? 1 : rund(lb / la);
  const gamma = sys === 'hexagonal' ? 120 : sys === 'schiefwinklig'
    ? rund((Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (la * lb)))) * 180) / Math.PI) : 90;
  const M2 = metrik({ ba, gamma: grad(gamma) });
  // T bildet die alten kartesischen Koordinaten auf die neuen ab: T · a = M2.a, T · b = M2.b
  /** @type {Mat2} */
  const alt = [[a[0], b[0]], [a[1], b[1]]];
  const d = alt[0][0] * alt[1][1] - alt[0][1] * alt[1][0];
  /** @type {Mat2} */
  const altInv = [[alt[1][1] / d, -alt[0][1] / d], [-alt[1][0] / d, alt[0][0] / d]];
  const T = mal([[M2.a[0], M2.b[0]], [M2.a[1], M2.b[1]]], altInv);
  const s = 1 / la; // Massstab: |a′| wird 1
  /** @type {Mat2} */
  const Q = [[T[0][0] / s, T[0][1] / s], [T[1][0] / s, T[1][1] / s]]; // Drehung (Zelle rechtshändig)
  const dz = Z[0][0] * Z[1][1] - Z[0][1] * Z[1][0];
  const Zi = [[Z[1][1] / dz, -Z[0][1] / dz], [-Z[1][0] / dz, Z[0][0] / dz]];
  /** @type {Basiseintrag[]} */
  const basis = [];
  for (const e of st.basis) {
    const v = [e.p[0] - r.ursprung[0], e.p[1] - r.ursprung[1]];
    /** @type {Vec2} */
    const p = [mod1(Zi[0][0] * v[0] + Zi[0][1] * v[1]), mod1(Zi[1][0] * v[0] + Zi[1][1] * v[1])];
    /** @type {Basiseintrag} */
    const neu = { motiv: e.motiv, p, ...ausOrientierung(mal(Q, orientierung(e)), e.motiv), groesse: (e.groesse ?? MOTIVE[e.motiv].groesse) * s };
    if (e.farbe !== undefined) neu.farbe = e.farbe;
    // ist die gegebene Zelle eine Überzelle der konventionellen, fallen Motive modulo des neuen Gitters zusammen
    if (!basis.some((x) => gleichesMotiv(x, neu, TOL_BESTIMMUNG))) basis.push(neu);
  }
  return { ba, gamma: grad(gamma), basis };
}

/**
 * Lässt sich eine umgerechnete Struktur mit den Reglern von „Gitter und Basis“ darstellen? Sonst ist die
 * Übernahme gesperrt (CLAUDE.md, „Symmetrie festhalten“): Metrik und Grösse jedes Motivs im Bereich.
 * @param {{ ba: number, gamma: number, basis: Basiseintrag[] }} u
 * @param {{ ba: [number, number], gamma: [number, number], groesse: [number, number] }} bereich (STRUKTUR_BEREICH)
 */
export function darstellbar(u, bereich) {
  /** @type {(x: number, b: [number, number]) => boolean} */
  const drin = (x, [lo, hi]) => x >= lo - 1e-9 && x <= hi + 1e-9;
  return drin(u.ba, bereich.ba) && drin(u.gamma, bereich.gamma)
    && u.basis.every((e) => drin(e.groesse ?? MOTIVE[e.motiv].groesse, bereich.groesse));
}

/**
 * Struktur zum Zeichnen und Bestimmen: mit festgehaltener Gruppe die Bahnen der Vertreter ausgeschrieben, sonst
 * unverändert. Das Gitter passt dann zum System der Gruppe (pruefeStruktur, gitterZurGruppe in zustand.js).
 * @template {{ ba: number, gamma: Grad, basis: Basiseintrag[], festeGruppe?: string | null }} S
 * @param {S} st @returns {S}
 */
export function ausgeschrieben(st) {
  if (!st.festeGruppe) return st;
  return { ...st, basis: ausschreiben(gruppe(st.festeGruppe), metrik(st), st.basis) };
}

// ---------------------------------------------------------------- Bedienung (struktur-ui.js), testbar ohne Seite

/**
 * Operation, unter der das Bild eines Vertreters gezeichnet ist, das an derselben Lage liegt wie sein Bild unter op.
 * Fallen auf einer speziellen Lage Bilder zusammen, ist nur das erste gezeichnet (motivBahn); eine Auswahl muss
 * dann dieses zeigen, sonst zeigten die Regler ein unsichtbares Bild.
 * @param {Gruppe} g @param {Metrik} M @param {Basiseintrag} e @param {number} op Nummer in g.alle
 */
export function sichtbareOp(g, M, e, op) {
  const p = /** @type {Vec2} */ (anwenden(g.alle[op], e.p).map(mod1));
  return bilderMitOperation(g, M, e).find((b) => abstandMod(b.bild.p, p) < TOL_BESTIMMUNG)?.op ?? op;
}

/**
 * Gitter im System einer Gruppe: die freien Parameter bleiben, die übrigen nach dem System (bei der Wahl einer Gruppe).
 * @param {{ ba: number, gamma: number }} gi @param {string} sym @returns {{ ba: number, gamma: Grad }}
 */
export function gitterImSystem(gi, sym) {
  const sys = ebenengruppe(sym).system;
  if (sys === 'schiefwinklig') return { ba: gi.ba, gamma: grad(gi.gamma) };
  if (sys === 'rechteckig') return { ba: gi.ba, gamma: grad(90) };
  return { ba: 1, gamma: grad(sys === 'hexagonal' ? 120 : 90) };
}

/**
 * Wahl einer Gruppe sym (CLAUDE.md, „Symmetrie festhalten“, Bedienung): die gezeichneten Motive werden unter der
 * neuen Gruppe auf Vertreter reduziert, wie beim Einschalten; das Gitter folgt dem System. null, wenn die Grenze
 * überschritten würde.
 * @param {{ ba: number, gamma: number, basis: Basiseintrag[] }} gezeichnet @param {string} sym @param {number} grenze
 * @returns {{ ba: number, gamma: Grad, basis: Basiseintrag[], festeGruppe: string } | null}
 */
export function mitGruppe(gezeichnet, sym, grenze) {
  const gi = gitterImSystem(gezeichnet, sym);
  const g = gruppe(sym);
  const basis = vertreter(g, metrik(gi), gezeichnet.basis);
  return basis.length * g.ordnung <= grenze ? { ...gi, basis, festeGruppe: sym } : null;
}

/**
 * Übernahme der bestimmten Gruppe r (Einschalten und „Bestimmte Gruppe übernehmen“): falls nötig umgerechnet auf
 * konventionelle Zelle und Ursprung nach ITA, dann je Bahn ein Vertreter. Mit der Umstellung für die Kenndaten
 * (zelle: Zelle in Vielfachen der vorherigen oder '', ursprung: neuer Ursprung oder null), oder { grund }.
 * @param {{ ba: number, gamma: Grad, basis: Basiseintrag[] }} gezeichnet @param {Bestimmung | null} r
 * @param {{ ba: [number, number], gamma: [number, number], groesse: [number, number] }} bereich @param {number} grenze
 * @returns {{ struktur: { ba: number, gamma: Grad, basis: Basiseintrag[], festeGruppe: string }, umstellung: { zelle: Mat2 | null, ursprung: Vec2 | null } } | { grund: string }}
 */
export function uebernahmeVon(gezeichnet, r, bereich, grenze) {
  if (!r) return { grund: 'Die Basis ist leer.' };
  let u = { ba: gezeichnet.ba, gamma: gezeichnet.gamma, basis: gezeichnet.basis };
  /** @type {{ zelle: Mat2 | null, ursprung: Vec2 | null }} */
  const umstellung = { zelle: null, ursprung: null };
  const Z = rechtshaendig(r.zelle, r.gruppe.system);
  const gleicheZelle = [[1, 0], [0, 1]].every((z, i) => z.every((x, j) => Math.abs(Z[i][j] - x) < 1e-9));
  const verschoben = Math.abs(r.ursprung[0]) > 1e-9 || Math.abs(r.ursprung[1]) > 1e-9;
  if (!gleicheZelle || verschoben) {
    u = umrechnen(gezeichnet, r);
    if (!darstellbar(u, bereich)) return { grund: 'Die konventionelle Zelle der bestimmten Gruppe liesse sich mit den Reglern nicht darstellen (Gitter oder Grösse eines Motivs ausserhalb des Bereichs).' };
    if (!gleicheZelle) umstellung.zelle = Z;
    if (verschoben) umstellung.ursprung = r.ursprung;
  }
  const g = gruppe(r.symbol);
  const basis = vertreter(g, metrik(u), u.basis);
  if (basis.length * g.ordnung > grenze) return { grund: `Mit festgehaltener Symmetrie wären es mehr als ${grenze} Motive (jede Bahn zählt mit der Zähligkeit der allgemeinen Lage).` };
  return { struktur: { ba: u.ba, gamma: u.gamma, basis, festeGruppe: r.symbol }, umstellung };
}
