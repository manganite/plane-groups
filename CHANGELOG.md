# Changelog

Alle nennenswerten Änderungen an der App werden hier festgehalten.

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionsnummern folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- **Modus „Gitter und Basis“** (Konzept §3.2; `js/motive.js`, `js/vorgaben.js`, `js/struktur.js`, `js/struktur-ui.js`): Struktur aus Gitter und Motiven mit eigener Symmetrie, in vier Farben; Motive setzen, ziehen, drehen, skalieren, entfernen. Die Symmetrie bestimmt `bestimme()`; Tafel A zeigt gegebene und konventionelle Zelle mit Symmetrieelementen und asymmetrischer Einheit der gefundenen Gruppe, Tafel B einen Ausschnitt. Kenndaten mit Lage, Wyckoff-Lage und Lagesymmetrie je Motiv, Hinweis auf die Änderung der Gruppe, Knopf in den Modus „Ebenengruppen“. 20 Vorgaben: Bravais-Gitter, Dreiecksbeispiel, 2D-Materialien (Graphen, h-BN, MoS₂, Kagome, Lieb), Archimedische Parkettierungen, künstliches Spin-Eis. Link-Adresse `m=struktur` mit `v` bzw. `ba`, `gamma`, `basis`. Tests `tests/struktur.test.mjs`: alle Vorgaben ergeben die erwartete Gruppe, Motive haben genau ihre Symmetrie, Archimedische Parkettierungen mit gleich langen Kanten, Wyckoff-Lagen, Link-Adresse hin und zurück.
- **Radiergummi** beim Selbst-Zeichnen (`radieren()` in `js/zeichnung.js`): entfernt nur die überfahrenen Stücke; an einer Kopie radiert, fehlt das Stück am Original und an allen Kopien. „Rückgängig“ macht jetzt auch Radieren und „Alles löschen“ rückgängig.
- **Symmetrie bestimmen** (`js/bestimmung.js`, Konzept §8): Gitter und Basis → kleinste Zelle, Operationen, Ebenengruppe in der Standardaufstellung der ITA, konventionelle Zelle und Ursprung. Tests: alle 17 Gruppen wiedererkannt, auch mit verschobenem Ursprung, anderer Zelle (auch nicht konventionell und vertauscht) und gedreht; Dreiecksbeispiel pm → cm → p2mg, auch mit Spitzen entlang *a*; leeres Gitter.
- **Symmetrie brechen** (Konzept §3.1, Blickrichtung „Umkehren“; `js/brechen.js`): *b*/*a* und γ ohne Bindung an das Kristallsystem; verbleibende Operationen, Untergruppe nach ITA mit konventioneller Zelle, Symmetriegerüst nur mit den verbleibenden Elementen (wie die Stereo-App, ohne Färbung nach Blickrichtung bei erniedrigter Symmetrie), Bilder des Objekts nach Bahnen der Restsymmetrie gefärbt. Im Abschnitt „Gitter“ als Schalter „Ohne Bindung an das Kristallsystem“ mit denselben Reglern (Rückmeldung Thomas: kein eigener Abschnitt). Link-Adresse `brechen=1` mit `ba`, `gamma`.
- **Selbst zeichnen** (Konzept §3.1): Werkzeug „Zeichnen“ in Tafel A; Striche werden mit allen Operationen der Gruppe vervielfältigt, in Tafel A und im Muster (`kopien()`, `vereinfachen()` in `js/zeichnung.js`). „Asymmetrische Einheit füllen“ (Link-Adresse `fuell=1`) zeigt die lückenlose Pflasterung durch ihre Bilder. Striche im Browser gespeichert, nicht im Link. Test: Für alle 17 Gruppen liegt jeder Punkt der Zelle in genau einem Bild der asymmetrischen Einheit.

- **Schritt für Schritt** (Konzept §3.1, Blickrichtung „Erzeugen“; `js/schritte.js`, `schrittDaten()` in `js/zeichnung.js`): das Objekt mit jeder Operation der ITA-Liste, dann mit den Gittertranslationen; Zähler der verschiedenen Stellen, zusammenfallende Bilder auf speziellen Lagen, markierte Zeile in den Kenndaten, Abspielen. Link-Adresse `schritt`. Test: Für jede Wyckoff-Lage aller 17 Gruppen bleibt am Ende genau die Zähligkeit.
- **Bilder rund um die Zelle (wie ITA)** (Schalter unter „Weitere Optionen“, Link-Adresse `orbit=1`): Tafel A zeigt auch die Bilder in einem Rand von ⅓ der Zelle, sodass die Gruppen um Ecken und Ränder vollständig sind.
- **Aufbau aus Erzeugenden** und **„Warum ist das da?“** (Konzept §1b, Blickrichtung „Bedingen“):
  - `js/herkunft.js` sucht schrittweise, welche Operationen aus den Erzeugenden nach ITA und den Gittertranslationen folgen. Je Element merkt es sich die Zerlegung *C* = *A* ∘ *B*, Translationen zuerst.
  - Tafel A zeigt die Elemente Schritt für Schritt, neue hervorgehoben.
  - Das Werkzeug „Warum ist das da?“ zeigt für ein angetipptes Element die Zerlegung mit Fähnchen, Regel (`js/warum.js`) und Herleitung.
  - Die Wege des Fähnchens unter *B*, *A* und *C* zeigen, wie die Operationen wirken: Drehung als Bogen um den Drehpunkt, Gleitspiegelung in zwei Teilen (Spiegelung, dann Verschiebung um die Gleitkomponente entlang der Linie). Stellen sind nummeriert (0, 1, 2), Wege tragen den Buchstaben der Operation.
  - **Gitterkopien** werden einfacher erklärt: Ist ein Element nur ein vorhandenes, um einen Gittervektor verschoben (z. B. die 4-zähligen Drehpunkte an den Ecken, in c-Gruppen auch um die Zentrierung), zeigt „Warum ist das da?“ das Vorbild *V* und die Verschiebung *t* statt einer Verknüpfung (`vorbild()` in `js/herkunft.js`).
  - Link-Adresse mit `aufbau`, `warum`, `erkl`.
  - Tests `tests/herkunft.test.mjs`: Herkunft aller Elemente, Beispiele p4mm, c2mm und p6, Regeln.

- **Verweis in die Stereo-App** (`js/verweise.js`, ab Stereo-App v1.12.0): Die Punktgruppe führt zum Pedion mit Flächenmuster und Blick senkrecht auf die Fläche (`blick`), aufgeräumte Ansicht mit Kristallachsen; p3m1 → 3m1, p31m → 31m. Bei 1 und m der Modus „Punktgruppen“ mit Blick entlang c. Die 10 Punktgruppen der Ebene entsprechen den 10 polaren Punktgruppen. Alle elf Links mit der Stereo-App v1.12.0 im Browser geprüft, Orientierung der Achsen und Spiegellinien abgeglichen.
- **Bedingungen der asymmetrischen Einheit antippen** (`js/asymmetrie.js`): Jede Bedingung der ITA-Seite wird als Halbebenen gelesen; Tafel A schattiert, wo die gewählten erfüllt sind, und zeigt ihre Grenzlinien. Link-Adresse mit `aet`. Test: Alle Bedingungen zusammen ergeben für alle 17 Gruppen genau die asymmetrische Einheit der ITA (Fläche = Zellfläche / Zahl der Operationen).

- **Modus „Ebenengruppen“** (Kern): Gruppenwahl; Symmetriegerüst der Elementarzelle (wahlweise 2 × 2) mit den Symbolen der ITA; Objekt (Fähnchen oder Kreis mit Komma) mit allen Bildern, ziehbar, mit Einrasten auf spezielle Lagen; asymmetrische Einheit; Muster; Kenndaten wie eine ITA-Seite mit „setzen“ je Wyckoff-Lage; Gitterparameter innerhalb des Kristallsystems; Färbung nach Blickrichtung; Zustand in der Link-Adresse (`js/zustand.js`, Format im README); Hilfetexte und Erste Schritte.
- `js/zeichnung.js` (SVG der Tafeln, ohne DOM), `js/text.js` (Schreibweise wie in ITA), Tests `tests/zeichnung.test.mjs`, `tests/zustand.test.mjs`, `tests/text.test.mjs`.

- **Daten der 17 Ebenengruppen** nach ITA Vol. A (2006), Part 6 (`js/ebenengruppen.js`): Symbole, Kristallsystem, Bravais-Gitter, Punktgruppe, Ursprung, asymmetrische Einheit, Operationen und ihre Beschreibung, Erzeugende, Wyckoff-Lagen mit orientierter Lagesymmetrie und Koordinaten, Auslöschungsbedingungen.
- **Rechenkern** (`js/symmetrie.js`): Operationen lesen, verknüpfen und beschreiben wie in ITA („m 1/4,y“, „g(1/2,1/2) x,x“), Abschluss aus Erzeugenden, Punktgruppe, alle Symmetrieelemente der Elementarzelle (auch die Gleitspiegellinien, die das Symbol nicht nennt), Stabilisator, orientierte Lagesymmetrie, Wyckoff-Lage eines Punktes, Bahn, Strukturfaktor und Auslöschungen.
- **Tests gegen ITA** für alle 17 Gruppen (`tests/ebenengruppen.test.mjs`): Gruppeneigenschaften, Erzeugende, Beschreibung der Operationen, Punktgruppe, Wyckoff-Lagen (Zähligkeit, Lagesymmetrie, Koordinaten, Erkennung auf einem Raster), asymmetrische Einheit (Fläche, lückenlose Zerlegung), Auslöschungen allgemein und je Lage, Symmetrieelemente je Zelle, Beispiele p4mm und c2mm, Dreiecksbeispiel.

### Geändert

- **Ursprung nach ITA bleibt, wenn er darf** (`bestimme()` in `js/bestimmung.js`): Gibt es mehrere erlaubte Ursprünge (etwa die drei Punkte 3*m* in *p*3*m*1), nimmt die App den, der dem Ursprung der gegebenen Zelle am nächsten liegt. Bisher wanderte er bei h-BN und MoS₂ ohne Not auf ein Atom. Test: h-BN, MoS₂, Molekül aus zwei Atomen (Ursprung in der Molekülmitte), Dreiecksbeispiel *p*2*mg*.
- Das Muster in Tafel B zeigt die Fähnchen nur noch mit „Objekt in allgemeiner Lage“, damit es beim Zeichnen nur das Gezeichnete zeigt.

## [0.1.0] - 2026-10-30

### Hinzugefügt

- Gerüst aus der Vorlage von crystallography-common.
