// Export der Quizfragen als Moodle-XML; die Arbeit macht tools/common/moodle.mjs.
//
//   node tools/moodle-export.mjs [Ausgabedatei] [--entwurf]

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BANK } from '../js/quiz-bank.js';
import { KAPITEL } from '../js/quiz-kapitel.js';
import { helleFarben, mitSchrift, moodleXML as moodleXMLCommon } from './common/moodle.mjs';

const FONTS = fileURLToPath(new URL('../lib/common/fonts/', import.meta.url));
const col = helleFarben(fileURLToPath(new URL('../lib/common/css/base.css', import.meta.url)));

/** Eigenständige SVG-Datei zu einer Bildangabe (ohne Browser, Farben des hellen Modus). */
function bildSVG(angabe) {
  const pts = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) pts.push(`<circle cx="${260 + 70 * i}" cy="${260 + 70 * j}" r="6" fill="${col.ink}"/>`);
  return mitSchrift(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520"><rect width="520" height="520" fill="${col.paper}"/>${pts.join('')}</svg>`, FONTS);
}

export function moodleXML({ entwurf = false } = {}) {
  return moodleXMLCommon({ bank: BANK, generatoren: [], kapitel: KAPITEL, kurs: 'Symmetrie in der Ebene', bildSVG, entwurf });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const entwurf = args.includes('--entwurf');
  const ziel = args.find((a) => !a.startsWith('--')) || 'quiz-moodle.xml';
  const { xml, anzahl } = moodleXML({ entwurf });
  writeFileSync(ziel, xml);
  console.log(`${anzahl} Fragen nach ${ziel} geschrieben${entwurf ? ' (mit Entwürfen)' : ''}.`);
}
