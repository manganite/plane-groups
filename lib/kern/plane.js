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
import { describePlaneOperation } from './spaceGroups/describe.js';
import { planeAsymmetricUnit, planeCellElements } from './spaceGroups/cell.js';
import { toPlain } from './spaceGroups/affine.js';
import {} from './spaceGroups/planeGroupData.js';
import { PLANE_GROUP_KEYS as GROUP_KEYS, planeGroupEntry, planeGroupGenerators, planeGroupOperations, } from './spaceGroups/planeGroups.js';
import { PLANE_POINT_GROUP_KEYS, isPlanePointGroupKey, planePointGroupGenerators, planePointGroupOf, planePointGroupOperations, planePointGroupSettingCount, planePointGroupSymbol, planePointGroupSystem, } from './spaceGroups/planePointGroups.js';
import { planeOrbit, planeSiteSymmetry, planeWyckoffPositionOf } from './spaceGroups/positions.js';
import { parseRational, toNumber } from './spaceGroups/rational.js';
export { VERSION } from './version.js';
/** The short symbols of the 17 plane groups, in ITA's order (plane group n at index n − 1). */
export const PLANE_GROUP_KEYS = Object.freeze([...GROUP_KEYS]);
/** The keys of the 10 plane point groups, in the order of ITA Table 3.2.1.1. */
export const POINT_GROUP_KEYS = Object.freeze([...PLANE_POINT_GROUP_KEYS]);
// ---------------------------------------------------------------------------------------------
const numbers = (v) => v.map(toNumber);
function isPlaneGroupKey(key) {
    return typeof key === 'string' && GROUP_KEYS.includes(key);
}
function unknownKey(key, what = 'plane group or plane point group') {
    throw new RangeError(`Unknown ${what}: ${JSON.stringify(key)}`);
}
/** The plane group of a key; throws for a point group or an unknown key. */
function groupKey(key, what) {
    if (isPlaneGroupKey(key))
        return key;
    if (isPlanePointGroupKey(key)) {
        throw new RangeError(`${what} takes the key of a plane group, not of the point group ${key}`);
    }
    return unknownKey(key, 'plane group');
}
/** The key of a plane point group; throws for a plane group or an unknown key. */
function pointKey(key, what) {
    if (isPlanePointGroupKey(key))
        return key;
    if (isPlaneGroupKey(key)) {
        throw new RangeError(`${what} takes the key of a plane point group; ${key} is a plane group (planeGroup)`);
    }
    return unknownKey(key, 'plane point group');
}
function settingOf(options) {
    return options?.setting;
}
/** The exact operations for a key: a plane group (setting 1 only) or a point group in a setting. */
function exact(key, options, generatorsOnly) {
    const setting = settingOf(options);
    if (isPlaneGroupKey(key)) {
        if (setting !== undefined && setting !== 1) {
            throw new RangeError(`The plane group ${key} has no setting ${String(setting)}`);
        }
        return generatorsOnly ? planeGroupGenerators(key) : planeGroupOperations(key);
    }
    if (isPlanePointGroupKey(key)) {
        return generatorsOnly ? planePointGroupGenerators(key, setting) : planePointGroupOperations(key, setting);
    }
    return unknownKey(key);
}
const plain = (op) => {
    const { matrix, translation } = toPlain(op);
    return Object.freeze({
        matrix: Object.freeze(matrix.map((row) => Object.freeze([...row]))),
        translation: Object.freeze([...translation]),
    });
};
/** The plane group with this key (short symbol). Throws a RangeError for an unknown key. */
export function planeGroup(key) {
    const entry = planeGroupEntry(groupKey(key, 'planeGroup'));
    const point = planePointGroupOf(entry.symbol);
    return Object.freeze({
        key: entry.symbol,
        number: entry.number,
        fullSymbol: entry.fullSymbol,
        pointGroup: point.key,
        pointGroupSetting: point.setting,
        crystalSystem: entry.system,
        centring: Object.freeze(entry.centring.map((t) => Object.freeze(t.split(',').map((c) => toNumber(parseRational(c)))))),
        origin: entry.origin,
        order: planeGroupOperations(entry.symbol).length,
    });
}
/** The plane point group with this key. Throws a RangeError for an unknown key. */
export function pointGroup(key) {
    const k = pointKey(key, 'pointGroup');
    return Object.freeze({ key: k, crystalSystem: planePointGroupSystem(k), order: planePointGroupOperations(k).length });
}
/**
 * The settings of a plane point group: two for `3m` (`3m1`, the default, and `31m`), one for the
 * others. Throws a RangeError for an unknown key.
 */
export function settings(key) {
    const k = pointKey(key, 'settings');
    return Object.freeze(Array.from({ length: planePointGroupSettingCount(k) }, (_, i) => Object.freeze({ index: i + 1, symbol: planePointGroupSymbol(k, i + 1), default: i === 0 })));
}
/** The symbol of a plane point group in a setting: `'3m1'` or `'31m'` for `3m`, otherwise the key. */
export function symbol(key, options) {
    return planePointGroupSymbol(pointKey(key, 'symbol'), settingOf(options));
}
/**
 * The operations of a plane group or a plane point group, in ITA's order, identity first. A plane
 * group: one per coset of the integer translations, translations in [0, 1), the general position
 * as numbered, then for a centred group the same sequence with the centring added (the
 * "(1/2,1/2)+ set"). A point group: the linear parts of its symmorphic plane group (pm for m,
 * p3m1 and p31m for the settings of 3m), translation zero. Throws a RangeError for an unknown key
 * or setting.
 */
export function operations(key, options) {
    return Object.freeze(exact(key, options, false).map(plain));
}
/**
 * ITA's selected generators, in printed order, without the identity and the integer translations:
 * for a centred plane group the centring translation first. A point group: the linear parts of the
 * generators of its symmorphic plane group. Throws a RangeError for an unknown key or setting.
 */
export function generators(key, options) {
    return Object.freeze(exact(key, options, true).map(plain));
}
/**
 * Each operation of `operations` (same key and setting) described geometrically, index for index:
 * what it is, its order and sense, where its symmetry element lies, its glide part. Throws a
 * RangeError for an unknown key or setting.
 */
export function describeOperations(key, options) {
    return Object.freeze(exact(key, options, false).map((op) => {
        const d = describePlaneOperation(op);
        return Object.freeze({
            kind: d.kind,
            order: d.order,
            ...(d.sense ? { sense: d.sense } : {}),
            ...(d.translation ? { translation: Object.freeze(numbers(d.translation)) } : {}),
            ...(d.location ? { location: Object.freeze(numbers(d.location)) } : {}),
            ...(d.direction ? { direction: Object.freeze([...d.direction]) } : {}),
            ...(d.glide ? { glide: Object.freeze(numbers(d.glide)) } : {}),
        });
    }));
}
/**
 * The Wyckoff positions of a plane group as ITA prints them, general position first. Throws a
 * RangeError for an unknown key and for a plane point group, whose positions are not in symcrys
 * yet.
 */
export function wyckoffPositions(key) {
    const entry = planeGroupEntry(groupKey(key, 'wyckoffPositions'));
    return Object.freeze(entry.wyckoff.map(([multiplicity, letter, siteSymmetry, coordinates]) => Object.freeze({ letter, multiplicity, siteSymmetry, coordinates: Object.freeze([...coordinates]) })));
}
/**
 * The site symmetry of a point (lattice basis) under a plane group: the operations that map it
 * onto itself modulo the lattice within the tolerance, closed into a group, and the point set onto
 * their fixed space. Throws a RangeError for an unknown key, a point that is not two finite
 * numbers, or a tolerance outside (0, 1/2).
 */
export function siteSymmetry(key, point, options) {
    const site = planeSiteSymmetry(groupKey(key, 'siteSymmetry'), point, options);
    return Object.freeze({
        operations: Object.freeze([...site.operations]),
        point: Object.freeze([...site.point]),
        multiplicity: site.multiplicity,
        general: site.operations.length === 1,
    });
}
/**
 * The Wyckoff position of a point (lattice basis) under a plane group, as `wyckoffPositions` gives
 * it: the printed position of the point's multiplicity whose coordinates, with the centring, reach
 * the point set onto its site symmetry. Throws a RangeError as `siteSymmetry`.
 */
export function wyckoffPositionOf(key, point, options) {
    const k = groupKey(key, 'wyckoffPositionOf');
    const { letter } = planeWyckoffPositionOf(k, point, options);
    const found = wyckoffPositions(k).find((w) => w.letter === letter);
    if (!found)
        throw new Error(`No Wyckoff position ${letter} in ${k}`);
    return found;
}
/**
 * The orbit of a point (lattice basis) under a plane group: its distinct images in the
 * conventional cell, each in [0, 1), in the order of the operations that first give them; images
 * that coincide within the tolerance are merged. Throws a RangeError as `siteSymmetry`.
 */
export function orbit(key, point, options) {
    return Object.freeze(planeOrbit(groupKey(key, 'orbit'), point, options).map((p) => Object.freeze(p)));
}
/**
 * The asymmetric unit of a plane group as ITA prints it: a convex polygon given by its vertices and,
 * per edge, the printed inequality that holds it. Throws a RangeError for an unknown key.
 */
export function asymmetricUnit(key) {
    const unit = planeAsymmetricUnit(groupKey(key, 'asymmetricUnit'));
    return Object.freeze({
        vertices: Object.freeze(unit.vertices.map((v) => Object.freeze(numbers(v)))),
        inequalities: Object.freeze(unit.inequalities.map((q) => Object.freeze([...q]))),
    });
}
/**
 * The symmetry elements of a plane group in its conventional cell [0, 1]², boundary included:
 * every rotation centre with the highest order of a rotation about it, and every mirror and glide
 * line that crosses the cell, with the segment inside it. Throws a RangeError for an unknown key.
 */
export function symmetryElements(key) {
    const e = planeCellElements(groupKey(key, 'symmetryElements'));
    return Object.freeze({
        rotations: Object.freeze(e.rotations.map((r) => Object.freeze({ order: r.order, point: Object.freeze(numbers(r.point)) }))),
        lines: Object.freeze(e.lines.map((l) => Object.freeze({
            kind: l.kind,
            direction: Object.freeze([...l.direction]),
            glide: Object.freeze(numbers(l.glide)),
            segment: Object.freeze(l.segment.map((p) => Object.freeze(numbers(p)))),
        }))),
    });
}
