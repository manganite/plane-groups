// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (alle Geräte).
// Die Mechanik steht in lib/common/js/help.js. Begriffe wie im Skript.

/**
 * Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. Kurz: Sie nennen die Funktion
 * oder eine nötige Angabe, sonst nur, was nicht ohnehin zu sehen ist (Leitfaden Abschn. 5.3; Thomas, 12.11.2026).
 */
export const TIPS = {
  'tab-eg': 'Eine Ebenengruppe wählen und ihre Elemente, Lagen und Operationen erkunden.',
  'tab-struktur': 'Struktur aus Gitter und Motiven aufbauen; die App bestimmt ihre Ebenengruppe.',
  'tab-entwurf': 'Muster in einer gewählten Ebenengruppe entwerfen.',
  's-vorgabe': 'Fertige Struktur laden.',
  's-zuruecksetzen': 'Gitter und Basis wie in der gewählten Vorgabe.',
  's-elemente': 'Symmetrieelemente der bestimmten Ebenengruppe.',
  's-zelle': 'Konventionelle Zelle a′, b′ nach ITA; sie kann von der gegebenen abweichen.',
  's-ae': 'Asymmetrische Einheit der bestimmten Ebenengruppe.',
  's-bindungen': 'Linien zwischen Atomen im kleinsten Atomabstand (bis 5 % mehr).',
  's-werkzeug-verschieben': 'Wählen und ziehen: wählt ein Motiv auf der Zeichnung und verschiebt es.',
  's-werkzeug-hinzufuegen': 'Hinzufügen: setzt an der gewählten Stelle ein neues Motiv mit den Einstellungen unter „Basis“.',
  's-motiv': 'Form des Motivs; gilt für das gewählte oder das nächste neue.',
  's-farbe': 'Atomsorte: Motive verschiedener Farbe werden nie aufeinander abgebildet.',
  's-winkel': 'Drehung im Uhrzeigersinn, ab der Richtung von b.',
  's-spiegel': 'Gespiegelt vor der Drehung, beim Fähnchen an der Stange.',
  's-fuge': 'Ziegel mit gleich breiten Fugen; ohne Fuge füllt er sein Raster lückenlos.',
  's-groesse': 'Grösse in Einheiten von a, logarithmisch.',
  'e-picker': 'Passt das Gitter nicht zum Kristallsystem, gilt dessen Startgitter.',
  'e-elemente': 'Symmetrieelemente der gewählten Gruppe.',
  'e-ae': 'Asymmetrische Einheit der gewählten Gruppe.',
  'e-bindungen': 'Linien zwischen Atomen im kleinsten Atomabstand (bis 5 % mehr).',
  's-weiter': 'Die Struktur mit ihrer Gruppe in „Muster entwerfen“ übernehmen; einen Weg zurück gibt es nicht.',
  's-entfernen': 'Gewähltes Motiv entfernen; im Entwurf seine ganze Bahn.',
  'motive-loeschen': 'Alle Motive löschen; die Striche bleiben.',
  'striche-loeschen': 'Alle Striche löschen; die Motive bleiben.',
  'rueckgaengig': 'Rückgängig: letzte Änderung an Motiven oder Strichen zurücknehmen.',
  'werkzeug-einrasten': 'Einrasten beim Ziehen: spezielle Lagen (Ebenengruppen, Entwurf), Zwölftel der Zelle und 15° (Modi mit Basis).',
  's-ba': 'Verhältnis der Achsenlängen.',
  's-gamma': 'Winkel zwischen a und b.',
  's-metrik': 'Quadratische oder hexagonale Metrik setzen.',
  'copy-link': 'Link auf diese Ansicht kopieren.',
  'opt-elemente': 'Drehpunkte, Spiegel- und Gleitspiegellinien mit den Symbolen der ITA.',
  'opt-objekt': 'Objekt ohne eigene Symmetrie mit allen Bildern; das Ausgangsobjekt ist umkreist.',
  'opt-ae': 'Kleinster Teil der Zelle, aus dem die Operationen die ganze Zelle erzeugen.',
  'opt-zellen': 'Vier Elementarzellen statt einer.',
  'seg-form': 'Spiegelbild: Komma im Kreis (ITA) bzw. Fahne auf der anderen Seite.',
  'opt-orbit': 'Rand von ⅓ der Zelle.',
  'obj-x': 'In Bruchteilen von a.',
  'obj-y': 'In Bruchteilen von b.',
  'obj-groesse': 'Grösse des Objekts im Verhältnis zur Zelle.',
  'reset-objekt': 'Objekt an die Ausgangslage, normale Grösse.',
  'lat-ba': 'Frei im schiefwinkligen und im rechteckigen System.',
  'lat-gamma': 'Frei nur im schiefwinkligen System.',
  'reset-gitter': 'Startwerte des Kristallsystems.',
  'v-farben': 'Blickrichtung: Position im Hermann-Mauguin-Symbol.',
  'v-muster-el': 'In „Gitter und Basis“ die der bestimmten, im Entwurf die der gewählten Gruppe.',
  'v-zoom': 'Über 1 grösser, unter 1 ein grösserer Ausschnitt.',
  'v-tapete': 'Ohne Zelle und Symmetrieelemente.',
  's-werkzeug-zeichnen': 'Zeichnen: Ziehen zeichnet einen Strich in der Farbe der Atomsorte, mit allen Operationen.',
  'werkzeug-lupe': 'Lupe: Ausschnitt doppelt so gross, um das Objekt bzw. das gewählte Motiv.',
  's-werkzeug-radieren': 'Radieren: Ziehen radiert die überfahrenen Stücke der Striche, an allen Kopien zugleich.',
  'opt-fuell': 'Asymmetrische Einheit füllen und mit allen Operationen vervielfältigen.',
  'opt-herkunft': 'Zeigt zu einem gewählten Symmetrieelement, aus welchen zwei Operationen es folgt.',
  'erkl-schritt': 'Das Objekt Operation für Operation abbilden, in der Reihenfolge der ITA.',
  'erkl-aufbau': 'Symmetrieelemente schrittweise aus den Erzeugenden aufbauen.',
  'erkl-zurueck': 'Einen Schritt zurück.',
  'erkl-vor': 'Einen Schritt weiter.',
  'erkl-abspielen': 'Alle Schritte nacheinander zeigen.',
  'reset-alles': 'Alles löschen und neu starten; Quiz und Experimente bleiben.',
};

/**
 * Grund unter gesperrten Gitterreglern (Ebenengruppen, Muster entwerfen), je Kristallsystem ein Halbsatz; die Erklärung
 * steht im ⓘ (Leitfaden Abschn. 5.2, #162). HTML.
 * @type {Record<string, string>}
 */
export const GITTER_FEST = {
  schiefwinklig: '',
  rechteckig: 'γ im rechteckigen System festgelegt.',
  quadratisch: '<i>b</i>/<i>a</i> und γ im quadratischen System festgelegt.',
  hexagonal: '<i>b</i>/<i>a</i> und γ im hexagonalen System festgelegt.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  { heading: '#ctl-struktur > h2', intro: 'Eine Struktur ist Gitter plus Basis. Die App bestimmt aus beiden die Ebenengruppe und zeigt sie mit konventioneller Zelle und Symmetrieelementen. In den Kenndaten lässt sich die Struktur mit ihrer Gruppe in „Muster entwerfen“ weiterbearbeiten; dort bleiben Gruppe und Zelle fest, einen Weg zurück gibt es nicht.', ids: ['s-vorgabe', 's-zuruecksetzen', 's-elemente', 's-zelle', 's-ae', 's-bindungen'] },
  { heading: '#sec-basis > summary', intro: 'Die Basis: Motive mit eigener Symmetrie an Lagen in der Zelle. Die Einstellungen gelten für das gewählte Motiv (im Entwurf für seine ganze Bahn), ohne Wahl für das nächste neue. Was man auf der Zeichnung tut, steht über ihr als Symbole: Werkzeuge, dann Rückgängig, Entfernen und Löschen, oben Einrasten und Lupe. Im Entwurf zeichnet man mit dem Stift Striche: Die Gruppe macht daraus ein Muster, in der Farbe der gewählten Atomsorte; Spiegelbilder haben dieselbe Farbe.', ids: ['s-werkzeug-verschieben', 's-werkzeug-hinzufuegen', 's-werkzeug-zeichnen', 's-werkzeug-radieren', 'rueckgaengig', 's-entfernen', 'motive-loeschen', 'striche-loeschen', 'werkzeug-einrasten', 'werkzeug-lupe', 's-motiv', 's-farbe', 's-winkel', 's-spiegel', 's-fuge', 's-groesse'] },
  { heading: '#sec-sgitter > summary', intro: 'Gitter der gegebenen Zelle; in „Gitter und Basis“ ohne Bindung an ein Kristallsystem, im Entwurf innerhalb des Kristallsystems der Gruppe (dort bleibt die Symmetrie erhalten). Die Motive behalten ihre Lage in Bruchkoordinaten und ihre Form; in „Gitter und Basis“ folgt die Symmetrie aus Gitter und Basis zusammen.', ids: ['s-ba', 's-gamma', 's-metrik'] },
  { heading: '#ctl-entwurf > h2', intro: 'Muster entwerfen: Man wählt die Gruppe, setzt Motive und zeichnet Striche; jedes erscheint mit allen Operationen der Gruppe. Gruppe und Zelle bleiben fest, die App bestimmt die Symmetrie nicht. Bei der Wahl einer anderen Gruppe bleiben Motive und Striche; ihre Bilder entstehen unter der neuen Gruppe neu. Höchstens 48 Bilder: Jede Bahn zählt mit der Zähligkeit der allgemeinen Lage; Gruppen, mit denen es mehr würden, sind gesperrt.', ids: ['e-picker', 'e-elemente', 'e-ae', 'e-bindungen'] },
  { heading: '#ctl-gruppe > h2', intro: 'Nach der Wahl einer Gruppe erscheint links das Symmetriegerüst einer Elementarzelle, rechts ein Ausschnitt des Musters. Das Objekt lässt sich im Symmetriegerüst ziehen. Über dem Gerüst stehen die Erklärungen: „Schritt für Schritt“ wendet die Symmetrieoperationen einzeln auf das Objekt an, „Aufbau aus Erzeugenden“ zeigt, welche Elemente zwangsläufig aus wenigen Erzeugenden folgen; „Herkunft der Elemente“ zeigt zu einem Element, aus welchen Operationen es entsteht (mit dem Aufbau kombinierbar). Die Leiste unter dem Gerüst schaltet die Schritte durch.', ids: ['opt-elemente', 'opt-objekt', 'opt-ae', 'opt-zellen', 'seg-form', 'opt-orbit', 'erkl-schritt', 'erkl-aufbau', 'opt-herkunft', 'erkl-zurueck', 'erkl-vor', 'erkl-abspielen'] },
  { heading: '#sec-objekt > summary', intro: 'Lage des Ausgangsobjekts in Bruchkoordinaten. Über dem Symmetriegerüst: Einrasten (nahe einem Drehpunkt oder einer Spiegellinie springt das Objekt beim Ziehen auf das Element) und die Lupe zum genauen Setzen; sie ruht, solange „Schritt für Schritt“, der Aufbau oder „Herkunft der Elemente“ aktiv ist.', ids: ['obj-x', 'obj-y', 'obj-groesse', 'werkzeug-einrasten', 'werkzeug-lupe'] },
  { heading: '#sec-gitter > summary', intro: 'Die Gitterparameter dürfen sich innerhalb des Kristallsystems frei ändern; die Symmetrie bleibt dabei erhalten. Was das System festlegt, ist gesperrt (quadratisch und hexagonal b = a, γ = 90° bzw. 120°; rechteckig γ = 90°). Bei besonderen Werten (z. B. b = a) kann die Metrik zufällig höher sein; die Gruppe bleibt die gewählte.', ids: ['lat-ba', 'lat-gamma'] },
  { heading: '#sec-view > summary', intro: '„Asymmetrische Einheit füllen“ zeigt sie kräftig: Ihre Bilder füllen die Zelle ohne Lücken und Überlappungen, was in ihr gezeichnet ist, ergibt also das ganze Muster. In „Gitter und Basis“ ist es die asymmetrische Einheit der bestimmten, im Entwurf die der gewählten Gruppe.', ids: ['v-farben', 'v-muster-el', 'v-tapete', 'opt-fuell', 'v-zoom'] },
];

/** Beschriftung in der ⓘ-Erklärung, wo der Text des Elements nicht passt. */
export const LABELS = {
  'erkl-zurueck': 'Schritt zurück (◀)',
  'erkl-vor': 'Schritt weiter (▶)',
  'seg-form': 'Form des Objekts',
  'obj-x': 'x',
  'obj-y': 'y',
  'lat-ba': 'b/a',
  'lat-gamma': 'γ',
  's-werkzeug-verschieben': 'Wählen und ziehen (Pfeil)',
  's-werkzeug-hinzufuegen': 'Hinzufügen (+)',
  's-werkzeug-zeichnen': 'Zeichnen (Stift)',
  's-werkzeug-radieren': 'Radieren (Radiergummi)',
  'rueckgaengig': 'Rückgängig (Pfeil zurück)',
  's-entfernen': 'Gewähltes Motiv entfernen (×)',
  'motive-loeschen': 'Alle Motive löschen (Papierkorb mit Dreieck)',
  'striche-loeschen': 'Alle Striche löschen (Papierkorb mit Strich)',
  'werkzeug-einrasten': 'Einrasten (Magnet)',
  'werkzeug-lupe': 'Lupe',
  's-farbe': 'Atomsorte',
  's-motiv': 'Motiv',
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
      { frage: '<b>Erklären lassen.</b> Über dem Gerüst „Schritt für Schritt“ wählen: Die Operationen wirken einzeln auf das Fähnchen, die Leiste unter der Zeichnung schaltet weiter.',
        handlung: { text: 'Schritt für Schritt', hash: '#m=eg&g=p4gm&schritt=2' }, zeige: '#erkl-schritt' },
      { frage: '<b>Ausprobieren.</b> Unter „Experimente“ stehen kleine Versuche, etwa zu Gleitspiegellinien, Drehpunkten, Lagen und zur asymmetrischen Einheit: erst vermuten, dann ausprobieren.',
        handlung: { text: 'Experimente öffnen', aktion: 'experimente' }, zeige: '#sec-experimente > summary' },
    ],
  },
  {
    id: 'einstieg-struktur', modus: 'struktur', titel: 'Erste Schritte',
    schritte: [
      { frage: '<b>Struktur ansehen.</b> Gitter und Basis: zwei Dreiecke in einer rechteckigen Zelle. Die App bestimmt daraus die Ebenengruppe, hier <i>pm</i> (unten), und zeichnet konventionelle Zelle und Symmetrieelemente ein.',
        handlung: { text: 'Dreiecksbeispiel laden', hash: '#m=struktur&v=dreieck1' }, zeige: '#s-vorgabe' },
      { frage: '<b>Selbst bauen.</b> Mit + („Hinzufügen“) über der Struktur neue Motive setzen, mit dem Pfeil („Wählen und ziehen“) verschieben; unter „Gitter“ Achsenverhältnis und Winkel ändern. Die App bestimmt die Symmetrie jedes Mal neu.',
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
      { frage: '<b>Motiv setzen.</b> Mit + („Hinzufügen“) über dem Entwurf ein Motiv setzen, mit dem Pfeil („Wählen und ziehen“) verschieben; es erscheint mit allen Operationen der Gruppe. Unter „Basis“ lässt es sich drehen, spiegeln und färben.',
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
        frage: 'Zwei gleiche Dreiecke in einer rechteckigen Zelle, bei (0, 0) und (½, ½), beide mit der Spitze entlang <i>b</i>: <i>cm</i>. Nun wird das Dreieck in der Mitte um 180° gedreht. Was entsteht?',
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
        frage: 'In <i>p</i>4 sitzt ein Fähnchen mit dem Fuss auf dem 4-zähligen Drehpunkt in der Zellmitte. Wie viele verschiedene Fähnchen liegen dort?',
        vermutung: ['1', '2', '4'], richtig: 2,
        handlung: { text: 'Fähnchen auf den Drehpunkt setzen', hash: '#m=entwurf&g=p4&basis=fahne,0,1/2,1/2,0' },
        beobachtung: 'Vier Fähnchen mit gemeinsamem Fuss, je um 90° gedreht. Die Kenndaten nennen sie „überlagert“.',
        erklaerung: 'Die Lage 1<i>b</i> hat die Lagesymmetrie 4. Ein Motiv erscheint dort nur einmal, wenn es selbst 4-zählig ist; das Fähnchen ist es nicht (in einem Kristall wäre das eine Fehlordnung).',
        skript: 'punktlagen',
      },
      {
        frage: 'Und wenn statt des Fähnchens ein Windrad mit vier Flügeln auf dem Drehpunkt sitzt?',
        vermutung: ['Vier Windräder übereinander', 'Ein Windrad', 'Vier Windräder nebeneinander'], richtig: 1,
        handlung: { text: 'Windrad auf den Drehpunkt setzen', hash: '#m=entwurf&g=p4&basis=w4,0,1/2,1/2,0' },
        beobachtung: 'Ein Windrad, keine überlagerten Bilder.',
        erklaerung: 'Das Windrad hat die Symmetrie 4, genau die Lagesymmetrie von 1<i>b</i>. Seine vier Bilder fallen zusammen.',
        skript: 'punktlagen',
      },
    ],
  },
  {
    id: 'entwurf-gruppen', modus: 'entwurf', titel: 'Dasselbe Motiv, andere Gruppe',
    schritte: [
      {
        frage: 'In <i>p</i>4 steht ein Fähnchen in allgemeiner Lage. Wie viele Fähnchen erscheinen je Zelle?',
        vermutung: ['1', '4', '8'], richtig: 1,
        handlung: { text: 'Fähnchen in <i>p</i>4 setzen', hash: '#m=entwurf&g=p4&basis=fahne,0,2/5,1/10,0' },
        beobachtung: 'Vier Fähnchen, je um 90° gedreht.',
        erklaerung: '<i>p</i>4 hat vier Operationen je Zelle; in allgemeiner Lage macht jede ein eigenes Bild.',
        skript: 'punktlagen',
      },
      {
        frage: 'Nun wählt man <i>p</i>4<i>mm</i>; das Fähnchen bleibt, wo es ist. Wie viele Fähnchen erscheinen jetzt je Zelle?',
        vermutung: ['4', '8', '16'], richtig: 1,
        handlung: { text: '<i>p</i>4<i>mm</i> wählen', hash: '#m=entwurf&g=p4mm&basis=fahne,0,2/5,1/10,0' },
        beobachtung: 'Acht Fähnchen: die vier Drehbilder und ihre Spiegelbilder.',
        erklaerung: '<i>p</i>4<i>mm</i> hat acht Operationen je Zelle, doppelt so viele wie <i>p</i>4. Dasselbe Motiv ergibt in einer anderen Gruppe ein anderes Muster.',
        skript: 'punktlagen',
      },
    ],
  },
];
