import express from 'express';
import http from 'http';
import path from 'path';
import WebSocket from 'ws';

import {TeamOption} from '../client/src/teamSelector';
// import { loadSpriteSheet, spriteSheet } from "./textures";
import {BufferedImage} from '../dogfight/src/BufferedImage';
import {Team} from '../dogfight/src/constants';
import {PlayerInfo} from '../dogfight/src/entities/PlayerInfo';
import {loadImages} from '../dogfight/src/images';
import {InputChange, InputKey} from '../dogfight/src/input';
import {MAP_CLASSIC} from '../dogfight/src/maps/classic';
import {MAP_CLASSIC_2} from '../dogfight/src/maps/classic2';
import {decodePacket, encodePacket} from '../dogfight/src/network/encode';
import {MainServer} from '../dogfight/src/network/server/main';
import {Packet, PacketType} from '../dogfight/src/network/types';
import {isNameValid} from '../dogfight/src/validation';
import {africa, bunkers, classic2, desert, jungle, katala, loadMap, loadStringMap, london, maps} from '../dogfight/src/world/map';
import {requestTakeoff} from '../dogfight/src/world/takeoff';
import {GameWorld,} from '../dogfight/src/world/world';


const sharp = require('sharp');

const PORT = process.env.PORT || 3259;

const app = express();
const filepath = path.join(__dirname, '../dist');
console.log(filepath);
app.use(express.static(filepath));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

loadImages().then((img) => {
  new MainServer(img, wss);

  server.listen(process.env.PORT || PORT, (): void => {
    console.log('Server started! on ' + PORT);
  });
});
