import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { Team } from "../constants";
import { GameWorld } from "../world/world";
import { Ownable } from "../ownable";
import { OwnableSolidEntity } from "./OwnableSolidEntity";
import { PlayerInfo } from "./PlayerInfo";
import { SolidEntity } from "./SolidEntity";
import { BufferedImage } from "../BufferedImage";
import { Rectangle } from "../physics/rectangle";
import { GameObjectSchema, IntType } from "../network/types";

export const explosionGlobals = {
  duration: 500, // damage duration in milliseconds
  despawnTime: 1000, // time before explosion entity despawns.
  damage: 25, // damage in HP from colliding with the explosion.
  radius: 35 // explosion radius
};

export class Explosion extends OwnableSolidEntity {
  public static type = EntityType.Explosion;
  public x: number;
  public y: number;
  public playerID: number;
  private playerInfo: PlayerInfo;
  private origin: Ownable;
  public team: number;
  public image: BufferedImage;
  private collisionCheck: number = 0;
  private phase: number;

  // counter of how long explosion has been active
  public age: number;

  // Hash table to keep track of entities this has affected
  public affectedObjects = {};

  public constructor(
    world: GameWorld,
    o: Ownable = null,
    x: number = 0,
    y: number = 0,
  ) {
    super(world,Explosion, o == null ? -1 : o.getPlayerInfo().getTeam());
    this.playerInfo = o == null ? null : o.getPlayerInfo();
    this.image = world.getImage("explosion0004.gif");
    this.setTeam(world.cache, this.playerInfo == null ? -1 : this.playerInfo.getTeam())
    this.setPlayerID(world.cache, this.playerInfo == null ? -1 : this.playerInfo.getId())
    this.setData(world.cache, {
      x,
      y,
      age: 0
    });
  }

  public setTeam(cache: Cache, team: Team): void {
    this.set(cache, "team", team);
  }

  public setPlayerID(cache: Cache, id: number): void {
    this.set(cache, "playerID", id);
  }

  public tick(deltaTime: number): void {
    let cache: Cache = this.world.cache;
    this.age += deltaTime;
    if (this.age >= 560) {
      //console.log("explosion age " + this.age);
      this.world.removeEntity(this);
    }
    else {
      let i: number = this.age / 70;
      if (i != this.phase) {
        this.phase = i;
        if ((this.phase > 2) && (this.collisionCheck == 0)) {
          this.collisionCheck = 1;
          this.checkCollision();
          this.collisionCheck = 2;
        }
        this.setChanged(true);
      }
    }
  }


  public getCollisionBounds(): Rectangle {
    if (this.collisionCheck == 1) {
      return new Rectangle(this.x, this.y, this.image.getWidth(), this.image.getHeight());
    }
    return new Rectangle(0, 0, 0, 0);
  }

  public getCollisionImage(): BufferedImage {
    return this.image;
  }

  public hit(se: SolidEntity): void { }

  public getPlayerInfo(): PlayerInfo {
    return this.playerInfo;
  }

  public getRootOwner(): Ownable {
    return this.origin.getRootOwner();
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      age: this.age
    };
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 }
    ],
    booleans: [],
    strings: []
  };  public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}