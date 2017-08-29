// load the default config generator.
var genDefaultConfig = require('@kadira/storybook/dist/server/config/defaults/webpack.config.js');

module.exports = function (config, env) {
  var config = genDefaultConfig(config, env);

  config.devtool = "eval-source-map";


  config.module = config.module || {};
  config.module.noParse = [/pixi-particles/, /katex/];

  config.module.loaders.push({
    test: /\.tsx$/,
    loader: 'babel!ts-loader'
  });

  config.module.loaders.push({
    test: /\.ts$/,
    loader: 'babel!ts-loader'
  });

  config.module.loaders.push({
    test: /\.css/,
    exclude: /(node_modules|bower_components)/,
    loaders: ["style","css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5],typed-css-modules"]
  });

  config.resolve.extensions.push(".tsx");
  config.resolve.extensions.push(".ts");

  return config;
};
