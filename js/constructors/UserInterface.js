function UserInterface(game) {

  this.game = game;

  // Animation variables
  this.animationState = 0;
  this.animationTime = 0;

  // Clusters
  this.showcluster = false;
  this.cluster = [];
  this.floatingclusters = [];

  // Neighbor offset table
  this.neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // Even row tiles
  [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  // Odd row tiles

}

UserInterface.prototype.hideDialog = function () {
  $(".dialog").slideUp(200);
  $(".btn-start-game").off("click");
}

// Render the game
UserInterface.prototype.render = function () {

  // Clear the canvas
  this.game.context.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

  var yoffset = this.game.level.tileHeight / 2;

  // Draw level background
  this.game.context.fillStyle = "#8c8c8c";
  this.game.context.fillRect(this.game.level.x - 4, this.game.level.y - 4, this.game.level.width + 8, this.game.level.height + 4 - yoffset);

  // Render tiles
  this.renderTiles();

  // // Draw level bottom
  this.game.context.fillStyle = "#656565";
  this.game.context.fillRect(this.game.level.x - 4, this.game.level.y - 4 + this.game.level.height + 4 - yoffset, this.game.level.width + 8, 2 * this.game.level.tileHeight + 3);

  // Render cluster
  if (this.showcluster) {
    this.renderCluster(this.cluster, 255, 128, 128);

    for (var i = 0; i < this.floatingclusters.length; i++) {
      var col = Math.floor(100 + 100 * i / this.floatingclusters.length);
      this.renderCluster(this.floatingclusters[i], col, col, col);
    }
  } 


  // Render player bubble
  this.renderPlayer();

  // Game Over overlay
  if (this.game.gamestate == this.game.gamestates.gameover) {
    this.game.context.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.game.context.fillRect(this.game.level.x - 4, this.game.level.y - 4, this.game.level.width + 8, this.game.level.height + 2 * this.game.level.tileHeight + 8 - yoffset);

    this.game.context.fillStyle = "#ffffff";
    this.game.context.font = "24px Verdana";
    this.drawCenterText("Game Over!", this.game.level.x, this.game.level.y + this.game.level.height / 2 + 10, this.game.level.width);
    this.drawCenterText("Click to start", this.game.level.x, this.game.level.y + this.game.level.height / 2 + 40, this.game.level.width);
  }
}

// Draw text that is centered
UserInterface.prototype.drawCenterText = function(text, x, y, width) {
  var textdim = this.game.context.measureText(text);
  this.game.context.fillText(text, x + (width - textdim.width) / 2, y);
}

// Render cluster
UserInterface.prototype.renderCluster = function (cluster, r, g, b) {
  for (var i = 0; i < cluster.length; i++) {
    // Calculate the tile coordinates
    var coord = getTileCoordinate(cluster[i].x, cluster[i].y);

  }
}

// Render the player bubble
UserInterface.prototype.renderPlayer = function () {
  var centerx = 294 + this.game.level.tileWidth / 2;
  var centery = 520 + this.game.level.tileHeight / 2;

  // Draw player background circle
  this.game.context.fillStyle = "#7a7a7a";
  this.game.context.beginPath();
  this.game.context.arc(centerx, centery, this.game.level.radius + 12, 0, 2 * Math.PI, false);
  this.game.context.fill();
  this.game.context.lineWidth = 2;
  this.game.context.strokeStyle = "#8c8c8c";
  this.game.context.stroke();

  // Draw the angle
  this.game.context.lineWidth = 2;
  this.game.context.strokeStyle = "#0000ff";
  this.game.context.beginPath();
  this.game.context.moveTo(centerx, centery);
  this.game.context.lineTo(centerx + 1.5 * this.game.level.tileWidth * Math.cos(this.degToRad(this.game.player.angle)), centery - 1.5 * this.game.level.tileHeight * Math.sin(this.degToRad(this.game.player.angle)));
  this.game.context.stroke();

  // Draw the next bubble
  this.drawBubble(this.game.player.nextBubble.x, this.game.player.nextBubble.y, this.game.player.nextBubble.tileType);

  // Draw the bubble
  if (this.game.player.bubble.visible) {
    this.drawBubble(this.game.player.bubble.x, this.game.player.bubble.y, this.game.player.bubble.tileType);
  }
  
}

// Draw the bubble
UserInterface.prototype.drawBubble = function (x, y, index) {
  if (index < 0 || index >= this.game.level.bubbleColors)
    return;

  // Draw the bubble sprite
  this.game.context.drawImage(this.game.bubbleImage, index * 40, 0, 40, 40, x, y, this.game.level.tileWidth, this.game.level.tileHeight);
}

// Render tiles
UserInterface.prototype.renderTiles = function () {
  // Top to bottom
  for (var j = 0; j < this.game.level.rows; j++) {
    for (var i = 0; i < this.game.level.columns; i++) {
      // Get the tile
      var tile = this.game.level.tiles[i][j];

      // Get the shift of the tile for animation
      var shift = tile.shift;

      // Calculate the tile coordinates
      var coord = tile.getTileCoordinate(i, j);

      // Check if there is a tile present
      if (tile.type >= 0) {
        // Support transparency
        this.game.context.save();
        this.game.context.globalAlpha = tile.alpha;

        // Draw the tile using the color
        this.drawBubble(coord.tilex, coord.tiley + shift, tile.type);

        this.game.context.restore();
      }
    }
  }
}

UserInterface.prototype.stateShootBubble = function (dt) {
  // Bubble is moving

  // Move the bubble in the direction of the mouse
  this.game.player.bubble.x += dt * this.game.player.bubble.speed * Math.cos(this.degToRad(this.game.player.bubble.angle));
  this.game.player.bubble.y += dt * this.game.player.bubble.speed * -1 * Math.sin(this.degToRad(this.game.player.bubble.angle));

  // Handle left and right collisions with the level
  if (this.game.player.bubble.x <= this.game.level.x) {
    // Left edge
    this.game.player.bubble.angle = 180 - this.game.player.bubble.angle;
  } else if (this.game.player.bubble.x + this.game.level.tileWidth >= this.game.level.x + this.game.level.width) {
    // Right edge
    this.game.player.bubble.angle = 180 - this.game.player.bubble.angle;
  }

  // Collisions with the top of the level
  if (this.game.player.bubble.y <= this.game.level.y) {
    // Top collision
    this.game.player.bubble.y = this.game.level.y;
    this.snapBubble();
    return;
  }

  // Collisions with other tiles
  for (var i = 0; i < this.game.level.columns; i++) {
    for (var j = 0; j < this.game.level.rows; j++) {
      var tile = this.game.level.tiles[i][j];

      // Skip empty tiles
      if (tile.type < 0) {
        continue;
      }

      // Check for intersections
      var coord = tile.getTileCoordinate(i, j);
      if (this.circleIntersection(this.game.player.bubble.x + this.game.level.tileWidth / 2,
        this.game.player.bubble.y + this.game.level.tileHeight / 2,
        this.game.level.radius,
        coord.tilex + this.game.level.tileWidth / 2,
        coord.tiley + this.game.level.tileHeight / 2,
        this.game.level.radius)) {

        // Intersection with a level bubble
        this.snapBubble();
        return;
      }
    }
  }
}

// Snap bubble to the grid
UserInterface.prototype.snapBubble = function () {
  // Get the grid position
  var centerx = this.game.player.bubble.x + this.game.level.tileWidth / 2;
  var centery = this.game.player.bubble.y + this.game.level.tileHeight / 2;
  var gridpos = this.getGridPosition(centerx, centery);

  // Make sure the grid position is valid
  if (gridpos.x < 0) {
    gridpos.x = 0;
  }

  if (gridpos.x >= this.game.level.columns) {
    gridpos.x = this.game.level.columns - 1;
  }

  if (gridpos.y < 0) {
    gridpos.y = 0;
  }

  if (gridpos.y >= this.game.level.rows) {
    gridpos.y = this.game.level.rows - 1;
  }

  // Check if the tile is empty
  var addtile = false;
  if (this.game.level.tiles[gridpos.x][gridpos.y].type != -1) {
    // Tile is not empty, shift the new tile downwards
    for (var newrow = gridpos.y + 1; newrow < this.game.level.rows; newrow++) {
      if (this.game.level.tiles[gridpos.x][newrow].type == -1) {
        gridpos.y = newrow;
        addtile = true;
        break;
      }
    }
  } else {
    addtile = true;
  }

  // Add the tile to the grid
  if (addtile) {
    // Hide the player bubble
    this.game.player.bubble.visible = false;
    

    // Set the tile
    this.game.level.tiles[gridpos.x][gridpos.y].type = this.game.player.bubble.tileType;


    // Check for game over
    if (this.checkGameOver()) {
      return;
    }

    // Find clusters
    this.cluster = this.findCluster(gridpos.x, gridpos.y, true, true, false);

    if (this.cluster.length >= 3) {
      // Remove the cluster
      this.game.setGameState(this.game.gamestates.removecluster);
      return;
    }
  }

  // No clusters found
  this.game.turncounter++;
  if (this.game.turncounter >= 5) {
    // Add a row of bubbles
    this.game.level.addBubbles();
    this.game.turncounter = 0;
    this.game.rowoffset = (this.game.rowoffset + 1) % 2;

    if (this.checkGameOver()) {
      return;
    }
  }

  // Next bubble
  this.game.player.createNextBubble();
  this.game.setGameState(this.game.gamestates.ready);
}

UserInterface.prototype.checkGameOver = function () {
  // Check for game over
  for (var i = 0; i < this.game.level.columns; i++) {
    // Check if there are UserInterfaces in the bottom row
    if (this.game.level.tiles[i][this.game.level.rows - 1].type != -1) {
      // Game over
      this.game.player.createNextBubble();
      this.game.setGameState(this.game.gamestates.gameover);
      return true;
    }
  }

  return false;
}

// Convert radians to degrees
UserInterface.prototype.radToDeg = function (angle) {
  return angle * (180 / Math.PI);
}

// Convert degrees to radians
UserInterface.prototype.degToRad = function (angle) {
  return angle * (Math.PI / 180);
}

// Check if two circles intersect
UserInterface.prototype.circleIntersection = function (x1, y1, r1, x2, y2, r2) {
  // Calculate the distance between the centers
  var dx = x1 - x2;
  var dy = y1 - y2;
  var len = Math.sqrt(dx * dx + dy * dy);

  if (len < r1 + r2) {
    // Circles intersect
    return true;
  }

  return false;
}

// Get the closest grid position
UserInterface.prototype.getGridPosition = function (x, y) {
  var gridy = Math.floor((y - this.game.level.y) / this.game.level.rowHeight);

  // Check for offset
  var xoffset = 0;
  if ((gridy + this.game.rowoffset) % 2) {
    xoffset = this.game.level.tileWidth / 2;
  }
  var gridx = Math.floor(((x - xoffset) - this.game.level.x) / this.game.level.tileWidth);

  return { x: gridx, y: gridy };
}

// Find cluster at the specified tile location
UserInterface.prototype.findCluster = function (tx, ty, matchtype, reset, skipremoved) {
  // Reset the processed flags
  if (reset) {
    this.game.level.resetProcessed();
  }

  // Get the target tile. Tile coord must be valid.
  var targettile = this.game.level.tiles[tx][ty];

  // Initialize the toprocess array with the specified tile
  var toprocess = [targettile];
  targettile.processed = true;
  var foundcluster = [];

  while (toprocess.length > 0) {
    // Pop the last element from the array
    var currenttile = toprocess.pop();

    // Skip processed and empty tiles
    if (currenttile.type == -1) {
      continue;
    }

    // Skip tiles with the removed flag
    if (skipremoved && currenttile.removed) {
      continue;
    }

    // Check if current tile has the right type, if matchtype is true
    if (!matchtype || (currenttile.type == targettile.type)) {
      // Add current tile to the cluster
      foundcluster.push(currenttile);

      // Get the neighbors of the current tile
      var neighbors = this.getNeighbors(currenttile);

      // Check the type of each neighbor
      for (var i = 0; i < neighbors.length; i++) {
        if (!neighbors[i].processed) {
          // Add the neighbor to the toprocess array
          toprocess.push(neighbors[i]);
          neighbors[i].processed = true;
        }
      }
    }
  }

  // Return the found cluster
  return foundcluster;
}

// Get the neighbors of the specified tile
UserInterface.prototype.getNeighbors = function (tile) {
  var tilerow = (tile.y + this.game.rowoffset) % 2; // Even or odd row
  var neighbors = [];

  // Get the neighbor offsets for the specified tile
  var n = this.neighborsoffsets[tilerow];

  // Get the neighbors
  for (var i = 0; i < n.length; i++) {
    // Neighbor coordinate
    var nx = this.x + n[i][0];
    var ny = this.y + n[i][1];

    // Make sure the tile is valid
    if (nx >= 0 && nx < this.game.level.columns && ny >= 0 && ny < this.game.level.rows) {
      neighbors.push(this.game.level.tiles[nx][ny]);
    }
  }

  return neighbors;
}


