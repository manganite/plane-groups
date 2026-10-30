// Schreibweise wie in ITA: Querstrich nur für ein führendes Minus, Brüche als Zeichen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koordHTML, opHTML, bedingungHTML, zahlText, lageHTML } from '../js/text.js';

// Querstrich als kombinierendes Zeichen, verglichen in Normalform NFC (ȳ ist auch vorkomponiert)
const ohneTags = (s) => s.replace(/<span class="ov"><i>([xy])<\/i><\/span>/g, '$1̄').replace(/<[^>]+>/g, '').normalize('NFC');
const gleich = (a, b) => assert.equal(a, b.normalize('NFC'));

test('Koordinaten: führendes Minus als Querstrich, sonst Rechenzeichen', () => {
  gleich(ohneTags(koordHTML('-x+1/2,y')), 'x̄+½, y');
  gleich(ohneTags(koordHTML('-y,x-y')), 'ȳ, x−y');
  gleich(ohneTags(koordHTML('-x+y,-x')), 'x̄+y, x̄');
  gleich(ohneTags(koordHTML('-2x,-x')), '2x̄, x̄');
  gleich(ohneTags(koordHTML('x-y,-y')), 'x−y, ȳ');
  gleich(ohneTags(koordHTML('3/4,-y')), '¾, ȳ');
  gleich(ohneTags(koordHTML('2/3,1/3')), '⅔, ⅓');
});

test('Operationen wie in ITA', () => {
  gleich(ohneTags(opHTML('4+ 0,0')), '4+ 0, 0');
  gleich(ohneTags(opHTML('6- 0,0')), '6− 0, 0');
  gleich(ohneTags(opHTML('m 1/4,y')), 'm ¼, y');
  gleich(ohneTags(opHTML('g(1/2,1/2) x,x')), 'g(½, ½) x, x');
  gleich(ohneTags(opHTML('t(1/2,1/2)')), 't(½, ½)');
  gleich(ohneTags(opHTML('m x+1/2,-x')), 'm x+½, x̄');
});

test('Auslöschungen, Zahlen, Lagesymmetrie', () => {
  gleich(ohneTags(bedingungHTML(['h0', 'h=2n'])), 'h0: h = 2n');
  gleich(ohneTags(bedingungHTML(['hk', 'h+k=2n'])), 'hk: h + k = 2n');
  assert.equal(zahlText(0.25), '¼');
  assert.equal(zahlText(0), '0');
  assert.equal(zahlText(1 / 3), '⅓');
  assert.equal(zahlText(0.123), '0.123');
  gleich(ohneTags(lageHTML('2mm.')), '2mm.');
});
