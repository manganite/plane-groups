// Schreibweise der Kenndaten wie in ITA: Koordinaten mit Querstrich und Brüchen, Operationen,
// Lagesymmetrie. Ohne DOM (Tests in Node).

import { blickrichtung } from './zeichnung.js';
import { SYMMETRIERICHTUNGEN } from './ebenengruppen.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Farben } from './zeichnung.js' */
/** @import { System } from './ebenengruppen.js' */

/** @type {Record<string, string>} */
const BRUECHE = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/6': '⅙', '5/6': '⅚' };

/** Bruch als Zeichen („1/4“ → „¼“), sonst unverändert. @param {string} s */
export const bruchZeichen = (s) => BRUECHE[s] ?? s;

/**
 * Koordinatenpaar in ITA-Schreibweise als HTML (Variablen kursiv): Ein Minus am Anfang einer
 * Koordinate wird zum Querstrich, sonst bleibt es ein Rechenzeichen. „-x+1/2,y“ → x̄+½, y;
 * „-x+y,x-y“ → x̄+y, x−y; „-2x,-x“ → 2x̄, x̄ (wie in ITA).
 * @param {string} s
 */
export function koordHTML(s) {
  /** @param {string} t */
  const teil = (t) => {
    let out = '';
    const m = t.match(/^-(\d*)([xy])(.*)$/);
    let rest = t;
    if (m) { out = `${m[1]}<span class="ov"><i>${m[2]}</i></span>`; rest = m[3]; }
    out += rest.replace(/(\d+\/\d+)|([xy])|(-)/g, (/** @type {string} */ x, /** @type {string | undefined} */ br, /** @type {string | undefined} */ v, /** @type {string | undefined} */ minus) => {
      if (br) return bruchZeichen(br);
      if (v) return `<i>${v}</i>`;
      return minus ? '−' : x;
    });
    return out;
  };
  return `<span class="koord">${s.split(',').map(teil).join(', ')}</span>`;
}

/** Operation wie in ITA „Symmetry operations“ als HTML: „4+ 0,0“ → 4⁺ 0, 0; „m 1/4,y“ → m ¼, y. @param {string} s */
export function opHTML(s) {
  if (s === '1') return '1';
  const m = s.match(/^(t|g)\(([^)]*)\)(?:\s+(.*))?$/);
  if (m) {
    const vek = m[2].split(',').map(bruchZeichen).join(', ');
    return m[1] === 't' ? `<i>t</i>(${vek})` : `<i>g</i>(${vek}) ${koordHTML(m[3])}`;
  }
  const [sym, ort] = s.split(' ');
  const symHTML = sym.replace(/^(\d)([+-])$/, (/** @type {string} */ x, /** @type {string} */ n, /** @type {string} */ v) => `${n}<sup>${v === '+' ? '+' : '−'}</sup>`)
    .replace(/^([mabg])$/, '<i>$1</i>');
  return `${symHTML} ${koordHTML(ort)}`;
}

/** Orientierte Lagesymmetrie („.m.“, „2mm.“) als HTML mit kursivem m. */
/** @param {string} s */
export const lageHTML = (s) => `<span class="koord">${s.replace(/m/g, '<i>m</i>')}</span>`;

/** Hermann-Mauguin-Symbol einer Ebenengruppe oder Punktgruppe, Buchstaben kursiv. */
/** @param {string} s */
export const symbolHTML = (s) => s.replace(/([a-z])/g, '<i>$1</i>');

/**
 * Dezimalzahl in deutscher Schreibweise: Komma, echtes Minuszeichen, n Nachkommastellen
 * (fest; mit kuerzen: true ohne Nullen am Ende). dezimal(-0.5, 2) → „−0,50“.
 */
/** @param {number} v @param {number} [n] @param {{ kuerzen?: boolean }} [optionen] @returns {string} */
export function dezimal(v, n = 2, { kuerzen = false } = {}) {
  let t = v.toFixed(n);
  if (kuerzen && t.includes('.')) t = t.replace(/0+$/, '').replace(/\.$/, '');
  if (/^-0(\.0*)?$/.test(t)) t = t.slice(1); // keine „−0“
  return t.replace('.', ',').replace(/^-/, '−');
}

/** Zahl als Bruch mit kleinem Nenner, wenn sie einer ist, sonst als Dezimalzahl mit bis zu drei Stellen. @param {number} v */
export function zahlText(v) {
  for (const n of [1, 2, 3, 4, 6, 8, 12]) {
    const z = Math.round(v * n);
    if (Math.abs(v - z / n) < 1e-9) {
      if (n === 1) return String(z).replace(/^-/, '−');
      return `${z < 0 ? '−' : ''}${bruchZeichen(`${Math.abs(z)}/${n}`)}`;
    }
  }
  return dezimal(v, 3, { kuerzen: true });
}

/**
 * Richtung [uv] als HTML, negative Indizes mit Querstrich wie in der Kristallographie üblich:
 * [-1, 1] → [1̄1] (Querstrich als .ov, nicht als Minuszeichen).
 */
/** @param {readonly number[]} d */
export const richtungHTML = (d) => `[${d.map((x) => (x < 0 ? `<span class="ov">${-x}</span>` : String(x))).join('')}]`;

/**
 * Einträge der Legende für „Nach Blickrichtung färben“: je Position im Hermann-Mauguin-Symbol (2, 3), an der
 * Linien der Gruppe stehen, die Farbe und die Richtungen der Normalen. Im schiefwinkligen System ohne Einträge.
 * Gemeinsam für „Ebenengruppen“ (main.js) und „Gitter und Basis“ (struktur-ui.js).
 * @param {System} system @param {readonly { normale: Vec2 }[]} linien @param {Farben} farben
 * @returns {string[]}
 */
export function richtungenLegende(system, linien, farben) {
  if (system === 'schiefwinklig') return [];
  const positionen = new Set(linien.map((l) => blickrichtung(system, l.normale)));
  return [2, 3].filter((pos) => positionen.has(pos)).map((pos) => `<span class="lg"><i class="sw" style="background:${farben.dir[pos - 1]}"></i><span>Normale ∥ ${SYMMETRIERICHTUNGEN[system][pos - 2].map(richtungHTML).join(', ')}</span></span>`);
}

/**
 * Koordinaten als „(x, y)“. Enthält eine Koordinate ein Dezimalkomma, trennt ein Strichpunkt:
 * „(0,12; 0,31)“, sonst ein Komma wie in ITA: „(½, ¼)“.
 */
/** @param {readonly number[]} werte @returns {string} */
export function koordText(werte) {
  const t = werte.map(zahlText);
  return `(${t.join(t.some((x) => x.includes(',')) ? '; ' : ', ')})`;
}
