// Verweise in andere Apps der Familie. Link-Schema der Stereo-App („Stereographische Projektion“,
// manganite/stereography, js/scene.js): #m=form&sys=<System>&f=<Eintrag im Formkatalog>&muster=1.
//
// Die 10 Punktgruppen der Ebene entsprechen den 10 polaren Punktgruppen (Ebene senkrecht zur
// polaren Richtung: n-zählige Achse → Drehpunkt, Spiegelebene durch die Achse → Spiegellinie).
// Verlinkt wird das Pedion, die einzige Form, die es genau in den polaren Gruppen gibt: Mit
// eingeschaltetem Flächenmuster zeigt seine Fläche genau die Punktgruppe der Ebene. Die Einträge
// stammen aus js/forms.js der Stereo-App (geprüft mit v1.11.0); 31m, 2c und mc haben dort kein
// eigenes Pedion.

export const STEREO = 'https://manganite.github.io/stereography/';

/** Punktgruppe der Ebene → [Kristallsystem, Eintrag im Formkatalog der Stereo-App]. */
export const PEDION = {
  1: ['triklin', '1:a1'],
  2: ['monoklin', '2b:a1'],
  m: ['monoklin', 'mb:a1'],
  '2mm': ['orthorhombisch', 'mm2:a1'],
  4: ['tetragonal', '4:a1'],
  '4mm': ['tetragonal', '4mm:a1'],
  3: ['trigonal', '3:a1'],
  '3m': ['trigonal', '3m1:a1'],
  6: ['hexagonal', '6:a1'],
  '6mm': ['hexagonal', '6mm:a1'],
};

/** Link auf das Pedion mit Flächenmuster für die Punktgruppe einer Ebenengruppe. */
export function stereoLink(daten) {
  const [sys, f] = PEDION[daten.punktgruppe];
  return `${STEREO}#m=form&sys=${sys}&f=${f}&muster=1`;
}

/** Hinweis zum Link (Tooltip): Aufstellung in der Stereo-App, wo sie abweicht. */
export function stereoHinweis(daten) {
  const t = 'Pedion mit Flächenmuster in der App „Stereographische Projektion“ öffnen: Das Muster auf der Fläche hat genau diese Punktgruppe';
  if (daten.punktgruppe === '2mm') return `${t} (dort mm2 geschrieben).`;
  if (daten.punktgruppe === 'm') return `${t} (dort mit Spiegelebene ⊥ b).`;
  if (daten.symbol === 'p31m') return `${t} (dort in der Aufstellung 3m1; in p31m liegen die Spiegellinien gegenüber dem Gitter um 30° gedreht).`;
  return `${t}.`;
}
