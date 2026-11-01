// Weitere Schreibweisen neben den Hermann-Mauguin-Symbolen der International Tables.
//
// Schoenflies: nur für die Punktgruppen. Die 10 Punktgruppen der Ebene entsprechen den 10 polaren
// Punktgruppen im Raum (Drehachse senkrecht zur Ebene, Spiegelebenen enthalten ihre Normale);
// Symbole nach Borchardt-Ott & Sowa (2018), Tab. 9.3, S. 132. Für die Ebenengruppen selbst geben
// die International Tables (Part 6) und Borchardt-Ott (Tab. 10.1) kein Schoenflies-Symbol an.
//
// Conway: Signatur (Orbifold-Symbol) nach Conway, Burgiel & Goodman-Strauss, The Symmetries of
// Things (2008), Kap. 2–3, Tab. 3.2, S. 40. Zeichen: * Kaleidoskop (Spiegellinien), Ziffern vor
// dem * Drehpunkte, die auf keiner Spiegellinie liegen (gyrations), Ziffern nach einem * Ecken
// des Kaleidoskops (Schnittpunkte von Spiegellinien, Zahl der Spiegellinien), × miracle (Weg zu
// einer spiegelbildlichen Kopie ohne Spiegellinie), o wonder (nur Translationen). Die Zuordnung zu
// den Hermann-Mauguin-Symbolen prüft tests/symbole.test.mjs aus den Wyckoff-Lagen und dem
// „Magic Theorem“ (Gesamtpreis 2).

/** Schoenflies-Symbol je Punktgruppe der Ebene, als [Buchstabe, Index]. */
export const SCHOENFLIES = {
  1: ['C', '1'], 2: ['C', '2'], m: ['C', 's'], '2mm': ['C', '2v'],
  4: ['C', '4'], '4mm': ['C', '4v'], 3: ['C', '3'], '3m': ['C', '3v'], 6: ['C', '6'], '6mm': ['C', '6v'],
};

/** Schoenflies-Symbol als HTML, z. B. C<sub>2v</sub>. */
export const schoenfliesHTML = (pg) => {
  const [b, i] = SCHOENFLIES[pg];
  return `<i>${b}</i><sub>${i}</sub>`;
};

/** Signatur nach Conway je Ebenengruppe (Schreibweise wie Conway, Tab. 3.2). */
export const CONWAY = {
  p1: 'o', p2: '2222', pm: '**', pg: '××', cm: '*×',
  p2mm: '*2222', p2mg: '22*', p2gg: '22×', c2mm: '2*22',
  p4: '442', p4mm: '*442', p4gm: '4*2',
  p3: '333', p3m1: '*333', p31m: '3*3', p6: '632', p6mm: '*632',
};

/** Signatur in Bestandteile zerlegt: wonders, gyrations (vor dem ersten *), Kaleidoskope mit Ecken, miracles. */
export function zerlege(sig) {
  const wonders = (sig.match(/o/g) || []).length;
  const miracles = (sig.match(/×/g) || []).length;
  const rest = sig.replace(/[o×]/g, '');
  const teile = rest.split('*');
  const gyrations = [...teile[0]].map(Number);
  const kaleidoskope = teile.slice(1).map((t) => [...t].map(Number));
  return { wonders, gyrations, kaleidoskope, miracles };
}

/** Preis einer Signatur nach Conway, Tab. 3.1 (S. 29): o 2, * und × je 1, Drehpunkt n (n−1)/n, Ecke n (n−1)/(2n). */
export function preis(sig) {
  const z = zerlege(sig);
  return 2 * z.wonders + z.miracles + z.kaleidoskope.length
    + z.gyrations.reduce((s, n) => s + (n - 1) / n, 0)
    + z.kaleidoskope.flat().reduce((s, n) => s + (n - 1) / (2 * n), 0);
}
