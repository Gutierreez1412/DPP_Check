# AGENTS.md — Golden Rules

Für das inhaltliche Briefing siehe [PROJEKT.md](./PROJEKT.md) (Leitprinzipien, Abschnitt 2).
Diese Datei ergänzt es um Regeln für die tägliche Arbeit am Code.

1. **Vor jedem Commit:** `pnpm run verify` muss grün sein (Format-Check, Build).
   `pnpm run check` (Typecheck) separat laufen lassen und bei Gelegenheit die bestehenden
   Typfehler in `src/components/RollenHinweis.astro` und `src/pages/*/gruppe/[id].astro`
   beheben, dann `check` in `verify` mit aufnehmen (siehe `package.json`).
2. **Keine Secrets committen.** `.env*`-Dateien bleiben lokal, CI scannt zusätzlich mit
   Gitleaks (`.github/workflows/ci.yml`).
3. **Branches:** `feature/`, `fix/`, `chore/` — siehe
   [docs/setup-branch-protection.md](./docs/setup-branch-protection.md).
4. **Inhalt bleibt in `inhalte/`**, nicht im Code (siehe PROJEKT.md, Leitprinzip 1).
5. **Quellenpflicht** für alle inhaltlichen Aussagen (siehe PROJEKT.md, Leitprinzip 5) —
   nichts erfinden, Unklares als `"status": "unklar"` markieren.
6. **Kleine, aussagekräftige Commits** auf Deutsch, Inhalt und Code getrennt committen.
