/**
 * The plane API of symcrys (`symcrys/plane`): the 17 plane groups and the 10 plane point groups, in
 * the lattice basis, as ITA (6th ed., 2016) prints them in Chapter 2.2 and Table 3.2.1.1.
 * Everything exported here is covered by SemVer (see CLAUDE.md), like the exports of `index.ts`.
 *
 * Inside, the operations are exact (integer matrices, rational translations); here they are plain
 * numbers: a translation of 1/3 is the nearest double. Keys are the symbols ITA prints: `'p2mg'`,
 * `'c2mm'` for the plane groups, `'2mm'`, `'3m'` for the plane point groups; the two sets do not
 * overlap. Functions that take a point take its coordinates in the lattice basis and an optional
 * `tolerance` (docs/conventions.md, "Plane groups").
 */
import { type PlaneSystem } from './spaceGroups/planeGroupData.js';
import { type PlanePointGroupKey } from './spaceGroups/planePointGroups.js';
export { VERSION } from './version.js';
export type { PlaneSystem } from './spaceGroups/planeGroupData.js';
/** The short symbol of a plane group, e.g. `'p2mg'`. */
export type PlaneGroupKey = 'p1' | 'p2' | 'pm' | 'pg' | 'cm' | 'p2mm' | 'p2mg' | 'p2gg' | 'c2mm' | 'p4' | 'p4mm' | 'p4gm' | 'p3' | 'p3m1' | 'p31m' | 'p6' | 'p6mm';
/** The key of a plane point group, e.g. `'2mm'`. */
export type PointGroupKey = PlanePointGroupKey;
/** The short symbols of the 17 plane groups, in ITA's order (plane group n at index n − 1). */
export declare const PLANE_GROUP_KEYS: readonly PlaneGroupKey[];
/** The keys of the 10 plane point groups, in the order of ITA Table 3.2.1.1. */
export declare const POINT_GROUP_KEYS: readonly PointGroupKey[];
/** Options that choose the setting of a plane point group. */
export interface SettingOptions {
    /** 1-based setting: for the point group `3m` 1 is `3m1` (default) and 2 is `31m`; the other point groups have one, and a plane group takes only 1. */
    readonly setting?: number;
}
/** Options of the functions that take a point. */
export interface PointOptions {
    /**
     * Two points count as the same, modulo the lattice, if each coordinate (lattice basis) differs
     * by less than this from an integer. Default 10⁻⁶; must be below 1/2.
     */
    readonly tolerance?: number;
}
/** An operation (W, w) in the lattice basis: x ↦ W·x + w. */
export interface PlaneOperation {
    /** The linear part W, a 2 × 2 matrix with integer entries, rows first. */
    readonly matrix: readonly (readonly number[])[];
    /** The translation part w; for a plane group in [0, 1), for a point group zero. */
    readonly translation: readonly number[];
}
/** A plane group. */
export interface PlaneGroup {
    /** The short symbol, e.g. `'p2mg'`. */
    readonly key: PlaneGroupKey;
    /** The number of the plane group, 1 to 17. */
    readonly number: number;
    /** The full symbol as ITA prints it, e.g. `'p2mg'` or `'p1m1'`. */
    readonly fullSymbol: string;
    /** The plane point group. */
    readonly pointGroup: PointGroupKey;
    /** The setting of the point group: 2 for `p31m`, otherwise 1. */
    readonly pointGroupSetting: number;
    /** The crystal system. */
    readonly crystalSystem: PlaneSystem;
    /** The centring translations besides (0, 0): `[[0.5, 0.5]]` for `cm` and `c2mm`, otherwise none. */
    readonly centring: readonly (readonly number[])[];
    /** The block "Origin" as ITA prints it, e.g. `'at 2mm'`. */
    readonly origin: string;
    /** The order of the group modulo the lattice: the number of `operations`. */
    readonly order: number;
}
/** A plane point group. */
export interface PointGroup {
    /** The key, e.g. `'2mm'`. */
    readonly key: PointGroupKey;
    /** The crystal system. */
    readonly crystalSystem: PlaneSystem;
    /** The order of the group. */
    readonly order: number;
}
/** A setting of a plane point group. */
export interface Setting {
    /** 1-based. */
    readonly index: number;
    /** Its symbol: `'3m1'` or `'31m'` for `3m`, otherwise the key. */
    readonly symbol: string;
    /** True for the default setting (setting 1). */
    readonly default: boolean;
}
/** What an operation is, geometrically, as ITA describes it under "Symmetry operations". */
export interface OperationDescription {
    /** `'identity'`, `'translation'`, `'rotation'`, `'mirror'` (a reflection in a line) or `'glide'` (a glide reflection). */
    readonly kind: 'identity' | 'translation' | 'rotation' | 'mirror' | 'glide';
    /** The order of the linear part: 1 for the identity and a translation, 2 for a mirror or glide. */
    readonly order: number;
    /** For a rotation of order 3 or more: `'+'` if it turns a towards b, `'-'` otherwise. */
    readonly sense?: '+' | '-';
    /** For a translation: the translation vector. */
    readonly translation?: readonly number[];
    /**
     * For a rotation: its centre. For a mirror or glide: a point of its line, on y = 0 unless the line
     * is parallel to it, then on x = 0. Not reduced modulo the lattice.
     */
    readonly location?: readonly number[];
    /** For a mirror or glide: the direction of its line, the shortest integer vector, first non-zero component positive. */
    readonly direction?: readonly number[];
    /** For a glide: the glide vector (w + W·w)/2, not reduced modulo the lattice. */
    readonly glide?: readonly number[];
}
/** A Wyckoff position of a plane group, as ITA prints it. */
export interface WyckoffPosition {
    /** The Wyckoff letter. */
    readonly letter: string;
    /** The multiplicity: the number of points in the conventional cell. */
    readonly multiplicity: number;
    /** The oriented site-symmetry symbol, e.g. `'.m.'`, `'2mm'` (without the spaces of the print). */
    readonly siteSymmetry: string;
    /** The printed coordinates of the (0,0)+ set, e.g. `['x,0', '-x,0']`; a leading `-` is an overbar. */
    readonly coordinates: readonly string[];
}
/** The site symmetry of a point under a plane group. */
export interface SiteSymmetry {
    /** Indices into `operations` of those that map the point onto itself modulo the lattice, ascending: a subgroup. */
    readonly operations: readonly number[];
    /** The point set onto the fixed space of its site symmetry, in [0, 1), which removes rounding errors within the tolerance. */
    readonly point: readonly number[];
    /** The number of points in the conventional cell equivalent to it. */
    readonly multiplicity: number;
    /** True if no operation other than the identity maps the point onto itself (general position). */
    readonly general: boolean;
}
/** The asymmetric unit of a plane group, a convex polygon in the lattice basis. */
export interface AsymmetricUnit {
    /** Its vertices, counter-clockwise (a towards b), starting at the lowest (smallest y, then x). */
    readonly vertices: readonly (readonly number[])[];
    /** Per edge, the inequality [a, b, c] for a·x + b·y ≤ c (integers, no common factor); entry i holds the edge from vertex i to vertex i + 1. */
    readonly inequalities: readonly (readonly number[])[];
}
/** A rotation centre in the cell. */
export interface RotationCentre {
    /** The highest order of a rotation about it. */
    readonly order: number;
    /** Its position in [0, 1]². */
    readonly point: readonly number[];
}
/** A mirror or glide line: the part of it in the cell. */
export interface SymmetryLine {
    /** `'mirror'` or `'glide'`. */
    readonly kind: 'mirror' | 'glide';
    /** The direction of the line, the shortest integer vector, first non-zero component positive. */
    readonly direction: readonly number[];
    /** For a glide line its glide vector s·direction, 0 < s < 1; for a mirror line (0, 0). */
    readonly glide: readonly number[];
    /** The two ends of the segment of the line in the cell [0, 1]², in the order of `direction`. */
    readonly segment: readonly (readonly number[])[];
}
/** The symmetry elements of a plane group in its conventional cell [0, 1]², boundary included. */
export interface SymmetryElements {
    /** The rotation centres, by descending order, then by y and x. */
    readonly rotations: readonly RotationCentre[];
    /** The mirror and glide lines that cross the cell, by direction, then by the start of the segment (y, then x). */
    readonly lines: readonly SymmetryLine[];
}
/** The plane group with this key (short symbol). Throws a RangeError for an unknown key. */
export declare function planeGroup(key: PlaneGroupKey): PlaneGroup;
/** The plane point group with this key. Throws a RangeError for an unknown key. */
export declare function pointGroup(key: PointGroupKey): PointGroup;
/**
 * The settings of a plane point group: two for `3m` (`3m1`, the default, and `31m`), one for the
 * others. Throws a RangeError for an unknown key.
 */
export declare function settings(key: PointGroupKey): readonly Setting[];
/** The symbol of a plane point group in a setting: `'3m1'` or `'31m'` for `3m`, otherwise the key. */
export declare function symbol(key: PointGroupKey, options?: SettingOptions): string;
/**
 * The operations of a plane group or a plane point group, in ITA's order, identity first. A plane
 * group: one per coset of the integer translations, translations in [0, 1), the general position
 * as numbered, then for a centred group the same sequence with the centring added (the
 * "(1/2,1/2)+ set"). A point group: the linear parts of its symmorphic plane group (pm for m,
 * p3m1 and p31m for the settings of 3m), translation zero. Throws a RangeError for an unknown key
 * or setting.
 */
export declare function operations(key: PlaneGroupKey | PointGroupKey, options?: SettingOptions): readonly PlaneOperation[];
/**
 * ITA's selected generators, in printed order, without the identity and the integer translations:
 * for a centred plane group the centring translation first. A point group: the linear parts of the
 * generators of its symmorphic plane group. Throws a RangeError for an unknown key or setting.
 */
export declare function generators(key: PlaneGroupKey | PointGroupKey, options?: SettingOptions): readonly PlaneOperation[];
/**
 * Each operation of `operations` (same key and setting) described geometrically, index for index:
 * what it is, its order and sense, where its symmetry element lies, its glide part. Throws a
 * RangeError for an unknown key or setting.
 */
export declare function describeOperations(key: PlaneGroupKey | PointGroupKey, options?: SettingOptions): readonly OperationDescription[];
/**
 * The Wyckoff positions of a plane group as ITA prints them, general position first. Throws a
 * RangeError for an unknown key and for a plane point group, whose positions are not in symcrys
 * yet.
 */
export declare function wyckoffPositions(key: PlaneGroupKey): readonly WyckoffPosition[];
/**
 * The site symmetry of a point (lattice basis) under a plane group: the operations that map it
 * onto itself modulo the lattice within the tolerance, closed into a group, and the point set onto
 * their fixed space. Throws a RangeError for an unknown key, a point that is not two finite
 * numbers, or a tolerance outside (0, 1/2).
 */
export declare function siteSymmetry(key: PlaneGroupKey, point: readonly number[], options?: PointOptions): SiteSymmetry;
/**
 * The Wyckoff position of a point (lattice basis) under a plane group, as `wyckoffPositions` gives
 * it: the printed position of the point's multiplicity whose coordinates, with the centring, reach
 * the point set onto its site symmetry. Throws a RangeError as `siteSymmetry`.
 */
export declare function wyckoffPositionOf(key: PlaneGroupKey, point: readonly number[], options?: PointOptions): WyckoffPosition;
/**
 * The orbit of a point (lattice basis) under a plane group: its distinct images in the
 * conventional cell, each in [0, 1), in the order of the operations that first give them; images
 * that coincide within the tolerance are merged. Throws a RangeError as `siteSymmetry`.
 */
export declare function orbit(key: PlaneGroupKey, point: readonly number[], options?: PointOptions): readonly (readonly number[])[];
/**
 * The asymmetric unit of a plane group as ITA prints it: a convex polygon given by its vertices and,
 * per edge, the printed inequality that holds it. Throws a RangeError for an unknown key.
 */
export declare function asymmetricUnit(key: PlaneGroupKey): AsymmetricUnit;
/**
 * The symmetry elements of a plane group in its conventional cell [0, 1]², boundary included:
 * every rotation centre with the highest order of a rotation about it, and every mirror and glide
 * line that crosses the cell, with the segment inside it. Throws a RangeError for an unknown key.
 */
export declare function symmetryElements(key: PlaneGroupKey): SymmetryElements;
