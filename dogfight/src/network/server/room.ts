import { Player, PlayerImpl } from "../player";
import { Packet, PacketType } from "../types";
import WebSocket from "ws";
import { rm } from "../../util";
import { WebSocketConnection } from "../session";
import { createModifiersFromModifierFlags } from "typescript";
import { GameWorld, } from "../../world/world";
import { africa, berlin, bunkers, classic2, desert, jungle, katala, loadStringMap, london, maps, sahara } from "../../world/map";
import { TeamOption } from "../../../../client/src/teamSelector";
import { Team } from "../../constants";
import { Server } from "./server";
import { isNameValid } from "../../validation";
import { requestTakeoff } from "../../world/takeoff";
import { InputState } from "../../../../client/src/clientState";
import { InputChange, InputKey } from "../../input";
import { Map } from "../../world/map";


export interface RoomParameters {
  id: number;
  name: string;
  map: Map,
  max_players: number;
}

export interface RoomInfo extends RoomParameters {
  current_players: number,
}

export class RoomServer extends Server {
  private world: GameWorld;
  private startTime: number;
  private lastTick: number;
  private params: RoomParameters;
  public constructor(img, data: RoomParameters) {
    super(img);
    this.world = new GameWorld(img, (p: Packet) => { this.broadcast(p); }, data.map);
    this.params = data;
    this.players_limit = data.max_players;
    //console.log(this.world)
    this.startTime = Date.now();
    this.lastTick = 0;
    setInterval(() => { this.tick() }, 1000 / 100);
  }
  public packetRecieved(pi: Player, packet: Packet) {
    switch (packet.type) {
      case PacketType.Ping:
        break;
      case PacketType.UserGameInput:
        this.input(pi, packet.data);
        break;
      case PacketType.PushText:
        this.broadcast(packet);
        break;
      case PacketType.RequestFullSync:
        this.fullSync(pi)
        break;
      case PacketType.RequestTakeoff:
        requestTakeoff(this.world, this.world.getPlayer(pi), packet.data);
        //this.world.requestTakeoff(pi, packet);
        break;
      case PacketType.RequestJoinTeam:
        this.joinTeam(pi, packet);
        break;
    }
  }
  public input(pi: Player, data: InputChange) {
    if (this.world.getPlayer(pi) != null) {
      const key = data.key;
      const isPressed = data.isPressed === true;
      // if they sent a valid key, send it to server.
      if (key in InputKey) {
        // set in our player keys
        // if there is an actual difference, send it to the engine.
        this.world.getPlayer(pi).inputState[key] = isPressed;
        this.world.queueInput(this.world.getPlayer(pi).id, key, isPressed);
      }
    }
  }
  public joinTeam(pi: Player, packet: Packet) {
    // make sure our data is valid
    let selection = packet.data.team;
    // validate selection
    switch (selection) {
      case TeamOption.Centrals:
        selection = Team.Centrals;
        break;
      case TeamOption.Allies:
        selection = Team.Allies;
        break;
      default:
        selection = Math.random() < 0.5 ? Team.Centrals : Team.Allies;
        break;
    }
    let player = this.world.addPlayer(selection, pi);
    const name = packet.data.name;
    if (name !== undefined) {
      if (isNameValid(name)) {
        player.setName(this.world.cache, name);
      }
    }
    console.log("Created new Player: id", player.id, Team[player.team]);

    const response: Packet = {
      type: PacketType.AssignPlayer,
      data: { id: player.id, team: player.team, name: player.name }
    };
    pi.send(response);
  }
  public fullSync(pi: Player) {
    pi.send({ type: PacketType.FullSync, data: this.world.getState() });
    pi.send({ type: PacketType.PushText, data: { text: 7 + "\t\t" + "Hello There" } });
    console.log("send full sync");
  }

  public getInfo(): RoomInfo {
    let ri: RoomInfo = {
      id: this.params.id,
      name: this.params.name,
      map: this.params.map,
      max_players: this.params.max_players,
      current_players: this.players.length,

    };


    return ri;

  }
  public getWorld() {
    return this.world;
  }
  public tick() {
    //console.log(this.world)
    const currentTick = Date.now() - this.startTime;
    const deltaTime = currentTick - this.lastTick;
    //const deltaTime = 10;
    const updates = this.world.tick(deltaTime);
    this.world.clearCache();

    if (Object.keys(updates).length > 0) {
      const packet = { type: PacketType.ChangeSync, data: updates };
      this.broadcast(packet);
      /*
      // send updates to each client
      wss.clients.forEach((client): void => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(encodePacket(packet));
        }
      });
      */
    }
    this.lastTick = currentTick;
  }
}