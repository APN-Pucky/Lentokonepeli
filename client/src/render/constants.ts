export const PANEL_HEIGHT = 150;

export const WAVE_PHASE_TIME = 200; // Milliseconds

export enum LAYER {
  LAYER07 = (14),
  LAYER08 = (13),
  LAYER09 = (12),
  LAYER10 = (11),
  LAYER11 = (10),
  LAYER12 = (9),
  LAYER13 = (8),
  LAYER14 = (7),
  LAYER15 = (6),
  LAYER16 = (5),
  LAYER17 = (4),
  LAYER11_LAYER13 = (55), // added to two layers... fore and background => flip in original code
  LAYER10_LAYER12 = (56), // added to two layers...
}

export enum DrawLayer {
  Hill = LAYER.LAYER16,
  Water = LAYER.LAYER11,
  Flag = LAYER.LAYER15,
  ControlTower = LAYER.LAYER15,
  Ground = LAYER.LAYER14,
  Coast = LAYER.LAYER10,
  RunwayBack = LAYER.LAYER13, // LAYER11_LAYER13
  LightSmoke = LAYER.LAYER11,
  Plane = LAYER.LAYER12,//LAYER.LAYER10_LAYER12,
  DarkSmoke = LAYER.LAYER11,
  Runway = LAYER.LAYER11, // LAYER11_LAYER13
  Trooper = LAYER.LAYER12,//LAYER.LAYER10_LAYER12,
  Explosion = LAYER.LAYER11,
  Bomb = LAYER.LAYER11,
  Bullet = LAYER.LAYER11,
  Player = LAYER.LAYER12,
  Clock = LAYER.LAYER07,
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
  SpectatorBackground = 0xffffff,
  UnchosenForeground = 0x000000,
  UnchosenBackground = 0xffffff,
}

export enum WaterColor {
  Normal = 0x2e90d0,
  Desert = 0x23c4cb
}
