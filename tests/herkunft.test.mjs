// Herkunft der Symmetrieelemente aus den Erzeugenden: „Aufbau“ und „Warum ist das da?“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, verknuepfen, beschreibe, erzeugende } from '../js/symmetrie.js';
import { herkunft, herleitung, herkunftVon, schrittVon, elementSchluessel, elementVonOp, vorbild } from '../js/herkunft.js';
import { elementeImBereich, aufbauElemente, erklaerungsDaten, metrik, tafelA } from '../js/zeichnung.js';
import { erklaerungHTML, regel, vektorText } from '../js/warum.js';
import { startzustand, hashVon, hashAnwenden, GITTER_START } from '../js/zustand.js';
import { liesOp, translation } from '../js/symmetrie.js';

const ALLE = EBENENGRUPPEN.map((d) => d.symbol);
const gleich = (a, b) => a.R.every((r, i) => r.every((v, j) => v === b.R[i][j])) && a.t.every((v, i) => Math.abs(v - b.t[i]) < 1e-9);

for (const id of ALLE) {
  test(`${id}: jedes Element in 2 × 2 Zellen hat eine Herkunft; die Herleitung rechnet sich nach`, () => {
    const g = gruppe(id);
    const erz = erzeugende(g);
    const e = elementeImBereich(g, 2);
    for (const el of [...e.drehpunkte, ...e.linien]) {
      const h = herkunftVon(g, el);
      assert.ok(h, `${id}: ${elementSchluessel(el)}`);
      // das Element der Operation ist das gezeichnete Element
      assert.equal(elementSchluessel(elementVonOp(g, h.op)), elementSchluessel(el));
      assert.ok(schrittVon(g, el) >= 1);
      const kette = herleitung(g, h.schluessel);
      assert.equal(kette.length, h.tiefe);
      for (const s of kette) assert.ok(gleich(verknuepfen(s.a, s.b), s.c), `${id}: ${beschreibe(s.c)} = ${beschreibe(s.a)} ∘ ${beschreibe(s.b)}`);
      // der erste Schritt verknüpft eine Erzeugende nach ITA mit der Identität
      const letzt = kette[kette.length - 1];
      assert.ok(erz.some((x) => gleich(x, letzt.c)) || letzt.aTranslation, `${id}: Kette endet bei einer Erzeugenden`);
    }
  });

  test(`${id}: Aufbau: der letzte Schritt zeigt alle Elemente, jeder Schritt mindestens die früheren`, () => {
    const g = gruppe(id);
    const max = herkunft(g).maxTiefe;
    const voll = elementeImBereich(g, 1);
    const ende = aufbauElemente(g, 1, max);
    assert.equal(ende.linien.length, voll.linien.length);
    assert.deepEqual(ende.drehpunkte.map((d) => Math.max(...d.ordnungen)).sort(), voll.drehpunkte.map((d) => d.n).sort());
    let vorher = 0;
    for (let s = 1; s <= max; s++) {
      const a = aufbauElemente(g, 1, s);
      const zahl = a.linien.length + a.drehpunkte.length;
      assert.ok(zahl >= vorher, `${id}: Schritt ${s}`);
      vorher = zahl;
    }
  });

  test(`${id}: Erklärung jedes Elements ohne Lücken (HTML und Zeichnung)`, () => {
    const g = gruppe(id);
    const d = EBENENGRUPPEN.find((x) => x.symbol === id);
    const M = metrik(GITTER_START[d.system]);
    const e = elementeImBereich(g, 1);
    for (const el of [...e.drehpunkte, ...e.linien]) {
      const k = elementSchluessel(el);
      const daten = erklaerungsDaten(g, k, [0.12, 0.31], 1, M);
      assert.ok(daten, `${id}: ${k}`);
      for (const phase of [0, 3]) {
        const html = erklaerungHTML(g, daten, M, phase);
        assert.ok(!/undefined|NaN|null/.test(html), `${id}: ${k}`);
      }
      const z = { ...startzustand(), gruppe: id, erkl: k };
      for (const phase of [0, 1, 2, 3]) assert.ok(!/NaN|undefined/.test(tafelA(id, z, FARBEN, { phase }).svg), `${id}: ${k} Phase ${phase}`);
    }
  });
}

const FARBEN = {
  paper: '#fff', ink: '#000', muted: '#666', line: '#ccc', accent: '#00f', accent2: '#f60', upper: '#036', crystal: '#9cf',
  dir: ['#a0a', '#0a0', '#aa0'], fc3: '#0aa', fc4: '#e80',
};

test('p4mm: diagonale Gleitspiegellinie = Translation ∘ Spiegelung an x, x (Konzept §3.1)', () => {
  const g = gruppe('p4mm');
  const gl = elementeImBereich(g, 1).linien.filter((l) => l.art === 'gleit');
  assert.ok(gl.length > 0);
  for (const l of gl) {
    const [s] = herleitung(g, herkunftVon(g, l).schluessel);
    assert.ok(s.aTranslation, 'A ist eine Translation');
    assert.match(beschreibe(s.b), /^m x,-?x$/);
    assert.match(regel(s.a, s.b, s.c, metrik(GITTER_START.quadratisch)), /schräg/);
  }
});

test('c2mm: Gleitspiegellinie b bei x = 1/4 = Zentrierungstranslation ∘ m 0,y (Konzept §3.1)', () => {
  const g = gruppe('c2mm');
  const l = elementeImBereich(g, 1).linien.find((x) => x.art === 'gleit' && x.richtung[0] === 0 && Math.abs(x.punkt[0] - 0.25) < 1e-9);
  const [s] = herleitung(g, herkunftVon(g, l).schluessel);
  assert.equal(beschreibe(s.c), 'b 1/4,y');
  assert.equal(beschreibe(s.a), 't(1/2,1/2)');
  assert.equal(beschreibe(s.b), 'm 0,y');
});

test('p6: Schritt 1 zeigt am Ursprung die Erzeugenden 3 und 2, Schritt 2 die 6', () => {
  const g = gruppe('p6');
  const urs = (s) => aufbauElemente(g, 1, s).drehpunkte.find((d) => d.punkt[0] === 0 && d.punkt[1] === 0);
  assert.deepEqual([...urs(1).ordnungen].sort(), [2, 3]);
  assert.deepEqual(urs(2).ordnungen, [6]);
});

test('Regeln: zwei Spiegelungen im Winkel α ergeben eine Drehung um 2α', () => {
  const M = metrik(GITTER_START.quadratisch);
  const r = regel(liesOp('y,x'), liesOp('-x,y'), liesOp('-y,x'), M);
  assert.match(r, /45° .*2 · 45° = 90°/);
  assert.match(regel(translation([1, 0]), liesOp('-x,-y'), liesOp('-x+1,-y'), M), /Mitte der Translation/);
  assert.match(regel(translation([1, 0]), liesOp('-x,y'), liesOp('-x+1,y'), M), /senkrecht/);
});

test('Vektoren in a und b', () => {
  const t = (v) => vektorText(v).replace(/<[^>]+>/g, '');
  assert.equal(t([1, 0]), 'a');
  assert.equal(t([0, -1]), '−b');
  assert.equal(t([1, 1]), 'a + b');
  assert.equal(t([0.5, 0.5]), '(a + b)/2');
  assert.equal(t([2, -1]), '2a − b');
});

test('Link-Adresse: Werkzeug, gewähltes Element und Aufbau hin und zurück', () => {
  const z = { ...startzustand(), gruppe: 'p4mm', warum: true, erkl: 'g;-1/2,0;1,1', aufbau: 2 };
  const h = hashVon(z);
  assert.match(h, /warum=1&erkl=g;-1\/2,0;1,1&aufbau=2/);
  const z2 = startzustand();
  hashAnwenden(z2, h);
  assert.equal(z2.erkl, 'g;-1/2,0;1,1');
  assert.equal(z2.aufbau, 2);
  assert.equal(z2.warum, true);
  hashAnwenden(z2, '#m=eg&g=p4mm&erkl=<script>&aufbau=x');
  assert.equal(z2.erkl, null);
  assert.equal(z2.aufbau, 0);
});

test('2 × 2 Zellen: Linien in der zweiten Zelle haben ihren eigenen Schlüssel (Review PR #3)', async () => {
  const g = gruppe('pm');
  const l = elementeImBereich(g, 2).linien.find((x) => Math.abs(x.strecke[0][0] - 1.5) < 1e-9);
  assert.equal(elementSchluessel(l), 'm;3/2,0;0,1');
  assert.ok(herkunftVon(g, l));
  // alle Linien: der Schlüssel liegt auf der gezeichneten Strecke
  for (const id of ALLE) {
    const gg = gruppe(id);
    for (const x of elementeImBereich(gg, 2).linien) {
      const h = herkunftVon(gg, x);
      const el = h.element; const s = x.strecke[0];
      const e = [-el.richtung[1], el.richtung[0]];
      assert.ok(Math.abs(e[0] * (s[0] - el.punkt[0]) + e[1] * (s[1] - el.punkt[1])) < 1e-9, `${id}: ${elementSchluessel(x)}`);
    }
  }
});

test('Aufbau: Auswahl gilt der sichtbaren Zähligkeit (Review PR #3)', async () => {
  const { sichtbar } = await import('../js/zeichnung.js');
  const g = gruppe('p6');
  const urs = sichtbar(g, 1, 1).drehpunkte.find((d) => d.punkt[0] === 0 && d.punkt[1] === 0);
  assert.equal(urs.n, 3);
  assert.equal(elementSchluessel(urs), '3;0,0');
  assert.ok(herkunftVon(g, urs));
  assert.equal(sichtbar(g, 1, 2).drehpunkte.find((d) => d.punkt[0] === 0 && d.punkt[1] === 0).n, 6);
  // im Aufbau unsichtbare Elemente sind nicht wählbar
  const g4 = gruppe('p4mm');
  assert.ok(sichtbar(g4, 1, 1).linien.length < elementeImBereich(g4, 1).linien.length);
});

test('Wege von B, A und C wie die Operationen wirken; Stellen nummeriert, Operationen mit Buchstaben', () => {
  const svgVon = (id, k) => tafelA(id, { ...startzustand(), gruppe: id, erkl: k }, FARBEN, { phase: 3 }).svg;
  const weg = (svg, name) => { const i = svg.indexOf(`class="weg weg-${name}"`); return i < 0 ? '' : svg.slice(i, svg.indexOf('class="weg ', i + 10) > 0 ? svg.indexOf('class="weg ', i + 10) : undefined); };
  // p4gm, Gleitspiegellinie x, 1/4: B Drehung 180° (Bogen), A Gleitspiegelung (zwei Teile, Zwischenbild)
  const svg = svgVon('p4gm', 'g;0,1/4;1,0');
  const g = gruppe('p4gm');
  const [s] = herleitung(g, herkunftVon(g, elementeImBereich(g, 1).linien.find((x) => elementSchluessel(x) === 'g;0,1/4;1,0')).schluessel);
  assert.equal(beschreibe(s.b), '2 0,0');
  assert.equal(beschreibe(s.a), 'b 1/4,y');
  const b = weg(svg, 'b'); const a = weg(svg, 'a'); const c = weg(svg, 'c');
  assert.ok(b.match(/<polyline points="([^"]+)"/)[1].split(' ').length > 10, 'B: Bogen');
  assert.equal((a.match(/<polyline/g) || []).length, 2, 'A: Spiegelung, dann Verschiebung');
  assert.match(a, /<g opacity="0.45">/, 'A: Zwischenbild');
  assert.equal((c.match(/<polyline/g) || []).length, 2, 'C: Spiegelung, dann Verschiebung');
  for (const [w, x] of [[b, 'B'], [a, 'A'], [c, 'C']]) assert.match(w, new RegExp(`>${x}</text>`), `Buchstabe ${x} am Weg`);
  for (const i of ['0', '1', '2']) assert.match(svg, new RegExp(`class="stelle">.*?>${i}</text>`), `Stelle ${i}`);
  // Text: Stellen mit Zahlen, Knöpfe ohne Nummern
  const M = metrik(GITTER_START.quadratisch);
  const html = erklaerungHTML(g, erklaerungsDaten(g, 'g;0,1/4;1,0', [0.12, 0.31], 1, M), M, 3);
  assert.match(html, /dreht es um den Drehpunkt/);
  assert.match(html, /spiegelt es an der Gleitspiegellinie/);
  assert.match(html, />zuerst B</);
  assert.match(html, />dann A</);
  // die Ansicht enthält die ganzen Bögen
  for (const id of ALLE) {
    const gg = gruppe(id);
    const d = EBENENGRUPPEN.find((x) => x.symbol === id);
    for (const el of [...elementeImBereich(gg, 1).drehpunkte, ...elementeImBereich(gg, 1).linien]) {
      const z = { ...startzustand(), gruppe: id, erkl: elementSchluessel(el) };
      const { erklaerung: e, ansicht: An } = tafelA(id, z, FARBEN, { phase: 3 });
      for (const w of Object.values(e.wege)) for (const p of w.teile.flat()) {
        const q = An.zuBild(p);
        assert.ok(q[0] > -1 && q[0] < 521 && q[1] > -1 && q[1] < 521, `${id} ${z.erkl} (${d.system})`);
      }
    }
  }
});

test('Gitterkopien: Elemente, die nur verschobene Kopien sind, werden über ihr Vorbild erklärt', () => {
  for (const id of ALLE) {
    const g = gruppe(id);
    const e = elementeImBereich(g, 2);
    for (const el of [...e.drehpunkte, ...e.linien]) {
      const v = vorbild(g, el);
      if (!v) continue;
      // t ist ein Gittervektor (mit Zentrierung), und t ∘ V ∘ t⁻¹ gehört zum Element
      assert.ok(g.zentr.some((z) => [0, 1].every((i) => Math.abs((v.t[i] - z[i]) - Math.round(v.t[i] - z[i])) < 1e-9)), `${id}: t`);
      const T = translation(v.t);
      const Tinv = translation([-v.t[0], -v.t[1]]);
      const konj = verknuepfen(T, verknuepfen(v.op, Tinv));
      assert.equal(elementSchluessel(elementVonOp(g, konj)), elementSchluessel(el), `${id}: ${elementSchluessel(el)}`);
      assert.equal(vorbild(g, v.element), null, `${id}: Vorbild ${v.schluessel} ist selbst keine Kopie`);
    }
  }
  const k = (id, s) => { const g = gruppe(id); return vorbild(g, herkunft(g).elemente.get(s).element); };
  assert.deepEqual([k('p4mm', '4;1,0').schluessel, k('p4mm', '4;1,0').t], ['4;0,0', [1, 0]]);
  assert.deepEqual([k('p4mm', 'm;0,1;1,0').schluessel, k('p4mm', 'm;0,1;1,0').t], ['m;0,0;1,0', [0, 1]]);
  assert.deepEqual([k('pg', 'g;1,0;0,1').schluessel, k('pg', 'g;1,0;0,1').t], ['g;0,0;0,1', [1, 0]]);
  assert.deepEqual([k('c2mm', '2;1/2,1/2').schluessel, k('c2mm', '2;1/2,1/2').t], ['2;0,0', [0.5, 0.5]], 'Zentrierung');
  assert.deepEqual(k('p4mm', 'm;1,0;1,-1').schluessel, 'm;0,0;1,-1', 'x + 1, −x: Kopie der Diagonalen durch den Ursprung');
  // wirklich neue Elemente bleiben Verknüpfungen
  assert.equal(k('p4mm', '4;1/2,1/2'), null);
  assert.equal(k('p4mm', 'm;1/2,0;0,1'), null);
  assert.equal(k('p4gm', 'g;3/4,0;0,1'), null, 'x = 3/4: kein Vorbild in der Zelle');
  // Erklärung: Text und Zeichnung
  const g = gruppe('p4mm'); const M = metrik(GITTER_START.quadratisch);
  const d = erklaerungsDaten(g, '4;1,0', [0.12, 0.31], 1, M);
  assert.equal(d.art, 'kopie');
  const html = erklaerungHTML(g, d, M, 3);
  assert.match(html, /Darum ist er nur der 4-zählige Drehpunkt bei \(0, 0\), um <i>a<\/i> verschoben/);
  assert.match(html, /data-erkl="4;0,0"/);
  const svg = tafelA('p4mm', { ...startzustand(), gruppe: 'p4mm', erkl: '4;1,0' }, FARBEN, { phase: 3 }).svg;
  for (const x of ['v', 't', 'c']) assert.match(svg, new RegExp(`class="weg weg-${x}"`));
  for (const i of ['0', '1', '2', '3']) assert.match(svg, new RegExp(`class="stelle">.*?>${i}</text>`));
});
