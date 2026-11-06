// Quiz: Aufbau der Fragen, Bezug zum Skript, Bilder aus der App, erzeugte Fragen, Ablauf, Moodle-Export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BANK } from '../js/quiz-bank.js';
import {
  GENERATOREN, DIAGRAMM, PUNKTGRUPPE, LAGE, STRUKTUR, VERBAND, PARKETT, MERKMALE, gruppenAblenker,
  punktgruppeAusSymbol, systemAusPunktgruppe, lagePunkt,
} from '../js/quiz-gen.js';
import { bildInhalt, zerlege, farbenAus, istSkizze } from '../js/quiz-bild.js';
import { KAPITEL, SPEICHER } from '../js/quiz-kapitel.js';
import {
  kandidaten, zaehlen, ziehen, stellen, pruefen, rng, GEN_ANTEIL, GEN_GESAMT,
} from '../lib/common/js/quiz-core.js';
import { EBENENGRUPPEN, ebenengruppe } from '../js/ebenengruppen.js';
import { gruppe, elemente, lage } from '../js/symmetrie.js';
import { startzustand, hashAnwenden } from '../js/zustand.js';
import { VORGABEN } from '../js/vorgaben.js';
import { strukturSymmetrie } from '../js/struktur.js';
import { moodleXML } from '../tools/moodle-export.mjs';
import { da } from './hilfen.mjs';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Frage, Generator, Kapitel, Stufe } from '../lib/common/js/quiz-core.js' */
/** @import { Linie } from '../js/symmetrie.js' */
/** @import { Bestimmung } from '../js/bestimmung.js' */
/** @import { Vorgabe } from '../js/vorgaben.js' */
/**
 * Angaben für die Nachrechnung, wie sie in js/quiz-bank.js stehen (Frage.pruefung lässt den Aufbau offen; die
 * Typangabe prüft tsc nicht, dass sie passt, das tut der Test selbst).
 * @typedef {{ art: 'zaehligkeit' | 'freiheitsgrade', gruppe: string, punkt: Vec2 } | { art: 'struktur' | 'preis' }
 *   | { art: 'flaeche', a: number, b: number, gamma: number, wert: string }
 *   | { art: 'abstand', a: number, gamma: number, p1: Vec2, p2: Vec2, wert: string }} Nachrechnung
 */

const skript = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
const K = '#336699';
const F = farbenAus(new Proxy({}, { get: () => K }));
/** @param {string} h */
const text = (h) => h.replace(/<span class="ov">(?:<i>)?([^<]*)(?:<\/i>)?<\/span>/g, '‾$1').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Abschnitt des Skripts zu einem Anker: Kapitel (Nummer) und ob er (oder ein umgebender) eine Vertiefung ist. @param {string} anker */
function abschnitt(anker) {
  const i = skript.indexOf(`<section id="${anker}"`);
  if (i < 0) return null;
  const nrs = [...skript.slice(0, i + 400).matchAll(/<h2[^>]*><span class="nr">(\d+)<\/span>/g)];
  const kapitel = Number(nrs[nrs.length - 1][1]);
  const stack = [];
  for (const m of skript.slice(0, i + 1).matchAll(/<(\/?)section\b([^>]*)>/g)) {
    if (m[1]) stack.pop(); else stack.push(m[2].includes('data-level="vertiefung"'));
  }
  const vertiefung = stack.some(Boolean) || skript.slice(i, i + 200).includes('data-level="vertiefung"');
  return { kapitel, vertiefung };
}

/** Lernziele und Zusammenfassung eines Kapitels als Text; getrennt nach Grundstoff und Vertiefung. @param {number} nr */
function ziele(nr) {
  const k = /** @type {Kapitel} */ (KAPITEL.find((x) => x.nr === nr));
  const a = skript.indexOf(`<section id="${k.anker}"`);
  // bis zum nächsten Kapitel im Skript (nicht nur im Quiz: Kap. 8 hat noch keine Fragen)
  const h2 = skript.indexOf('<h2><span class="nr">', skript.indexOf('<h2>', a) + 4);
  const b = h2 > 0 ? h2 : skript.indexOf('</article>');
  // ganzes Kapitel als Vertiefung (data-level am Kapitel): alle Lernziele gehören zur Vertiefung
  const ganz = istVertiefungskapitel(k);
  /** @type {string[]} */
  const grund = []; /** @type {string[]} */
  const vert = [];
  for (const m of skript.slice(a, b).matchAll(/<div class="box (?:ziele|zusammen)">([\s\S]*?)<\/div>/g)) {
    const [g, v = ''] = m[1].split('<h5>Zur Vertiefung</h5>');
    (ganz ? vert : grund).push(...[...g.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => text(x[1])));
    vert.push(...[...v.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => text(x[1])));
  }
  return { grund, vert };
}
/** Kapitel, das als Ganzes eine Vertiefung ist (Kap. 9). @param {Kapitel} k */
const istVertiefungskapitel = (k) => skript.slice(skript.indexOf(`<section id="${k.anker}"`), skript.indexOf(`<section id="${k.anker}"`) + 120).includes('data-level="vertiefung"');

const TYPEN = ['einfach', 'mehrfach', 'bild-text', 'text-bild', 'bild-bild'];
const alleErzeugten = () => GENERATOREN.flatMap((g) => g.stufen.flatMap((s) => g.params(s).map((p) => ({ ...g.make(p, s), id: `${g.id}:${p}`, kapitel: g.kapitel, stufe: s }))));

/**
 * Gemeinsame Prüfungen für handgeschriebene und erzeugte Fragen.
 * @param {Omit<Frage, 'status'>} q Frage (erzeugte ohne Status); freiwillige Felder wie lernziel prüft der Test selbst
 */
function pruefeFrage(q) {
  assert.ok(TYPEN.includes(q.typ), q.id);
  for (const f of /** @type {const} */ (['frage', 'lernziel', 'erklaerung', 'skript', 'quelle'])) {
    const v = q[f];
    assert.ok(typeof v === 'string' && v.length > 2, `${q.id}: ${f}`);
  }
  assert.ok(q.antworten.length >= 3 && q.antworten.length <= 6, `${q.id}: ${q.antworten.length} Antworten`);
  assert.equal(q.typ.startsWith('bild-'), !!q.bild, `${q.id}: Bild genau bei „bild-text“ und „bild-bild“`);
  assert.ok(q.richtig.length >= 1 && q.richtig.every((/** @type {number} */ i) => Number.isInteger(i) && i >= 0 && i < q.antworten.length), q.id);
  if (q.typ === 'mehrfach') assert.ok(q.richtig.length < q.antworten.length, `${q.id}: nicht alle richtig`);
  else assert.equal(q.richtig.length, 1, `${q.id}: genau eine richtige Antwort`);
  const keys = q.antworten.map((a) => (typeof a === 'string' ? text(a) : a.app));
  assert.equal(new Set(keys).size, keys.length, `${q.id}: doppelte Antwort`);
  const hinweise = q.hinweise;
  assert.ok(hinweise, `${q.id}: Hinweise fehlen`);
  assert.equal(hinweise.length, q.antworten.length, q.id);
  hinweise.forEach((h, i) => {
    if (q.richtig.includes(i)) assert.equal(h, null, `${q.id}: Hinweis bei richtiger Antwort ${i}`);
    else assert.ok(typeof h === 'string' && h.length > 10, `${q.id}: Hinweis zu Antwort ${i} fehlt`);
  });
  // Lernziel wörtlich im Kapitel; Stufe 3 genau bei Lernzielen der Vertiefung
  const z = ziele(q.kapitel);
  const lz = text(da(q.lernziel)); // oben geprüft
  assert.ok(z.grund.includes(lz) || z.vert.includes(lz), `${q.id}: Lernziel „${lz}“ nicht in Kap. ${q.kapitel}`);
  assert.equal(z.vert.includes(lz), q.stufe === 3, `${q.id}: Stufe ${q.stufe} passt nicht zum Lernziel`);
  // Anker im Kapitel; Stufe 1 und 2 nicht auf einen Vertiefungsabschnitt
  const a = abschnitt(da(q.skript)); // oben geprüft
  assert.ok(a, `${q.id}: Anker #${q.skript} fehlt`);
  assert.equal(a.kapitel, q.kapitel, `${q.id}: #${q.skript} liegt in Kap. ${a.kapitel}`);
  if (q.stufe < 3) assert.ok(!a.vertiefung, `${q.id}: Stufe ${q.stufe} verweist auf eine Vertiefung`);
  // Bilder und App-Links: gültige Adressen, Bilder aus dem Code der App
  for (const h of [q.bild, q.app]) {
    if (!h) continue;
    const { hash, skizze, k } = zerlege(h);
    if (skizze !== undefined) { assert.ok(h === q.bild && istSkizze(skizze), `${q.id}: keine Skizze ${h}`); continue; }
    assert.ok(hashAnwenden(startzustand(), hash), `${q.id}: kein gültiger Link ${h}`);
    if (k !== null) assert.ok(h === q.bild && k >= 1 && k <= 3, `${q.id}: Symbolgrösse ${h}`);
  }
  if (q.app) assert.ok(q.app.startsWith('#m='), `${q.id}: „In der App öffnen“ braucht eine Link-Adresse`);
  if (q.bild) assert.match(/** @type {string} */ (bildInhalt(q.bild, F)), /<(polygon|line|circle|path)/, `${q.id}: ${q.bild}`);
}

test('Fragen: Pflichtfelder, eindeutige IDs, Antworten, Hinweise, Lernziel, Anker, Bilder', () => {
  const ids = new Set();
  for (const q of BANK) {
    assert.ok(!ids.has(q.id), `doppelte ID ${q.id}`);
    ids.add(q.id);
    assert.ok([1, 2, 3].includes(q.stufe), q.id);
    assert.ok(KAPITEL.some((k) => k.nr === q.kapitel), q.id);
    assert.ok(['entwurf', 'geprüft'].includes(q.status), q.id);
    pruefeFrage(q);
  }
  // ID wie im Stereo-Quiz: Kürzel des Kapitels, Stufe, laufende Nummer (zweistellig). Lücken sind erlaubt,
  // damit eine ID stabil bleibt, wenn eine andere Frage die Stufe wechselt oder wegfällt.
  const kuerzel = new Map();
  for (const q of BANK) {
    const m = /^([a-z]{2})-([123])-(\d{2})$/.exec(q.id);
    assert.ok(m, `ID ${q.id} nicht im Schema Kürzel-Stufe-Nummer`);
    assert.equal(Number(m[2]), q.stufe, `${q.id}: Stufe in der ID passt nicht zu stufe ${q.stufe}`);
    if (!kuerzel.has(m[1])) kuerzel.set(m[1], q.kapitel);
    assert.equal(kuerzel.get(m[1]), q.kapitel, `${q.id}: Kürzel ${m[1]} gehört zu Kapitel ${kuerzel.get(m[1])}`);
  }
  assert.equal(new Set(kuerzel.values()).size, kuerzel.size, 'ein Kürzel je Kapitel');
  // jedes Kapitel hat handgeschriebene Fragen der Stufen 1 und 2
  for (const k of KAPITEL.filter((x) => !istVertiefungskapitel(x))) for (const s of [1, 2]) assert.ok(BANK.some((q) => q.kapitel === k.nr && q.stufe === s), `Kap. ${k.nr}, Stufe ${s}`);
});

test('Erzeugte Fragen: alle Parameter ergeben gültige Fragen', () => {
  const alle = alleErzeugten();
  assert.ok(alle.length > 100);
  for (const q of alle) pruefeFrage(q);
});

test('Erzeugte Fragen: richtige Antworten aus den Daten der App', () => {
  // Diagramm: Ablenker sind andere Gruppen
  for (const g of EBENENGRUPPEN.map((d) => d.symbol)) {
    const ab = gruppenAblenker(g);
    assert.equal(ab.length, 3, g);
    assert.ok(!ab.includes(g) && new Set(ab).size === 3, g);
    assert.equal(text(DIAGRAMM.make(g).antworten[0]), g);
  }
  // Punktgruppe und System: Regel des Skripts = Daten der ITA
  for (const d of EBENENGRUPPEN) {
    assert.equal(punktgruppeAusSymbol(d.symbol), d.punktgruppe, d.symbol);
    assert.equal(systemAusPunktgruppe(d.punktgruppe), d.system, d.symbol);
    assert.equal(text(PUNKTGRUPPE.make(`${d.symbol}:pg`).antworten[0]), d.punktgruppe);
    assert.equal(PUNKTGRUPPE.make(`${d.symbol}:sys`).antworten[0], d.system);
  }
  // Lage: Der Punkt im Bild liegt auf genau dieser Wyckoff-Lage; Zähligkeit und Lagesymmetrie wie in den Daten
  for (const p of LAGE.stufen.flatMap((s) => LAGE.params(s))) {
    const [symbol, b] = p.split(':');
    const q = LAGE.make(p);
    assert.equal(q.pruefung?.buchstabe, b, p);
    const z = startzustand(); hashAnwenden(z, zerlege(/** @type {string} */ (q.bild)).hash);
    const l = lage(gruppe(symbol), z.punkt);
    const w = /** @type {import('../js/ebenengruppen.js').Wyckoff} */ (ebenengruppe(symbol).wyckoff.find((x) => x.b === b));
    assert.equal(l.buchstabe, b, p);
    assert.equal(l.zaehligkeit, w.n, p);
    assert.match(text(q.antworten[0]), new RegExp(`^Zähligkeit ${w.n}, Lagesymmetrie ${w.sym.replace(/\./g, '') || '1'}$`), p);
    // kein Ablenker nennt dieselbe Zähligkeit und Lagesymmetrie
    for (const a of q.antworten.slice(1)) assert.notEqual(text(a), text(q.antworten[0]), p);
    assert.ok(lagePunkt(symbol, b).p.every(Number.isFinite));
  }
  // Struktur: Die App bestimmt für jede Vorgabe die erwartete Gruppe
  for (const gen of [STRUKTUR, VERBAND, PARKETT]) {
    for (const vid of gen.params(2)) {
      const v = /** @type {Vorgabe} */ (VORGABEN.find((x) => x.id === vid));
      assert.equal(/** @type {Bestimmung} */ (strukturSymmetrie({ ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis })).symbol, v.erwartet, vid);
      assert.equal(text(/** @type {string} */ (gen.make(vid, gen.stufen[0]).antworten[0])), v.erwartet, vid);
    }
  }
});

/** Trifft die Beschreibung t (wie in MERKMALE) auf die Ebenengruppe symbol zu? Liefert die verletzten Aussagen. @param {string} t @param {string} symbol */
function verletzt(t, symbol) {
  const e = elemente(gruppe(symbol));
  /** @type {number[]} */
  const fehler = [];
  let k = 0;
  /** @param {boolean} ok */
  const pr = (ok) => { k++; if (!ok) fehler.push(k); };
  const n = Math.max(1, ...e.drehpunkte.map((x) => x.n));
  const spiegel = e.linien.filter((l) => l.art === 'spiegel');
  const gleit = e.linien.filter((l) => l.art === 'gleit');
  /** @param {Vec2} p */
  const auf = (p) => spiegel.some((l) => Math.abs((p[0] - l.punkt[0]) * l.richtung[1] - (p[1] - l.punkt[1]) * l.richtung[0]) < 1e-6);
  // Drehpunkte
  if (/keine Drehpunkte/.test(t)) pr(e.drehpunkte.length === 0);
  for (const m of t.matchAll(/(\d)-zählige/g)) pr(e.drehpunkte.some((x) => x.n === Number(m[1])));
  if (/(\d)-zählig/.test(t)) pr(new RegExp(`${n}-(zählig|,| und)`).test(t));
  // Spiegel- und Gleitspiegellinien
  if (/keine Spiegel|keine Spiegellinie|aber keine Spiegellinie/.test(t)) pr(spiegel.length === 0);
  else if (/Spiegellinie/.test(t)) pr(spiegel.length > 0);
  if (/keine Spiegel- oder Gleitspiegellinien|keine Gleitspiegellinien/.test(t)) pr(gleit.length === 0);
  else if (/Gleitspiegellinie/.test(t)) pr(gleit.length > 0);
  // Lage der Drehpunkte zu den Spiegellinien
  const hoechste = e.drehpunkte.filter((x) => x.n === n && n > 1);
  if (/auf keiner Spiegellinie/.test(t)) pr(hoechste.every((x) => !auf(x.punkt)));
  if (/alle auf Spiegellinien|auf Schnittpunkten von Spiegellinien|auf ihren Schnittpunkten/.test(t)) pr(hoechste.every((x) => auf(x.punkt)));
  // Richtungen der Spiegellinien
  /** @param {Linie[]} ls */
  const richtungen = (ls) => new Set(ls.map((l) => { const [x, y] = l.richtung; const w = Math.round(((Math.atan2(y, x) * 180 / Math.PI) + 360) % 180); return w % 180; })).size;
  if (/parallele Spiegellinien|Spiegellinien in nur einer Richtung/.test(t)) pr(richtungen(spiegel) === 1);
  if (/Spiegellinien in zwei senkrechten Richtungen/.test(t)) pr(richtungen(spiegel) === 2);
  if (/Spiegellinien in sechs Richtungen/.test(t)) pr(richtungen(spiegel) === 6);
  if (/parallele Gleitspiegellinien|Gleitspiegellinien in zwei senkrechten Richtungen/.test(t)) pr(richtungen(gleit) === (/zwei/.test(t) ? 2 : 1));
  if (/nur ein Teil (davon )?auf Spiegellinien|auf und neben den Spiegellinien/.test(t)) {
    const zwei = /auf und neben/.test(t) ? e.drehpunkte : hoechste;
    pr(zwei.some((x) => auf(x.punkt)) && zwei.some((x) => !auf(x.punkt)));
  }
  // Zentrierung
  pr(/zentrierte Zelle/.test(t) === symbol.startsWith('c'));
  return fehler;
}

test('Merkmale der Ebenengruppen (Hinweise) stimmen mit den Elementen der App', () => {
  for (const d of EBENENGRUPPEN) assert.deepEqual(verletzt(MERKMALE[d.symbol], d.symbol), [], d.symbol);
});

test('Hinweise zu Ablenkern: die Merkmale des Ablenkers treffen auf die richtige Gruppe nicht zu', () => {
  for (const gen of [DIAGRAMM, STRUKTUR, VERBAND, PARKETT]) {
    for (const s of gen.stufen) for (const p of gen.params(s)) {
      const q = gen.make(p, s);
      const g = text(/** @type {string} */ (q.antworten[0]));
      for (const a of /** @type {string[]} */ (q.antworten.slice(1))) assert.notDeepEqual(verletzt(MERKMALE[text(a)], g), [], `${gen.id}:${p}: ${text(a)} passt auf ${g}`);
    }
  }
});

test('Ablauf: Stufe, Kapitel, Anzahl und Höchstanteil der Generatoren', () => {
  const kands = kandidaten(BANK, GENERATOREN, { entwurf: true });
  const n = zaehlen(kands);
  // Vertiefungskapitel haben nur Fragen der Stufe 3
  for (const k of KAPITEL.filter((x) => !istVertiefungskapitel(x))) assert.ok(n[k.nr][1] >= 4, `Kap. ${k.nr}: ${n[k.nr][1]} Fragen der Stufe 1`);
  for (let seed = 1; seed <= 20; seed++) {
    const r = rng(seed);
    const z = ziehen(kands, { stufe: 1, n: 10, rand: r });
    assert.equal(z.length, 10);
    assert.equal(new Set(z.map((k) => k.key)).size, 10, 'keine Frage doppelt');
    assert.ok(z.every((k) => k.stufe === 1));
    for (const g of GENERATOREN) assert.ok(z.filter((k) => k.gen === g).length <= Math.round(10 * GEN_ANTEIL), g.id);
    for (const [kap, st, m] of /** @type {[number[] | null, Stufe, number][]} */ ([[null, 2, 10], [[5], 1, 10], [[6], 2, 20], [[7], 3, 10]])) {
      const zz = ziehen(kands, { stufe: st, kapitel: kap, n: m, rand: r });
      const g = zz.filter((k) => k.gen).length;
      assert.ok(g <= Math.floor(m * GEN_GESAMT) && g <= zz.length * GEN_GESAMT, `Kap. ${kap}, Stufe ${st}: ${g} von ${zz.length}`);
    }
  }
  // ohne Freigabe erscheint nichts
  assert.equal(kandidaten(BANK.map((q) => ({ ...q, status: 'entwurf' })), GENERATOREN.map((g) => ({ ...g, status: 'entwurf' })), {}).length, 0);
});

test('Ablauf: gemischte Antworten behalten die richtige Lösung; Auswertung', () => {
  const kands = kandidaten(BANK, GENERATOREN, { entwurf: true });
  for (const [s, k] of kands.entries()) {
    const q0 = k.frage || /** @type {Generator} */ (k.gen).make(/** @type {string} */ (k.param), k.stufe);
    const q = stellen(k, rng(s + 1));
    const richtig0 = q0.richtig.map((i) => JSON.stringify(q0.antworten[i])).sort();
    assert.deepEqual(q.richtig.map((i) => JSON.stringify(q.antworten[i])).sort(), richtig0, k.key);
    assert.ok(pruefen(q, q.richtig));
    if (q.richtig.length > 1) assert.ok(!pruefen(q, q.richtig.slice(1)), `${k.key}: unvollständig`);
  }
});

test('Moodle-Export: Kategorien, eingebettete Bilder, Bruchteile, nur geprüfte Fragen', () => {
  const genZahlGeprueft = GENERATOREN.filter((g) => g.status === 'geprüft').reduce((n, g) => n + g.stufen.reduce((m, st) => m + g.params(st).length, 0), 0);
  assert.equal(moodleXML().anzahl, BANK.filter((q) => q.status === 'geprüft').length + genZahlGeprueft);
  const { xml, anzahl } = moodleXML({ entwurf: true });
  const genZahl = GENERATOREN.reduce((n, g) => n + g.stufen.reduce((m, st) => m + g.params(st).length, 0), 0);
  assert.equal(anzahl, BANK.length + genZahl);
  const qs = xml.split('<question type="multichoice">').slice(1);
  assert.equal(qs.length, anzahl);
  for (const q of qs.slice(0, 200)) {
    const fr = [...q.matchAll(/<answer fraction="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    assert.ok(Math.abs(fr.filter((x) => x > 0).reduce((s, x) => s + x, 0) - 100) < 0.01);
    for (const m of q.matchAll(/@@PLUGINFILE@@\/([\w.]+)/g)) assert.ok(q.includes(`<file name="${m[1]}"`), `Datei ${m[1]} fehlt`);
    assert.ok(!q.includes('class="ov"'), 'Querstrich nicht umgesetzt');
  }
  assert.ok(xml.includes('$course$/top/Symmetrie in der Ebene/Kap. 5 Die 17 Ebenengruppen/Stufe 1'));
  for (const t of ['question', 'answer', 'text', 'file']) assert.equal((xml.match(new RegExp(`<${t}[ >]`, 'g')) || []).length, (xml.match(new RegExp(`</${t}>`, 'g')) || []).length, t);
});

test('Skript: „Lernziele prüfen“ am Ende jedes Kapitels führt ins Quiz mit Kapitel und Stufe', () => {
  const n = zaehlen(kandidaten(BANK, GENERATOREN, { entwurf: true }));
  KAPITEL.forEach((kap, i) => {
    const a = skript.indexOf(`<section id="${kap.anker}"`);
    const b = i + 1 < KAPITEL.length ? skript.indexOf(`<section id="${KAPITEL[i + 1].anker}"`) : skript.indexOf('</article>');
    const ls = [...skript.slice(a, b).matchAll(/<p class="quizlink">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
    assert.equal(ls.length, 1, `Kap. ${kap.nr}: ${ls.length} Links`);
    const ziel = [...ls[0].matchAll(/href="quiz\.html\?kap=(\d+)&amp;stufe=(\d)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
    for (const [k, st] of ziel) {
      assert.equal(k, kap.nr);
      assert.ok(n[kap.nr]?.[/** @type {Stufe} */ (st)] > 0, `Kap. ${kap.nr}, Stufe ${st}: keine Fragen`);
    }
    for (const st of /** @type {Stufe[]} */ ([1, 2, 3])) if (n[kap.nr]?.[st]) assert.ok(ziel.some(([, s0]) => s0 === st), `Kap. ${kap.nr}: Link Stufe ${st} fehlt`);
    assert.ok(!/<a (?![^>]*target="_blank")/.test(ls[0]), `Kap. ${kap.nr}: neuer Tab`);
  });
});

test('Kapitel des Quiz: Anker im Skript, kurze Namen, fester Speicher', () => {
  for (const k of KAPITEL) {
    assert.ok(skript.includes(`<section id="${k.anker}"`), k.anker);
    assert.ok(k.kurz.length > 3 && k.kurz.length <= 25, k.kurz);
    const h2 = /** @type {RegExpMatchArray} */ (skript.slice(skript.indexOf(`<section id="${k.anker}"`)).match(/<h2><span class="nr">(\d+)<\/span>([^<]*)<\/h2>/));
    assert.equal(Number(h2[1]), k.nr);
    assert.equal(h2[2], k.titel);
  }
  assert.equal(SPEICHER, 'ebenen-quiz');
});

test('Fragen: Abbildungsverweise aufs Skript existieren und liegen im Kapitel der Frage', () => {
  const abb = new Set([...skript.matchAll(/<b>Abb\. (\d+\.\d+)([a-z]?)<\/b>/g)].flatMap((m) => [m[1], m[1] + m[2]]));
  /** @type {string[]} */
  const fehler = [];
  for (const q of BANK) {
    for (const t of /** @type {string[]} */ ([q.frage, q.erklaerung, q.quelle, .../** @type {(string | null)[]} */ (q.hinweise)].filter(Boolean))) {
      if (/Hoffmann|Borchardt|ITA/.test(t) && !/Skript/.test(t)) continue;
      for (const m of t.matchAll(/(?:Skript[^;]*?)?Abb\. (\d+)\.(\d+)([a-z]?)/g)) {
        const davor = t.slice(Math.max(0, /** @type {number} */ (m.index) - 40), m.index);
        if (/Hoffmann|Borchardt|ITA/.test(davor)) continue;
        const nr = `${m[1]}.${m[2]}${m[3]}`;
        if (!abb.has(nr) && !abb.has(`${m[1]}.${m[2]}`)) { fehler.push(`${q.id}: Abb. ${nr}`); continue; }
        // im Kapitel der Frage, ausser die Angabe nennt ausdrücklich ein anderes („Abschn. 3.2, Abb. 3.2c“)
        const kap = Number(m[1]);
        if (kap !== q.kapitel && !new RegExp(`(Abschn\\.|Kap(?:itel|\\.)) ${kap}\\b`).test(t)) fehler.push(`${q.id} (Kap. ${q.kapitel}): Abb. ${nr} aus Kap. ${kap}`);
      }
    }
  }
  assert.deepEqual(fehler, []);
});

// Preis einer Signatur nach Conway (Skript Abschn. 9.2)
/** @param {string} sig */
function preis(sig) {
  let p = 0, nachStern = false;
  for (const c of sig) {
    if (c === '*') { p += 1; nachStern = true; } else if (c === '×') p += 1; else if (c === 'o') p += 2;
    else if (/\d/.test(c)) { const n = Number(c); p += nachStern ? (n - 1) / (2 * n) : (n - 1) / n; }
  }
  return p;
}

test('Fragen: nachgerechnete Antworten (Zähligkeit, Freiheitsgrade, Gruppe einer Struktur, Fläche, Abstand, Preis)', () => {
  /** @param {Frage} q */
  const richtigText = (q) => text(/** @type {string} */ (q.antworten[q.richtig[0]]));
  /** @param {string} s */
  const zahl = (s) => s.replace('.', ',');
  let n = 0;
  for (const q of BANK.filter((x) => x.pruefung)) {
    const p = /** @type {Nachrechnung} */ (q.pruefung);
    n += 1;
    if (p.art === 'zaehligkeit' || p.art === 'freiheitsgrade') {
      const l = lage(gruppe(p.gruppe), p.punkt);
      assert.equal(richtigText(q), String(p.art === 'zaehligkeit' ? l.zaehligkeit : l.freiheitsgrade), q.id);
      // die falschen Zahlen sind andere
      q.antworten.forEach((a, i) => { if (!q.richtig.includes(i)) assert.notEqual(text(/** @type {string} */ (a)), richtigText(q), q.id); });
    } else if (p.art === 'struktur') {
      const z = startzustand();
      assert.ok(hashAnwenden(z, /** @type {string} */ (q.app)), q.id);
      const sym = /** @type {Bestimmung} */ (strukturSymmetrie(z.struktur)).symbol;
      q.antworten.forEach((a, i) => assert.equal(text(/** @type {string} */ (a)).split(/[ ,]/)[0] === sym, q.richtig.includes(i), `${q.id}: ${text(/** @type {string} */ (a))} (App: ${sym})`));
    } else if (p.art === 'flaeche') {
      const f = p.a * p.b * Math.sin((p.gamma * Math.PI) / 180);
      assert.equal(zahl(f.toFixed(1)), p.wert, q.id);
      assert.ok(richtigText(q).includes(p.wert), q.id);
    } else if (p.art === 'abstand') {
      const [dx, dy] = [p.p2[0] - p.p1[0], p.p2[1] - p.p1[1]];
      const d = p.a * Math.sqrt(dx * dx + dy * dy + 2 * dx * dy * Math.cos((p.gamma * Math.PI) / 180));
      assert.equal(zahl(d.toFixed(2)), p.wert, q.id);
      assert.ok(richtigText(q).includes(p.wert), q.id);
    } else if (p.art === 'preis') {
      q.antworten.forEach((a, i) => assert.equal(Math.abs(preis(text(/** @type {string} */ (a))) - 2) > 1e-9, q.richtig.includes(i), `${q.id}: ${text(/** @type {string} */ (a))}`));
    } else assert.fail(`${q.id}: unbekannte Prüfung ${q.pruefung?.art}`);
  }
  assert.ok(n >= 10);
});

test('Seite: Links aus dem Quiz ins Skript und in die App öffnen einen neuen Tab', () => {
  const js = readFileSync(new URL('../lib/common/js/quiz-seite.js', import.meta.url), 'utf8');
  const links = [...js.matchAll(/<a href="\$\{(?:skript|app)\}[^>]*>/g)].map((m) => m[0]);
  assert.ok(links.length >= 2);
  for (const a of links) assert.match(a, /target="_blank" rel="noopener"/, a);
});

test('Seite: Schalter „Auch ungeprüfte Fragen zeigen“, ?entwurf schaltet ein; ohne Schalter nur geprüfte Fragen', () => {
  const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../lib/common/js/quiz-seite.js', import.meta.url), 'utf8');
  assert.match(html, /<input type="checkbox" id="entwurf-schalter">/);
  assert.ok(html.indexOf('id="entwurf-schalter"') > html.indexOf('</form>'));
  assert.match(js, /let entwurf = START\.has\('entwurf'\);/);
  // je eine geprüfte und eine ungeprüfte Frage dazu, damit der Test nicht vom Stand der Bank abhängt
  /** @type {Frage[]} */
  const bank = [...BANK, { ...BANK[0], id: 'test-geprueft', status: 'geprüft' }, { ...BANK[0], id: 'test-entwurf', status: 'entwurf' }];
  const ohne = kandidaten(bank, GENERATOREN, {}), mit = kandidaten(bank, GENERATOREN, { entwurf: true });
  assert.ok(ohne.every((k) => (k.frage ? k.frage.status : /** @type {Generator} */ (k.gen).status) === 'geprüft'));
  assert.ok(mit.length > ohne.length);
});

test('Fragen: Die richtige Antwort verrät sich nicht durch ihre Länge', () => {
  // Wie im Stereo-Quiz: Ist die richtige Antwort deutlich länger und ausführlicher als die falschen,
  // erkennt man sie ohne Wissen. Geprüft für Fragen mit einer richtigen Textantwort ab 30 Zeichen.
  const fehler = [];
  for (const q of BANK.filter((x) => x.richtig.length === 1 && !['text-bild', 'bild-bild'].includes(x.typ))) {
    const L = q.antworten.map((a) => text(/** @type {string} */ (a)).length);
    const r = L[q.richtig[0]];
    const f = L.filter((_, i) => i !== q.richtig[0]);
    const mittel = f.reduce((s, x) => s + x, 0) / f.length;
    if (r >= 30 && r > 1.3 * mittel) fehler.push(`${q.id}: ${r} Zeichen, falsche im Mittel ${Math.round(mittel)}`);
  }
  assert.deepEqual(fehler, []);
});

test('Fragentexte: keine Block-Elemente (sie dürfen nicht in einem Absatz stehen, Prüfliste und Moodle setzen <p>)', () => {
  const block = /<(table|tbody|tr|td|div|p|ul|ol|li|h\d|figure)[\s>]/i;
  /** @param {Frage | import('../lib/common/js/quiz-core.js').Frageinhalt & { id: string }} q */
  const pruefe = (q) => {
    for (const t of /** @type {string[]} */ ([q.frage, q.erklaerung, ...(q.hinweise || []), ...q.antworten.map((a) => (typeof a === 'string' ? a : ''))].filter(Boolean))) {
      assert.ok(!block.test(t), `${q.id}: Block-Element in „${t.slice(0, 60)}…“`);
    }
  };
  BANK.forEach(pruefe);
  alleErzeugten().forEach(pruefe);
});
