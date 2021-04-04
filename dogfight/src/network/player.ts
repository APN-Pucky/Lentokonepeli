import { SessionConnection } from "./session";
import { Packet } from "./types";

export interface Player {
  getName(): String;
  getPing(): number;
  getUserId(): number;
  isAdmin(): boolean;
  isSheriff(): boolean;
  isVisibleSheriff(): boolean;
  isVip(): boolean;
  isVisibleVip(): boolean;
  isRegistered(): boolean;
  isSpectator(): boolean;
  send(P: Packet): void;
}

export class PlayerImpl implements Player {
  private spectator: boolean;
  private connection: SessionConnection;
  private ping: number;
  private name: string;

  public constructor(ps: SessionConnection = null, isSpectator: boolean = false) {
    this.spectator = isSpectator;
    this.connection = ps;
  }

  public setConnection(connection: SessionConnection) {
    this.connection = connection;
  }

  public send(packet: Packet) {
    this.connection.send(packet);
  }

  public getName(): string {
    return this.name;
  }
  public getPing(): number {
    return this.ping;
  }

  public isAdmin(): boolean {
    return false;//this.connection.isAdmin();
  }

  public isRegistered(): boolean {
    return false;//this.connection.isRegistered();
  }

  public isSheriff(): boolean {
    return false;//this.connection.isSheriff();
  }

  public isVip(): boolean {
    return false;//this.connection.isVip();
  }

  public isVisibleSheriff(): boolean {
    return false;//this.connection.isVisibleSheriff();
  }

  public isVisibleVip(): boolean {
    return false;//this.connection.isVisibleVip();
  }

  public getUserId(): number {
    return 0;//this.connection.getUserBase().getRegId();
  }
  public isSpectator(): boolean {
    return false;//this.spectator;
  }
}