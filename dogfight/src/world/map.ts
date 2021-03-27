import { GameWorld } from "./world";
import { Ground } from "../entities/Ground";
import { Flag } from "../entities/flag";
import { Hill } from "../entities/Hill";
import { Runway } from "../entities/Runway";
import { Tower } from "../entities/tower";
import { Water } from "../entities/Water";
import { EntityType } from "../entity";
import { FacingDirection, Terrain } from "../constants";

/**
 * A declaritive object that describes a level.
 * You can list all of the objects
 * that are to appear in this map here.
 */
export interface GameMap {
  grounds: any[];
  waters: any[];
  runways: any[];
  flags: any[];
  towers: any[];
  hills: any[];
}

export let katala: string[] = [
  "..HF..fH....................H......",
  "...L..r.........................t..",
  "\\<######>//////////////////////<#>/"];
export let london: string[] = [
  "...H..........H...H...H....H...H...H.....H..........H....",
  ".R..................i....l..i..r....i..................L.",
  "F...F..........fft....ff..t...T..ff....Tff..........F...F",
  "#####>////////<###########################>\\\\\\\\\\\\\\\\<#####",
]
export let bunkers: string[] = [
  "...Sp..S.p...........pP...........P..S..p.S...",
  ".....D.F.R..........F..f.............f.d......",
  "...R................I..i..........l.....l.....",
  "([_________]((((((([____])))))))[___________])"
]

export let classic2: string[] = [
  "...H.....H.....H.....H.....H.....H.....H.....H.....H.....H...",
  "...R.....................................................l...",
  "........R....R.................................l....l........",
  "........F....T.................................t....f........",
  "\\<#########################################################>/"
]

export function loadMap(world: GameWorld, map: GameMap): void {
  map.grounds.forEach((ground): void => {
    const obj = new Ground(world.nextID(EntityType.Ground), world, world.cache);
    obj.setData(world.cache, ground);
    world.grounds.push(obj);
  });
  map.flags.forEach((flag): void => {
    const obj = new Flag(world.nextID(EntityType.Flag), world, world.cache);
    obj.setData(world.cache, flag);
    world.flags.push(obj);
  });
  map.hills.forEach((hill): void => {
    const obj = new Hill(world.nextID(EntityType.Hill), world, world.cache);
    obj.setData(world.cache, hill);
    world.hills.push(obj);
  });
  map.runways.forEach((runway): void => {
    const obj = new Runway(world.nextID(EntityType.Runway), world, world.cache, null, 0, 0, 1);
    obj.setData(world.cache, runway);
    world.runways.push(obj);
  });
  map.towers.forEach((tower): void => {
    const obj = new Tower(
      world.nextID(EntityType.ControlTower),
      world,
      world.cache
    );
    obj.setData(world.cache, tower);
    world.towers.push(obj);
  });
  map.waters.forEach((water): void => {
    const obj = new Water(world.nextID(EntityType.Water), world, world.cache);
    obj.setData(world.cache, water);
    world.waters.push(obj);
  });
}

export function loadStringMap(world: GameWorld, strings: string[]) {
  for (let s of strings) {
    parseLevelLayer(world, s);
  }
}
export function parseLevelLayer(world: GameWorld, paramString: string): void {
  let i = -paramString.length * 100 / 2;
  for (let j = 0; j < paramString.length; j++) {
    let aoi: number[];
    let k;
    let obj;
    switch (paramString.charAt(j)) {
      case '#':
        aoi = parseContinuedPiece(paramString, j, '#', i);
        obj = new Ground(world.nextID(EntityType.Ground), world, world.cache, aoi[0] + aoi[1] / 2, 0, aoi[1], 0);
        console.log("# = " + aoi[0]);
        //obj.setData(world.cache, ground);
        world.grounds.push(obj);
        j = aoi[2];
        break;
      case '_':
        aoi = parseContinuedPiece(paramString, j, '_', i);
        obj = new Ground(world.nextID(EntityType.Ground), world, world.cache, aoi[0], 0, aoi[1], 1);
        //obj.setData(world.cache, ground);
        world.grounds.push(obj);
        j = aoi[2];
        break;
      case '/':
        aoi = parseContinuedPiece(paramString, j, '/', i);
        obj = new Water(world.nextID(EntityType.Water), world, world.cache, aoi[0], -25, aoi[1], 0);
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case '\\':
        aoi = parseContinuedPiece(paramString, j, '\\', i);
        obj = new Water(world.nextID(EntityType.Water), world, world.cache, aoi[0], -25, aoi[1], 1);
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case '(':
        aoi = parseContinuedPiece(paramString, j, '(', i);
        obj = new Water(world.nextID(EntityType.Water), world, world.cache, aoi[0], -25, aoi[1], 2);
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case ')':
        aoi = parseContinuedPiece(paramString, j, ')', i);
        obj = new Water(world.nextID(EntityType.Water), world, world.cache, aoi[0], -25, aoi[1], 3);
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case '<':
      //k = (j+1)*100 - coast image width
      case '>':
      case '[':
      case ']':
      case '.':
        break;
      case 'H':
        obj = new Hill(world.nextID(EntityType.Hill), world, world.cache, (i + j * 100 + 50) * 8 / 10, 0, 0);
        //obj.setData(world.cache, hill);
        world.hills.push(obj);
        break;
      case 'S':
        obj = new Hill(world.nextID(EntityType.Hill), world, world.cache, (i + j * 100 + 50) * 8 / 10, 0, 1);
        //obj.setData(world.cache, hill);
        world.hills.push(obj);
        break;
      case 'L':
        obj = new Runway(world.nextID(EntityType.Runway), world, world.cache, 0, i + j * 100 + 50 /*- world.getImage("runway.gif").width / 2*/, 0, 0);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case 'R':
        obj = new Runway(world.nextID(EntityType.Runway), world, world.cache, 0, i + j * 100 + 50 /*- world.getImage("runway2.gif").width / 2*/, 0, 1);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case 'l':
        obj = new Runway(world.nextID(EntityType.Runway), world, world.cache, 1, i + j * 100 + 50 /*- world.getImage("runway.gif").width / 2*/, 0, 0);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case 'r':
        obj = new Runway(world.nextID(EntityType.Runway), world, world.cache, 1, i + j * 100 + 50 /*- world.getImage("runway2.gif").width / 2*/, 0, 1);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case "T":
        obj = new Tower(world.nextID(EntityType.ControlTower), world, world.cache, i + j * 100 + 50, 0, Terrain.Normal, 0)
        world.towers.push(obj);
        break;
      case "t":
        obj = new Tower(world.nextID(EntityType.ControlTower), world, world.cache, i + j * 100 + 50, 0, Terrain.Normal, 1)
        world.towers.push(obj);
        break;
      case "D":
        obj = new Tower(world.nextID(EntityType.ControlTower), world, world.cache, i + j * 100 + 50, 0, Terrain.Desert, 0)
        world.towers.push(obj);
        break;
      case "d":
        obj = new Tower(world.nextID(EntityType.ControlTower), world, world.cache, i + j * 100 + 50, 0, Terrain.Desert, 1)
        world.towers.push(obj);
        break;
      case "F":
        obj = new Flag(world.nextID(EntityType.ControlTower), world, world.cache, i + j * 100 + 50 /* - flag width */, 0, 0)
        world.flags.push(obj);
        break;
      case "f":
        obj = new Flag(world.nextID(EntityType.ControlTower), world, world.cache, i + j * 100 + 50 /* - flag width */, 0, 1)
        world.flags.push(obj);
        break;
      default:
        console.log("def = " + paramString.charAt(0))
      //TODO
    }
  }


}

export function parseContinuedPiece(paramString: string, paramInt1: number, paramChar: string, paramInt2: number): number[] {
  let i: number = 100;
  let j: number = 0;
  if (paramInt1 == 0) {
    j = 43536;
    i += 22000 + paramInt2;
  }
  else {
    j = paramInt1 * 100 + paramInt2;
  }
  while ((paramInt1 + 1 < paramString.length) && (paramString.charAt(paramInt1 + 1) == paramChar)) {
    paramInt1++;
    i += 100;
  }
  if (paramInt1 + 1 == paramString.length) {
    i = 22000;
  }
  return [j, i, paramInt1];
}
