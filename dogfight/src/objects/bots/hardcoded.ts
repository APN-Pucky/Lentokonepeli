import { Player, PlayerStatus } from "../player";
import { GameWorld } from "../../world/world";
import { CacheEntry, Cache } from "../../network/cache";
import { requestTakeoff } from "../../world/takeoff";
import { PlaneType } from "../plane";

import { DQNSolver, DQNOpt, DQNEnv } from 'reinforce-js';
import { InputKey } from "../../input";
import { GameObject } from "../../object";

import {
  Team,
  SCALE_FACTOR,
  ROTATION_DIRECTIONS,
  BuildType
} from "../../constants";

enum Manover {
  follow,
  unfollow,
  glide,
  slalom,
  center,
  turn_up,
  turn_down,
  turn_up_engine,
  turn_down_engine,
  big_slalom,
  stuka_up,
  stuka_down,
};

function randomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = Object.keys(anEnum)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
  const randomIndex = Math.floor(Math.random() * enumValues.length)
  const randomEnumValue = enumValues[randomIndex]
  return randomEnumValue;
}

export class HardcodedBot extends Player {
  private count: number;
  private sum: number;
  private acted: boolean;
  private tmp_vars = {};
  private steer_target_x: number = 0;
  private steer_target_y: number = 100;
  private steer_strength: number = 1;

  private current_manover: Manover;

  public constructor(id: number, cache: Cache) {
    super(id, cache);

    this.count = 0;
    this.sum = 0;
  }
  public reward(cache: Cache, delta: number, world: GameWorld): void {
    if (this.acted) {
      const obj = world.getObject(this.controlType, this.controlID);
      const reward = (this.status != PlayerStatus.Takeoff) ? 1. / Math.sqrt(obj["y"]) : 100000000;

      this.sum += reward;
      this.count++;
      if (this.count > 10) {
        //console.log("hc=" + this.current_manover + " x = " + obj["x"] + " y = " + obj["y"] + " dir = " + obj["direction"]);
        this.count = 0;
        this.sum = 0;
      }
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

      //const key = [null, InputKey.Left, InputKey.Right, InputKey.Down, InputKey.Up][action];

      if (Math.random() > 0.95 && (this.current_manover == null || Math.random() > 0.9)) {
        this.current_manover = randomEnum(Manover);
      }


      let key_steer = this.steer(world);

      let key_manover = this.manover(world);

      let key_value = this.value(world);

      let key_plane = this.dodgePlanes(world);

      let key_ground = this.dodgeGround(world);

      let key = key_steer + key_plane + key_manover + key_ground;
      if (this.count > 9) {
        //console.log("key: " + key + " = " + key_value + " " + key_steer + " " + key_plane + " " + key_ground + " " + key_manover + "@" + this.current_manover);
      }

      if (key > 0) {
        this.inputState[InputKey.Right] = true;
        this.inputState[InputKey.Left] = false;
        world.queueInput(this.id, InputKey.Enter, false);
      }
      else {
        this.inputState[InputKey.Right] = false;
        this.inputState[InputKey.Left] = true;
        world.queueInput(this.id, InputKey.Enter, false);

      }
      this.acted = true;
    }
    return;
  }

  private steer(world: GameWorld): number {
    const plane = world.getObject(this.controlType, this.controlID);
    let key = 0;
    if (plane["x"] - this.steer_target_x < 0) {
      key += this.leftward(world) * (plane["x"] - this.steer_target_x) / 100;
    }
    else {
      key += this.leftward(world) * (plane["x"] - this.steer_target_x) / 100;
    }
    if (plane["y"] - this.steer_target_y < 0) {
      key += this.upward(world) * (plane["y"] - this.steer_target_y) / 100;
    }
    else {
      key += this.upward(world) * (plane["y"] - this.steer_target_y) / 100;
    }
    return key * this.steer_strength;
  }

  private dodgeGround(world: GameWorld): number {
    const plane = world.getObject(this.controlType, this.controlID);
    if (plane["y"] < 250) {
      //console.log(plane["direction"]);
      this.engineOn(world);
      return this.upward(world) * 120;
    }
    return 0;
  }

  private dodgePlanes(world: GameWorld): number {
    const obj = world.getObject(this.controlType, this.controlID);
    let val = 0;
    for (const p of world.planes) {
      if (p.id != obj.id) {
        let dist =
          (obj["x"] - p["x"]) * (obj["x"] - p["x"]) + (obj["y"] - p["y"]) * (obj["y"] - p["y"]);
        if (dist < 100000) {
          let dir = (Math.round((Math.round(ROTATION_DIRECTIONS / 2) * Math.atan2((obj["y"] - p["y"]), (obj["x"] - p["x"]))) / Math.PI) + ROTATION_DIRECTIONS) % ROTATION_DIRECTIONS;
          if (dir > obj["direction"]) {
            val += -50;
          }
          else {
            val += 50;
          }
        }
      }
    }
    return val;
  }

  private rightward(world: GameWorld): number {
    const plane = world.getObject(this.controlType, this.controlID);
    if (plane["direction"] / ROTATION_DIRECTIONS < 0.5 && plane["direction"] / ROTATION_DIRECTIONS > 0) {
      return 1;
    }
    else {
      return -1;
    }
  }
  private leftward(world: GameWorld): number {
    return -this.rightward(world);
  }

  private upward(world: GameWorld): number {
    const plane = world.getObject(this.controlType, this.controlID);
    if (plane["direction"] / ROTATION_DIRECTIONS < 0.25 || plane["direction"] / ROTATION_DIRECTIONS > 0.75) {
      return -1;
    }
    else {
      return 1;
    }
  }
  private downward(world: GameWorld): number {
    return -this.upward(world);
  }

  private engineToggle(world: GameWorld) {
    const key = InputKey.Down;
    this.inputState[key] = !this.inputState[key];
    world.queueInput(this.id, key, this.inputState[key]);

  }
  private engineOn(world: GameWorld) {
    const plane = world.getObject(this.controlType, this.controlID);
    if (!plane["engineOn"]) {
      this.engineToggle(world);
    }
  }

  private engineOff(world: GameWorld) {
    const plane = world.getObject(this.controlType, this.controlID);
    if (plane["engineOn"]) {
      this.engineToggle(world);
    }
  }

  private resetManover(): void {
    this.current_manover = null;
    this.tmp_vars = {};
  }

  private manover(world: GameWorld): number {
    const plane = world.getObject(this.controlType, this.controlID);
    if (this.current_manover == Manover.glide) {
      if (!("glide" in this.tmp_vars)) this.tmp_vars["glide"] = plane["y"];
      if (plane["y"] > this.tmp_vars["glide"] - 10) {
        this.engineOff(world);
      }
      else {
        this.engineOn(world);
        this.resetManover();
      }
    }
    if (this.current_manover == Manover.stuka_up) {
      if (plane["y"] < 500) {
        this.engineOn(world);
        return this.upward(world) * 30;
      }
      else {
        this.current_manover = Manover.stuka_down;
      }
    }

    if (this.current_manover == Manover.stuka_down) {
      if (plane["y"] > 400 && plane["y"] < 500) {
        this.engineOff(world);
        return this.upward(world) * -30;
      }
      else if (plane["y"] > 200) {
        this.engineOn(world);
        return this.upward(world) * -30;
      }
      else {
        this.resetManover();

      }
    }

    if (this.current_manover == Manover.follow) {
      const obj = plane;
      let min_dist = null;
      let cur = null;
      for (const p of world.planes) {
        if (p.id != obj.id) {
          let dist =
            (obj["x"] - p["x"]) * (obj["x"] - p["x"]) + (obj["y"] - p["y"]) * (obj["y"] - p["y"]);
          if (min_dist == null || dist < min_dist && (obj["direction"] - p["direction"]) % ROTATION_DIRECTIONS < 0.25 * ROTATION_DIRECTIONS) {
            min_dist = dist;
            cur = p;
          }
        }
      }
      if (cur != null) {
        let dir = (Math.round((Math.round(ROTATION_DIRECTIONS / 2) * Math.atan2((obj["y"] - cur["y"]), (obj["x"] - cur["x"]))) / Math.PI) + ROTATION_DIRECTIONS) % ROTATION_DIRECTIONS;
        if (cur["engineOff"])
          this.engineOff(world);
        if (dir > obj["direction"]) {
          return 40;
        }
        else {
          return -40;
        }
      }
      else {
        this.current_manover = null;
      }
    }

    if (this.current_manover == Manover.slalom) {
      this.engineOn(world);

      if (plane["direction"] / ROTATION_DIRECTIONS > 0 + 0.0625 && plane["direction"] / ROTATION_DIRECTIONS < 0.125) {
        return 25;
      }
      else if (plane["direction"] / ROTATION_DIRECTIONS > 1 - 0.125 && plane["direction"] / ROTATION_DIRECTIONS < 1 - 0.0625) {
        return -25;
      }
      else if (plane["direction"] / ROTATION_DIRECTIONS > 0.5 + 0.0625 && plane["direction"] / ROTATION_DIRECTIONS < 0.5 + 0.125) {
        return 25;
      }
      else if (plane["direction"] / ROTATION_DIRECTIONS > 0.5 - 0.125 && plane["direction"] / ROTATION_DIRECTIONS < 0.5 - 0.0625) {
        return -25;
      }
      else {
        this.resetManover();
      }
    }

    if (this.current_manover == Manover.big_slalom) {
      this.engineOn(world);

      if (plane["direction"] / ROTATION_DIRECTIONS > 0 - 0.125 && plane["direction"] / ROTATION_DIRECTIONS < 2 * 0.125) {
        return 25;
      }
      else if (plane["direction"] / ROTATION_DIRECTIONS > 1 - 2 * 0.125 && plane["direction"] / ROTATION_DIRECTIONS < 1 - 0.125) {
        return -25;
      }
      else if (plane["direction"] / ROTATION_DIRECTIONS > 0.5 + 0.125 && plane["direction"] / ROTATION_DIRECTIONS < 0.5 + 2 * 0.125) {
        return 25;
      }
      else if (plane["direction"] / ROTATION_DIRECTIONS > 0.5 - 2 * 0.125 && plane["direction"] / ROTATION_DIRECTIONS < 0.5 - 0.125) {
        return -25;
      }
      else {
        this.resetManover();
      }
    }

    if (this.current_manover == Manover.unfollow) {
      const obj = plane;
      let min_dist = null;
      let cur = null;
      for (const p of world.planes) {
        if (p.id != obj.id) {
          let dist =
            (obj["x"] - p["x"]) * (obj["x"] - p["x"]) + (obj["y"] - p["y"]) * (obj["y"] - p["y"]);
          if (min_dist == null || dist < min_dist && (obj["direction"] - p["direction"]) % ROTATION_DIRECTIONS < 0.25 * ROTATION_DIRECTIONS) {
            min_dist = dist;
            cur = p;
          }
        }
      }
      if (cur != null) {
        let dir = (Math.round((Math.round(ROTATION_DIRECTIONS / 2) * Math.atan2((obj["y"] - cur["y"]), (obj["x"] - cur["x"]))) / Math.PI) + ROTATION_DIRECTIONS) % ROTATION_DIRECTIONS;
        this.engineOn(world);
        if (dir > obj["direction"]) {
          return -40 - 10 * this.upward(world);
        }
        else {
          return 40 - 10 * this.upward(world);
        }

      }
      else {
        this.resetManover();
      }
    }
    return 0;
  }

  private value(world: GameWorld): number {
    const plane = world.getObject(this.controlType, this.controlID);
    let value_plane = this.value_position(plane["x"], plane["y"], world);

    let sin = Math.sin(2 * (Math.PI * plane["direction"]) / ROTATION_DIRECTIONS);
    let cos = Math.cos(2 * (Math.PI * plane["direction"]) / ROTATION_DIRECTIONS);
    let value_forward = this.value_position(plane["x"] + plane["speed"] * cos / 1000, plane["y"] + plane["speed"] * sin / 1000, world);

    sin = Math.sin(2 * (Math.PI * (plane["direction"])) / ROTATION_DIRECTIONS + Math.PI / 4);
    cos = Math.cos(2 * (Math.PI * (plane["direction"])) / ROTATION_DIRECTIONS + Math.PI / 4);

    let value_counterclock = this.value_position(plane["x"] + plane["speed"] * cos / 1000, plane["y"] + plane["speed"] * sin / 1000, world);
    let value_counterclock_engineoff = this.value_position(plane["x"] + plane["speed"] * cos / 1000 / 2, plane["y"] + plane["speed"] * sin / 1000 / 2, world);

    sin = Math.sin(2 * (Math.PI * (plane["direction"])) / ROTATION_DIRECTIONS - Math.PI / 4);
    cos = Math.cos(2 * (Math.PI * (plane["direction"])) / ROTATION_DIRECTIONS - Math.PI / 4);
    let value_clock = this.value_position(plane["x"] + plane["speed"] * cos / 1000, plane["y"] + plane["speed"] * sin / 1000, world);
    let value_clock_engineoff = this.value_position(plane["x"] + plane["speed"] * cos / 1000 / 2, plane["y"] + plane["speed"] * sin / 1000 / 2, world);

    if (this.count > 9) {
      //console.log("value: " + value_plane + " " + value_forward + " " + value_clock + " " + value_counterclock + " " + value_clock_engineoff + " " + value_counterclock_engineoff);
    }


    if (value_forward >= Math.max(value_plane, value_clock, value_counterclock, value_clock_engineoff, value_counterclock_engineoff, value_forward)) {
      this.engineOn(world);
      return 0;
    }
    if (value_clock >= Math.max(value_plane, value_clock, value_counterclock, value_clock_engineoff, value_counterclock_engineoff, value_forward)) {
      this.engineOn(world);
      return 30;
    }
    if (value_counterclock >= Math.max(value_plane, value_clock, value_counterclock, value_clock_engineoff, value_counterclock_engineoff, value_forward)) {
      this.engineOn(world);
      return -30;
    }
    if (value_clock_engineoff >= Math.max(value_plane, value_clock, value_counterclock, value_clock_engineoff, value_counterclock_engineoff, value_forward)) {
      this.engineOff(world);
      return 30;
    }
    if (value_counterclock_engineoff >= Math.max(value_plane, value_clock, value_counterclock, value_clock_engineoff, value_counterclock_engineoff, value_forward)) {
      this.engineOff(world);
      return -30;
    }
    if (value_plane >= Math.max(value_plane, value_clock, value_counterclock, value_clock_engineoff, value_counterclock_engineoff, value_forward)) {
      this.engineOff(world);
      return 0;
    }
    return 0;
  }

  private value_position(x: number, y: number, world: GameWorld): number {
    //TODO value + follows separate between teams, maybe also dodge
    const plane = world.getObject(this.controlType, this.controlID);
    let value = 0;
    // if bullet there or before there bad
    // if bomb there or before there bad
    // explosion is bad


    for (const p of world.planes) {
      if (p.id != plane.id) {
        let dir = this.getAngle(x, y, p["x"], p["y"]);
        //console.log(dir);
        if ((Math.abs(dir - p["direction"])) / ROTATION_DIRECTIONS < 0.03125 || (Math.abs(dir - p["direction"])) / ROTATION_DIRECTIONS > 1 - 0.03125) {
          // in front of plane bad
          let scale = ((x - p["x"]) * (x - p["x"]) + (y - p["y"]) * (y - p["y"])) / 2000000
          let tscale = 1 / scale;
          if (!(tscale < 10)) tscale = 10;
          value -= 10 * tscale;
        }
        if ((Math.abs(dir - p["direction"])) / ROTATION_DIRECTIONS > 0.5 - 0.03125 || (Math.abs(dir - p["direction"])) / ROTATION_DIRECTIONS < 0.5 + 0.03125) {
          // behind plane good
          let scale = ((x - p["x"]) * (x - p["x"]) + (y - p["y"]) * (y - p["y"])) / 2000000
          let tscale = 1 / scale;
          if (!(tscale < 10)) tscale = 10;
          value += 10 * tscale;
        }
        if ((Math.abs(dir - plane["direction"])) / ROTATION_DIRECTIONS < 0.03125 || (Math.abs(dir - p["direction"])) / ROTATION_DIRECTIONS > 1 - 0.03125) {
          // in front of plane good
          let scale = ((x - p["x"]) * (x - p["x"]) + (y - p["y"]) * (y - p["y"])) / 20000
          let tscale = scale;
          if (!(tscale < 10)) tscale = 10;
          value += 10 * tscale;
        }
        if ((Math.abs(dir - plane["direction"])) / ROTATION_DIRECTIONS > 0.5 - 0.03125 || (Math.abs(dir - p["direction"])) / ROTATION_DIRECTIONS < 0.5 + 0.03125) {
          // behind plane bad
          let scale = ((x - p["x"]) * (x - p["x"]) + (y - p["y"]) * (y - p["y"])) / 20000
          let tscale = scale;
          if (!(tscale < 10)) tscale = 10;
          value -= 10 * tscale;
        }
        if (y > p["y"]) {
          // above plane good
          let scale = (y - p["y"]) / 100;
          scale = 1 / scale;
          if (!(scale < 10)) scale = 10;
          value += scale;
        }
        else {
          // below plane bad
          let scale = (y - p["y"]) / 100;
          if (!(scale < 10)) scale = 10;
          value -= scale;
        }
      }
    }
    return value;
  }

  private getAngle(x1: number, y1: number, x2: number, y2: number): number {
    return (Math.round((Math.round(ROTATION_DIRECTIONS / 2) * Math.atan2((y1 - y2), (x1 - x2))) / Math.PI) + ROTATION_DIRECTIONS) % ROTATION_DIRECTIONS
  }
}
