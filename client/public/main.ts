import { loadSpriteSheet } from "../src/render/textures";
import { GameClient } from "../src/client";
import Cookies from "js-cookie";
import { Localizer } from "../src/localization/localizer";
import {
  planeData,
  PlaneType,
  planeConstants
} from "../../dogfight/src/objects/plane";

let client: GameClient;

function init(): void {
  // create game client engine
  client = new GameClient();
}

function createInput(title: string, plane: string, key: string): void {
  const desc = document.createElement("span") as HTMLSpanElement;
  desc.innerHTML = title;
  const input = document.createElement("input") as HTMLInputElement;
  input.type = "text";
  input.value = planeData[plane][key];
  input.onchange = (e): void => {
    const newValue = parseInt(e.target.value);
    planeData[plane][key] = newValue;
    console.log(planeData);
  };
  document.body.appendChild(desc);
  document.body.appendChild(input);
  document.body.appendChild(document.createElement("br"));
}

function inputConstants(title: string): void {
  const desc = document.createElement("span") as HTMLSpanElement;
  desc.innerHTML = title;
  const input = document.createElement("input") as HTMLInputElement;
  input.type = "text";
  input.value = planeConstants[title];
  input.onchange = (e): void => {
    const newValue = parseInt(e.target.value);
    planeConstants[title] = newValue;
    console.log(planeConstants);
  };
  document.body.appendChild(desc);
  document.body.appendChild(input);
  document.body.appendChild(document.createElement("br"));
}

function addControls(): void {
  console.log("ADDING CONTROLS");
  inputConstants("GRAVITY");
  inputConstants("THRUST");

  // add plane info adjustors
  const vals = ["speed", "turnRate", "flightTime"];
  for (const v of vals) {
    for (const plane in planeData) {
      const strPlane = PlaneType[plane];
      createInput(strPlane + " " + v, plane, v);
    }
  }
}

/**
 * Temporary function which adds a language selecton.
 * This will be updated with something prettier
 * in the future, when we use a framework
 * such as Vuejs or react.
 */
function addLanguageSelect(): void {
  const selector = document.createElement("select");
  selector.id = "language";
  const cookie = Cookies.get("language");
  for (const key in Localizer.dictionary) {
    const option = document.createElement("option");
    option.value = key;
    option.text = key;
    if (cookie === key) {
      option.selected = true;
    }
    selector.appendChild(option);
  }
  selector.onchange = (ev): void => {
    const target = ev.target as HTMLSelectElement;
    const newLanguage = target.value;
    client.updateLanguage(newLanguage);
  };
  document.body.appendChild(selector);
}

window.addEventListener("load", (): void => {
  loadSpriteSheet(init);
  addControls();
  addLanguageSelect();
});
