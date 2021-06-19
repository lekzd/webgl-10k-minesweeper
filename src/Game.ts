import { injectable } from "inversify";
import { container } from "./inversify.config";
import { State } from "./State";
import { FlagsLayer } from "./views/FlagsLayer";

@injectable()
export class Game {
  private state = container.get(State);
  private flagsLayer = container.get(FlagsLayer);

  private checkCell(left: number, top: number): number {    
    if (this.state.hasBomb(left, top)) {
      return - 1;
    }

    if (this.state.opened.has(`${left}.${top}`)) {
      return this.state.opened.get(`${left}.${top}`)!;
    }

    return 0;
  }

  private checkNeighbours(x: number, y: number): number {
    let bombs = 0;
    const fr = Math.PI / 4

    for (let i = -Math.PI; i < Math.PI; i += fr) {
      const newX = x + Math.round(Math.cos(i + fr));
      const newY = y + Math.round(Math.sin(i + fr));
      const cell = this.checkCell(newX, newY);
      
      if (cell === -1) {
        bombs++;
      }
    }

    return bombs;
  }

  private traverseNeighbours(x: number, y: number) {
    const fr = Math.PI / 4;

    for (let i = -Math.PI; i < Math.PI; i += fr) {
      const newX = x + Math.round(Math.cos(i + fr));
      const newY = y + Math.round(Math.sin(i + fr));

      if (newX < 0 || newX > this.state.width) {
        continue;
      }

      if (newY < 0 || newY > this.state.height) {
        continue;
      }

      if (this.state.opened.has(`${newX}.${newY}`)) {
        continue;
      }

      if (this.state.hasBomb(newX, newY)) {
        continue;
      }

      const cell = this.checkNeighbours(newX, newY);

      this.state.opened.set(`${newX}.${newY}`, cell);
      this.flagsLayer.drawNewEmpty(newX, newY, cell);

      if (cell === 0) {
        setTimeout(() => {
          this.traverseNeighbours(newX, newY);
        }, 0);
      }
    }
  }

  private generateBombs(left: number, top: number) {
    console.time('generateBombs');
    let bombsLeft = this.state.bombsCount;

    while (bombsLeft) {
      const x = Math.floor(Math.random() * this.state.width);
      const y = Math.floor(Math.random() * this.state.height);

      if (x === left && y === top) {
        continue;
      }

      if (this.state.hasBomb(x ,y)) {
        continue;
      }

      bombsLeft--;

      this.state.addBomb(x, y);
    }

    setTimeout(() => {
      this.flagsLayer.drawBombsBatch(this.state.bombs);
    });

    console.timeEnd('generateBombs');
  }

  leftClick(left: number, top: number) {
    if (this.state.isFirstClick) {
      this.generateBombs(left, top);

      this.state.isFirstClick = false;
    }

    if (this.state.hasBomb(left, top)) {
      console.log('BOOOM', left, top);
      this.state.isLost = true;
    } else {
      console.log('OPEN', left, top);

      const cell = this.checkNeighbours(left, top);
      this.state.opened.set(`${left}.${top}`, cell);
      this.flagsLayer.drawNewEmpty(left, top, cell);

      this.traverseNeighbours(left, top);
    }
  }

  rightClick(left: number, top: number) {
    if (this.state.flagsLeft) {
      this.state.flagsLeft--;
    }

    if (this.state.flags.has(`${left}.${top}`)) {
      this.state.flags.delete(`${left}.${top}`)

      if (this.state.hasBomb(left, top)) {
        this.flagsLayer.drawNewBomb(left, top);
      } else {
        this.flagsLayer.drawClearCell(left, top);
      }
    } else {
      this.state.flags.add(`${left}.${top}`);

      this.flagsLayer.drawNewFlag(left, top);
    }
  }
}