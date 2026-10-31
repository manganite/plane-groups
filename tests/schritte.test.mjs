// „Schritt für Schritt“: Bilder der ITA-Liste, zusammenfallende Bilder, Zähligkeit, Text, Link.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, lage, punktAufLage } from '../js/symmetrie.js';
import { schrittDaten, itaOperationen, tafelA } from '../js/zeichnung.js';
import { schrittHTML } from '../js/schritte.js';
import { startzustand, hashVon, hashAnwenden } from '../js/zustand.js';

const F = { paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf', dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80' };

for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: am Ende so viele Stellen wie die Zähligkeit, für jede Wyckoff-Lage`, () => {
    const g = gruppe(d.symbol);
    assert.equal(itaOperationen(g).length, g.ordnung);
    for (const w of d.wyckoff) {
      const p = punktAufLage(g, w.b, [0.12, 0.31]);
      const l = lage(g, p);
      const s = schrittDaten(g, p, g.ordnung + 1);
      assert.equal(s.verschieden, l.zaehligkeit, `${d.symbol} ${w.b}`);
      assert.ok(s.translationen);
      const html = schrittHTML(d, s, l, g.ordnung);
      assert.ok(!/undefined|NaN/.test(html), `${d.symbol} ${w.b}`);
      for (let k = 1; k <= g.ordnung; k++) assert.ok(!/undefined|NaN/.test(schrittHTML(d, schrittDaten(g, p, k), l, g.ordnung)), `${d.symbol} ${w.b} Schritt ${k}`);
    }
  });
}

test('pm: Objekt auf der Spiegellinie: Bild (2) fällt auf Bild (1)', () => {
  const g = gruppe('pm');
  const s = schrittDaten(g, [0, 0.3], 2);
  assert.equal(s.bilder[1].gleich, 0);
  assert.equal(s.bilder[1].gitter, false);
  assert.equal(s.verschieden, 1);
  // auf x = 1/2 nur bis auf eine Gittertranslation
  const t = schrittDaten(g, [0.5, 0.3], 2);
  assert.equal(t.bilder[1].gitter, true);
  assert.match(schrittHTML(g.daten, s, lage(g, [0, 0.3]), g.ordnung), /fällt genau auf Bild \(1\)/);
});

test('c2mm: zweite Hälfte der Liste mit (½, ½)+, Nummern mit Strich', () => {
  const g = gruppe('c2mm');
  const s = schrittDaten(g, [0.12, 0.31], 5);
  assert.equal(s.bilder[4].nr, 1);
  assert.deepEqual(s.bilder[4].zentr, [0.5, 0.5]);
  assert.match(schrittHTML(g.daten, s, lage(g, [0.12, 0.31]), g.ordnung), /Operation \(1′\)/);
});

test('Tafel A: Bilder ausserhalb der Zelle, Weg der aktuellen Operation, Zeile markiert im Link', () => {
  const z = { ...startzustand(), gruppe: 'p4mm', schritt: 2 };
  const a = tafelA('p4mm', z, F);
  assert.match(a.svg, /class="schritte"/);
  assert.match(a.svg, /\(2\)/);
  const leer = tafelA('p4mm', startzustand(), F);
  assert.ok(a.ansicht.s < leer.ansicht.s, 'Ansicht schliesst x̄, ȳ ausserhalb der Zelle ein');
  const t = tafelA('p4mm', { ...z, schritt: 9 }, F);
  assert.match(t.svg, /class="objekte"|<g class="schritte">/);
  assert.match(hashVon(z), /schritt=2/);
  const z2 = startzustand(); hashAnwenden(z2, '#m=eg&g=p4mm&schritt=3');
  assert.equal(z2.schritt, 3);
  hashAnwenden(z2, '#m=eg&g=p4mm&schritt=x');
  assert.equal(z2.schritt, 0);
});
