// Gemeinsame Geometrie für die Pilot-Grafiken (isometrische Projektion,
// Schein-QR-Codes, Sucher-Rahmen der Hero-Szene). Reine Darstellung, die
// Texte kommen aus der jeweiligen pilot.json.

export const cos30 = Math.cos(Math.PI / 6);

export const iso = (x: number, y: number, z: number) => [
  (x - y) * cos30,
  (x + y) * 0.5 - z,
];

export const pt = (x: number, y: number, z: number) =>
  iso(x, y, z)
    .map((n) => n.toFixed(1))
    .join(",");

export const box = (
  x0: number,
  y0: number,
  z0: number,
  l: number,
  w: number,
  h: number,
) => {
  const [x1, y1, z1] = [x0 + l, y0 + w, z0 + h];
  return {
    oben: [pt(x0, y0, z1), pt(x1, y0, z1), pt(x1, y1, z1), pt(x0, y1, z1)].join(
      " ",
    ),
    links: [
      pt(x0, y1, z0),
      pt(x1, y1, z0),
      pt(x1, y1, z1),
      pt(x0, y1, z1),
    ].join(" "),
    rechts: [
      pt(x1, y0, z0),
      pt(x1, y1, z0),
      pt(x1, y1, z1),
      pt(x1, y0, z1),
    ].join(" "),
  };
};

export type ViewBox = { x: number; y: number; b: number; h: number };

// Position eines Hotspots in Prozent der Grafik, damit die Buttons als
// HTML über dem SVG liegen können.
export const hotspotIn = (vb: ViewBox) => (x: number, y: number, z: number) => {
  const [sx, sy] = iso(x, y, z);
  return `left:${(((sx - vb.x) / vb.b) * 100).toFixed(2)}%;top:${(((sy - vb.y) / vb.h) * 100).toFixed(2)}%`;
};

// Deterministischer Zufall, damit die Schein-QR-Codes bei jedem Build gleich
// aussehen.
export const zufallAus = (start: number) => {
  let seed = start;
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
};

// Größerer Schein-QR-Code (21 × 21 mit Positionsmarken) für das Hero-Panel.
export const qrN = 21;
export const qrFinder = [
  [0, 0],
  [qrN - 7, 0],
  [0, qrN - 7],
];
export const qrMuster = (zufall: () => number) => {
  const imFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > qrN - 9 && y < 8) || (x < 8 && y > qrN - 9);
  return Array.from({ length: qrN * qrN }, (_, k) => [
    k % qrN,
    Math.floor(k / qrN),
  ]).filter(([x, y]) => !imFinder(x, y) && zufall() < 0.46);
};

// Kleiner Schein-QR-Code (7 × 7) für Schilder in der Explosionszeichnung.
export const qrKlein = (
  zufall: () => number,
  x0: number,
  y0: number,
  modul: number,
) =>
  Array.from({ length: 49 }, (_, k) => [k % 7, Math.floor(k / 7)])
    .filter(([x, y]) => (x < 2 && y < 2) || (x > 4 && y > 4) || zufall() < 0.5)
    .map(([x, y]) => ({ x: x0 + x * modul, y: y0 + y * modul }));

// Hero-Szene: Sucher-Rahmen um das markierte Bauteil und Lichtstrahl zum
// Detail-Panel rechts.
export type Rahmen = { x: number; y: number; b: number; h: number };
export const szenePanel: Rahmen = { x: 246, y: 6, b: 150, h: 120 };

export const sucherPfad = (s: Rahmen, ecke = 6) =>
  [
    `M${s.x} ${s.y + ecke}v${-ecke}h${ecke}`,
    `M${s.x + s.b - ecke} ${s.y}h${ecke}v${ecke}`,
    `M${s.x + s.b} ${s.y + s.h - ecke}v${ecke}h${-ecke}`,
    `M${s.x + ecke} ${s.y + s.h}h${-ecke}v${-ecke}`,
  ].join("");

export const strahlPunkte = (s: Rahmen, panel: Rahmen = szenePanel) =>
  [
    [s.x + s.b, s.y],
    [panel.x, panel.y + 4],
    [panel.x, panel.y + panel.h - 4],
    [s.x + s.b, s.y + s.h],
  ]
    .map((q) => q.map((n) => n.toFixed(1)).join(","))
    .join(" ");
