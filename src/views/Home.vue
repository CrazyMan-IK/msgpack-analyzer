<template>
  <v-container fluid class="home fill-height">
    <v-row class="ma-0 fill-height">
      <v-col cols="2">
        <h1>This is an main page</h1>
      </v-col>
      <v-col class="d-flex main-content layout column" cols="8">
        <h1>This is an main page</h1>
        <v-text-field filled v-model="input" :rules="[rules.hexChecker, rules.isEven]" @input="analyze"> </v-text-field>
        <p ref="output" class="ma-0 mb-8 pa-3 output"></p>
        <div ref="analyzed" class="pa-3 analyzed fill-height">
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

export default Vue.extend({
  name: 'Home',

  components: {},

  data: () => ({
    input: '1234567890',
    rules: {
      hexChecker: (value: string): string | boolean => {
        value = value.replaceAll(' ', '');
        const pattern = /^((?:[0-9a-fA-F]* ?)+)$/gm;
        return pattern.test(value) || 'Not a valid hexadecimal string';
      },
      isEven: (value: string): string | boolean => {
        value = value.replaceAll(' ', '');
        return value.length % 2 == 0 || 'String length is not even';
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

    analyze(): void {
      if (this.rules.hexChecker(this.input) === true && this.rules.isEven(this.input) === true) {
        const chunks = this.splitByChunks(this.input.replaceAll(' ', ''), 2);
        console.log(chunks);

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

        chunks.forEach((chunk: string, i: number) => {
          const anim = document.createElement('span');
          const p = document.createElement('p');

          anim.style.top = (output.children[i * 2] as HTMLElement).offsetTop - 75 + 'px' ?? '0';

          anim.textContent = chunk;
          p.textContent = chunk;

          analyzed.appendChild(anim);
          analyzed.appendChild(p);
        });

        /*
        const spans = document.querySelectorAll('.output > span');
        spans.forEach((span: Element) => {
          span.style = '';
        });

        //this.$anime.remove('.output > span');

        this.$anime({
          targets: '.output > span',
          rotate: '1turn',
          delay: this.$anime.stagger(100, { from: 2 })
        });
        */
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
  min-height: 48px;
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
  border-radius: 30px;
  background-color: #ececec;

  .theme--dark & {
    background-color: #252525;
  }

  &::v-deep > p {
    margin: 0;
  }

  &::v-deep > span {
    position: absolute;
  }
}
</style>
