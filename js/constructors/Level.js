function Level(game) {

  this.game = game;

  this.x = 4;           // X position
  this.y = 0;          // Y position
  this.width = 0;       // Width, gets calculated
  this.height = 0;      // Height, gets calculated
  this.columns = 15;    // Number of tile columns
  this.rows = 14;       // Number of tile rows
  this.tileWidth = 40;  // Visual width of a tile
  this.tileHeight = 40; // Visual height of a tile
  this.rowHeight = 34;  // Height of a row
  this.radius = 20;     // Bubble collision radius
  this.tiles = [];      // The two-dimensional tile array

  // Number of different colors
  this.bubbleColors = 7;
}

// Create a random level
Level.prototype.createLevel = function () {
  // Create a level with random tiles
  for (var j = 0; j < this.rows; j++) {
    var randomTile = this.game.randRange(0, this.bubbleColors - 1);
    var count = 0;
    for (var i = 0; i < this.columns; i++) {
      if (count >= 2) {
        // Change the random tile
        var newTile = this.game.randRange(0, this.bubbleColors - 1);

        // Make sure the new tile is different from the previous tile
        if (newTile == randomTile) {
          newTile = (newTile + 1) % this.bubbleColors;
        }
        randomTile = newTile;
        count = 0;
      }
      count++;

      if (j < this.rows / 2) {
        this.tiles[i][j].type = randomTile;
      } else {
        this.tiles[i][j].type = -1;
      }
    }
  }
}

Level.prototype.addBubbles = function () {
  // Move the rows downwards
  for (var i = 0; i < this.columns; i++) {
    for (var j = 0; j < this.rows - 1; j++) {
      this.tiles[i][this.rows - 1 - j].type = this.tiles[i][this.rows - 1 - j - 1].type;
    }
  }

  // Add a new row of bubbles at the top
  for (var i = 0; i < this.columns; i++) {
    // Add random, existing, colors
    this.tiles[i][0].type = this.game.player.getExistingColor();
  }
}

// Reset the processed flags
Level.prototype.resetProcessed = function () {
  for (var i = 0; i < this.columns; i++) {
    for (var j = 0; j < this.rows; j++) {
      this.tiles[i][j].processed = false;
    }
  }
}

// Reset the removed flags
Level.prototype.resetRemoved = function () {
  for (var i = 0; i < this.columns; i++) {
    for (var j = 0; j < this.rows; j++) {
      this.tiles[i][j].removed = false;
    }
  }
}

Level.addBubbles = function () {
  // Move the rows downwards
  for (var i = 0; i < this.columns; i++) {
    for (var j = 0; j < this.rows - 1; j++) {
      this.tiles[i][this.rows - 1 - j].type = this.tiles[i][this.rows - 1 - j - 1].type;
    }
  }

  // Add a new row of bubbles at the top
  for (var i = 0; i < this.columns; i++) {
    // Add random, existing, colors
    this.tiles[i][0].type = this.game.player.getExistingColor();
  }
}