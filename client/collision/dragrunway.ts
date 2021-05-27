import { GameWorld } from "../../dogfight/src/world/world";
import { PlaneSprite } from "../src/render/sprites/plane";
import { RunwaySprite } from "../src/render/sprites/runway";
import { Draggable, Renderable } from "./helper";
import {
  randBetween,
  onDragStart,
  onDragEnd,
  onDragMove
} from "./helper";

export class dragrunway extends RunwaySprite implements Draggable, Renderable {
  public constructor(s, world: GameWorld) {
    super(s, world)
    this.entity.x = 200;
    this.entity.y = 200;
    this.sprite = this.runway;
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;

    this.bindEventHandlers();
  }
  private callback: () => void;

  selected: boolean;
  sprite: PIXI.Container;
  eventData: any;
  setPosition(newX: number, newY: number) {
    this.update({ "x": newX, "y": newY });
    //this.entity.x = newX;
    //this.entity.y = newY;
    //this.redraw();
    this.callback();
    //;throw new Error("Method not implemented.");
  }
  public setCollisionCallback(callback: () => void): void {
    this.callback = callback;
  }
  public getContainer(): PIXI.Container {
    return this.sprite;
  }

  private bindEventHandlers(): void {
    this.sprite.on(
      "pointerdown",
      (e: PIXI.interaction.InteractionEvent): void => onDragStart(this, e)
    );
    this.sprite.on("pointerup", (): void => onDragEnd(this));
    this.sprite.on("pointerupoutside", (): void => onDragEnd(this));
    this.sprite.on("pointermove", (): void => onDragMove(this));
  }

}