// Kapitel des Skripts für das Quiz (Auswahl, Stand, Links ins Skript) und Name des Speichers im Browser.
// Die Logik des Quiz steht in lib/common/js/quiz-core.js, die Seite in lib/common/js/quiz-seite.js.

/** Kapitel des Skripts mit Anker (skript.html#…); kurz: Name auf den Auswahlknöpfen des Quiz. */
export const KAPITEL = [
  { nr: 1, titel: 'Gitter, Elementarzelle und Basis', kurz: 'Gitter und Basis', anker: 'gitter-basis' },
  { nr: 2, titel: 'Symmetrie des Gitters', kurz: 'Gittersymmetrie', anker: 'gittersymmetrie' },
  { nr: 3, titel: 'Gitter und Motiv', kurz: 'Gitter und Motiv', anker: 'gitter-motiv' },
  { nr: 4, titel: 'Gleitspiegelung und Verknüpfung', kurz: 'Gleitspiegelung', anker: 'gleitspiegelung' },
  { nr: 5, titel: 'Die 17 Ebenengruppen', kurz: '17 Ebenengruppen', anker: 'ebenengruppen' },
  { nr: 6, titel: 'Punktlagen', kurz: 'Punktlagen', anker: 'punktlagen' },
  { nr: 7, titel: 'Tapeten, Ornamente und Kunst', kurz: 'Tapeten und Kunst', anker: 'kunst' },
];

/** Präfix der Einträge im Browser: <Präfix>-v1 (Fortschritt), -entwurf (Schalter), -lauf (laufendes Quiz).
 *  Nicht ändern, sonst verlieren Studierende ihren gespeicherten Stand. */
export const SPEICHER = 'ebenen-quiz';
