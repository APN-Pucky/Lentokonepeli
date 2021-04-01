import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { directionToRadians } from "../../../../dogfight/src/physics/helpers";
import { spriteSheet } from "../textures";
import { Bomb } from "../../../../dogfight/src/entities/Bomb";

export class BombSprite extends GameSprite<Bomb> {
  //public x: number;
  //public y: number;
  //public direction: number;

  //private spritesheet: PIXI.Spritesheet;

  private container: PIXI.Container;

  private bomb: PIXI.Sprite;

  public constructor(spritesheet: PIXI.Spritesheet) {
    super(spriteSheet, Bomb);

    //this.x = 0;
    //this.y = 0;
    //this.direction = 0;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();
    const tex = this.spritesheet.textures["bomb.gif"];
    this.bomb = new PIXI.Sprite(tex);
    this.bomb.anchor.set(0.5)
    this.bomb.x = tex.width / 2;
    this.bomb.y = tex.height / 2;

    this.container.zIndex = DrawLayer.Bomb;
    this.container.addChild(this.bomb);

    this.renderables.push(this.container);
  }

  public redraw(): void {
    this.container.position.set(this.entity.x, this.entity.y);
    const rotation = directionToRadians(this.entity.direction);
    this.bomb.rotation = rotation;
  }
  private redrawDebug(): void {
    // debug
    this.debug.clear();
    this.debug.beginFill(0xff00ff);
    const rect = this.entity.getCollisionBounds();
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    this.debug.lineStyle(1, 0xff00ff);
    this.debug.beginFill(0x000000, 0);
    this.debug.drawRect(0, 0, rect.width, rect.height);
    this.debug.drawCircle(0, 0, 2);
    //this.debug.rotation = directionToRadians(this.entity.direction) * -1;
    this.debug.position.set(this.entity.x, this.entity.y);
    this.debug.endFill();
  }

  public destroy(): void {
    //
  }
}
