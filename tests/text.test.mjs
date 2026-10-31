// Schreibweise wie in ITA: Querstrich nur für ein führendes Minus, Brüche als Zeichen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koordHTML, opHTML, bedingungHTML, zahlText, lageHTML, koordText, dezimal } from '../js/text.js';

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
  assert.equal(zahlText(0.123), '0,123');
  assert.equal(zahlText(0.12), '0,12');
  assert.equal(zahlText(-0.31), '−0,31');
  assert.equal(zahlText(-1 / 3), '−⅓');
  assert.equal(koordText([0.12, 0.31]), '(0,12; 0,31)');
  assert.equal(koordText([0.5, -0.25]), '(½, −¼)');
  assert.equal(koordText([0.5, 0.31]), '(½; 0,31)');
  assert.equal(dezimal(1.35, 2), '1,35');
  assert.equal(dezimal(-0.001, 2), '0,00');
  assert.equal(dezimal(105, 1), '105,0');
  assert.equal(dezimal(30, 1, { kuerzen: true }), '30');
  gleich(ohneTags(lageHTML('2mm.')), '2mm.');
});

test('Verweis in die Stereo-App: Pedion mit Flächenmuster, Blick senkrecht auf die Fläche (1 und m: Punktgruppe)', async () => {
  const { stereoLink, stereoHinweis, STEREO_HASH } = await import('../js/verweise.js');
  const { EBENENGRUPPEN } = await import('../js/ebenengruppen.js');
  assert.equal(Object.keys(STEREO_HASH).length, 11, '10 Punktgruppen, 3m in zwei Aufstellungen');
  for (const d of EBENENGRUPPEN) {
    const l = stereoLink(d);
    assert.match(l, /^https:\/\/manganite\.github\.io\/stereography\/index\.html#m=(form|pg)&/, d.symbol);
    assert.match(l, /&blick=[123]&/, d.symbol);
    if (l.includes('m=form')) assert.match(l, /f=[0-9a-z]+:a1&blick=[123]&muster=1&kugel=0&ns=0&ebene=0&strahlen=0&normalen=0&pole=0&achsen=1$/, d.symbol);
    assert.ok(!/undefined/.test(stereoHinweis(d)), d.symbol);
  }
  const l = (s) => stereoLink(EBENENGRUPPEN.find((d) => d.symbol === s));
  assert.equal(l('p31m'), 'https://manganite.github.io/stereography/index.html#m=form&sys=trigonal&f=31m:a1&blick=1&muster=1&kugel=0&ns=0&ebene=0&strahlen=0&normalen=0&pole=0&achsen=1');
  assert.match(l('p3m1'), /f=3m1:a1/);
  assert.equal(l('pm'), 'https://manganite.github.io/stereography/index.html#m=pg&g=mb&blick=3&kugel=0&ns=0&ebene=0&strahlen=0&achsen=1');
  assert.match(stereoHinweis(EBENENGRUPPEN.find((d) => d.symbol === 'pm')), /um 90° gedreht/);
  assert.equal(l('p1'), 'https://manganite.github.io/stereography/index.html#m=pg&g=1&blick=3&kugel=0&ns=0&ebene=0&strahlen=0&achsen=1');
});
