// Quiz der Symmetrie in der Ebene: Fragen, Kapitel und Bilder. Ablauf, Rückmeldung und Fortschritt kommen aus
// lib/common/js/quiz-seite.js.

import { initQuiz } from '../lib/common/js/quiz-seite.js';
import { versionEintragen, offline } from '../lib/common/js/seite.js';
import { VERSION } from './version.js';
import { BANK } from './quiz-bank.js';
import { KAPITEL, SPEICHER } from './quiz-kapitel.js';

const farbe = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

/** Bild zu einer Bildangabe (hier: Link-Adresse der App) als SVG; opt.klein für Antwortbilder. */
function bild(angabe, alt) {
  const pts = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) pts.push(`<circle cx="${260 + 70 * i}" cy="${260 + 70 * j}" r="6" fill="${farbe('ink')}"/>`);
  return `<svg viewBox="0 0 520 520" role="img" aria-label="${alt || 'Abbildung'}"><rect width="520" height="520" fill="${farbe('paper')}"/>${pts.join('')}</svg>`;
}

versionEintragen(VERSION);
initQuiz({ bank: BANK, generatoren: [], kapitel: KAPITEL, speicher: SPEICHER, bild });
offline();
