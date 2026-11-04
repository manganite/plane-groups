# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- **README** nach der gemeinsamen Gliederung der App-Familie: Bildschirmfoto, Nutzung (Browser, Homescreen, offline, lokal), Konventionen, Aufbau, Tests, Releases, Quellen, Rückmeldungen, Zitieren. Die Tabelle der Link-Adressen ist vollständig (`zoom`, `og`, `tap`, `lupe`, Ornamente bei `form`, Modus `struktur`).
- **`SECURITY.md`** und Vorlagen für Issues (Fehler, fachlicher Hinweis zu Skript oder Quiz, Vorschlag), wie in allen Repositories der Familie.
- **`CITATION.cff`:** Kurzfassung und Stichwörter.
- **`docs/screenshot.png`** (README) und **`docs/social-preview.png`** (Vorschaubild für geteilte Links).

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

[Unreleased]: https://github.com/manganite/plane-groups/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/manganite/plane-groups/compare/v0.1.0...v1.0.0
