import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { EntityType } from "../../../../dogfight/src/entity";
import { TeamInfo } from "../../../../dogfight/src/entities/TeamInfo";
import { spriteSheet } from "../textures";
import { Clock } from "../../../../dogfight/src/entities/Clock";
import { None } from "../../../../dogfight/src/entities/None";

export class NoneSprite extends GameSprite<None> {

  public constructor(spritesheet: PIXI.Spritesheet) {
    super(spriteSheet, None);
  }

  public redraw(): void {
    //
  }

  public destroy(): void {
    //
  }
}
