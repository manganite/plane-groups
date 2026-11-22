// Ebenengruppen aus dem Rechenkern symcrys (js/kern.js) gegen die bisherige Rechnung der App: die Operationen aus den
// Koordinaten der allgemeinen Lage in js/ebenengruppen.js (ITA 2006, Part 6), mit der Zentrierung, und die Erzeugenden
// nach „Generators selected“. Die beiden Quellen sind unabhängig (symcrys: ITA 2016, Kap. 2.2, eigene Transkription).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { kernErzeugende, kernOperationen } from '../js/kern.js';
import { anwenden, bahn, gruppe, lage, liesOp, mod1, reduziert, stabilisator, translation, verknuepfen } from '../js/symmetrie.js';
import { bahnBisher, lagesymbolBisher, stabilisatorBisher } from './bisher.mjs';

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


for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: Operationen, Zentrierung und Erzeugende aus symcrys wie bisher`, () => {
    const alt = bisher(d);
    const neu = kernOperationen(d.symbol);
    assert.deepEqual(neu.zentr, alt.zentr);
    assert.equal(neu.alle.length, alt.alle.length);
    assert.deepEqual(neu.alle, alt.alle);
    assert.deepEqual(neu.ops, alt.ops);
    assert.deepEqual(kernErzeugende(d.symbol), alt.erz);
  });
}

// Lagen und Bahnen: Bahn, Lagesymmetrie (Operationen), Zähligkeit und orientiertes Symbol aus symcrys gegen die frühere
// Rechnung der App (tests/bisher.mjs) an jedem gedruckten Punkt jeder Wyckoff-Lage (freie Parameter allgemein gewählt)
// und an einem allgemeinen Punkt; das Symbol zudem gegen die Abschrift der ITA 2006 (`sym`).
for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: Bahn, Lagesymmetrie, Zähligkeit und Symbol aus symcrys wie bisher`, () => {
    const g = gruppe(d.symbol);
    for (const w of d.wyckoff) {
      for (const z of g.zentr) for (const k of w.koord) {
        const p = /** @type {[number, number]} */ (anwenden(liesOp(k), [0.137, 0.291]).map((v, i) => mod1(v + z[i])));
        const stab = stabilisator(g, p);
        assert.deepEqual(stab, stabilisatorBisher(g, p), `${w.b} ${k}: Lagesymmetrie`);
        const l = lage(g, p);
        assert.equal(l.buchstabe, w.b);
        assert.equal(l.zaehligkeit, g.ordnung / stabilisatorBisher(g, p).length, `${w.b}: Zähligkeit`);
        assert.equal(l.symbol, lagesymbolBisher(g, stab), `${w.b}: Symbol wie bisher berechnet`);
        assert.equal(l.symbol, w.sym, `${w.b}: Symbol wie ITA 2006`);
        const neu = bahn(g, p);
        const alt = bahnBisher(g, p);
        assert.equal(neu.length, alt.length, `${w.b}: Länge der Bahn`);
        neu.forEach((q, i) => assert.ok(Math.abs(q[0] - alt[i][0]) < 1e-12 && Math.abs(q[1] - alt[i][1]) < 1e-12, `${w.b}: Bild ${i + 1}`));
      }
    }
  });
}

// Asymmetrische Einheit: die Ecken aus symcrys (aus den gedruckten Ungleichungen der ITA 2016) gegen die Ecken der
// Abschrift der ITA 2006 in js/ebenengruppen.js, der Reihe nach (dieselbe Folge, derselbe Anfang).
for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: Ecken der asymmetrischen Einheit aus symcrys wie in der Abschrift`, () => {
    const runden = (/** @type {readonly (readonly number[])[]} */ poly) => poly.map((p) => p.map((v) => Math.round(v * 1e9) / 1e9));
    assert.deepEqual(runden(gruppe(d.symbol).ae), runden(d.ae.ecken));
  });
}

// Am Rand der Zelle: Koordinaten nahe 1 werden in der Bahn wie bisher zu 0.
test('Bahn am Rand der Zelle wie bisher', () => {
  for (const [sym, p] of /** @type {[string, [number, number]][]} */ ([['p2mm', [1 - 1e-12, 0.3]], ['p2', [1e-12, 0]], ['p4mm', [0.5, 1 - 1e-11]], ['p6mm', [1 - 1e-12, 1 - 1e-12]], ['c2mm', [0.25, 1 - 1e-12]]])) {
    assert.deepEqual(bahn(gruppe(sym), p), bahnBisher(gruppe(sym), p), sym);
  }
});
