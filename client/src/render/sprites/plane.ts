import * as PIXI from "pixi.js";
import { GameSprite } from "../sprite";
import { DrawLayer } from "../constants";
import {
  PlaneType,
  getPlaneRect,
  FrameStatus,
  planeImageIDs,
  frameTextureString,
  flipAnimation, Plane
} from "../../../../dogfight/src/entities/Plane";
import { directionToRadians } from "../../../../dogfight/src/physics/helpers";
import { Vec2d, setSize } from "../../../../dogfight/src/physics/vector";
import { spriteSheet } from "../textures";
import { GameWorld } from "../../../../dogfight/src/world/world";


// How long smoke stays on the screen, in milliseconds.
const SMOKE_DURATION = 200;
const BLACK_SMOKE_DURATION = 300;

export class PlaneSprite extends GameSprite<Plane> {
  //public x: number;
  //public y: number;
  //public health: number;
  //public direction: number;
  //public planeType: PlaneType;
  //public flipped: boolean;
  //public motorOn: boolean = true;

  private flipFrame: number = 0;
  private lastFlipState: boolean = undefined;
  private animatingFlip: boolean = false;

  private frameStatus: FrameStatus;

  protected container: PIXI.Container;
  //private spritesheet: PIXI.Spritesheet;

  protected plane: PIXI.Sprite;

  private lightSmoke: PIXI.Container;
  private lightSmokeInterval: number;

  private darkSmoke: PIXI.Container;
  private darkSmokeTimeout: number;

  //private debug: PIXI.Graphics;

  public constructor(spritesheet: PIXI.Spritesheet, world: GameWorld = new GameWorld(spriteSheet.textures), draggable = false) {
    super(spriteSheet, Plane, world, draggable);

    this.frameStatus = FrameStatus.Normal;

    //this.x = 0;
    //this.y = 0;
    //this.health = 255;
    //this.direction = 0;
    //this.planeType = PlaneType.Albatros;
    //this.flipped = false;

    this.spritesheet = spritesheet;

    this.container = new PIXI.Container();
    this.debug = new PIXI.Graphics();
    this.lightSmoke = new PIXI.Container();
    this.darkSmoke = new PIXI.Container();

    this.plane = new PIXI.Sprite();
    this.plane.anchor.set(0.5);

    //this.plane.anchor.set(0);

    this.container.zIndex = DrawLayer.Plane;
    this.lightSmoke.zIndex = DrawLayer.LightSmoke;
    this.darkSmoke.zIndex = DrawLayer.DarkSmoke;

    this.lightSmokeInterval = window.setInterval((): void => {
      this.createLightSmoke();
    }, 100);

    this.darkSmokeTimeout = window.setTimeout((): void => {
      this.createDarkSmoke();
    });

    this.container.addChild(this.plane);
    this.renderables.push(this.container);
    this.renderables.push(this.lightSmoke);
    this.renderables.push(this.darkSmoke);
    this.renderablesDebug.push(this.debug);

    this.bindEventHandlers(this.container);
  }

  private setDirection(): void {
    this.plane.rotation = directionToRadians(this.entity.direction) * 1;
  }

  private setPlaneTexture(): void {
    const number = planeImageIDs[this.entity.planeType];
    const frameStr = frameTextureString[this.frameStatus];
    const textureString = frameStr.replace("X", number.toString());
    this.plane.texture = this.spritesheet.textures[textureString];
    this.plane.x = this.entity.width / 2;
    this.plane.y = this.entity.height / 2;
  }

  private handleFlip(): void {
    const value = this.entity.flipped ? -1 : 1;
    this.plane.scale.y = value;
    // If our initial flip isn't set yet, we don't want to animate..
    if (this.entity.flipped === undefined) {
      return;
    }
    if (this.lastFlipState === undefined) {
      this.lastFlipState = this.entity.flipped;
    }
    // check to see if the plane has flipped
    if (this.entity.flipped != this.lastFlipState) {
      // perform the flip animation.
      if (this.animatingFlip == false) {
        this.animatingFlip = true;
        this.flipFrame = 0;
        this.animateFlip();
      }
      this.lastFlipState = this.entity.flipped;
    }
  }

  private animateFlip(): void {
    if (this.flipFrame > flipAnimation.length - 1) {
      this.flipFrame = 0;
      this.animatingFlip = false;
      return;
    }
    // set frame status
    this.frameStatus = flipAnimation[this.flipFrame];
    // render texture
    this.setPlaneTexture();
    // increment counter
    this.flipFrame += 1;
    // call animate again.
    window.setTimeout((): void => {
      this.animateFlip();
    }, 80);
  }

  public redraw(): void {
    this.handleFlip();
    this.setPlaneTexture();
    this.setDirection();
    this.container.position.set(this.entity.x, this.entity.y);
  }

  ///*
  public redrawDebug(): void {
    // debug
    this.debug.clear();
    this.debug.beginFill(0xff00ff);
    const rect = getPlaneRect(this.entity.x, this.entity.y, this.entity.direction, this.entity.planeType);
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    this.debug.lineStyle(1, 0xff00ff);
    this.debug.beginFill(0x000000, 0);
    this.debug.drawRect(0, 0, rect.width, rect.height);
    this.debug.drawCircle(0, 0, 2);
    //this.debug.rotation = directionToRadians(this.entity.direction) * -1;
    this.debug.position.set(this.entity.x, this.entity.y);
    this.debug.endFill();
  }

  private createLightSmoke(): void {
    if (this.entity.motorOn == false) {
      return;
    }
    const smoketex = this.spritesheet.textures["smoke1.gif"];
    const smoke = new PIXI.Sprite(smoketex);
    const smokePos = this.getSmokePosition(false);

    smoke.anchor.set(0.5, 0.5);
    smoke.position.set(smokePos.x, smokePos.y);

    this.lightSmoke.addChild(smoke);
    setTimeout((): void => {
      this.lightSmoke.removeChild(smoke);
    }, SMOKE_DURATION);
  }

  public createDarkSmoke(): void {
    const percentage = this.entity.health / 255;

    // how often black smoke should appear, in milliseconds.
    let smokeFrequency = 300;

    if (percentage < 0.9) {
      // Draw the dark smoke and change
      // callback time based on how damaged plane is.
      const smoketex = this.spritesheet.textures["smoke2.gif"];
      const smoke = new PIXI.Sprite(smoketex);
      const smokePos = this.getSmokePosition(false);

      smoke.anchor.set(0.5, 0.5);
      smoke.position.set(smokePos.x, smokePos.y);
      smoke.alpha = 0.9;

      this.darkSmoke.addChild(smoke);

      if (percentage <= 0.66) {
        smokeFrequency = 200;
      }
      if (percentage <= 0.33) {
        smokeFrequency = 100;
      }
      // destroy it after a while
      window.setTimeout((): void => {
        this.darkSmoke.removeChild(smoke);
      }, BLACK_SMOKE_DURATION);
    }

    this.darkSmokeTimeout = window.setTimeout((): void => {
      this.createDarkSmoke();
    }, smokeFrequency);
  }

  private getSmokePosition(center: boolean): Vec2d {
    // direction = 0 -> 256   2^8
    const radians = directionToRadians(this.entity.direction);
    const halfWidth = Math.round(this.entity.width / 2);
    const offset = 2//Math.round(halfWidth / 6);

    const r = halfWidth + offset;
    const theta = radians * 1;
    const deltaX = r * Math.cos(theta);
    const deltaY = r * Math.sin(theta);
    let newX: number, newY: number;
    if (center) {
      newX = this.entity.x;
      newY = this.entity.y;
    } else {
      newX = this.entity.x - deltaX + this.entity.width / 2;
      newY = this.entity.y - deltaY + this.entity.height / 2;
    }
    return { x: newX, y: newY };
  }

  public destroy(): void {
    window.clearInterval(this.lightSmokeInterval);
    window.clearTimeout(this.darkSmokeTimeout);
  }
}
