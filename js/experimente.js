// Erzeugte Experimente (crystallography-common#92): je Art viele Aufgaben aus den Daten der App, wie die Generatoren
// im Quiz. Die Aussagen rechnet die App mit denselben Funktionen wie die Darstellung; ein Test prüft sie für jeden
// Parameter (tests/ablauf.test.mjs). Die festen Experimente stehen in js/hilfetexte.js.
import { EBENENGRUPPEN } from './ebenengruppen.js';
import { gruppe, lage, bahn, liesOp, anwenden, mod1, elemente } from './symmetrie.js';
import { koordText } from './zustand.js';
import { symbolHTML, lageHTML } from './text.js';

/** @import { Erzeugt, Schritt } from '../lib/common/js/ablauf.js' */
/** @import { Vec2 } from '../lib/common/js/typen.js' */

/**
 * Ergebnis beim ersten Aufruf berechnen und merken (die Parameter erst bei Bedarf, nicht beim Laden).
 * @template T @param {() => T} f @returns {() => T}
 */
function einmal(f) {
  /** @type {{ v: T } | null} */
  let c = null;
  return () => (c ??= { v: f() }).v;
}

/** Werte für die freien Parameter einer Wyckoff-Lage: Brüche mit kleinem Nenner (die Adresse bleibt exakt). */
const WERTE = [5, 8, 10, 12].flatMap((n) => Array.from({ length: (n - 1) * (n - 1) }, (_, i) => [(1 + (i % (n - 1))) / n, (1 + Math.floor(i / (n - 1))) / n]));

/**
 * Abstand zweier Punkte in Zellkoordinaten, modulo Gitter; hexagonal mit γ = 120°, sonst wie rechtwinklig
 * (für die Wahl gut sichtbarer Punkte genügt das).
 * @param {Vec2} a @param {Vec2} b @param {boolean} hex
 */
function abstand(a, b, hex) {
  let best = Infinity;
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
    const dx = a[0] - b[0] + i, dy = a[1] - b[1] + j;
    best = Math.min(best, Math.sqrt(hex ? dx * dx + dy * dy - dx * dy : dx * dx + dy * dy));
  }
  return best;
}

/** @type {Map<string, ReturnType<typeof elemente>>} */
const ELEMENTE = new Map();
/**
 * Wie gut die Bilder eines Punkts zu sehen sind: kleinster Abstand zweier Bilder an verschiedenen Stellen, zum
 * Rand der Zelle und zu den Symmetrieelementen, auf denen sie nicht liegen (gross: Fähnchen getrennt, keines nahe
 * einer Kante, und kein allgemeiner Punkt sieht aus, als läge er auf einer Gleitspiegellinie).
 * @param {import('./symmetrie.js').Gruppe} g @param {Vec2} p
 */
function sichtbarkeit(g, p) {
  const hex = g.daten.system === 'hexagonal';
  let el = ELEMENTE.get(g.daten.symbol);
  if (!el) { el = elemente(g); ELEMENTE.set(g.daten.symbol, el); }
  const b = bahn(g, p);
  let m = Math.min(...b.flatMap((r) => [r[0], 1 - r[0], r[1], 1 - r[1]])) * 2;
  for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) m = Math.min(m, abstand(b[i], b[j], hex));
  for (const r of b) {
    for (const d of el.drehpunkte) { const a = abstand(r, d.punkt, hex); if (a > 1e-6) m = Math.min(m, 2 * a); }
    for (const l of el.linien) {
      const n = Math.hypot(l.normale[0], l.normale[1]);
      const a = Math.abs((r[0] - l.punkt[0]) * l.normale[0] + (r[1] - l.punkt[1]) * l.normale[1]) / n;
      // eine Spiegellinie durch das Bild hält es fest (spezielle Lage); eine Gleitspiegellinie nie
      if (a > 1e-6 || l.art === 'gleit') m = Math.min(m, 2 * a);
    }
  }
  return m;
}

/**
 * Lagesymmetrie in Achse und Zahl der Spiegellinien (die Symbole sind orientiert, z. B. „.m.“, „2mm“, „4..“).
 * @param {string} symbol
 */
export function lageteile(symbol) {
  const s = symbol.replace(/\./g, '');
  const n = Math.max(1, ...[...s].filter((c) => /\d/.test(c)).map(Number));
  const spiegel = [...s].filter((c) => c === 'm').length;
  // 4mm, 6mm: die Symbole nennen je Blickrichtung eine Sorte; durch den Punkt gehen n Spiegellinien
  const linien = !spiegel ? 0 : n === 1 ? 1 : n === 2 ? 2 : n;
  return { n, linien, ordnung: n * (linien ? 2 : 1) };
}

/** Ort des Objekts in Worten, nach seiner Lagesymmetrie. @param {string} symbol */
export function ortText(symbol) {
  const { n, linien } = lageteile(symbol);
  if (n === 1) return linien ? 'auf einer Spiegellinie' : 'in allgemeiner Lage, also auf keinem Symmetrieelement';
  if (!linien) return `auf einem ${n}-zähligen Drehpunkt`;
  return `auf einem ${n}-zähligen Drehpunkt, durch den ${linien} Spiegellinien gehen`;
}

/**
 * Punkt auf der Wyckoff-Lage b, dessen Bilder alle im Innern der Zelle liegen (nicht auf Kanten oder Ecken,
 * Entscheidung Thomas, 7.11.2026, #108), oder null, wenn die Lage keinen solchen Punkt hat (z. B. 0,0). Unter
 * den möglichen der, dessen Bilder am weitesten auseinander und vom Rand der Zelle weg liegen.
 * @param {string} id Ebenengruppe @param {string} b Buchstabe
 * @returns {Vec2 | null}
 */
export function punktImInnern(id, b) {
  const g = gruppe(id);
  const w = /** @type {{ b: string, koord: string[] }} */ (g.daten.wyckoff.find((x) => x.b === b));
  const o = liesOp(w.koord[0]);
  /** @type {Vec2 | null} */
  let best = null, wert = -1;
  const gesehen = new Set();
  for (const q of WERTE) {
    const p = /** @type {Vec2} */ (anwenden(o, /** @type {Vec2} */ (q)).map(mod1));
    const k = p.map((c) => c.toFixed(6)).join();
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    if (lage(g, p).buchstabe !== b || !bahn(g, p).every((r) => r.every((c) => c > 1e-6))) continue;
    const v = sichtbarkeit(g, p);
    if (v > wert + 1e-9) { best = p; wert = v; }
  }
  return best;
}

/** Adresse und Kenndaten zu einem Parameter (Gruppe:Buchstabe). @param {string} param */
export function zaehligkeitDaten(param) {
  const [id, b] = param.split(':');
  const g = gruppe(id);
  const p = /** @type {Vec2} */ (punktImInnern(id, b));
  const l = lage(g, p);
  return {
    id, b, p, symbol: l.symbol, zaehligkeit: l.zaehligkeit, ordnung: g.ordnung,
    zentriert: g.zentr.length > 1, stellen: bahn(g, p).length,
    hash: `#m=eg&g=${id}&x=${koordText(p[0])}&y=${koordText(p[1])}`,
  };
}

/** Frage zu einem Parameter. @param {string} param */
const frage = (param) => {
  const d = zaehligkeitDaten(param);
  return `In ${symbolHTML(d.id)} liegt das Objekt ${ortText(d.symbol)}. An wie vielen Stellen je Elementarzelle liegen seine Bilder?`;
};

/**
 * Parameter: jede Wyckoff-Lage jeder Ebenengruppe ausser p1, die einen Punkt mit Bildern nur im Innern der Zelle
 * hat; Lagen mit gleichem Wortlaut der Frage nur einmal.
 */
export const ZAEHLIGKEIT_PARAMS = einmal(/** @returns {string[]} */ () => {
  const gesehen = new Set();
  return EBENENGRUPPEN.flatMap((e) => e.wyckoff.map((w) => `${e.symbol}:${w.b}`))
    .filter((p) => { const [id, b] = p.split(':'); return gruppe(id).ordnung >= 2 && punktImInnern(id, b) !== null; })
    .filter((p) => { const f = frage(p); if (gesehen.has(f)) return false; gesehen.add(f); return true; });
});

/**
 * Zwei Ablenker aus typischen Fehlern, ohne die richtige Zahl, jede höchstens einmal, zwischen 1 und der Zahl der
 * Operationen je Zelle.
 * @param {number} richtig @param {number} n @param {number[]} kand
 */
function ablenker(richtig, n, kand) {
  /** @type {number[]} */
  const out = [];
  for (const x of kand) if (x !== richtig && Number.isInteger(x) && x >= 1 && x <= n && !out.includes(x) && out.length < 2) out.push(x);
  return out;
}

/** @param {number} x */
const an = (x) => (x === 1 ? 'an einer' : `an ${x}`);

/** @type {Erzeugt} */
export const ZAEHLIGKEIT = {
  id: 'zaehligkeit', modus: 'eg', titel: 'An wie vielen Stellen?',
  params: ZAEHLIGKEIT_PARAMS,
  make(param) {
    const d = zaehligkeitDaten(param);
    const k = lageteile(d.symbol).ordnung;
    // typische Fehler: Lage vergessen (alle Operationen), Ordnung der Lagesymmetrie, doppelt bzw. halb so viele
    const falsch = ablenker(d.zaehligkeit, d.ordnung, [d.ordnung, d.zaehligkeit * 2, d.zaehligkeit / 2, k, 1]);
    const zahlen = [d.zaehligkeit, ...falsch].sort((a, b) => b - a);
    const je = d.zentriert ? ' je Elementarzelle (mit der Zentrierung)' : ' je Elementarzelle';
    /** @type {Schritt} */
    const s = {
      frage: frage(param),
      vermutung: zahlen.map(an), richtig: zahlen.indexOf(d.zaehligkeit),
      handlung: { text: 'Objekt dorthin setzen', hash: d.hash },
      beobachtung: `${an(d.zaehligkeit).replace(/^an/, 'An')} Stelle${d.zaehligkeit === 1 ? '' : 'n'}.`,
      erklaerung: k === 1
        ? `Jede der ${d.ordnung} Operationen${je} bringt das Objekt an eine andere Stelle.`
        : `Die Lagesymmetrie ${lageHTML(d.symbol)} hat ${k} Operationen; sie halten das Objekt fest. Zähligkeit mal Ordnung der Lagesymmetrie ergibt die ${d.ordnung} Operationen${je}: ${d.zaehligkeit} · ${k} = ${d.ordnung}.`,
      skript: 'wyckoff',
    };
    return [s];
  },
};

/** Alle erzeugten Experimente. */
export const ERZEUGTE = [ZAEHLIGKEIT];
