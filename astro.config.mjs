// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Deutsch ist die Standardsprache: "/" leitet auf die Landingpage "/de/" weiter.
  // Der Filter liegt unter "/de/filter/" bzw. "/en/filter/".
  redirects: {
    "/": "/de/",
  },
});
