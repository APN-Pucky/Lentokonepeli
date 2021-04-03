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


const sharp = require('sharp');

const PORT = process.env.PORT || 3259;

const app = express();
const filepath = path.join(__dirname, "../dist");
console.log(filepath);
app.use(express.static(filepath));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

loadImages().then((img) => {

  function broadcast(p: Packet): void {
    wss.clients.forEach((client): void => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(encodePacket(p));
      }
    });
  }

  //for (let key in img)
  //console.log(key);
  // Initialize game world.
  const world = new GameWorld(img, broadcast);
  //loadMap(world, MAP_CLASSIC_2);
  loadStringMap(world,
    desert ,
    //maps[Math.floor(Math.random() * Math.floor(maps.length))]
  )


  // Game loop timing variables
  let startTime = Date.now();
  let lastTick = 0;


  // Game loop function
  function loop(): void {
    const currentTick = Date.now() - startTime;
    const deltaTime = currentTick - lastTick;
    //const deltaTime = 10;
    const updates = world.tick(deltaTime);
    world.clearCache();

    if (Object.keys(updates).length > 0) {
      const packet = { type: PacketType.ChangeSync, data: updates };
      broadcast(packet);
      /*
      // send updates to each client
      wss.clients.forEach((client): void => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(encodePacket(packet));
        }
      });
      */
    }
    lastTick = currentTick;
  }

  setInterval(loop, 1000 / 100);

  wss.on("connection", (ws): void => {
    console.log("New connection!");
    ws.binaryType = "arraybuffer";

    let player: PlayerInfo = undefined;

    ws.on("message", (message): void => {
      // parse into packet structure
      const packet = decodePacket(message as string | ArrayBuffer);

      if (packet.type == PacketType.Ping) {
        if (player == undefined) {
          return;
        }
        const time = parseInt(packet.data.time);
        let diff = Date.now() - time;
        if (diff < 0) {
          diff = 0;
        }
        if (diff > 65535) {
          diff = 65535;
        }
        if (time == NaN) {
          diff = 42069;
        }
        player.setPing(world.cache, diff);
      }

      // process user input
      if (packet.type == PacketType.UserGameInput) {
        if (player == undefined) {
          return;
        }
        const data: InputChange = packet.data;
        const key = data.key;
        const isPressed = data.isPressed === true;
        // if they sent a valid key, send it to server.
        if (key in InputKey) {
          // set in our player keys
          // if there is an actual difference, send it to the engine.
          player.inputState[key] = isPressed;
          world.queueInput(player.id, key, isPressed);
        }
      }
      if (packet.type == PacketType.PushText) {
        //TODO do security
        broadcast(packet);
      }
      // send world state to newly connected player.
      if (packet.type == PacketType.RequestFullSync) {
        // get current world state and send it to newly player
        const state = world.getState();
        const data: Packet = { type: PacketType.FullSync, data: state };
        ws.send(encodePacket(data));
        //ws.send(encodePacket({ type: PacketType.PushText, data: { text: 7 + "\t\t" + "ok 3 erä alkaaa. kun enterit on paineltu" } }))
        //ws.send(encodePacket({ type: PacketType.PushText, data: { text: 1 + "\tPucky\t" + "Hello there" } }))
        return;
      }

      if (packet.type == PacketType.RequestTakeoff) {
        requestTakeoff(world, player, packet.data);
      }

      if (packet.type == PacketType.ChangeName) {
        const newName = packet.data.name;
        if (isNameValid(newName) && player !== undefined) {
          player.setName(world.cache, newName);
        }
        return;
      }

      if (packet.type == PacketType.RequestJoinTeam) {
        // Ignore this if we've already assigned them a player.
        if (player !== undefined) {
          return;
        }
        // make sure our data is valid
        let selection = packet.data.team;
        // validate selection
        switch (selection) {
          case TeamOption.Centrals:
            selection = Team.Centrals;
            break;
          case TeamOption.Allies:
            selection = Team.Allies;
            break;
          default:
            selection = Math.random() < 0.5 ? Team.Centrals : Team.Allies;
            break;
        }
        player = world.addPlayer(selection);
        const name = packet.data.name;
        if (name !== undefined) {
          if (isNameValid(name)) {
            player.setName(world.cache, name);
          }
        }
        console.log("Created new Player: id", player.id, Team[player.team]);

        const response: Packet = {
          type: PacketType.AssignPlayer,
          data: { id: player.id, team: player.team, name: player.name }
        };
        ws.send(encodePacket(response));
        return;
      }
    });

    ws.on("close", (): void => {
      if (player !== undefined) {
        world.removePlayer(player);
        console.log("Client disconnected: Player", player.id);
      }
    });
  });

  server.listen(process.env.PORT || PORT, (): void => {
    console.log("Server started!");
  });

});
