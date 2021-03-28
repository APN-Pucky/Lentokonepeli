import { Team } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { GameWorld } from "../world/world";

export class Flag extends Entity {
  public type = EntityType.Flag;
  public x: number;
  public y: number;
  public team: Team;

  public constructor(id: number, world: GameWorld, cache: Cache, t_x = 0, t_y = 0, t_team = Team.Centrals) {
    super(id, world);
    this.setData(cache, {
      x: t_x,
      y: t_y,
      team: t_team
    });
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      team: this.team
    };
  }
}

export const flagSchema: GameObjectSchema = {
  numbers: [
    { name: "x", intType: IntType.Int16 },
    { name: "y", intType: IntType.Int16 },
    { name: "team", intType: IntType.Uint8 }
  ],
  booleans: [],
  strings: []
};