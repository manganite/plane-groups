// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Mechanik steht in lib/common/js/help.js. Begriffe wie im Skript.

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  'tab-a': 'Erster Modus der App.',
  'tab-b': 'Zweiter Modus der App.',
  'opt-elemente': 'Symmetrieelemente der gewählten Gruppe einblenden.',
  'opt-motiv': 'Ein Motiv in allgemeiner Lage, auf das alle Operationen der Gruppe wirken.',
  'opt-zelle': 'Die Elementarzelle des Gitters hervorheben.',
  'opt-beschr': 'Die Bilder des Motivs beschriften.',
  'lat-ba': 'Verhältnis der Gitterkonstanten b/a.',
  'v-farben': 'Symmetrieelemente in der Farbe ihrer Blickrichtung zeichnen (Positionen im Hermann-Mauguin-Symbol).',
  'v-achsen': 'Gitterachsen a und b einblenden.',
  'v-wahl': 'Beispiel für ein Auswahlfeld.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  { heading: '#ctl-gruppe > h2', intro: 'Gruppe antippen: Die Tafeln zeigen ihre Symmetrieelemente.', ids: ['opt-elemente', 'opt-motiv', 'opt-zelle', 'opt-beschr'] },
  { heading: '#sec-gitter > summary', intro: 'Alles in diesem Abschnitt ändert das Gitter.', ids: ['lat-ba'] },
  { heading: '#sec-view > summary', ids: ['v-farben', 'v-achsen', 'v-wahl'] },
];

/** Beschriftung in der ⓘ-Erklärung, wo der Text des Elements nicht passt. */
export const LABELS = {};
