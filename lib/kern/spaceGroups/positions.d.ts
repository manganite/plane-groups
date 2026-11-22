/**
 * Points of a plane group: their orbit, site symmetry and Wyckoff position (CLAUDE.md, "Plane
 * groups (and later space groups)"). Points come from callers as floating-point coordinates in the
 * lattice basis; whether an operation fixes a point is decided within a tolerance, as for the
 * point groups (`siteSymmetry`). Internal for now.
 */
import { type PlainOperation } from './affine.js';
/** Options of the functions that take a point. */
export interface PointOptions {
    /**
     * Two points count as the same, modulo the lattice, if each coordinate differs by less than this
     * from an integer (coordinates in the lattice basis). Default 10⁻⁶.
     */
    readonly tolerance?: number;
}
/** The site symmetry of a point under a plane group. */
export interface PlaneSiteSymmetry {
    /**
     * Indices into the operations of the group (`planeGroupOperations`) of those that map the point
     * to itself modulo the lattice, ascending.
     */
    readonly operations: readonly number[];
    /**
     * The operations of the site symmetry, each with the lattice translation that makes it fix the
     * point (not only modulo the lattice).
     */
    readonly fixing: readonly PlainOperation[];
    /**
     * The point set onto the fixed space of its site symmetry (the mean of its images under the
     * fixing operations), in [0, 1), which removes rounding errors within the tolerance.
     */
    readonly point: readonly number[];
    /** The number of points in the conventional cell equivalent to it. */
    readonly multiplicity: number;
}
/** The Wyckoff position of a point. */
export interface PlaneWyckoffPosition {
    /** The Wyckoff letter, as ITA prints it. */
    readonly letter: string;
    /** The multiplicity, as ITA prints it. */
    readonly multiplicity: number;
    /** The oriented site-symmetry symbol, as ITA prints it. */
    readonly siteSymmetry: string;
}
/**
 * The orbit of a point under a plane group: its distinct images in the conventional cell, each in
 * [0, 1), in the order of the operations that first produce them. Coinciding images (within the
 * tolerance) are merged.
 */
export declare function planeOrbit(key: string, point: readonly number[], options?: PointOptions): number[][];
/**
 * The site symmetry of a point under a plane group. The operations that fix the point modulo the
 * lattice within the tolerance are closed under products and the point is set onto the fixed space
 * of the closure (the mean of its images), repeated until stable, as `siteSymmetry` does for the point
 * groups; so the result is always a subgroup and the set point lies exactly on its elements. Throws a
 * RangeError if that does not settle (a tolerance far too large).
 */
export declare function planeSiteSymmetry(key: string, point: readonly number[], options?: PointOptions): PlaneSiteSymmetry;
/**
 * The Wyckoff position of a point under a plane group, as ITA prints it: the point is first set
 * onto the fixed space of its site symmetry (`planeSiteSymmetry`), then found among the printed
 * coordinates of the positions with its multiplicity, the centring included.
 */
export declare function planeWyckoffPositionOf(key: string, point: readonly number[], options?: PointOptions): PlaneWyckoffPosition;
