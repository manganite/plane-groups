// Punktgruppen mit benannten Operationen (Skript Abschn. 4.4) und die erzeugten Fragen zu Untergruppen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OPERATIONEN, verknuepfe, gruppentafel, istGruppe, untergruppen } from '../js/punktoperationen.js';
import { UNTERGRUPPE } from '../js/quiz-gen.js';
import { startzustand } from '../js/zustand.js';
import { metrik, kart } from '../js/zeichnung.js';
import { gruppe, elemente } from '../js/symmetrie.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { PG, Punktoperation } from '../js/punktoperationen.js' */
/** @import { System } from '../js/ebenengruppen.js' */
/** @import { Generator } from '../lib/common/js/quiz-core.js' */

/**
 * Wert, den der Test sicher erwartet (null oder undefined wäre ein Fehler, den der Test meldet).
 * @template T @param {T} x @returns {NonNullable<T>}
 */
const da = (x) => /** @type {NonNullable<T>} */ (x);

/** @param {number} x */
const mod180 = (x) => ((x % 180) + 180) % 180;

const skript = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
/** @param {string} h */
const name = (h) => h.replace(/<sub>(?:<i>)?(\w)(?:<\/i>)?<\/sub>/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080)).trim();
/** @param {PG} pg @param {string} n */
const index = (pg, n) => { const i = OPERATIONEN[pg].findIndex((o) => o.name === n); assert.ok(i >= 0, `${pg}: ${n}`); return i; };

test('Gruppentafel 3m wie im Skript', () => {
  const tab = skript.slice(skript.indexOf('<table class="tab tafel">'), skript.indexOf('</table>', skript.indexOf('<table class="tab tafel">')));
  const zeilen = [...tab.matchAll(/<tr><th>(.*?)<\/th>(.*?)<\/tr>/g)].filter((m) => !m[1].includes('∘'))
    .map((m) => [name(m[1]), ...[...m[2].matchAll(/<td>(.*?)<\/td>/g)].map((x) => name(x[1]))]);
  assert.equal(zeilen.length, 6);
  const t = gruppentafel('3m');
  for (const [a, ...rest] of zeilen) assert.deepEqual(t[index('3m', a)], rest, a);
  // Spalten in derselben Reihenfolge wie die Operationen
  const kopf = [...tab.matchAll(/<th>(.*?)<\/th>/g)].slice(1, 7).map((m) => name(m[1]));
  assert.deepEqual(kopf, OPERATIONEN['3m'].map((o) => o.name));
});

test('Punktgruppen: Ordnung, Gruppenaxiome, Beispiele im Skript', () => {
  /** @type {Record<string, number>} */
  const ordnung = { 4: 4, '2mm': 4, '3m': 6, '4mm': 8, 6: 6, '6mm': 12 };
  for (const [pg, ops] of /** @type {[PG, Punktoperation[]][]} */ (Object.entries(OPERATIONEN))) {
    assert.equal(ops.length, ordnung[pg], pg);
    assert.equal(new Set(ops.map((o) => o.name)).size, ops.length, pg);
    const n = ops.length; const I = [...Array(n).keys()];
    for (const a of I) {
      assert.equal(verknuepfe(pg, 0, a), a); assert.equal(verknuepfe(pg, a, 0), a);
      assert.ok(I.some((b) => verknuepfe(pg, a, b) === 0), `${pg}: Inverses zu ${ops[a].name}`);
      for (const b of I) for (const c of I) assert.equal(verknuepfe(pg, verknuepfe(pg, a, b), c), verknuepfe(pg, a, verknuepfe(pg, b, c)));
    }
  }
  // Skript: m2 ∘ m1 = −3 in 3m (Abb. 4.4); in 4mm ma+b ∘ ma = +4, {1, 2, ma, mb} Untergruppe, {1, 2, ma, ma+b} nicht
  assert.equal(OPERATIONEN['3m'][verknuepfe('3m', index('3m', 'm2'), index('3m', 'm1'))].name, '−3');
  assert.equal(OPERATIONEN['4mm'][verknuepfe('4mm', index('4mm', 'ma+b'), index('4mm', 'ma'))].name, '+4');
  assert.equal(OPERATIONEN['4mm'][verknuepfe('4mm', index('4mm', 'ma'), index('4mm', 'ma+b'))].name, '−4');
  assert.ok(istGruppe('4mm', ['1', '2', 'ma', 'mb'].map((x) => index('4mm', x))));
  assert.ok(!istGruppe('4mm', ['1', '2', 'ma', 'ma+b'].map((x) => index('4mm', x))));
  assert.ok(skript.includes('<i>m</i><sub><i>a</i>+<i>b</i></sub> ∘ <i>m</i><sub><i>a</i></sub> = +4'));
  assert.ok(skript.includes('spiegelt <i>m</i><sub><i>a</i></sub> an der Linie senkrecht zu <i>a</i>'));
  // Untergruppen von 6mm: 2, 3, 6, sechs m, drei 2mm, zwei 3m
  assert.equal(untergruppen('6mm').length, 14);
});

test('Erzeugte Fragen zu Untergruppen: Antworten und Hinweise nachgerechnet', () => {
  const ps = /** @type {Generator} */ (UNTERGRUPPE).params(1);
  assert.ok(ps.length >= 8);
  for (const p of ps) {
    const q = UNTERGRUPPE.make(p);
    const pg = q.pruefung.pg;
    /** @param {string} h */
    const menge = (h) => name(h).replace(/[{}]/g, '').split(', ').map((x) => index(pg, x));
    const mengen = q.antworten.map(menge);
    mengen.forEach((s, i) => assert.equal(istGruppe(pg, s), q.richtig.includes(i), `${p}: ${q.antworten[i]}`));
    assert.deepEqual(mengen[0], q.pruefung.menge, p);
    // jede Aussage „A ∘ B = C“ stimmt; in Hinweisen liegt C nicht in der Menge
    /** @param {string} t @param {number[] | null} s */
    const pruefe = (t, s) => {
      const m = da(name(t).match(/(\S+) ∘ (\S+) = ([^\s.,]+)/));
      assert.ok(m, `${p}: ${t}`);
      const c = verknuepfe(pg, index(pg, m[1]), index(pg, m[2]));
      assert.equal(OPERATIONEN[pg][c].name, m[3], `${p}: ${t}`);
      if (s) assert.ok(s.includes(index(pg, m[1])) && s.includes(index(pg, m[2])) && !s.includes(c), `${p}: ${t}`);
    };
    q.hinweise.forEach((h, i) => { if (h) pruefe(h, mengen[i]); });
    pruefe(q.erklaerung, null);
    // keine äussere Eigenschaft verrät die richtige Antwort
    /** @param {number[]} s */
    const merk = (s) => [s.length, s.filter((i) => OPERATIONEN[pg][i].art === 'm').length, s.includes(0)];
    const mr = merk(mengen[0]);
    mr.forEach((v, k) => assert.ok(mengen.slice(1).some((s) => merk(s)[k] === v), `${p}: Merkmal ${k}`));
  }
});

test('Spiegelungen: Index = Richtung senkrecht zur Linie, mit den Achsen der App; in 6mm ⊥ bzw. ∥ zur Achse', () => {
  const st = startzustand();
  /** @param {System} sys @param {Vec2} v */
  const richtung = (sys, v) => { const c = kart(metrik(st.gitter[sys]), v); return [c[0], -c[1]]; }; // y im Bild nach oben
  /** @type {Record<string, Record<string, Vec2>>} */
  const achsen = {
    rechteckig: { a: [1, 0], b: [0, 1] },
    quadratisch: { a: [1, 0], b: [0, 1], 'a+b': [1, 1], 'a−b': [1, -1] },
    hexagonal: { a1: [1, 0], a2: [0, 1], a3: [-1, -1] },
  };
  /** @type {Record<string, System>} */
  const sys = { '2mm': 'rechteckig', '4mm': 'quadratisch', '6mm': 'hexagonal' };
  for (const pg of /** @type {PG[]} */ (['2mm', '4mm', '6mm'])) {
    const ms = OPERATIONEN[pg].filter((o) => o.art === 'm');
    for (const o of ms) {
      const n = richtung(sys[pg], achsen[sys[pg]][/** @type {string} */ (o.index)]);
      const l = [Math.cos((o.w * Math.PI) / 180), Math.sin((o.w * Math.PI) / 180)];
      const dot = (n[0] * l[0] + n[1] * l[1]) / Math.hypot(...n);
      // ohne Zeichen oder mit ⊥: Linie senkrecht zur Richtung im Index; mit ∥: Linie entlang dieser Richtung
      if (o.zeichen === '∥') assert.ok(Math.abs(Math.abs(dot) - 1) < 1e-9, `${pg} ${o.name}`);
      else assert.ok(Math.abs(dot) < 1e-9, `${pg} ${o.name}`);
    }
    // jede Spiegelung mit ∥ steht senkrecht auf der mit ⊥ zur selben Achse
    for (const o of ms.filter((x) => x.zeichen === '∥')) {
      const p = da(ms.find((x) => x.zeichen === '⊥' && x.index === o.index));
      assert.equal(mod180(o.w - p.w), 90, `${pg} ${o.name}`);
    }
  }
  // p3m1 hat die Spiegelungen m_ai⊥, p31m die Spiegelungen m_ai∥ (Skript Abschn. 4.4)
  /** @param {string} g */
  const winkel = (g) => elemente(gruppe(g)).linien.filter((l) => l.art === 'spiegel')
    .map((l) => { const d = richtung('hexagonal', l.richtung); return Math.round(mod180((Math.atan2(d[1], d[0]) * 180) / Math.PI)); });
  /** @param {string} z */
  const soll = (z) => OPERATIONEN['6mm'].filter((o) => o.art === 'm' && o.zeichen === z).map((o) => o.w).sort((x, y) => x - y);
  assert.deepEqual([...new Set(winkel('p3m1'))].sort((x, y) => x - y), soll('⊥'));
  assert.deepEqual([...new Set(winkel('p31m'))].sort((x, y) => x - y), soll('∥'));
});
