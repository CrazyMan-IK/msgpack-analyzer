module.exports = {
  transpileDependencies: ['vuetify'],

  chainWebpack: (config) => {
    //config.module.rule("ts").use("ts-loader");
    config.plugin('fork-ts-checker').tap((config) => {
      config[0].async = false;
      config[0].memoryLimit = 4096;
      config[0].workers = 1;
      config[0].useTypescriptIncrementalApi = true;
      return config;
    });
  }
};
