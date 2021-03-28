import { BufferedImage } from "../BufferedImage";
import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { GameObjectSchema, IntType } from "../network/types";
import { RectangleBody, Rectangle } from "../physics/rectangle";
import { GameWorld } from "../world/world";
import { SolidEntity } from "./SolidEntity";


export class Coast extends SolidEntity {
  public type = EntityType.Coast;
  public x: number;
  public y: number;
  public subType: number;
  public images;

  public constructor(id: number, world: GameWorld, cache: Cache, t_x: number = 0, t_y: number = 0, t_subType: number = 0) {
    super(id, world, -1);
    this.images = [
      world.getImage("beach-l.gif"), world.getImage("beach-r.gif"),
      world.getImage("beach-l_desert.gif"), world.getImage("beach-r_desert.gif")];
    this.setData(cache, {
      x: t_x,
      y: t_y,
      subType: t_subType
    });
  }

  public getCollisionBounds(): import("../physics/rectangle").Rectangle {
    return new Rectangle(this.x, this.y, this.images[this.subType].width, this.images[this.subType].height);
  }

  public getCollisionImage(): BufferedImage {
    return this.images[this.subType];
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

export const coastSchema: GameObjectSchema = {
  numbers: [
    { name: "x", intType: IntType.Int16 },
    { name: "y", intType: IntType.Int16 },
    { name: "subType", intType: IntType.Uint8 }
  ],
  booleans: [],
  strings: []
};

