# webpack-deps-plugin [WIP]

> Webpack plugin to easily get assets dependency graph based on entry point

Given your application entry points, get all files needed to load from that entry point

No more manually write script tag every time you create another page!

### Example

Your `webpack.config.js` file

```js
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
var WebpackDepsPlugin = require('webpack-deps-plugin')

module.exports = {
  target: 'web',
  entry: {
    home: './app/home',
    detail: './app/detail'
  },
  output: {
    filename: 'js/[name]-[hash].bundle.js',
    chunkFilename: 'js/[name]-[chunkhash].bundle.js',
    path: './public/',
  },
  plugins: [
    new CommonsChunkPlugin({name: 'common'}),
    new WebpackDepsPlugin('./deps.json')
  ]
};
```

Will output `deps.json` file which contain

```json
{
  "home": [
    "js/common-3058a8bcbb6ee2dfe373.bundle.js",
    "js/home-3058a8bcbb6ee2dfe373.bundle.js"
  ],
  "detail": [
    "js/common-3058a8bcbb6ee2dfe373.bundle.js",
    "js/detail-3058a8bcbb6ee2dfe373.bundle.js"
  ],
}
```

### TODO

- [ ] Get full path based on publicPath property from output
- [ ] Also fetch CSS files (if any)
- [ ] Images would be nice

### License

MIT
