import { Player, PlayerStatus } from "../player";
import { GameWorld } from "../../world/world";
import { CacheEntry, Cache } from "../../network/cache";
import { requestTakeoff } from "../../world/takeoff";
import { PlaneType } from "../plane";

import { DQNSolver, DQNOpt, DQNEnv } from 'reinforce-js';
import { InputKey } from "../../input";

export class ReinforceBot extends Player {
  private dqnSolver;
  private count: number;
  private sum: number;
  private acted: boolean;
  public constructor(id: number, cache: Cache) {
    super(id, cache);
    const width = 400;
    const height = 400;
    const numberOfStates = 4;
    const numberOfActions = 5;
    const env = new DQNEnv(width, height, numberOfStates, numberOfActions);

    const opt = new DQNOpt();
    opt.setTrainingMode(true);
    opt.setNumberOfHiddenUnits([100]);  // mind the array here, currently only one layer supported! Preparation for DNN in progress...
    opt.setEpsilonDecay(1.0, 0.1, 1e6);
    opt.setEpsilon(0.05);
    opt.setGamma(0.9);
    opt.setAlpha(0.005);
    opt.setLossClipping(true);
    opt.setLossClamp(1.0);
    opt.setRewardClipping(true);
    opt.setRewardClamp(1.0);
    opt.setExperienceSize(1e8);
    opt.setReplayInterval(100);
    opt.setReplaySteps(100);
    this.dqnSolver = new DQNSolver(env, opt);
    this.count = 0;
    this.sum = 0;
  }
  public reward(cache: Cache, delta: number, world: GameWorld): void {
    if (this.acted) {
      const obj = world.getObject(this.controlType, this.controlID);
      const reward = (this.status != PlayerStatus.Takeoff) ? -1. / Math.sqrt(Math.sqrt(obj["y"] + 10)) : -100000000;

      this.sum += reward;
      this.count++;
      if (this.count > 10) {
        //console.log("re=" + this.sum * 1. / this.count);
        this.count = 0;
        this.sum = 0;
      }
      this.dqnSolver.learn(reward);
    }
  }
  public tick(cache: Cache, delta: number, world: GameWorld): void {
    //console.log(this.status);
    this.acted = false;
    if (Math.random() > 0.9) return;
    if (this.status == PlayerStatus.Takeoff) {
      requestTakeoff(world, this, { plane: PlaneType.Albatros, runway: world.runways[0].id });

    }
    else {
      const obj = world.getObject(this.controlType, this.controlID);
      const state = [obj["x"], obj["y"], obj["engineOn"], obj["direction"]];
      const action = this.dqnSolver.decide(state);

      const key = [null, InputKey.Left, InputKey.Right, InputKey.Down, InputKey.Up][action];
      let tmp: number = 0;
      for (const p of world.planes) {
        tmp +=
          (obj["x"] - p["x"]) * (obj["x"] - p["x"]) + (obj["y"] - p["y"]) * (obj["y"] - p["y"]);
      }

      if (key != null) {
        this.inputState[key] = !this.inputState[key];
        world.queueInput(this.id, key, this.inputState[key]);
      }
      this.acted = true;
    }
    return;
  }

}