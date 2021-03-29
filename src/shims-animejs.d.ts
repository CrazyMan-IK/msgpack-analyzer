declare module 'vue/types/vue' {
  import Vue from 'vue';
  import AnimeJS from 'animejs';

  interface Vue {
    $anime: AnimeJS;
  }
}
