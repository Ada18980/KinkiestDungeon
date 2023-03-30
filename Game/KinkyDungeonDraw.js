"use strict";

let KDRecentRepIndex = 0;

let ShowBoringness = false;

let KDWallReplacers = "14,dDzZbgS";

let KinkyDungeonSuppressSprint = true;

let KDReturnButtonXX = 1450;

let KDIntenseFilter = null;

// PIXI experimental
let pixiview = document.getElementById("MainCanvas");
// @ts-ignore
let pixirenderer = null;
// @ts-ignore
let pixirendererKD = null;
// @ts-ignore
let kdgamefog = new PIXI.Graphics();
kdgamefog.zIndex = -49;
// @ts-ignore
let kdgameboard = new PIXI.Container();
kdgameboard.sortableChildren = true;
kdgameboard.zIndex = -50;
// @ts-ignore
let kdui = new PIXI.Graphics();
// @ts-ignore
let kdcanvas = new PIXI.Container();
kdcanvas.sortableChildren = true;
kdcanvas.addChild(kdgamefog);
kdcanvas.addChild(kdgameboard);


// @ts-ignore
let kdparticles = new PIXI.Container();
kdparticles.zIndex = 10;
kdparticles.sortableChildren = true;
kdcanvas.addChild(kdparticles);
//kdgameboard.addChild(kdparticles);

let KDTextWhite = "#ffffff";
let KDTextGray3 = "#aaaaaa";
let KDTextTan = "#d6cbc5";
let KDTextGray2 = "#333333";
let KDTextGray1 = "#111111";
let KDTextGray0 = "#000000";
let KDCurseColor = "#ff55aa";
let KDGoodColor = "#77ff99";

/**
 * @type {Map<string, boolean>}
 */
let kdSpritesDrawn = new Map();

/**
 * @type {Map<string, any>}
 */
let kdpixisprites = new Map();

/**
 * @type {Map<string, any>}
 */
let kdprimitiveparams = new Map();

/**
  * @type {Map<string, any>}
  */
let kdpixitex = new Map();

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} [noReplace]
 * @returns {boolean}
 */
function KDWallVert(x, y, noReplace) {
	//let tileUp = KinkyDungeonMapGet(x, y);
	let tileBelow = KinkyDungeonMapGet(x, y + 1);
	if (
		// These are the tiles that trigger a replacement
		(KDWallReplacers.includes(tileBelow)
		&& (!noReplace || !noReplace.includes(tileBelow)))
	)
		return true;

	if (!KinkyDungeonVisionGet(x, y + 1) && !(KinkyDungeonFogGet(x, y + 1) > 0)) return true;

	return false;
}
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} [noReplace]
 * @returns {boolean}
 */
function KDWallVertAbove(x, y, noReplace) {
	//let tileUp = KinkyDungeonMapGet(x, y);
	let tileAbove = KinkyDungeonMapGet(x, y - 1);
	if (
		// These are the tiles that trigger a replacement
		KDWallReplacers.includes(tileAbove)
		&& (!noReplace || !noReplace.includes(tileAbove))
	)
		return true;

	return false;
}
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} [noReplace]
 * @returns {boolean}
 */
function KDWallVertBoth(x, y, noReplace) {
	//let tileUp = KinkyDungeonMapGet(x, y);
	let tileBelow = KinkyDungeonMapGet(x, y + 1);
	let tileAbove = KinkyDungeonMapGet(x, y - 1);
	if (
		// These are the tiles that trigger a replacement
		KDWallReplacers.includes(tileBelow)
		&& (!noReplace || !noReplace.includes(tileBelow))
		&& KDWallReplacers.includes(tileAbove)
		&& (!noReplace || !noReplace.includes(tileAbove))
	)
		return true;

	return false;
}
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function KDWallHorizTunnel(x, y) {
	//let tileUp = KinkyDungeonMapGet(x, y);
	let tileUp = KinkyDungeonMapGet(x, y - 1);
	let tileBelow = KinkyDungeonMapGet(x, y + 1);
	if (
		// These are the tiles that trigger a replacement
		KinkyDungeonWallTiles.includes(tileUp)
		&& KinkyDungeonWallTiles.includes(tileBelow)
	)
		return true;

	return false;
}
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function KDWallVertTunnel(x, y) {
	//let tileUp = KinkyDungeonMapGet(x, y);
	let tileRight = KinkyDungeonMapGet(x + 1, y);
	let tileLeft = KinkyDungeonMapGet(x - 1, y);
	if (
		// These are the tiles that trigger a replacement
		KinkyDungeonWallTiles.includes(tileRight)
		&& KinkyDungeonWallTiles.includes(tileLeft)
	)
		return true;

	return false;
}

let KDChainablePillar = 'bdD';


let KDSprites = {
	// @ts-ignore
	"5": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Sprite) return tile.Sprite;
		return "Floor";
	},
	// @ts-ignore
	"1": (x, y, Fog, noReplace) => {
		if (KDWallVert(x, y, noReplace))
			return "WallVert";
		return "Wall";
	},
	// @ts-ignore
	"2": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	// @ts-ignore
	"3": (x, y, Fog, noReplace) => {
		return Fog ? "Doodad" : "MimicBlock";
	},
	// @ts-ignore
	"b": (x, y, Fog, noReplace) => {
		if (KDWallVertAbove(x, y, noReplace))
			return KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "BarsVertCont" : "BarsVert";
		return "Bars";
	},
	// @ts-ignore
	"X": (x, y, Fog, noReplace) => {
		return "Doodad";
	},
	// @ts-ignore
	"4": (x, y, Fog, noReplace) => {
		if (KDWallVert(x, y, noReplace))
			return "WallVert";
		return "Wall";
	},
	// @ts-ignore
	"L": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y)) {
			let furn = KinkyDungeonTilesGet(x + "," + y).Furniture ? KDFurniture[KinkyDungeonTilesGet(x + "," + y).Furniture] : "";
			if (furn) {
				return furn.floor;
			}
		}
		return "Barrel";
	},
	// @ts-ignore
	"F": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"?": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"/": (x, y, Fog, noReplace) => {
		return "RubbleLooted";
	},
	// @ts-ignore
	",": (x, y, Fog, noReplace) => {
		if (KDWallVert(x, y, noReplace))
			return "WallVert";
		return "Wall";
	},
	// @ts-ignore
	"D": (x, y, Fog, noReplace) => {
		if (Fog) {
			if (KinkyDungeonTilesMemory[x + "," + y]) return KinkyDungeonTilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KinkyDungeonTilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertCont" : "DoorVert";
		else KinkyDungeonTilesMemory[x + "," + y] = "Door";
		return KinkyDungeonTilesMemory[x + "," + y];
	},
	// @ts-ignore
	"d": (x, y, Fog, noReplace) => {
		if (Fog) {
			if (KinkyDungeonTilesMemory[x + "," + y]) return KinkyDungeonTilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KinkyDungeonTilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertOpenCont" : "DoorVertOpen";
		else KinkyDungeonTilesMemory[x + "," + y] = "DoorOpen";
		return KinkyDungeonTilesMemory[x + "," + y];
	},
	// @ts-ignore
	"Z": (x, y, Fog, noReplace) => {
		if (Fog) {
			if (KinkyDungeonTilesMemory[x + "," + y]) return KinkyDungeonTilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KinkyDungeonTilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertCont" : "DoorVert";
		else KinkyDungeonTilesMemory[x + "," + y] = "Door";
		return KinkyDungeonTilesMemory[x + "," + y];
	},
	// @ts-ignore
	"z": (x, y, Fog, noReplace) => {
		if (Fog) {
			if (KinkyDungeonTilesMemory[x + "," + y]) return KinkyDungeonTilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KinkyDungeonTilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertOpenCont" : "DoorVertOpen";
		else KinkyDungeonTilesMemory[x + "," + y] = "DoorOpen";
		return KinkyDungeonTilesMemory[x + "," + y];
	},
	// @ts-ignore
	"a": (x, y, Fog, noReplace) => {
		return "ShrineBroken";
	},
	// @ts-ignore
	"A": (x, y, Fog, noReplace) => {
		return (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Type == "Shrine" && KinkyDungeonTilesGet(x + "," + y).Name == "Commerce") ? "ShrineC" : (
			(KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).drunk) ? "ShrineEmpty" : "Shrine"
		);
	},
	// @ts-ignore
	"H": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"s": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"S": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"g": (x, y, Fog, noReplace) => {
		if (KDWallHorizTunnel(x, y))
			return "GrateHoriz";
		else if (!KDWallVert(x, y)) {
			return "Grate";
		} else if (KDWallVertTunnel(x, y)) {
			return "GrateVert";
		}
		return "Grate";
	},
	// @ts-ignore
	"r": (x, y, Fog, noReplace) => {
		return "RubbleLooted";
	},
	// @ts-ignore
	"T": (x, y, Fog, noReplace) => {
		return (KinkyDungeonBlindLevel > 0) ?"Floor" : "Trap";
	},
	// @ts-ignore
	"Y": (x, y, Fog, noReplace) => {
		return "Doodad";
	},
	// @ts-ignore
	"R": (x, y, Fog, noReplace) => {
		return "RubbleLooted";
	},
	// @ts-ignore
	"m": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	// @ts-ignore
	"M": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	// @ts-ignore
	"O": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	// @ts-ignore
	"P": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	// @ts-ignore
	"p": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	// @ts-ignore
	"o": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	// @ts-ignore
	"w": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"]": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"[": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"=": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	// @ts-ignore
	"+": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	// @ts-ignore
	"-": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	// @ts-ignore
	"l": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"V": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"t": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"u": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	// @ts-ignore
	"N": (x, y, Fog, noReplace) => {
		return "Floor";
	},
};

let KDOverlays = {
	// @ts-ignore
	"5": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Overlay) return tile.Overlay;
		return "";
	},
	// @ts-ignore
	"Z": (x, y, Fog, noReplace) => {
		return "Signal/AutoLock";
	},
	// @ts-ignore
	"H": (x, y, Fog, noReplace) => {
		return "StairsDown";
	},
	// @ts-ignore
	"s": (x, y, Fog, noReplace) => {
		return "StairsDown";
	},
	// @ts-ignore
	"S": (x, y, Fog, noReplace) => {
		return "StairsUp";
	},
	// @ts-ignore
	"-": (x, y, Fog, noReplace) => {
		return "ChargerSpent";
	},
	// @ts-ignore
	"l": (x, y, Fog, noReplace) => {
		return "Leyline";
	},
	// @ts-ignore
	"+": (x, y, Fog, noReplace) => {
		return "Charger";
	},
	// @ts-ignore
	"=": (x, y, Fog, noReplace) => {
		return "ChargerCrystal";
	},
	// @ts-ignore
	"Y": (x, y, Fog, noReplace) => {
		return "Rubble";
	},
	// @ts-ignore
	"/": (x, y, Fog, noReplace) => {
		return "Scrap";
	},
	// @ts-ignore
	"R": (x, y, Fog, noReplace) => {
		return "Rubble";
	},
	// @ts-ignore
	"$": (x, y, Fog, noReplace) => {
		return "Angel";
	},
	// @ts-ignore
	"m": (x, y, Fog, noReplace) => {
		return "TabletSpent";
	},
	// @ts-ignore
	"M": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y) && !Object.keys(KinkyDungeonGoddessRep).includes(KinkyDungeonTilesGet(x + "," + y).Name)) return "Tablet" + KinkyDungeonTilesGet(x + "," + y).Name;
		return "Tablet";
	},
	// @ts-ignore
	"[": (x, y, Fog, noReplace) => {
		return "Spores";
	},
	// @ts-ignore
	"]": (x, y, Fog, noReplace) => {
		return "HappyGas";
	},
	// @ts-ignore
	"w": (x, y, Fog, noReplace) => {
		return Fog ? "" : "Water";
	},
	// @ts-ignore
	"O": (x, y, Fog, noReplace) => {
		return "Orb";
	},
	// @ts-ignore
	"P": (x, y, Fog, noReplace) => {
		return "Perk";
	},
	// @ts-ignore
	",": (x, y, Fog, noReplace) => {
		return "HookLow";
	},
	// @ts-ignore
	"?": (x, y, Fog, noReplace) => {
		return "HookHigh";
	},
	// @ts-ignore
	"B": (x, y, Fog, noReplace) => {
		return "Bed";
	},
	// @ts-ignore
	"@": (x, y, Fog, noReplace) => {
		return "Signal/Button";
	},
	// @ts-ignore
	"V": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile) {
			let tU = KinkyDungeonTilesGet(x + "," + (y - 1));
			let tD = KinkyDungeonTilesGet(x + "," + (y + 1));
			let tR = KinkyDungeonTilesGet((x + 1) + "," + y);
			let tL = KinkyDungeonTilesGet((x - 1) + "," + y);

			let sprite = "";

			if (tile.DY == -1) {
				if (tD?.DY == -1) return "Conveyor/Up";
				if (tL?.DX == 1 && tR?.DX == -1) sprite = sprite + "LeftRight";
				else if (tL?.DX == 1) sprite = sprite + "Right";
				else if (tR?.DX == -1) sprite = sprite + "Left";
				sprite = sprite + "Up";
			} else if (tile.DY == 1) {
				if (tU?.DY == 1) return "Conveyor/Down";
				if (tL?.DX == 1 && tR?.DX == -1) sprite = sprite + "LeftRight";
				else if (tL?.DX == 1 && !(tR?.DX == -1)) sprite = sprite + "Right";
				else if (tR?.DX == -1 && !(tL?.DX == 1)) sprite = sprite + "Left";
				sprite = sprite + "Down";
			} else if (tile.DX == 1) {
				if (tU?.DY == 1 && tD?.DY == -1) sprite = sprite + "UpDown";
				else if (tU?.DY == 1) sprite = sprite + "Down";
				else if (tD?.DY == -1) sprite = sprite + "Up";
				sprite = sprite + "Right";
			} else if (tile.DX == -1) {
				if (tU?.DY == 1 && tD?.DY == -1) sprite = sprite + "UpDown";
				else if (tU?.DY == 1) sprite = sprite + "Down";
				else if (tD?.DY == -1) sprite = sprite + "Up";
				sprite = sprite + "Left";
			}


			return "Conveyor/" + sprite;
		}
		return "Conveyor/Conveyor";
	},
	// @ts-ignore
	"t": (x, y, Fog, noReplace) => {
		return "DollTerminal";
	},
	// @ts-ignore
	"u": (x, y, Fog, noReplace) => {
		return "DollSupply";
	},
	// @ts-ignore
	"N": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + ',' + y);
		let tileAbove = KinkyDungeonMapGet(x, y - 1);
		let tileBelow = KinkyDungeonMapGet(x, y + 1);
		if (tileAbove == 'V' && KinkyDungeonTilesGet(x + "," + (y-1))?.DY == 1) {
			return `BondageMachine/${tile.Binding || "Latex"}Vert`;
		} else if (tileBelow == 'V' && KinkyDungeonTilesGet(x + "," + (y+1))?.DY == -1) {
			return `BondageMachine/${tile.Binding || "Latex"}Vert`;
		}


		return `BondageMachine/${tile.Binding || "Latex"}Horiz`;
	},
};

let KDOverlays2 = {
	// @ts-ignore
	"V": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile && tile.SwitchMode != undefined) {
			let sprite = "";

			if (tile.DY == -1) {
				sprite = sprite + "Up";
			} else if (tile.DY == 1) {
				sprite = sprite + "Down";
			} else if (tile.DX == 1) {
				sprite = sprite + "Right";
			} else if (tile.DX == -1) {
				sprite = sprite + "Left";
			}
			if (tile.SwitchMode) sprite = sprite + tile.SwitchMode;
			return "Conveyor/" + sprite;
		}
		return "";
	},
};

function KinkyDungeonGetSprite(code, x, y, Fog, noReplace) {
	let sprite = "Floor";
	if (KDSprites[code]) sprite = KDSprites[code](x, y, Fog, noReplace);
	return sprite;
}

/** For multilayer sprites */
function KinkyDungeonGetSpriteOverlay2(code, x, y, Fog, noReplace) {
	let sprite = "";
	if (KDOverlays2[code]) sprite = KDOverlays2[code](x, y, Fog, noReplace);
	if (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Skin2) {
		sprite = KinkyDungeonTilesGet(x + "," + y).Skin2;
	}
	return sprite;
}

function KinkyDungeonGetSpriteOverlay(code, x, y, Fog, noReplace) {
	let sprite = "";
	if (KDOverlays[code]) sprite = KDOverlays[code](x, y, Fog, noReplace);
	if (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Skin) {
		sprite = KinkyDungeonTilesGet(x + "," + y).Skin;
	}
	else if (code == "G") {
		sprite = "Ghost";
		if (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Msg || KinkyDungeonTilesGet(x + "," + y).Dialogue)) {
			sprite = "GhostImportant";
		}
	}

	else if (code == "L") {
		if (KinkyDungeonTilesGet(x + "," + y)) {
			let furn = KinkyDungeonTilesGet(x + "," + y).Furniture ? KDFurniture[KinkyDungeonTilesGet(x + "," + y).Furniture] : "";
			if (furn) {
				return furn.sprite;
			}
		}
	} else if (code == "F") {
		sprite = "Table";
		if (KinkyDungeonTilesGet(x + "," + y)) {
			let table = "Table";
			if (KinkyDungeonTilesGet(x + "," + y).Food) {
				sprite = table + KinkyDungeonTilesGet(x + "," + y).Food;
			}
		}
	} else if (code == "4") {
		let left = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x - 1, y));
		let right = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x + 1, y));
		let up = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x, y - 1));
		let down = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x, y + 1));
		if (down) {
			sprite = "Crack";
		} else if (up) {
			sprite = "CrackHoriz";
		} else if (left && right) {
			sprite = "CrackVert";
		} else if (left) {
			sprite = "CrackLeft";
		} else if (right) {
			sprite = "CrackRight";
		} else
			sprite = "CrackNone";
	}
	else if (code == "C") sprite = (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "gold" || KinkyDungeonTilesGet(x + "," + y).Loot == "lessergold")) ? "ChestGold" :
		((KinkyDungeonTilesGet(x + "," + y) && (KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot])) ? KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot] :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "blue")) ? "ChestBlue" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "dark")) ? "ChestDark" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "pearl" || KinkyDungeonTilesGet(x + "," + y).Loot == "lesserpearl")) ? "ChestPearl" : "Chest"))));
	else if (code == "c") sprite = (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "gold" || KinkyDungeonTilesGet(x + "," + y).Loot == "lessergold")) ? "ChestGoldOpen" :
	((KinkyDungeonTilesGet(x + "," + y) && (KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot])) ? KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot] + "Open" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "blue")) ? "ChestBlueOpen" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "dark")) ? "ChestDarkOpen" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "pearl" || KinkyDungeonTilesGet(x + "," + y).Loot == "lesserpearl")) ? "ChestPearlOpen" : "ChestOpen"))));
	return sprite;
}

let KDSpecialChests = {
	"silver" : "ChestSilver",
	"shadow" : "ChestShadow",
};

/**
 * @type {Record<string, number>}
 */
let KDLastKeyTime = {
};


// Draw function for the game portion
function KinkyDungeonDrawGame() {



	if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
		if (KinkyDungeonKeybindingCurrentKey)
			KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
		KinkyDungeonKeybindingCurrentKey = '';
	}

	if (KinkyDungeonDrawState == "Game")
		KinkyDungeonListenKeyMove();

	KDProcessInputs();


	if (!KinkyDungeonFlags.get("lastAuto") && KinkyDungeonStatsChoice.get("saveMode")) {
		KinkyDungeonSetFlag("lastAuto", Math.floor(50 + KDRandom() * 50));
		KinkyDungeonSaveGame();
	}

	if (KDRefresh) {
		CharacterRefresh(KinkyDungeonPlayer);
	}
	KDNaked = false;
	KDRefresh = false;

	if (ServerURL == "foobar") {
		DrawTextFitKD(TextGet("KinkyDungeon"), 1865, 50, 200, "#ffffff", KDTextGray2);
	}


	if ((KinkyDungeonGameKey.keyPressed[9]) && !KinkyDungeonDrawStatesModal.includes(KinkyDungeonDrawState)) {
		if (KinkyDungeonDrawState == "Magic") {
			KinkyDungeonDrawState = "MagicSpells";
			KinkyDungeonGameKey.keyPressed[9] = false;
		} else {
			KinkyDungeonDrawState = "Game";
			KinkyDungeonMessageToggle = false;
			KinkyDungeonTargetingSpell = null;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = "";
			KinkyDungeonSpellPress = "";
			KDModalArea = false;
			KDCloseQuickInv();
			KDRepSelectionMode = "";
			KinkyDungeonGameKey.keyPressed[9] = false;
		}
	}

	KinkyDungeonCapStats();

	// @ts-ignore
	if (ChatRoomChatLog.length > 0) {
		// @ts-ignore
		let LastChatObject = ChatRoomChatLog[ChatRoomChatLog.length - 1];
		let LastChat = LastChatObject.Garbled;
		let LastChatTime = LastChatObject.Time;
		let LastChatSender = (LastChatObject.SenderName) ? LastChatObject.SenderName + ": " : ">";
		let LastChatMaxLength = 60;

		if (LastChat)  {
			LastChat = (LastChatSender + LastChat).substr(0, LastChatMaxLength);
			if (LastChat.length == LastChatMaxLength) LastChat = LastChat + "...";
			if (LastChatTime && CommonTime() < LastChatTime + KinkyDungeonLastChatTimeout)
				if (!KinkyDungeonSendTextMessage(0, LastChat, "#ffffff", 1) && LastChat != KinkyDungeonActionMessage)
					if (!KinkyDungeonSendActionMessage(0, LastChat, "#ffffff", 1) && LastChat != KinkyDungeonTextMessage)
						KinkyDungeonSendTextMessage(1, LastChat, "#ffffff", 1);
		}
	}


	KinkyDungeonDrawDelta = Math.min(CommonTime() - KinkyDungeonLastDraw, KinkyDungeonLastDraw - KinkyDungeonLastDraw2);
	KinkyDungeonLastDraw2 = KinkyDungeonLastDraw;
	KinkyDungeonLastDraw = CommonTime();

	if (!(KinkyDungeonDrawState == "MagicSpells")) {
		KDSwapSpell = -1;
	}

	// For the lower buttons
	let bx = 650 + 15;
	let bwidth = 165;
	let bspacing = 5;
	let bindex = 0;

	if (KinkyDungeonDrawState == "Game") {
		let tooltip = "";
		if ((KinkyDungeonIsPlayer() || (KinkyDungeonGameData && CommonTime() < KinkyDungeonNextDataLastTimeReceived + KinkyDungeonNextDataLastTimeReceivedTimeout))) {


			KinkyDungeonUpdateVisualPosition(KinkyDungeonPlayerEntity, KinkyDungeonDrawDelta);

			let CamX = KinkyDungeonPlayerEntity.x - Math.floor(KinkyDungeonGridWidthDisplay/2);//Math.max(0, Math.min(KinkyDungeonGridWidth - KinkyDungeonGridWidthDisplay, KinkyDungeonPlayerEntity.x - Math.floor(KinkyDungeonGridWidthDisplay/2)));
			let CamY = KinkyDungeonPlayerEntity.y - Math.floor(KinkyDungeonGridHeightDisplay/2);// Math.max(0, Math.min(KinkyDungeonGridHeight - KinkyDungeonGridHeightDisplay, KinkyDungeonPlayerEntity.y - Math.floor(KinkyDungeonGridHeightDisplay/2)));
			let CamX_offset = KinkyDungeonPlayerEntity.visual_x - Math.floor(KinkyDungeonGridWidthDisplay/2) - CamX;//Math.max(0, Math.min(KinkyDungeonGridWidth - KinkyDungeonGridWidthDisplay, KinkyDungeonPlayerEntity.visual_x - Math.floor(KinkyDungeonGridWidthDisplay/2))) - CamX;
			let CamY_offset = KinkyDungeonPlayerEntity.visual_y - Math.floor(KinkyDungeonGridHeightDisplay/2) - CamY;//Math.max(0, Math.min(KinkyDungeonGridHeight - KinkyDungeonGridHeightDisplay, KinkyDungeonPlayerEntity.visual_y - Math.floor(KinkyDungeonGridHeightDisplay/2))) - CamY;

			KinkyDungeonCamX = CamX;
			KinkyDungeonCamY = CamY;
			let KinkyDungeonForceRender = "";

			KinkyDungeonSetMoveDirection();

			if (KinkyDungeonCanvas) {
				KinkyDungeonContext.fillStyle = "rgba(0,0,0.0,1.0)";
				KinkyDungeonContext.fillRect(0, 0, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height);
				KinkyDungeonContext.fill();
				let spriteRes = KDDrawMap(CamX, CamY, CamX_offset, CamY_offset);

				// Get lighting grid
				if (KinkyDungeonUpdateLightGrid) {
					KDUpdateFog = true;
					KDUpdateVision();
				}
				// Draw fog of war
				let CamPos = {x: CamX, y: CamY};
				if (CamPos.x != KDLastCamPos.x || CamPos.y != KDLastCamPos.y) KDUpdateFog = true;
				KDLastCamPos = CamPos;

				// Draw fog of war

				KDDrawFog(CamX, CamY, CamX_offset, CamY_offset);

				tooltip = spriteRes.tooltip;
				KinkyDungeonForceRender = spriteRes.KinkyDungeonForceRender;


				KDDrawEffectTiles(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);

				let aura_scale = 0;
				let aura_scale_max = 0;
				for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
					if (b && b.aura && b.duration > 0) {
						aura_scale_max += 1;
					}
				}
				if (aura_scale_max > 0) {
					let buffs = Object.values(KinkyDungeonPlayerBuffs);
					buffs = buffs.sort((a, b) => {return b.duration - a.duration;});
					for (let b of buffs) {
						if (b && b.aura && b.duration > 0) {
							aura_scale += 1/aura_scale_max;
							let s = aura_scale;
							if (b.noAuraColor) {
								KDDraw(kdgameboard, kdpixisprites, b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
									(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
									(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
									KinkyDungeonSpriteSize * (1 + s), KinkyDungeonSpriteSize * (1 + s), undefined, {
										zIndex: 2.1,
									});
							} else {
								KDDraw(kdgameboard, kdpixisprites, b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
									(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
									(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
									KinkyDungeonSpriteSize * (1 + s), KinkyDungeonSpriteSize * (1 + s), undefined, {
										tint: string2hex(b.aura),
										zIndex: 2.1,
									});
							}

						}
					}
				}


				KinkyDungeonDrawItems(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);

				if (!kdpixitex.get("playertex")) {
					kdpixitex.set("playertex", PIXI.Texture.from(KinkyDungeonCanvasPlayer));
				}
				let playertex = kdpixitex.get("playertex");
				if (playertex) {
					KDDraw(kdgameboard, kdpixisprites, "player", "playertex",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: 0.01,
						});
				}
				if ((KinkyDungeonMovePoints < 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel") > 0) && KinkyDungeonSlowLevel < 10) {
					KDDraw(kdgameboard, kdpixisprites, "c_slow", KinkyDungeonRootDirectory + "Conditions/Slow.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonStatBlind > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_stun", KinkyDungeonRootDirectory + "Conditions/Stun.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonStatFreeze > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_freeze", KinkyDungeonRootDirectory + "Conditions/Freeze.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonStatBind > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_bind", KinkyDungeonRootDirectory + "Conditions/Bind.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak") > 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection") > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_sneak", KinkyDungeonRootDirectory + "Conditions/Sneak.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay - 30,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") > 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackAcc") > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_buff", KinkyDungeonRootDirectory + "Conditions/Buff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") < 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackAcc") < 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_dbuff", KinkyDungeonRootDirectory + "Conditions/Debuff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor") > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_arm", KinkyDungeonRootDirectory + "Conditions/ArmorBuff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				} else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor") < 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_armd", KinkyDungeonRootDirectory + "Conditions/ArmorDebuff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Evasion") > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_eva", KinkyDungeonRootDirectory + "Conditions/EvasionBuff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist") > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_shield", KinkyDungeonRootDirectory + "Conditions/ShieldBuff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist") < 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_shield", KinkyDungeonRootDirectory + "Conditions/ShieldDeuff.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageAmp") > 0) {
					KDDraw(kdgameboard, kdpixisprites, "c_amp", KinkyDungeonRootDirectory + "Conditions/DamageAmp.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (!KDCanAttack()) {
					KDDraw(kdgameboard, kdpixisprites, "c_cantAttack", KinkyDungeonRootDirectory + "Conditions/Tired.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay * 0.5,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}

				KinkyDungeonDrawFight(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
				KinkyDungeonDrawEnemiesWarning(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
				KinkyDungeonDrawEnemies(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
				KinkyDungeonDrawEnemiesStatus(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);


				KinkyDungeonSendEvent("draw",{update: KDDrawUpdate, CamX:CamX, CamY:CamY, CamX_offset: CamX_offset, CamY_offset: CamY_offset});
				KDDrawUpdate = 0;
				KinkyDungeonSuppressSprint = false;


				// Draw targeting reticule
				if (!KinkyDungeonMessageToggle && !KDIsAutoAction() && !KinkyDungeonShowInventory
					&& MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height) && KinkyDungeonIsPlayer()
					&& !MouseIn(0, 0, 500, 1000) && !MouseIn(1750, 0, 250, 1000)
					&& (!KDModalArea || !MouseIn(KDModalArea_x, KDModalArea_y, KDModalArea_width, KDModalArea_height))
				) {
					if (KinkyDungeonTargetingSpell) {
						KinkyDungeonSetTargetLocation();

						KDDraw(kdgameboard, kdpixisprites, "ui_spellreticule", KinkyDungeonRootDirectory + "TargetSpell.png",
							(KinkyDungeonTargetX - CamX)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 100,
							});

						let spellRange = KinkyDungeonTargetingSpell.range * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "spellRange"));
						let free = KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY)) || KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) < 0.1;
						KinkyDungeonSpellValid = (KinkyDungeonTargetingSpell.projectileTargeting || spellRange >= Math.sqrt((KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x) *(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x) + (KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) * (KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y))) &&
							(KinkyDungeonTargetingSpell.projectileTargeting || KinkyDungeonTargetingSpell.CastInWalls || free) &&
							(!KinkyDungeonTargetingSpell.WallsOnly || !KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY)));
						if (KinkyDungeonTargetingSpell.noTargetEnemies) {
							let enemy = KinkyDungeonEnemyAt(KinkyDungeonTargetX, KinkyDungeonTargetY);
							let faction = KDGetFaction(enemy);
							if (enemy && (!KinkyDungeonTargetingSpell.exceptionFactions || !KinkyDungeonTargetingSpell.exceptionFactions.includes(faction)))
								KinkyDungeonSpellValid = false;
						}
						if (KinkyDungeonTargetingSpell.noTargetAllies) {
							let enemy = KinkyDungeonEnemyAt(KinkyDungeonTargetX, KinkyDungeonTargetY);
							if (enemy && KDAllied(enemy))
								KinkyDungeonSpellValid = false;
						}
						if (KinkyDungeonTargetingSpell.selfTargetOnly && (KinkyDungeonPlayerEntity.x != KinkyDungeonTargetX || KinkyDungeonPlayerEntity.y != KinkyDungeonTargetY)) KinkyDungeonSpellValid = false;
						if (KinkyDungeonTargetingSpell.requireLOS &&
							!KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY,
								true, true, 1, true)) KinkyDungeonSpellValid = false;
						if (KinkyDungeonTargetingSpell.noTargetPlayer && KinkyDungeonPlayerEntity.x == KinkyDungeonTargetX && KinkyDungeonPlayerEntity.y == KinkyDungeonTargetY) KinkyDungeonSpellValid = false;
						if (KinkyDungeonTargetingSpell.mustTarget && KinkyDungeonNoEnemy(KinkyDungeonTargetX, KinkyDungeonTargetY, true)) KinkyDungeonSpellValid = false;
						if (KinkyDungeonTargetingSpell.minRange && KDistEuclidean(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x, KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) < KinkyDungeonTargetingSpell.minRange) KinkyDungeonSpellValid = false;

						if (KinkyDungeonSpellValid)
							if (KinkyDungeonTargetingSpell.projectileTargeting) {
								let range = KinkyDungeonTargetingSpell.castRange;
								if (!range || spellRange > range) range = spellRange;
								let dist = Math.sqrt((KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x)*(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x)
									+ (KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y)*(KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y));
								for (let R = 0; R <= Math.max(1, range - 1); R+= 0.1) {
									let xx = KinkyDungeonMoveDirection.x + Math.round((KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x) * R / dist);
									let yy = KinkyDungeonMoveDirection.y + Math.round((KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) * R / dist);
									if (KinkyDungeonVisionGet(xx + KinkyDungeonPlayerEntity.x, yy + KinkyDungeonPlayerEntity.y) > 0 && !KinkyDungeonForceRender)
										KDDraw(kdgameboard, kdpixisprites, xx + "," + yy + "_target", KinkyDungeonRootDirectory + "Target.png",
											(xx + KinkyDungeonPlayerEntity.x - CamX)*KinkyDungeonGridSizeDisplay, (yy + KinkyDungeonPlayerEntity.y - CamY)*KinkyDungeonGridSizeDisplay,
											KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
												zIndex: 99,
											});
								}
							}
							else if (!KinkyDungeonForceRender) {
								let rad = KinkyDungeonTargetingSpell.aoe ? KinkyDungeonTargetingSpell.aoe : 0.5;
								for (let xxx = KinkyDungeonTargetX - Math.ceil(rad); xxx <= KinkyDungeonTargetX + Math.ceil(rad); xxx++)
									for (let yyy = KinkyDungeonTargetY - Math.ceil(rad); yyy <= KinkyDungeonTargetY + Math.ceil(rad); yyy++)
										if (
											AOECondition(KinkyDungeonTargetX, KinkyDungeonTargetY, xxx, yyy, rad, KinkyDungeonTargetingSpell.aoetype || "")
										)
											KDDraw(kdgameboard, kdpixisprites, xxx + "," + yyy + "_target", KinkyDungeonRootDirectory + "Target.png",
												(xxx - CamX)*KinkyDungeonGridSizeDisplay, (yyy - CamY)*KinkyDungeonGridSizeDisplay,
												KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
													zIndex: 99,
												});
							}

					} else if (KinkyDungeonFastMove && !(!KinkyDungeonSuppressSprint && KinkyDungeonToggleAutoSprint && KDCanSprint()) && (KinkyDungeonMoveDirection.x != 0 || KinkyDungeonMoveDirection.y != 0)) {
						KinkyDungeonSetTargetLocation();


						let allowFog = KDAllowFog();
						if (KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0 || (allowFog && KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0)) {
							KDDraw(kdgameboard, kdpixisprites, "ui_movereticule", KinkyDungeonRootDirectory + "TargetMove.png",
								(KinkyDungeonTargetX - CamX)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
									zIndex: 100,
								});
							if (KinkyDungeonSlowLevel > 1 && KinkyDungeonSlowLevel < 10) {
								if (!KinkyDungeonEnemyAt(KinkyDungeonTargetX, KinkyDungeonTargetY) || KDCanPassEnemy(KinkyDungeonPlayerEntity, KinkyDungeonEnemyAt(KinkyDungeonTargetX, KinkyDungeonTargetY))) {
									let dist = Math.round(KinkyDungeonSlowLevel);
									let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false);
									if (path?.length > 1) {
										dist *= path.length;
									}
									DrawTextKD("x" + dist, (KinkyDungeonTargetX - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY + 0.5)*KinkyDungeonGridSizeDisplay, "#ffaa44");
								}
							}
						}
					} else if ((KinkyDungeonMoveDirection.x != 0 || KinkyDungeonMoveDirection.y != 0)) {
						let xx = KinkyDungeonMoveDirection.x + KinkyDungeonPlayerEntity.x;
						let yy = KinkyDungeonMoveDirection.y + KinkyDungeonPlayerEntity.y;
						if (KinkyDungeonSlowLevel < 2 && MouseIn(canvasOffsetX + (xx - CamX)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)) {
							KinkyDungeonSuppressSprint = true;
						}
						if (!KinkyDungeonSuppressSprint && KinkyDungeonToggleAutoSprint && (KDCanSprint())) {
							if (KinkyDungeonMoveDirection.x || KinkyDungeonMoveDirection.y) {
								let newX = KinkyDungeonMoveDirection.x * (KinkyDungeonSlowLevel < 2 ? 2 : 1) + KinkyDungeonPlayerEntity.x;
								let newY = KinkyDungeonMoveDirection.y * (KinkyDungeonSlowLevel < 2 ? 2 : 1) + KinkyDungeonPlayerEntity.y;
								let tile = KinkyDungeonMapGet(newX, newY);
								if (KinkyDungeonMovableTilesEnemy.includes(tile) && KinkyDungeonNoEnemy(newX, newY)) {
									KDDraw(kdgameboard, kdpixisprites, "ui_movesprint", KinkyDungeonRootDirectory + "Sprint.png",
										(newX - CamX)*KinkyDungeonGridSizeDisplay, (newY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
											zIndex: 99,
										});
									xx = newX;
									yy = newY;
								}
							}
						}
						KDDraw(kdgameboard, kdpixisprites, "ui_movereticule", KinkyDungeonRootDirectory + "TargetMove.png",
							(xx - CamX)*KinkyDungeonGridSizeDisplay, (yy - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 100,
							});
						if (KinkyDungeonSlowLevel > 1 && KinkyDungeonSlowLevel < 10) {
							if (!KinkyDungeonEnemyAt(xx, yy) || KDCanPassEnemy(KinkyDungeonPlayerEntity, KinkyDungeonEnemyAt(xx, yy))) {
								let dist = Math.round(KinkyDungeonSlowLevel);

								DrawTextKD("x" + dist, (xx - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (yy - CamY + 0.5)*KinkyDungeonGridSizeDisplay, "#ffaa44");
							}
						}
					}
				}


				let cursorX = Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
				let cursorY = Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;
				let tooltips = [];
				if (KinkyDungeonVisionGet(cursorX, cursorY) > 0) {
					let ambushTile = "";
					let enemy = KinkyDungeonEnemyAt(cursorX, cursorY);
					if (enemy && KDCanSeeEnemy(KinkyDungeonEnemyAt(cursorX, cursorY))) {
						if (!enemy.ambushtrigger && KDAIType[KDGetAI(KinkyDungeonEnemyAt(cursorX, cursorY))]?.ambushtile) {
							ambushTile = KDAIType[KDGetAI(enemy)].ambushtile;
						} else {
							tooltips.push((offset) => KDDrawEnemyTooltip(enemy, offset));
						}


					}
					let eTiles = KDGetEffectTiles(cursorX, cursorY);
					for (let etile of Object.values(eTiles)) {
						if (KDEffectTileTooltips[etile.name] && KDCanSeeEffectTile(etile)) {
							tooltips.push((offset) => KDDrawEffectTileTooltip(etile, cursorX, cursorY, offset));
						}
					}
					let tile = ambushTile || KinkyDungeonMapGet(cursorX, cursorY);
					if (KDTileTooltips[tile] && (KinkyDungeonInspect || KDTileTooltips[tile]().noInspect)) {
						tooltips.push((offset) => KDDrawTileTooltip(tile, cursorX, cursorY, offset));
					}
				}

				let tooltipOffset = 0;
				for (let t of tooltips) {
					tooltipOffset = t(tooltipOffset);
				}

				if (KinkyDungeonFastMoveSuppress) {
					DrawRectKD(kdcanvas, kdpixisprites, "redborder", {
						Left: canvasOffsetX,
						Top: canvasOffsetY,
						Width: KinkyDungeonCanvas.width,
						Height: KinkyDungeonCanvas.height,
						Color: "#ff4444",
						LineWidth: 2,
						zIndex: 10,
					});
					/*KinkyDungeonContext.beginPath();
					KinkyDungeonContext.rect(0, 0, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height);
					KinkyDungeonContext.lineWidth = 4;
					KinkyDungeonContext.strokeStyle = "#ff4444";
					KinkyDungeonContext.stroke();*/
				}

				if (KinkyDungeonLastTurnAction == "Struggle" && KinkyDungeonCurrentEscapingItem && KinkyDungeonCurrentEscapingItem.lock) {
					KDDraw(kdgameboard, kdpixisprites, "ui_lock", KinkyDungeonRootDirectory + "Lock.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offset)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset)*KinkyDungeonGridSizeDisplay - 60,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}

				// Cull the sprites that werent rendered or updated this frame
				for (let sprite of kdpixisprites.entries()) {
					if (!kdSpritesDrawn.has(sprite[0]) && sprite[1] && sprite[1].parent == kdgameboard) {
						sprite[1].parent.removeChild(sprite[1]);
						if (kdprimitiveparams.has(sprite[0])) kdprimitiveparams.delete(sprite[0]);
						kdpixisprites.delete(sprite[0]);
						sprite[1].destroy();
					}
				}



				if (!StandalonePatched) {
					// Draw the context layer even if we haven't updated it
					if (pixirendererKD) {
						pixirendererKD.render(kdgameboard, {
							clear: false,
						});
					}

					// Draw the context layer even if we haven't updated it
					if (pixirendererKD) {
						pixirendererKD.render(kdgamefog, {
							clear: false,
						});
					}

					// Draw the context layer even if we haven't updated it
					if (pixirendererKD) {
						pixirendererKD.render(kdparticles, {
							clear: false,
						});
					}
					if (!pixirendererKD) {
						if (!StandalonePatched) {
							if (KinkyDungeonContext && KinkyDungeonCanvas) {
								// @ts-ignore
								pixirendererKD = new PIXI.Renderer({
									// @ts-ignore
									width: KinkyDungeonCanvas.width,
									// @ts-ignore
									height: KinkyDungeonCanvas.height,
									view: KinkyDungeonCanvas,
									antialias: true,
								});
							}
						}

					}
					MainCanvas.drawImage(KinkyDungeonCanvas, canvasOffsetX, canvasOffsetY);
				}

			}

			DrawCharacter(KinkyDungeonPlayer, 0, 0, 1);


			DrawTextFitKD(
				TextGet("CurrentLevel").replace("FLOORNUMBER", "" + MiniGameKinkyDungeonLevel).replace("DUNGEONNAME", TextGet("DungeonName" + KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]))
				+ (KinkyDungeonNewGame ? TextGet("KDNGPlus").replace("XXX", "" + KinkyDungeonNewGame) : ""),
				KDMsgX + KDMsgWidth/2, 42, 1000, "#ffffff", "#333333");
			//DrawTextKD(TextGet("DungeonName" + KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]), 1500, 42, "#ffffff", KDTextGray2);

			// Draw the stats
			KinkyDungeonDrawStats(1750, 164, 230, KinkyDungeonStatBarHeight);

			if (KinkyDungeonSleepiness) {
				CharacterSetFacialExpression(KinkyDungeonPlayer, "Emoticon", "Sleep");
			} else CharacterSetFacialExpression(KinkyDungeonPlayer, "Emoticon", null);

			// Draw the player no matter what
			if (!StandalonePatched) {
				KinkyDungeonContextPlayer.clearRect(0, 0, KinkyDungeonCanvasPlayer.width, KinkyDungeonCanvasPlayer.height);
			}
			let PlayerModel = StandalonePatched ? KDCurrentModels.get(KinkyDungeonPlayer) : null;
			let zoom = PlayerModel ? KinkyDungeonGridSizeDisplay/1200
				: KinkyDungeonGridSizeDisplay/250;
			/** @type {PoseMod[]} */
			let mods = StandalonePatched ? [
				{
					Layer: "Head",
					scale_x: 2.5,
					scale_y: 2.5,
					rotation_x_anchor: 1190/MODELWIDTH,
					rotation_y_anchor: 690/MODELHEIGHT,
					offset_x: 1100/MODELWIDTH,
					offset_y: 620/MODELHEIGHT,
				},
			] : [];
			if (KDDrawPlayer)
				DrawCharacter(KinkyDungeonPlayer,
					canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offset)*KinkyDungeonGridSizeDisplay + (StandalonePatched ? KinkyDungeonGridSizeDisplay/4: -KinkyDungeonGridSizeDisplay/2),
					canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay + (StandalonePatched ? KinkyDungeonGridSizeDisplay/6 : (KinkyDungeonPlayer.Pose.includes("Hogtied") ? -165 : (KinkyDungeonPlayer.IsKneeling() ? -78 : 0))),
					zoom, false, undefined, PIXI.SCALE_MODES.NEAREST, mods);

			KinkyDungeonDrawEnemiesHP(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
			KinkyDungeonDrawFloaters(CamX+CamX_offset, CamY+CamY_offset);

			if (KinkyDungeonCanvas) {
				let barInt = 0;
				if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax*0.9) {
					KinkyDungeonBar(canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - 12 - 13 * barInt,
						KinkyDungeonGridSizeDisplay, 8, 100 * KinkyDungeonStatStamina / KinkyDungeonStatStaminaMax, !KDCanAttack() ? "#ff5555" : "#44ff44", KDTextGray0);
					barInt += 1;
				}
				/*for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
					if (b && b.aura && b.duration > 0 && b.duration < 999) {
						if (!b.maxduration) b.maxduration = b.duration;
						KinkyDungeonBar(canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - 12 - 13 * barInt,
							KinkyDungeonGridSizeDisplay, 12, 100 * b.duration / b.maxduration, b.aura, KDTextGray0);
						barInt += 1;
					}
				}*/
				if (KinkyDungeonCurrentEscapingItem && KinkyDungeonFlags.get("escaping")) {
					let item = KinkyDungeonCurrentEscapingItem;
					let value = 0;
					let value2 = 0;
					let color = "#ecebe7";
					let color2 = "#ff0000";
					if (KinkyDungeonCurrentEscapingMethod == "Struggle") {
						if (item.struggleProgress)
							value = item.struggleProgress;
						if (item.cutProgress)
							value2 = item.cutProgress;
					} else if (KinkyDungeonCurrentEscapingMethod == "Pick" && item.pickProgress) {
						value = item.pickProgress;
						color = "#ceaaed";
					} else if (KinkyDungeonCurrentEscapingMethod == "Remove") {
						if (item.struggleProgress)
							value = item.struggleProgress;
						if (item.cutProgress)
							value2 = item.cutProgress;
					} else if (KinkyDungeonCurrentEscapingMethod == "Cut") {
						if (item.struggleProgress)
							value = item.struggleProgress;
						if (item.cutProgress)
							value2 = item.cutProgress;
					} else if (KinkyDungeonCurrentEscapingMethod == "Unlock" && item.unlockProgress) {
						value = item.unlockProgress;
						color = "#d0ffea";
					}
					let xAdd = 0;
					let yAdd = 0;
					if (KinkyDungeonStruggleTime > CommonTime()) {
						xAdd = Math.round(-1 + 2*Math.random());
						yAdd = Math.round(-1 + 2*Math.random());
					}
					if (value <= 1)
						KinkyDungeonBar(canvasOffsetX + xAdd + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + yAdd + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - 24,
							KinkyDungeonGridSizeDisplay, 12, Math.max(7, Math.min(100, 100 * (value + value2))), color, KDTextGray0);
					if (value2 && value <= 1) {
						KinkyDungeonBar(canvasOffsetX + xAdd + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offset)*KinkyDungeonGridSizeDisplay, canvasOffsetY + yAdd + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - 24,
							KinkyDungeonGridSizeDisplay, 12, Math.max(7, 100 * value2), color2, "none");
					}
				}

				KinkyDungeonDrawTethers(KinkyDungeonPlayerEntity, CamX+CamX_offset, CamY+CamY_offset);

				if (tooltip) {
					DrawTextFitKD(tooltip, MouseX, MouseY - KinkyDungeonGridSizeDisplay/2, 200, "#ffffff", KDTextGray2);
				}
			}

			if (KinkyDungeonPlayerEntity.dialogue) {
				let yboost = 0;//-1*KinkyDungeonGridSizeDisplay/7;
				DrawTextFitKD(KinkyDungeonPlayerEntity.dialogue, canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offset)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, yboost + canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/1.5, 10 + KinkyDungeonPlayerEntity.dialogue.length * 8, KinkyDungeonPlayerEntity.dialogueColor, KDTextGray0);
			}


			KDModalArea_x = 600;
			KDModalArea_y = 700;
			KDModalArea_width = 800;
			KDModalArea_height = 100;

			if (KinkyDungeonIsPlayer()) {
				KinkyDungeonDrawInputs();
			}

			if (KDGameData.CurrentDialog) {
				KDDrawDialogue();
			}

			KinkyDungeonDrawMessages();

			// Draw the quick inventory
			if (KDShowQuickInv()) {
				KinkyDungeonDrawQuickInv();
			}
		} else {
			DrawTextKD(TextGet("KinkyDungeonLoading"), 1100, 500, "#ffffff", KDTextGray2);
			if (CommonTime() > KinkyDungeonGameDataNullTimerTime + KinkyDungeonGameDataNullTimer) {
				ServerSend("ChatRoomChat", { Content: "RequestFullKinkyDungeonData", Type: "Hidden", Target: KinkyDungeonPlayerCharacter.MemberNumber });
				KinkyDungeonGameDataNullTimerTime = CommonTime();
			}
		}
	} else if (KinkyDungeonDrawState == "Orb") {
		KinkyDungeonDrawOrb();
	} else if (KinkyDungeonDrawState == "PerkOrb") {
		KinkyDungeonDrawPerkOrb();
	} else if (KinkyDungeonDrawState == "Heart") {
		KinkyDungeonDrawHeart();
	} else if (KinkyDungeonDrawState == "Magic") {
		// @ts-ignore
		DrawButtonKDEx("goInv", (bdata) => {
			KinkyDungeonDrawState = "Inventory";
			return true;
		}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonInventory"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_inventory.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goRep", (bdata) => {
			KinkyDungeonDrawState = "Reputation";
			return true;
		}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonReputation"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_reputation.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goSpells", (bdata) => {
			KinkyDungeonDrawState = "MagicSpells";
			return true;
		}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonMagic"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_spells.png", undefined, undefined, false, "", 24, true); bindex++;

		let logtxt = KinkyDungeonNewLoreList.length > 0 ? TextGet("KinkyDungeonLogbookN").replace("N", KinkyDungeonNewLoreList.length): TextGet("KinkyDungeonLogbook");
		// @ts-ignore
		DrawButtonKDEx("goLog", (bdata) => {
			KinkyDungeonDrawState = "Logbook";
			KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, logtxt, "#ffffff", KinkyDungeonRootDirectory + "UI/button_logbook.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, bwidth, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");

		KinkyDungeonDrawMagic();

	} else if (KinkyDungeonDrawState == "MagicSpells") {
		// @ts-ignore
		DrawButtonKDEx("goInv", (bdata) => {
			KinkyDungeonDrawState = "Inventory";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonInventory"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_inventory.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goRep", (bdata) => {
			KinkyDungeonDrawState = "Reputation";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonReputation"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_reputation.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, bwidth, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", ""); bindex++;

		let logtxt = KinkyDungeonNewLoreList.length > 0 ? TextGet("KinkyDungeonLogbookN").replace("N", KinkyDungeonNewLoreList.length): TextGet("KinkyDungeonLogbook");
		// @ts-ignore
		DrawButtonKDEx("goLog", (bdata) => {
			KinkyDungeonDrawState = "Logbook";
			KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, logtxt, "#ffffff", KinkyDungeonRootDirectory + "UI/button_logbook.png", undefined, undefined, false, "", 24, true); bindex++;
		KinkyDungeonDrawMagicSpells();
	} else if (KinkyDungeonDrawState == "Inventory") {
		// @ts-ignore
		DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, bwidth, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", ""); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goRep", (bdata) => {
			KinkyDungeonDrawState = "Reputation";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonReputation"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_reputation.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goSpells", (bdata) => {
			KinkyDungeonDrawState = "MagicSpells";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonMagic"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_spells.png", undefined, undefined, false, "", 24, true); bindex++;

		let logtxt = KinkyDungeonNewLoreList.length > 0 ? TextGet("KinkyDungeonLogbookN").replace("N", KinkyDungeonNewLoreList.length): TextGet("KinkyDungeonLogbook");
		// @ts-ignore
		DrawButtonKDEx("goLog", (bdata) => {
			KinkyDungeonDrawState = "Logbook";
			KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, logtxt, "#ffffff", KinkyDungeonRootDirectory + "UI/button_logbook.png", undefined, undefined, false, "", 24, true); bindex++;


		KinkyDungeonDrawInventory();
	} else if (KinkyDungeonDrawState == "Logbook") {
		// @ts-ignore
		DrawButtonKDEx("goInv", (bdata) => {
			KinkyDungeonDrawState = "Inventory";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonInventory"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_inventory.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goRep", (bdata) => {
			KinkyDungeonDrawState = "Reputation";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonReputation"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_reputation.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goSpells", (bdata) => {
			KinkyDungeonDrawState = "MagicSpells";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonMagic"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_spells.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, bwidth, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", ""); bindex++;



		KinkyDungeonDrawLore();
	} else if (KinkyDungeonDrawState == "Reputation") {
		// @ts-ignore
		DrawButtonKDEx("goInv", (bdata) => {
			KinkyDungeonDrawState = "Inventory";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonInventory"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_inventory.png", undefined, undefined, false, "", 24, true); bindex++;
		// @ts-ignore
		DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 165, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", ""); bindex++;
		// @ts-ignore
		DrawButtonKDEx("goSpells", (bdata) => {
			KinkyDungeonDrawState = "MagicSpells";
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonMagic"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_spells.png", undefined, undefined, false, "", 24, true); bindex++;
		let logtxt = KinkyDungeonNewLoreList.length > 0 ? TextGet("KinkyDungeonLogbookN").replace("N", KinkyDungeonNewLoreList.length): TextGet("KinkyDungeonLogbook");
		// @ts-ignore
		DrawButtonKDEx("goLog", (bdata) => {
			KinkyDungeonDrawState = "Logbook";
			KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			return true;
		}, true, bx + bindex *(bwidth + bspacing), 925, bwidth, 60, logtxt, "#ffffff", KinkyDungeonRootDirectory + "UI/button_logbook.png", undefined, undefined, false, "", 24, true); bindex++;

		KinkyDungeonDrawReputation();
	} else if (KinkyDungeonDrawState == "Lore") {
		// @ts-ignore
		DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 250, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");
		KinkyDungeonDrawLore();
	} else if (KinkyDungeonDrawState == "Restart") {
		if (TestMode) {
			DrawCheckboxVis(600, 20, 64, 64, "Debug Mode", KDDebugMode, false, "#ffffff");
			if (KDDebugMode) {
				let dd = 30;
				let i = 0;
				for (let r of KinkyDungeonRestraints) {
					if (i * dd < 1200 && r.name.includes(ElementValue("DebugItem"))) {
						DrawTextFitKD(r.name, 0, 15 + i * dd, 200, "#ffffff", KDTextGray0, undefined, "left");
						i++;
					}
				}
				i = 0;
				for (let r of Object.values(KinkyDungeonConsumables)) {
					if (i * dd < 1200 && r.name.includes(ElementValue("DebugItem"))) {
						DrawTextFitKD(r.name, 200, 15 + i * dd, 200, "lightblue", KDTextGray0, undefined, "left");
						i++;
					}
				}
				i = 0;
				for (let r of KinkyDungeonEnemies) {
					if (i * dd < 1200 && r.name.includes(ElementValue("DebugEnemy"))) {
						DrawTextFitKD(r.name, 400, 15 + i * dd, 200, "#ff0000", KDTextGray0);
						i++;
					}
				}
				i = 0;
				for (let r of Object.values(KinkyDungeonWeapons)) {
					if (i * dd < 1200 && r.name.includes(ElementValue("DebugItem"))) {
						DrawTextFitKD(r.name, 1800, 15 + i * dd, 200, "orange", KDTextGray0);
						i++;
					}
				}
				i = 0;
				for (let r of KinkyDungeonOutfitsBase) {
					if (i * dd < 1200 && r.name.includes(ElementValue("DebugItem"))) {
						DrawTextFitKD(r.name, 900, 15 + i * dd, 200, "lightgreen", KDTextGray0);
						i++;
					}
				}

				DrawCheckboxVis(1100, 20, 64, 64, "Verbose Console", KDDebug, false, "#ffffff");
				DrawCheckboxVis(1100, 100, 64, 64, "Changeable Perks", KDDebugPerks, false, "#ffffff");
				DrawCheckboxVis(1100, 180, 64, 64, "Unlimited Gold", KDDebugGold, false, "#ffffff");
				ElementPosition("DebugEnemy", 1650, 52, 300, 64);
				DrawButtonVis(1500, 100, 100, 64, "Enemy", "#ffffff", "");
				DrawButtonVis(1600, 100, 100, 64, "Ally", "#ffffff", "");
				DrawButtonVis(1700, 100, 100, 64, "Shop", "#ffffff", "");
				ElementPosition("DebugItem", 1650, 212, 300, 64);
				DrawButtonVis(1500, 260, 300, 64, "Add to inventory", "#ffffff", "");
				DrawButtonVis(1100, 260, 300, 64, "Teleport to stairs", "#ffffff", "");
				DrawButtonVis(1500, 320, 300, 64, "Get save code", "#ffffff", "");
				DrawButtonVis(1100, 320, 300, 64, "Enter parole mode", "#ffffff", "");

				DrawButtonKDEx("debugAddKey", (bdata) => {
					KinkyDungeonRedKeys += 1;
					KinkyDungeonBlueKeys += 1;
					KinkyDungeonLockpicks += 1;
					return true;
				}, true, 600, 160, 300, 64, "Add keys and lockpicks", "#ffffff", "");
				DrawButtonKDEx("debugAddVision", (bdata) => {
					KinkyDungeonSeeAll = !KinkyDungeonSeeAll;
					return true;
				}, true, 600, 240, 300, 64, "Toggle OmniVision™", "#ffffff", "");
				DrawButtonKDEx("debugAddSP", (bdata) => {
					KinkyDungeonSpellPoints += 1;
					return true;
				}, true, 600, 320, 300, 64, "Add spell point", "#ffffff", "");
				DrawButtonKDEx("debugClearQuickInv", (bdata) => {
					KinkyDungeonInventory.get('looserestraint').clear();
					KinkyDungeonAdvanceTime(0, true);
					return true;
				}, true, 600, 400, 300, 64, "Clear loose restraints", "#ffffff", "");
				DrawButtonKDEx("debugClearPlayerInv", (bdata) => {
					KinkyDungeonInventory.get('restraint').clear();
					KinkyDungeonAdvanceTime(0, true);
					return true;
				}, true, 600, 480, 300, 64, "Clear worn restraints", "#ffffff", "");
				DrawButtonKDEx("debugIncFloor", (bdata) => {
					MiniGameKinkyDungeonLevel += 1;
					return true;
				}, true, 600, 560, 300, 64, "Increment Floor", "#ffffff", "");


			}
		}


		DrawTextFitKD(TextGet("KinkyDungeonRestartConfirm"), 1250, 400, 1000, "#ffffff", "#333333");
		DrawButtonVis(975, 550, 550, 64, TextGet("KinkyDungeonRestartNo"), "#ffffff", "");
		DrawButtonVis(975, 650, 550, 64, TextGet("KinkyDungeonRestartQuitNoErase"), "#ffffff", "");
		DrawButtonVis(975, 800, 550, 64, TextGet("KinkyDungeonRestartCapture" + (KDConfirmDeleteSave ? "Confirm" : "")),  (KDGameData.PrisonerState == 'jail' || !KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)) ? "Pink" : "#ffffff", "");
		DrawButtonVis(975, 900, 550, 64, TextGet("KinkyDungeonRestartYes" + (KDConfirmDeleteSave ? "Confirm" : "")), "#ffffff", "");
		DrawButtonVis(1650, 900, 300, 64, TextGet("KinkyDungeonCheckPerks"), "#ffffff", "");

		DrawButtonKDEx("GameConfigKeys", () => {
			KinkyDungeonState = "Keybindings";
			if (!KinkyDungeonKeybindings)
				KDSetDefaultKeybindings();
			else {
				KinkyDungeonKeybindingsTemp = {};
				Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			}
			return true;
		}, true, 975, 450, 260, 64, TextGet("GameConfigKeys"), "#ffffff", "");
		DrawButtonKDEx("GameToggles", () => {
			KinkyDungeonState = "Toggles";
			return true;
		}, true, 1265, 450, 260, 64, TextGet("GameToggles"), "#ffffff", "");

	} else if (KinkyDungeonDrawState == "Perks2") {
		KinkyDungeonDrawPerks(!KDDebugPerks);
		DrawButtonVis(1650, 920, 300, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		// @ts-ignore
		DrawButtonKDEx("copyperks", (bdata) => {
			let txt = "";
			for (let k of KinkyDungeonStatsChoice.keys()) {
				if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "\n" : "") + k;
			}
			navigator.clipboard.writeText(txt);
			return true;
		}, true, 1400, 930, 200, 54, TextGet("KinkyDungeonCopyPerks"), "#ffffff", "");
	}

	if (KinkyDungeonDrawState == "Game") {
		if (KinkyDungeonFlags.get("PlayerOrgasmFilter")) {
			/*if (KDToggles.IntenseOrgasm) {
				if (!KDIntenseFilter) {
					KDIntenseFilter = PIXI.Sprite.from(KinkyDungeonRootDirectory + 'displacement_map_repeat.jpg');
					// Make sure the sprite is wrapping.
					KDIntenseFilter.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
					const displacementFilter = new PIXI.filters.DisplacementFilter(KDIntenseFilter);
					displacementFilter.padding = 10;

					kdgameboard.addChild(KDIntenseFilter);

					kdgameboard.filters = [displacementFilter];

					displacementFilter.scale.x = 30;
					displacementFilter.scale.y = 60;
				}
			} else {*/
			FillRectKD(kdcanvas, kdpixisprites, "screenoverlayor", {
				Left: 0,
				Top: 0,
				Width: 2000,
				Height: 1000,
				Color: "#ff5277",
				LineWidth: 1,
				zIndex: 1,
				alpha: 0.1,
			});
			//}
		} else if (KinkyDungeonStatFreeze > 0) {
			FillRectKD(kdcanvas, kdpixisprites, "screenoverlayfr", {
				Left: 0,
				Top: 0,
				Width: 2000,
				Height: 1000,
				Color: "#92e8c0",
				LineWidth: 1,
				zIndex: 1,
				alpha: 0.1,
			});
		} else if (KDToggles.StunFlash && (KinkyDungeonFlags.get("playerStun") || (KinkyDungeonMovePoints < 0 && KinkyDungeonSlowLevel < 9))) {
			FillRectKD(kdcanvas, kdpixisprites, "screenoverlayst", {
				Left: 0,
				Top: 0,
				Width: 2000,
				Height: 1000,
				Color: "#aaaaaa",
				LineWidth: 1,
				zIndex: 1,
				alpha: 0.07,
			});
		} else if (KDToggles.ArousalHearts) {
			KDDrawArousalParticles(KDGameData.OrgasmTurns/KinkyDungeonOrgasmTurnsMax, KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax,
				(KDGameData.OrgasmStage / KinkyDungeonMaxOrgasmStage)
			);
		} else if (KinkyDungeonStatDistraction > 1.0) {
			KDDrawArousalScreenFilter(0, 1000, 2000, KinkyDungeonStatDistraction * 100 / KinkyDungeonStatDistractionMax);
		}

		if (KDToggles.VibeHearts) {
			KDDrawVibeParticles(KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax);
		}

		/*if (!KinkyDungeonFlags.get("PlayerOrgasmFilter") && KDIntenseFilter) {
			kdgameboard.removeChild(KDIntenseFilter);
			kdgameboard.filters = kdgameboard.filters.filter((filter) => {return filter != KDIntenseFilter;});
			KDIntenseFilter = null;
		}*/
	}


	if (ServerURL != "foobar")
		DrawButtonVis(1885, 25, 90, 90, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Exit.png");

	if ((!KDDebugMode && KinkyDungeonDrawState == "Restart") || (KDDebugMode && KinkyDungeonDrawState != "Restart")) {
		ElementRemove("DebugEnemy");
		ElementRemove("DebugItem");
	}
}


/**
 * Draws arousal screen filter
 * @param {number} y1 - Y to draw filter at.
 * @param {number} h - Height of filter
 * @param {number} Width - Width of filter
 * @param {number} ArousalOverride - Override to the existing arousal value
 * @returns {void} - Nothing.
 */
function KDDrawArousalScreenFilter(y1, h, Width, ArousalOverride, Color = '255, 100, 176', AlphaBonus = 0) {
	/*let Progress = (ArousalOverride) ? ArousalOverride : Player.ArousalSettings.Progress;
	let amplitude = 0.24 * Math.min(1, 2 - 1.5 * Progress/100); // Amplitude of the oscillation
	let percent = Progress/100.0;
	let level = Math.min(0.5, percent) + 0.5 * Math.pow(Math.max(0, percent*2 - 1), 4);
	let oscillation = Math.sin(CommonTime() / 1000 % Math.PI);
	let alpha = Math.min(1.0, AlphaBonus + 0.35 * level * (0.99 - amplitude + amplitude * oscillation));

	if (Player.ArousalSettings.VFXFilter == "VFXFilterHeavy") {
		const Grad = MainCanvas.createLinearGradient(0, y1, 0, h);
		let alphamin = 0;//Math.max(0, alpha / 2 - 0.05);
		Grad.addColorStop(0, `rgba(${Color}, ${alpha})`);
		Grad.addColorStop(0.1 + 0.1*percent * (1.0 + 0.3 * oscillation), `rgba(${Color}, ${alphamin})`);
		Grad.addColorStop(0.5, `rgba(${Color}, ${alphamin/2})`);
		Grad.addColorStop(0.9 - 0.1*percent * (1.0 + 0.3 * oscillation), `rgba(${Color}, ${alphamin})`);
		Grad.addColorStop(1, `rgba(${Color}, ${alpha})`);
		MainCanvas.fillStyle = Grad;
		MainCanvas.fillRect(0, y1, Width, h);
	} else {
		if (Player.ArousalSettings.VFXFilter != "VFXFilterMedium") {
			alpha = (Progress >= 91) ? 0.25 : 0;
		} else alpha /= 2;
		if (alpha > 0)
			DrawRect(0, y1, Width, h, `rgba(${Color}, ${alpha})`);
	}*/
}

function KDCanAttack() {
	let attackCost = KinkyDungeonStatStaminaCostAttack;
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.staminacost) attackCost = -KinkyDungeonPlayerDamage.staminacost;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")) {
		attackCost = Math.min(0, attackCost * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")));
	}
	return KinkyDungeonHasStamina(Math.abs(attackCost), true);
}

let KinkyDungeonFloaters = [];
let KinkyDungeonLastFloaterTime = 0;

let KDTimescale = 0.004;
let KDBulletSpeed = 40;

// We use this to offset floaters
let KDEntitiesFloaterRegisty = new Map();
let KDFloaterSpacing = 36 / KinkyDungeonGridSizeDisplay;

function KinkyDungeonSendFloater(Entity, Amount, Color, Time, LocationOverride, suff = "") {
	if (Entity.x && Entity.y) {
		let II = KDEntitiesFloaterRegisty.get(Entity) || 1;
		II += 1;
		KDEntitiesFloaterRegisty.set(Entity, II);
		let floater = {
			x: Entity.x + 0.5,// + Math.random(),
			y: Entity.y - (II - 1) * KDFloaterSpacing,// + Math.random(),
			override: LocationOverride,
			speed: 30,// + (Time ? Time : 0) + Math.random()*10,
			t: 0,
			color: Color,
			text: "" + ((typeof Amount === "string") ? Amount : Math.round(Amount * 10)/10) + suff,
			lifetime: Time ? Time : ((typeof Amount === "string") ? 4 : ((Amount < 3) ? 2 : (Amount > 5 ? 3 : 2))),
		};
		KinkyDungeonFloaters.push(floater);
	}
}


function KinkyDungeonDrawFloaters(CamX, CamY) {
	let delta = CommonTime() - KinkyDungeonLastFloaterTime;
	if (delta > 0) {
		for (let floater of KinkyDungeonFloaters) {
			floater.t += delta/1000;
		}
	}
	let newFloaters = [];
	for (let floater of KinkyDungeonFloaters) {
		let x = floater.override ? floater.x : canvasOffsetX + (floater.x - CamX)*KinkyDungeonGridSizeDisplay;
		let y = floater.override ? floater.y : canvasOffsetY + (floater.y - CamY)*KinkyDungeonGridSizeDisplay;
		DrawTextKD(floater.text,
			x, y - floater.speed*floater.t,
			floater.color, KDTextGray1, undefined, undefined, 120, KDEase(floater.t / floater.lifetime));
		if (floater.t < floater.lifetime) newFloaters.push(floater);
	}
	KinkyDungeonFloaters = newFloaters;

	KinkyDungeonLastFloaterTime = CommonTime();
}

/**
 * Easing function makes things smooth
 * @param {number} value
 * @returns {number}
 */
function KDEase(value) {
	if (value < 0.25)
		return Math.sin(value * Math.PI * 2);
	else if (value > 0.75)
		return Math.sin(-value * Math.PI * 2);
	else return 1;
}

let KinkyDungeonMessageToggle = false;
let KinkyDungeonMessageLog = [];
let KDLogDist = 24;
let KDMSGFontSize = 20;
let KDLogHeight = 700;
let KDMaxLog = Math.floor(700/KDLogDist);
let KDLogTopPad = 100;

let KDLogIndex = 0;
let KDLogIndexInc = 3;

let KDMsgWidth = 1200;
let KDMsgWidthMin = 800;
let KDMsgX = 400;
let KDMsgFadeTime = 10;

let KDMaxConsoleMsg = 6;

function KinkyDungeonDrawMessages(NoLog) {
	if (!NoLog)
		// @ts-ignore
		DrawButtonKDEx("logtog", (bdata) => {
			KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle;
			KDLogIndex = 0;
			return true;
		}, true, 1750, 82, 100, 50, TextGet("KinkyDungeonLog"), "#ffffff");
	if (!KinkyDungeonMessageToggle || NoLog) {
		let i = 0;
		if (!MouseIn(KDMsgX + (KDMsgWidth - KDMsgWidthMin)/2, 62, KDMsgWidthMin, KDLogDist*(2 + KDMaxConsoleMsg)) || KinkyDungeonDrawState != "Game") {


			let msg2nd = [];
			let ignoreMSG = [];
			let spacing = KDLogDist;
			if (KinkyDungeonActionMessageTime > 0 && KinkyDungeonActionMessageNoPush) {
				DrawTextFitKD(KinkyDungeonActionMessage, KDMsgX + KDMsgWidth/2, 82 + spacing * i, KDMsgWidthMin, KinkyDungeonActionMessageColor, KDTextGray1, KDMSGFontSize);
				ignoreMSG.push(KinkyDungeonActionMessage);
				i++;
			}
			if (KinkyDungeonTextMessageTime > 0 && KinkyDungeonTextMessageNoPush) {
				DrawTextFitKD(KinkyDungeonTextMessage, KDMsgX + KDMsgWidth/2, 82 + spacing * i, KDMsgWidthMin, KinkyDungeonTextMessageColor, KDTextGray1, KDMSGFontSize);
				ignoreMSG.push(KinkyDungeonTextMessage);
				i++;
			}
			for (let ii = 0; ii < KinkyDungeonMessageLog.length && ii < 100; ii++) {
				let index = KinkyDungeonMessageLog.length - 1 - ii;
				let msg = KinkyDungeonMessageLog[index];
				if (!msg) break;
				if (ignoreMSG.includes(msg.text)) {
					ignoreMSG.splice(ignoreMSG.indexOf(msg.text), 1);
					continue;
				}
				if (KinkyDungeonCurrentTick - msg.time < KDMsgFadeTime) {
					let count = 1;
					for (let iii = 1; iii < 100; iii++) {
						if (KinkyDungeonMessageLog[index - iii] && KinkyDungeonMessageLog[index-iii].text == msg.text) {
							count += 1;
							//KinkyDungeonMessageLog.splice(ii+iii, 1);
							//ii -= 1;
						} else break;
					}
					if (count > 1) {
						ii += count - 1;
					}
					msg2nd.push(count == 1 ? msg : Object.assign({}, {text: msg.text + ` (x${count})`, color: msg.color, time: msg.time}));
				}
			}
			if (msg2nd.length > 0) {
				let alpha = 1;
				let alphamin = 0.4;
				for (let msg of msg2nd) {
					if (i > KDMaxConsoleMsg || (KinkyDungeonDrawState != "Game" && i > 3)) break;
					if (alpha > 0) {
						alpha = Math.max(0, Math.min(1, 2.0 - i / KDMaxConsoleMsg)) * (1 - Math.max(0, Math.min(1, Math.max(0, KinkyDungeonCurrentTick - msg.time - 1)/KDMsgFadeTime)));
						DrawTextFitKD(msg.text, KDMsgX + KDMsgWidth/2, 82 + spacing * i, KDMsgWidthMin, msg.color, KDTextGray1, KDMSGFontSize, undefined, undefined, alphamin + (1 - alphamin) * alpha); i++;
					}
				}
			}

		}
		if (i > 0 || KinkyDungeonDrawState == "Game")
			FillRectKD(kdcanvas, kdpixisprites, "msglogbg", {
				Left: KDMsgX + (KDMsgWidth - KDMsgWidthMin)/2,
				Top: 0,
				Width: KDMsgWidthMin,
				Height: 62 + KDLogDist*(i + 1),
				Color: "#000000",
				LineWidth: 1,
				zIndex: 100,
				alpha: 0.45,
			});


	} else {
		FillRectKD(kdcanvas, kdpixisprites, "msglogbg", {
			Left: KDMsgX,
			Top: 0,
			Width: KDMsgWidth,
			Height: KDLogTopPad + KDLogHeight,
			Color: KDTextGray0,
			LineWidth: 1,
			zIndex: 100,
			alpha: 0.6,
		});
		for (let i = 0; i < KinkyDungeonMessageLog.length && i < KDMaxLog; i++) {
			let log = KinkyDungeonMessageLog[Math.max(0, KinkyDungeonMessageLog.length - 1 - (i + KDLogIndex))];
			let col = log.color;
			DrawTextFitKD(log.text, KDMsgX + KDMsgWidth/2, KDLogTopPad + i * KDLogDist + KDLogDist/2, KDMsgWidth, col, KDTextGray1, 28, undefined, 101);
		}
		if (KinkyDungeonMessageLog.length > KDMaxLog) {
			// @ts-ignore
			DrawButtonKDEx("logscrollup", (bdata) => {
				if (KDLogIndex > 0)
					KDLogIndex = Math.max(0, KDLogIndex - KDLogIndexInc);
				return true;
			}, true, 1500, 20, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png");
			//KDMsgX + KDMsgWidth/2 - 45, KDLogTopPad + KDLogHeight + 10
			// @ts-ignore
			DrawButtonKDEx("logscrolldown", (bdata) => {
				if (KDLogIndex < KinkyDungeonMessageLog.length - KDMaxLog)
					KDLogIndex = Math.min(Math.max(0, KinkyDungeonMessageLog.length - KDMaxLog), KDLogIndex + KDLogIndexInc);
				return true;
			}, true,1500, 60, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png");

			if (KinkyDungeonMessageLog.length > KDMaxLog * 100) {
				KinkyDungeonMessageLog.splice(0, KDMaxLog * 100 - KinkyDungeonMessageLog.length);
			}
		}

	}
}

function KDhexToRGB(h) {
	let r = "", g = "", b = "";

	// 3 digits
	if (h.length == 4) {
		r = h[1] + h[1];
		g = h[2] + h[2];
		b = h[3] + h[3];

		// 6 digits
	} else if (h.length == 7) {
		r = h[1] + h[2];
		g = h[3] + h[4];
		b = h[5] + h[6];
	}

	return {r:r, g:g, b:b};
}

function KinkyDungeonUpdateVisualPosition(Entity, amount) {
	if (amount < 0 || Entity.visual_x == undefined || Entity.visual_y == undefined) {
		Entity.visual_x = (Entity.xx != undefined) ? Entity.xx : Entity.x;
		Entity.visual_y = (Entity.yy != undefined) ? Entity.yy : Entity.y;
		return -1;
	} else {
		let speed = 50 + KDAnimSpeed * 50;
		if (Entity.player && KinkyDungeonSlowLevel > 0 && KDGameData.KinkyDungeonLeashedPlayer < 2 && (KinkyDungeonFastMovePath.length < 1 || KinkyDungeonSlowLevel > 1)) speed += KDAnimSpeed * 50 * KinkyDungeonSlowLevel;
		if (KDGameData.SleepTurns > 0) speed = 100;
		if (speed > 300) speed = 250;
		if (Entity.scale) speed = KDBulletSpeed;
		let value = amount/speed;// How many ms to complete a move
		// xx is the true position of a bullet
		let tx = (Entity.xx != undefined) ? Entity.xx : Entity.x;
		let ty = (Entity.yy != undefined) ? Entity.yy : Entity.y;

		let offX = 0;
		let offY = 0;
		let offamount = 0.25;
		if (Entity.fx && Entity.fy && (Entity.fx != Entity.x || Entity.fy != Entity.y) && Entity.Enemy && !KDIsImmobile(Entity)) {
			if (Entity.fx != Entity.x) {
				offX = offamount * Math.sign(Entity.fx - Entity.x);
			}
			if (Entity.fy != Entity.y) {
				offY = offamount * Math.sign(Entity.fy - Entity.y);
			}
		}
		tx += offX;
		ty += offY;

		let dist = Math.sqrt((Entity.visual_x - tx) * (Entity.visual_x - tx) + (Entity.visual_y - ty) * (Entity.visual_y - ty));
		if (dist > 5) {
			value = 1;
		}
		if (Entity.scale != undefined) {
			let scalemult = 0.9;
			if (dist > 0 || !Entity.end || !(Entity.vx || Entity.vy)) {
				if (Entity.vx || Entity.vy) {
					scalemult = KDistEuclidean(Entity.vx, Entity.vy);
				}
				Entity.scale = Math.min(1.0, Entity.scale + KDTimescale*amount*scalemult);
			} else {
				Entity.scale = Math.max(0.0, Entity.scale - KDTimescale*amount*scalemult);
			}
		}
		if (Entity.alpha != undefined) {
			let alphamult = 0.28;
			if (dist > 0 || !Entity.end) {
				Entity.alpha = Math.min(1.0, Entity.alpha + KDTimescale*amount*3.0);
			} else {
				if ((Entity.vx || Entity.vy) || Entity.time > 1) {
					alphamult = 0;
				}
				Entity.alpha = Math.min(1, Math.max(0.0, Entity.alpha - KDTimescale*amount*alphamult));
			}
		}

		if (Entity.spin != undefined && Entity.spinAngle != undefined) {
			Entity.spinAngle += Entity.spin * KDTimescale*amount;
			if (Entity.spinAngle > Math.PI * 2) Entity.spinAngle -= Math.PI*2;
			else if (Entity.spinAngle < 0) Entity.spinAngle += Math.PI*2;
			//Math.min(1.0, Entity.alpha + KDTimescale*amount*3.0);
		}

		if (dist == 0) return dist;
		// Increment
		let weightx = Math.abs(Entity.visual_x - tx)/(dist);
		let weighty = Math.abs(Entity.visual_y - ty)/(dist);
		//if (weightx != 0 && weightx != 1 && Math.abs(weightx - weighty) > 0.01)
		//console.log(weightx + ", " + weighty + ", " + (Entity.visual_x - tx) + ", " + (Entity.visual_y - ty) + ", dist = " + dist, "x = " + Entity.visual_x + ", y = " + Entity.visual_y)

		if (Entity.visual_x > tx) Entity.visual_x = Math.max(Entity.visual_x - value*weightx, tx);
		else Entity.visual_x = Math.min(Entity.visual_x + value*weightx, tx);

		if (Entity.visual_y > ty) Entity.visual_y = Math.max(Entity.visual_y - value*weighty, ty);
		else Entity.visual_y = Math.min(Entity.visual_y + value*weighty, ty);
		return dist;
		//console.log("x = " + Entity.visual_x + ", y = " + Entity.visual_y + ", tx = " + tx + ", ty = " + ty)
	}
}

/**
 * Sets the target location based on MOUSE location
 */
function KinkyDungeonSetTargetLocation() {
	KinkyDungeonTargetX = Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
	KinkyDungeonTargetY = Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;
}

/**
 * Sets the move direction based on MOUSE location
 */
function KinkyDungeonSetMoveDirection() {

	let tx = //(MouseX - ((KinkyDungeonPlayerEntity.x - KinkyDungeonCamX)*KinkyDungeonGridSizeDisplay + canvasOffsetX + KinkyDungeonGridSizeDisplay / 2))/KinkyDungeonGridSizeDisplay
		Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
	let ty = //(MouseY - ((KinkyDungeonPlayerEntity.y - KinkyDungeonCamY)*KinkyDungeonGridSizeDisplay + canvasOffsetY + KinkyDungeonGridSizeDisplay / 2))/KinkyDungeonGridSizeDisplay)
		Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;

	KDSendInput("setMoveDirection", {dir: KinkyDungeonGetDirection(
		tx - KinkyDungeonPlayerEntity.x,
		ty - KinkyDungeonPlayerEntity.y)}, true, true);

}

let KDBoxThreshold = 60;
let KDButtonColor = "rgba(5, 5, 5, 0.5)";
let KDButtonColorIntense = "rgba(5, 5, 5, 0.8)";
let KDBorderColor = '#f0b541';

/**
 * Draws a box component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Color - Color of the component
 * @param {boolean} [NoBorder] - Color of the component
 * @param {number} [Alpha] - Transparency of the box
 * @param {number} [zIndex] - z Index
 *  @returns {void} - Nothing
 */
function DrawBoxKD(Left, Top, Width, Height, Color, NoBorder, Alpha, zIndex = 90) {
	FillRectKD(kdcanvas, kdpixisprites, "box" + Left + "," + Top + "," + Width + "," + Height + Color + zIndex, {
		Left: Left,
		Top: Top,
		Width: Width,
		Height: Height,
		Color: Color,
		LineWidth: 1,
		zIndex: zIndex,
		alpha: Alpha != undefined ? Alpha : 1,
	});

	if (!NoBorder) {
		DrawRectKD(kdcanvas, kdpixisprites, "boxBorder" + Left + "," + Top + "," + Width + "," + Height + zIndex, {
			Left: Left,
			Top: Top,
			Width: Width,
			Height: Height,
			Color: KDBorderColor,
			LineWidth: 2,
			zIndex: zIndex + 0.001,
		});
	}
}

let KDFont = 'Arial';

/**
 *
 * @param {*} Text
 * @param {*} X
 * @param {*} Y
 * @param {*} Width
 * @param {*} Color
 * @param {*} [BackColor]
 * @param {*} [FontSize]
 * @param {*} [Align]
 * @param {*} [zIndex]
 * @param {*} [alpha]
 * @param {*} [border]
 */
function DrawTextFitKD(Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined) {
	if (!Text) return;
	let alignment = Align ? Align : "center";

	DrawTextVisKD(kdcanvas, kdpixisprites, Text + "," + X + "," + Y, {
		Text: Text,
		X: X,
		Y: Y,
		Width: Width,
		Color: Color,
		BackColor: BackColor ? BackColor : (Color == KDTextGray2 ? KDTextGray0 : (Color == KDTextGray0 ? KDTextGray3 : KDTextGray2)),
		FontSize: FontSize ? FontSize : 30,
		align: alignment,
		zIndex: zIndex,
		alpha: alpha,
		border: border,
	});
}

/**
 *
 * @param {*} Text
 * @param {*} X
 * @param {*} Y
 * @param {*} Color
 * @param {*} [BackColor]
 * @param {*} [FontSize]
 * @param {*} [Align]
 * @param {*} [zIndex]
 * @param {*} [alpha]
 */
function DrawTextKD(Text, X, Y, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined) {
	if (!Text) return;
	let alignment = Align ? Align : "center";

	DrawTextVisKD(kdcanvas, kdpixisprites, Text + "," + X + "," + Y, {
		Text: Text,
		X: X,
		Y: Y,
		Width: undefined,
		Color: Color,
		BackColor: BackColor,
		FontSize: FontSize ? FontSize : 30,
		align: alignment,
		zIndex: zIndex,
		alpha: alpha,
		border: border,
	});
}

let KDFontName = "Roboto";

/* eslint-disable */
// // Load them google fonts before starting...!
// @ts-ignore
window.WebFontConfig = {
    google: {
        families: [KDFontName],
    },

    active() {
		KDAllowText = true;
    },
};

let KDAllowText = true;


// include the web-font loader script
(function() {
    const wf = document.createElement('script');
    wf.src = `Fonts/webfont.js`;
    wf.type = 'text/javascript';
    wf.async = true;
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
}());
/* eslint-enabled */

/**
 *
 * @param {{Text: string, X: number, Y: number, Width?: number, Color: string, BackColor: string, FontSize?: number, align?: string, zIndex?: number, alpha?: number, border?: number}} Params
 * @returns {boolean} - If it worked
 */
function DrawTextVisKD(Container, Map, id, Params) {
	if (!KDAllowText) return;
	let sprite = Map.get(id);
	let same = true;
	let par = kdprimitiveparams.get(id);
	if (sprite && par) {
		for (let p of Object.entries(kdprimitiveparams.get(id))) {
			if (Params[p[0]] != p[1]) {
				same = false;
				break;
			}
		}
		for (let p of Object.entries(Params)) {
			if (par[p[0]] != p[1]) {
				same = false;
				break;
			}
		}
	}
	if (!sprite || !same) {
		if (sprite) sprite.destroy();
		// Make the prim
		sprite = new PIXI.Text(Params.Text,
			{
				fontFamily : KDFontName,
				fontSize: Params.FontSize ? Params.FontSize : 30,
				fill : string2hex(Params.Color),
				stroke : Params.BackColor != "none" ? (Params.BackColor ? string2hex(Params.BackColor) : "#333333") : 0x000000,
				strokeThickness: Params.border != undefined ? Params.border : (Params.BackColor != "none" ? (Params.FontSize ? Math.ceil(Params.FontSize / 8) : 2) : 0),
				miterLimit: 4,
			}
		);
		if (Params.Width) {
			sprite.scale.x = Math.min(1, Params.Width / Math.max(1, sprite.width));
			sprite.scale.y = sprite.scale.x;
		}
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!kdprimitiveparams.has(id) || !same)
			kdprimitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		sprite.position.x = Params.X + (Params.align == 'center' ? -sprite.width/2 : (Params.align == 'right' ? -sprite.width : 0));
		sprite.position.y = Params.Y - sprite.height/2 - 2;
		sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
		sprite.alpha = Params.alpha ? Params.alpha : 1;
		kdSpritesDrawn.set(id, true);
		return true;
	}
	return false;
}

/**
 * Draws a basic rectangle filled with a given color
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {{Left: number, Top: number, Width: number, Height: number, Color: string, LineWidth: number, zIndex: number, alpha?: number}} Params - rect parameters
 * @returns {boolean} - If it worked
 */
function DrawRectKD(Container, Map, id, Params) {
	let sprite = Map.get(id);
	let same = true;
	if (sprite && kdprimitiveparams.has(id)) {
		for (let p of Object.entries(kdprimitiveparams.get(id))) {
			if (Params[p[0]] != p[1]) {
				same = false;
				break;
			}
		}
	}
	if (!sprite || !same) {
		if (sprite) sprite.destroy();
		// Make the prim
		sprite = new PIXI.Graphics();
		sprite.lineStyle(Params.LineWidth ? Params.LineWidth : 1, string2hex(Params.Color), 1);
		sprite.drawRect(0, 0, Params.Width, Params.Height);
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!kdprimitiveparams.has(id) || !same)
			kdprimitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		sprite.position.x = Params.Left;
		sprite.position.y = Params.Top;
		sprite.width = Params.Width;
		sprite.height = Params.Height;
		sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
		sprite.alpha = Params.alpha ? Params.alpha : 1;
		kdSpritesDrawn.set(id, true);
		return true;
	}
	return false;
}

/**
 * Draws a basic rectangle filled with a given color
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {{Left: number, Top: number, Width: number, Height: number, Color: string, LineWidth?: number, zIndex: number, alpha?: number}} Params - rect parameters
 * @returns {boolean} - If it worked
 */
function FillRectKD(Container, Map, id, Params) {
	let sprite = Map.get(id);
	let same = true;
	if (sprite && kdprimitiveparams.has(id)) {
		for (let p of Object.entries(kdprimitiveparams.get(id))) {
			if (Params[p[0]] != p[1]) {
				same = false;
				break;
			}
		}
	}
	if (!sprite || !same) {
		if (sprite) sprite.destroy();
		// Make the prim
		sprite = new PIXI.Graphics();
		sprite.beginFill(string2hex(Params.Color));
		sprite.drawRect(0, 0, Params.Width, Params.Height);
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!kdprimitiveparams.has(id))
			kdprimitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		sprite.position.x = Params.Left;
		sprite.position.y = Params.Top;
		sprite.width = Params.Width;
		sprite.height = Params.Height;
		sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
		sprite.alpha = Params.alpha ? Params.alpha : 1;
		kdSpritesDrawn.set(id, true);
		return true;
	}
	return false;
}

/**
 * Draws a button component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables the button border and only draws the image and selection halo
 * @param {string} [FillColor] - Color of the background
 * @param {number} [FontSize] - Color of the background
 * @param {boolean} [ShiftText] - Shift text to make room for the button
 * @param {boolean} [Stretch] - Stretch the image to fit
 * @param {number} [zIndex] - Stretch the image to fit
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @param {number} [options.zIndex] - zIndex
 * @returns {void} - Nothing
 */
function DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex = 100, options) {
	let hover = ((MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height) && !CommonIsMobile && !Disabled);
	if (!NoBorder || FillColor)
		DrawBoxKD(Left, Top, Width, Height,
			FillColor ? FillColor : (hover ? (KDTextGray2) : KDButtonColor),
			NoBorder, options?.alpha || 0.5, zIndex
		);
	if (hover) {
		let pad = 4;
		// Draw the button rectangle (makes the background color cyan if the mouse is over it)
		DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "out", {
			Left: Left + pad,
			Top: Top + pad,
			Width: Width - 2 * pad + 1,
			Height: Height - 2 * pad + 1,
			Color: "#ffffff",
			LineWidth: 2,
			zIndex: zIndex,
		});
	}

	// Draw the text or image
	let textPush = 0;
	if ((Image != null) && (Image != "")) {
		let img = KDTex(Image);
		if (Stretch) {
			KDDraw(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height,
				Image, Left, Top, Width, Height, undefined, {
					zIndex: zIndex + 0.001,
				});
			/*DrawImageEx(Image, Left, Top, {
				Width: Width,
				Height: Height,
			});*/
		} else KDDraw(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height,
			Image, Left + 2, Top + Height/2 - img.orig.height/2, img.orig.width, img.orig.height, undefined, {
				zIndex: zIndex + 0.001,
			});
		textPush = img.orig.width;
	}
	DrawTextFitKD(Label, Left + Width / 2 + (ShiftText ? textPush*0.5 : 0), Top + (Height / 2), Width - 4 - Width*0.04 - (textPush ? (textPush + (ShiftText ? 0 : Width*0.04)) : Width*0.04),
		Color,
		(options && options.noTextBG) ? "none" : undefined,
		FontSize, undefined, zIndex + 0.001);

	// Draw the tooltip
	if ((HoveringText != null) && (MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height)) {
		DrawTextFitKD(HoveringText, 1000, MouseY, 1500, "#ffffff");
		//DrawHoverElements.push(() => DrawButtonHover(Left, Top, Width, Height, HoveringText));
	}
}



/**
 * Draws a checkbox component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Text - Label associated with the checkbox
 * @param {boolean} IsChecked - Whether or not the checkbox is checked
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {string} [TextColor] - Color of the text
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @param {number} [options.zIndex] - zIndex
 * @returns {void} - Nothing
 */
// @ts-ignore
function DrawCheckboxVis(Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = KDTextGray0, CheckImage = "Icons/Checked.png", options) {
	DrawTextFitKD(Text, Left + 100, Top + 33, 1000, TextColor, "#333333", undefined, "left");
	DrawButtonVis(Left, Top, Width, Height, "", Disabled ? "#ebebe4" : "#ffffff", IsChecked ? (KinkyDungeonRootDirectory + "UI/Checked.png") : "", null, Disabled,
		undefined, undefined, undefined, undefined, undefined, options?.zIndex, options);
}



/**
 * Draws a checkbox component
 * @param {string} name - Name of the button element
 * @param {(bdata: any) => boolean} func - Whether or not you can click on it
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Text - Label associated with the checkbox
 * @param {boolean} IsChecked - Whether or not the checkbox is checked
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {string} [TextColor] - Color of the text
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @param {number} [options.zIndex] - zIndex
 * @param {number} [options.maxWidth] - Max width
 * @returns {void} - Nothing
 */
// @ts-ignore
function DrawCheckboxKDEx(name, func, enabled, Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = KDTextGray0, CheckImage = "Icons/Checked.png", options) {
	DrawTextFitKD(Text, Left + 100, Top + 33, options?.maxWidth || 1000, TextColor, "#333333", undefined, "left");
	DrawButtonKDEx(name, func, enabled, Left, Top, Width, Height, "", Disabled ? "#ebebe4" : "#ffffff", IsChecked ? (KinkyDungeonRootDirectory + "UI/Checked.png") : "", null, Disabled,
		undefined, undefined, undefined, undefined, options);
}


/**
 * Draw a back & next button component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text inside the component
 * @param {string} Color - Color of the component
 * @param {string} [Image] - Image URL to draw in the component
 * @param {() => string} [BackText] - Text for the back button tooltip
 * @param {() => string} [NextText] - Text for the next button tooltip
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {number} [ArrowWidth] - How much of the button the previous/next sections cover. By default, half each.
 * @param {boolean} [NoBorder] - Disables the hovering options if set to true
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @returns {void} - Nothing
 */
// @ts-ignore
function DrawBackNextButtonVis(Left, Top, Width, Height, Label, Color, Image, BackText, NextText, Disabled, ArrowWidth, NoBorder, options) {
	let id = "BackNext" + Left + "," + Top + "," + Width + Color;
	// Set the widths of the previous/next sections to be colored cyan when hovering over them
	// By default each covers half the width, together covering the whole button
	if (ArrowWidth == null || ArrowWidth > Width / 2) ArrowWidth = Width / 2;
	const LeftSplit = Left + ArrowWidth;
	const RightSplit = Left + Width - ArrowWidth;

	DrawBoxKD(Left, Top, Width, Height,
		KDButtonColor, undefined, options?.alpha || 0.5
	);

	// Draw the button rectangle


	if (MouseIn(Left, Top, Width, Height) && !CommonIsMobile && !Disabled) {
		if (MouseX > RightSplit) {
			DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a", {
				Left: RightSplit + 4,
				Top: Top + 4,
				Width: ArrowWidth - 8,
				Height: Height - 8,
				Color: "#ffffff",
				LineWidth: 1,
				zIndex: 101,
			});
			//MainCanvas.rect(RightSplit + 4, Top + 4, ArrowWidth - 8, Height - 8);
		}
		else if (MouseX <= LeftSplit) {
			DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a", {
				Left: Left + 4,
				Top: Top + 4,
				Width: ArrowWidth - 8,
				Height: Height - 8,
				Color: "#ffffff",
				LineWidth: 1,
				zIndex: 101,
			});
			//MainCanvas.rect(Left + 4, Top + 4, ArrowWidth - 8, Height - 8);
		} else {
			DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a", {
				Left: Left + ArrowWidth + 4,
				Top: Top + 4,
				Width: Width - ArrowWidth * 2 - 8,
				Height: Height - 8,
				Color: "#ffffff",
				LineWidth: 1,
				zIndex: 101,
			});
			//MainCanvas.rect(Left + 4 + ArrowWidth, Top + 4, Width - ArrowWidth * 2 - 8, Height - 8);
		}
	}
	else if (CommonIsMobile && ArrowWidth < Width / 2 && !Disabled) {
		// Fill in the arrow regions on mobile

		DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a1", {
			Left: Left + 4,
			Top: Top + 4,
			Width: ArrowWidth - 8,
			Height: Height - 8,
			Color: "#ffffff",
			LineWidth: 1,
			zIndex: 101,
		});
		DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a2", {
			Left: RightSplit + 4,
			Top: Top + 4,
			Width: ArrowWidth - 8,
			Height: Height - 8,
			Color: "#ffffff",
			LineWidth: 1,
			zIndex: 101,
		});
	}
	/*MainCanvas.beginPath();
	MainCanvas.lineWidth = 1;
	MainCanvas.strokeStyle = '#ffffff';
	MainCanvas.stroke();

	MainCanvas.stroke();
	MainCanvas.closePath();*/

	// Draw the text or image
	DrawTextFitKD(Label, Left + Width / 2, Top + (Height / 2) + 1, (CommonIsMobile) ? Width - 6 : Width - 36, "#ffffff");

	// Draw the back arrow
	/*MainCanvas.beginPath();
	MainCanvas.fillStyle = KDTextGray0;
	MainCanvas.moveTo(Left + 15, Top + Height / 5);
	MainCanvas.lineTo(Left + 5, Top + Height / 2);
	MainCanvas.lineTo(Left + 15, Top + Height - Height / 5);
	MainCanvas.stroke();
	MainCanvas.closePath();

	// Draw the next arrow
	MainCanvas.beginPath();
	MainCanvas.fillStyle = KDTextGray0;
	MainCanvas.moveTo(Left + Width - 15, Top + Height / 5);
	MainCanvas.lineTo(Left + Width - 5, Top + Height / 2);
	MainCanvas.lineTo(Left + Width - 15, Top + Height - Height / 5);
	MainCanvas.stroke();
	MainCanvas.closePath();*/
}


/**
 *
 * @param {number} CamX
 * @param {number} CamY
 * @param {number} CamX_offset
 * @param {number} CamY_offset
 * @param {boolean} [Debug]
 * @returns {any}
 */
function KDDrawMap(CamX, CamY, CamX_offset, CamY_offset, Debug) {
	let tooltip = "";
	let KinkyDungeonForceRender = "";
	let KinkyDungeonForceRenderFloor = "";

	for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
		if (b && b.mushroom) {
			KinkyDungeonForceRender = '2';
			KinkyDungeonForceRenderFloor = "cry";
		}
	}


	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
	let drawFloor = altType?.skin ? altType.skin : KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint];

	let noReplace = "";
	let noReplace_skin = {};
	for (let tile of Object.values(KinkyDungeonTilesSkin)) {
		if (tile.skin && noReplace_skin[tile.skin] != undefined) {
			let paramskin = KinkyDungeonMapParams[drawFloor];
			if (paramskin.noReplace)
				noReplace_skin[tile.skin] = paramskin.noReplace;
			else noReplace_skin[tile.skin] = "";
		}
	}

	let params = KinkyDungeonMapParams[drawFloor];
	if (params.noReplace)
		noReplace = params.noReplace;
	// Draw the grid and tiles
	let rows = KinkyDungeonGrid.split('\n');
	for (let R = -1; R <= KinkyDungeonGridHeightDisplay + 1; R++)  {
		for (let X = -1; X <= KinkyDungeonGridWidthDisplay + 1; X++)  {
			let RY = R+CamY;
			let RX = X+CamX;
			let allowFog = KDAllowFog();
			if (RY >= 0 && RY < KinkyDungeonGridHeight && RX >= 0 && RX < KinkyDungeonGridWidth && (KinkyDungeonVisionGet(RX, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY) > 0))) {
				if (Debug) {
					if ( KinkyDungeonTilesGet(RX + "," + RY)) {
						if (KinkyDungeonTilesGet(RX + "," + RY).Lock)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).Lock, (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).AI)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).AI, (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).Type == "Prisoner")
							DrawTextFitKD("Prisoner", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).required && KinkyDungeonTilesGet(RX + "," + RY).required)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).required[0], (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).Label && KinkyDungeonTilesGet(RX + "," + RY).required)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).required[0], (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/1.5, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).OffLimits)
							DrawTextFitKD("OffLimits", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#ff5555");
						if (KinkyDungeonTilesGet(RX + "," + RY).Priority)
							DrawTextFitKD("Priority", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay*0.67, KinkyDungeonGridSizeDisplay, "#55ff55");
					}

					for (let p of KinkyDungeonPOI) {
						if (p.x == RX && p.y == RY) {
							DrawTextFitKD("POI" + (p.requireTags && p.requireTags.includes("endpoint") ? "Endpoint" : ""), (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#999999");
							DrawTextFitKD((p.favor && p.favor.length > 0 ? p.favor[0] : ""), (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#999999");
							DrawTextFitKD((p.chance || 1.0) * 100 + "%", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#999999");
						}
					}
					for (let p of KDGameData.KeyringLocations) {
						if (p.x == RX && p.y == RY) {
							DrawTextFitKD("Keyring", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#999999");
						}
					}
				}
				let floor = KinkyDungeonTilesSkin[RX + "," + RY] ?
					(KinkyDungeonTilesSkin[RX + "," + RY].force ? KinkyDungeonTilesSkin[RX + "," + RY].skin : KinkyDungeonMapIndex[KinkyDungeonTilesSkin[RX + "," + RY].skin])
					: drawFloor;
				let vision = KinkyDungeonVisionGet(RX, RY);
				let nR = KinkyDungeonTilesSkin[RX + "," + RY] ? noReplace : noReplace_skin[floor];
				let sprite = KinkyDungeonGetSprite(rows[RY][RX], RX, RY, vision == 0, nR);
				let sprite2 = KinkyDungeonGetSpriteOverlay(rows[RY][RX], RX, RY, vision == 0, nR);
				let sprite3 = KinkyDungeonGetSpriteOverlay2(rows[RY][RX], RX, RY, vision == 0, nR);
				if (KinkyDungeonForceRender) {
					sprite = KinkyDungeonGetSprite(KinkyDungeonForceRender, RX, RY, vision == 0, nR);
					sprite2 = null;
					sprite3 = null;
				}
				if (KinkyDungeonForceRenderFloor != "") floor = KinkyDungeonForceRenderFloor;
				let light = KinkyDungeonBrightnessGet(RX, RY);
				let lightColor = KDAvgColor(KinkyDungeonColorGet(RX, RY), KinkyDungeonShadowGet(RX, RY), light, 1);
				lightColor = KDAvgColor(lightColor, 0xffffff, 1, 1); // Brighten

				KDDraw(kdgameboard, kdpixisprites, RX + "," + RY, KinkyDungeonRootDirectory + "Floors/Floor_" + floor + "/" + sprite + ".png",
					(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
						zIndex: -2,
						tint: lightColor,
					});
				if (sprite2)
					KDDraw(kdgameboard, kdpixisprites, RX + "," + RY + "_o", KinkyDungeonRootDirectory + "FloorGeneric/" + sprite2 + ".png",
						(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: -1.1,
							tint: lightColor,
						});

				if (sprite3)
					KDDraw(kdgameboard, kdpixisprites, RX + "," + RY + "_o2", KinkyDungeonRootDirectory + "FloorGeneric/" + sprite3 + ".png",
						(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: -1,
							tint: lightColor,
						});

				if (rows[RY][RX] == "A") {
					let color = "";
					if (KinkyDungeonTilesGet(RX + "," + RY)) {
						color = KDGoddessColor(KinkyDungeonTilesGet(RX + "," + RY).Name);
					}
					if (color)
						KDDraw(kdgameboard, kdpixisprites, RX + "," + RY + "_a", KinkyDungeonRootDirectory + "ShrineAura.png",
							(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								tint: string2hex(color),
							});
				}
				if (KinkyDungeonVisionGet(RX, RY) > 0
					&& (KinkyDungeonTilesGet(RX + "," + RY) && rows[RY][RX] == "A" || KinkyDungeonTilesGet(RX + "," + RY) && rows[RY][RX] == "M")
					&& MouseIn(canvasOffsetX + (-CamX_offset + X)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)) {
					tooltip = TextGet("KinkyDungeon" + KinkyDungeonTilesGet(RX + "," + RY).Type + "Tooltip").replace("SHRINETYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTilesGet(RX + "," + RY).Name));
				}
			}
		}
	}

	return {
		tooltip: tooltip,
		KinkyDungeonForceRender: KinkyDungeonForceRender,
	};
}

/**
 *
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {string} Image
 * @param {number} Left
 * @param {number} Top
 * @param {number} Width
 * @param {number} Height
 * @param {number} [Rotation]
 * @param {any} [options]
 * @param {boolean} [Centered]
 * @param {Map<string, boolean>} [SpritesDrawn]
 * @param {number} [Scale]
 * @returns {boolean}
 */
function KDDraw(Container, Map, id, Image, Left, Top, Width, Height, Rotation, options, Centered, SpritesDrawn, Scale) {
	let sprite = Map.get(id);
	if (!sprite) {
		// Load the texture
		let tex = KDTex(Image);

		if (tex) {
			// Create the sprite
			// @ts-ignore
			sprite = PIXI.Sprite.from(tex);
			Map.set(id, sprite);
			// Add it to the container
			Container.addChild(sprite);
		}
	}
	if (sprite) {
		sprite.interactive = false;
		// Modify the sprite according to the params
		let tex = KDTex(Image);
		if (tex) sprite.texture = tex;
		sprite.name = id;
		sprite.position.x = Left;
		sprite.position.y = Top;
		if (Width)
			sprite.width = Width;
		if (Height)
			sprite.height = Height;
		if (Scale) {
			sprite.scale.x = Scale;
			sprite.scale.y = Scale;
		}
		if (Centered) {
			sprite.anchor.set(0.5);
		}
		if (Rotation != undefined)
			sprite.rotation = Rotation;
		if (options) {
			if (options.filters && sprite.cacheAsBitmap) {
				sprite.filters = null;
			} else {
				for (let o of Object.entries(options)) {
					sprite[o[0]] = o[1];
				}
			}

			if (options.scalex != undefined) {
				sprite.scale.x = sprite.scale.x * options.scalex;
			}
			if (options.scaley != undefined) {
				sprite.scale.y = sprite.scale.y * options.scaley;
			}
			if (options.anchorx != undefined) {
				sprite.anchor.x = options.anchorx;
			}
			if (options.anchory != undefined) {
				sprite.anchor.y = options.anchory;
			}
		}
		if (SpritesDrawn)
			SpritesDrawn.set(id, true);
		else
			kdSpritesDrawn.set(id, true);
		return true;
	}
	return false;
}

/**
 * Returns a PIXI.Texture, or null if there isnt one
 * @param {string} Image
 * @returns {any}
 */
function KDTex(Image) {
	if (kdpixitex.has(Image)) return kdpixitex.get(Image);
	let tex = PIXI.Texture.from(Image);
	kdpixitex.set(Image, tex);
	return tex;
}

/**
 *
 * @param {string} str
 * @returns
 */
function string2hex(str) {
	// @ts-ignore
	return PIXI.utils.string2hex(str);
}

function GetAdjacentList(list, index, width) {
	return {
		left: list.slice(0, index),
		right: list.slice(index+width),
	}
}

function KDUpdateVision() {
	KinkyDungeonUpdateLightGrid = false;

	let viewpoints = [ {x: KinkyDungeonPlayerEntity.x, y:KinkyDungeonPlayerEntity.y, brightness: KinkyDungeonDeaf ? 2 : 4 }];

	let data = {
		lights: [],
		maplights: [],
	};
	let l = null;
	for (let t of Object.keys(KinkyDungeonTiles)) {
		let tile = KinkyDungeonTilesGet(t);
		let x = parseInt(t.split(',')[0]);
		let y = parseInt(t.split(',')[1]);
		if (tile && tile.Light && x && y) {
			l = {x: x, y:y + (tile.Offset ? 1 : 0), y_orig: y, brightness: tile.Light, color: tile.lightColor};
			data.lights.push(l);
			data.maplights.push(l);
		}
	}
	for (let b of KinkyDungeonBullets) {
		if (b.bullet?.bulletColor) {
			l = {x: b.x, y:b.y, y_orig: b.y, brightness: b.bullet.bulletLight, color: b.bullet.bulletColor};
			data.lights.push(l);
		}
	}
	KinkyDungeonSendEvent("getLights", data);
	KinkyDungeonMakeBrightnessMap(KinkyDungeonGridWidth, KinkyDungeonGridHeight, KinkyDungeonMapBrightness, data.lights, KDVisionUpdate);
	KinkyDungeonMakeVisionMap(KinkyDungeonGridWidth, KinkyDungeonGridHeight, viewpoints, data.lights, KDVisionUpdate, KinkyDungeonMapBrightness);
	KDVisionUpdate = 0;
}


let KDTileTooltips = {
	'1': () => {return {color: "#ffffff", text: "1"};},
	'0': () => {return {color: "#ffffff", text: "0"};},
	'2': () => {return {color: "#ffffff", text: "2"};},
	'R': () => {return {color: "#ffffff", noInspect: true, text: "R"};},
	'Y': () => {return {color: "#ffffff", noInspect: true, text: "Y"};},
	'L': () => {return {color: "#ffffff", noInspect: true, text: "L"};},
	'A': () => {return {color: "#ffffff", noInspect: true, text: "A"};},
	'a': () => {return {color: "#ffffff", text: "a"};},
	'O': () => {return {color: "#ffffff", text: "O"};},
	'o': () => {return {color: "#ffffff", text: "o"};},
	'C': () => {return {color: "#ffffff", noInspect: true, text: "C"};},
	'c': () => {return {color: "#ffffff", text: "c"};},
	'T': () => {return {color: "#ffffff", text: "T"};},
	'4': () => {return {color: "#ffffff", noInspect: true, text: "4"};},
	'X': () => {return {color: "#ffffff", text: "X"};},
	'?': () => {return {color: "#ffffff", noInspect: true, text: "Hook"};},
	',': () => {return {color: "#ffffff", noInspect: true, text: "Hook"};},
	'S': () => {return {color: "#ffffff", noInspect: true, text: "S"};},
	's': () => {return {color: "#ffffff", noInspect: true, text: "s"};},
	'H': () => {return {color: "#ffffff", noInspect: true, text: "H"};},
	'G': () => {return {color: "#ffffff", noInspect: true, text: "G"};},
	'B': () => {return {color: "#ffffff", noInspect: true, text: "B"};},
	'@': () => {return {color: "#ffffff", noInspect: true, text: "@"};},
	'b': () => {return {color: "#ffffff", noInspect: true, text: "b"};},
	'D': () => {return {color: "#ffffff", noInspect: true, text: "D"};},
	'd': () => {return {color: "#ffffff", noInspect: true, text: "d"};},
	'Z': () => {return {color: "#ffffff", noInspect: true, text: "Z"};},
	'z': () => {return {color: "#ffffff", noInspect: true, text: "z"};},
	't': () => {return {color: "#aa55ff", noInspect: true, text: "t"};},
	'u': () => {return {color: "#ffffff", noInspect: true, text: "u"};},
	'V': () => {return {color: "#ffffff", noInspect: true, text: "V"};},
	'N': () => {return {color: "#ffffff", noInspect: true, text: "N"};},
};


function KDDrawTileTooltip(maptile, x, y, offset) {
	let TooltipList = [];
	TooltipList.push({
		str: TextGet("KDTileTooltip" + KDTileTooltips[maptile]().text),
		fg: KDTileTooltips[maptile]().color,
		bg: "#000000",
		size: 24,
		center: true,
	});


	return KDDrawTooltip(TooltipList, offset);
}


let KDEffectTileTooltips = {
	'Runes': (tile, x, y, TooltipList) => {
		TooltipList.push({
			str: TextGet("KDEffectTileTooltip" + tile.name),
			fg: "#ff5555",
			bg: "#000000",
			size: 24,
			center: true,
		});
		TooltipList.push({
			str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
			fg: "#ffffff",
			bg: "#000000",
			size: 16,
			center: true,
		});
	},
	'RunesTrap': (tile, x, y, TooltipList) => {
		TooltipList.push({
			str: TextGet("KDEffectTileTooltip" + tile.name),
			fg: "#92e8c0",
			bg: "#000000",
			size: 24,
			center: true,
		});
		TooltipList.push({
			str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
			fg: "#ffffff",
			bg: "#000000",
			size: 16,
			center: true,
		});
	},
	'Inferno': (tile, x, y, TooltipList) => {
		TooltipList.push({
			str: TextGet("KDEffectTileTooltip" + tile.name),
			fg: "#ff8855",
			bg: "#000000",
			size: 24,
			center: true,
		});
		TooltipList.push({
			str: TextGet("KDEffectTileTooltip" + tile.name + "Desc").replace("DAMAGEDEALT", "" + Math.round(10 * KDGetEnvironmentalDmg())),
			fg: "#ffaa55",
			bg: "#000000",
			size: 16,
			center: true,
		});
	},
	'Ember': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffaa88");},
	'Ice': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#88ffff");},
	'Water': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#8888ff");},
	'Vines': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#44ff44", "KDEffectTileTooltipCMDBindings");},
	'Ropes': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffae70", "KDEffectTileTooltipCMDBindings");},
	'Chains': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#aaaaaa", "KDEffectTileTooltipCMDBindings");},
	'Belts': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#8f4d57", "KDEffectTileTooltipCMDBindings");},
	'Fabric': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ff5277", "KDEffectTileTooltipCMDBindings");},
	'FabricGreen': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#63ab3f", "KDEffectTileTooltipCMDBindings");},
	'Slime': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#d952ff", "KDEffectTileTooltipCMDSlime");},
	'Latex': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#d952ff");},
	'Steam': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'Smoke': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#888888");},
	'Torch': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'TorchUnlit': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'Lantern': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'LanternUnlit': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'IllusOrb': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'IllusOrbDead': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'TorchOrb': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");},
	'Cracked': (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ff8844");},
};
/**
 *
 * @param {effectTile} tile
 * @param {any[]} TooltipList
 * @param {string} color
 * @param {string} [extra]
 * @param {string} [descColor]
 * @param {string} [extraColor]
 */
function KDETileTooltipSimple(tile, TooltipList, color, extra, descColor = "#ffffff", extraColor = "#ffffff") {
	TooltipList.push({
		str: TextGet("KDEffectTileTooltip" + tile.name),
		fg: color,
		bg: "#000000",
		size: 24,
		center: true,
	});
	TooltipList.push({
		str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
		fg: descColor,
		bg: "#000000",
		size: 16,
		center: true,
	});
	if (extra) {
		TooltipList.push({
			str: TextGet(extra),
			fg: extraColor,
			bg: "#000000",
			size: 16,
			center: true,
		});
	}
}

function KDDrawEffectTileTooltip(tile, x, y, offset) {
	let TooltipList = [];
	KDEffectTileTooltips[tile.name](tile, x, y, TooltipList);

	return KDDrawTooltip(TooltipList, offset);
}

function KDDrawTooltip(TooltipList, offset) {
	let TooltipWidth = 300;
	let TooltipHeight = 0;
	let extra = 5;
	for (let listItem of TooltipList) {
		TooltipHeight += listItem.size + extra;
	}
	TooltipHeight = Math.max(20, TooltipHeight);
	let tooltipX = 2000 - 410 - TooltipWidth;
	let tooltipY = 890 - TooltipHeight - offset;
	let YY = 0;

	FillRectKD(kdcanvas, kdpixisprites, "inspectTooltip" + offset, {
		Left: tooltipX,
		Top: tooltipY - 25,
		Width: TooltipWidth,
		Height: TooltipHeight + 20,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 60,
		alpha: 0.4,
	});

	let pad = 10;

	for (let listItem of TooltipList) {
		DrawTextFitKD(listItem.str,
			tooltipX + (listItem.center ? TooltipWidth/2 : pad),
			tooltipY + YY, TooltipWidth - 2 * pad, listItem.fg, listItem.bg,
			listItem.size, listItem.center ? "center" : "left", 61);
		YY += extra + listItem.size;
	}
	return offset + TooltipHeight + 30;
}

/**
 * Elements which are temporary and drawn using a declarative style
 * If not redrawn at the end of a frame, they will be removed
 */
let KDTempElements = new Map();
/**
 * Elements which are temporary and drawn using a declarative style
 * If not redrawn at the end of a frame, they will be removed
 */
let KDDrawnElements = new Map();

/**
 * Creates a text field with the specified params
 * @param {string} Name
 * @param {number} Left
 * @param {number} Top
 * @param {number} Width
 * @param {number} Height
 */
function KDTextArea(Name, Left, Top, Width, Height) {
	let Element = KDTempElements.get(Name);
	let created = false;
	if (!Element) {
		ElementCreateTextArea(Name);
		Element = document.getElementById(Name);
		KDTempElements.set(Name, Element)
		if (Element) created = true;
	}
	KDElementPosition(Name, Left, Top, Width, Height);
	KDDrawnElements.set(Name, Element)
	return {Element: Element, Created: created}
}

/**
 * Creates a text field with the specified params
 * @param {string} Name
 * @param {number} Left
 * @param {number} Top
 * @param {number} Width
 * @param {number} Height
 * @param {string} Type
 * @param {string} Value
 * @param {string} MaxLength
 */
function KDTextField(Name, Left, Top, Width, Height, Type = "text", Value = "", MaxLength = "30") {
	let Element = KDTempElements.get(Name);
	let created = false;
	if (!Element) {
		ElementCreateInput(Name, Type, Value, MaxLength);
		Element = document.getElementById(Name);
		KDTempElements.set(Name, Element)
		if (Element) created = true;
	}
	KDElementPosition(Name, Left, Top, Width, Height);
	KDDrawnElements.set(Name, Element)
	return {Element: Element, Created: created}
}


/**
 * Culls the text fields and other DOM elements created
 */
function KDCullTempElements() {
	for (let Name of KDTempElements.keys()) {
		if (!KDDrawnElements.get(Name)) {
			ElementRemove(Name);
			KDTempElements.delete(Name);
		}
	}

	KDDrawnElements = new Map();
}


/**
 * Draws an existing HTML element at a specific position within the document. The element is "centered" on the given coordinates by dividing its height and width by two.
 * @param {string} ElementID - The id of the input tag to (re-)position.
 * @param {number} X - Center point of the element on the X axis.
 * @param {number} Y - Center point of the element on the Y axis.
 * @param {number} W - Width of the element.
 * @param {number} [H] - Height of the element.
 * @returns {void} - Nothing
 */
function KDElementPosition(ElementID, X, Y, W, H) {
	let E = document.getElementById(ElementID);

	if (!E) {
		console.warn("A call to ElementPosition was made on non-existent element with ID '" + ElementID + "'");
		return;
	}

	// For a vertical slider, swap the width and the height (the transformation is handled by CSS)
	if (E.tagName.toLowerCase() === "input" && E.getAttribute("type") === "range" && E.classList.contains("Vertical")) {
		let tmp = W;
		W = H;
		H = tmp;
	}

	// Different positions based on the width/height ratio
	const HRatio = PIXICanvas.clientHeight / 1000;
	const WRatio = PIXICanvas.clientWidth / 2000;
	const Font = PIXICanvas.clientWidth <= PIXICanvas.clientHeight * 2 ? PIXICanvas.clientWidth / 50 : PIXICanvas.clientHeight / 25;
	const Height = H ? H * HRatio : Font * 1.1;
	const Width = W * WRatio;
	const Top = PIXICanvas.offsetTop + Y * HRatio - 4;
	const Left = PIXICanvas.offsetLeft + (X) * WRatio + 4;

	// Sets the element style
	Object.assign(E.style, {
		fontSize: Font + "px",
		fontFamily: CommonGetFontName(),
		position: "fixed",
		left: Left + "px",
		top: Top + "px",
		width: Width + "px",
		height: Height + "px",
		display: "inline"
	});
}

/** Whether or not to show the quick inv
 * @returns {boolean}
*/
function KDShowQuickInv() {
	return KinkyDungeonShowInventory || (KDGameData.CurrentDialog && KDDialogue[KDGameData.CurrentDialog] && KDDialogue[KDGameData.CurrentDialog].inventory);
}

let KDUpdateFog = false;
let KDLastCamPos = {x: 0, y: 0};

let KDDrawPlayer = true;

let KDDesiredPlayerPose = {};

function KDPlayerDrawPoseButtons(C) {
	KDModalArea = true;
	KDModalArea_x = 650;
	KDModalArea_y = 630;
	KDModalArea_width = 1000;
	KDModalArea_height = 370;
	KDDrawPoseButtons(C, 700, 680, true);
	KDDesiredPlayerPose = {
		Arms: KDWardrobe_CurrentPoseArms,
		Legs: KDWardrobe_CurrentPoseLegs,
		Eyes: KDWardrobe_CurrentPoseEyes,
		Brows: KDWardrobe_CurrentPoseBrows,
		Blush: KDWardrobe_CurrentPoseBlush,
		Mouth: KDWardrobe_CurrentPoseMouth,
	};
}
