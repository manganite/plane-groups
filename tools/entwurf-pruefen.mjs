// Browserlauf für den Modus „Muster entwerfen“ (#136; vorher „Symmetrie festhalten“, #121): bedient die App wie ein
// Mensch (Klicks, Ziehen mit der Maus) und prüft Zustand, Link-Adresse, Kenndaten und Konsole. Die Rechnung prüfen die
// Tests ohne Browser (tests/bahnen.test.mjs, tests/rundlauf.test.mjs); hier geht es um die Bedienung.
//
//   node tools/entwurf-pruefen.mjs
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium);
// ein anderes Chromium mit KONTRASTE_CHROME=<Pfad>. Ende mit Code 1, wenn eine Prüfung scheitert.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { server } from './common/server.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
/** @type {typeof import('playwright')} */
const { chromium } = require('playwright');

/** @type {string[]} */
const fehler = [];
/** @param {boolean} ok @param {string} was */
const pruefe = (ok, was) => { console.log(`${ok ? '✓' : '✗'} ${was}`); if (!ok) fehler.push(was); };

const srv = await server(ROOT);
const basis = `http://127.0.0.1:${/** @type {import('node:net').AddressInfo} */ (srv.address()).port}/`;
const chrome = process.env.KONTRASTE_CHROME;
const browser = await chromium.launch(chrome ? { executablePath: chrome } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
const page = await ctx.newPage();
/** @type {string[]} */
const konsole = [];
page.on('pageerror', (e) => konsole.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') konsole.push(m.text()); });

/** Link öffnen (neu laden, damit der Zustand aus der Adresse kommt). @param {string} hash */
async function oeffnen(hash) {
  await page.goto(`${basis}index.html${hash}`);
  await page.waitForSelector('#bild-a *', { state: 'attached' });
  await page.waitForTimeout(300);
}
/** Kurzer Text der Seite. @param {string} sel */
const text = (sel) => page.locator(sel).first().innerText();
/** Aktuelle Link-Adresse. */
const adresse = () => page.evaluate(() => decodeURIComponent(location.hash));

/**
 * Bildschirmkoordinaten einer Lage p (Bruchkoordinaten der gegebenen Zelle) in Tafel A, aus derselben Ansicht, die
 * die App zeichnet (strukturTafelA mit dem Zustand aus der Adresse).
 * @param {[number, number]} p @returns {Promise<{ x: number, y: number }>}
 */
function bildschirm(p) {
  return page.evaluate(async (q) => {
    // Module der App, relativ zur Seite geladen (nicht zu dieser Datei)
    const laden = (/** @type {string} */ u) => import(u);
    /** @type {typeof import('../js/zustand.js')} */
    const { startzustand, hashAnwenden } = await laden('./js/zustand.js');
    /** @type {typeof import('../js/struktur.js')} */
    const { strukturTafelA, festeBestimmung } = await laden('./js/struktur.js');
    /** @type {typeof import('../js/bahnen.js')} */
    const { ausgeschrieben } = await laden('./js/bahnen.js');
    const z = startzustand(); hashAnwenden(z, location.hash);
    const s = z.entwurf;
    const farben = /** @type {any} */ (new Proxy({}, { get: () => '#000' }));
    const { ansicht } = strukturTafelA(ausgeschrieben(s), { elemente: s.elemente, zelle: true, ae: s.ae, bindungen: false, farben: false }, farben, null, null, festeBestimmung(s));
    const svg = /** @type {SVGSVGElement} */ (document.querySelector('#bild-a'));
    // die Tafel ins Fenster holen: Je nach Länge der Seitenleiste scrollt die Seite beim Öffnen der Abschnitte
    svg.scrollIntoView({ block: 'center' });
    const b = ansicht.zuBild(q);
    const pt = new DOMPoint(b[0], b[1]).matrixTransform(/** @type {DOMMatrix} */ (svg.getScreenCTM()));
    return { x: pt.x, y: pt.y };
  }, p);
}

try {
  // 1. Leerer Entwurf: Hinweis, Werkzeug „Hinzufügen“ schon gewählt
  await oeffnen('#m=entwurf&g=p4mm');
  pruefe((await text('#info')).includes('Der Entwurf ist leer'), 'Leerer Entwurf: Kenndaten sagen es');
  pruefe(await page.locator('#s-werkzeug-hinzufuegen').getAttribute('aria-pressed') === 'true', 'Leerer Entwurf: Werkzeug „Hinzufügen“ gewählt');

  // 2. Motiv setzen: ein Klick in die Zelle erzeugt acht Bilder in p4mm
  const ziel = await bildschirm([0.3, 0.2]);
  await page.mouse.click(ziel.x, ziel.y);
  await page.waitForTimeout(300);
  pruefe((await adresse()).includes('basis='), 'Klick: Vertreter in der Adresse');
  pruefe(/\b8\b/.test(await text('#info table')), 'Klick: Kenndaten nennen 8 Bilder je Zelle');

  // 3. Wahl von p6mm: Gitter hexagonal, Gruppe in der Adresse, Vertreter bleibt
  await page.locator('#e-picker .pgb[data-g="p6mm"]').click();
  await page.waitForTimeout(250);
  const a3 = await adresse();
  pruefe(a3.includes('g=p6mm') && a3.includes('basis='), 'Gruppe p6mm: Adresse mit Gruppe und Vertreter');
  pruefe(await page.locator('#s-ba').isDisabled() && await page.locator('#s-gamma').isDisabled(), 'Gruppe p6mm: Gitterregler gesperrt');

  // 4. Bild eines Fähnchens greifen und auf den Drehpunkt in der Zellmitte ziehen (Review #134, Befund 1)
  await oeffnen('#m=entwurf&g=p4mm&basis=fahne,0,3/10,1/5,0');
  // Bild unter der Spiegelung (x, −y) bei (0,3; 0,8): nicht der Vertreter
  const von = await bildschirm([0.3, 0.8]);
  await page.mouse.click(von.x, von.y);
  await page.waitForTimeout(150);
  pruefe((await text('#s-basis-titel')).includes('Bahn 1 von 1'), 'Bild gewählt: Titel nennt die Bahn');
  pruefe(await page.locator('#s-spiegel').isChecked(), 'Bild gewählt: Regler zeigen das Bild (gespiegelt)');
  const nach = await bildschirm([0.5, 0.5]);
  await page.mouse.move(von.x, von.y);
  await page.mouse.down();
  await page.mouse.move((von.x + nach.x) / 2, (von.y + nach.y) / 2, { steps: 5 });
  await page.mouse.move(nach.x, nach.y, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const a4 = await adresse();
  pruefe(/basis=fahne,0,1\/2,1\/2,/.test(a4), 'Ziehen: Vertreter rastet auf (½, ½) ein');
  pruefe((await text('#info')).includes('Überlagerte Bilder'), 'Kenndaten: Bilder überlagert (Fähnchen auf dem Drehpunkt)');

  // 5. Neu laden ergibt denselben Zustand
  await page.reload(); await page.waitForTimeout(400);
  pruefe(await adresse() === a4 && (await text('#info')).includes('Überlagerte Bilder'), 'Neu laden: gleicher Zustand');

  // 6. Übergang aus „Gitter und Basis“ mit Umstellung (Flechtverband: andere Zelle)
  await oeffnen('#m=struktur&v=flecht');
  await page.locator('#sec-weiter > summary').click();
  await page.locator('#s-weiter').click();
  await page.waitForTimeout(300);
  pruefe((await adresse()).includes('m=entwurf&g=p4gm') && (await text('#info')).includes('gedreht'), 'Flechtverband: p4gm, Umstellung in den Kenndaten');
  pruefe(await page.locator('#tab-entwurf').getAttribute('aria-selected') === 'true', 'Übergang: Tab „Muster entwerfen“ gewählt');

  pruefe(konsole.length === 0, `keine Fehler in der Konsole${konsole.length ? `: ${konsole.join(' | ')}` : ''}`);
} finally {
  await browser.close();
  srv.close();
}
if (fehler.length) { console.error(`${fehler.length} Prüfung(en) gescheitert`); process.exit(1); }
console.log('Alle Prüfungen bestanden');
