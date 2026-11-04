// „Symmetrie brechen“ (Konzept §3.1, Blickrichtung „Umkehren“): Text in den Kenndaten, ohne DOM.
// Löst man die Bindung des Gitters an das Kristallsystem, bleiben die Operationen, deren Matrix
// die neue Metrik erhält (gebrochen() in zeichnung.js). Die verbleibende Gruppe wird mit
// bestimme() in der Standardaufstellung benannt, mit konventioneller Zelle.

import { gebrochen, elementeImBereich, motivBahn } from './zeichnung.js';
import { bestimme } from './bestimmung.js';
import { elementSchluessel } from './herkunft.js';
import { vektorText } from './warum.js';
import { dezimal, richtungHTML } from './text.js';

/** @import { Vec2, Mat2 } from '../lib/common/js/typen.js' */
/** @import { Gruppe } from './symmetrie.js' */
/** @import { Gitter } from './zeichnung.js' */
/** @import { Bestimmung } from './bestimmung.js' */
/** @import { Ebenengruppe, System } from './ebenengruppen.js' */
/**
 * Ergebnis von brechAnalyse() (siehe dort).
 * @typedef {{ bleibt: import('./symmetrie.js').Op[], weg: import('./symmetrie.js').Op[], ergebnis: Bestimmung | null, drehWeg: { n: number, neu: number }[], linienWeg: { art: 'spiegel' | 'gleit', richtung: Vec2 }[], bahnen: number }} Brechanalyse
 */

/** @type {Record<System, string>} */
const SYSTEME = { schiefwinklig: 'schiefwinklig', rechteckig: 'rechteckig', quadratisch: 'quadratisch', hexagonal: 'hexagonal' };
/** @param {number} v */
const komma = (v, n = 2) => dezimal(v, n, { kuerzen: true });
const richtung = richtungHTML;
/** @param {string} s */
const kursiv = (s) => s.replace(/([a-z])/g, '<i>$1</i>');

/**
 * Was beim freien Gitter von g übrig bleibt. Ergebnis: { bleibt, weg, ergebnis (bestimme()),
 * drehWeg: [{ n, neu }] (Zähligkeit vorher → nachher, neu = 1 heisst weggefallen),
 * linienWeg: [{ art, richtung }] (weggefallene Scharen) }.
 * @param {Gruppe} g
 * @param {Gitter} frei
 * @returns {Brechanalyse}
 */
export function brechAnalyse(g, frei) {
  const b = gebrochen(g, frei);
  const ergebnis = bestimme({ a: b.M.a, b: b.M.b, punkte: motivBahn(g) });
  const vorher = elementeImBereich(g, 1); const nachher = elementeImBereich(b.H, 1);
  /** @type {{ n: number, neu: number }[]} */
  const drehWeg = [];
  for (const d of vorher.drehpunkte) {
    const h = nachher.drehpunkte.find((x) => Math.abs(x.punkt[0] - d.punkt[0]) < 1e-9 && Math.abs(x.punkt[1] - d.punkt[1]) < 1e-9);
    const neu = h ? h.n : 1;
    if (neu < d.n && !drehWeg.some((x) => x.n === d.n && x.neu === neu)) drehWeg.push({ n: d.n, neu });
  }
  const bleibenLinien = new Set(nachher.linien.map(elementSchluessel));
  /** @type {{ art: 'spiegel' | 'gleit', richtung: Vec2 }[]} */
  const linienWeg = [];
  for (const l of vorher.linien) {
    if (bleibenLinien.has(elementSchluessel(l))) continue;
    if (!linienWeg.some((x) => x.art === l.art && x.richtung[0] === l.richtung[0] && x.richtung[1] === l.richtung[1])) linienWeg.push({ art: l.art, richtung: l.richtung });
  }
  return { bleibt: b.bleibt, weg: b.weg, ergebnis, drehWeg, linienWeg, bahnen: b.bahnen };
}

/** Konventionelle Zelle in a, b: „a′ = a + 2b“ usw., null wenn sie (bis auf Vorzeichen) a, b ist. @param {Mat2} zelle */
function zellText(zelle) {
  /** @type {Vec2} */
  const a = [zelle[0][0], zelle[1][0]];
  /** @type {Vec2} */
  const b = [zelle[0][1], zelle[1][1]];
  /** @param {Vec2} u @param {Vec2} v */
  const gleich = (u, v) => Math.abs(Math.abs(u[0]) - v[0]) < 1e-9 && Math.abs(Math.abs(u[1]) - v[1]) < 1e-9;
  if (gleich(a, [1, 0]) && gleich(b, [0, 1])) return null;
  return `<i>a</i>′ = ${vektorText(a)}, <i>b</i>′ = ${vektorText(b)}`;
}

/** HTML des Kastens. daten: Gruppe nach ITA; frei: { ba, gamma }; an: Analyse aus brechAnalyse(). @param {Ebenengruppe} daten @param {Gitter} frei @param {Brechanalyse} an */
export function brechHTML(daten, frei, an) {
  const N = an.bleibt.length + an.weg.length;
  const kopf = `<h3>Symmetrie brechen: <i>b</i>/<i>a</i> = ${komma(frei.ba)}, γ = ${komma(frei.gamma, 1)}°</h3>`;
  if (!an.weg.length) {
    return `${kopf}<p>Diese Metrik passt noch zum Kristallsystem ${SYSTEME[daten.system]} von ${kursiv(daten.symbol)}: Alle ${N} Operationen je Zelle bleiben, die Symmetrie ist unverändert. Erst wenn <i>b</i>/<i>a</i> oder γ die Bindung des Systems verlassen, fallen Symmetrieelemente weg.</p>`;
  }
  const r = an.ergebnis;
  /** @type {string[]} */
  const teile = [];
  for (const d of an.drehWeg) teile.push(d.neu === 1 ? `die ${d.n}-zähligen Drehpunkte` : `die ${d.n}-zähligen Drehpunkte (bleiben ${d.neu}-zählig)`);
  /** @param {'spiegel' | 'gleit'} art */
  const scharen = (art) => an.linienWeg.filter((l) => l.art === art).map((l) => richtung(l.richtung));
  if (scharen('spiegel').length) teile.push(`die Spiegellinien entlang ${scharen('spiegel').join(', ')}`);
  if (scharen('gleit').length) teile.push(`die Gleitspiegellinien entlang ${scharen('gleit').join(', ')}`);
  const zelle = r ? zellText(r.zelle) : null;
  return `${kopf}
    <p>Das Gitter passt nicht mehr zum Kristallsystem ${SYSTEME[daten.system]}. Es bleiben nur die Operationen, deren Drehung oder Spiegelung die neuen Längen und Winkel erhält: <strong>${an.bleibt.length} von ${N}</strong> je Zelle.</p>
    ${r ? `<p>Verbleibende Symmetrie: <strong>${kursiv(r.symbol)}</strong> (${SYSTEME[r.system]}), eine Untergruppe von ${kursiv(daten.symbol)}.${zelle ? ` Ihre konventionelle Zelle nach ITA: ${zelle}.` : ''}</p>` : ''}
    <p>Weggefallen: ${teile.join('; ')}. Das Symmetriegerüst zeigt nur noch, was bleibt${r && r.symbol !== daten.symbol ? '; die Färbung nach Blickrichtung ist aus, weil die Restgruppe eine andere Aufstellung hat' : ''}.</p>
    ${an.bahnen > 1 ? `<p>Die ${N} Bilder des Objekts je Zelle zerfallen in <strong>${an.bahnen} Bahnen</strong> der Restsymmetrie (Farben): Bilder verschiedener Farbe sind nicht mehr gleichwertig. Keine verbleibende Operation führt sie ineinander über.</p>` : ''}`;
}
