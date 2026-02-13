const importAll = (r: __WebpackModuleApi.RequireContext) => {
  r.keys()
    .filter((key) => key !== './index.ts')
    .forEach(r);
};

importAll(require.context('./', true, /\.ts$/));
