import { Entity, EntityType } from "../entity";
import { CacheEntry } from "../network/cache";
import { GameObjectSchema } from "../network/types";
import { GameWorld } from "../world/world";

export class None extends Entity {
  public static type = EntityType.None;

  public constructor(world: GameWorld) {
    super(world, None);
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
    };
  }
  /*
  public static schema2: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "subType", intType: IntType.Uint8 },
    ],
    booleans: [],
    strings: []
  };
  */
  public static schema: GameObjectSchema = {
    numbers: [
    ],
    booleans: [],
    strings: []
  };
}