// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Deutsch ist die Standardsprache: "/" leitet auf "/de/" weiter.
  redirects: {
    "/": "/de/",
  },
});
