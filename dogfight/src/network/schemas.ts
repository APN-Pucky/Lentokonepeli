import { IntType, GameObjectSchema } from "./types";
import { EntityType } from "../entity";
import { Ground, groundSchema } from "../entities/Ground";
import { Plane, planeSchema } from "../entities/Plane";
import { bombSchema } from "../entities/Bomb";
import { bulletSchema } from "../entities/Bullet";
import { explosionSchema } from "../entities/Explosion";
import { flagSchema } from "../entities/Flag";
import { hillSchema } from "../entities/Hill";
import { trooperSchema } from "../entities/Man";
import { playerSchema } from "../entities/PlayerInfo";
import { runwaySchema } from "../entities/Runway";
import { backgroundItemSchema } from "../entities/BackgroundItem";
import { waterSchema } from "../entities/Water";
import { coastSchema } from "../entities/Coast";
import { importantBuildingSchema } from "../entities/ImportantBuilding";
import { teaminfoSchema } from "../entities/TeamInfo";
import { clockSchema } from "../entities/Clock";

/*
export const schemaTypes = {
  [EntityType.Plane]: planeSchema,
  [EntityType.Ground]: groundSchema,
  [EntityType.Hill]: hillSchema,
  [EntityType.Flag]: flagSchema,
  [EntityType.Runway]: runwaySchema,
  [EntityType.ImportantBuilding]: importantBuildingSchema,
  [EntityType.BackgroundItem]: backgroundItemSchema,
  [EntityType.Trooper]: trooperSchema,
  [EntityType.Player]: playerSchema,
  [EntityType.Water]: waterSchema,
  [EntityType.Explosion]: explosionSchema,
  [EntityType.Bullet]: bulletSchema,
  [EntityType.Bomb]: bombSchema,
  [EntityType.Coast]: coastSchema,
  [EntityType.TeamInfo]: teaminfoSchema,
  [EntityType.Clock]: clockSchema,
};
*/