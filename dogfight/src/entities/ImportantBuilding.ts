import { FacingDirection, Team, SCALE_FACTOR } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { SolidEntity } from "./SolidEntity";
import { Rectangle } from "../physics/rectangle";
import { Bullet } from "./Bullet";
import { PlayerInfo } from "./PlayerInfo";
import { GameWorld } from "../world/world";
import { GameObjectSchema, IntType } from "../network/types";


const HEALTH_MAX = 350;
const HEALTH_TIMER_MAX = 50;

export class ImportantBuilding extends SolidEntity {
  public type = EntityType.ImportantBuilding;

  public x: number;
  public y: number;
  public buildingType: number;
  public team: Team;
  public health: number;
  public healthTimer: number;

  public image;
  public imageWidth;
  public imageHeight;


  private localhealth = HEALTH_MAX;

  public constructor(id: number, world: GameWorld, cache: Cache, x: number, y: number, team: number, buildingType: number) {
    super(id, world, team);
    this.image = [world.getImage("headquarter_germans.gif"), world.getImage("headquarter_raf.gif")];
    this.imageWidth = [this.image[0].width, this.image[1].width];
    this.imageHeight = [this.image[0].height, this.image[1].height];
    this.localhealth = HEALTH_MAX;
    this.setData(cache, {
      x: x,
      y: y,
      buildingType: buildingType, //FacingDirection.Right,
      team: team, //Team.Centrals,
      health: 255
    });
    //console.log(this.getCollisionBounds());

  }

  public getImageWidth(paramInt: number): number {
    return this.imageWidth[paramInt];
  }
  public getImageHeight(paramInt: number): number {
    return this.imageHeight[paramInt];
  }

  public getCollisionBounds(): Rectangle {
    return new Rectangle(this.x, this.y, this.imageWidth[this.buildingType], this.imageHeight[this.buildingType]);
  }
  public getCollisionImage() {
    return this.image[this.buildingType];
  }

  public getImage() {
    return this.image[this.buildingType];
  }

  public getHealth() {
    return this.localhealth;
  }
  public setHealth(health: number) {
    this.localhealth = health;
    this.set(this.world.cache, "health", Math.round(this.localhealth / HEALTH_MAX * 255));
  }

  public run(): void {
    if ((this.localhealth > 0) && (this.localhealth < HEALTH_MAX)) {
      this.healthTimer = ((this.healthTimer + 1) % HEALTH_TIMER_MAX);
      if (this.healthTimer == 0) {
        this.localhealth += 1
        if (this.localhealth * 255 % HEALTH_MAX == 0) {
          this.setHealth(this.localhealth);
        }
      }
    }
  }

  public hit(paramSolidEntity: SolidEntity): void {
    if (this.health <= 0) {
      return;
    }
    switch (paramSolidEntity.getType()) {
      case EntityType.Bomb:
        this.setHealth(this.getHealth() - 30);
        break;
      case EntityType.Bullet:
        let b: Bullet = paramSolidEntity as Bullet;
        this.setHealth(this.getHealth() - (3.0 * b.getDamageFactor()));
        break;
      case EntityType.Explosion:
        this.setHealth(this.getHealth() - 17);
        break;
      default:
        return;
    }
    if (this.getHealth() <= 0) {
      this.setHealth(0);
      this.destroyed(paramSolidEntity.getTeam());
    }
    this.setChanged(true);
  }

  /**
   * 
   * @param paramInt Team id
   */
  private destroyed(paramInt: number): void {
    let i = paramInt;
    if (i == this.getTeam()) {
      i = 1 - i;
    }
    this.world.adjustScore(i, 100);
    //this.toolkit.pushText(3, "team" + getTeam() + " runway destroyed.");
    console.log("Destroyed")
    /*
    synchronized(this.playersInside)
    {
      Iterator localIterator = this.playersInside.iterator();
      while (localIterator.hasNext()) {
        PlayerInfo localPlayerInfo = (PlayerInfo)localIterator.next();
        getDogfightToolkit().killedWithoutAvatar(localPlayerInfo, 2);
        localPlayerInfo.removeAvatar();
        getDogfightToolkit().diedWithoutAvatar(localPlayerInfo, getStartX() + imageWidth[(1 - this.direction)], getStartY());
        localIterator.remove();
      }
    }
    */
  }

  public isAlive() {
    return this.localhealth > 0;
  }


  public getState(): CacheEntry {
    console.log("got ib")
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      buildingType: this.buildingType,
      health: this.health,
      team: this.team
    };
  }
}

export const importantBuildingSchema: GameObjectSchema = {
  numbers: [
    { name: "x", intType: IntType.Int16 },
    { name: "y", intType: IntType.Int16 },
    { name: "buildingType", intType: IntType.Uint8 },
    { name: "health", intType: IntType.Uint8 },
    { name: "team", intType: IntType.Uint8 }
  ],
  booleans: [],
  strings: []
};
