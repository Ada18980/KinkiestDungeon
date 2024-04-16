"use strict";

let KDSetpieceAttempts = 10;

let KDSetPieces = [
	{Name: "Bedroom", tags: ["decorative", "urban"], Radius: 4},
	{Name: "Graveyard", tags: ["decorative", "temple"], Radius: 5},
	{Name: "Altar", tags: ["shrine", "temple"], Radius: 5},
	{Name: "SmallAltar", tags: ["shrine", "temple", "endpoint"], Radius: 3, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
	{Name: "FuukaAltar", tags: ["boss", "temple"], Radius: 7, Max: 1},
	{Name: "Storage", tags: ["loot", "urban", "endpoint"], Radius: 7},
	{Name: "GuardedChest", tags: ["loot", "endpoint"], Radius: 3, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
	{Name: "BanditPrison", tags: ["rep", "endpoint"], Radius: 3, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
	{Name: "QuadCell", tags: ["decorative", "urban"], Radius: 7},
	{Name: "PearlChest", tags: ["loot", "pearl"], Radius: 3, Prereqs: ["PearlEligible"], Max: 1, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
	{Name: "ShadowChest", tags: ["loot", "endpoint", "temple", "urban", "jungle", "cavern", "shadow"], Radius: 5, Max: 2},
	{Name: "GuaranteedCell", tags: ["jail", "urban", "endpoint", "industrial", "temple", "factory", "cavern", "jungle"], Radius: 5, Max: 1, xPad: 2},
	{Name: "ForbiddenChest", tags: ["loot", "temple", "urban", "endpoint"], Radius: 3, Max: 1, xPad: 1},
	//{Name: "ForbiddenHall", tags: ["loot", "temple", "open"], Radius: 7, Max: 1, xPad: 1},
	{Name: "Cache", tags: ["loot", "urban", "endpoint"], Radius: 7, Max: 1, xPad: 2},
	{Name: "ExtraCell", tags: ["jail", "urban", "endpoint"], Radius: 4, xPad: 2, yPad: 1, xPadEnd: 2, yPadEnd: 1},
	{Name: "JungleLight", tags: ["natural", "light"], noPOI: true, Radius: 1, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
	{Name: "Fireflies", tags: ["natural", "light"], noPOI: true, Radius: 1, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
	{Name: "Magicflies", tags: ["temple", "light"], noPOI: true, Radius: 1, xPad: 1, yPad: 1, xPadEnd: 1, yPadEnd: 1},
];

let KDCountSetpiece = new Map();

function KinkyDungeonPlaceSetPieces(POI, trapLocations, chestlist, shrinelist, chargerlist, spawnPoints, InJail, width, height) {
	KDCountSetpiece = new Map();
	let pieces = new Map();

	let Params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
	let setpieces = [];
	let alt = !KDGameData.RoomType ? KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel) : KinkyDungeonAltFloor(KDGameData.RoomType);
	let forcePOI = !alt || !alt.genType;//Params.forcePOI ? true : false;
	if (!alt) {
		Object.assign(setpieces, Params.setpieces);
		setpieces.push({Type: "GuaranteedCell", Weight: 100000});

		for (let i of KDGameData.ChestsGenerated) {
			console.log(i);
		}

		//if (!KDGameData.ChestsGenerated.includes("cache"))
		//setpieces.push({Type: "Cache", Weight: 100000});
		//setpieces.push({Type: "PearlChest", Weight: 100});
		let forbiddenChance = Params.forbiddenChance != undefined ? Params.forbiddenChance : 1;
		//let greaterChance = Params.forbiddenGreaterChance != undefined ? Params.forbiddenGreaterChance : 0.5;
		if (KinkyDungeonStatsChoice.get("hardMode")) {
			setpieces.push({Type: "ShadowChest", Weight: 10000});
			forbiddenChance = 1;
			//greaterChance = Math.max(greaterChance, 1.0);
		}
		if (KDRandom() < forbiddenChance) {
			if (!KDGameData.ChestsGenerated.includes("lessergold"))
				setpieces.push({Type: "ForbiddenChest", Weight: 100000});
		}
	} else {
		for (let s of Object.entries(alt.setpieces)) {
			setpieces.push({Type: s[0], Weight: s[1]});
		}
	}

	if (KDGameData.MapMod) {
		let mapmod = KDMapMods[KDGameData.MapMod];
		if (mapmod && mapmod.bonussetpieces) {
			for (let s of mapmod.bonussetpieces) {
				setpieces.push(s);
			}
		}
	}

	// Populate the map
	for (let p of KDSetPieces) {
		let prereqs = true;
		if (prereqs && p.Prereqs) {
			if (prereqs && p.Prereqs.includes("PearlEligible")) {
				let has = KDPearlRequirement();
				if (!has) prereqs = false;
			}
		}
		if (prereqs)
			pieces.set(p.Name, p);
	}

	let pieceCount = width * height / 25;
	let count = 0;
	let fails = 0;
	while (count < pieceCount && fails < KDSetpieceAttempts) {
		let Piece = KinkyDungeonGetSetPiece(POI, setpieces, pieces);
		if (Piece && pieces.get(Piece) && KinkyDungeonGenerateSetpiece(POI, pieces.get(Piece), InJail,
			trapLocations, chestlist, shrinelist, chargerlist, spawnPoints,
			forcePOI && !pieces.get(Piece).noPOI, alt, Params).Pass) {
			count += 1;
			KDCountSetpiece.set(Piece, KDCountSetpiece.get(Piece) ? (KDCountSetpiece.get(Piece) + 1) : 1);
		} else fails += 1;
	}

}

function KDGetFavoredSetpieces(POI, setpieces) {
	let pieces = [];
	for (let p of POI) {
		if (p.used) continue;
		for (let f of p.favor) {
			if (!pieces.includes(f)) {
				pieces.push(f);
			}
		}
	}
	return setpieces.filter((p) => {return pieces.includes(p.Name);});
}
function KDGetFavoringSetpieces(Name, tags, POI, POIBlacklist) {
	let pois = [];
	for (let p of POI) {
		if (POIBlacklist && POIBlacklist.get(p)) continue;
		if (p.used) continue;
		if (p.favor.includes(Name)) {
			pois.push(p);
		}
	}
	// Always favor by name first
	if (pois.length == 0)
		for (let p of POI) {
			if (POIBlacklist && POIBlacklist.get(p)) continue;
			if (p.used) continue;
			if (p.requireTags.length == 0 || p.requireTags.some((tag) => {return tags.includes(tag);})) {
				pois.push(p);
			}
		}

	return pois[Math.floor(KDRandom() * pois.length)];
}

function KinkyDungeonGetSetPiece(POI, setpieces, pieces) {
	let setpieces2 = KDGetFavoredSetpieces(POI, setpieces);
	if (setpieces2.length < 1 || KDRandom() < 0.1) setpieces2 = setpieces;

	if (setpieces2) {

		let pieceWeightTotal = 0;
		let pieceWeights = [];

		for (let piece of setpieces2) {
			if (pieces.has(piece.Type) && (!pieces.get(piece.Type).Max || !(KDCountSetpiece.get(piece.Type) >= pieces.get(piece.Type).Max))) {
				pieceWeights.push({piece: piece, weight: pieceWeightTotal});
				pieceWeightTotal += piece.Weight;
			}
		}

		let selection = KDRandom() * pieceWeightTotal;

		for (let L = pieceWeights.length - 1; L >= 0; L--) {
			if (selection > pieceWeights[L].weight) {
				return pieceWeights[L].piece.Type;
			}
		}
	}
}

function KinkyDungeonGenerateSetpiece(POI, Piece, InJail, trapLocations, chestlist, shrinelist, chargerlist, spawnPoints, forcePOI, altType, MapParams) {
	let radius = Piece.Radius;
	let xPadStart = Piece.xPad || 5;
	let yPadStart = Piece.yPad || 2;
	let xPadEnd = Piece.xPadEnd || 2;
	let yPadEnd = Piece.yPadEnd || 2;
	if (InJail) {
		xPadStart = Math.max(xPadStart, KinkyDungeonJailLeashX + 2);
	}
	let cornerX =  Math.ceil(xPadStart) + Math.floor(KDRandom() * (KDMapData.GridWidth - xPadStart - xPadEnd - radius - 1));
	let cornerY = Math.ceil(yPadStart) + Math.floor(KDRandom() * (KDMapData.GridHeight - yPadStart - yPadEnd - radius - 1));

	let favoringPOI = KDGetFavoringSetpieces(Piece.Name, Piece.tags ? Piece.tags : ["decorative"], POI);
	if (favoringPOI) {
		cornerX = favoringPOI.x - Math.floor(Piece.Radius / 2);
		cornerY = favoringPOI.y - Math.floor(Piece.Radius / 2);
	}

	let i = 0;
	let POIBlacklist = new Map();
	for (i = 0; i < 1000; i++) {
		let specialDist = KinkyDungeonGetClosestSpecialAreaDist(cornerX + Math.floor(radius/2) - 1, cornerY + Math.floor(radius/2));
		if (specialDist <= (forcePOI ? 0 : 1) + Math.ceil(radius/2) || !(cornerX > Math.ceil(xPadStart) && cornerX < KDMapData.GridWidth - radius - xPadEnd && cornerY > Math.ceil(yPadStart) && cornerY < KDMapData.GridHeight - radius - yPadEnd)) {
			cornerY = Math.ceil(yPadStart) + Math.floor(KDRandom() * (KDMapData.GridHeight - yPadStart - yPadEnd - radius - 1));
			cornerX = Math.ceil(xPadStart) + Math.floor(KDRandom() * (KDMapData.GridWidth - xPadStart - radius - 1));

			if (i < 100 || i % 3 == 0 || forcePOI) {
				favoringPOI = KDGetFavoringSetpieces(Piece.Name, Piece.tags ? Piece.tags : ["decorative"], POI, POIBlacklist);
				if (favoringPOI) {
					cornerX = favoringPOI.x - Math.floor(Piece.Radius / 2);
					cornerY = favoringPOI.y - Math.floor(Piece.Radius / 2);
					POIBlacklist.set(favoringPOI, true);
				}
			}
		} else break;
	}
	if (i > 990) {
		console.log("Could not place " + Piece.Name);
		return {Pass: false, Traps: trapLocations};
	}

	if (favoringPOI)
		favoringPOI.used = true;
	let skip = false;
	if (forcePOI && !favoringPOI) {
		skip = true;
	}

	if (!skip)
		switch (Piece.Name) {
			case "Bedroom":
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, true, false, 1, true);
				if (KDRandom() < 0.25) {
					KinkyDungeonMapSet(cornerX + 2, cornerY + 3, 'D');
					KinkyDungeonMapSet(cornerX + 2, cornerY + 1, 'c');
					KinkyDungeonTilesSet("" + (cornerX + 2) + "," + (cornerY + 3), {Type: "Door", NoTrap: true, OL: true});
				} else if (KDRandom() < 0.33) {
					KinkyDungeonMapSet(cornerX + 2, cornerY, 'D');
					KinkyDungeonMapSet(cornerX + 1, cornerY + 2, 'c');
					KinkyDungeonTilesSet("" + (cornerX + 2) + "," + (cornerY), {Type: "Door", NoTrap: true, OL: true});
				} else if (KDRandom() < 0.5) {
					KinkyDungeonMapSet(cornerX + 3, cornerY + 2, 'D');
					KinkyDungeonMapSet(cornerX + 2, cornerY + 1, 'c');
					KinkyDungeonTilesSet("" + (cornerX + 3) + "," + (cornerY + 2), {Type: "Door", NoTrap: true, OL: true});
				} else {
					KinkyDungeonMapSet(cornerX, cornerY + 2, 'D');
					KinkyDungeonMapSet(cornerX + 2, cornerY + 1, 'c');
					KinkyDungeonTilesSet("" + (cornerX) + "," + (cornerY + 2), {Type: "Door", NoTrap: true, OL: true});
				}
				KinkyDungeonMapSet(cornerX + 1, cornerY + 1, 'B');
				if (KinkyDungeonStatsChoice.has("Nowhere")) {
					if (KDRandom() < 0.5)
						KinkyDungeonTilesSet((cornerX + 1) + "," + (cornerY + 1), {
							Type: "Trap",
							Trap: "BedTrap",
						});
				}
				if (KDRandom() < 0.15) spawnPoints.push({x:cornerX + 1, y:cornerY + 1, required: ["human"], AI: "guard"});
				break;
			case "Graveyard": {
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 1, true);
				// Place doors around pairs
				KDCreateDoors(cornerX - 1, cornerY - 1, radius + 2, radius + 2);
				let ghost = false;
				for (let X = cornerX; X <= cornerX + radius - 1; X += 2) {
					for (let Y = cornerY; Y < cornerY + radius; Y += 2) {
						if (KDRandom() < 0.5) KinkyDungeonMapSet(X, Y, 'X');
						else if (KDRandom() < 0.33) KinkyDungeonMapSet(X, Y, 'a');
						else KinkyDungeonMapSet(X, Y, '2');
						if (!ghost && KDRandom() < 0.14) {
							spawnPoints.push({x:X, y:Y, required: ["ghost"], tags: ["ghost"], AI: "guard"});
							ghost = true;
						}
					}
				}
			}
				break;
			case "Altar":
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 1, false);
				// Place doors around pairs
				KDCreateDoors(cornerX - 1, cornerY - 1, radius + 2, radius + 2);
				KinkyDungeonMapSet(cornerX, cornerY , 'X');
				KinkyDungeonMapSet(cornerX + radius - 1, cornerY, 'X');
				KinkyDungeonMapSet(cornerX, cornerY + radius - 1, 'X');
				KinkyDungeonMapSet(cornerX + radius - 1, cornerY + radius - 1, 'X');
				shrinelist.push({x: cornerX + 2, y: cornerY + 2, priority: true});
				break;
			case "SmallAltar":
				if (!favoringPOI || KinkyDungeonBoringGet(cornerX + 1, cornerY + 1) < 3) skip = true;
				else {
					KinkyDungeonCreateRectangle(cornerX, cornerY, 2, 2, false, false, 0, false);
					let xx = 1;
					//if (KDRandom() < 0.5) {
					// xx = 0;
					//}
					KinkyDungeonMapSet(cornerX + xx, cornerY + 1, 'a');
					shrinelist.push({x: cornerX + xx, y: cornerY + 1, priority: true});
					if (KinkyDungeonMapGet(cornerX + xx, cornerY) == '1') KinkyDungeonMapSet(cornerX + xx, cornerY, 'm');
					if (KinkyDungeonMapGet(cornerX + xx, cornerY + 2) == '1') KinkyDungeonMapSet(cornerX + xx, cornerY + 2, 'm');

					if (KinkyDungeonMapGet(cornerX + xx - 1, cornerY) == '1') KinkyDungeonMapSet(cornerX + xx - 1, cornerY, 'X');
					if (KinkyDungeonMapGet(cornerX + xx - 1, cornerY + 1) == '1') KinkyDungeonMapSet(cornerX + xx - 1, cornerY + 1, 'm');
					if (KinkyDungeonMapGet(cornerX + xx - 1, cornerY + 2) == '1') KinkyDungeonMapSet(cornerX + xx - 1, cornerY + 2, 'X');

					if (KinkyDungeonMapGet(cornerX + xx + 1, cornerY) == '1') KinkyDungeonMapSet(cornerX + xx + 1, cornerY, 'X');
					if (KinkyDungeonMapGet(cornerX + xx + 1, cornerY + 1) == '1') KinkyDungeonMapSet(cornerX + xx + 1, cornerY + 1, 'm');
					if (KinkyDungeonMapGet(cornerX + xx + 1, cornerY + 2) == '1') KinkyDungeonMapSet(cornerX + xx + 1, cornerY + 2, 'X');

					// Place doors around pairs
					KDCreateDoors(cornerX - 2 + xx, cornerY - 1, radius + 2, radius + 2);
				}
				break;
			case "FuukaAltar": {
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 1, false);
				KinkyDungeonMapSet(cornerX + 1, cornerY + 1 , 'o');
				KinkyDungeonMapSet(cornerX + radius - 2, cornerY + 1, 'o');
				KinkyDungeonMapSet(cornerX + 1, cornerY + radius - 2, 'o');
				KinkyDungeonMapSet(cornerX + radius - 2, cornerY + radius - 2, 'o');

				KinkyDungeonMapSet(cornerX, cornerY + 3 , 'o');
				KinkyDungeonMapSet(cornerX + 3, cornerY , 'o');
				KinkyDungeonMapSet(cornerX + 3, cornerY + radius - 1 , 'o');
				KinkyDungeonMapSet(cornerX + radius - 1, cornerY + 3 , 'o');

				let Enemy = KinkyDungeonGetEnemyByName("Fuuka1");
				let e = {tracking: true, Enemy: Enemy, id: KinkyDungeonGetEnemyID(), x:cornerX + 3, y:cornerY + 3, shield: Enemy.shield, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};
				KDAddEntity(e);
				KDStageBossGenerated = true;
				break;
			}
			case "PearlChest":
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 0, true);
				/*if (KDRandom() < 0.6) KinkyDungeonMapSet(cornerX, cornerY , 'a');
				else shrinelist.push({x: cornerX, y: cornerY, priority: true});
				if (KDRandom() < 0.6) KinkyDungeonMapSet(cornerX + radius - 1, cornerY, 'a');
				else shrinelist.push({x: cornerX + radius - 1, y: cornerY, priority: true});
				if (KDRandom() < 0.6) KinkyDungeonMapSet(cornerX, cornerY + radius - 1, 'a');
				else shrinelist.push({x: cornerX, y: cornerY + radius - 1, priority: true});
				if (KDRandom() < 0.6) KinkyDungeonMapSet(cornerX + radius - 1, cornerY + radius - 1, 'a');
				else shrinelist.push({x: cornerX + radius - 1, y: cornerY + radius - 1, priority: true});*/
				KinkyDungeonMapSet(cornerX, cornerY + 1, 'a');
				KinkyDungeonMapSet(cornerX + radius - 1, cornerY + 1, 'a');
				KinkyDungeonMapSet(cornerX + 1, cornerY + 1, 'C');
				KinkyDungeonTilesSet((cornerX + 1) + "," + (cornerY + 1), {Loot: "pearl", Roll: KDRandom()});
				break;
			case "ShadowChest":
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 0, false);
				// Place doors around pairs
				KDCreateDoors(cornerX - 1, cornerY - 1, radius + 2, radius + 2);
				KinkyDungeonMapSet(cornerX, cornerY , 'o');
				KinkyDungeonMapSet(cornerX + radius - 1, cornerY, 'o');
				KinkyDungeonMapSet(cornerX, cornerY + radius - 1, 'o');
				KinkyDungeonMapSet(cornerX + radius - 1, cornerY + radius - 1, 'o');

				if (!Piece.Chance || KDRandom() < Piece.Chance) {
					KinkyDungeonMapSet(cornerX + 2, cornerY + 2, 'C');
					KinkyDungeonTilesSet((cornerX + 2) + "," + (cornerY + 2), {
						Loot: "shadow", Roll: KDRandom(),
						lootTrap: KDGenChestTrap(true, cornerX + 2, cornerY + 2, "shadow", undefined, false)}
					);
					let chance = 0.75;
					let chance2 = 0.25;
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 3, y: cornerY + 1});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 3, y: cornerY + 2});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 3, y: cornerY + 3});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 1, y: cornerY + 1});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 1, y: cornerY + 2});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 1, y: cornerY + 3});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 2, y: cornerY + 1});
					if (KDRandom() < chance) trapLocations.push({x: cornerX + 2, y: cornerY + 3});

					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 1, y: cornerY});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 2, y: cornerY});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 3, y: cornerY});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 1, y: cornerY + radius - 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 2, y: cornerY + radius - 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 3, y: cornerY + radius - 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX, y: cornerY + 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX, y: cornerY + 2});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX, y: cornerY + 3});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + radius - 1, y: cornerY + 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + radius - 1, y: cornerY + 2});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + radius - 1, y: cornerY + 3});
				} else {
					shrinelist.push({x: cornerX+2, y: cornerY+2, priority: true});

					let chance2 = 0.1;
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 1, y: cornerY});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 2, y: cornerY});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 3, y: cornerY});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 1, y: cornerY + radius - 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 2, y: cornerY + radius - 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + 3, y: cornerY + radius - 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX, y: cornerY + 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX, y: cornerY + 2});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX, y: cornerY + 3});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + radius - 1, y: cornerY + 1});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + radius - 1, y: cornerY + 2});
					if (KDRandom() < chance2) trapLocations.push({x: cornerX + radius - 1, y: cornerY + 3});
				}

				break;
			case "GuaranteedCell": {
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, true, false, 1, true, true, true);
				KinkyDungeonMapSet(cornerX+4, cornerY+2, 'D');
				KinkyDungeonTilesSet("" + (cornerX+4) + "," + (cornerY+2), {Type: "Door", Lock: "Red", NoTrap: true, Jail: true, ReLock: true, OL: true});
				KDMapData.PatrolPoints.push({x: cornerX + 5, y: cornerY + 2});

				let sidestyle = Math.floor(KDRandom() * 3);
				if (sidestyle == 0) {
					// Porthole
					//KinkyDungeonMapSet(cornerX+1, cornerY, 'b');
					KinkyDungeonMapSet(cornerX+1 + Math.floor(KDRandom() * 3), cornerY, 'b');
					//KinkyDungeonMapSet(cornerX+3, cornerY, 'b');
				} else if (sidestyle == 1) {
					KinkyDungeonMapSet(cornerX, cornerY+1, 'b');
					KinkyDungeonMapSet(cornerX, cornerY+2, 'b');
					KinkyDungeonMapSet(cornerX, cornerY+3, 'b');
				} else {
					KinkyDungeonMapSet(cornerX+1, cornerY+4, 'b');
					KinkyDungeonMapSet(cornerX+2, cornerY+4, 'b');
					KinkyDungeonMapSet(cornerX+3, cornerY+4, 'b');
				}
				KinkyDungeonMapSet(cornerX+4, cornerY+1, 'b');
				KinkyDungeonMapSet(cornerX+4, cornerY+3, 'b');
				KinkyDungeonMapSet(cornerX+4, cornerY+1, 'b');

				KinkyDungeonMapSet(cornerX+2, cornerY+2, 'B');
				if (KDRandom() < 0.0 + (KDGameData.RoomType == "Jail" ? 1.0 : 0)) {
					SetpieceSpawnPrisoner(cornerX+1, cornerY+1);
				}
				if (KDRandom() < 0.5 + (KDGameData.RoomType == "Jail" ? 0.25 : 0)) {
					SetpieceSpawnPrisoner(cornerX+1, cornerY+2);
				}
				if (KDRandom() < 0.5 + (KDGameData.RoomType == "Jail" ? 0.25 : 0)) {
					SetpieceSpawnPrisoner(cornerX+1, cornerY+3);
				}
				KDMapData.JailPoints.push({x: cornerX+2, y: cornerY+2, type: "jail", radius: 1});
				let t = [];
				let jt = KDMapData.JailFaction?.length > 0 ? KinkyDungeonFactionTag[[KDMapData.JailFaction[Math.floor(KDRandom() * KDMapData.JailFaction.length)]]] : "jailer";
				t.push(jt);
				spawnPoints.push({x:cornerX+5, y:cornerY + 1, required: ["jail", ...t], tags: t, AI: "guard", force: true, keys: true, faction: KDGetMainFaction() || "Enemy"});
				spawnPoints.push({x:cornerX+5, y:cornerY + 3, required: ["jail", ...t], tags: t, AI: "guard", force: true, keys: true, faction: KDGetMainFaction() || "Enemy"});
				KDTorch(cornerX + 2, cornerY, altType, MapParams);
				break;
			}
			case "ExtraCell": {
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, true, false, 1, true, true);
				KinkyDungeonMapSet(cornerX+3, cornerY+1, 'D');
				KinkyDungeonTilesSet("" + (cornerX+3) + "," + (cornerY+1), {Type: "Door", NoTrap: true, Jail: true, ReLock: true, OL: true});


				let t = [];
				let jt = KDMapData.JailFaction?.length > 0 ? KinkyDungeonFactionTag[[KDMapData.JailFaction[Math.floor(KDRandom() * KDMapData.JailFaction.length)]]] : "jailer";
				t.push(jt);
				spawnPoints.push({x:cornerX+4, y:cornerY + 2, required: ["jail", ...t], tags: t, AI: "guard", force: true, keys: true, faction: KDGetMainFaction() || "Enemy"});

				KinkyDungeonMapSet(cornerX+3, cornerY+2, 'b');

				// Chance for seethru
				if (KDRandom() < 0.5) {
					KinkyDungeonMapSet(cornerX, cornerY+1, 'b');
					KinkyDungeonMapSet(cornerX, cornerY+2, 'b');
				}
				if (KDRandom() < 0.5) {
					KinkyDungeonMapSet(cornerX+1, cornerY, 'b');
					KinkyDungeonMapSet(cornerX+2, cornerY, 'b');
				}
				if (KDRandom() < 0.5) {
					KinkyDungeonMapSet(cornerX+1, cornerY+3, 'b');
					KinkyDungeonMapSet(cornerX+2, cornerY+3, 'b');
				}

				if (KDRandom() < 0.6 + (KDGameData.RoomType == "Jail" ? 0.35 : 0)) {
					SetpieceSpawnPrisoner(cornerX+1, cornerY+2);
				}

				KinkyDungeonMapSet(cornerX+1, cornerY+1, 'B');
				KDTorch(cornerX + 1, cornerY, altType, MapParams);
				KDMapData.JailPoints.push({x: cornerX+1, y: cornerY+1, type: "jail", radius: 1});
				break;
			}
			case "JungleLight": {
				if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(cornerX, cornerY))) skip = true;
				else {
					KinkyDungeonMapSet(cornerX, cornerY, '2');
					KinkyDungeonTilesSet((cornerX) + "," + (cornerY), {Light: 6, Skin: "LightRays"});
				}
				break;
			}
			case "Fireflies": {
				if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(cornerX, cornerY))) skip = true;
				else
					KinkyDungeonTilesSet((cornerX) + "," + (cornerY), {Light: 2, Skin: "Fireflies"});
				break;
			}
			case "Magicflies": {
				if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(cornerX, cornerY))) skip = true;
				else
					KinkyDungeonTilesSet((cornerX) + "," + (cornerY), {Light: 2, Skin: "Magicflies"});
				break;
			}
			case "Storage": {
				let rad = radius - 2;
				KinkyDungeonCreateRectangle(cornerX + 1, cornerY + 1, rad, rad, true, false, 1, false);
				KDMapData.PatrolPoints.push({x: cornerX + 1 + 2, y: cornerY + 1 + 2});
				KinkyDungeonMapSet(cornerX + 1+2, cornerY + 1 , KDRandom() < 0.5 ? 'D' : (KDRandom() < 0.5 ? 'g' : 'd'));
				KinkyDungeonTilesSet("" + (cornerX + 1+2) + "," + (cornerY + 1), {Type: "Door"});
				KinkyDungeonMapSet(cornerX + 1+2, cornerY + 1+4 , KDRandom() < 0.5 ? 'D' : (KDRandom() < 0.5 ? 'g' : 'd'));
				KinkyDungeonTilesSet("" + (cornerX + 1+2) + "," + (cornerY + 1+4), {Type: "Door"});

				KinkyDungeonMapSet(cornerX + 1+1, cornerY + 1+1 , KDRandom() < 0.6 ? 'L' : (KDRandom() < 0.5 ? 'c' : 'C'));
				if (KinkyDungeonMapGet(cornerX + 1+1, cornerY + 1+1) == 'C')
					KinkyDungeonTilesSet((cornerX + 1 + 1) + "," + (cornerY + 1 + 1), {Loot: "storage", Roll: KDRandom()});
				KinkyDungeonMapSet(cornerX + 1+1, cornerY + 1+2 , KDRandom() < 0.5 ? 'L' : (KDRandom() < 0.5 ? 'c' : 'C'));
				if (KinkyDungeonMapGet(cornerX + 1+1, cornerY + 1+2) == 'C')
					KinkyDungeonTilesSet((cornerX + 1 + 1) + "," + (cornerY + 1 + 2), {Loot: "storage", Roll: KDRandom()});
				KinkyDungeonMapSet(cornerX + 1+1, cornerY + 1+3 , KDRandom() < 0.7 ? 'L' : (KDRandom() < 0.5 ? 'c' : 'C'));
				if (KinkyDungeonMapGet(cornerX + 1+1, cornerY + 1+3) == 'C')
					KinkyDungeonTilesSet((cornerX + 1 + 1) + "," + (cornerY + 1 + 3), {Loot: "storage", Roll: KDRandom()});
				KinkyDungeonMapSet(cornerX + 1+3, cornerY + 1+1 , KDRandom() < 0.5 ? 'L' : (KDRandom() < 0.5 ? 'c' : 'C'));
				if (KinkyDungeonMapGet(cornerX + 1+3, cornerY + 1+1) == 'C')
					KinkyDungeonTilesSet((cornerX + 1 + 3) + "," + (cornerY + 1 + 1), {Loot: "storage", Roll: KDRandom()});
				KinkyDungeonMapSet(cornerX + 1+3, cornerY + 1+2 , KDRandom() < 0.75 ? 'L' : (KDRandom() < 0.5 ? 'c' : 'C'));
				if (KinkyDungeonMapGet(cornerX + 1+3, cornerY + 1+2) == 'C')
					KinkyDungeonTilesSet((cornerX + 1 + 3) + "," + (cornerY + 1 + 2), {Loot: "storage", Roll: KDRandom()});
				KinkyDungeonMapSet(cornerX + 1+3, cornerY + 1+3 , KDRandom() < 0.5 ? 'L' : (KDRandom() < 0.5 ? 'c' : 'C'));
				if (KinkyDungeonMapGet(cornerX + 1+3, cornerY + 1+3) == 'C')
					KinkyDungeonTilesSet((cornerX + 1 + 3) + "," + (cornerY + 1 + 3), {Loot: "storage", Roll: KDRandom()});
				if (KDRandom() < 0.5) {
					if (KDRandom() < 0.75)
						spawnPoints.push({x:cornerX + 1+2, y:cornerY + 1+3, required:["beast"], AI: "guard"});
					else if (KDRandom() < 0.5)
						spawnPoints.push({x:cornerX + 1+2, y:cornerY + 1+3, required:["human"], AI: "guard"});
					else
						spawnPoints.push({x:cornerX + 1+2, y:cornerY + 1+3, required:["mold", "spawner"], tags: ["mold"], AI: "guard"});
				}
				break;
			}
			case "GuardedChest": {
				let chests = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].chestcount ? KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].chestcount : 6;
				if ((!favoringPOI && KDRandom() < 0.7) || KinkyDungeonBoringGet(cornerX + 1, cornerY + 1) < 3 || chestlist.length >= chests) skip = true;
				else {
					// Hollow out a 3x3 area for the chest
					KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 0, false);
					// Place doors around pairs
					KDCreateDoors(cornerX - 1, cornerY - 1, radius + 2, radius + 2);
					KDPlaceChest(cornerX, cornerY, radius, chestlist, spawnPoints);
				}
				break;
			}
			case "LargeGuardedChest": {
				let chests = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].chestcount ? KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].chestcount : 6;
				if ((!favoringPOI && KDRandom() < 0.7) || KinkyDungeonBoringGet(cornerX + 1, cornerY + 1) < 3 || chestlist.length >= chests) skip = true;
				else {
					// Hollow out a big area
					KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 0, false);
					KinkyDungeonCreateRectangle(cornerX, cornerY - 1, radius, 1, false, false, 0, false);
					KinkyDungeonCreateRectangle(cornerX, cornerY + radius, radius, 1, false, false, 0, false);
					KinkyDungeonCreateRectangle(cornerX - 1, cornerY, 1, radius, false, false, 0, false);
					KinkyDungeonCreateRectangle(cornerX + radius, cornerY, 1, radius, false, false, 0, false);
					// Place doors around pairs
					KDCreateDoors(cornerX - 2, cornerY - 2, radius + 4, radius + 4);
					KDPlaceChest(cornerX, cornerY, radius, chestlist, spawnPoints);
				}
				break;
			}
			case "BanditPrison": {
				if (KinkyDungeonBoringGet(cornerX + 1, cornerY + 1) < 3
					|| !(KDGetMainFaction() && KDFactionRelation("Bandit", KDGetMainFaction()) < 0.2)) skip = true;
				else {
					// Hollow out a 2x2 area for the chest
					KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 0, false);
					// Place the chest
					DialogueCreateEnemy(cornerX+1, cornerY+1, "PrisonerBandit");
					//spawnPoints.push({x:cornerX, y:cornerY, required:["prisoner"], tags: ["bandit"], priority: true});
					// Place the guards
					spawnPoints.push({x:cornerX, y:cornerY, required:["bountyhunter"], tags: ["human"], AI: "guard"});
					spawnPoints.push({x:cornerX+2, y:cornerY, required:["bountyhunter"], tags: ["human"], AI: "guard"});
					spawnPoints.push({x:cornerX, y:cornerY+2, required:["bountyhunter"], tags: ["human"], AI: "guard"});
					spawnPoints.push({x:cornerX+2, y:cornerY+2, required:["bountyhunter"], tags: ["human"], AI: "guard"});
				}
				break;
			}
			case "QuadCell": {
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 1, true);
				KDMapData.PatrolPoints.push({x: cornerX + 3, y: cornerY + 3});
				for (let X = cornerX; X < cornerX + radius; X++) {
					KinkyDungeonMapSet(X, cornerY , '1');
					KinkyDungeonMapSet(X, cornerY+2 , '1');
					KinkyDungeonMapSet(X, cornerY+4 , '1');
					KinkyDungeonMapSet(X, cornerY+6, '1');
				}
				KinkyDungeonMapSet(cornerX, cornerY+1, '1');
				KinkyDungeonMapSet(cornerX+3, cornerY+1, '1');
				KinkyDungeonMapSet(cornerX+6, cornerY+1, '1');
				KinkyDungeonMapSet(cornerX, cornerY+5, '1');
				KinkyDungeonMapSet(cornerX+3, cornerY+5, '1');
				KinkyDungeonMapSet(cornerX+6, cornerY+5, '1');
				KinkyDungeonMapSet(cornerX+2, cornerY+2, 'b');
				KinkyDungeonMapSet(cornerX+4, cornerY+2, 'b');
				KinkyDungeonMapSet(cornerX+2, cornerY+4, 'b');
				KinkyDungeonMapSet(cornerX+4, cornerY+4, 'b');

				KinkyDungeonMapSet(cornerX + 2, cornerY + 1, 'B');
				KinkyDungeonMapSet(cornerX + 4, cornerY + 1, 'B');
				KinkyDungeonMapSet(cornerX + 2, cornerY + 5, 'B');
				KinkyDungeonMapSet(cornerX + 4, cornerY + 5, 'B');
				if (KinkyDungeonStatsChoice.has("Nowhere")) {
					if (KDRandom() < 0.5)
						KinkyDungeonTilesSet((cornerX + 2) + "," + (cornerY + 1), {
							Type: "Trap",
							Trap: "BedTrap",
						});
					if (KDRandom() < 0.5)
						KinkyDungeonTilesSet((cornerX + 4) + "," + (cornerY + 1), {
							Type: "Trap",
							Trap: "BedTrap",
						});
					if (KDRandom() < 0.5)
						KinkyDungeonTilesSet((cornerX + 2) + "," + (cornerY + 5), {
							Type: "Trap",
							Trap: "BedTrap",
						});
					if (KDRandom() < 0.5)
						KinkyDungeonTilesSet((cornerX + 4) + "," + (cornerY + 5), {
							Type: "Trap",
							Trap: "BedTrap",
						});
				}

				let l = KinkyDungeonMapGet(cornerX+1, cornerY+2) == 'D' ? "Red" : undefined;
				KinkyDungeonMapSet(cornerX+1, cornerY+2, KDRandom() < 0.75 ? 'D' : 'd'); KinkyDungeonTilesSet("" + (cornerX+1) + "," + (cornerY + 2), {Type: "Door", NoTrap: true, OL: true, Lock: l});
				if (l && KDRandom() < 0.5)
					spawnPoints.push({x:cornerX + 2, y:cornerY + 1, required: ["human"], AI: "guard"});
				else if (l && KDRandom() < 0.6 + (KDGameData.RoomType == "Jail" ? 0.35 : 0)) {
					SetpieceSpawnPrisoner(cornerX+2, cornerY+1);
				}

				l = KinkyDungeonMapGet(cornerX+5, cornerY+2) == 'D' ? "Red" : undefined;
				KinkyDungeonMapSet(cornerX+5, cornerY+2, KDRandom() < 0.75 ? 'D' : 'd'); KinkyDungeonTilesSet("" + (cornerX+5) + "," + (cornerY + 2), {Type: "Door", NoTrap: true, OL: true, Lock: l});
				if (l && KDRandom() < 0.5)
					spawnPoints.push({x:cornerX + 4, y:cornerY + 1, required: ["human"], AI: "guard"});
				else if (l && KDRandom() < 0.6 + (KDGameData.RoomType == "Jail" ? 0.35 : 0)) {
					SetpieceSpawnPrisoner(cornerX+4, cornerY+1);
				}

				l = KinkyDungeonMapGet(cornerX+1, cornerY+4) == 'D' ? "Red" : undefined;
				KinkyDungeonMapSet(cornerX+1, cornerY+4, KDRandom() < 0.75 ? 'D' : 'd'); KinkyDungeonTilesSet("" + (cornerX+1) + "," + (cornerY + 4), {Type: "Door", NoTrap: true, OL: true, Lock: l});
				if (l && KDRandom() < 0.5)
					spawnPoints.push({x:cornerX + 2, y:cornerY + 5, required: ["human"], AI: "guard"});
				else if (l && KDRandom() < 0.6 + (KDGameData.RoomType == "Jail" ? 0.35 : 0)) {
					SetpieceSpawnPrisoner(cornerX+2, cornerY+5);
				}

				l = KinkyDungeonMapGet(cornerX+5, cornerY+4) == 'D' ? "Red" : undefined;
				KinkyDungeonMapSet(cornerX+5, cornerY+4, KDRandom() < 0.75 ? 'D' : 'd'); KinkyDungeonTilesSet("" + (cornerX+5) + "," + (cornerY + 4), {Type: "Door", NoTrap: true, OL: true, Lock: l});
				if (l && KDRandom() < 0.5)
					spawnPoints.push({x:cornerX + 4, y:cornerY + 5, required: ["human"], AI: "guard"});
				else if (l && KDRandom() < 0.6 + (KDGameData.RoomType == "Jail" ? 0.35 : 0)) {
					SetpieceSpawnPrisoner(cornerX+4, cornerY+5);
				}

				break;
			}
			case "Cache": {
				let rad = radius - 2;
				KinkyDungeonCreateRectangle(cornerX + 1, cornerY + 1, rad, rad, true, false, 1, true);
				KDMapData.PatrolPoints.push({x: cornerX, y: cornerY + 3});
				KinkyDungeonMapSet(cornerX + 1 + Math.floor(rad/2), cornerY + 1 + Math.floor(rad/2), 'C');
				KinkyDungeonTilesSet((cornerX + 1 + Math.floor(rad/2)) + "," + (cornerY + 1 + Math.floor(rad/2)), {Loot: "cache", Faction: "Bandit", Roll: KDRandom()});
				KDTorch(cornerX + 1 + Math.floor(rad/2), cornerY + 1, altType, MapParams);
				KinkyDungeonMapSet(cornerX + 1, cornerY + 1 + Math.floor(rad/2) - 1, 'b');
				KinkyDungeonMapSet(cornerX + 1, cornerY + 1 + Math.floor(rad/2) + 1, 'b');
				KinkyDungeonMapSet(cornerX + 1, cornerY + 1 + Math.floor(rad/2), 'D');
				spawnPoints.push({x:cornerX, y:cornerY + 1 + Math.floor(rad/2)-1, required: ["cacheguard"], tags: ["bandit"], AI: "guard", force: true});
				spawnPoints.push({x:cornerX, y:cornerY + 1 + Math.floor(rad/2)+1, required: ["cacheguard"], tags: ["bandit"], AI: "guard", force: true});
				KinkyDungeonTilesSet((cornerX + 1) + "," + (cornerY + 1 + Math.floor(rad/2)), {Type: "Door", Lock: "Red", OL: true, ReLock: true});
				break;
			}
			case "ForbiddenHall": {
				//KinkyDungeonCreateRectangle(cornerX + 1, cornerY, radius, radius, false, false, 1, false);
				KinkyDungeonCreateRectangle(cornerX+1, cornerY, radius-2, radius, true, false, 1, true);

				for (let X = cornerX + Math.floor(radius/2) - 1; X <= cornerX + Math.floor(radius/2) + 1; X++) {
					for (let Y = cornerY + 1; Y < cornerY + radius - 1; Y++) {
						if (!(X == cornerX + Math.floor(radius/2) && Y == cornerY + 1) && !(X == cornerX + Math.floor(radius/2) && Y == cornerY + radius - 2)) {
							if (KDRandom() < 0.65) {
								trapLocations.push({x: X, y: Y});
							} else if (X != cornerX + Math.floor(radius/2) && Y >= cornerY + 1) {
								KinkyDungeonMapSet(X, Y, '2');
							}
						}
					}
				}

				KinkyDungeonMapSet(cornerX + Math.floor(radius/2), cornerY + 1, 'C');
				KinkyDungeonMapSet(cornerX + Math.floor(radius/2) + 1, cornerY + radius - 1, '1');
				KinkyDungeonMapSet(cornerX + Math.floor(radius/2) - 1, cornerY + radius - 1, '1');
				KinkyDungeonMapSet(cornerX + Math.floor(radius/2), cornerY + radius - 1, '2');

				KinkyDungeonTilesSet((cornerX + Math.floor(radius/2)) + "," + (cornerY + 1), {Loot: "gold", Faction: "AncientRobot", Roll: KDRandom()});

				// Trapped Door
				KinkyDungeonMapSet(cornerX + Math.floor(radius/2), cornerY + radius - 1, 'd');
				KinkyDungeonTilesSet((cornerX + Math.floor(radius/2)) + "," + (cornerY + radius - 1), {
					Type: "Door",
					StepOffTrap: "DoorLock",
					SpawnMult: 0.5,
					Lifetime: 12,
					StepOffTiles: [
						(cornerX + Math.floor(radius/2) - 1) + "," + (cornerY + radius - 2),
						(cornerX + Math.floor(radius/2)) + "," + (cornerY + radius - 2),
						(cornerX + Math.floor(radius/2)) + 1 + "," + (cornerY + radius - 2)
					]});
				console.log("Created forbidden hall");
				break;
			}
			case "ForbiddenChest": {
				KinkyDungeonCreateRectangle(cornerX, cornerY, radius, radius, false, false, 0, true);
				KinkyDungeonCreateRectangle(cornerX, cornerY - 1, radius, 1, false, false, 0, false);
				KinkyDungeonCreateRectangle(cornerX, cornerY + radius, radius, 1, false, false, 0, false);
				KinkyDungeonCreateRectangle(cornerX - 1, cornerY, 1, radius, false, false, 0, false);
				KinkyDungeonCreateRectangle(cornerX + radius, cornerY, 1, radius, false, false, 0, false);
				// Place doors around pairs
				KDCreateDoors(cornerX - 2, cornerY - 2, radius + 4, radius + 4);
				KDMapData.PatrolPoints.push({x: cornerX + 2, y: cornerY + 2});

				for (let X = cornerX; X < cornerX + radius; X++) {
					for (let Y = cornerY; Y < cornerY + radius; Y++) {
						if (!(X == cornerX + 1 && Y == cornerY + 1)) {
							trapLocations.push({x: X, y: Y});
						}
					}
				}

				KinkyDungeonMapSet(cornerX + Math.floor(radius/2), cornerY + Math.floor(radius/2), 'C');

				KinkyDungeonTilesSet((cornerX + Math.floor(radius/2)) + "," + (cornerY + Math.floor(radius/2)), {Loot: "lessergold", Roll: KDRandom()});
				console.log("Created lesser gold chest");
				break;
			}
		}

	if (!skip)
		KinkyDungeonSpecialAreas.push({x: cornerX + Math.floor(radius/2), y: cornerY + Math.floor(radius/2), radius: Math.ceil(radius/2)});
	else if (favoringPOI)
		favoringPOI.used = false;

	if ( TestMode) {
		console.log("Created " + Piece.Name);
	}
	return {Pass: true, Traps: trapLocations};
}

/**
 * This function unblocks movement to ensure a map is pathable
 * @param {number} x
 * @param {number} y
 * @returns {boolean} - whether it's possible
 */
function KDUnblock(x, y) {
	let blocked = false;
	let blockTiles = "1X";
	let t = KinkyDungeonMapGet(x, y-1);
	let tr = KinkyDungeonMapGet(x+1, y-1);
	let tl = KinkyDungeonMapGet(x-1, y-1);
	let r = KinkyDungeonMapGet(x+1, y);
	let l = KinkyDungeonMapGet(x-1, y);
	let b = KinkyDungeonMapGet(x, y-1);
	let br = KinkyDungeonMapGet(x+1, y+1);
	let bl = KinkyDungeonMapGet(x-1, y+1);

	let m_t = KinkyDungeonMovableTilesSmartEnemy.includes(t);
	let m_tr = KinkyDungeonMovableTilesSmartEnemy.includes(tr);
	let m_tl = KinkyDungeonMovableTilesSmartEnemy.includes(tl);
	let m_r = KinkyDungeonMovableTilesSmartEnemy.includes(r);
	let m_l = KinkyDungeonMovableTilesSmartEnemy.includes(l);
	let m_b = KinkyDungeonMovableTilesSmartEnemy.includes(b);
	let m_br = KinkyDungeonMovableTilesSmartEnemy.includes(br);
	let m_bl = KinkyDungeonMovableTilesSmartEnemy.includes(bl);

	if (!blocked && m_t && m_b && !m_r && !m_l) {
		if (KDRandom() < 0.5 && blockTiles.includes(r)) {
			m_r = true;
			KinkyDungeonMapSet(x + 1, y, '2'); // Set to brickwork
		} else if (blockTiles.includes(l)) {
			m_l = true;
			KinkyDungeonMapSet(x - 1, y, '2'); // Set to brickwork
		} else blocked = true; // Cancel
	}
	if (!blocked && m_r && m_l && !m_t && !m_b) {
		if (KDRandom() < 0.5 && blockTiles.includes(b)) {
			m_b = true;
			KinkyDungeonMapSet(x, y + 1, '2'); // Set to brickwork
		} else if (blockTiles.includes(t)) {
			m_t = true;
			KinkyDungeonMapSet(x, y - 1, '2'); // Set to brickwork
		} else blocked = true; // Cancel
	}
	if (!blocked && m_tr && m_br && !m_r) {
		if (blockTiles.includes(r)) {
			m_r = true;
			KinkyDungeonMapSet(x + 1, y, '2'); // Set to brickwork
		} else if (!m_t && !m_l && !m_b) {
			blocked = true;
		}
	}
	if (!blocked && m_tl && m_bl && !m_l) {
		if (blockTiles.includes(l)) {
			m_l = true;
			KinkyDungeonMapSet(x - 1, y, '2'); // Set to brickwork
		} else if (!m_t && !m_r && !m_b) {
			blocked = true;
		}
	}
	if (!blocked && m_tl && m_tr && !m_t) {
		if (blockTiles.includes(t)) {
			m_t = true;
			KinkyDungeonMapSet(x, y - 1, '2'); // Set to brickwork
		} else if (!m_l && !m_b && !m_r) {
			blocked = true;
		}
	}
	if (!blocked && m_bl && m_br && !m_b) {
		if (blockTiles.includes(b)) {
			m_b = true;
			KinkyDungeonMapSet(x, y + 1, '2'); // Set to brickwork
		} else if (!m_l && !m_t && !m_r) {
			blocked = true;
		}
	}
	return !blocked;
}

function SetpieceSpawnPrisoner(x, y) {
	let Enemy = null;
	let noJam = false;
	let noPersistent = false;
	let altRoom = KDGetAltType(MiniGameKinkyDungeonLevel);
	if (altRoom?.noPersistentPrisoners) noPersistent = true;
	if (!noPersistent && KDGameData.CapturedParty?.length > 0) {
		let index = Math.floor(KDRandom() * KDGameData.CapturedParty.length);
		let e = KDGameData.CapturedParty[index];
		Enemy = e.Enemy;
		if (!KDGameData.SpawnedPartyPrisoners) KDGameData.SpawnedPartyPrisoners = {};
		KDGameData.SpawnedPartyPrisoners[e.id + ""] = Math.max(MiniGameKinkyDungeonLevel, 1);
		KDGameData.CapturedParty.splice(index, 1);
		noJam = true;
		e.x = x;
		e.y = y;
		KDAddEntity(e);

		e.faction = "Prisoner";
		e.boundLevel = e.hp * 11;
		e.specialdialogue = "PrisonerJail";
		e.items = [];
		if (noJam)
			KinkyDungeonSetEnemyFlag(e, "nojam", -1);
		KinkyDungeonSetEnemyFlag(e, "noswap", -1);
		KinkyDungeonSetEnemyFlag(e, "imprisoned", -1);
	} else {
		Enemy = KinkyDungeonGetEnemy(["imprisonable",
			"ropeAnger", "ropeRage",
			"metalAnger", "metalRage",
			"latexAnger", "latexRage",
			"conjureAnger", "conjureRage",
			"elementsAnger", "elementsRage",
			"illusionAnger", "illusionRage",
			"leatherAnger", "leatherRage",
			"willAnger", "willRage"], MiniGameKinkyDungeonLevel * 2, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), KinkyDungeonMapGet(x, y), ["imprisonable"]);
		if (Enemy) {
			let e = DialogueCreateEnemy(x, y, Enemy.name);
			e.faction = "Prisoner";
			e.boundLevel = e.hp * 11;
			e.specialdialogue = "PrisonerJail";
			e.items = [];
			if (noJam)
				KinkyDungeonSetEnemyFlag(e, "nojam", -1);
			KinkyDungeonSetEnemyFlag(e, "noswap", -1);
			KinkyDungeonSetEnemyFlag(e, "imprisoned", -1);
			KDProcessCustomPatron(Enemy, e, 1.0);
		}
	}

}


function KDTorch(X, Y, altType, MapParams) {
	let torchreplace = (altType && altType.torchreplace) ? altType.torchreplace : (MapParams.torchreplace ? MapParams.torchreplace : null);
	KDCreateEffectTile(X, Y + 1, {
		name: torchreplace?.sprite ? torchreplace.sprite : "Torch",
		duration: 9999, infinite: true,
	}, 0);
	// Create dummy tile to prevent replace at worldgen
	if (!KinkyDungeonTilesGet(X + "," + Y))
		KinkyDungeonTilesSet(X + "," + Y, {});
}
function KDTorchUnlit(X, Y, altType, MapParams) {

	let torchreplace = (altType && altType.torchreplace) ? altType.torchreplace : (MapParams.torchreplace ? MapParams.torchreplace : null);
	KDCreateEffectTile(X, Y + 1, {
		name: torchreplace?.unlitsprite ? torchreplace.unlitsprite : "TorchUnlit",
		duration: 9999, infinite: true,
	}, 0);
	// Create dummy tile to prevent replace at worldgen
	if (!KinkyDungeonTilesGet(X + "," + Y))
		KinkyDungeonTilesSet(X + "," + Y, {});
}

function KDChest(X, Y, loot = "chest", faction = "") {
	KinkyDungeonMapSet(X, Y, 'C');
	KinkyDungeonTilesSet((X) + "," + (Y), {Loot: loot, Faction: faction, Roll: KDRandom()});
}

function KDCreateDoors(Left, Top, Width, Height, openChance = 0, convertDoodads = true) {
	let doors = {};

	// Create double doors
	let rows = [Top, Top + Height - 1];
	for (let r of rows) {
		// Ignore rows that are out of bounds
		if (r > 0 && r < KDMapData.GridHeight - 1) {
			for (let x = Left; x < Left + Width - 3; x++) {
				if (x > 0 && x < KDMapData.GridWidth - 4
					&& (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(x, r)) || (convertDoodads && KinkyDungeonMapGet(x, r) == 'X'))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(x+1, r))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(x+2, r))
					&& (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(x+3, r)) || (convertDoodads && KinkyDungeonMapGet(x+3, r) == 'X'))) {
					if ((KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x + 1, r - 1)) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x + 1, r + 1)))
						|| (KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x + 2, r - 1)) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x + 2, r + 1)))) {
						doors[(x + 1) + "," + r] = {x: x + 1, y: r};
						doors[(x + 2) + "," + r] = {x: x + 2, y: r};
					}
				}
			}
		}
	}
	let cols = [Left, Left + Width - 1];
	for (let c of cols) {
		// Ignore rows that are out of bounds
		if (c > 0 && c < KDMapData.GridWidth - 1) {
			for (let y = Top; y < Top + Height - 3; y++) {
				if (y > 0 && y < KDMapData.GridHeight - 4
					&& (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(c, y)) || (convertDoodads && KinkyDungeonMapGet(c, y) == 'X'))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(c, y + 1))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(c, y + 2))
					&& (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(c, y + 3)) || (convertDoodads && KinkyDungeonMapGet(c, y + 3) == 'X'))) {
					if ((KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(c - 1, y + 1)) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(c + 1, y + 1)))
						|| (KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(c - 1, y + 2)) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(c + 1, y + 2)))) {
						doors[c + "," + (y + 1)] = {x: c, y: y + 1};
						doors[c + "," + (y + 2)] = {x: c, y: y + 2};
					}
				}
			}
		}
	}

	// Create singleton doors


	// Place the doors
	for (let d of Object.values(doors)) {
		let tile = KDRandom() < openChance ? 'd' : 'D';
		KinkyDungeonMapSet(d.x, d.y, tile);
		KinkyDungeonTilesSet(d.x + "," + d.y, {Type: "Door", NoTrap: true});
	}

}

function KDPlaceChest(cornerX, cornerY, radius, chestlist, spawnPoints, NoAddToChestList) {
	// Determine faction
	let bandit = [
		{faction: "Bandit", tags: ["bandit"], rtags: ["bandit"], ftags: ["miniboss", "boss"]},
	];
	let factionList = [
		...bandit,
		{faction: "Dragon", tags: ["dragon"], rtags: ["dragon"], ftags: ["miniboss", "boss"]},
		{faction: "AncientRobot", tags: ["robot"], rtags: ["robot"], ftags: ["miniboss", "boss", "oldrobot"]},
		{faction: "Maidforce", tags: ["maid"], rtags: ["maid"], ftags: ["miniboss", "boss"]},
		{faction: "Bountyhunter", tags: ["bountyhunter"], rtags: ["bountyhunter"], ftags: ["miniboss", "boss"]},
		{faction: "Dressmaker", tags: ["dressmaker"], rtags: ["dressmaker"], ftags: ["miniboss", "boss"]},
		{faction: "Witch", tags: ["witch", "apprentice", "skeleton"], rtags: ["witch", "apprentice", "skeleton"], ftags: ["miniboss", "boss"]},
		{faction: "Apprentice", tags: ["apprentice"], rtags: ["apprentice"], ftags: ["miniboss", "boss"]},
		//{faction: "Mushy", tags: ["mushroom"], rtags: ["mushy"], ftags: ["miniboss", "boss"]},
		{faction: "Nevermere", tags: ["nevermere"], rtags: ["nevermere"], ftags: ["miniboss", "boss"]},
		{faction: "Bast", tags: ["mummy"], rtags: ["mummy"], ftags: ["miniboss", "boss"]},
		{faction: "Elf", tags: ["elf"], rtags: ["elf"], ftags: ["miniboss", "boss"]},
		{faction: "Elemental", tags: ["elemental", "witch"], rtags: ["elemental", "witch"], ftags: ["miniboss", "boss"]},
		{faction: "Alchemist", tags: ["alchemist"], rtags: ["alchemist"], ftags: ["miniboss", "boss"]},
	];
	let factions = [];
	if (KDMapData.MapFaction) {
		factions.push(KDMapData.MapFaction);
	}
	if (KDMapData.JailFaction) {
		factions.push(...KDMapData.JailFaction);
	}
	if (KDMapData.GuardFaction) {
		factions.push(...KDMapData.GuardFaction);
	}
	factions = factions.filter((faction) => {
		return factionList.some((element) => {return element.faction == faction;});
	});
	if (factions.length > 0) {
		let fl = factions;
		let checkpoint = (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);
		let chosenFaction = KDGetByWeight(KDGetFactionProps(fl, MiniGameKinkyDungeonLevel, checkpoint,
			KinkyDungeonMapParams[checkpoint].enemyTags || [], {}));
		factionList = factionList.filter((entry) => {
			return chosenFaction == entry.faction || KDFactionRelation(chosenFaction, entry.faction) > .35;
		});
	}
	let factionSelected = factionList[Math.floor(KDRandom() * factionList.length)];
	if (!factionSelected) {
		factionSelected = bandit[0];
	}
	// Place the chest
	if (!NoAddToChestList) {
		chestlist.push({x: cornerX + 1, y: cornerY + 1, priority: true, Faction: factionSelected.faction, NoTrap: true});
	}
	// Place the guards
	spawnPoints.push({priority: true, x:cornerX, y:cornerY, required:[factionSelected.rtags[Math.floor(KDRandom()*factionSelected.rtags.length)]], ftags: factionSelected.ftags, tags: factionSelected.tags, AI: "guard"});
	spawnPoints.push({priority: true, x:cornerX+2, y:cornerY, required:[factionSelected.rtags[Math.floor(KDRandom()*factionSelected.rtags.length)]], ftags: factionSelected.ftags, tags: factionSelected.tags, AI: "guard"});
	spawnPoints.push({priority: true, x:cornerX, y:cornerY+2, required:[factionSelected.rtags[Math.floor(KDRandom()*factionSelected.rtags.length)]], ftags: factionSelected.ftags, tags: factionSelected.tags, AI: "guard"});
	spawnPoints.push({priority: true, x:cornerX+2, y:cornerY+2, required:[factionSelected.rtags[Math.floor(KDRandom()*factionSelected.rtags.length)]], ftags: factionSelected.ftags, tags: factionSelected.tags, AI: "guard"});

	return factionSelected.faction;
}

function KDAddPipes(pipechance, pipelatexchance, thinlatexchance, heavylatexspreadchance) {
	for (let x = 1; x < KDMapData.GridWidth - 2; x++)
		for (let y = 1; y < KDMapData.GridHeight - 2; y++) {
			if (
				KinkyDungeonMapGet(x, y) == '1'
				&& KinkyDungeonMapGet(x, y+1) == '0'
				&& !KinkyDungeonTilesGet(x + "," + y)
				&& !KinkyDungeonEnemyAt(x, y+1)
				&& !(Object.entries(KDGetEffectTiles(x, y+1)).length > 0)
				&& KDRandom() < pipechance) {
				KinkyDungeonTilesSet(x + "," + y, {Skin: "EmptyPipe"});
				if (KDRandom() < pipelatexchance) {
					KinkyDungeonTilesSet(x + "," + y, {Skin: "LatexPipe"});
					let name = "LatexThin";
					if (KDRandom() > thinlatexchance) {
						let rad = 2;
						for (let XX = Math.max(1, x - rad); XX < Math.min(KDMapData.GridWidth - 2, x + rad); XX++)
							for (let YY = Math.max(1, y - rad); YY < Math.min(KDMapData.GridHeight - 2, y + rad); YY++) {
								if (KinkyDungeonMapGet(XX, YY) == '0' && KDRandom() < heavylatexspreadchance) {
									KDCreateEffectTile(x, y + 1, {
										name: "LatexThin",
										duration: 9999, infinite: true,
									}, 0);
								}
							}
					}
					KDCreateEffectTile(x, y + 1, {
						name: name,
						duration: 9999, infinite: true,
					}, 0);
				}
			}
		}
}