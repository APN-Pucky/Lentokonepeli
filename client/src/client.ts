import { spriteSheet } from "./render/textures";
import { GameRenderer } from "./render/renderer";
import { CanvasEventHandler } from "./render/event";
import { Localizer } from "./localization/localizer";
import { Packet, PacketType } from "../../dogfight/src/network/types";
import { InputKey } from "../../dogfight/src/constants";
import { pack, unpack } from "../../dogfight/src/network/packer";
import { GameInput } from "./input";
import { ClientMode } from "./types";
import { CacheEntry } from "../../dogfight/src/network/cache";
import { GameObjectType } from "../../dogfight/src/object";
import { TeamSelector } from "./teamSelector";
import { Team } from "../../dogfight/src/constants";
import { TakeoffSelector } from "./takeoffSelector";
import { radarObjects } from "./render/objects/radar";

const wssPath = "ws://" + location.host;

export class GameClient {
  /**
   * WebSocket connection
   */
  private ws: WebSocket;

  private renderer: GameRenderer;

  private input: GameInput;
  private canvasHandler: CanvasEventHandler;

  private loadedGame: boolean = false;
  private mode: ClientMode;

  // Client UI Logic classes
  private teamSelector: TeamSelector;
  private takeoffSelector: TakeoffSelector;

  private gameObjects = {};

  private playerInfo = {
    id: undefined,
    team: undefined
  };

  private followObject = {
    type: GameObjectType.None,
    id: undefined
  };

  public constructor() {
    // create renderer
    this.renderer = new GameRenderer(spriteSheet);

    // create canvas event handler
    this.canvasHandler = new CanvasEventHandler(this.renderer);
    this.canvasHandler.addListeners();

    // instantiate client UI logic
    this.teamSelector = new TeamSelector();
    this.takeoffSelector = new TakeoffSelector();

    // Add event listeners for input
    this.input = new GameInput();
    document.addEventListener("keydown", (event): void => {
      this.keyDown(event);
    });

    // center camera
    this.renderer.centerCamera(0, 150);

    // Draw it to the screen
    const div = document.getElementById("app");
    div.appendChild(this.renderer.getView());

    // Initialize game object container
    this.gameObjects = {};
    for (const key in GameObjectType) {
      this.gameObjects[key] = {};
    }

    // update language
    this.updateLanguage(Localizer.getLanguage());

    // create connection to server.
    this.ws = new WebSocket(wssPath);

    this.ws.onopen = (): void => {
      this.ws.send(pack({ type: PacketType.RequestFullSync }));
    };

    this.ws.onmessage = (event): void => {
      const packet = unpack(event.data);
      this.processPacket(packet);
    };
  }

  private setMode(mode: ClientMode): void {
    this.mode = mode;
    this.renderer.setMode(mode);
    // this.renderer.teamChooser.setEnabled(mode == ClientMode.SelectTeam);
    if (this.mode == ClientMode.SelectTeam) {
      this.renderer.teamChooserUI.setSelection(
        this.teamSelector.getSelection()
      );
      return;
    }
    if (this.mode == ClientMode.PreFlight) {
      this.takeoffSelector.setTeam(this.playerInfo.team);
      const runways = this.gameObjects[GameObjectType.Runway];
      this.takeoffSelector.updateRunways(runways, this.renderer);
      const plane = this.takeoffSelector.getPlaneSelection();
      this.renderer.takeoffSelectUI.setPlane(plane);
    }
    if (this.mode == ClientMode.Playing) {
      console.log("you are playing now!");
    }
  }

  private keyDown(event: KeyboardEvent): void {
    if (!this.input.isGameKey(event)) {
      return;
    }
    const key = this.input.getGameKey(event);

    switch (this.mode) {
      case ClientMode.SelectTeam: {
        this.teamSelector.processInput(key, this.renderer, this.ws);
        break;
      }
      case ClientMode.PreFlight: {
        const runways = this.gameObjects[GameObjectType.Runway];
        this.takeoffSelector.updateRunways(runways, this.renderer);
        this.takeoffSelector.processInput(key, this.renderer, this.ws);
        break;
      }
      case ClientMode.Playing: {
	if(key == InputKey.Up || key == InputKey.Left || key == InputKey.Right) {
		const packet: Packet = {
        	type: PacketType.UserGameInput,
        	data: {
        	  id: this.playerInfo.id,
		  key: key
        	}
      		};
      		this.ws.send(pack(packet));
      		break;
	      }
      }
    }
  }

  private processPacket(packet: Packet): void {
    const type = packet.type;
    const data = packet.data;
    if (type == PacketType.FullSync) {
      this.processCache(data);
      if (this.loadedGame == false) {
        this.loadedGame = true;
        this.setMode(ClientMode.SelectTeam);
      }
    }
    if (type == PacketType.ChangeSync) {
      this.processCache(data);
    }
    if (type == PacketType.AssignPlayer) {
      console.log("Assigned as player", data.id, "team", Team[data.team]);
      this.playerInfo = {
        id: data.id,
        team: data.team
      };
      this.setMode(ClientMode.PreFlight);
      this.renderer.HUD.setTeam(data.team);
      this.renderer.HUD.radar.refreshRadar(this.gameObjects);
    }
  }

  private processCache(cache: Cache): void {
    for (const id in cache) {
      this.processEntry(cache[id], id);
    }
  }

  private processEntry(entry: CacheEntry, id: string): void {
    const { type, ...data } = entry;
    // If the update data is empty, that is a signal
    // that the object has been deleted in the engine.
    if (Object.keys(data).length === 0) {
      this.deleteObject(type, id);
      return;
    }

    // create if not exists
    if (this.gameObjects[type][id] === undefined) {
      this.gameObjects[type][id] = {};
      console.log("Create", GameObjectType[type], id);
    }
    const object = this.gameObjects[type][id];

    // Otherwise, update the properties
    for (const key in data) {
      let value = data[key];
      object[key] = value;
    }

    this.renderer.updateSprite(type, id, data);

    // check if this changes our radar, if so, update it too.
    if (radarObjects.includes(type)) {
      this.renderer.HUD.radar.refreshRadar(this.gameObjects);
    }

    // check if change to our player or followobject
    if (type == GameObjectType.Player && this.playerInfo.id == id) {
      // set following
      this.followObject = {
        type: object["controlType"],
        id: object["controlID"]
      };
      if (this.followObject.type !== GameObjectType.None) {
        this.setMode(ClientMode.Playing);
      } else {
        this.setMode(ClientMode.PreFlight);
      }
    }
    // If this is an update to our follow object,
    // update our HUD
    if (type == this.followObject.type && this.followObject.id == id) {
      const { x, y } = object;
      if (x !== undefined && y !== undefined) {
        this.renderer.centerCamera(x, y);
      }
      this.renderer.HUD.updateFollowObject(object);
    }
  }

  private deleteObject(type: number, id: string): void {
    if (this.followObject.type == type && this.followObject.id == id) {
      this.followObject = {
        type: GameObjectType.None,
        id: undefined
      };
    }
    delete this.gameObjects[type][id];
    this.renderer.deleteSprite(type, id);
  }

  public updateLanguage(language: string): void {
    console.log("Changing language to", language);
    Localizer.setLanguage(language);
    // update strings.
    this.renderer.updateLanguage();
    document.title = Localizer.get("gameName");
  }
}
