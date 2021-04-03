import * as PIXI from "pixi.js";
import { EntityType } from "../../../../dogfight/src/entity";
import { Team } from "../../../../dogfight/src/constants";
import { TeamChooserUI } from "./teamChooserUI";
import { TeamColor } from "../constants";
import { ChatColor } from "./chatarea";
import { ClientState, InputState } from "../../clientState";

export class ChatField {
  public container: PIXI.Container;
  public line: PIXI.Container;

  private spritesheet: PIXI.Spritesheet;
  private text: PIXI.Text;

  private myTeam: Team;

  public constructor(spritesheet: PIXI.Spritesheet) {
    this.spritesheet = spritesheet;
    this.container = new PIXI.Container();

    this.container.x = 2;
    this.container.y = 5;
    this.container.width = 730;
    this.container.height = 120;
    this.text = new PIXI.Text("", {
      font: "arial",
      fontSize: 15,
      fill: ChatColor.ALL_FG,
      stroke: ChatColor.ALL_BG,
      strokeThickness: 1,
      fontWeight: "bold"
    });
    this.text.zIndex = 1000;

    // this.container.addChild(this.background);
    this.container.addChild(this.text);
  }

  public update(): void {
    if (ClientState.inputing == InputState.ALL) {

      this.text.style = {
        font: "arial",
        fontSize: 15,
        fill: ChatColor.ALL_FG,
        stroke: ChatColor.ALL_BG,
        strokeThickness: 1,
        fontWeight: "bold"
      };
    }
    if (ClientState.inputing == InputState.TEAM) {

      this.text.style = {
        font: "arial",
        fontSize: 15,
        fill: ChatColor.TEAM_FG,
        stroke: ChatColor.TEAM_BG,
        strokeThickness: 1,
        fontWeight: "bold"
      };
    }
    this.text.visible = ClientState.inputing != InputState.None;
    this.text.text = "Say: " + ClientState.inputStr;
  }

}