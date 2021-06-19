import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export class State {
  width = 100;
  height = 100;
  scrollLeft = 0;
  scrollTop = 0;

  bombsCount = 2000;
  flagsLeft = 2000;

  isFirstClick = true;
  isLost = false;

  flags = new Set<string>();
  bombs = new Set<number>();
  opened = new Map<string, number>();

  addBomb(x: number, y: number) {
    const hash = (x << 16) + y;

    this.bombs.add(hash);
  }

  hasBomb(x: number, y: number): boolean {
    const hash = (x << 16) + y;

    return this.bombs.has(hash);
  }
}