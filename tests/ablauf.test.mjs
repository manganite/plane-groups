// Lernexperimente der Karte „Erste Schritte“ (js/hilfetexte.js, lib/common/js/ablauf.js): Daten vollständig,
// jede Adresse übersteht die Prüfung der App unverändert, und die Aussagen der Beobachtungen stimmen mit der App.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pruefeAblaeufe } from '../lib/common/js/ablauf.js';
import { ABLAEUFE, ERSTE_SCHRITTE } from '../js/hilfetexte.js';
import { startzustand, hashAnwenden, hashVon } from '../js/zustand.js';

const ANKER = [...readFileSync(new URL('../skript.html', import.meta.url), 'utf8').matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);

/** Adresse auf den Startzustand anwenden; gültig, wenn sie wieder genau so geschrieben wird. @param {string} h */
function gueltig(h) {
  const z = startzustand();
  if (!hashAnwenden(z, h)) return false;
  const neu = new URLSearchParams(hashVon(z).slice(1));
  // jede Angabe der Adresse muss im Zustand ankommen (die App schreibt darüber hinaus Startwerte wie x, y)
  return [...new URLSearchParams(h.slice(1))].every(([k, v]) => neu.get(k) === v);
}

test('Lernexperimente: Daten vollständig, Adressen gültig, Modi und Anker bekannt', () => {
  assert.deepEqual(pruefeAblaeufe(ABLAEUFE, { hashGueltig: gueltig, modi: ['eg', 'struktur'], anker: ANKER }), []);
  for (const m of ['eg', 'struktur']) assert.equal(ABLAEUFE.filter((a) => a.modus === m).length, 3, m);
});

test('Erste Schritte: je Modus ein Ablauf mit 3–4 Bedienschritten, der letzte öffnet die Experimente', () => {
  assert.deepEqual(pruefeAblaeufe(ERSTE_SCHRITTE, { hashGueltig: gueltig, modi: ['eg', 'struktur'], anker: ANKER, aktionen: ['hinzufuegen', 'experimente'] }), []);
  for (const m of ['eg', 'struktur']) {
    const a = ERSTE_SCHRITTE.filter((x) => x.modus === m);
    assert.equal(a.length, 1, m);
    assert.ok(a[0].schritte.length >= 3 && a[0].schritte.length <= 4, m);
    assert.ok(a[0].schritte.every((s) => !s.vermutung), `${m}: ohne Vermutung`);
    assert.equal(a[0].schritte.at(-1)?.handlung?.aktion, 'experimente', m);
  }
});

test('Lernexperimente: Beobachtungen stimmen mit der App (Zähligkeit, Operationen je Zelle, bestimmte Gruppe)', async () => {
  const { gruppe, lage } = await import('../js/symmetrie.js');
  const { strukturSymmetrie } = await import('../js/struktur.js');
  const { vorgabe } = await import('../js/vorgaben.js');
  /** @param {string} id @param {number} i */
  const adresse = (id, i) => /** @type {string} */ (ABLAEUFE.find((a) => a.id === id)?.schritte[i].handlung?.hash);
  /** @param {string} h */
  const zustand = (h) => { const z = startzustand(); hashAnwenden(z, h); return z; };
  // allgemeine und spezielle Lage: 4-mal auf der Spiegellinie, 1-mal auf dem Drehpunkt
  // Objekt nicht auf dem Rand der Zelle (Entscheidung Thomas, 7.11.2026): sonst sieht man mehr Bilder, als die
  // Zähligkeit sagt, weil Bilder auf Kanten und Ecken nur anteilig zur Zelle gehören
  const { anwenden } = await import('../js/symmetrie.js');
  for (const i of [0, 1]) {
    const z = zustand(adresse('lage', i));
    for (const op of gruppe(z.gruppe).alle) {
      const q = anwenden(op, z.punkt).map((c) => c - Math.floor(c + 1e-9));
      assert.ok(q.every((c) => c > 1e-6), `${z.gruppe} (${z.punkt}): Bild auf dem Rand bei (${q})`);
    }
  }
  for (const [i, n] of [[0, 4], [1, 1]]) { const z = zustand(adresse('lage', i)); assert.equal(lage(gruppe(z.gruppe), z.punkt).zaehligkeit, n); }
  // asymmetrische Einheit: ein Achtel, weil beide Gruppen 8 Operationen je (konventioneller) Zelle haben
  for (const i of [0, 1]) { const z = zustand(adresse('ae', i)); assert.ok(z.ae); assert.equal(gruppe(z.gruppe).ordnung, 8, z.gruppe); }
  // Gitter und Basis: die bestimmte Gruppe
  for (const [id, i, g] of /** @type {[string, number, string][]} */ ([['zentrierung', 0, 'pm'], ['zentrierung', 1, 'cm'], ['drehen', 0, 'p2mg'], ['graphen', 0, 'p6mm']])) {
    assert.equal(strukturSymmetrie(zustand(adresse(id, i)).struktur)?.symbol, g, `${id} ${i}`);
  }
  assert.equal(vorgabe('graphen')?.basis.length, 2, 'Graphen: zwei Atome in der Basis');
});
