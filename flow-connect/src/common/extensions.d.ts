declare global {
  interface CanvasRenderingContext2D {
    roundRect: (x: number, y: number, width: number, height: number, radius: number) => void;
    strokeRoundRect: (x: number, y: number, width: number, height: number, radius: number) => void;
    fillRoundRect: (x: number, y: number, width: number, height: number, radius: number) => void;
  }
}

export {};
