import { injectable } from "inversify";
import { Layer } from "./Layer";

@injectable()
export class GridLayer extends Layer {
  name = 'grid';

  constructor() {
    super();
    this.init(20, 20);
  }

  prepare(ctx: CanvasRenderingContext2D) {
    const size = 20;
    const border = 3;

    function defineTriangle(one, two, three) {
      ctx.beginPath();
      ctx.moveTo(size >> 1, size >> 1);
      ctx.lineTo(one, two);
      ctx.lineTo(three, one);
      ctx.closePath();
    }

    defineTriangle(size, 0, size);
    ctx.fillStyle = '#333';
    ctx.fill();

    defineTriangle(size, size, 0);
    ctx.fillStyle = '#555';
    ctx.fill();

    defineTriangle(0, size, 0);
    ctx.fillStyle = 'lightgreen';
    ctx.fill();

    defineTriangle(0, 0, size);
    ctx.fillStyle = 'lightgreen';
    ctx.fill();

    ctx.fillStyle = 'grey';
    ctx.fillRect(border, border, size - border * 2, size - border * 2);
  }

  draw(ctx) {

  }
}