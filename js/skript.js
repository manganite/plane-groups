// Skript der Symmetrie in der Ebene: zeichnet die Abbildungen mit dem Code der App. Inhaltsverzeichnis, App-Links,
// Querstriche und Nachladen kommen aus lib/common/js/skript-kern.js.

import { appLink, inhaltsverzeichnis, querstriche } from '../lib/common/js/skript-kern.js';
import { versionEintragen, offline } from '../lib/common/js/seite.js';
import { VERSION } from './version.js';

const farbe = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

/** Eine Abbildung zu ihrer Link-Adresse (data-app) zeichnen; hier nur ein Muster. */
function zeichne(fig) {
  const pts = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) pts.push(`<circle cx="${260 + 70 * i}" cy="${260 + 70 * j}" r="5" fill="${farbe('ink')}"/>`);
  fig.querySelector('svg').innerHTML = `<rect width="520" height="520" fill="${farbe('paper')}"/>${pts.join('')}`;
}

function abbildungen() {
  for (const fig of document.querySelectorAll('figure[data-app]')) {
    appLink(fig, 'index.html');
    zeichne(fig);
  }
}

versionEintragen(VERSION);
abbildungen();
inhaltsverzeichnis();
document.fonts.ready.then(querstriche);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { abbildungen(); querstriche(); });
offline();
