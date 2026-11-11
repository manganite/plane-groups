# Konzept: dritter Modus „Muster entwerfen“ (Entwurf)

> **Status:** Entwurf zur Freigabe durch Thomas (11.11.2026). Planung und Fortschritt in #136, Reihenfolge im Fahrplan
> crystallography-common#74. Nach der Umsetzung bekommt dieses Dokument einen Statuskopf und wird nicht mehr nachgeführt.
> Bei Widerspruch gelten `CLAUDE.md` und der `LEITFADEN.md` von crystallography-common.

## 1. Anlass

Die App hat zwei Modi, und jeder trägt eine Zusatzfunktion, die zu seinem Zweck nur bedingt passt (Thomas, 9.11.2026):

- **„Ebenengruppen“** erklärt eine Gruppe: Symmetrieelemente, asymmetrische Einheit, Schritt für Schritt, Aufbau aus
  Erzeugenden, Herkunft der Elemente. Dazu kam „Selbst zeichnen“.
- **„Gitter und Basis“** zeigt, wie die Basis die Symmetrie bestimmt. Dazu kam „Symmetrie festhalten“ (#121): eine
  Struktur in gegebener Gruppe aufbauen.

Zeichnen und Aufbau in gegebener Gruppe haben mehr miteinander zu tun als mit ihren Modi: Bei gegebener Symmetrie
entsteht ein eigenes Muster. Sie ziehen deshalb in einen dritten Modus. Jeder Modus hat dann eine Frage:

| Modus | Frage | Tafel A | Tafel B |
|---|---|---|---|
| Ebenengruppen | Was gehört zu einer Gruppe, und woher kommt es? | Symmetriegerüst | Muster |
| Gitter und Basis | Welche Symmetrie hat diese Struktur? | Struktur mit Zellen | Muster |
| **Muster entwerfen** (neu) | Wie sieht ein Muster in dieser Gruppe aus? | Zelle mit Gerüst, hier wird gestaltet | Muster |

**Zwei Wege zum selben Ergebnis** (Leitfaden Abschn. 5.2): Ein Muster aus Fähnchen in gegebener Gruppe zeigt auch
„Ebenengruppen“ (Objekt in allgemeiner Lage, Tafel B). Das ist kein zweiter Weg, weil die Modi verschiedene Fragen
beantworten: „Ebenengruppen“ zeigt ein einzelnes Objekt und dessen Bilder, um die Gruppe zu erklären; „Muster entwerfen“
setzt mehrere Motive mit eigener Symmetrie und eigener Farbe. Deshalb entstand „Symmetrie festhalten“ nicht als Ausbau
von „Ebenengruppen“: Motive mit eigener Symmetrie und Sorten gibt es nur im Motivmenü.

Alte Links und Speicherstände werden nicht umgerechnet (crystallography-common#126, Leitfaden Abschn. 8). Keine andere
App verlinkt auf `plane-groups/#m=…` (stereography und crystallography-common durchsucht, 11.11.2026).

## 2. Entscheidungen (Thomas, 11.11.2026)

1. **Gestaltungsmittel als Auswahlmenü wie in „Gitter und Basis“**, aber mit eigener Liste: zuoberst das Atom, dann die
   Ornamente (Blatt, Tropfen, Ranke), der Ziegel, das Fähnchen und der offene Kreis. Ob weitere Motive nötig sind, ist
   offen; in Frage kommen Insel, Dreieck und Quadrat (Frage 1). Das Menü in „Gitter und Basis“ bleibt, wie es ist.
2. **„Darstellung“ in allen drei Modi:** Nach Blickrichtung färben, Symmetrieelemente im Muster, Muster als Tapete,
   Vergrösserung des Musters. Heute gibt es den Abschnitt nur in „Ebenengruppen“; in „Gitter und Basis“ steht die
   Vergrösserung unter „Anzeigen“ (`s-zoom`, dasselbe Feld `zoomB` wie `v-zoom`) und zieht in „Darstellung“ um.
3. **„Symmetrie brechen“ entfällt** in „Ebenengruppen“. Symmetriebruch ist das Thema von „Gitter und Basis“ und dort am
   konsequentesten umgesetzt (das Gitter ist dort frei). In „Ebenengruppen“ und „Muster entwerfen“ sind nur
   symmetrieerhaltende Änderungen des Gitters möglich (b/a und γ, soweit das Kristallsystem sie freigibt).
4. **„Gitter und Basis“ bleibt wie er ist**, nur „Darstellung“ kommt dazu und „Symmetrie festhalten“ geht in den neuen
   Modus.
5. **Name „Muster entwerfen“**, passend zur Tafel B „Muster“.
6. **Auslöschungen entfallen** in den Kenndaten von „Ebenengruppen“ (Spalte der Wyckoff-Tabelle und Abschnitt
   „Auslöschungen“): Sie gehören in die Beugungs-App (crystallography-common#73) und verwirren hier mehr, als sie helfen.

## 3. Die drei Modi im Einzelnen

### 3.1 „Ebenengruppen“ (verstehen)

Seitenleiste nachher:
- **Ebenengruppe:** Gruppenwahl; Anzeigen: Symmetrieelemente, Objekt in allgemeiner Lage, asymmetrische Einheit;
  Weitere Optionen: 2 × 2 Zellen, Form des Objekts, Einrasten, Bilder rund um die Zelle.
- **Objekt:** Lage *x*, *y*, Grösse.
- **Schritt für Schritt**, **Aufbau aus Erzeugenden** (mit Herkunft der Elemente): unverändert.
- **Gitter:** b/a und γ im Kristallsystem; ohne „Symmetrie brechen“.
- **Darstellung** (gemeinsam, Abschn. 3.4).
- Werkzeuge über Tafel A: Lupe (Frage 4).

Es entfallen „Selbst zeichnen“ (Zeichnen, Radieren, Rückgängig, Alles löschen), „Symmetrie brechen“ und die
Auslöschungen. Offen: das Füllen der asymmetrischen Einheit (Frage 6) und die Ornamente als Form des Objekts (Frage 3).

### 3.2 „Gitter und Basis“ (analysieren)

Unverändert: Vorgabe, Anzeigen, Basis (Motive wählen, setzen, drehen, spiegeln), freies Gitter (0,5–2 und 60–150°),
Werkzeuge „Wählen und ziehen“ und „Hinzufügen“, Bestimmung der Gruppe in den Kenndaten. Neu: „Darstellung“. Es entfällt
„Symmetrie festhalten“; sein Inhalt geht in „Muster entwerfen“.

### 3.3 „Muster entwerfen“ (gestalten, neu)

- **Ebenengruppe:** Gruppenwahl wie in „Ebenengruppen“ (Knöpfe je Kristallsystem). Die Gruppe ist immer fest; einen
  Schalter „Symmetrie festhalten“ gibt es nicht mehr.
- **Motive:** Auswahlmenü (Abschn. 2, Punkt 1). Jedes gesetzte Motiv ist Vertreter seiner Bahn; die Bilder entstehen
  durch alle Operationen der Gruppe. Drehen, Spiegeln (chirale Motive), Grösse, Farbe, Entfernen, Einrasten auf spezielle
  Lagen: wie heute mit festgehaltener Symmetrie (`CLAUDE.md`, „Symmetrie festhalten“; die Rechnungen aus #121 bleiben).
  Liegt ein Motiv auf einer speziellen Lage, deren Lagesymmetrie es nicht hat, nennen die Kenndaten die tatsächliche
  Gruppe des Musters (wie heute). Ornamente und Kreis mit Komma sind heute keine Motive (keine Punkte für die
  Bestimmung, keine Angabe der eigenen Symmetrie); sie dafür auszubauen, beschreibt #104.
- **Zeichnen:** „Selbst zeichnen“ aus „Ebenengruppen“ (Striche, die alle Operationen vervielfachen; Rückgängig, Alles
  löschen) als weiteres Gestaltungsmittel (Frage 2).
- **Werkzeuge über Tafel A:** „Wählen und ziehen“, „Hinzufügen“, Zeichnen, Radieren; sie schliessen sich aus (Leitfaden
  Abschn. 5.2). Dazu die Lupe als Schalter (Frage 4).
- **Gitter:** b/a und γ im Kristallsystem der Gruppe (Abschn. 2, Punkt 3), im Bereich von heute mit festgehaltener
  Symmetrie (`STRUKTUR_BEREICH`, 0,5–2 und 60–150°); zufällige Zusatzsymmetrie bleibt möglich (*p*2*mm* mit *b* = *a*,
  Experiment `festhalten-metrik`). Frage 7.
- **Darstellung** (gemeinsam).
- **Kenndaten:** gewählte Gruppe, tatsächliche Gruppe des Musters (wenn verschieden: warum), Zahl der Motive.
- **Übergang aus „Gitter und Basis“:** heute „Bestimmte Gruppe übernehmen“. Vorschlag: In „Gitter und Basis“ ein Knopf
  „In ‚Muster entwerfen‘ weiterbearbeiten“, der die Struktur mit der bestimmten Gruppe (umgerechnet in die Aufstellung
  nach ITA, wie heute) in den neuen Modus übernimmt (Frage 5).

### 3.4 Gemeinsam: „Darstellung“

Ein Abschnitt, in allen drei Modi an derselben Stelle (unten in der Seitenleiste, vor „Alle Einstellungen
zurücksetzen“). Heute wirken die Punkte nur in „Ebenengruppen“: In „Gitter und Basis“ zeichnet Tafel A ohne Färbung nach
Blickrichtung (`farben: false` in `js/struktur-ui.js`), und Tafel B kennt weder Tapete noch Färbung (`js/struktur.js`).
Sie kommen dort also neu dazu. Offen ist, was „Muster als Tapete“ (heute: einfarbig, ohne Zelle und Elemente) bei
Motiven mit Farben heisst (Frage 8): Einfarbig verwischt die Sorten, und das Muster zeigte dann mehr Symmetrie als die
Struktur (vgl. Experiment `farbe`).

## 4. Was mitgeht

Jeder PR passt an, was er berührt: Links in Skript, Quiz, Experimenten, Erste Schritten und Hilfeseite, dazu Tests,
README und `CLAUDE.md` (Leitfaden Abschn. 8). Im Einzelnen:

- **Altlasten nach crystallography-common#126:** `ebenen-intro` „1“ als `eg`; Zustand und Link `warum` werden `herkunft`
  (die Datei `js/warum.js` kann nicht einfach so heissen, weil es `js/herkunft.js` schon gibt: zusammenführen oder anders
  benennen); „Präfixe nie ändern“ in `CLAUDE.md` nach Leitfaden Abschn. 7 und 8; README „bleiben stabil“, Vorgabe bei fehlendem `v`
  („ältere Links“), Spiegelfeld `m` in `basis=` („ältere Links ohne `m` gelten weiter“), Grenze für ältere Fassungen
  ohne `sg` (Liste im Review von crystallography-common#127).
- **Link und Speicher:** neuer Modus `m=entwurf` (nicht `muster`, weil „Muster“ im Code schon die Tafel B bezeichnet);
  `sg=` und die Vertreter in `basis=` nur noch dort; `brechen` entfällt; Zustandsversion steigt; alles in `zustandPruefen`
  und `tests/rundlauf.test.mjs`.
- **Erste Schritte und Experimente:** In „Gitter und Basis“ entfällt Schritt 3 „Symmetrie festhalten“ (Link mit `sg=p4`)
  samt dem Hinweis im letzten Schritt. „Muster entwerfen“ bekommt eigene Erste Schritte (3–4). Die Experimente
  `festhalten-lage` (braucht das Windrad 4, Frage 1) und `festhalten-metrik` ziehen in den neuen Modus. Tooltips (`TIPS`),
  Hilfeseite (`js/hilfe-daten.js`: Liste der Modi; Bilder neu erzeugen).
- **Skript:** Abbildungen und Kästen „In der App“ zu Zeichnen, Füllen (Abb. 6.5, Kasten in Kap. 6), Tapete und Ornamenten
  (Abb. 7.1b/c, 7.2a–c, 8.2f, 8.4f mit `m=eg&form=…&tap=1`; Kasten in Kap. 7), Symmetriebruch, „Symmetrie festhalten“
  (Kasten in Kap. 6) und Auslöschungen (Kasten in Kap. 6). Abb. 7.1 vergleicht Fähnchen und Ornament an derselben Stelle;
  das braucht einen Modus, der beides zeigt (Frage 3). Die Beschreibung der ITA-Seite (Kap. 6, „Reflection conditions“)
  bleibt, weil sie ITA erklärt, mit Hinweis auf die Beugung.
- **Quiz:** App-Links und Bildangaben prüfen (z. B. `B#m=eg&…form=blatt&tap=1…`); `js/quiz-bild.js`, Moodle-Export und
  Fragenliste, falls ein Bild den neuen Modus braucht. Keine neuen Fragen.
- **Tests und Werkzeuge:** `tests/zeichnen.test.mjs`, die Tests zu „Symmetrie brechen“ und zu den Auslöschungen,
  `tests/zustand.test.mjs`, `tools/festhalten-pruefen.mjs` (Browserlauf im CI-Job `pdf`), Offline-Liste in `sw.js`.
- **README:** Funktionen, Link-Tabelle (`m`, `tap`, `lupe`, `brechen`, `sg`, `basis`), Aufbau, Tests, Quellen
  (Auslöschungen).
- **`CLAUDE.md` der App:** „Erklärungen im Symmetriegerüst“ (`erklaerend`: Zeichnen, Radieren, Füllen, Lupe), „Herkunft
  der Elemente“, „Grösse des Objekts im Gitter“, „Symmetrie festhalten“, „Zahlen aus Link und Speicher“ (Brechen),
  Präfixe; Escher #86 und zweifarbige Muster #40 bekommen ihren Ort im neuen Modus.
- **Befunde:** #125, #126 (Toleranzen der Bestimmung) im Zuge des Umbaus.

## 5. Reihenfolge der Umsetzung (je ein PR)

1. Dieses Konzept und die Entscheidungen in `CLAUDE.md`.
2. Abbau: „Symmetrie brechen“ in „Ebenengruppen“, Auslöschungen, Altlasten nach crystallography-common#126.
3. „Darstellung“ in allen Modi.
4. Neuer Modus mit Gruppenwahl, Motiven (aus „Symmetrie festhalten“) und Gitter; „Symmetrie festhalten“ aus „Gitter und
   Basis“ entfernen; Übergang (Frage 5); Experimente und Erste Schritte dazu.
5. Zeichnen in den neuen Modus.
6. Hilfebilder, Vorschau, Durchsicht des Skripts.
7. Release (MINOR, Hinweis: alte Links gelten nicht mehr).

## 6. Offene Fragen an Thomas

1. **Motive:** Ist mit dem „offenen Kreis“ der Kreis mit Komma gemeint? Kommen Insel, Dreieck und Quadrat dazu, dazu
   Windräder (chiral, mit Dreh-, aber ohne Spiegelsymmetrie) und Sechseck? Sie zeigen, dass ein Motiv mit eigener
   Symmetrie auf einer speziellen Lage sitzen kann; das Experiment `festhalten-lage` braucht das Windrad 4.
2. **Zeichnen und Motive:** in einem Muster kombinierbar, oder ein Muster besteht entweder aus Motiven oder aus einer
   Zeichnung?
3. **Ornamente in „Ebenengruppen“:** entfernen oder als Form des Objekts behalten? Davon hängen Abb. 7.1, 7.2, 8.2f,
   8.4f und eine Quizfrage ab (Bild mit Ornament als Tapete).
4. **Lupe:** in „Ebenengruppen“ behalten (sie dient auch dem genauen Setzen des Objekts) und im neuen Modus dazu?
5. **Übergang** von „Gitter und Basis“ in „Muster entwerfen“ als Knopf (Abschn. 3.3), oder ganz ohne Übergang?
6. **Füllen der asymmetrischen Einheit:** in „Ebenengruppen“ behalten (Abb. 6.5 nutzt es), z. B. unter „Anzeigen“, oder nur
   im neuen Modus?
7. **Gitter im neuen Modus:** Bereich wie heute mit festgehaltener Symmetrie (0,5–2 und 60–150°) oder wie in
   „Ebenengruppen“ (0,6–1,6 und 95–125°)?
8. **Tapete mit farbigen Motiven:** einfarbig wie heute (dann zeigt das Muster mehr Symmetrie als die Struktur) oder mit
   den Farben der Motive, nur ohne Zelle und Elemente?
9. **Auslöschungen, Daten:** Die Bedingungen stehen geprüft in `js/ebenengruppen.js` (mit Test gegen ITA). Ganz
   entfernen, oder ohne Anzeige in den Daten lassen, bis die Beugungs-App bzw. symcrys (#99) sie übernimmt?
