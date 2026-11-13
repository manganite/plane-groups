// Zoom und Verschieben der Tafeln (#162, Leitfaden Abschn. 5.1): Mausrad und Zwei-Finger-Geste über der Zeichnung,
// Knöpfe − / + / Einpassen im Kopf jeder Tafel; Tafel A zusätzlich verschieben: zwei Finger, Leertaste + Ziehen,
// Ziehen ins Leere (Werkzeug „Wählen und ziehen“, über struktur-ui.js) und Pfeiltasten, wenn die Zeichnung den Fokus hat.
// Zustand: z.zoomA, z.zoomB (Link und Speicher), z.ausschnitt[modus] (Mitte von Tafel A, nur im Speicher).

import { ZOOM_A_BEREICH, ZOOM_BEREICH } from './zustand.js';
import { $, knopf, grafik } from '../lib/common/js/seite.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Ansicht } from './zeichnung.js' */
/** @import { Zustand } from './zustand.js' */

/** Faktor je Klick auf − / + und je Tastendruck. */
export const ZOOM_SCHRITT = 1.25;
/** Bildmitte der Tafeln (viewBox 520 × 520). */
const MITTE = 260;

/**
 * Neuer Zoom im Bereich, auf 3 Stellen gerundet wie im Link (damit Link und Anzeige übereinstimmen).
 * @param {number} wert @param {[number, number]} bereich
 */
export const zoomBegrenzt = (wert, [lo, hi]) => Math.round(Math.min(hi, Math.max(lo, wert)) * 1000) / 1000;

/**
 * Mitte des neuen Ausschnitts in Bildpunkten der alten Ansicht, wenn um den Faktor f um den Punkt q (Bildpunkte)
 * gezoomt wird: q bleibt an seiner Stelle im Bild.
 * @param {Vec2} q @param {number} f @returns {Vec2}
 */
export const mitteNachZoom = (q, f) => [q[0] + (MITTE - q[0]) / f, q[1] + (MITTE - q[1]) / f];

/**
 * Mitte des neuen Ausschnitts in Bildpunkten der Ansicht zu Beginn einer Zwei-Finger-Geste: Der Punkt unter der
 * Fingermitte am Anfang (p0) liegt danach unter der Fingermitte jetzt (p), bei Vergrösserung f gegenüber dem Anfang.
 * @param {Vec2} p0 @param {Vec2} p @param {number} f @returns {Vec2}
 */
export const mitteNachGeste = (p0, p, f) => [p0[0] - (p[0] - MITTE) / f, p0[1] - (p[1] - MITTE) / f];

/**
 * Richtet Zoom und Verschieben ein.
 * @param {{
 *   z: Zustand,
 *   ansichtA: () => Ansicht | null,
 *   ruht: () => boolean,
 *   aktualisieren: () => void,
 *   svgPunkt: (e: { clientX: number, clientY: number }, svg?: SVGSVGElement) => Vec2,
 * }} o
 */
export function zoomEinrichten({ z, ansichtA, ruht, aktualisieren, svgPunkt }) {
  const bildA = grafik('bild-a'); const bildB = grafik('bild-b');
  /** Mitte von Tafel A im Modus setzen (Bruchkoordinaten), bei Zoom 1 keine. @param {Vec2 | null} p */
  const mitteSetzen = (p) => { z.ausschnitt = { ...z.ausschnitt, [z.modus]: z.zoomA > 1 ? p : null }; };

  /**
   * Tafel A um den Faktor f zoomen, um den Bildpunkt q (Standard: Bildmitte).
   * @param {number} f @param {Vec2} [q]
   */
  function zoomA(f, q = [MITTE, MITTE]) {
    const A = ansichtA();
    if (ruht() || !A) return;
    const neu = zoomBegrenzt(z.zoomA * f, ZOOM_A_BEREICH);
    if (neu === z.zoomA) return;
    const c = mitteNachZoom(q, neu / z.zoomA);
    z.zoomA = neu;
    mitteSetzen(A.vonBild(c));
    aktualisieren();
  }
  /** Tafel B um den Faktor f zoomen (um die Mitte der Zelle). @param {number} f */
  function zoomB(f) {
    const neu = zoomBegrenzt(z.zoomB * f, ZOOM_BEREICH);
    if (neu === z.zoomB) return;
    z.zoomB = neu;
    aktualisieren();
  }
  /** Tafel A verschieben: die Bildmitte um (dx, dy) Bildpunkte der Ansicht A0. @param {Ansicht} A0 @param {number} dx @param {number} dy */
  function verschieben(A0, dx, dy) {
    if (ruht() || z.zoomA <= 1) return;
    mitteSetzen(A0.vonBild([MITTE - dx, MITTE - dy]));
    aktualisieren();
  }

  // Knöpfe
  $('zoom-a-ein').addEventListener('click', () => zoomA(ZOOM_SCHRITT));
  $('zoom-a-aus').addEventListener('click', () => zoomA(1 / ZOOM_SCHRITT));
  $('zoom-a-passen').addEventListener('click', () => { z.zoomA = 1; mitteSetzen(null); aktualisieren(); });
  $('zoom-b-ein').addEventListener('click', () => zoomB(ZOOM_SCHRITT));
  $('zoom-b-aus').addEventListener('click', () => zoomB(1 / ZOOM_SCHRITT));
  $('zoom-b-passen').addEventListener('click', () => { z.zoomB = 1; aktualisieren(); });

  // Mausrad (auch Zwei-Finger-Geste auf dem Trackpad): Tafel A um den Zeiger, Tafel B um die Mitte
  /** @param {WheelEvent} e */
  const radFaktor = (e) => Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.002));
  bildA.addEventListener('wheel', (e) => {
    if (ruht()) return; // ruht: die Seite scrollt wie sonst
    e.preventDefault();
    zoomA(radFaktor(e), svgPunkt(e, bildA));
  }, { passive: false });
  bildB.addEventListener('wheel', (e) => { e.preventDefault(); zoomB(radFaktor(e)); }, { passive: false });

  // Zwei Finger (Touch): zoomen und in Tafel A verschieben; solange die Geste läuft, ruhen die übrigen Zeigeraktionen
  /** @type {{ tafel: 'a' | 'b', d0: number, p0: Vec2, zoom0: number, A0: Ansicht | null } | null} */
  let geste = null;
  /** @param {TouchEvent} e @param {SVGSVGElement} svg */
  const fingerMitte = (e, svg) => {
    const [t0, t1] = [e.touches[0], e.touches[1]];
    const p = svgPunkt({ clientX: (t0.clientX + t1.clientX) / 2, clientY: (t0.clientY + t1.clientY) / 2 }, svg);
    return { p, d: Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY) };
  };
  /** Finger bewegt: zoomen, in Tafel A auch verschieben. @param {TouchEvent} e */
  function fingerBewegt(e) {
    if (!geste || e.touches.length !== 2) return;
    e.preventDefault();
    const svg = geste.tafel === 'a' ? bildA : bildB;
    const { p, d } = fingerMitte(e, svg);
    const f = d / Math.max(1, geste.d0);
    if (geste.tafel === 'b') { const neu = zoomBegrenzt(geste.zoom0 * f, ZOOM_BEREICH); if (neu !== z.zoomB) { z.zoomB = neu; aktualisieren(); } return; }
    if (!geste.A0) return;
    z.zoomA = zoomBegrenzt(geste.zoom0 * f, ZOOM_A_BEREICH);
    mitteSetzen(geste.A0.vonBild(mitteNachGeste(geste.p0, p, z.zoomA / geste.zoom0)));
    aktualisieren();
  }
  /** @param {TouchEvent} e */
  const fingerWeg = (e) => { if (e.touches.length < 2) geste = null; };
  const gesteAbbrechen = () => { geste = null; };
  for (const [tafel, svg] of /** @type {['a' | 'b', SVGSVGElement][]} */ ([['a', bildA], ['b', bildB]])) {
    svg.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 2 || (tafel === 'a' && ruht())) return;
      e.preventDefault();
      const { p, d } = fingerMitte(e, svg);
      geste = { tafel, d0: d, p0: p, zoom0: tafel === 'a' ? z.zoomA : z.zoomB, A0: tafel === 'a' ? ansichtA() : null };
      // Touch-Ereignisse gehen an das Element, auf dem der Finger aufsetzte, auch wenn die Tafel es beim Neuzeichnen
      // entfernt; dann erreichen sie weder Tafel noch Dokument. Deshalb hört die Geste an diesen Elementen selbst.
      for (const t of e.touches) {
        const ziel = t.target;
        ziel.addEventListener('touchmove', /** @type {EventListener} */ (fingerBewegt), { passive: false });
        ziel.addEventListener('touchend', /** @type {EventListener} */ (fingerWeg));
        ziel.addEventListener('touchcancel', gesteAbbrechen); // gleiche Funktionen: kein Doppel bei einem zweiten Mal
      }
    }, { passive: false });
  }

  // Ziehen zum Verschieben (Leertaste + Ziehen, Ziehen ins Leere): Ansicht und Zeiger am Anfang
  /** @type {{ A0: Ansicht, q0: Vec2, id: number } | null} */
  let zug = null;
  /** Verschieben beginnen (pointerdown auf Tafel A). @param {PointerEvent} e @returns {boolean} begonnen */
  function zugBeginnen(e) {
    const A = ansichtA();
    if (!A || ruht() || z.zoomA <= 1) return false;
    // die Mitte festhalten, ehe sie vom Objekt oder Motiv abhängt (ein Tippen ins Leere hebt die Wahl auf)
    if (!z.ausschnitt[z.modus]) mitteSetzen(A.vonBild([MITTE, MITTE]));
    zug = { A0: A, q0: svgPunkt(e, bildA), id: e.pointerId };
    bildA.setPointerCapture(e.pointerId);
    document.body.classList.add('verschiebt');
    return true;
  }
  /** @param {PointerEvent} e @returns {boolean} verschoben */
  function zugBewegen(e) {
    if (!zug || e.pointerId !== zug.id) return false;
    const q = svgPunkt(e, bildA);
    verschieben(zug.A0, q[0] - zug.q0[0], q[1] - zug.q0[1]);
    return true;
  }
  /** @param {PointerEvent} e @returns {boolean} beendet */
  function zugEnde(e) {
    if (!zug || e.pointerId !== zug.id) return false;
    zug = null;
    document.body.classList.remove('verschiebt');
    return true;
  }

  // Leertaste: solange gedrückt und der Zeiger über Tafel A, verschiebt Ziehen den Ausschnitt (auch beim Zeichnen)
  let ueberA = false; let leertaste = false;
  bildA.addEventListener('pointerenter', () => { ueberA = true; });
  bildA.addEventListener('pointerleave', () => { ueberA = false; });
  // Liegt der Zeiger über Tafel A, gehört die Leertaste dem Verschieben, auch wenn ein Knopf den Fokus hat (Chrome lässt
  // ihn nach dem Klick dort); sonst nur, wenn Tafel A den Fokus hat. In Eingabefeldern nie.
  /** @param {EventTarget | null} t */
  const eingabefeld = (t) => t instanceof Element && !!t.closest('input, select, textarea, [contenteditable]');
  document.addEventListener('keydown', (e) => {
    if (e.key !== ' ' || eingabefeld(e.target) || !(ueberA || document.activeElement === bildA)) return;
    e.preventDefault(); // sonst scrollt die Seite
    if (!leertaste) { leertaste = true; document.body.classList.add('leertaste'); }
  });
  document.addEventListener('keyup', (e) => { if (e.key === ' ') { leertaste = false; document.body.classList.remove('leertaste'); } });
  window.addEventListener('blur', () => { leertaste = false; document.body.classList.remove('leertaste'); });

  // Tastatur, wenn Tafel A den Fokus hat: Pfeiltasten verschieben, + und − zoomen, 0 passt ein
  bildA.addEventListener('keydown', (e) => {
    const A = ansichtA();
    if (!A) return;
    const schritt = 520 / 8;
    /** @type {Record<string, () => void>} */
    const tasten = {
      ArrowLeft: () => verschieben(A, schritt, 0), ArrowRight: () => verschieben(A, -schritt, 0),
      ArrowUp: () => verschieben(A, 0, schritt), ArrowDown: () => verschieben(A, 0, -schritt),
      '+': () => zoomA(ZOOM_SCHRITT), '=': () => zoomA(ZOOM_SCHRITT), '-': () => zoomA(1 / ZOOM_SCHRITT),
      '0': () => { if (ruht()) return; z.zoomA = 1; mitteSetzen(null); aktualisieren(); },
    };
    const t = tasten[e.key];
    if (!t || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    t();
  });

  /** Knöpfe und Anzeige abgleichen (in bedienungAbgleichen). */
  function abgleichen() {
    const r = ruht();
    knopf('zoom-a-ein').disabled = r || z.zoomA >= ZOOM_A_BEREICH[1];
    knopf('zoom-a-aus').disabled = r || z.zoomA <= ZOOM_A_BEREICH[0];
    knopf('zoom-a-passen').disabled = r || z.zoomA === 1;
    $('zoom-a-wert').textContent = `${Math.round((r ? 1 : z.zoomA) * 100)} %`;
    knopf('zoom-b-ein').disabled = z.zoomB >= ZOOM_BEREICH[1];
    knopf('zoom-b-aus').disabled = z.zoomB <= ZOOM_BEREICH[0];
    knopf('zoom-b-passen').disabled = z.zoomB === 1;
    $('zoom-b-wert').textContent = `${Math.round(z.zoomB * 100)} %`;
  }

  return {
    abgleichen,
    /** Läuft eine Zwei-Finger-Geste? (dann ruhen Ziehen und Setzen) */
    geste: () => geste !== null,
    /** Leertaste gedrückt: Ziehen verschiebt. */
    leertaste: () => leertaste,
    zugBeginnen, zugBewegen, zugEnde,
  };
}
