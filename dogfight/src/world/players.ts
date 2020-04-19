import { GameWorld } from "./world";
export function processPlayersBefore(world: GameWorld, deltaTime: number): void {
  world.players.forEach((player): void => {
    player.tick(world.cache, deltaTime, world);

  });
}

export function processPlayersAfter(world: GameWorld, deltaTime: number): void {
  world.players.forEach((player): void => {
    player.reward(world.cache, deltaTime, world);

  });
}