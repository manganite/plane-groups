// Skizzen, die es in der App nicht gibt und die Skript und Quiz gemeinsam brauchen (ohne DOM, auch
// für den Moodle-Export). Farben in der Form der Tafeln (farbenAus in quiz-bild.js).

import { f2 } from './zeichnung.js';

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
