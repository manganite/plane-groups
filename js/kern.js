// Ebenengruppen aus dem Rechenkern symcrys (lib/kern/plane.js, symcrys#31, crystallography-common#99). Hier steht nur,
// was die App daraus macht: die Operationen in ihrer Form { R, t } und die Zentrierung mit [0, 0] vorne. Die Daten
// der ITA (6. Aufl., 2016, Kap. 2.2) liegen in symcrys und werden dort gegen den Druck geprüft; die bisherige Rechnung
// der App aus js/ebenengruppen.js bleibt in tests/kern.test.mjs als unabhängige Gegenprobe.

import { generators, operations, planeGroup } from '../lib/kern/plane.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { PlaneGroupKey, PlaneOperation } from '../lib/kern/plane.js' */
/** @import { Op } from './symmetrie.js' */

/** @param {PlaneOperation} op @returns {Op} */
const alsOp = (op) => ({
  R: [[op.matrix[0][0], op.matrix[0][1]], [op.matrix[1][0], op.matrix[1][1]]],
  t: [op.translation[0], op.translation[1]],
});

/** @param {string} symbol @returns {PlaneGroupKey} */
const schluessel = (symbol) => /** @type {PlaneGroupKey} */ (symbol);

/**
 * Operationen einer Ebenengruppe aus symcrys: `alle` je eine pro Nebenklasse nach den ganzzahligen Translationen
 * (t in [0, 1)), zuerst die allgemeine Lage in der Nummerierung der ITA, bei c-Gruppen danach derselbe Satz mit der
 * Zentrierung; `ops` der (0,0)+ Satz; `zentr` die Zentrierungstranslationen mit [0, 0] vorne.
 * @param {string} symbol Kurzsymbol, z. B. 'p2mg'
 * @returns {{ ops: Op[], alle: Op[], zentr: Vec2[] }}
 */
export function kernOperationen(symbol) {
  const g = planeGroup(schluessel(symbol));
  /** @type {Vec2[]} */
  const zentr = [[0, 0], ...g.centring.map((z) => /** @type {Vec2} */ ([z[0], z[1]]))];
  const alle = operations(schluessel(symbol)).map(alsOp);
  return { ops: alle.slice(0, alle.length / zentr.length), alle, zentr };
}

/**
 * Erzeugende nach ITA („Generators selected“) aus symcrys, in der Reihenfolge der App: zuerst die Operationen der
 * Punktgruppe, dann die Zentrierung (symcrys nennt sie wie die ITA zuerst).
 * @param {string} symbol
 * @returns {Op[]}
 */
export function kernErzeugende(symbol) {
  const erz = generators(schluessel(symbol)).map(alsOp);
  const istTranslation = (/** @type {Op} */ op) => op.R[0][0] === 1 && op.R[0][1] === 0 && op.R[1][0] === 0 && op.R[1][1] === 1;
  return [...erz.filter((op) => !istTranslation(op)), ...erz.filter(istTranslation)];
}
