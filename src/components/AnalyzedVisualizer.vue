<script lang="tsx">
import Vue, { CreateElement, VNode } from 'vue';
import { AnalyzedValues } from '@/analyzer/analyzer';
import { VItemGroup, VItem, VRow, VCol } from 'vuetify/lib';

export default Vue.extend({
  name: 'analyzed-visualizer',

  components: {
    VItemGroup,
    VItem,
    VRow,
    VCol
  },

  data: () => ({
    selected: -1
  }),

  props: {
    analyzedValues: AnalyzedValues
  },

  render: function (h: CreateElement): VNode {
    /*
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
		*/

    const items = [];
    for (const value of this.analyzedValues) {
      const slots = {
        default: (scope) => {
          return (
            <div onClick={scope.toggle} class="mb-8" style={{ cursor: 'pointer', height: '2em', background: scope.active ? 'red' : 'cyan' }}>
              {value[1].toString()} {scope.active.toString()}
            </div>
          );
        }
      };

      items.push(<v-item scopedSlots={slots}></v-item>);
    }

    console.log(items);

    return (
      <v-item-group v-model={this.selected} class="pa-3">
        {items}
      </v-item-group>
    );
  }
});
</script>
