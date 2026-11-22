/**
 * The ten plane point groups (ITA 6th ed., Table 3.2.1.1, p. 720), `3m` in its two orientations
 * `3m1` and `31m` (Ch. 3.2, p. 721, item (d)). Their operations are the linear parts of the
 * symmorphic plane group of each, in ITA's order (pm for m, p3m1 and p31m for the two settings of
 * 3m), so that the point group of a plane group is its linear part and one data source serves both.
 * Internal; exported through `symcrys/plane`.
 */
import { type ExactOperation } from './affine.js';
import { type PlaneSystem } from './planeGroupData.js';
/** The keys of the ten plane point groups, in the order of ITA Table 3.2.1.1. */
export declare const PLANE_POINT_GROUP_KEYS: readonly ["1", "2", "m", "2mm", "4", "4mm", "3", "3m", "6", "6mm"];
/** The key of a plane point group. */
export type PlanePointGroupKey = (typeof PLANE_POINT_GROUP_KEYS)[number];
/** The point group of a plane group and its setting: the key under which the plane group's symbol appears in `SOURCE`. */
export declare function planePointGroupOf(groupSymbol: string): {
    key: PlanePointGroupKey;
    setting: number;
};
/** True if `key` is the key of a plane point group. */
export declare function isPlanePointGroupKey(key: unknown): key is PlanePointGroupKey;
/** The number of settings of a plane point group: 2 for `3m`, otherwise 1. */
export declare function planePointGroupSettingCount(key: PlanePointGroupKey): number;
/** The symbol of a plane point group in a setting: `3m1` or `31m` for `3m`, otherwise the key. */
export declare function planePointGroupSymbol(key: PlanePointGroupKey, setting?: number): string;
/** The crystal system of a plane point group. */
export declare function planePointGroupSystem(key: PlanePointGroupKey): PlaneSystem;
/** The operations of a plane point group in a setting, in ITA's order, as operations without translation. */
export declare function planePointGroupOperations(key: PlanePointGroupKey, setting?: number): ExactOperation[];
/** The generators of a plane point group: the linear parts of ITA's selected generators of its symmorphic plane group. */
export declare function planePointGroupGenerators(key: PlanePointGroupKey, setting?: number): ExactOperation[];
