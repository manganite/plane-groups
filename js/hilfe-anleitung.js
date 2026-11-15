// Texte der Hilfeseite (Leitfaden Abschn. 5.3, crystallography-common#114): Zweck, Modi, Bedienkonzepte der App,
// Bereiche zum Nachschlagen, weitere Anleitungen, typische Fragen und Ergänzungen der gemeinsamen Texte. Datendatei
// (Leitfaden Abschn. 9). Zusammengestellt in js/hilfe-daten.js; gemeinsame Texte in lib/common/js/hilfe-gemeinsam.js.
// Die Hilfeseite erklärt die Bedienung; für die Fachbegriffe verweist sie ins Skript.
//
// Bereiche: Die Einträge mit `zeige` bekommen im Bild eine Nummer (Reihenfolge der Liste); `id` ist der Anker
// `<Modus>-<id>`, Ziel der Verweise aus dem ⓘ (`hilfe` in SECTIONS, js/hilfetexte.js). Was in mehreren Modi gleich ist,
// steht einmal als Konstante und als Bereich je Modus (Reihenfolge der Seite).

/** @import { HilfeBereich, HilfeEintrag, HilfeFrage, HilfeText } from '../lib/common/js/hilfe-seite.js' */
/** @import { Ablauf } from '../lib/common/js/ablauf.js' */

/** Zweck der App (Überblick). */
export const ZWECK = `<p>Die App zeigt, wie sich ein ebenes Muster aus Gitter und Motiv aufbaut und welche Symmetrie es hat. Man kann
  damit die 17 Ebenengruppen mit ihren Symmetrieelementen, Lagen und Operationen erkunden, die Gruppe einer selbst
  gebauten Struktur bestimmen lassen und Muster in einer gewählten Gruppe entwerfen. Neben jeder Zelle steht ein
  Ausschnitt des unendlichen Musters.</p>`;

/** Wozu die Modi dienen (Kennung wie in hilfe-daten.js). */
export const MODI_ZWECK = {
  eg: 'Verstehen: eine Ebenengruppe wählen und ihr Symmetriegerüst, ihre Lagen und Operationen erkunden, auch Schritt für Schritt.',
  struktur: 'Analysieren: eine Struktur aus Gitter und Motiven aufbauen; die App bestimmt ihre Ebenengruppe.',
  entwurf: 'Gestalten: in einer gewählten Gruppe Motive setzen und Striche zeichnen; jedes erscheint mit allen Operationen der Gruppe.',
};

/** Bedienkonzepte der App (nach den gemeinsamen). @type {HilfeText[]} */
export const KONZEPTE = [
  {
    id: 'tafeln',
    titel: 'Zelle und Muster',
    text: `<p>Tafel A zeigt eine Elementarzelle: in „Ebenengruppen“ das Symmetriegerüst, in „Gitter und Basis“ die Struktur
      mit gegebener und konventioneller Zelle, in „Muster entwerfen“ den Entwurf. Dort bedient man: Objekt oder Motive
      ziehen, setzen, zeichnen. Tafel B zeigt einen Ausschnitt des unendlichen Musters, das daraus entsteht.</p>`,
  },
  {
    id: 'erklaerungen',
    titel: 'Erklärungen im Symmetriegerüst',
    text: `<p>Im Modus „Ebenengruppen“ stehen über dem Symmetriegerüst drei Erklärungen: <b>Schritt für Schritt</b> bildet
      das Objekt mit jeder Operation einzeln ab, <b>Aufbau aus Erzeugenden</b> lässt die Symmetrieelemente nacheinander
      entstehen, <b>Herkunft der Elemente</b> zeigt zu einem angetippten Element, aus welchen zwei Operationen es folgt.
      Es wirkt immer nur eine; ein zweiter Klick wählt sie ab. Die Leiste unter der Zeichnung schaltet ihre Schritte
      durch (◀ ▶), spielt sie ab oder schliesst die Erklärung (×). Während einer Erklärung ruhen Zoom und Füllen.</p>`,
  },
  {
    id: 'einrasten',
    titel: 'Einrasten',
    text: `<p>Der Schalter „Einrasten“ im Kopf von Tafel A lässt beim Ziehen springen: das Objekt in „Ebenengruppen“ und ein
      Motiv im Entwurf auf Drehpunkte und Spiegellinien, ein Motiv in „Gitter und Basis“ auf Zwölftel der Zelle. In
      „Ebenengruppen“ ruht er ohne Objekt.</p>`,
  },
  {
    id: 'bahn',
    titel: 'Motive im Entwurf',
    text: `<p>Im Entwurf erscheint jedes Motiv mit allen Bildern der Gruppe; zusammen bilden sie eine Bahn. Ziehen, Drehen
      und Entfernen eines Bildes wirken auf die ganze Bahn. Gleiche Bilder erscheinen einmal; liegt ein Motiv ohne die
      Lagesymmetrie seiner Lage auf einem Symmetrieelement, liegen mehrere Bilder übereinander. Höchstens 48 Bilder;
      Gruppen, mit denen es mehr würden, sind gesperrt.</p>`,
  },
  {
    id: 'uebergaenge',
    titel: 'Zwischen den Modi',
    text: `<p>Aus „Gitter und Basis“ und „Muster entwerfen“ öffnet „im Modus „Ebenengruppen“ ansehen“ in den Kenndaten die
      Gruppe mit Symmetriegerüst, Lagen und Operationen. „In „Muster entwerfen“ weiterbearbeiten“ übernimmt eine Struktur
      mit ihrer bestimmten Gruppe in den Entwurf und ersetzt ihn; einen Weg zurück gibt es nicht. Jeder Modus behält
      seinen eigenen Stand.</p>`,
  },
];

/** Einträge, die in mehreren Modi gleich sind. */
const EXPERIMENTE_E = { id: 'experimente', zeige: '#sec-experimente > summary', name: 'Experimente', text: 'Kleine Versuche zum Modus: erst vermuten, dann ausprobieren.' };
const DARSTELLUNG_E = { id: 'darstellung', zeige: '#sec-view > summary', name: 'Darstellung', text: 'Gleich in allen Modi: nach Blickrichtung färben, Symmetrieelemente im Muster, Muster als Tapete, asymmetrische Einheit füllen.' };
const RESET_E = { zeige: '#reset-alles', name: 'Alle Einstellungen zurücksetzen', text: 'Startzustand der App; Quiz und Experimente bleiben.' };
const ZOOM_A = { zeige: '.p-a .zoomtools', name: 'Zoom', text: 'Verkleinern, Vergrössern, ganze Zeichnung (auch Mausrad oder zwei Finger). Mit Zoom verschieben Leertaste + Ziehen, zwei Finger oder die Pfeiltasten den Ausschnitt.' };
const EINRASTEN = { zeige: '#werkzeug-einrasten', name: 'Einrasten', text: 'Schalter: beim Ziehen auf besondere Stellen springen (siehe Bedienkonzepte).' };
const EXPORT_A = { zeige: '#export-a', name: 'Export', text: 'Zeichnung kopieren oder als SVG- bzw. PNG-Datei speichern.' };
const LEGENDE = { zeige: '#legend', name: 'Legende', text: 'Zeichen und Farben der Zeichnung und was ein Klick oder Tippen tut; was die Zeichen fachlich bedeuten, erklärt das <a href="skript.html#diagramme">Skript, Abschn. 5</a>.' };
const ENTWURF = '#m=entwurf&g=p4mm&basis=fahne,0,1/10,1/5,0';
/** Tafel B ist in allen Modi gleich; je Modus ein Bereich, damit sie nach Tafel A steht. @type {HilfeEintrag[]} */
const TAFEL_B = [
  { zeige: '.p-b .zoomtools', name: 'Zoom', text: 'Verkleinern, Vergrössern, Startgrösse (auch Mausrad oder zwei Finger); das Muster zoomt um die Mitte der Zelle.' },
  { zeige: '#export-b', name: 'Export', text: 'Muster kopieren oder als SVG- bzw. PNG-Datei speichern.' },
  { zeige: '#bild-b', name: 'Muster', text: 'Ausschnitt des unendlichen Musters; hervorgehoben ist die Elementarzelle bzw. in „Gitter und Basis“ die konventionelle Zelle.' },
];

/** Bereiche zum Nachschlagen (je Modus). @type {HilfeBereich[]} */
export const BEREICHE = [
  // Ebenengruppen
  {
    id: 'seitenleiste', modus: 'eg', titel: 'Seitenleiste',
    eintraege: [
      EXPERIMENTE_E,
      { id: 'gruppe', zeige: '#ctl-gruppe > h2', name: 'Ebenengruppe', text: 'Ein Knopf je Gruppe, geordnet nach Kristallsystem; darunter Symmetrieelemente, Objekt und asymmetrische Einheit ein- und ausblenden.' },
      { zeige: '#sub-weitere > summary', name: 'Weitere Optionen', text: '2 × 2 Zellen, Form des Objekts (Fähnchen oder Kreis mit Komma) und Bilder rund um die Zelle wie in den International Tables.' },
      { id: 'objekt', zeige: '#sec-objekt > summary', name: 'Objekt', text: 'Lage x, y in Bruchteilen der Zelle und Grösse des Objekts.' },
      { id: 'gitter', zeige: '#sec-gitter > summary', name: 'Gitter', text: 'b/a und γ, soweit das Kristallsystem sie freigibt; die Gruppe bleibt erhalten.' },
      DARSTELLUNG_E, RESET_E,
    ],
  },
  {
    id: 'tafel-a', modus: 'eg', titel: 'Tafel Symmetriegerüst', ausschnitt: '.p-a', adresse: '#m=eg&schritt=2',
    eintraege: [
      EINRASTEN, ZOOM_A, EXPORT_A,
      { zeige: '.p-a .erklwahl', name: 'Erklärung', text: '„Schritt für Schritt“, „Aufbau aus Erzeugenden“, „Herkunft der Elemente“; höchstens eine ist gewählt (siehe Bedienkonzepte).' },
      { zeige: '#bild-a', name: 'Symmetriegerüst', text: 'Eine Elementarzelle mit allen Symmetrieelementen und dem Objekt mit seinen Bildern. Das Objekt lässt sich ziehen; eine Stelle antippen setzt es dorthin.' },
      { zeige: '#erkl-leiste', name: 'Leiste der Erklärung', text: 'Schritt zurück und weiter, die Nummer des Schritts, „Abspielen“ und Schliessen; nur, solange eine Erklärung gewählt ist.' },
      LEGENDE,
    ],
  },
  { id: 'tafel-b', modus: 'eg', titel: 'Tafel Muster', ausschnitt: '.p-b', eintraege: TAFEL_B },
  {
    id: 'kenndaten', modus: 'eg', titel: 'Kenndaten', ausschnitt: '#info',
    text: '<p>Aufgebaut wie eine Seite der International Tables (siehe <a href="skript.html#ita-seite">Skript, Abschn. 6</a>).</p>',
    eintraege: [
      { zeige: '#info .info-head', name: 'Symbol', text: 'Hermann-Mauguin-Symbol, Nummer und Kristallsystem der Gruppe.' },
      { zeige: '#info .lagebox', name: 'Lage des Objekts', text: 'Wyckoff-Lage, Lagesymmetrie und wie oft das Objekt je Zelle erscheint.' },
      { zeige: '#info .facts', name: 'Eckdaten', text: 'Bravais-Gitter, Punktgruppe (Link in die App „Stereographische Projektion“), Signatur nach Conway, Operationen je Zelle, Ursprung, asymmetrische Einheit.' },
      { zeige: '#info .aeteile', name: 'Bedingungen der asymmetrischen Einheit', text: 'Eine Bedingung antippen: Das Symmetriegerüst zeigt, wo sie erfüllt ist; alle zusammen ergeben die asymmetrische Einheit.' },
      { zeige: '#info > div > .tabwrap', name: 'Symmetrieoperationen', text: 'Koordinaten und Symmetrieoperation jeder Operation wie in den International Tables.' },
      { zeige: '#info > .tabwrap', name: 'Lagen', text: 'Die Wyckoff-Lagen; „setzen“ legt das Objekt auf eine Lage.' },
      { zeige: '#info .explain > summary', name: 'Erläuterungen', text: 'Ausführlichere Erklärungen zu den Angaben, eingeklappt.' },
    ],
  },
  // Gitter und Basis
  {
    id: 'seitenleiste', modus: 'struktur', titel: 'Seitenleiste',
    eintraege: [
      EXPERIMENTE_E,
      { id: 'struktur', zeige: '#ctl-struktur > h2', name: 'Gitter und Basis', text: 'Eine Vorgabe laden und wiederherstellen; Symmetrieelemente, konventionelle Zelle, asymmetrische Einheit und Bindungen ein- und ausblenden.' },
      { id: 'basis', zeige: '#sec-basis > summary', name: 'Basis', text: 'Form und Farbe des Motivs, Drehung, Gespiegelt (nur bei chiralen Motiven), Grösse; gilt für das gewählte Motiv, ohne Wahl für das nächste neue.' },
      { id: 'sgitter', zeige: '#sec-sgitter > summary', name: 'Gitter', text: 'b/a und γ der gegebenen Zelle, ohne Bindung an ein Kristallsystem; zwei Knöpfe setzen quadratische bzw. hexagonale Metrik.' },
      DARSTELLUNG_E, RESET_E,
    ],
  },
  {
    id: 'tafel-a', modus: 'struktur', titel: 'Tafel Struktur', ausschnitt: '.p-a',
    eintraege: [
      EINRASTEN, ZOOM_A, EXPORT_A,
      { zeige: '.p-a [aria-label="Werkzeug"]', name: 'Werkzeuge', text: '<b>Wählen und ziehen</b> (Pfeil): Motiv antippen wählt es, Ziehen verschiebt es, Ziehen ins Leere verschiebt bei Zoom den Ausschnitt. <b>Hinzufügen</b> (+): eine Stelle antippen setzt ein neues Motiv mit den Einstellungen der Basis.' },
      { zeige: '.p-a [aria-label="Bearbeiten"]', name: 'Bearbeiten', text: '<b>Rückgängig</b> nimmt die letzte Änderung an den Motiven zurück, <b>Gewähltes Motiv entfernen</b> und <b>Alle Motive löschen</b> (Papierkorb) leeren die Basis teilweise oder ganz.' },
      { zeige: '#bild-a', name: 'Struktur', text: 'Gegebene Zelle (a, b) und konventionelle Zelle (a′, b′) mit den Symmetrieelementen der bestimmten Gruppe.' },
      LEGENDE,
    ],
  },
  { id: 'tafel-b', modus: 'struktur', titel: 'Tafel Muster', ausschnitt: '.p-b', eintraege: TAFEL_B },
  {
    id: 'kenndaten', modus: 'struktur', titel: 'Kenndaten', ausschnitt: '#info',
    eintraege: [
      { zeige: '#info .info-head', name: 'Bestimmte Gruppe', text: 'Symbol, Nummer und Kristallsystem der Gruppe, die die App aus Gitter und Basis bestimmt; „im Modus „Ebenengruppen“ ansehen“.' },
      { zeige: '#info #s-weiter', name: 'In „Muster entwerfen“ weiterbearbeiten', text: 'Übernimmt die Struktur mit ihrer Gruppe in den Entwurf und ersetzt ihn; darunter, was dabei geschieht oder warum es nicht geht.' },
      { zeige: '#info .facts', name: 'Eckdaten', text: 'Bravais-Gitter, Punktgruppe, Operationen je Zelle, konventionelle Zelle und Ursprung nach den International Tables.' },
      { zeige: '#info > .tabwrap', name: 'Basis', text: 'Je Motiv seine Lage in beiden Zellen, Wyckoff-Lage und Lagesymmetrie; nach einer Änderung auch, wie sich die Gruppe geändert hat.' },
    ],
  },
  // Muster entwerfen
  {
    id: 'seitenleiste', modus: 'entwurf', titel: 'Seitenleiste', adresse: ENTWURF,
    eintraege: [
      EXPERIMENTE_E,
      { id: 'entwurfgruppe', zeige: '#ctl-entwurf > h2', name: 'Ebenengruppe', text: 'Die Gruppe des Entwurfs; Symmetrieelemente, asymmetrische Einheit und Bindungen ein- und ausblenden.' },
      { id: 'basis', zeige: '#sec-basis > summary', name: 'Basis', text: 'Wie in „Gitter und Basis“; die Einstellungen gelten für die ganze Bahn des gewählten Motivs.' },
      { id: 'sgitter', zeige: '#sec-sgitter > summary', name: 'Gitter', text: 'b/a und γ, soweit das Kristallsystem der Gruppe sie freigibt.' },
      DARSTELLUNG_E, RESET_E,
    ],
  },
  {
    id: 'tafel-a', modus: 'entwurf', titel: 'Tafel Entwurf', ausschnitt: '.p-a', adresse: ENTWURF,
    eintraege: [
      EINRASTEN, ZOOM_A, EXPORT_A,
      { zeige: '.p-a [aria-label="Werkzeug"]', name: 'Werkzeuge', text: '<b>Wählen und ziehen</b> (Pfeil): ein Bild antippen wählt seine Bahn, Ziehen verschiebt sie. <b>Hinzufügen</b> (+): eine Stelle antippen setzt ein neues Motiv mit allen Bildern. <b>Zeichnen</b> (Stift): Ziehen zeichnet einen Strich in der Farbe der Atomsorte, mit allen Operationen der Gruppe. <b>Radieren</b>: Ziehen entfernt die überfahrenen Stücke der Striche, an allen Kopien zugleich.' },
      { zeige: '.p-a [aria-label="Bearbeiten"]', name: 'Bearbeiten', text: '<b>Rückgängig</b> nimmt die letzte Änderung an Motiven oder Strichen zurück, <b>Gewählte Bahn entfernen</b> das gewählte Motiv mit allen Bildern; die beiden Papierkörbe löschen alle Motive bzw. alle Striche, das jeweils andere bleibt. Striche stehen nur im Speicher des Browsers, nicht im Link.' },
      { zeige: '#bild-a', name: 'Entwurf', text: 'Elementarzelle mit den Symmetrieelementen der gewählten Gruppe, den Motiven und Strichen.' },
      LEGENDE,
    ],
  },
  { id: 'tafel-b', modus: 'entwurf', titel: 'Tafel Muster', ausschnitt: '.p-b', adresse: ENTWURF, eintraege: TAFEL_B },
  {
    id: 'kenndaten', modus: 'entwurf', titel: 'Kenndaten', ausschnitt: '#info', adresse: ENTWURF,
    eintraege: [
      { zeige: '#info .info-head', name: 'Gewählte Gruppe', text: 'Symbol, Nummer und Kristallsystem; gewählt, nicht bestimmt; „im Modus „Ebenengruppen“ ansehen“.' },
      { zeige: '#info .facts', name: 'Eckdaten', text: 'Bravais-Gitter, Punktgruppe, Operationen je Zelle.' },
      { zeige: '#info > .tabwrap', name: 'Motive', text: 'Je Motiv Wyckoff-Lage, Lagesymmetrie und Zahl der Bilder, auch der übereinanderliegenden.' },
    ],
  },
];

/** Weitere Anleitungen (nur auf der Hilfeseite). @type {Ablauf[]} */
export const ANLEITUNGEN = [
  {
    id: 'erklaeren', modus: 'eg', titel: 'Eine Gruppe Schritt für Schritt erklären lassen',
    schritte: [
      { frage: '<b>„Schritt für Schritt“ wählen.</b> Das Objekt wird mit der ersten Operation der Liste abgebildet.', handlung: { text: 'In <i>p</i>4<i>mm</i> starten', hash: '#m=eg&g=p4mm&schritt=1' }, zeige: '#erkl-schritt' },
      { frage: '<b>Durchschalten.</b> ◀ und ▶ unter der Zeichnung gehen einen Schritt zurück oder weiter, „Abspielen“ läuft alle ab. Die Kenndaten markieren die Zeile der Operation.', handlung: { text: 'Schritt 4 zeigen', hash: '#m=eg&g=p4mm&schritt=4' }, zeige: '#erkl-leiste' },
      { frage: '<b>„Herkunft der Elemente“.</b> Ein Symmetrieelement antippen: Die App zeigt, aus welchen zwei Operationen es folgt, und das Fähnchen läuft die Schritte ab.', handlung: { text: 'Herkunft eines Drehpunkts', hash: '#m=eg&g=p4mm&herkunft=1&erkl=4;1/2,1/2' }, zeige: '#erkl-herkunft' },
      { frage: '<b>Beenden.</b> × in der Leiste schliesst die Erklärung, ebenso ein zweiter Klick auf den gewählten Knopf.', zeige: '#erkl-leiste' },
    ],
  },
  {
    id: 'asymmetrisch', modus: 'eg', titel: 'Die asymmetrische Einheit über ihre Bedingungen finden',
    schritte: [
      { frage: '<b>Asymmetrische Einheit einblenden.</b>', handlung: { text: 'In <i>p</i>4<i>mm</i> einblenden', hash: '#m=eg&g=p4mm&ae=1' }, zeige: '#opt-ae' },
      { frage: '<b>Eine Bedingung antippen.</b> Sie steht in den Kenndaten unter „Asymmetrische Einheit“; das Symmetriegerüst schattiert, wo sie erfüllt ist. Weitere antippen: Zusammen ergeben sie die asymmetrische Einheit.', handlung: { text: 'Erste Bedingung zeigen', hash: '#m=eg&g=p4mm&ae=1&aet=0' }, zeige: '#info .aeteile' },
    ],
  },
  {
    id: 'bestimmen', modus: 'struktur', titel: 'Eine Struktur aufbauen und ihre Gruppe bestimmen lassen',
    schritte: [
      { frage: '<b>Von einer Vorgabe ausgehen.</b> Die Auswahl „Vorgabe“ lädt Gitter und Basis; „Vorgabe wiederherstellen“ kehrt zu ihr zurück.', handlung: { text: 'Dreiecksbeispiel laden', hash: '#m=struktur&v=dreieck1' }, zeige: '#s-vorgabe' },
      { frage: '<b>Motive setzen.</b> Mit „Hinzufügen“ eine Stelle antippen; Form, Farbe, Drehung und Grösse stehen im Abschnitt „Basis“.', zeige: '#s-werkzeug-hinzufuegen' },
      { frage: '<b>Motive verschieben.</b> Mit „Wählen und ziehen“ ein Motiv antippen und ziehen; „Einrasten“ hilft, Zwölftel der Zelle zu treffen.', zeige: '#bild-a' },
      { frage: '<b>Gruppe ablesen.</b> Die Kenndaten nennen nach jeder Änderung die bestimmte Gruppe, ihre konventionelle Zelle und je Motiv die Lage.', zeige: '#info .info-head' },
      { frage: '<b>Weiterbearbeiten.</b> „In „Muster entwerfen“ weiterbearbeiten“ übernimmt die Struktur mit ihrer Gruppe in den Entwurf.', zeige: '#info #s-weiter' },
    ],
  },
  {
    id: 'zeichnen', modus: 'entwurf', titel: 'Ein Muster in einer Gruppe zeichnen',
    schritte: [
      { frage: '<b>Gruppe wählen.</b> Gruppe und Zelle bleiben danach fest.', handlung: { text: '<i>p</i>4<i>gm</i> wählen', hash: '#m=entwurf&g=p4gm' }, zeige: '#ctl-entwurf > h2' },
      { frage: '<b>Werkzeug „Zeichnen“ wählen</b> und eine Farbe (Atomsorte) im Abschnitt „Basis“.', zeige: '#s-werkzeug-zeichnen' },
      { frage: '<b>In der Zelle ziehen.</b> Jeder Strich erscheint sofort mit allen Operationen der Gruppe, in der Zelle und im Muster.', zeige: '#bild-a' },
      { frage: '<b>Korrigieren.</b> „Radieren“ entfernt überfahrene Stücke, „Rückgängig“ den letzten Schritt. Eine andere Gruppe wählen behält die Striche; ihre Bilder entstehen neu.', zeige: '#rueckgaengig' },
    ],
  },
];

/** Typische Fragen. @type {HilfeFrage[]} */
export const FRAGEN = [
  {
    id: 'weniger-bilder', frage: 'Warum sehe ich weniger Bilder des Objekts als erwartet?',
    antwort: '<p>Das Objekt liegt auf einem Symmetrieelement (spezielle Lage); dann fallen Bilder zusammen. Die Kenndaten nennen Wyckoff-Lage, Lagesymmetrie und Zähligkeit. Liegt ein Bild auf einer Kante oder Ecke der Zelle, gehört es nur anteilig zu ihr.</p>',
    app: '#m=eg&g=p4mm&x=1/2&y=1/2', skript: 'allgemein-speziell',
  },
  {
    id: 'gitter-gesperrt', frage: 'Warum lässt sich γ oder b/a nicht verändern?',
    antwort: '<p>Das Kristallsystem der Gruppe legt den Wert fest (z. B. γ = 90° im rechteckigen System); der Grund steht unter dem Regler. In „Gitter und Basis“ ist das Gitter frei; dort folgt die Gruppe aus Gitter und Basis.</p>',
    app: '#m=eg&g=p2mm', skript: 'kristallsysteme',
  },
  {
    id: 'gruppe-wechselt', frage: 'Warum wechselt die bestimmte Ebenengruppe, wenn ich ein Motiv verschiebe?',
    antwort: '<p>Die Gruppe folgt aus Gitter und Basis zusammen. Ein verschobenes, gedrehtes oder anders gefärbtes Motiv kann Symmetrie brechen oder schaffen. Die Kenndaten sagen nach der Änderung, wie sich die Gruppe geändert hat.</p>',
    app: '#m=struktur&v=dreieck1', skript: 'gitter-und-motiv',
  },
  {
    id: 'uebereinander', frage: 'Warum liegen im Entwurf mehrere Bilder übereinander?',
    antwort: '<p>Das Motiv liegt auf einem Symmetrieelement, hat aber nicht dessen Lagesymmetrie (z. B. ein Fähnchen auf einem Drehpunkt). Die App zeigt dann alle Bilder; die Kenndaten nennen, wie viele übereinanderliegen. Ein Motiv mit passender Eigensymmetrie erscheint dort einmal.</p>',
    skript: 'wyckoff',
  },
  {
    id: 'gruppe-gesperrt', frage: 'Warum ist im Entwurf eine Gruppe gesperrt?',
    antwort: '<p>Mit ihr gäbe es mehr als 48 Bilder. Jede Bahn zählt mit der Zähligkeit der allgemeinen Lage der Gruppe. Motive entfernen gibt sie wieder frei.</p>',
  },
  {
    id: 'fuellen-gesperrt', frage: 'Warum ist „Asymmetrische Einheit füllen“ gesperrt?',
    antwort: '<p>In „Gitter und Basis“ gibt es ohne Motive keine Gruppe und damit keine asymmetrische Einheit. Während einer Erklärung in „Ebenengruppen“ ruht das Füllen, bleibt aber gewählt.</p>',
  },
  {
    id: 'zurueck', frage: 'Wie komme ich zur Ausgangsansicht zurück?',
    antwort: '<p>„Ganze Zeichnung zeigen“ bzw. „Startgrösse“ im Kopf einer Tafel setzt den Zoom zurück. „Objekt zurücksetzen“, „Gitter zurücksetzen“ und „Vorgabe wiederherstellen“ wirken auf ihren Abschnitt, „Alle Einstellungen zurücksetzen“ ganz unten in der Seitenleiste auf die ganze App.</p>',
  },
];

/** Ergänzungen der gemeinsamen Texte (nach Kennung in hilfe-gemeinsam.js). */
export const ERGAENZUNGEN = {
  export: '<p>Hier: beide Tafeln als Kopie, SVG oder PNG.</p>',
  tastatur: '<p>Tafel A nimmt den Fokus an: Dann verschieben die Pfeiltasten bei Zoom den Ausschnitt, + und − zoomen. Das Objekt in „Ebenengruppen“ stellen statt des Ziehens die Regler x und y im Abschnitt „Objekt“ ein.</p>',
};
