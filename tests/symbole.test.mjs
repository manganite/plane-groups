// Schoenflies-Symbole der Punktgruppen und Signaturen nach Conway (js/symbole.js), geprüft
// gegen die Wyckoff-Lagen der International Tables (js/ebenengruppen.js) und das „Magic Theorem“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { SCHOENFLIES, CONWAY, zerlege, preis } from '../js/symbole.js';

const sortiert = (a) => [...a].sort((x, y) => y - x);

test('jede Punktgruppe hat ein Schoenflies-Symbol', () => {
  for (const g of EBENENGRUPPEN) assert.ok(SCHOENFLIES[g.punktgruppe], g.punktgruppe);
  assert.equal(Object.keys(SCHOENFLIES).length, 10);
});

test('jede Ebenengruppe hat eine Signatur mit Preis 2 (Magic Theorem)', () => {
  assert.equal(Object.keys(CONWAY).length, 17);
  for (const g of EBENENGRUPPEN) {
    assert.ok(CONWAY[g.symbol], g.symbol);
    assert.ok(Math.abs(preis(CONWAY[g.symbol]) - 2) < 1e-12, `${g.symbol}: ${preis(CONWAY[g.symbol])}`);
  }
});

test('Signatur passt zu den Wyckoff-Lagen', () => {
  for (const g of EBENENGRUPPEN) {
    const z = zerlege(CONWAY[g.symbol]);
    const lagen = g.wyckoff.slice(1).map((w) => w.sym.replace(/\./g, ''));
    // Drehpunkte ohne Spiegellinie: Lagesymmetrie n (n ≥ 2) → je eine Ziffer vor dem *
    const gyr = lagen.filter((s) => /^[2346]$/.test(s)).map(Number);
    assert.deepEqual(sortiert(z.gyrations), sortiert(gyr), `${g.symbol}: Drehpunkte`);
    // Schnittpunkte von n Spiegellinien: Lagesymmetrie nmm bzw. 3m → Ecke n eines Kaleidoskops
    const ecken = lagen.filter((s) => /^[2346]m/.test(s)).map((s) => Number(s[0]));
    assert.deepEqual(sortiert(z.kaleidoskope.flat()), sortiert(ecken), `${g.symbol}: Ecken`);
    // ohne Ecken: je Wyckoff-Lage auf einer Spiegellinie ein eigenes Kaleidoskop
    const spiegel = lagen.filter((s) => s === 'm').length;
    if (!ecken.length) assert.equal(z.kaleidoskope.length, spiegel, `${g.symbol}: Kaleidoskope`);
    else assert.equal(z.kaleidoskope.length, 1, `${g.symbol}: ein Kaleidoskop`);
    // wonder nur, wenn es weder Drehpunkte noch Spiegel- oder Gleitspiegellinien gibt
    assert.equal(z.wonders > 0, g.symbol === 'p1', `${g.symbol}: wonder`);
  }
});
