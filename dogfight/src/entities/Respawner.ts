import { BufferedImage } from "../BufferedImage";
import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { Player } from "../network/player";
import { GameObjectSchema, IntType } from "../network/types";
import { RectangleBody, Rectangle } from "../physics/rectangle";
import { GameWorld } from "../world/world";
import { PlayerInfo, PlayerStatus } from "./PlayerInfo";
import { SolidEntity } from "./SolidEntity";
import { Ticking } from "./Ticking";
import { Followable } from "./Followable";

export const WAIT_TIMES = [4000, 8000, 10000, 0];
export enum RespawnType {
  Normal,
  Suicide,
  TeamKill,
  Bot
}

export class Respawner extends Entity implements Ticking, Followable {
  public static type = EntityType.Respawner;
  public followed: boolean = false;
  public x: number;
  public y: number;
  public respawnType: number = RespawnType.Normal;
  public startTime: number;
  private waitTime: number;
  private p: PlayerInfo;

  public constructor(world: GameWorld, pi: PlayerInfo = null, x: number = 0, y: number = 0) {
    super(world, Respawner);
    this.p = pi;
    this.x = x;
    this.y = y;
    if (pi != null) {
      this.respawnType = pi.getNextRespawnType();
      pi.setNextRespawnType(RespawnType.Normal);
    }
    this.waitTime = WAIT_TIMES[this.respawnType];
    this.startTime = Date.now();
    this.setData(world.cache, {
      x: x,
      y: y,
      respawnType: this.respawnType
    });
  }

  public setTime(time: number): void {
    this.set(this.world.cache, "time", time);
  }
  public tick(deltaTime: number): void {
    if (Date.now() > this.startTime + this.waitTime) {
      //TODO respawn!!!!
      this.world.removeEntity(this);
      this.p.setNextRespawnType(RespawnType.Normal)
      this.world.respawn(this.p);
    }
  }

  public getCenterX() { return this.x }
  public getCenterY() { return this.y }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      respawnType: this.respawnType,
    };
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "respawnType", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  };
}


