// Gemeinsame Helfer der Tests. Kein Test: `node --test tests/*.test.mjs` lädt die Datei nur über Importe.

/**
 * Wert, den der Test sicher erwartet (null oder undefined wäre ein Fehler, den der Test meldet).
 * @template T @param {T} x @returns {NonNullable<T>}
 */
export const da = (x) => /** @type {NonNullable<T>} */ (x);
