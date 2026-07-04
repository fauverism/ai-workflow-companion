# Workflow Companion — One-Page Overview

*Daily reps for agentic engineering.*

## The problem

Most engineering teams now have access to agentic coding tools. Far fewer have engineers who work differently because of them. Surveys of engineering orgs find the same stall point: individual, habitual tool use that never becomes team-level practice (Boye & Co's 2026 survey of 1,300 engineers; CMU SEI's AI Adoption Maturity Model describes the same plateau).

The workflow itself is already documented — Boris Cherny, who created Claude Code, has published his in detail. But reading a workflow doesn't install it. The gap isn't information. It's repetition.

## What it does

Workflow Companion is a small web app that turns the documented workflow into daily practice. Four parts:

- **Today** — three small reps dealt each day from your current phase, with a day streak and a contribution-style heatmap. New reps at midnight.
- **Ladder** — Crawl / Walk / Run milestones, each a concrete, observable behavior ("CLAUDE.md has 15+ rules from real corrections," "ran 2+ parallel sessions on separate tasks"), saved with the date you hit it.
- **Toolkit** — copy-ready slash commands, agents, skills, and hooks (`/go`, `/techdebt`, `/brief`, `verify-resolve`, PostToolUse auto-format) with the exact file paths to check into your repo.
- **Prompt Lab** — fill-in-the-blank generators for the core prompts: delegation briefs, correction→rule, adversarial design review, fan-out analysis, teaching loops.

No accounts, no backend. Progress lives in localStorage; export/import from the footer. Nothing to procure, nothing to approve.

## How it's different

Vendor tooling competes on capability — what the AI can do. Workflow Companion sits on the other side of the gap: whether the engineer's behavior actually changes. It doesn't replace Claude Code or Cursor; it's the practice layer for them.

The design borrows from two disciplines. From habit formation: small daily actions, visible streaks, staged progression — mechanics engineers already trust from their own contribution graphs. From design systems: taking ad-hoc individual practice and turning it into named, documented, reusable patterns a whole team can adopt. That second part is the builder's home turf — 25 years in UI/UX and design systems.

## Proof it works

Honest version: the tool is new, so there's no longitudinal adoption data yet. What can be verified today:

- Every milestone is an observable behavior, not a self-assessment — you either have three slash commands in git or you don't.
- Every toolkit item is inspectable source: the actual `.claude/` files, not descriptions of them.
- The underlying workflow isn't ours to prove — it's the published practice of Claude Code's creator, cited throughout.
- The stall point it targets is documented across independent industry research, not asserted.

If you adopt it, the Ladder itself becomes your evidence: dated milestones showing exactly when practice changed.

## Try it

Runs as a static site — open it, pick your phase, do today's three reps.
