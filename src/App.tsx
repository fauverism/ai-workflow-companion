import { useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useProgress } from "./store";
import { Landing, type Referral } from "./views/Landing";
import { Today } from "./views/Today";
import { Ladder } from "./views/Ladder";
import { Toolkit } from "./views/Toolkit";
import { PromptLab } from "./views/PromptLab";
import { ShareModal, type ShareTarget } from "./components/ShareModal";

const TABS = [
  { id: "today", label: "today" },
  { id: "ladder", label: "ladder" },
  { id: "toolkit", label: "toolkit" },
  { id: "prompts", label: "prompt lab" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type View = "landing" | TabId;

const ONBOARDED_KEY = "workflow-companion-onboarded";

/** Reads a shared `#day-N` / `#cert-{phaseId}` link so the landing page can show who sent it. */
function parseReferral(hash: string): Referral | null {
  const h = hash.replace(/^#/, "");
  const day = h.match(/^day-(\d+)$/);
  if (day) return { kind: "streak", n: Number(day[1]) };
  const cert = h.match(/^cert-([a-z]+)$/);
  if (cert) return { kind: "cert", phaseId: cert[1] };
  return null;
}

export default function App() {
  const store = useProgress();
  const [referral] = useState<Referral | null>(() => parseReferral(window.location.hash));
  const [view, setView] = useState<View>(() =>
    referral || !localStorage.getItem(ONBOARDED_KEY) ? "landing" : "today",
  );
  const [share, setShare] = useState<ShareTarget | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep the referral context for this visit, but tidy the URL so a later
    // refresh doesn't keep forcing an already-onboarded user back to landing.
    if (referral) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [referral]);

  const begin = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    setView("today");
  };

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(store.progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow-companion-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = (file: File) => {
    file.text().then((text) => {
      if (!store.importData(text)) {
        alert("That file doesn't look like an AI Workflow Companion export.");
      }
    });
  };

  return (
    <div className="shell">
      <header className="masthead">
        <button className="masthead-brand" onClick={() => setView("landing")} aria-label="About AI Workflow Companion">
          <span className="masthead-mark">▞▞</span>
          <span className="masthead-title-group">
            <h1 className="masthead-title">
              AI Workflow <em>Companion</em>
            </h1>
            <span className="masthead-note">Built for Claude Code</span>
          </span>
        </button>
        <span className="masthead-sub">daily reps for agentic engineering</span>
      </header>

      <nav className="nav" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab${view === t.id ? " active" : ""}`}
            onClick={() => setView(t.id)}
            aria-current={view === t.id ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
        <span className="nav-spacer" />
        <button className="nav-streak" title="Share your streak" onClick={() => setShare({ kind: "streak" })}>
          <strong>{store.streak}</strong>
          <span className="streak-word">day{store.streak === 1 ? "" : "s"}</span> ▮
        </button>
      </nav>

      <main>
        {view === "landing" && <Landing onBegin={begin} referral={referral} />}
        {view === "today" && <Today store={store} onShare={() => setShare({ kind: "streak" })} />}
        {view === "ladder" && (
          <Ladder store={store} onClaim={(phaseId) => setShare({ kind: "cert", phaseId })} />
        )}
        {view === "toolkit" && <Toolkit />}
        {view === "prompts" && <PromptLab />}
      </main>

      {share && <ShareModal store={store} initial={share} onClose={() => setShare(null)} />}

      <footer className="site-footer">
        <span className="footer-copy">© {new Date().getFullYear()} Robert Fauver</span>
        <span className="footer-links">
          <a href="mailto:robertfauver@gmail.com">Email</a>
          <a href="https://github.com/fauverism" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/robert-fauver-8018b17b/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://twitter.com/fauverism" target="_blank" rel="noreferrer">
            Twitter
          </a>
          <a href="https://specbeforeyouship.com" target="_blank" rel="noreferrer">
            Spec Before You Ship
          </a>
        </span>
        <span className="footer-note">Progress lives in your browser</span>
      </footer>

      <div className="footer-actions-row">
        <button className="btn ghost" onClick={exportProgress}>
          export
        </button>
        <button className="btn ghost" onClick={() => fileInput.current?.click()}>
          import
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            if (confirm("Reset all progress? This clears your streak, reps, and milestones.")) {
              store.reset();
            }
          }}
        >
          reset
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importProgress(f);
            e.target.value = "";
          }}
        />
      </div>

      <Analytics />
    </div>
  );
}
