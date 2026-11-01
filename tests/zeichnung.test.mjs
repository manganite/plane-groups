// Zeichnung: Metrik, Ansicht, Zuordnung der Linien zu den Blickrichtungen, Tafeln ohne Fehler.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe } from '../js/symmetrie.js';
import {
  metrik, kart, bruchVon, kartMatrix, ansicht, blickrichtung, elementeImBereich, tafelA, tafelB, bilder,
} from '../js/zeichnung.js';
import { startzustand, GITTER_START } from '../js/zustand.js';

const FARBEN = {
  paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf',
  dir: ['#a0a', '#0a0', '#aa0'],
};
const nahe = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;

test('Metrik: Länge von b ist b/a, Winkel zwischen a und b ist γ; b zeigt nach rechts', () => {
  for (const g of [{ ba: 1, gamma: 90 }, { ba: 1.3, gamma: 90 }, { ba: 1, gamma: 120 }, { ba: 1.25, gamma: 105 }]) {
    const M = metrik(g);
    assert.ok(nahe(Math.hypot(...M.a), 1));
    assert.ok(nahe(Math.hypot(...M.b), g.ba));
    const cos = (M.a[0] * M.b[0] + M.a[1] * M.b[1]) / g.ba;
    assert.ok(nahe(Math.acos(cos) * 180 / Math.PI, g.gamma));
    assert.ok(M.b[0] > 0 && M.b[1] === 0);
    assert.ok(M.a[1] > 0, 'a zeigt nach unten');
  }
});

test('Ansicht: Bruchkoordinaten ↔ Bildpunkte umkehrbar', () => {
  const M = metrik({ ba: 1.25, gamma: 105 });
  const A = ansicht(M, [-0.3, 0, 1.3, 1]);
  for (const p of [[0, 0], [0.3, 0.7], [1, 1], [-0.2, 1.4]]) {
    const q = A.vonBild(A.zuBild(p));
    assert.ok(nahe(q[0], p[0]) && nahe(q[1], p[1]), String(p));
    const c = bruchVon(M, kart(M, p));
    assert.ok(nahe(c[0], p[0]) && nahe(c[1], p[1]));
  }
});

test('Operationen sind in der Metrik ihres Systems Isometrien (Objekte werden nicht verzerrt)', () => {
  for (const d of EBENENGRUPPEN) {
    const M = metrik(GITTER_START[d.system]);
    for (const op of gruppe(d.symbol).alle) {
      const C = kartMatrix(M, op.R);
      // CᵀC = I
      const s = (i, j) => C[0][i] * C[0][j] + C[1][i] * C[1][j];
      assert.ok(nahe(s(0, 0), 1, 1e-9) && nahe(s(1, 1), 1, 1e-9) && nahe(s(0, 1), 0, 1e-9), `${d.symbol}`);
    }
  }
});

test('Blickrichtungen: Linien an jeder Stelle passen zum vollständigen Hermann-Mauguin-Symbol', () => {
  // vollständiges Symbol: Zentrierung, Drehung, dann je eine Stelle für die 2. und 3. Blickrichtung
  for (const d of EBENENGRUPPEN) {
    if (d.system === 'schiefwinklig') continue;
    const zeichen = d.lang.slice(2).split('');
    const { linien } = elementeImBereich(gruppe(d.symbol), 1);
    for (const pos of [2, 3]) {
      const c = zeichen[pos - 2] ?? '1';
      const hier = linien.filter((l) => blickrichtung(d.system, l.normale) === pos);
      if (c === 'm') assert.ok(hier.some((l) => l.art === 'spiegel'), `${d.symbol}: Spiegellinie an Stelle ${pos}`);
      if (c === 'g') assert.ok(hier.length > 0 && hier.every((l) => l.art === 'gleit'), `${d.symbol}: nur Gleitspiegellinien an Stelle ${pos}`);
      if (c === '1') assert.equal(hier.length, 0, `${d.symbol}: keine Linie an Stelle ${pos}`);
    }
  }
});

test('Tafeln: für alle Gruppen und Optionen gültiges SVG ohne NaN', () => {
  for (const d of EBENENGRUPPEN) {
    for (const opt of [{}, { zellen: 2, ae: true, form: 'komma', musterElemente: true, farben: false }]) {
      const z = { ...startzustand(), gruppe: d.symbol, ...opt };
      const a = tafelA(d.symbol, z, FARBEN).svg;
      const b = tafelB(d.symbol, z, FARBEN).svg;
      for (const s of [a, b]) {
        assert.ok(!/NaN|undefined|Infinity/.test(s), `${d.symbol}: ${JSON.stringify(opt)}`);
        assert.equal((s.match(/</g) || []).length > 5, true);
      }
      // so viele Objekte wie Bilder in der Zelle (mit Rand)
      const n = bilder(gruppe(d.symbol), z.punkt, 0, z.zellen).length;
      const objekte = z.form === 'komma' ? (a.match(/<circle [^>]*r="7"/g) || []).length : (a.match(/<polygon [^>]*fill-opacity="0.85"/g) || []).length;
      assert.equal(objekte, n, `${d.symbol}: Objekte in Tafel A`);
    }
  }
});

test('Bilder: in der Zelle so viele wie die Zähligkeit der allgemeinen Lage', () => {
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol);
    const innen = bilder(g, [0.123, 0.317], 0, 1, 0).filter((b) => b.punkt.every((v) => v >= 0 && v < 1));
    assert.equal(innen.length, d.wyckoff[0].n, d.symbol);
  }
});

test('Ausgangsobjekt: Ring folgt dem Objekt auch in der zweiten Zelle (Review PR #2)', async () => {
  const { ausgangsstelle } = await import('../js/zeichnung.js');
  assert.deepEqual(ausgangsstelle([1.3, 0.4], 2), [1.3, 0.4]);
  const r = ausgangsstelle([1.3, 0.4], 1);
  assert.ok(Math.abs(r[0] - 0.3) < 1e-12 && r[1] === 0.4);
  const z = { ...startzustand(), gruppe: 'p2', zellen: 2, punkt: [1.3, 0.4] };
  const { svg, ansicht: A } = tafelA('p2', z, FARBEN);
  const [x, y] = A.zuBild([1.3, 0.4]);
  const m = svg.match(/class="ausgang" cx="([\d.]+)" cy="([\d.]+)"/);
  assert.ok(Math.abs(Number(m[1]) - x) < 0.01 && Math.abs(Number(m[2]) - y) < 0.01);
});

test('Asymmetrische Einheit: alle Bedingungen zusammen ergeben genau die Fläche der ITA (alle 17 Gruppen)', async () => {
  const { bedingungen, bereich, flaeche } = await import('../js/asymmetrie.js');
  const { EBENENGRUPPEN } = await import('../js/ebenengruppen.js');
  const { gruppe } = await import('../js/symmetrie.js');
  for (const d of EBENENGRUPPEN) {
    const b = bedingungen(d.ae.text);
    assert.equal(b.length, d.ae.text.split(';').length, d.symbol);
    const poly = bereich(b.flatMap((x) => x.halbebenen));
    // Fläche = Zellfläche / Zahl der Operationen je Zelle, und gleich der Fläche der Ecken
    assert.ok(Math.abs(flaeche(poly) - 1 / gruppe(d.symbol).ordnung) < 1e-9, `${d.symbol}: ${flaeche(poly)}`);
    assert.ok(Math.abs(flaeche(poly) - flaeche(d.ae.ecken)) < 1e-9, d.symbol);
    // jede Ecke der ITA liegt auf dem berechneten Bereich und umgekehrt
    for (const e of d.ae.ecken) assert.ok(b.every((x) => x.halbebenen.every(([cx, cy, c0]) => cx * e[0] + cy * e[1] + c0 > -1e-9)), `${d.symbol}: Ecke ${e}`);
    // jede einzelne Bedingung lässt mehr zu als alle zusammen (sonst wäre sie allein schon die Einheit)
    if (b.length > 1) for (const x of b) assert.ok(flaeche(bereich(x.halbebenen, [-1, -1, 2, 2])) > flaeche(poly) + 1e-9, `${d.symbol}: ${x.text}`);
  }
  assert.deepEqual(bedingungen('y ≤ min(1 − x, (1 + x)/2)')[0].halbebenen, [[-1, -1, 1], [0.5, -1, 0.5]]);
});

test('Asymmetrische Einheit: gewählte Bedingungen in Tafel A und in der Link-Adresse', async () => {
  const { tafelA } = await import('../js/zeichnung.js');
  const { startzustand, hashVon, hashAnwenden } = await import('../js/zustand.js');
  const F = { paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf', dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80' };
  const z = { ...startzustand(), gruppe: 'p4mm', aeTeile: [2] };
  const svg = tafelA('p4mm', z, F).svg;
  assert.match(svg, /class="ae-teile"><polygon/);
  assert.equal((svg.match(/class="ae-teile-grenzen">.*?<\/g>/)[0].match(/<line/g) || []).length, 1, 'x ≤ y: eine Grenzlinie');
  assert.ok(svg.indexOf('ae-teile-grenzen') > svg.indexOf('class="elemente'), 'Grenzen über den Elementen');
  assert.match(hashVon(z), /aet=2/);
  const z2 = startzustand();
  hashAnwenden(z2, '#m=eg&g=p4mm&aet=2,0,9,2');
  assert.deepEqual(z2.aeTeile, [0, 2]);
  hashAnwenden(z2, '#m=eg&g=p4mm&aet=x');
  assert.deepEqual(z2.aeTeile, []);
});

test('Bilder rund um die Zelle (wie ITA): Gruppen um Ecken vollständig, Ansicht grösser', async () => {
  const { bilder, ORBIT_RAND, tafelA } = await import('../js/zeichnung.js');
  const { gruppe } = await import('../js/symmetrie.js');
  const { startzustand, hashVon, hashAnwenden } = await import('../js/zustand.js');
  const F = { paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf', dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80' };
  const g = gruppe('p4mm');
  const b = bilder(g, [0.12, 0.31], 0, 1, ORBIT_RAND).map((x) => x.punkt);
  // die 8 Bilder um den Ursprung (Lagesymmetrie 4mm der Ecke), auch die ausserhalb der Zelle
  for (const [x, y] of [[0.12, 0.31], [-0.12, 0.31], [0.12, -0.31], [-0.12, -0.31], [0.31, 0.12], [-0.31, 0.12], [0.31, -0.12], [-0.31, -0.12]]) {
    assert.ok(b.some((q) => Math.abs(q[0] - x) < 1e-9 && Math.abs(q[1] - y) < 1e-9), `(${x}, ${y})`);
  }
  const zahl = (svg) => (svg.match(/class="objekte">.*?<\/g>/s)?.[0].match(/<circle|<path|<polygon/g) || []).length;
  const aus = tafelA('p4mm', { ...startzustand(), gruppe: 'p4mm', form: 'komma' }, F);
  const an = tafelA('p4mm', { ...startzustand(), gruppe: 'p4mm', form: 'komma', orbit: true }, F);
  assert.ok(zahl(an.svg) > zahl(aus.svg), 'mehr Bilder');
  assert.ok(an.ansicht.s < aus.ansicht.s, 'Zelle kleiner gezeichnet');
  // Link-Adresse
  const z = { ...startzustand(), orbit: true };
  assert.match(hashVon(z), /orbit=1/);
  const z2 = startzustand(); hashAnwenden(z2, '#m=eg&g=p4mm&orbit=1');
  assert.equal(z2.orbit, true);
  assert.doesNotMatch(hashVon(startzustand()), /orbit/);
});

test('Muster als Tapete: gleicher Massstab und gleich grosse Objekte wie ohne Tapete', () => {
  const z = startzustand(); z.gruppe = 'p4gm';
  const ohne = tafelB('p4gm', z, FARBEN);
  const mit = tafelB('p4gm', { ...z, tapete: true }, FARBEN);
  assert.equal(mit.ansicht.s, ohne.ansicht.s);
  const zoom = tafelB('p4gm', { ...z, zoomB: 2 }, FARBEN);
  assert.ok(Math.abs(zoom.ansicht.s / ohne.ansicht.s - 2) < 1e-9);
});
