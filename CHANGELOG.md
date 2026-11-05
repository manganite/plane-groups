# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- **ESLint** als CI-Job `lint` mit den gemeinsamen Regeln (`eslint.config.mjs`, `tools/common/eslint-basis.mjs`; LEITFADEN Abschn. 9). Die Pakete installiert auch der Job `typen`.
- **Erste Schritte für „Gitter und Basis“** (#56): vier Schritte am Dreiecksbeispiel (*pm* → *cm* → *p*2*mg*, mit Hinweis auf die Änderung in den Kenndaten) und zum Selbstbauen.
- **Typprüfung mit TypeScript** über JSDoc-Typen (`tsconfig.json`, CI-Job `typen`; crystallography-common#19, Schritt 1). Strikt geprüft werden die Rechenkerne `symmetrie.js`, `ebenengruppen.js`, `punktoperationen.js`, `herkunft.js`, `bestimmung.js`, `asymmetrie.js`, `struktur.js` und `brechen.js`, mit `Vec2`/`Mat2` aus der gemeinsamen Grundlage. Gekennzeichnete Typen trennen kartesische Gittervektoren von Bruchkoordinaten (`Kartesisch<Vec2>`: `metrik()`, `kart()`, `bruchVon()`, `bestimme()`) und Winkel in Grad (`Grad`: γ, Winkel der Punktoperationen und Motive). Am Verhalten ändert sich nichts (Tests, Moodle-Export bytegleich, Ergebnisse der Kerne für alle 17 Gruppen und App, Skript und Quiz im Browser vorher und nachher gleich).

### Geändert

- **Gemeinsame Grundlage** auf crystallography-common v0.5.0: geprüfte Helfer für Elemente der Seite (`lib/common/js/seite.js`). Die App nutzt sie statt eigener Umwandlungen (`$`, `eingabe`, `knopf`, `element`, `elemente`; die Tafeln `#bild-a`/`#bild-b` sind SVG und laufen über `grafik`; in `struktur-ui.js` heisst die Auswahlliste wie überall `auswahl`). Fehlt ein Element oder hat es eine andere Art, meldet die Seite das beim ersten Zugriff mit der ID. Sonst ändert sich nichts (App in allen Modi, auch mit gebrochener Symmetrie, Skript und Quiz im Browser durchgeklickt, Desktop und Telefon).
- **Gemeinsame Grundlage** auf crystallography-common v0.4.0: Regeln für ESLint (`tools/common/eslint-basis.mjs`). Am Verhalten ändert sich nichts.
- **Typen bereinigt** (#62): Gespeicherte Daten aus dem Browser sind in `pruefeStruktur` (`zustand.js`) und beim Laden der freien Metrik (`main.js`) als `unknown` getypt, die Typprüfung verlangt damit jeden Prüfschritt; die Prüfhilfen (`istObjekt`, `imBereich`, `zahlenpaar`) stehen einmal in `zustand.js`. `grad` und `gitter` stehen einmal in `zeichnung.js` statt doppelt in `zustand.js` und `vorgaben.js`. In den Tests gemeinsamer Helfer `tests/hilfen.mjs` statt fünf Kopien von `da`; Fragen und Nachrechnungen im Quiz-Test mit festen Typen statt `any`. Am Verhalten ändert sich sonst nichts (mit 200 000 zufälligen Eingaben gegen die alte Fassung verglichen); zu gespeicherten Motiven siehe „Behoben“.
- **Befunde von ESLint behoben**, ohne Änderung am Verhalten: ungenutzter Import in `main.js`; in `skizzen.js` setzt `teil()` Buchstaben kursiv ohne Steuerzeichen als Marken (gleiches Ergebnis).
- **Gemeinsame Grundlage** auf crystallography-common v0.3.1: im Typ der Quizfragen ist `pruefung.art` freiwillig; dazu Leitfaden-Änderungen. In `js/quiz-gen.js` entfällt dadurch die Umwandlung `pruefungOhneArt`. Am Verhalten ändert sich nichts (Moodle-Export bytegleich).
- **Erste Schritte je Modus:** Die Karte erscheint beim ersten Aufruf eines Modus, nicht für den Modus, in dem ein Link die App öffnet; Schliessen mit × oder „?“ gilt als gesehen. Wer die bisherigen geschlossen hat, sieht nur die neuen. „Alle Einstellungen zurücksetzen“ zeigt sie wieder. Am Telefon zeigt jeder Schritt die Tafel, in der er wirkt.
- **Gemeinsame Grundlage** auf crystallography-common v0.3.0: Typen für die Typprüfung mit TypeScript (JSDoc; `lib/common/js/typen.js`, Typen des Quiz in `quiz-core.js`), neu in der Offline-Liste. Am Verhalten ändert sich nichts (Moodle-Export bytegleich, Quiz, Skript und Hilfen im Browser gleich, nachgeprüft).
- **README:** Abschnitt „Links auf Ansichten“ heisst „Link-Adressen“, wie im Leitfaden der App-Familie; Typprüfung unter „Tests“.
- **Typprüfung, Schritt 2:** auch Oberfläche, Skript, Quiz, Werkzeuge und Tests strikt typisiert; kein `// @ts-nocheck` mehr, `tests/` in der Typprüfung. Typen des Zustands (`Zustand` in `zustand.js`), der Erklärungen und gezeigten Elemente (`zeichnung.js`), der Fragen (`Frage`, `Generator` aus der gemeinsamen Grundlage). Am Verhalten ändert sich nichts: Tests, Moodle-Export bytegleich, Text des Skript-PDF gleich, App (98 Link-Adressen, Bedienung beider Modi, Telefon, dunkel), Skript und Quiz im Browser vorher und nachher gleich.
- **`js/symmetrie.js`:** `elemente()` baut die Linien aus einem Zwischentyp, statt Felder nachträglich zu setzen und mit `delete` zu entfernen (Ergebnis gleich, auch die Reihenfolge der Felder).

### Behoben

- **Quelle zu Conway** (#42): Ausgabe geklärt (A K Peters/CRC Press 2016, E-Book der Ausgabe von 2008) und alle Seitenangaben gegen das Buch geprüft. Frage tk-3-10 nannte S. 29–30; die Begründung steht auf S. 34–35 (jetzt „Tab. 3.1, S. 29; S. 34–35“, Frage wieder Entwurf zur Freigabe). Im Skript (Quellen zu Abschn. 7.6) das Wunder genauer: S. 24–25 statt 23–25. Jahr in `js/symbole.js` 2016 wie im Skript.
- **Gespeicherter Zustand, Modus „Gitter und Basis“** (#62): Ein Motiv, das kein Text ist, wurde nicht sicher verworfen. Ein Objekt ohne Umwandlung in Text (z. B. `{"toString":1}`) liess die Prüfung abbrechen, und die gespeicherte Struktur blieb ungeprüft stehen; eine Liste wie `["atom"]` wurde als Name gelesen. Solche Einträge fallen jetzt weg.

## [1.0.1] - 2026-11-04

Prüfung des gespeicherten Zustands, gemeinsame Grundlage v0.2.0, ausführliches README und gemeinsamer GitHub-Auftritt der App-Familie. Für Nutzer ändert sich nichts Sichtbares.

### Hinzugefügt

- **README** nach der gemeinsamen Gliederung der App-Familie: Bildschirmfoto, Nutzung (Browser, Homescreen, offline, lokal), Konventionen, Aufbau, Tests, Releases, Quellen, Entstehung (mit Hilfe von Claude Code, fachliche Freigabe durch den Autor), Rückmeldungen, Zitieren. Die Tabelle der Link-Adressen ist vollständig (`zoom`, `og`, `tap`, `lupe`, Ornamente bei `form`, Modus `struktur`).
- **`SECURITY.md`** und Vorlagen für Issues (Fehler, fachlicher Hinweis zu Skript oder Quiz, Vorschlag), wie in allen Repositories der Familie.
- **`CITATION.cff`:** Kurzfassung und Stichwörter.
- **`docs/screenshot.png`** (README) und **`docs/social-preview.png`** (Vorschaubild für geteilte Links).
- **CodeQL** als Workflow (erweiterte Einrichtung nach `crystallography-common/vorlagen`): ohne Tests und die Kopie der gemeinsamen Dateien.

### Geändert

- **Gemeinsame Grundlage** auf crystallography-common v0.2.0: ⓘ-Erklärungen maskieren den Text der Bedienelemente, der Moodle-Export maskiert Anführungszeichen in Alternativtexten (beides Befunde von CodeQL; Anzeige und Moodle-Export sind unverändert, nachgeprüft).

### Behoben

- **Gespeicherter Zustand:** Beim Laden aus dem Browserspeicher wurden `aufbau`, `erkl`, `form`, `zellen` und die Schalter nicht geprüft; ein manipulierter Speicher konnte über die Legende HTML in die Seite bringen. Sie werden jetzt wie die Link-Adresse geprüft (`gespeichertPruefen` in `js/zustand.js`, Test; Befund von CodeQL).

## [1.0.0] - 2026-11-03

Erstes Release: App mit den Modi „Ebenengruppen“ und „Gitter und Basis“, Skript mit sieben Kapiteln und Übungsquiz, für die Vorlesung zu den Ebenengruppen.

### Hinzugefügt

- **Daten und Rechenkern der 17 Ebenengruppen** nach ITA Vol. A (2006), Part 6: Symbole, Kristallsystem, Bravais-Gitter, Punktgruppe, Ursprung, asymmetrische Einheit, Operationen, Erzeugende, Wyckoff-Lagen mit orientierter Lagesymmetrie, Auslöschungen. Operationen lesen, verknüpfen und beschreiben wie in ITA; alle Symmetrieelemente der Zelle, auch die Gleitspiegellinien, die das Symbol nicht nennt. Tests gegen ITA für alle 17 Gruppen.
- **Modus „Ebenengruppen“:** Symmetriegerüst der Elementarzelle (wahlweise 2 × 2 Zellen) mit den Symbolen der ITA, wahlweise nach Blickrichtung gefärbt; Objekt (Fähnchen, Kreis mit Komma oder Ornament) mit allen Bildern, ziehbar, mit Einrasten auf spezielle Lagen; Muster; Kenndaten wie eine ITA-Seite mit Schoenflies-Symbol, Signatur nach Conway und „setzen“ je Wyckoff-Lage; Gitterparameter innerhalb des Kristallsystems.
  - **Asymmetrische Einheit** mit einzeln antippbaren Bedingungen; „Asymmetrische Einheit füllen“ zeigt die lückenlose Pflasterung.
  - **Bilder rund um die Zelle** wie in den Diagrammen der ITA; **Lupe** um das Objekt.
  - **Schritt für Schritt:** das Objekt mit jeder Operation der ITA-Liste, dann mit den Gittertranslationen; am Ende bleibt die Zähligkeit der Wyckoff-Lage.
  - **Aufbau aus Erzeugenden** und **„Warum ist das da?“:** Elemente Schritt für Schritt aus den Erzeugenden; ein angetipptes Element zeigt, aus welchen zwei Operationen es folgt (*C* = *A* ∘ *B*), mit Weg des Fähnchens und Regel, Gitterkopien mit Vorbild und Verschiebung.
  - **Selbst zeichnen** mit Radiergummi und „Rückgängig“: Striche erscheinen mit allen Operationen der Gruppe.
  - **Symmetrie brechen:** *b*/*a* und γ ohne Bindung an das Kristallsystem, mit verbleibender Untergruppe in der Standardaufstellung, konventioneller Zelle und Bahnen der Restsymmetrie.
  - **Muster als Tapete** und **Ornamente** (Blatt, Tropfen, Ranke) als Objekt; Vergrösserung des Musters und Grösse des Objekts.
  - **Verweis in die App „Stereographische Projektion“** (ab v1.12.0): die Punktgruppe als Pedion mit Flächenmuster.
- **Modus „Gitter und Basis“:** Struktur aus Gitter und Motiven mit eigener Symmetrie in vier Farben; die App bestimmt die Ebenengruppe in der Standardaufstellung mit konventioneller Zelle und Ursprung, dazu Lage, Wyckoff-Lage und Lagesymmetrie je Motiv. Vorgaben: Bravais-Gitter, Dreiecksbeispiel, 2D-Materialien (Graphen, h-BN, MoS₂, Kagome, Lieb), Archimedische Parkettierungen, Mauerwerk und Pflaster, künstliches Spin-Eis.
- **Kopieren und Speichern** je Tafel (Bild in die Zwischenablage, SVG, PNG) und **Links auf Ansichten:** Zustand lesbar in der Adresse (Format im README).
- **Skript** „Symmetrie in der Ebene“, Kapitel 1–7: Gitter, Elementarzelle und Basis; Symmetrie des Gitters; Gitter und Motiv; Gleitspiegelung und Verknüpfung; die 17 Ebenengruppen; Punktlagen; Tapeten, Ornamente und Kunst (mit Vertiefungen zu Fliesen und Alhambra, Escher, Farbsymmetrie und der Signatur nach Conway). Abbildungen aus dem Code der App, je mit Link in die App; Vertiefungen gekennzeichnet; als PDF.
- **Quiz** zu allen Kapiteln: 100 geprüfte Fragen (Stufe 1: 42, Stufe 2: 40, Stufe 3: 18) und 11 Fragengeneratoren (u. a. Diagramm, Lage, Punktgruppe, Struktur, Muster, Koordinaten), Bilder aus dem Code der App, Antworten im Test nachgerechnet; Export für Moodle.
- **Oberfläche** für Laptop, iPad und Telefon, helles und dunkles Farbschema; **Offline-Betrieb** als Web-App.

## [0.1.0] - 2026-10-30

### Hinzugefügt

- Gerüst aus der Vorlage von crystallography-common.

[Unreleased]: https://github.com/manganite/plane-groups/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/manganite/plane-groups/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/manganite/plane-groups/compare/v0.1.0...v1.0.0
