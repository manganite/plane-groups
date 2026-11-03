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
- **Vorschau der App** (nicht öffentlich): Artifact https://claude.ai/artifact/KTA1WqaG68wj964pRJXP2i mit
  App, Skript, Quiz und `skript.pdf`. Beim Neuveröffentlichen URL angeben, geänderte Dateien in `files`
  aufführen; `skript.pdf` vorher mit `node tools/skript-pdf.mjs` erzeugen (in `.gitignore`).

### Regeln für Fragen
- Richtige Antwort nicht an Länge oder Ausführlichkeit erkennbar (Test).
- Fragen lehren allgemeine Konventionen, nicht „was die App tut“.
- Bildfragen mit neutralem Bildtext (keine eigene Screenreader-Variante).
- **IDs:** Kapitelkürzel – Stufe – Nummer (`gl-2-03`), Kürzel gb, gs, gm, gl, eg, pl, tk. Lücken
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
  Formelsatz für Kap. 9 (Beugung) offen: Issue #35.
- **Kap. 7:** „Fliesen und die Alhambra“, „Escher“, „Farbe“, „Conway“ sind Vertiefung (über die
  Vorlesung hinaus); Fragen dazu Stufe 3, Generator `parkett` ebenfalls.
- **Alhambra:** Archimedische Parkettierungen und Alhambra nur über den Begriff Parkettierung verbinden.
  Dass Alhambra-Mosaiken auf archimedischen Parkettierungen beruhen, ist nicht belegt; nicht behaupten.
- **Farbsymmetrie:** 17 gewöhnliche + 46 Schwarz-Weiss + 17 graue = 80 Gruppen. Paramagnet: graue
  Gruppe. Schwarz-Weiss-Gruppe mit farbwechselnder Translation nur bei Antiferromagneten, nie bei
  Ferromagneten. Vergleich Farbe ↔ Moment in der Ebene nur qualitativ (eine Spiegellinie kehrt ein
  Moment ⊥ Ebene um).
- **Modi und Umfang:** kein eigener Trainingsmodus für den Aufgabentyp aus Konzept 1a; „Gitter und
  Basis“ muss deren Schritte zeigen. Planung: Modus „Bestimmen“ und Kap. 8 Issue #38, Beugung (Kap. 9)
  Issue #36.
- **Bilder:** nur selbst erzeugte, keine Fotos. Escher nur beschreiben und verlinken (Werke geschützt).
- **Dreiecksbeispiel:** Spitzen entlang *b*, damit die Symbole ohne Umrechnung der ITA-Standardaufstellung
  entsprechen. Drei Stufen pm → cm → p2mg (fester Testfall).
- **Begriff „rechteckig“** (wie Hoffmann); „rechtwinklig“ nur als Bezeichnung bei Borchardt-Ott.
- **Quizbilder:** Symbole, Linien, Fähnchen und Achsennamen einheitlich: `K_FRAGE` 1,8, `K_ANTWORT` 2,
  `K_MUSTER` 1,15, `K_SKIZZE` 1,25 in `js/quiz-bild.js`. Atomgrösse in Strukturbildern bleibt vorerst.

## Konventionen

- Dezimalkomma in Skript und Oberfläche; Querstrich statt Minus, wo die Kristallographie ihn verwendet.
- **Präfixe nie ändern:** Service-Worker-Cache `ebenengruppen-`, Quiz-Speicher `ebenen-quiz`,
  Erste Schritte `ebenen-intro`.
- **Bildangaben im Quiz:** `#…` Tafel A, `B#…` Tafel B (Muster); Endung `@k` setzt die Symbolgrösse;
  `skizze:3m|2mm|4mm|6mm` sind Skizzen aus dem Skript. Zerlegen nur mit `zerlege()` aus
  `js/quiz-bild.js` (`hashAnwenden` verträgt das `@` nicht).
- **Matrizen und Vektoren in Quiztexten** nur mit `mat()` aus `js/quiz-bank.js` (`<span>` mit
  `display: inline-table`). Keine Blockelemente in Frage- und Erklärtexten (Test): Ein `<table>`
  schliesst das umgebende `<p>` in Prüfliste und Moodle-Export.
- Hilfen in `js/quiz-bank.js`: `ov()` Querstrich, `sym()` Symbol kursiv, `LZ` sammelt die Lernziele.
- Bindungen im Modus „Gitter und Basis“ aus der periodischen Zelle (`bindungenBasis`); ersetzt die
  frühere quadratische Suche (225 Fälle gleich).
- **Link-Adressen** sind Schnittstelle (Leitfaden Abschn. 8). Die Werte stehen in `js/zustand.js`
  (`SCHALTER`, `FORMEN`, `ZOOM_BEREICH`, `OBJ_BEREICH`). Zur Stereo-App verlinkt die App mit deren
  Parameter `blick=1–3` die 10 polaren Punktgruppen.

## Fallstricke

- **README-Tabelle der Link-Adressen unvollständig** (Issue #34): es fehlen `zoom`, `og`, `tap`, `lupe`; bei `form`
  fehlen `blatt`, `tropfen`, `ranke`.
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
  Kap. 11–13 Farbsymmetrie, S. 135–169. **Achtung:** Konzept nennt A K Peters 2008, `skript.html`
  A K Peters/CRC 2016; vor dem Zitieren klären (Issue #42).
- **Weitere:** Schattschneider, *M. C. Escher: Visions of Symmetry* (2. Aufl. 2004); Grünbaum, Notices
  AMS 53, 670–673 (2006) (Alhambra); ITA Vol. E (Friesgruppen); Lexikon der Geowissenschaften,
  „Antisymmetriegruppen“ (2000).
- **Vorlesung HS 2026** nur zum Abgleich, nie zitiert.
- **`oxrd.py`** (Laserbeugung, Tzschaschel, Lehmann 2018): Ideen für Konzept 3.3, nicht die Oberfläche.

## Konzept

`docs/konzept-2d-app.md` (Abschnitte, Entscheidungen 1–34) mit Statuskopf. Es bleibt das Konzept für
die offenen Teile (Beugung, „Bestimmen“, Erweiterungen); neue Entwurfsentscheidungen kommen dort hinzu,
der Fortschritt steht in Issues und PRs.
