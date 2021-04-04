import { Player, PlayerImpl } from "../player";
import { Packet, PacketType } from "../types";
import { rm } from "../../util";
import { WebSocketConnection } from "../session";
import { createModifiersFromModifierFlags } from "typescript";
import { GameWorld, WorldInfo } from "../../world/world";
import { desert, loadStringMap } from "../../world/map";
import { TeamOption } from "../../../../client/src/teamSelector";
import { Team } from "../../constants";
import { RoomServer } from "./room";
import { Server } from "./server";


export class LobbyServer extends Server {
  roomservers: RoomServer[];
  public constructor(img) {
    super(img);
    this.roomservers = [];
    this.createRoom({ id: 0, name: "default1", map: "desert" })
    this.createRoom({ id: 1, name: "default2", map: "jungle" })
    this.createRoom({ id: 2, name: "default3", map: "sahara" })
    this.createRoom({ id: 3, name: "default4", map: "berlin" })
    this.createRoom({ id: 4, name: "default5", map: "katala" })
  }
  public packetRecieved(pi: PlayerImpl, packet: Packet) {
    switch (packet.type) {
      case PacketType.CreateRoom:
        this.createRoom(packet.data);
        break;
      case PacketType.ListRooms:
        pi.send({ type: PacketType.ListRooms, data: { rooms: this.listRooms() } });
        break;
      case PacketType.JoinRoom:
        let r = this.getRoom(packet.data.id);
        if (r != null) {
          r.connect(pi);
        }
        break;
      case PacketType.RequestFullSync:
        pi.send({ type: PacketType.ListRooms, data: { rooms: this.listRooms() } });
      default:
        for (let s of this.roomservers) {
          if (s.players.indexOf(pi) > -1) {
            //console.log("req sync")
            s.packetRecieved(pi, packet);
          }
        }
    }
  };
  public createRoom(data: WorldInfo) {
    let s: RoomServer;
    data["id"] = this.roomservers.length;
    this.roomservers.push(s = new RoomServer(this.img, data));
  }
  public listRooms(): WorldInfo[] {
    let roominfos: WorldInfo[] = [];
    for (let s of this.roomservers)
      roominfos.push(s.getWorld().getInfo());
    return roominfos;
  }
  public getRoom(id: number): RoomServer {
    for (let s of this.roomservers) {
      if (s.getWorld().getInfo().id == id) {
        return s;
      }
    }
    return null;
  }
}