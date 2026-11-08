// Lernexperimente der Karte „Erste Schritte“ (js/hilfetexte.js, lib/common/js/ablauf.js): Daten vollständig,
// jede Adresse übersteht die Prüfung der App unverändert, und die Aussagen der Beobachtungen stimmen mit der App.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pruefeAblaeufe } from '../lib/common/js/ablauf.js';
import { ABLAEUFE, ERSTE_SCHRITTE } from '../js/hilfetexte.js';
import { startzustand, hashAnwenden, hashVon } from '../js/zustand.js';
import { ERZEUGTE, ZAEHLIGKEIT, ZAEHLIGKEIT_PARAMS, zaehligkeitDaten, lageteile, ortText, punktImInnern, imInnernMoeglich, KNAPP } from '../js/experimente.js';
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
  // Ziel (Thomas, 7.11.2026, #109): 8 bis 12 Experimente je Modus, erzeugte mitgezählt
  for (const m of ['eg', 'struktur']) {
    const n = [...ABLAEUFE, ...ERZEUGTE].filter((a) => a.modus === m).length;
    assert.ok(n >= 8 && n <= 12, `${m}: ${n} Experimente`);
  }
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
  // Ausbau (#109): bestimmte Gruppen der Strukturen
  for (const [id, i, g] of /** @type {[string, number, string][]} */ ([['erniedrigen', 0, 'p4'], ['erniedrigen', 1, 'p2'], ['versatz', 0, 'c2mm'], ['versatz', 1, 'p2'], ['metrik', 0, 'c2mm'], ['farbe', 0, 'p3m1'], ['farbe', 1, 'p6mm'], ['gitterpunkte', 0, 'c2mm']])) {
    assert.equal(strukturSymmetrie(zustand(adresse(id, i)).struktur)?.symbol, g, `${id} ${i}`);
  }
  // Motive entfernen: dieselbe Zelle (primitiv, gleiche Fläche), die Hälfte der Fähnchen, asymmetrische Einheit doppelt
  {
    const [a, b] = [0, 1].map((i) => zustand(adresse('erniedrigen', i)).struktur);
    assert.equal(b.basis.length * 2, a.basis.length);
    assert.equal(strukturSymmetrie(a)?.primitiv, 1);
    assert.equal(strukturSymmetrie(b)?.primitiv, 1);
    assert.equal(gruppe('p4').ordnung, 2 * gruppe('p2').ordnung);
    // entfernt sind die um 90° und 270° gedrehten Fähnchen (Mast waagrecht), es bleiben 0° und 180°
    assert.deepEqual(b.basis.map((e) => Number(e.winkel)).sort(), a.basis.map((e) => Number(e.winkel)).filter((w) => w % 180 === 0).sort());
  }
  // Läuferverband: konventionelle Zelle quadratisch, Gruppe ohne 4-zählige Drehpunkte
  { const v = /** @type {import('../js/vorgaben.js').Vorgabe} */ (vorgabe('laeufer')); assert.equal(v.gitter.ba, 1); assert.equal(Number(v.gitter.gamma), 90); }
  // Gitterpunkte zählen: zwei Gitterpunkte (Atome) in der konventionellen zentrierten Zelle, Zelle doppelt so gross wie primitiv
  assert.equal(zustand(adresse('gitterpunkte', 0)).struktur.basis.length, 2);
  assert.equal(strukturSymmetrie(zustand(adresse('gitterpunkte', 0)).struktur)?.primitiv, 2);
  // Ebenengruppen: Lage und Zähligkeit der Elemente, wie die Texte sie nennen
  const { elemente, bahn } = await import('../js/symmetrie.js');
  const auf = (/** @type {number[]} */ p, /** @type {{ punkt: number[], richtung: number[] }} */ l) => [-1, 0, 1].some((i) => [-1, 0, 1].some((j) => Math.abs((p[0] - l.punkt[0] + i) * l.richtung[1] - (p[1] - l.punkt[1] + j) * l.richtung[0]) < 1e-6));
  /** @param {string} g */
  const spiegel = (g) => elemente(gruppe(g)).linien.filter((l) => l.art === 'spiegel');
  /** @param {string} g @param {number[]} p */
  const dreh = (g, p) => elemente(gruppe(g)).drehpunkte.find((d) => Math.hypot(d.punkt[0] - p[0], d.punkt[1] - p[1]) < 1e-6)?.n;
  // p6: (⅔, ⅓) 3-zählig, (½, 0) und (½, ½) 2-zählig, Ecken 6-zählig; die Adressen erklären genau diese Punkte
  assert.equal(dreh('p6', [2 / 3, 1 / 3]), 3); assert.equal(dreh('p6', [1 / 3, 2 / 3]), 3);
  assert.equal(dreh('p6', [0.5, 0]), 2); assert.equal(dreh('p6', [0.5, 0.5]), 2); assert.equal(dreh('p6', [0, 0]), 6);
  assert.equal(zustand(adresse('drehpunkte-p6', 0)).erkl, '3;2/3,1/3');
  assert.equal(zustand(adresse('drehpunkte-p6', 1)).erkl, '2;1/2,0');
  // pm: Spiegellinien bei x = 0 und x = ½
  assert.deepEqual(spiegel('pm').map((l) => l.punkt[0]).sort(), [0, 0.5, 1]);
  // pg: das Bild des Fähnchens bei (⅗, ¾), keines bei (⅗, ¼); Gleitspiegellinie bei x = ½
  {
    const z = zustand(adresse('gleitung', 0));
    const b = bahn(gruppe('pg'), z.punkt);
    assert.ok(b.some((r) => Math.hypot(r[0] - 0.6, r[1] - 0.75) < 1e-9) && !b.some((r) => Math.hypot(r[0] - 0.6, r[1] - 0.25) < 1e-9));
    assert.ok(elemente(gruppe('pg')).linien.some((l) => l.art === 'gleit' && Math.abs(l.punkt[0] - 0.5) < 1e-9 && l.richtung[0] === 0));
  }
  // Punktgruppen wie in den Daten
  const { ebenengruppe } = await import('../js/ebenengruppen.js');
  assert.equal(ebenengruppe('pg').punktgruppe, 'm'); assert.equal(ebenengruppe('p4gm').punktgruppe, '4mm');
  // p31m: nur die Drehpunkte auf den Ecken auf Spiegellinien; p3m1: alle
  for (const [g, alle] of /** @type {[string, boolean][]} */ ([['p31m', false], ['p3m1', true]])) {
    const d = elemente(gruppe(g)).drehpunkte;
    assert.equal(d.every((x) => spiegel(g).some((l) => auf(x.punkt, l))), alle, g);
    if (!alle) assert.deepEqual(d.filter((x) => !spiegel(g).some((l) => auf(x.punkt, l))).map((x) => x.punkt.map((v) => Math.round(v * 3)).join()).sort(), ['1,2', '2,1']);
  }
});

test('Erzeugte Experimente: Zähligkeit stimmt für jede Lage mit der App, Bilder nur im Innern der Zelle', async () => {
  const { gruppe, lage, bahn, stabilisator, punktAufLage, elemente } = await import('../js/symmetrie.js');
  /** @param {string} h */
  const zustand = (h) => { const z = startzustand(); hashAnwenden(z, h); return z; };
  const params = ZAEHLIGKEIT_PARAMS();
  assert.equal(params.length, 33);
  const fragen = new Set(params.map((p) => variante(ZAEHLIGKEIT, p).schritte[0].frage));
  assert.equal(fragen.size, params.length, 'keine zwei gleichen Fragen');
  // die Regel aus den Daten (feste Koordinate 0) stimmt mit der Rechnung; ausgelassen sind sonst nur Doppelte im Wortlaut
  for (const e of EBENENGRUPPEN) for (const w of e.wyckoff) {
    if (e.symbol === 'p1') continue;
    const g = gruppe(e.symbol);
    const rand = [[0.21, 0.37], [0.13, 0.41], [0.29, 0.07]].map((q) => punktAufLage(g, w.b, /** @type {[number, number]} */ (q)));
    const aufDemRand = rand.every((r) => bahn(g, r).some((x) => x.some((v) => v < 1e-6)));
    assert.equal(imInnernMoeglich(w), !aufDemRand, `${e.symbol}:${w.b}`);
    assert.equal(punktImInnern(e.symbol, w.b) !== null, !aufDemRand, `${e.symbol}:${w.b} gerechnet`);
    const p = `${e.symbol}:${w.b}`;
    if (!aufDemRand && !params.includes(p)) assert.ok(fragen.has(variante(ZAEHLIGKEIT, p).schritte[0].frage), `${p} fehlt`);
  }
  for (const p of params) {
    const d = zaehligkeitDaten(p);
    const z = zustand(d.hash);
    assert.equal(z.gruppe, d.id, p);
    const g = gruppe(z.gruppe);
    const l = lage(g, z.punkt);
    assert.equal(l.buchstabe, d.b, `${p}: Wyckoff-Lage an der Adresse`);
    const b = bahn(g, z.punkt);
    assert.equal(b.length, l.zaehligkeit, `${p}: Stellen in der Zelle`);
    assert.ok(b.every((r) => r.every((v) => v > 1e-6)), `${p}: Bilder im Innern`);
    const t = lageteile(l.symbol);
    assert.equal(t.ordnung, stabilisator(g, l.punkt).length, `${p}: Ordnung der Lagesymmetrie ${l.symbol}`);
    assert.equal(l.zaehligkeit * t.ordnung, g.ordnung, `${p}: Zähligkeit mal Lagesymmetrie`);
    // Spiegel- und Gleitspiegellinien unabhängig aus der Zeichnung der App: Spiegellinien durch das Objekt je
    // Richtung einmal; ein allgemeiner Punkt liegt auf keiner Gleitspiegellinie
    const el = elemente(g);
    // modulo Gitter: die App zeichnet jede Linie einmal je Zelle, als Strecke mit einem Punkt darauf
    const durch = (/** @type {import('../js/symmetrie.js').Linie} */ x, /** @type {[number, number]} */ r) => [-1, 0, 1].some((i) => [-1, 0, 1].some((j) => Math.abs((r[0] - x.punkt[0] + i) * x.richtung[1] - (r[1] - x.punkt[1] + j) * x.richtung[0]) < 1e-6));
    const richtungen = new Set(el.linien.filter((x) => x.art === 'spiegel' && durch(x, z.punkt)).map((x) => { const a = Math.atan2(x.richtung[1], x.richtung[0]); return ((a + Math.PI) % Math.PI).toFixed(4); }));
    assert.equal(richtungen.size, t.linien, `${p}: Spiegellinien durch das Objekt`);
    if (l.allgemein) for (const r of b) assert.ok(!el.linien.some((x) => x.art === 'gleit' && durch(x, r)), `${p}: auf einer Gleitspiegellinie`);
    // gut getrennt: sonst kleineres Objekt in der Adresse
    assert.ok(d.wert >= KNAPP || (z.objGroesse === 0.5 && d.wert >= KNAPP / 2.5), `${p}: Trennung ${d.wert}`);
    const sch = variante(ZAEHLIGKEIT, p).schritte[0];
    const zahlen = (sch.vermutung ?? []).map((v) => (v === 'an einer' ? 1 : Number(v.replace('an ', ''))));
    assert.equal(zahlen[/** @type {number} */ (sch.richtig)], l.zaehligkeit, p);
    assert.equal(new Set(zahlen).size, zahlen.length, `${p}: Antworten verschieden`);
    assert.ok(zahlen.every((x) => g.ordnung % x === 0), `${p}: Antworten teilen die Zahl der Operationen`);
    assert.match(sch.frage, new RegExp(ortText(l.symbol)), p);
  }
  // jede Art von Lage kommt vor
  const arten = new Set(params.map((p) => { const t = lageteile(zaehligkeitDaten(p).symbol); return `${t.n}/${t.linien}`; }));
  for (const a of ['1/0', '1/1', '2/0', '2/2', '3/0', '3/3', '4/0', '4/4']) assert.ok(arten.has(a), a);
});
