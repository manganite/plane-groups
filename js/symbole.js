// Weitere Schreibweisen neben den Hermann-Mauguin-Symbolen der International Tables.
//
// Schoenflies: nur für die Punktgruppen. Die 10 Punktgruppen der Ebene entsprechen den 10 polaren
// Punktgruppen im Raum (Drehachse senkrecht zur Ebene, Spiegelebenen enthalten ihre Normale);
// Symbole nach Borchardt-Ott & Sowa (2018), Tab. 9.3, S. 132. Für die Ebenengruppen selbst geben
// die International Tables (Part 6) und Borchardt-Ott (Tab. 10.1) kein Schoenflies-Symbol an.
//
// Conway: Signatur (Orbifold-Symbol) nach Conway, Burgiel & Goodman-Strauss, The Symmetries of
// Things (2016), Kap. 2–3, Tab. 3.2, S. 40. Zeichen: * Kaleidoskop (Spiegellinien), Ziffern vor
// dem * Drehpunkte, die auf keiner Spiegellinie liegen (gyrations), Ziffern nach einem * Ecken
// des Kaleidoskops (Schnittpunkte von Spiegellinien, Zahl der Spiegellinien), × miracle (Weg zu
// einer spiegelbildlichen Kopie ohne Spiegellinie), o wonder (nur Translationen). Die Zuordnung zu
// den Hermann-Mauguin-Symbolen prüft tests/symbole.test.mjs aus den Wyckoff-Lagen und dem
// „Magic Theorem“ (Gesamtpreis 2); Zerlegung und Preis einer Signatur stehen dort, weil diese
// Datei nach Leitfaden Abschn. 9 nur Daten enthält.

/** Schoenflies-Symbol je Punktgruppe der Ebene, als [Buchstabe, Index]. @type {Record<string, [string, string]>} */
export const SCHOENFLIES = {
  1: ['C', '1'], 2: ['C', '2'], m: ['C', 's'], '2mm': ['C', '2v'],
  4: ['C', '4'], '4mm': ['C', '4v'], 3: ['C', '3'], '3m': ['C', '3v'], 6: ['C', '6'], '6mm': ['C', '6v'],
};

/** Schoenflies-Symbol als HTML, z. B. C<sub>2v</sub>. */
/** @param {string} pg @returns {string} */
export const schoenfliesHTML = (pg) => {
  const [b, i] = SCHOENFLIES[pg];
  return `<i>${b}</i><sub>${i}</sub>`;
};

/** Signatur nach Conway je Ebenengruppe (Schreibweise wie Conway, Tab. 3.2). @type {Record<string, string>} */
export const CONWAY = {
  p1: 'o', p2: '2222', pm: '**', pg: '××', cm: '*×',
  p2mm: '*2222', p2mg: '22*', p2gg: '22×', c2mm: '2*22',
  p4: '442', p4mm: '*442', p4gm: '4*2',
  p3: '333', p3m1: '*333', p31m: '3*3', p6: '632', p6mm: '*632',
};

/** Tooltip zur Signatur nach Conway (Orbifold-Symbol). */
export const CONWAY_HINWEIS = 'Orbifold-Symbol nach Conway: * Spiegellinien (Kaleidoskop), Ziffern vor dem * Drehpunkte ohne Spiegellinie, Ziffern nach dem * Schnittpunkte von Spiegellinien, × eine spiegelbildliche Kopie ist erreichbar, ohne eine Spiegellinie zu überqueren, o nur Translationen';
