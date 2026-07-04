import { useCallback, useEffect, useMemo, useState } from "react";
import { PHASES, REPS, type Rep } from "./data";

const STORAGE_KEY = "workflow-companion-v1";

export interface Progress {
  /** milestone id -> ISO date completed */
  milestones: Record<string, string>;
  /** 'YYYY-MM-DD' -> rep ids completed that day */
  days: Record<string, string[]>;
  /** ISO date of first use, for the "practicing since" line */
  startedAt: string;
  /** display name for certificates */
  name?: string;
}

const EMPTY: Progress = { milestones: {}, days: {}, startedAt: "" };

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, startedAt: new Date().toISOString() };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      milestones: parsed.milestones ?? {},
      days: parsed.days ?? {},
      startedAt: parsed.startedAt || new Date().toISOString(),
      name: parsed.name,
    };
  } catch {
    return { ...EMPTY, startedAt: new Date().toISOString() };
  }
}

export interface HeatCell {
  key: string;
  count: number;
  future: boolean;
}

/** GitHub-style daily cells for the last `weeks` weeks, ending on the current week's Saturday. */
export function buildHeatCells(days: Record<string, string[]>, weeks: number, now = new Date()): HeatCell[] {
  const todayK = todayKey(now);
  const end = new Date(now);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const cells: HeatCell[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = todayKey(cursor);
    cells.push({ key, count: days[key]?.length ?? 0, future: key > todayK });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

/** Consecutive days with at least one rep, ending today or yesterday. */
export function computeStreak(days: Record<string, string[]>, now = new Date()): number {
  const active = (key: string) => (days[key]?.length ?? 0) > 0;
  const cursor = new Date(now);
  // A streak survives until the end of today, so start counting from today
  // if it's active, otherwise from yesterday.
  if (!active(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Deal 3 reps for a given date from the phase's pool, rotating daily. */
export function dealReps(phaseId: string, dateKey: string): Rep[] {
  const pool = REPS[phaseId] ?? REPS.crawl;
  // Simple deterministic seed from the date string so the deal is stable
  // all day and different tomorrow.
  let seed = 0;
  for (const ch of dateKey) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const start = seed % pool.length;
  const step = (seed % (pool.length - 1)) + 1;
  const dealt: Rep[] = [];
  const used = new Set<number>();
  let i = start;
  while (dealt.length < 3 && used.size < pool.length) {
    if (!used.has(i)) {
      used.add(i);
      dealt.push(pool[i]);
    }
    i = (i + step) % pool.length;
    // step may cycle through a subgroup; fall back to linear scan
    if (used.has(i)) i = (i + 1) % pool.length;
  }
  return dealt;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // storage full or unavailable — app still works for the session
    }
  }, [progress]);

  const toggleMilestone = useCallback((id: string) => {
    setProgress((p) => {
      const milestones = { ...p.milestones };
      if (milestones[id]) delete milestones[id];
      else milestones[id] = todayKey();
      return { ...p, milestones };
    });
  }, []);

  const toggleRep = useCallback((repId: string) => {
    setProgress((p) => {
      const key = todayKey();
      const done = new Set(p.days[key] ?? []);
      if (done.has(repId)) done.delete(repId);
      else done.add(repId);
      const days = { ...p.days };
      if (done.size === 0) delete days[key];
      else days[key] = [...done];
      return { ...p, days };
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({ ...EMPTY, startedAt: new Date().toISOString() });
  }, []);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<Progress>;
      if (typeof parsed !== "object" || parsed === null) return false;
      setProgress({
        milestones: parsed.milestones ?? {},
        days: parsed.days ?? {},
        startedAt: parsed.startedAt || new Date().toISOString(),
        name: parsed.name,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const setName = useCallback((name: string) => {
    setProgress((p) => ({ ...p, name: name || undefined }));
  }, []);

  const derived = useMemo(() => {
    const stageStats = PHASES.map((s) => {
      const done = s.milestones.filter((m) => progress.milestones[m.id]).length;
      return { ...s, done, total: s.milestones.length, pct: done / s.milestones.length };
    });
    const currentStage = stageStats[0].pct < 1 ? 0 : stageStats[1].pct < 1 ? 1 : 2;
    const totalMilestones = stageStats.reduce((n, s) => n + s.total, 0);
    const doneMilestones = stageStats.reduce((n, s) => n + s.done, 0);
    const streak = computeStreak(progress.days);
    const totalReps = Object.values(progress.days).reduce((n, r) => n + r.length, 0);
    const activeDays = Object.keys(progress.days).length;
    const today = todayKey();
    const todayReps = dealReps(PHASES[currentStage].id, today);
    const todayDone = new Set(progress.days[today] ?? []);
    // A phase's certification is earned when every milestone in it is done;
    // the earned date is the day the last milestone landed.
    const certs = stageStats.map((s) => ({
      phaseId: s.id,
      label: s.label,
      color: s.color,
      done: s.done,
      total: s.total,
      earned: s.done === s.total,
      earnedDate:
        s.done === s.total
          ? s.milestones.map((m) => progress.milestones[m.id]).sort().at(-1) ?? null
          : null,
    }));
    // The capstone: every milestone across every phase, done.
    const allMilestoneDates = PHASES.flatMap((s) => s.milestones.map((m) => progress.milestones[m.id]));
    const alumniEarned = totalMilestones > 0 && doneMilestones === totalMilestones;
    const alumni = {
      earned: alumniEarned,
      done: doneMilestones,
      total: totalMilestones,
      earnedDate: alumniEarned ? allMilestoneDates.filter(Boolean).sort().at(-1) ?? null : null,
    };
    return {
      stageStats,
      currentStage,
      totalMilestones,
      doneMilestones,
      streak,
      totalReps,
      activeDays,
      todayReps,
      todayDone,
      certs,
      alumni,
    };
  }, [progress]);

  return { progress, ...derived, toggleMilestone, toggleRep, reset, importData, setName };
}

export type CertStatus = ReturnType<typeof useProgress>["certs"][number];

export type Store = ReturnType<typeof useProgress>;
