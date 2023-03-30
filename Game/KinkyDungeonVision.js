"use strict";
// Lots of good info here: http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html#permissivecode
// For this implementation I decided that ray calculations are too much so I just did a terraria style lighting system
// -Ada


let KinkyDungeonSeeAll = false;
let KDVisionBlockers = new Map();
let KDLightBlockers = new Map();

function KinkyDungeonCheckProjectileClearance(xx, yy, x2, y2) {
	let tiles = KinkyDungeonTransparentObjects;
	let moveDirection = KinkyDungeonGetDirection(x2 - xx, y2 - yy);
	let x1 = xx + moveDirection.x;
	let y1 = yy + moveDirection.y;
	let dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
	for (let d = 0; d < dist; d += 0.25) {
		let mult = d / dist;
		let xxx = x1 + mult * (x2-x1);
		let yyy = y1 + mult * (y2-y1);
		if (!tiles.includes(KinkyDungeonMapGet(Math.round(xxx), Math.round(yyy)))) return false;
	}
	return true;
}

function KinkyDungeonCheckPath(x1, y1, x2, y2, allowBars, blockEnemies, maxFails, blockOnlyLOSBlock) {
	if (x1 == x2 && y1 == y2) return true;
	let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
	// Allowbars = checking for vision only
	// Otherwise = checking for physical path
	let obj = allowBars ? KinkyDungeonTransparentObjects : KinkyDungeonTransparentMovableObjects;
	let maxFailsAllowed = maxFails ? maxFails : 1;
	let fails = 0;

	for (let F = 0; F <= length; F++) {
		let xx = x1 + (x2-x1)*F/length;
		let yy = y1 + (y2-y1)*F/length;

		if ((Math.round(xx) != x1 || Math.round(yy) != y1) && (Math.round(xx) != x2 || Math.round(yy) != y2)) {
			let hits = 0;
			if (!obj.includes(KinkyDungeonMapGet(Math.floor(xx), Math.floor(yy)))
				|| ((xx != x1 || yy != y1) && (blockEnemies && ((!blockOnlyLOSBlock && KinkyDungeonEnemyAt(Math.floor(xx), Math.floor(yy))) || (blockOnlyLOSBlock && KinkyDungeonEnemyAt(Math.floor(xx), Math.floor(yy))?.Enemy.blockVision))))
				|| ((xx != x1 || yy != y1) && (allowBars && KDVisionBlockers.get(Math.floor(xx) + "," + Math.floor(yy))))) hits += 1;
			if (!obj.includes(KinkyDungeonMapGet(Math.round(xx), Math.round(yy)))
				|| ((xx != x1 || yy != y1) && (blockEnemies && ((!blockOnlyLOSBlock && KinkyDungeonEnemyAt(Math.round(xx), Math.round(yy))) || (blockOnlyLOSBlock && KinkyDungeonEnemyAt(Math.round(xx), Math.round(yy))?.Enemy.blockVision))))
				|| ((xx != x1 || yy != y1) && (allowBars && KDVisionBlockers.get(Math.round(xx) + "," + Math.round(yy))))) hits += 1;
			if (hits < 2 && !obj.includes(KinkyDungeonMapGet(Math.ceil(xx), Math.ceil(yy)))
				|| ((xx != x1 || yy != y1) && (blockEnemies && ((!blockOnlyLOSBlock && KinkyDungeonEnemyAt(Math.ceil(xx), Math.ceil(yy))) || (blockOnlyLOSBlock && KinkyDungeonEnemyAt(Math.ceil(xx), Math.ceil(yy))?.Enemy.blockVision))))
				|| ((xx != x1 || yy != y1) && (allowBars && KDVisionBlockers.get(Math.ceil(xx) + "," + Math.ceil(yy))))) hits += 1;


			if (hits >= 2) {
				fails += 1;
				if (fails >= maxFailsAllowed)
					return false;
			}
		}
	}

	return true;
}

let KDPlayerLight = 0;
let KDMapBrightnessMult = 0.2;

function KinkyDungeonResetFog() {
	KinkyDungeonFogGrid = [];
	// Generate the grid
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++)
			KinkyDungeonFogGrid.push(0); // 0 = pitch dark
	}
}

function KinkyDungeonMakeBrightnessMap(width, height, mapBrightness, Lights, delta) {
	let flags = {
		SeeThroughWalls: 0,
	};

	KinkyDungeonSendEvent("brightness",{update: delta, flags: flags});

	let ShadowColor = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].shadowColor ? KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].shadowColor : 0x00001f;
	let LightColor = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].lightColor ? KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]].lightColor : 0x000000;

	KinkyDungeonBlindLevelBase = 0; // Set to 0 when consumed. We only redraw lightmap once so this is safe.
	KinkyDungeonColorGrid = [];
	KinkyDungeonShadowGrid = [];
	KinkyDungeonBrightnessGrid = [];
	// Generate the grid
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
			KinkyDungeonBrightnessGrid.push(0);
			KinkyDungeonShadowGrid.push(0);
			KinkyDungeonColorGrid.push(LightColor);
		}
	}
	let baseBrightness = mapBrightness * KDMapBrightnessMult;
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++)
			if (KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(X, Y))) {
				KinkyDungeonBrightnessSet(X, Y, baseBrightness);
			}
	}

	let maxPass = 0;

	KDLightBlockers = new Map();
	for (let EE of KinkyDungeonEntities) {
		let Enemy = EE.Enemy;
		if (Enemy && Enemy.blockVision || (Enemy.blockVisionWhileStationary && !EE.moved && EE.idle)) // Add
			KDLightBlockers.set(EE.x + "," + EE.y, true);
	}
	let LightsTemp = new Map();
	for (let location of Object.values(KinkyDungeonEffectTiles)) {
		for (let tile of Object.values(location)) {
			if (tile.duration > 0) {
				if (tile.lightColor) {
					if (tile.brightness > KinkyDungeonBrightnessGet(tile.x, tile.y))
						KinkyDungeonColorSet(tile.x, tile.y, tile.lightColor);
				}
				if (tile.tags.includes("brightnessblock")) {
					KDLightBlockers.set(tile.x + "," + tile.y, true);
				}
				if (tile.tags.includes("darkarea")) {
					KinkyDungeonBrightnessSet(tile.x, tile.y, 0);
				}
				//if (tile.shadowColor) {
				//KinkyDungeonShadowSet(tile.x, tile.y, tile.shadowColor);
				//}
				if (tile.brightness) {
					maxPass = Math.max(maxPass, tile.brightness);
					KinkyDungeonBrightnessSet(tile.x, tile.y, tile.brightness, true);

					if (!LightsTemp.get(tile.x + "," + tile.y) || tile.brightness > LightsTemp.get(tile.x + "," + tile.y))
						LightsTemp.set(tile.x + "," + tile.y, tile.brightness);
				}
			}
		}
	}

	for (let light of Lights) {
		if (light.brightness > 0) {
			maxPass = Math.max(maxPass, light.brightness);
			if (light.brightness > KinkyDungeonBrightnessGet(light.x, light.y)) {
				if (light.color) KinkyDungeonColorSet(light.x, light.y, light.color);
				else KinkyDungeonColorSet(light.x, light.y, 0xffffff);
			}
			KinkyDungeonBrightnessSet(light.x, light.y, light.brightness, true);

			if (!(LightsTemp.get(light.x + "," + light.y) >= light.brightness)) {
				LightsTemp.set(light.x + "," + light.y, light.brightness);
			}
		}
	}

	/**
	 * @type {{x: number, y: number, brightness: number, color: number, shadow: number}[]}
	 */
	let nextBrightness = [];

	for (let L = maxPass; L > 0; L--) {
		// if a grid square is next to a brighter transparent object, it gets that light minus one, or minus two if diagonal
		nextBrightness = [];
		// Main grid square loop
		for (let X = 1; X < KinkyDungeonGridWidth - 1; X++) {
			for (let Y = 1; Y < KinkyDungeonGridHeight - 1; Y++) {
				let tile = KinkyDungeonMapGet(X, Y);
				if ((KinkyDungeonTransparentObjects.includes(tile) && !KDLightBlockers.get(X + "," + Y)) || LightsTemp.get(X + "," + Y)) {
					let brightness = KinkyDungeonBrightnessGet(X, Y);
					let color = KinkyDungeonColorGet(X, Y);
					let shadow = KinkyDungeonShadowGet(X, Y);
					if (brightness > 0) {
						let decay = 0.7;
						let nearbywalls = 0;
						for (let XX = X-1; XX <= X+1; XX++)
							for (let YY = Y-1; YY <= Y+1; YY++)
								if (!KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(XX, YY)) || KDLightBlockers.get(XX + "," + YY)) nearbywalls += 1;
						if (nearbywalls > 3 && brightness <= 9) decay += nearbywalls * 0.15;
						else if (nearbywalls > 1 && brightness <= 9) decay += nearbywalls * 0.1;

						if (brightness > 0) {
							if (Number(KinkyDungeonBrightnessGet(X-1, Y)) < brightness) nextBrightness.push({x:X-1, y:Y, shadow: shadow, color: color, brightness: (brightness - decay)});// KinkyDungeonLightSet(X-1, Y, Math.max(Number(KinkyDungeonLightGet(X-1, Y)), (brightness - decay)));
							if (Number(KinkyDungeonBrightnessGet(X+1, Y)) < brightness) nextBrightness.push({x:X+1, y:Y, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X+1, Y, Math.max(Number(KinkyDungeonLightGet(X+1, Y)), (brightness - decay)));
							if (Number(KinkyDungeonBrightnessGet(X, Y-1)) < brightness) nextBrightness.push({x:X, y:Y-1, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X, Y-1, Math.max(Number(KinkyDungeonLightGet(X, Y-1)), (brightness - decay)));
							if (Number(KinkyDungeonBrightnessGet(X, Y+1)) < brightness) nextBrightness.push({x:X, y:Y+1, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X, Y+1, Math.max(Number(KinkyDungeonLightGet(X, Y+1)), (brightness - decay)));

							if (brightness > 0.5) {
								if (Number(KinkyDungeonBrightnessGet(X-1, Y-1)) < brightness) nextBrightness.push({x:X-1, y:Y-1, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X-1, Y-1, Math.max(Number(KinkyDungeonLightGet(X-1, Y-1)), brightness - decay));
								if (Number(KinkyDungeonBrightnessGet(X-1, Y+1)) < brightness) nextBrightness.push({x:X-1, y:Y+1, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X-1, Y+1, Math.max(Number(KinkyDungeonLightGet(X-1, Y+1)), brightness - decay));
								if (Number(KinkyDungeonBrightnessGet(X+1, Y-1)) < brightness) nextBrightness.push({x:X+1, y:Y-1, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X+1, Y-1, Math.max(Number(KinkyDungeonLightGet(X+1, Y-1)), brightness - decay));
								if (Number(KinkyDungeonBrightnessGet(X+1, Y+1)) < brightness) nextBrightness.push({x:X+1, y:Y+1, shadow: shadow, color: color, brightness: (brightness - decay)});//KinkyDungeonLightSet(X+1, Y+1, Math.max(Number(KinkyDungeonLightGet(X+1, Y+1)), brightness - decay));
							}
						}
					}
				}
			}
		}

		for (let b of nextBrightness) {
			let brightness = KinkyDungeonBrightnessGet(b.x, b.y);
			if (b.brightness > brightness) {
				KinkyDungeonBrightnessSet(b.x, b.y, Math.max(Number(brightness), b.brightness));
				KinkyDungeonColorSet(b.x, b.y, KDAvgColor(b.color, KinkyDungeonColorGet(b.x, b.y), b.brightness, brightness));
				//KinkyDungeonShadowSet(b.x, b.y, KDAvgColor(b.shadow, KinkyDungeonShadowGet(b.x, b.y), b.brightness, brightness));
			}
		}
	}

	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
			let brightness = KinkyDungeonBrightnessGet(X, Y);
			KinkyDungeonShadowSet(X, Y, KDAvgColor(ShadowColor, 0x000000, 1, Math.max(0, brightness - baseBrightness)));
		}
	}

	KDPlayerLight = KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
}

/** Averages two hex colors according to weights w1 and w2
 * @param {number} color1
 * @param {number} color2
 * @param {number} w1 - Weight of color1
 * @param {number} w2 - Weight of color2
 * @returns {number}
 */
function KDAvgColor(color1, color2, w1, w2) {
	let r = (color1 & 0xFF0000) >> 16;
	let g = (color1 & 0x00FF00) >> 8;
	let b = (color1 & 0x0000FF);

	r = Math.floor((r * w1 + w2*((color2 & 0xFF0000) >> 16))/(w1 + w2));
	g = Math.floor((g * w1 + w2*((color2 & 0x00FF00) >> 8))/(w1 + w2));
	b = Math.floor((b * w1 + w2*((color2 & 0x0000FF)))/(w1 + w2));
	return (r << 16) + (g << 8) + b;
}

function KinkyDungeonMakeVisionMap(width, height, Viewports, Lights, delta, mapBrightness) {
	let flags = {
		SeeThroughWalls: 0,
	};

	KinkyDungeonSendEvent("vision",{update: delta, flags: flags});

	KinkyDungeonBlindLevelBase = 0; // Set to 0 when consumed. We only redraw lightmap once so this is safe.
	KinkyDungeonVisionGrid = [];
	// Generate the grid
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++)
			KinkyDungeonVisionGrid.push(0); // 0 = pitch dark
	}

	let maxPass = 0;
	let brightestLight = 0;

	KDVisionBlockers = new Map();
	for (let EE of KinkyDungeonEntities) {
		let Enemy = EE.Enemy;
		if (Enemy && (Enemy.blockVision || (Enemy.blockVisionWhileStationary && !EE.moved && EE.idle))) // Add
			KDVisionBlockers.set(EE.x + "," + EE.y, true);
	}
	let LightsTemp = new Map();
	for (let location of Object.values(KinkyDungeonEffectTiles)) {
		for (let tile of Object.values(location)) {
			if (tile.duration > 0 && tile.tags.includes("visionblock")) {
				KDVisionBlockers.set(tile.x + "," + tile.y, true);
			}
			if (tile.brightness) {
				LightsTemp.set(tile.x + "," + tile.y, tile.brightness);
			}
		}
	}

	for (let light of Lights) {
		if (light.brightness > 0) {
			if (!(LightsTemp.get(light.x + "," + light.y) >= light.brightness)) {
				LightsTemp.set(light.x + "," + light.y, light.brightness);
			}
			if (light.y_orig != undefined && !(LightsTemp.get(light.x + "," + light.y_orig) >= light.brightness)) {
				LightsTemp.set(light.x + "," + light.y_orig, light.brightness);
			}
		}
	}



	// Viewports = basically lights but they only add vision
	for (let light of Viewports) {
		if (light.brightness > 0) {
			maxPass = Math.max(maxPass, light.brightness);
			if (light.brightness > brightestLight) brightestLight = light.brightness;
			KinkyDungeonVisionSet(light.x, light.y, light.brightness);
		}
	}

	// Generate the grid
	let bb = 0;
	let d = 1;
	let newL = 0;
	for (let X = 1; X < KinkyDungeonGridWidth - 1; X++) {
		for (let Y = 1; Y < KinkyDungeonGridHeight - 1; Y++)
			if (KinkyDungeonCheckPath(X, Y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, true, flags.SeeThroughWalls ? flags.SeeThroughWalls + 1 : 1, true)
				&& KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(X, Y))) {
				bb = KinkyDungeonBrightnessGet(X, Y);
				d = KDistChebyshev(X - KinkyDungeonPlayerEntity.x, Y - KinkyDungeonPlayerEntity.y);
				newL = bb + 2 - Math.min(1.5, d * 1.5);
				if (newL > KinkyDungeonVisionGet(X, Y)) {
					KinkyDungeonVisionSet(X, Y, Math.max(0, newL));
					maxPass = Math.max(maxPass, newL);
				}
			}
	}

	/**
	 * @type {{x: number, y: number, brightness: number}[]}
	 */
	let nextBrightness = [];

	for (let L = maxPass; L > 0; L--) {
		// if a grid square is next to a brighter transparent object, it gets that light minus one, or minus two if diagonal
		nextBrightness = [];
		// Main grid square loop
		for (let X = 0; X < KinkyDungeonGridWidth; X++) {
			for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
				let tile = KinkyDungeonMapGet(X, Y);
				if ((LightsTemp.get(X + "," + Y) || (KinkyDungeonTransparentObjects.includes(tile) || (X == KinkyDungeonPlayerEntity.x && Y == KinkyDungeonPlayerEntity.y))) && !KDVisionBlockers.get(X + "," + Y)) {
					let brightness = KinkyDungeonVisionGet(X, Y);
					if (brightness > 0) {
						let decay = KinkyDungeonDeaf ? 5 : 2;
						if (!KinkyDungeonTransparentObjects.includes(tile)) decay += 3;

						if (brightness > 0) {
							if (Number(KinkyDungeonVisionGet(X-1, Y)) < brightness) nextBrightness.push({x:X-1, y:Y, brightness: (brightness - decay)});// KinkyDungeonLightSet(X-1, Y, Math.max(Number(KinkyDungeonLightGet(X-1, Y)), (brightness - decay)));
							if (Number(KinkyDungeonVisionGet(X+1, Y)) < brightness) nextBrightness.push({x:X+1, y:Y, brightness: (brightness - decay)});//KinkyDungeonLightSet(X+1, Y, Math.max(Number(KinkyDungeonLightGet(X+1, Y)), (brightness - decay)));
							if (Number(KinkyDungeonVisionGet(X, Y-1)) < brightness) nextBrightness.push({x:X, y:Y-1, brightness: (brightness - decay)});//KinkyDungeonLightSet(X, Y-1, Math.max(Number(KinkyDungeonLightGet(X, Y-1)), (brightness - decay)));
							if (Number(KinkyDungeonVisionGet(X, Y+1)) < brightness) nextBrightness.push({x:X, y:Y+1, brightness: (brightness - decay)});//KinkyDungeonLightSet(X, Y+1, Math.max(Number(KinkyDungeonLightGet(X, Y+1)), (brightness - decay)));

							if (brightness > 0.5) {
								if (Number(KinkyDungeonVisionGet(X-1, Y-1)) < brightness) nextBrightness.push({x:X-1, y:Y-1, brightness: (brightness - decay)});//KinkyDungeonLightSet(X-1, Y-1, Math.max(Number(KinkyDungeonLightGet(X-1, Y-1)), brightness - decay));
								if (Number(KinkyDungeonVisionGet(X-1, Y+1)) < brightness) nextBrightness.push({x:X-1, y:Y+1, brightness: (brightness - decay)});//KinkyDungeonLightSet(X-1, Y+1, Math.max(Number(KinkyDungeonLightGet(X-1, Y+1)), brightness - decay));
								if (Number(KinkyDungeonVisionGet(X+1, Y-1)) < brightness) nextBrightness.push({x:X+1, y:Y-1, brightness: (brightness - decay)});//KinkyDungeonLightSet(X+1, Y-1, Math.max(Number(KinkyDungeonLightGet(X+1, Y-1)), brightness - decay));
								if (Number(KinkyDungeonVisionGet(X+1, Y+1)) < brightness) nextBrightness.push({x:X+1, y:Y+1, brightness: (brightness - decay)});//KinkyDungeonLightSet(X+1, Y+1, Math.max(Number(KinkyDungeonLightGet(X+1, Y+1)), brightness - decay));
							}
						}
					}
				}
			}
		}

		for (let b of nextBrightness) {
			KinkyDungeonVisionSet(b.x, b.y, Math.max(Number(KinkyDungeonVisionGet(b.x, b.y)), b.brightness));
		}
	}


	let vv = 0;
	// Now make lights bright
	for (let X = 1; X < KinkyDungeonGridWidth - 1; X++) {
		for (let Y = 1; Y < KinkyDungeonGridHeight - 1; Y++) {
			vv = KinkyDungeonVisionGet(X, Y);
			bb = KinkyDungeonBrightnessGet(X, Y);
			if (vv > 0 && KDLightCropValue + bb > vv && LightsTemp.get(X + "," + Y)) {
				KinkyDungeonVisionSet(X, Y, KDLightCropValue + bb);
			}
		}
	}

	let rad = KinkyDungeonGetVisionRadius();
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
			let dd = KDistChebyshev(X - KinkyDungeonPlayerEntity.x, Y - KinkyDungeonPlayerEntity.y);
			if (dd > rad)
				KinkyDungeonVisionSet(X, Y, 0);
			else if (rad < KDMaxVisionDist && dd > 1.5) {
				KinkyDungeonVisionSet(X, Y, KinkyDungeonVisionGet(X, Y) * Math.min(1, Math.max(0, rad - dd)/3));
			}
		}
	}


	if (KinkyDungeonSeeAll) {
		KinkyDungeonVisionGrid = [];
		// Generate the grid
		for (let X = 0; X < KinkyDungeonGridWidth; X++) {
			for (let Y = 0; Y < KinkyDungeonGridHeight; Y++)
				//KinkyDungeonLightGrid = KinkyDungeonLightGrid + '9'; // 0 = pitch dark
				KinkyDungeonVisionGrid.push(10); // 0 = pitch dark
			//KinkyDungeonLightGrid = KinkyDungeonLightGrid + '\n';
		}
	} else {
		// Generate the grid
		let dist = 0;
		let fog = true;//KDAllowFog();
		for (let X = 0; X < KinkyDungeonGridWidth; X++) {
			for (let Y = 0; Y < KinkyDungeonGridHeight; Y++)
				if (X >= 0 && X <= width-1 && Y >= 0 && Y <= height-1) {
					dist = KDistChebyshev(KinkyDungeonPlayerEntity.x - X, KinkyDungeonPlayerEntity.y - Y);
					if (dist < 3) {
						let distE = KDistEuclidean(KinkyDungeonPlayerEntity.x - X, KinkyDungeonPlayerEntity.y - Y);
						if (fog && dist < 3
							&& distE < 2.9
							&& KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, X, Y, true, true, flags.SeeThroughWalls ? flags.SeeThroughWalls + 1 : 1, true)) {
							KinkyDungeonFogGrid[X + Y*(width)] = Math.max(KinkyDungeonFogGrid[X + Y*(width)], 3);
						}
						if (distE < (KinkyDungeonDeaf ? 1.5 : 2.3) && KinkyDungeonVisionGrid[X + Y*(width)] == 0
							&& KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, X, Y, true, true, flags.SeeThroughWalls ? flags.SeeThroughWalls + 1 : 1, true)) {
							KinkyDungeonVisionGrid[X + Y*(width)] = 1;
						}
					}

					if (fog)
						KinkyDungeonFogGrid[X + Y*(width)] = Math.max(KinkyDungeonFogGrid[X + Y*(width)], KinkyDungeonVisionGrid[X + Y*(width)] ? 2 : 0);
				}
		}
	}
}

let KDLightCropValue = 6;

function KDDrawFog(CamX, CamY, CamX_offset, CamY_offset) {
	kdgamefog.clear();

	let v_td = false;
	let v_tu = false;
	let v_tl = false;
	let v_tr = false;
	let v_tdl = false;
	//let v_tul = false;
	let v_tdr = false;
	//let v_tur = false;
	let RX = 0;
	let RY = 0;
	let allowFog = false;
	let visible = false;
	let fog = 0;
	let lightDiv = 0;
	let light = 0;
	let shadowColor = 0;
	let l = 0;
	let pad = 0;

	for (let R = -1; R <= KinkyDungeonGridHeightDisplay + 2; R++)  {
		for (let X = -1; X <= KinkyDungeonGridWidthDisplay + 2; X++)  {

			RY = R+CamY;
			RX = X+CamX;
			allowFog = KDAllowFog();
			if (RY >= 0 && RY < KinkyDungeonGridHeight && RX >= 0 && RX < KinkyDungeonGridWidth) {
				visible = (KinkyDungeonVisionGet(RX, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY) > 0));
				if (visible) {
					fog = KinkyDungeonStatBlind > 0 ? 0 : Math.min(0.5, KinkyDungeonFogGet(RX, RY)/10);
					lightDiv = (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(RX, RY))) ? KDLightCropValue : KDLightCropValue * 0.7;
					light = Math.max(KinkyDungeonVisionGrid[RX + RY*KinkyDungeonGridWidth]/lightDiv, fog);
					//let lightColor = KinkyDungeonColorGrid[RX + RY*KinkyDungeonGridWidth];
					shadowColor = KinkyDungeonShadowGrid[RX + RY*KinkyDungeonGridWidth];
					if (KinkyDungeonVisionGrid[RX + RY*KinkyDungeonGridWidth] > 0 && KDistChebyshev(KinkyDungeonPlayerEntity.x - RX, KinkyDungeonPlayerEntity.y - RY) < 2) {
						light = light + (1 - light)*0.5;
					}
					l = Math.max(0, Math.min(1, (1-light)));
					//kdgamefog.beginFill(light > 0 ? (KDAvgColor(lightColor, shadowColor, light, Math.max(0, 1 - light))) : 0, l*l);
					kdgamefog.beginFill(light > 0 ? shadowColor : 0x000000, (KinkyDungeonVisionGrid[RX + RY*KinkyDungeonGridWidth] > 0) ? (0.9*l*l) : l);
					pad = light > 0 ? 0 : 1;
					kdgamefog.drawRect((-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad, (-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad, KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2);
					kdgamefog.endFill();


					if (KDToggles.FancyWalls && (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(RX, RY)) || RX == 0 || RY == 0)) {
						if (KDWallVert(RX, RY) || KinkyDungeonGridHeight == RY + 1) {
							// Tile Up Visible
							v_tu = ((KinkyDungeonVisionGet(RX, RY - 1) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY - 1) > 0)));
							v_td = ((KinkyDungeonVisionGet(RX, RY + 1) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY + 1) > 0)));
							v_tl = ((KinkyDungeonVisionGet(RX - 1, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX - 1, RY) > 0)));
							v_tr = ((KinkyDungeonVisionGet(RX + 1, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX + 1, RY) > 0)));
							//v_tul = ((KinkyDungeonVisionGet(RX - 1, RY - 1) > 0 || (allowFog && KinkyDungeonFogGet(RX - 1, RY - 1) > 0)));
							v_tdl = ((KinkyDungeonVisionGet(RX - 1, RY + 1) > 0 || (allowFog && KinkyDungeonFogGet(RX - 1, RY + 1) > 0)));
							//v_tur = ((KinkyDungeonVisionGet(RX + 1, RY - 1) > 0 || (allowFog && KinkyDungeonFogGet(RX + 1, RY - 1) > 0)));
							v_tdr = ((KinkyDungeonVisionGet(RX + 1, RY + 1) > 0 || (allowFog && KinkyDungeonFogGet(RX + 1, RY + 1) > 0)));

							pad = 1;
							if (!v_tl) {
								kdgamefog.beginFill(0x000000, 1.0);
								kdgamefog.drawRect(
									(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad,
									(-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
									KinkyDungeonGridSizeDisplay/2 + pad*2,
									KinkyDungeonGridSizeDisplay + pad*2);
								kdgamefog.endFill();
							}
							if (!v_tr) {
								kdgamefog.beginFill(0x000000, 1.0);
								kdgamefog.drawRect(
									(-CamX_offset + X + 0.5)*KinkyDungeonGridSizeDisplay - pad,
									(-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
									KinkyDungeonGridSizeDisplay/2 + pad*2,
									KinkyDungeonGridSizeDisplay + pad*2);
								kdgamefog.endFill();
							}
							if (!v_tu && !v_tdl && !v_tdr) {
								kdgamefog.beginFill(0x000000, 1.0);
								kdgamefog.drawRect(
									(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad,
									(-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
									KinkyDungeonGridSizeDisplay + pad*2,
									KinkyDungeonGridSizeDisplay/2 + pad*2);
								kdgamefog.endFill();
							}
							if (!v_td) {
								kdgamefog.beginFill(0x000000, 1.0);
								kdgamefog.drawRect(
									(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad,
									(-CamY_offset + R + 0.5)*KinkyDungeonGridSizeDisplay - pad,
									KinkyDungeonGridSizeDisplay + pad*2,
									KinkyDungeonGridSizeDisplay/2 + pad*2);
								kdgamefog.endFill();
							}
							if (v_td && v_tl && !v_tdl) {
								kdgamefog.beginFill(0x000000, 1.0);
								kdgamefog.drawRect(
									(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad,
									(-CamY_offset + R + 0.5)*KinkyDungeonGridSizeDisplay - pad,
									KinkyDungeonGridSizeDisplay/2 + pad*2,
									KinkyDungeonGridSizeDisplay/2 + pad*2);
								kdgamefog.endFill();
							}
							if (v_td && v_tr && !v_tdr) {
								kdgamefog.beginFill(0x000000, 1.0);
								kdgamefog.drawRect(
									(-CamX_offset + X + 0.5)*KinkyDungeonGridSizeDisplay - pad,
									(-CamY_offset + R + 0.5)*KinkyDungeonGridSizeDisplay - pad,
									KinkyDungeonGridSizeDisplay/2 + pad*2,
									KinkyDungeonGridSizeDisplay/2 + pad*2);
								kdgamefog.endFill();
							}
						}
					}
				}
			}
		}
	}
}

/**
 * Allows fog of war to be rendered
 */
function KDAllowFog() {
	return !(KinkyDungeonStatsChoice.get("Forgetful") || (KinkyDungeonBlindLevel > 0 && KinkyDungeonStatsChoice.get("TotalBlackout")));
}