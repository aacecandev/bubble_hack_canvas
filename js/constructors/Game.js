function Game() {

  this.ui = new UserInterface(this);
  this.level = new Level(this);
  this.player = new Player(this);
  /* this.tile = new Tile(this); */
  

  // Get the canvas and context
  this.canvas = document.getElementById("canvas");
  this.canvas.width = 628;
  this.canvas.height = 628;
  this.context = this.canvas.getContext("2d");

  // Score
  this.score = 0;
  this.turncounter = 0;

  this.rowoffset = 0;
  

  // Game states
  this.gamestates = { 
    init: 0, 
    ready: 1, 
    shootbubble: 2, 
    removecluster: 3, 
    gameover: 4 
  };

  this.gamestate = this.gamestates.init;
}

// Initialize the game
Game.prototype.init = function () {

  // Set an event to the dialog start button
  $(".btn-start-game").on("click", function () {
    this.ui.hideDialog();
    this.ui.render();
  }.bind(this));

  // Add mouse events
  this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
  this.canvas.addEventListener("mousedown",(e) => this.onMouseDown(e));

  // Initialize the two-dimensional tile array
  for (var i = 0; i < this.level.columns; i++) {
    this.level.tiles[i] = [];
    for (var j = 0; j < this.level.rows; j++) {
      // Define a tile type and a shift parameter for animation
      this.level.tiles[i][j] = new Tile(i, j, 0, 0, this); // (x, y, type, shift)
    }
  }

  this.level.width = 620; // 620
  this.level.height = 520; // 482

  // Init the player

  // Current bubble waiting to be fired at the bottom
  this.player.bubble.x = this.level.x + this.level.width / 2 - this.level.tileWidth / 2; // 294
  this.player.bubble.y = this.level.y + this.level.height; // 565
  this.player.angle = 90;
  this.player.tileType = 0;

  // Bottom bubble waiting just left the current bubble
  this.player.nextBubble.x = this.player.bubble.x - 2 * this.level.tileWidth; // 214
  this.player.nextBubble.y = this.player.bubble.y; // 565

  // New game
  this.newGame();

  // Enter main loop
  this.main();
}

// Start a new game
Game.prototype.newGame = function () {
  // Reset score
  this.score = 0;

  this.turncounter = 0;
  this.rowoffset = 0;

  // Images
  this.images = [];
  this.bubbleImage;

  // Image loading global variables
  this.loadcount = 0;
  this.loadtotal = 0;
  this.preloaded = false;

  // Load images
  this.images = this.loadImages(["images/bubble-sprites.png"]);
  this.bubbleImage = this.images[0];

  // Set the gamestate to ready
  this.setGameState(this.gamestates.ready);

  // Create the level
  this.level.createLevel();

  // Init the next bubble and set the current bubble
  this.player.createNextBubble();
  // this.player.createNextBubble();
}

Game.prototype.main = function() {
  
  var that = this;
  
  // Request animation frames
  window.requestAnimationFrame(function () {
    that.ui.render();
    that.update();
    that.main();
  });
}

// Update the game state
Game.prototype.update = function() {
  var dt = 0.004;

  if (this.gamestate == this.gamestates.ready) {
    // Game is ready for player input
  } else if (this.gamestate == this.gamestates.shootbubble) {
    // Bubble is moving
    this.ui.stateShootBubble(dt);
  } else if (this.gamestate == this.gamestates.removecluster) {
    // Remove cluster and drop tiles
    this.tile.stateRemoveCluster(dt);
  }
}

Game.prototype.setGameState = function(newgamestate) {
  this.gamestate = newgamestate;

  this.ui.animationState = 0;
  this.ui.animationTime = 0;
}

// Get a random int between low and high, inclusive
Game.prototype.randRange = function (low, high) {
  return Math.floor(low + Math.random() * (high - low + 1));
}

// Get the mouse position
Game.prototype.getMousePos = function (canvas, e) {
  var rect = this.canvas.getBoundingClientRect();
  return {
    x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width),
    y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height)
  };
}

// On mouse movement
Game.prototype.onMouseMove = function(e) {
  // Get the mouse position
  var pos = this.getMousePos(this.canvas, e);

  // Get the mouse angle
  var mouseangle = this.ui.radToDeg(Math.atan2((this.player.bubble.y + this.level.tileHeight / 2) - pos.y, pos.x - (this.player.bubble.x + this.level.tileWidth / 2)));

  // Convert range to 0, 360 degrees
  if (mouseangle < 0) {
    mouseangle = 180 + (180 + mouseangle);
  }

  // Restrict angle to 8, 172 degrees
  var lbound = 8;
  var ubound = 172;
  if (mouseangle > 90 && mouseangle < 270) {
    // Left
    if (mouseangle > ubound) {
      mouseangle = ubound;
    }
  } else {
    // Right
    if (mouseangle < lbound || mouseangle >= 270) {
      mouseangle = lbound;
    }
  }

  // Set the player angle
  this.player.angle = mouseangle;

}

// On mouse button click
Game.prototype.onMouseDown = function(e) {
  // Get the mouse position
  var pos = this.getMousePos(this.canvas, e);

  if (this.gamestate == this.gamestates.ready) {
    this.player.shootBubble();
  } else if (this.gamestate == this.gamestates.gameover) {
    this.newGame();
  }
}

// Load images
Game.prototype.loadImages = function (imagefiles) {
  // Initialize variables
  var loadcount = 0;
  var loadtotal = imagefiles.length;
  var preloaded = false;

  // Load the images
  var loadedimages = [];
  for (var i = 0; i < imagefiles.length; i++) {
    // Create the image object
    var image = new Image();

    // Add onload event handler
    image.onload = function () {
      loadcount++;
      if (loadcount == loadtotal) {
        // Done loading
        preloaded = true;
      }
    };

    // Set the source url of the image
    image.src = imagefiles[i];

    // Save to the image array
    loadedimages[i] = image;
  }

  // Return an array of images
  return loadedimages;
}

Game.prototype.stateRemoveCluster = function (dt) {
  if (this.ui.animationState == 0) {
    this.level.resetRemoved();

    // Mark the tiles as removed
    for (var i = 0; i < cluster.length; i++) {
      // Set the removed flag
      this.ui.cluster[i].removed = true;
    }

    // Add cluster score
    this.score += this.ui.cluster.length * 100;

    // Find floating clusters
    floatingclusters = this.findFloatingClusters();

    if (this.ui,floatingclusters.length > 0) {
      // Setup drop animation
      for (var i = 0; i < this.ui.floatingclusters.length; i++) {
        for (var j = 0; j < this.ui.floatingclusters[i].length; j++) {
          var tile = this.ui.floatingclusters[i][j];
          tile.shift = 0;
          tile.shift = 1;
          tile.velocity = this.player.bubble.dropspeed;

          this.score += 100;
        }
      }
    }

    this.ui.animationState = 1;
  }

  if (this.ui.animationState == 1) {
    // Pop bubbles
    var tilesleft = false;
    for (var i = 0; i < this.cluster.length; i++) {
      var tile = this.cluster[i];

      if (tile.type >= 0) {
        tilesleft = true;

        // Alpha animation
        tile.alpha -= dt * 15;
        if (tile.alpha < 0) {
          tile.alpha = 0;
        }

        if (tile.alpha == 0) {
          tile.type = -1;
          tile.alpha = 1;
        }
      }
    }

    // Drop bubbles
    for (var i = 0; i < this.ui.floatingclusters.length; i++) {
      for (var j = 0; j < this.ui.floatingclusters[i].length; j++) {
        var tile = this.ui.floatingclusters[i][j];

        if (tile.type >= 0) {
          tilesleft = true;

          // Accelerate dropped tiles
          tile.velocity += dt * 700;
          tile.shift += dt * tile.velocity;

          // Alpha animation
          tile.alpha -= dt * 8;
          if (tile.alpha < 0) {
            tile.alpha = 0;
          }

          // Check if the bubbles are past the bottom of the level
          if (tile.alpha == 0 || (tile.y * this.level.rowHeight + tile.shift > (this.level.rows - 1) * this.level.rowHeight + this.level.tileHeight)) {
            tile.type = -1;
            tile.shift = 0;
            tile.alpha = 1;
          }
        }

      }
    }

    if (!tilesleft) {
      // Next bubble
      this.player.createNextBubble();

      // Check for game over
      var tilefound = false
      for (var i = 0; i < this.level.columns; i++) {
        for (var j = 0; j < this.level.rows; j++) {
          if (this.level.tiles[i][j].type != -1) {
            tilefound = true;
            break;
          }
        }
      }

      if (tilefound) {
        this.setGameState(this.gamestates.ready);
      } else {
        // No tiles left, game over
        this.setGameState(this.gamestates.gameover);
      }
    }
  }
}
