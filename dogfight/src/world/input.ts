import { GameWorld } from "./world";
import { GameObjectType } from "../object";
import { Player } from "../objects/player";
import { Plane } from "../objects/plane";
import { KeyChangeList, InputKey } from "../input";
import { destroyPlane } from "./plane";
import { Trooper, trooperGlobals, TrooperState } from "../objects/trooper";
import { SCALE_FACTOR } from "../constants";
import { destroyTrooper } from "./trooper";

export function planeInput(
  world: GameWorld,
  player: Player,
  plane: Plane,
  changes: KeyChangeList
): void {
  for (const keyType in changes) {
    const key: InputKey = parseInt(keyType);
    const isPressed = changes[keyType];
    switch (key) {
      case InputKey.Left:
      case InputKey.Right: {
        break;
      }
      case InputKey.Up: {
        if (isPressed) {
          plane.setFlipped(world.cache, !plane.flipped);
        }
        break;
      }
      case InputKey.Down: {
        if (isPressed) {
          plane.setEngine(world.cache, !plane.engineOn);
        }
        break;
      }
      case InputKey.Jump: {
        if (isPressed) {
          // destroyPlane(world, plane, true);
          const trooper = new Trooper(
            world.nextID(GameObjectType.Trooper),
            world.cache
          );
          trooper.setPos(world.cache, plane.x, plane.y);
          trooper.set(world.cache, "team", player.team);
          trooper.setVelocity(
            world.cache,
            plane.v.x,
            plane.v.y + 200 * SCALE_FACTOR
          );
          world.addObject(trooper);
          player.setControl(world.cache, GameObjectType.Trooper, trooper.id);
          plane.abandonPlane(world.cache);
          return;
        }
        break;
      }
      case InputKey.Fire: {
        plane.isShooting = isPressed;
        break;
      }
      case InputKey.Bomb: {
        plane.isBombing = isPressed;
        break;
      }
    }
  }
  if (player.inputState[InputKey.Left] && !player.inputState[InputKey.Right])
    plane.setRotation(world.cache, InputKey.Left, true);
  if (!player.inputState[InputKey.Left] && player.inputState[InputKey.Right])
    plane.setRotation(world.cache, InputKey.Right, true);
  if (player.inputState[InputKey.Left] == player.inputState[InputKey.Right])
    plane.setRotation(world.cache, InputKey.Right, false);
}

export function trooperInput(
  world: GameWorld,
  player: Player,
  trooper: Trooper,
  changes: KeyChangeList
): void {
  for (const keyType in changes) {
    const key: InputKey = parseInt(keyType);
    const isPressed = changes[keyType];
    switch (key) {
      case InputKey.Left:
      case InputKey.Right: {
        break;
      }
      case InputKey.Jump: {
        if (isPressed) {
          if (trooper.state == TrooperState.Falling) {
            trooper.setState(world.cache, TrooperState.Parachuting);
          } else {
            destroyTrooper(world, trooper, true);
          }
          break;
        }
      }
    }
    if (player.inputState[InputKey.Left] && !player.inputState[InputKey.Right])
      trooper.setDirection(world.cache, InputKey.Left, true);
    if (!player.inputState[InputKey.Left] && player.inputState[InputKey.Right])
      trooper.setDirection(world.cache, InputKey.Right, true);
    if (player.inputState[InputKey.Left] == player.inputState[InputKey.Right])
      trooper.setDirection(world.cache, InputKey.Right, false);
  }
}

export function processInputs(world: GameWorld): void {
  // process input...
  for (const playerID in world.inputQueue) {
    const id = parseInt(playerID);
    const player = world.getObject(GameObjectType.Player, id) as Player;
    if (player === undefined) {
      return;
    }
    const cID = player.controlID;
    const cType = player.controlType;
    const controlling = world.getObject(cType, cID);
    if (controlling !== undefined) {
      switch (cType) {
        case GameObjectType.Plane: {
          planeInput(world, player, controlling as Plane, world.inputQueue[id]);
          break;
        }
        case GameObjectType.Trooper: {
          trooperInput(
            world,
            player,
            controlling as Trooper,
            world.inputQueue[id]
          );
          break;
        }
      }
    }
  }
  // reset queue
  world.inputQueue = {};
}
