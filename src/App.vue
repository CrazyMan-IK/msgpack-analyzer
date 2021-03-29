<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-row class="ma-0 pa-0">
        <v-col class="d-flex justify-center" cols="4">
          <v-btn text to="/">
            <span>Main</span>
          </v-btn>
        </v-col>
        <v-col class="d-flex justify-center" cols="4">
          <v-btn text @click="$vuetify.theme.dark = !$vuetify.theme.dark">
            <span>Change theme</span>
          </v-btn>
        </v-col>
        <v-col class="d-flex justify-center" cols="4">
          <v-btn text to="/about">
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
  })
});
</script>

<style scoped lang="scss">
.v-main {
  max-height: 100vh;
}
</style>

<style lang="scss">
html {
  overflow-y: auto !important;
}

::-webkit-scrollbar {
  width: 14px;
}

::-webkit-scrollbar-track {
  border-radius: 100px;
  background-clip: padding-box;
  border: 3px solid transparent;
  background-color: #ececec;
}

::-webkit-scrollbar-thumb {
  width: 14px;
  border-radius: 100px;
  background-clip: padding-box;
  border: 3px solid transparent;
  background-color: #c6c6c6;
}

.theme--dark ::-webkit-scrollbar-track {
  background-color: #404040;
}

.theme--dark ::-webkit-scrollbar-thumb {
  background-color: #666666;
}
</style>
