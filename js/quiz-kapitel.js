// Kapitel des Skripts für das Quiz (Auswahl, Stand, Links ins Skript) und Name des Speichers im Browser.

/** Kapitel des Skripts mit Anker (skript.html#…); kurz: Name auf den Auswahlknöpfen des Quiz. */
export const KAPITEL = [
  { nr: 1, titel: 'Ein Kapitel des Grundstoffs', kurz: 'Grundstoff', anker: 'kapitel1' },
  { nr: 2, titel: 'Ein Vertiefungskapitel', kurz: 'Vertiefung', anker: 'kapitel2' },
];

/** Präfix der Einträge im Browser (<Präfix>-v1, -entwurf, -lauf). Einmal festlegen, danach nie ändern. */
export const SPEICHER = 'ebenen-quiz';
