// Die frühere Rechnung der App für Lagen und Bahnen (bis zur Umstellung auf symcrys, js/symmetrie.js). Sie bleibt als
// unabhängige Gegenprobe zu symcrys in den Tests (CLAUDE.md, „Rechenkern symcrys“); die App selbst nutzt sie nicht mehr.
// Sie läuft über `g.alle`, das inzwischen aus symcrys kommt; dass es gleich der Abschrift der ITA 2006 ist, prüft der
// erste Test in tests/kern.test.mjs.

import { SYMMETRIERICHTUNGEN } from '../js/ebenengruppen.js';
import { anwenden, art, mod1 } from '../js/symmetrie.js';

/** @import { Vec2, Mat2 } from '../lib/common/js/typen.js' */
/** @import { Gruppe, Op, Art } from '../js/symmetrie.js' */

const TOL_EXAKT = 1e-9;
/** @param {Mat2} A @param {Vec2} v @returns {Vec2} */
const matVec = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
/** @param {Mat2} A */
const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
/** @param {number} a @param {number} b */
const nahe = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;
/** @param {Vec2} u @param {Vec2} v */
const parallel = (u, v) => nahe(u[0] * v[1] - u[1] * v[0], 0);
/** @param {Mat2} R */
const drehZaehligkeit = (R) => /** @type {Record<number, number>} */ ({ 2: 1, '-2': 2, '-1': 3, 0: 4, 1: 6 })[Math.round(R[0][0] + R[1][1])];
/** @param {Vec2} p @param {Vec2} q */
const abstandModGitter = (p, q) => {
  const d0 = p[0] - q[0]; const d1 = p[1] - q[1];
  return Math.max(Math.abs(d0 - Math.round(d0)), Math.abs(d1 - Math.round(d1)));
};

/** Operationen der Gruppe, die p festhalten (mit passender ganzzahliger Translation). @param {Gruppe} g @param {Vec2} p @returns {Op[]} */
export function stabilisatorBisher(g, p, tol = TOL_EXAKT) {
  /** @type {Op[]} */
  const out = [];
  for (const op of g.alle) {
    const q = anwenden(op, p);
    if (abstandModGitter(q, p) >= tol) continue;
    out.push({ R: op.R, t: [op.t[0] - Math.round(q[0] - p[0]), op.t[1] - Math.round(q[1] - p[1])] });
  }
  return out;
}

/**
 * Orientiertes Symbol der Lagesymmetrie (ITA 2006, Abschn. 2.2.12), aus dem Stabilisator abgeleitet.
 * @param {Gruppe} g @param {readonly Op[]} stab
 */
export function lagesymbolBisher(g, stab) {
  if (stab.length === 1) return '1';
  const system = g.daten.system;
  const drehungen = stab.filter((o) => nahe(det(o.R), 1));
  const n = Math.max(...drehungen.map((o) => drehZaehligkeit(o.R)));
  if (system === 'schiefwinklig') return String(n);
  const normalen = stab.filter((o) => nahe(det(o.R), -1)).map((o) => /** @type {Extract<Art, { normale: Vec2 }>} */ (art(o)).normale);
  let s = n > 1 ? String(n) : '.';
  for (const menge of SYMMETRIERICHTUNGEN[system]) {
    const mitSpiegel = menge.filter((r) => normalen.some((nv) => parallel(nv, r)));
    if (mitSpiegel.length === 0) { s += '.'; continue; }
    /** @type {Vec2[]} */
    const bahnen = [];
    for (const r of mitSpiegel) {
      if (bahnen.some((b) => drehungen.some((o) => parallel(matVec(o.R, b), r)))) continue;
      bahnen.push(r);
    }
    s += 'm'.repeat(bahnen.length);
  }
  return s;
}

/** Bahn von p: alle äquivalenten Punkte in [0, 1)², ohne Doppelte. @param {Gruppe} g @param {Vec2} p @returns {Vec2[]} */
export function bahnBisher(g, p, tol = TOL_EXAKT) {
  /** @type {Vec2[]} */
  const out = [];
  for (const op of g.alle) {
    const q = /** @type {Vec2} */ (anwenden(op, p).map(mod1));
    if (!out.some((r) => abstandModGitter(r, q) < tol)) out.push(q);
  }
  return out;
}
