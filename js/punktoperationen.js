// Die Operationen der Punktgruppen der Ebene mit Namen wie im Skript (Abschn. 4.4, Abb. 4.4 und 4.5):
// Identität 1; Drehung um 180° 2; Drehungen um 360°/n gegen bzw. im Uhrzeigersinn +n und −n
// (n = 3, 4, 6). Spiegelungen: In 3m gehen m1, m2, m3 durch die Stellen 1, 2, 3
// der Abb. 4.4. In 2mm und 4mm steht im Index die Richtung der Normalen, also die Achse senkrecht
// zur Spiegellinie: 2mm ma, mb; 4mm ma, mb, ma+b, ma−b. In 6mm gehören zu jeder Achse ai zwei
// Spiegellinien; das Zeichen am m sagt, wie die Linie zur Achse liegt: mai⊥ senkrecht, mai∥
// parallel. Achsen wie in der App: quadratisch a nach unten,
// b nach rechts; hexagonal a1 = a unter 240°, a2 = b nach rechts, a3 = −(a1 + a2) unter 120°.
//
// Eine Operation: { name, html, art: 'd' | 'm', w }. w ist bei einer Drehung der Drehwinkel, bei
// einer Spiegelung der Winkel der Linie, in Grad gegen den Uhrzeigersinn ab der Waagrechten im Bild.
// Bei Spiegelungen zusätzlich index (Text im Index, Buchstaben kursiv) und zeichen ('⊥', '∥' oder '').

/** @import { Grad } from '../lib/common/js/typen.js' */
/**
 * Operation einer Punktgruppe (siehe oben).
 * @typedef {{ name: string, html: string, art: 'd' | 'm', w: Grad, index?: string | number, zeichen?: string }} Punktoperation
 */

/** Winkel x modulo n Grad, in [0, n). @param {number} x @param {number} n */
const mod = (x, n) => /** @type {Grad} */ (((x % n) + n) % n);
/** @type {(w: number, name: string) => Punktoperation} */
const D = (w, name) => ({ name, html: name, art: 'd', w: mod(w, 360) });
const TIEF = '₀₁₂₃₄₅₆₇₈₉';
/** Index als HTML: Buchstaben kursiv, Ziffern und Zeichen aufrecht. @param {string} t */
export const indexHTML = (t) => t.replace(/[a-z]/g, (c) => `<i>${c}</i>`);
/** @type {(w: number, index: string | number, zeichen?: string) => Punktoperation} */
const M = (w, index, zeichen = '') => ({
  name: `m${index}${zeichen}`,
  html: `<i>m</i>${/^\d$/.test(String(index)) ? TIEF[Number(index)] : `<sub>${indexHTML(String(index))}</sub>`}${zeichen ? `<sup>${zeichen}</sup>` : ''}`,
  art: 'm', w: mod(w, 180), index, zeichen,
});

const E = D(0, '1');
const ZWEI = D(180, '2');
const DREH = { 3: [D(120, '+3'), D(240, '−3')], 4: [D(90, '+4'), D(270, '−4')], 6: [D(60, '+6'), D(300, '−6')] };

/** Punktgruppen mit mindestens einer echten Untergruppe ausser 1, in der Reihenfolge der Systeme. @satisfies {Record<string, Punktoperation[]>} */
export const OPERATIONEN = {
  4: [E, ZWEI, ...DREH[4]],
  '2mm': [E, ZWEI, M(0, 'a'), M(90, 'b')],
  '3m': [E, ...DREH[3], M(30, 1), M(150, 2), M(90, 3)],
  '4mm': [E, ZWEI, ...DREH[4], M(0, 'a'), M(90, 'b'), M(45, 'a+b'), M(135, 'a−b')],
  6: [E, ZWEI, ...DREH[3], ...DREH[6]],
  '6mm': [E, ZWEI, ...DREH[3], ...DREH[6], M(150, 'a1', '⊥'), M(90, 'a2', '⊥'), M(30, 'a3', '⊥'), M(60, 'a1', '∥'), M(0, 'a2', '∥'), M(120, 'a3', '∥')],
};

/** Punktgruppe mit Untergruppen, als Text („4“, „2mm“). @typedef {`${keyof typeof OPERATIONEN}`} PG */

/**
 * Verknüpfung A ∘ B (zuerst B, dann A) als { art, w }.
 * @param {Punktoperation} A @param {Punktoperation} B
 * @returns {Pick<Punktoperation, 'art' | 'w'>}
 */
function verkn(A, B) {
  if (A.art === 'd' && B.art === 'd') return { art: 'd', w: mod(A.w + B.w, 360) };
  if (A.art === 'd') return { art: 'm', w: mod(B.w + A.w / 2, 180) };
  if (B.art === 'd') return { art: 'm', w: mod(A.w - B.w / 2, 180) };
  return { art: 'd', w: mod(2 * (A.w - B.w), 360) };
}

/** Index von A ∘ B in der Punktgruppe pg (Indizes in OPERATIONEN[pg]). @param {PG} pg @param {number} a @param {number} b */
export function verknuepfe(pg, a, b) {
  const ops = OPERATIONEN[pg];
  const c = verkn(ops[a], ops[b]);
  const k = ops.findIndex((o) => o.art === c.art && Math.abs(o.w - c.w) < 1e-9);
  if (k < 0) throw new Error(`${pg}: ${ops[a].name} ∘ ${ops[b].name} nicht in der Gruppe`);
  return k;
}

/** Gruppentafel: Zeile A, Spalte B, Eintrag A ∘ B (Namen). @param {PG} pg */
export const gruppentafel = (pg) => OPERATIONEN[pg].map((_, a) => OPERATIONEN[pg].map((__, b) => OPERATIONEN[pg][verknuepfe(pg, a, b)].name));

/**
 * Erstes Paar [A, B] aus der Menge (Indizes), dessen Verknüpfung nicht in der Menge liegt; Quadrate zuerst.
 * @param {PG} pg @param {readonly number[]} menge
 * @returns {[number, number] | null}
 */
export function nichtAbgeschlossen(pg, menge) {
  for (const a of menge) if (!menge.includes(verknuepfe(pg, a, a))) return [a, a];
  for (const a of menge) for (const b of menge) if (!menge.includes(verknuepfe(pg, a, b))) return [a, b];
  return null;
}

/** Ist die Menge (Indizes) eine Gruppe? Bei endlichen Mengen genügen die Identität und die Abgeschlossenheit. */
/** @param {PG} pg @param {readonly number[]} menge */
export const istGruppe = (pg, menge) => menge.includes(0) && !nichtAbgeschlossen(pg, menge);

/** Alle Teilmengen (Indizes, aufsteigend) mit Grösse zwischen lo und hi. @param {number} n @param {number} lo @param {number} hi */
export function teilmengen(n, lo, hi) {
  /** @type {number[][]} */
  const out = [];
  for (let bits = 1; bits < 1 << n; bits++) {
    /** @type {number[]} */
    const s = [];
    for (let i = 0; i < n; i++) if (bits & (1 << i)) s.push(i);
    if (s.length >= lo && s.length <= hi) out.push(s);
  }
  return out;
}

/** Echte Untergruppen ausser {1}, nach Grösse. @param {PG} pg */
export const untergruppen = (pg) => {
  const n = OPERATIONEN[pg].length;
  return teilmengen(n, 2, n - 1).filter((s) => istGruppe(pg, s)).sort((x, y) => x.length - y.length);
};

/** Symbol der Punktgruppe, die eine Menge von Operationen bildet (z. B. „2mm“, „3“). @param {PG} pg @param {readonly number[]} menge */
export function symbolVon(pg, menge) {
  const ops = menge.map((i) => OPERATIONEN[pg][i]);
  const n = ops.filter((o) => o.art === 'd').length;
  const m = ops.length - n;
  if (!m) return String(n);
  return n === 1 ? 'm' : n === 2 ? '2mm' : `${n}m${n === 3 ? '' : 'm'}`;
}
