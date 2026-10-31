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
    orbit: false, // Bilder rund um die Zelle (wie ITA), Rand ORBIT_RAND in zeichnung.js
    musterElemente: false, // Symmetrieelemente in Tafel B
    warum: false, // Werkzeug „Warum ist das da?“: Antippen wählt ein Element
    erkl: null, // gewähltes Element (Schlüssel aus herkunft.js, z. B. „m;1/4,0;0,1“)
    aufbau: 0, // Aufbau aus Erzeugenden: 0 aus, sonst Schritt 1, 2, …
    schritt: 0, // Schritt für Schritt: 0 aus, sonst Operation 1 … N der ITA-Liste, N + 1 Gittertranslationen
    aeTeile: [], // angetippte Bedingungen der asymmetrischen Einheit (Nummern ab 0, aufsteigend)
    gitter: JSON.parse(JSON.stringify(GITTER_START)),
  };
}

const SYMBOLE = new Set(EBENENGRUPPEN.map((g) => g.symbol));
const B = (v) => (v ? '1' : '0');
const an = (s) => s === '1' || s === 'ja' || s === 'true';
/** Zahl aus der Adresse („0.25“ oder Bruch „1/3“); fehlend, leer oder ausserhalb [lo, hi]: null. */
function zahl(s, lo, hi) {
  if (s === null || s === undefined || String(s).trim() === '') return null;
  const m = String(s).trim().match(/^(-?\d+)\/(\d+)$/);
  const v = m ? Number(m[1]) / Number(m[2]) : Number(s);
  return Number.isFinite(v) && v >= lo && v <= hi ? v : null;
}
const kurz = (v, n = 4) => String(Number(v.toFixed(n)));
/**
 * Koordinate für die Adresse: exakt als Bruch, wenn sie einer mit kleinem Nenner ist (spezielle
 * Lagen wie 1/3 bleiben so beim Neuladen speziell), sonst mit sechs Stellen.
 */
export function koordText(v) {
  for (let n = 1; n <= 12; n++) {
    const z = Math.round(v * n);
    if (Math.abs(v - z / n) < 1e-9) return n === 1 ? String(z) : `${z}/${n}`;
  }
  return kurz(v, 6);
}
const systemVon = (id) => EBENENGRUPPEN.find((g) => g.symbol === id).system;

/** Schalter in der Adresse: Schlüssel → Feld im Zustand. */
const SCHALTER = [['el', 'elemente'], ['obj', 'objekt'], ['ae', 'ae'], ['farb', 'farben'], ['rast', 'einrasten'], ['mel', 'musterElemente'], ['orbit', 'orbit']];

/** Link-Adresse (Hash) zum Zustand. */
export function hashVon(z) {
  const s = startzustand();
  const q = new URLSearchParams();
  q.set('m', z.modus);
  q.set('g', z.gruppe);
  q.set('x', koordText(z.punkt[0]));
  q.set('y', koordText(z.punkt[1]));
  for (const [k, f] of SCHALTER) if (z[f] !== s[f]) q.set(k, B(z[f]));
  if (z.zellen !== s.zellen) q.set('zellen', String(z.zellen));
  if (z.form !== s.form) q.set('form', z.form);
  if (z.warum) q.set('warum', '1');
  if (z.erkl) q.set('erkl', z.erkl);
  if (z.aufbau > 0) q.set('aufbau', String(z.aufbau));
  if (z.schritt > 0) q.set('schritt', String(z.schritt));
  if (z.aeTeile?.length) q.set('aet', z.aeTeile.join(','));
  const sys = systemVon(z.gruppe);
  for (const k of FREI[sys]) {
    const v = z.gitter[sys][k];
    if (Math.abs(v - GITTER_START[sys][k]) > 1e-9) q.set(k, kurz(v, 3));
  }
  // lesbar: Brüche (x=1/3) und Elementschlüssel (erkl=m;1/4,0;0,1)
  return '#' + q.toString().replace(/%2F/g, '/').replace(/%3B/g, ';').replace(/%2C/g, ',');
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
  // Koordinaten einzeln: eine fehlende behält ihren Startwert
  const x = zahl(q.get('x'), -1e6, 1e6); const y = zahl(q.get('y'), -1e6, 1e6);
  z.punkt = [x ?? s.punkt[0], y ?? s.punkt[1]];
  for (const [k, f] of SCHALTER) if (q.has(k)) z[f] = an(q.get(k));
  if (q.get('zellen') === '2') z.zellen = 2;
  if (['fahne', 'komma'].includes(q.get('form'))) z.form = q.get('form');
  if (q.has('warum')) z.warum = an(q.get('warum'));
  const erkl = q.get('erkl');
  if (erkl && /^([2346];-?[\d/]+,-?[\d/]+|[mg];-?[\d/]+,-?[\d/]+;-?\d+,-?\d+)$/.test(erkl)) z.erkl = erkl;
  const aufbau = zahl(q.get('aufbau'), 0, 20);
  if (aufbau !== null && Number.isInteger(aufbau)) z.aufbau = aufbau;
  const schritt = zahl(q.get('schritt'), 0, 25);
  if (schritt !== null && Number.isInteger(schritt)) z.schritt = schritt;
  // Bedingungen der asymmetrischen Einheit: höchstens so viele, wie die Gruppe hat
  const aet = q.get('aet');
  if (aet && /^\d(,\d)*$/.test(aet)) {
    const zahlTeile = EBENENGRUPPEN.find((d) => d.symbol === z.gruppe).ae.text.split(';').length;
    z.aeTeile = [...new Set(aet.split(',').map(Number))].filter((i) => i < zahlTeile).sort((a, b) => a - b);
  }
  const sys = systemVon(z.gruppe);
  z.gitter[sys] = { ...GITTER_START[sys] };
  for (const k of FREI[sys]) {
    const v = zahl(q.get(k), ...GITTER_BEREICH[k]);
    if (v !== null) z.gitter[sys][k] = v;
  }
  return true;
}
