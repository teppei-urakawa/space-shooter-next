interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export class StarField {
  private canvas: HTMLCanvasElement;
  stars: Star[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push(this._makeStar(Math.random() * canvas.height));
    }
  }

  private _makeStar(y: number): Star {
    const layer = Math.random();
    return {
      x:     Math.random() * this.canvas.width,
      y,
      size:  layer < 0.33 ? 0.8 : layer < 0.66 ? 1.4 : 2,
      speed: layer < 0.33 ? 0.5 : layer < 0.66 ? 1.2 : 2.2,
      alpha: 0.3 + Math.random() * 0.7,
    };
  }

  update() {
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.canvas.height) {
        Object.assign(s, this._makeStar(0));
        s.y = 0;
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.stars.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle   = '#fff';
      ctx.shadowBlur  = s.size > 1.5 ? 8 : 0;
      ctx.shadowColor = '#88aaff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
