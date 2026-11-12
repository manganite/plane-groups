// Browserlauf für „Symmetrie festhalten“ im Modus „Gitter und Basis“ (#121): bedient die App wie ein Mensch
// (Klicks, Ziehen mit der Maus) und prüft Zustand, Link-Adresse, Kenndaten und Konsole. Die Rechnung prüfen die
// Tests ohne Browser (tests/bahnen.test.mjs, tests/rundlauf.test.mjs); hier geht es um die Bedienung.
//
//   node tools/festhalten-pruefen.mjs
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
    const { strukturTafelA } = await laden('./js/struktur.js');
    /** @type {typeof import('../js/bahnen.js')} */
    const { ausgeschrieben } = await laden('./js/bahnen.js');
    const z = startzustand(); hashAnwenden(z, location.hash);
    const s = z.struktur;
    const farben = /** @type {any} */ (new Proxy({}, { get: () => '#000' }));
    const { ansicht } = strukturTafelA(ausgeschrieben(s), { elemente: s.elemente, zelle: s.zelle, ae: s.ae, bindungen: s.bindungen, farben: false }, farben);
    const svg = /** @type {SVGSVGElement} */ (document.querySelector('#bild-a'));
    // die Tafel ins Fenster holen: Je nach Länge der Seitenleiste scrollt die Seite beim Öffnen der Abschnitte
    svg.scrollIntoView({ block: 'center' });
    const b = ansicht.zuBild(q);
    const pt = new DOMPoint(b[0], b[1]).matrixTransform(/** @type {DOMMatrix} */ (svg.getScreenCTM()));
    return { x: pt.x, y: pt.y };
  }, p);
}

try {
  // 1. Einschalten übernimmt die bestimmte Gruppe (Dreiecksbeispiel: pm)
  await oeffnen('#m=struktur&v=dreieck1');
  await page.locator('#sec-sfest > summary').click();
  await page.locator('#s-fest').check();
  await page.waitForTimeout(200);
  pruefe((await adresse()).includes('sg=pm'), 'Einschalten: sg=pm in der Adresse');
  pruefe(await page.locator('#s-picker .pgb[data-g="pm"]').getAttribute('aria-pressed') === 'true', 'Einschalten: pm in der Gruppenwahl gewählt');

  // 2. Wahl von p4mm: Gitter quadratisch, Regler gesperrt
  await page.locator('#s-picker .pgb[data-g="p4mm"]').click();
  await page.waitForTimeout(200);
  const a2 = await adresse();
  pruefe(a2.includes('sg=p4mm') && a2.includes('ba=1&') && a2.includes('gamma=90'), 'Gruppe p4mm: Gitter quadratisch');
  pruefe(await page.locator('#s-ba').isDisabled() && await page.locator('#s-gamma').isDisabled(), 'Gruppe p4mm: Gitterregler gesperrt');

  // 3. Bild eines Fähnchens greifen und auf den Drehpunkt in der Zellmitte ziehen (Review #134, Befund 1)
  await oeffnen('#m=struktur&v=quadratisch&sg=p4mm&ba=1&gamma=90&basis=fahne,0,3/10,1/5,0');
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
  const a3 = await adresse();
  pruefe(/basis=fahne,0,1\/2,1\/2,/.test(a3), 'Ziehen: Vertreter rastet auf (½, ½) ein');
  pruefe(!(await page.locator('#s-spiegel').isChecked()), 'Nach dem Ziehen: Regler zeigen das gezeichnete Bild (nicht gespiegelt)');
  pruefe((await page.locator('#bild-a circle[stroke-dasharray="3 2.5"]').count()) > 0, 'Nach dem Ziehen: Auswahl markiert');
  pruefe((await text('#info')).includes('passen nicht zu ihrer Lage'), 'Kenndaten: Motiv passt nicht zur Lage');

  // 4. Ausschalten schreibt die Bahnen aus; neu laden ergibt denselben Zustand
  await oeffnen('#m=struktur&v=quadratisch&sg=p4&ba=1&gamma=90&basis=fahne,0,3/10,1/5,0');
  await page.locator('#s-fest').uncheck();
  await page.waitForTimeout(200);
  const a4 = await adresse();
  pruefe(!a4.includes('sg=') && (a4.match(/fahne/g) ?? []).length === 4, 'Ausschalten: vier Fähnchen, ohne sg');
  const kenn = await text('.hm-big');
  await page.reload(); await page.waitForTimeout(400);
  pruefe(await text('.hm-big') === kenn && await adresse() === a4, 'Neu laden: gleicher Zustand');

  // 5. Zufällige Zusatzsymmetrie und Übernehmen
  await oeffnen('#m=struktur&v=dreieck1&sg=p2mm&ba=1.35&gamma=90&basis=atom,0,1/2,1/2,0');
  await page.locator('#sec-sgitter > summary').click();
  pruefe(!(await page.locator('#s-metrik [data-metrik="1,90"]').isDisabled()), 'p2mm: „b = a, γ = 90°“ frei');
  await page.locator('#s-metrik [data-metrik="1,90"]').click();
  await page.waitForTimeout(400);
  pruefe((await text('#info')).includes('mehr Symmetrie als festgehalten'), 'b = a: Kenndaten melden mehr Symmetrie');
  await page.locator('#s-uebernehmen').click();
  await page.waitForTimeout(300);
  pruefe((await adresse()).includes('sg=p4mm'), 'Übernehmen: p4mm festgehalten');
  pruefe(await page.locator('#s-uebernehmen').isDisabled(), 'Nach dem Übernehmen: Knopf gesperrt');

  // 6. Übernahme mit Umstellung (Flechtverband: andere Zelle)
  await oeffnen('#m=struktur&v=flecht');
  await page.locator('#sec-sfest > summary').click();
  await page.locator('#s-fest').check();
  await page.waitForTimeout(300);
  pruefe((await adresse()).includes('sg=p4gm') && (await text('#info')).includes('gedreht'), 'Flechtverband: p4gm, Umstellung in den Kenndaten');

  pruefe(konsole.length === 0, `keine Fehler in der Konsole${konsole.length ? `: ${konsole.join(' | ')}` : ''}`);
} finally {
  await browser.close();
  srv.close();
}
if (fehler.length) { console.error(`${fehler.length} Prüfung(en) gescheitert`); process.exit(1); }
console.log('Alle Prüfungen bestanden');
