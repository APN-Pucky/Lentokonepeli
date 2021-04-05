import { BufferedImage } from "../BufferedImage";
import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { RectangleBody, Rectangle } from "../physics/rectangle";
import { GameWorld } from "../world/world";
import { SolidEntity } from "./SolidEntity";
import { Ticking } from "./Ticking";

export enum ClockColor {
  base = 0xAFAF5A,
  special = 0xFF8246
}


export class Clock extends Entity implements Ticking {
  public static type = EntityType.Clock;
  public x: number;
  public y: number;
  public time: number;

  public constructor(world: GameWorld) {
    super(world,Clock);
    this.setTime(0);
  }

  public setTime(time: number): void {
    this.set(this.world.cache, "time", time);
  }
  public tick(deltaTime: number): void {
    let ttime = Math.round(this.world.getGameTimeLeft() / 1000);
    //console.log(ttime);
    if (ttime != this.time)
      this.setTime(ttime);
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      time: this.time,
    };
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "time", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  };  public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}

