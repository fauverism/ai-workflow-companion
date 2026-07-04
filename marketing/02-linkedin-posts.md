# LinkedIn Post Drafts

Five drafts, each built around one concrete detail. Voice: direct, no hype, first-person practitioner. Post as-is or trim — each works standalone.

---

## Post 1 — The correction→rule loop

Every time I correct Claude Code, I lose that correction the moment the session ends. Unless I write it down.

So the habit is: correction → rule. The moment I catch myself saying "no, use design tokens, not inline styles," that sentence goes into CLAUDE.md. Claude reads it at the start of every future session. One correction, permanent.

It sounds trivial. It's the single highest-leverage habit I've built this year — my CLAUDE.md is now a running record of every mistake I never have to make twice.

The hard part isn't understanding the loop. It's remembering to run it. That's why I built it into Workflow Companion as a fill-in-the-blank generator and a tracked milestone: "used the correction→rule phrase at least 5 times." You either did or you didn't.

[link]

---

## Post 2 — The maturity ladder

"Is your team using AI tools?" is the wrong question. Everyone says yes.

Better questions, from the Crawl phase of a maturity ladder I built:

- Do you have a project-level CLAUDE.md?
- Do you start sessions with goal, constraints, and acceptance criteria — or just vibes?
- Have you ever run verification before calling something done?

Walk phase: 3+ slash commands checked into git. A PostToolUse formatting hook. 15+ rules in CLAUDE.md from real corrections.

Run phase: 3–5 parallel worktree sessions. Fan-out workflows for migrations. Your team using *your* shared commands.

Notice what these have in common: every one is observable. No self-assessment, no "I feel more productive." You either have the file in git or you don't.

I turned this into a tracker (Crawl/Walk/Run, each milestone dated when you hit it) because industry surveys keep finding the same thing: most engineers plateau at individual, habitual tool use. The ladder makes the plateau visible — and shows the next rung.

[link]

---

## Post 3 — /techdebt and the end-of-session sweep

A slash command I run at the end of most Claude Code sessions: /techdebt.

It sweeps the session's changes for shortcuts I let through while moving fast — TODOs, skipped tests, copy-paste that should be a function — and files them before I forget they exist.

It's one file: .claude/commands/techdebt.md. Checked into the repo, so everyone on the team gets it for free.

That's the pattern I care about more than any individual command: workflow-as-files. Slash commands, agents, hooks — all plain text, all in version control, all shared by default. Your team's working practices, code-reviewed like everything else.

I collected the ones I actually use (/go, /brief, /evidence, a verify-resolve agent, an auto-format hook) into a copy-paste toolkit inside Workflow Companion. Every file inspectable before you commit it.

[link]

---

## Post 4 — Reps, not reading (habit mechanics)

I've read a lot of "how to use Claude Code well" posts. You probably have too. A 2026 survey of 1,300 engineers found most still plateau at individual, ad-hoc tool use — the reading isn't translating into practice.

That's not a knowledge gap. Nobody learns an instrument by reading about scales.

So I built the thing I've watched work over 25 years of design systems: make the practice small, daily, and visible. Workflow Companion deals three reps a day from your current phase — things like "start one session with explicit acceptance criteria" — with a streak and a contribution-style heatmap. New reps at midnight.

Engineers already trust this exact mechanic. It's the GitHub contribution graph, pointed at how you work instead of how much.

Is a streak gimmicky? A little. But the milestones underneath it aren't — each one is an observable behavior with a date attached. The streak just gets you to show up long enough for the behavior to stick.

[link]

---

## Post 5 — Design systems → AI workflow (the personal one)

I've spent 25 years in UI/UX, most of it on design systems. The job, reduced to one sentence: find what individuals do ad-hoc, name it, document it, make it reusable.

That's exactly what's missing in how teams adopt agentic coding right now. The reference practice is public — Claude Code's creator publishes his workflow in detail. But it lives in blog posts, and blog posts don't transfer practice. Systems do.

So I applied the design-system playbook to it: named patterns (correction→rule, delegation brief, verify→simplify→ship), documented artifacts (slash commands and agents as files in git), and a staged adoption path (Crawl/Walk/Run) instead of an all-at-once manifesto.

The result is Workflow Companion — a small app I built and use daily. It's also, honestly, me doing the thing I'm telling you to do: deepening an AI practice one documented rep at a time.

[link]

---

*Suggested order: 5 → 2 → 1 → 3 → 4. Lead with the personal one to establish the frame; details carry the rest.*
