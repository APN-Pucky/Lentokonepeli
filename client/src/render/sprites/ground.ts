import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer, WaterColor } from "../constants";
import { Terrain } from "../../../../dogfight/src/constants";
import { getGroundRect, Ground } from "../../../../dogfight/src/entities/Ground";
import { WATER_HEIGHT } from "./water";
import { spriteSheet } from "../textures";

export class GroundSprite extends GameSprite<Ground> {
  //public x: number;
  //public y: number;
  //public terrain: Terrain;
  //public width: number;

  //private spritesheet: PIXI.Spritesheet;

  private container: PIXI.Container;

  private ground: PIXI.TilingSprite;
  private textureGround: PIXI.Texture
  private textureDesert: PIXI.Texture

  private color: WaterColor;
  private water: PIXI.Graphics;
  //private debug: PIXI.Graphics;
  private once: boolean = true;

  public constructor(spritesheet: PIXI.Spritesheet) {
    super(spriteSheet, Ground);
    //this.x = 0;
    //this.y = 0;
    //this.terrain = Terrain.Normal;
    //this.width = 500;
    this.color = WaterColor.Normal;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();
    this.water = new PIXI.Graphics();
    this.debug = new PIXI.Graphics();
    this.debug.zIndex = DrawLayer.Ground;


    this.textureGround = spritesheet.textures["ground1.gif"];
    this.textureDesert = spritesheet.textures["groundDesert.gif"];

    this.ground = new PIXI.TilingSprite(this.textureGround);
    this.ground.height = this.textureGround.height;

    this.container.addChild(this.water);
    this.container.addChild(this.ground);
    //this.container.addChild(this.beachLeft);
    //this.container.addChild(this.beachRight);

    this.container.zIndex = DrawLayer.Ground;

    this.renderables.push(this.container);
    this.renderablesDebug.push(this.debug);
  }

  private drawDebug(): void {
    const rect = getGroundRect(this.entity.x, this.entity.y, this.entity.width);
    this.debug.clear();
    this.debug.beginFill(0x00ff00);
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    this.debug.drawRect(-halfW, -halfH, rect.width, rect.height);
    this.debug.position.set(rect.center.x, rect.center.y * -1);
    this.debug.endFill();
  }

  public redraw(): void {
    if (this.entity.terrain == Terrain.Desert) {
      this.ground.texture = this.textureDesert;
      this.color = WaterColor.Desert
    }
    else {
      this.ground.texture = this.textureGround;
    }
    // create water
    this.water.y = +10;
    this.water.clear();
    this.water.beginFill(this.color);
    this.water.drawRect(0, 0, this.entity.width, WATER_HEIGHT);
    this.water.endFill();
    this.ground.width = this.entity.width;
    //this.beachRight.scale.x = -1;
    //this.beachLeft.position.x = 0;
    //this.ground.position.x = this.beachLeft.width;
    //this.beachRight.position.x =
    //  this.ground.position.x + this.ground.width + this.beachRight.width;
    // center ground
    /*
    const halfWidth = Math.round(this.container.width / 2);
    this.container.x = this.entity.x - halfWidth;
    */
    this.container.x = this.entity.x;
    this.container.y = this.entity.y;
    //this.drawDebug();
  }

  public destroy(): void {
    //
  }
}
