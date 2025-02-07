alts.DragonLair = {
	name: "DragonLair",
	Title: "DragonLair",
	noWear: false, // Disables doodad wear
	bossroom: false,
	width: 20,
	height: 20,
	nopatrols: false,
	setpieces: {
	},
	data: {
		ElevatorRoom: true,
	},
	genType: "DragonLair",
	skin: "cav",
	musicParams: "DragonLair",
	lightParams: "cav",
	useGenParams: "cav",
	spawns: false,
	chests: false,
	shrines: false,
	persist: true,
	orbs: 0,
	chargers: false,
	notorches: false,
	heart: false,
	specialtiles: false,
	shortcut: false,
	enemies: false,
	nojail: true,
	nokeys: true,
	nostairs: true,
	placeDoors: false,
	notraps: true,
	noClutter: false,
	nobrick: false,
	noFurniture: true,
	nolore: true,
	noboring: false,
	noSetpiece: true,

	/** hehe */
	keepItems: true,

	beforeWorldGenScript: (coord) => {
		let dtype = KDGetDragonType();
		if (dtype?.furniture) {
			// Place furniture
			let furnitureSlots = KDGetDragonLairFurnitureZones(3.5, 3.5, 4,
				KDMapData.GridWidth/2,
				KDMapData.GridHeight/2
			);
			for (let fs of furnitureSlots) {
				let Ftype = KDGetByWeight(dtype.furniture);
				if (Ftype) {
					KinkyDungeonMapSetForce(fs.x, fs.y, 'L');
					KinkyDungeonTilesSet((fs.x) + "," + (fs.y), {
						Type: "Furniture",
						Furniture: Ftype,
					});
					KDMapData.JailPoints.push({x: fs.x, y: fs.y, type: "furniture", radius: 1});
				} else {
					if (KDRandom() < 0.33) KinkyDungeonMapSetForce(fs.x, fs.y, 'R');
				}
			}


		}
	},

	loadscript: (firsttime) => {
		// Place sigils
		if (!KDMapData.data) KDMapData.data = {};

		if (!KDMapData.data.sigilsSpawned) {
			let dragonid = KDPersonalAlt[KDMapData.RoomType]?.OwnerNPC;
			if (dragonid) {
				for (let i = 0; i < KDGameData.SealErasedQuota; i++) {
					let point = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
						return KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(x, y))
							&& !(KDEffectTileTags(x, y)["sigil"])
					}, false, false);
					if (point) {
						KDCreateEffectTile(point.x, point.y, {
							name: "SealSigil",
							duration: 9999
						}, 0);
					}
				}
				KDGameData.DragonTarget = dragonid;
			}
		}
		KDMapData.data.sigilsSpawned = true;
		return true;
	},
	genCriteria: (iteration) => {
		let dtype = KDGetDragonType();
		if (dtype?.furniture) {
			return KDMapData.JailPoints.length > 0 && KDCheckMainPath();
		}
		return KDCheckMainPath();
	},
};

let KDNoDragonLairCheckpoints = ['lib'];

let KDDragonList: KDMapEnemyList[] = [
	{
		enemy: "DragonQueenCrystal",
		faction: "DragonQueen",
		minfloor: 7,
		obstacles: {
			ChaoticCrystal: 1.0,
			ChaoticCrystalActive: 0.25,
			SoulCrystal: 0.05,
			SoulCrystalActive: 0.01,
			CuffedGirl: 0.1,
		},
		furniture: {
			"": 0.25,
			CrystalBase: 0.5,
		},
	},
	{
		enemy: "DragonQueenPoison",
		minfloor: 6,
		faction: "DragonQueen",
		obstacles: {
			BarricadeVine: 1.0,
			GiantMushroom: 0.25,
			VinePlant: 0.1,
		},
		furniture: {
			"": 0.25,
			VineBase: 0.5,
		},
	},
	{
		enemy: "DragonQueenIce",
		minfloor: 5,
		faction: "DragonQueen",
		obstacles: {
			BarricadeIce: 1.0,
		},
		furniture: {
			"": 0.25,
			IceBase: 0.5,
		},
	},
	{
		enemy: "DragonQueenShadow",
		minfloor: 8,
		faction: "DragonQueen",
		obstacles: {
			ShadowHand: 0.1,
			BarricadeShadow: 1.0,
			BarricadeShadowMetal: 0.25,
		},
		furniture: {
			"": 0.25,
			ShadowBase: 0.5,
		},
	},
	{
		enemy: "DragonGirlCrystal",
		maxfloor: 5,
		faction: "DragonQueen",
		obstacles: {
			ChaoticCrystal: 1.0,
			ChaoticCrystalActive: 0.25,
		},
		furniture: {
			"": 0.5,
			Cage: 0.05,
			DisplayStand: 0.05,
			CrystalBase: 0.25,
		},
	},
	{
		enemy: "DragonGirlPoison",
		maxfloor: 6,
		faction: "DragonQueen",
		obstacles: {
			BarricadeVine: 0.5,
			GiantMushroom: 0.5,
		},
		furniture: {
			"": 0.5,
			Cage: 0.05,
			DisplayStand: 0.05,
			VineBase: 0.25,
		},
	},
	{
		enemy: "DragonGirlIce",
		maxfloor: 7,
		faction: "DragonQueen",
		obstacles: {
			BarricadeIce: 0.75,
		},
		furniture: {
			"": 0.5,
			Cage: 0.05,
			DisplayStand: 0.05,
			IceBase: 0.25,
		},
	},
	{
		enemy: "DragonGirlShadow",
		maxfloor: 8,
		faction: "DragonQueen",
		obstacles: {
			BarricadeShadow: 0.75,
			BarricadeShadowMetal: 0.25,
		},
		furniture: {
			"": 0.5,
			Cage: 0.05,
			DisplayStand: 0.05,
			ShadowBase: 0.25,
		},
	},


];


KinkyDungeonCreateMapGenType.DragonLair = (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
	KDMapgenCreateCave(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
};

function KDMapgenCreateCave(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
	// Boilerplate
	VisitedRooms[0].x = Math.floor(width/2);
	VisitedRooms[0].y = Math.floor(height/2);

	let w = KDMapData.GridWidth;
	let h = KDMapData.GridHeight;
	KDMapData.GridWidth = Math.floor(KDMapData.GridWidth*2);
	KDMapData.GridHeight = Math.floor(KDMapData.GridHeight*2);
	KDMapData.Grid = "";

	// Generate the grid
	for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
		for (let X = 0; X < KDMapData.GridWidth; X++)
			KDMapData.Grid = KDMapData.Grid + "1";
		KDMapData.Grid = KDMapData.Grid + '\n';
	}

	// End of boilerplate

	// Generate central cavity

	let dist = 0;
	let distcav = 5.5 + 0.25 * openness;
	for (let X = 1; X < KDMapData.GridWidth; X += 1)
		for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
			dist = KDistEuclidean(X - KDMapData.GridWidth/2, Y - KDMapData.GridWidth/2);
			if (dist < distcav) {
				KinkyDungeonMapSet(X, Y, (dist > distcav * 0.67 && KDRandom() < 0.4) ? 'X' : '0');
			}
		}

	// Generate branching tunnels
	let potEntrances: KDPoint[] = [];
	let paths = 5 + Math.floor(density);
	let pathMaxLength = 40;
	let pathMaxDist = KDMapData.GridWidth/2.5;

	for (let i = 0; i < paths; i++) {
		let already: Record<string, KDPoint> = {};
		let curr = {x: (KDMapData.GridWidth/2), y: (KDMapData.GridHeight/2)};
		let last = curr;
		for (let ii = 0;
			ii < pathMaxLength
			&& curr
			&& KDistEuclidean(curr.x - KDMapData.GridWidth/2,
				curr.y - KDMapData.GridHeight/2) < pathMaxDist;
				ii++) {
					KinkyDungeonMapSet(curr.x, curr.y, '0');
					last = curr;
					already[curr.x + ',' + curr.y] = curr;
					let options = KDNearbyMapTiles(curr.x, curr.y, 1.5).filter((t) => {
						return !already[t.x + ',' + t.y]
							&& KDistEuclidean(t.x - KDMapData.GridWidth/2,
							t.y - KDMapData.GridHeight/2) > -0.5 + KDistEuclidean(curr.x - KDMapData.GridWidth/2,
							curr.y - KDMapData.GridHeight/2);
					})
					if (options.length > 0) {
						curr = options[Math.floor(KDRandom() * options.length)];
					} else {
						curr = null;
					}
				}
		if (last) {
			potEntrances.push(last);
		}

	}

	// Open up the map a bit

	// nah



	// Create entrances

	for (let i = 0; i < potEntrances.length; i++) {
		if (i == 0) {
			// Main entrance
			KDMapData.StartPosition = {x: potEntrances[i].x, y: potEntrances[i].y};
			KDMapData.EndPosition = KDMapData.StartPosition;
		} else {
			KDMapData.PotentialEntrances.push({
				Excavate: [],
				PlaceScript: "Cave",
				Type: "Cave",
				x: potEntrances[i].x,
				y: potEntrances[i].y,
				priority: 100,
			})
		}
	}

	// End of map gen

	// Boilerplate again

	KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');

	KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);

	// end of boilerplate again

	// Scatter a healthy amount of cursed items around

	let CurseList = "Dragon";
	let HexList = "Dragon";
	let EnchantList = "Dragon";
	let idist = 5;

	for (let i = 0; i < 10; i++) {

		let ang = KDRandom() * 2 * Math.PI;
		let point = (KDRandom() < 0.7 ? null : KinkyDungeonGetNearbyPoint(
			KDMapData.GridWidth/2 + Math.round(2*idist * Math.cos(ang)),
			KDMapData.GridHeight/2 + Math.round(2*idist * Math.sin(ang)),
			true, undefined, undefined, true)) || KinkyDungeonGetNearbyPoint(
			KDMapData.GridWidth/2 + Math.round(idist * Math.cos(ang)),
			KDMapData.GridHeight/2 + Math.round(idist * Math.sin(ang)),
			true, undefined, undefined, true)
		if (!point) point = KinkyDungeonGetNearbyPoint(KDMapData.GridWidth/2, KDMapData.GridHeight/2,
			true, undefined, undefined, true
		);
		if (point) {
			let curse: string = undefined;
			let Lock = "Gold";
			if (CurseList && KDRandom() < 0.3) {
				curse = KDGetByWeight(
					KinkyDungeonGetCurseByListWeighted(
						[CurseList],
						undefined,
						false,
						0,
						5 + KDGetEffLevel()));

			}
			let tags = ["bindingDress", "latexRestraints", "latexRestraintsHeavy", "kiguRestraints", "trap", "dragonRestraints", "steelbondage"];
			let restraint = KinkyDungeonGetRestraint({tags: tags},
				KDGetEffLevel() + 3,
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), undefined,
				curse ? undefined : Lock,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				curse,
				undefined,
				undefined,
				{
					allowLowPower: true
				});
			let item = DialogueAddCursedEnchantedHexed(
				restraint, undefined, curse, HexList, EnchantList,
				0, 5 + KDGetEffLevel(),
				0, 8 + KDGetEffLevel(),
				true, undefined, Lock
			);
			let inv = {x:point.x, y:point.y, name: item.inventoryVariant || item.name};
				(KDMapData).GroundItems.push(inv);
		}
	}


}

function KDGetDragonLairFurnitureZones(spacingX: number, spacingY: number, minDist: number, xCenter: number, yCenter: number) : KDPoint[] {
	let points: Record<string, KDPoint> = {};
	let doF = (x, y) => {
		if (minDist && KDistEuclidean(x - xCenter, y - yCenter) <= minDist) return;
		let succ = true;
		for (let p of [{x: -1, y: 0},{x: 1, y: 0},{x: 0, y: -1},{x: 0, y: 1},]) {
			if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(x + p.x, y + p.y))
				|| points[(x + p.x) + ',' + (y + p.y)]) {
				succ = false;
				break;
			}
		}
		if (succ) {
			points[(x) + ',' + (y)] = {x: x, y: y};
		}
	};
	for (let x = 1; x < KDMapData.GridWidth - 1; x = Math.ceil(x + KDRandom() * spacingX)) {
		for (let y = 1; y < KDMapData.GridHeight - 1; y++) {
			doF(x, y);
		}
	}
	for (let x = 1; x < KDMapData.GridWidth - 1; x++) {
		for (let y = 1; y < KDMapData.GridHeight - 1; y = Math.ceil(y + KDRandom() * spacingY)) {
			doF(x, y);
		}
	}

	return Object.values(points);
}

function KDGetDragonType(): KDMapEnemyList {
	// Get the dragon type
	let lair = KDPersonalAlt[KDGameData.RoomType];
	if (lair?.OwnerNPC) {
		let NPC = KDGetPersistentNPC(lair.OwnerNPC);
		if (NPC?.entity) {
			let type = (NPC?.trueEntity ? KinkyDungeonGetEnemyByName(NPC.trueEntity?.Enemy)
			: undefined) || KinkyDungeonGetEnemyByName(NPC.entity?.Enemy)
			if (type?.name) {
				let dtype = KDDragonList.find((d) => {
					return d.enemy == type?.name;
				});
				return dtype;
			}
		}

	}
	return null;
}