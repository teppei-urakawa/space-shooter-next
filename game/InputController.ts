interface InputCallbacks {
  onMove: (x: number, y: number) => void;
  onDown: () => void;
  onUp: () => void;
}

export class InputController {
  private canvas: HTMLCanvasElement;
  private handlers: {
    mousedown: () => void;
    mouseup: () => void;
    mouseleave: () => void;
    mousemove: (e: MouseEvent) => void;
    touchstart: (e: TouchEvent) => void;
    touchmove: (e: TouchEvent) => void;
    touchend: () => void;
  };

  constructor(canvas: HTMLCanvasElement, { onMove, onDown, onUp }: InputCallbacks) {
    this.canvas = canvas;

    this.handlers = {
      mousedown:  () => onDown(),
      mouseup:    () => onUp(),
      mouseleave: () => onUp(),
      mousemove: (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        onMove(e.clientX - rect.left, e.clientY - rect.top);
      },
      touchstart: (e: TouchEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        onMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        onDown();
      },
      touchmove: (e: TouchEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        onMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      },
      touchend: () => onUp(),
    };

    canvas.addEventListener('mousedown',  this.handlers.mousedown);
    canvas.addEventListener('mouseup',    this.handlers.mouseup);
    canvas.addEventListener('mouseleave', this.handlers.mouseleave);
    canvas.addEventListener('mousemove',  this.handlers.mousemove);
    canvas.addEventListener('touchstart', this.handlers.touchstart, { passive: false });
    canvas.addEventListener('touchmove',  this.handlers.touchmove,  { passive: false });
    canvas.addEventListener('touchend',   this.handlers.touchend);
  }

  destroy() {
    this.canvas.removeEventListener('mousedown',  this.handlers.mousedown);
    this.canvas.removeEventListener('mouseup',    this.handlers.mouseup);
    this.canvas.removeEventListener('mouseleave', this.handlers.mouseleave);
    this.canvas.removeEventListener('mousemove',  this.handlers.mousemove);
    this.canvas.removeEventListener('touchstart', this.handlers.touchstart);
    this.canvas.removeEventListener('touchmove',  this.handlers.touchmove);
    this.canvas.removeEventListener('touchend',   this.handlers.touchend);
  }
}
