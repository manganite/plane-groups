// Quiz der Symmetrie in der Ebene: Fragen, Kapitel und Bilder. Ablauf, Rückmeldung und Fortschritt kommen aus
// lib/common/js/quiz-seite.js (gemeinsam mit den anderen Apps der Familie).

import { initQuiz } from '../lib/common/js/quiz-seite.js';
import { versionEintragen, offline } from '../lib/common/js/seite.js';
import { VERSION } from './version.js';
import { BANK } from './quiz-bank.js';
import { GENERATOREN } from './quiz-gen.js';
import { KAPITEL, SPEICHER } from './quiz-kapitel.js';
import { bildInhalt, farbenAus } from './quiz-bild.js';

const NAMEN = ['paper', 'ink', 'muted', 'line', 'accent', 'accent2', 'upper', 'crystal', 'dir1', 'dir2', 'dir3', 'fc0', 'fc1', 'fc2', 'fc3', 'fc4', 'fc5'];
const farben = () => {
  const st = getComputedStyle(document.documentElement);
  return farbenAus(Object.fromEntries(NAMEN.map((n) => [n, st.getPropertyValue(`--${n}`).trim()])));
};

/** Bild zu einer Bildangabe (Link-Adresse der App, „B#…“ für das Muster) als SVG; opt.klein für Antwortbilder. */
function bild(angabe, alt, opt = {}) {
  return `<svg viewBox="0 0 520 520" role="img" aria-label="${alt || 'Abbildung'}">${bildInhalt(angabe, farben(), opt) ?? ''}</svg>`;
}

versionEintragen(VERSION);
initQuiz({ bank: BANK, generatoren: GENERATOREN, kapitel: KAPITEL, speicher: SPEICHER, bild });
offline();
