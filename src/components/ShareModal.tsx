import { useEffect, useMemo, useRef, useState } from "react";
import { drawStreakCard, drawCertCard, type Accent, type CardData, type CertCardData } from "../canvasCard";
import { ALUMNI_CERT, CERTS, type CertInfo } from "../data";
import type { Store } from "../store";

export type ShareTarget = { kind: "streak" } | { kind: "cert"; phaseId: string };

type RenderState = "rendering" | "ready";

interface CertLevel {
  phaseId: string; // 'crawl' | 'walk' | 'run' | 'alumni'
  label: string;
  color: Accent;
  done: number;
  total: number;
  earned: boolean;
  earnedDate: string | null;
  info: CertInfo;
}

export function ShareModal({ store, initial, onClose }: { store: Store; initial: ShareTarget; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<"streak" | "cert">(initial.kind);

  const levels: CertLevel[] = useMemo(
    () => [
      ...store.certs.map((c) => ({
        phaseId: c.phaseId,
        label: c.label,
        color: c.color as Accent,
        done: c.done,
        total: c.total,
        earned: c.earned,
        earnedDate: c.earnedDate,
        info: CERTS[c.phaseId],
      })),
      {
        phaseId: "alumni",
        label: "All Phases",
        color: store.stageStats.map((s) => s.color) as Accent,
        done: store.alumni.done,
        total: store.alumni.total,
        earned: store.alumni.earned,
        earnedDate: store.alumni.earnedDate,
        info: ALUMNI_CERT,
      },
    ],
    [store.certs, store.alumni, store.stageStats],
  );

  const [certPhase, setCertPhase] = useState<string>(() => {
    if (initial.kind === "cert") return initial.phaseId;
    // Default to the most advanced earned certification, or the first phase.
    const earned = [...levels].reverse().find((l) => l.earned);
    return earned?.phaseId ?? levels[0].phaseId;
  });

  const [state, setState] = useState<RenderState>("rendering");
  const [copyLabel, setCopyLabel] = useState("Copy image");
  const [postLabel, setPostLabel] = useState("Copy post text");

  const canShareFiles = typeof navigator !== "undefined" && !!navigator.canShare;
  const canWriteClipboard = typeof window !== "undefined" && "ClipboardItem" in window;

  const level = levels.find((l) => l.phaseId === certPhase) ?? levels[0];
  const certLocked = tab === "cert" && !level.earned;
  const isAlumni = level.phaseId === "alumni";

  const streakData: CardData = useMemo(
    () => ({
      streak: store.streak,
      totalReps: store.totalReps,
      activeDays: store.activeDays,
      doneMilestones: store.doneMilestones,
      totalMilestones: store.totalMilestones,
      phaseLabel: store.stageStats[store.currentStage].label,
      phaseColor: store.stageStats[store.currentStage].color,
      days: store.progress.days,
    }),
    [store],
  );

  const certData: CertCardData | null = useMemo(() => {
    if (!level.earned || !level.earnedDate) return null;
    return {
      name: store.progress.name ?? "",
      title: level.info.title,
      subtitle: level.info.subtitle,
      phaseLabel: level.label,
      phaseColor: level.color,
      milestoneCount: level.total,
      earnedDate: level.earnedDate,
      completionText: isAlumni
        ? `All ${level.total} milestones complete across Crawl, Walk, and Run · ${new Date(
            `${level.earnedDate}T00:00:00`,
          ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
        : undefined,
      sealLabel: isAlumni ? "GRADUATE" : undefined,
    };
  }, [level, isAlumni, store.progress.name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (tab === "cert" && !certData) return; // locked view has no canvas
    setState("rendering");
    const draw = tab === "streak" ? drawStreakCard(canvas, streakData) : drawCertCard(canvas, certData!);
    let cancelled = false;
    draw.then(() => {
      if (!cancelled) setState("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [tab, streakData, certData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => canvasRef.current?.toBlob((b) => resolve(b), "image/png"));

  const filename =
    tab === "streak"
      ? `workflow-companion-streak-${store.streak}.png`
      : `workflow-companion-certificate-${level.info.title.toLowerCase().replace(/\s+/g, "-")}.png`;

  // A link back into the app itself, carrying enough context for a referral banner.
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#${tab === "streak" ? `day-${store.streak}` : `cert-${level.phaseId}`}`
      : "";

  const postText =
    tab === "streak"
      ? `Day ${store.streak} of building agentic engineering habits with AI Workflow Companion — ${store.totalReps} reps in, ${store.doneMilestones}/${store.totalMilestones} milestones. Part of the Spec Before You Ship practice series. Start your own streak → ${shareUrl}`
      : `Earned the ${level.info.title} certification in AI Workflow Companion — ${level.info.subtitle}. Part of the Spec Before You Ship practice series. Try it yourself → ${shareUrl}`;

  // Tighter variant for X/Bluesky intents, which count the whole string against a limit.
  const shortText =
    tab === "streak"
      ? `Day ${store.streak} of building agentic engineering habits with AI Workflow Companion. ${shareUrl}`
      : `Just earned the ${level.info.title} certification in AI Workflow Companion. ${shareUrl}`;

  const download = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "AI Workflow Companion", text: postText });
      } catch {
        // user cancelled the share sheet — no-op
      }
    } else {
      download();
    }
  };

  const copyImage = async () => {
    const blob = await getBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy image"), 2000);
    } catch {
      download();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked — fall back to a transient textarea selection.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  const copyPost = async () => {
    await copyToClipboard(postText);
    setPostLabel("Copied!");
    setTimeout(() => setPostLabel("Copy post text"), 2000);
  };

  const shareOnX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}`, "_blank", "noopener,noreferrer");
  };

  const shareOnBluesky = () => {
    window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(shortText)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Share your progress">
        <div className="modal-head">
          <div className="modal-tabs">
            <button className={`filter-chip${tab === "streak" ? " active" : ""}`} onClick={() => setTab("streak")}>
              streak card
            </button>
            <button className={`filter-chip${tab === "cert" ? " active" : ""}`} onClick={() => setTab("cert")}>
              certificate
            </button>
          </div>
          <button className="btn ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {tab === "cert" && (
          <>
            <div className="cert-level-row">
              {levels.map((l) => (
                <button
                  key={l.phaseId}
                  className={`filter-chip${certPhase === l.phaseId ? " active" : ""}`}
                  onClick={() => setCertPhase(l.phaseId)}
                  title={l.earned ? `Earned ${l.earnedDate}` : `${l.done}/${l.total} milestones`}
                >
                  {l.earned ? "◆ " : "◇ "}
                  {l.info.title}
                </button>
              ))}
            </div>
            {!certLocked && (
              <input
                className="prompt-input cert-name-input"
                type="text"
                placeholder="Your name (appears on the certificate)"
                value={store.progress.name ?? ""}
                onChange={(e) => store.setName(e.target.value)}
                aria-label="Name on certificate"
                maxLength={60}
              />
            )}
          </>
        )}

        {certLocked ? (
          <div className="cert-locked">
            <div className="cert-locked-glyph">◇</div>
            <div className="cert-locked-title">
              {level.info.title} — {level.info.subtitle}
            </div>
            <p>
              Complete all {level.total} {isAlumni ? "" : `${level.label} `}milestones to earn this
              certification. You're at {level.done}/{level.total}.
            </p>
          </div>
        ) : (
          <div className="modal-canvas-wrap">
            <canvas ref={canvasRef} className="modal-canvas" />
            {state === "rendering" && <div className="modal-canvas-loading">rendering…</div>}
          </div>
        )}

        {!certLocked && (
          <div className="modal-actions">
            <button className="btn btn-cta" onClick={download} disabled={state !== "ready"}>
              Download PNG
            </button>
            {canShareFiles && (
              <button className="btn" onClick={share} disabled={state !== "ready"}>
                Share…
              </button>
            )}
            {canWriteClipboard && (
              <button className="btn" onClick={copyImage} disabled={state !== "ready"}>
                {copyLabel}
              </button>
            )}
            <button className="btn" onClick={copyPost}>
              {postLabel}
            </button>
            <button className="btn" onClick={shareOnX}>
              Share on X
            </button>
            <button className="btn" onClick={shareOnBluesky}>
              Share on Bluesky
            </button>
          </div>
        )}
        <p className="modal-note">Rendered locally in your browser. Nothing is uploaded.</p>
      </div>
    </div>
  );
}
