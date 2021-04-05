import { FacingDirection, Team, SCALE_FACTOR } from "../constants";
import { Entity, EntityType } from "../entity";
import { Cache, CacheEntry } from "../network/cache";
import { SolidEntity } from "./SolidEntity";
import { Rectangle } from "../physics/rectangle";
import { Bullet } from "./Bullet";
import { PlayerInfo } from "./PlayerInfo";
import { GameWorld } from "../world/world";
import { GameObjectSchema, IntType } from "../network/types";


const RESERVE_TAKEOFF_LANDING_DELAY = 1000;
const RESERVE_LANDING_TAKEOFF_DELAY = 2000;
const RESERVE_LANDING_LANDING_DELAY = 1000;
const RESERVE_TAKEOFF_TAKEOFF_DELAY = 1000;
const TAKEOFF = 1;
const LANDING = 1;
const HEALTH_MAX = 1530;
const HEALTH_TIMER_MAX = 50;


export class Runway extends SolidEntity {
  public static type = EntityType.Runway;

  public x: number;
  public y: number;
  public direction: FacingDirection;
  public team: Team;
  public health: number;

  public lastReserve: number;
  public reserveTimer: number;
  public healthTimer: number = 0;
  private playersInside = [];


  public image;
  public imageWidth;
  public imageHeight;

  public yOffset = 7; // TODO why do we need a offset for the hitbox of the runway?!?!?!?!?

  private localhealth = HEALTH_MAX;

  public constructor(world: GameWorld, team: number, x: number, y: number, direction: number,) {
    super(world,Runway, team);
    this.image = [world.getImage("runway.gif"), world.getImage("runway2.gif")];
    this.imageWidth = [this.image[0].width, this.image[1].width];
    this.imageHeight = [this.image[0].height, this.image[1].height];
    this.localhealth = HEALTH_MAX;
    this.setData(world.cache, {
      x: x,
      y: y,
      direction: direction, //FacingDirection.Right,
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
    return new Rectangle(this.x, this.y, this.imageWidth[1 - this.direction], this.imageHeight[1 - this.direction]);
  }
  public getCollisionImage() {
    return this.image[1 - this.direction];
  }

  public getImage() {
    return this.image[1 - this.direction];
  }

  public getLandableWidth(): number {
    return (this.imageWidth[1 - this.direction] - 65);
  }
  public getHealth() {
    return this.localhealth;
  }
  public setHealth(health: number) {
    this.localhealth = health;
    this.set(this.world.cache, "health", Math.round(this.localhealth / HEALTH_MAX * 255));
  }

  public getLandableX(): number {
    if (this.direction == 1) {
      return 65 + this.x;
    }
    return this.x;
  }
  public getLandableY(): number {
    return 23 + this.y;
  }
  public getStartX(): number {
    if (this.direction == 1) {
      return 15 + this.x;
    }
    return this.x + 230;
  }
  public getStartY(): number {
    return this.getLandableY();
  }
  public getDirection(): number {
    return this.direction;
  }

  /**
   * TODO synchronized?!?!?
   * @param paramInt LANDING or TAKEOFF request
   */
  public reserveFor(paramInt: number): boolean {
    let l1 = Date.now();
    let l2 = 0;
    switch (paramInt) {
      case 2:
        if (this.lastReserve == 2) {
          l2 = 1000;
        } else {
          l2 = 1000;
        }
        break;
      case 1:
        if (this.lastReserve == 2) {
          l2 = 2000;
        } else {
          l2 = 1000;
        }
        break;
    }
    if (this.reserveTimer + l2 > l1) {
      return false;
    }
    if (this.localhealth <= 0) {
      return false;
    }
    this.reserveTimer = l1;
    this.lastReserve = paramInt;
    return true;
  }

  public tick(deltaTime: number): void {
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
        this.setHealth(this.getHealth() - (4.0 * b.getDamageFactor()));
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

  public planeCrash(): void {
    if (this.localhealth <= 0) {
      return;
    }
    this.setHealth(this.getHealth() - 17);
    if (this.getHealth() <= 0) {
      this.setHealth(0);
      this.destroyed(this.getTeam());
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

  public addPlayerInside(pi: PlayerInfo): void {
    if (!this.isAlive()) {
      console.log("Tryied to join dead runway");
    }
    else {
      this.playersInside.push(pi);
    }
  }

  public removePlayerInside(pi: PlayerInfo): void {
    const index = this.playersInside.indexOf(pi, 0);
    if (index > -1) {
      this.playersInside.splice(index, 1);
    }
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      direction: this.direction,
      team: this.team,
      health: this.health
    };
  }
  public static getImage(world: GameWorld, i: number) {
    if (i == 0)
      return world.getImage("runway.gif")
    if (i == 1)
      return world.getImage("runway2.gif")
    return null;
  }
  public static getImageWidth(world: GameWorld, i: number): number {
    return Runway.getImage(world, i).width;
  }
  public static getImageHeight(world: GameWorld, i: number): number {
    return Runway.getImage(world, i).height;
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "x", intType: IntType.Int16 },
      { name: "y", intType: IntType.Int16 },
      { name: "direction", intType: IntType.Uint8 },
      { name: "team", intType: IntType.Uint8 },
      { name: "health", intType: IntType.Uint8 }
    ],
    booleans: [],
    strings: []
  };
public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}