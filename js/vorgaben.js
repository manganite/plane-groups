// Vorgaben für den Modus „Gitter und Basis“: Bravais-Gitter, das
// Dreiecksbeispiel (Konzept §3.2), 2D-Materialien in der Draufsicht, Archimedische Parkettierungen
// und künstliches Spin-Eis. Jede Vorgabe nennt die Ebenengruppe, die die Symmetriebestimmung
// ergeben muss (tests/struktur.test.mjs).
//
// Gitter wie im Modus „Ebenengruppen“: a nach unten, b nach rechts (metrik() in zeichnung.js).
// Winkel der Motive im Bild, im Uhrzeigersinn ab der Richtung von b.

import { metrik, kart, bruchVon } from './zeichnung.js';

const Q = { ba: 1, gamma: 90 };
const H = { ba: 1, gamma: 120 };
const R = { ba: 1.35, gamma: 90 };
const atom = (p, farbe = 0) => ({ motiv: 'atom', farbe, p, winkel: 0 });

/** Winkel (Grad, im Bild) eines Vektors in Bruchkoordinaten. */
function winkelVon(g, v) {
  const c = kart(metrik(g), v);
  return Math.round(((Math.atan2(c[1], c[0]) * 180) / Math.PI) * 1e6) / 1e6;
}

// 3.4.6.4: Sechsecke um die Gitterpunkte, Ecken unter 30° + k·60°, Kante e = 1/(1 + √3)
const e3464 = 1 / (1 + Math.sqrt(3));
const ecken3464 = Array.from({ length: 6 }, (_, k) => {
  const w = ((30 + 60 * k) * Math.PI) / 180;
  return bruchVon(metrik(H), [e3464 * Math.cos(w), e3464 * Math.sin(w)]);
});
// 4.8.8: Achtecke um die Gitterpunkte, Kante e = 1/(1 + √2)
const e488 = 1 / (1 + Math.SQRT2);
// 3.3.4.3.4: Lage 4c von p4gm mit x = (3 − √3)/4 (alle Kanten gleich lang)
const x33434 = (3 - Math.sqrt(3)) / 4;
// 3.3.3.3.6: allgemeine Lage von p6 mit (x, y) = (2/7, 6/7)
const p6 = ([x, y]) => [[x, y], [-y, x - y], [-x + y, -x], [-x, -y], [y, -x + y], [x - y, x]];

// Spin-Eis: längliche Inseln auf den Bindungen
const insel = (p, richtung, g, groesse) => ({ motiv: 'insel', farbe: 0, p, winkel: winkelVon(g, richtung), groesse });

export const VORGABEN = [
  { id: 'quadratisch', gruppe: 'Bravais-Gitter', name: 'Quadratisch', gitter: Q, basis: [atom([0, 0])], erwartet: 'p4mm' },
  { id: 'rechteckig', gruppe: 'Bravais-Gitter', name: 'Rechteckig', gitter: R, basis: [atom([0, 0])], erwartet: 'p2mm' },
  { id: 'zentriert', gruppe: 'Bravais-Gitter', name: 'Rechteckig zentriert', gitter: R, basis: [atom([0, 0]), atom([0.5, 0.5])], erwartet: 'c2mm' },
  { id: 'hexagonal', gruppe: 'Bravais-Gitter', name: 'Hexagonal', gitter: H, basis: [atom([0, 0])], erwartet: 'p6mm' },
  { id: 'schiefwinklig', gruppe: 'Bravais-Gitter', name: 'Schiefwinklig', gitter: { ba: 1.25, gamma: 105 }, basis: [atom([0, 0])], erwartet: 'p2' },

  // Dreiecksbeispiel (Konzept §3.2): Spitzen entlang b; das zentrale Dreieck andersfarbig, gleich, umgekehrt
  { id: 'dreieck1', gruppe: 'Dreiecksbeispiel', name: 'Stufe 1: Zentrum andersfarbig', gitter: R, basis: [{ motiv: 'dreieck', farbe: 0, p: [0, 0], winkel: 90 }, { motiv: 'dreieck', farbe: 1, p: [0.5, 0.5], winkel: 90 }], erwartet: 'pm' },
  { id: 'dreieck2', gruppe: 'Dreiecksbeispiel', name: 'Stufe 2: gleiche Farbe, gleiche Richtung', gitter: R, basis: [{ motiv: 'dreieck', farbe: 0, p: [0, 0], winkel: 90 }, { motiv: 'dreieck', farbe: 0, p: [0.5, 0.5], winkel: 90 }], erwartet: 'cm' },
  { id: 'dreieck3', gruppe: 'Dreiecksbeispiel', name: 'Stufe 3: Spitze im Zentrum umgekehrt', gitter: R, basis: [{ motiv: 'dreieck', farbe: 0, p: [0, 0], winkel: 90 }, { motiv: 'dreieck', farbe: 0, p: [0.5, 0.5], winkel: 270 }], erwartet: 'p2mg' },

  // 2D-Materialien, Draufsicht auf eine Lage
  { id: 'graphen', gruppe: '2D-Materialien', name: 'Graphen (Bienenwabe)', gitter: H, basis: [atom([1 / 3, 2 / 3]), atom([2 / 3, 1 / 3])], erwartet: 'p6mm' },
  { id: 'hbn', gruppe: '2D-Materialien', name: 'h-BN (B und N)', gitter: H, basis: [atom([1 / 3, 2 / 3], 0), atom([2 / 3, 1 / 3], 1)], erwartet: 'p3m1' },
  { id: 'mos2', gruppe: '2D-Materialien', name: 'MoS₂ (1H, Draufsicht)', gitter: H, basis: [atom([0, 0], 0), atom([1 / 3, 2 / 3], 1)], erwartet: 'p3m1' },
  { id: 'kagome', gruppe: '2D-Materialien', name: 'Kagome', gitter: H, basis: [atom([0.5, 0]), atom([0, 0.5]), atom([0.5, 0.5])], erwartet: 'p6mm' },
  { id: 'lieb', gruppe: '2D-Materialien', name: 'Lieb-Gitter (CuO₂-Ebene)', gitter: Q, basis: [atom([0, 0], 0), atom([0.5, 0], 1), atom([0, 0.5], 1)], erwartet: 'p4mm' },

  // Archimedische Parkettierungen: Ecken der Parkettierung als Atome
  { id: 'a488', gruppe: 'Archimedische Parkettierungen', name: '4.8.8', gitter: Q, basis: [[e488 / 2, 0.5], [-e488 / 2, 0.5], [0.5, e488 / 2], [0.5, -e488 / 2]].map((p) => atom(p)), erwartet: 'p4mm' },
  { id: 'a3464', gruppe: 'Archimedische Parkettierungen', name: '3.4.6.4', gitter: H, basis: ecken3464.map((p) => atom(p)), erwartet: 'p6mm' },
  { id: 'a33434', gruppe: 'Archimedische Parkettierungen', name: '3.3.4.3.4', gitter: Q, basis: [[x33434, x33434 + 0.5], [-x33434, -x33434 + 0.5], [-x33434 + 0.5, x33434], [x33434 + 0.5, -x33434]].map((p) => atom(p)), erwartet: 'p4gm' },
  { id: 'a33336', gruppe: 'Archimedische Parkettierungen', name: '3.3.3.3.6 (chiral)', gitter: H, basis: p6([2 / 7, 6 / 7]).map((p) => atom(p)), erwartet: 'p6' },

  // künstliches Spin-Eis: Permalloy-Inseln auf den Bindungen
  { id: 'asi-quadrat', gruppe: 'Künstliches Spin-Eis', name: 'Square', gitter: Q, basis: [insel([0.5, 0], [1, 0], Q, 0.17), insel([0, 0.5], [0, 1], Q, 0.17)], erwartet: 'p4mm' },
  { id: 'asi-kagome', gruppe: 'Künstliches Spin-Eis', name: 'Kagome (Bienenwaben-Bindungen)', gitter: H, basis: [insel([0.5, 0], [1 / 3, 2 / 3], H, 0.2), insel([0, 0.5], [2 / 3, 1 / 3], H, 0.2), insel([0.5, 0.5], [1 / 3, -1 / 3], H, 0.2)], erwartet: 'p6mm' },
  { id: 'asi-pinwheel', gruppe: 'Künstliches Spin-Eis', name: 'Pinwheel (Inseln um 45° gedreht)', gitter: Q, basis: [{ ...insel([0.5, 0], [1, 0], Q, 0.17), winkel: winkelVon(Q, [1, 0]) + 45 }, { ...insel([0, 0.5], [0, 1], Q, 0.17), winkel: winkelVon(Q, [0, 1]) + 45 }], erwartet: 'p4gm' },
];

export const vorgabe = (id) => VORGABEN.find((v) => v.id === id);
