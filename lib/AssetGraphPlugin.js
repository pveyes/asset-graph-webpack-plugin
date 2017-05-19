const fs = require('fs');
const path = require('path');

/**
 * Generete assets dependency graph in the form of key-value pair
 *
 * Sample result:
 * {
 *   entry1: ['common.js', 'chunk1.js']
 *   entry2: ['common.js', 'chunk2.js']
 * }
 */
class AssetGraphPlugin {
  constructor(target) {
    // get output path, relative from webpack.config.js file
    this.output = path.join(process.cwd(), target);
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      const jsonStats = stats.toJson();

      const output = {
        hash: jsonStats.hash,
        path: jsonStats.path,
        publicPath: jsonStats.publicPath,
        assets: this.parseModuleDependencyGraph(jsonStats),
      };

      // eslint-disable-next-line no-sync
      fs.writeFileSync(this.output, JSON.stringify(output, null, 2));
    });
  }

  parseModuleDependencyGraph(stats) {
    const entryPoints = {};
    const allChunks = stats.chunks;

    // create map
    for (let i = 0; i < allChunks.length; i++) {
      const currentChunk = allChunks[i];
      const chunkName = currentChunk.names[0];
      const parentChunks = currentChunk.parents;
      const requiredFiles = getRequiredFilesFromParentChunks(
        parentChunks,
        allChunks
      ).concat(currentChunk.files);

      // add to map
      const fileMap = mapFileByExtension(stats, requiredFiles);
      entryPoints[chunkName] = fileMap;
    }

    return entryPoints;
  }
}

function getRequiredFilesFromParentChunks(parentChunks, allChunks) {
  let requiredFiles = [];

  for (let i = 0; i < parentChunks.length; i++) {
    const parentChunkId = parentChunks[i];
    const parentChunk = allChunks.find(chunk => chunk.id === parentChunkId);

    // it's possible that parent has another parent
    // get them recursively
    if (parentChunk) {
      if (parentChunk.parents.length > 0) {
        requiredFiles = getRequiredFilesFromParentChunks(
          parentChunk.parents,
          allChunks,
        );
      }
      // add own files
      requiredFiles = requiredFiles.concat(parentChunk.files);
    }
  }

  return requiredFiles;
}

function mapFileByExtension(stats, chunkFiles) {
  const fileMap = {};

  // remove .map file first
  const files = chunkFiles.filter(file => {
    return file.indexOf('.map') === -1;
  });

  files.forEach(file => {
    const fileExt = file.replace(/(.*\.([a-z0-9]+))/, '$2');
    if (fileMap[fileExt]) {
      fileMap[fileExt].push(stats.publicPath + file);
    } else {
      fileMap[fileExt] = [stats.publicPath + file];
    }
  });

  return fileMap;
}

module.exports = AssetGraphPlugin;
