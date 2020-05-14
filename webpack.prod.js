const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

console.log("webpack.prod.js ------");

const config = [
  merge(common[0], {
    mode: 'production',

    optimization: {
      minimizer:
        [
          new UglifyJSPlugin({
            uglifyOptions: {compress: {drop_console: true}},
          }),
        ]
    }
  }),
  merge(common[1], {
    mode: 'production'
  })
];

console.log(config);

module.exports = config;