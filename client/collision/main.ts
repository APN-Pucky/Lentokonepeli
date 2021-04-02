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
import { PlaneSprite } from "../src/render/sprites/plane";
import { RunwaySprite } from "../src/render/sprites/runway";
import { TrooperSprite } from "../src/render/sprites/trooper";

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
    plane.entity.checkCollisionWith2(b) || plane.entity.checkCollisionWith2(trooper.entity) ||
    plane.entity.checkCollisionWith2(runway.entity) ||
    plane.entity.checkCollisionWith2(coast.entity) ||

    trooper.entity.checkCollisionWith2(b) ||
    trooper.entity.checkCollisionWith2(coast.entity) ||
    trooper.entity.checkCollisionWith2(runway.entity) ||
    b.checkCollisionWith2(runway.entity) ||
    ib.entity.checkCollisionWith2(trooper.entity) ||
      ib.entity.checkCollisionWith2(runway.entity)) {
    bullet.sprite.scale.set(5);
    console.log("hit");
  }
  else if (
    plane.entity.getCollisionBounds().intersects(coast.entity.getCollisionBounds()) ||
    ib.entity.getCollisionBounds().intersects(coast.entity.getCollisionBounds()) ||
    ib.entity.getCollisionBounds().intersects(runway.entity.getCollisionBounds())
  ) {
    bullet.sprite.scale.set(2);
    console.log("intersect")
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
  runway = new RunwaySprite(spriteSheet, gw, true);
  trooper = new TrooperSprite(spriteSheet, gw, true);
  plane = new PlaneSprite(spriteSheet, gw, true);
  plane.flipped = false;
  plane.direction = 0 * 64 / 2 + 0 * 64;
  plane.setDirection();
  coast = new CoastSprite(spriteSheet, gw, true);
  ib = new ImportantBuildingSprite(spriteSheet, gw, true);
  for (const a of coast.renderables) { addRenderable(a) }

  //addRenderable(rect1.getContainer());
  //addRenderable(rect2.getContainer());
  //addRenderable(runway.getContainer());
  addRenderable(bullet.getContainer());
  for (const a of plane.renderables) {
    addRenderable(a);
  }
  for (const a of plane.renderablesDebug) {
    addRenderable(a);
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
  trooper.update({ x: 200, y: 200, state: TrooperState.Parachuting });
  runway.update({ x: 100, y: 100, direction: 1 });
  coast.update({ x: 2500, y: 300, subType: 1 });
  ib.update({ x: 350, y: 120, buildingType: 1 });
  plane.setCollisionCallback(updateCollisions);
  trooper.setCollisionCallback(updateCollisions);
  //rect1.setCollisionCallback(updateCollisions);
  //circle.setCollisionCallback(updateCollisions);
  //rect2.setCollisionCallback(updateCollisions);
  bullet.setCollisionCallback(updateCollisions);
  runway.setCollisionCallback(updateCollisions);
  coast.setCollisionCallback(updateCollisions);
  ib.setCollisionCallback(updateCollisions);
}

window.addEventListener("load", (): void => {
  loadSpriteSheet((): void => {
    loadImages("./assets/images/images.png").then((i) => {
      gw = new GameWorld(i);
      init(gw);
    });
  });
});
