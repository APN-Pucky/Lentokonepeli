import { Team } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { GameWorld } from "../world/world";

export class Flag extends Entity {
  public static type = EntityType.Flag;
  public x: number;
  public y: number;
  public team: Team;

  public constructor(world: GameWorld, t_x = 0, t_y = 0, t_team = Team.Centrals,) {
    super(world,Flag);
    this.setData(world.cache, {
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

  public static getImage(world: GameWorld) {
    return world.getImage("flag_ger_1.gif")
  }
  public static getImageWidth(world: GameWorld): number {
    return Flag.getImage(world,).width;
  }
  public static getImageHeight(world: GameWorld): number {
    return Flag.getImage(world,).height;
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "team", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  };  public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}