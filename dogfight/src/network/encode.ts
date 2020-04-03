import { Packet, GameObjectSchema, IntByteSizes, IntType } from "./types";
import { schemaTypes } from "./schemas";

function getGameObjectSize(data: any, schema: GameObjectSchema): number {
  const typeBytes = 1;
  const idBytes = 3;
  let dataBytes = 0;

  const propCount =
    schema.numbers.length + schema.booleans.length + schema.strings.length;
  const propBytes = Math.ceil(propCount / 8);

  schema.numbers.forEach((number): void => {
    if (data[number.name] !== undefined) {
      dataBytes += IntByteSizes[number.intType];
    }
  });

  let setBools = 0;
  schema.booleans.forEach((bool): void => {
    if (data[bool] !== undefined) {
      setBools += 1;
    }
  });

  const boolBytes = Math.ceil(setBools / 8);
  dataBytes += boolBytes;

  return typeBytes + idBytes + propBytes + dataBytes;
}

function encodeNumber(
  view: DataView,
  offset: number,
  value: number,
  type: IntType
): number {
  switch (type) {
    case IntType.Uint8:
      view.setUint8(offset, value);
      break;
    case IntType.Int8:
      view.setInt8(offset, value);
      break;
    case IntType.Uint16:
      view.setUint16(offset, value);
      break;
    case IntType.Int16:
      view.setInt16(offset, value);
      break;
  }
  const val = IntByteSizes[type];
  return val;
}

function decodeNumber(view: DataView, offset: number, type: IntType): number {
  let value = 0;
  switch (type) {
    case IntType.Uint8:
      value = view.getUint8(offset);
      break;
    case IntType.Int8:
      value = view.getInt8(offset);
      break;
    case IntType.Uint16:
      value = view.getUint16(offset);
      break;
    case IntType.Int16:
      value = view.getInt16(offset);
      break;
  }
  return value;
}

function encodeGameObject(
  view: DataView,
  offset: number,
  data: any,
  schema: GameObjectSchema
): number {
  const propCount =
    schema.numbers.length + schema.booleans.length + schema.strings.length;
  const propBytes = Math.ceil(propCount / 8);
  let newOffset = offset + propBytes;
  let propertyByteOffset = offset;
  let currentProperty = 0;
  let propertyByte = 0;

  // Write each number
  schema.numbers.forEach((number): void => {
    if (data[number.name] !== undefined) {
      // this is set, so set it's property bit.
      propertyByte |= 1 << currentProperty % 8;
      // write property byte
      view.setUint8(propertyByteOffset, propertyByte);
      // write our actual value
      newOffset += encodeNumber(
        view,
        newOffset,
        data[number.name],
        number.intType
      );
    }
    // Increment which property we're on.
    currentProperty++;
    if (currentProperty % 8 == 0) {
      propertyByteOffset++;
      propertyByte = 0;
    }
  });

  let totalBools = 0;
  let booleanByte = 0;
  let currentBool = 0;
  let booleanOffset = newOffset;

  // Write each boolean
  schema.booleans.forEach((bool): void => {
    if (data[bool] !== undefined) {
      // this is set, so set it's property bit.
      propertyByte |= 1 << currentProperty % 8;
      // write property byte
      view.setUint8(propertyByteOffset, propertyByte);
      // encode our boolean value
      const value = data[bool] == true ? 1 : 0;
      booleanByte |= value << currentBool % 8;
      view.setUint8(booleanOffset, booleanByte);
      totalBools++;
    }
    // Increment which property we're on.
    currentProperty++;
    if (currentProperty % 8 == 0) {
      propertyByteOffset++;
      propertyByte = 0;
    }
    // increment bool
    currentBool++;
    if (currentBool % 8 == 0) {
      booleanOffset++;
      booleanByte = 0;
    }
  });
  newOffset += Math.ceil(totalBools / 8);

  return newOffset;
}

/*

  We want to turn a list of game object updates
  into a small binary array of bytes.


*/
export function encodeCache(packet: Packet): ArrayBuffer {
  const cache = packet.data;
  let size = 1; // packet type
  for (const id in cache) {
    const entry = cache[id];
    const type = entry.type;
    size += getGameObjectSize(entry, schemaTypes[type]);
  }
  // create arraybuffer with size of info.
  let offset = 0;
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  // write type
  view.setUint8(offset, packet.type);
  offset++;
  for (const id in cache) {
    const entry = cache[id];
    const type = entry.type;
    const idNum = parseInt(id);

    // encode type and ID before data.
    const header = ((type & 0xff) << 24) | (idNum & 0xffffff);
    view.setUint32(offset, header);
    offset += 4;
    offset = encodeGameObject(view, offset, entry, schemaTypes[type]);
  }
  return buffer;
}

function decodeCache(view: DataView, offset: number, packet: Packet): void {
  const maxOffset = view.byteLength;
  let currentOffset = offset;

  while (currentOffset < maxOffset) {
    const typeandid = view.getUint32(currentOffset);
    const type = (typeandid >> 24) & 0xff;
    const id = typeandid & 0xffffff;
    packet.data[id] = {
      type: type
    };
    currentOffset += 4;

    const schema: GameObjectSchema = schemaTypes[type];
    // destructure the binary according to the schema
    const propCount =
      schema.numbers.length + schema.booleans.length + schema.strings.length;
    const propBytes = Math.ceil(propCount / 8);

    let currentProperty = 0;
    let propertyByteOffset = currentOffset;
    let propertyByte = view.getUint8(propertyByteOffset);

    currentOffset += propBytes;

    schema.numbers.forEach((number): void => {
      // determine if this property is set.
      const index = currentProperty % 8;
      const isSet: boolean = ((propertyByte >> index) & 1) == 1;
      if (isSet) {
        // read the number, ya dingus
        const value = decodeNumber(view, currentOffset, number.intType);
        packet.data[id][number.name] = value;
        currentOffset += IntByteSizes[number.intType];
      }
      // go to next property
      currentProperty++;
      if (currentProperty % 8 == 0) {
        propertyByteOffset++;
        propertyByte = view.getUint8(propertyByteOffset);
      }
    });

    if (currentOffset >= maxOffset) {
      return;
    }

    let totalBools = 0;
    let booleanCounter = 0;
    let booleanOffset = currentOffset;
    let booleanByte = view.getUint8(booleanOffset);

    // now do booleans
    schema.booleans.forEach((bool): void => {
      const index = currentProperty % 8;
      const isSet: boolean = ((propertyByte >> index) & 1) == 1;
      if (isSet) {
        const boolIndex = booleanCounter % 8;
        const value = ((booleanByte >> boolIndex) & 1) == 1;
        packet.data[id][bool] = value;
        totalBools++;
      }
      currentProperty++;
      if (currentProperty % 8 == 0) {
        propertyByteOffset++;
        propertyByte = view.getUint8(propertyByteOffset);
      }
      booleanCounter++;
      if (booleanCounter % 8 == 0) {
        booleanOffset++;
        booleanByte = view.getUint8(booleanOffset);
      }
    });

    currentOffset += Math.ceil(totalBools / 8);
  }
}

export function decodePacket(buffer: ArrayBuffer): Packet {
  const view = new DataView(buffer);
  const type = view.getUint8(0);
  const packet: Packet = {
    type,
    data: {}
  };
  decodeCache(view, 1, packet);
  return packet;
}

export function encodePacket(packet: Packet): ArrayBuffer {
  const encoded = encodeCache(packet);
  return encoded;
}
