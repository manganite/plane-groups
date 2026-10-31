// „Symmetrie brechen“: verbleibende Operationen, Untergruppe nach ITA, Text, Link-Adresse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe } from '../js/symmetrie.js';
import { gebrochen, tafelA, tafelB } from '../js/zeichnung.js';
import { brechAnalyse, brechHTML } from '../js/brechen.js';
import { startzustand, hashVon, hashAnwenden, GITTER_START } from '../js/zustand.js';

const F = { paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf', dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80' };
const sym = (id, frei) => brechAnalyse(gruppe(id), frei).ergebnis.symbol;

test('Ohne Bruch bleibt die Gruppe (Metrik des Systems), für alle 17 Gruppen', () => {
  for (const d of EBENENGRUPPEN) {
    const an = brechAnalyse(gruppe(d.symbol), GITTER_START[d.system]);
    assert.equal(an.weg.length, 0, d.symbol);
    assert.equal(an.ergebnis.symbol, d.symbol, d.symbol);
    assert.match(brechHTML(d, GITTER_START[d.system], an), /unverändert/);
  }
});

test('Quadratisch: a ≠ b → rechteckig, γ ≠ 90° bei a = b → zentriert rechteckig', () => {
  assert.equal(sym('p4mm', { ba: 1.2, gamma: 90 }), 'p2mm');
  assert.equal(sym('p4mm', { ba: 1, gamma: 100 }), 'c2mm');
  assert.equal(sym('p4mm', { ba: 1.2, gamma: 100 }), 'p2');
  assert.equal(sym('p4gm', { ba: 1.2, gamma: 90 }), 'p2gg');
  assert.equal(sym('p4', { ba: 1.2, gamma: 90 }), 'p2');
  const an = brechAnalyse(gruppe('p4mm'), { ba: 1.2, gamma: 90 });
  assert.deepEqual(an.drehWeg, [{ n: 4, neu: 2 }]);
  assert.ok(an.linienWeg.some((l) => l.art === 'spiegel' && l.richtung[0] === 1 && l.richtung[1] === 1), 'Spiegellinien entlang [11]');
  const html = brechHTML(gruppe('p4mm').daten, { ba: 1.2, gamma: 90 }, an);
  assert.match(html, /<strong>4 von 8<\/strong>/);
  assert.match(html, /bleiben 2-zählig/);
  const c = brechHTML(gruppe('p4mm').daten, { ba: 1, gamma: 100 }, brechAnalyse(gruppe('p4mm'), { ba: 1, gamma: 100 }));
  assert.match(c, /konventionelle Zelle nach ITA: <i>a<\/i>′ = /, 'zentrierte Zelle auf den Diagonalen');
});

test('Hexagonal und rechteckig', () => {
  assert.equal(sym('p6mm', { ba: 1, gamma: 110 }), 'c2mm');
  assert.equal(sym('p6', { ba: 1.2, gamma: 120 }), 'p2');
  assert.equal(sym('p3', { ba: 1.2, gamma: 120 }), 'p1');
  assert.equal(sym('p2mm', { ba: 1.35, gamma: 100 }), 'p2');
  assert.equal(sym('pm', { ba: 1.35, gamma: 100 }), 'p1');
  assert.equal(sym('cm', { ba: 1.35, gamma: 100 }), 'p1');
  // schiefwinklig: nichts zu brechen
  assert.equal(sym('p2', { ba: 1.4, gamma: 70 }), 'p2');
});

test('Tafeln und Link-Adresse', () => {
  const z = { ...startzustand(), gruppe: 'p4mm', brechen: true, frei: { ba: 1.2, gamma: 90 } };
  const svg = tafelA('p4mm', z, F).svg;
  assert.doesNotMatch(svg, /opacity="0.3"/, 'keine blasse Vorlage: nur die Restsymmetrie');
  // die Bilder zerfallen in 2 Bahnen: zwei Farben für die Fähnchen
  const farben = new Set([...svg.matchAll(/class="objekte">(.*?)<\/g>/gs)].flatMap((m) => [...m[1].matchAll(/stroke="(#[0-9a-f]+)"/g)].map((x) => x[1])));
  assert.ok(farben.size >= 2, 'Fähnchen nach Bahnen gefärbt');
  assert.equal(brechAnalyse(gruppe('p4mm'), z.frei).bahnen, 2);
  assert.equal(brechAnalyse(gruppe('p6mm'), { ba: 1, gamma: 110 }).bahnen, 3);
  assert.match(brechHTML(gruppe('p4mm').daten, z.frei, brechAnalyse(gruppe('p4mm'), z.frei)), /zerfallen in <strong>2 Bahnen<\/strong>/);
  assert.ok(!/NaN/.test(tafelB('p4mm', z, F).svg));
  assert.equal(gebrochen(gruppe('p4mm'), z.frei).bleibt.length, 4);
  const h = hashVon(z);
  assert.match(h, /brechen=1&ba=1\.2&gamma=90/);
  const z2 = startzustand(); hashAnwenden(z2, h);
  assert.equal(z2.brechen, true);
  assert.deepEqual(z2.frei, { ba: 1.2, gamma: 90 });
  hashAnwenden(z2, '#m=eg&g=p4mm&brechen=1&ba=9');
  assert.deepEqual(z2.frei, GITTER_START.quadratisch, 'ungültig: Metrik des Systems');
  // im schiefwinkligen System gibt es nichts zu brechen
  hashAnwenden(z2, '#m=eg&g=p2&brechen=1&ba=1.3&gamma=80');
  assert.equal(z2.brechen, false);
});
