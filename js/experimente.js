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

/** Kartesische Koordinaten in Einheiten von a (hexagonal γ = 120°, sonst rechtwinklig mit b = a). @param {Vec2} p @param {boolean} hex @returns {Vec2} */
const kart = (p, hex) => (hex ? [p[0] - p[1] / 2, p[1] * Math.sqrt(3) / 2] : [p[0], p[1]]);

/** Abstand zweier Punkte modulo Gitter. @param {Vec2} a @param {Vec2} b @param {boolean} hex */
function abstand(a, b, hex) {
  let best = Infinity;
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
    const [x, y] = kart([a[0] - b[0] + i, a[1] - b[1] + j], hex);
    best = Math.min(best, Math.hypot(x, y));
  }
  return best;
}

/**
 * Abstand eines Punkts von einer Linie und ihren Bildern unter dem Gitter (Punkt und Richtung in Zellkoordinaten).
 * @param {Vec2} r @param {Vec2} punkt @param {Vec2} richtung @param {boolean} hex
 */
export function linienAbstand(r, punkt, richtung, hex) {
  const [dx, dy] = kart(richtung, hex);
  let best = Infinity;
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
    const [ux, uy] = kart([r[0] - punkt[0] + i, r[1] - punkt[1] + j], hex);
    best = Math.min(best, Math.abs(ux * dy - uy * dx) / Math.hypot(dx, dy));
  }
  return best;
}

/** @type {Map<string, ReturnType<typeof elemente>>} */
const ELEMENTE = new Map();
/**
 * Wie gut die Bilder eines Punkts zu sehen sind: kleinster Abstand zweier Bilder an verschiedenen Stellen, zum
 * Rand der Zelle und zu den Drehpunkten und Spiegellinien, auf denen sie nicht liegen (gross: Fähnchen getrennt,
 * keines nahe einer Kante). Ein Punkt in allgemeiner Lage auf einer Gleitspiegellinie ist ausgeschlossen (-1): Er
 * sähe speziell aus. Gleitspiegellinien zählen sonst nicht, sie gehen ohnehin durch viele Stellen.
 * @param {import('./symmetrie.js').Gruppe} g @param {Vec2} p
 */
function sichtbarkeit(g, p) {
  const hex = g.daten.system === 'hexagonal';
  let el = ELEMENTE.get(g.daten.symbol);
  if (!el) { el = elemente(g); ELEMENTE.set(g.daten.symbol, el); }
  const b = bahn(g, p);
  const allgemein = b.length === g.ordnung;
  let m = Math.min(...b.flatMap((r) => [r[0], 1 - r[0], r[1], 1 - r[1]])) * 2;
  for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) m = Math.min(m, abstand(b[i], b[j], hex));
  for (const r of b) {
    for (const d of el.drehpunkte) { const a = abstand(r, d.punkt, hex); if (a > 1e-6) m = Math.min(m, 2 * a); }
    for (const l of el.linien) {
      const a = linienAbstand(r, l.punkt, l.richtung, hex);
      if (l.art === 'gleit') { if (allgemein && a < 1e-6) return -1; continue; }
      if (a > 1e-6) m = Math.min(m, 2 * a);
    }
  }
  return m;
}

/** Unter diesem Wert zeigt die Aufgabe das Objekt halb so gross, damit sich die Fähnchen nicht decken. */
export const KNAPP = 0.3;

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
  return `auf einem ${n}-zähligen Drehpunkt, durch den ${ZAHL[linien]} Spiegellinien gehen`;
}

/** Zahlwörter wie im Skript („vier Spiegellinien“). */
const ZAHL = ['keine', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs'];

/** @type {Map<string, { p: Vec2, wert: number } | null>} */
const PUNKTE = new Map();
/**
 * Punkt auf der Wyckoff-Lage b, dessen Bilder alle im Innern der Zelle liegen (nicht auf Kanten oder Ecken,
 * Entscheidung Thomas, 7.11.2026, #108), oder null, wenn die Lage keinen solchen Punkt hat (z. B. 0,0). Unter
 * den möglichen der am besten sichtbare (sichtbarkeit), mit seinem Wert.
 * @param {string} id Ebenengruppe @param {string} b Buchstabe
 */
export function punktImInnern(id, b) {
  const key = `${id}:${b}`;
  const da = PUNKTE.get(key);
  if (da !== undefined) return da;
  const g = gruppe(id);
  const w = /** @type {{ b: string, koord: string[] }} */ (g.daten.wyckoff.find((x) => x.b === b));
  const o = liesOp(w.koord[0]);
  /** @type {{ p: Vec2, wert: number } | null} */
  let best = null;
  const gesehen = new Set();
  for (const q of WERTE) {
    const p = /** @type {Vec2} */ (anwenden(o, /** @type {Vec2} */ (q)).map(mod1));
    const k = p.map((c) => c.toFixed(6)).join();
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    if (lage(g, p).buchstabe !== b || !bahn(g, p).every((r) => r.every((c) => c > 1e-6))) continue;
    const v = sichtbarkeit(g, p);
    if (v >= 0 && (!best || v > best.wert + 1e-9)) best = { p, wert: v };
  }
  PUNKTE.set(key, best);
  return best;
}

/**
 * Kann die Lage einen Punkt mit allen Bildern im Innern haben? Genau dann nicht, wenn eine Koordinate fest 0 ist
 * (z. B. „0,y“, „x,0“, „1/2,0“): Modulo Gitter bleibt der Punkt dann auf dem Rand. Aus den Daten, ohne Rechnung.
 * @param {{ koord: string[] }} w
 */
export const imInnernMoeglich = (w) => !w.koord.some((k) => k.split(',').some((c) => c.trim() === '0'));

/** Adresse und Kenndaten zu einem Parameter (Gruppe:Buchstabe). @param {string} param */
export function zaehligkeitDaten(param) {
  const [id, b] = param.split(':');
  const g = gruppe(id);
  const { p, wert } = /** @type {{ p: Vec2, wert: number }} */ (punktImInnern(id, b));
  const l = lage(g, p);
  return {
    id, b, p, wert, symbol: l.symbol, zaehligkeit: l.zaehligkeit, ordnung: g.ordnung,
    zentriert: g.zentr.length > 1, stellen: bahn(g, p).length,
    hash: `#m=eg&g=${id}&x=${koordText(p[0])}&y=${koordText(p[1])}${wert < KNAPP ? '&og=0.5' : ''}`,
  };
}

/** Frage zu Gruppe und Lagesymmetrie. @param {string} id @param {string} symbol */
const frage = (id, symbol) => `In ${symbolHTML(id)} liegt das Objekt ${ortText(symbol)}. An wie vielen Stellen je Elementarzelle liegen seine Bilder?`;

/**
 * Parameter: jede Wyckoff-Lage jeder Ebenengruppe ausser p1, deren Bilder im Innern der Zelle liegen können;
 * Lagen mit gleichem Wortlaut der Frage nur einmal. Aus den Daten (schnell, die Liste braucht sie beim Zeichnen).
 */
export const ZAEHLIGKEIT_PARAMS = einmal(/** @returns {string[]} */ () => {
  const gesehen = new Set();
  return EBENENGRUPPEN.filter((e) => e.symbol !== 'p1').flatMap((e) => e.wyckoff.filter(imInnernMoeglich)
    .filter((w) => { const f = frage(e.symbol, w.sym); if (gesehen.has(f)) return false; gesehen.add(f); return true; })
    .map((w) => `${e.symbol}:${w.b}`));
});

/**
 * Zwei Ablenker aus typischen Fehlern, ohne die richtige Zahl, jede höchstens einmal; nur Teiler der Zahl der
 * Operationen je Zelle (andere Zahlen sind unmöglich).
 * @param {number} richtig @param {number} n @param {number[]} kand
 */
function ablenker(richtig, n, kand) {
  /** @type {number[]} */
  const out = [];
  for (const x of kand) if (x !== richtig && Number.isInteger(x) && x >= 1 && n % x === 0 && !out.includes(x) && out.length < 2) out.push(x);
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
    const falsch = ablenker(d.zaehligkeit, d.ordnung, [d.ordnung, k, d.zaehligkeit * 2, d.zaehligkeit / 2, 1]);
    const zahlen = [d.zaehligkeit, ...falsch].sort((a, b) => b - a);
    const je = d.zentriert ? ' je Elementarzelle (mit der Zentrierung)' : ' je Elementarzelle';
    /** @type {Schritt} */
    const s = {
      frage: frage(d.id, d.symbol),
      vermutung: zahlen.map(an), richtig: zahlen.indexOf(d.zaehligkeit),
      handlung: { text: 'Objekt dorthin setzen', hash: d.hash },
      beobachtung: `${an(d.zaehligkeit).replace(/^an/, 'An')} Stelle${d.zaehligkeit === 1 ? '' : 'n'}.`,
      erklaerung: k === 1
        ? `Keine Operation ausser der Identität hält das Objekt fest; die ${d.ordnung} Operationen${je} bringen es an ${d.ordnung} verschiedene Stellen.`
        : `Die Lagesymmetrie ${lageHTML(d.symbol)} hat ${k} Operationen; sie halten das Objekt fest. Zähligkeit mal Ordnung der Lagesymmetrie ergibt die ${d.ordnung} Operationen${je}: ${d.zaehligkeit} · ${k} = ${d.ordnung}.`,
      skript: 'wyckoff',
    };
    return [s];
  },
};

/** Alle erzeugten Experimente. */
export const ERZEUGTE = [ZAEHLIGKEIT];
