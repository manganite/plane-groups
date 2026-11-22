/**
 * Exact rational numbers for the translations of space and plane groups (CLAUDE.md, "Plane groups
 * (and later space groups)"). A rational is a pair [numerator, denominator] of safe integers with
 * a positive denominator and no common factor, so that two equal numbers have equal pairs. Every
 * intermediate product is checked: a result outside the safe integers throws instead of rounding.
 */
/** A rational number n/d: d > 0, gcd(n, d) = 1, both safe integers. */
export type Rational = readonly [numerator: number, denominator: number];
/** The rational 0. */
export declare const ZERO: Rational;
/** The rational 1. */
export declare const ONE: Rational;
/** Throws unless `value` is a safe integer. */
export declare function checkSafeInteger(value: number, what: string): number;
/** The product a·b of two safe integers; throws if it leaves the safe integers. */
export declare function safeProduct(a: number, b: number): number;
/** The sum a + b of two safe integers; throws if it leaves the safe integers. */
export declare function safeSum(a: number, b: number): number;
/** The rational n/d in lowest terms; throws if d is 0 or a part is not a safe integer. */
export declare function rational(numerator: number, denominator?: number): Rational;
/** The sum a + b. */
export declare function add(a: Rational, b: Rational): Rational;
/** The difference a − b. */
export declare function subtract(a: Rational, b: Rational): Rational;
/** The product a·b. */
export declare function multiply(a: Rational, b: Rational): Rational;
/** The product of an integer k and a rational a. */
export declare function scale(k: number, a: Rational): Rational;
/** The negative −a. */
export declare function negate(a: Rational): Rational;
/** True if a and b are the same number. */
export declare function rationalsEqual(a: Rational, b: Rational): boolean;
/** True if a is an integer. */
export declare function isInteger(a: Rational): boolean;
/** The representative of a modulo 1, in [0, 1). */
export declare function mod1(a: Rational): Rational;
/** The nearest double. */
export declare function toNumber(a: Rational): number;
/** Reads a rational as ITA prints it: an integer or a fraction such as `1/2` or `-2/3`. */
export declare function parseRational(text: string): Rational;
/** Writes a rational as ITA prints it: `0`, `1`, `-1/2`, `2/3`. */
export declare function formatRational(a: Rational): string;
