import { useMemo, useState } from "react";
import { TOOLKIT } from "../data";
import { CopyButton } from "../components/shared";

export function Toolkit() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const allTags = useMemo(
    () => [...new Set(TOOLKIT.flatMap((c) => c.items.flatMap((i) => i.tags)))].sort(),
    [],
  );

  const q = query.trim().toLowerCase();
  const filtered = TOOLKIT.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (i) =>
        (filter === "all" || i.tags.includes(filter)) &&
        (!q ||
          i.name.toLowerCase().includes(q) ||
          i.label.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q)),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="view">
      <div>
        <div className="view-kicker">Toolkit</div>
        <h1 className="view-title">
          Install the <em>infrastructure</em>
        </h1>
        <p className="view-lede">
          Commands, agents, skills, and hooks — ready to copy into your repo. Each one turns a
          habit you'd have to remember into a file your whole team inherits from git.
        </p>
      </div>

      <input
        className="search-input"
        type="search"
        placeholder="Search the toolkit…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search the toolkit"
      />

      <div className="filter-row">
        <button className={`filter-chip${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
          all
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`filter-chip${filter === tag ? " active" : ""}`}
            onClick={() => setFilter(filter === tag ? "all" : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 13 }}>
          No matches. Try a different search or tag.
        </p>
      )}

      {filtered.map((cat) => (
        <div key={cat.category}>
          <div className="section-label">
            <span style={{ color: "var(--accent)" }}>{cat.icon}</span> {cat.category}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "-4px 0 12px" }}>{cat.desc}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cat.items.map((item) => {
              const isOpen = expanded === item.id;
              return (
                <div key={item.id} className={`panel tool-card${isOpen ? " open" : ""}`}>
                  <button className="tool-head" onClick={() => setExpanded(isOpen ? null : item.id)} aria-expanded={isOpen}>
                    <span>
                      <span className="tool-name">
                        <code>{item.name}</code>
                        {item.label}
                      </span>
                      <span className="tool-tags">
                        {item.tags.map((t) => (
                          <span key={t} className="habit-chip">{t}</span>
                        ))}
                      </span>
                    </span>
                    <span className="tool-caret" aria-hidden>▼</span>
                  </button>
                  {isOpen && (
                    <div className="tool-body">
                      <div className="tool-file-bar">
                        <code>{item.filename}</code>
                        <CopyButton text={item.content} />
                      </div>
                      <pre className="tool-pre">{item.content}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
