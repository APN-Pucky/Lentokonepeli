import * as PIXI from "pixi.js";
import { SCALE_FACTOR } from "../../../dogfight/src/constants";
import { SolidEntity } from "../../../dogfight/src/entities/SolidEntity";
import { Entity, EntityType } from "../../../dogfight/src/entity";
import { GameWorld } from "../../../dogfight/src/world/world";
import { spriteSheet } from "./textures";

export abstract class GameSprite<T extends Entity> {
  public id: number;
  public entity: T;
  private world: GameWorld;
  public type: EntityType;
  public spritesheet: PIXI.Spritesheet;
  public debug: PIXI.Graphics;
  public renderables: PIXI.Container[] = [];
  public renderablesDebug: PIXI.Container[] = [];
  public debugcolor = 0xff00ff;

  public constructor(spritesheet: PIXI.Spritesheet, type: { new(...args: any[]): T; }, world: GameWorld = new GameWorld(spriteSheet.textures)) {
    this.renderables = [];
    this.renderablesDebug = [];
    this.spritesheet = spriteSheet;
    this.world = world;
    this.entity = new type(this.world);

    this.debug = new PIXI.Graphics();
    this.renderablesDebug.push(this.debug);
  }


  /**
   * Updates a game object's display after new property changes.
   */
  public update(data: any): void {
    for (const key in data) {
      let value = data[key];
      if (key == "y" || key == "x") {
        this.entity["local" + key.toUpperCase()] = data[key] * SCALE_FACTOR;
        // kind of hacky, but it is what it is.
        //value *= -1;
      }
      this.entity[key] = value;
    }
    this.redraw();
    this.redrawDebug();
  }

  /**
   * Renders a game sprite based on the object's properties.
   * Should be called after properties are updated.
   */
  public abstract redraw(): void;
  public redrawDebug(): void {
    if (this.entity instanceof SolidEntity) {
      // debug
      this.debug.clear();
      this.debug.beginFill(this.debugcolor);
      const rect = this.entity.getCollisionBounds();
      //const rect = getPlaneRect(this.entity.x, this.entity.y, this.entity.direction, this.entity.planeType);
      this.debug.lineStyle(1, this.debugcolor);
      this.debug.beginFill(0x000000, 0);
      this.debug.drawRect(0, 0, rect.width, rect.height);
      //this.debug.drawCircle(0, 0, 2);
      //this.debug.rotation = directionToRadians(this.entity.direction) * -1;
      this.debug.position.set(rect.x, rect.y);
      this.debug.endFill();
    }
  };

  /**
   * Called when a game object is deleted.
   * Used to clear pixi memory, callbacks,
   * and other client things floating about.
   */
  public abstract destroy(): void;
}
