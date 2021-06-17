import type { Layer } from "../views/Layer";
import { injectable } from "inversify";

@injectable()
export class CanvasRender {
  private layers: Layer[] = [];

  add(layer: Layer) {
    this.layers.push(layer);
  }

  prepare() {
    this.layers.forEach(layer => {
      layer.prepare(layer.ctx);
    });
  }

  draw() {
    this.layers.forEach(layer => {
      layer.draw(layer.ctx);
    });
  }
}