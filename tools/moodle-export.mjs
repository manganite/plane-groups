// Export der Quizfragen als Moodle-XML; die Arbeit macht tools/common/moodle.mjs.
//
//   node tools/moodle-export.mjs [Ausgabedatei] [--entwurf]

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BANK } from '../js/quiz-bank.js';
import { KAPITEL } from '../js/quiz-kapitel.js';
import { GENERATOREN } from '../js/quiz-gen.js';
import { bildInhalt, farbenAus } from '../js/quiz-bild.js';
import { helleFarben, mitSchrift, moodleXML as moodleXMLCommon } from './common/moodle.mjs';

const FONTS = fileURLToPath(new URL('../lib/common/fonts/', import.meta.url));
const col = farbenAus(helleFarben(fileURLToPath(new URL('../lib/common/css/base.css', import.meta.url))));

/** Eigenständige SVG-Datei zu einer Bildangabe (ohne Browser, Farben des hellen Modus); opt.klein für Antwortbilder. */
function bildSVG(angabe, opt = {}) {
  return mitSchrift(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">${bildInhalt(angabe, col, opt) ?? ''}</svg>`, FONTS);
}

export function moodleXML({ entwurf = false } = {}) {
  return moodleXMLCommon({ bank: BANK, generatoren: GENERATOREN, kapitel: KAPITEL, kurs: 'Symmetrie in der Ebene', bildSVG, entwurf });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const entwurf = args.includes('--entwurf');
  const ziel = args.find((a) => !a.startsWith('--')) || 'quiz-moodle.xml';
  const { xml, anzahl } = moodleXML({ entwurf });
  writeFileSync(ziel, xml);
  console.log(`${anzahl} Fragen nach ${ziel} geschrieben${entwurf ? ' (mit Entwürfen)' : ''}.`);
}
