import { GameWorld } from "./world";
import { Ground } from "../entities/Ground";
import { Flag } from "../entities/Flag";
import { Hill } from "../entities/Hill";
import { Runway } from "../entities/Runway";
import { BackgroundItem } from "../entities/BackgroundItem";
import { Water } from "../entities/Water";
import { EntityType } from "../entity";
import { FacingDirection, Terrain } from "../constants";
import { Coast, coastSchema } from "../entities/Coast";
import { ImportantBuilding } from "../entities/ImportantBuilding";
import { ImportantBuildingSprite } from "../../../client/src/render/sprites/importantbuilding";


export interface Map {
  name: string,
  layout: string,
  objects: GameMap,
}
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

export let katala: string = [
  "..HF..fH....................H......",
  "...L..r.........................t..",
  "\\<######>//////////////////////<#>/"].join("\n");
export let london: string = [
  "...H..........H...H...H....H...H...H.....H..........H....",
  ".R..................i....l..i..r....i..................L.",
  "F...F..........fft....ff..t...T..ff....Tff..........F...F",
  "#####>////////<###########################>\\\\\\\\\\\\\\\\<#####",
].join("\n");
export let bunkers: string = [
  "...Sp..S.p...........pP...........P..S..p.S...",
  ".....D.F.R..........F..f.............f.d......",
  "...R................I..i..........l.....l.....",
  "([_________]((((((([____])))))))[___________])"
].join("\n");

export let classic2: string = [
  "...H.....H.....H.....H.....H.....H.....H.....H.....H.....H...",
  "...R.....................................................l...",
  "........R....R.................................l....l........",
  "........F....T.................................t....f........",
  "\\<#########################################################>/"
].join("\n");
export let desert: string = [
  "...P.....P....p..p....P.......P........pP....",
  "........D...R.S.........S.....S.....d........",
  "...IF.R.........................l.....l.fi...",
  "([_________________________________________])",
].join("\n");
export let africa: string = [
  "..p.PPpP.p.......Pp....pp..P.p...p.P......pP.p.......p.pPPpPp..",
  "...S....S....S...S....S.....S....S...S......S...S...S...S..S...",
  "..I.I.I...R..FDF...............................fdf..l...i.i.i..",
  "..................L.........................r..................",
  "([___________________________________________________________])"
].join("\n");

export let jungle: string = [
  "..p..p......P.Pp.pp.....PpP.....Pp.p.p......P.pP...",
  "...H....H....H.....H...H.....H...H......H...H....H.",
  "............R........................l.............",
  "...R.......F..........................f......l.....",
  "([_____])([________])(([____])([_______]))([_____])",
].join("\n")

export let sahara: string = [
  "................S........................S.......S.....S..S..........................................S...............",
  ".............D...R..................................................................................d................",
  "PP...ppp...R..F.................................................................................l..f..l.....PP...ppP.",
  "__])[_________________________________________________________________________________________________________]([____",
].join("\n")

export let berlin: string = [
  "....................................................................H...H...",
  "FFF..TF.....tF..T.TF...TF...T..F..t..t..t..FFF..............................",
  ".......R..I...R.....R........I........................................f.l...",
  "###############################################>//////////////////<#######>/",
].join("\n")

export let maps = {
  "katala": katala,
  "london": london,
  "bunkers": bunkers,
  "classic2": classic2,
  "desert": desert,
  "africa": africa,
  "jungle": jungle,
  "berlin": berlin,
  "sahara": sahara
};

export function loadMap(world: GameWorld, map: GameMap): void {
  map.grounds.forEach((ground): void => {
    const obj = new Ground(world);
    obj.setData(world.cache, ground);
    world.grounds.push(obj);
  });
  map.flags.forEach((flag): void => {
    const obj = new Flag(world);
    obj.setData(world.cache, flag);
    world.flags.push(obj);
  });
  map.hills.forEach((hill): void => {
    const obj = new Hill(world);
    obj.setData(world.cache, hill);
    world.hills.push(obj);
  });
  map.runways.forEach((runway): void => {
    const obj = new Runway(world, null, 0, 0, 1);
    obj.setData(world.cache, runway);
    world.runways.push(obj);
  });
  map.towers.forEach((tower): void => {
    const obj = new BackgroundItem(
      world,
    );
    obj.setData(world.cache, tower);
    world.backgrounditems.push(obj);
  });
  map.waters.forEach((water): void => {
    const obj = new Water(world);
    obj.setData(world.cache, water);
    world.waters.push(obj);
  });
}

export function loadStringMap(world: GameWorld, strings: string) {
  for (let s of strings.split("\n")) {
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
        obj = new Ground(world, aoi[0], 0, aoi[1], 0);
        console.log("# = " + aoi[0]);
        //obj.setData(world.cache, ground);
        world.grounds.push(obj);
        j = aoi[2];
        break;
      case '_':
        aoi = parseContinuedPiece(paramString, j, '_', i);
        obj = new Ground(world, aoi[0], 0, aoi[1], 1);
        //obj.setData(world.cache, ground);
        world.grounds.push(obj);
        j = aoi[2];
        break;
      case '/':
        aoi = parseContinuedPiece(paramString, j, '/', i);
        obj = new Water(world, aoi[0], 25, aoi[1], 0);
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case '\\':
        aoi = parseContinuedPiece(paramString, j, '\\', i);
        obj = new Water(world, aoi[0], 25, aoi[1], 1);
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case '(':
        aoi = parseContinuedPiece(paramString, j, '(', i);
        obj = new Water(world, aoi[0], 25, aoi[1], 2);
        console.log(aoi[0], aoi[1])
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case ')':
        aoi = parseContinuedPiece(paramString, j, ')', i);
        obj = new Water(world, aoi[0], 25, aoi[1], 3);
        console.log(aoi[0], aoi[1])
        //obj.setData(world.cache, ground);
        world.waters.push(obj);
        j = aoi[2];
        break;
      case '<':
        obj = new Coast(world, (i + (j + 1) * 100) - Coast.getImageWidth(world, 0), 0, 0);
        //obj.setData(world.cache, hill);
        world.coasts.push(obj);
        break;
      //k = (j+1)*100 - coast image width
      case '>':
        obj = new Coast(world, (i + (j) * 100), 0, 1);
        //obj.setData(world.cache, hill);
        world.coasts.push(obj);
        break;
      case '[':
        obj = new Coast(world, (i + (j + 1) * 100) - Coast.getImageWidth(world, 2), 0, 2);
        //obj.setData(world.cache, hill);
        world.coasts.push(obj);
        break;
      case ']':
        obj = new Coast(world, (i + (j) * 100), 0, 3);
        //obj.setData(world.cache, hill);
        world.coasts.push(obj);
        break;
      case '.':
        break;
      case 'H':
        obj = new Hill(world, (i + j * 100 - 6 * 50) * 8 / 10, -40, 0);
        //obj.setData(world.cache, hill);
        world.hills.push(obj);
        break;
      case 'S':
        obj = new Hill(world, (i + j * 100 - 6 * 50) * 8 / 10, -45, 1);
        //obj.setData(world.cache, hill);
        world.hills.push(obj);
        break;
      case 'L':
        obj = new Runway(world, 0, i + j * 100 + 50 - Runway.getImageWidth(world, 0) / 2, -25, 0);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case 'R':
        obj = new Runway(world, 0, i + j * 100 + 50 - Runway.getImageWidth(world, 1) / 2, -25, 1);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case 'l':
        obj = new Runway(world, 1, i + j * 100 + 50 - Runway.getImageWidth(world, 0) / 2, -25, 0);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case 'r':
        obj = new Runway(world, 1, i + j * 100 + 50 - Runway.getImageWidth(world, 1) / 2, -25, 1);
        //obj.setData(world.cache, runway);
        world.runways.push(obj);
        break;
      case "T":
        obj = new BackgroundItem(world, i + j * 100 + 50, 5, 0)
        world.backgrounditems.push(obj);
        break;
      case "t":
        obj = new BackgroundItem(world, i + j * 100 + 50, 5, 1)
        world.backgrounditems.push(obj);
        break;
      case "D":
        obj = new BackgroundItem(world, i + j * 100 + 50, 5, 2)
        world.backgrounditems.push(obj);
        break;
      case "d":
        obj = new BackgroundItem(world, i + j * 100 + 50, 5, 3)
        world.backgrounditems.push(obj);
        break;
      case "P":
        obj = new BackgroundItem(world, i + j * 100 + 50, 5, 4)
        world.backgrounditems.push(obj);
        break;
      case "p":
        obj = new BackgroundItem(world, i + j * 100 + 50, 5, 5)
        world.backgrounditems.push(obj);
        break;
      case "F":
        obj = new Flag(world, i + j * 100 + 50 - Flag.getImageWidth(world) / 2, -90, 0)
        world.flags.push(obj);
        break;
      case "f":
        obj = new Flag(world, i + j * 100 + 50 - Flag.getImageWidth(world) / 2, -90, 1)
        world.flags.push(obj);
        break;
      case "I":
        obj = new ImportantBuilding(world, 0, 0, i + j * 100 + 50 - ImportantBuilding.getImageWidth(world, 0) / 2, 0 - ImportantBuilding.getImageHeight(world, 0) + 7);
        world.importantBuildings.push(obj);
        break;
      case "i":
        obj = new ImportantBuilding(world, 1, 1, i + j * 100 + 50 - ImportantBuilding.getImageWidth(world, 1) / 2, 0 - ImportantBuilding.getImageHeight(world, 1) + 7);
        world.importantBuildings.push(obj);
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
    j = -22000;
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
