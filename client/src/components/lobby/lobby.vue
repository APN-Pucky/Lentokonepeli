<template>
  <div v-show="showLobby" id="lobby">
    <table>
      <thead>
        <tr>
          <th>{{ lang.id }}</th>
          <th>{{ lang.name }}</th>
          <th>{{ lang.map }}</th>
          <th>{{ lang.players }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in rooms"
          v-bind:key="r.id"
          :class="[teamClass(myTeam, r.team), myID == r.id ? 'my-player' : '']"
          @click="[handleclick(r)]"
        >
          <!--<td>{{ side(player.team) }}</td>-->
          <td>
            {{ r.id }}
          </td>
          <td>{{ r.name }}</td>
          <td>{{ r.map.name }}</td>
          <td>{{ r.current_players }}/{{ r.max_players }}</td>
        </tr>
      </tbody>
    </table>
    <div v-show="false">{{ updated }}</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { EntityType } from "../../../../dogfight/src/entity";
import { Team } from "../../../../dogfight/src/constants";
import {
  PlayerStatus,
  PlayerInfo,
} from "../../../../dogfight/src/entities/PlayerInfo";
import { Localizer } from "../../localization/localizer";
import { RoomInfo } from "../../../../dogfight/src/network/server/room";
const flags = {
  [Team.Centrals]: "germanflag_small.gif",
  [Team.Allies]: "raf_flag_small.gif",
};

const pingMax = 500;

function clamp(number, min, max): number {
  return Math.round(Math.max(min, Math.min(number, max)));
}

export default Vue.extend({
  data() {
    return {
      rooms: [{ id: 0, name: "X", map: "EK" }],
      players: [],
    };
  },
  computed: {
    lang() {
      return {
        name: Localizer.get("name"),
        id: Localizer.get("id"),
        map: Localizer.get("map"),
        players: Localizer.get("players"),
      };
    },
    showLobby() {
      return this.$store.state.clientState.showLobby;
    },
    updated() {
      return this.$store.state.client.roomsUpdated;
    },
    myTeam() {
      return this.$store.state.client.playerInfo.team;
    },
    myID() {
      return this.$store.state.client.playerInfo.id;
    },
  },
  methods: {
    getPingColor(ping: number): string {
      const hueMax = 120;
      const percentage = ping / pingMax;
      const hue = clamp(hueMax - percentage * hueMax, 0, hueMax);
      // console.log(`hsl(${hue}, 100%, 50%)`, ping);
      return `hsl(${hue}, 100%, 50%)`;
    },
    getFlag(team: number) {
      return "assets/images/" + flags[team];
    },
    isAlive(status: PlayerStatus) {
      return status == PlayerStatus.Playing ? true : false;
    },
    teamClass(me: Team, them: Team): string {
      if (me == undefined) {
        return "";
      }
      if (them == me) {
        return "my-team";
      }
      return "enemy-team";
    },
    handleclick(r: RoomInfo): void {
      console.log("clicked " + r.id);
      this.$store.state.client.joinRoom(r.id);
    },
  },
  watch: {
    updated() {
      this.rooms = this.$store.state.client.rooms;
    },
  },
});
</script>

<style>
#lobby {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(85, 85, 85, 0.8);
}

/*
@keyframes slide {
  0% {
    height: 0px;
  }
  100% {
    height: 100%;
  }
}*/

.my-team {
  background-color: #8ecbff;
  color: #0000ff;
  border: 1px solid #0000ff;
}

.my-player {
  font-weight: bold;
}

.enemy-team {
  background-color: #ffb574;
  border: 1px solid #ff0000;
  color: #ff0000;
}

.player-alive {
}

.player-dead {
  text-decoration: line-through;
  /*font-style: italic;*/
}

#players table {
  width: 100%;
  background-color: white;
  border-collapse: collapse;
}

#players table thead {
  color: white;
  background-color: black;
}

#players table td {
  text-align: center;
}
</style>
