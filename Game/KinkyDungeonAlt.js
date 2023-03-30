"use strict";

let KDJourneyMapMod = {
	"Random": true,
};

let KDDefaultMaxFlags = {
	goldchest: 1,
	lessergold: 1,
	silverchest: 2,
	darkchest: 2,
	redchest: 6,
	bluechest: 2,
	forbidden: 1,
	artifact: 2,
	jail: 2,
	playroom: 4,
	supplydepot: 1,
	barracks: 2,
	robotroom: 3,
	laboratory: 1,
	library: 1,
	armory: 1,
	workshop: 2,
	tinker: 1,
	office: 3,
	worship: 1,
	graveyard: 2,
	well: 3,
	wildlife: 2,
	range: 2,
	arena: 1,
	arena_boss: 1,
	arena_miniboss: 5,
	slimespawn: 3,
	beastspawn: 3,
	magicspawn: 3,
	robotspawn: 3,
};

let alts = {
	"Tunnel": {
		name: "Tunnel",
		bossroom: false,
		width: 8,
		height: 8,
		genType: "Tunnel",
		spawns: false,
		chests: false,
		shrines: false,
		orbs: 0,
		setpieces: {
		},
		chargers: false,
		notorches: false,
		heart: false,
		specialtiles: true,
		shortcut: false,
		enemies: false,
		nojail: true,
		nolore: true,
		nokeys: true,
		nostairs: true,
		notraps: true,
		noClutter: true,
		noShrineTypes: ["Commerce", "Will"],
		tickFlags: true,
		noMusic: true,
		keepMainPath: true,
	},
	"PerkRoom": {
		name: "PerkRoom",
		bossroom: false,
		width: 9,
		height: 8,
		genType: "PerkRoom",
		setpieces: {
			"PearlChest": 100,
		},
		spawns: false,
		chests: false,
		shrines: false,
		orbs: 0,
		chargers: false,
		notorches: false,
		heart: false,
		specialtiles: true,
		shortcut: false,
		enemies: false,
		nojail: true,
		nolore: true,
		nokeys: true,
		nostairs: true,
		notraps: true,
		noClutter: true,
		noShrineTypes: ["Commerce", "Will"],
		noMusic: true,
		keepMainPath: true,
	},
	"Jail": {
		name: "Jail",
		bossroom: false,
		width: 15,
		height: 15,
		enemyMult: 0.6,
		setpieces: {
			"GuaranteedCell": 100,
			"ExtraCell": 20,
			"Bedroom": 10,
			"QuadCell": 7,
			"Storage": 12,
		},
		bonusTags: {
			"construct": {bonus: 0, mult: 0},
		},
		genType: "NarrowMaze",
		spawns: false,
		chests: false,
		shrines: true,
		orbs: 0,
		chargers: true,
		notorches: false,
		heart: false,
		specialtiles: true,
		shortcut: false,
		enemies: true,
		nojail: false,
		nokeys: true,
		nostairs: false,
		notraps: false,
		noRelease: true,
		releaseOnLowSec: true,
		noShrineTypes: ["Commerce"],
	},
	"DollRoom": {
		name: "DollRoom",
		noWear: true, // Disables doodad wear
		bossroom: false,
		width: 15,
		height: 10,
		nopatrols: true,
		setpieces: {
		},
		data: {
			dollroom: true,
		},
		genType: "DollRoom",
		spawns: false,
		chests: false,
		shrines: false,
		orbs: 0,
		chargers: false,
		notorches: true,
		heart: false,
		specialtiles: false,
		shortcut: false,
		enemies: false,
		nojail: true,
		nokeys: true,
		nostairs: true,
		nostartstairs: true,
		notraps: false,
		noClutter: true,
		nobrick: true,
		nolore: true,
		noboring: true, // Skip generating boringness
	},

	"TestTile": {
		name: "TestTile",
		noWear: true, // Disables doodad wear
		bossroom: false,
		width: 15,
		height: 10,
		//nopatrols: true,
		setpieces: {
		},
		genType: "TestTile",
		spawns: true,
		chests: false,
		shrines: false,
		orbs: 0,
		chargers: false,
		notorches: true,
		heart: false,
		specialtiles: false,
		shortcut: false,
		enemies: true,
		nojail: true,
		nokeys: true,
		nostairs: true,
		nostartstairs: true,
		notraps: false,
		noClutter: true,
		nobrick: true,
		nolore: true,
		noboring: true, // Skip generating boringness
	},
	"JourneyFloor": {
		name: "JourneyFloor",
		bossroom: false,
		width: 10,
		height: 8,
		setpieces: {
		},
		genType: "JourneyFloor",
		spawns: false,
		chests: false,
		shrines: false,
		orbs: 0,
		chargers: false,
		notorches: false,
		heart: false,
		specialtiles: false,
		shortcut: false,
		enemies: false,
		nojail: true,
		nokeys: true,
		nolore: true,
		nostairs: true,
		notraps: true,
		noClutter: true,
		skiptunnel: true, // Skip the ending tunnel
	},
	"ShopStart": {
		name: "ShopStart",
		bossroom: false,
		width: 10,
		height: 8,
		setpieces: {
		},
		genType: "ShopStart",
		spawns: false,
		chests: false,
		shrines: false,
		orbs: 0,
		chargers: false,
		notorches: false,
		heart: false,
		specialtiles: false,
		shortcut: false,
		enemies: false,
		nojail: true,
		nokeys: true,
		nolore: true,
		nostairs: true,
		notraps: true,
		noClutter: true,
		skiptunnel: true, // Skip the ending tunnel
	},
	"Tutorial": {
		name: "Tutorial",
		bossroom: false,
		width: 30,
		height: 7,
		setpieces: {
		},
		genType: "Tutorial",
		spawns: false,
		chests: false,
		shrines: false,
		orbs: 0,
		chargers: false,
		notorches: false,
		heart: false,
		specialtiles: false,
		shortcut: false,
		enemies: false,
		nojail: true,
		nokeys: true,
		nolore: true,
		nostairs: true,
		notraps: true,
		noClutter: true,
	},
};

let KDJourneyList = ["Random", "Harder", "Explorer", "Doll"];
if (param_test) KDJourneyList.push("Test");

function KinkyDungeonAltFloor(Type) {
	return alts[Type];
}


let KinkyDungeonCreateMapGenType = {
	"Room": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"JourneyFloor": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateJourneyFloor(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"ShopStart": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateShopStart(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"TestTile": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateTestTile(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"Tutorial": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateTutorial(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"Tunnel": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateTunnel(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"PerkRoom": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreatePerkRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"Chamber": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, 2, 1.5, 8, data);
	},
	"Maze": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"TileMaze": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateTileMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
	},
	"NarrowMaze": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, 0, 10, 0, data);
	},
	"DollRoom": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateDollRoom(POI, VisitedRooms, width, height, 0, 10, 0, data);
	},
	"Dollmaker": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
		KinkyDungeonCreateDollmaker(POI, VisitedRooms, width, height, 0, 10, 0, data);
	},
};


function KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	let Walls = {};
	let WallsList = {};
	let VisitedCells = {};

	// Initialize the first cell in our Visited Cells list
	if (KDDebug) console.log("Created maze with dimensions " + width + "x" + height + ", openness: "+ openness + ", density: "+ density);

	VisitedCells[VisitedRooms[0].x + "," + VisitedRooms[0].y] = {x:VisitedRooms[0].x, y:VisitedRooms[0].y};

	// Walls are basically even/odd pairs.
	for (let X = 2; X < width; X += 2)
		for (let Y = 1; Y < height; Y += 2)
			if (KinkyDungeonMapGet(X, Y) == '1') {
				Walls[X + "," + Y] = {x:X, y:Y};
			}
	for (let X = 1; X < width; X += 2)
		for (let Y = 2; Y < height; Y += 2)
			if (KinkyDungeonMapGet(X, Y) == '1') {
				Walls[X + "," + Y] = {x:X, y:Y};
			}

	// Setup the wallslist for the first room
	KinkyDungeonMazeWalls(VisitedRooms[0], Walls, WallsList);

	// Per a randomized primm algorithm from Wikipedia, we loop through the list of walls until there are no more walls

	let WallKeys = Object.keys(WallsList);
	//let CellKeys = Object.keys(VisitedCells);

	while (WallKeys.length > 0) {
		let I = Math.floor(KDRandom() * WallKeys.length);
		let wall = Walls[WallKeys[I]];
		let unvisitedCell = null;

		// Check if wall is horizontal or vertical and determine if there is a single unvisited cell on the other side of the wall
		if (wall.x % 2 == 0) { //horizontal wall
			if (!VisitedCells[(wall.x-1) + "," + wall.y]) unvisitedCell = {x:wall.x-1, y:wall.y};
			if (!VisitedCells[(wall.x+1) + "," + wall.y]) {
				if (unvisitedCell) unvisitedCell = null;
				else unvisitedCell = {x:wall.x+1, y:wall.y};
			}
		} else { //vertical wall
			if (!VisitedCells[wall.x + "," + (wall.y-1)]) unvisitedCell = {x:wall.x, y:wall.y-1};
			if (!VisitedCells[wall.x + "," + (wall.y+1)]) {
				if (unvisitedCell) unvisitedCell = null;
				else unvisitedCell = {x:wall.x, y:wall.y+1};
			}
		}

		// We only add a new cell if only one of the cells is unvisited
		if (unvisitedCell) {
			delete Walls[wall.x + "," + wall.y];

			KinkyDungeonMapSet(wall.x, wall.y, '0');
			KinkyDungeonMapSet(unvisitedCell.x, unvisitedCell.y, '0');
			VisitedCells[unvisitedCell.x + "," + unvisitedCell.y] = unvisitedCell;

			KinkyDungeonMazeWalls(unvisitedCell, Walls, WallsList);
		}

		// Either way we remove this wall from consideration
		delete WallsList[wall.x + "," + wall.y];
		// Update keys

		WallKeys = Object.keys(WallsList);
		//CellKeys = Object.keys(VisitedCells);
	}

	for (let X = 1; X < KinkyDungeonGridWidth; X += 1)
		for (let Y = 1; Y < KinkyDungeonGridWidth; Y += 1) {
			if ((X % 2 == 0 && Y % 2 == 1) || (X % 2 == 1 && Y % 2 == 0)) {
				let size = 1+Math.ceil(KDRandom() * (openness));
				if (KDRandom() < 0.4 - 0.02*density * size * size) {

					let tile = '0';

					// We open up the tiles
					for (let XX = X; XX < X +size; XX++)
						for (let YY = Y; YY < Y+size; YY++) {
							if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
								KinkyDungeonMapSet(XX, YY, tile);
							VisitedCells[XX + "," + YY] = {x:XX, y:YY};
							KinkyDungeonMazeWalls({x:XX, y:YY}, Walls, WallsList);
							delete Walls[XX + "," + YY];
						}
				}
			}
		}

	// We add POI's at dead ends
	for (let X = 1; X < KinkyDungeonGridWidth; X += 1)
		for (let Y = 1; Y < KinkyDungeonGridWidth; Y += 1) {
			let nearwalls = 0;
			for (let XX = X - 1; XX <= X + 1; XX += 1)
				for (let YY = Y - 1; YY <= Y + 1; YY += 1) {
					if (KinkyDungeonMapGet(XX, YY) == '1') {
						nearwalls += 1;
					}
				}
			if (nearwalls == 7) {
				POI.push({x: X*2, y: Y*2, requireTags: ["endpoint"], favor: [], used: false});
			}
		}

	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	// Constrict hallways randomly in X
	for (let Y = 2; Y < KinkyDungeonGridHeight - 1; Y += 1) {
		if (KDRandom() < 0.4 - 0.04*hallopenness) {
			let row_top = [];
			let row_mid = [];
			let row_bot = [];
			for (let X = 0; X < KinkyDungeonGridWidth; X++) {
				row_top.push(KinkyDungeonMapGet(X, Y-1));
				row_mid.push(KinkyDungeonMapGet(X, Y));
				row_bot.push(KinkyDungeonMapGet(X, Y+1));
			}
			for (let X = 1; X < KinkyDungeonGridWidth-1; X++) {
				if (row_mid[X] == '0') {
					if (row_mid[X-1] == '0' || row_mid[X+1] == '0') {
						if (row_top[X] == '0' && row_bot[X] == '0' && (row_top[X-1] == '1' || row_bot[X+1] == '1')) {
							// Avoid creating diagonals
							if (((row_top[X+1] == '0' && row_bot[X+1] == '0') || row_mid[X+1] == '1')
								&& ((row_top[X-1] == '0' && row_bot[X-1] == '0') || row_mid[X-1] == '1')) {
								KinkyDungeonMapSet(X, Y, 'X');
								X++;
							}
						}
					}
				}
			}
		}
	}

	// Constrict hallways randomly in Y
	for (let X = 2; X < KinkyDungeonGridWidth - 1; X += 1) {
		if (KDRandom() < 0.4 - 0.04*hallopenness) {
			let col_top = [];
			let col_mid = [];
			let col_bot = [];
			for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
				col_top.push(KinkyDungeonMapGet(X-1, Y));
				col_mid.push(KinkyDungeonMapGet(X, Y));
				col_bot.push(KinkyDungeonMapGet(X+1, Y));
			}
			for (let Y = 1; Y < KinkyDungeonGridHeight-1; Y++) {
				if (col_mid[Y] == '0') {
					if (col_mid[Y-1] == '0' || col_mid[Y+1] == '0') {
						if (col_top[Y] == '0' && col_bot[Y] == '0' && (col_top[Y-1] == '1' || col_bot[Y+1] == '1')) {
							if (((col_top[Y+1] == '0' && col_bot[Y+1] == '0') || col_mid[Y+1] == '1')
								&& ((col_top[Y-1] == '0' && col_bot[Y-1] == '0') || col_mid[Y-1] == '1')) {
								KinkyDungeonMapSet(X, Y, '1');
								Y++;
							}
						}
					}
				}
			}
		}
	}

	for (let X = 2; X < KinkyDungeonGridWidth; X += 2)
		for (let Y = 2; Y < KinkyDungeonGridWidth; Y += 2) {
			let size = 2*Math.ceil(KDRandom() * (openness));
			if (KDRandom() < 0.4 - 0.04*density * size) {

				let tile = '0';
				if (data.params.floodChance > 0 && KDRandom() < data.params.floodChance) tile = 'w';

				// We open up the tiles
				for (let XX = X; XX < X +size; XX++)
					for (let YY = Y; YY < Y+size; YY++) {
						if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
							KinkyDungeonMapSet(XX, YY, tile);
					}
			}
		}
}

/**
 *
 * @param {*} POI
 * @param {*} VisitedRooms
 * @param {*} width
 * @param {*} height
 * @param {*} openness
 * @param {*} density
 * @param {*} hallopenness
 * @param {{params: floorParams; chestlist: any[]; traps: any[]; shrinelist: any[]; chargerlist: any[]; spawnpoints: any[]}} data
 */
function KinkyDungeonCreateTileMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	VisitedRooms = [];
	KinkyDungeonMapSet(1, 1, '0', VisitedRooms);

	let Walls = {};
	let WallsList = {};
	let VisitedCells = {};

	// Initialize the first cell in our Visited Cells list
	//if (KDDebug)
	console.log("Created maze with dimensions " + width + "x" + height + ", openness: "+ openness + ", density: "+ density);

	VisitedCells[VisitedRooms[0].x + "," + VisitedRooms[0].y] = {x:VisitedRooms[0].x, y:VisitedRooms[0].y};

	// Walls are basically even/odd pairs.
	for (let X = 2; X < width; X += 2)
		for (let Y = 1; Y < height; Y += 2)
			if (KinkyDungeonMapGet(X, Y) == '1') {
				Walls[X + "," + Y] = {x:X, y:Y};
			}
	for (let X = 1; X < width; X += 2)
		for (let Y = 2; Y < height; Y += 2)
			if (KinkyDungeonMapGet(X, Y) == '1') {
				Walls[X + "," + Y] = {x:X, y:Y};
			}

	// Setup the wallslist for the first room
	KinkyDungeonMazeWalls(VisitedRooms[0], Walls, WallsList);

	// Per a randomized primm algorithm from Wikipedia, we loop through the list of walls until there are no more walls

	let WallKeys = Object.keys(WallsList);
	//let CellKeys = Object.keys(VisitedCells);

	while (WallKeys.length > 0) {
		let I = Math.floor(KDRandom() * WallKeys.length);
		let wall = Walls[WallKeys[I]];
		let unvisitedCell = null;

		// Check if wall is horizontal or vertical and determine if there is a single unvisited cell on the other side of the wall
		if (wall.x % 2 == 0) { //horizontal wall
			if (!VisitedCells[(wall.x-1) + "," + wall.y]) unvisitedCell = {x:wall.x-1, y:wall.y};
			if (!VisitedCells[(wall.x+1) + "," + wall.y]) {
				if (unvisitedCell) unvisitedCell = null;
				else unvisitedCell = {x:wall.x+1, y:wall.y};
			}
		} else { //vertical wall
			if (!VisitedCells[wall.x + "," + (wall.y-1)]) unvisitedCell = {x:wall.x, y:wall.y-1};
			if (!VisitedCells[wall.x + "," + (wall.y+1)]) {
				if (unvisitedCell) unvisitedCell = null;
				else unvisitedCell = {x:wall.x, y:wall.y+1};
			}
		}

		// We only add a new cell if only one of the cells is unvisited
		if (unvisitedCell) {
			delete Walls[wall.x + "," + wall.y];

			KinkyDungeonMapSet(wall.x, wall.y, '0');
			KinkyDungeonMapSet(unvisitedCell.x, unvisitedCell.y, '0');
			VisitedCells[unvisitedCell.x + "," + unvisitedCell.y] = unvisitedCell;

			KinkyDungeonMazeWalls(unvisitedCell, Walls, WallsList);
		}

		// Either way we remove this wall from consideration
		delete WallsList[wall.x + "," + wall.y];
		// Update keys

		WallKeys = Object.keys(WallsList);
		//CellKeys = Object.keys(VisitedCells);
	}

	// The maze is complete. Now we open up some tiles

	for (let X = 1; X < KinkyDungeonGridWidth; X += 1)
		for (let Y = 1; Y < KinkyDungeonGridWidth; Y += 1) {
			if ((X % 2 == 0 && Y % 2 == 1) || (X % 2 == 1 && Y % 2 == 0)) {
				let size = 1;//+Math.ceil(KDRandom() * (openness));
				if (KDRandom() < 0.4 - 0.02*density * size * size) {

					let tile = '0';

					// We open up the tiles
					for (let XX = X; XX < X +size; XX++)
						for (let YY = Y; YY < Y+size; YY++) {
							if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
								KinkyDungeonMapSet(XX, YY, tile);
							VisitedCells[XX + "," + YY] = {x:XX, y:YY};
							KinkyDungeonMazeWalls({x:XX, y:YY}, Walls, WallsList);
							delete Walls[XX + "," + YY];
						}
				}
				if (KDRandom() < 0.02 * openness) {

					let tile = '0';

					// We open up the tiles
					for (let XX = X-1; XX <= X + 1; XX++)
						for (let YY = Y; YY <= Y + 1; YY++)
							if (XX == 0 || YY == 0) {
								if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
									KinkyDungeonMapSet(XX, YY, tile);
								VisitedCells[XX + "," + YY] = {x:XX, y:YY};
								KinkyDungeonMazeWalls({x:XX, y:YY}, Walls, WallsList);
								delete Walls[XX + "," + YY];
							}
				}
			}
		}

	// Now we create a new map based on the maze
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;

	// Determine widths empirically. Only science is allowed here.
	let index_w = 0;
	let index_h = 0;
	for (let x = 1; x*2 < KinkyDungeonGridWidth; x += 1) {
		index_w += 1;
		index_h = 0;
		for (let y = 1; y*2 < KinkyDungeonGridHeight; y += 1) {
			index_h += 1;
		}
	}


	// Set points for start and end points on the map...
	let starty = Math.floor(KDRandom() * (index_h ));
	let endy = Math.floor(KDRandom() * (index_h));
	let topx = Math.floor(KDRandom() * (index_w));
	let botx = Math.floor(KDRandom() * (index_w));

	/**
	 * Start, end, top, bot positions
	 * @type {Record<string, boolean>}
	 */
	let requiredAccess = {
	};
	requiredAccess[1 + "," + (starty + 1)] = true;
	requiredAccess[(topx + 1) + "," + 1] = true;
	requiredAccess[w + "," + (endy + 1)] = true;
	requiredAccess[(botx + 1) + "," + h] = true;

	// Now we convert the maze into an array of indices
	/**
	 * @type {Record<string, string>}
	 */
	let indices = {};
	for (let x = 1; x < KinkyDungeonGridWidth; x += 2) {
		for (let y = 1; y < KinkyDungeonGridHeight; y += 2) {
			let index = "";
			if (KinkyDungeonMapGet(x, y - 1) == '0' || (y == 1 && (x - 1)/2 == topx)) index = index + "u";
			if (KinkyDungeonMapGet(x, y + 1) == '0' || (y == -1 + index_h * 2 && (x - 1)/2 == botx)) index = index + "d";
			if (KinkyDungeonMapGet(x - 1, y) == '0' || (x == 1 && (y - 1)/2 == starty)) index = index + "l";
			if (KinkyDungeonMapGet(x + 1, y) == '0' || (x == -1 + index_w * 2 && (y - 1)/2 == endy)) index = index + "r";
			indices[(1 + (x - 1)/2) + "," + (1 + (y - 1)/2)] = index;
		}
	}

	// TODO remove
	console.log(indices);

	// Set the map bounds
	KinkyDungeonGridWidth = Math.floor(index_w * KDTE_Scale) + 2;
	KinkyDungeonGridHeight = Math.floor(index_h * KDTE_Scale) + 2;

	KinkyDungeonStartPosition = {x: 1, y: 4 + (starty) * KDTE_Scale};
	KinkyDungeonEndPosition = {x: KinkyDungeonGridWidth - 2, y: 4 + (endy) * KDTE_Scale};
	if (KDRandom() < 0.5)
		KinkyDungeonShortcutPosition = {x: 4 + (botx) * KDTE_Scale, y: KinkyDungeonGridHeight - 2};
	else
		KinkyDungeonShortcutPosition = {x: 4 + (topx) * KDTE_Scale, y: 1};

	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + '1';//KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	let tagModifiers = data.params.tagModifiers ? data.params.tagModifiers : undefined;

	// Now we decide which tiles to use. This is a lengthy process, so it is its own function
	// This happens with the loading--future tiles depend on present tiles
	let maxTagFlags = Object.assign({
		chest: data.params.chestcount || 0,
		shrine: data.params.shrinecount || 0,
		charger: data.params.chargercount || 0,
	}, KDDefaultMaxFlags);
	KDMapTilesPopulate(w, h, indices, data, requiredAccess, maxTagFlags, tagModifiers);

	let floodChance = data.params.floodchance || 0;

	for (let X = 2; X < KinkyDungeonGridWidth; X += 2)
		for (let Y = 2; Y < KinkyDungeonGridWidth; Y += 2) {
			let size = 2*Math.ceil(KDRandom() * (openness));
			if (KDRandom() < 0.4 - 0.04*density * size) {
				if (floodChance > 0 && KDRandom() < floodChance)
					// We open up the tiles
					for (let XX = X; XX < X +size; XX++)
						for (let YY = Y; YY < Y+size; YY++) {
							if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
								KinkyDungeonMapSet(XX, YY, 'w');
						}
			}
		}
}


function KinkyDungeonCreateRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonCreateRectangle(0, 0, width, height, true, false, false, false);

	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}
}

function KinkyDungeonCreateDollRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup


	// Now we STRETCH the map
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	width = KinkyDungeonGridWidth;
	height = KinkyDungeonGridHeight;

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + '1';
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}


	// Create the doll cell itself
	let CellWidth = 10;
	let CellHeight = 12;
	let CellX = width / 2 - CellWidth / 2;
	let CellY = height / 2 - CellHeight / 2;
	let cavityStart = 5;
	let cavityEnd = 2;

	// Hollow out a greater cell area
	KinkyDungeonCreateRectangle(cavityStart, 0, CellX + CellWidth - cavityEnd, height, false, false, false, false);

	KinkyDungeonCreateRectangle(CellX, CellY, CellWidth, CellHeight, true, false, false, true, true, false, true);

	// Create some protrustions in the walls
	let leftPassages = [
	];
	for (let i = 0; i < 6; i++) {
		leftPassages.push(1 + Math.ceil(KDRandom()*2));
	}
	let rightPassages = [];
	for (let i = 0; i < 6; i++) {
		rightPassages.push(2 + Math.ceil(KDRandom()*3));
	}
	let ii = 0;
	for (let l of leftPassages) {
		KinkyDungeonCreateRectangle(cavityStart - l, 1 + 3 * ii, l, 2, false, false, false, false);

		KinkyDungeonMapSet(cavityStart, 3 + 3 * ii, 'X');
		//if (ii < leftPassages.length - 1) {
		KinkyDungeonMapSet(cavityStart, 1 + 3 * ii, '2');
		KinkyDungeonMapSet(cavityStart, 2 + 3 * ii, '2');
		//}
		ii += 1;
	}
	ii = 0;
	for (let l of rightPassages) {
		KinkyDungeonCreateRectangle(cavityStart - cavityEnd + CellX + CellWidth, 1 + 3 * ii, l, 2, false, false, false, false);
		KinkyDungeonMapSet(cavityStart - cavityEnd + CellX + CellWidth, 3 + 3 * ii, 'X');
		//if (ii < rightPassages.length - 1) {
		KinkyDungeonMapSet(cavityStart - cavityEnd + CellX + CellWidth, 1 + 3 * ii, '2');
		KinkyDungeonMapSet(cavityStart - cavityEnd + CellX + CellWidth, 2 + 3 * ii, '2');
		//}
		ii += 1;
	}

	// Create grates
	KinkyDungeonMapSet(CellX + 2 + Math.floor(KDRandom()*(CellWidth - 5)), KDRandom() < 0.5 ? CellY : (CellY+CellHeight - 1), 'g');
	if (KDRandom() < 0.5)
		KinkyDungeonMapSet(CellX + 2 + Math.floor(KDRandom()*(CellWidth - 5)), KDRandom() < 0.5 ? CellY : (CellY+CellHeight - 1), 'g');
	if (KDRandom() < 0.5)
		KinkyDungeonMapSet(CellX,CellY + 2 + Math.floor(KDRandom()*(CellHeight - 5)),  'g');
	if (KDRandom() < 0.5)
		KinkyDungeonMapSet((CellX+CellWidth - 1),CellY + 2 + Math.floor(KDRandom()*(CellHeight - 5)), 'g');
	// Create light posts
	for (let xx = CellX + 2; xx < CellX + CellWidth; xx += 5) {
		for (let yy = 2; yy < height; yy += 5) {
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(xx, yy))) {
				KinkyDungeonMapSet(xx, yy, '0');
				KinkyDungeonTilesSet((xx) + "," + (yy), Object.assign(KinkyDungeonTilesGet((xx) + "," + (yy)) || {}, {Light: 6, Skin: "LightRaysDoll"}));
			}

		}
	}

	let dollCount = 10;
	// Generate dolls in the inside
	for (let i = 0; i < dollCount; i++) {
		let XX = CellX + 1 + Math.round(KDRandom() * (CellWidth-3));
		let YY = CellY + 1 + Math.round(KDRandom() * (CellHeight-3));
		let entity = KinkyDungeonEntityAt(XX, YY);
		if (entity || (XX == width/2 && YY == height/2)) continue;
		let Enemy = KinkyDungeonGetEnemy(["bellowsDoll"], MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["doll", "peaceful"]);
		if (Enemy) {
			let e = DialogueCreateEnemy(XX, YY, Enemy.name);
			if (KDRandom() < 0.33) KDTieUpEnemy(e, 15 + Math.floor(45 * KDRandom()), "Tape");
			else if (KDRandom() < 0.32) KDTieUpEnemy(e, 15 + Math.floor(45 * KDRandom()), "Slime");
			else if (KDRandom() < 0.34) KDTieUpEnemy(e, 15 + Math.floor(45 * KDRandom()), "Metal");
			if (e.boundLevel > 0 && KDRandom() < 0.33) e.hp = 0.5;
		}
	}

	KDGameData.JailPoints.push({x: width/2, y: height/2, type: "dropoff", radius: 1});

	let takenIndex = 0;
	let takenRight = false;
	if (KDRandom() < 0.5) {
		// Left side
		let cavityNum = Math.floor(KDRandom()*leftPassages.length);
		takenIndex = cavityNum;
		KinkyDungeonEndPosition = {x: cavityStart - leftPassages[cavityNum], y: 1 + 3 * cavityNum};
	} else {
		// Right side
		let cavityNum = Math.floor(KDRandom()*rightPassages.length);
		takenIndex = cavityNum;
		takenRight = true;
		KinkyDungeonEndPosition = {x: cavityStart - cavityEnd + CellX + CellWidth + rightPassages[cavityNum] - 1, y: 1 + 3 * cavityNum};
	}
	if (KDRandom() < 0.5) {
		// Left side
		let cavityNum = Math.floor(KDRandom()*leftPassages.length);
		if (!takenRight && takenIndex == cavityNum) {
			if (cavityNum > 0) cavityNum -= 1;
			else cavityNum += 1;
		}
		KinkyDungeonStartPosition = {x: cavityStart - leftPassages[cavityNum], y: 2 + 3 * cavityNum};
	} else {
		// Right side
		let cavityNum = Math.floor(KDRandom()*rightPassages.length);
		if (takenRight && takenIndex == cavityNum) {
			if (cavityNum > 0) cavityNum -= 1;
			else cavityNum += 1;
		}

		KinkyDungeonStartPosition = {x: cavityStart - cavityEnd + CellX + CellWidth + rightPassages[cavityNum] - 1, y: 2 + 3 * cavityNum};
	}

	let exitGuardTags = ["robot"]; KinkyDungeonAddTags(exitGuardTags, MiniGameKinkyDungeonLevel);
	if (KDGameData.DollRoomCount > 0) exitGuardTags.push("open"); // Allow spawning an Enforcer unit
	let robotTags = ["robot"]; KinkyDungeonAddTags(robotTags, MiniGameKinkyDungeonLevel);
	let eliteTags = ["robot"]; KinkyDungeonAddTags(eliteTags, MiniGameKinkyDungeonLevel);

	let robotCount = 5 + Math.min(10, KinkyDungeonDifficulty/10 + MiniGameKinkyDungeonLevel/3) + 5 * (KDGameData.DollRoomCount || 0);
	// Generate robots in the outside
	for (let i = 0; i < robotCount; i++) {
		let XX = i % 2 == 0 ?
			(cavityStart + Math.round(KDRandom() * (CellX - cavityStart - 1)))
			: (CellX + CellWidth + 1 + Math.round(KDRandom() * (cavityStart - 2 - cavityEnd)));
		let YY = CellY + 1 + Math.round(KDRandom() * (CellHeight-2));
		let entity = KinkyDungeonEntityAt(XX, YY);
		if (entity || (XX == width/2 && YY == height/2)) continue;
		let Enemy = KinkyDungeonGetEnemy(robotTags, MiniGameKinkyDungeonLevel + 3, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["robot"], undefined, undefined);
		if (Enemy) {
			let e = DialogueCreateEnemy(XX, YY, Enemy.name);
			e.faction = "Enemy";
		}
	}
	if (KDGameData.DollRoomCount > 1) { // Spawn a group of AIs
		for (let i = 0; i < 1 + Math.ceil(robotCount * 0.1); i++) {
			let point = KinkyDungeonGetNearbyPoint(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y);
			let Enemy = KinkyDungeonGetEnemy(eliteTags, MiniGameKinkyDungeonLevel + 4, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["robot"],
				undefined, undefined, ["minor", "miniboss", "noguard"]);
			if (Enemy) {
				let e = DialogueCreateEnemy(point.x, point.y, Enemy.name);
				e.faction = "Enemy";
				e.AI = "looseguard";
			}
		}
	}

	let ExitGuard = KinkyDungeonGetEnemy(exitGuardTags, MiniGameKinkyDungeonLevel + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["robot", "dollRoomBoss"],
		undefined, undefined, ["noguard"]);
	if (ExitGuard) {
		let e = DialogueCreateEnemy(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, ExitGuard.name);
		e.faction = "Enemy";
		e.AI = "verylooseguard";
	}

	KinkyDungeonPatrolPoints.push({x: CellX - 2, y: CellY - 2});
	KinkyDungeonPatrolPoints.push({x: CellX - 2, y: CellY + 2 + CellHeight});
	KinkyDungeonPatrolPoints.push({x: CellX + 2 + CellWidth, y: CellY + 2 + CellHeight});
	KinkyDungeonPatrolPoints.push({x: CellX + 2 + CellWidth, y: CellY - 2});



	KinkyDungeonMapSet(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, 's');
	if (KDGameData.DollRoomCount > 0)
		KinkyDungeonMapSet(KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, 'S');
}


function KinkyDungeonCreateDollmaker(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup
	KinkyDungeonSetFlag("NoDollRoomBypass", -1, 1);

	// Now we STRETCH the map
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	width = KinkyDungeonGridWidth;
	height = KinkyDungeonGridHeight;

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + '1';
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}


	// Create the doll cell itself
	let cavitywidth = 21;
	let cavityheight = 21;
	let cavityStart = 2;

	KinkyDungeonStartPosition = {x: cavityStart, y: 1 + Math.floor(cavityheight/2)};

	// Hollow out a greater cell area
	KinkyDungeonCreateRectangle(cavityStart, 0, cavitywidth, cavityheight, false, false, false, false);

	KD_PasteTile(KDMapTilesList.Arena_Dollmaker, cavityStart, 1, data);

	DialogueCreateEnemy(KinkyDungeonStartPosition.x + Math.floor(cavityheight/2), KinkyDungeonStartPosition.y, "DollmakerBoss1");

	KinkyDungeonEndPosition = {x: KinkyDungeonStartPosition.x + cavitywidth, y: KinkyDungeonStartPosition.y};

	KinkyDungeonMapSet(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, 's');
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, 'S');
}

function KinkyDungeonCreateTunnel(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);

	// Starting rectangle
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, width - 3, 2, false, false, false, false);
	// Main passage
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, width - 2, 1, false, false, false, false);

	// Create the two branching hallways
	let b1 = 3 + Math.floor(KDRandom() * (width-7));
	let b2 = 4 + Math.floor(KDRandom() * (width-6));

	let y1 = VisitedRooms[0].y > 4 ? 1 : VisitedRooms[0].y;
	let h1 = VisitedRooms[0].y > 4 ? Math.abs(y1 - VisitedRooms[0].y) : height - VisitedRooms[0].y - 1;

	let y2 = VisitedRooms[0].y < height - 4 ? VisitedRooms[0].y : 1;
	let h2 = VisitedRooms[0].y < height - 4 ? Math.abs(height - 1 - VisitedRooms[0].y) : VisitedRooms[0].y - 1;

	if (Math.abs(b1 - b2) < 2) {
		if (b1 < width - 4) b2 = b1 + 2;
		else b2 = b1 - 2;
	}

	KinkyDungeonCreateRectangle(b1, y1, 1, h1, false, false, false, false);
	KinkyDungeonCreateRectangle(b2, y2, 1, h2, false, false, false, false);


	/*
	// Add the prison
	let py = (VisitedRooms[0].y < height - 5 ? height - 3 : 3);
	POI.push({x: 2*VisitedRooms[0].x + 4, y: 2*py, requireTags: [], favor: ["GuaranteedCell"], used: false});
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, Math.min(py, VisitedRooms[0].y), 1, Math.abs(VisitedRooms[0].y - py), false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, Math.min(py, VisitedRooms[0].y), b2-2, 1, false, false, false, false);
	KinkyDungeonCreateRectangle(b2, Math.min(py, VisitedRooms[0].y), 1, Math.abs(VisitedRooms[0].y - py), false, false, false, false);*/


	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	// Place a shop and a Leyline Tap

	//KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 + 1, 'A');
	//KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Shrine", Name: "Will"});

	// Removing shrine and leyline and putting in perk room instead
	/*
	KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 + 1, 'l');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 + 1), {Leyline: true, Light: KDLeylineLight, lightColor: KDLeylineLightColor});

	KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 - 2, 'A');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 - 2), {Type: "Shrine", Name: "Commerce"});

	// Place lost items chest
	if (KinkyDungeonLostItems.length > 0)
		KDChest(VisitedRooms[0].x*2 + 0, VisitedRooms[0].y*2 - 2, "lost_items");*/

	// Place the exit stairs

	let boss = KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel + 1);
	let mods = !boss ? KDGetMapGenList(3, KDMapMods) : ["None", "None", "None"];
	if (!boss) {
		let exit1 = mods[0].name;
		KinkyDungeonMapSet(b1*2, VisitedRooms[0].y > 4 ? 2 : height*2 - 3, 's');
		KinkyDungeonMapSet(b1*2 + 1, VisitedRooms[0].y > 4 ? 2 : height*2 - 3, 'G');
		KinkyDungeonTilesSet("" + (b1*2) + "," + (VisitedRooms[0].y > 4 ? 2 : height*2 - 3), {MapMod: exit1});
		KinkyDungeonTilesSet("" + (b1*2 + 1) + "," + (VisitedRooms[0].y > 4 ? 2 : height*2 - 3), {Type: "Ghost", Msg: "MapMod" + exit1});

		let exit2 = mods[1].name;
		KinkyDungeonMapSet(b2*2 + 1, VisitedRooms[0].y < height - 4 ? height*2 - 3 : 2, 's');
		KinkyDungeonMapSet(b2*2, VisitedRooms[0].y < height - 4 ? height*2 - 3 : 2, 'G');
		KinkyDungeonTilesSet("" + (b2*2 + 1) + "," + (VisitedRooms[0].y < height - 4 ? height*2 - 3 : 2), {MapMod: exit2});
		KinkyDungeonTilesSet("" + (b2*2) + "," + (VisitedRooms[0].y < height - 4 ? height*2 - 3 : 2), {Type: "Ghost", Msg: "MapMod" + exit2});
	}

	let exit3 = boss ? "Boss" : mods[2].name;
	KinkyDungeonMapSet(width*2 - 2, VisitedRooms[0].y*2, 's');
	KinkyDungeonMapSet(width*2 - 2, VisitedRooms[0].y*2 + 1, 'G');
	if (!boss)
		KinkyDungeonTilesSet("" + (width*2 - 2) + "," + (VisitedRooms[0].y*2), {MapMod: exit3});
	KinkyDungeonTilesSet("" + (width*2 - 2) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "MapMod" + exit3});

	KinkyDungeonEndPosition = {x: width*2 - 2, y: VisitedRooms[0].y*2};

	// Place quest NPCs
	let quests = KDQuestList(2 + Math.round(KDRandom()), KDQuests, "Tunnel", "");
	for (let q of quests) {
		if (q.npc)
			KinkyDungeonSummonEnemy(KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, q.npc, 1, 14, true);
	}
}


function KinkyDungeonCreatePerkRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);

	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 2, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, width - 2, 1, false, false, false, false);

	// Create the two branching hallways
	let b1 = 3 + Math.floor(KDRandom() * (width-7));
	let b2 = 4 + Math.floor(KDRandom() * (width-6));

	if (Math.abs(b1 - b2) < 2) {
		if (b1 < width - 4) b2 = b1 + 2;
		else b2 = b1 - 2;
	}

	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	// Place a shop and a Leyline Tap
	KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 + 1, 'l');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 + 1), {Leyline: true, Light: KDLeylineLight, lightColor: KDLeylineLightColor});

	if (KinkyDungeonFlags.get("SpawnMap")) {
		if (KinkyDungeonSpells.filter((spell) => {return spell.name == "ManaPoolUp";}).length < Math.ceil(MiniGameKinkyDungeonLevel/4))
			KinkyDungeonGroundItems.push({x:VisitedRooms[0].x*2 + 3, y:(VisitedRooms[0].y*2), name: "LeylineMap"});
		KinkyDungeonSetFlag("SpawnMap", -1);
	}

	KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 - 2, 'A');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 - 2), {Type: "Shrine", Name: "Commerce"});

	// Create the perk altars
	let py = VisitedRooms[0].y*2 - 2;
	let p1x = VisitedRooms[0].x*2 + 5;
	KinkyDungeonCreateRectangle(p1x, py, 5, 2, false, false, false, false);

	POI.push({x: VisitedRooms[0].x*2 + 7, y: VisitedRooms[0].y*2, requireTags: [], favor: ["PearlChest"], used: false});

	let perkCount = 3;
	/** @type {Record<string, boolean>} */
	let perks = {};
	for (let i = 0; i < perkCount; i++) {
		let newperks = KDGetRandomPerks(perks);
		if (newperks.length > 0) {
			KinkyDungeonMapSet(p1x + i * 2, py, 'P');
			KinkyDungeonTilesSet("" + (p1x + i * 2) + "," + (py), {Perks: newperks});
			for (let p of newperks) {
				perks[p] = true;
			}
		}
	}

	// Place lost items chest
	if (KinkyDungeonLostItems.length > 0)
		KDChest(VisitedRooms[0].x*2 + 0, VisitedRooms[0].y*2 - 2, "lost_items");

	// Place the exit stairs
	KinkyDungeonMapSet(width*2 - 2, VisitedRooms[0].y*2, 's');
	KinkyDungeonTilesSet("" + (width*2 - 2) + "," + (VisitedRooms[0].y*2), {RoomType: "Tunnel"});

	KinkyDungeonEndPosition = {x: width*2 - 2, y: VisitedRooms[0].y*2};
}


function KinkyDungeonCreateJourneyFloor(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonStartPosition = {x: 2, y: height};
	VisitedRooms[0].x = 1;
	VisitedRooms[0].y = Math.floor(height/2);

	KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);

	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 2, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, 6, 1, false, false, false, false);

	// Create a branching room for journeys
	let b1 = 4;
	KinkyDungeonCreateRectangle(b1, VisitedRooms[0].y - 3, width - b1, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(b1, VisitedRooms[0].y - 3, 1, 3, false, false, false, false);

	/*
	// Add the prison
	let py = (VisitedRooms[0].y < height - 5 ? height - 3 : 3);
	POI.push({x: 2*VisitedRooms[0].x + 4, y: 2*py, requireTags: [], favor: ["GuaranteedCell"], used: false});
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, Math.min(py, VisitedRooms[0].y), 1, Math.abs(VisitedRooms[0].y - py), false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, Math.min(py, VisitedRooms[0].y), b2-2, 1, false, false, false, false);
	KinkyDungeonCreateRectangle(b2, Math.min(py, VisitedRooms[0].y), 1, Math.abs(VisitedRooms[0].y - py), false, false, false, false);*/


	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	// Normal end stairs
	KinkyDungeonMapSet(b1*2 + 5, VisitedRooms[0].y*2, 's');
	KinkyDungeonMapSet(b1*2 + 5, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (b1*2 + 5) + "," + (VisitedRooms[0].y*2), {Journey: undefined});
	KinkyDungeonTilesSet("" + (b1*2 + 5) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "JourneyNone"});

	// Tutorial end stairs
	KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 - 2, 's');
	KinkyDungeonMapSet(VisitedRooms[0].x*2 + 3, VisitedRooms[0].y*2 - 1, 'G');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 - 2), {RoomType: "Tutorial"});
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x*2 + 3) + "," + (VisitedRooms[0].y*2 - 1), {Type: "Ghost", Msg: "JourneyTutorial"});

	// Place journey stairs
	let x = b1 * 2;
	let i = 0;
	while (x < width*2-2) {
		if (KDJourneyList[i]) {
			KinkyDungeonMapSet(x, VisitedRooms[0].y*2 - 6, 's');
			KinkyDungeonMapSet(x, VisitedRooms[0].y*2 - 5, 'G');
			KinkyDungeonTilesSet("" + (x) + "," + (VisitedRooms[0].y*2 - 6), {Journey: KDJourneyList[i], MapMod: KDJourneyMapMod[KDJourneyList[i]] ? KDGetMapGenList(1, KDMapMods)[0].name : undefined});
			KinkyDungeonTilesSet("" + (x) + "," + (VisitedRooms[0].y*2 - 5), {Type: "Ghost", Msg: "Journey" + KDJourneyList[i]});
		}
		i++;
		x += 2;
	}

	KinkyDungeonEndPosition = {x: b1*2 + 5, y: VisitedRooms[0].y*2};
}


function KinkyDungeonCreateShopStart(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonStartPosition = {x: 2, y: height};
	VisitedRooms[0].x = 1;
	VisitedRooms[0].y = Math.floor(height/2);

	KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);

	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 4, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, 6, 1, false, false, false, false);

	let b1 = 4;


	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	KD_PasteTile(KDMapTilesList.ShopStart, KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y - 4, data);

	DialogueCreateEnemy(KinkyDungeonStartPosition.x + 5, KinkyDungeonStartPosition.y, "ShopkeeperStart");

	// Normal end stairs
	KinkyDungeonMapSet(b1*2 + 7, VisitedRooms[0].y*2, 's');
	if (MiniGameKinkyDungeonLevel == 0)
		KinkyDungeonTilesSet("" + (b1*2 + 7) + "," + (VisitedRooms[0].y*2), {RoomType: "JourneyFloor"});

	KinkyDungeonEndPosition = {x: b1*2 + 5, y: VisitedRooms[0].y*2};
}


function KinkyDungeonCreateTestTile(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonStartPosition = {x: 2, y: height};
	VisitedRooms[0].x = 1;
	VisitedRooms[0].y = Math.floor(height/2);

	KinkyDungeonCreateRectangle(0, 0, width, height, false, false, false, false);

	let b1 = 4;


	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	KD_PasteTile(KDTileToTest, KinkyDungeonStartPosition.x + 4, 3, data);


	KinkyDungeonEndPosition = {x: b1*2 + 5, y: VisitedRooms[0].y*2};
}


function KinkyDungeonCreateTutorial(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Variable setup

	KinkyDungeonStartPosition = {x: 2, y: height};
	VisitedRooms[0].x = 1;
	VisitedRooms[0].y = Math.floor(height/2);

	KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);

	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 2, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, width, 1, false, false, false, false);


	/*
	// Add the prison
	let py = (VisitedRooms[0].y < height - 5 ? height - 3 : 3);
	POI.push({x: 2*VisitedRooms[0].x + 4, y: 2*py, requireTags: [], favor: ["GuaranteedCell"], used: false});
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, Math.min(py, VisitedRooms[0].y), 1, Math.abs(VisitedRooms[0].y - py), false, false, false, false);
	KinkyDungeonCreateRectangle(VisitedRooms[0].x, Math.min(py, VisitedRooms[0].y), b2-2, 1, false, false, false, false);
	KinkyDungeonCreateRectangle(b2, Math.min(py, VisitedRooms[0].y), 1, Math.abs(VisitedRooms[0].y - py), false, false, false, false);*/


	// Now we STRETCH the map
	let KinkyDungeonOldGrid = KinkyDungeonGrid;
	let w = KinkyDungeonGridWidth;
	let h = KinkyDungeonGridHeight;
	KinkyDungeonGridWidth = Math.floor(KinkyDungeonGridWidth*2);
	KinkyDungeonGridHeight = Math.floor(KinkyDungeonGridHeight*2);
	KinkyDungeonGrid = "";

	// Generate the grid
	for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
		for (let X = 0; X < KinkyDungeonGridWidth; X++)
			KinkyDungeonGrid = KinkyDungeonGrid + KinkyDungeonOldGrid[Math.floor(X * w / KinkyDungeonGridWidth) + Math.floor(Y * h / KinkyDungeonGridHeight)*(w+1)];
		KinkyDungeonGrid = KinkyDungeonGrid + '\n';
	}

	// Normal end stairs
	KinkyDungeonMapSet(width*2 - 2, VisitedRooms[0].y*2, 's');
	KinkyDungeonMapSet(width*2 - 2, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (width*2 - 2) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "TutorialCongrats"});

	// Tutorial start
	KinkyDungeonMapSet(VisitedRooms[0].x + 3, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x + 3) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial0"});

	// Barrels
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + 7, 3, 2, height*2, false, false, false, false);
	KinkyDungeonMapSet(VisitedRooms[0].x + 7, VisitedRooms[0].y*2, 'L');
	KinkyDungeonMapSet(VisitedRooms[0].x + 7, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x + 7) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Dialogue: "Tutorial1"});

	// Stats
	KinkyDungeonMapSet(VisitedRooms[0].x + 11, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x + 11) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2"});

	// SP
	let xx = 13;
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx + 4, 3, 2, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx + 4, 3, 1, 5, false, false, false, false);
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 4, 5, 'd');
	KinkyDungeonTilesSet((KinkyDungeonStartPosition.x + xx + 4) + "," + 5, {
		Type: "Door",
	});
	KinkyDungeonGroundItems.push({x:KinkyDungeonStartPosition.x + xx + 4, y:4, name: "PotionWill"});

	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 2, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 1, 5, false, false, false, false);
	KinkyDungeonGroundItems.push({x:KinkyDungeonStartPosition.x + xx, y:4, name: "PotionWill"});
	KinkyDungeonMapSet(VisitedRooms[0].x + xx + 1, 5, 'T');
	KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 1) + "," + 5, {
		Type: "Trap",
		Trap: "SpecificSpell",
		noVary: true,
		Spell: "TrapSCloud",
	});
	KinkyDungeonMapSet(VisitedRooms[0].x + xx + 3, VisitedRooms[0].y*2, 'T');
	KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 3) + "," + (VisitedRooms[0].y*2), {
		Type: "Trap",
		Trap: "SpecificSpell",
		noVary: true,
		Spell: "TrapSCloud",
	});
	KinkyDungeonMapSet(VisitedRooms[0].x + xx + 3, VisitedRooms[0].y*2 + 1, 'T');
	KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 3) + "," + (VisitedRooms[0].y*2 + 1), {
		Type: "Trap",
		Trap: "SpecificSpell",
		noVary: true,
		Spell: "TrapSCloud",
	});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 1, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 1) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2_sp1"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 1, 3, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 1) + "," + (3), {Type: "Ghost", Msg: "Tutorial2_sp2"});
	KinkyDungeonMapSet(VisitedRooms[0].x + xx + 4, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (VisitedRooms[0].x + xx + 4) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2_sp3"});


	// MP
	xx = 22;
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 2, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 1, 5, false, false, false, false);
	KinkyDungeonGroundItems.push({x:KinkyDungeonStartPosition.x + xx, y:4, name: "PotionMana"});
	KinkyDungeonMapSet(VisitedRooms[0].x + xx + 1, 5, 'd');
	KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 1) + "," + 5, {
		Type: "Door",
	});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 5, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 5) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2_mp1"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 3, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 3) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2_mp2"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 1, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 1) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Dialogue: "Tutorial2_mp3"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 2, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 2) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2_mp4"});


	// DP
	xx = 28;
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 7, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 1, 5, false, false, false, false);
	KinkyDungeonGroundItems.push({x:KinkyDungeonStartPosition.x + xx, y:4, name: "PotionFrigid"});
	KinkyDungeonMapSet(VisitedRooms[0].x + xx + 1, 5, 'T');
	KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 1) + "," + 5, {
		Type: "Trap",
		Trap: "SpecificSpell",
		noVary: true,
		Spell: "TrapLustCloud",
	});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 1, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 1) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial2_dp1"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 1, 3, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 1) + "," + (3), {Type: "Ghost", Dialogue: "Tutorial2_dp2"});


	// Struggle
	xx = 36;
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 5, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 1, 5, false, false, false, false);
	KinkyDungeonGroundItems.push({x:KinkyDungeonStartPosition.x + xx + 4, y:4, name: "RedKey"});

	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 1, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 1) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial3_1"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 4, 3, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 4) + "," + (3), {Type: "Ghost", Msg: "Tutorial3_2"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 1, 3, 'C');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 1) + "," + (3), {Loot: "tutorial1", Roll: KDRandom()});

	// Struggle
	xx = 43;
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 5, 2, false, false, false, false);
	KinkyDungeonCreateRectangle(KinkyDungeonStartPosition.x + xx, 3, 1, 5, false, false, false, false);
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 4, 4, '?');

	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx - 1, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx - 1) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial3_3"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 4, 3, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 4) + "," + (3), {Type: "Ghost", Msg: "Tutorial3_4"});
	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx, 3, 'C');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx) + "," + (3), {Loot: "tutorial2", Roll: KDRandom()});

	// END


	KinkyDungeonMapSet(KinkyDungeonStartPosition.x + xx + 4, VisitedRooms[0].y*2 + 1, 'G');
	KinkyDungeonTilesSet("" + (KinkyDungeonStartPosition.x + xx + 4) + "," + (VisitedRooms[0].y*2 + 1), {Type: "Ghost", Msg: "Tutorial4"});

	DialogueCreateEnemy(width*2 - 7, VisitedRooms[0].y*2, "FastZombie").AI = "guard";
	DialogueCreateEnemy(width*2 - 5, VisitedRooms[0].y*2 + 1, "FastZombie").AI = "guard";
	DialogueCreateEnemy(width*2 - 3, VisitedRooms[0].y*2, "FastZombie").AI = "guard";
	DialogueCreateEnemy(width*2 - 3, VisitedRooms[0].y*2 + 1, "BlindZombie").AI = "guard";

	KinkyDungeonMapSet(width*2 - 5, VisitedRooms[0].y*2, 'C');
	KinkyDungeonTilesSet("" + (width*2 - 5) + "," + (VisitedRooms[0].y*2), {Loot: "silver", Roll: KDRandom()});
	KinkyDungeonMapSet(width*2 - 6, VisitedRooms[0].y*2, 'C');
	KinkyDungeonTilesSet("" + (width*2 - 6) + "," + (VisitedRooms[0].y*2), {Loot: "chest", Roll: KDRandom()});

	KinkyDungeonEndPosition = {x: width*2 - 2, y: VisitedRooms[0].y*2};
}