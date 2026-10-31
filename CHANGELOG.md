# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- **Aufbau aus Erzeugenden** und **„Warum ist das da?“** (Konzept §1b, Blickrichtung „Bedingen“):
  - `js/herkunft.js` sucht schrittweise, welche Operationen aus den Erzeugenden nach ITA und den Gittertranslationen folgen. Je Element merkt es sich die Zerlegung *C* = *A* ∘ *B*, Translationen zuerst.
  - Tafel A zeigt die Elemente Schritt für Schritt, neue hervorgehoben.
  - Das Werkzeug „Warum ist das da?“ zeigt für ein angetipptes Element die Zerlegung mit Fähnchen, Regel (`js/warum.js`) und Herleitung.
  - Die Wege des Fähnchens unter *B*, *A* und *C* zeigen, wie die Operationen wirken: Drehung als Bogen um den Drehpunkt, Gleitspiegelung in zwei Teilen (Spiegelung, dann Verschiebung um die Gleitkomponente entlang der Linie). Stellen sind nummeriert (0, 1, 2), Wege tragen den Buchstaben der Operation.
  - **Gitterkopien** werden einfacher erklärt: Ist ein Element nur ein vorhandenes, um einen Gittervektor verschoben (z. B. die 4-zähligen Drehpunkte an den Ecken, in c-Gruppen auch um die Zentrierung), zeigt „Warum ist das da?“ das Vorbild *V* und die Verschiebung *t* statt einer Verknüpfung (`vorbild()` in `js/herkunft.js`).
  - Link-Adresse mit `aufbau`, `warum`, `erkl`.
  - Tests `tests/herkunft.test.mjs`: Herkunft aller Elemente, Beispiele p4mm, c2mm und p6, Regeln.

- **Bedingungen der asymmetrischen Einheit antippen** (`js/asymmetrie.js`): Jede Bedingung der ITA-Seite wird als Halbebenen gelesen; Tafel A schattiert, wo die gewählten erfüllt sind, und zeigt ihre Grenzlinien. Link-Adresse mit `aet`. Test: Alle Bedingungen zusammen ergeben für alle 17 Gruppen genau die asymmetrische Einheit der ITA (Fläche = Zellfläche / Zahl der Operationen).

- **Modus „Ebenengruppen“** (Kern): Gruppenwahl; Symmetriegerüst der Elementarzelle (wahlweise 2 × 2) mit den Symbolen der ITA; Objekt (Fähnchen oder Kreis mit Komma) mit allen Bildern, ziehbar, mit Einrasten auf spezielle Lagen; asymmetrische Einheit; Muster; Kenndaten wie eine ITA-Seite mit „setzen“ je Wyckoff-Lage; Gitterparameter innerhalb des Kristallsystems; Färbung nach Blickrichtung; Zustand in der Link-Adresse (`js/zustand.js`, Format im README); Hilfetexte und Erste Schritte.
- `js/zeichnung.js` (SVG der Tafeln, ohne DOM), `js/text.js` (Schreibweise wie in ITA), Tests `tests/zeichnung.test.mjs`, `tests/zustand.test.mjs`, `tests/text.test.mjs`.

- **Daten der 17 Ebenengruppen** nach ITA Vol. A (2006), Part 6 (`js/ebenengruppen.js`): Symbole, Kristallsystem, Bravais-Gitter, Punktgruppe, Ursprung, asymmetrische Einheit, Operationen und ihre Beschreibung, Erzeugende, Wyckoff-Lagen mit orientierter Lagesymmetrie und Koordinaten, Auslöschungsbedingungen.
- **Rechenkern** (`js/symmetrie.js`): Operationen lesen, verknüpfen und beschreiben wie in ITA („m 1/4,y“, „g(1/2,1/2) x,x“), Abschluss aus Erzeugenden, Punktgruppe, alle Symmetrieelemente der Elementarzelle (auch die Gleitspiegellinien, die das Symbol nicht nennt), Stabilisator, orientierte Lagesymmetrie, Wyckoff-Lage eines Punktes, Bahn, Strukturfaktor und Auslöschungen.
- **Tests gegen ITA** für alle 17 Gruppen (`tests/ebenengruppen.test.mjs`): Gruppeneigenschaften, Erzeugende, Beschreibung der Operationen, Punktgruppe, Wyckoff-Lagen (Zähligkeit, Lagesymmetrie, Koordinaten, Erkennung auf einem Raster), asymmetrische Einheit (Fläche, lückenlose Zerlegung), Auslöschungen allgemein und je Lage, Symmetrieelemente je Zelle, Beispiele p4mm und c2mm, Dreiecksbeispiel.

## [0.1.0] - 2026-10-30

### Hinzugefügt

- Gerüst aus der Vorlage von crystallography-common.
