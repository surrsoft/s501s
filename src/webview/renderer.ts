import { BIOMES, BIOME_ORDER, BiomeDef, BiomeId, ElementType } from './biomes';
import { TimeOfDayId, TIME_ORDER, TIME_CYCLE_MS } from './timeOfDay';
import { WeatherId, WeatherRenderer } from './weather';
import {
  drawSky, drawFarHills, drawMidHills, drawGround,
  drawRail, drawWindowFrame, drawAmbientOverlay
} from './layers';
import { SceneElement, drawElement } from './elements';

export interface TrainSettings {
  speed: 'slow' | 'normal' | 'fast';
  biome: 'auto' | BiomeId;
  timeOfDay: 'auto' | TimeOfDayId;
  weather: 'auto' | WeatherId;
}

const SPEED_MAP: Record<string, number> = { slow: 1.5, normal: 3, fast: 6 };
const BIOME_DURATION_MS = 30_000;
const ELEMENT_SPACING_BASE = 80; // px between element attempts

interface ActiveElement extends SceneElement {
  speedMult: number;
}

export class TrainRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;

  private scrollX = 0;
  private settings: TrainSettings = { speed: 'normal', biome: 'auto', timeOfDay: 'auto', weather: 'auto' };

  // Biome state
  private currentBiomeIdx = 0;
  private nextBiomeIdx = 1;
  private biomeBlend = 0; // 0 = current, 1 = next
  private biomeTimer = 0;
  private biomeStartTime = 0;

  // Time of day state
  private currentTodIdx = 0;
  private todTimer = 0;

  // Elements on screen
  private elements: ActiveElement[] = [];
  private nextElementX = 0;

  private weather = new WeatherRenderer();
  private weatherAuto: WeatherId[] = ['clear', 'clear', 'rain', 'snow', 'fog'];
  private currentWeatherIdx = 0;
  private weatherTimer = 0;
  private readonly WEATHER_DURATION_MS = 45_000;

  private lastTime = 0;
  private running = false;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.biomeStartTime = performance.now();
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  applySettings(s: TrainSettings): void {
    this.settings = s;
    if (s.biome !== 'auto') {
      const idx = BIOME_ORDER.indexOf(s.biome as BiomeId);
      if (idx >= 0) {
        this.currentBiomeIdx = idx;
        this.nextBiomeIdx = (idx + 1) % BIOME_ORDER.length;
        this.biomeBlend = 0;
      }
    }
    if (s.timeOfDay !== 'auto') {
      const idx = TIME_ORDER.indexOf(s.timeOfDay as TimeOfDayId);
      if (idx >= 0) this.currentTodIdx = idx;
    }
    if (s.weather !== 'auto') {
      this.weather.setWeather(s.weather as WeatherId);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private _resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width || window.innerWidth;
    this.h = rect.height || window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.scale(dpr, dpr);
    this.weather.resize(this.w, this.h);
    this.nextElementX = this.w;
  }

  private _loop(now: number): void {
    if (!this.running) return;
    const dt = Math.min(now - this.lastTime, 50); // cap at 50ms
    this.lastTime = now;
    this._update(dt);
    this._render();
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  private _update(dt: number): void {
    const speed = SPEED_MAP[this.settings.speed] ?? 3;
    this.scrollX += speed;

    // Biome cycling
    if (this.settings.biome === 'auto') {
      this.biomeTimer += dt;
      // Blend starts at 80% of duration
      const blendStart = BIOME_DURATION_MS * 0.8;
      if (this.biomeTimer >= BIOME_DURATION_MS) {
        this.biomeTimer = 0;
        this.currentBiomeIdx = this.nextBiomeIdx;
        this.nextBiomeIdx = (this.nextBiomeIdx + 1) % BIOME_ORDER.length;
        this.biomeBlend = 0;
      } else if (this.biomeTimer > blendStart) {
        this.biomeBlend = (this.biomeTimer - blendStart) / (BIOME_DURATION_MS - blendStart);
      }
    }

    // Time of day cycling
    if (this.settings.timeOfDay === 'auto') {
      this.todTimer += dt;
      if (this.todTimer >= TIME_CYCLE_MS) {
        this.todTimer = 0;
        this.currentTodIdx = (this.currentTodIdx + 1) % TIME_ORDER.length;
      }
    }

    // Weather auto cycling
    if (this.settings.weather === 'auto') {
      this.weatherTimer += dt;
      if (this.weatherTimer >= this.WEATHER_DURATION_MS) {
        this.weatherTimer = 0;
        this.currentWeatherIdx = (this.currentWeatherIdx + 1) % this.weatherAuto.length;
        this.weather.setWeather(this.weatherAuto[this.currentWeatherIdx]);
      }
    }

    // Spawn elements
    if (this.scrollX + this.w > this.nextElementX) {
      this._spawnElement();
    }

    // Update elements (scroll left)
    for (const el of this.elements) {
      el.x -= speed * el.speedMult;
    }
    // Remove off-screen
    this.elements = this.elements.filter((el) => el.x > -100);

    // Update weather
    this.weather.update();
  }

  private _spawnElement(): void {
    const biome = this._currentBiome();
    if (biome.elementPool.length === 0) return;

    const layer = Math.random() < 0.3 ? 'far' : Math.random() < 0.5 ? 'mid' : 'near';
    const type: ElementType = biome.elementPool[Math.floor(Math.random() * biome.elementPool.length)];
    const spacing = (ELEMENT_SPACING_BASE / biome.density) * (0.5 + Math.random());

    this.elements.push({
      type,
      x: this.nextElementX,
      layer,
      scaleY: 0.7 + Math.random() * 0.6,
      speedMult: layer === 'far' ? 0.4 : layer === 'mid' ? 0.7 : 1.2,
    });

    this.nextElementX += spacing;
  }

  private _currentBiome(): BiomeDef {
    return BIOMES[BIOME_ORDER[this.currentBiomeIdx]];
  }

  private _nextBiome(): BiomeDef | null {
    if (this.biomeBlend <= 0) return null;
    return BIOMES[BIOME_ORDER[this.nextBiomeIdx]];
  }

  private _render(): void {
    const { ctx, w, h } = this;
    const palette = this._currentBiome().palette;
    const nextPalette = this._nextBiome()?.palette ?? null;
    const tod: TimeOfDayId = TIME_ORDER[this.currentTodIdx];
    const groundY = h * 0.68;
    const scale = h / 400; // base scale: design at 400px height

    ctx.clearRect(0, 0, w, h);

    // 1. Sky
    drawSky(ctx, w, h, palette, tod, this.biomeBlend, nextPalette);

    // 2. Far hills
    drawFarHills(ctx, w, h, this.scrollX, palette, nextPalette, this.biomeBlend);

    // 3. Mid hills
    drawMidHills(ctx, w, h, this.scrollX, palette, nextPalette, this.biomeBlend);

    // 4. Ground
    drawGround(ctx, w, h, palette, nextPalette, this.biomeBlend);

    // 5. Far elements
    for (const el of this.elements) {
      if (el.layer === 'far') {
        drawElement(ctx, el, groundY - h * 0.06, scale * 0.55);
      }
    }

    // 6. Mid elements
    for (const el of this.elements) {
      if (el.layer === 'mid') {
        drawElement(ctx, el, groundY, scale * 0.8);
      }
    }

    // 7. Rail
    drawRail(ctx, w, h, this.scrollX);

    // 8. Near elements (in front of rail)
    for (const el of this.elements) {
      if (el.layer === 'near') {
        drawElement(ctx, el, groundY + h * 0.1, scale * 1.1);
      }
    }

    // 9. Weather
    this.weather.draw(ctx);

    // 10. Ambient overlay (night/sunset tint)
    drawAmbientOverlay(ctx, w, h, tod);

    // 11. Window frame (always on top)
    drawWindowFrame(ctx, w, h);
  }
}
