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
  - **Ein Gitterbereich für alle Modi:** *b*/*a* 0,5–2, γ 60–150° (`GITTER_BEREICH` in `js/zustand.js`; `STRUKTUR_BEREICH`
    leitet sich davon ab). Er schliesst höhere Metrik nicht aus; ein engerer tat es auch nicht (*b*/*a* = 1 war einstellbar).
    In „Ebenengruppen“ bleibt die Gruppe die gewählte, die Metrik ist dann zufällig höher (z. B. *b* = *a* im rechteckigen
    System), und der Hinweis im Abschnitt „Gitter“ sagt es.
  - **„Darstellung“ gleich in allen Modi:** eigene Karte unten in der Seitenleiste (Nach Blickrichtung färben,
    Symmetrieelemente im Muster, Muster als Tapete, Asymmetrische Einheit füllen, Vergrösserung des Musters), dieselben Felder
    im Zustand (`farben`, `musterElemente`, `tapete`, `aeFuell`, `lupe`, `zoomB`) und Schlüssel im Link (`farb`, `mel`, `tap`,
    `fuell`, `lupe`, `zoom`; `GEMEINSAME_SCHALTER` in `js/zustand.js`), dazu Einrasten (`einrasten`, `rast`; seit #130,
    Abschnitt „Seitenleiste und Tafel“). Die Schalter nur von „Ebenengruppen“ (`el`, `obj`, `ae`, `orbit`) stehen nicht im
    Link der anderen Modi. Wahl beim Umsetzen:
    - **Farben:** Der Startwert `farb=1` gilt in allen Modi. Abbildungen im Skript und im Quiz geben `farben: false`
      ausdrücklich an.
    - **Tapete:** ohne konventionelle Zelle und ohne Symmetrieelemente (sie sperrt „Symmetrieelemente im Muster“, das gewählt
      bleibt); die Motive behalten ihre Farben, die gefüllte asymmetrische Einheit ist einfarbig. Die Bindungen folgen ihrem
      eigenen Schalter („Anzeigen“), weil sie zur Struktur gehören, nicht zur Darstellung.
    - **Füllen** in „Gitter und Basis“: die asymmetrische Einheit der bestimmten Gruppe mit allen Bildern, gezeichnet in deren
      konventioneller Zelle (`aeFuellung` in `js/zeichnung.js`, dieselbe Rechnung wie in „Ebenengruppen“; der Bereich der
      Bilder folgt aus dem Bild, `konvBereich` in `js/struktur.js`), in Tafel A und im Muster. Ohne Motive gibt es keine
      bestimmte Gruppe: Der Schalter ist gesperrt, mit Grund, bleibt aber gewählt (Leitfaden Abschn. 5.2).
    - **Lupe:** ein Schalter (Symbol) über Tafel A neben Einrasten, in allen Modi dieselbe Rechnung (`lupeAusschnitt` in
      `js/zeichnung.js`). Mitte: in „Ebenengruppen“ das Objekt, sonst das gewählte, gezeichnete Motiv, ohne Wahl die Mitte der
      gegebenen Zelle. Beim Ziehen und Zeichnen bleibt der Ausschnitt stehen (`fest`) und folgt erst beim Loslassen; tippt
      man ins Leere, springt die Ansicht zur Mitte der Zelle. Sie ruht nur in den Erklärungen von „Ebenengruppen“
      (`erklaerend`, `z.modus === 'eg'`).
  - Escher #86 und #37, Oberflächen #39, zweifarbige Muster #40.
- **Motive** („Gitter und Basis“ und „Muster entwerfen“; Thomas, 6., 11. und 12.11.2026):
  - **Auswahl nach Eigensymmetrie:** `MOTIVZEILEN` (Daten, `js/motive.js`) ordnet die Motive vier Zeilen zu (Atom; ohne
    Eigensymmetrie; nur Drehsymmetrie; mit Spiegelsymmetrie), ein Test prüft die Zeilen gegen `symmetrie`. Grund: Ein Motiv
    erscheint auf einer speziellen Lage nur dann einmal, wenn es deren Lagesymmetrie hat; die Zeilen zeigen, welches Motiv
    wohin passt. Die Knöpfe zeigen ein kleines Bild (`motivSymbol` in `js/struktur.js`, auf die Mitte des Rechtecks um seine
    Punkte gesetzt, damit auch das Fähnchen mit dem Fuss auf der Lage ganz im Feld liegt; Farbe der gewählten Atomsorte über
    `--mf`), mindestens 40 px; Name und Punktgruppe im Tooltip und im `aria-label`, die Zeile als `aria-labelledby`, das ⓘ
    nennt die Zeilen. `s-motiv` ist eine Gruppe von Knöpfen: je Zeile ein Raster mit bis zu 6 Knöpfen, der Name der Zeile als
    kleine Überschrift darüber (#130; vorher eine linke Spalte, die nur 3 Knöpfe je Zeile liess).
  - **Gleichschenkliges Dreieck** schmal (Spitze etwa 28°; Test: höchstens 40°), damit es als Bild klar vom gleichseitigen
    zu unterscheiden ist (Thomas, 12.11.2026).
  - **Ornamente** (Blatt, Tropfen, Ranke) gibt es nur als Motive; als Form des Objekts in „Ebenengruppen“ bleiben Fähnchen und
    Kreis mit Komma (`FORMEN` in `js/zustand.js` und `js/zeichnung.js`). Der Kreis mit Komma ist kein Motiv: Er ist das Zeichen
    der ITA für ein Objekt ohne Eigensymmetrie; als Motiv lägen auf einem Drehpunkt gleich aussehende Kreise übereinander.
    Pfade in `ORNAMENTE` (`js/zeichnung.js`, gezeichnet von `ornamentSVG`). Das Ornament liegt auf der Mitte des Rechtecks um
    die Pfadpunkte (`ornamentMitte`), um sie dreht es sich und lässt sich greifen wie die übrigen Motive. Eine lokale Einheit
    sind `ORNAMENT_EINHEIT` = 13 Bildpunkte der Pfade (etwa zwei Einheiten hoch wie das Fähnchen), Standardgrösse 0,1.
    **Kennzeichnende Punkte:** je 4 oder 5 auf den Pfaden (Fuss, Spitze, Ansatz, Mitte eines Bézier-Abschnitts; nicht dessen
    Kontrollpunkte), jeder mit eigener Art (`o0`, `o1` …). Eine Symmetrie müsste jeden Punkt auf sich selbst abbilden, und das
    tut bei drei Punkten, die nicht auf einer Geraden liegen, nur die Identität; so täuschen sie keine Symmetrie vor. Der Test
    prüft Art, Lage auf dem Pfad, dass die Zeichnung beim ersten Punkt beginnt (gleiche Orientierung wie `motivKart`) und dass
    jedes Ornament allein, gedreht und gespiegelt, in verschiedenen Gittern *p*1 ergibt.
  - **Grundsatz Aufpunkt** (Thomas, 12.11.2026): Gleiche Objekte haben in allen Modi denselben Aufpunkt (Lage, Drehpunkt),
    sonst ist das Verhalten für Nutzer intransparent. Das Fähnchen liegt mit dem Fuss auf der Lage und dreht sich um ihn (die
    Stange ragt 2 Einheiten nach oben; Auswahl- und Greifzone um den Fuss), die übrigen Motive mit der Mitte. Neue Objekte, die
    in mehreren Modi vorkommen, folgen dem Grundsatz.
  - **Spiegelbilder:** Ein Basiseintrag hat neben `winkel` das Feld `spiegel` (Spiegelung an der eigenen *y*-Achse des Motivs,
    vor der Drehung), damit jede Orientierung darstellbar ist, auch die Bilder chiraler Motive unter Spiegel- und
    Gleitspiegellinien. Achirale Motive sind zu dieser Achse symmetrisch (Test); bei ihnen entfällt das Feld, und der Schalter
    „Gespiegelt“ fehlt (Leitfaden Abschn. 5.2, #130; ebenso „Mit Fuge“ ausser beim Ziegel). Im Link ein optionales letztes Feld `m` in `basis=`. Wechselt ein gespiegeltes Motiv zu einem
    achiralen, entfällt das Feld (es gibt dann nichts, was ruhen könnte, Leitfaden Abschn. 5.2).
  - **Ziegel mit und ohne Fuge** (Thomas, 12.11.2026): Der Ziegel ist ein Rechteck 2 : 1, Grösse = halbe Länge, ohne Fuge
    lückenlos; der Schalter „Mit Fuge“ (`fuge` am Basiseintrag, `Motiv.fuge` mit den Faktoren 0,95 und 0,9 für die lokalen
    Punkte, `hatFuge`; Link-Feld `f`, standardmässig aus) lässt das Rechteck rundum um 5 % der Länge schrumpfen, also gleich
    breite Fugen. Grund: Mit einer festen Fuge im Motiv waren die Fugen nur bei einer Grösse gleich breit und eine
    geschlossene Parkettierung nicht möglich. Die Fuge ist relativ zur Grösse, nicht absolut: nur so sehen alle Vorgaben
    (Raster 2*u* × *u* für *u* = 1, 1/2, 1/3 …) mit Grösse *u* und Schalter genau aus wie mit fester Fuge (Test über die
    Ecken). Die Kantenmitten (Art `s`) sind Punkte der Bestimmung, weil die Ecken allein beim lückenlosen Läuferverband ein
    Quadratgitter ergäben (*p*4*mm* statt *c*2*mm*).
  - **Grösse** (Thomas, 12.11.2026): Der Regler ist logarithmisch von 0,02 bis 1 (`groesseVonRegler`, `reglerVonGroesse`,
    `GROESSE_SCHRITTE` in `js/zustand.js`). Grund: Linear lag der typische Bereich der Atome (0,05 bis 0,2) auf nur 15 % des
    Reglers. 250 Schritte zu je 1,6 %, die Grösse auf drei gültige Ziffern gerundet (höchstens 0,25 %), damit sie immer auf
    dieselbe Stellung zurückläuft und der Regler beim Ziehen nicht springt (ein Test prüft den Rücklauf aller Stellungen).
    Die Grösse des Objekts in „Ebenengruppen“ (`obj-groesse`, 0,5 bis 3) bleibt linear.
- **Modus „Muster entwerfen“** (`entwurf`; Gründe unter „Modi und Umfang“, Format von Link und Speicher im README). Gruppe
  und Zelle bleiben fest wie in VESTA (Thomas, 11.11.2026): Man wählt die Gruppe, jedes Motiv und jeder Strich erscheint mit
  allen Operationen; die App bestimmt die Symmetrie des Musters nicht, das ist Thema von „Gitter und Basis“. Grund: So erwartet
  man es vom Bau einer Struktur in gegebener Gruppe (VESTA-Handbuch, Kap. 6).
  - **Zustand:** eigenes Feld `entwurf` (`EntwurfZustand`: `gruppe`, `ba`, `gamma`, `basis`, `striche`, `elemente`, `ae`,
    `bindungen`), unabhängig von `struktur`, damit ein Wechsel der Modi keinen der beiden Stände verliert; `gruppe` des
    Zustands gehört „Ebenengruppen“. `basis` hält je Bahn einen **Vertreter**, die Bilder entstehen in
    `ausgeschrieben(entwurf)` (`js/bahnen.js`); nur so bleibt eine Bahn beim Ziehen über eine spezielle Lage zusammen.
    Startentwurf: leer in *p*4*mm* (`ENTWURF_START`; Thomas, 12.11.2026).
  - **Zusammenfallende Bilder** (Konzept, Abschn. 2, Punkt 14): Bilder, die sich unterscheiden (Motiv, Farbe, Grösse, Lage,
    Orientierung; `gleichesMotiv` mit der Toleranz der Bestimmung), bleiben alle; gleiche erscheinen einmal (das erste in
    der Reihenfolge der ITA, also der Vertreter, wenn er darunter ist). Ein Motiv ohne die Lagesymmetrie seiner Lage zeigt
    dort mehrere Bilder übereinander (in einem Kristall wäre das Fehlordnung); die Kenndaten nennen sie („davon *n*
    überlagert“, Kasten „Überlagerte Bilder“, `passtNichtZurLage`, `ueberlagerung`). Das Atom und ein Motiv mit der
    Lagesymmetrie erscheinen auf der Lage einmal. Grund: Zusammenfallen ist hier keine Bestimmung, sondern ein Bild des
    Entwurfs; nichts wird umgedeutet.
  - **Tafeln und Kenndaten:** Tafel A und B zeichnen den Entwurf mit den Bausteinen von „Gitter und Basis“, mit einer festen
    Bestimmung (`festeBestimmung`: die gewählte Gruppe, konventionelle Zelle = gegebene, Ursprung 0, 0; `strukturTafelA` mit
    dem Parameter `gegeben`). Die Kenndaten (`entwurfHTML`) zeigen die Gruppe, je Motiv Wyckoff-Lage, Lagesymmetrie und
    Bilder je Zelle und sagen, dass nichts bestimmt wird.
  - **Orientierung der Bilder:** Drehanteil *K* der Operation kartesisch (`kartMatrix`): *D*(*w*′) *S*^*s*′ = *K* *D*(*w*)
    *S*^*s* mit der Drehung *D* und der Spiegelung *S* an der eigenen *y*-Achse, also *s*′ = *s* XOR (det *K* < 0); *w*′ aus dem
    Bild der *y*-Achse des Motivs (zweite Spalte), die *S* festlässt. Motiv, Farbe, Grösse und Winkel gelten für die ganze
    Bahn. Ziehen an einem Bild verschiebt den Vertreter über die Umkehroperation (`vertreterVon`); ist ein Bild gewählt, zeigen
    Winkel und „gespiegelt“ das Bild, und Änderungen gehen ebenso über die Umkehroperation an den Vertreter. Einrasten zuerst
    auf spezielle Lagen (`lage()`, Toleranz in Pixeln wie in „Ebenengruppen“), sonst auf das 1/12-Raster. Liegt ein gewähltes
    Bild auf einer speziellen Lage, zeigt die Auswahl das dort gezeichnete Bild (`sichtbareOp`; Review #134).
  - **Wechsel der Gruppe** (`gruppeWechseln`): Vertreter bleiben mit Bruchkoordinaten, Motiv, Winkel und Farbe, die Bilder
    entstehen neu; die Striche bleiben. Das Gitter bleibt, wenn es zum System passt (`gitterZurGruppe`, innerhalb der
    Genauigkeit des Links, dann exakt), sonst gilt das Startgitter des Systems; im Bereich der Regler (`GITTER_BEREICH`)
    bleibt ein Gitterregler frei, wo das System es freigibt (in *p*2*mm* auch *b* = *a*). Gesperrt (mit Grund), wenn die
    Grenze überschritten würde. Das Gitter wird nicht je System gemerkt (Thomas, 12.11.2026): Man legt meist Motive an und
    vergleicht die Muster in verschiedenen Gruppen; ein mitgeführtes Gitter je System wäre mehr Zustand und Bedienung, als
    der Vergleich braucht.
  - **Übergang aus „Gitter und Basis“** (Knopf „In „Muster entwerfen“ weiterbearbeiten“, `uebernahmeVon`): Die bestimmte
    Gruppe steht im Entwurf in der Aufstellung nach ITA. Weicht die konventionelle Zelle oder der Ursprung ab, rechnet die
    Übernahme die Struktur um (*b*/*a*, γ, Lagen, Winkel und Grösse der Motive); mit anderer Zelle dreht sich das Bild, weil
    *b* immer waagrecht liegt, mit anderem Ursprung verschiebt es sich nur. Die Kenndaten nennen die Umstellung. Unter den
    Vorgaben betrifft das `dreieck3`, `fisch` (Ursprung) und `drittel`, `flecht` (Zelle). Liefert die Bestimmung eine
    linkshändige Zelle (z. B. −*a*, *b*; je nach Rundung schon bei γ = 60°), wird sie vorher rechtshändig gemacht (*a*′ → −*a*′,
    hexagonal *a*′ ↔ *b*′), sonst wäre das Bild gespiegelt. Liegen danach Metrik oder Grösse eines Motivs ausserhalb der
    Regler oder ist die Grenze überschritten, ist der Knopf gesperrt, mit Grund. Die Struktur in „Gitter und Basis“ bleibt
    unverändert. Die Übernahme ersetzt den Entwurf samt
    Strichen (Hinweis unter dem Knopf, sobald der Entwurf Bahnen oder Striche hat), die Wahl der Bindungen kommt mit. Einen
    Weg zurück gibt es nicht: Striche liessen sich in „Gitter und Basis“ nicht darstellen.
  - **Grenze:** `BASIS_GRENZE` = 48 gilt für die ausgeschriebenen Bilder. Ein Vertreter zählt mit der Zähligkeit der
    allgemeinen Lage, wo er auch liegt (`bahnGewicht`: *p*6*mm* 12, *c*2*mm* 8), damit Ziehen von einer speziellen Lage weg
    die Grenze nie überschreiten kann und der Aufwand je Bild begrenzt bleibt (die Bestimmung in „Gitter und Basis“ kostete
    bei 48 Windrädern 6 etwa 0,1 s, bei 96 etwa 0,36 s; gemessen 9.11.2026, Cloud). Beim Lesen aus Link und Speicher fallen
    überzählige Vertreter am Ende weg, wie überzählige Motive in „Gitter und Basis“.
  - **Ungültig aus Link oder Speicher** (Leitfaden Abschn. 5.2: nicht umdeuten): unbekannte oder fehlende Gruppe `g` ergibt
    den leeren Startentwurf (auch Vertreter und Gitter des Links entfallen); ein Gitter, das nicht zum System der Gruppe
    passt, das Startgitter des Systems (Vertreter und Anzeigen bleiben). Link und Speicher prüfen gleich (`pruefeEntwurf`).
  - **Bindungen** (Thomas, 12.11.2026): Der Schalter „Bindungen (nächste Nachbarn)“ gilt wie in „Gitter und Basis“ (Startwert
    an; Link `bind`, nur bei `0`). Grund: Ohne die Linien ist es schwer, bestimmte Gitter selbst zu entwerfen. Dieselbe
    Rechnung (`bindungenBasis`) auf den ausgeschriebenen Bildern, also zwischen Atomen aller Bilder der Gruppe. Skript- und
    Quizbilder geben `bindungen: false` ausdrücklich an.
  - **Zeichnen:** Werkzeuge „Zeichnen“ und „Radieren“ neben „Wählen und ziehen“ und „Hinzufügen“ (sie schliessen sich aus,
    die Auswahl wird aufgehoben, Leitfaden Abschn. 5.2); es gibt sie nur hier.
    - **Zustand:** `striche` = Liste von `Strich { punkte: Vec2[], farbe }` (Typ in `js/motive.js`), Punkte in
      Bruchkoordinaten der gegebenen (= konventionellen) Zelle, Farbe = Index der Atomsorte 0–3 wie bei den Motiven
      (`motivFarben`; Thomas, 12.11.2026); Spiegelbilder bekommen keine eigene Farbe. Prüfung in `pruefeStriche`
      (`js/zustand.js`: mindestens 2 Punkte je Strich, Punkte innerhalb ±10⁶, Farbe ausserhalb 0–3 ergibt 0, höchstens
      `STRICH_GRENZE` Punkte, überzählige Striche am Anfang fallen weg).
    - **Nur im Speicher, nicht im Link** (Thomas bestätigt, 12.11.2026): Die Zeichnung kann mehr als tausend Punkte haben.
      Ein Link `m=entwurf&…` lässt die Striche davor stehen, wie der Speicher überhaupt Dinge behält, die der Link nicht trägt.
    - **Zeichnung:** `strichSVG` (`js/struktur.js`) vervielfältigt jeden Strich mit allen Operationen der gewählten Gruppe
      (`kopien`, `js/zeichnung.js`), unter den Motiven in Tafel A und B, auch als Tapete; Breite 2,6 (A, mit `k` bis 1,4) bzw. 2.
      Radieren wirkt je Strich (`radieren` auf einem Strich), die Teile behalten die Farbe.
    - **Bedienung:** Die Farbe ist die des Bereichs „Neues Motiv“ (`neu.farbe`). Werkzeuge, „Rückgängig“ und „Alle Striche
      löschen“ in der Werkzeugleiste von Tafel A (#130, nächster Punkt). „Radieren“ ist gesperrt, solange es keine Striche
      gibt, bleibt aber gewählt. Wechsel in einen anderen Modus wählt das Werkzeug ab.
  - **Bedienung:** Reiter „Muster entwerfen“; Karte mit Gruppenwahl (Knöpfe je Kristallsystem wie in „Ebenengruppen“),
    „Symmetrieelemente“ und „Asymmetrische Einheit“; darunter wie in „Gitter und Basis“ Basis und Gitter (Karte `nur-bau`)
    sowie „Darstellung“. Ein leerer Entwurf wählt das Werkzeug „Hinzufügen“ von selbst (auch beim Öffnen eines Links).
    „Metrik setzen“ und „Vorgabe“ gibt es nur in „Gitter und Basis“. Die Bedienung prüft ein Browserlauf
    (`tools/entwurf-pruefen.mjs`), weil die Tests ohne Browser laufen (Leitfaden Abschn. 9); er läuft in der CI im Job `pdf`
    mit, der Chromium schon hat.
  - **Hilfen, Skript und Quiz:** Erste Schritte `einstieg-entwurf`, Experimente `entwurf-lage` (Fähnchen, dann Windrad
    auf dem 4-zähligen Drehpunkt) und `entwurf-gruppen` (Fähnchen in allgemeiner Lage in *p*4, dann in *p*4*mm*); jedes
    steht für sich (Leitfaden Abschn. 5.3). Die Zahl der Experimente
    je Modus (8 bis 12) prüft der Test nur für „Ebenengruppen“ und „Gitter und Basis“. Das Quiz fragt allgemeine
    Konventionen ab; die Bedingung „Motiv auf spezieller Lage braucht deren Lagesymmetrie“ prüfen schon Fragen zu Kap. 6.
    Skript: Kap. 7 (Abb. 7.1b, c, 7.2a–c) und Kap. 9 (Abb. 9.1) laufen über `m=entwurf` mit einem Motiv in allgemeiner Lage
    (Blatt, Tropfen, Ranke, Grösse 0,19; für *cm* 0,2, für *p*1 0,3), ohne Farbe nach Blickrichtung (`farb=0`) und als Tapete
    (`tap=1`); in Abb. 7.1b und 9.1a (*p*4*gm*) liegt das Blatt bei (0,2 | 0,25), damit es mit seinem Spiegelbild wie ein
    Schmetterling wirkt. Abb. 7.1a bleibt in „Ebenengruppen“. `appTafel` und das Quizbild zeichnen die Tapete im Entwurf ohne
    Zelle (`zelle: !z.tapete`); die Skizze `conway` baut auf dem Entwurf auf (`ausgeschrieben`, `festeBestimmung`, Elemente
    über der Tapete). Die Quizfrage `tk-1-02` zeigt Abb. 7.1b.
- **Seitenleiste und Tafel** (crystallography-common#130, Thomas, 12.11.2026; Grundsatz im Leitfaden Abschn. 5.1): Die
  Seitenleiste sagt, was da ist, Tafel A trägt, was man auf der Zeichnung tut. Gemessen am Laptop (1440 × 900, etwa 880 px
  Platz) war die Seitenleiste 963 / 1515 / 1799 px hoch (Ebenengruppen / Gitter und Basis / Muster entwerfen), danach
  947 / 1188 / 1227 px, mit eingeklappter „Basis“ 739 und 778 px.
  - **Werkzeugleiste als Symbole** (Thomas: für die meisten Werkzeuge gibt es etablierte Symbole): Pfeil (Wählen und ziehen),
    + (Hinzufügen), Stift, Radiergummi; dann die Handlungen Rückgängig, „Gewähltes Motiv entfernen“ (× im gestrichelten Rahmen), „Alle Motive
    löschen“ und „Alle Striche löschen“ (Papierkorb mit Dreieck bzw. Strich); Einrasten (Magnet) und Lupe als Schalter neben
    dem Titel, in allen Modi (Thomas). Name im `aria-label`, Erklärung im Tooltip und im ⓘ von „Basis“ (Touch). Mit Text
    passte die Leiste bei 530 px Tafelbreite nicht (Skizzen in der Sitzung). Kopf von Tafel A: Titel, Schalter, Export in
    einer Zeile, darunter in den Modi mit Basis die Leiste (`.leiste`); der Untertitel bricht um, bevor der Export eine eigene
    Zeile braucht (iPad). Auf dem iPad quer bei 1024 px bricht die Leiste mit Touch-Zielen von 40 px in zwei Zeilen um
    (Kopf etwa 150 px; Review PR #158); eine Zeile ginge nur mit kleineren Zielen.
  - **Rückgängig** (Thomas: für Motive und Striche; in beiden Modi mit Basis): je Modus ein Verlauf von Basis und Strichen,
    ein Schritt je abgeschlossener Handlung, bis 50, nur für die Sitzung (`verlaeufe`, `beginnen`, `abschliessen` in
    `js/struktur-ui.js`); Gruppe, Gitter und Anzeigen gehören nicht dazu (Seitenleiste). Wahl beim Umsetzen: Ein Verlauf
    gehört zu einem Zustandsobjekt; Vorgabe, „Vorgabe wiederherstellen“, Übernahme und ein Link ersetzen es und beginnen
    einen neuen. Die Wahl einer Gruppe im Entwurf behält ihn und verwirft nur die Stände, die unter der neuen Gruppe die
    Grenze der Bilder überschritten (Thomas, 12.11.2026; zuerst leerte sie ihn, dann gingen auch die Zeichenschritte
    verloren). Rückgängig ändert die Gruppe nicht; ein Stand aus einer anderen Gruppe erscheint unter der jetzigen. Der frühere
    Rückfall „ohne Verlauf der letzte Strich“ entfällt. Kanonischer Stand (Felder sortiert), damit eine Änderung ohne Wirkung
    kein Schritt ist; ein Klick zum Wählen rückt eine Lage nicht in die Zelle (nur nach Bewegung), weil Vorgaben Lagen
    ausserhalb haben. Pfeiltasten an einem Regler ergeben je Taste einen Schritt. Einrasten auf 15° am Drehregler nur mit dem
    Zeiger, sonst kämen die Pfeiltasten (±1°) nicht vom Fleck (Leitfaden Abschn. 5.4).
  - **Zwei Löschknöpfe** (Thomas): „Alle Motive löschen“ (beide Modi) und „Alle Striche löschen“ (Entwurf).
  - **Einrasten** ist ein Zustand für alle Modi (`z.einrasten`, Link `rast` jetzt in `GEMEINSAME_SCHALTER`; Wahl beim
    Umsetzen, wie die Lupe). In „Ebenengruppen“ ruht es ohne Objekt; der Grund steht in der Legende.
  - **Hinweise in der Seitenleiste** nur zum Zustand (`.hintline:empty` blendet leere aus): gesperrte Gruppen, gesperrte
    Gitterregler, Grund und Folge von „Weiterbearbeiten“. Was ein Tippen auf die Zeichnung tut, sagt die Legende.
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
- **„Herkunft der Elemente“** (5.11.2026, Thomas): Schalter im Abschnitt „Aufbau aus Erzeugenden“, nicht Knopf über
  dem Gerüst. Grund: Es erklärt die Symmetrieelemente wie der Aufbau, mit dem es sich kombinieren lässt; über dem Gerüst
  steht nur, was die Ansicht ändert (Lupe). Der Name sagt, worauf es sich bezieht. Zustand `herkunft`, Link
  `herkunft=1`, Datei `js/herkunft-text.js` (die Texte; `js/herkunft.js` rechnet) und die Bedienelemente
  `opt-herkunft`, `row-herkunft` heissen wie der Schalter. Ist es aus Speicher oder Link aktiv, klappt sein Abschnitt
  beim Start auf; ohne Elemente ist es gesperrt, bleibt aber gewählt.
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
