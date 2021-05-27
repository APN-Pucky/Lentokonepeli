import { Entity, EntityType } from "../entity";
import { CacheEntry, Cache } from "../network/cache";
import { Team } from "../constants";
import { PlayerInput, InputKey } from "../input";
import { GameWorld } from "../world/world";
import { teamPlanes, Plane, PlaneType } from "./Plane";
import { Ownable } from "../ownable";
import { Man } from "./Man";
import { GameObjectSchema, IntType } from "../network/types";
import { Player } from "../network/player";
import { PlayerInfos } from "../../../client/src/render/entities/playerInfos";
import { RespawnType } from "./Respawner";

export enum PlayerStatus {
  Playing,
  Takeoff,
  Respawning,
  Spectating,
}

export class PlayerInfo extends Entity {

  public static type = EntityType.Player;
  public name: string;
  public team: Team;
  public controlType: EntityType;
  public controlID: number;
  public status: PlayerStatus;
  public ping: number;
  public player: Player;

  public inputState: PlayerInput;


  private fuelMax = 255;
  protected healthMax = 255;
  private ammoMax = 255;
  private bombsMax = 5;
  private teamKills = 0;
  private fuel = this.fuelMax;
  private health = this.healthMax;
  private ammo = this.ammoMax;
  private bombs = this.bombsMax;
  private localfuel = this.fuelMax;
  private localhealth = this.healthMax;
  private localammo = this.ammoMax;
  private localbombs = this.bombsMax;


  private nextRespawnType: RespawnType = RespawnType.Normal;

  private firstTeamKillTime;
  //Stats
  private frags = 0;
  private score = 0;
  private deaths = 0;
  private shots = 0;
  private hits = 0;
  private precision = 0;
  private bombhits: number[][] = new Array(8)
    .fill(0)
    .map(() => new Array(2)
      .fill(0));
  private bullethits: number[][] = new Array(8)
    .fill(0)
    .map(() => new Array(2)
      .fill(0));

  public constructor(world: GameWorld, pi: Player) {
    super(world, PlayerInfo);
    this.player = pi;
    this.name = "Player_" + this.id;
    this.controlType = EntityType.None;
    this.controlID = 0;
    this.team = Team.Spectator;
    this.setStatus(world.cache, PlayerStatus.Takeoff);
    this.setPing(world.cache, 0);

    // initialize player input to all false.
    this.inputState = {};
    for (const keyIndex in InputKey) {
      this.inputState[keyIndex] = false;
    }
  }

  public getTeam(): Team {
    return this.team;
  }
  public setTeam(team: Team) {
    this.set(this.world.cache, "team", team);
  }

  public getControlId(): number {
    return this.controlID;
  }
  public getControlType(): number {
    return this.controlType;
  }
  public isControlling(e: Entity): boolean {
    return e.getId() == this.getControlId() && e.getType() == this.getControlType();
  }

  public setHealthMax(mh: number) {
    this.healthMax = mh;
  }
  public setFuelMax(mf: number) {
    this.fuelMax = mf;
  }
  public setAmmoMax(ma: number) {
    this.ammoMax = ma;
  }
  public getFuel() {
    return this.localfuel;
  }
  public setFuel(fuel: number) {
    this.localfuel = fuel;
    this.set(this.world.cache, "fuel", Math.round(fuel / this.fuelMax * 255));
  }

  public getHealth() {
    return this.localhealth;
  }
  public setHealth(health: number) {
    if (health < 0) health = 0;
    this.localhealth = health;
    this.set(this.world.cache, "health", Math.round(health / this.healthMax * 255));
  }

  public getAmmo() {
    return this.localammo;
  }
  public setAmmo(ammo: number) {
    this.localammo = ammo;
    this.set(this.world.cache, "ammo", Math.round(ammo / this.ammoMax * 255));
  }
  public getBombs() {
    return this.bombs;
  }
  public setBombs(bombs: number) {
    //this.bombs = bombs;
    this.set(this.world.cache, "bombs", bombs);
  }

  public setName(cache: Cache, name: string): void {
    this.set(cache, "name", name);
  }
  public getFullName(): string {
    return this.name;
  }

  public setPing(cache: Cache, ping: number): void {
    this.set(cache, "ping", ping);
  }

  public setStatus(cache: Cache, status: PlayerStatus): void {
    this.set(cache, "status", status);
  }

  public setControl(
    cache: Cache,
    controlType: EntityType,
    controlID: number
  ): void {
    this.set(cache, "controlType", controlType);
    this.set(cache, "controlID", controlID);
  }

  public getNextRespawnType() {
    return this.nextRespawnType;
  }

  public setNextRespawnType(n) {
    this.nextRespawnType = n;
  }

  // STATS
  public getFrags(): number {
    return this.frags;
  }
  public setFrags(frags: number): void {
    this.set(this.world.cache, "frags", frags);
  }

  public getScore(): number {
    return this.score;
  }
  public setScore(score: number): void {
    this.set(this.world.cache, "score", score);
  }

  public getDeaths(): number {
    return this.deaths;
  }
  public setDeaths(deaths: number): void {
    this.set(this.world.cache, "deaths", deaths);
  }
  public setPrecision(p: number): void {
    this.set(this.world.cache, "precision", p);
  }

  private ownableToArrayIndex(o: Ownable): number {
    let i: number;
    if (o == null) {
      i = 0;
    }
    else {
      i = o.getRootOwner().getType();
    }
    let j = 0;
    switch (i) {
      case EntityType.Plane:
        j = ((o.getRootOwner() as Plane).planeType) + 2;
        break;
      case EntityType.Trooper:
        if ((o as Man).getRootOwner().getTeam() == 0) {
          j = 0;
        }
        else {
          j = 1;
        };
    }
    return j;
  }

  // STAT handling functions
  public submitBullet(p: Ownable, b1: boolean): void {
    let j = this.ownableToArrayIndex(p);
    this.shots += 1;
    if (b1) {
      this.hits += 1;
    }
    this.setPrecision(Math.round(100 * this.hits / this.shots));
    this.bullethits[j][0] += 1;
    if (b1) {
      this.bullethits[j][1] += 1;
    }
  }
  public submitBomb(p: Ownable, b1: boolean, b2: boolean): void {
    if (b2) {
      this.adjustScore(2, p);
    }
    let i = this.ownableToArrayIndex(p);
    this.bombhits[i][0] += 1;
    if (b1)
      this.bombhits[i][1] += 1;
  }
  public submitTeamBomb(p: Ownable, b1: boolean): void {
    if (b1) {
      this.adjustScore(-1, p);
    }
    let i = this.ownableToArrayIndex(p);
    this.bombhits[i][0] += 1;
  }
  public submitKill(p: Ownable, p2: Ownable): void {
    this.adjustFrags(1);
    this.adjustScore(10, p);
    if ((p2 instanceof Plane)) {
      // sumbit message kill_plane
    }
    else {
      // sumbmit message kill man
    }
    // Duel Ranking sumbission ????
  }
  public submitTeamKill(p: Ownable, p2: Ownable): void {
    this.adjustFrags(-1);
    this.adjustScore(-8, p);
    this.nextRespawnType = RespawnType.TeamKill;
    if ((p2 instanceof Plane)) {
      // sumbit message kill_plane
    }
    else {
      // sumbmit message kill man
    }
    // suicide Ranking sumbission ????
    let l = Date.now();
    if (this.firstTeamKillTime + 90000 < l) {
      this.firstTeamKillTime = l;
      this.teamKills = 1;
    }
    else {
      this.teamKills = 1;
    }
    if (this.teamKills == 7) {
      // toolkit/world ban Player
    }
  }
  public submitParachute(p: Plane, p2: Man): void { }

  public adjustFrags(paramInt: number): void {
    this.setFrags(this.getFrags() + paramInt);
  }
  public adjustScore(paramInt: number, paramOwnable: Ownable): void {
    if (!this.world.isRoundOver()) {
      this.setScore(this.getScore() + paramInt);
      this.world.adjustScore(this.getTeam(), paramInt);
      //this.toolkit.submit(new TypedSubmission("score", paramInt, getOwnableStatsType(paramOwnable), getPlayer().getUserId()));
    }
  }

  public submitSuicide(paramOwnable: Ownable): void {
    this.adjustScore(-5, paramOwnable);
    //this.toolkit.submit(new TypedSubmission("suicide", 1, getOwnableStatsType(paramOwnable), getPlayer().getUserId()));
    if (this.nextRespawnType == RespawnType.Normal) {
      this.nextRespawnType = RespawnType.Suicide;
    }
    //this.toolkit.submit(new SuicideRankingSubmission(getPlayer().getUserId()));
  }

  public submitDeath(paramOwnable: Ownable): void {
    this.setDeaths(this.getDeaths() + 1);
    if ((paramOwnable instanceof Plane)) {
      //submitGameTime(getOwnableStatsType(paramOwnable), getPlayer().getUserId());
    }
  }

  public getState(): CacheEntry {
    return {
      type: this.type,
      name: this.name,
      team: this.team,
      ping: this.ping,
      controlType: this.controlType,
      controlID: this.controlID,
      status: this.status,
      fuel: this.fuel,
      ammo: this.ammo,
      health: this.health,
      bombs: this.bombs,
      frags: this.frags,
      score: this.score,
      deaths: this.deaths,
      precision: this.precision,
    };
  }

  public static schema: GameObjectSchema = {
    numbers: [
      { name: "team", intType: IntType.Uint8 },
      { name: "controlType", intType: IntType.Uint8 },
      { name: "controlID", intType: IntType.Uint16 },
      { name: "ping", intType: IntType.Uint16 },
      { name: "status", intType: IntType.Uint8 },
      { name: "fuel", intType: IntType.Uint8 },
      { name: "ammo", intType: IntType.Uint8 },
      { name: "health", intType: IntType.Uint8 },
      { name: "bombs", intType: IntType.Uint8 },
      { name: "frags", intType: IntType.Int16 },
      { name: "score", intType: IntType.Int16 },
      { name: "deaths", intType: IntType.Int16 },
      { name: "precision", intType: IntType.Uint8 },
    ],
    booleans: [],
    strings: ["name"]
  }; public static getType() { return this.type; }
  public static getSchema() { return this.schema; }
}