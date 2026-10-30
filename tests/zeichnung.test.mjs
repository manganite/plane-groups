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
