import { Palette } from './biomes';
import { TimeOfDayId, TimeColors, TIME_OF_DAY } from './timeOfDay';

// Lerp between two hex colors
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl2 = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl2.toString(16).padStart(2, '0')}`;
}

// Stars positions (generated once)
const STARS: Array<{ x: number; y: number; r: number; twinkle: number }> = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137.508) % 1),
  y: Math.random() * 0.6,
  r: 0.5 + Math.random() * 1,
  twinkle: Math.random() * Math.PI * 2,
}));

let twinkleT = 0;

export function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  tod: TimeOfDayId,
  biomeBlend: number,
  nextPalette: Palette | null
): void {
  const tc: TimeColors = TIME_OF_DAY[tod];

  const skyTop = tc.skyTopOverride
    ? tc.skyTopOverride
    : nextPalette && biomeBlend > 0
      ? lerpColor(palette.skyTop, nextPalette.skyTop, biomeBlend)
      : palette.skyTop;

  const skyBottom = tc.skyBottomOverride
    ? tc.skyBottomOverride
    : nextPalette && biomeBlend > 0
      ? lerpColor(palette.skyBottom, nextPalette.skyBottom, biomeBlend)
      : palette.skyBottom;

  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(1, skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.65);

  // Stars
  if (tc.starsVisible) {
    twinkleT += 0.03;
    ctx.save();
    for (const s of STARS) {
      const opacity = 0.5 + 0.5 * Math.sin(twinkleT + s.twinkle);
      ctx.globalAlpha = opacity * (tod === 'night' ? 1 : 0.3);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h * 0.65, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Moon
  if (tc.moonVisible) {
    ctx.save();
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.12, h * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Sun
  if (tc.sunVisible) {
    const sunColor = nextPalette ? lerpColor(palette.sun, nextPalette.sun, biomeBlend) : palette.sun;
    ctx.save();
    ctx.fillStyle = sunColor;
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.12, h * 0.038, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawFarHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  palette: Palette,
  nextPalette: Palette | null,
  biomeBlend: number
): void {
  const color = nextPalette
    ? lerpColor(palette.farHill, nextPalette.farHill, biomeBlend)
    : palette.farHill;

  ctx.fillStyle = color;
  ctx.beginPath();
  const y0 = h * 0.55;
  const period = w * 0.7;
  const offset = (scrollX * 0.08) % period;
  ctx.moveTo(0, y0);
  for (let x = -period; x < w + period; x += period / 3) {
    const xAdj = x - offset;
    ctx.quadraticCurveTo(xAdj + period / 6, y0 - h * 0.14, xAdj + period / 3, y0);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

export function drawMidHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollX: number,
  palette: Palette,
  nextPalette: Palette | null,
  biomeBlend: number
): void {
  const color = nextPalette
    ? lerpColor(palette.midHill, nextPalette.midHill, biomeBlend)
    : palette.midHill;

  ctx.fillStyle = color;
  ctx.beginPath();
  const y0 = h * 0.62;
  const period = w * 0.45;
  const offset = (scrollX * 0.25) % period;
  ctx.moveTo(0, y0);
  for (let x = -period; x < w + period; x += period / 2) {
    const xAdj = x - offset;
    ctx.quadraticCurveTo(xAdj + period / 4, y0 - h * 0.1, xAdj + period / 2, y0);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

export function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  nextPalette: Palette | null,
  biomeBlend: number
): void {
  const groundY = h * 0.68;
  const ground = nextPalette
    ? lerpColor(palette.ground, nextPalette.ground, biomeBlend)
    : palette.ground;
  const stripe = nextPalette
    ? lerpColor(palette.groundStripe, nextPalette.groundStripe, biomeBlend)
    : palette.groundStripe;

  ctx.fillStyle = ground;
  ctx.fillRect(0, groundY, w, h - groundY);

  // subtle stripe near horizon
  ctx.fillStyle = stripe;
  ctx.fillRect(0, groundY, w, h * 0.02);
}

export function drawRail(ctx: CanvasRenderingContext2D, w: number, h: number, scrollX: number): void {
  const railY = h * 0.82;
  const sleepersColor = '#6d4c41';
  const railColor = '#9e9e9e';

  // Sleepers (railway ties)
  const sleeperSpacing = 28;
  const offset = scrollX % sleeperSpacing;
  for (let x = -offset; x < w; x += sleeperSpacing) {
    ctx.fillStyle = sleepersColor;
    ctx.fillRect(Math.round(x - 2), railY - 3, 24, 6);
  }

  // Two rails
  ctx.fillStyle = railColor;
  ctx.fillRect(0, railY - 5, w, 3);
  ctx.fillRect(0, railY + 3, w, 3);
}

export function drawWindowFrame(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const frameColor = '#3e2723';
  const frameThickness = Math.max(8, Math.round(w * 0.04));
  const cornerRadius = frameThickness * 1.5;

  // Outer dark fill for corners
  ctx.fillStyle = frameColor;
  // Top
  ctx.fillRect(0, 0, w, frameThickness);
  // Bottom
  ctx.fillRect(0, h - frameThickness, w, frameThickness);
  // Left
  ctx.fillRect(0, 0, frameThickness, h);
  // Right
  ctx.fillRect(w - frameThickness, 0, frameThickness, h);

  // Inner rounded highlight
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 2;
  ctx.strokeRect(frameThickness + 1, frameThickness + 1, w - frameThickness * 2 - 2, h - frameThickness * 2 - 2);

  // Corner arc accents
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = cornerRadius;
  ctx.beginPath();
  ctx.roundRect(
    frameThickness / 2,
    frameThickness / 2,
    w - frameThickness,
    h - frameThickness,
    cornerRadius
  );
  ctx.stroke();
}

export function drawAmbientOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tod: TimeOfDayId
): void {
  const tc = TIME_OF_DAY[tod];
  if (tc.ambientAlpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = tc.ambientAlpha;
  ctx.fillStyle = tc.ambientColor;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
