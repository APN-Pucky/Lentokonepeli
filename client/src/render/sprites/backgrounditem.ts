import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { Terrain, FacingDirection } from "../../../../dogfight/src/constants";

export class BackgroundItemSprite extends GameSprite {
  public x: number;
  public y: number;
  public subType: number;

  private spritesheet: PIXI.Spritesheet;

  private container: PIXI.Container;

  private tower: PIXI.Sprite;


  public constructor(spritesheet: PIXI.Spritesheet) {
    super();

    this.x = 0;
    this.y = 0;
    this.subType = 0;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();

    const tex: PIXI.Texture = spritesheet.textures["palmtree.gif"];
    this.tower = new PIXI.Sprite(tex);


    this.container.addChild(this.tower);
    this.container.zIndex = DrawLayer.ControlTower;

    this.renderables.push(this.container);
  }

  public redraw(): void {
    // update tex
    let tex: string;
    if (this.subType < 2) {
      tex = "controlTower.gif"
    }
    else if (this.subType < 4) {
      tex = "controlTowerDesert.gif"
    }
    else {
      tex = "palmtree.gif"
    }

    this.tower.texture = this.spritesheet.textures[tex];


    // orient properly
    if (this.subType % 2 == 1) {
      this.tower.scale.x = -1;
      this.tower.position.x = this.tower.texture.width;
    } else {
      this.tower.scale.x = 1;
      this.tower.position.x = 0;
    }
    this.tower.position.y = -this.tower.texture.height;
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
