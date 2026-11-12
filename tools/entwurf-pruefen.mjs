// Browserlauf für den Modus „Muster entwerfen“ (#136; vorher „Symmetrie festhalten“, #121): bedient die App wie ein
// Mensch (Klicks, Ziehen mit der Maus) und prüft Zustand, Link-Adresse, Kenndaten und Konsole. Die Rechnung prüfen die
// Tests ohne Browser (tests/bahnen.test.mjs, tests/rundlauf.test.mjs); hier geht es um die Bedienung.
//
//   node tools/entwurf-pruefen.mjs
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium);
// ein anderes Chromium mit CHROMIUM_PFAD=<Pfad>. Ende mit Code 1, wenn eine Prüfung scheitert.

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
const chrome = process.env.CHROMIUM_PFAD;
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

  // 6. Übergang aus „Gitter und Basis“ mit Umstellung (Flechtverband: andere Zelle); die Wahl „Bindungen“ geht mit
  await oeffnen('#m=struktur&v=flecht&sbind=0');
  await page.locator('#sec-weiter > summary').click();
  await page.locator('#s-weiter').click();
  await page.waitForTimeout(300);
  pruefe((await adresse()).includes('m=entwurf&g=p4gm') && (await text('#info')).includes('gedreht'), 'Flechtverband: p4gm, Umstellung in den Kenndaten');
  pruefe(await page.locator('#tab-entwurf').getAttribute('aria-selected') === 'true', 'Übergang: Tab „Muster entwerfen“ gewählt');
  pruefe(!(await page.locator('#e-bindungen').isChecked()) && (await adresse()).includes('bind=0'), 'Übergang: „Bindungen aus“ wird übernommen');

  // 7. Zeichnen und Radieren im Entwurf: Striche mit allen Operationen, Farbe der Atomsorte, Rückgängig, Alles löschen
  await oeffnen('#m=entwurf&g=p4mm');
  const striche = () => page.locator('#bild-a g.striche path').count();
  const stricheB = () => page.locator('#bild-b g.striche path').count();
  pruefe(await page.locator('#s-werkzeug-zeichnen').isVisible() && await page.locator('#sec-zeichnen').isVisible(), 'Zeichnen: Werkzeug und Abschnitt im Entwurf sichtbar');
  await page.locator('#s-werkzeug-radieren').isDisabled().then((d) => pruefe(d, 'Radieren gesperrt, solange es keine Striche gibt'));
  await page.locator('#s-farbe button[data-farbe="2"]').click();
  await page.locator('#s-werkzeug-zeichnen').click();
  const z0 = await bildschirm([0.15, 0.2]); const z1 = await bildschirm([0.35, 0.3]);
  await page.mouse.move(z0.x, z0.y); await page.mouse.down();
  await page.mouse.move((z0.x + z1.x) / 2, (z0.y + z1.y) / 2, { steps: 6 }); await page.mouse.move(z1.x, z1.y, { steps: 6 });
  await page.mouse.up(); await page.waitForTimeout(300);
  const nA = await striche();
  pruefe(nA >= 8 && await stricheB() >= 8, `Strich erscheint mit allen 8 Operationen von p4mm (Tafel A: ${nA}, Muster: ${await stricheB()})`);
  const farbenA = await page.locator('#bild-a g.striche path').evaluateAll((l) => [...new Set(l.map((e) => e.getAttribute('stroke')))]);
  pruefe(farbenA.length === 1, `alle Kopien in einer Farbe, auch Spiegelbilder (${farbenA.join(', ')})`);
  pruefe(!(await adresse()).includes('striche'), 'Striche stehen nicht in der Link-Adresse');
  pruefe(await page.locator('#s-werkzeug-zeichnen').getAttribute('aria-pressed') === 'true', 'Zeichnen gewählt, die Werkzeuge schliessen sich aus');
  // Radieren mitten durch den Strich teilt ihn
  await page.locator('#s-werkzeug-radieren').click();
  pruefe(await page.locator('#s-werkzeug-zeichnen').getAttribute('aria-pressed') === 'false', 'Radieren wählt Zeichnen ab');
  const mitte = await bildschirm([0.25, 0.25]);
  await page.mouse.move(mitte.x, mitte.y); await page.mouse.down(); await page.mouse.move(mitte.x + 1, mitte.y + 1, { steps: 2 }); await page.mouse.up();
  await page.waitForTimeout(300);
  const nR = await striche();
  pruefe(nR > nA, `Radieren teilt den Strich an allen Kopien (${nA} → ${nR} Pfade)`);
  pruefe(await page.locator('#bild-a g.striche path').evaluateAll((l) => new Set(l.map((e) => e.getAttribute('stroke'))).size) === 1, 'Teile behalten ihre Farbe');
  await page.locator('#zeichnen-zurueck').click(); await page.waitForTimeout(200);
  pruefe(await striche() === nA, 'Rückgängig holt das Radieren zurück');
  // Motive und Striche zugleich
  await page.locator('#s-werkzeug-hinzufuegen').click();
  const m = await bildschirm([0.7, 0.6]); await page.mouse.click(m.x, m.y); await page.waitForTimeout(300);
  pruefe((await adresse()).includes('basis=') && await striche() === nA, 'Motiv und Striche nebeneinander');
  // Striche überstehen Neuladen (Speicher) und den Wechsel der Gruppe
  await page.reload(); await page.waitForTimeout(400);
  pruefe(await striche() === nA, 'Neu laden: Striche aus dem Speicher');
  await page.locator('#e-picker [data-g="p4gm"]').click(); await page.waitForTimeout(300);
  pruefe(await striche() >= 8, 'Wechsel der Gruppe behält die Striche (neu vervielfältigt)');
  await page.locator('#zeichnen-loeschen').click(); await page.waitForTimeout(200);
  pruefe(await striche() === 0, 'Alles löschen');
  await page.locator('#zeichnen-zurueck').click(); await page.waitForTimeout(200);
  pruefe(await striche() >= 8, 'Rückgängig holt die gelöschten Striche zurück');
  await page.locator('#tab-eg').click(); await page.waitForTimeout(200);
  pruefe(await page.locator('#sec-zeichnen').isHidden() && await page.locator('#werkzeug-zeichnen').count() === 0, '„Ebenengruppen“ hat kein Zeichnen mehr');

  // 8. Bindungen (nächste Nachbarn) im Entwurf: Schalter, Linien zwischen Atomen, Adresse
  await oeffnen('#m=entwurf&g=p4mm&basis=atom,0,1/10,1/5,0');
  const bindungenA = () => page.locator('#bild-a path[stroke-width="1.6"]').count();
  pruefe(await page.locator('#e-bindungen').isChecked() && await bindungenA() === 1, 'Bindungen: standardmässig an, Linien zwischen den Atomen');
  await page.locator('#e-bindungen').uncheck(); await page.waitForTimeout(200);
  pruefe(await bindungenA() === 0 && (await adresse()).includes('bind=0'), 'Bindungen aus: keine Linien, bind=0 in der Adresse');
  await page.reload(); await page.waitForTimeout(400);
  pruefe(!(await page.locator('#e-bindungen').isChecked()), 'Bindungen aus überstehen das Neuladen');

  // 9. Regler der Motivgrösse: logarithmisch, Mitte = Geometrisches Mittel von 0,02 und 1
  await oeffnen('#m=entwurf&g=p4mm');
  await page.locator('#s-groesse').evaluate((el) => { /** @type {HTMLInputElement} */ (el).value = '125'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(200);
  pruefe((await text('#s-groesse-out')) === '0,141', `Grösse: Reglermitte ergibt 0,141 (${await text('#s-groesse-out')})`);
  pruefe(await page.locator('#s-groesse').inputValue() === '125', 'Grösse: Regler bleibt stehen');

  // 10. Ziegel: Schalter „Mit Fuge“ (nur beim Ziegel wählbar), Adresse trägt „f“
  await oeffnen('#m=entwurf&g=p2mm&basis=ziegel,0,1/2,1/2,0,0.25');
  await page.locator('#s-werkzeug-verschieben').click();
  const mitte10 = await bildschirm([0.5, 0.5]); await page.mouse.click(mitte10.x, mitte10.y); await page.waitForTimeout(250);
  pruefe(await page.locator('#s-fuge').isEnabled() && !(await page.locator('#s-fuge').isChecked()), 'Ziegel gewählt: „Mit Fuge“ wählbar, aus');
  await page.locator('#s-fuge').check(); await page.waitForTimeout(250);
  pruefe((await adresse()).includes('ziegel,0,1/2,1/2,0,0.25,f'), 'Mit Fuge: „f“ in der Adresse');
  await page.locator('#s-motiv [data-motiv="insel"]').click(); await page.waitForTimeout(250);
  pruefe(await page.locator('#s-fuge').isDisabled() && !(await adresse()).includes(',f'), 'Anderes Motiv: Schalter gesperrt, „f“ entfällt');

  pruefe(konsole.length === 0, `keine Fehler in der Konsole${konsole.length ? `: ${konsole.join(' | ')}` : ''}`);
} finally {
  await browser.close();
  srv.close();
}
if (fehler.length) { console.error(`${fehler.length} Prüfung(en) gescheitert`); process.exit(1); }
console.log('Alle Prüfungen bestanden');
