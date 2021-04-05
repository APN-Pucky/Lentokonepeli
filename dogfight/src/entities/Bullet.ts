import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { Team, SCALE_FACTOR } from "../constants";
import { Vec2d } from "../physics/vector";
import { SolidEntity } from "./SolidEntity";
import { Rectangle } from "../physics/rectangle";
import { Ownable } from "../ownable";
import { GameWorld } from "../world/world";
import { Plane } from "./Plane";
import { Man } from "./Man";
import { Runway } from "./Runway";
import { OwnableSolidEntity } from "./OwnableSolidEntity";
import { BackgroundItem } from "./BackgroundItem";
import { Bomb } from "./Bomb";
import { GameObjectSchema, IntType } from "../network/types";

export const bulletGlobals = {
  speed: 400,
  damage: 25,
  lifetime: 1750 // milliseconds
};

// Like Bullet Engine
export function moveBullet(
  localX: number,
  localY: number,
  vx: number,
  vy: number,
  deltaTime: number
): Vec2d {
  // move the bullet...
  const tstep = deltaTime / 1000;
  return {
    x: localX + tstep * vx,
    y: localY + tstep * vy,
  };
}

export class Bullet extends OwnableSolidEntity {
  public static type = EntityType.Bullet;
  public age: number;
  public localX: number;
  public localY: number;
  public x: number;
  public y: number;
  public width: number = 2;
  public height: number = 2;
  public origin: OwnableSolidEntity; // ID of player who shot it
  public shotBy: number; // ID of player who shot it
  public team: Team; // team of player who shot it
  public vx: number;
  public vy: number;
  public clientVX: number;
  public clientVY: number;

  public speed: number;

  public constructor(
    world: GameWorld,
    x: number,
    y: number,
    angle: number,
    speed: number,
    origin: OwnableSolidEntity = null,
  ) {
    super(world,Bullet, origin == null ? -1 : origin.getTeam());
    this.localX = x * SCALE_FACTOR;
    this.localY = y * SCALE_FACTOR;
    this.speed = (speed + 4) * SCALE_FACTOR * SCALE_FACTOR;
    if (this.speed > 200 * SCALE_FACTOR * SCALE_FACTOR / 25) {
      this.speed = 200 * SCALE_FACTOR * SCALE_FACTOR / 25;
    }
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.clientVX = Math.round(this.vx / SCALE_FACTOR);
    this.clientVY = Math.round(this.vy / SCALE_FACTOR);
    this.origin = origin;
    this.setData(world.cache, {
      x: x,
      y: y,
      age: 0,
      shotBy: origin == null ? -1 : origin.getPlayerInfo().getId(),
      team: origin == null ? -1 : origin.getTeam(),
      clientVX: this.clientVX,
      clientVY: this.clientVY
    });
  }
  getPlayerInfo(): import("./PlayerInfo").PlayerInfo {
    return this.origin.getPlayerInfo();
  }
  getRootOwner(): Ownable {
    return this.origin.getRootOwner();
  }

  public getCollisionBounds(): Rectangle {
    return new Rectangle(this.localX / SCALE_FACTOR, this.localY / SCALE_FACTOR, this.width, this.height);
  }

  public tick(deltaTime: number): void {
    let cache: Cache = this.world.cache;
    this.move(cache, deltaTime);
    this.ageBullet(cache, deltaTime);
  }

  public getDamageFactor(): number {
    if (this.age > 175 * 10) {
      return 0.0;
    }
    let d = this.age / 175.0 / 10;
    d *= d;
    return 1.0 - d;
  }

  private ageBullet(cache: Cache, deltaTime: number): void {
    this.age += deltaTime;
    if (this.age >= 175 * 10) {
      this.hit(null);
    }
  }

  public move(cache: Cache, deltaTime: number): void {
    const newPos = moveBullet(
      this.localX,
      this.localY,
      this.vx,
      this.vy,
      deltaTime
    );
    this.localX = newPos.x;
    this.localY = newPos.y;

    // We don't send this over the network
    // because it's easy enough to calculate client side.
    this.x = Math.round(this.localX / SCALE_FACTOR);
    this.y = Math.round(this.localY / SCALE_FACTOR);

    if (!this.checkCollision()) { };
    /*
    this.setData(cache, {
      x: Math.round(this.localX / SCALE_FACTOR),
      y: Math.round(this.localY / SCALE_FACTOR)
    });
    */
  }

  public setPos(cache: Cache, x: number, y: number): void {
    this.localX = x * SCALE_FACTOR;
    this.localY = y * SCALE_FACTOR;
    this.setData(cache, { x, y });
  }

  //TODO consistency with setPos ? ? either scaled or not
  public setVelocity(cache: Cache, vx: number, vy: number): void {
    this.vx = Math.round(vx);
    this.vy = Math.round(vy);
    this.setData(cache, {
      clientVX: Math.round(this.vx / SCALE_FACTOR),
      clientVY: Math.round(this.vy / SCALE_FACTOR)
    });
  }

  public hit(se: SolidEntity): void {
    let rm: boolean = true;
    let bool: boolean = false;
    if (se instanceof Plane || se instanceof Man) {
      if (this.origin.getPlayerInfo().getId() == se.getPlayerInfo().getId()) {
        rm = false;
      }
      else {
        bool = true;
      }
    }
    if (se instanceof Runway || se instanceof BackgroundItem || se instanceof Bullet || se instanceof Bomb) {
      bool = true;
      //console.log("WTF");
    }
    if (rm) {
      //if (se != null) console.log("hit");
      //console.log("rm");
      this.getPlayerInfo().submitBullet(this, bool);
      this.world.removeEntity(this);
    }
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      age: this.age,
      x: this.x,
      y: this.y,
      clientVX: this.clientVX,
      clientVY: this.clientVY
    };
  }
  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "clientVX", intType: IntType.Int16 },
      { name: "clientVY", intType: IntType.Int16 },
      { name: "age", intType: IntType.Uint16 }
    ],
    booleans: [],
    strings: []
  };  public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}

