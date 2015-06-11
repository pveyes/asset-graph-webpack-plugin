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
WebpackDepsPlugin = function(target) {
  // get output path, relative from webpack.config.js file
  this.output = path.join(process.cwd(), target);
};

WebpackDepsPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function(stats) {
    var dependencyGraph = this.parseModuleDependencyGraph(stats.toJson());
    var dependencyGraphString = JSON.stringify(dependencyGraph, false, 2);
    fs.writeFileSync(this.output, dependencyGraphString);
  }.bind(this));
}

WebpackDepsPlugin.prototype.parseModuleDependencyGraph = function(stats) {
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
    var currentChunk = allChunks[i]
    var chunkName = currentChunk.names[0];
    var parentChunks = currentChunk.parents;
    var requiredFiles = [];

    // 'valid' entry point
    if (parentChunks.length > 0) {
      requiredFiles = getRequiredFilesFromParentChunks(parentChunks);

      // finally add own files
      requiredFiles = requiredFiles.concat(allChunks[i].files);

      // add to map
      entryPoints[chunkName] = requiredFiles;
    }
  };

  return entryPoints;
}

module.exports = WebpackDepsPlugin;
