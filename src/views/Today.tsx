import { useState } from "react";
import { PHASES, type Rep } from "../data";
import type { Store } from "../store";
import { Heatmap } from "../components/Heatmap";

const LOOP_STEPS = [
  { label: "Claude makes a mistake", color: "var(--alert)" },
  { label: 'You say "update CLAUDE.md"', color: "var(--crawl)" },
  { label: "Claude writes a rule for itself", color: "var(--walk)" },
  { label: "Next session starts smarter", color: "var(--run)" },
  { label: "Mistake rate drops", color: "var(--accent)" },
];

function RepCard({ rep, done, onToggle }: { rep: Rep; done: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rep-card${done ? " done" : ""}`}>
      <button
        className="rep-check"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Mark "${rep.text}" as not done` : `Mark "${rep.text}" as done`}
      >
        ✓
      </button>
      <div>
        <button className="rep-main" onClick={onToggle} aria-pressed={done} tabIndex={-1}>
          <span className="rep-text">{rep.text}</span>
          <span className="rep-why" style={{ display: "block" }}>{rep.why}</span>
        </button>
        <div className="rep-foot">
          <span className="rep-habit">{rep.habit}</span>
          <button
            className="guide-toggle"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Hide the steps" : "Show me how"} <span className="caret">▾</span>
          </button>
        </div>
        {open && (
          <div className="guide-body">
            <ol>
              {rep.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {rep.docs && (
              <a className="guide-docs" href={rep.docs.url} target="_blank" rel="noreferrer">
                {rep.docs.label} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Today({ store, onShare }: { store: Store; onShare: () => void }) {
  const phase = PHASES[store.currentStage];
  const doneToday = store.todayReps.filter((r) => store.todayDone.has(r.id)).length;
  const allDone = doneToday === store.todayReps.length;

  const nextMilestone = phase.milestones.find((m) => !store.progress.milestones[m.id]);

  return (
    <div className="view">
      <div>
        <div className="view-kicker">{phase.label} phase · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="view-title">
          Today's <em>reps</em>
        </h1>
        <p className="view-lede">
          A <em>rep</em> is one small, concrete action — like a repetition at the gym — that you
          do inside your normal work today. You get three each morning, drawn from your current
          phase. Check one off when it's done; the habit is the workflow, not this app.
        </p>
      </div>

      <div className="help-panel">
        <span className="help-panel-glyph" aria-hidden>?</span>
        <span>
          <strong>Not sure how to do one of these?</strong> Every rep has a{" "}
          <em>Show me how</em> link with step-by-step instructions and a link to the official
          docs. No prior Claude Code experience is assumed — if a step still doesn't make
          sense, start with the{" "}
          <a href="https://docs.claude.com/en/docs/claude-code/quickstart" target="_blank" rel="noreferrer">
            Claude Code quickstart
          </a>.
        </span>
      </div>

      <div className="stat-strip">
        <div className="stat stat-share">
          <div className="stat-value signal">{store.streak}</div>
          <div className="stat-label">day streak</div>
          <button className="stat-share-btn" onClick={onShare} aria-label="Share streak card" title="Share streak card">
            ↗
          </button>
        </div>
        <div className="stat">
          <div className="stat-value">{doneToday}/{store.todayReps.length}</div>
          <div className="stat-label">reps today</div>
        </div>
        <div className="stat">
          <div className="stat-value">{store.totalReps}</div>
          <div className="stat-label">total reps</div>
        </div>
        <div className="stat">
          <div className="stat-value">{store.doneMilestones}/{store.totalMilestones}</div>
          <div className="stat-label">milestones</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {store.todayReps.map((rep) => (
          <RepCard
            key={rep.id}
            rep={rep}
            done={store.todayDone.has(rep.id)}
            onToggle={() => store.toggleRep(rep.id)}
          />
        ))}
        {allDone && (
          <div className="day-complete">
            ▞ Day logged. {store.streak} in a row — same time tomorrow. New reps at midnight.
          </div>
        )}
      </div>

      <div className="section-label">practice log</div>
      <Heatmap days={store.progress.days} />

      {nextMilestone && (
        <>
          <div className="section-label">next milestone</div>
          <div className="milestone">
            <button
              className="milestone-check"
              onClick={() => store.toggleMilestone(nextMilestone.id)}
              aria-label={`Mark milestone "${nextMilestone.text}" complete`}
              title="Mark complete"
            >
              ✓
            </button>
            <div>
              <div className="milestone-main" style={{ cursor: "default" }}>
                <span className="milestone-text">{nextMilestone.text}</span>
                <span className="habit-chip">{nextMilestone.habit}</span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 15, color: "var(--ink-2)" }}>
                Milestones are one-time proofs that a habit exists — see the full ladder (and
                how-to steps for each) in the <strong>ladder</strong> tab.
              </p>
            </div>
          </div>
        </>
      )}

      <div className="panel loop-panel">
        <h2 className="loop-title">The compounding loop</h2>
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
          ↻ This is the entire system. Every rep exists to make this loop spin faster.
        </div>
      </div>
    </div>
  );
}
