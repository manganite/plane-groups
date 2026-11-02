// Die Operationen der Punktgruppen der Ebene mit Namen wie im Skript (Abschn. 4.4, Abb. 4.4 und 4.5):
// Identität 1; Drehung um 180° 2; Drehungen um 360°/n gegen bzw. im Uhrzeigersinn +n und −n
// (n = 3, 4, 6); Spiegelungen mit Index. In 3m gehen m1, m2, m3 durch die Stellen 1, 2, 3 der
// Abb. 4.4; in 4mm und 6mm sind die Spiegellinien gegen den Uhrzeigersinn nummeriert, m1 waagrecht;
// in 2mm liegt ma entlang a (im Bild nach unten wie in der App), mb entlang b (nach rechts).
//
// Eine Operation: { name, html, art: 'd' | 'm', w }. w ist bei einer Drehung der Drehwinkel, bei
// einer Spiegelung der Winkel der Linie, in Grad gegen den Uhrzeigersinn ab der Waagrechten im Bild.

const mod = (x, n) => ((x % n) + n) % n;
const D = (w, name) => ({ name, html: name, art: 'd', w: mod(w, 360) });
const M = (w, index, kursiv = false) => ({
  name: `m${index}`, html: `<i>m</i>${kursiv ? `<sub><i>${index}</i></sub>` : '₀₁₂₃₄₅₆₇₈₉'[index]}`, art: 'm', w: mod(w, 180),
});

const E = D(0, '1');
const ZWEI = D(180, '2');
const DREH = { 3: [D(120, '+3'), D(240, '−3')], 4: [D(90, '+4'), D(270, '−4')], 6: [D(60, '+6'), D(300, '−6')] };

/** Punktgruppen mit mindestens einer echten Untergruppe ausser 1, in der Reihenfolge der Systeme. */
export const OPERATIONEN = {
  4: [E, ZWEI, ...DREH[4]],
  '2mm': [E, ZWEI, M(90, 'a', true), M(0, 'b', true)],
  '3m': [E, ...DREH[3], M(30, 1), M(150, 2), M(90, 3)],
  '4mm': [E, ZWEI, ...DREH[4], ...[0, 45, 90, 135].map((w, i) => M(w, i + 1))],
  6: [E, ZWEI, ...DREH[3], ...DREH[6]],
  '6mm': [E, ZWEI, ...DREH[3], ...DREH[6], ...[0, 30, 60, 90, 120, 150].map((w, i) => M(w, i + 1))],
};

/** Verknüpfung A ∘ B (zuerst B, dann A) als { art, w }. */
function verkn(A, B) {
  if (A.art === 'd' && B.art === 'd') return { art: 'd', w: mod(A.w + B.w, 360) };
  if (A.art === 'd') return { art: 'm', w: mod(B.w + A.w / 2, 180) };
  if (B.art === 'd') return { art: 'm', w: mod(A.w - B.w / 2, 180) };
  return { art: 'd', w: mod(2 * (A.w - B.w), 360) };
}

/** Index von A ∘ B in der Punktgruppe pg (Indizes in OPERATIONEN[pg]). */
export function verknuepfe(pg, a, b) {
  const ops = OPERATIONEN[pg];
  const c = verkn(ops[a], ops[b]);
  const k = ops.findIndex((o) => o.art === c.art && Math.abs(o.w - c.w) < 1e-9);
  if (k < 0) throw new Error(`${pg}: ${ops[a].name} ∘ ${ops[b].name} nicht in der Gruppe`);
  return k;
}

/** Gruppentafel: Zeile A, Spalte B, Eintrag A ∘ B (Namen). */
export const gruppentafel = (pg) => OPERATIONEN[pg].map((_, a) => OPERATIONEN[pg].map((__, b) => OPERATIONEN[pg][verknuepfe(pg, a, b)].name));

/** Erstes Paar [A, B] aus der Menge (Indizes), dessen Verknüpfung nicht in der Menge liegt; Quadrate zuerst. */
export function nichtAbgeschlossen(pg, menge) {
  for (const a of menge) if (!menge.includes(verknuepfe(pg, a, a))) return [a, a];
  for (const a of menge) for (const b of menge) if (!menge.includes(verknuepfe(pg, a, b))) return [a, b];
  return null;
}

/** Ist die Menge (Indizes) eine Gruppe? Bei endlichen Mengen genügen die Identität und die Abgeschlossenheit. */
export const istGruppe = (pg, menge) => menge.includes(0) && !nichtAbgeschlossen(pg, menge);

/** Alle Teilmengen (Indizes, aufsteigend) mit Grösse zwischen lo und hi. */
export function teilmengen(n, lo, hi) {
  const out = [];
  for (let bits = 1; bits < 1 << n; bits++) {
    const s = [];
    for (let i = 0; i < n; i++) if (bits & (1 << i)) s.push(i);
    if (s.length >= lo && s.length <= hi) out.push(s);
  }
  return out;
}

/** Echte Untergruppen ausser {1}, nach Grösse. */
export const untergruppen = (pg) => {
  const n = OPERATIONEN[pg].length;
  return teilmengen(n, 2, n - 1).filter((s) => istGruppe(pg, s)).sort((x, y) => x.length - y.length);
};

/** Symbol der Punktgruppe, die eine Menge von Operationen bildet (z. B. „2mm“, „3“). */
export function symbolVon(pg, menge) {
  const ops = menge.map((i) => OPERATIONEN[pg][i]);
  const n = ops.filter((o) => o.art === 'd').length;
  const m = ops.length - n;
  if (!m) return String(n);
  return n === 1 ? 'm' : n === 2 ? '2mm' : `${n}m${n === 3 ? '' : 'm'}`;
}
