import { ALUMNI_CERT, CERTS } from "../data";

export type Referral = { kind: "streak"; n: number } | { kind: "cert"; phaseId: string };

function referralText(referral: Referral): string {
  if (referral.kind === "streak") {
    return `A friend is on day ${referral.n} of their streak. Ready to start yours?`;
  }
  const info = referral.phaseId === "alumni" ? ALUMNI_CERT : CERTS[referral.phaseId];
  if (!info) return "A friend shared their practice progress. Ready to start yours?";
  return `A friend just earned the ${info.title} certification. Ready to earn yours?`;
}

const QUALIFY = [
  "You've read the lessons and you already believe spec beats vibes — you just haven't made it automatic yet.",
  "You've watched Claude drift on a Friday afternoon and want a system for it, not more willpower on Monday.",
  "You want your team running your workflow, not just watching you run it.",
];

const CURRICULUM = [
  {
    n: "01",
    title: "Today",
    desc: "Three reps a day, dealt from your current phase. Small enough to do inside real work, specific enough to actually change what you do.",
  },
  {
    n: "02",
    title: "Ladder",
    desc: "Crawl, Walk, Run. Eighteen milestones, each one a one-time proof that a habit exists — and the date you proved it.",
  },
  {
    n: "03",
    title: "Toolkit",
    desc: "Commands, agents, skills, and hooks, ready to copy into .claude/. Infrastructure your team inherits from git, not tribal knowledge.",
  },
  {
    n: "04",
    title: "Prompt Lab",
    desc: "The prompts behind the habits — fill in the blanks, generate, paste. The delegation brief, the correction, the adversarial review.",
  },
];

const LOOP_STEPS = [
  { label: "Claude makes a mistake", color: "var(--alert)" },
  { label: 'You say "update CLAUDE.md"', color: "var(--crawl)" },
  { label: "Claude writes a rule for itself", color: "var(--walk)" },
  { label: "Next session starts smarter", color: "var(--run)" },
  { label: "Mistake rate drops", color: "var(--accent)" },
];

export function Landing({ onBegin, referral }: { onBegin: () => void; referral: Referral | null }) {
  return (
    <div className="view landing">
      {referral && (
        <div className="referral-banner">
          <span className="referral-glyph">👋</span>
          {referralText(referral)}
        </div>
      )}
      <div className="landing-hero">
        <div className="view-kicker">spec before you ship · practice module</div>
        <h1 className="view-title landing-title">
          You know the workflow.
          <br />
          <em>Now make it a habit.</em>
        </h1>
        <p className="view-lede landing-lede">
          The lessons taught you spec-first, agentic development. Knowing it and doing it under
          a deadline are different skills. This is the second one — daily reps, a maturity
          ladder, and the exact files and prompts that turn a technique into muscle memory.
        </p>
        <button className="btn btn-cta" onClick={onBegin}>
          Begin day one →
        </button>
      </div>

      <div className="section-label">who this is for</div>
      <ul className="qualify-list">
        {QUALIFY.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>

      <div className="section-label">how it works</div>
      <div className="curriculum">
        {CURRICULUM.map((c) => (
          <div key={c.n} className="curriculum-item">
            <span className="curriculum-num">{c.n}</span>
            <div>
              <div className="curriculum-title">{c.title}</div>
              <div className="curriculum-desc">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel loop-panel">
        <h2 className="loop-title">The premise</h2>
        <div className="loop-flow">
          {LOOP_STEPS.map((s, i) => (
            <span key={s.label} style={{ display: "contents" }}>
              {i > 0 && <span className="loop-arrow">→</span>}
              <span
                className="loop-step"
                style={{
                  color: s.color,
                  borderColor: `color-mix(in srgb, ${s.color} 35%, transparent)`,
                  background: `color-mix(in srgb, ${s.color} 8%, transparent)`,
                }}
              >
                {s.label}
              </span>
            </span>
          ))}
        </div>
        <div className="loop-note">
          ↻ Every rep, milestone, and command in this app exists to make this loop spin faster.
        </div>
      </div>

      <div className="landing-footer-cta">
        <button className="btn btn-cta" onClick={onBegin}>
          Begin day one →
        </button>
        <span>
          Skipped a lesson?{" "}
          <a href="https://specbeforeyouship.com" target="_blank" rel="noreferrer">
            Start at specbeforeyouship.com
          </a>
        </span>
      </div>
    </div>
  );
}
