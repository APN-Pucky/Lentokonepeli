import { FacingDirection, Team, Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { GameWorld } from "../world/world";

//TODO
export class Tower extends Entity {
  public type = EntityType.ControlTower;

  public x: number;
  public y: number;
  public terrain: Terrain;
  public direction: FacingDirection;

  public constructor(id: number, world: GameWorld, cache: Cache, t_x = 0, t_y = 0, t_subType = 0, t_direction = FacingDirection.Right) {
    super(id, world);
    this.setData(cache, {
      x: t_x,
      y: t_y,
      terrain: t_subType,
      direction: t_direction
    });
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      terrain: this.terrain,
      direction: this.direction
    };
  }
}
