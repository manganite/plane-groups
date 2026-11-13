// „Schritt für Schritt“: Text in den Kenndaten (ohne DOM, Tests in Node). Blickrichtung „Erzeugen“
// (Konzept §1b, §3.1): Das Objekt wird mit jeder Operation der ITA-Liste abgebildet, dann mit den
// Gittertranslationen. Auf einer speziellen Lage fallen Bilder zusammen; übrig bleibt die
// Zähligkeit der Wyckoff-Lage.

import { opName } from './herkunft-text.js';
import { koordHTML, koordText } from './text.js';
import { opNummer } from './zeichnung.js';

/** @import { Vec2 } from '../lib/common/js/typen.js' */
/** @import { Ebenengruppe } from './ebenengruppen.js' */
/** @import { Lage } from './symmetrie.js' */
/** @import { schrittDaten } from './zeichnung.js' */

/** Stelle wie in der Lage-Anzeige der Kenndaten: „(0.120, 0.310)“, Brüche exakt. @param {Vec2} p */
const stelle = (p) => koordText(p);

/**
 * HTML des Kastens. d: schrittDaten(); daten: Gruppe aus ebenengruppen.js; l: lage() des Objekts;
 * ordnung: Zahl der Operationen je Zelle.
 * @param {Ebenengruppe} daten @param {ReturnType<typeof schrittDaten>} d @param {Lage} l @param {number} ordnung
 */
export function schrittHTML(daten, d, l, ordnung) {
  const N = d.N;
  // Durchschalten über die Leiste unter Tafel A (#162), nicht hier. Die Zahl der verschiedenen Stellen steht nur dort, wo
  // sie etwas sagt: wenn ein Bild zusammenfällt, und im letzten Schritt (Thomas, 13.11.2026; in allgemeiner Lage wäre sie
  // nur die Schrittnummer)
  const bisher = d.verschieden === 1
    ? `Bisher liegen alle ${d.k} Bilder an <strong>einer</strong> Stelle (bis auf Gittertranslationen).`
    : `Bisher <strong>${d.verschieden}</strong> verschiedene Stellen (bis auf Gittertranslationen) aus ${d.k} Bildern.`;
  if (d.translationen) {
    const speziell = !l.allgemein;
    return `<h3>Schritt ${N + 1} von ${N + 1}: die Gittertranslationen</h3>
      <p>Die Gittertranslationen verschieben jedes Bild in die Elementarzelle (Pfeile) und von dort in alle weiteren Zellen. Damit ist das ganze Muster erzeugt.</p>
      <p>Je Elementarzelle liegen <strong>${d.verschieden}</strong> Bilder an verschiedenen Stellen: ${speziell
    ? `die Zähligkeit der speziellen Lage ${l.zaehligkeit}<span class="wy">${l.buchstabe}</span>. Von den ${ordnung} Operationen je Zelle bilden je ${ordnung / l.zaehligkeit} das Objekt auf dieselbe Stelle ab.`
    : `so viele, wie die Gruppe Operationen je Zelle hat (${ordnung}). Das ist die Zähligkeit der allgemeinen Lage.`}</p>
`;
  }
  const b = d.bilder[d.bilder.length - 1];
  const koord = koordHTML(daten.ops[b.nr - 1]) + (b.zentr ? ' + (½, ½)' : '');
  let fall = '';
  if (b.gleich !== null) {
    const j = d.bilder[b.gleich];
    fall = b.gitter
      ? `<p>Das Bild liegt bis auf eine Gittertranslation an derselben Stelle wie Bild (${opNummer(j)}): Es kommt keine neue Stelle hinzu. Das Objekt liegt auf einer speziellen Lage. ${bisher}</p>`
      : `<p>Das Bild fällt genau auf Bild (${opNummer(j)}): Die Operation hält das Objekt an seiner Stelle fest. Das Objekt liegt auf einer speziellen Lage; ein Fähnchen überlagert sich dort mit seinem Bild. ${bisher}</p>`;
  }
  const kopf = d.k === 1
    ? `<h3>Schritt 1 von ${N + 1}: die Identität</h3><p>Operation (1) ${koord}: Das Objekt bleibt, wo es ist ${stelle(b.punkt)}. Jeder weitere Schritt wendet die nächste Operation aus der Liste der Symmetrieoperationen an.${daten.zentrierung ? ' Die Operationen mit Strich (z. B. 2′) sind dieselben, zusätzlich um (½, ½) verschoben (Zentrierung).' : ''}</p>`
    : `<h3>Schritt ${d.k} von ${N + 1}: Operation (${opNummer(b)})</h3><p>${koord}: ${opName(b.op)}. Sie bringt das Objekt nach ${stelle(b.punkt)}${b.punkt.some((v) => v < -1e-9 || v > 1 + 1e-9) ? ', ausserhalb der Zelle; erst die Gittertranslationen im letzten Schritt verschieben es hinein' : ''}.</p>`;
  return `${kopf}${fall}`;
}
