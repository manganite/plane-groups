# Symmetrie in der Ebene

[![CI](https://github.com/manganite/plane-groups/actions/workflows/ci.yml/badge.svg)](https://github.com/manganite/plane-groups/actions/workflows/ci.yml)
[![Deploy](https://github.com/manganite/plane-groups/actions/workflows/deploy.yml/badge.svg)](https://github.com/manganite/plane-groups/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/manganite/plane-groups)](https://github.com/manganite/plane-groups/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Interaktive Lern-App für eine Einführung in die Kristallographie, entstanden aus der Vorlesung Kristallographie an der ETH Zürich: Symmetrie periodischer Muster in der Ebene, von Gitter und Elementarzelle bis zu den 17 Ebenengruppen mit Wyckoff-Lagen und asymmetrischer Einheit. Dazu ein Skript und ein Übungsquiz. Für Laptop, iPad und Telefon; läuft im Browser, als Web-App auf dem Homescreen und offline.

Teil einer Familie von Lern-Apps mit gemeinsamer Grundlage: [crystallography-common](https://github.com/manganite/crystallography-common).

### [Zur App: manganite.github.io/plane-groups](https://manganite.github.io/plane-groups/)

## Funktionen

In Arbeit. Bis zum ersten Release enthält das Repository das Gerüst aus der Vorlage.

## Links auf Ansichten

Der Zustand steht lesbar in der Adresse, z. B. `#m=a&g=p4mm`. Die Link-Adressen sind eine Schnittstelle (Skript, Quiz, andere Apps der Familie) und bleiben stabil:

| Schlüssel | Bedeutung | Werte |
|---|---|---|
| `m` | Modus | `a`, `b` |
| `g` | Gruppe | Kurzsymbol, z. B. `p4mm` |

## Lokal ausführen

Statische Webseite ohne Build-Schritt: im Ordner `python3 -m http.server 8000` starten und **http://localhost:8000** öffnen.

## Entwicklung

- Tests: `node --test tests/*.test.mjs`
- Gemeinsame Dateien übernehmen: `node tools/common/sync.mjs ../crystallography-common` (von einem Release-Tag)
- Skript als PDF: `node tools/skript-pdf.mjs` (braucht Playwright mit Chromium)
- Quiz für Moodle: `node tools/moodle-export.mjs quiz.xml`
- Releases: Version in `js/version.js`, `sw.js`, `CITATION.cff` und `CHANGELOG.md`, dann Tag `vX.Y.Z` auf `main`. Die Live-Seite ändert sich nur mit einem Release-Tag.

## Lizenz

Code: [MIT](LICENSE). Schriften: SIL Open Font License 1.1 (siehe `lib/common/fonts/`).
