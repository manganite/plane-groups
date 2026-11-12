# Konzept: dritter Modus „Muster entwerfen“

> **Status:** von Thomas freigegeben (11.11.2026), wird umgesetzt. Planung und Fortschritt in #136, Reihenfolge im Fahrplan
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

1. **Motive nach Eigensymmetrie gebündelt:** Die Liste wird mit Ornamenten, Fähnchen und Windrädern zu
   lang für ein flaches Menü. Deshalb je Gruppe eine Zeile mit kleinen Bildern der Motive (Knöpfe wie die Gruppenwahl je
   Kristallsystem), Tooltip mit Name und Eigensymmetrie:

   | Zeile | Motive |
   |---|---|
   | Atom | Kreis |
   | Ohne Eigensymmetrie | Fähnchen, Blatt, Tropfen, Ranke |
   | Nur Drehsymmetrie | Windrad 2, 3, 4, 6 |
   | Mit Spiegelsymmetrie | Dreieck (*m*), Ziegel und Insel (2*mm*), gleichseitiges Dreieck (3*m*), Quadrat (4*mm*), Sechseck (6*mm*) |

   Grund der Gliederung: Ein Motiv erscheint auf einer speziellen Lage nur dann einmal, wenn es deren Lagesymmetrie hat
   (in passender Ausrichtung), sonst überlagern sich seine Bilder (Punkt 14); die Zeilen zeigen, welches Motiv wohin
   passt. Dieselbe Auswahl ersetzt das Menü in „Gitter und Basis“, damit beide Modi gleich aussehen; damit ist
   #104 erledigt. Zugänglichkeit (Leitfaden Abschn. 5.4): jeder Knopf mit `aria-label` (Name und Eigensymmetrie), jede
   Zeile beschriftet wie die Gruppenwahl (`aria-labelledby`), Touch-Ziele mindestens 40 px; auf Touch-Geräten nennt das ⓘ
   die Eigensymmetrie.
2. **„Darstellung“ in allen drei Modi:** Nach Blickrichtung färben, Symmetrieelemente im Muster, Muster als Tapete,
   Vergrösserung des Musters. Heute gibt es den Abschnitt nur in „Ebenengruppen“; in „Gitter und Basis“ steht die
   Vergrösserung unter „Anzeigen“ (`s-zoom`, dasselbe Feld `zoomB` wie `v-zoom`) und zieht in „Darstellung“ um.
3. **„Symmetrie brechen“ entfällt** in „Ebenengruppen“. Symmetriebruch ist das Thema von „Gitter und Basis“ und dort am
   konsequentesten umgesetzt (das Gitter ist dort frei). In „Ebenengruppen“ und „Muster entwerfen“ sind nur
   symmetrieerhaltende Änderungen des Gitters möglich (b/a und γ, soweit das Kristallsystem sie freigibt).
4. **„Gitter und Basis“ bleibt wie er ist**, nur „Darstellung“, die Lupe und die gebündelte Motivauswahl kommen dazu,
   und „Symmetrie festhalten“ geht in den neuen Modus.
5. **Name „Muster entwerfen“**, passend zur Tafel B „Muster“.
6. **Auslöschungen entfallen** in den Kenndaten von „Ebenengruppen“ (Spalte der Wyckoff-Tabelle und Abschnitt
   „Auslöschungen“): Sie gehören in die Beugungs-App (crystallography-common#73) und verwirren hier mehr, als sie helfen.
   Dauerhaft: auch die Daten in `js/ebenengruppen.js` entfallen, dazu `verletzt` und `strukturfaktor` in
   `js/symmetrie.js`, `bedingungHTML` in `js/text.js` und ihre Tests (`tests/ebenengruppen.test.mjs`,
   `tests/text.test.mjs`).
7. **Zeichnen und Motive** lassen sich in einem Muster kombinieren.
8. **Ornamente** (Blatt, Tropfen, Ranke) verlassen „Ebenengruppen“ und werden Motive in „Muster entwerfen“. Als Form des
   Objekts bleiben in „Ebenengruppen“ Fähnchen und Kreis mit Komma.
9. **Lupe in allen drei Modi**, als Schalter in der Werkzeugleiste von Tafel A wie heute in „Ebenengruppen“ (Leitfaden
   Abschn. 5.2: ein Schalter, kein Werkzeug): Sie hilft auch, Motive in einer Zelle mit vielen Elementen genau zu setzen.
   Mitte: in „Ebenengruppen“ wie heute das Objekt, sonst das gewählte Motiv, ohne Wahl die Mitte der Zelle; während des
   Ziehens oder Zeichnens bleibt der Ausschnitt stehen (wie heute).
10. **Übergang** aus „Gitter und Basis“ als Knopf (Abschn. 3.3).
11. **Füllen der asymmetrischen Einheit** zieht in „Darstellung“ und wirkt damit überall, wo es eine Gruppe gibt.
12. **Ein Gitterbereich für alle Modi:** *b*/*a* 0,5–2, γ 60–150° (heute in „Gitter und Basis“ und beim Brechen). Der engere Bereich
    in „Ebenengruppen“ (0,6–1,6 und 95–125°, „so dass keine höhere Symmetrie entsteht“) hielt das nicht ein: *b*/*a* = 1
    ist einstellbar und gibt einem schiefwinkligen Gitter die Metrik eines zentriert-rechteckigen, einem rechteckigen die
    eines quadratischen, mit γ = 120° die eines hexagonalen. In „Ebenengruppen“ ist die Gruppe gewählt, nicht bestimmt;
    sie bleibt dieselbe, nur die Metrik ist zufällig höher. Auch abseits von *b*/*a* = 1 lag höhere Metrik im alten
    Bereich (z. B. *b*/*a* = 1,6, γ ≈ 108,2°: *a* ⊥ *a* + 2*b*). In „Gitter und Basis“ zeigt das das Experiment
    `festhalten-metrik`. Mit dem grösseren Bereich ist die schiefwinklige Zelle nicht immer reduziert (z. B. *b*/*a* = 2,
    γ = 150°); auch das ist gewollt.
13. **Tapete:** ohne Zelle, Symmetrieelemente, Gitter und asymmetrische Einheit, Motive in ihren gewählten Farben, ohne
    eigene Farbe für Spiegelbilder.
14. **Gruppe und Zelle bleiben fest, wie in VESTA** (Thomas, 11.11.2026): Man wählt die Gruppe und setzt Motive und
    Striche; jedes erscheint mit allen Operationen der Gruppe. Die Gruppe ändert sich nur, wenn man eine andere wählt, die
    Zelle nur im Rahmen des Kristallsystems. Bilder, die zusammenfallen (gleiches Motiv, Lage, Orientierung, verglichen
    wie heute mit `gleichesMotiv` in `js/bahnen.js`, also mit der Toleranz der Bestimmung), zeichnet die App einmal: Ein
    Atom oder ein Windrad 4 auf einem 4-zähligen Drehpunkt bleibt ein Motiv. Hat ein Motiv die Lagesymmetrie in seiner
    Ausrichtung nicht, überlagern sich seine Bilder (ein Fähnchen auf dem Drehpunkt: vier Fähnchen; ein um 10° gedrehtes
    Quadrat auf einer Lage 4*mm*: zwei Quadrate), und das Muster behält die gewählte Symmetrie. Striche erscheinen mit
    allen Operationen; sie bekommen dieselbe Farbwahl wie die Motive (Thomas, 12.11.2026), und ihre Spiegelbilder keine
    eigene Farbe.
15. **Kreis mit Komma kein Motiv** (Thomas, 12.11.2026): Er ist das Zeichen der ITA für ein Objekt ohne Eigensymmetrie;
    der Kreis dreht sich nicht mit, das Komma zeigt nur, ob ein Bild ein Spiegelbild ist (`objektSVG` in
    `js/zeichnung.js`). Als Motiv lägen auf einem 4-zähligen Drehpunkt vier gleich aussehende Kreise übereinander, auf
    einer Spiegellinie ein Kreis mit und einer ohne Komma. Er bleibt Form des Objekts in „Ebenengruppen“, wo die ITA ihn
    verwendet. Es gibt im Modus keine Bestimmung der Symmetrie; was ein Muster tatsächlich für eine
    Symmetrie hat, ist Thema von „Gitter und Basis“. Grund: So erwartet man es vom Bau einer Struktur in gegebener Gruppe
    (VESTA: Die Raumgruppe wählt man selbst; sie ändert sich nur durch eigene Wahl oder „Remove symmetry“, VESTA-Handbuch,
    Kap. 6). Im bisherigen „Symmetrie festhalten“ blieb auf einer speziellen Lage nur ein Bild stehen, und die Kenndaten
    nannten dann eine andere Gruppe und Zelle; das entfällt. Für Atome ist die Regel ohne Folgen: Ein Atom hat immer die
    volle Lagesymmetrie und erscheint deshalb immer einmal; überlagerte Bilder gibt es nur bei Motiven mit geringerer
    Eigensymmetrie, etwa in einem Ornament.

## 3. Die drei Modi im Einzelnen

### 3.1 „Ebenengruppen“ (verstehen)

Seitenleiste nachher:
- **Ebenengruppe:** Gruppenwahl; Anzeigen: Symmetrieelemente, Objekt in allgemeiner Lage, asymmetrische Einheit;
  Weitere Optionen: 2 × 2 Zellen, Form des Objekts, Einrasten, Bilder rund um die Zelle.
- **Objekt:** Lage *x*, *y*, Grösse.
- **Schritt für Schritt**, **Aufbau aus Erzeugenden** (mit Herkunft der Elemente): unverändert.
- **Gitter:** b/a und γ im Kristallsystem; ohne „Symmetrie brechen“.
- **Darstellung** (gemeinsam, Abschn. 3.4).
- Werkzeuge über Tafel A: Lupe.

Es entfallen „Selbst zeichnen“ (Zeichnen, Radieren, Rückgängig, Alles löschen), „Symmetrie brechen“, die Auslöschungen
und die Ornamente als Form des Objekts. Das Füllen der asymmetrischen Einheit zieht in „Darstellung“.

### 3.2 „Gitter und Basis“ (analysieren)

Unverändert: Vorgabe, Anzeigen, Basis (Motive wählen, setzen, drehen, spiegeln), freies Gitter (0,5–2 und 60–150°),
Werkzeuge „Wählen und ziehen“ und „Hinzufügen“, Bestimmung der Gruppe in den Kenndaten. Neu: „Darstellung“, die Lupe und
die gebündelte Motivauswahl (Abschn. 2, Punkt 1). Es entfällt „Symmetrie festhalten“; sein Inhalt geht in „Muster
entwerfen“.

### 3.3 „Muster entwerfen“ (gestalten, neu)

- **Ebenengruppe:** Gruppenwahl wie in „Ebenengruppen“ (Knöpfe je Kristallsystem). Die Gruppe ist immer fest; einen
  Schalter „Symmetrie festhalten“ gibt es nicht mehr.
- **Motive:** gebündelte Auswahl (Abschn. 2, Punkt 1). Jedes gesetzte Motiv ist Vertreter seiner Bahn; die Bilder entstehen
  durch alle Operationen der Gruppe. Drehen, Spiegeln (chirale Motive), Grösse, Farbe, Entfernen, Einrasten auf spezielle
  Lagen: wie heute mit festgehaltener Symmetrie (`CLAUDE.md`, „Symmetrie festhalten“; Vertreter und Bahnen, Orientierung
  der Bilder und Einrasten aus #121 bleiben). Zusammenfallende Bilder nach Abschn. 2, Punkt 14 statt „nur das Bild der
  Identität“: `motivBahn` und `bilderMitOperation` (`js/bahnen.js`) verwerfen heute jedes Bild, dessen Ort belegt ist; sie
  behalten künftig alle Bilder, die sich in Orientierung unterscheiden, und `passtNichtZurLage` liefert den Hinweis
  „überlagert“ für die Kenndaten. Die Ornamente werden Motive mit Punkten, die ihre Orientierung festlegen (#104); diese
  Punkte braucht auch der Vergleich zusammenfallender Bilder, nicht nur die Bestimmung in „Gitter und Basis“.
- **Auswahl bei überlagerten Bildern** (Wahl beim Umsetzen): Liegen an einer Stelle mehrere Bilder, wählt ein Tippen
  den Vertreter, wenn er darunter ist, sonst das Bild mit der ersten Operation in der Reihenfolge der ITA; Winkel und
  „gespiegelt“ zeigen dieses Bild, und Ziehen bewegt es (über die Umkehroperation den Vertreter), wie heute.
- **Wahl einer anderen Gruppe:** Die Vertreter bleiben mit Bruchkoordinaten, Motiv, Winkel und Farbe erhalten, ihre
  Bilder entstehen unter der neuen Gruppe neu (wie in VESTA die Liste der Atome). Die Gruppe ist ein eigenes Feld des
  Entwurfs, nicht das Feld `gruppe` von „Ebenengruppen“; sonst änderte das Blättern dort den Entwurf. Passt das Gitter
  nicht zum System der neuen Gruppe, gilt dessen Startgitter.
- **Grenze:** `BASIS_GRENZE` und die Zählung je Vertreter mit der Zähligkeit der allgemeinen Lage bleiben. Der Grund ist
  jetzt das Zeichnen und der Vergleich zusammenfallender Bilder bei jedem Bild des Ziehens, nicht mehr die Bestimmung.
- **Zeichnen:** „Selbst zeichnen“ aus „Ebenengruppen“ (Striche, die alle Operationen vervielfachen; Rückgängig, Alles
  löschen) als weiteres Gestaltungsmittel, mit Motiven kombinierbar. Jeder Strich hat eine Farbe aus derselben Farbwahl
  wie die Motive (Abschn. 2, Punkt 14); die Farbe gehört damit in Link und Speicher der Zeichnung.
- **Werkzeuge über Tafel A:** „Wählen und ziehen“, „Hinzufügen“, Zeichnen, Radieren; sie schliessen sich aus (Leitfaden
  Abschn. 5.2). Dazu die Lupe als Schalter.
- **Gitter:** b/a und γ im Kristallsystem der Gruppe (Abschn. 2, Punkte 3 und 12).
- **Darstellung** (gemeinsam).
- **Kenndaten wie eine Atomliste:** gewählte Gruppe; je Motiv seine Lage (Wyckoff-Lage, Zähligkeit, Lagesymmetrie).
  Überlagern sich Bilder, weil dem Motiv die Lagesymmetrie in seiner Ausrichtung fehlt, nennen die Kenndaten auch, wie
  viele verschiedene Bilder an jeder Stelle liegen (in einem Kristall wäre das Fehlordnung, jede Ausrichtung zu einem
  entsprechenden Bruchteil besetzt).
- **Übergang aus „Gitter und Basis“:** heute „Bestimmte Gruppe übernehmen“. Neu in „Gitter und Basis“ ein Knopf
  „In ‚Muster entwerfen‘ weiterbearbeiten“, der die Struktur mit der bestimmten Gruppe (umgerechnet in die Aufstellung
  nach ITA, wie heute) einmal in den neuen Modus übernimmt; ab dann bleiben Gruppe und Zelle fest. Er ersetzt den
  bisherigen Entwurf; ist der Entwurf nicht leer, sagt das ein Hinweis unter dem Knopf (sichtbar auch auf Touch-Geräten,
  wo es keinen Tooltip gibt). Einen Weg zurück gibt es bewusst nicht: Striche liessen sich in „Gitter und Basis“ nicht
  darstellen; nachrüsten liesse er sich später.

### 3.4 Gemeinsam: „Darstellung“

Ein Abschnitt, in allen drei Modi an derselben Stelle (unten in der Seitenleiste, vor „Alle Einstellungen
zurücksetzen“). Heute wirken die Punkte nur in „Ebenengruppen“: In „Gitter und Basis“ zeichnet Tafel A ohne Färbung nach
Blickrichtung (`farben: false` in `js/struktur-ui.js`), und Tafel B kennt weder Tapete noch Färbung (`js/struktur.js`).
Sie kommen dort also neu dazu, ebenso das Füllen der asymmetrischen Einheit (bisher im Abschnitt „Selbst zeichnen“ in
„Ebenengruppen“).
„Muster als Tapete“ nach Abschn. 2, Punkt 13: Einfarbig würde die Sorten verwischen, und das Muster zeigte dann mehr
Symmetrie als die Struktur (vgl. Experiment `farbe`).

In „Gitter und Basis“ wirkt das Füllen auf die asymmetrische Einheit der bestimmten Gruppe. Ihren Umriss zeichnet Tafel A
dort schon heute in deren konventioneller Zelle (`s-ae`); ihre gefüllten Bilder über die ganze Fläche kommen neu dazu.
Ohne bestimmte Gruppe (leere Basis) ist „Füllen“ gesperrt, mit Grund (Leitfaden Abschn. 5.2).

## 4. Was mitgeht

Jeder PR passt an, was er berührt: Links in Skript, Quiz, Experimenten, Erste Schritten und Hilfeseite, dazu Tests,
README und `CLAUDE.md` (Leitfaden Abschn. 8). Im Einzelnen:

- **Altlasten nach crystallography-common#126:** `ebenen-intro` „1“ als `eg`; Zustand und Link `warum` werden `herkunft`
  (die Datei `js/warum.js` kann nicht einfach so heissen, weil es `js/herkunft.js` schon gibt: zusammenführen oder anders
  benennen); „Präfixe nie ändern“ in `CLAUDE.md` nach Leitfaden Abschn. 7 und 8; README „bleiben stabil“, Vorgabe bei fehlendem `v`
  („ältere Links“), Spiegelfeld `m` in `basis=` („ältere Links ohne `m` gelten weiter“), Grenze für ältere Fassungen
  ohne `sg` (Liste im Review von crystallography-common#127).
- **Link und Speicher:** neuer Modus `m=entwurf` (nicht `muster`, weil „Muster“ im Code schon die Tafel B bezeichnet);
  die Gruppe dort mit `g=` wie in „Ebenengruppen“ (statt `sg=`), die Vertreter in `basis=` nur noch dort; `FORMEN` in
  `js/zustand.js` und `js/zeichnung.js` ohne Ornamente; `brechen` entfällt; Zustandsversion steigt; alles in `zustandPruefen`
  und `tests/rundlauf.test.mjs`.
- **Erste Schritte und Experimente:** In „Gitter und Basis“ entfällt Schritt 3 „Symmetrie festhalten“ (Link mit `sg=p4`)
  samt dem Hinweis im letzten Schritt. „Muster entwerfen“ bekommt eigene Erste Schritte (3–4). Das Experiment
  `festhalten-lage` (braucht das Windrad 4) zieht in den neuen Modus und wird neu geschrieben: Seine Fragen lauten heute
  „Welche Ebenengruppe bestimmt die App?“, künftig etwa „Wie viele Fähnchen liegen auf dem Drehpunkt?“ (vier überlagert,
  das Windrad 4 einmal). `festhalten-metrik` (*p*2*mm* mit *b* = *a* ergibt *p*4*mm*) braucht die Bestimmung; ohne
  festgehaltene Gruppe deckt es weitgehend das Experiment `metrik` (Läuferverband) ab. Vorschlag in PR 4: streichen oder
  mit `metrik` zusammenlegen (die Vorgabe `v=quadratisch&ba=1.35` gibt es schon). Neu liegt nahe: dasselbe Motiv auf
  allgemeiner und auf spezieller Lage. Neue und geänderte Texte gibt Thomas frei. Tooltips (`TIPS`),
  Hilfeseite (`js/hilfe-daten.js`: Liste der Modi; Bilder neu erzeugen).
- **Skript:** Abbildungen und Kästen „In der App“ zu Zeichnen, Füllen (Abb. 6.5, Kasten in Kap. 6), Tapete und Ornamenten
  (die elf Abbildungen mit `m=eg&form=blatt|tropfen|ranke`, u. a. Abb. 7.1b/c, 7.2a–c, 8.2f, 8.4f und die drei zu Conway
  in Kap. 9; Kasten in Kap. 7), „Symmetrie festhalten“ (Kasten in Kap. 6) und Auslöschungen (Kasten in
  Kap. 6; der Kasten zur Spalte „Auslöschungen“ ändert sich schon mit dem Abbau). Die Abbildungen mit Ornament wechseln im
  PR, der den Modus einführt; erst dort verlassen die Ornamente „Ebenengruppen“:
  - Kap. 8, Beispiel f (Abb. 8.2f, 8.3f, 8.4f): auf eine Vorgabe mit Ranken (*p*6) in „Gitter und Basis“, wie in #104
    geplant. Dann laufen alle sechs Beispiele über denselben Modus, und die Abbildung verrät die Gruppe nicht, die das
    Kapitel bestimmen lässt.
  - Kap. 7 (Abb. 7.1b/c, 7.2a–c) und Kap. 9 (Abb. 9.1, drei Varianten): auf `m=entwurf`. Abb. 7.1a bleibt in
    „Ebenengruppen“ (Spiegelbilder orange); die Unterschrift von Abb. 7.1 („alles in einer Farbe“) wird nachgeführt.
  - Der Code des Skripts hängt am Renderer von „Ebenengruppen“: `conwaySkizze` in `js/skript.js` (rechnet mit der Lage
    des Objekts), `tapeteElemente` und `nurZelle` von `tafelB` (Abb. 8.3f, 8.4f). Er wird für die neuen Ziele umgebaut. Die Beschreibung der ITA-Seite (Kap. 6, „Reflection conditions“)
  bleibt, weil sie ITA erklärt, mit Hinweis auf die Beugung.
- **Quiz:** App-Links und Bildangaben prüfen. Die Frage mit `B#m=eg&…form=blatt&tap=1…` wechselt auf den neuen Modus;
  dafür braucht `js/quiz-bild.js` ein Bild der Tafel B des neuen Modus, ebenso Moodle-Export und Fragenliste. Keine neuen
  Fragen.
- **Tests und Werkzeuge:** `tests/zeichnen.test.mjs`, die Tests zu „Symmetrie brechen“ und zu den Auslöschungen,
  `tests/zustand.test.mjs`, `tools/festhalten-pruefen.mjs` (Browserlauf im CI-Job `pdf`), Offline-Liste in `sw.js`.
- **README:** Funktionen, Link-Tabelle (`m`, `form`, `tap`, `lupe`, `fuell`, `brechen`, `sg`, `basis`, Bereiche von `ba`
  und `gamma`), Aufbau, Tests, Quellen (Auslöschungen), „Eigene Festlegungen“ unter Konventionen (Bereiche der
  Gitterregler, Farbe der Spiegelbilder).
- **`CLAUDE.md` der App:** „Erklärungen im Symmetriegerüst“ (`erklaerend`: Zeichnen, Radieren, Füllen, Lupe), „Herkunft
  der Elemente“, „Grösse des Objekts im Gitter“, „Symmetrie festhalten“, „Zahlen aus Link und Speicher“ (Brechen),
  Präfixe, „Daten getrennt vom Code“ (Ort der Ornamente, #104) und Fallstricke (Ornamente); Escher #86 und zweifarbige
  Muster #40 bekommen ihren Ort im neuen Modus. Dazu der Kommentar zur Zahl der Experimente je Modus in
  `js/hilfetexte.js`.
- **Befunde:** #125, #126 (Toleranzen der Bestimmung) im Zuge des Umbaus.

## 5. Reihenfolge der Umsetzung (je ein PR)

1. Dieses Konzept und die Entscheidungen in `CLAUDE.md`.
2. Abbau: „Symmetrie brechen“ in „Ebenengruppen“, Auslöschungen samt Daten und Kasten in Kap. 6, Altlasten nach
   crystallography-common#126; ein Gitterbereich für alle Modi.
3. „Darstellung“ in allen Modi, mit Füllen; Lupe in allen Modi.
4. (**4a**, **4b** und **4c umgesetzt am 12.11.2026**; Wahl beim Umsetzen in `CLAUDE.md`, Punkt „Modus „Muster entwerfen““. In drei PRs, Thomas, 12.11.2026: **4a** Ornamente als Motive und gebündelte Motivauswahl; **4b** neuer Modus, Regel für
   zusammenfallende Bilder, Kenndaten, Übergang, „Symmetrie festhalten“ entfernen; **4c** Ornamente aus „Ebenengruppen“,
   Skript, Quiz, Experimente, Erste Schritte.) Neuer Modus mit Gruppenwahl, gebündelter Motivauswahl (auch in „Gitter und Basis“, schliesst #104), Ornamenten als
   Motiven, Regel für zusammenfallende Bilder (Abschn. 2, Punkt 14), Gitter; „Symmetrie festhalten“ aus „Gitter und Basis“ entfernen; Übergang; Ornamente aus „Ebenengruppen“ samt
   Skript (Vorgabe mit Ranken für Kap. 8, Umbau von `js/skript.js`) und Quiz; Experimente und Erste Schritte dazu.
5. Zeichnen in den neuen Modus (**umgesetzt am 12.11.2026**; Wahl beim Umsetzen in `CLAUDE.md`, Punkt „Modus „Muster entwerfen““).
6. Hilfebilder, Vorschau, Durchsicht des Skripts.
7. Release (MINOR, Hinweis: alte Links gelten nicht mehr).
