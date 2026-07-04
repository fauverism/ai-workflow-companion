# AI Workflow Companion

**Daily reps for agentic engineering.** A habit-formation companion for engineers adopting
Claude Code workflows — part of the [Spec Before You Ship](https://specbeforeyouship.com)
practice series.

The lessons teach the workflow. This app makes it stick:

- **Today** — three small "reps" dealt daily from your current maturity phase, a day streak,
  and a contribution-style practice heatmap. New reps at midnight.
- **Ladder** — Crawl / Walk / Run milestones, each saved with the date you hit it.
- **Toolkit** — searchable, copy-ready slash commands, agents, skills, and hooks to check
  into your repo.
- **Prompt Lab** — fill-in-the-blank generators for the core prompts (delegation briefs,
  correction→rule, adversarial design review, fan-out analysis, teaching loops).
- **Share & certify** — a canvas-rendered streak card (1200×630, social-ready) plus four
  earnable certifications tied to the ladder: **Practitioner** (Crawl), **Operator** (Walk),
  **Fleet Commander** (Run), and the capstone **Graduate** (all three, rendered with a
  tri-color gradient border/seal instead of one accent). Certificates carry the earner's
  name, completion date, and "self-attested practice record" small print. Every share card
  embeds a `#day-N` / `#cert-{phaseId}` link back into the app itself — visiting it shows a
  referral banner ("A friend is on day N of their streak...") on the landing page. Actions:
  download PNG, copy image, native share sheet, copy a ready-to-paste post, or one-click
  share intents to X and Bluesky. All rendered locally — nothing is uploaded.

All progress lives in `localStorage` — no accounts, no backend. Export/import from the footer.

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build   # tsc + vite → dist/
```

Static output in `dist/` — deploy anywhere (Vercel: zero config, framework preset "Vite").

## Stack

Vite · React 19 · TypeScript · hand-rolled CSS design system (no UI framework).
`workflow-companion.jsx` in the root is the original single-file artifact this app was
converted from, kept for reference.
