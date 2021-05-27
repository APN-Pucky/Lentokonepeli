import { PlayerInfo, PlayerStatus } from "../PlayerInfo";
import { GameWorld } from "../../world/world";
import { CacheEntry, Cache } from "../../network/cache";
import { requestTakeoff } from "../../world/takeoff";
import { Plane, PlaneType } from "../Plane";

import { DQNSolver, DQNOpt, DQNEnv } from 'reinforce-js';
import { InputKey } from "../../input";
import { PlayerImpl } from "../../network/player";
import { Ticking } from "../Ticking";
import { EntityType } from "../../entity";
import { PlayerInfos } from "../../../../client/src/render/entities/playerInfos";
import { RespawnType } from "../Respawner";
import { writeFileSync, readFileSync } from "fs";
import { Bullet } from "../Bullet";
import { BitmapFont } from "pixi.js";
import { Bomb } from "../Bomb";
import { Man } from "../Man";
import { Bot } from "./Bot";
import { Runway } from "../Runway";

export const rate = 10;
export const MAX = 1000;

const width = 400;
const height = 400;
const numberOfStates = 5 + MAX;
const numberOfActions = 8 - 1;
const env = new DQNEnv(width, height, numberOfStates, numberOfActions);

const opt = new DQNOpt();
opt.setTrainingMode(true);
opt.setNumberOfHiddenUnits([1000]);  // mind the array here, currently only one layer supported! Preparation for DNN in progress...
opt.setEpsilonDecay(1.0, 0.1, 1e6);
opt.setEpsilon(0.05);
opt.setGamma(0.9);
opt.setAlpha(0.005);
opt.setLossClipping(true);
opt.setLossClamp(1.0);
//opt.setRewardClipping(true);
//opt.setRewardClamp(1.0);
opt.setExperienceSize(1e8);
opt.setReplayInterval(100 / rate);
opt.setReplaySteps(100 / 10 * 3 / rate);
const dqnSolver = new DQNSolver(env, opt);

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

export class ReinforceBot extends Bot {
  //private dqnSolver;
  private count: number;
  private sum: number;
  private acted: boolean;
  private time: number;
  public constructor(world: GameWorld) {
    super(world);

    this.count = 0;
    this.sum = 0;
    //this.dqnSolver.fromJSON(readFileSync("bot.save"))
  }
  public reward(delta: number): void {
    if (this.acted) {
      const obj = this.world.getObject(this.controlType, this.controlID);
      const score = this.getScore() + this.getHealth() / this.healthMax;
      const reward = score - this.sum;
      this.sum = score;
      dqnSolver.learn(reward);
    }
  }
  public tick(delta: number): void {
    //console.log(this.status);
    this.reward(delta);
    let world = this.world;
    this.acted = false;
    this.time++;
    if (Math.random() > 0.999) {
      //console.log(JSON.stringify(dqnSolver.toJSON()));
    }
    if (Math.random() > (100 - rate) / 100) return;
    if (this.status == PlayerStatus.Takeoff) {
      let rng = random(0, 2);
      this.time = 0;
      if ((world.entities[EntityType.Runway][this.team * 2 + rng] as Runway).getHealth() > 0)
        requestTakeoff(world, this, { plane: [[PlaneType.Albatros, PlaneType.Junkers, PlaneType.Fokker], [PlaneType.Bristol, PlaneType.Salmson, PlaneType.Sopwith]][this.team][random(0, 3)], runway: world.entities[EntityType.Runway][this.team * 2 + rng].id });

    }
    else {
      const obj = world.getObject(this.controlType, this.controlID);
      const state = [obj["team"], obj["x"], obj["y"], obj["motorOn"], obj["direction"], obj["controlType"]];

      let tmp = [];
      let i = 0;
      for (const e of world.entities[EntityType.Bomb]) {
        let p = e as Bomb;
        if (i + 5 < MAX) {
          state.push(EntityType.Bomb, Math.abs(obj["team"] - p.team), p.x - obj["x"], p.y - obj["y"], p.direction);
          i += 5;
        }
      }
      for (const e of world.entities[EntityType.Plane]) {
        let p = e as Plane;
        if (i + 7 < MAX) {
          state.push(EntityType.Plane, p.planeType, Math.abs(obj["team"] - p.team), p.x - obj["x"], p.y - obj["y"], p.motorOn, p.direction);
          i += 7;
        }
      }
      for (const e of world.entities[EntityType.Trooper]) {
        let p = e as Man;
        if (i + 4 < MAX) {
          state.push(EntityType.Trooper, Math.abs(obj["team"] - p.team), p.x - obj["x"], p.y - obj["y"], p.state);
          i += 4;
        }
      }
      for (const e of world.entities[EntityType.Bullet]) {
        let p = e as Bullet;
        if (i + 4 < MAX) {
          state.push(EntityType.Bullet, Math.abs(obj["team"] - p.team), p.x - obj["x"], p.y - obj["y"], p.vx, p.vy);
          i += 4;
        }
      }
      while (i < MAX) {
        state.push(0);
        i++;
      }
      const action = dqnSolver.decide(state);
      const key = [null, InputKey.Left, InputKey.Right, InputKey.Up, InputKey.Fire, InputKey.Bomb, InputKey.Jump][action];


      if (key != null) {
        if (key == InputKey.Jump && obj instanceof Plane && (obj as Plane).getPlayerInfo().getHealth() > 0) return;// hard block
        if (key == InputKey.Bomb && this.time <= 30 * 10) return;
        this.inputState[key] = !this.inputState[key];
        world.queueInput(this.id, key, this.inputState[key]);
      }
      this.acted = true;
    }
    return;
  }

} 