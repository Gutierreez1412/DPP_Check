# AGENTS.md — Golden Rules

Für das inhaltliche Briefing siehe [PROJEKT.md](./PROJEKT.md) (Leitprinzipien, Abschnitt 2).
Diese Datei ergänzt es um Regeln für die tägliche Arbeit am Code.

1. **Vor jedem Commit:** `pnpm run verify` muss grün sein (Typecheck, Format-Check, Build).
2. **Keine Secrets committen.** `.env*`-Dateien bleiben lokal, CI scannt zusätzlich mit
   Gitleaks (`.github/workflows/ci.yml`).
3. **Branches:** `feature/`, `fix/`, `chore/` — siehe
   [docs/setup-branch-protection.md](./docs/setup-branch-protection.md).
4. **Inhalt bleibt in `inhalte/`**, nicht im Code (siehe PROJEKT.md, Leitprinzip 1).
5. **Quellenpflicht** für alle inhaltlichen Aussagen (siehe PROJEKT.md, Leitprinzip 5) —
   nichts erfinden, Unklares als `"status": "unklar"` markieren.
6. **Kleine, aussagekräftige Commits** auf Deutsch, Inhalt und Code getrennt committen.
7. **Hosting:** Die Seite läuft passwortgeschützt auf Cloudflare Pages (Projekt `dpp-check`,
   https://dpp-check.pages.dev). Kein Auto-Deploy, hochgeladen wird per `wrangler` nur
   nach Rückfrage beim Nutzer. Details und Befehle: [README.md](./README.md), Abschnitt
   „Hosting“. `functions/_middleware.js` (Passwortschutz) nicht entfernen; das Passwort
   nie ins Repo schreiben.
