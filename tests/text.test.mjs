// Schreibweise wie in ITA: Querstrich nur für ein führendes Minus, Brüche als Zeichen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koordHTML, opHTML, zahlText, lageHTML, koordText, dezimal, richtungHTML, richtungenLegende } from '../js/text.js';
import { gruppe } from '../js/symmetrie.js';
import { elementeImBereich } from '../js/zeichnung.js';

// Querstrich als kombinierendes Zeichen, verglichen in Normalform NFC (ȳ ist auch vorkomponiert)
/** @param {string} s */
const ohneTags = (s) => s.replace(/<span class="ov"><i>([xy])<\/i><\/span>/g, '$1̄').replace(/<[^>]+>/g, '').normalize('NFC');
/** @param {string} a @param {string} b */
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

test('Zahlen, Lagesymmetrie', () => {
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
  assert.equal(richtungHTML([-1, 1]), '[<span class="ov">1</span>1]');
  assert.equal(richtungHTML([1, 2]), '[12]');
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
  /** @param {string} s */
  const l = (s) => stereoLink(/** @type {import('../js/ebenengruppen.js').Ebenengruppe} */ (EBENENGRUPPEN.find((d) => d.symbol === s)));
  assert.equal(l('p31m'), 'https://manganite.github.io/stereography/index.html#m=form&sys=trigonal&f=31m:a1&blick=1&muster=1&kugel=0&ns=0&ebene=0&strahlen=0&normalen=0&pole=0&achsen=1');
  assert.match(l('p3m1'), /f=3m1:a1/);
  assert.equal(l('pm'), 'https://manganite.github.io/stereography/index.html#m=pg&g=mb&blick=3&kugel=0&ns=0&ebene=0&strahlen=0&achsen=1');
  assert.match(stereoHinweis(/** @type {import('../js/ebenengruppen.js').Ebenengruppe} */ (EBENENGRUPPEN.find((d) => d.symbol === 'pm'))), /um 90° gedreht/);
  assert.equal(l('p1'), 'https://manganite.github.io/stereography/index.html#m=pg&g=1&blick=3&kugel=0&ns=0&ebene=0&strahlen=0&achsen=1');
});

test('Legende der Blickrichtungen: je Position mit Linien ein Eintrag, im schiefwinkligen System keiner', () => {
  const F = { paper: '#fff', ink: '#000', muted: '#888', line: '#ccc', accent: '#a00', accent2: '#0a0', upper: '#00a', crystal: '#eef', dir: ['#a0a', '#0aa', '#aa0'], fc3: '#333', fc4: '#444' };
  /** @param {string} id */
  const legende = (id) => { const g = gruppe(id); return richtungenLegende(g.daten.system, elementeImBereich(g, 1).linien, F); };
  assert.deepEqual(legende('p2'), []);
  assert.equal(legende('pm').length, 1); // eine Position
  assert.equal(legende('p2mm').length, 2);
  assert.ok(legende('p2mm')[0].includes(F.dir[1]) && legende('p2mm')[1].includes(F.dir[2]));
  assert.ok(legende('p4mm').every((e) => e.includes('Normale ∥')));
});
