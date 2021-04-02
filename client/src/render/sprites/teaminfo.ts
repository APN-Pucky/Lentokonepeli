import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { EntityType } from "../../../../dogfight/src/entity";
import { TeamInfo } from "../../../../dogfight/src/entities/TeamInfo";
import { spriteSheet } from "../textures";

export class TeamInfoSprite extends GameSprite<TeamInfo> {

  public constructor(spritesheet: PIXI.Spritesheet) {
    super(spriteSheet, TeamInfo);
  }

  public redraw(): void {
    //
  }

  public destroy(): void {
    //
  }
}
