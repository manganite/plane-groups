// Zustand der App und seine Link-Adresse (#m=eg&g=p4gm&x=0.12&y=0.31 …).
// Die Link-Adressen sind eine Schnittstelle (Skript, Quiz, andere Apps): Format im README,
// stabil, durch tests/zustand.test.mjs abgesichert. Geschrieben wird nur, was vom Startzustand
// abweicht; ein Link stellt genau diese Ansicht her.

import { EBENENGRUPPEN } from './ebenengruppen.js';
import { VORGABEN, vorgabe } from './vorgaben.js';
import { MOTIVE, chiral } from './motive.js';
import { grad, STRICH_GRENZE } from './zeichnung.js';
import { gruppe } from './symmetrie.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Gitter } from './zeichnung.js' */
/** @import { Basiseintrag } from './motive.js' */
/** @import { System } from './ebenengruppen.js' */
/**
 * Struktur im Modus „Gitter und Basis“ mit den Schaltern ihrer Tafeln. festeGruppe: festgehaltene Ebenengruppe
 * („Symmetrie festhalten“, #121) oder null; dann ist basis je Bahn ein Vertreter (bahnen.js), sonst alle Motive.
 * @typedef {Gitter & { vorgabe: string, basis: Basiseintrag[], festeGruppe: string | null, elemente: boolean, zelle: boolean, ae: boolean, bindungen: boolean }} StrukturZustand
 */
/**
 * Zustand der App (Felder siehe startzustand()).
 * @typedef {object} Zustand
 * @property {'eg' | 'struktur'} modus
 * @property {string} gruppe
 * @property {Vec2} punkt
 * @property {boolean} elemente
 * @property {boolean} objekt
 * @property {boolean} ae
 * @property {number} zellen
 * @property {string} form
 * @property {boolean} tapete
 * @property {number} zoomB
 * @property {number} objGroesse
 * @property {boolean} farben
 * @property {boolean} einrasten
 * @property {boolean} lupe
 * @property {boolean} orbit
 * @property {boolean} musterElemente
 * @property {boolean} herkunft
 * @property {string | null} erkl
 * @property {number} aufbau
 * @property {boolean} zeichnen
 * @property {boolean} radieren
 * @property {Vec2[][]} striche
 * @property {boolean} aeFuell
 * @property {number} schritt
 * @property {number[]} aeTeile
 * @property {Record<System, Gitter>} gitter
 * @property {StrukturZustand} struktur
 */
/** Schalter des Zustands (Wahrheitswerte in der Adresse). @typedef {'elemente' | 'objekt' | 'ae' | 'farben' | 'einrasten' | 'musterElemente' | 'orbit' | 'aeFuell' | 'tapete' | 'lupe'} Schalterfeld */
/** @typedef {'elemente' | 'zelle' | 'ae' | 'bindungen'} StrukturSchalterfeld */


/** Formen des Objekts (wie FORMEN in zeichnung.js; tests/zustand.test.mjs prüft die Übereinstimmung). */
export const FORMEN = ['fahne', 'komma', 'blatt', 'tropfen', 'ranke'];

/** Gittermetrik je Kristallsystem: b/a und γ (Grad). Frei nur, wo das System es erlaubt. @type {Record<System, Gitter>} */
export const GITTER_START = /** @type {Record<System, Gitter>} */ ({
  schiefwinklig: { ba: 1.25, gamma: 105 },
  rechteckig: { ba: 1.35, gamma: 90 },
  quadratisch: { ba: 1, gamma: 90 },
  hexagonal: { ba: 1, gamma: 120 },
});
/**
 * Bereich der Gitterregler in allen Modi (eigene Festlegung der App, Konzept „Muster entwerfen“, Entscheidung 12):
 * alle Metriken ausser fast entarteten. Er schliesst höhere Metrik nicht aus (b/a = 1 oder γ = 90° sind einstellbar);
 * zufällige Zusatzsymmetrie ist hier gewollt und zeigt sich in den Kenndaten. @type {Record<'ba' | 'gamma', [number, number]>}
 */
export const GITTER_BEREICH = {
  ba: [0.5, 2],
  gamma: [60, 150],
};
/** Freie Gitterparameter je System. @type {Record<System, ('ba' | 'gamma')[]>} */
export const FREI = {
  schiefwinklig: ['ba', 'gamma'],
  rechteckig: ['ba'],
  quadratisch: [],
  hexagonal: [],
};

/** Bereiche der Regler im Modus „Gitter und Basis“: die Gitterbereiche (GITTER_BEREICH) und die Grösse der Motive. @type {Record<'ba' | 'gamma' | 'groesse', [number, number]>} */
export const STRUKTUR_BEREICH = { ...GITTER_BEREICH, groesse: [0.02, 1] };
/** Höchste Nummer im Ablauf „Schritt für Schritt“ in Link und Speicher (die Anzeige begrenzt auf die Gruppe). */
export const SCHRITT_GRENZE = 25;
/** Höchstzahl der Motive in der Basis. */
export const BASIS_GRENZE = 48;
/** Bereiche der Vergrösserung des Musters und der Grösse des Objekts. @type {[number, number]} */
export const ZOOM_BEREICH = [0.5, 3];
/** @type {[number, number]} */
export const OBJ_BEREICH = [0.5, 3];
export const STRUKTUR_START = 'dreieck1';
/** @template T @param {T} x @returns {T} */
const kopie = (x) => JSON.parse(JSON.stringify(x));

/** Struktur im Modus „Gitter und Basis“ aus einer Vorgabe (vorgaben.js). @param {string} [id] @returns {StrukturZustand} */
export function strukturStart(id = STRUKTUR_START) {
  const v = /** @type {import('./vorgaben.js').Vorgabe} */ (vorgabe(id) ?? vorgabe(STRUKTUR_START)); // STRUKTUR_START gibt es
  return { vorgabe: v.id, ba: v.gitter.ba, gamma: v.gitter.gamma, basis: kopie(v.basis), festeGruppe: null, elemente: true, zelle: true, ae: false, bindungen: true };
}

/**
 * Gewicht eines Eintrags für BASIS_GRENZE: 1, mit festgehaltener Symmetrie die Zähligkeit der allgemeinen Lage, wo der
 * Vertreter auch liegt (CLAUDE.md, „Symmetrie festhalten“, Grenze).
 * @param {string | null} festeGruppe
 */
export const bahnGewicht = (festeGruppe) => (festeGruppe ? gruppe(festeGruppe).ordnung : 1);

/**
 * Gitter passend zum System einer festgehaltenen Gruppe: mit den exakten Werten des Systems, oder null, wenn es
 * nicht passt. „Passt“ heisst innerhalb der Genauigkeit des Links (b/a auf 0,0005, γ auf 0,005°).
 * @param {number} ba @param {number} gamma @param {string} symbol
 * @returns {Gitter | null}
 */
export function gitterZurGruppe(ba, gamma, symbol) {
  const sys = systemVon(symbol);
  /** @type {(x: number, y: number, t: number) => boolean} */
  const nah = (x, y, t) => Math.abs(x - y) <= t;
  if (sys === 'schiefwinklig') return { ba, gamma: grad(gamma) };
  if (!nah(gamma, sys === 'hexagonal' ? 120 : 90, 0.005)) return null;
  if (sys === 'rechteckig') return { ba, gamma: grad(90) };
  if (!nah(ba, 1, 0.0005)) return null;
  return { ba: 1, gamma: grad(sys === 'hexagonal' ? 120 : 90) };
}
/** Gleicht die Struktur (Gitter und Basis) noch ihrer Vorgabe? @param {StrukturZustand} st */
export function wieVorgabe(st) {
  const v = vorgabe(st.vorgabe);
  // mit festgehaltener Symmetrie sind es Vertreter, nicht die Motive der Vorgabe
  if (st.festeGruppe) return false;
  if (!v || Math.abs(v.gitter.ba - st.ba) > 1e-9 || Math.abs(v.gitter.gamma - st.gamma) > 1e-9 || v.basis.length !== st.basis.length) return false;
  return v.basis.every((e, i) => {
    const f = st.basis[i];
    return e.motiv === f.motiv && (e.farbe ?? 0) === (f.farbe ?? 0) && Math.abs(e.p[0] - f.p[0]) < 1e-9 && Math.abs(e.p[1] - f.p[1]) < 1e-9
      && Boolean(e.spiegel) === Boolean(f.spiegel)
      && Math.abs((e.winkel ?? 0) - (f.winkel ?? 0)) < 1e-9 && Math.abs((e.groesse ?? MOTIVE[e.motiv].groesse) - (f.groesse ?? MOTIVE[f.motiv].groesse)) < 1e-9;
  });
}

/**
 * Gesehene Erste Schritte aus dem gespeicherten Wert von `ebenen-intro`: Modi, durch Komma getrennt.
 * @param {string | null | undefined} wert
 * @returns {Set<string>}
 */
export const introGesehen = (wert) => new Set(String(wert ?? '').split(',').filter(Boolean));

/** Startzustand. @returns {Zustand} */
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
    tapete: false, // Muster (Tafel B) als Tapete: ohne Zelle und Elemente, einfarbig
    zoomB: 1, // Vergrösserung des Musters (Tafel B): kleinerer Ausschnitt, alles grösser (ZOOM_BEREICH)
    objGroesse: 1, // Grösse des Objekts (Fähnchen, Ornament) in beiden Tafeln (OBJ_BEREICH)
    farben: true, // nach Blickrichtung färben
    einrasten: true,
    lupe: false, // Tafel A vergrössert (LUPE in zeichnung.js) um das Objekt
    orbit: false, // Bilder rund um die Zelle (wie ITA), Rand ORBIT_RAND in zeichnung.js
    musterElemente: false, // Symmetrieelemente in Tafel B
    herkunft: false, // „Herkunft der Elemente“: Antippen eines Elements zeigt, woher es kommt
    erkl: null, // gewähltes Element (Schlüssel aus herkunft.js, z. B. „m;1/4,0;0,1“)
    aufbau: 0, // Aufbau aus Erzeugenden: 0 aus, sonst Schritt 1, 2, …
    zeichnen: false, // Werkzeug „Zeichnen“ in Tafel A (nicht in der Link-Adresse)
    radieren: false, // Werkzeug „Radieren“ in Tafel A (nicht in der Link-Adresse)
    striche: [], // gezeichnete Striche in Bruchkoordinaten (nur im Browser gespeichert, nicht im Link)
    aeFuell: false, // asymmetrische Einheit gefüllt und vervielfältigt
    schritt: 0, // Schritt für Schritt: 0 aus, sonst Operation 1 … N der ITA-Liste, N + 1 Gittertranslationen
    aeTeile: [], // angetippte Bedingungen der asymmetrischen Einheit (Nummern ab 0, aufsteigend)
    gitter: JSON.parse(JSON.stringify(GITTER_START)),
    struktur: strukturStart(), // Modus „Gitter und Basis“
  };
}

const SYMBOLE = new Set(EBENENGRUPPEN.map((g) => g.symbol));
/** @param {boolean} v */
const B = (v) => (v ? '1' : '0');
/** @param {string | null} s */
const an = (s) => s === '1' || s === 'ja' || s === 'true';
/**
 * Zahl aus der Adresse („0.25“ oder Bruch „1/3“); fehlend, leer oder ausserhalb [lo, hi]: null. Für
 * Auswahlen (schritt, aufbau, Farbe) und Schutzgrenzen (Koordinaten); Regler: zahlBegrenzt.
 * @param {string | null | undefined} s @param {number} lo @param {number} hi
 * @returns {number | null}
 */
function zahl(s, lo, hi) {
  if (s === null || s === undefined || String(s).trim() === '') return null;
  const m = String(s).trim().match(/^(-?\d+)\/(\d+)$/);
  const v = m ? Number(m[1]) / Number(m[2]) : Number(s);
  return Number.isFinite(v) && v >= lo && v <= hi ? v : null;
}
/**
 * Zahl aus der Adresse wie zahl(), aber ausserhalb [lo, hi] auf den nächsten gültigen Wert gesetzt (Leitfaden
 * Abschn. 5.2); fehlend, leer oder keine Zahl: null. Für Werte auf einer stetigen Skala (Regler).
 * @param {string | null | undefined} s @param {number} lo @param {number} hi
 * @returns {number | null}
 */
function zahlBegrenzt(s, lo, hi) {
  const v = zahl(s, -Infinity, Infinity);
  return v === null ? null : Math.min(hi, Math.max(lo, v));
}
/** @param {number} v @param {number} [n] */
const kurz = (v, n = 4) => String(Number(v.toFixed(n)));
/**
 * Koordinate für die Adresse: exakt als Bruch, wenn sie einer mit kleinem Nenner ist (spezielle
 * Lagen wie 1/3 bleiben so beim Neuladen speziell), sonst mit sechs Stellen.
 * @param {number} v
 */
export function koordText(v) {
  for (let n = 1; n <= 12; n++) {
    const z = Math.round(v * n);
    if (Math.abs(v - z / n) < 1e-9) return n === 1 ? String(z) : `${z}/${n}`;
  }
  return kurz(v, 6);
}
/** System einer Ebenengruppe (id ist eines der 17 Symbole). @param {string} id */
const systemVon = (id) => /** @type {import('./ebenengruppen.js').Ebenengruppe} */ (EBENENGRUPPEN.find((g) => g.symbol === id)).system;

/** Schlüssel eines erklärten Elements (herkunft.js), z. B. „4;1/2,1/2“ oder „m;1/4,0;0,1“. */
export const ERKL_MUSTER = /^([2346];-?[\d/]+,-?[\d/]+|[mg];-?[\d/]+,-?[\d/]+;-?\d+,-?\d+)$/;

/** Grenze für Koordinaten des Objekts und gezeichneter Striche (wie in der Link-Adresse). */
const KOORD_GRENZE = 1e6;
/** @param {unknown} p */
const imFeld = (p) => zahlenpaar(p) && /** @type {number[]} */ (p).every((v) => Math.abs(v) <= KOORD_GRENZE);

/**
 * Die eine Prüfung für Link und Speicher (Leitfaden Abschn. 5.2, crystallography-common#63): alle Felder
 * mit ihren Abhängigkeiten. Zahlen auf einer stetigen Skala (Regler) ausserhalb ihres Bereichs werden auf den
 * nächsten gültigen Wert gesetzt; alles andere Ungültige wird zum Startwert, auch ganzzahlige Auswahlen
 * (schritt, aufbau) und Koordinaten jenseits der Schutzgrenze. ausSpeicher ruft sie für den
 * Speicher des Browsers, hashAnwenden nach dem Lesen der Link-Adresse. Ändert z und gibt es zurück.
 * @param {Zustand} z
 */
export function zustandPruefen(z) {
  const s = startzustand();
  if (!SYMBOLE.has(z.gruppe)) z.gruppe = s.gruppe;
  if (z.modus !== 'eg' && z.modus !== 'struktur') z.modus = s.modus;
  if (!imFeld(z.punkt)) z.punkt = s.punkt;
  for (const [, f] of SCHALTER) if (typeof z[f] !== 'boolean') z[f] = s[f];
  if (typeof z.herkunft !== 'boolean') z.herkunft = s.herkunft;
  if (!FORMEN.includes(z.form)) z.form = s.form;
  if (z.zellen !== 2) z.zellen = s.zellen;
  if (!(typeof z.erkl === 'string' && ERKL_MUSTER.test(z.erkl))) z.erkl = null;
  if (!Number.isInteger(z.aufbau) || z.aufbau < 0 || z.aufbau > 20) z.aufbau = s.aufbau;
  if (!Number.isInteger(z.schritt) || z.schritt < 0 || z.schritt > SCHRITT_GRENZE) z.schritt = s.schritt;
  z.zoomB = begrenzt(z.zoomB, ZOOM_BEREICH) ?? s.zoomB;
  z.objGroesse = begrenzt(z.objGroesse, OBJ_BEREICH) ?? s.objGroesse;
  // Bedingungen der asymmetrischen Einheit: Nummern der Gruppe, ohne Doppelte, aufsteigend
  const zahlTeile = /** @type {import('./ebenengruppen.js').Ebenengruppe} */ (EBENENGRUPPEN.find((d) => d.symbol === z.gruppe)).ae.text.split(';').length;
  z.aeTeile = Array.isArray(z.aeTeile) ? [...new Set(z.aeTeile.filter((i) => Number.isInteger(i) && i >= 0 && i < zahlTeile))].sort((x, y) => x - y) : [];
  z.gitter = gitterPruefen(z.gitter);
  // Werkzeuge und gezeichnete Striche (nur im Speicher): Folgen von Punkten, höchstens STRICH_GRENZE
  z.zeichnen = z.zeichnen === true;
  z.radieren = z.radieren === true && !z.zeichnen;
  z.striche = Array.isArray(z.striche) ? z.striche.filter((st) => Array.isArray(st) && st.length >= 2 && st.every(imFeld)) : [];
  while (z.striche.flat().length > STRICH_GRENZE) z.striche.shift();
  z.struktur = pruefeStruktur(z.struktur) ?? strukturStart();
  return z;
}

/**
 * Gitter je System wie in der Link-Adresse: Die freien Parameter des Systems (FREI) in GITTER_BEREICH,
 * die übrigen auf den Startwert des Systems (Abhängigkeiten zwischen den Feldern, z. B. γ = 90° im
 * rechteckigen System). Werte ausserhalb des Bereichs: nächster gültiger Wert; keine Zahl oder fehlend:
 * Startwert (#96, Leitfaden Abschn. 5.2).
 * @param {unknown} g @returns {Record<System, Gitter>}
 */
export function gitterPruefen(g) {
  const roh = istObjekt(g) ? g : {};
  const aus = /** @type {Record<System, Gitter>} */ (kopie(GITTER_START));
  for (const sys of /** @type {System[]} */ (Object.keys(GITTER_START))) {
    const e = roh[sys];
    if (!istObjekt(e)) continue;
    const ba = begrenzt(e.ba, GITTER_BEREICH.ba); const gamma = begrenzt(e.gamma, GITTER_BEREICH.gamma);
    if (FREI[sys].includes('ba') && ba !== null) aus[sys].ba = ba;
    if (FREI[sys].includes('gamma') && gamma !== null) aus[sys].gamma = grad(gamma);
  }
  return aus;
}

/**
 * Zustand aus dem Speicher des Browsers (JSON.parse von { v: 2, z }), geprüft mit zustandPruefen wie die
 * Link-Adresse. Ohne gültigen Stand der Startzustand. Gegenstück: speicherStand.
 * @param {unknown} gespeichert @returns {Zustand}
 */
export function ausSpeicher(gespeichert) {
  const z = startzustand();
  if (!istObjekt(gespeichert) || gespeichert.v !== SPEICHER_VERSION || !istObjekt(gespeichert.z)) return z;
  // nur die Felder des Zustands (keine fremden Schlüssel, kein __proto__)
  const g = gespeichert.z;
  const ziel = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (z));
  for (const k of Object.keys(z)) if (Object.hasOwn(g, k)) ziel[k] = g[k];
  return zustandPruefen(z);
}

/**
 * Version des Speicherformats (Leitfaden Abschn. 8): steigt, wenn sich das Format ändert; ein Stand mit anderer
 * Version wird verworfen (Startzustand). 2: Feld `warum` heisst `herkunft`, `brechen` und `frei` entfallen
 * (v1.x hatte 1; Entscheidung dazu in CLAUDE.md).
 */
export const SPEICHER_VERSION = 2;

/** Stand für den Speicher des Browsers (Gegenstück zu ausSpeicher). @param {Zustand} z */
export const speicherStand = (z) => ({ v: SPEICHER_VERSION, z });

/** Schalter in der Adresse: Schlüssel → Feld im Zustand. */
/** @type {[string, Schalterfeld][]} */
const SCHALTER = [['el', 'elemente'], ['obj', 'objekt'], ['ae', 'ae'], ['farb', 'farben'], ['rast', 'einrasten'], ['mel', 'musterElemente'], ['orbit', 'orbit'], ['fuell', 'aeFuell'], ['tap', 'tapete'], ['lupe', 'lupe']];

/**
 * Basis als Text: Motive durch „;“ getrennt, je motiv,farbe,x,y,winkel[,grösse][,m]; „m“: gespiegelt (nur bei
 * chiralen Motiven, sonst ohne Wirkung und weggelassen).
 * @param {Basiseintrag[]} basis
 */
export function basisText(basis) {
  return basis.map((e) => {
    const teile = [e.motiv, String(e.farbe ?? 0), koordText(e.p[0]), koordText(e.p[1]), kurz(e.winkel ?? 0, 3)];
    if (e.groesse !== undefined && Math.abs(e.groesse - MOTIVE[e.motiv].groesse) > 1e-9) teile.push(kurz(e.groesse, 4));
    if (e.spiegel && chiral(e.motiv)) teile.push('m');
    return teile.join(',');
  }).join(';');
}
/** Umkehrung von basisText; ungültige Einträge fallen weg. @param {string} text */
export function liesBasis(text) {
  /** @type {Basiseintrag[]} */
  const out = [];
  for (const teil of String(text).split(';')) {
    const felder = teil.split(',');
    // letztes Feld „m“: gespiegelt (ältere Links haben es nicht)
    const gespiegelt = felder.length > 5 && felder[felder.length - 1] === 'm';
    if (gespiegelt) felder.pop();
    const [motiv, farbe, x, y, winkel, groesse] = felder;
    if (!Object.hasOwn(MOTIVE, motiv ?? '')) continue;
    const f = zahl(farbe, 0, 3); const px = zahl(x, -1e3, 1e3); const py = zahl(y, -1e3, 1e3);
    const w = umlauf(zahl(winkel ?? '0', -Infinity, Infinity) ?? 0); const gr = groesse === undefined ? null : zahlBegrenzt(groesse, ...STRUKTUR_BEREICH.groesse);
    if (f === null || !Number.isInteger(f) || px === null || py === null) continue;
    /** @type {Basiseintrag} */
    const e = { motiv, farbe: f, p: [px, py], winkel: grad(w) };
    if (gr !== null) e.groesse = gr;
    if (gespiegelt && chiral(motiv)) e.spiegel = true;
    out.push(e);
    if (out.length >= BASIS_GRENZE) break;
  }
  return out;
}

/** Objekt mit beliebigen Feldern (Eingabe von aussen, Felder noch ungeprüft). @param {unknown} x @returns {x is Record<string, unknown>} */
export const istObjekt = (x) => typeof x === 'object' && x !== null;
/** Endliche Zahl im Bereich. @param {unknown} v @param {[number, number]} bereich @returns {v is number} */
export const imBereich = (v, [lo, hi]) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
/** Endliche Zahl auf den Bereich gesetzt (nächster gültiger Wert, Leitfaden Abschn. 5.2), sonst null. @param {unknown} v @param {[number, number]} bereich */
export const begrenzt = (v, [lo, hi]) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null);
/** Umlaufender Winkel in 0° bis unter 360° (Leitfaden Abschn. 5.2). @param {number} w */
export const umlauf = (w) => { const r = ((w % 360) + 360) % 360; return r >= 360 ? 0 : r; };
/** Paar endlicher Zahlen. @param {unknown} p @returns {p is Vec2} */
export const zahlenpaar = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);

/**
 * Struktur aus dem Speicher des Browsers prüfen: gültige Kopie oder null. Anders als liesBasis()
 * bleiben die Zahlen unverändert (keine Rundung).
 * @param {unknown} st Eingabe aus dem Speicher des Browsers, unbekannten Aufbaus
 * @returns {StrukturZustand | null}
 */
export function pruefeStruktur(st) {
  if (!istObjekt(st) || !Array.isArray(st.basis)) return null;
  // wie im Link (hashLesen): fehlt ba oder γ oder ist keine Zahl, gilt 1 bzw. 90°
  let ba = begrenzt(st.ba, STRUKTUR_BEREICH.ba) ?? 1; let gamma = begrenzt(st.gamma, STRUKTUR_BEREICH.gamma) ?? 90;
  const { vorgabe } = st;
  const anzeige = { elemente: st.elemente !== false, zelle: st.zelle !== false, ae: st.ae === true, bindungen: st.bindungen !== false };
  const vonVorgabe = typeof vorgabe === 'string' && VORGABEN.some((v) => v.id === vorgabe) ? vorgabe : STRUKTUR_START;
  // festgehaltene Gruppe: unbekannt oder Gitter passt nicht zum System → Struktur der Vorgabe, nicht festgehalten
  // (nicht umdeuten: die Vertreter gelten nie als ganze Basis; Leitfaden Abschn. 5.2)
  const fg = st.festeGruppe ?? null;
  /** @type {string | null} */
  let festeGruppe = null;
  if (fg !== null) {
    const g = typeof fg === 'string' && SYMBOLE.has(fg) ? gitterZurGruppe(ba, gamma, fg) : null;
    if (!g) return { ...strukturStart(vonVorgabe), ...anzeige };
    festeGruppe = /** @type {string} */ (fg); ba = g.ba; gamma = g.gamma;
  }
  const gewicht = bahnGewicht(festeGruppe);
  /** @type {Basiseintrag[]} */
  const basis = [];
  for (const e of /** @type {unknown[]} */ (st.basis)) {
    if ((basis.length + 1) * gewicht > BASIS_GRENZE) break;
    if (!istObjekt(e)) continue;
    const { motiv, p } = e, farbe = e.farbe ?? 0, winkel = e.winkel ?? 0;
    const groesse = e.groesse === undefined ? undefined : begrenzt(e.groesse, STRUKTUR_BEREICH.groesse);
    if (typeof motiv !== 'string' || !Object.hasOwn(MOTIVE, motiv) || !zahlenpaar(p)) continue;
    if (typeof farbe !== 'number' || ![0, 1, 2, 3].includes(farbe) || typeof winkel !== 'number' || !Number.isFinite(winkel)) continue;
    if (groesse === null) continue;
    // gespiegelt nur, wenn ausdrücklich true und das Motiv chiral ist (sonst ohne Wirkung)
    const spiegel = e.spiegel === true && chiral(motiv);
    basis.push({ motiv, farbe, p: [p[0], p[1]], winkel: grad(umlauf(winkel)), ...(groesse === undefined ? {} : { groesse }), ...(spiegel ? { spiegel: true } : {}) });
  }
  return { vorgabe: vonVorgabe, ba, gamma: grad(gamma), basis, festeGruppe, ...anzeige };
}

/** @type {[string, StrukturSchalterfeld][]} */
const STRUKTUR_SCHALTER = [['sel', 'elemente'], ['szelle', 'zelle'], ['sae', 'ae'], ['sbind', 'bindungen']];

/**
 * Link-Adresse im Modus „Gitter und Basis“: immer die Vorgabe (v=…), damit „Zurücksetzen“ nach dem Öffnen des
 * Links zur richtigen Vorgabe führt; weicht die Struktur ab, dazu Gitter und Basis ausgeschrieben.
 * @param {Zustand} z @param {URLSearchParams} q
 */
function strukturHash(z, q) {
  const st = z.struktur; const s0 = strukturStart();
  q.set('v', st.vorgabe);
  if (st.festeGruppe) q.set('sg', st.festeGruppe);
  if (!wieVorgabe(st)) {
    q.set('ba', kurz(st.ba, 3));
    q.set('gamma', kurz(st.gamma, 2));
    q.set('basis', basisText(st.basis));
  }
  for (const [k, f] of STRUKTUR_SCHALTER) if (st[f] !== s0[f]) q.set(k, B(st[f]));
  if (z.zoomB !== startzustand().zoomB) q.set('zoom', kurz(z.zoomB, 3));
}

/** Link-Adresse (Hash) zum Zustand. @param {Zustand} z */
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
  if (z.herkunft) q.set('herkunft', '1');
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

/** Liest die Link-Adresse in z (ohne die gemeinsame Prüfung). @param {Zustand} z @param {string} hash @returns {boolean} */
function hashLesen(z, hash) {
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
    const st = strukturStart(VORGABEN.some((v) => v.id === q.get('v')) ? /** @type {string} */ (q.get('v')) : STRUKTUR_START);
    if (q.has('basis')) {
      st.basis = liesBasis(/** @type {string} */ (q.get('basis')));
      st.ba = zahlBegrenzt(q.get('ba'), ...STRUKTUR_BEREICH.ba) ?? 1;
      st.gamma = grad(zahlBegrenzt(q.get('gamma'), ...STRUKTUR_BEREICH.gamma) ?? 90);
      // festgehaltene Gruppe nur zusammen mit basis=; geprüft wird sie in pruefeStruktur (über zustandPruefen)
      if (q.has('sg')) st.festeGruppe = /** @type {string} */ (q.get('sg'));
    }
    for (const [k, f] of STRUKTUR_SCHALTER) if (q.has(k)) st[f] = an(q.get(k));
    z.struktur = st;
    z.zoomB = zahlBegrenzt(q.get('zoom'), ...ZOOM_BEREICH) ?? s.zoomB;
    return true;
  }
  const g = q.get('g');
  if (g !== null && SYMBOLE.has(g)) z.gruppe = g;
  // Koordinaten einzeln: eine fehlende behält ihren Startwert
  const x = zahl(q.get('x'), -1e6, 1e6); const y = zahl(q.get('y'), -1e6, 1e6);
  z.punkt = [x ?? s.punkt[0], y ?? s.punkt[1]];
  for (const [k, f] of SCHALTER) if (q.has(k)) z[f] = an(q.get(k));
  if (q.get('zellen') === '2') z.zellen = 2;
  z.zoomB = zahlBegrenzt(q.get('zoom'), ...ZOOM_BEREICH) ?? s.zoomB;
  z.objGroesse = zahlBegrenzt(q.get('og'), ...OBJ_BEREICH) ?? s.objGroesse;
  const form = q.get('form');
  if (form !== null && FORMEN.includes(form)) z.form = form;
  if (q.has('herkunft')) z.herkunft = an(q.get('herkunft'));
  const erkl = q.get('erkl');
  if (erkl && ERKL_MUSTER.test(erkl)) z.erkl = erkl;
  const aufbau = zahl(q.get('aufbau'), 0, 20);
  if (aufbau !== null && Number.isInteger(aufbau)) z.aufbau = aufbau;
  const schritt = zahl(q.get('schritt'), 0, SCHRITT_GRENZE);
  if (schritt !== null && Number.isInteger(schritt)) z.schritt = schritt;
  // Bedingungen der asymmetrischen Einheit: höchstens so viele, wie die Gruppe hat
  const aet = q.get('aet');
  if (aet && /^\d(,\d)*$/.test(aet)) {
    const zahlTeile = /** @type {import('./ebenengruppen.js').Ebenengruppe} */ (EBENENGRUPPEN.find((d) => d.symbol === z.gruppe)).ae.text.split(';').length;
    z.aeTeile = [...new Set(aet.split(',').map(Number))].filter((i) => i < zahlTeile).sort((a, b) => a - b);
  }
  const sys = systemVon(z.gruppe);
  z.gitter[sys] = { ...GITTER_START[sys] };
  for (const k of FREI[sys]) {
    const v = zahlBegrenzt(q.get(k), ...GITTER_BEREICH[k]);
    if (v !== null) z.gitter[sys][k] = grad(v); // ba oder gamma; grad() kennzeichnet nur
  }
  return true;
}

/**
 * Link-Adresse auf einen Zustand anwenden. Unbekannte oder ungültige Werte werden ignoriert
 * (der Startwert bleibt). Gibt false zurück, wenn der Hash keinen Modus enthält.
 * @param {Zustand} z
 * @param {string} hash
 */
export function hashAnwenden(z, hash) {
  if (!hashLesen(z, hash)) return false;
  zustandPruefen(z); // dieselbe Prüfung wie für den Speicher, auch für Abhängigkeiten zwischen Feldern
  return true;
}
