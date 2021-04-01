import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import {
  TrooperState,
  TrooperDirection,
  getTrooperRect, Man
} from "../../../../dogfight/src/entities/Man";
import { Team } from "../../../../dogfight/src/constants";
import { spriteSheet } from "../textures";
import { GameWorld } from "../../../../dogfight/src/world/world";

const frameDelay = 100; // milliseconds to update walk
const walkFrames = ["parachuter2.gif", "parachuter3.gif"];

export class TrooperSprite extends GameSprite<Man> {
  //public x: number;
  //public y: number;
  //public health: number;
  //public state: TrooperState;
  //public direction: TrooperDirection;
  //public team: Team;

  public container: PIXI.Container;
  //private spritesheet: PIXI.Spritesheet;

  private trooper: PIXI.Sprite;
  private interval: number;
  private walkIndex: number = 0;

  //private debug: PIXI.Graphics;

  public constructor(spritesheet: PIXI.Spritesheet, world: GameWorld = new GameWorld(spriteSheet.textures)) {
    super(spriteSheet, Man, world);
    this.debugcolor = 0x00ffff;

    //this.x = 0;
    //this.y = 0;
    //this.health = 1;
    //this.direction = TrooperDirection.None;
    //this.team = Team.Centrals;
    //this.state = TrooperState.Standing;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();
    //this.debug = new PIXI.Graphics();

    const texture = spritesheet.textures[this.getTexture()];
    this.trooper = new PIXI.Sprite(texture);
    // this.trooper.x = -Math.round(texture.width / 2);

    this.trooper.anchor.x = 0;
    this.trooper.anchor.y = 0;

    this.container.addChild(this.trooper);
    this.container.zIndex = DrawLayer.Trooper;
    //this.debug.zIndex = DrawLayer.Trooper;

    this.renderables.push(this.container);
    //this.renderablesDebug.push(this.debug);

    this.interval = window.setInterval((): void => {
      this.pimpWalk();
    }, frameDelay);
  }

  private getTexture(): string {
    if (this.entity.state == TrooperState.Parachuting) {
      return "parachuter1.gif";
    }
    if (this.entity.state == TrooperState.Walking_LEFT || this.entity.state == TrooperState.Walking_RIGHT) {
      return walkFrames[this.walkIndex];
    }
    return "parachuter0.gif";
  }

  private pimpWalk(): void {
    if (this.entity.state == TrooperState.Walking_LEFT || this.entity.state == TrooperState.Walking_RIGHT) {
      this.walkIndex = this.walkIndex ? 0 : 1;
      const tex = this.spritesheet.textures[walkFrames[this.walkIndex]];
      this.trooper.texture = tex;
    }
  }

  /*
  private drawDebug(): void {
    const rect = getTrooperRect(this.entity.x, this.entity.y, this.entity.state);
    this.debug.clear();
    this.debug.beginFill(0xff00ff);
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    this.debug.lineStyle(1, 0xff00ff);
    this.debug.beginFill(0x000000, 0);
    this.debug.drawRect(-halfW, -halfH, rect.width, rect.height);
    this.debug.drawCircle(0, halfH, 1);
    this.debug.position.set(this.entity.x, this.entity.y - halfH);
    this.debug.endFill();
  }
  */

  public redraw(): void {
    // update texture state
    this.trooper.texture = this.spritesheet.textures[this.getTexture()];
    /*
    if (this.entity.state == TrooperState.Walking_LEFT || this.entity.state == TrooperState.Walking_RIGHT) {
      const dir = this.entity.state == TrooperState.Walking_LEFT ? 1 : -1;
      // const d = TrooperDirection[this.direction];
      // console.log(dir, d);
      // this.trooper.anchor.x = dir;
      this.trooper.scale.x = dir;
    } else {
      this.trooper.scale.x = 1;
    }
    */
    //this.trooper.y = -Math.round(this.trooper.texture.height) / 2;
    //console.log(this.entity.getCollisionBounds())
    //this.drawDebug();
    //this.container.position.set(this.entity.x, this.entity.y);
    this.trooper.height = this.trooper.height;
    this.trooper.x = this.entity.x;
    this.trooper.y = this.entity.y - this.trooper.height + this.trooper.texture.height;
  }

  public destroy(): void {
    window.clearInterval(this.interval);
  }
}
