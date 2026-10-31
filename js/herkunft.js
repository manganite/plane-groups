// Herkunft der Symmetrieelemente: Welche Elemente folgen aus den Erzeugenden, und aus welchen
// zwei Operationen entsteht jedes? Grundlage für „Aufbau aus Erzeugenden“ und „Warum ist das da?“.
//
// Gesucht wird in Schritten (Breitensuche): Schritt 0 ist die Identität; in jedem Schritt wird
// jede bisher gefundene Operation B mit einer Erzeugenden A verknüpft, C = A ∘ B (zuerst B, dann
// A). Erzeugende sind die „Generators selected“ der ITA (ohne Identität) und die
// Gittertranslationen; eine Translation um einen beliebigen Gittervektor (bei c-Gruppen mit
// Zentrierung) zählt als ein Schritt. In jedem Schritt kommen die Translationen vor den übrigen
// Erzeugenden. So lautet eine Zerlegung, wo möglich, „Translation ∘ Element“, wie in den Regeln
// der Lehrbücher (Spiegelung + Translation = Gleitspiegelung, Drehung + Translation = Drehung
// um einen verschobenen Punkt).
//
// Für den schrittweisen Aufbau zählen Elemente, die durch eine Gittertranslation ineinander
// übergehen, als eine Klasse; ihr Schritt ist der kleinste in der Klasse.

import {
  art, verknuepfen, translation, erzeugende, bruch, gitterperiode, mod1,
} from './symmetrie.js';

/** Bereich der Translationsanteile, in dem gesucht wird (deckt 2 × 2 Zellen mit Rand ab). */
const SCHRANKE = [-4, 5];
const EPS = 1e-9;
const nahe = (a, b) => Math.abs(a - b) < 1e-7;
const b0 = (v) => bruch(Math.abs(v) < EPS ? 0 : v);

/**
 * Schlüssel einer Operation (exakt, ohne Reduktion modulo Gitter). Translationsanteile der
 * Ebenengruppen sind Vielfache von 1/2 (Erzeugende, Zentrierung), also ganzzahlig in 1/12.
 */
const opSchluessel = (op) => `${op.R[0][0]},${op.R[0][1]},${op.R[1][0]},${op.R[1][1]},${Math.round(op.t[0] * 12)},${Math.round(op.t[1] * 12)}`;

/** Kanonischer Punkt einer Linie: Schnitt mit y = 0, bei Linien ∥ a (d = [1, 0]) der mit x = 0. */
function kanonisch(punkt, d) {
  if (d[1] !== 0) { const s = -punkt[1] / d[1]; return [punkt[0] + s * d[0] + 0, 0]; }
  return [0, punkt[1] + 0];
}

const istTranslation = (op) => op.R[0][0] === 1 && op.R[1][1] === 1 && op.R[0][1] === 0 && op.R[1][0] === 0;

/**
 * Element einer Operation (null für Identität und Translation):
 *   { typ: 'dreh', n, punkt, sinn } oder
 *   { typ: 'spiegel'|'gleit', punkt (kanonisch), richtung, normale, gleit (reduziert), gleitRoh }
 */
export function elementVonOp(g, op) {
  const a = art(op);
  if (a.art === 'dreh') return { typ: 'dreh', n: a.n, punkt: a.punkt, sinn: a.sinn };
  if (a.art !== 'spiegel' && a.art !== 'gleit') return null;
  // Gleitkomponente modulo der Gitterperiode entlang der Linie (wie in elemente())
  const d = a.richtung;
  const per = gitterperiode(g, d);
  const mu = (Math.abs(d[0]) > Math.abs(d[1]) ? a.gleit[0] / d[0] : a.gleit[1] / d[1]) / per;
  const istSpiegel = nahe(mu - Math.round(mu), 0);
  return {
    typ: istSpiegel ? 'spiegel' : 'gleit', punkt: kanonisch(a.punkt, d), richtung: d, normale: a.normale,
    gleit: istSpiegel ? [0, 0] : [(d[0] * per) / 2, (d[1] * per) / 2], gleitRoh: a.gleit,
  };
}

const istDreh = (el) => el.typ === 'dreh' || (el.n !== undefined && !el.richtung);
const linienArt = (el) => (el.typ ?? el.art) === 'spiegel' ? 'm' : 'g';

/** Schlüssel eines Elements, auch für die Link-Adresse: „4;1/2,1/2“ oder „m;1/4,0;0,1“. */
export function elementSchluessel(el) {
  if (istDreh(el)) return `${el.n};${b0(el.punkt[0])},${b0(el.punkt[1])}`;
  const p = kanonisch(el.punkt, el.richtung);
  return `${linienArt(el)};${b0(p[0])},${b0(p[1])};${el.richtung[0]},${el.richtung[1]}`;
}

/**
 * Schlüssel der Klasse eines Elements modulo Gittertranslationen (mit Zentrierung):
 * Drehpunkte modulo Gitter, Linien über ihren Abstand e·p modulo der Periode der Schar.
 */
export function klassenSchluessel(g, el) {
  if (istDreh(el)) {
    const kand = g.zentr.map((z) => [mod1(el.punkt[0] + z[0]), mod1(el.punkt[1] + z[1])]);
    kand.sort((u, v) => u[0] - v[0] || u[1] - v[1]);
    return `${el.n};${b0(kand[0][0])},${b0(kand[0][1])}`;
  }
  const d = el.richtung; const e = [-d[1], d[0]];
  // Verschiebungen von e·p durch Gittervektoren: ganze Zahlen, mit Zentrierung evtl. Halbe
  let per = 1;
  for (const z of g.zentr) { const s = mod1(e[0] * z[0] + e[1] * z[1]); if (s > EPS) per = Math.min(per, s); }
  const c = e[0] * el.punkt[0] + e[1] * el.punkt[1];
  const r = c / per - Math.floor(c / per + EPS);
  return `${linienArt(el)};${d[0]},${d[1]};${b0(Math.abs(r) < 1e-7 ? 0 : r * per)}`;
}

const cache = new Map();

/**
 * Herkunft aller Operationen und Elemente der Gruppe g.
 * Ergebnis: {
 *   knoten:   Map Operationsschlüssel → { op, tiefe, a, b (Schlüssel) },
 *   elemente: Map Elementschlüssel → { op, tiefe, schluessel, element },
 *   klassen:  Map Klassenschlüssel → kleinste Tiefe,
 *   maxTiefe: grösste Tiefe einer Klasse
 * }
 */
export function herkunft(g) {
  if (cache.has(g.daten.nr)) return cache.get(g.daten.nr);
  const punktErz = erzeugende(g).filter((op) => !istTranslation(op));
  // Gittertranslationen als eine Erzeugende je Vektor, kurze zuerst
  const transErz = [];
  const r = SCHRANKE[1] - SCHRANKE[0];
  for (const z of g.zentr) for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
    if (!i && !j && !z[0] && !z[1]) continue;
    transErz.push(translation([i + z[0], j + z[1]]));
  }
  transErz.sort((u, v) => Math.hypot(...u.t) - Math.hypot(...v.t) || u.t[0] - v.t[0] || u.t[1] - v.t[1]);
  const imBereich = (op) => op.t.every((v) => v >= SCHRANKE[0] - EPS && v <= SCHRANKE[1] + EPS);

  const id = translation([0, 0]);
  const knoten = new Map([[opSchluessel(id), { op: id, tiefe: 0, a: null, b: null }]]);
  let front = [opSchluessel(id)];
  for (let tiefe = 1; front.length; tiefe++) {
    const neu = [];
    for (const erz of [transErz, punktErz]) {
      for (const k of front) {
        const B = knoten.get(k).op;
        // Translation nach einer Translation bringt nichts Neues (eine Translation genügt)
        if (erz === transErz && istTranslation(B) && tiefe > 1) continue;
        for (const A of erz) {
          const C = verknuepfen(A, B);
          if (!imBereich(C)) continue;
          const kc = opSchluessel(C);
          if (knoten.has(kc)) continue;
          knoten.set(kc, { op: C, tiefe, a: A, b: k });
          neu.push(kc);
        }
      }
    }
    front = neu;
  }

  // Elemente: je Element die Operation mit der kleinsten Tiefe; bei gleicher Tiefe die ohne
  // zusätzliche Translation entlang der Linie (kleinste Gleitkomponente)
  const elemente = new Map();
  const klassen = new Map();
  for (const [k, kn] of knoten) {
    const el = elementVonOp(g, kn.op);
    if (!el) continue;
    const s = elementSchluessel(el);
    const rest = el.gleitRoh ? Math.hypot(el.gleitRoh[0] - el.gleit[0], el.gleitRoh[1] - el.gleit[1]) : 0;
    const alt = elemente.get(s);
    if (!alt || kn.tiefe < alt.tiefe || (kn.tiefe === alt.tiefe && rest < alt.rest - EPS)) {
      elemente.set(s, { op: kn.op, tiefe: kn.tiefe, schluessel: k, element: el, rest });
    }
    const ks = klassenSchluessel(g, el);
    klassen.set(ks, Math.min(klassen.get(ks) ?? Infinity, kn.tiefe));
  }
  const h = { knoten, elemente, klassen, maxTiefe: Math.max(0, ...klassen.values()) };
  cache.set(g.daten.nr, h);
  return h;
}

/**
 * Herleitung einer Operation aus den Erzeugenden: Liste der Schritte { c, a, b }, beginnend mit
 * der gesuchten Operation c = a ∘ b, dann b = a' ∘ b' usw. bis zu einer Erzeugenden (b = 1).
 */
export function herleitung(g, opKey) {
  const { knoten } = herkunft(g);
  const out = [];
  let k = opKey;
  while (k) {
    const kn = knoten.get(k);
    if (!kn || kn.tiefe === 0) break;
    const b = knoten.get(kn.b);
    out.push({ c: kn.op, a: kn.a, b: b.op, aTranslation: istTranslation(kn.a) });
    k = b.tiefe === 0 ? null : kn.b;
  }
  return out;
}

/** Herkunft eines gezeichneten Elements (aus elemente() bzw. elementeImBereich()). */
export function herkunftVon(g, el) {
  return herkunft(g).elemente.get(elementSchluessel(el));
}

/** Schritt eines gezeichneten Elements im Aufbau (Klasse modulo Gitter). */
export function schrittVon(g, el) {
  return herkunft(g).klassen.get(klassenSchluessel(g, el));
}
