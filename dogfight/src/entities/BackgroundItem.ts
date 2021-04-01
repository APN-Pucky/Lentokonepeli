import { FacingDirection, Team, Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { GameWorld } from "../world/world";

//TODO
export class BackgroundItem extends Entity {
  public type = EntityType.BackgroundItem;

  public x: number;
  public y: number;
  public subType: FacingDirection;

  public constructor(world: GameWorld, t_x = 0, t_y = 0, t_subType = 0,type = EntityType.BackgroundItem,id: number = world.nextID(type), cache: Cache  =world.cache, ) {
    super(id, world);
    this.type = type;
    this.setData(cache, {
      x: t_x,
      y: t_y,
      subType: t_subType
    });
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      subType: this.subType
    };
  }
}
export const backgroundItemSchema: GameObjectSchema = {
  numbers: [
    { name: "x", intType: IntType.Int16 },
    { name: "y", intType: IntType.Int16 },
    { name: "subType", intType: IntType.Uint8 },
  ],
  booleans: [],
  strings: []
};