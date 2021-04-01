import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { FacingDirection, Team } from "../../../../dogfight/src/constants";
import { DrawLayer, TeamColor } from "../constants";
import { ImportantBuilding } from "../../../../dogfight/src/entities/ImportantBuilding";
import { spriteSheet } from "../textures";
import { GameWorld } from "../../../../dogfight/src/world/world";

const HEALTH_BAR_HEIGHT = 3;

export class ImportantBuildingSprite extends GameSprite<ImportantBuilding> {
  static getImageWidth(world: GameWorld, arg1: number) {
    throw new Error("Method not implemented.");
  }
  //public x: number;
  //public y: number;
  //public buildingType: number;
  //public health: number;
  //public team: number;

  public lastHealth: number;
  public blinkTime: number;
  private nofilter;


  public importantbuilding: PIXI.Sprite;
  //private backpart: PIXI.Sprite;
  private healthBar: PIXI.Graphics;


  public constructor(spritesheet: PIXI.Spritesheet, world: GameWorld = new GameWorld(spriteSheet.textures)) {
    super(spriteSheet, ImportantBuilding, world);

    //this.x = 0;
    //this.y = 0;
    //this.buildingType = 0;
    //this.health = 255;

    //this.spritesheet = spritesheet;

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
    if (this.entity.buildingType == 0) {
      const tex = this.entity.health > 0 ? "headquarter_germans.gif" : "headquarter_broke.gif";
      this.importantbuilding.texture = this.spritesheet.textures[tex];
    } else {
      const tex = this.entity.health > 0 ? "headquarter_raf.gif" : "headquarter_broke.gif";
      this.importantbuilding.texture = this.spritesheet.textures[tex];
    }
    if (this.entity.health > 0) {
      if (this.entity.health < this.lastHealth) {
        this.blinkTime = Date.now();
      }
      this.lastHealth = this.entity.health;
      if (this.blinkTime + 100 > Date.now()) {
        //playBlinkSound();
        //this.nofilter = this.importantbuilding.filters;
        let filter = new PIXI.filters.ColorMatrixFilter();
        filter.matrix = [
          10, 10, 10, 10,
          10, 10, 10, 10,
          10, 10, 10, 10,
          -1, -1, -1, 1
        ];
        this.importantbuilding.filters = [filter];
        //console.log("active");
        setTimeout(() => { this.redraw() }, 100);
      }
      else {
        this.importantbuilding.filters = 'null';

      }
    }
    // center runway on x
    /*
    const halfWidth = Math.round(this.importantbuilding.width / 2);
    this.importantbuilding.x = this.entity.x - halfWidth;
    this.importantbuilding.y = this.entity.y - Math.round(this.importantbuilding.height / 2);
    */
    this.importantbuilding.x = this.entity.x;
    this.importantbuilding.y = this.entity.y;

    // update height
    //const offset = 25 - 7; //this.direction == RunwayDirection.Right ? 25 : 25;
    //this.importantbuilding.position.y = this.y - offset;

    // draw health bars
    this.drawHealthBar();
  }

  private drawHealthBar(): void {
    if (this.entity.health <= 0) {
      this.healthBar.visible = false;
      return;
    }
    this.healthBar.visible = true;

    this.healthBar.position.x = this.entity.x + 10;
    this.healthBar.position.y = this.entity.y + this.entity.getImageHeight(this.entity.buildingType) - 3 - 1;

    // ¯\_(ツ)_/¯
    //if (this.direction == FacingDirection.Left) {
    //  this.healthBar.position.x += 4;
    //}

    const color =
      this.entity.buildingType == 0
        ? TeamColor.OpponentBackground
        : TeamColor.OwnBackground;

    const amount = Math.round((this.importantbuilding.width - 20) * (this.entity.health / 255));

    this.healthBar.clear();
    this.healthBar.beginFill(color);
    this.healthBar.drawRect(0, 0, amount, HEALTH_BAR_HEIGHT);
    this.healthBar.endFill();
  }

  public destroy(): void {
    //
  }
}
