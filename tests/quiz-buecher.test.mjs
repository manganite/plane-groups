// Erzeugte Fragen nach Anregungen aus Borchardt-Ott und Hoffmann: Antworten mit dem Code der App nachgerechnet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KOORDINATEN, ELEMENTE_LAGE, elementOp, GLEIT_UNGENANNT, REIHENFOLGE, MUSTER, regelPunktgruppe } from '../js/quiz-gen.js';
import { gruppe, elemente, art, liesOp, gleichModGitter, anwenden } from '../js/symmetrie.js';
import { OPERATIONEN, verknuepfe, gruppentafel } from '../js/punktoperationen.js';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { startzustand, hashAnwenden } from '../js/zustand.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Generator } from '../lib/common/js/quiz-core.js' */
/** @import { PG } from '../js/punktoperationen.js' */

/** @param {string} h */
const text = (h) => h.replace(/<span class="ov">(\w)<\/span>/g, '-$1').replace(/<sub>(?:<i>)?(\w)(?:<\/i>)?<\/sub>/g, '$1')
  .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080));
/** @type {Record<string, string>} */
const BRUCH = { '¼': '1/4', '½': '1/2', '¾': '3/4', '⅛': '1/8', '⅜': '3/8' };
/** „-x + ½, y“ → Operation */
/** @param {string} h */
const alsOp = (h) => liesOp(text(h).replace(/ /g, '').replace(/−/g, '-').replace(/[¼½¾⅛⅜]/g, (c) => BRUCH[c]));

test('Element an Lage → Koordinaten: richtige Antwort ist die Operation des Elements, Ablenker sind andere', () => {
  for (const id of /** @type {Generator} */ (KOORDINATEN).params(2)) {
    const e = ELEMENTE_LAGE[id];
    const op = elementOp(e);
    const a = art(op);
    if (e.art === '2') {
      assert.equal(a.art, 'dreh'); assert.equal(a.n, 2);
      assert.deepEqual(anwenden(op, e.punkt), e.punkt, id); // Drehpunkt bleibt
    } else {
      assert.equal(a.art, e.art === 'm' ? 'spiegel' : 'gleit', id);
      const k = e.achse === 'x' ? 0 : 1;
      // Punkte der Linie: Spiegelung lässt sie fest, Gleitspiegelung verschiebt sie um ½ entlang der Linie
      /** @type {Vec2} */
      const p = k === 0 ? [e.c, 0.3] : [0.3, e.c];
      const q = anwenden(op, p);
      assert.ok(Math.abs(q[k] - p[k]) < 1e-12, id);
      assert.ok(Math.abs(Math.abs(q[1 - k] - p[1 - k]) - (e.art === 'g' ? 0.5 : 0)) < 1e-12, id);
    }
    const q = KOORDINATEN.make(id);
    const ops = q.antworten.map(alsOp);
    assert.ok(gleichModGitter(ops[0], op), `${id}: ${q.antworten[0]}`);
    for (let i = 1; i < 4; i++) {
      assert.ok(!gleichModGitter(ops[i], op), `${id}: Ablenker ${q.antworten[i]}`);
      for (let j = 1; j < i; j++) assert.ok(!gleichModGitter(ops[i], ops[j]), `${id}: doppelt`);
      // der Hinweis nennt das Element, das zu den Koordinaten des Ablenkers gehört
      const d = art(ops[i]);
      const h = text(/** @type {string} */ (q.hinweise[i]));
      if (d.art === 'dreh') assert.match(h, /Drehung um 180°/, id);
      else assert.match(h, d.art === 'spiegel' ? /Spiegelung an/ : /Gleitspiegelung an/, id);
    }
  }
});

test('Gleitspiegellinien, die das Symbol nicht nennt: aus den Elementen der App', () => {
  /** @param {string} g */
  const linien = (g) => elemente(gruppe(g)).linien;
  const ps = /** @type {Generator} */ (GLEIT_UNGENANNT).params(2);
  assert.deepEqual([...ps].sort(), ['c2mm', 'cm', 'p31m', 'p3m1', 'p4mm', 'p6mm']);
  for (const g of ps) {
    const q = GLEIT_UNGENANNT.make(g);
    const [richtig, ...ab] = q.antworten.map(text);
    assert.equal(richtig, g);
    assert.ok(!g.includes('g') && linien(g).some((l) => l.art === 'gleit'), g);
    for (const x of ab) assert.ok(!linien(x).some((l) => l.art === 'gleit'), `${g}: ${x} hat Gleitspiegellinien`);
  }
});

test('Gleitspiegellinien: Erklärung (parallel zu Spiegellinien, mitten zwischen zwei benachbarten) und Hinweise stimmen (#33)', () => {
  const ps = /** @type {Generator} */ (GLEIT_UNGENANNT).params(2);
  for (const g of ps) {
    const l = elemente(gruppe(g)).linien;
    for (const gl of l.filter((x) => x.art === 'gleit')) {
      // k · p ist längs der Linie konstant (k · richtung = 0); Gittertranslationen ändern es um ganze Zahlen
      const r = gl.richtung; const k = [r[1], -r[0]];
      /** @param {Vec2} p Lage der Linie quer zu ihr, modulo Gittertranslation */
      const c = (p) => (((k[0] * p[0] + k[1] * p[1]) % 1) + 1) % 1;
      /** @param {Vec2} q */
      const parallel = (q) => q[0] * r[1] - q[1] * r[0] === 0;
      const spiegel = [...new Set(l.filter((x) => x.art === 'spiegel' && parallel(x.richtung)).map((x) => +c(x.punkt).toFixed(6)))].sort((u, v) => u - v);
      assert.ok(spiegel.length > 0, `${g}: keine Spiegellinie parallel zur Gleitspiegellinie`);
      const cg = c(gl.punkt);
      // nächste Spiegellinien unterhalb und oberhalb (zyklisch) haben von der Gleitspiegellinie gleichen Abstand
      const unten = Math.max(...spiegel.map((m) => (m <= cg + 1e-9 ? m : m - 1)));
      const oben = Math.min(...spiegel.map((m) => (m >= cg - 1e-9 ? m : m + 1)));
      assert.ok(Math.abs((cg - unten) - (oben - cg)) < 1e-9 && oben - unten > 1e-9, `${g}: Gleitspiegellinie nicht mitten zwischen Spiegellinien`);
      if (g === 'p4mm') assert.ok(Math.abs(gl.richtung[0]) === Math.abs(gl.richtung[1]), 'p4mm: Gleitspiegellinie nicht diagonal');
    }
    // Hinweise sagen, dass der Ablenker keine Gleitspiegellinien hat
    for (const h of GLEIT_UNGENANNT.make(g).hinweise.slice(1)) assert.match(text(/** @type {string} */ (h)), /keine (Spiegel- oder )?Gleitspiegellinien|Gleitspiegellinien hat es keine/, g);
  }
});

test('Punktgruppe aus dem Symbol: die genannten Schritte ergeben die Punktgruppe (#33)', () => {
  for (const d of EBENENGRUPPEN) {
    const r = text(regelPunktgruppe(d.symbol));
    let s = d.symbol.slice(1);
    if (r.includes('die 1')) s = s.replace(/1/g, '');
    if (r.includes('liest g als m')) s = s.replace(/g/g, 'm');
    assert.equal(s || '1', d.punktgruppe, d.symbol);
    assert.equal(r.includes('die 1'), d.symbol !== 'p1' && d.symbol.slice(1).includes('1'), d.symbol);
    assert.equal(r.includes('liest g als m'), d.symbol.includes('g'), d.symbol);
  }
});

test('Reihenfolge der Verknüpfung: abelsch genau dann, wenn die Gruppentafel symmetrisch ist', () => {
  /** @param {PG} pg */
  const abelsch = (pg) => { const t = gruppentafel(pg); return t.every((z, i) => z.every((v, j) => v === t[j][i])); };
  /** @param {PG} pg @param {string} n */
  const idx = (pg, n) => OPERATIONEN[pg].findIndex((o) => o.name === n);
  for (const p of /** @type {Generator} */ (REIHENFOLGE).params(2)) {
    const q = REIHENFOLGE.make(p);
    const pgs = /** @type {PG[]} */ (q.antworten.map((a) => text(a)));
    assert.equal(abelsch(pgs[0]), !q.pruefung.kommt, p);
    for (const x of pgs.slice(1)) assert.equal(abelsch(x), q.pruefung.kommt, `${p}: ${x}`);
    // jede Aussage „A ∘ B = C“ in Erklärung und Hinweisen stimmt
    /** @param {string} t @param {PG} pg */
    const pruefe = (t, pg) => {
      // auch Ketten „A ∘ B = B ∘ A = C“
      for (const m of text(t).matchAll(/(\S+) ∘ (\S+)(?: = (\S+) ∘ (\S+))? = ([^\s,.;]+)/g)) {
        /** @param {string} x @param {string} y */
        const c = (x, y) => OPERATIONEN[pg][verknuepfe(pg, idx(pg, x), idx(pg, y))].name;
        assert.equal(c(m[1], m[2]), m[5], `${p}: ${m[0]}`);
        if (m[3]) assert.equal(c(m[3], m[4]), m[5], `${p}: ${m[0]}`);
      }
    };
    pruefe(q.erklaerung, pgs[0]);
    q.hinweise.forEach((h, i) => { if (h) pruefe(h, pgs[i]); });
  }
});

test('Muster → Ebenengruppe: 16 Gruppen (ohne p1), Bild ist das Muster (Tafel B) ohne Symmetrieelemente', () => {
  assert.equal(/** @type {Generator} */ (MUSTER).params(2).length, EBENENGRUPPEN.length - 1); // ohne p1
  for (const g of /** @type {Generator} */ (MUSTER).params(2)) {
    const q = MUSTER.make(g);
    assert.ok(q.bild.startsWith('B#') && !/[&#]mel=1/.test(q.bild), g);
    assert.equal(text(q.antworten[0]), g);
    // Lage und Grösse des Fähnchens kommen in der App an (ausserhalb des Bereichs fiele og still weg)
    const z = startzustand(); hashAnwenden(z, q.bild.slice(1));
    const og = Number(new URLSearchParams(q.bild.split('#')[1]).get('og') ?? 1);
    assert.equal(z.objGroesse, og, g);
    assert.equal(z.gruppe, g);
  }
});
