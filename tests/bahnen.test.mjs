// „Symmetrie festhalten“ (#121): Bahnen von Motiven, Vertreter und Umrechnung auf die konventionelle Zelle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, punktAufLage } from '../js/symmetrie.js';
import { metrik, kart, grad } from '../js/zeichnung.js';
import { GITTER_START, STRUKTUR_BEREICH } from '../js/zustand.js';
import { VORGABEN } from '../js/vorgaben.js';
import { MOTIVE, chiral } from '../js/motive.js';
import { strukturSymmetrie, istGegeben, festHinweisHTML } from '../js/struktur.js';
import { orientierung, ausOrientierung, motivBahn, ausschreiben, vertreter, gleichesMotiv, umrechnen, darstellbar, bilderMitOperation, bildUnter, vertreterVon, passtNichtZurLage, sichtbareOp, mitGruppe, uebernahmeVon } from '../js/bahnen.js';
import { basisText, liesBasis } from '../js/zustand.js';

/** @import { Mat2, Vec2 } from '../lib/common/js/typen.js' */

/** @import { Basiseintrag, Struktur } from '../js/motive.js' */
/** @import { Bestimmung } from '../js/bestimmung.js' */

/** Symmetrie einer Struktur (die Tests erwarten immer ein Ergebnis). @param {Struktur} s */
const symmetrie = (s) => /** @type {Bestimmung} */ (strukturSymmetrie(s));
/** Allgemeine Lage: die Wyckoff-Lage mit der grössten Zähligkeit. @param {import('../js/symmetrie.js').Gruppe} g */
const allgemein = (g) => g.daten.wyckoff.reduce((a, w) => (w.n > a.n ? w : a));
/** Gleiche Mengen von Motiven (jedes in der anderen Menge gefunden, gleich viele). @param {Basiseintrag[]} a @param {Basiseintrag[]} b */
const gleicheMengen = (a, b) => a.length === b.length && a.every((x) => b.some((y) => gleichesMotiv(x, y, 1e-6)));

test('Orientierung: Winkel und Spiegelung hin und zurück', () => {
  for (const w of [0, 17, 90, 135, 200, 359.5]) for (const spiegel of [false, true]) {
    const e = { winkel: grad(w), ...(spiegel ? { spiegel: /** @type {true} */ (true) } : {}) };
    const z = ausOrientierung(orientierung(e), 'fahne');
    assert.ok(Math.abs(z.winkel - w) < 1e-9, `${w}° ${spiegel}`);
    assert.equal(Boolean(z.spiegel), spiegel);
    // achirales Motiv: die Spiegelung entfällt, der Winkel bleibt
    assert.equal(ausOrientierung(orientierung(e), 'dreieck').spiegel, undefined);
  }
  // von Hand: Drehung um 90° (im Uhrzeigersinn, y nach unten) bildet (1, 0) auf (0, 1) ab
  assert.deepEqual(orientierung({ winkel: grad(90) }).map((z) => z.map((x) => Math.round(x))), [[0, -1], [1, 0]]);
});

test('Bahn eines Fähnchens in allgemeiner Lage: so viele Bilder wie die Zähligkeit nach ITA, und die Bestimmung ergibt die Gruppe', () => {
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol);
    const gitter = GITTER_START[d.system];
    const M = metrik(gitter);
    const w = allgemein(g);
    /** @type {Basiseintrag} */
    const e = { motiv: 'fahne', farbe: 0, p: punktAufLage(g, w.b, [0.137, 0.291]), winkel: grad(17) };
    const bahn = motivBahn(g, M, e);
    assert.equal(bahn.length, w.n, d.symbol);
    assert.deepEqual(bahn[0].p, e.p, `${d.symbol}: das erste Bild ist der Vertreter`);
    assert.equal(bahn.filter((b) => b.spiegel).length, ['p1', 'p2', 'p3', 'p4', 'p6'].includes(d.symbol) ? 0 : w.n / 2, `${d.symbol}: Hälfte gespiegelt, wenn die Gruppe Spiegelungen enthält`);
    const r = symmetrie({ ...gitter, basis: bahn });
    assert.equal(r.symbol, d.symbol);
    assert.ok(istGegeben(r), `${d.symbol}: die gegebene Zelle ist die konventionelle, Ursprung wie in ITA`);
  }
});

test('jede Wyckoff-Lage aller 17 Gruppen: ein Atom darauf hat so viele Bilder wie ihre Zähligkeit, die Gruppe bleibt', () => {
  let n = 0;
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol);
    const gitter = GITTER_START[d.system];
    const M = metrik(gitter);
    // ein Fähnchen in allgemeiner Lage hält die Gruppe fest, das Atom (Symmetrie ∞m) passt auf jede Lage
    const fahne = motivBahn(g, M, { motiv: 'fahne', farbe: 0, p: punktAufLage(g, allgemein(g).b, [0.137, 0.291]), winkel: grad(17) });
    for (const w of d.wyckoff) {
      const atom = motivBahn(g, M, { motiv: 'atom', farbe: 1, p: punktAufLage(g, w.b, [0.21, 0.37]), winkel: grad(0) });
      assert.equal(atom.length, w.n, `${d.symbol} ${w.b}`);
      assert.equal(symmetrie({ ...gitter, basis: [...fahne, ...atom] }).symbol, d.symbol, `${d.symbol} ${w.b}`);
      n++;
    }
  }
  assert.equal(n, 72, 'Wyckoff-Lagen aller 17 Ebenengruppen (ITA)');
});

test('zusammenfallende Bilder: nur eines bleibt; passt die eigene Symmetrie nicht zur Lage, ergibt sich eine niedrigere Gruppe', () => {
  const R = GITTER_START.rechteckig; const MR = metrik(R);
  const S = GITTER_START.schiefwinklig; const MS = metrik(S);
  // p2, Lage 1a (0, 0): Windrad 2 passt (Symmetrie 2), Fähnchen nicht
  const w2 = motivBahn(gruppe('p2'), MS, { motiv: 'w2', farbe: 0, p: [0, 0], winkel: grad(40) });
  assert.equal(w2.length, 1);
  assert.equal(symmetrie({ ...S, basis: w2 }).symbol, 'p2');
  const f = motivBahn(gruppe('p2'), MS, { motiv: 'fahne', farbe: 0, p: [0, 0], winkel: grad(40) });
  assert.equal(f.length, 1, 'nur das Bild der Identität');
  assert.deepEqual([f[0].winkel, f[0].spiegel], [40, undefined]);
  assert.equal(symmetrie({ ...S, basis: f }).symbol, 'p1');
  // pm, Lage 1a (0, y) auf der Spiegellinie: gleichschenkliges Dreieck passt nur, wenn seine Spiegellinie auf der Linie liegt.
  // Die Linie verläuft in Richtung b (waagrecht); die eigene Spiegellinie des Dreiecks ist seine y-Achse, nach 90° waagrecht.
  // (Bei 0° stünde sie senkrecht; ein einzelnes Dreieck ergäbe dann pm in anderer Aufstellung, deshalb 45°.)
  const quer = motivBahn(gruppe('pm'), MR, { motiv: 'dreieck', farbe: 0, p: [0, 0.3], winkel: grad(90) });
  const schief = motivBahn(gruppe('pm'), MR, { motiv: 'dreieck', farbe: 0, p: [0, 0.3], winkel: grad(45) });
  assert.deepEqual([quer.length, schief.length], [1, 1]);
  assert.equal(symmetrie({ ...R, basis: quer }).symbol, 'pm');
  assert.equal(symmetrie({ ...R, basis: schief }).symbol, 'p1');
});

test('Bilder eines gedrehten, gespiegelten Fähnchens in p4: Winkel um je 90° weiter, nie gespiegelt', () => {
  const Q = GITTER_START.quadratisch;
  const bahn = motivBahn(gruppe('p4'), metrik(Q), { motiv: 'fahne', farbe: 2, p: [0.1, 0.3], winkel: grad(10), spiegel: true, groesse: 0.2 });
  assert.deepEqual(bahn.map((b) => Number(b.winkel)).sort((a, b) => a - b), [10, 100, 190, 280]);
  assert.ok(bahn.every((b) => b.spiegel && b.farbe === 2 && b.groesse === 0.2), 'Drehungen erhalten Spiegelung, Farbe und Grösse');
});

/**
 * Zahl der Bahnen der umgerechneten Vorgaben, von Hand: Dreiecksbeispiel Stufe 3 (p2mg) ein Dreieck auf einer
 * Spiegellinie (2c), Fischgrät (p2gg) ein Ziegel in allgemeiner Lage (4c), um ein Drittel versetzt (p2) ein Ziegel
 * auf einem Drehpunkt in der kleineren Zelle, Flechtverband (p4gm) zwei Ziegel je konventioneller Zelle verschiedener
 * Richtung auf den Spiegellinien (4c), eine Bahn.
 * @type {Record<string, number>}
 */
const BAHNEN = { dreieck3: 1, fisch: 1, drittel: 1, flecht: 1 };

test('Vertreter: aus jeder Vorgabe, umgerechnet auf die konventionelle Zelle, je Bahn ein Motiv; ausgeschrieben dieselbe Struktur', () => {
  const geaendert = [];
  for (const v of VORGABEN) {
    const st = { ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis };
    const r = symmetrie(st);
    const u = umrechnen(st, r);
    if (!istGegeben(r)) geaendert.push(v.id);
    // die Metrik bleibt im Bereich der Regler, die Grösse der Motive auch
    assert.ok(u.ba >= STRUKTUR_BEREICH.ba[0] && u.ba <= STRUKTUR_BEREICH.ba[1] && u.gamma >= STRUKTUR_BEREICH.gamma[0] && u.gamma <= STRUKTUR_BEREICH.gamma[1], `${v.id}: ${u.ba}, ${u.gamma}`);
    assert.ok(u.basis.every((e) => /** @type {number} */ (e.groesse) >= STRUKTUR_BEREICH.groesse[0] && /** @type {number} */ (e.groesse) <= STRUKTUR_BEREICH.groesse[1]), v.id);
    // danach steht die Gruppe in der neuen Zelle in der Aufstellung nach ITA
    const r2 = symmetrie(u);
    assert.equal(r2.symbol, v.erwartet, v.id);
    assert.ok(istGegeben(r2), `${v.id}: Zelle ${JSON.stringify(r2.zelle)}, Ursprung ${r2.ursprung}`);
    // je Bahn ein Vertreter (Zahl der Bahnen von Hand: unten und im Test „Zahl der Bahnen“)
    const g = gruppe(v.erwartet); const M = metrik(u);
    const vt = vertreter(g, M, u.basis);
    assert.ok(gleicheMengen(ausschreiben(g, M, vt), u.basis), `${v.id}: ausgeschrieben wie vorher`);
    if (BAHNEN[v.id] !== undefined) assert.equal(vt.length, BAHNEN[v.id], `${v.id}: Bahnen`);
  }
  assert.deepEqual(geaendert.sort(), ['dreieck3', 'drittel', 'fisch', 'flecht'], 'Vorgaben mit anderer Zelle oder anderem Ursprung');
});

test('Umrechnen von der primitiven auf die zentrierte Zelle: die Vertreter ergänzen die Bilder unter der Zentrierung', () => {
  // rechteckiges Gitter b/a = 1,35 mit Atomen in (0, 0) und (½, ½) (c2mm), beschrieben in der primitiven Zelle
  // a_p = (a + b)/2, b_p = (b − a)/2: |a_p| = |b_p|, cos γ = (1,35² − 1)/(1,35² + 1); ein Atom je Zelle (von Hand)
  const gamma = grad((Math.acos((1.35 ** 2 - 1) / (1.35 ** 2 + 1)) * 180) / Math.PI);
  const st = { ba: 1, gamma, basis: [{ motiv: 'atom', farbe: 0, p: /** @type {import('../lib/common/js/typen.js').Vec2} */ ([0, 0]), winkel: grad(0) }] };
  const r = symmetrie(st);
  assert.equal(r.symbol, 'c2mm');
  assert.equal(istGegeben(r), false);
  const u = umrechnen(st, r);
  assert.ok(Math.abs(u.gamma - 90) < 1e-9 && (Math.abs(u.ba - 1.35) < 1e-9 || Math.abs(u.ba - 1 / 1.35) < 1e-9), `${u.ba}, ${u.gamma}`);
  const M = metrik(u);
  const voll = ausschreiben(gruppe('c2mm'), M, vertreter(gruppe('c2mm'), M, u.basis));
  assert.equal(voll.length, 2, 'zwei Atome in der zentrierten Zelle');
  const r2 = symmetrie({ ...u, basis: voll });
  assert.equal(r2.symbol, 'c2mm');
  assert.ok(istGegeben(r2));
});

test('Umrechnen aus anderen Zellen: Gruppe danach nach ITA in der neuen Zelle, Bild nur gedreht, nicht gespiegelt', () => {
  // Struktur jeder Gruppe (Fähnchen in allgemeiner Lage) in einer anderen Zelle P beschrieben; P darf eine Überzelle sein.
  // Die neue Darstellung dreht b′ auf die Waagrechte: Winkel der Motive minus Winkel von b′ (von Hand).
  /** @type {Mat2[]} */
  const zellen = [[[1, 0], [0, 1]], [[1, 1], [0, 1]], [[1, 0], [1, 1]], [[-1, 0], [0, -1]], [[1, -1], [0, 1]], [[0, 1], [-1, 0]], [[2, 0], [0, 1]], [[1, 0], [0, 2]]];
  let links = 0; let n = 0;
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol); const gi = GITTER_START[d.system]; const M = metrik(gi);
    const bahn = motivBahn(g, M, { motiv: 'fahne', farbe: 0, p: punktAufLage(g, allgemein(g).b, [0.137, 0.291]), winkel: grad(17) });
    for (const P of zellen) {
      const A = kart(M, [P[0][0], P[1][0]]); const B = kart(M, [P[0][1], P[1][1]]);
      const la = Math.hypot(...A); const lb = Math.hypot(...B);
      const ba = lb / la; const gamma = (Math.acos((A[0] * B[0] + A[1] * B[1]) / (la * lb)) * 180) / Math.PI;
      if (ba < STRUKTUR_BEREICH.ba[0] || ba > STRUKTUR_BEREICH.ba[1] || gamma < STRUKTUR_BEREICH.gamma[0] || gamma > STRUKTUR_BEREICH.gamma[1]) continue;
      if (A[0] * B[1] - A[1] * B[0] >= 0) continue; // nur Zellen, die metrik() ohne Spiegelung darstellt
      const det = P[0][0] * P[1][1] - P[0][1] * P[1][0];
      /** @param {Vec2} q @returns {Vec2} */
      const neu = (q) => [(P[1][1] * q[0] - P[0][1] * q[1]) / det, (-P[1][0] * q[0] + P[0][0] * q[1]) / det];
      const phi = (Math.atan2(B[1], B[0]) * 180) / Math.PI;
      /** @type {Basiseintrag[]} */
      const basis = [];
      for (const e of bahn) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        const x = neu([e.p[0] + i, e.p[1] + j]);
        if (x.every((v) => v >= -1e-9 && v < 1 - 1e-9)) basis.push({ ...e, p: x, winkel: grad((((Number(e.winkel) - phi) % 360) + 360) % 360) });
      }
      const st = { ba, gamma: grad(gamma), basis };
      const r = symmetrie(st);
      assert.equal(r.symbol, d.symbol, `${d.symbol} in ${JSON.stringify(P)}`);
      if (r.zelle[0][0] * r.zelle[1][1] - r.zelle[0][1] * r.zelle[1][0] < 0) links++;
      const u = umrechnen(st, r);
      const r2 = symmetrie(u);
      assert.equal(r2.symbol, d.symbol);
      assert.ok(istGegeben(r2), `${d.symbol} in ${JSON.stringify(P)}: danach Zelle ${JSON.stringify(r2.zelle)}, Ursprung ${r2.ursprung}`);
      // dasselbe Fähnchen (das erste) ist nach der Umrechnung so gespiegelt wie vorher
      assert.equal(Boolean(u.basis[0].spiegel), Boolean(basis[0].spiegel), `${d.symbol} in ${JSON.stringify(P)}: nicht gespiegelt`);
      n++;
    }
  }
  assert.ok(n >= 80, `${n} Fälle`);
  assert.ok(links > 0, 'darunter Fälle, in denen die Bestimmung eine linkshändige Zelle liefert');
});

test('Umrechnen: hexagonale Zelle a, a + b bei γ = 60° (Händigkeit hängt sonst an der Rundung)', () => {
  // p6, Fähnchen in allgemeiner Lage; dieselbe Struktur in der Zelle a, a + b (γ = 60°)
  const g = gruppe('p6'); const M = metrik(GITTER_START.hexagonal);
  const bahn = motivBahn(g, M, { motiv: 'fahne', farbe: 0, p: [0.137, 0.291], winkel: grad(17) });
  for (const gamma of [60, 60.00000000000001]) {
    // neue Lagen: x = x′ + y′·(0)… von Hand: a′ = a, b′ = a + b ⇒ x = x′ + y′, y = y′ ⇒ x′ = x − y, y′ = y
    const B = kart(M, [1, 1]); const phi = (Math.atan2(B[1], B[0]) * 180) / Math.PI;
    /** @type {Basiseintrag[]} */
    const basis = bahn.map((e) => ({ ...e, p: /** @type {Vec2} */ ([((e.p[0] - e.p[1]) % 1 + 1) % 1, e.p[1]]), winkel: grad((((Number(e.winkel) - phi) % 360) + 360) % 360) }));
    const st = { ba: 1, gamma: grad(gamma), basis };
    const r = symmetrie(st);
    assert.equal(r.symbol, 'p6');
    const u = umrechnen(st, r);
    assert.ok(u.basis.every((e) => !e.spiegel), `γ = ${gamma}: p6 hat keine Spiegelungen, das Bild darf nicht gespiegelt werden`);
    assert.ok(istGegeben(symmetrie(u)), `γ = ${gamma}`);
  }
});

test('Umrechnen: rechteckige Gruppen mit vertauschten Achsen (Bestimmung liefert oft eine linkshändige Zelle)', () => {
  // Struktur in der Standardaufstellung (b/a = 1/q > 1), dann mit vertauschten Achsen beschrieben: Lagen (x, y) → (y, x),
  // b/a = q < 1. Das ist das Spiegelbild an der Diagonalen (von Hand): Motive mit K = [[0, 1], [1, 0]] umorientiert,
  // Grösse mit q skaliert (die neue Länge |a| ist die alte |b|).
  /** @type {Mat2} */
  const K = [[0, 1], [1, 0]];
  /** @type {(A: Mat2, B: Mat2) => Mat2} */
  const mal = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  let links = 0;
  for (const s of ['pm', 'pg', 'cm', 'p2mm', 'p2mg', 'p2gg', 'c2mm']) {
    const g = gruppe(s);
    for (const q of [0.5, 0.62, 0.741, 0.9]) {
      const M0 = metrik({ ba: 1 / q, gamma: grad(90) });
      const standard = motivBahn(g, M0, { motiv: 'fahne', farbe: 0, groesse: 0.1, p: punktAufLage(g, allgemein(g).b, [0.137, 0.291]), winkel: grad(17) });
      const gi = { ba: q, gamma: grad(90) };
      /** @type {Basiseintrag[]} */
      const bahn = standard.map((e) => ({ motiv: e.motiv, farbe: e.farbe, p: /** @type {Vec2} */ ([e.p[1], e.p[0]]), groesse: 0.1 * q, ...ausOrientierung(mal(K, orientierung(e)), e.motiv) }));
      const r = symmetrie({ ...gi, basis: bahn });
      assert.equal(r.symbol, s);
      if (r.zelle[0][0] * r.zelle[1][1] - r.zelle[0][1] * r.zelle[1][0] < 0) links++;
      const u = umrechnen({ ...gi, basis: bahn }, r);
      // dasselbe erste Fähnchen ist danach so gespiegelt wie vorher
      assert.equal(Boolean(u.basis[0].spiegel), Boolean(bahn[0].spiegel), `${s} ${q}`);
      assert.ok(istGegeben(symmetrie(u)), `${s} ${q}`);
    }
  }
  assert.ok(links > 0, 'darunter linkshändige Zellen der Bestimmung');
});

test('Vertreter nach einem Link: auf 6 Stellen gerundete Koordinaten fallen zusammen', () => {
  // Koordinaten ohne kleinen Nenner; die Link-Adresse rundet (koordText), Bilder wie x − y weichen dann um ~1e-6 ab
  for (const s of ['p3', 'p6', 'p3m1', 'p31m', 'p6mm', 'p4gm']) {
    const g = gruppe(s); const gi = GITTER_START[g.daten.system]; const M = metrik(gi);
    const bahn = motivBahn(g, M, { motiv: 'fahne', farbe: 0, p: [0.1234567, 0.2987654], winkel: grad(17) });
    const gelesen = liesBasis(basisText(bahn));
    assert.equal(vertreter(g, M, gelesen).length, 1, s);
    assert.equal(ausschreiben(g, M, vertreter(g, M, gelesen)).length, bahn.length, s);
  }
});

test('Toleranzen: Bahn und Bestimmung gleich (ein Fähnchen 2e-6 neben dem Drehpunkt bleibt ein Bild)', () => {
  const S = GITTER_START.schiefwinklig;
  const f = motivBahn(gruppe('p2'), metrik(S), { motiv: 'fahne', farbe: 0, p: [2e-6, 0], winkel: grad(10) });
  assert.equal(f.length, 1);
  assert.equal(symmetrie({ ...S, basis: f }).symbol, 'p1');
});

test('Bahn: Gitter passt nicht zum System → Fehler statt falscher Orientierung', () => {
  assert.throws(() => motivBahn(gruppe('p4'), metrik(GITTER_START.rechteckig), { motiv: 'fahne', farbe: 0, p: [0.1, 0.2], winkel: grad(0) }), /passt nicht/);
});

test('darstellbar: Metrik und Grösse im Bereich der Regler', () => {
  const B = { ba: STRUKTUR_BEREICH.ba, gamma: STRUKTUR_BEREICH.gamma, groesse: STRUKTUR_BEREICH.groesse };
  /** @type {Basiseintrag} */
  const e = { motiv: 'ziegel', farbe: 0, p: [0, 0], winkel: grad(0) };
  assert.equal(darstellbar({ ba: 1, gamma: 90, basis: [e] }, B), true);
  assert.equal(darstellbar({ ba: 2.5, gamma: 90, basis: [e] }, B), false, 'b/a zu gross');
  assert.equal(darstellbar({ ba: 1, gamma: 40, basis: [e] }, B), false, 'γ zu klein');
  assert.equal(darstellbar({ ba: 1, gamma: 90, basis: [{ ...e, groesse: 1.2 }] }, B), false, 'Motiv zu gross');
  assert.equal(darstellbar({ ba: 1, gamma: 90, basis: [{ ...e, groesse: 0.01 }] }, B), false, 'Motiv zu klein');
  // umgerechnete Vorgaben sind alle darstellbar
  for (const v of VORGABEN) {
    const st = { ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis };
    assert.ok(darstellbar(umrechnen(st, symmetrie(st)), B), v.id);
  }
});

test('Vertreter: Zahl der Bahnen bei bekannten Strukturen', () => {
  // Kagome in p6mm: drei Atome auf 3c, eine Bahn; h-BN in p3m1: zwei Bahnen (B und N verschieden); Graphen: 2b, eine Bahn
  for (const [id, n] of /** @type {[string, number][]} */ ([['kagome', 1], ['hbn', 2], ['graphen', 1], ['lieb', 2], ['dreieck2', 1], ['dreieck1', 2]])) {
    const v = /** @type {import('../js/vorgaben.js').Vorgabe} */ (VORGABEN.find((x) => x.id === id));
    assert.equal(vertreter(gruppe(v.erwartet), metrik(v.gitter), v.basis).length, n, id);
  }
});

test('Vertreter: fast symmetrische Lagen (innerhalb der Toleranz der Bestimmung) fallen ganz zusammen', () => {
  // p2mm, Atom fast auf der Spiegellinie x = 0 und sein Bild; dazu ein zweites Atom 5e-5 neben dem Bild eines ersten
  const R = GITTER_START.rechteckig; const M = metrik(R); const g = gruppe('p2mm');
  /** @type {Basiseintrag[]} */
  const basis = [
    { motiv: 'atom', farbe: 0, p: [0.00004, 0.3], winkel: grad(0) },
    { motiv: 'atom', farbe: 0, p: [0.99996, 0.7], winkel: grad(0) },
    { motiv: 'fahne', farbe: 1, p: [0.2, 0.3], winkel: grad(10) },
    { motiv: 'fahne', farbe: 1, p: [0.80005, 0.3], winkel: grad(170), spiegel: true },
  ];
  const vt = vertreter(g, M, basis);
  assert.equal(vt.length, 2, 'ein Vertreter je Bahn');
  assert.ok(vt[0].p[0] === 0 && Math.abs(vt[0].p[1] - 0.3) < 1e-12, `auf die Spiegellinie eingerastet: ${vt[0].p}`);
  assert.equal(ausschreiben(g, M, vt).length, 2 + 4, 'Atom auf der Spiegellinie: 2 Bilder; Fähnchen allgemein: 4');
  assert.equal(symmetrie({ ...R, basis: ausschreiben(g, M, vt) }).symbol, 'p2mm');
});

test('Vertreter in einer kleineren Gruppe als der bestimmten: mehr Bahnen, dieselbe Struktur', () => {
  const v = /** @type {import('../js/vorgaben.js').Vorgabe} */ (VORGABEN.find((x) => x.id === 'kagome'));
  const M = metrik(v.gitter);
  for (const [s, n] of /** @type {[string, number][]} */ ([['p6mm', 1], ['p6', 1], ['p3', 1], ['p2', 3], ['p1', 3]])) {
    const vt = vertreter(gruppe(s), M, v.basis);
    assert.equal(vt.length, n, s);
    assert.ok(gleicheMengen(ausschreiben(gruppe(s), M, vt), v.basis), s);
  }
});

test('Motive: Spiegelung nur bei chiralen Motiven im Ergebnis', () => {
  const g = gruppe('p4mm'); const M = metrik(GITTER_START.quadratisch);
  for (const motiv of Object.keys(MOTIVE)) {
    const bahn = motivBahn(g, M, { motiv, farbe: 0, p: [0.13, 0.29], winkel: grad(5) });
    assert.equal(bahn.some((b) => b.spiegel), chiral(motiv), motiv);
  }
});

test('Bild und Vertreter: vertreterVon kehrt bildUnter um, für alle Operationen aller 17 Gruppen', () => {
  for (const d of EBENENGRUPPEN) {
    const g = gruppe(d.symbol); const M = metrik(GITTER_START[d.system]);
    for (const e of /** @type {Basiseintrag[]} */ ([
      { motiv: 'fahne', farbe: 1, p: [0.137, 0.291], winkel: grad(17) },
      { motiv: 'w3', farbe: 0, p: [0.4, 0.05], winkel: grad(200), spiegel: true, groesse: 0.2 },
    ])) {
      g.alle.forEach((op) => {
        const v = vertreterVon(op, M, bildUnter(op, M, e));
        assert.ok(gleichesMotiv(v, e, 1e-9) && Boolean(v.spiegel) === Boolean(e.spiegel), `${d.symbol}`);
      });
      // bilderMitOperation: jedes Bild ist das Bild unter seiner Operation
      for (const { bild, op } of bilderMitOperation(g, M, e)) assert.ok(gleichesMotiv(bild, bildUnter(g.alle[op], M, e), 1e-9), d.symbol);
    }
  }
});

test('passtNichtZurLage: eigene Symmetrie des Motivs gegen die Lagesymmetrie', () => {
  const S = metrik(GITTER_START.schiefwinklig); const R = metrik(GITTER_START.rechteckig); const Q = metrik(GITTER_START.quadratisch);
  /** @type {(motiv: string, p: Vec2, w: number) => Basiseintrag} */
  const e = (motiv, p, w) => ({ motiv, farbe: 0, p, winkel: grad(w) });
  assert.equal(passtNichtZurLage(gruppe('p2'), S, e('fahne', [0, 0], 10)), true, 'Fähnchen auf 2-zähligem Punkt');
  assert.equal(passtNichtZurLage(gruppe('p2'), S, e('w2', [0, 0], 10)), false, 'Windrad 2');
  assert.equal(passtNichtZurLage(gruppe('p2'), S, e('fahne', [0.2, 0.3], 10)), false, 'allgemeine Lage');
  assert.equal(passtNichtZurLage(gruppe('pm'), R, e('dreieck', [0, 0.3], 90)), false, 'Spiegellinie des Dreiecks auf der Linie (von Hand, siehe oben)');
  assert.equal(passtNichtZurLage(gruppe('pm'), R, e('dreieck', [0, 0.3], 45)), true, 'schräg');
  assert.equal(passtNichtZurLage(gruppe('p4mm'), Q, e('quadrat', [0, 0], 30)), true, 'Quadrat gedreht auf 4mm');
  assert.equal(passtNichtZurLage(gruppe('p4mm'), Q, e('quadrat', [0, 0], 0)), false, 'Quadrat in Achsenlage auf 4mm');
  assert.equal(passtNichtZurLage(gruppe('p4mm'), Q, e('w4', [0.5, 0.5], 0)), true, 'Windrad 4 auf 4mm: Spiegellinien fehlen');
});

test('sichtbareOp: auf einer speziellen Lage zeigt die Auswahl das gezeichnete Bild', () => {
  const g = gruppe('p4mm'); const M = metrik(GITTER_START.quadratisch);
  /** @type {Basiseintrag} */
  const allg = { motiv: 'fahne', farbe: 0, p: [0.13, 0.29], winkel: grad(30) };
  for (let op = 0; op < g.alle.length; op++) assert.equal(sichtbareOp(g, M, allg, op), op, 'allgemeine Lage: jedes Bild gezeichnet');
  // auf ½, ½ (Lage 1b, 4mm) fallen alle Bilder zusammen; gezeichnet ist nur das der Identität
  /** @type {Basiseintrag} */
  const speziell = { ...allg, p: [0.5, 0.5] };
  assert.equal(motivBahn(g, M, speziell).length, 1);
  for (let op = 0; op < g.alle.length; op++) assert.equal(sichtbareOp(g, M, speziell, op), 0);
});

test('mitGruppe: gezeichnete Motive unter einer anderen Gruppe auf Vertreter zurückgeführt, Gitter nach dem System', () => {
  const v = /** @type {import('../js/vorgaben.js').Vorgabe} */ (VORGABEN.find((x) => x.id === 'kagome'));
  const gez = { ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis };
  const p6 = mitGruppe(gez, 'p6', 48);
  assert.ok(p6 && p6.basis.length === 1 && p6.festeGruppe === 'p6' && p6.ba === 1 && p6.gamma === 120);
  assert.equal(mitGruppe(gez, 'p6mm', 11), null, 'eine Bahn × 12 > 11: Grenze');
  // rechteckig: b/a bleibt, γ = 90°
  const r = mitGruppe({ ba: 1.3, gamma: grad(100), basis: [{ motiv: 'atom', farbe: 0, p: [0.2, 0.3], winkel: grad(0) }] }, 'pm', 48);
  assert.deepEqual(r && [r.ba, r.gamma, r.basis.length], [1.3, 90, 1]);
});

test('uebernahmeVon: Umstellung der Zelle bzw. nur des Ursprungs, Gründe', () => {
  /** @param {string} id */
  const von = (id) => {
    const v = /** @type {import('../js/vorgaben.js').Vorgabe} */ (VORGABEN.find((x) => x.id === id));
    const gez = { ba: v.gitter.ba, gamma: v.gitter.gamma, basis: v.basis };
    return uebernahmeVon(gez, symmetrie(gez), STRUKTUR_BEREICH, 48);
  };
  const d = von('drittel'); const o = von('dreieck3'); const k = von('kagome');
  assert.ok('struktur' in d && d.umstellung.zelle !== null, 'drittel: andere Zelle');
  assert.ok('struktur' in o && o.umstellung.zelle === null && o.umstellung.ursprung !== null, 'dreieck3: nur der Ursprung');
  assert.deepEqual('struktur' in o && o.umstellung.ursprung, [0.25, 0.25]);
  assert.ok('struktur' in k && k.umstellung.zelle === null && k.umstellung.ursprung === null && k.struktur.festeGruppe === 'p6mm');
  assert.deepEqual(uebernahmeVon({ ba: 1, gamma: grad(90), basis: [] }, null, STRUKTUR_BEREICH, 48), { grund: 'Die Basis ist leer.' });
  const kv = /** @type {import('../js/vorgaben.js').Vorgabe} */ (VORGABEN.find((x) => x.id === 'kagome'));
  const kg = { ba: kv.gitter.ba, gamma: kv.gitter.gamma, basis: kv.basis };
  assert.ok('grund' in uebernahmeVon(kg, symmetrie(kg), STRUKTUR_BEREICH, 11), 'Grenze');
});

test('festHinweisHTML: Motiv passt nicht zur Lage, zufällige Zusatzsymmetrie, Umstellung', () => {
  const R = GITTER_START.rechteckig;
  // pm, Dreieck auf der Spiegellinie (0, y), um 45° gedreht: eigene Symmetrie m, aber falsch ausgerichtet
  const st = { ...R, festeGruppe: 'pm', basis: /** @type {Basiseintrag[]} */ ([{ motiv: 'dreieck', farbe: 0, p: [0, 0.3], winkel: grad(45) }]) };
  const r = symmetrie({ ...st, basis: ausschreiben(gruppe('pm'), metrik(R), st.basis) });
  const h = festHinweisHTML(st, r);
  assert.match(h, /passen nicht zu ihrer Lage/);
  assert.match(h, /Wyckoff-Lage 1<span class="wy">a<\/span>/);
  assert.match(h, /so ausgerichtet/);
  assert.doesNotMatch(h, /hat aber nur/);
  // p2mm mit b/a = 1: mehr Symmetrie als festgehalten (p4mm)
  const q = { ba: 1, gamma: grad(90), festeGruppe: 'p2mm', basis: /** @type {Basiseintrag[]} */ ([{ motiv: 'atom', farbe: 0, p: [0, 0], winkel: grad(0) }]) };
  const rq = symmetrie({ ...q, basis: ausschreiben(gruppe('p2mm'), metrik(q), q.basis) });
  assert.equal(rq.symbol, 'p4mm');
  assert.match(festHinweisHTML(q, rq), /mehr Symmetrie als festgehalten/);
  // Umstellung: Zelle → gedreht; nur Ursprung → verschoben
  assert.match(festHinweisHTML(q, rq, { zelle: [[1, 1], [-1, 1]], ursprung: null }), /gedreht/);
  const nurU = festHinweisHTML(q, rq, { zelle: null, ursprung: [0.25, 0.25] });
  assert.match(nurU, /nur verschoben/); assert.doesNotMatch(nurU, /gedreht/);
});

test('passtNichtZurLage: hexagonal, Dreieck auf der Lage 3m von p3m1', () => {
  const g = gruppe('p3m1'); const M = metrik(GITTER_START.hexagonal);
  /** @param {number} w */
  const passt = (w) => !passtNichtZurLage(g, M, { motiv: 'dreieck3', farbe: 0, p: [0, 0], winkel: grad(w) });
  // Die Spiegellinien der Lage 1a liegen 60° auseinander, das Dreieck hat 3m: genau eine von 0° und 30° passt (von Hand)
  assert.equal([passt(0), passt(30)].filter(Boolean).length, 1);
  assert.equal(passt(15), false);
  assert.equal(passt(0), passt(120), 'um 120° gedreht dasselbe');
});
