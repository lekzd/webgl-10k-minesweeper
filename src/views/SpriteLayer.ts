import { injectable } from "inversify";
import { Layer } from "./Layer";

@injectable()
export class SpriteLayer extends Layer {
  name = 'sprite';

  constructor() {
    super();
    this.init(128, 128);
  }

  prepare(ctx: CanvasRenderingContext2D) {
    const sprite = new Image();

    sprite.onload = () => {
      ctx.drawImage(sprite, 0, 0);
    }

    sprite.src = './sprite.png';
  }

  draw(ctx) {

  }
}