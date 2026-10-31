// Rechenkern der Ebenengruppen: Operationen, Verknüpfung, Symmetrieelemente, Lagen, Auslöschungen.
//
// Eine Operation ist { R, t } mit der Matrix R (2×2, ganzzahlig) und der Translation t, beide in
// Bruchkoordinaten: x' = R·x + t. Verknüpfung „a ∘ b“ heisst: zuerst b, dann a.
// Begriffe und Konventionen nach ITA Vol. A (2006): Symmetrierichtungen Tab. 2.2.4.1, Beschreibung
// der Operationen Abschn. 11.1.2, orientierte Lagesymmetrie Abschn. 2.2.12.

import { ebenengruppe } from './ebenengruppen.js';

const EPS = 1e-9;
const nahe = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;
const ganz = (v, tol = 1e-6) => nahe(v, Math.round(v), tol);
/** Rest modulo 1 in [0, 1), Rundungsfehler an der Grenze zu 0 gezogen. */
export const mod1 = (v) => { const r = v - Math.floor(v); return r > 1 - EPS ? 0 : (r < EPS ? 0 : r); };

// ---------------------------------------------------------------------------------------------
// Schreibweise
// ---------------------------------------------------------------------------------------------

/** Zahl als Bruch mit kleinem Nenner („1/4“, „-2/3“, „0“). */
export function bruch(v) {
  for (let n = 1; n <= 12; n++) {
    const z = Math.round(v * n);
    if (nahe(v, z / n)) {
      if (z === 0) return '0';
      return n === 1 ? `${z}` : `${z}/${n}`;
    }
  }
  return String(v);
}

/** Affiner Ausdruck in einem Parameter: c·x + d, z. B. „x“, „-x“, „2x“, „x+1/2“, „1/4“. */
function affinText(c, d, v = 'x') {
  let s = '';
  if (!nahe(c, 0)) s = nahe(c, 1) ? v : nahe(c, -1) ? `-${v}` : `${bruch(c)}${v}`;
  if (!nahe(d, 0) || s === '') {
    const b = bruch(d);
    s = s === '' ? b : (b.startsWith('-') ? `${s}${b}` : `${s}+${b}`);
  }
  return s;
}

/**
 * Affinen Ausdruck in x, y lesen, z. B. „-x+y“, „2x“, „x+1/2“, „3/4“.
 * Ergebnis: [Koeffizient von x, Koeffizient von y, Konstante].
 */
function liesTerm(s) {
  const out = [0, 0, 0];
  const terme = s.replace(/\s/g, '').match(/[+-]?[^+-]+/g);
  if (!terme) throw new Error(`leerer Ausdruck: „${s}“`);
  for (const term of terme) {
    const m = term.match(/^([+-]?)(\d*(?:\/\d+)?)([xy]?)$/);
    if (!m || (m[2] === '' && m[3] === '')) throw new Error(`unbekannter Term „${term}“ in „${s}“`);
    const vz = m[1] === '-' ? -1 : 1;
    let zahl = 1;
    if (m[2] !== '') {
      const [z, n] = m[2].split('/').map(Number);
      zahl = n ? z / n : z;
    }
    if (m[3] === 'x') out[0] += vz * zahl;
    else if (m[3] === 'y') out[1] += vz * zahl;
    else out[2] += vz * zahl;
  }
  return out;
}

/** Koordinatenpaar wie in ITA („-x+1/2,y“) als affine Abbildung { R, t }. */
export function liesOp(text) {
  const teile = text.split(',');
  if (teile.length !== 2) throw new Error(`kein Koordinatenpaar: „${text}“`);
  const [z1, z2] = teile.map(liesTerm);
  return { R: [[z1[0], z1[1]], [z2[0], z2[1]]], t: [z1[2], z2[2]] };
}

/** Operation als Koordinatenpaar in ITA-Schreibweise („-x+1/2,y“). */
export function opText(op) {
  const zeile = (r, t) => {
    let s = '';
    const teil = (c, v) => {
      if (nahe(c, 0)) return;
      const k = nahe(Math.abs(c), 1) ? v : `${bruch(Math.abs(c))}${v}`;
      s += c < 0 ? `-${k}` : (s ? `+${k}` : k);
    };
    teil(r[0], 'x');
    teil(r[1], 'y');
    if (!nahe(t, 0)) { const b = bruch(t); s += b.startsWith('-') ? b : (s ? `+${b}` : b); }
    return s || '0';
  };
  return `${zeile(op.R[0], op.t[0])},${zeile(op.R[1], op.t[1])}`;
}

// ---------------------------------------------------------------------------------------------
// Operationen
// ---------------------------------------------------------------------------------------------

const matMul = (A, B) => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
];
const matVec = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
const spur = (A) => A[0][0] + A[1][1];
const matGleich = (A, B) => A.every((z, i) => z.every((v, j) => nahe(v, B[i][j])));
const IDENTITAET = [[1, 0], [0, 1]];

/** Bild des Punktes p unter der Operation. */
export const anwenden = (op, p) => { const q = matVec(op.R, p); return [q[0] + op.t[0], q[1] + op.t[1]]; };

/** Verknüpfung a ∘ b: zuerst b, dann a. */
export const verknuepfen = (a, b) => {
  const t = matVec(a.R, b.t);
  return { R: matMul(a.R, b.R), t: [t[0] + a.t[0], t[1] + a.t[1]] };
};

/** Inverse Operation. */
export function invers(op) {
  const d = det(op.R);
  const Ri = [[op.R[1][1] / d, -op.R[0][1] / d], [-op.R[1][0] / d, op.R[0][0] / d]];
  const t = matVec(Ri, op.t);
  return { R: Ri, t: [-t[0], -t[1]] };
}

/** Translation t modulo 1 (Vertreter der Nebenklasse nach den ganzzahligen Translationen). */
export const reduziert = (op) => ({ R: op.R, t: [mod1(op.t[0]), mod1(op.t[1])] });

/** Gleich bis auf eine ganzzahlige Gittertranslation. */
export const gleichModGitter = (a, b) =>
  matGleich(a.R, b.R) && ganz(a.t[0] - b.t[0]) && ganz(a.t[1] - b.t[1]);

/** Translation als Operation. */
export const translation = (v) => ({ R: IDENTITAET, t: [v[0], v[1]] });

/**
 * Alle Operationen, die aus den Erzeugenden folgen, je eine pro Nebenklasse nach den ganzzahligen
 * Translationen (Translation in [0, 1)). Zentrierungstranslationen gehören als Erzeugende dazu.
 */
export function abschluss(erzeugende) {
  const ops = [reduziert(translation([0, 0]))];
  const neu = (op) => !ops.some((o) => gleichModGitter(o, op));
  let wachstum = true;
  while (wachstum) {
    wachstum = false;
    for (const a of [...ops]) for (const e of erzeugende) {
      const c = reduziert(verknuepfen(e, a));
      if (neu(c)) { ops.push(c); wachstum = true; }
      if (ops.length > 48) throw new Error('Abschluss ist keine Ebenengruppe');
    }
  }
  return ops;
}

// ---------------------------------------------------------------------------------------------
// Die Ebenengruppe als Rechenobjekt
// ---------------------------------------------------------------------------------------------

const cache = new Map();

/**
 * Ebenengruppe mit ihren Operationen:
 *   ops        die Operationen aus ITA in derselben Reihenfolge (nur (0,0)+ Satz)
 *   zentr      Zentrierungstranslationen (immer mit [0, 0])
 *   alle       alle Nebenklassen nach den ganzzahligen Translationen: ops × zentr, t in [0, 1)
 */
export function gruppe(id) {
  const daten = ebenengruppe(id);
  if (cache.has(daten.nr)) return cache.get(daten.nr);
  const ops = daten.ops.map(liesOp);
  const zentr = daten.zentrierung ?? [[0, 0]];
  const alle = [];
  for (const z of zentr) for (const op of ops) alle.push(reduziert(verknuepfen(translation(z), op)));
  const g = { daten, ops, zentr, alle, ordnung: alle.length };
  cache.set(daten.nr, g);
  return g;
}

/** Erzeugende nach ITA („Generators selected“) als Operationen, mit Zentrierung. */
export function erzeugende(g) {
  const out = g.daten.erzeugende.map((i) => g.ops[i - 1]);
  for (const z of g.zentr) if (z[0] !== 0 || z[1] !== 0) out.push(translation(z));
  return out;
}

/** Punktgruppe: die Matrizen der Operationen ohne Translation. */
export function punktgruppe(g) {
  const mats = [];
  for (const op of g.alle) if (!mats.some((M) => matGleich(M, op.R))) mats.push(op.R);
  const dreh = Math.max(...mats.filter((M) => nahe(det(M), 1)).map(drehZaehligkeit));
  const spiegel = mats.some((M) => nahe(det(M), -1));
  let name = String(dreh);
  if (spiegel) name = dreh === 1 ? 'm' : dreh === 3 ? '3m' : `${dreh}mm`;
  return { name, ordnung: mats.length, matrizen: mats };
}

/** Zähligkeit einer Drehung aus der Spur (gilt auch in schiefwinkligen Koordinaten). */
function drehZaehligkeit(R) {
  const s = Math.round(spur(R));
  return { 2: 1, '-2': 2, '-1': 3, 0: 4, 1: 6 }[s];
}

// ---------------------------------------------------------------------------------------------
// Art und Lage einer Operation (ITA Abschn. 11.1.2)
// ---------------------------------------------------------------------------------------------

/** Kleinster ganzzahliger Vektor in Richtung v (Vorzeichen: erste von 0 verschiedene Komponente positiv). */
function primitiv(v) {
  const a = Math.round(v[0]); const b = Math.round(v[1]);
  const ggt = (x, y) => (y === 0 ? Math.abs(x) : ggt(y, x % y));
  const g = ggt(a, b) || 1;
  let d = [a / g, b / g];
  if (d[0] < 0 || (d[0] === 0 && d[1] < 0)) d = [-d[0], -d[1]];
  return d.map((x) => x + 0); // −0 vermeiden
}

/** Nicht verschwindende Spalte einer 2×2-Matrix (für Rang 1). */
function spalte(M) {
  if (!nahe(M[0][0], 0) || !nahe(M[1][0], 0)) return [M[0][0], M[1][0]];
  return [M[0][1], M[1][1]];
}

/** Löst (I − R)·p = s für eine Drehung (eindeutiger Fixpunkt). */
function fixpunkt(R, s) {
  const A = [[1 - R[0][0], -R[0][1]], [-R[1][0], 1 - R[1][1]]];
  const d = det(A);
  return [(A[1][1] * s[0] - A[0][1] * s[1]) / d, (-A[1][0] * s[0] + A[0][0] * s[1]) / d];
}

/**
 * Art der Operation:
 *   { art: '1' }                                  Identität
 *   { art: 't', t }                               Translation
 *   { art: 'dreh', n, sinn: '+'|'-'|'', punkt }   Drehung um punkt (Sinn: + dreht a nach b)
 *   { art: 'spiegel'|'gleit', richtung, normale, punkt, gleit }
 *       Spiegel- bzw. Gleitspiegellinie durch punkt in Richtung richtung (ganzzahlig),
 *       normale ganzzahlig (wie in ITA Tab. 2.2.4.1), gleit = Gleitkomponente
 */
export function art(op) {
  const { R, t } = op;
  if (nahe(det(R), 1)) {
    const n = drehZaehligkeit(R);
    if (n === 1) return nahe(t[0], 0) && nahe(t[1], 0) ? { art: '1' } : { art: 't', t: [...t] };
    const sinn = n === 2 ? '' : (R[1][0] > 0 ? '+' : '-');
    return { art: 'dreh', n, sinn, punkt: fixpunkt(R, t) };
  }
  // Spiegelung: R² = I. Richtung der Linie: Eigenvektor zu +1 (Spalte von R + I),
  // Normale: Eigenvektor zu −1 (Spalte von R − I). Gleitkomponente w = (t + R·t)/2.
  const richtung = primitiv(spalte([[R[0][0] + 1, R[0][1]], [R[1][0], R[1][1] + 1]]));
  const normale = primitiv(spalte([[R[0][0] - 1, R[0][1]], [R[1][0], R[1][1] - 1]]));
  const Rt = matVec(R, t);
  const w = [(t[0] + Rt[0]) / 2, (t[1] + Rt[1]) / 2];
  const s = [t[0] - w[0], t[1] - w[1]]; // (I − R)·p = s, s ist parallel zur Normalen
  // Punkt auf der Linie: p = λ·m mit (I − R)·m = 2m für m ∥ Normale
  const m = normale;
  const lam = Math.abs(m[0]) > Math.abs(m[1]) ? s[0] / (2 * m[0]) : s[1] / (2 * m[1]);
  const punkt = [lam * m[0], lam * m[1]];
  const gleitet = !nahe(w[0], 0) || !nahe(w[1], 0);
  return { art: gleitet ? 'gleit' : 'spiegel', richtung, normale, punkt, gleit: w };
}

/** Linie (Punkt und Richtung) in ITA-Schreibweise: „0,y“, „x,1/4“, „x,-x“, „x+1/2,-x“, „2x,x“. */
export function linieText(punkt, richtung) {
  const [d0, d1] = richtung;
  if (d0 === 0) return `${bruch(punkt[0])},y`;
  if (d1 === 0) return `x,${bruch(punkt[1])}`;
  // Punkt mit zweiter Koordinate 0 wählen, Parameter x läuft in Richtung d
  const s = -punkt[1] / d1;
  const p0 = punkt[0] + s * d0;
  return `${affinText(d0, p0)},${affinText(d1, 0)}`;
}

/** Operation wie in ITA „Symmetry operations“: „2 0,0“, „4+ 0,0“, „m 1/4,y“, „a x,0“, „g(1/2,1/2) x,x“. */
export function beschreibe(op) {
  const a = art(op);
  if (a.art === '1') return '1';
  if (a.art === 't') return `t(${bruch(a.t[0])},${bruch(a.t[1])})`;
  if (a.art === 'dreh') return `${a.n}${a.sinn} ${bruch(a.punkt[0])},${bruch(a.punkt[1])}`;
  const ort = linieText(a.punkt, a.richtung);
  if (a.art === 'spiegel') return `m ${ort}`;
  const [w0, w1] = a.gleit;
  if (nahe(w1, 0) && nahe(Math.abs(w0), 1 / 2)) return `a ${ort}`;
  if (nahe(w0, 0) && nahe(Math.abs(w1), 1 / 2)) return `b ${ort}`;
  return `g(${bruch(w0)},${bruch(w1)}) ${ort}`;
}

// ---------------------------------------------------------------------------------------------
// Symmetrieelemente in der Elementarzelle
// ---------------------------------------------------------------------------------------------

/** Kürzeste Gittertranslation (mit Zentrierung) entlang der ganzzahligen Richtung d. */
export function gitterperiode(g, d) {
  let best = 1;
  for (const z of g.zentr) {
    for (const lam of [z[0] / (d[0] || Infinity), z[1] / (d[1] || Infinity)]) {
      if (!Number.isFinite(lam) || lam <= EPS || lam >= 1 - EPS) continue;
      if (nahe(z[0], lam * d[0]) && nahe(z[1], lam * d[1])) best = Math.min(best, lam);
    }
  }
  return best;
}

/** Schnitt der Geraden p + s·d mit dem Rechteck [0, 1]² (Liang–Barsky); null, wenn keiner. */
export function clipLinie(punkt, richtung, box = [0, 0, 1, 1]) {
  let s0 = -Infinity; let s1 = Infinity;
  for (const k of [0, 1]) {
    const lo = box[k]; const hi = box[k + 2];
    if (nahe(richtung[k], 0)) {
      if (punkt[k] < lo - 1e-9 || punkt[k] > hi + 1e-9) return null;
    } else {
      let a = (lo - punkt[k]) / richtung[k]; let b = (hi - punkt[k]) / richtung[k];
      if (a > b) [a, b] = [b, a];
      s0 = Math.max(s0, a); s1 = Math.min(s1, b);
    }
  }
  if (s1 < s0 - 1e-9) return null;
  const P = (s) => [punkt[0] + s * richtung[0], punkt[1] + s * richtung[1]];
  return [P(s0), P(s1)];
}

/**
 * Alle Symmetrieelemente, die die Elementarzelle [0, 1]² treffen (Rand eingeschlossen):
 *   drehpunkte: { punkt, n }        n = höchste Zähligkeit an diesem Punkt
 *   linien:     { art: 'spiegel'|'gleit', punkt, richtung, normale, gleit, strecke }
 * Jedes Element erscheint einmal; Kopien durch ganzzahlige Translationen innerhalb der Zelle
 * (z. B. Drehpunkte an allen vier Ecken) sind eigene Einträge, wie im Diagramm der ITA.
 */
export function elemente(g) {
  const drehpunkte = [];
  const linien = [];
  for (const op of g.alle) {
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const o = { R: op.R, t: [op.t[0] + i, op.t[1] + j] };
      const a = art(o);
      if (a.art === 'dreh') {
        const p = a.punkt;
        if (p[0] < -EPS || p[0] > 1 + EPS || p[1] < -EPS || p[1] > 1 + EPS) continue;
        const da = drehpunkte.find((d) => nahe(d.punkt[0], p[0]) && nahe(d.punkt[1], p[1]));
        if (da) da.n = Math.max(da.n, a.n);
        else drehpunkte.push({ punkt: [p[0] + 0, p[1] + 0], n: a.n });
      } else if (a.art === 'spiegel' || a.art === 'gleit') {
        const strecke = clipLinie(a.punkt, a.richtung);
        if (!strecke || (nahe(strecke[0][0], strecke[1][0]) && nahe(strecke[0][1], strecke[1][1]))) continue;
        // Gleitkomponente modulo der Gitterperiode entlang der Linie
        const d = a.richtung;
        const per = gitterperiode(g, d);
        const mu = (Math.abs(d[0]) > Math.abs(d[1]) ? a.gleit[0] / d[0] : a.gleit[1] / d[1]) / per;
        const rest = mu - Math.round(mu);
        const istSpiegel = nahe(rest, 0);
        const gleit = istSpiegel ? [0, 0] : [d[0] * per / 2, d[1] * per / 2];
        // gleiche Linie? (Normale gleich, Punkt auf der Linie)
        const e = [-d[1], d[0]];
        const c = e[0] * a.punkt[0] + e[1] * a.punkt[1];
        const da = linien.find((l) => l.richtung[0] === d[0] && l.richtung[1] === d[1]
          && nahe(e[0] * l.punkt[0] + e[1] * l.punkt[1], c));
        if (da) {
          if (istSpiegel) da.spiegel = true; else da.gleitet = gleit;
        } else {
          linien.push({ punkt: a.punkt, richtung: d, normale: a.normale, strecke,
            spiegel: istSpiegel, gleitet: istSpiegel ? null : gleit });
        }
      }
    }
  }
  // Art der Linie: Spiegellinie hat Vorrang (eine Gleitung auf derselben Linie folgt dann aus
  // einer Gittertranslation und wird nicht eigens gezeichnet)
  for (const l of linien) {
    // Bezugspunkt: Mitte des Abschnitts in der Zelle
    l.punkt = [(l.strecke[0][0] + l.strecke[1][0]) / 2, (l.strecke[0][1] + l.strecke[1][1]) / 2];
    l.art = l.spiegel ? 'spiegel' : 'gleit';
    l.gleit = l.spiegel ? [0, 0] : l.gleitet;
    delete l.spiegel; delete l.gleitet;
  }
  return { drehpunkte, linien };
}

// ---------------------------------------------------------------------------------------------
// Lagen: Lagesymmetrie, Zähligkeit, Wyckoff-Lage (ITA Abschn. 2.2.11–2.2.12)
// ---------------------------------------------------------------------------------------------

/**
 * Symmetrierichtungen der Gitter (ITA Tab. 2.2.4.1): je Position im Symbol die Menge
 * gleichwertiger Richtungen. Position 1 ist der Drehpunkt; Spiegellinien gehören zur Position,
 * in deren Menge ihre Normale liegt.
 */
export const SYMMETRIERICHTUNGEN = {
  schiefwinklig: [],
  rechteckig: [[[1, 0]], [[0, 1]]],
  quadratisch: [[[1, 0], [0, 1]], [[1, -1], [1, 1]]],
  hexagonal: [[[1, 0], [0, 1], [-1, -1]], [[1, -1], [1, 2], [-2, -1]]],
};

const parallel = (u, v) => nahe(u[0] * v[1] - u[1] * v[0], 0);

/**
 * Toleranz für das Einrasten auf eine spezielle Lage (in Bruchkoordinaten). Ein Punkt, der
 * näher an einer speziellen Lage liegt, gilt als auf ihr; lage() rastet ihn dorthin ein.
 */
export const TOL_LAGE = 1e-6;
/** Toleranz für exakte Vergleiche an bereits eingerasteten Punkten (nur Rundungsfehler). */
const TOL_EXAKT = 1e-9;

/** Abstand zweier Punkte modulo Gitter (komponentenweise, in Bruchkoordinaten). */
const abstandModGitter = (p, q) => {
  const d0 = p[0] - q[0]; const d1 = p[1] - q[1];
  return Math.max(Math.abs(d0 - Math.round(d0)), Math.abs(d1 - Math.round(d1)));
};

/**
 * Operationen der Gruppe, die p festhalten (mit passender ganzzahliger Translation).
 * Gedacht für exakte Punkte; einen gezogenen oder gerundeten Punkt erst mit lage() einrasten,
 * sonst bilden die gefundenen Operationen nicht sicher eine Untergruppe.
 */
export function stabilisator(g, p, tol = TOL_EXAKT) {
  const out = [];
  for (const op of g.alle) {
    const q = anwenden(op, p);
    if (abstandModGitter(q, p) >= tol) continue;
    out.push({ R: op.R, t: [op.t[0] - Math.round(q[0] - p[0]), op.t[1] - Math.round(q[1] - p[1])] });
  }
  return out;
}

/**
 * Orientiertes Symbol der Lagesymmetrie (ITA Abschn. 2.2.12): Drehung an Position 1, dann je
 * Menge von Symmetrierichtungen ein Zeichen; „.“ wenn die Menge nichts beiträgt. Zerfällt eine
 * Menge unter der Lagesymmetrie, steht ein Zeichen je Bahn (z. B. „2mm.“ in p4mm).
 */
export function lagesymbol(g, stab) {
  if (stab.length === 1) return '1';
  const system = g.daten.system;
  const drehungen = stab.filter((o) => nahe(det(o.R), 1));
  const n = Math.max(...drehungen.map((o) => drehZaehligkeit(o.R)));
  if (system === 'schiefwinklig') return String(n);
  const normalen = stab.filter((o) => nahe(det(o.R), -1)).map((o) => art(o).normale);
  let s = n > 1 ? String(n) : '.';
  for (const menge of SYMMETRIERICHTUNGEN[system]) {
    const mitSpiegel = menge.filter((r) => normalen.some((nv) => parallel(nv, r)));
    if (mitSpiegel.length === 0) { s += '.'; continue; }
    // Bahnen der Richtungen mit Spiegel unter den Drehungen der Lagesymmetrie
    const bahnen = [];
    for (const r of mitSpiegel) {
      if (bahnen.some((b) => drehungen.some((o) => parallel(matVec(o.R, b), r)))) continue;
      bahnen.push(r);
    }
    s += 'm'.repeat(bahnen.length);
  }
  return s;
}

/** Bahn von p: alle äquivalenten Punkte in [0, 1)², ohne Doppelte (modulo Gitter verglichen). */
export function bahn(g, p, tol = TOL_EXAKT) {
  const out = [];
  for (const op of g.alle) {
    const q = anwenden(op, p).map(mod1);
    if (!out.some((r) => abstandModGitter(r, q) < tol)) out.push(q);
  }
  return out;
}

/** Ausdruck einer Wyckoff-Koordinate („x,1/2“, „-x+1/2,x“) als { M (2×2), c }. */
function liesKoord(text) {
  const op = liesOp(text);
  return { M: op.R, c: op.t };
}

/**
 * Nächster Punkt der Menge { M·q + c } modulo Gitter zu p (p in [0, 1)²), wenn er näher als tol
 * liegt; sonst null. Ergebnis: der eingerastete Punkt in [0, 1)².
 */
function einrasten(M, c, p, tol) {
  const spalten = [0, 1].filter((k) => !nahe(M[0][k], 0) || !nahe(M[1][k], 0));
  // c liegt in ITA in [0, 1), p in [0, 1): Gitterverschiebungen −2 … 2 decken alle Fälle ab
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const v = [p[0] - c[0] - i, p[1] - c[1] - j];
    let q = [0, 0];
    if (spalten.length === 1) {
      const k = spalten[0]; const m = [M[0][k], M[1][k]];
      q[k] = (m[0] * v[0] + m[1] * v[1]) / (m[0] * m[0] + m[1] * m[1]);
    } else if (spalten.length === 2) {
      const d = det(M);
      if (nahe(d, 0)) continue;
      q = [(M[1][1] * v[0] - M[0][1] * v[1]) / d, (-M[1][0] * v[0] + M[0][0] * v[1]) / d];
    }
    const r = matVec(M, q);
    if (Math.abs(r[0] - v[0]) < tol && Math.abs(r[1] - v[1]) < tol) {
      return [mod1(r[0] + c[0]), mod1(r[1] + c[1])];
    }
  }
  return null;
}

/** Zahl der freien Parameter eines Koordinatenausdrucks. */
const freiheitsgrade = (text) => {
  const { M } = liesKoord(text);
  const r = [0, 1].filter((k) => !nahe(M[0][k], 0) || !nahe(M[1][k], 0)).length;
  return r === 2 && nahe(det(M), 0) ? 1 : r;
};

/**
 * Lage des Punktes p. Der Punkt wird modulo Gitter reduziert und auf die speziellste
 * Wyckoff-Lage eingerastet, die näher als tol liegt (Punkte vor Linien vor der allgemeinen
 * Lage). Stabilisator, Lagesymmetrie und Zähligkeit gelten für den eingerasteten Punkt; damit
 * passen sie immer zur gefundenen Wyckoff-Lage.
 * Ergebnis: { punkt (eingerastet, in [0, 1)²), wyckoff, buchstabe, zaehligkeit, symbol,
 *             freiheitsgrade, allgemein }
 */
export function lage(g, p, tol = TOL_LAGE) {
  const p0 = p.map(mod1);
  const kandidaten = [...g.daten.wyckoff].sort((u, v) => freiheitsgrade(u.koord[0]) - freiheitsgrade(v.koord[0]));
  for (const w of kandidaten) {
    for (const z of g.zentr) for (const k of w.koord) {
      const { M, c } = liesKoord(k);
      const punkt = einrasten(M, [c[0] + z[0], c[1] + z[1]], p0, tol);
      if (!punkt) continue;
      const stab = stabilisator(g, punkt);
      return {
        punkt, wyckoff: w, buchstabe: w.b, zaehligkeit: g.ordnung / stab.length, symbol: lagesymbol(g, stab),
        freiheitsgrade: freiheitsgrade(w.koord[0]), allgemein: stab.length === 1,
      };
    }
  }
  throw new Error(`keine Wyckoff-Lage für (${p}) in ${g.daten.symbol}`);
}

/**
 * Punkt auf der Wyckoff-Lage mit dem Buchstaben b. Die freien Parameter kommen möglichst aus p
 * (so bleibt das Objekt in der Nähe); liegt das Ergebnis dann auf einer spezielleren Lage
 * (z. B. „x,x“ von (0, 0) aus), werden allgemeine Werte genommen.
 */
export function punktAufLage(g, b, p) {
  const w = g.daten.wyckoff.find((x) => x.b === b);
  if (!w) throw new Error(`keine Wyckoff-Lage ${b} in ${g.daten.symbol}`);
  const o = liesOp(w.koord[0]);
  const versuche = [p.map(mod1), [0.137, 0.291], [0.213, 0.389], [0.371, 0.173], [0.083, 0.447]];
  for (const q of versuche) {
    const r = anwenden(o, q).map(mod1);
    if (lage(g, r).buchstabe === b) return r;
  }
  throw new Error(`kein Punkt auf ${b} in ${g.daten.symbol} gefunden`);
}

// ---------------------------------------------------------------------------------------------
// Auslöschungen
// ---------------------------------------------------------------------------------------------

/** Strukturfaktor (komplex) einer Punktmenge mit gleichen Streuern für den Reflex hk. */
export function strukturfaktor(punkte, h, k) {
  let re = 0; let im = 0;
  for (const [x, y] of punkte) { const phi = 2 * Math.PI * (h * x + k * y); re += Math.cos(phi); im += Math.sin(phi); }
  return [re, im];
}

/** Bedingungen [Klasse, Bedingung] auf hk anwenden: true, wenn der Reflex ausgelöscht ist. */
export function verletzt(bedingungen, h, k) {
  const gerade = (v) => v % 2 === 0;
  for (const [klasse, bed] of bedingungen) {
    if (klasse === 'h0' && k !== 0) continue;
    if (klasse === '0k' && h !== 0) continue;
    const wert = { 'h=2n': h, 'k=2n': k, 'h+k=2n': h + k }[bed];
    if (wert === undefined) throw new Error(`unbekannte Bedingung: ${bed}`);
    if (!gerade(wert)) return true;
  }
  return false;
}
