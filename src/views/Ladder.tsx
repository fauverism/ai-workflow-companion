import { useState } from "react";
import { ALUMNI_CERT, ANTHROPIC_RESOURCES, CERTS, PHASES, type Milestone } from "../data";
import type { Store } from "../store";
import { ProgressRing } from "../components/shared";

const PHASE_GUIDE: Record<string, string> = {
  crawl:
    "Start here. These six habits are the foundation everything else builds on — do them in any order, but don't skip ahead until they feel automatic.",
  walk:
    "Once the foundations are reflexes, turn them into infrastructure: commands, agents, and hooks that live in git so the habits run themselves.",
  run:
    "The end state: you direct a fleet of agents instead of driving one. These milestones are about scale, automation, and bringing your team along.",
};

function MilestoneRow({
  milestone,
  phaseColor,
  doneDate,
  onToggle,
}: {
  milestone: Milestone;
  phaseColor: string;
  doneDate: string | undefined;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="milestone"
      style={
        doneDate
          ? {
              background: `color-mix(in srgb, ${phaseColor} 7%, var(--surface))`,
              borderColor: `color-mix(in srgb, ${phaseColor} 30%, var(--border))`,
            }
          : undefined
      }
    >
      <button
        className="milestone-check"
        onClick={onToggle}
        aria-pressed={!!doneDate}
        aria-label={doneDate ? `Mark "${milestone.text}" as not done` : `Mark "${milestone.text}" as done`}
        style={doneDate ? { background: phaseColor, borderColor: phaseColor, color: "var(--bg)" } : undefined}
      >
        ✓
      </button>
      <div>
        <button className="milestone-main" onClick={onToggle} aria-pressed={!!doneDate} tabIndex={-1}>
          <span
            className="milestone-text"
            style={doneDate ? { color: "var(--ink-3)", textDecoration: "line-through" } : undefined}
          >
            {milestone.text}
          </span>
          <span className="milestone-meta">
            {doneDate && <span className="milestone-date">{doneDate}</span>}
            <span className="habit-chip">{milestone.habit}</span>
          </span>
        </button>
        <div className="milestone-foot">
          <button className="guide-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Hide the steps" : "How do I do this?"} <span className="caret">▾</span>
          </button>
        </div>
        {open && (
          <div className="guide-body">
            <ol>
              {milestone.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {milestone.docs && (
              <a className="guide-docs" href={milestone.docs.url} target="_blank" rel="noreferrer">
                {milestone.docs.label} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Ladder({ store, onClaim }: { store: Store; onClaim: (phaseId: string) => void }) {
  return (
    <div className="view">
      <div>
        <div className="view-kicker">Maturity ladder</div>
        <h1 className="view-title">
          Crawl. Walk. <em>Run.</em>
        </h1>
        <p className="view-lede">
          The ladder is your map from “I prompt an AI sometimes” to “I run a fleet of agents.”
          Each milestone is a one-time proof that a habit exists. Check it off when you've
          genuinely done it — it saves with the date, so the ladder doubles as a record of when
          each capability landed.
        </p>
      </div>

      <div className="help-panel">
        <span className="help-panel-glyph" aria-hidden>?</span>
        <span>
          <strong>New to this?</strong> Work top to bottom, starting with Crawl. Every
          milestone has a <em>How do I do this?</em> link with concrete steps and official
          docs — open it before you attempt one. Finish a whole phase and you can claim its
          certificate.
        </span>
      </div>

      <div className="phase-grid">
        {store.stageStats.map((s, i) => (
          <div
            key={s.id}
            className={`panel phase-card${i === store.currentStage ? "" : " dormant"}`}
            style={i === store.currentStage ? { borderColor: `color-mix(in srgb, ${s.color} 45%, var(--border))` } : undefined}
          >
            <ProgressRing pct={s.pct} color={s.color} />
            <div>
              <div style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: s.color }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink-3)" }}>
                {s.done}/{s.total} milestones
              </div>
            </div>
          </div>
        ))}
      </div>

      {PHASES.map((phase, pi) => {
        const cert = store.certs.find((c) => c.phaseId === phase.id);
        return (
        <div key={phase.id} style={{ marginBottom: 30, opacity: pi <= store.currentStage ? 1 : 0.55 }}>
          <div className="phase-desc-block">
            <div className="section-label" style={{ color: phase.color, margin: "0 0 6px" }}>
              {phase.label} — {phase.desc}
            </div>
            <p>{PHASE_GUIDE[phase.id]}</p>
          </div>
          {cert?.earned && (
            <button
              className="cert-claim"
              style={{
                color: phase.color,
                borderColor: `color-mix(in srgb, ${phase.color} 40%, var(--border))`,
                background: `color-mix(in srgb, ${phase.color} 7%, var(--surface))`,
              }}
              onClick={() => onClaim(phase.id)}
            >
              ◆ Phase complete — claim your {CERTS[phase.id].title} certificate →
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {phase.milestones.map((m) => (
              <MilestoneRow
                key={m.id}
                milestone={m}
                phaseColor={phase.color}
                doneDate={store.progress.milestones[m.id]}
                onToggle={() => store.toggleMilestone(m.id)}
              />
            ))}
          </div>
        </div>
        );
      })}

      {store.alumni.earned && (
        <button className="cert-claim cert-claim-alumni" onClick={() => onClaim("alumni")}>
          ◆ All phases complete — claim your {ALUMNI_CERT.title} certificate →
        </button>
      )}

      <div className="section-label">go deeper — official lessons from Anthropic</div>
      <p style={{ fontSize: 15.5, color: "var(--ink-2)", margin: "0 0 16px", maxWidth: "62ch" }}>
        This app builds the habit; these teach the material. Each group pairs with a phase of
        the ladder — if a milestone feels over your head, its phase's resources are the place
        to start.
      </p>
      {ANTHROPIC_RESOURCES.map((group) => (
        <div key={group.id} style={{ marginBottom: 18 }}>
          <div className="resource-group-label">{group.label}</div>
          <div className="resource-list">
            {group.items.map((r) => (
              <a key={r.url} className="resource-row" href={r.url} target="_blank" rel="noreferrer">
                <span>
                  <span className="resource-title">{r.title}</span>
                  <span className="resource-desc">{r.desc}</span>
                </span>
                <span className="resource-arrow" aria-hidden>↗</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
