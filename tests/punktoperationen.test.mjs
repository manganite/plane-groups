// Punktgruppen mit benannten Operationen (Skript Abschn. 4.4) und die erzeugten Fragen zu Untergruppen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OPERATIONEN, verknuepfe, gruppentafel, istGruppe, untergruppen } from '../js/punktoperationen.js';
import { UNTERGRUPPE } from '../js/quiz-gen.js';

const skript = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
const name = (h) => h.replace(/<sub>(?:<i>)?(\w)(?:<\/i>)?<\/sub>/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080)).trim();
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
  const ordnung = { 4: 4, '2mm': 4, '3m': 6, '4mm': 8, 6: 6, '6mm': 12 };
  for (const [pg, ops] of Object.entries(OPERATIONEN)) {
    assert.equal(ops.length, ordnung[pg], pg);
    assert.equal(new Set(ops.map((o) => o.name)).size, ops.length, pg);
    const n = ops.length; const I = [...Array(n).keys()];
    for (const a of I) {
      assert.equal(verknuepfe(pg, 0, a), a); assert.equal(verknuepfe(pg, a, 0), a);
      assert.ok(I.some((b) => verknuepfe(pg, a, b) === 0), `${pg}: Inverses zu ${ops[a].name}`);
      for (const b of I) for (const c of I) assert.equal(verknuepfe(pg, verknuepfe(pg, a, b), c), verknuepfe(pg, a, verknuepfe(pg, b, c)));
    }
  }
  // Skript: m2 ∘ m1 = −3 in 3m (Abb. 4.4); in 4mm m2 ∘ m1 = +4, {1, 2, m1, m3} Untergruppe, {1, 2, m1, m2} nicht
  assert.equal(OPERATIONEN['3m'][verknuepfe('3m', index('3m', 'm2'), index('3m', 'm1'))].name, '−3');
  assert.equal(OPERATIONEN['4mm'][verknuepfe('4mm', index('4mm', 'm2'), index('4mm', 'm1'))].name, '+4');
  assert.ok(istGruppe('4mm', ['1', '2', 'm1', 'm3'].map((x) => index('4mm', x))));
  assert.ok(!istGruppe('4mm', ['1', '2', 'm1', 'm2'].map((x) => index('4mm', x))));
  assert.ok(skript.includes('<i>m</i><sub>2</sub> ∘ <i>m</i><sub>1</sub> = +4'));
  // 2mm: Index = Achse senkrecht zur Linie; a zeigt im Bild nach unten (wie in der App), b nach rechts
  assert.equal(OPERATIONEN['2mm'][index('2mm', 'ma')].w, 0);
  assert.equal(OPERATIONEN['2mm'][index('2mm', 'mb')].w, 90);
  assert.ok(skript.includes('<i>m</i><sub><i>a</i></sub> spiegelt an der Linie senkrecht zu <i>a</i>'));
  // Untergruppen von 6mm: 2, 3, 6, sechs m, drei 2mm, zwei 3m
  assert.equal(untergruppen('6mm').length, 14);
});

test('Erzeugte Fragen zu Untergruppen: Antworten und Hinweise nachgerechnet', () => {
  const ps = UNTERGRUPPE.params(1);
  assert.ok(ps.length >= 8);
  for (const p of ps) {
    const q = UNTERGRUPPE.make(p);
    const pg = q.pruefung.pg;
    const menge = (h) => name(h).replace(/[{}]/g, '').split(', ').map((x) => index(pg, x));
    const mengen = q.antworten.map(menge);
    mengen.forEach((s, i) => assert.equal(istGruppe(pg, s), q.richtig.includes(i), `${p}: ${q.antworten[i]}`));
    assert.deepEqual(mengen[0], q.pruefung.menge, p);
    // jede Aussage „A ∘ B = C“ stimmt; in Hinweisen liegt C nicht in der Menge
    const pruefe = (t, s) => {
      const m = name(t).match(/(\S+) ∘ (\S+) = ([^\s.,]+)/);
      assert.ok(m, `${p}: ${t}`);
      const c = verknuepfe(pg, index(pg, m[1]), index(pg, m[2]));
      assert.equal(OPERATIONEN[pg][c].name, m[3], `${p}: ${t}`);
      if (s) assert.ok(s.includes(index(pg, m[1])) && s.includes(index(pg, m[2])) && !s.includes(c), `${p}: ${t}`);
    };
    q.hinweise.forEach((h, i) => { if (h) pruefe(h, mengen[i]); });
    pruefe(q.erklaerung, null);
    // keine äussere Eigenschaft verrät die richtige Antwort
    const merk = (s) => [s.length, s.filter((i) => OPERATIONEN[pg][i].art === 'm').length, s.includes(0)];
    const mr = merk(mengen[0]);
    mr.forEach((v, k) => assert.ok(mengen.slice(1).some((s) => merk(s)[k] === v), `${p}: Merkmal ${k}`));
  }
});
