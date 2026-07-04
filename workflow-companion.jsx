import { useState, useEffect, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const MATURITY = [
  {
    id: "crawl",
    label: "Crawl",
    desc: "Build the foundation habits before anything else.",
    color: "#5b8aff",
    milestones: [
      { id: "c1", text: "Created a project-level CLAUDE.md", habit: "Write it down" },
      { id: "c2", text: "Used the correction→rule phrase at least 5 times", habit: "Memory loop" },
      { id: "c3", text: "Started every session with Goal / Constraints / Acceptance Criteria", habit: "Delegation" },
      { id: "c4", text: "Used /rewind instead of correcting in chat at least once", habit: "Context hygiene" },
      { id: "c5", text: "Ran verification (Chrome ext or test suite) before calling something done", habit: "Verification" },
      { id: "c6", text: "Completed one full session using auto mode without babysitting", habit: "Fleet mindset" },
    ],
  },
  {
    id: "walk",
    label: "Walk",
    desc: "Scale the habits into repeatable infrastructure.",
    color: "#a78bfa",
    milestones: [
      { id: "w1", text: "Created 3+ slash commands checked into git", habit: "Slash commands" },
      { id: "w2", text: "Set up at least 1 custom agent (.claude/agents/)", habit: "Agents" },
      { id: "w3", text: "Ran 2+ parallel sessions on separate tasks simultaneously", habit: "Parallel work" },
      { id: "w4", text: "Built a /go-style verify→simplify→ship workflow", habit: "Verification" },
      { id: "w5", text: "Set up a PostToolUse formatting hook", habit: "Hooks" },
      { id: "w6", text: "CLAUDE.md has 15+ rules from real corrections", habit: "Memory loop" },
      { id: "w7", text: "Created a reusable skill for a common Compass task", habit: "Skills" },
    ],
  },
  {
    id: "run",
    label: "Run",
    desc: "Operate as a fleet commander. This is Boris-level.",
    color: "#34d399",
    milestones: [
      { id: "r1", text: "Running 3-5 worktree sessions in parallel regularly", habit: "Parallel work" },
      { id: "r2", text: "Set up /loop or /schedule for at least one recurring task", habit: "Automation" },
      { id: "r3", text: "Used a dynamic workflow (\"use a workflow\") for a big migration or audit", habit: "Workflows" },
      { id: "r4", text: "Auto mode is your default — you rarely see permission prompts", habit: "Auto mode" },
      { id: "r5", text: "Using /evidence after every milestone for promotion narrative", habit: "Career" },
      { id: "r6", text: "Team uses your shared CLAUDE.md and slash commands", habit: "Org influence" },
      { id: "r7", text: "Run agent view (claude agents) to manage your fleet", habit: "Fleet command" },
    ],
  },
];

const TOOLKIT = [
  {
    category: "Slash Commands",
    icon: "⚡",
    desc: "Drop these in .claude/commands/ and check into git. The team gets them automatically.",
    items: [
      {
        id: "cmd-go",
        name: "/go",
        label: "Verify → Simplify → Ship",
        tags: ["verification", "every-pr"],
        filename: ".claude/commands/go.md",
        content: `# /go — Verify, Simplify, Ship

You just finished a task. Now close the loop:

## Step 1: Verify
- If this is frontend work: use the Claude in Chrome extension to open the running app
- Navigate to the changed UI and verify it renders correctly at mobile (375px), tablet (768px), and desktop (1280px)
- Check for visual regressions, broken layouts, missing states
- If this is backend work: run the test suite end to end
- If tests fail, fix them before proceeding

## Step 2: Simplify
- Review all changed files for:
  - Duplicated logic that could be extracted
  - Hardcoded values that should be design tokens or constants
  - Naming that doesn't match the project's conventions (check CLAUDE.md)
  - Code that could be simpler without losing clarity
- Apply improvements

## Step 3: Ship
- Run lint and typecheck
- Commit with a descriptive message
- Push and open a PR with:
  - Summary of what changed and why
  - How it was verified
  - Screenshots if UI changed`,
      },
      {
        id: "cmd-techdebt",
        name: "/techdebt",
        label: "End-of-session sweep",
        tags: ["quality", "end-of-day"],
        filename: ".claude/commands/techdebt.md",
        content: `# /techdebt — End-of-Session Sweep

Scan all files changed in this session for:

## Duplication
- Look for logic repeated across files that should be extracted into a shared utility or component
- Flag copy-pasted patterns that diverge slightly (a sign of drift)

## Pattern Drift
- Compare component naming against the conventions in CLAUDE.md
- Check for hardcoded hex values, spacing values, or breakpoints that should use design tokens
- Flag any \`!important\` overrides or inline styles

## Dead Code
- Identify unused imports, unreachable branches, commented-out blocks
- Flag but don't auto-delete — present the list for review

## Output
Present findings as a prioritized list:
1. **Fix now** — things that will cause problems if shipped
2. **Fix this session** — quick wins under 5 minutes
3. **Track** — legitimate debt to add to the backlog

If you find any patterns Claude keeps generating incorrectly, add a rule to CLAUDE.md.`,
      },
      {
        id: "cmd-evidence",
        name: "/evidence",
        label: "Promotion evidence capture",
        tags: ["career", "after-milestone"],
        filename: ".claude/commands/evidence.md",
        content: `# /evidence — Capture Promotion Evidence

\`\`\`bash
echo "Session: $(date '+%Y-%m-%d')"
echo "Branch: $(git branch --show-current)"
echo "Files changed: $(git diff --name-only HEAD~1 | wc -l)"
\`\`\`

Based on the work done in this session, write a promotion evidence entry.

## Format
Save to COMPASS_EVIDENCE.md in the project root (append, don't overwrite).

### Entry structure:
**Date:** [today]
**What:** [one-line summary of the deliverable]
**Problem before:** [what was broken, slow, missing, or inconsistent]
**What I did:** [your specific decisions, designs, and technical choices — first person]
**Scope signal:** [why this is principal-level — cross-team impact, architectural decision, org-wide pattern, etc.]
**Impact:** [measurable outcome or leading indicator — adoption, metric moved, teams unblocked]

## Rules
- Be factual. No fluff, no inflated language.
- Use "I" for decisions and leadership. Use "we" for team execution.
- If the impact isn't measurable yet, state the leading indicator you'll track.
- Never fabricate metrics.`,
      },
      {
        id: "cmd-brief",
        name: "/brief",
        label: "Morning situational awareness",
        tags: ["daily", "morning"],
        filename: ".claude/commands/brief.md",
        content: `# /brief — Morning Situational Awareness

\`\`\`bash
echo "=== $(date '+%A, %B %d %Y') ==="
echo ""
echo "--- Git Status ---"
git log --oneline --since="yesterday" --all | head -20
echo ""
echo "--- Open PRs ---"
gh pr list --state open --limit 10 2>/dev/null || echo "(gh CLI not configured)"
echo ""
echo "--- Failing CI ---"
gh pr checks --fail 2>/dev/null | head -10 || echo "(no failing checks)"
\`\`\`

Using the information above plus any available MCP integrations (Slack, Sentry, etc.), produce a morning brief:

## Sections
1. **Overnight changes** — what shipped, what broke, what's pending review
2. **Error budget** — any SLO violations or burn-rate alerts (check Sentry/monitoring if available)
3. **Repeat drivers** — top customer-impacting issues from the last 24h
4. **My queue** — PRs I need to review, threads I'm tagged in, blockers on my work
5. **One thing** — the single most important thing to address today

Keep it scannable. No more than 3 sentences per section.`,
      },
      {
        id: "cmd-compass-doc",
        name: "/compass-doc",
        label: "Pattern documentation stub",
        tags: ["compass", "documentation"],
        filename: ".claude/commands/compass-doc.md",
        content: `# /compass-doc — Generate Compass Pattern Documentation

Ask for the component or pattern name if not provided.

## Generate an MDX file with this structure:

\`\`\`mdx
---
title: [Component Name]
description: [One-line description]
status: draft
frameworks: [react, angular, servicenow]
---

# [Component Name]

## When to use
[Specific use cases — be prescriptive, not generic]

## When NOT to use
[Anti-patterns and common misuses]

## Anatomy
[ASCII diagram of the component's parts]

## Variants
[Table of variants with visual examples]

## Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| [token-name] | [value] | [where it's used] |

## Accessibility
- Keyboard navigation: [specifics]
- Screen reader: [aria labels, roles]
- WCAG: [specific criteria met]

## Framework Examples
### React
[Sandpack live example]

### Angular
[Code example with notes on differences]

### ServiceNow
[Code example with UI Builder context]
\`\`\`

After generating, update CLAUDE.md if any naming decisions were made.`,
      },
    ],
  },
  {
    category: "Agents",
    icon: "🤖",
    desc: "Drop these in .claude/agents/. Each runs with its own context, model, and tool permissions.",
    items: [
      {
        id: "agent-verify",
        name: "verify-resolve",
        label: "Adversarial resolution verifier",
        tags: ["reliability", "uc-2"],
        filename: ".claude/agents/verify-resolve.md",
        content: `---
name: verify-resolve
description: Adversarially verify that an issue is actually resolved, not just acknowledged
color: red
model: opus
---

You are a skeptical verification agent. Your job is to confirm that a reported fix actually resolved the underlying issue — not just that someone said it did.

## Your process:
1. Read the fix description and the original issue
2. Identify what observable signal would confirm the fix works
3. Check for that signal (logs, metrics, test output, telemetry)
4. If you cannot independently verify the fix, say so clearly
5. If the fix addresses a symptom but not the root cause, flag it

## Rules:
- Never trust "it looks good now" without evidence
- Always check: did the metric/signal that triggered the issue return to healthy?
- If the fix was a restart or cache clear, flag it as a temporary mitigation, not a resolution
- Report your confidence level: VERIFIED / LIKELY FIXED / UNVERIFIED / STILL BROKEN`,
      },
      {
        id: "agent-simplifier",
        name: "code-simplifier",
        label: "Post-PR code cleanup",
        tags: ["quality", "every-pr"],
        filename: ".claude/agents/code-simplifier.md",
        content: `---
name: code-simplifier
description: Simplify and clean up code after the main work is done
color: blue
model: sonnet
---

You are a code simplifier. After the main agent finishes a task, you review the changed files and make them cleaner without changing behavior.

## What you look for:
- Unnecessary abstractions (wrappers that add no value)
- Overly clever code that could be straightforward
- Duplicated logic across changed files
- Variables or functions that could have clearer names
- Imports that aren't used
- Comments that just restate the code
- Magic numbers or strings that should be constants or tokens

## Rules:
- Don't change behavior. Every simplification must be behavior-preserving.
- Don't introduce new patterns the codebase doesn't already use.
- Prefer removing code over adding code.
- If a simplification is debatable, skip it.
- Run the existing test suite after every change to confirm nothing broke.`,
      },
      {
        id: "agent-repeat-detective",
        name: "repeat-detective",
        label: "Repeat-driver investigator",
        tags: ["reliability", "uc-1"],
        filename: ".claude/agents/repeat-detective.md",
        content: `---
name: repeat-detective
description: Classify and cluster repeat-driver tickets by root cause
color: orange
model: opus
isolation: worktree
---

You are a repeat-driver investigator. You analyze batches of customer tickets that resulted in repeat contacts and classify them by root cause.

## Your process:
1. Read each ticket in your assigned batch
2. For each ticket, determine:
   - **Surface symptom**: what the customer reported
   - **Root cause category**: the underlying system issue (e.g., stale cache, missing error handling, unclear UI, config drift, telemetry gap)
   - **Preventability**: could this have been caught proactively? How?
3. Output structured JSON for each ticket:
   \`\`\`json
   { "ticket_id": "", "symptom": "", "root_cause": "", "category": "", "preventable": true/false, "prevention_method": "" }
   \`\`\`

## Rules:
- Be specific about root causes. "Server error" is not a root cause. "Timeout in payment service due to missing circuit breaker" is.
- If two tickets share a root cause, use the exact same category string so they cluster correctly.
- If you're unsure about a classification, mark confidence: LOW and explain why.`,
      },
      {
        id: "agent-a11y",
        name: "a11y-auditor",
        label: "Accessibility auditor",
        tags: ["compass", "uc-3"],
        filename: ".claude/agents/a11y-auditor.md",
        content: `---
name: a11y-auditor
description: WCAG 2.1 AA audit using Chrome extension for visual verification
color: green
tools: Read, Bash, Browser
---

You are an accessibility auditor. You review UI components and pages against WCAG 2.1 AA criteria.

## Audit checklist:
1. **Color contrast** — text meets 4.5:1 (normal) or 3:1 (large) against its background
2. **Keyboard navigation** — every interactive element is reachable via Tab, activated via Enter/Space
3. **Focus indicators** — visible focus ring on every focusable element
4. **Screen reader** — all images have alt text, form inputs have labels, ARIA roles are correct
5. **Touch targets** — minimum 44x44px on mobile
6. **Motion** — respects prefers-reduced-motion
7. **Error states** — errors are announced, associated with their field, and explain how to fix

## Process:
1. Open the component/page using the Chrome extension
2. Walk through each checklist item visually
3. Test keyboard navigation by tabbing through
4. Report findings as: PASS / FAIL / WARN with specific remediation steps

## Rules:
- Always test at 3 viewport widths: 375px, 768px, 1280px
- Screenshot each failure for evidence
- If a component is in Compass, check that the pattern doc includes the a11y notes`,
      },
    ],
  },
  {
    category: "Skills",
    icon: "📦",
    desc: "Reusable workflows in .claude/skills/ or ~/.claude/skills/. These are the compound-interest layer.",
    items: [
      {
        id: "skill-reliability-brief",
        name: "reliability-brief",
        label: "Automated morning reliability brief",
        tags: ["daily", "reliability", "uc-6"],
        filename: ".claude/skills/reliability-brief/SKILL.md",
        content: `---
name: reliability-brief
description: Generate a morning reliability brief from available data sources
triggers:
  - "morning brief"
  - "what happened overnight"
  - "reliability status"
  - "/brief"
---

# Reliability Brief Skill

Generate a concise morning brief for a principal engineer in a reliability organization.

## Data sources (use what's available):
- Git log (last 24h across all monitored repos)
- CI/CD status (failing builds, blocked deploys)
- Sentry or error monitoring (new errors, error rate changes)
- Slack MCP (channels: #incidents, #oncall, #deploys — last 24h)
- Monitoring dashboards via CLI or MCP

## Output format:

### 🔴 Needs attention now
[Anything actively broken or burning error budget]

### 🟡 Watch list
[Things that aren't broken but are trending wrong]

### 🟢 Shipped overnight
[PRs merged, deploys completed, incidents resolved]

### 📊 Repeat signal
[Any pattern in recent tickets that matches known repeat drivers]

### 🎯 Today's one thing
[The single highest-leverage thing to focus on today]

## Rules:
- Keep each section to 1-3 bullets max
- Link to the source (PR, incident, dashboard) for every claim
- If a data source is unavailable, say so — don't guess
- Flag any SLO violation or error budget burn explicitly`,
      },
      {
        id: "skill-repeat-cluster",
        name: "repeat-cluster",
        label: "Fan-out repeat-driver analysis",
        tags: ["reliability", "uc-1", "workflow"],
        filename: ".claude/skills/repeat-cluster/SKILL.md",
        content: `---
name: repeat-cluster
description: Use a dynamic workflow to classify repeat-driver tickets at scale
triggers:
  - "analyze repeats"
  - "repeat drivers"
  - "cluster tickets"
  - "what's causing repeats"
---

# Repeat-Driver Clustering Skill

Use a dynamic workflow to fan out parallel agents over repeat tickets, classify by root cause, and synthesize a ranked list of systemic drivers.

## Workflow pattern: Fan-out-and-synthesize with adversarial verification

### Phase 1: Fan out
- Divide the ticket corpus into batches of 20-30
- Spawn one repeat-detective agent per batch (use worktree isolation)
- Each agent classifies its batch into structured JSON

### Phase 2: Synthesize
- Merge all classifications
- Cluster by root_cause category
- Rank by frequency (most common first)
- For each cluster, select the 2-3 most representative tickets as examples

### Phase 3: Adversarial verify
- Spawn a verification agent that:
  - Samples 10% of tickets and re-classifies independently
  - Compares against the original classification
  - Flags any cluster where agreement is below 70%
  - Reports confidence per cluster

### Output:
A ranked list of repeat drivers with:
- Cluster name and count
- Representative ticket examples
- Proposed systemic fix
- Estimated repeat reduction if fixed
- Confidence level from verification

## Token budget: 50k
## Trigger: "use a workflow to analyze repeat tickets"`,
      },
      {
        id: "skill-golden-path",
        name: "golden-path-check",
        label: "Check work against golden-path spec",
        tags: ["devex", "uc-8", "quality"],
        filename: ".claude/skills/golden-path-check/SKILL.md",
        content: `---
name: golden-path-check
description: Verify that new code follows the org's golden path / paved road patterns
triggers:
  - "golden path check"
  - "does this follow our standards"
  - "paved road review"
---

# Golden Path Compliance Check

Review changed files against the organization's standard patterns (the "golden path" or "paved road").

## Check against:
1. **Service structure** — does the service follow the standard layout?
2. **Error handling** — are errors structured, logged, and surfaced per the pattern?
3. **Observability** — are the standard metrics, traces, and log fields present?
4. **Resilience** — are circuit breakers, retries, and timeouts configured per the standard?
5. **Testing** — does the test structure match the golden path (unit / integration / e2e)?
6. **Dependencies** — are only approved libraries used? Any shadow dependencies?
7. **Configuration** — is config externalized per the standard? No hardcoded secrets or endpoints?

## Process:
1. Read the golden path spec from the project's CLAUDE.md or linked spec doc
2. Diff the changed files against each check
3. For each deviation, classify as:
   - **BLOCKER** — must fix before merge (security, reliability risk)
   - **DRIFT** — should fix, creates maintenance burden
   - **STYLE** — optional, but the golden path way is better
4. Suggest the specific golden-path-compliant alternative for each finding

## Rules:
- Don't flag things the golden path doesn't have an opinion on
- If the golden path spec is missing a section, note the gap — that's a spec improvement opportunity
- Every finding must reference the specific golden path rule it violates`,
      },
    ],
  },
  {
    category: "Hooks",
    icon: "🪝",
    desc: "Deterministic lifecycle hooks. Add to .claude/settings.json to automate the edges.",
    items: [
      {
        id: "hook-format",
        name: "PostToolUse: auto-format",
        label: "Format code after every write/edit",
        tags: ["quality", "automatic"],
        filename: ".claude/settings.json (hooks section)",
        content: `// Add to your .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}

// Why: Claude writes well-formatted code ~90% of the time.
// This hook catches the other 10% so you never fail CI on formatting.
// Boris's team uses exactly this pattern.`,
      },
      {
        id: "hook-stop",
        name: "Stop: notification + keep-going",
        label: "Notify when done, optionally continue",
        tags: ["parallel", "automation"],
        filename: ".claude/settings.json (hooks section)",
        content: `// Add to your .claude/settings.json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \\\"Claude finished a task\\\" with title \\\"Claude Code\\\"' 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}

// Why: When running 3-5 parallel sessions in auto mode,
// you need to know when one finishes without watching every tab.
// Boris uses iTerm2 notifications; this is the macOS equivalent.
// On Linux, replace osascript with notify-send.`,
      },
      {
        id: "hook-postcompact",
        name: "PostCompact: re-inject critical context",
        label: "Re-inject rules after context compression",
        tags: ["context", "safety"],
        filename: ".claude/settings.json (hooks section)",
        content: `// Add to your .claude/settings.json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo '⚠️ Context was compacted. Re-read CLAUDE.md before your next action. Pay special attention to the Never-Do rules.'"
          }
        ]
      }
    ]
  }
}

// Why: When auto-compact fires mid-task, critical rules
// from CLAUDE.md can get summarized away. This hook nudges
// Claude to re-read the rules before continuing.
// Thariq recommends this as insurance against context rot.`,
      },
    ],
  },
];

const PROMPTS = [
  {
    id: "p-delegate",
    name: "Delegate a feature",
    desc: "The full-context brief that lets Claude one-shot the implementation.",
    fields: [
      { key: "goal", label: "Goal", placeholder: "e.g., Add error boundary to the dashboard widget" },
      { key: "constraints", label: "Constraints", placeholder: "e.g., Don't modify the data layer; use existing ErrorBoundary pattern" },
      { key: "criteria", label: "Acceptance Criteria", placeholder: "e.g., Widget shows friendly error state; existing tests pass; new test for error case" },
      { key: "verify", label: "Verification Method", placeholder: "e.g., Chrome extension at 3 breakpoints" },
    ],
    template: (f) => `Goal: ${f.goal || "[describe what success looks like]"}

Constraints:
- ${f.constraints || "[what not to touch, patterns to honor]"}

Acceptance criteria:
- ${f.criteria || "[how you'll verify it works]"}

Verification: ${f.verify || "Use the Chrome extension to verify visually, then run the test suite."}

Work autonomously. Don't ask for permission on routine file writes and test runs. When done, run /go.`,
  },
  {
    id: "p-correction",
    name: "Correction → Rule",
    desc: "Turn a mistake into a permanent rule. Use this every single time.",
    fields: [
      { key: "wrong", label: "What went wrong", placeholder: "e.g., Used inline styles instead of design tokens" },
      { key: "right", label: "What to do instead", placeholder: "e.g., Always use token values from /tokens/spacing.ts" },
    ],
    template: (f) => `That's wrong — ${f.wrong || "[what Claude did incorrectly]"}.

The correct approach: ${f.right || "[what should have happened]"}.

Update your CLAUDE.md with a rule in this format:
"Never [the wrong thing]. Instead, always [the right thing]."`,
  },
  {
    id: "p-repeat-analysis",
    name: "Repeat-driver analysis",
    desc: "Kick off a full fan-out analysis of repeat tickets.",
    fields: [
      { key: "source", label: "Ticket source", placeholder: "e.g., ServiceNow queue, CSV export, Slack thread" },
      { key: "timeframe", label: "Timeframe", placeholder: "e.g., last 30 days" },
      { key: "focus", label: "Focus area (optional)", placeholder: "e.g., billing-related, outage-related" },
    ],
    template: (f) => `Use a workflow to analyze repeat-driver tickets from ${f.source || "[ticket source]"} over the ${f.timeframe || "last 30 days"}.${f.focus ? `\n\nFocus on: ${f.focus}` : ""}

For each ticket, classify by:
- Surface symptom (what the customer reported)
- Root cause (the actual system issue)
- Preventability (could we have caught this proactively?)

Then cluster by root cause, rank by frequency, and for each cluster:
- Show 2-3 representative examples
- Propose a systemic fix
- Estimate repeat reduction if fixed

Use adversarial verification: have a separate agent re-classify 10% of tickets independently and report agreement rate per cluster.

Token budget: 50k.`,
  },
  {
    id: "p-design-review",
    name: "Challenge my design",
    desc: "Use Claude as an adversarial design reviewer before committing to an approach.",
    fields: [
      { key: "design", label: "Your proposed design", placeholder: "e.g., We'll add a circuit breaker at the API gateway level..." },
      { key: "goal", label: "What it solves", placeholder: "e.g., Cascading failures from downstream service timeouts" },
    ],
    template: (f) => `I'm proposing this design:

${f.design || "[describe your approach]"}

It's meant to solve: ${f.goal || "[the problem]"}

Grill me on this. Specifically:
1. What's the strongest case AGAINST this approach?
2. What failure mode am I not seeing?
3. Is there a simpler way to achieve the same outcome?
4. What would a staff/principal engineer challenge about this in a design review?

Don't be polite. Be rigorous. If the design is solid, say so and explain why.`,
  },
  {
    id: "p-teaching",
    name: "/goal teaching loop",
    desc: "CCA prep or deep learning on any topic. Claude won't let you off the hook.",
    fields: [
      { key: "topic", label: "Topic to learn", placeholder: "e.g., Claude API tool use, prompt engineering patterns" },
    ],
    template: (f) => `Teach me about: ${f.topic || "[topic]"}

Keep a running checklist of concepts I should understand:
- The problem and why it exists
- The solution and its design decisions
- Trade-offs and alternatives
- Broader impact and connections

Walk me through each concept. After explaining, have me restate my understanding in my own words. Fill gaps. If I'm struggling, offer eli5 / eli14 / "explain like I'm an intern" levels.

Then quiz me with multiple-choice questions (shuffled answers, no peeking at the explanation until I answer).

/goal this session should not end until you've verified that I've demonstrated understanding of everything on your checklist.`,
  },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="px-3 py-1 rounded-md text-xs font-semibold transition-all flex-shrink-0"
      style={{
        background: copied ? "#134d30" : "#1c2030",
        color: copied ? "#34d399" : "#7c8db5",
        border: `1px solid ${copied ? "#134d30" : "#252a3a"}`,
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
};

const ProgressRing = ({ pct, color, size = 48 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#252a3a" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease" }} />
    </svg>
  );
};

// ─── APP ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "dashboard", icon: "🧭", label: "Today" },
  { id: "maturity", icon: "📈", label: "Maturity" },
  { id: "toolkit", icon: "🔧", label: "Toolkit" },
  { id: "prompts", icon: "💬", label: "Prompts" },
];

export default function WorkflowCompanion() {
  const [tab, setTab] = useState("dashboard");
  const [completed, setCompleted] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [expandedTool, setExpandedTool] = useState(null);
  const [promptValues, setPromptValues] = useState({});
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  const [toolFilter, setToolFilter] = useState("all");

  // Load from persistent storage
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("boris-workflow-progress");
        if (result?.value) {
          setCompleted(JSON.parse(result.value));
        }
      } catch (e) { /* first use */ }
      setLoaded(true);
    })();
  }, []);

  // Save to persistent storage
  const saveProgress = useCallback(async (next) => {
    setCompleted(next);
    try {
      await window.storage.set("boris-workflow-progress", JSON.stringify(next));
    } catch (e) { /* ok */ }
  }, []);

  const toggle = (id) => {
    const next = { ...completed, [id]: !completed[id] };
    saveProgress(next);
  };

  // Compute maturity stats
  const allMilestones = MATURITY.flatMap((s) => s.milestones);
  const completedCount = allMilestones.filter((m) => completed[m.id]).length;
  const totalCount = allMilestones.length;

  const stageStats = MATURITY.map((s) => {
    const done = s.milestones.filter((m) => completed[m.id]).length;
    return { ...s, done, total: s.milestones.length, pct: done / s.milestones.length };
  });

  const currentStage = stageStats[0].pct < 1 ? 0 : stageStats[1].pct < 1 ? 1 : 2;

  // Next actions
  const nextActions = MATURITY[currentStage].milestones
    .filter((m) => !completed[m.id])
    .slice(0, 3);

  // Tool filtering
  const allTags = [...new Set(TOOLKIT.flatMap(c => c.items.flatMap(i => i.tags)))].sort();
  const filteredToolkit = TOOLKIT.map(cat => ({
    ...cat,
    items: toolFilter === "all" ? cat.items : cat.items.filter(i => i.tags.includes(toolFilter)),
  })).filter(cat => cat.items.length > 0);

  if (!loaded) return <div style={{ background: "#0d0f14", minHeight: "100vh" }} />;

  const bg = "#0d0f14";
  const surface = "#14171f";
  const surface2 = "#1c2030";
  const border = "#252a3a";
  const accent = "#5b8aff";
  const accent2 = "#a78bfa";
  const accent3 = "#34d399";
  const text = "#e2e8f0";
  const dim = "#7c8db5";
  const dimmer = "#445070";

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* TAB BAR */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20, background: surface,
        borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center",
        padding: "0 16px", gap: 2, height: 48,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginRight: 16, letterSpacing: "0.02em" }}>
          ⚡ Workflow Companion
        </div>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? surface2 : "transparent",
            border: `1px solid ${tab === t.id ? border : "transparent"}`,
            color: tab === t.id ? text : dim,
            padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProgressRing pct={completedCount / totalCount} color={accent} size={36} />
            <span style={{ position: "absolute", fontSize: 10, fontWeight: 700, color: dim }}>
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: accent, marginBottom: 4, textTransform: "uppercase" }}>
                {MATURITY[currentStage].label} Phase
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>What to focus on right now</div>
              <div style={{ fontSize: 13, color: dim, marginTop: 4 }}>
                {completedCount === 0
                  ? "You haven't started yet. Pick one thing below and do it today."
                  : `${completedCount} of ${totalCount} milestones completed. ${nextActions.length > 0 ? "Here's what's next." : "You've graduated this phase!"}`
                }
              </div>
            </div>

            {/* Next actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nextActions.map((m, i) => (
                <div key={m.id} style={{
                  background: surface, border: `1px solid ${border}`,
                  borderLeft: `3px solid ${i === 0 ? accent : dimmer}`,
                  borderRadius: 10, padding: "14px 18px",
                  display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                      {i === 0 ? "→ " : ""}{m.text}
                    </div>
                    <div style={{ fontSize: 12, color: dim }}>
                      Habit: {m.habit}
                    </div>
                  </div>
                  <button onClick={() => toggle(m.id)} style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: surface2, border: `1px solid ${border}`,
                    color: dim, cursor: "pointer", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    ✓
                  </button>
                </div>
              ))}
            </div>

            {/* Quick launchers */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Quick launchers</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Copy morning /brief prompt", action: () => navigator.clipboard.writeText(TOOLKIT[0].items.find(i => i.id === "cmd-brief")?.content || ""), icon: "🌅" },
                  { label: "Copy correction→rule phrase", action: () => navigator.clipboard.writeText(PROMPTS.find(p => p.id === "p-correction")?.template({ wrong: "", right: "" }) || ""), icon: "✍️" },
                  { label: "Copy /go workflow", action: () => navigator.clipboard.writeText(TOOLKIT[0].items.find(i => i.id === "cmd-go")?.content || ""), icon: "🚀" },
                  { label: "Copy /evidence capture", action: () => navigator.clipboard.writeText(TOOLKIT[0].items.find(i => i.id === "cmd-evidence")?.content || ""), icon: "📈" },
                ].map((q) => {
                  const [qCopied, setQCopied] = useState(false);
                  return (
                    <button key={q.label} onClick={() => { q.action(); setQCopied(true); setTimeout(() => setQCopied(false), 1500); }}
                      style={{
                        background: qCopied ? "#0a2019" : surface, border: `1px solid ${qCopied ? "#134d30" : border}`,
                        borderRadius: 8, padding: "10px 14px", cursor: "pointer", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
                      }}>
                      <span style={{ fontSize: 16 }}>{q.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: qCopied ? accent3 : dim }}>
                        {qCopied ? "Copied!" : q.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* The Loop visual */}
            <div style={{ marginTop: 28, background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>The Compounding Loop</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
                {[
                  { label: "Claude makes a mistake", color: "#f87171" },
                  { label: "→" },
                  { label: "You say \"update CLAUDE.md\"", color: accent },
                  { label: "→" },
                  { label: "Claude writes a rule for itself", color: accent2 },
                  { label: "→" },
                  { label: "Next session starts smarter", color: accent3 },
                  { label: "→" },
                  { label: "Mistake rate drops", color: accent3 },
                ].map((s, i) =>
                  s.color ? (
                    <span key={i} style={{
                      background: `${s.color}15`, border: `1px solid ${s.color}40`,
                      borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 600,
                      color: s.color, whiteSpace: "nowrap",
                    }}>
                      {s.label}
                    </span>
                  ) : (
                    <span key={i} style={{ color: dimmer, fontSize: 14, fontWeight: 700 }}>{s.label}</span>
                  )
                )}
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: dimmer, marginTop: 10 }}>
                ↻ This is the entire system. Every other feature exists to make this loop spin faster.
              </div>
            </div>
          </div>
        )}

        {/* ── MATURITY ── */}
        {tab === "maturity" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: accent, marginBottom: 4, textTransform: "uppercase" }}>
                Maturity Ladder
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Track your adoption</div>
              <div style={{ fontSize: 13, color: dim, marginTop: 4 }}>
                Progress persists across sessions. Complete each phase before moving to the next.
              </div>
            </div>

            {/* Stage overview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {stageStats.map((s) => (
                <div key={s.id} style={{
                  background: surface, border: `1px solid ${border}`, borderRadius: 10,
                  padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                  opacity: s.id === MATURITY[currentStage].id ? 1 : 0.5,
                  borderColor: s.id === MATURITY[currentStage].id ? s.color + "60" : border,
                }}>
                  <ProgressRing pct={s.pct} color={s.color} size={44} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: dim }}>{s.done}/{s.total}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            {MATURITY.map((stage, si) => (
              <div key={stage.id} style={{ marginBottom: 24, opacity: si <= currentStage ? 1 : 0.4 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: stage.color,
                  marginBottom: 8, letterSpacing: "0.04em",
                }}>
                  {stage.label} — {stage.desc}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {stage.milestones.map((m) => (
                    <button key={m.id} onClick={() => toggle(m.id)} style={{
                      background: completed[m.id] ? `${stage.color}10` : surface,
                      border: `1px solid ${completed[m.id] ? stage.color + "40" : border}`,
                      borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 10, alignItems: "center",
                      textAlign: "left", transition: "all 0.15s",
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: completed[m.id] ? stage.color : surface2,
                        border: `1px solid ${completed[m.id] ? stage.color : border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: completed[m.id] ? "#fff" : "transparent", fontWeight: 700,
                      }}>✓</div>
                      <div>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: completed[m.id] ? dim : text,
                          textDecoration: completed[m.id] ? "line-through" : "none",
                        }}>{m.text}</div>
                      </div>
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 12,
                        background: surface2, border: `1px solid ${border}`, color: dim,
                      }}>{m.habit}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Reset */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={() => saveProgress({})} style={{
                background: "transparent", border: `1px solid ${border}`, borderRadius: 6,
                padding: "6px 14px", color: dimmer, fontSize: 11, cursor: "pointer",
              }}>
                Reset all progress
              </button>
            </div>
          </div>
        )}

        {/* ── TOOLKIT ── */}
        {tab === "toolkit" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: accent, marginBottom: 4, textTransform: "uppercase" }}>
                Toolkit
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Skills, Agents, Commands &amp; Hooks</div>
              <div style={{ fontSize: 13, color: dim, marginTop: 4 }}>
                Ready-to-copy file definitions. Click any card to see the full content, then copy to your project.
              </div>
            </div>

            {/* Tag filter */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 18 }}>
              <button onClick={() => setToolFilter("all")} style={{
                padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: toolFilter === "all" ? accent + "20" : surface2,
                color: toolFilter === "all" ? accent : dim,
                border: `1px solid ${toolFilter === "all" ? accent + "50" : border}`,
              }}>All</button>
              {["reliability", "compass", "quality", "daily", "career", "parallel", "devex"].map(tag => (
                <button key={tag} onClick={() => setToolFilter(tag)} style={{
                  padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: toolFilter === tag ? accent + "20" : surface2,
                  color: toolFilter === tag ? accent : dim,
                  border: `1px solid ${toolFilter === tag ? accent + "50" : border}`,
                }}>{tag}</button>
              ))}
            </div>

            {filteredToolkit.map((cat) => (
              <div key={cat.category} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{cat.category}</span>
                  <span style={{ fontSize: 12, color: dim, marginLeft: 4 }}>{cat.desc}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cat.items.map((item) => {
                    const isOpen = expandedTool === item.id;
                    return (
                      <div key={item.id} style={{
                        background: surface, border: `1px solid ${isOpen ? accent + "50" : border}`,
                        borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s",
                      }}>
                        <button onClick={() => setExpandedTool(isOpen ? null : item.id)} style={{
                          width: "100%", background: "transparent", border: "none", cursor: "pointer",
                          padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr auto",
                          alignItems: "center", textAlign: "left",
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: text, display: "flex", alignItems: "center", gap: 8 }}>
                              <code style={{
                                background: surface2, padding: "1px 7px", borderRadius: 4,
                                fontSize: 12, color: accent3, border: `1px solid ${border}`,
                              }}>{item.name}</code>
                              {item.label}
                            </div>
                            <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                              {item.tags.map(t => (
                                <span key={t} style={{
                                  fontSize: 10, padding: "1px 7px", borderRadius: 10,
                                  background: surface2, color: dim, border: `1px solid ${border}`,
                                }}>{t}</span>
                              ))}
                            </div>
                          </div>
                          <span style={{ color: dim, fontSize: 12, fontWeight: 700, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                        </button>

                        {isOpen && (
                          <div style={{ borderTop: `1px solid ${border}` }}>
                            <div style={{
                              background: surface2, padding: "8px 16px",
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                              <code style={{ fontSize: 12, color: dim }}>{item.filename}</code>
                              <CopyButton text={item.content} />
                            </div>
                            <pre style={{
                              margin: 0, padding: "14px 16px", fontSize: 12,
                              lineHeight: 1.6, color: "#9ecaf0", background: bg,
                              overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
                              fontFamily: "'Cascadia Code', 'Fira Code', monospace",
                            }}>
                              {item.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROMPTS ── */}
        {tab === "prompts" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: accent, marginBottom: 4, textTransform: "uppercase" }}>
                Prompt Lab
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Fill → Generate → Copy → Paste</div>
              <div style={{ fontSize: 13, color: dim, marginTop: 4 }}>
                Fill in the fields to generate a ready-to-paste prompt. Or copy the template with placeholders.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PROMPTS.map((p) => {
                const isOpen = expandedPrompt === p.id;
                const vals = promptValues[p.id] || {};
                const generated = p.template(vals);
                return (
                  <div key={p.id} style={{
                    background: surface, border: `1px solid ${isOpen ? accent2 + "50" : border}`,
                    borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s",
                  }}>
                    <button onClick={() => setExpandedPrompt(isOpen ? null : p.id)} style={{
                      width: "100%", background: "transparent", border: "none", cursor: "pointer",
                      padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr auto",
                      alignItems: "center", textAlign: "left",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: dim, marginTop: 2 }}>{p.desc}</div>
                      </div>
                      <span style={{ color: dim, fontSize: 12, fontWeight: 700, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${border}`, padding: "16px 18px" }}>
                        {/* Fields */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                          {p.fields.map((f) => (
                            <div key={f.key}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>
                                {f.label}
                              </label>
                              <input
                                type="text"
                                placeholder={f.placeholder}
                                value={vals[f.key] || ""}
                                onChange={(e) => setPromptValues({
                                  ...promptValues,
                                  [p.id]: { ...vals, [f.key]: e.target.value },
                                })}
                                style={{
                                  width: "100%", background: bg, border: `1px solid ${border}`,
                                  borderRadius: 6, padding: "8px 12px", color: text, fontSize: 13,
                                  fontFamily: "'Inter', system-ui, sans-serif", outline: "none",
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Generated output */}
                        <div style={{
                          background: surface2, borderRadius: 8, border: `1px solid ${border}`,
                          overflow: "hidden",
                        }}>
                          <div style={{
                            padding: "8px 14px", display: "flex", justifyContent: "space-between",
                            alignItems: "center", borderBottom: `1px solid ${border}`,
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: dim }}>Generated prompt</span>
                            <CopyButton text={generated} />
                          </div>
                          <pre style={{
                            margin: 0, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.6,
                            color: "#c8d8f0", background: bg, whiteSpace: "pre-wrap",
                            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
                            wordBreak: "break-word",
                          }}>
                            {generated}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
