// Bedienung der Modi „Gitter und Basis“ (Vorgaben, Motive setzen, ziehen, drehen; Gitter; Bestimmung der Gruppe) und
// „Muster entwerfen“ (#136: Gruppe wählen, Motive setzen; die Gruppe ist fest, nichts wird bestimmt); Tafeln und Kenndaten
// (struktur.js). Der Zustand steht in z.struktur bzw. z.entwurf (zustand.js); Werkzeug, Auswahl und das gewählte
// Motiv gelten nur in dieser Sitzung und für beide Modi gemeinsam (bei jedem Wechsel der Modi wird die Auswahl aufgehoben).
//
// Im Entwurf ist z.entwurf.basis je Bahn ein Vertreter (bahnen.js). Gewählt ist dann ein Bild: Vertreter k und
// Operation op (Nummer in g.alle); Regler zeigen das Bild, Änderungen und Ziehen gehen über die Umkehroperation an den
// Vertreter (CLAUDE.md, „Muster entwerfen“).

import { VORGABEN } from './vorgaben.js';
import { MOTIVE, MOTIVZEILEN, chiral, hatFuge } from './motive.js';
import { metrik, drehSymbol, elementeImBereich, grad, radieren, vereinfachen, STRICH_GRENZE } from './zeichnung.js';
import { gruppe, mod1, lage } from './symmetrie.js';
import { strukturStart, wieVorgabe, STRUKTUR_BEREICH, groesseVonRegler, reglerVonGroesse, BASIS_GRENZE, bahnGewicht, FREI } from './zustand.js';
import { bilderMitOperation, bildUnter, vertreterVon, sichtbareOp, gruppeWechseln, uebernahmeVon } from './bahnen.js';
import { strukturTafelA, strukturTafelB, strukturHTML, entwurfHTML, festeBestimmung, motivFarben, strukturSymmetrie, istGegeben, motivSymbol } from './struktur.js';
import { EBENENGRUPPEN, SYSTEME, ebenengruppe } from './ebenengruppen.js';
import { symbolHTML, dezimal, richtungenLegende } from './text.js';
import { $, eingabe, auswahl, knopf, grafik, element, elemente, modusTabs } from '../lib/common/js/seite.js';
import { setTip } from '../lib/common/js/help.js';
import { TIPS, GITTER_FEST } from './hilfetexte.js';

/** @import { Vec2, Grad } from '../lib/common/js/typen.js' */
/** @import { Zustand } from './zustand.js' */
/** Gitter und Basis, gemeinsam für beide Modi. @typedef {{ ba: number, gamma: Grad, basis: Basiseintrag[] }} Bau */
/** @import { Ansicht, Farben } from './zeichnung.js' */
/** @import { Basiseintrag } from './motive.js' */
/** @import { Bestimmung } from './bestimmung.js' */
/** Vorlage für „Hinzufügen“ (groesse null: Grösse des Motivs). @typedef {{ motiv: string, farbe: number, winkel: Grad, groesse: number | null, spiegel?: true, fuge?: true }} Vorlage */

const FARBNAMEN = ['Sorte 1', 'Sorte 2', 'Sorte 3', 'Sorte 4'];
/** Höchstzahl der Schritte für „Rückgängig“ je Modus. */
const VERLAUF_GRENZE = 50;

/**
 * ctx: { z, farben(), aktualisieren(), svgPunkt(e), coarse }.
 * Rückgabe: Funktionen, die main.js aufruft.
 * @param {{ z: Zustand, farben: () => Farben, aktualisieren: () => void,
 *   svgPunkt: (e: { clientX: number, clientY: number }) => Vec2, coarse: MediaQueryList }} ctx
 */
export function strukturUI({ z, farben, aktualisieren, svgPunkt, coarse }) {
  let werkzeug = 'verschieben'; // oder 'hinzufuegen', im Entwurf auch 'zeichnen', 'radieren'
  /** Strich, der gerade gezeichnet wird (Teil von z.entwurf.striche), und Stelle des Radierers (Bildpunkte), solange gedrückt. */
  /** @type {import('./motive.js').Strich | null} */
  let strich = null;
  /** @type {Vec2 | null} */
  let radierStelle = null;
  /**
   * Verlauf für „Rückgängig“ (#130): je Modus der Stand von Basis und Strichen vor jeder abgeschlossenen Handlung
   * (Hinzufügen, Ziehen, Entfernen, Löschen, Eigenschaften eines Motivs, Strich, Radieren), höchstens VERLAUF_GRENZE
   * Schritte, nur für die Sitzung. Gruppe, Gitter und Anzeigen gehören nicht dazu (Seitenleiste: „was da ist“). Ein
   * Verlauf gilt für ein Zustandsobjekt (von): Vorgabe, „Vorgabe wiederherstellen“, Übernahme und ein Link ersetzen es
   * und beginnen damit einen neuen. Die Wahl einer Gruppe im Entwurf behält ihn, ohne die Stände, die unter der neuen
   * Gruppe die Grenze der Bilder überschritten.
   * @type {Record<'struktur' | 'entwurf', { von: object | null, schritte: string[] }>}
   */
  const verlaeufe = { struktur: { von: null, schritte: [] }, entwurf: { von: null, schritte: [] } };
  /** Stand vor der laufenden Handlung und das Zustandsobjekt, zu dem er gehört. @type {{ stand: string, von: object } | null} */
  let offen = null;
  /** @type {Vorlage} */
  let neu = { motiv: 'dreieck', farbe: 0, winkel: grad(0), groesse: null }; // Vorlage für „Hinzufügen“
  /** @type {number | null} */
  let gewaehlt = null; // Index des gewählten Motivs in der Basis (im Entwurf: des Vertreters)
  let gewaehltOp = 0; // im Entwurf: Nummer der Operation des gewählten Bildes in g.alle
  /** @type {Zustand['modus']} */
  let modusAlt = 'eg'; // zuletzt abgeglichener Modus: Wechsel (auch der erste Abgleich nach dem Öffnen eines Links) hebt die Auswahl auf
  /** @type {{ zelle: import('../lib/common/js/typen.js').Mat2 | null, ursprung: Vec2 | null } | null} */
  let umstellung = null; // nach dem Übergang mit anderer Zelle oder anderem Ursprung, für die Kenndaten des Entwurfs (bis zur nächsten Wahl einer Gruppe)
  /** @type {Ansicht | null} */
  let ansicht = null; // Ansicht von Tafel A (zuletzt gezeichnet)
  /** @type {Ansicht | null} */
  let fest = null; // eingefrorene Ansicht während des Ziehens
  /** @type {{ k: number, op: number, versatz: Vec2, bewegt?: boolean } | null} */
  let zug = null; // { k, op, versatz }; bewegt: gezogen oder neu gesetzt
  /** @type {string | undefined} */
  let letztes; // Symbol der letzten Zeichnung
  /** @type {string | null} */
  let vorher = null; // Symbol vor der letzten Änderung (für den Hinweis in den Kenndaten)
  /** Struktur in „Gitter und Basis“. */
  const st = () => z.struktur;
  /** Entwurf in „Muster entwerfen“. */
  const en = () => z.entwurf;
  const istEntwurf = () => z.modus === 'entwurf';
  /** Gitter und Basis des Modus, in dem man ist. @returns {Bau} */
  const bau = () => (istEntwurf() ? z.entwurf : z.struktur);
  /** Gruppe des Entwurfs als Rechenobjekt, in „Gitter und Basis“ null. */
  const festG = () => (istEntwurf() ? gruppe(z.entwurf.gruppe) : null);
  /**
   * Alle gezeichneten Motive mit Herkunft: Vertreter k und Operation op (in „Gitter und Basis“: jedes Motiv mit op 0,
   * der Identität).
   * @returns {{ bild: Basiseintrag, k: number, op: number }[]}
   */
  function motive() {
    const g = festG();
    if (!g) return st().basis.map((bild, k) => ({ bild, k, op: 0 }));
    const M = metrik(en());
    return en().basis.flatMap((e, k) => bilderMitOperation(g, M, e).map((b) => ({ ...b, k })));
  }
  /** Gezeichnete Struktur: im Entwurf die Bahnen der Vertreter ausgeschrieben (Bindungen wie in „Gitter und Basis“ zwischen den Atomen). */
  const gezeigt = () => (istEntwurf() ? { ...en(), basis: motive().map((m) => m.bild) } : { ...st(), basis: motive().map((m) => m.bild) });
  /** Ergebnis, das statt der Bestimmung gilt: im Entwurf die gewählte Gruppe, sonst undefined (bestimmen). @returns {import('./bestimmung.js').Bestimmung | undefined} */
  const gewaehlteGruppe = () => (istEntwurf() ? festeBestimmung(en()) : undefined);
  /**
   * Was Tafel A zeigt: die Anzeigen des Modus und „Darstellung“ (gemeinsam, z). Zoom: Mitte ist die verschobene
   * (z.ausschnitt), sonst das gewählte, gezeichnete Motiv (gz: die gezeichneten Motive, gewaehltGezeichnet), ohne Wahl die
   * Mitte der gegebenen Zelle.
   * @param {Basiseintrag[]} basis die gezeichneten Motive
   * @returns {import('./struktur.js').Anzeige}
   */
  function anzeigeA(basis) {
    const i = gewaehltGezeichnet();
    /** @type {Vec2} */
    const mitte = i !== null && basis[i] ? /** @type {Vec2} */ (basis[i].p.map(mod1)) : [0.5, 0.5];
    const gemeinsam = { farben: z.farben, fuell: z.aeFuell, zoom: z.zoomA > 1 ? { faktor: z.zoomA, mitte: z.ausschnitt[istEntwurf() ? 'entwurf' : 'struktur'] ?? mitte } : null };
    // Entwurf: die Zelle ist die konventionelle (immer eingezeichnet)
    if (istEntwurf()) return { elemente: en().elemente, zelle: true, ae: en().ae, bindungen: en().bindungen, ...gemeinsam };
    const s = st();
    return { elemente: s.elemente, zelle: s.zelle, ae: s.ae, bindungen: s.bindungen, ...gemeinsam };
  }
  /** Optionen von Tafel B aus „Darstellung“: Tapete ohne Zelle und Elemente, einfarbig gefüllt. */
  const optionenB = () => ({ zelle: !z.tapete, elemente: z.musterElemente && !z.tapete, richtungsfarben: z.farben, fuell: z.aeFuell, einfarbig: z.tapete });
  /** Ist für ein weiteres Motiv bzw. eine weitere Bahn Platz (BASIS_GRENZE)? */
  const platz = () => (bau().basis.length + 1) * (istEntwurf() ? bahnGewicht(en().gruppe) : 1) <= BASIS_GRENZE;
  /** Moduswahl als Tab-Muster (Leitfaden Abschn. 5.4); entsteht in init(). @type {{ markieren: (id: string) => void } | null} */
  let modi = null;

  // ---------------------------------------------------------------- Aufbau der Bedienelemente
  function baue() {
    const gruppen = [...new Set(VORGABEN.map((v) => v.gruppe))];
    $('s-vorgabe').innerHTML = gruppen.map((g) => `<optgroup label="${g}">${VORGABEN.filter((v) => v.gruppe === g).map((v) => `<option value="${v.id}">${v.name}</option>`).join('')}</optgroup>`).join('')
      + '<option value="" disabled>eigene Struktur (verändert)</option>';
    // Motive nach eigener Symmetrie gebündelt (Konzept „Muster entwerfen“, Abschn. 2, Punkt 1): je Zeile eine Symmetrie,
    // je Motiv ein Knopf mit kleinem Bild; Name und Symmetrie im Tooltip und im Namen für Hilfstechnik
    // ein Raster je Zeile, der Name der Zeile als kleine Überschrift darüber (#130)
    $('s-motiv').innerHTML = MOTIVZEILEN.map((zeile, i) => `<p class="motivzeile" id="s-motiv-z${i}">${zeile.name}</p><div class="btns" role="group" aria-labelledby="s-motiv-z${i}">${
      zeile.motive.map((k) => `<button class="pgb motivb" type="button" data-motiv="${k}" aria-pressed="false" aria-label="${MOTIVE[k].name}, Eigensymmetrie ${MOTIVE[k].symmetrie}" title="${MOTIVE[k].name} (${MOTIVE[k].symmetrie})">${motivSymbol(k, 'var(--mf)', 'var(--paper)')}</button>`).join('')
    }</div>`).join('');
    // Gruppenwahl im Entwurf: Knöpfe je Kristallsystem wie in „Ebenengruppen“
    $('e-picker').innerHTML = [...new Set(EBENENGRUPPEN.map((d) => d.system))].map((sys) => `<div class="sysrow"><span class="sys">${SYSTEME[sys].name}</span><div class="btns">${
      EBENENGRUPPEN.filter((d) => d.system === sys).map((d) => `<button class="pgb" type="button" data-g="${d.symbol}" aria-pressed="false" title="Nr. ${d.nr}, Punktgruppe ${d.punktgruppe}">${symbolHTML(d.symbol)}</button>`).join('')
    }</div></div>`).join('');
    $('s-farbe').innerHTML = FARBNAMEN.map((n, i) => `<button type="button" data-farbe="${i}" aria-pressed="false" aria-label="${n}" title="${n}"><i class="sw"></i></button>`).join('');
  }

  /** Das gewählte Bild (mit festgehaltener Gruppe) bzw. Motiv, sonst null. @returns {Basiseintrag | null} */
  function gewaehltesBild() {
    if (gewaehlt === null || !bau().basis[gewaehlt]) return null;
    const g = festG();
    return g ? bildUnter(g.alle[gewaehltOp], metrik(bau()), bau().basis[gewaehlt]) : bau().basis[gewaehlt];
  }
  /** Was die Regler zeigen: das gewählte Bild bzw. Motiv oder die Vorlage für „Hinzufügen“. @returns {Basiseintrag | Vorlage} */
  const ziel = () => gewaehltesBild() ?? neu;
  /**
   * Eine Änderung an dem, was die Regler zeigen. Im Entwurf wird das gewählte Bild geändert und
   * über die Umkehroperation zum Vertreter zurückgerechnet; die Lage des Vertreters bleibt.
   * @param {(e: Basiseintrag | Vorlage) => void} aenderung
   */
  function aendern(aenderung) {
    const g = festG();
    if (!g || gewaehlt === null || !bau().basis[gewaehlt]) { aenderung(ziel()); return; }
    const b = /** @type {Basiseintrag} */ (gewaehltesBild());
    aenderung(b);
    bau().basis[gewaehlt] = { ...vertreterVon(g.alle[gewaehltOp], metrik(bau()), b), p: bau().basis[gewaehlt].p };
    // fallen Bilder durch die Änderung zusammen, bleibt das gezeichnete gewählt (Review PR #144)
    gewaehltOp = sichtbareOp(g, metrik(bau()), bau().basis[gewaehlt], gewaehltOp);
  }
  /** Nummer des gewählten Bildes in der gezeichneten Liste (für die Markierung) oder null. */
  const gewaehltGezeichnet = () => {
    if (gewaehlt === null) return null;
    const i = motive().findIndex((m) => m.k === gewaehlt && m.op === (festG() ? gewaehltOp : 0));
    return i < 0 ? null : i;
  };

  function abgleichen() {
    // Wechsel der Modi (Tab, Link, Erste Schritte): die Nummern der Auswahl gelten im anderen Modus nicht
    if (z.modus !== modusAlt) {
      modusAlt = z.modus; auswahlAufheben(); strich = null; radierStelle = null;
      if (!istEntwurf() && (werkzeug === 'zeichnen' || werkzeug === 'radieren')) werkzeug = 'verschieben';
      if (istEntwurf() && !en().basis.length) werkzeug = 'hinzufuegen'; // ein leerer Entwurf braucht als Erstes ein Motiv
    }
    const g0 = festG();
    if (g0 && gewaehltOp >= g0.alle.length) gewaehltOp = 0;
    if (gewaehlt !== null && !bau().basis[gewaehlt]) gewaehlt = null;
    document.body.classList.toggle('modus-struktur', z.modus === 'struktur');
    document.body.classList.toggle('modus-entwurf', istEntwurf());
    modi?.markieren(z.modus === 'struktur' ? 'tab-struktur' : istEntwurf() ? 'tab-entwurf' : 'tab-eg');
    document.body.classList.toggle('zeichnen', zeichnet() && werkzeug === 'zeichnen');
    document.body.classList.toggle('radieren', zeichnet() && werkzeug === 'radieren');
    if (z.modus === 'eg') return;
    const s = bau();
    if (!istEntwurf()) {
      auswahl('s-vorgabe').value = wieVorgabe(st()) ? st().vorgabe : '';
      eingabe('s-elemente').checked = st().elemente;
      eingabe('s-zelle').checked = st().zelle;
      eingabe('s-ae').checked = st().ae;
      eingabe('s-bindungen').checked = st().bindungen;
      knopf('s-zuruecksetzen').disabled = wieVorgabe(st());
    } else {
      eingabe('e-elemente').checked = en().elemente;
      eingabe('e-ae').checked = en().ae;
      eingabe('e-bindungen').checked = en().bindungen;
    }
    for (const [id, w] of [['s-werkzeug-verschieben', 'verschieben'], ['s-werkzeug-hinzufuegen', 'hinzufuegen'], ['s-werkzeug-zeichnen', 'zeichnen'], ['s-werkzeug-radieren', 'radieren']]) $(id).setAttribute('aria-pressed', String(werkzeug === w));
    if (istEntwurf()) strichAbgleichen();
    document.body.classList.toggle('hinzufuegen', werkzeug === 'hinzufuegen');
    const e = ziel();
    const f = motivFarben(farben());
    $('s-motiv').style.setProperty('--mf', f[(e.farbe ?? 0) % f.length]);
    $('s-motiv').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.motiv === e.motiv)));
    $('s-farbe').querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.farbe) === (e.farbe ?? 0)));
      /** @type {HTMLElement} */ (b.querySelector('.sw')).style.background = f[Number(b.dataset.farbe)];
    });
    const winkel = ((e.winkel ?? 0) % 360 + 360) % 360;
    eingabe('s-winkel').value = String(winkel);
    $('s-winkel-out').textContent = `${dezimal(winkel, 1, { kuerzen: true })}°`;
    // Eigenschaften, die das Motiv nicht hat, fehlen (Leitfaden Abschn. 5.2, #130): „Gespiegelt“ nur bei chiralen
    // Motiven (das Spiegelbild eines achiralen wäre dasselbe), „Mit Fuge“ nur beim Ziegel
    eingabe('s-spiegel').checked = Boolean(e.spiegel);
    $('row-spiegel').hidden = !chiral(e.motiv);
    eingabe('s-fuge').checked = Boolean(e.fuge);
    $('row-fuge').hidden = !hatFuge(e.motiv);
    const gr = e.groesse ?? MOTIVE[e.motiv].groesse;
    eingabe('s-groesse').value = String(reglerVonGroesse(gr));
    $('s-groesse-out').textContent = dezimal(gr, 3);
    knopf('s-entfernen').disabled = gewaehlt === null;
    knopf('s-entfernen').setAttribute('aria-label', istEntwurf() ? 'Gewählte Bahn entfernen' : 'Gewähltes Motiv entfernen');
    knopf('motive-loeschen').disabled = !s.basis.length;
    knopf('rueckgaengig').disabled = !verlauf().length;
    $('s-basis-titel').textContent = gewaehlt === null ? 'Neues Motiv'
      : istEntwurf() ? `Gewähltes Motiv (Bahn ${gewaehlt + 1} von ${s.basis.length})` : `Gewähltes Motiv (Nr. ${gewaehlt + 1} von ${s.basis.length})`;
    for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
      eingabe(`s-${k}`).min = String(STRUKTUR_BEREICH[k][0]); eingabe(`s-${k}`).max = String(STRUKTUR_BEREICH[k][1]);
      eingabe(`s-${k}`).value = String(s[k]);
    }
    $('s-ba-out').textContent = dezimal(s.ba, 2);
    $('s-gamma-out').textContent = `${dezimal(s.gamma, 1)}°`;
    // im Entwurf folgt das Gitter dem Kristallsystem der Gruppe: nur die freien Parameter (wie in „Ebenengruppen“)
    const frei = istEntwurf() ? FREI[ebenengruppe(en().gruppe).system] : ['ba', 'gamma'];
    eingabe('s-ba').disabled = !frei.includes('ba');
    eingabe('s-gamma').disabled = !frei.includes('gamma');
    // nur der Grund in einem Halbsatz, wenn ein Regler gesperrt ist (Erklärung im ⓘ, Leitfaden Abschn. 5.2, #162)
    $('s-gitter-hint').innerHTML = istEntwurf() ? GITTER_FEST[ebenengruppe(en().gruppe).system] : '';
    if (istEntwurf()) gruppeAbgleichen(); else weiterAbgleichen();
  }

  // ---------------------------------------------------------------- Gruppe, Übergang
  /** Übergang aus „Gitter und Basis“ mit der bestimmten Gruppe (bahnen.js). */
  const uebernahme = () => { const s0 = gezeigt(); return uebernahmeVon(s0, strukturSymmetrie(s0), STRUKTUR_BEREICH, BASIS_GRENZE); };
  /** Wahl einer Gruppe im Entwurf (bahnen.js): null, wenn die Grenze überschritten würde. @param {string} sym */
  const zurGruppe = (sym) => gruppeWechseln(en(), sym, BASIS_GRENZE);
  /** Auswahl zurücksetzen (die Nummern der Basis ändern sich). */
  const auswahlAufheben = () => { gewaehlt = null; gewaehltOp = 0; };
  /** Zeichnen und Radieren: nur im Entwurf. */
  const zeichnet = () => istEntwurf() && (werkzeug === 'zeichnen' || werkzeug === 'radieren');
  const punkteGezeichnet = () => en().striche.reduce((n, st) => n + st.punkte.length, 0);
  /** Verlauf des Modus, in dem man ist; neu, wenn das Zustandsobjekt ersetzt wurde. */
  const verlauf = () => {
    const v = verlaeufe[istEntwurf() ? 'entwurf' : 'struktur'];
    if (v.von !== bau()) { v.von = bau(); v.schritte = []; }
    return v.schritte;
  };
  /**
   * Basis und Striche des Modus als Text (für Vergleich und Wiederherstellen), die Felder eines Motivs sortiert: aendern()
   * baut einen Eintrag im Entwurf neu auf, eine Änderung ohne Wirkung wäre sonst ein Schritt (Review PR #158).
   */
  const stand = () => JSON.stringify({
    basis: bau().basis.map((e) => Object.fromEntries(Object.entries(e).sort(([a], [b]) => (a < b ? -1 : 1)))),
    striche: istEntwurf() ? en().striche : [],
  });
  /** Eine Handlung beginnt: Stand davor merken (einmal, auch wenn ein Regler viele Schritte meldet). */
  const beginnen = () => { if (!offen) { verlauf(); offen = { stand: stand(), von: bau() }; } };
  /** Die Handlung ist abgeschlossen: hat sich etwas geändert, ist der Stand davor ein Schritt im Verlauf. */
  const abschliessen = () => {
    if (!offen) return;
    const o = offen; offen = null;
    if (o.von !== bau() || o.stand === stand()) return;
    const v = verlauf(); v.push(o.stand); if (v.length > VERLAUF_GRENZE) v.shift();
  };
  /** Eine Handlung auf einmal (Knöpfe, Auswahl). @param {() => void} f */
  const handlung = (f) => { beginnen(); f(); abschliessen(); };
  /** Radius des Radierers in Pixeln der Tafel (520 breit). */
  const RADIER_PX = 12;

  /**
   * Zwischenspeicher für weiterAbgleichen(): Der Übergang hängt nur von der Struktur ab. Er kostet eine Reduktion auf
   * Vertreter; neu gerechnet wird erst, wenn die Struktur einen Moment ruht (beim Ziehen und an Reglern sonst bei jedem
   * Schritt). Bis dahin gilt der alte Wert; der Knopf prüft beim Klick ohnehin neu.
   * @type {{ schluessel: string, ue: ReturnType<typeof uebernahme> } | null}
   */
  let merker = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let merkerUhr = null;
  const merkerSchluessel = () => { const s = st(); return JSON.stringify([s.ba, s.gamma, s.basis]); };
  const merkerRechnen = () => { merker = { schluessel: merkerSchluessel(), ue: uebernahme() }; };

  /**
   * Übergang „In ‚Muster entwerfen‘ weiterbearbeiten“ in den Kenndaten bei der bestimmten Gruppe (Leitfaden Abschn. 5.1,
   * #162): Stand aus weiterAbgleichen(), gezeichnet von weiterHTML() mit den Kenndaten.
   */
  let weiter = { gesperrt: true, text: '', hinweis: '' };
  /** Knopf und Hinweis (Grund, wenn gesperrt, sonst die Folge) für die Kenndaten. */
  const weiterHTML = () => ({
    knopf: `<button class="linkbtn" type="button" id="s-weiter"${weiter.gesperrt ? ' disabled' : ''}>${weiter.text}</button>`,
    hinweis: `<p class="hintline weiter" id="s-weiter-hint">${weiter.hinweis}</p>`,
  });
  /** Knopf und Hinweis in den Kenndaten nachführen, ohne sie neu zu zeichnen (nach der verzögerten Rechnung). */
  function weiterZeigen() {
    const k = document.getElementById('s-weiter');
    if (!(k instanceof HTMLButtonElement)) return;
    k.disabled = weiter.gesperrt;
    k.innerHTML = weiter.text;
    setTip(k, TIPS['s-weiter']);
    const h = document.getElementById('s-weiter-hint');
    if (h) h.innerHTML = weiter.hinweis;
  }
  /** „Gitter und Basis“: Stand des Übergangs mit dem Grund, wenn er gesperrt ist (Leitfaden Abschn. 5.2). */
  function weiterAbgleichen() {
    if (!merker) merkerRechnen();
    else if (merker.schluessel !== merkerSchluessel() && !zug) {
      if (merkerUhr) clearTimeout(merkerUhr);
      merkerUhr = setTimeout(() => { merkerUhr = null; if (!zug && z.modus === 'struktur') { merkerRechnen(); weiterAbgleichen(); } }, 150);
    }
    const m = /** @type {NonNullable<typeof merker>} */ (merker);
    const r = strukturSymmetrie(gezeigt()); // aus dem Zwischenspeicher der Bestimmung (dieselbe wie für die Tafel)
    const grund = 'grund' in m.ue ? m.ue.grund : '';
    // der bisherige Entwurf geht verloren, auch wenn er nur Striche hat
    const alt = en().basis.length; const striche = en().striche.length;
    const inhalt = [alt ? `${alt} ${alt === 1 ? 'Bahn' : 'Bahnen'}` : '', striche ? `${striche} ${striche === 1 ? 'Strich' : 'Striche'}` : ''].filter(Boolean).join(' und ');
    weiter = {
      gesperrt: Boolean(grund) || !r,
      text: r ? `In „Muster entwerfen“ weiterbearbeiten (${symbolHTML(r.symbol)})` : 'In „Muster entwerfen“ weiterbearbeiten',
      hinweis: grund ? `Gesperrt: ${grund}` : inhalt ? `Ersetzt den bisherigen Entwurf (${inhalt} in ${symbolHTML(en().gruppe)}).` : '',
    };
    weiterZeigen();
  }
  /** Werkzeug Radieren und „Alle Striche löschen“ (nur im Entwurf): gesperrt, solange es keine Striche gibt. */
  function strichAbgleichen() {
    const n = en().striche.length;
    knopf('s-werkzeug-radieren').disabled = !n && werkzeug !== 'radieren';
    knopf('striche-loeschen').disabled = !n;
  }

  /** „Muster entwerfen“: Gruppenwahl; gesperrt, wo die Grenze überschritten würde (mit Grund). */
  function gruppeAbgleichen() {
    let grenze = false;
    elemente('#e-picker .pgb', HTMLButtonElement).forEach((b) => {
      const sym = /** @type {string} */ (b.dataset.g);
      b.setAttribute('aria-pressed', String(sym === en().gruppe));
      const zuViel = sym !== en().gruppe && !zurGruppe(sym);
      if (zuViel) grenze = true;
      b.disabled = zuViel;
    });
    $('e-picker-hint').textContent = grenze ? `Gesperrt: Gruppen mit mehr als ${BASIS_GRENZE} Bildern.` : '';
  }

  // ---------------------------------------------------------------- Zeichnen
  /** @param {Farben} f @param {Bestimmung | null} r */
  function legende(f, r) {
    const items = [];
    // Anzeigen des Modus; im Entwurf ist die Zelle die konventionelle (kein Paar gegebene/konventionelle Zelle)
    const anz = istEntwurf() ? { elemente: en().elemente, zelle: false, ae: en().ae } : st();
    items.push(`<span class="lg"><svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.line}" stroke-width="2"/></svg><span>${istEntwurf() ? 'Zelle' : 'gegebene Zelle'} <i>a</i>, <i>b</i></span></span>`);
    if (r && anz.zelle) items.push(`<span class="lg"><svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.accent}" stroke-width="2.6"/></svg><span>konventionelle Zelle <i>a</i>′, <i>b</i>′</span></span>`);
    if (r && anz.elemente) {
      const g = gruppe(r.symbol);
      const el = elementeImBereich(g, 1);
      /** Farbe der Drehpunkte: die der ersten Position, wenn nach Blickrichtung gefärbt wird. */
      const farbe1 = z.farben ? f.dir[0] : f.ink;
      for (const n of [...new Set(el.drehpunkte.map((d) => d.n))].sort()) items.push(`<span class="lg"><svg class="sym-icon" width="22" height="22" viewBox="0 0 22 22">${drehSymbol(n, [11, 11], farbe1, f.paper)}</svg>${n}-zähliger Drehpunkt</span>`);
      const arten = new Set(el.linien.map((l) => l.art));
      /** @param {boolean} dash */
      const linie = (dash) => `<svg width="24" height="10" viewBox="0 0 24 10"><line x1="1" y1="5" x2="23" y2="5" stroke="${f.ink}" stroke-width="${dash ? 2 : 2.8}" ${dash ? 'stroke-dasharray="6 4"' : 'stroke-linecap="round"'}/></svg>`;
      if (arten.has('spiegel')) items.push(`<span class="lg">${linie(false)}Spiegellinie</span>`);
      if (arten.has('gleit')) items.push(`<span class="lg">${linie(true)}Gleitspiegellinie</span>`);
      if (z.farben) items.push(...richtungenLegende(g.daten.system, el.linien, f, istGegeben(r) ? '' : ' (in <i>a</i>′, <i>b</i>′)'));
    }
    if (r && anz.ae) items.push(`<span class="lg"><i class="sw" style="background:${f.crystal}"></i>asymmetrische Einheit</span>`);
    if (r && z.aeFuell) {
      items.push(`<span class="lg"><i class="sw" style="background:${f.upper}"></i>asymmetrische Einheit mit Bildern, gleiche Händigkeit</span>`);
      if (gruppe(r.symbol).alle.some((o) => o.R[0][0] * o.R[1][1] - o.R[0][1] * o.R[1][0] < 0)) items.push(`<span class="lg"><i class="sw" style="background:${f.accent2}"></i>Spiegelbild</span>`);
    }
    // was ein Tippen auf die Zeichnung tut, und der Grund, wenn es nichts tut (Leitfaden Abschn. 5.1, #130)
    const voll = istEntwurf() && punkteGezeichnet() >= STRICH_GRENZE - 50;
    items.push(zeichnet() ? `<span class="lg hint">${werkzeug === 'zeichnen' ? 'Ziehen: Strich zeichnen' : 'Über Striche ziehen: radieren'}${voll ? '; die Zeichnung ist fast voll' : ''}</span>`
      : werkzeug === 'hinzufuegen'
      ? (platz() ? '<span class="lg hint"><span class="only-fine">Stelle anklicken: neues Motiv</span><span class="only-coarse">Stelle antippen: neues Motiv</span></span>'
        : `<span class="lg hint">Die Basis ist voll (höchstens ${BASIS_GRENZE} ${istEntwurf() ? 'Bilder; jede Bahn zählt mit der Zähligkeit der allgemeinen Lage' : 'Motive'})</span>`)
      : `<span class="lg hint">${gewaehlt !== null ? (istEntwurf() ? 'Ziehen verschiebt die ganze Bahn' : 'Ziehen verschiebt das Motiv') : 'Motiv wählen und ziehen'}</span>`);
    $('legend').innerHTML = items.join('');
  }

  /** @param {{ nurA?: boolean }} [optionen] */
  function zeichnen({ nurA = false } = {}) {
    const f = farben();
    const gz = gezeigt(); // Bahnen einmal ausschreiben, für beide Tafeln und die Kenndaten
    const gegeben = gewaehlteGruppe(); // im Entwurf die gewählte Gruppe, sonst wird bestimmt
    const a = strukturTafelA(gz, anzeigeA(gz.basis), f, gewaehltGezeichnet(), fest, gegeben);
    ansicht = a.ansicht;
    const r = a.ergebnis;
    if (!istEntwurf() && r?.symbol !== letztes) { vorher = letztes ?? null; letztes = r?.symbol; }
    grafik('bild-a').innerHTML = a.svg + (radierStelle ? `<circle cx="${radierStelle[0]}" cy="${radierStelle[1]}" r="${RADIER_PX}" fill="none" stroke="${f.muted}" stroke-width="1.5" stroke-dasharray="3 2"/>` : '');
    if (nurA) return;
    grafik('bild-b').innerHTML = strukturTafelB(gz, f, r, z.zoomB, optionenB()).svg;
    legende(f, r);
    $('info').innerHTML = istEntwurf() ? entwurfHTML(en(), f, umstellung) : strukturHTML(gz, r, vorher, f, weiterHTML());
    if (!istEntwurf()) weiterZeigen();
  }

  // ---------------------------------------------------------------- Zeiger
  /** Einrasten auf Vielfache von 1/12 der gegebenen Zelle (je Koordinate, mit Toleranz in Pixeln). @param {Vec2} p @returns {Vec2} */
  function raste(p) {
    if (!z.einrasten || !ansicht) return p;
    const M = metrik(bau());
    const tol = (coarse.matches ? 12 : 8) / (ansicht.s * Math.min(Math.hypot(...M.a), Math.hypot(...M.b)));
    return /** @type {Vec2} */ (p.map((v) => { const r = Math.round(v * 12) / 12; return Math.abs(v - r) < tol ? r : v; }));
  }
  /**
   * Lage eines Vertreters einrasten: im Entwurf zuerst auf spezielle Lagen (Toleranz in Pixeln wie
   * im Modus „Ebenengruppen“), sonst auf das 1/12-Raster. @param {Vec2} p @returns {Vec2}
   */
  function rasteVertreter(p) {
    const g = festG();
    if (!g || !z.einrasten || !ansicht) return raste(p);
    const M = metrik(bau());
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
    // mit Zoom verschiebt ein Finger ins Leere den Ausschnitt (zoom.js), statt die Seite zu scrollen
    if (werkzeug === 'hinzufuegen' || zeichnet() || z.zoomA > 1 || treffer(svgPunkt(e.touches[0]))) e.preventDefault();
  }
  /** @param {PointerEvent} e @returns {'leer' | undefined} „leer“: ins Leere getippt (Werkzeug „Wählen und ziehen“) */
  function down(e) {
    if (!ansicht) return;
    const q = svgPunkt(e);
    const p = ansicht.vonBild(q);
    if (zeichnet()) {
      if (werkzeug === 'zeichnen') {
        if (punkteGezeichnet() >= STRICH_GRENZE) return;
        beginnen();
        strich = { punkte: [p], farbe: neu.farbe };
        en().striche.push(strich);
      } else {
        if (!en().striche.length) return;
        beginnen();
        radierenAn(q);
      }
      fest = ansicht;
      grafik('bild-a').setPointerCapture(e.pointerId);
      aktualisieren();
      return;
    }
    if (werkzeug === 'hinzufuegen') {
      if (!platz()) return;
      beginnen();
      /** @type {Basiseintrag} */
      const e0 = { motiv: neu.motiv, farbe: neu.farbe, p: rasteVertreter(p), winkel: neu.winkel };
      if (neu.groesse !== null) e0.groesse = neu.groesse;
      if (neu.spiegel) e0.spiegel = true;
      if (neu.fuge && hatFuge(neu.motiv)) e0.fuge = true;
      bau().basis.push(e0);
      gewaehlt = bau().basis.length - 1; gewaehltOp = 0;
      zug = { k: gewaehlt, op: 0, versatz: [0, 0], bewegt: true };
    } else {
      const t = treffer(q);
      // ins Leere: Auswahl aufheben; Ziehen verschiebt dann den Ausschnitt (zoom.js, #162)
      if (!t) { auswahlAufheben(); aktualisieren(); return 'leer'; }
      gewaehlt = t.k; gewaehltOp = t.op;
      beginnen();
      zug = { k: t.k, op: t.op, versatz: [t.bild[0] - p[0], t.bild[1] - p[1]] };
    }
    fest = ansicht;
    grafik('bild-a').setPointerCapture(e.pointerId);
    aktualisieren();
  }
  let rahmen = false;
  /** Radieren an der Stelle q (Bildpunkt): jeder Strich verliert die überfahrenen Stücke und behält seine Farbe. @param {Vec2} q */
  function radierenAn(q) {
    const A = /** @type {Ansicht} */ (fest ?? ansicht);
    radierStelle = q;
    const g = gruppe(en().gruppe); const M = metrik(en());
    const p = A.vonBild(q);
    const radiert = en().striche.flatMap((st) => radieren([st.punkte], g, M, p, RADIER_PX / A.s).map((punkte) => ({ punkte, farbe: st.farbe })));
    // Jeder Schnitt fügt Randpunkte hinzu: über der Grenze würde der Speicher beim Laden die ältesten Striche verwerfen, also nicht radieren
    if (radiert.reduce((n, st) => n + st.punkte.length, 0) <= STRICH_GRENZE) en().striche = radiert;
  }
  /** Tafel A beim Zeichnen oder Radieren mit dem nächsten Bild neu zeichnen (das Muster folgt am Ende des Strichs). */
  function nachziehen() {
    if (rahmen) return;
    rahmen = true;
    requestAnimationFrame(() => { rahmen = false; if (strich || radierStelle || zug) { abgleichen(); zeichnen({ nurA: true }); } });
  }
  /** @param {PointerEvent} e */
  function move(e) {
    if (strich) {
      const p = /** @type {Ansicht} */ (fest).vonBild(svgPunkt(e));
      const q = strich.punkte[strich.punkte.length - 1];
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.004 && punkteGezeichnet() < STRICH_GRENZE) { strich.punkte.push(p); nachziehen(); }
      return true;
    }
    if (radierStelle) { radierenAn(svgPunkt(e)); nachziehen(); return true; }
    if (!zug) return false;
    zug.bewegt = true;
    const p = /** @type {Ansicht} */ (fest).vonBild(svgPunkt(e)); // beim Ziehen eingefroren
    /** @type {Vec2} */
    const ziel = [p[0] + zug.versatz[0], p[1] + zug.versatz[1]];
    const g = festG();
    if (g) {
      // gezogen wird ein Bild; der Vertreter folgt über die Umkehroperation, die ganze Bahn mit
      const e0 = bau().basis[zug.k];
      const v = vertreterVon(g.alle[zug.op], metrik(bau()), { ...bildUnter(g.alle[zug.op], metrik(bau()), e0), p: ziel });
      e0.p = rasteVertreter(v.p);
      // auf einer speziellen Lage fallen Bilder zusammen (dann ist nur eines gezeichnet): die Auswahl zeigt dieses (gezogen wird weiter über zug.op)
      gewaehltOp = sichtbareOp(g, metrik(bau()), e0, zug.op);
    } else bau().basis[zug.k].p = raste(ziel);
    nachziehen();
    return true;
  }
  function up() {
    if (strich || radierStelle) {
      if (strich) {
        const i = en().striche.indexOf(strich);
        const fertig = vereinfachen(strich.punkte);
        if (fertig.length >= 2) en().striche[i] = { punkte: fertig, farbe: strich.farbe }; else en().striche.splice(i, 1);
      }
      strich = null; radierStelle = null; fest = null;
      abschliessen();
      aktualisieren();
      return true;
    }
    if (!zug) return false;
    const e = bau().basis[zug.k];
    // in die Zelle, aber nur nach einer Bewegung: ein Klick zum Wählen ändert nichts (Lagen der Vorgaben liegen auch ausserhalb)
    if (zug.bewegt) e.p = /** @type {Vec2} */ (e.p.map((v) => (Math.abs(v - Math.round(v)) < 1e-12 ? 0 : mod1(v))));
    const g = festG();
    if (g) gewaehltOp = sichtbareOp(g, metrik(bau()), e, zug.op);
    zug = null; fest = null;
    abschliessen();
    aktualisieren();
    return true;
  }

  // ---------------------------------------------------------------- Ereignisse
  function init() {
    baue();
    modi = modusTabs(element('.tabs'), $('inhalt'));
    $('tab-eg').addEventListener('click', () => { z.modus = 'eg'; aktualisieren(); });
    $('tab-struktur').addEventListener('click', () => { z.modus = 'struktur'; aktualisieren(); });
    $('tab-entwurf').addEventListener('click', () => { z.modus = 'entwurf'; aktualisieren(); });
    $('s-vorgabe').addEventListener('change', () => {
      if (!auswahl('s-vorgabe').value) return;
      const alt = st();
      z.struktur = { ...strukturStart(auswahl('s-vorgabe').value), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
      auswahlAufheben(); letztes = undefined; vorher = null;
      aktualisieren();
    });
    $('s-zuruecksetzen').addEventListener('click', () => {
      const alt = st();
      z.struktur = { ...strukturStart(alt.vorgabe), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
      auswahlAufheben(); letztes = undefined; vorher = null;
      aktualisieren();
    });
    for (const [id, feld] of /** @type {[string, 'elemente' | 'zelle' | 'ae' | 'bindungen'][]} */ ([['s-elemente', 'elemente'], ['s-zelle', 'zelle'], ['s-ae', 'ae'], ['s-bindungen', 'bindungen']])) {
      $(id).addEventListener('change', () => { st()[feld] = eingabe(id).checked; aktualisieren(); });
    }
    for (const [id, feld] of /** @type {[string, 'elemente' | 'ae' | 'bindungen'][]} */ ([['e-elemente', 'elemente'], ['e-ae', 'ae'], ['e-bindungen', 'bindungen']])) {
      $(id).addEventListener('change', () => { en()[feld] = eingabe(id).checked; aktualisieren(); });
    }
    $('werkzeug-einrasten').addEventListener('click', () => { z.einrasten = !z.einrasten; aktualisieren(); });
    $('s-werkzeug-verschieben').addEventListener('click', () => { werkzeug = 'verschieben'; aktualisieren(); });
    // Zeichnen und Radieren schliessen sich mit Hinzufügen und Wählen aus; die Auswahl wird aufgehoben (Leitfaden Abschn. 5.2)
    for (const [id, w] of /** @type {[string, 'zeichnen' | 'radieren'][]} */ ([['s-werkzeug-zeichnen', 'zeichnen'], ['s-werkzeug-radieren', 'radieren']])) {
      $(id).addEventListener('click', () => { werkzeug = werkzeug === w ? 'verschieben' : w; auswahlAufheben(); aktualisieren(); });
    }
    // Handlungen auf der Zeichnung (Leitfaden Abschn. 5.2): Rückgängig, Löschen; gesperrt, solange es nichts zu tun gibt
    $('rueckgaengig').addEventListener('click', () => {
      offen = null;
      const alt = verlauf().pop();
      if (!alt) return;
      const s = JSON.parse(alt);
      bau().basis = s.basis;
      if (istEntwurf()) en().striche = s.striche;
      auswahlAufheben();
      if (istEntwurf() && !en().basis.length && !zeichnet()) werkzeug = 'hinzufuegen'; // wie „Entfernen“ des letzten Motivs
      aktualisieren();
    });
    $('motive-loeschen').addEventListener('click', () => {
      handlung(() => { bau().basis = []; });
      auswahlAufheben();
      if (istEntwurf()) werkzeug = 'hinzufuegen'; // wie beim Öffnen eines leeren Entwurfs
      aktualisieren();
    });
    $('striche-loeschen').addEventListener('click', () => { handlung(() => { en().striche = []; }); aktualisieren(); });
    $('s-werkzeug-hinzufuegen').addEventListener('click', () => {
      werkzeug = werkzeug === 'hinzufuegen' ? 'verschieben' : 'hinzufuegen';
      // die Vorlage übernimmt das gewählte Motiv
      if (werkzeug === 'hinzufuegen' && gewaehlt !== null) {
        const e = /** @type {Basiseintrag} */ (gewaehltesBild());
        neu = { motiv: e.motiv, farbe: e.farbe ?? 0, winkel: e.winkel ?? grad(0), groesse: e.groesse ?? null, ...(e.spiegel ? { spiegel: /** @type {true} */ (true) } : {}), ...(e.fuge ? { fuge: /** @type {true} */ (true) } : {}) };
        auswahlAufheben();
      }
      aktualisieren();
    });
    $('s-motiv').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-motiv]'));
      if (!b) return;
      handlung(() => aendern((e) => {
        e.motiv = /** @type {string} */ (b.dataset.motiv);
        if (e === neu) neu.groesse = null; else delete /** @type {Basiseintrag} */ (e).groesse;
        // ein achirales Motiv ist gespiegelt dasselbe: das Feld entfällt (CLAUDE.md, „Motive“)
        if (!chiral(e.motiv)) delete e.spiegel;
        if (!hatFuge(e.motiv)) delete e.fuge; // ohne Fuge-Motiv gibt es nichts, was ruhen könnte
      }));
      aktualisieren();
    });
    $('s-farbe').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-farbe]'));
      if (!b) return;
      handlung(() => aendern((e) => { e.farbe = Number(b.dataset.farbe); }));
      aktualisieren();
    });
    let winkelMitZeiger = false;
    $('s-winkel').addEventListener('pointerdown', () => { winkelMitZeiger = true; });
    $('s-winkel').addEventListener('keydown', () => { winkelMitZeiger = false; });
    $('s-winkel').addEventListener('input', () => {
      let w = Number(eingabe('s-winkel').value);
      // Einrasten auf 15° nur beim Ziehen mit dem Zeiger: Pfeiltasten (±1°) sprängen sonst zurück (Leitfaden 5.4, Review PR #158)
      if (z.einrasten && winkelMitZeiger) { const r = Math.round(w / 15) * 15; if (Math.abs(w - r) < 2.5) w = r; }
      beginnen(); // ein Schritt im Verlauf je Bewegung des Reglers (bis change)
      aendern((e) => { e.winkel = grad(w % 360); });
      aktualisieren();
    });
    $('s-winkel').addEventListener('change', () => { abschliessen(); aktualisieren(); });
    $('s-spiegel').addEventListener('change', () => {
      handlung(() => aendern((e) => { if (eingabe('s-spiegel').checked && chiral(e.motiv)) e.spiegel = true; else delete e.spiegel; }));
      aktualisieren();
    });
    $('s-fuge').addEventListener('change', () => {
      handlung(() => aendern((e) => { if (eingabe('s-fuge').checked && hatFuge(e.motiv)) e.fuge = true; else delete e.fuge; }));
      aktualisieren();
    });
    $('s-groesse').addEventListener('input', () => { beginnen(); aendern((e) => { e.groesse = groesseVonRegler(Number(eingabe('s-groesse').value)); }); aktualisieren(); });
    $('s-groesse').addEventListener('change', () => { abschliessen(); aktualisieren(); });
    $('s-entfernen').addEventListener('click', () => {
      if (gewaehlt === null) return;
      const k = gewaehlt;
      handlung(() => { bau().basis.splice(k, 1); });
      auswahlAufheben();
      if (istEntwurf() && !en().basis.length) werkzeug = 'hinzufuegen'; // wie beim Öffnen eines leeren Entwurfs
      aktualisieren();
    });
    for (const k of /** @type {('ba' | 'gamma')[]} */ (['ba', 'gamma'])) {
      $(`s-${k}`).addEventListener('input', () => {
        if (eingabe(`s-${k}`).disabled) return;
        bau()[k] = grad(Number(eingabe(`s-${k}`).value));
        aktualisieren();
      });
    }
    $('s-metrik').addEventListener('click', (ev) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {Element} */ (ev.target).closest('[data-metrik]'));
      if (!b) return;
      const [ba, gamma] = /** @type {string} */ (b.dataset.metrik).split(',').map(Number);
      Object.assign(st(), { ba, gamma });
      aktualisieren();
    });
    // Entwurf: andere Gruppe wählen (die Vertreter bleiben; die Auswahl zeigt wieder den Vertreter selbst)
    $('e-picker').addEventListener('click', (ev) => {
      const b = /** @type {HTMLButtonElement | null} */ (/** @type {Element} */ (ev.target).closest('.pgb'));
      if (!b || b.disabled || b.dataset.g === en().gruppe) return;
      const neuS = zurGruppe(/** @type {string} */ (b.dataset.g));
      if (!neuS) return;
      Object.assign(en(), neuS); gewaehltOp = 0; umstellung = null;
      // Der Verlauf bleibt (auch für die Striche); verworfen werden nur Stände, die unter der neuen Gruppe die Grenze der
      // Bilder überschritten (Thomas, 12.11.2026)
      offen = null;
      verlaeufe.entwurf.schritte = verlaeufe.entwurf.schritte.filter((st) => JSON.parse(st).basis.length * bahnGewicht(en().gruppe) <= BASIS_GRENZE);
      aktualisieren();
    });
    // Übergang: die Struktur mit der bestimmten Gruppe einmal in den Entwurf übernehmen, der bisherige Entwurf geht verloren
    // (Knopf in den Kenndaten, die bei jedem Zeichnen neu entstehen: Klick über das umgebende Element)
    $('info').addEventListener('click', (e) => {
      if (!(e.target instanceof Element) || !e.target.closest('#s-weiter') || z.modus !== 'struktur') return;
      const u = uebernahme();
      if ('grund' in u) return;
      z.entwurf = { ...u.struktur, striche: [], elemente: en().elemente, ae: en().ae, bindungen: st().bindungen };
      umstellung = u.umstellung; z.modus = 'entwurf'; werkzeug = 'verschieben';
      aktualisieren();
    });
    // Aus Link oder Speicher geöffnet mit Entwurf: nichts aufzuklappen; die Gruppenwahl steht offen in der Seitenleiste
  }

  /**
   * Vorgabe laden wie über die Auswahl, Anzeigen behalten, ein Motiv wählen (Erste Schritte). Anders als
   * die Auswahl bleibt das Symbol davor stehen, damit die Kenndaten die Änderung nennen.
   * @param {string} id Vorgabe @param {number | null} [k] Index des gewählten Motivs
   */
  function vorgabeZeigen(id, k = null) {
    const alt = st();
    z.modus = 'struktur'; modusAlt = 'struktur';
    z.struktur = { ...strukturStart(id), elemente: alt.elemente, zelle: alt.zelle, ae: alt.ae, bindungen: alt.bindungen };
    werkzeug = 'verschieben';
    gewaehlt = k; gewaehltOp = 0; umstellung = null;
  }
  /** Werkzeug über der Struktur setzen. @param {'verschieben' | 'hinzufuegen' | 'zeichnen' | 'radieren'} w */
  function werkzeugSetzen(w) { werkzeug = w; if (w !== 'verschieben') auswahlAufheben(); }

  /** Tafel A oder B in den Farben f, ohne Markierung der Auswahl (Bildexport). @param {Farben} f @param {string} tafel */
  function bild(f, tafel) {
    const s = gezeigt(); const r = gewaehlteGruppe();
    if (tafel === 'b') return strukturTafelB(s, f, r === undefined ? strukturSymmetrie(s) : r, z.zoomB, optionenB()).svg;
    return strukturTafelA(s, anzeigeA(s.basis), f, null, ansicht, r).svg;
  }

  /** Die Gruppe der gezeichneten Struktur: im Entwurf die gewählte, in „Gitter und Basis“ die bestimmte (null bei leerer Basis), aus dem Zwischenspeicher. @returns {Bestimmung | null} */
  const bestimmt = () => gewaehlteGruppe() ?? strukturSymmetrie(gezeigt());

  return { init, abgleichen, zeichnen, bild, touchstart, down, move, up, vorgabeZeigen, werkzeugSetzen, bestimmt, ansichtA: () => ansicht };
}
