// Skizzen, die es in der App nicht gibt und die Skript und Quiz gemeinsam brauchen (ohne DOM, auch
// für den Moodle-Export). Farben in der Form der Tafeln (farbenAus in quiz-bild.js).

import { f2, drehSymbol } from './zeichnung.js';
import { OPERATIONEN } from './punktoperationen.js';

export const pfeilspitze = (id, farbe) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${farbe}"/></marker>`;
export const linie = (p, q, attr) => `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" ${attr}/>`;
export const text = (p, t, attr = '') => `<text x="${f2(p[0])}" y="${f2(p[1])}" ${attr}>${t}</text>`;
export const SERIF = 'font-family="Source Serif 4, serif" font-style="italic"';
export const SANS = 'font-family="IBM Plex Sans, sans-serif"';

/**
 * Punktgruppe 3m des gleichseitigen Dreiecks für die Gruppentafel (Kap. 4): Stellen 1 (links unten),
 * 2 (rechts unten), 3 (oben); Spiegellinien m1, m2, m3 durch die Stellen, fest im Raum; +3 dreht
 * um 120° gegen den Uhrzeigersinn.
 */
export function dreieck3m(f) {
  const c = [260, 215]; const R = 115;
  const pol = (w, r) => [c[0] + r * Math.cos((w * Math.PI) / 180), c[1] - r * Math.sin((w * Math.PI) / 180)];
  const winkel = [210, 330, 90]; // Stellen 1, 2, 3
  const ecken = winkel.map((w) => pol(w, R));
  const svg = [`<rect width="520" height="400" fill="${f.paper}"/>`, `<defs>${pfeilspitze('dr-pf', f.accent2)}</defs>`];
  svg.push(`<path d="M${ecken.map((q) => `${f2(q[0])} ${f2(q[1])}`).join(' L')} Z" fill="${f.crystal}" fill-opacity="0.35" stroke="${f.ink}" stroke-width="1.6"/>`);
  winkel.forEach((w, i) => {
    svg.push(linie(pol(w, 175), pol(w + 180, 95), `stroke="${f.accent}" stroke-width="2.2"`));
    const t = pol(w, 192);
    svg.push(`<text x="${f2(t[0])}" y="${f2(t[1] + 7)}" ${SERIF} font-size="21" fill="${f.accent}" text-anchor="middle">m<tspan font-size="14" dy="4" font-style="normal">${i + 1}</tspan></text>`);
    const z = pol(w - 13, R - 40); // neben der Spiegellinie
    svg.push(text([z[0], z[1] + 7], String(i + 1), `${SANS} font-size="20" font-weight="600" fill="${f.ink}" text-anchor="middle"`));
  });
  // 3-zähliger Drehpunkt in der Mitte
  const d = [90, 210, 330].map((w) => pol(w, 9));
  svg.push(`<path d="M${d.map((q) => `${f2(q[0])} ${f2(q[1])}`).join(' L')} Z" fill="${f.ink}"/>`);
  // +3: Bogen gegen den Uhrzeigersinn
  const a = pol(-25, 62); const b = pol(45, 62);
  svg.push(`<path d="M${f2(a[0])} ${f2(a[1])} A62 62 0 0 0 ${f2(b[0])} ${f2(b[1])}" fill="none" stroke="${f.accent2}" stroke-width="2" marker-end="url(#dr-pf)"/>`);
  const t = pol(10, 84);
  svg.push(text([t[0], t[1] + 6], '+3', `${SANS} font-size="18" fill="${f.accent2}"`));
  return svg.join('');
}

/**
 * Punktgruppen 2mm, 4mm und 6mm mit den Bezeichnungen der Operationen (Abb. 4.5, punktoperationen.js):
 * Rechteck, Quadrat oder Sechseck mit den Spiegellinien und ihren Namen, den Achsen wie in der App
 * (a nach unten, b nach rechts; hexagonal a1, a2, a3), Drehpunkt in der Mitte und Pfeil +n.
 */
export function punktgruppe(pg, f) {
  const c = [260, 200];
  const pol = (w, r, m = c) => [m[0] + r * Math.cos((w * Math.PI) / 180), m[1] - r * Math.sin((w * Math.PI) / 180)];
  const n = Number(pg[0]);
  const svg = [`<rect width="520" height="400" fill="${f.paper}"/>`, `<defs>${pfeilspitze(`pg-pf-${pg}`, f.accent2)}${pfeilspitze(`pg-ax-${pg}`, f.ink)}</defs>`];
  // Index: Buchstaben kursiv, Ziffern und Zeichen aufrecht; ⊥ hochgestellt am m
  const teil = (t) => t.replace(/[a-z]/g, (x) => `\u0000${x}\u0001`).split(/(\u0000.\u0001)/).filter(Boolean)
    .map((x) => (x[0] === '\u0000' ? `<tspan font-style="italic">${x[1]}</tspan>` : `<tspan font-style="normal">${x}</tspan>`)).join('');
  const marke = (q, o) => `<text x="${f2(q[0])}" y="${f2(q[1] + 7)}" ${SERIF} font-size="30" fill="${f.accent}" text-anchor="middle">m`
    + `${o.zeichen ? `<tspan font-size="20" dy="-12" font-style="normal">${o.zeichen}</tspan><tspan font-size="20" dy="18" dx="-12">` : '<tspan font-size="20" dy="6">'}${teil(o.index)}</tspan></text>`;
  const ecken = pg === '2mm' ? [[-125, -80], [125, -80], [125, 80], [-125, 80]].map(([x, y]) => [c[0] + x, c[1] + y])
    : Array.from({ length: n }, (_, i) => pol(n === 4 ? 45 + 90 * i : 60 * i, n === 4 ? 92 * Math.SQRT2 : 118));
  svg.push(`<path d="M${ecken.map((q) => `${f2(q[0])} ${f2(q[1])}`).join(' L')} Z" fill="${f.crystal}" fill-opacity="0.35" stroke="${f.ink}" stroke-width="1.6"/>`);
  // Spiegellinien und ihre Namen aus punktoperationen.js, damit Bild und Fragen übereinstimmen
  for (const o of OPERATIONEN[pg].filter((x) => x.art === 'm')) {
    svg.push(linie(pol(o.w, 148), pol(o.w + 180, 148), `stroke="${f.accent}" stroke-width="3"`));
    svg.push(marke(pol(o.w, 170), o));
  }
  // Achsen wie in der App (Winkel im Bild): rechteckig und quadratisch a 270°, b 0°; hexagonal
  // a1 240°, a2 0°, a3 120°. Name neben der Mitte des Pfeils (seite: Winkel des Versatzes) bzw. an der Spitze.
  const name = (t) => t.replace(/([a-z])(\d?)/, (m, x, d) => `<tspan font-style="italic">${x}</tspan>${d ? `<tspan font-size="18" dy="6" font-style="normal">${d}</tspan>` : ''}`);
  const pfeil = (o, w, l, t, seite = null) => {
    const e = pol(w, l, o);
    const q = seite === null ? pol(w, l + 18, o) : pol(seite, 18, pol(w, l / 2, o));
    svg.push(linie(o, e, `stroke="${f.ink}" stroke-width="2.6" marker-end="url(#pg-ax-${pg})"`));
    svg.push(`<text x="${f2(q[0])}" y="${f2(q[1] + 8)}" ${SERIF} font-size="26" fill="${f.ink}" text-anchor="middle">${name(t)}</text>`);
  };
  if (n === 6) {
    const o = [100, 330];
    pfeil(o, 240, 44, 'a1'); pfeil(o, 0, 44, 'a2'); pfeil(o, 120, 44, 'a3');
  } else {
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
