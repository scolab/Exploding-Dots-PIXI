// help: http://webpack.github.io/docs/tutorials/getting-started/
const USE_CSSMODULES = true;

const babelOptions = {
    presets: ['react',
        ['es2015', {'modules': false}]],
    plugins: ['transform-runtime,babel-plugin-transform-inline-environment-variables']
};

module.exports = [
  {
    // typescript loader
    test: /\.(tsx|ts)$/,
    loader: 'awesome-typescript-loader',
    query: {
      ignoreDiagnostics: [
        // for codes see at:https://github.com/Microsoft/TypeScript/blob/master/src/compiler/diagnosticMessages.json
        //2304, // Cannot find name '{0}
        //2305, // '{0}' has no exported member '{1}'
        //2307, // Cannot find module '{0}'
        //2339, // Property '{0}' does not exist on type '{1}'
        //2346, //Supplied parameters do not match any signature of call target.
      ]
    }
  },
  {
      test: /\.jsx$/,
      loader: 'babel-loader',
      options: babelOptions
  },
  { test: /\.png$/, use: 'url-loader?limit=10000' },
  { test: /\.jpg$/, use: 'file-loader' },
  { test: /\.gif$/, use: 'file-loader' },
];
