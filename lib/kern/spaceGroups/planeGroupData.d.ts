/**
 * The 17 plane groups as ITA prints them (6th ed., 2016, Chapter 2.2, pp. 176–192, plane group n on
 * p. 175 + n). The same data are in references/itc/vol-a-2016-plane-groups.md, which the reference
 * test re-parses and compares with this file; change both only by transcription from print.
 *
 * Notation as in the transcription: a leading `-` is an overbar; coordinates in the lattice basis
 * a, b; `<=` for ≤. The oriented site-symmetry symbols without the spaces of the print.
 */
/** A crystal system of the plane, as ITA names it. */
export type PlaneSystem = 'oblique' | 'rectangular' | 'square' | 'hexagonal';
/** [multiplicity, Wyckoff letter, oriented site symmetry, coordinates of the (0,0)+ set]. */
export type PlaneWyckoffRow = readonly [number, string, string, readonly string[]];
/** One plane group as printed. */
export interface PlaneGroupEntry {
    /** Number of the plane group, 1 to 17. */
    readonly number: number;
    /** Short Hermann–Mauguin symbol, e.g. `p2mg`. */
    readonly symbol: string;
    /** Full Hermann–Mauguin symbol, e.g. `p1m1`. */
    readonly fullSymbol: string;
    /** The plane point group, e.g. `2mm`. */
    readonly pointGroup: string;
    /** The crystal system. */
    readonly system: PlaneSystem;
    /** Printed page. */
    readonly page: number;
    /** The block "Origin" as printed, e.g. `at 21g`. */
    readonly origin: string;
    /** The block "Asymmetric unit" as printed. */
    readonly asymmetricUnit: string;
    /** The vertices of the asymmetric unit, where printed (hexagonal groups). */
    readonly vertices?: readonly string[];
    /** Centring translations besides (0,0): `['1/2,1/2']` for the c groups. */
    readonly centring: readonly string[];
    /** The general position, (0,0)+ set, in ITA's numbering. */
    readonly generalPosition: readonly string[];
    /** "Generators selected": numbers in the general position, after (1) and the integer translations (and the centring). */
    readonly generators: readonly number[];
    /** The Wyckoff positions in printed order, general position first. */
    readonly wyckoff: readonly PlaneWyckoffRow[];
}
/** The 17 plane groups in ITA's order. */
export declare const PLANE_GROUP_DATA: readonly PlaneGroupEntry[];
