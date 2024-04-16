"use strict";


let KDMapTilesListEditor = localStorage.getItem("KDMapTilesListEditor") ? JSON.parse(localStorage.getItem("KDMapTilesListEditor")) : Object.assign({}, KDMapTilesList);

let KDTileToTest = null;

// localStorage.setItem("KDMapTilesListEditor", JSON.stringify(KDMapTilesList))

function KDInitTileEditor() {
	KDTE_Create(1, 1);
}

let KDEditorTileIndex = 'lr';
let KDEditorTileFlex = "";
let KDEditorTileFlexSuper = "";

let KDEditorTileIndexQuery = '1,1';

/**
 * @type {Record<string, string>}
 */
let KDEditorTileIndexStore = {
	"1,1": 'lr',
};
/**
 * @type {Record<string, string>}
 */
let KDEditorTileFlexStore = {
};
/**
 * @type {Record<string, string>}
 */
let KDEditorTileFlexSuperStore = {
};

let KDEditorCurrentMapTileName = 'test';
let KDEditorCurrentMapTile = null;

let KDTileIndices = {
	'udlr': true,
	'u': true,
	'd': true,
	'l': true,
	'r': true,
	'ud': true,
	'lr': true,
	'ul': true,
	'ur': true,
	'dl': true,
	'dr': true,
	'udl': true,
	'udr': true,
	'dlr': true,
	'ulr': true,
};

let KDEditorTileIndexHover = '';
let KDEditorTileNameIndex = 0;

let KDEditorTileBrush = 'Clear';
let KDEditorTileBrushIndex = 0;
let KDEditorTileBrushIndex2 = 0;

let KDTilePalette = {
	'Clear': {type: "clear", tile: '0'},
	'Wall': {type: "tile", tile: '1'},
	'----Spawns----': {type: "none"},
	'Spawn': {type: "tile", tile: 'G', special: {Type: "Spawn", required: []}},
	'SpawnGuard': {type: "tile", tile: 'G', special: {Type: "Spawn", required: [], AI: "guard"}},
	'Prisoner': {type: "tile", tile: 'G', special: {Type: "Prisoner"}},
	'SpawnLooseGuard': {type: "tile", tile: 'G', special: {Type: "Spawn", required: [], AI: "looseguard"}},
	'SpawnMiniboss': {type: "tile", tile: 'G', special: {Type: "Spawn", required: ["miniboss"], AI: "guard"}},
	'SpawnBoss': {type: "tile", tile: 'G', special: {Type: "Spawn", required: ["boss"], AI: "guard"}},
	'----SpecifcSpawns----': {type: "none"},
	'SpawnStatue': {type: "tile", tile: '3', special: {Type: "Spawn", required: ["statue"], Label: "Statue"}},
	'SpawnObstacleDoor': {type: "tile", tile: 'G', special: {Type: "ForceSpawn", required: ["obstacledoor"], tags: ["obstacletile"], Label: "Door"}},
	'SpawnSoulCrys': {type: "tile", tile: '3', special: {Type: "Spawn", required: ["soul"], tags: ["soul"], Label: "SoulC"}},
	'SpawnSoulCrysActive': {type: "tile", tile: '3', special: {Type: "Spawn", required: ["soul", "active"], tags: ["soul"], Label: "SoulC_A"}},
	'SpawnChaosCrysRare': {type: "tile", tile: '3', special: {Type: "ForceSpawn", required: ["chaos", "inactive"], tags: ["chaos"], Label: "ChaosC", Chance: 0.4}},
	'SpawnChaosCrys': {type: "tile", tile: '3', special: {Type: "Spawn", required: ["chaos"], tags: ["chaos"], Label: "ChaosC"}},
	'SpawnChaosCrysActive': {type: "tile", tile: '3', special: {Type: "Spawn", required: ["chaos", "active"], tags: ["chaos"], Label: "ChaosC_A"}},
	'SpawnMushroom': {type: "tile", tile: '3', special: {Type: "Spawn", required: ["mushroom", "scenery"], tags: ["mushroom"], Label: "Mushroom"}},
	'SpawnCustom': {type: "tile", tile: '3', special: {Type: "Spawn", required: [], Label: "Custom"}, customfields: {
		required: {type: "array"},
		tags: {type: "array"},
		filterTags: {type: "array"},
		Label: {type: "string"},
		Chance: {type: "number"},
		AI: {type: "string"},
		force: {type: "boolean"},
		faction: {type: "string"},
		levelBoost: {type: "number"},
		forceIndex: {type: "string"},
	}},
	'ForceSpawnCustom': {type: "tile", tile: '3', special: {Type: "ForceSpawn", required: [], Label: "Custom"}, customfields: {
		required: {type: "array"},
		tags: {type: "array"},
		filterTags: {type: "array"},
		Label: {type: "string"},
		Chance: {type: "number"},
		AI: {type: "string"},
		force: {type: "boolean"},
		faction: {type: "string"},
		levelBoost: {type: "number"},
		forceIndex: {type: "string"},
	}},
	'----Tiles----': {type: "none"},
	'Brick': {type: "tile", tile: '2'},
	'Doodad': {type: "tile", tile: 'X'},
	'Grate': {type: "tile", tile: 'g'},
	'Bars': {type: "tile", tile: 'b'},
	'Bed': {type: "tile", tile: 'B'},
	'Crack': {type: "tile", tile: '4'},
	'LatexPipe': {type: "tile", tile: '1', special: {Type: "Skin", Skin: "LatexPipe"}},
	'LatexThin':  {type: "effect", effectTile: "LatexThin"},
	'LatexThinBlue':  {type: "effect", effectTile: "LatexThinBlue"},
	'Latex':  {type: "effect", effectTile: "Latex"},
	'LatexBlue':  {type: "effect", effectTile: "LatexBlue"},
	'WallHook': {type: "tile", tile: ','},
	'CeilingHook': {type: "tile", tile: '?'},
	'----Deco----': {type: "none"},
	'Pipe': {type: "tile", tile: '1', special: {Type: "Skin", Skin: "EmptyPipe"}},
	'InactiveTablet': {type: "tile", tile: 'm'},
	'BrokenShrine': {type: "tile", tile: 'a'},
	'BrokenOrb': {type: "tile", tile: 'o'},
	'BrokenCharger': {type: "tile", tile: '-'},
	'Dummy0': {type: "tile", tile: 'X', special: {Type: "SkinCode", SkinCode: "0", Skin2: "Dummy0"}},
	'Dummy1': {type: "tile", tile: 'X', special: {Type: "SkinCode", SkinCode: "0", Skin2: "Dummy1"}},
	'Dummy2': {type: "tile", tile: 'X', special: {Type: "SkinCode", SkinCode: "0", Skin2: "Dummy2"}},
	'----Doors----': {type: "none"},
	'Door': {type: "tile", tile: 'd', special: {Type: "Door"}},
	'DoorAlways': {type: "tile", tile: 'D', special: {Type: "Door", Priority: true, AlwaysClose: true}},
	'CyberDoor': {type: "tile", tile: 'D', special: {Type: "Door", Priority: true, AlwaysClose: true, Lock: "Cyber", DoorSkin: "Doors/Cyber"}},
	'Door_RedLock': {type: "tile", tile: 'D', special: {Type: "Door", Priority: true, AlwaysClose: true, Lock: "Red"}},
	'Door_PurpleLock': {type: "tile", tile: 'D', special: {Type: "Door", Priority: true, AlwaysClose: true, Lock: "Purple"}},
	'Door_BlueLock': {type: "tile", tile: 'D', special: {Type: "Door", Priority: true, AlwaysClose: true, Lock: "Blue"}},
	'AutoDoorToggle': {type: "tile", tile: 'Z', special: {Type: "AutoDoor", wireType: "AutoDoor_Toggle"}},
	'AutoDoorOpenToggle': {type: "tile", tile: 'z', special: {Type: "AutoDoor", wireType: "AutoDoor_Toggle"}},
	'AutoDoorHoldOpen': {type: "tile", tile: 'Z', special: {Type: "AutoDoor", wireType: "AutoDoor_HoldOpen", Label: "HoldOpen"}},
	'AutoDoorHoldClosed': {type: "tile", tile: 'Z', special: {Type: "AutoDoor", wireType: "AutoDoor_HoldClosed", Label: "HoldClosed"}},
	'AutoDoorOpen': {type: "tile", tile: 'Z', special: {Type: "AutoDoor", wireType: "AutoDoor_Open", Label: "Open"}},
	'AutoDoorClose': {type: "tile", tile: 'z', special: {Type: "AutoDoor", wireType: "AutoDoor_Close", Label: "Open"}},
	'----Furniture----': {type: "none"},
	'Table': {type: "tile", tile: 'F', special: {Type: "Table"}},
	'TableFood': {type: "tile", tile: 'F', special: {Type: "Table", Food: "Plate"}},
	'Rubble': {type: "tile", tile: 'R', special: {Type: "Rubble"}},
	'Sharp': {type: "tile", tile: '/', special: {Type: "Debris"}},
	'SharpAlways': {type: "tile", tile: '/', special: {Type: "Debris", Always: true}},
	'Barrel': {type: "tile", tile: 'L', special: {Type: "Barrel"}},
	'BarrelAlways': {type: "tile", tile: 'L', special: {Type: "Barrel", Always: true}},
	'Cage': {type: "tile", tile: 'L', special: {Type: "Cage", Furniture: "Cage"}, jail: {type: "furniture", radius: 1}},
	'DisplayStand': {type: "tile", tile: 'L', special: {Type: "DisplayStand", Furniture: "DisplayStand"}, jail: {type: "furniture", radius: 1}},
	'DisplayEgyptian': {type: "tile", tile: 'L', special: {Type: "Furniture", Furniture: "DisplayEgyptian"}, jail: {type: "furniture", radius: 1}},
	'----Chests----': {type: "none"},
	'Chest': {type: "tile", tile: 'C', special: {Type: "Chest"}},
	'ChestRed': {type: "tile", tile: 'C', special: {Type: "Chest", Lock: "Red"}},
	'ChestBlue': {type: "tile", tile: 'C', special: {Type: "Chest", Lock: "Blue"}},
	'ChestOrShrine': {type: "tile", tile: 'O', special: {Type: "ChestOrShrine"}},
	'HighPriorityChest': {type: "tile", tile: 'C', special: {Priority: true}},
	'SilverChest': {type: "tile", tile: 'C', special: {Type: "Chest", Loot: "silver", Priority: true}},
	'StorageChest': {type: "tile", tile: 'C', special: {Type: "Chest", Loot: "storage", Chance: 0.8}},
	'ChestCustom': {type: "tile", tile: 'C', special: {Type: "Chest", Loot: "storage"}, customfields: {
		Loot: {type: "string"},
		Faction: {type: "string"},
		NoTrap: {type: "boolean"},
		lootTrap: {type: "string"},
		Lock: {type: "string"},
		Priority: {type: "boolean"},
	}},
	'GuardedChest': {type: "tile", tile: 'C', special: {Type: "GuardedChest", Label: "Guarded"}},
	'GuardedChestLocked': {type: "tile", tile: 'C', special: {Type: "GuardedChest", Lock: "Red", Label: "Guarded"}},
	'----Shrines----': {type: "none"},
	'Shrine': {type: "tile", tile: 'A', special: {Type: "Shrine", Name: "Metal"}},
	'HighPriorityShrine': {type: "tile", tile: 'A', special: {Type: "Shrine", Name: "Will", Priority: true}},
	'----Hazards----': {type: "none"},
	'Trap': {type: "tile", tile: 'T', special: {Type: "Trap", Always: true,}},
	'PotentialTrap': {type: "tile", tile: 'T', special: {Type: "Trap"}},
	'----Conveyors----': {type: "none"},
	'ConveyorUp': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Up", DX: 0, DY: -1,}},
	'ConveyorDown': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Down", DX: 0, DY: 1,}},
	'ConveyorLeft': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Left", DX: -1, DY: 0,}},
	'ConveyorRight': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Right", DX: 1, DY: 0,}},
	'SafetyConveyorUp': {type: "tile", tile: 'v', special: {Type: "SafetyConveyor", Sprite: "Conveyor/SafetyUp", DX: 0, DY: -1,}},
	'SafetyConveyorDown': {type: "tile", tile: 'v', special: {Type: "SafetyConveyor", Sprite: "Conveyor/SafetyDown", DX: 0, DY: 1,}},
	'SafetyConveyorLeft': {type: "tile", tile: 'v', special: {Type: "SafetyConveyor", Sprite: "Conveyor/SafetyLeft", DX: -1, DY: 0,}},
	'SafetyConveyorRight': {type: "tile", tile: 'v', special: {Type: "SafetyConveyor", Sprite: "Conveyor/SafetyRight", DX: 1, DY: 0,}},
	'ConveyorUpOn': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Up", DX: 0, DY: -1, wireType: "Conveyor_Toggle", SwitchMode: "On"}},
	'ConveyorDownOn': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Down", DX: 0, DY: 1, wireType: "Conveyor_Toggle", SwitchMode: "On"}},
	'ConveyorLeftOn': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Left", DX: -1, DY: 0, wireType: "Conveyor_Toggle", SwitchMode: "On"}},
	'ConveyorRightOn': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Right", DX: 1, DY: 0, wireType: "Conveyor_Toggle", SwitchMode: "On"}},
	'ConveyorUpOff': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Up", DX: 0, DY: -1, wireType: "Conveyor_Toggle", SwitchMode: "Off"}},
	'ConveyorDownOff': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Down", DX: 0, DY: 1, wireType: "Conveyor_Toggle", SwitchMode: "Off"}},
	'ConveyorLeftOff': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Left", DX: -1, DY: 0, wireType: "Conveyor_Toggle", SwitchMode: "Off"}},
	'ConveyorRightOff': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Right", DX: 1, DY: 0, wireType: "Conveyor_Toggle", SwitchMode: "Off"}},
	'ConveyorUpSwitch': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Up", DX: 0, DY: -1, wireType: "Conveyor_Switch", SwitchMode: "Switch"}},
	'ConveyorDownSwitch': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Down", DX: 0, DY: 1, wireType: "Conveyor_Switch", SwitchMode: "Switch"}},
	'ConveyorLeftSwitch': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Left", DX: -1, DY: 0, wireType: "Conveyor_Switch", SwitchMode: "Switch"}},
	'ConveyorRightSwitch': {type: "tile", tile: 'V', special: {Type: "Conveyor", Sprite: "Conveyor/Right", DX: 1, DY: 0, wireType: "Conveyor_Switch", SwitchMode: "Switch"}},
	'----Machines----': {type: "none"},
	'DollSupply': {type: "tile", tile: 'u', special: {Type: "DollSupply"}},
	'DollSupplyManual': {type: "tile", tile: 'u', special: {Type: "DollSupply", count: 0, wireType: "increment", rate: 3}},
	'DollTerminal': {type: "tile", tile: 't', special: {Type: "DollTerminal"}},
	'BondageMachineLatex': {type: "tile", tile: 'N', special: {Type: "BondageMachine", Binding: "Latex"}},
	'BondageMachinePlug': {type: "tile", tile: 'N', special: {Type: "BondageMachine", Binding: "Plug"}},
	'BondageMachineChastity': {type: "tile", tile: 'N', special: {Type: "BondageMachine", Binding: "Chastity"}},
	'BondageMachineTape': {type: "tile", tile: 'N', special: {Type: "BondageMachine", Binding: "Tape"}},
	'BondageMachineMetal': {type: "tile", tile: 'N', special: {Type: "BondageMachine", Binding: "Metal"}},
	'BondageMachineDoll': {type: "tile", tile: 'N', special: {Type: "BondageMachine", Binding: "Doll"}},
	'DollDropoffU': {type: "tile", tile: '5', special: {Type: "DollDropoff", Sprite: "Floor", Overlay: "DollDropoff", direction: {x: 0, y:-1}}},
	'DollDropoffD': {type: "tile", tile: '5', special: {Type: "DollDropoff", Sprite: "Floor", Overlay: "DollDropoffD", direction: {x: 0, y:1}}},
	'DollDropoffR': {type: "tile", tile: '5', special: {Type: "DollDropoff", Sprite: "Floor", Overlay: "DollDropoffR", direction: {x: 1, y:0}}},
	'DollDropoffL': {type: "tile", tile: '5', special: {Type: "DollDropoff", Sprite: "Floor", Overlay: "DollDropoffL", direction: {x: -1, y:0}}},
	'----Signals----': {type: "none"},
	'Button': {type: "tile", tile: '@'},
	'Wire':  {type: "effect", effectTile: "Wire"},
	'PressurePlate':  {type: "effect", effectTile: "PressurePlate"},
	'PressurePlateHold':  {type: "effect", effectTile: "PressurePlateHold"},
	'PressurePlateOneUse':  {type: "effect", effectTile: "PressurePlateOneUse"},
	'ManaPlate':  {type: "effect", effectTile: "ManaEmpty"},
	'----Lighting----': {type: "none"},
	'Torch':  {type: "effect", effectTile: "Torch"},
	'PotentialTorch': {type: "effect", effectTile: "TorchUnlit"},
	'PriorityCharger': {type: "tile", tile: '=', special: {Type: "Charger", Priority: true}},
	'Charger': {type: "tile", tile: '+', special: {Type: "Charger"}},
	'UnlockedCharger': {type: "tile", tile: '=', special: {Type: "Charger", NoRemove: false}},
	'MotionLamp':  {type: "effect", effectTile: "MotionLamp"},
	'----Misc----': {type: "none"},
	'POI': {type: "POI"},
	'OL': {type: "offlimits"},
	'Jail': {type: "jail"},
	'Keyring': {type: "Keyring"},
	'MazeSeed': {type: "MazeSeed",
		customfields: {
			newest: {type: "number"},
			oldest: {type: "number"},
			scale: {type: "number"},
			branchchance: {type: "number"},
			hbias: {type: "number"},
			vbias: {type: "number"},
			wobble: {type: "number"},
			pillarToDoodad: {type: "boolean"},
		}
	},
	'MazeBlock': {type: "MazeBlock"},
	'Label': {type: "Label",
		customfields: {
			name: {type: "string"},
			type: {type: "string"},
			faction: {type: "string"},
			guard: {type: "boolean"},
			interesting: {type: "boolean"},
		}
	},
};

function KDGetTileIndexImg(index) {
	return {
		u: index.includes('u'),
		d: index.includes('d'),
		l: index.includes('l'),
		r: index.includes('r'),
	};
}

let KDTE_State = "";

function KDDrawTileEditor() {

	if (KinkyDungeonCanvas) {

		KinkyDungeonContext.fillStyle = "rgba(0,0,0.0,1.0)";
		KinkyDungeonContext.fillRect(0, 0, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height);
		KinkyDungeonContext.fill();
		KinkyDungeonCamX = KinkyDungeonPlayerEntity.x - Math.floor(KinkyDungeonGridWidthDisplay/2);
		KinkyDungeonCamY = KinkyDungeonPlayerEntity.y - Math.floor(KinkyDungeonGridHeightDisplay/2);

		KDDrawMap(KinkyDungeonCamX, KinkyDungeonCamY, 0, 0, KinkyDungeonCamX, KinkyDungeonCamY, true);
		KDDrawEffectTiles(0, 0, KinkyDungeonCamX, KinkyDungeonCamY);

		KinkyDungeonTargetX = Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
		KinkyDungeonTargetY = Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;

		if (KinkyDungeonTargetX >= 0 && KinkyDungeonTargetX < KDMapData.GridWidth
			&& KinkyDungeonTargetY >= 0 && KinkyDungeonTargetY < KDMapData.GridHeight) {
			KDDraw(kdgameboard, kdpixisprites, "ui_movereticule", KinkyDungeonRootDirectory + "TargetMove.png",
				(KinkyDungeonTargetX - KinkyDungeonCamX)*KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - KinkyDungeonCamY)*KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
					zIndex: 100,
				});
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
			if (!pixirendererKD) {
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

		if (!StandalonePatched)
			MainCanvas.drawImage(KinkyDungeonCanvas, canvasOffsetX, canvasOffsetY);

		KDTE_UpdateUI(false);

		if (!KDTE_State) {
			DrawButtonKDEx("ToTags", (bdata) => {
				KDTE_State = "Tags";
				return true;
			}, true, 20 , 920, 250, 64, 'Edit Tile Tags', "#ffffff");
			KDDrawEditorUI();
		} else {
			DrawButtonKDEx("backToBrushes", (bdata) => {
				KDTE_State = "";
				return true;
			}, true, 20 , 920, 250, 64, 'Go Back', "#ffffff");
			if (KDTE_State == "Tags")
				KDDrawEditorTagsUI();
		}


	}

	if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
		if (KinkyDungeonKeybindingCurrentKey)
			KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
		KinkyDungeonKeybindingCurrentKey = '';
	}
}

function KDDrawEditorTagsUI() {

}

let KDEditorTileBrushIndexVisual = 0;
let KDEditorTileBrushIndex2Visual = 0;
let KDEditorTileNameIndexVisual = 0;

function KDDrawEditorUI() {

	if (Math.abs(KDEditorTileBrushIndexVisual - KDEditorTileBrushIndex) > 0.5)
		KDEditorTileBrushIndexVisual = (KDEditorTileBrushIndexVisual*4 + KDEditorTileBrushIndex) / 5;
	if (Math.abs(KDEditorTileBrushIndex2Visual - KDEditorTileBrushIndex2) > 0.5)
		KDEditorTileBrushIndex2Visual = (KDEditorTileBrushIndex2Visual*4 + KDEditorTileBrushIndex2) / 5;
	if (Math.abs(KDEditorTileNameIndexVisual - KDEditorTileNameIndex) > 0.5)
		KDEditorTileNameIndexVisual = (KDEditorTileNameIndexVisual*4 + KDEditorTileNameIndex) / 5;


	let indexX = (1 + Math.floor(Math.max(0, Math.min(KDMapData.GridWidth-1, KinkyDungeonPlayerEntity.x)) / KDTE_Scale));
	let indexY = (1 + Math.floor(Math.max(0, Math.min(KDMapData.GridHeight-1,KinkyDungeonPlayerEntity.y)) / KDTE_Scale));

	let yy = 160;
	let xx = 100;
	let grid = 10;
	DrawTextFitKD("Tile Index", xx + grid * 1.5 , yy - 30, 200, "#ffffff");
	KDEditorTileIndexHover = '';
	KDEditorTileIndex = KDEditorTileIndexStore[KDEditorTileIndexQuery];
	KDEditorTileFlex = KDEditorTileFlexStore[KDEditorTileIndexQuery] || "";
	KDEditorTileFlexSuper = KDEditorTileFlexSuperStore[KDEditorTileIndexQuery] || "";
	for (let index of Object.keys(KDTileIndices)) {
		let patt = KDGetTileIndexImg(index);

		if (!patt.u && KDEditorTileIndexStore[(indexX)+","+(indexY-1)]) {yy += grid * 5; continue;}
		if (!patt.d && KDEditorTileIndexStore[(indexX)+","+(indexY+1)]) {yy += grid * 5; continue;}
		if (!patt.l && KDEditorTileIndexStore[(indexX-1)+","+(indexY)]) {yy += grid * 5; continue;}
		if (!patt.r && KDEditorTileIndexStore[(indexX+1)+","+(indexY)]) {yy += grid * 5; continue;}
		DrawBoxKD(xx + grid, yy, grid, grid, patt.u ? "#ffffff" : "#000000", patt.u);
		DrawBoxKD(xx + grid, yy + 2*grid, grid, grid, patt.d ? "#ffffff" : "#000000", patt.d);
		DrawBoxKD(xx, yy + grid, grid, grid, patt.l ? "#ffffff" : "#000000", patt.l);
		DrawBoxKD(xx + 2*grid, yy + grid, grid, grid, patt.r ? "#ffffff" : "#000000", patt.r);

		if (MouseIn(xx, yy, grid*3, grid*3) || KDEditorTileIndex == index) {
			if (KDEditorTileIndex != index) KDEditorTileIndexHover = index;
			DrawRectKD(kdcanvas, kdpixisprites, "tileInd" + index, {
				Left: xx - 3,
				Top: yy - 3,
				Width: grid*3 + 8,
				Height: grid*3 + 8,
				Color: "#ffffff",
				LineWidth: 2,
				zIndex: 100,
				alpha: 0.5,
			});
		}

		yy += grid * 5;
	}

	DrawButtonKDEx("flextoggle", (bdata) => {
		KDEditorTileFlex = KDEditorTileFlex ? "" : "y";
		if (KDEditorTileFlexStore[KDEditorTileIndexQuery] && !KDEditorTileFlex) {
			delete KDEditorTileFlexStore[KDEditorTileIndexQuery];
		} else if (!KDEditorTileFlexStore[KDEditorTileIndexQuery] && KDEditorTileFlex) {
			KDEditorTileFlexStore[KDEditorTileIndexQuery] = KDEditorTileFlex;
		}
		return true;
	}, true, 150 , 160, 140, 45, 'Flex', "#ffffff", KDEditorTileFlex ? (KinkyDungeonRootDirectory + "UI/CheckSmall.png") : undefined);

	DrawButtonKDEx("flexsupertoggle", (bdata) => {
		KDEditorTileFlexSuper = KDEditorTileFlexSuper ? "" : "y";
		if (KDEditorTileFlexSuperStore[KDEditorTileIndexQuery] && !KDEditorTileFlexSuper) {
			delete KDEditorTileFlexSuperStore[KDEditorTileIndexQuery];
		} else if (!KDEditorTileFlexSuperStore[KDEditorTileIndexQuery] && KDEditorTileFlexSuper) {
			KDEditorTileFlexSuperStore[KDEditorTileIndexQuery] = KDEditorTileFlexSuper;
		}
		return true;
	}, true, 150 , 210, 140, 45, 'OpenBorder', "#ffffff", KDEditorTileFlexSuper ? (KinkyDungeonRootDirectory + "UI/CheckSmall.png") : undefined);

	// For later
	let tileKeys = Object.keys(KDMapTilesListEditor);

	yy = 220;
	xx = 1790;
	grid = 40;
	let width = 200;
	let brushKeys = Object.keys(KDTilePalette);

	DrawButtonKDEx("tilebrushup", (bdata) => {
		if (KDEditorTileBrushIndex == 0) KDEditorTileBrushIndex = brushKeys.length - 4;
		else KDEditorTileBrushIndex = Math.max(0, KDEditorTileBrushIndex - 14);
		return true;
	}, true, xx , yy, width, grid-5, '^', KDEditorTileBrushIndex > 0 ? "#ffffff" : "#888888");
	KDTE_CullIndex(tileKeys, brushKeys);
	yy += grid;
	for (let i = 0; i < 670/grid; i++) {
		let index = i + Math.round(KDEditorTileBrushIndexVisual);
		if (index >= brushKeys.length) break;

		DrawButtonKDExScroll("brush" + i, (amount) => {

			KDEditorTileBrushIndex = Math.min(brushKeys.length - 4, KDEditorTileBrushIndex + 3*Math.round(amount/grid));
			KDEditorTileBrushIndex = Math.max(0, KDEditorTileBrushIndex);
		},
		(bdata) => {
			KDEditorTileBrush = brushKeys[index];
			return true;
		}, true, xx , yy, width, grid-5, brushKeys[index], brushKeys[index] == KDEditorTileBrush ? "#ffffff" : (brushKeys[index].startsWith('-') ? "#77ff77" : "#888888"));

		yy += grid;
	}
	DrawButtonKDEx("tilebrushdown", (bdata) => {
		if (KDEditorTileBrushIndex >= brushKeys.length - 6) KDEditorTileBrushIndex = 0;
		else KDEditorTileBrushIndex = Math.min(brushKeys.length - 4, KDEditorTileBrushIndex + 14);
		return true;
	}, true, xx , yy, width, grid-5, 'v', KDEditorTileBrushIndex < brushKeys.length - 4 ? "#ffffff" : "#888888");


	// Draw the second palette
	yy = 220;
	xx = 1590;
	grid = 40;

	DrawButtonKDEx("tilebrushup2", (bdata) => {
		if (KDEditorTileBrushIndex2 == 0) KDEditorTileBrushIndex2 = brushKeys.length - 4;
		else KDEditorTileBrushIndex2 = Math.max(0, KDEditorTileBrushIndex2 - 8);
		return true;
	}, true, xx , yy, width, grid-5, '^', KDEditorTileBrushIndex2 > 0 ? "#ffffff" : "#888888");
	KDTE_CullIndex(tileKeys, brushKeys);
	yy += grid;
	for (let i = 0; i < 420/grid; i++) {
		let index = i + Math.round(KDEditorTileBrushIndex2Visual);
		if (index >= brushKeys.length) break;

		DrawButtonKDExScroll("brush2_" + i, (amount) => {
			KDEditorTileBrushIndex2 = Math.min(brushKeys.length - 4, KDEditorTileBrushIndex2 + 2*Math.round(amount/grid));
			KDEditorTileBrushIndex2 = Math.max(0, KDEditorTileBrushIndex2);
		},
		(bdata) => {
			KDEditorTileBrush = brushKeys[index];
			return true;
		}, true, xx , yy, width, grid-5, brushKeys[index], brushKeys[index] == KDEditorTileBrush ? "#ffffff" : (brushKeys[index].startsWith('-') ? "#77ff77" : "#888888"));

		yy += grid;
	}
	DrawButtonKDEx("tilebrushdown2", (bdata) => {
		if (KDEditorTileBrushIndex2 >= brushKeys.length - 6) KDEditorTileBrushIndex2 = 0;
		else KDEditorTileBrushIndex2 = Math.min(brushKeys.length - 4, KDEditorTileBrushIndex2 + 8);
		return true;
	}, true, xx , yy, width, grid-5, 'v', KDEditorTileBrushIndex2 < brushKeys.length - 4 ? "#ffffff" : "#888888");



	yy = 160;
	xx = 300;
	grid = 45;
	width = 200;
	DrawTextFitKD("Tile List", xx + width/2 , yy - 30, width, "#ffffff", undefined, 36);

	DrawButtonKDEx("tilenameup", (bdata) => {
		if (KDEditorTileNameIndex == 0) KDEditorTileNameIndex = tileKeys.length - 4;
		else KDEditorTileNameIndex = Math.max(0, KDEditorTileNameIndex - 9);
		KDTELoadConfirm = false;
		return true;
	}, true, xx , yy, width, grid-5, '^', KDEditorTileNameIndex > 0 ? "#ffffff" : "#888888");
	yy += grid;
	KDTE_CullIndex(tileKeys, brushKeys);
	for (let i = 0; i < 700/grid; i++) {
		let index = i + Math.round(KDEditorTileNameIndexVisual);
		if (index >= tileKeys.length) break;

		DrawButtonKDExScroll("tilename" + i, (amount) => {

			KDEditorTileNameIndex = Math.min(tileKeys.length - 4, KDEditorTileNameIndex + 5*Math.round(amount/grid));
			KDEditorTileNameIndex = Math.max(0, KDEditorTileNameIndex);
		},
		(bdata) => {
			if (KDEditorCurrentMapTileName != tileKeys[index] || !KDTELoadConfirm) {
				KDEditorCurrentMapTileName = tileKeys[index];
				ElementValue("MapTileTitle", KDEditorCurrentMapTileName);
				KDTELoadConfirm = true;
			} else if (KDTELoadConfirm) {
				KDTE_LoadTile(KDEditorCurrentMapTileName);
				KDTELoadConfirm = false;
			}
			return true;
		}, true, xx , yy, width, grid-5, tileKeys[index], tileKeys[index] == KDEditorCurrentMapTileName ? "#ffffff" : "#888888");
		if (KDTELoadConfirm && tileKeys[index] == KDEditorCurrentMapTileName) {
			DrawTextFitKD("Double click to LOAD", xx + width * 1.65 , yy + grid/2, width, "#ffffff", undefined);
			DrawButtonKDEx("deletetilename" + i, (bdata) => {
				delete KDMapTilesListEditor[KDEditorCurrentMapTileName];
				return true;
			}, true, xx - 160, yy, 150, grid-5, "Delete!!!", tileKeys[index] == KDEditorCurrentMapTileName ? "#ffffff" : "#888888");
		}

		yy += grid;
	}
	DrawButtonKDEx("tilenamedown", (bdata) => {
		if (KDEditorTileNameIndex >= tileKeys.length - 6) KDEditorTileNameIndex = 0;
		else KDEditorTileNameIndex = Math.min(tileKeys.length - 4, KDEditorTileNameIndex + 9);
		KDTELoadConfirm = false;
		return true;
	}, true, xx , yy, width, grid-5, 'v', KDEditorTileNameIndex < tileKeys.length - 4 ? "#ffffff" : "#888888");

	DrawButtonKDEx("tilesave", (bdata) => {
		KDTE_SaveTile(KDEditorCurrentMapTileName);
		return true;
	}, true, 900 , 150, 200, 60, 'Save Tile', "#ffffff");


	DrawButtonKDEx("maptileR", (bdata) => {
		KinkyDungeonPlayerEntity.x = Math.max(0, Math.min(KDMapData.GridWidth - 1, KinkyDungeonPlayerEntity.x + 3));
		KDTELoadConfirm = false;
		return true;
	}, true, 1000 , 900, 50, 50, '>', "#ffffff");
	DrawButtonKDEx("maptileL", (bdata) => {
		KinkyDungeonPlayerEntity.x = Math.max(0, Math.min(KDMapData.GridWidth - 1, KinkyDungeonPlayerEntity.x - 3));
		KDTELoadConfirm = false;
		return true;
	}, true, 900 , 900, 50, 50, '<', "#ffffff");
	DrawButtonKDEx("maptileD", (bdata) => {
		KinkyDungeonPlayerEntity.y = Math.max(0, Math.min(KDMapData.GridHeight - 1, KinkyDungeonPlayerEntity.y + 3));
		KDTELoadConfirm = false;
		return true;
	}, true, 950 , 950, 50, 50, 'v', "#ffffff");
	DrawButtonKDEx("maptileU", (bdata) => {
		KinkyDungeonPlayerEntity.y = Math.max(0, Math.min(KDMapData.GridHeight - 1, KinkyDungeonPlayerEntity.y - 3));
		KDTELoadConfirm = false;
		return true;
	}, true, 950 , 850, 50, 50, '^', "#ffffff");

	KDTE_CullIndex(tileKeys, brushKeys);

	DrawButtonKDEx("TileEditorBack", () => {
		KinkyDungeonState = "Menu";
		KinkyDungeonSeeAll = false;
		KDTE_CloseUI();
		return true;
	}, true, 10, 10, 350, 64, "Back to menu", "#ffffff", "");
	DrawButtonKDEx("TileEditorNew", () => {
		let x = parseInt(ElementValue("MapTileX"));
		let y = parseInt(ElementValue("MapTileY"));
		if (x && y && x > 0 && y > 0 && x <= KDTE_MAXDIM && y <= KDTE_MAXDIM)
			KDTE_Create(x, y, undefined, false, false);
		return true;
	}, true, 1600, 130, 110, 64, "New (Open)", "#ffffff", "");
	DrawButtonKDEx("TileEditorNewFloor", () => {
		let x = parseInt(ElementValue("MapTileX"));
		let y = parseInt(ElementValue("MapTileY"));
		if (x && y && x > 0 && y > 0 && x <= KDTE_MAXDIM && y <= KDTE_MAXDIM)
			KDTE_Create(x, y, undefined, false, true);
		return true;
	}, true, 1720, 130, 110, 64, "New (Empty)", "#ffffff", "");
	DrawButtonKDEx("TileEditorNewClosed", () => {
		let x = parseInt(ElementValue("MapTileX"));
		let y = parseInt(ElementValue("MapTileY"));
		if (x && y && x > 0 && y > 0 && x <= KDTE_MAXDIM && y <= KDTE_MAXDIM)
			KDTE_Create(x, y, undefined, true);
		return true;
	}, true, 1840, 130, 110, 64, "New (Closed)", "#ffffff", "");

	DrawButtonKDEx("TileTest", () => {
		KDTE_CloseUI();
		KDTileToTest = KDTE_ExportTile();
		KinkyDungeonStartNewGame();
		return true;
	}, true, 1910, 10, 80, 40, "Test Tile", "#ffffff", "");

	if (!KDClipboardDisabled)
		DrawButtonKDEx("CopyClip", () => {
			var text = JSON.stringify(KDMapTilesListEditor);
			navigator.clipboard.writeText(text).then(function() {
				console.log('Async: Copying to clipboard was successful!');
				console.log(KDMapTilesListEditor);
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
			return true;
		}, true, 1450, 900, 275, 45, "Copy array to clipboard", "#ffffff", "");

	if (!KDClipboardDisabled)
		DrawButtonKDEx("MergeClip", () => {
			let success = false;
			navigator.clipboard.readText()
				.then(text => {
					if (JSON.parse(text)) {
						console.log(JSON.parse(text));
						console.log("Parse successful!!!");
						for (let tile of Object.values(JSON.parse(text))) {
							if (tile && tile.name) {
								if (!KDMapTilesListEditor[tile.name]) {
									KDMapTilesListEditor[tile.name] = tile;
									console.log(`${tile.name} added successfully`);
									success = true;
								} else {
									console.log(`${tile.name} already present`);
								}
							}
						}
						if (success) {
							localStorage.setItem("KDMapTilesListEditor", JSON.stringify(KDMapTilesListEditor));
							console.log("Saved new tiles to browser local storage.");
						}
					}
				})
				.catch(err => {
					console.error('Failed to read clipboard contents: ', err);
				});



			return true;
		}, true, 1450, 850, 275, 45, "Merge from clipboard", "#ffffff", "");

	DrawButtonKDEx("DeleteEditorTiles", () => {
		if (KDTE_confirmreset) {
			KDTE_confirmreset = false;
			KDMapTilesListEditor = JSON.parse(JSON.stringify(KDMapTilesList));
		} else {
			KDTE_confirmreset = true;
		}


		return true;
	}, true, 1450, 800, 275, 40, "Reset tile database", "#ffffff", "");
	if (KDTE_confirmreset) {
		DrawTextFitKD("This is a DESTRUCTIVE operation. Click the button again to do it. Save a tile to commit fully.", 1400, 470, 1000, "#ffff00", "#ff0000");
	}



	if (!KDClipboardDisabled)
		DrawButtonKDEx("PasteTileFromCB", () => {
			let success = false;
			navigator.clipboard.readText()
				.then(text => {
					let tile = JSON.parse(text);
					if (tile && tile.name) {
						console.log(JSON.parse(text));
						console.log("Parse successful!!!");
						KDTE_LoadTile(tile.name, tile);

						if (success) {
							localStorage.setItem("KDMapTilesListEditor", JSON.stringify(KDMapTilesListEditor));
							console.log("Saved new tiles to browser local storage.");
						}
					}
				})
				.catch(err => {
					console.error('Failed to read clipboard contents: ', err);
				});
			return true;
		}, true, 1250, 950, 175, 45, "Load tile from Clipboard", "#ffffff", "");

	if (!KDClipboardDisabled)
		DrawButtonKDEx("MakeTileCB", () => {
			var text = JSON.stringify(KDTE_ExportTile());
			navigator.clipboard.writeText(text).then(function() {
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
			return true;
		}, true, 1250, 900, 175, 45, "Copy Tile to Clipboard", "#ffffff", "");

	DrawButtonKDEx("CommitTiles", () => {
		if (KDTE_confirmcommit) {
			KDTE_confirmcommit = false;
			KDMapTilesList = JSON.parse(JSON.stringify(KDMapTilesListEditor));
		} else {
			KDTE_confirmcommit = true;
		}
		return true;
	}, true, 1450, 950, 275, 45, "Commit Editor Tiles", "#ffffff", "");
	if (KDTE_confirmcommit) {
		DrawTextFitKD("This will temporarily make the game use your editor's tiles. You are responsible for any crashes.", 1400, 470, 1000, "#ffffff", "#ff00aa");
	}

	KDEditorTileIndexQuery = indexX
		+ ","
		+ indexY;

	// Enforce entrance/exits
	for (let sim_x = 0; sim_x < KDMapData.GridWidth-1; sim_x += KDTE_Scale) {
		for (let sim_y = 0; sim_y < KDMapData.GridHeight-1; sim_y += KDTE_Scale) {
			let indexXX = (Math.floor(Math.max(0, Math.min(KDMapData.GridWidth-1, sim_x)) / KDTE_Scale));
			let indexYY = (Math.floor(Math.max(0, Math.min(KDMapData.GridHeight-1,sim_y)) / KDTE_Scale));
			let patt = KDGetTileIndexImg(KDEditorTileIndexStore[(indexXX + 1) + "," + (indexYY + 1)]);
			if (patt) {
				if (patt.u && indexYY == 0) KDTE_Clear(indexXX*KDTE_Scale + Math.floor(KDTE_Scale/2), indexYY*KDTE_Scale);
				if (patt.d && indexYY == Math.floor((KDMapData.GridHeight-1)/KDTE_Scale)) KDTE_Clear(indexXX*KDTE_Scale + Math.floor(KDTE_Scale/2), indexYY*KDTE_Scale + KDTE_Scale - 1);
				if (patt.l && indexXX == 0) KDTE_Clear(indexXX*KDTE_Scale, indexYY*KDTE_Scale + Math.floor(KDTE_Scale/2));
				if (patt.r && indexXX == Math.floor((KDMapData.GridWidth-1)/KDTE_Scale)) KDTE_Clear(indexXX*KDTE_Scale + KDTE_Scale - 1, indexYY*KDTE_Scale + Math.floor(KDTE_Scale/2));
			}
		}
	}

	if (mouseDown && !CommonIsMobile) {
		if (!KDTE_lastMouse) KDTE_lastMouse = CommonTime();
		if (CommonTime() > KDTE_lastMouse + KDTEHoldDelay)
			KDHandleTileEditor(true);
	} else KDTE_lastMouse = 0;

	KDTE_CustomUI();
}

let customfieldsElements = [];

function KDTE_CustomUI() {

	let brush = KDTilePalette[KDEditorTileBrush];
	let names = [];
	if (brush?.customfields) {
		names.push(...Object.keys(brush.customfields));
	}

	for (let element of customfieldsElements) {
		if (!names.includes(element)) {
			ElementRemove("KDTECustomField" + element);
			customfieldsElements.splice(customfieldsElements.indexOf(element), 1);
		}
	}
	let YY = 990 - names.length * 55;
	let XX = 650;
	for (let name of names) {
		if (!customfieldsElements.includes(name)) {
			ElementCreateTextArea("KDTECustomField" + name);
			document.getElementById("KDTECustomField" + name).setAttribute("placeholder", name);
			ElementPosition("KDTECustomField" + name, XX, YY, 300, 45); YY += 55;
			customfieldsElements.push(name);
		}
	}
}

let KDTE_lastMouse = 0;
let KDTEHoldDelay = 200;

let KDTEmode = 0;

let KDTE_Scale = 7;
let KDTE_MAXDIM = 20;

let KDTELoadConfirm = false;

function KDTE_Clear(x, y, force = false) {
	if (force || !KDIsSmartMovable(x, y)) {
		KinkyDungeonMapSetForce(x, y, '0');
		KinkyDungeonTilesDelete(x + "," + y);
		delete KDMapData.TilesSkin[x + "," + y];
		for (let jail of KDMapData.JailPoints) {
			if (jail.x == x && jail.y == y)
				KDMapData.JailPoints.splice(KDMapData.JailPoints.indexOf(jail), 1);
		}
		if (KDMapData.Labels)
			for (let k of Object.values(KDMapData.Labels)) {
				for (let l of k)
					if (l.x == x && l.y == y)
						k.splice(k.indexOf(l), 1);
			}
		//KDMapData.EffectTiles.delete(x + "," + y);
	}
}

let KDTE_Brush = {
	"clear": (brush, curr, noSwap) => {
		KDTE_Clear(KinkyDungeonTargetX, KinkyDungeonTargetY, true);
		for (let p of KinkyDungeonPOI) {
			if (p.x == KinkyDungeonTargetX && p.y == KinkyDungeonTargetY) {
				KinkyDungeonPOI.splice(KinkyDungeonPOI.indexOf(p), 1);
				break;
			}
		}
		delete KDMapData.EffectTiles[KinkyDungeonTargetX + "," + KinkyDungeonTargetY];
	},
	"tile": (brush, curr, noSwap) => {
		let OL = KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY) ? KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).OL : undefined;
		let Jail = KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY) ? KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).Jail : undefined;
		let tile = (curr == brush.tile && !noSwap) ? '0' : brush.tile;
		if (tile == '0') {
			if (!noSwap) {
				KDTE_Clear(KinkyDungeonTargetX, KinkyDungeonTargetY, true);
				if (OL || Jail)
					KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {OL: OL, Jail: Jail});
			}
		} else if (curr != tile) {
			KinkyDungeonMapSetForce(KinkyDungeonTargetX, KinkyDungeonTargetY, tile);

			if (brush.jail) {
				KDMapData.JailPoints.push({x: KinkyDungeonTargetX, y: KinkyDungeonTargetY, type: brush.jail.type, radius: brush.jail.radius});
			}
			if (brush.special) {
				KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, Object.assign({}, brush.special));
				if (OL)
					KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).OL = true;
				if (Jail)
					KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).Jail = true;
				if (brush.customfields) {
					for (let field of Object.entries(brush.customfields)) {
						if (KDTE_GetField(field))
							KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)[field[0]] = KDTE_GetField(field);
					}
				}
			} else {
				if (OL)
					KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {OL: true});
				else
					KinkyDungeonTilesDelete(KinkyDungeonTargetX + "," + KinkyDungeonTargetY);
			}
		}
	},
	'offlimits': (brush, curr, noSwap) => {
		if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)) {
			if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).OL) {
				if (!noSwap)
					KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).OL = false;
			} else
				KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).OL = true;
		} else {
			KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {OL: true});
		}
	},
	'MazeBlock': (brush, curr, noSwap) => {
		if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)) {
			if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeBlock) {
				if (!noSwap)
					KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeBlock = false;
			} else
				KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeBlock = true;
		} else {
			KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {MazeBlock: true});
		}
	},
	'Label': (brush, curr, noSwap) => {
		if (!KDMapData.Labels) KDMapData.Labels = {};

		/** @type {KDLabel} */
		let label = {
			name: "null",
			type: "null",
			assigned: -1,
			x: KinkyDungeonTargetX,
			y: KinkyDungeonTargetY,
		};

		if (brush.customfields) {
			for (let field of Object.entries(brush.customfields)) {
				if (KDTE_GetField(field) != undefined)
					label[field[0]] = KDTE_GetField(field);
			}
		}

		if (!KDMapData.Labels[label.type]) KDMapData.Labels[label.type] = [];

		if (KDMapData.Labels[label.type].filter((ll) => {return ll.x == label.x && ll.y == label.y;}).length == 0) {
			// Set
			KDMapData.Labels[label.type].push(label);
		} else {
			// Remove
			KDMapData.Labels[label.type] = KDMapData.Labels[label.type].filter((ll) => {return ll.x != label.x || ll.y != label.y;});
		}

	},
	'MazeSeed': (brush, curr, noSwap) => {
		if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)) {
			if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeSeed) {
				if (!noSwap)
					delete KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeSeed;
			} else
				KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeSeed = {newest: 0.25, oldest: 0.25};
		} else {
			KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {MazeSeed: {newest: 0.25, oldest: 0.25}});
		}

		if (brush.customfields && KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)?.MazeSeed) {
			for (let field of Object.entries(brush.customfields)) {
				if (KDTE_GetField(field) != undefined)
					KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).MazeSeed[field[0]] = KDTE_GetField(field);
			}
		}
	},
	'jail': (brush, curr, noSwap) => {
		if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)) {
			if (KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).Jail) {
				if (!noSwap)
					KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).Jail = false;
			} else
				KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY).Jail = true;
		} else {
			KinkyDungeonTilesSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {Jail: true});
		}
	},
	'Keyring': (brush, curr, noSwap) => {
		let keyringLength = KDGameData.KeyringLocations.length;
		let filtered = KDGameData.KeyringLocations.filter((e) => {return e.x != KinkyDungeonTargetX || e.y != KinkyDungeonTargetY;});
		if (filtered.length != keyringLength) {
			if (!noSwap)
				KDGameData.KeyringLocations = filtered;
		} else {
			KDGameData.KeyringLocations.push({x: KinkyDungeonTargetX, y: KinkyDungeonTargetY});
		}
	},
	"effect": (brush, curr, noSwap) => {
		if ((brush.wall && KinkyDungeonWallTiles.includes(curr))
			|| (brush.floor && KinkyDungeonGroundTiles.includes(curr))
			|| (!brush.floor && !brush.wall)) {
			if (KinkyDungeonEffectTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)) {
				if (!noSwap)
					delete KDMapData.EffectTiles[KinkyDungeonTargetX + "," + KinkyDungeonTargetY];
			} else {
				KDCreateEffectTile(KinkyDungeonTargetX, KinkyDungeonTargetY, {name: brush.effectTile}, 0);
			}
		}
	},
	"POI": (brush, curr, noSwap) => {
		let deleted = false;
		for (let p of KinkyDungeonPOI) {
			if (p.x == KinkyDungeonTargetX && p.y == KinkyDungeonTargetY) {
				if (!noSwap) {
					if (!p.requireTags.includes("endpoint")) {
						let chanceCycle = [1.0, 0.75, 0.5, 0.25, 0.15, 0.1, 0.05, 0.01];
						let chanceIndex = chanceCycle.indexOf(p.chance || 1.0);
						chanceIndex += 1;
						if (chanceIndex >= chanceCycle.length) {
							p.requireTags.push("endpoint");
							p.chance = 1.0;
						} else {
							p.chance = chanceCycle[chanceIndex];
						}
					} else {
						KinkyDungeonPOI.splice(KinkyDungeonPOI.indexOf(p), 1);
					}
				}
				deleted = true;
				break;
			}
		}
		if (!deleted) {
			let tags = [];
			let favor = [];
			//let indexXX = (Math.floor(Math.max(0, Math.min(KDMapData.GridWidth-1, KinkyDungeonTargetX)) / KDTE_Scale));
			//let indexYY = (Math.floor(Math.max(0, Math.min(KDMapData.GridHeight-1,KinkyDungeonTargetY)) / KDTE_Scale));
			//let pat = KDEditorTileIndexStore[(indexXX + 1) + "," + (indexYY + 1)];
			//if (pat) {
			// if (pat.length == 1) tags.push("endpoint");
			//}
			if (ElementValue("MapTileCategory"))
				favor.push(ElementValue("MapTileCategory"));
			KinkyDungeonPOI.push({x: KinkyDungeonTargetX, y: KinkyDungeonTargetY, requireTags: tags, favor: favor, used: false});
		}
	}
};

let KDTE_Inaccessible = false;

let KDTE_confirmreset = false;
let KDTE_confirmcommit = false;

function KDHandleTileEditor(noSwap) {

	// @ts-ignore
	if (document.activeElement && (document.activeElement?.type == "text" || document.activeElement?.type == "textarea" || KDFocusableTextFields.includes(document.activeElement.id))) return;
	if (!noSwap && KDTE_lastMouse && CommonTime() > KDTE_lastMouse + KDTEHoldDelay) return;

	KDTE_confirmreset = false;
	KDTE_confirmcommit = false;

	if (KDTE_State) return;


	KDTESetIndexToTile(KDEditorCurrentMapTileName);

	KinkyDungeonTargetX = Math.round((MouseX - KinkyDungeonGridSizeDisplay/2 - canvasOffsetX)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
	KinkyDungeonTargetY = Math.round((MouseY - KinkyDungeonGridSizeDisplay/2 - canvasOffsetY)/KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;

	if (KinkyDungeonTargetX >= 0 && KinkyDungeonTargetX < KDMapData.GridWidth
		&& KinkyDungeonTargetY >= 0 && KinkyDungeonTargetY < KDMapData.GridHeight) {
		KDTELoadConfirm = false;
		let curr = KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY);

		let brush = KDTilePalette[KDEditorTileBrush];
		if (KDTE_Brush[brush.type]) {
			KDTE_Brush[brush.type](brush, curr, noSwap);
		}
		if (ElementValue("MapTileSkin")) {
			KinkyDungeonSkinSet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY, {force: true, skin: ElementValue("MapTileSkin")});
		} else {
			KinkyDungeonSkinDelete(KinkyDungeonTargetX + "," + KinkyDungeonTargetY);
		}

		if (!noSwap) {
			KDVisionUpdate = 1;
			KinkyDungeonMakeBrightnessMap(KDMapData.GridWidth, KDMapData.GridHeight, KDMapData.MapBrightness, [], KDVisionUpdate);
			KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, [], [], KDVisionUpdate, KDMapData.MapBrightness);
			KDVisionUpdate = 0;
		}
	}
	if (KDEditorTileIndexHover) {
		KDEditorTileIndexStore[KDEditorTileIndexQuery] = KDEditorTileIndexHover;
	}

	if (!noSwap) {
		let inaccess = KDTEGetInaccessible();
		if (inaccess.length > 0) KDTE_Inaccessible = true;
		else KDTE_Inaccessible = false;
	}

}

function KDTE_UpdateUI(Load) {
	let tagCount = 17;
	if (Load) {
		ElementCreateTextArea("MapTileTitle");
		ElementValue("MapTileTitle", KDEditorCurrentMapTileName);
		ElementCreateTextArea("MapTileTileset");
		ElementValue("MapTileTileset", ElementValue("MapTileTileset") ? ElementValue("MapTileTileset") : KinkyDungeonMapIndex.grv);
		ElementCreateTextArea("MapTileCategory");
		ElementValue("MapTileCategory", "urban");
		ElementCreateTextArea("MapTileWeight");
		ElementValue("MapTileWeight", "10");


		ElementCreateTextArea("MapTileX");
		ElementValue("MapTileX", "1");
		ElementCreateTextArea("MapTileY");
		ElementValue("MapTileY", "1");

		ElementCreateTextArea("MapTags");
		ElementCreateTextArea("MapRequireTags");
		ElementCreateTextArea("MapForbidTags");

		for (let i = 0; i < tagCount; i++) {
			ElementCreateTextArea("MapCountTag" + i);
			ElementCreateTextArea("MapCountTagMult" + i);
			ElementCreateTextArea("MapCountTagBonus" + i);
			ElementCreateTextArea("MapCountTagMax" + i);
			ElementCreateTextArea("MapCountTagNot" + i);
			ElementValue("MapCountTagMax" + i, "-1");
			ElementValue("MapCountTagBonus" + i, "0");
			ElementValue("MapCountTagMult" + i, "1");
			ElementValue("MapCountTagNot" + i, "");
		}

	}

	if (KDTE_State == "Tags") {
		DrawTextFitKD("Tile Tags", 300, 50, 500, "#ffffff");
		ElementPosition("MapTags", 300, 200, 500, 200);

		DrawTextFitKD("Require Tags", 300, 350, 500, "#ffffff");
		ElementPosition("MapRequireTags", 300, 500, 500, 200);

		DrawTextFitKD("Forbid Tags", 300, 650, 500, "#ffffff");
		ElementPosition("MapForbidTags", 300, 800, 500, 200);

		for (let i = 0; i < tagCount; i++) {
			DrawTextFitKD("Existing Tag", 1450, 150, 400, "#ffffff");
			DrawTextFitKD("Mult", 1720, 150, 400, "#ffffff");
			DrawTextFitKD("Bonus", 1820, 150, 400, "#ffffff");
			DrawTextFitKD("Max", 1920, 150, 400, "#ffffff");
			ElementPosition("MapCountTag" + i, 1450, 200 + 50 * i, 200, 40);
			ElementPosition("MapCountTagMult" + i, 1680, 200 + 50 * i, 150, 40);
			ElementPosition("MapCountTagBonus" + i, 1820, 200 + 50 * i, 110, 40);
			ElementPosition("MapCountTagMax" + i, 1920, 200 + 50 * i, 110, 40);

			DrawTextFitKD("NOT", 1250, 150, 400, "#ffffff");
			ElementPosition("MapCountTagNot" + i, 1250, 200 + 50 * i, 110, 40);
		}
	} else {
		ElementPosition("MapTags", 300, -1000, 500, 200);
		ElementPosition("MapRequireTags", 300, -1000, 500, 200);
		ElementPosition("MapForbidTags", 300, -1000, 500, 200);

		for (let i = 0; i < tagCount; i++) {
			ElementPosition("MapCountTag" + i, 1700, -1000, 200, 40);
			ElementPosition("MapCountTagMult" + i, 1900, -1000, 90, 40);
			ElementPosition("MapCountTagBonus" + i, 1900, -1000, 90, 40);
			ElementPosition("MapCountTagMax" + i, 1900, -1000, 90, 40);
			ElementPosition("MapCountTagNot" + i, 1900, -1000, 90, 40);
		}
	}

	DrawTextFitKD("X", 1700, 25, 100, "#ffffff");
	ElementPosition("MapTileX", 1800, 25, 150);
	DrawTextFitKD("Y", 1700, 75, 100, "#ffffff");
	ElementPosition("MapTileY", 1800, 75, 150);


	DrawTextFitKD("Name of Tile", 1000, 25, 200, "#ffffff");
	ElementPosition("MapTileTitle", 1000, 70, 400);
	let propTile = ElementValue("MapTileTitle");
	KDEditorCurrentMapTileName = propTile;

	DrawTextFitKD("Tileset", 1000 - 400, 25, 200, "#ffffff");
	ElementPosition("MapTileTileset", 1000 - 400, 70, 200);

	DrawTextFitKD("Skin", 1000 - 400, 120, 200, "#ffffff");
	KDTextField("MapTileSkin", 1000 - 400 - 100, 150, 200, 60,);

	let propTileset = ElementValue("MapTileTileset");
	if (KinkyDungeonMapParams[propTileset]) {
		KinkyDungeonMapIndex.grv = propTileset;
	}

	DrawTextFitKD("Category", 1000 + 350, 25, 200, "#ffffff");
	ElementPosition("MapTileCategory", 1000 + 350, 70, 200);

	DrawTextFitKD("Weight", 1000 + 550, 25, 200, "#ffffff");
	ElementPosition("MapTileWeight", 1000 + 550, 70, 200);

	if (KDTE_Inaccessible)
		DrawTextFitKD("Some entrances are inaccessible. This tile will occur more rarely in worldgen", 1000, 800, 1000, "#ff5555");
}

function KDTESetIndexToTile(propTile) {
	if (KDMapTilesListEditor[propTile]) {
		let tileKeys = Object.keys(KDMapTilesListEditor);
		let brushKeys = Object.keys(KDTilePalette);
		KDEditorTileNameIndex = tileKeys.indexOf(propTile) - 9;
		KDTE_CullIndex(tileKeys, brushKeys);
	}
}

function KDTE_CullIndex(tileKeys, brushKeys) {
	KDEditorTileNameIndex = Math.max(0, Math.min(tileKeys.length - 6, KDEditorTileNameIndex));
	KDEditorTileBrushIndex = Math.max(0, Math.min(brushKeys.length - 6, KDEditorTileBrushIndex));
	KDEditorTileBrushIndex2 = Math.max(0, Math.min(brushKeys.length - 6, KDEditorTileBrushIndex2));
}

function KDTE_CloseUI() {
	ElementRemove("MapTileTitle");
	ElementRemove("MapTileTileset");
	ElementRemove("MapTileCategory");
	ElementRemove("MapTileWeight");

	ElementRemove("MapTileX");
	ElementRemove("MapTileY");
	for (let element of customfieldsElements) {
		ElementRemove("KDTECustomField" + element);
		customfieldsElements.splice(customfieldsElements.indexOf(element), 1);
	}
}


/**
 *
 * @param {number} w
 * @param {number} h
 * @param {string} chkpoint
 * @param {boolean} closed - The edges will be closed index
 * @param {boolean} empty - All floor
 *  */
function KDTE_Create(w, h, chkpoint = 'grv', closed = false, empty = false) {
	MiniGameKinkyDungeonCheckpoint = 'grv';
	KinkyDungeonMapIndex = {
		'grv' : chkpoint,
	};


	KinkyDungeonSeeAll = true;


	KDMapData.Labels = {};
	KDMapData.Grid = "";
	KDMapData.GridWidth = KDTE_Scale * w;
	KDMapData.GridHeight = KDTE_Scale * h;
	for (let y = 0; y < KDMapData.GridHeight; y++) {
		for (let x = 0; x < KDMapData.GridWidth; x++) {
			KDMapData.Grid = KDMapData.Grid + (empty ? "0" : "1");
		}
		KDMapData.Grid = KDMapData.Grid + "\n";
	}
	KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
	KDMapData.Tiles = {};
	KDMapData.EffectTiles = {};
	KDMapData.TilesSkin = {};
	KDMapData.Entities = [];
	KDCommanderRoles = new Map();
	KDMapData.TilesMemory = {};

	KinkyDungeonPOI = [];
	KDGameData.KeyringLocations = [];

	KDEditorTileIndexStore = {};
	for (let ww = 1; ww <= w; ww++) {
		for (let hh = 1; hh <= h; hh++) {
			// Closed maps dont have to worry about edge indices
			if (closed) {
				let index = 'udlr';
				if (ww == 1) {
					index = index.replace("l", "");
				}
				if (hh == 1) {
					index = index.replace("u", "");
				}
				if (ww == w) {
					index = index.replace("r", "");
				}
				if (hh == h) {
					index = index.replace("d", "");
				}
				KDEditorTileIndexStore[ww + "," + hh] = index;
			} else {
				KDEditorTileIndexStore[ww + "," + hh] = 'udlr';
			}

		}
	}
	KDEditorTileFlexStore = {};
	KDEditorTileFlexSuperStore = {};

	KinkyDungeonPlayerEntity = {
		x: Math.floor(KDMapData.GridWidth/2),
		y: Math.floor(KDMapData.GridHeight/2),
		player: true,
	};

	KDInitCanvas();
	KDVisionUpdate = 1;
	KinkyDungeonMakeBrightnessMap(KDMapData.GridWidth, KDMapData.GridHeight, KDMapData.MapBrightness, [], KDVisionUpdate);
	KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, [], [], KDVisionUpdate, KDMapData.MapBrightness);
	KDVisionUpdate = 0;
	KDTE_UpdateUI(true);
}

function KDTE_LoadTile(name, loadedTile) {
	/**
	 * @type {KDMapTile}
	 */
	let nt = loadedTile || KDMapTilesListEditor[name];
	KDTE_Create(nt.w, nt.h);
	KDEditorTileIndexStore = nt.index;
	KDEditorTileFlexStore = nt.flexEdge || {};
	KDEditorTileFlexSuperStore = nt.flexEdgeSuper || {};
	if (nt.category)
		ElementValue("MapTileCategory", nt.category);
	if (nt.weight != undefined)
		ElementValue("MapTileWeight", "" + nt.weight);
	KDMapData.Grid = nt.grid;
	KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
	KinkyDungeonPOI = [];
	for (let p of nt.POI) {
		KinkyDungeonPOI.push(Object.assign({}, p));
	}
	KDGameData.KeyringLocations = [];
	if (nt.Keyring) {
		for (let k of nt.Keyring) {
			KDGameData.KeyringLocations.push({x:k.x, y:k.y});
		}
	}
	if (nt.Labels)
		KDMapData.Labels = JSON.parse(JSON.stringify(nt.Labels));
	KDMapData.Tiles = KDObjFromMapArray(nt.Tiles);
	KDMapData.TilesSkin = KDObjFromMapArray(nt.Skin);
	KDMapData.JailPoints = [];
	for (let j of nt.Jail) {
		KDMapData.JailPoints.push(Object.assign({}, j));
	}
	let array = KDObjFromMapArray(nt.effectTiles);
	for (let tile of Object.entries(array)) {
		KinkyDungeonEffectTilesSet(tile[0], KDObjFromMapArray(tile[1]));
	}

	KDVisionUpdate = 1;
	KinkyDungeonMakeBrightnessMap(KDMapData.GridWidth, KDMapData.GridHeight, KDMapData.MapBrightness, [], KDVisionUpdate);
	KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, [], [], KDVisionUpdate, KDMapData.MapBrightness);
	KDVisionUpdate = 0;

	ElementValue("MapTags", nt.tags.toString());
	ElementValue("MapRequireTags", nt.requireTags.toString());
	ElementValue("MapForbidTags", nt.forbidTags.toString());

	// JSON recreation to kill all references
	KDMapTilesListEditor = JSON.parse(JSON.stringify(KDMapTilesListEditor));

	KDTESetIndexToTile(nt.name);

	let tagCount = 17;
	for (let i = 0; i < tagCount; i++) {
		//if (i < nt.indexTags.length) {
		ElementValue("MapCountTag" + i, nt.indexTags[i] ? nt.indexTags[i] : "");
		ElementValue("MapCountTagBonus" + i, "" + (nt.indexTags[i] ? nt.bonusTags[i] : 0));
		ElementValue("MapCountTagMult" + i, "" + (nt.indexTags[i] ? nt.multTags[i] : 1));
		ElementValue("MapCountTagMax" + i, "" + (nt.indexTags[i] ? nt.maxTags[i] : -1));
		ElementValue("MapCountTagNot" + i, (nt.indexTags[i] && nt.notTags ? nt.notTags[i] : ""));
		//}

	}
}

/**
 * @returns {KDMapTile}
 */
function KDTE_ExportTile() {
	/**
	 * @type {KDMapTile}
	 */
	let saveTile = {
		name: KDEditorCurrentMapTileName,
		Labels: JSON.parse(JSON.stringify(KDMapData.Labels)),
		w: KDMapData.GridWidth / KDTE_Scale,
		h: KDMapData.GridHeight / KDTE_Scale,
		primInd: KDEditorTileIndexStore["1,1"],
		index: KDEditorTileIndexStore,
		flexEdge: KDEditorTileFlexStore || {},
		flexEdgeSuper: KDEditorTileFlexSuperStore || {},
		scale: KDTE_Scale,
		category: ElementValue("MapTileCategory"),
		weight: parseInt(ElementValue("MapTileWeight")) ? parseInt(ElementValue("MapTileWeight")) : 0,
		grid: KDMapData.Grid,
		POI: KinkyDungeonPOI,
		Keyring: KDGameData.KeyringLocations,
		Jail: KDMapData.JailPoints,
		Tiles: KDMapData.Tiles,
		effectTiles: KDMapData.EffectTiles,
		Skin: KDMapData.TilesSkin,
		inaccessible: KDTEGetInaccessible(),
		tags: ElementValue("MapTags") ? ElementValue("MapTags").split(',') : [ElementValue("MapTileCategory")],
		forbidTags: ElementValue("MapForbidTags") ? ElementValue("MapForbidTags").split(',') : [],
		requireTags: ElementValue("MapRequireTags") ? ElementValue("MapRequireTags").split(',') : [],
		indexTags: [],
		maxTags: [],
		bonusTags: [],
		multTags: [],
		notTags: [],
	};

	let maxTags = 17;
	for (let i = 0; i < maxTags; i++) {
		if (ElementValue("MapCountTag" + i)) {
			saveTile.indexTags.push(ElementValue("MapCountTag" + i));
			saveTile.bonusTags.push(parseInt(ElementValue("MapCountTagBonus" + i)));
			saveTile.multTags.push(parseInt(ElementValue("MapCountTagMult" + i)));
			saveTile.maxTags.push(parseInt(ElementValue("MapCountTagMax" + i)));
			saveTile.notTags.push(ElementValue("MapCountTagNot" + i));
		}
	}
	return saveTile;
}

function KDTE_SaveTile(tile) {
	let saveTile = KDTE_ExportTile();

	// JSON recreation to kill all references
	KDMapTilesListEditor[KDEditorCurrentMapTileName] = saveTile;
	KDMapTilesListEditor = JSON.parse(JSON.stringify(KDMapTilesListEditor));

	KDTESetIndexToTile(KDEditorCurrentMapTileName);

	localStorage.setItem("KDMapTilesListEditor", JSON.stringify(KDMapTilesListEditor));
}

/**
 * @returns {{indX1: number, indY1: number, dir1: string, indX2: number, indY2: number, dir2: string}[]}
 */
function KDTEGetInaccessible() {
	/**
	 * @type {{indX1: number, indY1: number, dir1: string, indX2: number, indY2: number, dir2: string}[]}
	 */
	let list = [];
	/**
	 * @type {{indX: number, indY: number, dir: string}[]}
	 */
	let listEntrances = [];

	// Figure out the list of entrances we need to compare
	for (let ind of Object.entries(KDEditorTileIndexStore)) {
		let indX = parseInt(ind[0].split(',')[0]);
		let indY = parseInt(ind[0].split(',')[1]);

		if (indX && indY) {
			if (indX == 1 && ind[1].includes('l'))
				listEntrances.push({indX: indX, indY: indY, dir: 'l'});
			if (indX == 1 + Math.floor((KDMapData.GridWidth-1)/KDTE_Scale) && ind[1].includes('r'))
				listEntrances.push({indX: indX, indY: indY, dir: 'r'});
			if (indY == 1 && ind[1].includes('u'))
				listEntrances.push({indX: indX, indY: indY, dir: 'u'});
			if (indY == 1 + Math.floor((KDMapData.GridHeight-1)/KDTE_Scale) && ind[1].includes('d'))
				listEntrances.push({indX: indX, indY: indY, dir: 'd'});
		}
	}

	let pairsTested = {};

	// Now we attempt to find a path for smart enemies (player can open doors)
	for (let entrance1 of listEntrances) {
		for (let entrance2 of listEntrances) {
			if (entrance1 == entrance2) continue;
			let ID = entrance1.indX + "," + entrance1.indY + "," + entrance1.dir + ","
				+ entrance2.indX + "," + entrance2.indY + "," + entrance2.dir;
			if (pairsTested[ID]) continue;
			pairsTested[ID] = true;
			let x1 = (entrance1.indX - 1)*KDTE_Scale;
			if (entrance1.dir == 'r') x1 += KDTE_Scale;
			else if (entrance1.dir == 'u' || entrance1.dir == 'd') x1 += Math.floor(KDTE_Scale/2);
			let x2 = (entrance2.indX - 1)*KDTE_Scale;
			if (entrance2.dir == 'r') x2 += KDTE_Scale;
			else if (entrance2.dir == 'u' || entrance2.dir == 'd') x2 += Math.floor(KDTE_Scale/2);
			let y1 = (entrance1.indY - 1)*KDTE_Scale;
			if (entrance1.dir == 'd') y1 += KDTE_Scale;
			else if (entrance1.dir == 'l' || entrance1.dir == 'r') y1 += Math.floor(KDTE_Scale/2);
			let y2 = (entrance2.indY - 1)*KDTE_Scale;
			if (entrance2.dir == 'd') y2 += KDTE_Scale;
			else if (entrance2.dir == 'l' || entrance2.dir == 'r') y2 += Math.floor(KDTE_Scale/2);

			// Clear caches
			KDPathCacheIgnoreLocks = new Map();
			KDPathCache = new Map();
			// Find path
			let access = KinkyDungeonFindPath(
				x1, y1,
				x2, y2,
				false, false, false, KinkyDungeonMovableTilesSmartEnemy);

			if (!access) {
				list.push({
					indX1: entrance1.indX,
					indY1: entrance1.indY,
					indX2: entrance2.indX,
					indY2: entrance2.indY,
					dir1: entrance1.dir,
					dir2: entrance2.dir,
				});
			}
		}
	}

	return list;
}

function KDObjFromMapArray(array) {
	if (array.length != undefined) {
		let map = {};
		for (let entry of array) {
			map[entry[0]] = entry[1];
		}
		return map;
	} else {
		return array;
	}
}

function KDReloadAllEditorTiles() {
	for (let tile of Object.entries(KDMapTilesList)) {
		KDEditorCurrentMapTileName = tile[0];
		KDTE_LoadTile(tile[0]);
		KDTE_SaveTile();
	}
}

function KDTE_GetField(field) {
	if (!field[1]) return undefined;
	if (ElementValue("KDTECustomField" + field[0]) == "") return undefined;
	if (field[1].type == 'array') return ElementValue("KDTECustomField" + field[0])?.split(',');
	if (field[1].type == 'number') return parseFloat(ElementValue("KDTECustomField" + field[0])) || 0;
	if (field[1].type == 'boolean') return (ElementValue("KDTECustomField" + field[0]) && ElementValue("KDTECustomField" + field[0]) != "false") ? true : false;
	return ElementValue("KDTECustomField" + field[0]);
}