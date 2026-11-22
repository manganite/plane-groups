/**
 * The asymmetric unit of a plane group and its symmetry elements in the conventional cell, as numbers
 * (CLAUDE.md, "The API of `symcrys/plane`"): the asymmetric unit as inequalities with its vertices,
 * the elements as rotation centres with their order and as mirror and glide lines with the segment
 * that lies in the cell [0, 1]². Exact, in the lattice basis; drawing them stays with the
 * applications. Internal for now.
 */
import { type Rational } from './rational.js';
/** An inequality a·x + b·y ≤ c with integer coefficients without a common factor. */
export type Inequality = readonly [a: number, b: number, c: number];
/** The asymmetric unit of a plane group, a convex polygon in the lattice basis. */
export interface AsymmetricUnit {
    /** Its vertices, counter-clockwise in the lattice basis (a towards b), starting at the vertex with the smallest y, then x. */
    readonly vertices: readonly (readonly Rational[])[];
    /** Its edges as inequalities: inequality i holds the edge from vertex i to vertex i + 1. */
    readonly inequalities: readonly Inequality[];
}
/** A rotation centre in the cell. */
export interface RotationCentre {
    /** The highest order of a rotation about it. */
    readonly order: number;
    /** Its position in [0, 1]². */
    readonly point: readonly Rational[];
}
/** A mirror or glide line, the part of it in the cell. */
export interface SymmetryLine {
    /** `'mirror'` or `'glide'`. */
    readonly kind: 'mirror' | 'glide';
    /** The direction of the line, the shortest integer vector, first non-zero component positive. */
    readonly direction: readonly [number, number];
    /** For a glide line: its glide vector s·direction with 0 < s < 1; for a mirror line (0, 0). */
    readonly glide: readonly Rational[];
    /** The ends of the segment of the line in the cell [0, 1]², in the order of `direction`. */
    readonly segment: readonly [readonly Rational[], readonly Rational[]];
}
/** The symmetry elements of a plane group in the cell [0, 1]². */
export interface CellElements {
    /** The rotation centres, by descending order, then by y and x. */
    readonly rotations: readonly RotationCentre[];
    /** The mirror and glide lines with a segment of non-zero length in the cell, by direction, then by the start of the segment (y, then x). */
    readonly lines: readonly SymmetryLine[];
}
/** Reads the printed block "Asymmetric unit", e.g. `0 <= x <= 1/2; y <= min(1 - x, (1 + x)/2)`. */
export declare function parseAsymmetricUnit(text: string): Inequality[];
/**
 * The asymmetric unit of a plane group as ITA prints it, a convex polygon: its vertices and, for each
 * edge, the inequality a·x + b·y ≤ c that holds it. Printed inequalities that hold no edge are
 * left out. Frozen.
 */
export declare function planeAsymmetricUnit(key: string | number): AsymmetricUnit;
/**
 * The symmetry elements of a plane group in its conventional cell [0, 1]², boundary included: every
 * rotation centre with the highest order of a rotation about it, and every mirror and glide line
 * that crosses the cell, with the segment inside it. A line that carries a glide is a glide line
 * with its shortest glide vector along the line (between 0 and the lattice vector). Frozen.
 */
export declare function planeCellElements(key: string | number): CellElements;
