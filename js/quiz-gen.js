// Erzeugte Fragen: aus den Daten der App, die schon getestet sind, mit sicherer richtiger Antwort.
// Ein Generator: { id, kapitel, stufen, status, params(stufe) → Parameter, make(param, stufe) → Frage }.
// Die Frage hat denselben Aufbau wie in quiz-bank.js (ohne id, stufe, kapitel, status; die setzt quiz-core.js).
// Bildangaben: Link-Adresse der App (Tafel A) oder „B#…“ (Tafel B, das Muster); siehe quiz-bild.js.

import { EBENENGRUPPEN, ebenengruppe } from './ebenengruppen.js';
import { gruppe, punktAufLage, lage, elemente, art, gleichModGitter } from './symmetrie.js';
import { koordText } from './zustand.js';
import { symbolHTML } from './text.js';
import { VORGABEN, vorgabe } from './vorgaben.js';
import { OPERATIONEN, verknuepfe, istGruppe, nichtAbgeschlossen, teilmengen, untergruppen, symbolVon } from './punktoperationen.js';

const S = symbolHTML;
const ALLE = EBENENGRUPPEN.map((d) => d.symbol);

/** Was eine Ebenengruppe im Bild zeigt (für Hinweise zu Ablenkern). Geprüft gegen die Elemente der App (Test). */
export const MERKMALE = {
  p1: 'nur Translationen, keine Drehpunkte und keine Spiegel- oder Gleitspiegellinien',
  p2: 'nur 2-zählige Drehpunkte, keine Spiegel- oder Gleitspiegellinien',
  pm: 'parallele Spiegellinien, aber keine Gleitspiegellinien und keine Drehpunkte',
  pg: 'parallele Gleitspiegellinien, aber keine Spiegellinien und keine Drehpunkte',
  cm: 'parallele Spiegellinien mit Gleitspiegellinien dazwischen und eine zentrierte Zelle, aber keine Drehpunkte',
  p2mm: 'Spiegellinien in zwei senkrechten Richtungen; alle 2-zähligen Drehpunkte liegen auf ihren Schnittpunkten',
  p2mg: 'Spiegellinien in nur einer Richtung, Gleitspiegellinien senkrecht dazu und 2-zählige Drehpunkte, die auf keiner Spiegellinie liegen',
  p2gg: 'Gleitspiegellinien in zwei senkrechten Richtungen und 2-zählige Drehpunkte, aber keine Spiegellinie',
  c2mm: 'Spiegellinien in zwei senkrechten Richtungen mit Gleitspiegellinien dazwischen, 2-zählige Drehpunkte auf und neben den Spiegellinien und eine zentrierte Zelle',
  p4: '4- und 2-zählige Drehpunkte, aber keine Spiegel- oder Gleitspiegellinien',
  p4mm: '4-zählige Drehpunkte auf Schnittpunkten von Spiegellinien, die entlang der Kanten und der Diagonalen laufen',
  p4gm: '4-zählige Drehpunkte, die auf keiner Spiegellinie liegen; die Spiegellinien laufen diagonal',
  p3: 'nur 3-zählige Drehpunkte, keine Spiegellinien',
  p3m1: 'nur 3-zählige Drehpunkte, die alle auf Spiegellinien liegen; die Spiegellinien stehen senkrecht auf den Zellkanten und der kurzen Diagonalen',
  p31m: 'nur 3-zählige Drehpunkte, von denen nur ein Teil auf Spiegellinien liegt; die Spiegellinien laufen entlang der Zellkanten und der kurzen Diagonalen',
  p6: '6-, 3- und 2-zählige Drehpunkte, aber keine Spiegellinien',
  p6mm: '6-zählige Drehpunkte auf Schnittpunkten von Spiegellinien in sechs Richtungen',
};

// Ablenker: zuerst die naheliegenden (VORZUG), dann gleiche Punktgruppe, gleiches System, Nachbarsysteme
const NACHBARN = { schiefwinklig: ['rechteckig'], rechteckig: ['schiefwinklig', 'quadratisch'], quadratisch: ['rechteckig'], hexagonal: ['rechteckig'] };
const VORZUG = {
  p6: ['p6mm', 'p3', 'p31m'], p6mm: ['p6', 'p3m1', 'p31m'], p3: ['p6', 'p3m1', 'p31m'],
  p4: ['p4mm', 'p4gm', 'p2'], p4mm: ['p4gm', 'p4', 'p2mm'], p4gm: ['p4mm', 'p4', 'p2gg'],
};
/** Drei andere Ebenengruppen als Ablenker für symbol (deterministisch), ohne die in ausser. */
export function gruppenAblenker(symbol, n = 3, ausser = []) {
  const d = ebenengruppe(symbol);
  const andere = EBENENGRUPPEN.filter((x) => x.symbol !== symbol && !ausser.includes(x.symbol));
  const out = [];
  const nimm = (liste) => { for (const x of liste) if (out.length < n && !out.includes(x.symbol)) out.push(x.symbol); };
  nimm(andere.filter((x) => (VORZUG[symbol] || []).includes(x.symbol)).sort((a, b) => VORZUG[symbol].indexOf(a.symbol) - VORZUG[symbol].indexOf(b.symbol)));
  nimm(andere.filter((x) => x.punktgruppe === d.punktgruppe));
  nimm(andere.filter((x) => x.system === d.system));
  for (const s of NACHBARN[d.system]) nimm(andere.filter((x) => x.system === s));
  return out;
}

const hinweisGruppe = (falsch) => `${S(falsch)} hätte ${MERKMALE[falsch]}.`;

// ------------------------------------------------------------------ Symmetriegerüst → Ebenengruppe
// Stufe 1: die gängigen Beispiele (auch pg, p2mg, p2gg); Stufe 2: Gruppen, die man erst mit den
// Blickrichtungen sicher unterscheidet (p3m1/p31m) oder deren Gerüst unübersichtlich ist (p4gm)
const STUFE2_DIAGRAMM = ['p3m1', 'p31m', 'p4gm'];
export const DIAGRAMM = {
  id: 'diagramm', kapitel: 5, stufen: [1, 2], status: 'entwurf',
  params: (s) => ALLE.filter((g) => (s === 2) === STUFE2_DIAGRAMM.includes(g)),
  make(g) {
    const ab = gruppenAblenker(g);
    return {
      typ: 'bild-text',
      lernziel: 'die beiden Diagramme einer Ebenengruppe in den International Tables lesen',
      frage: 'Das Bild zeigt die Symmetrieelemente einer Elementarzelle wie im Diagramm der International Tables. Zu welcher Ebenengruppe gehört es?',
      bild: `#m=eg&g=${g}&obj=0&farb=0`, bildAlt: 'Symmetriegerüst einer Elementarzelle',
      antworten: [g, ...ab].map(S),
      richtig: [0],
      hinweise: [null, ...ab.map(hinweisGruppe)],
      erklaerung: `${S(g)} hat ${MERKMALE[g]}.`,
      skript: 'diagramme', app: `#m=eg&g=${g}`,
      quelle: 'International Tables for Crystallography, Vol. A (2006), Part 6',
    };
  },
};

// ------------------------------------------------------------------ Ebenengruppe → Punktgruppe, Kristallsystem
const SYSTEME = ['schiefwinklig', 'rechteckig', 'quadratisch', 'hexagonal'];
const pgHTML = (p) => p.replace(/m/g, '<i>m</i>');
/** Punktgruppe aus dem Symbol nach der Regel des Skripts (Abschn. 5.4): Zellbuchstabe weg, g → m, Einsen weg. */
export function punktgruppeAusSymbol(symbol) {
  const r = symbol.slice(1).replace(/g/g, 'm');
  return r === '1' ? '1' : r.replace(/1/g, '');
}
/** Kristallsystem aus der Punktgruppe: höchste Zähligkeit, sonst Spiegellinien. */
export function systemAusPunktgruppe(pg) {
  if (/^[36]/.test(pg)) return 'hexagonal';
  if (pg.startsWith('4')) return 'quadratisch';
  return pg.includes('m') ? 'rechteckig' : 'schiefwinklig';
}
const SYSTEM_GRUND = {
  hexagonal: 'ein 3- oder 6-zähliger Drehpunkt verlangt <i>a</i> = <i>b</i> und γ = 120°',
  quadratisch: 'ein 4-zähliger Drehpunkt verlangt <i>a</i> = <i>b</i> und γ = 90°',
  rechteckig: 'Spiegel- oder Gleitspiegellinien ohne 3-, 4- oder 6-zählige Drehpunkte verlangen nur γ = 90°',
  schiefwinklig: 'ohne Spiegel- und Gleitspiegellinien und ohne 3-, 4- oder 6-zählige Drehpunkte gibt es keine Bedingung an die Metrik',
};
const PG_TEXT = {
  1: 'keine Symmetrie ausser der Identität', 2: 'nur einen 2-zähligen Drehpunkt', m: 'nur eine Spiegellinie',
  '2mm': 'einen 2-zähligen Drehpunkt mit zwei Spiegellinien', 4: 'einen 4-zähligen Drehpunkt ohne Spiegellinien',
  '4mm': 'einen 4-zähligen Drehpunkt mit vier Spiegellinien', 3: 'einen 3-zähligen Drehpunkt ohne Spiegellinien',
  '3m': 'einen 3-zähligen Drehpunkt mit drei Spiegellinien', 6: 'einen 6-zähligen Drehpunkt ohne Spiegellinien',
  '6mm': 'einen 6-zähligen Drehpunkt mit sechs Spiegellinien',
};
// Ablenker je Punktgruppe: zuerst dieselbe ohne Spiegellinien bzw. mit, dann Nachbarn
const PG_ABLENKER = {
  1: ['2', 'm', '2mm'], 2: ['1', 'm', '2mm'], m: ['1', '2', '2mm'], '2mm': ['2', 'm', '4mm'], 4: ['2', '4mm', '6'],
  '4mm': ['4', '2mm', '6mm'], 3: ['6', '3m', '2'], '3m': ['3', '6mm', '2mm'], 6: ['3', '6mm', '4'], '6mm': ['6', '3m', '4mm'],
};
const ohneSpiegel = (p) => p.replace(/m/g, '') || '1';
/** Typischer Fehler hinter einer falschen Punktgruppe. */
function hinweisPunktgruppe(symbol, richtig, falsch) {
  if (falsch === ohneSpiegel(richtig)) {
    return symbol.includes('g')
      ? 'Das wäre die Punktgruppe ohne Spiegellinien. Ein <i>g</i> im Symbol zählt für die Punktgruppe wie ein <i>m</i>: Ohne ihre Verschiebung ist die Gleitspiegelung eine Spiegelung.'
      : 'Das wäre die Punktgruppe ohne Spiegellinien. Jedes <i>m</i> im Symbol gehört auch zur Punktgruppe.';
  }
  return `Die Punktgruppe ${pgHTML(falsch)} hat ${PG_TEXT[falsch]}. ${symbol === 'p1' ? 'Bei <i>p</i>1 lässt man nur den Zellbuchstaben weg: 1.' : `Für ${S(symbol)} lässt man den Zellbuchstaben und die Einsen weg und liest <i>g</i> als <i>m</i>.`}`;
}
export const PUNKTGRUPPE = {
  id: 'punktgruppe', kapitel: 5, stufen: [1], status: 'entwurf',
  params: () => ALLE.flatMap((g) => [`${g}:pg`, `${g}:sys`]),
  make(param) {
    const [g, art] = param.split(':');
    const d = ebenengruppe(g);
    if (art === 'sys') {
      const ab = SYSTEME.filter((x) => x !== d.system);
      return {
        typ: 'einfach',
        lernziel: 'zu einer Ebenengruppe die Punktgruppe und das Kristallsystem angeben',
        frage: `Zu welchem Kristallsystem gehört die Ebenengruppe ${S(g)}?`,
        antworten: [d.system, ...ab],
        richtig: [0],
        hinweise: [null, ...ab.map((x) => `Im ${x}en System gilt: ${SYSTEM_GRUND[x]}. Die Punktgruppe von ${S(g)} ist aber ${pgHTML(d.punktgruppe)}; ${SYSTEM_GRUND[d.system]}.`)],
        erklaerung: `Die Punktgruppe von ${S(g)} ist ${pgHTML(d.punktgruppe)}; ${SYSTEM_GRUND[d.system]}. Die Symmetrie erzwingt die Metrik, nicht umgekehrt.`,
        skript: 'punktgruppe-system', app: `#m=eg&g=${g}`,
        quelle: 'Borchardt-Ott & Sowa (2018), Abschn. 10.2, Tab. 10.1',
      };
    }
    const r = d.punktgruppe;
    const ab = PG_ABLENKER[r];
    return {
      typ: 'einfach',
      lernziel: 'zu einer Ebenengruppe die Punktgruppe und das Kristallsystem angeben',
      frage: `Welche Punktgruppe hat die Ebenengruppe ${S(g)}?`,
      antworten: [r, ...ab].map(pgHTML),
      richtig: [0],
      hinweise: [null, ...ab.map((p) => hinweisPunktgruppe(g, r, p))],
      erklaerung: g === 'p1' ? 'Bei <i>p</i>1 lässt man nur den Zellbuchstaben weg: <i>p</i>1 → 1.' : `Zellbuchstaben weglassen, <i>g</i> durch <i>m</i> ersetzen und Einsen weglassen: ${S(g)} → ${pgHTML(r)}.`,
      skript: 'punktgruppe-system', app: `#m=eg&g=${g}`,
      quelle: 'Borchardt-Ott & Sowa (2018), Abschn. 10.2, Tab. 10.1',
    };
  },
};

// ------------------------------------------------------------------ Lage: Zähligkeit und Lagesymmetrie
// Stufe 1: primitive symmorphe Gruppen, deren Lagen Skript Kap. 6 ausführlich zeigt; Stufe 2: die übrigen (zentriert, nichtsymmorph)
const GRUND = ['p2mm', 'p4mm', 'p6mm'];
/** Punkt auf der Wyckoff-Lage b (mit festen Werten für freie Parameter) und die Lage, wie die App sie bestimmt. */
export function lagePunkt(symbol, b) {
  const g = gruppe(symbol);
  const p = punktAufLage(g, b, [0.137, 0.291]);
  return { g, p, l: lage(g, p) };
}
/** Ordnung einer Lagesymmetrie aus dem orientierten Symbol: n-zähliger Drehpunkt mit Spiegellinien hat 2n, ohne n; m allein 2. */
const ordnung = (sym) => {
  const s = sym.replace(/\./g, '');
  const n = Number(s.match(/^\d/)?.[0] ?? 1);
  const m = (s.match(/m/g) || []).length;
  return m ? (n === 1 ? 2 : 2 * n) : n;
};
// Lagesymmetrie als Punktgruppe (ohne die Punkte des orientierten Symbols, Skript Abschn. 6.2)
const symHTML = (sym) => (sym.replace(/\./g, '') || '1').replace(/m/g, '<i>m</i>');
export const LAGE = {
  id: 'lage', kapitel: 6, stufen: [1, 2], status: 'entwurf',
  params: (s) => EBENENGRUPPEN.filter((d) => (s === 1) === GRUND.includes(d.symbol))
    .flatMap((d) => {
      // je Gruppe nur eine Lage je Paar aus Zähligkeit und Lagesymmetrie (sonst gleiche Fragen)
      const gesehen = new Set();
      return d.wyckoff.filter((w) => {
        const k = `${w.n}|${w.sym.replace(/\./g, '')}`;
        if (w.sym === '1' || gesehen.has(k)) return false;
        gesehen.add(k);
        return true;
      }).map((w) => `${d.symbol}:${w.b}`);
    }),
  make(param) {
    const [symbol, b] = param.split(':');
    const d = ebenengruppe(symbol);
    const { p, l } = lagePunkt(symbol, b);
    const w = d.wyckoff.find((x) => x.b === b);
    const N = d.wyckoff[0].n;
    const text = (n, sym) => `Zähligkeit ${n}, Lagesymmetrie ${symHTML(sym)}`;
    const richtig = text(w.n, w.sym);
    const kand = [];
    // allgemeine Lage; Zähligkeit falsch (Lagesymmetrie richtig); andere spezielle Lagen derselben Gruppe
    kand.push([N, '1', `So wäre es in allgemeiner Lage. Das Fähnchen liegt aber auf ${/[2-6]/.test(w.sym) ? 'einem Drehpunkt' : 'einer Spiegellinie'}; dort fallen Kopien zusammen.`]);
    const nFalsch = w.n * 2 < N ? w.n * 2 : w.n / 2;
    if (Number.isInteger(nFalsch) && nFalsch !== w.n) kand.push([nFalsch, w.sym, `Zähligkeit × Ordnung der Lagesymmetrie muss die Zähligkeit der allgemeinen Lage ergeben, hier ${N}.${symbol.startsWith('c') ? ' In der zentrierten Zelle verdoppelt die Zentrierung (0,&nbsp;0)+ (½,&nbsp;½)+ jede Lage.' : ''}`]);
    for (const x of d.wyckoff) if (x.sym !== '1' && x.b !== b) kand.push([x.n, x.sym, `So wäre es auf einer Lage mit der Lagesymmetrie ${symHTML(x.sym)}. Entscheidend ist, welche Drehpunkte und Spiegellinien durch den markierten Punkt gehen.`]);
    // Reserve: Lagesymmetrie 1 bei richtiger Zähligkeit; richtige Lagesymmetrie bei Zähligkeit der allgemeinen Lage
    kand.push([w.n, '1', 'Lagesymmetrie 1 hat nur die allgemeine Lage. Hier geht ein Drehpunkt oder eine Spiegellinie durch den markierten Punkt.']);
    kand.push([N, w.sym, `Auf einer Lage mit der Lagesymmetrie ${symHTML(w.sym)} fallen Kopien zusammen; die Zähligkeit ist deshalb kleiner als die der allgemeinen Lage.`]);
    const ab = [];
    for (const [n, sym, h] of kand) {
      const t = text(n, sym);
      if (t !== richtig && !ab.some((a) => a.t === t) && ab.length < 3) ab.push({ t, h });
    }
    return {
      typ: 'bild-text',
      lernziel: 'allgemeine und spezielle Lagen unterscheiden und für eine Lage Zähligkeit, Lagesymmetrie und Freiheitsgrade angeben',
      frage: `Das markierte Fähnchen (gestrichelter Kreis) sitzt auf einer speziellen Lage der Ebenengruppe ${S(symbol)}. Welche Zähligkeit und welche Lagesymmetrie hat diese Lage?`,
      bild: `#m=eg&g=${symbol}&x=${koordText(p[0])}&y=${koordText(p[1])}`, bildAlt: `Elementarzelle von ${symbol} mit einem Fähnchen auf einer speziellen Lage`,
      antworten: [richtig, ...ab.map((a) => a.t)],
      richtig: [0],
      hinweise: [null, ...ab.map((a) => a.h)],
      erklaerung: `Das Fähnchen liegt auf der Wyckoff-Lage ${w.n}<i>${w.b}</i> mit der Lagesymmetrie ${symHTML(w.sym)}. Die allgemeine Lage hat die Zähligkeit ${N}; ${N} = ${w.n} × ${ordnung(w.sym)}.`,
      skript: 'wyckoff', app: `#m=eg&g=${symbol}&x=${koordText(p[0])}&y=${koordText(p[1])}`,
      quelle: 'International Tables for Crystallography, Vol. A (2006), Part 6',
      // für den Test: die App bestimmt an diesem Punkt genau diese Lage
      pruefung: { symbol, buchstabe: l.buchstabe },
    };
  },
};

// ------------------------------------------------------------------ Struktur (Vorgabe) → Ebenengruppe
function strukturGenerator({ id, kapitel, gruppen, ohne = [], ausser = [], frage, bindungen = false, zoom = () => 1, lernziel, skript }) {
  const vorgaben = VORGABEN.filter((v) => gruppen.includes(v.gruppe) && !ohne.includes(v.id));
  return {
    id, kapitel, stufen: [2], status: 'entwurf',
    params: () => vorgaben.map((v) => v.id),
    make(vid) {
      const v = vorgaben.find((x) => x.id === vid);
      const g = v.erwartet;
      const ab = gruppenAblenker(g, 3, ausser);
      const zz = zoom(vid) === 1 ? '' : `&zoom=${zoom(vid)}`; // Vergrösserung des Musters (Tafel B), auch im App-Link
      return {
        typ: 'bild-text',
        lernziel,
        frage,
        bild: `B#m=struktur&v=${vid}${bindungen ? '' : '&sbind=0'}${zz}`, bildAlt: 'Periodisches Muster mit hervorgehobener Elementarzelle',
        antworten: [g, ...ab].map(S),
        richtig: [0],
        hinweise: [null, ...ab.map(hinweisGruppe)],
        erklaerung: `Das Muster hat ${S(g)}: ${MERKMALE[g]}.`,
        skript, app: `#m=struktur&v=${vid}${zz}`,
        quelle: 'Symmetriebestimmung der App (Vorgaben im Modus „Gitter und Basis“)',
      };
    },
  };
}
export const STRUKTUR = strukturGenerator({
  id: 'struktur', kapitel: 3,
  gruppen: ['Bravais-Gitter', 'Dreiecksbeispiel', '2D-Materialien', 'Künstliches Spin-Eis'],
  // Gleitspiegellinien kommen erst in Kap. 4, p3m1 und p31m unterscheidet erst Kap. 5
  ohne: ['dreieck2', 'dreieck3', 'asi-pinwheel'],
  ausser: ['pg', 'p2mg', 'p2gg', 'p4gm', 'p31m'],
  frage: 'Welche Ebenengruppe hat das Muster? Hervorgehoben ist eine Elementarzelle; gleiche Farbe und Form heissen gleiches Motiv.',
  // Motive gross genug: Gitter etwas, Strukturen deutlich vergrössert; das dichte Kagome-Spin-Eis nicht
  zoom: (vid) => (vorgabe(vid).gruppe === 'Bravais-Gitter' ? 1.25 : vid === 'asi-kagome' ? 1 : 1.6),
  lernziel: 'die Symmetrie eines Musters aus Gitter und Motiv bestimmen und begründen, warum das Motiv die Symmetrie des Gitters nur erniedrigen kann',
  skript: 'gitter-und-motiv',
});
export const VERBAND = strukturGenerator({
  id: 'verband', kapitel: 7,
  gruppen: ['Mauerwerk und Pflaster'],
  frage: 'Welche Ebenengruppe hat der Verband? Alle Steine sind gleich; hervorgehoben ist eine Elementarzelle.',
  lernziel: 'an Mauerwerk und Pflaster zeigen, wie der Versatz der Reihen die Symmetrie ändert, und die Ebenengruppen der Beispiele im Bild nachvollziehen',
  skript: 'mauerwerk',
});

export const PARKETT = strukturGenerator({
  id: 'parkett', kapitel: 7,
  gruppen: ['Archimedische Parkettierungen'],
  bindungen: true,
  frage: 'Welche Ebenengruppe hat die Parkettierung? Hervorgehoben ist eine Elementarzelle.',
  lernziel: 'Parkettierungen aus regelmässigen Vielecken beschreiben und ihre Symmetrie angeben',
  skript: 'fliesen',
});

// ------------------------------------------------------------------ Untergruppen der Punktgruppen (Kap. 4)
// Operationen und Verknüpfungen aus punktoperationen.js (Test: Gruppentafel 3m = Tafel im Skript).
// Ohne 2mm und ohne die Untergruppen m: Jede Menge {1, X} mit X ∘ X = 1 ist eine Gruppe; die richtige
// Antwort wäre dort die einzige zweielementige Menge mit der Identität.
const PG_REIHE = ['4', '3m', '4mm', '6', '6mm'];
const BILD_PG = { '3m': 'skizze:3m', '4mm': 'skizze:4mm', '6mm': 'skizze:6mm' };
export const mengeHTML = (pg, s) => `{${s.map((i) => OPERATIONEN[pg][i].html).join(', ')}}`;
const zusammensetzung = (pg, s) => { const d = s.filter((i) => OPERATIONEN[pg][i].art === 'd').length; return [d, s.length - d]; };
const symDiff = (x, y) => x.filter((i) => !y.includes(i)).length + y.filter((i) => !x.includes(i)).length;

/**
 * Drei Teilmengen, die keine Gruppen sind, möglichst ähnlich zur Untergruppe t und untereinander
 * verschieden. Die richtige Antwort soll sich nicht durch eine äussere Eigenschaft verraten: Für
 * Grösse, Zahl der Spiegelungen und „enthält die Identität“ hat möglichst ein Ablenker denselben Wert.
 */
export function untergruppenAblenker(pg, t) {
  const n = OPERATIONEN[pg].length;
  const [td, tm] = zusammensetzung(pg, t);
  const merkmale = (s) => [s.length, zusammensetzung(pg, s)[1], s.includes(0)];
  const mt = merkmale(t);
  const kand = teilmengen(n, 2, n - 1).filter((s) => !istGruppe(pg, s));
  const gewaehlt = [];
  const kleiner = (x, y) => { for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i]; return false; };
  while (gewaehlt.length < 3) {
    const offen = mt.map((v, i) => !gewaehlt.some((g) => merkmale(g)[i] === v));
    let best = null; let bestKey = null;
    for (const s of kand) {
      if (gewaehlt.includes(s)) continue;
      const [d, m] = zusammensetzung(pg, s);
      const neu = merkmale(s).filter((v, i) => offen[i] && v === mt[i]).length;
      const vielfalt = gewaehlt.length ? Math.min(...gewaehlt.map((g) => symDiff(g, s))) : 0;
      const key = [-neu, Math.abs(s.length - t.length), s.includes(0) ? 0 : 1, Math.abs(d - td) + Math.abs(m - tm), -Math.min(vielfalt, 2), symDiff(s, t)];
      if (!bestKey || kleiner(key, bestKey)) { best = s; bestKey = key; }
    }
    gewaehlt.push(best);
  }
  return gewaehlt;
}

/** Warum die Menge keine Gruppe ist (Text mit HTML). */
export function untergruppenHinweis(pg, s) {
  const o = OPERATIONEN[pg];
  if (!s.includes(0)) {
    for (const a of s) for (const b of s) if (verknuepfe(pg, a, b) === 0) return `Es fehlt die Identität: ${o[a].html} ∘ ${o[b].html} = 1 liegt nicht in der Menge.`;
    return 'Es fehlt die Identität 1; jede Gruppe enthält sie.';
  }
  const [a, b] = nichtAbgeschlossen(pg, s);
  return `${o[a].html} ∘ ${o[b].html} = ${o[verknuepfe(pg, a, b)].html} liegt nicht in der Menge.`;
}

export const UNTERGRUPPE = {
  id: 'untergruppe', kapitel: 4, stufen: [1], status: 'entwurf',
  // je Punktgruppe eine Frage je Art von Untergruppe (z. B. nur eine der beiden Untergruppen 2mm von 4mm)
  params: () => PG_REIHE.flatMap((pg) => {
    const gesehen = new Set();
    // in 4mm und 6mm ohne die Drehgruppen 2 und 3: dieselbe Frage wie in 4 und 6
    const nurDrehungen = (s) => zusammensetzung(pg, s)[1] === 0 && s.length < zusammensetzung(pg, OPERATIONEN[pg].map((_, i) => i))[0];
    return untergruppen(pg)
      .filter((s) => symbolVon(pg, s) !== 'm' && !(pg.endsWith('mm') && nurDrehungen(s)))
      .filter((s) => !gesehen.has(symbolVon(pg, s)) && gesehen.add(symbolVon(pg, s)))
      .map((s) => `${pg}:${s.join('.')}`);
  }),
  make(param) {
    const [pg, liste] = param.split(':');
    const t = liste.split('.').map(Number);
    const ab = untergruppenAblenker(pg, t);
    const o = OPERATIONEN[pg];
    // ein Beispiel für die Abgeschlossenheit: zwei Operationen ausser der Identität
    const x = t.filter((i) => i !== 0);
    const [a, b] = x.length > 1 ? [x[1], x[0]] : [x[0], x[0]];
    const bild = BILD_PG[pg];
    return {
      typ: bild ? 'bild-text' : 'einfach',
      lernziel: 'die Gruppentafel einer Punktgruppe lesen und aufstellen',
      frage: `Welche Teilmenge der Punktgruppe ${pgHTML(pg)} ist selbst eine Gruppe (eine Untergruppe)?${bild ? ' Das Bild zeigt die Bezeichnungen der Operationen.' : ''}`,
      ...(bild ? { bild, bildAlt: `Punktgruppe ${pg} mit den Bezeichnungen der Spiegellinien` } : {}),
      antworten: [t, ...ab].map((s) => mengeHTML(pg, s)),
      richtig: [0],
      hinweise: [null, ...ab.map((s) => untergruppenHinweis(pg, s))],
      erklaerung: `Die Menge enthält die Identität, und jede Verknüpfung zweier ihrer Operationen liegt wieder in ihr, zum Beispiel ${o[a].html} ∘ ${o[b].html} = ${o[verknuepfe(pg, a, b)].html}. Sie bildet die Punktgruppe ${pgHTML(symbolVon(pg, t))}.`,
      skript: 'verknuepfung',
      quelle: 'Skript, Abschn. 4.4, Abb. 4.4 und 4.5',
      pruefung: { art: 'untergruppe', pg, menge: t },
    };
  },
};

// ------------------------------------------------------------------ Muster → Ebenengruppe (Kap. 5)
// Nach Borchardt-Ott, Aufg. 10.1 („nach Kockel“): das Muster aus Fähnchen ohne Symmetrieelemente,
// die Elementarzelle hervorgehoben. Spiegelbildliche Fähnchen haben eine andere Farbe (wie in der App).
// Lage des Fähnchens je Gruppe: allgemeine Lage mit möglichst grossem Abstand zwischen den Kopien
// (Raster 1/40, gesucht mit bahn() aus symmetrie.js), damit sich die Fähnchen nicht überdecken.
const MUSTER_PUNKT = {
  p1: [0.1, 0.1], p2: [0.2, 0.275], pm: [0.25, 0.1], pg: [0.25, 0.1], cm: [0.25, 0.1], p2mm: [0.25, 0.2], p2mg: [0.5, 0.2],
  p2gg: [0.25, 0.125], c2mm: [0.175, 0.125], p4: [0.2, 0.3], p4mm: [0.15, 0.35], p4gm: [0.25, 0.5],
  p3: [0.35, 0.35], p3m1: [0.325, 0.325], p31m: [0.2, 0.4], p6: [0.15, 0.425], p6mm: [0.125, 0.45],
};
export const MUSTER = {
  id: 'muster', kapitel: 5, stufen: [2], status: 'entwurf',
  params: () => ALLE,
  make(g) {
    const ab = gruppenAblenker(g);
    const [x, y] = MUSTER_PUNKT[g];
    const adr = `#m=eg&g=${g}&x=${x}&y=${y}`;
    return {
      typ: 'bild-text',
      lernziel: 'die beiden Diagramme einer Ebenengruppe in den International Tables lesen',
      frage: 'Das Bild zeigt ein Muster aus Fähnchen; hervorgehoben ist eine Elementarzelle, spiegelbildliche Fähnchen haben die andere Farbe. Welche Ebenengruppe hat das Muster?',
      bild: `B${adr}&zoom=1.3`, bildAlt: 'Muster aus Fähnchen mit hervorgehobener Elementarzelle',
      antworten: [g, ...ab].map(S),
      richtig: [0],
      hinweise: [null, ...ab.map(hinweisGruppe)],
      erklaerung: `Das Muster hat ${S(g)}: ${MERKMALE[g]}.`,
      skript: 'diagramme', app: `${adr}&mel=1`,
      quelle: 'Borchardt-Ott & Sowa (2018), Aufg. 10.1; Symmetrieelemente aus den Daten der App',
    };
  },
};

// ------------------------------------------------------------------ Element an gegebener Lage → Koordinaten (Kap. 4)
// Nach Borchardt-Ott, Aufg. 10.2 b, d, l: In einer rechteckigen Zelle liegt ein Symmetrieelement an
// gegebener Stelle; gesucht sind die Koordinaten des Bildpunkts von (x, y) wie in den International Tables.
const BR = { 0: '0', 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.75: '¾', 1: '1' };
const br = (v) => BR[Math.round(v * 1000) / 1000] ?? String(v);
const MX = [[-1, 0], [0, 1]]; const MY = [[1, 0], [0, -1]]; const ZWEI = [[-1, 0], [0, -1]];
/** Elemente: Spiegellinie oder Gleitspiegellinie x = c bzw. y = c, Drehpunkt (p, q). */
export const ELEMENTE_LAGE = {
  'm-x14': { art: 'm', achse: 'x', c: 0.25 },
  'm-y14': { art: 'm', achse: 'y', c: 0.25 },
  'g-x14': { art: 'g', achse: 'x', c: 0.25 },
  'g-y14': { art: 'g', achse: 'y', c: 0.25 },
  'g-x0': { art: 'g', achse: 'x', c: 0 },
  'g-y0': { art: 'g', achse: 'y', c: 0 },
  '2-1414': { art: '2', punkt: [0.25, 0.25] },
  '2-140': { art: '2', punkt: [0.25, 0] },
  '2-014': { art: '2', punkt: [0, 0.25] },
};
/** Operation { R, t } zum Element. */
export function elementOp(e) {
  if (e.art === '2') return { R: ZWEI, t: [2 * e.punkt[0], 2 * e.punkt[1]] };
  const gl = e.art === 'g' ? 0.5 : 0;
  return e.achse === 'x' ? { R: MX, t: [2 * e.c, gl] } : { R: MY, t: [gl, 2 * e.c] };
}
/** Das Element in Worten, wie es in der Zelle liegt. */
export function elementText(e) {
  if (e.art === '2') return `ein 2-zähliger Drehpunkt bei (${br(e.punkt[0])},&nbsp;${br(e.punkt[1])})`;
  const linie = `<i>${e.achse}</i> = ${br(e.c)}`;
  return e.art === 'm' ? `eine Spiegellinie bei ${linie}` : `eine Gleitspiegellinie bei ${linie} mit der Gleitkomponente ${e.achse === 'x' ? '<i>b</i>' : '<i>a</i>'}/2`;
}
/** Koordinaten des Bildpunkts in der Schreibweise des Skripts, etwa x̄ + ½, y. */
export function koordHTML(op) {
  const zeile = (r, t) => {
    const v = r[0] !== 0 ? 'x' : 'y'; const c = r[0] !== 0 ? r[0] : r[1];
    const kern = c < 0 ? ov(v) : `<i>${v}</i>`;
    return Math.abs(t) < 1e-9 ? kern : `${kern} ${t < 0 ? '−' : '+'} ${br(Math.abs(t))}`;
  };
  return `${zeile(op.R[0], op.t[0])}, ${zeile(op.R[1], op.t[1])}`;
}
const ov = (v) => `<i><span class="ov">${v}</span></i>`;
/** Das Element einer Operation in Worten (nur Spiegelung, Gleitspiegelung mit halber Translation und Drehung um 180°). */
export function elementWort(op) {
  const a = art(op);
  if (a.art === 'dreh' && a.n === 2) return `die Drehung um 180° um den Punkt (${br(a.punkt[0])},&nbsp;${br(a.punkt[1])})`;
  if (a.art !== 'spiegel' && a.art !== 'gleit') return null;
  const linie = a.richtung[0] === 0 ? `<i>x</i> = ${br(a.punkt[0])}` : `<i>y</i> = ${br(a.punkt[1])}`;
  if (a.art === 'spiegel') return `die Spiegelung an der Linie ${linie}`;
  const w = a.richtung[0] === 0 ? a.gleit[1] : a.gleit[0];
  if (Math.abs(Math.abs(w) - 0.5) > 1e-9) return null;
  return `die Gleitspiegelung an der Linie ${linie} mit der Gleitkomponente ${a.richtung[0] === 0 ? '<i>b</i>' : '<i>a</i>'}/2`;
}
/** Drei falsche Bildkoordinaten: Verschiebung nur einfach statt doppelt, Gleitanteil vertauscht, andere Operation. */
export function koordAblenker(e) {
  const op = elementOp(e);
  const kand = [];
  if (e.art === '2') {
    kand.push({ R: ZWEI, t: [op.t[0] / 2, op.t[1] / 2] });
    kand.push({ R: MX, t: [...op.t] }, { R: MY, t: [...op.t] });
  } else {
    const senk = e.achse === 'x' ? 0 : 1; const entlang = 1 - senk;
    const halb = [...op.t]; halb[senk] /= 2; kand.push({ R: op.R, t: halb });
    const tausch = [...op.t]; tausch[entlang] = e.art === 'g' ? 0 : 0.5; kand.push({ R: op.R, t: tausch });
    kand.push({ R: ZWEI, t: [...op.t] });
    const andere = [...op.t].reverse(); kand.push({ R: e.achse === 'x' ? MY : MX, t: andere });
  }
  // Reserve: alle Spiegelungen, Gleitspiegelungen und Drehungen mit Verschiebungen 0, ¼, ½
  for (const R of [op.R, MX, MY, ZWEI]) for (const t0 of [0, 0.25, 0.5]) for (const t1 of [0, 0.25, 0.5]) kand.push({ R, t: [t0, t1] });
  const out = [];
  for (const d of kand) {
    if (out.length === 3) break;
    if (gleichModGitter(d, op) || out.some((x) => gleichModGitter(x, d)) || !elementWort(d)) continue;
    out.push(d);
  }
  return out;
}
export const KOORDINATEN = {
  id: 'koordinaten', kapitel: 4, stufen: [2], status: 'entwurf',
  params: () => Object.keys(ELEMENTE_LAGE),
  make(id) {
    const e = ELEMENTE_LAGE[id];
    const op = elementOp(e);
    const ab = koordAblenker(e);
    let regel;
    if (e.art === '2') regel = `Bei der Drehung um 180° um (<i>p</i>,&nbsp;<i>q</i>) wird <i>x</i> zu −<i>x</i> + 2<i>p</i> und <i>y</i> zu −<i>y</i> + 2<i>q</i>; der Drehpunkt liegt in der Mitte zwischen Punkt und Bild.`;
    else {
      const [v, w] = e.achse === 'x' ? ['x', 'y'] : ['y', 'x'];
      regel = `Bei der Spiegelung an der Linie <i>${v}</i> = <i>c</i> wird <i>${v}</i> zu −<i>${v}</i> + 2<i>c</i>; die Linie liegt in der Mitte zwischen Punkt und Bild.${e.art === 'g' ? ` Die Gleitkomponente verschiebt zusätzlich entlang der Linie: <i>${w}</i> wird zu <i>${w}</i> + ½.` : ''}`;
    }
    return {
      typ: 'einfach',
      lernziel: 'eine Symmetrieoperation in der Schreibweise der International Tables lesen, etwa <i><span class="ov">x</span></i>&nbsp;+&nbsp;½, <i>y</i>',
      frage: `In einer rechteckigen Zelle liegt ${elementText(e)}. Welche Koordinaten hat das Bild des Punktes (<i>x</i>,&nbsp;<i>y</i>) bei der zugehörigen Operation?`,
      antworten: [op, ...ab].map(koordHTML),
      richtig: [0],
      hinweise: [null, ...ab.map((d) => `Das wäre ${elementWort(d)}.`)],
      erklaerung: `${regel} Hier: ${koordHTML(op)}.`,
      skript: 'operationen',
      quelle: 'Borchardt-Ott & Sowa (2018), Aufg. 10.2; Skript Abschn. 4.2',
      pruefung: { art: 'koordinaten', element: id },
    };
  },
};

// ------------------------------------------------------------------ Gleitspiegellinien, die das Symbol nicht nennt (Kap. 4)
// Borchardt-Ott S. 206; Skript Abschn. 4.5. Aus den Symmetrieelementen der App.
const linienArten = (g) => { const l = elemente(gruppe(g)).linien; return { m: l.some((x) => x.art === 'spiegel'), g: l.some((x) => x.art === 'gleit') }; };
export const MIT_GLEIT = ALLE.filter((g) => !g.includes('g') && linienArten(g).g);
export const OHNE_GLEIT = ALLE.filter((g) => !linienArten(g).g);
const NAEHE = { cm: ['pm', 'p2mm', 'p1'], c2mm: ['p2mm', 'pm', 'p2'], p4mm: ['p4', 'p2mm', 'pm'], p3m1: ['p3', 'p6', 'pm'], p31m: ['p3', 'p6', 'p2mm'], p6mm: ['p6', 'p3', 'p2mm'] };
export const GLEIT_UNGENANNT = {
  id: 'gleit-ungenannt', kapitel: 4, stufen: [2], status: 'entwurf',
  params: () => MIT_GLEIT,
  make(g) {
    const ab = (NAEHE[g] || OHNE_GLEIT).filter((x) => OHNE_GLEIT.includes(x)).slice(0, 3);
    return {
      typ: 'einfach',
      lernziel: 'begründen, warum ein Muster mehr Symmetrieelemente hat, als sein Symbol nennt',
      frage: 'Welche dieser Ebenengruppen hat Gleitspiegellinien, obwohl ihr Symbol kein <i>g</i> enthält?',
      antworten: [g, ...ab].map(S),
      richtig: [0],
      hinweise: [null, ...ab.map((x) => `${S(x)} hat ${MERKMALE[x]}.`)],
      erklaerung: `${S(g)} hat ${MERKMALE[g]}. Die Gleitspiegellinien folgen aus Spiegelungen und Translationen schräg zu den Spiegellinien; das Symbol nennt je Blickrichtung nur die Spiegellinie.`,
      skript: 'mehr-elemente', app: `#m=eg&g=${g}`,
      quelle: 'Borchardt-Ott & Sowa (2018), S. 206; Symmetrieelemente aus den Daten der App',
    };
  },
};

// ------------------------------------------------------------------ Kommt es auf die Reihenfolge an? (Kap. 4)
// Borchardt-Ott S. 264 ff. (abelsche Gruppen). Aus punktoperationen.js.
const PG_ALLE = ['2mm', '4', '6', '3m', '4mm', '6mm'];
/** Erstes Paar (A, B) mit A ∘ B ≠ B ∘ A oder null. */
export function nichtVertauschbar(pg) {
  const n = OPERATIONEN[pg].length;
  for (let a = 1; a < n; a++) for (let b = a + 1; b < n; b++) if (verknuepfe(pg, a, b) !== verknuepfe(pg, b, a)) return [a, b];
  return null;
}
const ABELSCH = PG_ALLE.filter((pg) => !nichtVertauschbar(pg));
const NICHT_ABELSCH = PG_ALLE.filter((pg) => nichtVertauschbar(pg));
const gegenbeispiel = (pg) => {
  const o = OPERATIONEN[pg]; const [a, b] = nichtVertauschbar(pg);
  return `${o[b].html} ∘ ${o[a].html} = ${o[verknuepfe(pg, b, a)].html}, aber ${o[a].html} ∘ ${o[b].html} = ${o[verknuepfe(pg, a, b)].html}`;
};
const grundAbelsch = (pg) => (pg === '2mm' ? 'jede Operation ist zu sich selbst invers, zum Beispiel <i>m</i><sub><i>a</i></sub> ∘ <i>m</i><sub><i>b</i></sub> = <i>m</i><sub><i>b</i></sub> ∘ <i>m</i><sub><i>a</i></sub> = 2' : 'Drehungen um denselben Punkt sind vertauschbar');
export const REIHENFOLGE = {
  id: 'reihenfolge', kapitel: 4, stufen: [2], status: 'entwurf',
  params: () => [...NICHT_ABELSCH.map((pg) => `ja:${pg}`), ...ABELSCH.map((pg) => `nein:${pg}`)],
  make(param) {
    const [ja, pg] = param.split(':');
    const kommt = ja === 'ja';
    const ab = kommt ? ABELSCH : NICHT_ABELSCH;
    return {
      typ: 'einfach',
      lernziel: 'die Gruppentafel einer Punktgruppe lesen und aufstellen',
      frage: `In welcher dieser Punktgruppen kommt es bei der Verknüpfung zweier Operationen ${kommt ? '' : 'nie '}auf die Reihenfolge an?`,
      antworten: [pg, ...ab].map(pgHTML),
      richtig: [0],
      hinweise: [null, ...ab.map((x) => (kommt ? `In ${pgHTML(x)} kommt es nicht darauf an: ${grundAbelsch(x)}.` : `In ${pgHTML(x)} kommt es darauf an: ${gegenbeispiel(x)}.`))],
      erklaerung: kommt
        ? `In ${pgHTML(pg)} ist ${gegenbeispiel(pg)}; die Gruppentafel ist nicht symmetrisch zur Diagonalen, die Gruppe ist nicht abelsch.`
        : `${pgHTML(pg)} ist abelsch: ${grundAbelsch(pg)}. Die Gruppentafel ist symmetrisch zur Diagonalen.`,
      skript: 'verknuepfung',
      quelle: 'Skript, Abschn. 4.4; Borchardt-Ott & Sowa (2018), Abschn. 11.4',
      pruefung: { art: 'reihenfolge', pg, kommt },
    };
  },
};

export const GENERATOREN = [DIAGRAMM, PUNKTGRUPPE, LAGE, STRUKTUR, VERBAND, PARKETT, UNTERGRUPPE, MUSTER, KOORDINATEN, GLEIT_UNGENANNT, REIHENFOLGE];
