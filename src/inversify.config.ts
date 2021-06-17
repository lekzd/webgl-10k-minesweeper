import { Container } from "inversify";
import { Game } from "./Game";
import { State } from "./State";
import { FlagsLayer } from "./views/FlagsLayer";
import { GridLayer } from "./views/GridLayer";
import { SpriteLayer } from "./views/SpriteLayer";
import { WebGlCtx } from "./views/WeglCtx";

export const container = new Container({ autoBindInjectable: true });

container.bind(Game).to(Game).inSingletonScope();
container.bind(State).to(State).inSingletonScope();
container.bind(WebGlCtx).to(WebGlCtx).inSingletonScope();
container.bind(GridLayer).to(GridLayer).inSingletonScope();
container.bind(FlagsLayer).to(FlagsLayer).inSingletonScope();
container.bind(SpriteLayer).to(SpriteLayer).inSingletonScope();
