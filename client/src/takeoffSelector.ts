import { InputKey, Team, FacingDirection } from "../../dogfight/src/constants";
import { GameRenderer } from "./render/renderer";
import { Packet, PacketType } from "../../dogfight/src/network/types";
import { pack } from "../../dogfight/src/network/packer";
import { PlaneType } from "../../dogfight/src/objects/plane";

const centralPlanes: PlaneType[] = [
  PlaneType.Albatros,
  PlaneType.Fokker,
  PlaneType.Junkers
];

const alliedPlanes: PlaneType[] = [
  PlaneType.Bristol,
  PlaneType.Sopwith,
  PlaneType.Salmson
];

const cameraOffset = {
  [FacingDirection.Left]: {
    x: 70,
    y: 170
  },
  [FacingDirection.Right]: {
    x: -95,
    y: 170
  }
};

interface RunwayInfo {
  id: string;
  team: Team;
  x: number;
  y: number;
  direction: number;
  health: number;
}

export class TakeoffSelector {
  private planeSelection: PlaneType;
  private team: Team;
  private index: number = 0;
  private runways: RunwayInfo[];
  private selectedRunway: string;

  public constructor() {
    this.planeSelection = PlaneType.Albatros;
    this.team = Team.Centrals;
    this.index = 0;
    this.runways = [];
  }

  public updateRunways(runways: any, renderer: GameRenderer): void {
    this.runways = [];
    for (const id in runways) {
      const data = runways[id];
      if (data.team == this.team && data.health > 0) {
        this.runways.push({ id, ...data });
      }
    }

    if (this.runways.length == 0) {
      return;
    }

    // sort by furthest away
    this.runways.sort((a, b): number => {
      return Math.abs(b.x) - Math.abs(a.x);
    });

    // set default runway if not set.
    if (this.selectedRunway == undefined) {
      this.setRunway(this.runways[0].id, renderer);
    }
  }

  private setRunway(id: string, renderer: GameRenderer): void {
    this.selectedRunway = id;
    this.focusOnRunway(this.selectedRunway, renderer);
  }

  private changeRunway(offset: number, renderer: GameRenderer): void {
    // get index of current runway
    const index = this.runways.findIndex(
      (r): boolean => r.id == this.selectedRunway
    );
    // console.log("index:", index);
    let newIndex = index + offset;
    if (newIndex < 0) {
      newIndex = this.runways.length - 1;
    } else if (newIndex > this.runways.length - 1) {
      newIndex = 0;
    }
    this.setRunway(this.runways[newIndex].id, renderer);
  }

  private focusOnRunway(id: string, renderer: GameRenderer): void {
    const runway = this.runways.find((r): boolean => r.id == id);
    const offset = cameraOffset[runway.direction];
    const x = runway.x + offset.x;
    const y = runway.y + offset.y;
    renderer.centerCamera(x, y);
  }

  public setTeam(team: Team): void {
    this.team = team;
    this.setPlane(this.index);
  }

  private setPlane(index: number): void {
    if (this.team == Team.Centrals) {
      this.planeSelection = centralPlanes[index];
    } else {
      this.planeSelection = alliedPlanes[index];
    }
  }

  public getPlaneSelection(): PlaneType {
    return this.planeSelection;
  }

  public processInput(
    key: InputKey,
    renderer: GameRenderer,
    websocket: WebSocket
  ): void {
    if (key === InputKey.Enter) {
      console.log("Sending takeoff request..");
      const packet: Packet = {
        type: PacketType.RequestTakeoff,
        data: {
          plane: this.planeSelection,
          runway: parseInt(this.selectedRunway)
        }
      };
      websocket.send(pack(packet));
      return;
    }
    if (key == InputKey.Up) {
      this.changeSelection(-1, renderer);
      return;
    }
    if (key == InputKey.Down) {
      this.changeSelection(1, renderer);
    }
    if (key == InputKey.Left) {
      this.changeRunway(-1, renderer);
    }
    if (key == InputKey.Right) {
      this.changeRunway(1, renderer);
    }
  }

  private changeSelection(offset: number, renderer: GameRenderer): void {
    let newIndex = this.index + offset;
    if (newIndex < 0) {
      newIndex = 2;
    } else if (newIndex > 2) {
      newIndex = 0;
    }
    this.index = newIndex;
    this.setPlane(newIndex);
    renderer.takeoffSelectUI.setPlane(this.planeSelection);
  }
}
