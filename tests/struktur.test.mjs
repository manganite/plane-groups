// Modus „Gitter und Basis“: Vorgaben, Motive, Kenndaten und Link-Adresse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VORGABEN, vorgabe } from '../js/vorgaben.js';
import { MOTIVE, MOTIVZEILEN, motivKart, chiral } from '../js/motive.js';
import { ORNAMENTE, ornamentMitte, ORNAMENT_EINHEIT } from '../js/zeichnung.js';
import { motivSVG, motivSymbol, strukturSymmetrie, basisLagen, strukturHTML, strukturTafelA, strukturTafelB, inKonventionell, ausKonventionell, bindungenBasis } from '../js/struktur.js';
import { startzustand, hashVon, hashAnwenden, strukturStart, entwurfStart, wieVorgabe, basisText, liesBasis, pruefeStruktur, pruefeEntwurf, gitterZurGruppe, bahnGewicht } from '../js/zustand.js';
import { ausgeschrieben } from '../js/bahnen.js';
import { metrik, kart, ansicht, bruchVon, LUPE } from '../js/zeichnung.js';
import { bestimme } from '../js/bestimmung.js';
import { grad } from '../js/zeichnung.js';

/** @import { Vec2, Kartesisch } from '../lib/common/js/typen.js' */
/** @import { Bestimmung } from '../js/bestimmung.js' */
/** @import { Basiseintrag, Struktur } from '../js/motive.js' */
/** @import { Vorgabe } from '../js/vorgaben.js' */
/** @import { StrukturZustand, EntwurfZustand } from '../js/zustand.js' */

/** Symmetrie einer Struktur; die Tests erwarten immer ein Ergebnis. @param {Struktur} s */
const symmetrie = (s) => /** @type {Bestimmung} */ (strukturSymmetrie(s));

/** @type {import('../js/zeichnung.js').Farben} */
const FARBEN = { paper: '#fff', ink: '#000', muted: '#888', line: '#ccc', accent: '#a00', accent2: '#0a0', upper: '#00a', crystal: '#eef', dir: ['#a0a', '#0aa', '#aa0'], fc3: '#333', fc4: '#444' };
/** @param {string} id */
const st = (id) => { const v = /** @type {Vorgabe} */ (vorgabe(id)); return { ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis }; };

test('jede Vorgabe ergibt die erwartete Ebenengruppe', () => {
  assert.ok(VORGABEN.length >= 20);
  assert.equal(new Set(VORGABEN.map((v) => v.id)).size, VORGABEN.length, 'Kennungen eindeutig');
  for (const v of VORGABEN) assert.equal(strukturSymmetrie(st(v.id))?.symbol, v.erwartet, v.id);
});

test('Dreiecksbeispiel: pm → cm → p2mg', () => {
  assert.deepEqual(['dreieck1', 'dreieck2', 'dreieck3'].map((id) => symmetrie(st(id)).symbol), ['pm', 'cm', 'p2mg']);
});

// Ordnung der Punktgruppe eines Motivs aus seinen Punkten: Drehungen um Vielfache von 30° bzw.
// 45° und Spiegelungen an Geraden unter Vielfachen von 15° bzw. 22,5°, die die Punkte (mit Art)
// auf sich abbilden.
/** @param {string} motiv */
function ordnung(motiv) {
  const pts = motivKart({ motiv, winkel: grad(0) }).map((q) => ({ c: q.c, art: q.art }));
  /** @param {(c: Vec2) => number[]} f */
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
  /** @type {Record<string, number>} */
  const ORDNUNG = { 1: 1, 2: 2, m: 2, '2mm': 4, 3: 3, '3m': 6, 4: 4, '4mm': 8, 6: 6, '6mm': 12 };
  for (const [k, d] of Object.entries(MOTIVE)) {
    if (k === 'atom') continue;
    assert.equal(ordnung(k), ORDNUNG[d.symmetrie], `${k} (${d.symmetrie})`);
  }
});

// Nachbarn je Atom im Abstand des kleinsten Atomabstands (Toleranz 1e-6) und der nächste Abstand
/** @param {string} id */
function nachbarn(id) {
  const s = st(id); const M = metrik(s);
  /** @type {Vec2[]} */
  const pos = [];
  for (const e of s.basis) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) pos.push(kart(M, [e.p[0] + i, e.p[1] + j]));
  /** @type {number[]} */
  const zahlen = []; let dmin = Infinity; let zweit = Infinity;
  for (const e of s.basis) {
    const c = kart(M, e.p);
    const d = pos.map((q) => Math.hypot(q[0] - c[0], q[1] - c[1])).filter((x) => x > 1e-9).sort((a, b) => a - b);
    dmin = Math.min(dmin, d[0]);
    zahlen.push(d.filter((x) => Math.abs(x - d[0]) < 1e-6).length);
    zweit = Math.min(zweit, /** @type {number} */ (d.find((x) => x > d[0] + 1e-6)));
  }
  return { zahlen, dmin, zweit };
}
test('Archimedische Parkettierungen: alle Kanten gleich lang, richtige Koordinationszahl', () => {
  for (const [id, z] of /** @type {[string, number][]} */ ([['a488', 3], ['a3464', 4], ['a33434', 5], ['a33336', 5]])) {
    const n = nachbarn(id);
    assert.ok(n.zahlen.every((x) => x === z), `${id}: ${n.zahlen}`);
    assert.ok(n.zweit > n.dmin * 1.05, `${id}: nächster Abstand deutlich grösser`);
  }
  // Graphen: 3 Nachbarn, Kagome: 4
  assert.ok(nachbarn('graphen').zahlen.every((x) => x === 3));
  assert.ok(nachbarn('kagome').zahlen.every((x) => x === 4));
});

test('Wyckoff-Lagen der Basis', () => {
  /** @param {string} id */
  const lagen = (id) => { const s = st(id); return basisLagen(s, strukturSymmetrie(s)).map((l) => `${l.zaehligkeit}${l.buchstabe} ${l.symbol}`); };
  assert.deepEqual(lagen('graphen'), ['2b 3m.', '2b 3m.']);
  assert.deepEqual(lagen('kagome'), ['3c 2mm', '3c 2mm', '3c 2mm']);
  assert.deepEqual(lagen('lieb'), ['1a 4mm', '2c 2mm.', '2c 2mm.']);
  assert.deepEqual(lagen('a33336'), Array(6).fill('6d 1'));
});

test('Ursprung nach ITA: bleibt, wenn erlaubt, sonst der nächste erlaubte Punkt', () => {
  /** @param {readonly number[]} u @param {readonly number[]} v */
  const nah = (u, v) => u.every((x, i) => Math.abs(x - v[i]) < 1e-9);
  // h-BN, p3m1: Sechseckmitte und beide Atome sind 3m; der gegebene Ursprung (Sechseckmitte) bleibt
  assert.ok(nah(symmetrie(st('hbn')).ursprung, [0, 0]));
  assert.ok(nah(symmetrie(st('mos2')).ursprung, [0, 0]));
  // Molekül aus zwei Atomen: p2mm, Ursprung in der Molekülmitte (Skript Abb. 3.7)
  /** @param {Vec2} p @returns {Basiseintrag} */
  const atom = (p) => ({ motiv: 'atom', farbe: 0, p, winkel: grad(0) });
  const r = symmetrie({ ba: 1.35, gamma: grad(90), basis: [atom([0, 0]), atom([0.3, 0])] });
  assert.equal(r.symbol, 'p2mm');
  assert.ok(nah(r.ursprung, [0.15, 0]), String(r.ursprung));
  // p2mg (Dreiecksbeispiel): der gegebene Ursprung liegt auf keinem 2-zähligen Drehpunkt
  assert.ok(nah(symmetrie(st('dreieck3')).ursprung, [0.25, 0.25]));
  /** @param {string} motiv @param {Vec2} p @param {number} [winkel] @returns {Basiseintrag} */
  const e = (motiv, p, winkel = 0) => ({ motiv, farbe: 0, p, winkel: grad(winkel) });
  /** @param {number} ba @param {number} gamma @param {Basiseintrag[]} basis */
  const u = (ba, gamma, basis) => symmetrie({ ba, gamma: grad(gamma), basis }).ursprung;
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
  const r2 = symmetrie({ ba: 1.35, gamma: grad(90), basis: [e('w2', [0.99992, 0])] });
  assert.equal(r2.symbol, 'p2');
  assert.ok(r2.ursprung[0] === 0 || Math.abs(r2.ursprung[0] - 0.99992) < 1e-9, String(r2.ursprung));
});

test('Ursprung nach ITA: nächster Ursprung auch in stark gescherter gegebener Zelle (Review PR #12)', () => {
  // a = (1, 0), b = (5,31; 0,1): nächstes Gitterbild von (0,4; 0,49) liegt bei Versatz (−3, 0)
  const r = /** @type {Bestimmung} */ (bestimme({ a: /** @type {Kartesisch<Vec2>} */ ([1, 0]), b: /** @type {Kartesisch<Vec2>} */ ([5.31, 0.1]), punkte: [{ p: [0.4, 0.49], art: 'x' }] }));
  assert.equal(r.symbol, 'p2');
  assert.ok(Math.abs(r.ursprung[0] - 0.4) < 1e-9 && Math.abs(r.ursprung[1] - 0.49) < 1e-9, String(r.ursprung));
});

test('konventionelle Zelle: Umrechnung hin und zurück; zentrierte Eingabe in primitiver Zelle', () => {
  const r = symmetrie(st('dreieck3'));
  for (const p of /** @type {Vec2[]} */ ([[0.1, 0.2], [0.7, 0.4]])) {
    const x = inKonventionell(r, p); const q = ausKonventionell(r, x);
    assert.ok([0, 1].every((i) => Math.abs(((q[i] - p[i]) % 1 + 1.5) % 1 - 0.5) < 1e-9));
  }
  // rechteckig zentriertes Gitter (A, B), gegeben in der primitiven Zelle (A, (A + B)/2): c2mm mit doppelter Zelle
  const M = metrik({ ba: 1.35, gamma: grad(90) });
  const b = [(M.a[0] + M.b[0]) / 2, (M.a[1] + M.b[1]) / 2];
  const L = Math.hypot(...b) / Math.hypot(...M.a); // b/a der primitiven Zelle
  const cos = (M.a[0] * b[0] + M.a[1] * b[1]) / (Math.hypot(...M.a) * Math.hypot(...b));
  const gamma = (Math.acos(cos) * 180) / Math.PI;
  const r2 = symmetrie({ ba: L, gamma: grad(gamma), basis: [{ motiv: 'atom', farbe: 0, p: [0, 0], winkel: grad(0) }] });
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
  assert.match(strukturHTML(st('dreieck2'), symmetrie(st('dreieck2')), 'pm', FARBEN), /Geändert/);
  assert.match(strukturHTML({ ...st('dreieck1'), basis: [] }, null, null, FARBEN), /Basis ist leer/);
});

test('Link-Adresse: Vorgabe kurz, veränderte Struktur ausgeschrieben, hin und zurück', () => {
  const z = startzustand();
  z.modus = 'struktur';
  z.struktur = strukturStart('kagome');
  assert.equal(hashVon(z), '#m=struktur&v=kagome');
  z.struktur.basis[1].p = [0.25, 0.5];
  z.struktur.basis.push({ motiv: 'w3', farbe: 2, p: [0.3, 0.123456789], winkel: grad(15), groesse: 0.2 });
  z.struktur.gamma = grad(110);
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
  // Herkunft bleibt erhalten: „Zurücksetzen“ (strukturStart(vorgabe)) führt zur Vorgabe, nicht zum Start
  assert.match(h, /^#m=struktur&v=kagome&ba=/);
  assert.equal(z2.struktur.vorgabe, 'kagome');
  assert.equal(wieVorgabe(strukturStart(z2.struktur.vorgabe)), true);
  assert.deepEqual(strukturStart(z2.struktur.vorgabe).basis, strukturStart('kagome').basis);
  // ohne v: die Vorgabe des Starts
  const alt = startzustand();
  hashAnwenden(alt, h.replace('v=kagome&', ''));
  assert.equal(alt.struktur.vorgabe, 'dreieck1');
  assert.equal(alt.struktur.basis.length, 4);
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
  const b = liesBasis('atom,0,0,0,0;gibtsnicht,0,0,0,0;atom,7,0,0,0;atom,1,x,0,0;fahne,3,1/3,2/3,-45,1.5;fahne,3,1/3,2/3,-45,0.1');
  assert.equal(b.length, 3);
  assert.equal(b[1].groesse, 1, 'Grösse ausserhalb des Bereichs: nächster gültiger Wert (Leitfaden 5.2)');
  assert.equal(b[2].groesse, 0.1);
  assert.equal(basisText([{ motiv: 'atom', farbe: 0, p: [1 / 3, 2 / 3], winkel: grad(0), groesse: 0.045 }]), 'atom,0,1/3,2/3,0');
});

test('Spiegelbild: genau die chiralen Motive ändern sich, wenn man sie an der eigenen y-Achse spiegelt', () => {
  for (const [k, d] of Object.entries(MOTIVE)) {
    // unabhängig vom Code: x → −x bildet die Punkte (mit Art) auf sich ab?
    const symmetrisch = d.punkte.every(([x, y, a]) => d.punkte.some(([u, v, b]) => a === b && Math.abs(u + x) < 1e-12 && Math.abs(v - y) < 1e-12));
    assert.equal(chiral(k), !symmetrisch, k);
  }
  assert.deepEqual(Object.keys(MOTIVE).filter(chiral), ['fahne', 'blatt', 'tropfen', 'ranke', 'w2', 'w3', 'w4', 'w6']);
  // gespiegelt vor der Drehung: die Fahne zeigt nach −x, gedreht um 90° (im Uhrzeigersinn, y nach unten) nach −y
  const spitze = (/** @type {Partial<Basiseintrag>} */ e) => motivKart({ motiv: 'fahne', groesse: 1, ...e }).find((q) => q.art === 'f2')?.c;
  const nah = (/** @type {Vec2 | undefined} */ c, /** @type {Vec2} */ z) => assert.ok(c && Math.hypot(c[0] - z[0], c[1] - z[1]) < 1e-12, `${c} ≠ ${z}`);
  nah(spitze({}), [0.85, -1.6]);
  nah(spitze({ spiegel: true }), [-0.85, -1.6]);
  nah(spitze({ spiegel: true, winkel: grad(90) }), [1.6, -0.85]);
});

test('Dreiecke: das gleichschenklige ist deutlich schmaler als das gleichseitige (in der Auswahl unterscheidbar)', () => {
  // Winkel an der Spitze aus den Punkten, unabhängig vom Code: gleichseitig 60°, gleichschenklig höchstens 40°
  /** @param {string} k */
  const spitzenwinkel = (k) => {
    const [[x0, y0], [x1, y1], [x2, y2]] = MOTIVE[k].punkte;
    const u = [x1 - x0, y1 - y0]; const v = [x2 - x0, y2 - y0];
    return (Math.acos((u[0] * v[0] + u[1] * v[1]) / Math.hypot(u[0], u[1]) / Math.hypot(v[0], v[1])) * 180) / Math.PI;
  };
  assert.ok(Math.abs(spitzenwinkel('dreieck3') - 60) < 1e-9);
  assert.ok(spitzenwinkel('dreieck') <= 40, `Spitze ${spitzenwinkel('dreieck').toFixed(1)}°`);
});

test('Spiegelbild: Fähnchen und sein Bild unter (−x, y) ergeben pm, ein Windrad und sein Bild unter (−x, y + ½) pg', () => {
  // pm (ITA): Spiegelung −x, y; a zeigt im Bild nach unten, b nach rechts, also kartesisch diag(1, −1) = Drehung 180° nach x → −x.
  // Bild eines Fähnchens mit Winkel w: gespiegelt, Winkel 180° − w (von Hand, nicht mit dem Code gerechnet).
  /** @type {(spiegel: boolean) => Struktur} */
  const s = (spiegel) => ({ ba: 1.35, gamma: grad(90), basis: [
    { motiv: 'fahne', farbe: 0, p: [0.2, 0.3], winkel: grad(30) },
    { motiv: 'fahne', farbe: 0, p: [0.8, 0.3], winkel: grad(150), ...(spiegel ? { spiegel: /** @type {true} */ (true) } : {}) },
  ] });
  assert.equal(symmetrie(s(true)).symbol, 'pm');
  assert.notEqual(symmetrie(s(false)).symbol, 'pm', 'ohne Spiegelung kein Spiegelbild');
  // pg (ITA): Gleitspiegelung −x, y + ½; dasselbe Bild wie oben, um ½ in b verschoben; mit einem Windrad 3 (Polygon)
  /** @type {Struktur} */
  const g = { ba: 1.35, gamma: grad(90), basis: [
    { motiv: 'w3', farbe: 0, p: [0.2, 0.3], winkel: grad(10) },
    { motiv: 'w3', farbe: 0, p: [0.8, 0.8], winkel: grad(170), spiegel: true },
  ] };
  assert.equal(symmetrie(g).symbol, 'pg');
});

test('Spiegelbild im Link: letztes Feld „m“, ohne „m“ nicht gespiegelt', () => {
  const b = liesBasis('fahne,0,1/4,0,30,m;fahne,1,1/4,1/2,30,0.2,m;fahne,2,0,0,30;dreieck,0,0,0,0,m;w3,0,0,0,0,0.2;atom,0,0,0,m');
  assert.deepEqual(b.map((e) => [e.motiv, e.spiegel ?? false, e.groesse ?? null]),
    [['fahne', true, null], ['fahne', true, 0.2], ['fahne', false, null], ['dreieck', false, null], ['w3', false, 0.2], ['atom', false, null]],
    'm am Ende: gespiegelt, bei achiralen Motiven ohne Wirkung; „m“ an der Stelle des Winkels ist kein Spiegelbild');
  assert.equal(basisText(b), 'fahne,0,1/4,0,30,m;fahne,1,1/4,1/2,30,0.2,m;fahne,2,0,0,30;dreieck,0,0,0,0;w3,0,0,0,0,0.2;atom,0,0,0,0');
  assert.equal(basisText([{ motiv: 'quadrat', farbe: 0, p: [0, 0], winkel: grad(0), spiegel: true }]), 'quadrat,0,0,0,0', 'achiral: kein m');
});

test('Spiegelbild im Speicher und gegenüber der Vorgabe', () => {
  const s = /** @type {StrukturZustand} */ (pruefeStruktur({ ba: 1, gamma: 90, basis: [
    { motiv: 'fahne', p: [0, 0], spiegel: true }, { motiv: 'fahne', p: [0, 0], spiegel: 'ja' }, { motiv: 'fahne', p: [0, 0], spiegel: false }, { motiv: 'atom', p: [0, 0], spiegel: true },
  ] }));
  assert.deepEqual(s.basis.map((e) => e.spiegel), [true, undefined, undefined, undefined], 'nur true und nur bei chiralen Motiven');
  assert.ok(!('spiegel' in s.basis[1]), 'kein Feld spiegel: false');
  const z = strukturStart('dreieck1');
  assert.equal(wieVorgabe(z), true);
  z.basis[0].spiegel = true;
  assert.equal(wieVorgabe(z), false, 'spiegel zählt beim Vergleich mit der Vorgabe');
});

test('Muster entwerfen im Link: Gruppe, Gitter, Vertreter, Anzeigen', () => {
  const z = startzustand();
  assert.equal(hashAnwenden(z, '#m=entwurf&g=p4mm&basis=fahne,0,1/10,1/5,0&el=0&ae=1'), true);
  assert.equal(z.modus, 'entwurf');
  assert.deepEqual([z.entwurf.gruppe, z.entwurf.basis.length, z.entwurf.elemente, z.entwurf.ae], ['p4mm', 1, false, true]);
  assert.equal(ausgeschrieben(z.entwurf).basis.length, 8, 'ausgeschrieben: allgemeine Lage in p4mm');
  assert.equal(strukturSymmetrie(ausgeschrieben(z.entwurf))?.symbol, 'p4mm');
  assert.equal(hashVon(z), '#m=entwurf&g=p4mm&basis=fahne,0,1/10,1/5,0&el=0&ae=1');
  // Startwerte stehen nicht im Link; der leere Entwurf auch nicht
  const leer = startzustand(); leer.modus = 'entwurf';
  assert.equal(hashVon(leer), '#m=entwurf&g=p4mm');
  // das Gitter steht im Link nur, wo das System es freigibt und es vom Startgitter abweicht
  const r = startzustand(); hashAnwenden(r, '#m=entwurf&g=cm&ba=1.6&gamma=90');
  assert.deepEqual([r.entwurf.ba, r.entwurf.gamma], [1.6, 90]);
  assert.equal(hashVon(r), '#m=entwurf&g=cm&ba=1.6');
  // die Struktur aus „Gitter und Basis“ bleibt beim Öffnen des Links erhalten (wie das Gezeichnete)
  const s = startzustand(); s.struktur = strukturStart('graphen');
  hashAnwenden(s, '#m=entwurf&g=p6');
  assert.equal(s.struktur.vorgabe, 'graphen');
});

test('Muster entwerfen im Link: ungültig → leerer Startentwurf (nicht umgedeutet)', () => {
  const leer = entwurfStart();
  for (const h of [
    '#m=entwurf', // ohne Gruppe
    '#m=entwurf&g=p7&ba=1&gamma=90&basis=fahne,0,1/10,1/5,0', // unbekanntes Symbol
    '#m=entwurf&g=%3Cb%3E&basis=fahne,0,1/10,1/5,0',
  ]) {
    const z = startzustand(); hashAnwenden(z, h);
    assert.deepEqual(z.entwurf, leer, h);
  }
  // Gitter, das nicht zum System passt: Startgitter des Systems, Vertreter bleiben
  for (const h of ['#m=entwurf&g=p4mm&ba=1.3&gamma=90&basis=fahne,0,1/10,1/5,0', '#m=entwurf&g=p4mm&ba=1&gamma=95&basis=fahne,0,1/10,1/5,0']) {
    const z = startzustand(); hashAnwenden(z, h);
    assert.deepEqual([z.entwurf.ba, z.entwurf.gamma, z.entwurf.basis.length], [1, 90, 1], h);
  }
});

test('Gitter passt in der Genauigkeit des Links, dann exakt (gitterZurGruppe)', () => {
  assert.deepEqual(gitterZurGruppe(1.0004, 90.004, 'p4mm'), { ba: 1, gamma: 90 });
  assert.equal(gitterZurGruppe(1.0006, 90, 'p4mm'), null);
  assert.equal(gitterZurGruppe(1, 90.006, 'p4mm'), null);
  assert.deepEqual(gitterZurGruppe(1.37, 89.996, 'cm'), { ba: 1.37, gamma: 90 });
  assert.deepEqual(gitterZurGruppe(0.9997, 119.996, 'p3m1'), { ba: 1, gamma: 120 });
  assert.equal(gitterZurGruppe(1, 60, 'p6'), null, 'hexagonal nur mit γ = 120°');
  assert.deepEqual(gitterZurGruppe(1.25, 105, 'p2'), { ba: 1.25, gamma: 105 }, 'schiefwinklig: jedes Gitter');
});

test('Muster entwerfen: Grenze nach allgemeiner Zähligkeit, im Link und im Speicher', () => {
  const sechs = Array.from({ length: 6 }, (_, k) => `atom,0,${k + 1}/20,1/7,0`).join(';');
  const z = startzustand(); hashAnwenden(z, `#m=entwurf&g=p6mm&basis=${sechs}`);
  assert.equal(z.entwurf.basis.length, 4, 'p6mm: 4 · 12 = 48');
  assert.equal(z.entwurf.basis[3].p[0], 4 / 20, 'überzählige am Ende fallen weg');
  const s = /** @type {EntwurfZustand} */ (pruefeEntwurf({ gruppe: 'c2mm', ba: 1.35, gamma: 90, basis: Array.from({ length: 9 }, (_, k) => ({ motiv: 'atom', p: [k / 20, 0.1] })) }));
  assert.equal(s.basis.length, 6, 'c2mm: 6 · 8 = 48');
  assert.equal(bahnGewicht('p6mm'), 12); assert.equal(bahnGewicht('p1'), 1);
});

test('Muster entwerfen im Speicher: Gruppe, Gitter, Vertreter prüfen', () => {
  const basis = [{ motiv: 'fahne', p: [0.1, 0.2], spiegel: true }];
  const ok = /** @type {EntwurfZustand} */ (pruefeEntwurf({ gruppe: 'p6', ba: 1.0002, gamma: 120.001, basis }));
  assert.deepEqual([ok.gruppe, ok.ba, ok.gamma, ok.basis.length, ok.elemente, ok.ae], ['p6', 1, 120, 1, true, false]);
  for (const en of [null, 'x', {}, { gruppe: 'p7', basis }, { gruppe: 5, basis }, { gruppe: 'p6' }, { gruppe: 'p6', basis: 'x' }]) assert.equal(pruefeEntwurf(en), null, JSON.stringify(en));
  // Gitter passt nicht zum System: Startgitter, Anzeigen und Vertreter bleiben
  for (const [sg, ba, gamma] of /** @type {[string, number, number][]} */ ([['p6', 1.2, 120], ['p6', 1, 90], ['p4mm', 1.2, 90]])) {
    const e = /** @type {EntwurfZustand} */ (pruefeEntwurf({ gruppe: sg, ba, gamma, basis, ae: true }));
    assert.deepEqual([e.ba, e.gamma, e.basis.length, e.ae], [entwurfStart(sg).ba, entwurfStart(sg).gamma, 1, true], `${sg} ${ba} ${gamma}`);
  }
  // Anzeigen: nur false schaltet die Elemente aus, nur true die asymmetrische Einheit ein
  const a = /** @type {EntwurfZustand} */ (pruefeEntwurf({ gruppe: 'p2', basis: [], elemente: 0, ae: 'ja' }));
  assert.deepEqual([a.elemente, a.ae], [true, false]);
});

test('Struktur aus dem Speicher prüfen', () => {
  assert.equal(pruefeStruktur(null), null);
  assert.deepEqual([pruefeStruktur({ ba: 'x', basis: [] })?.ba, pruefeStruktur({ ba: 'x', basis: [] })?.gamma], [1, 90], 'keine Zahl oder fehlend: 1 bzw. 90° wie im Link');
  assert.equal(pruefeStruktur({ ba: 5, gamma: 90, basis: [] })?.ba, 2, 'ausserhalb: nächster gültiger Wert');
  const s = /** @type {StrukturZustand} */ (pruefeStruktur({ vorgabe: 'x', ba: 1, gamma: 90, basis: [{ motiv: 'atom', p: [0.1, 0.2] }, { motiv: 'atom', p: [NaN, 0] }, { motiv: 'böse', p: [0, 0] }], ae: 'ja' }));
  assert.equal(s.basis.length, 1);
  assert.equal(s.vorgabe, 'dreieck1');
  assert.deepEqual([s.elemente, s.zelle, s.ae, s.bindungen], [true, true, false, true]);
});

test('Bindungen: nächste Nachbarn je Zelle, auch bei kleiner Vergrösserung schnell', () => {
  // je Zelle: Quadrat 4/2, Hexagonal 6/2, Graphen 2 · 3/2, Kagome 3 · 4/2 Bindungen
  for (const [id, n] of /** @type {[string, number][]} */ ([['quadratisch', 2], ['hexagonal', 3], ['graphen', 3], ['kagome', 6]])) {
    const s = st(id);
    assert.equal(bindungenBasis(s, metrik(s)).length, n, id);
  }
  // spitzwinkliges, gestauchtes Gitter bei Vergrösserung 0,5: früher ein Paarvergleich aller Atome im Bild
  const s = { ...st('a33336'), ba: 0.5, gamma: grad(150), bindungen: true };
  const t = performance.now();
  const { svg } = strukturTafelB(s, FARBEN, strukturSymmetrie(s), 0.5);
  assert.ok(performance.now() - t < 2000);
  assert.match(svg, /<path d="M[^"]+L/);
});

test('Insel: abgerundetes Stäbchen mit Enden bei ±1 und Seiten bei ±0,32 (in Einheiten der Grösse)', () => {
  const M = metrik({ ba: 1, gamma: grad(90) });
  const s = 100;
  /** @type {import('../js/zeichnung.js').Ansicht} */
  const A = { s, groesse: 520, zuBild: (p) => { const c = kart(M, p); return [s * c[0], s * c[1]]; }, vonBild: (q) => q };
  const g = MOTIVE.insel.groesse;
  for (const [winkel, ex, ey] of /** @type {[number, number, number][]} */ ([[0, 1, 0.32], [90, 0.32, 1]])) {
    const svg = motivSVG({ motiv: 'insel', p: [0, 0], winkel: grad(winkel) }, [0, 0], A, M, '#000', '#fff');
    const pts = /** @type {RegExpMatchArray} */ (svg.match(/points="([^"]+)"/))[1].split(' ').map((t) => t.split(',').map(Number));
    assert.equal(new Set(pts.map((q) => q.join())).size, pts.length, 'keine doppelten Punkte');
    assert.equal(pts.length, 30);
    /** @param {number} i */
    const max = (i) => Math.max(...pts.map((q) => Math.abs(q[i]))) / (s * g);
    assert.ok(Math.abs(max(0) - ex) < 0.01 && Math.abs(max(1) - ey) < 0.01, `Ausdehnung bei ${winkel}°: ${max(0)}, ${max(1)}`);
  }
});

// „Darstellung“ und Lupe in „Gitter und Basis“ (Konzept „Muster entwerfen“, Schritt 3)

/** Anzahl der Teile eines SVG-Textes. @param {string} svg @param {RegExp} re */
const anzahl = (svg, re) => (svg.match(re) ?? []).length;

test('Füllen: Tafel A und B zeigen die asymmetrische Einheit der bestimmten Gruppe mit allen Bildern', () => {
  for (const v of VORGABEN) {
    const s = st(v.id);
    const r = symmetrie(s);
    const an = { elemente: false, zelle: true, ae: false, bindungen: false };
    const ohne = strukturTafelA(s, an, FARBEN);
    const mit = strukturTafelA(s, { ...an, fuell: true }, FARBEN);
    assert.ok(!mit.svg.includes('NaN'), v.id);
    // ein Urbild (kräftig) im Bild; zusammen mindestens so viele Bilder, wie die Gruppe Operationen je Zelle hat
    assert.equal(anzahl(mit.svg, /fill-opacity="0\.45"/g) - anzahl(ohne.svg, /fill-opacity="0\.45"/g), 1, `${v.id}: ein Urbild`);
    assert.ok(anzahl(mit.svg, /fill-opacity="0\.16"/g) >= r.ordnung - 1, `${v.id}: ${r.ordnung} Bilder je konventioneller Zelle`);
    const b = strukturTafelB(s, FARBEN, r, 1, { fuell: true });
    assert.ok(!b.svg.includes('NaN'), v.id);
    assert.ok(anzahl(b.svg, /fill-opacity="0\.16"/g) >= r.ordnung - 1, `${v.id}: Tafel B`);
  }
});

test('Füllen: gleiche Händigkeit und Spiegelbild in zwei Farben, in der Tapete in einer', () => {
  const s = st('graphen'); // p6mm: mit Spiegelbildern
  const r = symmetrie(s);
  const farbig = strukturTafelB(s, FARBEN, r, 1, { fuell: true }).svg;
  assert.ok(farbig.includes(`fill="${FARBEN.upper}" fill-opacity="0.16"`) && farbig.includes(`fill="${FARBEN.accent2}" fill-opacity="0.16"`));
  const tapete = strukturTafelB(s, FARBEN, r, 1, { fuell: true, einfarbig: true }).svg;
  assert.ok(tapete.includes(`fill="${FARBEN.upper}" fill-opacity="0.16"`));
  assert.ok(!tapete.includes(`fill="${FARBEN.accent2}" fill-opacity="0.16"`), 'ohne eigene Farbe für Spiegelbilder');
});

test('Füllen: die Bilder liegen in der konventionellen Zelle, auch wenn sie von der gegebenen abweicht', () => {
  // zentrierte Zelle: die konventionelle Zelle hat doppelte Fläche; das Urbild liegt in deren Ursprungszelle
  const s = st('zentriert');
  const r = symmetrie(s);
  assert.notEqual(r.primitiv, 1);
  const mit = strukturTafelA(s, { elemente: false, zelle: true, ae: false, bindungen: false, fuell: true }, FARBEN);
  assert.ok(anzahl(mit.svg, /fill-opacity="0\.16"/g) >= r.ordnung - 1);
});

test('Lupe: LUPE-fache Vergrösserung um das Motiv, die Mitte bleibt in der Bildmitte', () => {
  const s = st('graphen');
  const an = { elemente: true, zelle: true, ae: true, bindungen: true };
  const normal = strukturTafelA(s, an, FARBEN);
  const mitte = /** @type {Vec2} */ ([0.5, 0.5]);
  const lupe = strukturTafelA(s, { ...an, lupe: mitte }, FARBEN);
  assert.ok(Math.abs(lupe.ansicht.s / normal.ansicht.s - LUPE) < 1e-9, 'Massstab LUPE-mal grösser');
  const q = lupe.ansicht.zuBild(mitte);
  assert.ok(Math.abs(q[0] - 260) < 1 && Math.abs(q[1] - 260) < 1, `Mitte bei ${q}`);
  // ein eingefrorener Ausschnitt (beim Ziehen) gilt unverändert
  const fest = strukturTafelA(s, { ...an, lupe: [0.1, 0.1] }, FARBEN, null, lupe.ansicht);
  assert.equal(fest.ansicht, lupe.ansicht);
  assert.ok(!lupe.svg.includes('NaN'));
});

test('Lupe: auch am Rand und in einer nicht reduzierten Zelle bleibt der Ausschnitt im Bild', () => {
  for (const id of ['zentriert', 'schiefwinklig', 'quadratisch']) {
    const s = st(id);
    for (const mitte of /** @type {Vec2[]} */ ([[0, 0], [0.99, 0.01], [0.5, 0.5], [1, 1]])) {
      const l = strukturTafelA(s, { elemente: true, zelle: true, lupe: mitte }, FARBEN);
      const n = strukturTafelA(s, { elemente: true, zelle: true }, FARBEN);
      assert.ok(Math.abs(l.ansicht.s / n.ansicht.s - LUPE) < 1e-9, `${id} ${mitte}`);
      assert.ok(!l.svg.includes('NaN'));
    }
  }
});

test('Tafel B: Symmetrieelemente in den Farben der Blickrichtung nur auf Wunsch', () => {
  const s = st('quadratisch'); // p4mm
  const r = symmetrie(s);
  const bunt = strukturTafelB(s, FARBEN, r, 1, { elemente: true, richtungsfarben: true }).svg;
  const grau = strukturTafelB(s, FARBEN, r, 1, { elemente: true }).svg;
  assert.ok(FARBEN.dir.some((c) => bunt.includes(c)));
  assert.ok(!FARBEN.dir.some((c) => grau.includes(c)));
});

test('Link: „Darstellung“ und Lupe gelten in beiden Modi, mit denselben Schlüsseln', () => {
  const z = startzustand();
  hashAnwenden(z, '#m=struktur&v=graphen&farb=0&mel=1&tap=1&fuell=1&lupe=1&zoom=2');
  assert.deepEqual([z.farben, z.musterElemente, z.tapete, z.aeFuell, z.lupe, z.zoomB], [false, true, true, true, true, 2]);
  const h = hashVon(z);
  for (const k of ['farb=0', 'mel=1', 'tap=1', 'fuell=1', 'lupe=1', 'zoom=2']) assert.ok(h.includes(k), `${k} in ${h}`);
  // Schalter nur von „Ebenengruppen“ stehen nicht im Link des anderen Modus
  z.elemente = false; z.objekt = false; z.ae = true; z.orbit = true; z.einrasten = false;
  assert.ok(!/[&#](el|obj|ae|orbit|rast)=/.test(hashVon(z)), hashVon(z));
  // Startwerte bleiben aus dem Link
  const z0 = startzustand(); z0.modus = 'struktur';
  assert.equal(hashVon(z0), `#m=struktur&v=${z0.struktur.vorgabe}`);
  // derselbe Link kommt unverändert wieder heraus
  const z2 = startzustand(); hashAnwenden(z2, h);
  assert.equal(hashVon(z2), h);
});

test('Ornamente als Motive (#104): jedes allein hat keine eigene Symmetrie, auch gespiegelt und gedreht', () => {
  for (const k of ['blatt', 'tropfen', 'ranke']) {
    const d = MOTIVE[k];
    assert.equal(d.symmetrie, '1'); assert.ok(chiral(k));
    assert.equal(new Set(d.punkte.map((p) => p[2])).size, d.punkte.length, `${k}: jede Art einmal`);
    // mindestens drei Punkte, nicht alle auf einer Geraden (sonst wäre die Spiegelung an dieser Geraden eine Symmetrie)
    const [p0, p1] = d.punkte;
    assert.ok(d.punkte.slice(2).some((q) => Math.abs((p1[0] - p0[0]) * (q[1] - p0[1]) - (p1[1] - p0[1]) * (q[0] - p0[0])) > 1e-6), `${k}: nicht kollinear`);
    for (const e of /** @type {Basiseintrag[]} */ ([{ motiv: k, p: [0.3, 0.2] }, { motiv: k, p: [0.3, 0.2], winkel: grad(37), spiegel: true }, { motiv: k, p: [0.5, 0.5], winkel: grad(90) }])) {
      for (const gi of [{ ba: 1, gamma: grad(90) }, { ba: 1.4, gamma: grad(105) }]) {
        const r = symmetrie({ ...gi, basis: [e] });
        assert.equal(r.symbol, 'p1', `${k} ${JSON.stringify(e)}`);
      }
    }
  }
});

test('Ornamente als Motive: Zeichnung folgt Lage, Drehung, Spiegelung und Grösse', () => {
  const M = metrik({ ba: 1, gamma: grad(90) });
  const A = ansicht(M, [0, 0, 1, 1], 520, 0);
  /** @param {Partial<Basiseintrag>} e */
  const svg = (e) => motivSVG({ motiv: 'blatt', farbe: 0, p: [0.5, 0.5], ...e }, [0.5, 0.5], A, M, '#00a', '#fff');
  /** @param {string} s @returns {number[]} */
  const zahlen = (s) => [...s.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  const s0 = svg({});
  assert.ok(!/NaN|undefined/.test(s0)); assert.match(s0, /<path /);
  assert.notEqual(svg({ winkel: grad(90) }), s0);
  assert.notEqual(svg({ spiegel: true }), s0);
  // doppelte Grösse: doppelt so weit von der Mitte (Pfadpunkte relativ zum Mittelpunkt (260, 260) des Bildes)
  const ab = (/** @type {string} */ s) => Math.max(...zahlen(s.match(/ d="([^"]+)"/)?.[1] ?? '').map((v) => Math.abs(v - 260)));
  assert.ok(ab(svg({ groesse: 0.2 })) > 1.5 * ab(svg({ groesse: 0.1 })));
});

test('Motivauswahl: jedes Motiv in genau einer Zeile, die Zeile nennt seine Eigensymmetrie; Symbole zeichnen ohne Fehler', () => {
  const alle = MOTIVZEILEN.flatMap((z) => z.motive);
  assert.deepEqual([...alle].sort(), Object.keys(MOTIVE).sort(), 'jedes Motiv einmal');
  /** @type {Record<string, (s: string) => boolean>} */
  const REGEL = {
    Atom: (s) => s === '∞m',
    'Ohne Eigensymmetrie': (s) => s === '1',
    'Nur Drehsymmetrie': (s) => s !== '1' && !s.includes('m'),
    'Mit Spiegelsymmetrie': (s) => s.includes('m') && s !== '∞m',
  };
  assert.deepEqual(MOTIVZEILEN.map((z) => z.name), Object.keys(REGEL));
  for (const z of MOTIVZEILEN) for (const k of z.motive) assert.ok(REGEL[z.name](MOTIVE[k].symmetrie), `${k} (${MOTIVE[k].symmetrie}) in „${z.name}“`);
  for (const k of alle) {
    const s = motivSymbol(k, 'var(--mf)', 'var(--paper)');
    assert.match(s, /^<svg class="motivsym" /); assert.ok(!/NaN|undefined/.test(s), k);
    assert.ok(/fill="var\(--mf\)"|stroke="var\(--mf\)"/.test(s), `${k}: Farbe der Atomsorte`);
    // ganz im Feld: alle Punkte der Umrisse, Pfade (mit Kontrollpunkten) und Linien (beim Fähnchen lag die Fahne vorher oberhalb, nur die Stange war zu sehen)
    const zahlen = [...s.matchAll(/ (?:d|points|x1|y1|x2|y2|cx|cy)="([^"]*)"/g)].flatMap((m) => (m[1].match(/-?[\d.]+/g) ?? []).map(Number));
    assert.ok(zahlen.length >= 2, `${k}: Koordinaten gefunden`);
    for (const z of zahlen) assert.ok(z >= 0 && z <= 30, `${k}: ${z} im Feld 0 … 30`);
  }
  // das Fähnchen zeigt Stange und Fahne
  assert.match(motivSymbol('fahne', 'x', 'y'), /<line [^>]*\/><polygon /);
});

test('Ornamente als Motive: kennzeichnende Punkte liegen auf den Pfaden, und die Zeichnung beginnt dort, wo motivKart den ersten Punkt hat', () => {
  /** Abstand eines Punktes zu einem dicht abgetasteten Pfad (nur Bézier-Abschnitte M, L, Q, C) @param {string} ornament @param {Vec2} q */
  const abstand = (ornament, q) => {
    let best = Infinity;
    for (const [befehle] of ORNAMENTE[ornament]) {
      /** @type {Vec2} */ let cur = [0, 0];
      for (const [c, ...ps] of befehle) {
        if (c === 'Z') continue;
        const ctrl = c === 'M' || c === 'L' ? [cur, ps[0]] : [cur, ...ps];
        for (let i = 0; i <= 400; i++) {
          const t = i / 400; const n = ctrl.length - 1;
          // Bernstein-Polynome, Grad n (Linie, Q oder C)
          const bin = (/** @type {number} */ k) => (n === 1 ? 1 : n === 2 ? [1, 2, 1][k] : [1, 3, 3, 1][k]);
          const x = ctrl.reduce((s, p, k) => s + bin(k) * (1 - t) ** (n - k) * t ** k * p[0], 0);
          const y = ctrl.reduce((s, p, k) => s + bin(k) * (1 - t) ** (n - k) * t ** k * p[1], 0);
          best = Math.min(best, Math.hypot(x - q[0], y - q[1]));
        }
        cur = ps[ps.length - 1];
      }
    }
    return best;
  };
  for (const k of ['blatt', 'tropfen', 'ranke']) {
    const [mx, my] = ornamentMitte(k);
    for (const [u, v] of MOTIVE[k].punkte) {
      assert.ok(abstand(k, [u * ORNAMENT_EINHEIT + mx, v * ORNAMENT_EINHEIT + my]) < 0.05, `${k}: Punkt (${u.toFixed(2)}, ${v.toFixed(2)}) liegt nicht auf dem Pfad`);
    }
  }
  // Zeichnung und Punkte gleich orientiert: der Anfang des ersten Pfades ist der erste Punkt (alle drei Ornamente)
  for (const gi of [{ ba: 1, gamma: grad(90) }, { ba: 1.3, gamma: grad(110) }]) {
    const M = metrik(gi); const A = ansicht(M, [0, 0, 1, 1], 520, 0);
    for (const k of ['blatt', 'tropfen', 'ranke']) {
      for (const o of /** @type {Partial<Basiseintrag>[]} */ ([{}, { winkel: grad(37), spiegel: true }, { winkel: grad(200), groesse: 0.17 }])) {
        const e = { motiv: k, farbe: 0, p: /** @type {Vec2} */ ([0.5, 0.5]), ...o };
        const m = motivSVG(e, e.p, A, M, '#00a', '#fff').match(/ d="M([-\d.]+),([-\d.]+)/);
        const f = bruchVon(M, motivKart(e)[0].c); const soll = A.zuBild([e.p[0] + f[0], e.p[1] + f[1]]);
        assert.ok(m && Math.hypot(Number(m[1]) - soll[0], Number(m[2]) - soll[1]) < 0.05, `${k} ${JSON.stringify(o)}`);
      }
    }
  }
});

test('Ziegel mit Fuge: gleich breite Fugen, Vorgaben sehen aus wie vorher; ohne Fuge lückenlos', () => {
  // frühere Form: Punkte (±1, ±0,9/1,9) · 0,95 u (Grösse 0,95 u); jetzt Grösse u mit Fuge
  for (const id of ['reihen', 'laeufer', 'drittel', 'fisch', 'flecht']) {
    const v = /** @type {Vorgabe} */ (vorgabe(id));
    assert.ok(v, id);
    for (const e of v.basis) {
      assert.equal(e.fuge, true, `${id}: mit Fuge`);
      const u = /** @type {number} */ (e.groesse);
      const alt = [[1, 0.9 / 1.9], [-1, 0.9 / 1.9], [-1, -0.9 / 1.9], [1, -0.9 / 1.9]].map(([x, y]) => [0.95 * u * x, 0.95 * u * y]);
      const neu = motivKart({ ...e, winkel: grad(0) }).filter((q) => q.art === 'e').map((q) => q.c); // die Ecken
      assert.equal(neu.length, 4);
      neu.forEach((c, i) => { assert.ok(Math.hypot(c[0] - alt[i][0], c[1] - alt[i][1]) < 1e-12, `${id}: Punkt ${i}`); });
      // Fuge 0,1 u in beiden Richtungen: Länge 2u − 0,1 u, Breite u − 0,1 u
      assert.ok(Math.abs(Math.abs(neu[0][0] - neu[1][0]) - 1.9 * u) < 1e-12 && Math.abs(Math.abs(neu[0][1] - neu[3][1]) - 0.9 * u) < 1e-12, `${id}: Mass`);
    }
  }
  // ohne Fuge füllt der Ziegel (Grösse = halbe Länge) sein Raster von 2 : 1 lückenlos
  const k = motivKart({ motiv: 'ziegel', winkel: grad(0), groesse: 0.5 }).filter((q) => q.art === 'e').map((q) => q.c);
  assert.deepEqual([Math.abs(k[0][0] - k[1][0]), Math.abs(k[0][1] - k[3][1])], [1, 0.5]);
  // Läuferverband mit Grösse 0,5 ohne Fuge: weiterhin c2mm
  const laeufer = /** @type {Vorgabe} */ (vorgabe('laeufer'));
  const ohne = { ...laeufer, basis: laeufer.basis.map((e) => ({ motiv: e.motiv, farbe: e.farbe, p: e.p, winkel: e.winkel, groesse: 0.5 })) };
  assert.equal(/** @type {Bestimmung} */ (strukturSymmetrie({ ...laeufer.gitter, basis: ohne.basis })).symbol, 'c2mm');
  // Link: „f“ nach „m“, nur beim Ziegel; Rücklauf
  const text = basisText([{ motiv: 'ziegel', farbe: 0, p: [0.5, 0], winkel: grad(0), groesse: 0.5, fuge: true }, { motiv: 'fahne', farbe: 0, p: [0, 0], winkel: grad(0), spiegel: true, fuge: true }]);
  assert.equal(text, 'ziegel,0,1/2,0,0,0.5,f;fahne,0,0,0,0,m');
  assert.deepEqual(liesBasis(text).map((e) => [e.motiv, Boolean(e.fuge), Boolean(e.spiegel)]), [['ziegel', true, false], ['fahne', false, true]]);
  assert.equal(liesBasis('atom,0,0,0,0,f')[0].fuge, undefined, 'nur der Ziegel hat eine Fuge');
});
