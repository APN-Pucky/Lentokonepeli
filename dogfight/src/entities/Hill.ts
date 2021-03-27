import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { GameWorld } from "../world/world";

export class Hill extends Entity {
  public type = EntityType.Hill;
  public x: number;
  public y: number;
  public terrain: Terrain;

  public constructor(id: number, world: GameWorld, cache: Cache, t_x = 0, t_y = 0, t_subType = Terrain.Normal) {
    super(id, world);
    this.setData(cache, {
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
}
