// Prüfliste und Fragenliste des Quiz (Artifacts in claude.ai, Ablauf im README unter „Entwicklung“).
// Liest Fragen und Generatoren mit dem Code der App aus (ohne Browser: die Bilder zeichnet derselbe Code
// wie im Moodle-Export) und schreibt die fertige Seite neben die Vorlage (tools/listen/<art>.html,
// nicht im Repository). Die Prüfliste enthält nur Entwürfe, die Fragenliste alles.
// Aufruf:  node tools/listen/liste-extract.mjs pruefliste|fragenliste
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const art = process.argv[2] === 'fragenliste' ? 'fragenliste' : 'pruefliste';
const hier = dirname(fileURLToPath(import.meta.url));
const repo = join(hier, '..', '..');
const imp = (p) => import(pathToFileURL(join(repo, p)).href);

const { BANK } = await imp('js/quiz-bank.js');
const { GENERATOREN } = await imp('js/quiz-gen.js');
const { KAPITEL } = await imp('js/quiz-kapitel.js');
const { bildInhalt, farbenAus, appAdresse } = await imp('js/quiz-bild.js');
const { helleFarben } = await imp('tools/common/moodle.mjs');

const col = farbenAus(helleFarben(join(repo, 'lib/common/css/base.css')));
const attr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Bild mit dem Alternativtext der Frage als zugänglichem Namen (so lässt sich auch der Bildtext prüfen)
const svg = (angabe, opt = {}, alt = '') => {
  if (!angabe) return null;
  const inhalt = bildInhalt(angabe, col, opt);
  const name = alt ? ` role="img" aria-label="${attr(alt)}"` : '';
  return inhalt ? `<svg viewBox="0 0 520 520"${name}>${inhalt}</svg>` : null;
};
const bildAnt = (q) => q.typ === 'text-bild' || q.typ === 'bild-bild';
const conv = (q, extra = {}) => ({
  id: q.id, kapitel: q.kapitel, stufe: q.stufe, typ: q.typ, lernziel: q.lernziel || '',
  frage: q.frage, bild: q.bild ? svg(q.bild, {}, q.bildAlt || '') : null, bildHash: q.bild ? appAdresse(q.bild) : null,
  antworten: q.antworten.map((a) => (bildAnt(q) ? { svg: svg(a.app, { klein: true }, a.alt || ''), hash: appAdresse(a.app) } : { html: a })),
  richtig: q.richtig, hinweise: q.hinweise || [], erklaerung: q.erklaerung || '', skript: q.skript || '',
  app: q.app || '', quelle: q.quelle || '', nachgerechnet: q.pruefung ? (q.pruefung.art || 'ja') : '', ...extra,
});

const nurEntwurf = art === 'pruefliste';
const fragen = BANK.filter((q) => !nurEntwurf || q.status !== 'geprüft').map((q) => conv(q, { status: q.status }));
const gens = [];
for (const G of GENERATOREN) {
  if (nurEntwurf && G.status === 'geprüft') continue;
  const beispiele = [];
  for (const st of G.stufen) {
    const ps = G.params(st);
    const pick = [...new Set([0, Math.floor(ps.length / 3), Math.floor((2 * ps.length) / 3), ps.length - 1])].filter((i) => i >= 0 && i < ps.length);
    for (const i of pick) beispiele.push(conv({ ...G.make(ps[i], st), id: `${G.id} · ${ps[i]}`, stufe: st, kapitel: G.kapitel }));
  }
  gens.push({ id: G.id, status: G.status, kapitel: G.kapitel, stufen: G.stufen, anzahl: G.stufen.reduce((n, s) => n + G.params(s).length, 0), beispiele });
}
const daten = { kapitel: KAPITEL, fragen, gens, commit: execSync('git rev-parse HEAD', { cwd: repo, encoding: 'utf8' }).trim() };
const tpl = readFileSync(join(hier, `${art}-vorlage.html`), 'utf8');
writeFileSync(join(hier, `${art}.html`), tpl.replace('__DATEN__', JSON.stringify(daten).replace(/<\//g, '<\\/')));
console.log(art, fragen.length, gens.map((g) => [g.id, g.anzahl, g.beispiele.length]), daten.commit.slice(0, 7));
