// „Muster entwerfen“ zeichnen: Kopien der Striche, Radieren, Pflasterung durch die asymmetrische Einheit, Zustand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe } from '../js/symmetrie.js';
import { kopien, vereinfachen, tafelA, tafelB, radieren, metrik } from '../js/zeichnung.js';
import { startzustand, hashVon, hashAnwenden, entwurfStart, GITTER_START } from '../js/zustand.js';
import { strukturTafelA, strukturTafelB, festeBestimmung } from '../js/struktur.js';
import { grad } from '../js/zeichnung.js';
import { ausgeschrieben } from '../js/bahnen.js';
import { da } from './hilfen.mjs';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Farben } from '../js/zeichnung.js' */
/** @import { Zustand } from '../js/zustand.js' */

/** @type {Farben} */
const F = { paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf', dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80' };

/** Punkt im Polygon (Strahlverfahren), Bruchkoordinaten. @param {number[]} p @param {number[][]} poly */
function innen(p, poly) {
  let ja = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) ja = !ja;
  }
  return ja;
}

for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: Die Bilder der asymmetrischen Einheit pflastern die Zelle lückenlos und ohne Überlappung`, () => {
    const g = gruppe(d.symbol);
    const polys = kopien(g, d.ae.ecken, 0, 1, 0).map((k) => k.punkte);
    // Rasterpunkte mit krummen Versätzen, damit keiner auf einer Grenze liegt
    for (let i = 0; i < 23; i++) for (let j = 0; j < 29; j++) {
      const p = [(i + 0.317) / 23, (j + 0.581) / 29];
      const n = polys.filter((q) => innen(p, q)).length;
      assert.equal(n, 1, `${d.symbol}: (${p.map((v) => v.toFixed(3))}) in ${n} Bildern`);
    }
  });

  test(`${d.symbol}: ein kurzer Strich in der Zelle hat je Zelle so viele Kopien wie Operationen`, () => {
    const g = gruppe(d.symbol);
    /** @type {Vec2[]} */
    const st = [[0.13, 0.29], [0.17, 0.33]];
    const inZelle = kopien(g, st, 0, 1).filter((k) => k.punkte[0].every((v) => v >= 0 && v < 1));
    assert.equal(inZelle.length, g.ordnung);
    assert.equal(kopien(g, st, 0, 1).filter((k) => k.urbild).length, 1);
  });
}

test('Striche vereinfachen: Gerade wird zu zwei Punkten, Ecken bleiben', () => {
  const gerade = Array.from({ length: 50 }, (_, i) => /** @type {Vec2} */ ([i / 100, i / 200]));
  assert.equal(vereinfachen(gerade).length, 2);
  /** @type {Vec2[]} */
  const ecke = [[0, 0], [0.1, 0], [0.2, 0], [0.2, 0.1], [0.2, 0.2]];
  assert.deepEqual(vereinfachen(ecke), [[0, 0], [0.2, 0], [0.2, 0.2]]);
});

test('Gefüllte asymmetrische Einheit in Tafel A und im Muster; Link: fuell', () => {
  /** @type {Zustand} */
  const z = { ...startzustand(), gruppe: 'p4mm', aeFuell: true };
  assert.match(tafelA('p4mm', z, F).svg, /class="zeichnung"/);
  assert.match(tafelB('p4mm', z, F).svg, /class="zeichnung"/);
  assert.match(hashVon(z), /fuell=1/);
  assert.doesNotMatch(tafelA('p4mm', { ...z, aeFuell: false }, F).svg, /class="zeichnung"/);
});

test('Striche im Entwurf: Kopien in Tafel A und im Muster, alle in der Farbe ihrer Atomsorte, nicht im Link', () => {
  const strich = { punkte: /** @type {Vec2[]} */ ([[0.1, 0.2], [0.2, 0.3]]), farbe: 2 };
  const en = { ...entwurfStart('p4mm'), striche: [strich] };
  const st = { ...en, bindungen: false, basis: [] };
  const r = festeBestimmung(en);
  const a = strukturTafelA(st, { elemente: false, zelle: true, ae: false, bindungen: false, farben: false, fuell: false, zoom: null }, F, null, null, r).svg;
  const b = strukturTafelB(st, F, r, 1, { zelle: true, elemente: false }).svg;
  for (const [name, svg] of [['A', a], ['B', b]]) {
    const gr = svg.match(/<g class="striche">(.*?)<\/g>/)?.[1] ?? '';
    const farben = new Set([...gr.matchAll(/stroke="([^"]+)"/g)].map((m) => m[1]));
    assert.deepEqual([...farben], [F.dir[1]], `Tafel ${name}: eine Farbe (Atomsorte 3), Spiegelbilder ohne eigene`);
    assert.ok((gr.match(/<path /g) ?? []).length >= 8, `Tafel ${name}: mindestens 8 Operationen der Gruppe`);
  }
  // andere Atomsorte, andere Farbe; ohne Striche keine Gruppe
  assert.match(strukturTafelB({ ...st, striche: [{ ...strich, farbe: 0 }] }, F, r, 1).svg, new RegExp(`<g class="striche"><path[^>]*stroke="${F.upper}"`));
  assert.doesNotMatch(strukturTafelB({ ...st, striche: [] }, F, r, 1).svg, /class="striche"/);
  // „Gitter und Basis“ hat keine Striche
  assert.doesNotMatch(strukturTafelB({ ...GITTER_START.quadratisch, basis: [] }, F, null, 1).svg, /class="striche"/);
  // Link ohne Striche, Speicher mit
  const z = { ...startzustand(), modus: /** @type {const} */ ('entwurf'), entwurf: en };
  assert.doesNotMatch(hashVon(z), /striche|0\.1,0\.2/);
});

test('Radieren: nur das überfahrene Stück, auch an einer Kopie, Strich zerfällt', () => {
  const M = metrik({ ba: 1, gamma: grad(90) });
  /** @type {Vec2[][]} */
  const quer = [[[0.1, 0.5], [0.9, 0.5]]];
  // in der Mitte: zwei Stücke, die Lücke so breit wie der Kreis
  const r = radieren(quer, gruppe('p1'), M, [0.5, 0.5], 0.05);
  assert.deepEqual(r, [[[0.1, 0.5], [0.45, 0.5]], [[0.55, 0.5], [0.9, 0.5]]]);
  // daneben: nichts
  assert.deepEqual(radieren(quer, gruppe('p1'), M, [0.5, 0.8], 0.05), quer);
  // an einer Gitterkopie (eine Zelle weiter) wirkt es ebenso
  assert.deepEqual(radieren(quer, gruppe('p1'), M, [1.5, 0.5], 0.05), r);
  // pm: an der Spiegelkopie bei −x radiert, fehlt das Stück am Original
  /** @type {Vec2[][]} */
  const senk = [[[0.2, 0.1], [0.2, 0.9]]];
  assert.deepEqual(radieren(senk, gruppe('pm'), M, [-0.2, 0.5], 0.05), [[[0.2, 0.1], [0.2, 0.45]], [[0.2, 0.55], [0.2, 0.9]]]);
  // p4: an der um 90° gedrehten Kopie
  const g4 = gruppe('p4');
  const kopie = da(kopien(g4, senk[0], 0, 1).find((k) => !k.urbild && Math.abs(k.punkte[0][1] - k.punkte[1][1]) > 0.5 === false));
  /** @type {Vec2} */
  const mitte = [(kopie.punkte[0][0] + kopie.punkte[1][0]) / 2, (kopie.punkte[0][1] + kopie.punkte[1][1]) / 2];
  assert.equal(radieren(senk, g4, M, mitte, 0.05).length, 2, 'p4: Kopie radiert → Original geteilt');
  // ganz überfahren: Strich weg
  assert.deepEqual(radieren([[[0.5, 0.5], [0.52, 0.5]]], gruppe('p1'), M, [0.51, 0.5], 0.05), []);
});

test('Bindungen im Entwurf: zwischen den Atomen aller Bilder, schaltbar, im Link nur bei Abweichung', () => {
  const en = { ...entwurfStart('p4mm'), basis: [{ motiv: 'atom', farbe: 0, p: /** @type {Vec2} */ ([0.1, 0.2]), winkel: grad(0) }] };
  const bindungen = (/** @type {boolean} */ an) => {
    const e = { ...en, bindungen: an };
    const st = { ...ausgeschrieben(e) };
    const r = festeBestimmung(e);
    return [strukturTafelA(st, { elemente: false, zelle: true, ae: false, bindungen: an, farben: false }, F, null, null, r).svg, strukturTafelB(st, F, r, 1).svg];
  };
  const linien = (/** @type {string} */ svg) => (svg.match(new RegExp(`<path d="[^"]*" stroke="${F.muted}" stroke-width="1.6"`)) ?? []).length;
  for (const svg of bindungen(true)) assert.equal(linien(svg), 1, 'ein Pfad mit den Bindungen');
  for (const svg of bindungen(false)) assert.equal(linien(svg), 0);
  // Startwert: an; der Link trägt den Schalter nur, wenn er abweicht, und liest ihn zurück
  assert.equal(entwurfStart().bindungen, true);
  const z = { ...startzustand(), modus: /** @type {const} */ ('entwurf'), entwurf: en };
  assert.doesNotMatch(hashVon(z), /bind/);
  z.entwurf = { ...en, bindungen: false };
  assert.match(hashVon(z), /bind=0/);
  const z2 = startzustand(); hashAnwenden(z2, hashVon(z));
  assert.equal(z2.entwurf.bindungen, false);
});
