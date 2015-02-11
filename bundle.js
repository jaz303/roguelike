(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/my-sites/jf/gamedev/projects/roguelike/init.js":[function(require,module,exports){
window.init = function(canvas) {

	var canvasWidth			= canvas.width;
	var canvasHeight 		= canvas.height;
	var ctx 				= canvas.getContext('2d');

	var tileWidth			= 16;
	var tileHeight			= 16;
	var screenTilesWide 	= canvasWidth / tileWidth;
	var screenTilesHigh		= canvasHeight / tileHeight;

	var mapWidth 			= 100;
	var mapHeight 			= 100;

	var playerPos 			= { x: 0, y: 0 };

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
	});

	canvas.addEventListener('keyup', function(evt) {
		var name = keyMap[evt.which];
		if (name) {
			var state = keyState[name];
			state.isDown = false;
			state.halfTxCount++;
		}
	});

	//
	//
	
	var map = [];
	for (var i = 0; i < mapHeight; ++i) {
		var mapRow = [];
		for (var j = 0; j < mapWidth; ++j) {
			mapRow.push(Math.random() > 0.5 ? 1 : 0);
		}
		map.push(mapRow);
	}

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

		if (bottomRightX > mapWidth) {
			bottomRightX = mapWidth;
		}

		if (bottomRightY > mapHeight) {
			bottomRightY = mapHeight;
		}

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		var drawY = drawStartY;
		for (var y = topLeftY; y < bottomRightY; ++y) {
			var drawX = drawStartX;
			for (var x = topLeftX; x < bottomRightX; ++x) {
				if (y === playerPos.y && x === playerPos.x) {
					ctx.fillStyle = 'red';
				} else {
					var tileToDraw = map[y][x];
					ctx.fillStyle = tileToDraw == 1 ? '#e0e0e0' : '#707070';	
				}
				ctx.fillRect(drawX, drawY, tileWidth, tileHeight);
				drawX += tileWidth;
			}
			drawY += tileHeight;
		}

	}

	setInterval(function() {

		if (keyState.left.isDown)	playerPos.x = Math.max(0, playerPos.x - 1);
		if (keyState.right.isDown)	playerPos.x = Math.min(mapWidth - 1, playerPos.x + 1);
		if (keyState.up.isDown)		playerPos.y = Math.max(0, playerPos.y - 1);
		if (keyState.down.isDown)	playerPos.y = Math.min(mapHeight - 1, playerPos.y + 1);

		resetKeys();

		draw();
	
	}, 100);

	canvas.focus();

}


},{}]},{},["/Users/jason/dev/my-sites/jf/gamedev/projects/roguelike/init.js"]);
