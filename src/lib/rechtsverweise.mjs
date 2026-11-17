// Blendet Paragraphen- und Artikelverweise (Art. 34, Abs. 2, Anhang IV, …) in
// Anzeigetexten aus, damit die Seite einfach und einladend bleibt.
// Die Inhalte in `inhalte/` bleiben unverändert (Quellenpflicht): gefiltert wird
// nur beim Bauen der Seite, siehe `astro.config.mjs` und `RECHTSVERWEISE_ANZEIGEN`
// in `src/config.ts`.

const ZAHL = String.raw`\d+[a-z]?(?:\(\d+\))?`;
const ZAHLEN = String.raw`${ZAHL}(?:\s*(?:,|und|bis|–|-|ff\.)\s*${ZAHL})*(?:\s*ff\.)?`;
const DETAIL = [
  String.raw`(?:\s*(?:Abs\.|Absatz)\s*${ZAHLEN})`,
  String.raw`(?:\s*(?:Buchst\.|lit\.)\s*[a-z](?:\s*(?:,|und|bis|–|-)\s*[a-z])*)`,
  String.raw`(?:\s*Nr\.\s*[\d.]+(?:\s*[a-z](?:\s*[–-]\s*[a-z])?)?)`,
].join("|");

// Ein einzelner Verweis: "Art. 7 Abs. 5 Buchst. e", "Art. 75 bis 80",
// "Anhang XIII Nr. 1 c", "Abs. 2".
const VERWEIS = String.raw`(?:(?:Art\.|Artikel|§§?)\s*${ZAHLEN}(?:${DETAIL})*|Anhang\s+[IVX]+(?:${DETAIL})*|(?:Abs\.|Absatz)\s*${ZAHLEN})`;
const VERWEIS_RE = new RegExp(VERWEIS, "g");
const ENTHAELT_RE = new RegExp(VERWEIS);

function aufraeumen(text) {
  return text
    .replace(/\s+([,.;:!?)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function ersteGross(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ohneRechtsverweise(text) {
  if (typeof text !== "string" || !ENTHAELT_RE.test(text)) return text;
  // "Art. 48(1)" -> "Art. 48 Abs. 1", damit die Klammern unten nicht stören.
  let t = text.replace(/(Art\.\s*\d+[a-z]?)\((\d+)\)/g, "$1 Abs. $2");

  // Klammern: Verweise darin entfernen; bleibt nichts Sinnvolles, die Klammer weg.
  t = t.replace(/\s*\(([^()]*)\)/g, (klammer, inhalt) => {
    if (!ENTHAELT_RE.test(inhalt)) return klammer;
    let rest = inhalt.replace(VERWEIS_RE, "");
    rest = rest
      .replace(/\bff\.?/g, "")
      .replace(/\b(?:sowie|und|bzw\.|bis)\s*(?=[,;)]|$)/g, "")
      .replace(/(^|[,;])\s*[,;]+/g, "$1")
      .replace(/^[\s,;]+|[\s,;]+$/g, "")
      .trim();
    // Nur ein Rest aus Kürzel/Nummern wie "ESPR" lohnt die Klammer nicht,
    // wohl aber echter Text.
    return rest && rest !== "ESPR" && /[A-Za-zÄÖÜäöü]{3,}/.test(rest)
      ? ` (${rest})`
      : "";
  });

  // "nach Art. 34 ESPR" -> "nach der ESPR"; "des Art. 34 ESPR" -> "der ESPR".
  t = t.replace(
    new RegExp(String.raw`\b(nach|des|der)\s+${VERWEIS}\s+ESPR`, "gi"),
    (_m, wort) =>
      wort.toLowerCase() === "nach" ? "nach der ESPR" : "der ESPR",
  );
  t = t.replace(new RegExp(String.raw`${VERWEIS}\s+ESPR`, "g"), "ESPR");

  // "… des Art. 26 zu" -> "… zu"; ": folgt mit Art. 8" -> "".
  t = t.replace(new RegExp(String.raw`\s+des\s+${VERWEIS}`, "g"), "");
  t = t.replace(new RegExp(String.raw`:\s*folgt\s+mit\s+${VERWEIS}`, "g"), "");
  t = t.replace(/(^|[.!?]\s+)nach der ESPR/g, "$1Nach der ESPR");

  // Satzanfang "Nach Art. 26 Abs. 1, wenn …" / "Nach Art. 76 Abs. 2 unter anderem …".
  t = t.replace(
    new RegExp(String.raw`(^|[.!?]\s+)Nach\s+${VERWEIS},?\s+(\S)`, "g"),
    (_m, vor, erster) => `${vor}${erster.toUpperCase()}`,
  );

  // "… nach Art. 22 gelten" -> "… gelten".
  t = t.replace(new RegExp(String.raw`\s+nach\s+${VERWEIS}`, "g"), "");

  // Alles Übrige schlicht entfernen.
  t = t.replace(VERWEIS_RE, "");

  t = aufraeumen(t);
  return t === "" ? "" : /^[a-zäöü]/.test(text) ? t : ersteGross(t);
}

// Quellenfelder bleiben unberührt (sie erscheinen nur bei QUELLEN_ANZEIGEN).
const QUELLFELDER = new Set([
  "quelle",
  "quelle_regel",
  "quellen",
  "bezug",
  "rechtsgrundlage",
  "url",
  "link",
]);

export function ohneRechtsverweiseTief(wert) {
  if (typeof wert === "string") return ohneRechtsverweise(wert);
  if (Array.isArray(wert)) return wert.map(ohneRechtsverweiseTief);
  if (wert && typeof wert === "object") {
    return Object.fromEntries(
      Object.entries(wert).map(([k, v]) => [
        k,
        QUELLFELDER.has(k) ? v : ohneRechtsverweiseTief(v),
      ]),
    );
  }
  return wert;
}
