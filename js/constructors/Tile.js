function Tile(x, y, type, shift, game) {

  this.game = game;
  
  this.x = x;
  this.y = y;
  this.type = type;
  this.removed = false;
  this.shift = shift;
  this.velocity = 0;
  this.alpha = 1;
  this.processed = false;
  
}

// Get the tile coordinate
Tile.prototype.getTileCoordinate = function(column, row) {
  var tilex = this.game.level.x + column * this.game.level.tileWidth;

  // X offset for odd or even rows
  if ((row + this.game.rowoffset) % 2) {
    tilex += this.game.level.tileWidth / 2;
  }

  var tiley = this.game.level.y + row * this.game.level.rowHeight;
  return { tilex: tilex, tiley: tiley };
}

// Find floating clusters
Tile.prototype.findFloatingClusters = function() {
  // Reset the processed flags
  this.game.level.resetProcessed();

  var foundclusters = [];

  // Check all tiles
  for (var i = 0; i < this.game.level.columns; i++) {
    for (var j = 0; j < this.game.level.rows; j++) {
      var tile = this.game.level.tiles[i][j];
      if (!tile.processed) {
        // Find all attached tiles
        var foundcluster = this.findCluster(i, j, false, false, true);

        // There must be a tile in the cluster
        if (foundcluster.length <= 0) {
          continue;
        }

        // Check if the cluster is floating
        var floating = true;
        for (var k = 0; k < foundcluster.length; k++) {
          if (foundcluster[k].y == 0) {
            // Tile is attached to the roof
            floating = false;
            break;
          }
        }

        if (floating) {
          // Found a floating cluster
          foundclusters.push(foundcluster);
        }
      }
    }
  }

  return foundclusters;
}
