# Konzept: 2D-App „Symmetrie in der Ebene“ (Entwurf)

> **Status (geprüft 3.11.2026, nachträglich ergänzt):** Laufendes Konzept; erstes Release v1.0.0 umgesetzt. Abweichungen vom Text:
> - Abschn. 10: Das erste Release enthielt bereits Quiz-Stufe 3 (100 Fragen, 11 Generatoren), das Skript-PDF und den Moodle-Export; „Danach: Quiz Stufe 3, PDF, Moodle-Export“ ist damit erledigt.
> - Entscheidung 20 nennt 20 Vorgaben; heute sind es 25 (`js/vorgaben.js`).
> - Grundlage „Leitfaden (claude/leitfaden-familie.md)“: heute `LEITFADEN.md` in crystallography-common.
> - „Warum ist das da?“ heisst seit #72 „Herkunft der Elemente“ und ist ein Schalter im Abschnitt „Aufbau aus Erzeugenden“, nicht mehr ein Werkzeug über dem Symmetriegerüst.
> - Die Statusabsätze am Ende sind ein Verlauf bis 3.11.2026; Fortschritt steht künftig in Issues und PRs, nicht hier.
> - Offene Punkte als Issues: Formelsatz Kap. 9 #35, Beugung und zweites Release #36, Modus „Bestimmen“ und Kap. 8 #38 (nach dem zweiten Release, Abschn. 10), Escher-Kacheln #37, Oberflächen #39, zweifarbige Muster #40, Erste Schritte und Hilfeseite #56 (ersetzt das Tutorial), externe Gegenprüfung #33.
> 
> Dieses Konzept wird für die noch offenen Teile (Beugung, „Bestimmen“, Erweiterungen) weiter genutzt: Neue Entwurfsentscheidungen kommen hier hinzu, der Fortschritt nicht.
>
> Bei Widerspruch gelten `CLAUDE.md` und der `LEITFADEN.md` von crystallography-common; offene Punkte stehen in den GitHub Issues.

Stand 3.11.2026, Abend, neunter Entwurf (zuletzt ergänzt: erstes Release v1.0.0, Entscheidungen 31–34; Status Ende Abschnitt 13). Er enthält die Entscheidungen von Thomas vom 30.10. bis 3.11. (Abschnitt 12); offene Fragen stehen in Abschnitt 13.

Grundlage:
- Vorlesung HS 2026: Kap. 6, 7 und 9
- Hoffmann, *Faszination Kristalle und Symmetrie* (2016), Kap. 4, mit Abschn. 1.9, 2.3, 2.7 und 6.1: Didaktik und Anregungen
- Borchardt-Ott & Sowa (2018), Abschn. 7.1–7.2, 10.1–10.2: Begriffe
- ITA Vol. A (2006), Abschn. 2.2.6.1 und Part 6 (die 17 Ebenengruppen, S. 92–109): Konventionen und Daten
- Python-App `oxrd.py` aus dem Beugungsexperiment der Vorlesung (Tzschaschel, Lehmann, 2018): Punktmuster für die Laserbeugung, nur als Anregung für Abschnitt 3.3
- Leitfaden der App-Familie (claude/leitfaden-familie.md)
- Conway, Burgiel, Goodman-Strauss, *The Symmetries of Things* (A K Peters/CRC Press 2016, E-Book der Ausgabe von 2008; in Zotero), Kap. 1–3, 5 und 11: visueller Zugang über Ornamente, Orbifold-Signatur (Abschnitt 1c)

## 1. Ziel und Rolle

- Lern-App zur **Symmetrie periodischer Muster in der Ebene** mit Schwerpunkt auf den **17 Ebenengruppen**. Das 2D-Gitter ist der Einstieg, nicht der Kern.
- In 2D lassen sich alle Begriffe der Raumgruppen anschaulich zeigen, ohne die dritte Dimension: Gitter, Zentrierung, gekoppelte Operation, Punktlage, Wyckoff-Lage, asymmetrische Einheit, Lesen einer ITA-Seite. Die 3D-App baut später darauf auf.
- Wie die Stereo-App mit App, Skript und Quiz:
  - Begriffe nach Borchardt-Ott, Didaktik und Beispiele nach Hoffmann, Symbole, Diagramme und Daten nach ITA
  - ohne die Vorlesung verständlich, die Herkunft aus der Vorlesung wird genannt

## 1a. Was die App mindestens vermitteln muss

Ein typischer Aufgabentyp (Thomas, 30.10.2026) zeigt ein 2D-Muster oder eine 2D-Kristallstruktur und fragt:
- Elementarzelle erkennen und Gittervektoren angeben
- Symmetrieelemente in der Elementarzelle einzeichnen
- die asymmetrische Einheit finden
- Das Motiv wird geändert: Wie ändert sich die Symmetrie? Neue Elementarzelle, neue Symmetrieelemente usw.

Die App braucht dafür **keinen eigenen Trainingsmodus**. Sie muss aber genau diese Schritte sichtbar und nachvollziehbar machen: vor allem im Modus „Gitter und Basis“ (Abschnitt 3.2), wo man die Basis ändert und die App die neue Symmetrie, Elementarzelle und asymmetrische Einheit zeigt.

## 1b. Drei Blickrichtungen auf die Symmetrie (Thomas, 30.10.2026)

Für Anfänger ist vieles nicht sofort einsichtig. Die App soll deshalb drei Wege anschaulich machen:

1. **Erzeugen:** Wie bauen die Symmetrieoperationen bei gegebener Ebenengruppe aus einem Motiv an einer gewählten Lage die ganze Struktur auf? Was haben allgemeine und spezielle Lagen und die asymmetrische Einheit damit zu tun? → Abschnitt 3.1, „Schritt für Schritt“.
2. **Umkehren:** Wie ändert sich die Symmetrie, wenn ich das Motiv, seine Lage oder die Gitterparameter ändere? → Abschnitt 3.1, „Symmetrie brechen“, und Abschnitt 3.2.
3. **Bedingen:** Warum folgen aus einigen Symmetrieelementen zwangsläufig weitere? Zum Beispiel: Warum hat p4mm auch diagonale Gleitspiegellinien? Warum entstehen bei bestimmter Lage des Motivs Symmetrieelemente, die man nicht hineingesteckt hat? → Abschnitt 3.1, „Erzeugende“ und „Warum ist das da?“.

## 1c. Ästhetischer Zugang (Thomas, 1.11.2026)

App und Skript sehen die Symmetrie in der Ebene bisher eher formal: Gitter, Operationen, Symbole, ITA. Hoffmann und Conway gehen visuell und ästhetisch vor:
- **Hoffmann, Kap. 4** zeigt ein persisches Ornament (Abb. 4.5, S. 132), Mauerwerk, Fliesen, Mosaiken der Alhambra und Eschers Symmetriezeichnungen (Abschn. 4.2.3, S. 141–146) und nennt Zeichenwerkzeuge (Abschn. 4.3, S. 152). Er weist darauf hin, dass im Englischen *wallpaper group* verbreiteter ist als *plane symmetry group* (S. 141).
- **Conway** arbeitet durchgehend mit ornamentartigen Mustern. Statt Gitter und Operationen beschreibt er ein Muster durch vier Merkmale, die man im Bild sucht: Kaleidoskope (Spiegellinien und ihre Schnittpunkte), Drehpunkte, die auf keiner Spiegellinie liegen (*gyrations*), *miracles* (×: ein Weg von einem Punkt zu einer spiegelbildlichen Kopie, ohne eine Spiegellinie zu kreuzen; entspricht einer Gleitspiegelung, die nicht aus Spiegelungen folgt) und *wonders* (○: nur Translationen, wenn keines der anderen Merkmale vorkommt, also p1) (Kap. 2, Tab. 2.1, S. 27). Daraus entsteht die Signatur (Orbifold-Symbol), z. B. \*632 für p6mm, 4\*2 für p4gm, 22\* für p2mg. Jedes Zeichen hat einen „Preis“; die Signaturen der Ebenenmuster sind genau die mit Gesamtpreis 2 (Magic Theorem, S. 29–30). Daraus folgen die 17 Typen mit einfacher Arithmetik (S. 33–40, Tab. 3.2). Ein Vorgehen in vier Schritten bestimmt die Signatur eines Musters (S. 30–31); Übungsmuster S. 42–49.

**Ziel:** Diesen Aspekt mindestens im Skript in einem eigenen Kapitel behandeln (Abschnitt 6) und prüfen, was sich davon in der App umsetzen lässt (Abschnitt 3.6). Der formale Kern (ITA, Wyckoff-Lagen, Struktur bestimmen) bleibt; der ästhetische Zugang ergänzt ihn als Einstieg und Motivation.

## 2. Was die Quellen beitragen

**Hoffmann, Kap. 4** (didaktischer Leitfaden):
- **Einstieg über Alltagsmuster:** Tapeten, Stoffe, Fliesen, Mauerwerk, Alhambra, Escher. Es gibt unendlich viele Muster, aber nur 17 Symmetrien (S. 130–131).
- **Gleitspiegelung an Fussspuren:** auf einem Bein hüpfen = Translation, Känguru = Spiegelung, normal gehen = Gleitspiegelung (Abb. 4.7–4.9). So auch in der Vorlesung. Weitere Beispiele: Achter-Ruderboot, Zagros-Molch.
- **Symbole lesen:** Zentrierung, höchste Zähligkeit, Spiegel- bzw. Gleitspiegellinie senkrecht zur 1. und 2. Blickrichtung; Lang- und Kurzform für alle 17 Gruppen (Tab. 4.1); Blickrichtungen je System (Tab. 4.2).
- **Ebenengruppe bestimmen:** Flussdiagramm nach Sanderson mit fünf Leitfragen (Abb. 4.14), vorgeführt an einem Muster bis zur eingezeichneten Elementarzelle (Abb. 4.15–4.18, p2mg).
- **Mauerwerksverbände** (märkisch, gotisch, flämisch, Kreuzverband) als Übung: „Welche Ebenengruppe?“ (Abb. 4.19).
- **2D-Gitter von Kristallflächen:** Flächen (100), (110), (111), (211) der kubischen Gitter (primitiv, innenzentriert, flächenzentriert, Abb. 4.25–4.27) und das hexagonale Gitter, mit Bezug zur Katalyse (Abschn. 4.2.4). Das ist die Brücke zur Stereo-App (Kristallflächen) und zur 3D-App.
- **„Werden Sie kreativ“:** Werkzeuge, mit denen man in einer gewählten Symmetrie zeichnet (Abschn. 4.3: Kali, Escher Web Sketch, Morenaments, Symmetry Artist, Weave Silk, GeCla).
- Weitere Abschnitte: Gitter und Motiv (1.9); Wahl der Elementarzelle, primitiv und zentriert (2.3); Bienenwabe ist kein Gitter (2.7); Allgemeine-Lagen-Diagramm und asymmetrische Einheit am Beispiel Pmm2 (6.1.3–6.1.4).

**Conway et al., *The Symmetries of Things*** (visuell, ohne Koordinaten):
- Muster aus Ornamenten, Fotos von Friesen und Fassaden (Kap. 1, S. 7–13); Friesmuster (Kap. 5, S. 67).
- Die vier Merkmale und die Signatur (Kap. 2); Magic Theorem und die 17 Typen (Kap. 3). Die Begründung der 17 ist anschaulicher als die übliche über Gitter und Punktgruppen und eine gute Ergänzung zu Skript Kap. 5.
- Die Signatur sagt direkt, was man im Muster suchen muss, und ist damit auch ein Bestimmungsverfahren (Alternative oder Ergänzung zum Flussdiagramm nach Sanderson).
- Zweifarbige und mehrfarbige Muster (Farbsymmetrie, Teil II, Kap. 11–13, S. 135–169). Zweifarbige Muster sind dasselbe Konzept wie die Schwarz-Weiss-Gruppen und damit die magnetischen Gruppen.

**Borchardt-Ott, Abschn. 10.2** (formal):
- Fünf Netzebenen in vier Achsensystemen.
- Die Symbole der Netzebenen p2, p2mm, c2mm, p4mm, p6mm.
- c2mm, p4mm und p6mm haben zusätzliche Gleitspiegellinien, die das Symbol nicht nennt.
- Motive niedrigerer Symmetrie auf den Gitterpunkten ergeben die Untergruppen (Abb. 10.9: quadratisches Gitter mit Motiven 4mm, 4, 2mm, 2 → p4mm, p4, p2mm, p2).
- Die 10 ebenen Punktgruppen; Tab. 10.1 mit allen 17 Gruppen.
- Begriffe: Netzebene, Elementarmasche, Drehpunkt, Spiegellinie, Gleitspiegellinie.

**ITA Vol. A:**
- Abschn. 2.2.6.1: zwei Diagramme je Ebenengruppe, *a* nach unten, *b* nach rechts.
- Part 6: je Gruppe
  - Diagramm der Symmetrieelemente und der allgemeinen Lage (Kreise, mit Komma für das Spiegelbild)
  - Ursprung und asymmetrische Einheit
  - Symmetrieoperationen und Erzeugende
  - Wyckoff-Lagen mit Lagesymmetrie (orientiertes Symbol) und Koordinaten
  - Auslöschungsbedingungen
  - maximale Untergruppen und minimale Obergruppen
- Grundlage für die Daten der App und für „ITA lesen“ (die Vorlesung bietet dazu eine eigene Einführung an).

**Vorlesung:**
- Fähnchen als Objekt in allgemeiner Lage
- Wyckoff-Tabelle p2mm mit Freiheitsgraden
- Spiegellinien nach Richtung gefärbt
- Ornamente mit Elementarmotiv
- Hase, Würfelseite, Dreierpfeil als Motive

## 3. Modi

Aufbau wie die Stereo-App: Seitenleiste links, zwei Tafeln, Kenndaten darunter.

### 3.1 Modus „Ebenengruppen“ (Kern)

- **Auswahl:** 17 Knöpfe nach Kristallsystem (schiefwinklig 2, rechteckig 7, quadratisch 3, hexagonal 5).
- **Tafel A „Symmetriegerüst“:** Elementarzelle (wahlweise 2 × 2 Zellen) mit allen Symmetrieelementen nach ITA:
  - Drehpunkte (Linse, Dreieck, Quadrat, Sechseck), Spiegellinien kräftig, Gleitspiegellinien gestrichelt
  - Färbung nach Blickrichtung wie in der Stereo-App
  - Objekt in allgemeiner Lage, ziehbar; wahlweise als Fähnchen (Vorlesung) oder als Kreis mit Komma (ITA)
  - **Einrasten auf spezielle Lagen**, dazu Wyckoff-Lage, Lagesymmetrie, Zähligkeit und Freiheitsgrade
  - **Asymmetrische Einheit** einblendbar
  - **Element antippen:** zeigt die Operation am Objekt, z. B. die Gleitspiegelung als Spiegelung mit anschliessender halber Translation, mit Pfeil
- **Tafel B „Muster“:** dasselbe Motiv über viele Zellen (Tapete), Elementarzelle hervorgehoben, Symmetrieelemente einblendbar.
  - Motive: Fähnchen; Kreis mit Komma; einige eigene ornamentartige Motive (selbst gezeichnet, nichts aus Büchern)
  - **„Selbst zeichnen“:** Striche in der Tafel werden mit allen Operationen der Gruppe vervielfältigt (nach dem Vorbild der Werkzeuge in Hoffmann 4.3). Das ist motivierend und zeigt unmittelbar, was eine Ebenengruppe tut.
- **Schritt für Schritt** (Blickrichtung 1):
  - Man setzt ein Motiv an eine Lage und wendet die Operationen einzeln an, mit Animation: zuerst die Operationen der Punktgruppe bzw. die Repräsentanten (wie in der Liste der ITA-Seite), dann die Translationen.
  - Ein Zähler zeigt die Kopien je Elementarzelle; bei allgemeiner Lage ist das die Zähligkeit der Gruppe.
  - Liegt das Motiv auf einer speziellen Lage, fallen Kopien aufeinander: Die Zähligkeit sinkt, und das Motiv muss selbst die Lagesymmetrie haben. Ein Fähnchen auf einem Spiegel wird mit seinem Spiegelbild überlagert; das zeigt, warum.
  - Asymmetrische Einheit: Füllt man sie (z. B. mit „Selbst zeichnen“), erzeugen die Operationen daraus genau das ganze Muster, ohne Lücken und Überlappungen.
- **Erzeugende und „Warum ist das da?“** (Blickrichtung 3):
  - Man wählt Erzeugende, z. B. Translationen, einen 4-zähligen Drehpunkt und eine Spiegellinie. Die App ergänzt alle Folgen. Was neu dazukommt, ist anders eingefärbt und erscheint nacheinander.
  - Antippen eines Elements zeigt, aus welchen zwei Operationen es folgt, mit Animation am Fähnchen: erst die eine, dann die andere Operation, Ergebnis wie die dritte.
  - Regeln, die man dabei sieht (Borchardt-Ott, Hoffmann):
    - Drehung + Translation = Drehung um einen verschobenen Punkt (2-zählig: in der Mitte der Translation)
    - Spiegelung + Translation senkrecht dazu = parallele Spiegellinie im halben Abstand
    - Spiegelung + Translation schräg dazu = Gleitspiegellinie
    - zwei Spiegellinien im Winkel α = Drehung um 2α
  - Beispiel p4mm: Die diagonale Spiegellinie verknüpft mit der Translation a ergibt die diagonale Gleitspiegellinie durch (½, 0) mit Gleitkomponente (a + b)/2.
  - Beispiel c2mm: Spiegellinie + Zentrierungstranslation ergibt die Gleitspiegellinien zwischen den Spiegellinien, obwohl das Kurzsymbol keine nennt.
- **Symmetrie brechen** (Blickrichtung 2):
  - **Gitterparameter** (a, b, γ) sind innerhalb des Systems frei; die Symmetrie bleibt erhalten.
  - Löst man die Bindung (z. B. a ≠ b in p4mm), zeigt die App die verbleibende Untergruppe (hier p2mm) und welche Elemente wegfallen.
  - Ebenso, wenn man ein Motiv mit geringerer Symmetrie auf eine spezielle Lage setzt oder es verdreht.
- **Kenndaten** (aufgebaut wie eine ITA-Seite, damit man diese lesen lernt):
  - Kurz- und Langsymbol, Nummer, Kristallsystem, Bravais-Gitter
  - Punktgruppe mit Link in die Stereo-App
  - Ursprung, asymmetrische Einheit, Symmetrieoperationen, Wyckoff-Tabelle
  - Vertiefung: symmorph oder nicht, Unter- und Obergruppen

### 3.2 Modus „Gitter und Basis“ (2D-Kristallstruktur; Stoff von Kap. 6 und 7)

- **Tafel A „Struktur“:** Gitter (a, b, γ) mit einer Basis aus einem oder mehreren Atomen.
  - Atome mit Art (Farbe, Grösse); im Bild ziehen, hinzufügen, entfernen.
  - Auch Motive mit eigener Symmetrie (1, 2, m, 2mm, 3, 3m, 4, 4mm, 6, 6mm) lassen sich setzen.
  - **Die App bestimmt aus Gitter und Basis die Symmetrie der Struktur:**
    - Ebenengruppe, Kristallsystem und Bravais-Gitter (auch, wenn die Basis eine kleinere Elementarzelle oder eine Zentrierung erzeugt)
    - konventionelle Elementarzelle mit Gittervektoren
    - Symmetrieelemente in der Zelle
    - asymmetrische Einheit
    - Lagen der Atome (Wyckoff-Lage, Lagesymmetrie)
  - Ändert man die Basis oder die Gitterparameter, ändert sich das alles sichtbar. Ein Hinweis nennt, was sich geändert hat (z. B. „p4mm → p2mm: die 4-zähligen Drehpunkte sind weggefallen“). Das ist der Kern des Aufgabentyps in Abschnitt 1a.
  - Auch der umgekehrte Fall: Die Anordnung der Motive kann Symmetrieelemente erzwingen, die man nicht beabsichtigt hat. Die App zeigt dann, aus welchen Operationen sie folgen (wie „Warum ist das da?“ in 3.1).
  - **Leitbeispiel** (Anlass: Hoffmann Abb. 5.37b, dort mit P4mm bezeichnet):
    - 3D: Tetragonale Zelle, quadratische Pyramide (4mm) mit Spitze nach oben an den Ecken, eine nach unten zeigende Pyramide im Zentrum. Das erzwingt ein Inversionszentrum bei (¼, ¼, ¼) und eine n-Gleitspiegelebene senkrecht zu c. Die Raumgruppe ist P4/nmm, nicht P4mm (rechnerisch geprüft: 16 Operationen je Zelle, Inversion −x + ½, −y + ½, −z + ½). In der Vorlesung ist das durch Umfärben der zentralen Pyramide gelöst.
    - Gegenstück in 2D für diese App, drei Stufen (rechnerisch geprüft 30.10.2026; Daten nach ITA Nr. 3, 5 und 7, S. 94, 96, 98):
      - **Aufbau:** Rechteckige Zelle (a ≠ b). Ein gleichschenkliges Dreieck hat eine Spiegellinie ∥ b; seine Spitze zeigt also entlang b. Ein Dreieck sitzt an der Ecke (0, 0), ein zweites im Zentrum (½, ½).
      - **Stufe 1, zentrales Dreieck andersfarbig:** Es bleibt bei der Symmetrie der Dreiecke, **pm**. Spiegellinien ⊥ a bei x = 0 und x = ½; die Dreiecke liegen auf den Wyckoff-Lagen 1a (0, y) und 1b (½, y).
      - **Stufe 2, gleiche Farbe, beide Spitzen nach +b:** Das zentrale Dreieck ist eine Kopie des Eckdreiecks, um (½, ½) verschoben. Die Zelle ist zentriert, **cm**. Zwischen den Spiegellinien liegen Gleitspiegellinien bei x = ¼ und ¾ mit Gleitung b/2. Die primitive Zelle ist nur halb so gross.
      - **Stufe 3, gleiche Farbe, Spitze im Zentrum nach −b:** Man erwartet weiterhin nur die Spiegellinien. Es entstehen aber zusätzlich 2-zählige Drehpunkte bei (¼, ¼), (¾, ¼), (¼, ¾), (¾, ¾) und Gleitspiegellinien ⊥ b bei y = ¼ und ¾ mit Gleitung a/2: **p2mg**. Die Drehung um (¼, ¼) führt das Eckdreieck in das Zentrumsdreieck über und kehrt dabei seine Richtung um. In der ITA-Aufstellung (Ursprung auf einem Drehpunkt, hier (¼, ¼)) liegen die Dreiecke auf der Wyckoff-Lage 2c (¼, y; ¾, −y) mit y = ¼, Lagesymmetrie .m.
      - **Warum die Spitzen entlang b zeigen:** Dann liegen die Spiegellinien ⊥ a, und die Symbole entsprechen ohne Umrechnung der Standardaufstellung der ITA (pm: Spiegellinie bei 0, y; p2mg: Spiegellinie bei ¼, y, Gleitspiegellinie bei x, 0). Zeigen die Spitzen entlang a, ist es dieselbe Struktur in nicht-konventioneller Aufstellung (p11m bzw. p2gm, so in ITA S. 97 unter den Untergruppen von p2mm). Die App rechnet solche Aufstellungen in die konventionelle um (Abschnitt 8); das ist ein eigener Testfall.
    - Das 3D-Beispiel gehört später in die 3D-App; im Skript der 2D-App wird es als Ausblick erwähnt.
  - Vorgaben: die fünf Bravais-Gitter; Beispiele wie Bienenwabe (hexagonales Gitter mit zweiatomiger Basis, Hoffmann 2.7) und eine Netzebene von Kristallflächen (Hoffmann 4.2.4).
  - Symmetrie des leeren Gitters (p2, p2mm, c2mm, p4mm, p6mm nach Borchardt-Ott 10.2); Elementarzellen: konventionell, andere primitive Zellen gleicher Fläche, nichtprimitiv.
  - Herleitung „Gitter + Motiv“ wie Borchardt-Ott Abb. 10.9.
  - als Vertiefung: Gittergeraden [uv] und Netzlinien (hk).
- **Tafel B „Beugung“:** das reziproke Gitter der Struktur, live (Abschnitt 3.3).

### 3.3 Reziprokes Gitter und Beugung

Vorbild ist das Laserexperiment der Vorlesung (`oxrd.py`): Ein Punktmuster wird gezeigt, ein Laser daran gebeugt, und man sieht live, wie sich das Beugungsbild mit dem Muster ändert. Die Studierenden sollen das zu Hause in der App nachvollziehen können. Das Experiment selbst bleibt bei der Python-App. Ihre Oberfläche ist kein Vorbild.

**Was `oxrd.py` zeigt** (übernommen werden die Ideen, nicht die Oberfläche):
- Gitter aus a, b und dem Winkel; die fünf Bravais-Gitter als Vorgabe (zentriert-rechteckig über cos φ = a/2b)
- Bedingungen a ≠ b, a = b, a/b fest; Drehung des ganzen Musters
- Basis mit einem oder zwei Atomen: Verschiebung Δa, Δb, Grösse und Helligkeit (Streukraft) je Atom
- **Unordnung:** zufällige, unkorrelierte Verschiebung aller Gitterpunkte
- **Fehlstellen:** zufällig fehlende Gitterpunkte (Anteil); bei zwei Atomen fehlen beide zusammen

**In der App:**
- **Tafel „Beugung“** neben jedem Muster, in beiden Modi:
  - In „Gitter und Basis“ ist sie Tafel B.
  - In „Ebenengruppen“ schaltet Tafel B zwischen „Muster“ und „Beugung“ um. Auch ein selbst gezeichnetes Muster lässt sich beugen.
- **Berechnung:** Das Muster wird als Bild gerastert und per 2D-FFT transformiert (Fraunhofer-Beugung, Intensität |F|², logarithmisch).
  - Ein Gauss-förmiger Strahl mit einstellbarem Durchmesser beleuchtet das Muster. Das macht die Breite der Reflexe nachvollziehbar.
  - Der Nullstrahl ist abgeblendet oder gedämpft.
  - In JavaScript mit 512 × 512 Punkten schnell genug, um beim Ziehen mitzulaufen. Das prüfe ich zu Beginn mit einem Prototyp.
- **Reziprokes Gitter als Überlagerung** (zuschaltbar): a\* und b\* (a\* ⊥ b, b\* ⊥ a, Länge 1/d), Indizes hk an den Reflexen, Netzlinienschar (hk) und ihr Abstand im Muster gekoppelt mit dem Reflex hk.
- **Was man sehen kann:**
  - Wird das Gitter grösser, rückt das Beugungsbild zusammen. Drehung und Scherung übertragen sich.
  - Die Basis moduliert die Intensitäten (Strukturfaktor). Bei Zentrierung fallen Reflexe aus (c: h + k ungerade).
  - **Gleitspiegellinien löschen Reflexe aus**, je nach Lage und Gleitrichtung: pg (Gleitspiegellinie ⊥ a, Gleitung b/2) löscht 0k mit k ungerade; p2mg (Gleitspiegellinie ⊥ b, Gleitung a/2) löscht h0 mit h ungerade (ITA S. 95 und 98). Das sind genau die Auslöschungsbedingungen der ITA-Seiten; so verbindet sich die Symmetrie direkt mit der Beugung.
  - Grösse der Atome: Einhüllende (Formfaktor). Unordnung: schwächere Reflexe nach aussen und diffuser Untergrund. Fehlstellen: Untergrund.
- **Störungen** (Abschnitt in der Seitenleiste): Unordnung, Fehlstellen, Strahldurchmesser, mit „Neu würfeln“; der Zufall ist reproduzierbar (Startwert im Link).
- **Ziel und Tiefe** (Thomas, 30.10.2026): die Grundlagen, so weit, dass die Studierenden das Prinzip von Röntgenbeugung (XRD), Laue-Aufnahmen usw. verstehen:
  - Berechnung der reziproken Gittervektoren (a\* ⊥ b, b\* ⊥ a, a·a\* = 1; über die Metrik bzw. die inverse Matrix)
  - Was die Punkte des reziproken Gitters sind: je ein Punkt hk für eine Netzlinienschar (hk), Richtung senkrecht zu den Linien, Abstand vom Ursprung 1/d
  - Beugung als Fourier-Transformation des Musters; Strukturfaktor; Auslöschungen
- **Ewald-Konstruktion in 2D** als Brücke zu XRD und Laue (Thomas: ja, wenn sie sich gut umsetzen lässt):
  - Eine Welle in der Ebene trifft das 2D-Gitter; der Ewald-Kreis mit Radius 1/λ zeigt, welche Reflexe entstehen (Bragg-Bedingung).
  - Monochromatisch: Kristall drehen, Reflexe blitzen auf (Drehkristall). Weisses Licht: Band zwischen zwei Kreisen, viele Reflexe zugleich (Laue).
  - Umsetzung: SVG, reziprokes Gitter, Wellenvektoren k₀ und k, Ewald-Kreis. Weil ein Punkt den Kreis praktisch nie genau trifft, gibt es eine kleine Toleranz (Strahldivergenz bzw. Mosaizität); beim Drehen leuchten die Reflexe auf, wenn ihr Punkt den Kreis kreuzt. Aufwand gering; zuerst ein kurzer Prototyp.
  - Dazu im Skript der Unterschied zum Laserexperiment: Dort steht der Strahl senkrecht zur Maske. Das reziproke Gitter einer ebenen Maske besteht aus Stäben senkrecht zur Ebene, die die Ewald-Kugel alle schneidet. Deshalb sieht man dort alle Reflexe zugleich.

### 3.4 Modus „Bestimmen“ (nach dem ersten Release)

- Ein Beispielmuster (Mauerwerksverband, Fliesenmuster, Ornament); das Flussdiagramm nach Sanderson wird Schritt für Schritt beantwortet.
- Die Antworten zeichnen die gefundenen Elemente ins Muster, am Ende Elementarzelle und Gruppe (wie Hoffmann Abb. 4.15–4.18).
- Muster: eigene SVG-Zeichnungen, z. B. Mauerwerksverbände nach der Beschreibung in Hoffmann Abb. 4.19, nicht abgebildet. Nur selbst erzeugte Bilder (Abschnitt 3.6).

### 3.5 Nicht in der App

Raumgruppen, Schraubenachsen, Gleitspiegelebenen im Raum: Sie gehören in die 3D-App.

### 3.6 Ästhetischer Zugang in der App (Thomas 1.11.2026)

Grob nach Aufwand geordnet. **Zeitplan** (Entscheidung 24): 1, 2 und 6 bald, im ersten Release; 3 als Prototyp nach dem ersten Release; 4 mit dem Modus „Bestimmen“; 5 später.
1. **Tapetenansicht:** Tafel B als reine Tapete ohne Gitter und Elemente, mit grösserem Ausschnitt; dazu einige eigene **Ornamentmotive** (Rosette, Blatt, Band, Stern; selbst gezeichnet) statt des Fähnchens. Aufwand gering; die Motive sind schon in Abschnitt 3.1 vorgesehen.
2. **Signatur nach Conway** in den Kenndaten, neben dem Hermann-Mauguin-Symbol, mit Tooltip zu den vier Merkmalen. Die Zuordnung für alle 17 Gruppen wird hinterlegt und aus den Daten der App gegengeprüft (Drehpunkte auf und neben Spiegellinien, *miracles*: eine spiegelbildliche Kopie ist erreichbar, ohne eine Spiegellinie zu überqueren). Umgesetzt in PR #17. Aufwand gering.
3. **Escher-Kacheln:** Man verformt die Kanten einer Kachel (Fundamentalbereich bzw. asymmetrische Einheit); die App überträgt jede Verformung über die Operationen auf die Partnerkante, sodass die Kacheln lückenlos bleiben. Das zeigt, warum Kanten paarweise zusammengehören (Translation, Drehung um die Kantenmitte, Gleitspiegelung) und wie Escher gearbeitet hat. Aufwand mittel bis hoch; zuerst ein Prototyp für p1, p2, pg und p4.
4. **Signatur bestimmen** im Modus „Bestimmen“ (Abschnitt 3.4): Man markiert im Muster Kaleidoskope, Drehpunkte und *miracles*; ein Zähler zeigt den Preis bis 2. Als zweiter Weg neben dem Flussdiagramm.
5. **Zweifarbige Muster** (Vertiefung): Operationen, die die Farbe tauschen; Brücke zu den magnetischen Gruppen (Birss-App). Aufwand hoch, eher später.
6. **Kopieren und Speichern wie in der Stereo-App** (fehlt ohnehin noch): je Tafel die Knöpfe „Kopieren“ (PNG in die Zwischenablage, fügt sich in Folien ein), „SVG“ und „PNG“ (Datei speichern). Damit lässt sich auch eine selbst gezeichnete Tapete speichern. Aufwand gering, motivierend.

**Bilder** (Entscheidung 25): nur selbst erzeugte Bilder, keine Fotos. Es geht nicht um bestimmte Vorlagen, sondern um das Konzept: Periodische Muster gibt es überall, nicht nur in der Kristallographie, und sie haben etwas Ästhetisches. Mauerwerk, Fliesen und Ornamente im Stil der Alhambra entstehen als eigene SVG-Zeichnungen bzw. mit der App. Escher (Werke geschützt, bei Hoffmann Abb. 4.21–4.22 mit © The M.C. Escher Company) wird nur beschrieben und verlinkt.

### 3.7 Erweiterung: Oberflächen als ebene Gitter (Thomas 2.11.2026)

Eine Kristalloberfläche ist eine Netzebene des Raumgitters, also ein ebenes Gitter. Welches der fünf ebenen Bravais-Gitter sie bildet, hängt vom Raumgitter und von (hkl) ab (Hoffmann Abschn. 4.2.4, S. 147–151, Abb. 4.25–4.28). Anwendung: Katalyse; beim Haber-Bosch-Verfahren sind an α-Fe (kubisch innenzentriert) die Flächen (111) und (211) am aktivsten (Hoffmann S. 147–148).
- **Skript:** Die Vertiefung „Netzebenen von Kristallflächen“ in Kap. 2 nennt heute cP (100), (110), (111) und cI (110). Erweitern um cF und hP, die Fläche (211) und das Beispiel Haber-Bosch; Brücke zur Stereo-App (Kristallflächen) und zur 3D-App.
- **App:** zunächst Vorgaben im Modus „Gitter und Basis“ (die Netzebene mit ihrem Bravais-Gitter); später ggf. eine Skizze des Raumgitters mit der Schnittebene.
- **Quiz:** Generator „Raumgitter und (hkl) → ebenes Bravais-Gitter“, wenn das Skript erweitert ist. Heute gibt es dazu nur gs-2-10 (cP(111), Stufe 3).
- **Daten selbst nachrechnen, nicht aus den Abbildungen übernehmen:** Abb. 4.27 (cF(110)) zeigt eine zentriert-rechteckige Zelle; richtig ist primitiv-rechteckig mit *a*/√2 × *a* (so auch Hoffmanns Text, S. 150). Abb. 4.28 (hP(111)) zeigt ein schiefwinkliges Netz; die Vektoren *a*₁ − *c* und *a*₂ − *c* sind gleich lang, das Netz ist also zentriert-rechteckig (für jedes *c*/*a*, ausser in Sonderfällen höherer Symmetrie). Geprüft 2.11.2026.

## 4. Konventionen

- **Achsen:** *a* nach unten, *b* nach rechts, Ursprung oben links (ITA Abschn. 2.2.6.1; wie die Stereo-App).
- **Diagramme und Daten nach ITA Part 6**, Symbole wie dort. Vollständige Symbole wie in der Vorlesung (p2mm, p2mg, p2gg, c2mm, p4mm, p4gm, p3m1, p31m, p6mm). Die Kurzformen (pmm, pmg …, Hoffmann Tab. 4.1) erscheinen in den Kenndaten.
- **Aufstellung:** Die App zeigt Gruppen und bestimmte Strukturen immer in der Standardaufstellung der ITA (z. B. pm mit Spiegellinie ⊥ a, p2mg mit Spiegellinie ⊥ a und Gleitspiegellinie ⊥ b). Liegt eine Struktur anders, rechnet die App um und nennt die Vertauschung der Achsen.
- **Bezeichnung der Operationen in Punktgruppen** (Entscheidung 28): Drehungen 1, 2, +*n*, −*n* (gegen bzw. im Uhrzeigersinn). Spiegelungen: Der Index ist die Richtung senkrecht zur Spiegellinie (Normale), mit den Achsen wie in der App: 2*mm* *m*<sub>*a*</sub>, *m*<sub>*b*</sub>; 4*mm* zusätzlich *m*<sub>*a*+*b*</sub>, *m*<sub>*a*−*b*</sub>; 6*mm* mit *a*<sub>1</sub> = *a*, *a*<sub>2</sub> = *b*, *a*<sub>3</sub> = −(*a* + *b*): zu jeder Achse zwei senkrecht aufeinander stehende Spiegellinien, das Zeichen am *m* sagt, wie die Linie zur Achse liegt: *m*<sub>*ai*</sub><sup>⊥</sup> senkrecht, *m*<sub>*ai*</sub><sup>∥</sup> parallel (Thomas 2.11.). *p*3*m*1 hat die *m*<sub>*ai*</sub><sup>⊥</sup>, *p*31*m* die *m*<sub>*ai*</sub><sup>∥</sup>. Ausnahme: die Punktgruppe 3*m* für sich wie in der Vorlesung mit *m*<sub>1</sub>–*m*<sub>3</sub> durch die Stellen 1–3 (Skript Abb. 4.4 und 4.5). Borchardt-Ott benennt ebenfalls nach der Normalen, aber mit Richtungsindizes (4*mm*: *m*<sub>*a*</sub>, *m*<sub>*b*</sub>, *m*<sub>[110]</sub>, *m*<sub>[1̄10]</sub>, S. 266; hexagonal zusätzlich *m*<sub>[210]</sub>, *m*<sub>[120]</sub>, Tab. 11.1) und die Drehungen mit Hochzahl (4<sub>*c*</sub><sup>1</sup>). Im Skript und in der App kein LaTeX: Formeln in HTML (kursiv, Unicode, `<sub>`/`<sup>`, Querstrich per CSS).
- **Begriffe:**
  - Kristallsystem **rechteckig** (Entscheidung Thomas, wie Hoffmann). Das Skript nennt „rechtwinklig“ als Bezeichnung bei Borchardt-Ott.
  - Weiter (Vorschlag): Elementarzelle (Synonyme Elementarmasche, Einheitsmasche), primitiv/zentriert, Spiegellinie, Gleitspiegellinie, Drehpunkt bzw. n-zählige Drehachse senkrecht zur Ebene, Punktlage, Lagesymmetrie, Zähligkeit, Wyckoff-Lage, asymmetrische Einheit.

## 5. Verzahnung

- **Mit der Stereo-App:**
  - Die Punktgruppe einer Ebenengruppe führt in die Stereo-App (ab v1.12.0) zum **Pedion mit Flächenmuster, Blick senkrecht auf die Fläche** (`blick`), aufgeräumte Ansicht mit Kristallachsen (Thomas 31.10.2026). Die 10 Punktgruppen der Ebene entsprechen den 10 polaren Punktgruppen (2D „2mm“ = 3D „mm2“); das Muster auf dem Pedion zeigt genau die Punktgruppe der Ebene. p3m1 → 3m1, p31m → 31m; Achsen und Spiegellinien liegen in beiden Apps gleich. Ausnahmen 1 und m: Modus „Punktgruppen“, Blick entlang c; bei m steht die Spiegelebene dort ⊥ b, in pm, pg, cm nach ITA ⊥ a (Tooltip nennt die 90°). Zuordnung in `js/verweise.js`.
  - Die Lagesymmetrien sind dieselben ebenen Punktgruppen wie im Vertiefungskapitel „Lagen“ der Stereo-App.
  - Netzebenen von Kristallflächen (Hoffmann 4.2.4): Die Fläche (111) eines kubischen Kristalls in der Stereo-App ↔ das hexagonale Netz hier.
- **Mit der 3D-App:** Gleitspiegelung → Gleitspiegelebenen; Wyckoff-Lagen → Raumgruppen.
- **Link-Adressen** (Vorschlag): `#m=eg&g=p4gm&x=0.12&y=0.31`, `#m=struktur&a=1&b=1.4&gamma=90&basis=…&beugung=1`. Sie werden im README beschrieben und getestet.

## 6. Skript (Gliederung, Vorschlag)

1. **Muster in der Ebene:** Alltagsbeispiele; Gitter, Elementarzelle, primitiv und zentriert, Gitter + Motiv
2. **Symmetrie des Gitters:** Periodizität; nur 1-, 2-, 3-, 4-, 6-zählig; Symmetrie und Metrik; 4 Kristallsysteme; 5 Bravais-Gitter
3. **Gitter und Motiv:** Symmetrie des Musters; 10 ebene Punktgruppen und ihre Untergruppen
4. **Gleitspiegelung und Verknüpfung:** Fussspuren, Gleitspiegellinie, gekoppelte Operation; wie Symmetrieelemente einander bedingen (die Regeln aus Abschnitt 3.1, Beispiele p4mm und c2mm; das Dreiecksbeispiel aus Abschnitt 3.2)
5. **Die 17 Ebenengruppen:** Symbole lesen (Lang- und Kurzform), Diagramme nach ITA, Ebenengruppe → Punktgruppe → Kristallsystem
6. **Punktlagen:** Struktur erzeugen aus Motiv und Lage; allgemeine und spezielle Lage, Lagesymmetrie, Zähligkeit, Wyckoff-Lagen, asymmetrische Einheit; eine ITA-Seite lesen
7. **Tapeten, Ornamente und Kunst** (Thomas 1.11.2026; eigenes Kapitel, im ersten Release): Ebenensymmetrie im Alltag und in der Kunst (Mauerwerk, Fliesen, Stoffe, Alhambra, Escher; Hoffmann 4.2.3); Escher-Kacheln; Ausblick Farbsymmetrie. **Vertiefung:** der Blick von Conway (vier Merkmale, Signatur, warum es genau 17 gibt), klar als Vertiefung gekennzeichnet (Entscheidung 27)
8. **Ebenengruppen bestimmen:** Flussdiagramm, Beispiele (Mauerwerk, Fliesen); Signatur nach Conway nur als Vertiefung
9. **Reziprokes Gitter und Beugung:** a\*, b\* berechnen; Punkte des reziproken Gitters ↔ Netzlinien; Beugung als Fourier-Transformation, Strukturfaktor, Auslöschungen durch Zentrierung und Gleitspiegellinien; Unordnung und Fehlstellen; Ewald-Konstruktion, Drehkristall und Laue; Bezug zum Laserexperiment und zum Kapitel XRD der Vorlesung

Vertiefungen:
- Gittergeraden und Netzlinien
- symmorph und nichtsymmorph
- Punktgruppe als Faktorgruppe
- Unter- und Obergruppen
- Netzebenen von Kristallflächen
- Friesgruppen (im Kapitel „Gleitspiegelung“)
- Ausblick Raumgruppen
- Conways Signatur (Orbifold-Symbol) und Magic Theorem (Kap. 7, ggf. Kap. 8)

Grundlagen-Kästen: Gruppe, Untergruppe, Punktgruppe, mit Verweis auf das Skript der Stereo-App.

**Unbedingt im Skript erklären** (Thomas, 31.10.2026). Die App setzt diese Schreibweisen voraus; ohne Erklärung sind sie für die meisten nicht lesbar:
- **Koordinatensystem** (Kap. 1, spätestens Kap. 5): Gittervektoren *a*, *b* und Ursprung; ein Punkt ist *x a* + *y b*, also Bruchkoordinaten (*x*, *y*) bezogen auf die Zelle; *a* nach unten, *b* nach rechts wie in ITA; Koordinaten, die sich um ganze Zahlen unterscheiden, beschreiben gleichwertige Punkte in anderen Zellen.
- **Schreibweise der Symmetrieoperationen** (Kap. 4 und 5): „−x, y + ½“ nennt die Koordinaten des Bildpunkts von (*x*, *y*); der Querstrich x̄ bedeutet −x; der Anteil ohne x und y ist die Verschiebung; Zusammenhang mit Matrix und Translation; die Beschreibung nach ITA (z. B. „m ¼, y“, „g(½, 0) x, ¼“). Vorgerechnet an Beispielen, die man in der App mit „Warum ist das da?“ nachverfolgen kann.
- **Modus „Gitter und Basis“ an Beispielen** (Kap. 1 und 3, Aufgabentyp aus Abschnitt 1a): Dass die konventionelle Zelle beim Ändern der Basis wechselt (Lage, Grösse, Achsen, Ursprung), kann Anfänger stark überfordern. Das Skript führt es Schritt für Schritt an Vorgaben der App vor, mit Links:
  - gegebene Zelle und konventionelle Zelle unterscheiden; warum die App die Zelle nach ITA wählt
  - Zelle wird kleiner: Atom entfernen im Lieb-Gitter → kleinere, um 45° gedrehte Zelle; Zentrierung entsteht: Dreiecksbeispiel Stufe 1 → 2 (pm → cm)
  - Ursprung wandert: Stufe 2 → 3 (cm → p2mg, Ursprung auf dem neuen Drehpunkt bei (¼, ¼)); Molekül aus zwei Atomen auf rechteckigem Gitter (p2mm, Ursprung in der Molekülmitte, Skript Abb. 3.7). Gibt es mehrere erlaubte Ursprünge, bleibt die App beim nächsten zum gegebenen (seit 31.10.; h-BN behält deshalb (0, 0))
  - Achsen werden vertauscht: Dreieck mit Spitze entlang a (Spiegellinie ⊥ b) → konventionell *a*′ = *b*, *b*′ = −*a*
  - jeweils: Was bleibt gleich (die Struktur), was ändert sich (nur die Beschreibung)?
- **Asymmetrische Einheit** (Kap. 6): Allein aus den Ungleichungen der ITA-Seite (z. B. 0 ≤ x ≤ ½; 0 ≤ y ≤ ½) ist sie für die meisten schwer zu erkennen. Das Skript zeigt sie deshalb als Fläche im Bild: wie sie von Symmetrieelementen begrenzt wird, warum ihre Fläche die Zellfläche geteilt durch die Zähligkeit der allgemeinen Lage ist, und wie man die Ungleichungen in das Bild übersetzt und zurück. Dazu in der App „asymmetrische Einheit“ einblenden.

## 7. Quiz

Gleiche Funktionen und Regeln wie in der Stereo-App. Generatoren aus den Daten der App:
- Diagramm → Ebenengruppe, mit Ablenkern aus demselben System
- Muster → Ebenengruppe
- Ebenengruppe → Punktgruppe bzw. Kristallsystem
- Lang- ↔ Kurzsymbol
- Zähligkeit, Lagesymmetrie und Wyckoff-Buchstabe einer Lage
- Kristallsystem und Bravais-Gitter aus a, b, γ
- Struktur (Gitter + Basis) → Ebenengruppe, Elementarzelle, asymmetrische Einheit; Basis geändert → neue Ebenengruppe
- Beugungsbild → Gitter bzw. Auslöschung → Zentrierung oder Gleitspiegellinie

Seit 2.11.2026 zusätzlich (Anregungen aus Borchardt-Ott Aufg. 10.1–10.3, 11.2, S. 206, 264 ff. und Hoffmann S. 133–134, 153; Entscheidung 29):
- Untergruppen der Punktgruppen 4, 3m, 4mm, 6, 6mm (Bezeichnungen nach Abschnitt 4)
- Muster ohne Symmetrieelemente → Ebenengruppe (Borchardt-Ott Aufg. 10.1, „nach Kockel“)
- Symmetrieelement an gegebener Lage → Koordinaten des Bildpunkts (Aufg. 10.2 b, d, l; 7.3)
- Gleitspiegellinien, die das Symbol nicht nennt (S. 206)
- Kommt es bei der Verknüpfung auf die Reihenfolge an (abelsch, S. 264 ff.)?
- einzeln: zu sich selbst inverse Operationen (1, 2, m); Inversion in der Ebene = Drehung um 180°; Punkt oder Fähnchen (Aufg. 10.3); Fussspur des Kängurus (Vertiefung Friese)
- später, mit der Erweiterung in Abschnitt 3.7: Oberflächen als ebene Gitter

Handgeschriebene Fragen, z. B.:
- „Warum keine 5-zählige Drehachse?“
- „p3m1 oder p31m?“
- „Welche Gleitspiegellinien hat c2mm, obwohl das Symbol keine nennt?“
- Mauerwerksverband → Ebenengruppe
- Dreiecksbeispiel: „Das zentrale Dreieck wird umgedreht. Welche Ebenengruppe?“

## 8. Daten und Absicherung

- **Ebenengruppen als Operationen** (Matrix und Translation, in Bruchkoordinaten) aus ITA Part 6, alles Weitere berechnet:
  - Symmetrieelemente (Lage, Art, Gleitanteil), Ordnung, Punktgruppe
  - Wyckoff-Lagen über den Stabilisator
  - wie `pointgroups.js` und `sitesym.js` in der Stereo-App
- **Tests gegen ITA** für alle 17 Gruppen:
  - Ordnung, Zahl, Buchstaben, Multiplizitäten und Lagesymmetrien der Wyckoff-Lagen
  - Koordinaten der Wyckoff-Lagen
  - Ursprung
  - Auslöschungsbedingungen (z. B. pg: 0k, k = 2n; p2mg: h0, h = 2n)
  - Punktgruppe und Kristallsystem
  - Link-Adressen hin und zurück
- **Symmetrie einer Struktur bestimmen** (Gitter und Basis): kleinstes Translationsgitter aus der Basis, dann alle Operationen der Holoedrie dieses Gitters mit passender Translation, die die Basis auf sich abbilden; daraus Ebenengruppe, Ursprung nach ITA und konventionelle Zelle.
  - Tests: Strukturen aus allen 17 Gruppen erzeugen (allgemeine und spezielle Lagen) und wiedererkennen, auch nach Verschiebung des Ursprungs, Drehung und Wahl einer anderen Zelle.
  - Nicht-konventionelle Aufstellungen werden umgerechnet, z. B. p11m → pm und p2gm → p2mg durch Vertauschen von a und b.
  - Die drei Stufen des Dreiecksbeispiels (Abschnitt 3.2) als fester Testfall: pm, cm, p2mg, jeweils auch mit Spitzen entlang a.
- **Beugung:**
  - FFT gegen den analytisch berechneten Strukturfaktor prüfen.
  - Auslöschungen gegen die Auslöschungsbedingungen der ITA für alle 17 Gruppen.
  - Länge und Richtung von a\*, b\* gegen die Formeln.
- **Zweiter Prüfdurchgang** für Skript und Quiz wie gehabt.

## 9. Technik

- Repository `plane-groups` aus `vorlagen/app` von crystallography-common v0.1.1.
- Zeichnung in SVG; kein three.js nötig.
- Was beide Apps brauchen (z. B. Anordnung der Tafeln, Einrasten, Symbole der Drehpunkte), wandert danach in crystallography-common.
- Präfixe (nie ändern): Service-Worker-Cache `ebenengruppen-`, Speicher des Quiz `ebenen-quiz`, Erste Schritte `ebenen-intro`.

## 10. Zeitplan

- Kap. 7 (Symmetrie im Kristallgitter): Montag, 2.11.2026
- Ebenengruppen in der Vorlesung: in etwa 14 Tagen. Das ist das Ziel für das erste Release (Entscheidung Thomas: das wichtigere Thema).

**Erstes Release** (vor der Vorlesung zu den Ebenengruppen):
- Modus „Ebenengruppen“ vollständig, mit „Selbst zeichnen“
- Modus „Gitter und Basis“ mit Symmetriebestimmung, Elementarzelle und asymmetrischer Einheit (zum Wiederholen von Kap. 7 und für die Aufgabentyp aus Abschnitt 1a)
- Skript Kap. 1–7
- Tapetenansicht mit Ornamentmotiven, Signatur nach Conway, Kopieren und Speichern je Tafel (Abschnitt 3.6, Punkte 1, 2, 6)
- Quiz Stufe 1 und 2

**Zweites Release** (vor dem Kapitel XRD der Vorlesung, dem vorletzten; in gut einem Monat):
- Tafel „Beugung“ mit reziprokem Gitter, Unordnung und Fehlstellen; Ewald-Konstruktion
- Skript Kap. 9 „Reziprokes Gitter und Beugung“, Quiz dazu

**Danach:** Prototyp Escher-Kacheln (Abschnitt 3.6, Punkt 3); Modus „Bestimmen“ mit Signatur nach Conway und Kap. 8 im Skript; Vertiefungen, Quiz Stufe 3, PDF, Moodle-Export.

**Reihenfolge der Arbeit:**
1. Daten und Tests der 17 Gruppen, dazu die Verknüpfung von Operationen (für „Erzeugende“ und „Warum ist das da?“)
2. Modus „Ebenengruppen“
3. Modus „Gitter und Basis“ mit Symmetriebestimmung
4. Skript Kap. 1–7, dazu Abschnitt 3.6, Punkte 1, 2, 6 (Kap. 7 braucht die Tapetenansicht und die Ornamentmotive für seine Abbildungen)
5. Quiz
6. Erstes Release
7. Prototyp Beugung (Geschwindigkeit der FFT im Browser, auch iPad), dann Tafel „Beugung“ und Kap. 9 des Skripts
8. Zweites Release

## 11. Anregungen von bestehenden Werkzeugen

- In Hoffmann 4.3 (2016) genannt: Kali, Escher Web Sketch, Morenaments, Symmetry Artist, Weave Silk, GeCla. Die damaligen Links sind teils veraltet.
- Heute erreichbar (geprüft 30.10.2026): Escher Web Sketch 2 der EPFL und eine Web-Version „eschersketch“.
- Zum Übernehmen: Zeichnen in einer gewählten Gruppe mit sofortiger Vervielfältigung.
- Zum Verbessern: Die meisten Werkzeuge zeigen weder Elementarzelle noch Wyckoff-Lagen noch den Bezug zu ITA. Genau das soll diese App leisten.

## 12. Entscheidungen (Thomas, 30.10.2026)

1. Name „Symmetrie in der Ebene“, Repository `plane-groups`.
2. Achsen nach ITA: *a* nach unten, *b* nach rechts.
3. Begriff „rechteckig“.
4. Kap. 7 am Montag, Ebenengruppen in etwa 14 Tagen; das ist das Ziel für das erste Release.
5. Didaktik und Anregungen vor allem nach Hoffmann; Formales nach Borchardt-Ott und ITA.
6. Das reziproke Gitter gehört in die 2D-App; Thomas liefert dazu noch Unterlagen. Vorbild für die Tafel „Beugung“ ist das Laserexperiment (`oxrd.py`): live, mit Unordnung und Fehlstellen; nicht die Oberfläche der Python-App.
7. „Selbst zeichnen“ im ersten Release.
8. Modus „Bestimmen“ nach dem ersten Release.
9. Friesgruppen als kurze Vertiefung im Kapitel „Gleitspiegelung“.
10. Objekt: Fähnchen als Standard, Kreis mit Komma (ITA) zuschaltbar.
11. Kein eigener Trainingsmodus für diesen Aufgabentyp; die App muss die Schritte aus Abschnitt 1a aber vermitteln.
12. Reziprokes Gitter: Grundlagen so weit, dass XRD und Laue-Aufnahmen verständlich werden (Abschnitt 3.3).
13. Beugung im zweiten Release, vor dem Kapitel XRD (vorletztes Kapitel, in gut einem Monat).
14. Die drei Blickrichtungen aus Abschnitt 1b sind Kernziele: Erzeugen, Umkehren, Bedingen.
15. „Unbeabsichtigte“ Symmetrie (Leitbeispiel in Abschnitt 3.2, nach Hoffmann Abb. 5.37b) gehört zu Blickrichtung 3.
16. Ewald-Konstruktion in 2D, wenn sie sich gut umsetzen lässt (zweites Release).
17. Dreiecksbeispiel korrekt und einfach verständlich: Spitzen entlang b, damit die Symbole ohne Umrechnung der ITA-Standardaufstellung entsprechen; drei Stufen pm → cm → p2mg (Abschnitt 3.2).
18. „Warum ist das da?“ (31.10.): Die Wege des Fähnchens zeigen, wie jede Operation wirkt, auch für A und B: Drehung als Bogen um den Drehpunkt, Gleitspiegelung in zwei Teilen (Spiegelung, dann Verschiebung um die Gleitkomponente entlang der Linie). Stellen werden mit Zahlen benannt (0, 1, 2), Operationen mit Grossbuchstaben (A, B, C).
19. Im Skript unbedingt erklären (31.10.): Koordinatensystem, Schreibweise der Symmetrieoperationen und die asymmetrische Einheit als Fläche im Bild, nicht nur über Koordinaten (Abschnitt 6).
20. Modus „Gitter und Basis“ (31.10.): erste Version mit Motiven, 20 Vorgaben (Bravais-Gitter, Dreiecksbeispiel, 2D-Materialien, Archimedische Parkettierungen, künstliches Spin-Eis) und Bindungen zwischen nächsten Nachbarn. Im Skript an Beispielen erklären, besonders den Wechsel der konventionellen Zelle beim Ändern der Basis (Abschnitt 6).
21. Idee für später (31.10.): ein **interaktives Tutorial** in der App, das z. B. den Wechsel der konventionellen Zelle Schritt für Schritt vorführt (Aufgabe stellen, Basis ändern lassen, Ergebnis erklären).
22. Ästhetischer Zugang (1.11.): Ebenensymmetrie in Kunst und Alltag (Hoffmann, Conway; *wallpaper groups*) bekommt im Skript ein eigenes Kapitel; prüfen, was davon in die App kann (Abschnitte 1c, 3.6, 6).
23. Kap. 7 „Tapeten, Ornamente und Kunst“ als eigenes Kapitel schon im ersten Release (1.11.).
24. Ideen aus Abschnitt 3.6 nach Vorschlag: 1, 2, 6 bald; 3 als Prototyp danach; 4 mit „Bestimmen“; 5 später. Kopieren und Speichern je Tafel wie in der Stereo-App fehlen ohnehin noch (1.11.).
25. Nur selbst erzeugte Bilder, keine Fotos; es geht um das Konzept, nicht um bestimmte Vorlagen (1.11.).
26. Abbildungen im Skript (1.11.): Fähnchen und Symbole dürfen neben der Zelle nicht winzig wirken; das Skript vergrössert sie je nach Spaltenzahl der Abbildungsreihe.
27. Conways Ansatz ist im Skript klar ein Vertiefungsthema (1.11.).
28. Bezeichnung der Operationen in Punktgruppen wie in der Vorlesung, mit einer Systematik für alle 10 ebenen Punktgruppen (2.11.; Abschnitt 4): Index der Spiegelung = Richtung senkrecht zur Linie (wie *m*<sub>*a*</sub> ⊥ *a* in 2*mm*); in 6*mm* sagen ⊥ bzw. ∥ am *m*, ob die Linie senkrecht oder parallel zur Achse *a*<sub>*i*</sub> liegt; 3*m* bleibt bei *m*<sub>1</sub>–*m*<sub>3</sub>.
29. Quiz-Ideen aus Hoffmann und Borchardt-Ott, Punkte 1–8 umsetzen (2.11.; Abschnitt 7).
30. Oberflächen als ebene Gitter als Erweiterung ins Konzept (2.11.; Abschnitt 3.7).
31. IDs der Quizfragen wie im Stereo-Quiz: Kürzel des Kapitels, Stufe, laufende Nummer (z. B. gl-2-03); Lücken erlaubt, damit IDs stabil bleiben (2.11.).
32. In Kap. 7 gehen „Fliesen und die Alhambra“, „Escher“ und „Farbe“ über die Vorlesung hinaus und sind Vertiefungen (3.11.); Fragen dazu Stufe 3.
33. Erstes Release als Version 1.0.0 (wie die Stereo-App); vorher Link-Abgleich und dauerhafte Fragenliste (3.11.).
34. Die externe Gegenprüfung des Quiz folgt nach dem ersten Release (3.11.).

## 13. Offene Fragen

1. **Formelsatz für Kap. 9 „Reziprokes Gitter und Beugung“** (Thomas 2.11.2026; vor Beginn von Kap. 9 entscheiden): Bisher setzen App, Skript und Quiz alle Formeln in HTML (kursiv, Unicode, `<sub>`/`<sup>`, Querstrich `.ov`, `format.js`), wie im Leitfaden der Familie und in der Stereo-App. Kap. 9 bringt Formeln, die in HTML unhandlich werden (Strukturfaktor als Summe mit Exponentialfunktion, reziproke Gittervektoren, Bragg-Bedingung). Vorschlag:
   - KaTeX, selbst gehostet und im Service Worker, nur für abgesetzte Formeln (`class="formel"`); Fliesstext, Symbole und SVG-Beschriftungen bleiben HTML
   - als Regel in den Leitfaden der Familie aufnehmen (crystallography-common), damit Stereo-App und 3D-App gleich verfahren
   - vorher klären: Zeigt das ETH-Moodle Formeln an (MathJax-Filter aktiv)? Sonst braucht der Moodle-Export eine Ersatzdarstellung (z. B. Formel als SVG-Bild).
   - prüfen: PDF-Build, Druck, dunkles Farbschema, Ladezeit offline.
2. **Grösse der Atome in den Strukturbildern des Quiz** (Thomas 2.11.2026: bleibt vorerst): Atome sind relativ zur Zelle gezeichnet und erscheinen je nach Ausschnitt verschieden gross (Radius etwa 5–6 px bei Bravais-Gittern und Parkettierungen, 8 px bei 2D-Materialien, 11–14 px in Zellbildern, bezogen auf 520 px). Möglich wären: Vergrösserung je Bild anpassen (kleinerer Ausschnitt) oder im Quiz feste Bildgrösse der Atome. Symbole, Linien, Fähnchen und Achsennamen sind seit 2.11. in allen Quizbildern einheitlich (Tafel A Grösse 1,8, Muster 1,15, Skizzen gleich skaliert).

Stand 3.11.2026, Abend: **Release v1.0.0 veröffentlicht** (Tag auf Commit 9211559; GitHub-Release mit Skript als PDF; Live-Seite https://manganite.github.io/plane-groups/). Dafür nötig: Tag lokal mit der Noreply-Adresse des GitHub-Kontos (sonst „email privacy restrictions“), und in der Umgebung `github-pages` eine Regel für Tags `v*.*.*` (vorher nur `main` erlaubt). Danach in `main` (PR #31): Werkzeug für Prüf- und Fragenliste in `tools/listen/` (`node tools/listen/liste-extract.mjs pruefliste|fragenliste`), mit Korrekturen aus dem Review (Entwürfe vor Snapshots geschützt, aktive Karte nicht weggefiltert, Bildtexte als zugängliche Namen). Offen: externe Gegenprüfung des Quiz (Entscheidung 34); README-Tabelle der Link-Adressen ergänzen (`zoom`, `og`, `tap`, `lupe`, Ornamente bei `form`); Ausgabe von Conway klären (oben 2008, im Skript A K Peters/CRC 2016); nächster grosser Schritt Prototyp Beugung (Abschnitt 10, Schritt 7).

Stand 3.11.2026, früher Morgen: Alle 100 handgeschriebenen Fragen und alle 11 Generatoren von Thomas geprüft (Prüfliste). IDs nach Entscheidung 31 (PR #27). Link-Abgleich (PR #28): ein Skript übersetzt alle 347 Links aus Skript und Quiz in Worte, vier unabhängige Agenten urteilten; kein Fehler, drei Präzisierungen im Skript (4.4 Gleitspiegellinien auch in p3m1 und p31m, Abb. 5.2a, 3.2 Motiv mit hoher Eigensymmetrie). Kap. 7 nach Entscheidung 32 (PR #29): 7.3 Vertiefung, Bezug Parkettierung–Alhambra, graue Gruppen anschaulich, Magnetismus genauer (Paramagnet grau; Translation mit Farbwechsel nur bei Antiferromagneten). Dauerhafte Fragenliste als Artifact mit Speicher `rueckmeldungen` (https://claude.ai/artifact/HBvBEy12fiPkF1e1r9MrSf). Release 1.0.0 vorbereitet (PR #30); danach Tag `v1.0.0`.

Stand 2.11.2026, Abend: Durchsicht des Quiz Kap. 1–4 durch Thomas eingearbeitet (PR #24, #25; 41 Fragen geprüft). Skript Abschn. 4.4 mit der Bezeichnung der Operationen für alle Punktgruppen und neuer Abb. 4.5 (bisherige Abb. 4.5–4.7 heissen 4.6–4.8); Generator „Untergruppe“; Vergrösserung des Musters auch im Modus „Gitter und Basis“; Bindungen aus der periodischen Zelle (schneller). In Arbeit: Quiz-Ideen aus Hoffmann und Borchardt-Ott (Entscheidung 29).

Stand 1.11.2026, später Abend: Abschnitt 3.6, Punkte 1, 2, 6 in `main` (PR #17 Schoenflies-Symbol und Signatur nach Conway in den Kenndaten, PR #18 Kopieren/SVG/PNG je Tafel, PR #19 Tapete und Ornamente, PR #20 Lupe und grösserer Rand der hexagonalen Zelle). Skript Kap. 7 „Tapeten, Ornamente und Kunst“ in `main` (PR #21): Tapetengruppen, Mauerwerk und Pflaster (neues Motiv „Ziegel“, Vorgaben „Mauerwerk und Pflaster“: p2mm, c2mm, p2, p2gg, p4gm), Fliesen und Alhambra, Escher-Kacheln (Skizzen p1, p2), Ausblick Farbsymmetrie, Vertiefung Signatur nach Conway. Dazu in der App „Vergrösserung des Musters“ (Link `zoom`) und „Grösse“ des Objekts (Link `og`), damit die Links der Abbildungen genau das Bild des Skripts zeigen. Nächster Schritt: Quiz, dann erstes Release.

Stand Skript 1.11.2026, Abend: Kap. 1–6 in `main` (PR #11–#15; Kap. 6 mit Vertiefung zur Wahl des Ursprungs). Abbildungen des Skripts: Symbole und Fähnchen wachsen mit der Spaltenzahl, Tafel A auf den Inhalt zugeschnitten (PR #16; App unverändert). Nächster Schritt: Abschnitt 3.6, Punkte 1, 2, 6, danach Kap. 7.

Stand 31.10.2026, später Abend: Modus „Gitter und Basis“ (Abschnitt 3.2, ohne Tafel „Beugung“) in `main` (PR #10). Nächster Schritt: Abschnitt 10, Schritt 4 (Skript Kap. 1–6). Davor: Modus „Ebenengruppen“ mit allen Teilen aus Abschnitt 3.1 in `main` (Symmetriegerüst, Objekt, Kenndaten, Bilder rund um die Zelle, Schritt für Schritt, Selbst zeichnen mit gefüllter asymmetrischer Einheit, Aufbau aus Erzeugenden, „Warum ist das da?“, Symmetrie brechen über das Gitter). Der Rechenkern der Symmetriebestimmung (Abschnitt 8, `js/bestimmung.js`) steht und ist getestet; er trägt „Symmetrie brechen“ und den Modus „Gitter und Basis“. Der Teil von „Symmetrie brechen“, der ein Motiv mit geringerer Symmetrie auf eine spezielle Lage setzt oder verdreht, ist im Modus „Gitter und Basis“ umgesetzt (dort gibt es Motive mit eigener Symmetrie).

Stand 1.11.2026, 22:30: Quiz in `main` (PR #23): 95 handgeschriebene Fragen (Kap. 1–7, Stufen 1–3) und 6 Fragengeneratoren (Diagramm, Punktgruppe/Kristallsystem, Lage, Struktur, Verband, Parkett), 11 Antworten im Test nachgerechnet; drei unabhängige Gutachten und Abgleich mit den Vorlesungsfolien eingearbeitet (Stufe 1 der Lagen: p2mm, p4mm, p6mm; Diagramme Stufe 2: p3m1, p31m, p4gm; Faktorgruppe bleibt Vertiefung; Bildtexte neutral wie im Stereo-Quiz). Vorgehen wie im Stereo-Quiz: alle Fragen stehen auf „Entwurf“, bis Thomas sie in der Prüfliste (Artifact mit Speicher `befunde`) mit „in Ordnung“ beurteilt. Danach: Link-Abgleich (Skript übersetzt jeden Link, unabhängiger Agent urteilt), externe Gegenprobe, dauerhafte Fragenliste, erstes Release.
