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

  let ccoast = new Coast(1000, gw, gw.cache, coast.x, -coast.y, coast.subType);
  let iib = new ImportantBuilding(1200, gw, gw.cache, ib.x, -ib.y, 0, ib.buildingType);
  let pi = new PlayerInfo(2, gw, gw.cache);
  let p = new Plane(0, gw, gw.cache, plane.planeType, pi, 1, null);
  p.setPos(gw.cache, plane.x, -plane.y);
  p.setDirection(gw.cache, plane.direction);
  p.setFlipped(gw.cache, plane.flipped);
  let b = new Bullet(1, gw, gw.cache, bullet.position.x, -bullet.position.y, 0, 0, p);
  let t = new Man(1, gw, gw.cache, trooper.x, -trooper.y, pi);
  t.setState(gw.cache, trooper.state)
  let r = new Runway(4, gw, gw.cache, 0, runway.x, -runway.y, runway.direction);
  if (p.checkCollisionWith2(b) || p.checkCollisionWith2(t) || t.checkCollisionWith2(b)
    || b.checkCollisionWith2(r)
    || p.checkCollisionWith2(r) || t.checkCollisionWith2(r)
    || p.checkCollisionWith2(ccoast)
    || iib.checkCollisionWith2(t)) {
    bullet.sprite.scale.set(2);
    //console.log("hit");
  }
  else {
    bullet.sprite.scale.set(1);
    //console.log("nohit");

  }
}

function addRenderable(container: PIXI.Container): void {
  app.stage.addChild(container);
}

function init(): void {
  document.body.appendChild(app.view);
  runway = new dragrunway(spriteSheet);
  trooper = new dragtrooper(spriteSheet);
  plane = new dragplane(spriteSheet);
  plane.flipped = false;
  plane.direction = 0 * 64 / 2 + 0 * 64;
  plane.setDirection();
  coast = new CoastSprite(spriteSheet);
  ib = new ImportantBuildingSprite(spriteSheet);
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
  for (const a of runway.renderables) {
    addRenderable(a);
    //break;
  }
  for (const a of ib.renderables) {
    addRenderable(a);
  }
  plane.update({ planeType: PlaneType.Salmson });
  trooper.update({ state: TrooperState.Parachuting });
  runway.update({ direction: 1 });
  coast.update({ x: 250, y: -100, subType: 2 });
  ib.update({ x: 350, y: -100, buildingType: 1 });
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
      init();
      gw = new GameWorld(i);
    });
  });
});
