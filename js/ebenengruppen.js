// Die 17 Ebenengruppen nach International Tables for Crystallography, Vol. A (2006), Part 6
// (Ebenengruppe Nr. n auf S. 91 + n, Nr. 17 auf S. 108–109). Hier stehen nur Angaben, die dort
// tabelliert sind; alles Weitere (Symmetrieelemente, Lagesymmetrien) berechnet
// js/symmetrie.js, und tests/ebenengruppen.test.mjs prüft beides gegeneinander. Die „Reflection
// conditions“ der ITA fehlen hier: Sie gehören zur Beugung (crystallography-common#73).
//
// Koordinaten in Bruchteilen der Gittervektoren, a nach unten, b nach rechts (ITA Abschn. 2.2.6.1).
// Schreibweise wie in ITA, mit „-x“ statt Querstrich:
//   ops         Koordinaten der allgemeinen Lage, Reihenfolge und Nummern (1), (2) … wie in ITA
//   opsText     ITA „Symmetry operations“ zu ops, in derselben Reihenfolge
//   zentrText   bei c-Gruppen: ITA „Symmetry operations“ für den (1/2,1/2)+ Satz
//   erzeugende  ITA „Generators selected“ ohne (1) und die Gittertranslationen (Nummern in ops)
//   ae          asymmetrische Einheit: Ungleichungen wie in ITA und Ecken des Polygons
//   wyckoff     Buchstabe, Zähligkeit, orientierte Lagesymmetrie, Koordinaten (nur der (0,0)+ Satz)

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @typedef {'schiefwinklig' | 'rechteckig' | 'quadratisch' | 'hexagonal'} System */
/** Wyckoff-Lage: Buchstabe, Zähligkeit, orientierte Lagesymmetrie, Koordinaten. @typedef {{ b: string, n: number, sym: string, koord: string[] }} Wyckoff */
/**
 * Eine Ebenengruppe, wie in ITA tabelliert (Felder oben erklärt).
 * @typedef {object} Ebenengruppe
 * @property {number} nr
 * @property {string} symbol
 * @property {string} lang
 * @property {string} punktgruppe
 * @property {System} system
 * @property {string} bravais
 * @property {number} seite
 * @property {string} ursprung
 * @property {{ text: string, ecken: Vec2[] }} ae
 * @property {string[]} ops
 * @property {string[]} opsText
 * @property {string[]} [zentrText]
 * @property {Vec2[]} [zentrierung]
 * @property {number[]} erzeugende
 * @property {Wyckoff[]} wyckoff
 */

/** Kristallsysteme der Ebene (ITA Tab. 2.2.4.1, Ebene). @type {Record<System, { name: string, ita: string }>} */
export const SYSTEME = {
  schiefwinklig: { name: 'schiefwinklig', ita: 'oblique' },
  rechteckig: { name: 'rechteckig', ita: 'rectangular' },
  quadratisch: { name: 'quadratisch', ita: 'square' },
  hexagonal: { name: 'hexagonal', ita: 'hexagonal' },
};

/**
 * Symmetrierichtungen der Gitter (ITA Tab. 2.2.4.1): je Position im Symbol die Menge
 * gleichwertiger Richtungen. Position 1 ist der Drehpunkt; Spiegellinien gehören zur Position,
 * in deren Menge ihre Normale liegt.
 * @type {Record<System, Vec2[][]>}
 */
export const SYMMETRIERICHTUNGEN = {
  schiefwinklig: [],
  rechteckig: [[[1, 0]], [[0, 1]]],
  quadratisch: [[[1, 0], [0, 1]], [[1, -1], [1, 1]]],
  hexagonal: [[[1, 0], [0, 1], [-1, -1]], [[1, -1], [1, 2], [-2, -1]]],
};

/** Bravais-Gitter der Ebene: Symbol wie im Feld bravais (mp, op, …) → Name. @type {Record<string, string>} */
export const BRAVAIS = { mp: 'schiefwinklig primitiv', op: 'rechteckig primitiv', oc: 'rechteckig zentriert', tp: 'quadratisch primitiv', hp: 'hexagonal primitiv' };

/** Lage des Ursprungs, soweit sie nicht eine Wyckoff-Lage ist (Feld ursprung; main.js setzt die Symbole m und g kursiv). @type {Record<string, string>} */
export const URSPRUNG = { beliebig: 'beliebig', '21g': 'auf 2 1 g', '41g': 'auf 4 1 g' };

/** @type {Vec2[]} */
const ZENTRIERUNG_C = [[0, 0], [1 / 2, 1 / 2]];

/** @type {Ebenengruppe[]} */
export const EBENENGRUPPEN = [
  {
    nr: 1, symbol: 'p1', lang: 'p1', punktgruppe: '1', system: 'schiefwinklig', bravais: 'mp', seite: 92,
    ursprung: 'beliebig',
    ae: { text: '0 ≤ x ≤ 1; 0 ≤ y ≤ 1', ecken: [[0, 0], [1, 0], [1, 1], [0, 1]] },
    ops: ['x,y'],
    opsText: ['1'],
    erzeugende: [],
    wyckoff: [
      { b: 'a', n: 1, sym: '1', koord: ['x,y'] },
    ],
  },
  {
    nr: 2, symbol: 'p2', lang: 'p2', punktgruppe: '2', system: 'schiefwinklig', bravais: 'mp', seite: 93,
    ursprung: '2',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1], [0, 1]] },
    ops: ['x,y', '-x,-y'],
    opsText: ['1', '2 0,0'],
    erzeugende: [2],
    wyckoff: [
      { b: 'e', n: 2, sym: '1', koord: ['x,y', '-x,-y'] },
      { b: 'd', n: 1, sym: '2', koord: ['1/2,1/2'] },
      { b: 'c', n: 1, sym: '2', koord: ['1/2,0'] },
      { b: 'b', n: 1, sym: '2', koord: ['0,1/2'] },
      { b: 'a', n: 1, sym: '2', koord: ['0,0'] },
    ],
  },
  {
    nr: 3, symbol: 'pm', lang: 'p1m1', punktgruppe: 'm', system: 'rechteckig', bravais: 'op', seite: 94,
    ursprung: 'm',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1], [0, 1]] },
    ops: ['x,y', '-x,y'],
    opsText: ['1', 'm 0,y'],
    erzeugende: [2],
    wyckoff: [
      { b: 'c', n: 2, sym: '1', koord: ['x,y', '-x,y'] },
      { b: 'b', n: 1, sym: '.m.', koord: ['1/2,y'] },
      { b: 'a', n: 1, sym: '.m.', koord: ['0,y'] },
    ],
  },
  {
    nr: 4, symbol: 'pg', lang: 'p1g1', punktgruppe: 'm', system: 'rechteckig', bravais: 'op', seite: 95,
    ursprung: 'g',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1], [0, 1]] },
    ops: ['x,y', '-x,y+1/2'],
    opsText: ['1', 'b 0,y'],
    erzeugende: [2],
    wyckoff: [
      { b: 'a', n: 2, sym: '1', koord: ['x,y', '-x,y+1/2'] },
    ],
  },
  {
    nr: 5, symbol: 'cm', lang: 'c1m1', punktgruppe: 'm', system: 'rechteckig', bravais: 'oc', seite: 96,
    ursprung: 'm',
    zentrierung: ZENTRIERUNG_C,
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1 / 2], [0, 1 / 2]] },
    ops: ['x,y', '-x,y'],
    opsText: ['1', 'm 0,y'],
    zentrText: ['t(1/2,1/2)', 'b 1/4,y'],
    erzeugende: [2],
    wyckoff: [
      { b: 'b', n: 4, sym: '1', koord: ['x,y', '-x,y'] },
      { b: 'a', n: 2, sym: '.m.', koord: ['0,y'] },
    ],
  },
  {
    nr: 6, symbol: 'p2mm', lang: 'p2mm', punktgruppe: '2mm', system: 'rechteckig', bravais: 'op', seite: 97,
    ursprung: '2mm',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1 / 2], [0, 1 / 2]] },
    ops: ['x,y', '-x,-y', '-x,y', 'x,-y'],
    opsText: ['1', '2 0,0', 'm 0,y', 'm x,0'],
    erzeugende: [2, 3],
    wyckoff: [
      { b: 'i', n: 4, sym: '1', koord: ['x,y', '-x,-y', '-x,y', 'x,-y'] },
      { b: 'h', n: 2, sym: '.m.', koord: ['1/2,y', '1/2,-y'] },
      { b: 'g', n: 2, sym: '.m.', koord: ['0,y', '0,-y'] },
      { b: 'f', n: 2, sym: '..m', koord: ['x,1/2', '-x,1/2'] },
      { b: 'e', n: 2, sym: '..m', koord: ['x,0', '-x,0'] },
      { b: 'd', n: 1, sym: '2mm', koord: ['1/2,1/2'] },
      { b: 'c', n: 1, sym: '2mm', koord: ['1/2,0'] },
      { b: 'b', n: 1, sym: '2mm', koord: ['0,1/2'] },
      { b: 'a', n: 1, sym: '2mm', koord: ['0,0'] },
    ],
  },
  {
    nr: 7, symbol: 'p2mg', lang: 'p2mg', punktgruppe: '2mm', system: 'rechteckig', bravais: 'op', seite: 98,
    ursprung: '21g',
    ae: { text: '0 ≤ x ≤ 1/4; 0 ≤ y ≤ 1', ecken: [[0, 0], [1 / 4, 0], [1 / 4, 1], [0, 1]] },
    ops: ['x,y', '-x,-y', '-x+1/2,y', 'x+1/2,-y'],
    opsText: ['1', '2 0,0', 'm 1/4,y', 'a x,0'],
    erzeugende: [2, 3],
    wyckoff: [
      { b: 'd', n: 4, sym: '1', koord: ['x,y', '-x,-y', '-x+1/2,y', 'x+1/2,-y'] },
      { b: 'c', n: 2, sym: '.m.', koord: ['1/4,y', '3/4,-y'] },
      { b: 'b', n: 2, sym: '2..', koord: ['0,1/2', '1/2,1/2'] },
      { b: 'a', n: 2, sym: '2..', koord: ['0,0', '1/2,0'] },
    ],
  },
  {
    nr: 8, symbol: 'p2gg', lang: 'p2gg', punktgruppe: '2mm', system: 'rechteckig', bravais: 'op', seite: 99,
    ursprung: '2',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1 / 2], [0, 1 / 2]] },
    ops: ['x,y', '-x,-y', '-x+1/2,y+1/2', 'x+1/2,-y+1/2'],
    opsText: ['1', '2 0,0', 'b 1/4,y', 'a x,1/4'],
    erzeugende: [2, 3],
    wyckoff: [
      { b: 'c', n: 4, sym: '1', koord: ['x,y', '-x,-y', '-x+1/2,y+1/2', 'x+1/2,-y+1/2'] },
      { b: 'b', n: 2, sym: '2..', koord: ['1/2,0', '0,1/2'] },
      { b: 'a', n: 2, sym: '2..', koord: ['0,0', '1/2,1/2'] },
    ],
  },
  {
    nr: 9, symbol: 'c2mm', lang: 'c2mm', punktgruppe: '2mm', system: 'rechteckig', bravais: 'oc', seite: 100,
    ursprung: '2mm',
    zentrierung: ZENTRIERUNG_C,
    ae: { text: '0 ≤ x ≤ 1/4; 0 ≤ y ≤ 1/2', ecken: [[0, 0], [1 / 4, 0], [1 / 4, 1 / 2], [0, 1 / 2]] },
    ops: ['x,y', '-x,-y', '-x,y', 'x,-y'],
    opsText: ['1', '2 0,0', 'm 0,y', 'm x,0'],
    zentrText: ['t(1/2,1/2)', '2 1/4,1/4', 'b 1/4,y', 'a x,1/4'],
    erzeugende: [2, 3],
    wyckoff: [
      { b: 'f', n: 8, sym: '1', koord: ['x,y', '-x,-y', '-x,y', 'x,-y'] },
      { b: 'e', n: 4, sym: '.m.', koord: ['0,y', '0,-y'] },
      { b: 'd', n: 4, sym: '..m', koord: ['x,0', '-x,0'] },
      { b: 'c', n: 4, sym: '2..', koord: ['1/4,1/4', '3/4,1/4'] },
      { b: 'b', n: 2, sym: '2mm', koord: ['0,1/2'] },
      { b: 'a', n: 2, sym: '2mm', koord: ['0,0'] },
    ],
  },
  {
    nr: 10, symbol: 'p4', lang: 'p4', punktgruppe: '4', system: 'quadratisch', bravais: 'tp', seite: 101,
    ursprung: '4',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2', ecken: [[0, 0], [1 / 2, 0], [1 / 2, 1 / 2], [0, 1 / 2]] },
    ops: ['x,y', '-x,-y', '-y,x', 'y,-x'],
    opsText: ['1', '2 0,0', '4+ 0,0', '4- 0,0'],
    erzeugende: [2, 3],
    wyckoff: [
      { b: 'd', n: 4, sym: '1', koord: ['x,y', '-x,-y', '-y,x', 'y,-x'] },
      { b: 'c', n: 2, sym: '2..', koord: ['1/2,0', '0,1/2'] },
      { b: 'b', n: 1, sym: '4..', koord: ['1/2,1/2'] },
      { b: 'a', n: 1, sym: '4..', koord: ['0,0'] },
    ],
  },
  {
    nr: 11, symbol: 'p4mm', lang: 'p4mm', punktgruppe: '4mm', system: 'quadratisch', bravais: 'tp', seite: 102,
    ursprung: '4mm',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2; x ≤ y', ecken: [[0, 0], [1 / 2, 1 / 2], [0, 1 / 2]] },
    ops: ['x,y', '-x,-y', '-y,x', 'y,-x', '-x,y', 'x,-y', 'y,x', '-y,-x'],
    opsText: ['1', '2 0,0', '4+ 0,0', '4- 0,0', 'm 0,y', 'm x,0', 'm x,x', 'm x,-x'],
    erzeugende: [2, 3, 5],
    wyckoff: [
      { b: 'g', n: 8, sym: '1', koord: ['x,y', '-x,-y', '-y,x', 'y,-x', '-x,y', 'x,-y', 'y,x', '-y,-x'] },
      { b: 'f', n: 4, sym: '..m', koord: ['x,x', '-x,-x', '-x,x', 'x,-x'] },
      { b: 'e', n: 4, sym: '.m.', koord: ['x,1/2', '-x,1/2', '1/2,x', '1/2,-x'] },
      { b: 'd', n: 4, sym: '.m.', koord: ['x,0', '-x,0', '0,x', '0,-x'] },
      { b: 'c', n: 2, sym: '2mm.', koord: ['1/2,0', '0,1/2'] },
      { b: 'b', n: 1, sym: '4mm', koord: ['1/2,1/2'] },
      { b: 'a', n: 1, sym: '4mm', koord: ['0,0'] },
    ],
  },
  {
    nr: 12, symbol: 'p4gm', lang: 'p4gm', punktgruppe: '4mm', system: 'quadratisch', bravais: 'tp', seite: 103,
    ursprung: '41g',
    ae: { text: '0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2; y ≤ 1/2 − x', ecken: [[0, 0], [1 / 2, 0], [0, 1 / 2]] },
    ops: ['x,y', '-x,-y', '-y,x', 'y,-x', '-x+1/2,y+1/2', 'x+1/2,-y+1/2', 'y+1/2,x+1/2', '-y+1/2,-x+1/2'],
    opsText: ['1', '2 0,0', '4+ 0,0', '4- 0,0', 'b 1/4,y', 'a x,1/4', 'g(1/2,1/2) x,x', 'm x+1/2,-x'],
    erzeugende: [2, 3, 5],
    wyckoff: [
      { b: 'd', n: 8, sym: '1', koord: ['x,y', '-x,-y', '-y,x', 'y,-x', '-x+1/2,y+1/2', 'x+1/2,-y+1/2', 'y+1/2,x+1/2', '-y+1/2,-x+1/2'] },
      { b: 'c', n: 4, sym: '..m', koord: ['x,x+1/2', '-x,-x+1/2', '-x+1/2,x', 'x+1/2,-x'] },
      { b: 'b', n: 2, sym: '2.mm', koord: ['1/2,0', '0,1/2'] },
      { b: 'a', n: 2, sym: '4..', koord: ['0,0', '1/2,1/2'] },
    ],
  },
  {
    nr: 13, symbol: 'p3', lang: 'p3', punktgruppe: '3', system: 'hexagonal', bravais: 'hp', seite: 104,
    ursprung: '3',
    ae: {
      text: '0 ≤ x ≤ 2/3; 0 ≤ y ≤ 2/3; x ≤ (1 + y)/2; y ≤ min(1 − x, (1 + x)/2)',
      ecken: [[0, 0], [1 / 2, 0], [2 / 3, 1 / 3], [1 / 3, 2 / 3], [0, 1 / 2]],
    },
    ops: ['x,y', '-y,x-y', '-x+y,-x'],
    opsText: ['1', '3+ 0,0', '3- 0,0'],
    erzeugende: [2],
    wyckoff: [
      { b: 'd', n: 3, sym: '1', koord: ['x,y', '-y,x-y', '-x+y,-x'] },
      { b: 'c', n: 1, sym: '3..', koord: ['2/3,1/3'] },
      { b: 'b', n: 1, sym: '3..', koord: ['1/3,2/3'] },
      { b: 'a', n: 1, sym: '3..', koord: ['0,0'] },
    ],
  },
  {
    nr: 14, symbol: 'p3m1', lang: 'p3m1', punktgruppe: '3m', system: 'hexagonal', bravais: 'hp', seite: 105,
    ursprung: '3m1',
    ae: { text: '0 ≤ x ≤ 2/3; 0 ≤ y ≤ 2/3; x ≤ 2y; y ≤ min(1 − x, 2x)', ecken: [[0, 0], [2 / 3, 1 / 3], [1 / 3, 2 / 3]] },
    ops: ['x,y', '-y,x-y', '-x+y,-x', '-y,-x', '-x+y,y', 'x,x-y'],
    opsText: ['1', '3+ 0,0', '3- 0,0', 'm x,-x', 'm x,2x', 'm 2x,x'],
    erzeugende: [2, 4],
    wyckoff: [
      { b: 'e', n: 6, sym: '1', koord: ['x,y', '-y,x-y', '-x+y,-x', '-y,-x', '-x+y,y', 'x,x-y'] },
      { b: 'd', n: 3, sym: '.m.', koord: ['x,-x', 'x,2x', '-2x,-x'] },
      { b: 'c', n: 1, sym: '3m.', koord: ['2/3,1/3'] },
      { b: 'b', n: 1, sym: '3m.', koord: ['1/3,2/3'] },
      { b: 'a', n: 1, sym: '3m.', koord: ['0,0'] },
    ],
  },
  {
    nr: 15, symbol: 'p31m', lang: 'p31m', punktgruppe: '3m', system: 'hexagonal', bravais: 'hp', seite: 106,
    ursprung: '31m',
    ae: { text: '0 ≤ x ≤ 2/3; 0 ≤ y ≤ 1/2; x ≤ (1 + y)/2; y ≤ min(1 − x, x)', ecken: [[0, 0], [1 / 2, 0], [2 / 3, 1 / 3], [1 / 2, 1 / 2]] },
    ops: ['x,y', '-y,x-y', '-x+y,-x', 'y,x', 'x-y,-y', '-x,-x+y'],
    opsText: ['1', '3+ 0,0', '3- 0,0', 'm x,x', 'm x,0', 'm 0,y'],
    erzeugende: [2, 4],
    wyckoff: [
      { b: 'd', n: 6, sym: '1', koord: ['x,y', '-y,x-y', '-x+y,-x', 'y,x', 'x-y,-y', '-x,-x+y'] },
      { b: 'c', n: 3, sym: '..m', koord: ['x,0', '0,x', '-x,-x'] },
      { b: 'b', n: 2, sym: '3..', koord: ['1/3,2/3', '2/3,1/3'] },
      { b: 'a', n: 1, sym: '3.m', koord: ['0,0'] },
    ],
  },
  {
    nr: 16, symbol: 'p6', lang: 'p6', punktgruppe: '6', system: 'hexagonal', bravais: 'hp', seite: 107,
    ursprung: '6',
    ae: { text: '0 ≤ x ≤ 2/3; 0 ≤ y ≤ 1/2; x ≤ (1 + y)/2; y ≤ min(1 − x, x)', ecken: [[0, 0], [1 / 2, 0], [2 / 3, 1 / 3], [1 / 2, 1 / 2]] },
    ops: ['x,y', '-y,x-y', '-x+y,-x', '-x,-y', 'y,-x+y', 'x-y,x'],
    opsText: ['1', '3+ 0,0', '3- 0,0', '2 0,0', '6- 0,0', '6+ 0,0'],
    erzeugende: [2, 4],
    wyckoff: [
      { b: 'd', n: 6, sym: '1', koord: ['x,y', '-y,x-y', '-x+y,-x', '-x,-y', 'y,-x+y', 'x-y,x'] },
      { b: 'c', n: 3, sym: '2..', koord: ['1/2,0', '0,1/2', '1/2,1/2'] },
      { b: 'b', n: 2, sym: '3..', koord: ['1/3,2/3', '2/3,1/3'] },
      { b: 'a', n: 1, sym: '6..', koord: ['0,0'] },
    ],
  },
  {
    nr: 17, symbol: 'p6mm', lang: 'p6mm', punktgruppe: '6mm', system: 'hexagonal', bravais: 'hp', seite: 108,
    ursprung: '6mm',
    ae: { text: '0 ≤ x ≤ 2/3; 0 ≤ y ≤ 1/3; x ≤ (1 + y)/2; y ≤ x/2', ecken: [[0, 0], [1 / 2, 0], [2 / 3, 1 / 3]] },
    ops: ['x,y', '-y,x-y', '-x+y,-x', '-x,-y', 'y,-x+y', 'x-y,x', '-y,-x', '-x+y,y', 'x,x-y', 'y,x', 'x-y,-y', '-x,-x+y'],
    opsText: ['1', '3+ 0,0', '3- 0,0', '2 0,0', '6- 0,0', '6+ 0,0', 'm x,-x', 'm x,2x', 'm 2x,x', 'm x,x', 'm x,0', 'm 0,y'],
    erzeugende: [2, 4, 7],
    wyckoff: [
      { b: 'f', n: 12, sym: '1', koord: ['x,y', '-y,x-y', '-x+y,-x', '-x,-y', 'y,-x+y', 'x-y,x', '-y,-x', '-x+y,y', 'x,x-y', 'y,x', 'x-y,-y', '-x,-x+y'] },
      { b: 'e', n: 6, sym: '.m.', koord: ['x,-x', 'x,2x', '-2x,-x', '-x,x', '-x,-2x', '2x,x'] },
      { b: 'd', n: 6, sym: '..m', koord: ['x,0', '0,x', '-x,-x', '-x,0', '0,-x', 'x,x'] },
      { b: 'c', n: 3, sym: '2mm', koord: ['1/2,0', '0,1/2', '1/2,1/2'] },
      { b: 'b', n: 2, sym: '3m.', koord: ['1/3,2/3', '2/3,1/3'] },
      { b: 'a', n: 1, sym: '6mm', koord: ['0,0'] },
    ],
  },
];

/** Ebenengruppe nach Symbol (z. B. 'p2mg') oder Nummer. @param {string | number} id */
export function ebenengruppe(id) {
  const g = EBENENGRUPPEN.find((e) => e.symbol === id || e.nr === id);
  if (!g) throw new Error(`unbekannte Ebenengruppe: ${id}`);
  return g;
}
