"use strict";
// Lots of good info here: http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html#permissivecode
// -Ada

let KDMinimapIcons = {
	'G': (_x, _y) => {return "UI/MiniMap/Ghost.png";},
	'O': (_x, _y) => {return "UI/MiniMap/Orb.png";},
	'S': (_x, _y) => {return "UI/MiniMap/Stairs.png";},
	's': (_x, _y) => {return "UI/MiniMap/StairsDown.png";},
	'H': (_x, _y) => {return "UI/MiniMap/StairsDown.png";},
	'A': (x, y) => {
		if (KinkyDungeonTilesGet(x + "," + y)?.drunk) {
			if (KinkyDungeonTilesGet(x + "," + y)?.Quest)
				return "UI/MiniMap/ShrineQuest.png";
			return "UI/MiniMap/ShrineMana.png";
		}
		if (KinkyDungeonTilesGet(x + "," + y)?.Quest)
			return "UI/MiniMap/ShrineManaQuest.png";
		return "UI/MiniMap/ShrineMana.png";},
	'=': (_x, _y) => {return "UI/MiniMap/ChargerEmpty.png";},
	'+': (_x, _y) => {return "UI/MiniMap/ChargerCrystal.png";},
	'D': (_x, _y) => {return "UI/MiniMap/DoorClosed.png";},
	'd': (_x, _y) => {return "UI/MiniMap/DoorOpen.png";},
	'B': (_x, _y) => {return "UI/MiniMap/Bed.png";},
	'b': (_x, _y) => {return "UI/MiniMap/Bars.png";},
	'g': (_x, _y) => {return "UI/MiniMap/Grate.png";},
	'M': (_x, _y) => {return "UI/MiniMap/Tablet.png";},
	'C': (_x, _y) => {return "UI/MiniMap/Chest.png";},
};


let KDRedrawFog = 0;
let KDRedrawMM = 0;

let KinkyDungeonSeeAll = false;
let KDVisionBlockers = new Map();
let KDLightBlockers = new Map();

function KinkyDungeonCheckProjectileClearance(xx: number, yy: number, x2: number, y2: number, playerblock?: boolean): boolean {
	let tiles = KinkyDungeonTransparentObjects;
	let moveDirection = KinkyDungeonGetDirection(x2 - xx, y2 - yy);
	let x1 = xx + moveDirection.x;
	let y1 = yy + moveDirection.y;
	let dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
	for (let d = 0; d < dist; d += 0.25) {
		let mult = d / dist;
		let xxx = x1 + mult * (x2-x1);
		let yyy = y1 + mult * (y2-y1);
		if (!playerblock || KDPlayer().x != Math.round(xxx) || KDPlayer().y != Math.round(yyy))
		if (!tiles.includes(KinkyDungeonMapGet(Math.round(xxx), Math.round(yyy)))) return false;
	}
	return true;
}

function KinkyDungeonCheckPathCount(x1: number, y1: number, x2: number, y2: number, allowBars: boolean, blockEnemies: boolean, maxFails: number, blockOnlyLOSBlock: boolean): number {
	if (x1 == x2 && y1 == y2) return 0;
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
					return fails;
			}
		}
	}

	return fails;
}

function KinkyDungeonCheckPath(x1: number, y1: number, x2: number, y2: number, allowBars: boolean = false, blockEnemies: boolean = false, maxFails: number = 1, blockOnlyLOSBlock?: boolean): boolean {
	return KinkyDungeonCheckPathCount(x1, y1, x2, y2, allowBars, blockEnemies, maxFails, blockOnlyLOSBlock) < maxFails;
}

let KDPlayerLight = 0;
let KDMapBrightnessMult = 0.2;

/** 25 tile optimization distance */
let GiantMapOptimizations = 25;

function KinkyDungeonResetFog() {
	KDMapData.FogGrid = [];
	// Generate the grid
	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++)
			KDMapData.FogGrid.push(0); // 0 = pitch dark
	}
}

function KinkyDungeonMakeBrightnessMap(_width: number, _height: number, mapBrightness: number, Lights: any[], delta: number): void {
	let flags = {
		SeeThroughWalls: 0,
	};

	KinkyDungeonSendEvent("brightness",{update: delta, flags: flags});

	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
	let params = altType?.lightParams ? KinkyDungeonMapParams[altType.lightParams] : KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];

	let ShadowColor = params.shadowColor != undefined ? params.shadowColor : 0x00001f;
	let LightColor = params.lightColor != undefined ? params.lightColor : 0x000000;

	KinkyDungeonBlindLevelBase = 0; // Set to 0 when consumed. We only redraw lightmap once so this is safe.
	KDMapExtraData.ColorGrid = [];
	KDMapExtraData.ShadowGrid = [];
	KDMapExtraData.BrightnessGrid = [];
	// Generate the grid
	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
			KDMapExtraData.BrightnessGrid.push(0);
			KDMapExtraData.ShadowGrid.push(0);
			KDMapExtraData.ColorGrid.push(LightColor);
		}
	}
	let baseBrightness = mapBrightness * KDMapBrightnessMult;
	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++)
			if (!GiantMapOptimizations || KDistChebyshev(KDPlayer().x-X, KDPlayer().y-Y) < GiantMapOptimizations)
				if (KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(X, Y))) {
					KinkyDungeonBrightnessSet(X, Y, baseBrightness);
				}
	}

	let maxPass = 0;

	KDLightBlockers = new Map();
	for (let EE of KDMapData.Entities) {
		let Enemy = EE.Enemy;
		if (Enemy && Enemy.blockVision || (Enemy.blockVisionWhileStationary && !EE.moved && EE.idle)) // Add
			KDLightBlockers.set(EE.x + "," + EE.y, true);
	}
	let LightsTemp = new Map();
	for (let location of Object.values(KDMapData.EffectTiles)) {
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

	let nextBrightness: {x: number, y: number, brightness: number, color: number, shadow: number}[] = [];

	for (let L = maxPass; L > 0; L--) {
		// if a grid square is next to a brighter transparent object, it gets that light minus one, or minus two if diagonal
		nextBrightness = [];
		// Main grid square loop
		for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
			for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
				// Brightness doesnt propagate too far past the player...
				if (!GiantMapOptimizations || L == maxPass || KDistChebyshev(KDPlayer().x-X, KDPlayer().y-Y) < GiantMapOptimizations) {
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

	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
			let brightness = KinkyDungeonBrightnessGet(X, Y);
			KinkyDungeonShadowSet(X, Y, KDAvgColor(ShadowColor, 0x000000, 1, Math.max(0, brightness - baseBrightness)));
		}
	}

	KDPlayerLight = KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
}

/**
 * Averages two hex colors according to weights w1 and w2
 * @param {number} w1 - Weight of color1
 * @param {number} w2 - Weight of color2
 */
function KDAvgColor(color1: number, color2: number, w1: number, w2: number): number {
	let r = (color1 & 0xFF0000) >> 16;
	let g = (color1 & 0x00FF00) >> 8;
	let b = (color1 & 0x0000FF);

	r = Math.floor((r * w1 + w2*((color2 & 0xFF0000) >> 16))/(w1 + w2));
	g = Math.floor((g * w1 + w2*((color2 & 0x00FF00) >> 8))/(w1 + w2));
	b = Math.floor((b * w1 + w2*((color2 & 0x0000FF)))/(w1 + w2));
	return (r << 16) + (g << 8) + b;
}

function KinkyDungeonMakeVisionMap(width: number, height: number, Viewports: any, Lights: any, delta: number, _mapBrightness: number): void {
	let flags = {
		SeeThroughWalls: 0,
		nightVision: KDGameData.NightVision,
		visionAdjust: KDGameData.visionAdjust || 0,
		visionAdjustMult: 0.1 + (0.3 * KDGameData.visionBlind || 0),
	};

	if (!KDGameData.visionAdjust) KDGameData.visionAdjust = 0;

	KinkyDungeonSendEvent("vision",{update: delta, flags: flags});

	flags.nightVision = Math.max(flags.nightVision * (KinkyDungeonStatsChoice.get("NightBlindness") ? 0.4 : 0.9), flags.nightVision * (1 - flags.visionAdjust));

	KinkyDungeonBlindLevelBase = 0; // Set to 0 when consumed. We only redraw lightmap once so this is safe.
	KDMapExtraData.VisionGrid = [];
	// Generate the grid
	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++)
			KDMapExtraData.VisionGrid.push(0); // 0 = pitch dark
	}

	let maxPass = 0;
	let brightestLight = 0;

	KDVisionBlockers = new Map();
	for (let EE of KDMapData.Entities) {
		let Enemy = EE.Enemy;
		if (Enemy && (Enemy.blockVision || (Enemy.blockVisionWhileStationary && !EE.moved && EE.idle))) // Add
			KDVisionBlockers.set(EE.x + "," + EE.y, true);
	}
	let LightsTemp = new Map();
	for (let location of Object.values(KDMapData.EffectTiles)) {
		for (let tile of Object.values(location)) {
			// Smoke doesnt block vision if its right next to the player
			if (tile.duration > 0
				&& (KDistChebyshev(tile.x - KinkyDungeonPlayerEntity.x, tile.y - KinkyDungeonPlayerEntity.y) > (tile.visionBlockRadius || 1.5) && tile.tags.includes("visionblock"))) {
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

	let visionAdjustPoints = 0;
	let visionAdjustTotal = 1;


	let rad = KinkyDungeonGetVisionRadius();
	let rad2 = rad + 8; // Limited interaction radius
	// Generate the grid
	let bb = 0;
	let d = 1;
	let newL = 0;
	for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
		for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++)
			if (KDistChebyshev(X - KDPlayer().x, Y - KDPlayer().y) < rad2
				&& KinkyDungeonCheckPath(X, Y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y,
					true, true, flags.SeeThroughWalls ? flags.SeeThroughWalls + 1 : 1, true)
				&& KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(X, Y))) {
				bb = KinkyDungeonBrightnessGet(X, Y);//Math.max( Math.min(10, 1.6 * (flags.nightVision - 1)), Math.min(flags.nightVision, 1) * KinkyDungeonBrightnessGet(X, Y));
				d = KDistEuclidean(X - KinkyDungeonPlayerEntity.x, Y - KinkyDungeonPlayerEntity.y);
				let darkmult = 1 - 1/Math.max(0.1, flags.nightVision) / (1/Math.max(0.1, flags.nightVision) + bb);
				//darkmult *= Math.max(0.1, bb) / (Math.max(0.1, bb) + Math.max(1, d)**2);
				bb *= darkmult;
				newL = bb - Math.min(2, d * .25);// + 1 - Math.min(2, d * 1.5);

				if (KinkyDungeonStatsChoice.get("DirectionVision") && (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y)
				&& (
					(KinkyDungeonPlayerEntity.facing_x || 0) * (X - KinkyDungeonPlayerEntity.x)
					+ (KinkyDungeonPlayerEntity.facing_y || 0) * (Y - KinkyDungeonPlayerEntity.y) <= 0
				)
				&& (X != KinkyDungeonPlayerEntity.x || Y != KinkyDungeonPlayerEntity.y)
				//&& ((KinkyDungeonPlayerEntity.facing_x && (X - KinkyDungeonPlayerEntity.x) && Math.sign(KinkyDungeonPlayerEntity.facing_x) != Math.sign(X - KinkyDungeonPlayerEntity.x))
				//|| (KinkyDungeonPlayerEntity.facing_y && (Y - KinkyDungeonPlayerEntity.y) && Math.sign(KinkyDungeonPlayerEntity.facing_y) != Math.sign(Y - KinkyDungeonPlayerEntity.y)))
				) {
					newL = 0;
				}
				if (newL > 0) {
					let dinv = rad + 1 - d;
					if (dinv > 0) {
						visionAdjustPoints += dinv * Math.min(10, KinkyDungeonBrightnessGet(X, Y)**2 - 6);
						visionAdjustTotal += dinv * 6;
					}
				}

				if (newL > KinkyDungeonVisionGet(X, Y)) {
					KinkyDungeonVisionSet(X, Y, Math.max(0, newL));
					maxPass = Math.max(maxPass, newL);
				}
			}
	}

	if (visionAdjustTotal > 0 && delta > 0) {
		let avg = visionAdjustPoints / visionAdjustTotal;
		KDGameData.visionBlind = 0;
		if (KDGameData.visionAdjust - delta * flags.visionAdjustMult > Math.max(-1, avg))
			KDGameData.visionAdjust -= delta * flags.visionAdjustMult;
		else if (KDGameData.visionAdjust + delta * flags.visionAdjustMult < Math.min(1, avg)) {
			KDGameData.visionAdjust += delta * flags.visionAdjustMult;
			if (avg > 0.1) {
				if (KDGameData.visionBlind == 0) {
					KinkyDungeonUpdateLightGrid = true;
				}
				let amnt = 0.2*Math.max(0, (avg - KDGameData.visionAdjust) * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "blindResist")));
				if (avg - KDGameData.visionAdjustBlind > 0.3 &&
					!(KDGameData.visionBlind > amnt)
				) {
					KDGameData.visionBlind = amnt;
					if (KDGameData.visionBlind > 0.04)
						KinkyDungeonSendTextMessage(4, TextGet("KDVisionBlind"), "#ffffff", 1, false, true, undefined, "Ambient");
				}


			}
		}

		if (delta == 1) {
			KDGameData.visionAdjustBlind = ((KDGameData.visionAdjustBlind || 0) + KDGameData.visionAdjust * 9)/10;
		}
		if (Math.abs(KDGameData.visionAdjust - avg) < delta * flags.visionAdjustMult * 1.1) KDGameData.visionAdjust = avg;
		if (KDGameData.visionAdjust > 1) KDGameData.visionAdjust = 1;
		else if (KDGameData.visionAdjust < -1) KDGameData.visionAdjust = -1;


	}


	let nextBrightness: {x: number, y: number, brightness: number}[] = [];

	for (let L = maxPass; L > 0; L--) {
		// if a grid square is next to a brighter transparent object, it gets that light minus one, or minus two if diagonal
		nextBrightness = [];
		// Main grid square loop
		for (let X = 0; X < KDMapData.GridWidth; X++) {
			for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
				if (KDistChebyshev(X - KDPlayer().x, Y - KDPlayer().y) > rad2) continue;
				let tile = KinkyDungeonMapGet(X, Y);
				if ((LightsTemp.get(X + "," + Y) || (KinkyDungeonTransparentObjects.includes(tile) || (X == KinkyDungeonPlayerEntity.x && Y == KinkyDungeonPlayerEntity.y))) && !KDVisionBlockers.get(X + "," + Y)) {
					let brightness = KinkyDungeonVisionGet(X, Y);
					if (brightness > 0.5 / Math.max(1, flags.nightVision)) {
						let decay = 2 / Math.min(2, Math.max(0.1, flags.nightVision));

						if (KinkyDungeonStatsChoice.get("DirectionVision") && (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y)
						&& (
							(KinkyDungeonPlayerEntity.facing_x || 0) * (X - KinkyDungeonPlayerEntity.x)
							+ (KinkyDungeonPlayerEntity.facing_y || 0) * (Y - KinkyDungeonPlayerEntity.y) <= 0
						)
						&& (X != KinkyDungeonPlayerEntity.x || Y != KinkyDungeonPlayerEntity.y)
						//&& ((KinkyDungeonPlayerEntity.facing_x && (X - KinkyDungeonPlayerEntity.x) && Math.sign(KinkyDungeonPlayerEntity.facing_x) != Math.sign(X - KinkyDungeonPlayerEntity.x))
						//|| (KinkyDungeonPlayerEntity.facing_y && (Y - KinkyDungeonPlayerEntity.y) && Math.sign(KinkyDungeonPlayerEntity.facing_y) != Math.sign(Y - KinkyDungeonPlayerEntity.y)))
						) {
							decay += 5;
						}
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
	for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
		for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
			if (KDistChebyshev(X - KDPlayer().x, Y - KDPlayer().y) > rad2) continue;
			vv = KinkyDungeonVisionGet(X, Y);
			bb = KinkyDungeonBrightnessGet(X, Y);
			if (vv > 0 && KDLightCropValue + bb > vv && LightsTemp.get(X + "," + Y)) {
				KinkyDungeonVisionSet(X, Y, KDLightCropValue + bb);
			}
		}
	}

	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
			if (KDistChebyshev(X - KDPlayer().x, Y - KDPlayer().y) > rad2) continue;
			let dd = KDistChebyshev(X - KinkyDungeonPlayerEntity.x, Y - KinkyDungeonPlayerEntity.y);
			if (dd > rad)
				KinkyDungeonVisionSet(X, Y, 0);
			else if (rad < KDGameData.MaxVisionDist && dd > 1.5) {
				KinkyDungeonVisionSet(X, Y, KinkyDungeonVisionGet(X, Y) * Math.min(1, Math.max(0, rad - dd)/3));
			}
		}
	}


	if (KinkyDungeonSeeAll) {
		KDMapExtraData.VisionGrid = [];
		// Generate the grid
		for (let X = 0; X < KDMapData.GridWidth; X++) {
			for (let Y = 0; Y < KDMapData.GridHeight; Y++)
				//KinkyDungeonLightGrid = KinkyDungeonLightGrid + '9'; // 0 = pitch dark
				KDMapExtraData.VisionGrid.push(10); // 0 = pitch dark
			//KinkyDungeonLightGrid = KinkyDungeonLightGrid + '\n';
		}
	} else {



		// Generate the grid
		let minDist = KDGameData.MinVisionDist;
		let dist = 0;
		let fog = true;//KDAllowFog();
		for (let X = 0; X < KDMapData.GridWidth; X++) {
			for (let Y = 0; Y < KDMapData.GridHeight; Y++)
				if (X >= 0 && X <= width-1 && Y >= 0 && Y <= height-1 && KDistChebyshev(X - KDPlayer().x, Y - KDPlayer().y) < rad2) {
					dist = KDistChebyshev(KinkyDungeonPlayerEntity.x - X, KinkyDungeonPlayerEntity.y - Y);
					if (dist < Math.ceil(minDist)) {
						let distE = KDistEuclidean(KinkyDungeonPlayerEntity.x - X, KinkyDungeonPlayerEntity.y - Y);
						if (fog && dist < Math.ceil(minDist)
							&& distE < minDist
							&& KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, X, Y, true, true, flags.SeeThroughWalls ? flags.SeeThroughWalls + 1 : 1, true)) {
							KDMapData.FogGrid[X + Y*(width)] = Math.max(KDMapData.FogGrid[X + Y*(width)], 3);
						}
						if (distE < (KinkyDungeonDeaf ? 1.5 : 2.3) && KDMapExtraData.VisionGrid[X + Y*(width)] == 0
							&& KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, X, Y, true, true, flags.SeeThroughWalls ? flags.SeeThroughWalls + 1 : 1, true)) {
							KDMapExtraData.VisionGrid[X + Y*(width)] = 1;
						}
					}

					if (fog)
						KDMapData.FogGrid[X + Y*(width)] = Math.max(KDMapData.FogGrid[X + Y*(width)], KDMapExtraData.VisionGrid[X + Y*(width)] ? 2 : 0);
				}
		}
		for (let X = 0; X < KDMapData.GridWidth; X++) {
			for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
				if (X >= 0 && X <= width-1 && Y >= 0 && Y <= height-1) {
					if (KDGameData.RevealedTiles && KDGameData.RevealedTiles[X + ',' + Y] >= 0) {
						KDMapExtraData.VisionGrid[X + Y*(width)] = Math.max(KDMapExtraData.VisionGrid[X + Y*(width)] || 0, 1);
					} else if (KDGameData.RevealedFog && KDGameData.RevealedFog[X + ',' + Y] >= 0) {
						KDMapData.FogGrid[X + Y*(width)] = Math.max(KDMapData.FogGrid[X + Y*(width)] || 0, 1);
					}
				}
			}
		}
	}
}

let KDLightCropValue = 6;

function KDDrawFog(CamX: number, CamY: number, CamX_offset: number, CamY_offset: number, _CamX_offsetVis: number, _CamY_offsetVis: number): void {
	if (KDRedrawFog > 0) {
		KDRedrawMM = 1;
		kdgamefog.clear();
		//kdgamefogmask.clear();

		let v_td = false;
		let v_tu = false;
		let v_tl = false;
		let v_tr = false;
		let v_tdl = false;
		let v_tdr = false;
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

		let allFog = KinkyDungeonFlags.get("TimeSlow") || (KDToggles.GreyscaleBlindness && KinkyDungeonBlindLevel >= 2) || (
			KinkyDungeonStatsChoice.get("NightBlindness") && KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) < KDShadowThreshold && KDGameData.visionAdjust < -0.5
		);//KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "TimeSlow");

		for (let R = -1; R <= KinkyDungeonGridHeightDisplay + 2; R++)  {
			for (let X = -1; X <= KinkyDungeonGridWidthDisplay + 2; X++)  {

				RY = R+CamY;
				RX = X+CamX;
				allowFog = KDAllowFog();
				if (RY >= -1 && RY < KDMapData.GridHeight && RX >= -1 && RX < KDMapData.GridWidth) {
					visible = (KinkyDungeonVisionGet(RX, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY) > 0));

					if (visible) {

						fog = Math.min(0.5, KinkyDungeonFogGet(RX, RY)/10);
						lightDiv = (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(RX, RY))) ? KDLightCropValue : KDLightCropValue * 0.7;
						light = Math.max(KDMapExtraData.VisionGrid[RX + RY*KDMapData.GridWidth]/lightDiv, fog);
						//let lightColor = KDMapExtraData.ColorGrid[RX + RY*KDMapData.GridWidth];
						shadowColor = KDMapExtraData.ShadowGrid[RX + RY*KDMapData.GridWidth];
						if (KDMapExtraData.VisionGrid[RX + RY*KDMapData.GridWidth] > 0 && KDistChebyshev(KinkyDungeonPlayerEntity.x - RX, KinkyDungeonPlayerEntity.y - RY) < 2) {
							light = light + (1 - light)*0.5;
						}
						l = Math.max(0, Math.min(1, (1-light)));

						if (KDToggles.FancyShadows) {
							pad = KinkyDungeonGridSizeDisplay * 0.5;
							KDDraw(kdgamefogsmooth, kdpixifogsprites, `${RX},${RY},_@@`,
								KinkyDungeonRootDirectory + "Vision.png",
								(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad, (-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
								KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2,
								undefined, {
									tint: (!allFog && light > 0) ? shadowColor : 0x000000,
									alpha: (KDMapExtraData.VisionGrid[RX + RY*KDMapData.GridWidth] > 0) ? (0.5*l*l) : l,
									//blendMode: PIXI.BLEND_MODES.DARKEN,
								},
							);
						} else {
							kdgamefog.beginFill(light > 0 ? shadowColor : 0x000000, (KDMapExtraData.VisionGrid[RX + RY*KDMapData.GridWidth] > 0) ? (0.5*l*l) : l);
							pad = light > 0 ? 0 : 1;
							kdgamefog.drawRect((-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad, (-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad, KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2);
							kdgamefog.endFill();
						}
					} else if (KDToggles.FancyShadows &&
						((KinkyDungeonVisionGet(RX-1, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX-1, RY) > 0))
						|| (KinkyDungeonVisionGet(RX+1, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX+1, RY) > 0))
						|| (KinkyDungeonVisionGet(RX, RY-1) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY-1) > 0))
						|| (KinkyDungeonVisionGet(RX, RY+1) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY+1) > 0)))) {
						pad = KinkyDungeonGridSizeDisplay;
						KDDraw(kdgamefogsmoothDark, kdpixifogsprites, `${RX},${RY},_@@0`,
							KinkyDungeonRootDirectory + "VisionNeg.png",
							(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad, (-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
							KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2,
							undefined,{
								blendMode: PIXI.BLEND_MODES.MULTIPLY,
							}
						);
					}
					if (visible) {
						/*kdgamefogmask.beginFill(0xffffff);
						pad = 1;
						kdgamefogmask.drawRect((-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad, (-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad, KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2);
						kdgamefogmask.endFill();*/

						if (KDToggles.FancyWalls && (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(RX, RY)) || RX == 0 || RY == 0)) {
							if (KDWallVert(RX, RY) || KDMapData.GridHeight == RY + 1) {
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
										KinkyDungeonGridSizeDisplay + pad);
									kdgamefog.endFill();
								}
								if (!v_tr) {
									kdgamefog.beginFill(0x000000, 1.0);
									kdgamefog.drawRect(
										(-CamX_offset + X + 0.5)*KinkyDungeonGridSizeDisplay - pad,
										(-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
										KinkyDungeonGridSizeDisplay/2 + pad*2,
										KinkyDungeonGridSizeDisplay + pad);
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

		if (!KDToggles.LightmapFilter && kdmapboard.filters.length > 1) {
			kdmapboard.filters = [
				kdgammafilter,
			];
		} else if (KDToggles.LightmapFilter && kdmapboard.filters.length < 2) {
			kdmapboard.filters = [
				...KDBoardFilters,
				kdgammafilter,
			];
		}

		// Slight correction...
		let xMult = 1;//(Math.floor(KinkyDungeonGridWidthDisplay)/KinkyDungeonGridWidthDisplay);
		let yMult = 1;//(Math.floor(KinkyDungeonGridHeightDisplay)/KinkyDungeonGridHeightDisplay);

		if (StandalonePatched && KDToggles.LightmapFilter) {
			pad = 0;
			kdlightmapGFX.clear();
			// fog map
			//allFog = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "TimeSlow");
			if (allFog) {
				kdlightmapGFX.beginFill(0xffffff, 1.);
				kdlightmapGFX.drawRect(
					0,0,
					KinkyDungeonGridWidthDisplay*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridHeightDisplay*KinkyDungeonGridSizeDisplay,);
				kdlightmapGFX.endFill();
			} else
				for (let R = 0; R <= KinkyDungeonGridHeightDisplay; R++)  {
					for (let X = 0; X <= KinkyDungeonGridWidthDisplay; X++)  {
						RY = R+CamY;
						RX = X+CamX;

						if (KDMapExtraData.VisionGrid[RX + RY*KDMapData.GridWidth] == 0) {
							kdlightmapGFX.beginFill(0xffffff, 1.);
							kdlightmapGFX.drawRect(
								xMult*(X - CamX_offset)*KinkyDungeonGridSizeDisplay - pad,
								yMult*(R - CamY_offset)*KinkyDungeonGridSizeDisplay - pad,
								xMult*KinkyDungeonGridSizeDisplay + pad*2,
								yMult*KinkyDungeonGridSizeDisplay + pad*2);
							kdlightmapGFX.endFill();
						}

						/*kdlightmapGFX.beginFill(0xffffff, 0.5);
					kdlightmapGFX.drawRect(
						xMult*(X - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						yMult*(R - CamY_offsetVis)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay/2,
						KinkyDungeonGridSizeDisplay/2);
					kdlightmapGFX.endFill();*/

					}
				}

			PIXIapp.renderer.render(kdlightmapGFX, {
				renderTexture: kdlightmap,
				blit: true,
			});


			for (let R = 0; R <= KinkyDungeonGridHeightDisplay; R++)  {
				for (let X = 0; X <= KinkyDungeonGridWidthDisplay; X++)  {
					RY = R+CamY;
					RX = X+CamX;

					let lightColor = allFog ? KDGetLightColorGreyscale(RX, RY) : KDGetLightColor(RX, RY);

					if (KDMapExtraData.VisionGrid[RX + RY*KDMapData.GridWidth] || KDMapData.FogGrid[RX + RY*KDMapData.GridWidth]) {
						/*kdbrightnessmapGFX.beginFill(lightColor, 1.);
						kdbrightnessmapGFX.drawRect(
							xMult*(X - CamX_offsetVis)*KinkyDungeonGridSizeDisplay - pad,
							yMult*(R - CamY_offsetVis)*KinkyDungeonGridSizeDisplay - pad,
							xMult*KinkyDungeonGridSizeDisplay + pad*2,
							yMult*KinkyDungeonGridSizeDisplay + pad*2);
						kdbrightnessmapGFX.endFill();*/
						pad = 126/72 * KinkyDungeonGridSizeDisplay;
						KDDraw(kdbrightnessmapGFX, kdpixibrisprites, `${RX},${RY},_LI`,
							KinkyDungeonRootDirectory + "Lighting.png",
							(-CamX_offset + X)*KinkyDungeonGridSizeDisplay - pad, (-CamY_offset + R)*KinkyDungeonGridSizeDisplay - pad,
							KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2,
							undefined, {
								tint: lightColor,
							},
						);
					}
				}
			}

			PIXIapp.renderer.render(kdbrightnessmapGFX, {
				renderTexture: kdbrightnessmap,
				blit: true,
			});

		}
		KDCullSpritesList(kdpixifogsprites);
		KDCullSpritesList(kdpixibrisprites);
	}



	let scale = KDMinimapScale;
	let w = KDMinimapW;
	let h = KDMinimapH;
	let alpha = KDMinimapAlpha;
	let borders = false;
	let zoom = 1;
	let blackMap = false;
	if (!(KinkyDungeonShowInventory) && (KDExpandMinimap)) {
		scale = KDMinimapExpandedZoom;
		w = KDMinimapExpandedSize;
		h = Math.floor(KDMinimapHBig/KDMinimapWBig*KDMinimapExpandedSize);
		alpha = 1.;
		zoom = (KDMinimapBaseSize/KDMinimapExpandedSize);
		borders = true;
	} else if (!KDExpandMinimap) {
		//zoom = (KDMinimapBaseSize/KDMinimapExpandedSize);
		blackMap = true;
	}
	KDMinimapWTarget = w*scale*zoom;
	KDMinimapHTarget = h*scale*zoom;

	if (KDMinimapWCurrent != KDMinimapWTarget || KDMinimapHCurrent != KDMinimapHTarget) {
		KDRedrawMM = 2;
	}

	if (KDRedrawMM > 0) {
		KDRenderMinimap(KinkyDungeonPlayerEntity.x - w/2, KinkyDungeonPlayerEntity.y-h/2, w, h, scale, alpha, borders, blackMap);
		if (KDRedrawMM > 0) KDRedrawMM -= 1;
	}

	kdminimap.scale.x = KDMinimapWCurrent/KDMinimapWTarget*zoom;
	kdminimap.scale.y = KDMinimapHCurrent/KDMinimapHTarget*zoom;

	if (KDRedrawFog > 0) KDRedrawFog -= 1;
}

function KDMinimapWidth() {
	return KDMinimapWCurrent;
}
function KDMinimapHeight() {
	return KDMinimapHCurrent;
}

function KDUpdateMinimapTarget(force = false) {
	KDMinimapWTarget = KDMinimapExpandedZoom*KDMinimapExpandedSize * (KDMinimapBaseSize/KDMinimapExpandedSize);
	KDMinimapHTarget = KDMinimapExpandedZoom*Math.floor(KDMinimapHBig/KDMinimapWBig*KDMinimapExpandedSize) * (KDMinimapBaseSize/KDMinimapExpandedSize);
	if (force) {
		KDMinimapWCurrent = KDMinimapWTarget;
		KDMinimapHCurrent = KDMinimapHTarget;
	}
}

let KDExpandMinimap = false;
let KDMinimapScale = 8;
let KDMinimapScaleBig = 12;
let KDMinimapW = 30;
let KDMinimapH = 30;
let KDMinimapBaseSize= 60;
let KDMinimapExpandedSize = KDMinimapBaseSize;
let KDMinimapExpandedSizeTick = 20;
let KDMinimapWBig = 110;
let KDMinimapHBig = 110;
let KDMinimapAlpha = 0.7;

let KDMinimapExpandedZoom = KDMinimapScaleBig;
let KDMinimapExpandedZoomTick = 3;

let KDMinimapWCurrent = KDMinimapW*KDMinimapScale;
let KDMinimapHCurrent = KDMinimapH*KDMinimapScale;
let KDMinimapWTarget = KDMinimapWCurrent;
let KDMinimapHTarget = KDMinimapHCurrent;


/**
 * @param x
 * @param y
 * @param w
 * @param h
 * @param scale
 * @param alpha
 * @param gridborders
 * @param blackMap
 */
function KDRenderMinimap(x: number, y: number, w: number, h: number, scale: number, alpha: number, gridborders: boolean, blackMap: boolean): void {
	kdminimap.clear();
	kdminimap.lineStyle(1, 0xaaaaaa);
	kdminimap.beginFill(0x000000, alpha);
	kdminimap.drawRect(
		0,
		0,
		(w)*scale,
		(h)*scale);
	kdminimap.endFill();
	if (KDToggles.EnableMinimap || !blackMap) {
		let allowFog = KDAllowFog();
		for (let xx = 0; xx < w; xx++)  {
			for (let yy = 0; yy < h; yy++)  {

				if (KDIsInBounds(x+xx, y+yy, 1) && (KDMapExtraData.VisionGrid[(x+xx) + (y+yy)*KDMapData.GridWidth] > 0 || (allowFog && KDMapData.FogGrid[(x+xx) + (y+yy)*KDMapData.GridWidth] > 0))) {
					if (KDMinimapIcons[KinkyDungeonMapGet(x+xx, y+yy)]) {
						KDDraw(kdminimap, kdminimapsprites, `minimapIcon${KinkyDungeonMapGet(x+xx, y+yy)},${x+xx},${y+yy}`,
							KinkyDungeonRootDirectory + KDMinimapIcons[KinkyDungeonMapGet(x+xx, y+yy)](x+xx, y+yy),
							xx*scale, yy*scale, scale, scale, undefined, {
								zIndex: 10,
							},
						);
					} else {
						if (gridborders)
							kdminimap.lineStyle(1, KDMapExtraData.VisionGrid[(x+xx) + (y+yy)*KDMapData.GridWidth] > 0 ? 0xaaaaaa : 0, 0.5);
						else
							kdminimap.lineStyle(0, 0);
						kdminimap.beginFill(string2hex(KDGetTileColor(x + xx, y + yy)), KDMapExtraData.VisionGrid[(x+xx) + (y+yy)*KDMapData.GridWidth] > 0 ? 1. : 0.5);
						kdminimap.drawRect(
							xx*scale,
							yy*scale,
							scale,
							scale);
						kdminimap.endFill();
					}




				}
			}
		}
		KinkyDungeonSendEvent("drawminimap", {update: KDDrawUpdate, x:x, y:y, w:w, h:h, scale:scale});
		// Player circle
		kdminimap.lineStyle(4, 0);
		kdminimap.beginFill(0xffffff, 1.);
		kdminimap.drawCircle(
			w/2*scale+scale/2,
			h/2*scale+scale/2,
			scale);
		kdminimap.endFill();
		if (KinkyDungeonInspect) {
			// Camera square
			let xpre = w/2*scale - scale*KinkyDungeonGridWidthDisplay/2 + scale*(KDInspectCamera.x - KinkyDungeonPlayerEntity.x);
			let ypre = h/2*scale - scale*KinkyDungeonGridHeightDisplay/2 + scale*(KDInspectCamera.y - KinkyDungeonPlayerEntity.y);
			let xx = Math.max(0, xpre);
			let yy = Math.max(0, ypre);
			kdminimap.lineStyle(2, 0xffffff);
			kdminimap.drawRect(
				xx,
				yy,
				Math.min(scale*w-xx, scale * KinkyDungeonGridWidthDisplay + Math.min(0, xpre)),
				Math.min(scale*h-yy, scale * KinkyDungeonGridHeightDisplay + Math.min(0, ypre)));
			kdminimap.endFill();
		}
	}
	KDCullSpritesList(kdminimapsprites);

}




/**
 * Allows fog of war to be rendered
 */
function KDAllowFog() {
	return !(KinkyDungeonStatsChoice.get("Forgetful") || (KinkyDungeonBlindLevel > 0 && KinkyDungeonStatsChoice.get("TotalBlackout")));
}

/**
 * @param x
 * @param y
 * @param amount
 */
function KDRevealTile(x: number, y: number, amount: number) {
	KinkyDungeonUpdateLightGrid = true;
	if (!KDGameData.RevealedTiles) KDGameData.RevealedTiles = {};
	if (!KDGameData.RevealedFog) KDGameData.RevealedFog = {};
	KDGameData.RevealedTiles[x + ',' + y] = Math.max(amount, KDGameData.RevealedTiles[x + ',' + y] || 0);
}
