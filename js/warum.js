// „Warum ist das da?“: Texte zur Herkunft eines Symmetrieelements (ohne DOM, Tests in Node).
// Begriffe und Regeln nach Borchardt-Ott & Sowa (2018), Abschn. 10.2, und Hoffmann (2016),
// Kap. 4: Drehung + Translation, Spiegelung + Translation (senkrecht bzw. schräg), zwei
// Spiegelungen im Winkel α = Drehung um 2α.

import { art, beschreibe, linieText, bruch } from './symmetrie.js';
import { elementVonOp, elementSchluessel } from './herkunft.js';
import { kart } from './zeichnung.js';
import { opHTML, koordHTML, bruchZeichen } from './text.js';

const nahe = (a, b, tol = 1e-7) => Math.abs(a - b) < tol;
const istRef = (t) => t === 'spiegel' || t === 'gleit';

/** Vektor in Bruchteilen als Ausdruck in a und b: [1,0] → a, [1/2,1/2] → (a + b)/2, [2,-1] → 2a − b. */
export function vektorText(v) {
  const [x, y] = v;
  if (nahe(Math.abs(x), Math.abs(y)) && !nahe(x, 0) && nahe(Math.abs(x), 0.5)) {
    return `${x < 0 ? '−' : ''}(<i>a</i> ${x * y > 0 ? '+' : '−'} <i>b</i>)/2`;
  }
  const teil = (c, s) => {
    if (nahe(c, 0)) return '';
    const b = bruch(Math.abs(c));
    return `${c < 0 ? '−' : '+'}${b === '1' ? '' : bruchZeichen(b)}<i>${s}</i>`;
  };
  let t = teil(x, 'a') + teil(y, 'b');
  t = t.replace(/^\+/, '').replace(/([^−])([+−])/g, '$1 $2 ');
  return t || '0';
}

/**
 * Name eines Elements: „4-zähliger Drehpunkt bei (½, ½)“, „Spiegellinie x, x“; mit
 * artikel: true „ein 4-zähliger Drehpunkt …“, „eine Spiegellinie …“.
 */
export function elementName(el, artikel = false) {
  if (el.typ === 'dreh') return `${artikel ? 'ein ' : ''}${el.n}-zähliger Drehpunkt bei (${el.punkt.map((v) => bruchZeichen(bruch(v))).join(', ')})`;
  const ort = koordHTML(linieText(el.punkt, el.richtung));
  return `${artikel ? 'eine ' : ''}${el.typ === 'spiegel' ? 'Spiegellinie' : 'Gleitspiegellinie'} ${ort}`;
}

/** Element mit bestimmtem Artikel: „der 4-zählige Drehpunkt bei (0, 0)“, „die Spiegellinie x, 0“. */
export function bestimmt(el) {
  if (el.typ === 'dreh') return `der ${el.n}-zählige Drehpunkt bei (${el.punkt.map((v) => bruchZeichen(bruch(v))).join(', ')})`;
  return `die ${elementName(el)}`;
}

/** Operation in Worten, mit der Schreibweise der ITA in Klammern. */
export function opName(op) {
  const a = art(op);
  const ita = `<span class="muted">(${opHTML(beschreibe(op))})</span>`;
  if (a.art === '1') return 'Identität';
  if (a.art === 't') return `Translation um ${vektorText(a.t)} ${ita}`;
  if (a.art === 'dreh') {
    const sinn = a.n === 2 ? '' : a.sinn === '+' ? ' gegen den Uhrzeigersinn' : ' im Uhrzeigersinn';
    return `Drehung um ${360 / a.n}°${sinn} um (${a.punkt.map((v) => bruchZeichen(bruch(v))).join(', ')}) ${ita}`;
  }
  const ort = koordHTML(linieText(a.punkt, a.richtung));
  if (a.art === 'spiegel') return `Spiegelung an der Linie ${ort} ${ita}`;
  return `Gleitspiegelung an der Linie ${ort} ${ita}`;
}

/** Winkel (Grad, 0 … 90) zwischen zwei Linien mit Richtungen in Bruchkoordinaten, in der Metrik M. */
function linienWinkel(M, d1, d2) {
  const u = kart(M, d1); const v = kart(M, d2);
  const c = Math.abs(u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v));
  return Math.round((Math.acos(Math.min(1, c)) * 180) / Math.PI);
}

/** Regel, nach der C = A ∘ B entsteht (Text), oder null. */
export function regel(A, B, C, M) {
  const a = art(A); const b = art(B); const c = art(C);
  if (a.art === 't' && b.art === 'dreh') {
    return b.n === 2
      ? 'Drehung um 180° + Translation = Drehung um 180° um einen anderen Punkt: Er liegt in der Mitte der Translation.'
      : 'Drehung + Translation = Drehung um denselben Winkel um einen verschobenen Punkt.';
  }
  if (a.art === 't' && istRef(b.art)) {
    // Anteile der Translation senkrecht und parallel zur Linie (kartesisch)
    const t = kart(M, a.t); const d = kart(M, b.richtung); const l = Math.hypot(...d);
    const par = (t[0] * d[0] + t[1] * d[1]) / l;
    const senk = Math.hypot(t[0] - (par * d[0]) / l, t[1] - (par * d[1]) / l);
    if (nahe(senk, 0)) return 'Translation parallel zur Linie: Die Linie bleibt, nur die Gleitkomponente ändert sich.';
    if (b.art === 'spiegel' && c.art === 'spiegel') return 'Spiegelung + Translation senkrecht zur Spiegellinie = Spiegelung an einer parallelen Linie im halben Abstand der Translation.';
    if (b.art === 'spiegel') return 'Spiegelung + Translation schräg zur Spiegellinie = Gleitspiegelung: Der Anteil der Translation senkrecht zur Linie verschiebt sie um die Hälfte, der Anteil parallel zur Linie wird zur Gleitkomponente.';
    return `Gleitspiegelung + Translation = ${c.art === 'spiegel' ? 'Spiegelung' : 'Gleitspiegelung'} an einer parallelen Linie: Der Anteil der Translation senkrecht zur Linie verschiebt sie um die Hälfte, der parallele Anteil verrechnet sich mit der Gleitkomponente.`;
  }
  if (istRef(a.art) && istRef(b.art) && c.art === 'dreh') {
    const w = linienWinkel(M, a.richtung, b.richtung);
    const beide = a.art === 'spiegel' && b.art === 'spiegel';
    return `Zwei ${beide ? 'Spiegelungen' : '(Gleit-)Spiegelungen'} an Linien, die sich unter ${w}° schneiden, ergeben eine Drehung um 2 · ${w}° = ${2 * w}°${beide ? ' um ihren Schnittpunkt' : ''}.`;
  }
  if ((a.art === 'dreh' && istRef(b.art)) || (istRef(a.art) && b.art === 'dreh')) {
    return 'Drehung und Spiegelung ergeben wieder eine Spiegelung oder Gleitspiegelung, an einer um den halben Drehwinkel gedrehten Linie.';
  }
  if (a.art === 'dreh' && b.art === 'dreh') return 'Zwei Drehungen ergeben eine Drehung; die Drehwinkel addieren sich.';
  return null;
}

/**
 * HTML der Erklärung (Kasten in den Kenndaten). d: Ergebnis von erklaerungsDaten(); g: Gruppe;
 * M: Metrik; phase: angezeigter Schritt (0 … 3). Knöpfe: data-phase, data-abspielen,
 * data-erkl-zu (schliessen), data-erkl (Element von B wählen).
 */
/** Wie eine Operation das Fähnchen bewegt, passend zu ihrem Weg in Tafel A (zeichnung.js, weg). */
export function wegText(op) {
  const a = art(op);
  if (a.art === 'gleit') return 'spiegelt es an der Gleitspiegellinie (blasses Zwischenbild) und verschiebt es dann um die Gleitkomponente entlang der Linie. Beide Teile gehören zu der einen Operation';
  if (a.art === 'spiegel') return 'spiegelt es an der Spiegellinie';
  if (a.art === 'dreh') return 'dreht es um den Drehpunkt';
  return 'verschiebt es';
}

/** Nummer der Operation unter den Erzeugenden der ITA („Generators selected“), sonst 0. */
function erzeugendeNummer(g, op) {
  const gleich = (o) => o.R.every((r, i) => r.every((v, j) => v === op.R[i][j])) && o.t.every((v, i) => nahe(v, op.t[i]));
  const i = g.ops.findIndex(gleich);
  return i >= 0 && g.daten.erzeugende.includes(i + 1) ? i + 1 : 0;
}

export function erklaerungHTML(g, d, M, phase) {
  const badge = (k) => `<span class="ab ${k.toLowerCase()}">${k}</span>`;
  const stelle = (i, klasse = `st${i}`) => `<span class="st ${klasse}" title="Stelle ${i}">${i}</span>`;
  const kopf = `<h3>Warum ist da ${elementName(d.element, true)}?</h3>`;
  const phasen = (namen) => `<div class="phasen">${namen.map(([p, t]) => `<button type="button" data-phase="${p}" aria-pressed="${phase === p}">${t}</button>`).join('')}<button type="button" data-abspielen>Abspielen</button><button class="linkbtn" type="button" data-erkl-zu>Schliessen</button></div>`;
  if (d.art === 'kopie') {
    const t = vektorText(d.t);
    return `${kopf}
    <p>Das Muster wiederholt sich bei jeder Gittertranslation, und mit ihm jedes Symmetrieelement. Darum ist ${d.element.typ === 'dreh' ? 'er' : 'sie'} nur ${bestimmt(d.vorbild.element)}, um ${t} verschoben${d.t.some((x) => Math.abs(x - Math.round(x)) > 1e-9) ? ' (die Zentrierung ist eine Gittertranslation)' : ''}.</p>
    <p>${badge('V')} ${opName(d.V)}<br>${badge('t')} Gittertranslation um ${t}<br>${badge('C')} ${opName(d.C)}</p>
    <ul class="wege">
      <li>${badge('V')} ${stelle(0)} → ${stelle(1)}: ${wegText(d.V)}.</li>
      <li>${badge('t')} ${stelle(0)} → ${stelle(2, 'st2')}, ${stelle(1)} → ${stelle(3, 'st2')}: verschiebt beide Fähnchen um ${t}.</li>
      <li>${badge('C')} ${stelle(2, 'st2')} → ${stelle(3, 'st2')}: ${wegText(d.C)}, genau wie ${badge('V')} von 0 nach 1, nur um ${t} verschoben.</li>
    </ul>
    ${phasen([[0, 'Ausgangsobjekt'], [1, 'Vorbild V'], [2, 'um t verschoben'], [3, 'C']])}
    <p><button class="linkbtn" type="button" data-erkl="${d.vorbild.schluessel}">Woher kommt ${badge('V')}?</button></p>`;
  }
  if (d.erzeugende) {
    const nr = erzeugendeNummer(g, d.C) - 1;
    return `${kopf}<p>Sie gehört zur ${opName(d.C)}. Diese Operation ist eine der Erzeugenden der Gruppe nach den International Tables${nr >= 0 ? ` („Generators selected“: (${nr + 1}))` : ''}. Aus den Erzeugenden und den Gittertranslationen folgen alle übrigen Symmetrieelemente.</p>
      <ul class="wege"><li>${badge('C')} ${stelle(0)} → ${stelle(1, 'stc')}: ${wegText(d.C)}.</li></ul>
      ${phasen([[0, 'Ausgangsobjekt'], [3, 'Bild unter C']])}`;
  }
  const r = regel(d.A, d.B, d.C, M);
  const kette = d.kette.length > 1
    ? `<details class="explain"><summary>Herleitung aus den Erzeugenden (${d.kette.length} Schritte)</summary><ol>${[...d.kette].reverse().map((s) => `<li>${opHTML(beschreibe(s.c))} = ${opHTML(beschreibe(s.a))} ∘ ${opHTML(beschreibe(s.b))}</li>`).join('')}</ol>
      <p class="note">Gelesen von rechts nach links: zuerst die rechte, dann die linke Operation. Die erste Zeile verknüpft Erzeugende nach den International Tables.</p></details>`
    : '';
  // A ist nach der Suche (herkunft.js) immer eine Erzeugende oder eine Gittertranslation; nur B
  // kann selbst hergeleitet sein. „Woher kommt …?“ nur, wo es etwas herzuleiten gibt.
  const herkunftText = (op) => {
    if (art(op).art === 't') return ' – Gittertranslation';
    const nr = erzeugendeNummer(g, op);
    return nr ? ` – Erzeugende (${nr}) nach ITA` : '';
  };
  const elB = elementVonOp(g, d.B);
  const woher = elB && !erzeugendeNummer(g, d.B) ? `<button class="linkbtn" type="button" data-erkl="${elementSchluessel(elB)}">Woher kommt ${badge('B')}?</button>` : '';
  return `${kopf}
    <p>Sie gehört zur Operation ${badge('C')} ${opName(d.C)}.</p>
    <p class="gleichung">${badge('C')} = ${badge('A')} ∘ ${badge('B')}: zuerst ${badge('B')}, dann ${badge('A')}.</p>
    <p>${badge('B')} ${opName(d.B)}${herkunftText(d.B)}<br>${badge('A')} ${opName(d.A)}${herkunftText(d.A)}</p>
    ${r ? `<p class="regel">${r}</p>` : ''}
    <ul class="wege">
      <li>${badge('B')} ${stelle(0)} → ${stelle(1)}: ${wegText(d.B)}.</li>
      <li>${badge('A')} ${stelle(1)} → ${stelle(2)}: ${wegText(d.A)}.</li>
      <li>${badge('C')} ${stelle(0)} → ${stelle(2)}: ${wegText(d.C)}. Das Fähnchen landet an derselben Stelle, mit derselben Orientierung.</li>
    </ul>
    ${phasen([[0, 'Ausgangsobjekt'], [1, 'zuerst B'], [2, 'dann A'], [3, 'zusammen: C']])}
    ${woher ? `<p>${woher}</p>` : ''}
    ${kette}`;
}
