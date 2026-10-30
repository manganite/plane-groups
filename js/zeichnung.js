// Zeichnungen der Ebenengruppen als SVG: Symmetriegerüst (Tafel A) und Muster (Tafel B).
// Ohne DOM, damit sich alles in Node testen lässt; die Farben kommen als Objekt herein.
//
// Achsen wie in ITA Vol. A (2006), Abschn. 2.2.6.1 und Part 6: b nach rechts, a im Winkel γ
// dazu nach unten (bei γ = 90° senkrecht nach unten), Ursprung oben links. Bildschirm-
// koordinaten: x nach rechts, y nach unten. Symbole der Symmetrieelemente wie in ITA:
// Drehpunkte als Linse (2), Dreieck (3), Raute (4), Sechseck (6); Spiegellinien durchgezogen,
// Gleitspiegellinien gestrichelt.

import { gruppe as gruppeVon, elemente, anwenden, mod1, SYMMETRIERICHTUNGEN } from './symmetrie.js';

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
      if (!schluessel.has(k)) { schluessel.add(k); linien.push({ ...l, strecke: s }); }
    }
  }
  return { drehpunkte: dreh, linien };
}

/** SVG eines Drehpunkt-Symbols (ITA) der Zähligkeit n an der Bildstelle q. */
export function drehSymbol(n, q, farbe, rand) {
  const [x, y] = q;
  const stil = `fill="${farbe}" stroke="${rand}" stroke-width="1.2"`;
  if (n === 2) return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="4.6" ry="8.2" ${stil}/>`;
  const poly = (r, k, phase) => Array.from({ length: k }, (_, i) => {
    const w = phase + (2 * Math.PI * i) / k;
    return `${f2(x + r * Math.cos(w))},${f2(y + r * Math.sin(w))}`;
  }).join(' ');
  if (n === 3) return `<polygon points="${poly(9, 3, -Math.PI / 2)}" ${stil}/>`;
  if (n === 4) return `<polygon points="${poly(8.5, 4, 0)}" ${stil}/>`;
  return `<polygon points="${poly(8.5, 6, 0)}" ${stil}/>`;
}

/** SVG der Symmetrieelemente (Linien zuerst, Drehpunkte darüber). */
function elementeSVG(g, el, A, farben, mitFarben) {
  const sys = g.daten.system;
  const farbeVon = (pos) => (mitFarben ? farben.dir[pos - 1] : farben.ink);
  const linien = el.linien.map((l) => {
    const [p, q] = l.strecke.map(A.zuBild);
    const c = farbeVon(blickrichtung(sys, l.normale));
    return l.art === 'spiegel'
      ? `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`
      : `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${c}" stroke-width="2" stroke-dasharray="8 5"/>`;
  });
  const dreh = el.drehpunkte.map((d) => drehSymbol(d.n, A.zuBild(d.punkt), farbeVon(1), farben.paper));
  return `<g class="elemente">${linien.join('')}${dreh.join('')}</g>`;
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

/** Zellumriss [i, i+1] × [j, j+1] als Polygon. */
const zellPoly = (A, i, j, n = 1) => [[i, j], [i, j + n], [i + n, j + n], [i + n, j]].map((p) => pt(A.zuBild(p))).join(' ');

/**
 * Tafel A: Symmetriegerüst. Elementarzelle (oder 2 × 2 Zellen) mit den Symmetrieelementen,
 * dazu das Objekt mit allen Bildern und wahlweise die asymmetrische Einheit.
 * Ergebnis: { svg (Inhalt des <svg>), ansicht }.
 */
export function tafelA(id, z, farben) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const M = metrik(z.gitter[sys]);
  const n = z.zellen;
  const A = ansicht(M, zellBox(M, n));
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
  if (z.elemente) teile.push(elementeSVG(g, elementeImBereich(g, n), A, farben, z.farben));
  if (z.objekt) {
    teile.push(`<g class="objekte">${objekteSVG(g, M, A, z.punkt, 0, n, z.form, farben, 1)}</g>`);
    const q = A.zuBild(z.punkt.map(mod1));
    teile.push(`<circle class="ausgang" cx="${f2(q[0])}" cy="${f2(q[1])}" r="15" fill="none" stroke="${farben.accent}" stroke-width="1.8" stroke-dasharray="3 2.5"/>`);
  }
  return { svg: teile.join(''), ansicht: A };
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
