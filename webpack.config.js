const path = require('path');

module.exports = {
//   entry: './js/src/test1.js',
  // entry: './js/src/testpaper.paper.js',
  entry: './js/src/testloader.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname + '/js/dist')
  },
  module: {
    loaders: [
      {
        test: /\.paper.js$/,
        loader: "paper-loader"
      }
    ]
  }
};