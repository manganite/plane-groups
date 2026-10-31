// Skript der App „Symmetrie in der Ebene“: zeichnet die Abbildungen mit dem Code der App.
// Eine Abbildung der App ist durch ihre Link-Adresse beschrieben (data-app="#m=…"); daraus entsteht mit
// zustand.js und zeichnung.js bzw. struktur.js genau die Tafel, die die App für diese Adresse zeigt
// (data-tafel="a" oder "b"). Dazu kommen einige Skizzen, die es in der App nicht gibt (data-kind
// „gitter“, „zellen“, „koord“). Inhaltsverzeichnis, App-Links und Querstriche kommen aus
// lib/common/js/skript-kern.js.

import { appLink, inhaltsverzeichnis, querstriche } from '../lib/common/js/skript-kern.js';
import { versionEintragen, offline } from '../lib/common/js/seite.js';
import { VERSION } from './version.js';
import { startzustand, hashAnwenden } from './zustand.js';
import { tafelA, tafelB, metrik, kart, ansicht, f2, pt } from './zeichnung.js';
import { strukturTafelA, strukturTafelB } from './struktur.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
const farben = () => ({
  paper: css('paper'), ink: css('ink'), muted: css('muted'), line: css('line'), accent: css('accent'), accent2: css('accent2'),
  upper: css('upper'), crystal: css('crystal'), dir: [css('dir1'), css('dir2'), css('dir3')],
  fc3: css('fc3'), fc4: css('fc4'), fc: [0, 1, 2, 3, 4, 5].map((i) => css(`fc${i}`)),
});

/** Zustand der App zu einer Link-Adresse. */
function zustandVon(hash) {
  const z = startzustand();
  hashAnwenden(z, hash);
  return z;
}

/** Tafel A oder B der App zu ihrer Link-Adresse. */
function appTafel(fig, f) {
  const z = zustandVon(fig.dataset.app);
  const b = fig.dataset.tafel === 'b';
  if (z.modus === 'struktur') {
    const st = z.struktur;
    const a = strukturTafelA(st, { elemente: st.elemente, zelle: st.zelle, ae: st.ae, bindungen: st.bindungen, farben: false }, f);
    return b ? strukturTafelB(st, f, a.ergebnis).svg : a.svg;
  }
  return b ? tafelB(z.gruppe, z, f).svg : tafelA(z.gruppe, z, f).svg;
}

// ------------------------------------------------------------------ Skizzen
const pfeilspitze = (id, farbe) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${farbe}"/></marker>`;
const linie = (p, q, attr) => `<line x1="${f2(p[0])}" y1="${f2(p[1])}" x2="${f2(q[0])}" y2="${f2(q[1])}" ${attr}/>`;
const text = (p, t, attr = '') => `<text x="${f2(p[0])}" y="${f2(p[1])}" ${attr}>${t}</text>`;
const SERIF = 'font-family="Source Serif 4, serif" font-style="italic"';
const SANS = 'font-family="IBM Plex Sans, sans-serif"';

/** Gitterpunkte im Bereich [lo, hi]² als Kreise. */
function punkte(A, lo, hi, f, r = 4.2) {
  const out = [];
  for (let u = lo; u <= hi; u++) for (let v = lo; v <= hi; v++) {
    const q = A.zuBild([u, v]);
    if (q[0] > -10 && q[0] < 530 && q[1] > -10 && q[1] < 530) out.push(`<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${r}" fill="${f.ink}"/>`);
  }
  return out.join('');
}

/** Beschriftung neben der Mitte einer Strecke, um d Pixel senkrecht dazu versetzt. */
function seitlich(p, q, d) {
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; const v = [q[0] - p[0], q[1] - p[1]]; const l = Math.hypot(...v) || 1;
  return [m[0] - (d * v[1]) / l, m[1] + (d * v[0]) / l];
}

/**
 * Gitter mit Gittervektoren a, b, Winkel γ und einer Gittertranslation t = 2a + b
 * (data-metrik="b/a,γ").
 */
function gitterSkizze(fig, f) {
  const [ba, gamma] = (fig.dataset.metrik || '1.25,105').split(',').map(Number);
  const M = metrik({ ba, gamma });
  const ecken = [[-1.3, -1.3], [3.3, -1.3], [-1.3, 2.6], [3.3, 2.6]].map((p) => kart(M, p));
  const A = ansicht(M, [Math.min(...ecken.map((c) => c[0])), Math.min(...ecken.map((c) => c[1])), Math.max(...ecken.map((c) => c[0])), Math.max(...ecken.map((c) => c[1]))], 520, 10);
  const o = A.zuBild([0, 0]); const pa = A.zuBild([1, 0]); const pb = A.zuBild([0, 1]); const pt2 = A.zuBild([2, 1]);
  const svg = [`<defs>${pfeilspitze('pa', f.accent)}${pfeilspitze('pt', f.accent2)}</defs>`, `<rect width="520" height="520" fill="${f.paper}"/>`,
    punkte(A, -4, 6, f),
    linie(o, pt2, `stroke="${f.accent2}" stroke-width="2.4" marker-end="url(#pt)"`),
    linie(o, pa, `stroke="${f.accent}" stroke-width="3" marker-end="url(#pa)"`),
    linie(o, pb, `stroke="${f.accent}" stroke-width="3" marker-end="url(#pa)"`),
  ];
  // Winkel γ zwischen a und b
  const r = 34; const wa = Math.atan2(pa[1] - o[1], pa[0] - o[0]); const wb = Math.atan2(pb[1] - o[1], pb[0] - o[0]);
  const bogen = (w) => [o[0] + r * Math.cos(w), o[1] + r * Math.sin(w)];
  const s = bogen(wa); const e = bogen(wb); const mw = (wa + wb) / 2;
  svg.push(`<path d="M${f2(s[0])} ${f2(s[1])} A${r} ${r} 0 0 ${wb > wa ? 1 : 0} ${f2(e[0])} ${f2(e[1])}" fill="none" stroke="${f.muted}" stroke-width="1.4"/>`);
  svg.push(text([o[0] + 52 * Math.cos(mw), o[1] + 52 * Math.sin(mw) + 6], 'γ', `${SERIF} font-size="20" fill="${f.ink}" text-anchor="middle"`));
  svg.push(text(seitlich(o, pa, 16), 'a', `${SERIF} font-weight="600" font-size="22" fill="${f.accent}" text-anchor="middle" dominant-baseline="middle"`));
  svg.push(text(seitlich(o, pb, -16), 'b', `${SERIF} font-weight="600" font-size="22" fill="${f.accent}" text-anchor="middle" dominant-baseline="middle"`));
  svg.push(text(seitlich([(o[0] + pt2[0]) / 2, (o[1] + pt2[1]) / 2], pt2, 52), '<tspan font-style="italic">t</tspan> = 2<tspan font-style="italic">a</tspan> + <tspan font-style="italic">b</tspan>', `font-family="Source Serif 4, serif" font-size="20" fill="${f.accent2}" text-anchor="middle" dominant-baseline="middle"`));
  return svg.join('');
}

/**
 * Mögliche Elementarzellen in einem Gitter: drei primitive (I–III) gleicher Fläche und eine
 * nichtprimitive (IV) mit doppelter Fläche.
 */
function zellenSkizze(fig, f) {
  const M = metrik({ ba: 1.25, gamma: 105 });
  const A = ansicht(M, [kart(M, [0, 0]), kart(M, [5, 5]), kart(M, [0, 5]), kart(M, [5, 0])].reduce((b, c) => [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[0]), Math.max(b[3], c[1])], [Infinity, Infinity, -Infinity, -Infinity]), 520, 30);
  const zellen = [
    { name: 'I', o: [0.0, 0.0], a: [1, 0], b: [0, 1], farbe: f.accent },
    { name: 'II', o: [0, 2], a: [1, 0], b: [1, 1], farbe: f.fc[1] },
    { name: 'III', o: [3, 1], a: [1, -1], b: [0, 1], farbe: f.fc[2] },
    { name: 'IV', o: [3, 3], a: [1, 1], b: [-1, 1], farbe: f.fc[4] },
  ];
  const svg = [`<rect width="520" height="520" fill="${f.paper}"/>`];
  for (const z of zellen) {
    const e = [z.o, [z.o[0] + z.a[0], z.o[1] + z.a[1]], [z.o[0] + z.a[0] + z.b[0], z.o[1] + z.a[1] + z.b[1]], [z.o[0] + z.b[0], z.o[1] + z.b[1]]];
    const q = e.map((p) => A.zuBild(p));
    svg.push(`<polygon points="${q.map(pt).join(' ')}" fill="${z.farbe}" fill-opacity="0.16" stroke="${z.farbe}" stroke-width="2.4" stroke-linejoin="round"/>`);
    const m = A.zuBild([z.o[0] + (z.a[0] + z.b[0]) / 2, z.o[1] + (z.a[1] + z.b[1]) / 2]);
    // Name nicht auf einen Gitterpunkt (Zelle IV hat einen in der Mitte)
    svg.push(text([m[0], m[1] + (z.name === 'IV' ? -22 : 0)], z.name, `${SANS} font-weight="600" font-size="19" fill="${z.farbe}" text-anchor="middle" dominant-baseline="middle"`));
  }
  svg.push(punkte(A, -1, 6, f));
  return svg.join('');
}

/**
 * Bruchkoordinaten: derselbe Punkt P = x a + y b in einem Gitter (data-metrik="b/a,γ"),
 * mit den Anteilen x a und y b (data-punkt="x,y").
 */
function koordSkizze(fig, f) {
  const [ba, gamma] = (fig.dataset.metrik || '1,90').split(',').map(Number);
  const [x, y] = (fig.dataset.punkt || '0.75,0.3333333').split(',').map(Number);
  const M = metrik({ ba, gamma });
  const ecken = [[-0.12, -0.12], [1.12, 1.12], [-0.12, 1.12], [1.12, -0.12]].map((p) => kart(M, p));
  const A = ansicht(M, [Math.min(...ecken.map((c) => c[0])), Math.min(...ecken.map((c) => c[1])), Math.max(...ecken.map((c) => c[0])), Math.max(...ecken.map((c) => c[1]))], 520, 30);
  const o = A.zuBild([0, 0]); const P = A.zuBild([x, y]); const X = A.zuBild([x, 0]);
  const zelle = [[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => pt(A.zuBild(p))).join(' ');
  const svg = [`<defs>${pfeilspitze(`ka${fig.dataset.nr}`, f.accent)}${pfeilspitze(`kx${fig.dataset.nr}`, f.fc[1])}</defs>`,
    `<rect width="520" height="520" fill="${f.paper}"/>`,
    `<polygon points="${zelle}" fill="${f.crystal}" fill-opacity="0.35" stroke="${f.line}" stroke-width="1.4"/>`];
  // Hilfslinien: Gitterlinien in Schritten von 1/4 (dünn)
  for (let k = 1; k < 4; k++) {
    svg.push(linie(A.zuBild([k / 4, 0]), A.zuBild([k / 4, 1]), `stroke="${f.line}" stroke-width="0.8" stroke-dasharray="3 3"`));
    svg.push(linie(A.zuBild([0, k / 4]), A.zuBild([1, k / 4]), `stroke="${f.line}" stroke-width="0.8" stroke-dasharray="3 3"`));
  }
  svg.push(linie(o, A.zuBild([1, 0]), `stroke="${f.accent}" stroke-width="2.6" marker-end="url(#ka${fig.dataset.nr})"`));
  svg.push(linie(o, A.zuBild([0, 1]), `stroke="${f.accent}" stroke-width="2.6" marker-end="url(#ka${fig.dataset.nr})"`));
  svg.push(linie(o, X, `stroke="${f.fc[1]}" stroke-width="3.2" marker-end="url(#kx${fig.dataset.nr})"`));
  svg.push(linie(X, P, `stroke="${f.fc[1]}" stroke-width="3.2" marker-end="url(#kx${fig.dataset.nr})"`));
  svg.push(punkte(A, 0, 1, f, 4.6));
  svg.push(`<circle cx="${f2(P[0])}" cy="${f2(P[1])}" r="7" fill="${f.accent2}" stroke="${f.paper}" stroke-width="1.5"/>`);
  svg.push(text([P[0] + 14, P[1] - 12], 'P', `${SERIF} font-size="22" fill="${f.accent2}"`));
  svg.push(text(seitlich(o, A.zuBild([1, 0]), 18), 'a', `${SERIF} font-weight="600" font-size="22" fill="${f.accent}" text-anchor="middle" dominant-baseline="middle"`));
  svg.push(text(seitlich(o, A.zuBild([0, 1]), -18), 'b', `${SERIF} font-weight="600" font-size="22" fill="${f.accent}" text-anchor="middle" dominant-baseline="middle"`));
  svg.push(text(seitlich(o, X, -18), fig.dataset.xa || '¾ <tspan font-style="italic">a</tspan>', `font-family="Source Serif 4, serif" font-size="19" fill="${f.fc[1]}" text-anchor="middle" dominant-baseline="middle"`));
  svg.push(text(seitlich(X, P, 18), fig.dataset.yb || '⅓ <tspan font-style="italic">b</tspan>', `font-family="Source Serif 4, serif" font-size="19" fill="${f.fc[1]}" text-anchor="middle" dominant-baseline="middle"`));
  return svg.join('');
}

const SKIZZEN = { gitter: gitterSkizze, zellen: zellenSkizze, koord: koordSkizze };

function abbildungen() {
  const f = farben();
  for (const fig of document.querySelectorAll('figure[data-kind]')) {
    if (fig.dataset.app) appLink(fig, 'index.html');
    const art = fig.querySelector('.fig-art');
    const inhalt = fig.dataset.kind === 'app' ? appTafel(fig, f) : SKIZZEN[fig.dataset.kind](fig, f);
    art.innerHTML = `<svg viewBox="0 0 520 520" role="img" aria-label="${fig.dataset.alt || 'Abbildung'}">${inhalt}</svg>`;
  }
}

versionEintragen(VERSION);
abbildungen();
inhaltsverzeichnis();
document.fonts.ready.then(querstriche);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { abbildungen(); querstriche(); });
offline();
