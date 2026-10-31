// Steuerung der App: Zustand, Bedienelemente, Zeichnen der Tafeln, Kenndaten.

import { initHelp } from '../lib/common/js/help.js';
import { offline } from '../lib/common/js/seite.js';
import { TIPS, SECTIONS, LABELS } from './hilfetexte.js';
import { VERSION } from './version.js';
import { EBENENGRUPPEN, ebenengruppe } from './ebenengruppen.js';
import { gruppe as gruppeVon, lage, mod1, punktgruppe, punktAufLage } from './symmetrie.js';
import { tafelA, tafelB, drehSymbol, blickrichtung, elementeImBereich, sichtbar, metrik, ausgangsstelle, schrittDaten, itaOperationen, vereinfachen, STRICH_GRENZE } from './zeichnung.js';
import { herkunft, elementSchluessel, klassenSchluessel } from './herkunft.js';
import { erklaerungHTML, elementName } from './warum.js';
import { startzustand, hashVon, hashAnwenden, FREI, GITTER_START, FREI_BEREICH } from './zustand.js';
import { koordHTML, opHTML, lageHTML, symbolHTML, bedingungHTML, zahlText } from './text.js';
import { stereoLink, stereoHinweis } from './verweise.js';
import { schrittHTML } from './schritte.js';
import { brechAnalyse, brechHTML } from './brechen.js';

const $ = (id) => document.getElementById(id);
const REPO = 'https://github.com/manganite/plane-groups';
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
    const zahlTeile = ebenengruppe(z.gruppe).ae.text.split(';').length;
    if (!Number.isInteger(z.schritt) || z.schritt < 0) z.schritt = 0;
    // gezeichnete Striche: nur Folgen von Zahlenpaaren, höchstens STRICH_GRENZE Punkte
    const zahlenpaar = (q) => Array.isArray(q) && q.length === 2 && q.every(Number.isFinite);
    z.striche = Array.isArray(z.striche) ? z.striche.filter((st) => Array.isArray(st) && st.length >= 2 && st.every(zahlenpaar)) : [];
    while (z.striche.flat().length > STRICH_GRENZE) z.striche.shift();
    z.zeichnen = z.zeichnen === true;
    z.brechen = z.brechen === true;
    const fr = z.frei ?? {};
    z.frei = { ba: Number.isFinite(fr.ba) ? Math.min(Math.max(fr.ba, FREI_BEREICH.ba[0]), FREI_BEREICH.ba[1]) : 1, gamma: Number.isFinite(fr.gamma) ? Math.min(Math.max(fr.gamma, FREI_BEREICH.gamma[0]), FREI_BEREICH.gamma[1]) : 90 };
    z.aeTeile = Array.isArray(z.aeTeile) ? z.aeTeile.filter((i) => Number.isInteger(i) && i >= 0 && i < zahlTeile) : [];
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
  fc3: css('fc3'), fc4: css('fc4'),
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
  $('opt-orbit').checked = z.orbit;
  $('opt-orbit').disabled = !z.objekt;
  document.querySelector('#row-orbit .why').textContent = z.objekt ? '' : 'nur mit „Objekt in allgemeiner Lage“';
  document.querySelectorAll('#seg-form button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.form === z.form)));
  $('v-farben').checked = z.farben;
  // Aufbau aus Erzeugenden
  const h = herkunft(gruppeVon(z.gruppe));
  const maxS = h.maxTiefe;
  if (z.aufbau > maxS) z.aufbau = maxS;
  const aufbauMoeglich = z.elemente && maxS > 0;
  $('opt-aufbau').checked = z.aufbau > 0;
  $('opt-aufbau').disabled = !aufbauMoeglich;
  document.querySelector('#row-aufbau .why').textContent = !z.elemente ? 'nur mit „Symmetrieelemente“' : maxS === 0 ? 'p1 hat ausser den Translationen keine Symmetrieelemente' : '';
  $('aufbau-schritt').max = String(Math.max(1, maxS));
  $('aufbau-schritt').value = String(Math.max(1, z.aufbau));
  $('aufbau-schritt').disabled = z.aufbau === 0;
  $('aufbau-schritt-out').textContent = z.aufbau > 0 ? `${z.aufbau} von ${maxS}` : '–';
  $('aufbau-zurueck').disabled = z.aufbau <= 1;
  $('aufbau-vor').disabled = z.aufbau === 0 || z.aufbau >= maxS;
  const erz = ebenengruppe(z.gruppe).erzeugende;
  // Schritt für Schritt: N Operationen der ITA-Liste, dann die Gittertranslationen
  const nSchritte = gruppeVon(z.gruppe).ordnung + 1;
  if (z.schritt > nSchritte) z.schritt = nSchritte;
  $('opt-schritt').checked = z.schritt > 0;
  $('opt-schritt').disabled = !z.objekt;
  document.querySelector('#row-schritt .why').textContent = z.objekt ? '' : 'nur mit „Objekt in allgemeiner Lage“';
  $('schritt-regler').max = String(nSchritte);
  $('schritt-regler').value = String(Math.max(1, z.schritt));
  $('schritt-regler').disabled = z.schritt === 0;
  $('schritt-regler-out').textContent = z.schritt > 0 ? `${z.schritt} von ${nSchritte}` : '–';
  $('schritt-zurueck').disabled = z.schritt <= 1;
  $('schritt-vor').disabled = z.schritt === 0 || z.schritt >= nSchritte;
  $('schritt-abspielen').disabled = !z.objekt;
  $('aufbau-hint').innerHTML = z.aufbau === 0 ? ''
    : z.aufbau === 1 ? `Schritt 1: die Erzeugenden nach den International Tables (${erz.map((i) => `(${i})`).join(', ')}) mit ihren Kopien durch das Gitter.`
      : `Schritt ${z.aufbau}: neu hinzugekommen sind die hervorgehobenen Elemente. Sie folgen aus Verknüpfungen mit den Elementen der früheren Schritte; „Warum ist das da?“ zeigt, aus welchen.`;
  // Symmetrie brechen: andere Werkzeuge beziehen sich auf die ursprüngliche Gruppe und ruhen
  $('opt-brechen').checked = z.brechen;
  for (const k of ['ba', 'gamma']) {
    $(`frei-${k}`).disabled = !z.brechen;
    $(`frei-${k}`).value = String(z.frei[k]);
    $(`frei-${k}-out`).textContent = z.brechen ? (k === 'ba' ? z.frei.ba.toFixed(2) : `${z.frei.gamma.toFixed(1)}°`) : '–';
  }
  $('reset-brechen').disabled = !z.brechen;
  $('brechen-hint').textContent = z.brechen
    ? 'Die Objekte behalten ihre Lage in Bruchkoordinaten; es ändern sich nur Längen und Winkel. „Warum ist das da?“, Aufbau, Schritte und asymmetrische Einheit beziehen sich auf die ursprüngliche Gruppe und ruhen so lange.'
    : 'Löst die Bindung von b/a und γ an das Kristallsystem. Die Kenndaten zeigen dann, welche Symmetrie bleibt.';
  // Werkzeug „Warum ist das da?“
  $('werkzeug-warum').setAttribute('aria-pressed', String(z.warum));
  $('werkzeug-warum').disabled = !z.elemente;
  document.body.classList.toggle('warum', z.warum && z.elemente);
  // Selbst zeichnen
  $('werkzeug-zeichnen').setAttribute('aria-pressed', String(z.zeichnen));
  document.body.classList.toggle('zeichnen', z.zeichnen);
  $('zeichnen-zurueck').disabled = !z.striche.length;
  $('zeichnen-loeschen').disabled = !z.striche.length;
  $('opt-fuell').checked = z.aeFuell;
  const punkteGezeichnet = z.striche.flat().length;
  $('zeichnen-hint').textContent = z.zeichnen
    ? `Im Symmetriegerüst ziehen: Jeder Strich erscheint mit allen ${gruppeVon(z.gruppe).ordnung} Operationen je Zelle, auch im Muster. Blau: gleiche Händigkeit, orange: Spiegelbild.${punkteGezeichnet >= STRICH_GRENZE ? ' Die Zeichnung ist voll; „Rückgängig“ oder „Alles löschen“ schafft Platz.' : ''}`
    : 'Werkzeug „Zeichnen“ über dem Symmetriegerüst wählen und ziehen: Jeder Strich erscheint mit allen Operationen der Gruppe, auch im Muster.';
  $('fuell-hint').textContent = z.aeFuell
    ? `Kräftig: die asymmetrische Einheit. Ihre ${gruppeVon(z.gruppe).ordnung} Bilder je Zelle füllen die Zelle ohne Lücken und Überlappungen; was in ihr gezeichnet ist, ergibt also genau das ganze Muster.`
    : '';
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
  // beim freien Gitter ruhen die Werkzeuge, die sich auf die ursprüngliche Gruppe beziehen
  if (z.brechen) for (const id of ['lat-ba', 'lat-gamma', 'reset-gitter', 'opt-aufbau', 'aufbau-schritt', 'aufbau-vor', 'aufbau-zurueck', 'opt-schritt', 'schritt-regler', 'schritt-vor', 'schritt-zurueck', 'schritt-abspielen', 'opt-ae', 'opt-fuell', 'werkzeug-warum']) $(id).disabled = true;
}

// ------------------------------------------------------------------ Zeichnen
let ansichtA = null;
let erklaerung = null;
let phase = 3;
function zeichnen() {
  const f = farben();
  const a = tafelA(z.gruppe, z, f, { phase });
  ansichtA = a.ansicht;
  erklaerung = a.erklaerung;
  if (z.erkl && !erklaerung) z.erkl = null; // unbekanntes Element (z. B. aus einem alten Link)
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
  if (!z.objekt && (z.striche.length || z.aeFuell)) {
    items.push(`<span class="lg"><i class="sw" style="background:${f.upper}"></i>gleiche Händigkeit</span>`);
    if (gruppeVon(z.gruppe).alle.some((o) => o.R[0][0] * o.R[1][1] - o.R[0][1] * o.R[1][0] < 0)) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2}"></i>Spiegelbild</span>`);
  }
  if (z.schritt > 0 && z.objekt && !erklaerung) items.push(`<span class="lg"><i class="sw" style="background:${f.accent}"></i>aktuelle Operation; (n): Nummer in der Liste der Symmetrieoperationen</span>`);
  if (z.aeTeile?.length) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2};opacity:0.45"></i>gewählte Bedingungen erfüllt</span>`);
  if (z.elemente && z.aufbau > 0) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2};opacity:0.5"></i>neu in Schritt ${z.aufbau}</span>`);
  if (erklaerung?.art === 'kopie') {
    items.push(`<span class="lg"><i class="sw" style="background:${f.fc3}"></i>V, Vorbild</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${f.fc4}"></i>t, Gittertranslation</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${f.accent}"></i>Element von C</span>`);
  } else if (erklaerung) {
    if (!erklaerung.erzeugende) items.push(`<span class="lg"><i class="sw" style="background:${f.fc3}"></i>B, zuerst</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${f.fc4}"></i>${erklaerung.erzeugende ? 'C' : 'A, dann'}</span>`);
    items.push(`<span class="lg"><i class="sw" style="background:${f.accent}"></i>Element von C</span>`);
  }
  if (z.warum && z.elemente) items.push(`<span class="lg hint"><span class="only-fine">Element anklicken: woher es kommt</span><span class="only-coarse">Element antippen: woher es kommt</span></span>`);
  else if (z.objekt) items.push(`<span class="lg hint"><span class="only-fine">Objekt ziehen oder Stelle anklicken</span><span class="only-coarse">Objekt ziehen oder Stelle antippen</span></span>`);
  $('legend').innerHTML = items.join('');
}

// ------------------------------------------------------------------ Kenndaten
/** Punktgruppe in der App „Stereographische Projektion“ (Achse c senkrecht zur Ebene). */
const BRAVAIS = { mp: 'schiefwinklig primitiv', op: 'rechteckig primitiv', oc: 'rechteckig zentriert', tp: 'quadratisch primitiv', hp: 'hexagonal primitiv' };
const URSPRUNG = { beliebig: 'beliebig', '21g': 'auf 2 1 g', '41g': 'auf 4 1 g' };
const ursprungHTML = (u) => (URSPRUNG[u] ? URSPRUNG[u].replace(/([mg])/g, '<i>$1</i>') : `auf ${lageHTML(u)}`);
/** Bedingungen der asymmetrischen Einheit als Knöpfe: Tafel A zeigt, wo sie erfüllt sind. */
function aeBedingungen(d) {
  const teile = d.ae.text.split(';').map((t) => t.trim());
  const wahl = z.aeTeile ?? [];
  const knoepfe = teile.map((t, i) => `<button type="button" class="aeteil" data-aeteil="${i}" aria-pressed="${wahl.includes(i)}" title="Zeigen, wo diese Bedingung erfüllt ist">${aeHTML(t)}</button>`).join('<span class="sep">;</span> ');
  const hinweis = !wahl.length
    ? 'Bedingung antippen: Das Symmetriegerüst zeigt, wo sie erfüllt ist.'
    : wahl.length === teile.length
      ? 'Alle Bedingungen zusammen: Das ist die asymmetrische Einheit.'
      : `Schattiert: wo ${wahl.length === 1 ? 'diese Bedingung' : 'diese Bedingungen zusammen'} erfüllt ${wahl.length === 1 ? 'ist' : 'sind'}. Weitere antippen, bis alle gewählt sind.`;
  return `<span class="aeteile">${knoepfe}</span><span class="note aehinweis">${hinweis}${wahl.length ? ' <button type="button" class="linkbtn" data-aeteil-aus>keine</button>' : ''}</span>`;
}
const aeHTML = (t) => t.replace(/([xy])/g, '<i>$1</i>').replace(/(\d+)\/(\d+)/g, (m) => ({ '1/2': '½', '1/4': '¼', '1/3': '⅓', '2/3': '⅔' }[m] ?? m));

/** Fokus in den Kenndaten merken (über die Daten-Attribute des Knopfs), damit er ein Neuzeichnen übersteht. */
function fokusMerken() {
  const a = document.activeElement;
  if (!a || !$('info').contains(a)) return null;
  for (const attr of ['data-phase', 'data-abspielen', 'data-erkl-zu', 'data-erkl', 'data-wy']) {
    if (a.hasAttribute(attr)) return `[${attr}${a.getAttribute(attr) ? `="${CSS.escape(a.getAttribute(attr))}"` : ''}]`;
  }
  return null;
}
function fokusWiederherstellen(sel) {
  if (!sel) return;
  const el = $('info').querySelector(sel);
  if (el) el.focus({ preventScroll: true });
}

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
  // Schritt für Schritt: Kasten und die Zeile der aktuellen Operation
  const schrittAn = z.schritt > 0 && z.objekt && !erklaerung;
  const sd = schrittAn ? schrittDaten(g, ausgangsstelle(z.punkt, z.zellen), z.schritt) : null;
  const aktuell = sd && !sd.translationen ? sd.k - 1 : -1;
  const schrittbox = sd ? `<div class="warumbox schrittbox" id="schrittbox">${schrittHTML(d, sd, l, g.ordnung)}</div>` : '';
  const opsZeilen = (texte, ops, z0, versatz = 0) => ops.map((op, i) => `<tr${i + versatz === aktuell ? ' class="aktiv"' : ''}><td class="num">(${i + 1})</td><td>${koordHTML(d.ops[i])}${z0 ? ` + (${z0})` : ''}</td><td>${opHTML(texte[i])}</td></tr>`).join('');
  const opsTab = `<div class="tabwrap"><table class="itatab"><thead><tr><th>Nr.</th><th>Koordinaten</th><th>Symmetrieoperation</th></tr></thead><tbody>
    ${zentriert ? '<tr class="zent"><td colspan="3">für (0, 0)+</td></tr>' : ''}${opsZeilen(d.opsText, d.ops)}
    ${zentriert ? `<tr class="zent"><td colspan="3">für (½, ½)+</td></tr>${opsZeilen(d.zentrText, d.ops, '½, ½', d.ops.length)}` : ''}</tbody></table></div>`;
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
  const pgLink = `<a href="${stereoLink(d).replace(/&/g, '&amp;')}" target="_blank" rel="noopener" title="${stereoHinweis(d)}">${symbolHTML(d.punktgruppe)}</a>`;
  const fokus = fokusMerken();
  $('info').innerHTML = `
    <div class="info-head">
      <div class="hm-big">${symbolHTML(d.symbol)}</div>
      <div class="hm-meta"><span>Ebenengruppe Nr. ${d.nr} · ${SYSTEMNAMEN[d.system]}</span><span>International Tables, Vol. A, S. ${d.seite}${d.nr === 17 ? '–109' : ''}</span></div>
    </div>
    ${erklaerung ? `<div class="warumbox" id="warumbox">${erklaerungHTML(g, erklaerung, metrik(z.gitter[d.system]), phase)}</div>`
    : z.warum && z.elemente ? `<div class="warumbox" id="warumbox"><h3>Warum ist das da?</h3><p>Ein Symmetrieelement im Symmetriegerüst antippen oder hier wählen: Es erscheint, aus welchen zwei Operationen es folgt.</p>${elementListe(g)}</div>` : ''}
    ${z.brechen ? `<div class="warumbox brechbox" id="brechbox">${brechHTML(d, z.frei, brechAnalyse(g, z.frei))}</div>` : ''}
    ${schrittbox}
    ${erklaerung ? '' : lagebox}
    <dl class="facts">
      <div><dt>Vollständiges Symbol</dt><dd>${symbolHTML(d.lang)}</dd></div>
      <div><dt>Kristallsystem</dt><dd>${SYSTEMNAMEN[d.system]}</dd></div>
      <div><dt>Bravais-Gitter</dt><dd>${BRAVAIS[d.bravais]} (${d.bravais})</dd></div>
      <div><dt>Punktgruppe</dt><dd>${pgLink}</dd></div>
      <div><dt>Operationen je Zelle</dt><dd class="num">${g.ordnung}</dd></div>
      <div><dt>Ursprung</dt><dd>${ursprungHTML(d.ursprung)}</dd></div>
      <div class="wide"><dt>Asymmetrische Einheit</dt><dd>${aeBedingungen(d)}</dd></div>
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
      <p class="note">Punktgruppe ${pgLink} (${pg.ordnung} Operationen): die Operationen ohne ihren Translationsanteil. Die 10 Punktgruppen der Ebene entsprechen den 10 polaren Punktgruppen im Raum: Drehachsen stehen senkrecht auf der Ebene, Spiegelebenen enthalten ihre Normale. ${['1', 'm'].includes(d.punktgruppe) ? 'Der Link öffnet in der App „Stereographische Projektion“ das Symmetriegerüst dieser Punktgruppe mit Blick entlang c.' : 'Der Link öffnet in der App „Stereographische Projektion“ das Pedion, eine einzelne Kristallfläche, mit Blick senkrecht auf die Fläche: Ihr Muster hat genau die Punktgruppe der Ebene.'}</p>
    </details>`;
  fokusWiederherstellen(fokus);
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
/** Die in Tafel A sichtbaren Elemente (zeichnung.js), mit dem aktuellen Schritt im Aufbau. */
const sichtbareElemente = (g, n = z.zellen) => sichtbar(g, n, z.aufbau);

/** Element unter dem Zeiger wählen (Drehpunkte vor Linien), sonst die Auswahl aufheben. */
function elementWaehlen(e) {
  if (!ansichtA) return;
  const s = svgPunkt(e);
  const g = gruppeVon(z.gruppe);
  const el = sichtbareElemente(g);
  const w = $('bild-a').getBoundingClientRect().width || 520;
  const r = (coarse.matches ? 22 : 12) * (520 / w);
  let best = null;
  for (const d of el.drehpunkte) {
    const q = ansichtA.zuBild(d.punkt);
    const dist = Math.hypot(s[0] - q[0], s[1] - q[1]);
    if (dist < r * 1.2 && (!best || dist < best.dist)) best = { dist, el: d };
  }
  if (!best) {
    for (const l of el.linien) {
      const [p, q] = l.strecke.map(ansichtA.zuBild);
      const vx = q[0] - p[0]; const vy = q[1] - p[1]; const ll = vx * vx + vy * vy;
      const t = Math.max(0, Math.min(1, ((s[0] - p[0]) * vx + (s[1] - p[1]) * vy) / ll));
      const dist = Math.hypot(s[0] - p[0] - t * vx, s[1] - p[1] - t * vy);
      if (dist < r && (!best || dist < best.dist)) best = { dist, el: l };
    }
  }
  z.erkl = best ? elementSchluessel(best.el) : null;
  if (z.erkl) abspielen(); else aktualisieren();
}

/** Knöpfe für die sichtbaren Elemente der Zelle, eines je Klasse modulo Gitter (auch für die Tastatur). */
function elementListe(g) {
  const el = sichtbareElemente(g, 1);
  const gesehen = new Set();
  const knoepfe = [];
  // an einem Drehpunkt jede sichtbare Zähligkeit (im Aufbau z. B. 3 und 2 am selben Punkt)
  const einzeln = el.drehpunkte.flatMap((d) => (d.ordnungen ?? [d.n]).map((n) => ({ ...d, n })));
  for (const e of [...einzeln, ...el.linien]) {
    const k = klassenSchluessel(g, e);
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    const d = e.richtung ? { typ: e.art, punkt: e.punkt, richtung: e.richtung } : { typ: 'dreh', n: e.n, punkt: e.punkt };
    knoepfe.push(`<li><button class="linkbtn" type="button" data-erkl="${elementSchluessel(e)}">${elementName(d)}</button></li>`);
  }
  return `<ul class="elemliste">${knoepfe.join('')}</ul>`;
}

/** Schritte der Erklärung nacheinander zeigen (0 → 3). */
let ablauf = null;
/** Schritt für Schritt abspielen: alle Operationen nacheinander, zuletzt die Gittertranslationen. */
let schrittAblauf = null;
function stoppeSchritte() { clearTimeout(schrittAblauf); schrittAblauf = null; }
function schritteAbspielen() {
  stoppeSchritte();
  z.schritt = 1;
  aktualisieren();
  const ende = gruppeVon(z.gruppe).ordnung + 1;
  const weiter = () => {
    if (z.schritt === 0 || z.schritt >= ende) return;
    z.schritt += 1;
    aktualisieren();
    schrittAblauf = setTimeout(weiter, z.schritt === ende - 1 ? 1500 : 1100);
  };
  schrittAblauf = setTimeout(weiter, 1100);
}

function abspielen() {
  clearTimeout(ablauf);
  phase = 0;
  aktualisieren();
  const weiter = () => {
    if (phase >= 3 || !z.erkl) return;
    phase += 1;
    aktualisieren();
    ablauf = setTimeout(weiter, 1100);
  };
  ablauf = setTimeout(weiter, 900);
}

let ziehen = false, bewegt = false, start = null;

// ------------------------------------------------------------------ Selbst zeichnen
let strich = null; // Punkte des Strichs, der gerade gezeichnet wird (Bruchkoordinaten)
let nurA = false;
/** Während des Zeichnens nur Tafel A neu zeichnen (das Muster folgt am Ende des Strichs). */
function zeichneA() {
  if (nurA) return;
  nurA = true;
  requestAnimationFrame(() => {
    nurA = false;
    const a = tafelA(z.gruppe, z, farben(), { phase });
    ansichtA = a.ansicht;
    $('bild-a').innerHTML = a.svg;
  });
}
function strichBeginnen(e) {
  if (!ansichtA || z.striche.flat().length >= STRICH_GRENZE) return;
  strich = [ansichtA.vonBild(svgPunkt(e))];
  z.striche.push(strich);
  $('bild-a').setPointerCapture(e.pointerId);
}
function strichWeiter(e) {
  const p = ansichtA.vonBild(svgPunkt(e));
  const q = strich[strich.length - 1];
  if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.004 || z.striche.flat().length >= STRICH_GRENZE) return;
  strich.push(p);
  zeichneA();
}
function strichBeenden() {
  if (!strich) return;
  const i = z.striche.indexOf(strich);
  const fertig = vereinfachen(strich);
  if (fertig.length >= 2) z.striche[i] = fertig; else z.striche.splice(i, 1);
  strich = null;
  aktualisieren();
}
function zeigerEinrichten() {
  const svg = $('bild-a');
  svg.addEventListener('touchstart', (e) => { if (z.zeichnen || naheObjekt(e)) e.preventDefault(); }, { passive: false });
  svg.addEventListener('pointerdown', (e) => {
    bewegt = false;
    if (z.zeichnen) { strichBeginnen(e); return; }
    if (z.warum && z.elemente) { elementWaehlen(e); return; }
    if (!z.objekt) return;
    start = [e.clientX, e.clientY];
    if (e.pointerType === 'mouse' || naheObjekt(e)) {
      ziehen = true;
      svg.setPointerCapture(e.pointerId);
      if (!naheObjekt(e)) setzePunkt(ansichtA.vonBild(svgPunkt(e)));
    }
  });
  svg.addEventListener('pointermove', (e) => {
    if (strich) { strichWeiter(e); return; }
    if (!ziehen) return;
    if (!bewegt && Math.hypot(e.clientX - start[0], e.clientY - start[1]) < 3) return;
    bewegt = true;
    setzePunkt(ansichtA.vonBild(svgPunkt(e)));
  });
  svg.addEventListener('pointerup', () => { ziehen = false; strichBeenden(); });
  svg.addEventListener('pointercancel', () => { ziehen = false; strichBeenden(); });
  // Touch: Antippen setzt das Objekt an die Stelle
  svg.addEventListener('click', (e) => {
    if ((z.warum && z.elemente) || z.zeichnen || !z.objekt || e.pointerType === 'mouse' || bewegt || ziehen) return;
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
    if (z.gruppe !== b.dataset.g) { z.erkl = null; z.aeTeile = []; if (z.schritt > 0) z.schritt = 1; }
    z.gruppe = b.dataset.g;
    if (z.brechen) z.frei = { ...z.gitter[systemJetzt()] };
    aktualisieren();
  });
  bindeSchalter('opt-elemente', 'elemente');
  bindeSchalter('opt-objekt', 'objekt');
  bindeSchalter('opt-ae', 'ae');
  bindeSchalter('opt-einrasten', 'einrasten');
  bindeSchalter('opt-orbit', 'orbit');
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
    const at = e.target.closest('[data-aeteil]');
    if (at) {
      const i = Number(at.dataset.aeteil); const wahl = new Set(z.aeTeile ?? []);
      if (wahl.has(i)) wahl.delete(i); else wahl.add(i);
      z.aeTeile = [...wahl].sort((u, v) => u - v);
      aktualisieren();
    }
    if (e.target.closest('[data-aeteil-aus]')) { z.aeTeile = []; aktualisieren(); }
    const sch = e.target.closest('[data-schritt]');
    if (sch) { stoppeSchritte(); z.schritt = Number(sch.dataset.schritt); aktualisieren(); }
    if (e.target.closest('[data-schritt-abspielen]')) schritteAbspielen();
    if (e.target.closest('[data-schritt-zu]')) { stoppeSchritte(); z.schritt = 0; aktualisieren(); }
    const ph = e.target.closest('[data-phase]');
    if (ph) { clearTimeout(ablauf); phase = Number(ph.dataset.phase); aktualisieren(); }
    if (e.target.closest('[data-abspielen]')) abspielen();
    if (e.target.closest('[data-erkl-zu]')) { clearTimeout(ablauf); z.erkl = null; phase = 3; aktualisieren(); }
    const wahl = e.target.closest('[data-erkl]');
    if (wahl) { z.erkl = wahl.dataset.erkl; abspielen(); }
  });
  $('opt-brechen').addEventListener('change', () => {
    z.brechen = $('opt-brechen').checked;
    if (z.brechen) {
      z.frei = { ...z.gitter[systemJetzt()] };
      z.warum = false; z.erkl = null; z.aufbau = 0; z.schritt = 0; z.aeTeile = []; stoppeSchritte(); clearTimeout(ablauf); phase = 3;
    }
    aktualisieren();
  });
  for (const k of ['ba', 'gamma']) $(`frei-${k}`).addEventListener('input', () => { z.frei = { ...z.frei, [k]: Number($(`frei-${k}`).value) }; aktualisieren(); });
  $('reset-brechen').addEventListener('click', () => { z.frei = { ...z.gitter[systemJetzt()] }; aktualisieren(); });
  $('werkzeug-zeichnen').addEventListener('click', () => {
    z.zeichnen = !z.zeichnen;
    if (z.zeichnen) { z.warum = false; z.erkl = null; clearTimeout(ablauf); phase = 3; stoppeSchritte(); }
    aktualisieren();
  });
  $('zeichnen-zurueck').addEventListener('click', () => { z.striche.pop(); aktualisieren(); });
  $('zeichnen-loeschen').addEventListener('click', () => { z.striche = []; aktualisieren(); });
  $('opt-fuell').addEventListener('change', () => { z.aeFuell = $('opt-fuell').checked; aktualisieren(); });
  $('werkzeug-warum').addEventListener('click', () => {
    z.warum = !z.warum;
    if (z.warum) z.zeichnen = false;
    if (!z.warum) { z.erkl = null; clearTimeout(ablauf); phase = 3; }
    aktualisieren();
  });
  $('opt-aufbau').addEventListener('change', () => { z.aufbau = $('opt-aufbau').checked ? 1 : 0; aktualisieren(); });
  $('aufbau-schritt').addEventListener('input', () => { z.aufbau = Number($('aufbau-schritt').value); aktualisieren(); });
  $('opt-schritt').addEventListener('change', () => { stoppeSchritte(); z.schritt = $('opt-schritt').checked ? 1 : 0; aktualisieren(); });
  $('schritt-regler').addEventListener('input', () => { stoppeSchritte(); z.schritt = Number($('schritt-regler').value); aktualisieren(); });
  $('schritt-zurueck').addEventListener('click', () => { stoppeSchritte(); z.schritt = Math.max(1, z.schritt - 1); aktualisieren(); });
  $('schritt-vor').addEventListener('click', () => { stoppeSchritte(); z.schritt = Math.min(gruppeVon(z.gruppe).ordnung + 1, z.schritt + 1); aktualisieren(); });
  $('schritt-abspielen').addEventListener('click', schritteAbspielen);
  $('aufbau-zurueck').addEventListener('click', () => { z.aufbau = Math.max(1, z.aufbau - 1); aktualisieren(); });
  $('aufbau-vor').addEventListener('click', () => { z.aufbau = Math.min(herkunft(gruppeVon(z.gruppe)).maxTiefe, z.aufbau + 1); aktualisieren(); });
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
