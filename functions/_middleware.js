/*
  Passwortschutz für das Hosting auf Cloudflare Pages (HTTP Basic Auth).
  Läuft vor jeder Anfrage. Das Passwort steht nicht im Code, sondern als
  Secret SEITEN_PASSWORT im Cloudflare-Projekt (siehe README, Abschnitt Hosting).
  Der Benutzername ist beliebig, geprüft wird nur das Passwort.
*/

const encoder = new TextEncoder();

async function gleich(a, b) {
  // Vergleich über Hashes mit konstanter Laufzeit, damit sich das Passwort
  // nicht über Antwortzeiten erraten lässt.
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function anmeldungNoetig() {
  return new Response("Anmeldung erforderlich.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="DPP-Check", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequest({ request, env, next }) {
  const passwort = env.SEITEN_PASSWORT;
  if (!passwort) {
    return new Response("Passwortschutz ist nicht eingerichtet.", {
      status: 503,
    });
  }

  const [typ, wert] = (request.headers.get("Authorization") || "").split(" ");
  if (typ !== "Basic" || !wert) return anmeldungNoetig();

  let eingabe;
  try {
    const bytes = Uint8Array.from(atob(wert), (z) => z.charCodeAt(0));
    const dekodiert = new TextDecoder().decode(bytes);
    eingabe = dekodiert.slice(dekodiert.indexOf(":") + 1);
  } catch {
    return anmeldungNoetig();
  }
  if (!(await gleich(eingabe, passwort))) return anmeldungNoetig();

  const antwort = await next();
  const geschuetzt = new Response(antwort.body, antwort);
  geschuetzt.headers.set("X-Robots-Tag", "noindex, nofollow");
  geschuetzt.headers.set("Cache-Control", "private, no-store");
  return geschuetzt;
}
