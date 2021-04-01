import * as PIXI from "pixi.js";
import { RectangleSprite } from "./rect";
import {
  isRectangleCollision,
  isCircleRectCollision,
  isPointRectCollision
} from "../../dogfight/src/physics/collision";
import { CircleSprite } from "./circle";
import { PointSprite } from "./point";
import { loadSpriteSheet, spriteSheet } from "../src/render/textures";
import { dragplane } from "./dragplane";
import { Plane, PlaneType } from "../../dogfight/src/entities/Plane";
import { GameWorld } from "../../dogfight/src/world/world";
import { Bullet } from "../../dogfight/src/entities/Bullet";
import { PlayerInfo } from "../../dogfight/src/entities/PlayerInfo";
import { loadImages } from "../../dogfight/src/images";
import { Man, TrooperState } from "../../dogfight/src/entities/Man";
import { dragtrooper } from "./dragtrooper";
import { dragrunway } from "./dragrunway";
import { Runway } from "../../dogfight/src/entities/Runway";
import { CoastSprite } from "../src/render/sprites/coast";
import { Coast } from "../../dogfight/src/entities/Coast";
import { ImportantBuildingSprite } from "../src/render/sprites/importantbuilding";
import { isBigIntLiteral } from "typescript";
import { ImportantBuilding } from "../../dogfight/src/entities/ImportantBuilding";

console.log("collision script");

const app = new PIXI.Application({
  width: 750,
  height: 750,
  transparent: true,
  antialias: true
});

const rect1 = new RectangleSprite();
const rect2 = new RectangleSprite();
const circle = new CircleSprite();
const bullet = new PointSprite();
let plane, runway;
let trooper;
let gw;
let coast, ib;
rect2.sprite.alpha = 0;
function updateCollisions(): void {
  if (isRectangleCollision(rect1.rectObj, rect2.rectObj)) {
    rect1.sprite.tint = 0xff0000;
    rect2.sprite.tint = 0xff0000;
  } else {
    rect1.sprite.tint = rect1.tint;
    rect2.sprite.tint = rect2.tint;
  }
  if (isCircleRectCollision(circle.circleObj, rect1.rectObj)) {
    rect1.sprite.alpha = 0.35;
  } else {
    rect1.sprite.alpha = 1;
  }

  if (isPointRectCollision(bullet.position, rect1.rectObj)) {
    bullet.sprite.scale.set(2);
  } else {
    bullet.sprite.scale.set(1);
  }

  //let ccoast = new Coast(gw, coast.x, coast.y, coast.subType);
  //let iib = new ImportantBuilding(gw, ib.x, ib.y, 0, ib.buildingType);
  //let pi = new PlayerInfo(gw);
  //let p = new Plane(gw, plane.planeType, pi, 1, null);
  plane.entity.planeType = plane.planeType;
  plane.entity.setPos(gw.cache, plane.x, plane.y);
  plane.entity.setDirection(gw.cache, plane.direction);
  plane.entity.setFlipped(gw.cache, plane.flipped);
  let b = new Bullet(gw, bullet.position.x, bullet.position.y, 0, 0, null);
  //let t = new Man(gw, trooper.x, trooper.y, pi);
  //t.setState(gw.cache, trooper.state)
  //let r = new Runway(gw, 0, runway.x, runway.y, runway.direction);
  //console.log("b ", ib.entity.getCollisionBounds())
  //console.log("r ", runway.entity.getCollisionBounds())
  if (
    ib.entity.getCollisionBounds().intersects(runway.entity.getCollisionBounds()) ||
    //plane.entity.checkCollisionWith2(b) || plane.entity.checkCollisionWith2(trooper.entity)  ||
    trooper.entity.checkCollisionWith2(b) ||
    trooper.entity.checkCollisionWith2(coast.entity) ||
    b.checkCollisionWith2(runway.entity) ||
    // plane.entity.checkCollisionWith2(runway.entity) || 
    trooper.entity.checkCollisionWith2(runway.entity) ||
    // plane.entity.checkCollisionWith2(coast.entity) ||
    ib.entity.checkCollisionWith2(trooper.entity)) {
    bullet.sprite.scale.set(5);
    console.log("hit");
  }
  else {
    bullet.sprite.scale.set(1);
    //console.log("nohit");

  }
}

function addRenderable(container: PIXI.Container): void {
  app.stage.addChild(container);
}

function init(gw: GameWorld): void {
  document.body.appendChild(app.view);
  runway = new dragrunway(spriteSheet, gw);
  trooper = new dragtrooper(spriteSheet, gw);
  plane = new dragplane(spriteSheet, gw);
  plane.flipped = false;
  plane.direction = 0 * 64 / 2 + 0 * 64;
  plane.setDirection();
  coast = new CoastSprite(spriteSheet, gw);
  ib = new ImportantBuildingSprite(spriteSheet, gw);
  for (const a of coast.renderables) { addRenderable(a) }

  //addRenderable(rect1.getContainer());
  //addRenderable(rect2.getContainer());
  //addRenderable(runway.getContainer());
  addRenderable(bullet.getContainer());
  for (const a of plane.renderables) {
    addRenderable(a);
    break;
  }
  for (const a of trooper.renderables) {
    addRenderable(a);
    //break;
  }
  for (const a of trooper.renderablesDebug) {
    addRenderable(a);
    //break;
  }
  for (const a of runway.renderables) {
    addRenderable(a);
    //break;
  }
  for (const a of runway.renderablesDebug) {
    addRenderable(a);
    //break;
  }
  for (const a of coast.renderablesDebug) {
    addRenderable(a);
    //break;
  }
  for (const a of ib.renderables) {
    addRenderable(a);
  }
  for (const a of ib.renderablesDebug) {
    addRenderable(a);
  }
  plane.update({ planeType: PlaneType.Salmson });
  trooper.update({ state: TrooperState.Parachuting });
  runway.update({ direction: 1 });
  coast.update({ x: 250, y: 100, subType: 1 });
  ib.update({ x: 350, y: 100, buildingType: 2 });
  plane.setCollisionCallback(updateCollisions);
  trooper.setCollisionCallback(updateCollisions);
  //rect1.setCollisionCallback(updateCollisions);
  //circle.setCollisionCallback(updateCollisions);
  //rect2.setCollisionCallback(updateCollisions);
  bullet.setCollisionCallback(updateCollisions);
  runway.setCollisionCallback(updateCollisions);
}

window.addEventListener("load", (): void => {
  loadSpriteSheet((): void => {
    loadImages("./assets/images/images.png").then((i) => {
      gw = new GameWorld(i);
      init(gw);
    });
  });
});
