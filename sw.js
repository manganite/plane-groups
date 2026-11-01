// Service Worker: hält alle Dateien der App für den Offline-Betrieb vor (z. B. im Hörsaal ohne WLAN).
// Je Version ein eigener Cache; eine neue Version wird beim nächsten Öffnen geladen, alte Caches
// werden entfernt. VERSION muss mit js/version.js übereinstimmen (tests/release.test.mjs).
const VERSION = '0.1.0';
const CACHE = `ebenengruppen-${VERSION}`; // Präfix je App eindeutig wählen und nie ändern
const FILES = [
  './',
  'index.html',
  'skript.html',
  'quiz.html',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/favicon.ico',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'js/asymmetrie.js',
  'js/bestimmung.js',
  'js/brechen.js',
  'js/ebenengruppen.js',
  'js/herkunft.js',
  'js/hilfetexte.js',
  'js/main.js',
  'js/motive.js',
  'js/quiz-bank.js',
  'js/quiz-kapitel.js',
  'js/quiz.js',
  'js/schritte.js',
  'js/skript.js',
  'js/struktur-ui.js',
  'js/struktur.js',
  'js/symbole.js',
  'js/symmetrie.js',
  'js/text.js',
  'js/verweise.js',
  'js/version.js',
  'js/vorgaben.js',
  'js/warum.js',
  'js/zeichnung.js',
  'js/zustand.js',
  'lib/common/css/app.css',
  'lib/common/css/base.css',
  'lib/common/css/quiz.css',
  'lib/common/css/skript.css',
  'lib/common/fonts/fonts.css',
  'lib/common/fonts/ibm-plex-mono-latin-400-normal.woff2',
  'lib/common/fonts/ibm-plex-mono-latin-500-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-400-italic.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-400-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-500-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-greek-600-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-400-italic.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-400-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-500-normal.woff2',
  'lib/common/fonts/ibm-plex-sans-latin-600-normal.woff2',
  'lib/common/fonts/source-serif-4-latin-500-normal.woff2',
  'lib/common/fonts/source-serif-4-latin-600-normal.woff2',
  'lib/common/js/format.js',
  'lib/common/js/help.js',
  'lib/common/js/quiz-core.js',
  'lib/common/js/quiz-seite.js',
  'lib/common/js/seite.js',
  'lib/common/js/skript-kern.js',
  'lib/common/js/version.js',
];

/** Eigenständige Seiten; jeder andere Seitenaufruf (z. B. ./ oder ?sw) führt zur App. */
const PAGES = ['index.html', 'skript.html', 'quiz.html'];

self.addEventListener('install', (event) => {
  // cache: 'reload' umgeht den HTTP-Cache des Browsers, damit keine Dateien der Vorversion übernommen werden
  const reqs = FILES.map((f) => new Request(f, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(reqs)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ebenengruppen-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Seitenaufrufe (auch mit Suchparametern) liefern ihre Seite, sonst index.html; alles andere aus dem Cache, sonst Netz
  const path = new URL(req.url).pathname;
  const page = PAGES.find((p) => path.endsWith('/' + p));
  // Dateien wie skript.pdf kommen aus dem Netz, nicht als index.html
  const datei = /\.[a-z0-9]+$/i.test(path) && !path.endsWith('.html');
  const key = req.mode === 'navigate' && !datei ? page || 'index.html' : req;
  event.respondWith(
    caches.open(CACHE)
      .then((c) => c.match(key, { ignoreSearch: true }))
      .then((hit) => hit || fetch(req)),
  );
});
