// PDF-Zusammenfassung des Ergebnisses, direkt im Browser erzeugt (pdf-lib).
// Layout nach dem Future-Response-Design (Light): weiß, Tinte, Haarlinien,
// eckig, Inter, der Verlauf nur als dünner Strich. Es werden keine Daten an
// einen Server geschickt. Wird erst beim Klick geladen (dynamischer Import).
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import interRegular from "@fontsource/inter/files/inter-latin-400-normal.woff?url";
import interSemibold from "@fontsource/inter/files/inter-latin-600-normal.woff?url";
import interBold from "@fontsource/inter/files/inter-latin-700-normal.woff?url";

export interface PdfTreiber {
  kategorie: string;
  antwort: string;
  stufe: string;
  stufeId: "gelb" | "rot";
}

export interface PdfDaten {
  dateiname: string;
  eyebrow: string;
  titel: string;
  gruppeLabel: string;
  gruppe: string;
  erstelltLabel: string;
  datum: string;
  rolleTitel: string;
  rolleText: string;
  rolleDppLabel: string;
  rolleDpp: string;
  rolleWeitereLabel: string;
  rolleWeitere: string;
  aufwandTitel: string;
  treiberIntro: string;
  treiber: PdfTreiber[];
  umfangTitel: string;
  umfangLabel: string;
  umfangStufe: string;
  umfangText: string;
  standTitel: string;
  stand: string;
  quellen: string;
  hinweis: string;
  seiteLabel: string;
  logoSvg: string;
}

const farbe = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const TINTE = farbe("#161616");
const SCHWACH = farbe("#555555");
const LEISE = farbe("#6b6b6b");
const LINIE = farbe("#e2e2e0");
const GELB = farbe("#9a4a00");
const ROT = farbe("#b3261e");
const WEISS = farbe("#ffffff");
const WEISS_SCHWACH = farbe("#b9b9b9");

const SEITE = { b: 595.28, h: 841.89 };
const RAND = 56;
const OBEN = 52;
const UNTEN = 48;
const BREITE = SEITE.b - 2 * RAND;

// Die eingebettete Inter-Teilmenge (latin) kennt keine tiefgestellte 2.
const sauber = (text: string) => text.replaceAll("₂", "2");

async function ladeSchrift(url: string) {
  const antwort = await fetch(url);
  return new Uint8Array(await antwort.arrayBuffer());
}

// Logo (SVG) in ein PNG umrechnen, damit auch der Farbverlauf im "o" stimmt.
async function logoAlsPng(svg: string): Promise<Uint8Array | null> {
  try {
    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    const bild = new Image();
    bild.src = url;
    await bild.decode();
    const faktor = 4;
    const leinwand = document.createElement("canvas");
    leinwand.width = 411.4 * faktor;
    leinwand.height = 71 * faktor;
    leinwand
      .getContext("2d")!
      .drawImage(bild, 0, 0, leinwand.width, leinwand.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((fertig) =>
      leinwand.toBlob(fertig, "image/png"),
    );
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export async function erzeugePdf(d: PdfDaten) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const [reg, semi, fett] = await Promise.all([
    ladeSchrift(interRegular),
    ladeSchrift(interSemibold),
    ladeSchrift(interBold),
  ]);
  const f = {
    reg: await pdf.embedFont(reg, { subset: true }),
    semi: await pdf.embedFont(semi, { subset: true }),
    fett: await pdf.embedFont(fett, { subset: true }),
  };
  const logoPng = await logoAlsPng(d.logoSvg);
  const logo = logoPng ? await pdf.embedPng(logoPng) : null;

  pdf.setTitle(sauber(d.titel));
  pdf.setAuthor("Future Response");

  let seite: PDFPage = pdf.addPage([SEITE.b, SEITE.h]);
  let y = SEITE.h - OBEN;

  const neueSeite = () => {
    seite = pdf.addPage([SEITE.b, SEITE.h]);
    y = SEITE.h - OBEN;
  };
  const platz = (hoehe: number) => {
    if (y - hoehe < UNTEN) neueSeite();
  };

  const umbruch = (
    text: string,
    schrift: PDFFont,
    groesse: number,
    breite: number,
  ) => {
    const zeilen: string[] = [];
    for (const absatz of sauber(text).split("\n")) {
      let zeile = "";
      for (const wort of absatz.split(" ")) {
        const probe = zeile ? `${zeile} ${wort}` : wort;
        if (zeile && schrift.widthOfTextAtSize(probe, groesse) > breite) {
          zeilen.push(zeile);
          zeile = wort;
        } else {
          zeile = probe;
        }
      }
      zeilen.push(zeile);
    }
    return zeilen;
  };

  // Absatz zeichnen, bei Bedarf über Seitengrenzen hinweg.
  const absatz = (
    text: string,
    opt: {
      schrift?: PDFFont;
      groesse?: number;
      farbe?: ReturnType<typeof rgb>;
      x?: number;
      breite?: number;
      abstand?: number;
      zeilenhoehe?: number;
    } = {},
  ) => {
    const schrift = opt.schrift ?? f.reg;
    const groesse = opt.groesse ?? 10.5;
    const x = opt.x ?? RAND;
    const breite = opt.breite ?? BREITE;
    const hoehe = groesse * (opt.zeilenhoehe ?? 1.5);
    for (const zeile of umbruch(text, schrift, groesse, breite)) {
      platz(hoehe);
      y -= hoehe;
      seite.drawText(zeile, {
        x,
        y: y + (hoehe - groesse) / 2 + groesse * 0.12,
        size: groesse,
        font: schrift,
        color: opt.farbe ?? TINTE,
      });
    }
    y -= opt.abstand ?? 0;
  };

  const linie = (breite = BREITE, farbeLinie = LINIE) => {
    seite.drawLine({
      start: { x: RAND, y },
      end: { x: RAND + breite, y },
      thickness: 0.6,
      color: farbeLinie,
    });
  };

  // ── Kopf: Logo links, Gruppe und Datum rechts, Haarlinie mit Verlaufsstrich
  const logoH = 22;
  if (logo) {
    const logoB = (logoH * 411.4) / 71;
    seite.drawImage(logo, {
      x: RAND,
      y: y - logoH,
      width: logoB,
      height: logoH,
    });
  } else {
    seite.drawText("Future Response", {
      x: RAND,
      y: y - 16,
      size: 15,
      font: f.fett,
      color: TINTE,
    });
  }
  const meta = [
    `${d.gruppeLabel}: ${d.gruppe}`,
    `${d.erstelltLabel} ${d.datum}`,
  ];
  meta.forEach((zeile, i) => {
    const text = sauber(zeile);
    seite.drawText(text, {
      x: SEITE.b - RAND - f.reg.widthOfTextAtSize(text, 8.5),
      y: y - 9 - i * 12,
      size: 8.5,
      font: f.reg,
      color: SCHWACH,
    });
  });
  y -= logoH + 14;
  linie();
  // Verlauf (indigo → orchid → pfirsich) als dünner Strich auf der Haarlinie
  const stopps = [
    [0x5b, 0x5b, 0xd6],
    [0xc2, 0x7b, 0xc0],
    [0xf2, 0xa6, 0x76],
  ];
  const teile = 36;
  for (let i = 0; i < teile; i++) {
    const t = i / (teile - 1);
    const [a, b, k] = t < 0.5 ? [0, 1, t * 2] : [1, 2, (t - 0.5) * 2];
    const c = stopps[a].map((v, j) => (v + (stopps[b][j] - v) * k) / 255);
    seite.drawRectangle({
      x: RAND + (i * 72) / teile,
      y: y - 1.5,
      width: 72 / teile + 0.4,
      height: 3,
      color: rgb(c[0], c[1], c[2]),
    });
  }
  y -= 22;

  // ── Titel
  absatz(d.eyebrow.toUpperCase(), {
    schrift: f.semi,
    groesse: 8,
    farbe: SCHWACH,
    abstand: 6,
  });
  absatz(d.titel, {
    schrift: f.fett,
    groesse: 21,
    zeilenhoehe: 1.18,
    breite: BREITE,
    abstand: 6,
  });

  // ── Abschnitte (nummeriert, mit Haarlinie wie auf der CSRD-Seite)
  const abschnitt = (nr: string, titel: string, mindest = 70) => {
    platz(mindest);
    y -= 9;
    linie();
    y -= 12;
    seite.drawText(nr, {
      x: RAND,
      y: y - 8,
      size: 8,
      font: f.semi,
      color: LEISE,
    });
    seite.drawText(sauber(titel).toUpperCase(), {
      x: RAND + 22,
      y: y - 8,
      size: 8,
      font: f.semi,
      color: SCHWACH,
    });
    y -= 17;
  };

  // 01 Rolle
  abschnitt("01", d.rolleTitel);
  const hatRolle = Boolean(d.rolleDpp);
  absatz(d.rolleText, {
    schrift: hatRolle ? f.semi : f.reg,
    groesse: hatRolle ? 12 : 10.5,
    farbe: hatRolle ? TINTE : SCHWACH,
    zeilenhoehe: hatRolle ? 1.45 : 1.5,
    abstand: hatRolle ? 8 : 4,
  });
  if (hatRolle) {
    // Kleine Zwischenüberschriften wie die Eyebrow-Labels der Website
    const teil = (label: string, text: string) => {
      absatz(label.toUpperCase(), {
        schrift: f.semi,
        groesse: 7.5,
        farbe: LEISE,
        abstand: 1,
      });
      absatz(text, { groesse: 10, zeilenhoehe: 1.45, abstand: 7 });
    };
    teil(d.rolleDppLabel, d.rolleDpp);
    teil(d.rolleWeitereLabel, d.rolleWeitere);
  }

  // 02 Aufwandstreiber
  abschnitt("02", d.aufwandTitel);
  absatz(d.treiberIntro, { abstand: 6 });
  for (const t of d.treiber) {
    const zeilenH = 19;
    platz(zeilenH + 4);
    const oben = y;
    seite.drawLine({
      start: { x: RAND, y: oben },
      end: { x: RAND + BREITE, y: oben },
      thickness: 0.5,
      color: LINIE,
    });
    // Stufe als Wort im eckigen Tag (nie nur Farbe)
    const tagText = sauber(t.stufe);
    const tagB = f.semi.widthOfTextAtSize(tagText, 8) + 12;
    const tagFarbe = t.stufeId === "rot" ? ROT : GELB;
    const tagX = SEITE.b - RAND - tagB;
    seite.drawRectangle({
      x: tagX,
      y: oben - zeilenH + 5,
      width: tagB,
      height: 14,
      borderColor: tagFarbe,
      borderWidth: 0.8,
    });
    seite.drawText(tagText, {
      x: tagX + 6,
      y: oben - zeilenH + 9,
      size: 8,
      font: f.semi,
      color: tagFarbe,
    });
    const kat = sauber(t.kategorie);
    seite.drawText(kat, {
      x: RAND,
      y: oben - 14,
      size: 10,
      font: f.semi,
      color: TINTE,
    });
    const katB = f.semi.widthOfTextAtSize(kat, 10);
    const rest = tagX - (RAND + katB + 10) - 8;
    const antwortZeile = umbruch(t.antwort, f.reg, 10, rest)[0] ?? "";
    seite.drawText(antwortZeile, {
      x: RAND + katB + 10,
      y: oben - 14,
      size: 10,
      font: f.reg,
      color: SCHWACH,
    });
    y -= zeilenH;
  }
  if (d.treiber.length) {
    linie();
  }

  // 03 Umfang: eine invertierte Karte (Tinte), wie die Zusammenfassungs-Karte der Website
  const textZeilen = umbruch(d.umfangText, f.reg, 10.5, BREITE - 40);
  const kartenH = 68 + textZeilen.length * 15;
  // Überschrift und Karte bleiben zusammen auf einer Seite
  abschnitt("03", d.umfangTitel, kartenH + 60);
  seite.drawRectangle({
    x: RAND,
    y: y - kartenH,
    width: BREITE,
    height: kartenH,
    color: TINTE,
  });
  let ky = y - 20;
  seite.drawText(sauber(d.umfangLabel).toUpperCase(), {
    x: RAND + 20,
    y: ky,
    size: 8,
    font: f.semi,
    color: WEISS_SCHWACH,
  });
  ky -= 28;
  seite.drawText(sauber(d.umfangStufe), {
    x: RAND + 20,
    y: ky,
    size: 28,
    font: f.fett,
    color: WEISS,
  });
  ky -= 21;
  for (const zeile of textZeilen) {
    seite.drawText(zeile, {
      x: RAND + 20,
      y: ky,
      size: 10.5,
      font: f.reg,
      color: WEISS,
    });
    ky -= 15;
  }
  y -= kartenH + 6;

  // Fuß: Stand der Daten, Quellenhinweis und Disclaimer
  platz(84);
  y -= 18;
  linie();
  y -= 8;
  absatz(`${d.standTitel}: ${d.stand}`, {
    schrift: f.semi,
    groesse: 8.5,
    farbe: SCHWACH,
    breite: BREITE,
    abstand: 3,
  });
  absatz(d.quellen, { groesse: 8, farbe: LEISE, breite: BREITE, abstand: 3 });
  absatz(d.hinweis, { groesse: 8, farbe: LEISE, breite: BREITE });

  // Seitenzahlen unten rechts, Marke links
  const seiten = pdf.getPages();
  seiten.forEach((s, i) => {
    const zahl = sauber(`${d.seiteLabel} ${i + 1} / ${seiten.length}`);
    s.drawText(zahl, {
      x: SEITE.b - RAND - f.reg.widthOfTextAtSize(zahl, 8),
      y: 30,
      size: 8,
      font: f.reg,
      color: LEISE,
    });
    s.drawText("Future Response", {
      x: RAND,
      y: 30,
      size: 8,
      font: f.reg,
      color: LEISE,
    });
  });

  const bytes = await pdf.save();
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = d.dateiname;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
}
