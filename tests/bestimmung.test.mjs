// Symmetrie einer Struktur bestimmen (js/bestimmung.js): Strukturen aus allen 17 Ebenengruppen
// erzeugen und wiedererkennen, auch mit verschobenem Ursprung, anderer Zelle und gedrehtem Bild
// (Konzept §8). Dazu das Dreiecksbeispiel (Konzept §3.2), auch mit Spitzen entlang a.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, anwenden, punktAufLage, lage } from '../js/symmetrie.js';
import { bestimme } from '../js/bestimmung.js';
import { GITTER_START } from '../js/zustand.js';
import { metrik } from '../js/zeichnung.js';

/** Motiv ohne eigene Symmetrie: drei Punkte verschiedener Art um p (Bruchkoordinaten). */
const motiv = (p) => [{ d: [0, 0], art: 'A' }, { d: [0.031, 0.007], art: 'B' }, { d: [-0.004, 0.043], art: 'C' }].map((m) => ({ p: [p[0] + m.d[0], p[1] + m.d[1]], art: m.art }));

/** Struktur der Gruppe g: Motiv in allgemeiner Lage, dazu isotrope Punkte auf speziellen Lagen. */
function struktur(id) {
  const g = gruppe(id);
  const d = EBENENGRUPPEN.find((x) => x.symbol === id);
  const M = metrik(GITTER_START[d.system]);
  const punkte = [];
  for (const op of g.alle) for (const m of motiv([0.137, 0.291])) punkte.push({ p: anwenden(op, m.p), art: m.art });
  // eine spezielle Lage mit eigener Art (falls vorhanden): Bahn eines Punktes auf ihr
  const w = d.wyckoff[d.wyckoff.length - 1];
  if (w !== d.wyckoff[0]) {
    const s = punktAufLage(g, w.b, [0.21, 0.37]);
    for (const op of g.alle) punkte.push({ p: anwenden(op, s), art: 'W' });
  }
  return { a: M.a, b: M.b, punkte };
}

/** Andere Zelle (ganzzahlige Matrix U, Spalten = neue a, b), Ursprung um o verschoben, gedreht. */
function umgestellt(st, U, o, winkel) {
  const c = Math.cos(winkel); const s = Math.sin(winkel);
  const dreh = (v) => [c * v[0] - s * v[1], s * v[0] + c * v[1]];
  const neuA = [U[0][0] * st.a[0] + U[1][0] * st.b[0], U[0][0] * st.a[1] + U[1][0] * st.b[1]];
  const neuB = [U[0][1] * st.a[0] + U[1][1] * st.b[0], U[0][1] * st.a[1] + U[1][1] * st.b[1]];
  const d = U[0][0] * U[1][1] - U[0][1] * U[1][0];
  const Ui = [[U[1][1] / d, -U[0][1] / d], [-U[1][0] / d, U[0][0] / d]];
  // Punkte in der neuen Zelle: x' = U⁻¹ (x − o); alle Gitterbilder in der neuen Zelle sammeln
  const punkte = [];
  for (const q of st.punkte) for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    const v = [q.p[0] + i - o[0], q.p[1] + j - o[1]];
    const x = [Ui[0][0] * v[0] + Ui[0][1] * v[1], Ui[1][0] * v[0] + Ui[1][1] * v[1]];
    if (x.every((z) => z >= -1e-9 && z < 1 - 1e-9)) punkte.push({ p: x, art: q.art });
  }
  return { a: dreh(neuA), b: dreh(neuB), punkte };
}

for (const d of EBENENGRUPPEN) {
  test(`${d.symbol}: wiedererkannt, auch mit anderem Ursprung, anderer Zelle und gedreht`, () => {
    const st = struktur(d.symbol);
    const r0 = bestimme(st);
    assert.equal(r0?.symbol, d.symbol, 'Standardaufstellung');
    assert.equal(r0.ordnung, gruppe(d.symbol).ordnung);
    for (const [U, o, w] of [
      [[[1, 0], [0, 1]], [0.173, 0.411], 0.7],
      [[[1, 1], [0, 1]], [0.05, 0.62], -1.1],
      [[[0, 1], [1, 0]], [0.33, 0.29], 2.0], // Achsen vertauscht
      [[[2, 1], [1, 1]], [0.71, 0.13], 0.3],
    ]) {
      const r = bestimme(umgestellt(st, U, o, w));
      assert.equal(r?.symbol, d.symbol, `U = ${JSON.stringify(U)}`);
      // die konventionelle Zelle hat dieselbe Metrik wie die ursprüngliche (bis auf Vorzeichen)
      const l = (v) => Math.hypot(...v);
      assert.ok(Math.abs(Math.abs(r.a[0] * r.b[1] - r.a[1] * r.b[0]) - Math.abs(st.a[0] * st.b[1] - st.a[1] * st.b[0])) < 1e-6, 'Fläche');
      assert.deepEqual([l(r.a), l(r.b)].map((x) => x.toFixed(6)).sort(), [l(st.a), l(st.b)].map((x) => x.toFixed(6)).sort());
    }
  });
}

// Der Buchstabe kann sich ändern: ITA erlaubt gleichwertige Ursprünge (z. B. jeden Drehpunkt in
// p2), mit denen die Lagen a–d die Buchstaben tauschen. Gleich bleiben Zähligkeit und Lagesymmetrie.
test('Spezielle Lage: Die Punkte der Art W sitzen nach der Bestimmung auf einer gleichwertigen Lage', () => {
  for (const d of EBENENGRUPPEN) {
    const w = d.wyckoff[d.wyckoff.length - 1];
    if (w === d.wyckoff[0]) continue;
    const r = bestimme(umgestellt(struktur(d.symbol), [[1, 0], [0, 1]], [0.3, 0.6], 0));
    const p = r.punkte.find((q) => q.art === 'W').p;
    const l = lage(gruppe(d.symbol), p, 1e-6);
    assert.equal(l.zaehligkeit, w.n, d.symbol);
    assert.equal(l.symbol, w.sym, d.symbol);
  }
});

/** Dreieck mit Spiegellinie entlang der Spitze: Spitze in Richtung r (±b oder ±a). */
const dreieck = (c, r, art = '') => {
  const q = [-r[1], r[0]]; // quer zur Spitze
  return [
    { p: [c[0] - 0.08 * q[0] - 0.06 * r[0], c[1] - 0.08 * q[1] - 0.06 * r[1]], art: `E${art}` },
    { p: [c[0] + 0.08 * q[0] - 0.06 * r[0], c[1] + 0.08 * q[1] - 0.06 * r[1]], art: `E${art}` },
    { p: [c[0] + 0.1 * r[0], c[1] + 0.1 * r[1]], art: `S${art}` },
  ];
};

test('Dreiecksbeispiel (Konzept §3.2): pm → cm → p2mg, Spitzen entlang b', () => {
  const a = [1, 0]; const b = [0, 1.35];
  const stufe = (zentrum, art) => bestimme({ a, b, punkte: [...dreieck([0, 0], [0, 1]), ...dreieck([0.5, 0.5], zentrum, art)] });
  assert.equal(stufe([0, 1], '2').symbol, 'pm', 'Stufe 1: zentrales Dreieck andersfarbig');
  assert.equal(stufe([0, 1], '').symbol, 'cm', 'Stufe 2: gleiche Farbe, gleiche Richtung');
  const s3 = stufe([0, -1], '');
  assert.equal(s3.symbol, 'p2mg', 'Stufe 3: Spitze im Zentrum umgekehrt');
  // die Dreiecke liegen auf 2c (¼, y; ¾, −y), Lagesymmetrie .m.
  const g = gruppe('p2mg');
  const mitte = s3.punkte.filter((q) => q.art === 'S');
  assert.ok(mitte.every((q) => Math.abs(q.p[0] - 0.25) < 1e-6 || Math.abs(q.p[0] - 0.75) < 1e-6), 'Spitzen auf x = ¼ bzw. ¾');
  void g;
});

test('Dreiecksbeispiel mit Spitzen entlang a: dieselben Gruppen, Achsen vertauscht', () => {
  const a = [1.35, 0]; const b = [0, 1];
  const stufe = (zentrum, art) => bestimme({ a, b, punkte: [...dreieck([0, 0], [1, 0]), ...dreieck([0.5, 0.5], zentrum, art)] });
  for (const [z, art, symbol] of [[[1, 0], '2', 'pm'], [[1, 0], '', 'cm'], [[-1, 0], '', 'p2mg']]) {
    const r = stufe(z, art);
    assert.equal(r.symbol, symbol);
    // konventionelle Achse a liegt nun entlang der gegebenen b (Spiegellinie ⊥ a nach ITA)
    assert.ok(Math.abs(r.zelle[0][0]) < 1e-9, `${symbol}: a′ = ±b`);
  }
});

test('Leeres Gitter mit einem Punkt: Holoedrie (p2, p2mm, c2mm, p4mm, p6mm)', () => {
  const ein = [{ p: [0, 0], art: 'A' }];
  const c = Math.cos((105 * Math.PI) / 180); const s = Math.sin((105 * Math.PI) / 180);
  assert.equal(bestimme({ a: [1, 0], b: [1.25 * c, 1.25 * s], punkte: ein }).symbol, 'p2');
  assert.equal(bestimme({ a: [1, 0], b: [0, 1.35], punkte: ein }).symbol, 'p2mm');
  assert.equal(bestimme({ a: [1, 0], b: [0, 1.35], punkte: [...ein, { p: [0.5, 0.5], art: 'A' }] }).symbol, 'c2mm');
  assert.equal(bestimme({ a: [1, 0], b: [0, 1], punkte: ein }).symbol, 'p4mm');
  assert.equal(bestimme({ a: [1, 0], b: [-0.5, Math.sqrt(3) / 2], punkte: ein }).symbol, 'p6mm');
  // rhombisches Gitter (gleich lange Vektoren, 70°) ist zentriert rechteckig
  const w = (70 * Math.PI) / 180;
  assert.equal(bestimme({ a: [1, 0], b: [Math.cos(w), Math.sin(w)], punkte: ein }).symbol, 'c2mm');
});
