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
 * Rechteck, Quadrat oder Sechseck; Spiegellinien gegen den Uhrzeigersinn nummeriert, m1 waagrecht;
 * in 2mm ma ⊥ a (a nach unten) und mb ⊥ b (b nach rechts); Drehpunkt in der Mitte, Pfeil +n.
 */
export function punktgruppe(pg, f) {
  const c = [260, 200];
  const pol = (w, r) => [c[0] + r * Math.cos((w * Math.PI) / 180), c[1] - r * Math.sin((w * Math.PI) / 180)];
  const n = Number(pg[0]);
  const svg = [`<rect width="520" height="400" fill="${f.paper}"/>`, `<defs>${pfeilspitze(`pg-pf-${pg}`, f.accent2)}</defs>`];
  const marke = (q, index, kursiv) => `<text x="${f2(q[0])}" y="${f2(q[1] + 7)}" ${SERIF} font-size="30" fill="${f.accent}" text-anchor="middle">m<tspan font-size="20" dy="6" ${kursiv ? '' : 'font-style="normal"'}>${index}</tspan></text>`;
  const ecken = pg === '2mm' ? [[-125, -80], [125, -80], [125, 80], [-125, 80]].map(([x, y]) => [c[0] + x, c[1] + y])
    : Array.from({ length: n }, (_, i) => pol(n === 4 ? 45 + 90 * i : 60 * i, n === 4 ? 92 * Math.SQRT2 : 118));
  svg.push(`<path d="M${ecken.map((q) => `${f2(q[0])} ${f2(q[1])}`).join(' L')} Z" fill="${f.crystal}" fill-opacity="0.35" stroke="${f.ink}" stroke-width="1.6"/>`);
  // Spiegellinien und ihre Namen aus punktoperationen.js, damit Bild und Fragen übereinstimmen
  const linien = OPERATIONEN[pg].filter((o) => o.art === 'm').map((o) => [o.w, o.name.slice(1), pg === '2mm']);
  for (const [w, index, kursiv] of linien) {
    svg.push(linie(pol(w, 152), pol(w + 180, 152), `stroke="${f.accent}" stroke-width="3"`));
    svg.push(marke(pol(w, 176), index, kursiv));
  }
  if (pg === '2mm') {
    // Achsen wie in der App: a nach unten, b nach rechts, Ursprung links oben
    const o = [c[0] - 125, c[1] - 80];
    svg.push(`<defs>${pfeilspitze('pg-ax', f.ink)}</defs>`);
    svg.push(linie(o, [o[0], o[1] + 70], `stroke="${f.ink}" stroke-width="2.6" marker-end="url(#pg-ax)"`));
    svg.push(linie(o, [o[0] + 70, o[1]], `stroke="${f.ink}" stroke-width="2.6" marker-end="url(#pg-ax)"`));
    svg.push(text([o[0] - 20, o[1] + 66], 'a', `${SERIF} font-size="28" fill="${f.ink}" text-anchor="middle"`));
    svg.push(text([o[0] + 64, o[1] - 12], 'b', `${SERIF} font-size="28" fill="${f.ink}" text-anchor="middle"`));
  } else {
    // +n: Bogen gegen den Uhrzeigersinn wie in Abb. 4.4, die Marke zwischen m1 und m2
    const a = pol(-30, 66); const b = pol(50, 66);
    svg.push(`<path d="M${f2(a[0])} ${f2(a[1])} A66 66 0 0 0 ${f2(b[0])} ${f2(b[1])}" fill="none" stroke="${f.accent2}" stroke-width="3" marker-end="url(#pg-pf-${pg})"/>`);
    const t = pol(90 / n, 104);
    svg.push(text([t[0], t[1] + 6], `+${n}`, `${SANS} font-size="26" fill="${f.accent2}" text-anchor="middle"`));
  }
  svg.push(drehSymbol(n, c, f.ink, f.paper, 2, 1.5));
  return svg.join('');
}
