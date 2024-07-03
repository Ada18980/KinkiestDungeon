"use strict";

let KDAOETypes = {
	"slash": (bx, by, xx, yy, rad, modifier = "", ox, oy) => {
		let dist = KDistEuclidean(ox-xx , oy-yy);
		let dist2 = KDistEuclidean(ox-bx , oy-by);
		// Special case to reduce aoe in melee
		if (ox == bx && yy == oy) return false;
		if (oy == by && xx == ox) return false;
		//Main case
		return Math.abs(dist2-dist) < 0.49;
	},
	"arc": (bx, by, xx, yy, rad, modifier = "", ox, oy) => {
		let dist = KDistEuclidean(ox-xx , oy-yy);
		let dist2 = KDistEuclidean(ox-bx , oy-by);
		// Special case to reduce aoe in melee
		if (ox == bx && yy == oy) return false;
		if (oy == by && xx == ox) return false;
		//Main case
		return Math.abs(dist2-dist) < 0.49 && KDistEuclidean(xx-bx , yy-by) < rad * Math.min(1, dist2*0.5);
	},
	"cross": (bx, by, xx, yy, rad, modifier = "", ox, oy) => {
		let points = {};
		points[bx + ',' + by] = true;
		/**
		 * @type {{x: number, y: number} []}
		 */
		let dirs = [
			{x: 1, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1},
		];
		for (let r = 1; r <= rad; r++) {
			for (let d of dirs) {
				if (points[(bx + (r - 1) * d.x) + ',' + (by + (r - 1) * d.y)]
				&& !KinkyDungeonWallTiles.includes(KinkyDungeonMapGet((bx + (r) * d.x), (by + (r) * d.y)))
				&& (!KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y)) || !KDEntityBlocksExp(KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y))))
			) {
					points[(bx + (r) * d.x) + ',' + (by + (r) * d.y)] = true;
				}
			}
		}
		//Main case
		return points[xx + ',' + yy] != undefined;
	},
	"Xcross": (bx, by, xx, yy, rad, modifier = "", ox, oy) => {
		let points = {};
		points[bx + ',' + by] = true;
		/**
		 * @type {{x: number, y: number} []}
		 */
		let dirs = [
			{x: 1, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1},
			{x: 1, y: 1},
			{x: -1, y: 1},
			{x: 1, y: -1},
			{x: -1, y: -1},
		];
		for (let r = 1; r <= rad; r++) {
			for (let d of dirs) {
				if (points[(bx + (r - 1) * d.x) + ',' + (by + (r - 1) * d.y)]
				&& !KinkyDungeonWallTiles.includes(KinkyDungeonMapGet((bx + (r) * d.x), (by + (r) * d.y)))
				&& (!KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y)) || !KDEntityBlocksExp(KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y))))
			) {
					points[(bx + (r) * d.x) + ',' + (by + (r) * d.y)] = true;
				}
			}
		}
		//Main case
		return points[xx + ',' + yy] != undefined;
	},


	"crossCrack": (bx, by, xx, yy, rad, modifier = "", ox, oy) => {
		let points = {};
		points[bx + ',' + by] = true;
		/**
		 * @type {{x: number, y: number} []}
		 */
		let dirs = [
			{x: 1, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1},
		];
		for (let r = 1; r <= rad; r++) {
			for (let d of dirs) {
				if (points[(bx + (r - 1) * d.x) + ',' + (by + (r - 1) * d.y)]
				&& !KinkyDungeonWallTiles.includes(KinkyDungeonMapGet((bx + (r) * d.x), (by + (r) * d.y)))
				&& (!KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y)) || !KDEntityBlocksExp(KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y))))
			) {
					points[(bx + (r) * d.x) + ',' + (by + (r) * d.y)] = true;
				}
			}
		}
		// Run a second time to break walls
		for (let r = 1; r <= rad; r++) {
			for (let d of dirs) {
				if (points[(bx + (r - 1) * d.x) + ',' + (by + (r - 1) * d.y)]
				&& (KDCrackableTiles.includes(KinkyDungeonMapGet((bx + (r) * d.x), (by + (r) * d.y)))
				|| (KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y)) && KDEntityBlocksExp(KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y))))
			)) {
					points[(bx + (r) * d.x) + ',' + (by + (r) * d.y)] = true;
					break; // Break the d
				}
			}
		}
		//Main case
		return points[xx + ',' + yy] != undefined;
	},
	"XcrossCrack": (bx, by, xx, yy, rad, modifier = "", ox, oy) => {
		let points = {};
		points[bx + ',' + by] = true;
		/**
		 * @type {{x: number, y: number} []}
		 */
		let dirs = [
			{x: 1, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1},
			{x: 1, y: 1},
			{x: -1, y: 1},
			{x: 1, y: -1},
			{x: -1, y: -1},
		];
		for (let r = 1; r <= rad; r++) {
			for (let d of dirs) {
				if (points[(bx + (r - 1) * d.x) + ',' + (by + (r - 1) * d.y)]
				&& !KinkyDungeonWallTiles.includes(KinkyDungeonMapGet((bx + (r) * d.x), (by + (r) * d.y)))
				&& (!KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y)) || !KDEntityBlocksExp(KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y))))
			) {
					points[(bx + (r) * d.x) + ',' + (by + (r) * d.y)] = true;
				}
			}
		}
		// Run a second time to break walls
		for (let r = 1; r <= rad; r++) {
			for (let d of dirs) {
				if (points[(bx + (r - 1) * d.x) + ',' + (by + (r - 1) * d.y)]
				&& (KDCrackableTiles.includes(KinkyDungeonMapGet((bx + (r) * d.x), (by + (r) * d.y)))
				|| (KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y)) && KDEntityBlocksExp(KinkyDungeonEntityAt((bx + (r) * d.x), (by + (r) * d.y))))
			)) {
					points[(bx + (r) * d.x) + ',' + (by + (r) * d.y)] = true;
					break; // Break the d
				}
			}
		}
		//Main case
		return points[xx + ',' + yy] != undefined;
	},
};