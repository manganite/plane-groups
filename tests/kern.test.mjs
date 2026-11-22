// Ebenengruppen aus dem Rechenkern symcrys (js/kern.js) gegen die bisherige Rechnung der App: die Operationen aus den
// Koordinaten der allgemeinen Lage in js/ebenengruppen.js (ITA 2006, Part 6), mit der Zentrierung, und die Erzeugenden
// nach „Generators selected“. Die beiden Quellen sind unabhängig (symcrys: ITA 2016, Kap. 2.2, eigene Transkription).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { kernErzeugende, kernOperationen } from '../js/kern.js';
import { gleichModGitter, liesOp, reduziert, translation, verknuepfen } from '../js/symmetrie.js';

/** @import { Op } from '../js/symmetrie.js' */

/** Die bisherige Rechnung der App: (0,0)+ Satz und Zentrierung aus den Daten der ITA 2006. @param {(typeof EBENENGRUPPEN)[number]} d */
function bisher(d) {
  const ops = d.ops.map(liesOp);
  const zentr = d.zentrierung ?? [[0, 0]];
  /** @type {Op[]} */
  const alle = [];
  for (const z of zentr) for (const op of ops) alle.push(reduziert(verknuepfen(translation(z), op)));
  const erz = [...d.erzeugende.map((i) => ops[i - 1]), ...zentr.filter((z) => z[0] !== 0 || z[1] !== 0).map(translation)];
  return { ops, alle, zentr, erz };
}

/** @param {Op} a @param {Op} b */
const gleich = (a, b) => JSON.stringify(a.R) === JSON.stringify(b.R) && a.t.every((v, i) => Math.abs(v - b.t[i]) < 1e-12);

for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: Operationen, Zentrierung und Erzeugende aus symcrys wie bisher`, () => {
    const alt = bisher(d);
    const neu = kernOperationen(d.symbol);
    assert.deepEqual(neu.zentr, alt.zentr);
    assert.equal(neu.alle.length, alt.alle.length);
    neu.alle.forEach((op, i) => assert.ok(gleich(op, alt.alle[i]), `Operation ${i + 1}`));
    neu.ops.forEach((op, i) => assert.ok(gleichModGitter(op, alt.ops[i]), `(${i + 1}) des (0,0)+ Satzes`));
    const erz = kernErzeugende(d.symbol);
    assert.equal(erz.length, alt.erz.length);
    erz.forEach((op, i) => assert.ok(gleichModGitter(op, alt.erz[i]), `Erzeugende ${i + 1}`));
  });
}
