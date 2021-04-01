import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { FacingDirection, Team } from "../../../../dogfight/src/constants";
import { DrawLayer, TeamColor } from "../constants";
import { spriteSheet } from "../textures";
import { Runway } from "../../../../dogfight/src/entities/Runway";
import { GameWorld } from "../../../../dogfight/src/world/world";

const HEALTH_BAR_HEIGHT = 3;

export class RunwaySprite extends GameSprite<Runway> {
  //public x: number;
  //public y: number;
  //public direction: FacingDirection;
  //public team: Team;
  //public health: number;

  public lastHealth: number;
  public blinkTime: number;

  //private spritesheet: PIXI.Spritesheet;

  public runway: PIXI.Sprite;
  private backpart: PIXI.Sprite;
  private healthBar: PIXI.Graphics;

  private runwayWidth: number;

  public constructor(spritesheet: PIXI.Spritesheet, world: GameWorld = new GameWorld(spriteSheet.textures)) {
    super(spriteSheet, Runway, world);

    //this.x = 0;
    //this.y = 0;
    //this.direction = FacingDirection.Right;
    //this.team = Team.Centrals;
    //this.health = 255;

    this.spritesheet = spritesheet;

    const texture = spritesheet.textures["runway.gif"];
    const backTex = spritesheet.textures["runway2b.gif"];

    this.runwayWidth = texture.width;

    this.runway = new PIXI.Sprite(texture);

    this.backpart = new PIXI.Sprite(backTex);
    //this.backpart.x = 217;
    this.backpart.visible = false;

    this.healthBar = new PIXI.Graphics();
    this.healthBar.position.x = 10;
    this.healthBar.position.y = texture.height - 4;

    this.runway.zIndex = DrawLayer.Runway;
    this.healthBar.zIndex = DrawLayer.Runway;
    this.backpart.zIndex = DrawLayer.RunwayBack;

    this.renderables.push(this.runway);
    this.renderables.push(this.backpart);
    this.renderables.push(this.healthBar);
  }

  public redraw(): void {
    // set direction and appropriate texture
    if (this.entity.direction == FacingDirection.Right) {
      const tex = this.entity.health > 0 ? "runway.gif" : "runway_broke.gif";
      this.runway.texture = this.spritesheet.textures[tex];
      this.backpart.visible = false;
    } else {
      const tex = this.entity.health > 0 ? "runway2.gif" : "runway2_broke.gif";
      this.runway.texture = this.spritesheet.textures[tex];
      this.backpart.visible = this.entity.health > 0;
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
        this.runway.filters = [filter];
        this.backpart.filters = [filter];
        //console.log("active");
        setTimeout(() => { this.redraw() }, 100);
      }
      else {
        this.runway.filters = 'null';
        this.backpart.filters = 'null';

      }
    }
    // center runway on x
    /*
    const halfWidth = Math.round(this.runway.width / 2);
    this.runway.x = this.entity.x - halfWidth;
    
    // back part
    this.backpart.position.x = this.entity.x + 76;
    this.backpart.position.y = this.entity.y - 25;
    
    // update height
    const offset = 25; //this.direction == RunwayDirection.Right ? 25 : 25;
    this.runway.position.y = this.entity.y - offset;
    */
    this.runway.x = this.entity.x;
    this.runway.y = this.entity.y;

    this.backpart.position.x = this.entity.x + 217;
    this.backpart.position.y = this.entity.y;


    // draw health bars
    this.drawHealthBar();
  }

  private drawHealthBar(): void {
    if (this.entity.health <= 0) {
      this.healthBar.visible = false;
      return;
    }
    this.healthBar.visible = true;

    this.healthBar.position.y = this.entity.y + this.entity.getImageHeight(this.entity.direction) - 3 - 1;
    this.healthBar.position.x = this.entity.x + 10;

    // ¯\_(ツ)_/¯
    /*
    if (this.entity.direction == FacingDirection.Left) {
      this.healthBar.position.x += 4;
    }
    */

    const color =
      this.entity.team == Team.Allies
        ? TeamColor.OpponentBackground
        : TeamColor.OwnBackground;

    const amount = Math.round((this.runwayWidth - 20) * (this.entity.health / 255));

    this.healthBar.clear();
    this.healthBar.beginFill(color);
    this.healthBar.drawRect(0, 0, amount, HEALTH_BAR_HEIGHT);
    this.healthBar.endFill();
  }

  public destroy(): void {
    //
  }
}
