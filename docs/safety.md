# Safety Policy — Momen Tasks Loop

## Denylist (never edit)

- `.env`, `.env.*`, `auth/`, `payments/`, `secrets/`, `credentials/`
- Infrastructure configs (`vercel.json`, `nest-cli.json`) without human approval
- Lockfiles (`package-lock.json`, `yarn.lock`) unless explicitly part of a dep update task

## Auto-merge Policy

- Never auto-merge to main without human approval
- Always create draft PR first; let human review before marking ready
- PRs from loop must include: change summary, risk level, verifier output

## Tool/MCP Scope (least privilege)

| Role | Allowed Tools | Denied |
|------|---------------|--------|
| loop-triage | read-only: grep, glob, read, git log/status | write, edit, deploy, env mutation |
| minimal-fix | edit, write, bash (build/test only) | deploy, env, secrets, auth configs |
| loop-verifier | read, bash (test/lint only) | edit, write, deploy, env |

## Budget Guard

- Daily cap: 100k tokens (see `loop-budget.md`)
- At 80% spend → switch to report-only for rest of day
- At 100% or `loop-pause-all` → exit immediately

## Failure Recovery

- If a sub-agent fails 3 times on the same item → escalate to human
- If tests are flaky → note in STATE.md, do not disable
- If deploy fails → report in triage, do not retry without human ok