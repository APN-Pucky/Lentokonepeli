import * as PIXI from "pixi.js";
import { EntityType } from "../../../../dogfight/src/entity";
import { Team } from "../../../../dogfight/src/constants";
import { TeamChooserUI } from "./teamChooserUI";
import { TeamColor } from "../constants";


export class KillArea {
  public container: PIXI.Container;
  public line: PIXI.Container;

  private spritesheet: PIXI.Spritesheet;
  private text: PIXI.Text;

  private myTeam: Team;

  public constructor(spritesheet: PIXI.Spritesheet) {
    this.setTeam(Team.Spectator);
    this.spritesheet = spritesheet;
    this.container = new PIXI.Container();

    this.container.x = 510;
    this.text = new PIXI.Text("", {
      font: "arial",
      fontSize: 15,
      fill: 0xffffff
    });

    // this.container.addChild(this.background);
    this.container.addChild(this.text);
  }


  public setTeam(newTeam: Team): void {
    this.myTeam = newTeam;
  }

  public refreshArea(text: any): void {
    //this.text.text = text;
    this.parseChatMessage(text);
    console.log("New text" + text);
  }

  public insertText(s, style) {
    let newX = this.line.getBounds().right;
    let tmp;
    if (style == "own") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: TeamColor.OwnForeground
        })
      );
    }
    if (style == "opponent") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: TeamColor.OpponentForeground
        })
      );
    }
    if (style == "unchoosen") {
      this.line.addChild(
        tmp = new PIXI.Text(s, {
          font: "arial",
          fontSize: 15,
          fill: TeamColor.UnchosenForeground
        })
      );
    }
    if (style == "plane") {
      this.line.addChild(
        tmp = new PIXI.Sprite(this.spritesheet.textures["plane_icon.gif"])
      )
    }
    if (style == "man") {
      this.line.addChild(
        tmp = new PIXI.Sprite(this.spritesheet.textures["man_icon.gif"])
      )
    }
    tmp.x = newX;

  };

  public parseChatMessage(str: string) {
    let elems: string[] = str.split("\t");
    if (+elems[0] == 4) {
      this.line = new PIXI.Container();
      this.line.y = this.container.getBounds().bottom;
      let i: number = +elems[1];
      let j: number = this.myTeam;
      let str1: string;
      let str2: string;
      if (j == -1) {
        str1 = "unchosen";
        str2 = "unchosen";
      }
      else if (j == i) {
        str1 = "own";
        str2 = "opponent"
      }
      else {
        str1 = "opponent"
        str2 = "own";
      }
      let k: number = +elems[2];
      let str3: string;
      let str4: string;
      switch (k) {
        case 1:
          this.insertText(elems[3] + " ", str1);
          this.insertText(" ", "plane");
          break;
        case 2:
          str3 = elems[3];
          str4 = elems[4];
          this.insertText(str3 + " ", str1);
          this.insertText(" ", "plane");
          this.insertText(" " + str4 + " ", str1);
          break;
        case 3:
          str3 = elems[3];
          str4 = elems[4];
          this.insertText(str3 + " ", str1);
          this.insertText(" ", "plane");
          this.insertText(" " + str4 + " ", str2);
          break;
        case 4:
          this.insertText(elems[3] + " ", str1);
          this.insertText(" ", "man");
          break;
        case 5:
          str3 = elems[3];
          str4 = elems[4];
          this.insertText(str3 + " ", str1);
          this.insertText(" ", "man");
          this.insertText(" " + str4 + " ", str1);
          break;
        case 6:
          str3 = elems[3];
          str4 = elems[4];
          this.insertText(str3 + " ", str1);
          this.insertText(" ", "man");
          this.insertText(" " + str4 + " ", str2);
          break;
      }
      this.container.addChild(this.line);
      const tl = this.line;
      setTimeout(() => { this.container.removeChild(tl) }, 8000);

    }
  }
}