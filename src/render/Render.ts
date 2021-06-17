import { WebglRender } from "./WebglRender";
import { CanvasRender } from "./CanvasRender";
import { setMainRenderFunction } from "../helpers/requestRenderFrame";
import type { Layer } from "../views/Layer";
import { container } from "../inversify.config";
import { injectable } from "inversify";

@injectable()
export class Render {
  private webglRender = container.get(WebglRender);
  private canvasRender = container.get(CanvasRender);

  init(layers: Layer[]) {

    layers.forEach(layer => {
      this.canvasRender.add(layer);
      this.webglRender.add(layer);
    });

    this.canvasRender.prepare();
    this.webglRender.prepare();

    setMainRenderFunction(() => {
      this.canvasRender.draw();
      this.webglRender.draw();
    });
  }
}