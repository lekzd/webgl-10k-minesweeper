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
  bombs = new Set<string>();
  opened = new Map<string, number>();
  visited = new Set<string>();
}