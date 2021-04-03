import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { EntityType } from "../../../../dogfight/src/entity";
import { TeamInfo } from "../../../../dogfight/src/entities/TeamInfo";
import { spriteSheet } from "../textures";
import { Clock } from "../../../../dogfight/src/entities/Clock";

export class ClockSprite extends GameSprite<Clock> {

  public constructor(spritesheet: PIXI.Spritesheet) {
    super(spriteSheet, Clock);
  }

  public redraw(): void {
    //
  }

  public destroy(): void {
    //
  }
}
