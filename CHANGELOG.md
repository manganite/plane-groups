# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geändert

- **Quiz nach der Gegenprüfung** (#33, vier unabhängige Prüfer): Keine richtige Antwort war falsch. Korrigiert sind zwei fachlich falsche Hinweise (gm-2-04: auch eine Translation führt den Punkt über; tk-1-03: abwechselnder Versatz um einen anderen Betrag ergibt *p*2*mg*, nicht *p*2). Dazu kommen Mehrdeutigkeiten und Präzisierungen; geändert sind 27 Fragen. Chiralität bedeutet weder Spiegel- noch Gleitspiegellinien (tk-3-02, Skript Abschn. 7.3). Statt „Klasse“ steht „Nebenklasse“, mit Quelle Schwarzenbach (eg-3-02, Skript Vertiefung 5.4). tk-3-03 und tk-3-04 verlinken nicht mehr auf Fähnchenmuster; tk-3-04 zeigt die Kacheln als Bild, ohne Drehpunkte. Bei den Generatoren nennen die Hinweise nur die Schritte, die das Symbol braucht (punktgruppe). Die Hinweise sagen, dass ein Ablenker keine Gleitspiegellinien hat, und die Erklärung sagt, wo die Gleitspiegellinien liegen (gleit-ungenannt). Die Frage nach der Reihenfolge heisst „bei manchen Paaren“ (reihenfolge). Beim Läuferverband steht ein Satz zur zufällig quadratischen Zelle (verband). Alle geänderten Fragen und Generatoren sind Entwürfe bis zur Freigabe.
- **Gleitspiegelung genauer** (#33, nach einem externen Review des Quiz): Skript Abschn. 4.1 und die Fragen gl-1-02 und gl-1-08 sagten, linker und rechter Fussabdruck seien „um eine halbe Schrittlänge“ versetzt; versetzt sind sie um einen Schritt, die halbe Periode der Spur; sie wiederholt sich nach einem Doppelschritt. Die Gleitkomponente heisst jetzt „halbe Gitterperiode entlang der Linie“, die Hälfte der kürzesten Gittertranslation in dieser Richtung (Skript Abschn. 4.1, 4.4, Zusammenfassung; gl-1-01, gl-2-08). Bei der Herleitung der 17 Gruppen werden „einige oder alle“ Spiegellinien durch Gleitspiegellinien ersetzt (Skript Abschn. 5.1, Kap. 7; eg-1-01). Alle fünf Fragen sind von Thomas freigegeben; gl-1-01 hat dabei eine klarere Erklärung bekommen.
- **Gemeinsame Grundlage** auf crystallography-common v0.9.0: Im Quiz gelten die Grenzen für erzeugte Fragen (30 % je Generator, 50 % insgesamt) streng, solange die gewählte Länge erreichbar ist; sonst nie mehr erzeugte als handgeschriebene Fragen. Querstriche werden von Screenreadern als „−“ vorgelesen; die Legende bricht auf dem Telefon um statt unsichtbar zu scrollen; im Skript-PDF stehen Abb. 7.3 und 7.5 je auf einer Seite.

### Behoben

- **„Zurücksetzen“ nach einem Link** (#81): Im Modus „Gitter und Basis“ enthielt die Link-Adresse einer veränderten Struktur keine Vorgabe; nach dem Öffnen des Links oder dem Neuladen setzte „Zurücksetzen“ auf das Dreiecksbeispiel statt auf die eigentliche Vorgabe zurück. Die Adresse enthält jetzt immer `v=…`; alte Links ohne `v` verhalten sich wie bisher.

## [1.1.0] - 2026-11-05

„Herkunft der Elemente“ (früher „Warum ist das da?“) als Schalter im Abschnitt „Aufbau aus Erzeugenden“; Erklärungen im Symmetriegerüst mit Objekt in fester Grösse; das Objekt hat im Gitter in beiden Tafeln dasselbe Verhältnis zur Zelle; Erste Schritte je Modus, neu für „Gitter und Basis“; „Alle Einstellungen zurücksetzen“ unten in der Seitenleiste; gewählte und gesperrte Knöpfe einheitlich; Typprüfung und ESLint; gemeinsame Grundlage v0.8.1.

### Hinzugefügt

- **ESLint** als CI-Job `lint` mit den gemeinsamen Regeln (`eslint.config.mjs`, `tools/common/eslint-basis.mjs`; LEITFADEN Abschn. 9). Die Pakete installiert auch der Job `typen`.
- **Erste Schritte für „Gitter und Basis“** (#56): vier Schritte am Dreiecksbeispiel (*pm* → *cm* → *p*2*mg*, mit Hinweis auf die Änderung in den Kenndaten) und zum Selbstbauen.
- **Typprüfung mit TypeScript** über JSDoc-Typen (`tsconfig.json`, CI-Job `typen`; crystallography-common#19, Schritt 1). Strikt geprüft werden die Rechenkerne `symmetrie.js`, `ebenengruppen.js`, `punktoperationen.js`, `herkunft.js`, `bestimmung.js`, `asymmetrie.js`, `struktur.js` und `brechen.js`, mit `Vec2`/`Mat2` aus der gemeinsamen Grundlage. Gekennzeichnete Typen trennen kartesische Gittervektoren von Bruchkoordinaten (`Kartesisch<Vec2>`: `metrik()`, `kart()`, `bruchVon()`, `bestimme()`) und Winkel in Grad (`Grad`: γ, Winkel der Punktoperationen und Motive). Am Verhalten ändert sich nichts (Tests, Moodle-Export bytegleich, Ergebnisse der Kerne für alle 17 Gruppen und App, Skript und Quiz im Browser vorher und nachher gleich).

### Geändert

- **Gemeinsame Grundlage** auf crystallography-common v0.8.1 (über v0.8.0): gewählte und gesperrte Knöpfe (`.tools`, `.seg`) kommen jetzt aus `lib/common/css/app.css`; die eigenen Regeln dafür entfallen. Am Aussehen ändert sich nichts (dieselben Werte; gesperrte Werkzeugknöpfe färben beim Überfahren den Rand nicht mehr).
- **„Warum ist das da?“ heisst „Herkunft der Elemente“** (#72) und ist ein Schalter im Abschnitt „Aufbau aus Erzeugenden“ statt eines Knopfs über dem Symmetriegerüst. Es erklärt die Symmetrieelemente, nicht Objekt oder Zeichnung; über dem Gerüst bleiben Zeichnen, Radieren und Lupe. Die Link-Adresse bleibt (`warum=1`, `erkl=`). Skript (Abschn. 4.4 mit Abb. 4.6, Abschn. 4.5) und README angepasst.
- **Erklärungen im Symmetriegerüst** (#71): Sobald „Schritt für Schritt“, der Aufbau aus Erzeugenden oder „Herkunft der Elemente“ aktiv ist, zeigt das Gerüst das Objekt in fester Grösse, wie die Fähnchen der Erklärungen; bei „Herkunft der Elemente“ schon beim Einschalten, nicht erst mit gewähltem Element. Die eigene Zeichnung und die gefüllte asymmetrische Einheit sind im Gerüst ausgeblendet (im Muster bleiben sie); die Werkzeuge „Zeichnen“ und „Radieren“ werden abgewählt, „Asymmetrische Einheit füllen“ und die Lupe bleiben gewählt und ruhen; alle sind gesperrt und blass, und Legende und Hinweise nennen den Grund. Beim Verlassen kommen Zeichnung, Füllung und Lupe zurück. Bisher blendete nur eine laufende Erklärung die Zeichnung aus. Ein Link mit unbekanntem Element sperrt nichts mehr. Skript-Abbildungen mit diesen Erklärungen sind wieder wie in v1.0.1.
- **Grösse des Objekts im Gitter:** Das Objekt (Fähnchen, Komma, Ornament) hat im Symmetriegerüst und im Muster dasselbe Verhältnis zur Zelle, wie eine Zeichnung. Bisher war es in Bildpunkten festgelegt und im Muster 2- bis 3-mal so gross wie im Gerüst; ein Muster liess sich so kaum gezielt aufbauen, besonders zusammen mit „Zeichnen“. Das Muster bleibt, wie es war (auch Skript-Abbildungen und Quizbilder des Musters). Im Gerüst ist das Objekt grösser, und mit Objekt wird die Zelle kleiner (Rand, damit ein Objekt mit dem Fuss auf dem Zellrand ganz sichtbar bleibt); der Regler „Grösse“ ändert deshalb auch den Ausschnitt des Gerüsts. Die Lupe vergrössert das Objekt mit und jetzt genau doppelt. Ziehen greift das ganze Objekt, nicht nur den Fuss, und das Objekt springt dabei nicht mehr zum Zeiger. In Quiz- und Skriptbildern des Gerüsts folgt das Fähnchen ebenfalls dem Gitter, nicht mehr der Grösse der Symbole. „Schritt für Schritt“ und „Herkunft der Elemente“ zeichnen ihre Fähnchen wie bisher. Der Link-Parameter `og` bezieht sich im Gerüst jetzt auf die Zelle; alte Links werden nicht umgerechnet, weil `og` bisher nur für das Muster gesetzt wurde (Skript-Abb. 7.x) und das Muster gleich bleibt.
- **„Alle Einstellungen zurücksetzen“** (crystallography-common#48): Der Knopf steht jetzt unten in der Seitenleiste ausserhalb der Abschnitte, wie in der Stereo-App, statt im Abschnitt „Darstellung“. Er löscht alle gespeicherten Einstellungen ausser dem Fortschritt im Quiz und lädt die App ohne Link-Adresse neu; damit sind auch aufgeklappte Abschnitte und die Tafel am Telefon wieder wie beim ersten Aufruf.
- **Gemeinsame Grundlage** auf crystallography-common v0.7.0: `alleEinstellungenZuruecksetzen` (`lib/common/js/seite.js`); zum PDF siehe „Behoben“.
- **Gemeinsame Grundlage** auf crystallography-common v0.6.0: Die Anordnung der Tafeln kommt jetzt aus `lib/common/css/app.css`; die eigenen Regeln dafür entfallen. Am Verhalten ändert sich nichts (Lage und Stile aller Elemente vorher und nachher gleich, nachgeprüft).
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

- **„Schritt für Schritt“ mit „Herkunft der Elemente“:** Mit gezeigter Herkunft eines Elements waren die Bedienelemente frei, wirkten aber nicht. Jetzt ruht „Schritt für Schritt“, sobald „Herkunft der Elemente“ eingeschaltet ist: gesperrt, bleibt gewählt, Grund darunter; nach dem Ausschalten wirkt es wieder. Gesperrte Knöpfe in Knopfgruppen (zurück, weiter, Abspielen u. a.) sind jetzt blass. Laufendes Abspielen der Schritte stoppt, sobald „Schritt für Schritt“ ruht, beim Wählen eines Elements und beim Wechsel der Gruppe (zuvor lief es mit der Schrittzahl der alten Gruppe weiter).
- **PDF des Skripts** (crystallography-common#43): Abb. 2.3 steht jetzt auf einer Seite statt über einen Seitenumbruch verteilt.
- **Quelle zu Conway** (#42): Ausgabe geklärt (A K Peters/CRC Press 2016, E-Book der Ausgabe von 2008) und alle Seitenangaben gegen das Buch geprüft. Frage tk-3-10 nannte S. 29–30; die Begründung steht auf S. 34–35 (jetzt „Tab. 3.1, S. 29; S. 34–35“; Frage neu geprüft und freigegeben). Im Skript (Quellen zu Abschn. 7.6) das Wunder genauer: S. 24–25 statt 23–25. Jahr in `js/symbole.js` 2016 wie im Skript.
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

[Unreleased]: https://github.com/manganite/plane-groups/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/manganite/plane-groups/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/manganite/plane-groups/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/manganite/plane-groups/compare/v0.1.0...v1.0.0
