import { IntType, GameObjectSchema } from "./types";
import { EntityType } from "../entity";
import { Ground, groundSchema } from "../entities/Ground";
import { Plane, planeSchema } from "../entities/Plane";
import { bombSchema } from "../entities/Bomb";
import { bulletSchema } from "../entities/Bullet";
import { explosionSchema } from "../entities/Explosion";
import { flagSchema } from "../entities/flag";
import { hillSchema } from "../entities/Hill";
import { trooperSchema } from "../entities/Man";
import { playerSchema } from "../entities/PlayerInfo";
import { runwaySchema } from "../entities/Runway";
import { towerSchema } from "../entities/tower";
import { waterSchema } from "../entities/Water";
import { coastSchema } from "../entities/Coast";

export const schemaTypes = {
  [EntityType.Plane]: planeSchema,
  [EntityType.Ground]: groundSchema,
  [EntityType.Hill]: hillSchema,
  [EntityType.Flag]: flagSchema,
  [EntityType.Runway]: runwaySchema,
  [EntityType.ControlTower]: towerSchema,
  [EntityType.Trooper]: trooperSchema,
  [EntityType.Player]: playerSchema,
  [EntityType.Water]: waterSchema,
  [EntityType.Explosion]: explosionSchema,
  [EntityType.Bullet]: bulletSchema,
  [EntityType.Bomb]: bombSchema,
  [EntityType.Coast]: coastSchema,
};
