# Branch-Protection Setup

Schützt den `main`-Branch: Änderungen müssen über eine Pull Request laufen und die CI
(`.github/workflows/ci.yml`) muss grün sein, bevor gemerged werden kann.

## Einmalig einrichten

Voraussetzung: [GitHub CLI](https://cli.github.com/) installiert und eingeloggt
(`gh auth login`).

```sh
gh api repos/Gutierreez1412/DPP_Check/rulesets \
  --method POST \
  -f name="main-protection" \
  -f target="branch" \
  -f enforcement="active" \
  -f 'conditions[ref_name][include][]=refs/heads/main' \
  -F 'rules[]={"type":"pull_request","parameters":{"required_approving_review_count":0}}' \
  -F 'rules[]={"type":"required_status_checks","parameters":{"required_status_checks":[{"context":"Verify (typecheck, format, build)"}],"strict_required_status_checks_policy":true}}'
```

- `required_approving_review_count: 0`, da Solo-Projekt (siehe Projekt-Setup-Guide, Phase 5,
  Note). Sobald weitere Mitwirkende dazukommen, Wert erhöhen.
- Der Status-Check-Kontext muss exakt dem Job-Namen aus `ci.yml` entsprechen
  (`Verify (typecheck, format, build)`). Der Check muss mindestens einmal gelaufen sein,
  bevor GitHub ihn in der Liste zur Auswahl anbietet (UI-Variante).

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
