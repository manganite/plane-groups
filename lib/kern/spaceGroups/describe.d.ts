/**
 * The geometric description of an operation of a plane group, as ITA gives it under "Symmetry
 * operations" (ITA 2016, § 2.1.3.9, pp. 160–161): what it is, its order and sense, where its
 * symmetry element lies and its glide part. Structured data; the symbols such as `g(1/2,1/2) x,x`
 * stay with the applications (CLAUDE.md, "Symmetry elements as structured data").
 */
import { type ExactOperation } from './affine.js';
import { type Rational } from './rational.js';
/**
 * What an operation of a plane group is: `'mirror'` (a reflection in a line, as `'mirror'` of the
 * point groups) and `'glide'` (a glide reflection).
 */
export type PlaneOperationKind = 'identity' | 'translation' | 'rotation' | 'mirror' | 'glide';
/** One operation of a plane group described geometrically, in the lattice basis. */
export interface PlaneOperationDescription {
    /** What the operation is. */
    readonly kind: PlaneOperationKind;
    /** The order n of its linear part: 1 for identity and translation, 2 for a mirror or glide. */
    readonly order: number;
    /** For a rotation with n ≥ 3: `'+'` if it turns a towards b, `'-'` otherwise. */
    readonly sense?: '+' | '-';
    /** For a translation: the translation vector. */
    readonly translation?: readonly Rational[];
    /**
     * For a rotation: its centre. For a mirror or glide: a point of its line, on y = 0 unless the line
     * is parallel to it, then on x = 0. Not reduced modulo the lattice: the centre of `-y,x+1/2` is
     * (−1/4, 1/4).
     */
    readonly location?: readonly Rational[];
    /** For a mirror or glide: the direction of its line, the shortest integer vector, first non-zero component positive. */
    readonly direction?: readonly [number, number];
    /**
     * For a glide: the glide vector (w + W·w)/2, not reduced modulo the lattice. An operation whose
     * glide vector is a non-zero lattice vector is a glide, as it is geometrically, although the
     * symmetry element of its coset is the mirror line, which ITA lists.
     */
    readonly glide?: readonly Rational[];
}
/**
 * Describes an operation of a plane group; the result is frozen. Throws unless the operation is two-dimensional with the
 * linear part of a crystallographic plane point group (determinant ±1, order 1, 2, 3, 4 or 6).
 */
export declare function describePlaneOperation(op: ExactOperation): PlaneOperationDescription;
