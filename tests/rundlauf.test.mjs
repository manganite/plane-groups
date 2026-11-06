// Rundlauf-Tests nach Leitfaden Abschn. 9 (crystallography-common#63, #96): Zustand → Link → Zustand,
// Zustand → Speicher → Zustand, alter oder verdorbener Speicherstand → gültiger Zustand, Zurücksetzen vor
// und nach dem Neuladen gleich. Die Erwartungen stehen hier unabhängig vom Code (feste Listen und Bereiche).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startzustand, hashVon, hashAnwenden, ausSpeicher, speicherStand, strukturStart } from '../js/zustand.js';
import { VORGABEN } from '../js/vorgaben.js';
import { grad } from '../js/zeichnung.js';

/** @import { Zustand } from '../js/zustand.js' */

// unabhängig vom Code festgehalten: die 17 Symbole, Systeme mit festen Werten, Bereiche der Regler
const SYMBOLE = ['p1', 'p2', 'pm', 'pg', 'cm', 'p2mm', 'p2mg', 'p2gg', 'c2mm', 'p4', 'p4mm', 'p4gm', 'p3', 'p3m1', 'p31m', 'p6', 'p6mm'];
const FEST = { rechteckig: { gamma: 90 }, quadratisch: { ba: 1, gamma: 90 }, hexagonal: { ba: 1, gamma: 120 } };
const BEREICH = { ba: [0.6, 1.6], gamma: [95, 125] };
const SCHIEF = ['p1', 'p2']; // schiefwinklig: dort ist nichts zu brechen

/** Neu laden: Speicher wie im Browser (JSON), dann der Link, wie main.js. @param {Zustand} z @param {string} [hash] */
const neuLaden = (z, hash) => {
  const n = ausSpeicher(JSON.parse(JSON.stringify(speicherStand(z))));
  if (hash) hashAnwenden(n, hash);
  return n;
};

/** Gültig nach den festen Erwartungen oben. @param {Zustand} z */
function pruefeGueltig(z) {
  assert.ok(SYMBOLE.includes(z.gruppe), `gruppe ${z.gruppe}`);
  assert.ok(['eg', 'struktur'].includes(z.modus), `modus ${z.modus}`);
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
  assert.ok(typeof z.brechen === 'boolean' && !(z.brechen && SCHIEF.includes(z.gruppe)), 'brechen');
  assert.ok(z.frei.ba >= 0.5 && z.frei.ba <= 2 && z.frei.gamma >= 60 && z.frei.gamma <= 150, 'frei');
  assert.ok(!(z.zeichnen && z.radieren), 'zeichnen und radieren');
  assert.ok(VORGABEN.some((v) => v.id === z.struktur.vorgabe), `struktur.vorgabe ${z.struktur.vorgabe}`);
  assert.ok(Array.isArray(z.struktur.basis) && z.struktur.basis.length > 0, 'struktur.basis');
  assert.deepEqual(Object.keys(z).sort(), Object.keys(startzustand()).sort(), 'nur die Felder des Zustands');
  assert.equal(typeof hashVon(z), 'string');
}

/** Zustände zum Hin und Zurück: jede Gruppe, beide Modi, Gitter, Schalter, Vorgaben. @returns {Zustand[]} */
function beispiele() {
  /** @type {Zustand[]} */
  const out = [];
  for (const g of SYMBOLE) {
    const z = startzustand();
    Object.assign(z, { gruppe: g, punkt: [0.21, 0.37], ae: true, zellen: 2, form: 'komma', schritt: 3, aufbau: 2 });
    z.gitter.schiefwinklig = { ba: 1.4, gamma: grad(110) };
    z.gitter.rechteckig = { ba: 0.8, gamma: grad(90) };
    out.push(z);
  }
  for (const v of VORGABEN) {
    const z = startzustand();
    z.modus = 'struktur'; z.struktur = strukturStart(v.id);
    out.push(z);
  }
  // Symmetrie gebrochen: freie Metrik
  for (const g of ['pm', 'p4mm', 'p6mm']) {
    const z = startzustand();
    Object.assign(z, { gruppe: g, brechen: true, frei: { ba: 1.8, gamma: grad(70) } });
    out.push(z);
  }
  // verändert gegenüber der Vorgabe (Zurücksetzen muss die Vorgabe kennen)
  const z = startzustand();
  z.modus = 'struktur'; z.struktur = strukturStart('graphen'); z.struktur.ba = 1.3; z.struktur.basis.pop();
  out.push(z);
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
    z.striche = [[[0.1, 0.1], [0.4, 0.2]]];
    const z2 = neuLaden(z);
    assert.deepEqual(JSON.parse(JSON.stringify(z2)), JSON.parse(JSON.stringify(z)), hashVon(z));
  }
});

test('Rundlauf: alter oder verdorbener Speicherstand → gültiger Zustand, ohne Fehler (#96)', () => {
  /** @type {unknown[]} */
  const staende = [
    null, 'x', 42, { v: 2, z: {} }, { v: 1 }, { v: 1, z: null },
    // falsche Arten in allen Feldern
    { v: 1, z: { gruppe: '<b>', modus: 'tafel', punkt: [1, 'a'], gitter: { schiefwinklig: { ba: 'gross', gamma: NaN }, rechteckig: { ba: 9, gamma: 45 }, hexagonal: { ba: 2, gamma: 90 } }, schritt: 999, aufbau: -3, zoomB: 'x', objGroesse: 50, frei: 'nein', aeTeile: [7, -1, 'a'], striche: [[1, 2]], struktur: { vorgabe: 'gibtsnicht' } } },
    { v: 1, z: { gitter: 'kaputt', schritt: 2.5, form: 'stern', erkl: '<img>', zeichnen: true, radieren: true, brechen: 'ja' } },
    { v: 1, z: { gitter: { quadratisch: { ba: 1.3, gamma: 100 } } } }, // Werte, die das System nicht zulässt
  ];
  for (const s of staende) {
    const z = ausSpeicher(JSON.parse(JSON.stringify(s) ?? 'null'));
    pruefeGueltig(z);
    // stabil: noch einmal gespeichert und geladen bleibt er gleich
    assert.deepEqual(JSON.parse(JSON.stringify(neuLaden(z))), JSON.parse(JSON.stringify(z)));
  }
  // gültige Werte bleiben erhalten
  const z = ausSpeicher({ v: 1, z: { gitter: { schiefwinklig: { ba: 1.5, gamma: 100 }, rechteckig: { ba: 0.7, gamma: 90 } }, schritt: 4 } });
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
  const speicher = (felder) => ausSpeicher({ v: 1, z: felder });
  // Gitter: Grenzen der Regler eingeschlossen, darüber hinaus der Startwert
  const g = (/** @type {number} */ ba) => speicher({ gitter: { schiefwinklig: { ba, gamma: 110 } } }).gitter.schiefwinklig.ba;
  assert.equal(g(1.6), 1.6); assert.equal(g(0.6), 0.6); assert.equal(g(1.65), 1.25); assert.equal(g(0.55), 1.25);
  const lg = (/** @type {string} */ ba) => { const z = startzustand(); hashAnwenden(z, `#m=eg&g=p1&ba=${ba}`); return z.gitter.schiefwinklig.ba; };
  assert.deepEqual([lg('1.6'), lg('0.6'), lg('1.65'), lg('0.55')], [1.6, 0.6, 1.25, 1.25]);
  // schritt: 25 bleibt, 26 wird zum Startwert, in beiden Wegen
  assert.deepEqual([speicher({ schritt: 25 }).schritt, speicher({ schritt: 26 }).schritt], [25, 0]);
  const ls = (/** @type {string} */ n) => { const z = startzustand(); hashAnwenden(z, `#m=eg&schritt=${n}`); return z.schritt; };
  assert.deepEqual([ls('25'), ls('26')], [25, 0]);
  // brechen im schiefwinkligen System: in beiden Wegen verworfen
  assert.equal(speicher({ gruppe: 'p2', brechen: true }).brechen, false);
  const zl = startzustand(); hashAnwenden(zl, '#m=eg&g=p2&brechen=1&ba=1.8&gamma=70');
  assert.equal(zl.brechen, false);
  // frei: ungültige Werte werden ersetzt (Startwert des Systems), nicht an die Grenze geschoben
  const f = speicher({ gruppe: 'p6mm', brechen: true, frei: { ba: 9, gamma: 30 } }).frei;
  assert.deepEqual([f.ba, f.gamma], [1, 120]); // Startwert des hexagonalen Systems
  const fl = startzustand(); hashAnwenden(fl, '#m=eg&g=p6mm&brechen=1&ba=9&gamma=30');
  assert.deepEqual([fl.frei.ba, fl.frei.gamma], [1, 120]);
  // Objekt und Striche innerhalb ±10⁶, höchstens STRICH_GRENZE Punkte (1200, zeichnung.js)
  assert.deepEqual(speicher({ punkt: [2e6, 0] }).punkt, startzustand().punkt);
  assert.deepEqual(speicher({ striche: [[[0, 0], [1e300, 0]], [[0, 0], [1, 1]]] }).striche, [[[0, 0], [1, 1]]]);
  const viele = speicher({ striche: Array.from({ length: 30 }, () => Array.from({ length: 100 }, (_, i) => [i / 100, 0])) }).striche;
  assert.ok(viele.flat().length <= 1200 && viele.length > 0, `${viele.flat().length} Punkte`);
  // hashAnwenden prüft auch, was es aus dem bisherigen Zustand übernimmt (Gitter, Striche)
  const alt = /** @type {Zustand} */ (/** @type {unknown} */ ({ ...startzustand(), gitter: { schiefwinklig: { ba: 'x', gamma: 1 } }, striche: [[[0, 0], ['a', 1]]] }));
  hashAnwenden(alt, '#m=eg&g=p4');
  assert.deepEqual([alt.gitter.schiefwinklig.ba, alt.striche.length], [1.25, 0]);
  // aeTeile: Doppelte weg, aufsteigend
  assert.deepEqual(speicher({ gruppe: 'p2mm', aeTeile: [1, 0, 0, 1, 99] }).aeTeile, [0, 1]);
  // fremde Schlüssel und __proto__ werden nicht übernommen
  const z = ausSpeicher(JSON.parse('{"v":1,"z":{"__proto__":{"boese":1},"fremd":2,"gruppe":"p4"}}'));
  assert.equal(z.gruppe, 'p4');
  assert.ok(!('fremd' in z) && !('boese' in z) && Object.getPrototypeOf(z) === Object.prototype);
});
