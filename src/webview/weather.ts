export type WeatherId = 'clear' | 'rain' | 'snow' | 'fog';

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export class WeatherRenderer {
  private particles: Particle[] = [];
  private weather: WeatherId = 'clear';
  private w = 0;
  private h = 0;

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.particles = [];
    this._populate();
  }

  setWeather(w: WeatherId): void {
    this.weather = w;
    this.particles = [];
    this._populate();
  }

  update(): void {
    if (this.weather === 'clear' || this.weather === 'fog') return;
    for (const p of this.particles) {
      p.y += p.speed;
      if (this.weather === 'rain') p.x -= 1; // slight diagonal
      if (p.y > this.h) {
        p.y = -10;
        p.x = Math.random() * this.w;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.weather === 'clear') return;

    if (this.weather === 'fog') {
      const grad = ctx.createLinearGradient(0, 0, 0, this.h);
      grad.addColorStop(0, 'rgba(200,210,220,0)');
      grad.addColorStop(0.4, 'rgba(200,210,220,0.55)');
      grad.addColorStop(1, 'rgba(200,210,220,0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.w, this.h);
      return;
    }

    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.opacity;
      if (this.weather === 'rain') {
        ctx.strokeStyle = '#a0b8cc';
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + 10);
        ctx.stroke();
      } else if (this.weather === 'snow') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private _populate(): void {
    if (this.weather === 'rain') {
      for (let i = 0; i < 120; i++) {
        this.particles.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          speed: 8 + Math.random() * 6,
          size: 0.5 + Math.random() * 0.5,
          opacity: 0.4 + Math.random() * 0.4,
        });
      }
    } else if (this.weather === 'snow') {
      for (let i = 0; i < 80; i++) {
        this.particles.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          speed: 1 + Math.random() * 2,
          size: 1 + Math.random() * 2,
          opacity: 0.6 + Math.random() * 0.4,
        });
      }
    }
  }
}
