/**
 * The 17 plane groups as exact operations: the general position of ITA in its numbering, the
 * centring and ITA's selected generators (CLAUDE.md, "Plane groups (and later space groups)").
 * Internal for now; the entry point `symcrys/plane` comes later.
 */
import { type ExactOperation } from './affine.js';
import { type PlaneGroupEntry } from './planeGroupData.js';
/** The short symbols of the 17 plane groups, in ITA's order. */
export declare const PLANE_GROUP_KEYS: string[];
/** The printed data of a plane group, by short symbol (`'p2mg'`) or number (7); throws if unknown. */
export declare function planeGroupEntry(key: string | number): PlaneGroupEntry;
/** The centring translations of a plane group as operations, (0,0) first. */
export declare function centringOperations(entry: PlaneGroupEntry): ExactOperation[];
/**
 * The operations of a plane group, one per coset of the integer translations, translations in
 * [0, 1): the general position in ITA's numbering, then, for a centred group, the same sequence
 * with the centring (1/2, 1/2) added, as ITA prints the "(1/2,1/2)+ set". Throws if ITA's selected
 * generators, with the integer translations and the centring, do not give exactly this set, which
 * would be an error in the data.
 */
export declare function planeGroupOperations(key: string | number): ExactOperation[];
/**
 * ITA's "Generators selected" of a plane group as operations, in printed order: the centring
 * translation (for a centred group), then the operations named by number. The identity and the
 * integer translations, which begin the printed line, are left out.
 */
export declare function planeGroupGenerators(key: string | number): ExactOperation[];
