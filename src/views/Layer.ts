import { injectable } from "inversify";

@injectable()
export abstract class Layer {
  ctx: CanvasRenderingContext2D;

  abstract name: string;

  init(width: number, height: number) {
    const ctx = this.makeCtx(width, height);

    if (ctx) {
      this.ctx = ctx;
      // document.querySelector('#debug')?.appendChild(ctx.canvas);
    } else {
      throw Error('Layer can not be created');
    }
  }

  get shaderTextureName(): string {
    return `u_${this.name}`;
  }

  abstract prepare(ctx: CanvasRenderingContext2D);
  abstract draw(ctx: CanvasRenderingContext2D);

  protected makeCtx(width: number, height: number): CanvasRenderingContext2D | null {
    // const canvas = document.createElement('canvas');
    const canvas = new OffscreenCanvas(width, height);
    canvas.width = width;
    canvas.height = height;

    return canvas.getContext('2d');
  }
}