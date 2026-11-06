// Bestimmung der Ebenengruppe eines Musters mit Leitfragen: Flussdiagramm nach Brian Sanderson, wie bei
// Hoffmann, Faszination Kristalle und Symmetrie (2016), Abschn. 4.2, Abb. 4.14 und S. 139 (fünf Leitfragen).
// Datendatei nach Leitfaden Abschn. 9: nur Literale. Gezeichnet in js/skizzen.js (flussdiagramm), genutzt im
// Skript (Kap. 8) und später in der geführten Bestimmung (#38). tests/bestimmen.test.mjs prüft das Diagramm
// gegen die Symmetrieelemente, die js/symmetrie.js für alle 17 Gruppen berechnet.

/** Schlüssel einer Leitfrage. @typedef {'n' | 'm' | 'g' | 'nichtAuf' | 'auf'} Leitfrage */
/**
 * Knoten des Flussdiagramms: eine Frage mit Ja/Nein-Zweigen, die Frage nach der höchsten Zähligkeit mit
 * Zweigen je Zähligkeit, oder ein Blatt (Symbol der Ebenengruppe).
 * @typedef {string | { frage: 'n', zweige: Record<'6' | '4' | '3' | '2' | '1', Knoten> } | { frage: Exclude<Leitfrage, 'n'>, ja: Knoten, nein: Knoten }} Knoten
 */

/** Die Leitfragen: lang für den Text, kurz für das Diagramm (Zeilen getrennt durch \n). @type {Record<Leitfrage, { lang: string, kurz: string }>} */
export const LEITFRAGEN = {
  n: { lang: 'Welche Zähligkeit hat der Drehpunkt höchster Zähligkeit (1, wenn es keinen gibt)?', kurz: 'höchste\nZähligkeit?' },
  m: { lang: 'Gibt es eine Spiegellinie?', kurz: 'Spiegellinie?' },
  g: { lang: 'Gibt es eine Gleitspiegellinie?', kurz: 'Gleitspiegel-\nlinie?' },
  nichtAuf: { lang: 'Gibt es einen Drehpunkt, der auf keiner Spiegellinie liegt?', kurz: 'Drehpunkt\nnicht auf m?' },
  auf: { lang: 'Gibt es einen Drehpunkt, der auf einer Spiegellinie liegt?', kurz: 'Drehpunkt\nauf m?' },
};

/** Das Flussdiagramm: zuerst die höchste Zähligkeit, dann je Zweig die übrigen Fragen. @type {Knoten} */
export const FLUSSDIAGRAMM = {
  frage: 'n',
  zweige: {
    6: { frage: 'm', ja: 'p6mm', nein: 'p6' },
    4: { frage: 'm', ja: { frage: 'nichtAuf', ja: 'p4gm', nein: 'p4mm' }, nein: 'p4' },
    3: { frage: 'm', ja: { frage: 'nichtAuf', ja: 'p31m', nein: 'p3m1' }, nein: 'p3' },
    2: {
      frage: 'm',
      ja: { frage: 'g', ja: { frage: 'auf', ja: 'c2mm', nein: 'p2mg' }, nein: 'p2mm' },
      nein: { frage: 'g', ja: 'p2gg', nein: 'p2' },
    },
    1: {
      frage: 'm',
      ja: { frage: 'g', ja: 'cm', nein: 'pm' },
      nein: { frage: 'g', ja: 'pg', nein: 'p1' },
    },
  },
};
