<script lang="tsx">
import Vue, { CreateElement, VNode } from 'vue';
import { AnalyzedValues } from '@/analyzer/analyzer';
import { VItemGroup, VItem, VRow, VCol } from 'vuetify/lib';
import seedrandom from 'seedrandom';

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
    output: Element,
    chunks: Array,
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

    let ind = 0;
    const anims = [];
    const getItems = (values: AnalyzedValues, i = 0, parentValues = values) => {
      if (!(values instanceof Map)) {
        return undefined;
      }

      let localInd = 0;
      const items = [];
      for (const value of values.entries()) {
        anims.push(
          <span
            data-nestings={i}
            style={{
              top: (this.output.children[ind * 2] as HTMLElement).offsetTop - (this.output.offsetHeight + 32) + 'px' ?? '0',
              left: (this.output.children[ind * 2] as HTMLElement).offsetLeft + 'px' ?? '0'
            }}
            class="anim"
          >
            {this.chunks[value[0]]}
          </span>
        );

        const currentInd = ind++;
        const currentLocalInd = localInd;
        const innerItems = getItems(value[1].value, i + 1, values);

        const slots = {
          default: (scope) => {
            const back = scope.active ? 'black' : this.getRandomColor(value[1].type + i);
            const bright = this.getColorBrightness(back);
            const fore = bright >= 128 ? '#000000' : '#ffffff';

            return (
              <p
                onClick={(e: Event) => {
                  e.stopPropagation();
                  scope.toggle();
                }}
                data-index={currentInd}
                class="mb-0"
                style={{
                  borderTopLeftRadius: currentLocalInd > 0 ? 0 : undefined,
                  borderTopRightRadius: currentLocalInd > 0 ? 0 : undefined,
                  borderBottomLeftRadius: currentLocalInd != values.size - 1 && parentValues.size > 1 ? 0 : undefined,
                  borderBottomRightRadius: currentLocalInd != values.size - 1 && parentValues.size > 1 ? 0 : undefined,
                  opacity: '1',
                  color: fore,
                  background: back,
                  'margin-left': (i > 0 ? 1 : 0) + 'em'
                }}
              >
                <div class="overlay"></div>
                <span>
                  {this.chunks[value[0]]} {value[1].type} {currentInd}
                </span>
                {innerItems}
              </p>
            );
          }
        };

        items.push(
          <v-item
            onChange={(e: Event) => {
              this.selected = currentInd;
              this.$emit('input', currentInd);
            }}
            scopedSlots={slots}
            value={currentInd}
          ></v-item>
        );
        localInd++;
      }

      return items;
    };

    const items = getItems(this.analyzedValues);
    this.$refs['anim'] = anims;
    this.$refs['container'] = items;

    return (
      <v-item-group mandatory value={this.selected} class="pa-3 analyzed">
        {anims}
        {items}
      </v-item-group>
    );
  },

  methods: {
    getRandomColor(seed: string): string {
      const rnd = seedrandom(seed);
      const letters = '0123456789ABCDEF';

      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(rnd() * 16)];
      }

      return color;
    },

    getColorBrightness(color: string): number {
      const isHEX = color.indexOf('#') == 0;
      const isRGB = color.indexOf('rgb') == 0;
      let r = 0;
      let g = 0;
      let b = 0;

      if (isHEX) {
        const hasFullSpec = color.length == 7;
        let m = color.substr(1).match(hasFullSpec ? /(\S{2})/g : /(\S{1})/g);
        if (m) {
          r = parseInt(m[0] + (hasFullSpec ? '' : m[0]), 16);
          g = parseInt(m[1] + (hasFullSpec ? '' : m[1]), 16);
          b = parseInt(m[2] + (hasFullSpec ? '' : m[2]), 16);
        }
      }
      if (isRGB) {
        let m = color.match(/(\d+){3}/g);
        if (m) {
          r = parseInt(m[0]);
          g = parseInt(m[1]);
          b = parseInt(m[2]);
        }
      }

      return (r * 299 + g * 587 + b * 114) / 1000;
    }
  }
});
</script>

<style lang="scss" scoped>
.analyzed {
  position: relative;
  flex-basis: 100%;
}
</style>
