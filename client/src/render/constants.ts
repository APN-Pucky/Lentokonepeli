export const PANEL_HEIGHT = 150;

export const WAVE_PHASE_TIME = 200; // Milliseconds

export enum DrawLayer {
  Hill = 5,
  Water = 10,
  Flag = 6,
  ControlTower = 6,
  Ground = 7,
  Coast = 11,
  RunwayBack = 55,
  LightSmoke = 10,
  Plane = 56,
  DarkSmoke = 10,
  Runway = 55,
  Trooper = 56,
  Explosion = 10,
  Bomb = 10,
  Bullet = 10,
  Player = 0
}

export enum GameScreen {
  Width = 740,
  Height = 565
}

export enum TeamColor {
  OwnForeground = 0x0000ff, // blue
  OwnBackground = 0x8ecbff,
  OpponentForeground = 0xff0000, // red
  OpponentBackground = 0xffb574,
  SpectatorForeground = 0x000000,
  SpectatorBackground = 0xffffff
}

export enum WaterColor {
  Normal = 0x2e90d0,
  Desert = 0x23c4cb
}
