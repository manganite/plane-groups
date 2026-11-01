// Erzeugte Fragen: aus den Daten der App, die schon getestet sind, mit sicherer richtiger Antwort.
// Ein Generator: { id, kapitel, stufen, status, params(stufe) → Parameter, make(param, stufe) → Frage }.
// Die Frage hat denselben Aufbau wie in quiz-bank.js (ohne id, stufe, kapitel, status; die setzt quiz-core.js).
// Bildangaben: Link-Adresse der App (Tafel A) oder „B#…“ (Tafel B, das Muster); siehe quiz-bild.js.

import { EBENENGRUPPEN, ebenengruppe } from './ebenengruppen.js';
import { gruppe, punktAufLage, lage } from './symmetrie.js';
import { koordText } from './zustand.js';
import { symbolHTML } from './text.js';
import { VORGABEN } from './vorgaben.js';

const S = symbolHTML;
const ALLE = EBENENGRUPPEN.map((d) => d.symbol);

/** Was eine Ebenengruppe im Bild zeigt (für Hinweise zu Ablenkern). Geprüft gegen die Elemente der App (Test). */
export const MERKMALE = {
  p1: 'nur Translationen, keine Drehpunkte und keine Spiegel- oder Gleitspiegellinien',
  p2: 'nur 2-zählige Drehpunkte, keine Spiegel- oder Gleitspiegellinien',
  pm: 'parallele Spiegellinien und keine Drehpunkte',
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
  p3m1: '3-zählige Drehpunkte, die alle auf Spiegellinien liegen; die Spiegellinien stehen senkrecht auf den Zellkanten',
  p31m: '3-zählige Drehpunkte, von denen nur ein Teil auf Spiegellinien liegt; die Spiegellinien laufen entlang der Zellkanten',
  p6: '6-, 3- und 2-zählige Drehpunkte, aber keine Spiegellinien',
  p6mm: '6-zählige Drehpunkte auf Schnittpunkten von Spiegellinien in sechs Richtungen',
};

// Ablenker: zuerst gleiche Punktgruppe, dann gleiches System, dann Nachbarsysteme
const NACHBARN = { schiefwinklig: ['rechteckig'], rechteckig: ['schiefwinklig', 'quadratisch'], quadratisch: ['rechteckig'], hexagonal: ['rechteckig'] };
/** Drei andere Ebenengruppen als Ablenker für symbol (deterministisch). */
export function gruppenAblenker(symbol, n = 3) {
  const d = ebenengruppe(symbol);
  const andere = EBENENGRUPPEN.filter((x) => x.symbol !== symbol);
  const out = [];
  const nimm = (liste) => { for (const x of liste) if (out.length < n && !out.includes(x.symbol)) out.push(x.symbol); };
  nimm(andere.filter((x) => x.punktgruppe === d.punktgruppe));
  nimm(andere.filter((x) => x.system === d.system));
  for (const s of NACHBARN[d.system]) nimm(andere.filter((x) => x.system === s));
  return out;
}

const hinweisGruppe = (falsch) => `${S(falsch)} hätte ${MERKMALE[falsch]}.`;

// ------------------------------------------------------------------ Symmetriegerüst → Ebenengruppe
// Stufe 1: symmorphe Gruppen; Stufe 2: die vier mit g im Symbol
const MIT_G = ['pg', 'p2mg', 'p2gg', 'p4gm'];
export const DIAGRAMM = {
  id: 'diagramm', kapitel: 5, stufen: [1, 2], status: 'entwurf',
  params: (s) => ALLE.filter((g) => (s === 2) === MIT_G.includes(g)),
  make(g) {
    const ab = gruppenAblenker(g);
    return {
      typ: 'bild-text',
      lernziel: 'die beiden Diagramme einer Ebenengruppe in den International Tables lesen',
      frage: 'Das Bild zeigt die Symmetrieelemente einer Elementarzelle wie im Diagramm der International Tables. Zu welcher Ebenengruppe gehört es?',
      bild: `#m=eg&g=${g}&obj=0`, bildAlt: 'Symmetriegerüst einer Elementarzelle',
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
  hexagonal: 'ein 3- oder 6-zähliger Drehpunkt verlangt a = b und γ = 120°',
  quadratisch: 'ein 4-zähliger Drehpunkt verlangt a = b und γ = 90°',
  rechteckig: 'Spiegellinien ohne 3-, 4- oder 6-zählige Drehpunkte verlangen nur γ = 90°',
  schiefwinklig: 'ohne Spiegellinien und ohne 3-, 4- oder 6-zählige Drehpunkte gibt es keine Bedingung an die Metrik',
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
      ? 'Das wäre die Punktgruppe ohne Spiegellinien. Ein g im Symbol zählt für die Punktgruppe wie ein m: Ohne ihre Verschiebung ist die Gleitspiegelung eine Spiegelung.'
      : 'Das wäre die Punktgruppe ohne Spiegellinien. Jedes m im Symbol gehört auch zur Punktgruppe.';
  }
  return `Die Punktgruppe ${pgHTML(falsch)} hat ${PG_TEXT[falsch]}. Für ${S(symbol)} lässt man den Zellbuchstaben und die Einsen weg und liest g als m.`;
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
        hinweise: [null, ...ab.map((x) => `Für das System ${x} gilt: ${SYSTEM_GRUND[x]}. Die Punktgruppe von ${S(g)} ist aber ${pgHTML(d.punktgruppe)}.`)],
        erklaerung: `Die Punktgruppe von ${S(g)} ist ${pgHTML(d.punktgruppe)}; ${SYSTEM_GRUND[d.system]}. Das System folgt der Symmetrie, nicht umgekehrt.`,
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
      erklaerung: `Zellbuchstaben weglassen, g durch m ersetzen und Einsen weglassen: ${S(g)} → ${pgHTML(r)}.`,
      skript: 'punktgruppe-system', app: `#m=eg&g=${g}`,
      quelle: 'Borchardt-Ott & Sowa (2018), Abschn. 10.2, Tab. 10.1',
    };
  },
};

// ------------------------------------------------------------------ Lage: Zähligkeit und Lagesymmetrie
const GRUND = ['p2', 'pm', 'p2mm', 'c2mm', 'p2mg', 'p4', 'p4mm', 'p6mm'];
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
    .flatMap((d) => d.wyckoff.filter((w) => w.sym !== '1').map((w) => `${d.symbol}:${w.b}`)),
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
    kand.push([N, '1', 'So wäre es in allgemeiner Lage. Das Fähnchen liegt aber auf einem Symmetrieelement; dort fallen Kopien zusammen.']);
    const nFalsch = w.n * 2 < N ? w.n * 2 : w.n / 2;
    if (Number.isInteger(nFalsch) && nFalsch !== w.n) kand.push([nFalsch, w.sym, `Zähligkeit × Ordnung der Lagesymmetrie ergibt die Zähligkeit der allgemeinen Lage, hier ${N}; mit ${symHTML(w.sym)} (Ordnung ${ordnung(w.sym)}) bleibt ${w.n}.`]);
    for (const x of d.wyckoff) if (x.sym !== '1' && x.b !== b) kand.push([x.n, x.sym, `Das ist die Wyckoff-Lage ${x.n}<i>${x.b}</i>. Das Fähnchen liegt nicht auf einem ihrer Punkte; achten Sie darauf, welche Elemente durch seinen Fusspunkt gehen.`]);
    // Reserve: Lagesymmetrie 1 bei richtiger Zähligkeit; richtige Lagesymmetrie bei Zähligkeit der allgemeinen Lage
    kand.push([w.n, '1', 'Lagesymmetrie 1 hat nur die allgemeine Lage. Hier geht ein Symmetrieelement durch den Fusspunkt des Fähnchens.']);
    kand.push([N, w.sym, `Auf einer Lage mit der Lagesymmetrie ${symHTML(w.sym)} fallen Kopien zusammen; die Zähligkeit ist deshalb kleiner als ${N}, die der allgemeinen Lage.`]);
    const ab = [];
    for (const [n, sym, h] of kand) {
      const t = text(n, sym);
      if (t !== richtig && !ab.some((a) => a.t === t) && ab.length < 3) ab.push({ t, h });
    }
    return {
      typ: 'bild-text',
      lernziel: 'allgemeine und spezielle Lagen unterscheiden und für eine Lage Zähligkeit, Lagesymmetrie und Freiheitsgrade angeben',
      frage: `Das Fähnchen sitzt mit seinem Fusspunkt auf einer Lage der Ebenengruppe ${S(symbol)}. Welche Zähligkeit und welche Lagesymmetrie hat diese Lage?`,
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
function strukturGenerator({ id, kapitel, gruppen, lernziel, skript }) {
  const vorgaben = VORGABEN.filter((v) => gruppen.includes(v.gruppe));
  return {
    id, kapitel, stufen: [2], status: 'entwurf',
    params: () => vorgaben.map((v) => v.id),
    make(vid) {
      const v = vorgaben.find((x) => x.id === vid);
      const g = v.erwartet;
      const ab = gruppenAblenker(g);
      return {
        typ: 'bild-text',
        lernziel,
        frage: 'Welche Ebenengruppe hat das Muster? Hervorgehoben ist eine Elementarzelle; gleiche Farbe heisst gleiche Atomsorte.',
        bild: `B#m=struktur&v=${vid}&sbind=0`, bildAlt: `Muster: ${v.name}`,
        antworten: [g, ...ab].map(S),
        richtig: [0],
        hinweise: [null, ...ab.map(hinweisGruppe)],
        erklaerung: `Vorgabe „${v.name}“: ${S(g)}. Das Muster hat ${MERKMALE[g]}.`,
        skript, app: `#m=struktur&v=${vid}`,
        quelle: 'Symmetriebestimmung der App (Vorgaben im Modus „Gitter und Basis“)',
      };
    },
  };
}
export const STRUKTUR = strukturGenerator({
  id: 'struktur', kapitel: 3,
  gruppen: ['Bravais-Gitter', 'Dreiecksbeispiel', '2D-Materialien', 'Künstliches Spin-Eis'],
  lernziel: 'die Symmetrie eines Musters aus Gitter und Motiv bestimmen und begründen, warum das Motiv die Symmetrie des Gitters nur erniedrigen kann',
  skript: 'gitter-und-motiv',
});
export const VERBAND = strukturGenerator({
  id: 'verband', kapitel: 7,
  gruppen: ['Mauerwerk und Pflaster'],
  lernziel: 'an Mauerwerk und Pflaster zeigen, wie der Versatz der Reihen die Symmetrie ändert, und die Ebenengruppen der Beispiele im Bild nachvollziehen',
  skript: 'mauerwerk',
});

export const PARKETT = strukturGenerator({
  id: 'parkett', kapitel: 7,
  gruppen: ['Archimedische Parkettierungen'],
  lernziel: 'Parkettierungen aus regelmässigen Vielecken beschreiben und ihre Symmetrie angeben',
  skript: 'fliesen',
});

export const GENERATOREN = [DIAGRAMM, PUNKTGRUPPE, LAGE, STRUKTUR, VERBAND, PARKETT];
