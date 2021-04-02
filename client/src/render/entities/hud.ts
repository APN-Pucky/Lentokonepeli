import * as PIXI from "pixi.js";
import { GameScreen, TeamColor } from "../constants";
import { Radar } from "./radar";
import { Team } from "../../../../dogfight/src/constants";
import { TeamInfo } from "../../../../dogfight/src/entities/TeamInfo";
import { KillArea } from "./killarea";

const teamPanel = {
  [Team.Centrals]: "metalpanel.jpg",
  [Team.Spectator]: "metalpanel.jpg",
  [Team.Allies]: "woodpanel.jpg"
};

export class GameHud {
  public container: PIXI.Container;

  private enabled: boolean = false;

  private spritesheet: PIXI.Spritesheet;

  private panel: PIXI.Sprite;

  private infoBars: PIXI.Graphics;
  private scoreBars: PIXI.Graphics;
  private text1: PIXI.Text;
  private text2: PIXI.Text;
  private bombs: PIXI.Container;

  // game components
  public radar: Radar;
  public team: Team;

  public constructor(spritesheet: PIXI.Spritesheet) {
    this.spritesheet = spritesheet;
    this.container = new PIXI.Container();

    // init radar
    this.radar = new Radar(spritesheet);
    this.infoBars = new PIXI.Graphics();
    this.scoreBars = new PIXI.Graphics();
    this.bombs = new PIXI.Container();

    // add bomb images
    for (let i = 0; i < 5; i++) {
      const tex = this.spritesheet.textures["droppedbomb.gif"];
      const sprite = new PIXI.Sprite(tex);
      sprite.position.set(i * 14, 0);
      this.bombs.addChild(sprite);
    }

    this.bombs.position.set(296, 108);

    const tex = spritesheet.textures["metalpanel.jpg"];
    this.panel = new PIXI.Sprite(tex);

    this.text1 = new PIXI.Text("", {
      font: "arial",
      fontSize: 15,
      fill: 0xffffff
    });
    this.text2 = new PIXI.Text("", {
      font: "arial",
      fontSize: 15,
      fill: 0xffffff
    });


    this.container.addChild(this.panel);
    this.container.addChild(this.radar.container);
    this.container.addChild(this.infoBars);
    this.container.addChild(this.scoreBars);
    this.container.addChild(this.text1);
    this.container.addChild(this.text2);
    this.container.addChild(this.bombs);

    this.container.position.y = GameScreen.Height - tex.height;

    this.setEnabled(true);
  }

  public getPanelHeight(): number {
    return this.panel.height;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(active: boolean): void {
    this.enabled = active;
    this.container.visible = this.enabled;
  }

  public setTeam(side: Team): void {
    const str = teamPanel[side];
    const tex = this.spritesheet.textures[str];
    this.panel.texture = tex;
    this.radar.setTeam(side);
    this.team = side;
  }

  public updateFollowObject(data: any): void {
    this.infoBars.clear();
    this.infoBars.beginFill(0xffffff);
    // Draw our health
    if (data.health !== undefined) {
      this.infoBars.drawRect(290, 44, Math.round((75 * data.health) / 255), 12);
    }
    if (data.fuel !== undefined) {
      this.infoBars.drawRect(290, 65, Math.round((75 * data.fuel) / 255), 12);
    }
    if (data.ammo !== undefined) {
      this.infoBars.drawRect(290, 86, Math.round((75 * data.ammo) / 255), 12);
    }
    // highlight correct number of bombs
    const bombCount = data.bombs == undefined ? 0 : data.bombs;

    for (let i = 0; i < 5; i++) {
      const bomb = this.bombs.getChildAt(i) as PIXI.Sprite;
      if (bombCount > i) {
        bomb.texture = this.spritesheet.textures["carrybomb.gif"];
      } else {
        bomb.texture = this.spritesheet.textures["droppedbomb.gif"];
      }
    }
    this.infoBars.endFill();
  }

  public updateScore(teams: TeamInfo[]): void {
    let arrayOfTeamInfo = teams;
    let map = Object.keys(teams);
    this.scoreBars.clear();
    if (map.length < 2) return;
    for (const i of [0, 1]) {
      ///*
      if (this.team == arrayOfTeamInfo[map[i]].team) {
        this.scoreBars.beginFill(TeamColor.OwnForeground);
      }
      else {
        this.scoreBars.beginFill(TeamColor.OpponentForeground);
      }
      let j = arrayOfTeamInfo[map[i]].score;
      if (j < 0) {
        j = 0;
      }
      let k = arrayOfTeamInfo[map[(1 - i)]].score;
      if (k < 0) {
        k = 0;
      }
      let m = 0;
      if (j + k != 0) {
        m = 129 * j / (j + k);
      }
      if (i == 0) {
        this.scoreBars.drawRect(64, 29, m, 14);
        this.text1.x = 65;
        this.text1.y = 69 - 15;
        this.text1.text = ("" + arrayOfTeamInfo[i].score);
      }
      else {
        this.scoreBars.drawRect(64, 86, m, 14);
        this.text2.x = 65;
        this.text2.y = 126 - 15;
        this.text2.text = ("" + arrayOfTeamInfo[i].score);
      }
      this.scoreBars.endFill();
    }
  }

}
