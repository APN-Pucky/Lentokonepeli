<template>
  <div>
    <h4>Create Room</h4>
    <p>
      <label>Name</label>
      <input type="text" v-model="params.name" />
      <br />
      <label>Map</label>
      <select v-model="params.map.name" @change="setMap(params.map.name)">
        <option v-for="m in maps" :value="m" :key="m">
          {{ m }}
        </option>
      </select>
      <br />
      <label>Map Layout</label>
      <textarea
        type="text"
        v-model="params.map.layout"
        rows="5"
        cols="100"
      ></textarea>
      <br />
      <label>Max Players</label>
      <input type="text" v-model.number="params.max_players" />
      <br />
      <button @click="[handleClick()]">Create</button>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { maps } from "../../../../dogfight/src/world/map";
import bullet from "../debug/bullet.vue";
export default Vue.extend({
  components: { bullet },
  computed: {
    params() {
      return this.$store.state.client.roomparams;
    },
    maps() {
      return Object.keys(maps);
    },
  },
  methods: {
    setMap(m) {
      this.$store.state.client.roomparams.map.layout = maps[m];
      return m;
    },
    handleClick() {
      this.$store.state.client.createRoom();
    },
  },
});
</script>

<style>
</style>