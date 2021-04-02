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

    const getItems = (values: AnalyzedValues, i = 0) => {
      if (i > 1) {
        return;
      }

      const items = [];
      for (const value of values.entries()) {
        const innerItems = getItems(values, i + 1);

        const slots = {
          default: (scope) => {
            const back = this.getRandomColor(value[1].type + i);
            const bright = this.getColorBrightness(back);
            const fore = bright >= 128 ? '#000000' : '#ffffff';

            return (
              <p
                onClick={(e: Event) => {
                  e.stopPropagation();
                  scope.toggle();
                }}
                class="mb-0"
                style={{ opacity: '0', color: fore, background: back, 'margin-left': (i > 0 ? 1 : 0) + 'em' }}
              >
                <div class="overlay"></div>
                <span>
                  {this.chunks[value[0]]} {value[1].type}
                </span>
                {innerItems}
              </p>
            );
          }
        };

        items.push(<v-item scopedSlots={slots}></v-item>);
        items.push.apply(items, innerItems);
      }

      return items;
    };

    const items = getItems(this.analyzedValues);
    console.log(items);

    const anims = [];
    for (const value of this.analyzedValues) {
      anims.push(<span class="anim">{this.chunks[value[0]]}</span>);
    }

    const root = (
      <v-item-group v-model={this.selected} class="pa-3 analyzed">
        {anims}
        {items}
      </v-item-group>
    );

    setTimeout(() => {
      //const ps = document.querySelectorAll('.analyzed p');
      //const offTop = (ps[0] as HTMLElement).offsetTop;
      //const top = ps.length == 1 ? (ps[0] as HTMLElement).offsetTop : this.$anime.stagger([(ps[0] as HTMLElement).offsetTop, (ps[ps.length - 1] as HTMLElement).offsetTop]);

      this.$anime
        .timeline({
          delay: this.$anime.stagger(50, { start: 100 })
        })
        .add({
          targets: anims.map((x) => x.elm)
          /*top: function (el: HTMLElement, i: number) {
            return offTop + i * 24 + i * 8 - 4 * Number.parseInt(el.dataset['nestings'] ?? '0') + 'px';
          },
          left: function (el: HTMLElement) {
            return (analyzed.children[1] as HTMLElement).offsetLeft + 4 * Number.parseInt(el.dataset['nestings'] ?? '0') + 'px';
          },
          padding: '4px',
          marginLeft: function (el: HTMLElement) {
            return el.dataset['nestings'] + 'em';
          }*/
        })
        .add(
          {
            targets: anims.map((x) => x.elm),
            opacity: [1, 0]
          },
          350
        )
        .add(
          {
            targets: items.map((x) => x.elm),
            opacity: [0, 1]
          },
          350
        );
    }, 1);

    return root;
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
.v-item-group {
  position: relative;
  flex-basis: 100%;
}
</style>
