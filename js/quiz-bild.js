// Bilder des Quiz aus dem Code der App: eine Bildangabe ist eine Link-Adresse der App („#m=eg&g=p4mm“,
// Tafel A) oder dieselbe mit „B“ davor („B#m=eg&g=p4mm“, Tafel B, das Muster). Die Seite (quiz.js) und
// der Moodle-Export (tools/moodle-export.mjs) zeichnen damit dieselben Bilder.

import { startzustand, hashAnwenden } from './zustand.js';
import { tafelA, tafelB } from './zeichnung.js';
import { strukturTafelA, strukturTafelB } from './struktur.js';

/** Farben aus CSS-Variablen ({ paper: '#fff', …, dir1, dir2, dir3, fc0 … fc5 }) in der Form der Tafeln. */
export const farbenAus = (v) => ({
  paper: v.paper, ink: v.ink, muted: v.muted, line: v.line, accent: v.accent, accent2: v.accent2,
  upper: v.upper, crystal: v.crystal, dir: [v.dir1, v.dir2, v.dir3], fc3: v.fc3, fc4: v.fc4,
  fc: [0, 1, 2, 3, 4, 5].map((i) => v[`fc${i}`]),
});

/** Bildangabe → { tafel: 'a' | 'b', hash }. */
export function zerlege(angabe) {
  const b = angabe.startsWith('B#');
  return { tafel: b ? 'b' : 'a', hash: b ? angabe.slice(1) : angabe };
}

/** Link-Adresse der App zu einer Bildangabe (für „In der App öffnen“). */
export const appAdresse = (angabe) => zerlege(angabe).hash;

/**
 * Inhalt eines SVG (viewBox 0 0 520 520) zu einer Bildangabe. opt.klein: Antwortbild, Symbole grösser.
 * Gibt null zurück, wenn die Link-Adresse keinen Modus enthält.
 */
export function bildInhalt(angabe, f, opt = {}) {
  const { tafel, hash } = zerlege(angabe);
  const z = startzustand();
  if (!hashAnwenden(z, hash)) return null;
  if (z.modus === 'struktur') {
    const st = z.struktur;
    const a = strukturTafelA(st, { elemente: st.elemente, zelle: st.zelle, ae: st.ae, bindungen: st.bindungen, farben: false }, f);
    return tafel === 'b' ? strukturTafelB(st, f, a.ergebnis).svg : a.svg;
  }
  const k = opt.klein ? 2 : 1.3;
  return tafel === 'b' ? tafelB(z.gruppe, z, f, { k: 1 + (k - 1) * 0.5 }).svg : tafelA(z.gruppe, z, f, { k }).svg;
}
