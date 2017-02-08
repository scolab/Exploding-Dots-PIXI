// load the default config generator.
var genDefaultConfig = require('@kadira/storybook/dist/server/config/defaults/webpack.config.js');

module.exports = function(config, env) {
    var config = genDefaultConfig(config, env);

    config.devtool = "eval-source-map";
    
    config.module = config.module || {};
    config.module.noParse = /pixi-filters/;

    return config;
};
