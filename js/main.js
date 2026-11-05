// Steuerung der App: Zustand, Bedienelemente, Zeichnen der Tafeln, Kenndaten.

import { initHelp } from '../lib/common/js/help.js';
import { offline, alleEinstellungenZuruecksetzen, $, eingabe, knopf, element, elemente, grafik } from '../lib/common/js/seite.js';
import { TIPS, SECTIONS, LABELS } from './hilfetexte.js';
import { VERSION } from './version.js';
import { EBENENGRUPPEN, ebenengruppe } from './ebenengruppen.js';
import { gruppe as gruppeVon, lage, mod1, punktgruppe, punktAufLage } from './symmetrie.js';
import { tafelA, tafelB, OBJEKT_UMRISS, erklaerend, schrittWirkt, drehSymbol, blickrichtung, elementeImBereich, sichtbar, metrik, ausgangsstelle, schrittDaten, vereinfachen, STRICH_GRENZE, gebrochen, radieren, metrik as metrikVon, grad } from './zeichnung.js';
import { herkunft, elementSchluessel, klassenSchluessel } from './herkunft.js';
import { erklaerungHTML, elementName } from './warum.js';
import { startzustand, hashVon, hashAnwenden, FREI, GITTER_START, GITTER_BEREICH, FREI_BEREICH, strukturStart, pruefeStruktur, wieVorgabe, ZOOM_BEREICH, OBJ_BEREICH, gespeichertPruefen, introGesehen, istObjekt, imBereich, zahlenpaar } from './zustand.js';
import { strukturUI } from './struktur-ui.js';
import { koordHTML, opHTML, lageHTML, symbolHTML, bedingungHTML, zahlText, koordText, dezimal, richtungHTML } from './text.js';
import { stereoLink, stereoHinweis } from './verweise.js';
import { schrittHTML } from './schritte.js';
import { schoenfliesHTML, CONWAY } from './symbole.js';
import { brechAnalyse, brechHTML } from './brechen.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Gitter, Farben, Ansicht, Box, Erklaerung, SichtbarerDrehpunkt, SichtbareLinie } from './zeichnung.js' */
/** @import { Gruppe } from './symmetrie.js' */
/** @import { Ebenengruppe, System } from './ebenengruppen.js' */
/** @import { Schalterfeld } from './zustand.js' */
/** @import { Elementangabe } from './warum.js' */

// Elemente der Seite (index.html) über die geprüften Helfer aus lib/common/js/seite.js
// ($, eingabe, knopf, element, elemente, grafik)
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
    gespeichertPruefen(z);
    // gezeichnete Striche: nur Folgen von Zahlenpaaren, höchstens STRICH_GRENZE Punkte
    z.striche = Array.isArray(z.striche) ? z.striche.filter((st) => Array.isArray(st) && st.length >= 2 && st.every(zahlenpaar)) : [];
    while (z.striche.flat().length > STRICH_GRENZE) z.striche.shift();
    z.zeichnen = z.zeichnen === true;
    z.radieren = z.radieren === true && !z.zeichnen;
    z.brechen = z.brechen === true;
    if (!imBereich(z.zoomB, ZOOM_BEREICH)) z.zoomB = 1;
    if (!imBereich(z.objGroesse, OBJ_BEREICH)) z.objGroesse = 1;
    /** @type {unknown} aus dem Speicher, unbekannten Aufbaus */
    const fr = z.frei;
    /** @param {unknown} v @param {[number, number]} bereich @param {number} sonst */
    const begrenzt = (v, [lo, hi], sonst) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(v, lo), hi) : sonst);
    z.frei = istObjekt(fr) ? { ba: begrenzt(fr.ba, FREI_BEREICH.ba, 1), gamma: grad(begrenzt(fr.gamma, FREI_BEREICH.gamma, 90)) } : { ba: 1, gamma: grad(90) };
    z.aeTeile = Array.isArray(z.aeTeile) ? z.aeTeile.filter((i) => Number.isInteger(i) && i >= 0 && i < zahlTeile) : [];
    if (!['eg', 'struktur'].includes(z.modus)) z.modus = 'eg';
    z.struktur = pruefeStruktur(z.struktur) ?? strukturStart();
  }
} catch { /* ohne Speicher weiter */ }
if (location.hash.length > 1) hashAnwenden(z, location.hash); // Link hat Vorrang

let letzterHash = '';
let hashAktiv = location.hash.length > 1;
/** @type {string | null} */
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
/** @param {string} name */
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
/** @returns {Farben} */
const farben = () => ({
  paper: css('paper'), ink: css('ink'), muted: css('muted'), line: css('line'), accent: css('accent'), accent2: css('accent2'),
  upper: css('upper'), crystal: css('crystal'), dir: [css('dir1'), css('dir2'), css('dir3')],
  fc3: css('fc3'), fc4: css('fc4'),
});

// ------------------------------------------------------------------ Bildexport (immer hell)
/** @type {HTMLSpanElement | null} */
let hellEl = null;
/** Farben des hellen Modus, auch wenn die Seite dunkel ist (Bildexport immer hell, wie in der Stereo-App). @returns {Farben} */
function hellFarben() {
  if (!hellEl || !hellEl.isConnected) {
    hellEl = document.createElement('span');
    hellEl.className = 'theme-light';
    hellEl.hidden = true;
    document.body.appendChild(hellEl);
  }
  const s = getComputedStyle(hellEl);
  /** @param {string} name */
  const g = (name) => s.getPropertyValue(`--${name}`).trim();
  return {
    paper: g('paper'), ink: g('ink'), muted: g('muted'), line: g('line'), accent: g('accent'), accent2: g('accent2'),
    upper: g('upper'), crystal: g('crystal'), dir: [g('dir1'), g('dir2'), g('dir3')], fc3: g('fc3'), fc4: g('fc4'),
  };
}
/** Tafel A oder B als eigenständiges SVG in den hellen Farben. @param {string} tafel */
function bildSVG(tafel) {
  const f = hellFarben();
  let inhalt;
  if (z.modus === 'struktur') inhalt = sUI.bild(f, tafel);
  else inhalt = tafel === 'a' ? tafelA(z.gruppe, z, f, { phase }).svg : tafelB(z.gruppe, z, f).svg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520" width="520" height="520">${inhalt}</svg>`;
}
/** Dateiname ohne Endung, z. B. p4gm-symmetriegeruest oder struktur-graphen-muster. @param {string} tafel */
function bildName(tafel) {
  const was = z.modus === 'struktur' ? `struktur-${z.struktur.vorgabe && wieVorgabe(z.struktur) ? z.struktur.vorgabe : 'eigene'}` : z.gruppe;
  const teil = tafel === 'b' ? 'muster' : z.modus === 'struktur' ? 'struktur' : 'symmetriegeruest';
  return `${was}-${teil}`;
}
/** Schriften als data:-URLs, damit sie im gerasterten SVG wirken (ein Bild lädt keine fremden Dateien). */
/** @type {Promise<string> | null} */
let schriftCss = null;
/** @returns {Promise<string>} */
function eingebetteteSchriften() {
  if (!schriftCss) {
    const dateien = [['IBM Plex Sans', '400', 'normal', 'ibm-plex-sans-latin-400-normal'], ['IBM Plex Sans', '400', 'italic', 'ibm-plex-sans-latin-400-italic'],
      ['IBM Plex Sans', '600', 'normal', 'ibm-plex-sans-latin-600-normal'], ['Source Serif 4', '500', 'normal', 'source-serif-4-latin-500-normal']];
    schriftCss = Promise.all(dateien.map(async ([fam, w, st, datei]) => {
      const antwort = await fetch(`lib/common/fonts/${datei}.woff2`);
      if (!antwort.ok) throw new Error(`Schrift ${datei}: ${antwort.status}`);
      const blob = await antwort.blob();
      const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
      return `@font-face{font-family:'${fam}';font-style:${st};font-weight:${w};src:url(${url}) format('woff2');}`;
    })).then((x) => x.join('')).catch(() => {
      // ohne Schriften weiter (Ersatzschriften), beim nächsten Export neuer Versuch
      schriftCss = null;
      return '';
    });
  }
  return schriftCss;
}
/**
 * SVG-Text als PNG (2048 px). Den Text vor dem ersten await erzeugen, damit das Bild die Ansicht beim Klick zeigt.
 * @param {string} svgText @returns {Promise<Blob>}
 */
async function bildPNG(svgText) {
  const px = 2048;
  const css = await eingebetteteSchriften();
  const text = svgText.replace('width="520" height="520">', `width="${px}" height="${px}"><style>${css}</style>`);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text); });
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d')).drawImage(img, 0, 0, px, px);
  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('PNG fehlgeschlagen'))), 'image/png'));
}
function exportKnoepfe() {
  /** @param {HTMLElement} btn */
  const melden = (btn) => {
    const zurueck = btn.dataset.label || (btn.dataset.label = btn.textContent);
    return (/** @type {string} */ text) => { btn.textContent = text; setTimeout(() => { btn.textContent = zurueck; }, 1600); };
  };
  /** @param {Blob} blob @param {string} name */
  const laden = (blob, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  for (const t of ['a', 'b']) {
    // Kopieren: Blob als Promise übergeben, Safari verlangt den Aufruf noch in der Klick-Behandlung
    $(`kopieren-${t}`).addEventListener('click', async () => {
      const sag = melden($(`kopieren-${t}`));
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': bildPNG(bildSVG(t)) })]); sag('Kopiert'); } catch { sag('Nicht möglich'); }
    });
    $(`svg-${t}`).addEventListener('click', () => laden(new Blob([bildSVG(t)], { type: 'image/svg+xml' }), `${bildName(t)}.svg`));
    $(`png-${t}`).addEventListener('click', async () => {
      const svg = bildSVG(t); const name = `${bildName(t)}.png`;
      try { laden(await bildPNG(svg), name); } catch { melden($(`png-${t}`))('Nicht möglich'); }
    });
  }
}

// ------------------------------------------------------------------ Gruppenwahl
/** @type {Record<System, string>} */
const SYSTEMNAMEN = { schiefwinklig: 'schiefwinklig', rechteckig: 'rechteckig', quadratisch: 'quadratisch', hexagonal: 'hexagonal' };
function baueAuswahl() {
  const systeme = [...new Set(EBENENGRUPPEN.map((g) => g.system))];
  $('picker').innerHTML = systeme.map((sys) => `<div class="sysrow"><span class="sys">${SYSTEMNAMEN[sys]}</span><div class="btns">${
    EBENENGRUPPEN.filter((g) => g.system === sys).map((g) => `<button class="pgb" type="button" data-g="${g.symbol}" aria-pressed="false" title="Nr. ${g.nr}, Punktgruppe ${g.punktgruppe}">${symbolHTML(g.symbol)}</button>`).join('')
  }</div></div>`).join('');
}
function auswahlAbgleichen() {
  elemente('#picker .pgb').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === z.gruppe)));
}

// ------------------------------------------------------------------ Bedienelemente abgleichen
const systemJetzt = () => ebenengruppe(z.gruppe).system;
/** „Herkunft der Elemente“ wirkt: gewählt, mit Symmetrieelementen, nicht beim Brechen der Symmetrie (dort ruht es, bleibt aber gewählt). */
const herkunftAktiv = () => z.warum && z.elemente && !z.brechen;
/** Grund, wenn Zeichnen, Radieren, Füllen und Lupe ruhen (erklaerend in zeichnung.js). */
const SOLANGE_ERKLAERT = 'solange „Schritt für Schritt“, der Aufbau oder „Herkunft der Elemente“ aktiv ist';
function bedienungAbgleichen() {
  eingabe('opt-elemente').checked = z.elemente;
  eingabe('opt-objekt').checked = z.objekt;
  eingabe('opt-ae').checked = z.ae;
  eingabe('opt-zellen').checked = z.zellen === 2;
  eingabe('opt-einrasten').checked = z.einrasten;
  eingabe('opt-einrasten').disabled = !z.objekt;
  element('#row-einrasten .why').textContent = z.objekt ? '' : 'nur mit „Objekt in allgemeiner Lage“';
  eingabe('opt-orbit').checked = z.orbit;
  eingabe('opt-orbit').disabled = !z.objekt;
  element('#row-orbit .why').textContent = z.objekt ? '' : 'nur mit „Objekt in allgemeiner Lage“';
  elemente('#seg-form button, #seg-ornament button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.form === z.form)));
  eingabe('v-farben').checked = z.farben;
  // Aufbau aus Erzeugenden
  const h = herkunft(gruppeVon(z.gruppe));
  const maxS = h.maxTiefe;
  if (z.aufbau > maxS) z.aufbau = maxS;
  const aufbauMoeglich = z.elemente && maxS > 0;
  eingabe('opt-aufbau').checked = z.aufbau > 0;
  eingabe('opt-aufbau').disabled = !aufbauMoeglich;
  element('#row-aufbau .why').textContent = !z.elemente ? 'nur mit „Symmetrieelemente“' : maxS === 0 ? 'p1 hat ausser den Translationen keine Symmetrieelemente' : '';
  eingabe('aufbau-schritt').max = String(Math.max(1, maxS));
  eingabe('aufbau-schritt').value = String(Math.max(1, z.aufbau));
  eingabe('aufbau-schritt').disabled = z.aufbau === 0;
  $('aufbau-schritt-out').textContent = z.aufbau > 0 ? `${z.aufbau} von ${maxS}` : '–';
  knopf('aufbau-zurueck').disabled = z.aufbau <= 1;
  knopf('aufbau-vor').disabled = z.aufbau === 0 || z.aufbau >= maxS;
  const erz = ebenengruppe(z.gruppe).erzeugende;
  // Schritt für Schritt: N Operationen der ITA-Liste, dann die Gittertranslationen
  const nSchritte = gruppeVon(z.gruppe).ordnung + 1;
  if (z.schritt > nSchritte) z.schritt = nSchritte;
  eingabe('opt-schritt').checked = z.schritt > 0;
  // „Herkunft der Elemente“ (eingeschaltet oder mit gezeigtem Element) überdeckt „Schritt für Schritt“
  // (schrittWirkt in zeichnung.js): Es ruht, gesperrt und gewählt, bis sie ausgeschaltet ist (Leitfaden 5.2)
  const schrittRuht = !z.brechen && (herkunftAktiv() || !!z.erkl);
  eingabe('opt-schritt').disabled = !z.objekt || schrittRuht;
  element('#row-schritt .why').textContent = !z.objekt ? 'nur mit „Objekt in allgemeiner Lage“'
    : schrittRuht ? (herkunftAktiv() ? 'ruht, solange „Herkunft der Elemente“ eingeschaltet ist' : 'ruht, solange die Herkunft eines Elements gezeigt wird („Schliessen“ in der Erklärung)') : '';
  eingabe('schritt-regler').max = String(nSchritte);
  eingabe('schritt-regler').value = String(Math.max(1, z.schritt));
  eingabe('schritt-regler').disabled = z.schritt === 0 || schrittRuht;
  $('schritt-regler-out').textContent = z.schritt > 0 ? `${z.schritt} von ${nSchritte}` : '–';
  knopf('schritt-zurueck').disabled = z.schritt <= 1 || schrittRuht;
  knopf('schritt-vor').disabled = z.schritt === 0 || z.schritt >= nSchritte || schrittRuht;
  knopf('schritt-abspielen').disabled = !z.objekt || schrittRuht;
  $('aufbau-hint').innerHTML = z.aufbau === 0 ? ''
    : z.aufbau === 1 ? `Schritt 1: die Erzeugenden nach den International Tables (${erz.map((i) => `(${i})`).join(', ')}) mit ihren Kopien durch das Gitter.`
      : `Schritt ${z.aufbau}: neu hinzugekommen sind die hervorgehobenen Elemente. Sie folgen aus Verknüpfungen mit den Elementen der früheren Schritte; „Herkunft der Elemente“ zeigt, aus welchen.`;
  // „Herkunft der Elemente“: Antippen eines Elements zeigt, woher es kommt (Zustand z.warum, Link warum=1)
  eingabe('opt-warum').checked = z.warum;
  eingabe('opt-warum').disabled = !z.elemente;
  element('#row-warum .why').textContent = z.elemente ? '' : 'nur mit „Symmetrieelemente“';
  document.body.classList.toggle('warum', herkunftAktiv());
  // Erklärungen (Schritt für Schritt, Aufbau, Herkunft der Elemente): Werkzeuge Zeichnen und Radieren aus,
  // die Lupe ruht (bleibt gewählt); Zeichnung und Lupe kommen beim Verlassen zurück
  const ruhig = erklaerend(z);
  if (ruhig) { z.zeichnen = false; z.radieren = false; }
  knopf('werkzeug-zeichnen').disabled = ruhig;
  knopf('werkzeug-lupe').disabled = ruhig;
  // Selbst zeichnen
  $('werkzeug-zeichnen').setAttribute('aria-pressed', String(z.zeichnen));
  document.body.classList.toggle('zeichnen', z.zeichnen);
  $('werkzeug-radieren').setAttribute('aria-pressed', String(z.radieren));
  $('werkzeug-lupe').setAttribute('aria-pressed', String(z.lupe));
  knopf('werkzeug-radieren').disabled = ruhig || (!z.striche.length && !z.radieren);
  document.body.classList.toggle('radieren', z.radieren);
  knopf('zeichnen-zurueck').disabled = !z.striche.length && !verlauf.length;
  knopf('zeichnen-loeschen').disabled = !z.striche.length;
  eingabe('opt-fuell').checked = z.aeFuell;
  eingabe('opt-fuell').disabled = ruhig;
  element('#row-fuell .why').textContent = ruhig ? `ruht, ${SOLANGE_ERKLAERT}` : '';
  const punkteGezeichnet = z.striche.flat().length;
  $('zeichnen-hint').textContent = z.radieren
    ? 'Über die Striche ziehen: Der Radiergummi entfernt die überfahrenen Stücke, am Original und an allen Kopien zugleich. „Rückgängig“ holt sie zurück.'
    : z.zeichnen
    ? `Im Symmetriegerüst ziehen: Jeder Strich erscheint mit allen ${gruppeVon(z.gruppe).ordnung} Operationen je Zelle, auch im Muster. Blau: gleiche Händigkeit, orange: Spiegelbild.${punkteGezeichnet >= STRICH_GRENZE ? ' Die Zeichnung ist voll; „Rückgängig“ oder „Alles löschen“ schafft Platz.' : ''}`
    : ruhig
    ? `Zeichnen und Radieren ruhen, ${SOLANGE_ERKLAERT}; die Zeichnung ist im Symmetriegerüst ausgeblendet, im Muster bleibt sie.`
    : 'Werkzeug „Zeichnen“ über dem Symmetriegerüst wählen und ziehen: Jeder Strich erscheint mit allen Operationen der Gruppe, auch im Muster.';
  $('fuell-hint').textContent = z.aeFuell
    ? `Kräftig: die asymmetrische Einheit. Ihre ${gruppeVon(z.gruppe).ordnung} Bilder je Zelle füllen die Zelle ohne Lücken und Überlappungen; was in ihr gezeichnet ist, ergibt also genau das ganze Muster.`
    : '';
  eingabe('v-muster-el').checked = z.musterElemente;
  eingabe('v-tapete').checked = z.tapete;
  eingabe('v-muster-el').disabled = z.tapete;
  // Objekt
  const p = z.punkt.map(mod1);
  for (const [k, i] of /** @type {[string, number][]} */ ([['x', 0], ['y', 1]])) {
    eingabe(`obj-${k}`).value = String(p[i]);
    eingabe(`obj-${k}`).disabled = !z.objekt;
    $(`obj-${k}-out`).textContent = zahlText(p[i]);
  }
  eingabe('obj-groesse').value = String(z.objGroesse);
  eingabe('obj-groesse').disabled = !z.objekt;
  $('obj-groesse-out').textContent = `${dezimal(z.objGroesse, 2)} ×`;
  eingabe('v-zoom').value = String(z.zoomB);
  $('v-zoom-out').textContent = `${dezimal(z.zoomB, 2)} ×`;
  $('obj-why').textContent = z.objekt ? '' : 'Nur mit „Objekt in allgemeiner Lage“.';
  knopf('reset-objekt').disabled = !z.objekt;
  // Gitter
  const sys = systemJetzt();
  // ohne Bindung (Symmetrie brechen) dieselben Regler mit grösserem Bereich und der freien Metrik
  const gi = z.brechen ? z.frei : z.gitter[sys];
  for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
    const [lo, hi] = z.brechen ? FREI_BEREICH[k] : GITTER_BEREICH[k];
    eingabe(`lat-${k}`).min = String(lo); eingabe(`lat-${k}`).max = String(hi);
    eingabe(`lat-${k}`).value = String(gi[k]);
    eingabe(`lat-${k}`).disabled = !z.brechen && !FREI[sys].includes(k);
    $(`lat-${k}-out`).textContent = k === 'ba' ? dezimal(gi.ba, 2) : `${dezimal(gi.gamma, 1)}°`;
  }
  eingabe('opt-brechen').checked = z.brechen;
  eingabe('opt-brechen').disabled = sys === 'schiefwinklig' && !z.brechen;
  element('#row-brechen .why').textContent = sys === 'schiefwinklig' ? 'im schiefwinkligen System ist das Gitter schon frei' : '';
  const fest = { quadratisch: 'Im quadratischen System festgelegt: a = b, γ = 90°.', hexagonal: 'Im hexagonalen System festgelegt: a = b, γ = 120°.', rechteckig: 'Im rechteckigen System ist γ = 90° festgelegt.', schiefwinklig: '' };
  $('lat-why').textContent = z.brechen
    ? 'Ohne Bindung: Die Objekte behalten ihre Lage in Bruchkoordinaten, es ändern sich nur Längen und Winkel. Die Kenndaten zeigen, welche Symmetrie bleibt. „Herkunft der Elemente“, Aufbau, Schritte und asymmetrische Einheit beziehen sich auf die ursprüngliche Gruppe und ruhen so lange.'
    : `${fest[sys]} Innerhalb des Systems bleibt die Symmetrie erhalten.`.trim();
  $('reset-gitter').textContent = z.brechen ? 'Zurück zur Metrik des Systems' : 'Gitter zurücksetzen';
  knopf('reset-gitter').disabled = !z.brechen && FREI[sys].length === 0;
  // beim freien Gitter ruhen die Werkzeuge, die sich auf die ursprüngliche Gruppe beziehen
  if (z.brechen) {
    for (const id of ['opt-aufbau', 'aufbau-schritt', 'opt-schritt', 'schritt-regler', 'opt-ae', 'opt-fuell', 'opt-warum']) eingabe(id).disabled = true;
    for (const id of ['aufbau-vor', 'aufbau-zurueck', 'schritt-vor', 'schritt-zurueck', 'schritt-abspielen']) knopf(id).disabled = true;
    for (const id of ['#row-warum', '#row-aufbau', '#row-schritt', '#row-fuell']) element(`${id} .why`).textContent = 'ruht ohne Bindung an das Kristallsystem';
  }
}

// ------------------------------------------------------------------ Zeichnen
/** @type {Ansicht | null} */
let ansichtA = null;
/** Massstab des Objekts in Tafel A (tafelA, objektMassstab), für den Treffer beim Ziehen. */
let massObjektA = 1;
/**
 * Ausschnitt der Lupe: folgt dem Objekt, bleibt aber ganz stehen (Mitte und Grösse), solange
 * gezogen, gezeichnet oder radiert wird, damit der Zeiger und das Bild zusammenpassen.
 */
/** @type {Box | null} */
let lupeBox = null;
/** @returns {{ lupeBox?: Box, lupeMitte?: Vec2 }} */
function lupeOptionen() {
  if (!z.lupe || erklaerend(z)) { lupeBox = null; return {}; }
  return lupeBox && (ziehen || strich || radierStelle) ? { lupeBox } : { lupeMitte: ausgangsstelle(z.punkt, z.zellen) };
}
/** Tafel A der Gruppe mit Lupe; merkt sich den Ausschnitt für die nächste Geste. @param {Farben} f */
function tafelAJetzt(f) {
  const a = tafelA(z.gruppe, z, f, { phase, ...lupeOptionen() });
  lupeBox = a.lupeBox; massObjektA = a.massObjekt;
  return a;
}
const sUI = strukturUI({ z, farben, aktualisieren: () => aktualisieren(), svgPunkt: (e) => svgPunkt(e), coarse });
/** @type {Erklaerung | null} */
let erklaerung = null;
let phase = 3;
function zeichnen() {
  if (z.modus === 'struktur') { ansichtA = null; $('sub-a').textContent = 'gegebene und konventionelle Zelle'; sUI.zeichnen(); return; }
  const f = farben();
  const a = tafelAJetzt(f);
  ansichtA = a.ansicht;
  erklaerung = a.erklaerung;
  // unbekanntes Element (z. B. aus einem alten Link): verwerfen und die Bedienung neu abgleichen, die es
  // sonst noch als laufende Erklärung zählt (Sperren von Zeichnen und Lupe)
  if (z.erkl && !erklaerung) { z.erkl = null; aktualisieren(); }
  grafik('bild-a').innerHTML = a.svg;
  grafik('bild-b').innerHTML = tafelB(z.gruppe, z, f).svg;
  $('sub-a').textContent = z.zellen === 2 ? '2 × 2 Elementarzellen' : 'Elementarzelle';
  legende(f);
  kenndaten();
}

/** @type {Record<string, string[]>} */
const RICHTUNG = {
  rechteckig: [[1, 0], [0, 1]].map(richtungHTML),
  quadratisch: [[[1, 0], [0, 1]], [[1, 1], [-1, 1]]].map((r) => r.map(richtungHTML).join(', ')),
  hexagonal: [[[1, 0], [0, 1], [1, 1]], [[-1, 1], [1, 2], [2, 1]]].map((r) => r.map(richtungHTML).join(', ')),
};
/** @param {Farben} f */
function legende(f) {
  const g = gruppeVon(z.gruppe);
  const bruch = z.brechen ? brechAnalyse(g, z.frei) : null;
  const sys = g.daten.system;
  const items = [];
  const el = elementeImBereich(bruch ? gebrochen(g, z.frei).H : g, 1); // beim Brechen nur die Restsymmetrie
  /** @param {number} pos */
  const farbe = (pos) => (z.farben ? f.dir[pos - 1] : f.ink);
  if (z.elemente) {
    const ordnungen = [...new Set(el.drehpunkte.map((d) => d.n))].sort();
    for (const n of ordnungen) items.push(`<span class="lg"><svg class="sym-icon" width="22" height="22" viewBox="0 0 22 22">${drehSymbol(n, [11, 11], farbe(1), f.paper)}</svg>${n}-zähliger Drehpunkt</span>`);
    const arten = new Set(el.linien.map((l) => l.art));
    /** @param {boolean} dash */
    const linie = (dash) => `<svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.ink}" stroke-width="${dash ? 2 : 2.8}" ${dash ? 'stroke-dasharray="6 4"' : 'stroke-linecap="round"'}/></svg>`;
    if (arten.has('spiegel')) items.push(`<span class="lg">${linie(false)}Spiegellinie</span>`);
    if (arten.has('gleit')) items.push(`<span class="lg">${linie(true)}Gleitspiegellinie</span>`);
    if (z.farben && sys !== 'schiefwinklig' && !(bruch && bruch.weg.length)) {
      const positionen = new Set(el.linien.map((l) => blickrichtung(sys, l.normale)));
      for (const pos of [2, 3]) {
        if (positionen.has(pos)) items.push(`<span class="lg"><i class="sw" style="background:${f.dir[pos - 1]}"></i><span>Normale ∥ ${RICHTUNG[sys][pos - 2]}</span></span>`);
      }
    }
  }
  if (z.objekt && bruch && bruch.bahnen > 1) {
    items.push('<span class="lg"><em>Farben der Objekte: Bahnen der Restsymmetrie</em></span>');
  } else if (z.objekt) {
    items.push(`<span class="lg"><i class="sw" style="background:${f.upper}"></i>gleiche Händigkeit</span>`);
    if (g.alle.some((o) => o.R[0][0] * o.R[1][1] - o.R[0][1] * o.R[1][0] < 0)) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2}"></i>Spiegelbild</span>`);
  }
  if (z.objekt) {
    items.push(`<span class="lg"><svg width="20" height="20" viewBox="-10 -10 20 20"><circle r="8" fill="none" stroke="${f.accent}" stroke-width="1.6" stroke-dasharray="2.6 2.2"/></svg>Ausgangsobjekt</span>`);
  }
  if (z.ae) items.push(`<span class="lg"><i class="sw" style="background:${f.crystal}"></i>asymmetrische Einheit</span>`);
  if (!z.objekt && (z.striche.length || z.aeFuell)) {
    items.push(`<span class="lg"><i class="sw" style="background:${f.upper}"></i>gleiche Händigkeit</span>`);
    if (gruppeVon(z.gruppe).alle.some((o) => o.R[0][0] * o.R[1][1] - o.R[0][1] * o.R[1][0] < 0)) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2}"></i>Spiegelbild</span>`);
  }
  if (schrittWirkt({ ...z, erkl: erklaerung ? z.erkl : null })) items.push(`<span class="lg"><i class="sw" style="background:${f.accent}"></i>aktuelle Operation; (n): Nummer in der Liste der Symmetrieoperationen</span>`);
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
  if (erklaerend(z)) items.push(`<span class="lg hint">Zeichnen, Radieren und Lupe ruhen, ${SOLANGE_ERKLAERT}</span>`);
  if (herkunftAktiv()) items.push(`<span class="lg hint"><span class="only-fine">Element anklicken: woher es kommt</span><span class="only-coarse">Element antippen: woher es kommt</span></span>`);
  else if (z.objekt) items.push(`<span class="lg hint"><span class="only-fine">Objekt ziehen oder Stelle anklicken</span><span class="only-coarse">Objekt ziehen oder Stelle antippen</span></span>`);
  $('legend').innerHTML = items.join('');
}

// ------------------------------------------------------------------ Kenndaten
/** Tooltip zur Signatur nach Conway (Orbifold-Symbol). */
const CONWAY_HINWEIS = 'Orbifold-Symbol nach Conway: * Spiegellinien (Kaleidoskop), Ziffern vor dem * Drehpunkte ohne Spiegellinie, Ziffern nach dem * Schnittpunkte von Spiegellinien, × eine spiegelbildliche Kopie ist erreichbar, ohne eine Spiegellinie zu überqueren, o nur Translationen';

/** Punktgruppe in der App „Stereographische Projektion“ (Achse c senkrecht zur Ebene). */
/** @type {Record<string, string>} */
const BRAVAIS = { mp: 'schiefwinklig primitiv', op: 'rechteckig primitiv', oc: 'rechteckig zentriert', tp: 'quadratisch primitiv', hp: 'hexagonal primitiv' };
/** @type {Record<string, string>} */
const URSPRUNG = { beliebig: 'beliebig', '21g': 'auf 2 1 g', '41g': 'auf 4 1 g' };
/** @param {string} u */
const ursprungHTML = (u) => (URSPRUNG[u] ? URSPRUNG[u].replace(/([mg])/g, '<i>$1</i>') : `auf ${lageHTML(u)}`);
/** Bedingungen der asymmetrischen Einheit als Knöpfe: Tafel A zeigt, wo sie erfüllt sind. @param {Ebenengruppe} d */
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
/** @param {string} t */
const aeHTML = (t) => t.replace(/([xy])/g, '<i>$1</i>').replace(/(\d+)\/(\d+)/g, (m) => /** @type {Record<string, string>} */ ({ '1/2': '½', '1/4': '¼', '1/3': '⅓', '2/3': '⅔' })[m] ?? m);

/** Fokus in den Kenndaten merken (über die Daten-Attribute des Knopfs), damit er ein Neuzeichnen übersteht. */
function fokusMerken() {
  const a = document.activeElement;
  if (!a || !$('info').contains(a)) return null;
  for (const attr of ['data-phase', 'data-abspielen', 'data-erkl-zu', 'data-erkl', 'data-wy']) {
    if (a.hasAttribute(attr)) return `[${attr}${a.getAttribute(attr) ? `="${CSS.escape(/** @type {string} */ (a.getAttribute(attr)))}"` : ''}]`;
  }
  return null;
}
/** @param {string | null} sel */
function fokusWiederherstellen(sel) {
  if (!sel) return;
  const el = /** @type {HTMLElement | null} */ ($('info').querySelector(sel));
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
  const koord = koordText(p);
  const fg = ['keiner', 'einer', 'zwei'][l.freiheitsgrade];
  const lagebox = !z.objekt ? '' : l.allgemein
    ? `<div class="lagebox"><strong>Allgemeine Lage ${d.wyckoff[0].n}<span class="wy">${l.buchstabe}</span></strong>, Objekt bei ${koord}
      <p>Keine Operation ausser der Identität hält das Objekt fest (Lagesymmetrie 1). Deshalb erscheint es ${l.zaehligkeit}-mal je Elementarzelle, so oft wie die Gruppe Operationen je Zelle hat.</p></div>`
    : `<div class="lagebox"><strong>Spezielle Lage ${l.zaehligkeit}<span class="wy">${l.buchstabe}</span>, Lagesymmetrie ${lageHTML(l.symbol)}</strong>, Objekt bei ${koord}
      <p>Das Objekt liegt auf einem Symmetrieelement. ${g.ordnung / l.zaehligkeit} der ${g.ordnung} Operationen je Zelle halten es fest; deshalb fallen je ${g.ordnung / l.zaehligkeit} Bilder zusammen, und es bleiben ${g.ordnung}/${g.ordnung / l.zaehligkeit} = ${l.zaehligkeit} Stellen je Zelle. Freie Parameter: ${fg}. Ein Objekt, das hier sitzen soll, muss selbst mindestens die Symmetrie ${lageHTML(l.symbol)} haben; das Fähnchen hat keine, darum überlagert es sich mit seinen Bildern.</p></div>`;
  // Operationen
  // Schritt für Schritt: Kasten und die Zeile der aktuellen Operation
  const schrittAn = schrittWirkt({ ...z, erkl: erklaerung ? z.erkl : null });
  const sd = schrittAn ? schrittDaten(g, ausgangsstelle(z.punkt, z.zellen), z.schritt) : null;
  const aktuell = sd && !sd.translationen ? sd.k - 1 : -1;
  const schrittbox = sd ? `<div class="warumbox schrittbox" id="schrittbox">${schrittHTML(d, sd, l, g.ordnung)}</div>` : '';
  /** @param {string[]} texte @param {string[]} ops @param {string} [z0] @param {number} [versatz] */
  const opsZeilen = (texte, ops, z0, versatz = 0) => ops.map((op, i) => `<tr${i + versatz === aktuell ? ' class="aktiv"' : ''}><td class="num">(${i + 1})</td><td>${koordHTML(d.ops[i])}${z0 ? ` + (${z0})` : ''}</td><td>${opHTML(texte[i])}</td></tr>`).join('');
  const opsTab = `<div class="tabwrap"><table class="itatab"><thead><tr><th>Nr.</th><th>Koordinaten</th><th>Symmetrieoperation</th></tr></thead><tbody>
    ${zentriert ? '<tr class="zent"><td colspan="3">für (0, 0)+</td></tr>' : ''}${opsZeilen(d.opsText, d.ops)}
    ${zentriert ? `<tr class="zent"><td colspan="3">für (½, ½)+</td></tr>${opsZeilen(/** @type {string[]} */ (d.zentrText), d.ops, '½, ½', d.ops.length)}` : ''}</tbody></table></div>`;
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
    : herkunftAktiv() ? `<div class="warumbox" id="warumbox"><h3>Herkunft der Elemente</h3><p>Ein Symmetrieelement im Symmetriegerüst antippen oder hier wählen: Es erscheint, aus welchen zwei Operationen es folgt.</p>${elementListe(g)}</div>` : ''}
    ${z.brechen ? `<div class="warumbox brechbox" id="brechbox">${brechHTML(d, z.frei, brechAnalyse(g, z.frei))}</div>` : ''}
    ${schrittbox}
    ${erklaerung ? '' : lagebox}
    <dl class="facts">
      <div><dt>Vollständiges Symbol</dt><dd>${symbolHTML(d.lang)}</dd></div>
      <div><dt>Kristallsystem</dt><dd>${SYSTEMNAMEN[d.system]}</dd></div>
      <div><dt>Bravais-Gitter</dt><dd>${BRAVAIS[d.bravais]} (${d.bravais})</dd></div>
      <div><dt>Punktgruppe</dt><dd>${pgLink} <span class="muted" title="Schoenflies-Symbol der Punktgruppe">(${schoenfliesHTML(d.punktgruppe)})</span></dd></div>
      <div><dt>Signatur nach Conway</dt><dd title="${CONWAY_HINWEIS}">${CONWAY[d.symbol]}</dd></div>
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
      <p class="note">In Klammern hinter der Punktgruppe steht ihr Symbol nach Schoenflies (für die Ebenengruppen selbst geben die International Tables keines an). Die Signatur nach Conway (Orbifold-Symbol, Conway, Burgiel und Goodman-Strauss, <i>The Symmetries of Things</i>) beschreibt dieselbe Symmetrie mit vier Merkmalen: * steht für Spiegellinien, Ziffern vor dem * für Drehpunkte, die auf keiner Spiegellinie liegen, Ziffern nach einem * für Schnittpunkte von Spiegellinien (Zahl der Linien), × dafür, dass man eine spiegelbildliche Kopie erreicht, ohne eine Spiegellinie zu überqueren, und o dafür, dass es nur Translationen gibt.</p>
    </details>`;
  fokusWiederherstellen(fokus);
}

// ------------------------------------------------------------------ Objekt setzen und ziehen
/** @param {Vec2} p @param {{ rasten?: boolean, toleranzPx?: number }} [optionen] */
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
  z.punkt = /** @type {Vec2} */ (q.map((v) => Math.min(Math.max(v, 0), n - 1e-9)));
  aktualisieren();
}

/** Bildpunkt (viewBox von Tafel A) unter dem Zeiger. @param {{ clientX: number, clientY: number }} e @returns {Vec2} */
function svgPunkt(e) {
  const svg = grafik('bild-a');
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const q = pt.matrixTransform(/** @type {DOMMatrix} */ (svg.getScreenCTM()).inverse());
  return [q.x, q.y];
}
/** @param {TouchEvent | MouseEvent} e */
function naheObjekt(e) {
  if (!z.objekt || !ansichtA) return false;
  const q = ansichtA.zuBild(ausgangsstelle(z.punkt, z.zellen));
  const t = /** @type {TouchEvent} */ (e).touches;
  const s = svgPunkt(t ? t[0] : /** @type {MouseEvent} */ (e));
  const w = grafik('bild-a').getBoundingClientRect().width;
  const r = coarse.matches ? Math.max(24, 26 * (520 / (w || 520))) : 22;
  // nahe am Fuss oder auf dem Objekt (im Gitter festgelegt, oft viel grösser als der Kreis um den Fuss)
  const [x0, y0, x1, y1] = OBJEKT_UMRISS; const dx = (s[0] - q[0]) / massObjektA; const dy = (s[1] - q[1]) / massObjektA;
  return Math.hypot(s[0] - q[0], s[1] - q[1]) < r || (dx >= x0 && dx <= x1 && dy >= y0 && dy <= y1);
}
/** Die in Tafel A sichtbaren Elemente (zeichnung.js), mit dem aktuellen Schritt im Aufbau. */
/** @param {Gruppe} g @param {number} [n] */
const sichtbareElemente = (g, n = z.zellen) => sichtbar(g, n, z.aufbau);

/** Element unter dem Zeiger wählen (Drehpunkte vor Linien), sonst die Auswahl aufheben. @param {PointerEvent} e */
function elementWaehlen(e) {
  if (!ansichtA) return;
  const s = svgPunkt(e);
  const g = gruppeVon(z.gruppe);
  const el = sichtbareElemente(g);
  const w = grafik('bild-a').getBoundingClientRect().width || 520;
  const r = (coarse.matches ? 22 : 12) * (520 / w);
  /** @type {{ dist: number, el: SichtbarerDrehpunkt | SichtbareLinie } | null} */
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
  if (z.erkl) { stoppeSchritte(); abspielen(); } else aktualisieren();
}

/** Knöpfe für die sichtbaren Elemente der Zelle, eines je Klasse modulo Gitter (auch für die Tastatur). @param {Gruppe} g */
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
    /** @type {Elementangabe} */
    const d = 'richtung' in e ? { typ: e.art, punkt: e.punkt, richtung: e.richtung } : { typ: 'dreh', n: e.n, punkt: e.punkt };
    knoepfe.push(`<li><button class="linkbtn" type="button" data-erkl="${elementSchluessel(e)}">${elementName(d)}</button></li>`);
  }
  return `<ul class="elemliste">${knoepfe.join('')}</ul>`;
}

/** Schritte der Erklärung nacheinander zeigen (0 → 3). */
/** @type {ReturnType<typeof setTimeout> | undefined} */
let ablauf;
/** Schritt für Schritt abspielen: alle Operationen nacheinander, zuletzt die Gittertranslationen. */
/** @type {ReturnType<typeof setTimeout> | undefined} */
let schrittAblauf;
function stoppeSchritte() { clearTimeout(schrittAblauf); schrittAblauf = undefined; }
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

let ziehen = false, bewegt = false;
/** Beim Ziehen: Fuss des Objekts minus Zeiger (Bildpunkte), damit das Objekt nicht zum Zeiger springt. @type {Vec2} */
let versatz = [0, 0];
/** @type {Vec2 | null} */
let start = null;

// ------------------------------------------------------------------ Selbst zeichnen
/** @type {Vec2[] | null} */
let strich = null; // Punkte des Strichs, der gerade gezeichnet wird (Bruchkoordinaten)
// Verlauf für „Rückgängig“: Stand der Striche vor jedem Strich und jedem Radieren (nur im Speicher)
/** @type {Vec2[][][]} */
const verlauf = [];
const merken = () => { verlauf.push(z.striche.map((st) => st.map((q) => /** @type {Vec2} */ ([...q])))); if (verlauf.length > 50) verlauf.shift(); };
/** @type {Vec2 | null} */
let radierStelle = null; // Bildpunkt des Radierers, solange gedrückt
let nurA = false;
/** Während des Zeichnens nur Tafel A neu zeichnen (das Muster folgt am Ende des Strichs). */
function zeichneA() {
  if (nurA) return;
  nurA = true;
  requestAnimationFrame(() => {
    nurA = false;
    const a = tafelAJetzt(farben());
    ansichtA = a.ansicht;
    // Radierer als Kreis an der Stelle des Zeigers
    grafik('bild-a').innerHTML = a.svg + (radierStelle ? `<circle cx="${radierStelle[0]}" cy="${radierStelle[1]}" r="${RADIER_PX}" fill="none" stroke="${farben().muted}" stroke-width="1.5" stroke-dasharray="3 2"/>` : '');
  });
}
/** Radius des Radierers in Pixeln der Tafel (520 breit). */
const RADIER_PX = 12;
/** Nur mit gezeichneter Tafel A aufgerufen. @param {PointerEvent} e */
function radierenAn(e) {
  const A = /** @type {Ansicht} */ (ansichtA);
  const q = svgPunkt(e);
  radierStelle = q;
  const g = gruppeVon(z.gruppe);
  const M = z.brechen ? metrikVon(z.frei) : metrikVon(z.gitter[systemJetzt()]);
  const H = z.brechen ? gebrochen(g, z.frei).H : g;
  z.striche = radieren(z.striche, H, M, A.vonBild(q), RADIER_PX / A.s);
  zeichneA();
}
/** @param {PointerEvent} e */
function strichBeginnen(e) {
  if (!ansichtA || z.striche.flat().length >= STRICH_GRENZE) return;
  merken();
  strich = [ansichtA.vonBild(svgPunkt(e))];
  z.striche.push(strich);
  grafik('bild-a').setPointerCapture(e.pointerId);
}
/** Nur während eines Strichs aufgerufen. @param {PointerEvent} e */
function strichWeiter(e) {
  const s = /** @type {Vec2[]} */ (strich);
  const p = /** @type {Ansicht} */ (ansichtA).vonBild(svgPunkt(e));
  const q = s[s.length - 1];
  if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.004 || z.striche.flat().length >= STRICH_GRENZE) return;
  s.push(p);
  zeichneA();
}
function strichBeenden() {
  if (radierStelle) { radierStelle = null; aktualisieren(); return; }
  if (!strich) return;
  const i = z.striche.indexOf(strich);
  const fertig = vereinfachen(strich);
  if (fertig.length >= 2) z.striche[i] = fertig; else z.striche.splice(i, 1);
  strich = null;
  aktualisieren();
}
function zeigerEinrichten() {
  const svg = grafik('bild-a');
  svg.addEventListener('touchstart', (e) => {
    if (z.modus === 'struktur') { sUI.touchstart(e); return; }
    if (z.zeichnen || z.radieren || naheObjekt(e)) e.preventDefault();
  }, { passive: false });
  svg.addEventListener('pointerdown', (e) => {
    bewegt = false;
    if (z.modus === 'struktur') { sUI.down(e); return; }
    if (z.zeichnen) { strichBeginnen(e); return; }
    if (z.radieren) { if (!ansichtA) return; merken(); grafik('bild-a').setPointerCapture(e.pointerId); radierenAn(e); return; }
    if (herkunftAktiv()) { elementWaehlen(e); return; }
    if (!z.objekt) return;
    start = [e.clientX, e.clientY];
    if (e.pointerType === 'mouse' || naheObjekt(e)) {
      ziehen = true;
      svg.setPointerCapture(e.pointerId);
      const sp = svgPunkt(e); const fuss = /** @type {Ansicht} */ (ansichtA).zuBild(ausgangsstelle(z.punkt, z.zellen));
      const nahe = naheObjekt(e);
      versatz = nahe ? [fuss[0] - sp[0], fuss[1] - sp[1]] : [0, 0];
      if (!nahe) setzePunkt(/** @type {Ansicht} */ (ansichtA).vonBild(sp));
    }
  });
  svg.addEventListener('pointermove', (e) => {
    if (sUI.move(e)) return;
    if (strich) { strichWeiter(e); return; }
    if (radierStelle) { radierenAn(e); return; }
    if (!ziehen) return;
    const s0 = /** @type {Vec2} */ (start); // beim Ziehen gesetzt
    if (!bewegt && Math.hypot(e.clientX - s0[0], e.clientY - s0[1]) < 3) return;
    bewegt = true;
    const sp = svgPunkt(e);
    setzePunkt(/** @type {Ansicht} */ (ansichtA).vonBild([sp[0] + versatz[0], sp[1] + versatz[1]]));
  });
  // nach dem Ziehen neu zeichnen, damit die Lupe dem losgelassenen Objekt folgt
  const loslassen = () => { const war = ziehen; ziehen = false; if (!sUI.up()) strichBeenden(); if (war && z.lupe) aktualisieren(); };
  svg.addEventListener('pointerup', loslassen);
  svg.addEventListener('pointercancel', loslassen);
  // Touch: Antippen setzt das Objekt an die Stelle
  svg.addEventListener('click', (e) => {
    if (z.modus === 'struktur' || (herkunftAktiv()) || z.zeichnen || z.radieren || !z.objekt || /** @type {PointerEvent} */ (e).pointerType === 'mouse' || bewegt || ziehen) return;
    const p = /** @type {Ansicht} */ (ansichtA).vonBild(svgPunkt(e));
    if (p.every((v) => v >= -0.02 && v <= z.zellen + 0.02)) setzePunkt(p);
  });
}

// ------------------------------------------------------------------ Ablauf
let geplant = false;
/** Erste Schritte des aktiven Modus zeigen, wenn er neu ist (gesetzt in init). */
let introAbgleichen = () => {};
function aktualisieren() {
  bedienungAbgleichen();
  sUI.abgleichen();
  introAbgleichen();
  if (geplant) return;
  geplant = true;
  requestAnimationFrame(() => {
    geplant = false;
    auswahlAbgleichen();
    zeichnen();
    speichern();
  });
}

/** @param {string} b */
function wyckoffSetzen(b) {
  z.punkt = punktAufLage(gruppeVon(z.gruppe), b, z.punkt);
  aktualisieren();
}

/** @param {string} id @param {Schalterfeld} feld */
function bindeSchalter(id, feld) {
  $(id).addEventListener('change', () => { z[feld] = eingabe(id).checked; aktualisieren(); });
}

function init() {
  baueAuswahl();
  sUI.init();
  exportKnoepfe();
  $('picker').addEventListener('click', (e) => {
    const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (e.target).closest('.pgb'));
    if (!b) return;
    if (z.gruppe !== b.dataset.g) { z.erkl = null; z.aeTeile = []; stoppeSchritte(); if (z.schritt > 0) z.schritt = 1; } // Abspielen rechnet mit der Zahl der Schritte der alten Gruppe
    z.gruppe = /** @type {string} */ (b.dataset.g); // jeder Knopf trägt data-g
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
  bindeSchalter('v-tapete', 'tapete');
  $('opt-zellen').addEventListener('change', () => {
    z.zellen = eingabe('opt-zellen').checked ? 2 : 1;
    if (z.zellen === 1) z.punkt = /** @type {Vec2} */ (z.punkt.map(mod1));
    aktualisieren();
  });
  elemente('#seg-form button, #seg-ornament button').forEach((b) => b.addEventListener('click', () => { z.form = /** @type {string} */ (b.dataset.form); aktualisieren(); }));
  for (const [k, i] of /** @type {[string, number][]} */ ([['x', 0], ['y', 1]])) {
    $(`obj-${k}`).addEventListener('input', () => {
      /** @type {Vec2} */
      const p = [...z.punkt]; p[i] = Number(eingabe(`obj-${k}`).value);
      setzePunkt(p, { rasten: false });
    });
  }
  $('reset-objekt').addEventListener('click', () => { z.punkt = startzustand().punkt; z.objGroesse = 1; aktualisieren(); });
  $('obj-groesse').addEventListener('input', () => { z.objGroesse = Number(eingabe('obj-groesse').value); aktualisieren(); });
  $('v-zoom').addEventListener('input', () => { z.zoomB = Number(eingabe('v-zoom').value); aktualisieren(); });
  for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
    $(`lat-${k}`).addEventListener('input', () => {
      const v = Number(eingabe(`lat-${k}`).value);
      if (z.brechen) z.frei = { ...z.frei, [k]: v }; else z.gitter[systemJetzt()][k] = grad(v); // grad() kennzeichnet nur
      aktualisieren();
    });
  }
  // zurücksetzen: Startmetrik des Systems, mit Bindung
  $('reset-gitter').addEventListener('click', () => { const s = systemJetzt(); z.brechen = false; z.gitter[s] = { ...GITTER_START[s] }; aktualisieren(); });
  // Alle Einträge „ebenen-…“ im Speicher ausser denen des Quiz löschen, ohne Hash neu laden (Leitfaden Abschn. 5.2)
  $('reset-alles').addEventListener('click', () => alleEinstellungenZuruecksetzen('ebenen'));
  $('info').addEventListener('click', (e) => {
    const ziel = /** @type {Element} */ (e.target);
    /** Knopf oder Link der Kenndaten, in dem der Klick lag. @param {string} sel */
    const naechstes = (sel) => /** @type {HTMLElement | null} */ (ziel.closest(sel));
    // Kenndaten „Gitter und Basis“: die gefundene Gruppe im Modus „Ebenengruppen“ öffnen
    const eg = naechstes('[data-zu-eg]');
    if (eg) {
      z.modus = 'eg'; z.gruppe = /** @type {string} */ (eg.dataset.zuEg); z.brechen = false; z.erkl = null; z.aeTeile = []; z.schritt = 0;
      aktualisieren(); window.scrollTo({ top: 0 }); return;
    }
    const b = naechstes('.setzen');
    if (b) wyckoffSetzen(/** @type {string} */ (b.dataset.wy));
    const at = naechstes('[data-aeteil]');
    if (at) {
      const i = Number(at.dataset.aeteil); const wahl = new Set(z.aeTeile ?? []);
      if (wahl.has(i)) wahl.delete(i); else wahl.add(i);
      z.aeTeile = [...wahl].sort((u, v) => u - v);
      aktualisieren();
    }
    if (naechstes('[data-aeteil-aus]')) { z.aeTeile = []; aktualisieren(); }
    const sch = naechstes('[data-schritt]');
    if (sch) { stoppeSchritte(); z.schritt = Number(sch.dataset.schritt); aktualisieren(); }
    if (naechstes('[data-schritt-abspielen]')) schritteAbspielen();
    if (naechstes('[data-schritt-zu]')) { stoppeSchritte(); z.schritt = 0; aktualisieren(); }
    const ph = naechstes('[data-phase]');
    if (ph) { clearTimeout(ablauf); phase = Number(ph.dataset.phase); aktualisieren(); }
    if (naechstes('[data-abspielen]')) abspielen();
    if (naechstes('[data-erkl-zu]')) { clearTimeout(ablauf); z.erkl = null; phase = 3; aktualisieren(); }
    const wahl = naechstes('[data-erkl]');
    if (wahl) { z.erkl = /** @type {string} */ (wahl.dataset.erkl); stoppeSchritte(); abspielen(); }
  });
  $('opt-brechen').addEventListener('change', () => {
    const s = systemJetzt();
    z.brechen = eingabe('opt-brechen').checked;
    if (z.brechen) {
      z.frei = { ...z.gitter[s] };
      z.erkl = null; z.aufbau = 0; z.schritt = 0; z.aeTeile = []; stoppeSchritte(); clearTimeout(ablauf); phase = 3;
    } else {
      // Bindung wieder an: die nächste Metrik des Systems (freie Parameter behalten, im Bereich)
      const g0 = { ...GITTER_START[s] };
      for (const k of FREI[s]) g0[k] = grad(Math.min(Math.max(z.frei[k], GITTER_BEREICH[k][0]), GITTER_BEREICH[k][1])); // grad() kennzeichnet nur
      z.gitter[s] = g0;
    }
    aktualisieren();
  });
  $('werkzeug-zeichnen').addEventListener('click', () => {
    z.zeichnen = !z.zeichnen;
    if (z.zeichnen) { z.radieren = false; z.erkl = null; clearTimeout(ablauf); phase = 3; stoppeSchritte(); }
    aktualisieren();
  });
  $('werkzeug-lupe').addEventListener('click', () => { z.lupe = !z.lupe; lupeBox = null; aktualisieren(); });
  $('werkzeug-radieren').addEventListener('click', () => {
    z.radieren = !z.radieren;
    if (z.radieren) { z.zeichnen = false; z.erkl = null; clearTimeout(ablauf); phase = 3; stoppeSchritte(); }
    aktualisieren();
  });
  // Rückgängig: den Stand vor dem letzten Strich oder Radieren; ohne Verlauf (nach dem Neuladen) den letzten Strich
  $('zeichnen-zurueck').addEventListener('click', () => { if (verlauf.length) z.striche = /** @type {Vec2[][]} */ (verlauf.pop()); else z.striche.pop(); aktualisieren(); });
  $('zeichnen-loeschen').addEventListener('click', () => { merken(); z.striche = []; aktualisieren(); });
  $('opt-fuell').addEventListener('change', () => { z.aeFuell = eingabe('opt-fuell').checked; aktualisieren(); });
  $('opt-warum').addEventListener('change', () => {
    z.warum = eingabe('opt-warum').checked;
    if (z.warum) stoppeSchritte();
    if (z.warum) { z.zeichnen = false; z.radieren = false; }
    if (!z.warum) { z.erkl = null; clearTimeout(ablauf); phase = 3; }
    aktualisieren();
  });
  $('opt-aufbau').addEventListener('change', () => { z.aufbau = eingabe('opt-aufbau').checked ? 1 : 0; aktualisieren(); });
  $('aufbau-schritt').addEventListener('input', () => { z.aufbau = Number(eingabe('aufbau-schritt').value); aktualisieren(); });
  $('opt-schritt').addEventListener('change', () => { stoppeSchritte(); z.schritt = eingabe('opt-schritt').checked ? 1 : 0; aktualisieren(); });
  $('schritt-regler').addEventListener('input', () => { stoppeSchritte(); z.schritt = Number(eingabe('schritt-regler').value); aktualisieren(); });
  $('schritt-zurueck').addEventListener('click', () => { stoppeSchritte(); z.schritt = Math.max(1, z.schritt - 1); aktualisieren(); });
  $('schritt-vor').addEventListener('click', () => { stoppeSchritte(); z.schritt = Math.min(gruppeVon(z.gruppe).ordnung + 1, z.schritt + 1); aktualisieren(); });
  $('schritt-abspielen').addEventListener('click', schritteAbspielen);
  $('aufbau-zurueck').addEventListener('click', () => { z.aufbau = Math.max(1, z.aufbau - 1); aktualisieren(); });
  $('aufbau-vor').addEventListener('click', () => { z.aufbau = Math.min(herkunft(gruppeVon(z.gruppe)).maxTiefe, z.aufbau + 1); aktualisieren(); });
  zeigerEinrichten();
  // Telefon: eine Tafel oben, Umschalter
  /** @param {string} fig */
  const tafelZeigen = (fig) => {
    document.body.dataset.fig = fig;
    elemente('.figswitch button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.fig === fig)));
  };
  elemente('.figswitch button').forEach((b) => b.addEventListener('click', () => tafelZeigen(b.dataset.fig ?? 'a')));
  // Erste Schritte je Modus: beim ersten Aufruf eines Modus, wegklickbar (× oder „?“), über „?“ wieder; nicht
  // für den Modus, in dem ein Link die App öffnet (für die Sitzung, nicht gespeichert). Gespeichert: die
  // gesehenen Modi (introGesehen in zustand.js).
  const INTRO = 'ebenen-intro';
  /** @type {Set<string>} */
  let gesehen = new Set();
  try { gesehen = introGesehen(localStorage.getItem(INTRO)); } catch { /* ohne Speicher weiter */ }
  /** @type {Set<string>} */
  const ueberLink = new Set(location.hash.length > 1 ? [z.modus] : []);
  /** @param {boolean} an */
  const intro = (an) => { $('intro').hidden = !an; $('help-open').setAttribute('aria-expanded', String(an)); };
  const introZu = () => {
    intro(false);
    gesehen.add(z.modus);
    try { localStorage.setItem(INTRO, [...gesehen].join(',')); } catch { /* ohne Speicher weiter */ }
  };
  /** @type {string | null} */
  let introModus = location.hash.length > 1 ? z.modus : null;
  introAbgleichen = () => {
    if (z.modus === introModus) return;
    introModus = z.modus;
    intro(!gesehen.has(z.modus) && !ueberLink.has(z.modus));
    elemente('.steps li.done').forEach((li) => li.classList.remove('done'));
  };
  $('intro-close').addEventListener('click', introZu);
  $('help-open').addEventListener('click', () => { if ($('intro').hidden) intro(true); else introZu(); });
  // Jeder Schritt zeigt am Telefon die Tafel, in der er wirkt (Symmetriegerüst bzw. Struktur)
  /** @param {number | string} n @param {() => void} f */
  const schritt = (n, f) => element(`[data-step="${n}"]`).addEventListener('click', () => {
    f(); tafelZeigen('a'); /** @type {HTMLElement} */ (element(`[data-step="${n}"]`).closest('li')).classList.add('done'); aktualisieren();
  });
  schritt(1, () => { z.gruppe = 'p4gm'; z.objekt = true; });
  schritt(2, () => { z.objekt = true; const w = ebenengruppe(z.gruppe).wyckoff.find((x) => /m/.test(x.sym) && x.koord[0].includes('x')); if (w) wyckoffSetzen(w.b); });
  schritt(3, () => { z.ae = true; });
  // Gitter und Basis: Dreiecksbeispiel pm → cm → p2mg (Konzept 3.2), das Dreieck im Zentrum gewählt
  schritt('s1', () => { sUI.vorgabeZeigen('dreieck1'); Object.assign(z.struktur, { elemente: true, zelle: true }); });
  schritt('s2', () => sUI.vorgabeZeigen('dreieck2', 1));
  schritt('s3', () => sUI.vorgabeZeigen('dreieck3', 1));
  schritt('s4', () => sUI.werkzeugSetzen('hinzufuegen'));
  $('copy-link').addEventListener('click', () => {
    const url = location.origin + location.pathname + location.search + hashVon(z);
    navigator.clipboard?.writeText(url);
  });
  initHelp({ tips: TIPS, sections: SECTIONS, labels: LABELS });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aktualisieren);
  $('app-version').innerHTML = `<a href="${REPO}">Version ${VERSION}</a>`;
  // Ist eine Erklärung aus Speicher oder Link aktiv, seinen Abschnitt aufklappen: Es sperrt
  // Zeichnen und Lupe und muss sich dort sichtbar ausschalten lassen (Leitfaden Abschn. 5.2)
  if (z.modus === 'eg' && (z.warum || z.aufbau > 0)) /** @type {HTMLDetailsElement} */ (element('#sec-aufbau')).open = true;
  if (z.modus === 'eg' && z.schritt > 0) /** @type {HTMLDetailsElement} */ (element('#sec-schritte')).open = true;
  aktualisieren();
}

init();
offline({ lokal: true, neuLaden: true });
