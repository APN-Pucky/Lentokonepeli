import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer, WaterColor } from "../constants";
import { Terrain, FacingDirection } from "../../../../dogfight/src/constants";
import { Coast } from "../../../../dogfight/src/entities/Coast";
import { WATER_HEIGHT } from "./water";
import { Water } from "../../../../dogfight/src/entities/Water";

export class CoastSprite extends GameSprite {
  public x: number;
  public y: number;
  public subType: number;

  private spritesheet: PIXI.Spritesheet;

  private container: PIXI.Container;

  private beach: PIXI.Sprite;

  private color: WaterColor;
  private water: PIXI.Graphics;
  //private towerWidth: number;

  public constructor(spritesheet: PIXI.Spritesheet) {
    super();

    this.x = 0;
    this.y = 0;
    this.subType = 0;
    this.color = WaterColor.Normal;
    //this.direction = FacingDirection.Right;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();
    this.water = new PIXI.Graphics();
    const tex: PIXI.Texture = spritesheet.textures["beach-l.gif"];
    this.beach = new PIXI.Sprite(tex);
    this.beach.position.y = -tex.height;

    this.container.addChild(this.water);
    this.container.addChild(this.beach);
    this.container.zIndex = DrawLayer.Coast;

    this.renderables.push(this.container);
  }

  public redraw(): void {
    // orient properly
    if (this.subType == 1 || this.subType == 3) {
      this.beach.scale.x = -1;
      this.beach.position.x = this.container.width;
      //this.beach.position.x = 0;
    } else {
      this.beach.scale.x = 1;
      this.beach.position.x = 0;
    }
    // update terrain
    let tex: string;
    switch (this.subType) {
      case 0:
        tex = "beach-l.gif";
        break;
      case 1:
        tex = "beach-l.gif";
        break;
      case 2:
        tex = "beach-l_desert.gif";
        this.color = WaterColor.Desert
        break;
      case 3:
        tex = "beach-l_desert.gif";
        this.color = WaterColor.Desert
        break;
    }

    this.beach.texture = this.spritesheet.textures[tex];

    /*
    //this.water.y = +10;
    //this.water.clear();
    this.water.beginFill(this.color);
    this.water.drawRect(0, 0, this.beach.texture.width, WATER_HEIGHT);
    this.water.endFill();
    //*/

    ///*
    // center tower
    const halfWidth = Math.round(this.container.width / 2);
    this.container.x = this.x - halfWidth;

    // update height
    const offset = 5;
    this.container.position.y = this.y + Math.round(this.container.height / 2);
    //this.container.position.x = this.x;
    //*/

    ///*
    this.water.y = 0;
    this.water.clear();
    this.water.beginFill(this.color);
    this.water.drawRect(0, 0, this.beach.texture.width, WATER_HEIGHT);
    this.water.endFill();
    //*/
  }

  public destroy(): void {
    //
  }
}
