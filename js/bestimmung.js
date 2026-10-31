// Symmetrie einer 2D-Struktur bestimmen (Konzept §8): Gitter und Basis → Ebenengruppe in der
// Standardaufstellung der ITA, konventionelle Zelle und Ursprung.
//
// Eine Struktur ist { a, b, punkte }: Gittervektoren a, b kartesisch, Punkte { p: [x, y] in
// Bruchkoordinaten von a, b; art: beliebiger Schlüssel }. Punkte gleicher Art sind gleichwertig,
// Punkte sind isotrop. Ein Motiv mit eigener (geringerer) Symmetrie wird als mehrere Punkte
// verschiedener Art beschrieben.
//
// Verfahren:
// 1. Translationen: alle Vektoren, die die Struktur auf sich abbilden; daraus die kleinste
//    (primitive) Zelle als die zwei kürzesten unabhängigen Gittervektoren (in 2D eine Basis).
// 2. Punktsymmetrie: Kandidaten sind die Matrizen der Holoedrie des Gitters (ganzzahlig in der
//    reduzierten Basis, Einträge −1, 0, 1, metrikerhaltend); zu jeder die Translationen, mit
//    denen sie die Struktur auf sich abbildet.
// 3. Standardaufstellung: Für jede der 17 Ebenengruppen gleicher Ordnung und jede Wahl der
//    konventionellen Zelle (Achsen vertauscht oder umgekehrt, bei rechteckigen Gruppen entlang
//    der Spiegel- und Gleitspiegellinien, auch zentriert) wird ein Ursprung gesucht, mit dem die
//    Operationen genau die der ITA-Liste sind (modulo Gitter).

import { EBENENGRUPPEN } from './ebenengruppen.js';
import { gruppe, mod1 } from './symmetrie.js';

const TOL = 1e-4; // Lage in Bruchteilen der Zelle
const TOL_METRIK = 1e-6; // relativ

const mat = (a, b) => [[a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]], [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]]];
const vek = (m, v) => [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
const det = (m) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
const inv = (m) => { const d = det(m); return [[m[1][1] / d, -m[0][1] / d], [-m[1][0] / d, m[0][0] / d]]; };
const trans = (m) => [[m[0][0], m[1][0]], [m[0][1], m[1][1]]];
const spalten = (u, v) => [[u[0], v[0]], [u[1], v[1]]];
const ganz = (x, tol = TOL) => Math.abs(x - Math.round(x)) < tol;
const gleichMod1 = (u, v, tol = TOL) => ganz(u[0] - v[0], tol) && ganz(u[1] - v[1], tol);
const ggt = (x, y) => (y === 0 ? Math.abs(x) : ggt(y, x % y));
const r = (x) => Math.round(x);

/** Punkte nach Art gruppiert; die Art mit den wenigsten Punkten zuerst. */
function nachArt(punkte) {
  const m = new Map();
  for (const q of punkte) { if (!m.has(q.art)) m.set(q.art, []); m.get(q.art).push(q.p.map(mod1)); }
  return [...m.entries()].sort((u, v) => u[1].length - v[1].length);
}

/** Bildet {R, t} die Punkte (nach Art) auf sich ab (modulo Gitter)? */
function bildetAb(arten, R, t) {
  for (const [, ps] of arten) {
    for (const p of ps) {
      const q = vek(R, p); q[0] += t[0]; q[1] += t[1];
      if (!ps.some((s) => gleichMod1(q, s))) return false;
    }
  }
  return true;
}

/** Alle Operationen mit Matrix R, die die Struktur auf sich abbilden (t modulo 1). */
function translationenZu(arten, R) {
  const [, ref] = arten[0];
  const p0 = ref[0];
  const Rp = vek(R, p0);
  const out = [];
  for (const q of ref) {
    const t = [mod1(q[0] - Rp[0]), mod1(q[1] - Rp[1])];
    if (out.some((u) => gleichMod1(u, t))) continue;
    if (bildetAb(arten, R, t)) out.push(t);
  }
  return out;
}

/**
 * Kleinste Zelle: die zwei kürzesten unabhängigen Gittervektoren (kartesische Metrik G der
 * gegebenen Zelle). Rückgabe: Matrix P (Spalten in Bruchkoordinaten der gegebenen Zelle).
 */
function primitiveZelle(T, G) {
  const lang = (v) => Math.sqrt(vek(G, v)[0] * v[0] + vek(G, v)[1] * v[1]);
  const kand = [];
  for (const t of T) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const v = [t[0] + i, t[1] + j];
    if (Math.abs(v[0]) < TOL && Math.abs(v[1]) < TOL) continue;
    kand.push(v);
  }
  kand.sort((u, v) => lang(u) - lang(v));
  const v1 = kand[0];
  const flaeche = 1 / T.length;
  const v2 = kand.find((v) => Math.abs(Math.abs(det(spalten(v1, v))) - flaeche) < TOL);
  return spalten(v1, v2);
}

/** Lagrange-Reduktion einer Basis (Spalten in Bruchkoordinaten) bezüglich der Metrik G. */
function reduziere(P, G) {
  let u = [P[0][0], P[1][0]]; let v = [P[0][1], P[1][1]];
  const sk = (x, y) => { const Gy = vek(G, y); return x[0] * Gy[0] + x[1] * Gy[1]; };
  for (let k = 0; k < 50; k++) {
    if (sk(u, u) > sk(v, v)) [u, v] = [v, u];
    const m = Math.round(sk(u, v) / sk(u, u));
    if (m === 0) break;
    v = [v[0] - m * u[0], v[1] - m * u[1]];
  }
  if (sk(u, u) > sk(v, v) + 1e-12) [u, v] = [v, u];
  return spalten(u, v);
}

/** Holoedrie: ganzzahlige Matrizen mit Einträgen −1, 0, 1, die die Metrik G erhalten. */
function holoedrie(G) {
  const out = [];
  const s = Math.max(Math.abs(G[0][0]), Math.abs(G[1][1]));
  for (let i = 0; i < 81; i++) {
    const R = [[(i % 3) - 1, (Math.floor(i / 3) % 3) - 1], [(Math.floor(i / 9) % 3) - 1, (Math.floor(i / 27) % 3) - 1]];
    if (Math.abs(Math.abs(det(R)) - 1) > 1e-9) continue;
    const H = mat(trans(R), mat(G, R));
    if ([0, 1].every((a) => [0, 1].every((b) => Math.abs(H[a][b] - G[a][b]) < TOL_METRIK * s))) out.push(R);
  }
  return out;
}

/** Kristallsystem aus der Punktgruppe (Drehungen und Spiegelungen der Matrizen). */
function system(mats) {
  const ord = (R) => ({ 2: 1, '-2': 2, '-1': 3, 0: 4, 1: 6 }[r(R[0][0] + R[1][1])]);
  const n = Math.max(...mats.filter((R) => det(R) > 0).map(ord));
  const spiegel = mats.some((R) => det(R) < 0);
  if (n === 3 || n === 6) return 'hexagonal';
  if (n === 4) return 'quadratisch';
  return spiegel ? 'rechteckig' : 'schiefwinklig';
}

/** Kleinster ganzzahliger Vektor in Richtung v. */
function primitivVektor(v) {
  const a = r(v[0]); const b = r(v[1]); const g = ggt(a, b) || 1;
  return [a / g, b / g];
}

/** Kandidaten für die konventionelle Zelle (Spalten in Koordinaten der primitiven Zelle). */
function zellKandidaten(sys, mats, G) {
  const basen = [];
  if (sys === 'rechteckig') {
    // Achsen entlang der Normalen und der Richtung einer Spiegel- oder Gleitspiegellinie
    for (const R of mats.filter((M) => det(M) < 0)) {
      const RmI = [[R[0][0] - 1, R[0][1]], [R[1][0], R[1][1] - 1]];
      const RpI = [[R[0][0] + 1, R[0][1]], [R[1][0], R[1][1] + 1]];
      const sp = (M) => (Math.abs(M[0][0]) + Math.abs(M[1][0]) > 0 ? [M[0][0], M[1][0]] : [M[0][1], M[1][1]]);
      basen.push(spalten(primitivVektor(sp(RmI)), primitivVektor(sp(RpI))));
    }
  } else if (sys === 'hexagonal') {
    const [u, v] = [[1, 0], [0, 1]];
    const sk = (x, y) => { const Gy = vek(G, y); return x[0] * Gy[0] + x[1] * Gy[1]; };
    basen.push(sk(u, v) > 0 ? spalten(u, [v[0] - u[0], v[1] - u[1]]) : spalten(u, v));
  } else {
    basen.push([[1, 0], [0, 1]]);
  }
  // alle Vorzeichen und Vertauschungen
  const out = [];
  for (const B of basen) {
    const u = [B[0][0], B[1][0]]; const v = [B[0][1], B[1][1]];
    for (const [x, y] of [[u, v], [v, u]]) for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
      const C = spalten([s1 * x[0], s1 * x[1]], [s2 * y[0], s2 * y[1]]);
      if (!out.some((D) => D.every((z, i) => z.every((w, j) => w === C[i][j])))) out.push(C);
    }
  }
  return out;
}

/** Ursprung s mit (R − I)·s ≡ v (mod 1): Kandidaten für einen Vergleich mit der ITA-Liste. */
function ursprungKandidaten(R, v) {
  const M = [[R[0][0] - 1, R[0][1]], [R[1][0], R[1][1] - 1]];
  const out = [];
  const d = det(M);
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const w = [v[0] + i, v[1] + j];
    if (Math.abs(d) > 1e-9) out.push(vek(inv(M), w));
    else {
      const n = M[0][0] ** 2 + M[0][1] ** 2 + M[1][0] ** 2 + M[1][1] ** 2;
      if (n < 1e-9) { out.push([0, 0]); continue; }
      const s = vek(trans(M), w).map((x) => x / n); // kleinste Lösung (Pseudoinverse, Rang 1)
      const pr = vek(M, s);
      if (Math.abs(pr[0] - w[0]) < 1e-6 && Math.abs(pr[1] - w[1]) < 1e-6) out.push(s);
    }
  }
  return out;
}

/** Stimmen zwei Operationsmengen modulo Gitter überein? */
function gleicheMengen(a, b) {
  if (a.length !== b.length) return false;
  return a.every((x) => b.some((y) => x.R.every((z, i) => z.every((w, j) => w === y.R[i][j])) && gleichMod1(x.t, y.t)));
}

/**
 * Symmetrie der Struktur. Ergebnis: {
 *   symbol, gruppe (Daten nach ITA), ordnung: Operationen je konventioneller Zelle,
 *   a, b: konventionelle Gittervektoren (kartesisch),
 *   zelle: Matrix (Spalten: konventionelle a, b in Bruchkoordinaten der gegebenen Zelle),
 *   ursprung: Ursprung nach ITA in Bruchkoordinaten der gegebenen Zelle,
 *   punkte: die Punkte in Bruchkoordinaten der konventionellen Zelle (in [0, 1)),
 *   primitiv: Zahl der Gitterpunkte je gegebener Zelle
 * } oder null, wenn keine Ebenengruppe passt (sollte nicht vorkommen).
 */
export function bestimme(st) {
  const A0 = spalten(st.a, st.b); // kartesisch
  const G0 = mat(trans(A0), A0);
  const arten0 = nachArt(st.punkte);
  if (!arten0.length) return null;
  // 1. Translationen und kleinste Zelle
  const T = translationenZu(arten0, [[1, 0], [0, 1]]);
  const P = reduziere(primitiveZelle(T, G0), G0);
  const Pi = inv(P);
  const imPrim = (p) => vek(Pi, p).map(mod1);
  const punkteP = [];
  for (const q of st.punkte) {
    const x = imPrim(q.p);
    if (!punkteP.some((u) => u.art === q.art && gleichMod1(u.p, x))) punkteP.push({ p: x, art: q.art });
  }
  const arten = nachArt(punkteP);
  const G = mat(trans(P), mat(G0, P));
  // 2. Punktsymmetrie
  const ops = [];
  for (const R of holoedrie(G)) for (const t of translationenZu(arten, R)) ops.push({ R, t });
  const mats = [];
  for (const o of ops) if (!mats.some((M) => M.every((z, i) => z.every((w, j) => w === o.R[i][j])))) mats.push(o.R);
  const sys = system(mats);
  // 3. Standardaufstellung
  // die der gegebenen Zelle nächsten Kandidaten zuerst, damit die konventionelle Zelle ohne Not
  // nicht vertauscht oder umgekehrt wird
  const abstand = (C) => { const Z = mat(P, C); return Math.abs(Z[0][0] - 1) + Math.abs(Z[0][1]) + Math.abs(Z[1][0]) + Math.abs(Z[1][1] - 1); };
  for (const C of zellKandidaten(sys, mats, G).sort((u, v) => abstand(u) - abstand(v))) {
    const n = Math.round(Math.abs(det(C)));
    const Ci = inv(C);
    // Gitter der primitiven Zelle in der konventionellen: Zentrierungsvektoren
    const zentr = [[0, 0]];
    for (const v of [[1, 0], [0, 1], [1, 1]]) {
      const z = vek(Ci, v).map(mod1);
      if (!zentr.some((u) => gleichMod1(u, z))) zentr.push(z);
    }
    if (zentr.length !== n) continue;
    const konv = [];
    for (const o of ops) {
      const R = mat(Ci, mat(o.R, C)).map((z) => z.map(r));
      const t0 = vek(Ci, o.t);
      for (const z of zentr) {
        const t = [mod1(t0[0] + z[0]), mod1(t0[1] + z[1])];
        if (!konv.some((u) => u.R.every((zz, i) => zz.every((w, j) => w === R[i][j])) && gleichMod1(u.t, t))) konv.push({ R, t });
      }
    }
    for (const d of EBENENGRUPPEN) {
      if (d.system !== sys) continue;
      const g = gruppe(d.symbol);
      if (g.ordnung !== konv.length || g.zentr.length !== n) continue;
      // Ursprung aus einer Drehung (legt ihn fest); ohne Drehung aus einer Spiegelung (entlang
      // der Linie ist der Ursprung dann frei, ITA: „auf m“ bzw. „auf g“); geprüft an allen
      const drehung = (o) => det(o.R) > 0 && !(o.R[0][0] === 1 && o.R[1][1] === 1 && !o.R[0][1] && !o.R[1][0]);
      const probe = konv.find(drehung) ?? konv.find((o) => det(o.R) < 0) ?? konv[0];
      for (const ziel of g.alle.filter((o) => o.R.every((z, i) => z.every((w, j) => w === probe.R[i][j])))) {
        for (const s of ursprungKandidaten(probe.R, [ziel.t[0] - probe.t[0], ziel.t[1] - probe.t[1]])) {
          // Operation im neuen Ursprung s: x'' = x' − s → {R | t + R·s − s}
          const verschoben = konv.map((o) => { const Rs = vek(o.R, s); return { R: o.R, t: [o.t[0] + Rs[0] - s[0], o.t[1] + Rs[1] - s[1]] }; });
          if (!gleicheMengen(verschoben, g.alle)) continue;
          // Ergebnis in der gegebenen Zelle
          const zelle = mat(P, C);
          const ursprung = vek(zelle, s);
          const Zi = inv(zelle);
          const punkte = st.punkte.map((q) => {
            const x = vek(Zi, [q.p[0] - ursprung[0], q.p[1] - ursprung[1]]);
            return { p: x.map(mod1), art: q.art };
          });
          const kart = (v) => vek(A0, v);
          return {
            symbol: d.symbol, gruppe: d, ordnung: g.ordnung, system: sys,
            a: kart([zelle[0][0], zelle[1][0]]), b: kart([zelle[0][1], zelle[1][1]]),
            zelle, ursprung: ursprung.map(mod1), punkte, primitiv: T.length,
          };
        }
      }
    }
  }
  return null;
}
