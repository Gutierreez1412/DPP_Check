// Schalter für die Anzeige von Quellen- und Verweis-Links auf der Seite.
// In der finalen Version aus (false). Die Quellen bleiben in `inhalte/` erhalten
// (Quellenpflicht) und werden zum Wiedereinblenden einfach auf true gesetzt.
export const QUELLEN_ANZEIGEN = false;

// Schalter für Paragraphen- und Artikelverweise im Fließtext (z. B. "Art. 34 ESPR",
// "Abs. 2", "Anhang IV"). Aus (false): die Seite zeigt die Texte ohne Verweise, damit
// sie einfach und einladend bleiben. Die Inhalte in `inhalte/` bleiben unverändert;
// gefiltert wird nur beim Bauen (`src/lib/rechtsverweise.mjs`, `astro.config.mjs`).
// Nach Änderung den Dev-Server neu starten bzw. neu bauen.
export const RECHTSVERWEISE_ANZEIGEN = false;
