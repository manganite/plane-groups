// „Schritt für Schritt“: Text in den Kenndaten (ohne DOM, Tests in Node). Blickrichtung „Erzeugen“
// (Konzept §1b, §3.1): Das Objekt wird mit jeder Operation der ITA-Liste abgebildet, dann mit den
// Gittertranslationen. Auf einer speziellen Lage fallen Bilder zusammen; übrig bleibt die
// Zähligkeit der Wyckoff-Lage.

import { opName } from './warum.js';
import { koordHTML, zahlText } from './text.js';
import { opNummer } from './zeichnung.js';

/** Stelle wie in der Lage-Anzeige der Kenndaten: „(0.120, 0.310)“, Brüche exakt. */
const stelle = (p) => `(${p.map((v) => zahlText(v).replace(/^-/, '−')).join(', ')})`;

/**
 * HTML des Kastens. d: schrittDaten(); daten: Gruppe aus ebenengruppen.js; l: lage() des Objekts;
 * ordnung: Zahl der Operationen je Zelle. Knöpfe: data-schritt (Schritt setzen), data-schritt-zu.
 */
export function schrittHTML(daten, d, l, ordnung) {
  const N = d.N;
  const knoepfe = `<div class="phasen"><button type="button" data-schritt="${Math.max(1, d.k - 1)}" ${d.k <= 1 ? 'disabled' : ''}>◀ zurück</button><button type="button" data-schritt="${Math.min(N + 1, d.k + 1)}" ${d.k > N ? 'disabled' : ''}>weiter ▶</button><button type="button" data-schritt-abspielen>Abspielen</button><button class="linkbtn" type="button" data-schritt-zu>Schliessen</button></div>`;
  const zaehler = `<p class="note">Bilder bisher: ${Math.min(d.k, N)} von ${N}; verschiedene Stellen (bis auf Gittertranslationen): <strong>${d.verschieden}</strong>.</p>`;
  if (d.translationen) {
    const speziell = !l.allgemein;
    return `<h3>Schritt ${N + 1} von ${N + 1}: die Gittertranslationen</h3>
      <p>Die Gittertranslationen verschieben jedes Bild in die Elementarzelle (Pfeile) und von dort in alle weiteren Zellen. Damit ist das ganze Muster erzeugt.</p>
      <p>Je Elementarzelle liegen <strong>${d.verschieden}</strong> Bilder an verschiedenen Stellen: ${speziell
    ? `die Zähligkeit der speziellen Lage ${l.zaehligkeit}<span class="wy">${l.buchstabe}</span>. Von den ${ordnung} Operationen je Zelle bilden je ${ordnung / l.zaehligkeit} das Objekt auf dieselbe Stelle ab.`
    : `so viele, wie die Gruppe Operationen je Zelle hat (${ordnung}). Das ist die Zähligkeit der allgemeinen Lage.`}</p>
      ${knoepfe}`;
  }
  const b = d.bilder[d.bilder.length - 1];
  const koord = koordHTML(daten.ops[b.nr - 1]) + (b.zentr ? ' + (½, ½)' : '');
  let fall = '';
  if (b.gleich !== null) {
    const j = d.bilder[b.gleich];
    fall = b.gitter
      ? `<p>Das Bild liegt bis auf eine Gittertranslation an derselben Stelle wie Bild (${opNummer(j)}): Es kommt keine neue Stelle hinzu. Das Objekt liegt auf einer speziellen Lage.</p>`
      : `<p>Das Bild fällt genau auf Bild (${opNummer(j)}): Die Operation hält das Objekt an seiner Stelle fest. Das Objekt liegt auf einer speziellen Lage; ein Fähnchen überlagert sich dort mit seinem Bild.</p>`;
  }
  const kopf = d.k === 1
    ? `<h3>Schritt 1 von ${N + 1}: die Identität</h3><p>Operation (1) ${koord}: Das Objekt bleibt, wo es ist ${stelle(b.punkt)}. Jeder weitere Schritt wendet die nächste Operation aus der Liste der Symmetrieoperationen an.${daten.zentrierung ? ' Die Operationen mit Strich (z. B. 2′) sind dieselben, zusätzlich um (½, ½) verschoben (Zentrierung).' : ''}</p>`
    : `<h3>Schritt ${d.k} von ${N + 1}: Operation (${opNummer(b)})</h3><p>${koord}: ${opName(b.op)}. Sie bringt das Objekt nach ${stelle(b.punkt)}${b.punkt.some((v) => v < -1e-9 || v > 1 + 1e-9) ? ', ausserhalb der Zelle; erst die Gittertranslationen im letzten Schritt verschieben es hinein' : ''}.</p>`;
  return `${kopf}${fall}${zaehler}${knoepfe}`;
}
