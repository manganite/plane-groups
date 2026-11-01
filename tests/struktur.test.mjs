// Modus „Gitter und Basis“: Vorgaben, Motive, Kenndaten und Link-Adresse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VORGABEN, vorgabe } from '../js/vorgaben.js';
import { MOTIVE, motivKart } from '../js/motive.js';
import { strukturSymmetrie, basisLagen, strukturHTML, strukturTafelA, strukturTafelB, inKonventionell, ausKonventionell } from '../js/struktur.js';
import { startzustand, hashVon, hashAnwenden, strukturStart, wieVorgabe, basisText, liesBasis, pruefeStruktur } from '../js/zustand.js';
import { metrik, kart } from '../js/zeichnung.js';
import { bestimme } from '../js/bestimmung.js';

const FARBEN = { paper: '#fff', ink: '#000', muted: '#888', line: '#ccc', accent: '#a00', accent2: '#0a0', upper: '#00a', crystal: '#eef', dir: ['#a0a', '#0aa', '#aa0'], fc3: '#333', fc4: '#444' };
const st = (id) => { const v = vorgabe(id); return { ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis }; };

test('jede Vorgabe ergibt die erwartete Ebenengruppe', () => {
  assert.ok(VORGABEN.length >= 20);
  assert.equal(new Set(VORGABEN.map((v) => v.id)).size, VORGABEN.length, 'Kennungen eindeutig');
  for (const v of VORGABEN) assert.equal(strukturSymmetrie(st(v.id))?.symbol, v.erwartet, v.id);
});

test('Dreiecksbeispiel: pm → cm → p2mg', () => {
  assert.deepEqual(['dreieck1', 'dreieck2', 'dreieck3'].map((id) => strukturSymmetrie(st(id)).symbol), ['pm', 'cm', 'p2mg']);
});

// Ordnung der Punktgruppe eines Motivs aus seinen Punkten: Drehungen um Vielfache von 30° bzw.
// 45° und Spiegelungen an Geraden unter Vielfachen von 15° bzw. 22,5°, die die Punkte (mit Art)
// auf sich abbilden.
function ordnung(motiv) {
  const pts = motivKart({ motiv, winkel: 0 }).map((q) => ({ c: q.c, art: q.art }));
  const passt = (f) => pts.every((p) => { const c = f(p.c); return pts.some((q) => q.art === p.art && Math.hypot(q.c[0] - c[0], q.c[1] - c[1]) < 1e-9); });
  const winkel = [...new Set([...Array.from({ length: 12 }, (_, k) => 30 * k), ...Array.from({ length: 8 }, (_, k) => 45 * k)])];
  let n = 0;
  for (const w of winkel) {
    const r = (w * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
    if (passt(([x, y]) => [c * x - s * y, s * x + c * y])) n += 1; // Drehung um w
    const c2 = Math.cos(r); const s2 = Math.sin(r); // Spiegelung an der Geraden unter w/2
    if (passt(([x, y]) => [c2 * x + s2 * y, s2 * x - c2 * y])) n += 1;
  }
  return n;
}
test('Motive haben genau die angegebene eigene Symmetrie', () => {
  const ORDNUNG = { 1: 1, 2: 2, m: 2, '2mm': 4, 3: 3, '3m': 6, 4: 4, '4mm': 8, 6: 6, '6mm': 12 };
  for (const [k, d] of Object.entries(MOTIVE)) {
    if (k === 'atom') continue;
    assert.equal(ordnung(k), ORDNUNG[d.symmetrie], `${k} (${d.symmetrie})`);
  }
});

// Nachbarn je Atom im Abstand des kleinsten Atomabstands (Toleranz 1e-6) und der nächste Abstand
function nachbarn(id) {
  const s = st(id); const M = metrik(s);
  const pos = [];
  for (const e of s.basis) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) pos.push(kart(M, [e.p[0] + i, e.p[1] + j]));
  const zahlen = []; let dmin = Infinity; let zweit = Infinity;
  for (const e of s.basis) {
    const c = kart(M, e.p);
    const d = pos.map((q) => Math.hypot(q[0] - c[0], q[1] - c[1])).filter((x) => x > 1e-9).sort((a, b) => a - b);
    dmin = Math.min(dmin, d[0]);
    zahlen.push(d.filter((x) => Math.abs(x - d[0]) < 1e-6).length);
    zweit = Math.min(zweit, d.find((x) => x > d[0] + 1e-6));
  }
  return { zahlen, dmin, zweit };
}
test('Archimedische Parkettierungen: alle Kanten gleich lang, richtige Koordinationszahl', () => {
  for (const [id, z] of [['a488', 3], ['a3464', 4], ['a33434', 5], ['a33336', 5]]) {
    const n = nachbarn(id);
    assert.ok(n.zahlen.every((x) => x === z), `${id}: ${n.zahlen}`);
    assert.ok(n.zweit > n.dmin * 1.05, `${id}: nächster Abstand deutlich grösser`);
  }
  // Graphen: 3 Nachbarn, Kagome: 4
  assert.ok(nachbarn('graphen').zahlen.every((x) => x === 3));
  assert.ok(nachbarn('kagome').zahlen.every((x) => x === 4));
});

test('Wyckoff-Lagen der Basis', () => {
  const lagen = (id) => { const s = st(id); return basisLagen(s, strukturSymmetrie(s)).map((l) => `${l.zaehligkeit}${l.buchstabe} ${l.symbol}`); };
  assert.deepEqual(lagen('graphen'), ['2b 3m.', '2b 3m.']);
  assert.deepEqual(lagen('kagome'), ['3c 2mm', '3c 2mm', '3c 2mm']);
  assert.deepEqual(lagen('lieb'), ['1a 4mm', '2c 2mm.', '2c 2mm.']);
  assert.deepEqual(lagen('a33336'), Array(6).fill('6d 1'));
});

test('Ursprung nach ITA: bleibt, wenn erlaubt, sonst der nächste erlaubte Punkt', () => {
  const nah = (u, v) => u.every((x, i) => Math.abs(x - v[i]) < 1e-9);
  // h-BN, p3m1: Sechseckmitte und beide Atome sind 3m; der gegebene Ursprung (Sechseckmitte) bleibt
  assert.ok(nah(strukturSymmetrie(st('hbn')).ursprung, [0, 0]));
  assert.ok(nah(strukturSymmetrie(st('mos2')).ursprung, [0, 0]));
  // Molekül aus zwei Atomen: p2mm, Ursprung in der Molekülmitte (Skript Abb. 3.7)
  const atom = (p) => ({ motiv: 'atom', farbe: 0, p, winkel: 0 });
  const r = strukturSymmetrie({ ba: 1.35, gamma: 90, basis: [atom([0, 0]), atom([0.3, 0])] });
  assert.equal(r.symbol, 'p2mm');
  assert.ok(nah(r.ursprung, [0.15, 0]), String(r.ursprung));
  // p2mg (Dreiecksbeispiel): der gegebene Ursprung liegt auf keinem 2-zähligen Drehpunkt
  assert.ok(nah(strukturSymmetrie(st('dreieck3')).ursprung, [0.25, 0.25]));
  const e = (motiv, p, winkel = 0) => ({ motiv, farbe: 0, p, winkel });
  const u = (ba, gamma, basis) => strukturSymmetrie({ ba, gamma, basis }).ursprung;
  // Ursprung auf m: entlang der Linie bleibt er beim gegebenen, quer dazu die nächste Linie
  assert.ok(nah(u(1.35, 90, [e('dreieck', [0.3, 0.2], 90)]), [0.8, 0]));
  assert.ok(nah(u(1.35, 90, [e('dreieck', [0.3, 0.2], 0)]), [0, 0.2]));
  // schiefe Zelle: Abstand zum nächsten Gitterbild, nicht je Koordinate
  assert.ok(nah(u(2, 150, [e('w2', [0, 0.255])]), [0.5, 0.755]));
  assert.ok(nah(u(0.5, 150, [e('w2', [0.15, 0.005])]), [0.15, 0.505]));
  // Gleichstand: kleinere Koordinaten zuerst
  assert.ok(nah(u(1, 90, [e('w2', [0.25, 0])]), [0.25, 0]));
  assert.ok(nah(u(1, 90, [e('w2', [0.75, 0])]), [0.25, 0]));
  // knapp unter 1 (innerhalb der Toleranz der Erkennung) wird 0
  assert.ok(nah(u(1, 80, [e('w2', [0.1, 0.3]), e('w2', [0.89998, 0.7])]), [0, 0]));
  // gerundet nur, wenn die Operationen mit dem gerundeten Ursprung noch stimmen (Review PR #12)
  const r2 = strukturSymmetrie({ ba: 1.35, gamma: 90, basis: [e('w2', [0.99992, 0])] });
  assert.equal(r2.symbol, 'p2');
  assert.ok(r2.ursprung[0] === 0 || Math.abs(r2.ursprung[0] - 0.99992) < 1e-9, String(r2.ursprung));
});

test('Ursprung nach ITA: nächster Ursprung auch in stark gescherter gegebener Zelle (Review PR #12)', () => {
  // a = (1, 0), b = (5,31; 0,1): nächstes Gitterbild von (0,4; 0,49) liegt bei Versatz (−3, 0)
  const r = bestimme({ a: [1, 0], b: [5.31, 0.1], punkte: [{ p: [0.4, 0.49], art: 'x' }] });
  assert.equal(r.symbol, 'p2');
  assert.ok(Math.abs(r.ursprung[0] - 0.4) < 1e-9 && Math.abs(r.ursprung[1] - 0.49) < 1e-9, String(r.ursprung));
});

test('konventionelle Zelle: Umrechnung hin und zurück; zentrierte Eingabe in primitiver Zelle', () => {
  const r = strukturSymmetrie(st('dreieck3'));
  for (const p of [[0.1, 0.2], [0.7, 0.4]]) {
    const x = inKonventionell(r, p); const q = ausKonventionell(r, x);
    assert.ok([0, 1].every((i) => Math.abs(((q[i] - p[i]) % 1 + 1.5) % 1 - 0.5) < 1e-9));
  }
  // rechteckig zentriertes Gitter (A, B), gegeben in der primitiven Zelle (A, (A + B)/2): c2mm mit doppelter Zelle
  const M = metrik({ ba: 1.35, gamma: 90 });
  const b = [(M.a[0] + M.b[0]) / 2, (M.a[1] + M.b[1]) / 2];
  const L = Math.hypot(...b) / Math.hypot(...M.a); // b/a der primitiven Zelle
  const cos = (M.a[0] * b[0] + M.a[1] * b[1]) / (Math.hypot(...M.a) * Math.hypot(...b));
  const gamma = (Math.acos(cos) * 180) / Math.PI;
  const r2 = strukturSymmetrie({ ba: L, gamma, basis: [{ motiv: 'atom', farbe: 0, p: [0, 0], winkel: 0 }] });
  assert.equal(r2.symbol, 'c2mm');
  assert.equal(Math.abs(r2.zelle[0][0] * r2.zelle[1][1] - r2.zelle[0][1] * r2.zelle[1][0]), 2);
});

test('Tafeln und Kenndaten entstehen für alle Vorgaben', () => {
  for (const v of VORGABEN) {
    const s = { ...st(v.id), elemente: true, zelle: true, ae: true, bindungen: true };
    const a = strukturTafelA(s, { elemente: true, zelle: true, ae: true, bindungen: true }, FARBEN, 0);
    assert.ok(a.svg.startsWith('<rect') && !a.svg.includes('NaN'), v.id);
    assert.ok(!strukturTafelB(s, FARBEN, a.ergebnis).svg.includes('NaN'), v.id);
    const h = strukturHTML(s, a.ergebnis, null, FARBEN);
    assert.ok(h.includes(`data-zu-eg="${v.erwartet}"`), v.id);
    assert.equal((h.match(/<tr>/g) ?? []).length, s.basis.length + 1, `${v.id}: eine Zeile je Motiv`);
  }
  assert.match(strukturHTML(st('dreieck2'), strukturSymmetrie(st('dreieck2')), 'pm', FARBEN), /Geändert/);
  assert.match(strukturHTML({ ...st('dreieck1'), basis: [] }, null, null, FARBEN), /Basis ist leer/);
});

test('Link-Adresse: Vorgabe kurz, veränderte Struktur ausgeschrieben, hin und zurück', () => {
  const z = startzustand();
  z.modus = 'struktur';
  z.struktur = strukturStart('kagome');
  assert.equal(hashVon(z), '#m=struktur&v=kagome');
  z.struktur.basis[1].p = [0.25, 0.5];
  z.struktur.basis.push({ motiv: 'w3', farbe: 2, p: [0.3, 0.123456789], winkel: 15, groesse: 0.2 });
  z.struktur.gamma = 110;
  z.struktur.ae = true;
  const h = hashVon(z);
  assert.match(h, /basis=atom,0,1\/2,0,0;atom,0,1\/4,1\/2,0;atom,0,1\/2,1\/2,0;w3,2,3\/10,0\.123457,15,0\.2/);
  const z2 = startzustand();
  assert.equal(hashAnwenden(z2, h), true);
  assert.equal(z2.modus, 'struktur');
  assert.equal(z2.struktur.gamma, 110);
  assert.equal(z2.struktur.ae, true);
  assert.equal(z2.struktur.basis.length, 4);
  assert.equal(hashVon(z2), h);
  // Vorgabe mit Schalter
  const z3 = startzustand();
  hashAnwenden(z3, '#m=struktur&v=graphen&sbind=0&sel=0');
  assert.equal(z3.struktur.vorgabe, 'graphen');
  assert.equal(wieVorgabe(z3.struktur), true);
  assert.deepEqual([z3.struktur.bindungen, z3.struktur.elemente], [false, false]);
  // unbekannte Vorgabe: Start
  const z4 = startzustand();
  hashAnwenden(z4, '#m=struktur&v=gibtsnicht');
  assert.equal(z4.struktur.vorgabe, 'dreieck1');
  // Ein Link im Modus „Ebenengruppen“ lässt die Struktur stehen
  const z5 = startzustand();
  z5.struktur = strukturStart('lieb');
  hashAnwenden(z5, '#m=eg&g=p4');
  assert.equal(z5.struktur.vorgabe, 'lieb');
});

test('Basis als Text: ungültige Einträge fallen weg', () => {
  const b = liesBasis('atom,0,0,0,0;gibtsnicht,0,0,0,0;atom,7,0,0,0;atom,1,x,0,0;fahne,3,1/3,2/3,-45,0.9;fahne,3,1/3,2/3,-45,0.1');
  assert.equal(b.length, 3);
  assert.equal(b[1].groesse, undefined, 'Grösse ausserhalb des Bereichs: Standard');
  assert.equal(b[2].groesse, 0.1);
  assert.equal(basisText([{ motiv: 'atom', farbe: 0, p: [1 / 3, 2 / 3], winkel: 0, groesse: 0.045 }]), 'atom,0,1/3,2/3,0');
});

test('Struktur aus dem Speicher prüfen', () => {
  assert.equal(pruefeStruktur(null), null);
  assert.equal(pruefeStruktur({ ba: 5, gamma: 90, basis: [] }), null);
  const s = pruefeStruktur({ vorgabe: 'x', ba: 1, gamma: 90, basis: [{ motiv: 'atom', p: [0.1, 0.2] }, { motiv: 'atom', p: [NaN, 0] }, { motiv: 'böse', p: [0, 0] }], ae: 'ja' });
  assert.equal(s.basis.length, 1);
  assert.equal(s.vorgabe, 'dreieck1');
  assert.deepEqual([s.elemente, s.zelle, s.ae, s.bindungen], [true, true, false, true]);
});
