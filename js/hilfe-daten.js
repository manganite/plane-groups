// Daten der Hilfeseite (Leitfaden Abschn. 5.3): Zweck, Modi, Bedienkonzepte, Bereiche zum Nachschlagen, Anleitungen
// (Erste Schritte und weitere), Experimente, typische Fragen. Texte in js/hilfe-anleitung.js und js/hilfetexte.js,
// erzeugte Experimente in js/experimente.js, gemeinsame Texte und Mechanik in lib/common/js/hilfe-gemeinsam.js und
// hilfe-seite.js. Bilder: node tools/common/hilfe-bilder.mjs (schreibt hilfe/), geprüft in tests/common.test.mjs.

import { ERSTE_SCHRITTE, ABLAEUFE } from './hilfetexte.js';
import { ZWECK, MODI_ZWECK, KONZEPTE, BEREICHE, ANLEITUNGEN, FRAGEN, ERGAENZUNGEN } from './hilfe-anleitung.js';
import { ERZEUGTE } from './experimente.js';
import { KAPITEL } from './quiz-kapitel.js';

/** @import { HilfeDaten } from '../lib/common/js/hilfe-seite.js' */
/** @import { Experiment } from '../lib/common/js/ablauf.js' */

/** Lage der erzeugten Aufgaben zur Zähligkeit: direkt nach „Allgemeine und spezielle Lage“ (Reihenfolge des Skripts). */
const nachLage = ABLAEUFE.findIndex((x) => x.id === 'lage') + 1;

/** Alle Experimente in der Reihenfolge der Liste (App und Hilfeseite). @type {Experiment[]} */
export const EXPERIMENTE = [...ABLAEUFE.slice(0, nachLage), ...ERZEUGTE, ...ABLAEUFE.slice(nachLage)];

/** Modi: Kennung wie `z.modus`, Name wie auf dem Tab, Link-Adresse, die ihn wählt. @type {HilfeDaten} */
export const HILFE = {
  zweck: ZWECK,
  modi: [
    { id: 'eg', name: 'Ebenengruppen', hash: '#m=eg', zweck: MODI_ZWECK.eg },
    { id: 'struktur', name: 'Gitter und Basis', hash: '#m=struktur', zweck: MODI_ZWECK.struktur },
    { id: 'entwurf', name: 'Muster entwerfen', hash: '#m=entwurf', zweck: MODI_ZWECK.entwurf },
  ],
  ueberblick: {
    id: 'aufbau', titel: 'Aufbau der App', ausschnitt: 'body',
    eintraege: [
      { zeige: 'header.top', name: 'Kopfzeile', text: 'Die drei Modi, Skript, Quiz, „Link kopieren“ und die Hilfe („?“).' },
      { zeige: '#inhalt > .side', name: 'Seitenleiste', text: 'Was dargestellt wird: Gruppe, Objekt bzw. Basis, Gitter, Darstellung; oben die Experimente.' },
      { zeige: '#inhalt .p-a', name: 'Tafel A', text: 'Eine Elementarzelle; hier bedient man mit den Werkzeugen im Kopf der Tafel.' },
      { zeige: '#inhalt .p-b', name: 'Tafel B', text: 'Ausschnitt des Musters, das daraus entsteht.' },
      { zeige: '#info', name: 'Kenndaten', text: 'Was die Darstellung zeigt, wie eine Seite der International Tables.' },
    ],
  },
  konzepte: KONZEPTE,
  bereiche: BEREICHE,
  ersteSchritte: ERSTE_SCHRITTE,
  anleitungen: ANLEITUNGEN,
  experimente: EXPERIMENTE,
  fragen: FRAGEN,
  ergaenzungen: ERGAENZUNGEN,
  repo: 'manganite/plane-groups',
  kapitel: KAPITEL,
};
