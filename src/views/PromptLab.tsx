import { useState } from "react";
import { PROMPTS } from "../data";
import { CopyButton } from "../components/shared";

export function PromptLab() {
  const [expanded, setExpanded] = useState<string | null>(PROMPTS[0].id);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});

  return (
    <div className="view">
      <div>
        <div className="view-kicker">Prompt lab</div>
        <h1 className="view-title">
          Fill → generate → <em>paste</em>
        </h1>
        <p className="view-lede">
          The prompts behind the habits. Fill in the fields to generate a ready-to-paste brief,
          or copy the template with placeholders and adapt it live.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PROMPTS.map((p) => {
          const isOpen = expanded === p.id;
          const vals = values[p.id] ?? {};
          const generated = p.template(vals);
          return (
            <div key={p.id} className={`panel tool-card${isOpen ? " open" : ""}`}>
              <button className="tool-head" onClick={() => setExpanded(isOpen ? null : p.id)} aria-expanded={isOpen}>
                <span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "var(--serif)" }}>{p.name}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
                    {p.desc}
                  </span>
                </span>
                <span className="tool-caret" aria-hidden>▼</span>
              </button>

              {isOpen && (
                <div className="tool-body" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                    {p.fields.map((f) => (
                      <div key={f.key}>
                        <label className="prompt-field-label" htmlFor={`${p.id}-${f.key}`}>
                          {f.label}
                        </label>
                        <input
                          id={`${p.id}-${f.key}`}
                          className="prompt-input"
                          type="text"
                          placeholder={f.placeholder}
                          value={vals[f.key] ?? ""}
                          onChange={(e) =>
                            setValues({ ...values, [p.id]: { ...vals, [f.key]: e.target.value } })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="prompt-output">
                    <div className="prompt-output-bar">
                      <span>generated prompt</span>
                      <CopyButton text={generated} />
                    </div>
                    <pre className="tool-pre">{generated}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
