import WebSocket from "ws";
import { Player, PlayerImpl } from "../player";
import { WebSocketConnection } from "../session";
import { LobbyServer } from "./lobby";

export class MainServer extends LobbyServer {
  public constructor(img, wss: WebSocket.Server) {
    super(img);
    wss.on("connection", (ws): void => {
      let p: Player;
      ws.binaryType = "arraybuffer";
      new WebSocketConnection(this, p = new PlayerImpl(), ws);
      this.connect(p);
    })
  }
}