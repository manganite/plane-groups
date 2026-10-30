// Die 17 Ebenengruppen: Daten nach ITA Vol. A (2006), Part 6, gegen die Rechnung in js/symmetrie.js.
// Jede Angabe in js/ebenengruppen.js, die sich berechnen lässt, wird hier nachgerechnet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EBENENGRUPPEN } from '../js/ebenengruppen.js';
import {
  gruppe, erzeugende, abschluss, gleichModGitter, punktgruppe, beschreibe, verknuepfen, translation,
  liesOp, opText, elemente, stabilisator, lagesymbol, lage, bahn, strukturfaktor, verletzt, mod1, art,
} from '../js/symmetrie.js';

// Reproduzierbarer Zufall (LCG), damit Fehlschläge nachvollziehbar sind
function zufall(seed = 12345) {
  let s = seed >>> 0;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 2 ** 32; };
}

const ALLE = EBENENGRUPPEN.map((d) => d.symbol);

test('17 Gruppen, Nummern 1–17, Symbole wie in ITA', () => {
  assert.deepEqual(EBENENGRUPPEN.map((d) => d.nr), Array.from({ length: 17 }, (_, i) => i + 1));
  assert.deepEqual(ALLE, ['p1', 'p2', 'pm', 'pg', 'cm', 'p2mm', 'p2mg', 'p2gg', 'c2mm', 'p4', 'p4mm', 'p4gm', 'p3', 'p3m1', 'p31m', 'p6', 'p6mm']);
  // Seiten in ITA: Nr. n auf S. 91 + n
  for (const d of EBENENGRUPPEN) assert.equal(d.seite, 91 + d.nr, d.symbol);
});

test('Kristallsysteme und Bravais-Gitter: 4 Systeme, 5 Gitter', () => {
  const zahl = (f) => Object.fromEntries([...new Set(EBENENGRUPPEN.map(f))].map((k) => [k, EBENENGRUPPEN.filter((d) => f(d) === k).length]));
  assert.deepEqual(zahl((d) => d.system), { schiefwinklig: 2, rechteckig: 7, quadratisch: 3, hexagonal: 5 });
  assert.deepEqual(zahl((d) => d.bravais), { mp: 2, op: 5, oc: 2, tp: 3, hp: 5 });
  for (const d of EBENENGRUPPEN) assert.equal(d.symbol[0] === 'c', d.bravais === 'oc', d.symbol);
});

test('Lesen und Schreiben der Koordinatenpaare ist umkehrbar', () => {
  for (const d of EBENENGRUPPEN) for (const s of d.ops) assert.equal(opText(liesOp(s)), s, `${d.symbol}: ${s}`);
});

for (const id of ALLE) {
  test(`${id}: Operationen bilden eine Gruppe (modulo Gitter), Ordnung wie Zähligkeit der allgemeinen Lage`, () => {
    const g = gruppe(id);
    const reps = g.alle;
    for (const a of reps) for (const b of reps) {
      const c = verknuepfen(a, b);
      assert.ok(reps.some((r) => gleichModGitter(r, c)), `${id}: abgeschlossen`);
    }
    // keine Doppelten
    reps.forEach((a, i) => reps.forEach((b, j) => { if (i < j) assert.ok(!gleichModGitter(a, b), `${id}: doppelt`); }));
    const allgemein = g.daten.wyckoff[0];
    assert.equal(allgemein.sym, '1');
    assert.equal(allgemein.n, g.ordnung, `${id}: Zähligkeit der allgemeinen Lage`);
    assert.equal(allgemein.koord.length * g.zentr.length, g.ordnung);
    // die Koordinaten der allgemeinen Lage sind genau die Operationen
    assert.deepEqual(allgemein.koord, g.daten.ops);
  });

  test(`${id}: die Erzeugenden nach ITA erzeugen die ganze Gruppe`, () => {
    const g = gruppe(id);
    const ops = abschluss(erzeugende(g));
    assert.equal(ops.length, g.ordnung);
    for (const op of g.alle) assert.ok(ops.some((o) => gleichModGitter(o, op)), id);
  });

  test(`${id}: Beschreibung der Operationen wie in ITA „Symmetry operations“`, () => {
    const g = gruppe(id);
    assert.deepEqual(g.ops.map(beschreibe), g.daten.opsText);
    if (g.daten.zentrText) {
      const z = translation(g.zentr[1]);
      assert.deepEqual(g.ops.map((op) => beschreibe(verknuepfen(z, op))), g.daten.zentrText);
    }
  });

  test(`${id}: Punktgruppe`, () => {
    assert.equal(punktgruppe(gruppe(id)).name, gruppe(id).daten.punktgruppe);
  });

  test(`${id}: Wyckoff-Lagen: Zähligkeit, Lagesymmetrie und Koordinaten wie in ITA`, () => {
    const g = gruppe(id);
    const rnd = zufall(g.daten.nr);
    const buchstaben = g.daten.wyckoff.map((w) => w.b);
    // Buchstaben von unten nach oben ohne Lücke: a, b, c, …
    assert.deepEqual([...buchstaben].reverse(), buchstaben.map((_, i) => String.fromCharCode(97 + i)));
    for (const w of g.daten.wyckoff) {
      assert.equal(w.koord.length * g.zentr.length, w.n, `${id} ${w.b}: Zahl der Koordinaten`);
      for (let versuch = 0; versuch < 5; versuch++) {
        const q = [0.05 + 0.4 * rnd(), 0.05 + 0.4 * rnd()]; // freie Parameter, nicht speziell
        const punkte = w.koord.map((k) => { const o = liesOp(k); return [o.R[0][0] * q[0] + o.R[0][1] * q[1] + o.t[0], o.R[1][0] * q[0] + o.R[1][1] * q[1] + o.t[1]]; });
        const p = punkte[0];
        const stab = stabilisator(g, p);
        assert.equal(g.ordnung / stab.length, w.n, `${id} ${w.b}: Zähligkeit`);
        assert.equal(lagesymbol(g, stab), w.sym, `${id} ${w.b}: Lagesymmetrie`);
        // Bahn = die in ITA aufgeführten Koordinaten mit Zentrierung, modulo 1
        const ita = [];
        for (const z of g.zentr) for (const r of punkte) ita.push([mod1(r[0] + z[0]), mod1(r[1] + z[1])]);
        const b = bahn(g, p);
        assert.equal(b.length, w.n, `${id} ${w.b}: Bahn`);
        for (const r of ita) assert.ok(b.some((s) => Math.abs(s[0] - r[0]) < 1e-9 && Math.abs(s[1] - r[1]) < 1e-9), `${id} ${w.b}: ${r} in Bahn`);
        // und die Rückrichtung: jeder Punkt der Bahn wird als diese Lage erkannt
        for (const s of b) assert.equal(lage(g, s).buchstabe, w.b, `${id} ${w.b}: ${s}`);
      }
    }
  });

  test(`${id}: jeder Punkt der Zelle gehört zu genau einer Wyckoff-Lage mit passender Symmetrie`, () => {
    // Raster mit Schritt 1/24 trifft alle speziellen Lagen (Nenner 2, 3, 4, 6, 8, 12)
    const g = gruppe(id);
    for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) {
      const p = [i / 24, j / 24];
      const l = lage(g, p);
      assert.equal(l.zaehligkeit, l.wyckoff.n, `${id} (${p}): Zähligkeit`);
      assert.equal(l.symbol, l.wyckoff.sym, `${id} (${p}): Lagesymmetrie`);
    }
  });

  test(`${id}: asymmetrische Einheit: Fläche und lückenlose Zerlegung der Zelle`, () => {
    const g = gruppe(id);
    const e = g.daten.ae.ecken;
    let flaeche = 0;
    for (let i = 0; i < e.length; i++) { const [a, b] = e[i]; const [c, d] = e[(i + 1) % e.length]; flaeche += a * d - b * c; }
    assert.ok(Math.abs(Math.abs(flaeche) / 2 - 1 / g.ordnung) < 1e-12, `${id}: Fläche ${Math.abs(flaeche) / 2}`);
    // Punkt im Polygon (konvex, Ecken der Reihe nach), mit Abstand zum Rand
    const innen = (p, rand) => {
      let vz = 0;
      for (let i = 0; i < e.length; i++) {
        const [a, b] = e[i]; const [c, d] = e[(i + 1) % e.length];
        const l = Math.hypot(c - a, d - b);
        const kreuz = ((c - a) * (p[1] - b) - (d - b) * (p[0] - a)) / l;
        if (Math.abs(kreuz) < rand) return null;
        const s = Math.sign(kreuz);
        if (vz === 0) vz = s; else if (s !== vz) return false;
      }
      return true;
    };
    const rnd = zufall(100 + g.daten.nr);
    let geprueft = 0;
    for (let n = 0; n < 400; n++) {
      const p = [rnd(), rnd()];
      const bilder = g.alle.map((op) => { const q = op.R.map((z, k) => z[0] * p[0] + z[1] * p[1] + op.t[k]); return q.map(mod1); });
      const lagen = bilder.map((q) => innen(q, 1e-6));
      if (lagen.includes(null)) continue;
      assert.equal(lagen.filter(Boolean).length, 1, `${id}: (${p}) genau ein Bild in der asymmetrischen Einheit`);
      geprueft++;
    }
    assert.ok(geprueft > 200, `${id}: genug Stichproben (${geprueft})`);
  });

  test(`${id}: Auslöschungen wie in ITA, allgemein und für jede Wyckoff-Lage`, () => {
    const g = gruppe(id);
    const rnd = zufall(200 + g.daten.nr);
    const allgemein = g.daten.bedingungen.allgemein;
    for (const w of g.daten.wyckoff) {
      const bed = w === g.daten.wyckoff[0] ? allgemein : [...allgemein, ...(g.daten.bedingungen[w.b] ?? [])];
      // drei Stichproben der freien Parameter; ausgelöscht heisst: in allen drei |F| = 0
      const bahnen = [0, 1, 2].map(() => {
        const q = [rnd(), rnd()];
        const o = liesOp(w.koord[0]);
        return bahn(g, [o.R[0][0] * q[0] + o.R[0][1] * q[1] + o.t[0], o.R[1][0] * q[0] + o.R[1][1] * q[1] + o.t[1]]);
      });
      for (let h = -6; h <= 6; h++) for (let k = -6; k <= 6; k++) {
        if (h === 0 && k === 0) continue;
        const null_ = bahnen.every((b) => Math.hypot(...strukturfaktor(b, h, k)) < 1e-9);
        assert.equal(null_, verletzt(bed, h, k), `${id} ${w.b}: Reflex ${h}${k}`);
      }
    }
  });
}

test('Lage: Punkte ausserhalb der Zelle und am Zellrand (Review PR #1)', () => {
  // ganzzahlig verschoben: dieselbe Lage wie in der Zelle
  const l = lage(gruppe('p2'), [3, 0]);
  assert.equal(l.buchstabe, 'a'); assert.equal(l.zaehligkeit, 1); assert.deepEqual(l.punkt, [0, 0]);
  assert.equal(lage(gruppe('p4mm'), [-0.5, 2.5]).buchstabe, 'b');
  // Bahn: Bilder knapp beiderseits des Zellrands sind derselbe Punkt
  assert.equal(bahn(gruppe('p2'), [1e-12, 0]).length, 1);
  assert.equal(bahn(gruppe('p2mm'), [1 - 1e-12, 0.3]).length, 2);
});

test('Lage: nahe einer speziellen Lage wird eingerastet, Angaben passen zusammen (Review PR #1)', () => {
  const p6 = lage(gruppe('p6'), [6e-7, 0]);
  assert.equal(p6.buchstabe, 'a'); assert.equal(p6.zaehligkeit, 1); assert.equal(p6.symbol, '6..');
  const pm = lage(gruppe('pm'), [3e-7, 0.25]);
  assert.equal(pm.buchstabe, 'a'); assert.equal(pm.zaehligkeit, 1); assert.equal(pm.symbol, '.m.');
  assert.deepEqual(pm.punkt, [0, 0.25]);
  // ausserhalb der Toleranz: allgemeine Lage
  assert.equal(lage(gruppe('pm'), [1e-3, 0.25]).buchstabe, 'c');
  // für jede spezielle Lage aller Gruppen: leicht verschobene Punkte rasten auf dieselbe Lage
  // ein, und Zähligkeit und Lagesymmetrie stimmen mit ITA überein
  const rnd = zufall(7);
  for (const id of ALLE) {
    const g = gruppe(id);
    for (const w of g.daten.wyckoff.slice(1)) {
      const q = [0.05 + 0.4 * rnd(), 0.05 + 0.4 * rnd()];
      const o = liesOp(w.koord[0]);
      const p = [o.R[0][0] * q[0] + o.R[0][1] * q[1] + o.t[0], o.R[1][0] * q[0] + o.R[1][1] * q[1] + o.t[1]];
      for (const d of [[3e-7, 0], [0, -3e-7], [2e-7, 2e-7]]) {
        const l2 = lage(g, [p[0] + d[0], p[1] + d[1]]);
        assert.equal(l2.buchstabe, w.b, `${id} ${w.b}`);
        assert.equal(l2.zaehligkeit, w.n, `${id} ${w.b}: Zähligkeit`);
        assert.equal(l2.symbol, w.sym, `${id} ${w.b}: Lagesymmetrie`);
        assert.equal(bahn(g, l2.punkt).length, w.n, `${id} ${w.b}: Bahn`);
      }
    }
  }
});

test('Symmetrieelemente: Zahl der Drehpunkte und Linien je Zelle (Rand eingeschlossen)', () => {
  // Abgezählt in den Diagrammen von ITA Part 6 (Elementarzelle mit Rand); Linien, die die Zelle
  // nur in einer Ecke berühren, zählen nicht
  const zahl = (id) => {
    const e = elemente(gruppe(id));
    const dreh = {};
    for (const d of e.drehpunkte) dreh[d.n] = (dreh[d.n] ?? 0) + 1;
    return { dreh, spiegel: e.linien.filter((l) => l.art === 'spiegel').length, gleit: e.linien.filter((l) => l.art === 'gleit').length };
  };
  assert.deepEqual(zahl('p1'), { dreh: {}, spiegel: 0, gleit: 0 });
  assert.deepEqual(zahl('p2'), { dreh: { 2: 9 }, spiegel: 0, gleit: 0 });
  assert.deepEqual(zahl('pm'), { dreh: {}, spiegel: 3, gleit: 0 });
  assert.deepEqual(zahl('pg'), { dreh: {}, spiegel: 0, gleit: 3 });
  assert.deepEqual(zahl('cm'), { dreh: {}, spiegel: 3, gleit: 2 });
  assert.deepEqual(zahl('p2mm'), { dreh: { 2: 9 }, spiegel: 6, gleit: 0 });
  assert.deepEqual(zahl('p2mg'), { dreh: { 2: 9 }, spiegel: 2, gleit: 3 });
  assert.deepEqual(zahl('p2gg'), { dreh: { 2: 9 }, spiegel: 0, gleit: 4 });
  assert.deepEqual(zahl('c2mm'), { dreh: { 2: 13 }, spiegel: 6, gleit: 4 });
  assert.deepEqual(zahl('p4'), { dreh: { 2: 4, 4: 5 }, spiegel: 0, gleit: 0 });
  assert.deepEqual(zahl('p4mm'), { dreh: { 2: 4, 4: 5 }, spiegel: 8, gleit: 4 });
  assert.deepEqual(zahl('p4gm'), { dreh: { 2: 4, 4: 5 }, spiegel: 4, gleit: 6 });
  assert.deepEqual(zahl('p3'), { dreh: { 3: 6 }, spiegel: 0, gleit: 0 });
  assert.deepEqual(zahl('p6'), { dreh: { 2: 5, 3: 2, 6: 4 }, spiegel: 0, gleit: 0 });
});

test('hexagonal: Spiegellinien wechseln mit parallelen Gleitspiegellinien ab (ITA Abschn. 4.3.5.5)', () => {
  for (const id of ['p3m1', 'p31m', 'p6mm']) {
    const { linien } = elemente(gruppe(id));
    const richtungen = [...new Set(linien.map((l) => l.richtung.join(',')))];
    assert.equal(richtungen.length, id === 'p6mm' ? 6 : 3, `${id}: Richtungen`);
    for (const r of richtungen) {
      const schar = linien.filter((l) => l.richtung.join(',') === r);
      const [d0, d1] = schar[0].richtung;
      const lage = (l) => -d1 * l.punkt[0] + d0 * l.punkt[1];
      schar.sort((u, v) => lage(u) - lage(v));
      for (let i = 1; i < schar.length; i++) assert.notEqual(schar[i].art, schar[i - 1].art, `${id} [${r}]: abwechselnd`);
      // gleicher Abstand zwischen Nachbarn
      for (let i = 2; i < schar.length; i++) {
        assert.ok(Math.abs(lage(schar[i]) - lage(schar[i - 1]) - (lage(schar[1]) - lage(schar[0]))) < 1e-9, `${id} [${r}]: Abstand`);
      }
    }
  }
});

test('Symmetrieelemente: Gleitspiegellinien, die das Symbol nicht nennt', () => {
  // c2mm: Gleitspiegellinien zwischen den Spiegellinien (ITA S. 100, „b 1/4,y“ und „a x,1/4“)
  const c2mm = elemente(gruppe('c2mm')).linien.filter((l) => l.art === 'gleit');
  const orte = c2mm.map((l) => (l.richtung[0] === 0 ? `x=${l.punkt[0]}` : `y=${l.punkt[1]}`)).sort();
  assert.deepEqual(orte, ['x=0.25', 'x=0.75', 'y=0.25', 'y=0.75']);
  // p4mm: diagonale Gleitspiegellinien mit Gleitkomponente (a + b)/2
  const p4mm = elemente(gruppe('p4mm')).linien.filter((l) => l.art === 'gleit');
  assert.ok(p4mm.length > 0);
  for (const l of p4mm) {
    assert.equal(Math.abs(l.richtung[0]), 1); assert.equal(Math.abs(l.richtung[1]), 1);
    assert.deepEqual(l.gleit.map(Math.abs), [0.5, 0.5]);
  }
});

test('p4mm: diagonale Spiegellinie verknüpft mit der Translation a ergibt die Gleitspiegellinie durch (1/2, 0)', () => {
  const m = liesOp('y,x');
  const op = verknuepfen(translation([1, 0]), m);
  assert.equal(beschreibe(op), 'g(1/2,1/2) x+1/2,x');
  const a = art(op);
  assert.deepEqual(a.gleit, [0.5, 0.5]);
});

test('c2mm: Spiegellinie verknüpft mit der Zentrierungstranslation ergibt die Gleitspiegellinie b bei x = 1/4', () => {
  const op = verknuepfen(translation([0.5, 0.5]), liesOp('-x,y'));
  assert.equal(beschreibe(op), 'b 1/4,y');
});

test('Dreiecksbeispiel: Lagen der Dreiecke in pm, cm und p2mg (Konzept §3.2)', () => {
  // Stufe 1, pm: Dreiecke bei (0, y) und (1/2, y) auf 1a und 1b, Lagesymmetrie .m.
  assert.deepEqual([lage(gruppe('pm'), [0, 0]).buchstabe, lage(gruppe('pm'), [0.5, 0.5]).buchstabe], ['a', 'b']);
  assert.equal(lage(gruppe('pm'), [0, 0]).symbol, '.m.');
  // Stufe 2, cm: beide Dreiecke bilden die Bahn von 2a
  const cm = bahn(gruppe('cm'), [0, 0]);
  assert.deepEqual(cm, [[0, 0], [0.5, 0.5]]);
  assert.equal(lage(gruppe('cm'), [0, 0]).buchstabe, 'a');
  // Stufe 3, p2mg: Ursprung auf dem Drehpunkt (1/4, 1/4) der Struktur; Dreiecke dann bei
  // (3/4, 3/4) und (1/4, 1/4) relativ zu diesem Ursprung: Lage 2c (1/4, y), Lagesymmetrie .m.
  const l = lage(gruppe('p2mg'), [0.25, 0.25]);
  assert.equal(l.buchstabe, 'c'); assert.equal(l.symbol, '.m.'); assert.equal(l.zaehligkeit, 2);
  const b = bahn(gruppe('p2mg'), [0.25, 0.25]).map((p) => p.join(',')).sort();
  assert.deepEqual(b, ['0.25,0.25', '0.75,0.75']);
});
