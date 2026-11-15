// Abschnittsnummern und Verweise im Skript (Leitfaden Abschn. 6, crystallography-common#85)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pruefeAbschnittsverweise } from '../lib/common/js/skript-kern.js';

const html = readFileSync(new URL('../skript.html', import.meta.url), 'utf8');

test('Verweise auf Abschnitte treffen einen Abschnitt', () => {
  const { befunde, verweise } = pruefeAbschnittsverweise(html);
  assert.deepEqual(befunde, []);
  assert.ok(verweise > 0, 'das Skript verweist mit Nummern');
  // Verweise nennen die Nummer (Leitfaden Abschn. 6), nicht „nächster Abschnitt“ oder den Titel
  assert.doesNotMatch(html, /(nächste[nrs]?|vorige[nrs]?) Abschnitt|Abschnitts? „/);
});
