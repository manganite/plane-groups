// Zeichnungen der Ebenengruppen als SVG: Symmetriegerüst (Tafel A) und Muster (Tafel B).
// Ohne DOM, damit sich alles in Node testen lässt; die Farben kommen als Objekt herein.
//
// Achsen wie in ITA Vol. A (2006), Abschn. 2.2.6.1 und Part 6: b nach rechts, a im Winkel γ
// dazu nach unten (bei γ = 90° senkrecht nach unten), Ursprung oben links. Bildschirm-
// koordinaten: x nach rechts, y nach unten. Symbole der Symmetrieelemente wie in ITA:
// Drehpunkte als Linse (2), Dreieck (3), Raute (4), Sechseck (6); Spiegellinien durchgezogen,
// Gleitspiegellinien gestrichelt.

import { gruppe as gruppeVon, elemente, anwenden, mod1, clipLinie, SYMMETRIERICHTUNGEN, verknuepfen, invers, translation } from './symmetrie.js';
import { herkunft, herleitung, klassenSchluessel, schrittVon, elementVonOp, vorbild } from './herkunft.js';
import { bedingungen, bereich } from './asymmetrie.js';

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
function zellBox(M, n, r = 0) {
  const ecken = [[-r, -r], [n + r, -r], [-r, n + r], [n + r, n + r]].map((p) => kart(M, p));
  const xs = ecken.map((c) => c[0]); const ys = ecken.map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// ---------------------------------------------------------------------------------------------
// Symmetrieelemente
// ---------------------------------------------------------------------------------------------

export const f2 = (v) => (Math.round(v * 100) / 100).toString();
export const pt = (q) => `${f2(q[0])},${f2(q[1])}`;

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

/** SVG eines Drehpunkt-Symbols (ITA) der Zähligkeit n an der Bildstelle q, Grösse k (1 = normal), Randstärke s (1 = normal). */
export function drehSymbol(n, q, farbe, rand, k = 1, s = 1) {
  const [x, y] = q;
  const stil = `fill="${farbe}" stroke="${rand}" stroke-width="${f2(1.2 * s)}"`;
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

/** SVG einer Linie (Spiegel- oder Gleitspiegellinie) zwischen zwei Bildpunkten; k vergrössert Strich und Strichelung. */
function linieSVG(p, q, art, farbe, breite = null, k = 1) {
  const b = f2((breite ?? (art === 'spiegel' ? 2.8 : 2)) * k);
  return art === 'spiegel'
    ? `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farbe}" stroke-width="${b}" stroke-linecap="round"/>`
    : `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farbe}" stroke-width="${b}" stroke-dasharray="${f2(8 * k)} ${f2(5 * k)}"/>`;
}

/**
 * SVG der Symmetrieelemente (Linien zuerst, Drehpunkte darüber). Ein Element kann markiert
 * sein: neu: true (im Aufbau gerade hinzugekommen); Drehpunkte mit ordnungen: [3, 2] zeigen
 * mehrere Symbole an derselben Stelle. gedimmt: alles blasser (bei einer Erklärung). k: Grösse
 * der Symbole und Linien (1 in der App; das Skript vergrössert sie in kleinen Abbildungen).
 */
export function elementeSVG(g, el, A, farben, mitFarben, { gedimmt = false, k = 1 } = {}) {
  const sys = g.daten.system;
  const farbeVon = (pos) => (mitFarben ? farben.dir[pos - 1] : farben.ink);
  const linien = el.linien.map((l) => {
    const [p, q] = l.strecke.map(A.zuBild);
    const c = farbeVon(blickrichtung(sys, l.normale));
    if (!l.neu) return linieSVG(p, q, l.art, c, null, k);
    return `<g class="neu">${linieSVG(p, q, 'spiegel', farben.accent2, 9, k).replace('<line', '<line stroke-opacity="0.28"')}${linieSVG(p, q, l.art, c, null, k)}</g>`;
  });
  const dreh = el.drehpunkte.map((d) => {
    const q = A.zuBild(d.punkt);
    const ordn = [...(d.ordnungen ?? [d.n])].sort((u, v) => v - u);
    const halo = d.neu ? `<circle class="neu" cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(13 * k)}" fill="${farben.accent2}" fill-opacity="0.3"/>` : '';
    // mehrere Zähligkeiten am selben Punkt (Aufbau): die grösste vergrössert, die übrigen hell darin
    if (ordn.length === 1) return halo + drehSymbol(ordn[0], q, farbeVon(1), farben.paper, k, k);
    return halo + drehSymbol(ordn[0], q, farbeVon(1), farben.paper, 1.45 * k, k)
      + ordn.slice(1).map((n) => drehSymbol(n, [q[0], q[1] + (ordn[0] === 3 ? 1.5 * k : 0)], farben.paper, farbeVon(1), 0.6 * k, k)).join('');
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
/**
 * Rand um die Zellen für „Bilder rund um die Zelle (wie ITA)“, in Bruchteilen der Zelle. Mit ⅓
 * sind die Gruppen um die Elemente auf dem Zellrand vollständig, solange das Objekt höchstens ⅓
 * von ihnen entfernt liegt (Startpunkt 0,12; 0,31). ITA nennt keine Regel; die Diagramme der
 * allgemeinen Lage zeigen die Gruppen um die Ecken vollständig, mit einem Punkt nahe am Ursprung.
 */
export const ORBIT_RAND = 1 / 3;

export function bilder(g, p, lo, hi, rand = 0.08) {
  const out = [];
  for (const [index, op] of g.alle.entries()) {
    const q0 = anwenden(op, p).map(mod1);
    const d = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0];
    for (let i = Math.floor(lo - 1); i <= Math.ceil(hi); i++) for (let j = Math.floor(lo - 1); j <= Math.ceil(hi); j++) {
      const q = [q0[0] + i, q0[1] + j];
      if (q[0] < lo - rand || q[0] > hi + rand || q[1] < lo - rand || q[1] > hi + rand) continue;
      out.push({ punkt: q, R: op.R, eigentlich: d > 0, index });
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

/**
 * Bilder des Objekts als SVG. farbeVon(bild): eigene Farbe je Bild (z. B. nach Bahnen der
 * Restsymmetrie beim Brechen), sonst nach Händigkeit.
 */
function objekteSVG(g, M, A, p, lo, hi, form, farben, massstab, rand = undefined, farbeVon = null) {
  const out = [];
  for (const b of bilder(g, p, lo, hi, rand)) {
    const Mc = kartMatrix(M, b.R);
    const farbe = farbeVon ? farbeVon(b) : b.eigentlich ? farben.upper : farben.accent2;
    out.push(objektSVG(form, A.zuBild(b.punkt), Mc, b.eigentlich, farbe, farben.paper, massstab));
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
 * Gewählte Bedingungen der asymmetrischen Einheit (Nummern in g.daten.ae.text): der Bereich in
 * den Zellen, in dem alle erfüllt sind, schattiert (teil 'flaeche', unter den Elementen); die
 * Grenzlinien jeder Bedingung als Band (teil 'grenzen', über den Elementen).
 */
export function aeTeileSVG(g, auswahl, A, n, farben, teil = 'flaeche') {
  const alle = bedingungen(g.daten.ae.text);
  const gewaehlt = auswahl.map((i) => alle[i]).filter(Boolean);
  if (!gewaehlt.length) return '';
  const box = [0, 0, n, n];
  const flaecheSVG = bereich(gewaehlt.flatMap((b) => b.halbebenen), box);
  const teile = [`<g class="ae-teile${teil === 'flaeche' ? '' : '-grenzen'}">`];
  if (teil === 'flaeche' && flaecheSVG.length > 2) {
    teile.push(`<polygon points="${flaecheSVG.map((p) => pt(A.zuBild(p))).join(' ')}" fill="${farben.accent2}" fill-opacity="0.22"/>`);
  }
  // Grenzlinien als Band über den Symmetrieelementen: sie liegen oft genau auf ihnen
  if (teil === 'grenzen') for (const b of gewaehlt) {
    for (const [cx, cy, c0] of b.halbebenen) {
      // Grenzlinie cx·x + cy·y + c0 = 0: Punkt und Richtung
      const l = cx * cx + cy * cy;
      const s = clipLinie([(-c0 * cx) / l, (-c0 * cy) / l], [-cy, cx], box);
      if (!s) continue;
      const [p, q] = s.map(A.zuBild);
      teile.push(`<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" stroke="${farben.accent2}" stroke-width="7" stroke-opacity="0.5" stroke-linecap="round"/>`);
    }
  }
  teile.push('</g>');
  return teile.join('');
}

// ---------------------------------------------------------------------------------------------
// Symmetrie brechen: Gitter ohne die Bindung des Kristallsystems
// ---------------------------------------------------------------------------------------------

/**
 * Die Operationen von g, die bei der freien Metrik frei = { ba, gamma } bleiben: genau die, deren
 * Matrix die Metrik erhält (die Lagen der Objekte ändern sich nicht, nur Abstände und Winkel).
 * Ergebnis: { M, H (Untergruppe wie gruppe(): alle, ordnung, zentr, daten), bleibt, weg }.
 */
export function gebrochen(g, frei) {
  const M = metrik(frei);
  const G = [[M.a[0] ** 2 + M.a[1] ** 2, M.a[0] * M.b[0] + M.a[1] * M.b[1]], [0, M.b[0] ** 2 + M.b[1] ** 2]];
  G[1][0] = G[0][1];
  const s = Math.max(G[0][0], G[1][1]);
  const erhaelt = (R) => [0, 1].every((i) => [0, 1].every((j) => {
    let h = 0;
    for (let k = 0; k < 2; k++) for (let l = 0; l < 2; l++) h += R[k][i] * G[k][l] * R[l][j];
    return Math.abs(h - G[i][j]) < 1e-6 * s;
  }));
  const bleibt = g.alle.filter((op) => erhaelt(op.R));
  const weg = g.alle.filter((op) => !erhaelt(op.R));
  // Bahnen der Restgruppe H: Die Bilder unter o₁ und o₂ sind gleichwertig, wenn o₂ ∘ o₁⁻¹ in H
  // liegt (modulo Gitter). bahn[i]: Nummer der Bahn des Bildes unter g.alle[i].
  const inH = (op) => bleibt.some((h) => h.R.every((z, i) => z.every((w, j) => w === op.R[i][j])) && [0, 1].every((i) => { const d = h.t[i] - op.t[i]; return Math.abs(d - Math.round(d)) < 1e-6; }));
  const bahn = []; const vertreter = [];
  for (const [i, o] of g.alle.entries()) {
    const k = vertreter.findIndex((v) => inH(verknuepfen(o, invers(v))));
    if (k >= 0) bahn[i] = k; else { bahn[i] = vertreter.length; vertreter.push(o); }
  }
  return { M, H: { ...g, alle: bleibt, ordnung: bleibt.length }, bleibt, weg, bahn, bahnen: vertreter.length };
}

/** Farben der Bahnen beim Brechen: die erste wie bisher, dann gut unterscheidbare. */
export const bahnFarben = (farben) => [farben.upper, farben.accent2, farben.dir[0], farben.dir[1], farben.dir[2], farben.fc3];

/** Motiv ohne eigene Symmetrie (drei Punkte verschiedener Art), vervielfältigt mit g. */
export function motivBahn(g, p = [0.137, 0.291]) {
  const motiv = [{ d: [0, 0], art: 'A' }, { d: [0.031, 0.007], art: 'B' }, { d: [-0.004, 0.043], art: 'C' }];
  const out = [];
  for (const op of g.alle) for (const m of motiv) out.push({ p: anwenden(op, [p[0] + m.d[0], p[1] + m.d[1]]), art: m.art });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Selbst zeichnen: Striche und die asymmetrische Einheit, vervielfältigt mit allen Operationen
// ---------------------------------------------------------------------------------------------

/** Grenzen für gezeichnete Striche (Bruchkoordinaten): Punkte je Zeichnung und Mindestabstand. */
export const STRICH_GRENZE = 1200;

/**
 * Strich vereinfachen (Ramer-Douglas-Peucker, Toleranz in Bruchteilen der Zelle) und auf drei
 * Stellen runden, damit das Muster auch mit vielen Kopien schnell bleibt.
 */
export function vereinfachen(punkte, tol = 0.003) {
  if (punkte.length <= 2) return punkte.map((p) => p.map((v) => Math.round(v * 1000) / 1000));
  const abstand = (p, a, b) => {
    const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy);
    if (l < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / l;
  };
  const behalten = new Array(punkte.length).fill(false);
  behalten[0] = true; behalten[punkte.length - 1] = true;
  const stapel = [[0, punkte.length - 1]];
  while (stapel.length) {
    const [i, j] = stapel.pop();
    let max = -1; let k = -1;
    for (let m = i + 1; m < j; m++) { const d = abstand(punkte[m], punkte[i], punkte[j]); if (d > max) { max = d; k = m; } }
    if (max > tol) { behalten[k] = true; stapel.push([i, k], [k, j]); }
  }
  return punkte.filter((_, i) => behalten[i]).map((p) => p.map((v) => Math.round(v * 1000) / 1000));
}

/**
 * Kopien einer Punktfolge unter allen Operationen der Gruppe und den Gittertranslationen, soweit
 * sie den Bereich [lo − rand, hi + rand]² berühren. Je Kopie: punkte, eigentlich (Drehung oder
 * Translation, sonst Spiegelbild), urbild (die Identität ohne Verschiebung).
 */
export function kopien(g, punkte, lo, hi, rand = 0.1) {
  const out = [];
  if (!punkte.length) return out;
  for (const op of g.alle) {
    const bild = punkte.map((p) => anwenden(op, p));
    const xs = bild.map((p) => p[0]); const ys = bild.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const eigentlich = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0;
    const id = eigentlich && op.R[0][0] === 1 && op.R[1][1] === 1 && !op.t[0] && !op.t[1];
    for (let i = Math.ceil(lo - rand - x1); i <= Math.floor(hi + rand - x0); i++) {
      for (let j = Math.ceil(lo - rand - y1); j <= Math.floor(hi + rand - y0); j++) {
        out.push({ punkte: bild.map((p) => [p[0] + i, p[1] + j]), eigentlich, urbild: id && !i && !j });
      }
    }
  }
  return out;
}

/**
 * Radieren an der Stelle p (Bruchkoordinaten) mit dem Radius r (kartesisch, Metrik M). Weil jede
 * sichtbare Kopie ein Bild des Originals ist, wird an allen Urbildern von p unter den Operationen
 * der Gruppe (und Gittertranslationen) radiert. Ein Strich verliert genau die Stücke im Kreis und
 * zerfällt dabei, wo nötig, in mehrere Striche. Ergebnis: neue Liste der Striche.
 */
export function radieren(striche, g, M, p, r) {
  const C = (q) => kart(M, q);
  // Urbilder von p: op⁻¹(p), um Gittervektoren verschoben, nahe bei den Strichen
  const urbilder = [];
  const alle = striche.flat();
  if (!alle.length) return striche;
  const xs = alle.map((q) => q[0]); const ys = alle.map((q) => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...ys) - 1, Math.max(...ys) + 1];
  for (const op of g.alle) {
    const u = anwenden(invers(op), p);
    for (let i = Math.floor(x0 - u[0]); i <= Math.ceil(x1 - u[0]); i++) {
      for (let j = Math.floor(y0 - u[1]); j <= Math.ceil(y1 - u[1]); j++) urbilder.push(C([u[0] + i, u[1] + j]));
    }
  }
  /** Teile der Strecke a–b (kartesisch) ausserhalb aller Kreise, als Parameterintervalle in [0, 1]. */
  const aussen = (a, b) => {
    let frei = [[0, 1]];
    const d = [b[0] - a[0], b[1] - a[1]]; const dd = d[0] * d[0] + d[1] * d[1];
    for (const m of urbilder) {
      const f = [a[0] - m[0], a[1] - m[1]];
      const B = 2 * (f[0] * d[0] + f[1] * d[1]); const Cc = f[0] * f[0] + f[1] * f[1] - r * r;
      if (dd < 1e-18) { if (Cc <= 0) frei = []; continue; }
      const disk = B * B - 4 * dd * Cc;
      if (disk <= 0) continue;
      const w = Math.sqrt(disk);
      const t1 = (-B - w) / (2 * dd); const t2 = (-B + w) / (2 * dd);
      if (t2 <= 0 || t1 >= 1) continue;
      frei = frei.flatMap(([u, v]) => [[u, Math.min(v, t1)], [Math.max(u, t2), v]].filter(([s0, s1]) => s1 - s0 > 1e-9));
      if (!frei.length) break;
    }
    return frei;
  };
  const out = [];
  for (const st of striche) {
    let aktuell = [];
    const abschliessen = () => { if (aktuell.length >= 2) out.push(aktuell); aktuell = []; };
    for (let k = 0; k + 1 < st.length; k++) {
      const a = st[k]; const b = st[k + 1];
      const punkt = (t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])].map((v) => Math.round(v * 1000) / 1000);
      const teile = aussen(C(a), C(b));
      if (!teile.length) abschliessen();
      for (const [u, v] of teile) {
        const pu = punkt(u); const pv = punkt(v);
        const letzt = aktuell[aktuell.length - 1];
        if (!letzt || Math.abs(letzt[0] - pu[0]) > 1e-9 || Math.abs(letzt[1] - pu[1]) > 1e-9) { abschliessen(); aktuell.push(pu); }
        aktuell.push(pv);
        if (v < 1 - 1e-9) abschliessen();
      }
    }
    abschliessen();
  }
  return out;
}

/** SVG der Striche und der gefüllten asymmetrischen Einheit im Bereich [lo, hi]². */
function zeichnungSVG(g, A, z, lo, hi, farben, massstab = 1) {
  const teile = [];
  const pfad = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${pt(A.zuBild(p))}`).join('');
  if (z.aeFuell) {
    // asymmetrische Einheit und ihre Bilder: Sie pflastern die Ebene ohne Lücken und Überlappungen
    for (const k of kopien(g, g.daten.ae.ecken, lo, hi, 0)) {
      const farbe = k.eigentlich ? farben.upper : farben.accent2;
      teile.push(`<path d="${pfad(k.punkte)}Z" fill="${farbe}" fill-opacity="${k.urbild ? 0.45 : 0.16}" stroke="${farbe}" stroke-width="${k.urbild ? 2 : 0.8}" stroke-linejoin="round"/>`);
    }
  }
  for (const strich of z.striche ?? []) {
    if (strich.length < 2) continue;
    for (const k of kopien(g, strich, lo, hi)) {
      const farbe = k.eigentlich ? farben.upper : farben.accent2;
      teile.push(`<path d="${pfad(k.punkte)}" fill="none" stroke="${farbe}" stroke-width="${f2((k.urbild ? 3.2 : 2) * massstab)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  }
  return teile.length ? `<g class="zeichnung">${teile.join('')}</g>` : '';
}

// ---------------------------------------------------------------------------------------------
// Schritt für Schritt: das Objekt mit jeder Operation der ITA-Liste, dann die Gittertranslationen
// ---------------------------------------------------------------------------------------------

/**
 * Operationen in der Reihenfolge der ITA-Seite, ohne Reduktion modulo Gitter: zuerst die Liste
 * für (0, 0)+, bei zentrierten Gruppen dann dieselbe Liste für (½, ½)+. nr: Nummer in der Liste.
 */
export function itaOperationen(g) {
  const out = [];
  g.zentr.forEach((z, zi) => g.ops.forEach((op, i) => out.push({ op: verknuepfen(translation(z), op), nr: i + 1, zentr: zi > 0 ? z : null })));
  return out;
}

/**
 * Schritt k (1 … N) wendet die Operationen 1 … k der ITA-Liste auf das Objekt p an; die Bilder
 * liegen dort, wo die Koordinaten der Liste hinzeigen (ohne Gittertranslation, also auch
 * ausserhalb der Zelle). Schritt N + 1: die Gittertranslationen. Je Bild: gleich = Index eines
 * früheren Bildes an derselben Stelle (exakt) oder, mit gitter: true, an einer um einen
 * Gittervektor verschobenen Stelle. verschieden: Zahl der Stellen bis auf Gittertranslationen.
 */
export function schrittDaten(g, p, k) {
  const liste = itaOperationen(g);
  const N = liste.length;
  const bilder = [];
  liste.slice(0, Math.min(Math.max(k, 0), N)).forEach((e, i) => {
    const q = anwenden(e.op, p);
    const diff = (b) => [q[0] - b.punkt[0], q[1] - b.punkt[1]];
    let gleich = bilder.findIndex((b) => diff(b).every((x) => Math.abs(x) < 1e-6));
    let gitter = false;
    if (gleich < 0) {
      gleich = bilder.findIndex((b) => diff(b).every((x) => Math.abs(x - Math.round(x)) < 1e-6));
      gitter = gleich >= 0;
    }
    bilder.push({ ...e, punkt: q, index: i, gleich: gleich >= 0 ? gleich : null, gitter });
  });
  return { liste, bilder, N, k: Math.min(Math.max(k, 0), N + 1), verschieden: bilder.filter((b) => b.gleich === null).length, translationen: k > N };
}

/** Kurzname einer Operation der Liste: „3“ bzw. „3′“ für dieselbe Operation mit (½, ½)+. */
export const opNummer = (e) => `${e.nr}${e.zentr ? '′' : ''}`;

/** Überlagerung „Schritt für Schritt“ in Tafel A (statt der Bilder des Objekts). */
function schrittSVG(g, M, A, s, k, n, form, farben) {
  const d = schrittDaten(g, s, k);
  const teile = ['<g class="schritte">'];
  const fahne = (p, R, farbe, mass = 1) => objektSVG(form, A.zuBild(p), kartMatrix(M, R), R[0][0] * R[1][1] - R[0][1] * R[1][0] > 0, farbe, farben.paper, mass);
  const marke = (p, text, farbe) => {
    const q = A.zuBild(p);
    return `<text x="${f2(q[0] + 13)}" y="${f2(q[1] + 15)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="600" fill="${farbe}" stroke="${farben.paper}" stroke-width="3" paint-order="stroke">${text}</text>`;
  };
  if (d.translationen) {
    // Gittertranslationen: jedes Bild in die Zelle (Pfeil), dann alle Bilder in den Zellen
    for (const b of d.bilder) {
      const z = b.punkt.map(mod1);
      if (Math.hypot(z[0] - b.punkt[0], z[1] - b.punkt[1]) > 1e-6) {
        teile.push(`<g opacity="0.35">${fahne(b.punkt, b.op.R, farben.muted)}</g>`);
        teile.push(wegSVG([A.zuBild(b.punkt), A.zuBild(z)], farben.muted));
      }
    }
    teile.push(objekteSVG(g, M, A, s, 0, n, form, farben, 1));
  } else {
    d.bilder.forEach((b, i) => {
      const jetzt = i === d.bilder.length - 1;
      const eigentlich = b.op.R[0][0] * b.op.R[1][1] - b.op.R[0][1] * b.op.R[1][0] > 0;
      if (jetzt && i > 0) {
        teile.push(opElementSVG(g, b.op, A, farben.accent, farben.paper, n, true));
        const w = weg(b.op, s, M);
        const bild = w.teile.map((t) => t.map(A.zuBild));
        if (w.zwischen) teile.push(`<g opacity="0.45">${fahne(w.zwischen.p, w.zwischen.op.R, farben.accent)}</g>`);
        teile.push(bild.map((t) => wegSVG(t, farben.accent)).join(''));
      }
      teile.push(`<g${jetzt ? '' : ' opacity="0.8"'}>${fahne(b.punkt, b.op.R, eigentlich ? farben.upper : farben.accent2)}</g>`);
      teile.push(marke(b.punkt, `(${opNummer(b)})`, jetzt ? farben.accent : farben.muted));
      if (jetzt) {
        const q = A.zuBild(b.punkt);
        teile.push(`<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="18" fill="none" stroke="${farben.accent}" stroke-width="2.2"/>`);
      }
    });
  }
  teile.push('</g>');
  return teile.join('');
}

/** Farbe je Bild nach der Bahn der Restsymmetrie, nur wenn das Objekt in mehrere Bahnen zerfällt. */
function bahnFarbe(brechen, farben) {
  if (!brechen || brechen.bahnen < 2) return null;
  const f = bahnFarben(farben);
  return (b) => f[brechen.bahn[b.index] % f.length];
}

/**
 * Tafel A: Symmetriegerüst. Elementarzelle (oder 2 × 2 Zellen) mit den Symmetrieelementen,
 * dazu das Objekt mit allen Bildern und wahlweise die asymmetrische Einheit.
 * Ergebnis: { svg (Inhalt des <svg>), ansicht }.
 */
/** Vergrösserung der Lupe in Tafel A. */
export const LUPE = 2;

/**
 * Tafel A. Optionen: phase (Erklärung), k (Grösse der Symbole, Skript); bei z.lupe lupeMitte
 * (Bruchkoordinaten der Bildmitte, sonst die Stelle des Objekts) oder lupeBox (fester Ausschnitt
 * aus einem früheren Ergebnis, während einer Geste). Das Ergebnis enthält lupeBox.
 */
export function tafelA(id, z, farben, { phase = 3, k = 1, lupeMitte = null, lupeBox = null } = {}) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const brechen = z.brechen ? gebrochen(g, z.frei) : null;
  const M = brechen ? brechen.M : metrik(z.gitter[sys]);
  const n = z.zellen;
  // beim freien Gitter gelten Erklärung, Aufbau, Schritte und asymmetrische Einheit nicht
  const erkl = z.erkl && !brechen ? erklaerungsDaten(g, z.erkl, z.punkt, n, M) : null;
  // Ansicht: Zellen, bei einer Erklärung auch die Stellen der Fähnchen
  // „Bilder rund um die Zelle“: Rand für die Bilder, die Ansicht etwas grösser für die Objekte
  const orbit = z.orbit && z.objekt && !erkl ? ORBIT_RAND : 0;
  let box = zellBox(M, n, orbit ? orbit + 0.06 : 0);
  // Schritt für Schritt: Ansicht mit allen Bildern der ITA-Liste (auch ausserhalb der Zelle)
  const schritt = z.schritt > 0 && z.objekt && !erkl && !brechen ? z.schritt : 0;
  const s0 = ausgangsstelle(z.punkt, n);
  if (schritt) {
    for (const e of itaOperationen(g)) {
      const c = kart(M, anwenden(e.op, s0)); const r = 0.12 * Math.max(1, z.gitter[sys].ba);
      box = [Math.min(box[0], c[0] - r), Math.min(box[1], c[1] - r), Math.max(box[2], c[0] + r), Math.max(box[3], c[1] + r)];
    }
  }
  if (erkl) {
    // alle Punkte der Wege (Bögen, Zwischenbilder) und die Stellen der Fähnchen
    for (const p of [erkl.start, ...Object.values(erkl.wege).flatMap((w) => w.teile.flat())]) {
      const c = kart(M, p); const r = 0.12 * Math.max(1, z.gitter[sys].ba);
      box = [Math.min(box[0], c[0] - r), Math.min(box[1], c[1] - r), Math.max(box[2], c[0] + r), Math.max(box[3], c[1] + r)];
    }
  }
  // Lupe: Ausschnitt LUPE-mal kleiner um die Mitte, innerhalb der ganzen Ansicht
  if (z.lupe && lupeBox) box = lupeBox;
  else if (z.lupe) {
    const c = kart(M, lupeMitte ?? ausgangsstelle(z.punkt, n));
    const w = (box[2] - box[0]) / LUPE; const h = (box[3] - box[1]) / LUPE;
    const s0 = Math.max(w, h);
    // Bildmitte so, dass der Ausschnitt in der ganzen Ansicht bleibt (ist er grösser, in deren Mitte)
    const lage = (m, lo, hi) => (s0 >= hi - lo ? (lo + hi) / 2 : Math.min(Math.max(m, lo + s0 / 2), hi - s0 / 2));
    const mx = lage(c[0], box[0], box[2]); const my = lage(c[1], box[1], box[3]);
    box = [mx - s0 / 2, my - s0 / 2, mx + s0 / 2, my + s0 / 2];
  }
  // hexagonal: die Zelle ist eine flache Raute, die das Bild nur in der Breite füllt; schmalerer Rand
  const A = ansicht(M, box, 520, z.lupe ? 0 : sys === 'hexagonal' ? 24 : 46);
  const teile = [`<rect width="520" height="520" fill="${farben.paper}"/>`];
  if (z.ae && !brechen) {
    const ecken = g.daten.ae.ecken.map((p) => pt(A.zuBild(p))).join(' ');
    teile.push(`<polygon class="ae" points="${ecken}" fill="${farben.crystal}" fill-opacity="0.55" stroke="${farben.accent}" stroke-width="1.6" stroke-dasharray="5 3"/>`);
  }
  if (z.aeTeile?.length && !brechen) teile.push(aeTeileSVG(g, z.aeTeile, A, n, farben));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    teile.push(`<polygon points="${zellPoly(A, i, j)}" fill="none" stroke="${farben.muted}" stroke-width="1.2"/>`);
  }
  if (!erkl) teile.push(zeichnungSVG(brechen ? brechen.H : g, A, brechen ? { ...z, aeFuell: false } : z, -1, n + 1, farben));
  // Achsen: a und b am Ursprung beschriftet
  const o = A.zuBild([0, 0]);
  const pa = A.zuBild([n * 0.5, 0]); const pb = A.zuBild([0, n * 0.5]);
  const aus = (p, d) => { const l = Math.hypot(d[0], d[1]); const r = 18 * Math.min(k, 1.4); return [p[0] + (r * d[0]) / l, p[1] + (r * d[1]) / l]; };
  const la = aus(pa, [-(M.a[1]), M.a[0]]); // links neben der a-Kante
  const lb = aus(pb, [M.b[1], -M.b[0]]); // über der b-Kante
  teile.push(`<g font-family="Source Serif 4, serif" font-style="italic" font-size="${f2(19 * Math.min(k, 1.4))}" fill="${farben.muted}" text-anchor="middle" dominant-baseline="middle"><text x="${f2(la[0])}" y="${f2(la[1])}">a</text><text x="${f2(lb[0])}" y="${f2(lb[1])}">b</text></g>`);
  teile.push(`<circle cx="${f2(o[0])}" cy="${f2(o[1])}" r="2.6" fill="${farben.muted}"/>`);
  if (z.elemente && brechen) {
    // nur die verbleibenden Elemente (wie in der Stereo-App); nach Blickrichtung gefärbt nur,
    // solange die Gruppe bleibt (sonst andere Gruppe, andere Aufstellung)
    teile.push(elementeSVG(g, elementeImBereich(brechen.H, n), A, farben, z.farben && !brechen.weg.length, { k }));
  } else if (z.elemente) {
    const el = z.aufbau > 0 ? aufbauElemente(g, n, z.aufbau) : elementeImBereich(g, n);
    teile.push(elementeSVG(g, el, A, farben, z.farben, { gedimmt: !!erkl, k }));
  }
  if (z.aeTeile?.length && !brechen) teile.push(aeTeileSVG(g, z.aeTeile, A, n, farben, 'grenzen'));
  if (schritt) teile.push(schrittSVG(g, M, A, s0, schritt, n, z.form, farben));
  else if (z.objekt && !erkl) teile.push(`<g class="objekte">${objekteSVG(g, M, A, z.punkt, 0, n, z.form, farben, k, orbit || undefined, bahnFarbe(brechen, farben))}</g>`);
  if (z.objekt && !erkl) {
    const q = A.zuBild(ausgangsstelle(z.punkt, n));
    teile.push(`<circle class="ausgang" cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(15 * k)}" fill="none" stroke="${farben.accent}" stroke-width="${f2(1.8 * k)}" stroke-dasharray="${f2(3 * k)} ${f2(2.5 * k)}"/>`);
  }
  if (erkl) teile.push(erklaerungSVG(g, M, A, erkl, phase, farben, z.form, n));
  return { svg: teile.join(''), ansicht: A, erklaerung: erkl, lupeBox: z.lupe ? box : null };
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
 * Erklärung einer Gitterkopie: Das Element ist das Vorbild V, um den Gittervektor t verschoben,
 * C = t ∘ V ∘ t⁻¹. Fähnchen: V bringt 0 nach 1; t verschiebt beide nach 2 und 3; C bringt 2
 * nach 3. Wege: V, t (von 0 und von 1), C.
 */
function kopieDaten(g, schluessel, e, v, p, n, M) {
  const T = translation(v.t);
  const V = v.op;
  const C = verknuepfen(T, verknuepfen(V, invers(T)));
  const wegeVon = (s) => {
    const s1 = anwenden(V, s); const s2 = anwenden(T, s);
    return { V: weg(V, s, M), T0: weg(T, s, M), T1: weg(T, s1, M), C: weg(C, s2, M) };
  };
  const mitte = kart(M, [n / 2, n / 2]);
  const p0 = p.map(mod1);
  let best = null;
  for (const z of g.zentr) for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    const s = [p0[0] + i + z[0], p0[1] + j + z[1]];
    const punkte = [s];
    for (const w of Object.values(wegeVon(s))) for (const t of w.teile) punkte.push(t[t.length - 1], t[Math.floor(t.length / 2)]);
    const kosten = punkte.reduce((sum, q) => { const c = kart(M, q); return sum + (c[0] - mitte[0]) ** 2 + (c[1] - mitte[1]) ** 2; }, 0);
    if (!best || kosten < best.kosten - 1e-12) best = { s, kosten };
  }
  return {
    art: 'kopie', schluessel, element: e.element, tiefe: e.tiefe, C, V, t: v.t, T,
    vorbild: { schluessel: v.schluessel, element: v.element }, kette: [], start: best.s, wege: wegeVon(best.s), erzeugende: false,
  };
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
  const v = vorbild(g, e.element);
  if (v) return kopieDaten(g, schluessel, e, v, p, n, M);
  const kette = herleitung(g, e.schluessel);
  const erst = kette[0];
  const C = e.op; const A = erst.a; const B = erst.b;
  const erzeugende = B.R[0][0] === 1 && B.R[1][1] === 1 && !B.R[0][1] && !B.R[1][0] && !B.t[0] && !B.t[1];
  const wegeVon = (s) => {
    const sB = anwenden(B, s);
    return erzeugende ? { C: weg(C, s, M) } : { B: weg(B, s, M), A: weg(A, sB, M), C: weg(C, s, M) };
  };
  const mitte = kart(M, [n / 2, n / 2]);
  const p0 = p.map(mod1);
  let best = null;
  for (const z of g.zentr) for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    const s = [p0[0] + i + z[0], p0[1] + j + z[1]];
    // Stellen, Zwischenbilder und die Mitten der Wege möglichst nahe an der Mitte der Zellen
    const punkte = [s];
    for (const w of Object.values(wegeVon(s))) {
      for (const t of w.teile) punkte.push(t[t.length - 1], t[Math.floor(t.length / 2)]);
    }
    const kosten = punkte.reduce((sum, q) => {
      const c = kart(M, q); return sum + (c[0] - mitte[0]) ** 2 + (c[1] - mitte[1]) ** 2;
    }, 0);
    if (!best || kosten < best.kosten - 1e-12) best = { s, kosten };
  }
  return { schluessel, element: e.element, tiefe: e.tiefe, C, A, B, kette, start: best.s, wege: wegeVon(best.s), erzeugende };
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
 * Weg des Fähnchens von s unter einer Operation, so wie sie wirkt (Bruchkoordinaten):
 * Translation gerade; Drehung als Bogen um den Drehpunkt; Spiegelung senkrecht zur Linie;
 * Gleitspiegelung in zwei Teilen, zuerst gespiegelt (Zwischenbild), dann um die
 * Gleitkomponente parallel zur Linie verschoben. teile: Liste von Punktfolgen;
 * zwischen: { p, op } Zwischenbild der Gleitspiegelung oder null.
 */
export function weg(op, s, M) {
  const ziel = anwenden(op, s);
  const det = op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0];
  if (det < 0) {
    const m = spiegelanteil(op);
    if (!m) return { teile: [[s, ziel]], zwischen: null };
    const sm = anwenden(m, s);
    return { teile: [[s, sm], [sm, ziel]], zwischen: { p: sm, op: m } };
  }
  const istT = op.R[0][0] === 1 && op.R[1][1] === 1 && !op.R[0][1] && !op.R[1][0];
  if (istT) return { teile: [[s, ziel]], zwischen: null };
  // Drehpunkt: (I − R) c = t; Bogen kartesisch um den Drehwinkel
  const a = 1 - op.R[0][0]; const b = -op.R[0][1]; const c = -op.R[1][0]; const d = 1 - op.R[1][1];
  const D = a * d - b * c;
  const cc = kart(M, [(d * op.t[0] - b * op.t[1]) / D, (a * op.t[1] - c * op.t[0]) / D]);
  const cs = kart(M, s);
  const K = kartMatrix(M, op.R);
  const theta = Math.atan2(K[1][0], K[0][0]);
  const N = 32;
  const bogen = Array.from({ length: N + 1 }, (_, k) => {
    if (k === N) return ziel;
    const w = (theta * k) / N; const x = cs[0] - cc[0]; const y = cs[1] - cc[1];
    return bruchVon(M, [cc[0] + Math.cos(w) * x - Math.sin(w) * y, cc[1] + Math.sin(w) * x + Math.cos(w) * y]);
  });
  return { teile: [bogen], zwischen: null };
}

/** Marke auf halber Länge eines Weges (Bildpunkte): Kreis mit Buchstabe der Operation. */
function wegMarke(teile, farbe, papier, text) {
  const pkte = teile.flat();
  const seg = pkte.slice(1).map((q, i) => Math.hypot(q[0] - pkte[i][0], q[1] - pkte[i][1]));
  let rest = seg.reduce((x, y) => x + y, 0) / 2;
  let m = pkte[0];
  for (let i = 0; i < seg.length; i++) {
    if (rest <= seg[i] && seg[i] > 0) { const u = rest / seg[i]; m = [pkte[i][0] + u * (pkte[i + 1][0] - pkte[i][0]), pkte[i][1] + u * (pkte[i + 1][1] - pkte[i][1])]; break; }
    rest -= seg[i];
  }
  return `<circle cx="${f2(m[0])}" cy="${f2(m[1])}" r="10" fill="${papier}" stroke="${farbe}" stroke-width="1.6"/><text x="${f2(m[0])}" y="${f2(m[1] + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="12" font-weight="700" fill="${farbe}" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
}

/**
 * Überlagerung der Erklärung in Tafel A. phase 0: Ausgangsobjekt; 1: zuerst B; 2: dann A;
 * 3: zusammen: C. Die Wege zeigen, wie die Operation wirkt (weg), beschriftet mit dem
 * Buchstaben der Operation; die Stellen des Fähnchens sind nummeriert: 0 Ausgangsobjekt,
 * 1 nach B, 2 nach A (bei einer Erzeugenden: 1 nach C).
 */
function erklaerungSVG(g, M, A, d, phase, farben, form, n) {
  if (d.art === 'kopie') return kopieSVG(g, M, A, d, phase, farben, form, n);
  const teile = ['<g class="erklaerung">'];
  const fB = farben.fc3; const fA = farben.fc4; const fC = farben.accent;
  // Elemente: C hervorgehoben, A und B in ihren Farben (Translationen als Pfeil)
  teile.push(opElementSVG(g, d.C, A, fC, farben.paper, n, true));
  if (phase >= 1 && !d.erzeugende) teile.push(opElementSVG(g, d.B, A, fB, farben.paper, n));
  if (phase >= 2 && !d.erzeugende) teile.push(opElementSVG(g, d.A, A, fA, farben.paper, n));
  const s = d.start; const sB = anwenden(d.B, s); const sC = anwenden(d.C, s);
  const fahne = (p, op, farbe) => objektSVG(form, A.zuBild(p), kartMatrix(M, op.R), op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0, farbe, farben.paper, 1.15);
  const id = { R: [[1, 0], [0, 1]], t: [0, 0] };
  // Weg einer Operation: Zwischenbild blass, Teilwege mit Pfeil, Buchstabe auf halber Länge
  const wegSVGvon = (w, farbe, name) => {
    const bild = w.teile.map((t) => t.map(A.zuBild));
    return `<g class="weg weg-${name.toLowerCase()}">${w.zwischen ? `<g opacity="0.45">${fahne(w.zwischen.p, w.zwischen.op, farbe)}</g>` : ''}${bild.map((t) => wegSVG(t, farbe)).join('')}${wegMarke(bild, farbe, farben.paper, name)}</g>`;
  };
  // Nummer einer Stelle, links oberhalb des Fähnchens
  const nummer = (p, text, farbe) => {
    const q = A.zuBild(p); const x = q[0] - 22; const y = q[1] - 20;
    return `<g class="stelle"><circle cx="${f2(x)}" cy="${f2(y)}" r="8.5" fill="${farbe}"/><text x="${f2(x)}" y="${f2(y + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="700" fill="${farben.paper}" text-anchor="middle" dominant-baseline="middle">${text}</text></g>`;
  };
  // in der Gesamtansicht treten die Wege von B und A hinter den Weg unter C zurück
  const blass = (svg) => (phase >= 3 ? `<g opacity="0.35">${svg}</g>` : svg);
  if (phase >= 1 && !d.erzeugende) teile.push(blass(wegSVGvon(d.wege.B, fB, 'B')));
  if (phase >= 2 && !d.erzeugende) teile.push(blass(wegSVGvon(d.wege.A, fA, 'A')));
  if (phase >= 3) teile.push(wegSVGvon(d.wege.C, fC, 'C'));
  // Fähnchen und Stellen
  teile.push(fahne(s, id, farben.ink));
  const q0 = A.zuBild(s);
  teile.push(`<circle cx="${f2(q0[0])}" cy="${f2(q0[1])}" r="16" fill="none" stroke="${farben.ink}" stroke-width="1.5" stroke-dasharray="3 2.5"/>`);
  teile.push(nummer(s, '0', farben.ink));
  if (phase >= 1 && !d.erzeugende) { teile.push(fahne(sB, d.B, fB)); teile.push(nummer(sB, '1', fB)); }
  if (d.erzeugende ? phase >= 3 : phase >= 2) {
    teile.push(fahne(sC, d.C, d.erzeugende ? fC : fA));
    teile.push(nummer(sC, d.erzeugende ? '1' : '2', d.erzeugende ? fC : fA));
  }
  if (phase >= 3) {
    const qc = A.zuBild(sC);
    teile.push(`<circle cx="${f2(qc[0])}" cy="${f2(qc[1])}" r="18" fill="none" stroke="${fC}" stroke-width="2.2"/>`);
  }
  teile.push('</g>');
  return teile.join('');
}

/**
 * Überlagerung für eine Gitterkopie. phase 0: Ausgangsobjekt; 1: Vorbild V (0 → 1);
 * 2: um t verschoben (0 → 2, 1 → 3); 3: C bringt 2 nach 3.
 */
function kopieSVG(g, M, A, d, phase, farben, form, n) {
  const teile = ['<g class="erklaerung">'];
  const fV = farben.fc3; const fT = farben.fc4; const fC = farben.accent;
  teile.push(opElementSVG(g, d.C, A, fC, farben.paper, n, true));
  if (phase >= 1) teile.push(opElementSVG(g, d.V, A, fV, farben.paper, n));
  const s0 = d.start; const s1 = anwenden(d.V, s0); const s2 = anwenden(d.T, s0); const s3 = anwenden(d.T, s1);
  const id = { R: [[1, 0], [0, 1]], t: [0, 0] };
  const fahne = (p, op, farbe) => objektSVG(form, A.zuBild(p), kartMatrix(M, op.R), op.R[0][0] * op.R[1][1] - op.R[0][1] * op.R[1][0] > 0, farbe, farben.paper, 1.15);
  const wegSVGvon = (w, farbe, name, klasse) => {
    const bild = w.teile.map((t) => t.map(A.zuBild));
    return `<g class="weg weg-${klasse}">${w.zwischen ? `<g opacity="0.45">${fahne(w.zwischen.p, w.zwischen.op, farbe)}</g>` : ''}${bild.map((t) => wegSVG(t, farbe)).join('')}${wegMarke(bild, farbe, farben.paper, name)}</g>`;
  };
  const nummer = (p, text, farbe) => {
    const q = A.zuBild(p); const x = q[0] - 22; const y = q[1] - 20;
    return `<g class="stelle"><circle cx="${f2(x)}" cy="${f2(y)}" r="8.5" fill="${farbe}"/><text x="${f2(x)}" y="${f2(y + 0.5)}" font-family="IBM Plex Sans, sans-serif" font-size="11" font-weight="700" fill="${farben.paper}" text-anchor="middle" dominant-baseline="middle">${text}</text></g>`;
  };
  const blass = (svg) => (phase >= 3 ? `<g opacity="0.35">${svg}</g>` : svg);
  if (phase >= 1) teile.push(blass(wegSVGvon(d.wege.V, fV, 'V', 'v')));
  if (phase >= 2) { teile.push(blass(wegSVGvon(d.wege.T0, fT, 't', 't'))); teile.push(blass(wegSVGvon(d.wege.T1, fT, 't', 't'))); }
  if (phase >= 3) teile.push(wegSVGvon(d.wege.C, fC, 'C', 'c'));
  teile.push(fahne(s0, id, farben.ink));
  const q0 = A.zuBild(s0);
  teile.push(`<circle cx="${f2(q0[0])}" cy="${f2(q0[1])}" r="16" fill="none" stroke="${farben.ink}" stroke-width="1.5" stroke-dasharray="3 2.5"/>`);
  teile.push(nummer(s0, '0', farben.ink));
  if (phase >= 1) { teile.push(fahne(s1, d.V, fV)); teile.push(nummer(s1, '1', fV)); }
  if (phase >= 2) {
    teile.push(fahne(s2, id, fT)); teile.push(nummer(s2, '2', fT));
    teile.push(fahne(s3, d.V, fT)); teile.push(nummer(s3, '3', fT));
  }
  if (phase >= 3) {
    const q3 = A.zuBild(s3);
    teile.push(`<circle cx="${f2(q3[0])}" cy="${f2(q3[1])}" r="18" fill="none" stroke="${fC}" stroke-width="2.2"/>`);
  }
  teile.push('</g>');
  return teile.join('');
}

/**
 * Tafel B: Muster. Ein quadratischer Ausschnitt des unendlichen Musters, die Elementarzelle
 * hervorgehoben, Symmetrieelemente wahlweise.
 */
export function tafelB(id, z, farben, { k = 1 } = {}) {
  const g = gruppeVon(id);
  const sys = g.daten.system;
  const brechen = z.brechen ? gebrochen(g, z.frei) : null;
  const M = brechen ? brechen.M : metrik(z.gitter[sys]);
  const mitte = kart(M, [0.5, 0.5]);
  const w = 4.4 * Math.max(1, (brechen ? z.frei : z.gitter[sys]).ba);
  const box = [mitte[0] - w / 2, mitte[1] - w / 2, mitte[0] + w / 2, mitte[1] + w / 2];
  const A = ansicht(M, box, 520, 10);
  // Bruchkoordinaten der Ecken des Ausschnitts: ganzzahliger Bereich, der ihn abdeckt
  const ecken = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]].map((c) => bruchVon(M, c));
  const lo = Math.floor(Math.min(...ecken.flat())) - 1; const hi = Math.ceil(Math.max(...ecken.flat())) + 1;
  const teile = [`<defs><clipPath id="ausschnitt"><rect x="10" y="10" width="500" height="500" rx="6"/></clipPath></defs>`,
    `<rect width="520" height="520" fill="${farben.paper}"/>`, '<g clip-path="url(#ausschnitt)">'];
  teile.push(`<polygon points="${zellPoly(A, 0, 0)}" fill="${farben.crystal}" fill-opacity="0.35" stroke="${farben.accent}" stroke-width="2"/>`);
  if (z.musterElemente) {
    const e = elementeImBereich(brechen ? brechen.H : g, 1);
    const alle = { drehpunkte: [], linien: [] };
    for (let i = lo; i < hi; i++) for (let j = lo; j < hi; j++) {
      for (const d of e.drehpunkte) alle.drehpunkte.push({ ...d, punkt: [d.punkt[0] + i, d.punkt[1] + j] });
      for (const l of e.linien) alle.linien.push({ ...l, strecke: l.strecke.map((q) => [q[0] + i, q[1] + j]) });
    }
    teile.push(elementeSVG(g, alle, A, farben, z.farben, { k }));
  }
  teile.push(zeichnungSVG(brechen ? brechen.H : g, A, brechen ? { ...z, aeFuell: false } : z, lo, hi, farben, 0.8));
  if (z.objekt) teile.push(objekteSVG(g, M, A, z.punkt, lo, hi, z.form, farben, 0.8 * k, undefined, bahnFarbe(brechen, farben)));
  teile.push('</g>');
  teile.push(`<rect x="10" y="10" width="500" height="500" rx="6" fill="none" stroke="${farben.line}" stroke-width="1"/>`);
  return { svg: teile.join(''), ansicht: A };
}
