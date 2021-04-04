import path from "path";
import express from "express";
import http from "http";
import WebSocket from "ws";
import { PacketType, Packet } from "../dogfight/src/network/types";
import { PlayerInfo } from "../dogfight/src/entities/PlayerInfo";
import { TeamOption } from "../client/src/teamSelector";
import { Team } from "../dogfight/src/constants";
import { decodePacket, encodePacket } from "../dogfight/src/network/encode";
import { InputChange, InputKey } from "../dogfight/src/input";
import { GameWorld, } from "../dogfight/src/world/world";
import { requestTakeoff } from "../dogfight/src/world/takeoff";
import { africa, bunkers, classic2, desert, jungle, katala, loadMap, loadStringMap, london, maps } from "../dogfight/src/world/map";
import { MAP_CLASSIC_2 } from "../dogfight/src/maps/classic2";
import { MAP_CLASSIC } from "../dogfight/src/maps/classic";
import { isNameValid } from "../dogfight/src/validation";
//import { loadSpriteSheet, spriteSheet } from "./textures";
import { BufferedImage } from "../dogfight/src/BufferedImage";
import { loadImages } from "../dogfight/src/images";
import { MainServer } from "../dogfight/src/network/server/main";


const sharp = require('sharp');

const PORT = process.env.PORT || 3259;

const app = express();
const filepath = path.join(__dirname, "../dist");
console.log(filepath);
app.use(express.static(filepath));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

loadImages().then((img) => {

  new MainServer(img,wss);

  server.listen(process.env.PORT || PORT, (): void => {
    console.log("Server started!");
  });

});
