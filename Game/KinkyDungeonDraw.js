"use strict";

let KDDebugOverlay = false;


let KDInspectCamera = {x: 0, y: 0};

let KDRecentRepIndex = 0;

let ShowBoringness = false;

let KDWallReplacers = "146,dDzZbgS";

let KinkyDungeonSuppressSprint = true;

let KDReturnButtonXX = 1450;

let KDIntenseFilter = null;

let KDButtonHovering = false;


let KDAnimTick = 0;
let KDAnimTickInterval = 2000;
let KDAnimTime = 400;

let KDFloatAnimTime = 1500;
let KDSquishyAnimTime = 1600;
let KDBreathAnimTime = 3000;

let KDFlipPlayer = false;

// PIXI experimental
/** @type HTMLCanvasElement */
let pixiview = null;
let pixirenderer = null;
let pixirendererKD = null;
let kdgamefog = new PIXI.Graphics();
//let kdgamefogmask = new PIXI.Graphics();
let kdgamefogsmoothDark = new PIXI.Container();
kdgamefogsmoothDark.zIndex = -1.05;
let kdgamefogsmooth = new PIXI.Container();
kdgamefogsmooth.zIndex = -1.1;
//kdgamefogsmooth.mask = kdgamefogmask;
kdgamefog.zIndex = -1;
let kdgamesound = new PIXI.Container();
kdgamesound.zIndex = 1;
let kdsolidcolorfilter = new PIXI.Filter(null, KDShaders.Solid.code, {});
let kdoutlinefilter = StandalonePatched ? new PIXI.filters.OutlineFilter(2, 0xffffff, 0.1, 0.5, true) : undefined;
//let kdVisionBlurfilter = StandalonePatched ? new PIXI.filters.KawaseBlurFilter(10, 1) : undefined;
if (StandalonePatched) {
	kdgamesound.filters = [kdoutlinefilter];
	//kdgamefog.filters = [kdVisionBlurfilter];
} else {
	kdgamesound.alpha = 0.5;
}

let KDOutlineFilterCache = new Map();

let kdminimap = new PIXI.Graphics();
kdminimap.x = 500;
kdminimap.y = 10;
kdminimap.zIndex = 80;

let kdmapboard = new PIXI.Container();
kdmapboard.zIndex = -2;
kdmapboard.filterArea = new PIXI.Rectangle(0, 0, 2000, 1000);

let kdlightmap = null;
let kdlightmapGFX = null;

let kdbrightnessmap = null;
let kdbrightnessmapGFX = null;

if (StandalonePatched) {
	let res = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
	kdbrightnessmapGFX = new PIXI.Container();
	kdbrightnessmap = PIXI.RenderTexture.create({ width: res > 1 ? 2047 : 2000, height: res > 1 ? 1023 : 1000,});

	kdlightmapGFX = new PIXI.Graphics();
	kdlightmap = PIXI.RenderTexture.create({ width: res > 1 ? 2047 : 2000, height: res > 1 ? 1023 : 1000,});
	//kdlightmapGFX.filterArea = new PIXI.Rectangle(0, 0, 2000, 1000);
}
let kddarkdesaturatefilter = new PIXI.Filter(null, KDShaders.Darkness.code, {
	radius: .02*72/2000,
	weight: 0.24,
	mult: 1.1,
	lum_cutoff: 0.65,
	lum_cutoff_rate: 3.5,
	brightness: 1,
	brightness_rate: 0.7,
	contrast: 1,
	contrast_rate: 0.03,
});
let kdfogfilter = new PIXI.Filter(null, KDShaders.FogFilter.code, {
	lightmap: kdlightmap,
	brightness: 1,
	brightness_rate: 0.,
	contrast: 1,
	contrast_rate: 0.03,
	saturation: 0,
});
//kdfogfilter.resolution = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
let kdgammafilterstore = [1.0];
let kdgammafilter = new PIXI.Filter(null, KDShaders.GammaFilter.code, {
	gamma: kdgammafilterstore,
});
let kdmultiplyfilter = new PIXI.Filter(null, KDShaders.MultiplyFilter.code, {
	lightmap: kdbrightnessmap,
});

let KDBoardFilters = [kdmultiplyfilter, kdfogfilter];

kdmapboard.filters = [
	...KDBoardFilters,
	kdgammafilter,
];


let kdenemyboard = new PIXI.Container();
kdenemyboard.zIndex = 0;
kdenemyboard.sortableChildren = true;
let kdenemystatusboard = new PIXI.Container();
kdenemystatusboard.zIndex = 4;
kdenemystatusboard.sortableChildren = true;
let kdbulletboard = new PIXI.Container();
kdbulletboard.zIndex = 2.3;
kdbulletboard.sortableChildren = true;
let kdeffecttileboard = new PIXI.Container();
kdeffecttileboard.zIndex = -0.1;
kdeffecttileboard.sortableChildren = true;
let kdUItext = new PIXI.Container();
kdUItext.zIndex = 60;
kdUItext.sortableChildren = true;
let kdstatusboard = new PIXI.Container();
kdstatusboard.zIndex = 5;
kdstatusboard.sortableChildren = true;
let kdfloatercanvas = new PIXI.Container();
kdfloatercanvas.zIndex = 200;
kdfloatercanvas.sortableChildren = false;
kdstatusboard.addChild(kdfloatercanvas);

let kddialoguecanvas = new PIXI.Container();
kddialoguecanvas.zIndex = 60;
kddialoguecanvas.sortableChildren = false;
kdstatusboard.addChild(kddialoguecanvas);
let kdenemydialoguecanvas = new PIXI.Container();
kdenemydialoguecanvas.zIndex = 60;
kdenemydialoguecanvas.sortableChildren = false;
kdstatusboard.addChild(kdenemydialoguecanvas);


let kditemsboard = new PIXI.Container();
kditemsboard.zIndex = -2;
kditemsboard.sortableChildren = false;
let kdwarningboard = new PIXI.Container();
kdwarningboard.zIndex = -0.3;
kdwarningboard.sortableChildren = true;
let kdwarningboardOver = new PIXI.Container();
kdwarningboardOver.zIndex = 2.22;
kdwarningboardOver.sortableChildren = false;
// @ts-ignore
let kdgameboard = new PIXI.Container();
kdgameboard.sortableChildren = true;
kdgameboard.zIndex = -50;
kdgameboard.addChild(kdmapboard);
kdgameboard.addChild(kdwarningboard);
kdgameboard.addChild(kdbulletboard);
kdgameboard.addChild(kdenemyboard);
kdgameboard.addChild(kdeffecttileboard);
kdgameboard.addChild(kdgamesound);
kdgameboard.addChild(kdwarningboardOver);
kdgameboard.addChild(kditemsboard);
// @ts-ignore
let kdui = new PIXI.Graphics();
let kdcanvas = new PIXI.Container();
kdcanvas.sortableChildren = true;
kdcanvas.addChild(kdstatusboard);
kdcanvas.addChild(kdenemystatusboard);
kdcanvas.addChild(kdUItext);
kdcanvas.addChild(kdminimap);


//kdcanvas.addChild(new PIXI.Sprite(kdlightmap));

let statusOffset = 0;

kdgameboard.addChild(kdgamefogsmooth);
kdgameboard.addChild(kdgamefogsmoothDark);

if (StandalonePatched) {

	statusOffset -= 20;
	kdgameboard.addChild(kdgamefog);
	//kdgameboard.addChild(kdgamefogmask);
	kdcanvas.addChild(kdgameboard);

}


let kdparticles = new PIXI.Container();
kdparticles.zIndex = 10;
kdparticles.sortableChildren = false;
kdcanvas.addChild(kdparticles);
//kdgameboard.addChild(kdparticles);

let KDTextWhite = "#ffffff";
let KDTextGray3 = "#aaaaaa";
let KDTextTan = "#d6cbc5";
let KDTextGray2 = "#333333";
let KDTextGray1 = "#111111";
let KDTextGray05 = "#030303";
let KDTextGray0 = "#000000";
let KDTextGreen1 = "#001100";
let KDTextBlue1 = "#000011";
let KDTextRed1 = "#110000";
let KDCurseColor = "#ff55aa";
let KDGoodColor = "#77ff99";

/**
 * @type {Map<string, boolean>}
 */
let kdSpritesDrawn = new Map();

/**
 * @type {Map<string, any>}
 */
let kdlightsprites = new Map();
/**
 * @type {Map<string, any>}
 */
let kdpixisprites = new Map();
/**
 * @type {Map<string, any>}
 */
let kdminimapsprites = new Map();
/**
 * @type {Map<string, any>}
 */
let kdpixifogsprites = new Map();
/**
 * @type {Map<string, any>}
 */
let kdpixibrisprites = new Map();



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


/** @type KDSprites */
const KDSprites = {
	"5": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Sprite) return tile.Sprite;
		return "Floor";
	},
	"6": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Sprite) return tile.Sprite;
		return "Wall";
	},
	"1": (x, y, Fog, noReplace) => {
		if (KDWallVert(x, y, noReplace))
			return "WallVert";
		return "Wall";
	},
	"2": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	"3": (x, y, Fog, noReplace) => {
		return Fog ? "Doodad" : "MimicBlock";
	},
	"b": (x, y, Fog, noReplace) => {
		if (KDWallVertAbove(x, y, noReplace))
			return KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "BarsVertCont" : "BarsVert";
		return "Bars";
	},
	"X": (x, y, Fog, noReplace) => {
		return "Doodad";
	},
	"4": (x, y, Fog, noReplace) => {
		if (KDWallVert(x, y, noReplace))
			return "WallVert";
		return "Wall";
	},
	"L": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y)) {
			let furn = KinkyDungeonTilesGet(x + "," + y).Furniture ? KDFurniture[KinkyDungeonTilesGet(x + "," + y).Furniture] : "";
			if (furn) {
				return furn.floor;
			}
		}
		return "Barrel";
	},
	"F": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"?": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"/": (x, y, Fog, noReplace) => {
		return "RubbleLooted";
	},
	",": (x, y, Fog, noReplace) => {
		if (KDWallVert(x, y, noReplace))
			return "WallVert";
		return "Wall";
	},
	"D": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y)?.DoorSkin) {
			if (KDWallVertBoth(x, y, noReplace)) return "Floor";
			return "Wall";
		}
		if (Fog) {
			if (KDMapData.TilesMemory[x + "," + y]) return KDMapData.TilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertCont" : "DoorVert";
		else KDMapData.TilesMemory[x + "," + y] = "Door";
		return KDMapData.TilesMemory[x + "," + y];
	},
	"d": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y)?.DoorSkin) {
			if (KDWallVertBoth(x, y, noReplace)) return "Floor";
			return "Wall";
		}
		if (Fog) {
			if (KDMapData.TilesMemory[x + "," + y]) return KDMapData.TilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertOpenCont" : "DoorVertOpen";
		else KDMapData.TilesMemory[x + "," + y] = "DoorOpen";
		return KDMapData.TilesMemory[x + "," + y];
	},
	"Z": (x, y, Fog, noReplace) => {
		if (Fog) {
			if (KDMapData.TilesMemory[x + "," + y]) return KDMapData.TilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertCont" : "DoorVert";
		else KDMapData.TilesMemory[x + "," + y] = "Door";
		return KDMapData.TilesMemory[x + "," + y];
	},
	"z": (x, y, Fog, noReplace) => {
		if (Fog) {
			if (KDMapData.TilesMemory[x + "," + y]) return KDMapData.TilesMemory[x + "," + y];
		}
		if (KDWallVertBoth(x, y, noReplace))
			KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertOpenCont" : "DoorVertOpen";
		else KDMapData.TilesMemory[x + "," + y] = "DoorOpen";
		return KDMapData.TilesMemory[x + "," + y];
	},
	"a": (x, y, Fog, noReplace) => {
		return "ShrineBroken";
	},
	"A": (x, y, Fog, noReplace) => {
		return (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Type == "Shrine" && KinkyDungeonTilesGet(x + "," + y).Name == "Commerce") ? "ShrineC" : (
			(KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).drunk) ? "ShrineEmpty" : "Shrine"
		);
	},
	"H": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"s": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"S": (x, y, Fog, noReplace) => {
		return "Floor";
	},
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
	"r": (x, y, Fog, noReplace) => {
		return "RubbleLooted";
	},
	"T": (x, y, Fog, noReplace) => {
		return (KinkyDungeonBlindLevel > 0) ?"Floor" : "Trap";
	},
	"Y": (x, y, Fog, noReplace) => {
		return "Doodad";
	},
	"R": (x, y, Fog, noReplace) => {
		return "RubbleLooted";
	},
	"m": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	"M": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	"O": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	"P": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	"p": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	"o": (x, y, Fog, noReplace) => {
		return "OrbEmpty";
	},
	"w": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"W": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"]": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"[": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"=": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	"+": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	"-": (x, y, Fog, noReplace) => {
		return "Brickwork";
	},
	"l": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	";": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"V": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"v": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"t": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"u": (x, y, Fog, noReplace) => {
		return "Floor";
	},
	"N": (x, y, Fog, noReplace) => {
		return "Floor";
	},
};

/** @type KDSprites */
const KDOverlays = {
	"5": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Overlay) return tile.Overlay;
		return "";
	},
	"6": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Overlay) return tile.Overlay;
		return "";
	},
	"Z": (x, y, Fog, noReplace) => {
		return "Signal/AutoLock";
	},
	"H": (x, y, Fog, noReplace) => {
		return "StairsDown";
	},
	"s": (x, y, Fog, noReplace) => {
		return "StairsDown";
	},
	"S": (x, y, Fog, noReplace) => {
		return "StairsUp";
	},
	"-": (x, y, Fog, noReplace) => {
		return "ChargerSpent";
	},
	"l": (x, y, Fog, noReplace) => {
		return "Leyline";
	},
	";": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile?.Portal) return tile.Portal;
		return "";
	},
	"+": (x, y, Fog, noReplace) => {
		return "Charger";
	},
	"=": (x, y, Fog, noReplace) => {
		return "ChargerCrystal";
	},
	"Y": (x, y, Fog, noReplace) => {
		return "Rubble";
	},
	"/": (x, y, Fog, noReplace) => {
		return "Scrap";
	},
	"R": (x, y, Fog, noReplace) => {
		return "Rubble";
	},
	"$": (x, y, Fog, noReplace) => {
		return "Angel";
	},
	"m": (x, y, Fog, noReplace) => {
		return "TabletSpent";
	},
	"M": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y) && !Object.keys(KinkyDungeonGoddessRep).includes(KinkyDungeonTilesGet(x + "," + y).Name)) return "Tablet" + KinkyDungeonTilesGet(x + "," + y).Name;
		return "Tablet";
	},
	"[": (x, y, Fog, noReplace) => {
		return "Spores";
	},
	"]": (x, y, Fog, noReplace) => {
		return "HappyGas";
	},
	"w": (x, y, Fog, noReplace) => {
		return "Water";
	},
	"W": (x, y, Fog, noReplace) => {
		return "Water";
	},
	"O": (x, y, Fog, noReplace) => {
		return "Orb";
	},
	"P": (x, y, Fog, noReplace) => {
		return "Perk";
	},
	",": (x, y, Fog, noReplace) => {
		return "HookLow";
	},
	"?": (x, y, Fog, noReplace) => {
		return "HookHigh";
	},
	"B": (x, y, Fog, noReplace) => {
		return "Bed";
	},
	"G": (x, y, Fog, noReplace) => {
		let sprite = "Ghost";
		if (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Msg || KinkyDungeonTilesGet(x + "," + y).Dialogue)) {
			sprite = "GhostImportant";
		}
		return sprite;
	},
	"L": (x, y, Fog, noReplace) => {
		if (KinkyDungeonTilesGet(x + "," + y)) {
			let furn = KinkyDungeonTilesGet(x + "," + y).Furniture ? KDFurniture[KinkyDungeonTilesGet(x + "," + y).Furniture] : "";
			if (furn) {
				return furn.sprite;
			}
		}
	},
	"F": (x, y, Fog, noReplace) => {
		let sprite = "Table";
		if (KinkyDungeonTilesGet(x + "," + y)) {
			let table = "Table";
			if (KinkyDungeonTilesGet(x + "," + y).Food) {
				sprite = table + KinkyDungeonTilesGet(x + "," + y).Food;
			}
		}
		return sprite;
	},
	"4": (x, y, Fog, noReplace) => {
		let left = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x - 1, y));
		let right = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x + 1, y));
		let up = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x, y - 1));
		let down = KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x, y + 1));
		if (down) {
			return "Crack";
		} else if (up) {
			return "CrackHoriz";
		} else if (left && right) {
			return "CrackVert";
		} else if (left) {
			return "CrackLeft";
		} else if (right) {
			return "CrackRight";
		}
		return "CrackNone";
	},



	"c": (x, y, Fog, noReplace) => {
		return (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "gold" || KinkyDungeonTilesGet(x + "," + y).Loot == "lessergold")) ? "ChestGoldOpen" :
		((KinkyDungeonTilesGet(x + "," + y) && (KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot])) ? KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot] + "Open" :
			((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "blue")) ? "ChestBlueOpen" :
			((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "dark")) ? "ChestDarkOpen" :
			((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "pearl" || KinkyDungeonTilesGet(x + "," + y).Loot == "lesserpearl")) ? "ChestPearlOpen" : "ChestOpen"))));
	},

	"C": (x, y, Fog, noReplace) => {
		return (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "gold" || KinkyDungeonTilesGet(x + "," + y).Loot == "lessergold")) ? "ChestGold" :
		((KinkyDungeonTilesGet(x + "," + y) && (KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot])) ? KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot] :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "blue")) ? "ChestBlue" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "dark")) ? "ChestDark" :
		((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "pearl" || KinkyDungeonTilesGet(x + "," + y).Loot == "lesserpearl")) ? "ChestPearl" : "Chest"))));
	},


	"@": (x, y, Fog, noReplace) => {
		return "Signal/Button";
	},
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
	"v": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + "," + y);
		if (tile) {
			let tU = KinkyDungeonTilesGet(x + "," + (y - 1));
			let tD = KinkyDungeonTilesGet(x + "," + (y + 1));
			let tR = KinkyDungeonTilesGet((x + 1) + "," + y);
			let tL = KinkyDungeonTilesGet((x - 1) + "," + y);

			let sprite = "";

			if (tile.DY == -1) {
				if (tD?.DY == -1) return "Conveyor/SafetyUp";
				if (tL?.DX == 1 && tR?.DX == -1) sprite = sprite + "LeftRight";
				else if (tL?.DX == 1) sprite = sprite + "Right";
				else if (tR?.DX == -1) sprite = sprite + "Left";
				sprite = sprite + "Up";
			} else if (tile.DY == 1) {
				if (tU?.DY == 1) return "Conveyor/SafetyDown";
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


			return "Conveyor/Safety" + sprite;
		}
		return "Conveyor/Conveyor";
	},
	"t": (x, y, Fog, noReplace) => {
		return "DollTerminal";
	},
	"u": (x, y, Fog, noReplace) => {
		return "DollSupply";
	},
	"N": (x, y, Fog, noReplace) => {
		let tile = KinkyDungeonTilesGet(x + ',' + y);
		let tileAbove = KinkyDungeonMapGet(x, y - 1);
		let tileBelow = KinkyDungeonMapGet(x, y + 1);
		if ((tileAbove == 'V' || tileAbove == 'v') && KinkyDungeonTilesGet(x + "," + (y-1))?.DY == 1) {
			return `BondageMachine/${tile.Binding || "Latex"}Vert`;
		} else if ((tileBelow == 'V' || tileBelow == 'v') && KinkyDungeonTilesGet(x + "," + (y+1))?.DY == -1) {
			return `BondageMachine/${tile.Binding || "Latex"}Vert`;
		}


		return `BondageMachine/${tile.Binding || "Latex"}Horiz`;
	},

	"D": (x, y, Fog, noReplace) => {
		let ds = KinkyDungeonTilesGet(x + "," + y)?.DoorSkin;
		if (ds) {
			if (Fog) {
				if (KDMapData.TilesMemory[x + "," + y]) return KDMapData.TilesMemory[x + "," + y];
			}
			if (KDWallVertBoth(x, y, noReplace))
				KDMapData.TilesMemory[x + "," + y] = ds + (KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertCont" : "DoorVert");
			else KDMapData.TilesMemory[x + "," + y] = ds + "Door";
			return KDMapData.TilesMemory[x + "," + y];
		}
		return "";
	},
	"d": (x, y, Fog, noReplace) => {
		let ds = KinkyDungeonTilesGet(x + "," + y)?.DoorSkin;
		if (ds) {
			if (Fog) {
				if (KDMapData.TilesMemory[x + "," + y]) return KDMapData.TilesMemory[x + "," + y];
			}
			if (KDWallVertBoth(x, y, noReplace))
				KDMapData.TilesMemory[x + "," + y] = ds + (KDChainablePillar.includes(KinkyDungeonMapGet(x, y-1)) ? "DoorVertOpenCont" : "DoorVertOpen");
			else KDMapData.TilesMemory[x + "," + y] = ds + "DoorOpen";
			return KDMapData.TilesMemory[x + "," + y];
		}
		return "";
	},
};

/** @type KDSprites */
const KDOverlays2 = {
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
	"v": (x, y, Fog, noReplace) => {
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
			return "Conveyor/Safety" + sprite;
		}
		return "";
	},
	"W": (x, y, Fog, noReplace) => {
		return "WaterFoam";
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
	return sprite;
}

let KDSpecialChests = {
	"silver" : "ChestSilver",
	"shadow" : "ChestShadow",
	"lessershadow" : "ChestShadow",
	"kitty" : "Chests/Kitty",
	"robot" : "Chests/Robot",
};

/**
 * @type {Record<string, number>}
 */
let KDLastKeyTime = {
};


// Draw function for the game portion
function KinkyDungeonDrawGame() {
	if (KDToggles.ZoomIn) {
		KinkyDungeonGridSizeDisplay = 100;
	} else if (KDToggles.ZoomOut) {
		KinkyDungeonGridSizeDisplay = 50;
	} else KinkyDungeonGridSizeDisplay = 72;

	// Breath the sound outlines
	if (StandalonePatched)
		kdoutlinefilter.alpha = 0.5 + 0.1 * Math.sin(2 * Math.PI * (CommonTime() % 2000 / 2000) );
	KDButtonHovering = false;

	let tooltips = [];

	if (KDPatched && KinkyDungeonDrawState == "Restart") {
		DrawTextFitKD(TextGet("KinkyDungeon") + " v" + TextGet("KDVersionStr"), 1990, 50, 200, "#ffffff", KDTextGray2, undefined, "right");
	}
	KDDrawMinimap(1990-KDMinimapWCurrent, 25);
	KDDrawPartyMembers(500 + ((KDToggles.BuffSide && !KDToggleShowAllBuffs) ? 60 : 0), Math.min(500, KDMinimapHeight()+81), tooltips);

	if (StandalonePatched)
		PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;



	if (!KinkyDungeonFlags.get("lastAuto") && KinkyDungeonStatsChoice.get("saveMode")) {
		KinkyDungeonSetFlag("lastAuto", Math.floor(50 + KDRandom() * 50));
		KinkyDungeonSaveGame();
	}

	if (KDRefresh) {
		CharacterRefresh(KinkyDungeonPlayer);
	}
	KDNaked = false;
	KDRefresh = false;


	if ((KinkyDungeonGameKey.keyPressed[9]) && !KinkyDungeonDrawStatesModal.includes(KinkyDungeonDrawState)) {
		// @ts-ignore
		if (document.activeElement && (document.activeElement?.type == "text" || document.activeElement?.type == "textarea" || KDFocusableTextFields.includes(document.activeElement.id))) {
			KinkyDungeonGameKey.keyPressed[9] = false;
		} else {
			if (KinkyDungeonDrawState == "Magic") {
				KinkyDungeonDrawState = "MagicSpells";
				KinkyDungeonGameKey.keyPressed[9] = false;
				KinkyDungeonKeybindingCurrentKey = '';
				KinkyDungeonInspect = false;
			} else if (KDConfigHotbar) {
				KDConfigHotbar = false;
				KinkyDungeonGameKey.keyPressed[9] = false;
				KinkyDungeonKeybindingCurrentKey = '';
				KinkyDungeonInspect = false;
			} else {
				KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
				KDPlayerSetPose = false;
				KinkyDungeonInspect = false;
				KinkyDungeonUpdateLightGrid = true;
				KinkyDungeonDrawState = "Game";
				KinkyDungeonMessageToggle = false;
				KinkyDungeonTargetingSpell = null;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				KinkyDungeonSpellPress = "";
				KDModalArea = false;
				KDSetFocusControl("");
				KDCloseQuickInv();
				KDRepSelectionMode = "";
				KinkyDungeonGameKey.keyPressed[9] = false;
				KinkyDungeonKeybindingCurrentKey = '';
				KinkyDungeonCheckClothesLoss = true;
				KinkyDungeonDressPlayer();
			}
		}
	}

	KinkyDungeonCapStats();

	if (ChatRoomChatLog.length > 0) {
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

	if (KinkyDungeonDrawState == "Game") {
		let tooltip = "";
		if ((KinkyDungeonIsPlayer() || (KinkyDungeonGameData && CommonTime() < KinkyDungeonNextDataLastTimeReceived + KinkyDungeonNextDataLastTimeReceivedTimeout))) {


			KinkyDungeonUpdateVisualPosition(KinkyDungeonPlayerEntity, KinkyDungeonDrawDelta);

			if (!KinkyDungeonInspect) {
				KDInspectCamera.x = KinkyDungeonPlayerEntity.x;
				KDInspectCamera.y = KinkyDungeonPlayerEntity.y;
			}
			let OX = KDInspectCamera.x - (KinkyDungeonPlayerEntity.x||0);
			let OY = KDInspectCamera.y - (KinkyDungeonPlayerEntity.y||0);

			let CamX = KinkyDungeonPlayerEntity.x - (KDToggles.Center ? 0 : 2) - Math.floor(KinkyDungeonGridWidthDisplay/2) + OX;//Math.max(0, Math.min(KDMapData.GridWidth - KinkyDungeonGridWidthDisplay, KinkyDungeonPlayerEntity.x - Math.floor(KinkyDungeonGridWidthDisplay/2)));
			let CamY = KinkyDungeonPlayerEntity.y - Math.floor(KinkyDungeonGridHeightDisplay/2) + OY;// Math.max(0, Math.min(KDMapData.GridHeight - KinkyDungeonGridHeightDisplay, KinkyDungeonPlayerEntity.y - Math.floor(KinkyDungeonGridHeightDisplay/2)));


			let CamX_offsetVis = (KinkyDungeonInspect ? KDInspectCamera.x : KinkyDungeonPlayerEntity.visual_x) - (KDToggles.Center ? 0 : 2) - Math.floor(KinkyDungeonGridWidthDisplay/2) - CamX;//Math.max(0, Math.min(KDMapData.GridWidth - KinkyDungeonGridWidthDisplay, KinkyDungeonPlayerEntity.visual_x - Math.floor(KinkyDungeonGridWidthDisplay/2))) - CamX;
			let CamY_offsetVis = (KinkyDungeonInspect ? KDInspectCamera.y : KinkyDungeonPlayerEntity.visual_y) - Math.floor(KinkyDungeonGridHeightDisplay/2) - CamY;//Math.max(0, Math.min(KDMapData.GridHeight - KinkyDungeonGridHeightDisplay, KinkyDungeonPlayerEntity.visual_y - Math.floor(KinkyDungeonGridHeightDisplay/2))) - CamY;




			KinkyDungeonCamXVis = CamX + CamX_offsetVis;
			KinkyDungeonCamYVis = CamY + CamY_offsetVis;

			if (CamX_offsetVis || CamY_offsetVis) {
				KDRedrawFog = 2;
			}

			if (StandalonePatched) {
				kdgameboard.x = (-CamX_offsetVis) * KinkyDungeonGridSizeDisplay;
				kdgameboard.y = (-CamY_offsetVis) * KinkyDungeonGridSizeDisplay;
				kdbrightnessmapGFX.x = (-CamX_offsetVis) * KinkyDungeonGridSizeDisplay;
				kdbrightnessmapGFX.y = (-CamY_offsetVis) * KinkyDungeonGridSizeDisplay;
				kdlightmapGFX.x = (-CamX_offsetVis) * KinkyDungeonGridSizeDisplay;
				kdlightmapGFX.y = (-CamY_offsetVis) * KinkyDungeonGridSizeDisplay;
				kdenemystatusboard.x = kdgameboard.x;
				kdenemystatusboard.y = kdgameboard.y;
				kdenemydialoguecanvas.x = kdgameboard.x;
				kdenemydialoguecanvas.y = kdgameboard.y;

			}

			let CamX_offset = (StandalonePatched ? 0 : CamX_offsetVis);
			let CamY_offset = (StandalonePatched ? 0 : CamY_offsetVis);



			KinkyDungeonCamX = CamX;
			KinkyDungeonCamY = CamY;
			let KinkyDungeonForceRender = "";

			let data = {
				CamX: CamX,
				CamY: CamY,
				CamX_offsetVis: CamX_offsetVis,
				CamY_offsetVis: CamY_offsetVis,
				delta: KDDrawDelta,
				tooltips: tooltips,
			};

			KinkyDungeonSetMoveDirection();

			if (KinkyDungeonCanvas) {
				KinkyDungeonContext.fillStyle = "rgba(0,0,0.0,1.0)";
				KinkyDungeonContext.fillRect(0, 0, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height);
				KinkyDungeonContext.fill();
				let spriteRes = KDDrawMap(CamX, CamY, CamX_offset, CamY_offset, CamX_offsetVis, CamY_offsetVis, KDDebugOverlay);

				// Get lighting grid
				if (KinkyDungeonUpdateLightGrid) {
					KDUpdateFog = true;
					KDUpdateVision(CamX, CamY, CamX_offset, CamY_offset);
				}
				// Draw fog of war
				let CamPos = {x: CamX, y: CamY};
				if (CamPos.x != KDLastCamPos.x || CamPos.y != KDLastCamPos.y) KDUpdateFog = true;
				KDLastCamPos = CamPos;

				// Draw fog of war

				KDDrawFog(CamX, CamY, CamX_offset, CamY_offset, CamX_offsetVis, CamY_offsetVis);

				tooltip = spriteRes.tooltip;
				KinkyDungeonForceRender = spriteRes.KinkyDungeonForceRender;


				KDDrawEffectTiles(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);

				if (KDToggles.PlayerAura && (KDToggles.ForceWarnings || KDMouseInPlayableArea())) {
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
							if (b && b.aura && b.duration > 0 && !(b.aurasprite == "Null")) {
								aura_scale += 1/aura_scale_max;
								let s = aura_scale;
								if (b.noAuraColor) {
									KDDraw(kdstatusboard, kdpixisprites, b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
										(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
										(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
										KinkyDungeonSpriteSize * (1 + s), KinkyDungeonSpriteSize * (1 + s), undefined, {
											zIndex: 2.1,
										});
								} else {
									KDDraw(kdstatusboard, kdpixisprites, b.id, KinkyDungeonRootDirectory + "Aura/" + (b.aurasprite ? b.aurasprite : "Aura") + ".png",
										(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
										(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s,
										KinkyDungeonSpriteSize * (1 + s), KinkyDungeonSpriteSize * (1 + s), undefined, {
											tint: string2hex(b.aura),
											zIndex: 2.1,
										});
								}

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
					KDDraw(kdstatusboard, kdpixisprites, "player", "playertex",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: 0.01,
						});
				}

				if ((KDGameData.MovePoints < 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel") > 0) && KinkyDungeonSlowLevel < 10) {
					KDDraw(kdstatusboard, kdpixisprites, "c_slow", KinkyDungeonRootDirectory + "Conditions/Slow.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonStatBlind > 0) {
					KDDraw(kdstatusboard, kdpixisprites, "c_stun", KinkyDungeonRootDirectory + "Conditions/Stun.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonStatFreeze > 0) {
					KDDraw(kdstatusboard, kdpixisprites, "c_freeze", KinkyDungeonRootDirectory + "Conditions/Freeze.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonStatBind > 0) {
					KDDraw(kdstatusboard, kdpixisprites, "c_bind", KinkyDungeonRootDirectory + "Conditions/Bind.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak") > 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection") > 0) {
					KDDraw(kdstatusboard, kdpixisprites, "c_sneak", KinkyDungeonRootDirectory + "Conditions/Sneak.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 30 + statusOffset,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}
				if (KDToggles.PlayerAura && (KDToggles.ForceWarnings || KDMouseInPlayableArea())) {
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") > 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackAcc") > 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_buff", KinkyDungeonRootDirectory + "Conditions/Buff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					}
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") < 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackAcc") < 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_dbuff", KinkyDungeonRootDirectory + "Conditions/Debuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					}
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Evasion") > 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_eva", KinkyDungeonRootDirectory + "Conditions/EvasionBuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					}
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Block") > 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_blk", KinkyDungeonRootDirectory + "Conditions/BlockBuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					}
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist") > 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_shield", KinkyDungeonRootDirectory + "Conditions/ShieldBuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 0.01,
							});
					}
					else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist") < 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_shield", KinkyDungeonRootDirectory + "Conditions/ShieldDeuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 0.01,
							});
					}
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor") > 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_arm", KinkyDungeonRootDirectory + "Conditions/ArmorBuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					} else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor") < 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_armd", KinkyDungeonRootDirectory + "Conditions/ArmorDebuff.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					}
					if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageAmp") > 0) {
						KDDraw(kdstatusboard, kdpixisprites, "c_amp", KinkyDungeonRootDirectory + "Conditions/DamageAmp.png",
							(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
							(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay + statusOffset,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
					}
				}
				if (!KDCanAttack()) {
					KDDraw(kdstatusboard, kdpixisprites, "c_cantAttack", KinkyDungeonRootDirectory + "Conditions/Tired.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay * 0.5 + statusOffset,
						KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
				}

				KinkyDungeonDrawFight(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
				KinkyDungeonDrawEnemiesWarning(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
				KinkyDungeonDrawEnemies(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);
				KinkyDungeonDrawEnemiesStatus(canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset);


				KinkyDungeonSendEvent("draw",{update: KDDrawUpdate, CamX:CamX, CamY:CamY, CamX_offset: StandalonePatched ? CamX_offsetVis : CamX_offset, CamY_offset: StandalonePatched ? CamY_offsetVis : CamY_offset});
				KDDrawUpdate = 0;
				KinkyDungeonSuppressSprint = false;


				// Draw targeting reticule
				if (!KinkyDungeonMessageToggle && !KDIsAutoAction() && !KinkyDungeonShowInventory && KinkyDungeonIsPlayer()
					&& KDMouseInPlayableArea()) {
					if (KinkyDungeonInspect) {
						KinkyDungeonSetTargetLocation();

						KDDraw(kdstatusboard, kdpixisprites, "ui_spellreticule", KinkyDungeonRootDirectory + "TargetSpell.png",
							(KinkyDungeonTargetX - CamX)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 100,
							});
					} else if (KinkyDungeonTargetingSpell) {
						KinkyDungeonSetTargetLocation();

						KDDraw(kdstatusboard, kdpixisprites, "ui_spellreticule", KinkyDungeonRootDirectory + "TargetSpell.png",
							(KinkyDungeonTargetX - CamX)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 100,
							});

						DrawTextKD(TextGet("KDCasting").replace("SPNME", TextGet("KinkyDungeonSpell" + KinkyDungeonTargetingSpell.name)),
							(KinkyDungeonTargetX - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY - 0.5)*KinkyDungeonGridSizeDisplay,
							"#8888ff"
						);

						let spellRange = KinkyDungeonTargetingSpell.range * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "spellRange"));

						let spellValid = (x, y, projAimOverride) => {
							let free = KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(x, y)) || KinkyDungeonVisionGet(x, y) < 0.1;
							if (!KinkyDungeonTargetingSpell.projectileTargeting && !KinkyDungeonTargetingSpell.CastInDark && !KinkyDungeonVisionGet(x, y)) return false;
							let Valid = (!KinkyDungeonTargetingSpell.castCondition
								|| (!KDPlayerCastConditions[KinkyDungeonTargetingSpell.castCondition] || KDPlayerCastConditions[KinkyDungeonTargetingSpell.castCondition](KinkyDungeonPlayerEntity, x, y)))
								&& (
									((!projAimOverride && KinkyDungeonTargetingSpell.projectileTargeting)
									|| spellRange >= Math.sqrt((x - KinkyDungeonPlayerEntity.x) *(x - KinkyDungeonPlayerEntity.x) + (y - KinkyDungeonPlayerEntity.y) * (y - KinkyDungeonPlayerEntity.y)))
									&& (KinkyDungeonTargetingSpell.projectileTargeting || KinkyDungeonTargetingSpell.CastInWalls || free)
									&& (!KinkyDungeonTargetingSpell.WallsOnly || !KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(x, y))));
							if (KinkyDungeonTargetingSpell.noTargetEnemies) {
								let enemy = KinkyDungeonEnemyAt(x, y);
								let faction = KDGetFaction(enemy);
								if (enemy && (!KinkyDungeonTargetingSpell.exceptionFactions || !KinkyDungeonTargetingSpell.exceptionFactions.includes(faction)))
									Valid = false;
							}
							if (KinkyDungeonTargetingSpell.noTargetAllies) {
								let enemy = KinkyDungeonEnemyAt(x, y);
								if (enemy && KDAllied(enemy))
									Valid = false;
							}
							if (KinkyDungeonTargetingSpell.selfTargetOnly && (KinkyDungeonPlayerEntity.x != x || KinkyDungeonPlayerEntity.y != y)) Valid = false;
							if ((KinkyDungeonTargetingSpell.requireLOS || (projAimOverride && KinkyDungeonTargetingSpell.projectileTargeting
								&& (!KinkyDungeonTargetingSpell.piercing
									&& !KinkyDungeonTargetingSpell.noTerrainHit)
							)) &&
								!KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, x, y,
									true, true, 1, true)) Valid = false;
							if (KinkyDungeonTargetingSpell.noTargetPlayer && KinkyDungeonPlayerEntity.x == x && KinkyDungeonPlayerEntity.y == y) Valid = false;
							if (KinkyDungeonTargetingSpell.mustTarget && KinkyDungeonNoEnemy(x, y, true)) Valid = false;
							if (KinkyDungeonTargetingSpell.minRange && KDistEuclidean(x - KinkyDungeonPlayerEntity.x, y - KinkyDungeonPlayerEntity.y) < KinkyDungeonTargetingSpell.minRange) Valid = false;

							return Valid;
						};

						KinkyDungeonSpellValid = spellValid(KinkyDungeonTargetX, KinkyDungeonTargetY);

						if (KDToggles.ShowSpellRange ) {
							for (let X = 0; X < KinkyDungeonGridWidthDisplay; X++) {
								for (let Y = 0; Y < KinkyDungeonGridHeightDisplay; Y++) {
									let XX = X + CamX;
									let YY = Y + CamY;
									if (KDIsInBounds(XX, YY, 1)) {
										if (spellValid(XX, YY, true)) {
											KDDraw(kdstatusboard, kdpixisprites, XX + "," + YY + "_range", KinkyDungeonRootDirectory + "SpellRange.png",
												(X)*KinkyDungeonGridSizeDisplay, (Y)*KinkyDungeonGridSizeDisplay,
												KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
													zIndex: 98,
												});
										}
									}

								}
							}
						}

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
										KDDraw(kdstatusboard, kdpixisprites, xx + "," + yy + "_target", KinkyDungeonRootDirectory + "Target.png",
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
											AOECondition(KinkyDungeonTargetX, KinkyDungeonTargetY, xxx, yyy, rad, KinkyDungeonTargetingSpell.aoetype || "", KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)
										)
											KDDraw(kdstatusboard, kdpixisprites, xxx + "," + yyy + "_target", KinkyDungeonRootDirectory + "Target.png",
												(xxx - CamX)*KinkyDungeonGridSizeDisplay, (yyy - CamY)*KinkyDungeonGridSizeDisplay,
												KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
													zIndex: 99,
												});
							}

					} else if ((KinkyDungeonFastMove && !(!KinkyDungeonSuppressSprint && KinkyDungeonToggleAutoSprint && KDCanSprint()) && (KinkyDungeonMoveDirection.x != 0 || KinkyDungeonMoveDirection.y != 0))) {
						KinkyDungeonSetTargetLocation();


						let allowFog = KDAllowFog();
						if (KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0 || (allowFog && KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0)
							|| KDistChebyshev(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x, KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) < 1.5) {
							KDDraw(kdstatusboard, kdpixisprites, "ui_movereticule", KinkyDungeonRootDirectory + "Target" + KDGetTargetRetType(KinkyDungeonTargetX, KinkyDungeonTargetY) + ".png",
								(KinkyDungeonTargetX - CamX)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
									zIndex: 100,
								});
							if (KinkyDungeonSlowLevel < 10) {
								//if (!KinkyDungeonEnemyAt(KinkyDungeonTargetX, KinkyDungeonTargetY)
								//|| KDCanPassEnemy(KinkyDungeonPlayerEntity, KinkyDungeonEnemyAt(KinkyDungeonTargetX, KinkyDungeonTargetY))) {
								let diststart = Math.max(1, Math.round(KinkyDungeonSlowLevel));
								let dist = diststart;
								//let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false);
								let requireLight = KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0;
								let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY,
									true, false, false, KinkyDungeonMovableTilesEnemy, requireLight, false, true,
									undefined, false, undefined, false, true);
								if (path?.length > 1) {
									dist *= path.length;
								}
								if (KDGameData.MovePoints < 0) {
									if (path?.length > 1) {
										dist -= Math.min(0, KDGameData.MovePoints + 1);
									} else dist = 1 - KDGameData.MovePoints;
								} else if (!KDToggles.LazyWalk) {
									if (path?.length > 1) {
										dist -= Math.max(0, diststart - 1);
									} else dist = 1;
								}
								dist = Math.ceil(Math.max(0, dist));
								DrawTextKD("x" + dist, (KinkyDungeonTargetX - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY + 0.5)*KinkyDungeonGridSizeDisplay, "#ffaa44");
								if (path && KDToggles.ShowPath)
									for (let p of path) {
										if (p.x != KinkyDungeonTargetX || p.y != KinkyDungeonTargetY)
											KDDraw(kdstatusboard, kdpixisprites, `ui_movereticule_${p.x},${p.y}`, KinkyDungeonRootDirectory + "UI/PathDisplay.png",
												(p.x - CamX)*KinkyDungeonGridSizeDisplay, (p.y - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
													zIndex: 100,
												});
									}
								//}
							}
						}
					} else if ((mouseDown && KDMouseInPlayableArea()) || (KinkyDungeonMoveDirection.x != 0 || KinkyDungeonMoveDirection.y != 0)) {
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
									KDDraw(kdstatusboard, kdpixisprites, "ui_movesprint", KinkyDungeonRootDirectory + "Sprint.png",
										(newX - CamX)*KinkyDungeonGridSizeDisplay, (newY - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
											zIndex: 99,
										});
									xx = newX;
									yy = newY;
								}
							}
						} else if ((KinkyDungeonSlowLevel > 1 || KDGameData.MovePoints < 0) && KinkyDungeonSlowLevel < 10) {
							if (!KinkyDungeonEnemyAt(xx, yy) || KDCanPassEnemy(KinkyDungeonPlayerEntity, KinkyDungeonEnemyAt(xx, yy))) {
								let dist = Math.max(1, Math.round(KinkyDungeonSlowLevel));

								if (KDGameData.MovePoints < 0) {
									dist = 1 - KDGameData.MovePoints;
								} else if (!KDToggles.LazyWalk) dist = 1;
								dist = Math.ceil(Math.max(0, dist));
								DrawTextKD("x" + dist, (xx - CamX + 0.5)*KinkyDungeonGridSizeDisplay, (yy - CamY + 0.5)*KinkyDungeonGridSizeDisplay, "#ffaa44");
							}
						}
						KDDraw(kdstatusboard, kdpixisprites, "ui_movereticule", KinkyDungeonRootDirectory + "Target" + KDGetTargetRetType(xx, yy) + ".png",
							(xx - CamX)*KinkyDungeonGridSizeDisplay, (yy - CamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								zIndex: 100,
							});

					}
				}


				let cursorX = Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
				let cursorY = Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;
				if (KinkyDungeonVisionGet(cursorX, cursorY) > 0 || tooltips.length > 0) {

					let ambushTile = "";
					let enemy = KinkyDungeonEnemyAt(cursorX, cursorY);
					if (enemy && KDCanSeeEnemy(KinkyDungeonEnemyAt(cursorX, cursorY))) {
						if (!enemy.ambushtrigger && KDAIType[KDGetAI(KinkyDungeonEnemyAt(cursorX, cursorY))]?.ambushtile) {
							ambushTile = KDAIType[KDGetAI(enemy)].ambushtile;
						} else {
							tooltips.push((offset) => KDDrawEnemyTooltip(enemy, offset));
						}


					}
					let items = KDMapData.GroundItems.filter((item) => {return item.x == cursorX && item.y == cursorY;});
					if (items.length > 0) {
						tooltips.push((offset) => KDDrawItemsTooltip(items, offset));
					}

					let eTiles = KDGetEffectTiles(cursorX, cursorY);
					for (let etile of Object.values(eTiles)) {
						if (KDEffectTileTooltips[etile.name] && KDCanSeeEffectTile(etile)) {
							tooltips.push((offset) => KDDrawEffectTileTooltip(etile, cursorX, cursorY, offset));
						}
					}
					let tile = ambushTile || KinkyDungeonMapGet(cursorX, cursorY);
					if (KDTileTooltips[tile] && (KinkyDungeonInspect || KDTileTooltips[tile](cursorX, cursorY).noInspect)) {
						tooltips.push((offset) => KDDrawTileTooltip(tile, cursorX, cursorY, offset));
					}
				}

				let tooltipOffset = KDFocusControls ? 70 : 0;
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
					KDDraw(kdstatusboard, kdpixisprites, "ui_lock", KinkyDungeonRootDirectory + "Lock.png",
						(KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis)*KinkyDungeonGridSizeDisplay,
						(KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 60,
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



			}

			if (StandalonePatched) {
				if (KDBGColor) {
					FillRectKD(kdcanvas, kdpixisprites, "playerbg", {
						Left: 0,
						Top: 0,
						Width: 500,
						Height: 1000,
						Color: KDBGColor,
						zIndex: -1,
						alpha: StandalonePatched ? KDUIAlpha : 0.01,
					});
				}
				DrawCharacter(KinkyDungeonPlayer, 0, 0, 1, undefined, undefined, undefined, undefined, undefined, KDToggles.FlipPlayer);

			}
			if (KinkyDungeonSleepiness) {
				CharacterSetFacialExpression(KinkyDungeonPlayer, "Emoticon", "Sleep");
			} else CharacterSetFacialExpression(KinkyDungeonPlayer, "Emoticon", null);

			// Draw the player no matter what
			if (!StandalonePatched) {
				KinkyDungeonContextPlayer.clearRect(0, 0, KinkyDungeonCanvasPlayer.width, KinkyDungeonCanvasPlayer.height);
				DrawCharacter(KinkyDungeonPlayer, -KinkyDungeonGridSizeDisplay/2, (KinkyDungeonPlayer.HeightModifier || 0)/3.5,
					KinkyDungeonGridSizeDisplay/250, false,
					KinkyDungeonContextPlayer);
			} else {
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
						canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay + (KinkyDungeonGridSizeDisplay/4),
						canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offsetVis)*KinkyDungeonGridSizeDisplay + (KinkyDungeonGridSizeDisplay/6),
						zoom, false, undefined, PIXI.SCALE_MODES.NEAREST, mods, undefined, KDFlipPlayer, ["Sprite"]);
			}

			if (KDToggles.ShowFacing && (KinkyDungeonPlayerEntity.facing_y || KinkyDungeonPlayerEntity.facing_x)) {
				KDDraw(kdstatusboard, kdpixisprites, "ui_playerfacing", KinkyDungeonRootDirectory + "UI/PlayerFacing.png",
					(KinkyDungeonPlayerEntity.x + KinkyDungeonPlayerEntity.facing_x - CamX + 0.5)*KinkyDungeonGridSizeDisplay,
					(KinkyDungeonPlayerEntity.y + KinkyDungeonPlayerEntity.facing_y - CamY + 0.5)*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, Math.atan2(KinkyDungeonPlayerEntity.facing_y, KinkyDungeonPlayerEntity.facing_x), {
						zIndex: 100,
						anchorx: 0.5,
						anchory: 0.5,
					});
			}


			KinkyDungeonDrawEnemiesHP(KDDrawDelta || 0, canvasOffsetX, canvasOffsetY, CamX+CamX_offset, CamY+CamY_offset,
				StandalonePatched ? CamX_offsetVis : 0, StandalonePatched ? CamY_offsetVis : 0);
			KinkyDungeonDrawFloaters(CamX+CamX_offsetVis, CamY+CamY_offsetVis);

			if (KinkyDungeonCanvas) {
				if (KDToggles.ForceWarnings || KDMouseInPlayableArea()) {
					let barInt = 0;
					if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax*0.99) {
						if (KinkyDungeonStatStamina != undefined && !(KinkyDungeonPlayerEntity.visual_stamina == KinkyDungeonStatStamina)) {
							KinkyDungeonPlayerEntity.visual_stamina = KDEaseValue(KDDrawDelta || 0, (KinkyDungeonPlayerEntity.visual_stamina != undefined ? KinkyDungeonPlayerEntity.visual_stamina : KinkyDungeonStatStaminaMax), KinkyDungeonStatStamina, KDBarAdvanceRate, KDBarAdvanceRateMin * KinkyDungeonStatStaminaMax);
						}
						KinkyDungeonBar(canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 12 - 13 * barInt,
							KinkyDungeonGridSizeDisplay, 8, 100 * KinkyDungeonPlayerEntity.visual_stamina / KinkyDungeonStatStaminaMax, !KDCanAttack() ? "#ff5555" : "#44ff44", KDTextGray0);
						barInt += 1;
					}
					if (KinkyDungeonStatMana < KinkyDungeonStatManaMax*0.99 || KinkyDungeonTargetingSpell || KDFlashMana > 0) {
						KDFlashMana = Math.max(0, KDFlashMana - KDDrawDelta);
						if (KinkyDungeonStatMana != undefined && !(KinkyDungeonPlayerEntity.visual_mana == KinkyDungeonStatMana)) {
							KinkyDungeonPlayerEntity.visual_mana = KDEaseValue(KDDrawDelta || 0, (KinkyDungeonPlayerEntity.visual_mana != undefined ? KinkyDungeonPlayerEntity.visual_mana : KinkyDungeonStatManaMax), KinkyDungeonStatMana, KDBarAdvanceRate, KDBarAdvanceRateMin * KinkyDungeonStatManaMax);
						}
						KinkyDungeonBar(canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 12 - 13 * barInt,
							KinkyDungeonGridSizeDisplay, 8, 100 * KinkyDungeonPlayerEntity.visual_mana / KinkyDungeonStatManaMax, (KDFlashMana > 0 || (KinkyDungeonTargetingSpell && KinkyDungeonStatMana <
								KinkyDungeonGetManaCost(
									KinkyDungeonTargetingSpell,
									!KinkyDungeonTargetingSpell.active && KinkyDungeonTargetingSpell.passive,
									!KinkyDungeonTargetingSpell.active && KinkyDungeonTargetingSpell.type == "passive"))) ?
								(KDFlashMana % 500 > 250 ? "#ffffff" : "#888888") : "#8888ff", (KDFlashMana % 500 > 250 ? "#444444" : KDTextGray0));
						barInt += 1;
					}
				}
				/*for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
					if (b && b.aura && b.duration > 0 && b.duration < 999) {
						if (!b.maxduration) b.maxduration = b.duration;
						KinkyDungeonBar(canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offsetVis)*KinkyDungeonGridSizeDisplay - 12 - 13 * barInt,
							KinkyDungeonGridSizeDisplay, 12, 100 * b.duration / b.maxduration, b.aura, KDTextGray0);
						barInt += 1;
					}
				}*/




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
								pixirendererKD = new PIXI.CanvasRenderer({
									width: KinkyDungeonCanvas.width,
									height: KinkyDungeonCanvas.height,
									view: KinkyDungeonCanvas,
									antialias: true,
								});
							}
						}

					}
					MainCanvas.drawImage(KinkyDungeonCanvas, canvasOffsetX, canvasOffsetY);
					DrawCharacter(KinkyDungeonPlayer, 0, 0, 1);
				}

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
						KinkyDungeonBar(canvasOffsetX + xAdd + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay, canvasOffsetY + yAdd + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - 24,
							KinkyDungeonGridSizeDisplay, 12, Math.max(7, Math.min(100, 100 * (value + value2))), color, KDTextGray0);
					if (value2 && value <= 1) {
						KinkyDungeonBar(canvasOffsetX + xAdd + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay, canvasOffsetY + yAdd + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offset)*KinkyDungeonGridSizeDisplay - 24,
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
				DrawTextFitKDTo(kddialoguecanvas, KinkyDungeonPlayerEntity.dialogue,
					canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX-CamX_offsetVis)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2,
					yboost + canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY-CamY_offsetVis)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/2,
					700, KinkyDungeonPlayerEntity.dialogueColor, KDTextGray0, 24);
			}


			KDModalArea_x = 600;
			KDModalArea_y = 700;
			KDModalArea_width = 800;
			KDModalArea_height = 100;

			KinkyDungeonDrawInterface(KinkyDungeonIsPlayer());

			if (KDGameData.CurrentDialog) {
				KDDrawDialogue(KinkyDungeonDrawDelta);
			}

			KinkyDungeonDrawMessages();

			// Draw the quick inventory
			if (KDShowQuickInv()) {
				KinkyDungeonDrawQuickInv();
			}

			KinkyDungeonSendEvent("afterDrawFrame", data);
		} else {
			DrawTextKD(TextGet("KinkyDungeonLoading"), 1100, 500, "#ffffff", KDTextGray2);
			if (CommonTime() > KinkyDungeonGameDataNullTimerTime + KinkyDungeonGameDataNullTimer) {
				ServerSend("ChatRoomChat", { Content: "RequestFullKinkyDungeonData", Type: "Hidden", Target: KinkyDungeonPlayerCharacter.MemberNumber });
				KinkyDungeonGameDataNullTimerTime = CommonTime();
			}
		}
	} else if (KinkyDungeonDrawState == "Orb") {
		KinkyDungeonDrawOrb();
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
	} else if (KinkyDungeonDrawState == "PerkOrb") {
		KinkyDungeonDrawPerkOrb();
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
	} else if (KinkyDungeonDrawState == "Heart") {
		KinkyDungeonDrawHeart();
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
	} else if (KinkyDungeonDrawState == "Magic") {
		KDDrawNavBar(-2);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		//DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 165, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");
		KinkyDungeonDrawMagic();
	} else if (KinkyDungeonDrawState == "MagicSpells") {
		//DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 165, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");
		KDDrawNavBar(2);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		KinkyDungeonDrawMagicSpells();
	} else if (KinkyDungeonDrawState == "Inventory") {
		//DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 165, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");
		KDDrawNavBar(1);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		KinkyDungeonDrawInventory();
	} else if (KinkyDungeonDrawState == "Logbook") {
		KDDrawNavBar(3);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		//DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 165, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");
		KinkyDungeonDrawLore();
	} else if (KinkyDungeonDrawState == "Quest") {
		KDDrawNavBar(3);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		KinkyDungeonDrawQuest();
	} else if (KinkyDungeonDrawState == "Collection") {
		KDDrawNavBar(3);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		KinkyDungeonDrawCollection();
	} else if (KinkyDungeonDrawState == "Reputation") {
		//DrawButtonKDEx("return", (bdata) => {KinkyDungeonDrawState = "Game"; return true;}, true, KDReturnButtonXX, 925, 165, 60, TextGet("KinkyDungeonGame"), "#ffffff", "", "");
		KDDrawNavBar(3);
		if (KDGameData.PlayerName) {
			DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
		}
		KinkyDungeonDrawReputation();
	} else if (KinkyDungeonDrawState == "Restart") {
		KDDrawNavBar(0);
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
				DrawCheckboxVis(1100, 90, 64, 64, "Changeable Perks", KDDebugPerks, false, "#ffffff");
				DrawCheckboxVis(1100, 160, 64, 64, "Unlimited Gold", KDDebugGold, false, "#ffffff");
				DrawCheckboxVis(1100, 230, 64, 64, "Link Under", KDDebugLink, false, "#ffffff");
				ElementPosition("DebugEnemy", 1650, 52, 300, 64);
				DrawButtonVis(1500, 100, 100, 64, "Enemy", "#ffffff", "");
				DrawButtonVis(1600, 100, 100, 64, "Ally", "#ffffff", "");
				DrawButtonVis(1700, 100, 100, 64, "Shop", "#ffffff", "");
				ElementPosition("DebugItem", 1650, 212, 300, 64);
				DrawButtonVis(1500, 260, 300, 64, "Add to inventory", "#ffffff", "");
				DrawButtonVis(1100, 300, 300, 64, "Teleport to stairs", "#ffffff", "");
				DrawButtonVis(1500, 320, 300, 64, "Get save code", "#ffffff", "");
				DrawButtonVis(1100, 370, 300, 64, "Enter parole mode", "#ffffff", "");

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
				DrawButtonKDEx("debugaddallrest", (bdata) => {
					// eslint-disable-next-line no-unused-vars
					for (let r of KinkyDungeonRestraints) {
						if (!KinkyDungeonInventoryGetLoose(r.name))
							KinkyDungeonInventoryAddLoose(r.name);
					}
					return true;
				}, true, 600, 560, 300, 64, "Add all restraints", "#ffffff", "");
				DrawButtonKDEx("debugIncFloor", (bdata) => {
					MiniGameKinkyDungeonLevel += 1;
					KDGameData.JourneyY += 1;
					return true;
				}, true, 600, 640, 300, 64, "Increment Floor", "#ffffff", "");
				DrawButtonKDEx("debugHeart", (bdata) => {
					KDMapData.GroundItems.push({x:KinkyDungeonPlayerEntity.x, y:KinkyDungeonPlayerEntity.y, name: "Heart"});
					return true;
				}, true, 600, 720, 300, 64, "Spawn amulet", "#ffffff", "");


			}
		}


		DrawTextFitKD(TextGet("KinkyDungeonRestartConfirm"), 1250, 400, 1000, "#ffffff", "#333333");
		DrawButtonVis(975, 550, 550, 64, TextGet("KinkyDungeonRestartNo"), "#ffffff", "");
		DrawButtonVis(975, 650, 550, 64, TextGet("KinkyDungeonRestartQuitNoErase"), "#ffffff", "");
		DrawButtonVis(975, 800, 550, 64, TextGet("KinkyDungeonRestartCapture" + (KDConfirmDeleteSave ? "Confirm" : "")),  (KDGameData.PrisonerState == 'jail' || !KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)) ? "Pink" : "#ffffff", "");
		DrawButtonVis(975, 900, 550, 64, TextGet("KinkyDungeonRestartYes" + (KDConfirmDeleteSave ? "Confirm" : "")), "#ffffff", "");
		DrawButtonVis(1650, 900, 300, 64, TextGet("KinkyDungeonCheckPerks"), "#ffffff", "");

		/*DrawButtonKDEx("GameConfigKeys", () => {
			KinkyDungeonState = "Keybindings";
			if (!KinkyDungeonKeybindings)
				KDSetDefaultKeybindings();
			else {
				KinkyDungeonKeybindingsTemp = {};
				Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			}
			return true;
		}, true, 975, 450, 260, 64, TextGet("GameConfigKeys"), "#ffffff", "");*/
		DrawButtonKDEx("GameToggles", () => {
			KinkyDungeonState = "Toggles";
			return true;
		}, true, 1265, 450, 260, 64, TextGet("GameToggles"), "#ffffff", "");

	} else if (KinkyDungeonDrawState == "Perks2") {
		KinkyDungeonDrawPerks(!KDDebugPerks);
		DrawButtonVis(1650, 920, 300, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		if (!KDClipboardDisabled)
			DrawButtonKDEx("copyperks", (bdata) => {
				let txt = "";
				for (let k of KinkyDungeonStatsChoice.keys()) {
					if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "\n" : "") + k;
				}
				navigator.clipboard.writeText(txt);
				return true;
			}, true, 1400, 930, 200, 54, TextGet("KinkyDungeonCopyPerks"), "#ffffff", "");
		else {
			let CF = KDTextField("KDCopyPerks", 1400, 930, 200, 54, undefined, undefined, "10000");
			if (CF.Created) {
				let txt = "";
				for (let k of KinkyDungeonStatsChoice.keys()) {
					if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "|" : "") + k;
				}
				ElementValue("KDCopyPerks", txt);
			}
		}
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
		} else if (KDToggles.StunFlash && (KinkyDungeonFlags.get("playerStun"))) {
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


	if (!KDPatched)
		DrawButtonVis(1885, 25, 90, 90, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Exit.png");


	if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
		if (KinkyDungeonKeybindingCurrentKey)
			KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
		KinkyDungeonKeybindingCurrentKey = '';
	}

	if (KinkyDungeonDrawState == "Game")
		KinkyDungeonListenKeyMove();

	KDProcessInputs();

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

	if (StandalonePatched)
		PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
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
let KDFloaterSpacing = 18 / KinkyDungeonGridSizeDisplay;

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

	let KDFloaterYCache = {};
	let max = 40;
	let i = 0;
	let floatermult = 1.5; // Global tweak value
	if (delta > 0) {
		for (let floater of KinkyDungeonFloaters) {
			floater.t += floatermult * delta/1000;
			if (i > max) break;
			i += 1;
		}
	}
	let newFloaters = [];
	i = 0;
	for (let floater of KinkyDungeonFloaters.reverse()) {
		if (i <= max) {
			let x = floater.override ? floater.x : canvasOffsetX + (floater.x - CamX)*KinkyDungeonGridSizeDisplay;
			let y = (floater.override ? floater.y : canvasOffsetY + (floater.y - CamY)*KinkyDungeonGridSizeDisplay);
			let overlap = false;
			let overlapAmount = 9;
			for (let iii = -overlapAmount; iii < overlapAmount; iii += 2) {
				if (KDFloaterYCache[Math.round(y + iii)]) {
					overlap = true;
				}
			}
			let ii = 0;
			let direction = -1;
			while ( overlap && ii < 60) {
				floater.y -= (floater.override ? 4 : 4/KinkyDungeonGridSizeDisplay) * direction;
				//floater.x += -20 + Math.random() * 40;
				x = floater.override ? floater.x : canvasOffsetX + (floater.x - CamX)*KinkyDungeonGridSizeDisplay;
				y = (floater.override ? floater.y : canvasOffsetY + (floater.y - CamY)*KinkyDungeonGridSizeDisplay);
				overlap = false;
				for (let iii = -overlapAmount; iii < overlapAmount; iii += 2) {
					if (KDFloaterYCache[Math.round(y + iii)]) {
						overlap = true;
					}
				}
				ii += 1;
			}
			for (let iii = -overlapAmount; iii < overlapAmount; iii++) {
				KDFloaterYCache[Math.round(y + iii)] = true;
			}

			DrawTextFitKDTo(kdfloatercanvas, floater.text,
				x, y - floater.speed*floater.t/floatermult,
				1000, floater.color, KDTextGray1, 24, undefined, undefined, KDEase(floater.t / floater.lifetime));
		}
		if (floater.t < floater.lifetime) newFloaters.push(floater);
		i += 1;
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
let KDLogTopPad = 25;

let KDLogIndex = 0;
let KDLogIndexInc = 3;

let KDMsgWidth = 800;
let KDMsgWidthMin = 800;
let KDMsgX = 720;
let KDMsgFadeTime = 10;

let KDMaxConsoleMsg = 6;

function KinkyDungeonDrawMessages(NoLog) {
	if (!NoLog)
		DrawButtonKDEx("logtog", (bdata) => {
			KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle;
			KDLogIndex = 0;
			return true;
		}, true, KDMsgWidthMin + KDMsgX + 70, 4, 52, 52, "", "#ffffff",
		KinkyDungeonRootDirectory + (KinkyDungeonMessageToggle ? "UI/LogUp.png" : "UI/LogDown.png"), undefined, undefined, !KinkyDungeonMessageToggle, undefined, undefined, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[0]),
			hotkeyPress: KinkyDungeonKeyToggle[0],
			scaleImage: true,
		});
	if (!KinkyDungeonMessageToggle || NoLog) {
		let i = 0;
		if (!MouseIn(KDMsgX + (KDMsgWidth - KDMsgWidthMin)/2, 0, KDMsgWidthMin, 62 + KDLogDist*(2 + KDMaxConsoleMsg)) || KinkyDungeonDrawState != "Game") {
			let msg2nd = [];
			let ignoreMSG = [];
			let spacing = KDLogDist;
			if (KinkyDungeonActionMessageTime > 0 && KinkyDungeonActionMessageNoPush) {
				DrawTextFitKD(KinkyDungeonActionMessage, KDMsgX + KDMsgWidth/2, 15 + spacing * i, KDMsgWidthMin, KinkyDungeonActionMessageColor, KDTextGray1, KDMSGFontSize);
				ignoreMSG.push(KinkyDungeonActionMessage);
				i++;
			}
			if (KinkyDungeonTextMessageTime > 0 && KinkyDungeonTextMessageNoPush) {
				DrawTextFitKD(KinkyDungeonTextMessage, KDMsgX + KDMsgWidth/2, 15 + spacing * i, KDMsgWidthMin, KinkyDungeonTextMessageColor, KDTextGray1, KDMSGFontSize);
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
						DrawTextFitKD(msg.text, KDMsgX + KDMsgWidth/2, 15 + spacing * i, KDMsgWidthMin, msg.color, KDTextGray1, KDMSGFontSize, undefined, undefined, alphamin + (1 - alphamin) * alpha); i++;
					}
				}
			}

		}
		if (i > 0)
			FillRectKD(kdcanvas, kdpixisprites, "msglogbg", {
				Left: KDMsgX + (KDMsgWidth - KDMsgWidthMin)/2,
				Top: 0,
				Width: KDMsgWidthMin,
				Height: 22 + KDLogDist*(i),
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
			DrawTextFitKD(log.text, KDMsgX + KDMsgWidth/2, KDLogTopPad + i * KDLogDist + KDLogDist/2, KDMsgWidth, col, KDTextGray1, KDMSGFontSize, undefined, 101);
		}
		if (KinkyDungeonMessageLog.length > KDMaxLog) {
			DrawButtonKDEx("logscrollup", (bdata) => {
				if (KDLogIndex > 0)
					KDLogIndex = Math.max(0, KDLogIndex - KDLogIndexInc);
				return true;
			}, true, 1500, 20, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png");
			//KDMsgX + KDMsgWidth/2 - 45, KDLogTopPad + KDLogHeight + 10
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
		if (Entity.Enemy && KinkyDungeonVisionGet(Entity.x, Entity.y) > 0) {
			let ret = KDAnimEnemy(Entity);
			offX = ret.offX;
			offY = ret.offY;
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
	//let OX = KDInspectCamera.x - (KinkyDungeonPlayerEntity.x||0);
	//let OY = KDInspectCamera.y - (KinkyDungeonPlayerEntity.y||0);
	KinkyDungeonTargetX = Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + (KinkyDungeonCamX);
	KinkyDungeonTargetY = Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + (KinkyDungeonCamY);
}

function KDGetMoveDirection() {
	let tx = //(MouseX - ((KinkyDungeonPlayerEntity.x - KinkyDungeonCamX)*KinkyDungeonGridSizeDisplay + canvasOffsetX + KinkyDungeonGridSizeDisplay / 2))/KinkyDungeonGridSizeDisplay
		Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
	let ty = //(MouseY - ((KinkyDungeonPlayerEntity.y - KinkyDungeonCamY)*KinkyDungeonGridSizeDisplay + canvasOffsetY + KinkyDungeonGridSizeDisplay / 2))/KinkyDungeonGridSizeDisplay)
		Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;

	return {x: tx, y: ty};
}

/**
 * Sets the move direction based on MOUSE location
 */
function KinkyDungeonSetMoveDirection() {

	let point = KDGetMoveDirection();

	KDSendInput("setMoveDirection", {dir: KinkyDungeonGetDirection(
		point.x - KinkyDungeonPlayerEntity.x,
		point.y - KinkyDungeonPlayerEntity.y)}, true, true);

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
	DrawBoxKDTo(kdcanvas, Left, Top, Width, Height, Color, NoBorder, Alpha, zIndex);
}

/**
 * Draws a box component
 * @param {any} Container - Container to draw to
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
function DrawBoxKDTo(Container, Left, Top, Width, Height, Color, NoBorder, Alpha, zIndex = 90) {
	FillRectKD(Container || kdcanvas, kdpixisprites, "box" + Left + "," + Top + "," + Width + "," + Height + Color + zIndex, {
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
		DrawRectKD(Container || kdcanvas, kdpixisprites, "boxBorder" + Left + "," + Top + "," + Width + "," + Height + zIndex, {
			Left: Left,
			Top: Top,
			Width: Width,
			Height: Height,
			Color: KDBorderColor,
			LineWidth: 2,
			zIndex: zIndex + 0.004,
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
 * @param {boolean} [unique] - This button is not differentiated by position
 */
function DrawTextFitKD(Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined, unique = undefined) {
	DrawTextFitKDTo(kdcanvas, Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex, alpha, border, unique);
}

/**
 *
 * @param {any} Container
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
 * @param {boolean} [unique] - This button is not differentiated by position
 */
function DrawTextFitKDTo(Container, Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined, unique = undefined) {
	if (!Text) return;
	let alignment = Align ? Align : "center";

	DrawTextVisKD(Container || kdcanvas, kdpixisprites, Text + (!unique ? "," + X + "," + Y : "_unique"), {
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
		unique: unique,
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
 * @param {{Text: string, X: number, Y: number, Width?: number, Color: string, BackColor: string, FontSize?: number, align?: string, zIndex?: number, alpha?: number, border?: number, unique?: boolean}} Params
 * @returns {boolean} - If it worked
 */
function DrawTextVisKD(Container, Map, id, Params) {
	if (!KDAllowText) return;
	let sprite = Map.get(id);
	let same = true;
	let par = kdprimitiveparams.get(id);
	if (sprite && par) {
		for (let p of Object.entries(kdprimitiveparams.get(id))) {
			if (Params[p[0]] != p[1] && ((p[0] != 'X' && p[0] != 'Y') || !Params.unique)) {
				same = false;
				//if (!Params.unique)
				//console.log(p)
				break;
			}
		}
		for (let p of Object.entries(Params)) {
			if (par[p[0]] != p[1] && ((p[0] != 'X' && p[0] != 'Y') || !Params.unique)) {
				same = false;
				//if (!Params.unique)
				//console.log(p)
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

		//console.log(Params)
		if (Params.Width) {
			sprite.scale.x = Math.min(1, Params.Width / Math.max(1, sprite.width));
			sprite.scale.y = sprite.scale.x;
		}

		sprite.roundPixels = true;
		// Add it to the container
		Map.set(id, sprite);
		Container.addChild(sprite);
		if (!kdprimitiveparams.has(id) || !same)
			kdprimitiveparams.set(id, Params);
	}
	if (sprite) {
		// Modify the sprite according to the params
		sprite.name = id;
		//sprite.cacheAsBitmap = true;
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
 * Draws a hollow circle
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {{Left: number, Top: number, Width: number, Height: number, Color: string, LineWidth: number, zIndex: number, alpha?: number}} Params - rect parameters
 * @returns {boolean} - If it worked
 */
function DrawCircleKD(Container, Map, id, Params) {
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
		sprite.drawCircle(Params.Width/2, Params.Width/2, Params.Width/2);
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
 * Draws a +
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {{Left: number, Top: number, Width: number, Height: number, Color: string, LineWidth: number, zIndex: number, alpha?: number}} Params - rect parameters
 * @returns {boolean} - If it worked
 */
function DrawCrossKD(Container, Map, id, Params) {
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
		let linewidth = Params.LineWidth || 2;
		sprite = new PIXI.Graphics();
		sprite.beginFill(string2hex(Params.Color));
		sprite.drawRect(Params.Width/2 -linewidth/2, 0, linewidth, Params.Height);
		sprite.drawRect(0, Params.Height/2 -linewidth/2, Params.Width, linewidth);
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
 * @param {boolean} [options.scaleImage] - zIndex
 * @param {boolean} [options.centered] - centered
 * @param {boolean} [options.centerText] - centered
 * @param {string} [options.tint] - tint
 * @param {string} [options.hotkey] - hotkey
 * @param {string} [options.hotkeyPress] - hotkey
 * @returns {void} - Nothing
 */
function DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex = 100, options) {
	DrawButtonVisTo(kdcanvas, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex, options);
}


/**
 * Draws a button component
 * @param {any} Container - Container to draw to
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
 * @param {boolean} [options.unique] - This button is not differentiated by position
 * @param {boolean} [options.scaleImage] - zIndex
 * @param {boolean} [options.centered] - centered
 * @param {boolean} [options.centerText] - centered
 * @param {string} [options.tint] - tint
 * @param {string} [options.hotkey] - hotkey
 * @param {string} [options.hotkeyPress] - hotkey
 * @returns {void} - Nothing
 */
function DrawButtonVisTo(Container, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex = 100, options) {
	let hover = ((MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height) && !CommonIsMobile && !Disabled);
	if (!NoBorder || FillColor)
		DrawBoxKDTo(Container, Left, Top, Width, Height,
			FillColor ? FillColor : (hover ? (KDTextGray2) : KDButtonColor),
			NoBorder, options?.alpha || 0.5, zIndex,
		);
	if (hover) {
		let pad = 4;
		// Draw the button rectangle (makes the background color cyan if the mouse is over it)
		DrawRectKD(Container || kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "out", {
			Left: Left + pad,
			Top: Top + pad,
			Width: Width - 2 * pad + 1,
			Height: Height - 2 * pad + 1,
			Color: "#ffffff",
			LineWidth: 2,
			zIndex: zIndex + 0.005,
		});
		KDButtonHovering = true;
	}

	// Draw the text or image
	let textPush = 0;
	if ((Image != null) && (Image != "")) {
		let img = KDTex(Image);
		if (Stretch || options?.scaleImage) {
			let o = {
				zIndex: zIndex + 0.01,
			};
			if (options?.tint) o.tint = options.tint;
			KDDraw(Container || kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height,
				Image, Left, Top, Width, Height, undefined, o);
			/*DrawImageEx(Image, Left, Top, {
				Width: Width,
				Height: Height,
			});*/
		} else {
			let o = {
				zIndex: zIndex + 0.01,
			};
			if (options?.tint) o.tint = options.tint;
			KDDraw(Container || kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height,
			Image, (options?.centered ? Width/2 - img.orig.width/2 : 2) + Left, Top + Height/2 - img.orig.height/2, img.orig.width, img.orig.height, undefined, o);
		}
		textPush = img.orig.width;
	}

	// Draw the tooltip
	if ((HoveringText) && (MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height)) {
		DrawTextFitKDTo(Container || kdcanvas, HoveringText, Left + Width / 2 + (ShiftText ? textPush*0.5 : 0), Top + (Height / 2), Width - 4 - Width*0.04 - (textPush ? (textPush + (ShiftText ? 0 : Width*0.04)) : Width*0.04), "#ffffff", undefined, undefined, undefined, zIndex + 1);
		//DrawHoverElements.push(() => DrawButtonHover(Left, Top, Width, Height, HoveringText));
	} else if (Label)
		DrawTextFitKDTo(Container || kdcanvas, Label, Left + Width / 2 + (ShiftText ? textPush*0.5 : 0), Top + (Height / 2), (options?.centerText) ? Width : (Width - 4 - Width*0.04 - (textPush ? (textPush + (ShiftText ? 0 : Width*0.04)) : Width*0.04)),
			Color,
			(options && options.noTextBG) ? "none" : undefined,
			FontSize, undefined, zIndex + 0.001, undefined, undefined, options?.unique);

	if (options?.hotkey) {
		let size = (FontSize*0.6) || 14;
		DrawTextFitKDTo(Container || kdcanvas, options?.hotkey, Left + Width - 4,
			Top + (size / 2) + 2, Width*0.7,
			'#ffffff',
			(options && options.noTextBG) ? "none" : undefined,
			size, "right", zIndex + 0.02, undefined, undefined);
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
 * @param {number} [options.fontSize] - fontSize
 * @param {boolean} [options.scaleImage] - zIndex
 * @returns {void} - Nothing
 */
function DrawCheckboxKDEx(name, func, enabled, Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = KDTextGray0, CheckImage = "Icons/Checked.png", options) {
	DrawTextFitKD(Text, Left + 10 + Width, Top + Height/2+1, options?.maxWidth || 1000, TextColor, "#333333", options?.fontSize, "left");
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
function KDDrawMap(CamX, CamY, CamX_offset, CamY_offset, CamX_offsetVis, CamY_offsetVis, Debug) {
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
	let drawFloor = altType?.skin ? altType.skin : (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);

	let noReplace = "";
	let noReplace_skin = {};
	for (let tile of Object.values(KDMapData.TilesSkin)) {
		if (tile.skin && noReplace_skin[tile.skin] != undefined) {
			let paramskin = KinkyDungeonMapParams[drawFloor];
			if (paramskin.noReplace)
				noReplace_skin[tile.skin] = paramskin.noReplace;
			else noReplace_skin[tile.skin] = "";
		}
	}

	let params = KinkyDungeonMapParams[drawFloor];
	if (params?.noReplace)
		noReplace = params.noReplace;
	// Draw the grid and tiles
	let rows = KDMapData.Grid.split('\n');
	for (let R = -1; R <= KinkyDungeonGridHeightDisplay + 1; R++)  {
		for (let X = -1; X <= KinkyDungeonGridWidthDisplay + 1; X++)  {
			let RY = R+CamY;
			let RX = X+CamX;
			if (!rows[RY]) continue;
			let allowFog = KDAllowFog();
			if (RY >= 0 && RY < KDMapData.GridHeight && RX >= 0 && RX < KDMapData.GridWidth && (KinkyDungeonVisionGet(RX, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY) > 0))) {
				if (Debug) {
					if (KDCommanderChokes && KDCommanderChokes[RX + "," + RY]) {
						DrawTextFitKD("Choke", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, KinkyDungeonGridSizeDisplay, "#aaaaaA");

					}

					if ( KinkyDungeonTilesGet(RX + "," + RY)) {
						if (KinkyDungeonTilesGet(RX + "," + RY).Lock)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).Lock, (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");
						if (KinkyDungeonTilesGet(RX + "," + RY).MazeBlock)
							DrawTextFitKD("MazeBlock", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + 10, KinkyDungeonGridSizeDisplay, "#aaaaaA");
						if (KinkyDungeonTilesGet(RX + "," + RY).MazeSeed)
							DrawTextFitKD("MazeSeed", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + 10, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).AI)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).AI, (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).Type == "Prisoner")
							DrawTextFitKD("Prisoner", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).required && KinkyDungeonTilesGet(RX + "," + RY).required)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).required[0], (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#aaaaaA");

						if (KinkyDungeonTilesGet(RX + "," + RY).Label && KinkyDungeonTilesGet(RX + "," + RY).required)
							DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).required[0], (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/1.5, KinkyDungeonGridSizeDisplay, "#aaaaaA");
						if (KDMapData.Traffic[RY][RX] && KinkyDungeonState == "Game")
							DrawTextFitKD("traffic_" + KDMapData.Traffic[RY][RX], (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#55ff55");

						if (KinkyDungeonTilesGet(RX + "," + RY).OL)
							DrawTextFitKD("OL", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#ff5555");
						if (KinkyDungeonTilesGet(RX + "," + RY).Jail)
							DrawTextFitKD("Jail", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/5, KinkyDungeonGridSizeDisplay, "#ff5555");
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
					if (KDMapData.Labels)
						for (let k of Object.values(KDMapData.Labels)) {
							for ( let p of k) {
								if (p.x == RX && p.y == RY) {
									DrawTextFitKD(p.name, (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#999999");
									DrawTextFitKD(p.type, (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#999999");
								}
							}
						}
					for (let p of KDGameData.KeyringLocations) {
						if (p.x == RX && p.y == RY) {
							DrawTextFitKD("Keyring", (-CamX_offset + X)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/2, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay/3, KinkyDungeonGridSizeDisplay, "#999999");
						}
					}
				}
				let floor = KDMapData.TilesSkin[RX + "," + RY] ?
					(KDMapData.TilesSkin[RX + "," + RY].force ? KDMapData.TilesSkin[RX + "," + RY].skin : KinkyDungeonMapIndex[KDMapData.TilesSkin[RX + "," + RY].skin] || KDMapData.TilesSkin[RX + "," + RY].skin)
					: drawFloor;
				let vision = KinkyDungeonVisionGet(RX, RY);
				let nR = KDMapData.TilesSkin[RX + "," + RY] ? noReplace : noReplace_skin[floor];
				let code = KinkyDungeonTilesGet(RX + "," + RY)?.SkinCode || rows[RY][RX];
				let sprite = KinkyDungeonGetSprite(code, RX, RY, vision == 0, nR);
				let sprite2 = KinkyDungeonGetSpriteOverlay(code, RX, RY, vision == 0, nR);
				let sprite3 = KinkyDungeonGetSpriteOverlay2(code, RX, RY, vision == 0, nR);
				if (KinkyDungeonForceRender) {
					sprite = KinkyDungeonGetSprite(KinkyDungeonForceRender, RX, RY, vision == 0, nR);
					sprite2 = null;
					sprite3 = null;
				}
				if (KinkyDungeonForceRenderFloor != "") floor = KinkyDungeonForceRenderFloor;
				let lightColor = (StandalonePatched && KDToggles.LightmapFilter) ? 0xffffff : KDGetLightColor(RX, RY);

				KDDraw(kdmapboard, kdpixisprites, RX + "," + RY, KinkyDungeonRootDirectory + "Floors/Floor_" + floor + "/" + sprite + ".png",
					(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
						zIndex: -2,
						tint: (StandalonePatched && KDToggles.LightmapFilter) ? undefined : lightColor,
					});
				if (sprite2)
					KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_o", KinkyDungeonRootDirectory + "FloorGeneric/" + sprite2 + ".png",
						(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: -1.1,
							tint: (StandalonePatched && KDToggles.LightmapFilter) ? undefined : lightColor,
						});

				if (sprite3)
					KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_o2", KinkyDungeonRootDirectory + "FloorGeneric/" + sprite3 + ".png",
						(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
							zIndex: -1,
							tint: (StandalonePatched && KDToggles.LightmapFilter) ? undefined : lightColor,
						});

				if (rows[RY][RX] == "A") {
					let color = "";
					if (KinkyDungeonTilesGet(RX + "," + RY)) {
						color = KDGoddessColor(KinkyDungeonTilesGet(RX + "," + RY).Name);
					}
					if (color)
						KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_a", KinkyDungeonRootDirectory + "ShrineAura.png",
							(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								tint: string2hex(color),
							});
					if (KinkyDungeonTilesGet(RX + "," + RY)?.Quest)
						KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_a2", KinkyDungeonRootDirectory + "ShrineAuraQuest.png",
							(-CamX_offset + X)*KinkyDungeonGridSizeDisplay, (-CamY_offset+R)*KinkyDungeonGridSizeDisplay,
							KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
								tint: color ? string2hex(color) : 0xffffff,
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
 * @param {boolean} [Nearest]
 * @returns {any}
 */
function KDDraw(Container, Map, id, Image, Left, Top, Width, Height, Rotation, options, Centered, SpritesDrawn, Scale, Nearest) {
	let sprite = Map.get(id);
	if (!sprite) {
		// Load the texture
		if (Nearest && StandalonePatched) {
			PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
		}
		let tex = KDTex(Image, Nearest);

		if (tex) {
			// Create the sprite
			if (Nearest)
				sprite = PIXI.Sprite.from(KDTex(Image, Nearest), {
					scaleMode: PIXI.SCALE_MODES.NEAREST,
				});
			else
				sprite = PIXI.Sprite.from(KDTex(Image));
			Map.set(id, sprite);
			// Add it to the container
			Container.addChild(sprite);
		}
		if (Nearest && StandalonePatched) {
			PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
		}
	}
	if (sprite) {
		//sprite.roundPixels = true;
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
					if (o[1] != undefined || o[0] != "tint")
						sprite[o[0]] = o[1];
				}
			}

			if (options.zIndex != undefined) {
				sprite.zIndex = options.zIndex;
			}
			if (options.scalex != undefined) {
				sprite.scale.x = sprite.scale.x * options.scalex;
			}
			if (options.scaley != undefined) {
				sprite.scale.y = sprite.scale.y * options.scaley;
			}
			if (options.anchorx != undefined) {
				if (options.normalizeAnchorX) {
					sprite.anchor.x = options.anchorx * (options.normalizeAnchorX/sprite.texture.width);
				} else {
					sprite.anchor.x = options.anchorx;
				}

			}
			if (options.anchory != undefined) {
				if (options.normalizeAnchorY) {
					sprite.anchor.y = options.anchory * (options.normalizeAnchorY/sprite.texture.height);
				} else {
					sprite.anchor.y = options.anchory;
				}
			}
		}
		if (SpritesDrawn)
			SpritesDrawn.set(id, true);
		else
			kdSpritesDrawn.set(id, true);
		return sprite;
	}
	return null;
}

/**
 * Returns a PIXI.Texture, or null if there isnt one
 * @param {string} Image
 * @returns {any}
 */
function KDTex(Image, Nearest) {
	if (kdpixitex.has(Image)) return kdpixitex.get(Image);
	try {
		let tex = Nearest ? PIXI.Texture.from(KDModFiles[Image] || Image, {scaleMode: PIXI.SCALE_MODES.NEAREST}) : PIXI.Texture.from(KDModFiles[Image] || Image);
		kdpixitex.set(Image, tex);
		return tex;
	} catch (e) {
		console.log("Failed to find texture " + Image);
		return null;
	}
}

/**
 *
 * @param {string} str
 * @returns
 */
function string2hex(str) {
	return PIXI.utils.string2hex(str);
}

function GetAdjacentList(list, index, width) {
	return {
		left: list.slice(0, index),
		right: list.slice(index+width),
	}
}


function KDUpdateVision(CamX, CamY, CamX_offset, CamY_offset) {
	KinkyDungeonUpdateLightGrid = false;
	KDRedrawFog = 2;

	let viewpoints = [ {x: KinkyDungeonPlayerEntity.x, y:KinkyDungeonPlayerEntity.y, brightness: KinkyDungeonDeaf ? 2 : 4 }];

	let data = {
		lights: [],
		maplights: [],
		effecttilelights: [],
	};
	let l = null;
	for (let t of Object.keys(KDMapData.Tiles)) {
		let tile = KinkyDungeonTilesGet(t);
		let x = parseInt(t.split(',')[0]);
		let y = parseInt(t.split(',')[1]);
		if (tile && tile.Light && x && y) {
			l = {x: x, y:y + (tile.Offset ? 1 : 0), y_orig: y, brightness: tile.Light, color: tile.lightColor};
			data.lights.push(l);
			data.maplights.push(l);
		}
	}
	for (let b of KDMapData.Bullets) {
		if (b.bullet?.bulletColor && b.bullet.bulletLight > 0) {
			l = {x: b.x, y:b.y, y_orig: b.y, brightness: b.bullet.bulletLight, color: b.bullet.bulletColor};
			data.lights.push(l);
		}
	}
	for (let location of Object.values(KDMapData.EffectTiles)) {
		for (let tile of Object.values(location)) {
			if (tile.duration > 0) {
				if (tile.lightColor) {
					l = {x: tile.x + Math.round((tile.xoffset - 0.49) || 0), y:tile.y + Math.round((tile.yoffset - 0.49) || 0), y_orig: tile.y, brightness: tile.brightness, color: tile.lightColor};
					data.effecttilelights.push(l);
				}
			}
		}
	}
	KinkyDungeonSendEvent("getLights", data);

	KinkyDungeonMakeBrightnessMap(KDMapData.GridWidth, KDMapData.GridHeight, KDMapData.MapBrightness, data.lights, KDVisionUpdate);
	KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, viewpoints, data.lights, KDVisionUpdate, KDMapData.MapBrightness);
	if (KinkyDungeonUpdateLightGrid) {
		// Do it again!
		KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, viewpoints, data.lights, 0, KDMapData.MapBrightness);
	}

	if (CamX != undefined) {
		if (KDToggles.Bloom && !(KinkyDungeonBlindLevel >= 2)) {
			let pad = (324-KinkyDungeonGridSizeDisplay)/2;
			for (let light of [...data.lights, ...data.maplights, ...data.effecttilelights]) {
				if (!light.nobloom && KinkyDungeonVisionGet(light.x_orig || light.x, light.y_orig || light.y)) {
					KDDraw(kdgameboard, kdlightsprites, `${light.x},${light.y}_${light.brightness}_${light.color || 0xffffff}`,
						KinkyDungeonRootDirectory + "Light.png",
						(light.x - CamX + (light.visualxoffset || 0))*KinkyDungeonGridSizeDisplay - pad,
						(-CamY + light.y + (light.visualyoffset || 0))*KinkyDungeonGridSizeDisplay - pad,
						KinkyDungeonGridSizeDisplay + pad*2, KinkyDungeonGridSizeDisplay + pad*2,
						undefined, {
							tint: light.color || 0xffffff,
							alpha: Math.min(1, (1 - 0.5 * (KDGameData.visionAdjust || 0)) * Math.max(0.001, light.brightness/20)),
							blendMode: PIXI.BLEND_MODES.ADD,
							zIndex: -0.1,
						},
					);
				}
			}
		}

		KDCullSpritesList(kdlightsprites);
	}

	KDVisionUpdate = 0;
}

/**
 * @type {Record<string, (x: number, y: number) => {color: string, text: string, desc?: string, noInspect?: boolean}>}
 */
let KDTileTooltips = {
	'1': () => {return {color: "#aaaaaa", text: "1"};},
	'5': () => {return {color: "#aaaaaa", text: "5"};},
	'6': () => {return {color: "#aaaaaa", text: "6"};},
	'0': () => {return {color: "#444444", text: "0"};},
	'2': () => {return {color: "#444444", text: "2"};},
	'R': () => {return {color: "#ffffff", noInspect: true, text: "R"};},
	'Y': () => {return {color: "#ffffff", noInspect: true, text: "Y"};},
	'L': () => {return {color: "#812913", noInspect: true, text: "L"};},
	'F': () => {return {color: "#812913", noInspect: true, text: "F"};},
	'A': () => {return {color: "#6d89d7", noInspect: true, text: "A"};},
	'a': () => {return {color: "#ffffff", text: "a"};},
	'O': () => {return {color: "#92e8c0", text: "O"};},
	'o': () => {return {color: "#ffffff", text: "o"};},
	'C': (x, y) => {
		let tile = KinkyDungeonTilesGet(x + ',' + y);
		return {color: "#ffee83", noInspect: true, text: tile?.Faction ? "C2" : "C", desc:
			tile?.Faction ? TextGet("KDChestTooltip") + TextGet("KinkyDungeonFaction" + (tile.Faction))
			: undefined};},
	'c': () => {return {color: "#ffffff", text: "c"};},
	'T': () => {return {color: "#444444", text: "T"};},
	'4': () => {return {color: "#ffffff", noInspect: true, text: "4"};},
	'X': () => {return {color: "#aaaaaa", text: "X"};},
	'?': () => {return {color: "#ffffff", noInspect: true, text: "Hook"};},
	',': () => {return {color: "#ffffff", noInspect: true, text: "Hook"};},
	'S': () => {return {color: "#96caff", noInspect: true, text: "S"};},
	's': () => {return {color: "#4c6885", noInspect: true, text: "s"};},
	'H': () => {return {color: "#4c6885", noInspect: true, text: "H"};},
	'G': () => {return {color: "#69bf3e", noInspect: true, text: "G"};},
	'B': () => {return {color: "#4444ff", noInspect: true, text: "B"};},
	'@': () => {return {color: "#ffffff", noInspect: true, text: "@"};},
	'b': () => {return {color: "#aaaaaa", noInspect: true, text: "b"};},
	'D': () => {return {color: "#9c4f3e", noInspect: true, text: "D"};},
	'd': () => {return {color: "#7e4336", noInspect: true, text: "d"};},
	'Z': () => {return {color: "#ffffff", noInspect: true, text: "Z"};},
	'z': () => {return {color: "#ffffff", noInspect: true, text: "z"};},
	't': () => {return {color: "#aa55ff", noInspect: true, text: "t"};},
	'u': () => {return {color: "#ffffff", noInspect: true, text: "u"};},
	'V': () => {return {color: "#ffffff", noInspect: true, text: "V"};},
	'v': () => {return {color: "#ffffff", noInspect: true, text: "v"};},
	'N': () => {return {color: "#4c6885", noInspect: true, text: "N"};},
};

function KDGetTileColor(x, y) {
	let color = "";

	if (!KDIsInBounds(x, y, 0)) return "#000000";
	let eTile = KDGetEffectTiles(x, y);
	let maxPri = -1000;
	let maxTile = null;
	for (let tile of Object.entries(eTile)) {
		if (tile[1].priority > maxPri && KDEffectTileTooltips[tile[0]] && KDCanSeeEffectTile(tile[1])) {
			maxTile = tile[0];
			maxPri = tile[1].priority;
		}
	}

	if (maxTile) {
		color = KDEffectTileTooltips[maxTile].color;
	} else {
		let tile = KinkyDungeonMapGet(x, y);
		if (KDTileTooltips[tile]) {
			color = KDTileTooltips[tile](x, y).color;
		}
	}

	return color || "#444444";
}


function KDDrawTileTooltip(maptile, x, y, offset) {
	let TooltipList = [];
	TooltipList.push({
		str: TextGet("KDTileTooltip" + KDTileTooltips[maptile](x, y).text),
		fg: KDTileTooltips[maptile](x, y).color,
		bg: "#000000",
		size: 24,
		center: true,
	});
	if (KDTileTooltips[maptile](x, y).desc)
	TooltipList.push({
		str: KDTileTooltips[maptile](x, y).desc,
		fg: "#ffffff",
		bg: "#000000",
		size: 18,
		center: true,
	});


	return KDDrawTooltip(TooltipList, offset);
}


/**
 * @type {Record<string, {color: string, code: (tile, x, y, TooltipList) => void}>}
 */
let KDEffectTileTooltips = {
	'Portals/DarkPortal': {
		color: "#8b53e9",
		code: (tile, x, y, TooltipList) => {
			TooltipList.push({
				str: TextGet("KDEffectTileTooltip" + tile.name),
				fg: "#8b53e9",
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
	},
	'Runes': {
		color: "#ff5555",
		code: (tile, x, y, TooltipList) => {
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
		}
	},
	'RunesTrap': {
		color: "#92e8c0",
		code: (tile, x, y, TooltipList) => {
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
		}
	},
	'BoobyTrapMagic': {
		color: "#92e8c0",
		code: (tile, x, y, TooltipList) => {
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
		}
	},
	'BoobyTrap': {
		color: "#ffffff",
		code: (tile, x, y, TooltipList) => {
			TooltipList.push({
				str: TextGet("KDEffectTileTooltip" + tile.name),
				fg: "#ffffff",
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
		}
	},
	'Inferno': {
		color: "#ff8855",
		code: (tile, x, y, TooltipList) => {
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
		}
	},
	'Ember': {
		color: "#ffaa88",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffaa88");}},
	'Ice': {
		color: "#88ffff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#88ffff");}},
	'Water': {
		color: "#8888ff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#8888ff");}},
	'Vines': {
		color: "#44ff44",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#44ff44", "KDEffectTileTooltipCMDBindings");}},
	'Ropes': {
		color: "#ffae70",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffae70", "KDEffectTileTooltipCMDBindings");}},
	'Chains': {
		color: "#aaaaaa",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#aaaaaa", "KDEffectTileTooltipCMDBindings");}},
	'Belts': {
		color: "#8f4d57",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#8f4d57", "KDEffectTileTooltipCMDBindings");}},
	'Fabric': {
		color: "#ff5277",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ff5277", "KDEffectTileTooltipCMDBindings");}},
	'FabricGreen': {
		color: "#63ab3f",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#63ab3f", "KDEffectTileTooltipCMDBindings");}},
	'Slime': {
		color: "#d952ff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#d952ff", "KDEffectTileTooltipCMDSlime");}},
	'Glue': {
		color: "#ffff00",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffff00", "KDEffectTileTooltipCMDGlue");}},
	'Latex': {
		color: "#d952ff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#d952ff");}},
	'LatexThin': {
		color: "#d952ff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#d952ff");}},
	'Steam': {
		color: "#ffffff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'Smoke': {
		color: "#000000",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#888888");}},
	'Torch': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'TorchUnlit': {
		color: "#888888",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'Lantern': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'LanternUnlit': {
		color: "#888888",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'IllusOrb': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'IllusOrbDead': {
		color: "#555555",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'EdgeOrb': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'MotionLamp': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'ManaEmpty': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'ManaPartial': {
		color: "#ffffff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'ManaFull': {
		color: "#ffffff",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'EdgeOrbDead': {
		color: "#555555",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'TorchOrb': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'OrbLantern': {
		color: "#ff8933",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ffffff");}},
	'Cracked': {
		color: "#ff8844",
		code: (tile, x, y, TooltipList) => {KDETileTooltipSimple(tile, TooltipList, "#ff8844");}},
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

/**
 *
 * @param {effectTile} tile
 * @param {number} x
 * @param {number} y
 * @param {number} offset
 * @returns {number}
 */
function KDDrawEffectTileTooltip(tile, x, y, offset) {
	let TooltipList = [];
	KDEffectTileTooltips[tile.name].code(tile, x, y, TooltipList);

	return KDDrawTooltip(TooltipList, offset);
}

/**
 *
 * @param {any[]} TooltipList
 * @param {number} offset
 * @returns {number}
 */
function KDDrawTooltip(TooltipList, offset) {
	let TooltipWidth = 300;
	let TooltipHeight = 0;
	let extra = 5;
	for (let listItem of TooltipList) {
		TooltipHeight += listItem.size + extra;
	}
	TooltipHeight = Math.max(20, TooltipHeight);
	let tooltipX = 2000 - 250 - TooltipWidth;
	let tooltipY = 790 - TooltipHeight - offset;
	let YY = 0;

	FillRectKD(kdcanvas, kdpixisprites, "inspectTooltip" + offset, {
		Left: tooltipX,
		Top: tooltipY - 25,
		Width: TooltipWidth,
		Height: TooltipHeight + 20,
		Color: "#000000",
		LineWidth: 1,
		zIndex: 75,
		alpha: 0.7,
	});

	let pad = 10;

	for (let listItem of TooltipList) {
		DrawTextFitKD(listItem.str,
			tooltipX + (listItem.center ? TooltipWidth/2 : pad),
			tooltipY + YY, TooltipWidth - 2 * pad, listItem.fg, listItem.bg,
			listItem.size, listItem.center ? "center" : "left", 76);
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

	if (!PIXICanvas) PIXICanvas = MainCanvas.canvas;
	const HRatio = (PIXICanvas.clientHeight || PIXICanvas.height || 1000) / 1000;
	const WRatio = (PIXICanvas.clientWidth || PIXICanvas.width || 2000) / 2000;
	const Font = (PIXICanvas.clientWidth || PIXICanvas.width || 1000) <= (PIXICanvas.clientHeight || PIXICanvas.height || 2000) * 2 ?
		(PIXICanvas.clientWidth || PIXICanvas.width || 1000) / 50 : (PIXICanvas.clientHeight || PIXICanvas.height || 2000) / 25;
	const Height = H ? H * HRatio : Font * 1.1;
	const Width = W * WRatio;
	const Top = (PIXICanvas.offsetTop || 0) + Y * HRatio - 4;
	const Left = (PIXICanvas.offsetLeft || 0) + (X) * WRatio + 4;

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
	KDModalArea_y = 430;
	KDModalArea_width = 1000;
	KDModalArea_height = 370;
	KDDrawPoseButtons(C, 700, 580, true, true, true);

}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number} - the color in hex
 */
function KDGetLightColor(x, y) {
	let light = KinkyDungeonBrightnessGet(x, y);
	let color = KDAvgColor(KinkyDungeonColorGet(x, y), KinkyDungeonShadowGet(x, y), light, 1);
	color = KDAvgColor(color, 0xffffff, 1, 0.5); // Brighten
	return color;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number} - the color in hex
 */
function KDGetLightColorGreyscale(x, y) {
	let light = KinkyDungeonBrightnessGet(x, y);
	let color = KDAvgColor(0xaaaaff, 0x030303, light, 1);
	color = KDAvgColor(color, 0xffffff, 1, 0.5); // Brighten
	return color;
}

/**
 *
 * @returns {boolean}
 */
function KDMouseInPlayableArea() {
	return MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)
		&& !MouseIn(0, 0, 500, 1000)
		&& !MouseIn(1940, 0, 70, 1000)
		&& !MouseIn(0, 920, 2000, 100)
		&& !MouseIn(1730, 255, 255, 150)
		&& !KDButtonHovering
		&& (!KDModalArea || !MouseIn(KDModalArea_x, KDModalArea_y, KDModalArea_width, KDModalArea_height))
}

/**
 *
 * @param {string} hotkey
 * @returns {string}
 */
function KDHotkeyToText(hotkey) {
	if (!hotkey) return "---";
	return hotkey.replace("Digit", "").replace("Key", "").replace("Control", "Ctrl");
}



function KDGetTargetRetType(x, y) {
	let enemy = KinkyDungeonEnemyAt(x, y);

	if (enemy) {
		if (KDHostile(enemy) && KinkyDungeonAggressive(enemy)) return "Attack";
		if (!KDHostile(enemy) && KinkyDungeonAggressive(enemy) && KDCanDom(enemy)) return "Sub";
		if (KDCanPassEnemy(KinkyDungeonPlayerEntity, enemy)) return "Pass";
		return "Talk";
	}

	let tile = KinkyDungeonMapGet(x, y);
	if (KinkyDungeonMovableTiles.includes(tile) && !(KinkyDungeonMovableTilesEnemy.includes(tile))) return "Action";
	return "Move";
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} scale
 */
function KDDrawPalettes(x, y, w, scale = 72) {
	let XX = x;
	let YY = y;
	let row = 0;
	let column = 0;
	let spacing = 80;
	/** @type {[string, Record<string, LayerFilter>]} */
	let zero = ["", {Highlight: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}];
	DrawTextFitKD(TextGet("KDSelectPalette"), x + scale*(0.5 + w)/2, y - 36, scale*w, "#ffffff", KDTextGray0, 20);

	for (let value of [zero, ...Object.entries(KinkyDungeonFactionFilters)]) {
		KDDraw(kdcanvas, kdpixisprites, "palette" + value[0], KinkyDungeonRootDirectory + "UI/greyColor.png",
			XX, YY, scale, scale, undefined, {
			filters: [
				new PIXI.filters.AdjustmentFilter(value[1].Highlight),
			]
		});
		DrawButtonKDEx("choosepalette" + value[0], (b) => {
			KDDefaultPalette = value[0];
			localStorage.setItem("KDDefaultPalette", value[0]);
			return true;
		}, true, XX - 3, YY - 3, scale + 7, scale + 7, "", "#ffffff", "", undefined, false, value[0] != KDDefaultPalette, KDButtonColor, undefined, undefined, {
			zIndex: -10,
		}
		);
		DrawTextFitKD(TextGet("KDPalette" + value[0]), XX + scale/2, YY + scale - 12, scale, "#ffffff", KDTextGray0, 18);
		column++;
		if (column >= w) {
			column = 0;
			row++;
			YY += spacing;
			XX = x;
		} else {
			XX += spacing;
		}
	}
}

/**
 *
 * @param {number} color
 * @param {number} alpha
 * @param {number} quality
 * @param {number} thickness
 * @returns {PIXIFilter}
 */
function KDGetOutlineFilter(color, alpha, quality, thickness) {
	if (StandalonePatched) {
		if (!KDOutlineFilterCache.get(`${color}_${alpha}_${quality}`)) {
			KDOutlineFilterCache.set(`${color}_${alpha}_${quality}`, new PIXI.filters.OutlineFilter(thickness, color, quality, alpha, true));
		}
		return KDOutlineFilterCache.get(`${color}_${alpha}_${quality}`);
	}
	return null;
}

function KDClearOutlineFilterCache() {
	for (let f of KDOutlineFilterCache.values()) {
		f.destroy();
	}
	KDOutlineFilterCache = new Map();
}