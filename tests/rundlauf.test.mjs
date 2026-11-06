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
    { v: 1, z: { gitter: 'kaputt', schritt: 2.5, form: 'stern', erkl: '<img>' } },
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
