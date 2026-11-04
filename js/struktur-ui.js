// Bedienung des Modus „Gitter und Basis“: Vorgaben, Motive setzen, ziehen, drehen; Gitter; Tafeln
// und Kenndaten (struktur.js). Der Zustand steht in z.struktur (zustand.js); Werkzeug, Auswahl und
// das gewählte Motiv gelten nur in dieser Sitzung.

import { VORGABEN } from './vorgaben.js';
import { MOTIVE } from './motive.js';
import { metrik, drehSymbol, elementeImBereich } from './zeichnung.js';
import { gruppe, mod1 } from './symmetrie.js';
import { strukturStart, wieVorgabe, STRUKTUR_BEREICH, BASIS_GRENZE, grad } from './zustand.js';
import { strukturTafelA, strukturTafelB, strukturHTML, motivFarben, strukturSymmetrie } from './struktur.js';
import { dezimal } from './text.js';

/** @import { Vec2, Grad } from '../lib/common/js/typen.js' */
/** @import { Zustand } from './zustand.js' */
/** @import { Ansicht, Farben } from './zeichnung.js' */
/** @import { Basiseintrag } from './motive.js' */
/** @import { Bestimmung } from './bestimmung.js' */
/** Vorlage für „Hinzufügen“ (groesse null: Grösse des Motivs). @typedef {{ motiv: string, farbe: number, winkel: Grad, groesse: number | null }} Vorlage */

const FARBNAMEN = ['Sorte 1', 'Sorte 2', 'Sorte 3', 'Sorte 4'];

/**
 * ctx: { z, $, farben(), aktualisieren(), svgPunkt(e), coarse }.
 * Rückgabe: Funktionen, die main.js aufruft.
 * @param {{ z: Zustand, $: (id: string) => HTMLElement, farben: () => Farben, aktualisieren: () => void,
 *   svgPunkt: (e: { clientX: number, clientY: number }) => Vec2, coarse: MediaQueryList }} ctx
 */
export function strukturUI({ z, $, farben, aktualisieren, svgPunkt, coarse }) {
  // Elemente der Seite (index.html), als Eingabefeld, Auswahlliste oder Knopf
  /** @param {string} id */
  const eingabe = (id) => /** @type {HTMLInputElement} */ ($(id));
  /** @param {string} id */
  const liste = (id) => /** @type {HTMLSelectElement} */ ($(id));
  /** @param {string} id */
  const knopf = (id) => /** @type {HTMLButtonElement} */ ($(id));
  let werkzeug = 'verschieben'; // oder 'hinzufuegen'
  /** @type {Vorlage} */
  let neu = { motiv: 'dreieck', farbe: 0, winkel: grad(0), groesse: null }; // Vorlage für „Hinzufügen“
  /** @type {number | null} */
  let auswahl = null; // Index in der Basis
  let rasten = true;
  /** @type {Ansicht | null} */
  let ansicht = null; // Ansicht von Tafel A (zuletzt gezeichnet)
  /** @type {Ansicht | null} */
  let fest = null; // eingefrorene Ansicht während des Ziehens
  /** @type {{ k: number, versatz: Vec2 } | null} */
  let zug = null; // { k, versatz }
  /** @type {string | undefined} */
  let letztes; // Symbol der letzten Zeichnung
  /** @type {string | null} */
  let vorher = null; // Symbol vor der letzten Änderung (für den Hinweis in den Kenndaten)
  const st = () => z.struktur;

  // ---------------------------------------------------------------- Aufbau der Bedienelemente
  function baue() {
    const gruppen = [...new Set(VORGABEN.map((v) => v.gruppe))];
    $('s-vorgabe').innerHTML = gruppen.map((g) => `<optgroup label="${g}">${VORGABEN.filter((v) => v.gruppe === g).map((v) => `<option value="${v.id}">${v.name}</option>`).join('')}</optgroup>`).join('')
      + '<option value="" disabled>eigene Struktur (verändert)</option>';
    $('s-motiv').innerHTML = Object.entries(MOTIVE).map(([k, d]) => `<option value="${k}">${d.name} (${d.symmetrie})</option>`).join('');
    $('s-farbe').innerHTML = FARBNAMEN.map((n, i) => `<button type="button" data-farbe="${i}" aria-pressed="false" aria-label="${n}" title="${n}"><i class="sw"></i></button>`).join('');
  }

  /** Der Eintrag, den die Regler bearbeiten: die Auswahl oder die Vorlage für „Hinzufügen“. @returns {Basiseintrag | Vorlage} */
  const ziel = () => (auswahl !== null && st().basis[auswahl] ? st().basis[auswahl] : neu);

  function abgleichen() {
    const s = st();
    if (auswahl !== null && !s.basis[auswahl]) auswahl = null;
    document.body.classList.toggle('modus-struktur', z.modus === 'struktur');
    $('tab-eg').setAttribute('aria-selected', String(z.modus === 'eg'));
    $('tab-struktur').setAttribute('aria-selected', String(z.modus === 'struktur'));
    if (z.modus !== 'struktur') return;
    liste('s-vorgabe').value = wieVorgabe(s) ? s.vorgabe : '';
    eingabe('s-elemente').checked = s.elemente;
    eingabe('s-zelle').checked = s.zelle;
    eingabe('s-ae').checked = s.ae;
    eingabe('s-bindungen').checked = s.bindungen;
    eingabe('s-zoom').value = String(z.zoomB);
    $('s-zoom-out').textContent = `${dezimal(z.zoomB, 2)} ×`;
    eingabe('s-einrasten').checked = rasten;
    for (const [id, w] of [['s-werkzeug-verschieben', 'verschieben'], ['s-werkzeug-hinzufuegen', 'hinzufuegen']]) $(id).setAttribute('aria-pressed', String(werkzeug === w));
    document.body.classList.toggle('hinzufuegen', werkzeug === 'hinzufuegen');
    const e = ziel();
    const f = motivFarben(farben());
    liste('s-motiv').value = e.motiv;
    $('s-farbe').querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.farbe) === (e.farbe ?? 0)));
      /** @type {HTMLElement} */ (b.querySelector('.sw')).style.background = f[Number(b.dataset.farbe)];
    });
    const winkel = ((e.winkel ?? 0) % 360 + 360) % 360;
    eingabe('s-winkel').value = String(winkel);
    $('s-winkel-out').textContent = `${dezimal(winkel, 1, { kuerzen: true })}°`;
    const gr = e.groesse ?? MOTIVE[e.motiv].groesse;
    eingabe('s-groesse').value = String(gr);
    $('s-groesse-out').textContent = dezimal(gr, 3);
    knopf('s-entfernen').disabled = auswahl === null;
    $('s-basis-titel').textContent = auswahl !== null ? `Gewähltes Motiv (Nr. ${auswahl + 1} von ${s.basis.length})` : 'Neues Motiv';
    $('s-basis-hint').textContent = werkzeug === 'hinzufuegen'
      ? (s.basis.length >= BASIS_GRENZE ? `Die Basis ist voll (${BASIS_GRENZE} Motive).` : 'Stelle in der Struktur antippen: Dort erscheint ein neues Motiv mit diesen Einstellungen; es lässt sich gleich weiterziehen.')
      : auswahl !== null ? 'Die Einstellungen gelten für das gewählte Motiv. Ziehen verschiebt es; ins Leere tippen hebt die Auswahl auf.'
        : 'Motiv in der Struktur antippen, um es zu wählen und zu ziehen. Mit dem Werkzeug „Hinzufügen“ kommen neue Motive dazu.';
    for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
      eingabe(`s-${k}`).min = String(STRUKTUR_BEREICH[k][0]); eingabe(`s-${k}`).max = String(STRUKTUR_BEREICH[k][1]);
      eingabe(`s-${k}`).value = String(s[k]);
    }
    $('s-ba-out').textContent = dezimal(s.ba, 2);
    $('s-gamma-out').textContent = `${dezimal(s.gamma, 1)}°`;
    knopf('s-zuruecksetzen').disabled = wieVorgabe(s);
  }

  // ---------------------------------------------------------------- Zeichnen
  /** @param {Farben} f @param {Bestimmung | null} r */
  function legende(f, r) {
    const items = [];
    items.push(`<span class="lg"><svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.line}" stroke-width="2"/></svg><span>gegebene Zelle <i>a</i>, <i>b</i></span></span>`);
    if (r && st().zelle) items.push(`<span class="lg"><svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.accent}" stroke-width="2.6"/></svg><span>konventionelle Zelle <i>a</i>′, <i>b</i>′</span></span>`);
    if (r && st().elemente) {
      const el = elementeImBereich(gruppe(r.symbol), 1);
      for (const n of [...new Set(el.drehpunkte.map((d) => d.n))].sort()) items.push(`<span class="lg"><svg class="sym-icon" width="22" height="22" viewBox="0 0 22 22">${drehSymbol(n, [11, 11], f.ink, f.paper)}</svg>${n}-zähliger Drehpunkt</span>`);
      const arten = new Set(el.linien.map((l) => l.art));
      /** @param {boolean} dash */
      const linie = (dash) => `<svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.ink}" stroke-width="${dash ? 2 : 2.8}" ${dash ? 'stroke-dasharray="6 4"' : 'stroke-linecap="round"'}/></svg>`;
      if (arten.has('spiegel')) items.push(`<span class="lg">${linie(false)}Spiegellinie</span>`);
      if (arten.has('gleit')) items.push(`<span class="lg">${linie(true)}Gleitspiegellinie</span>`);
    }
    if (r && st().ae) items.push(`<span class="lg"><i class="sw" style="background:${f.crystal}"></i>asymmetrische Einheit</span>`);
    items.push(werkzeug === 'hinzufuegen'
      ? '<span class="lg hint"><span class="only-fine">Stelle anklicken: neues Motiv</span><span class="only-coarse">Stelle antippen: neues Motiv</span></span>'
      : '<span class="lg hint">Motiv wählen und ziehen</span>');
    $('legend').innerHTML = items.join('');
  }

  /** @param {{ nurA?: boolean }} [optionen] */
  function zeichnen({ nurA = false } = {}) {
    const f = farben();
    const s = st();
    const a = strukturTafelA(s, { elemente: s.elemente, zelle: s.zelle, ae: s.ae, bindungen: s.bindungen, farben: false }, f, auswahl, fest);
    ansicht = a.ansicht;
    const r = a.ergebnis;
    if (r?.symbol !== letztes) { vorher = letztes ?? null; letztes = r?.symbol; }
    $('bild-a').innerHTML = a.svg;
    if (nurA) return;
    $('bild-b').innerHTML = strukturTafelB(s, f, r, z.zoomB).svg;
    legende(f, r);
    $('info').innerHTML = strukturHTML(s, r, vorher, f);
  }

  // ---------------------------------------------------------------- Zeiger
  /** Einrasten auf Vielfache von 1/12 der gegebenen Zelle (je Koordinate, mit Toleranz in Pixeln). @param {Vec2} p @returns {Vec2} */
  function raste(p) {
    if (!rasten || !ansicht) return p;
    const M = metrik(st());
    const tol = (coarse.matches ? 12 : 8) / (ansicht.s * Math.min(Math.hypot(...M.a), Math.hypot(...M.b)));
    return /** @type {Vec2} */ (p.map((v) => { const r = Math.round(v * 12) / 12; return Math.abs(v - r) < tol ? r : v; }));
  }
  /**
   * Motiv unter dem Zeiger (alle Gitterbilder in Tafel A): { k, bild } oder null. Nur mit einer Ansicht aufgerufen.
   * @param {Vec2} q @returns {{ d: number, k: number, bild: Vec2 } | null}
   */
  function treffer(q) {
    const A = /** @type {Ansicht} */ (ansicht);
    const w = $('bild-a').getBoundingClientRect().width || 520;
    /** @type {{ d: number, k: number, bild: Vec2 } | null} */
    let best = null;
    st().basis.forEach((e, k) => {
      const p0 = e.p.map(mod1);
      const r = Math.max(coarse.matches ? 22 * (520 / w) : 14, (e.groesse ?? MOTIVE[e.motiv].groesse) * A.s * 1.1);
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        /** @type {Vec2} */
        const p = [p0[0] + i, p0[1] + j];
        const b = A.zuBild(p);
        const d = Math.hypot(b[0] - q[0], b[1] - q[1]);
        if (d < r && (!best || d < best.d)) best = { d, k, bild: p };
      }
    });
    return /** @type {{ d: number, k: number, bild: Vec2 } | null} */ (best); // im forEach gesetzt
  }

  /** Touch: nur dann das Scrollen verhindern, wenn ein Motiv gezogen oder gesetzt wird. @param {TouchEvent} e */
  function touchstart(e) {
    if (!ansicht) return;
    if (werkzeug === 'hinzufuegen' || treffer(svgPunkt(e.touches[0]))) e.preventDefault();
  }
  /** @param {PointerEvent} e */
  function down(e) {
    if (!ansicht) return;
    const q = svgPunkt(e);
    const p = ansicht.vonBild(q);
    if (werkzeug === 'hinzufuegen') {
      if (st().basis.length >= BASIS_GRENZE) return;
      /** @type {Basiseintrag} */
      const e0 = { motiv: neu.motiv, farbe: neu.farbe, p: raste(p), winkel: neu.winkel };
      if (neu.groesse !== null) e0.groesse = neu.groesse;
      st().basis.push(e0);
      auswahl = st().basis.length - 1;
      zug = { k: auswahl, versatz: [0, 0] };
    } else {
      const t = treffer(q);
      if (!t) { auswahl = null; aktualisieren(); return; }
      auswahl = t.k;
      zug = { k: t.k, versatz: [t.bild[0] - p[0], t.bild[1] - p[1]] };
    }
    fest = ansicht;
    $('bild-a').setPointerCapture(e.pointerId);
    aktualisieren();
  }
  let rahmen = false;
  /** @param {PointerEvent} e */
  function move(e) {
    if (!zug) return false;
    const p = /** @type {Ansicht} */ (fest).vonBild(svgPunkt(e)); // beim Ziehen eingefroren
    st().basis[zug.k].p = raste([p[0] + zug.versatz[0], p[1] + zug.versatz[1]]);
    if (!rahmen) { rahmen = true; requestAnimationFrame(() => { rahmen = false; if (zug) { abgleichen(); zeichnen({ nurA: true }); } }); }
    return true;
  }
  function up() {
    if (!zug) return false;
    const e = st().basis[zug.k];
    e.p = /** @type {Vec2} */ (e.p.map((v) => (Math.abs(v - Math.round(v)) < 1e-12 ? 0 : mod1(v))));
    zug = null; fest = null;
    aktualisieren();
    return true;
  }

  // ---------------------------------------------------------------- Ereignisse
  function init() {
    baue();
    knopf('tab-struktur').disabled = false;
    $('tab-eg').addEventListener('click', () => { z.modus = 'eg'; aktualisieren(); });
    $('tab-struktur').addEventListener('click', () => { z.modus = 'struktur'; aktualisieren(); });
    $('s-vorgabe').addEventListener('change', () => {
      if (!liste('s-vorgabe').value) return;
      const alt = st();
      z.struktur = { ...strukturStart(liste('s-vorgabe').value), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
      auswahl = null; letztes = undefined; vorher = null;
      aktualisieren();
    });
    $('s-zuruecksetzen').addEventListener('click', () => {
      const alt = st();
      z.struktur = { ...strukturStart(alt.vorgabe), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
      auswahl = null; letztes = undefined; vorher = null;
      aktualisieren();
    });
    for (const [id, feld] of /** @type {[string, 'elemente' | 'zelle' | 'ae' | 'bindungen'][]} */ ([['s-elemente', 'elemente'], ['s-zelle', 'zelle'], ['s-ae', 'ae'], ['s-bindungen', 'bindungen']])) {
      $(id).addEventListener('change', () => { st()[feld] = eingabe(id).checked; aktualisieren(); });
    }
    $('s-zoom').addEventListener('input', () => { z.zoomB = Number(eingabe('s-zoom').value); aktualisieren(); });
    $('s-einrasten').addEventListener('change', () => { rasten = eingabe('s-einrasten').checked; aktualisieren(); });
    $('s-werkzeug-verschieben').addEventListener('click', () => { werkzeug = 'verschieben'; aktualisieren(); });
    $('s-werkzeug-hinzufuegen').addEventListener('click', () => {
      werkzeug = werkzeug === 'hinzufuegen' ? 'verschieben' : 'hinzufuegen';
      // die Vorlage übernimmt das gewählte Motiv
      if (werkzeug === 'hinzufuegen' && auswahl !== null) { const e = st().basis[auswahl]; neu = { motiv: e.motiv, farbe: e.farbe ?? 0, winkel: e.winkel ?? grad(0), groesse: e.groesse ?? null }; auswahl = null; }
      aktualisieren();
    });
    $('s-motiv').addEventListener('change', () => {
      const e = ziel();
      e.motiv = liste('s-motiv').value;
      if (e === neu) neu.groesse = null; else delete /** @type {Basiseintrag} */ (e).groesse;
      aktualisieren();
    });
    $('s-farbe').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-farbe]'));
      if (!b) return;
      ziel().farbe = Number(b.dataset.farbe);
      aktualisieren();
    });
    $('s-winkel').addEventListener('input', () => {
      let w = Number(eingabe('s-winkel').value);
      if (rasten) { const r = Math.round(w / 15) * 15; if (Math.abs(w - r) < 2.5) w = r; }
      ziel().winkel = grad(w % 360);
      aktualisieren();
    });
    $('s-groesse').addEventListener('input', () => { ziel().groesse = Number(eingabe('s-groesse').value); aktualisieren(); });
    $('s-entfernen').addEventListener('click', () => {
      if (auswahl === null) return;
      st().basis.splice(auswahl, 1);
      auswahl = null;
      aktualisieren();
    });
    for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
      $(`s-${k}`).addEventListener('input', () => { st()[k] = grad(Number(eingabe(`s-${k}`).value)); aktualisieren(); });
    }
    $('s-metrik').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-metrik]'));
      if (!b) return;
      const [ba, gamma] = /** @type {string} */ (b.dataset.metrik).split(',').map(Number);
      Object.assign(st(), { ba, gamma });
      aktualisieren();
    });
  }

  /**
   * Vorgabe laden wie über die Auswahl, Anzeigen behalten, ein Motiv wählen (Erste Schritte). Anders als
   * die Auswahl bleibt das Symbol davor stehen, damit die Kenndaten die Änderung nennen.
   * @param {string} id Vorgabe @param {number | null} [k] Index des gewählten Motivs
   */
  function vorgabeZeigen(id, k = null) {
    const alt = st();
    z.modus = 'struktur';
    z.struktur = { ...strukturStart(id), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
    werkzeug = 'verschieben';
    auswahl = k;
  }
  /** Werkzeug über der Struktur setzen. @param {'verschieben' | 'hinzufuegen'} w */
  function werkzeugSetzen(w) { werkzeug = w; if (w === 'hinzufuegen') auswahl = null; }

  /** Tafel A oder B in den Farben f, ohne Markierung der Auswahl (Bildexport). @param {Farben} f @param {string} tafel */
  function bild(f, tafel) {
    const s = st();
    if (tafel === 'b') return strukturTafelB(s, f, strukturSymmetrie(s), z.zoomB).svg;
    return strukturTafelA(s, { elemente: s.elemente, zelle: s.zelle, ae: s.ae, bindungen: s.bindungen, farben: false }, f, null, ansicht).svg;
  }

  return { init, abgleichen, zeichnen, bild, touchstart, down, move, up, vorgabeZeigen, werkzeugSetzen };
}
