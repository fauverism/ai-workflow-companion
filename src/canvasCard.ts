import { buildHeatCells } from "./store";

export interface CardData {
  streak: number;
  totalReps: number;
  activeDays: number;
  doneMilestones: number;
  totalMilestones: number;
  phaseLabel: string;
  phaseColor: string;
  days: Record<string, string[]>;
}

const W = 1200;
const H = 630;
const SCALE = 2;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** A single hex color, or a list of colors to blend into a gradient (for the capstone card). */
export type Accent = string | string[];

function accentStyle(
  ctx: CanvasRenderingContext2D,
  accent: Accent,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): string | CanvasGradient {
  if (typeof accent === "string") return accent;
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  accent.forEach((c, i) => g.addColorStop(i / Math.max(accent.length - 1, 1), c));
  return g;
}

function fillTextTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
}

function measureTracked(ctx: CanvasRenderingContext2D, text: string, tracking: number): number {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tracking;
  return w - (text.length > 0 ? tracking : 0);
}

function fillTextTrackedCentered(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, tracking: number) {
  fillTextTracked(ctx, text, cx - measureTracked(ctx, text, tracking) / 2, y, tracking);
}

async function loadFonts() {
  await Promise.all([
    document.fonts.load("600 220px 'Source Serif 4'"),
    document.fonts.load("italic 600 40px 'Source Serif 4'"),
    document.fonts.load("italic 500 22px 'Source Serif 4'"),
    document.fonts.load("600 30px 'Source Serif 4'"),
    document.fonts.load("700 15px 'Google Sans Code'"),
    document.fonts.load("600 22px 'Google Sans Code'"),
    document.fonts.load("500 20px 'Google Sans Code'"),
  ]);
  await document.fonts.ready;
}

interface Palette {
  ink: string;
  panel: string;
  line: string;
  paper: string;
  paperDim: string;
  paperFaint: string;
  signal: string;
}

/* Share cards render on the Fauverism "dark band" (see the signup section on
   specbeforeyouship.com): near-black warm ground, cream text, orange accent.
   Fixed values — the page itself is light, so we don't read the CSS vars. */
function getPalette(): Palette {
  return {
    ink: cssVar("--dark") || "#18171a",
    panel: "#242229",
    line: "#332f3e",
    paper: "#f0ede8",
    paperDim: "#c3c2b1",
    paperFaint: "#8a8780",
    signal: "#e09468",
  };
}

function prepareCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(SCALE, SCALE);
  return ctx;
}

/** Ink background with the app's faint blueprint grid. Glow(s) painted separately. */
function drawBackdrop(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = hexToRgba(p.line, 0.35);
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
}

/** A single soft radial glow centered at (gx, gy). */
function drawGlow(ctx: CanvasRenderingContext2D, gx: number, gy: number, color: string, alpha = 0.16) {
  const glow = ctx.createRadialGradient(gx, gy, 20, gx, gy, 340);
  glow.addColorStop(0, hexToRgba(color, alpha));
  glow.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

/** Several overlapping soft glows, spread horizontally around cx — for multi-accent cards. */
function drawTriGlow(ctx: CanvasRenderingContext2D, colors: string[], cy: number) {
  const spread = 220;
  const step = colors.length > 1 ? (spread * 2) / (colors.length - 1) : 0;
  colors.forEach((c, i) => drawGlow(ctx, W / 2 - spread + i * step, cy, c, 0.12));
}

/** Draws the shareable streak card onto `canvas` at 2x resolution for crisp export. */
export async function drawStreakCard(canvas: HTMLCanvasElement, data: CardData): Promise<void> {
  await loadFonts();

  const ctx = prepareCanvas(canvas);
  if (!ctx) return;

  const p = getPalette();
  const { panel, line, paper, paperDim, paperFaint, signal } = p;

  drawBackdrop(ctx, p);
  drawGlow(ctx, 220, 300, signal);

  // Brand mark, top-left
  ctx.fillStyle = signal;
  ctx.font = "700 20px 'Google Sans Code'";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("▞▞", 64, 76);
  ctx.fillStyle = paperFaint;
  ctx.font = "600 13px 'Google Sans Code'";
  fillTextTracked(ctx, "AI WORKFLOW COMPANION", 104, 74, 1.6);

  // Phase pill, top-right
  const phaseText = `${data.phaseLabel.toUpperCase()} PHASE`;
  ctx.font = "600 13px 'Google Sans Code'";
  const phaseW = ctx.measureText(phaseText).width + 32 + phaseText.length * 1.6;
  const pillX = W - 64 - phaseW;
  ctx.fillStyle = hexToRgba(data.phaseColor, 0.12);
  ctx.strokeStyle = hexToRgba(data.phaseColor, 0.4);
  ctx.lineWidth = 1;
  roundRect(ctx, pillX, 52, phaseW, 30, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = data.phaseColor;
  fillTextTracked(ctx, phaseText, pillX + 16, 72, 1.6);

  // Big streak number
  const digits = String(data.streak).length;
  const numSize = digits <= 2 ? 220 : digits === 3 ? 172 : 138;
  ctx.fillStyle = signal;
  ctx.font = `600 ${numSize}px 'Source Serif 4'`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(data.streak), 60, 340);

  ctx.fillStyle = paper;
  ctx.font = "700 26px 'Google Sans Code'";
  fillTextTracked(ctx, "DAY STREAK", 66, 380, 3);

  ctx.fillStyle = paperDim;
  ctx.font = "italic 600 26px 'Source Serif 4'";
  ctx.fillText(
    data.streak === 0 ? "Starting today." : `${data.activeDays} days of practice, and counting.`,
    66,
    420,
  );

  // Mini practice heatmap, right column
  const cells = buildHeatCells(data.days, 13);
  const cell = 15;
  const gap = 4;
  const cols = Math.ceil(cells.length / 7);
  const gridW = cols * (cell + gap) - gap;
  const gridX = W - 64 - gridW;
  const gridY = 150;

  ctx.fillStyle = paperFaint;
  ctx.font = "600 12px 'Google Sans Code'";
  fillTextTracked(ctx, "PRACTICE LOG", gridX, gridY - 16, 1.4);

  const levelColor = (n: number) => (n === 0 ? panel : n === 1 ? "#5a3a22" : n === 2 ? "#a86b3c" : signal);
  cells.forEach((c, i) => {
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = gridX + col * (cell + gap);
    const y = gridY + row * (cell + gap);
    ctx.globalAlpha = c.future ? 0.25 : 1;
    ctx.fillStyle = levelColor(c.count);
    roundRect(ctx, x, y, cell, cell, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Stat chips, bottom row
  const stats = [
    { label: "TOTAL REPS", value: String(data.totalReps) },
    { label: "MILESTONES", value: `${data.doneMilestones}/${data.totalMilestones}` },
    { label: "ACTIVE DAYS", value: String(data.activeDays) },
  ];
  const chipGap = 16;
  const chipW = (W - 128 - chipGap * 2) / 3;
  const chipY = 470;
  const chipH = 84;
  stats.forEach((s, i) => {
    const x = 64 + i * (chipW + chipGap);
    ctx.fillStyle = hexToRgba(panel, 1);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    roundRect(ctx, x, chipY, chipW, chipH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = paper;
    ctx.font = "600 32px 'Source Serif 4'";
    ctx.fillText(s.value, x + 20, chipY + 44);

    ctx.fillStyle = paperFaint;
    ctx.font = "600 11px 'Google Sans Code'";
    fillTextTracked(ctx, s.label, x + 20, chipY + 66, 1.2);
  });

  // Footer
  ctx.strokeStyle = line;
  ctx.beginPath();
  ctx.moveTo(64, 590);
  ctx.lineTo(W - 64, 590);
  ctx.stroke();

  ctx.fillStyle = paperFaint;
  ctx.font = "500 14px 'Google Sans Code'";
  ctx.fillText("Daily reps for agentic engineering", 64, 615);

  ctx.textAlign = "right";
  ctx.fillStyle = paperDim;
  ctx.fillText("Part of Spec Before You Ship — specbeforeyouship.com", W - 64, 615);
  ctx.textAlign = "left";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ─── Certificate card ───────────────────────────────────────────────────────

export interface CertCardData {
  name: string;
  title: string;
  subtitle: string;
  phaseLabel: string;
  phaseColor: Accent;
  milestoneCount: number;
  earnedDate: string; // YYYY-MM-DD
  /** Overrides the default "All N {phaseLabel} milestones complete" line. */
  completionText?: string;
  /** Overrides the phase-label text under the seal. */
  sealLabel?: string;
}

function formatDate(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Draws the certification card onto `canvas` at 2x resolution for crisp export. */
export async function drawCertCard(canvas: HTMLCanvasElement, data: CertCardData): Promise<void> {
  await loadFonts();

  const ctx = prepareCanvas(canvas);
  if (!ctx) return;

  const p = getPalette();
  const { line, paper, paperDim, paperFaint, signal } = p;
  const accent = data.phaseColor;
  const isBlend = Array.isArray(accent);
  const cx = W / 2;

  drawBackdrop(ctx, p);
  if (isBlend) drawTriGlow(ctx, accent, 260);
  else drawGlow(ctx, cx, 260, accent);

  // Double border frame, accent-tinted
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = accentStyle(ctx, accent, 28, 0, W - 28, 0);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.restore();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Corner ticks on the outer frame
  ctx.strokeStyle = accentStyle(ctx, accent, 28, 0, W - 28, 0);
  ctx.lineWidth = 2;
  const tick = 14;
  for (const [tx, ty, dx, dy] of [
    [28, 28, 1, 1],
    [W - 28, 28, -1, 1],
    [28, H - 28, 1, -1],
    [W - 28, H - 28, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(tx + dx * tick, ty);
    ctx.lineTo(tx, ty);
    ctx.lineTo(tx, ty + dy * tick);
    ctx.stroke();
  }

  // Masthead
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = signal;
  ctx.font = "700 18px 'Google Sans Code'";
  fillTextTrackedCentered(ctx, "▞▞", cx, 96, 2);
  ctx.fillStyle = paperFaint;
  ctx.font = "600 13px 'Google Sans Code'";
  fillTextTrackedCentered(ctx, "AI WORKFLOW COMPANION · CERTIFICATE OF PRACTICE", cx, 126, 2);

  // Title + subtitle
  ctx.fillStyle = accentStyle(ctx, accent, cx - 260, 0, cx + 260, 0);
  ctx.font = "italic 600 76px 'Source Serif 4'";
  ctx.textAlign = "center";
  ctx.fillText(data.title, cx, 216);
  ctx.textAlign = "left";

  ctx.fillStyle = paperDim;
  ctx.font = "italic 500 22px 'Source Serif 4'";
  ctx.textAlign = "center";
  ctx.fillText(data.subtitle, cx, 252);
  ctx.textAlign = "left";

  // Awarded to
  ctx.fillStyle = paperFaint;
  ctx.font = "600 12px 'Google Sans Code'";
  fillTextTrackedCentered(ctx, "AWARDED TO", cx, 316, 2.4);

  const name = data.name.trim();
  ctx.textAlign = "center";
  if (name) {
    ctx.fillStyle = paper;
    ctx.font = "600 48px 'Source Serif 4'";
    ctx.fillText(name, cx, 378);
  } else {
    ctx.fillStyle = paperFaint;
    ctx.font = "italic 500 34px 'Source Serif 4'";
    ctx.fillText("add your name to personalize", cx, 372);
  }
  ctx.textAlign = "left";

  // Rule under the name
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = accentStyle(ctx, accent, cx - 210, 0, cx + 210, 0);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 210, 404);
  ctx.lineTo(cx + 210, 404);
  ctx.stroke();
  ctx.restore();

  // Completion line
  ctx.fillStyle = paperDim;
  ctx.font = "500 16px 'Google Sans Code'";
  fillTextTrackedCentered(
    ctx,
    data.completionText ??
      `All ${data.milestoneCount} ${data.phaseLabel} milestones complete · ${formatDate(data.earnedDate)}`,
    cx,
    448,
    0.6,
  );

  // Seal, bottom-right inside the frame
  const sx = W - 150;
  const sy = H - 150;
  ctx.strokeStyle = accentStyle(ctx, accent, sx - 52, sy - 52, sx + 52, sy + 52);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(sx, sy, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = accentStyle(ctx, accent, sx - 52, sy - 52, sx + 52, sy + 52);
  ctx.font = "700 26px 'Google Sans Code'";
  ctx.textAlign = "center";
  ctx.fillText("▞▞", sx, sy + 2);
  ctx.textAlign = "left";
  ctx.font = "600 11px 'Google Sans Code'";
  fillTextTrackedCentered(ctx, (data.sealLabel ?? data.phaseLabel).toUpperCase(), sx, sy + 26, 1.6);

  // Footer small print — honest about what this is
  ctx.fillStyle = paperFaint;
  ctx.font = "500 13px 'Google Sans Code'";
  fillTextTrackedCentered(
    ctx,
    "Self-attested practice record · Part of Spec Before You Ship — specbeforeyouship.com",
    cx,
    H - 72,
    0.4,
  );
}
