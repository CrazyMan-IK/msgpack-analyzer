<template>
  <v-container fluid class="home fill-height">
    <v-row class="ma-0 fill-height">
      <v-col cols="2">
        <h1>This is an main page</h1>
      </v-col>
      <v-col class="d-flex main-content layout column" cols="8">
        <h1>This is an main page</h1>
        <v-text-field filled v-model="input" :rules="[rules.notEmpty, rules.hexChecker, rules.isEven]" @input="analyze"> </v-text-field>
        <p ref="output" class="ma-0 mb-8 pa-3 output"></p>
        <div ref="analyzed" class="pa-3 analyzed">
          <!--<p class="anim anim-1">12</p>
          <p>12</p>
          <p class="anim anim-2">23</p>
          <p>23</p>
          <p class="anim anim-3">34</p>
          <p>34</p>
          <p class="anim anim-4">45</p>
          <p>45</p>
          <p class="anim anim-5">56</p>
          <p>56</p>
          <p class="anim anim-6">67</p>
          <p>67</p>-->
        </div>
      </v-col>
      <v-col cols="2">
        <h1>This is an main page</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Analyzer from '@/analyzer/analyzer';
import seedrandom from 'seedrandom';

export default Vue.extend({
  name: 'Home',

  components: {},

  data: () => ({
    input: '9292c37b7b c4024455',
    analyzer: new Analyzer(),
    rules: {
      hexChecker: (value: string): string | boolean => {
        value = value.replaceAll(' ', '');
        const pattern = /^((?:[0-9a-fA-F]* ?)+)$/gm;
        return pattern.test(value) || 'Not a valid hexadecimal string';
      },
      isEven: (value: string): string | boolean => {
        value = value.replaceAll(' ', '');
        return value.length % 2 == 0 || 'String length is not even';
      },
      notEmpty: (value: string): string | boolean => {
        value = value.replaceAll(' ', '');
        return value.length > 0 || 'String is empty';
      }
    }
  }),

  methods: {
    splitByChunks(str: string, chunkSize = 1): string[] {
      const res: string[] = [];

      for (let i = 0; i < str.length; i += chunkSize) {
        res.push(str.substr(i, chunkSize));
      }

      return res;
    },

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
    },

    analyze(): void {
      if (this.rules.notEmpty(this.input) === true && this.rules.hexChecker(this.input) === true && this.rules.isEven(this.input) === true) {
        const chunks = this.splitByChunks(this.input.replaceAll(' ', ''), 2);
        const data = Uint8Array.from(
          chunks.map((x: string) => {
            return Number.parseInt(x, 16);
          })
        );

        const analyzedData = this.analyzer.analyze(data);

        this.$anime.remove('.analyzed > span');

        const output = this.$refs['output'] as Element;
        output.textContent = '';

        chunks.forEach((chunk: string) => {
          const span = document.createElement('span');
          const space = document.createElement('span');

          span.textContent = chunk;
          space.innerHTML = '&nbsp;';

          output.appendChild(span);
          output.appendChild(space);
        });

        output.lastChild?.remove();

        const analyzed = this.$refs['analyzed'] as Element;
        analyzed.textContent = '';

        let parent = analyzed;
        let oldP = analyzed;
        let oldNestings = 0;
        chunks.forEach((chunk: string, i: number) => {
          const data = analyzedData.getWithNestings(i);

          if (data !== undefined && 'type' in data.value) {
            const anim = document.createElement('span');
            const p = document.createElement('p');
            const overlay = document.createElement('div');
            const inside = document.createElement('span');

            anim.className = 'anim';
            overlay.className = 'overlay';

            const back = this.getRandomColor(data.value.type + data.nestings);
            const bright = this.getColorBrightness(back);
            const fore = bright >= 128 ? '#000000' : '#ffffff';

            anim.style.top = (output.children[i * 2] as HTMLElement).offsetTop - 80 + 'px' ?? '0';
            anim.style.left = (output.children[i * 2] as HTMLElement).offsetLeft + 'px' ?? '0';
            p.style.marginLeft = (data.nestings > 0 ? 1 : 0) + 'em';
            p.style.background = back;
            p.style.color = fore;

            anim.dataset['nestings'] = data.nestings.toString();

            anim.textContent = chunk;
            //p.textContent = `${chunk} ${data.value.type}`;
            inside.textContent = `${chunk} ${data.value.type}`;

            if (oldNestings < data.nestings) {
              parent = oldP;
            }
            while (oldNestings > data.nestings) {
              oldP = oldP.parentElement as Element;

              parent = oldP.parentElement;

              oldNestings--;
            }

            if (oldP instanceof HTMLParagraphElement && oldNestings == data.nestings) {
              oldP.style.borderBottomRightRadius = '0px';
              oldP.style.borderBottomLeftRadius = '0px';

              p.style.borderTopLeftRadius = '0px';
              p.style.borderTopRightRadius = '0px';
            }

            analyzed.appendChild(anim);
            p.appendChild(overlay);
            p.appendChild(inside);
            parent.appendChild(p);

            oldP = p;
            oldNestings = data.nestings;
          }
        });

        const ps = document.querySelectorAll('.analyzed p');
        const offTop = (ps[0] as HTMLElement).offsetTop;
        //const top = ps.length == 1 ? (ps[0] as HTMLElement).offsetTop : this.$anime.stagger([(ps[0] as HTMLElement).offsetTop, (ps[ps.length - 1] as HTMLElement).offsetTop]);

        this.$anime
          .timeline({
            delay: this.$anime.stagger(50, { start: 100 })
          })
          .add({
            targets: '.analyzed .anim',
            top: function (el: HTMLElement, i: number) {
              return offTop + i * 24 + i * 8 - 4 * Number.parseInt(el.dataset['nestings'] ?? '0') + 'px';
            },
            left: function (el: HTMLElement) {
              return (analyzed.children[1] as HTMLElement).offsetLeft + 4 * Number.parseInt(el.dataset['nestings'] ?? '0') + 'px';
            },
            padding: '4px',
            marginLeft: function (el: HTMLElement) {
              return el.dataset['nestings'] + 'em';
            }
          })
          .add(
            {
              targets: '.analyzed .anim',
              opacity: [1, 0]
            },
            350
          )
          .add(
            {
              targets: '.analyzed p',
              opacity: [0, 1]
            },
            350
          );
      }
    }
  },

  mounted(): void {
    setTimeout(this.analyze, 1000);
  }
});
</script>

<style scoped lang="scss">
.main-content {
  max-height: 100%;
  overflow-y: auto;
}

.output {
  position: relative;
  flex-basis: 48px;
  border-radius: 30px;
  background-color: #ececec;

  .theme--dark & {
    background-color: #252525;
  }

  &::v-deep span {
    display: inline-block;
  }
}

.analyzed {
  position: relative;
  flex-basis: 100%;
  border-radius: 30px;
  background-color: #ececec;

  .theme--dark & {
    background-color: #252525;
  }

  &::v-deep p {
    position: relative;
    margin: 0;
    padding: 4px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;

    & > .overlay {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #00000000;
    }

    & > .overlay:hover,
    &.active > .overlay {
      background: #00000033;
    }

    & span {
      position: relative;
      display: inline-block;
      cursor: text;
    }
  }

  &::v-deep .anim {
    position: absolute;
    z-index: 99;
    pointer-events: none;
  }
}
</style>
