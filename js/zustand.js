// Zustand der App und seine Link-Adresse (#m=eg&g=p4gm&x=0.12&y=0.31 …).
// Die Link-Adressen sind eine Schnittstelle (Skript, Quiz, andere Apps): Format im README,
// stabil, durch tests/zustand.test.mjs abgesichert. Geschrieben wird nur, was vom Startzustand
// abweicht; ein Link stellt genau diese Ansicht her.

import { EBENENGRUPPEN } from './ebenengruppen.js';
import { VORGABEN, vorgabe } from './vorgaben.js';
import { MOTIVE } from './motive.js';

/** Formen des Objekts (wie FORMEN in zeichnung.js; tests/zustand.test.mjs prüft die Übereinstimmung). */
export const FORMEN = ['fahne', 'komma', 'blatt', 'tropfen', 'ranke'];

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
/** Bereiche der Regler beim Brechen der Symmetrie (alle Metriken ausser fast entarteten). */
export const FREI_BEREICH = {
  ba: [0.5, 2],
  gamma: [60, 150],
};
/** Freie Gitterparameter je System. */
export const FREI = {
  schiefwinklig: ['ba', 'gamma'],
  rechteckig: ['ba'],
  quadratisch: [],
  hexagonal: [],
};

/** Bereiche der Regler im Modus „Gitter und Basis“ (wie beim Brechen der Symmetrie). */
export const STRUKTUR_BEREICH = { ba: [0.5, 2], gamma: [60, 150], groesse: [0.02, 1] };
/** Höchstzahl der Motive in der Basis. */
export const BASIS_GRENZE = 48;
/** Bereiche der Vergrösserung des Musters und der Grösse des Objekts. */
export const ZOOM_BEREICH = [1, 3];
export const OBJ_BEREICH = [0.5, 2.5];
export const STRUKTUR_START = 'dreieck1';
const kopie = (x) => JSON.parse(JSON.stringify(x));

/** Struktur im Modus „Gitter und Basis“ aus einer Vorgabe (vorgaben.js). */
export function strukturStart(id = STRUKTUR_START) {
  const v = vorgabe(id) ?? vorgabe(STRUKTUR_START);
  return { vorgabe: v.id, ba: v.gitter.ba, gamma: v.gitter.gamma, basis: kopie(v.basis), elemente: true, zelle: true, ae: false, bindungen: true };
}
/** Gleicht die Struktur (Gitter und Basis) noch ihrer Vorgabe? */
export function wieVorgabe(st) {
  const v = vorgabe(st.vorgabe);
  if (!v || Math.abs(v.gitter.ba - st.ba) > 1e-9 || Math.abs(v.gitter.gamma - st.gamma) > 1e-9 || v.basis.length !== st.basis.length) return false;
  return v.basis.every((e, i) => {
    const f = st.basis[i];
    return e.motiv === f.motiv && (e.farbe ?? 0) === (f.farbe ?? 0) && Math.abs(e.p[0] - f.p[0]) < 1e-9 && Math.abs(e.p[1] - f.p[1]) < 1e-9
      && Math.abs((e.winkel ?? 0) - (f.winkel ?? 0)) < 1e-9 && Math.abs((e.groesse ?? MOTIVE[e.motiv].groesse) - (f.groesse ?? MOTIVE[f.motiv].groesse)) < 1e-9;
  });
}

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
    form: 'fahne', // eine der FORMEN: Fähnchen, Kreis mit Komma (ITA) oder ein Ornament
    tapete: false, // Muster (Tafel B) als Tapete: ohne Zelle und Elemente, grösserer Ausschnitt, einfarbig
    zoomB: 1, // Vergrösserung des Musters (Tafel B): kleinerer Ausschnitt, alles grösser (ZOOM_BEREICH)
    objGroesse: 1, // Grösse des Objekts (Fähnchen, Ornament) in beiden Tafeln (OBJ_BEREICH)
    farben: true, // nach Blickrichtung färben
    einrasten: true,
    lupe: false, // Tafel A vergrössert (LUPE in zeichnung.js) um das Objekt
    orbit: false, // Bilder rund um die Zelle (wie ITA), Rand ORBIT_RAND in zeichnung.js
    musterElemente: false, // Symmetrieelemente in Tafel B
    warum: false, // Werkzeug „Warum ist das da?“: Antippen wählt ein Element
    erkl: null, // gewähltes Element (Schlüssel aus herkunft.js, z. B. „m;1/4,0;0,1“)
    aufbau: 0, // Aufbau aus Erzeugenden: 0 aus, sonst Schritt 1, 2, …
    zeichnen: false, // Werkzeug „Zeichnen“ in Tafel A (nicht in der Link-Adresse)
    radieren: false, // Werkzeug „Radieren“ in Tafel A (nicht in der Link-Adresse)
    striche: [], // gezeichnete Striche in Bruchkoordinaten (nur im Browser gespeichert, nicht im Link)
    aeFuell: false, // asymmetrische Einheit gefüllt und vervielfältigt
    brechen: false, // Symmetrie brechen: Gitter ohne die Bindung des Kristallsystems
    frei: { ba: 1, gamma: 90 }, // freie Metrik beim Brechen
    schritt: 0, // Schritt für Schritt: 0 aus, sonst Operation 1 … N der ITA-Liste, N + 1 Gittertranslationen
    aeTeile: [], // angetippte Bedingungen der asymmetrischen Einheit (Nummern ab 0, aufsteigend)
    gitter: JSON.parse(JSON.stringify(GITTER_START)),
    struktur: strukturStart(), // Modus „Gitter und Basis“
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
const SCHALTER = [['el', 'elemente'], ['obj', 'objekt'], ['ae', 'ae'], ['farb', 'farben'], ['rast', 'einrasten'], ['mel', 'musterElemente'], ['orbit', 'orbit'], ['fuell', 'aeFuell'], ['tap', 'tapete'], ['lupe', 'lupe']];

/** Basis als Text: Motive durch „;“ getrennt, je motiv,farbe,x,y,winkel[,grösse]. */
export function basisText(basis) {
  return basis.map((e) => {
    const teile = [e.motiv, String(e.farbe ?? 0), koordText(e.p[0]), koordText(e.p[1]), kurz(e.winkel ?? 0, 3)];
    if (e.groesse !== undefined && Math.abs(e.groesse - MOTIVE[e.motiv].groesse) > 1e-9) teile.push(kurz(e.groesse, 4));
    return teile.join(',');
  }).join(';');
}
/** Umkehrung von basisText; ungültige Einträge fallen weg. */
export function liesBasis(text) {
  const out = [];
  for (const teil of String(text).split(';')) {
    const [motiv, farbe, x, y, winkel, groesse] = teil.split(',');
    if (!Object.hasOwn(MOTIVE, motiv ?? '')) continue;
    const f = zahl(farbe, 0, 3); const px = zahl(x, -1e3, 1e3); const py = zahl(y, -1e3, 1e3);
    const w = zahl(winkel ?? '0', -720, 720) ?? 0; const gr = groesse === undefined ? null : zahl(groesse, ...STRUKTUR_BEREICH.groesse);
    if (f === null || !Number.isInteger(f) || px === null || py === null) continue;
    const e = { motiv, farbe: f, p: [px, py], winkel: w };
    if (gr !== null) e.groesse = gr;
    out.push(e);
    if (out.length >= BASIS_GRENZE) break;
  }
  return out;
}

/**
 * Struktur aus dem Speicher des Browsers prüfen: gültige Kopie oder null. Anders als liesBasis()
 * bleiben die Zahlen unverändert (keine Rundung).
 */
export function pruefeStruktur(st) {
  if (!st || typeof st !== 'object' || !Array.isArray(st.basis)) return null;
  const im = (v, [lo, hi]) => Number.isFinite(v) && v >= lo && v <= hi;
  if (!im(st.ba, STRUKTUR_BEREICH.ba) || !im(st.gamma, STRUKTUR_BEREICH.gamma)) return null;
  const basis = st.basis.filter((e) => e && Object.hasOwn(MOTIVE, e.motiv) && Array.isArray(e.p) && e.p.length === 2 && e.p.every(Number.isFinite)
    && [0, 1, 2, 3].includes(e.farbe ?? 0) && Number.isFinite(e.winkel ?? 0) && (e.groesse === undefined || im(e.groesse, STRUKTUR_BEREICH.groesse)))
    .slice(0, BASIS_GRENZE)
    .map((e) => ({ motiv: e.motiv, farbe: e.farbe ?? 0, p: [...e.p], winkel: e.winkel ?? 0, ...(e.groesse === undefined ? {} : { groesse: e.groesse }) }));
  return {
    vorgabe: VORGABEN.some((v) => v.id === st.vorgabe) ? st.vorgabe : STRUKTUR_START, ba: st.ba, gamma: st.gamma, basis,
    elemente: st.elemente !== false, zelle: st.zelle !== false, ae: st.ae === true, bindungen: st.bindungen !== false,
  };
}

const STRUKTUR_SCHALTER = [['sel', 'elemente'], ['szelle', 'zelle'], ['sae', 'ae'], ['sbind', 'bindungen']];

/** Link-Adresse im Modus „Gitter und Basis“: Vorgabe (v=…) oder Gitter und Basis ausgeschrieben. */
function strukturHash(z, q) {
  const st = z.struktur; const s0 = strukturStart();
  if (wieVorgabe(st)) q.set('v', st.vorgabe);
  else {
    q.set('ba', kurz(st.ba, 3));
    q.set('gamma', kurz(st.gamma, 2));
    q.set('basis', basisText(st.basis));
  }
  for (const [k, f] of STRUKTUR_SCHALTER) if (st[f] !== s0[f]) q.set(k, B(st[f]));
}

/** Link-Adresse (Hash) zum Zustand. */
export function hashVon(z) {
  const s = startzustand();
  const q = new URLSearchParams();
  q.set('m', z.modus);
  if (z.modus === 'struktur') {
    strukturHash(z, q);
    return '#' + q.toString().replace(/%2F/g, '/').replace(/%3B/g, ';').replace(/%2C/g, ',');
  }
  q.set('g', z.gruppe);
  q.set('x', koordText(z.punkt[0]));
  q.set('y', koordText(z.punkt[1]));
  for (const [k, f] of SCHALTER) if (z[f] !== s[f]) q.set(k, B(z[f]));
  if (z.zellen !== s.zellen) q.set('zellen', String(z.zellen));
  if (z.zoomB !== s.zoomB) q.set('zoom', kurz(z.zoomB, 3));
  if (z.objGroesse !== s.objGroesse) q.set('og', kurz(z.objGroesse, 3));
  if (z.form !== s.form) q.set('form', z.form);
  if (z.warum) q.set('warum', '1');
  if (z.erkl) q.set('erkl', z.erkl);
  if (z.aufbau > 0) q.set('aufbau', String(z.aufbau));
  if (z.schritt > 0) q.set('schritt', String(z.schritt));
  if (z.aeTeile?.length) q.set('aet', z.aeTeile.join(','));
  const sys = systemVon(z.gruppe);
  if (z.brechen) {
    // Gitter ohne Bindung an das System: beide Parameter, auch wo sie dem Start gleichen
    q.set('brechen', '1');
    q.set('ba', kurz(z.frei.ba, 3));
    q.set('gamma', kurz(z.frei.gamma, 2));
  } else {
    for (const k of FREI[sys]) {
      const v = z.gitter[sys][k];
      if (Math.abs(v - GITTER_START[sys][k]) > 1e-9) q.set(k, kurz(v, 3));
    }
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
  // Gezeichnetes steht nicht im Link und bleibt beim Öffnen eines Links erhalten, ebenso die
  // Struktur im anderen Modus
  Object.assign(z, s, { gitter: JSON.parse(JSON.stringify(z.gitter ?? s.gitter)), striche: Array.isArray(z.striche) ? z.striche : [], struktur: z.struktur ?? s.struktur });
  if (q.get('m') === 'eg') z.modus = 'eg';
  if (q.get('m') === 'struktur') {
    // Modus „Gitter und Basis“: Vorgabe, darauf Gitter und Basis aus dem Link
    z.modus = 'struktur';
    const st = strukturStart(VORGABEN.some((v) => v.id === q.get('v')) ? q.get('v') : STRUKTUR_START);
    if (q.has('basis')) {
      st.basis = liesBasis(q.get('basis'));
      st.ba = zahl(q.get('ba'), ...STRUKTUR_BEREICH.ba) ?? 1;
      st.gamma = zahl(q.get('gamma'), ...STRUKTUR_BEREICH.gamma) ?? 90;
    }
    for (const [k, f] of STRUKTUR_SCHALTER) if (q.has(k)) st[f] = an(q.get(k));
    z.struktur = st;
    return true;
  }
  if (SYMBOLE.has(q.get('g'))) z.gruppe = q.get('g');
  // Koordinaten einzeln: eine fehlende behält ihren Startwert
  const x = zahl(q.get('x'), -1e6, 1e6); const y = zahl(q.get('y'), -1e6, 1e6);
  z.punkt = [x ?? s.punkt[0], y ?? s.punkt[1]];
  for (const [k, f] of SCHALTER) if (q.has(k)) z[f] = an(q.get(k));
  if (q.get('zellen') === '2') z.zellen = 2;
  z.zoomB = zahl(q.get('zoom'), ...ZOOM_BEREICH) ?? s.zoomB;
  z.objGroesse = zahl(q.get('og'), ...OBJ_BEREICH) ?? s.objGroesse;
  if (FORMEN.includes(q.get('form'))) z.form = q.get('form');
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
  // brechen=1: ba und gamma ohne Bindung an das System (im schiefwinkligen System ist nichts zu brechen)
  if (an(q.get('brechen') ?? '') && sys !== 'schiefwinklig') {
    z.brechen = true;
    const s0 = GITTER_START[sys];
    z.frei = { ba: zahl(q.get('ba'), ...FREI_BEREICH.ba) ?? s0.ba, gamma: zahl(q.get('gamma'), ...FREI_BEREICH.gamma) ?? s0.gamma };
    return true;
  }
  for (const k of FREI[sys]) {
    const v = zahl(q.get(k), ...GITTER_BEREICH[k]);
    if (v !== null) z.gitter[sys][k] = v;
  }
  return true;
}
