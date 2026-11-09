// Skript der App „Symmetrie in der Ebene“: zeichnet die Abbildungen mit dem Code der App.
// Eine Abbildung der App ist durch ihre Link-Adresse beschrieben (data-app="#m=…"); daraus entsteht mit
// zustand.js und zeichnung.js bzw. struktur.js genau die Tafel, die die App für diese Adresse zeigt
// (data-tafel="a" oder "b"). Dazu kommen einige Skizzen, die es in der App nicht gibt (data-kind
// „gitter“, „zellen“, „koord“). Inhaltsverzeichnis, App-Links und Querstriche kommen aus
// lib/common/js/skript-kern.js.

import { appLink, inhaltsverzeichnis, querstriche } from '../lib/common/js/skript-kern.js';
import { versionEintragen, offline, elemente } from '../lib/common/js/seite.js';
import { VERSION } from './version.js';
import { startzustand, hashAnwenden } from './zustand.js';
import { tafelA, tafelB, metrik, kart, ansicht, f2, pt, grad } from './zeichnung.js';
import { strukturTafelA, strukturTafelB, motivSVG, motivFarben } from './struktur.js';
import { ausgeschrieben } from './bahnen.js';
import { MOTIVE } from './motive.js';
import { pfeilspitze, linie, text, SERIF, SANS, dreieck3m, punktgruppe, kachel, flussdiagramm } from './skizzen.js';
import { FLUSSDIAGRAMM, LEITFRAGEN } from './bestimmen.js';
import { gruppe, anwenden, art, elemente as symmetrieElemente } from './symmetrie.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Ansicht, Farben, Box } from './zeichnung.js' */
/** Farben der Tafeln mit den Formfarben --fc0 … --fc5. @typedef {Farben & { fc: string[] }} SkriptFarben */

/** @param {string} name */
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
/** @returns {SkriptFarben} */
const farben = () => ({
  paper: css('paper'), ink: css('ink'), muted: css('muted'), line: css('line'), accent: css('accent'), accent2: css('accent2'),
  upper: css('upper'), crystal: css('crystal'), dir: [css('dir1'), css('dir2'), css('dir3')],
  fc3: css('fc3'), fc4: css('fc4'), fc: [0, 1, 2, 3, 4, 5].map((i) => css(`fc${i}`)),
});

/** Zustand der App zu einer Link-Adresse. @param {string} hash */
function zustandVon(hash) {
  const z = startzustand();
  hashAnwenden(z, hash);
  return z;
}

/**
 * Grösse der Symbole im Skript (im Muster auch der Fähnchen; in Tafel A folgen sie
 * dem Gitter). Die App zeichnet sie für eine Tafel von etwa 520 px;
 * im Skript ist eine Abbildung oft nur halb oder ein Drittel so breit, und die Symbole würden
 * neben der Zelle winzig. Deshalb wachsen sie mit der Spaltenzahl der Abbildungsreihe
 * (data-gross setzt den Wert für eine Abbildung fest). Muster (Tafel B) sind dichter, dort
 * etwas weniger.
 * @param {HTMLElement} fig @param {boolean} tafelB
 */
function symbolGroesse(fig, tafelB) {
  if (fig.dataset.gross) return Number(fig.dataset.gross);
  const reihe = fig.parentElement?.classList;
  const k = reihe?.contains('fig-row3') ? 2.3 : reihe?.contains('fig-grid5') ? 1.9 : reihe?.contains('fig-row') ? 1.5 : 1.4;
  return tafelB ? 1 + (k - 1) * 0.5 : k;
}

/** Tafel A oder B der App zu ihrer Link-Adresse (data-app). @param {HTMLElement} fig @param {Farben} f */
function appTafel(fig, f) {
  const app = /** @type {string} */ (fig.dataset.app);
  const z = zustandVon(app);
  const b = fig.dataset.tafel === 'b';
  if (z.modus === 'struktur') {
    const st = ausgeschrieben(z.struktur); // mit festgehaltener Gruppe (sg=) die Bahnen ausgeschrieben, wie in der App
    const a = strukturTafelA(st, { elemente: st.elemente, zelle: st.zelle, ae: st.ae, bindungen: st.bindungen, farben: false }, f);
    // data-zelle="0": ohne konventionelle Zelle; data-elemente="1": Symmetrieelemente im Muster (Kap. 8)
    return b ? strukturTafelB(st, f, a.ergebnis, z.zoomB, { zelle: fig.dataset.zelle !== '0', elemente: fig.dataset.elemente === '1' }).svg : a.svg;
  }
  // Mit Grösse des Objekts (og) in der Adresse zeigt die Abbildung genau, was die App zeigt
  const k = /[#&]og=/.test(app) ? 1 : symbolGroesse(fig, b);
  return b ? tafelB(z.gruppe, z, f, { k, tapeteElemente: fig.dataset.elemente === '1', nurZelle: fig.dataset.elemente === 'zelle' }).svg : tafelA(z.gruppe, z, f, { k }).svg;
}

// ------------------------------------------------------------------ Skizzen
/** Gitterpunkte im Bereich [lo, hi]² als Kreise. @param {Ansicht} A @param {number} lo @param {number} hi @param {Farben} f @param {number} [r] */
function punkte(A, lo, hi, f, r = 4.2) {
  const out = [];
  for (let u = lo; u <= hi; u++) for (let v = lo; v <= hi; v++) {
    const q = A.zuBild([u, v]);
    if (q[0] > -10 && q[0] < 530 && q[1] > -10 && q[1] < 530) out.push(`<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${r}" fill="${f.ink}"/>`);
  }
  return out.join('');
}

/** Beschriftung neben der Mitte einer Strecke, um d Pixel senkrecht dazu versetzt. @param {Vec2} p @param {Vec2} q @param {number} d @returns {Vec2} */
function seitlich(p, q, d) {
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; const v = [q[0] - p[0], q[1] - p[1]]; const l = Math.hypot(...v) || 1;
  return [m[0] - (d * v[1]) / l, m[1] + (d * v[0]) / l];
}

/**
 * Gitter mit Gittervektoren a, b, Winkel γ und einer Gittertranslation t = 2a + b
 * (data-metrik="b/a,γ").
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function gitterSkizze(fig, f) {
  const [ba, gamma] = (fig.dataset.metrik || '1.25,105').split(',').map(Number);
  const M = metrik({ ba, gamma: grad(gamma) });
  const ecken = /** @type {Vec2[]} */ ([[-1.3, -1.3], [3.3, -1.3], [-1.3, 2.6], [3.3, 2.6]]).map((p) => kart(M, p));
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
  /** @param {number} w @returns {Vec2} */
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
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function zellenSkizze(fig, f) {
  const M = metrik({ ba: 1.25, gamma: grad(105) });
  const A = ansicht(M, [kart(M, [0, 0]), kart(M, [5, 5]), kart(M, [0, 5]), kart(M, [5, 0])].reduce((b, c) => [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[0]), Math.max(b[3], c[1])], /** @type {Box} */ ([Infinity, Infinity, -Infinity, -Infinity])), 520, 30);
  /** @type {{ name: string, o: Vec2, a: Vec2, b: Vec2, farbe: string }[]} */
  const zellen = [
    { name: 'I', o: [0.0, 0.0], a: [1, 0], b: [0, 1], farbe: f.accent },
    { name: 'II', o: [0, 2], a: [1, 0], b: [1, 1], farbe: f.fc[1] },
    { name: 'III', o: [3, 1], a: [1, -1], b: [0, 1], farbe: f.fc[2] },
    { name: 'IV', o: [3, 3], a: [1, 1], b: [-1, 1], farbe: f.fc[4] },
  ];
  const svg = [`<rect width="520" height="520" fill="${f.paper}"/>`];
  for (const z of zellen) {
    /** @type {Vec2[]} */
    const e = [z.o, [z.o[0] + z.a[0], z.o[1] + z.a[1]], [z.o[0] + z.a[0] + z.b[0], z.o[1] + z.a[1] + z.b[1]], [z.o[0] + z.b[0], z.o[1] + z.b[1]]];
    const q = e.map((p) => A.zuBild(p));
    svg.push(`<polygon points="${q.map(pt).join(' ')}" fill="${z.farbe}" fill-opacity="0.16" stroke="${z.farbe}" stroke-width="2.4" stroke-linejoin="round"/>`);
    const m = A.zuBild([z.o[0] + (z.a[0] + z.b[0]) / 2, z.o[1] + (z.a[1] + z.b[1]) / 2]);
    // Name nicht auf einen Gitterpunkt (Zelle IV hat einen in der Mitte); Hof in der Papierfarbe, weil die Farbe
    // auf der Tönung der Zelle 4,5 : 1 verfehlt (Leitfaden Abschn. 5.4, #114)
    svg.push(text([m[0], m[1] + (z.name === 'IV' ? -22 : 0)], z.name, `${SANS} font-weight="600" font-size="19" fill="${z.farbe}" stroke="${f.paper}" stroke-width="5" stroke-linejoin="round" paint-order="stroke" text-anchor="middle" dominant-baseline="middle"`));
  }
  svg.push(punkte(A, -1, 6, f));
  return svg.join('');
}

/**
 * Bruchkoordinaten: derselbe Punkt P = x a + y b in einem Gitter (data-metrik="b/a,γ"),
 * mit den Anteilen x a und y b (data-punkt="x,y").
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function koordSkizze(fig, f) {
  const [ba, gamma] = (fig.dataset.metrik || '1,90').split(',').map(Number);
  const [x, y] = (fig.dataset.punkt || '0.75,0.3333333').split(',').map(Number);
  const M = metrik({ ba, gamma: grad(gamma) });
  const ecken = /** @type {Vec2[]} */ ([[-0.12, -0.12], [1.12, 1.12], [-0.12, 1.12], [1.12, -0.12]]).map((p) => kart(M, p));
  const A = ansicht(M, [Math.min(...ecken.map((c) => c[0])), Math.min(...ecken.map((c) => c[1])), Math.max(...ecken.map((c) => c[0])), Math.max(...ecken.map((c) => c[1]))], 520, 30);
  const o = A.zuBild([0, 0]); const P = A.zuBild([x, y]); const X = A.zuBild([x, 0]);
  const zelle = /** @type {Vec2[]} */ ([[0, 0], [1, 0], [1, 1], [0, 1]]).map((p) => pt(A.zuBild(p))).join(' ');
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

/**
 * Ein 5-zähliger Drehpunkt erzeugt aus einem Punkt ein regelmässiges Fünfeck; die parallelen
 * Strecken II–V und III–IV haben das Längenverhältnis 1,618 (nach Borchardt-Ott & Sowa Abb. 6.8a).
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function fuenfSkizze(fig, f) {
  /** @type {Vec2} */
  const m = [260, 270]; const r = 175;
  const p = Array.from({ length: 5 }, (_, k) => { const w = ((-90 + 72 * k) * Math.PI) / 180; return /** @type {Vec2} */ ([m[0] + r * Math.cos(w), m[1] + r * Math.sin(w)]); });
  const namen = ['I', 'II', 'III', 'IV', 'V'];
  const svg = [`<rect width="520" height="520" fill="${f.paper}"/>`];
  svg.push(`<polygon points="${p.map(pt).join(' ')}" fill="none" stroke="${f.line}" stroke-width="1.2"/>`);
  svg.push(linie(p[1], p[4], `stroke="${f.accent}" stroke-width="3"`));
  svg.push(linie(p[2], p[3], `stroke="${f.fc[1]}" stroke-width="3"`));
  // Drehpunkt in der Mitte (Fünfeck, gefüllt) und Pfeil der Drehung um 72°
  const fz = Array.from({ length: 5 }, (_, k) => { const w = ((-90 + 72 * k) * Math.PI) / 180; return /** @type {Vec2} */ ([m[0] + 11 * Math.cos(w), m[1] + 11 * Math.sin(w)]); });
  svg.push(`<polygon points="${fz.map(pt).join(' ')}" fill="${f.ink}"/>`);
  p.forEach((q, k) => {
    svg.push(`<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="7" fill="${f.ink}"/>`);
    const d = [q[0] - m[0], q[1] - m[1]]; const l = Math.hypot(...d);
    svg.push(text([q[0] + (26 * d[0]) / l, q[1] + (26 * d[1]) / l + 6], namen[k], `font-family="Source Serif 4, serif" font-size="20" fill="${f.ink}" text-anchor="middle"`));
  });
  svg.push(text([m[0], (p[1][1] + p[4][1]) / 2 - 12], '1,618', `${SANS} font-size="17" fill="${f.accent}" text-anchor="middle"`));
  svg.push(text([m[0], p[2][1] - 12], '1', `${SANS} font-size="17" fill="${f.fc[1]}" text-anchor="middle"`));
  return svg.join('');
}

/**
 * Die Motive der App mit ihrer eigenen Symmetrie (Punktgruppe der Ebene), geordnet wie die
 * 10 Punktgruppen: 1, 2, m, 2mm, 3, 3m, 4, 4mm, 6, 6mm.
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function motiveSkizze(fig, f) {
  const liste = ['fahne', 'w2', 'dreieck', 'insel', 'w3', 'dreieck3', 'w4', 'quadrat', 'w6', 'sechseck'];
  const M = metrik({ ba: 1, gamma: grad(90) }); // a nach unten, b nach rechts: Zeilen entlang a
  const A = ansicht(M, [0, 0, 5, 2], 520, 6);
  const farbe = motivFarben(f)[0];
  const svg = [`<rect width="520" height="520" fill="${f.paper}"/>`];
  liste.forEach((id, k) => {
    /** @type {Vec2} */
    const p = [Math.floor(k / 5) + 0.42, (k % 5) + 0.5];
    const groesse = id === 'insel' ? 0.34 : 0.27;
    svg.push(motivSVG({ motiv: id, farbe: 0, p, winkel: grad(0), groesse }, p, A, M, farbe, f.paper));
    const t = A.zuBild([p[0] + 0.43, p[1]]);
    const sym = MOTIVE[id].symmetrie.replace(/m/g, '<tspan font-style="italic">m</tspan>');
    svg.push(text(t, sym, `font-family="Source Serif 4, serif" font-size="22" fill="${f.ink}" text-anchor="middle"`));
  });
  return svg.join('');
}

/**
 * Fussspuren (Kap. 4, nach Hoffmann Abb. 4.7–4.9): auf einem Bein hüpfen
 * (Translation), mit beiden Beinen springen (Spiegellinie entlang der Laufrichtung), gehen
 * (Gleitspiegellinie). Laufrichtung nach rechts; der rechte Fuss liegt unten.
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function spurenSkizze(fig, f) {
  // Fuss mit Zehen nach +x; rechts: grosser Zeh innen (nach −y), links gespiegelt
  /** @param {number} x @param {number} y @param {boolean} rechts */
  const fuss = (x, y, rechts) => {
    const s = rechts ? 1 : -1;
    const sohle = `M-16 0 C-16 ${-5.5 * s} -10 ${-6.5 * s} -4 ${-5 * s} C2 ${-4 * s} 7 ${-8 * s} 12 ${-6 * s} C15 ${-4.5 * s} 15 ${4 * s} 12 ${7 * s} C8 ${10 * s} 0 ${8 * s} -5 ${6 * s} C-11 ${5 * s} -16 ${5 * s} -16 0 Z`;
    const zehen = [[18.5, -4.6, 3.4], [19.3, 0.4, 2.3], [18.2, 4.2, 2], [16.4, 7.2, 1.8], [14, 9.6, 1.5]]
      .map(([zx, zy, r]) => `<circle cx="${zx}" cy="${zy * s}" r="${r}"/>`).join('');
    return `<g transform="translate(${x} ${y})" fill="${f.ink}" opacity="0.85"><path d="${sohle}"/>${zehen}</g>`;
  };
  const x0 = 120; const t = 96; const n = 4;
  /** @type {{ y: number, name: string, sym: string, fuesse: (i: number) => string[] }[]} */
  const zeilen = [
    { y: 70, name: 'auf einem Bein hüpfen', sym: 't', fuesse: (i) => [fuss(x0 + i * t, 70, true)] },
    { y: 190, name: 'mit beiden Beinen springen', sym: 'm', fuesse: (i) => [fuss(x0 + i * t, 172, false), fuss(x0 + i * t, 208, true)] },
    { y: 310, name: 'gehen', sym: 'g', fuesse: (i) => [fuss(x0 + i * t, 292, false), fuss(x0 + i * t + t / 2, 328, true)] },
  ];
  const svg = [`<rect width="520" height="380" fill="${f.paper}"/>`, `<defs>${pfeilspitze('sp-pf', f.accent)}</defs>`];
  for (const z of zeilen) {
    svg.push(text([12, z.y - 36], z.name, `${SANS} font-size="15" fill="${f.muted}"`));
    for (let i = 0; i < n; i++) svg.push(...z.fuesse(i));
    if (z.sym === 'm') svg.push(linie([x0 - 40, z.y], [x0 + (n - 1) * t + 40, z.y], `stroke="${f.accent}" stroke-width="2.4"`));
    if (z.sym === 'g') svg.push(linie([x0 - 40, z.y], [x0 + (n - 1) * t + t / 2 + 40, z.y], `stroke="${f.accent}" stroke-width="2.4" stroke-dasharray="9 6"`));
    svg.push(text([28, z.y + 7], z.sym, `${SERIF} font-size="24" fill="${f.accent}"`));
  }
  // Translation t in der ersten Zeile, Gleitkomponente t/2 in der dritten
  /** @param {number} y @param {number} x1 @param {number} x2 @param {string} label */
  const pfeil = (y, x1, x2, label) => linie([x1, y], [x2, y], `stroke="${f.accent}" stroke-width="1.8" marker-end="url(#sp-pf)"`)
    + text([(x1 + x2) / 2, y - 7], label, `${SERIF} font-size="18" fill="${f.accent}" text-anchor="middle"`);
  svg.push(pfeil(100, x0 - 15, x0 + t - 15, 't'));
  svg.push(pfeil(358, x0 - 15, x0 + t / 2 - 15, 't/2'));
  return svg.join('');
}

/**
 * Merkmale nach Conway (Kap. 9) an einem Ornamentmuster: die Tapete der App mit ihren Symmetrieelementen
 * (data-app wie bei einer Abbildung der App, mit tap=1 und mel=1), darüber die Merkmale wie bei Conway:
 * alle Markierungen in einer Farbe (accent2), weil die Motive schon blau sind.
 * data-variante: '4*2' (p4gm), '*x' (cm) oder 'o' (p1).
 * @param {HTMLElement} fig @param {SkriptFarben} f
 */
function conwaySkizze(fig, f) {
  const z = zustandVon(/** @type {string} */ (fig.dataset.app));
  const r = tafelB(z.gruppe, z, f, { k: 1, tapeteElemente: true });
  const A = r.ansicht;
  // eine Markierungsfarbe, deutlich verschieden vom Blau der Motive
  const farbe = f.accent2;
  /** @typedef {import('../lib/common/js/typen.js').Vec2} Vec2 */
  /** @param {Vec2} p */
  const bild = (p) => A.zuBild(p);
  /** Beschriftung mit Halo in Papierfarbe. @param {Vec2} b Bildpunkt @param {string} t */
  const schrift = (b, t) => `<text x="${f2(b[0])}" y="${f2(b[1])}" font-family="IBM Plex Sans, sans-serif" font-size="38" font-weight="700" fill="${farbe}" stroke="${f.paper}" stroke-width="7" paint-order="stroke" text-anchor="middle" dominant-baseline="middle">${t}</text>`;
  /** Ring um einen Punkt mit Beschriftung oben rechts. @param {Vec2} p @param {string} t */
  const ring = (p, t) => { const b = bild(p); return `<circle cx="${f2(b[0])}" cy="${f2(b[1])}" r="16" fill="none" stroke="${farbe}" stroke-width="3.5"/>${schrift([b[0] + 30, b[1] - 24], t)}`; };
  /** Punkt (Motiv als Anfang oder Ende eines Wegs). @param {Vec2} p */
  const punkt = (p) => { const b = bild(p); return `<circle cx="${f2(b[0])}" cy="${f2(b[1])}" r="7" fill="${farbe}" stroke="${f.paper}" stroke-width="2"/>`; };
  /** Weg von p nach q (gepunktet). @param {Vec2} p @param {Vec2} q */
  const weg = (p, q) => { const [a, b] = [bild(p), bild(q)]; return `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="${farbe}" stroke-width="4" stroke-dasharray="1 8" stroke-linecap="round"/>${punkt(p)}${punkt(q)}`; };
  /** Stück einer Spiegellinie hervorgehoben. @param {Vec2} p @param {Vec2} q */
  const spiegel = (p, q) => { const [a, b] = [bild(p), bild(q)]; return `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="${farbe}" stroke-width="7" stroke-opacity="0.75" stroke-linecap="round"/>`; };
  /** Beschriftung seitlich der Mitte von p–q, um d Pixel. @param {Vec2} p @param {Vec2} q @param {number} d @param {string} t */
  const seitlich = (p, q, d, t) => {
    const [a, b] = [bild(p), bild(q)]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return schrift([(a[0] + b[0]) / 2 - d * (b[1] - a[1]) / l, (a[1] + b[1]) / 2 + d * (b[0] - a[0]) / l], t);
  };
  const g = gruppe(z.gruppe);
  const teile = [r.svg];
  const v = fig.dataset.variante;
  if (v === '4*2') {
    // Kreisel: 4-zähliger Drehpunkt auf keiner Spiegellinie; Kaleidoskop: Ecke zweier Spiegellinien (2-zählig)
    const e = symmetrieElemente(g);
    /** Drehpunkt der Zähligkeit n nahe der Zellmitte. @param {number} n @returns {Vec2} */
    const nahe = (n) => /** @type {Vec2} */ (e.drehpunkte.filter((d) => d.n === n)
      .sort((a, b) => Math.hypot(a.punkt[0] - 0.5, a.punkt[1] - 0.5) - Math.hypot(b.punkt[0] - 0.5, b.punkt[1] - 0.5)
        || a.punkt[0] - b.punkt[0] || b.punkt[1] - a.punkt[1])[0].punkt);
    teile.push(ring(nahe(4), '4'), ring(nahe(2), '*2'));
  } else if (v === '*x') {
    // Kaleidoskop: eine Spiegellinie; Wunder: Weg vom Motiv zu seinem Spiegelbild, der keine Spiegellinie kreuzt
    // Spiegellinien x = n/2 (aus symmetrie.js); das Motiv in den Streifen 0 < x < ½ bringen (Translation,
    // nötigenfalls Spiegelung an x = ½), dann bleibt sein Bild unter der Gleitspiegelung x = ¼ im selben Streifen
    const gl = /** @type {import('./symmetrie.js').Op} */ (g.alle.find((o) => art(o).art === 'gleit'));
    const sp = symmetrieElemente(g).linien.filter((l) => l.art === 'spiegel' && Math.abs(l.richtung[0]) < 1e-9);
    const x0 = sp.map((l) => l.punkt[0]).filter((x) => x > 0.25).sort((a, b) => a - b)[0];
    const xr = z.punkt[0] - Math.floor(z.punkt[0]);
    /** @type {Vec2} */
    const p = [xr > 0.5 ? 1 - xr : xr, z.punkt[1]];
    const q = anwenden(gl, p);
    /** @type {[Vec2, Vec2]} */
    const s = [[x0, p[1] - 0.9], [x0, p[1] - 0.2]];
    teile.push(spiegel(...s), seitlich(...s, -26, '*'), weg(p, q), seitlich(p, q, 26, '×'));
  } else if (v === 'o') {
    // Wanderung: zwei Wege zu verschobenen Kopien, ohne Spiegelung und Drehung
    const p = z.punkt;
    teile.push(weg(p, [p[0] + 1, p[1]]), weg(p, [p[0], p[1] + 1]), schrift(bild([p[0] + 0.5, p[1] + 0.5]), 'o'));
  }
  return teile.join('');
}

/** @type {Record<string, (fig: HTMLElement, f: SkriptFarben) => string>} */
const SKIZZEN = { conway: conwaySkizze, kachel: (fig, f) => kachel(fig.dataset.variante || 'p1', f), dreieck3m: (fig, f) => dreieck3m(f), punktgruppe: (fig, f) => punktgruppe(/** @type {'2mm' | '4mm' | '6mm'} */ (fig.dataset.pg), f), gitter: gitterSkizze, zellen: zellenSkizze, koord: koordSkizze, fuenf: fuenfSkizze, motive: motiveSkizze, spuren: spurenSkizze,
  // Flussdiagramm (Kap. 8): Grösse aus der Zeichnung
  fluss: (fig, f) => { const r = flussdiagramm(FLUSSDIAGRAMM, LEITFRAGEN, f); fig.dataset.viewbox = `0 0 ${r.breite} ${r.hoehe}`; return r.svg; } };

function abbildungen() {
  const f = farben();
  for (const fig of elemente('figure[data-kind]')) {
    if (fig.dataset.app) appLink(fig, 'index.html');
    const art = /** @type {HTMLElement} */ (fig.querySelector('.fig-art'));
    const kind = /** @type {string} */ (fig.dataset.kind);
    const inhalt = kind === 'app' ? appTafel(fig, f) : SKIZZEN[kind](fig, f);
    art.innerHTML = `<svg viewBox="${fig.dataset.viewbox || '0 0 520 520'}" role="img" aria-label="${fig.dataset.alt || 'Abbildung'}">${inhalt}</svg>`;
    if (kind === 'app' && fig.dataset.tafel !== 'b' && !fig.dataset.viewbox) zuschneiden(/** @type {SVGSVGElement} */ (art.firstElementChild));
  }
}

/**
 * Tafel A ist ein Quadrat von 520 px; eine rechteckige oder schiefe Zelle lässt oben und unten
 * viel leeren Rand. Das Skript schneidet das Bild deshalb auf den Inhalt zu (ohne den
 * Hintergrund), mit etwas Rand; der Hintergrund wird mitgezogen.
 * @param {SVGSVGElement} svg
 */
function zuschneiden(svg) {
  const kinder = /** @type {SVGGraphicsElement[]} */ ([...svg.children].slice(1));
  if (!kinder.length || !svg.getBBox) return;
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
  for (const el of kinder) {
    /** @type {DOMRect} */
    let b;
    try { b = el.getBBox(); } catch { continue; }
    if (!b.width && !b.height) continue;
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  if (!Number.isFinite(x0)) return;
  const r = 14;
  x0 = Math.max(0, x0 - r); y0 = Math.max(0, y0 - r); x1 = Math.min(520, x1 + r); y1 = Math.min(520, y1 + r);
  svg.setAttribute('viewBox', `${f2(x0)} ${f2(y0)} ${f2(x1 - x0)} ${f2(y1 - y0)}`);
}

versionEintragen(VERSION);
abbildungen();
inhaltsverzeichnis();
document.fonts.ready.then(querstriche);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { abbildungen(); querstriche(); });
offline();
