import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { Terrain, FacingDirection } from "../../../../dogfight/src/constants";
import { Coast } from "../../../../dogfight/src/entities/Coast";

export class CoastSprite extends GameSprite {
  public x: number;
  public y: number;
  public subType: number;

  private spritesheet: PIXI.Spritesheet;

  private container: PIXI.Container;

  private tower: PIXI.Sprite;

  //private towerWidth: number;

  public constructor(spritesheet: PIXI.Spritesheet) {
    super();

    this.x = 0;
    this.y = 0;
    this.subType = 0;
    //this.direction = FacingDirection.Right;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();

    const tex: PIXI.Texture = spritesheet.textures["controlTower.gif"];
    this.tower = new PIXI.Sprite(tex);
    this.tower.position.y = -tex.height;

    this.container.addChild(this.tower);
    this.container.zIndex = DrawLayer.ControlTower;

    this.renderables.push(this.container);
  }

  public redraw(): void {
    // orient properly
    if (this.direction == FacingDirection.Left) {
      this.tower.scale.x = -1;
      this.tower.position.x = this.towerWidth;
    } else {
      this.tower.scale.x = 1;
      this.tower.position.x = 0;
    }
    // update terrain
    const tex =
      this.terrain == Terrain.Normal
        ? "controlTower.gif"
        : "controlTowerDesert.gif";

    this.tower.texture = this.spritesheet.textures[tex];

    // center tower
    const halfWidth = Math.round(this.container.width / 2);
    this.container.x = this.x - halfWidth;

    // update height
    const offset = 5;
    this.container.position.y = -this.y + offset;
  }

  public destroy(): void {
    //
  }
}
