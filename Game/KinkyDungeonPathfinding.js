"use strict";

/**
 * @type {Map<string, {x: number, y: number}[]>}
 */
let KDPathCache = new Map();

/**
 * @type {Map<string, {x: number, y: number}[]>}
 */
let KDPathCacheIgnoreLocks = new Map();

let KDSmartMovable = new Map();
let KDMovable = new Map();

function KDUpdateDoorNavMap() {
	KDPathCache = new Map();
	KDUpdateChokes = true;
	KDMovable = new Map();
	KDSmartMovable = new Map();
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function KDIsMovable(x, y) {
	if (KDMovable.has(x+','+y)) {
		return KDMovable.get(x+','+y);
	} else {
		let m = KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x, y));
		KDMovable.set(x+','+y, m);
		return m;
	}
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function KDIsSmartMovable(x, y) {
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
 * @param {number} startx - the start position
 * @param {number} starty - the start position
 * @param {number} endx - the end positon
 * @param {number} endy - the end positon
 * @param {boolean} blockEnemy - Do enemies block movement?
 * @param {boolean} blockPlayer - Does player block movement?
 * @param {string} Tiles - Allowed move tiles!
 * @param {entity} [Enemy] - Enemy trying to pathfind
 * @param {boolean} [trimLongDistance] - Give up after 1000 or so tiles checked
 * @param {(x: number, y: number, xx: number, yy: number) => number} [heuristicOverride]
 * @param {boolean} [taxicab]
 * @param {boolean} [ignoreTrafficLaws]
 * @returns {any} - Returns an array of x, y points in order
 */
function KinkyDungeonFindPath(startx, starty, endx, endy, blockEnemy, blockPlayer, ignoreLocks, Tiles, RequireLight, noDoors, needDoorMemory, Enemy, trimLongDistance, heuristicOverride, taxicab, ignoreTrafficLaws) {
	let tileShort = Tiles;
	if (Tiles == KinkyDungeonMovableTilesSmartEnemy) tileShort = "TSE";
	else if (Tiles == KinkyDungeonMovableTilesEnemy) tileShort = "TE";
	else if (Tiles == KinkyDungeonGroundTiles) tileShort = "TG";
	let index = `${startx},${starty},${endx},${endy},${tileShort}`;
	if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory) {
		if (ignoreLocks) {
			if (KDPathCacheIgnoreLocks.has(index)) {
				KDPathfindingCacheHits++;
				return Object.assign([], KDPathCacheIgnoreLocks.get(index));
			}
		} else {
			if (KDPathCache.has(index)) {
				KDPathfindingCacheHits++;
				return Object.assign([], KDPathCache.get(index));
			}
		}

	}

	if (KDistChebyshev(startx - endx, starty - endy) < 1.5) {
		return [{x: endx, y: endy}];
	}

	function heuristic(xx, yy, endxx, endyy) {
		return ((xx - endxx) * (xx - endxx) + (yy - endyy) * (yy - endyy)) ** 0.5;
	}
	let heur = heuristicOverride || heuristic;
	// g = cost
	// f = cost with heuristic
	// s = source
	let TilesTemp = Tiles;
	if (noDoors) TilesTemp = Tiles.replace("D", "");
	let start = {x: startx, y: starty, g: 0, f: 0, s: ""};

	// We generate a grid based on map size
	let open = new Map();
	open.set(startx + "," + starty, start);
	let closed = new Map();

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
		let lowest = {};
		lowest = undefined;
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
								let endPath = KDPathCacheIgnoreLocks.get(locIndex);
								KDPathfindingCacheHits++;
								newPath.push.apply(newPath, endPath);
							} else {
								closed.set(lowLoc, lowest);
								newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y);
								let endPath = KDPathCache.get(locIndex);
								KDPathfindingCacheHits++;
								newPath.push.apply(newPath, endPath);
							}
							if (newPath.length > 0) {
								if (ignoreLocks) {
									if (!KDPathCacheIgnoreLocks.has(index)) KDSetPathfindCache(KDPathCacheIgnoreLocks, newPath, endx, endy, tileShort, index);
								} else {
									if (!KDPathCache.has(index)) KDSetPathfindCache(KDPathCache, newPath, endx, endy, tileShort, index);
								}
								return newPath;
							} else return undefined;
						}
						// Give up and add to the test array
						else if (TilesTemp.includes(tile) && (!RequireLight || KinkyDungeonVisionGet(xx, yy) > 0)
							&& (ignoreLocks || !MapTile || !MapTile.Lock || (Enemy && !KDLocks[MapTile.Lock]?.canNPCPass(xx, yy, MapTile, Enemy)))
							&& (!blockEnemy || KinkyDungeonNoEnemyExceptSub(xx, yy, false, Enemy))
							&& (!blockPlayer || KinkyDungeonPlayerEntity.x != xx || KinkyDungeonPlayerEntity.y != yy)
							&& (!needDoorMemory || tile != "d" || KDOpenDoorTiles.includes(KDMapData.TilesMemory[xx + "," + yy]))) {
							costBonus = 0;
							if (!ignoreTrafficLaws) {
								if (KinkyDungeonMapGet(xx, yy) == "V") costBonus = 7;
								else if (KinkyDungeonMapGet(xx, yy) == "D") costBonus = 2;
								else if (KinkyDungeonMapGet(xx, yy) == "d") costBonus = -2;
								else if (KinkyDungeonMapGet(xx, yy) == "g") costBonus = 2;
								else if (KinkyDungeonMapGet(xx, yy) == "L") costBonus = 4;
								else if (KinkyDungeonMapGet(xx, yy) == "T") costBonus = 2;
								costBonus = (MapTile && MapTile.Lock) ? costBonus + 2 : costBonus;
								costBonus = (MapTile && MapTile.OL) ? costBonus + 8 : costBonus;
								costBonus = (KDMapData.Traffic?.length > 0) ? costBonus + KDMapData.Traffic[yy][xx] : costBonus;
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
function KinkyDungeonGetPath(closed, xx, yy, endx, endy) {
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

function KDSetPathfindCache(PathMap, newPath, endx, endy, Tiles, Finalindex) {
	for (let i = 0; i < newPath.length - 1; i++) {
		let path = newPath.slice(i);
		let index = `${path[0].x},${path[0].y},${endx},${endy},${Tiles}`;
		PathMap.set(index, path.slice(1));
	}
	if (Finalindex)
		PathMap.set(Finalindex, newPath);
}