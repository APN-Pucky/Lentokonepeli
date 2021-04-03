import * as PIXI from "pixi.js";
import { EntityType } from "../../../../dogfight/src/entity";
import { Team } from "../../../../dogfight/src/constants";
import { TeamChooserUI } from "./teamChooserUI";
import { TeamColor } from "../constants";
export enum ChatColor {
  INFO_FG = 0xffffff,
  ALL_FG = 0xffff00,
  TEAM_FG = 0xffb4b4ff,
  INFO_BG = 0x000000,
  ALL_BG = 0x000000,
  TEAM_BG = 0x000000,
  SERVER_BROADCAST_BG = 0xffffff,
  SERVER_BROADCAST_FG = 0x000000,
  ROOM_BROADCAST_BG = 0x000000,
  ROOM_BROADCAST_FG = 0x68ff57
}

export class ChatArea {
  public container: PIXI.Container;
  public line: PIXI.Container;

  private spritesheet: PIXI.Spritesheet;
  private text: PIXI.Text;

  private myTeam: Team;

  public constructor(spritesheet: PIXI.Spritesheet) {
    this.setTeam(Team.Spectator);
    this.spritesheet = spritesheet;
    this.container = new PIXI.Container();

    this.container.x = 2;
    this.container.y = 280 + 120 - 8;
    this.container.width = 730;
    this.container.height = 120;
    this.text = new PIXI.Text("", {
      font: "arial",
      fontSize: 15,
      fill: 0xffffff
    });
    this.text.zIndex = 1000;

    // this.container.addChild(this.background);
    this.container.addChild(this.text);
  }


  public setTeam(newTeam: Team): void {
    this.myTeam = newTeam;
  }

  public refreshArea(text: any): void {
    //this.text.text = text;
    this.parseChatMessage(text);
    console.log("New chat " + text);
  }

  public insertText(s, style) {
    let newX = this.line.getBounds().right;
    let tmp;
    if (style == "team") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: ChatColor.TEAM_FG,
          stroke: ChatColor.TEAM_BG,
          strokeThickness: 1,
          fontWeight: "bold"
        })
      );
    }
    if (style == "info") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: ChatColor.INFO_FG,
          stroke: ChatColor.INFO_BG,
          strokeThickness: 1,
          fontWeight: "bold"
        })
      );
    }
    if (style == "all") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: ChatColor.ALL_FG,
          stroke: ChatColor.ALL_BG,
          strokeThickness: 1,
          fontWeight: "bold"
        })
      );
    }
    if (style == "room_broadcast") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: ChatColor.ROOM_BROADCAST_FG,
          stroke: ChatColor.ROOM_BROADCAST_BG,
          strokeThickness: 1,
          fontWeight: "bold"
        })
      );
    }
    if (style == "server_broadcast") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: ChatColor.SERVER_BROADCAST_FG,
          stroke: ChatColor.SERVER_BROADCAST_BG,
          strokeThickness: 1,
          fontWeight: "bold"
        })
      );
    }
    tmp.x = newX;
    //tmp.y = this.container.height;

  };

  public parseChatMessage(str: string) {
    let elems: string[] = str.split("\t");
    if (+elems[0] > 0 && +elems[0] < 9 && +elems[0] != 4) {
      for (let c of this.container.children) {
        c.y -= 15 + 1;
      }
      this.line = new PIXI.Container();
      //this.line.y = this.container.getBounds().bottom;
      if (+elems[0] == 2) {
        this.insertText("(team)" + " " + elems[1] + ": " + elems[2], "team");
      }
      else if (+elems[0] == 3) {
        this.insertText(elems[1] + " " + elems[2], "info");
      }
      else if (+elems[0] == 1) {
        this.insertText(elems[1] + ": " + elems[2], "all");
      }
      else if (+elems[0] == 6) {
        this.insertText("(spectator)" + " " + elems[1] + ": " + elems[2], "team");
      }
      else if (+elems[0] == 7) {
        this.insertText("(admin)" + " " + elems[2], "room_broadcast");
      }
      else if (+elems[0] == 8) {
        this.insertText("(server)" + " " + elems[2], "server_broadcast");
      }
      this.container.addChild(this.line);
      const tl = this.line;
      setTimeout(() => {
        this.container.removeChild(tl);

      }, 13000);
    }
  }
}