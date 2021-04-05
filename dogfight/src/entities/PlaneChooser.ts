import { BufferedImage } from "../BufferedImage";
import { Terrain } from "../constants";
import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { Player } from "../network/player";
import { GameObjectSchema, IntType } from "../network/types";
import { RectangleBody, Rectangle } from "../physics/rectangle";
import { GameWorld } from "../world/world";
import { PlayerInfo } from "./PlayerInfo";
import { SolidEntity } from "./SolidEntity";
import { Ticking } from "./Ticking";

export class PlaneChooser extends Entity implements Ticking {
  public type = EntityType.Respawner;
  public x: number;
  public y: number;
  public respawnType: number;
  private waitTime: number;
  private startTime: number;
  private p: PlayerInfo;

  public constructor(world: GameWorld, pi: PlayerInfo, x: number, y: number, type = EntityType.Respawner, id: number = world.nextID(type), cache: Cache = world.cache,) {
    super(id, world);
    this.type = type;
    this.p = pi;
    this.x = x;
    this.y = y;
    this.respawnType = pi.getNextRespawnType();
    this.waitTime = WAIT_TIMES[this.respawnType];
    this.startTime = Date.now();
    pi.setNextRespawnType(RespawnType.Normal);
  }

  public setTime(time: number): void {
    this.set(this.world.cache, "time", time);
  }
  public tick(deltaTime: number): void {
    if (Date.now() > this.startTime + this.waitTime) {
      //respawn!!!!
      this.p.setStatus(p.world.cache, PlayerStatus.Takeoff);
      this.p.setControl(p.world.cache, EntityType.None, 0);
      this.p.setNextRespawnType(RespawnType.Normal)
      //this.world.respawn(this.p);
    }
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      respawnType: this.y,
    };
  }
  public static getGameObjectSchema() {

  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "time", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  };



}