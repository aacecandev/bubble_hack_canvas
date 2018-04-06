function Player(game) {

  this.game = game;

  this.x = 294;
  this.y = 520;
  this.angle = 0;
  this.tileType = 0;
  this.bubble = {
    x: 294,
    y: 482,
    angle: 0,
    speed: 1000,
    dropspeed: 900,
    tileType: 0,
    visible: false
  };
  this.nextBubble = {
    x: 0,
    y: 0,
    tileType: 0
  };
}

// Create a random bubble for the player
Player.prototype.createNextBubble = function () {
  // Set the current bubble
  
  this.bubble.tileType = this.tileType;
  
  this.bubble.x = this.x;
  this.bubble.y = this.y;
  this.bubble.visible = true;
  
  // Get a random type from the existing colors
  var nextColor = this.getExistingColor();

  // Set the next bubble
  this.tileType = nextColor;
  this.nextBubble.tileType = nextColor;
}

// Get a random existing color
Player.prototype.getExistingColor = function () {
  var existingColors = this.findColors();

  var bubbleType = 0;
  if (existingColors.length > 0) {
    bubbleType = existingColors[this.game.randRange(0, existingColors.length - 1)];
  }

  return bubbleType;
}

// Shoot the bubble
Player.prototype.shootBubble = function () {
  // Shoot the bubble in the direction of the mouse
  this.bubble.x = this.x;
  this.bubble.y = this.y;
  this.bubble.angle = this.angle;
  this.bubble.tileType = this.nextBubble.tileType;

  // Set the gamestate
  this.game.setGameState(this.game.gamestates.shootbubble);
}

// Find the remaining colors
Player.prototype.findColors = function () {
  var foundcolors = [];
  var colortable = [];
  for (var i = 0; i < this.game.level.bubbleColors; i++) {
    colortable.push(false);
  }

  // Check all tiles
  for (var i = 0; i < this.game.level.columns; i++) {
    for (var j = 0; j < this.game.level.rows; j++) {
      var tile = this.game.level.tiles[i][j];
      if (tile.type >= 0) {
        if (!colortable[tile.type]) {
          colortable[tile.type] = true;
          foundcolors.push(tile.type);
        }
      }
    }
  }

  return foundcolors;
}