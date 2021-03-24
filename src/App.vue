<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-row class="ma-0 pa-0">
        <v-col class="d-flex justify-center" cols="6">
          <v-btn to="/" text>
            <span>Main</span>
          </v-btn>
        </v-col>
        <v-col class="d-flex justify-center" cols="6">
          <v-btn to="/about" text>
            <span>About</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App',

  components: {},

  data: () => ({
    //
  }),
});
</script>
