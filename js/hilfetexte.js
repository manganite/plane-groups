// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Mechanik steht in lib/common/js/help.js. Begriffe wie im Skript.

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  'tab-eg': 'Die 17 Ebenengruppen: Symmetrieelemente, Lagen und Muster.',
  'tab-struktur': 'Gitter und Basis: eine Struktur aus Gitter und Motiven aufbauen; die App bestimmt ihre Ebenengruppe.',
  'tab-entwurf': 'Muster entwerfen: eine Ebenengruppe wählen, Motive setzen und Striche zeichnen; jedes erscheint mit allen Operationen der Gruppe. Die Gruppe bleibt fest, die App bestimmt nichts.',
  's-vorgabe': 'Fertige Strukturen: Bravais-Gitter, ein Dreiecksbeispiel in drei Stufen, 2D-Materialien in Draufsicht, Archimedische Parkettierungen, Mauerwerk und Pflaster sowie künstliches Spin-Eis.',
  's-zuruecksetzen': 'Gitter und Basis wieder wie in der gewählten Vorgabe.',
  's-elemente': 'Symmetrieelemente der gefundenen Ebenengruppe über der Struktur, in der konventionellen Zelle.',
  's-zelle': 'Konventionelle Zelle nach den International Tables (a′, b′), mit dem Ursprung nach ITA. Sie kann von der gegebenen Zelle abweichen.',
  's-ae': 'Asymmetrische Einheit der gefundenen Ebenengruppe, in der konventionellen Zelle.',
  's-bindungen': 'Linien zwischen nächsten Nachbarn: zwischen Atomen, deren Abstand der kleinste Atomabstand der Struktur ist (bis 5 % mehr). Nur für das Motiv „Atom“.',
  's-werkzeug-verschieben': 'Werkzeug: Motiv antippen wählt es; Ziehen verschiebt es (alle Gitterbilder folgen).',
  's-werkzeug-hinzufuegen': 'Werkzeug: Stelle antippen setzt ein neues Motiv mit den Einstellungen unter „Basis“.',
  's-motiv': 'Form des Motivs, in Zeilen nach eigener Symmetrie: Atom; ohne Eigensymmetrie (Fähnchen, Blatt, Tropfen, Ranke); nur Drehsymmetrie (Windräder 2, 3, 4, 6); mit Spiegelsymmetrie (Dreiecke, Ziegel, Insel, Quadrat, Sechseck). Der Tooltip nennt Name und Punktgruppe. Gilt für das gewählte Motiv oder für das nächste neue.',
  's-farbe': 'Atomsorte: Motive verschiedener Farbe sind verschieden und werden nie aufeinander abgebildet.',
  's-winkel': 'Drehung des Motivs im Uhrzeigersinn, ab der Richtung von b.',
  's-spiegel': 'Spiegelbild des Motivs; gespiegelt wird vor der Drehung (beim Fähnchen an der Stange). Wirkt nur bei Motiven ohne eigene Spiegellinie (Fähnchen, Ornamente, Windräder); die übrigen sehen gespiegelt gleich aus.',
  's-fuge': 'Ziegel mit gleich breiten Fugen: Das Rechteck schrumpft rundum um 5 % der Länge (0,1 Einheiten, wenn die Grösse eine halbe Einheit der Länge ist). Ohne Fuge füllt der Ziegel sein Raster lückenlos: Grösse = halbe Länge, in einer Läuferverband-Zelle mit a = b = 1 also 0,5. Nur beim Ziegel.',
  's-groesse': 'Grösse des Motivs (in Einheiten von a), von 0,02 bis 1. Der Regler ist logarithmisch: Der Bereich der Atome (etwa 0,05 bis 0,2) liegt in der Mitte und lässt sich fein einstellen.',
  'e-picker': 'Ebenengruppe des Entwurfs wählen. Die Motive bleiben erhalten, ihre Bilder entstehen unter der neuen Gruppe neu; das Gitter bleibt, wenn es zum Kristallsystem passt, sonst gilt dessen Startgitter. Gesperrt sind Gruppen, mit denen es mehr als 48 Bilder würden.',
  'e-elemente': 'Symmetrieelemente der gewählten Gruppe über dem Entwurf.',
  'e-ae': 'Asymmetrische Einheit der gewählten Gruppe.',
  'e-bindungen': 'Linien zwischen nächsten Nachbarn: zwischen Atomen, deren Abstand der kleinste Atomabstand im Muster ist (bis 5 % mehr). Hilft, ein Gitter gezielt aufzubauen. Nur für das Motiv „Atom“.',
  's-weiter': 'Die Struktur mit der bestimmten Gruppe in den Modus „Muster entwerfen“ übernehmen (umgerechnet auf die Zelle und den Ursprung nach ITA). Gruppe und Zelle bleiben dort fest; der bisherige Entwurf geht verloren, einen Weg zurück gibt es nicht.',
  's-entfernen': 'Das gewählte Motiv aus der Basis entfernen; im Entwurf seine ganze Bahn.',
  's-einrasten': 'Beim Ziehen springen die Koordinaten auf Vielfache von 1/12 (darunter ½, ⅓, ¼), die Drehung auf Vielfache von 15°. Im Entwurf rastet ein Motiv zuerst auf spezielle Lagen (Drehpunkte, Spiegellinien) ein.',
  's-ba': 'Verhältnis b/a der gegebenen Zelle. Die Motive behalten ihre Bruchkoordinaten.',
  's-gamma': 'Winkel γ zwischen a und b der gegebenen Zelle.',
  's-metrik': 'Gitter auf quadratische oder hexagonale Metrik setzen (nur in „Gitter und Basis“).',
  'copy-link': 'Link auf genau diese Ansicht in die Zwischenablage kopieren.',
  'opt-elemente': 'Drehpunkte, Spiegellinien (durchgezogen) und Gleitspiegellinien (gestrichelt) der Elementarzelle, mit den Symbolen der International Tables.',
  'opt-objekt': 'Ein Objekt ohne eigene Symmetrie in allgemeiner Lage. Alle Operationen der Gruppe wirken darauf; das Ausgangsobjekt ist gestrichelt umkreist.',
  'opt-ae': 'Kleinster Teil der Elementarzelle, aus dem die Operationen die ganze Zelle lückenlos erzeugen (nach International Tables).',
  'opt-zellen': 'Vier Elementarzellen statt einer: zeigt, wie sich die Symmetrieelemente mit dem Gitter wiederholen.',
  'seg-form': 'Fähnchen oder Kreis mit Komma wie in den International Tables. Das Komma bzw. die Fahne auf der anderen Seite kennzeichnet das Spiegelbild.',
  'opt-orbit': 'Wie in den Diagrammen der allgemeinen Lage in ITA: auch die Bilder im Rand rund um die Zelle (⅓ der Zelle), damit die Gruppen um Ecken und Ränder vollständig sind.',
  'opt-einrasten': 'Nahe einem Drehpunkt oder einer Spiegellinie springt das Objekt beim Ziehen auf das Symmetrieelement (spezielle Lage).',
  'obj-x': 'Koordinate x des Ausgangsobjekts in Bruchteilen von a.',
  'obj-y': 'Koordinate y des Ausgangsobjekts in Bruchteilen von b.',
  'obj-groesse': 'Grösse des Objekts (Fähnchen oder Komma) im Verhältnis zur Zelle, in beiden Tafeln gleich wie die Motive der Basis; etwa für ein Muster mit grossen Objekten. „Schritt für Schritt“, der Aufbau aus Erzeugenden und „Herkunft der Elemente“ zeigen es im Symmetriegerüst in fester Grösse.',
  'reset-objekt': 'Objekt zurück an die Ausgangslage und auf die normale Grösse.',
  'lat-ba': 'Verhältnis der Gitterkonstanten b/a. Frei im schiefwinkligen und im rechteckigen System.',
  'lat-gamma': 'Winkel γ zwischen a und b. Frei nur im schiefwinkligen System.',
  'reset-gitter': 'Gitterparameter auf die Startwerte dieses Kristallsystems zurücksetzen.',
  'v-farben': 'Symmetrieelemente in der Farbe ihrer Blickrichtung (Position im Hermann-Mauguin-Symbol): Drehpunkte, Spiegel- und Gleitspiegellinien nach der Richtung ihrer Normalen. Gilt in allen Modi.',
  'v-muster-el': 'Die Symmetrieelemente auch im Muster einblenden. In „Gitter und Basis“ sind es die der bestimmten Gruppe, in ihrer konventionellen Zelle, im Entwurf die der gewählten.',
  'v-zoom': 'Vergrössert das Muster (über 1) oder zeigt einen grösseren Ausschnitt (unter 1); Zellen und Objekte ändern sich im selben Verhältnis.',
  'v-tapete': 'Das Muster wie eine Tapete: ohne Zelle und Symmetrieelemente, im selben Massstab. In „Ebenengruppen“ alles in einer Farbe; in „Gitter und Basis“ und im Entwurf behalten die Motive ihre Farben. Mehr davon zeigt eine Vergrösserung unter 1.',
  's-werkzeug-zeichnen': 'Werkzeug (nur im Entwurf): Ziehen zeichnet einen Strich in der Farbe der gewählten Atomsorte. Die Gruppe vervielfältigt ihn mit allen Operationen, auch im Muster. Schliesst sich mit „Wählen und ziehen“, „Hinzufügen“ und „Radieren“ aus.',
  'werkzeug-lupe': 'Die Tafel mit dem Symmetriegerüst (in „Gitter und Basis“ und im Entwurf: mit der Struktur) doppelt so gross zeigen, etwa um ein Objekt in p6mm genau zu setzen: in „Ebenengruppen“ um das Objekt, sonst um das gewählte Motiv, ohne Wahl um die Mitte der Zelle. Die Ansicht folgt, wenn man loslässt. In „Ebenengruppen“ ruht sie, solange „Schritt für Schritt“, der Aufbau aus Erzeugenden oder „Herkunft der Elemente“ aktiv ist.',
  's-werkzeug-radieren': 'Werkzeug (nur im Entwurf): Über Striche ziehen radiert die überfahrenen Stücke, am Original und an allen Kopien zugleich; ein Strich behält seine Farbe. Gesperrt, solange es keine Striche gibt.',
  'zeichnen-zurueck': 'Den letzten Strich oder das letzte Radieren rückgängig machen (die Motive bleiben).',
  'zeichnen-loeschen': 'Alle Striche entfernen (die Motive bleiben). „Rückgängig“ holt sie zurück.',
  'opt-fuell': 'Die asymmetrische Einheit füllen und mit allen Operationen vervielfältigen: Ihre Bilder pflastern die Ebene ohne Lücken und Überlappungen. In „Gitter und Basis“ ist es die der bestimmten Gruppe (ohne Motive gibt es keine), im Entwurf die der gewählten.',
  'opt-herkunft': 'Ein Symmetrieelement im Symmetriegerüst antippen zeigt, aus welchen zwei Operationen es folgt, am Fähnchen Schritt für Schritt. Lässt sich mit dem schrittweisen Aufbau kombinieren: ein neu hinzugekommenes Element antippen.',
  'opt-schritt': 'Das Objekt wird mit den Symmetrieoperationen einzeln abgebildet, in der Reihenfolge der International Tables; zuletzt verschieben die Gittertranslationen alle Bilder in die Zelle. Ein Zähler zeigt, wie viele verschiedene Stellen entstehen.',
  'schritt-regler': 'Schritt: Operation (1), (2), … der Liste, zuletzt die Gittertranslationen.',
  'schritt-zurueck': 'Einen Schritt zurück.',
  'schritt-vor': 'Einen Schritt weiter.',
  'schritt-abspielen': 'Alle Schritte nacheinander zeigen.',
  'opt-aufbau': 'Die Symmetrieelemente der Reihe nach aus den Erzeugenden aufbauen: zuerst die Erzeugenden nach den International Tables, dann was aus ihren Verknüpfungen folgt.',
  'aufbau-schritt': 'Schritt im Aufbau. Ein Schritt verknüpft jede bisherige Operation mit einer Erzeugenden oder einer Gittertranslation.',
  'aufbau-zurueck': 'Einen Schritt zurück.',
  'aufbau-vor': 'Einen Schritt weiter: Die neu hinzukommenden Elemente sind hervorgehoben.',
  'reset-alles': 'Alle Einstellungen und den gespeicherten Zustand löschen und die App neu starten (der Fortschritt im Quiz und der Stand der Experimente bleiben).',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  { heading: '#ctl-struktur > h2', intro: 'Eine Struktur ist Gitter plus Basis. Die App bestimmt aus beiden die Ebenengruppe und zeigt sie mit konventioneller Zelle und Symmetrieelementen.', ids: ['s-vorgabe', 's-zuruecksetzen', 's-elemente', 's-zelle', 's-ae', 's-bindungen'] },
  { heading: '#sec-basis > summary', intro: 'Die Basis: Motive mit eigener Symmetrie an Lagen in der Zelle. Werkzeuge über der Struktur: „Wählen und ziehen“ und „Hinzufügen“.', ids: ['s-werkzeug-verschieben', 's-werkzeug-hinzufuegen', 'werkzeug-lupe', 's-motiv', 's-farbe', 's-winkel', 's-spiegel', 's-fuge', 's-groesse', 's-entfernen', 's-einrasten'] },
  { heading: '#sec-zeichnen > summary', intro: 'Striche statt Motive: Zeichnen Sie etwas, die Gruppe macht daraus ein Muster. Striche und Motive lassen sich kombinieren; Striche haben die Farbe einer Atomsorte, Spiegelbilder dieselbe.', ids: ['s-werkzeug-zeichnen', 's-werkzeug-radieren', 'zeichnen-zurueck', 'zeichnen-loeschen'] },
  { heading: '#sec-sgitter > summary', intro: 'Gitter der gegebenen Zelle; in „Gitter und Basis“ ohne Bindung an ein Kristallsystem, im Entwurf innerhalb des Kristallsystems der Gruppe.', ids: ['s-ba', 's-gamma', 's-metrik'] },
  { heading: '#sec-weiter > summary', intro: 'Eine Struktur aus „Gitter und Basis“ als Muster weiterbearbeiten, in der bestimmten Gruppe.', ids: ['s-weiter'] },
  { heading: '#ctl-entwurf > h2', intro: 'Muster entwerfen: Man wählt die Gruppe, setzt Motive und zeichnet Striche; jedes erscheint mit allen Operationen der Gruppe. Gruppe und Zelle bleiben fest, die App bestimmt die Symmetrie nicht.', ids: ['e-picker', 'e-elemente', 'e-ae', 'e-bindungen'] },
  { heading: '#ctl-gruppe > h2', intro: 'Gruppe antippen: Links erscheint das Symmetriegerüst einer Elementarzelle, rechts ein Ausschnitt des Musters. Das Objekt lässt sich im Symmetriegerüst ziehen.', ids: ['opt-elemente', 'opt-objekt', 'opt-ae', 'opt-zellen', 'seg-form', 'seg-ornament', 'opt-einrasten', 'opt-orbit'] },
  { heading: '#sec-schritte > summary', intro: 'Wie erzeugen die Symmetrieoperationen aus einem Objekt das ganze Muster? Hier wirken sie einzeln.', ids: ['opt-schritt', 'schritt-regler', 'schritt-zurueck', 'schritt-vor', 'schritt-abspielen'] },
  { heading: '#sec-aufbau > summary', intro: 'Welche Symmetrieelemente folgen zwangsläufig aus wenigen Erzeugenden, und aus welchen Operationen entsteht ein bestimmtes Element?', ids: ['opt-aufbau', 'aufbau-schritt', 'aufbau-zurueck', 'aufbau-vor', 'opt-herkunft'] },
  { heading: '#sec-objekt > summary', intro: 'Lage des Ausgangsobjekts in Bruchkoordinaten. Zum genauen Setzen hilft die Lupe über dem Symmetriegerüst.', ids: ['obj-x', 'obj-y', 'obj-groesse', 'werkzeug-lupe'] },
  { heading: '#sec-gitter > summary', intro: 'Die Gitterparameter dürfen sich innerhalb des Kristallsystems frei ändern; die Symmetrie bleibt dabei erhalten.', ids: ['lat-ba', 'lat-gamma'] },
  { heading: '#sec-view > summary', ids: ['v-farben', 'v-muster-el', 'v-tapete', 'opt-fuell', 'v-zoom'] },
];

/** Beschriftung in der ⓘ-Erklärung, wo der Text des Elements nicht passt. */
export const LABELS = {
  'seg-form': 'Form des Objekts',
  'obj-x': 'x',
  'obj-y': 'y',
  'lat-ba': 'b/a',
  'lat-gamma': 'γ',
  'aufbau-zurueck': 'zurück',
  'schritt-zurueck': 'zurück',
  'zeichnen-zurueck': 'Rückgängig',
  'zeichnen-loeschen': 'Alles löschen',
  'schritt-vor': 'weiter',
  'aufbau-vor': 'weiter',
  's-farbe': 'Atomsorte',
  'e-picker': 'Ebenengruppe',
  's-metrik': 'Metrik setzen',
  's-ba': 'b/a',
  's-gamma': 'γ',
};

/** @import { Ablauf } from '../lib/common/js/ablauf.js' */
/**
 * Erste Schritte (lib/common/js/ablauf.js mit liste: false, Leitfaden Abschn. 5.3): je Modus wenige kurze
 * Schritte zur Bedienung, ohne Vermutung; der letzte öffnet die Experimente. Tafeln mit Namen, nicht „links/rechts“
 * (auf dem Telefon sind sie umschaltbar). Zugleich die Anleitungen der Hilfeseite (js/hilfe-daten.js): zeige =
 * Bedienelement, das ihr Bild markiert (tools/common/hilfe-bilder.mjs).
 * @type {Ablauf[]}
 */
export const ERSTE_SCHRITTE = [
  {
    id: 'einstieg-eg', modus: 'eg', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Ebenengruppe wählen.</b> Das Symmetriegerüst zeigt eine Elementarzelle mit Drehpunkten, Spiegel- und Gleitspiegellinien, das Muster einen Ausschnitt der Ebene.',
        handlung: { text: '<i>p</i>4<i>gm</i> wählen', hash: '#m=eg&g=p4gm' }, zeige: '#picker' },
      { frage: '<b>Fähnchen ziehen.</b> Alle Bilder folgen. Auf einer Spiegellinie oder einem Drehpunkt rastet es ein: spezielle Lage, weniger Bilder.',
        handlung: { text: 'Auf eine Spiegellinie setzen', hash: '#m=eg&g=p4gm&x=0.15&y=0.65' }, zeige: '#bild-a' },
      { frage: '<b>Ausprobieren.</b> Unter „Experimente“ stehen kleine Versuche, etwa zu Gleitspiegellinien, Drehpunkten, Lagen und zur asymmetrischen Einheit: erst vermuten, dann ausprobieren.',
        handlung: { text: 'Experimente öffnen', aktion: 'experimente' }, zeige: '#sec-experimente > summary' },
    ],
  },
  {
    id: 'einstieg-struktur', modus: 'struktur', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Struktur ansehen.</b> Gitter und Basis: zwei Dreiecke in einer rechteckigen Zelle. Die App bestimmt daraus die Ebenengruppe, hier <i>pm</i> (unten), und zeichnet konventionelle Zelle und Symmetrieelemente ein.',
        handlung: { text: 'Dreiecksbeispiel laden', hash: '#m=struktur&v=dreieck1' }, zeige: '#s-vorgabe' },
      { frage: '<b>Selbst bauen.</b> Mit „Hinzufügen“ über der Struktur neue Motive setzen, mit „Wählen und ziehen“ verschieben; unter „Gitter“ Achsenverhältnis und Winkel ändern. Die App bestimmt die Symmetrie jedes Mal neu.',
        handlung: { text: '„Hinzufügen“ wählen', aktion: 'hinzufuegen' }, zeige: '#s-werkzeug-hinzufuegen' },
      { frage: '<b>Ausprobieren.</b> Unter „Experimente“ stehen kleine Versuche, etwa zu Gitterpunkten, entfernten Motiven, Mauerwerk und Farbe. Erst vermuten, dann ausprobieren.',
        handlung: { text: 'Experimente öffnen', aktion: 'experimente' }, zeige: '#sec-experimente > summary' },
    ],
  },
  {
    id: 'einstieg-entwurf', modus: 'entwurf', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Ebenengruppe wählen.</b> Gruppe und Zelle bleiben im Entwurf fest; die App bestimmt nichts, sie wendet die Operationen der gewählten Gruppe an.',
        handlung: { text: '<i>p</i>4<i>gm</i> wählen', hash: '#m=entwurf&g=p4gm' }, zeige: '#e-picker' },
      { frage: '<b>Motiv setzen.</b> Mit „Hinzufügen“ über dem Entwurf ein Motiv setzen, mit „Wählen und ziehen“ verschieben; es erscheint mit allen Operationen der Gruppe. Unter „Basis“ lässt es sich drehen, spiegeln und färben.',
        handlung: { text: '„Hinzufügen“ wählen', aktion: 'hinzufuegen' }, zeige: '#s-werkzeug-hinzufuegen' },
      { frage: '<b>Ausprobieren.</b> Unter „Experimente“ stehen kleine Versuche, etwa zu Motiven auf Drehpunkten und zu derselben Anordnung in verschiedenen Gruppen. Erst vermuten, dann ausprobieren.',
        handlung: { text: 'Experimente öffnen', aktion: 'experimente' }, zeige: '#sec-experimente > summary' },
    ],
  },
];

/**
 * Lernexperimente im Abschnitt „Experimente“ (lib/common/js/ablauf.js, Leitfaden Abschn. 5.3): erst vermuten,
 * dann die Handlung (Link-Adresse), dann Beobachtung und Erklärung. Je Modus 8 bis 12 Einträge zusammen mit den
 * erzeugten (js/experimente.js), geordnet nach den Kapiteln des Skripts; jedes spricht eine Fehlvorstellung an,
 * die im Kursmaterial auftaucht (#109). tests/ablauf.test.mjs prüft Adressen, Anker und den Inhalt (Zähligkeit,
 * Gruppe, Lage der Elemente) gegen die App.
 * @type {Ablauf[]}
 */
export const ABLAEUFE = [
  // ------------------------------------------------------------------ Modus „Ebenengruppen“
  {
    id: 'gleitung', modus: 'eg', titel: 'Wohin führt eine Gleitspiegelung?',
    schritte: [
      {
        frage: 'In <i>pg</i> liegt ein Fähnchen nahe der Gleitspiegellinie bei <i>x</i> = ½. Wo liegt sein Bild unter der Gleitspiegelung an dieser Linie?',
        vermutung: ['genau gegenüber, auf gleicher Höhe', 'gegenüber, um eine halbe Gitterperiode entlang der Linie verschoben', 'auf derselben Seite, nur entlang der Linie verschoben'], richtig: 1,
        handlung: { text: 'Fähnchen nahe an die Linie setzen', hash: '#m=eg&g=pg&x=2/5&y=1/4' },
        beobachtung: 'Das Bild bei (⅗, ¾) liegt jenseits der gestrichelten Linie, ist ein Spiegelbild (andere Farbe) und um <i>b</i>/2 entlang der Linie verschoben. Genau gegenüber liegt kein Fähnchen.',
        erklaerung: 'Eine Gleitspiegelung spiegelt und verschiebt um die halbe Gitterperiode entlang der Linie. Erst zweimal ausgeführt ergibt sie eine Translation des Gitters. Wer sie für eine Spiegelung hält, sucht das Bild an der falschen Stelle.',
        skript: 'gleitung',
      },
    ],
  },
  {
    id: 'zwei-spiegel', modus: 'eg', titel: 'Zwei Spiegelungen nacheinander',
    schritte: [
      {
        frage: 'In <i>pm</i> laufen parallele Spiegellinien bei <i>x</i> = 0 und <i>x</i> = ½. Was ergibt die Spiegelung an der einen, gefolgt von der Spiegelung an der anderen?',
        vermutung: ['die Identität: Zweimal spiegeln hebt sich auf', 'eine Translation um <i>a</i>, doppelt so weit wie der Abstand der Linien', 'eine Drehung um 180°'], richtig: 1,
        handlung: { text: 'Herkunft der Spiegellinie bei <i>x</i> = ½ zeigen', hash: '#m=eg&g=pm&herkunft=1&erkl=m;1/2,0;0,1' },
        beobachtung: 'Die App zeigt: Die Spiegelung an <i>x</i> = ½ ist die Spiegelung an <i>x</i> = 0, gefolgt von der Translation um <i>a</i>.',
        erklaerung: 'Daraus folgt: Spiegelt man zuerst an <i>x</i> = 0 und dann an <i>x</i> = ½, heben sich die beiden Spiegelungen an <i>x</i> = 0 auf, und es bleibt die Translation um <i>a</i>, doppelt so weit wie der Abstand der Linien. Nur zweimal an derselben Linie gespiegelt ergibt die Identität. Parallele Spiegellinien folgen deshalb im Abstand der halben kürzesten Translation senkrecht zu ihnen aufeinander, nicht erst im Abstand der ganzen.',
        skript: 'verknuepfung',
      },
    ],
  },
  {
    id: 'drehpunkte-p6', modus: 'eg', titel: 'Drehpunkte verschiedener Zähligkeit',
    schritte: [
      {
        frage: 'In <i>p</i>6 liegen auf den Ecken der Zelle 6-zählige Drehpunkte. Welche Zähligkeit hat der Drehpunkt bei (⅔, ⅓) im Innern der Zelle?',
        vermutung: ['6', '3', '2'], richtig: 1,
        handlung: { text: 'Herkunft des Drehpunkts zeigen', hash: '#m=eg&g=p6&herkunft=1&erkl=3;2/3,1/3' },
        beobachtung: 'Er ist 3-zählig. Die App zeigt, woher er kommt: Drehung um 120° um den Ursprung, gefolgt von der Translation um <i>a</i>.',
        erklaerung: 'Eine Drehung und eine Translation ergeben eine Drehung um denselben Winkel um einen verschobenen Punkt. Aus den Drehungen um 120° und 180° um den 6-zähligen Drehpunkt entstehen so Drehpunkte kleinerer Zähligkeit, wo keiner hineingesteckt wurde.',
        skript: 'verknuepfung',
      },
      {
        frage: 'Und der Drehpunkt in der Mitte der Zellkante bei (½, 0)?',
        vermutung: ['6', '3', '2'], richtig: 2,
        handlung: { text: 'Herkunft des Drehpunkts zeigen', hash: '#m=eg&g=p6&herkunft=1&erkl=2;1/2,0' },
        beobachtung: 'Er ist 2-zählig: Drehung um 180° um den Ursprung, gefolgt von der Translation um <i>a</i>. Er liegt in der Mitte der Translation.',
        erklaerung: 'Eine Elementarzelle von <i>p</i>6 enthält deshalb drei Sorten Drehpunkte: 6-zählige auf den Ecken, 3-zählige in den Mitten der beiden gleichseitigen Dreiecke der Zelle, bei (⅓, ⅔) und (⅔, ⅓), 2-zählige auf den Kantenmitten und in der Zellmitte.',
        skript: 'verknuepfung',
      },
    ],
  },
  {
    id: 'punktgruppe', modus: 'eg', titel: 'Punktgruppe einer Ebenengruppe',
    schritte: [
      {
        frage: '<i>pg</i> hat keine einzige Spiegellinie, nur Gleitspiegellinien. Welche Punktgruppe hat <i>pg</i>?',
        vermutung: ['1, weil es keine Spiegellinie gibt', '<i>m</i>', '<i>g</i>'], richtig: 1,
        handlung: { text: '<i>pg</i> zeigen', hash: '#m=eg&g=pg' },
        beobachtung: 'Die Kenndaten unter den Tafeln nennen die Punktgruppe <i>m</i>.',
        erklaerung: 'Die Punktgruppe enthält die Operationen ohne ihre Verschiebungen. Ohne die Verschiebung um <i>b</i>/2 wird aus der Gleitspiegelung eine Spiegelung. Für die Punktgruppe zählt nur die Richtung eines Elements, nicht seine Lage und nicht die Gleitkomponente; ein Symbol <i>g</i> gibt es in Punktgruppen deshalb nicht.',
        skript: 'punktgruppe-system',
      },
      {
        frage: 'Und die Punktgruppe von <i>p</i>4<i>gm</i>?',
        vermutung: ['4<i>mm</i>', '4', '4<i>m</i>'], richtig: 0,
        handlung: { text: '<i>p</i>4<i>gm</i> zeigen', hash: '#m=eg&g=p4gm' },
        beobachtung: 'Die Kenndaten nennen 4<i>mm</i>.',
        erklaerung: 'Aus dem Symbol: Zellbuchstaben weglassen und jedes <i>g</i> durch <i>m</i> ersetzen. Eine Punktgruppe 4<i>m</i> gibt es nicht: Eine Drehung um 90° und eine Spiegelung ergeben zusammen eine Spiegelung an einer Linie unter 45° zur ersten; es gibt also immer zwei Sorten Spiegellinien.',
        skript: 'punktgruppe-system',
      },
    ],
  },
  {
    id: 'lage', modus: 'eg', titel: 'Allgemeine und spezielle Lage',
    schritte: [
      {
        frage: 'In <i>p</i>4<i>mm</i> liegen die Bilder eines Objekts in allgemeiner Lage an 8 Stellen je Elementarzelle. An wie vielen Stellen liegen sie, wenn das Objekt auf einer Spiegellinie liegt?',
        vermutung: ['an 8', 'an 4', 'an 2'], richtig: 1,
        handlung: { text: 'Objekt auf eine Spiegellinie setzen', hash: '#m=eg&g=p4mm&x=1/5&y=1/5' },
        beobachtung: 'An 4 Stellen, alle auf den diagonalen Spiegellinien: An jeder liegen das Fähnchen und sein Spiegelbild übereinander.',
        erklaerung: 'Die Spiegelung hält das Objekt fest, seine Lagesymmetrie ist <i>m</i>. Zähligkeit mal Ordnung der Lagesymmetrie ergibt die 8 Operationen je Zelle: 4 · 2 = 8.',
        skript: 'allgemein-speziell',
      },
      {
        frage: 'Und wenn das Objekt auf dem 4-zähligen Drehpunkt in der Mitte der Zelle liegt, durch den vier Spiegellinien gehen?',
        vermutung: ['an 4', 'an 2', 'an einer'], richtig: 2,
        handlung: { text: 'Objekt auf den Drehpunkt setzen', hash: '#m=eg&g=p4mm&x=1/2&y=1/2' },
        beobachtung: 'An einer Stelle: Alle 8 Bilder liegen übereinander, denn alle 8 Operationen halten das Objekt fest.',
        erklaerung: 'Lagesymmetrie 4<i>mm</i> mit 8 Operationen, also 8 / 8 = 1.',
        skript: 'wyckoff',
      },
    ],
  },
  {
    id: 'ae', modus: 'eg', titel: 'Asymmetrische Einheit',
    schritte: [
      {
        frage: 'Welcher Teil der Elementarzelle von <i>p</i>4<i>mm</i> genügt, damit die Operationen der Gruppe daraus das ganze Muster erzeugen?',
        vermutung: ['ein Viertel', 'ein Achtel', 'ein Sechzehntel'], richtig: 1,
        handlung: { text: 'Asymmetrische Einheit einblenden', hash: '#m=eg&g=p4mm&ae=1' },
        beobachtung: 'Ein Achtel der Zelle, ein Dreieck.',
        erklaerung: 'Die Gruppe hat 8 Operationen je Zelle; ihre Bilder der asymmetrischen Einheit füllen die Zelle ohne Lücken und Überlappungen.',
        skript: 'asymmetrische-einheit',
      },
      {
        frage: 'Die Punktgruppe von <i>c</i>2<i>mm</i> hat nur 4 Operationen. Welcher Teil der konventionellen, zentrierten Zelle ist die asymmetrische Einheit?',
        vermutung: ['ein Viertel', 'ein Achtel'], richtig: 1,
        handlung: { text: '<i>c</i>2<i>mm</i> zeigen', hash: '#m=eg&g=c2mm&ae=1' },
        beobachtung: 'Ein Achtel der konventionellen Zelle.',
        erklaerung: 'Die Zentrierung verdoppelt die Operationen je Zelle: 4 · 2 = 8.',
        skript: 'zentriert',
      },
    ],
  },
  {
    id: 'p3m1-p31m', modus: 'eg', titel: '<i>p</i>3<i>m</i>1 oder <i>p</i>31<i>m</i>',
    schritte: [
      {
        frage: '<i>p</i>31<i>m</i> hat 3-zählige Drehpunkte und Spiegellinien. Liegen alle 3-zähligen Drehpunkte auf Spiegellinien?',
        vermutung: ['Ja, alle', 'Nein, nur ein Teil'], richtig: 1,
        handlung: { text: '<i>p</i>31<i>m</i> zeigen', hash: '#m=eg&g=p31m' },
        beobachtung: 'Nur die Drehpunkte auf den Ecken liegen auf Spiegellinien. Die beiden im Innern der Zelle, bei (⅓, ⅔) und (⅔, ⅓), liegen auf keiner.',
        erklaerung: 'Die Spiegellinien von <i>p</i>31<i>m</i> laufen entlang der Zellkanten und der kurzen Diagonalen; die Drehpunkte im Innern liegen zwischen ihnen.',
        skript: 'symbol',
      },
      {
        frage: 'Und in <i>p</i>3<i>m</i>1?',
        vermutung: ['Ja, alle', 'Nein, nur ein Teil'], richtig: 0,
        handlung: { text: '<i>p</i>3<i>m</i>1 zeigen', hash: '#m=eg&g=p3m1' },
        beobachtung: 'Alle drei Sorten von 3-zähligen Drehpunkten liegen auf Schnittpunkten von Spiegellinien.',
        erklaerung: 'Daran unterscheidet man die beiden Gruppen, auch im Flussdiagramm zur Bestimmung der Ebenengruppe mit der Leitfrage „Gibt es einen Drehpunkt, der auf keiner Spiegellinie liegt?“ Im Symbol zeigt es die Stelle des <i>m</i>: Die Spiegellinien von <i>p</i>3<i>m</i>1 stehen senkrecht auf den Zellkanten, die von <i>p</i>31<i>m</i> laufen entlang.',
        skript: 'leitfragen',
      },
    ],
  },
  {
    id: 'gleitspiegel', modus: 'eg', titel: 'Spiegellinie oder Gleitspiegellinie',
    schritte: [
      {
        frage: 'In <i>p</i>4<i>gm</i> gehen durch jeden 4-zähligen Drehpunkt zwei diagonale Linien. Sind es Spiegellinien?',
        vermutung: ['Ja, Spiegellinien', 'Nein, Gleitspiegellinien'], richtig: 1,
        handlung: { text: '<i>p</i>4<i>gm</i> zeigen', hash: '#m=eg&g=p4gm' },
        beobachtung: 'Gleitspiegellinien (gestrichelt). Die Spiegellinien (durchgezogen) gehen nur durch die 2-zähligen Drehpunkte.',
        erklaerung: 'Darin unterscheidet sich <i>p</i>4<i>gm</i> von <i>p</i>4<i>mm</i>, wo durch jeden 4-zähligen Drehpunkt Spiegellinien gehen.',
        skript: 'leitfragen',
      },
    ],
  },
  // ------------------------------------------------------------------ Modus „Gitter und Basis“
  {
    id: 'gitterpunkte', modus: 'struktur', titel: 'Gitterpunkte in der Zelle zählen',
    schritte: [
      {
        frage: 'Im rechteckig zentrierten Gitter liegt ein Gitterpunkt auf jeder Ecke der konventionellen Zelle und einer in ihrer Mitte. Wie viele Gitterpunkte gehören zur Zelle?',
        vermutung: ['1', '2', '5'], richtig: 1,
        handlung: { text: 'Zentriertes Gitter laden', hash: '#m=struktur&v=zentriert&sel=0&sbind=0' },
        beobachtung: 'Auf und in der Zelle liegen fünf Punkte: vier auf den Ecken, einer in der Mitte. Die Kenndaten nennen 2 Gitterpunkte in der Zelle.',
        erklaerung: 'Ein Punkt auf einer Ecke gehört zu vier Zellen und zählt zu einem Viertel, einer im Innern ganz: 4 · ¼ + 1 = 2. Die zentrierte Zelle ist deshalb doppelt so gross wie eine primitive.',
        skript: 'elementarzelle',
      },
    ],
  },
  {
    id: 'graphen', modus: 'struktur', titel: 'Atome und Gitterpunkte',
    schritte: [
      {
        frage: 'Graphen besteht nur aus Kohlenstoffatomen. Liegt auf jedem Atom ein Gitterpunkt?',
        vermutung: ['Ja', 'Nein, die Zelle enthält zwei Atome'], richtig: 1,
        handlung: { text: 'Graphen laden', hash: '#m=struktur&v=graphen' },
        beobachtung: 'Die Zelle enthält zwei Atome. Die Ebenengruppe ist <i>p</i>6<i>mm</i>.',
        erklaerung: 'Die Wabe ist kein Gitter: Die Verschiebung von einem Atom zu seinem Nachbarn bildet die Struktur nicht auf sich ab. Hexagonales Gitter mit zwei Atomen in der Basis.',
        skript: 'basis',
      },
    ],
  },
  {
    id: 'zentrierung', modus: 'struktur', titel: 'Gleiche Atome, zentrierte Zelle',
    schritte: [
      {
        frage: 'Zwei Dreiecke verschiedener Farbe in einer rechteckigen Zelle. Welche Symmetrie bestimmt die App?',
        vermutung: ['nur Spiegellinien (<i>pm</i>)', 'Spiegellinien und Drehpunkte (<i>p</i>2<i>mm</i>)'], richtig: 0,
        handlung: { text: 'Dreiecksbeispiel laden', hash: '#m=struktur&v=dreieck1' },
        beobachtung: '<i>pm</i>: Spiegellinien, keine Drehpunkte.',
        erklaerung: 'Die Dreiecke sind spiegelsymmetrisch, aber nicht punktsymmetrisch; deshalb entstehen keine 2-zähligen Drehpunkte.',
        skript: 'basis-gitter',
      },
      {
        frage: 'Das Dreieck in der Mitte bekommt die Farbe des Eckdreiecks. Was geschieht?',
        vermutung: ['Nichts, es bleibt <i>pm</i>', 'Die Zelle wird zentriert (<i>cm</i>)', 'Es entstehen Drehpunkte'], richtig: 1,
        handlung: { text: 'Farbe angleichen', hash: '#m=struktur&v=dreieck2' },
        beobachtung: '<i>cm</i>: Die konventionelle Zelle ist zentriert, zwischen den Spiegellinien liegen Gleitspiegellinien.',
        erklaerung: 'Das mittlere Dreieck ist jetzt eine verschobene Kopie des Eckdreiecks: eine zusätzliche Translation um (½, ½).',
        skript: 'zentriert',
      },
    ],
  },
  {
    id: 'erniedrigen', modus: 'struktur', titel: 'Motive entfernen',
    schritte: [
      {
        frage: 'Vier Fähnchen je Zelle, um die Zellmitte jeweils um 90° gedreht. Welche Ebenengruppe hat das Muster?',
        vermutung: ['<i>p</i>4', '<i>p</i>4<i>mm</i>', '<i>p</i>2'], richtig: 0,
        handlung: { text: 'Muster laden', hash: '#m=struktur&v=quadratisch&ba=1&gamma=90&basis=fahne,0,3/10,1/5,0;fahne,0,4/5,3/10,270;fahne,0,7/10,4/5,180;fahne,0,1/5,7/10,90&sae=1' },
        beobachtung: '<i>p</i>4: 4-zählige Drehpunkte in der Zellmitte und auf den Ecken, 2-zählige auf den Kantenmitten, keine Spiegellinien. Die asymmetrische Einheit ist ein Viertel der Zelle.',
        erklaerung: 'Fähnchen haben keine eigene Symmetrie; Spiegellinien gibt es deshalb nur, wenn auch Spiegelbilder vorkommen. Hier sind alle Fähnchen nur gedreht.',
        skript: 'gitter-und-motiv',
      },
      {
        frage: 'Nun entfernt man die beiden Fähnchen, deren Stange waagrecht liegt. Was bleibt von der Symmetrie?',
        vermutung: ['<i>p</i>4 bleibt', '2-zählige Drehpunkte (<i>p</i>2)', 'nur Translationen (<i>p</i>1)'], richtig: 1,
        handlung: { text: 'Zwei Fähnchen entfernen', hash: '#m=struktur&v=quadratisch&ba=1&gamma=90&basis=fahne,0,3/10,1/5,0;fahne,0,7/10,4/5,180&sae=1' },
        beobachtung: '<i>p</i>2: Die 4-zähligen Drehpunkte sind nur noch 2-zählig. Die Zelle bleibt gleich gross, die asymmetrische Einheit wird doppelt so gross, die halbe Zelle.',
        erklaerung: 'Die beiden verbleibenden Fähnchen gehen durch eine Drehung um 180° um die Zellmitte auseinander hervor; diese Drehung bleibt eine Symmetrieoperation, die um 90° nicht. Weniger Motive heisst also nicht keine Symmetrie: Es bleibt eine Untergruppe.',
        skript: 'gitter-und-motiv',
      },
    ],
  },
  {
    id: 'metrik', modus: 'struktur', titel: 'Quadratische Metrik, rechteckiges System',
    schritte: [
      {
        frage: 'Im Läuferverband sind die kürzesten Translationen gleich lang und stehen senkrecht aufeinander: Das Gitter hat die Metrik eines quadratischen Gitters. Hat der Verband deshalb 4-zählige Drehpunkte?',
        vermutung: ['Ja, die Gruppe ist <i>p</i>4<i>mm</i>', 'Nein, er bleibt <i>c</i>2<i>mm</i>'], richtig: 1,
        handlung: { text: 'Läuferverband mit Elementen zeigen', hash: '#m=struktur&v=laeufer' },
        beobachtung: '<i>c</i>2<i>mm</i>: nur 2-zählige Drehpunkte. Auch die konventionelle Zelle ist quadratisch, weil die Steine samt Fuge doppelt so lang wie breit sind.',
        erklaerung: 'Das Kristallsystem folgt aus der Symmetrie, nicht aus der Metrik. Ein Ziegel ist zu einer Drehung um 90° nicht symmetrisch; die Metrik allein erzeugt keine 4-zähligen Drehpunkte.',
        skript: 'gitter-und-motiv',
      },
    ],
  },
  {
    id: 'drehen', modus: 'struktur', titel: 'Motiv drehen',
    schritte: [
      {
        frage: 'Im zentrierten Beispiel (<i>cm</i>) wird das Dreieck in der Mitte um 180° gedreht. Was entsteht?',
        vermutung: ['Drehpunkte und Gleitspiegellinien quer zu den Spiegellinien', 'Keine Symmetrie mehr ausser Translationen'], richtig: 0,
        handlung: { text: 'Um 180° drehen', hash: '#m=struktur&v=dreieck3' },
        beobachtung: '<i>p</i>2<i>mg</i>: 2-zählige Drehpunkte und Gleitspiegellinien senkrecht zu den Spiegellinien.',
        erklaerung: 'Hineingesteckt hat man sie nicht: Sie folgen aus Spiegelung und Translation. Der Ursprung der konventionellen Zelle wandert auf einen Drehpunkt.',
        skript: 'verknuepfung',
      },
    ],
  },
  {
    id: 'versatz', modus: 'struktur', titel: 'Versetzte Reihen',
    schritte: [
      {
        frage: 'Ziegel ohne Versatz haben <i>p</i>2<i>mm</i>. Jede zweite Reihe wird um eine halbe Steinlänge versetzt. Bleiben die senkrechten Spiegellinien durch die Steinmitten?',
        vermutung: ['Ja, die Zelle wird zentriert (<i>c</i>2<i>mm</i>)', 'Nein, es bleiben nur Drehpunkte (<i>p</i>2)'], richtig: 0,
        handlung: { text: 'Läuferverband laden', hash: '#m=struktur&v=laeufer' },
        beobachtung: '<i>c</i>2<i>mm</i>: Die Spiegellinien bleiben, dazu kommen Gleitspiegellinien entlang der waagrechten Fugen.',
        erklaerung: 'Eine Steinmitte der versetzten Reihe liegt genau über einer Fuge der Reihe darunter; die Spiegelung an der senkrechten Linie durch sie passt zu beiden Reihen.',
        skript: 'mauerwerk',
      },
      {
        frage: 'Und wenn jede Reihe gegen die vorige um ein Drittel einer Steinlänge versetzt ist, immer in dieselbe Richtung?',
        vermutung: ['Es bleibt <i>c</i>2<i>mm</i>', 'Die Spiegellinien verschwinden (<i>p</i>2)'], richtig: 1,
        handlung: { text: 'Um ein Drittel versetzen', hash: '#m=struktur&v=drittel' },
        beobachtung: '<i>p</i>2: keine Spiegellinien mehr, nur 2-zählige Drehpunkte.',
        erklaerung: 'Eine Spiegelung, senkrecht oder waagrecht, würde die Richtung des Versatzes umkehren; die Reihen sind aber alle in dieselbe Richtung versetzt. Es bleiben nur Drehungen um 180°, etwa um die Steinmitten.',
        skript: 'mauerwerk',
      },
    ],
  },
  {
    id: 'farbe', modus: 'struktur', titel: 'Farbe gehört zum Muster',
    schritte: [
      {
        frage: 'Eine Bienenwabe aus zwei Sorten Atomen im Wechsel (h-BN). Ist die Mitte eines Sechsecks ein 6-zähliger Drehpunkt?',
        vermutung: ['Ja, 6-zählig', 'Nein, nur 3-zählig'], richtig: 1,
        handlung: { text: 'h-BN laden', hash: '#m=struktur&v=hbn' },
        beobachtung: '<i>p</i>3<i>m</i>1: Die Sechseckmitten sind 3-zählige Drehpunkte.',
        erklaerung: 'Eine Drehung um 60° bringt Atome der einen Sorte auf die der anderen. Sie gehört deshalb nicht zur Symmetrie, die um 120° schon.',
        skript: 'fehler',
      },
      {
        frage: 'Und wenn beide Sorten gleich sind, wie bei Graphen?',
        vermutung: ['Es bleibt <i>p</i>3<i>m</i>1', 'Es wird <i>p</i>6<i>mm</i>'], richtig: 1,
        handlung: { text: 'Graphen laden', hash: '#m=struktur&v=graphen' },
        beobachtung: '<i>p</i>6<i>mm</i>: Die Sechseckmitten sind jetzt 6-zählig.',
        erklaerung: 'Wer beim Bestimmen die Farbe übersieht, kommt zu dieser höheren Symmetrie. Farben unterscheiden Motive; sie gehören zum Muster.',
        skript: 'fehler',
      },
    ],
  },
  // ------------------------------------------------------------------ Modus „Muster entwerfen“
  {
    id: 'entwurf-lage', modus: 'entwurf', titel: 'Motiv auf einem Drehpunkt',
    schritte: [
      {
        frage: 'In <i>p</i>4 steht ein Fähnchen in allgemeiner Lage. Wie viele Fähnchen erscheinen je Zelle?',
        vermutung: ['1', '2', '4'], richtig: 2,
        handlung: { text: 'Fähnchen in <i>p</i>4 setzen', hash: '#m=entwurf&g=p4&basis=fahne,0,3/10,1/5,0' },
        beobachtung: 'Vier Fähnchen, je um 90° gedreht: die Bahn des Fähnchens, so viele wie die Zähligkeit der allgemeinen Lage von <i>p</i>4. Man setzt nur eines, die übrigen folgen aus den Operationen.',
        erklaerung: 'Die Gruppe hat in der Zelle vier Operationen; ein Motiv in allgemeiner Lage wird von jeder in ein anderes Bild überführt.',
        skript: 'punktlagen',
      },
      {
        frage: 'Nun zieht man das Fähnchen auf den 4-zähligen Drehpunkt in der Zellmitte. Wie viele verschiedene Bilder zeigt die App?',
        vermutung: ['1', '2', '4'], richtig: 2,
        handlung: { text: 'Auf den Drehpunkt ziehen', hash: '#m=entwurf&g=p4&basis=fahne,0,1/2,1/2,0' },
        beobachtung: 'Vier Fähnchen mit gemeinsamem Fuss, um 90° gedreht und übereinander gezeichnet. Die Kenndaten nennen sie „überlagert“: Wyckoff-Lage 1<i>b</i> mit Lagesymmetrie 4.., aber das Fähnchen hat diese Symmetrie nicht.',
        erklaerung: 'Die Lage verlangt, dass das Motiv selbst 4-zählig ist. Ein Fähnchen ist es nicht; der Entwurf deutet nichts um und zeigt alle vier Bilder (in einem Kristall wäre das eine Fehlordnung).',
        skript: 'punktlagen',
      },
      {
        frage: 'Und wenn statt des Fähnchens ein Windrad mit vier Flügeln auf dem Drehpunkt sitzt?',
        vermutung: ['Vier Windräder übereinander', 'Ein Windrad', 'Vier Windräder nebeneinander'], richtig: 1,
        handlung: { text: 'Windrad auf den Drehpunkt setzen', hash: '#m=entwurf&g=p4&basis=w4,0,1/2,1/2,0' },
        beobachtung: 'Ein Windrad: 1 Bild je Zelle, keine überlagerten Bilder.',
        erklaerung: 'Das Windrad hat die Symmetrie 4, genau die Lagesymmetrie von 1<i>b</i> (4..). Die vier Bilder fallen deckungsgleich zusammen und erscheinen einmal.',
        skript: 'punktlagen',
      },
    ],
  },
  {
    id: 'entwurf-gruppen', modus: 'entwurf', titel: 'Dasselbe Motiv, andere Gruppe',
    schritte: [
      {
        frage: 'Das Fähnchen aus <i>p</i>4 bleibt an seiner Stelle, die Gruppe wird <i>p</i>4<i>mm</i>. Wie viele Fähnchen erscheinen je Zelle?',
        vermutung: ['4', '8', '16'], richtig: 1,
        handlung: { text: 'Gruppe <i>p</i>4<i>mm</i> wählen', hash: '#m=entwurf&g=p4mm&basis=fahne,0,3/10,1/5,0' },
        beobachtung: 'Acht Fähnchen: vier Drehbilder und ihre Spiegelbilder.',
        erklaerung: '<i>p</i>4<i>mm</i> hat acht Operationen je Zelle, doppelt so viele wie <i>p</i>4; das Fähnchen steht in allgemeiner Lage, also entsteht jedes Mal ein eigenes Bild.',
        skript: 'punktlagen',
      },
    ],
  },
];
