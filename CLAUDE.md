# CLAUDE.md – Symmetrie in der Ebene (plane-groups)

**Gemeinsame Regeln:** @../crystallography-common/CLAUDE.md (Arbeitsweise, Git, Releases,
gemeinsamer Code, Literaturregeln; bindet seinerseits `LEITFADEN.md` ein). Claude Code lädt beide mit
dieser Datei. Fehlt der Ordner, klonen: `https://github.com/manganite/crystallography-common`.
Aufbau, Link-Adressen und Werkzeuge der App: `README.md`. Hier steht nur, was zusätzlich
für diese App gilt.

**Zweck:** Gitter, Elementarzelle und die 17 Ebenengruppen. Live: https://manganite.github.io/plane-groups/

## Qualitätsablauf Quiz

- **Prüfung und Rückmeldungen** in der gemeinsamen Fragenliste (`CLAUDE.md` von common, Abschnitt
  „Quiz“); diese App liefert ihre Fragen über `tools/quiz-quelle.mjs`.
- **Vorschau der App** (nicht öffentlich): Artifact https://claude.ai/artifact/KTA1WqaG68wj964pRJXP2i;
  Ablauf in der `CLAUDE.md` von common, Abschnitt „Vorschau einer App“.

### Regeln für Fragen
- Richtige Antwort nicht an Länge oder Ausführlichkeit erkennbar (Test).
- Fragen lehren allgemeine Konventionen, nicht „was die App tut“.
- Bildfragen mit neutralem Bildtext (keine eigene Screenreader-Variante).
- **IDs:** Kapitelkürzel – Stufe – Nummer (`gl-2-03`), Kürzel gb, gs, gm, gl, eg, pl, tk, bs (Kap. 8), sc (Kap. 9). Lücken
  erlaubt, damit IDs stabil bleiben; wechselt eine Frage die Stufe, bekommt sie die nächste freie Nummer
  der neuen Stufe. Umbenennen heisst auch `befunde` migrieren.
- Tests in `tests/quiz.test.mjs`: Lernziel wörtlich in Lernzielen oder Zusammenfassung des Kapitels;
  Stufe 3 genau dann, wenn das Lernziel unter „Zur Vertiefung“ steht; Skript-Anker im selben Kapitel;
  Stufe 1 und 2 verweisen nie auf eine Vertiefung; jedes Kapitel hat mindestens 4 Fragen der Stufe 1.
- Fragen nach Büchern: Antworten im Test mit dem Code der App nachrechnen (`tests/quiz-buecher.test.mjs`).

## Entscheidungen (mit Grund)

- **Schreibweise der Operationen in Punktgruppen** wie in Thomas' Vorlesung, als Systematik für alle
  10 ebenen Punktgruppen (`js/punktoperationen.js`, Skript 4.4):
  - Drehungen 1, 2, +*n*, −*n*.
  - Spiegelungen: Index = Normale der Linie. 2*mm*: *m*_a, *m*_b; 4*mm* zusätzlich *m*_{a+b}, *m*_{a−b}.
  - 6*mm*: je Achse *a*ᵢ (a₁ = a, a₂ = b, a₃ = −(a+b)) zwei Linien; ⊥ bzw. ∥ am *m* sagt, ob die Linie
    senkrecht oder parallel zu *a*ᵢ liegt. *p*3*m*1 hat die *m*^⊥, *p*31*m* die *m*^∥ (ein Vorschlag
    nur mit ⊥ wirkte im Bild widersprüchlich).
  - Ausnahme 3*m*: *m*₁–*m*₃ wie in der Vorlesung.
- **Kein LaTeX** in App, Skript und Quiz; Formeln in HTML (kursiv, Unicode, `<sub>`/`<sup>`, `.ov`).
  Formelsatz (KaTeX o. ä.) war nur für die Beugung offen; die Frage geht an crystallography-common#73.
- **Kap. 7:** „Fliesen und die Alhambra“, „Escher“, „Farbe“ sind Vertiefung (über die
  Vorlesung hinaus); Fragen dazu Stufe 3, Generator `parkett` ebenfalls.
- **Skript Kap. 8 „Ebenengruppen bestimmen“** (Gliederung Thomas, 6.11.2026; #38): Flussdiagramm nach dem
  Algorithmus von Brian Sanderson (Quelle: Fassung von D. Bar-Natan, Univ. Toronto; der Link bei Hoffmann auf Warwick führt
  laut Thomas ins Leere), eigene Zeichnung aus `js/bestimmen.js` (Daten; gezeichnet von `flussdiagramm` in
  `skizzen.js`), Test gegen die Elemente aller 17 Gruppen (`tests/bestimmen.test.mjs`). Rückmeldung Thomas:
  eigenständig formulieren, nicht als Zusammenfassung von Hoffmann (Hoffmann nur noch in den Quellen); keine
  Tabelle neben dem Diagramm (Doppelung); Beispiele in drei Schritten: Muster ohne Zelle und Elemente (Abb. 8.2),
  gefundene Elemente ohne Zelle (Abb. 8.3, `strukturTafelB` mit `zelle: false, elemente: true`, nur im Skript),
  Zelle (Abb. 8.4); der Fehler „Farbe übersehen“ an einem der Beispiele (h-BN → *p*6*mm*). Sechstes Beispiel (Thomas): reine Drehgruppe *p*6 als
  Ornament (Ranken, Vorgabe `ranken` in „Gitter und Basis“, damit alle sechs Beispiele über denselben Modus laufen wie a–e
  und die Abbildung die Gruppe nicht verrät). Leitfrage 3 schlicht
  „Gibt es eine Gleitspiegellinie?“ (Thomas, 6.11.2026): eine Ja/Nein-Frage wie die übrigen; Sandersons Wort
  „indecomposable“ wird nicht erklärt, was eine Gleitspiegellinie ist, steht in Abschn. 4.1. Wo das Diagramm fragt,
  haben die Nein-Gruppen gar keine Gleitspiegellinien (Test). Vorgabe „Dreiergruppen“ (*p*31*m*), Name ohne Gruppe. Dieselben Daten nutzen
  der Quiz-Generator `leitfragen` und später die geführte Bestimmung (#38, Teil App).
- **Quiz zu Kap. 8** (#102): Fragen bs-…; Kap. 8 hat keine Vertiefung, deshalb Links nur zu Stufe 1 und 2. Kein
  eigener Generator „Muster → Gruppe“: Das üben schon `muster` (Kap. 5), `struktur` (Kap. 3) und `verband` (Kap. 7).
  Neu ist `leitfragen` (Stufe 2): die Antworten auf die Leitfragen → Gruppe, weil genau das Kap. 8 lehrt; die
  Antworten jeder Gruppe kommen wie im Test des Diagramms aus ihren Symmetrieelementen (`leitAntworten` in
  `js/quiz-gen.js`), `tests/bestimmen.test.mjs` liest die Beschreibung unabhängig. Die Fragen nennen das Diagramm mit
  seinem Namen „Flussdiagramm zur Bestimmung der Ebenengruppe (Skript, Kap. 8)“ (Satzbau frei) und die Leitfragen im
  Wortlaut von `LEITFRAGEN` in `js/bestimmen.js` (Test), nie nur als Nummer oder Zweig; kein Link auf das Diagramm vor dem Antworten (Thomas, 8.11.2026): Die Lernziele verlangen, die
  Leitfragen zu kennen, und „Im Skript nachlesen“ führt nach dem Antworten hin.
- **Conway in eigenem Kapitel** (Thomas, 6.11.2026): Alles zur Signatur nach Conway steht in Kap. 9, einem
  Vertiefungskapitel am Ende des Skripts (Teil „Vertiefung“, `data-level` am Kapitel, Anker `#conway`). Grund: Es ist ein
  eigener Zugang zu den 17 Gruppen und zur Bestimmung, neben dem Flussdiagramm in Kap. 8. Die Fragen dazu heissen
  sc-3-01 … 04. Ein Vertiefungskapitel hat nur Fragen der Stufe 3; die Tests lassen
  es bei den Mindestzahlen der Stufen 1 und 2 aus.
  Abb. 9.1 (Thomas: „2 oder 3 Muster, die die 4 Elemente zeigen, wie Conway S. 17–26, mit eigenen
  Ornamenten“): Skizze `conway` mit `data-variante` 4*2, *x, o. Markierungen in einer Farbe (accent2),
  Motive einfarbig blau (tap=1), Elemente in Tinte (farb=0). Lagen aus `symmetrie.js`, nicht von Hand.
- **Alhambra:** Archimedische Parkettierungen und Alhambra nur über den Begriff Parkettierung verbinden.
  Dass Alhambra-Mosaiken auf archimedischen Parkettierungen beruhen, ist nicht belegt; nicht behaupten.
- **Farbsymmetrie:** 17 gewöhnliche + 46 Schwarz-Weiss + 17 graue = 80 Gruppen. Paramagnet: graue
  Gruppe. Schwarz-Weiss-Gruppe mit farbwechselnder Translation nur bei Antiferromagneten, nie bei
  Ferromagneten. Vergleich Farbe ↔ Moment in der Ebene nur qualitativ (eine Spiegellinie kehrt ein
  Moment ⊥ Ebene um).
- **Modi und Umfang** (Thomas, 5., 9. und 11.11.2026; #136, Konzept `docs/konzept-muster-entwerfen.md`): drei Modi mit je
  einer Frage: verstehen („Ebenengruppen“), analysieren („Gitter und Basis“), gestalten („Muster entwerfen“). Zeichnen und das
  Bauen in gegebener Gruppe gehören zusammen und passten nur bedingt zu den beiden anderen Modi. Kein eigener Trainingsmodus
  für den Aufgabentyp aus Konzept 1a; „Gitter und Basis“ muss dessen Schritte zeigen.
  - **Beugung** nicht in dieser App, sondern in einer eigenen (crystallography-common#73), weil diese App ein abgerundetes
    Paket mit schon vielen Funktionen ist. Deshalb auch keine Auslöschungen in den Kenndaten (sie verwirrten hier mehr, als
    sie halfen); die „Reflection conditions“ der ITA nennt das Skript nur als Beschreibung der Seite, mit Hinweis auf die Beugung.
  - **Bestimmen** (zentrales Lernziel der Vorlesung): kein eigener Modus, sondern Skript und geführte Bestimmung (#38). Die
    Signatur nach Conway bestimmen nur im Skript (#85); in den Kenndaten bleibt sie.
  - **Symmetriebruch** nur in „Gitter und Basis“, wo das Gitter frei ist und es um Symmetriebruch geht; die anderen Modi
    ändern das Gitter nur innerhalb des Kristallsystems.
  - **Ein Gitterbereich für alle Modi** (*b*/*a* 0,5–2, γ 60–150°, `GITTER_BEREICH` in `js/zustand.js`). Er schliesst höhere
    Metrik nicht aus; ein engerer tat es auch nicht. In „Ebenengruppen“ bleibt die Gruppe die gewählte, auch wenn die Metrik
    zufällig höher ist (z. B. *b* = *a* im rechteckigen System); der Hinweis im Abschnitt „Gitter“ sagt es.
  - **„Darstellung“ gleich in allen Modi:** eine Karte unten in der Seitenleiste, dieselben Schalter, Felder und Schlüssel im
    Link (`GEMEINSAME_SCHALTER` in `js/zustand.js`), dazu Einrasten; die Schalter nur von „Ebenengruppen“ stehen nicht im Link
    der anderen Modi. Wahl beim Umsetzen: Startwert `farb=1` überall, Abbildungen in Skript und Quiz geben `farben: false`
    ausdrücklich an. Die Tapete zeigt weder Zelle noch Symmetrieelemente; die Bindungen folgen ihrem eigenen Schalter, weil sie
    zur Struktur gehören, nicht zur Darstellung. „Füllen“ in „Gitter und Basis“ füllt die asymmetrische Einheit der bestimmten
    Gruppe; ohne Motive gibt es keine, der Schalter ist dann gesperrt (Leitfaden Abschn. 5.2). Die Lupe rechnet in allen Modi
    gleich; Mitte ist das Objekt bzw. das gewählte Motiv, sonst die Mitte der Zelle, und beim Ziehen und Zeichnen bleibt der
    Ausschnitt stehen, bis man loslässt.
  - Escher #86 und #37, Oberflächen #39, zweifarbige Muster #40.
- **Motive** („Gitter und Basis“ und „Muster entwerfen“; Thomas, 6., 11. und 12.11.2026):
  - **Auswahl nach Eigensymmetrie** in vier Zeilen: Atom; ohne Eigensymmetrie; nur Drehsymmetrie; mit Spiegelsymmetrie
    (`MOTIVZEILEN`, ein Test prüft sie gegen `symmetrie`). Grund: Ein Motiv erscheint auf einer speziellen Lage nur dann
    einmal, wenn es deren Lagesymmetrie hat; die Zeilen zeigen, welches Motiv wohin passt. Knöpfe mit kleinem Bild, Name und
    Punktgruppe im Tooltip und im `aria-label` (#130).
  - **Gleichschenkliges Dreieck** schmal (Spitze etwa 28°, Test höchstens 40°), damit es als Bild klar vom gleichseitigen zu
    unterscheiden ist (Thomas, 12.11.2026).
  - **Ornamente** (Blatt, Tropfen, Ranke) gibt es nur als Motive; als Objekt in „Ebenengruppen“ bleiben Fähnchen und Kreis mit
    Komma. Der Kreis mit Komma ist kein Motiv: Er ist das Zeichen der ITA für ein Objekt ohne Eigensymmetrie; als Motiv lägen
    auf einem Drehpunkt gleich aussehende Kreise übereinander. Für die Bestimmung trägt jedes Ornament 4 oder 5 Punkte auf
    seinem Pfad, jeder von eigener Art: Nur die Identität bildet drei solche Punkte, die nicht auf einer Geraden liegen, auf
    sich ab, so täuschen sie keine Symmetrie vor (Test: jedes Ornament allein ergibt *p*1).
  - **Grundsatz Aufpunkt** (Thomas, 12.11.2026): Gleiche Objekte haben in allen Modi denselben Aufpunkt (Lage, Drehpunkt),
    sonst ist das Verhalten für Nutzer intransparent. Das Fähnchen liegt mit dem Fuss auf der Lage und dreht sich um ihn, die
    übrigen Motive liegen mit der Mitte auf der Lage und drehen sich um sie. Neue Objekte, die in mehreren Modi vorkommen, folgen dem Grundsatz.
  - **Spiegelbilder:** Ein Basiseintrag hat neben `winkel` das Feld `spiegel`, damit jede Orientierung darstellbar ist, auch
    die Bilder chiraler Motive unter Spiegel- und Gleitspiegellinien. Bei achiralen Motiven fehlen Feld und Schalter
    „Gespiegelt“ (Leitfaden Abschn. 5.2, #130); wechselt ein gespiegeltes Motiv zu einem achiralen, entfällt das Feld.
  - **Ziegel mit und ohne Fuge** (Thomas, 12.11.2026): Rechteck 2 : 1, ohne Fuge lückenlos; „Mit Fuge“ schrumpft es um einen
    Anteil seiner Grösse. Grund: Mit einer festen Fuge im Motiv waren die Fugen nur bei einer Grösse gleich breit und eine
    geschlossene Parkettierung nicht möglich. Die Kantenmitten sind Punkte der Bestimmung, weil die Ecken allein beim
    lückenlosen Läuferverband ein Quadratgitter ergäben (*p*4*mm* statt *c*2*mm*).
  - **Grösse** logarithmisch von 0,02 bis 1 (Thomas, 12.11.2026). Grund: Linear lag der typische Bereich der Atome (0,05 bis
    0,2) auf nur 15 % des Reglers. Die Grösse des Objekts in „Ebenengruppen“ bleibt linear.
- **Modus „Muster entwerfen“** (Format von Link und Speicher im README). Gruppe und Zelle bleiben fest wie in VESTA (Thomas,
  11.11.2026): Man wählt die Gruppe, jedes Motiv und jeder Strich erscheint mit allen Operationen; die App bestimmt die
  Symmetrie des Musters nicht, das ist Thema von „Gitter und Basis“. Grund: So erwartet man es vom Bau einer Struktur in
  gegebener Gruppe (VESTA-Handbuch, Kap. 6).
  - **Zustand:** eigenes Feld `entwurf`, unabhängig von `struktur`, damit ein Wechsel der Modi keinen der beiden Stände
    verliert. Je Bahn ein **Vertreter**, die Bilder schreibt `js/bahnen.js` aus (dort auch die Orientierung der Bilder); nur
    so bleibt eine Bahn beim Ziehen über eine spezielle Lage zusammen. Änderungen an einem Bild gehen über die
    Umkehroperation an den Vertreter. Startentwurf leer in *p*4*mm* (Thomas, 12.11.2026).
  - **Zusammenfallende Bilder** (Konzept, Abschn. 2, Punkt 14): Bilder, die sich unterscheiden (Motiv, Farbe, Grösse, Lage,
    Orientierung), bleiben alle; gleiche erscheinen einmal. Ein Motiv ohne die Lagesymmetrie seiner Lage zeigt dort mehrere
    Bilder übereinander (in einem Kristall wäre das Fehlordnung), und die Kenndaten nennen sie. Grund: Zusammenfallen ist hier
    keine Bestimmung, sondern ein Bild des Entwurfs; nichts wird umgedeutet.
  - **Wechsel der Gruppe:** Vertreter und Striche bleiben, die Bilder entstehen neu; das Gitter bleibt, wenn es zum System
    passt, sonst gilt das Startgitter des Systems. Das Gitter wird nicht je System gemerkt (Thomas, 12.11.2026): Man legt
    meist Motive an und vergleicht die Muster in verschiedenen Gruppen; ein Gitter je System wäre mehr Zustand und Bedienung,
    als der Vergleich braucht.
  - **Übergang aus „Gitter und Basis“** („In „Muster entwerfen“ weiterbearbeiten“): Die bestimmte Gruppe steht im Entwurf in
    der Aufstellung nach ITA; weichen Zelle oder Ursprung ab, wird die Struktur umgerechnet, und die Kenndaten nennen die
    Umstellung. Eine linkshändige Zelle aus der Bestimmung wird vorher rechtshändig gemacht, sonst wäre das Bild gespiegelt.
    Liegen danach Metrik oder Grösse eines Motivs ausserhalb der Regler oder wäre die Grenze überschritten, ist der Knopf
    gesperrt, mit Grund. Die Übernahme ersetzt den Entwurf samt Strichen (Hinweis unter dem Knopf). Einen Weg zurück gibt es nicht: Striche
    liessen sich in „Gitter und Basis“ nicht darstellen. **Ort:** in den Kenndaten bei der bestimmten Gruppe, neben „im Modus
    „Ebenengruppen“ ansehen“, Grund bzw. Folge darunter (Thomas, 13.11.2026, #162; Leitfaden Abschn. 5.1); vorher ein
    eingeklappter Abschnitt der Seitenleiste. Am Laptop (1440 × 900) beginnen die Kenndaten bei y ≈ 820 px: Der Knopf ist
    knapp sichtbar, der Hinweis erst nach dem Scrollen (Thomas: „Wir versuchen es erstmal so.“). Knopf und Hinweis entstehen
    mit den Kenndaten neu (`weiterHTML` in `js/struktur-ui.js`), der Tooltip deshalb über `setTip`.
  - **Grenze** von 48 ausgeschriebenen Bildern (`BASIS_GRENZE`); ein Vertreter zählt mit der Zähligkeit der allgemeinen Lage,
    wo er auch liegt, damit Ziehen von einer speziellen Lage weg die Grenze nie überschreitet. Die Grenze gilt für die
    ausgeschriebenen Bilder, weil der Aufwand je Bild begrenzt bleiben soll (die Bestimmung in „Gitter und Basis“ kostete bei
    48 Windrädern 6 etwa 0,1 s, bei 96 etwa 0,36 s; 9.11.2026).
  - **Ungültig aus Link oder Speicher** (Leitfaden Abschn. 5.2): Unbekannte oder fehlende Gruppe ergibt den leeren
    Startentwurf, ein Gitter, das nicht zum System passt, das Startgitter des Systems; Link und Speicher prüfen gleich.
  - **Bindungen** wie in „Gitter und Basis“, standardmässig an (Thomas, 12.11.2026): Ohne die Linien ist es schwer, bestimmte
    Gitter selbst zu entwerfen. Skript- und Quizbilder geben `bindungen: false` ausdrücklich an.
  - **Zeichnen** (Werkzeuge „Zeichnen“ und „Radieren“, nur in diesem Modus): Striche in Bruchkoordinaten der Zelle, mit allen
    Operationen der Gruppe vervielfältigt, Farbe wie bei den Motiven (Thomas, 12.11.2026). **Nur im Speicher, nicht im Link**
    (Thomas, 12.11.2026): Eine Zeichnung kann mehr als tausend Punkte haben; ein Link lässt die Striche stehen.
  - **Prüfung der Bedienung** im Browser (`tools/entwurf-pruefen.mjs`, CI-Job `pdf`), weil die Tests ohne Browser laufen.
  - **Hilfen, Skript und Quiz:** Die Zahl der Experimente je Modus (8 bis 12) prüft der Test nur für „Ebenengruppen“ und
    „Gitter und Basis“. Das Quiz fragt allgemeine Konventionen ab; dass ein Motiv auf spezieller Lage deren Lagesymmetrie
    braucht, prüfen schon Fragen zu Kap. 6. Abbildungen in Kap. 7 und 9 laufen über `m=entwurf` mit einem Motiv in allgemeiner
    Lage als Tapete; Abb. 7.1a bleibt in „Ebenengruppen“.
- **Seitenleiste und Tafel** (crystallography-common#130, Thomas, 12.11.2026; Grundsatz im Leitfaden Abschn. 5.1; Höhen
  der Seitenleiste vorher in der `CLAUDE.md` von common, nachher im Kommentar zu crystallography-common#130 und in PR #158):
  - **Werkzeugleiste als Symbole** über Tafel A (Thomas: für die meisten Werkzeuge gibt es etablierte Symbole), Einrasten und
    Lupe als Schalter neben dem Titel, in allen Modi (Thomas). Mit Text passte die Leiste bei 530 px Tafelbreite nicht. Auf
    dem iPad quer (1024 px) bricht sie mit Touch-Zielen von 40 px in zwei Zeilen um (Review PR #158); eine Zeile ginge nur
    mit kleineren Zielen.
  - **Rückgängig** für Motive und Striche (Thomas), je Modus ein Verlauf, nur für die Sitzung; Gruppe, Gitter und Anzeigen
    gehören nicht dazu (sie stehen in der Seitenleiste). Wahl beim Umsetzen: Ein Verlauf gehört zu einem Zustandsobjekt;
    Vorgabe, Übernahme und ein Link beginnen einen neuen. Die Wahl einer Gruppe im Entwurf behält ihn (Thomas, 12.11.2026:
    sonst gingen die Zeichenschritte verloren) und verwirft nur Stände, die unter der neuen Gruppe die Grenze überschritten.
    Einrasten auf 15° am Drehregler nur mit dem Zeiger, sonst kämen die Pfeiltasten (±1°) nicht vom Fleck (Leitfaden Abschn.
    5.4).
  - **Zwei Löschknöpfe** (Thomas): „Alle Motive löschen“ (beide Modi mit Basis) und „Alle Striche löschen“ (Entwurf).
  - **Einrasten** ist ein Zustand für alle Modi (Wahl beim Umsetzen, wie die Lupe); in „Ebenengruppen“ ruht es ohne Objekt.
  - **Hinweise in der Seitenleiste** nur zum Zustand, und unter gesperrten Elementen nur der Grund in einem Halbsatz
    (gesperrte Gruppen, Gitterregler: `GITTER_FEST` in `js/hilfetexte.js`, z. B. „γ im rechteckigen System festgelegt.“);
    Erklärungen im ⓘ, seit crystallography-common v0.20.0 auch mit der Maus (Thomas, 13.11.2026, #162; Leitfaden Abschn.
    5.2). So kamen der feste Text unter „Gitter“ und der Hinweis zu „Asymmetrische Einheit füllen“ ins ⓘ. Was ein Tippen
    auf die Zeichnung tut, sagt die Legende.
  - **Kopf der Tafeln:** Der Untertitel bricht unter den Titel um, bevor er unter Schalter und Export läuft (bei 1024–1100 px
    in „Ebenengruppen“; #162), wie in stereography (stereography#140).
- **Bilder:** nur selbst erzeugte, keine Fotos. Escher nur beschreiben und verlinken (Werke geschützt).
- **Dreiecksbeispiel:** Spitzen entlang *b*, damit die Symbole ohne Umrechnung der ITA-Standardaufstellung
  entsprechen. Drei Stufen pm → cm → p2mg (fester Testfall).
- **Begriff „rechteckig“** (wie Hoffmann); „rechtwinklig“ nur als Bezeichnung bei Borchardt-Ott.
- **Quizbilder:** Symbole, Linien und Achsennamen einheitlich: `K_FRAGE` 1,8, `K_ANTWORT` 2,
  `K_MUSTER` 1,15, `K_SKIZZE` 1,25 (Kachel 1, sie füllt das Bild) in `js/quiz-bild.js`; Fähnchen nur im Muster (Tafel B) mit `K_MUSTER`,
  in Tafel A folgen sie dem Gitter (nächster Punkt).
- **Grösse des Objekts im Gitter** (5.11.2026): Fähnchen und Komma sind wie eine Zeichnung und
  die Motive der Basis im Gitter festgelegt (`objektMassstab` in `js/zeichnung.js`), in beiden Tafeln, in
  der Lupe und bei 2 × 2 Zellen im selben Verhältnis zur Zelle. Grund: In Bildpunkten war das Objekt im
  Muster 2- bis 3-mal so gross wie im Gerüst; ein Muster liess sich nicht gezielt aufbauen, besonders mit
  „Zeichnen“. Thomas wählte, dass das Muster bleibt (Skript-Abbildungen, Quizbilder, `og`); im Gerüst wird das
  Objekt grösser, der Rand wächst, bis ein Objekt mit dem Fuss auf dem Zellrand ganz sichtbar ist (gleich für
  jede Lage, damit sich die Ansicht beim Ziehen nicht ändert). Die Lupe vergrössert das Objekt mit (Thomas).
  Ausnahme: Erklärungen im Symmetriegerüst (nächster Punkt).
- **Erklärungen im Symmetriegerüst** (5.11.2026, Thomas): In „Schritt für Schritt“, „Aufbau aus Erzeugenden“
  und „Herkunft der Elemente“ zeigt das Gerüst das Objekt in fester Grösse (wie ihre Fähnchen; meist kleiner
  als im Gitter), ohne gefüllte asymmetrische Einheit (im Muster bleibt sie); Füllen und Lupe ruhen (`erklaerend` in
  `js/zeichnung.js`). Die Schalter „Füllen“ und Lupe bleiben gewählt (Leitfaden Abschn. 5.2) und wirken beim
  Verlassen wieder. Grund: Mit grossem Objekt, Füllung oder Lupe erkennt man die Elemente und Wege nicht
  mehr. Der Zustand gilt sofort beim Einschalten,
  damit das Objekt nicht erst beim Wählen eines Elements kleiner wird. „Herkunft der Elemente“ überdeckt
  „Schritt für Schritt“, schon beim Einschalten, nicht erst mit gezeigtem Element (die Erklärung zeigt statt
  der Bilder des Objekts ihre eigenen Fähnchen, Schritte wären unsichtbar); es ruht dann, solange „Herkunft
  der Elemente“ wirkt (eingeschaltet, mit Symmetrieelementen) (Schalter, Leitfaden Abschn. 5.2; Thomas,
  5.11.2026). Der Aufbau lässt sich mit der Herkunft kombinieren.
- **„Herkunft der Elemente“** (5.11.2026, Thomas): ein Schalter, kein Knopf, weil er die Symmetrieelemente erklärt wie
  der Aufbau, mit dem er sich kombinieren lässt. Zustand `herkunft`, Link `herkunft=1`, Datei `js/herkunft-text.js` (die
  Texte; `js/herkunft.js` rechnet) und das Bedienelement `opt-herkunft` heissen wie der Schalter. Ohne Elemente ist es
  gesperrt, bleibt aber gewählt.
- **Erklärungen in Tafel A** (Thomas, 13.11.2026, #162, Leitfaden Abschn. 5.1): „Schritt für Schritt“, „Aufbau aus
  Erzeugenden“ und „Herkunft der Elemente“ sind die Hauptfunktionen von „Ebenengruppen“ und gingen als eingeklappte
  Abschnitte der Seitenleiste unter. Jetzt im Kopf von Tafel A eine Auswahl (Schritt für Schritt *oder* Aufbau, ein zweiter
  Klick wählt ab) und der Schalter „Herkunft der Elemente“, unter der Zeichnung eine Leiste (◀ Schritt *n* von *N* ▶,
  Abspielen, ×). Die Kombination Schritt + Aufbau entfällt (Wahl Thomas nach Skizzen): eine Leiste, eine Auswahl; ein Link
  oder Speicher mit beiden ergibt für beide den Startwert. Der ausführliche Text eines Schritts steht weiter in den
  Kenndaten (Wahl Thomas), ohne eigene Knöpfe; der Aufbau hat dort jetzt auch einen Kasten. Eine gewählte Erklärung, die
  ruht, bleibt gewählt; den Grund nennt die Leiste, bei nicht gewählten, gesperrten die Legende (Leitfaden Abschn. 5.2).
- **Zahlen aus Link und Speicher** (6.11.2026, #98, Leitfaden Abschn. 5.2, Entscheidung Thomas): Regler-Werte
  (Gitter, „Gitter und Basis“, Vergrösserung, Objekt- und Motivgrösse) werden ausserhalb ihres Bereichs
  auf den nächsten gültigen Wert gesetzt, Drehwinkel der Motive in 0° bis unter 360° umgerechnet. `schritt` und
  `aufbau` gelten als ganzzahlige Auswahl und erhalten ausserhalb 0 … 25 bzw. 0 … 20 den Startwert: Ihr Regler
  hängt von der Gruppe ab, die Grenzen im Link sind feste Schutzgrenzen. Ebenso Koordinaten jenseits ±10⁶
  (Basis ±10³). Neue Felder gehören in `zustandPruefen` und in `tests/rundlauf.test.mjs`.
- **Lernexperimente zur Zähligkeit** (7.11.2026, Thomas): Das Objekt liegt nach Möglichkeit auf einem
  Symmetrieelement im Innern der Zelle, nicht auf ihrem Rand. Sonst zeigt das Bild mehr Objekte als die
  Zähligkeit; Studierende sind nicht gewohnt, Objekte auf Kanten und Ecken nur anteilig zur Zelle zu zählen.
  Geprüft in `tests/ablauf.test.mjs`. Das anteilige Zählen selbst ist als Übung vorgemerkt (#108).
- **Erzeugte Experimente** (7.11.2026, Thomas, crystallography-common#92, #109): Code in `js/experimente.js`.
  „An wie vielen Stellen?“ fragt je Wyckoff-Lage jeder Ebenengruppe (ausser p1) nach der Zähligkeit, mit der
  Regel oben: Lagen, deren Punkte immer ein Bild auf Kante oder Ecke haben (z. B. 0,0 oder x,0), entfallen. Unter
  den möglichen Punkten nimmt die App den, dessen Bilder am weitesten auseinander, vom Rand und von den übrigen
  Symmetrieelementen weg liegen; ein allgemeiner Punkt liegt so nie auf einer Gleitspiegellinie (er sähe sonst
  speziell aus). Koordinaten als Brüche mit Nenner 5, 8, 10 oder 12, damit die Adresse exakt bleibt. Wo die
  Bilder trotzdem eng liegen (allgemeine Lagen in p4mm, p3m1, p6mm …), zeigt die Aufgabe das Objekt halb so gross
  (`og=0.5`). Durch die Regel entfallen u. a. alle 6-zähligen Punkte und die Spiegellinien der c-Gruppen; die Liste
  steht in #108 als Grundstock für das anteilige Zählen.
- **Daten getrennt vom Code** (6.11.2026, #55, Leitfaden Abschn. 9): Datendateien sind `ebenengruppen.js`,
  `symbole.js`, `bestimmen.js`, `quiz-bank.js`, `hilfetexte.js`, `vorgaben.js`. Je Fall entschieden:
  - `vorgaben.js` ist eine Ausnahme (Entscheidung Thomas): Die Einträge entstehen mit Bauhelfern (`atom()`,
    `ziegel()`, Winkel aus Gittervektoren) und Ausdrücken wie 1/(1+√3); als reine Literale wären sie kaum
    lesbar. Abgesichert, weil `tests/struktur.test.mjs` jede Vorgabe gegen die erwartete Gruppe prüft.
  - Suche nach Kennung (`ebenengruppe(id)`, `vorgabe(id)`) bleibt in der Datendatei (Leitfaden Abschn. 9).
  - Kein Inhalt, bleibt im Code: Formen der Motive und Ornamente (`motive.js`, `ORNAMENTE`, `FAHNE` in
    `zeichnung.js`; Zeichnungsgeometrie), Schriften in `skizzen.js`, die
    Link-Tabelle `STEREO_HASH` in `verweise.js` (Schnittstelle zur Stereo-App, nicht Fachinhalt).
  - `hilfe-daten.js` ist Code, keine Datendatei (Wahl beim Umsetzen, 8.11.2026): Sie stellt Modi, Erste Schritte und
    die Experimente zusammen und ordnet die erzeugten aus `experimente.js` ein (`findIndex`, `slice`). App und
    Hilfeseite nehmen die Liste `EXPERIMENTE` von dort, damit die Reihenfolge an einem Ort steht.
  - `herkunft.js`, `herkunft-text.js`, `text.js` setzen Sätze aus berechneten Teilen zusammen (Lage, Operation,
    Winkel); dort gibt es keine festen Texte, die sich als Daten herauslösen liessen.

## Konventionen

- Dezimalkomma in Skript und Oberfläche; Querstrich statt Minus, wo die Kristallographie ihn verwendet.
- **Speicherschlüssel:** Service-Worker-Cache `ebenengruppen-`, Zustand `ebenen-zustand`, Quiz-Speicher
  `ebenen-quiz`, Erste Schritte `ebenen-intro` (Wert: die gesehenen Modi, z. B. `eg,struktur`), Stand der Experimente
  `ebenen-experimente` (bleibt beim Zurücksetzen wie das Quiz). Das Präfix `ebenen-` bleibt, weil die Apps der Familie
  einen Ursprung teilen und „Alle Einstellungen zurücksetzen“ nach Präfix löscht (Leitfaden Abschn. 5.2): Jeder Eintrag
  im Speicher heisst `ebenen-…`. Name und Format der Einträge dürfen sich in der Entwicklung ändern, auch der Lernstand
  (Leitfaden Abschn. 7 und 8); ändert sich das Format des Zustands, steigt `SPEICHER_VERSION` (`js/zustand.js`), und ein
  Stand mit anderer Version wird verworfen; Werte in `ebenen-intro`, die keinen Modus nennen, zählen nicht.
- **Bildangaben im Quiz:** `#…` Tafel A, `B#…` Tafel B (Muster); Endung `@k` setzt die Symbolgrösse;
  `skizze:3m|2mm|4mm|6mm|kachel-p2` sind Skizzen aus dem Skript (`kachel-p2` ohne Drehpunkte, Abb. 7.6c). Zerlegen nur mit `zerlege()` aus
  `js/quiz-bild.js` (`hashAnwenden` verträgt das `@` nicht).
- **Matrizen und Vektoren in Quiztexten** nur mit `mat()` aus `js/quiz-bank.js` (`<span>` mit
  `display: inline-table`). Keine Blockelemente in Frage- und Erklärtexten (Test): Ein `<table>`
  schliesst das umgebende `<p>` in Prüfliste und Moodle-Export.
- Hilfen in `js/quiz-bank.js`: `ov()` Querstrich, `sym()` Symbol kursiv, `LZ` sammelt die Lernziele.
- Bindungen aus der periodischen Zelle (`bindungenBasis`): einmal je Paar von Atomen der Basis bestimmt und auf die Bilder
  übertragen; der Aufwand wächst nur linear mit der Zahl der Zellen im Bild.
- **Link-Adressen** sind Schnittstelle (Leitfaden Abschn. 8), aber noch nicht stabil: Die App ist in Entwicklung, ein
  Bruch von Link oder Speicher ist erlaubt (MINOR, im CHANGELOG unter „Geändert“ mit Hinweis), alter Code zum Umrechnen
  entfällt; stabil werden sie mit der endgültigen Form der App (Entscheidung Thomas, noch offen). Die Werte stehen in `js/zustand.js`
  (`SCHALTER`, `FORMEN`, `ZOOM_BEREICH`, `OBJ_BEREICH`). Zur Stereo-App verlinkt die App mit deren
  Parameter `blick=1–3` die 10 polaren Punktgruppen.

## Fallstricke

- **Lokale Tests mit HTML-Fragmenten** laufen im Quirks-Modus; Fehler wie `<table>` in `<p>` zeigen sich
  erst im Standards-Modus.
- **Toleranzen der Bestimmung** (`js/bestimmung.js`, #126): Lagen mit `TOL` = 10⁻⁴, die Metrik mit 10⁻⁹ relativ (nur
  Rundungsfehler). Eine grössere Toleranz der Metrik überdeckt Abweichungen, die nur quadratisch wirken (*b*/*a* = 1,732 bei
  γ = 150° liegt 2,6·10⁻⁹ neben einem rhombischen Gitter). Dafür werden die Translationen der kleinsten Zelle auf
  Vielfache von 1/*N* gerundet, und der Ursprung gilt bis `TOL` als lösbar; sonst trügen Lagen aus dem Link (6 Stellen)
  ihre Abweichung in Metrik und Ursprung einer Überstruktur. `tests/toleranzen.test.mjs` sichert beides.
- **Ornamente** (z. B. „Blatt“) haben keine eigene Symmetrie (chiral; `ORNAMENTE` in `js/zeichnung.js`); es gibt sie nur als Motive (`motive.js`).
- **Bücher, bekannte Fehler:**
  - Hoffmann Abb. 4.27 (cF(110)): richtig ist primitiv-rechteckig *a*/√2 × *a* (so auch sein Text S. 150).
  - Hoffmann Abb. 4.28 (hP(111)): das Netz ist zentriert-rechteckig, nicht schiefwinklig.
  - Hoffmann Abb. 5.37b: P4/nmm statt P4mm.

## Literatur

Quellen je Kapitel in `skript.html` (`.quellen`). Darüber hinaus für Konzept, Quiz und Entscheidungen:

- **ITA Vol. A** (5. Aufl., Hahn, 2006): 2.2.6.1 (Diagramme, *a* nach unten, *b* nach rechts, S. 20),
  2.2.6.4 (Orientierung, S. 22), 2.2.7 (Ursprung, S. 24), 2.2.8 (asymmetrische Einheit); Part 6,
  S. 92–109 (alle 17 Gruppen, Grundlage der Tests); Dreiecksbeispiel Nr. 3, 5, 7, S. 94, 96, 98.
- **Borchardt-Ott & Sowa (2018):** 7.1–7.2, 10.1–10.2 (Abb. 10.9 Gitter + Motiv; Tab. 10.1,
  S. 205–207; Gleitspiegellinien nicht im Symbol, S. 206), 10.4; Spiegelungen nach der Normalen:
  4*mm* S. 266, hexagonal Tab. 11.1; abelsch S. 264 ff.; Quiz-Anregungen Aufg. 10.1–10.3, 11.2.
- **Hoffmann (2016), Didaktik:** Kap. 4, Einstieg S. 130–131; Fussspuren Abb. 4.7–4.9, S. 133–134;
  Tab. 4.1, 4.2; Flussdiagramm nach Sanderson Abb. 4.14–4.18; Mauerwerk Abb. 4.19; 4.2.3 Alhambra und
  Escher, S. 141–146; 4.2.4 Netzebenen, S. 147–151; 4.3 Zeichenwerkzeuge, S. 152; Abschn. 1.9, 2.3,
  2.7, 6.1.3–6.1.5; 8.2 Parkettierungen (Abb. 8.3).
- **Conway, Burgiel, Goodman-Strauss, *The Symmetries of Things*:** Kap. 2 (Tab. 2.1, S. 27); Kap. 3
  (Magic Theorem S. 29–30; Signatur S. 30–31; die 17 Typen S. 33–40, Tab. 3.2; Übungsmuster S. 42–49);
  Kap. 11–13 Farbsymmetrie, S. 135–169. Ausgabe: A K Peters/CRC Press 2016 (E-Book der Ausgabe von 2008,
  ISBN 978-1-4398-6489-0; in Zotero, Seiten gegen das PDF geprüft 5.11.2026).
- **Weitere:** Schattschneider, *M. C. Escher: Visions of Symmetry* (2. Aufl. 2004); Grünbaum, Notices
  AMS 53, 670–673 (2006) (Alhambra); ITA Vol. E (Friesgruppen); Lexikon der Geowissenschaften,
  „Antisymmetriegruppen“ (2000).
- **Vorlesung HS 2026** nur zum Abgleich, nie zitiert.
- **`oxrd.py`** (Laserbeugung, Tzschaschel, Lehmann 2018): Ideen für Konzept 3.3 (Quelle für
  die Beugungs-App), nicht die Oberfläche.

## Konzept

`docs/konzept-2d-app.md` (Abschnitte, Entscheidungen 1–34) mit Statuskopf. Es bleibt das Konzept für
die offenen Teile („Bestimmen“, Erweiterungen); neue Entwurfsentscheidungen kommen dort hinzu,
der Fortschritt steht in Issues und PRs. `docs/konzept-muster-entwerfen.md` (dritter Modus) ist umgesetzt und hat einen
Statuskopf; es wird nicht mehr nachgeführt, der heutige Stand steht hier.
