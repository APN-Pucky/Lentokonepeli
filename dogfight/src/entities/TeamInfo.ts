import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { Team } from "../constants";
import { PlayerInput, InputKey } from "../input";
import { GameWorld } from "../world/world";
import { teamPlanes, Plane, PlaneType } from "./Plane";
import { Ownable } from "../ownable";
import { Man } from "./Man";
import { GameObjectSchema, IntType } from "../network/types";
import { PlayerInfo } from "./PlayerInfo";
import { Runway } from "./Runway";
import { ImportantBuilding } from "./ImportantBuilding";
import { rm } from "../util";


export class TeamInfo extends Entity {
  public type: EntityType;
  public team: Team;
  public score: number = 0;
  public wins: number = -1;

  public buildings: Entity[] = [];
  public players: Entity[] = [];
  public deads: Entity[] = [];

  public timeWinner: boolean = false;


  public constructor(world: GameWorld, team: Team, type = EntityType.TeamInfo, id: number = world.nextID(type), cache: Cache = world.cache,) {
    super(id, world);
    this.type = type;
    this.team = team;
  }

  public addBuilding(b: Entity): void {
    this.buildings.push(b);
  }

  public getBuildings(): Entity[] {
    return this.buildings;
  }


  public join(pi: PlayerInfo) {
    this.players.push(pi);
  }

  public part(pi: PlayerInfo) {
    this.players = rm(this.players, pi);
    this.deads = rm(this.deads, pi);
  }

  public dead(pi: PlayerInfo) {
    this.deads.push(pi);
  }

  public getPlayerAmount() {
    return this.players.length;
  }
  public getDeadAmount() {
    return this.deads.length;
  }

  public isAlive(): boolean {
    let bool = false;
    let i = 0;
    let j = 0;
    //Iterator localIterator = this.buildings;
    for (let localObject1 of this.buildings) {
      //Object localObject1 = localIterator.next();
      let localObject2;
      if ((localObject1 instanceof Runway)) {
        localObject2 = localObject1 as Runway;
        if ((localObject2 as Runway).isAlive()) {
          bool = true;
        }
      }
      else if ((localObject1 instanceof ImportantBuilding)) {
        localObject2 = localObject1 as ImportantBuilding;
        j = 1;
        if ((localObject2 as ImportantBuilding).isAlive()) {
          i = 1;
        }
      }
    }
    if ((this.players.length > 0) && (this.players.length == this.dead.length) && (!this.isTimeWinner())) {
      return false;
    }
    if (j != 0) {
      return (i != 0) && (bool);
    }
    return bool;
  }

  public reset() {
    this.buildings = [];
    this.setScore(0);
    this.players = []
    this.deads = [];
  }

  public getScore(): number {
    return this.score;
  }
  public setScore(s: number) {
    this.set(this.world.cache, "score", s);
  }
  public adjustScore(i: number): void {
    this.setScore(this.getScore() + i);
  }
  public getWins(): number {
    return this.wins;
  }
  public setWins(s: number) {
    this.set(this.world.cache, "wins", s);
  }
  public increaseRoundsWins() {
    this.setWins(this.getWins() + 1);
  }
  public getTeam(): Team {
    return this.team;
  }
  public setTeam(team: Team) {
    this.set(this.world.cache, "team", team);
  }

  public setTimeWinner(f: boolean): void {
    this.timeWinner = f;
  }
  public isTimeWinner(): boolean {
    return this.timeWinner
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      team: this.team,
      wins: this.wins,
      score: this.score,
    };
  }
}

export const teaminfoSchema: GameObjectSchema = {
  numbers: [
    { name: "team", intType: IntType.Uint8 },
    { name: "score", intType: IntType.Int16 },
    { name: "wins", intType: IntType.Int16 },
  ],
  booleans: [],
  strings: []
};