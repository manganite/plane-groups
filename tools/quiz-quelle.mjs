// @ts-nocheck -- Typprüfung folgt in Schritt 2 (crystallography-common#19)
// Quelle der Quizfragen dieser App für die gemeinsame Fragenliste der App-Familie
// (crystallography-common, fragenliste/extract.mjs): Fragen, Generatoren, Kapitel und die Bilder,
// gezeichnet mit demselben Code wie im Quiz und im Moodle-Export.
import { fileURLToPath } from 'node:url';
import { BANK } from '../js/quiz-bank.js';
import { GENERATOREN } from '../js/quiz-gen.js';
import { KAPITEL } from '../js/quiz-kapitel.js';
import { bildInhalt, farbenAus, appAdresse } from '../js/quiz-bild.js';
import { helleFarben } from './common/moodle.mjs';

export function quizQuelle() {
  const col = farbenAus(helleFarben(fileURLToPath(new URL('../lib/common/css/base.css', import.meta.url))));
  const bild = (angabe, opt = {}) => {
    if (!angabe) return null;
    const inhalt = bildInhalt(angabe, col, opt);
    return inhalt ? `<svg viewBox="0 0 520 520">${inhalt}</svg>` : null;
  };
  return {
    app: 'plane-groups', titel: 'Symmetrie in der Ebene', kurz: 'Ebene',
    kapitel: KAPITEL, bank: BANK, generatoren: GENERATOREN,
    bild, adresse: (angabe) => (angabe ? appAdresse(angabe) : null),
  };
}
