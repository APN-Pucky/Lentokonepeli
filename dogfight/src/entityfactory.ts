import { PlayerInfos } from "../../client/src/render/entities/playerInfos";
import { BackgroundItem } from "./entities/BackgroundItem";
import { Bomb } from "./entities/Bomb";
import { Bullet } from "./entities/Bullet";
import { Clock } from "./entities/Clock";
import { Coast } from "./entities/Coast";
import { Explosion } from "./entities/Explosion";
import { Flag } from "./entities/Flag";
import { Ground } from "./entities/Ground";
import { Hill } from "./entities/Hill";
import { ImportantBuilding } from "./entities/ImportantBuilding";
import { Man } from "./entities/Man";
import { Plane } from "./entities/Plane";
import { PlayerInfo } from "./entities/PlayerInfo";
import { Respawner } from "./entities/Respawner";
import { Runway } from "./entities/Runway";
import { TeamInfo } from "./entities/TeamInfo";
import { Water } from "./entities/Water";
import { None } from "./entities/None";
import { EntityType } from "./entity";
import { GameObjectSchema } from "./network/types";

export const EntityClass: EntityStatic[] = [
  None,
  Ground,
  Water,
  Runway,
  Flag,
  BackgroundItem,
  Hill,
  Plane,
  Man,
  PlayerInfo,
  Explosion,
  Bullet,
  Bomb,
  Coast,
  ImportantBuilding,
  TeamInfo,
  Respawner,
  Clock,
];


interface Named { name: string }
export interface EntityStatic extends Named {
  type: number;
  schema: GameObjectSchema
};

export function getEntityClass(e: EntityType | string): EntityStatic {
  if (e == EntityType.None) {
    return
  }
  for (let es of EntityClass) {
    if (es.type == e || es.name == e) return es;
  }
  return null;
};

export function getGameObjectSchema(e: EntityType | string): GameObjectSchema {
  return getEntityClass(e).schema;
};