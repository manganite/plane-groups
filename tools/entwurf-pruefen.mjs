// Browserlauf für den Modus „Muster entwerfen“ (#136; vorher „Symmetrie festhalten“, #121): bedient die App wie ein
// Mensch (Klicks, Ziehen mit der Maus) und prüft Zustand, Link-Adresse, Kenndaten und Konsole. Die Rechnung prüfen die
// Tests ohne Browser (tests/bahnen.test.mjs, tests/rundlauf.test.mjs); hier geht es um die Bedienung.
//
//   node tools/entwurf-pruefen.mjs
//
// Braucht Playwright mit Chromium (npm install --no-save playwright && npx playwright install chromium);
// ein anderes Chromium mit CHROMIUM_PFAD=<Pfad>. Ende mit Code 1, wenn eine Prüfung scheitert.

import { createRequire } from 'node:module';
import { vorgabe } from '../js/vorgaben.js';
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
  await page.locator('#s-weiter').click(); // in den Kenndaten (#162)
  await page.waitForTimeout(300);
  pruefe((await adresse()).includes('m=entwurf&g=p4gm') && (await text('#info')).includes('gedreht'), 'Flechtverband: p4gm, Umstellung in den Kenndaten');
  pruefe(await page.locator('#tab-entwurf').getAttribute('aria-selected') === 'true', 'Übergang: Tab „Muster entwerfen“ gewählt');
  pruefe(!(await page.locator('#e-bindungen').isChecked()) && (await adresse()).includes('bind=0'), 'Übergang: „Bindungen aus“ wird übernommen');

  // 7. Zeichnen und Radieren im Entwurf: Striche mit allen Operationen, Farbe der Atomsorte, Rückgängig, Alle Striche löschen
  await oeffnen('#m=entwurf&g=p4mm');
  const striche = () => page.locator('#bild-a g.striche path').count();
  const stricheB = () => page.locator('#bild-b g.striche path').count();
  pruefe(await page.locator('#s-werkzeug-zeichnen').isVisible() && await page.locator('#striche-loeschen').isVisible() && await page.locator('#striche-loeschen').isDisabled(), 'Zeichnen: Werkzeug und „Alle Striche löschen“ in der Tafel, gesperrt ohne Striche');
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
  await page.locator('#rueckgaengig').click(); await page.waitForTimeout(200);
  pruefe(await striche() === nA, 'Rückgängig holt das Radieren zurück');
  // Motive und Striche zugleich
  await page.locator('#s-werkzeug-hinzufuegen').click();
  const m = await bildschirm([0.7, 0.6]); await page.mouse.click(m.x, m.y); await page.waitForTimeout(300);
  pruefe((await adresse()).includes('basis=') && await striche() === nA, 'Motiv und Striche nebeneinander');
  // Die Wahl einer Gruppe behält den Verlauf (Thomas, 12.11.2026)
  await page.locator('#e-picker [data-g="p4"]').click(); await page.waitForTimeout(300);
  pruefe(await page.locator('#rueckgaengig').isEnabled(), 'Wahl einer Gruppe: Rückgängig bleibt frei');
  await page.locator('#rueckgaengig').click(); await page.waitForTimeout(200);
  pruefe(!(await adresse()).includes('basis=') && /[&#]g=p4(&|$)/.test(await adresse()), 'Rückgängig nach der Wahl einer Gruppe nimmt das Motiv zurück, die Gruppe bleibt');
  pruefe(await striche() > 0, 'die Striche bleiben');
  await page.locator('#e-picker [data-g="p4mm"]').click(); await page.waitForTimeout(300);
  await page.mouse.click(m.x, m.y); await page.waitForTimeout(300);
  // Striche überstehen Neuladen (Speicher) und den Wechsel der Gruppe
  await page.reload(); await page.waitForTimeout(400);
  pruefe(await striche() === nA, 'Neu laden: Striche aus dem Speicher');
  await page.locator('#e-picker [data-g="p4gm"]').click(); await page.waitForTimeout(300);
  pruefe(await striche() >= 8, 'Wechsel der Gruppe behält die Striche (neu vervielfältigt)');
  await page.locator('#striche-loeschen').click(); await page.waitForTimeout(200);
  pruefe(await striche() === 0 && (await adresse()).includes('basis='), 'Alle Striche löschen (die Motive bleiben)');
  await page.locator('#rueckgaengig').click(); await page.waitForTimeout(200);
  pruefe(await striche() >= 8, 'Rückgängig holt die gelöschten Striche zurück');
  await page.locator('#tab-eg').click(); await page.waitForTimeout(200);
  pruefe(await page.locator('#s-werkzeug-zeichnen').isHidden() && await page.locator('#rueckgaengig').isHidden(), '„Ebenengruppen“ hat kein Zeichnen und kein Rückgängig');
  pruefe(await page.locator('#werkzeug-einrasten').isVisible() && await page.locator('#zoom-a-ein').isVisible() && await page.locator('#export-a').isVisible(), '„Ebenengruppen“: Einrasten, Zoom und Export in Tafel A');

  // 7a. Rückgängig für Motive (#130): Hinzufügen, Ziehen und „Alle Motive löschen“ zurücknehmen; Einrasten als Schalter
  await oeffnen('#m=struktur&v=dreieck1');
  const basisAdr = async () => (await adresse()).match(/basis=([^&]*)/)?.[1] ?? '';
  pruefe(await page.locator('#rueckgaengig').isDisabled(), 'Rückgängig gesperrt, solange nichts geändert ist');
  await page.locator('#s-werkzeug-hinzufuegen').click();
  const n1 = await bildschirm([0.6, 0.4]); await page.mouse.click(n1.x, n1.y); await page.waitForTimeout(250);
  const nachHinzu = await basisAdr();
  pruefe(nachHinzu !== '' && await page.locator('#rueckgaengig').isEnabled(), 'Hinzufügen: Rückgängig frei');
  await page.locator('#motive-loeschen').click(); await page.waitForTimeout(250);
  pruefe(await page.locator('#motive-loeschen').isDisabled(), 'Alle Motive löschen: danach gesperrt');
  await page.locator('#rueckgaengig').click(); await page.waitForTimeout(250);
  pruefe(await basisAdr() === nachHinzu, 'Rückgängig holt die gelöschten Motive zurück');
  await page.locator('#rueckgaengig').click(); await page.waitForTimeout(250);
  pruefe(!(await adresse()).includes('basis=') && await page.locator('#rueckgaengig').isDisabled(), 'Rückgängig nimmt auch das Hinzufügen zurück (wieder die Vorgabe)');
  await page.locator('#werkzeug-einrasten').click(); await page.waitForTimeout(200);
  pruefe(await page.locator('#werkzeug-einrasten').getAttribute('aria-pressed') === 'false' && (await adresse()).includes('rast=0'), 'Einrasten aus: aria-pressed und rast=0 in allen Modi');
  await page.locator('#werkzeug-einrasten').click(); await page.waitForTimeout(200);
  // Eigenschaften, die das Motiv nicht hat, fehlen (Leitfaden 5.2)
  await page.locator('#s-werkzeug-hinzufuegen').click();
  await page.locator('#s-motiv [data-motiv="quadrat"]').click(); await page.waitForTimeout(200);
  pruefe(await page.locator('#s-spiegel').isHidden() && await page.locator('#s-fuge').isHidden(), 'Quadrat: „Gespiegelt“ und „Mit Fuge“ fehlen');
  await page.locator('#s-motiv [data-motiv="fahne"]').click(); await page.waitForTimeout(200);
  pruefe(await page.locator('#s-spiegel').isVisible() && await page.locator('#s-fuge').isHidden(), 'Fähnchen: „Gespiegelt“ da, „Mit Fuge“ fehlt');
  // Keine Schritte ohne Wirkung (Review PR #158): Klick zum Wählen bei Lagen ausserhalb der Zelle, dieselbe Farbe nochmals
  await oeffnen('#m=struktur&v=a488');
  await page.locator('#s-werkzeug-verschieben').click();
  // ein Motiv, dessen Lage in der Vorgabe ausserhalb der Zelle liegt, an seinem Bild in der Zelle antippen
  const aussen = vorgabe('a488')?.basis.find((b) => b.p.some((v) => v < 0 || v >= 1));
  const lageAussen = aussen ? aussen.p.map((v) => v - Math.floor(v)) : null;
  pruefe(lageAussen !== null, 'a488 hat eine Lage ausserhalb der Zelle (Voraussetzung)');
  if (lageAussen) { const t = await bildschirm(/** @type {[number, number]} */ (lageAussen)); await page.mouse.click(t.x, t.y); await page.waitForTimeout(250); }
  pruefe((await text('#s-basis-titel')).startsWith('Gewähltes Motiv'), `Klick wählt ein Motiv (${await text('#s-basis-titel')})`);
  pruefe(await page.locator('#rueckgaengig').isDisabled() && !(await adresse()).includes('basis='), 'Klick zum Wählen: kein Schritt, die Vorgabe bleibt');
  await oeffnen('#m=entwurf&g=p4gm&basis=fahne,0,0.2,0.3,30');
  await page.locator('#s-werkzeug-verschieben').click();
  const f1 = await bildschirm([0.2, 0.3]); await page.mouse.click(f1.x, f1.y); await page.waitForTimeout(250);
  await page.locator('#s-farbe button[data-farbe="0"]').click(); await page.waitForTimeout(200);
  pruefe(await page.locator('#rueckgaengig').isDisabled(), 'Dieselbe Farbe nochmals: kein Schritt');
  // Drehung per Tastatur trotz Einrasten
  await page.locator('#s-winkel').focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  pruefe(await page.locator('#s-winkel').inputValue() !== '30', `Drehung per Tastatur mit Einrasten (${await page.locator('#s-winkel').inputValue()}°)`);
  // Export als Knopf mit Menü
  await page.locator('#export-b').click(); await page.waitForTimeout(150);
  pruefe(await page.locator('#export-b-menue [role="menuitem"]').count() === 3 && await page.locator('#export-b-menue').isVisible(), 'Export-Menü der Tafel B mit drei Einträgen');
  await page.keyboard.press('Escape');

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
  pruefe(await page.locator('#s-fuge').isVisible() && !(await page.locator('#s-fuge').isChecked()), 'Ziegel gewählt: „Mit Fuge“ da, aus');
  await page.locator('#s-fuge').check(); await page.waitForTimeout(250);
  pruefe((await adresse()).includes('ziegel,0,1/2,1/2,0,0.25,f'), 'Mit Fuge: „f“ in der Adresse');
  await page.locator('#s-motiv [data-motiv="insel"]').click(); await page.waitForTimeout(250);
  pruefe(await page.locator('#s-fuge').isHidden() && !(await adresse()).includes(',f'), 'Anderes Motiv: Schalter fehlt, „f“ entfällt');

  // 11. Zoom und Verschieben (#162): Knöpfe, Mausrad um den Zeiger, Leertaste + Ziehen, Pfeiltasten, ins Leere ziehen,
  // Tafel B, Ruhe während einer Erklärung, Mitte nur im Speicher, zwei Finger
  /** Mitte eines Elements in Tafel A auf dem Bildschirm. @param {string} sel */
  const lageIn = (sel) => page.locator(`#bild-a ${sel}`).first().evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  /** @param {{ x: number, y: number }} a @param {{ x: number, y: number }} b */
  const abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  await oeffnen('#m=eg&g=p4');
  await page.locator('#bild-a').scrollIntoViewIfNeeded();
  await page.locator('#zoom-a-ein').click(); await page.locator('#zoom-a-ein').click(); await page.waitForTimeout(200);
  pruefe((await adresse()).includes('zoomA=1.563') && (await text('#zoom-a-wert')) === '156 %', `Zoom: + zweimal ergibt 156 % (${await adresse()})`);
  await page.locator('#zoom-a-passen').click(); await page.waitForTimeout(200);
  pruefe(!(await adresse()).includes('zoomA') && await page.locator('#zoom-a-passen').isDisabled(), 'Zoom: Einpassen zeigt wieder die ganze Zeichnung');
  const o0 = await lageIn('.ausgang');
  await page.mouse.move(o0.x, o0.y); await page.mouse.wheel(0, -400); await page.waitForTimeout(300);
  const o1 = await lageIn('.ausgang');
  pruefe((await adresse()).includes('zoomA=') && abstand(o0, o1) < 2, `Mausrad: vergrössert um den Zeiger (Objekt bleibt unter dem Zeiger, ${abstand(o0, o1).toFixed(1)} px)`);
  const oVorher = await lageIn('.ausgang');
  const fl = /** @type {{ x: number, y: number, width: number, height: number }} */ (await page.locator('#bild-a').boundingBox());
  await page.mouse.move(fl.x + 100, fl.y + 100); await page.keyboard.down(' ');
  await page.mouse.down(); await page.mouse.move(fl.x + 160, fl.y + 140, { steps: 4 }); await page.mouse.up(); await page.keyboard.up(' ');
  await page.waitForTimeout(250);
  const oNach = await lageIn('.ausgang');
  pruefe(Math.abs(oNach.x - oVorher.x - 60) < 3 && Math.abs(oNach.y - oVorher.y - 40) < 3 && (await adresse()).includes('x=0.12'), `Leertaste + Ziehen verschiebt den Ausschnitt, nicht das Objekt (${(oNach.x - oVorher.x).toFixed(0)}, ${(oNach.y - oVorher.y).toFixed(0)})`);
  await page.locator('#bild-a').focus(); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(250);
  const oLinks = await lageIn('.ausgang');
  pruefe(oLinks.x - oNach.x > 20 && Math.abs(oLinks.y - oNach.y) < 2, 'Pfeiltaste verschiebt den Ausschnitt');
  await page.reload(); await page.waitForTimeout(400);
  const oNeu = await lageIn('.ausgang');
  pruefe(abstand(oNeu, oLinks) < 2 && !/mitte|ausschnitt/.test(await adresse()), 'Neu laden: gleicher Ausschnitt (Mitte im Speicher, nicht im Link)');
  await oeffnen('#m=eg&g=p4&zoomA=2&schritt=2');
  pruefe(await page.locator('#zoom-a-ein').isDisabled() && (await text('#zoom-a-wert')) === '100 %', 'Zoom ruht während „Schritt für Schritt“');
  await oeffnen('#m=entwurf&g=p4mm&basis=atom,0,1/10,1/5,0&zoomA=2');
  await page.locator('#s-werkzeug-verschieben').click(); await page.waitForTimeout(250);
  const e0 = await lageIn('.konv-zelle');
  const ra = /** @type {{ x: number, y: number, width: number, height: number }} */ (await page.locator('#bild-a').boundingBox());
  const leer = { x: ra.x + ra.width * 0.8, y: ra.y + ra.height * 0.8 }; // ohne Motiv (das Atom liegt bei 1/10, 1/5)
  await page.mouse.move(leer.x, leer.y); await page.mouse.down(); await page.mouse.move(leer.x - 50, leer.y + 30, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(250);
  const e1 = await lageIn('.konv-zelle');
  pruefe(Math.abs(e1.x - e0.x + 50) < 3 && Math.abs(e1.y - e0.y - 30) < 3, `Entwurf: Ziehen ins Leere verschiebt den Ausschnitt (${(e1.x - e0.x).toFixed(0)}, ${(e1.y - e0.y).toFixed(0)})`);
  // Leertaste + Ziehen auch beim Zeichnen, wenn ein Knopf den Fokus hat (Review): verschiebt, zeichnet nicht
  await page.locator('#s-werkzeug-zeichnen').click(); await page.locator('#zoom-a-ein').click(); await page.waitForTimeout(250);
  const s0 = await striche(); const k0 = await lageIn('.konv-zelle');
  await page.mouse.move(leer.x, leer.y); await page.keyboard.down(' ');
  await page.mouse.down(); await page.mouse.move(leer.x + 40, leer.y - 20, { steps: 4 }); await page.mouse.up(); await page.keyboard.up(' ');
  await page.waitForTimeout(250);
  const k1 = await lageIn('.konv-zelle');
  pruefe(await striche() === s0 && Math.abs(k1.x - k0.x - 40) < 3 && Math.abs(k1.y - k0.y + 20) < 3, `Zeichnen + Leertaste: verschiebt, kein Strich (${(k1.x - k0.x).toFixed(0)}, ${(k1.y - k0.y).toFixed(0)})`);
  await page.locator('#zoom-b-ein').click(); await page.waitForTimeout(200);
  const b = /** @type {{ x: number, y: number, width: number, height: number }} */ (await page.locator('#bild-b').boundingBox());
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.wheel(0, -200); await page.waitForTimeout(250);
  const zb = Number((await adresse()).match(/zoomB=([\d.]+)/)?.[1]);
  pruefe(zb > 1.25 && !(await adresse()).includes('&zoom='), `Tafel B: + und Mausrad vergrössern das Muster (zoomB=${zb})`);
  pruefe(await page.locator('#v-zoom').count() === 0, 'Kein Regler „Vergrösserung“ mehr in der Seitenleiste');
  // zwei Finger auf Tafel A (Touch über CDP): auseinander = grösser
  const tctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, serviceWorkers: 'block' });
  const tp = await tctx.newPage();
  tp.on('pageerror', (e) => konsole.push(String(e)));
  await tp.goto(`${basis}index.html#m=eg&g=p4&obj=0`); await tp.waitForSelector('#bild-a *', { state: 'attached' }); await tp.waitForTimeout(300);
  await tp.locator('#bild-a').scrollIntoViewIfNeeded();
  const tb = /** @type {{ x: number, y: number, width: number, height: number }} */ (await tp.locator('#bild-a').boundingBox());
  const cx = tb.x + tb.width / 2; const cy = tb.y + tb.height / 2;
  const cdp = await tctx.newCDPSession(tp);
  /** @param {'touchStart' | 'touchMove' | 'touchEnd'} type @param {number} d */
  const finger = (type, d) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
  await finger('touchStart', 30); for (const d of [40, 50, 60]) await finger('touchMove', d); await finger('touchEnd', 0);
  await tp.waitForTimeout(300);
  const za = Number((await tp.evaluate(() => decodeURIComponent(location.hash))).match(/zoomA=([\d.]+)/)?.[1]);
  pruefe(za > 1.8 && za < 2.2, `Zwei Finger: Abstand verdoppelt ergibt Zoom 2 (${za})`);
  await tctx.close();

  // 12. Erklärungen in Tafel A (#162): „Schritt für Schritt“, Aufbau und „Herkunft der Elemente“ schliessen sich aus
  // (Thomas, 13.11.2026); bei „Herkunft“ zeigt die Leiste Hinweis bzw. Element, Abspielen und ×
  await oeffnen('#m=eg&g=p4mm&aufbau=2');
  await page.locator('#erkl-herkunft').click(); await page.waitForTimeout(250);
  const ah = await adresse();
  pruefe(ah.includes('herkunft=1') && !ah.includes('aufbau='), 'Herkunft gewählt: Aufbau abgewählt');
  pruefe(await page.locator('#erkl-herkunft').getAttribute('aria-pressed') === 'true' && await page.locator('#erkl-aufbau').getAttribute('aria-pressed') === 'false', 'Herkunft gewählt: nur ihr Knopf gedrückt');
  pruefe(await page.locator('#erkl-leiste').isVisible() && await page.locator('#erkl-vor').isHidden() && await page.locator('#erkl-abspielen').isDisabled(), 'Herkunft ohne Element: Leiste mit Hinweis, ohne ◀ ▶, Abspielen gesperrt');
  await page.locator('#info [data-erkl]').first().click(); await page.waitForTimeout(400);
  pruefe((await adresse()).includes('erkl=') && (await text('#erkl-stand')).startsWith('Herkunft:') && await page.locator('#erkl-abspielen').isEnabled(), 'Element gewählt: Leiste nennt es, Abspielen frei');
  await page.locator('#erkl-schritt').click(); await page.waitForTimeout(250);
  const as = await adresse();
  pruefe(as.includes('schritt=1') && !as.includes('herkunft=') && !as.includes('erkl='), 'Schritt für Schritt gewählt: Herkunft und Element abgewählt');
  await page.locator('#erkl-schliessen').click(); await page.waitForTimeout(250);
  pruefe(await page.locator('#erkl-leiste').isHidden() && await page.evaluate(() => document.activeElement?.id) === 'erkl-schritt', '×: Leiste weg, Fokus auf der eben geschlossenen Erklärung');
  await page.locator('#erkl-herkunft').click(); await page.locator('#erkl-herkunft').click(); await page.waitForTimeout(250);
  pruefe(!(await adresse()).includes('herkunft=') && await page.locator('#erkl-leiste').isHidden(), 'Zweiter Klick auf „Herkunft“ wählt ab');

  pruefe(konsole.length === 0, `keine Fehler in der Konsole${konsole.length ? `: ${konsole.join(' | ')}` : ''}`);
} finally {
  await browser.close();
  srv.close();
}
if (fehler.length) { console.error(`${fehler.length} Prüfung(en) gescheitert`); process.exit(1); }
console.log('Alle Prüfungen bestanden');
