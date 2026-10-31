// Modus „Gitter und Basis“ (Konzept §3.2): Tafeln und Kenndaten, ohne DOM.
// Struktur = Gitter (b/a, γ wie metrik()) und Basis aus Motiven (motive.js). Die Symmetrie wird
// mit bestimme() (bestimmung.js) bestimmt; Tafel A zeigt die Struktur mit konventioneller Zelle,
// Symmetrieelementen und asymmetrischer Einheit der gefundenen Gruppe, Tafel B einen grösseren
// Ausschnitt.

import { metrik, kart, bruchVon, ansicht, elementeImBereich, elementeSVG, f2, pt } from './zeichnung.js';
import { gruppe, lage, mod1 } from './symmetrie.js';
import { bestimme } from './bestimmung.js';
import { MOTIVE, motivKart, strukturPunkte } from './motive.js';
import { vektorText } from './warum.js';
import { zahlText, lageHTML, symbolHTML } from './text.js';

const SYSTEMNAMEN = { schiefwinklig: 'schiefwinklig', rechteckig: 'rechteckig', quadratisch: 'quadratisch', hexagonal: 'hexagonal' };
const BRAVAIS = { mp: 'schiefwinklig primitiv', op: 'rechteckig primitiv', oc: 'rechteckig zentriert', tp: 'quadratisch primitiv', hp: 'hexagonal primitiv' };

/** Farben der Atomsorten (Motivfarben). */
export const motivFarben = (f) => [f.upper, f.accent2, f.dir[1], f.dir[0]];

/** Symmetrie der Struktur st = { ba, gamma, basis }: Ergebnis von bestimme() oder null. */
export function strukturSymmetrie(st) {
  if (!st.basis.length) return null;
  const M = metrik(st);
  return bestimme({ a: M.a, b: M.b, punkte: strukturPunkte(st) });
}

/** Bruchkoordinaten (gegebene Zelle) eines Punktes x in der konventionellen Zelle des Ergebnisses. */
export const ausKonventionell = (r, x) => [r.ursprung[0] + r.zelle[0][0] * x[0] + r.zelle[0][1] * x[1], r.ursprung[1] + r.zelle[1][0] * x[0] + r.zelle[1][1] * x[1]];
/** Umgekehrt: Lage p (gegebene Zelle) in der konventionellen Zelle, in [0, 1). */
export function inKonventionell(r, p) {
  const Z = r.zelle; const d = Z[0][0] * Z[1][1] - Z[0][1] * Z[1][0];
  const v = [p[0] - r.ursprung[0], p[1] - r.ursprung[1]];
  return [(Z[1][1] * v[0] - Z[0][1] * v[1]) / d, (-Z[1][0] * v[0] + Z[0][0] * v[1]) / d].map(mod1);
}

/** Ein Motiv als SVG, an der Lage p (Bruchkoordinaten der gegebenen Zelle). */
export function motivSVG(e, p, A, M, farbe, papier, { auswahl = false } = {}) {
  const d = MOTIVE[e.motiv];
  const bild = (c) => { const f = bruchVon(M, c); return A.zuBild([p[0] + f[0], p[1] + f[1]]); };
  const q = motivKart(e).map((x) => bild(x.c));
  const mitte = A.zuBild(p);
  const s = (e.groesse ?? d.groesse) * A.s;
  let svg;
  if (d.form === 'kreis') svg = `<circle cx="${f2(mitte[0])}" cy="${f2(mitte[1])}" r="${f2(s)}" fill="${farbe}" stroke="${papier}" stroke-width="1"/>`;
  else if (d.form === 'fahne') {
    svg = `<line x1="${f2(q[0][0])}" y1="${f2(q[0][1])}" x2="${f2(q[1][0])}" y2="${f2(q[1][1])}" stroke="${farbe}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<polygon points="${[q[1], q[2], q[3]].map(pt).join(' ')}" fill="${farbe}"/>`;
  } else if (d.form === 'ellipse') {
    // Ellipse durch die Endpunkte (lokal ±1, 0) und die Seiten (0, ±0,32)
    const rad = ((e.winkel ?? 0) * Math.PI) / 180; const g = e.groesse ?? d.groesse;
    const umriss = Array.from({ length: 28 }, (_, k) => {
      const w = (2 * Math.PI * k) / 28; const u = Math.cos(w); const v = 0.32 * Math.sin(w);
      return bild([g * (Math.cos(rad) * u - Math.sin(rad) * v), g * (Math.sin(rad) * u + Math.cos(rad) * v)]);
    });
    svg = `<polygon points="${umriss.map(pt).join(' ')}" fill="${farbe}" fill-opacity="0.9" stroke="${papier}" stroke-width="0.8"/>`;
  } else svg = `<polygon points="${q.map(pt).join(' ')}" fill="${farbe}" fill-opacity="0.9" stroke="${papier}" stroke-width="0.8" stroke-linejoin="round"/>`;
  if (auswahl) svg += `<circle cx="${f2(mitte[0])}" cy="${f2(mitte[1])}" r="${f2(Math.max(14, s * 1.35))}" fill="none" stroke="${farbe}" stroke-width="1.8" stroke-dasharray="3 2.5"/>`;
  return svg;
}

/** Bereich der Bruchkoordinaten (gegebene Zelle), den das Bild der Ansicht A zeigt, mit Rand. */
function bildBereich(A, rand = 0.3) {
  const ecken = [[0, 0], [A.groesse, 0], [0, A.groesse], [A.groesse, A.groesse]].map((q) => A.vonBild(q));
  return [0, 1].map((i) => [Math.min(...ecken.map((e) => e[i])) - rand, Math.max(...ecken.map((e) => e[i])) + rand]);
}

/** Alle Gitterbilder der Basis im Bereich [[lo, hi], [lo, hi]] (Bruchkoordinaten der gegebenen Zelle). */
function basisSVG(st, A, M, bereich, farben, auswahl = null) {
  const f = motivFarben(farben);
  const [[lo0, hi0], [lo1, hi1]] = bereich;
  const out = [];
  st.basis.forEach((e, k) => {
    const p0 = e.p.map(mod1);
    for (let i = Math.floor(lo0) - 1; i <= Math.ceil(hi0); i++) for (let j = Math.floor(lo1) - 1; j <= Math.ceil(hi1); j++) {
      const p = [p0[0] + i, p0[1] + j];
      if (p[0] < lo0 || p[0] > hi0 || p[1] < lo1 || p[1] > hi1) continue;
      out.push(motivSVG(e, p, A, M, f[(e.farbe ?? 0) % f.length], farben.paper, { auswahl: auswahl === k && !i && !j }));
    }
  });
  return out.join('');
}

/**
 * Bindungen zwischen nächsten Nachbarn: Linien zwischen den Mitten der Atome (Motiv „Atom“),
 * deren Abstand höchstens 5 % über dem kleinsten Abstand zweier Atome liegt.
 */
function bindungenSVG(st, A, M, bereich, farbe) {
  const [[lo0, hi0], [lo1, hi1]] = bereich;
  const pos = [];
  for (const e of st.basis) {
    if (e.motiv !== 'atom') continue;
    const p0 = e.p.map(mod1);
    for (let i = Math.floor(lo0) - 1; i <= Math.ceil(hi0); i++) for (let j = Math.floor(lo1) - 1; j <= Math.ceil(hi1); j++) {
      const p = [p0[0] + i, p0[1] + j];
      if (p[0] >= lo0 && p[0] <= hi0 && p[1] >= lo1 && p[1] <= hi1) pos.push({ p, c: kart(M, p) });
    }
  }
  let dmin = Infinity;
  for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
    const d = Math.hypot(pos[i].c[0] - pos[j].c[0], pos[i].c[1] - pos[j].c[1]);
    if (d > 1e-6 && d < dmin) dmin = d;
  }
  if (!Number.isFinite(dmin)) return '';
  const out = [];
  for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
    const d = Math.hypot(pos[i].c[0] - pos[j].c[0], pos[i].c[1] - pos[j].c[1]);
    if (d > 1e-6 && d <= dmin * 1.05) {
      const a = A.zuBild(pos[i].p); const b = A.zuBild(pos[j].p);
      out.push(`M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}`);
    }
  }
  return `<path d="${out.join('')}" stroke="${farbe}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
}

/** Ansicht der konventionellen Zelle: Bruchkoordinaten der konventionellen Zelle → Bild. */
const konvAnsicht = (A, r) => ({ ...A, zuBild: (x) => A.zuBild(ausKonventionell(r, x)) });

/** Ist die konventionelle Zelle die gegebene (gleiche Achsen, Ursprung bei 0, 0)? */
export const istGegeben = (r) => r.zelle[0][0] === 1 && r.zelle[1][1] === 1 && r.zelle[0][1] === 0 && r.zelle[1][0] === 0
  && Math.abs(r.ursprung[0]) < 1e-9 && Math.abs(r.ursprung[1]) < 1e-9;

/** Beschriftung der Achsen einer Zelle (Ansicht Az der Zelle): ausserhalb, an den Kantenmitten. */
function achsenSVG(Az, namen, farbe, groesse) {
  const m = Az.zuBild([0.5, 0.5]);
  const marke = (p, text) => {
    const q = Az.zuBild(p); const v = [q[0] - m[0], q[1] - m[1]]; const l = Math.hypot(...v) || 1;
    return `<text x="${f2(q[0] + (14 * v[0]) / l)}" y="${f2(q[1] + (14 * v[1]) / l)}">${text}</text>`;
  };
  const o = Az.zuBild([0, 0]);
  return `<g font-family="Source Serif 4, serif" font-style="italic" font-size="${groesse}" fill="${farbe}" text-anchor="middle" dominant-baseline="middle">${marke([0.36, 0], namen[0])}${marke([0, 0.36], namen[1])}</g>`
    + `<circle cx="${f2(o[0])}" cy="${f2(o[1])}" r="2.6" fill="${farbe}"/>`;
}

/**
 * Tafel A: die gegebene und die konventionelle Zelle mit der Struktur ringsum, darüber
 * Symmetrieelemente und asymmetrische Einheit der gefundenen Gruppe (in der konventionellen
 * Zelle, wie in ITA). fest: Ansicht, die beim Ziehen gleich bleibt. Rückgabe { svg, ansicht, ergebnis }.
 */
export function strukturTafelA(st, anzeige, farben, auswahl = null, fest = null) {
  const M = metrik(st);
  const r = strukturSymmetrie(st);
  let A = fest;
  if (!A) {
    const ecken = [[0, 0], [1, 0], [0, 1], [1, 1]];
    if (r) for (const c of [[0, 0], [1, 0], [0, 1], [1, 1]]) ecken.push(ausKonventionell(r, c));
    const cs = ecken.map((p) => kart(M, p));
    const rand = 0.3;
    A = ansicht(M, [Math.min(...cs.map((c) => c[0])) - rand, Math.min(...cs.map((c) => c[1])) - rand, Math.max(...cs.map((c) => c[0])) + rand, Math.max(...cs.map((c) => c[1])) + rand], 520, 20);
  }
  const gegeben = r && istGegeben(r);
  const teile = [`<rect width="520" height="520" fill="${farben.paper}"/>`];
  // Gitter der gegebenen Zellen (dünn) im ganzen Bild
  const [[lo0, hi0], [lo1, hi1]] = bildBereich(A, 1);
  const linie = (p, q) => { const [a, b] = [A.zuBild(p), A.zuBild(q)]; return `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="${farben.line}" stroke-width="1"/>`; };
  for (let i = Math.floor(lo0); i <= Math.ceil(hi0); i++) teile.push(linie([i, lo1], [i, hi1]));
  for (let j = Math.floor(lo1); j <= Math.ceil(hi1); j++) teile.push(linie([lo0, j], [hi0, j]));
  if (!gegeben) {
    const poly = [[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => pt(A.zuBild(p))).join(' ');
    teile.push(`<polygon points="${poly}" fill="none" stroke="${farben.muted}" stroke-width="1.4" stroke-dasharray="4 3"/>`);
  }
  if (r) {
    const Ak = konvAnsicht(A, r);
    const zelle = [[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => pt(Ak.zuBild(p))).join(' ');
    if (anzeige.ae) {
      const ae = r.gruppe.ae.ecken.map((p) => pt(Ak.zuBild(p))).join(' ');
      teile.push(`<polygon points="${ae}" fill="${farben.crystal}" fill-opacity="0.6" stroke="${farben.accent}" stroke-width="1.4" stroke-dasharray="5 3"/>`);
    }
    if (anzeige.zelle) teile.push(`<polygon class="konv-zelle" points="${zelle}" fill="none" stroke="${farben.accent}" stroke-width="2.2"/>`);
  }
  if (anzeige.bindungen) teile.push(bindungenSVG(st, A, M, bildBereich(A), farben.muted));
  teile.push(basisSVG(st, A, M, bildBereich(A), farben, auswahl));
  // Symmetrieelemente über den Motiven, damit Drehpunkte auf Atomen sichtbar bleiben
  if (r && anzeige.elemente) teile.push(elementeSVG(gruppe(r.symbol), elementeImBereich(gruppe(r.symbol), 1), konvAnsicht(A, r), farben, anzeige.farben));
  // Achsen: gegebene Zelle a, b; konventionelle a′, b′ (nur wenn verschieden)
  teile.push(achsenSVG(A, ['a', 'b'], gegeben ? farben.accent : farben.muted, 18));
  if (r && !gegeben && anzeige.zelle) teile.push(achsenSVG(konvAnsicht(A, r), ['a′', 'b′'], farben.accent, 18));
  return { svg: teile.join(''), ansicht: A, ergebnis: r };
}

/** Tafel B: grösserer Ausschnitt der Struktur, konventionelle Zelle hervorgehoben. */
export function strukturTafelB(st, farben, r) {
  const M = metrik(st);
  const mitte = kart(M, [0.5, 0.5]);
  const w = 4.4 * Math.max(1, st.ba);
  const box = [mitte[0] - w / 2, mitte[1] - w / 2, mitte[0] + w / 2, mitte[1] + w / 2];
  const A = ansicht(M, box, 520, 10);
  const ecken = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]].map((c) => bruchVon(M, c));
  const lo = Math.floor(Math.min(...ecken.flat())) - 1; const hi = Math.ceil(Math.max(...ecken.flat())) + 1;
  const teile = [`<defs><clipPath id="ausschnitt-s"><rect x="10" y="10" width="500" height="500" rx="6"/></clipPath></defs>`,
    `<rect width="520" height="520" fill="${farben.paper}"/>`, '<g clip-path="url(#ausschnitt-s)">'];
  if (r) {
    const Ak = konvAnsicht(A, r);
    const zelle = [[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => pt(Ak.zuBild(p))).join(' ');
    teile.push(`<polygon points="${zelle}" fill="${farben.crystal}" fill-opacity="0.35" stroke="${farben.accent}" stroke-width="2"/>`);
  }
  if (st.bindungen !== false) teile.push(bindungenSVG(st, A, M, [[lo, hi], [lo, hi]], farben.muted));
  teile.push(basisSVG(st, A, M, [[lo, hi], [lo, hi]], farben));
  teile.push('</g>');
  teile.push(`<rect x="10" y="10" width="500" height="500" rx="6" fill="none" stroke="${farben.line}" stroke-width="1"/>`);
  return { svg: teile.join(''), ansicht: A };
}

/** Lage jedes Basiseintrags in der gefundenen Gruppe (Wyckoff-Lage der Motivmitte). */
export function basisLagen(st, r) {
  if (!r) return [];
  const g = gruppe(r.symbol);
  return st.basis.map((e) => {
    const x = inKonventionell(r, e.p.map(mod1));
    const l = lage(g, x, 1e-4);
    return { x, zaehligkeit: l.zaehligkeit, buchstabe: l.buchstabe, symbol: l.symbol };
  });
}

/** Konventionelle Zelle in a, b; null, wenn sie (bis auf Vorzeichen) die gegebene ist. */
function zellText(z) {
  const a = [z[0][0], z[1][0]]; const b = [z[0][1], z[1][1]];
  const gleich = (u, v) => Math.abs(Math.abs(u[0]) - v[0]) < 1e-9 && Math.abs(Math.abs(u[1]) - v[1]) < 1e-9;
  if (gleich(a, [1, 0]) && gleich(b, [0, 1])) return null;
  return `<i>a</i>′ = ${vektorText(a)}, <i>b</i>′ = ${vektorText(b)}`;
}

/**
 * Kenndaten (HTML). st: Struktur; r: Ergebnis; vorher: Symbol vor der letzten Änderung (oder
 * null); farben: Motivfarben. Knopf data-zu-eg öffnet die Gruppe im Modus „Ebenengruppen“.
 */
export function strukturHTML(st, r, vorher, farben) {
  if (!r) return '<p>Die Basis ist leer: Mit „Hinzufügen“ ein Motiv in die Struktur setzen.</p>';
  const d = r.gruppe;
  const f = motivFarben(farben);
  const lagen = basisLagen(st, r);
  const zelle = zellText(r.zelle);
  const aenderung = vorher && vorher !== r.symbol
    ? `<div class="warumbox"><strong>Geändert: ${symbolHTML(vorher)} → ${symbolHTML(r.symbol)}</strong> (Operationen je Zelle ${gruppe(vorher).ordnung} → ${r.ordnung})</div>` : '';
  const zeilen = st.basis.map((e, k) => {
    const l = lagen[k];
    return `<tr><td><i class="sw" style="background:${f[(e.farbe ?? 0) % f.length]}"></i> ${MOTIVE[e.motiv].name}</td><td>${lageHTML(MOTIVE[e.motiv].symmetrie)}</td>
      <td>(${e.p.map((v) => zahlText(mod1(v))).join(', ')})</td><td>(${l.x.map((v) => zahlText(v)).join(', ')})</td>
      <td class="num">${l.zaehligkeit} <span class="wy">${l.buchstabe}</span></td><td>${lageHTML(l.symbol)}</td></tr>`;
  }).join('');
  return `
    <div class="info-head">
      <div class="hm-big">${symbolHTML(r.symbol)}</div>
      <div class="hm-meta"><span>Ebenengruppe Nr. ${d.nr} · ${SYSTEMNAMEN[d.system]}</span><span>bestimmt aus Gitter und Basis · <button class="linkbtn" type="button" data-zu-eg="${r.symbol}">im Modus „Ebenengruppen“ ansehen</button></span></div>
    </div>
    ${aenderung}
    <dl class="facts">
      <div><dt>Bravais-Gitter</dt><dd>${BRAVAIS[d.bravais]} (${d.bravais})</dd></div>
      <div><dt>Punktgruppe</dt><dd>${symbolHTML(d.punktgruppe)}</dd></div>
      <div><dt>Operationen je Zelle</dt><dd class="num">${r.ordnung}</dd></div>
      <div class="wide"><dt>Konventionelle Zelle nach ITA</dt><dd>${zelle ?? 'die gegebene Zelle (<i>a</i>, <i>b</i>)'}${r.primitiv > 1 ? `; die gegebene Zelle enthält ${r.primitiv} Gitterpunkte, die kleinste Zelle ist ${r.primitiv}-mal kleiner` : ''}</dd></div>
      <div class="wide"><dt>Ursprung nach ITA</dt><dd>bei (${r.ursprung.map((v) => zahlText(v)).join(', ')}) der gegebenen Zelle</dd></div>
    </dl>
    <h3>Basis</h3>
    <div class="tabwrap"><table class="itatab"><thead><tr><th>Motiv</th><th>Eigene Symmetrie</th><th>Lage (<i>a</i>, <i>b</i>)</th><th>Lage (<i>a</i>′, <i>b</i>′)</th><th>Wyckoff-Lage</th><th>Lagesymmetrie</th></tr></thead><tbody>${zeilen}</tbody></table></div>
    <p class="note">Die Lagesymmetrie einer Motivmitte ist höchstens so hoch wie die eigene Symmetrie des Motivs. Ist sie kleiner, nutzt die Struktur nicht die ganze Symmetrie des Motivs.</p>`;
}
