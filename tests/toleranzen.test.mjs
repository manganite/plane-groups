// Toleranzen der Symmetriebestimmung (js/bestimmung.js, #120): Fälle knapp neben einer speziellen Metrik
// oder Lage. Die kleinsten Unterschiede, die man eingeben kann, sind Regler (b/a in Schritten von 0,01,
// γ in 0,5°, Lage in 0,001) und Link (b/a auf 0,001, γ auf 0,01°, Lagen auf 10⁻⁶; js/zustand.js). Ein
// solcher Unterschied ergibt das niedrigere System bzw. die allgemeinere Lage, auch wo eine Abweichung von der
// speziellen Metrik nur quadratisch wirkt (schief aufgestelltes hexagonales Gitter unten, #126). Rundungsfehler
// (die Metrik aus cos und sin, 10⁻¹² relativ) ergeben das höhere System, ein Abstand von 10⁻⁶ von einer
// speziellen Lage gilt als auf ihr, auch in einer Überstruktur (gegebene Zelle grösser als die kleinste).
//
// Die erwarteten Gruppen sind von Hand hergeleitet (Kommentare), nicht mit dem Code der App gerechnet
// (Leitfaden Abschn. 9). Die Gitter entstehen wie in der App mit metrik() (|a| = 1, |b| = b/a, Winkel γ).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestimme } from '../js/bestimmung.js';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, anwenden } from '../js/symmetrie.js';
import { metrik, grad } from '../js/zeichnung.js';
import { GITTER_START } from '../js/zustand.js';
import { strukturSymmetrie, basisLagen, istGegeben } from '../js/struktur.js';

/** @import { Vec2, Mat2, Kartesisch } from '../lib/common/js/typen.js' */
/** @import { Bestimmung, Strukturpunkt } from '../js/bestimmung.js' */
/** @import { Basiseintrag, Struktur } from '../js/motive.js' */

/** Gruppe der Struktur im Gitter (b/a, γ in Grad) wie in der App. @param {number} ba @param {number} gamma @param {Strukturpunkt[]} punkte */
function symbol(ba, gamma, punkte) {
  const M = metrik({ ba, gamma: grad(gamma) });
  return bestimme({ a: M.a, b: M.b, punkte })?.symbol;
}

/** Ein Punkt je Zelle: Die Gruppe ist die Holoedrie des Gitters. */
/** @type {Strukturpunkt[]} */
const EIN_PUNKT = [{ p: [0, 0], art: 'A' }];

// --------------------------------------------------------------------------- Metrik
// Gitterart aus der reduzierten Basis u, v (|u| ≤ |v|, |u·v| ≤ |u|²/2): |u| = |v| und u ⊥ v quadratisch;
// |u| = |v| und |u·v| = |u|²/2 hexagonal; u ⊥ v rechteckig; |u| = |v| oder 2|u·v| = |u|² zentriert
// rechteckig (rhombisch); sonst schiefwinklig. Holoedrie: p4mm, p6mm, p2mm, c2mm, p2.
for (const [name, faelle] of /** @type {[string, [number, number, string][]][]} */ ([
  // b/a = 1, γ = 90°: quadratisch. Daneben ungleich lange Achsen (rechteckig) oder gleich lange schiefe
  // (rhombisch, also zentriert rechteckig wie im Test „Leeres Gitter“ in bestimmung.test.mjs).
  ['quadratisch', [
    [1, 90, 'p4mm'],
    [1.01, 90, 'p2mm'], [0.99, 90, 'p2mm'], [1.001, 90, 'p2mm'],
    [1, 89.5, 'c2mm'], [1, 90.5, 'c2mm'], [1, 90.01, 'c2mm'],
  ]],
  // b/a = 1, γ = 120°: hexagonal. Mit b/a = 1,01 ist die reduzierte Basis a, a + b mit |a + b|² = 1,0101 und
  // a·(a + b) = 0,495: nicht gleich lang, nicht senkrecht, 2·0,495 ≠ 1, also schiefwinklig (0,99 ebenso).
  // Mit γ = 119,5° oder 120,5° bleiben a, b gleich lang: rhombisch.
  ['hexagonal', [
    [1, 120, 'p6mm'],
    [1.01, 120, 'p2'], [0.99, 120, 'p2'], [1.001, 120, 'p2'],
    [1, 119.5, 'c2mm'], [1, 120.5, 'c2mm'], [1, 120.01, 'c2mm'],
  ]],
  // b/a = 2, γ = 60°: a·b = 2 cos 60° = 1 = |a|², also (b − a) ⊥ a und das Gitter rechteckig primitiv mit
  // a, b − a (|b − a| = √3). Daneben ist a·(b − a) ≠ 0 und die Basis a, b − a nicht gleich lang: schiefwinklig.
  ['schief aufgestellt, rechteckig', [
    [2, 60, 'p2mm'],
    [2.01, 60, 'p2'], [1.99, 60, 'p2'], [2, 60.5, 'p2'], [2, 59.5, 'p2'], [2, 60.01, 'p2'],
  ]],
  // b/a = √3, γ = 150°: |a + b|² = 1 + 3 + 2√3 cos 150° = 1 und a·(a + b) = 1 − 3/2 = −½, also a, a + b
  // gleich lang unter 120°: hexagonal. Mit b/a = √3 + ε ist die reduzierte Basis a, 2a + b mit
  // |2a + b|² = 1 + ε² und a·(2a + b) = ½ − √3 ε/2: schiefwinklig, aber nur um ε² von gleich langen Achsen
  // (rhombisch) entfernt. Die Nachbarn im Regler, 1,74 (ε² = 6,3·10⁻⁵) und 1,73 (ε² = 4,2·10⁻⁶), und die Link-Werte
  // 1,732 und 1,733 (ε² = 2,6·10⁻⁹ bzw. 9,0·10⁻⁷) ergeben p2. Für 1,732 muss die Toleranz der Metrik also unter
  // 2,6·10⁻⁹ liegen (#126: mit 10⁻⁶ ergaben 1,732 und 1,733 c2mm).
  // Mit γ = 150,5° ist |a + b|² = 0,985: weder gleich lang noch rhombisch noch senkrecht, also schiefwinklig.
  // b/a = 1,24, γ = 66,22°: |b − a|² − |b|² = 1 − 2 · 1,24 · cos 66,22° ≈ −2,1·10⁻⁷. Gleich lang wären b und b − a
  // (rhombisch) bei γ = arccos(1/2,48) = 66,220005…°; der Link-Wert liegt linear daneben, nur zufällig sehr nah. Mit einer
  // Toleranz der Metrik von 10⁻⁶ ergab er c2mm; schiefwinklig ist richtig (wie 1,6, 71,79° mit 2,3·10⁻⁶).
  ['knapp neben rhombisch (Link)', [
    [1.24, 66.22, 'p2'], [1.6, 71.79, 'p2'],
  ]],
  ['schief aufgestellt, hexagonal', [
    [Math.sqrt(3), 150, 'p6mm'],
    [1.74, 150, 'p2'], [1.73, 150, 'p2'], [1.732, 150, 'p2'], [1.733, 150, 'p2'],
    [Math.sqrt(3), 150.5, 'p2'], [Math.sqrt(3), 149.5, 'p2'], [Math.sqrt(3), 150.01, 'p2'],
  ]],
])) {
  test(`Metrik knapp neben einer speziellen (${name}): niedrigeres System, genau auf dem Wert das höhere`, () => {
    for (const [ba, gamma, erwartet] of faelle) assert.equal(symbol(ba, gamma, EIN_PUNKT), erwartet, `b/a = ${ba}, γ = ${gamma}°`);
  });
}

test('Metrik mit Rundungsfehlern (10⁻¹² relativ) gilt als die spezielle', () => {
  for (const [ba, gamma, erwartet] of /** @type {[number, number, string][]} */ ([
    [1 + 1e-12, 90, 'p4mm'], [1 - 1e-12, 90, 'p4mm'], [1, 90 + 1e-10, 'p4mm'],
    [1 + 1e-12, 120, 'p6mm'], [1, 120 - 1e-10, 'p6mm'],
    [2 * (1 + 1e-12), 60, 'p2mm'], [Math.sqrt(3) * (1 - 1e-12), 150, 'p6mm'],
  ])) assert.equal(symbol(ba, gamma, EIN_PUNKT), erwartet, `b/a = ${ba}, γ = ${gamma}°`);
});

// --------------------------------------------------------------------------- Lage
// Zwei Arten: A im Ursprung, B an einer speziellen Lage oder knapp daneben. A allein hat die Holoedrie des
// Gitters mit den Elementen durch den Ursprung; B behält davon nur, was es auf sich selbst abbildet.

test('Lage knapp neben einem Drehpunkt (schiefe Zelle, b/a = 2, γ = 150°)', () => {
  // Das Gitter ist schiefwinklig: a·b = 2 cos 150° = −√3, reduzierte Basis a, 2a + b mit |2a + b|² = 8 − 4√3
  // ≈ 1,07 und a·(2a + b) = 2 − √3 ≈ 0,27 (nicht gleich lang, nicht senkrecht, nicht rhombisch). Holoedrie p2 mit Drehpunkten auf (0, 0), (½, 0), (0, ½), (½, ½). Eine Drehung, die A
  // festhält, hat ihren Punkt c auf dem halben Gitter (2c ganzzahlig); sie bildet B auf 2c − B ab, das ist B
  // (modulo Gitter) nur, wenn 2B ganzzahlig ist. Also p2 genau dann, wenn B auf einem Drehpunkt liegt, sonst p1.
  // Abweichung entlang a (|a| = 1) und entlang b (|b| = 2). Die Abstände liegen weit genug von TOL entfernt, dass
  // die Tests nicht unterscheiden, ob TOL in Bruchkoordinaten oder als Länge gilt; sie sichern die Grössenordnung.
  /** @param {Vec2} b */
  const mitB = (b) => symbol(2, 150, [{ p: [0, 0], art: 'A' }, { p: b, art: 'B' }]);
  for (const [b, erwartet] of /** @type {[Vec2, string][]} */ ([
    [[0.5, 0], 'p2'], [[0, 0.5], 'p2'], [[0.5, 0.5], 'p2'],
    [[0.501, 0], 'p1'], [[0, 0.501], 'p1'], [[0.5, 0.499], 'p1'],
    [[0.500001, 0], 'p2'], [[0, 0.499999], 'p2'], [[0.500001, 0.499999], 'p2'],
  ])) assert.equal(mitB(b), erwartet, `B = (${b})`);
});

test('Lage knapp neben einer Spiegellinie (schiefe Zelle, b/a = 2, γ = 60°)', () => {
  // Das Gitter ist rechteckig mit a und b − a (siehe oben). Die Spiegelung an der Linie durch den Ursprung
  // senkrecht zu a bildet a auf −a und b = (b − a) + a auf b − 2a ab, also (x, y) auf (−x − 2y, y); ihre Linie
  // ist x = −y, z. B. B = (0,7, 0,3) ≡ (−0,3, 0,3). Die Drehung um den Ursprung und die Spiegelung senkrecht zu
  // b − a bilden B = a + 0,3 (b − a) auf −0,3 (b − a) ab, das ist nicht B: Gruppe pm. Neben der Linie bleibt p1.
  /** @param {Vec2} b */
  const mitB = (b) => symbol(2, 60, [{ p: [0, 0], art: 'A' }, { p: b, art: 'B' }]);
  for (const [b, erwartet] of /** @type {[Vec2, string][]} */ ([
    [[0.7, 0.3], 'pm'],
    [[0.701, 0.3], 'p1'], [[0.7, 0.299], 'p1'],
    [[0.700001, 0.3], 'pm'], [[0.7, 0.299999], 'pm'],
  ])) assert.equal(mitB(b), erwartet, `B = (${b})`);
});

test('Lage knapp neben einer Spiegellinie im rechteckigen Gitter: Zähligkeit wie in den Kenndaten', () => {
  // „Gitter und Basis“ mit b/a = 1,35, γ = 90°: ein Atom im Ursprung (Holoedrie p2mm), dazu die vier Bilder
  // eines Atoms anderer Farbe bei (δ, 0,3) unter p2mm. Mit δ = 0,001 (Schritt des Reglers) ist das eine
  // allgemeine Lage (Zähligkeit 4), mit δ = 10⁻⁶ fallen je zwei Bilder zusammen, das Atom liegt auf der
  // Spiegellinie x = 0 (Zähligkeit 2). Die Gruppe bleibt p2mm.
  const g = gruppe('p2mm');
  /** @param {number} delta @returns {Struktur} */
  const st = (delta) => ({
    ba: 1.35, gamma: grad(90),
    basis: [
      /** @type {Basiseintrag} */ ({ motiv: 'atom', farbe: 0, p: [0, 0] }),
      ...g.alle.map((op) => /** @type {Basiseintrag} */ ({ motiv: 'atom', farbe: 1, p: anwenden(op, [delta, 0.3]) })),
    ],
  });
  for (const [delta, zaehligkeit] of /** @type {[number, number][]} */ ([[0, 2], [0.001, 4], [1e-6, 2]])) {
    const s = st(delta);
    const r = /** @type {Bestimmung} */ (strukturSymmetrie(s));
    assert.equal(r.symbol, 'p2mm', `δ = ${delta}`);
    const lagen = basisLagen(s, r);
    assert.equal(lagen[0].zaehligkeit, 1, `δ = ${delta}: Atom im Ursprung`);
    assert.ok(lagen.slice(1).every((l) => l.zaehligkeit === zaehligkeit), `δ = ${delta}: Zähligkeit ${lagen.slice(1).map((l) => l.zaehligkeit)}, erwartet ${zaehligkeit}`);
  }
});

// --------------------------------------------------------------------------- Skalierung
test('Skalierung: a und b mit einem gemeinsamen Faktor ergeben dieselbe Gruppe, Zelle und denselben Ursprung', () => {
  for (const d of EBENENGRUPPEN) {
    // Struktur der Gruppe: Bahn eines Motivs ohne eigene Symmetrie (drei Punkte verschiedener Art) in
    // allgemeiner Lage, wie in bestimmung.test.mjs
    const g = gruppe(d.symbol);
    const M = metrik(GITTER_START[d.system]);
    /** @type {Strukturpunkt[]} */
    const punkte = [];
    for (const op of g.alle) {
      for (const [dp, art] of /** @type {[Vec2, string][]} */ ([[[0, 0], 'A'], [[0.031, 0.007], 'B'], [[-0.004, 0.043], 'C']])) {
        punkte.push({ p: anwenden(op, [0.137 + dp[0], 0.291 + dp[1]]), art });
      }
    }
    const r0 = /** @type {Bestimmung} */ (bestimme({ a: M.a, b: M.b, punkte }));
    assert.equal(r0.symbol, d.symbol);
    for (const f of [1e3, 1e-3, 7.3]) {
      /** @param {Kartesisch<Vec2>} v */
      const mal = (v) => /** @type {Kartesisch<Vec2>} */ ([f * v[0], f * v[1]]);
      const r = /** @type {Bestimmung} */ (bestimme({ a: mal(M.a), b: mal(M.b), punkte }));
      assert.equal(r?.symbol, d.symbol, `${d.symbol}, Faktor ${f}`);
      // Zelle bis auf Rundungsfehler (die Einträge sind nicht immer exakt ganzzahlig, #125)
      assert.ok(r.zelle.every((z, i) => z.every((x, j) => Math.abs(x - r0.zelle[i][j]) < 1e-9)), `${d.symbol}, Faktor ${f}: Zelle ${JSON.stringify(r.zelle)}`);
      assert.ok(r.ursprung.every((x, i) => Math.abs(x - r0.ursprung[i]) < 1e-9), `${d.symbol}, Faktor ${f}: Ursprung`);
      for (const k of /** @type {const} */ (['a', 'b'])) {
        assert.ok(r[k].every((x, i) => Math.abs(x - f * r0[k][i]) < 1e-9 * Math.max(1, f)), `${d.symbol}, Faktor ${f}: ${k}`);
      }
    }
  }
});

test('Skalierung des Gitters allein: ein Punkt je Zelle behält die Holoedrie', () => {
  // Die Toleranz der Metrik muss relativ zur Grösse der Zelle wirken: Mit einer absoluten Toleranz würde ein
  // kleines Gitter zu viel Symmetrie zeigen, ein grosses zu wenig. Die Holoedrien der Startgitter der App:
  // schiefwinklig p2, rechteckig p2mm, quadratisch p4mm, hexagonal p6mm.
  for (const [sys, erwartet] of /** @type {[keyof typeof GITTER_START, string][]} */ ([
    ['schiefwinklig', 'p2'], ['rechteckig', 'p2mm'], ['quadratisch', 'p4mm'], ['hexagonal', 'p6mm'],
  ])) {
    const M = metrik(GITTER_START[sys]);
    for (const f of [1e3, 1e-3, 7.3]) {
      /** @param {Kartesisch<Vec2>} v */
      const mal = (v) => /** @type {Kartesisch<Vec2>} */ ([f * v[0], f * v[1]]);
      assert.equal(bestimme({ a: mal(M.a), b: mal(M.b), punkte: EIN_PUNKT })?.symbol, erwartet, `${sys}, Faktor ${f}`);
    }
  }
});

test('Zelle mit Rundungsfehlern gilt als die gegebene (c2mm in der Standardaufstellung, #125)', () => {
  // Atome auf der Bahn eines allgemeinen Punkts von c2mm, Gitter wie beim Start der App: Die Gruppe ist c2mm, die
  // konventionelle Zelle die gegebene. bestimme() liefert hier eine Zelle wie [[1, 0], [0, 0,9999999999999999]] oder [[1, 5,6·10⁻¹⁷], [0, 1]]; mit
  // exaktem Vergleich zeichnete Tafel A zusätzlich a′, b′ über a, b.
  const g = gruppe('c2mm');
  const M = metrik(GITTER_START.rechteckig);
  for (const q of /** @type {Vec2[]} */ ([[0.137, 0.291], [0.083, 0.417]])) {
    const r = /** @type {Bestimmung} */ (bestimme({ a: M.a, b: M.b, punkte: g.alle.map((op) => ({ p: anwenden(op, q), art: 'A' })) }));
    assert.equal(r.symbol, 'c2mm', String(q));
    assert.ok(r.zelle.every((z, i) => z.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < 1e-12)), `${q}: Zelle ${JSON.stringify(r.zelle)}`);
    assert.ok(istGegeben(r), `${q}: gegebene Zelle`);
  }
});

// --------------------------------------------------------------------------- Überstruktur
// Die gegebene Zelle ist ein Vielfaches der kleinsten; die Lagen stehen wie im Link auf 6 Stellen (#126). Die
// Translationen tragen dann Abweichungen von etwa 10⁻⁶ und dürfen weder die Metrik der kleinsten Zelle noch den
// Ursprung verfälschen.

/** @param {number} x */
const sechsStellen = (x) => Math.round(x * 1e6) / 1e6;

test('Überstruktur mit Lagen auf 6 Stellen: kleinste Zelle mit der richtigen Metrik', () => {
  // a = b = 1, γ = 120°, Atome bei y = 0, 1/3, 2/3: kleinste Zelle a, u = b/3 (|u|² = 1/9, a·u = −1/6). Reduziert
  // u, v = a + u mit |v|² = 1 + 1/9 − 1/3 = 7/9 und u·v = −1/6 + 1/9 = −1/18 = −|u|²/2: rhombisch, c2mm.
  // a = b = 1, γ = 120°, Atome bei y = k/6: u = b/6 (|u|² = 1/36, a·u = −1/12), v = a + 3u mit u·v = −1/12 + 3/36 = 0
  // und |v|² = 1 + 9/36 − 1/2 = 3/4 ≠ |u|²: rechteckig, p2mm.
  for (const [n, erwartet] of /** @type {[number, string][]} */ ([[3, 'c2mm'], [6, 'p2mm']])) {
    const punkte = Array.from({ length: n }, (_, k) => /** @type {Strukturpunkt} */ ({ p: [0, sechsStellen(k / n)], art: 'A' }));
    assert.equal(symbol(1, 120, punkte), erwartet, `y = k/${n}`);
  }
});

test('Überstruktur jeder Ebenengruppe mit Lagen auf 6 Stellen: dieselbe Gruppe, Zelle und Ursprung wie die Struktur selbst', () => {
  // Die Struktur ist dieselbe wie in der Standardaufstellung (Ursprung 0, 0), nur die gegebene Zelle S (Spalten a′, b′ in
  // Bruchkoordinaten der Standardzelle) ist grösser, auch schief. Erwartet, von Hand: dieselbe Gruppe; die konventionelle
  // Zelle spannt dasselbe Gitter auf wie die Standardzelle, also S⁻¹ in der gegebenen Zelle bis auf eine ganzzahlige Matrix
  // mit Determinante ±1 (hexagonal ist auch eine andere Basis desselben Gitters erlaubt); der Ursprung ist ein Gitterpunkt.
  // Motiv aus drei Punkten verschiedener Art in allgemeiner Lage wie oben.
  /** @type {Mat2[]} */
  const zellen = [[[2, 0], [0, 1]], [[1, 0], [0, 3]], [[2, 0], [0, 2]], [[1, 0], [0, 6]], [[3, 0], [0, 2]], [[2, 1], [0, 1]], [[1, -1], [1, 1]]];
  /** @param {Mat2} m @param {Vec2} v @returns {Vec2} */
  const mv = (m, v) => [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
  /** @param {Mat2} m @returns {Mat2} */
  const invers = (m) => { const dt = m[0][0] * m[1][1] - m[0][1] * m[1][0]; return [[m[1][1] / dt, -m[0][1] / dt], [-m[1][0] / dt, m[0][0] / dt]]; };
  /** @param {number} x */
  const ganzzahlig = (x) => Math.abs(x - Math.round(x)) < 1e-6;
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol);
    const M = metrik(GITTER_START[d.system]);
    for (const S of zellen) {
      const n = Math.round(Math.abs(S[0][0] * S[1][1] - S[0][1] * S[1][0]));
      const Si = invers(S);
      // Gitterpunkte der Standardzelle in der gegebenen: alle k·(1, 0) + l·(0, 1) mit Bruchkoordinaten in [0, 1)
      /** @type {Vec2[]} */
      const versatz = [];
      for (let k = -6; k <= 6; k++) for (let l = -6; l <= 6; l++) {
        const w = /** @type {Vec2} */ (mv(Si, [k, l]).map((x) => x - Math.floor(x + 1e-12)));
        if (!versatz.some((u) => Math.abs(u[0] - w[0]) < 1e-9 && Math.abs(u[1] - w[1]) < 1e-9)) versatz.push(w);
      }
      assert.equal(versatz.length, n, `${JSON.stringify(S)}: ${n} Gitterpunkte je gegebener Zelle`);
      /** @type {Strukturpunkt[]} */
      const punkte = [];
      for (const op of g.alle) {
        for (const [dp, art] of /** @type {[Vec2, string][]} */ ([[[0, 0], 'A'], [[0.031, 0.007], 'B'], [[-0.004, 0.043], 'C']])) {
          const p = mv(Si, anwenden(op, [0.083 + dp[0], 0.417 + dp[1]]));
          for (const w of versatz) punkte.push({ p: /** @type {Vec2} */ ([p[0] + w[0], p[1] + w[1]].map(sechsStellen)), art });
        }
      }
      /** @param {Vec2} f */
      const kart = (f) => /** @type {Kartesisch<Vec2>} */ ([f[0] * M.a[0] + f[1] * M.b[0], f[0] * M.a[1] + f[1] * M.b[1]]);
      const r = bestimme({ a: kart([S[0][0], S[1][0]]), b: kart([S[0][1], S[1][1]]), punkte });
      const fall = `${d.symbol} in ${JSON.stringify(S)}`;
      assert.equal(r?.symbol, d.symbol, fall);
      const Z = /** @type {Bestimmung} */ (r).zelle;
      // Standardzelle in der konventionellen: Z⁻¹ · S⁻¹ ganzzahlig mit Determinante ±1
      const Zi = invers(Z);
      const U = [0, 1].map((k) => [0, 1].map((l) => Zi[k][0] * Si[0][l] + Zi[k][1] * Si[1][l]));
      assert.ok(U.flat().every(ganzzahlig) && Math.abs(Math.abs(U[0][0] * U[1][1] - U[0][1] * U[1][0]) - 1) < 1e-6, `${fall}: Zelle ${JSON.stringify(Z)}`);
      assert.ok(mv(Zi, /** @type {Bestimmung} */ (r).ursprung).every((x) => Math.abs(x - Math.round(x)) < 1e-4), `${fall}: Ursprung ${/** @type {Bestimmung} */ (r).ursprung}`);
    }
  }
});
