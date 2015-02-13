(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/my-sites/jf/gamedev/projects/roguelike/init.js":[function(require,module,exports){
var floor = Math.floor;

window.init = function(canvas) {

	var canvasWidth			= canvas.width;
	var canvasHeight 		= canvas.height;
	var ctx 				= canvas.getContext('2d');

	var tileSize			= 16;
	var tileSize			= 16;
	var screenTilesWide 	= canvasWidth / tileSize;
	var screenTilesHigh		= canvasHeight / tileSize;

	var map = {
		width 	: 100,
		height 	: 100,
		tiles 	: []
	};

	var playerPos 			= { x: 5, y: 4 };
	var playerHealth		= 100;

	//
	// Functions

	function tryMove(map, currentPosition, dx, dy) {
		var newX = currentPosition.x + dx;
		var newY = currentPosition.y + dy;
		if (newX < 0 || newX >= map.width || newY < 0 || newY >= map.height) {
			return false;
		} else if (!isTileBlocked(map, newX, newY)) {
			currentPosition.x = newX;
			currentPosition.y = newY;
			return true;
		} else {
			return false;
		}
	}

	function isTileBlocked(map, x, y) {
		return map.tiles[y][x] === 1;
	}
	
	//
	// Keyboard handling

	var keyMap 				= {};
	var keyState 			= {};

	function makeKey(name, keyCode) {
		keyMap[keyCode] = name;
		keyState[name] = {
			isDown: false,
			halfTxCount: 0
		};
	}

	function resetKeys() {
		for (var k in keyState) {
			keyState[k].halfTxCount = 0;
		}
	}

	makeKey('left',		37);
	makeKey('right', 	39);
	makeKey('up',		38);
	makeKey('down',		40);

	canvas.addEventListener('keydown', function(evt) {
		var name = keyMap[evt.which];
		if (name) {
			var state = keyState[name];
			if (state.isDown) {
				// this is a repeat; do nothing
			} else {
				state.isDown = true;
				state.halfTxCount++;
			}
		}
		evt.preventDefault();
	});

	canvas.addEventListener('keyup', function(evt) {
		var name = keyMap[evt.which];
		if (name) {
			var state = keyState[name];
			state.isDown = false;
			state.halfTxCount++;
		}
		evt.preventDefault();
	});

	//
	// Create empty map

	for (var i = 0; i < map.height; ++i) {
		var mapRow = [];
		for (var j = 0; j < map.width; ++j) {
			mapRow.push(1);
		}
		map.tiles.push(mapRow);
	}

	//
	// Generate map
	// Let's just start with a grid of rooms

	var placeX = 1;
	var placeY = 1;
	var roomWidth = 9;
	var roomHeight = 7;
	var doorLeft = false;
	var doorUp = false;

	while (placeY + roomHeight < map.height) {
		placeX = 1;
		doorLeft = false;
		while (placeX + roomWidth < map.width) {
			if (doorLeft) {
				map.tiles[placeY+floor(roomHeight/2)][placeX-1] = 0;
			}
			if (doorUp) {
				map.tiles[placeY-1][placeX+floor(roomWidth/2)] = 0;
			}
			for (var row = placeY; row < placeY + roomHeight; ++row) {
				for (var col = placeX; col < placeX + roomWidth; ++col) {
					var tile = Math.random() < (1 / 30) ? 2 : 0;
					map.tiles[row][col] = tile;
				}
			}
			doorLeft = true;
			placeX += roomWidth + 1;
		}
		doorUp = true;
		placeY += roomHeight + 1;
	}

	//
	//

	function draw() {

		var cameraX = playerPos.x;
		var cameraY = playerPos.y;

		var drawStartX = 0;
		var drawStartY = 0;

		var screenTopLeftX = cameraX - (Math.floor(screenTilesWide * 0.5));
		var screenTopLeftY = cameraY - (Math.floor(screenTilesHigh * 0.5));

		var topLeftX = screenTopLeftX;
		if (topLeftX < 0) {
			drawStartX = -topLeftX * tileSize;
			topLeftX = 0;
		}

		var topLeftY = screenTopLeftY;
		if (topLeftY < 0) {
			drawStartY = -topLeftY * tileSize;
			topLeftY = 0;
		}

		var bottomRightX = topLeftX + screenTilesWide;
		var bottomRightY = topLeftY + screenTilesHigh;

		if (bottomRightX > map.width) {
			bottomRightX = map.width;
		}

		if (bottomRightY > map.height) {
			bottomRightY = map.height;
		}

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		var drawY = drawStartY;
		for (var y = topLeftY; y < bottomRightY; ++y) {
			var drawX = drawStartX;
			for (var x = topLeftX; x < bottomRightX; ++x) {
				var tileColor;
				var tileToDraw = map.tiles[y][x];
				if (tileToDraw === 0) {
					tileColor = '#e0e0e0';
				} else if (tileToDraw === 1) {
					tileColor = '#707070';
				} else if (tileToDraw === 2) {
					tileColor = 'red';
				}
				ctx.fillStyle = tileColor;
				ctx.fillRect(drawX, drawY, tileSize, tileSize);
				drawX += tileSize;
			}
			drawY += tileSize;
		}

		//
		// Draw player

		var pox = playerPos.x - screenTopLeftX;
		var poy = playerPos.y - screenTopLeftY;

		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.arc(
			pox * tileSize + (tileSize * 0.5),
			poy * tileSize + (tileSize * 0.5),
			tileSize * 0.5 - 1,
			Math.PI * 2,
			false
		);
		ctx.fill();

		//
		// Draw stats

		ctx.fillStyle = 'red';
		var healthBarY = canvas.height - 13;
		var healthBarX = 10;
		ctx.fillRect(healthBarX, healthBarY, playerHealth / 2, 3);

	}

	setInterval(function() {

		if (keyState.left.isDown)	tryMove(map, playerPos, -1, 0);
		if (keyState.right.isDown)	tryMove(map, playerPos, 1, 0);
		if (keyState.up.isDown)		tryMove(map, playerPos, 0, -1);
		if (keyState.down.isDown)	tryMove(map, playerPos, 0, 1);

		if (map.tiles[playerPos.y][playerPos.x] === 2) {
			playerHealth -= 1;
			if (playerHealth <= 0) {
				// TODO: kill, restart?
				playerHealth = 0;
			}
		}

		resetKeys();

		draw();
	
	}, 100);

	canvas.focus();

}


},{}]},{},["/Users/jason/dev/my-sites/jf/gamedev/projects/roguelike/init.js"]);
