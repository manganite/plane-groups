// Motive für den Modus „Gitter und Basis“ (Konzept §3.2): je eine Form mit eigener Symmetrie.
// Ein Motiv besteht aus Punkten (lokal, kartesisch, Radius etwa 1) mit Art; diese Punkte gehen in
// die Symmetriebestimmung (bestimmung.js) ein, ihre Symmetrie ist die des Motivs. Gezeichnet wird
// die Form (Polygon, Stäbchen, Kreis oder Fähnchen) aus denselben Koordinaten.
//
// Lokale Koordinaten: x nach rechts, y nach unten (wie das Bild); Drehung im Uhrzeigersinn.

import { metrik, bruchVon, ORNAMENT_EINHEIT, ornamentMitte } from './zeichnung.js';

/** @import { Vec2, Grad, Kartesisch } from '../lib/common/js/typen.js' */
/**
 * Motiv (siehe MOTIVE).
 * @typedef {{ name: string, symmetrie: string, groesse: number, punkte: [number, number, string][], form: 'polygon' | 'stab' | 'kreis' | 'fahne' | 'ornament', deckkraft?: number, ornament?: string }} Motiv
 */
/**
 * Eintrag der Basis: Motiv an der Lage p (Bruchkoordinaten), gedreht um winkel (Grad), mit
 * eigener Grösse und Farbe (Nummer). spiegel: an der eigenen y-Achse gespiegelt, vor der Drehung;
 * nur bei chiralen Motiven (chiral()), sonst fehlt das Feld (die übrigen sind zu dieser Achse symmetrisch).
 * @typedef {{ motiv: string, p: Vec2, winkel?: Grad, groesse?: number, farbe?: number, spiegel?: true }} Basiseintrag
 */
/** Struktur im Modus „Gitter und Basis“. @typedef {import('./zeichnung.js').Gitter & { basis: Basiseintrag[], bindungen?: boolean }} Struktur */

/** Lokaler Punkt eines Motivs: x, y, Art. @typedef {[number, number, string]} Motivpunkt */

/** @param {number} g */
const rad = (g) => (g * Math.PI) / 180;
/** @param {number} r @param {number} w @returns {[number, number]} */
const polar = (r, w) => [r * Math.cos(rad(w)), r * Math.sin(rad(w))];

/** Windrad mit n Flügeln: Symmetrie n (Drehungen), keine Spiegelung (Flügel schief). @param {number} n */
function windrad(n) {
  /** @type {Motivpunkt[]} */
  const pts = [];
  for (let k = 0; k < n; k++) {
    const w = (360 * k) / n;
    pts.push([...polar(1, w), 'w'], [...polar(0.62, w + 32), 'w'], [...polar(0.3, w + 75), 'w']);
  }
  return pts;
}
/** Regelmässiges n-Eck: Symmetrie nmm (bzw. 3m). @param {number} n @param {number} [start] @returns {Motivpunkt[]} */
const vieleck = (n, start = -90) => Array.from({ length: n }, (_, k) => [...polar(1, start + (360 * k) / n), 'e']);

/**
 * Kennzeichnende Punkte eines Ornaments (#104) aus Punkten auf seinen Pfaden (Bildpunkte, Fuss im Ursprung; Anfang, Ende
 * oder Mitte t = ½ eines Bézier-Abschnitts, nicht dessen Kontrollpunkte; tests/struktur.test.mjs misst den Abstand), in lokalen
 * Koordinaten um die Mitte des Ornaments. Jeder Punkt hat eine eigene Art: Eine Symmetrie müsste jeden Punkt auf sich
 * selbst abbilden, und das tut bei drei Punkten, die nicht auf einer Geraden liegen, nur die Identität. Ein Ornament
 * hat also keine eigene Symmetrie (tests/struktur.test.mjs prüft es für jedes).
 * @param {string} ornament @param {Vec2[]} px @returns {Motivpunkt[]}
 */
function ornamentPunkte(ornament, px) {
  const [mx, my] = ornamentMitte(ornament);
  return px.map(([x, y], k) => [(x - mx) / ORNAMENT_EINHEIT, (y - my) / ORNAMENT_EINHEIT, `o${k}`]);
}

/**
 * Motive: name, symmetrie (Punktgruppe der Ebene), groesse (Standard, kartesisch bei |a| = 1),
 * punkte (lokal, mit Art), form ('polygon' | 'stab' | 'kreis' | 'fahne' | 'ornament'; bei einem Ornament sagt
 * `ornament`, welches aus ORNAMENTE in zeichnung.js), deckkraft (Füllung, Standard 0,9).
 * @type {Record<string, Motiv>}
 */
export const MOTIVE = {
  atom: { name: 'Atom', symmetrie: '∞m', groesse: 0.045, punkte: [[0, 0, 'a']], form: 'kreis' },
  fahne: {
    name: 'Fähnchen', symmetrie: '1', groesse: 0.1, form: 'fahne',
    punkte: [[0, 0, 'f0'], [0, -2, 'f1'], [0.85, -1.6, 'f2'], [0, -1.2, 'f3']], // Fuss im Ursprung (die Lage), wie die Form des Objekts in „Ebenengruppen“
  },
  // Ornamente (#104): chiral wie das Fähnchen; die Pfade stehen in ORNAMENTE (zeichnung.js), eine lokale Einheit
  // sind ORNAMENT_EINHEIT Bildpunkte der Pfade (das Ornament ist etwa zwei Einheiten hoch)
  blatt: { name: 'Blatt', symmetrie: '1', groesse: 0.1, form: 'ornament', ornament: 'blatt', punkte: ornamentPunkte('blatt', [[0, 0], [4, -9], [13, -26], [2.875, -18.625]]) },
  tropfen: { name: 'Tropfen', symmetrie: '1', groesse: 0.1, form: 'ornament', ornament: 'tropfen', punkte: ornamentPunkte('tropfen', [[0, -1], [-6.75, -10.5], [0, -20], [8.375, -16.5], [9, 2]]) },
  ranke: { name: 'Ranke', symmetrie: '1', groesse: 0.1, form: 'ornament', ornament: 'ranke', punkte: ornamentPunkte('ranke', [[0, 0], [11, -17], [15, -9], [3, -10], [-3, -21]]) },
  w2: { name: 'Windrad 2', symmetrie: '2', groesse: 0.1, punkte: windrad(2), form: 'polygon' },
  dreieck: { name: 'Dreieck (gleichschenklig)', symmetrie: 'm', groesse: 0.12, punkte: [[0, -1, 's'], [0.7, 0.6, 'e'], [-0.7, 0.6, 'e']], form: 'polygon' },
  // Insel: abgerundetes Stäbchen wie die Nanomagnete künstlicher Spin-Eis- und Toroidal-Gitter (Länge : Breite
  // etwa 3 : 1, vgl. J. Lehmann, Toroidal Order in Magnetic Metamaterials, Springer Theses 2022, Abb. 6.2, S. 118:
  // 450 × 150 nm²); Punkte an den Enden und Seiten wie bisher
  insel: { name: 'Insel (länglich)', symmetrie: '2mm', groesse: 0.15, punkte: [[1, 0, 'e'], [0, 0.32, 's'], [-1, 0, 'e'], [0, -0.32, 's']], form: 'stab' },
  w3: { name: 'Windrad 3', symmetrie: '3', groesse: 0.1, punkte: windrad(3), form: 'polygon' },
  dreieck3: { name: 'Dreieck (gleichseitig)', symmetrie: '3m', groesse: 0.1, punkte: vieleck(3), form: 'polygon' },
  w4: { name: 'Windrad 4', symmetrie: '4', groesse: 0.1, punkte: windrad(4), form: 'polygon' },
  quadrat: { name: 'Quadrat', symmetrie: '4mm', groesse: 0.09, punkte: vieleck(4, -45), form: 'polygon' },
  w6: { name: 'Windrad 6', symmetrie: '6', groesse: 0.1, punkte: windrad(6), form: 'polygon' },
  sechseck: { name: 'Sechseck', symmetrie: '6mm', groesse: 0.1, punkte: vieleck(6, 0), form: 'polygon' },
  // Ziegel im Format 2 : 1 mit Fuge: 1,9 × 0,9 Einheiten in einem Raster von 2 × 1 (Kap. 7);
  // heller gefüllt, damit die Symmetrieelemente auf den grossen Flächen sichtbar bleiben
  ziegel: { name: 'Ziegel', symmetrie: '2mm', groesse: 0.12, deckkraft: 0.45, punkte: [[1, 0.9 / 1.9, 'e'], [-1, 0.9 / 1.9, 'e'], [-1, -0.9 / 1.9, 'e'], [1, -0.9 / 1.9, 'e']], form: 'polygon' },
};

/**
 * Zeilen der Motivauswahl (Konzept „Muster entwerfen“, Abschn. 2, Punkt 1): die Motive nach ihrer eigenen Symmetrie. Ein
 * Motiv erscheint auf einer speziellen Lage nur dann einmal, wenn es deren Lagesymmetrie hat; die Zeilen zeigen,
 * welches Motiv wohin passt (tests/struktur.test.mjs prüft sie gegen `symmetrie`).
 * @type {{ name: string, motive: string[] }[]}
 */
export const MOTIVZEILEN = [
  { name: 'Atom', motive: ['atom'] },
  { name: 'Ohne Eigensymmetrie', motive: ['fahne', 'blatt', 'tropfen', 'ranke'] },
  { name: 'Nur Drehsymmetrie', motive: ['w2', 'w3', 'w4', 'w6'] },
  { name: 'Mit Spiegelsymmetrie', motive: ['dreieck', 'ziegel', 'insel', 'dreieck3', 'quadrat', 'sechseck'] },
];

/**
 * Chirales Motiv: seine eigene Symmetrie hat keine Spiegellinie, das Spiegelbild ist ein anderes Motiv
 * (Fähnchen, Ornamente, Windräder). Nur bei ihnen wirkt „gespiegelt“.
 * @param {string} motiv
 */
export const chiral = (motiv) => !MOTIVE[motiv].symmetrie.includes('m');

/**
 * Lokale Punkte eines Basiseintrags, gespiegelt (an der eigenen y-Achse, x → −x), gedreht und skaliert (kartesisch).
 * @param {Pick<Basiseintrag, 'motiv' | 'winkel' | 'groesse' | 'spiegel'>} e @returns {{ c: Kartesisch<Vec2>, art: string }[]}
 */
export function motivKart(e) {
  return MOTIVE[e.motiv].punkte.map(([u, v, art]) => ({ c: lokalKart(e, [u, v]), art }));
}

/**
 * Ein lokaler Punkt des Motivs (nicht nur einer der Punkte aus MOTIVE), gespiegelt, gedreht und skaliert wie in motivKart().
 * @param {Pick<Basiseintrag, 'motiv' | 'winkel' | 'groesse' | 'spiegel'>} e @param {Vec2} q @returns {Kartesisch<Vec2>}
 */
export function lokalKart(e, [u0, v]) {
  const s = e.groesse ?? MOTIVE[e.motiv].groesse;
  const c = Math.cos(rad(e.winkel ?? 0)); const n = Math.sin(rad(e.winkel ?? 0));
  const u = (e.spiegel ? -1 : 1) * u0;
  return /** @type {Kartesisch<Vec2>} */ ([s * (c * u - n * v), s * (n * u + c * v)]);
}

/**
 * Punkte der Struktur für bestimme(): je Motiv seine Punkte in Bruchkoordinaten der Zelle, mit
 * Art aus Farbe, Motiv und Punktart (verschiedene Farben = verschiedene Atomsorten).
 * @param {Struktur} st
 * @returns {{ p: Vec2, art: string }[]}
 */
export function strukturPunkte(st) {
  const M = metrik({ ba: st.ba, gamma: st.gamma });
  /** @type {{ p: Vec2, art: string }[]} */
  const out = [];
  for (const e of st.basis) {
    for (const q of motivKart(e)) {
      const f = bruchVon(M, q.c);
      out.push({ p: [e.p[0] + f[0], e.p[1] + f[1]], art: `${e.farbe ?? 0}|${e.motiv}|${q.art}` });
    }
  }
  return out;
}
