// Verweise in andere Apps der Familie: die Punktgruppe einer Ebenengruppe in der Stereo-App
// („Stereographische Projektion“, manganite/stereography, ab v1.12.0; Link-Schema in js/scene.js).
//
// Die 10 Punktgruppen der Ebene entsprechen den 10 polaren Punktgruppen (Ebene senkrecht zur
// polaren Richtung: n-zählige Achse → Drehpunkt, Spiegelebene durch die Achse → Spiegellinie).
// Verlinkt wird das Pedion, die einzige Form, die es genau in den polaren Gruppen gibt, mit
// Flächenmuster und Blick senkrecht auf die Fläche (blick=1, 2 oder 3): Das Muster hat dann genau
// die Punktgruppe der Ebene. Bei 1 und m steht keine Blickrichtung senkrecht auf dem Pedion; dort
// der Modus „Punktgruppen“ mit Blick entlang c. p3m1 gehört zu 3m1 (Spiegelebenen ⊥ ⟨100⟩), p31m
// zu 31m (⊥ ⟨210⟩), wie bei den Ebenengruppen in ITA; die Achsen liegen in beiden Apps gleich
// (a nach links unten, b nach rechts). Abweichung bei m: Die Stereo-App hat nur die Spiegelebene
// ⊥ b (bzw. ⊥ c), die Ebenengruppen pm, pg, cm nach ITA haben Spiegellinien ⊥ a (Tooltip).

export const STEREO = 'https://manganite.github.io/stereography/index.html';

/** Aufgeräumte Ansicht: ohne Umkugel, Pole, Äquatorebene, Strahlen; mit Kristallachsen. */
const OHNE = 'kugel=0&ns=0&ebene=0&strahlen=0';
/** Für das Pedion: Muster an (sonst zeigt die App eine andere Form), ohne Normalen und Pole. */
const PEDION_ZUSATZ = `muster=1&${OHNE}&normalen=0&pole=0&achsen=1`;

/** Punktgruppe der Ebene → Hash in der Stereo-App (ohne die festen Zusätze). */
export const STEREO_HASH = {
  1: 'm=pg&g=1&blick=3',
  2: 'm=form&sys=monoklin&f=2b:a1&blick=2',
  m: 'm=pg&g=mb&blick=3',
  '2mm': 'm=form&sys=orthorhombisch&f=mm2:a1&blick=3',
  4: 'm=form&sys=tetragonal&f=4:a1&blick=1',
  '4mm': 'm=form&sys=tetragonal&f=4mm:a1&blick=1',
  3: 'm=form&sys=trigonal&f=3:a1&blick=1',
  '3m1': 'm=form&sys=trigonal&f=3m1:a1&blick=1',
  '31m': 'm=form&sys=trigonal&f=31m:a1&blick=1',
  6: 'm=form&sys=hexagonal&f=6:a1&blick=1',
  '6mm': 'm=form&sys=hexagonal&f=6mm:a1&blick=1',
};

/** Schlüssel in STEREO_HASH: die Punktgruppe, bei 3m nach der Aufstellung der Ebenengruppe. */
function schluessel(daten) {
  if (daten.punktgruppe === '3m') return daten.symbol === 'p31m' ? '31m' : '3m1';
  return String(daten.punktgruppe);
}

/** Link in die Stereo-App für die Punktgruppe einer Ebenengruppe. */
export function stereoLink(daten) {
  const h = STEREO_HASH[schluessel(daten)];
  const zusatz = h.startsWith('m=form') ? PEDION_ZUSATZ : `${OHNE}&achsen=1`;
  return `${STEREO}#${h}&${zusatz}`;
}

/** Hinweis zum Link (Tooltip). */
export function stereoHinweis(daten) {
  const app = 'in der App „Stereographische Projektion“ öffnen';
  const k = schluessel(daten);
  if (k === '1' || k === 'm') {
    return `Punktgruppe ${k} ${app}: Symmetriegerüst und Objekt, Blick entlang c${k === 'm' ? '. Die Spiegelebene steht dort ⊥ b und erscheint als Linie entlang a; hier liegen die Spiegellinien nach ITA ⊥ a, also um 90° gedreht' : ''}.`;
  }
  const name = k === '2mm' ? 'mm2' : k;
  return `Punktgruppe ${name} ${app}: Pedion mit Flächenmuster, Blick senkrecht auf die Fläche. Das Muster hat genau die Punktgruppe der Ebene; der Umriss stammt von einer Ergänzungsform und kann symmetrischer aussehen.`;
}
