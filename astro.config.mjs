// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Deutsch ist die Standardsprache: "/" leitet auf die Landingpage "/de/" weiter.
  // Die Seite gibt es nur auf Deutsch, der Filter liegt unter "/de/filter/".
  redirects: {
    "/": "/de/",
  },
});
