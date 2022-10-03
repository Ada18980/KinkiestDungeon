"use strict";


/**
 *
 * @param {number} w
 * @param {number} h
 * @param {Record<string, string>} indices
 * @param {any} data
 * @param {Record<string, boolean>} requiredAccess
 * @param {Record<string, number>} maxTagFlags
 * @returns {Record<string, KDMapTile>}
 */
function KDMapTilesPopulate(w, h, indices, data, requiredAccess, maxTagFlags, tagModifiers) {
	/**
	 * temp helper var
	 * @type {string[]}
	 */
	let tiles_temp = [];
	for (let t of Object.keys(indices)) {
		tiles_temp.push(t);
	}
	/**
	 * order of which tiles to consider, sampled randomly from indices
	 * @type {string[]}
	 */
	let tileOrder = [];

	// Determine order of filling tiles
	while (tiles_temp.length > 0) {
		let ind = Math.floor(KDRandom() * tiles_temp.length);
		tileOrder.push(tiles_temp[ind]);
		tiles_temp.splice(ind, 1);
	}

	/**
	 * tiles that are filled in
	 * @type {Record<string, KDMapTile>}
	 */
	let tilesFilled = {};
	/**
	 * indices that are filled in
	 * @type {Record<string, string>}
	 */
	let indexFilled = {};

	/**
	 * Count of each tag in a filled tile
	 * @type {Record<string, number>}
	 */
	let tagCounts = {};

	// Next we start filling in tiles!

	let fails = 0;

	let ii = 0;

	/**
	 * @type {Record<string, boolean>}
	 */
	let globalTags = {
	};

	while (tileOrder.length > 0) {
		let tileOrderInd = Math.floor(KDRandom() * tileOrder.length);
		let tileSpot = tileOrder[tileOrderInd];
		let indX = parseInt(tileSpot.split(',')[0]);
		let indY = parseInt(tileSpot.split(',')[1]);
		if (indX == undefined || indY == undefined) {
			fails += 1;
			if (fails > 100) tileOrder = []; // Nuclear meltdown
			console.log("Nuclear meltdown. Pls report. Tilespot = " + tileSpot);
			continue;
		}

		// Only place those adjacent to the first one!!!
		if (ii == 0 || (
			(indices[tileSpot].includes('l') && indexFilled[(indX - 1) + ',' + (indY)])
			|| (indices[tileSpot].includes('r') && indexFilled[(indX + 1) + ',' + (indY)])
			|| (indices[tileSpot].includes('u') && indexFilled[(indX) + ',' + (indY - 1)])
			|| (indices[tileSpot].includes('d') && indexFilled[(indX) + ',' + (indY + 1)])
		)) {
			// Get location (and entrances)

			let cornerX = (indX - 1)*KDTE_Scale + 1;
			let cornerY = (indY - 1)*KDTE_Scale + 1;

			// if already occupied we skip
			if (indexFilled[tileSpot]) {
				tileOrder.splice(tileOrderInd, 1);
				continue;
			}

			let index = indices[tileSpot];
			if (!index) {
				fails += 1;
				if (fails > 100) tileOrder = []; // Nuclear meltdown
				console.log("Nuclear meltdown. Pls report. Index = " + index + ", Tilespot = " + tileSpot);
				continue;
			}

			// Get tile name based on weights (TODO)
			let tileName = KD_GetMapTile(index, indX, indY, tilesFilled, indexFilled, tagCounts, requiredAccess, globalTags, indices, tagModifiers);

			// Get tile from array
			let tile = KDMapTilesList[tileName];

			let tags = KD_PasteTile(tile, cornerX, cornerY, data);
			if (tags) {
				for (let t of tags) {
					if (!tagCounts[t]) tagCounts[t] = 1;
					else tagCounts[t] += 1;
				}
				for (let xx = 1; xx <= tile.w; xx++)
					for (let yy = 1; yy <= tile.h; yy++) {
						tilesFilled[(indX + xx - 1) + "," + (indY + yy - 1)] = tile;
						indexFilled[(indX + xx - 1) + "," + (indY + yy - 1)] = tile.index[xx + ',' + yy];
					}
			}

			tileOrder.splice(tileOrderInd, 1);
		}

		for (let t of Object.entries(maxTagFlags)) {
			if (tagCounts[t[0]] >=  t[1])
				globalTags["max" + t[0]] = true;
		}

		ii += 1;
	}

	console.log(globalTags);
	console.log(tilesFilled);
	console.log(indexFilled);



	return tilesFilled;
}

/**
 *
 * @param {KDMapTile} mapTile - Tile to be evaluated for weight
 * @param {Record<string, boolean>} tags - Tags of the INCOMING tile, not the current one
 * @param {Record<string, number>} tagCounts - Counts of all tags on the map at present
 * @param {Record<string, number>} tagModifiers - Tags of the incoming tile will get a multiplier if the incoming tile has it
 * @returns {number}
 */
function KDGetTileWeight(mapTile, tags, tagCounts, tagModifiers) {
	let weight = mapTile.weight;

	// Forbid tags are not allowed
	if (mapTile.forbidTags) {
		for (let tag of mapTile.forbidTags) {
			if (tags[tag]) return 0;
		}
	}

	// Require tags are all required
	if (mapTile.requireTags) {
		for (let tag of mapTile.requireTags) {
			if (!tags[tag]) {
				return 0;
			}
		}
	}

	// Indextags are basically the index for tags that have special modifiers
	for (let i = 0; i < mapTile.indexTags.length; i++) {
		let not = mapTile.notTags && mapTile.notTags[i];
		if ((!not && tags[mapTile.indexTags[i]]) || (not && !tags[mapTile.indexTags[i]])) {
			// We abord if we've reached the max of this many tag
			if (mapTile.maxTags[i] >= 0) {
				let count = tagCounts[mapTile.maxTags[i]];
				if (count && count >= mapTile.maxTags[i]) return 0;
			}
			// We add weight
			if (mapTile.bonusTags[i]) weight += mapTile.bonusTags[i];
			// We multiply weight, in sequence, AFTER bonus from the same tag
			if (mapTile.multTags[i]) weight *= mapTile.multTags[i];

		}
	}

	if (weight > 0 && tagModifiers) {
		for (let tag of mapTile.tags) {
			if (tagModifiers[tag] != undefined) weight *= tagModifiers[tag];
			if (weight == 0) return 0;
		}
	}

	return weight;
}

/**
 *
 * @param {string} index
 * @param {number} indX
 * @param {number} indY
 * @param {Record<string, KDMapTile>} tilesFilled
 * @param {Record<string, string>} indexFilled
 * @param {Record<string, boolean>} requiredAccess
 * @param {Record<string, boolean>} globalTags
 * @param {Record<string, string>} indices
 * @param {Record<string, number>} tagModifiers
 * @returns {string}
 */
function KD_GetMapTile(index, indX, indY, tilesFilled, indexFilled, tagCounts, requiredAccess, globalTags, indices, tagModifiers) {
	let tagList = {
		"1,1": KDAggregateTileTags(indX, indY, 1, 1, tilesFilled, globalTags),
	};

	let tile = null;

	let WeightTotal = 0;
	let Weights = [];

	for (let mapTile of Object.values(KDMapTilesList)) {
		if (mapTile.primInd == index) {
			if (!KDCheckMapTileFilling(mapTile, indX, indY, indices, requiredAccess, indexFilled)) continue;

			if (!KDCheckMapTileAccess(mapTile, indX, indY, indexFilled, requiredAccess)) continue;

			// Aggregate tags for the creation and evaluation of this tile, caching them if needed
			let tags = tagList[mapTile.w + ',' + mapTile.h];
			if (!tags) {
				tags = KDAggregateTileTags(indX, indY, mapTile.w, mapTile.h, tilesFilled, globalTags);
				tagList[mapTile.w + ',' + mapTile.h] = tags;
			}

			if (requiredAccess[indX + ',' + indY]) tags.start = true;

			// Determine tile candidate weight and then commit to the array if it's positive
			let weight = KDGetTileWeight(mapTile, tags, tagCounts, tagModifiers);
			if (weight > 0) {
				Weights.push({tile: mapTile, weight: WeightTotal});
				WeightTotal += mapTile.weight;
			}
		}

	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			tile = Weights[L].tile.name;
			break;
		}
	}

	if (!tile) {
		console.log("ERROR AT INDEX " + indX + "," + indY);
	}

	return tile;
}

/**
 *
 * @param {KDMapTile} mapTile
 * @param {number} indX
 * @param {number} indY
 * @param {Record<string, string>} indices
 * @param {Record<string, boolean>} requiredAccess
 * @param {Record<string, string>} indexFilled
 * @returns {boolean}
 */
function KDCheckMapTileFilling(mapTile, indX, indY, indices, requiredAccess, indexFilled) {
	// Skip over larger tiles that dont fit the tilesFilled map or are already filled
	for (let xx = 1; xx <= mapTile.w; xx++)
		for (let yy = 1; yy <= mapTile.h; yy++) {
			// The index store of the map tile, we compare to the indices of indexfilled
			let ind = mapTile.index[xx + ',' + yy];
			// Skip this mapTile if it doesnt fit
			if (ind != indices[(xx + indX - 1) + ',' + (yy + indY - 1)]) return false;
			// Skip this mapTile if it's already filled
			if (indexFilled[(xx + indX - 1) + ',' + (yy + indY - 1)]) return false;
			// Make sure none of the tile overlaps with required access...
			if (mapTile.w != 1 || mapTile.h != 1 || (mapTile.inaccessible && mapTile.inaccessible.length > 0)) {
				if (requiredAccess[(xx + indX - 1) + ',' + (yy + indY - 1)]) return false;
			}
		}
	return true;
}

/**
 *
 * @param {KDMapTile} mapTile
 * @param {number} indX
 * @param {number} indY
 * @param {Record<string, string>} indexFilled
 * @param {Record<string, boolean>} requiredAccess
 * @returns {boolean}
 */
function KDCheckMapTileAccess(mapTile, indX, indY, indexFilled, requiredAccess) {
	// If any entrance pairs are inaccessible then BOTH must be filled in...
	if (mapTile.inaccessible) {
		for (let access of mapTile.inaccessible) {
			let XX1 = indX + access.indX1 - 1;
			let XX2 = indX + access.indX2 - 1;
			let YY1 = indY + access.indY1 - 1;
			let YY2 = indY + access.indY2 - 1;

			if ((access.dir1 == "l" && !indexFilled[(XX1 - 1) + ',' + (YY1)])
				|| (access.dir1 == "r" && !indexFilled[(XX1 + 1) + ',' + (YY1)])
				|| (access.dir1 == "u" && !indexFilled[(XX1) + ',' + (YY1 - 1)])
				|| (access.dir1 == "d" && !indexFilled[(XX1) + ',' + (YY1 + 1)])
			) return false;

			if ((access.dir2 == "l" && !indexFilled[(XX2 - 1) + ',' + (YY2)])
				|| (access.dir2 == "r" && !indexFilled[(XX2 + 1) + ',' + (YY2)])
				|| (access.dir2 == "u" && !indexFilled[(XX2) + ',' + (YY2 - 1)])
				|| (access.dir2 == "d" && !indexFilled[(XX2) + ',' + (YY2 + 1)])
			) return false;
		}
	}
	return true;
}

/**
 *
 * @param {KDMapTile} tile
 * @param {number} x
 * @param {number} y
 * @param {any} y
 * @returns {string[]}
 */
function KD_PasteTile(tile, x, y, data) {
	let tileWidth = KDTE_Scale * tile.w;
	let tileHeight = KDTE_Scale * tile.h;

	for (let xx = 0; xx < tileWidth; xx++)
		for (let yy = 0; yy < tileHeight; yy++) {
			let tileTile = tile.grid[xx + yy*(tileWidth+1)];
			KinkyDungeonMapSetForce(x + xx, y + yy, tileTile);
		}


	if (tile.POI)
		for (let origPoi of tile.POI) {
			let poi = Object.assign({}, origPoi);
			KinkyDungeonPOI.push(poi);
			poi.x = x + poi.x;
			poi.y = y + poi.y;
			if (poi.chance && KDRandom() > poi.chance)
				poi.used = true;
		}
	for (let tileLoc of tile.Tiles) {
		let xx = parseInt(tileLoc[0].split(',')[0]);
		let yy = parseInt(tileLoc[0].split(',')[1]);
		if (xx != undefined && yy != undefined) {
			let gennedTile = KDCreateTile(xx+x, yy+y, tileLoc[1], data);
			if (gennedTile)
				KinkyDungeonTiles.set((xx + x) + "," + (yy + y), gennedTile);
		}
	}
	for (let tileLoc of tile.Skin) {
		let xx = parseInt(tileLoc[0].split(',')[0]);
		let yy = parseInt(tileLoc[0].split(',')[1]);
		if (xx != undefined && yy != undefined) {
			KinkyDungeonTilesSkin.set((xx + x) + "," + (yy + y), tileLoc[1]);
		}
	}
	/*for (let jail of tile.Jail) {
		let newJail = Object.assign({}, jail);
		newJail.x += x;
		newJail.y += y;
		KDGameData.JailPoints.push(newJail);

	}*/

	for (let tileLoc of tile.effectTiles) {
		let xx = parseInt(tileLoc[0].split(',')[0]);
		let yy = parseInt(tileLoc[0].split(',')[1]);
		if (xx != undefined && yy != undefined) {
			for (let eTile of tileLoc[1]) {
				KDCreateEffectTileTile(xx+x, yy+y, eTile[1], data);
			}
		}
	}

	return tile.tags;
}


let KDEffectTileGen = {
	"TorchUnlit": (x, y, tile, tileGenerator, data) => {
		let torchlitchance = data.params.torchlitchance || 0.6;
		let torchreplace = data.params.torchreplace;

		let spr = torchreplace ? torchreplace.sprite : "Torch";
		if ((!torchreplace || torchreplace.unlitsprite) && KDRandom() > torchlitchance) {
			spr = torchreplace ? torchreplace.unlitsprite : "TorchUnlit";
		}
		KDCreateEffectTile(x, y, {
			name: spr,
			duration: 9999,
		}, 0);
		return null;
	},
	"Torch": (x, y, tile, tileGenerator, data) => {
		let torchlitchance = 1.0;
		let torchreplace = data.params.torchreplace;

		let spr = torchreplace ? torchreplace.sprite : "Torch";
		if ((!torchreplace || torchreplace.unlitsprite) && KDRandom() > torchlitchance) {
			spr = torchreplace ? torchreplace.unlitsprite : "TorchUnlit";
		}
		KDCreateEffectTile(x, y, {
			name: spr,
			duration: 9999,
		}, 0);
		return null;
	},
};

/**
 * @type {Record<string, (x: number, y: number, tile: any, tileGenerator: any, data: {params: floorParams; chestlist: any[]; traps: any[]; shrinelist: any[]; chargerlist: any[]; spawnpoints: any[]}) => any>}
 */
let KDTileGen = {
	"Rubble": (x, y, tile, tileGenerator, data) => {
		let rubblechance = data.params.rubblechance || 0.5;
		if (KDRandom() < rubblechance)
			KinkyDungeonMapSet(x, y, 'R');
		else if (KDRandom() < rubblechance * rubblechance - 0.01)
			KinkyDungeonMapSet(x, y, '/');
		else
			KinkyDungeonMapSet(x, y, 'r');
		return null;
	},
	"Debris": (x, y, tile, tileGenerator, data) => {
		let rubblechance = data.params.rubblechance || 1;
		if (tileGenerator.Always || KDRandom() < rubblechance)
			KinkyDungeonMapSet(x, y, '/');
		else
			KinkyDungeonMapSet(x, y, 'r');
		return null;
	},
	"Barrel": (x, y, tile, tileGenerator, data) => {
		let barrelChance = data.params.barrelChance || 0.25;
		if (tileGenerator.Always || KDRandom() < barrelChance)
			KinkyDungeonMapSet(x, y, 'L');
		else
			KinkyDungeonMapSet(x, y, 'r');
		return null;
	},
	"Spawn": (x, y, tile, tileGenerator, data) => {
		data.spawnpoints.push({x:x, y:y, required: tileGenerator.required, tags: tileGenerator.tags, AI: tileGenerator.AI});
		KinkyDungeonMapSet(x, y, '0');
		return null;
	},
	"ForceSpawn": (x, y, tile, tileGenerator, data) => {
		if (!tileGenerator.Chance || KDRandom() < tileGenerator.Chance) {
			let enemy = KinkyDungeonGetEnemy(tileGenerator.tags, MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
				'0', tileGenerator.required, tileGenerator.requireHostile, tileGenerator.bonusTags, tileGenerator.filterTags, tileGenerator.requireSingleTag);
			DialogueCreateEnemy(x, y, enemy.name);
		}
		KinkyDungeonMapSet(x, y, '0');
		return null;
	},
	"Prisoner": (x, y, tile, tileGenerator, data) => {
		SetpieceSpawnPrisoner(x, y);
		KinkyDungeonMapSet(x, y, '0');
		return null;
	},
	"Chest": (x, y, tile, tileGenerator, data) => {
		if (tileGenerator.Loot) {
			if (tileGenerator.Priority || KDRandom() < 0.5) {
				KinkyDungeonMapSet(x, y, 'C');
				return {
					NoTrap: tileGenerator.NoTrap,
					Type: tileGenerator.Lock ? "Lock" : undefined, Lock: tileGenerator.Lock,
					Loot: tileGenerator.Lock == "Blue" ? "blue" : (tileGenerator.Loot ? tileGenerator.Loot : "chest"),
					//Faction: tileGenerator.Faction,
					Roll: KDRandom(),
					Special: tileGenerator.Lock == "Blue",
					RedSpecial: tileGenerator.Lock == "Red",
					lootTrap: KDGenChestTrap(false, x, y, (tileGenerator.Loot ? tileGenerator.Loot : "chest"), tileGenerator.Lock, tileGenerator.NoTrap),
				};
			} else {
				KinkyDungeonMapSet(x, y, 'c');
			}
		} else {
			data.chestlist.push(({x: x, y: y, priority: tileGenerator.Priority, NoTrap: tileGenerator.NoTrap}));
			KinkyDungeonMapSet(x, y, '2');
		}
		return null;
	},
	"GuardedChest": (x, y, tile, tileGenerator, data) => {
		KinkyDungeonMapSet(x, y, 'C');
		let faction = KDPlaceChest(x - 1, y - 1, 3, data.chestlist, data.spawnpoints, true);
		return {
			NoTrap: tileGenerator.NoTrap,
			Type: tileGenerator.Lock ? "Lock" : undefined, Lock: tileGenerator.Lock,
			Loot: tileGenerator.Lock == "Blue" ? "blue" : (tileGenerator.Loot ? tileGenerator.Loot : "chest"),
			Faction: faction,
			Roll: KDRandom(),
			Special: tileGenerator.Lock == "Blue",
			RedSpecial: tileGenerator.Lock == "Red",
			lootTrap: KDGenChestTrap(false, x, y, (tileGenerator.Loot ? tileGenerator.Loot : "chest"), tileGenerator.Lock, tileGenerator.NoTrap),
		};
	},
	"ChestOrShrine": (x, y, tile, tileGenerator, data) => {
		let chestcount = data.params.chestcount || 1;
		let shrinecount = data.params.shrinecount || 1;
		if (KDRandom() < (chestcount) / Math.max(1, chestcount + shrinecount))
			data.chestlist.push(({x: x, y: y, NoTrap: tileGenerator.NoTrap}));
		else
			data.shrinelist.push(({x: x, y: y, NoTrap: tileGenerator.NoTrap}));
		KinkyDungeonMapSet(x, y, '2');
		return null;
	},
	"Door": (x, y, tile, tileGenerator, data) => {
		let doorchance = data.params.doorchance; // Chance door will be closed
		let nodoorchance = data.params.nodoorchance || 0; // Chance of there not being a door

		// No doors/grates next to each other unless forced
		if ("Ddg".includes(KinkyDungeonMapGet(x - 1, y))
			|| "Ddg".includes(KinkyDungeonMapGet(x + 1, y))
			|| "Ddg".includes(KinkyDungeonMapGet(x, y - 1))
			|| "Ddg".includes(KinkyDungeonMapGet(x, y + 1)))
			nodoorchance = 1.0;

		// The door algorithm has been deprecated
		//let doorlockchance = data.params.doorlockchance; // Max treasure chest count

		if (tileGenerator.Priority || KDRandom() > nodoorchance) {
			if (tileGenerator.AlwaysClose || KDRandom() < doorchance) {
				KinkyDungeonMapSet(x, y, 'D');
			} else {
				KinkyDungeonMapSet(x, y, 'd');
			}
			return {Type: "Door", Lock: tileGenerator.Lock, OffLimits: tileGenerator.OffLimits};
		} else {
			KinkyDungeonMapSet(x, y, '2');
		}
		return null;
	},
	"Shrine": (x, y, tile, tileGenerator, data) => {
		data.shrinelist.push(({x: x, y: y, priority: tileGenerator.Priority}));
		KinkyDungeonMapSet(x, y, 'a');
		return null;
	},
	"Cage": (x, y, tile, tileGenerator, data) => {
		KinkyDungeonMapSet(x, y, 'L');
		KDGameData.JailPoints.push({x: x, y: y, type: "furniture", radius: 1});
		return {Furniture: "Cage"};
	},
	"Table": (x, y, tile, tileGenerator, data) => {
		KinkyDungeonMapSet(x, y, 'F');
		let type = "";

		if (tileGenerator.Food == "Plate") {
			let WeightTotal = 0;
			let Weights = [];

			for (let obj of Object.values(KDFood)) {
				Weights.push({event: obj, weight: WeightTotal});
				WeightTotal += obj.Weight;
			}

			let selection = KDRandom() * WeightTotal;

			for (let L = Weights.length - 1; L >= 0; L--) {
				if (selection > Weights[L].weight) {
					type =  Weights[L].event.Food;
					break;
				}
			}
		}
		return {Food: type, Type: "Food"};
	},
	"Trap": (x, y, tile, tileGenerator, data) => {
		let trapchance = data.params.trapchance || 0.1;
		if (tileGenerator.Always || KDRandom() < trapchance)
			data.traps.push(({x: x, y: y}));
		else
			KinkyDungeonMapSet(x, y, '2');
		return null;
	},
	"Charger": (x, y, tile, tileGenerator, data) => {
		if (tileGenerator.priority) {
			return {Type: "Charger", NoRemove: tile == '=', lightColor: KDChargerColor, Light: (tile == '=' ? KDChargerLight : undefined)};
		}
		KinkyDungeonMapSet(x, y, '-');
		data.chargerlist.push(({x: x, y: y}));
		return null;
	},
};

/**
 * Creates a map tile based on a generator tile
 * @param {number} x
 * @param {number} y
 * @param {any} tileGenerator
 * @param {any} data
 * @returns {any}
 */
function KDCreateTile(x, y, tileGenerator, data) {
	let tile = {};
	if (tileGenerator.Type) {
		tile = KDTileGen[tileGenerator.Type](x, y, tile, tileGenerator, data);
	} else {
		tile = Object.assign({}, tileGenerator);
		tile.x = x;
		tile.y = y;
	}
	if (tile)
		return tile;
}


/**
 * Creates a map tile based on a generator tile
 * @param {number} x
 * @param {number} y
 * @param {any} tileGenerator
 * @param {any} data
 * @returns {any}
 */
function KDCreateEffectTileTile(x, y, tileGenerator, data) {
	let tile = {};
	if (tileGenerator.name && KDEffectTileGen[tileGenerator.name]) {
		tile = KDEffectTileGen[tileGenerator.name](x, y, tile, tileGenerator, data);
	} else {
		tile = KDCreateEffectTile(x, y, {
			name: tileGenerator.name,
			duration: tileGenerator.duration,
		}, 0);
	}
	if (tile)
		return tile;
}

/**
 * Aggregates tags from nearby tiles for the specific tile
 * @param {number} x - Top left corner
 * @param {number} y - Top left corner
 * @param {number} w - Tile size
 * @param {number} h - Tile size
 * @param {Record<string, KDMapTile>} tilesFilled
 * @param {Record<string, boolean>} globalTags
 * @return {Record<string, boolean>}
 */
function KDAggregateTileTags(x, y, w, h, tilesFilled, globalTags) {
	/**
	 * Record of tag name => tile that has the tag
	 * @type {Record<string, boolean>}
	 */
	let tags = Object.assign({}, globalTags);

	// Loop over tile's borders and add up tags
	for (let indX = x - 1; indX <= x + w; indX++)
		for (let indY = y - 1; indY <= y + h; indY++) {
			let index = indX < x ? "L_" : (indX >= x + w ? "R_" : "");
			index = (indY < y ? "U" : (indY >= y + h ? "D" : "")) + index;

			if (index) {
				let neighbor = tilesFilled[indX + ',' + indY];
				if (neighbor) {
					for (let t of neighbor.tags) {
						tags[index + t] = true;
						tags[t] = true;
					}
				}
			}
		}

	return tags;
}