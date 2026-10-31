// „Selbst zeichnen“: Kopien der Striche, Pflasterung durch die asymmetrische Einheit, Zustand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe } from '../js/symmetrie.js';
import { kopien, vereinfachen, tafelA, tafelB, radieren, metrik } from '../js/zeichnung.js';
import { startzustand, hashVon, hashAnwenden } from '../js/zustand.js';

const F = { paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf', dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80' };

/** Punkt im Polygon (Strahlverfahren), Bruchkoordinaten. */
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
    const st = [[0.13, 0.29], [0.17, 0.33]];
    const inZelle = kopien(g, st, 0, 1).filter((k) => k.punkte[0].every((v) => v >= 0 && v < 1));
    assert.equal(inZelle.length, g.ordnung);
    assert.equal(kopien(g, st, 0, 1).filter((k) => k.urbild).length, 1);
  });
}

test('Striche vereinfachen: Gerade wird zu zwei Punkten, Ecken bleiben', () => {
  const gerade = Array.from({ length: 50 }, (_, i) => [i / 100, i / 200]);
  assert.equal(vereinfachen(gerade).length, 2);
  const ecke = [[0, 0], [0.1, 0], [0.2, 0], [0.2, 0.1], [0.2, 0.2]];
  assert.deepEqual(vereinfachen(ecke), [[0, 0], [0.2, 0], [0.2, 0.2]]);
});

test('Zeichnung in Tafel A und im Muster; Link: fuell, Striche bleiben beim Öffnen eines Links', () => {
  const z = { ...startzustand(), gruppe: 'p4mm', striche: [[[0.1, 0.2], [0.2, 0.3]]], aeFuell: true };
  assert.match(tafelA('p4mm', z, F).svg, /class="zeichnung"/);
  assert.match(tafelB('p4mm', z, F).svg, /class="zeichnung"/);
  assert.match(hashVon(z), /fuell=1/);
  assert.doesNotMatch(hashVon(z), /striche|0\.1,0\.2/);
  const z2 = { ...startzustand(), striche: [[[0, 0], [0.5, 0.5]]] };
  hashAnwenden(z2, '#m=eg&g=p2&fuell=1');
  assert.equal(z2.aeFuell, true);
  assert.equal(z2.striche.length, 1);
});

test('Radieren: nur das überfahrene Stück, auch an einer Kopie, Strich zerfällt', () => {
  const M = metrik({ ba: 1, gamma: 90 });
  const quer = [[[0.1, 0.5], [0.9, 0.5]]];
  // in der Mitte: zwei Stücke, die Lücke so breit wie der Kreis
  const r = radieren(quer, gruppe('p1'), M, [0.5, 0.5], 0.05);
  assert.deepEqual(r, [[[0.1, 0.5], [0.45, 0.5]], [[0.55, 0.5], [0.9, 0.5]]]);
  // daneben: nichts
  assert.deepEqual(radieren(quer, gruppe('p1'), M, [0.5, 0.8], 0.05), quer);
  // an einer Gitterkopie (eine Zelle weiter) wirkt es ebenso
  assert.deepEqual(radieren(quer, gruppe('p1'), M, [1.5, 0.5], 0.05), r);
  // pm: an der Spiegelkopie bei −x radiert, fehlt das Stück am Original
  const senk = [[[0.2, 0.1], [0.2, 0.9]]];
  assert.deepEqual(radieren(senk, gruppe('pm'), M, [-0.2, 0.5], 0.05), [[[0.2, 0.1], [0.2, 0.45]], [[0.2, 0.55], [0.2, 0.9]]]);
  // p4: an der um 90° gedrehten Kopie
  const g4 = gruppe('p4');
  const kopie = kopien(g4, senk[0], 0, 1).find((k) => !k.urbild && Math.abs(k.punkte[0][1] - k.punkte[1][1]) > 0.5 === false);
  const mitte = [(kopie.punkte[0][0] + kopie.punkte[1][0]) / 2, (kopie.punkte[0][1] + kopie.punkte[1][1]) / 2];
  assert.equal(radieren(senk, g4, M, mitte, 0.05).length, 2, 'p4: Kopie radiert → Original geteilt');
  // ganz überfahren: Strich weg
  assert.deepEqual(radieren([[[0.5, 0.5], [0.52, 0.5]]], gruppe('p1'), M, [0.51, 0.5], 0.05), []);
});
