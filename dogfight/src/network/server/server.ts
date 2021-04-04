import { Player, PlayerImpl } from "../player";
import { Packet, PacketType } from "../types";
import { rm } from "../../util";
import { WebSocketConnection } from "../session";
import { createModifiersFromModifierFlags } from "typescript";
import { GameWorld, WorldInfo } from "../../world/world";
import { desert, loadStringMap } from "../../world/map";
import { TeamOption } from "../../../../client/src/teamSelector";
import { Team } from "../../constants";
import { LobbyServer } from "./lobby";

export abstract class Server {
  public players: Player[];
  public img;
  public constructor(img) {
    this.img = img;
    this.players = [];
  }
  abstract packetRecieved(pi: Player, packet: Packet);
  public broadcast(packet: Packet) { for (let p of this.players) p.send(packet) };
  send(pi: Player, packet: Packet) { pi.send(packet) };
  public connect(pi: Player) { this.players.push(pi); }
  public disconnect(pi: Player) { rm(this.players, pi); }
}


