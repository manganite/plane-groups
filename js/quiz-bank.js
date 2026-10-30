// Fragen des Quiz (handgeschrieben). Aufbau siehe lib/common/js/quiz-core.js.
// Nur Fragen mit status 'geprüft' erscheinen; Entwürfe zeigt quiz.html?entwurf.

export const BANK = [
  {
    id: 'muster-1-01', stufe: 1, kapitel: 1, typ: 'einfach',
    lernziel: 'ein Lernziel, als Tätigkeit formuliert',
    frage: 'Wie viele Ebenengruppen gibt es?',
    antworten: ['17', '10', '32', '230'],
    richtig: [0],
    hinweise: [null, 'Das ist die Zahl der ebenen Punktgruppen.', 'Das ist die Zahl der Punktgruppen im Raum.', 'Das ist die Zahl der Raumgruppen.'],
    erklaerung: 'Es gibt 17 Ebenengruppen (zweidimensionale Raumgruppen).',
    skript: 'abschnitt1', app: '#m=a&g=p4mm',
    quelle: 'ITA, Vol. A (2006), Tab. 2.2.1.1',
    status: 'entwurf',
  },
  {
    id: 'muster-1-02', stufe: 1, kapitel: 1, typ: 'bild-text',
    lernziel: 'ein zweites Lernziel',
    frage: 'Was zeigt das Bild?',
    bild: '#m=a&g=p4mm', bildAlt: 'Quadratisches Gitter',
    antworten: ['Ein quadratisches Gitter', 'Ein hexagonales Gitter', 'Ein schiefwinkliges Gitter', 'Ein rechtwinkliges Gitter mit a ≠ b'],
    richtig: [0],
    hinweise: [null, 'Im hexagonalen Gitter schliessen a und b 120° ein.', 'Hier stehen a und b senkrecht aufeinander.', 'Hier sind a und b gleich lang.'],
    erklaerung: 'Gleich lange, senkrechte Gittervektoren: quadratisches Gitter.',
    skript: 'abschnitt1',
    quelle: 'eigene',
    status: 'entwurf',
  },
];
