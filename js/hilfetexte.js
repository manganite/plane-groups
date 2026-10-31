// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Mechanik steht in lib/common/js/help.js. Begriffe wie im Skript.

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  'tab-eg': 'Die 17 Ebenengruppen: Symmetrieelemente, Lagen und Muster.',
  'tab-struktur': 'Gitter und Basis: Symmetrie einer 2D-Kristallstruktur bestimmen (folgt).',
  'copy-link': 'Link auf genau diese Ansicht in die Zwischenablage kopieren.',
  'opt-elemente': 'Drehpunkte, Spiegellinien (durchgezogen) und Gleitspiegellinien (gestrichelt) der Elementarzelle, mit den Symbolen der International Tables.',
  'opt-objekt': 'Ein Objekt ohne eigene Symmetrie in allgemeiner Lage. Alle Operationen der Gruppe wirken darauf; das Ausgangsobjekt ist gestrichelt umkreist. Ausgeschaltet zeigt auch das Muster nur das selbst Gezeichnete.',
  'opt-ae': 'Kleinster Teil der Elementarzelle, aus dem die Operationen die ganze Zelle lückenlos erzeugen (nach International Tables).',
  'opt-zellen': 'Vier Elementarzellen statt einer: zeigt, wie sich die Symmetrieelemente mit dem Gitter wiederholen.',
  'seg-form': 'Fähnchen oder Kreis mit Komma wie in den International Tables. Das Komma bzw. die Fahne auf der anderen Seite kennzeichnet das Spiegelbild.',
  'opt-orbit': 'Wie in den Diagrammen der allgemeinen Lage in ITA: auch die Bilder im Rand rund um die Zelle (⅓ der Zelle), damit die Gruppen um Ecken und Ränder vollständig sind.',
  'opt-einrasten': 'Nahe einem Drehpunkt oder einer Spiegellinie springt das Objekt beim Ziehen auf das Symmetrieelement (spezielle Lage).',
  'obj-x': 'Koordinate x des Ausgangsobjekts in Bruchteilen von a.',
  'obj-y': 'Koordinate y des Ausgangsobjekts in Bruchteilen von b.',
  'reset-objekt': 'Objekt zurück an die Ausgangslage.',
  'lat-ba': 'Verhältnis der Gitterkonstanten b/a. Frei im schiefwinkligen und im rechteckigen System.',
  'lat-gamma': 'Winkel γ zwischen a und b. Frei nur im schiefwinkligen System.',
  'reset-gitter': 'Gitterparameter dieses Kristallsystems zurücksetzen, mit Bindung an das System.',
  'opt-brechen': 'b/a und γ ohne die Bindung an das Kristallsystem verändern: Es bleiben nur die Operationen, die die neue Metrik erhalten. Die Kenndaten nennen die verbleibende Symmetrie.',
  'v-farben': 'Symmetrieelemente in der Farbe ihrer Blickrichtung (Position im Hermann-Mauguin-Symbol): Drehpunkte, Spiegel- und Gleitspiegellinien nach der Richtung ihrer Normalen.',
  'v-muster-el': 'Die Symmetrieelemente auch im Muster einblenden.',
  'werkzeug-zeichnen': 'Werkzeug: Im Symmetriegerüst ziehen zeichnet einen Strich. Die Gruppe vervielfältigt ihn mit allen Operationen, auch im Muster.',
  'werkzeug-radieren': 'Werkzeug: Über Striche ziehen radiert die überfahrenen Stücke, am Original und an allen Kopien zugleich.',
  'zeichnen-zurueck': 'Den letzten Strich oder das letzte Radieren rückgängig machen.',
  'zeichnen-loeschen': 'Alle Striche entfernen.',
  'opt-fuell': 'Die asymmetrische Einheit füllen und mit allen Operationen vervielfältigen: Ihre Bilder pflastern die Ebene ohne Lücken und Überlappungen.',
  'werkzeug-warum': 'Werkzeug: Ein Symmetrieelement antippen zeigt, aus welchen zwei Operationen es folgt, am Fähnchen Schritt für Schritt.',
  'opt-schritt': 'Das Objekt wird mit den Symmetrieoperationen einzeln abgebildet, in der Reihenfolge der International Tables; zuletzt verschieben die Gittertranslationen alle Bilder in die Zelle. Ein Zähler zeigt, wie viele verschiedene Stellen entstehen.',
  'schritt-regler': 'Schritt: Operation (1), (2), … der Liste, zuletzt die Gittertranslationen.',
  'schritt-zurueck': 'Einen Schritt zurück.',
  'schritt-vor': 'Einen Schritt weiter.',
  'schritt-abspielen': 'Alle Schritte nacheinander zeigen.',
  'opt-aufbau': 'Die Symmetrieelemente der Reihe nach aus den Erzeugenden aufbauen: zuerst die Erzeugenden nach den International Tables, dann was aus ihren Verknüpfungen folgt.',
  'aufbau-schritt': 'Schritt im Aufbau. Ein Schritt verknüpft jede bisherige Operation mit einer Erzeugenden oder einer Gittertranslation.',
  'aufbau-zurueck': 'Einen Schritt zurück.',
  'aufbau-vor': 'Einen Schritt weiter: Die neu hinzukommenden Elemente sind hervorgehoben.',
  'reset-alles': 'Alle Einstellungen auf den Startzustand zurücksetzen.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  { heading: '#ctl-gruppe > h2', intro: 'Gruppe antippen: Links erscheint das Symmetriegerüst einer Elementarzelle, rechts ein Ausschnitt des Musters. Das Objekt lässt sich im Symmetriegerüst ziehen.', ids: ['opt-elemente', 'opt-objekt', 'opt-ae', 'opt-zellen', 'seg-form', 'opt-einrasten', 'opt-orbit'] },
  { heading: '#sec-zeichnen > summary', intro: 'Was tut eine Ebenengruppe? Zeichnen Sie etwas: Die Gruppe macht daraus ein Muster.', ids: ['werkzeug-zeichnen', 'werkzeug-radieren', 'zeichnen-zurueck', 'zeichnen-loeschen', 'opt-fuell'] },
  { heading: '#sec-schritte > summary', intro: 'Wie erzeugen die Symmetrieoperationen aus einem Objekt das ganze Muster? Hier wirken sie einzeln.', ids: ['opt-schritt', 'schritt-regler', 'schritt-zurueck', 'schritt-vor', 'schritt-abspielen'] },
  { heading: '#sec-aufbau > summary', intro: 'Welche Symmetrieelemente folgen zwangsläufig aus wenigen Erzeugenden? Hier erscheinen sie Schritt für Schritt.', ids: ['opt-aufbau', 'aufbau-schritt', 'aufbau-zurueck', 'aufbau-vor'] },
  { heading: '#sec-objekt > summary', intro: 'Lage des Ausgangsobjekts in Bruchkoordinaten.', ids: ['obj-x', 'obj-y'] },
  { heading: '#sec-gitter > summary', intro: 'Die Gitterparameter dürfen sich innerhalb des Kristallsystems frei ändern; die Symmetrie bleibt dabei erhalten. Ohne Bindung an das System bricht sie.', ids: ['lat-ba', 'lat-gamma', 'opt-brechen'] },
  { heading: '#sec-view > summary', ids: ['v-farben', 'v-muster-el'] },
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
};
