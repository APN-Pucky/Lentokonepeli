import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { FacingDirection, Team } from "../../../../dogfight/src/constants";
import { DrawLayer, TeamColor } from "../constants";

const HEALTH_BAR_HEIGHT = 3;

export class ImportantBuildingSprite extends GameSprite {
  public x: number;
  public y: number;
  public buildingType: number;
  public health: number;
  public team: number;

  private spritesheet: PIXI.Spritesheet;

  public importantbuilding: PIXI.Sprite;
  //private backpart: PIXI.Sprite;
  private healthBar: PIXI.Graphics;


  public constructor(spritesheet: PIXI.Spritesheet) {
    super();

    this.x = 0;
    this.y = 0;
    this.buildingType = 0;
    this.health = 255;
    console.log("CREATED");

    this.spritesheet = spritesheet;

    const texture = spritesheet.textures["headquarter_germans.gif"];

    this.importantbuilding = new PIXI.Sprite(texture);


    this.healthBar = new PIXI.Graphics();
    this.healthBar.position.x = 10;
    this.healthBar.position.y = -texture.height - 4;

    this.importantbuilding.zIndex = DrawLayer.Runway;
    this.healthBar.zIndex = DrawLayer.Runway;

    this.renderables.push(this.importantbuilding);
    this.renderables.push(this.healthBar);
  }

  public redraw(): void {
    // set direction and appropriate texture
    if (this.buildingType == 0) {
      const tex = this.health > 0 ? "headquarter_germans.gif" : "headquarter_broke.gif";
      this.importantbuilding.texture = this.spritesheet.textures[tex];
    } else {
      const tex = this.health > 0 ? "headquarter_raf.gif" : "headquarter_broke.gif";
      this.importantbuilding.texture = this.spritesheet.textures[tex];
    }

    // center runway on x
    const halfWidth = Math.round(this.importantbuilding.width / 2);
    this.importantbuilding.x = this.x - halfWidth;

    this.importantbuilding.y = this.y - Math.round(this.importantbuilding.height / 2);
    // update height
    //const offset = 25 - 7; //this.direction == RunwayDirection.Right ? 25 : 25;
    //this.importantbuilding.position.y = this.y - offset;

    // draw health bars
    this.drawHealthBar();
  }

  private drawHealthBar(): void {
    if (this.health <= 0) {
      this.healthBar.visible = false;
      return;
    }
    this.healthBar.visible = true;

    this.healthBar.position.y = this.y + 7;
    this.healthBar.position.x = this.x - Math.round(this.importantbuilding.width / 2) + 10;

    // ¯\_(ツ)_/¯
    //if (this.direction == FacingDirection.Left) {
    //  this.healthBar.position.x += 4;
    //}

    const color =
      this.buildingType == 0
        ? TeamColor.OpponentBackground
        : TeamColor.OwnBackground;

    const amount = Math.round((this.importantbuilding.width - 20) * (this.health / 255));

    this.healthBar.clear();
    this.healthBar.beginFill(color);
    this.healthBar.drawRect(0, 0, amount, HEALTH_BAR_HEIGHT);
    this.healthBar.endFill();
  }

  public destroy(): void {
    //
  }
}
