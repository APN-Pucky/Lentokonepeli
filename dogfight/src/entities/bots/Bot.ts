import { PlayerImpl } from "../../network/player";
import { GameWorld } from "../../world/world";
import { PlayerInfo } from "../PlayerInfo";
import { RespawnType } from "../Respawner";
import { Ticking } from "../Ticking";

export class BotPlayer extends PlayerImpl {
  public constructor() {
    super(null, false);
    this.name = "Bot";
  }
}

export class Bot extends PlayerInfo implements Ticking {

  public constructor(world: GameWorld) {
    super(world, new BotPlayer());
  }
  public reward(delta: number): void {
  }
  public tick(delta: number): void {
    this.reward(delta);
  }
  public getNextRespawnType() {
    return RespawnType.Bot
  }
}