import { decodePacket, encodePacket } from "./encode";
import { Packet } from "./types";
import WebSocket from "ws";
import { Server } from "./server/server";
import { PlayerImpl } from "./player";

export abstract class SessionConnection {
  protected s: Server;
  protected p: PlayerImpl;
  public constructor(s: Server, p: PlayerImpl,) {
    this.s = s;
    this.p = p;
    p.setConnection(this);
  }
  abstract send(packet: Packet);

  public getNick(): string {
    return "";
  }
}

export class WebSocketConnection extends SessionConnection {
  private ws: WebSocket;
  public constructor(s: Server, p: PlayerImpl, ws: WebSocket,) {
    super(s, p);
    this.ws = ws;
    ws.on("message", (message): void => {
      const packet = decodePacket(message as string | ArrayBuffer);
      s.packetRecieved(p, packet);
    });
    ws.on("close", (): void => {
      s.disconnect(p);
      console.log("Client disconnected: Player", p.getName());
    });
  }
  public send(packet: Packet) {
    this.ws.send(encodePacket(packet));
  }
}

export class LocalConnection extends SessionConnection {
  public constructor(s, p) {
    super(s, p);
  }
  public send(packet: Packet) {
    this.s.packetRecieved(this.p, packet);
  }
}