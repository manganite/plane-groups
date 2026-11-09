// Bilder des Quiz aus dem Code der App: eine Bildangabe ist eine Link-Adresse der App („#m=eg&g=p4mm“,
// Tafel A) oder dieselbe mit „B“ davor („B#m=eg&g=p4mm“, Tafel B, das Muster). „@1.8“ am Ende setzt
// die Grösse der Symbole fest („#m=eg&g=p4mm&obj=0@1.8“). Skizzen aus dem Skript, die es in der App
// nicht gibt, heissen „skizze:…“ (SKIZZEN). Die Seite (quiz.js) und der Moodle-Export
// (tools/moodle-export.mjs) zeichnen damit dieselben Bilder.

import { startzustand, hashAnwenden } from './zustand.js';
import { tafelA, tafelB } from './zeichnung.js';
import { strukturTafelA, strukturTafelB } from './struktur.js';
import { ausgeschrieben } from './bahnen.js';
import { dreieck3m, punktgruppe, kachel } from './skizzen.js';

/** @import { Farben } from './zeichnung.js' */
/** @import { BildOptionen } from '../lib/common/js/quiz-core.js' */

/** Skizzen aus dem Skript (viewBox 520 × 400, Kachel 520 × 520): Zeichnung, Höhe ihrer Mitte und Vergrösserung (Standard K_SKIZZE); im Quizbild mittig. @type {Record<string, [(f: Farben) => string, number, number?]>} */
const SKIZZEN = {
  '3m': [dreieck3m, 190],
  '2mm': [(f) => punktgruppe('2mm', f), 200],
  '4mm': [(f) => punktgruppe('4mm', f), 200],
  '6mm': [(f) => punktgruppe('6mm', f), 200],
  'kachel-p2': [(f) => kachel('p2', f, false), 260, 1],
};

/** Farben aus CSS-Variablen ({ paper: '#fff', …, dir1, dir2, dir3, fc0 … fc5 }) in der Form der Tafeln. @param {Record<string, string>} v @returns {Farben & { fc: string[] }} */
export const farbenAus = (v) => ({
  paper: v.paper, ink: v.ink, muted: v.muted, line: v.line, accent: v.accent, accent2: v.accent2,
  upper: v.upper, crystal: v.crystal, dir: [v.dir1, v.dir2, v.dir3], fc3: v.fc3, fc4: v.fc4,
  fc: [0, 1, 2, 3, 4, 5].map((i) => v[`fc${i}`]),
});

/** Grösse der Symbole: Fragebild Tafel A, Antwortbild Tafel A, Muster (Tafel B, auch Fähnchen), Skizzen. In Tafel A folgt das Fähnchen dem Gitter (objektMassstab in zeichnung.js). */
export const K_FRAGE = 1.8;
export const K_ANTWORT = 2;
export const K_MUSTER = 1.15;
const K_SKIZZE = 1.25;

/**
 * Bildangabe → { tafel: 'a' | 'b', hash, k } oder { skizze } (k: Grösse der Symbole oder null).
 * @param {string} angabe
 * @returns {{ skizze: string, hash: string, tafel?: undefined, k?: undefined } | { tafel: 'a' | 'b', hash: string, k: number | null, skizze?: undefined }}
 */
export function zerlege(angabe) {
  if (angabe.startsWith('skizze:')) return { skizze: angabe.slice(7), hash: '' };
  const [rest, gross] = angabe.split('@');
  const b = rest.startsWith('B#');
  return { tafel: b ? 'b' : 'a', hash: b ? rest.slice(1) : rest, k: gross ? Number(gross) : null };
}

/** Gibt es die Skizze? @param {string} name */
export const istSkizze = (name) => Object.hasOwn(SKIZZEN, name);

/** Link-Adresse der App zu einer Bildangabe (für „In der App öffnen“; leer bei Skizzen). @param {string} angabe */
export const appAdresse = (angabe) => zerlege(angabe).hash;

/**
 * Inhalt eines SVG (viewBox 0 0 520 520) zu einer Bildangabe. opt.klein: Antwortbild, Symbole grösser.
 * Gibt null zurück, wenn die Link-Adresse keinen Modus enthält.
 * @param {string} angabe @param {Farben} f @param {BildOptionen} [opt]
 * @returns {string | null}
 */
export function bildInhalt(angabe, f, opt = {}) {
  const { tafel, hash, k: gross, skizze } = zerlege(angabe);
  if (skizze) {
    if (!istSkizze(skizze)) return null;
    const [zeichne, mitte, k = K_SKIZZE] = SKIZZEN[skizze];
    return `<rect width="520" height="520" fill="${f.paper}"/><g transform="translate(260 260) scale(${k}) translate(-260 -${mitte})">${zeichne(f)}</g>`;
  }
  const z = startzustand();
  if (!hashAnwenden(z, hash)) return null;
  if (z.modus === 'struktur') {
    const st = ausgeschrieben(z.struktur); // mit festgehaltener Gruppe (sg=) die Bahnen ausgeschrieben, wie in der App
    const a = strukturTafelA(st, { elemente: st.elemente, zelle: st.zelle, ae: st.ae, bindungen: st.bindungen, farben: false, k: gross ?? K_FRAGE }, f);
    return tafel === 'b' ? strukturTafelB(st, f, a.ergebnis, z.zoomB).svg : a.svg;
  }
  // Tafel A: Symbole in allen Fragebildern gleich gross (K_FRAGE), in Antwortbildern grösser; das Fähnchen
  // im selben Verhältnis zur Zelle wie in der App. Tafel B (Muster): eigene, kleinere Grösse für Symbole
  // und Fähnchen, damit sich die Fähnchen nicht überdecken
  if (tafel === 'b') return tafelB(z.gruppe, z, f, { k: gross ?? K_MUSTER }).svg;
  return tafelA(z.gruppe, z, f, { k: gross ?? (opt.klein ? K_ANTWORT : K_FRAGE) }).svg;
}
