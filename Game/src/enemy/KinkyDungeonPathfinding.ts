"use strict";

interface KDPointCostSource extends KDPoint {
	/**  g = cost  */
	g: number;
	/**  f = cost with heuristic  */
	f: number;
	/**  s = source  */
	s: string;
};

let KDPathCache: Map<string, KDPoint[]> = new Map();

let KDPathCacheIgnoreLocks: Map<string, KDPoint[]> = new Map();

let KDSmartMovable = new Map();
let KDMovable = new Map();

function KDUpdateDoorNavMap() {
	KDPathCache = new Map();
	KDUpdateChokes = true;
	KDMovable = new Map();
	KDSmartMovable = new Map();
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

let KDPathfindingCacheHits = 0;
let KDPathfindingCacheFails = 0;

let KDPFTrim = 40;

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
	ignoreTrafficLaws?:  boolean
): KDPoint[]
{
	let tileShort = Tiles;
	if (Tiles == KinkyDungeonMovableTilesSmartEnemy) tileShort = "TSE";
	else if (Tiles == KinkyDungeonMovableTilesEnemy) tileShort = "TE";
	else if (Tiles == KinkyDungeonGroundTiles) tileShort = "TG";
	let index = `${startx},${starty},${endx},${endy},${tileShort}`;
	if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory) {
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
		}

	}

	if (KDistChebyshev(startx - endx, starty - endy) < 1.5) {
		return [{x: endx, y: endy}];
	}

	function heuristic(xx: number, yy: number, endxx: number, endyy: number) {
		return ((xx - endxx) * (xx - endxx) + (yy - endyy) * (yy - endyy)) ** 0.5;
	}
	let heur = heuristicOverride || heuristic;
	// g = cost
	// f = cost with heuristic
	// s = source
	let TilesTemp = Tiles;
	if (noDoors) TilesTemp = Tiles.replace("D", "");
	let start: KDPointCostSource = {x: startx, y: starty, g: 0, f: 0, s: ""};

	// We generate a grid based on map size
	let open: Map<string, KDPointCostSource> = new Map();
	open.set(startx + "," + starty, start);
	let closed: Map<string, KDPointCostSource> = new Map();

	let costBonus = 0;
	let MapTile = null;
	let moveCost = 1;
	let succ = new Map();

	while(open.size > 0) {
		// Trim if it takes too long
		if (trimLongDistance && (closed.size > KDPFTrim || open.size > 3*KDPFTrim)) {
			console.log("Quit pathfinding");
			return undefined; // Give up
		}
		let lowest: KDPointCostSource = undefined;
		let lc = 1000000000;
		// Get the open tile with the lowest weight
		open.forEach(o => {
			if (o.f < lc) {
				lc = o.f;
				lowest = o;
			}
		});
		if (lowest) {
			let lowLoc = lowest.x + "," + lowest.y;
			moveCost = 1;
			succ = new Map();
			// Check bordering tiles on the lowest
			for (let x = -1; x <= 1; x++) {
				for (let y = -1; y <= 1; y++) {
					if ((x != 0 || y != 0) && (!taxicab || y == 0 || x == 0)) {
						let xx = lowest.x + x;
						let yy = lowest.y + y;
						let tile = (xx == endx && yy == endy) ? "" : KinkyDungeonMapGet(xx, yy);
						MapTile = KinkyDungeonTilesGet((xx) + "," + (yy));
						let locIndex = `${lowLoc},${endx},${endy},${tileShort}`;
						// If we have found the end
						if (xx == endx && yy == endy) {
							closed.set(lowLoc, lowest);
							let newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y, endx, endy);
							if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory) {
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
						} else if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory
								&& ((ignoreLocks && KDPathCacheIgnoreLocks.has(locIndex)) || (!ignoreLocks && KDPathCache.has(locIndex)))) {
							let newPath = [];
							if (ignoreLocks) {
								closed.set(lowLoc, lowest);
								newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y);
								let endPath = KDPathCacheIgnoreLocks.get(locIndex).slice(0);
								KDPathfindingCacheHits++;
								newPath.push(...endPath);
							} else {
								closed.set(lowLoc, lowest);
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
						else if (TilesTemp.includes(tile) && (!RequireLight || KinkyDungeonVisionGet(xx, yy) > 0)
							&& (ignoreLocks || !MapTile || !MapTile.Lock || (Enemy && KDLocks[MapTile.Lock].canNPCPass(xx, yy, MapTile, Enemy)))
							&& (!blockEnemy || KinkyDungeonNoEnemyExceptSub(xx, yy, false, Enemy))
							&& (!blockPlayer || KinkyDungeonPlayerEntity.x != xx || KinkyDungeonPlayerEntity.y != yy)
							&& (!needDoorMemory || tile != "d" || KDOpenDoorTiles.includes(KDMapData.TilesMemory[xx + "," + yy]))) {
							costBonus = 0;
							if (!ignoreTrafficLaws) {
								if (tile == "V" && !(MapTile?.Sfty)) costBonus = 14;
								else if (tile == "N") costBonus = 30;
								else if (tile == "D") costBonus = 3;
								else if (tile == "d") costBonus = -2;
								else if (tile == "g") costBonus = 9;
								else if (tile == "L") costBonus = 9;
								else if (tile == "T") costBonus = 4;
								costBonus = (MapTile && MapTile.Lock) ? costBonus + 2 : costBonus;
								costBonus = (MapTile && MapTile.OL) ? costBonus + 12 : costBonus;
								costBonus = (KDMapData.Traffic?.length > 0 && KDMapData.Traffic[yy]) ? costBonus + (KDMapData.Traffic[yy][xx] || 0) : costBonus;
								costBonus = Math.max(0, costBonus);
							}
							succ.set(xx + "," + yy, {x: xx, y: yy,
								g: moveCost + costBonus + lowest.g,
								f: moveCost + costBonus + lowest.g + heur(xx, yy, endx, endy),
								s: lowLoc});
						}
					}
				}
			}
			succ.forEach(s => {
				let q = s.x + "," + s.y;
				let openSucc = open.get(q);
				if (!openSucc || openSucc.f > s.f) {
					let closedSucc = closed.get(q);
					if (!closedSucc || closedSucc.f > s.f) {
						open.set(q, s);
					}
				}
			});


			open.delete(lowLoc);

			closed.set(lowLoc, lowest);
		} else {
			open.clear();
			console.log("Pathfinding error! Please report this!");
		}
	}

	return undefined;
}

// Goes back and gets path backwards from xx, adding endx and endy
function KinkyDungeonGetPath(closed: Map<string, KDPointCostSource>, xx: number, yy: number, endx?: number, endy?: number): KDPoint[] {
	let list = [];
	if (endx && endy) list.push({x: endx, y: endy});

	let current = closed.get(xx + "," + yy);
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
