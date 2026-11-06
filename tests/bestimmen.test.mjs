// Flussdiagramm zur Bestimmung (js/bestimmen.js, Skript Kap. 8): Jede der 17 Ebenengruppen beantwortet die
// Leitfragen mit ihren eigenen Symmetrieelementen (berechnet von js/symmetrie.js aus den Operationen der ITA)
// und kommt so genau bei sich selbst an; jede Gruppe ist genau ein Blatt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLUSSDIAGRAMM, LEITFRAGEN } from '../js/bestimmen.js';
import { gruppe, elemente } from '../js/symmetrie.js';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';

/** @import { Knoten } from '../js/bestimmen.js' */

/** Punkt p auf der Linie durch q mit Richtung r (Bruchkoordinaten). @param {number[]} p @param {{ punkt: number[], richtung: number[] }} l */
const aufLinie = (p, l) => Math.abs((p[0] - l.punkt[0]) * l.richtung[1] - (p[1] - l.punkt[1]) * l.richtung[0]) < 1e-6;

/** Antworten einer Gruppe auf die Leitfragen, aus ihren Symmetrieelementen in einer Zelle. @param {string} symbol */
function antworten(symbol) {
  const e = elemente(gruppe(symbol));
  const spiegel = e.linien.filter((l) => l.art === 'spiegel');
  return {
    n: String(Math.max(1, ...e.drehpunkte.map((d) => d.n))),
    m: spiegel.length > 0,
    // Gleitspiegellinien, die auf einer Spiegellinie liegen, führt elemente() als Spiegellinie
    g: e.linien.some((l) => l.art === 'gleit'),
    nichtAuf: e.drehpunkte.some((d) => !spiegel.some((l) => aufLinie(d.punkt, l))),
    auf: e.drehpunkte.some((d) => spiegel.some((l) => aufLinie(d.punkt, l))),
  };
}

/** Blätter des Diagramms. @param {Knoten} k @returns {string[]} */
const blaetter = (k) => (typeof k === 'string' ? [k] : 'zweige' in k ? Object.values(k.zweige).flatMap(blaetter) : [...blaetter(k.ja), ...blaetter(k.nein)]);

test('Flussdiagramm: jede der 17 Ebenengruppen genau einmal', () => {
  const b = blaetter(FLUSSDIAGRAMM);
  assert.equal(b.length, 17);
  assert.deepEqual([...b].sort(), EBENENGRUPPEN.map((d) => d.symbol).sort());
});

test('Flussdiagramm: jede Gruppe kommt mit ihren eigenen Elementen bei sich an', () => {
  for (const d of EBENENGRUPPEN) {
    const a = antworten(d.symbol);
    /** @type {Knoten} */
    let k = FLUSSDIAGRAMM;
    const weg = [];
    while (typeof k !== 'string') {
      if ('zweige' in k) { weg.push(`n=${a.n}`); k = k.zweige[/** @type {'1'} */ (a.n)]; } else { weg.push(`${k.frage}=${a[k.frage]}`); k = a[k.frage] ? k.ja : k.nein; }
    }
    assert.equal(k, d.symbol, `${d.symbol}: ${weg.join(', ')}`);
  }
});

test('Flussdiagramm: höchste Zähligkeit wie im Symbol; jede Frage hat Text', () => {
  // unabhängig: die Ziffer nach p oder c im Symbol (p1, pm, pg, cm: 1)
  for (const d of EBENENGRUPPEN) assert.equal(antworten(d.symbol).n, /^[pc](\d)/.exec(d.symbol)?.[1] ?? '1', d.symbol);
  for (const f of Object.values(LEITFRAGEN)) assert.ok(f.lang.endsWith('?') && f.kurz.endsWith('?'));
});
