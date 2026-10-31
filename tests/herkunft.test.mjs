// Herkunft der Symmetrieelemente aus den Erzeugenden: „Aufbau“ und „Warum ist das da?“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, verknuepfen, beschreibe, erzeugende } from '../js/symmetrie.js';
import { herkunft, herleitung, herkunftVon, schrittVon, elementSchluessel, elementVonOp } from '../js/herkunft.js';
import { elementeImBereich, aufbauElemente, erklaerungsDaten, metrik, tafelA } from '../js/zeichnung.js';
import { erklaerungHTML, regel, vektorText } from '../js/warum.js';
import { startzustand, hashVon, hashAnwenden, GITTER_START } from '../js/zustand.js';
import { liesOp, translation } from '../js/symmetrie.js';

const ALLE = EBENENGRUPPEN.map((d) => d.symbol);
const gleich = (a, b) => a.R.every((r, i) => r.every((v, j) => v === b.R[i][j])) && a.t.every((v, i) => Math.abs(v - b.t[i]) < 1e-9);

for (const id of ALLE) {
  test(`${id}: jedes Element in 2 × 2 Zellen hat eine Herkunft; die Herleitung rechnet sich nach`, () => {
    const g = gruppe(id);
    const erz = erzeugende(g);
    const e = elementeImBereich(g, 2);
    for (const el of [...e.drehpunkte, ...e.linien]) {
      const h = herkunftVon(g, el);
      assert.ok(h, `${id}: ${elementSchluessel(el)}`);
      // das Element der Operation ist das gezeichnete Element
      assert.equal(elementSchluessel(elementVonOp(g, h.op)), elementSchluessel(el));
      assert.ok(schrittVon(g, el) >= 1);
      const kette = herleitung(g, h.schluessel);
      assert.equal(kette.length, h.tiefe);
      for (const s of kette) assert.ok(gleich(verknuepfen(s.a, s.b), s.c), `${id}: ${beschreibe(s.c)} = ${beschreibe(s.a)} ∘ ${beschreibe(s.b)}`);
      // der erste Schritt verknüpft eine Erzeugende nach ITA mit der Identität
      const letzt = kette[kette.length - 1];
      assert.ok(erz.some((x) => gleich(x, letzt.c)) || letzt.aTranslation, `${id}: Kette endet bei einer Erzeugenden`);
    }
  });

  test(`${id}: Aufbau: der letzte Schritt zeigt alle Elemente, jeder Schritt mindestens die früheren`, () => {
    const g = gruppe(id);
    const max = herkunft(g).maxTiefe;
    const voll = elementeImBereich(g, 1);
    const ende = aufbauElemente(g, 1, max);
    assert.equal(ende.linien.length, voll.linien.length);
    assert.deepEqual(ende.drehpunkte.map((d) => Math.max(...d.ordnungen)).sort(), voll.drehpunkte.map((d) => d.n).sort());
    let vorher = 0;
    for (let s = 1; s <= max; s++) {
      const a = aufbauElemente(g, 1, s);
      const zahl = a.linien.length + a.drehpunkte.length;
      assert.ok(zahl >= vorher, `${id}: Schritt ${s}`);
      vorher = zahl;
    }
  });

  test(`${id}: Erklärung jedes Elements ohne Lücken (HTML und Zeichnung)`, () => {
    const g = gruppe(id);
    const d = EBENENGRUPPEN.find((x) => x.symbol === id);
    const M = metrik(GITTER_START[d.system]);
    const e = elementeImBereich(g, 1);
    for (const el of [...e.drehpunkte, ...e.linien]) {
      const k = elementSchluessel(el);
      const daten = erklaerungsDaten(g, k, [0.12, 0.31], 1, M);
      assert.ok(daten, `${id}: ${k}`);
      for (const phase of [0, 3]) {
        const html = erklaerungHTML(g, daten, M, phase);
        assert.ok(!/undefined|NaN|null/.test(html), `${id}: ${k}`);
      }
      const z = { ...startzustand(), gruppe: id, erkl: k };
      for (const phase of [0, 1, 2, 3]) assert.ok(!/NaN|undefined/.test(tafelA(id, z, FARBEN, { phase }).svg), `${id}: ${k} Phase ${phase}`);
    }
  });
}

const FARBEN = {
  paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf',
  dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80',
};

test('p4mm: diagonale Gleitspiegellinie = Translation ∘ Spiegelung an x, x (Konzept §3.1)', () => {
  const g = gruppe('p4mm');
  const gl = elementeImBereich(g, 1).linien.filter((l) => l.art === 'gleit');
  assert.ok(gl.length > 0);
  for (const l of gl) {
    const [s] = herleitung(g, herkunftVon(g, l).schluessel);
    assert.ok(s.aTranslation, 'A ist eine Translation');
    assert.match(beschreibe(s.b), /^m x,-?x$/);
    assert.match(regel(s.a, s.b, s.c, metrik(GITTER_START.quadratisch)), /schräg/);
  }
});

test('c2mm: Gleitspiegellinie b bei x = 1/4 = Zentrierungstranslation ∘ m 0,y (Konzept §3.1)', () => {
  const g = gruppe('c2mm');
  const l = elementeImBereich(g, 1).linien.find((x) => x.art === 'gleit' && x.richtung[0] === 0 && Math.abs(x.punkt[0] - 0.25) < 1e-9);
  const [s] = herleitung(g, herkunftVon(g, l).schluessel);
  assert.equal(beschreibe(s.c), 'b 1/4,y');
  assert.equal(beschreibe(s.a), 't(1/2,1/2)');
  assert.equal(beschreibe(s.b), 'm 0,y');
});

test('p6: Schritt 1 zeigt am Ursprung die Erzeugenden 3 und 2, Schritt 2 die 6', () => {
  const g = gruppe('p6');
  const urs = (s) => aufbauElemente(g, 1, s).drehpunkte.find((d) => d.punkt[0] === 0 && d.punkt[1] === 0);
  assert.deepEqual([...urs(1).ordnungen].sort(), [2, 3]);
  assert.deepEqual(urs(2).ordnungen, [6]);
});

test('Regeln: zwei Spiegelungen im Winkel α ergeben eine Drehung um 2α', () => {
  const M = metrik(GITTER_START.quadratisch);
  const r = regel(liesOp('y,x'), liesOp('-x,y'), liesOp('-y,x'), M);
  assert.match(r, /45° .*2 · 45° = 90°/);
  assert.match(regel(translation([1, 0]), liesOp('-x,-y'), liesOp('-x+1,-y'), M), /Mitte der Translation/);
  assert.match(regel(translation([1, 0]), liesOp('-x,y'), liesOp('-x+1,y'), M), /senkrecht/);
});

test('Vektoren in a und b', () => {
  const t = (v) => vektorText(v).replace(/<[^>]+>/g, '');
  assert.equal(t([1, 0]), 'a');
  assert.equal(t([0, -1]), '−b');
  assert.equal(t([1, 1]), 'a + b');
  assert.equal(t([0.5, 0.5]), '(a + b)/2');
  assert.equal(t([2, -1]), '2a − b');
});

test('Link-Adresse: Werkzeug, gewähltes Element und Aufbau hin und zurück', () => {
  const z = { ...startzustand(), gruppe: 'p4mm', warum: true, erkl: 'g;-1/2,0;1,1', aufbau: 2 };
  const h = hashVon(z);
  assert.match(h, /warum=1&erkl=g;-1\/2,0;1,1&aufbau=2/);
  const z2 = startzustand();
  hashAnwenden(z2, h);
  assert.equal(z2.erkl, 'g;-1/2,0;1,1');
  assert.equal(z2.aufbau, 2);
  assert.equal(z2.warum, true);
  hashAnwenden(z2, '#m=eg&g=p4mm&erkl=<script>&aufbau=x');
  assert.equal(z2.erkl, null);
  assert.equal(z2.aufbau, 0);
});
