// Link-Adressen: Format ist eine Schnittstelle (README), hin und zurück stabil.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startzustand, hashVon, hashAnwenden, GITTER_START } from '../js/zustand.js';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';

test('Startzustand: nur Modus, Gruppe und Lage des Objekts in der Adresse', () => {
  assert.equal(hashVon(startzustand()), '#m=eg&g=p2mg&x=0.12&y=0.31');
});

test('hin und zurück: jede Gruppe, Schalter, Gitter', () => {
  for (const d of EBENENGRUPPEN) {
    const z = { ...startzustand(), gruppe: d.symbol, punkt: [0.1234, 0.5], ae: true, elemente: false, zellen: 2, form: 'komma', einrasten: false };
    if (d.system === 'schiefwinklig') z.gitter.schiefwinklig = { ba: 1.4, gamma: 110 };
    if (d.system === 'rechteckig') z.gitter.rechteckig = { ba: 0.8, gamma: 90 };
    const h = hashVon(z);
    const z2 = startzustand();
    assert.equal(hashAnwenden(z2, h), true);
    assert.equal(hashVon(z2), h, d.symbol);
    assert.equal(z2.gruppe, d.symbol);
    assert.deepEqual(z2.punkt, [0.1234, 0.5]);
  }
});

test('Gitter: nur die freien Parameter des Systems stehen in der Adresse', () => {
  const z = { ...startzustand(), gruppe: 'p4mm' };
  z.gitter.quadratisch = { ba: 1.3, gamma: 100 }; // nicht frei: wird nicht geschrieben
  assert.ok(!/ba=|gamma=/.test(hashVon(z)));
  const z2 = startzustand();
  hashAnwenden(z2, '#m=eg&g=p4mm&ba=1.3&gamma=100');
  assert.deepEqual(z2.gitter.quadratisch, GITTER_START.quadratisch);
  hashAnwenden(z2, '#m=eg&g=pm&ba=1.1&gamma=100');
  assert.equal(z2.gitter.rechteckig.ba, 1.1);
  assert.equal(z2.gitter.rechteckig.gamma, 90);
});

test('ungültige Werte werden ignoriert, ohne Modus kein Link', () => {
  const z = startzustand();
  assert.equal(hashAnwenden(z, '#g=p6'), false);
  hashAnwenden(z, '#m=eg&g=p7&x=abc&y=0.2&zellen=5&form=stern&ba=9');
  assert.equal(z.gruppe, 'p2mg');
  assert.deepEqual(z.punkt, [startzustand().punkt[0], 0.2]); // x ungültig: Startwert; y gültig
  assert.equal(z.zellen, 1);
  assert.equal(z.form, 'fahne');
  assert.equal(z.gitter.rechteckig.ba, GITTER_START.rechteckig.ba);
});

test('spezielle Lagen bleiben beim Neuladen speziell (Brüche exakt in der Adresse; Review PR #2)', async () => {
  const { gruppe, lage, punktAufLage } = await import('../js/symmetrie.js');
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol);
    for (const w of d.wyckoff) {
      const z = { ...startzustand(), gruppe: d.symbol, punkt: punktAufLage(g, w.b, [0.3, 0.2]) };
      const z2 = startzustand();
      hashAnwenden(z2, hashVon(z));
      assert.equal(lage(g, z2.punkt).buchstabe, w.b, `${d.symbol} ${w.b}: ${hashVon(z)}`);
    }
  }
  const z = { ...startzustand(), gruppe: 'p3', punkt: [1 / 3, 2 / 3] };
  assert.match(hashVon(z), /x=1\/3&y=2\/3/);
});

test('fehlende Koordinaten behalten den Startwert (Review PR #2)', () => {
  const z = startzustand();
  hashAnwenden(z, '#m=eg&g=p4mm');
  assert.deepEqual(z.punkt, startzustand().punkt);
  hashAnwenden(z, '#m=eg&g=p4mm&x=0.4');
  assert.deepEqual(z.punkt, [0.4, startzustand().punkt[1]]);
  hashAnwenden(z, '#m=eg&g=p4mm&x=&y=1/4');
  assert.deepEqual(z.punkt, [startzustand().punkt[0], 0.25]);
});

test('Beispiel aus dem Konzept: #m=eg&g=p4gm&x=0.12&y=0.31', () => {
  const z = startzustand();
  hashAnwenden(z, '#m=eg&g=p4gm&x=0.12&y=0.31');
  assert.equal(z.gruppe, 'p4gm');
  assert.deepEqual(z.punkt, [0.12, 0.31]);
});
