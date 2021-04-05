import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { GameWorld } from "../world/world";

export class Hill extends Entity {
  public static type = EntityType.Hill;
  public x: number;
  public y: number;
  public terrain: Terrain;

  public constructor(world: GameWorld, t_x = 0, t_y = 0, t_subType = Terrain.Normal) {
    super(world,Hill);
    this.setData(world.cache, {
      x: t_x,
      y: t_y,
      terrain: t_subType
    });
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      terrain: this.terrain
    };
  }
  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "terrain", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  };  public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}