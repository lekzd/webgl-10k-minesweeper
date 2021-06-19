import { State } from "./State";
import { container } from "./inversify.config";
import { Render } from "./render/Render";
import { GridLayer } from "./views/GridLayer";
import { clamp } from "./helpers/clamp";
import { WebGlCtx } from "./views/WeglCtx";
import { FlagsLayer } from "./views/FlagsLayer";
import { Game } from "./Game";
import { SpriteLayer } from "./views/SpriteLayer";

const MAX_BOMBS_COUNT = 16777216; // Set<number> memory limit
const MAX_SIZE = 65536; // 2**16 hash limit

export class App {

  private state = container.get(State);
  private render = container.get(Render);
  private canvas = container.get(WebGlCtx).canvas!;

  constructor() {

    const urlParams = new URLSearchParams(location.search);

    if (urlParams.get('width')) {
      const width = Math.min(MAX_SIZE, +(urlParams.get('width') || 100));

      this.state.width = width;
      document.querySelector('#width').value = width;
    }

    if (urlParams.get('height')) {
      const height = Math.min(MAX_SIZE, +(urlParams.get('height') || 100));
      
      this.state.height = height;
      document.querySelector('#height').value = height;
    }

    if (urlParams.get('bombs')) {
      const bombsCount = Math.min(MAX_BOMBS_COUNT, +(urlParams.get('bombs') || 1000));

      this.state.bombsCount = bombsCount;
      document.querySelector('#bombs').value = bombsCount;
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