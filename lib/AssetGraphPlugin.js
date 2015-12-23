/* eslint no-var: 0 */
/* eslint prefer-arrow-callback: 0 */
var fs = require('fs');
var path = require('path');

/**
 * Generete assets dependency graph in the form of key-value pair
 *
 * Sample result:
 * {
 *   entry1: ['common.js', 'chunk1.js']
 *   entry2: ['common.js', 'chunk2.js']
 * }
 */
var AssetGraphPlugin = function (target) {
  // get output path, relative from webpack.config.js file
  this.output = path.join(process.cwd(), target);
};

AssetGraphPlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function (stats) {
    stats = stats.toJson();

    var output = {
      hash: stats.hash,
      path: stats.path,
      publicPath: stats.publicPath,
      assets: this.parseModuleDependencyGraph(stats)
    };

    fs.writeFileSync(this.output, JSON.stringify(output, null, 2));
  }.bind(this));
};

AssetGraphPlugin.prototype.parseModuleDependencyGraph = function (stats) {
  var entryPoints = {};
  var allChunks = stats.chunks;

  function getRequiredFilesFromParentChunks(parentChunks) {
    var requiredFiles = [];

    for (var i = 0; i < parentChunks.length; i++) {
      var parentChunkId = parentChunks[i];
      var parentChunk = allChunks[parentChunkId];

      // it's possible that parent has another parent
      // get them recursively
      if (parentChunk.parents.length > 0) {
        requiredFiles = getRequiredFilesFromParentChunks(parentChunk.parents);
      }

      // add own files
      requiredFiles = requiredFiles.concat(parentChunk.files);
    }

    return requiredFiles;
  }

  // create map
  for (var i = 0; i < allChunks.length; i++) {
    var currentChunk = allChunks[i];
    var chunkName = currentChunk.names[0];
    var parentChunks = currentChunk.parents;
    var requiredFiles = [];

    // 'valid' entry point
    if (currentChunk.entry) {
      requiredFiles = getRequiredFilesFromParentChunks(parentChunks);

      // finally add own files
      requiredFiles = requiredFiles.concat(currentChunk.files);

      // add to map
      var fileMap = mapFileByExtension(stats, requiredFiles);
      entryPoints[chunkName] = fileMap;
    }
  }

  return entryPoints;
};

function mapFileByExtension(stats, chunkFiles) {
  var fileMap = {};

  // remove .map file first
  var files = chunkFiles.filter(function (file) {
    return file.indexOf('.map') === -1;
  });

  files.forEach(function (file) {
    var fileExt = file.replace(/(.*\.([a-z0-9]+))/, '$2');
    if (fileMap[fileExt]) {
      fileMap[fileExt].push(stats.publicPath + file);
    } else {
      fileMap[fileExt] = [stats.publicPath + file];
    }
  });

  return fileMap;
}

module.exports = AssetGraphPlugin;
