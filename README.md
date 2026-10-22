# DPP-Betroffenheitscheck

Siehe [PROJEKT.md](./PROJEKT.md) für das vollständige Briefing (Ziel, Leitprinzipien,
Seitenstruktur, Datenformate, Arbeitsweise).

Diese Website ist mit **Astro** gebaut: ein Werkzeug für statische Websites ohne Server
("kein Backend"), das Seiten aus einfachen Dateien erzeugt. Das passt gut zu den Vorgaben
in PROJEKT.md (statisch, später leicht umziehbar, z. B. auf Netlify oder Vercel).

## Seite lokal starten

Einmalig (nur beim ersten Mal nötig, oder wenn sich `package.json` geändert hat):

```sh
pnpm install
```

Danach, um die Seite lokal anzusehen:

```sh
pnpm dev
```

Die Seite ist dann unter `http://localhost:4321/` erreichbar (leitet automatisch auf die
deutsche Startseite `http://localhost:4321/de/` weiter, das ist die Landingpage; der Filter liegt unter `/de/filter/`). Der Server läuft, bis man im
Terminal `Strg+C` drückt. Änderungen an Dateien werden sofort im Browser sichtbar.

## Seite bauen (für den späteren Umzug/Hosting)

```sh
pnpm build
```

Erzeugt die fertige Website im Ordner `dist/`. Mit `pnpm preview` kann man dieses
Build-Ergebnis lokal testen, so wie es später online aussehen würde.

## Vor jedem Commit

```sh
pnpm verify
```

Prüft Typen (`astro check`), Formatierung (`prettier --check`) und Build in einem Schritt.
Die gleiche Prüfung läuft auch automatisch in der CI (`.github/workflows/ci.yml`) auf jeden
Push und jede Pull Request gegen `main`.

## Branches & Commits

- `feature/...`, `fix/...`, `chore/...` für Änderungen über einen Branch + Pull Request.
- Kleine Änderungen können direkt auf `main` committet werden (Solo-Projekt).
- Details zur Branch-Protection: [docs/setup-branch-protection.md](./docs/setup-branch-protection.md).
- Golden Rules für die Arbeit mit Claude Code: [AGENTS.md](./AGENTS.md).

## Wo man was ändert

- **Texte und Inhalte** (Navigation, Disclaimer, später: Fragen, Zeitstrahl, FAQ, Scores):
  liegen als JSON-Dateien im Ordner `inhalte/`. Für diese Änderungen muss man keinen Code
  verstehen – einfach die Texte bei `"de"` und `"en"` anpassen.
- **Aussehen/Design**: zentrale Farben und Abstände stehen als Variablen ganz oben in
  `src/styles/global.css` (z. B. `--farbe-primaer`). Das aktuelle Design ist bewusst ein
  neutraler Platzhalter und wird später ausgetauscht.
- **Aufbau der Seiten** (HTML-Struktur, Sprachumschalter, Logik): liegt im Ordner `src/`.
  Hier ist beim Ändern Vorsicht geboten – im Zweifel vorher fragen.

## Projektordner: was ist was?

Im Hauptordner liegen viele Dateien, die meisten davon sind **technische Konfiguration für
die Werkzeuge** (Astro, pnpm, Prettier, Git) – die darfst du ignorieren, die bearbeite ich.
Wichtig für dich sind nur wenige Ordner:

```text
/
├── inhalte/                 ← Hier änderst DU Texte und Inhalte (JSON, kein Code)
│   ├── seite.json           Navigation, Disclaimer, Button-Texte (de + en)
│   ├── filter.json           Fragen & Texte der Rollen-Ermittlung (Ebene 1)
│   ├── grundlagen.json        zentrale ESPR/DPP-Erklärungen
│   └── gruppen/<id>/gruppe.json   Definition, Zeitstrahl, FAQ je Produktgruppe
├── src/                      Code/Aufbau der Seiten – Vorsicht beim Ändern, im Zweifel fragen
├── public/                   Favicon & Bilder, werden unverändert mit ausgeliefert
├── docs/                     Technische Anleitungen (z. B. Branch-Schutz einrichten)
├── PROJEKT.md                Das Briefing: Ziel, Leitprinzipien, Seitenaufbau
├── README.md                 diese Datei
└── AGENTS.md                 Regeln für die Arbeit mit Claude Code
```

Alles andere im Hauptordner (`package.json`, `pnpm-lock.yaml`, `tsconfig.json`,
`astro.config.mjs`, `.gitignore`, `.prettier*`, `.vscode/`, `.github/`, sowie die Ordner
`node_modules/`, `dist/`, `.astro/`) ist Werkzeug-Konfiguration bzw. wird automatisch
erzeugt. `node_modules/`, `dist/` und `.astro/` sind im Editor ausgeblendet
(`.vscode/settings.json`), damit sie nicht zwischen deinen Dateien auftauchen.
