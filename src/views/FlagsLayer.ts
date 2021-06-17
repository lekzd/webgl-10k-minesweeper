import { injectable } from "inversify";
import { colors } from "../const/colors";
import { container } from "../inversify.config";
import { State } from "../State";
import { Layer } from "./Layer";

@injectable()
export class FlagsLayer extends Layer {
  name = 'flags';

  constructor() {
    super();
    const state = container.get(State);
    this.init(state.width, state.height);
  }

  prepare(ctx) {

  }

  draw(ctx) {

  }

  private drawDataRect(left: number, top: number, color: string) {
    const ctx = this.ctx;

    ctx.fillStyle = color;

    ctx.fillRect(left, top, 1, 1);
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

  drawBombsBatch(coords: Set<string>) {
    const imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const sourceBuffer8 = new Uint8Array(imageData.data.buffer);

    coords.forEach(key => {
      const [x, y] = key.split('.');
      const index = 4 * (+x + +y * imageData.width);

      sourceBuffer8[index+0] = 0;   // R
      sourceBuffer8[index+1] = 0;   // G
      sourceBuffer8[index+2] = 255; // B
      sourceBuffer8[index+3] = 255; // A
    });

    this.ctx.putImageData(imageData, 0, 0);
  }
}