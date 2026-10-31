// „Symmetrie brechen“ (Konzept §3.1, Blickrichtung „Umkehren“): Text in den Kenndaten, ohne DOM.
// Löst man die Bindung des Gitters an das Kristallsystem, bleiben die Operationen, deren Matrix
// die neue Metrik erhält (gebrochen() in zeichnung.js). Die verbleibende Gruppe wird mit
// bestimme() in der Standardaufstellung benannt, mit konventioneller Zelle.

import { gebrochen, elementeImBereich, motivBahn } from './zeichnung.js';
import { bestimme } from './bestimmung.js';
import { elementSchluessel } from './herkunft.js';
import { vektorText } from './warum.js';

const SYSTEME = { schiefwinklig: 'schiefwinklig', rechteckig: 'rechteckig', quadratisch: 'quadratisch', hexagonal: 'hexagonal' };
const komma = (v, n = 2) => String(Number(v.toFixed(n))).replace('.', ',');
const richtung = (d) => `[${d.map((x) => (x < 0 ? `${-x}̄` : String(x))).join('')}]`;
const kursiv = (s) => s.replace(/([a-z])/g, '<i>$1</i>');

/**
 * Was beim freien Gitter von g übrig bleibt. Ergebnis: { bleibt, weg, ergebnis (bestimme()),
 * drehWeg: [{ n, neu }] (Zähligkeit vorher → nachher, neu = 1 heisst weggefallen),
 * linienWeg: [{ art, richtung }] (weggefallene Scharen) }.
 */
export function brechAnalyse(g, frei) {
  const b = gebrochen(g, frei);
  const ergebnis = bestimme({ a: b.M.a, b: b.M.b, punkte: motivBahn(g) });
  const vorher = elementeImBereich(g, 1); const nachher = elementeImBereich(b.H, 1);
  const drehWeg = [];
  for (const d of vorher.drehpunkte) {
    const h = nachher.drehpunkte.find((x) => Math.abs(x.punkt[0] - d.punkt[0]) < 1e-9 && Math.abs(x.punkt[1] - d.punkt[1]) < 1e-9);
    const neu = h ? h.n : 1;
    if (neu < d.n && !drehWeg.some((x) => x.n === d.n && x.neu === neu)) drehWeg.push({ n: d.n, neu });
  }
  const bleibenLinien = new Set(nachher.linien.map(elementSchluessel));
  const linienWeg = [];
  for (const l of vorher.linien) {
    if (bleibenLinien.has(elementSchluessel(l))) continue;
    if (!linienWeg.some((x) => x.art === l.art && x.richtung[0] === l.richtung[0] && x.richtung[1] === l.richtung[1])) linienWeg.push({ art: l.art, richtung: l.richtung });
  }
  return { bleibt: b.bleibt, weg: b.weg, ergebnis, drehWeg, linienWeg };
}

/** Konventionelle Zelle in a, b: „a′ = a + 2b“ usw., null wenn sie (bis auf Vorzeichen) a, b ist. */
function zellText(zelle) {
  const a = [zelle[0][0], zelle[1][0]]; const b = [zelle[0][1], zelle[1][1]];
  const gleich = (u, v) => Math.abs(Math.abs(u[0]) - v[0]) < 1e-9 && Math.abs(Math.abs(u[1]) - v[1]) < 1e-9;
  if (gleich(a, [1, 0]) && gleich(b, [0, 1])) return null;
  return `<i>a</i>′ = ${vektorText(a)}, <i>b</i>′ = ${vektorText(b)}`;
}

/** HTML des Kastens. daten: Gruppe nach ITA; frei: { ba, gamma }; an: Analyse aus brechAnalyse(). */
export function brechHTML(daten, frei, an) {
  const N = an.bleibt.length + an.weg.length;
  const kopf = `<h3>Symmetrie brechen: <i>b</i>/<i>a</i> = ${komma(frei.ba)}, γ = ${komma(frei.gamma, 1)}°</h3>`;
  if (!an.weg.length) {
    return `${kopf}<p>Diese Metrik passt noch zum Kristallsystem ${SYSTEME[daten.system]} von ${kursiv(daten.symbol)}: Alle ${N} Operationen je Zelle bleiben, die Symmetrie ist unverändert. Erst wenn <i>b</i>/<i>a</i> oder γ die Bindung des Systems verlassen, fallen Symmetrieelemente weg.</p>`;
  }
  const r = an.ergebnis;
  const teile = [];
  for (const d of an.drehWeg) teile.push(d.neu === 1 ? `die ${d.n}-zähligen Drehpunkte` : `die ${d.n}-zähligen Drehpunkte (bleiben ${d.neu}-zählig)`);
  const scharen = (art) => an.linienWeg.filter((l) => l.art === art).map((l) => richtung(l.richtung));
  if (scharen('spiegel').length) teile.push(`die Spiegellinien entlang ${scharen('spiegel').join(', ')}`);
  if (scharen('gleit').length) teile.push(`die Gleitspiegellinien entlang ${scharen('gleit').join(', ')}`);
  const zelle = r ? zellText(r.zelle) : null;
  return `${kopf}
    <p>Das Gitter passt nicht mehr zum Kristallsystem ${SYSTEME[daten.system]}. Es bleiben nur die Operationen, deren Drehung oder Spiegelung die neuen Längen und Winkel erhält: <strong>${an.bleibt.length} von ${N}</strong> je Zelle.</p>
    ${r ? `<p>Verbleibende Symmetrie: <strong>${kursiv(r.symbol)}</strong> (${SYSTEME[r.system]}), eine Untergruppe von ${kursiv(daten.symbol)}.${zelle ? ` Ihre konventionelle Zelle nach ITA: ${zelle}.` : ''}</p>` : ''}
    <p>Weggefallen: ${teile.join('; ')}. Im Symmetriegerüst sind sie blass.</p>`;
}
