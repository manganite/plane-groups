// Motive für den Modus „Gitter und Basis“ (Konzept §3.2): je eine Form mit eigener Symmetrie.
// Ein Motiv besteht aus Punkten (lokal, kartesisch, Radius etwa 1) mit Art; diese Punkte gehen in
// die Symmetriebestimmung (bestimmung.js) ein, ihre Symmetrie ist die des Motivs. Gezeichnet wird
// die Form (Polygon, Ellipse, Kreis oder Fähnchen) aus denselben Koordinaten.
//
// Lokale Koordinaten: x nach rechts, y nach unten (wie das Bild); Drehung im Uhrzeigersinn.

import { metrik, bruchVon } from './zeichnung.js';

/** @import { Vec2, Grad, Kartesisch } from '../lib/common/js/typen.js' */
/**
 * Motiv (siehe MOTIVE).
 * @typedef {{ name: string, symmetrie: string, groesse: number, punkte: [number, number, string][], form: 'polygon' | 'ellipse' | 'kreis' | 'fahne', deckkraft?: number }} Motiv
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
 * Motive: name, symmetrie (Punktgruppe der Ebene), groesse (Standard, kartesisch bei |a| = 1),
 * punkte (lokal, mit Art), form ('polygon' | 'ellipse' | 'kreis' | 'fahne'), deckkraft (Füllung, Standard 0,9).
 * @type {Record<string, Motiv>}
 */
export const MOTIVE = {
  atom: { name: 'Atom', symmetrie: '∞m', groesse: 0.045, punkte: [[0, 0, 'a']], form: 'kreis' },
  fahne: {
    name: 'Fähnchen', symmetrie: '1', groesse: 0.1, form: 'fahne',
    punkte: [[0, 1, 'f0'], [0, -1, 'f1'], [0.85, -0.6, 'f2'], [0, -0.2, 'f3']],
  },
  w2: { name: 'Windrad 2', symmetrie: '2', groesse: 0.1, punkte: windrad(2), form: 'polygon' },
  dreieck: { name: 'Dreieck (gleichschenklig)', symmetrie: 'm', groesse: 0.12, punkte: [[0, -1, 's'], [0.7, 0.6, 'e'], [-0.7, 0.6, 'e']], form: 'polygon' },
  insel: { name: 'Insel (länglich)', symmetrie: '2mm', groesse: 0.15, punkte: [[1, 0, 'e'], [0, 0.32, 's'], [-1, 0, 'e'], [0, -0.32, 's']], form: 'ellipse' },
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
 * Chirales Motiv: seine eigene Symmetrie hat keine Spiegellinie, das Spiegelbild ist ein anderes Motiv
 * (Fähnchen, Windräder). Nur bei ihnen wirkt „gespiegelt“.
 * @param {string} motiv
 */
export const chiral = (motiv) => !MOTIVE[motiv].symmetrie.includes('m');

/**
 * Lokale Punkte eines Basiseintrags, gespiegelt (an der eigenen y-Achse, x → −x), gedreht und skaliert (kartesisch).
 * @param {Pick<Basiseintrag, 'motiv' | 'winkel' | 'groesse' | 'spiegel'>} e @returns {{ c: Kartesisch<Vec2>, art: string }[]}
 */
export function motivKart(e) {
  const d = MOTIVE[e.motiv];
  const s = e.groesse ?? d.groesse;
  const c = Math.cos(rad(e.winkel ?? 0)); const n = Math.sin(rad(e.winkel ?? 0));
  const sx = e.spiegel ? -1 : 1;
  return d.punkte.map(([u0, v, art]) => { const u = sx * u0; return { c: /** @type {Kartesisch<Vec2>} */ ([s * (c * u - n * v), s * (n * u + c * v)]), art }; });
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
