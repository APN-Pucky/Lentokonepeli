import * as PIXI from "pixi.js";
import { GameSprite } from "./sprite";
import { GameScreen } from "./constants";
import { DebugView } from "./entities/debug";
import { Vec2d } from "../../../dogfight/src/physics/vector";
import { toPixiCoords } from "./coords";
import { SkyBackground } from "./entities/sky";
import { GameHud } from "./entities/hud";
import { EntityType } from "../../../dogfight/src/entity";
import { FlagSprite } from "./sprites/flag";
import { GroundSprite } from "./sprites/ground";
import { WaterSprite } from "./sprites/water";
import { BackgroundItemSprite } from "./sprites/backgrounditem";
import { HillSprite } from "./sprites/hill";
import { RunwaySprite } from "./sprites/runway";
import { PlayerSprite } from "./sprites/player";
import { TrooperSprite } from "./sprites/trooper";
import { TeamChooserUI } from "./entities/teamChooserUI";
import { ClientMode } from "../types";
import { TakeoffSelectUI } from "./entities/takeoffSelectUI";
import { PlaneSprite } from "./sprites/plane";
import { RespawnerSprite } from "./sprites/respawner";
import { PlayerInfos } from "./entities/playerInfos";
import { ExplosionSprite } from "./sprites/explosion";
import { BulletSprite } from "./sprites/bullet";
import { BombSprite } from "./sprites/bomb";
import { CoastSprite } from "./sprites/coast";
import { ImportantBuildingSprite } from "./sprites/importantbuilding";
import { TeamInfoSprite } from "./sprites/teaminfo";
import { KillArea } from "./entities/killarea";
import { ClockSprite } from "./sprites/clock";
import { Clock } from "./entities/clock";
import { ChatArea } from "./entities/chatarea";
import { ChatField } from "./entities/chatfield";
import { NoneSprite } from "./sprites/none";
import { Followable, isFollowable } from "../../../dogfight/src/entities/Followable";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/**
 * A class which renders the game world.
 * Uses PIXI.js for 2d Rendering.
 */
export class GameRenderer {
  private spriteSheet: PIXI.Spritesheet;

  /** A JS container of all Game Objects and their Srite Objects */
  public sprites = {};

  private pixiApp: PIXI.Application;

  /**
   * A container that holds the game
   * as it is seen fully.
   * Eg. entities, HUD, etc.
   */
  public gameContainer: PIXI.Container;

  /**
   * Contains all major containers
   * in the world that scale together,
   * such as entities and usernames, etc.
   */
  public worldContainer: PIXI.Container;

  /**
   * This is the overall container for all standard in the game.
   * Entities that belong in the game world go here.
   */
  public entityContainer: PIXI.Container;

  /**
   * A container for player name strings on the screen
   */
  public playerInfo: PlayerInfos;

  /**
   * A container which draws grids, coords, and
   * bounding boxes onto the screen to help with debugging
   */
  private debug: DebugView;

  private sky: SkyBackground;

  public HUD: GameHud;
  public killarea: KillArea;
  public chatarea: ChatArea;
  public chatfield: ChatField;
  public clock: Clock;

  // UI Controllers
  public teamChooserUI: TeamChooserUI;
  public takeoffSelectUI: TakeoffSelectUI;

  public constructor(spritesheet: PIXI.Spritesheet) {
    this.spriteSheet = spritesheet;
    // Initialize PIXI classes
    this.pixiApp = new PIXI.Application({
      width: GameScreen.Width,
      height: GameScreen.Height,
      backgroundColor: 0xf984e5,
      antialias: true
    });

    // Initialize sprite container
    this.sprites = {};
    for (const key in EntityType) {
      this.sprites[key] = {};
    }

    this.gameContainer = new PIXI.Container();
    this.worldContainer = new PIXI.Container();
    this.entityContainer = new PIXI.Container();
    this.gameContainer.interactive = true;

    this.playerInfo = new PlayerInfos(this.spriteSheet);

    this.debug = new DebugView(this.pixiApp.renderer);
    this.debug.setEnabled(false);

    this.sky = new SkyBackground(this.spriteSheet);
    this.HUD = new GameHud(this.spriteSheet);
    this.killarea = new KillArea(this.spriteSheet);
    this.chatarea = new ChatArea(this.spriteSheet);
    this.chatfield = new ChatField(this.spriteSheet);
    this.clock = new Clock(this.spriteSheet);

    // Initialize UI
    this.teamChooserUI = new TeamChooserUI(this.spriteSheet);
    this.takeoffSelectUI = new TakeoffSelectUI(this.spriteSheet);

    // Setup pixi classes
    // Make the screen objects layerable.
    this.entityContainer.sortableChildren = true;
    this.debug.worldContainer.sortableChildren = true;

    this.entityContainer.addChild(this.playerInfo.container);

    // Add stuff to the appropriate containers
    this.worldContainer.addChild(this.sky.container);
    this.worldContainer.addChild(this.entityContainer);
    this.worldContainer.addChild(this.debug.worldContainer);

    this.gameContainer.addChild(this.worldContainer);
    this.gameContainer.addChild(this.debug.gameContainer);
    this.gameContainer.addChild(this.HUD.container);
    this.gameContainer.addChild(this.killarea.container);
    this.gameContainer.addChild(this.chatarea.container);
    this.gameContainer.addChild(this.chatfield.container);
    this.gameContainer.addChild(this.clock.container);

    // Add UI controllers
    this.gameContainer.addChild(this.teamChooserUI.container);
    this.gameContainer.addChild(this.takeoffSelectUI.container);

    this.pixiApp.stage.addChild(this.gameContainer);
  }

  public setMode(mode: ClientMode): void {
    this.teamChooserUI.setEnabled(mode === ClientMode.SelectTeam);
    this.takeoffSelectUI.setEnabled(mode === ClientMode.PreFlight);
  }

  public startGame(): void {
    this.teamChooserUI.setEnabled(true);
  }

  // calls all objects with text so they can update their language.
  public updateLanguage(): void {
    this.teamChooserUI.updateText();
    this.takeoffSelectUI.updateText();
  }

  public updateSprite(type: number, id: string, data: any): void {
    if (this.sprites[type][id] === undefined) {
      this.sprites[type][id] = this.createSprite(type);
      for (const container of this.sprites[type][id].renderables) {
        this.entityContainer.addChild(container);
      }
      for (const debugContainer of this.sprites[type][id].renderablesDebug) {
        this.debug.worldContainer.addChild(debugContainer);
      }
      if (type == EntityType.Plane) {
        // console.log(data);
      }
    }
    this.sprites[type][id].update(data);
  }

  public deleteSprite(type: number, id: string): void {
    const sprite: GameSprite = this.sprites[type][id];
    if (sprite === undefined) {
      console.log("Attempted to delete undefined sprite:", type, id);
      return;
    }
    // Destroy all window setintervals, etc.
    sprite.destroy();
    for (const container of sprite.renderables) {
      this.entityContainer.removeChild(container);
      container.destroy({ children: true });
    }
    for (const container of sprite.renderablesDebug) {
      this.debug.worldContainer.removeChild(container);
      container.destroy({ children: true });
    }
    delete this.sprites[type][id];
  }

  private createSprite(type: EntityType): GameSprite {
    switch (type) {
      case EntityType.Flag:
        return new FlagSprite(this.spriteSheet);
      case EntityType.Ground:
        return new GroundSprite(this.spriteSheet);
      case EntityType.Coast:
        return new CoastSprite(this.spriteSheet);
      case EntityType.Water:
        return new WaterSprite(this.spriteSheet);
      case EntityType.BackgroundItem:
        return new BackgroundItemSprite(this.spriteSheet);
      case EntityType.Hill:
        return new HillSprite(this.spriteSheet, this.entityContainer);
      case EntityType.Runway:
        return new RunwaySprite(this.spriteSheet);
      case EntityType.ImportantBuilding:
        return new ImportantBuildingSprite(this.spriteSheet);
      case EntityType.Player:
        return new PlayerSprite(this.spriteSheet);
      case EntityType.TeamInfo:
        return new TeamInfoSprite(this.spriteSheet);
      case EntityType.Trooper:
        return new TrooperSprite(this.spriteSheet);
      case EntityType.Explosion:
        return new ExplosionSprite(this.spriteSheet);
      case EntityType.Bullet:
        return new BulletSprite(this.spriteSheet);
      case EntityType.Bomb:
        return new BombSprite(this.spriteSheet);
      case EntityType.Plane:
        return new PlaneSprite(this.spriteSheet);
      case EntityType.Respawner:
        return new RespawnerSprite(this.spriteSheet);
      case EntityType.Clock:
        return new NoneSprite(this.spriteSheet);
      default:
        console.log(
          "ERROR: Failed to create undefined object sprite:",
          EntityType[type]
        );
        break;
    }
  }

  public getStage(): PIXI.Container {
    return this.pixiApp.stage;
  }

  public getView(): HTMLCanvasElement {
    return this.pixiApp.view;
  }

  public setCursorPosInGame(gameCoords: Vec2d): void {
    this.debug.setCursorPos(gameCoords);
  }

  /**
   * Sets the camera at a given location
   *
   * WARNING!
   * Coordinates are in PIXIJS form!!
   */
  public setCamera(x: number, y: number): void {
    this.worldContainer.position.set(x, y);
    this.debug.setCamera(x, y);

    // get center of screen to set sky to
    const px = GameScreen.Width / 2;
    const py = GameScreen.Height / 2;
    const point = new PIXI.Point(px, py);
    const center = this.worldContainer.toLocal(point);
    this.sky.setPosition(center.x, center.y);
    this.sky.setCamera(x, y);

    // set hill position
    const hills = this.sprites[EntityType.Hill];
    for (const id in hills) {
      hills[id].setCamera();
    }
  }

  public resetZoom(): void {
    this.worldContainer.scale.set(1);
    this.debug.resetZoom();
  }

  public zoom(x: number, y: number, isZoomIn: boolean): void {
    const current = this.worldContainer.scale.x;
    if (isZoomIn && current > 5.0) return;
    if (!isZoomIn && current < 0.1) return;
    const mouse = new PIXI.Point(x, y);
    const local = this.worldContainer.toLocal(mouse);
    const direction = isZoomIn ? 1 : -1;
    const factor = 1 + direction * 0.1;
    this.worldContainer.scale.x *= factor;
    this.worldContainer.scale.y *= factor;
    const newX = Math.round(-(local.x * this.worldContainer.scale.x) + mouse.x);
    const newY = Math.round(-(local.y * this.worldContainer.scale.y) + mouse.y);
    this.debug.zoom(factor);
    this.setCamera(newX, newY);
  }

  public followObject(type, id) {
    let f = this.sprites[type][id].entity
    if (isFollowable(f)) {
      this.centerCamera(f.getCenterX(), f.getCenterY())
      f.followed = true;
    }
  }

  /**
   * Center the camera view on a specific (x, y) location
   * Coordinates must be in game world space.
   */
  public centerCamera(x: number, y: number): void {
    let canvasHeight = this.pixiApp.screen.height;
    // account for HUD height
    if (this.HUD.isEnabled()) {
      canvasHeight -= this.HUD.getPanelHeight();
      this.HUD.radar.centerCamera(x, y);
    }
    const canvasWidth = this.pixiApp.screen.width;
    const pos = toPixiCoords({ x: -x, y: +y });
    pos.x += Math.round(canvasWidth / 2);
    pos.y += Math.round(canvasHeight / 2);
    this.setCamera(pos.x, pos.y);
  }

  public dragCamera(deltaX: number, deltaY: number): void {
    const worldPos = this.worldContainer.position;
    const newX = Math.round(worldPos.x + deltaX);
    const newY = Math.round(worldPos.y + deltaY);
    this.setCamera(newX, newY);
  }

  public isDebugEnabled(): boolean {
    return this.debug.isEnabled();
  }

  public toggleDebugMode(): void {
    const active = !this.isDebugEnabled();
    this.debug.setEnabled(active);
    this.pixiApp.stage.cursor = active ? "grab" : "default";
  }

  public toggleGrid(): void {
    this.debug.toggleGrid();
  }
}
