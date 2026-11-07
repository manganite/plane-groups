// Lernexperimente der Karte „Erste Schritte“ (js/hilfetexte.js, lib/common/js/ablauf.js): Daten vollständig,
// jede Adresse übersteht die Prüfung der App unverändert, und die Aussagen der Beobachtungen stimmen mit der App.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pruefeAblaeufe } from '../lib/common/js/ablauf.js';
import { ABLAEUFE, ERSTE_SCHRITTE } from '../js/hilfetexte.js';
import { startzustand, hashAnwenden, hashVon } from '../js/zustand.js';
import { ERZEUGTE, ZAEHLIGKEIT, ZAEHLIGKEIT_PARAMS, zaehligkeitDaten, lageteile, ortText, punktImInnern } from '../js/experimente.js';
import { variante } from '../lib/common/js/ablauf.js';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';

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
  assert.deepEqual(pruefeAblaeufe([...ABLAEUFE, ...ERZEUGTE], { hashGueltig: gueltig, modi: ['eg', 'struktur'], anker: ANKER }), []);
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

test('Erzeugte Experimente: Zähligkeit stimmt für jede Lage mit der App, Bilder nur im Innern der Zelle', async () => {
  const { gruppe, lage, bahn, stabilisator, punktAufLage } = await import('../js/symmetrie.js');
  /** @param {string} h */
  const zustand = (h) => { const z = startzustand(); hashAnwenden(z, h); return z; };
  const params = ZAEHLIGKEIT_PARAMS();
  assert.ok(params.length >= 25, `${params.length} Parameter`);
  const fragen = new Set(params.map((p) => variante(ZAEHLIGKEIT, p).schritte[0].frage));
  assert.equal(fragen.size, params.length, 'keine zwei gleichen Fragen');
  // ausgelassen sind genau die Lagen, deren Punkte immer ein Bild auf Kante oder Ecke haben, und Doppelte im Wortlaut
  for (const e of EBENENGRUPPEN) for (const w of e.wyckoff) {
    const p = `${e.symbol}:${w.b}`;
    if (params.includes(p) || e.symbol === 'p1') continue;
    const g = gruppe(e.symbol);
    const rand = [[0.21, 0.37], [0.13, 0.41], [0.29, 0.07]].map((q) => punktAufLage(g, w.b, /** @type {[number, number]} */ (q)));
    const aufDemRand = rand.every((r) => bahn(g, r).some((x) => x.some((v) => v < 1e-6)));
    const doppelt = punktImInnern(e.symbol, w.b) !== null && fragen.has(variante(ZAEHLIGKEIT, p).schritte[0].frage);
    assert.ok(aufDemRand || doppelt, `${p} fehlt`);
  }
  for (const p of params) {
    const d = zaehligkeitDaten(p);
    const z = zustand(d.hash);
    assert.equal(z.gruppe, d.id, p);
    const g = gruppe(z.gruppe);
    const l = lage(g, z.punkt);
    assert.equal(l.buchstabe, d.b, `${p}: Wyckoff-Lage an der Adresse`);
    assert.equal(bahn(g, z.punkt).length, l.zaehligkeit, `${p}: Stellen in der Zelle`);
    assert.ok(bahn(g, z.punkt).every((r) => r.every((v) => v > 1e-6)), `${p}: Bilder im Innern`);
    assert.equal(lageteile(l.symbol).ordnung, stabilisator(g, l.punkt).length, `${p}: Ordnung der Lagesymmetrie ${l.symbol}`);
    assert.equal(l.zaehligkeit * lageteile(l.symbol).ordnung, g.ordnung, `${p}: Zähligkeit mal Lagesymmetrie`);
    const sch = variante(ZAEHLIGKEIT, p).schritte[0];
    assert.match(sch.vermutung?.[/** @type {number} */ (sch.richtig)] ?? '', new RegExp(`^an ${l.zaehligkeit === 1 ? 'einer' : l.zaehligkeit}$`), p);
    assert.equal(new Set(sch.vermutung).size, sch.vermutung?.length, `${p}: Antworten verschieden`);
    assert.match(sch.frage, new RegExp(ortText(l.symbol)), p);
  }
  // jede Art von Lage kommt vor
  const arten = new Set(params.map((p) => { const t = lageteile(zaehligkeitDaten(p).symbol); return `${t.n}/${t.linien}`; }));
  for (const a of ['1/0', '1/1', '2/0', '2/2', '3/0', '3/3', '4/0', '4/4']) assert.ok(arten.has(a), a);
});

