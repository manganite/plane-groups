// Modus „Gitter und Basis“ (Konzept §3.2): Tafeln und Kenndaten, ohne DOM.
// Struktur = Gitter (b/a, γ wie metrik()) und Basis aus Motiven (motive.js). Die Symmetrie wird
// mit bestimme() (bestimmung.js) bestimmt; Tafel A zeigt die Struktur mit konventioneller Zelle,
// Symmetrieelementen und asymmetrischer Einheit der gefundenen Gruppe, Tafel B einen grösseren
// Ausschnitt.

import { metrik, kart, bruchVon, ansicht, elementeImBereich, elementeSVG, f2, pt } from './zeichnung.js';
import { gruppe, lage, mod1 } from './symmetrie.js';
import { bestimme } from './bestimmung.js';
import { MOTIVE, motivKart, strukturPunkte } from './motive.js';
import { vektorText } from './warum.js';
import { koordText, lageHTML, symbolHTML } from './text.js';
import { schoenfliesHTML } from './symbole.js';
import { SYSTEME, BRAVAIS } from './ebenengruppen.js';

/** @import { Vec2, Mat2, Kartesisch } from '../lib/common/js/typen.js' */
/** @import { Metrik, Ansicht, Farben } from './zeichnung.js' */
/** @import { Basiseintrag, Struktur } from './motive.js' */
/** @import { Bestimmung } from './bestimmung.js' */
/** @import { System } from './ebenengruppen.js' */
/** Bereich [[lo, hi], [lo, hi]] in Bruchkoordinaten. @typedef {[[number, number], [number, number]]} Bereich */
/**
 * Was Tafel A zeigt; farben: Symmetrieelemente in den Farben der Blickrichtungen, k: Grösse der Symbole.
 * @typedef {{ elemente?: boolean, zelle?: boolean, ae?: boolean, bindungen?: boolean, farben?: boolean, k?: number }} Anzeige
 */


/** Farben der Atomsorten (Motivfarben). */
/** @param {Farben} f */
export const motivFarben = (f) => [f.upper, f.accent2, f.dir[1], f.dir[0]];

/** Symmetrie der Struktur st = { ba, gamma, basis }: Ergebnis von bestimme() oder null. @param {Struktur} st */
export function strukturSymmetrie(st) {
  if (!st.basis.length) return null;
  const M = metrik(st);
  return bestimme({ a: M.a, b: M.b, punkte: strukturPunkte(st) });
}

/** Bruchkoordinaten (gegebene Zelle) eines Punktes x in der konventionellen Zelle des Ergebnisses. @type {(r: Bestimmung, x: Vec2) => Vec2} */
export const ausKonventionell = (r, x) => [r.ursprung[0] + r.zelle[0][0] * x[0] + r.zelle[0][1] * x[1], r.ursprung[1] + r.zelle[1][0] * x[0] + r.zelle[1][1] * x[1]];
/** Umgekehrt: Lage p (gegebene Zelle) in der konventionellen Zelle, in [0, 1). @param {Bestimmung} r @param {Vec2} p @returns {Vec2} */
export function inKonventionell(r, p) {
  const Z = r.zelle; const d = Z[0][0] * Z[1][1] - Z[0][1] * Z[1][0];
  const v = [p[0] - r.ursprung[0], p[1] - r.ursprung[1]];
  return /** @type {Vec2} */ ([(Z[1][1] * v[0] - Z[0][1] * v[1]) / d, (-Z[1][0] * v[0] + Z[0][0] * v[1]) / d].map(mod1));
}

/**
 * Ein Motiv als SVG, an der Lage p (Bruchkoordinaten der gegebenen Zelle).
 * @param {Basiseintrag} e @param {Vec2} p @param {Ansicht} A @param {Metrik} M @param {string} farbe @param {string} papier
 * @param {{ auswahl?: boolean }} [optionen]
 */
export function motivSVG(e, p, A, M, farbe, papier, { auswahl = false } = {}) {
  const d = MOTIVE[e.motiv];
  /** @param {Kartesisch<Vec2>} c */
  const bild = (c) => { const f = bruchVon(M, c); return A.zuBild([p[0] + f[0], p[1] + f[1]]); };
  const q = motivKart(e).map((x) => bild(x.c));
  const mitte = A.zuBild(p);
  const s = (e.groesse ?? d.groesse) * A.s;
  let svg;
  if (d.form === 'kreis') svg = `<circle cx="${f2(mitte[0])}" cy="${f2(mitte[1])}" r="${f2(s)}" fill="${farbe}" stroke="${papier}" stroke-width="1"/>`;
  else if (d.form === 'fahne') {
    svg = `<line x1="${f2(q[0][0])}" y1="${f2(q[0][1])}" x2="${f2(q[1][0])}" y2="${f2(q[1][1])}" stroke="${farbe}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<polygon points="${[q[1], q[2], q[3]].map(pt).join(' ')}" fill="${farbe}"/>`;
  } else if (d.form === 'ellipse') {
    // Ellipse durch die Endpunkte (lokal ±1, 0) und die Seiten (0, ±0,32)
    const rad = ((e.winkel ?? 0) * Math.PI) / 180; const g = e.groesse ?? d.groesse;
    const umriss = Array.from({ length: 28 }, (_, k) => {
      const w = (2 * Math.PI * k) / 28; const u = Math.cos(w); const v = 0.32 * Math.sin(w);
      return bild(/** @type {Kartesisch<Vec2>} */ ([g * (Math.cos(rad) * u - Math.sin(rad) * v), g * (Math.sin(rad) * u + Math.cos(rad) * v)]));
    });
    svg = `<polygon points="${umriss.map(pt).join(' ')}" fill="${farbe}" fill-opacity="0.9" stroke="${papier}" stroke-width="0.8"/>`;
  } else svg = `<polygon points="${q.map(pt).join(' ')}" fill="${farbe}" fill-opacity="${d.deckkraft ?? 0.9}" stroke="${papier}" stroke-width="0.8" stroke-linejoin="round"/>`;
  if (auswahl) svg += `<circle cx="${f2(mitte[0])}" cy="${f2(mitte[1])}" r="${f2(Math.max(14, s * 1.35))}" fill="none" stroke="${farbe}" stroke-width="1.8" stroke-dasharray="3 2.5"/>`;
  return svg;
}

/** Bereich der Bruchkoordinaten (gegebene Zelle), den das Bild der Ansicht A zeigt, mit Rand. @param {Ansicht} A @returns {Bereich} */
function bildBereich(A, rand = 0.3) {
  const ecken = /** @type {Vec2[]} */ ([[0, 0], [A.groesse, 0], [0, A.groesse], [A.groesse, A.groesse]]).map((q) => A.vonBild(q));
  return /** @type {Bereich} */ ([0, 1].map((i) => [Math.min(...ecken.map((e) => e[i])) - rand, Math.max(...ecken.map((e) => e[i])) + rand]));
}

/**
 * Alle Gitterbilder der Basis im Bereich [[lo, hi], [lo, hi]] (Bruchkoordinaten der gegebenen Zelle).
 * @param {Struktur} st @param {Ansicht} A @param {Metrik} M @param {Bereich} bereich @param {Farben} farben
 * @param {number | null} [auswahl] Nummer des ausgewählten Basiseintrags
 */
function basisSVG(st, A, M, bereich, farben, auswahl = null) {
  const f = motivFarben(farben);
  const [[lo0, hi0], [lo1, hi1]] = bereich;
  /** @type {string[]} */
  const out = [];
  st.basis.forEach((e, k) => {
    const p0 = e.p.map(mod1);
    // Ausdehnung des Motivs in Bruchkoordinaten: Kopien, deren Mitte knapp ausserhalb liegt,
    // ragen bei grossen Motiven (z. B. Ziegel) noch ins Bild
    const r = [0, 1].map((n) => Math.max(0, ...motivKart(e).map((q) => Math.abs(bruchVon(M, q.c)[n]))));
    const [a0, b0, a1, b1] = [lo0 - r[0], hi0 + r[0], lo1 - r[1], hi1 + r[1]];
    for (let i = Math.floor(a0) - 1; i <= Math.ceil(b0); i++) for (let j = Math.floor(a1) - 1; j <= Math.ceil(b1); j++) {
      /** @type {Vec2} */
      const p = [p0[0] + i, p0[1] + j];
      if (p[0] < a0 || p[0] > b0 || p[1] < a1 || p[1] > b1) continue;
      out.push(motivSVG(e, p, A, M, f[(e.farbe ?? 0) % f.length], farben.paper, { auswahl: auswahl === k && !i && !j }));
    }
  });
  return out.join('');
}

/**
 * Bindungen zwischen nächsten Nachbarn: Linien zwischen den Mitten der Atome (Motiv „Atom“),
 * deren Abstand höchstens 5 % über dem kleinsten Abstand zweier Atome liegt. Die Bindungen werden
 * einmal in der periodischen Zelle bestimmt (je Atom der Basis die Partner mit Gitterverschiebung)
 * und dann auf die Gitterbilder im Bereich übertragen; der Aufwand wächst so nur linear mit der
 * Zahl der Atome im Bild.
 * @param {Struktur} st
 * @param {Metrik} M
 * @returns {{ k: number, l: number, t: Vec2, von: number[], nach: number[] }[]}
 */
export function bindungenBasis(st, M) {
  const atome = st.basis.filter((e) => e.motiv === 'atom').map((e) => e.p.map(mod1));
  if (!atome.length) return [];
  const a = kart(M, [1, 0]); const b = kart(M, [0, 1]);
  const flaeche = Math.abs(a[0] * b[1] - a[1] * b[0]);
  if (!(flaeche > 1e-12)) return [];
  /** @param {number} k @param {number} l @param {Vec2} t */
  const abstand = (k, l, t) => {
    const c = kart(M, [atome[l][0] + t[0] - atome[k][0], atome[l][1] + t[1] - atome[k][1]]);
    return Math.hypot(c[0], c[1]);
  };
  // obere Schranke für den kleinsten Abstand: kürzester Gittervektor unter (±1, ±1)
  const L = Math.min(Math.hypot(...a), Math.hypot(...b), Math.hypot(a[0] + b[0], a[1] + b[1]), Math.hypot(a[0] - b[0], a[1] - b[1]));
  // Bindungen sind höchstens 1,05 L lang; |Bruchkoordinate| ≤ Länge · |reziproker Vektor|, Basisdifferenzen < 1
  const D = 1.05 * L + 1e-9;
  const R = [Math.ceil((D * Math.hypot(...b)) / flaeche) + 1, Math.ceil((D * Math.hypot(...a)) / flaeche) + 1];
  /** @type {{ k: number, l: number, t: Vec2, d: number }[]} */
  const kandidaten = [];
  for (let k = 0; k < atome.length; k++) for (let l = k; l < atome.length; l++) {
    for (let i = -R[0]; i <= R[0]; i++) for (let j = -R[1]; j <= R[1]; j++) {
      // jede Bindung nur einmal: (k, l, t) und (l, k, −t) sind dieselbe
      if (k === l && (i < 0 || (i === 0 && j <= 0))) continue;
      const d = abstand(k, l, [i, j]);
      if (d > 1e-6 && d <= D) kandidaten.push({ k, l, t: [i, j], d });
    }
  }
  const dmin = Math.min(...kandidaten.map((x) => x.d));
  return kandidaten.filter((x) => x.d <= dmin * 1.05).map(({ k, l, t }) => ({ k, l, t, von: atome[k], nach: atome[l] }));
}

/** @param {Struktur} st @param {Ansicht} A @param {Metrik} M @param {Bereich} bereich @param {string} farbe */
function bindungenSVG(st, A, M, bereich, farbe) {
  const [[lo0, hi0], [lo1, hi1]] = bereich;
  /** @param {Vec2} p */
  const drin = (p) => p[0] >= lo0 && p[0] <= hi0 && p[1] >= lo1 && p[1] <= hi1;
  /** @type {string[]} */
  const out = [];
  for (const { t, von, nach } of bindungenBasis(st, M)) {
    for (let i = Math.floor(lo0) - 1; i <= Math.ceil(hi0); i++) for (let j = Math.floor(lo1) - 1; j <= Math.ceil(hi1); j++) {
      /** @type {Vec2} */
      const p = [von[0] + i, von[1] + j];
      /** @type {Vec2} */
      const q = [nach[0] + t[0] + i, nach[1] + t[1] + j];
      if (!drin(p) || !drin(q)) continue;
      const u = A.zuBild(p); const v = A.zuBild(q);
      out.push(`M${f2(u[0])} ${f2(u[1])}L${f2(v[0])} ${f2(v[1])}`);
    }
  }
  return out.length ? `<path d="${out.join('')}" stroke="${farbe}" stroke-width="1.6" stroke-linecap="round" fill="none"/>` : '';
}

/** Ansicht der konventionellen Zelle: Bruchkoordinaten der konventionellen Zelle → Bild. @type {(A: Ansicht, r: Bestimmung) => Ansicht} */
const konvAnsicht = (A, r) => ({ ...A, zuBild: (x) => A.zuBild(ausKonventionell(r, x)) });

/**
 * Ist die konventionelle Zelle die gegebene (gleiche Achsen, Ursprung bei 0, 0)? Mit Toleranz: Bei zentrierten
 * Gittern entsteht die Zelle aus der primitiven und trägt Rundungsfehler (z. B. 0,9999999999999999).
 * @param {Bestimmung} r
 */
export const istGegeben = (r) => [[1, 0], [0, 1]].every((z, i) => z.every((x, j) => Math.abs(r.zelle[i][j] - x) < 1e-9))
  && Math.abs(r.ursprung[0]) < 1e-9 && Math.abs(r.ursprung[1]) < 1e-9;

/**
 * Beschriftung der Achsen einer Zelle (Ansicht Az der Zelle): ausserhalb, an den Kantenmitten. Ein Hof in der
 * Papierfarbe hält sie lesbar, wo sie auf Motiven liegen (Kontrast, Leitfaden Abschn. 5.4, #114).
 * @param {Ansicht} Az @param {[string, string]} namen @param {string} farbe @param {string} papier @param {string} groesse
 */
function achsenSVG(Az, namen, farbe, papier, groesse) {
  const m = Az.zuBild([0.5, 0.5]);
  /** @param {Vec2} p @param {string} text */
  const marke = (p, text) => {
    const q = Az.zuBild(p); const v = [q[0] - m[0], q[1] - m[1]]; const l = Math.hypot(...v) || 1;
    return `<text x="${f2(q[0] + (14 * v[0]) / l)}" y="${f2(q[1] + (14 * v[1]) / l)}">${text}</text>`;
  };
  const o = Az.zuBild([0, 0]);
  return `<g font-family="Source Serif 4, serif" font-style="italic" font-size="${groesse}" fill="${farbe}" stroke="${papier}" stroke-width="${f2(Number(groesse) / 4)}" stroke-linejoin="round" paint-order="stroke" text-anchor="middle" dominant-baseline="middle">${marke([0.36, 0], namen[0])}${marke([0, 0.36], namen[1])}</g>`
    + `<circle cx="${f2(o[0])}" cy="${f2(o[1])}" r="2.6" fill="${farbe}"/>`;
}

/**
 * Tafel A: die gegebene und die konventionelle Zelle mit der Struktur ringsum, darüber
 * Symmetrieelemente und asymmetrische Einheit der gefundenen Gruppe (in der konventionellen
 * Zelle, wie in ITA). fest: Ansicht, die beim Ziehen gleich bleibt. Rückgabe { svg, ansicht, ergebnis }.
 * @param {Struktur} st @param {Anzeige} anzeige @param {Farben} farben
 * @param {number | null} [auswahl] Nummer des ausgewählten Basiseintrags
 * @param {Ansicht | null} [fest]
 * @returns {{ svg: string, ansicht: Ansicht, ergebnis: Bestimmung | null }}
 */
export function strukturTafelA(st, anzeige, farben, auswahl = null, fest = null) {
  const M = metrik(st);
  const r = strukturSymmetrie(st);
  let A0 = fest;
  if (!A0) {
    /** @type {Vec2[]} */
    const ecken = [[0, 0], [1, 0], [0, 1], [1, 1]];
    if (r) for (const c of /** @type {Vec2[]} */ ([[0, 0], [1, 0], [0, 1], [1, 1]])) ecken.push(ausKonventionell(r, c));
    const cs = ecken.map((p) => kart(M, p));
    const rand = 0.3;
    A0 = ansicht(M, [Math.min(...cs.map((c) => c[0])) - rand, Math.min(...cs.map((c) => c[1])) - rand, Math.max(...cs.map((c) => c[0])) + rand, Math.max(...cs.map((c) => c[1])) + rand], 520, 20);
  }
  const A = A0;
  const gegeben = r && istGegeben(r);
  const teile = [`<rect width="520" height="520" fill="${farben.paper}"/>`];
  // Gitter der gegebenen Zellen (dünn) im ganzen Bild
  const [[lo0, hi0], [lo1, hi1]] = bildBereich(A, 1);
  /** @param {Vec2} p @param {Vec2} q */
  const linie = (p, q) => { const [a, b] = [A.zuBild(p), A.zuBild(q)]; return `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="${farben.line}" stroke-width="1"/>`; };
  for (let i = Math.floor(lo0); i <= Math.ceil(hi0); i++) teile.push(linie([i, lo1], [i, hi1]));
  for (let j = Math.floor(lo1); j <= Math.ceil(hi1); j++) teile.push(linie([lo0, j], [hi0, j]));
  if (!gegeben) {
    // gestrichelt neben der konventionellen Zelle; ohne sie ist die gegebene Zelle die einzige
    const poly = /** @type {Vec2[]} */ ([[0, 0], [1, 0], [1, 1], [0, 1]]).map((p) => pt(A.zuBild(p))).join(' ');
    teile.push(anzeige.zelle || !r
      ? `<polygon points="${poly}" fill="none" stroke="${farben.muted}" stroke-width="1.4" stroke-dasharray="4 3"/>`
      : `<polygon points="${poly}" fill="none" stroke="${farben.accent}" stroke-width="2.2"/>`);
  }
  if (r) {
    const Ak = konvAnsicht(A, r);
    const zelle = /** @type {Vec2[]} */ ([[0, 0], [1, 0], [1, 1], [0, 1]]).map((p) => pt(Ak.zuBild(p))).join(' ');
    if (anzeige.ae) {
      const ae = r.gruppe.ae.ecken.map((p) => pt(Ak.zuBild(p))).join(' ');
      teile.push(`<polygon points="${ae}" fill="${farben.crystal}" fill-opacity="0.6" stroke="${farben.accent}" stroke-width="1.4" stroke-dasharray="5 3"/>`);
    }
    if (anzeige.zelle) teile.push(`<polygon class="konv-zelle" points="${zelle}" fill="none" stroke="${farben.accent}" stroke-width="2.2"/>`);
  }
  if (anzeige.bindungen) teile.push(bindungenSVG(st, A, M, bildBereich(A), farben.muted));
  teile.push(basisSVG(st, A, M, bildBereich(A), farben, auswahl));
  // Symmetrieelemente über den Motiven, damit Drehpunkte auf Atomen sichtbar bleiben
  if (r && anzeige.elemente) teile.push(elementeSVG(gruppe(r.symbol), elementeImBereich(gruppe(r.symbol), 1), konvAnsicht(A, r), farben, anzeige.farben, { k: anzeige.k ?? 1 }));
  // Achsen: gegebene Zelle a, b; konventionelle a′, b′ (nur wenn verschieden)
  // Beschriftung der Achsen wie in Tafel A der Ebenengruppen (zeichnung.js): wächst mit der Symbolgrösse k
  const schrift = f2(19 * Math.min(anzeige.k ?? 1, 1.4));
  teile.push(achsenSVG(A, ['a', 'b'], gegeben || !anzeige.zelle ? farben.accent : farben.muted, farben.paper, schrift));
  if (r && !gegeben && anzeige.zelle) teile.push(achsenSVG(konvAnsicht(A, r), ['a′', 'b′'], farben.accent, farben.paper, schrift));
  return { svg: teile.join(''), ansicht: A, ergebnis: r };
}

/**
 * Tafel B: grösserer Ausschnitt der Struktur, konventionelle Zelle hervorgehoben; zoom > 1 zeigt einen kleineren Ausschnitt grösser.
 * Für das Skript (Kap. 8) lassen sich die Zelle weglassen und die Symmetrieelemente über das ganze Muster legen.
 * @param {Struktur} st @param {Farben} farben @param {Bestimmung | null} r @param {number} [zoom]
 * @param {{ zelle?: boolean, elemente?: boolean }} [optionen]
 * @returns {{ svg: string, ansicht: Ansicht }}
 */
export function strukturTafelB(st, farben, r, zoom = 1, { zelle: mitZelle = true, elemente = false } = {}) {
  const M = metrik(st);
  const mitte = kart(M, [0.5, 0.5]);
  const w = (4.4 * Math.max(1, st.ba)) / zoom;
  /** @type {[number, number, number, number]} */
  const box = [mitte[0] - w / 2, mitte[1] - w / 2, mitte[0] + w / 2, mitte[1] + w / 2];
  const A = ansicht(M, box, 520, 10);
  // Ecken des Ausschnitts (kartesisch) in Bruchkoordinaten
  const ecken = /** @type {Kartesisch<Vec2>[]} */ ([[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]]).map((c) => bruchVon(M, c));
  const lo = Math.floor(Math.min(...ecken.flat())) - 1; const hi = Math.ceil(Math.max(...ecken.flat())) + 1;
  const teile = [`<defs><clipPath id="ausschnitt-s"><rect x="10" y="10" width="500" height="500" rx="6"/></clipPath></defs>`,
    `<rect width="520" height="520" fill="${farben.paper}"/>`, '<g clip-path="url(#ausschnitt-s)">'];
  if (r && mitZelle) {
    const Ak = konvAnsicht(A, r);
    const zelle = /** @type {Vec2[]} */ ([[0, 0], [1, 0], [1, 1], [0, 1]]).map((p) => pt(Ak.zuBild(p))).join(' ');
    teile.push(`<polygon points="${zelle}" fill="${farben.crystal}" fill-opacity="0.35" stroke="${farben.accent}" stroke-width="2"/>`);
  }
  if (st.bindungen !== false) teile.push(bindungenSVG(st, A, M, [[lo, hi], [lo, hi]], farben.muted));
  teile.push(basisSVG(st, A, M, [[lo, hi], [lo, hi]], farben));
  if (r && elemente) {
    // Elemente einer konventionellen Zelle, über den ganzen Ausschnitt wiederholt (der Ausschnitt schneidet ab)
    const g = gruppe(r.symbol);
    const e = elementeImBereich(g, 1);
    /** @type {{ drehpunkte: typeof e.drehpunkte, linien: typeof e.linien }} */
    const alle = { drehpunkte: [], linien: [] };
    const Ak = konvAnsicht(A, r);
    const n = Math.ceil(hi - lo) + 2;
    // nur, was ins Bild reicht (mit Rand für die Symbole)
    /** @param {Vec2} q */
    const imBild = (q) => { const b = Ak.zuBild(q); return b[0] > -40 && b[0] < 560 && b[1] > -40 && b[1] < 560; };
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
      for (const d of e.drehpunkte) {
        /** @type {Vec2} */
        const q = [d.punkt[0] + i, d.punkt[1] + j];
        if (imBild(q)) alle.drehpunkte.push({ ...d, punkt: q });
      }
      for (const l of e.linien) {
        const st = /** @type {[Vec2, Vec2]} */ (l.strecke.map((q) => [q[0] + i, q[1] + j]));
        if (imBild(st[0]) || imBild(st[1]) || imBild([(st[0][0] + st[1][0]) / 2, (st[0][1] + st[1][1]) / 2])) alle.linien.push({ ...l, strecke: st });
      }
    }
    teile.push(elementeSVG(g, alle, Ak, farben, false));
  }
  teile.push('</g>');
  teile.push(`<rect x="10" y="10" width="500" height="500" rx="6" fill="none" stroke="${farben.line}" stroke-width="1"/>`);
  return { svg: teile.join(''), ansicht: A };
}

/**
 * Lage jedes Basiseintrags in der gefundenen Gruppe (Wyckoff-Lage der Motivmitte).
 * @param {Struktur} st @param {Bestimmung | null} r
 * @returns {{ x: Vec2, zaehligkeit: number, buchstabe: string, symbol: string }[]}
 */
export function basisLagen(st, r) {
  if (!r) return [];
  const g = gruppe(r.symbol);
  return st.basis.map((e) => {
    const x = inKonventionell(r, /** @type {Vec2} */ (e.p.map(mod1)));
    const l = lage(g, x, 1e-4);
    return { x, zaehligkeit: l.zaehligkeit, buchstabe: l.buchstabe, symbol: l.symbol };
  });
}

/** Konventionelle Zelle in a, b; null, wenn sie (bis auf Vorzeichen) die gegebene ist. @param {Mat2} z */
function zellText(z) {
  /** @type {Vec2} */
  const a = [z[0][0], z[1][0]];
  /** @type {Vec2} */
  const b = [z[0][1], z[1][1]];
  /** @param {Vec2} u @param {Vec2} v */
  const gleich = (u, v) => Math.abs(Math.abs(u[0]) - v[0]) < 1e-9 && Math.abs(Math.abs(u[1]) - v[1]) < 1e-9;
  if (gleich(a, [1, 0]) && gleich(b, [0, 1])) return null;
  return `<i>a</i>′ = ${vektorText(a)}, <i>b</i>′ = ${vektorText(b)}`;
}

/**
 * Kenndaten (HTML). st: Struktur; r: Ergebnis; vorher: Symbol vor der letzten Änderung (oder
 * null); farben: Motivfarben. Knopf data-zu-eg öffnet die Gruppe im Modus „Ebenengruppen“.
 * @param {Struktur} st @param {Bestimmung | null} r @param {string | null} vorher @param {Farben} farben
 */
export function strukturHTML(st, r, vorher, farben) {
  if (!r) return '<p>Die Basis ist leer: Mit „Hinzufügen“ ein Motiv in die Struktur setzen.</p>';
  const d = r.gruppe;
  const f = motivFarben(farben);
  const lagen = basisLagen(st, r);
  const zelle = zellText(r.zelle);
  const aenderung = vorher && vorher !== r.symbol
    ? `<div class="warumbox"><strong>Geändert: ${symbolHTML(vorher)} → ${symbolHTML(r.symbol)}</strong> (Operationen je Zelle ${gruppe(vorher).ordnung} → ${r.ordnung})</div>` : '';
  const zeilen = st.basis.map((e, k) => {
    const l = lagen[k];
    return `<tr><td><i class="sw" style="background:${f[(e.farbe ?? 0) % f.length]}"></i> ${MOTIVE[e.motiv].name}${e.spiegel ? ' (gespiegelt)' : ''}</td><td>${lageHTML(MOTIVE[e.motiv].symmetrie)}</td>
      <td>${koordText(e.p.map(mod1))}</td><td>${koordText(l.x)}</td>
      <td class="num">${l.zaehligkeit} <span class="wy">${l.buchstabe}</span></td><td>${lageHTML(l.symbol)}</td></tr>`;
  }).join('');
  return `
    <div class="info-head">
      <div class="hm-big">${symbolHTML(r.symbol)}</div>
      <div class="hm-meta"><span>Ebenengruppe Nr. ${d.nr} · ${SYSTEME[d.system].name}</span><span>bestimmt aus Gitter und Basis · <button class="linkbtn" type="button" data-zu-eg="${r.symbol}">im Modus „Ebenengruppen“ ansehen</button></span></div>
    </div>
    ${aenderung}
    <dl class="facts">
      <div><dt>Bravais-Gitter</dt><dd>${BRAVAIS[d.bravais]} (${d.bravais})</dd></div>
      <div><dt>Punktgruppe</dt><dd>${symbolHTML(d.punktgruppe)} <span class="muted" title="Schoenflies-Symbol der Punktgruppe">(${schoenfliesHTML(d.punktgruppe)})</span></dd></div>
      <div><dt>Operationen je Zelle</dt><dd class="num">${r.ordnung}</dd></div>
      <div class="wide"><dt>Konventionelle Zelle nach ITA</dt><dd>${zelle ?? 'die gegebene Zelle (<i>a</i>, <i>b</i>)'}${r.primitiv > 1 ? `; die gegebene Zelle enthält ${r.primitiv} Gitterpunkte, die kleinste Zelle ist ${r.primitiv}-mal kleiner` : ''}</dd></div>
      <div class="wide"><dt>Ursprung nach ITA</dt><dd>bei ${koordText(r.ursprung)} der gegebenen Zelle</dd></div>
    </dl>
    <h3>Basis</h3>
    <div class="tabwrap"><table class="itatab"><thead><tr><th>Motiv</th><th>Eigene Symmetrie</th><th>Lage (<i>a</i>, <i>b</i>)</th><th>Lage (<i>a</i>′, <i>b</i>′)</th><th>Wyckoff-Lage</th><th>Lagesymmetrie</th></tr></thead><tbody>${zeilen}</tbody></table></div>
    <p class="note">Die Lagesymmetrie einer Motivmitte ist höchstens so hoch wie die eigene Symmetrie des Motivs. Ist sie kleiner, nutzt die Struktur nicht die ganze Symmetrie des Motivs.</p>`;
}
