# Symmetrie in der Ebene

[![CI](https://github.com/manganite/plane-groups/actions/workflows/ci.yml/badge.svg)](https://github.com/manganite/plane-groups/actions/workflows/ci.yml)
[![Deploy](https://github.com/manganite/plane-groups/actions/workflows/deploy.yml/badge.svg)](https://github.com/manganite/plane-groups/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/manganite/plane-groups)](https://github.com/manganite/plane-groups/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Interaktive Lern-App für eine Einführung in die Kristallographie, entstanden aus der Vorlesung Kristallographie an der ETH Zürich: Symmetrie periodischer Muster in der Ebene, von Gitter und Elementarzelle bis zu den 17 Ebenengruppen mit Wyckoff-Lagen und asymmetrischer Einheit. Dazu ein Skript und ein Übungsquiz. Für Laptop, iPad und Telefon; läuft im Browser, als Web-App auf dem Homescreen und offline.

Teil einer Familie von Lern-Apps mit gemeinsamer Grundlage: [crystallography-common](https://github.com/manganite/crystallography-common).

### [Zur App: manganite.github.io/plane-groups](https://manganite.github.io/plane-groups/)

## Funktionen

In Arbeit; das erste Release folgt.

- **Modus „Ebenengruppen“:** Auswahl der 17 Ebenengruppen nach Kristallsystem.
  - **Symmetriegerüst:** Elementarzelle (wahlweise 2 × 2 Zellen) mit allen Symmetrieelementen und den Symbolen der International Tables for Crystallography, Vol. A. Dazu gehören die Gleitspiegellinien, die das Symbol nicht nennt (z. B. in c2mm und p4mm). Wahlweise nach Blickrichtung gefärbt.
  - **Objekt in allgemeiner Lage** (Fähnchen oder Kreis mit Komma wie in ITA) mit allen Bildern, ziehbar. Nahe einem Drehpunkt oder einer Spiegellinie rastet es ein. Die Kenndaten nennen dann Wyckoff-Lage, Lagesymmetrie und Zähligkeit.
  - **Asymmetrische Einheit** einblendbar. Ihre Bedingungen in den Kenndaten (z. B. „0 ≤ x ≤ ½“) lassen sich einzeln antippen: Das Symmetriegerüst schattiert, wo die gewählten Bedingungen erfüllt sind, und hebt ihre Grenzlinien hervor; alle zusammen ergeben die asymmetrische Einheit.
  - **Muster:** Ausschnitt des unendlichen Musters mit hervorgehobener Elementarzelle.
  - **Kenndaten wie eine ITA-Seite:** Symbole, Kristallsystem, Bravais-Gitter, Punktgruppe (mit Link in die App „Stereographische Projektion“), Ursprung, asymmetrische Einheit, Symmetrieoperationen, Wyckoff-Lagen, Auslöschungen. Jede Wyckoff-Lage lässt sich mit „setzen“ direkt ansteuern.
  - **Gitterparameter** innerhalb des Kristallsystems frei: *b*/*a* (schiefwinklig, rechteckig), γ (schiefwinklig).
  - **Aufbau aus Erzeugenden:** Die Symmetrieelemente erscheinen Schritt für Schritt. Zuerst kommen die Erzeugenden nach ITA („Generators selected“), dann, was aus ihren Verknüpfungen mit den Gittertranslationen folgt. Neue Elemente sind hervorgehoben.
  - **„Warum ist das da?“:** Ein Element antippen zeigt, aus welchen zwei Operationen es folgt (*C* = *A* ∘ *B*). Das Fähnchen läuft die Schritte ab, die passende Regel wird genannt (z. B. „Spiegelung + Translation schräg zur Linie = Gleitspiegelung“), dazu die Herleitung aus den Erzeugenden. Ist das Element nur eine Gitterkopie eines anderen (z. B. die Drehpunkte an den Ecken der Zelle), zeigt die Erklärung stattdessen das Vorbild und die Verschiebung.

## Links auf Ansichten

Der Zustand steht lesbar in der Adresse, z. B. `#m=eg&g=p4gm&x=0.12&y=0.31`. Geschrieben wird nur, was vom Startzustand abweicht. Die Link-Adressen sind eine Schnittstelle (Skript, Quiz, andere Apps der Familie) und bleiben stabil (Test `tests/zustand.test.mjs`):

| Schlüssel | Bedeutung | Werte (Startwert fett) |
|---|---|---|
| `m` | Modus | **`eg`** (Ebenengruppen) |
| `g` | Ebenengruppe | Symbol wie in ITA, z. B. `p4gm`, `p31m`; **`p2mg`** |
| `x`, `y` | Lage des Objekts in Bruchkoordinaten | Zahl oder Bruch (z. B. `1/3`; spezielle Lagen werden als Bruch geschrieben), **`0.12`**, **`0.31`** |
| `el` | Symmetrieelemente | `0`, **`1`** |
| `obj` | Objekt in allgemeiner Lage | `0`, **`1`** |
| `ae` | asymmetrische Einheit | **`0`**, `1` |
| `zellen` | Zellen im Symmetriegerüst | **`1`**, `2` (2 × 2) |
| `form` | Form des Objekts | **`fahne`**, `komma` |
| `rast` | Einrasten auf spezielle Lagen | `0`, **`1`** |
| `farb` | nach Blickrichtung färben | `0`, **`1`** |
| `mel` | Symmetrieelemente im Muster | **`0`**, `1` |
| `aufbau` | Aufbau aus Erzeugenden | **`0`** (aus), Schritt `1`, `2`, … |
| `warum` | Werkzeug „Warum ist das da?“ | **`0`**, `1` |
| `aet` | angetippte Bedingungen der asymmetrischen Einheit | Nummern ab `0` in der Reihenfolge der ITA-Seite, z. B. `0,2`; **leer** |
| `erkl` | erklärtes Element | z. B. `4;1/2,1/2` (4-zähliger Drehpunkt bei ½, ½), `m;1/4,0;0,1` (Spiegellinie durch ¼, 0 in Richtung [01]), `g;…` (Gleitspiegellinie) |
| `ba` | *b*/*a* (nur schiefwinklig, rechteckig) | 0.6–1.6; **1.25** bzw. **1.35** |
| `gamma` | γ in Grad (nur schiefwinklig) | 95–125; **105** |

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
