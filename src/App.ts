import { State } from "./State";
import { container } from "./inversify.config";
import { Render } from "./render/Render";
import { GridLayer } from "./views/GridLayer";
import { clamp } from "./helpers/clamp";
import { WebGlCtx } from "./views/WeglCtx";
import { FlagsLayer } from "./views/FlagsLayer";
import { Game } from "./Game";
import { SpriteLayer } from "./views/SpriteLayer";

export class App {

  private state = container.get(State);
  private render = container.get(Render);
  private canvas = container.get(WebGlCtx).canvas!;

  constructor() {

    const urlParams = new URLSearchParams(location.search);

    if (urlParams.get('width')) {
      this.state.width = +(urlParams.get('width') || 100);
      document.querySelector('#width').value = urlParams.get('width') || '100';
    }

    if (urlParams.get('height')) {
      this.state.height = +(urlParams.get('height') || 100);
      document.querySelector('#height').value = urlParams.get('height') || '100';
    }

    if (urlParams.get('bombs')) {
      this.state.bombsCount = +(urlParams.get('bombs') || 1000);
      document.querySelector('#bombs').value = urlParams.get('bombs') || '1000';
    }

    const gridLayer = container.get(GridLayer);
    const flagsLayer = container.get(FlagsLayer);
    const spriteLayer = container.get(SpriteLayer);
    const game = container.get(Game);

    this.render.init([
      gridLayer,
      flagsLayer,
      spriteLayer,
    ]);

    window.addEventListener('wheel', e => {
      e.preventDefault();

      const maxScrollX = (this.state.width * 20) - 500;
      const maxScrollY = (this.state.height * 20) - 500;

      this.state.scrollLeft = clamp(this.state.scrollLeft + e.deltaX, 0, maxScrollX);
      this.state.scrollTop = clamp(this.state.scrollTop + e.deltaY, 0, maxScrollY);
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();

      const x = e.offsetX + this.state.scrollLeft;
      const y = e.offsetY + this.state.scrollTop;

      const left = Math.floor(x / 20);
      const top = Math.floor(y / 20);

      if (this.state.isLost) {
        return;
      }

      if (!this.state.opened.has(`${left}.${top}`)) {
        game.leftClick(left, top);
      }
    })

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      const x = e.offsetX + this.state.scrollLeft;
      const y = e.offsetY + this.state.scrollTop;

      const left = Math.floor(x / 20);
      const top = Math.floor(y / 20);

      if (this.state.isLost) {
        return;
      }

      if (!this.state.opened.has(`${left}.${top}`)) {
        game.rightClick(left, top);
      }
    })
  }
}