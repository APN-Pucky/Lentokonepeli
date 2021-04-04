import { Player, PlayerImpl } from "../player";
import { Packet, PacketType } from "../types";
import { rm } from "../../util";
import { WebSocketConnection } from "../session";
import { createModifiersFromModifierFlags } from "typescript";
import { GameWorld, } from "../../world/world";
import { desert, loadStringMap, maps } from "../../world/map";
import { TeamOption } from "../../../../client/src/teamSelector";
import { Team } from "../../constants";
import { RoomInfo, RoomParameters, RoomServer } from "./room";
import { Server } from "./server";



export class LobbyServer extends Server {
  roomservers: RoomServer[];
  public constructor(img) {
    super(img);
    this.roomservers = [];
    this.createRoom({ id: 0, name: "default1", map: { name: "desert", layout: maps["desert"], objects: undefined }, max_players: 16 })
  }
  public packetRecieved(pi: PlayerImpl, packet: Packet) {
    switch (packet.type) {
      case PacketType.CreateRoom:
        this.createRoom(packet.data.params);
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
  public createRoom(data: RoomParameters) {
    let s: RoomServer;
    data["id"] = this.roomservers.length;
    this.roomservers.push(s = new RoomServer(this.img, data));
    console.log("creatign " + data["name"])
  }
  public listRooms(): RoomInfo[] {
    let roominfos: RoomInfo[] = [];
    for (let s of this.roomservers)
      roominfos.push(s.getInfo());
    return roominfos;
  }
  public getRoom(id: number): RoomServer {
    for (let s of this.roomservers) {
      if (s.getInfo().id == id) {
        return s;
      }
    }
    return null;
  }
  public disconnect(pi: Player) {
    super.disconnect(pi);
    for (let r of this.roomservers) r.disconnect(pi);
  }
}