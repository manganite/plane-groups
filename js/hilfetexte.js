// Texte der Hilfen: Tooltips (Laptop) und ⓘ-Erklärungen je Abschnitt (Touch-Geräte).
// Die Mechanik steht in lib/common/js/help.js. Begriffe wie im Skript.

/** Tooltip-Texte je Element-ID. Bei Eingabefeldern erscheint der Tooltip an der ganzen Zeile. */
export const TIPS = {
  'tab-eg': 'Die 17 Ebenengruppen: Symmetrieelemente, Lagen und Muster.',
  'tab-struktur': 'Gitter und Basis: Symmetrie einer 2D-Kristallstruktur bestimmen (folgt).',
  'copy-link': 'Link auf genau diese Ansicht in die Zwischenablage kopieren.',
  'opt-elemente': 'Drehpunkte, Spiegellinien (durchgezogen) und Gleitspiegellinien (gestrichelt) der Elementarzelle, mit den Symbolen der International Tables.',
  'opt-objekt': 'Ein Objekt ohne eigene Symmetrie in allgemeiner Lage. Alle Operationen der Gruppe wirken darauf; das Ausgangsobjekt ist gestrichelt umkreist.',
  'opt-ae': 'Kleinster Teil der Elementarzelle, aus dem die Operationen die ganze Zelle lückenlos erzeugen (nach International Tables).',
  'opt-zellen': 'Vier Elementarzellen statt einer: zeigt, wie sich die Symmetrieelemente mit dem Gitter wiederholen.',
  'seg-form': 'Fähnchen oder Kreis mit Komma wie in den International Tables. Das Komma bzw. die Fahne auf der anderen Seite kennzeichnet das Spiegelbild.',
  'opt-einrasten': 'Nahe einem Drehpunkt oder einer Spiegellinie springt das Objekt beim Ziehen auf das Symmetrieelement (spezielle Lage).',
  'obj-x': 'Koordinate x des Ausgangsobjekts in Bruchteilen von a.',
  'obj-y': 'Koordinate y des Ausgangsobjekts in Bruchteilen von b.',
  'reset-objekt': 'Objekt zurück an die Ausgangslage.',
  'lat-ba': 'Verhältnis der Gitterkonstanten b/a. Frei im schiefwinkligen und im rechteckigen System.',
  'lat-gamma': 'Winkel γ zwischen a und b. Frei nur im schiefwinkligen System.',
  'reset-gitter': 'Gitterparameter dieses Kristallsystems zurücksetzen.',
  'v-farben': 'Symmetrieelemente in der Farbe ihrer Blickrichtung (Position im Hermann-Mauguin-Symbol): Drehpunkte, Spiegel- und Gleitspiegellinien nach der Richtung ihrer Normalen.',
  'v-muster-el': 'Die Symmetrieelemente auch im Muster einblenden.',
  'reset-alles': 'Alle Einstellungen auf den Startzustand zurücksetzen.',
};

/** ⓘ-Erklärungen: je Abschnitt ein Einleitungssatz und die Elemente, deren Texte gezeigt werden. */
export const SECTIONS = [
  { heading: '#ctl-gruppe > h2', intro: 'Gruppe antippen: Links erscheint das Symmetriegerüst einer Elementarzelle, rechts ein Ausschnitt des Musters. Das Objekt lässt sich im Symmetriegerüst ziehen.', ids: ['opt-elemente', 'opt-objekt', 'opt-ae', 'opt-zellen', 'seg-form', 'opt-einrasten'] },
  { heading: '#sec-objekt > summary', intro: 'Lage des Ausgangsobjekts in Bruchkoordinaten.', ids: ['obj-x', 'obj-y'] },
  { heading: '#sec-gitter > summary', intro: 'Die Gitterparameter dürfen sich innerhalb des Kristallsystems frei ändern; die Symmetrie bleibt dabei erhalten.', ids: ['lat-ba', 'lat-gamma'] },
  { heading: '#sec-view > summary', ids: ['v-farben', 'v-muster-el'] },
];

/** Beschriftung in der ⓘ-Erklärung, wo der Text des Elements nicht passt. */
export const LABELS = {
  'seg-form': 'Form des Objekts',
  'obj-x': 'x',
  'obj-y': 'y',
  'lat-ba': 'b/a',
  'lat-gamma': 'γ',
};
