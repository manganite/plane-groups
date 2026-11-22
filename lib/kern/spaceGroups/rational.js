/**
 * Exact rational numbers for the translations of space and plane groups (CLAUDE.md, "Plane groups
 * (and later space groups)"). A rational is a pair [numerator, denominator] of safe integers with
 * a positive denominator and no common factor, so that two equal numbers have equal pairs. Every
 * intermediate product is checked: a result outside the safe integers throws instead of rounding.
 */
/** The rational 0. */
export const ZERO = [0, 1];
/** The rational 1. */
export const ONE = [1, 1];
function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        [x, y] = [y, x % y];
    }
    return x;
}
/** Throws unless `value` is a safe integer. */
export function checkSafeInteger(value, what) {
    if (!Number.isSafeInteger(value)) {
        throw new RangeError(`${what} must be a safe integer, not ${String(value)}`);
    }
    return value;
}
/** The product a·b of two safe integers; throws if it leaves the safe integers. */
export function safeProduct(a, b) {
    return checkSafeInteger(a * b, 'An intermediate product');
}
/** The sum a + b of two safe integers; throws if it leaves the safe integers. */
export function safeSum(a, b) {
    return checkSafeInteger(a + b, 'An intermediate sum');
}
/** The rational n/d in lowest terms; throws if d is 0 or a part is not a safe integer. */
export function rational(numerator, denominator = 1) {
    checkSafeInteger(numerator, 'Numerator');
    checkSafeInteger(denominator, 'Denominator');
    if (denominator === 0) {
        throw new RangeError('Denominator must not be 0');
    }
    const g = gcd(numerator, denominator);
    const sign = denominator < 0 ? -1 : 1;
    // `+ 0` turns −0 into 0, so that equal numbers have equal pairs.
    return [(sign * numerator) / g + 0, (sign * denominator) / g];
}
/** The sum a + b. */
export function add(a, b) {
    return rational(safeSum(safeProduct(a[0], b[1]), safeProduct(b[0], a[1])), safeProduct(a[1], b[1]));
}
/** The difference a − b. */
export function subtract(a, b) {
    return add(a, negate(b));
}
/** The product a·b. */
export function multiply(a, b) {
    return rational(safeProduct(a[0], b[0]), safeProduct(a[1], b[1]));
}
/** The product of an integer k and a rational a. */
export function scale(k, a) {
    return rational(safeProduct(k, a[0]), a[1]);
}
/** The negative −a. */
export function negate(a) {
    return rational(-a[0], a[1]);
}
/** True if a and b are the same number. */
export function rationalsEqual(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}
/** True if a is an integer. */
export function isInteger(a) {
    return a[1] === 1;
}
/** The representative of a modulo 1, in [0, 1). */
export function mod1(a) {
    const r = ((a[0] % a[1]) + a[1]) % a[1];
    return rational(r, a[1]);
}
/** The nearest double. */
export function toNumber(a) {
    return a[0] / a[1];
}
/** Reads a rational as ITA prints it: an integer or a fraction such as `1/2` or `-2/3`. */
export function parseRational(text) {
    const m = /^([+-]?\d+)(?:\/(\d+))?$/.exec(text.trim());
    if (!m) {
        throw new RangeError(`Not a rational number: "${text}"`);
    }
    return rational(Number(m[1]), m[2] === undefined ? 1 : Number(m[2]));
}
/** Writes a rational as ITA prints it: `0`, `1`, `-1/2`, `2/3`. */
export function formatRational(a) {
    return a[1] === 1 ? String(a[0]) : `${a[0]}/${a[1]}`;
}
