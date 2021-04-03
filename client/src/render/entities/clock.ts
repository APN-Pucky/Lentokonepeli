import * as PIXI from "pixi.js";
import { EntityType } from "../../../../dogfight/src/entity";
import { Team } from "../../../../dogfight/src/constants";
import { TeamChooserUI } from "./teamChooserUI";
import { DrawLayer, TeamColor } from "../constants";
import { ClockColor } from "../../../../dogfight/src/entities/Clock";



export class Clock {
  public container: PIXI.Container;

  private spritesheet: PIXI.Spritesheet;
  private text: PIXI.Text;

  private myTeam: Team;

  public constructor(spritesheet: PIXI.Spritesheet) {
    this.spritesheet = spritesheet;
    this.container = new PIXI.Container();

    //this.container.x = 510;
    this.text = new PIXI.Text("", {
      font: "arial",
      fontSize: 17,
      fill: ClockColor.base,
      fontWeight: "bold"
    });

    this.text.zIndex = DrawLayer.Clock;

    // this.container.addChild(this.background);
    this.container.addChild(this.text);
  }

  public updateTime(data: any) {
    let i = Math.round(data.time / 60);
    let str1: string = "" + i;
    let j = Math.round(data.time % 60);
    let str2: string = "" + j;
    if (str1.length < 2) {
      str1 = " " + str1;
    }
    if (str2.length < 2) {
      str2 = "0" + str2;
    }
    if ((i == 0) && (j < 5)) {
      this.text.style = {
        font: "arial",
        fontSize: 17,
        fill: ClockColor.special,
        fontWeight: "bold"
      };
    } else {
      this.text.style = {
        font: "arial",
        fontSize: 17,
        fill: ClockColor.base,
        fontWeight: "bold"
      };
    }
    this.text.text = (str1 + ":" + str2)
    this.text.x = 350;
    this.text.y = 397;
    //console.log(str1 + ":" + str2)

  }
}