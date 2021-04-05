import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import { Terrain, FacingDirection } from "../../../../dogfight/src/constants";
import { BackgroundItem } from "../../../../dogfight/src/entities/BackgroundItem";
import { spriteSheet } from "../textures";
import { Respawner, RespawnType, WAIT_TIMES } from "../../../../dogfight/src/entities/Respawner";

export enum RespawnColor {
  FG = 0xafaf5a,
  BG = 0x32325a,
}



export class RespawnerSprite extends GameSprite<Respawner> {
  //public x: number;
  //public y: number;
  //public subType: number;

  //private spritesheet: PIXI.Spritesheet;

  private container: PIXI.Container;

  private time: PIXI.Text;
  private penalty: PIXI.Text;
  private info: PIXI.Text;
  private interval;



  public constructor(spritesheet: PIXI.Spritesheet) {
    super(spriteSheet, Respawner);

    //this.x = 0;
    //this.y = 0;
    //this.subType = 0;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();


    this.info = new PIXI.Text("", {
      font: "arial",
      fontSize: 20,
      fill: RespawnColor.FG,
      //stroke: RespawnColor.BG,
      //strokeThickness: 1,
      fontWeight: "bold"
    }
    );
    this.time = new PIXI.Text("", {
      font: "arial",
      fontSize: 255,
      fill: RespawnColor.FG,
      //stroke: RespawnColor.BG,
      //strokeThickness: 1,
      fontWeight: "bold"
    }
    );
    this.penalty = new PIXI.Text("", {
      font: "arial",
      fontSize: 20,
      fill: RespawnColor.FG,
      stroke: RespawnColor.BG,
      strokeThickness: 1,
      //fontWeight: "bold"
    }
    );


    this.container.addChild(this.info);
    this.container.addChild(this.time);
    this.container.addChild(this.penalty);
    this.container.zIndex = DrawLayer.Respawner;

    this.renderables.push(this.container);
    this.interval = setInterval(() => { this.redraw() }, 500);
    console.log("created respawner");
  }

  public redraw(): void {
    // update tex
    if (this.entity.followed) {
      this.info.text = "respawning in ";
      let i: number = Math.round((WAIT_TIMES[this.entity.respawnType] - (Date.now() - this.entity.startTime)) / 1000);
      this.time.text = "" + i;

      switch (this.entity.respawnType) {
        case RespawnType.Normal:
          this.penalty.text = "";
          break;
        case RespawnType.Suicide:
          //this.penalty.y = 70;
          this.penalty.text = "suicide penalty";
          break;
        case RespawnType.TeamKill:
          //this.penalty.y = 70;
          this.penalty.text = "teamkill penalty";
          break;
      }

      this.time.y = -this.time.height / 2;
      this.time.x = - this.time.width / 2;
      this.info.y = -this.time.height / 2 - this.info.height / 2;
      this.info.x = - this.info.width / 2;
      this.penalty.x = - this.penalty.width / 2;
      this.penalty.y = this.time.height / 2
      this.container.x = this.entity.x;
      this.container.y = this.entity.y;
      console.log(this.entity.respawnType + " 2 " + this.entity.startTime);
      console.log(this.time.text);
      console.log(this.entity.x + " / " + this.entity.y);
    }
  }

  public destroy(): void {
    clearInterval(this.interval);
    //
  }
}