// Flussdiagramm zur Bestimmung (js/bestimmen.js, Skript Kap. 8): Jede der 17 Ebenengruppen beantwortet die
// Leitfragen mit ihren eigenen Symmetrieelementen (berechnet von js/symmetrie.js aus den Operationen der ITA)
// und kommt so genau bei sich selbst an; jede Gruppe ist genau ein Blatt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLUSSDIAGRAMM, LEITFRAGEN } from '../js/bestimmen.js';
import { gruppe, elemente, art, gitterperiode } from '../js/symmetrie.js';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';

/** @import { Knoten } from '../js/bestimmen.js' */

/** Punkt p auf der Linie durch q mit Richtung r (Bruchkoordinaten). @param {number[]} p @param {{ punkt: number[], richtung: number[] }} l */
const aufLinie = (p, l) => Math.abs((p[0] - l.punkt[0]) * l.richtung[1] - (p[1] - l.punkt[1]) * l.richtung[0]) < 1e-6;

/** Antworten einer Gruppe auf die Leitfragen, aus ihren Symmetrieelementen in einer Zelle. @param {string} symbol */
function antworten(symbol) {
  const e = elemente(gruppe(symbol));
  const spiegel = e.linien.filter((l) => l.art === 'spiegel');
  return {
    n: String(Math.max(1, ...e.drehpunkte.map((d) => d.n))),
    m: spiegel.length > 0,
    // Gleitspiegellinien, die auf einer Spiegellinie liegen, führt elemente() als Spiegellinie
    g: e.linien.some((l) => l.art === 'gleit'),
    nichtAuf: e.drehpunkte.some((d) => !spiegel.some((l) => aufLinie(d.punkt, l))),
    auf: e.drehpunkte.some((d) => spiegel.some((l) => aufLinie(d.punkt, l))),
  };
}

/** Blätter des Diagramms. @param {Knoten} k @returns {string[]} */
const blaetter = (k) => (typeof k === 'string' ? [k] : 'zweige' in k ? Object.values(k.zweige).flatMap(blaetter) : [...blaetter(k.ja), ...blaetter(k.nein)]);

test('Flussdiagramm: jede der 17 Ebenengruppen genau einmal', () => {
  const b = blaetter(FLUSSDIAGRAMM);
  assert.equal(b.length, 17);
  assert.deepEqual([...b].sort(), EBENENGRUPPEN.map((d) => d.symbol).sort());
});

test('Flussdiagramm: jede Gruppe kommt mit ihren eigenen Elementen bei sich an', () => {
  for (const d of EBENENGRUPPEN) {
    const a = antworten(d.symbol);
    /** @type {Knoten} */
    let k = FLUSSDIAGRAMM;
    const weg = [];
    while (typeof k !== 'string') {
      if ('zweige' in k) { weg.push(`n=${a.n}`); k = k.zweige[/** @type {'1'} */ (a.n)]; } else { weg.push(`${k.frage}=${a[k.frage]}`); k = a[k.frage] ? k.ja : k.nein; }
    }
    assert.equal(k, d.symbol, `${d.symbol}: ${weg.join(', ')}`);
  }
});

test('Flussdiagramm: höchste Zähligkeit wie im Symbol; jede Frage hat Text', () => {
  // unabhängig: die Ziffer nach p oder c im Symbol (p1, pm, pg, cm: 1)
  for (const d of EBENENGRUPPEN) assert.equal(antworten(d.symbol).n, /^[pc](\d)/.exec(d.symbol)?.[1] ?? '1', d.symbol);
  for (const f of Object.values(LEITFRAGEN)) assert.ok(f.lang.endsWith('?') && f.kurz.endsWith('?'));
});

test('Keine Gleitspiegellinie liegt auf einer Spiegellinie (Skript Abschn. 8.2), aus den Operationen selbst', () => {
  // unabhängig von elemente(), das Spiegelung und Gleitung auf derselben Linie zu einer Spiegellinie zusammenfasst
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol);
    /** @type {Map<string, { spiegel: boolean, gleit: boolean }>} */
    const linien = new Map();
    for (const op of g.alle) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const a = art({ R: op.R, t: [op.t[0] + i, op.t[1] + j] });
      if (a.art !== 'spiegel' && a.art !== 'gleit') continue;
      // Richtung mit festem Vorzeichen, Linie durch ihren Abstand n·p
      /** @type {import('../lib/common/js/typen.js').Vec2} */
      const r = a.richtung[0] < -1e-9 || (Math.abs(a.richtung[0]) < 1e-9 && a.richtung[1] < 0) ? [-a.richtung[0], -a.richtung[1]] : a.richtung;
      const c = -r[1] * a.punkt[0] + r[0] * a.punkt[1];
      const mu = (Math.abs(r[0]) > Math.abs(r[1]) ? a.gleit[0] / a.richtung[0] : a.gleit[1] / a.richtung[1]) / gitterperiode(g, r);
      const gleitet = Math.abs(mu - Math.round(mu)) > 1e-6;
      const k = `${r.map((x) => x.toFixed(6))}|${c.toFixed(6)}`;
      const e = linien.get(k) ?? { spiegel: false, gleit: false };
      if (gleitet) e.gleit = true; else e.spiegel = true;
      linien.set(k, e);
    }
    const beide = [...linien].filter(([, e]) => e.spiegel && e.gleit).map(([k]) => k);
    assert.deepEqual(beide, [], d.symbol);
    assert.ok([...linien.values()].some((e) => e.spiegel || e.gleit) === (antworten(d.symbol).m || antworten(d.symbol).g), d.symbol);
  }
});

// Generator „leitfragen“ (Quiz Kap. 8): Die Sätze der Frage beschreiben die Antworten auf die Leitfragen; mit
// ihnen führt das Diagramm genau zur richtigen Antwort. Jeder Hinweis nennt eine Antwort, die der Ablenker mit
// seinen eigenen Elementen gibt und die der Beschreibung widerspricht. Die Sätze werden hier unabhängig gelesen.
test('Quiz-Generator „leitfragen“: Beschreibung führt zur richtigen Gruppe, Hinweise widersprechen ihr', async () => {
  const { LEITFRAGEN_GEN } = await import('../js/quiz-gen.js');
  /** @type {[RegExp, string, string | boolean][]} */
  const SAETZE = [
    [/^Es gibt keinen Drehpunkt\.$/i, 'n', '1'],
    [/^Es gibt keine Spiegellinie\.$/i, 'm', false], [/^Es gibt Spiegellinien\.$/i, 'm', true],
    [/^Es gibt keine Gleitspiegellinie\.$/i, 'g', false], [/^Es gibt Gleitspiegellinien\.$/i, 'g', true],
    [/^Mindestens ein Drehpunkt liegt auf keiner Spiegellinie\.$/i, 'nichtAuf', true], [/^Alle Drehpunkte liegen auf Spiegellinien\.$/i, 'nichtAuf', false],
    [/^Mindestens ein Drehpunkt liegt auf einer Spiegellinie\.$/i, 'auf', true], [/^Kein Drehpunkt liegt auf einer Spiegellinie\.$/i, 'auf', false],
  ];
  /** @param {string} satz @returns {[string, string | boolean]} */
  const lies = (satz) => {
    const z = /^Der Drehpunkt höchster Zähligkeit ist (\d)-zählig\.$/i.exec(satz);
    if (z) return ['n', z[1]];
    const t = SAETZE.find(([re]) => re.test(satz));
    assert.ok(t, satz);
    return [t[1], t[2]];
  };
  const ohneTags = (/** @type {string} */ s) => s.replace(/<[^>]+>/g, '');
  for (const d of EBENENGRUPPEN) {
    const q = LEITFRAGEN_GEN.make(d.symbol);
    const teil = /** @type {RegExpExecArray} */ (/ergibt sich: (.*) Welche Ebenengruppe/.exec(q.frage))[1];
    /** @type {Record<string, string | boolean>} */
    const beschr = Object.fromEntries(teil.split(/(?<=\.) /).map(lies));
    /** @type {Knoten} */
    let k = FLUSSDIAGRAMM;
    while (typeof k !== 'string') k = 'zweige' in k ? k.zweige[/** @type {'1'} */ (beschr.n)] : (assert.ok(k.frage in beschr, `${d.symbol}: ${k.frage}`), beschr[k.frage] ? k.ja : k.nein);
    assert.equal(ohneTags(/** @type {string} */ (q.antworten[0])), d.symbol);
    assert.equal(new Set(q.antworten.map((a) => ohneTags(/** @type {string} */ (a)))).size, 4, d.symbol);
    q.antworten.slice(1).forEach((a, i) => {
      const x = ohneTags(/** @type {string} */ (a));
      const [f, w] = lies(/** @type {string} */ (/** @type {string[]} */ (q.hinweise)[i + 1]).replace(/^.*gilt dagegen: /, '').replace(/^./, (c) => c.toUpperCase()));
      assert.equal(antworten(x)[/** @type {'n'} */ (f)], w, `${d.symbol}/${x}: Hinweis stimmt nicht für ${x}`);
      assert.notEqual(beschr[f], w, `${d.symbol}/${x}: Hinweis widerspricht der Beschreibung nicht`);
    });
  }
});

// Aussagen der handgeschriebenen Quizfragen zu Kap. 8 (js/quiz-bank.js, bs-…), aus den Elementen der Gruppen
test('Quiz Kap. 8: Aussagen der Fragen bs-… stimmen mit den Elementen', () => {
  /** Weg durch das Diagramm mit gegebenen Antworten. @param {Record<string, string | boolean>} a */
  const blatt = (a) => {
    /** @type {Knoten} */
    let k = FLUSSDIAGRAMM;
    while (typeof k !== 'string') k = 'zweige' in k ? k.zweige[/** @type {'1'} */ (a.n)] : (a[k.frage] ? k.ja : k.nein);
    return k;
  };
  // bs-2-03: c2mm (Läuferverband) mit übersehenen Drehpunkten führt zu cm
  assert.equal(blatt({ ...antworten('c2mm'), n: '1' }), 'cm');
  // bs-2-02: c2mm und p2mg beantworten alle Leitfragen gleich ausser „Drehpunkt auf m?“
  const [c, p] = [antworten('c2mm'), antworten('p2mg')];
  assert.deepEqual(Object.keys(c).filter((f) => c[/** @type {'n'} */ (f)] !== p[/** @type {'n'} */ (f)]), ['auf']);
  // bs-1-02, bs-1-03: „Drehpunkt nicht auf m?“ trennt p3m1/p31m und p4mm/p4gm
  assert.equal(antworten('p31m').nichtAuf, true); assert.equal(antworten('p3m1').nichtAuf, false);
  assert.equal(antworten('p4gm').nichtAuf, true); assert.equal(antworten('p4mm').nichtAuf, false);
  // bs-1-03: in p4gm liegt der 4-zählige Drehpunkt auf keiner Spiegellinie, die 2-zähligen liegen auf Spiegellinien
  {
    const e = elemente(gruppe('p4gm'));
    const sp = e.linien.filter((l) => l.art === 'spiegel');
    for (const d of e.drehpunkte) assert.equal(sp.some((l) => aufLinie(d.punkt, l)), d.n === 2, `p4gm ${d.n}@${d.punkt}`);
  }
  // bs-2-05: p4mm hat diagonale Gleitspiegellinien und 2-zählige Drehpunkte in den Kantenmitten; jede Spiegellinie geht durch einen 4-zähligen Drehpunkt
  {
    const e = elemente(gruppe('p4mm'));
    assert.ok(e.linien.some((l) => l.art === 'gleit' && Math.abs(Math.abs(l.richtung[0]) - Math.abs(l.richtung[1])) < 1e-9 && l.richtung[0] !== 0));
    assert.equal(e.drehpunkte.find((d) => Math.hypot(d.punkt[0], d.punkt[1] - 0.5) < 1e-9)?.n, 2);
    for (const l of e.linien.filter((x) => x.art === 'spiegel')) assert.ok(e.drehpunkte.some((d) => d.n === 4 && aufLinie(d.punkt, l)));
  }
  // bs-2-04: p2mg mit Ursprung auf einem 2-zähligen Drehpunkt, Spiegellinien bei x = ¼, ¾ (parallel), Gleitspiegellinien bei y = 0, ½
  {
    const e = elemente(gruppe('p2mg'));
    assert.equal(e.drehpunkte.find((d) => d.punkt[0] === 0 && d.punkt[1] === 0)?.n, 2);
    assert.deepEqual([...new Set(e.linien.filter((l) => l.art === 'spiegel').map((l) => l.punkt[0]))].sort(), [0.25, 0.75]);
    assert.ok(e.linien.filter((l) => l.art === 'spiegel').every((l) => l.richtung[0] === 0));
    assert.deepEqual([...new Set(e.linien.filter((l) => l.art === 'gleit').map((l) => l.punkt[1]))].sort(), [0, 0.5, 1]);
  }
});

// Quiz Kap. 8 und Experimente: Jede zitierte Leitfrage („…?“) steht im Wortlaut der Daten (LEITFRAGEN).
test('Zitierte Leitfragen in Quiz und Experimenten im Wortlaut der Daten', async () => {
  const { BANK } = await import('../js/quiz-bank.js');
  const { ABLAEUFE } = await import('../js/hilfetexte.js');
  const lang = new Set(Object.values(LEITFRAGEN).map((l) => l.lang));
  const texte = [
    ...BANK.filter((q) => q.id.startsWith('bs-')).map((q) => JSON.stringify([q.frage, q.antworten, q.hinweise, q.erklaerung])),
    JSON.stringify(ABLAEUFE),
  ];
  let n = 0;
  for (const t of texte) {
    for (const [, z] of t.matchAll(/„([^“]*\?)“/g)) { assert.ok(lang.has(z), `nicht im Wortlaut: „${z}“`); n++; }
  }
  assert.ok(n >= 6, `${n} Zitate geprüft`);
});
