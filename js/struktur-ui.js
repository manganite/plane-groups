// Bedienung des Modus „Gitter und Basis“: Vorgaben, Motive setzen, ziehen, drehen; Gitter; „Symmetrie
// festhalten“ (#121); Tafeln und Kenndaten (struktur.js). Der Zustand steht in z.struktur (zustand.js);
// Werkzeug, Auswahl und das gewählte Motiv gelten nur in dieser Sitzung.
//
// Mit festgehaltener Gruppe ist z.struktur.basis je Bahn ein Vertreter (bahnen.js). Gewählt ist dann ein
// Bild: Vertreter k und Operation op (Nummer in g.alle); Regler zeigen das Bild, Änderungen und Ziehen
// gehen über die Umkehroperation an den Vertreter (CLAUDE.md, „Symmetrie festhalten“).

import { VORGABEN } from './vorgaben.js';
import { MOTIVE, chiral } from './motive.js';
import { metrik, drehSymbol, elementeImBereich, grad } from './zeichnung.js';
import { gruppe, mod1, lage } from './symmetrie.js';
import { strukturStart, wieVorgabe, STRUKTUR_BEREICH, BASIS_GRENZE, bahnGewicht, FREI } from './zustand.js';
import { bilderMitOperation, bildUnter, vertreterVon, vertreter, umrechnen, darstellbar, passtNichtZurLage } from './bahnen.js';
import { strukturTafelA, strukturTafelB, strukturHTML, motivFarben, strukturSymmetrie, istGegeben, zellText } from './struktur.js';
import { EBENENGRUPPEN, SYSTEME } from './ebenengruppen.js';
import { symbolHTML, lageHTML, koordText } from './text.js';
import { dezimal } from './text.js';
import { $, eingabe, auswahl, knopf, grafik, element, elemente, modusTabs } from '../lib/common/js/seite.js';

/** @import { Vec2, Grad } from '../lib/common/js/typen.js' */
/** @import { Zustand } from './zustand.js' */
/** @import { Ansicht, Farben } from './zeichnung.js' */
/** @import { Basiseintrag } from './motive.js' */
/** @import { Bestimmung } from './bestimmung.js' */
/** Vorlage für „Hinzufügen“ (groesse null: Grösse des Motivs). @typedef {{ motiv: string, farbe: number, winkel: Grad, groesse: number | null, spiegel?: true }} Vorlage */

const FARBNAMEN = ['Sorte 1', 'Sorte 2', 'Sorte 3', 'Sorte 4'];

/**
 * ctx: { z, farben(), aktualisieren(), svgPunkt(e), coarse }.
 * Rückgabe: Funktionen, die main.js aufruft.
 * @param {{ z: Zustand, farben: () => Farben, aktualisieren: () => void,
 *   svgPunkt: (e: { clientX: number, clientY: number }) => Vec2, coarse: MediaQueryList }} ctx
 */
export function strukturUI({ z, farben, aktualisieren, svgPunkt, coarse }) {
  let werkzeug = 'verschieben'; // oder 'hinzufuegen'
  /** @type {Vorlage} */
  let neu = { motiv: 'dreieck', farbe: 0, winkel: grad(0), groesse: null }; // Vorlage für „Hinzufügen“
  /** @type {number | null} */
  let gewaehlt = null; // Index des gewählten Motivs in der Basis (mit festgehaltener Gruppe: des Vertreters)
  let gewaehltOp = 0; // mit festgehaltener Gruppe: Nummer der Operation des gewählten Bildes in g.alle
  /** @type {string} */
  let umstellung = ''; // Hinweis nach der Übernahme einer Gruppe mit anderer Zelle (bis zur nächsten Übernahme oder Wahl)
  let rasten = true;
  /** @type {Ansicht | null} */
  let ansicht = null; // Ansicht von Tafel A (zuletzt gezeichnet)
  /** @type {Ansicht | null} */
  let fest = null; // eingefrorene Ansicht während des Ziehens
  /** @type {{ k: number, op: number, versatz: Vec2 } | null} */
  let zug = null; // { k, op, versatz }
  /** @type {string | undefined} */
  let letztes; // Symbol der letzten Zeichnung
  /** @type {string | null} */
  let vorher = null; // Symbol vor der letzten Änderung (für den Hinweis in den Kenndaten)
  const st = () => z.struktur;
  /** Festgehaltene Gruppe als Rechenobjekt oder null. */
  const festG = () => (z.struktur.festeGruppe ? gruppe(z.struktur.festeGruppe) : null);
  /**
   * Alle gezeichneten Motive mit Herkunft: Vertreter k und Operation op (ohne festgehaltene Gruppe: jedes Motiv
   * mit op 0, der Identität).
   * @returns {{ bild: Basiseintrag, k: number, op: number }[]}
   */
  function motive() {
    const g = festG();
    if (!g) return st().basis.map((bild, k) => ({ bild, k, op: 0 }));
    const M = metrik(st());
    return st().basis.flatMap((e, k) => bilderMitOperation(g, M, e).map((b) => ({ ...b, k })));
  }
  /** Gezeichnete Struktur: mit festgehaltener Symmetrie die Bahnen der Vertreter ausgeschrieben. */
  const gezeigt = () => ({ ...st(), basis: motive().map((m) => m.bild) });
  /** Ist für ein weiteres Motiv bzw. eine weitere Bahn Platz (BASIS_GRENZE)? */
  const platz = () => (st().basis.length + 1) * bahnGewicht(st().festeGruppe) <= BASIS_GRENZE;
  /** Moduswahl als Tab-Muster (Leitfaden Abschn. 5.4); entsteht in init(). @type {{ markieren: (id: string) => void } | null} */
  let modi = null;

  // ---------------------------------------------------------------- Aufbau der Bedienelemente
  function baue() {
    const gruppen = [...new Set(VORGABEN.map((v) => v.gruppe))];
    $('s-vorgabe').innerHTML = gruppen.map((g) => `<optgroup label="${g}">${VORGABEN.filter((v) => v.gruppe === g).map((v) => `<option value="${v.id}">${v.name}</option>`).join('')}</optgroup>`).join('')
      + '<option value="" disabled>eigene Struktur (verändert)</option>';
    $('s-motiv').innerHTML = Object.entries(MOTIVE).map(([k, d]) => `<option value="${k}">${d.name} (${d.symmetrie})</option>`).join('');
    $('s-farbe').innerHTML = FARBNAMEN.map((n, i) => `<button type="button" data-farbe="${i}" aria-pressed="false" aria-label="${n}" title="${n}"><i class="sw"></i></button>`).join('');
  }

  /** Das gewählte Bild (mit festgehaltener Gruppe) bzw. Motiv, sonst null. @returns {Basiseintrag | null} */
  function gewaehltesBild() {
    if (gewaehlt === null || !st().basis[gewaehlt]) return null;
    const g = festG();
    return g ? bildUnter(g.alle[gewaehltOp], metrik(st()), st().basis[gewaehlt]) : st().basis[gewaehlt];
  }
  /** Was die Regler zeigen: das gewählte Bild bzw. Motiv oder die Vorlage für „Hinzufügen“. @returns {Basiseintrag | Vorlage} */
  const ziel = () => gewaehltesBild() ?? neu;
  /**
   * Eine Änderung an dem, was die Regler zeigen. Mit festgehaltener Gruppe wird das gewählte Bild geändert und
   * über die Umkehroperation zum Vertreter zurückgerechnet; die Lage des Vertreters bleibt.
   * @param {(e: Basiseintrag | Vorlage) => void} aenderung
   */
  function aendern(aenderung) {
    const g = festG();
    if (!g || gewaehlt === null || !st().basis[gewaehlt]) { aenderung(ziel()); return; }
    const b = /** @type {Basiseintrag} */ (gewaehltesBild());
    aenderung(b);
    st().basis[gewaehlt] = { ...vertreterVon(g.alle[gewaehltOp], metrik(st()), b), p: st().basis[gewaehlt].p };
  }
  /** Nummer des gewählten Bildes in der gezeichneten Liste (für die Markierung) oder null. */
  const gewaehltGezeichnet = () => {
    if (gewaehlt === null) return null;
    const i = motive().findIndex((m) => m.k === gewaehlt && m.op === (festG() ? gewaehltOp : 0));
    return i < 0 ? null : i;
  };

  function abgleichen() {
    const s = st();
    if (gewaehlt !== null && !s.basis[gewaehlt]) gewaehlt = null;
    document.body.classList.toggle('modus-struktur', z.modus === 'struktur');
    modi?.markieren(z.modus === 'struktur' ? 'tab-struktur' : 'tab-eg');
    if (z.modus !== 'struktur') return;
    auswahl('s-vorgabe').value = wieVorgabe(s) ? s.vorgabe : '';
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
    auswahl('s-motiv').value = e.motiv;
    $('s-farbe').querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.farbe) === (e.farbe ?? 0)));
      /** @type {HTMLElement} */ (b.querySelector('.sw')).style.background = f[Number(b.dataset.farbe)];
    });
    const winkel = ((e.winkel ?? 0) % 360 + 360) % 360;
    eingabe('s-winkel').value = String(winkel);
    $('s-winkel-out').textContent = `${dezimal(winkel, 1, { kuerzen: true })}°`;
    // gespiegelt: nur bei chiralen Motiven, sonst gesperrt (das Spiegelbild wäre dasselbe Motiv)
    const spiegelbar = chiral(e.motiv);
    eingabe('s-spiegel').checked = Boolean(e.spiegel);
    eingabe('s-spiegel').disabled = !spiegelbar;
    element('#row-spiegel .why').textContent = spiegelbar ? '' : 'nur bei Motiven ohne Spiegellinie (Fähnchen, Windräder)';
    const gr = e.groesse ?? MOTIVE[e.motiv].groesse;
    eingabe('s-groesse').value = String(gr);
    $('s-groesse-out').textContent = dezimal(gr, 3);
    knopf('s-entfernen').disabled = gewaehlt === null;
    $('s-basis-titel').textContent = gewaehlt === null ? 'Neues Motiv'
      : s.festeGruppe ? `Gewähltes Motiv (Bahn ${gewaehlt + 1} von ${s.basis.length})` : `Gewähltes Motiv (Nr. ${gewaehlt + 1} von ${s.basis.length})`;
    $('s-basis-hint').textContent = werkzeug === 'hinzufuegen'
      ? (!platz() ? `Die Basis ist voll (höchstens ${BASIS_GRENZE} Motive${s.festeGruppe ? ', jede Bahn zählt mit der Zähligkeit der allgemeinen Lage' : ''}).` : 'Stelle in der Struktur antippen: Dort erscheint ein neues Motiv mit diesen Einstellungen; es lässt sich gleich weiterziehen.')
      : gewaehlt !== null ? (s.festeGruppe
        ? 'Die Einstellungen gelten für das gewählte Motiv und seine ganze Bahn. Ziehen verschiebt die Bahn; ins Leere tippen hebt die Auswahl auf.'
        : 'Die Einstellungen gelten für das gewählte Motiv. Ziehen verschiebt es; ins Leere tippen hebt die Auswahl auf.')
        : 'Motiv in der Struktur antippen, um es zu wählen und zu ziehen. Mit dem Werkzeug „Hinzufügen“ kommen neue Motive dazu.';
    for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
      eingabe(`s-${k}`).min = String(STRUKTUR_BEREICH[k][0]); eingabe(`s-${k}`).max = String(STRUKTUR_BEREICH[k][1]);
      eingabe(`s-${k}`).value = String(s[k]);
    }
    $('s-ba-out').textContent = dezimal(s.ba, 2);
    $('s-gamma-out').textContent = `${dezimal(s.gamma, 1)}°`;
    // mit festgehaltener Gruppe folgt das Gitter dem Kristallsystem: nur die freien Parameter (wie im Modus „Ebenengruppen“)
    const frei = s.festeGruppe ? FREI[systemVon(s.festeGruppe)] : ['ba', 'gamma'];
    eingabe('s-ba').disabled = !frei.includes('ba');
    eingabe('s-gamma').disabled = !frei.includes('gamma');
    $('s-metrik').querySelectorAll('button').forEach((b) => { /** @type {HTMLButtonElement} */ (b).disabled = Boolean(s.festeGruppe); });
    $('s-gitter-hint').textContent = s.festeGruppe
      ? `Symmetrie festgehalten (${s.festeGruppe}): Das Gitter folgt dem Kristallsystem (${SYSTEME[systemVon(s.festeGruppe)].name}); frei ist nur, was das System erlaubt.`
      : 'Die Motive behalten ihre Lage in Bruchkoordinaten und ihre Form. Die Symmetrie folgt aus Gitter und Basis zusammen.';
    knopf('s-zuruecksetzen').disabled = wieVorgabe(s);
    festAbgleichen();
  }

  // ---------------------------------------------------------------- Symmetrie festhalten
  /** System einer Ebenengruppe. @param {string} sym */
  const systemVon = (sym) => /** @type {import('./ebenengruppen.js').Ebenengruppe} */ (EBENENGRUPPEN.find((d) => d.symbol === sym)).system;
  /**
   * Gitter im System einer Gruppe: die freien Parameter bleiben (im Bereich der Regler), die übrigen nach dem System.
   * @param {{ ba: number, gamma: number }} gi @param {string} sym @returns {{ ba: number, gamma: Grad }}
   */
  function gitterImSystem(gi, sym) {
    const sys = systemVon(sym);
    if (sys === 'schiefwinklig') return { ba: gi.ba, gamma: grad(gi.gamma) };
    if (sys === 'rechteckig') return { ba: gi.ba, gamma: grad(90) };
    return { ba: 1, gamma: grad(sys === 'hexagonal' ? 120 : 90) };
  }
  /**
   * Struktur mit festgehaltener Gruppe sym aus den gezeichneten Motiven: Gitter nach dem System, je Bahn ein Vertreter.
   * null, wenn die Grenze überschritten würde.
   * @param {string} sym
   */
  function mitGruppe(sym) {
    const gi = gitterImSystem(st(), sym);
    const g = gruppe(sym);
    const basis = vertreter(g, metrik(gi), gezeigt().basis);
    return basis.length * g.ordnung <= BASIS_GRENZE ? { ...gi, basis, festeGruppe: sym } : null;
  }
  /**
   * Übernahme der bestimmten Gruppe: falls nötig umgerechnet auf konventionelle Zelle und Ursprung nach ITA, dann
   * je Bahn ein Vertreter. Ergebnis mit dem Hinweis zur Umstellung, oder { grund }, wenn es nicht geht.
   * @returns {{ struktur: { ba: number, gamma: Grad, basis: Basiseintrag[], festeGruppe: string }, hinweis: string } | { grund: string }}
   */
  function uebernahme() {
    const s0 = gezeigt();
    const r = strukturSymmetrie(s0);
    if (!r) return { grund: 'Die Basis ist leer.' };
    let u = { ba: s0.ba, gamma: s0.gamma, basis: s0.basis };
    let hinweis = '';
    if (!istGegeben(r)) {
      u = umrechnen(s0, r);
      if (!darstellbar(u, STRUKTUR_BEREICH)) return { grund: 'Die konventionelle Zelle der bestimmten Gruppe liesse sich mit den Reglern nicht darstellen (Gitter oder Grösse eines Motivs ausserhalb des Bereichs).' };
      const zelle = zellText(r.zelle);
      hinweis = `Die Struktur wurde auf die konventionelle Zelle nach ITA umgestellt${zelle ? ` (${zelle} der vorherigen Zelle)` : ''}${Math.hypot(...r.ursprung) > 1e-9 ? `, Ursprung bei ${koordText(r.ursprung)}` : ''}; das Bild ist dabei gedreht.`;
    }
    const g = gruppe(r.symbol);
    const basis = vertreter(g, metrik(u), u.basis);
    if (basis.length * g.ordnung > BASIS_GRENZE) return { grund: `Mit festgehaltener Symmetrie wären es mehr als ${BASIS_GRENZE} Motive (jede Bahn zählt mit der Zähligkeit der allgemeinen Lage).` };
    return { struktur: { ba: u.ba, gamma: u.gamma, basis, festeGruppe: r.symbol }, hinweis };
  }
  /** Auswahl zurücksetzen (die Nummern der Basis ändern sich). */
  const auswahlAufheben = () => { gewaehlt = null; gewaehltOp = 0; };

  /** Zwischenspeicher für festAbgleichen(): Übernahme und gesperrte Gruppen hängen nur von der Struktur ab. */
  /** @type {{ schluessel: string, ue: ReturnType<typeof uebernahme> | null, gesperrt: Set<string> } | null} */
  let merker = null;
  function festAbgleichen() {
    const s = st();
    // beim Ziehen nichts neu rechnen (die Bestimmung läuft schon für die Tafel; die Knöpfe ändern sich danach)
    if (zug) return;
    const schluessel = JSON.stringify([s.ba, s.gamma, s.basis, s.festeGruppe]);
    if (merker?.schluessel !== schluessel) {
      merker = { schluessel, ue: uebernahme(), gesperrt: new Set(s.festeGruppe ? EBENENGRUPPEN.map((d) => d.symbol).filter((sym) => sym !== s.festeGruppe && !mitGruppe(sym)) : []) };
    }
    const an = Boolean(s.festeGruppe);
    eingabe('s-fest').checked = an;
    const r = strukturSymmetrie(gezeigt());
    // Einschalten übernimmt die bestimmte Gruppe; nur möglich, wenn die Übernahme geht
    const u = an ? null : merker.ue;
    const einGrund = u && 'grund' in u ? u.grund : '';
    eingabe('s-fest').disabled = !an && Boolean(einGrund);
    element('#row-sfest .why').textContent = !an && einGrund ? einGrund : '';
    // Gruppenwahl: nur mit festgehaltener Symmetrie; gesperrt, wo die Grenze überschritten würde
    let grenze = false;
    elemente('#s-picker .pgb').forEach((b) => {
      const sym = /** @type {string} */ (/** @type {HTMLElement} */ (b).dataset.g);
      const gewaehltG = sym === s.festeGruppe;
      b.setAttribute('aria-pressed', String(gewaehltG));
      const zuViel = an && merker !== null && merker.gesperrt.has(sym);
      if (zuViel) grenze = true;
      /** @type {HTMLButtonElement} */ (b).disabled = !an || zuViel;
    });
    // Übernehmen: nur, wenn die bestimmte Gruppe eine andere ist
    const anders = an && r && r.symbol !== s.festeGruppe;
    const ue = anders ? merker.ue : null;
    knopf('s-uebernehmen').disabled = !anders || Boolean(ue && 'grund' in ue);
    knopf('s-uebernehmen').innerHTML = anders && r ? `Bestimmte Gruppe ${symbolHTML(r.symbol)} übernehmen` : 'Bestimmte Gruppe übernehmen';
    $('s-fest-hint').innerHTML = !an ? 'Einschalten hält die bestimmte Gruppe fest; dann erscheint jedes gesetzte Motiv mit seiner ganzen Bahn.'
      : [umstellung, ue && 'grund' in ue ? ue.grund : '', grenze ? `Gesperrte Gruppen: mehr als ${BASIS_GRENZE} Motive.` : ''].filter(Boolean).join(' ');
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
    const gz = gezeigt(); // Bahnen einmal ausschreiben, für beide Tafeln und die Kenndaten
    const a = strukturTafelA(gz, { elemente: s.elemente, zelle: s.zelle, ae: s.ae, bindungen: s.bindungen, farben: false }, f, gewaehltGezeichnet(), fest);
    ansicht = a.ansicht;
    const r = a.ergebnis;
    if (r?.symbol !== letztes) { vorher = letztes ?? null; letztes = r?.symbol; }
    grafik('bild-a').innerHTML = a.svg;
    if (nurA) return;
    grafik('bild-b').innerHTML = strukturTafelB(gz, f, r, z.zoomB).svg;
    legende(f, r);
    $('info').innerHTML = strukturHTML(gz, r, vorher, f, festHinweis(r));
  }

  /**
   * Hinweis der Kenndaten mit festgehaltener Gruppe (CLAUDE.md, „Symmetrie festhalten“): Weicht die Bestimmung ab,
   * entweder kleiner (die eigene Symmetrie eines Motivs passt nicht zu seiner Lage) oder grösser (zufällige
   * Zusatzsymmetrie durch Gitter oder Lagen). Ohne Abweichung: welche Gruppe festgehalten ist.
   * @param {Bestimmung | null} r @returns {string} HTML
   */
  function festHinweis(r) {
    const s = st(); const g = festG();
    if (!g || !s.festeGruppe || !r) return '';
    const M = metrik(s);
    const fg = symbolHTML(s.festeGruppe);
    const unpassend = s.basis.filter((e) => passtNichtZurLage(g, M, e));
    if (unpassend.length) {
      const liste = unpassend.map((e) => {
        const l = lage(g, e.p, 1e-4);
        return `${MOTIVE[e.motiv].name}${e.spiegel ? ' (gespiegelt)' : ''} (eigene Symmetrie ${lageHTML(MOTIVE[e.motiv].symmetrie)}) auf ${koordText(l.punkt)}, Wyckoff-Lage ${l.zaehligkeit} <span class="wy">${l.buchstabe}</span> mit Lagesymmetrie ${lageHTML(l.symbol)}`;
      }).join('; ');
      return `<div class="warumbox"><strong>Festgehalten ist ${fg}, die Struktur hat aber nur ${symbolHTML(r.symbol)}.</strong> Die eigene Symmetrie eines Motivs passt nicht zu seiner Lage: ${liste}. Ein Motiv auf einer speziellen Lage muss deren Lagesymmetrie haben, sonst verliert die Struktur diese Symmetrie.</div>`;
    }
    if (r.symbol !== s.festeGruppe) {
      return `<div class="warumbox"><strong>Festgehalten ist ${fg}, die Struktur hat aber ${symbolHTML(r.symbol)}.</strong> Sie hat mehr Symmetrie als festgehalten: zufällig, durch das Gitter oder die Lagen der Motive. „Bestimmte Gruppe übernehmen“ hält ${symbolHTML(r.symbol)} fest.</div>`;
    }
    return `<p class="note">Symmetrie festgehalten: ${fg}. Jedes Motiv erscheint mit seiner ganzen Bahn.</p>`;
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
   * Lage eines Vertreters einrasten: mit festgehaltener Gruppe zuerst auf spezielle Lagen (Toleranz in Pixeln wie
   * im Modus „Ebenengruppen“), sonst auf das 1/12-Raster. @param {Vec2} p @returns {Vec2}
   */
  function rasteVertreter(p) {
    const g = festG();
    if (!g || !rasten || !ansicht) return raste(p);
    const M = metrik(st());
    const tol = (coarse.matches ? 14 : 9) / (ansicht.s * Math.min(Math.hypot(...M.a), Math.hypot(...M.b)));
    const l = lage(g, p, tol);
    return l.allgemein ? raste(p) : [l.punkt[0] + Math.round(p[0] - l.punkt[0]), l.punkt[1] + Math.round(p[1] - l.punkt[1])];
  }
  /**
   * Motiv unter dem Zeiger (alle Gitterbilder in Tafel A): { k, op, bild } oder null; k und op wie in motive().
   * Nur mit einer Ansicht aufgerufen.
   * @param {Vec2} q @returns {{ d: number, k: number, op: number, bild: Vec2 } | null}
   */
  function treffer(q) {
    const A = /** @type {Ansicht} */ (ansicht);
    const w = grafik('bild-a').getBoundingClientRect().width || 520;
    /** @type {{ d: number, k: number, op: number, bild: Vec2 } | null} */
    let best = null;
    motive().forEach(({ bild: e, k, op }) => {
      const p0 = e.p.map(mod1);
      const r = Math.max(coarse.matches ? 22 * (520 / w) : 14, (e.groesse ?? MOTIVE[e.motiv].groesse) * A.s * 1.1);
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        /** @type {Vec2} */
        const p = [p0[0] + i, p0[1] + j];
        const b = A.zuBild(p);
        const d = Math.hypot(b[0] - q[0], b[1] - q[1]);
        if (d < r && (!best || d < best.d)) best = { d, k, op, bild: p };
      }
    });
    return /** @type {{ d: number, k: number, op: number, bild: Vec2 } | null} */ (best); // im forEach gesetzt
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
      if (!platz()) return;
      /** @type {Basiseintrag} */
      const e0 = { motiv: neu.motiv, farbe: neu.farbe, p: rasteVertreter(p), winkel: neu.winkel };
      if (neu.groesse !== null) e0.groesse = neu.groesse;
      if (neu.spiegel) e0.spiegel = true;
      st().basis.push(e0);
      gewaehlt = st().basis.length - 1; gewaehltOp = 0;
      zug = { k: gewaehlt, op: 0, versatz: [0, 0] };
    } else {
      const t = treffer(q);
      if (!t) { auswahlAufheben(); aktualisieren(); return; }
      gewaehlt = t.k; gewaehltOp = t.op;
      zug = { k: t.k, op: t.op, versatz: [t.bild[0] - p[0], t.bild[1] - p[1]] };
    }
    fest = ansicht;
    grafik('bild-a').setPointerCapture(e.pointerId);
    aktualisieren();
  }
  let rahmen = false;
  /** @param {PointerEvent} e */
  function move(e) {
    if (!zug) return false;
    const p = /** @type {Ansicht} */ (fest).vonBild(svgPunkt(e)); // beim Ziehen eingefroren
    /** @type {Vec2} */
    const ziel = [p[0] + zug.versatz[0], p[1] + zug.versatz[1]];
    const g = festG();
    if (g) {
      // gezogen wird ein Bild; der Vertreter folgt über die Umkehroperation, die ganze Bahn mit
      const e0 = st().basis[zug.k];
      const v = vertreterVon(g.alle[zug.op], metrik(st()), { ...bildUnter(g.alle[zug.op], metrik(st()), e0), p: ziel });
      e0.p = rasteVertreter(v.p);
    } else st().basis[zug.k].p = raste(ziel);
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
    modi = modusTabs(element('.tabs'), $('inhalt'));
    $('tab-eg').addEventListener('click', () => { z.modus = 'eg'; aktualisieren(); });
    $('tab-struktur').addEventListener('click', () => { z.modus = 'struktur'; aktualisieren(); });
    $('s-vorgabe').addEventListener('change', () => {
      if (!auswahl('s-vorgabe').value) return;
      const alt = st();
      z.struktur = { ...strukturStart(auswahl('s-vorgabe').value), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
      auswahlAufheben(); letztes = undefined; vorher = null; umstellung = '';
      aktualisieren();
    });
    $('s-zuruecksetzen').addEventListener('click', () => {
      const alt = st();
      z.struktur = { ...strukturStart(alt.vorgabe), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
      auswahlAufheben(); letztes = undefined; vorher = null; umstellung = '';
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
      if (werkzeug === 'hinzufuegen' && gewaehlt !== null) {
        const e = /** @type {Basiseintrag} */ (gewaehltesBild());
        neu = { motiv: e.motiv, farbe: e.farbe ?? 0, winkel: e.winkel ?? grad(0), groesse: e.groesse ?? null, ...(e.spiegel ? { spiegel: /** @type {true} */ (true) } : {}) };
        auswahlAufheben();
      }
      aktualisieren();
    });
    $('s-motiv').addEventListener('change', () => {
      aendern((e) => {
        e.motiv = auswahl('s-motiv').value;
        if (e === neu) neu.groesse = null; else delete /** @type {Basiseintrag} */ (e).groesse;
        // ein achirales Motiv ist gespiegelt dasselbe: das Feld entfällt (CLAUDE.md, „Symmetrie festhalten“)
        if (!chiral(e.motiv)) delete e.spiegel;
      });
      aktualisieren();
    });
    $('s-farbe').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-farbe]'));
      if (!b) return;
      aendern((e) => { e.farbe = Number(b.dataset.farbe); });
      aktualisieren();
    });
    $('s-winkel').addEventListener('input', () => {
      let w = Number(eingabe('s-winkel').value);
      if (rasten) { const r = Math.round(w / 15) * 15; if (Math.abs(w - r) < 2.5) w = r; }
      aendern((e) => { e.winkel = grad(w % 360); });
      aktualisieren();
    });
    $('s-spiegel').addEventListener('change', () => {
      aendern((e) => { if (eingabe('s-spiegel').checked && chiral(e.motiv)) e.spiegel = true; else delete e.spiegel; });
      aktualisieren();
    });
    $('s-groesse').addEventListener('input', () => { aendern((e) => { e.groesse = Number(eingabe('s-groesse').value); }); aktualisieren(); });
    $('s-entfernen').addEventListener('click', () => {
      if (gewaehlt === null) return;
      st().basis.splice(gewaehlt, 1);
      auswahlAufheben();
      aktualisieren();
    });
    for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
      $(`s-${k}`).addEventListener('input', () => {
        if (eingabe(`s-${k}`).disabled) return;
        st()[k] = grad(Number(eingabe(`s-${k}`).value));
        aktualisieren();
      });
    }
    festInit();
    $('s-metrik').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-metrik]'));
      if (!b || st().festeGruppe) return;
      const [ba, gamma] = /** @type {string} */ (b.dataset.metrik).split(',').map(Number);
      Object.assign(st(), { ba, gamma });
      aktualisieren();
    });
  }

  /** Struktur mit festgehaltener Gruppe übernehmen (Gitter, Vertreter, Gruppe), Anzeigen und Vorgabe bleiben. @param {{ ba: number, gamma: Grad, basis: Basiseintrag[], festeGruppe: string | null }} neuS */
  function setzeStruktur(neuS) {
    Object.assign(z.struktur, neuS);
    auswahlAufheben();
  }
  function festInit() {
    $('s-picker').innerHTML = [...new Set(EBENENGRUPPEN.map((d) => d.system))].map((sys) => `<div class="sysrow"><span class="sys">${SYSTEME[sys].name}</span><div class="btns">${
      EBENENGRUPPEN.filter((d) => d.system === sys).map((d) => `<button class="pgb" type="button" data-g="${d.symbol}" aria-pressed="false" title="Nr. ${d.nr}, Punktgruppe ${d.punktgruppe}">${symbolHTML(d.symbol)}</button>`).join('')
    }</div></div>`).join('');
    $('s-fest').addEventListener('change', () => {
      if (eingabe('s-fest').checked) {
        const u = uebernahme();
        if ('grund' in u) { eingabe('s-fest').checked = false; aktualisieren(); return; }
        setzeStruktur(u.struktur); umstellung = u.hinweis;
      } else {
        // ausschalten: die Bahnen werden ausgeschrieben, die Struktur bleibt
        setzeStruktur({ ba: st().ba, gamma: st().gamma, basis: gezeigt().basis, festeGruppe: null }); umstellung = '';
      }
      aktualisieren();
    });
    $('s-picker').addEventListener('click', (ev) => {
      const b = /** @type {HTMLButtonElement | null} */ (/** @type {Element} */ (ev.target).closest('.pgb'));
      if (!b || b.disabled || !st().festeGruppe || b.dataset.g === st().festeGruppe) return;
      const neuS = mitGruppe(/** @type {string} */ (b.dataset.g));
      if (!neuS) return;
      setzeStruktur(neuS); umstellung = '';
      aktualisieren();
    });
    $('s-uebernehmen').addEventListener('click', () => {
      const u = uebernahme();
      if ('grund' in u) return;
      setzeStruktur(u.struktur); umstellung = u.hinweis;
      aktualisieren();
    });
    // aus Link oder Speicher festgehalten: Abschnitt aufklappen
    if (st().festeGruppe) /** @type {HTMLDetailsElement} */ ($('sec-sfest')).open = true;
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
    gewaehlt = k; gewaehltOp = 0; umstellung = '';
  }
  /** Werkzeug über der Struktur setzen. @param {'verschieben' | 'hinzufuegen'} w */
  function werkzeugSetzen(w) { werkzeug = w; if (w === 'hinzufuegen') auswahlAufheben(); }

  /** Tafel A oder B in den Farben f, ohne Markierung der Auswahl (Bildexport). @param {Farben} f @param {string} tafel */
  function bild(f, tafel) {
    const s = gezeigt();
    if (tafel === 'b') return strukturTafelB(s, f, strukturSymmetrie(s), z.zoomB).svg;
    return strukturTafelA(s, { elemente: s.elemente, zelle: s.zelle, ae: s.ae, bindungen: s.bindungen, farben: false }, f, null, ansicht).svg;
  }

  return { init, abgleichen, zeichnen, bild, touchstart, down, move, up, vorgabeZeigen, werkzeugSetzen };
}
