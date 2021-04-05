import { FacingDirection } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { RectangleBody, Rectangle } from "../physics/rectangle";
import { GameWorld } from "../world/world";
import { SolidEntity } from "./SolidEntity";

export class Water extends SolidEntity {
  public static type = EntityType.Water;

  public x: number;
  public y: number;
  public width: number;
  public subType: number;

  public constructor(world: GameWorld, t_x: number = 0, t_y: number = 0, t_width: number = 30000, t_subType: number = FacingDirection.Right,) {
    super(world, Water, -1);
    this.setData(world.cache, {
      x: t_x,
      y: t_y,
      width: t_width,
      subType: t_subType
    });
  }

  public getCollisionBounds(): Rectangle {
    return new Rectangle(this.x, this.y + 5, this.width, 100);
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      subType: this.subType
    };
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "width", intType: IntType.Uint16 },
      { name: "subType", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  }; public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}
export function getWaterRect(
  x: number,
  y: number,
  width: number
): RectangleBody {
  return {
    direction: 0,
    width,
    height: 1000,
    center: {
      x,
      y: y - 510
    }
  };
}

