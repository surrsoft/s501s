import { ElementType } from './biomes';

export interface SceneElement {
  type: ElementType;
  x: number;
  layer: 'mid' | 'near' | 'far';
  scaleY: number; // height variation
}

// Draw a single element at pixel position (x, groundY)
export function drawElement(
  ctx: CanvasRenderingContext2D,
  el: SceneElement,
  groundY: number,
  scale: number
): void {
  const x = el.x;
  const s = scale * el.scaleY;
  ctx.save();
  drawShape(ctx, el.type, x, groundY, s);
  ctx.restore();
}

function px(v: number, s: number): number {
  return Math.round(v * s);
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  type: ElementType,
  x: number,
  groundY: number,
  s: number
): void {
  switch (type) {
    case 'spruce':
      drawSpruce(ctx, x, groundY, s);
      break;
    case 'birch':
      drawBirch(ctx, x, groundY, s);
      break;
    case 'stump':
      drawStump(ctx, x, groundY, s);
      break;
    case 'deer':
      drawDeer(ctx, x, groundY, s);
      break;
    case 'mushroom':
      drawMushroom(ctx, x, groundY, s);
      break;
    case 'pole':
      drawPole(ctx, x, groundY, s);
      break;
    case 'haystack':
      drawHaystack(ctx, x, groundY, s);
      break;
    case 'sunflower':
      drawSunflower(ctx, x, groundY, s);
      break;
    case 'cow':
      drawCow(ctx, x, groundY, s);
      break;
    case 'house':
      drawHouse(ctx, x, groundY, s);
      break;
    case 'factory':
      drawFactory(ctx, x, groundY, s);
      break;
    case 'bridge_pillar':
      drawBridgePillar(ctx, x, groundY, s);
      break;
    case 'rock':
      drawRock(ctx, x, groundY, s);
      break;
    case 'snow_peak':
      drawSnowPeak(ctx, x, groundY, s);
      break;
    case 'bare_tree':
      drawBareTree(ctx, x, groundY, s);
      break;
    case 'hut':
      drawHut(ctx, x, groundY, s);
      break;
    case 'fence':
      drawFence(ctx, x, groundY, s);
      break;
  }
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// --- Tree shapes ---
function drawSpruce(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  const trunk = { w: px(4, s), h: px(8, s) };
  rect(ctx, x - trunk.w / 2, groundY - trunk.h, trunk.w, trunk.h, '#5d4037');
  // 3 tiers of foliage
  const tiers = [
    { w: px(20, s), h: px(12, s), yOff: trunk.h },
    { w: px(15, s), h: px(12, s), yOff: trunk.h + px(8, s) },
    { w: px(10, s), h: px(12, s), yOff: trunk.h + px(16, s) },
  ];
  for (const t of tiers) {
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.moveTo(x, groundY - t.yOff - t.h);
    ctx.lineTo(x + t.w / 2, groundY - t.yOff + 2);
    ctx.lineTo(x - t.w / 2, groundY - t.yOff + 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBirch(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  const h = px(40, s);
  const w = px(4, s);
  rect(ctx, x - w / 2, groundY - h, w, h, '#e0e0e0');
  // bark marks
  for (let i = 0; i < 4; i++) {
    rect(ctx, x - w / 2, groundY - h * 0.2 * (i + 1), w, px(2, s), '#9e9e9e');
  }
  // crown
  ctx.fillStyle = '#388e3c';
  ctx.beginPath();
  ctx.arc(x, groundY - h, px(14, s), 0, Math.PI * 2);
  ctx.fill();
}

function drawStump(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(6, s), groundY - px(8, s), px(12, s), px(8, s), '#6d4c41');
  rect(ctx, x - px(7, s), groundY - px(9, s), px(14, s), px(3, s), '#8d6e63');
}

function drawDeer(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  // body
  rect(ctx, x - px(10, s), groundY - px(16, s), px(20, s), px(10, s), '#8d6e63');
  // head
  rect(ctx, x + px(8, s), groundY - px(22, s), px(8, s), px(7, s), '#795548');
  // legs
  for (let i = 0; i < 4; i++) {
    rect(ctx, x - px(8, s) + i * px(6, s), groundY - px(7, s), px(3, s), px(7, s), '#6d4c41');
  }
  // antlers
  rect(ctx, x + px(10, s), groundY - px(26, s), px(2, s), px(6, s), '#5d4037');
  rect(ctx, x + px(13, s), groundY - px(26, s), px(2, s), px(4, s), '#5d4037');
}

function drawMushroom(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(2, s), groundY - px(8, s), px(4, s), px(8, s), '#f5f5dc');
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.arc(x, groundY - px(9, s), px(7, s), Math.PI, 0);
  ctx.fill();
  rect(ctx, x - px(3, s), groundY - px(10, s), px(3, s), px(3, s), '#ffffff');
}

// --- Field shapes ---
function drawPole(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  const h = px(50, s);
  rect(ctx, x - px(2, s), groundY - h, px(4, s), h, '#8d6e63');
  // crossbar
  rect(ctx, x - px(10, s), groundY - h, px(20, s), px(3, s), '#6d4c41');
  // insulators
  rect(ctx, x - px(8, s), groundY - h, px(3, s), px(5, s), '#fff9c4');
  rect(ctx, x + px(5, s), groundY - h, px(3, s), px(5, s), '#fff9c4');
}

function drawHaystack(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  ctx.fillStyle = '#ffcc02';
  ctx.beginPath();
  ctx.ellipse(x, groundY - px(10, s), px(18, s), px(12, s), 0, 0, Math.PI * 2);
  ctx.fill();
  rect(ctx, x - px(18, s), groundY - px(3, s), px(36, s), px(3, s), '#f9a825');
}

function drawSunflower(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  const stemH = px(30, s);
  rect(ctx, x - px(1, s), groundY - stemH, px(2, s), stemH, '#388e3c');
  // petals
  ctx.fillStyle = '#fdd835';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px2 = x + Math.cos(angle) * px(7, s);
    const py2 = groundY - stemH + Math.sin(angle) * px(7, s);
    ctx.beginPath();
    ctx.ellipse(px2, py2, px(4, s), px(2, s), angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#4e342e';
  ctx.beginPath();
  ctx.arc(x, groundY - stemH, px(5, s), 0, Math.PI * 2);
  ctx.fill();
}

function drawCow(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  // body
  rect(ctx, x - px(14, s), groundY - px(18, s), px(28, s), px(14, s), '#f5f5f5');
  // spots
  rect(ctx, x - px(6, s), groundY - px(16, s), px(8, s), px(6, s), '#424242');
  // head
  rect(ctx, x + px(12, s), groundY - px(20, s), px(10, s), px(9, s), '#f5f5f5');
  // legs
  for (let i = 0; i < 4; i++) {
    rect(ctx, x - px(11, s) + i * px(7, s), groundY - px(5, s), px(4, s), px(5, s), '#bdbdbd');
  }
}

// --- City shapes ---
function drawHouse(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  const w = px(32, s);
  const h = px(28, s);
  rect(ctx, x - w / 2, groundY - h, w, h, '#e57373');
  // roof
  ctx.fillStyle = '#c62828';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - px(2, s), groundY - h);
  ctx.lineTo(x, groundY - h - px(16, s));
  ctx.lineTo(x + w / 2 + px(2, s), groundY - h);
  ctx.closePath();
  ctx.fill();
  // windows
  rect(ctx, x - px(11, s), groundY - h + px(6, s), px(8, s), px(8, s), '#90caf9');
  rect(ctx, x + px(3, s), groundY - h + px(6, s), px(8, s), px(8, s), '#90caf9');
  // door
  rect(ctx, x - px(4, s), groundY - px(10, s), px(8, s), px(10, s), '#5d4037');
}

function drawFactory(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(20, s), groundY - px(35, s), px(40, s), px(35, s), '#78909c');
  rect(ctx, x - px(8, s), groundY - px(50, s), px(8, s), px(20, s), '#546e7a');
  rect(ctx, x + px(4, s), groundY - px(45, s), px(8, s), px(15, s), '#546e7a');
  // smoke
  ctx.fillStyle = 'rgba(180,180,180,0.5)';
  ctx.beginPath();
  ctx.arc(x - px(4, s), groundY - px(55, s), px(5, s), 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + px(8, s), groundY - px(50, s), px(4, s), 0, Math.PI * 2);
  ctx.fill();
}

function drawBridgePillar(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(5, s), groundY - px(40, s), px(10, s), px(40, s), '#90a4ae');
  rect(ctx, x - px(20, s), groundY - px(40, s), px(40, s), px(5, s), '#78909c');
}

// --- Mountain shapes ---
function drawRock(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  ctx.fillStyle = '#78909c';
  ctx.beginPath();
  ctx.moveTo(x - px(14, s), groundY);
  ctx.lineTo(x - px(8, s), groundY - px(20, s));
  ctx.lineTo(x + px(4, s), groundY - px(25, s));
  ctx.lineTo(x + px(14, s), groundY - px(10, s));
  ctx.lineTo(x + px(16, s), groundY);
  ctx.closePath();
  ctx.fill();
}

function drawSnowPeak(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  ctx.fillStyle = '#78909c';
  ctx.beginPath();
  ctx.moveTo(x - px(30, s), groundY);
  ctx.lineTo(x, groundY - px(60, s));
  ctx.lineTo(x + px(30, s), groundY);
  ctx.closePath();
  ctx.fill();
  // snow cap
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.moveTo(x - px(10, s), groundY - px(45, s));
  ctx.lineTo(x, groundY - px(60, s));
  ctx.lineTo(x + px(10, s), groundY - px(45, s));
  ctx.closePath();
  ctx.fill();
}

// --- Tundra shapes ---
function drawBareTree(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(2, s), groundY - px(35, s), px(4, s), px(35, s), '#757575');
  // branches
  rect(ctx, x - px(12, s), groundY - px(28, s), px(12, s), px(2, s), '#757575');
  rect(ctx, x, groundY - px(22, s), px(10, s), px(2, s), '#757575');
  rect(ctx, x - px(8, s), groundY - px(16, s), px(8, s), px(2, s), '#757575');
}

function drawHut(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(16, s), groundY - px(20, s), px(32, s), px(20, s), '#8d6e63');
  // roof
  ctx.fillStyle = '#5d4037';
  ctx.beginPath();
  ctx.moveTo(x - px(18, s), groundY - px(20, s));
  ctx.lineTo(x, groundY - px(36, s));
  ctx.lineTo(x + px(18, s), groundY - px(20, s));
  ctx.closePath();
  ctx.fill();
  // snow on roof
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.moveTo(x - px(10, s), groundY - px(29, s));
  ctx.lineTo(x, groundY - px(38, s));
  ctx.lineTo(x + px(10, s), groundY - px(29, s));
  ctx.closePath();
  ctx.fill();
  // window
  rect(ctx, x - px(5, s), groundY - px(15, s), px(7, s), px(6, s), '#b3e5fc');
}

function drawFence(ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number): void {
  rect(ctx, x - px(1, s), groundY - px(14, s), px(2, s), px(14, s), '#a1887f');
  rect(ctx, x - px(12, s), groundY - px(10, s), px(24, s), px(2, s), '#a1887f');
  rect(ctx, x - px(12, s), groundY - px(5, s), px(24, s), px(2, s), '#a1887f');
  rect(ctx, x - px(11, s), groundY - px(14, s), px(2, s), px(14, s), '#a1887f');
  rect(ctx, x + px(9, s), groundY - px(14, s), px(2, s), px(14, s), '#a1887f');
}
