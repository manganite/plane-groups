// Skizzen, die es in der App nicht gibt und die Skript und Quiz gemeinsam brauchen (ohne DOM, auch
// für den Moodle-Export). Farben in der Form der Tafeln (farbenAus in quiz-bild.js).

import { f2, pt, drehSymbol } from './zeichnung.js';
import { OPERATIONEN } from './punktoperationen.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Farben } from './zeichnung.js' */
/** @import { Punktoperation, PG } from './punktoperationen.js' */

/** @param {string} id @param {string} farbe */
export const pfeilspitze = (id, farbe) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${farbe}"/></marker>`;
/** @param {Vec2} p @param {Vec2} q @param {string} attr */
export const linie = (p, q, attr) => `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" ${attr}/>`;
/** @param {Vec2} p @param {string} t @param {string} [attr] */
export const text = (p, t, attr = '') => `<text x="${f2(p[0])}" y="${f2(p[1])}" ${attr}>${t}</text>`;
export const SERIF = 'font-family="Source Serif 4, serif" font-style="italic"';
export const SANS = 'font-family="IBM Plex Sans, sans-serif"';

/**
 * Punktgruppe 3m des gleichseitigen Dreiecks für die Gruppentafel (Kap. 4): Stellen 1 (links unten),
 * 2 (rechts unten), 3 (oben); Spiegellinien m1, m2, m3 durch die Stellen, fest im Raum; +3 dreht
 * um 120° gegen den Uhrzeigersinn.
 * @param {Farben} f
 */
export function dreieck3m(f) {
  /** @type {Vec2} */
  const c = [260, 215]; const R = 115;
  /** @param {number} w @param {number} r @returns {Vec2} */
  const pol = (w, r) => [c[0] + r * Math.cos((w * Math.PI) / 180), c[1] - r * Math.sin((w * Math.PI) / 180)];
  const winkel = [210, 330, 90]; // Stellen 1, 2, 3
  const ecken = winkel.map((w) => pol(w, R));
  const svg = [`<rect width="520" height="400" fill="${f.paper}"/>`, `<defs>${pfeilspitze('dr-pf', f.accent2)}</defs>`];
  svg.push(`<path d="M${ecken.map((q) => `${f2(q[0])} ${f2(q[1])}`).join(' L')} Z" fill="${f.crystal}" fill-opacity="0.35" stroke="${f.ink}" stroke-width="1.6"/>`);
  winkel.forEach((w, i) => {
    svg.push(linie(pol(w, 170), pol(w + 180, 95), `stroke="${f.accent}" stroke-width="3"`));
    const t = pol(w, 190);
    svg.push(`<text x="${f2(t[0])}" y="${f2(t[1] + 9)}" ${SERIF} font-size="30" fill="${f.accent}" text-anchor="middle">m<tspan font-size="20" dy="6" font-style="normal">${i + 1}</tspan></text>`);
    const z = pol(w - 14, R - 42); // neben der Spiegellinie
    svg.push(text([z[0], z[1] + 9], String(i + 1), `${SANS} font-size="26" font-weight="600" fill="${f.ink}" text-anchor="middle"`));
  });
  // 3-zähliger Drehpunkt in der Mitte
  svg.push(drehSymbol(3, c, f.ink, f.paper, 2, 1.5));
  // +3: Bogen gegen den Uhrzeigersinn
  const a = pol(-30, 66); const b = pol(50, 66);
  svg.push(`<path d="M${f2(a[0])} ${f2(a[1])} A66 66 0 0 0 ${f2(b[0])} ${f2(b[1])}" fill="none" stroke="${f.accent2}" stroke-width="3" marker-end="url(#dr-pf)"/>`);
  const t = pol(10, 98);
  svg.push(text([t[0], t[1] + 8], '+3', `${SANS} font-size="26" fill="${f.accent2}" text-anchor="middle"`));
  return svg.join('');
}

/**
 * Punktgruppen 2mm, 4mm und 6mm mit den Bezeichnungen der Operationen (Abb. 4.5, punktoperationen.js):
 * Rechteck, Quadrat oder Sechseck mit den Spiegellinien und ihren Namen, den Achsen wie in der App
 * (a nach unten, b nach rechts; hexagonal a1, a2, a3), Drehpunkt in der Mitte und Pfeil +n.
 * @param {'2mm' | '4mm' | '6mm'} pg @param {Farben} f
 */
export function punktgruppe(pg, f) {
  /** @type {Vec2} */
  const c = [260, 200];
  /** @param {number} w @param {number} r @param {Vec2} [m] @returns {Vec2} */
  const pol = (w, r, m = c) => [m[0] + r * Math.cos((w * Math.PI) / 180), m[1] - r * Math.sin((w * Math.PI) / 180)];
  const n = Number(pg[0]);
  const svg = [`<rect width="520" height="400" fill="${f.paper}"/>`, `<defs>${pfeilspitze(`pg-pf-${pg}`, f.accent2)}${pfeilspitze(`pg-ax-${pg}`, f.ink)}</defs>`];
  // Index: Buchstaben kursiv, Ziffern und Zeichen aufrecht; ⊥ hochgestellt am m
  /** @param {string} t */
  const teil = (t) => t.split(/([a-z])/).filter(Boolean)
    .map((x) => (/^[a-z]$/.test(x) ? `<tspan font-style="italic">${x}</tspan>` : `<tspan font-style="normal">${x}</tspan>`)).join('');
  /** @param {Vec2} q @param {Punktoperation} o */
  const marke = (q, o) => `<text x="${f2(q[0])}" y="${f2(q[1] + 7)}" ${SERIF} font-size="30" fill="${f.accent}" text-anchor="middle">m`
    + `${o.zeichen ? `<tspan font-size="20" dy="-12" font-style="normal">${o.zeichen}</tspan><tspan font-size="20" dy="18" dx="-12">` : '<tspan font-size="20" dy="6">'}${teil(/** @type {string} */ (o.index))}</tspan></text>`;
  const ecken = pg === '2mm' ? /** @type {Vec2[]} */ ([[-125, -80], [125, -80], [125, 80], [-125, 80]]).map(([x, y]) => /** @type {Vec2} */ ([c[0] + x, c[1] + y]))
    : Array.from({ length: n }, (_, i) => pol(n === 4 ? 45 + 90 * i : 60 * i, n === 4 ? 92 * Math.SQRT2 : 118));
  svg.push(`<path d="M${ecken.map((q) => `${f2(q[0])} ${f2(q[1])}`).join(' L')} Z" fill="${f.crystal}" fill-opacity="0.35" stroke="${f.ink}" stroke-width="1.6"/>`);
  // Spiegellinien und ihre Namen aus punktoperationen.js, damit Bild und Fragen übereinstimmen
  for (const o of OPERATIONEN[pg].filter((x) => x.art === 'm')) {
    svg.push(linie(pol(o.w, 148), pol(o.w + 180, 148), `stroke="${f.accent}" stroke-width="3"`));
    svg.push(marke(pol(o.w, 170), o));
  }
  // Achsen wie in der App (Winkel im Bild): rechteckig und quadratisch a 270°, b 0°; hexagonal
  // a1 240°, a2 0°, a3 120°. Name neben der Mitte des Pfeils (seite: Winkel des Versatzes) bzw. an der Spitze.
  /** @param {string} t */
  const name = (t) => t.replace(/([a-z])(\d?)/, (/** @type {string} */ m, /** @type {string} */ x, /** @type {string} */ d) => `<tspan font-style="italic">${x}</tspan>${d ? `<tspan font-size="18" dy="6" font-style="normal">${d}</tspan>` : ''}`);
  /** @param {Vec2} o @param {number} w @param {number} l @param {string} t @param {number | null} [seite] */
  const pfeil = (o, w, l, t, seite = null) => {
    const e = pol(w, l, o);
    const q = seite === null ? pol(w, l + 18, o) : pol(seite, 18, pol(w, l / 2, o));
    svg.push(linie(o, e, `stroke="${f.ink}" stroke-width="2.6" marker-end="url(#pg-ax-${pg})"`));
    svg.push(`<text x="${f2(q[0])}" y="${f2(q[1] + 8)}" ${SERIF} font-size="26" fill="${f.ink}" text-anchor="middle">${name(t)}</text>`);
  };
  if (n === 6) {
    /** @type {Vec2} */
    const o = [100, 330];
    pfeil(o, 240, 44, 'a1'); pfeil(o, 0, 44, 'a2'); pfeil(o, 120, 44, 'a3');
  } else {
    /** @type {Vec2} */
    const o = pg === '2mm' ? [c[0] - 125, c[1] - 80] : [100, 320];
    pfeil(o, 270, 62, 'a', 180); pfeil(o, 0, 62, 'b', 90);
  }
  if (pg !== '2mm') {
    // +n: Bogen gegen den Uhrzeigersinn wie in Abb. 4.4
    const a = pol(-30, 66); const b = pol(50, 66);
    svg.push(`<path d="M${f2(a[0])} ${f2(a[1])} A66 66 0 0 0 ${f2(b[0])} ${f2(b[1])}" fill="none" stroke="${f.accent2}" stroke-width="3" marker-end="url(#pg-pf-${pg})"/>`);
    const t = pol(n === 4 ? 22 : 15, 104);
    svg.push(text([t[0], t[1] + 6], `+${n}`, `${SANS} font-size="26" fill="${f.accent2}" text-anchor="middle"`));
  }
  svg.push(drehSymbol(n, c, f.ink, f.paper, 2, 1.5));
  return svg.join('');
}

/**
 * Kacheln im Stil von Escher (Kap. 7): Man verformt die Kanten eines Quadrats so, dass die
 * Kacheln lückenlos bleiben. data-variante „p1-bau“: eine Kachel, gegenüberliegende Kanten
 * gleich verformt (Translation); „p1“: das Muster daraus; „p2“: jede Kante für sich
 * punktsymmetrisch zu ihrer Mitte, Nachbarn um 180° um die Kantenmitten gedreht.
 * Koordinaten in Kachel-Einheiten, x nach rechts, y nach unten (wie das Bild). Ohne Symbole (Quiz) fehlen
 * die Drehpunkte, die sonst die Antwort zeigten. viewBox 520 × 520.
 * @param {string} v @param {Farben} f @param {boolean} [symbole]
 */
export function kachel(v, f, symbole = true) {
  const N = 48;
  const t = Array.from({ length: N + 1 }, (_, i) => i / N);
  /** @param {number} k @param {number} x */
  const sin = (k, x) => Math.sin(2 * Math.PI * k * x);
  // Kante von S nach E mit seitlicher Auslenkung h(t) (positiv: links der Laufrichtung im Bild)
  /** @param {Vec2} S @param {Vec2} E @param {(u: number) => number} h @returns {Vec2[]} */
  const kante = (S, E, h) => t.map((u) => {
    const d = [E[0] - S[0], E[1] - S[1]]; const n = [d[1], -d[0]];
    return /** @type {Vec2} */ ([S[0] + u * d[0] + h(u) * n[0], S[1] + u * d[1] + h(u) * n[1]]);
  });
  /** @type {Vec2[]} */ let oben; /** @type {Vec2[]} */ let links; /** @type {Vec2[]} */ let rechts; /** @type {Vec2[]} */ let unten;
  if (v === 'p2') {
    // jede Kante punktsymmetrisch zu ihrer Mitte: nur Anteile sin(2πkt)
    oben = kante([0, 0], [1, 0], (u) => 0.13 * sin(1, u) + 0.05 * sin(2, u));
    rechts = kante([1, 0], [1, 1], (u) => -0.11 * sin(1, u) + 0.06 * sin(2, u));
    unten = kante([1, 1], [0, 1], (u) => 0.1 * sin(1, u) - 0.05 * sin(2, u));
    links = kante([0, 1], [0, 0], (u) => 0.12 * sin(1, u) + 0.04 * sin(2, u));
  } else {
    oben = kante([0, 0], [1, 0], (u) => 0.2 * Math.sin(Math.PI * u) * Math.cos(Math.PI * u * 1.6));
    links = kante([0, 1], [0, 0], (u) => 0.16 * sin(1, u) + 0.07 * Math.sin(Math.PI * u));
    rechts = links.map(([x, y]) => /** @type {Vec2} */ ([x + 1, y])).reverse();
    unten = oben.map(([x, y]) => /** @type {Vec2} */ ([x, y + 1])).reverse();
  }
  const umriss = [...oben, ...rechts.slice(1), ...unten.slice(1), ...links.slice(1, -1)];
  /** @type {Vec2} */
  const auge = [0.36, 0.4];
  // Kopien: [Abbildung, dunkel?]
  /** @type {[(q: Vec2) => Vec2, boolean, Vec2][]} */
  const kopien = [];
  if (v === 'p2') {
    for (let i = -2; i <= 3; i++) for (let j = -2; j <= 3; j++) {
      if ((i + j) % 2 === 0) kopien.push([(q) => [q[0] + i, q[1] + j], true, [i, j]]);
      else kopien.push([(q) => [2 - q[0] + i - 1, 1 - q[1] + j], false, [i, j]]);
    }
  } else for (let i = -2; i <= 3; i++) for (let j = -2; j <= 3; j++) kopien.push([(q) => [q[0] + i, q[1] + j], true, [i, j]]);
  const bau = v === 'p1-bau';
  const s = bau ? 250 : 140; const o = bau ? [135, 135] : [190, 190];
  /** @param {Vec2} q @returns {Vec2} */
  const B = (q) => [o[0] + s * q[0], o[1] + s * q[1]];
  /** @param {Vec2[]} pts */
  const pfad = (pts) => pts.map((q) => pt(B(q))).join(' ');
  const svg = [`<rect width="520" height="520" fill="${f.paper}"/>`, `<defs>${pfeilspitze('ka-pf', f.ink)}<clipPath id="ka-clip-${v}${symbole ? '' : '-q'}"><rect x="6" y="6" width="508" height="508" rx="6"/></clipPath></defs>`];
  if (bau) {
    svg.push(`<rect x="${o[0]}" y="${o[1]}" width="${s}" height="${s}" fill="none" stroke="${f.muted}" stroke-width="1.4" stroke-dasharray="6 5"/>`);
    svg.push(`<polygon points="${pfad(umriss)}" fill="${f.upper}" fill-opacity="0.16" stroke="none"/>`);
    /** @type {[Vec2[], Vec2[], string][]} */
    const paare = [[oben, unten, f.ink], [links, rechts, f.accent]]; // nicht orange (Spiegelbild) oder grün (Blickrichtung)
    for (const [k1, k2, c] of paare) for (const k of [k1, k2]) svg.push(`<polyline points="${pfad(k)}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`);
    // Translationen: links → rechts um b, oben → unten um a
    /** @param {Vec2} p @param {Vec2} q @param {string} label @param {Vec2} lp */
    const pf = (p, q, label, lp) => linie(B(p), B(q), `stroke="${f.ink}" stroke-width="1.8" marker-end="url(#ka-pf)"`) + text(B(lp), label, `${SERIF} font-weight="600" font-size="22" fill="${f.ink}" text-anchor="middle"`);
    svg.push(pf([0.12, 0.62], [0.9, 0.62], 'b', [0.5, 0.58]));
    svg.push(pf([0.62, 0.12], [0.62, 0.9], 'a', [0.69, 0.53]));
    svg.push(`<circle cx="${f2(B(auge)[0])}" cy="${f2(B(auge)[1])}" r="7" fill="${f.ink}"/>`);
    return svg.join('');
  }
  const g = [`<g clip-path="url(#ka-clip-${v}${symbole ? '' : '-q'})">`];
  for (const [abb, dunkel, [i, j]] of kopien) {
    const pts = umriss.map(abb);
    const hervor = i === 0 && j === 0;
    g.push(`<polygon points="${pfad(pts)}" fill="${f.upper}" fill-opacity="${hervor ? 0.5 : dunkel ? 0.26 : 0.1}" stroke="${f.ink}" stroke-width="1.3" stroke-linejoin="round"/>`);
    const a = B(abb(auge));
    g.push(`<circle cx="${f2(a[0])}" cy="${f2(a[1])}" r="6" fill="${f.ink}"/>`);
  }
  if (v === 'p2' && symbole) {
    // 2-zählige Drehpunkte auf allen Kantenmitten (die Ecken sind keine)
    for (let i = -2; i <= 3; i++) for (let j = -2; j <= 3; j++) for (const q of /** @type {Vec2[]} */ ([[i + 0.5, j], [i, j + 0.5]])) g.push(drehSymbol(2, B(q), f.ink, f.paper, 1.6, 1.5));
  }
  g.push('</g>');
  svg.push(...g);
  return svg.join('');
}
