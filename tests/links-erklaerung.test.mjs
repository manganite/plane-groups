// Link-Adressen in Skript, Quiz und Hilfen, die eine Erklärung zeigen (schritt, aufbau, herkunft, erkl): Nach der
// Prüfung von Link und Speicher (zustandPruefen) muss die Erklärung erhalten bleiben. Sonst zeigt eine Abbildung oder
// „In der App öffnen“ nur das Gerüst (Review zu „Herkunft der Elemente“ als dritte Erklärung, 13.11.2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BANK } from '../js/quiz-bank.js';
import { ERSTE_SCHRITTE, ABLAEUFE } from '../js/hilfetexte.js';
import { startzustand, hashAnwenden } from '../js/zustand.js';

/** Alle Link-Adressen mit einer Erklärung, mit ihrer Herkunft für die Meldung. @returns {[string, string][]} */
function adressen() {
  /** @type {[string, string][]} */
  const liste = [];
  const skript = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');
  for (const m of skript.matchAll(/data-app="([^"]+)"/g)) liste.push(['skript.html', m[1].replace(/&amp;/g, '&')]);
  for (const f of BANK) {
    for (const feld of /** @type {const} */ (['app', 'bild'])) {
      const v = /** @type {Record<string, unknown>} */ (f)[feld];
      if (typeof v === 'string') liste.push([`${f.id}.${feld}`, v.replace(/^B/, '').replace(/@[\d.]+$/, '')]);
    }
  }
  const json = JSON.stringify([ERSTE_SCHRITTE, ABLAEUFE]);
  for (const m of json.matchAll(/"(#m=[^"]+)"/g)) liste.push(['hilfetexte.js', m[1]]);
  return liste.filter(([, h]) => h.startsWith('#') && /[#&](schritt|aufbau|herkunft|erkl)=/.test(h));
}

test('Link-Adressen mit Erklärung: Erklärung bleibt nach der Prüfung erhalten', () => {
  const liste = adressen();
  assert.ok(liste.length >= 10, `zu wenige Adressen gefunden (${liste.length})`);
  for (const [wo, h] of liste) {
    const q = new URLSearchParams(h.slice(1));
    const z = startzustand();
    hashAnwenden(z, h);
    if (q.has('erkl')) assert.equal(z.erkl, q.get('erkl'), `${wo}: ${h}`);
    if (q.has('schritt')) assert.equal(z.schritt, Number(q.get('schritt')), `${wo}: ${h}`);
    if (q.has('aufbau')) assert.equal(z.aufbau, Number(q.get('aufbau')), `${wo}: ${h}`);
    if (q.get('herkunft') === '1') assert.equal(z.herkunft, true, `${wo}: ${h}`);
  }
});
