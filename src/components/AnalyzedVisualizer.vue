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

    const getItems = (values: AnalyzedValues, i = 0) => {
      if (i > 1) {
        return;
      }

      const items = [];
      for (const value of this.analyzedValues.entries()) {
        const slots = {
          default: (scope) => {
            return (
              <p
                onClick={(e: Event) => {
                  e.stopPropagation();
                  scope.toggle();
                }}
                class="mb-0"
                style={{ cursor: 'pointer', background: scope.active ? 'red' : i == 1 ? 'orange' : 'cyan' }}
              >
                {value[1].toString()} {scope.active.toString()} {getItems(i + 1)}
              </p>
            );
          }
        };

        items.push(<v-item scopedSlots={slots}></v-item>);
      }

      return items;
    };

    return (
      <v-item-group v-model={this.selected} class="pa-3">
        {getItems()}
      </v-item-group>
    );
  }
});
</script>

<style lang="scss" scoped>
.v-item-group {
  position: relative;
  flex-basis: 100%;
}
</style>
