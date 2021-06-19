import { injectable } from "inversify";
import { colors } from "../const/colors";
import { container } from "../inversify.config";
import { State } from "../State";
import { Layer } from "./Layer";

@injectable()
export class FlagsLayer extends Layer {
  name = 'flags';

  private imageData;
  private sourceBuffer8: Uint8Array;

  constructor() {
    super();
    const state = container.get(State);
    this.init(state.width, state.height);

    this.imageData = this.ctx.getImageData(0, 0, state.width, state.height);
    this.sourceBuffer8 = new Uint8Array(this.imageData.data.buffer);
  }

  prepare(ctx) {

  }

  draw(ctx) {

  }

  private setPixel(x: number, y: number, R: number, G: number, B: number, A: number) {
    const index = 4 * (+x + +y * this.imageData.width);

    this.sourceBuffer8[index+0] = R;    // R
    this.sourceBuffer8[index+1] = G;    // G
    this.sourceBuffer8[index+2] = B;    // B
    this.sourceBuffer8[index+3] = A;    // A
  }

  private drawDataRect(left: number, top: number, color: string) {
    const ctx = this.ctx;

    ctx.fillStyle = color;

    ctx.fillRect(left, top, 1, 1);

    if (ctx.fillStyle[0] === '#') {
      // #RRGGBB
      const hex = parseInt(ctx.fillStyle.substr(1), 16);
      const R = hex >> 16;
      const G = hex >> 12;
      const B = hex >> 8;
      const A = 255;
  
      this.setPixel(left, top, R, G, B, A);
    } else {
      // rgba(R, G, B, A)
      const matches = ctx.fillStyle.match(/rgba?\((\d+)\,\s?(\d+)\,\s?(\d+)\,\s?(\d+)\)/);

      if (matches) {
        const [, R, G, B, A] = matches;
        
        this.setPixel(left, top, +R, +G, +B, +A);
      }
    }
  }

  drawNewFlag(left: number, top: number) {
    this.drawDataRect(left, top, colors.FLAG);
  }

  drawClearCell(left: number, top: number) {
    this.drawDataRect(left, top, 'transparent');
  }

  drawNewBomb(left: number, top: number) {
    this.drawDataRect(left, top, colors.BOMB);
  }

  drawNewEmpty(left: number, top: number, value: number) {
    this.drawDataRect(left, top, colors[value]);
  }

  drawBombsBatch(coords: Set<number>) {
    console.time('drawBombsBatch');
    const values = coords.values();

    for (let it = values, val = -1; val=it.next().value; ) {
      const x = val >> 16;
      const y = val - ( x << 16 );

      this.setPixel(+x, +y, 0, 0, 255, 255);
    }

    this.ctx.putImageData(this.imageData, 0, 0);
    console.timeEnd('drawBombsBatch');
  }
}