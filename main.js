var io = require('socket.io-client');

var socket = io('http://botws.generals.io');

var chatTools = require('./chatTools');
socket.on('disconnect', function() {
	console.error('Disconnected from server.');
	process.exit(1);
});

socket.on('connect', function() {
	console.log('Connected to server.');

	
	var user_id = 'VikingBot';
	var username = 'VikingBot';
	console.log(username);
	// Set the username for the bot.
	socket.emit('set_username', user_id, username);

	// Join a custom game and force start immediately.
	var custom_game_id = 'vikingBotPlayground';
	socket.emit('join_private', custom_game_id, user_id);
	socket.emit('set_force_start', custom_game_id, true);
	console.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(custom_game_id));
});

var TILE_EMPTY = -1;
var TILE_MOUNTAIN = -2;
var TILE_FOG = -3;
var TILE_FOG_OBSTACLE = -4; // Cities and Mountains show up as Obstacles in the fog of war.

// Game data.
var playerIndex;
var generals; // The indicies of generals we have vision of.
var cities = []; // The indicies of cities we have vision of.
var map = [];
var currentTurnCounter = 0;
/* Returns a new array created by patching the diff into the old array.
 * The diff formatted with alternating matching and mismatching segments:
 * <Number of matching elements>
 * <Number of mismatching elements>
 * <The mismatching elements>
 * ... repeated until the end of diff.
 * Example 1: patching a diff of [1, 1, 3] onto [0, 0] yields [0, 3].
 * Example 2: patching a diff of [0, 1, 2, 1] onto [0, 0] yields [2, 0].
 */
function patch(old, diff) {
	var out = [];
	var i = 0;
	while (i < diff.length) {
		if (diff[i]) {  // matching
			Array.prototype.push.apply(out, old.slice(out.length, out.length + diff[i]));
		}
		i++;
		if (i < diff.length && diff[i]) {  // mismatching
			Array.prototype.push.apply(out, diff.slice(i + 1, i + 1 + diff[i]));
			i += diff[i];
		}
		i++;
	}
	return out;
}
var chatRoom;
var generalNames;
var messageCounter=0;
var messageTarget = 30;
socket.on('game_start', function(data) {
	// Get ready to start playing the game.
	playerIndex = data.playerIndex;
	var replay_url = 'http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id);
	
	console.log('Game starting! The replay will be available after the game at ' + replay_url);
	chatRoom = data.chat_room;
	generalNames = data.usernames;

	// say a friendly message at the start of the game
	var startingMessage = chatTools.getStartingString();
	socket.emit('chat_message',chatRoom,startingMessage);

	//reset the message counter
	messageCounter=0;
});

socket.on('game_update', function(data) {
	currentTurnCounter++;
	// Patch the city and map diffs into our local variables.
	cities = patch(cities, data.cities_diff);
	map = patch(map, data.map_diff);
	generals = data.generals;

	messageCounter++;
	if (messageCounter>=messageTarget){
		//reset the message counters
		messageCounter = 0;
		var newMaxCounter = Math.floor(Math.random()*50)+50;
		messageTarget = newMaxCounter;

		//Say a friendly random message
		var leaveGameLost = chatTools.getRandomString();
		socket.emit('chat_message',chatRoom,leaveGameLost);
	}
	// The first two terms in |map| are the dimensions.
	var width = map[0];
	var height = map[1];
	var size = width * height;

	// The next |size| terms are army values.
	// armies[0] is the top-left corner of the map.
	var armies = map.slice(2, size + 2);

	// The last |size| terms are terrain values.
	// terrain[0] is the top-left corner of the map.
	var terrain = map.slice(size + 2, size + 2 + size);

	var ourGeneral = generals[playerIndex];

	/*
		VikingBot:
		Strategy for the bot: 
		we want to do the following moves in order of importance
			1 - if we can see a general, attack it
			2 - if we can't, move onto an enemy player's tile
			3 - if we can't see enemy players, move onto blank tiles
			4 - if we can't make any moves like this, move high army tiles to low army tiles. if we can see an enemy tile, move half when using the general tile
			5 - failing that, make a random move
			6 - if we are well and truly stuck, do nothing 
	*/
	// first of all, can we see a general?

	// to be implemented later

	// can we see an enemy tile?
	var canSeeEnemy = false;
	var enemyTiles = [];
	var friendlyTiles = [];
	for(let x=0;x<terrain.length;x++){
		// first check is this their tile?
		if (terrain[x] != playerIndex && terrain[x] > 0) {
			canSeeEnemy=true;
			enemyTiles.push(x);
			continue;
		}

		// otherwise is it ours?
		if (terrain[x] === playerIndex) {
			friendlyTiles.push(x);
			continue;
		}
	}
	// can we move onto any of those enemy tiles?
	for(let i=0;i<enemyTiles.length;i++){
		var enemyTileIndex = enemyTiles[i];

		var row = Math.floor(enemyTileIndex / width);
		var col = enemyTileIndex % width;
		var nextDoorTileIndex = enemyTileIndex;

		// check above tile
		var aboveTileIndex = enemyTileIndex+width; 
		if (row > 0){
			if(terrain[aboveTileIndex] === playerIndex && armies[aboveTileIndex]>1){
				// we have a move on our hands
				socket.emit('attack', aboveTileIndex, enemyTileIndex);
				return;
			}
		}


		// check below tile
		var belowTileIndex = enemyTileIndex-width;
		if(col < width - 1){
			if(terrain[belowTileIndex] === playerIndex && armies[belowTileIndex]>1){
				// we have a move on our hands
				socket.emit('attack', belowTileIndex, enemyTileIndex);
				return;
			}
		}


		// check left tile
		var leftTileIndex = enemyTileIndex-1;
		if(row > 0){
			if(terrain[leftTileIndex] === playerIndex && armies[leftTileIndex]>1){
				// we have a move on our hands
				socket.emit('attack', leftTileIndex, enemyTileIndex);
				return;
			}
		}
		// check right tile
		var rightTileIndex = enemyTileIndex+1;
		if(col < width - 1){
			if(terrain[rightTileIndex] === playerIndex && armies[rightTileIndex]>1){
				// we have a move on our hands
				socket.emit('attack', rightTileIndex, enemyTileIndex);
				return;
			}
		}
	}

	// can we move onto a blank tile?
	for(let x=0;x<terrain.length;x++){
		// the first check is is this a blank tile
		if (terrain[x] === TILE_EMPTY) {
			var blankTileIndex = x;

			var row = Math.floor(blankTileIndex / width);
			var col = blankTileIndex % width;
			var nextDoorTileIndex = blankTileIndex;

			// check above tile
			var aboveTileIndex = blankTileIndex+width; 
			if (row > 0){
				if(terrain[aboveTileIndex] === playerIndex && armies[aboveTileIndex]>1){
					// we have a move on our hands
					socket.emit('attack', aboveTileIndex, blankTileIndex);
					return;
				}
			}

			// check below tile
			var belowTileIndex = blankTileIndex-width;
			if(col < width - 1){
				if(terrain[belowTileIndex] === playerIndex && armies[belowTileIndex]>1){
					// we have a move on our hands
					socket.emit('attack', belowTileIndex, blankTileIndex);
					return;
				}
			}

			// check left tile
			var leftTileIndex = blankTileIndex-1;
			if(row > 0){
				if(terrain[leftTileIndex] === playerIndex && armies[leftTileIndex]>1){
					// we have a move on our hands
					socket.emit('attack', leftTileIndex, blankTileIndex);
					return;
				}
			}

			// check right tile
			var rightTileIndex = blankTileIndex+1;
			if(col < width - 1){
				if(terrain[rightTileIndex] === playerIndex && armies[rightTileIndex]>1){
					// we have a move on our hands
					socket.emit('attack', rightTileIndex, blankTileIndex);
					return;
				}
			}
		}
	}

	//
	//	4 - if we can't make any moves like this, move high army tiles to low army tiles, dont move onto our general
	//

	// order friendlyTiles by army size on that tile
	friendlyTiles.sort(function(b,a){
		// a is the index of the first tile
		// b is the index of the second tile
		return armies[a]-armies[b];
	});


	for(let i=0;i<friendlyTiles.length;i++){
		var ourTileIndex = friendlyTiles[i];
		var armyHere = armies[ourTileIndex];
		var row = Math.floor(blankTileIndex / width);
		var col = blankTileIndex % width;
		var nextDoorTileIndex = blankTileIndex;
		var rand = Math.random();

		// check above tile
		var aboveTileIndex = ourTileIndex+width; 
		if (row > 0 && rand < 0.25){
			if(terrain[aboveTileIndex] === playerIndex && armies[aboveTileIndex]<armyHere && aboveTileIndex!==ourGeneral){
				// we have a move on our hands
				socket.emit('attack', ourTileIndex, aboveTileIndex);
				return;
			}
		}

		// check below tile
		var belowTileIndex = ourTileIndex-width;
		if(col < width - 1 && rand < 0.5){
			if(terrain[belowTileIndex] === playerIndex && armies[belowTileIndex]<armyHere && aboveTileIndex!==ourGeneral){
				// we have a move on our hands
				socket.emit('attack', ourTileIndex, belowTileIndex);
				return;
			}
		}

		// check left tile
		var leftTileIndex = ourTileIndex-1;
		if(row > 0 && rand < 0.75){
			if(terrain[leftTileIndex] === playerIndex && armies[leftTileIndex]<armyHere && aboveTileIndex!==ourGeneral){
				// we have a move on our hands
				socket.emit('attack', ourTileIndex, leftTileIndex);
				return;
			}
		}

		// check right tile
		var rightTileIndex = ourTileIndex+1;
		if(col < width - 1){
			if(terrain[rightTileIndex] === playerIndex && armies[rightTileIndex]<armyHere && aboveTileIndex!==ourGeneral){
				// we have a move on our hands
				socket.emit('attack', ourTileIndex, rightTileIndex);
				return;
			}
		}
	}

	console.log("Failure to find a valid move");
	//
	// 5 - failing that, make a random move.
	//
	while (true) {
		// Pick a random tile.
		var index = Math.floor(Math.random() * size);

		// If we own this tile, make a random move starting from it.
		if (terrain[index] === playerIndex) {
			var row = Math.floor(index / width);
			var col = index % width;
			var endIndex = index;

			var rand = Math.random();
			if (rand < 0.25 && col > 0) { // left
				endIndex--;
			} else if (rand < 0.5 && col < width - 1) { // right
				endIndex++;
			} else if (rand < 0.75 && row < height - 1) { // down
				endIndex += width;
			} else if (row > 0) { //up
				endIndex -= width;
			} else {
				continue;
			}

			// Would we be attacking a city? Don't attack cities.
			if (cities.indexOf(endIndex) >= 0) {
				continue;
			}

			socket.emit('attack', index, endIndex);
			break;
		}
	}
});

function leaveGameLost() {
	// Send a friendly message
	var leaveGameLost = chatTools.getLosingString();
	socket.emit('chat_message',chatRoom,leaveGameLost);

	console.log("Generals involved: "+generalNames);
	socket.emit('leave_game');
}

function leaveGameWon() {
	// Send a friendly message
	var leaveGameWon = chatTools.getWinningString();
	socket.emit('chat_message',chatRoom,leaveGameLost);

	console.log("Generals involved: "+generalNames);
	socket.emit('leave_game');
}

socket.on('game_lost', leaveGameLost);

socket.on('game_won', leaveGameWon);