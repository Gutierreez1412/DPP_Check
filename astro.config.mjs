// @ts-check
import { defineConfig } from "astro/config";
import { RECHTSVERWEISE_ANZEIGEN } from "./src/config.ts";
import { ohneRechtsverweiseTief } from "./src/lib/rechtsverweise.mjs";

// Blendet Paragraphen-/Artikelverweise in allen Texten aus `inhalte/*.json` aus,
// solange RECHTSVERWEISE_ANZEIGEN (src/config.ts) auf false steht.
const ohneRechtsverweise = {
  name: "ohne-rechtsverweise",
  enforce: /** @type {const} */ ("pre"),
  /**
   * @param {string} code
   * @param {string} id
   */
  transform(code, id) {
    if (RECHTSVERWEISE_ANZEIGEN) return null;
    if (!/[\/]inhalte[\/].*\.json$/.test(id.split("?")[0])) return null;
    return {
      code: JSON.stringify(ohneRechtsverweiseTief(JSON.parse(code))),
      map: null,
    };
  },
};

// https://astro.build/config
export default defineConfig({
  // Deutsch ist die Standardsprache: "/" leitet auf die Landingpage "/de/" weiter.
  // Die Seite gibt es nur auf Deutsch, der Filter liegt unter "/de/filter/".
  redirects: {
    "/": "/de/",
  },
  vite: {
    plugins: [ohneRechtsverweise],
  },
});
