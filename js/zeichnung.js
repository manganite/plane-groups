// Zeichnungen der Ebenengruppen als SVG: Symmetriegerüst (Tafel A) und Muster (Tafel B).
// Ohne DOM, damit sich alles in Node testen lässt; die Farben kommen als Objekt herein.
//
// Achsen wie in ITA Vol. A (2006), Abschn. 2.2.6.1 und Part 6: b nach rechts, a im Winkel γ
// dazu nach unten (bei γ = 90° senkrecht nach unten), Ursprung oben links. Bildschirm-
// koordinaten: x nach rechts, y nach unten. Symbole der Symmetrieelemente wie in ITA:
// Drehpunkte als Linse (2), Dreieck (3), Raute (4), Sechseck (6); Spiegellinien durchgezogen,
// Gleitspiegellinien gestrichelt.

import { gruppe as gruppeVon, elemente, anwenden, mod1, clipLinie, verknuepfen, invers, translation } from './symmetrie.js';
import { SYMMETRIERICHTUNGEN } from './ebenengruppen.js';
import { herkunft, herleitung, klassenSchluessel, schrittVon, elementVonOp, vorbild } from './herkunft.js';
import { bedingungen, bereich } from './asymmetrie.js';

/** @import { Vec2, Mat2, Grad, Kartesisch } from '../lib/common/js/typen.js' */
/** @import { Gruppe, Op, Drehpunkt, Linie } from './symmetrie.js' */
/** @import { System } from './ebenengruppen.js' */
/** @import { Element as OpElement } from './herkunft.js' */
/** @import { Zustand } from './zustand.js' */
/** Gitter: b/a und Winkel γ zwischen a und b. @typedef {{ ba: number, gamma: Grad }} Gitter */
/** Winkel in Grad (Kennzeichnung für die Typprüfung, gibt w unverändert zurück). @param {number} w */
export const grad = (w) => /** @type {Grad} */ (w);
/** Gitter mit γ in Grad. @param {number} ba @param {number} gamma @returns {Gitter} */
export const gitter = (ba, gamma) => ({ ba, gamma: grad(gamma) });
/**
 * Farben aus base.css (Werte der Variablen; dir: die drei Blickrichtungen).
 * fc: die Formfarben --fc0 … --fc5 (nur wo gebraucht, z. B. im Skript).
 * @typedef {{ paper: string, ink: string, muted: string, line: string, accent: string, accent2: string, upper: string, crystal: string, dir: string[], fc3: string, fc4: string, fc?: string[] }} Farben
 */
/** Rechteck x0, y0, x1, y1. @typedef {[number, number, number, number]} Box */
/** Drehpunkt in Tafel A, im Aufbau mit den sichtbaren Zähligkeiten und neu (gerade hinzugekommen). @typedef {Drehpunkt & { ordnungen?: number[], neu?: boolean }} SichtbarerDrehpunkt */
/** Linie in Tafel A, im Aufbau mit neu (gerade hinzugekommen). @typedef {Linie & { neu?: boolean }} SichtbareLinie */
/** Gezeigte Symmetrieelemente. @typedef {{ drehpunkte: SichtbarerDrehpunkt[], linien: SichtbareLinie[] }} Elementauswahl */
/** Bild des Objekts: Stelle, Matrix, eigentlich (Drehung/Translation), Index der Operation in g.alle. @typedef {{ punkt: Vec2, R: Mat2, eigentlich: boolean, index: number }} Bild */
/** Weg des Fähnchens unter einer Operation (weg()). @typedef {{ teile: Vec2[][], zwischen: { p: Vec2, op: Op } | null }} Weg */
/** Operation der ITA-Liste: nr (Nummer in der Liste), zentr (Zentrierungsvektor oder null). @typedef {{ op: Op, nr: number, zentr: Vec2 | null }} ItaOperation */
/** Bild im Schritt für Schritt (schrittDaten()). @typedef {ItaOperation & { punkt: Vec2, index: number, gleich: number | null, gitter: boolean }} SchrittBild */
/**
 * Erklärung eines Elements als C = A ∘ B (erklaerungsDaten()).
 * @typedef {{ art?: undefined, schluessel: string, element: OpElement, tiefe: number, C: Op, A: Op, B: Op, kette: { c: Op, a: Op, b: Op, aTranslation: boolean }[], start: Vec2, wege: Record<string, Weg>, erzeugende: boolean }} ErklaerungAB
 */
/**
 * Erklärung einer Gitterkopie C = t ∘ V ∘ t⁻¹ (kopieDaten()).
 * @typedef {{ art: 'kopie', schluessel: string, element: OpElement, tiefe: number, C: Op, V: Op, t: Vec2, T: Op, vorbild: { schluessel: string, element: OpElement }, kette: never[], start: Vec2, wege: Record<string, Weg>, erzeugende: false }} ErklaerungKopie
 */
/** @typedef {ErklaerungAB | ErklaerungKopie} Erklaerung */
/** Gittervektoren in Bildschirmrichtungen (a = 1). @typedef {{ a: Kartesisch<Vec2>, b: Kartesisch<Vec2> }} Metrik */
/**
 * Ansicht: Massstab s, Bildgrösse; zuBild: Bruchkoordinaten → Bildpunkt, vonBild umgekehrt.
 * @typedef {{ s: number, groesse: number, zuBild: (p: Vec2) => Vec2, vonBild: (q: Vec2) => Vec2 }} Ansicht
 */

// ---------------------------------------------------------------------------------------------
// Metrik und Ansicht
// ---------------------------------------------------------------------------------------------

/** Gittervektoren in Bildschirmrichtungen (a = 1): a = (cos γ, sin γ), b = (b/a, 0). @param {Gitter} gitter @returns {Metrik} */
export function metrik({ ba, gamma }) {
  const g = (gamma * Math.PI) / 180;
  return { a: /** @type {Kartesisch<Vec2>} */ ([Math.cos(g), Math.sin(g)]), b: /** @type {Kartesisch<Vec2>} */ ([ba, 0]) };
}

/** Bruchkoordinaten → kartesisch (Bildschirmrichtungen, ohne Massstab). @type {(M: Metrik, p: Vec2) => Kartesisch<Vec2>} */
export const kart = (M, p) => /** @type {Kartesisch<Vec2>} */ ([p[0] * M.a[0] + p[1] * M.b[0], p[0] * M.a[1] + p[1] * M.b[1]]);

/** Kartesisch → Bruchkoordinaten. @param {Metrik} M @param {Kartesisch<Vec2>} c @returns {Vec2} */
export function bruchVon(M, c) {
  const d = M.a[0] * M.b[1] - M.b[0] * M.a[1];
  return [(c[0] * M.b[1] - M.b[0] * c[1]) / d, (M.a[0] * c[1] - c[0] * M.a[1]) / d];
}

/** Matrix R (Bruchkoordinaten) als kartesische Matrix C·R·C⁻¹. @param {Metrik} M @param {Mat2} R @returns {Mat2} */
export function kartMatrix(M, R) {
  /** @type {Mat2} */
  const C = [[M.a[0], M.b[0]], [M.a[1], M.b[1]]];
  const d = C[0][0] * C[1][1] - C[0][1] * C[1][0];
  /** @type {Mat2} */
  const Ci = [[C[1][1] / d, -C[0][1] / d], [-C[1][0] / d, C[0][0] / d]];
  /** @type {(A: Mat2, B: Mat2) => Mat2} */
  const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  return mul(mul(C, R), Ci);
}

/**
 * Ansicht: bildet das kartesische Rechteck [x0, y0, x1, y1] zentriert in ein quadratisches
 * Bild der Grösse groesse ab (Rand rand). zuBild(p) und vonBild(s) rechnen zwischen
 * Bruchkoordinaten und Bildpunkten.
 * @param {Metrik} M
 * @param {[number, number, number, number]} box
 * @param {number} [groesse]
 * @param {number} [rand]
 * @returns {Ansicht}
 */
export function ansicht(M, box, groesse = 520, rand = 46) {
  const [x0, y0, x1, y1] = box;
  const s = (groesse - 2 * rand) / Math.max(x1 - x0, y1 - y0);
  const ox = (groesse - s * (x1 - x0)) / 2 - s * x0;
  const oy = (groesse - s * (y1 - y0)) / 2 - s * y0;
  return {
    s, groesse,
    zuBild: (p) => { const c = kart(M, p); return [ox + s * c[0], oy + s * c[1]]; },
    vonBild: (q) => bruchVon(M, /** @type {Kartesisch<Vec2>} */ ([(q[0] - ox) / s, (q[1] - oy) / s])),
  };
}

/** Kartesisches Rechteck um die Zellen [0, n]². @param {Metrik} M @param {number} n @param {number} [r] @returns {Box} */
function zellBox(M, n, r = 0) {
  const ecken = /** @type {Vec2[]} */ ([[-r, -r], [n + r, -r], [-r, n + r], [n + r, n + r]]).map((p) => kart(M, p));
  const xs = ecken.map((c) => c[0]); const ys = ecken.map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// ---------------------------------------------------------------------------------------------
// Symmetrieelemente
// ---------------------------------------------------------------------------------------------

/** @param {number} v */
export const f2 = (v) => (Math.round(v * 100) / 100).toString();
/** @param {Vec2} q */
export const pt = (q) => `${f2(q[0])},${f2(q[1])}`;

/**
 * Position im Hermann-Mauguin-Symbol (1: Drehpunkt, 2: zweite, 3: dritte Stelle) einer
 * (Gleit-)Spiegellinie mit der Normale n (ITA Tab. 2.2.4.1).
 * @param {System} system
 * @param {Vec2} normale
 */
export function blickrichtung(system, normale) {
  const klassen = SYMMETRIERICHTUNGEN[system] ?? [];
  const k = klassen.findIndex((menge) => menge.some((r) => Math.abs(r[0] * normale[1] - r[1] * normale[0]) < 1e-9));
  if (k < 0) throw new Error(`Normale ${normale} gehört zu keiner Symmetrierichtung (${system})`);
  return k + 2;
}

/** Symmetrieelemente der Zellen [0, n]², Doppelte an gemeinsamen Kanten entfernt. @param {Gruppe} g @param {number} n @returns {{ drehpunkte: Drehpunkt[], linien: Linie[] }} */
export function elementeImBereich(g, n) {
  const e = elemente(g);
  /** @type {Drehpunkt[]} */
  const dreh = [];
  /** @type {Linie[]} */
  const linien = [];
  const schluessel = new Set();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    for (const d of e.drehpunkte) {
      /** @type {Vec2} */
      const p = [d.punkt[0] + i, d.punkt[1] + j];
      const k = `d${p.map((v) => v.toFixed(6))}`;
      if (!schluessel.has(k)) { schluessel.add(k); dreh.push({ ...d, punkt: p }); }
    }
    for (const l of e.linien) {
      const s = /** @type {[Vec2, Vec2]} */ (l.strecke.map((q) => [q[0] + i, q[1] + j]));
      const k = `l${[...s].sort((u, v) => u[0] - v[0] || u[1] - v[1]).flat().map((v) => v.toFixed(6))}`;
      if (!schluessel.has(k)) { schluessel.add(k); linien.push({ ...l, strecke: s, punkt: [l.punkt[0] + i, l.punkt[1] + j] }); }
    }
  }
  return { drehpunkte: dreh, linien };
}

/**
 * SVG eines Drehpunkt-Symbols (ITA) der Zähligkeit n an der Bildstelle q, Grösse k (1 = normal), Randstärke s (1 = normal).
 * @param {number} n @param {Vec2} q @param {string} farbe @param {string} rand @param {number} [k] @param {number} [s]
 */
export function drehSymbol(n, q, farbe, rand, k = 1, s = 1) {
  const [x, y] = q;
  const stil = `fill="${farbe}" stroke="${rand}" stroke-width="${f2(1.2 * s)}"`;
  if (n === 2) return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(4.6 * k)}" ry="${f2(8.2 * k)}" ${stil}/>`;
  /** @param {number} r @param {number} m @param {number} phase */
  const poly = (r, m, phase) => Array.from({ length: m }, (_, i) => {
    const w = phase + (2 * Math.PI * i) / m;
    return `${f2(x + r * k * Math.cos(w))},${f2(y + r * k * Math.sin(w))}`;
  }).join(' ');
  if (n === 3) return `<polygon points="${poly(9, 3, -Math.PI / 2)}" ${stil}/>`;
  if (n === 4) return `<polygon points="${poly(8.5, 4, 0)}" ${stil}/>`;
  return `<polygon points="${poly(8.5, 6, 0)}" ${stil}/>`;
}

/**
 * Die in Tafel A sichtbaren Elemente der Zellen [0, n]²: ohne Aufbau alle, sonst die bis zum
 * Schritt aufbau; ein Drehpunkt trägt dann die grösste sichtbare Zähligkeit (Auswahl und
 * Erklärung gelten dieser, z. B. in p6 Schritt 1 der 3-zählige Punkt am Ursprung).
 * @param {Gruppe} g @param {number} n @param {number} aufbau
 * @returns {Elementauswahl}
 */
export function sichtbar(g, n, aufbau) {
  if (!(aufbau > 0)) return elementeImBereich(g, n);
  const a = aufbauElemente(g, n, aufbau);
  return { drehpunkte: a.drehpunkte.map((d) => ({ ...d, n: Math.max(...d.ordnungen) })), linien: a.linien };
}

/**
 * SVG einer Linie (Spiegel- oder Gleitspiegellinie) zwischen zwei Bildpunkten; k vergrössert Strich und Strichelung.
 * @param {Vec2} p @param {Vec2} q @param {string} art @param {string} farbe @param {number | null} [breite] @param {number} [k]
 */
function linieSVG(p, q, art, farbe, breite = null, k = 1) {
  const b = f2((breite ?? (art === 'spiegel' ? 2.8 : 2)) * k);
  return art === 'spiegel'
    ? `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farbe}" stroke-width="${b}" stroke-linecap="round"/>`
    : `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farbe}" stroke-width="${b}" stroke-dasharray="${f2(8 * k)} ${f2(5 * k)}"/>`;
}

/**
 * SVG der Symmetrieelemente (Linien zuerst, Drehpunkte darüber). Ein Element kann markiert
 * sein: neu: true (im Aufbau gerade hinzugekommen); Drehpunkte mit ordnungen: [3, 2] zeigen
 * mehrere Symbole an derselben Stelle. gedimmt: alles blasser (bei einer Erklärung). k: Grösse
 * der Symbole und Linien (1 in der App; das Skript vergrössert sie in kleinen Abbildungen).
 * @param {Gruppe} g
 * @param {Elementauswahl} el
 * @param {Ansicht} A
 * @param {Farben} farben
 * @param {boolean | undefined} mitFarben
 * @param {{ gedimmt?: boolean, k?: number }} [optionen]
 * @returns {string}
 */
export function elementeSVG(g, el, A, farben, mitFarben, { gedimmt = false, k = 1 } = {}) {
  const sys = g.daten.system;
  /** @param {number} pos */
  const farbeVon = (pos) => (mitFarben ? farben.dir[pos - 1] : farben.ink);
  const linien = el.linien.map((l) => {
    const [p, q] = l.strecke.map(A.zuBild);
    const c = farbeVon(blickrichtung(sys, l.normale));
    if (!l.neu) return linieSVG(p, q, l.art, c, null, k);
    return `<g class="neu">${linieSVG(p, q, 'spiegel', farben.accent2, 9, k).replace('<line', '<line stroke-opacity="0.28"')}${linieSVG(p, q, l.art, c, null, k)}</g>`;
  });
  const dreh = el.drehpunkte.map((d) => {
    const q = A.zuBild(d.punkt);
    const ordn = [...(d.ordnungen ?? [d.n])].sort((u, v) => v - u);
    const halo = d.neu ? `<circle class="neu" cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(13 * k)}" fill="${farben.accent2}" fill-opacity="0.3"/>` : '';
    // mehrere Zähligkeiten am selben Punkt (Aufbau): die grösste vergrössert, die übrigen hell darin
    if (ordn.length === 1) return halo + drehSymbol(ordn[0], q, farbeVon(1), farben.paper, k, k);
    return halo + drehSymbol(ordn[0], q, farbeVon(1), farben.paper, 1.45 * k, k)
      + ordn.slice(1).map((n) => drehSymbol(n, [q[0], q[1] + (ordn[0] === 3 ? 1.5 * k : 0)], farben.paper, farbeVon(1), 0.6 * k, k)).join('');
  });
  return `<g class="elemente"${gedimmt ? ' opacity="0.35"' : ''}>${linien.join('')}${dreh.join('')}</g>`;
}

/** Echte Teiler > 1 und die Zahl selbst (Zähligkeiten an einem Drehpunkt): 6 → [6, 3, 2]. @param {number} n */
const teiler = (n) => [6, 4, 3, 2].filter((k) => k <= n && n % k === 0);

/**
 * Elemente der Zellen [0, n]² im Aufbau aus Erzeugenden bis zum Schritt schritt (herkunft.js).
 * An einem Drehpunkt erscheinen die Zähligkeiten, die bis dahin entstanden sind; eine, die
 * eine andere teilt, entfällt (2 und 3 → beide, 2 und 6 → 6). neu: genau in diesem Schritt.
 * @param {Gruppe} g @param {number} n @param {number} schritt
 * @returns {{ drehpunkte: (Drehpunkt & { ordnungen: number[], neu: boolean })[], linien: SichtbareLinie[] }}
 */
export function aufbauElemente(g, n, schritt) {
  const e = elementeImBereich(g, n);
  const h = herkunft(g);
  const drehpunkte = [];
  for (const d of e.drehpunkte) {
    // jede Zähligkeit eines gezeichneten Drehpunkts hat eine Klasse in herkunft()
    const st = new Map(teiler(d.n).map((k) => [k, /** @type {number} */ (h.klassen.get(klassenSchluessel(g, { n: k, punkt: d.punkt })))]));
    const da = [...st.keys()].filter((k) => /** @type {number} */ (st.get(k)) <= schritt);
    const zeigen = da.filter((k) => !da.some((m) => m !== k && m % k === 0));
    if (zeigen.length) drehpunkte.push({ ...d, ordnungen: zeigen, neu: zeigen.some((k) => st.get(k) === schritt) });
  }
  const linien = [];
  for (const l of e.linien) {
    const s = /** @type {number} */ (schrittVon(g, l)); // jede gezeichnete Linie hat einen Schritt
    if (s <= schritt) linien.push({ ...l, neu: s === schritt });
  }
  return { drehpunkte, linien };
}

// ---------------------------------------------------------------------------------------------
// Objekt und seine Bilder
// ---------------------------------------------------------------------------------------------

/** Fähnchen in Bildpunkten, Fuss im Ursprung: Stange nach oben, Fahne nach rechts. */
/** @type {{ stange: Vec2[], fahne: Vec2[] }} */
const FAHNE = { stange: [[0, 0], [0, -22]], fahne: [[0, -22], [11, -17], [0, -12]] };
/** Grösste Ausdehnung eines Objekts (Fähnchen, Komma, Ornament) vom Fusspunkt, in Bildpunkten bei Massstab 1. */
const REICHWEITE = 30;
/** Umriss aller Formen des Objekts ungedreht, Fuss im Ursprung, in Bildpunkten bei Massstab 1: [x0, y0, x1, y1] (Treffer beim Ziehen). */
export const OBJEKT_UMRISS = /** @type {const} */ ([-10, -27, 20, 4]);
/** Breite des Ausschnitts in Tafel B (Muster) bei Vergrösserung 1, in Einheiten der längeren Zellkante. */
const MUSTER_BREITE = 4.4;
/**
 * Grösse des Objekts im Gitter: Länge (in Einheiten der längeren Zellkante) je Bildpunkt der
 * Zeichnung des Objekts bei Massstab 1. Das Objekt ist damit wie eine Zeichnung und die Motive der
 * Basis im Gitter festgelegt und steht in beiden Tafeln, bei 2 × 2 Zellen und in der Lupe im selben
 * Verhältnis zur Zelle. Wert: im Muster sind es bei Vergrösserung 1, Grösse 1 und k = 1 genau 0,8 Bildpunkte
 * je Bildpunkt der Zeichnung (500 Bildpunkte für MUSTER_BREITE).
 */
const OBJEKT_LAENGE = (0.8 * MUSTER_BREITE) / 500;

/**
 * Eine Erklärung im Symmetriegerüst ist aktiv: „Schritt für Schritt“, „Aufbau aus Erzeugenden“ oder
 * „Herkunft der Elemente“. Dann zeigt Tafel A das Objekt in fester Grösse (wie die Fähnchen der
 * Erklärungen), die eigene Zeichnung nicht, und die Lupe ruht; sie wird nur zum Zeichnen, Radieren und
 * Setzen des Objekts gebraucht.
 * @param {Pick<Zustand, 'schritt' | 'objekt' | 'aufbau' | 'elemente' | 'herkunft' | 'erkl'>} z
 */
export const erklaerend = (z) => (z.schritt > 0 && z.objekt) || (z.aufbau > 0 && z.elemente) || (z.herkunft && z.elemente) || !!z.erkl;

/**
 * „Schritt für Schritt“ wirkt: eingeschaltet, mit Objekt, ohne eingeschaltete
 * „Herkunft der Elemente“ und ohne gezeigte Herkunft eines Elements (sie überdecken es; dann ruht es,
 * main.js). Aufrufer übergeben in erkl nur ein gültiges Element, ein unbekanntes aus einem alten Link
 * zählt nicht.
 * @param {Pick<Zustand, 'schritt' | 'objekt' | 'erkl' | 'herkunft' | 'elemente'>} z
 */
export const schrittWirkt = (z) => z.schritt > 0 && z.objekt && !z.erkl && !(z.herkunft && z.elemente);

/**
 * Massstab des Objekts (für objektSVG) in der Ansicht A: Grösse groesse (Regler, Link `og`) im Gitter
 * mit der Metrik M, mal k. In der App ist k = 1. In Tafel A gilt k nur für die Symbole (das Objekt
 * gehört zum Muster); Tafel B übergibt k (Quiz: K_MUSTER), dort wachsen Objekt und Symbole gemeinsam.
 * @param {Metrik} M @param {Ansicht} A @param {number} [groesse] @param {number} [k]
 */
export function objektMassstab(M, A, groesse = 1, k = 1) {
  return k * groesse * OBJEKT_LAENGE * Math.max(Math.hypot(...M.a), Math.hypot(...M.b)) * A.s;
}

/** Alle Bilder des Punktes p in den Zellen [lo, hi]² mit Rand, je { punkt, R, eigentlich }. */
/**
 * Rand um die Zellen für „Bilder rund um die Zelle (wie ITA)“, in Bruchteilen der Zelle. Mit ⅓
 * sind die Gruppen um die Elemente auf dem Zellrand vollständig, solange das Objekt höchstens ⅓
 * von ihnen entfernt liegt (Startpunkt 0,12; 0,31). ITA nennt keine Regel; die Diagramme der
 * allgemeinen Lage zeigen die Gruppen um die Ecken vollständig, mit einem Punkt nahe am Ursprung.
 */
export const ORBIT_RAND = 1 / 3;

/**
 * Alle Bilder des Punktes p in den Zellen [lo, hi]² mit Rand.
 * @param {Gruppe} g @param {Vec2} p @param {number} lo @param {number} hi @param {number} [rand]
 * @returns {Bild[]}
 */
export function bilder(g, p, lo, hi, rand = 0.08) {
  /** @type {Bild[]} */
  const out = [];
  for (const [index, op] of g.alle.entries()) {
    const q0 = anwenden(op, p).map(mod1);
    const d = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0];
    for (let i = Math.floor(lo - 1); i <= Math.ceil(hi); i++) for (let j = Math.floor(lo - 1); j <= Math.ceil(hi); j++) {
      /** @type {Vec2} */
      const q = [q0[0] + i, q0[1] + j];
      if (q[0] < lo - rand || q[0] > hi + rand || q[1] < lo - rand || q[1] > hi + rand) continue;
      out.push({ punkt: q, R: op.R, eigentlich: d > 0, index });
    }
  }
  return out;
}

/**
 * Ornamentmotive für das Muster (Konzept §3.6): selbst gezeichnet, ohne eigene Symmetrie (chiral),
 * damit Spiegelbilder sichtbar bleiben. Pfade in Bildpunkten wie das Fähnchen, Fuss im Ursprung;
 * je Teil [Befehle, Art]: 'fill' gefüllt, 'stroke' Linie, 'loch' gefüllt in der Papierfarbe.
 * Befehle: [Buchstabe, ...Punkte] mit M, L, Q, C, Z.
 * @type {Record<string, [[string, ...Vec2[]][], 'stroke' | 'fill' | 'ader' | 'loch'][]>}
 */
export const ORNAMENTE = {
  blatt: [
    [[['M', [0, 0]], ['Q', [1, -6], [4, -9]]], 'stroke'],
    [[['M', [4, -9]], ['C', [-1, -15], [3, -23], [13, -26]], ['C', [14, -17], [11, -11], [4, -9]], ['Z']], 'fill'],
    [[['M', [4, -9]], ['Q', [8, -16], [13, -26]]], 'ader'],
  ],
  tropfen: [
    [[['M', [0, -1]], ['C', [-9, -4], [-9, -17], [0, -20]], ['C', [8, -22], [12, -13], [7, -7]], ['C', [5, -4], [5, -1], [9, 2]], ['C', [4, 3], [1, 1], [0, -1]], ['Z']], 'fill'],
    [[['M', [-1.5, -11]], ['C', [-1.5, -14], [3, -14], [3, -11]], ['C', [3, -8], [-1.5, -8], [-1.5, -11]], ['Z']], 'loch'],
  ],
  ranke: [
    [[['M', [0, 0]], ['C', [-1, -9], [4, -16], [11, -17]], ['C', [17, -18], [19, -11], [15, -9]], ['C', [12, -7], [10, -10], [12, -12]]], 'stroke'],
    [[['M', [3, -10]], ['C', [-4, -11], [-6, -17], [-3, -21]], ['C', [1, -18], [3, -14], [3, -10]], ['Z']], 'fill'],
  ],
};
/** Länge einer Einheit der lokalen Koordinaten eines Ornaments als Motiv (motive.js) in Bildpunkten der Pfade. */
export const ORNAMENT_EINHEIT = 13;

/**
 * Mitte eines Ornaments (Mitte des Rechtecks um alle Punkte seiner Pfade, in Bildpunkten der Pfade): Als Motiv
 * liegt sie auf der Lage, um sie dreht sich das Motiv (der Fuss im Ursprung wäre für die Drehung ungünstig).
 * @param {string} form @returns {Vec2}
 */
export function ornamentMitte(form) {
  const ps = ORNAMENTE[form].flatMap(([befehle]) => befehle.flatMap(([, ...v]) => v));
  const x = ps.map((q) => q[0]); const y = ps.map((q) => q[1]);
  return [(Math.min(...x) + Math.max(...x)) / 2, (Math.min(...y) + Math.max(...y)) / 2];
}

/**
 * Ornament als SVG; T bildet einen Punkt der Pfade auf das Bild ab, massstab: Bildpunkte je Bildpunkt des Pfades
 * (für die Linienstärken).
 * @param {string} form @param {(v: Vec2) => Vec2} T @param {string} farbe @param {string} papier @param {number} massstab
 */
export function ornamentSVG(form, T, farbe, papier, massstab) {
  return ORNAMENTE[form].map(([befehle, art]) => {
    const d = befehle.map(([c, ...ps]) => c + ps.map((v) => pt(T(v))).join(' ')).join('');
    if (art === 'stroke') return `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${f2(2.2 * massstab)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (art === 'ader') return `<path d="${d}" fill="none" stroke="${papier}" stroke-width="${f2(0.9 * massstab)}" stroke-linecap="round" stroke-opacity="0.8"/>`;
    return `<path d="${d}" fill="${art === 'loch' ? papier : farbe}" fill-opacity="${art === 'loch' ? 1 : 0.9}" stroke="${art === 'loch' ? papier : farbe}" stroke-width="${f2(0.8 * massstab)}" stroke-linejoin="round"/>`;
  }).join('');
}

/** Formen des Objekts: Fähnchen, Kreis mit Komma (ITA) und die Ornamente. */
export const FORMEN = ['fahne', 'komma', ...Object.keys(ORNAMENTE)];

/**
 * SVG eines Objekts (Fähnchen, Kreis mit Komma oder Ornament) am Bildpunkt q, gedreht/gespiegelt mit Mc.
 * @param {string} form @param {Vec2} q @param {Mat2} Mc @param {boolean} eigentlich @param {string} farbe @param {string} papier @param {number} [massstab]
 */
export function objektSVG(form, q, Mc, eigentlich, farbe, papier, massstab = 1) {
  /** @param {Vec2} v @returns {Vec2} */
  const T = (v) => [q[0] + massstab * (Mc[0][0] * v[0] + Mc[0][1] * v[1]), q[1] + massstab * (Mc[1][0] * v[0] + Mc[1][1] * v[1])];
  if (ORNAMENTE[form]) return ornamentSVG(form, T, farbe, papier, massstab);
  if (form === 'komma') {
    const r = 7 * massstab;
    const komma = eigentlich ? '' : (() => {
      // Komma im Kreis: Punkt mit Schwanz (ITA: Spiegelbild)
      const p0 = [q[0], q[1] - 0.5 * massstab]; const p1 = [q[0] - 1.6 * massstab, q[1] + 3.6 * massstab];
      return `<circle cx="${f2(p0[0])}" cy="${f2(p0[1])}" r="${f2(1.9 * massstab)}" fill="${farbe}"/><line x1="${f2(p0[0] + 1.2 * massstab)}" y1="${f2(p0[1])}" x2="${f2(p1[0])}" y2="${f2(p1[1])}" stroke="${farbe}" stroke-width="${f2(1.4 * massstab)}" stroke-linecap="round"/>`;
    })();
    return `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(r)}" fill="${papier}" stroke="${farbe}" stroke-width="${f2(1.5 * massstab)}"/>${komma}`;
  }
  const s = FAHNE.stange.map(T); const f = FAHNE.fahne.map(T);
  return `<line x1="${f2(s[0][0])}" y1="${f2(s[0][1])}" x2="${f2(s[1][0])}" y2="${f2(s[1][1])}" stroke="${farbe}" stroke-width="${f2(2 * massstab)}" stroke-linecap="round"/>`
    + `<polygon points="${f.map(pt).join(' ')}" fill="${farbe}" fill-opacity="0.85" stroke="${farbe}" stroke-width="${f2(1 * massstab)}" stroke-linejoin="round"/>`
    + `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(2.3 * massstab)}" fill="${farbe}"/>`;
}

/**
 * Bilder des Objekts als SVG. farbeVon(bild): eigene Farbe je Bild (z. B. einfarbig bei der Tapete), sonst nach
 * Händigkeit.
 * @param {Gruppe} g @param {Metrik} M @param {Ansicht} A @param {Vec2} p @param {number} lo @param {number} hi
 * @param {string} form @param {Farben} farben @param {number} massstab @param {number} [rand]
 * @param {((b: Bild) => string) | null} [farbeVon] @param {boolean} [nurSichtbar]
 */
function objekteSVG(g, M, A, p, lo, hi, form, farben, massstab, rand = undefined, farbeVon = null, nurSichtbar = false) {
  const out = [];
  // nurSichtbar: Bilder ausserhalb des Bildes (mit Rand für die Grösse des Objekts) weglassen
  const pad = REICHWEITE * massstab;
  for (const b of bilder(g, p, lo, hi, rand)) {
    const q = A.zuBild(b.punkt);
    if (nurSichtbar && (q[0] < -pad || q[0] > A.groesse + pad || q[1] < -pad || q[1] > A.groesse + pad)) continue;
    const Mc = kartMatrix(M, b.R);
    const farbe = farbeVon ? farbeVon(b) : b.eigentlich ? farben.upper : farben.accent2;
    out.push(objektSVG(form, q, Mc, b.eigentlich, farbe, farben.paper, massstab));
  }
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// Tafeln
// ---------------------------------------------------------------------------------------------

/**
 * Stelle des Ausgangsobjekts in den Zellen [0, n]²: der Punkt selbst, wenn er dort liegt
 * (auch in einer anderen als der ersten Zelle), sonst sein Bild in der ersten Zelle.
 * Ring in Tafel A und Trefferprüfung beim Ziehen verwenden dieselbe Stelle.
 * @param {Vec2} p @param {number} n @returns {Vec2}
 */
export const ausgangsstelle = (p, n) => /** @type {Vec2} */ (p.every((v) => v >= 0 && v <= n) ? [...p] : p.map(mod1));

/** Zellumriss [i, i+1] × [j, j+1] als Polygon. @param {Ansicht} A @param {number} i @param {number} j @param {number} [n] */
const zellPoly = (A, i, j, n = 1) => /** @type {Vec2[]} */ ([[i, j], [i, j + n], [i + n, j + n], [i + n, j]]).map((p) => pt(A.zuBild(p))).join(' ');

/**
 * Gewählte Bedingungen der asymmetrischen Einheit (Nummern in g.daten.ae.text): der Bereich in
 * den Zellen, in dem alle erfüllt sind, schattiert (teil 'flaeche', unter den Elementen); die
 * Grenzlinien jeder Bedingung als Band (teil 'grenzen', über den Elementen).
 * @param {Gruppe} g @param {number[]} auswahl @param {Ansicht} A @param {number} n @param {Farben} farben @param {'flaeche' | 'grenzen'} [teil]
 */
export function aeTeileSVG(g, auswahl, A, n, farben, teil = 'flaeche') {
  const alle = bedingungen(g.daten.ae.text);
  const gewaehlt = auswahl.map((i) => alle[i]).filter(Boolean);
  if (!gewaehlt.length) return '';
  /** @type {Box} */
  const box = [0, 0, n, n];
  const flaecheSVG = bereich(gewaehlt.flatMap((b) => b.halbebenen), box);
  const teile = [`<g class="ae-teile${teil === 'flaeche' ? '' : '-grenzen'}">`];
  if (teil === 'flaeche' && flaecheSVG.length > 2) {
    teile.push(`<polygon points="${flaecheSVG.map((p) => pt(A.zuBild(p))).join(' ')}" fill="${farben.accent2}" fill-opacity="0.22"/>`);
  }
  // Grenzlinien als Band über den Symmetrieelementen: sie liegen oft genau auf ihnen
  if (teil === 'grenzen') for (const b of gewaehlt) {
    for (const [cx, cy, c0] of b.halbebenen) {
      // Grenzlinie cx·x + cy·y + c0 = 0: Punkt und Richtung
      const l = cx * cx + cy * cy;
      const s = clipLinie([(-c0 * cx) / l, (-c0 * cy) / l], [-cy, cx], box);
      if (!s) continue;
      const [p, q] = s.map(A.zuBild);
      teile.push(`<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farben.accent2}" stroke-width="7" stroke-opacity="0.5" stroke-linecap="round"/>`);
    }
  }
  teile.push('</g>');
  return teile.join('');
}

// ---------------------------------------------------------------------------------------------
// Selbst zeichnen: Striche und die asymmetrische Einheit, vervielfältigt mit allen Operationen
// ---------------------------------------------------------------------------------------------

/** Grenzen für gezeichnete Striche (Bruchkoordinaten): Punkte je Zeichnung und Mindestabstand. */
export const STRICH_GRENZE = 1200;

/**
 * Strich vereinfachen (Ramer-Douglas-Peucker, Toleranz in Bruchteilen der Zelle) und auf drei
 * Stellen runden, damit das Muster auch mit vielen Kopien schnell bleibt.
 * @param {Vec2[]} punkte @param {number} [tol] @returns {Vec2[]}
 */
export function vereinfachen(punkte, tol = 0.003) {
  /** @param {Vec2} p @returns {Vec2} */
  const runden = (p) => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000];
  if (punkte.length <= 2) return punkte.map(runden);
  /** @param {Vec2} p @param {Vec2} a @param {Vec2} b */
  const abstand = (p, a, b) => {
    const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy);
    if (l < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / l;
  };
  /** @type {boolean[]} */
  const behalten = new Array(punkte.length).fill(false);
  behalten[0] = true; behalten[punkte.length - 1] = true;
  /** @type {[number, number][]} */
  const stapel = [[0, punkte.length - 1]];
  while (stapel.length) {
    const [i, j] = /** @type {[number, number]} */ (stapel.pop());
    let max = -1; let k = -1;
    for (let m = i + 1; m < j; m++) { const d = abstand(punkte[m], punkte[i], punkte[j]); if (d > max) { max = d; k = m; } }
    if (max > tol) { behalten[k] = true; stapel.push([i, k], [k, j]); }
  }
  return punkte.filter((_, i) => behalten[i]).map(runden);
}

/**
 * Kopien einer Punktfolge unter allen Operationen der Gruppe und den Gittertranslationen, soweit
 * sie den Bereich [lo − rand, hi + rand]² berühren. Je Kopie: punkte, eigentlich (Drehung oder
 * Translation, sonst Spiegelbild), urbild (die Identität ohne Verschiebung).
 * @param {Gruppe} g @param {readonly Vec2[]} punkte @param {number} lo @param {number} hi @param {number} [rand]
 * @returns {{ punkte: Vec2[], eigentlich: boolean, urbild: boolean }[]}
 */
export function kopien(g, punkte, lo, hi, rand = 0.1) {
  /** @type {{ punkte: Vec2[], eigentlich: boolean, urbild: boolean }[]} */
  const out = [];
  if (!punkte.length) return out;
  for (const op of g.alle) {
    const bild = punkte.map((p) => anwenden(op, p));
    const xs = bild.map((p) => p[0]); const ys = bild.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const eigentlich = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0;
    const id = eigentlich && op.R[0][0] === 1 && op.R[1][1] === 1 && !op.t[0] && !op.t[1];
    for (let i = Math.ceil(lo - rand - x1); i <= Math.floor(hi + rand - x0); i++) {
      for (let j = Math.ceil(lo - rand - y1); j <= Math.floor(hi + rand - y0); j++) {
        out.push({ punkte: bild.map((p) => /** @type {Vec2} */ ([p[0] + i, p[1] + j])), eigentlich, urbild: id && !i && !j });
      }
    }
  }
  return out;
}

/**
 * Radieren an der Stelle p (Bruchkoordinaten) mit dem Radius r (kartesisch, Metrik M). Weil jede
 * sichtbare Kopie ein Bild des Originals ist, wird an allen Urbildern von p unter den Operationen
 * der Gruppe (und Gittertranslationen) radiert. Ein Strich verliert genau die Stücke im Kreis und
 * zerfällt dabei, wo nötig, in mehrere Striche. Ergebnis: neue Liste der Striche.
 * @param {Vec2[][]} striche @param {Gruppe} g @param {Metrik} M @param {Vec2} p @param {number} r
 * @returns {Vec2[][]}
 */
export function radieren(striche, g, M, p, r) {
  /** @param {Vec2} q */
  const C = (q) => kart(M, q);
  // Urbilder von p: op⁻¹(p), um Gittervektoren verschoben, nahe bei den Strichen
  /** @type {Vec2[]} */
  const urbilder = [];
  const alle = striche.flat();
  if (!alle.length) return striche;
  const xs = alle.map((q) => q[0]); const ys = alle.map((q) => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...ys) - 1, Math.max(...ys) + 1];
  for (const op of g.alle) {
    const u = anwenden(invers(op), p);
    for (let i = Math.floor(x0 - u[0]); i <= Math.ceil(x1 - u[0]); i++) {
      for (let j = Math.floor(y0 - u[1]); j <= Math.ceil(y1 - u[1]); j++) urbilder.push(C([u[0] + i, u[1] + j]));
    }
  }
  /** Teile der Strecke a–b (kartesisch) ausserhalb aller Kreise, als Parameterintervalle in [0, 1]. @param {Vec2} a @param {Vec2} b */
  const aussen = (a, b) => {
    /** @type {[number, number][]} */
    let frei = [[0, 1]];
    const d = [b[0] - a[0], b[1] - a[1]]; const dd = d[0] * d[0] + d[1] * d[1];
    for (const m of urbilder) {
      const f = [a[0] - m[0], a[1] - m[1]];
      const B = 2 * (f[0] * d[0] + f[1] * d[1]); const Cc = f[0] * f[0] + f[1] * f[1] - r * r;
      if (dd < 1e-18) { if (Cc <= 0) frei = []; continue; }
      const disk = B * B - 4 * dd * Cc;
      if (disk <= 0) continue;
      const w = Math.sqrt(disk);
      const t1 = (-B - w) / (2 * dd); const t2 = (-B + w) / (2 * dd);
      if (t2 <= 0 || t1 >= 1) continue;
      frei = frei.flatMap(([u, v]) => /** @type {[number, number][]} */ ([[u, Math.min(v, t1)], [Math.max(u, t2), v]]).filter(([s0, s1]) => s1 - s0 > 1e-9));
      if (!frei.length) break;
    }
    return frei;
  };
  /** @type {Vec2[][]} */
  const out = [];
  for (const st of striche) {
    /** @type {Vec2[]} */
    let aktuell = [];
    const abschliessen = () => { if (aktuell.length >= 2) out.push(aktuell); aktuell = []; };
    for (let k = 0; k + 1 < st.length; k++) {
      const a = st[k]; const b = st[k + 1];
      /** @param {number} t */
      const punkt = (t) => /** @type {Vec2} */ ([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])].map((v) => Math.round(v * 1000) / 1000));
      const teile = aussen(C(a), C(b));
      if (!teile.length) abschliessen();
      for (const [u, v] of teile) {
        const pu = punkt(u); const pv = punkt(v);
        const letzt = aktuell[aktuell.length - 1];
        if (!letzt || Math.abs(letzt[0] - pu[0]) > 1e-9 || Math.abs(letzt[1] - pu[1]) > 1e-9) { abschliessen(); aktuell.push(pu); }
        aktuell.push(pv);
        if (v < 1 - 1e-9) abschliessen();
      }
    }
    abschliessen();
  }
  return out;
}

/**
 * Liegt eine Punktfolge (Bruchkoordinaten) zumindest teilweise im Bild der Ansicht A? Mit etwas Rand.
 * @param {Ansicht} A @param {Vec2[]} pts
 */
function imBild(A, pts) {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
  for (const p of pts) { const q = A.zuBild(p); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  return x1 >= -10 && x0 <= A.groesse + 10 && y1 >= -10 && y0 <= A.groesse + 10;
}

/**
 * Die asymmetrische Einheit der Gruppe und ihre Bilder im Bereich [lo, hi]², als SVG-Elemente: Sie pflastern die
 * Ebene ohne Lücken und Überlappungen. Das Urbild ist kräftiger. Gleiche Händigkeit in `farben.upper`, Spiegelbilder
 * in `farben.accent2`, oder alle in einer Farbe (einfarbig, z. B. für die Tapete). Gemeinsam für „Ebenengruppen“
 * (zeichnungSVG) und „Gitter und Basis“ (struktur.js, dort mit der Ansicht der konventionellen Zelle).
 * @param {Gruppe} g @param {Ansicht} A @param {number} lo @param {number} hi @param {Farben} farben
 * @param {string | null} [einfarbig] @param {boolean} [nurSichtbar] Kopien ganz ausserhalb des Bildes weglassen
 * @returns {string[]}
 */
export function aeFuellung(g, A, lo, hi, farben, einfarbig = null, nurSichtbar = false) {
  /** @type {string[]} */
  const teile = [];
  /** @param {Vec2[]} pts */
  const pfad = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${pt(A.zuBild(p))}`).join('');
  for (const k of kopien(g, g.daten.ae.ecken, lo, hi, 0)) {
    if (nurSichtbar && !imBild(A, k.punkte)) continue;
    const farbe = einfarbig ?? (k.eigentlich ? farben.upper : farben.accent2);
    teile.push(`<path d="${pfad(k.punkte)}Z" fill="${farbe}" fill-opacity="${k.urbild ? 0.45 : 0.16}" stroke="${farbe}" stroke-width="${k.urbild ? 2 : 0.8}" stroke-linejoin="round"/>`);
  }
  return teile;
}

/**
 * SVG der Striche und der gefüllten asymmetrischen Einheit im Bereich [lo, hi]².
 * @param {Gruppe} g @param {Ansicht} A @param {Zustand} z @param {number} lo @param {number} hi @param {Farben} farben
 * @param {number} [massstab] @param {string | null} [einfarbig] @param {boolean} [nurSichtbar]
 */
function zeichnungSVG(g, A, z, lo, hi, farben, massstab = 1, einfarbig = null, nurSichtbar = false) {
  const teile = [];
  /** @param {Vec2[]} pts */
  const pfad = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${pt(A.zuBild(p))}`).join('');
  // nurSichtbar: Kopien, deren Umriss ganz ausserhalb des Bildes liegt, weglassen
  /** @param {Vec2[]} pts */
  const sichtbar = (pts) => !nurSichtbar || imBild(A, pts);
  if (z.aeFuell) teile.push(...aeFuellung(g, A, lo, hi, farben, einfarbig, nurSichtbar));
  for (const strich of z.striche ?? []) {
    if (strich.length < 2) continue;
    for (const k of kopien(g, strich, lo, hi)) {
      if (!sichtbar(k.punkte)) continue;
      const farbe = einfarbig ?? (k.eigentlich ? farben.upper : farben.accent2);
      teile.push(`<path d="${pfad(k.punkte)}" fill="none" stroke="${farbe}" stroke-width="${f2((k.urbild ? 3.2 : 2) * massstab)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  }
  return teile.length ? `<g class="zeichnung">${teile.join('')}</g>` : '';
}

// ---------------------------------------------------------------------------------------------
// Schritt für Schritt: das Objekt mit jeder Operation der ITA-Liste, dann die Gittertranslationen
// ---------------------------------------------------------------------------------------------

/**
 * Operationen in der Reihenfolge der ITA-Seite, ohne Reduktion modulo Gitter: zuerst die Liste
 * für (0, 0)+, bei zentrierten Gruppen dann dieselbe Liste für (½, ½)+. nr: Nummer in der Liste.
 * @param {Gruppe} g @returns {ItaOperation[]}
 */
export function itaOperationen(g) {
  /** @type {ItaOperation[]} */
  const out = [];
  g.zentr.forEach((z, zi) => g.ops.forEach((op, i) => out.push({ op: verknuepfen(translation(z), op), nr: i + 1, zentr: zi > 0 ? z : null })));
  return out;
}

/**
 * Schritt k (1 … N) wendet die Operationen 1 … k der ITA-Liste auf das Objekt p an; die Bilder
 * liegen dort, wo die Koordinaten der Liste hinzeigen (ohne Gittertranslation, also auch
 * ausserhalb der Zelle). Schritt N + 1: die Gittertranslationen. Je Bild: gleich = Index eines
 * früheren Bildes an derselben Stelle (exakt) oder, mit gitter: true, an einer um einen
 * Gittervektor verschobenen Stelle. verschieden: Zahl der Stellen bis auf Gittertranslationen.
 * @param {Gruppe} g @param {Vec2} p @param {number} k
 */
export function schrittDaten(g, p, k) {
  const liste = itaOperationen(g);
  const N = liste.length;
  /** @type {SchrittBild[]} */
  const bilder = [];
  liste.slice(0, Math.min(Math.max(k, 0), N)).forEach((e, i) => {
    const q = anwenden(e.op, p);
    /** @param {SchrittBild} b */
    const diff = (b) => [q[0] - b.punkt[0], q[1] - b.punkt[1]];
    let gleich = bilder.findIndex((b) => diff(b).every((x) => Math.abs(x) < 1e-6));
    let gitter = false;
    if (gleich < 0) {
      gleich = bilder.findIndex((b) => diff(b).every((x) => Math.abs(x - Math.round(x)) < 1e-6));
      gitter = gleich >= 0;
    }
    bilder.push({ ...e, punkt: q, index: i, gleich: gleich >= 0 ? gleich : null, gitter });
  });
  return { liste, bilder, N, k: Math.min(Math.max(k, 0), N + 1), verschieden: bilder.filter((b) => b.gleich === null).length, translationen: k > N };
}

/** Kurzname einer Operation der Liste: „3“ bzw. „3′“ für dieselbe Operation mit (½, ½)+. @param {{ nr: number, zentr: Vec2 | null }} e */
export const opNummer = (e) => `${e.nr}${e.zentr ? '′' : ''}`;

/**
 * Überlagerung „Schritt für Schritt“ in Tafel A (statt der Bilder des Objekts).
 * @param {Gruppe} g @param {Metrik} M @param {Ansicht} A @param {Vec2} s @param {number} k @param {number} n @param {string} form @param {Farben} farben
 */
function schrittSVG(g, M, A, s, k, n, form, farben) {
  const d = schrittDaten(g, s, k);
  const teile = ['<g class="schritte">'];
  /** @param {Vec2} p @param {Mat2} R @param {string} farbe @param {number} [mass] */
  const fahne = (p, R, farbe, mass = 1) => objektSVG(form, A.zuBild(p), kartMatrix(M, R), R[0][0] * R[1][1] - R[0][1] * R[1][0] > 0, farbe, farben.paper, mass);
  /** @param {Vec2} p @param {string} text @param {string} farbe */
  const marke = (p, text, farbe) => {
    const q = A.zuBild(p);
    return `<text x="${f2(q[0] + 13)}" y="${f2(q[1] + 15)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="600" fill="${farbe}" stroke="${farben.paper}" stroke-width="3" paint-order="stroke">${text}</text>`;
  };
  if (d.translationen) {
    // Gittertranslationen: jedes Bild in die Zelle (Pfeil), dann alle Bilder in den Zellen
    for (const b of d.bilder) {
      const z = /** @type {Vec2} */ (b.punkt.map(mod1));
      if (Math.hypot(z[0] - b.punkt[0], z[1] - b.punkt[1]) > 1e-6) {
        teile.push(`<g opacity="0.35">${fahne(b.punkt, b.op.R, farben.muted)}</g>`);
        teile.push(wegSVG([A.zuBild(b.punkt), A.zuBild(z)], farben.muted));
      }
    }
    teile.push(objekteSVG(g, M, A, s, 0, n, form, farben, 1));
  } else {
    d.bilder.forEach((b, i) => {
      const jetzt = i === d.bilder.length - 1;
      const eigentlich = b.op.R[0][0] * b.op.R[1][1] - b.op.R[0][1] * b.op.R[1][0] > 0;
      if (jetzt && i > 0) {
        teile.push(opElementSVG(g, b.op, A, farben.accent, farben.paper, n, true));
        const w = weg(b.op, s, M);
        const bild = w.teile.map((t) => t.map(A.zuBild));
        if (w.zwischen) teile.push(`<g opacity="0.45">${fahne(w.zwischen.p, w.zwischen.op.R, farben.accent)}</g>`);
        teile.push(bild.map((t) => wegSVG(t, farben.accent)).join(''));
      }
      teile.push(`<g${jetzt ? '' : ' opacity="0.8"'}>${fahne(b.punkt, b.op.R, eigentlich ? farben.upper : farben.accent2)}</g>`);
      teile.push(marke(b.punkt, `(${opNummer(b)})`, jetzt ? farben.accent : farben.muted));
      if (jetzt) {
        const q = A.zuBild(b.punkt);
        teile.push(`<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="18" fill="none" stroke="${farben.accent}" stroke-width="2.2"/>`);
      }
    });
  }
  teile.push('</g>');
  return teile.join('');
}

/**
 * Tafel A: Symmetriegerüst. Elementarzelle (oder 2 × 2 Zellen) mit den Symmetrieelementen,
 * dazu das Objekt mit allen Bildern und wahlweise die asymmetrische Einheit.
 * Ergebnis: { svg (Inhalt des <svg>), ansicht }.
 */
/** Vergrösserung der Lupe in Tafel A. */
export const LUPE = 2;

/**
 * Ausschnitt der Lupe (kartesisch): LUPE-mal kleiner als das, was die Tafel ohne Lupe zeigt (box samt Rand in
 * Bildpunkten), um die Mitte (Bruchkoordinaten); ist der Ausschnitt grösser als die Ansicht, liegt er in deren Mitte.
 * Gemeinsam für Tafel A von „Ebenengruppen“ und von „Gitter und Basis“; dort mit `rand` 0 gezeichnet.
 * @param {Metrik} M @param {Box} box @param {number} randOhneLupe Rand der Tafel ohne Lupe in Bildpunkten
 * @param {Vec2} mitte @returns {Box}
 */
export function lupeAusschnitt(M, box, randOhneLupe, mitte) {
  const e = (randOhneLupe * Math.max(box[2] - box[0], box[3] - box[1])) / (520 - 2 * randOhneLupe);
  const gross = /** @type {Box} */ ([box[0] - e, box[1] - e, box[2] + e, box[3] + e]);
  const c = kart(M, mitte);
  const w = (gross[2] - gross[0]) / LUPE; const h = (gross[3] - gross[1]) / LUPE;
  const s0 = Math.max(w, h);
  // Bildmitte so, dass der Ausschnitt in der ganzen Ansicht bleibt (ist er grösser, in deren Mitte)
  /** @param {number} m @param {number} lo @param {number} hi */
  const lage = (m, lo, hi) => (s0 >= hi - lo ? (lo + hi) / 2 : Math.min(Math.max(m, lo + s0 / 2), hi - s0 / 2));
  const mx = lage(c[0], gross[0], gross[2]); const my = lage(c[1], gross[1], gross[3]);
  return [mx - s0 / 2, my - s0 / 2, mx + s0 / 2, my + s0 / 2];
}

/**
 * Tafel A. Optionen: phase (Erklärung), k (Grösse der Symbole, Skript); bei z.lupe lupeMitte
 * (Bruchkoordinaten der Bildmitte, sonst die Stelle des Objekts) oder lupeBox (fester Ausschnitt
 * aus einem früheren Ergebnis, während einer Geste). Das Ergebnis enthält lupeBox.
 * @param {string} id @param {Zustand} z @param {Farben} farben
 * @param {{ phase?: number, k?: number, lupeMitte?: Vec2 | null, lupeBox?: Box | null }} [optionen]
 * Ergebnis: auch massObjekt, der Massstab des Objekts (objektMassstab), für den Treffer beim Ziehen.
 * @returns {{ svg: string, ansicht: Ansicht, erklaerung: Erklaerung | null, lupeBox: Box | null, massObjekt: number }}
 */
export function tafelA(id, z, farben, { phase = 3, k = 1, lupeMitte = null, lupeBox = null } = {}) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const M = metrik(z.gitter[sys]);
  const n = z.zellen;
  const erkl = z.erkl ? erklaerungsDaten(g, z.erkl, z.punkt, n, M) : null;
  // Ansicht: Zellen, bei einer Erklärung auch die Stellen der Fähnchen
  // „Bilder rund um die Zelle“: Rand für die Bilder, die Ansicht etwas grösser für die Objekte
  const orbit = z.orbit && z.objekt && !erkl ? ORBIT_RAND : 0;
  // Erklärung aktiv: Objekt in fester Grösse, keine eigene Zeichnung, Lupe ruht
  const ruhig = erklaerend({ ...z, erkl: erkl ? z.erkl : null }); const lupe = z.lupe && !ruhig; // nur ein gültiges erkl zählt
  let box = zellBox(M, n, orbit ? orbit + 0.06 : 0);
  // Schritt für Schritt: Ansicht mit allen Bildern der ITA-Liste (auch ausserhalb der Zelle)
  const schritt = schrittWirkt({ ...z, erkl: erkl ? z.erkl : null }) ? z.schritt : 0;
  const s0 = ausgangsstelle(z.punkt, n);
  if (schritt) {
    for (const e of itaOperationen(g)) {
      const c = kart(M, anwenden(e.op, s0)); const r = 0.12 * Math.max(1, z.gitter[sys].ba);
      box = [Math.min(box[0], c[0] - r), Math.min(box[1], c[1] - r), Math.max(box[2], c[0] + r), Math.max(box[3], c[1] + r)];
    }
  }
  if (erkl) {
    // alle Punkte der Wege (Bögen, Zwischenbilder) und die Stellen der Fähnchen
    for (const p of [erkl.start, ...Object.values(erkl.wege).flatMap((w) => w.teile.flat())]) {
      const c = kart(M, p); const r = 0.12 * Math.max(1, z.gitter[sys].ba);
      box = [Math.min(box[0], c[0] - r), Math.min(box[1], c[1] - r), Math.max(box[2], c[0] + r), Math.max(box[3], c[1] + r)];
    }
  }
  // hexagonal: die Zelle ist eine flache Raute, die das Bild nur in der Breite füllt; schmalerer Rand
  const randOhneLupe = sys === 'hexagonal' ? 24 : 46;
  // Rand für das Objekt (im Gitter festgelegt, objektMassstab): Ein Objekt mit dem Fuss auf dem Rand der
  // Zellen bleibt ganz sichtbar. Reicht der Rand in Bildpunkten nicht, wird der Ausschnitt um p
  // grösser: rand / s + p ≥ Reichweite mit s = (520 − 2 rand) / (D + 2 p). Unabhängig von der Lage des
  // Objekts, damit sich die Ansicht beim Ziehen nicht ändert; während einer Erklärung (Objekt in
  // fester Grösse) kein Rand für das Objekt. Grenzen: Bilder knapp ausserhalb der Zelle (Rand von bilder()) können
  // angeschnitten werden, wie Zeichnungen.
  if (z.objekt && !ruhig) {
    const reichweite = REICHWEITE * OBJEKT_LAENGE * Math.max(Math.hypot(...M.a), Math.hypot(...M.b)) * (z.objGroesse ?? 1);
    const u = randOhneLupe / (520 - 2 * randOhneLupe); const D = Math.max(box[2] - box[0], box[3] - box[1]);
    const p = Math.max(0, (reichweite - u * D) / (1 + 2 * u));
    box = [box[0] - p, box[1] - p, box[2] + p, box[3] + p];
  }
  // Lupe: Ausschnitt LUPE-mal kleiner um die Mitte, innerhalb dessen, was die Tafel ohne Lupe zeigt
  // (Ausschnitt samt Rand in Bildpunkten); so vergrössert sie genau LUPE-fach
  if (lupe && lupeBox) box = lupeBox;
  else if (lupe) box = lupeAusschnitt(M, box, randOhneLupe, lupeMitte ?? ausgangsstelle(z.punkt, n));
  const rand = lupe ? 0 : randOhneLupe;
  const A = ansicht(M, box, 520, rand);
  // Objekt im Gitter (objektMassstab), während einer Erklärung fest wie bei „Schritt für Schritt“ (k: Skript, Quiz)
  const massObjekt = ruhig ? k : objektMassstab(M, A, z.objGroesse ?? 1);
  const teile = [`<rect width="520" height="520" fill="${farben.paper}"/>`];
  if (z.ae) {
    const ecken = g.daten.ae.ecken.map((p) => pt(A.zuBild(p))).join(' ');
    teile.push(`<polygon class="ae" points="${ecken}" fill="${farben.crystal}" fill-opacity="0.55" stroke="${farben.accent}" stroke-width="1.6" stroke-dasharray="5 3"/>`);
  }
  if (z.aeTeile?.length) teile.push(aeTeileSVG(g, z.aeTeile, A, n, farben));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    teile.push(`<polygon points="${zellPoly(A, i, j)}" fill="none" stroke="${farben.muted}" stroke-width="1.2"/>`);
  }
  if (!ruhig) teile.push(zeichnungSVG(g, A, z, -1, n + 1, farben));
  // Achsen: a und b am Ursprung beschriftet
  const o = A.zuBild([0, 0]);
  const pa = A.zuBild([n * 0.5, 0]); const pb = A.zuBild([0, n * 0.5]);
  /** @param {Vec2} p @param {Vec2} d @returns {Vec2} */
  const aus = (p, d) => { const l = Math.hypot(d[0], d[1]); const r = 18 * Math.min(k, 1.4); return [p[0] + (r * d[0]) / l, p[1] + (r * d[1]) / l]; };
  const la = aus(pa, [-(M.a[1]), M.a[0]]); // links neben der a-Kante
  const lb = aus(pb, [M.b[1], -M.b[0]]); // über der b-Kante
  teile.push(`<g font-family="Source Serif 4, serif" font-style="italic" font-size="${f2(19 * Math.min(k, 1.4))}" fill="${farben.muted}" text-anchor="middle" dominant-baseline="middle"><text x="${f2(la[0])}" y="${f2(la[1])}">a</text><text x="${f2(lb[0])}" y="${f2(lb[1])}">b</text></g>`);
  teile.push(`<circle cx="${f2(o[0])}" cy="${f2(o[1])}" r="2.6" fill="${farben.muted}"/>`);
  if (z.elemente) {
    const el = z.aufbau > 0 ? aufbauElemente(g, n, z.aufbau) : elementeImBereich(g, n);
    teile.push(elementeSVG(g, el, A, farben, z.farben, { gedimmt: !!erkl, k }));
  }
  if (z.aeTeile?.length) teile.push(aeTeileSVG(g, z.aeTeile, A, n, farben, 'grenzen'));
  if (schritt) teile.push(schrittSVG(g, M, A, s0, schritt, n, z.form, farben));
  else if (z.objekt && !erkl) teile.push(`<g class="objekte">${objekteSVG(g, M, A, z.punkt, 0, n, z.form, farben, massObjekt, orbit || undefined)}</g>`);
  if (z.objekt && !erkl) {
    const q = A.zuBild(ausgangsstelle(z.punkt, n));
    teile.push(`<circle class="ausgang" cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(15 * k)}" fill="none" stroke="${farben.accent}" stroke-width="${f2(1.8 * k)}" stroke-dasharray="${f2(3 * k)} ${f2(2.5 * k)}"/>`);
  }
  if (erkl) teile.push(erklaerungSVG(g, M, A, erkl, phase, farben, z.form, n));
  return { svg: teile.join(''), ansicht: A, erklaerung: erkl, lupeBox: lupe ? box : null, massObjekt };
}

// ---------------------------------------------------------------------------------------------
// „Herkunft der Elemente“: ein Element als Verknüpfung C = A ∘ B
// ---------------------------------------------------------------------------------------------

/** Spiegelanteil {R, t − w} einer Gleitspiegelung (w = (t + R t)/2), sonst null. @param {Op} C @returns {Op | null} */
function spiegelanteil(C) {
  if (C.R[0][0] * C.R[1][1] - C.R[0][1] * C.R[1][0] > 0) return null;
  const w = [0, 1].map((i) => (C.t[i] + C.R[i][0] * C.t[0] + C.R[i][1] * C.t[1]) / 2);
  if (Math.abs(w[0]) < 1e-9 && Math.abs(w[1]) < 1e-9) return null;
  return { R: C.R, t: [C.t[0] - w[0], C.t[1] - w[1]] };
}

/**
 * Erklärung einer Gitterkopie: Das Element ist das Vorbild V, um den Gittervektor t verschoben,
 * C = t ∘ V ∘ t⁻¹. Fähnchen: V bringt 0 nach 1; t verschiebt beide nach 2 und 3; C bringt 2
 * nach 3. Wege: V, t (von 0 und von 1), C.
 * @param {Gruppe} g @param {string} schluessel @param {{ element: OpElement, tiefe: number }} e
 * @param {{ schluessel: string, element: OpElement, op: Op, t: Vec2 }} v @param {Vec2} p @param {number} n @param {Metrik} M
 * @returns {ErklaerungKopie}
 */
function kopieDaten(g, schluessel, e, v, p, n, M) {
  const T = translation(v.t);
  const V = v.op;
  const C = verknuepfen(T, verknuepfen(V, invers(T)));
  /** @param {Vec2} s @returns {Record<string, Weg>} */
  const wegeVon = (s) => {
    const s1 = anwenden(V, s); const s2 = anwenden(T, s);
    return { V: weg(V, s, M), T0: weg(T, s, M), T1: weg(T, s1, M), C: weg(C, s2, M) };
  };
  const mitte = kart(M, [n / 2, n / 2]);
  const p0 = p.map(mod1);
  /** @type {{ s: Vec2, kosten: number } | null} */
  let best = null;
  for (const z of g.zentr) for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    /** @type {Vec2} */
    const s = [p0[0] + i + z[0], p0[1] + j + z[1]];
    const punkte = [s];
    for (const w of Object.values(wegeVon(s))) for (const t of w.teile) punkte.push(t[t.length - 1], t[Math.floor(t.length / 2)]);
    const kosten = punkte.reduce((sum, q) => { const c = kart(M, q); return sum + (c[0] - mitte[0]) ** 2 + (c[1] - mitte[1]) ** 2; }, 0);
    if (!best || kosten < best.kosten - 1e-12) best = { s, kosten };
  }
  const start = /** @type {{ s: Vec2 }} */ (best).s; // die Schleife läuft mindestens einmal
  return {
    art: 'kopie', schluessel, element: e.element, tiefe: e.tiefe, C, V, t: v.t, T,
    vorbild: { schluessel: v.schluessel, element: v.element }, kette: [], start, wege: wegeVon(start), erzeugende: false,
  };
}

/**
 * Daten der Erklärung eines Elements (Schlüssel aus herkunft.js) in den Zellen [0, n]²:
 * C = A ∘ B (zuerst B, dann A), die Herleitungskette und der Startpunkt des Fähnchens. Der
 * Startpunkt ist ein Gitterbild des Objekts p, bei dem Start, B(Start) und C(Start) möglichst
 * nahe an der Mitte der Zellen liegen. null, wenn das Element nicht bekannt ist.
 * @param {Gruppe} g @param {string} schluessel @param {Vec2} p @param {number} n @param {Metrik} M
 * @returns {Erklaerung | null}
 */
export function erklaerungsDaten(g, schluessel, p, n, M) {
  const e = herkunft(g).elemente.get(schluessel);
  if (!e) return null;
  const v = vorbild(g, e.element);
  if (v) return kopieDaten(g, schluessel, e, v, p, n, M);
  const kette = herleitung(g, e.schluessel);
  const erst = kette[0];
  const C = e.op; const A = erst.a; const B = erst.b;
  const erzeugende = B.R[0][0] === 1 && B.R[1][1] === 1 && !B.R[0][1] && !B.R[1][0] && !B.t[0] && !B.t[1];
  /** @param {Vec2} s @returns {Record<string, Weg>} */
  const wegeVon = (s) => {
    const sB = anwenden(B, s);
    return erzeugende ? { C: weg(C, s, M) } : { B: weg(B, s, M), A: weg(A, sB, M), C: weg(C, s, M) };
  };
  const mitte = kart(M, [n / 2, n / 2]);
  const p0 = p.map(mod1);
  /** @type {{ s: Vec2, kosten: number } | null} */
  let best = null;
  for (const z of g.zentr) for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    /** @type {Vec2} */
    const s = [p0[0] + i + z[0], p0[1] + j + z[1]];
    // Stellen, Zwischenbilder und die Mitten der Wege möglichst nahe an der Mitte der Zellen
    const punkte = [s];
    for (const w of Object.values(wegeVon(s))) {
      for (const t of w.teile) punkte.push(t[t.length - 1], t[Math.floor(t.length / 2)]);
    }
    const kosten = punkte.reduce((sum, q) => {
      const c = kart(M, q); return sum + (c[0] - mitte[0]) ** 2 + (c[1] - mitte[1]) ** 2;
    }, 0);
    if (!best || kosten < best.kosten - 1e-12) best = { s, kosten };
  }
  const start = /** @type {{ s: Vec2 }} */ (best).s; // die Schleife läuft mindestens einmal
  return { schluessel, element: e.element, tiefe: e.tiefe, C, A, B, kette, start, wege: wegeVon(start), erzeugende };
}

/**
 * Element einer Operation als SVG (Drehpunkt oder Linie über den sichtbaren Bereich).
 * @param {Gruppe} g @param {Op} op @param {Ansicht} A @param {string} farbe @param {string} papier @param {number} n @param {boolean} [breit]
 */
function opElementSVG(g, op, A, farbe, papier, n, breit = false) {
  const el = elementVonOp(g, op);
  if (!el) return '';
  if (el.typ === 'dreh') {
    const q = A.zuBild(el.punkt);
    return `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${breit ? 17 : 14}" fill="none" stroke="${farbe}" stroke-width="3"/>${drehSymbol(el.n, q, farbe, papier)}`;
  }
  const s = clipLinie(el.punkt, el.richtung, [-1.5, -1.5, n + 1.5, n + 1.5]);
  if (!s) return '';
  const [p, q] = s.map(A.zuBild);
  return `${linieSVG(p, q, 'spiegel', farbe, breit ? 11 : 8).replace('<line', '<line stroke-opacity="0.25"')}${linieSVG(p, q, el.typ, farbe, 3)}`;
}

/** Gestrichelter Weg durch Bildpunkte mit Pfeilspitze am Ende (Spitze etwas vor dem Ziel). @param {Vec2[]} punkte @param {string} farbe */
function wegSVG(punkte, farbe) {
  const z = punkte[punkte.length - 1];
  let i = punkte.length - 2;
  while (i > 0 && Math.hypot(z[0] - punkte[i][0], z[1] - punkte[i][1]) < 14) i--;
  const v = [z[0] - punkte[i][0], z[1] - punkte[i][1]]; const l = Math.hypot(...v);
  if (l < 4) return '';
  const ux = v[0] / l; const uy = v[1] / l;
  const e = [z[0] - 8 * ux, z[1] - 8 * uy];
  /** @type {Vec2[]} */
  const spitze = [[e[0], e[1]], [e[0] - 9 * ux + 4.5 * uy, e[1] - 9 * uy - 4.5 * ux], [e[0] - 9 * ux - 4.5 * uy, e[1] - 9 * uy + 4.5 * ux]];
  /** @type {Vec2[]} */
  const linie = [...punkte.slice(0, i + 1), [e[0] - 6 * ux, e[1] - 6 * uy]];
  return `<polyline points="${linie.map(pt).join(' ')}" fill="none" stroke="${farbe}" stroke-width="2.2" stroke-dasharray="5 4"/>`
    + `<polygon points="${spitze.map(pt).join(' ')}" fill="${farbe}"/>`;
}

/**
 * Weg des Fähnchens von s unter einer Operation, so wie sie wirkt (Bruchkoordinaten):
 * Translation gerade; Drehung als Bogen um den Drehpunkt; Spiegelung senkrecht zur Linie;
 * Gleitspiegelung in zwei Teilen, zuerst gespiegelt (Zwischenbild), dann um die
 * Gleitkomponente parallel zur Linie verschoben. teile: Liste von Punktfolgen;
 * zwischen: { p, op } Zwischenbild der Gleitspiegelung oder null.
 * @param {Op} op @param {Vec2} s @param {Metrik} M @returns {Weg}
 */
export function weg(op, s, M) {
  const ziel = anwenden(op, s);
  const det = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0];
  if (det < 0) {
    const m = spiegelanteil(op);
    if (!m) return { teile: [[s, ziel]], zwischen: null };
    const sm = anwenden(m, s);
    return { teile: [[s, sm], [sm, ziel]], zwischen: { p: sm, op: m } };
  }
  const istT = op.R[0][0] === 1 && op.R[1][1] === 1 && !op.R[0][1] && !op.R[1][0];
  if (istT) return { teile: [[s, ziel]], zwischen: null };
  // Drehpunkt: (I − R) c = t; Bogen kartesisch um den Drehwinkel
  const a = 1 - op.R[0][0]; const b = -op.R[0][1]; const c = -op.R[1][0]; const d = 1 - op.R[1][1];
  const D = a * d - b * c;
  const cc = kart(M, [(d * op.t[0] - b * op.t[1]) / D, (a * op.t[1] - c * op.t[0]) / D]);
  const cs = kart(M, s);
  const K = kartMatrix(M, op.R);
  const theta = Math.atan2(K[1][0], K[0][0]);
  const N = 32;
  const bogen = Array.from({ length: N + 1 }, (_, k) => {
    if (k === N) return ziel;
    const w = (theta * k) / N; const x = cs[0] - cc[0]; const y = cs[1] - cc[1];
    return bruchVon(M, /** @type {Kartesisch<Vec2>} */ ([cc[0] + Math.cos(w) * x - Math.sin(w) * y, cc[1] + Math.sin(w) * x + Math.cos(w) * y]));
  });
  return { teile: [bogen], zwischen: null };
}

/** Marke auf halber Länge eines Weges (Bildpunkte): Kreis mit Buchstabe der Operation. @param {Vec2[][]} teile @param {string} farbe @param {string} papier @param {string} text */
function wegMarke(teile, farbe, papier, text) {
  const pkte = teile.flat();
  const seg = pkte.slice(1).map((q, i) => Math.hypot(q[0] - pkte[i][0], q[1] - pkte[i][1]));
  let rest = seg.reduce((x, y) => x + y, 0) / 2;
  let m = pkte[0];
  for (let i = 0; i < seg.length; i++) {
    if (rest <= seg[i] && seg[i] > 0) { const u = rest / seg[i]; m = [pkte[i][0] + u * (pkte[i + 1][0] - pkte[i][0]), pkte[i][1] + u * (pkte[i + 1][1] - pkte[i][1])]; break; }
    rest -= seg[i];
  }
  return `<circle cx="${f2(m[0])}" cy="${f2(m[1])}" r="10" fill="${papier}" stroke="${farbe}" stroke-width="1.6"/><text x="${f2(m[0])}" y="${f2(m[1] + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="12" font-weight="700" fill="${farbe}" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
}

/**
 * Überlagerung der Erklärung in Tafel A. phase 0: Ausgangsobjekt; 1: zuerst B; 2: dann A;
 * 3: zusammen: C. Die Wege zeigen, wie die Operation wirkt (weg), beschriftet mit dem
 * Buchstaben der Operation; die Stellen des Fähnchens sind nummeriert: 0 Ausgangsobjekt,
 * 1 nach B, 2 nach A (bei einer Erzeugenden: 1 nach C).
 * @param {Gruppe} g @param {Metrik} M @param {Ansicht} A @param {Erklaerung} d @param {number} phase @param {Farben} farben @param {string} form @param {number} n
 */
function erklaerungSVG(g, M, A, d, phase, farben, form, n) {
  if (d.art === 'kopie') return kopieSVG(g, M, A, d, phase, farben, form, n);
  const teile = ['<g class="erklaerung">'];
  const fB = farben.fc3; const fA = farben.fc4; const fC = farben.accent;
  // Elemente: C hervorgehoben, A und B in ihren Farben (Translationen als Pfeil)
  teile.push(opElementSVG(g, d.C, A, fC, farben.paper, n, true));
  if (phase >= 1 && !d.erzeugende) teile.push(opElementSVG(g, d.B, A, fB, farben.paper, n));
  if (phase >= 2 && !d.erzeugende) teile.push(opElementSVG(g, d.A, A, fA, farben.paper, n));
  const s = d.start; const sB = anwenden(d.B, s); const sC = anwenden(d.C, s);
  /** @param {Vec2} p @param {Op} op @param {string} farbe */
  const fahne = (p, op, farbe) => objektSVG(form, A.zuBild(p), kartMatrix(M, op.R), op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0, farbe, farben.paper, 1.15);
  /** @type {Op} */
  const id = { R: [[1, 0], [0, 1]], t: [0, 0] };
  // Weg einer Operation: Zwischenbild blass, Teilwege mit Pfeil, Buchstabe auf halber Länge. Abgeblendet (blass)
  // wird nur der Weg; der Buchstabe bleibt lesbar (Kontrast, Leitfaden Abschn. 5.4, #114).
  /** @param {Weg} w @param {string} farbe @param {string} name @param {boolean} [blass] */
  const wegSVGvon = (w, farbe, name, blass = false) => {
    const bild = w.teile.map((t) => t.map(A.zuBild));
    const weg = `${w.zwischen ? `<g opacity="0.45">${fahne(w.zwischen.p, w.zwischen.op, farbe)}</g>` : ''}${bild.map((t) => wegSVG(t, farbe)).join('')}`;
    return `<g class="weg weg-${name.toLowerCase()}">${blass ? `<g opacity="0.35">${weg}</g>` : weg}${wegMarke(bild, farbe, farben.paper, name)}</g>`;
  };
  // Nummer einer Stelle, links oberhalb des Fähnchens
  /** @param {Vec2} p @param {string} text @param {string} farbe */
  const nummer = (p, text, farbe) => {
    const q = A.zuBild(p); const x = q[0] - 22; const y = q[1] - 20;
    return `<g class="stelle"><circle cx="${f2(x)}" cy="${f2(y)}" r="8.5" fill="${farbe}"/><text x="${f2(x)}" y="${f2(y + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="700" fill="${farben.paper}" text-anchor="middle" dominant-baseline="middle">${text}</text></g>`;
  };
  // in der Gesamtansicht treten die Wege von B und A hinter den Weg unter C zurück
  if (phase >= 1 && !d.erzeugende) teile.push(wegSVGvon(d.wege.B, fB, 'B', phase >= 3));
  if (phase >= 2 && !d.erzeugende) teile.push(wegSVGvon(d.wege.A, fA, 'A', phase >= 3));
  if (phase >= 3) teile.push(wegSVGvon(d.wege.C, fC, 'C'));
  // Fähnchen und Stellen
  teile.push(fahne(s, id, farben.ink));
  const q0 = A.zuBild(s);
  teile.push(`<circle cx="${f2(q0[0])}" cy="${f2(q0[1])}" r="16" fill="none" stroke="${farben.ink}" stroke-width="1.5" stroke-dasharray="3 2.5"/>`);
  teile.push(nummer(s, '0', farben.ink));
  if (phase >= 1 && !d.erzeugende) { teile.push(fahne(sB, d.B, fB)); teile.push(nummer(sB, '1', fB)); }
  if (d.erzeugende ? phase >= 3 : phase >= 2) {
    teile.push(fahne(sC, d.C, d.erzeugende ? fC : fA));
    teile.push(nummer(sC, d.erzeugende ? '1' : '2', d.erzeugende ? fC : fA));
  }
  if (phase >= 3) {
    const qc = A.zuBild(sC);
    teile.push(`<circle cx="${f2(qc[0])}" cy="${f2(qc[1])}" r="18" fill="none" stroke="${fC}" stroke-width="2.2"/>`);
  }
  teile.push('</g>');
  return teile.join('');
}

/**
 * Überlagerung für eine Gitterkopie. phase 0: Ausgangsobjekt; 1: Vorbild V (0 → 1);
 * 2: um t verschoben (0 → 2, 1 → 3); 3: C bringt 2 nach 3.
 * @param {Gruppe} g @param {Metrik} M @param {Ansicht} A @param {ErklaerungKopie} d @param {number} phase @param {Farben} farben @param {string} form @param {number} n
 */
function kopieSVG(g, M, A, d, phase, farben, form, n) {
  const teile = ['<g class="erklaerung">'];
  const fV = farben.fc3; const fT = farben.fc4; const fC = farben.accent;
  teile.push(opElementSVG(g, d.C, A, fC, farben.paper, n, true));
  if (phase >= 1) teile.push(opElementSVG(g, d.V, A, fV, farben.paper, n));
  const s0 = d.start; const s1 = anwenden(d.V, s0); const s2 = anwenden(d.T, s0); const s3 = anwenden(d.T, s1);
  /** @type {Op} */
  const id = { R: [[1, 0], [0, 1]], t: [0, 0] };
  /** @param {Vec2} p @param {Op} op @param {string} farbe */
  const fahne = (p, op, farbe) => objektSVG(form, A.zuBild(p), kartMatrix(M, op.R), op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0, farbe, farben.paper, 1.15);
  // abgeblendet (blass) wird nur der Weg, nicht der Buchstabe (wie in erklaerungSVG)
  /** @param {Weg} w @param {string} farbe @param {string} name @param {string} klasse @param {boolean} [blass] */
  const wegSVGvon = (w, farbe, name, klasse, blass = false) => {
    const bild = w.teile.map((t) => t.map(A.zuBild));
    const weg = `${w.zwischen ? `<g opacity="0.45">${fahne(w.zwischen.p, w.zwischen.op, farbe)}</g>` : ''}${bild.map((t) => wegSVG(t, farbe)).join('')}`;
    return `<g class="weg weg-${klasse}">${blass ? `<g opacity="0.35">${weg}</g>` : weg}${wegMarke(bild, farbe, farben.paper, name)}</g>`;
  };
  /** @param {Vec2} p @param {string} text @param {string} farbe */
  const nummer = (p, text, farbe) => {
    const q = A.zuBild(p); const x = q[0] - 22; const y = q[1] - 20;
    return `<g class="stelle"><circle cx="${f2(x)}" cy="${f2(y)}" r="8.5" fill="${farbe}"/><text x="${f2(x)}" y="${f2(y + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="700" fill="${farben.paper}" text-anchor="middle" dominant-baseline="middle">${text}</text></g>`;
  };
  const abblenden = phase >= 3;
  if (phase >= 1) teile.push(wegSVGvon(d.wege.V, fV, 'V', 'v', abblenden));
  if (phase >= 2) { teile.push(wegSVGvon(d.wege.T0, fT, 't', 't', abblenden)); teile.push(wegSVGvon(d.wege.T1, fT, 't', 't', abblenden)); }
  if (phase >= 3) teile.push(wegSVGvon(d.wege.C, fC, 'C', 'c'));
  teile.push(fahne(s0, id, farben.ink));
  const q0 = A.zuBild(s0);
  teile.push(`<circle cx="${f2(q0[0])}" cy="${f2(q0[1])}" r="16" fill="none" stroke="${farben.ink}" stroke-width="1.5" stroke-dasharray="3 2.5"/>`);
  teile.push(nummer(s0, '0', farben.ink));
  if (phase >= 1) { teile.push(fahne(s1, d.V, fV)); teile.push(nummer(s1, '1', fV)); }
  if (phase >= 2) {
    teile.push(fahne(s2, id, fT)); teile.push(nummer(s2, '2', fT));
    teile.push(fahne(s3, d.V, fT)); teile.push(nummer(s3, '3', fT));
  }
  if (phase >= 3) {
    const q3 = A.zuBild(s3);
    teile.push(`<circle cx="${f2(q3[0])}" cy="${f2(q3[1])}" r="18" fill="none" stroke="${fC}" stroke-width="2.2"/>`);
  }
  teile.push('</g>');
  return teile.join('');
}

/**
 * Tafel B: Muster. Ein quadratischer Ausschnitt des unendlichen Musters, die Elementarzelle
 * hervorgehoben, Symmetrieelemente wahlweise. Nur im Skript (Kap. 8): tapeteElemente zeichnet die Elemente auch über der
 * Tapete, nurZelle nur die Elemente der hervorgehobenen Zelle (wie Tafel A im Modus „Gitter und Basis“).
 * @param {string} id @param {Zustand} z @param {Farben} farben @param {{ k?: number, tapeteElemente?: boolean, nurZelle?: boolean }} [optionen]
 * @returns {{ svg: string, ansicht: Ansicht }}
 */
export function tafelB(id, z, farben, { k = 1, tapeteElemente = false, nurZelle = false } = {}) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const M = metrik(z.gitter[sys]);
  const mitte = kart(M, [0.5, 0.5]);
  // Tapete: ohne Zelle und Elemente, alles in einer Farbe; Ausschnitt und Grösse wie sonst, damit
  // das Umschalten nichts verschiebt (mehr zeigen: Vergrösserung unter 1)
  const tapete = !!z.tapete;
  // Vergrösserung zoomB: kleinerer Ausschnitt, Objekte im selben Verhältnis grösser
  const zoom = z.zoomB ?? 1;
  const w = (MUSTER_BREITE * Math.max(1, z.gitter[sys].ba)) / zoom;
  /** @type {Box} */
  const box = [mitte[0] - w / 2, mitte[1] - w / 2, mitte[0] + w / 2, mitte[1] + w / 2];
  const A = ansicht(M, box, 520, 10);
  const massObjekt = objektMassstab(M, A, z.objGroesse ?? 1, k);
  // Bruchkoordinaten der Ecken des Ausschnitts: ganzzahliger Bereich, der ihn abdeckt, erweitert um
  // die Grösse des Objekts (ein Objekt mit Fuss ausserhalb kann ins Bild ragen)
  const r = (REICHWEITE * massObjekt) / A.s;
  const ext = [bruchVon(M, /** @type {Kartesisch<Vec2>} */ ([r, 0])), bruchVon(M, /** @type {Kartesisch<Vec2>} */ ([0, r]))].reduce((m, v) => Math.max(m, Math.abs(v[0]), Math.abs(v[1])), 0) * 2;
  const ecken = /** @type {Kartesisch<Vec2>[]} */ ([[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]]).map((c) => bruchVon(M, c));
  const lo = Math.floor(Math.min(...ecken.flat()) - ext) - 1; const hi = Math.ceil(Math.max(...ecken.flat()) + ext) + 1;
  const teile = [`<defs><clipPath id="ausschnitt"><rect x="10" y="10" width="500" height="500" rx="6"/></clipPath></defs>`,
    `<rect width="520" height="520" fill="${farben.paper}"/>`, '<g clip-path="url(#ausschnitt)">'];
  if (!tapete) teile.push(`<polygon points="${zellPoly(A, 0, 0)}" fill="${farben.crystal}" fill-opacity="0.35" stroke="${farben.accent}" stroke-width="2"/>`);
  if (z.musterElemente && (!tapete || tapeteElemente)) {
    const e = elementeImBereich(g, 1);
    /** @type {Elementauswahl} */
    const alle = { drehpunkte: [], linien: [] };
    const [i0, i1] = nurZelle ? [0, 1] : [lo, hi];
    for (let i = i0; i < i1; i++) for (let j = i0; j < i1; j++) {
      for (const d of e.drehpunkte) alle.drehpunkte.push({ ...d, punkt: [d.punkt[0] + i, d.punkt[1] + j] });
      for (const l of e.linien) alle.linien.push({ ...l, strecke: /** @type {[Vec2, Vec2]} */ (l.strecke.map((q) => [q[0] + i, q[1] + j])) });
    }
    teile.push(elementeSVG(g, alle, A, farben, z.farben, { k }));
  }
  const einfarbig = tapete ? farben.upper : null;
  teile.push(zeichnungSVG(g, A, z, lo, hi, farben, 0.8, einfarbig, true));
  if (z.objekt) teile.push(objekteSVG(g, M, A, z.punkt, lo, hi, z.form, farben, massObjekt, undefined, tapete ? () => /** @type {string} */ (einfarbig) : null, true));
  teile.push('</g>');
  teile.push(`<rect x="10" y="10" width="500" height="500" rx="6" fill="none" stroke="${farben.line}" stroke-width="1"/>`);
  return { svg: teile.join(''), ansicht: A };
}
