// load the default config generator.
const genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');

module.exports = function (config, env) {
  var config = genDefaultConfig(config, env);

  config.devtool = "eval-source-map";


  config.module = config.module || {};
  config.module.noParse = [/pixi-particles/, /katex/];

  config.module.rules.push({
    test: /\.tsx$/,
    loader: 'babel-loader!ts-loader'
  });

  config.module.rules.push({
    test: /\.ts$/,
    loader: 'babel-loader!ts-loader'
  });

  config.module.rules.push({
    test: /\.css/,
    exclude: /(node_modules|bower_components)/,
    loaders: ["style-loader","css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5],typed-css-modules"]
  });

  config.resolve.extensions.push(".tsx");
  config.resolve.extensions.push(".ts");

  return config;
};
