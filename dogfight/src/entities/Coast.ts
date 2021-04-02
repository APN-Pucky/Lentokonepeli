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

  public constructor(world: GameWorld, t_x: number = 0, t_y: number = 0, t_subType: number = 0, type = EntityType.Coast, id: number = world.nextID(type), cache: Cache = world.cache,) {
    super(id, world, -1);
    this.type = type;
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
    //console.log(this.subType + "" + this.images[this.subType].width)
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
  public static getImage(world: GameWorld, i: number) {
    if (i == 0)
      return world.getImage("beach-l.gif")
    if (i == 1)
      return world.getImage("beach-l.gif") // mirror!!! TODO?
    if (i == 2)
      return world.getImage("beach-l_desert.gif")
    if (i == 3)
      return world.getImage("beach-l_desert.gif") // mirror!!! TODO?
    return null;
  }
  public static getImageWidth(world: GameWorld, i: number): number {
    return Coast.getImage(world, i).width;
  }
  public static getImageHeight(world: GameWorld, i: number): number {
    return Coast.getImage(world, i).height;
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

