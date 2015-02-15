var floor = Math.floor;
var random = Math.random;

window.init = function(canvas) {

	var canvasWidth			= canvas.width;
	var canvasHeight 		= canvas.height;
	var ctx 				= canvas.getContext('2d');

	var tileSize			= 16;
	var tileSize			= 16;
	var halfTileSize 		= 8;
	var screenTilesWide 	= canvasWidth / tileSize;
	var screenTilesHigh		= canvasHeight / tileSize;

	var map = {
		width 	: 100,
		height 	: 100,
		tiles 	: []
	};

	var playerPos 			= { x: 5, y: 4 };
	var playerHealth		= 100;

	var itemSelectIndex		= 0;

	//
	// Drawing

	function fillCircle(cx, cy, radius, color) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
		ctx.fill();
	}

	function fillCircleAtScreenTile(tx, ty, tileSizeDelta, color) {
		fillCircle(
			tx * tileSize + halfTileSize, 
			ty * tileSize + halfTileSize,
			halfTileSize + tileSizeDelta,
			color
		);
	}

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

	function canTileHoldItems(map, x, y) {
		return map.tiles[y][x] === 0;
	}

	function findMoveableItemsAtPosition(map, x, y) {
		var out = [];
		for (var i = 0; i < entities.length; ++i) {
			var e = entities[i];
			if (e.position && e.position.x === x && e.position.y === y) {
				out.push(e);
			}
		}
		return out;
	}
	
	//
	// Keyboard handling

	var keyMap 				= {};
	var keyState 			= {};

	function makeKey(name, keyCode) {
		keyMap[keyCode] = name;
		keyState[name] = {
			isDown: false,
			wentDown: false,
			halfTxCount: 0
		};
	}

	function resetKeys() {
		for (var k in keyState) {
			keyState[k].halfTxCount = 0;
			keyState[k].wentDown = false;
		}
	}

	makeKey('left',		37);
	makeKey('right', 	39);
	makeKey('up',		38);
	makeKey('down',		40);
	makeKey('tab',		9);
	makeKey('enter',	13);

	canvas.addEventListener('keydown', function(evt) {
		var name = keyMap[evt.which];
		if (name) {
			var state = keyState[name];
			if (state.isDown) {
				// this is a repeat; do nothing
			} else {
				state.isDown = true;
				state.wentDown = true;
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
	// Game objects

	var entities = [];

	var possibleObjects = [
		'green',
		'blue',
		'purple',
		'red',
		'yellow',
		'orange',
		'white'
	];

	for (var i = 0; i < 20; ++i) {
		do {
			if (i < 3) {
				itemX = 5;
				itemY = 5;
			} else {
				itemX = floor(random() * map.width);
				itemY = floor(random() * map.height);	
			}
		} while (!canTileHoldItems(map, itemX, itemY));
		var item = {
			color: possibleObjects[floor(random() * possibleObjects.length)],
			position: {
				x: itemX,
				y: itemY
			}
		};
		entities.push(item);
	}

	//
	//

	function draw() {

		//
		// camera bounds

		var cameraCenterX = playerPos.x;
		var cameraCenterY = playerPos.y;
		var cameraTopLeftX = cameraCenterX - (Math.floor(screenTilesWide * 0.5));
		var cameraTopLeftY = cameraCenterY - (Math.floor(screenTilesHigh * 0.5));
		var cameraBottomRightX = cameraTopLeftX + screenTilesWide;
		var cameraBottomRightY = cameraTopLeftY + screenTilesHigh;

		var drawStartX = 0;
		var drawStartY = 0;

		var topLeftX = cameraTopLeftX;
		if (topLeftX < 0) {
			drawStartX = -topLeftX * tileSize;
			topLeftX = 0;
		}

		var topLeftY = cameraTopLeftY;
		if (topLeftY < 0) {
			drawStartY = -topLeftY * tileSize;
			topLeftY = 0;
		}

		var bottomRightX = cameraTopLeftX + screenTilesWide;
		var bottomRightY = cameraTopLeftY + screenTilesHigh;

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
		// Draw entities

		for (var ix = 0; ix < entities.length; ++ix) {
			var entity = entities[ix];
			if (entity.position) {
				if (entity.position.x >= cameraTopLeftX
					&& entity.position.x < cameraBottomRightX
					&& entity.position.y >= cameraTopLeftY
					&& entity.position.y < cameraBottomRightY) {
					var ex = entity.position.x - cameraTopLeftX;
					var ey = entity.position.y - cameraTopLeftY;
					fillCircleAtScreenTile(ex, ey, -3, entity.color);
				}
			}
		}

		//
		// Draw player

		var pox = playerPos.x - cameraTopLeftX;
		var poy = playerPos.y - cameraTopLeftY;

		fillCircleAtScreenTile(pox, poy, -1, 'black');

		//
		// Draw items under player

		var itemsAtPlayer = findMoveableItemsAtPosition(map, playerPos.x, playerPos.y);
		if (itemsAtPlayer.length) {
			var panelWidth =
				5 +
				(itemsAtPlayer.length * tileSize) +
				((itemsAtPlayer.length - 1) * 3) +
				5;
			var panelHeight = 5 + tileSize + 5;
			var panelLeft = canvasWidth - 5 - panelWidth;
			var panelTop = canvasHeight - 5 - panelHeight;
			var drawLeft = panelLeft + 5 + halfTileSize;
			var drawTop = panelTop + 5 + halfTileSize;
			ctx.fillStyle = 'white';
			ctx.fillRect(panelLeft, panelTop, panelWidth, panelHeight);
			for (var ix = 0; ix < itemsAtPlayer.length; ++ix) {
				fillCircle(drawLeft, drawTop, tileSize * 0.5 - 3, itemsAtPlayer[ix].color);
				drawLeft += tileSize + 3;
			}
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 1;
			if (itemSelectIndex >= itemsAtPlayer.length) {
				itemSelectIndex = 0;
			}
			ctx.strokeRect(
				panelLeft + 4 + (itemSelectIndex * (tileSize + 3)),
				panelTop + 4,
				tileSize + 2,
				tileSize + 2
			);
		}

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

		if (keyState.tab.wentDown) {
			var items = findMoveableItemsAtPosition(map, playerPos.x, playerPos.y);
			itemSelectIndex++;
			if (itemSelectIndex >= items.length) {
				itemSelectIndex = 0;
			}
		} else if (keyState.enter.wentDown) {
			var items = findMoveableItemsAtPosition(map, playerPos.x, playerPos.y);
			var item = items[itemSelectIndex];
			if (item) {
				item.position = null;
				item.carriedByPlayer = true;
				itemSelectIndex = Math.max(0, itemSelectIndex - 1);
			}
		}

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

