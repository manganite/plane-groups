// Zustand der App und seine Link-Adresse (#m=eg&g=p4gm&x=0.12&y=0.31 …).
// Die Link-Adressen sind eine Schnittstelle (Skript, Quiz, andere Apps): Format im README,
// stabil, durch tests/zustand.test.mjs abgesichert. Geschrieben wird nur, was vom Startzustand
// abweicht; ein Link stellt genau diese Ansicht her.

import { EBENENGRUPPEN } from './ebenengruppen.js';

/** Gittermetrik je Kristallsystem: b/a und γ (Grad). Frei nur, wo das System es erlaubt. */
export const GITTER_START = {
  schiefwinklig: { ba: 1.25, gamma: 105 },
  rechteckig: { ba: 1.35, gamma: 90 },
  quadratisch: { ba: 1, gamma: 90 },
  hexagonal: { ba: 1, gamma: 120 },
};
/** Bereiche der Regler (eigene Festlegung der App, so dass keine höhere Symmetrie entsteht). */
export const GITTER_BEREICH = {
  ba: [0.6, 1.6],
  gamma: [95, 125],
};
/** Freie Gitterparameter je System. */
export const FREI = {
  schiefwinklig: ['ba', 'gamma'],
  rechteckig: ['ba'],
  quadratisch: [],
  hexagonal: [],
};

/** Startzustand. */
export function startzustand() {
  return {
    modus: 'eg',
    gruppe: 'p2mg',
    punkt: [0.12, 0.31], // Objekt in allgemeiner Lage, Bruchkoordinaten
    elemente: true, // Symmetrieelemente in Tafel A
    objekt: true, // Objekt mit allen Bildern
    ae: false, // asymmetrische Einheit
    zellen: 1, // 1 oder 2 (2 × 2 Zellen) in Tafel A
    form: 'fahne', // 'fahne' oder 'komma'
    farben: true, // nach Blickrichtung färben
    einrasten: true,
    musterElemente: false, // Symmetrieelemente in Tafel B
    gitter: JSON.parse(JSON.stringify(GITTER_START)),
  };
}

const SYMBOLE = new Set(EBENENGRUPPEN.map((g) => g.symbol));
const B = (v) => (v ? '1' : '0');
const an = (s) => s === '1' || s === 'ja' || s === 'true';
const zahl = (s, lo, hi) => { const v = Number(s); return Number.isFinite(v) && v >= lo && v <= hi ? v : null; };
const kurz = (v, n = 4) => String(Number(v.toFixed(n)));
const systemVon = (id) => EBENENGRUPPEN.find((g) => g.symbol === id).system;

/** Schalter in der Adresse: Schlüssel → Feld im Zustand. */
const SCHALTER = [['el', 'elemente'], ['obj', 'objekt'], ['ae', 'ae'], ['farb', 'farben'], ['rast', 'einrasten'], ['mel', 'musterElemente']];

/** Link-Adresse (Hash) zum Zustand. */
export function hashVon(z) {
  const s = startzustand();
  const q = new URLSearchParams();
  q.set('m', z.modus);
  q.set('g', z.gruppe);
  q.set('x', kurz(z.punkt[0]));
  q.set('y', kurz(z.punkt[1]));
  for (const [k, f] of SCHALTER) if (z[f] !== s[f]) q.set(k, B(z[f]));
  if (z.zellen !== s.zellen) q.set('zellen', String(z.zellen));
  if (z.form !== s.form) q.set('form', z.form);
  const sys = systemVon(z.gruppe);
  for (const k of FREI[sys]) {
    const v = z.gitter[sys][k];
    if (Math.abs(v - GITTER_START[sys][k]) > 1e-9) q.set(k, kurz(v, 3));
  }
  return '#' + q.toString();
}

/**
 * Link-Adresse auf einen Zustand anwenden. Unbekannte oder ungültige Werte werden ignoriert
 * (der Startwert bleibt). Gibt false zurück, wenn der Hash keinen Modus enthält.
 */
export function hashAnwenden(z, hash) {
  const q = new URLSearchParams(String(hash).replace(/^#/, ''));
  if (!q.has('m')) return false;
  const s = startzustand();
  Object.assign(z, s, { gitter: JSON.parse(JSON.stringify(z.gitter ?? s.gitter)) });
  if (q.get('m') === 'eg') z.modus = 'eg';
  if (SYMBOLE.has(q.get('g'))) z.gruppe = q.get('g');
  const x = zahl(q.get('x'), -1e6, 1e6); const y = zahl(q.get('y'), -1e6, 1e6);
  if (x !== null && y !== null && q.get('x') !== '' && q.get('y') !== '') z.punkt = [x, y];
  for (const [k, f] of SCHALTER) if (q.has(k)) z[f] = an(q.get(k));
  if (q.get('zellen') === '2') z.zellen = 2;
  if (['fahne', 'komma'].includes(q.get('form'))) z.form = q.get('form');
  const sys = systemVon(z.gruppe);
  z.gitter[sys] = { ...GITTER_START[sys] };
  for (const k of FREI[sys]) {
    const v = zahl(q.get(k), ...GITTER_BEREICH[k]);
    if (v !== null) z.gitter[sys][k] = v;
  }
  return true;
}
