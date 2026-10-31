// Asymmetrische Einheit aus den Bedingungen der ITA-Seite (z. B. „0 ≤ x ≤ 1/2; 0 ≤ y ≤ 1/2; x ≤ y“):
// jede Bedingung als Halbebenen, ihr Bereich in der Zelle und der Schnitt mehrerer Bedingungen.
// Ohne DOM, damit es sich testen lässt.

/** Lineare Ausdrücke in x und y lesen: „1/2 − x“, „(1 + y)/2“, „2y“, „x/2“ → [cx, cy, c0]. */
function linear(text) {
  const t = text.replace(/−/g, '-').replace(/\s+/g, '');
  let i = 0;
  const plus = (a, b, k = 1) => a.map((v, j) => v + k * b[j]);
  const mal = (a, k) => a.map((v) => v * k);
  const zahl = () => {
    const m = /^\d+(\.\d+)?/.exec(t.slice(i));
    if (!m) throw new Error(`Zahl erwartet in „${text}“`);
    i += m[0].length; return Number(m[0]);
  };
  const faktor = () => {
    if (t[i] === '(') { i++; const e = summe(); if (t[i++] !== ')') throw new Error(`„)“ fehlt in „${text}“`); return e; }
    if (t[i] === 'x') { i++; return [1, 0, 0]; }
    if (t[i] === 'y') { i++; return [0, 1, 0]; }
    const k = zahl();
    if (t[i] === 'x' || t[i] === 'y' || t[i] === '(') return mal(faktor(), k); // 2y, 2(…)
    return [0, 0, k];
  };
  const produkt = () => {
    let e = faktor();
    while (t[i] === '/') { i++; e = mal(e, 1 / zahl()); }
    return e;
  };
  function summe() {
    let vz = 1;
    if (t[i] === '-') { vz = -1; i++; } else if (t[i] === '+') i++;
    let e = mal(produkt(), vz);
    while (t[i] === '+' || t[i] === '-') { const k = t[i++] === '+' ? 1 : -1; e = plus(e, produkt(), k); }
    return e;
  }
  const e = summe();
  if (i !== t.length) throw new Error(`Unerwartet „${t.slice(i)}“ in „${text}“`);
  return e;
}

/** Seite einer Ungleichung: ein Ausdruck oder min(a, b) als Liste von Ausdrücken. */
function seite(text) {
  const m = /^\s*min\((.*)\)\s*$/.exec(text);
  if (!m) return [linear(text)];
  // Komma auf oberster Klammerebene trennt die Argumente
  let tiefe = 0; let k = -1;
  for (let j = 0; j < m[1].length; j++) {
    if (m[1][j] === '(') tiefe++; else if (m[1][j] === ')') tiefe--; else if (m[1][j] === ',' && tiefe === 0) k = j;
  }
  return [linear(m[1].slice(0, k)), linear(m[1].slice(k + 1))];
}

/**
 * Bedingungen der asymmetrischen Einheit: je Teil zwischen „;“ der Text und die Halbebenen
 * [cx, cy, c0] mit cx·x + cy·y + c0 ≥ 0. „L ≤ M ≤ R“ ergibt zwei, „y ≤ min(a, b)“ zwei Halbebenen.
 */
export function bedingungen(text) {
  return text.split(';').map((s) => s.trim()).filter(Boolean).map((teil) => {
    const glieder = teil.split('≤');
    const halbebenen = [];
    for (let j = 0; j + 1 < glieder.length; j++) {
      const [l] = seite(glieder[j]);
      for (const r of seite(glieder[j + 1])) halbebenen.push(r.map((v, k) => v - l[k]));
    }
    return { text: teil, halbebenen };
  });
}

/** Polygon (Bruchkoordinaten) auf die Halbebene h beschneiden (Sutherland-Hodgman). */
function beschneiden(poly, h) {
  const wert = (p) => h[0] * p[0] + h[1] * p[1] + h[2];
  const aus = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]; const q = poly[(i + 1) % poly.length];
    const a = wert(p); const b = wert(q);
    if (a >= -1e-12) aus.push(p);
    if ((a >= -1e-12) !== (b >= -1e-12)) {
      const u = a / (a - b);
      aus.push([p[0] + u * (q[0] - p[0]), p[1] + u * (q[1] - p[1])]);
    }
  }
  return aus;
}

/** Bereich, in dem alle Halbebenen erfüllt sind, innerhalb des Rechtecks [x0, x1] × [y0, y1]. */
export function bereich(halbebenen, [x0, y0, x1, y1] = [0, 0, 1, 1]) {
  let poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  for (const h of halbebenen) { poly = beschneiden(poly, h); if (!poly.length) break; }
  return poly;
}

/** Fläche eines Polygons in Bruchkoordinaten (Anteil an der Zellfläche). */
export function flaeche(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]; const q = poly[(i + 1) % poly.length];
    s += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(s) / 2;
}
