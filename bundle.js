(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/my-sites/jf/gamedev/projects/roguelike/init.js":[function(require,module,exports){
var floor = Math.floor;

window.init = function(canvas) {

	var canvasWidth			= canvas.width;
	var canvasHeight 		= canvas.height;
	var ctx 				= canvas.getContext('2d');

	var tileWidth			= 16;
	var tileHeight			= 16;
	var screenTilesWide 	= canvasWidth / tileWidth;
	var screenTilesHigh		= canvasHeight / tileHeight;

	var map = {
		width 	: 100,
		height 	: 100,
		tiles 	: []
	};

	var playerPos 			= { x: 5, y: 4 };

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
		return map.tiles[y][x] !== 0;
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
					map.tiles[row][col] = 0;
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

		var topLeftX = cameraX - (Math.floor(screenTilesWide * 0.5));
		var topLeftY = cameraY - (Math.floor(screenTilesHigh * 0.5));

		if (topLeftX < 0) {
			drawStartX = -topLeftX * tileWidth;
			topLeftX = 0;
		}

		if (topLeftY < 0) {
			drawStartY = -topLeftY * tileHeight;
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
				if (y === playerPos.y && x === playerPos.x) {
					ctx.fillStyle = 'red';
				} else {
					var tileToDraw = map.tiles[y][x];
					ctx.fillStyle = tileToDraw == 0 ? '#e0e0e0' : '#707070';	
				}
				ctx.fillRect(drawX, drawY, tileWidth, tileHeight);
				drawX += tileWidth;
			}
			drawY += tileHeight;
		}

	}

	setInterval(function() {

		if (keyState.left.isDown)	tryMove(map, playerPos, -1, 0);
		if (keyState.right.isDown)	tryMove(map, playerPos, 1, 0);
		if (keyState.up.isDown)		tryMove(map, playerPos, 0, -1);
		if (keyState.down.isDown)	tryMove(map, playerPos, 0, 1);

		resetKeys();

		draw();
	
	}, 100);

	canvas.focus();

}


},{}]},{},["/Users/jason/dev/my-sites/jf/gamedev/projects/roguelike/init.js"]);
