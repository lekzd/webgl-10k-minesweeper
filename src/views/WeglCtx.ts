import { injectable } from "inversify";

const canvas = <HTMLCanvasElement>document.querySelector('#canvas');

@injectable()
export class WebGlCtx {
  gl = canvas.getContext('webgl');
  canvas = canvas;
}