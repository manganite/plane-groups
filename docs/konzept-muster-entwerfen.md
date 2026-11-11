# Konzept: dritter Modus „Muster entwerfen“ (Entwurf)

> **Status:** Entwurf zur Freigabe durch Thomas (11.11.2026). Planung und Fortschritt in #136, Reihenfolge im Fahrplan
> crystallography-common#74. Nach der Umsetzung bekommt dieses Dokument einen Statuskopf und wird nicht mehr nachgeführt.
> Bei Widerspruch gelten `CLAUDE.md` und der `LEITFADEN.md` von crystallography-common.

## 1. Anlass

Die App hat zwei Modi, und jeder trägt eine Zusatzfunktion, die zu seinem Zweck nur bedingt passt (Thomas, 9.11.2026):

- **„Ebenengruppen“** erklärt eine Gruppe: Symmetrieelemente, asymmetrische Einheit, Schritt für Schritt, Aufbau aus
  Erzeugenden, Herkunft der Elemente. Dazu kamen „Selbst zeichnen“ und das Muster als Tapete.
- **„Gitter und Basis“** zeigt, wie die Basis die Symmetrie bestimmt. Dazu kam „Symmetrie festhalten“ (#121): eine
  Struktur in gegebener Gruppe aufbauen.

Zeichnen, Tapete und Aufbau in gegebener Gruppe gehören zusammen: Bei gegebener Symmetrie entsteht ein eigenes Muster.
Sie ziehen deshalb in einen dritten Modus. Jeder Modus hat dann eine Frage:

| Modus | Frage | Tafel A | Tafel B |
|---|---|---|---|
| Ebenengruppen | Was gehört zu einer Gruppe, und woher kommt es? | Symmetriegerüst | Muster |
| Gitter und Basis | Welche Symmetrie hat diese Struktur? | Struktur mit Zellen | Muster |
| **Muster entwerfen** (neu) | Wie sieht ein Muster in dieser Gruppe aus? | Zelle mit Gerüst, hier wird gestaltet | Muster |

Alte Links und Speicherstände werden nicht umgerechnet (crystallography-common#126, Leitfaden Abschn. 8).

## 2. Entscheidungen (Thomas, 11.11.2026)

1. **Gestaltungsmittel als Auswahlmenü wie in „Gitter und Basis“:** zuoberst das Atom, dann die Ornamente (Blatt,
   Tropfen, Ranke), der Ziegel, das Fähnchen und der offene Kreis. Ob weitere Motive nötig sind, ist offen; in Frage
   kommen Insel, Dreieck und Quadrat (Frage 1 in Abschn. 6).
2. **„Darstellung“ in allen drei Modi, unverändert:** Nach Blickrichtung färben, Symmetrieelemente im Muster, Muster als
   Tapete, Vergrösserung des Musters. Die Punkte sind in allen Modi sinnvoll.
3. **„Symmetrie brechen“ entfällt** im Modus „Ebenengruppen“. Symmetriebruch ist das Thema von „Gitter und Basis“ und
   dort am konsequentesten umgesetzt. In „Ebenengruppen“ und „Muster entwerfen“ sind nur symmetrieerhaltende
   Änderungen des Gitters möglich (b/a und γ, soweit das Kristallsystem sie freigibt).
4. **„Gitter und Basis“ bleibt wie er ist**, nur „Darstellung“ kommt dazu (Punkt 2) und „Symmetrie festhalten“ geht in
   den neuen Modus.
5. **Name „Muster entwerfen“**, passend zur Tafel B „Muster“.
6. **Auslöschungen entfallen** in den Kenndaten von „Ebenengruppen“ (Spalte der Wyckoff-Tabelle und Abschnitt
   „Auslöschungen“): Sie gehören in die Beugungs-App (crystallography-common#73) und verwirren hier mehr, als sie helfen.

## 3. Die drei Modi im Einzelnen

### 3.1 „Ebenengruppen“ (verstehen)

Seitenleiste nachher:
- **Ebenengruppe:** Gruppenwahl; Anzeigen: Symmetrieelemente, Objekt in allgemeiner Lage, asymmetrische Einheit;
  Weitere Optionen: 2 × 2 Zellen, Form des Objekts (Fähnchen, Kreis mit Komma), Einrasten, Bilder rund um die Zelle.
- **Objekt:** Lage *x*, *y*, Grösse.
- **Schritt für Schritt**, **Aufbau aus Erzeugenden** (mit Herkunft der Elemente): unverändert.
- **Gitter:** b/a und γ im Kristallsystem; ohne „Symmetrie brechen“.
- **Darstellung** (gemeinsam, Abschn. 3.4).

Es entfallen: „Selbst zeichnen“ (Werkzeuge Zeichnen und Radieren, Abschnitt, Füllen der asymmetrischen Einheit), die
Ornamente als Objekt (Vorschlag, Frage 3), „Symmetrie brechen“, die Auslöschungen. Die Lupe bleibt nur, wenn sie ohne
Zeichnen noch gebraucht wird (Frage 4).

### 3.2 „Gitter und Basis“ (analysieren)

Unverändert: Vorgabe, Anzeigen, Basis (Motive wählen, setzen, drehen, spiegeln), Gitter mit Symmetriebruch,
Bestimmung der Gruppe in den Kenndaten. Neu: der Abschnitt „Darstellung“. Es entfällt der Abschnitt „Symmetrie
festhalten“; sein Inhalt geht in „Muster entwerfen“.

### 3.3 „Muster entwerfen“ (gestalten, neu)

- **Ebenengruppe:** Gruppenwahl wie in „Ebenengruppen“ (Knöpfe je Kristallsystem). Die Gruppe ist immer fest; ein
  Schalter „Symmetrie festhalten“ gibt es nicht mehr.
- **Motive:** Auswahlmenü (Abschn. 2, Punkt 1). Jedes gesetzte Motiv ist Vertreter seiner Bahn; die Bilder entstehen
  durch alle Operationen der Gruppe. Drehen, Spiegeln (chirale Motive), Grösse, Farbe, Entfernen, Einrasten auf spezielle
  Lagen: wie heute mit festgehaltener Symmetrie (`CLAUDE.md`, „Symmetrie festhalten“; die Rechnungen aus #121 bleiben).
  Liegt ein Motiv auf einer speziellen Lage, deren Lagesymmetrie es nicht hat, nennen die Kenndaten die tatsächliche
  Gruppe des Musters (wie heute).
- **Zeichnen:** „Selbst zeichnen“ aus „Ebenengruppen“ (Striche, die alle Operationen vervielfachen; Rückgängig, Alles
  löschen, Füllen der asymmetrischen Einheit) als weiteres Gestaltungsmittel (Frage 2: zusammen mit Motiven in einem
  Muster?).
- **Gitter:** b/a und γ im Kristallsystem der Gruppe (Abschn. 2, Punkt 3); zufällige Zusatzsymmetrie bleibt möglich
  (*p*2*mm* mit *b* = *a*), wie heute.
- **Darstellung** (gemeinsam).
- **Kenndaten:** gewählte Gruppe, tatsächliche Gruppe des Musters (wenn verschieden: warum), Zahl der Motive.
- **Übergang aus „Gitter und Basis“:** heute „Bestimmte Gruppe übernehmen“. Vorschlag: In „Gitter und Basis“ ein Knopf
  „In ‚Muster entwerfen‘ weiterbearbeiten“, der die Struktur mit der bestimmten Gruppe (umgerechnet in die Aufstellung
  nach ITA, wie heute) in den neuen Modus übernimmt (Frage 5).

### 3.4 Gemeinsam: „Darstellung“

Ein Abschnitt, in allen drei Modi gleich, an derselben Stelle (unten in der Seitenleiste, vor „Alle Einstellungen
zurücksetzen“). Inhalt wie heute in „Ebenengruppen“. Ob „Vergrösserung des Musters“ in „Gitter und Basis“ heute an
anderer Stelle steht und dorthin umzieht, klärt die Umsetzung (eine Stelle je Bedienelement, Leitfaden 5.2).

## 4. Was mitgeht

- **Altlasten nach #126:** `ebenen-intro` „1“ als `eg`; Name `warum` (Zustand, Link `warum=1`, `js/warum.js`) wird
  `herkunft`; Kommentare „Präfixe nie ändern“ in `CLAUDE.md` und README nach Leitfaden Abschn. 7 und 8; README
  „bleiben stabil“, „ältere Links ohne `m`“ u. a. (Liste im Review von crystallography-common#127).
- **Link und Speicher:** neuer Modus `m=entwurf` (nicht `muster`, weil „Muster“ im Code schon die Tafel B bezeichnet);
  `sg=` und die Vertreter in `basis=` nur noch dort; Zustandsversion steigt; alles in `zustandPruefen` und
  `tests/rundlauf.test.mjs`.
- **Hilfen:** Erste Schritte für den neuen Modus (3–4 Schritte); die Experimente `festhalten-lage` und
  `festhalten-metrik` ziehen in den neuen Modus; die Erste Schritte von „Ebenengruppen“ verlieren das Zeichnen;
  Tooltips (`TIPS`) und Hilfeseite (Bilder neu erzeugen).
- **Skript:** Kästen „In der App“ zu Zeichnen, Tapete, Symmetriebruch und Auslöschungen (u. a. Kap. 6, 7); Abbildungen
  mit `data-app`, deren Link sich ändert. Die Beschreibung der ITA-Seite (Abschn. 6, „Reflection conditions“) bleibt,
  weil sie ITA erklärt, mit Hinweis auf die Beugung.
- **Quiz:** App-Links prüfen (z. B. `tap=1`); keine neuen Fragen.
- **Befunde:** #125, #126 (Toleranzen der Bestimmung) im Zuge des Umbaus.

## 5. Reihenfolge der Umsetzung (je ein PR)

1. Dieses Konzept und die Entscheidungen in `CLAUDE.md`.
2. Abbau: „Symmetrie brechen“ in „Ebenengruppen“, Auslöschungen, Altlasten nach #126.
3. „Darstellung“ in allen Modi.
4. Neuer Modus mit Gruppenwahl, Motiven (aus „Symmetrie festhalten“) und Gitter; „Symmetrie festhalten“ aus „Gitter und
   Basis“ entfernen; Übergang (Frage 5).
5. Zeichnen in den neuen Modus.
6. Hilfen, Skript, Quiz-Links, Hilfebilder; Vorschau.
7. Release (MINOR, Hinweis: alte Links gelten nicht mehr).

## 6. Offene Fragen an Thomas

1. **Motive:** Ist mit dem „offenen Kreis“ der Kreis mit Komma gemeint (wie das Objekt in „Ebenengruppen“)? Kommen Insel,
   Dreieck und Quadrat dazu? Sie zeigen gut, dass ein Motiv mit eigener Symmetrie auf einer speziellen Lage sitzen kann;
   ohne sie bleibt dafür nur Atom und Ziegel.
2. **Zeichnen und Motive:** in einem Muster kombinierbar, oder ein Muster besteht entweder aus Motiven oder aus einer
   Zeichnung?
3. **Ornamente in „Ebenengruppen“:** entfernen (sie dienten vor allem der Tapete) oder als Form des Objekts behalten?
4. **Lupe** in „Ebenengruppen“: Sie diente dem Zeichnen und Setzen. Entfernen, wenn das Zeichnen wegfällt?
5. **Übergang** von „Gitter und Basis“ in „Muster entwerfen“ als Knopf (Abschn. 3.3), oder ganz ohne Übergang?
6. **Auslöschungen, Daten:** Die Bedingungen stehen geprüft in `js/ebenengruppen.js` (mit Test gegen ITA). Ganz
   entfernen, oder bis zur Beugungs-App bzw. zu symcrys (#99) in den Daten lassen, ohne Anzeige?
