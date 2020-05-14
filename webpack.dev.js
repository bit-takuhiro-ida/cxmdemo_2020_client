const merge = require('webpack-merge');
const common = require('./webpack.config.js');


console.log("webpack.dev.js ------");

const config = [
  merge(common[0], {
    mode: 'development',
    devtool: 'inline-source-map',
  }),
  merge(common[1], {
    mode: 'development',
  })
];


console.log(config);


module.exports = config;