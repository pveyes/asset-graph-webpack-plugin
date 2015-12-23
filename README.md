# asset-graph-webpack-plugin

> Webpack plugin to easily get assets dependency graph based on entry point

Given your application entry points, get all files needed to load from that entry point

No more manually write script tag every time you create another page!

### Example

Your `webpack.config.js` file

```js
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var AssetGraphPlugin = require('asset-graph-webpack-plugin');

module.exports = {
  target: 'web',
  entry: {
    home: './app/home',
    detail: './app/detail'
  },
  output: {
    filename: 'js/[name]-[hash].bundle.js',
    publicPath: '/assets/',
    chunkFilename: 'js/[name]-[chunkhash].bundle.js',
    path: './public/',
  },
  plugins: [
    new CommonsChunkPlugin({name: 'common'}),
    new AssetGraphPlugin('./assets.json')
  ]
};
```

Will output `deps.json` file which contain

```json
{
  "hash": "3058a8bcbb6ee2dfe373",
  "publicPath": "/assets/",
  "assets": {
    "home": {
      "js": [
        "/assets/js/common-3058a8bcbb6ee2dfe373.bundle.js",
        "/assets/js/home-3058a8bcbb6ee2dfe373.bundle.js"
      ],
      "css": [
        "/assets/style-3058a8bcbb6ee2dfe373.css"
      ]
    },
    "detail": {
      "js": [
        "/assets/js/common-3058a8bcbb6ee2dfe373.bundle.js",
        "/assets/js/detail-3058a8bcbb6ee2dfe373.bundle.js"        
      ]
    },
  }
}
```

### License

MIT
