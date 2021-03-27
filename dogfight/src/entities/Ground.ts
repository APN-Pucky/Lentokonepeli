import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { RectangleBody, Rectangle } from "../physics/rectangle";
import { GameWorld } from "../world/world";
import { SolidEntity } from "./SolidEntity";

export class Ground extends SolidEntity {
  public type = EntityType.Ground;
  public x: number;
  public y: number;
  public width: number;
  public terrain: Terrain;
  public image;
  private yHitOffset = 6.5; // 6.5 since image.height/2 == 18.5 and offset is 25

  public constructor(id: number, world: GameWorld, cache: Cache, t_x: number = 0, t_y: number = 0, t_width: number = 0, subType: number = 0) {
    super(id, world, -1);
    this.image = world.getImage("ground1.gif");
    this.setData(cache, {
      x: t_x,
      y: t_y,
      width: t_width,
      terrain: subType
    });
  }

  public getCollisionBounds(): import("../physics/rectangle").Rectangle {
    //console.log("height " + this.image.getHeight() / 2);
    return new Rectangle(this.x, this.y - this.image.getHeight() / 2 - this.yHitOffset, this.width, this.image.getHeight());
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      terrain: this.terrain
    };
  }
}

export function getGroundRect(
  x: number,
  y: number,
  width: number
): RectangleBody {
  return {
    width: width,
    height: 40,
    center: {
      x,
      y: y - 25
    },
    direction: 0
  };
}
