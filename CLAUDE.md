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
  Ornament (Ranken aus Abb. 7.2a; Elemente über der Tapete mit `tafelB(…, { tapeteElemente })`; Abb. 8.4f
  als Muster mit Zelle und nur deren Elementen, `nurZelle`, damit es aussieht wie a–e). Leitfrage 3 schlicht
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
  Vertiefungskapitel am Ende des Skripts (Teil „Vertiefung“, `data-level` am Kapitel), nicht mehr in
  Kap. 7. Grund: Es ist ein eigener Zugang zu den 17 Gruppen und zur Bestimmung, neben dem Flussdiagramm
  in Kap. 8. Der Anker `#conway` bleibt (jetzt das Kapitel). Die Fragen dazu heissen sc-3-01 … 04
  (vorher tk-3-06, -07, -08, -10). Ein Vertiefungskapitel hat nur Fragen der Stufe 3; die Tests lassen
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
- **Modi und Umfang:** kein eigener Trainingsmodus für den Aufgabentyp aus Konzept 1a; „Gitter und
  Basis“ muss deren Schritte zeigen. Einordnung der offenen Erweiterungen (Thomas, 5.11.2026):
  - **Beugung** nicht in dieser App, sondern in einer eigenen (crystallography-common#73), weil diese App
    ein abgerundetes, geschlossenes Paket mit schon vielen Funktionen ist.
  - **Bestimmen** (zentrales Lernziel der Vorlesung): kein eigener Modus, sondern Skript und geführte
    Bestimmung (#38). Die Signatur nach Conway bestimmen nur im Skript (#85); in den Kenndaten bleibt sie.
  - **Struktur in gegebener Gruppe aufbauen** (Thomas, 9.11.2026; #121): zuerst im Modus „Gitter und Basis“ als
    Schalter „Symmetrie festhalten“. **Überholt am 11.11.2026** durch den dritten Modus (nächster Punkt).
  - **Dritter Modus „Muster entwerfen“** (Thomas, 9. und 11.11.2026, #136; Konzept `docs/konzept-muster-entwerfen.md`):
    Zeichnen und „Symmetrie festhalten“ gehören zusammen (bei gegebener Symmetrie ein eigenes Muster gestalten)
    und passten nur bedingt zu den Modi, in denen sie standen; jeder Modus hat jetzt eine Frage:
    verstehen (Ebenengruppen), analysieren (Gitter und Basis), gestalten (Muster entwerfen). Dazu: „Darstellung“ in
    allen drei Modi gleich; „Symmetrie brechen“ nur noch in „Gitter und Basis“, wo es um Symmetriebruch geht, in den
    anderen Modi nur symmetrieerhaltende Änderungen des Gitters; die Auslöschungen entfallen in den Kenndaten, weil
    sie in die Beugungs-App gehören (crystallography-common#73) und hier mehr verwirren als helfen (auch die Daten
    entfallen). Motive nach Eigensymmetrie gebündelt (ohne, nur Dreh-, mit Spiegelsymmetrie), weil ein Motiv auf einer
    speziellen Lage nur mit deren Lagesymmetrie einmal erscheint; die Ornamente werden Motive. Ein Gitterbereich für alle Modi, weil der
    engere in „Ebenengruppen“ höhere Metrik ohnehin nicht ausschloss (*b*/*a* = 1 war einstellbar). Lupe und Füllen der
    asymmetrischen Einheit in allen Modi. Gruppe und Zelle bleiben im neuen Modus fest wie in VESTA (Thomas, 11.11.2026):
    alle Bilder jedes Motivs und Strichs; zusammenfallende Bilder eines Motivs einmal, sonst überlagert; keine
    Bestimmung der Symmetrie; Striche mit derselben Farbwahl wie die Motive; der Kreis mit Komma bleibt Form des Objekts
    in „Ebenengruppen“, kein Motiv. Das ersetzt u. a. die Regel „Zusammenfallende Bilder“ und die Begründung der Grenze unten. Alle Entscheidungen mit Gründen im Konzept. Wird umgesetzt;
    bis dahin beschreiben die Punkte unten den heutigen Stand.
    **Schritt 2 (Abbau) umgesetzt am 12.11.2026** (Konzept, Abschn. 5): „Symmetrie brechen“ in „Ebenengruppen“ und die
    Auslöschungen (Spalte, Abschnitt, Daten, `verletzt`/`strukturfaktor`, Kasten in Kap. 6) sind entfernt; die
    „Reflection conditions“ der ITA nennt das Skript nur noch als Beschreibung der Seite, mit Hinweis auf die Beugung.
    Ein Gitterbereich für alle Modi: *b*/*a* 0,5–2, γ 60–150° (`GITTER_BEREICH` in `js/zustand.js`; `STRUKTUR_BEREICH`
    leitet sich davon ab). Er schliesst höhere Metrik nicht aus; in „Ebenengruppen“ bleibt die Gruppe die gewählte, die
    Metrik ist zufällig höher (z. B. *b* = *a* im rechteckigen System), und der Hinweis im Abschnitt „Gitter“ sagt es.
    Link und Speicher haben sich geändert (Bruch, MINOR, Leitfaden Abschn. 8): `brechen` und `frei` entfallen; `warum`
    heisst `herkunft` (Schlüssel mit neuer Bedeutung bekommen einen neuen Namen, hier nur der alte Name ersetzt, weil
    die Bedeutung dieselbe bleibt); die Speicherversion `SPEICHER_VERSION` steigt auf 2, ein Stand mit v1 wird verworfen.
    **Schritt 3 („Darstellung“ und Lupe in allen Modi) umgesetzt am 12.11.2026** (Konzept, Abschn. 2, Punkte 2, 9, 11,
    und Abschn. 3.4): Ein Abschnitt „Darstellung“ in eigener Karte unten in der Seitenleiste beider Modi (Nach
    Blickrichtung färben, Symmetrieelemente im Muster, Muster als Tapete, Asymmetrische Einheit füllen, Vergrösserung
    des Musters); `s-zoom` entfällt, `opt-fuell` zog aus „Selbst zeichnen“ hierher. Die Felder des Zustands sind
    dieselben in beiden Modi (`farben`, `musterElemente`, `tapete`, `aeFuell`, `lupe`, `zoomB`), im Link dieselben
    Schlüssel (`farb`, `mel`, `tap`, `fuell`, `lupe`, `zoom`; `GEMEINSAME_SCHALTER` in `js/zustand.js`); die
    Schalter nur von „Ebenengruppen“ (`el`, `obj`, `ae`, `rast`, `orbit`) stehen nicht im Link von „Gitter und Basis“.
    Das ist kein Bruch (nur neue Schlüssel), `SPEICHER_VERSION` bleibt 2. Wahl beim Umsetzen:
    - **Farben:** Der Startwert `farb=1` gilt jetzt auch in „Gitter und Basis“: Die Symmetrieelemente sind dort
      standardmässig nach Blickrichtung gefärbt (Tafel A und, mit „Symmetrieelemente im Muster“, Muster). Die
      Abbildungen im Skript und im Quiz geben `farben: false` ausdrücklich an und bleiben, wie sie waren.
    - **Tapete** in „Gitter und Basis“ (Konzept, Punkt 13): ohne konventionelle Zelle und ohne Symmetrieelemente (wie in
      „Ebenengruppen“ sperrt sie „Symmetrieelemente im Muster“, das gewählt bleibt); die Motive behalten ihre Farben,
      die gefüllte asymmetrische Einheit ist einfarbig. Die Bindungen folgen weiter ihrem eigenen Schalter („Anzeigen“),
      weil sie zur Struktur gehören, nicht zur Darstellung.
    - **Füllen** in „Gitter und Basis“: die asymmetrische Einheit der bestimmten Gruppe mit allen Bildern, gezeichnet in
      deren konventioneller Zelle (`aeFuellung` in `js/zeichnung.js`, dieselbe Rechnung wie in „Ebenengruppen“; der
      Bereich der Bilder folgt aus dem Bild, `konvBereich` in `js/struktur.js`), in Tafel A und im Muster. Ohne Motive
      gibt es keine bestimmte Gruppe: Der Schalter ist gesperrt, mit Grund, bleibt aber gewählt (Leitfaden Abschn. 5.2).
    - **Lupe:** ein Schalter in eigener Gruppe über Tafel A (nicht mehr bei Zeichnen und Radieren), in beiden Modi
      dieselbe Rechnung (`lupeAusschnitt` in `js/zeichnung.js`, LUPE-fache Vergrösserung). In „Gitter und Basis“ ist die
      Mitte das gewählte, gezeichnete Motiv, ohne Wahl die Mitte der gegebenen Zelle; während des Ziehens bleibt der
      Ausschnitt stehen (die schon vorhandene eingefrorene Ansicht `fest`) und folgt erst beim Loslassen. Tippt man ins
      Leere, springt die Ansicht zur Mitte der Zelle (Wahl aufgehoben, wie in der Konzeptregel). Die Lupe ruht dort nie:
      Erklärungen (`erklaerend`) gibt es nur in „Ebenengruppen“ und gelten nur dort (`z.modus === 'eg'`).
  **Schritt 4 in drei PRs** (Thomas, 12.11.2026; Grund: ein PR mit neuem Modus, Umbau von Skript und Quiz wäre zu gross zum
  Prüfen): **4a** Ornamente als Motive und gebündelte Motivauswahl (kein Bruch von Link und Speicher); **4b** der Modus
  `entwurf` mit Gruppenwahl, Regel für zusammenfallende Bilder, Kenndaten, Übergang; „Symmetrie festhalten“ entfällt (Bruch,
  Zustandsversion steigt); **4c** Ornamente aus „Ebenengruppen“ entfernen, Skript, Quiz, Experimente, Erste Schritte.
  **4a umgesetzt am 12.11.2026** (#104). Wahl beim Umsetzen:
    - **Ornamente als Motive** `blatt`, `tropfen`, `ranke` (`MOTIVE` in `js/motive.js`, Form `ornament`): dieselben Pfade wie
      die Form des Objekts in „Ebenengruppen“ (`ORNAMENTE` in `js/zeichnung.js`, gezeichnet von `ornamentSVG`). Das Motiv
      liegt auf der Mitte des Rechtecks um die Pfadpunkte (`ornamentMitte`), nicht auf dem Fuss: Um die Mitte dreht es sich
      und lässt sich greifen wie die übrigen Motive. Eine lokale Einheit sind `ORNAMENT_EINHEIT` = 13 Bildpunkte der Pfade
      (das Ornament ist etwa zwei Einheiten hoch wie das Fähnchen), die Standardgrösse 0,1 wie beim Fähnchen.
    - **Kennzeichnende Punkte:** je Ornament 4 oder 5 Punkte seiner Pfade (Fuss, Spitze, Ansatz …), jeder mit eigener Art
      (`o0`, `o1` …). Eine Symmetrie müsste jeden Punkt auf sich selbst abbilden, und das tut bei drei Punkten, die nicht auf
      einer Geraden liegen, nur die Identität; so täuschen sie keine Symmetrie vor. Der Test prüft Art, Lage und, dass jedes
      Ornament allein, gedreht und gespiegelt, in verschiedenen Gittern *p*1 ergibt.
    - **Motivauswahl:** `MOTIVZEILEN` (Daten, `js/motive.js`) ordnet die Motive den vier Zeilen zu (Atom; ohne Eigensymmetrie;
      nur Drehsymmetrie; mit Spiegelsymmetrie), ein Test prüft die Zeilen gegen `symmetrie`. Die Knöpfe zeigen ein kleines
      Bild (`motivSymbol` in `js/struktur.js`, in der Farbe der gewählten Atomsorte über die CSS-Variable `--mf`), mindestens
      40 px; Name und Punktgruppe stehen im Tooltip und im `aria-label`, die Zeile als `aria-labelledby`, das ⓘ nennt die
      Zeilen. Das Menü `s-motiv` ist jetzt eine Gruppe von Knöpfen mit derselben Kennung.
    - **Ornamente bleiben vorerst Form des Objekts** in „Ebenengruppen“ (bis 4c); die Skriptabbildungen ändern sich in 4a
      nicht. Die Gruppenwahl im Modus „Muster entwerfen“ kommt in 4b; die gebündelte Auswahl gilt dort mit denselben
      Bausteinen.
  - Escher #86 und #37, Oberflächen #39, zweifarbige Muster #40.
- **„Symmetrie festhalten“ in „Gitter und Basis“** (Thomas, 9.11.2026, #121; Ort und Gründe unter „Modi und
  Umfang“; Format von Link und Speicher im README). Mit „Wahl beim Umsetzen“ markiert, was aus dem Review des
  PR #127 dazukam (von Thomas bestätigt, 9.11.2026):
  - **Spiegelbilder:** Ein Basiseintrag hat neben `winkel` das Feld `spiegel` (Spiegelung an der eigenen
    *y*-Achse des Motivs, vor der Drehung). So ist jede Orientierung darstellbar, auch die Bilder chiraler Motive
    (Fähnchen, Windräder) unter Spiegel- und Gleitspiegellinien. Alle achiralen Motive sind zu dieser Achse
    symmetrisch (Test); bei ihnen entfällt das Feld, und der Schalter „gespiegelt“ ist gesperrt. Er wirkt auch
    ohne festgehaltene Symmetrie. Im Link ein optionales letztes Feld `m` in `basis=` (ohne `m` ist das
    Motiv nicht gespiegelt). Wechselt ein gespiegeltes Motiv zu einem achiralen, entfällt das Feld (Wahl beim Umsetzen): Anders als
    bei einem Schalter, der nur ruht (Leitfaden Abschn. 5.2), gibt es dann nichts, was ruhen könnte, denn das
    Spiegelbild ist dasselbe Motiv.
  - **Gespeichert** wird je Bahn ein Vertreter und die Gruppe (Link `sg=<Symbol>`, Speicher `festeGruppe`), nicht
    alle Motive: Nur so bleibt eine Bahn beim Ziehen über eine spezielle Lage zusammen (dort fallen Bilder zusammen
    und trennen sich wieder). Ohne `sg` enthält `basis=` alle Motive. Ausschalten schreibt die Bahnen
    aus. Das Gitter folgt dem System der Gruppe, im Bereich der Regler von „Gitter und Basis“; so kann zufällige
    Zusatzsymmetrie entstehen (z. B. *p*2*mm* mit *b*/*a* = 1 → *p*4*mm*).
  - **Einschalten:** zuerst gegebenenfalls die Übernahme (nächster Punkt), dann wird jedes Motiv Vertreter; Motive,
    die schon Bild eines früheren sind (gleiches Motiv, Farbe, Grösse, Lage, Orientierung), gehen darin auf, bei der
    bestimmten Gruppe also alle bis auf die Vertreter. Verglichen wird mit der Toleranz der Bestimmung, und die
    Vertreter rasten dabei auf spezielle Lagen ein (Wahl beim Umsetzen): Was die Bestimmung als symmetrisch erkennt,
    soll auch ganz zusammenfallen, statt fast deckungsgleiche Bahnen zu doppeln.
  - **Übernahme der bestimmten Gruppe:** Die festgehaltene Gruppe steht in der gegebenen Zelle in der
    Aufstellung nach ITA. Weicht die konventionelle Zelle oder der Ursprung ab, rechnet die Übernahme die Struktur
    um (*b*/*a*, γ, Lagen, Winkel und Grösse der Motive). Mit anderer Zelle dreht sich das Bild, weil *b* immer
    waagrecht liegt; mit anderem Ursprung verschiebt es sich nur. Die Kenndaten nennen die Umstellung. Unter den Vorgaben betrifft das `dreieck3`, `fisch` (Ursprung) und
    `drittel`, `flecht` (Zelle). Wahl beim Umsetzen: Liefert die Bestimmung eine linkshändige Zelle (z. B. −*a*,
    *b*; je nach Rundung schon bei γ = 60°), wird sie vorher rechtshändig gemacht (*a*′ → −*a*′, hexagonal *a*′ ↔
    *b*′), sonst wäre das Bild gespiegelt; *b*/*a* und γ werden exakt nach dem System gesetzt. Liegen danach Metrik
    oder Grösse eines Motivs ausserhalb der Regler, ist die Übernahme gesperrt.
  - **Grenze:** `BASIS_GRENZE` = 48 gilt für die ausgeschriebenen Motive. Ein Vertreter zählt mit der Zähligkeit
    der allgemeinen Lage, wo er auch liegt (*p*6*mm*: 4 Vertreter, *c*2*mm*: 6). Gründe: Die Bestimmung läuft bei
    jedem Bild des Ziehens und kostete bei 48 Windrädern 6 etwa 0,1 s, bei 96 etwa 0,36 s (gemessen 9.11.2026, Cloud);
    und Ziehen von einer speziellen Lage weg kann die Grenze so nie überschreiten. Wahl beim Umsetzen: Einschalten
    und Wahl einer Gruppe sind gesperrt (mit Grund), solange die Grenze damit überschritten würde; beim Lesen aus
    Link und Speicher fallen überzählige Vertreter am Ende weg, wie heute überzählige Motive.
  - **Ungültig aus Link oder Speicher** (Wahl beim Umsetzen, Leitfaden Abschn. 5.2: nicht umdeuten): unbekanntes
    Symbol, `sg` ohne `basis=` oder ein Gitter, das nicht zum System der Gruppe passt, ergeben die Struktur der
    Vorgabe `v`, nicht festgehalten. Die Vertreter gelten nie als ganze Basis. „Passt“ heisst: innerhalb der
    Genauigkeit des Links (*b*/*a* auf 0,0005, γ auf 0,005°); dann gilt der exakte Wert des Systems. Mit
    festgehaltener Symmetrie gleicht die Struktur nie ihrer Vorgabe, der Link enthält also immer `basis=`.
  - **Orientierung der Bilder:** Drehanteil *K* der Operation kartesisch (`kartMatrix`): *D*(*w*′) *S*^*s*′ =
    *K* *D*(*w*) *S*^*s* mit der Drehung *D* und der Spiegelung *S* an der eigenen *y*-Achse, also *s*′ = *s* XOR
    (det *K* < 0); *w*′ aus dem Bild der *y*-Achse des Motivs (zweite Spalte), die *S* festlässt. Motiv, Farbe,
    Grösse und Winkel gelten für die ganze Bahn. Ziehen an einem Bild verschiebt den Vertreter über die
    Umkehroperation; ist ein Bild gewählt, zeigen Winkel und „gespiegelt“ das Bild, und Änderungen gehen ebenso
    über die Umkehroperation an den Vertreter (Wahl beim Umsetzen). Einrasten zuerst auf spezielle Lagen (`lage()`,
    Toleranz in Pixeln wie im Modus „Ebenengruppen“), sonst auf das 1/12-Raster.
  - **Bedienung** (Wahl beim Umsetzen, #134; von Thomas bestätigt, 9.11.2026): eigener Abschnitt „Symmetrie festhalten“ zwischen „Basis“ und „Gitter“.
    Einschalten hält die bestimmte Gruppe fest; die Gruppenwahl (Knöpfe je Kristallsystem wie im Modus
    „Ebenengruppen“) wirkt nur bei eingeschaltetem Schalter; „Bestimmte Gruppe übernehmen“ ist nur frei, wenn die
    Bestimmung abweicht. Grund: Einschalten und Übernehmen tun dasselbe, aber je nur in einem Zustand, also kein
    zweiter Weg zum selben Ergebnis (Leitfaden Abschn. 5.2). Mit festgehaltener Gruppe sind die Gitterregler
    gesperrt, die das System festlegt, und von „Metrik setzen“ nur, was nicht ins System passt (in *p*2*mm* bleibt
    *b* = *a* frei: zufällige Zusatzsymmetrie). Die Wahl einer anderen Gruppe führt die gezeichneten Motive unter
    ihr wieder auf Vertreter zurück, wie das Einschalten. Liegt ein gewähltes Bild auf einer speziellen Lage, zeigt
    die Auswahl das dort gezeichnete Bild (Review #134: sonst zeigten die Regler ein unsichtbares Bild).
  - **Hilfen** (Thomas, 9.11.2026): vorerst keine Quizfragen zu „Symmetrie festhalten“, weil das Quiz allgemeine
    Konventionen abfragt und die Bedingung „Motiv auf spezieller Lage braucht deren Lagesymmetrie“ schon Fragen zu
    Kap. 6 prüfen; zwei Experimente: Fähnchen bzw. Windrad 4 auf dem Drehpunkt von *p*4 (`festhalten-lage`), *p*2*mm*
    mit *b* = *a* (`festhalten-metrik`). Die Bedienung prüft ein Browserlauf (`tools/festhalten-pruefen.mjs`), weil
    die Tests ohne Browser laufen (Leitfaden Abschn. 9); er läuft in der CI im Job `pdf` mit, der Chromium schon hat
    (Review #135).
  - **Zusammenfallende Bilder** auf einer speziellen Lage: Nur eines bleibt, das Bild der Identität, wie ein Atom
    auf einer speziellen Lage. Passt die eigene Symmetrie des Motivs nicht zur Lagesymmetrie, ergibt die
    Bestimmung deshalb eine niedrigere Gruppe; die Kenndaten nennen die Lage. Verworfen: alle Bilder überlagert
    (wie eine Fehlordnung), denn dann ergäbe die Bestimmung immer die festgehaltene Gruppe.
- **Bilder:** nur selbst erzeugte, keine Fotos. Escher nur beschreiben und verlinken (Werke geschützt).
- **Dreiecksbeispiel:** Spitzen entlang *b*, damit die Symbole ohne Umrechnung der ITA-Standardaufstellung
  entsprechen. Drei Stufen pm → cm → p2mg (fester Testfall).
- **Begriff „rechteckig“** (wie Hoffmann); „rechtwinklig“ nur als Bezeichnung bei Borchardt-Ott.
- **Quizbilder:** Symbole, Linien und Achsennamen einheitlich: `K_FRAGE` 1,8, `K_ANTWORT` 2,
  `K_MUSTER` 1,15, `K_SKIZZE` 1,25 (Kachel 1, sie füllt das Bild) in `js/quiz-bild.js`; Fähnchen nur im Muster (Tafel B) mit `K_MUSTER`,
  in Tafel A folgen sie dem Gitter (nächster Punkt). Atomgrösse in Strukturbildern bleibt vorerst.
- **Grösse des Objekts im Gitter** (5.11.2026): Fähnchen, Komma und Ornament sind wie eine Zeichnung und
  die Motive der Basis im Gitter festgelegt (`objektMassstab` in `js/zeichnung.js`), in beiden Tafeln, in
  der Lupe und bei 2 × 2 Zellen im selben Verhältnis zur Zelle. Grund: In Bildpunkten war das Objekt im
  Muster 2- bis 3-mal so gross wie im Gerüst; ein Muster liess sich nicht gezielt aufbauen, besonders mit
  „Zeichnen“. Thomas wählte, dass das Muster bleibt (Skript-Abbildungen, Quizbilder, `og`); im Gerüst wird das
  Objekt grösser, der Rand wächst, bis ein Objekt mit dem Fuss auf dem Zellrand ganz sichtbar ist (gleich für
  jede Lage, damit sich die Ansicht beim Ziehen nicht ändert). Die Lupe vergrössert das Objekt mit (Thomas).
  Ausnahme: Erklärungen im Symmetriegerüst (nächster Punkt).
- **Erklärungen im Symmetriegerüst** (5.11.2026, Thomas): In „Schritt für Schritt“, „Aufbau aus Erzeugenden“
  und „Herkunft der Elemente“ zeigt das Gerüst das Objekt in fester Grösse (wie ihre Fähnchen; meist kleiner
  als im Gitter), ohne eigene Zeichnung und gefüllte asymmetrische Einheit (im Muster bleiben sie); Zeichnen,
  Radieren, Füllen und Lupe ruhen (`erklaerend` in `js/zeichnung.js`). Nach Leitfaden Abschn. 5.2 werden die
  Werkzeuge Zeichnen und Radieren abgewählt, die Schalter „Füllen“ und Lupe bleiben gewählt und wirken beim
  Verlassen wieder. Grund: Mit grossem Objekt, Zeichnung oder Lupe erkennt man die Elemente und Wege nicht
  mehr; die Lupe braucht man nur zum Zeichnen, Radieren und Setzen. Der Zustand gilt sofort beim Einschalten,
  damit das Objekt nicht erst beim Wählen eines Elements kleiner wird. „Herkunft der Elemente“ überdeckt
  „Schritt für Schritt“, schon beim Einschalten, nicht erst mit gezeigtem Element (die Erklärung zeigt statt
  der Bilder des Objekts ihre eigenen Fähnchen, Schritte wären unsichtbar); es ruht dann, solange „Herkunft
  der Elemente“ wirkt (eingeschaltet, mit Symmetrieelementen) (Schalter, Leitfaden Abschn. 5.2; Thomas,
  5.11.2026). Der Aufbau lässt sich mit der Herkunft kombinieren.
- **„Herkunft der Elemente“** (5.11.2026, Thomas; früher „Warum ist das da?“): Schalter im Abschnitt „Aufbau
  aus Erzeugenden“, nicht Knopf über dem Gerüst. Grund: Über dem Gerüst stehen die Werkzeuge Zeichnen und
  Radieren und der Schalter Lupe, die dem Gestalten dienen; dieses erklärt die Symmetrieelemente wie der
  Aufbau, mit dem es sich kombinieren lässt. Der alte Name sagte nicht, worauf er sich bezieht. Zustand
  `herkunft`, Link `herkunft=1`, Datei `js/herkunft-text.js` (die Texte; `js/herkunft.js` rechnet) und die
  Bedienelemente `opt-herkunft`, `row-herkunft` heissen wie der Schalter (12.11.2026, Altlast aus der Zeit von
  „Warum ist das da?“; nach Leitfaden Abschn. 8 ohne Umrechnung alter Links). Ist es aus Speicher oder Link aktiv,
  klappt sein Abschnitt beim Start auf; ohne Elemente ist es gesperrt, bleibt aber gewählt.
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
    `zeichnung.js`; Zeichnungsgeometrie, Ort der Ornamente klärt #104), Schriften in `skizzen.js`, die
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
  Stand mit anderer Version wird verworfen. Frühere Werte werden nicht umgerechnet (`ebenen-intro` aus v1.0 mit „1“
  gilt als unbekannter Modus: die Ersten Schritte erscheinen einmal).
- **Bildangaben im Quiz:** `#…` Tafel A, `B#…` Tafel B (Muster); Endung `@k` setzt die Symbolgrösse;
  `skizze:3m|2mm|4mm|6mm|kachel-p2` sind Skizzen aus dem Skript (`kachel-p2` ohne Drehpunkte, Abb. 7.6c). Zerlegen nur mit `zerlege()` aus
  `js/quiz-bild.js` (`hashAnwenden` verträgt das `@` nicht).
- **Matrizen und Vektoren in Quiztexten** nur mit `mat()` aus `js/quiz-bank.js` (`<span>` mit
  `display: inline-table`). Keine Blockelemente in Frage- und Erklärtexten (Test): Ein `<table>`
  schliesst das umgebende `<p>` in Prüfliste und Moodle-Export.
- Hilfen in `js/quiz-bank.js`: `ov()` Querstrich, `sym()` Symbol kursiv, `LZ` sammelt die Lernziele.
- Bindungen im Modus „Gitter und Basis“ aus der periodischen Zelle (`bindungenBasis`); ersetzt die
  frühere quadratische Suche (225 Fälle gleich).
- **Link-Adressen** sind Schnittstelle (Leitfaden Abschn. 8), aber noch nicht stabil: Die App ist in Entwicklung, ein
  Bruch von Link oder Speicher ist erlaubt (MINOR, im CHANGELOG unter „Geändert“ mit Hinweis), alter Code zum Umrechnen
  entfällt; stabil werden sie mit der endgültigen Form der App (Entscheidung Thomas, noch offen). Die Werte stehen in `js/zustand.js`
  (`SCHALTER`, `FORMEN`, `ZOOM_BEREICH`, `OBJ_BEREICH`). Zur Stereo-App verlinkt die App mit deren
  Parameter `blick=1–3` die 10 polaren Punktgruppen.

## Fallstricke

- **Lokale Tests mit HTML-Fragmenten** laufen im Quirks-Modus; Fehler wie `<table>` in `<p>` zeigen sich
  erst im Standards-Modus.
- **Ornamente** (z. B. „Blatt“) haben keine eigene Symmetrie (chiral; `ORNAMENTE` in `js/zeichnung.js`).
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
der Fortschritt steht in Issues und PRs. Den dritten Modus beschreibt `docs/konzept-muster-entwerfen.md` (#136).
