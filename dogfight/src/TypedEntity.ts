import { Cache, CacheEntry } from "./network/cache";

/**
 * Constants for each type of object in the game.
 *
 * These could be physical entities, or just containers
 * for game information.
 */
/**
 * Constants for each type of object in the game.
 *
 * These could be physical entities, or just containers
 * for game information.
 */
export enum EntityType {
  None,
  Ground,
  Water,
  Runway,
  Flag,
  ControlTower,
  Hill,
  Plane,
  Trooper,
  Player,
  Explosion,
  Bullet,
  Bomb,
}

type sendableData = number | string | boolean;

export function entityHash(obj: TypedEntity): string {
  return obj.type + "/" + obj.id;
}

/**
 * A generic game object class.
 *
 * Each game object has a type and unique ID.
 *
 * It also has a method to retrieve its current state.
 */
export abstract class TypedEntity {
  public abstract type: EntityType;
  public id: number;

  public constructor(id: number) {
    this.id = id;
  }

  public getType() {
    return this.type;
  }

  /**
   * Returns the current state of this object.
   */
  public abstract getState(): CacheEntry;

  /**
   * Sets a property of this object, and queues it
   * to be sent out over the network.
   * @param property The property to set
   * @param value The value to set
   */
  public set(cache: Cache, property: string, value: sendableData): void {
    // If there is no change in the value, don't do anything.
    // Otherwise, apply this change so it can be sent over the network.
    if (this[property] === value) {
      return;
    }

    // Check to see if this object exists in our cache right now.
    if (cache[this.type] === undefined) {
      cache[this.type] = {};
    }

    if (cache[this.type][this.id] == undefined) {
      cache[this.type][this.id] = { type: this.type };
    }

    // Update our variable in the object, and the cache.
    this[property] = value;

    cache[this.type][this.id][property] = value;
  }

  /**
   * Sets multiple properties of this object at once.
   * @param data An object with properties to set and their values
   */
  public setData(cache: Cache, data: any): void {
    for (const property in data) {
      this.set(cache, property, data[property]);
    }
  }
}
