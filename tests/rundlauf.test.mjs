// Rundlauf-Tests nach Leitfaden Abschn. 9 (crystallography-common#63, #96): Zustand → Link → Zustand,
// Zustand → Speicher → Zustand, alter oder verdorbener Speicherstand → gültiger Zustand, Zurücksetzen vor
// und nach dem Neuladen gleich. Die Erwartungen stehen hier unabhängig vom Code (feste Listen und Bereiche).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startzustand, hashVon, hashAnwenden, ausSpeicher, speicherStand, strukturStart, entwurfStart, groesseVonRegler, reglerVonGroesse, GROESSE_SCHRITTE, STRUKTUR_BEREICH } from '../js/zustand.js';
import { VORGABEN } from '../js/vorgaben.js';
import { grad } from '../js/zeichnung.js';
import { ausgeschrieben } from '../js/bahnen.js';

/** @import { Zustand } from '../js/zustand.js' */

// unabhängig vom Code festgehalten: die 17 Symbole, Systeme mit festen Werten, Bereiche der Regler
const SYMBOLE = ['p1', 'p2', 'pm', 'pg', 'cm', 'p2mm', 'p2mg', 'p2gg', 'c2mm', 'p4', 'p4mm', 'p4gm', 'p3', 'p3m1', 'p31m', 'p6', 'p6mm'];
const FEST = { rechteckig: { gamma: 90 }, quadratisch: { ba: 1, gamma: 90 }, hexagonal: { ba: 1, gamma: 120 } };
const BEREICH = { ba: [0.5, 2], gamma: [60, 150] }; // ein Bereich für alle Modi (Konzept „Muster entwerfen“, Entscheidung 12)
// System und Zähligkeit der allgemeinen Lage je Gruppe (ITA Vol. A, Part 6), für „Muster entwerfen“
/** @type {Record<string, [string, number]>} */
const ALLGEMEIN = {
  p1: ['schiefwinklig', 1], p2: ['schiefwinklig', 2], pm: ['rechteckig', 2], pg: ['rechteckig', 2], cm: ['rechteckig', 4],
  p2mm: ['rechteckig', 4], p2mg: ['rechteckig', 4], p2gg: ['rechteckig', 4], c2mm: ['rechteckig', 8], p4: ['quadratisch', 4],
  p4mm: ['quadratisch', 8], p4gm: ['quadratisch', 8], p3: ['hexagonal', 3], p3m1: ['hexagonal', 6], p31m: ['hexagonal', 6],
  p6: ['hexagonal', 6], p6mm: ['hexagonal', 12],
};

/** Neu laden: Speicher wie im Browser (JSON), dann der Link, wie main.js. @param {Zustand} z @param {string} [hash] */
const neuLaden = (z, hash) => {
  const n = ausSpeicher(JSON.parse(JSON.stringify(speicherStand(z))));
  if (hash) hashAnwenden(n, hash);
  return n;
};

/** Gültig nach den festen Erwartungen oben. @param {Zustand} z */
function pruefeGueltig(z) {
  assert.ok(SYMBOLE.includes(z.gruppe), `gruppe ${z.gruppe}`);
  assert.ok(['eg', 'struktur', 'entwurf'].includes(z.modus), `modus ${z.modus}`);
  assert.ok(Array.isArray(z.punkt) && z.punkt.length === 2 && z.punkt.every(Number.isFinite), 'punkt');
  for (const [sys, g] of Object.entries(z.gitter)) {
    for (const k of /** @type {const} */ (['ba', 'gamma'])) {
      const fest = /** @type {Record<string, Record<string, number>>} */ (FEST)[sys]?.[k];
      if (fest !== undefined) assert.equal(g[k], fest, `${sys}.${k}`);
      else assert.ok(g[k] >= BEREICH[k][0] && g[k] <= BEREICH[k][1], `${sys}.${k} = ${g[k]}`);
    }
  }
  assert.ok(Number.isInteger(z.schritt) && z.schritt >= 0 && z.schritt <= 25, `schritt ${z.schritt}`);
  assert.ok(Number.isInteger(z.aufbau) && z.aufbau >= 0 && z.aufbau <= 20, `aufbau ${z.aufbau}`);
  assert.ok(z.zoomB >= 0.5 && z.zoomB <= 3 && z.objGroesse >= 0.5 && z.objGroesse <= 3, 'zoomB, objGroesse');
  assert.ok(Array.isArray(z.aeTeile) && z.aeTeile.every((i, k) => Number.isInteger(i) && i >= 0 && (k === 0 || i > z.aeTeile[k - 1])), `aeTeile ${z.aeTeile}`);
  assert.equal(typeof z.herkunft, 'boolean', 'herkunft');
  assert.ok(VORGABEN.some((v) => v.id === z.struktur.vorgabe), `struktur.vorgabe ${z.struktur.vorgabe}`);
  assert.ok(Array.isArray(z.struktur.basis) && z.struktur.basis.length > 0, 'struktur.basis');
  // Entwurf: eine der 17 Gruppen, Gitter nach dem System, Grenze 48 nach Zähligkeit, zeichnen ohne Fehler
  const en = z.entwurf;
  assert.ok(SYMBOLE.includes(en.gruppe), `entwurf.gruppe ${en.gruppe}`);
  const [sys, n] = ALLGEMEIN[en.gruppe];
  const fest = /** @type {Record<string, Record<string, number>>} */ (FEST)[sys] ?? {};
  for (const k of /** @type {const} */ (['ba', 'gamma'])) if (fest[k] !== undefined) assert.equal(en[k], fest[k], `${en.gruppe}: ${k}`);
  assert.ok(en.basis.length * n <= 48, `${en.gruppe}: ${en.basis.length} Vertreter`);
  assert.doesNotThrow(() => ausgeschrieben(en), en.gruppe);
  assert.equal(typeof en.elemente, 'boolean'); assert.equal(typeof en.ae, 'boolean');
  assert.deepEqual(Object.keys(z).sort(), Object.keys(startzustand()).sort(), 'nur die Felder des Zustands');
  assert.equal(typeof hashVon(z), 'string');
}

/** Zustände zum Hin und Zurück: jede Gruppe, beide Modi, Gitter, Schalter, Vorgaben. @returns {Zustand[]} */
function beispiele() {
  /** @type {Zustand[]} */
  const out = [];
  for (const g of SYMBOLE) {
    const z = startzustand();
    Object.assign(z, { gruppe: g, punkt: [0.21, 0.37], ae: true, zellen: 2, form: 'komma', schritt: 3, aufbau: 0 });
    z.gitter.schiefwinklig = { ba: 1.4, gamma: grad(110) };
    z.gitter.rechteckig = { ba: 0.8, gamma: grad(90) };
    out.push(z);
  }
  for (const v of VORGABEN) {
    const z = startzustand();
    z.modus = 'struktur'; z.struktur = strukturStart(v.id);
    out.push(z);
  }
  // Grenzen des Gitterbereichs und „Herkunft der Elemente“
  for (const [g, ba, gamma] of /** @type {[string, number, number][]} */ ([['p1', 0.5, 60], ['p2', 2, 150], ['pm', 2, 90]])) {
    const z = startzustand();
    Object.assign(z, { gruppe: g, herkunft: true, erkl: 'm;1/2,0;0,1' });
    z.gitter.schiefwinklig = { ba, gamma: grad(gamma) };
    z.gitter.rechteckig = { ba, gamma: grad(90) };
    out.push(z);
  }
  // verändert gegenüber der Vorgabe (Zurücksetzen muss die Vorgabe kennen)
  const z = startzustand();
  z.modus = 'struktur'; z.struktur = strukturStart('graphen'); z.struktur.ba = 1.3; z.struktur.basis.pop();
  out.push(z);
  // „Darstellung“ und Lupe in „Gitter und Basis“ (Schlüssel farb, mel, tap, fuell, lupe, zoom wie in „Ebenengruppen“)
  for (const v of [{ farben: false }, { musterElemente: true, tapete: true }, { aeFuell: true, lupe: true, zoomB: 1.7 }, { farben: false, musterElemente: true, tapete: true, aeFuell: true, lupe: true, zoomB: 0.6 }]) {
    const zd = startzustand();
    zd.modus = 'struktur'; zd.struktur = strukturStart('quadratisch'); Object.assign(zd, v);
    out.push(zd);
  }
  // gespiegelte Motive (Link-Feld m)
  const zs = startzustand();
  zs.modus = 'struktur'; zs.struktur = strukturStart('dreieck1');
  zs.struktur.basis = [{ motiv: 'fahne', farbe: 0, p: [0.2, 0.3], winkel: grad(30) }, { motiv: 'fahne', farbe: 0, p: [0.8, 0.3], winkel: grad(150), spiegel: true }];
  out.push(zs);
  // Muster entwerfen (#136): Gruppe, Gitter, Vertreter, Anzeigen; leerer Entwurf in jeder Gruppe
  for (const g of SYMBOLE) {
    const ze = startzustand();
    ze.modus = 'entwurf'; ze.entwurf = entwurfStart(g);
    out.push(ze);
  }
  for (const [sg, ba, gamma, basis] of /** @type {[string, number, number, import('../js/motive.js').Basiseintrag[]][]} */ ([
    ['p4mm', 1, 90, [{ motiv: 'fahne', farbe: 0, p: [0.1, 0.2], winkel: grad(0) }, { motiv: 'atom', farbe: 1, p: [0.5, 0], winkel: grad(0) }]],
    ['p6', 1, 120, [{ motiv: 'fahne', farbe: 2, p: [0.15, 0.3], winkel: grad(40), spiegel: true, groesse: 0.2 }]],
    ['c2mm', 1.6, 90, [{ motiv: 'dreieck', farbe: 0, p: [0, 0.25], winkel: grad(90) }]],
    ['p2', 1.25, 105, [{ motiv: 'w2', farbe: 0, p: [0.5, 0.5], winkel: grad(20) }]],
    ['p3', 1, 120, [{ motiv: 'ranke', farbe: 1, p: [0.25, 0.25], winkel: grad(30), spiegel: true, groesse: 0.15 }, { motiv: 'tropfen', farbe: 2, p: [0.6, 0.1], winkel: grad(0) }, { motiv: 'blatt', farbe: 3, p: [0.1, 0.8], winkel: grad(300) }]],
    ['pm', 1.5, 90, [{ motiv: 'fahne', farbe: 0, p: [0.2, 0.3], winkel: grad(0) }]],
  ])) {
    const zf = startzustand();
    zf.modus = 'entwurf'; zf.entwurf = { ...entwurfStart(sg), ba, gamma: grad(gamma), basis };
    out.push(zf);
  }
  // Anzeigen und „Darstellung“ im Entwurf
  for (const v of [{ farben: false }, { musterElemente: true, tapete: true }, { aeFuell: true, lupe: true, zoomB: 1.7 }]) {
    const zd = startzustand();
    zd.modus = 'entwurf'; zd.entwurf = { ...entwurfStart('p4gm'), elemente: false, ae: true, bindungen: false, basis: [{ motiv: 'fahne', farbe: 0, p: [0.1, 0.2], winkel: grad(0) }] }; Object.assign(zd, v);
    out.push(zd);
  }
  return out;
}

test('Rundlauf: Zustand → Link → Zustand (die Link-Adresse ist stabil)', () => {
  for (const z of beispiele()) {
    const h = hashVon(z);
    const z2 = startzustand();
    assert.equal(hashAnwenden(z2, h), true, h);
    assert.equal(hashVon(z2), h);
    pruefeGueltig(z2);
  }
});

test('Rundlauf: Zustand → Speicher → Zustand (alles bleibt, auch was nicht im Link steht)', () => {
  for (const z of beispiele()) {
    if (z.modus === 'entwurf') z.entwurf.striche = [{ punkte: [[0.1, 0.1], [0.4, 0.2]], farbe: 2 }];
    const z2 = neuLaden(z);
    assert.deepEqual(JSON.parse(JSON.stringify(z2)), JSON.parse(JSON.stringify(z)), hashVon(z));
  }
});

test('Rundlauf: alter oder verdorbener Speicherstand → gültiger Zustand, ohne Fehler (#96)', () => {
  /** @type {unknown[]} */
  const staende = [
    null, 'x', 42, { v: 3 }, { v: 3, z: null }, { v: 3, z: {} },
    // falsche Arten in allen Feldern
    { v: 3, z: { gruppe: '<b>', modus: 'tafel', punkt: [1, 'a'], gitter: { schiefwinklig: { ba: 'gross', gamma: NaN }, rechteckig: { ba: 9, gamma: 45 }, hexagonal: { ba: 2, gamma: 90 } }, schritt: 999, aufbau: -3, zoomB: 'x', objGroesse: 50, aeTeile: [7, -1, 'a'], striche: [[1, 2]], struktur: { vorgabe: 'gibtsnicht' } } },
    { v: 3, z: { gitter: 'kaputt', schritt: 2.5, form: 'stern', erkl: '<img>', zeichnen: true, radieren: true, herkunft: 'ja' } },
    { v: 3, z: { gitter: { quadratisch: { ba: 1.3, gamma: 100 } } } }, // Werte, die das System nicht zulässt
    // Entwurf: falsche Art, unbekannte Gruppe, Gitter passt nicht zum System, zu viele Vertreter, kein Entwurf
    ...[5, 'p7', '<b>', true, null].map((gruppe) => ({ v: 3, z: { modus: 'entwurf', entwurf: { gruppe, ba: 1, gamma: 90, basis: [{ motiv: 'fahne', p: [0.1, 0.2] }] } } })),
    { v: 3, z: { modus: 'entwurf', entwurf: { gruppe: 'p6', ba: 1, gamma: 90, basis: [{ motiv: 'fahne', p: [0.1, 0.2] }] } } },
    { v: 3, z: { modus: 'entwurf', entwurf: { gruppe: 'p4mm', ba: 1.3, gamma: 90, basis: [{ motiv: 'fahne', p: [0.1, 0.2] }] } } },
    { v: 3, z: { modus: 'entwurf', entwurf: { gruppe: 'p4mm', ba: 1, gamma: 90, basis: Array.from({ length: 9 }, (_, i) => ({ motiv: 'atom', p: [i / 10, 0.3] })) } } },
    { v: 3, z: { modus: 'entwurf' } }, { v: 3, z: { modus: 'entwurf', entwurf: 'x' } }, { v: 3, z: { modus: 'entwurf', entwurf: { gruppe: 'p2', basis: 'x', elemente: 3, ae: 'ja', bindungen: 'nein' } } },
  ];
  for (const s of staende) {
    const z = ausSpeicher(JSON.parse(JSON.stringify(s) ?? 'null'));
    pruefeGueltig(z);
    // stabil: noch einmal gespeichert und geladen bleibt er gleich
    assert.deepEqual(JSON.parse(JSON.stringify(neuLaden(z))), JSON.parse(JSON.stringify(z)));
  }
  // gültige Werte bleiben erhalten
  const z = ausSpeicher({ v: 3, z: { gitter: { schiefwinklig: { ba: 1.5, gamma: 100 }, rechteckig: { ba: 0.7, gamma: 90 } }, schritt: 4 } });
  assert.deepEqual([z.gitter.schiefwinklig.ba, z.gitter.schiefwinklig.gamma, z.gitter.rechteckig.ba, z.schritt], [1.5, 100, 0.7, 4]);
});

test('Rundlauf: Zurücksetzen vor und nach dem Neuladen gleich (Speicher und Link)', () => {
  for (const z of beispiele().filter((x) => x.modus === 'struktur')) {
    // „Vorgabe wiederherstellen“ setzt auf strukturStart(vorgabe) zurück (struktur-ui.js)
    const vorher = strukturStart(z.struktur.vorgabe);
    for (const n of [neuLaden(z), neuLaden(startzustand(), hashVon(z))]) {
      assert.equal(n.struktur.vorgabe, z.struktur.vorgabe);
      assert.deepEqual(strukturStart(n.struktur.vorgabe), vorher);
    }
  }
});

test('Rundlauf: Grenzen und Abhängigkeiten in Link und Speicher gleich (Review #97)', () => {
  /** @param {Record<string, unknown>} felder */
  const speicher = (felder) => ausSpeicher({ v: 3, z: felder });
  // Gitter: Grenzen der Regler eingeschlossen, darüber hinaus der nächste gültige Wert (Leitfaden 5.2), keine Zahl: Startwert
  const g = (/** @type {number} */ ba) => speicher({ gitter: { schiefwinklig: { ba, gamma: 110 } } }).gitter.schiefwinklig.ba;
  assert.equal(g(2), 2); assert.equal(g(0.5), 0.5); assert.equal(g(2.05), 2); assert.equal(g(0.45), 0.5);
  const gg = (/** @type {number} */ gamma) => speicher({ gitter: { schiefwinklig: { ba: 1.25, gamma } } }).gitter.schiefwinklig.gamma;
  assert.deepEqual([gg(150), gg(60), gg(151), gg(59)], [150, 60, 150, 60]);
  assert.equal(speicher({ gitter: { schiefwinklig: { ba: '1.3', gamma: 110 } } }).gitter.schiefwinklig.ba, 1.25);
  const lg = (/** @type {string} */ ba) => { const z = startzustand(); hashAnwenden(z, `#m=eg&g=p1&ba=${ba}`); return z.gitter.schiefwinklig.ba; };
  assert.deepEqual([lg('2'), lg('0.5'), lg('2.05'), lg('0.45'), lg('x')], [2, 0.5, 2, 0.5, 1.25]);
  const lgg = (/** @type {string} */ gamma) => { const z = startzustand(); hashAnwenden(z, `#m=eg&g=p1&gamma=${gamma}`); return z.gitter.schiefwinklig.gamma; };
  assert.deepEqual([lgg('150'), lgg('60'), lgg('151'), lgg('59'), lgg('x')], [150, 60, 150, 60, 105]);
  // „Schritt für Schritt“ und Aufbau schliessen sich aus: zusammen beide zum Startwert, in beiden Wegen (#162)
  assert.deepEqual([speicher({ schritt: 3, aufbau: 2 }).schritt, speicher({ schritt: 3, aufbau: 2 }).aufbau], [0, 0]);
  { const z = startzustand(); hashAnwenden(z, '#m=eg&schritt=3&aufbau=2'); assert.deepEqual([z.schritt, z.aufbau], [0, 0]); }
  { const z = startzustand(); hashAnwenden(z, '#m=eg&aufbau=2'); assert.deepEqual([z.schritt, z.aufbau], [0, 2]); }
  // schritt (ganzzahlige Auswahl): 25 bleibt, 26 wird zum Startwert, in beiden Wegen
  assert.deepEqual([speicher({ schritt: 25 }).schritt, speicher({ schritt: 26 }).schritt], [25, 0]);
  const ls = (/** @type {string} */ n) => { const z = startzustand(); hashAnwenden(z, `#m=eg&schritt=${n}`); return z.schritt; };
  assert.deepEqual([ls('25'), ls('26')], [25, 0]);
  // Gitter im rechteckigen System: nur b/a ist frei, γ bleibt 90°, auch mit γ in Speicher und Link
  const r = speicher({ gruppe: 'pm', gitter: { rechteckig: { ba: 9, gamma: 45 } } }).gitter.rechteckig;
  assert.deepEqual([r.ba, r.gamma], [2, 90]);
  const rl = startzustand(); hashAnwenden(rl, '#m=eg&g=pm&ba=9&gamma=45');
  assert.deepEqual([rl.gitter.rechteckig.ba, rl.gitter.rechteckig.gamma], [2, 90]);
  // Stand und Link aus Fassungen mit „Symmetrie brechen“ oder `warum`: Der Speicher von v1 gilt nicht mehr (Leitfaden
  // Abschn. 8); die Felder brechen, frei, warum und die Link-Schlüssel brechen=1 und warum=1 haben keine Wirkung
  assert.deepEqual(JSON.parse(JSON.stringify(ausSpeicher({ v: 1, z: { gruppe: 'p4mm', schritt: 3 } }))), JSON.parse(JSON.stringify(startzustand())));
  const alt1 = ausSpeicher({ v: 3, z: { gruppe: 'p6mm', brechen: true, frei: { ba: 1.8, gamma: 70 }, warum: true } });
  assert.deepEqual([alt1.gruppe, alt1.herkunft, 'brechen' in alt1, 'frei' in alt1, 'warum' in alt1], ['p6mm', false, false, false, false]);
  const alt2 = startzustand(); hashAnwenden(alt2, '#m=eg&g=p6mm&brechen=1&warum=1');
  assert.deepEqual([alt2.gruppe, alt2.herkunft, 'brechen' in alt2, 'warum' in alt2], ['p6mm', false, false, false]);
  // `warum=1` wird nicht zu `herkunft`: Der Link zeigt die Erklärung, aber ohne den Schalter
  const alt3 = startzustand(); hashAnwenden(alt3, '#m=eg&g=p4mm&warum=1&erkl=4;0,0');
  assert.deepEqual([alt3.herkunft, alt3.erkl], [false, '4;0,0']);
  // Vergrösserung, Objekt, Struktur und Motivgrösse: in beiden Wegen der nächste gültige Wert
  const zs = speicher({ zoomB: 9, objGroesse: 0.1, struktur: { ba: 5, gamma: 10, basis: [{ motiv: 'atom', p: [0, 0], groesse: 7 }] } });
  assert.deepEqual([zs.zoomB, zs.objGroesse, zs.struktur.ba, zs.struktur.gamma, zs.struktur.basis[0].groesse], [3, 0.5, 2, 60, 1]);
  const zl2 = startzustand(); hashAnwenden(zl2, '#m=struktur&v=quadratisch&basis=atom,0,0,0,0,7&ba=5&gamma=10&zoom=9');
  assert.deepEqual([zl2.zoomB, zl2.struktur.ba, zl2.struktur.gamma, zl2.struktur.basis[0].groesse], [3, 2, 60, 1]);
  // Drehwinkel der Motive laufen um: 0° bis unter 360°, in beiden Wegen und stabil (Review #99)
  const ws = speicher({ struktur: { ba: 1, gamma: 90, basis: [800, -1000, -45, 360].map((winkel) => ({ motiv: 'fahne', p: [0, 0], winkel })) } });
  assert.deepEqual(ws.struktur.basis.map((e) => e.winkel), [80, 80, 315, 0]);
  const wl = startzustand(); hashAnwenden(wl, '#m=struktur&v=quadratisch&basis=fahne,0,0,0,800;fahne,0,0,0,-1000;fahne,0,0,0,-45;fahne,0,0,0,360');
  assert.deepEqual(wl.struktur.basis.map((e) => e.winkel), [80, 80, 315, 0]);
  assert.equal(hashVon(neuLaden(ws, hashVon(ws))), hashVon(ws));
  // Entwurf: ungültig → leerer Startentwurf (nicht umgedeutet); Gitter, das nicht zum System passt → Startgitter;
  // Grenze kappt am Ende; Gitter in der Genauigkeit des Links; in Speicher und Link gleich
  const es = (/** @type {Record<string, unknown>} */ en) => speicher({ modus: 'entwurf', entwurf: en }).entwurf;
  const el = (/** @type {string} */ h) => { const z = startzustand(); hashAnwenden(z, `#m=entwurf&${h}`); return z.entwurf; };
  const atom = { motiv: 'atom', farbe: 0, winkel: 0 };
  const leer = entwurfStart();
  for (const [en, h] of /** @type {[Record<string, unknown>, string][]} */ ([
    [{ gruppe: 'p7', ba: 1, gamma: 90, basis: [{ ...atom, p: [0.1, 0.2] }] }, 'g=p7&ba=1&gamma=90&basis=atom,0,1/10,1/5,0'],
    [{ ba: 1, gamma: 90, basis: [{ ...atom, p: [0.1, 0.2] }] }, 'ba=1&gamma=90&basis=atom,0,1/10,1/5,0'],
  ])) assert.deepEqual([es(en), el(h)], [leer, leer], h);
  // p6 mit quadratischem Gitter, p4mm mit b/a = 1,3: Startgitter des Systems, Vertreter bleiben
  for (const [sg, ba, gamma] of /** @type {[string, number, number][]} */ ([['p6', 1, 90], ['p4mm', 1.3, 90]])) {
    const a = es({ gruppe: sg, ba, gamma, basis: [{ ...atom, p: [0.1, 0.2] }] });
    const b = el(`g=${sg}&ba=${ba}&gamma=${gamma}&basis=atom,0,1/10,1/5,0`);
    const start = entwurfStart(sg);
    assert.deepEqual([a.ba, a.gamma, a.basis.length, b.ba, b.gamma, b.basis.length], [start.ba, start.gamma, 1, start.ba, start.gamma, 1], sg);
  }
  // p4mm: 7 Vertreter × 8 > 48 → 6 in beiden Wegen; b/a = 1,0004 liegt in der Genauigkeit des Links → exakt 1
  const sieben = Array.from({ length: 7 }, (_, i) => ({ ...atom, p: [(i + 1) / 20, 0.3] }));
  const ks = es({ gruppe: 'p4mm', ba: 1.0004, gamma: 90, basis: sieben });
  const kl = el(`g=p4mm&ba=1.0004&gamma=90&basis=${sieben.map((e) => `atom,0,${e.p[0]},0.3,0`).join(';')}`);
  assert.deepEqual([ks.gruppe, ks.basis.length, ks.ba, kl.gruppe, kl.basis.length, kl.ba], ['p4mm', 6, 1, 'p4mm', 6, 1]);
  // Gitter im rechteckigen System: nur b/a ist frei; Anzeigen el und ae
  const re = el('g=pm&ba=1.5&el=0&ae=1');
  assert.deepEqual([re.ba, re.gamma, re.elemente, re.ae], [1.5, 90, false, true]);
  assert.deepEqual([el('g=pm&ba=1.5&gamma=45').ba, el('g=pm&ba=1.5&gamma=45').gamma], [entwurfStart('pm').ba, 90], 'γ ≠ 90° passt nicht zum System');
  // ein Stand von v2 (vor „Muster entwerfen“) gilt nicht mehr
  assert.deepEqual(JSON.parse(JSON.stringify(ausSpeicher({ v: 2, z: { modus: 'entwurf', gruppe: 'p4mm', schritt: 3 } }))), JSON.parse(JSON.stringify(startzustand())));
  // ohne ba oder γ: 1 bzw. 90° in beiden Wegen
  const ohne = speicher({ modus: 'struktur', struktur: { basis: [] } }).struktur;
  const ohneL = startzustand(); hashAnwenden(ohneL, '#m=struktur&v=quadratisch&basis=');
  assert.deepEqual([ohne.ba, ohne.gamma, ohneL.struktur.ba, ohneL.struktur.gamma], [1, 90, 1, 90]);
  const zl3 = startzustand(); hashAnwenden(zl3, '#m=eg&g=p4&zoom=9&og=0.1');
  assert.deepEqual([zl3.zoomB, zl3.objGroesse], [3, 0.5]);
  // Objekt innerhalb ±10⁶
  assert.deepEqual(speicher({ punkt: [2e6, 0] }).punkt, startzustand().punkt);
  // Striche des Entwurfs: Punkte innerhalb ±10⁶, Farbe 0 … 3 (sonst 0), mindestens 2 Punkte, höchstens STRICH_GRENZE Punkte (1200, zeichnung.js)
  const strichEn = (/** @type {unknown} */ striche) => speicher({ modus: 'entwurf', entwurf: { gruppe: 'p4', ba: 1, gamma: 90, basis: [], striche } }).entwurf.striche;
  assert.deepEqual(strichEn([{ punkte: [[0, 0], [1e300, 0]], farbe: 1 }, { punkte: [[0, 0], [1, 1]], farbe: 2 }, { punkte: [[0, 0]], farbe: 1 }, { punkte: [[0, 0], [1, 1]], farbe: 7 }, 'x']),
    [{ punkte: [[0, 0], [1, 1]], farbe: 2 }, { punkte: [[0, 0], [1, 1]], farbe: 0 }]);
  assert.deepEqual(strichEn('x'), []); assert.deepEqual(strichEn(undefined), []);
  const viele = strichEn(Array.from({ length: 30 }, () => ({ punkte: Array.from({ length: 100 }, (_, i) => [i / 100, 0]), farbe: 1 })));
  assert.ok(viele.reduce((n, s) => n + s.punkte.length, 0) <= 1200 && viele.length > 0, `${viele.length} Striche`);
  // ein Link bringt keine Striche mit (nur der Speicher), und die des Entwurfs davor bleiben beim Öffnen eines Entwurf-Links
  const alt = startzustand(); alt.entwurf.striche = [{ punkte: [[0, 0], [1, 1]], farbe: 1 }];
  hashAnwenden(alt, '#m=entwurf&g=p4');
  assert.equal(alt.entwurf.striche.length, 1);
  assert.ok(!/striche/.test(hashVon(alt)));
  // hashAnwenden prüft auch, was es aus dem bisherigen Zustand übernimmt (Gitter)
  const altG = /** @type {Zustand} */ (/** @type {unknown} */ ({ ...startzustand(), gitter: { schiefwinklig: { ba: 'x', gamma: 1 } } }));
  hashAnwenden(altG, '#m=eg&g=p4');
  assert.equal(altG.gitter.schiefwinklig.ba, 1.25);
  // aeTeile: Doppelte weg, aufsteigend
  assert.deepEqual(speicher({ gruppe: 'p2mm', aeTeile: [1, 0, 0, 1, 99] }).aeTeile, [0, 1]);
  // fremde Schlüssel und __proto__ werden nicht übernommen
  const z = ausSpeicher(JSON.parse('{"v":3,"z":{"__proto__":{"boese":1},"fremd":2,"gruppe":"p4"}}'));
  assert.equal(z.gruppe, 'p4');
  assert.ok(!('fremd' in z) && !('boese' in z) && Object.getPrototypeOf(z) === Object.prototype);
});

test('Regler der Motivgrösse: logarithmisch von 0,02 bis 1, Rücklauf stabil', () => {
  const [lo, hi] = STRUKTUR_BEREICH.groesse;
  assert.equal(groesseVonRegler(0), lo);
  assert.equal(groesseVonRegler(GROESSE_SCHRITTE), hi);
  let vorher = 0;
  for (let i = 0; i <= GROESSE_SCHRITTE; i++) {
    const g = groesseVonRegler(i);
    assert.ok(g >= vorher && g >= lo && g <= hi, `Stellung ${i}: ${g}`);
    assert.equal(reglerVonGroesse(g), i, `Rücklauf ${i}`); // die Grösse im Zustand setzt den Regler wieder auf dieselbe Stelle
    vorher = g;
  }
  // der typische Bereich der Atome (0,05 bis 0,2) nimmt mehr als ein Drittel des Reglers ein (linear: 15 %)
  assert.ok((reglerVonGroesse(0.2) - reglerVonGroesse(0.05)) / GROESSE_SCHRITTE > 0.35);
  assert.equal(reglerVonGroesse(0.045) > 0 && reglerVonGroesse(0.045) < reglerVonGroesse(0.1), true);
});
