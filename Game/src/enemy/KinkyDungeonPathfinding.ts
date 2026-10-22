"use strict";

interface KDPointCostSource extends KDPoint {
	/**  g = cost  */
	g: number;
	/**  f = cost with heuristic  */
	f: number;
	/**  s = source  */
	s: number;
};

let KDPathCache: Map<string, KDPoint[]> = new Map();

let KDPathCacheIgnoreLocks: Map<string, KDPoint[]> = new Map();

let KDSmartMovable = new Map();
let KDMovable = new Map();
let KDUnreachable = new Map();
let KDSmartUnreachable = new Map();
let KDGroundUnreachable = new Map();

function KDUpdateDoorNavMap() {
	KDPathCache = new Map();
	KDUpdateChokes = true;
	KDMovable = new Map();
	KDSmartMovable = new Map();
	KDUnreachable = new Map();
	KDSmartUnreachable = new Map();
	KDGroundUnreachable = new Map();
}

/**
 * @param x
 * @param y
 */
function KDIsMovable(x: number, y: number): boolean {
	if (KDMovable.has(x+','+y)) {
		return KDMovable.get(x+','+y);
	} else {
		let m = KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x, y));
		KDMovable.set(x+','+y, m);
		return m;
	}
}

/**
 * @param x
 * @param y
 */
function KDIsSmartMovable(x: number, y: number): boolean {
	if (KDSmartMovable.has(x+','+y)) {
		return KDSmartMovable.get(x+','+y);
	} else {
		let m = KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(x, y));
		KDSmartMovable.set(x+','+y, m);
		return m;
	}
}
/**
 * @param x
 * @param y
 */
function KDIsUnreachable(xstart: number, ystart: number, x: number, y: number): boolean {
	if (KDUnreachable.has(xstart + ',' + ystart + ',' + x+','+y)) {
		return true;
	}
	return false;
}
/**
 * @param x
 * @param y
 */
function KDIsSmartUnreachable(xstart: number, ystart: number, x: number, y: number): boolean {
	if (KDSmartUnreachable.has(xstart + ',' + ystart + ',' + x+','+y)) {
		return true;
	}
	return false;
}
/**
 * @param x
 * @param y
 */
function KDIsGroundUnreachable(xstart: number, ystart: number, x: number, y: number): boolean {
	if (KDGroundUnreachable.has(xstart + ',' + ystart + ',' + x+','+y)) {
		return true;
	}
	return false;
}

let KDPathfindingCacheHits = 0;
let KDPathfindingCacheFails = 0;

let KDPFTrim = 40;

function KDWiredDoorPathable(triggerX: number, triggerY: number, tile?: string, doorX?: number, doorY?: number, ): boolean {
	if (triggerX == doorX && triggerY == doorY) {
		// a trigger on top of the door would be unreachable
		return false;
	}

	const door = tile || KinkyDungeonTilesGet(`${doorX},${doorY}`);
	switch (door?.wireType) {
	case "AutoDoor_HoldOpen":
	case "AutoDoor_Open":
		break;
	default:
		// not a supported door
		return false;
	}
	let effects = KDEffectTileTags(triggerX, triggerY);
	if (!effects.wire) {
		// door is adjacent to a trigger but not wired to it
		return false;
	}

	// find a directly-adjacent door trigger
	return !!effects.pathplate;
}

/**
 * @param startx - the start position
 * @param starty - the start position
 * @param endx - the end positon
 * @param endy - the end positon
 * @param blockEnemy - Do enemies block movement?
 * @param blockPlayer - Does player block movement?
 * @param ignoreLocks
 * @param Tiles - Allowed move tiles!
 * @param [RequireLight]
 * @param [noDoors]
 * @param [needDoorMemory]
 * @param [Enemy] - Enemy trying to pathfind
 * @param [trimLongDistance] - Give up after 1000 or so tiles checked
 * @param [heuristicOverride]
 * @param [taxicab]
 * @param [ignoreTrafficLaws]
 */
function KinkyDungeonFindPath (
	startx:              number,
	starty:              number,
	endx:                number,
	endy:                number,
	blockEnemy:          boolean,
	blockPlayer:         boolean,
	ignoreLocks:         boolean,
	Tiles:               string,
	RequireLight?:       boolean,
	noDoors?:            boolean,
	needDoorMemory?:     boolean,
	Enemy?:              entity,
	trimLongDistance?:   boolean,
	heuristicOverride?:  (x: number, y: number, xx: number, yy: number) => number,
	taxicab?:            boolean,
	ignoreTrafficLaws?:  boolean,
	allowPassable?:  	 boolean,
	ignoreAllWeighting?: boolean,
	/** can swap with things leashed with the same */
	Leashtarget?: number,
	RequireFog?: boolean,
	EnemyWeight?: number,
	ignoreBlockers?: boolean,
	preferFog?: boolean,
	treatInvisibleAsEmpty?: boolean,
): KDPoint[]
{
	if (preferFog) {
		let ret = KinkyDungeonFindPath(
			startx, starty, endx, endy,
			blockEnemy, blockPlayer, ignoreLocks, Tiles,
			RequireLight, noDoors, needDoorMemory, Enemy,
			trimLongDistance, heuristicOverride, taxicab,
			ignoreTrafficLaws, allowPassable, ignoreAllWeighting,
			Leashtarget, true, EnemyWeight, ignoreBlockers,
			false,
			treatInvisibleAsEmpty,
		);
		if (ret)
			return ret;
		
		RequireFog = false;
	}

	let tileShort = Tiles;
	if (Tiles == KinkyDungeonMovableTilesSmartEnemy) tileShort = "TSE";
	else if (Tiles == KinkyDungeonMovableTilesEnemy) tileShort = "TE";
	else if (Tiles == KinkyDungeonGroundTiles) tileShort = "TG";
	let index = `${startx},${starty},${endx},${endy},${tileShort}`;
	if (!blockEnemy && !blockPlayer && !RequireLight && !RequireFog && !noDoors && !needDoorMemory) {
		if (ignoreLocks) {
			if (KDPathCacheIgnoreLocks.has(index)) {
				KDPathfindingCacheHits++;
				if (KDPathCacheIgnoreLocks.get(index)[0] && KDistChebyshev(KDPathCacheIgnoreLocks.get(index)[0].x - startx, KDPathCacheIgnoreLocks.get(index)[0].y - starty) < 1.5)
					return KDPathCacheIgnoreLocks.get(index).slice(0);
				else KDPathCacheIgnoreLocks.delete(index);
			}
		} else {
			if (KDPathCache.has(index)) {
				KDPathfindingCacheHits++;
				if (KDPathCache.get(index)[0] && KDistChebyshev(KDPathCache.get(index)[0].x - startx, KDPathCache.get(index)[0].y - starty) < 1.5)
					return KDPathCache.get(index).slice(0);
				else KDPathCache.delete(index);
			}
			if (tileShort == "TSE" && KDIsSmartUnreachable(startx, starty, endx, endy)) {
				return null
			} else if (tileShort == "TE" && KDIsUnreachable(startx, starty, endx, endy)) {
				return null
			} else if (tileShort == "TG" && KDIsGroundUnreachable(startx, starty, endx, endy)) {
				return null
			}
		}

	}

	if (KDistChebyshev(startx - endx, starty - endy) < 1.5) {
		return [{x: endx, y: endy}];
	}

	function heuristic(xx: number, yy: number, endxx: number, endyy: number) {
		return 0.5*KDistEuclideanApprox((xx - endxx), (yy - endyy));
	}
	let heur = heuristicOverride || heuristic;
	// g = cost
	// f = cost with heuristic
	// s = source
	let TilesTemp = Tiles;
	if (noDoors) TilesTemp = Tiles.replace("D", "");
	let start: KDPointCostSource = {x: startx, y: starty, g: 0, f: 0, s: 0};

	// We generate a grid based on map size
	let open: Map<number, KDPointCostSource> = new Map();
	open.set(startx + starty * KDMapData.GridWidth, start);
	let closed: Map<number, KDPointCostSource> = new Map();

	let costBonus = 0;
	let MapTile = null;
	let moveCost = 1;
	let succ: Map<number, KDPointCostSource> = new Map();
	let xx = 0;
	let yy = 0;
	let loc = "";
	/** non-smart enemies that cant usedoors won't path through autodoors either
	 * TBD on whether I want this sort of behavior- 
	 * Also if there is an Enemy that is flying, it won't path through autodoors since pressureplates don't trigger on flying
	 * Again TBD since I feel like levitating enemies should be able to press those
	*/
	let allowWiredDoors = TilesTemp.includes('D') && (!Enemy || !KDIsFlying(Enemy)); 

	while(open.size > 0) {
		// Trim if it takes too long
		if (trimLongDistance && (closed.size > KDPFTrim || open.size > 3*KDPFTrim)) {
			console.log("Quit pathfinding");
			return undefined; // Give up
		}
		let lowest_old: KDPointCostSource = undefined;
		let lowest: KDPointCostSource = undefined;
		let lc = 1000000000;
		let dx = 0;
		let dy = 0;
		// Get the open tile with the lowest weight
		open.forEach(o => {
			if (o.f < lc) {
				lc = o.f;
				lowest_old = lowest;
				lowest = o;
			}
		});
		if (lowest) {
			let lowLoc = lowest.x + "," + lowest.y;
			let lowIndex = lowest.x + lowest.y * KDMapData.GridWidth;
			moveCost = 1;
			succ = new Map();
			// Check bordering tiles on the lowest
			for (let x = -1; x <= 1; x++) {
				for (let y = -1; y <= 1; y++) {
					if ((x != 0 || y != 0) && (!taxicab || y == 0 || x == 0)) {
						xx = lowest.x + x;
						yy = lowest.y + y;
						loc = (xx) + "," + (yy)
						let tile = (xx == endx && yy == endy) ? "" : KinkyDungeonMapGet(xx, yy);
						if (xx < 1 || xx >= KDMapData.GridWidth) continue;
						if (yy < 1 || yy >= KDMapData.GridHeight) continue;
						MapTile = KinkyDungeonTilesGet(loc);
						let locIndex = (!blockEnemy && !blockPlayer && !RequireLight && !RequireFog && !noDoors && !needDoorMemory) ?
							`${lowLoc},${endx},${endy},${tileShort}` : null;
						const useWiredDoor = allowWiredDoors && KDWiredDoorPathable(lowest.x, lowest.y, tile);
						// If we have found the end
						if (xx == endx && yy == endy) {
							closed.set(lowIndex, lowest);
							let newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y, endx, endy);
							if (!blockEnemy && !blockPlayer && !RequireLight && !RequireFog && !noDoors && !needDoorMemory) {
								if (ignoreLocks) {
									if (!KDPathCacheIgnoreLocks.has(index)) KDSetPathfindCache(KDPathCacheIgnoreLocks, newPath, endx, endy, tileShort, index);
								} else {
									if (!KDPathCache.has(index)) KDSetPathfindCache(KDPathCache, newPath, endx, endy, tileShort, index);
								}
							}
							KDPathfindingCacheFails++;
							if (newPath.length > 0 && TilesTemp.includes(KinkyDungeonMapGet(newPath[0].x, newPath[0].y)))
								return newPath;
							else return undefined;
						} else if (!blockEnemy && !blockPlayer && !RequireLight && !RequireFog && !noDoors && !needDoorMemory
								&& ((ignoreLocks && KDPathCacheIgnoreLocks.has(locIndex)) || (!ignoreLocks && KDPathCache.has(locIndex)))) {
							let newPath = [];
							if (ignoreLocks) {
								closed.set(lowIndex, lowest);
								newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y);
								let endPath = KDPathCacheIgnoreLocks.get(locIndex).slice(0);
								KDPathfindingCacheHits++;
								newPath.push(...endPath);
							} else {
								closed.set(lowIndex, lowest);
								newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y);
								let endPath = KDPathCache.get(locIndex).slice(0);
								KDPathfindingCacheHits++;
								newPath.push(...endPath);
							}
							if (newPath.length > 0) {
								if (newPath[0] && KDistChebyshev(newPath[0].x - startx, newPath[0].y - starty) < 1.5) {
									if (ignoreLocks) {
										if (!KDPathCacheIgnoreLocks.has(index)) KDSetPathfindCache(KDPathCacheIgnoreLocks, newPath, endx, endy, tileShort, index);
									} else {
										if (!KDPathCache.has(index)) KDSetPathfindCache(KDPathCache, newPath, endx, endy, tileShort, index);
									}
									return newPath;
								}
								else if (ignoreLocks) {
									KDPathCacheIgnoreLocks.delete(locIndex);
								} else {
									KDPathCache.delete(locIndex);
								}
							} else return undefined;
						}
						// Give up and add to the test array
						else if (
							(!RequireLight || KinkyDungeonVisionGet(xx, yy) > 0)
							&& (!RequireFog || KinkyDungeonVisionGet(xx, yy) > 0 || KinkyDungeonFogGet(xx, yy) > 0)
							&& ((treatInvisibleAsEmpty && 
								!(KinkyDungeonVisionGet(xx, yy) > 0 || KinkyDungeonFogGet(xx, yy) > 0))
								|| (
								(TilesTemp.includes(tile) || useWiredDoor)
								&& (ignoreLocks || !MapTile || !MapTile.Lock || (Enemy && KDLocks[MapTile.Lock].canNPCPass(xx, yy, MapTile, Enemy)))
								&& (ignoreBlockers || !KinkyDungeonEnemyAt(xx, yy)?.Enemy?.immobile)
								&& (!blockEnemy || !!EnemyWeight
									|| ((needDoorMemory && KinkyDungeonVisionGet(xx, yy) <= 0.1)
										|| ((Leashtarget > 0 && Leashtarget == KinkyDungeonEnemyAt(xx, yy)?.leash?.entity)
										|| KinkyDungeonNoEnemyExceptSub(xx, yy, false, Enemy)
										|| (allowPassable && KDCanPassEnemy(KDPlayer(), KinkyDungeonEnemyAt(xx, yy))))))
								&& (!blockPlayer || KinkyDungeonPlayerEntity.x != xx || KinkyDungeonPlayerEntity.y != yy)
								&& (!needDoorMemory || tile != "d" || KDOpenDoorTiles.includes(KDMapData.TilesMemory[xx + "," + yy]) || useWiredDoor)
							))
							) {
							costBonus = 0;

							if (!treatInvisibleAsEmpty || (KinkyDungeonFogGet(xx, yy) > 0 || KinkyDungeonVisionGet(xx, yy) > 0)) {
								if (EnemyWeight && (!treatInvisibleAsEmpty || KinkyDungeonVisionGet(xx, yy) > 0)) {
									if (!(((needDoorMemory && KinkyDungeonVisionGet(xx, yy) <= 0.1)
										|| ((Leashtarget > 0 && Leashtarget == KinkyDungeonEnemyAt(xx, yy)?.leash?.entity)
										|| KinkyDungeonNoEnemyExceptSub(xx, yy, false, Enemy)
										|| (allowPassable && KDCanPassEnemy(KDPlayer(), KinkyDungeonEnemyAt(xx, yy))))))) {
											costBonus += EnemyWeight;
										}
								}
								if (!ignoreTrafficLaws && !ignoreAllWeighting) {
									if (KDEffectTileTagsLoc(loc)?.danger) costBonus += 12;
									if (Enemy) {
										if (KDTileSlows(Enemy, xx, yy)) costBonus += 3;
									}
									else if (tile == "V" && !(MapTile?.Sfty)) costBonus = 14;
									else if (tile == "N") costBonus = 30;
									else if (tile == "D") costBonus = 2.5;
									else if (tile == "g") costBonus = 5;
									else if (tile == "L") costBonus = 4;
									else if (tile == "T") costBonus = 2;
									costBonus = (MapTile && MapTile.Lock) ? costBonus + 2 : costBonus;
									costBonus = (MapTile && MapTile.OL) ? costBonus + 12 : costBonus;
									costBonus = (KDMapData.Traffic?.length > 0 && KDMapData.Traffic[yy])
										? costBonus + (KDMapData.Traffic[yy][xx] || 0) : costBonus;
									costBonus = Math.max(0, costBonus);
								} else if (!ignoreAllWeighting) {
									if (tile == "V" && !(MapTile?.Sfty)) costBonus = 3;
									else if (tile == "N") costBonus = 8;
									else if (tile == "L") costBonus = 2;
								}
							} else costBonus = 10; // prefer not to go in unknown
							
							// when moving diagonally we penalize if we werent moving diagonally before
							// this is to help avoid weird zigzag patterns when realistically an enemy should walk straight thru a room
							if (!!x && !!y) {
								let parent = lowest.s ? closed.get(lowest.s) : undefined
								if (parent) {
									dx = lowest.x-parent.x;
									dy = lowest.y-parent.y;
									if (dx != x || dy != y) {
										costBonus += 0.41;
									} else costBonus += 0.1;
								} else {
									costBonus += 0.4;
								}
							}
							succ.set(xx + KDMapData.GridWidth *  yy, {x: xx, y: yy,
								g: moveCost + costBonus + lowest.g,
								f: moveCost + costBonus + lowest.g + heur(xx, yy, endx, endy),
								s: lowIndex});
						}
					}
				}
			}
			succ.forEach(s => {
				let q = s.x + KDMapData.GridWidth * s.y;
				let openSucc = open.get(q);
				if (!openSucc || openSucc.f > s.f) {
					let closedSucc = closed.get(q);
					if (!closedSucc || closedSucc.f > s.f) {
						open.set(q, s);
					}
				}
			});


			open.delete(lowIndex);

			closed.set(lowIndex, lowest);
		} else {
			open.clear();
			console.log("Pathfinding error! Please report this!");
		}
	}

	if (!blockEnemy && !blockPlayer && !RequireLight && !RequireFog && !noDoors && !needDoorMemory && !ignoreLocks) {
		if (tileShort == "TSE") {
			KDSmartUnreachable.set(startx + ',' + starty + ',' + endx + ',' + endy, true);
		} else if (tileShort == "TE") {
			KDUnreachable.set(startx + ',' + starty + ',' + endx + ',' + endy, true);
		} else if (tileShort == "TG") {
			KDGroundUnreachable.set(startx + ',' + starty + ',' + endx + ',' + endy, true);
		}
	}

	return undefined;
}

// Goes back and gets path backwards from xx, adding endx and endy
function KinkyDungeonGetPath(closed: Map<number, KDPointCostSource>, xx: number, yy: number, endx?: number, endy?: number): KDPoint[] {
	let list = [];
	if (endx && endy) list.push({x: endx, y: endy});

	let current = closed.get(xx + KDMapData.GridWidth * yy);
	while (current) {
		if (current.s) {
			list.push({x: current.x, y: current.y});
			current = closed.get(current.s);
		} else current = undefined;
	}

	return list.reverse();
}

/**
 * @param PathMap
 * @param newPath
 * @param endx
 * @param endy
 * @param Tiles
 * @param Finalindex
 */
function KDSetPathfindCache(PathMap: Map<string, KDPoint[]>, newPath: KDPoint[], endx: number, endy: number, Tiles: string, Finalindex: string): void {
	for (let i = 0; i < newPath.length - 1; i++) {
		let path = newPath.slice(i);
		let index = `${path[0].x},${path[0].y},${endx},${endy},${Tiles}`;
		PathMap.set(index, path.slice(1));
	}
	if (Finalindex)
		PathMap.set(Finalindex, newPath.slice(0));
}
