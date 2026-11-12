// Daten der Hilfeseite (Leitfaden Abschn. 5.3): Modi der App, Erste Schritte als Anleitungen, Experimente als Liste.
// Texte in js/hilfetexte.js, erzeugte Experimente in js/experimente.js, Mechanik in lib/common/js/hilfe-seite.js.
// Bilder: node tools/common/hilfe-bilder.mjs (schreibt hilfe/<Ablauf>-<Nr>.png), geprüft in tests/common.test.mjs.

import { ERSTE_SCHRITTE, ABLAEUFE } from './hilfetexte.js';
import { ERZEUGTE } from './experimente.js';

/** @import { HilfeDaten } from '../lib/common/js/hilfe-seite.js' */
/** @import { Experiment } from '../lib/common/js/ablauf.js' */

/** Lage der erzeugten Aufgaben zur Zähligkeit: direkt nach „Allgemeine und spezielle Lage“ (Reihenfolge des Skripts). */
const nachLage = ABLAEUFE.findIndex((x) => x.id === 'lage') + 1;

/** Alle Experimente in der Reihenfolge der Liste (App und Hilfeseite). @type {Experiment[]} */
export const EXPERIMENTE = [...ABLAEUFE.slice(0, nachLage), ...ERZEUGTE, ...ABLAEUFE.slice(nachLage)];

/** Modi: Kennung, Name wie auf dem Tab, Link-Adresse, die ihn wählt. @type {HilfeDaten} */
export const HILFE = {
  modi: [
    { id: 'eg', name: 'Ebenengruppen', hash: '#m=eg' },
    { id: 'struktur', name: 'Gitter und Basis', hash: '#m=struktur' },
    { id: 'entwurf', name: 'Muster entwerfen', hash: '#m=entwurf' },
  ],
  ersteSchritte: ERSTE_SCHRITTE,
  experimente: EXPERIMENTE,
};
