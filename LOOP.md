# Loop Configuration — Minimal Triage

## Active Loops

| Pattern | Cadence | Status | Command |
|---------|---------|--------|---------|
| Daily Triage | 1d | L1 report-only | See README |

## Human Gates

- No auto-fix until L2 checklist complete
- All high-risk paths: human review required

## Budget

- Max sub-agent spawns per run: 0 (L1) / 2 (L2)
- Max tokens/day: 100k (see `loop-budget.md`)
- Append each run to `loop-run-log.md`; use `loop-budget` skill at start/end
- Kill switch: `loop-pause-all` — pause schedulers and notify human
- Estimate: `npx @cobusgreyling/loop-cost --pattern daily-triage`

## Worktree Isolation

- All fix attempts MUST use a separate worktree (`git worktree add`) or a fresh branch — never modify main branch files directly.
- After verifier approves, merge via PR (draft → human review → ready).
- Reference: `using-git-worktrees` skill.

## Skills

| Skill | Location | Purpose |
|-------|----------|---------|
| loop-triage | `.grok/skills/loop-triage/` | Triage changes, issues, CI |
| loop-verifier | `.grok/skills/loop-verifier/` | Maker/checker verification |
| minimal-fix | `.grok/skills/minimal-fix/` | Surgical one-issue fixes |
| loop-budget | `.grok/skills/loop-budget/` | Token budget enforcement |
| loop-constraints | `.grok/skills/loop-constraints/` | Binding rules enforcement |

## Links

- Pattern: `patterns/registry.yaml`
- Safety: `docs/safety.md`
- Harness: `.foundry/stack.yaml`
- Checklist: [loop-design-checklist](../../docs/loop-design-checklist.md)