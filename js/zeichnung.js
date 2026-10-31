// Zeichnungen der Ebenengruppen als SVG: Symmetriegerüst (Tafel A) und Muster (Tafel B).
// Ohne DOM, damit sich alles in Node testen lässt; die Farben kommen als Objekt herein.
//
// Achsen wie in ITA Vol. A (2006), Abschn. 2.2.6.1 und Part 6: b nach rechts, a im Winkel γ
// dazu nach unten (bei γ = 90° senkrecht nach unten), Ursprung oben links. Bildschirm-
// koordinaten: x nach rechts, y nach unten. Symbole der Symmetrieelemente wie in ITA:
// Drehpunkte als Linse (2), Dreieck (3), Raute (4), Sechseck (6); Spiegellinien durchgezogen,
// Gleitspiegellinien gestrichelt.

import { gruppe as gruppeVon, elemente, anwenden, mod1, clipLinie, SYMMETRIERICHTUNGEN } from './symmetrie.js';
import { herkunft, herleitung, klassenSchluessel, schrittVon, elementVonOp } from './herkunft.js';

// ---------------------------------------------------------------------------------------------
// Metrik und Ansicht
// ---------------------------------------------------------------------------------------------

/** Gittervektoren in Bildschirmrichtungen (a = 1): a = (cos γ, sin γ), b = (b/a, 0). */
export function metrik({ ba, gamma }) {
  const g = (gamma * Math.PI) / 180;
  return { a: [Math.cos(g), Math.sin(g)], b: [ba, 0] };
}

/** Bruchkoordinaten → kartesisch (Bildschirmrichtungen, ohne Massstab). */
export const kart = (M, p) => [p[0] * M.a[0] + p[1] * M.b[0], p[0] * M.a[1] + p[1] * M.b[1]];

/** Kartesisch → Bruchkoordinaten. */
export function bruchVon(M, c) {
  const d = M.a[0] * M.b[1] - M.b[0] * M.a[1];
  return [(c[0] * M.b[1] - M.b[0] * c[1]) / d, (M.a[0] * c[1] - c[0] * M.a[1]) / d];
}

/** Matrix R (Bruchkoordinaten) als kartesische Matrix C·R·C⁻¹. */
export function kartMatrix(M, R) {
  const C = [[M.a[0], M.b[0]], [M.a[1], M.b[1]]];
  const d = C[0][0] * C[1][1] - C[0][1] * C[1][0];
  const Ci = [[C[1][1] / d, -C[0][1] / d], [-C[1][0] / d, C[0][0] / d]];
  const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  return mul(mul(C, R), Ci);
}

/**
 * Ansicht: bildet das kartesische Rechteck [x0, y0, x1, y1] zentriert in ein quadratisches
 * Bild der Grösse groesse ab (Rand rand). zuBild(p) und vonBild(s) rechnen zwischen
 * Bruchkoordinaten und Bildpunkten.
 */
export function ansicht(M, box, groesse = 520, rand = 46) {
  const [x0, y0, x1, y1] = box;
  const s = (groesse - 2 * rand) / Math.max(x1 - x0, y1 - y0);
  const ox = (groesse - s * (x1 - x0)) / 2 - s * x0;
  const oy = (groesse - s * (y1 - y0)) / 2 - s * y0;
  return {
    s, groesse,
    zuBild: (p) => { const c = kart(M, p); return [ox + s * c[0], oy + s * c[1]]; },
    vonBild: (q) => bruchVon(M, [(q[0] - ox) / s, (q[1] - oy) / s]),
  };
}

/** Kartesisches Rechteck um die Zellen [0, n]². */
function zellBox(M, n) {
  const ecken = [[0, 0], [n, 0], [0, n], [n, n]].map((p) => kart(M, p));
  const xs = ecken.map((c) => c[0]); const ys = ecken.map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// ---------------------------------------------------------------------------------------------
// Symmetrieelemente
// ---------------------------------------------------------------------------------------------

const f2 = (v) => (Math.round(v * 100) / 100).toString();
const pt = (q) => `${f2(q[0])},${f2(q[1])}`;

/**
 * Position im Hermann-Mauguin-Symbol (1: Drehpunkt, 2: zweite, 3: dritte Stelle) einer
 * (Gleit-)Spiegellinie mit der Normale n (ITA Tab. 2.2.4.1).
 */
export function blickrichtung(system, normale) {
  const klassen = SYMMETRIERICHTUNGEN[system] ?? [];
  const k = klassen.findIndex((menge) => menge.some((r) => Math.abs(r[0] * normale[1] - r[1] * normale[0]) < 1e-9));
  if (k < 0) throw new Error(`Normale ${normale} gehört zu keiner Symmetrierichtung (${system})`);
  return k + 2;
}

/** Symmetrieelemente der Zellen [0, n]², Doppelte an gemeinsamen Kanten entfernt. */
export function elementeImBereich(g, n) {
  const e = elemente(g);
  const dreh = []; const linien = [];
  const schluessel = new Set();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    for (const d of e.drehpunkte) {
      const p = [d.punkt[0] + i, d.punkt[1] + j];
      const k = `d${p.map((v) => v.toFixed(6))}`;
      if (!schluessel.has(k)) { schluessel.add(k); dreh.push({ ...d, punkt: p }); }
    }
    for (const l of e.linien) {
      const s = l.strecke.map((q) => [q[0] + i, q[1] + j]);
      const k = `l${[...s].sort((u, v) => u[0] - v[0] || u[1] - v[1]).flat().map((v) => v.toFixed(6))}`;
      if (!schluessel.has(k)) { schluessel.add(k); linien.push({ ...l, strecke: s, punkt: [l.punkt[0] + i, l.punkt[1] + j] }); }
    }
  }
  return { drehpunkte: dreh, linien };
}

/** SVG eines Drehpunkt-Symbols (ITA) der Zähligkeit n an der Bildstelle q, Grösse k (1 = normal). */
export function drehSymbol(n, q, farbe, rand, k = 1) {
  const [x, y] = q;
  const stil = `fill="${farbe}" stroke="${rand}" stroke-width="1.2"`;
  if (n === 2) return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(4.6 * k)}" ry="${f2(8.2 * k)}" ${stil}/>`;
  const poly = (r, m, phase) => Array.from({ length: m }, (_, i) => {
    const w = phase + (2 * Math.PI * i) / m;
    return `${f2(x + r * k * Math.cos(w))},${f2(y + r * k * Math.sin(w))}`;
  }).join(' ');
  if (n === 3) return `<polygon points="${poly(9, 3, -Math.PI / 2)}" ${stil}/>`;
  if (n === 4) return `<polygon points="${poly(8.5, 4, 0)}" ${stil}/>`;
  return `<polygon points="${poly(8.5, 6, 0)}" ${stil}/>`;
}

/**
 * Die in Tafel A sichtbaren Elemente der Zellen [0, n]²: ohne Aufbau alle, sonst die bis zum
 * Schritt aufbau; ein Drehpunkt trägt dann die grösste sichtbare Zähligkeit (Auswahl und
 * Erklärung gelten dieser, z. B. in p6 Schritt 1 der 3-zählige Punkt am Ursprung).
 */
export function sichtbar(g, n, aufbau) {
  if (!(aufbau > 0)) return elementeImBereich(g, n);
  const a = aufbauElemente(g, n, aufbau);
  return { drehpunkte: a.drehpunkte.map((d) => ({ ...d, n: Math.max(...d.ordnungen) })), linien: a.linien };
}

/** SVG einer Linie (Spiegel- oder Gleitspiegellinie) zwischen zwei Bildpunkten. */
function linieSVG(p, q, art, farbe, breite = null) {
  const b = breite ?? (art === 'spiegel' ? 2.8 : 2);
  return art === 'spiegel'
    ? `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farbe}" stroke-width="${b}" stroke-linecap="round"/>`
    : `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farbe}" stroke-width="${b}" stroke-dasharray="8 5"/>`;
}

/**
 * SVG der Symmetrieelemente (Linien zuerst, Drehpunkte darüber). Ein Element kann markiert
 * sein: neu: true (im Aufbau gerade hinzugekommen); Drehpunkte mit ordnungen: [3, 2] zeigen
 * mehrere Symbole an derselben Stelle. gedimmt: alles blasser (bei einer Erklärung).
 */
function elementeSVG(g, el, A, farben, mitFarben, { gedimmt = false } = {}) {
  const sys = g.daten.system;
  const farbeVon = (pos) => (mitFarben ? farben.dir[pos - 1] : farben.ink);
  const linien = el.linien.map((l) => {
    const [p, q] = l.strecke.map(A.zuBild);
    const c = farbeVon(blickrichtung(sys, l.normale));
    if (!l.neu) return linieSVG(p, q, l.art, c);
    return `<g class="neu">${linieSVG(p, q, 'spiegel', farben.accent2, 9).replace('<line', '<line stroke-opacity="0.28"')}${linieSVG(p, q, l.art, c)}</g>`;
  });
  const dreh = el.drehpunkte.map((d) => {
    const q = A.zuBild(d.punkt);
    const ordn = [...(d.ordnungen ?? [d.n])].sort((u, v) => v - u);
    const halo = d.neu ? `<circle class="neu" cx="${f2(q[0])}" cy="${f2(q[1])}" r="13" fill="${farben.accent2}" fill-opacity="0.3"/>` : '';
    // mehrere Zähligkeiten am selben Punkt (Aufbau): die grösste vergrössert, die übrigen hell darin
    if (ordn.length === 1) return halo + drehSymbol(ordn[0], q, farbeVon(1), farben.paper);
    return halo + drehSymbol(ordn[0], q, farbeVon(1), farben.paper, 1.45)
      + ordn.slice(1).map((n) => drehSymbol(n, [q[0], q[1] + (ordn[0] === 3 ? 1.5 : 0)], farben.paper, farbeVon(1), 0.6)).join('');
  });
  return `<g class="elemente"${gedimmt ? ' opacity="0.35"' : ''}>${linien.join('')}${dreh.join('')}</g>`;
}

/** Echte Teiler > 1 und die Zahl selbst (Zähligkeiten an einem Drehpunkt): 6 → [6, 3, 2]. */
const teiler = (n) => [6, 4, 3, 2].filter((k) => k <= n && n % k === 0);

/**
 * Elemente der Zellen [0, n]² im Aufbau aus Erzeugenden bis zum Schritt schritt (herkunft.js).
 * An einem Drehpunkt erscheinen die Zähligkeiten, die bis dahin entstanden sind; eine, die
 * eine andere teilt, entfällt (2 und 3 → beide, 2 und 6 → 6). neu: genau in diesem Schritt.
 */
export function aufbauElemente(g, n, schritt) {
  const e = elementeImBereich(g, n);
  const h = herkunft(g);
  const drehpunkte = [];
  for (const d of e.drehpunkte) {
    const st = new Map(teiler(d.n).map((k) => [k, h.klassen.get(klassenSchluessel(g, { n: k, punkt: d.punkt }))]));
    const da = [...st.keys()].filter((k) => st.get(k) <= schritt);
    const zeigen = da.filter((k) => !da.some((m) => m !== k && m % k === 0));
    if (zeigen.length) drehpunkte.push({ ...d, ordnungen: zeigen, neu: zeigen.some((k) => st.get(k) === schritt) });
  }
  const linien = [];
  for (const l of e.linien) {
    const s = schrittVon(g, l);
    if (s <= schritt) linien.push({ ...l, neu: s === schritt });
  }
  return { drehpunkte, linien };
}

// ---------------------------------------------------------------------------------------------
// Objekt und seine Bilder
// ---------------------------------------------------------------------------------------------

/** Fähnchen in Bildpunkten, Fuss im Ursprung: Stange nach oben, Fahne nach rechts. */
const FAHNE = { stange: [[0, 0], [0, -22]], fahne: [[0, -22], [11, -17], [0, -12]] };

/** Alle Bilder des Punktes p in den Zellen [lo, hi]² mit Rand, je { punkt, R, eigentlich }. */
export function bilder(g, p, lo, hi, rand = 0.08) {
  const out = [];
  for (const op of g.alle) {
    const q0 = anwenden(op, p).map(mod1);
    const d = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0];
    for (let i = Math.floor(lo - 1); i <= Math.ceil(hi); i++) for (let j = Math.floor(lo - 1); j <= Math.ceil(hi); j++) {
      const q = [q0[0] + i, q0[1] + j];
      if (q[0] < lo - rand || q[0] > hi + rand || q[1] < lo - rand || q[1] > hi + rand) continue;
      out.push({ punkt: q, R: op.R, eigentlich: d > 0 });
    }
  }
  return out;
}

/** SVG eines Objekts (Fähnchen oder Kreis mit Komma) am Bildpunkt q, gedreht/gespiegelt mit Mc. */
export function objektSVG(form, q, Mc, eigentlich, farbe, papier, massstab = 1) {
  const T = (v) => [q[0] + massstab * (Mc[0][0] * v[0] + Mc[0][1] * v[1]), q[1] + massstab * (Mc[1][0] * v[0] + Mc[1][1] * v[1])];
  if (form === 'komma') {
    const r = 7 * massstab;
    const komma = eigentlich ? '' : (() => {
      // Komma im Kreis: Punkt mit Schwanz (ITA: Spiegelbild)
      const p0 = [q[0], q[1] - 0.5 * massstab]; const p1 = [q[0] - 1.6 * massstab, q[1] + 3.6 * massstab];
      return `<circle cx="${f2(p0[0])}" cy="${f2(p0[1])}" r="${f2(1.9 * massstab)}" fill="${farbe}"/><line x1="${f2(p0[0] + 1.2 * massstab)}" y1="${f2(p0[1])}" x2="${f2(p1[0])}" y2="${f2(p1[1])}" stroke="${farbe}" stroke-width="${f2(1.4 * massstab)}" stroke-linecap="round"/>`;
    })();
    return `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(r)}" fill="${papier}" stroke="${farbe}" stroke-width="${f2(1.5 * massstab)}"/>${komma}`;
  }
  const s = FAHNE.stange.map(T); const f = FAHNE.fahne.map(T);
  return `<line x1="${f2(s[0][0])}" y1="${f2(s[0][1])}" x2="${f2(s[1][0])}" y2="${f2(s[1][1])}" stroke="${farbe}" stroke-width="${f2(2 * massstab)}" stroke-linecap="round"/>`
    + `<polygon points="${f.map(pt).join(' ')}" fill="${farbe}" fill-opacity="0.85" stroke="${farbe}" stroke-width="${f2(1 * massstab)}" stroke-linejoin="round"/>`
    + `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(2.3 * massstab)}" fill="${farbe}"/>`;
}

function objekteSVG(g, M, A, p, lo, hi, form, farben, massstab) {
  const out = [];
  for (const b of bilder(g, p, lo, hi)) {
    const Mc = kartMatrix(M, b.R);
    out.push(objektSVG(form, A.zuBild(b.punkt), Mc, b.eigentlich, b.eigentlich ? farben.upper : farben.accent2, farben.paper, massstab));
  }
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// Tafeln
// ---------------------------------------------------------------------------------------------

/**
 * Stelle des Ausgangsobjekts in den Zellen [0, n]²: der Punkt selbst, wenn er dort liegt
 * (auch in einer anderen als der ersten Zelle), sonst sein Bild in der ersten Zelle.
 * Ring in Tafel A und Trefferprüfung beim Ziehen verwenden dieselbe Stelle.
 */
export const ausgangsstelle = (p, n) => (p.every((v) => v >= 0 && v <= n) ? [...p] : p.map(mod1));

/** Zellumriss [i, i+1] × [j, j+1] als Polygon. */
const zellPoly = (A, i, j, n = 1) => [[i, j], [i, j + n], [i + n, j + n], [i + n, j]].map((p) => pt(A.zuBild(p))).join(' ');

/**
 * Tafel A: Symmetriegerüst. Elementarzelle (oder 2 × 2 Zellen) mit den Symmetrieelementen,
 * dazu das Objekt mit allen Bildern und wahlweise die asymmetrische Einheit.
 * Ergebnis: { svg (Inhalt des <svg>), ansicht }.
 */
export function tafelA(id, z, farben, { phase = 3 } = {}) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const M = metrik(z.gitter[sys]);
  const n = z.zellen;
  const erkl = z.erkl ? erklaerungsDaten(g, z.erkl, z.punkt, n, M) : null;
  // Ansicht: Zellen, bei einer Erklärung auch die Stellen der Fähnchen
  let box = zellBox(M, n);
  if (erkl) {
    for (const p of [erkl.start, anwenden(erkl.B, erkl.start), anwenden(erkl.C, erkl.start), ...(erkl.zwischen ? [erkl.zwischen] : [])]) {
      const c = kart(M, p); const r = 0.12 * Math.max(1, z.gitter[sys].ba);
      box = [Math.min(box[0], c[0] - r), Math.min(box[1], c[1] - r), Math.max(box[2], c[0] + r), Math.max(box[3], c[1] + r)];
    }
  }
  const A = ansicht(M, box);
  const teile = [`<rect width="520" height="520" fill="${farben.paper}"/>`];
  if (z.ae) {
    const ecken = g.daten.ae.ecken.map((p) => pt(A.zuBild(p))).join(' ');
    teile.push(`<polygon class="ae" points="${ecken}" fill="${farben.crystal}" fill-opacity="0.55" stroke="${farben.accent}" stroke-width="1.6" stroke-dasharray="5 3"/>`);
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    teile.push(`<polygon points="${zellPoly(A, i, j)}" fill="none" stroke="${farben.muted}" stroke-width="1.2"/>`);
  }
  // Achsen: a und b am Ursprung beschriftet
  const o = A.zuBild([0, 0]);
  const pa = A.zuBild([n * 0.5, 0]); const pb = A.zuBild([0, n * 0.5]);
  const aus = (p, d) => { const l = Math.hypot(d[0], d[1]); return [p[0] + (18 * d[0]) / l, p[1] + (18 * d[1]) / l]; };
  const la = aus(pa, [-(M.a[1]), M.a[0]]); // links neben der a-Kante
  const lb = aus(pb, [M.b[1], -M.b[0]]); // über der b-Kante
  teile.push(`<g font-family="Source Serif 4, serif" font-style="italic" font-size="19" fill="${farben.muted}" text-anchor="middle" dominant-baseline="middle"><text x="${f2(la[0])}" y="${f2(la[1])}">a</text><text x="${f2(lb[0])}" y="${f2(lb[1])}">b</text></g>`);
  teile.push(`<circle cx="${f2(o[0])}" cy="${f2(o[1])}" r="2.6" fill="${farben.muted}"/>`);
  if (z.elemente) {
    const el = z.aufbau > 0 ? aufbauElemente(g, n, z.aufbau) : elementeImBereich(g, n);
    teile.push(elementeSVG(g, el, A, farben, z.farben, { gedimmt: !!erkl }));
  }
  if (z.objekt && !erkl) {
    teile.push(`<g class="objekte">${objekteSVG(g, M, A, z.punkt, 0, n, z.form, farben, 1)}</g>`);
    const q = A.zuBild(ausgangsstelle(z.punkt, n));
    teile.push(`<circle class="ausgang" cx="${f2(q[0])}" cy="${f2(q[1])}" r="15" fill="none" stroke="${farben.accent}" stroke-width="1.8" stroke-dasharray="3 2.5"/>`);
  }
  if (erkl) teile.push(erklaerungSVG(g, M, A, erkl, phase, farben, z.form, n));
  return { svg: teile.join(''), ansicht: A, erklaerung: erkl };
}

// ---------------------------------------------------------------------------------------------
// „Warum ist das da?“: ein Element als Verknüpfung C = A ∘ B
// ---------------------------------------------------------------------------------------------

/** Spiegelanteil {R, t − w} einer Gleitspiegelung (w = (t + R t)/2), sonst null. */
function spiegelanteil(C) {
  if (C.R[0][0] * C.R[1][1] - C.R[0][1] * C.R[1][0] > 0) return null;
  const w = [0, 1].map((i) => (C.t[i] + C.R[i][0] * C.t[0] + C.R[i][1] * C.t[1]) / 2);
  if (Math.abs(w[0]) < 1e-9 && Math.abs(w[1]) < 1e-9) return null;
  return { R: C.R, t: [C.t[0] - w[0], C.t[1] - w[1]] };
}

/**
 * Daten der Erklärung eines Elements (Schlüssel aus herkunft.js) in den Zellen [0, n]²:
 * C = A ∘ B (zuerst B, dann A), die Herleitungskette und der Startpunkt des Fähnchens. Der
 * Startpunkt ist ein Gitterbild des Objekts p, bei dem Start, B(Start) und C(Start) möglichst
 * nahe an der Mitte der Zellen liegen. null, wenn das Element nicht bekannt ist.
 */
export function erklaerungsDaten(g, schluessel, p, n, M) {
  const e = herkunft(g).elemente.get(schluessel);
  if (!e) return null;
  const kette = herleitung(g, e.schluessel);
  const erst = kette[0];
  const C = e.op; const A = erst.a; const B = erst.b;
  const mitte = kart(M, [n / 2, n / 2]);
  const p0 = p.map(mod1);
  let best = null;
  const zen = g.zentr;
  for (const z of zen) for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    const s = [p0[0] + i + z[0], p0[1] + j + z[1]];
    const m = spiegelanteil(C);
    const kosten = [s, anwenden(B, s), anwenden(C, s), ...(m ? [anwenden(m, s)] : [])].reduce((sum, q) => {
      const c = kart(M, q); return sum + (c[0] - mitte[0]) ** 2 + (c[1] - mitte[1]) ** 2;
    }, 0);
    if (!best || kosten < best.kosten - 1e-12) best = { s, kosten };
  }
  const m = spiegelanteil(C);
  return { schluessel, element: e.element, tiefe: e.tiefe, C, A, B, kette, start: best.s, zwischen: m ? anwenden(m, best.s) : null, erzeugende: B.R[0][0] === 1 && B.R[1][1] === 1 && !B.R[0][1] && !B.R[1][0] && !B.t[0] && !B.t[1] };
}

/** Element einer Operation als SVG (Drehpunkt oder Linie über den sichtbaren Bereich). */
function opElementSVG(g, op, A, farbe, papier, n, breit = false) {
  const el = elementVonOp(g, op);
  if (!el) return '';
  if (el.typ === 'dreh') {
    const q = A.zuBild(el.punkt);
    return `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${breit ? 17 : 14}" fill="none" stroke="${farbe}" stroke-width="3"/>${drehSymbol(el.n, q, farbe, papier)}`;
  }
  const s = clipLinie(el.punkt, el.richtung, [-1.5, -1.5, n + 1.5, n + 1.5]);
  if (!s) return '';
  const [p, q] = s.map(A.zuBild);
  return `${linieSVG(p, q, 'spiegel', farbe, breit ? 11 : 8).replace('<line', '<line stroke-opacity="0.25"')}${linieSVG(p, q, el.typ, farbe, 3)}`;
}

/** Pfeil zwischen zwei Bildpunkten mit Nummer in der Mitte. */
function pfeilSVG(p, q, farbe, papier, nummer, gestrichelt = false) {
  const dx = q[0] - p[0]; const dy = q[1] - p[1]; const l = Math.hypot(dx, dy);
  if (l < 4) return '';
  const ux = dx / l; const uy = dy / l;
  const e = [q[0] - 8 * ux, q[1] - 8 * uy]; // Spitze etwas vor dem Ziel
  const a = [p[0] + 8 * ux, p[1] + 8 * uy];
  const spitze = [[e[0], e[1]], [e[0] - 9 * ux + 4.5 * uy, e[1] - 9 * uy - 4.5 * ux], [e[0] - 9 * ux - 4.5 * uy, e[1] - 9 * uy + 4.5 * ux]];
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  return `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(e[0] - 6 * ux)}" y2="${f2(e[1] - 6 * uy)}" stroke="${farbe}" stroke-width="2.2"${gestrichelt ? ' stroke-dasharray="5 4"' : ''}/>`
    + `<polygon points="${spitze.map(pt).join(' ')}" fill="${farbe}"/>`
    + (nummer ? `<circle cx="${f2(m[0])}" cy="${f2(m[1])}" r="9" fill="${papier}" stroke="${farbe}" stroke-width="1.6"/><text x="${f2(m[0])}" y="${f2(m[1] + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="600" fill="${farbe}" text-anchor="middle" dominant-baseline="middle">${nummer}</text>` : '');
}

/** Gestrichelter Weg durch Bildpunkte mit Pfeilspitze am Ende (Spitze etwas vor dem Ziel). */
function wegSVG(punkte, farbe) {
  const z = punkte[punkte.length - 1];
  let i = punkte.length - 2;
  while (i > 0 && Math.hypot(z[0] - punkte[i][0], z[1] - punkte[i][1]) < 14) i--;
  const v = [z[0] - punkte[i][0], z[1] - punkte[i][1]]; const l = Math.hypot(...v);
  if (l < 4) return '';
  const ux = v[0] / l; const uy = v[1] / l;
  const e = [z[0] - 8 * ux, z[1] - 8 * uy];
  const spitze = [[e[0], e[1]], [e[0] - 9 * ux + 4.5 * uy, e[1] - 9 * uy - 4.5 * ux], [e[0] - 9 * ux - 4.5 * uy, e[1] - 9 * uy + 4.5 * ux]];
  const linie = [...punkte.slice(0, i + 1), [e[0] - 6 * ux, e[1] - 6 * uy]];
  return `<polyline points="${linie.map(pt).join(' ')}" fill="none" stroke="${farbe}" stroke-width="2.2" stroke-dasharray="5 4"/>`
    + `<polygon points="${spitze.map(pt).join(' ')}" fill="${farbe}"/>`;
}

/**
 * Weg des Fähnchens unter C, so wie die Operation wirkt: Translation gerade; Drehung als Bogen
 * um den Drehpunkt; Spiegelung senkrecht zur Linie; Gleitspiegelung in zwei Teilen, zuerst
 * gespiegelt (Zwischenbild blass), dann um die Gleitkomponente parallel zur Linie verschoben.
 */
function wegUnterC(C, s, M, A, farbe, fahne) {
  const det = C.R[0][0] * C.R[1][1] - C.R[0][1] * C.R[1][0];
  const q0 = A.zuBild(s); const q1 = A.zuBild(anwenden(C, s));
  if (det < 0) {
    const m = spiegelanteil(C);
    if (!m) return wegSVG([q0, q1], farbe);
    const sm = anwenden(m, s); const qm = A.zuBild(sm);
    return `<g opacity="0.45">${fahne(sm, m, farbe)}</g>${wegSVG([q0, qm], farbe)}${wegSVG([qm, q1], farbe)}`;
  }
  const istT = C.R[0][0] === 1 && C.R[1][1] === 1 && !C.R[0][1] && !C.R[1][0];
  if (istT) return wegSVG([q0, q1], farbe);
  // Drehpunkt: (I − R) c = t
  const a = 1 - C.R[0][0]; const b = -C.R[0][1]; const c = -C.R[1][0]; const d = 1 - C.R[1][1];
  const D = a * d - b * c;
  const qc = A.zuBild([(d * C.t[0] - b * C.t[1]) / D, (a * C.t[1] - c * C.t[0]) / D]);
  const K = kartMatrix(M, C.R);
  const theta = Math.atan2(K[1][0], K[0][0]);
  const N = 32;
  const punkte = Array.from({ length: N + 1 }, (_, k) => {
    const w = (theta * k) / N; const x = q0[0] - qc[0]; const y = q0[1] - qc[1];
    return [qc[0] + Math.cos(w) * x - Math.sin(w) * y, qc[1] + Math.sin(w) * x + Math.cos(w) * y];
  });
  return wegSVG(punkte, farbe);
}

/**
 * Überlagerung der Erklärung in Tafel A. phase 0: Ausgangsobjekt; 1: zuerst B; 2: dann A;
 * 3: zusammen: der Weg unter C, so wie C selbst wirkt (wegUnterC).
 */
function erklaerungSVG(g, M, A, d, phase, farben, form, n) {
  const teile = ['<g class="erklaerung">'];
  const fB = farben.fc3; const fA = farben.fc4; const fC = farben.accent;
  // Elemente: C hervorgehoben, A und B in ihren Farben (Translationen als Pfeil)
  teile.push(opElementSVG(g, d.C, A, fC, farben.paper, n, true));
  if (phase >= 1 && !d.erzeugende) teile.push(opElementSVG(g, d.B, A, fB, farben.paper, n));
  if (phase >= 2) teile.push(opElementSVG(g, d.A, A, fA, farben.paper, n));
  // Fähnchen
  const s = d.start; const sB = anwenden(d.B, s); const sC = anwenden(d.C, s);
  const fahne = (p, op, farbe) => objektSVG(form, A.zuBild(p), kartMatrix(M, op.R), op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0, farbe, farben.paper, 1.15);
  const id = { R: [[1, 0], [0, 1]], t: [0, 0] };
  teile.push(fahne(s, id, farben.ink));
  const q0 = A.zuBild(s);
  teile.push(`<circle cx="${f2(q0[0])}" cy="${f2(q0[1])}" r="16" fill="none" stroke="${farben.ink}" stroke-width="1.5" stroke-dasharray="3 2.5"/>`);
  // in der Gesamtansicht treten die Pfeile von B und A hinter den Weg unter C zurück
  const blass = (svg) => (phase >= 3 && svg ? `<g opacity="0.4">${svg}</g>` : svg);
  if (phase >= 1 && !d.erzeugende) {
    teile.push(blass(pfeilSVG(q0, A.zuBild(sB), fB, farben.paper, '1')));
    teile.push(fahne(sB, d.B, fB));
  }
  if (phase >= 2) {
    if (!d.erzeugende) teile.push(blass(pfeilSVG(A.zuBild(sB), A.zuBild(sC), fA, farben.paper, '2')));
    teile.push(fahne(sC, d.C, d.erzeugende ? fC : fA));
  }
  if (phase >= 3) {
    teile.push(wegUnterC(d.C, s, M, A, fC, fahne));
    const qc = A.zuBild(sC);
    teile.push(`<circle cx="${f2(qc[0])}" cy="${f2(qc[1])}" r="18" fill="none" stroke="${fC}" stroke-width="2.2"/>`);
  }
  teile.push('</g>');
  return teile.join('');
}

/**
 * Tafel B: Muster. Ein quadratischer Ausschnitt des unendlichen Musters, die Elementarzelle
 * hervorgehoben, Symmetrieelemente wahlweise.
 */
export function tafelB(id, z, farben) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const M = metrik(z.gitter[sys]);
  const mitte = kart(M, [0.5, 0.5]);
  const w = 4.4 * Math.max(1, z.gitter[sys].ba);
  const box = [mitte[0] - w / 2, mitte[1] - w / 2, mitte[0] + w / 2, mitte[1] + w / 2];
  const A = ansicht(M, box, 520, 10);
  // Bruchkoordinaten der Ecken des Ausschnitts: ganzzahliger Bereich, der ihn abdeckt
  const ecken = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]].map((c) => bruchVon(M, c));
  const lo = Math.floor(Math.min(...ecken.flat())) - 1; const hi = Math.ceil(Math.max(...ecken.flat())) + 1;
  const teile = [`<defs><clipPath id="ausschnitt"><rect x="10" y="10" width="500" height="500" rx="6"/></clipPath></defs>`,
    `<rect width="520" height="520" fill="${farben.paper}"/>`, '<g clip-path="url(#ausschnitt)">'];
  teile.push(`<polygon points="${zellPoly(A, 0, 0)}" fill="${farben.crystal}" fill-opacity="0.35" stroke="${farben.accent}" stroke-width="2"/>`);
  if (z.musterElemente) {
    const e = elementeImBereich(g, 1);
    const alle = { drehpunkte: [], linien: [] };
    for (let i = lo; i < hi; i++) for (let j = lo; j < hi; j++) {
      for (const d of e.drehpunkte) alle.drehpunkte.push({ ...d, punkt: [d.punkt[0] + i, d.punkt[1] + j] });
      for (const l of e.linien) alle.linien.push({ ...l, strecke: l.strecke.map((q) => [q[0] + i, q[1] + j]) });
    }
    teile.push(elementeSVG(g, alle, A, farben, z.farben));
  }
  teile.push(objekteSVG(g, M, A, z.punkt, lo, hi, z.form, farben, 0.8));
  teile.push('</g>');
  teile.push(`<rect x="10" y="10" width="500" height="500" rx="6" fill="none" stroke="${farben.line}" stroke-width="1"/>`);
  return { svg: teile.join(''), ansicht: A };
}
