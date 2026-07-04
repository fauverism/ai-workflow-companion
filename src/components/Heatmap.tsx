import { buildHeatCells, todayKey } from "../store";

const WEEKS = 16;

/** GitHub-style contribution grid of the last ~16 weeks of practice. */
export function Heatmap({ days }: { days: Record<string, string[]> }) {
  const todayK = todayKey();
  const cells = buildHeatCells(days, WEEKS);

  const level = (n: number) => (n === 0 ? "" : n === 1 ? " l1" : n === 2 ? " l2" : " l3");

  return (
    <div className="panel heatmap-wrap">
      <div className="heatmap" role="img" aria-label="Practice activity over the last 16 weeks">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`heat-cell${level(c.count)}${c.key === todayK ? " today" : ""}`}
            style={c.future ? { opacity: 0.25 } : undefined}
            title={`${c.key}: ${c.count} rep${c.count === 1 ? "" : "s"}`}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>less</span>
        <div className="heat-cell" />
        <div className="heat-cell l1" />
        <div className="heat-cell l2" />
        <div className="heat-cell l3" />
        <span>more — one square per day, {WEEKS} weeks</span>
      </div>
    </div>
  );
}
