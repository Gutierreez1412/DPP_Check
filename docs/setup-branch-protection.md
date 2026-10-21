# Branch-Protection Setup

Schützt den `main`-Branch: Änderungen müssen über eine Pull Request laufen und die CI
(`.github/workflows/ci.yml`) muss grün sein, bevor gemerged werden kann.

## Einmalig einrichten

Voraussetzung: [GitHub CLI](https://cli.github.com/) installiert und eingeloggt
(`gh auth login`). Repository-Rulesets für `main` erfordern einen öffentlichen Repo
(GitHub Free erlaubt sie bei privaten Repos nur mit Pro/Team-Plan) — DPP_Check ist daher
`public`.

Payload (`ruleset.json`):

```json
{
  "name": "main-protection",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    { "actor_type": "RepositoryRole", "actor_id": 5, "bypass_mode": "always" }
  ],
  "conditions": {
    "ref_name": { "include": ["refs/heads/main"], "exclude": [] }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_approving_review_count": 0,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          { "context": "Verify (typecheck, format, build)" },
          { "context": "Secrets scan" }
        ],
        "strict_required_status_checks_policy": true
      }
    }
  ]
}
```

```sh
gh api repos/Gutierreez1412/DPP_Check/rulesets --method POST --input ruleset.json
```

- `required_approving_review_count: 0`, da Solo-Projekt (siehe Projekt-Setup-Guide, Phase 5,
  Note). Sobald weitere Mitwirkende dazukommen, Wert erhöhen.
- `bypass_actors` mit `actor_id: 5` (Repository-Rolle "Admin") erlaubt dem Owner weiterhin
  direkte Pushes auf `main`, ohne dass dafür eine PR nötig ist — ohne diesen Eintrag würde
  die Regel auch den Repo-Owner blockieren.
- Die Status-Check-Kontexte müssen exakt den Job-Namen aus `ci.yml` entsprechen
  (`Verify (typecheck, format, build)`, `Secrets scan`). Sie müssen mindestens einmal
  gelaufen sein, bevor GitHub sie zur Auswahl anbietet (UI-Variante).

## Prüfen

```sh
gh api repos/Gutierreez1412/DPP_Check/rulesets
```

## Branch-Namenskonvention

- `feature/...` — neue Funktionalität
- `fix/...` — Bugfix
- `chore/...` — Wartung, Doku, Tooling

Direkte Commits auf `main` sind als Solo-Entwickler ok für kleine Änderungen; größere
Änderungen über einen Branch + Pull Request.
