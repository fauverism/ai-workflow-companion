// ─── Types ──────────────────────────────────────────────────────────────────

/** A linked reference that explains the technique behind a task. */
export interface DocLink {
  label: string;
  url: string;
}

export interface Milestone {
  id: string;
  text: string;
  habit: string;
  /** Concrete steps for someone who has never done this before. */
  how: string[];
  docs?: DocLink;
}

export interface Phase {
  id: string;
  label: string;
  desc: string;
  color: string;
  milestones: Milestone[];
}

export interface Rep {
  id: string;
  text: string;
  habit: string;
  why: string;
  /** Concrete steps for someone who has never done this before. */
  how: string[];
  docs?: DocLink;
}

export interface ToolkitItem {
  id: string;
  name: string;
  label: string;
  tags: string[];
  filename: string;
  content: string;
  /** Why this exists / anything to know before installing. Shown above the code, never copied. */
  note?: string;
}

export interface ToolkitCategory {
  category: string;
  icon: string;
  desc: string;
  docs: DocLink;
  items: ToolkitItem[];
}

export interface PromptField {
  key: string;
  label: string;
  placeholder: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  desc: string;
  fields: PromptField[];
  template: (f: Record<string, string>) => string;
}

// ─── Maturity ladder ────────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  {
    id: "crawl",
    label: "Crawl",
    desc: "Build the foundation habits before anything else.",
    color: "#268bd2",
    milestones: [
      {
        id: "c1",
        text: "Created a project-level CLAUDE.md",
        habit: "Write it down",
        how: [
          "Open a terminal in your project's root folder and start Claude Code by typing `claude`.",
          "Type `/init` and press Enter — Claude scans the repo and drafts a CLAUDE.md for you.",
          "Read the draft and cut anything Claude can figure out on its own; keep commands, conventions, and gotchas.",
          "Commit the file to git so every teammate (and every future session) inherits it.",
        ],
        docs: { label: "Docs: Manage Claude's memory", url: "https://docs.claude.com/en/docs/claude-code/memory" },
      },
      {
        id: "c2",
        text: "Used the correction→rule phrase at least 5 times",
        habit: "Memory loop",
        how: [
          "The next time Claude does something wrong, don't just fix it in chat.",
          'Say: "That\'s wrong because [reason]. Update CLAUDE.md with a rule so this never happens again."',
          "Check the diff Claude makes to CLAUDE.md — tighten the wording if the rule is vague.",
          "Repeat until reaching for this phrase is a reflex. Five real corrections is the milestone.",
        ],
        docs: { label: "Docs: Manage Claude's memory", url: "https://docs.claude.com/en/docs/claude-code/memory" },
      },
      {
        id: "c3",
        text: "Started every session with Goal / Constraints / Acceptance Criteria",
        habit: "Delegation",
        how: [
          "Before typing a task, write three lines: Goal (what done looks like), Constraints (what not to touch), Acceptance Criteria (how you'll check it).",
          "Use the “Delegate a feature” template in this app's Prompt Lab tab if you want a fill-in-the-blanks starting point.",
          "Do this for every session in a full workday — that's the milestone.",
        ],
        docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
      },
      {
        id: "c4",
        text: "Used /rewind instead of correcting in chat at least once",
        habit: "Context hygiene",
        how: [
          "When Claude produces a bad diff, resist the urge to argue with it in chat.",
          "Press Esc twice or type `/rewind` to open the checkpoint list.",
          "Pick the checkpoint from just before the bad turn — code and conversation roll back together.",
          "Re-prompt with better constraints (say what you now know went wrong the first time).",
        ],
        docs: { label: "Docs: Checkpointing & rewind", url: "https://docs.claude.com/en/docs/claude-code/checkpointing" },
      },
      {
        id: "c5",
        text: "Ran verification (browser or test suite) before calling something done",
        habit: "Verification",
        how: [
          "After Claude says a task is finished, ask it to prove it — don't take “done” on faith.",
          "Frontend change? Ask Claude to open the running app and check the affected screens.",
          "Backend change? Ask Claude to run the test suite and paste the output.",
          "Only mark the task complete once you've seen the evidence yourself.",
        ],
        docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
      },
      {
        id: "c6",
        text: "Completed one full session in auto mode without babysitting",
        habit: "Fleet mindset",
        how: [
          "Pick a small, low-risk task (a copy change, a test, a refactor of one file).",
          "Press Shift+Tab in Claude Code to cycle the permission mode to “accept edits”, or start with `claude --permission-mode acceptEdits`.",
          "Give a complete brief (Goal / Constraints / Acceptance Criteria) and let it run without touching the keyboard.",
          "Review the result at the end instead of approving each step.",
        ],
        docs: { label: "Docs: Permission modes & settings", url: "https://docs.claude.com/en/docs/claude-code/settings" },
      },
    ],
  },
  {
    id: "walk",
    label: "Walk",
    desc: "Scale the habits into repeatable infrastructure.",
    color: "#b58900",
    milestones: [
      {
        id: "w1",
        text: "Created 3+ slash commands checked into git",
        habit: "Slash commands",
        how: [
          "Notice a prompt you've typed more than once — that's your first command.",
          "Create a markdown file at `.claude/commands/<name>.md` containing that prompt.",
          "Test it by typing `/<name>` in a session. Refine the wording until it works one-shot.",
          "Commit the folder. Grab ready-made ones from this app's Toolkit tab to get to three faster.",
        ],
        docs: { label: "Docs: Slash commands", url: "https://docs.claude.com/en/docs/claude-code/slash-commands" },
      },
      {
        id: "w2",
        text: "Set up at least 1 custom agent (.claude/agents/)",
        habit: "Agents",
        how: [
          "Type `/agents` in Claude Code and choose “Create new agent” — it walks you through name, prompt, and tools.",
          "Or copy a starter (like code-simplifier) from this app's Toolkit tab into `.claude/agents/`.",
          "Invoke it by asking Claude to “use the <name> agent” on a real task.",
        ],
        docs: { label: "Docs: Subagents", url: "https://docs.claude.com/en/docs/claude-code/sub-agents" },
      },
      {
        id: "w3",
        text: "Ran 2+ parallel sessions on separate tasks simultaneously",
        habit: "Parallel work",
        how: [
          "Pick two unrelated tasks (e.g., a bug fix and a doc update).",
          "Create a second copy of your repo with `git worktree add ../<repo>-task-b`, so the sessions can't overwrite each other.",
          "Open a terminal tab in each folder, start `claude` in both, and brief each one.",
          "While one works, review the other. That rhythm is the habit.",
        ],
        docs: { label: "Docs: Parallel sessions with worktrees", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
      },
      {
        id: "w4",
        text: "Built a /go-style verify→simplify→ship workflow",
        habit: "Verification",
        how: [
          "Copy the `/go` command from this app's Toolkit tab into `.claude/commands/go.md`.",
          "Edit the verify step to match your project (your test command, your dev server URL).",
          "Run `/go` at the end of your next task and watch it verify, clean up, and prep the PR.",
        ],
        docs: { label: "Docs: Slash commands", url: "https://docs.claude.com/en/docs/claude-code/slash-commands" },
      },
      {
        id: "w5",
        text: "Set up a PostToolUse formatting hook",
        habit: "Hooks",
        how: [
          "Copy the “auto-format” hook from this app's Toolkit tab into `.claude/settings.json`.",
          "Swap `prettier` for whatever formatter your project uses.",
          "Make an edit through Claude and confirm the file comes out formatted without being asked.",
        ],
        docs: { label: "Docs: Hooks", url: "https://docs.claude.com/en/docs/claude-code/hooks-guide" },
      },
      {
        id: "w6",
        text: "CLAUDE.md has 15+ rules from real corrections",
        habit: "Memory loop",
        how: [
          "This one is earned, not written in a sitting — each rule should come from a real mistake.",
          "Keep using the correction→rule phrase every time Claude drifts.",
          "Once a week, prune: merge duplicates, delete rules that stopped mattering.",
          "Count the rules that came from actual corrections. At 15+, sessions start feeling telepathic.",
        ],
        docs: { label: "Docs: Manage Claude's memory", url: "https://docs.claude.com/en/docs/claude-code/memory" },
      },
      {
        id: "w7",
        text: "Created a reusable skill for a recurring team task",
        habit: "Skills",
        how: [
          "Pick a chore your team repeats (release notes, morning brief, ticket triage).",
          "Create `.claude/skills/<name>/SKILL.md` with a description, trigger phrases, and the steps.",
          "Steal the structure from the skills in this app's Toolkit tab.",
          "Ship it in git and tell one teammate to try it — that's the real test.",
        ],
        docs: { label: "Docs: Agent Skills", url: "https://docs.claude.com/en/docs/claude-code/skills" },
      },
    ],
  },
  {
    id: "run",
    label: "Run",
    desc: "Operate as a fleet commander. Agents work; you direct.",
    color: "#639922",
    milestones: [
      {
        id: "r1",
        text: "Running 3–5 worktree sessions in parallel regularly",
        habit: "Parallel work",
        how: [
          "Each morning, pick 3–5 independent tasks from your backlog.",
          "Spin up a git worktree per task and start a briefed Claude session in each.",
          "Set a Stop-hook notification (Toolkit tab) so finished sessions ping you.",
          "Spend your day reviewing and re-briefing, not typing code.",
        ],
        docs: { label: "Docs: Parallel sessions with worktrees", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
      },
      {
        id: "r2",
        text: "Set up /loop or a schedule for at least one recurring task",
        habit: "Automation",
        how: [
          "Pick a chore you do on a rhythm — checking CI, triaging new issues, a nightly dependency audit.",
          "In Claude Code, run it on an interval with `/loop` (e.g., `/loop 30m /brief`), or ask Claude to schedule a recurring cloud agent.",
          "Let it run for a week, then tune the interval and the prompt based on what it produced.",
        ],
        docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
      },
      {
        id: "r3",
        text: "Used a fan-out workflow for a big migration or audit",
        habit: "Workflows",
        how: [
          "Find a batch-shaped job: rename an API across 200 files, audit every component for a11y, classify a ticket backlog.",
          "Ask Claude to split the work into batches and spawn a subagent per batch in parallel.",
          "Add a final synthesis step that merges results, plus a verification agent that spot-checks a sample.",
          "The repeat-cluster skill in the Toolkit tab is a complete worked example.",
        ],
        docs: { label: "Docs: Subagents", url: "https://docs.claude.com/en/docs/claude-code/sub-agents" },
      },
      {
        id: "r4",
        text: "Auto mode is your default — you rarely see permission prompts",
        habit: "Auto mode",
        how: [
          "Each time a permission prompt appears, treat it as a bug in your configuration.",
          "Add the safe, recurring commands to the `allow` list in `.claude/settings.json`.",
          "Keep genuinely dangerous operations (deploys, deletes, pushes) behind prompts or `deny` rules.",
          "You're done when a normal working session runs prompt-free start to finish.",
        ],
        docs: { label: "Docs: Permissions & settings", url: "https://docs.claude.com/en/docs/claude-code/settings" },
      },
      {
        id: "r5",
        text: "Capturing evidence of impact after every milestone",
        habit: "Career",
        how: [
          "Install the `/evidence` command from the Toolkit tab.",
          "Run it after every meaningful ship — it appends a dated entry to EVIDENCE.md.",
          "Record the problem, your decision, and a measurable outcome (or the leading indicator you'll track).",
          "At review time, your promotion packet writes itself.",
        ],
      },
      {
        id: "r6",
        text: "Team uses your shared CLAUDE.md and slash commands",
        habit: "Org influence",
        how: [
          "Make sure `.claude/commands/` and CLAUDE.md are committed to the shared repo — teammates inherit them automatically on pull.",
          "Demo one command in a team meeting; pick the one with the most obvious payoff.",
          "Watch for a teammate's PR that used your workflow. That's when this milestone is real.",
        ],
        docs: { label: "Docs: Slash commands", url: "https://docs.claude.com/en/docs/claude-code/slash-commands" },
      },
      {
        id: "r7",
        text: "Managing multiple agents from a single fleet view",
        habit: "Fleet command",
        how: [
          "Consolidate: instead of scattered terminal tabs, drive background agents from one main session using the task tools, or use the Claude Code desktop app to see every session in one place.",
          "Start each agent in the background so you get notified on completion instead of polling.",
          "Practice the loop: dispatch → get notified → review → re-brief. One screen, many agents.",
        ],
        docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
      },
    ],
  },
];

// ─── Certifications ─────────────────────────────────────────────────────────
// One certification per phase. Completing every milestone in a phase earns it.

export interface CertInfo {
  title: string;
  subtitle: string;
}

export const CERTS: Record<string, CertInfo> = {
  crawl: { title: "Practitioner", subtitle: "Foundations of agentic engineering" },
  walk: { title: "Operator", subtitle: "Workflow infrastructure at scale" },
  run: { title: "Fleet Commander", subtitle: "Parallel agentic operations" },
};

/** The capstone: every milestone across every phase, done. */
export const ALUMNI_CERT: CertInfo = {
  title: "Graduate",
  subtitle: "Crawl, Walk, Run — the full practice, complete",
};

// ─── Daily reps ─────────────────────────────────────────────────────────────
// Small, same-day actions. Three are dealt per day from the pool matching the
// user's current phase. Habit formation = frequency × specificity.

export const REPS: Record<string, Rep[]> = {
  crawl: [
    {
      id: "rep-c1",
      text: "Open today's first session with Goal / Constraints / Acceptance Criteria",
      habit: "Delegation",
      why: "Under-specified prompts are the #1 cause of AI drift. Spec first, always.",
      how: [
        "Before your first prompt of the day, write three lines: Goal (what done looks like), Constraints (what not to touch), Acceptance Criteria (how you'll check it).",
        "Paste them as the opening message of the session, then add the task.",
        "Shortcut: the “Delegate a feature” template in the Prompt Lab tab builds this for you.",
      ],
      docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
    },
    {
      id: "rep-c2",
      text: "Turn one correction into a permanent CLAUDE.md rule",
      habit: "Memory loop",
      why: "A correction fixes one session. A rule fixes every future session.",
      how: [
        "Catch one moment today where you correct Claude's output.",
        'Instead of only fixing it, add: "Update CLAUDE.md with a rule so this never happens again."',
        "Review the rule Claude writes — it should say what to do, not just what went wrong.",
        "The “Correction → Rule” template in the Prompt Lab tab has the exact phrasing.",
      ],
      docs: { label: "Docs: Manage Claude's memory", url: "https://docs.claude.com/en/docs/claude-code/memory" },
    },
    {
      id: "rep-c3",
      text: "Verify one change (browser or tests) before saying \"done\"",
      habit: "Verification",
      why: "Closing the loop yourself is what separates delegation from hoping.",
      how: [
        "Pick one task Claude finishes today.",
        "If it touched UI: ask Claude to open the app in the browser and check the changed screens.",
        "If it touched logic: ask Claude to run the tests and show you the output.",
        "Don't accept “should work now” — accept evidence.",
      ],
      docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
    },
    {
      id: "rep-c4",
      text: "Use /rewind instead of arguing with a bad diff",
      habit: "Context hygiene",
      why: "Correcting in chat pollutes context. Rewinding restores a clean slate.",
      how: [
        "When a diff comes back wrong today, stop before typing a correction.",
        "Press Esc twice (or type `/rewind`) and jump back to the checkpoint before the bad turn.",
        "Re-prompt with the constraint that would have prevented the mistake.",
      ],
      docs: { label: "Docs: Checkpointing & rewind", url: "https://docs.claude.com/en/docs/claude-code/checkpointing" },
    },
    {
      id: "rep-c5",
      text: "Let one small task run start-to-finish in auto mode",
      habit: "Fleet mindset",
      why: "You can't run a fleet if you approve every file write by hand.",
      how: [
        "Choose something low-stakes: a copy tweak, a new test, a one-file refactor.",
        "Press Shift+Tab to switch the permission mode to “accept edits”.",
        "Brief it fully, then keep your hands off until it reports back.",
        "Review the finished work instead of the individual steps.",
      ],
      docs: { label: "Docs: Permission modes & settings", url: "https://docs.claude.com/en/docs/claude-code/settings" },
    },
    {
      id: "rep-c6",
      text: "Write down one thing Claude got wrong today — and why",
      habit: "Write it down",
      why: "Patterns you notice become rules. Patterns you don't become recurring bugs.",
      how: [
        "Keep a scratch note (or a NOTES.md) open during the day.",
        "When something goes sideways, jot one line: what happened, and your best guess why.",
        "At the end of the day, if the note describes a pattern, promote it to a CLAUDE.md rule.",
      ],
      docs: { label: "Docs: Manage Claude's memory", url: "https://docs.claude.com/en/docs/claude-code/memory" },
    },
  ],
  walk: [
    {
      id: "rep-w1",
      text: "Turn a prompt you've typed twice into a slash command",
      habit: "Slash commands",
      why: "The second time you type it is the signal. The third time is waste.",
      how: [
        "Scroll back through today's sessions and find a prompt you've written before.",
        "Save it as `.claude/commands/<name>.md` — the file body is just the prompt text.",
        "Run `/<name>` to test it, then commit it so the team gets it too.",
      ],
      docs: { label: "Docs: Slash commands", url: "https://docs.claude.com/en/docs/claude-code/slash-commands" },
    },
    {
      id: "rep-w2",
      text: "Run two sessions in parallel on unrelated tasks",
      habit: "Parallel work",
      why: "Waiting on one agent is the new watching a progress bar.",
      how: [
        "Pick two tasks that don't share files.",
        "Run `git worktree add ../<repo>-b` to give the second task its own working copy.",
        "Start `claude` in both folders, brief both, and alternate: review one while the other works.",
      ],
      docs: { label: "Docs: Parallel sessions with worktrees", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
    },
    {
      id: "rep-w3",
      text: "End the session with a verify→simplify→ship pass",
      habit: "Verification",
      why: "Shipping unreviewed agent output is how tech debt compounds silently.",
      how: [
        "When the task feels done, run your `/go` command (grab it from the Toolkit tab if you haven't installed it).",
        "No `/go` yet? Ask in plain words: “Verify this works, simplify anything overbuilt, then prep the commit.”",
        "Read the verification output before you push.",
      ],
      docs: { label: "Docs: Slash commands", url: "https://docs.claude.com/en/docs/claude-code/slash-commands" },
    },
    {
      id: "rep-w4",
      text: "Add one rule to CLAUDE.md from something you corrected today",
      habit: "Memory loop",
      why: "15+ real rules is the tipping point where sessions start feeling telepathic.",
      how: [
        "Find today's correction — there's almost always at least one.",
        'Ask Claude: "Add a CLAUDE.md rule: Never [the wrong thing]. Instead, always [the right thing]."',
        "Skim the existing rules while you're there; merge any duplicates.",
      ],
      docs: { label: "Docs: Manage Claude's memory", url: "https://docs.claude.com/en/docs/claude-code/memory" },
    },
    {
      id: "rep-w5",
      text: "Delegate one task to a custom agent instead of the main session",
      habit: "Agents",
      why: "Separate context windows keep the main thread focused on the goal.",
      how: [
        "Pick a side-quest inside your current task: a code review, a research question, a cleanup pass.",
        "Ask Claude to “use the <agent-name> agent” for it (create one first with `/agents` if you have none).",
        "Keep working in the main session while the agent runs — that's the point.",
      ],
      docs: { label: "Docs: Subagents", url: "https://docs.claude.com/en/docs/claude-code/sub-agents" },
    },
    {
      id: "rep-w6",
      text: "Let a hook do something you did manually yesterday",
      habit: "Hooks",
      why: "Deterministic edges (format, notify, re-inject) don't belong in prompts.",
      how: [
        "Name one manual ritual from yesterday: formatting, a notification, re-reading rules after compaction.",
        "Find the matching hook in the Toolkit tab and copy it into `.claude/settings.json`.",
        "Trigger the situation once to confirm the hook fires.",
      ],
      docs: { label: "Docs: Hooks", url: "https://docs.claude.com/en/docs/claude-code/hooks-guide" },
    },
  ],
  run: [
    {
      id: "rep-r1",
      text: "Start the day by dispatching 3 parallel worktree sessions",
      habit: "Fleet command",
      why: "Fleet operators plan in the morning and review in the afternoon.",
      how: [
        "Before opening email, pick three independent backlog items.",
        "Create a worktree per item, start a session in each, and give each a full brief.",
        "Check back mid-morning to review and re-brief. Your job today is direction, not typing.",
      ],
      docs: { label: "Docs: Parallel sessions with worktrees", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
    },
    {
      id: "rep-r2",
      text: "Kick off one fan-out workflow instead of doing it serially",
      habit: "Workflows",
      why: "Anything batch-shaped (audit, migration, triage) should fan out.",
      how: [
        "Spot today's batch-shaped job — anything you'd otherwise grind through file by file.",
        "Ask Claude to split it into batches and run a subagent per batch in parallel.",
        "Require a synthesis step at the end that merges and sanity-checks the results.",
      ],
      docs: { label: "Docs: Subagents", url: "https://docs.claude.com/en/docs/claude-code/sub-agents" },
    },
    {
      id: "rep-r3",
      text: "Capture one piece of impact evidence from shipped work",
      habit: "Career",
      why: "Leverage invisible to your org is leverage that doesn't compound.",
      how: [
        "After you ship anything today, run `/evidence` (installable from the Toolkit tab).",
        "Make sure the entry names the problem, your decision, and a number — or the number you'll watch.",
        "One honest entry per ship. Future-you at review time says thanks.",
      ],
    },
    {
      id: "rep-r4",
      text: "Share one command, rule, or skill with a teammate",
      habit: "Org influence",
      why: "Your workflow becomes infrastructure the moment someone else runs it.",
      how: [
        "Pick your most-used command or your sharpest CLAUDE.md rule.",
        "Commit it to the shared repo if it isn't there already, then send a teammate a two-line note: what it does, when to use it.",
        "Bonus rep: pair for five minutes while they run it the first time.",
      ],
    },
    {
      id: "rep-r5",
      text: "Review your permission prompts — automate away the noisiest one",
      habit: "Auto mode",
      why: "Every prompt you still click is a policy you haven't written yet.",
      how: [
        "Notice which permission prompt you've clicked most today.",
        "If it's safe to always allow, add it to the `allow` list in `.claude/settings.json`.",
        "If it's genuinely risky, leave it — the goal is zero *pointless* prompts, not zero prompts.",
      ],
      docs: { label: "Docs: Permissions & settings", url: "https://docs.claude.com/en/docs/claude-code/settings" },
    },
    {
      id: "rep-r6",
      text: "Schedule or /loop one recurring chore so it runs without you",
      habit: "Automation",
      why: "Recurring work is the easiest work to hand to an agent permanently.",
      how: [
        "Pick a chore you do on a timer: CI babysitting, issue triage, a morning brief.",
        "Run it recurringly with `/loop <interval> /<command>`, or ask Claude to set up a scheduled agent.",
        "Tomorrow, check what it produced and tune the prompt once.",
      ],
      docs: { label: "Docs: Common workflows", url: "https://docs.claude.com/en/docs/claude-code/common-workflows" },
    },
  ],
};

// ─── Toolkit ────────────────────────────────────────────────────────────────

export const TOOLKIT: ToolkitCategory[] = [
  {
    category: "Slash Commands",
    icon: "⌘",
    desc: "Drop these in .claude/commands/ and check into git. The team gets them automatically.",
    docs: { label: "Docs: Slash commands", url: "https://docs.claude.com/en/docs/claude-code/slash-commands" },
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
- If this is frontend work: open the running app in a browser
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
        label: "Impact evidence capture",
        tags: ["career", "after-milestone"],
        filename: ".claude/commands/evidence.md",
        content: `# /evidence — Capture Impact Evidence

\`\`\`bash
echo "Session: $(date '+%Y-%m-%d')"
echo "Branch: $(git branch --show-current)"
echo "Files changed: $(git diff --name-only HEAD~1 | wc -l)"
\`\`\`

Based on the work done in this session, write an impact evidence entry.

## Format
Save to EVIDENCE.md in the project root (append, don't overwrite).

### Entry structure:
**Date:** [today]
**What:** [one-line summary of the deliverable]
**Problem before:** [what was broken, slow, missing, or inconsistent]
**What I did:** [your specific decisions, designs, and technical choices — first person]
**Scope signal:** [why this matters beyond the ticket — cross-team impact, architectural decision, org-wide pattern, etc.]
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
2. **Error budget** — any SLO violations or burn-rate alerts (check monitoring if available)
3. **Repeat drivers** — top customer-impacting issues from the last 24h
4. **My queue** — PRs I need to review, threads I'm tagged in, blockers on my work
5. **One thing** — the single most important thing to address today

Keep it scannable. No more than 3 sentences per section.`,
      },
      {
        id: "cmd-pattern-doc",
        name: "/pattern-doc",
        label: "Design-system pattern doc stub",
        tags: ["documentation", "design-system"],
        filename: ".claude/commands/pattern-doc.md",
        content: `# /pattern-doc — Generate Pattern Documentation

Ask for the component or pattern name if not provided.

## Generate an MDX file with this structure:

\`\`\`mdx
---
title: [Component Name]
description: [One-line description]
status: draft
frameworks: [react, angular, web-components]
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
[Live example]

### Other frameworks
[Code examples with notes on differences]
\`\`\`

After generating, update CLAUDE.md if any naming decisions were made.`,
      },
    ],
  },
  {
    category: "Agents",
    icon: "◈",
    desc: "Drop these in .claude/agents/. Each runs with its own context, model, and tool permissions.",
    docs: { label: "Docs: Subagents", url: "https://docs.claude.com/en/docs/claude-code/sub-agents" },
    items: [
      {
        id: "agent-verify",
        name: "verify-resolve",
        label: "Adversarial resolution verifier",
        tags: ["reliability", "verification"],
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
        label: "Repeat-issue investigator",
        tags: ["reliability", "triage"],
        filename: ".claude/agents/repeat-detective.md",
        content: `---
name: repeat-detective
description: Classify and cluster repeat tickets by root cause
color: orange
model: opus
isolation: worktree
---

You are a repeat-issue investigator. You analyze batches of tickets that resulted in repeat contacts and classify them by root cause.

## Your process:
1. Read each ticket in your assigned batch
2. For each ticket, determine:
   - **Surface symptom**: what the user reported
   - **Root cause category**: the underlying system issue (e.g., stale cache, missing error handling, unclear UI, config drift, telemetry gap)
   - **Preventability**: could this have been caught proactively? How?
3. Output structured JSON for each ticket:
   \`\`\`json
   { "ticket_id": "", "symptom": "", "root_cause": "", "category": "", "preventable": true, "prevention_method": "" }
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
        tags: ["quality", "design-system"],
        filename: ".claude/agents/a11y-auditor.md",
        content: `---
name: a11y-auditor
description: WCAG 2.1 AA audit with visual verification in the browser
color: green
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
1. Open the component/page in the browser
2. Walk through each checklist item visually
3. Test keyboard navigation by tabbing through
4. Report findings as: PASS / FAIL / WARN with specific remediation steps

## Rules:
- Always test at 3 viewport widths: 375px, 768px, 1280px
- Screenshot each failure for evidence
- If the component has a pattern doc, check that it includes the a11y notes`,
      },
    ],
  },
  {
    category: "Skills",
    icon: "▣",
    desc: "Reusable workflows in .claude/skills/ or ~/.claude/skills/. These are the compound-interest layer.",
    docs: { label: "Docs: Agent Skills", url: "https://docs.claude.com/en/docs/claude-code/skills" },
    items: [
      {
        id: "skill-reliability-brief",
        name: "reliability-brief",
        label: "Automated morning reliability brief",
        tags: ["daily", "reliability"],
        filename: ".claude/skills/reliability-brief/SKILL.md",
        content: `---
name: reliability-brief
description: Generate a morning reliability brief from available data sources. Use when the user asks for a morning brief, reliability status, or what happened overnight.
---

# Reliability Brief Skill

Generate a concise morning brief for an engineer responsible for reliability.

## Data sources (use what's available):
- Git log (last 24h across all monitored repos)
- CI/CD status (failing builds, blocked deploys)
- Error monitoring (new errors, error rate changes)
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
        label: "Fan-out repeat-issue analysis",
        tags: ["reliability", "workflow"],
        filename: ".claude/skills/repeat-cluster/SKILL.md",
        content: `---
name: repeat-cluster
description: Use a fan-out workflow to classify repeat tickets at scale. Use when the user asks to analyze repeats, find repeat drivers, or cluster tickets by root cause.
---

# Repeat-Issue Clustering Skill

Fan out parallel agents over repeat tickets, classify by root cause, and synthesize a ranked list of systemic drivers.

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
- Confidence level from verification`,
      },
      {
        id: "skill-golden-path",
        name: "golden-path-check",
        label: "Check work against golden-path spec",
        tags: ["quality", "devex"],
        filename: ".claude/skills/golden-path-check/SKILL.md",
        content: `---
name: golden-path-check
description: Verify that new code follows the org's golden path / paved road patterns. Use when the user asks for a golden path check, a paved road review, or whether code follows our standards.
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
    icon: "⎔",
    desc: "Deterministic lifecycle hooks. Merge each snippet into the .claude/settings.json in your project root (create the file if it doesn't exist — it must stay valid JSON, no comments).",
    docs: { label: "Docs: Hooks", url: "https://docs.claude.com/en/docs/claude-code/hooks-guide" },
    items: [
      {
        id: "hook-format",
        name: "PostToolUse: auto-format",
        label: "Format code after every write/edit",
        tags: ["quality", "automatic"],
        filename: ".claude/settings.json (hooks section)",
        note: "Claude writes well-formatted code ~90% of the time; this catches the rest so you never fail CI on formatting. Hooks receive the tool call as JSON on stdin — this uses jq to pull out the file path, so jq must be installed. Swap prettier for your project's formatter.",
        content: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path // empty' | xargs -I{} npx prettier --write {} 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}`,
      },
      {
        id: "hook-stop",
        name: "Stop: notification",
        label: "Notify when a session finishes",
        tags: ["parallel", "automation"],
        filename: ".claude/settings.json (hooks section)",
        note: "When running 3–5 parallel sessions in auto mode, you need to know when one finishes without watching every tab. The command below is macOS; on Linux, replace osascript with notify-send.",
        content: `{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \\"Claude finished a task\\" with title \\"Claude Code\\"' 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}`,
      },
      {
        id: "hook-compact",
        name: "SessionStart(compact): re-inject context",
        label: "Re-inject rules after context compression",
        tags: ["context", "safety"],
        filename: ".claude/settings.json (hooks section)",
        note: "When auto-compact fires mid-task, critical rules from CLAUDE.md can get summarized away. SessionStart with the \"compact\" matcher runs right after compaction, and anything the command prints is added back into Claude's context.",
        content: `{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Context was compacted. Re-read CLAUDE.md before your next action. Pay special attention to the Never-Do rules.'"
          }
        ]
      }
    ]
  }
}`,
      },
    ],
  },
];

// ─── Prompt templates ───────────────────────────────────────────────────────

export const PROMPTS: PromptTemplate[] = [
  {
    id: "p-delegate",
    name: "Delegate a feature",
    desc: "The full-context brief that lets Claude one-shot the implementation.",
    fields: [
      { key: "goal", label: "Goal", placeholder: "e.g., Add error boundary to the dashboard widget" },
      { key: "constraints", label: "Constraints", placeholder: "e.g., Don't modify the data layer; use existing ErrorBoundary pattern" },
      { key: "criteria", label: "Acceptance Criteria", placeholder: "e.g., Widget shows friendly error state; existing tests pass; new test for error case" },
      { key: "verify", label: "Verification Method", placeholder: "e.g., Browser check at 3 breakpoints" },
    ],
    template: (f) => `Goal: ${f.goal || "[describe what success looks like]"}

Constraints:
- ${f.constraints || "[what not to touch, patterns to honor]"}

Acceptance criteria:
- ${f.criteria || "[how you'll verify it works]"}

Verification: ${f.verify || "Verify visually in the browser, then run the test suite."}

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
    name: "Repeat-issue analysis",
    desc: "Kick off a full fan-out analysis of repeat tickets.",
    fields: [
      { key: "source", label: "Ticket source", placeholder: "e.g., support queue, CSV export, Slack thread" },
      { key: "timeframe", label: "Timeframe", placeholder: "e.g., last 30 days" },
      { key: "focus", label: "Focus area (optional)", placeholder: "e.g., billing-related, outage-related" },
    ],
    template: (f) => `Use a workflow to analyze repeat tickets from ${f.source || "[ticket source]"} over the ${f.timeframe || "last 30 days"}.${f.focus ? `\n\nFocus on: ${f.focus}` : ""}

For each ticket, classify by:
- Surface symptom (what the user reported)
- Root cause (the actual system issue)
- Preventability (could we have caught this proactively?)

Then cluster by root cause, rank by frequency, and for each cluster:
- Show 2-3 representative examples
- Propose a systemic fix
- Estimate repeat reduction if fixed

Use adversarial verification: have a separate agent re-classify 10% of tickets independently and report agreement rate per cluster.`,
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
    name: "Teaching loop",
    desc: "Deep learning on any topic. Claude won't let you off the hook.",
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

This session should not end until you've verified that I've demonstrated understanding of everything on your checklist.`,
  },
];

// ─── Anthropic learning resources ───────────────────────────────────────────
// Official lessons and references, mapped to the ladder. Shown at the bottom
// of the Ladder view so every phase has an authoritative "go deeper" path.

export interface Resource {
  title: string;
  desc: string;
  url: string;
}

export interface ResourceGroup {
  /** Phase id this group pairs with, or "start" for the pre-Crawl on-ramp. */
  id: string;
  label: string;
  items: Resource[];
}

export const ANTHROPIC_RESOURCES: ResourceGroup[] = [
  {
    id: "start",
    label: "Before you crawl — never used Claude Code?",
    items: [
      {
        title: "Claude Code quickstart",
        desc: "Install Claude Code and run your first session in about ten minutes. Start here if any rep in this app feels unfamiliar.",
        url: "https://docs.claude.com/en/docs/claude-code/quickstart",
      },
      {
        title: "Claude Code overview",
        desc: "What Claude Code is, what it can do, and how it fits into a terminal-first workflow.",
        url: "https://docs.claude.com/en/docs/claude-code/overview",
      },
    ],
  },
  {
    id: "crawl",
    label: "Crawl — learn the fundamentals",
    items: [
      {
        title: "Claude Code: Best practices for agentic coding",
        desc: "Anthropic's engineering-blog post on CLAUDE.md, verification, and workflow habits — the source material behind most of this curriculum.",
        url: "https://www.anthropic.com/engineering/claude-code-best-practices",
      },
      {
        title: "Anthropic Academy",
        desc: "Free self-paced courses from Anthropic, including a dedicated Claude Code course with videos and exercises.",
        url: "https://www.anthropic.com/learn",
      },
    ],
  },
  {
    id: "walk",
    label: "Walk — sharpen prompts and build infrastructure",
    items: [
      {
        title: "Anthropic's interactive prompt engineering tutorial",
        desc: "A hands-on course from the anthropics/courses repo — feeds directly into everything in the Prompt Lab tab.",
        url: "https://github.com/anthropics/courses",
      },
      {
        title: "Prompt engineering guide",
        desc: "The official reference for structuring prompts: being clear and direct, examples, chain-of-thought, and more.",
        url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview",
      },
    ],
  },
  {
    id: "run",
    label: "Run — patterns for agents at scale",
    items: [
      {
        title: "Claude Cookbook",
        desc: "Runnable recipes for agent patterns — tool use, orchestration, and the fan-out workflows the Run phase is built on.",
        url: "https://github.com/anthropics/claude-cookbooks",
      },
      {
        title: "Building effective agents",
        desc: "Anthropic's guide to agent architectures: when to use workflows vs. agents, and the patterns that actually work in production.",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
      },
    ],
  },
];
