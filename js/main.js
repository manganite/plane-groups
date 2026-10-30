// Steuerung der App: Zustand, Bedienelemente, Zeichnen der Tafeln, Kenndaten.

import { initHelp } from '../lib/common/js/help.js';
import { offline } from '../lib/common/js/seite.js';
import { TIPS, SECTIONS, LABELS } from './hilfetexte.js';
import { VERSION } from './version.js';
import { EBENENGRUPPEN, ebenengruppe } from './ebenengruppen.js';
import { gruppe as gruppeVon, lage, mod1, punktgruppe, punktAufLage } from './symmetrie.js';
import { tafelA, tafelB, drehSymbol, blickrichtung, elementeImBereich, metrik, ausgangsstelle } from './zeichnung.js';
import { startzustand, hashVon, hashAnwenden, FREI, GITTER_START } from './zustand.js';
import { koordHTML, opHTML, lageHTML, symbolHTML, bedingungHTML, zahlText } from './text.js';

const $ = (id) => document.getElementById(id);
const REPO = 'https://github.com/manganite/plane-groups';
const STEREO = 'https://manganite.github.io/stereography/';
const coarse = window.matchMedia('(pointer: coarse)');

// ------------------------------------------------------------------ Zustand
const SPEICHER = 'ebenen-zustand';
const z = startzustand();
try {
  const s = JSON.parse(localStorage.getItem(SPEICHER) || 'null');
  if (s && s.v === 1 && s.z) {
    const g = s.z.gitter;
    Object.assign(z, s.z, { gitter: { ...z.gitter, ...(g && typeof g === 'object' ? g : {}) } });
    if (!EBENENGRUPPEN.some((e) => e.symbol === z.gruppe)) z.gruppe = startzustand().gruppe;
    if (!Array.isArray(z.punkt) || z.punkt.length !== 2 || !z.punkt.every(Number.isFinite)) z.punkt = startzustand().punkt;
  }
} catch { /* ohne Speicher weiter */ }
if (location.hash.length > 1) hashAnwenden(z, location.hash); // Link hat Vorrang

let letzterHash = '';
let hashAktiv = location.hash.length > 1;
let basisHash = null;
function speichern() {
  try { localStorage.setItem(SPEICHER, JSON.stringify({ v: 1, z })); } catch { /* ignorieren */ }
  try {
    const h = hashVon(z);
    if (basisHash === null) basisHash = h;
    if (!hashAktiv && h === basisHash) return; // ohne Hash geöffnet: erst eine Änderung schreibt ihn
    hashAktiv = true;
    if (h !== letzterHash) { letzterHash = h; history.replaceState(null, '', location.pathname + location.search + h); }
  } catch { /* z. B. in eingebetteten Vorschauen */ }
}
window.addEventListener('hashchange', () => { if (location.hash !== letzterHash) location.reload(); });

// ------------------------------------------------------------------ Farben
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
const farben = () => ({
  paper: css('paper'), ink: css('ink'), muted: css('muted'), line: css('line'), accent: css('accent'), accent2: css('accent2'),
  upper: css('upper'), crystal: css('crystal'), dir: [css('dir1'), css('dir2'), css('dir3')],
});

// ------------------------------------------------------------------ Gruppenwahl
const SYSTEMNAMEN = { schiefwinklig: 'schiefwinklig', rechteckig: 'rechteckig', quadratisch: 'quadratisch', hexagonal: 'hexagonal' };
function baueAuswahl() {
  const systeme = [...new Set(EBENENGRUPPEN.map((g) => g.system))];
  $('picker').innerHTML = systeme.map((sys) => `<div class="sysrow"><span class="sys">${SYSTEMNAMEN[sys]}</span><div class="btns">${
    EBENENGRUPPEN.filter((g) => g.system === sys).map((g) => `<button class="pgb" type="button" data-g="${g.symbol}" aria-pressed="false" title="Nr. ${g.nr}, Punktgruppe ${g.punktgruppe}">${symbolHTML(g.symbol)}</button>`).join('')
  }</div></div>`).join('');
}
function auswahlAbgleichen() {
  document.querySelectorAll('#picker .pgb').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === z.gruppe)));
}

// ------------------------------------------------------------------ Bedienelemente abgleichen
const systemJetzt = () => ebenengruppe(z.gruppe).system;
function bedienungAbgleichen() {
  $('opt-elemente').checked = z.elemente;
  $('opt-objekt').checked = z.objekt;
  $('opt-ae').checked = z.ae;
  $('opt-zellen').checked = z.zellen === 2;
  $('opt-einrasten').checked = z.einrasten;
  $('opt-einrasten').disabled = !z.objekt;
  document.querySelector('#row-einrasten .why').textContent = z.objekt ? '' : 'nur mit „Objekt in allgemeiner Lage“';
  document.querySelectorAll('#seg-form button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.form === z.form)));
  $('v-farben').checked = z.farben;
  $('v-muster-el').checked = z.musterElemente;
  // Objekt
  const p = z.punkt.map(mod1);
  for (const [k, i] of [['x', 0], ['y', 1]]) {
    $(`obj-${k}`).value = String(p[i]);
    $(`obj-${k}`).disabled = !z.objekt;
    $(`obj-${k}-out`).textContent = zahlText(p[i]);
  }
  $('obj-why').textContent = z.objekt ? '' : 'Nur mit „Objekt in allgemeiner Lage“.';
  $('reset-objekt').disabled = !z.objekt;
  // Gitter
  const sys = systemJetzt();
  const gi = z.gitter[sys];
  for (const k of ['ba', 'gamma']) {
    const frei = FREI[sys].includes(k);
    $(`lat-${k}`).value = String(gi[k]);
    $(`lat-${k}`).disabled = !frei;
    $(`lat-${k}-out`).textContent = k === 'ba' ? gi.ba.toFixed(2) : `${gi.gamma.toFixed(1)}°`;
  }
  const fest = { quadratisch: 'Im quadratischen System festgelegt: a = b, γ = 90°.', hexagonal: 'Im hexagonalen System festgelegt: a = b, γ = 120°.', rechteckig: 'Im rechteckigen System ist γ = 90° festgelegt.', schiefwinklig: '' };
  $('lat-why').textContent = fest[sys];
  $('reset-gitter').disabled = FREI[sys].length === 0;
}

// ------------------------------------------------------------------ Zeichnen
let ansichtA = null;
function zeichnen() {
  const f = farben();
  const a = tafelA(z.gruppe, z, f);
  ansichtA = a.ansicht;
  $('bild-a').innerHTML = a.svg;
  $('bild-b').innerHTML = tafelB(z.gruppe, z, f).svg;
  $('sub-a').textContent = z.zellen === 2 ? '2 × 2 Elementarzellen' : 'Elementarzelle';
  legende(f);
  kenndaten(f);
}

const RICHTUNG = {
  rechteckig: ['[10]', '[01]'],
  quadratisch: ['[10], [01]', '[11], [1̄1]'],
  hexagonal: ['[10], [01], [11]', '[1̄1], [12], [21]'],
};
function legende(f) {
  const g = gruppeVon(z.gruppe);
  const sys = g.daten.system;
  const items = [];
  const el = elementeImBereich(g, 1);
  const farbe = (pos) => (z.farben ? f.dir[pos - 1] : f.ink);
  if (z.elemente) {
    const ordnungen = [...new Set(el.drehpunkte.map((d) => d.n))].sort();
    for (const n of ordnungen) items.push(`<span class="lg"><svg class="sym-icon" width="22" height="22" viewBox="0 0 22 22">${drehSymbol(n, [11, 11], farbe(1), f.paper)}</svg>${n}-zähliger Drehpunkt</span>`);
    const arten = new Set(el.linien.map((l) => l.art));
    const linie = (dash) => `<svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.ink}" stroke-width="${dash ? 2 : 2.8}" ${dash ? 'stroke-dasharray="6 4"' : 'stroke-linecap="round"'}/></svg>`;
    if (arten.has('spiegel')) items.push(`<span class="lg">${linie(false)}Spiegellinie</span>`);
    if (arten.has('gleit')) items.push(`<span class="lg">${linie(true)}Gleitspiegellinie</span>`);
    if (z.farben && sys !== 'schiefwinklig') {
      const positionen = new Set(el.linien.map((l) => blickrichtung(sys, l.normale)));
      for (const pos of [2, 3]) {
        if (positionen.has(pos)) items.push(`<span class="lg"><i class="sw" style="background:${f.dir[pos - 1]}"></i>Normale ∥ ${RICHTUNG[sys][pos - 2]}</span>`);
      }
    }
  }
  if (z.objekt) {
    items.push(`<span class="lg"><i class="sw" style="background:${f.upper}"></i>gleiche Händigkeit</span>`);
    if (g.alle.some((o) => o.R[0][0] * o.R[1][1] - o.R[0][1] * o.R[1][0] < 0)) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2}"></i>Spiegelbild</span>`);
    items.push(`<span class="lg"><svg width="20" height="20" viewBox="-10 -10 20 20"><circle r="8" fill="none" stroke="${f.accent}" stroke-width="1.6" stroke-dasharray="2.6 2.2"/></svg>Ausgangsobjekt</span>`);
  }
  if (z.ae) items.push(`<span class="lg"><i class="sw" style="background:${f.crystal}"></i>asymmetrische Einheit</span>`);
  if (z.objekt) items.push(`<span class="lg hint"><span class="only-fine">Objekt ziehen oder Stelle anklicken</span><span class="only-coarse">Objekt ziehen oder Stelle antippen</span></span>`);
  $('legend').innerHTML = items.join('');
}

// ------------------------------------------------------------------ Kenndaten
/** Punktgruppe in der App „Stereographische Projektion“ (Achse c senkrecht zur Ebene). */
const STEREO_ID = { 1: '1', 2: '2c', m: 'mb', '2mm': 'mm2', 4: '4', '4mm': '4mm', 3: '3', 6: '6', '6mm': '6mm' };
function stereoId(daten) {
  if (daten.punktgruppe === '3m') return daten.symbol === 'p31m' ? '31m' : '3m1';
  return STEREO_ID[daten.punktgruppe];
}
const BRAVAIS = { mp: 'schiefwinklig primitiv', op: 'rechteckig primitiv', oc: 'rechteckig zentriert', tp: 'quadratisch primitiv', hp: 'hexagonal primitiv' };
const URSPRUNG = { beliebig: 'beliebig', '21g': 'auf 2 1 g', '41g': 'auf 4 1 g' };
const ursprungHTML = (u) => (URSPRUNG[u] ? URSPRUNG[u].replace(/([mg])/g, '<i>$1</i>') : `auf ${lageHTML(u)}`);
const aeHTML = (t) => t.replace(/([xy])/g, '<i>$1</i>').replace(/(\d+)\/(\d+)/g, (m) => ({ '1/2': '½', '1/4': '¼', '1/3': '⅓', '2/3': '⅔' }[m] ?? m));

function kenndaten() {
  const g = gruppeVon(z.gruppe);
  const d = g.daten;
  const pg = punktgruppe(g);
  const l = lage(g, z.punkt);
  const zentriert = g.zentr.length > 1;
  // Lage des Objekts
  const p = l.punkt;
  const koord = `(${zahlText(p[0])}, ${zahlText(p[1])})`;
  const fg = ['keiner', 'einer', 'zwei'][l.freiheitsgrade];
  const lagebox = !z.objekt ? '' : l.allgemein
    ? `<div class="lagebox"><strong>Allgemeine Lage ${d.wyckoff[0].n}<span class="wy">${l.buchstabe}</span></strong>, Objekt bei ${koord}
      <p>Keine Operation ausser der Identität hält das Objekt fest (Lagesymmetrie 1). Deshalb erscheint es ${l.zaehligkeit}-mal je Elementarzelle, so oft wie die Gruppe Operationen je Zelle hat.</p></div>`
    : `<div class="lagebox"><strong>Spezielle Lage ${l.zaehligkeit}<span class="wy">${l.buchstabe}</span>, Lagesymmetrie ${lageHTML(l.symbol)}</strong>, Objekt bei ${koord}
      <p>Das Objekt liegt auf einem Symmetrieelement. ${g.ordnung / l.zaehligkeit} der ${g.ordnung} Operationen je Zelle halten es fest; deshalb fallen je ${g.ordnung / l.zaehligkeit} Bilder zusammen, und es bleiben ${g.ordnung}/${g.ordnung / l.zaehligkeit} = ${l.zaehligkeit} Stellen je Zelle. Freie Parameter: ${fg}. Ein Objekt, das hier sitzen soll, muss selbst mindestens die Symmetrie ${lageHTML(l.symbol)} haben; das Fähnchen hat keine, darum überlagert es sich mit seinen Bildern.</p></div>`;
  // Operationen
  const opsZeilen = (texte, ops, z0) => ops.map((op, i) => `<tr><td class="num">(${i + 1})</td><td>${koordHTML(d.ops[i])}${z0 ? ` + (${z0})` : ''}</td><td>${opHTML(texte[i])}</td></tr>`).join('');
  const opsTab = `<div class="tabwrap"><table class="itatab"><thead><tr><th>Nr.</th><th>Koordinaten</th><th>Symmetrieoperation</th></tr></thead><tbody>
    ${zentriert ? '<tr class="zent"><td colspan="3">für (0, 0)+</td></tr>' : ''}${opsZeilen(d.opsText, d.ops)}
    ${zentriert ? `<tr class="zent"><td colspan="3">für (½, ½)+</td></tr>${opsZeilen(d.zentrText, d.ops, '½, ½')}` : ''}</tbody></table></div>`;
  // Wyckoff-Lagen
  const wyZeilen = d.wyckoff.map((w) => {
    const extra = d.bedingungen[w.b];
    const bed = w === d.wyckoff[0]
      ? (d.bedingungen.allgemein.length ? d.bedingungen.allgemein.map(bedingungHTML).join('<br>') : 'keine')
      : (extra ? extra.map(bedingungHTML).join('<br>') : '<span class="muted">keine weiteren</span>');
    return `<tr${w.b === l.buchstabe && z.objekt ? ' class="aktiv"' : ''}><td class="num">${w.n} <span class="wy">${w.b}</span></td><td>${lageHTML(w.sym)}</td>
      <td><div class="koords">${w.koord.map(koordHTML).join('')}</div></td><td>${bed}</td>
      <td><button class="setzen" type="button" data-wy="${w.b}" ${z.objekt ? '' : 'disabled'} title="Objekt auf diese Lage setzen">setzen</button></td></tr>`;
  }).join('');
  const wyTab = `<div class="tabwrap"><table class="itatab"><thead><tr><th>Zähligkeit, Wyckoff-Buchstabe</th><th>Lagesymmetrie</th><th>Koordinaten${zentriert ? ' (0, 0)+ (½, ½)+' : ''}</th><th>Auslöschungen</th><th></th></tr></thead><tbody>${wyZeilen}</tbody></table></div>`;
  const sid = stereoId(d);
  const pgLink = `<a href="${STEREO}#m=pg&amp;g=${encodeURIComponent(sid)}" target="_blank" rel="noopener" title="Punktgruppe in der App „Stereographische Projektion“ öffnen${d.punktgruppe === 'm' ? ' (dort mit Spiegelebene ⊥ b)' : ''}">${symbolHTML(d.punktgruppe)}</a>`;
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big">${symbolHTML(d.symbol)}</div>
      <div class="hm-meta"><span>Ebenengruppe Nr. ${d.nr} · ${SYSTEMNAMEN[d.system]}</span><span>International Tables, Vol. A, S. ${d.seite}${d.nr === 17 ? '–109' : ''}</span></div>
    </div>
    ${lagebox}
    <dl class="facts">
      <div><dt>Vollständiges Symbol</dt><dd>${symbolHTML(d.lang)}</dd></div>
      <div><dt>Kristallsystem</dt><dd>${SYSTEMNAMEN[d.system]}</dd></div>
      <div><dt>Bravais-Gitter</dt><dd>${BRAVAIS[d.bravais]} (${d.bravais})</dd></div>
      <div><dt>Punktgruppe</dt><dd>${pgLink}</dd></div>
      <div><dt>Operationen je Zelle</dt><dd class="num">${g.ordnung}</dd></div>
      <div><dt>Ursprung</dt><dd>${ursprungHTML(d.ursprung)}</dd></div>
      <div class="wide"><dt>Asymmetrische Einheit</dt><dd>${aeHTML(d.ae.text)}</dd></div>
    </dl>
    <div class="cols">
      <div><h3>Symmetrieoperationen</h3>${opsTab}
        <p class="note">Erzeugende: ${d.erzeugende.length ? d.erzeugende.map((i) => `(${i})`).join(', ') : 'nur'} ${d.erzeugende.length ? 'und die' : 'die'} Gittertranslationen <i>t</i>(1, 0), <i>t</i>(0, 1)${zentriert ? ' sowie <i>t</i>(½, ½)' : ''}.</p></div>
      <div><h3>Auslöschungen</h3><p>${d.bedingungen.allgemein.length ? `Allgemein: ${d.bedingungen.allgemein.map(bedingungHTML).join('; ')}` : 'Keine allgemeinen Auslöschungen.'}</p>
        ${d.bedingungen.allgemein.length ? `<p class="note">Reflexe <i>hk</i>, die eine Bedingung verletzen, fehlen im Beugungsbild; Ursache ist ${zentriert ? 'die Zentrierung' : 'die Gleitspiegellinie'}.</p>` : ''}</div>
    </div>
    <h3>Lagen (Wyckoff-Lagen)</h3>${wyTab}
    <details class="explain"><summary>Erläuterungen</summary>
      <p class="note">Aufbau wie eine Seite in den International Tables for Crystallography, Vol. A, Part 6. Koordinaten in Bruchteilen von <i>a</i> und <i>b</i>; <span class="ov"><i>x</i></span> steht für −<i>x</i>. Die Lagesymmetrie ist orientiert: Die erste Stelle nennt die Drehung, die zweite und dritte die Spiegellinien, deren Normale in der jeweiligen Blickrichtung liegt; ein Punkt heisst „keine“.</p>
      <p class="note">Punktgruppe ${pgLink} (${pg.ordnung} Operationen): die Operationen ohne ihren Translationsanteil. Sie führt in die App „Stereographische Projektion“, dort mit der Drehachse senkrecht zur Ebene.</p>
    </details>`;
}

// ------------------------------------------------------------------ Objekt setzen und ziehen
function setzePunkt(p, { rasten = z.einrasten && z.objekt, toleranzPx = coarse.matches ? 14 : 9 } = {}) {
  let q = p;
  if (rasten && ansichtA) {
    const M = metrik(z.gitter[systemJetzt()]);
    const kuerzer = Math.min(Math.hypot(...M.a), Math.hypot(...M.b));
    const tol = toleranzPx / (ansichtA.s * kuerzer);
    const l = lage(gruppeVon(z.gruppe), p, tol);
    // eingerasteter Punkt in derselben Zelle wie p
    q = [l.punkt[0] + Math.round(p[0] - l.punkt[0]), l.punkt[1] + Math.round(p[1] - l.punkt[1])];
  }
  const n = z.zellen;
  z.punkt = q.map((v) => Math.min(Math.max(v, 0), n - 1e-9));
  aktualisieren();
}

function svgPunkt(e) {
  const svg = $('bild-a');
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}
function naheObjekt(e) {
  if (!z.objekt || !ansichtA) return false;
  const q = ansichtA.zuBild(ausgangsstelle(z.punkt, z.zellen));
  const s = svgPunkt(e.touches ? e.touches[0] : e);
  const w = $('bild-a').getBoundingClientRect().width;
  const r = coarse.matches ? Math.max(24, 26 * (520 / (w || 520))) : 22;
  return Math.hypot(s[0] - q[0], s[1] - q[1]) < r;
}
let ziehen = false, bewegt = false, start = null;
function zeigerEinrichten() {
  const svg = $('bild-a');
  svg.addEventListener('touchstart', (e) => { if (naheObjekt(e)) e.preventDefault(); }, { passive: false });
  svg.addEventListener('pointerdown', (e) => {
    bewegt = false;
    if (!z.objekt) return;
    start = [e.clientX, e.clientY];
    if (e.pointerType === 'mouse' || naheObjekt(e)) {
      ziehen = true;
      svg.setPointerCapture(e.pointerId);
      if (!naheObjekt(e)) setzePunkt(ansichtA.vonBild(svgPunkt(e)));
    }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!ziehen) return;
    if (!bewegt && Math.hypot(e.clientX - start[0], e.clientY - start[1]) < 3) return;
    bewegt = true;
    setzePunkt(ansichtA.vonBild(svgPunkt(e)));
  });
  svg.addEventListener('pointerup', () => { ziehen = false; });
  svg.addEventListener('pointercancel', () => { ziehen = false; });
  // Touch: Antippen setzt das Objekt an die Stelle
  svg.addEventListener('click', (e) => {
    if (!z.objekt || e.pointerType === 'mouse' || bewegt || ziehen) return;
    const p = ansichtA.vonBild(svgPunkt(e));
    if (p.every((v) => v >= -0.02 && v <= z.zellen + 0.02)) setzePunkt(p);
  });
}

// ------------------------------------------------------------------ Ablauf
let geplant = false;
function aktualisieren() {
  bedienungAbgleichen();
  if (geplant) return;
  geplant = true;
  requestAnimationFrame(() => {
    geplant = false;
    auswahlAbgleichen();
    zeichnen();
    speichern();
  });
}

function wyckoffSetzen(b) {
  z.punkt = punktAufLage(gruppeVon(z.gruppe), b, z.punkt);
  aktualisieren();
}

function bindeSchalter(id, feld) {
  $(id).addEventListener('change', () => { z[feld] = $(id).checked; aktualisieren(); });
}

function init() {
  baueAuswahl();
  $('picker').addEventListener('click', (e) => {
    const b = e.target.closest('.pgb');
    if (!b) return;
    z.gruppe = b.dataset.g;
    aktualisieren();
  });
  bindeSchalter('opt-elemente', 'elemente');
  bindeSchalter('opt-objekt', 'objekt');
  bindeSchalter('opt-ae', 'ae');
  bindeSchalter('opt-einrasten', 'einrasten');
  bindeSchalter('v-farben', 'farben');
  bindeSchalter('v-muster-el', 'musterElemente');
  $('opt-zellen').addEventListener('change', () => {
    z.zellen = $('opt-zellen').checked ? 2 : 1;
    if (z.zellen === 1) z.punkt = z.punkt.map(mod1);
    aktualisieren();
  });
  document.querySelectorAll('#seg-form button').forEach((b) => b.addEventListener('click', () => { z.form = b.dataset.form; aktualisieren(); }));
  for (const [k, i] of [['x', 0], ['y', 1]]) {
    $(`obj-${k}`).addEventListener('input', () => {
      const p = [...z.punkt]; p[i] = Number($(`obj-${k}`).value);
      setzePunkt(p, { rasten: false });
    });
  }
  $('reset-objekt').addEventListener('click', () => { z.punkt = startzustand().punkt; aktualisieren(); });
  for (const k of ['ba', 'gamma']) {
    $(`lat-${k}`).addEventListener('input', () => { z.gitter[systemJetzt()][k] = Number($(`lat-${k}`).value); aktualisieren(); });
  }
  $('reset-gitter').addEventListener('click', () => { const s = systemJetzt(); z.gitter[s] = { ...GITTER_START[s] }; aktualisieren(); });
  $('reset-alles').addEventListener('click', () => {
    Object.assign(z, startzustand());
    hashAktiv = false; basisHash = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignorieren */ }
    aktualisieren();
  });
  $('info').addEventListener('click', (e) => {
    const b = e.target.closest('.setzen');
    if (b) wyckoffSetzen(b.dataset.wy);
  });
  zeigerEinrichten();
  // Telefon: eine Tafel oben, Umschalter
  document.querySelectorAll('.figswitch button').forEach((b) => b.addEventListener('click', () => {
    document.body.dataset.fig = b.dataset.fig;
    document.querySelectorAll('.figswitch button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.fig === b.dataset.fig)));
  }));
  // Erste Schritte: beim ersten Besuch, wegklickbar, über „?“ wieder; nicht bei Aufruf über einen Link
  const INTRO = 'ebenen-intro';
  let gesehen = false;
  try { gesehen = localStorage.getItem(INTRO) === '1'; } catch { /* ohne Speicher weiter */ }
  const intro = (an) => { $('intro').hidden = !an; $('help-open').setAttribute('aria-expanded', String(an)); };
  intro(!gesehen && !location.hash);
  $('intro-close').addEventListener('click', () => { intro(false); try { localStorage.setItem(INTRO, '1'); } catch { /* ohne Speicher weiter */ } });
  $('help-open').addEventListener('click', () => intro($('intro').hidden));
  const schritt = (n, f) => document.querySelector(`[data-step="${n}"]`).addEventListener('click', () => {
    f(); document.querySelector(`[data-step="${n}"]`).closest('li').classList.add('done'); aktualisieren();
  });
  schritt(1, () => { z.gruppe = 'p4gm'; z.objekt = true; });
  schritt(2, () => { z.objekt = true; const w = ebenengruppe(z.gruppe).wyckoff.find((x) => /m/.test(x.sym) && x.koord[0].includes('x')); if (w) wyckoffSetzen(w.b); });
  schritt(3, () => { z.ae = true; });
  $('copy-link').addEventListener('click', () => {
    const url = location.origin + location.pathname + location.search + hashVon(z);
    navigator.clipboard?.writeText(url);
  });
  initHelp({ tips: TIPS, sections: SECTIONS, labels: LABELS });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aktualisieren);
  $('app-version').innerHTML = `<a href="${REPO}">Version ${VERSION}</a>`;
  aktualisieren();
}

init();
offline({ lokal: true, neuLaden: true });
