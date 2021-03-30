<template>
  <v-item-group v-model="selected" class="pa-3">
    <v-item :key="i[0]" v-slot="{ toggle, active }" v-for="i in analyzedValues">
      <v-row class="ma-0 align-items-stretch fill-width">
        <v-col @click="toggle" style="cursor: pointer; background: cyan; height: 100%" v-bind:style="{ background: active ? 'red' : 'cyan' }">
          {{ i }}
        </v-col>
        <!-- <v-col v-if="active" style="background: red"></v-col> -->
      </v-row>
    </v-item>
  </v-item-group>
</template>

<script lang="ts">
import Vue from 'vue';
import { AnalyzedValues } from '@/analyzer/analyzer';

export default Vue.extend({
  name: 'analyzed-visualizer',

  data: () => ({
    selected: -1
  }),

  props: {
    analyzedValues: AnalyzedValues
  }
});
</script>
