import { VueConstructor } from 'vue';

import AnimeJS from 'animejs';

export default class VueAnimeJS {
  public static install(Vue: VueConstructor): void {
    Vue.directive('anime', {
      bind: function bind(targets, binding) {
        const opts = Object.assign({}, binding.value, { targets: targets });
        AnimeJS(opts);
      }
    });
    Vue.prototype.$anime = AnimeJS;
  }
}
