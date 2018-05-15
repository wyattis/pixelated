var path = require('path')
var config = require('webpack').config
module.exports = {
  entry: './pixelated.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'pixelated',
    libraryTarget: 'assign',
    filename: 'pixelated.min.js'
  },
  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
};