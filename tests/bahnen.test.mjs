// „Symmetrie festhalten“ (#121): Bahnen von Motiven, Vertreter und Umrechnung auf die konventionelle Zelle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import { gruppe, punktAufLage } from '../js/symmetrie.js';
import { metrik, kart, grad } from '../js/zeichnung.js';
import { GITTER_START, STRUKTUR_BEREICH } from '../js/zustand.js';
import { VORGABEN } from '../js/vorgaben.js';
import { MOTIVE, chiral } from '../js/motive.js';
import { strukturSymmetrie, istGegeben } from '../js/struktur.js';
import { orientierung, ausOrientierung, motivBahn, ausschreiben, vertreter, gleichesMotiv, umrechnen } from '../js/bahnen.js';

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
    // je Bahn ein Vertreter (Zahl der Bahnen von Hand: nächster Test)
    const g = gruppe(v.erwartet); const M = metrik(u);
    const vt = vertreter(g, M, u.basis);
    assert.ok(gleicheMengen(ausschreiben(g, M, vt), u.basis), `${v.id}: ausgeschrieben wie vorher`);
    assert.ok(vt.length <= u.basis.length, v.id);
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
  assert.ok(Math.abs(u.gamma - 90) < 1e-9 && Math.abs(u.ba - 1.35) < 1e-9 || Math.abs(u.ba - 1 / 1.35) < 1e-9, `${u.ba}, ${u.gamma}`);
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

test('Vertreter: Zahl der Bahnen bei bekannten Strukturen', () => {
  // Kagome in p6mm: drei Atome auf 3c, eine Bahn; h-BN in p3m1: zwei Bahnen (B und N verschieden); Graphen: 2b, eine Bahn
  for (const [id, n] of /** @type {[string, number][]} */ ([['kagome', 1], ['hbn', 2], ['graphen', 1], ['lieb', 2], ['dreieck2', 1], ['dreieck1', 2]])) {
    const v = /** @type {import('../js/vorgaben.js').Vorgabe} */ (VORGABEN.find((x) => x.id === id));
    assert.equal(vertreter(gruppe(v.erwartet), metrik(v.gitter), v.basis).length, n, id);
  }
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
