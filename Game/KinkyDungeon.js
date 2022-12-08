"use strict";

// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;


// Check URL to see if indev branch
const pp = new URLSearchParams(window.location.search);
let param_branch = pp.has('branch') ? pp.get('branch') : "";
let param_test = pp.has('test') ? pp.get('test') : "";
let param_localhost = pp.has('localhost') ? pp.get('localhost') : "";
let TestMode = param_test || param_branch || param_localhost || ServerURL == 'https://bc-server-test.herokuapp.com/';

let KDDebugMode = false;
let KDDebug = false;
let KDDebugPerks = false;
let KDDebugGold = false;

let KDAllModFiles = [];
let KDModFiles = {};

let KDClasses = 4;

let KinkyDungeonPerksConfig = "1";

let KDUnlockedPerks = [];

let KinkyDungeonBackground = "BrickWall";
/**
 * @type {Character}
 */
let KinkyDungeonPlayer = null;
let KinkyDungeonState = "Consent";

let KinkyDungeonRep = 0; // Variable to store max level to avoid losing it if the server doesnt take the rep update

function KDSetDefaultKeybindings() {
	KinkyDungeonKeybindingsTemp = Object.assign({}, KDDefaultKB);
}

let KinkyDungeonKeybindings = null;
let KinkyDungeonKeybindingsTemp = null;
let KinkyDungeonKeybindingCurrentKey = "";
let KinkyDungeonKeybindingCurrentKeyRelease = "";

let KinkyDungeonNewGame = 0;

let KinkyDungeonGameRunning = false;

let KDLose = false;

//let KinkyDungeonKeyLower = [87+32, 65+32, 83+32, 68+32, 81+32, 45+32, 90+32, 43+32]; // WASD
let KinkyDungeonKey = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyZ', 'KeyC'];
//let KinkyDungeonKeyNumpad = [56, 52, 50, 54, 55, 57, 49, 51]; // Numpad
let KinkyDungeonKeySpell = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7']; // 1 2 3 4 5 6 7
let KinkyDungeonKeyWait = ['KeyX'];
let KinkyDungeonKeySkip = ['Space'];
let KinkyDungeonKeyEnter = ['Enter'];
let KinkyDungeonKeySprint = ['ShiftLeft'];
let KinkyDungeonKeyWeapon = ['KeyF'];
let KinkyDungeonKeyUpcast = ['KeyR', 'ControlLeft'];
let KinkyDungeonKeyMenu = ['KeyT', 'KeyI', 'KeyG', 'KeyM', 'KeyL']; // QuikInv, Inventory, Reputation, Magic, Log
let KinkyDungeonKeyToggle = ['Backquote', 'KeyB', 'KeyV', 'KeyN', 'Comma', 'Slash']; // Log, Passing, Door, Auto Struggle, Auto Pathfind
let KinkyDungeonKeySpellPage = ['Backquote'];
let KinkyDungeonKeySwitchWeapon = ['ControlRight'];

let KDLoadingTextKeys = {};

let KDDefaultKB = {
	Down: KinkyDungeonKey[2],
	DownLeft: KinkyDungeonKey[6],
	DownRight: KinkyDungeonKey[7],
	Left: KinkyDungeonKey[1],
	Right: KinkyDungeonKey[3],
	Up: KinkyDungeonKey[0],
	UpLeft: KinkyDungeonKey[4],
	UpRight: KinkyDungeonKey[5],

	Spell1: KinkyDungeonKeySpell[0],
	Spell2: KinkyDungeonKeySpell[1],
	Spell3: KinkyDungeonKeySpell[2],
	Spell4: KinkyDungeonKeySpell[3],
	Spell5: KinkyDungeonKeySpell[4],
	Spell6: KinkyDungeonKeySpell[5],
	Spell7: KinkyDungeonKeySpell[6],
	SpellWeapon: KinkyDungeonKeyWeapon[0],

	Wait: KinkyDungeonKeyWait[0],
	Skip: KinkyDungeonKeySkip[0],
	Enter: KinkyDungeonKeyEnter[0],
	Sprint: KinkyDungeonKeySprint[0],

	SpellPage: KinkyDungeonKeySpellPage[0],
	SwitchWeapon: KinkyDungeonKeySwitchWeapon[0],

	QInventory: KinkyDungeonKeyMenu[0],
	Inventory: KinkyDungeonKeyMenu[1],
	Reputation: KinkyDungeonKeyMenu[2],
	Magic: KinkyDungeonKeyMenu[3],
	Log: KinkyDungeonKeyMenu[4],

	Upcast: KinkyDungeonKeyUpcast[0],
	UpcastCancel: KinkyDungeonKeyUpcast[1],

	MsgLog: KinkyDungeonKeyToggle[0],
	Pass: KinkyDungeonKeyToggle[1],
	Door: KinkyDungeonKeyToggle[2],
	AStruggle: KinkyDungeonKeyToggle[3],
	APathfind: KinkyDungeonKeyToggle[4],
	AInspect: KinkyDungeonKeyToggle[5],
};

let KinkyDungeonRootDirectory = "Screens/MiniGame/KinkyDungeon/";
let KinkyDungeonPlayerCharacter = null; // Other player object
let KinkyDungeonGameData = null; // Data sent by other player
let KinkyDungeonGameDataNullTimer = 4000; // If data is null, we query this often
let KinkyDungeonGameDataNullTimerTime = 0;
let KinkyDungeonStreamingPlayers = []; // List of players to stream to

let KinkyDungeonInitTime = 0;

let KinkyDungeonSleepTime = 0;
let KinkyDungeonFreezeTime = 1000;
let KinkyDungeonAutoWait = false;

let KinkyDungeonConfigAppearance = false;

const Consumable = "consumable";
const Restraint = "restraint";
const LooseRestraint = "looserestraint";
const Outfit = "outfit";
const Accessory = "accessory";
const Weapon = "weapon";
const Misc = "misc";

let KinkyDungeonStatsChoice = new Map();

let KDJourney = "";

let KDOptOut = false;

/**
*  @typedef {{
* KeysNeeded: boolean,
* PoolUses: number,
* PoolUsesGrace: number,
* JailRemoveRestraintsTimer: number;
* KinkyDungeonSpawnJailers: number;
* KinkyDungeonSpawnJailersMax: number;
* KinkyDungeonLeashedPlayer: number;
* KinkyDungeonLeashingEnemy: number;
* KinkyDungeonJailGuard: number;
* KinkyDungeonGuardTimer: number;
* KinkyDungeonGuardTimerMax: number;
* KinkyDungeonGuardSpawnTimer: number;
* KinkyDungeonGuardSpawnTimerMax: number;
* KinkyDungeonGuardSpawnTimerMin: number;
* KinkyDungeonMaxPrisonReduction: number;
* KinkyDungeonPrisonReduction: number;
* KinkyDungeonPrisonExtraGhostRep: number;
* PrisonGoodBehaviorFromLeash: number;
* KinkyDungeonJailTourTimer: number;
* KinkyDungeonJailTourTimerMin: number;
* KinkyDungeonJailTourTimerMax: number;
* KinkyDungeonPenanceCostCurrent: number;
* KinkyDungeonAngel: number;
* KDPenanceStage: number;
* KDPenanceStageEnd: number;
* AngelCurrentRep: string;
* KDPenanceMode: string;
* OrgasmStage: number;
* OrgasmTurns: number;
* OrgasmStamina: number;
* SleepTurns: number;
* PlaySelfTurns: number;
* RescueFlag: boolean;
* KinkyDungeonPenance: boolean;
* GuardApplyTime: number;
* WarningLevel: number;
* AncientEnergyLevel: number;
* OrigEnergyLevel: number;
* LastMP: number;
* LastAP: number;
* LastSP: number;
* LastWP: number;
* Outfit: string,
* Champion: string,
* ChampionCurrent: number,
* JailPoints: {x: number, y: number, type: string, radius: number, requireLeash?: boolean, requireFurniture?: boolean}[],
* LastMapSeed: string,
* AlreadyOpened: {x: number, y:number}[],
* Journey: string,
* CheckpointIndices: number[],
* PrisonerState: string,
* TimesJailed: number,
* JailTurns: number,
* JailKey: boolean,
* CurrentDialog: string,
* CurrentDialogStage: string,
* OrgasmNextStageTimer: number,
* DistractionCooldown: number,
* ConfirmAttack: boolean,
* CurrentDialogMsg: string,
* CurrentDialogMsgSpeaker: string,
* CurrentDialogMsgPersonality: string,
* CurrentDialogMsgID: number,
* CurrentDialogMsgData: Record<string, string>,
* CurrentDialogMsgValue: Record<string, number>,
* AlertTimer: number,
* RespawnQueue: {enemy: string, faction: string}[],
* HeartTaken: boolean,
* CurrentVibration: KinkyVibration,
* Edged: boolean,
* TimeSinceLastVibeStart: Record<string, number>,
* TimeSinceLastVibeEnd: Record<string, number>,
* OfferFatigue: number,
* Favors: Record<string, number>,
* RoomType: string,
* MapMod: string,
* HunterTimer: number,
* Hunters: number[],
* Quests: string[],
* MapFaction: string,
* PriorJailbreaks: number,
* PreviousWeapon: string,
* StaminaPause: number,
* StaminaSlow: number,
* ManaSlow: number,
* TempFlagFloorTicks: Record<string, number>,
* KneelTurns: number,
* HiddenSpellPages : Record<string, boolean>,
* KeyringLocations : {x: number, y: number}[],
* HiddenItems : Record<string, boolean>,
* CagedTime : number,
* ShopItems: shopItem[],
* DelayedActions: KDDelayedAction[],
* JailFaction: string[],
* GuardFaction: string[],
*}} KDGameDataBase
*/
let KDGameDataBase = {
	CagedTime: 0,
	HiddenItems: {},
	KeyringLocations: [],
	HiddenSpellPages: {},
	PriorJailbreaks: 0,
	MapFaction: "",
	KeysNeeded: false,
	RoomType: "",
	MapMod: "",

	Quests: [],

	HunterTimer: 0,
	Hunters: [],

	AlertTimer: 0,
	OrgasmNextStageTimer: 0,
	DistractionCooldown: 0,

	PoolUses: 0,
	PoolUsesGrace: 3,
	JailRemoveRestraintsTimer: 0,
	KinkyDungeonSpawnJailers: 0,
	KinkyDungeonSpawnJailersMax: 5,
	KinkyDungeonLeashedPlayer: 0,
	KinkyDungeonLeashingEnemy: 0,

	KinkyDungeonJailGuard: 0,
	KinkyDungeonGuardTimer: 0,
	KinkyDungeonGuardTimerMax: 28,
	KinkyDungeonGuardSpawnTimer: 0,
	KinkyDungeonGuardSpawnTimerMax: 80,
	KinkyDungeonGuardSpawnTimerMin: 50,
	KinkyDungeonMaxPrisonReduction: 10,
	KinkyDungeonPrisonReduction: 0,
	KinkyDungeonPrisonExtraGhostRep: 0,
	PrisonGoodBehaviorFromLeash: 0,

	KinkyDungeonJailTourTimer: 0,
	KinkyDungeonJailTourTimerMin: 20,
	KinkyDungeonJailTourTimerMax: 40,

	KinkyDungeonPenanceCostCurrent: 100,

	KinkyDungeonAngel: 0,
	KDPenanceStage: 0,
	KDPenanceStageEnd: 0,
	AngelCurrentRep: "",
	KDPenanceMode: "",

	OrgasmStage: 0,
	OrgasmTurns: 0,
	OrgasmStamina: 0,

	KinkyDungeonPenance: false,

	RescueFlag: false,

	SleepTurns: 0,
	PlaySelfTurns: 0,
	GuardApplyTime: 0,

	AncientEnergyLevel: 0,
	OrigEnergyLevel: 0,
	LastAP: 0,
	LastSP: KDMaxStatStart,
	LastMP: KDMaxStatStart,
	LastWP: KDMaxStatStart,

	Outfit: "Default",

	Champion: "",
	ChampionCurrent: 0,

	JailPoints: [],

	WarningLevel: 0,
	LastMapSeed: "",

	AlreadyOpened: [],
	Journey: "",
	CheckpointIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],

	TempFlagFloorTicks: {},

	// "" = not a prisoner
	// "jail" = must remain in cell
	// "parole" = can roam but not allowed to take most actions
	PrisonerState: "",
	TimesJailed: 0,
	JailTurns: 0,
	JailKey: false,

	CurrentDialog: "",
	CurrentDialogStage: "",
	CurrentDialogMsg: "",
	CurrentDialogMsgSpeaker: "",
	CurrentDialogMsgPersonality: "",
	CurrentDialogMsgData: {},
	CurrentDialogMsgValue: {},
	CurrentDialogMsgID: -1,

	ConfirmAttack: false,
	RespawnQueue: [],
	HeartTaken: false,

	CurrentVibration: null,
	Edged: false,
	TimeSinceLastVibeStart: {},
	TimeSinceLastVibeEnd: {},

	OfferFatigue: 0,

	Favors: {},
	PreviousWeapon: null,

	StaminaPause: 0,
	StaminaSlow: 0,
	ManaSlow: 0,
	KneelTurns: 0,
	ShopItems: [],
	DelayedActions: [],
	JailFaction: [],
	GuardFaction: [],
};
/**
 * @type {KDGameDataBase}
 */
let KDGameData = Object.assign({}, KDGameDataBase);
/*{
	KinkyDungeonSpawnJailers: 0,
	KinkyDungeonSpawnJailersMax: 5,
	KinkyDungeonLeashedPlayer: 0,
	KinkyDungeonLeashingEnemy: 0,

	KinkyDungeonJailGuard: 0,
	KinkyDungeonGuardTimer: 0,
	KinkyDungeonGuardTimerMax: 22,
	KinkyDungeonGuardSpawnTimer: 0,
	KinkyDungeonGuardSpawnTimerMax: 20,
	KinkyDungeonGuardSpawnTimerMin: 6,
	KinkyDungeonMaxPrisonReduction: 10,
	KinkyDungeonPrisonReduction: 0,
	KinkyDungeonPrisonExtraGhostRep: 0,

	KinkyDungeonJailTourTimer: 0,
	KinkyDungeonJailTourTimerMin: 20,
	KinkyDungeonJailTourTimerMax: 40,

	KinkyDungeonPenanceCostCurrent: 100,

	KinkyDungeonAngel: 0,
	KDPenanceStage: 0,
	KDPenanceStageEnd: 0,
	AngelCurrentRep: "",
	KDPenanceMode: "",

	KinkyDungeonPenance: false,
};*/

let KDLeashingEnemy = null;
function KinkyDungeonLeashingEnemy() {
	if (KDGameData.KinkyDungeonLeashingEnemy) {
		if (!KDLeashingEnemy) {
			KDLeashingEnemy = KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
		}
	} else if (!KDIsPlayerTethered()) {
		KDLeashingEnemy = null;
	}
	return KDLeashingEnemy;
}
let KDJailGuard = null;

/**
 *
 * @returns {entity}
 */
function KinkyDungeonJailGuard() {
	if (KDGameData.KinkyDungeonJailGuard) {
		if (!KDJailGuard) {
			KDJailGuard = KinkyDungeonFindID(KDGameData.KinkyDungeonJailGuard);
		}
	} else {
		KDJailGuard = null;
	}
	return KDJailGuard;
}
let KDAngel = null;
function KinkyDungeonAngel() {
	if (KDGameData.KinkyDungeonAngel) {
		if (!KDAngel) {
			KDAngel = KinkyDungeonFindID(KDGameData.KinkyDungeonAngel);
		}
	} else {
		KDAngel = null;
	}
	return KDAngel;
}

function KDUnlockPerk(Perk) {
	if (Perk && !KDUnlockedPerks.includes(Perk)) KDUnlockedPerks.push(Perk);
	KDLoadPerks();
	localStorage.setItem("KDUnlockedPerks", JSON.stringify(KDUnlockedPerks));
}

// @ts-ignore
function KDLoadPerks(Perk) {
	if (localStorage.getItem("KDUnlockedPerks")) {
		let perks = JSON.parse(localStorage.getItem("KDUnlockedPerks"));
		if (perks) {
			for (let p of perks) {
				if (!KDUnlockedPerks.includes(p)) {
					KDUnlockedPerks.push(p);
				}
			}
		}
	}
}

/**
 *
 * @param {any[]} list
 * @return {Record<any, any>}
 */
function KDMapInit(list) {
	let map = {};
	for (let l of list) {
		map[l] = true;
	}
	return map;
}

function KDistEuclidean(x, y) {
	return Math.sqrt(x*x + y*y);
}

function KDistChebyshev(x, y) {
	return Math.max(Math.abs(x), Math.abs(y));
}

/**
 * Loads the kinky dungeon game
 * @returns {void} - Nothing
 */
function KinkyDungeonLoad() {
	KinkyDungeonSetupCrashHandler();

	for (let entry of Object.entries(KDLoadingTextKeys)) {
		addTextKey(entry[0], entry[1]);
	}
	KDCategories = Object.assign([], KDCategoriesStart);
	for (let c of KDCategories) {
		c.buffs = [];
		c.debuffs = [];
	}

	for (let stat of Object.entries(KinkyDungeonStatsPresets)) {
		for (let c of KDCategories) {
			if (stat[1].category == c.name) {
				if (stat[1].debuff || KDGetPerkCost(stat[1]) < 0)
					c.debuffs.push(stat);
				else
					c.buffs.push(stat);
			}
		}
	}

	KDLoadPerks();

	CurrentDarkFactor = 0;

	KinkyDungeonInitTime = CommonTime();
	KinkyDungeonGameKey.load();

	if (!KinkyDungeonIsPlayer()) KinkyDungeonGameRunning = false;
	// @ts-ignore
	if (ServerURL != 'foobar' && KinkyDungeonState == 'Consent') KinkyDungeonState = "Menu";
	//if (!Player.KinkyDungeonSave) Player.KinkyDungeonSave = {};

	if (!KinkyDungeonGameRunning) {
		if (!KinkyDungeonPlayer) { // new game
			KDrandomizeSeed(false);
			if (KDPatched) {
				// @ts-ignore
				KinkyDungeonPlayer = suppressCanvasUpdate(() => CharacterLoadNPC("NPC_Avatar"));
			} else {
				KinkyDungeonPlayer = CharacterLoadNPC("NPC_Avatar");
			}
			KinkyDungeonPlayer.Type = "simple";
			// @ts-ignore
			KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: true, };
			KinkyDungeonSound = localStorage.getItem("KinkyDungeonSound") != undefined ? localStorage.getItem("KinkyDungeonSound") == "True" : true;
			KinkyDungeonFullscreen = localStorage.getItem("KinkyDungeonFullscreen") != undefined ? localStorage.getItem("KinkyDungeonFullscreen") == "True" : true;
			KinkyDungeonDrool = localStorage.getItem("KinkyDungeonDrool") != undefined ? localStorage.getItem("KinkyDungeonDrool") == "True" : true;
			KinkyDungeonArmor = localStorage.getItem("KinkyDungeonArmor") != undefined ? localStorage.getItem("KinkyDungeonArmor") == "True" : true;
			KinkyDungeonBones = localStorage.getItem("KinkyDungeonBones") != undefined ? localStorage.getItem("KinkyDungeonBones") : KinkyDungeonBones;

			if (localStorage.getItem("KDVibeVolume")) {
				let parsed = parseInt(localStorage.getItem("KDVibeVolume"));
				if (parsed != undefined) {
					KDVibeVolumeListIndex = parsed;
					KDVibeVolume = KDVibeVolumeList[KDVibeVolumeListIndex];
				}
			}
			if (localStorage.getItem("KDMusicVolume")) {
				let parsed = parseInt(localStorage.getItem("KDMusicVolume"));
				if (parsed != undefined) {
					KDMusicVolumeListIndex = parsed;
					KDMusicVolume = KDMusicVolumeList[KDMusicVolumeListIndex];
				}
			}
			if (localStorage.getItem("KDAnimSpeed")) {
				let parsed = parseInt(localStorage.getItem("KDAnimSpeed"));
				if (parsed != undefined) {
					KDAnimSpeedListIndex = parsed;
					KDAnimSpeed = KDAnimSpeedList[KDAnimSpeedListIndex];
				}
			}

			KinkyDungeonSexyMode = localStorage.getItem("KinkyDungeonSexyMode") != undefined ? localStorage.getItem("KinkyDungeonSexyMode") == "True" : true;
			KinkyDungeonClassMode = localStorage.getItem("KinkyDungeonClassMode") != undefined ? localStorage.getItem("KinkyDungeonClassMode") : "Mage";
			KinkyDungeonSexyPiercing = localStorage.getItem("KinkyDungeonSexyPiercing") != undefined ? localStorage.getItem("KinkyDungeonSexyPiercing") == "True" : false;
			KinkyDungeonSexyPlug = localStorage.getItem("KinkyDungeonSexyPlug") != undefined ? localStorage.getItem("KinkyDungeonSexyPlug") == "True" : false;

			KinkyDungeonSaveMode = localStorage.getItem("KinkyDungeonSaveMode") != undefined ? localStorage.getItem("KinkyDungeonSaveMode") == "True" : false;
			KinkyDungeonRandomMode = localStorage.getItem("KinkyDungeonRandomMode") != undefined ? localStorage.getItem("KinkyDungeonRandomMode") == "True" : false;

			KinkyDungeonNewDress = true;
			let appearance = LZString.decompressFromBase64(localStorage.getItem("kinkydungeonappearance"));
			if (!appearance) {
				KinkyDungeonNewDress = false;
				appearance = CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player);
			}

			CharacterAppearanceRestore(KinkyDungeonPlayer, appearance);


			if (KDPatched)
				// @ts-ignore
				suppressCanvasUpdate(() => CharacterReleaseTotal(KinkyDungeonPlayer));
			else
				CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressSet();
			if (KDPatched)
				// @ts-ignore
				suppressCanvasUpdate(() => CharacterNaked(KinkyDungeonPlayer));
			else
				CharacterNaked(KinkyDungeonPlayer);
			KinkyDungeonInitializeDresses();
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups();
			CharacterRefresh(KinkyDungeonPlayer);
		}

		if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
			KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
			KinkyDungeonKeybindingsTemp = {};
			Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			console.log(KinkyDungeonKeybindings);
		}
		else console.log("Failed to load keybindings");

		if (KinkyDungeonIsPlayer()) {
			if (ServerURL != 'foobar' && KinkyDungeonState == "Consent")
				KinkyDungeonState = "Menu";
			KinkyDungeonGameData = null;

			CharacterAppearancePreviousEmoticon = WardrobeGetExpression(Player).Emoticon;
			ServerSend("ChatRoomCharacterExpressionUpdate", { Name: "Gaming", Group: "Emoticon", Appearance: ServerAppearanceBundle(Player.Appearance) });
		} else {
			KinkyDungeonState = "Game";
			if (!KinkyDungeonGameData) {
				MiniGameKinkyDungeonLevel = 1;
				KinkyDungeonInitialize(1);
			}
		}

		for (const group of KinkyDungeonStruggleGroupsBase) {
			if (group == "ItemM") {
				if (InventoryGet(Player, "ItemMouth"))
					KinkyDungeonRestraintsLocked.push("ItemMouth");
				if (InventoryGet(Player, "ItemMouth2"))
					KinkyDungeonRestraintsLocked.push("ItemMouth2");
				if (InventoryGet(Player, "ItemMouth3"))
					KinkyDungeonRestraintsLocked.push("ItemMouth3");
			}
			if (group == "ItemH") {
				if (InventoryGet(Player, "ItemHood"))
					KinkyDungeonRestraintsLocked.push("ItemHood");
				if (InventoryGet(Player, "ItemHead"))
					KinkyDungeonRestraintsLocked.push("ItemHead");
			}

			if (InventoryGet(Player, group))
				KinkyDungeonRestraintsLocked.push(group);
		}
	}
}

/**
 * Restricts Devious Dungeon Challenge to only occur when inside the arcade
 * @returns {boolean} - If the player is in the arcade
 */
function KinkyDungeonDeviousDungeonAvailable() {
	return KinkyDungeonIsPlayer() && (DialogGamingPreviousRoom == "Arcade" || MiniGameReturnFunction == "ArcadeKinkyDungeonEnd") && ServerURL != 'foobar';
}

/**
 * Returns whether or not the player is the one playing, which determines whether or not to draw the UI and struggle groups
 * @returns {boolean} - If the player is the game player
 */
function KinkyDungeonIsPlayer() {
	return (!KinkyDungeonPlayerCharacter || KinkyDungeonPlayerCharacter == Player) ;
}

/**
 * Runs the kinky dungeon game and draws its components on screen
 * @returns {void} - Nothing
 */

let KinkyDungeonCreditsPos = 0;
let KinkyDungeonPatronPos = 0;
let KDMaxPatronPerPage = 4;
let KDMaxPatron = 3;
let KinkyDungeonSound = true;
let KinkyDungeonFullscreen = true;
let KinkyDungeonDrool = true;
let KinkyDungeonArmor = true;
let KinkyDungeonGraphicsQuality = true;
let KinkyDungeonFastWait = true;
let KinkyDungeonTempWait = false;
let KinkyDungeonSexyMode = false;
let KinkyDungeonClassMode = "Mage";
let KinkyDungeonRandomMode = false;
let KinkyDungeonSaveMode = false;
let KinkyDungeonSexyPiercing = false;
let KinkyDungeonSexyPlug = false;
let KDOldValue = "";
let KDOriginalValue = "";

let KDRestart = false;

let fpscounter = 0;
let lastfps = 0;
let dispfps = 60;

function KinkyDungeonRun() {
	fpscounter++;
	if (fpscounter > 10) {
		fpscounter = 0;
		dispfps = Math.round(10 * 1000 / Math.max(performance.now() - lastfps, 1));
		lastfps = performance.now();
	}
	// Reset the sprites drawn cache
	kdSpritesDrawn = new Map();

	KDButtonsCache = {};
	KDUpdateVibeSounds();
	KDUpdateMusic();
	let BG = "BrickWall";
	DrawImage("Backgrounds/" + BG + ".jpg", 0, 0);

	if (ServerURL != "foobar")
		DrawButtonVis(1885, 25, 90, 90, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Exit.png");

	if (KinkyDungeonFullscreen) {
		KinkyDungeonGridWidthDisplay = 2000/KinkyDungeonGridSizeDisplay;//17;
		KinkyDungeonGridHeightDisplay = 1000/KinkyDungeonGridSizeDisplay;//9;
		canvasOffsetX = 0;
		canvasOffsetY = 0;
		KinkyDungeonCanvas.width = 2000;
		KinkyDungeonCanvas.height = 1000;
	} else {
		KinkyDungeonGridWidthDisplay = 16;
		KinkyDungeonGridHeightDisplay = 9;
		canvasOffsetX = canvasOffsetX_ui;
		canvasOffsetY = canvasOffsetY_ui;
		KinkyDungeonCanvas.width = KinkyDungeonGridSizeDisplay * KinkyDungeonGridWidthDisplay;
		KinkyDungeonCanvas.height = KinkyDungeonGridSizeDisplay * KinkyDungeonGridHeightDisplay;
	}

	// Draw the characters
	if ((KinkyDungeonState != "Game" || KinkyDungeonDrawState != "Game") && KinkyDungeonState != "Stats")
		DrawCharacter(KinkyDungeonPlayer, 0, 0, 1);



	if (KinkyDungeonState == "Mods") {
		DrawButtonKDEx("mods_back", (bdata) => {
			KinkyDungeonState = "Menu";
			KDExecuteMods();
			return true;
		}, true, 975, 850, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");
		DrawButtonKDEx("mods_load", (bdata) => {
			getFileInput();
			return true;
		}, true, 975, 250, 350, 64, TextGet("KinkyDungeonLoadMod"), "#ffffff", "");
		DrawTextKD(TextGet("KinkyDungeonLoadModWarning1"), 1175, 100, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonLoadModWarning2"), 1175, 150, "#ffffff", KDTextGray2);

		KDDrawMods();

	} else if (KinkyDungeonState == "Credits") {
		let credits = TextGet("KinkyDungeonCreditsList" + KinkyDungeonCreditsPos).split('|');
		let i = 0;
		MainCanvas.textAlign = "left";
		for (let c of credits) {
			DrawTextKD(c, 550, 25 + 40 * i, "#ffffff", KDTextGray2);
			i++;
		}
		MainCanvas.textAlign = "center";

		DrawButtonVis(1870, 930, 110, 64, TextGet("KinkyDungeonBack"), "#ffffff", "");
		DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
	} else if (KinkyDungeonState == "Patrons") {
		for (let x = KinkyDungeonPatronPos * KDMaxPatronPerPage; x < KinkyDungeonPatronPos * KDMaxPatronPerPage + KDMaxPatronPerPage && x <= KDMaxPatron; x++) {
			let credits = TextGet("KinkyDungeonPatronsList" + x).split('|');
			let i = 0;
			MainCanvas.textAlign = "left";
			for (let c of credits) {
				DrawTextKD(c, 550 + 350 * (x - KinkyDungeonPatronPos * KDMaxPatronPerPage), 25 + 40 * i, "#ffffff", KDTextGray2);
				i++;
			}
			MainCanvas.textAlign = "center";
		}


		DrawButtonVis(1870, 930, 110, 64, TextGet("KinkyDungeonBack"), "#ffffff", "");
		//DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
		//DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
	} else if (KinkyDungeonState == "Menu") {
		KinkyDungeonGameFlag = false;
		MainCanvas.textAlign = "left";
		DrawCheckboxVis(600, 100, 64, 64, TextGet("KinkyDungeonSound"), KinkyDungeonSound, false, "#ffffff");
		MainCanvas.textAlign = "center";
		// Draw temp start screen
		if (KDLose) {
			DrawTextKD(TextGet("End"), 1250, 250, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("End2"), 1250, 310, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("End3"), 1250, 470, "#ffffff", KDTextGray2);
		} else {
			DrawTextKD(TextGet("KinkyDungeon"), 1250, 200, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("Intro"), 1250, 260, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("Intro2"), 1250, 320, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("Intro3"), 1250, 380, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("Intro4" + (ServerURL == 'foobar' ? "" : "BC")), 1250, 440, "#ffffff", KDTextGray2);
		}

		if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable() && ServerURL != "foobar")
			DrawTextKD(TextGet("DeviousChallenge"), 1250, 925, "#ffffff", KDTextGray2);


		DrawButtonKDEx("GameContinue", () => {
			KinkyDungeonStartNewGame(true);
			return true;
		}, true, 1075, 540, 350, 64, TextGet("GameContinue"), localStorage.getItem('KinkyDungeonSave') ? "#ffffff" : "pink", "");
		DrawButtonKDEx("GameStart", () => {
			KinkyDungeonState = "Diff";
			KinkyDungeonLoadStats();
			return true;
		}, true, 1075, 620, 350, 64, TextGet("GameStart"), "#ffffff", "");
		DrawButtonKDEx("LoadGame", () => {
			KinkyDungeonState = "Load";
			ElementCreateTextArea("saveInputField");
			return true;
		}, true, 1075, 700, 350, 64, TextGet("LoadGame"), "#ffffff", "");
		DrawButtonKDEx("GameConfigKeys", () => {
			KinkyDungeonState = "Keybindings";

			if (!KinkyDungeonKeybindings)
				KDSetDefaultKeybindings();
			else {
				KinkyDungeonKeybindingsTemp = {};
				Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			}
			return true;
		}, true, 1075, 780, 350, 64, TextGet("GameConfigKeys"), "#ffffff", "");

		if (TestMode) {
			DrawButtonKDEx("TileEditor", () => {
				KDInitTileEditor();
				KinkyDungeonState = "TileEditor";
				return true;
			}, true, 1075, 860, 350, 64, "Tile Editor", "#ffffff", "");
		}


		DrawButtonVis(25, 942, 325, 50, TextGet("KinkyDungeonDressPlayer"), "#ffffff", "");
		DrawButtonVis(360, 942, 220, 50, TextGet((KinkyDungeonReplaceConfirm > 0 ) ? "KinkyDungeonConfirm" : "KinkyDungeonDressPlayerReset"), "#ffffff", "");
		DrawButtonVis(590, 942, 150, 50, TextGet("KinkyDungeonDressPlayerImport"), "#ffffff", "");
		DrawButtonVis(1870, 942, 110, 50, TextGet("KinkyDungeonCredits"), "#ffffff", "");
		DrawButtonVis(1700, 942, 150, 50, TextGet("KinkyDungeonPatrons"), "#ffffff", "");
		DrawButtonVis(850, 942, 375, 50, TextGet("KinkyDungeonDeviantart"), "#ffffff", "");
		DrawButtonVis(1275, 942, 375, 50, TextGet("KinkyDungeonPatreon"), "#ffeecc", "");

		DrawButtonVis(1700, 874, 280, 50, TextGet(localStorage.getItem("BondageClubLanguage") ? "English" : "Chinese"), "#ffffff", "");

		if (KDPatched) {
			// @ts-ignore
			DrawButtonKDEx("mods_button", (bdata) => {
				KinkyDungeonState = "Mods";
				return true;
			}, !KDModsLoaded, 1700, 814, 280, 50, TextGet(!KDModsLoaded ? "KDMods" : "KDModsLoaded"), "#ffffff", "");
		}

		if (KDRestart)
			DrawTextKD(TextGet(localStorage.getItem("BondageClubLanguage") ? "RestartNeededCN" : "RestartNeeded"), 1840, 800, "#ffffff", KDTextGray2);
	} else if (KinkyDungeonState == "Consent") {
		MainCanvas.textAlign = "center";
		// Draw temp start screen
		DrawTextKD(TextGet("KinkyDungeonConsent"), 1250, 300, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonConsent2"), 1250, 400, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonConsent3"), 1250, 500, "#ffffff", KDTextGray2);
		DrawButtonVis(975, 720, 450, 64, TextGet("KDOptIn"), "#ffffff", "");
		DrawButtonVis(975, 820, 450, 64, TextGet("KDOptOut"), "#ffffff", "");
	} else if (KinkyDungeonState == "TileEditor") {
		KDDrawTileEditor();
	} else if (KinkyDungeonState == "Load") {
		DrawButtonVis(875, 750, 350, 64, TextGet("KinkyDungeonLoadConfirm"), "#ffffff", "");
		DrawButtonVis(1275, 750, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		ElementPosition("saveInputField", 1250, 550, 1000, 230);
	} else if (KinkyDungeonState == "LoadOutfit") {
		DrawButtonVis(875, 750, 350, 64, TextGet("LoadOutfit"), "#ffffff", "");
		DrawButtonVis(1275, 750, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

		let newValue = ElementValue("saveInputField");
		if (newValue != KDOldValue) {
			let decompressed = LZString.decompressFromBase64(ElementValue("saveInputField"));
			if (decompressed) {
				let origAppearance = KinkyDungeonPlayer.Appearance;
				try {
					CharacterAppearanceRestore(KinkyDungeonPlayer, decompressed);
					CharacterRefresh(KinkyDungeonPlayer);
					KDOldValue = newValue;
					KDInitProtectedGroups();
				} catch (e) {
					// If we fail, it might be a BCX code. try it!
					KinkyDungeonPlayer.Appearance = origAppearance;
					try {
						let parsed = JSON.parse(decompressed);
						if (parsed.length > 0) {
							for (let g of parsed) {
								InventoryWear(KinkyDungeonPlayer, g.Name, g.Group, g.Color);
							}

							CharacterRefresh(KinkyDungeonPlayer);
							KDOldValue = newValue;
							KDInitProtectedGroups();
						} else {
							console.log("Invalid code. Maybe its corrupt?");
						}
					} catch (error) {
						console.log("Invalid code.");
					}
				}
			}
		}

		ElementPosition("saveInputField", 1250, 550, 1000, 230);
	} else if (KinkyDungeonState == "Journey") {
		DrawTextKD(TextGet("KinkyDungeonJourney"), 1250, 300, "#ffffff", KDTextGray2);
		DrawButtonVis(875, 350, 750, 64, TextGet("KinkyDungeonJourney0"), "#ffffff", "");
		DrawButtonVis(875, 450, 750, 64, TextGet("KinkyDungeonJourney1"), "#ffffff", "");
		DrawButtonVis(875, 550, 750, 64, TextGet("KinkyDungeonJourney2"), "#ffffff", "");
		DrawButtonVis(1075, 850, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");

	} else if (KinkyDungeonState == "Diff") {
		DrawTextKD(TextGet("KinkyDungeonDifficulty"), 1250, 170, "#ffffff", KDTextGray2);
		//DrawButtonVis(875, 350, 750, 64, TextGet("KinkyDungeonDifficulty0"), "#ffffff", "");
		//DrawButtonVis(875, 450, 750, 64, TextGet("KinkyDungeonDifficulty3"), "#ffffff", "");
		//DrawButtonVis(875, 550, 750, 64, TextGet("KinkyDungeonDifficulty1"), "#ffffff", "");
		DrawButtonKDEx("startQuick", () => {
			KinkyDungeonStatsChoice = new Map();
			KDUpdatePlugSettings();
			KDLose = false;
			KinkyDungeonStartNewGame();
			return true;
		}, true, 875, 650, 750, 64, TextGet("KinkyDungeonStartGameQuick"), "#ffffff", "");
		DrawButtonKDEx("startGame", () => {
			KinkyDungeonState = "Stats";
			KDUpdatePlugSettings();
			return true;
		}, true, 875, 720, 750, 64, TextGet("KinkyDungeonStartGameAdv"), "#ffffff", "");



		if (MouseIn(875, 650, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDesc"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}
		if (MouseIn(875, 720, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDescAdc"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonVis(1075, 850, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");


		let buttonswidth = 168;
		let buttonsheight = 50;
		let buttonspad = 25;
		let buttonsypad = 10;
		let buttonsstart = 875;
		let X = 0;
		let Y = 0;
		for (let i = 0; i < KDClasses; i++) {
			X = i % 4;
			Y = Math.floor(i / 4);
			// @ts-ignore
			DrawButtonKDEx("Class" + i, (bdata) => {
				KinkyDungeonClassMode = Object.keys(KDClassStart)[i];
				localStorage.setItem("KinkyDungeonClassMode", "" + KinkyDungeonClassMode);
				return true;
			}, true, buttonsstart + (buttonspad + buttonswidth) * X, 250 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight, TextGet("KinkyDungeonClassMode" + i), KinkyDungeonClassMode == Object.keys(KDClassStart)[i] ? "#ffffff" : "#888888", "");
			if (MouseIn(buttonsstart + (buttonspad + buttonswidth) * X, 250 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight)) {
				DrawTextFitKD(TextGet("KinkyDungeonClassModeDesc" + i), 1250, 80, 1000, "#ffffff", KDTextGray0);
			}
		}

		DrawButtonVis(875, 350, 275, 64, TextGet("KinkyDungeonSexyMode0"), !KinkyDungeonSexyMode ? "#ffffff" : "#888888", "");
		if (MouseIn(875, 350, 275, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonSexyModeDesc0"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonVis(1175, 350, 275, 64, TextGet("KinkyDungeonSexyMode1"), KinkyDungeonSexyMode ? "#ffffff" : "#888888", "");
		if (MouseIn(1175, 350, 275, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonSexyModeDesc1"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonVis(875, 450, 275, 64, TextGet("KinkyDungeonRandomMode0"), !KinkyDungeonRandomMode ? "#ffffff" : "#888888", "");
		if (MouseIn(875, 450, 275, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonRandomModeDesc0"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonVis(1175, 450, 275, 64, TextGet("KinkyDungeonRandomMode1"), KinkyDungeonRandomMode ? "#ffffff" : "#888888", "");
		if (MouseIn(1175, 450, 275, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonRandomModeDesc1"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonVis(875, 550, 275, 64, TextGet("KinkyDungeonSaveMode0"), !KinkyDungeonSaveMode ? "#ffffff" : "#888888", "");
		if (MouseIn(875, 550, 275, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonSaveModeDesc0"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonVis(1175, 550, 275, 64, TextGet("KinkyDungeonSaveMode1"), KinkyDungeonSaveMode ? "#ffffff" : "#888888", "");
		if (MouseIn(1175, 550, 275, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonSaveModeDesc1"), 1250, 80, 1000, "#ffffff", KDTextGray0);
		}

		if (KinkyDungeonSexyMode) {
			MainCanvas.textAlign = "left";
			DrawCheckboxVis(1500, 420, 64, 64, TextGet("KinkyDungeonSexyPlugs"), KinkyDungeonSexyPlug, false, "#ffffff");
			DrawCheckboxVis(1500, 500, 64, 64, TextGet("KinkyDungeonSexyPiercings"), KinkyDungeonSexyPiercing, false, "#ffffff");
			MainCanvas.textAlign = "center";
		}


	} else if (KinkyDungeonState == "Stats") {

		let tooltip = KinkyDungeonDrawPerks(false);
		DrawTextKD(TextGet("KinkyDungeonStats"), 1000, 30, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonStats2"), 1000, 80, "#ffffff", KDTextGray2);
		if (!tooltip) {
			let points = KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice);
			let hardmode = points >= KDHardModeThresh ? TextGet("KDHardMode") : "";
			DrawTextKD(TextGet("KinkyDungeonStatPoints").replace("AMOUNT", "" + points) + hardmode, 1000, 150, "#ffffff", KDTextGray2);
		}
		DrawButtonVis(875, 920, 350, 64, TextGet("KinkyDungeonStartGame"), KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) >= 0 ? "#ffffff" : "pink", "");
		DrawButtonVis(1275, 920, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "");
		DrawButtonVis(100, 920, 190, 64, TextGet("KinkyDungeonClearAll"), "#ffffff", "");
		DrawButtonVis(330, 930, 140, 54, TextGet("KinkyDungeonConfig") + "1", KinkyDungeonPerksConfig == "1" ? "#ffffff" : "#888888", "");
		DrawButtonVis(480, 930, 140, 54, TextGet("KinkyDungeonConfig") + "2", KinkyDungeonPerksConfig == "2" ? "#ffffff" : "#888888", "");
		DrawButtonVis(630, 930, 140, 54, TextGet("KinkyDungeonConfig") + "3", KinkyDungeonPerksConfig == "3" ? "#ffffff" : "#888888", "");

		// @ts-ignore
		DrawButtonKDEx("copyperks", (bdata) => {
			let txt = "";
			for (let k of KinkyDungeonStatsChoice.keys()) {
				if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "\n" : "") + k;
			}
			navigator.clipboard.writeText(txt);
			return true;
		}, true, 1850, 930, 140, 54, TextGet("KinkyDungeonCopyPerks"), "#ffffff", "");

		DrawButtonKDEx("pasteperks", (bdata) => {
			navigator.clipboard.readText()
				.then(text => {
					let list = text.split('\n');
					let changed = 1;
					let iter = 0;
					while (changed > 0 && iter < 1000) {
						changed = 0;
						for (let l of list) {
							let lp = l.replace('\r','');// List processed
							// Find the perk that matches the name
							for (let perk of Object.entries(KinkyDungeonStatsPresets)) {
								if (perk[0] == lp) {
									KinkyDungeonStatsChoice.set(perk[0], true);
									changed += 1;
								}// else if (KinkyDungeonStatsChoice.get(perk[0])) KinkyDungeonStatsChoice.delete(perk[0])
							}
						}
						iter += 1;
					}
				})
				.catch(err => {
					console.error('Failed to read clipboard contents: ', err);
				});
			return true;
		}, true, 1700, 930, 140, 54, TextGet("KinkyDungeonPastePerks"), "#ffffff", "");


		if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
			if (KinkyDungeonKeybindingCurrentKey)
				KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
			KinkyDungeonKeybindingCurrentKey = '';
		}
	} else if (KinkyDungeonState == "Save") {
		// Draw temp start screen
		DrawTextKD(TextGet("KinkyDungeonSaveIntro0"), 1250, 350, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro"), 1250, 475, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro2"), 1250, 550, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro3"), 1250, 625, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro4"), 1250, 700, "#ffffff", KDTextGray2);

		ElementPosition("saveDataField", 1250, 150, 1000, 230);

		//DrawButtonVis(875, 750, 350, 64, TextGet("KinkyDungeonGameSave"), "#ffffff", "");
		DrawButtonVis(1075, 750, 350, 64, TextGet("KinkyDungeonGameContinue"), "#ffffff", "");
	} else if (KinkyDungeonState == "Game") {
		KinkyDungeonGameRunning = true;
		KinkyDungeonGameFlag = true;
		KinkyDungeonDrawGame();
		if (KinkyDungeonInputQueue.length < 1) {
			let _CharacterRefresh = CharacterRefresh;
			let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
			// @ts-ignore
			CharacterRefresh = () => {KDRefresh = true;};
			// @ts-ignore
			CharacterAppearanceBuildCanvas = () => {};

			if (KDGameData.SleepTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KDGameData.SleepTurns -= 1;
					if (KinkyDungeonAggressive())
						KinkyDungeonTotalSleepTurns += 1;
					if (KinkyDungeonStatStamina >= KinkyDungeonStatStaminaMax && KinkyDungeonStatWill >= KinkyDungeonStatWillMax)  {
						KDGameData.SleepTurns = 0;
					}
					// Decrease offer fatigue
					KDIncreaseOfferFatigue(-1);
					KDSendInput("tick", {delta: 1, sleep: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + 10;
				}
				if (KDGameData.SleepTurns == 0) {
					KinkyDungeonChangeStamina(0);
					KinkyDungeonChangeWill(0);
					if (CharacterItemsHavePoseAvailable(KinkyDungeonPlayer, "BodyLower", "Kneel") && !CharacterDoItemsSetPose(KinkyDungeonPlayer, "Kneel") && KinkyDungeonPlayer.IsKneeling()) {
						CharacterSetActivePose(KinkyDungeonPlayer, "BaseLower", false);
					}
				}
			} else if (KDGameData.PlaySelfTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KDSendInput("tick", {delta: 1}, false, true);
					KDGameData.PlaySelfTurns -= 1;
					KinkyDungeonSleepTime = CommonTime() + 230 * (0.5 + KDAnimSpeed * 0.5);
				}
				if (KDGameData.SleepTurns == 0) {
					KinkyDungeonChangeStamina(0);
				}
			} else if (KinkyDungeonStatFreeze > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KinkyDungeonStatFreeze -= 1;
					KDSendInput("tick", {delta: 1, NoUpdate: false, NoMsgTick: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime * (0.5 + KDAnimSpeed * 0.5);
				}
			} else if (KinkyDungeonSlowMoveTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KinkyDungeonSlowMoveTurns -= 1;
					KDSendInput("tick", {delta: 1, NoUpdate: false, NoMsgTick: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + 100 * (0.5 + KDAnimSpeed * 0.5);
				}
			} else if (KinkyDungeonFastMove && KinkyDungeonFastMovePath && KinkyDungeonFastMovePath.length > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					if (KinkyDungeonFastMovePath.length > 0) {
						let next = KinkyDungeonFastMovePath[0];
						KinkyDungeonFastMovePath.splice(0, 1);
						if (Math.max(Math.abs(next.x-KinkyDungeonPlayerEntity.x), Math.abs(next.y-KinkyDungeonPlayerEntity.y)) < 1.5)
							KDSendInput("move", {dir: {x:next.x-KinkyDungeonPlayerEntity.x, y:next.y-KinkyDungeonPlayerEntity.y}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
						else KinkyDungeonFastMovePath = [];
					}
					KinkyDungeonSleepTime = CommonTime() + 100 * (0.5 + KDAnimSpeed * 0.5);
				}
			} else if (KinkyDungeonFastStruggle && KinkyDungeonFastStruggleType && KinkyDungeonFastStruggleGroup) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					let result = KDSendInput("struggle", {group: KinkyDungeonFastStruggleGroup, type: KinkyDungeonFastStruggleType}, false, true);
					if (result != "Fail" || !KinkyDungeonHasStamina(2.5)) {
						KinkyDungeonFastStruggleType = "";
						KinkyDungeonFastStruggleGroup = "";
					}
					KinkyDungeonSleepTime = CommonTime() + 250 * (0.5 + KDAnimSpeed * 0.5);
				}
			} else if (KinkyDungeonAutoWait) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					let lastStamina = KinkyDungeonStatStamina;
					KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
					if (KinkyDungeonFastStruggle && KinkyDungeonStatStamina == KinkyDungeonStatStaminaMax && lastStamina < KinkyDungeonStatStamina) {
						if (KinkyDungeonTempWait && !KDGameData.KinkyDungeonLeashedPlayer && !KinkyDungeonInDanger())
							KinkyDungeonAutoWait = false;
					}
					KinkyDungeonSleepTime = CommonTime() + (KinkyDungeonFastWait ? 100 : 300);
				}
			} else KinkyDungeonSleepTime = CommonTime() + 100;
			// @ts-ignore
			CharacterRefresh = _CharacterRefresh;
			// @ts-ignore
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		} else KinkyDungeonSleepTime = CommonTime() + 100;

	} else if (KinkyDungeonState == "End") {
		KinkyDungeonGameRunning = false;
		// Draw temp start screen
		DrawTextKD(TextGet("EndWin"), 1250, 400, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("EndWin2"), 1250, 500, "#ffffff", KDTextGray2);

		DrawButtonVis(1075, 650, 350, 64, TextGet("KinkyDungeonNewGamePlus"), "#ffffff", "");
		DrawButtonVis(1075, 750, 350, 64, TextGet("GameReturnToMenu"), "#ffffff", "");
	} else if (KinkyDungeonState == "Keybindings") {
		// Draw temp start screen
		DrawButtonKDEx("KBBack", () => {
			KinkyDungeonKeybindings = KinkyDungeonKeybindingsTemp;
			if (KinkyDungeonGameFlag) {
				KinkyDungeonState = "Game";
				if (KinkyDungeonKeybindings) {
					KDCommitKeybindings();
				}
			} else KinkyDungeonState = "Menu";
			localStorage.setItem("KinkyDungeonKeybindings", JSON.stringify(KinkyDungeonKeybindings));
			//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
			return true;
		}, true, 1450, 780, 350, 64, TextGet("GameReturnToMenu"), "#ffffff", "");

		// Draw temp start screen
		DrawButtonKDEx("KBBack2", () => {
			KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
			if (KinkyDungeonGameFlag) {
				KinkyDungeonState = "Game";
			} else KinkyDungeonState = "Menu";
			//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
			return true;
		}, true, 1450, 700, 350, 64, TextGet("GameReturnToMenu2"), "#ffffff", "");

		// Draw key buttons
		DrawButtonKDEx("KBUp", () => {KinkyDungeonKeybindingsTemp.Up = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 100, 300, 64, TextGet("KinkyDungeonKeyUp") + ": '" + (KinkyDungeonKeybindingsTemp.Up) + "'", "#ffffff", "");
		DrawButtonKDEx("KBDown", () => {KinkyDungeonKeybindingsTemp.Down = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 180, 300, 64, TextGet("KinkyDungeonKeyDown") + ": '" + (KinkyDungeonKeybindingsTemp.Down) + "'", "#ffffff", "");
		DrawButtonKDEx("KBLeft", () => {KinkyDungeonKeybindingsTemp.Left = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 260, 300, 64, TextGet("KinkyDungeonKeyLeft") + ": '" + (KinkyDungeonKeybindingsTemp.Left) + "'", "#ffffff", "");
		DrawButtonKDEx("KBRight", () => {KinkyDungeonKeybindingsTemp.Right = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 340, 300, 64, TextGet("KinkyDungeonKeyRight") + ": '" + (KinkyDungeonKeybindingsTemp.Right) + "'", "#ffffff", "");

		DrawButtonKDEx("KBUpLleft", () => {KinkyDungeonKeybindingsTemp.UpLeft = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 420, 300, 64, TextGet("KinkyDungeonKeyUpLeft") + ": '" + (KinkyDungeonKeybindingsTemp.UpLeft) + "'", "#ffffff", "");
		DrawButtonKDEx("KBUpRight", () => {KinkyDungeonKeybindingsTemp.UpRight = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 500, 300, 64, TextGet("KinkyDungeonKeyUpRight") + ": '" + (KinkyDungeonKeybindingsTemp.UpRight) + "'", "#ffffff", "");
		DrawButtonKDEx("KBDownLeft", () => {KinkyDungeonKeybindingsTemp.DownLeft = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 580, 300, 64, TextGet("KinkyDungeonKeyDownLeft") + ": '" + (KinkyDungeonKeybindingsTemp.DownLeft) + "'", "#ffffff", "");
		DrawButtonKDEx("KBDownRight", () => {KinkyDungeonKeybindingsTemp.DownRight = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 660, 300, 64, TextGet("KinkyDungeonKeyDownRight") + ": '" + (KinkyDungeonKeybindingsTemp.DownRight) + "'", "#ffffff", "");

		DrawButtonKDEx("KBWait", () => {KinkyDungeonKeybindingsTemp.Wait = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1075, 780, 300, 64, TextGet("KinkyDungeonKeyWait") + ": '" + (KinkyDungeonKeybindingsTemp.Wait) + "'", "#ffffff", "");

		DrawButtonKDEx("KBSpell1", () => {KinkyDungeonKeybindingsTemp.Spell1 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 100, 300, 50, TextGet("KinkyDungeonKeySpell1") + ": '" + (KinkyDungeonKeybindingsTemp.Spell1) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpell2", () => {KinkyDungeonKeybindingsTemp.Spell2 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 160, 300, 50, TextGet("KinkyDungeonKeySpell2") + ": '" + (KinkyDungeonKeybindingsTemp.Spell2) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpell3", () => {KinkyDungeonKeybindingsTemp.Spell3 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 220, 300, 50, TextGet("KinkyDungeonKeySpell3") + ": '" + (KinkyDungeonKeybindingsTemp.Spell3) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpell4", () => {KinkyDungeonKeybindingsTemp.Spell4 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 280, 300, 50, TextGet("KinkyDungeonKeySpell4") + ": '" + (KinkyDungeonKeybindingsTemp.Spell4) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpell5", () => {KinkyDungeonKeybindingsTemp.Spell5 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 340, 300, 50, TextGet("KinkyDungeonKeySpell5") + ": '" + (KinkyDungeonKeybindingsTemp.Spell5) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpell6", () => {KinkyDungeonKeybindingsTemp.Spell6 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 400, 300, 50, TextGet("KinkyDungeonKeySpell6") + ": '" + (KinkyDungeonKeybindingsTemp.Spell6) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpell7", () => {KinkyDungeonKeybindingsTemp.Spell7 = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 460, 300, 50, TextGet("KinkyDungeonKeySpell7") + ": '" + (KinkyDungeonKeybindingsTemp.Spell7) + "'", "#ffffff", "");

		DrawButtonKDEx("KBSpellPage", () => {KinkyDungeonKeybindingsTemp.SpellPage = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 520, 300, 50, TextGet("KinkyDungeonKeySpellPage") + ": '" + (KinkyDungeonKeybindingsTemp.SpellPage) + "'", "#ffffff", "");

		DrawButtonKDEx("KBUpcast", () => {KinkyDungeonKeybindingsTemp.Upcast = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 580, 300, 50, TextGet("KinkyDungeonKeyUpcast") + ": '" + (KinkyDungeonKeybindingsTemp.Upcast) + "'", "#ffffff", "");
		DrawButtonKDEx("KBUpcastCancel", () => {KinkyDungeonKeybindingsTemp.UpcastCancel = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 640, 300, 50, TextGet("KinkyDungeonKeyUpcastCancel") + ": '" + (KinkyDungeonKeybindingsTemp.UpcastCancel) + "'", "#ffffff", "");

		DrawButtonKDEx("KBSwitchWeapon", () => {KinkyDungeonKeybindingsTemp.SwitchWeapon = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 700, 300, 50, TextGet("KinkyDungeonKeySwitchWeapon") + ": '" + (KinkyDungeonKeybindingsTemp.SwitchWeapon) + "'", "#ffffff", "");
		DrawButtonKDEx("KBSpellWeapon", () => {KinkyDungeonKeybindingsTemp.SpellWeapon = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 760, 300, 50, TextGet("KinkyDungeonKeySpellWeapon") + ": '" + (KinkyDungeonKeybindingsTemp.SpellWeapon) + "'", "#ffffff", "");

		DrawButtonKDEx("KBSkip", () => {KinkyDungeonKeybindingsTemp.Skip = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			675, 820, 300, 50, TextGet("KinkyDungeonKeySkip") + ": '" + (KinkyDungeonKeybindingsTemp.Skip) + "'", "#ffffff", "");


		DrawButtonKDEx("KBMsgLog", () => {KinkyDungeonKeybindingsTemp.MsgLog = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 100, 300, 45, TextGet("KinkyDungeonKeyMsgLog") + ": '" + (KinkyDungeonKeybindingsTemp.MsgLog) + "'", "#ffffff", "");
		DrawButtonKDEx("KBDoor", () => {KinkyDungeonKeybindingsTemp.Door = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 150, 300, 45, TextGet("KinkyDungeonKeyDoor") + ": '" + (KinkyDungeonKeybindingsTemp.Door) + "'", "#ffffff", "");
		DrawButtonKDEx("KBPass", () => {KinkyDungeonKeybindingsTemp.Pass = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 200, 300, 45, TextGet("KinkyDungeonKeyPass") + ": '" + (KinkyDungeonKeybindingsTemp.Pass) + "'", "#ffffff", "");
		DrawButtonKDEx("KBAStruggle", () => {KinkyDungeonKeybindingsTemp.AStruggle = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 250, 300, 45, TextGet("KinkyDungeonKeyAStruggle") + ": '" + (KinkyDungeonKeybindingsTemp.AStruggle) + "'", "#ffffff", "");
		DrawButtonKDEx("KBAPathfind", () => {KinkyDungeonKeybindingsTemp.APathfind = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 300, 300, 45, TextGet("KinkyDungeonKeyAPathfind") + ": '" + (KinkyDungeonKeybindingsTemp.APathfind) + "'", "#ffffff", "");
		DrawButtonKDEx("KBASprint", () => {KinkyDungeonKeybindingsTemp.Sprint = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 350, 300, 45, TextGet("KinkyDungeonKeySprint") + ": '" + (KinkyDungeonKeybindingsTemp.Sprint) + "'", "#ffffff", "");
		DrawButtonKDEx("KBInspect", () => {KinkyDungeonKeybindingsTemp.AInspect = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 400, 300, 45, TextGet("KinkyDungeonKeyInspect") + ": '" + (KinkyDungeonKeybindingsTemp.AInspect) + "'", "#ffffff", "");

		DrawButtonKDEx("KBQInventory", () => {KinkyDungeonKeybindingsTemp.QInventory = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 425, 300, 45, TextGet("KinkyDungeonKeyQInventory") + ": '" + (KinkyDungeonKeybindingsTemp.QInventory) + "'", "#ffffff", "");
		DrawButtonKDEx("KBInventory", () => {KinkyDungeonKeybindingsTemp.Inventory = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 475, 300, 45, TextGet("KinkyDungeonKeyInventory") + ": '" + (KinkyDungeonKeybindingsTemp.Inventory) + "'", "#ffffff", "");
		DrawButtonKDEx("KBReputation", () => {KinkyDungeonKeybindingsTemp.Reputation = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 525, 300, 45, TextGet("KinkyDungeonKeyReputation") + ": '" + (KinkyDungeonKeybindingsTemp.Reputation) + "'", "#ffffff", "");
		DrawButtonKDEx("KBMagic", () => {KinkyDungeonKeybindingsTemp.Magic = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 575, 300, 45, TextGet("KinkyDungeonKeyMagic") + ": '" + (KinkyDungeonKeybindingsTemp.Magic) + "'", "#ffffff", "");
		DrawButtonKDEx("KBLog", () => {KinkyDungeonKeybindingsTemp.Log = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
			1475, 625, 300, 45, TextGet("KinkyDungeonKeyLog") + ": '" + (KinkyDungeonKeybindingsTemp.Log) + "'", "#ffffff", "");

		if (KinkyDungeonKeybindingCurrentKey)
			DrawTextKD(TextGet("KinkyDungeonCurrentPress") + ": '" + (KinkyDungeonKeybindingCurrentKey) + "'", 1250, 900, "#ffffff", KDTextGray2);

		DrawTextKD(TextGet("KinkyDungeonCurrentPressInfo"), 1250, 950, "#ffffff", KDTextGray2);
	}

	if (KDDebugMode) {
		DrawTextKD(dispfps, 20, 20, "#ffffff", undefined, undefined, "left");
	}
	// Cull the sprites that werent rendered or updated this frame
	for (let sprite of kdpixisprites.entries()) {
		if (!kdSpritesDrawn.has(sprite[0])) {
			sprite[1].parent.removeChild(sprite[1]);
			if (kdprimitiveparams.has(sprite[0])) kdprimitiveparams.delete(sprite[0]);
			kdpixisprites.delete(sprite[0]);
			sprite[1].destroy();
		}
	}

	if (!pixiview) pixiview = document.getElementById("MainCanvas");
	if (!pixirenderer) {
		if (pixiview) {
			// @ts-ignore
			pixirenderer = new PIXI.CanvasRenderer({
				// @ts-ignore
				width: pixiview.width,
				// @ts-ignore
				height: pixiview.height,
				view: pixiview,
				antialias: true,
			});
		}
	}

	// Draw the context layer even if we haven't updated it
	if (pixirenderer) {
		pixirenderer.render(kdcanvas, {
			clear: false,
		});
		pixirenderer.render(kdui, {
			clear: false,
		});
	}

	MainCanvas.textBaseline = "middle";
}

/**
 * @type {Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata: any) => boolean}>}
 */
let KDButtonsCache = {

};
/**
 * Draws a button component
 * @param {string} name - Name of the button element
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables the border and stuff
 * @returns {void} - Nothing
 */
function DrawButtonKD(name, enabled, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder) {
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
	};
}


/**
 * Draws a button component
 * @param {string} name - Name of the button element
 * @param {(bdata: any) => boolean} func - Whether or not you can click on it
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables border
 * @param {string} [FillColor] - BG color
 * @param {number} [FontSize] - Font size
 * @param {boolean} [ShiftText] - Shift text to make room for the button
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @returns {void} - Nothing
 */
function DrawButtonKDEx(name, func, enabled, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, options) {
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, undefined, undefined, options);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		func,
	};
}

function KDProcessButtons() {
	for (let button of Object.entries(KDButtonsCache)) {
		if (button[1].enabled && button[1].func) {
			if (MouseInKD(button[0])) {
				return button[1].func();
			}
		}
	}
	return false;
}

function KDClickButton(name) {
	let button = KDButtonsCache[name];
	if (button && button.enabled) {
		return button.func();
	}
	return false;
}

function MouseInKD(name) {
	let button = KDButtonsCache[name];
	if (button && button.enabled) {
		return MouseIn(button.Left, button.Top, button.Width, button.Height);
	}
	return false;
}

function KinkyDungeonGetTraitsCount() {
	return Array.from(KinkyDungeonStatsChoice.keys()).filter((element) => {return !element.includes('arousalMode');}).length;
}

function KDSendTrait(trait) {
	// @ts-ignore
	if (window.dataLayer)
		// @ts-ignore
		window.dataLayer.push({
			'event':'trait',
			'traitType':trait,
			'journey':KDJourney,
		});
}

function KDSendSpell(spell) {
	// @ts-ignore
	if (window.dataLayer)
		// @ts-ignore
		window.dataLayer.push({
			'event':'spell',
			'spellType':spell,
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'journey':KDJourney,
		});
}

function KDSendSpellCast(spell) {
	// @ts-ignore
	if (window.dataLayer)
		// @ts-ignore
		window.dataLayer.push({
			'event':'spellCast',
			'spellType':spell,
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'journey':KDJourney,
		});
}
function KDSendWeapon(weapon) {
	// @ts-ignore
	if (window.dataLayer)
		// @ts-ignore
		window.dataLayer.push({
			'event':'weapon',
			'weapon':weapon,
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'journey':KDJourney,
		});
}

function KDSendStatus(type, data, data2) {
	// @ts-ignore
	if (window.dataLayer && !KDOptOut) {
		// @ts-ignore
		window.dataLayer.push({
			'event':'gameStatus',
			'currentLevel':MiniGameKinkyDungeonLevel,
			'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
			'difficulty':KinkyDungeonStatsChoice.get("randomMode"),
			'newgameplus':KinkyDungeonNewGame,
			'statusType':type,
			'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
			'traitscount':KinkyDungeonGetTraitsCount(),
			'gold':Math.round(KinkyDungeonGold / 100) * 100,
			'spellType': type == 'learnspell' ? data : undefined,
			'goddess': type == 'goddess' ? data : undefined,
			'helpType': type == 'goddess' ? data2 : undefined,
			'restraint': (type == 'escape' || type == 'bound') ? data : undefined,
			'method': type == 'escape' ? data2 : undefined,
			'attacker': type == 'bound' ? data2 : undefined,
			'prisonerstate': KDGameData.PrisonerState,
		});
		if (type == 'nextLevel' && !KinkyDungeonStatsChoice.get("randomMode")) {
			for (let s of KinkyDungeonSpells) {
				KDSendSpell(s.name);
			}
			KDSendWeapon((KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name) ? KinkyDungeonPlayerDamage.name : 'unarmed');
		}
	}
}
function KDSendEvent(type) {
	// @ts-ignore
	if (window.dataLayer && !KDOptOut)
		if (type == 'newGame') {
		// @ts-ignore
			window.dataLayer.push({
				'event':type,
				'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
				'traitscount':KinkyDungeonGetTraitsCount(),
				'journey':KDJourney,
			});
			for (let s of KinkyDungeonStatsChoice.keys()) {
				KDSendTrait(s);
			}
		} else if (type == 'jail') {
			// @ts-ignore
			window.dataLayer.push({
				'event':type,
				'currentLevel':MiniGameKinkyDungeonLevel,
				'alreadyInJail':KinkyDungeonInJail() ? 'true' : 'false',
				'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
				'difficulty':KinkyDungeonStatsChoice.get("randomMode"),
				'newgameplus':KinkyDungeonNewGame,
				'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
				'traitscount':KinkyDungeonGetTraitsCount(),
				'gold':Math.round(KinkyDungeonGold / 100) * 100,
				'journey':KDJourney,
			});
		} else if (type == 'loadGame') {
			// @ts-ignore
			window.dataLayer.push({
				'event':type,
				'currentLevel':MiniGameKinkyDungeonLevel,
				'currentCheckpoint':MiniGameKinkyDungeonCheckpoint,
				'difficulty':KinkyDungeonStatsChoice.get("randomMode"),
				'newgameplus':KinkyDungeonNewGame,
				'aroused':KinkyDungeonStatsChoice.get("arousalMode") ? 'yes' : 'no',
				'traitscount':KinkyDungeonGetTraitsCount(),
				'gold':Math.round(KinkyDungeonGold / 100) * 100,
				'journey':KDJourney,
			});
		} else if (type == 'patreon') {
			// @ts-ignore
			window.dataLayer.push({
				'event':type,
			});
		} else if (type == 'optout' || type == 'optin') {
			// @ts-ignore
			window.dataLayer.push({
				'event':type,
			});
		}
}

function KinkyDungeonLoadStats() {
	KinkyDungeonStatsChoice = new Map();
	let statsChoice = localStorage.getItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig);
	if (statsChoice) {
		let statsArray = JSON.parse(statsChoice);
		if (statsArray) {
			for (let s of statsArray) {
				if (!s.includes('arousalMode') && KinkyDungeonStatsPresets[s])
					KinkyDungeonStatsChoice.set(s, true);
			}
		}
	}
}

let KinkyDungeonReplaceConfirm = 0;
let KinkyDungeonGameFlag = false;

let KDDefaultJourney = ["grv", "cat", "jng", "tmp"];
let KDDefaultAlt = ["tmb", "lib", "cry", "tmp"];

function KDInitializeJourney(Journey) {
	/**
	 * @type {Record<string, string>}
	 */
	let newIndex = {};

	for (let map of KDDefaultJourney) {
		newIndex[map] = map;
	}
	for (let map of KDDefaultAlt) {
		newIndex[map] = map;
	}

	if (Journey)
		KDGameData.Journey = Journey;
	// Option to shuffle the dungeon types besides the initial one (graveyard)
	if (KDGameData.Journey == "Random") {
		/* Randomize array in-place using Durstenfeld shuffle algorithm */
		// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		let randList = Array.from(Object.keys(newIndex));
		for (let i = randList.length - 1; i >= 0; i--) {
			let j = Math.floor(KDRandom() * (i + 1));
			let temp = randList[i];
			randList[i] = randList[j];
			randList[j] = temp;
		}
		let ii = 0;
		for (let index of Object.keys(newIndex)) {
			newIndex[index] = randList[ii];
			ii++;
		}

	} else if (KDGameData.Journey == "Harder") {
		for (let i = 0; i < KDDefaultJourney.length; i++) {
			newIndex[KDDefaultAlt[i]] = KDDefaultJourney[i];
			newIndex[KDDefaultJourney[i]] = KDDefaultAlt[i];
		}
	} else if (KDGameData.Journey == "Explorer") {
		newIndex.grv = 'jng';
		newIndex.tmb = 'cry';
		newIndex.tmp = 'lib';
		newIndex.jng = 'tmp';
		newIndex.cry = 'tmb';
		newIndex.cat = 'grv';
	}

	KinkyDungeonMapIndex = newIndex;
}



function KDCommitKeybindings() {
	KinkyDungeonKey = [KinkyDungeonKeybindings.Up, KinkyDungeonKeybindings.Left, KinkyDungeonKeybindings.Down, KinkyDungeonKeybindings.Right, KinkyDungeonKeybindings.UpLeft, KinkyDungeonKeybindings.UpRight, KinkyDungeonKeybindings.DownLeft, KinkyDungeonKeybindings.DownRight]; // WASD
	KinkyDungeonGameKey.KEY_UP = (KinkyDungeonKeybindings.Up);
	KinkyDungeonGameKey.KEY_DOWN = (KinkyDungeonKeybindings.Down);
	KinkyDungeonGameKey.KEY_LEFT = (KinkyDungeonKeybindings.Left);
	KinkyDungeonGameKey.KEY_RIGHT = (KinkyDungeonKeybindings.Right);
	KinkyDungeonGameKey.KEY_UPLEFT = (KinkyDungeonKeybindings.UpLeft);
	KinkyDungeonGameKey.KEY_DOWNLEFT = (KinkyDungeonKeybindings.DownLeft);
	KinkyDungeonGameKey.KEY_UPRIGHT = (KinkyDungeonKeybindings.UpRight);
	KinkyDungeonGameKey.KEY_DOWNRIGHT = (KinkyDungeonKeybindings.DownRight);

	//let KinkyDungeonKeyNumpad = [56, 52, 50, 54, 55, 57, 49, 51]; // Numpad
	KinkyDungeonKeySpell = [
		KinkyDungeonKeybindings.Spell1,
		KinkyDungeonKeybindings.Spell2,
		KinkyDungeonKeybindings.Spell3,
		KinkyDungeonKeybindings.Spell4,
		KinkyDungeonKeybindings.Spell5,
		KinkyDungeonKeybindings.Spell6,
		KinkyDungeonKeybindings.Spell7,
	]; // ! @ #
	KinkyDungeonKeyWait = [KinkyDungeonKeybindings.Wait];
	KinkyDungeonKeySkip = [KinkyDungeonKeybindings.Skip];
	KinkyDungeonKeyUpcast = [KinkyDungeonKeybindings.Upcast, KinkyDungeonKeybindings.UpcastCancel];
	KinkyDungeonKeyWeapon = [KinkyDungeonKeybindings.SpellWeapon]; // 8 (57)
	KinkyDungeonKeyMenu = [
		KinkyDungeonKeybindings.QInventory,
		KinkyDungeonKeybindings.Inventory,
		KinkyDungeonKeybindings.Reputation,
		KinkyDungeonKeybindings.Magic,
		KinkyDungeonKeybindings.Log,
	];
	KinkyDungeonKeyToggle = [
		KinkyDungeonKeybindings.MsgLog,
		KinkyDungeonKeybindings.Pass,
		KinkyDungeonKeybindings.Door,
		KinkyDungeonKeybindings.AStruggle,
		KinkyDungeonKeybindings.APathfind,
		KinkyDungeonKeybindings.AInspect,
	];

	KinkyDungeonKeyEnter = [KinkyDungeonKeybindings.Enter];
	KinkyDungeonKeySpellPage = [KinkyDungeonKeybindings.SpellPage];
	KinkyDungeonKeySwitchWeapon = [KinkyDungeonKeybindings.SwitchWeapon];
	KinkyDungeonKeySprint = [KinkyDungeonKeybindings.Sprint];

	KinkyDungeonGameKey.KEY_WAIT = (KinkyDungeonKeybindings.Wait);
	KinkyDungeonGameKey.KEY_SKIP = (KinkyDungeonKeybindings.Skip);
}

function KinkyDungeonStartNewGame(Load) {
	KinkyDungeonNewGame = 0;
	KinkyDungeonInitialize(1, Load);
	MiniGameKinkyDungeonCheckpoint = "grv";
	KinkyDungeonGrid = "";
	if (Load) {
		KinkyDungeonLoadGame();
		KDSendEvent('loadGame');
	} else {
		KDSendEvent('newGame');
		KDGameData.RoomType = "JourneyFloor";
		MiniGameKinkyDungeonLevel = 0;
		KDInitializeJourney("");
	}
	if (!KinkyDungeonGrid)
		KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]], MiniGameKinkyDungeonLevel, false, Load);
	KinkyDungeonState = "Game";

	if (KinkyDungeonKeybindings) {
		KDCommitKeybindings();
	}
	if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/StoneDoor_Close.ogg");
}

function KDUpdatePlugSettings() {
	KinkyDungeonStatsChoice.set("arousalMode", KinkyDungeonSexyMode ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePlug", KinkyDungeonSexyPlug ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePiercing", KinkyDungeonSexyPiercing ? true : undefined);

	KinkyDungeonStatsChoice.set("randomMode", KinkyDungeonRandomMode ? true : undefined);
	KinkyDungeonStatsChoice.set("saveMode", KinkyDungeonSaveMode ? true : undefined);


	for (let i = 0; i < KDClasses; i++) {
		KinkyDungeonStatsChoice.set("classMode", KinkyDungeonClassMode == Object.keys(KDClassStart)[i] ? true : undefined);
	}
	let points = KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice);
	KinkyDungeonStatsChoice.set("hardMode", points >= KDHardModeThresh ? true : undefined);
}

let KDHardModeThresh = 10;

function KinkyDungeonHandleClick() {
	if (KDProcessButtons()) return true;

	if (MouseIn(1885, 25, 90, 90) && (ServerURL != "foobar")) {
		ElementRemove("saveDataField");
		ElementRemove("saveInputField");
		KinkyDungeonExit();
		return true;
	}
	if (KinkyDungeonState == "Credits") {
		if (MouseIn(1870, 930, 110, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
		if (MouseIn(1730, 930, 110, 64)) {
			if (KinkyDungeonCreditsPos < 1) KinkyDungeonCreditsPos += 1;
			else KinkyDungeonCreditsPos = 0;
		}
	} if (KinkyDungeonState == "Patrons") {
		if (MouseIn(1870, 930, 110, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
		if (MouseIn(1730, 930, 110, 64)) {
			if (KinkyDungeonPatronPos < 1) KinkyDungeonPatronPos += 1;
			else KinkyDungeonPatronPos = 0;
		}
	} else if (KinkyDungeonState == "Journey") {
		if (MouseIn(875, 350, 750, 64)) {
			KDJourney = "";
			KinkyDungeonState = "Stats";
			return true;
		} else if (MouseIn(875, 450, 750, 64)) {
			KDJourney = "Random";
			KinkyDungeonState = "Stats";
			return true;
		} else if (MouseIn(875, 550, 750, 64)) {
			KDJourney = "Harder";
			KinkyDungeonState = "Stats";
			return true;
		} else if (MouseIn(1075, 850, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	} else if (KinkyDungeonState == "Diff") {
		if (MouseIn(875, 350, 275, 64)) {
			KinkyDungeonSexyMode = false;
			localStorage.setItem("KinkyDungeonSexyMode", KinkyDungeonSexyMode ? "True" : "False");
			return true;
		} else if (MouseIn(1175, 350, 275, 64)) {
			KinkyDungeonSexyMode = true;
			localStorage.setItem("KinkyDungeonSexyMode", KinkyDungeonSexyMode ? "True" : "False");
			return true;
		} else if (MouseIn(875, 450, 275, 64)) {
			KinkyDungeonRandomMode = false;
			localStorage.setItem("KinkyDungeonRandomMode", KinkyDungeonRandomMode ? "True" : "False");
			return true;
		} else if (MouseIn(1175, 450, 275, 64)) {
			KinkyDungeonRandomMode = true;
			localStorage.setItem("KinkyDungeonRandomMode", KinkyDungeonRandomMode ? "True" : "False");
			return true;
		} else if (MouseIn(875, 550, 275, 64)) {
			KinkyDungeonSaveMode = false;
			localStorage.setItem("KinkyDungeonSaveMode", KinkyDungeonSaveMode ? "True" : "False");
			return true;
		} else if (MouseIn(1175, 550, 275, 64)) {
			KinkyDungeonSaveMode = true;
			localStorage.setItem("KinkyDungeonSaveMode", KinkyDungeonSaveMode ? "True" : "False");
			return true;
		} else if (MouseIn(1500, 420, 64, 64) && KinkyDungeonSexyMode) {
			KinkyDungeonSexyPlug = !KinkyDungeonSexyPlug;
			localStorage.setItem("KinkyDungeonSexyPlug", KinkyDungeonSexyPlug ? "True" : "False");
			return true;
		} else if (MouseIn(1500, 500, 64, 64) && KinkyDungeonSexyMode) {
			KinkyDungeonSexyPiercing = !KinkyDungeonSexyPiercing;
			localStorage.setItem("KinkyDungeonSexyPiercing", KinkyDungeonSexyPiercing ? "True" : "False");
			return true;
		}
		KDUpdatePlugSettings();
		if (MouseIn(1075, 850, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	} else if (KinkyDungeonState == "Stats") {
		if (MouseIn(100, 920, 190, 64)) {
			KinkyDungeonStatsChoice = new Map();
			KDUpdatePlugSettings();
			return true;
		}

		if (MouseIn(330, 930, 140, 54)) {
			KinkyDungeonPerksConfig = "1";
			KinkyDungeonLoadStats();
			KDUpdatePlugSettings();
			return true;
		} else if (MouseIn(480, 930, 140, 54)) {
			KinkyDungeonPerksConfig = "2";
			KinkyDungeonLoadStats();
			KDUpdatePlugSettings();
			return true;
		} else if (MouseIn(630, 930, 140, 54)) {
			KinkyDungeonPerksConfig = "3";
			KinkyDungeonLoadStats();
			KDUpdatePlugSettings();
			return true;
		}

		if (MouseIn(875, 920, 350, 64) && KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) >= 0) {
			//KinkyDungeonState = "Diff";
			KDLose = false;
			KinkyDungeonStartNewGame();
			return true;
		} else if (MouseIn(1275, 920, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	} else if (KinkyDungeonState == "TileEditor") {
		KDHandleTileEditor();
	}  else if (KinkyDungeonState == "Load"){
		if (MouseIn(875, 750, 350, 64)) {
			KinkyDungeonNewGame = 0;
			KinkyDungeonGrid = "";
			KinkyDungeonInitialize(1, true);
			MiniGameKinkyDungeonCheckpoint = "grv";
			if (KinkyDungeonLoadGame(ElementValue("saveInputField"))) {
				KDSendEvent('loadGame');
				//KDInitializeJourney(KDJourney);
				if (KinkyDungeonGrid == "") KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]], MiniGameKinkyDungeonLevel, false, true);
				ElementRemove("saveInputField");
				KinkyDungeonState = "Game";

				if (KinkyDungeonKeybindings) {
					KDCommitKeybindings();
				}
			}
			return true;
		} else if (MouseIn(1275, 750, 350, 64)) {
			KinkyDungeonState = "Menu";
			ElementRemove("saveInputField");
			return true;
		}
	} else if (KinkyDungeonState == "LoadOutfit"){
		if (MouseIn(875, 750, 350, 64)) {
			// Save outfit
			let appearance = LZString.decompressFromBase64(ElementValue("saveInputField"));
			let origAppearance = KinkyDungeonPlayer.Appearance;
			if (appearance) {
				try {
					CharacterAppearanceRestore(KinkyDungeonPlayer, appearance);
					CharacterRefresh(KinkyDungeonPlayer);
				} catch (e) {
					// If we fail, it might be a BCX code. try it!
					KinkyDungeonPlayer.Appearance = origAppearance;
				}
				KDInitProtectedGroups();
				localStorage.setItem("kinkydungeonappearance", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));

				KinkyDungeonDressSet();
			}
			// Return to menu
			KinkyDungeonState = "Menu";
			KinkyDungeonNewDress = true;
			ElementRemove("saveInputField");
			return true;
		} else if (MouseIn(1275, 750, 350, 64)) {
			// Restore the original outfit
			if (KDOriginalValue) {
				CharacterAppearanceRestore(KinkyDungeonPlayer, LZString.decompressFromBase64(KDOriginalValue));
				CharacterRefresh(KinkyDungeonPlayer);
				KDInitProtectedGroups();
			}


			KinkyDungeonState = "Menu";
			ElementRemove("saveInputField");
			return true;
		}
	} else if (KinkyDungeonState == "Consent") {
		if (MouseIn(975, 720, 450, 64)) {
			KinkyDungeonState = "Menu";
			KDSendEvent('optin');

			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressSet();
			CharacterNaked(KinkyDungeonPlayer);
			KinkyDungeonInitializeDresses();
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups();
			CharacterRefresh(KinkyDungeonPlayer);

			return true;
		} else if (MouseIn(975, 820, 450, 64)) {
			KDSendEvent('optout');
			KDOptOut = true;
			KinkyDungeonState = "Menu";

			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressSet();
			CharacterNaked(KinkyDungeonPlayer);
			KinkyDungeonInitializeDresses();
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups();
			CharacterRefresh(KinkyDungeonPlayer);

			return true;
		}
	} else if (KinkyDungeonState == "Menu" || KinkyDungeonState == "Lose") {

		if (MouseIn(600, 100, 64, 64)) {
			KinkyDungeonSound = !KinkyDungeonSound;
			localStorage.setItem("KinkyDungeonSound", KinkyDungeonSound ? "True" : "False");
		}

		if (MouseIn(1700, 874, 280, 50)) {
			if (localStorage.getItem("BondageClubLanguage")) {
				localStorage.setItem("BondageClubLanguage", "");
			} else localStorage.setItem("BondageClubLanguage", "CN");
			KDRestart = true;
			return true;
		}
		if (MouseIn(600, 260, 64, 64)) {
			KinkyDungeonFullscreen = !KinkyDungeonFullscreen;
			localStorage.setItem("KinkyDungeonFullscreen", KinkyDungeonFullscreen ? "True" : "False");
		}


		if (MouseIn(590, 930, 150, 64)) {
			KinkyDungeonState = "LoadOutfit";

			KDOriginalValue = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
			CharacterReleaseTotal(KinkyDungeonPlayer);
			ElementCreateTextArea("saveInputField");
			ElementValue("saveInputField", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
			return true;
		} else if (MouseIn(25, 942, 325, 50)) {
			//if (KinkyDungeonState == "Lose") {
			KinkyDungeonState = "Menu";
			let appearance = LZString.decompressFromBase64(localStorage.getItem("kinkydungeonappearance"));
			if (appearance) {
				CharacterAppearanceRestore(KinkyDungeonPlayer, appearance);
				CharacterRefresh(KinkyDungeonPlayer);
			}
			//}
			// @ts-ignore
			KinkyDungeonPlayer.OnlineSharedSettings = {AllowFullWardrobeAccess: true};
			KinkyDungeonNewDress = true;
			if (ServerURL == "foobar") {
				// Give all of the items
				for (let A = 0; A < Asset.length; A++)
					if ((Asset[A] != null) && (Asset[A].Group != null) && !InventoryAvailable(Player, Asset[A].Name, Asset[A].Group.Name))
						InventoryAdd(Player, Asset[A].Name, Asset[A].Group.Name);
			}
			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressPlayer();
			// @ts-ignore
			KinkyDungeonPlayer.OnlineSharedSettings = {BlockBodyCosplay: false, AllowFullWardrobeAccess: true};
			CharacterAppearanceLoadCharacter(KinkyDungeonPlayer);
			KinkyDungeonConfigAppearance = true;
			return true;
		} else if (MouseIn(360, 930, 220, 64)) {
			if (KinkyDungeonReplaceConfirm > 0) {
				KinkyDungeonDresses.Default = KinkyDungeonDefaultDefaultDress;
				CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayerCharacter ? KinkyDungeonPlayerCharacter : Player));
				CharacterReleaseTotal(KinkyDungeonPlayer);
				KinkyDungeonSetDress("Default", "Default");
				KinkyDungeonDressPlayer();
				KDInitProtectedGroups();
				KinkyDungeonConfigAppearance = true;
				return true;
			} else {
				KinkyDungeonReplaceConfirm = 2;
				return true;
			}
		} else if (MouseIn(1870, 930, 110, 64)) {
			KinkyDungeonState = "Credits";
			return true;
		}
		if (MouseIn(1700, 930, 150, 64)) {
			KinkyDungeonState = "Patrons";
			return true;
		}
		if (MouseIn(850, 930, 375, 64)) {
			let url = 'https://www.deviantart.com/ada18980';
			window.open(url, '_blank');
			return true;
		}
		if (MouseIn(1275, 930, 375, 64)) {
			let url = 'https://www.patreon.com/ada18980';
			KDSendEvent('patreon');
			window.open(url, '_blank');
			return true;
		}
	} else if (KinkyDungeonState == "Save") {
		if (!KinkyDungeonIsPlayer()) KinkyDungeonState = "Game";
		if (MouseIn(875, 750, 350, 64)) {
			KinkyDungeonState = "Game";
			ElementRemove("saveDataField");
			KinkyDungeonChangeRep("Ghost", 5);
			return true;
		} else if (MouseIn(1275, 750, 350, 64)) {
			KinkyDungeonState = "Game";
			ElementRemove("saveDataField");
			KinkyDungeonChangeRep("Ghost", -5);
			return true;
		}
	} else if (KinkyDungeonState == "Game") {
		if (KinkyDungeonIsPlayer()) KinkyDungeonClickGame();
	} else if (KinkyDungeonState == "Keybindings") {
		// Replaced by DrawButtonKDEx
	} else if (KinkyDungeonState == "End") {
		if (MouseIn(1075, 650, 350, 64)) {
			KinkyDungeonState = "Game";
			KinkyDungeonNewGamePlus();
			return true;
		} if (MouseIn(1075, 750, 350, 64)) {
			KinkyDungeonState = "Menu";
			return true;
		}
	}


	return false;
}

/**
 * Handles clicks during the kinky dungeon game
 * @returns {void} - Nothing
 */
function KinkyDungeonClick() {
	if (KinkyDungeonHandleClick()) {
		if (KinkyDungeonReplaceConfirm > 0) KinkyDungeonReplaceConfirm -= 1;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
	}
}

/**
 * Handles exit during the kinky dungeon game
 * @returns {void} - Nothing
 */
function KinkyDungeonExit() {
	CommonDynamicFunction(MiniGameReturnFunction + "()");

	if (CharacterAppearancePreviousEmoticon) {
		CharacterSetFacialExpression(Player, "Emoticon", CharacterAppearancePreviousEmoticon);
		CharacterAppearancePreviousEmoticon = "";
	}

	if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
		KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
		DialogSetReputation("Gaming", KinkyDungeonRep);
	}

	if (CurrentScreen == "ChatRoom" && KinkyDungeonState != "Menu" && KDLose) {
		let Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "KinkyDungeonLevel", Text: String(MiniGameKinkyDungeonLevel)},
		];
		// @ts-ignore
		ChatRoomPublishCustomAction("KinkyDungeonLose", false, Dictionary);
	}
	CharacterRefresh(Player, true);

	KinkyDungeonTeardownCrashHandler();
}




/**
 * Handles key presses during the mini game. (Both keyboard and mobile)
 * @returns {void} - Nothing
 */
function KinkyDungeonKeyDown() {
	// n/a
}



let mouseDown = false;

window.addEventListener('mousedown', function() {
	mouseDown = true;
});
window.addEventListener('mouseup', function() {
	mouseDown = false;
});

/**
 * Game keyboard input handler object: Handles keyboard inputs.
 * @constant
 * @type {object} - The game keyboard input handler object. Contains the functions and properties required to handle key press events.
 */
let KinkyDungeonGameKey = {
	keyPressed : [false, false, false, false, false, false, false, false, false],

	KEY_UP : 'KeyB',
	KEY_DOWN : 'KeyV',
	KEY_LEFT : 'KeyC',
	KEY_RIGHT : 'KeyX',
	KEY_UPLEFT : 'KeyC',
	KEY_UPRIGHT : 'KeyB',
	KEY_DOWNLEFT : 'KeyX',
	KEY_DOWNRIGHT : 'KeyV',
	KEY_WAIT : 'KeyV',
	KEY_SKIP : 'KeyEnter',

	load : function(){
		KinkyDungeonGameKey.keyPressed = [false, false, false, false, false, false, false, false, false];
		KinkyDungeonGameKey.addKeyListener();
	},

	addKeyListener : function () {
		window.addEventListener('keydown', KinkyDungeonGameKey.keyDownEvent);
		window.addEventListener('keyup', KinkyDungeonGameKey.keyUpEvent);
	},
	removeKeyListener : function () {
		window.removeEventListener('keydown', KinkyDungeonGameKey.keyDownEvent);
		window.removeEventListener('keyup', KinkyDungeonGameKey.keyUpEvent);
	},
	keyDownEvent : {
		handleEvent : function (event) {
			let code = event.code;
			if (!KDLastKeyTime[code]) {
				KinkyDungeonKeybindingCurrentKey = code;
				KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
			}
			switch(code){
				case KinkyDungeonGameKey.KEY_UP:
					if(!KinkyDungeonGameKey.keyPressed[0]){
						KinkyDungeonGameKey.keyPressed[0] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_DOWN:
					if(!KinkyDungeonGameKey.keyPressed[1]){
						KinkyDungeonGameKey.keyPressed[1] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_LEFT:
					if(!KinkyDungeonGameKey.keyPressed[2]){
						KinkyDungeonGameKey.keyPressed[2] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_RIGHT:
					if(!KinkyDungeonGameKey.keyPressed[3]){
						KinkyDungeonGameKey.keyPressed[3] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_UPLEFT:
					if(!KinkyDungeonGameKey.keyPressed[4]){
						KinkyDungeonGameKey.keyPressed[4] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_UPRIGHT:
					if(!KinkyDungeonGameKey.keyPressed[5]){
						KinkyDungeonGameKey.keyPressed[5] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_DOWNLEFT:
					if(!KinkyDungeonGameKey.keyPressed[6]){
						KinkyDungeonGameKey.keyPressed[6] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_DOWNRIGHT:
					if(!KinkyDungeonGameKey.keyPressed[7]){
						KinkyDungeonGameKey.keyPressed[7] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_WAIT:
					if(!KinkyDungeonGameKey.keyPressed[8]){
						KinkyDungeonGameKey.keyPressed[8] = true;
					}
					break;
				case KinkyDungeonGameKey.KEY_SKIP:
					if(!KinkyDungeonGameKey.keyPressed[9]){
						KinkyDungeonGameKey.keyPressed[9] = true;
					}
					break;
			}
		}
	},
	keyUpEvent : {
		handleEvent : function (event) {
			let code = event.code;
			KinkyDungeonKeybindingCurrentKeyRelease = code;
			if (KinkyDungeonKeybindingCurrentKeyRelease) KinkyDungeonGameKeyUp(KDLastKeyTime[KinkyDungeonKeybindingCurrentKeyRelease]);
			if (KDLastKeyTime[code]) delete KDLastKeyTime[code];
			KinkyDungeonKeybindingCurrentKeyRelease = '';
			switch(code){
				case KinkyDungeonGameKey.KEY_UP:
					if (KinkyDungeonGameKey.keyPressed[0]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[0] = false;
					break;
				case KinkyDungeonGameKey.KEY_DOWN:
					if (KinkyDungeonGameKey.keyPressed[1]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[1] = false;
					break;
				case KinkyDungeonGameKey.KEY_LEFT:
					if (KinkyDungeonGameKey.keyPressed[2]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[2] = false;
					break;
				case KinkyDungeonGameKey.KEY_RIGHT:
					if (KinkyDungeonGameKey.keyPressed[3]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[3] = false;
					break;
				case KinkyDungeonGameKey.KEY_UPLEFT:
					if (KinkyDungeonGameKey.keyPressed[4]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[4] = false;
					break;
				case KinkyDungeonGameKey.KEY_UPRIGHT:
					if (KinkyDungeonGameKey.keyPressed[5]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[5] = false;
					break;
				case KinkyDungeonGameKey.KEY_DOWNLEFT:
					if (KinkyDungeonGameKey.keyPressed[6]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[6] = false;
					break;
				case KinkyDungeonGameKey.KEY_DOWNRIGHT:
					if (KinkyDungeonGameKey.keyPressed[7]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[7] = false;
					break;
				case KinkyDungeonGameKey.KEY_WAIT:
					if (KinkyDungeonGameKey.keyPressed[8]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[8] = false;
					break;
				case KinkyDungeonGameKey.KEY_SKIP:
					if (KinkyDungeonGameKey.keyPressed[9]) KinkyDungeonLastMoveTimerStart = 0;
					KinkyDungeonGameKey.keyPressed[9] = false;
					break;
			}

		}
	},
};



/**
 * Outputs a savegame
 * @returns {KinkyDungeonSave} - Saved game object
 */
function KinkyDungeonGenerateSaveData() {
	/** @type {KinkyDungeonSave} */
	let save = {};
	save.level = MiniGameKinkyDungeonLevel;
	save.checkpoint = MiniGameKinkyDungeonCheckpoint;
	save.rep = KinkyDungeonGoddessRep;
	save.costs = KinkyDungeonShrineCosts;
	save.pcosts = KinkyDungeonPenanceCosts;
	save.dress = KinkyDungeonCurrentDress;
	save.gold = KinkyDungeonGold;
	save.points = KinkyDungeonSpellPoints;
	save.id = KinkyDungeonEnemyID;
	save.choices = KinkyDungeonSpellChoices;
	save.choices2 = KinkyDungeonSpellChoicesToggle;
	save.buffs = KinkyDungeonPlayerBuffs;
	save.lostitems = KinkyDungeonLostItems;
	save.rescued = KinkyDungeonRescued;
	save.aid = KinkyDungeonAid;
	save.seed = KinkyDungeonSeed;
	save.statchoice = Array.from(KinkyDungeonStatsChoice);
	save.mapIndex = KinkyDungeonMapIndex;
	save.flags = Array.from(KinkyDungeonFlags);
	save.faction = KinkyDungeonFactionRelations;
	save.perks = KDUnlockedPerks;

	let spells = [];
	/**@type {item[]} */
	let newInv = [];

	for (let inv of KinkyDungeonFullInventory()) {
		let item = Object.assign({}, inv);
		newInv.push(item);
	}

	for (let spell of KinkyDungeonSpells) {
		spells.push(spell.name);
	}

	save.spells = spells;
	save.inventory = newInv;
	save.KDGameData = KDGameData;
	save.KDEventData = KDEventData;

	save.KinkyDungeonEffectTiles = KinkyDungeonEffectTiles;
	save.KinkyDungeonTiles = KinkyDungeonTiles;
	save.KinkyDungeonTilesSkin = KinkyDungeonTilesSkin;
	save.KinkyDungeonTilesMemory = KinkyDungeonTilesMemory;
	save.KinkyDungeonRandomPathablePoints = KinkyDungeonRandomPathablePoints;
	save.KinkyDungeonPlayerEntity = KinkyDungeonPlayerEntity;
	save.KinkyDungeonEntities = KinkyDungeonEntities;
	save.KinkyDungeonBullets = KinkyDungeonBullets;
	save.KinkyDungeonGrid = KinkyDungeonGrid;
	save.KinkyDungeonGridWidth = KinkyDungeonGridWidth;
	save.KinkyDungeonGridHeight = KinkyDungeonGridHeight;
	save.KinkyDungeonFogGrid = KinkyDungeonFogGrid;
	save.KinkyDungeonEndPosition = KinkyDungeonEndPosition;
	save.KinkyDungeonStartPosition = KinkyDungeonStartPosition;

	save.stats = {
		picks: KinkyDungeonLockpicks,
		keys: KinkyDungeonRedKeys,
		bkeys: KinkyDungeonBlueKeys,
		mana: KinkyDungeonStatMana,
		manapool: KinkyDungeonStatManaPool,
		stamina: KinkyDungeonStatStamina,
		willpower: KinkyDungeonStatWill,
		distraction: KinkyDungeonStatDistraction,
		distractionlower: KinkyDungeonStatDistractionLower,
		wep: KinkyDungeonPlayerWeapon,
		npp: KinkyDungeonNewGame,
		diff: KinkyDungeonStatsChoice.get("randomMode"),
	};
	return save;
}

function KinkyDungeonSaveGame(ToString) {
	let save = KinkyDungeonGenerateSaveData();

	let data = KinkyDungeonCompressSave(save);
	if (!ToString) {
		//Player.KinkyDungeonSave = saveData.KinkyDungeonSave;
		//ServerAccountUpdate.QueueData(saveData);
		localStorage.setItem('KinkyDungeonSave', data);
	}
	return data;
}

function KinkyDungeonCompressSave(save) {
	return LZString.compressToBase64(JSON.stringify(save));
}

// N4IgNgpgbhYgXARgDQgMYAsJoNYAcB7ASwDsAXBABlQCcI8FQBxDAgZwvgFoBWakAAo0ibAiQg0EvfgBkIAQzJZJ8fgFkIZeXFWoASgTwQqqAOpEwO/gFFIAWwjk2JkAGExAKwCudFwElLLzYiMSoAX1Q0djJneGAIkAIaACNYgG0AXUisDnSskAATOjZYkAARCAAzeS8wClQAcwIwApdCUhiEAGZUSBgwWNBbCAcnBBQ3Tx9jJFQAsCCQknGEtiNLPNRSGHIkgE8ENNAokjYvO3lkyEYQEnkHBEECMiW1eTuQBIBHL3eXsgOSAixzEZwuVxmoDuD3gTxeYgAylo7KR5J9UD8/kQAStkCDTudLtc4rd7jM4UsAGLCBpEVrfX7kbGAxDAkAAdwUhGWJOh5IA0iQiJVjGE2cUyDR5B0bnzHmUvGgyAAVeRGOQNZwJF4NDBkcQlca9Ai4R7o0ASqUy3lk+WKlVqiCUiCaNTnOwHbVEXX6iCG2bgE04M1hDJhIA=
function KinkyDungeonLoadGame(String) {
	let str = String ? LZString.decompressFromBase64(String.trim()) : (localStorage.getItem('KinkyDungeonSave') ? LZString.decompressFromBase64(localStorage.getItem('KinkyDungeonSave')) : "");
	if (str) {
		let saveData = JSON.parse(str);
		if (saveData
			&& saveData.spells != undefined
			&& saveData.level != undefined
			&& saveData.checkpoint != undefined
			&& saveData.inventory != undefined
			&& saveData.costs != undefined
			&& saveData.rep != undefined
			&& saveData.dress != undefined) {
			KinkyDungeonEntities = [];
			KDUpdateEnemyCache = true;
			if (saveData.flags && saveData.flags.length) KinkyDungeonFlags = new Map(saveData.flags);
			MiniGameKinkyDungeonLevel = saveData.level;
			if (Array.from(Object.keys(KinkyDungeonMapIndex)).includes(saveData.checkpoint))
				MiniGameKinkyDungeonCheckpoint = saveData.checkpoint;
			else MiniGameKinkyDungeonCheckpoint = "grv";
			KinkyDungeonShrineCosts = saveData.costs;
			KinkyDungeonGoddessRep = saveData.rep;
			KinkyDungeonCurrentDress = saveData.dress;
			KDGameData.KinkyDungeonSpawnJailers = 0;
			KDGameData.KinkyDungeonSpawnJailersMax = 0;
			if (saveData.seed) KDsetSeed(saveData.seed);
			if (saveData.pcosts) KinkyDungeonPenanceCosts = saveData.pcosts;
			if (saveData.choices) KinkyDungeonSpellChoices = saveData.choices;
			if (saveData.choices2) KinkyDungeonSpellChoicesToggle = saveData.choices2;
			if (saveData.buffs) KinkyDungeonPlayerBuffs = saveData.buffs;
			if (saveData.gold != undefined) KinkyDungeonGold = saveData.gold;
			if (saveData.id != undefined) KinkyDungeonEnemyID = saveData.id;
			if (saveData.points != undefined) KinkyDungeonSpellPoints = saveData.points;
			if (saveData.lostitems != undefined) KinkyDungeonLostItems = saveData.lostitems;
			if (saveData.rescued != undefined) KinkyDungeonRescued = saveData.rescued;
			if (saveData.aid != undefined) KinkyDungeonAid = saveData.aid;
			if (saveData.stats) {
				if (saveData.stats.picks != undefined) KinkyDungeonLockpicks = saveData.stats.picks;
				if (saveData.stats.keys != undefined) KinkyDungeonRedKeys = saveData.stats.keys;
				if (saveData.stats.bkeys != undefined) KinkyDungeonBlueKeys = saveData.stats.bkeys;
				if (saveData.stats.mana != undefined) KinkyDungeonStatMana = saveData.stats.mana;
				if (saveData.stats.manapool != undefined) KinkyDungeonStatManaPool = saveData.stats.manapool;
				if (saveData.stats.stamina != undefined) KinkyDungeonStatStamina = saveData.stats.stamina;
				if (saveData.stats.willpower != undefined) KinkyDungeonStatWill = saveData.stats.willpower;
				if (saveData.stats.distraction != undefined) KinkyDungeonStatDistraction = saveData.stats.distraction;
				if (saveData.stats.distractionlower != undefined) KinkyDungeonStatDistractionLower = saveData.stats.distractionlower;
				if (saveData.stats.wep != undefined) KDSetWeapon(saveData.stats.wep);
				if (saveData.stats.npp != undefined) KinkyDungeonNewGame = saveData.stats.npp;


				KDOrigStamina = KinkyDungeonStatStamina*10;
				KDOrigWill = KinkyDungeonStatWill*10;
				KDOrigMana = KinkyDungeonStatMana*10;
				KDOrigDistraction = KinkyDungeonStatDistraction*10;
			}
			KDGameData = JSON.parse(JSON.stringify(KDGameDataBase));
			if (saveData.KDGameData != undefined) KDGameData = Object.assign({}, saveData.KDGameData);
			KDEventData = JSON.parse(JSON.stringify(KDEventDataBase));
			if (saveData.KDEventData != undefined) KDEventData = Object.assign({}, saveData.KDEventData);

			if (saveData.statchoice != undefined) KinkyDungeonStatsChoice = new Map(saveData.statchoice);
			if (saveData.faction != undefined) KinkyDungeonFactionRelations = saveData.faction;
			KDInitFactions();
			if (typeof KDGameData.TimeSinceLastVibeStart === "number") KDGameData.TimeSinceLastVibeStart = {};
			if (typeof KDGameData.TimeSinceLastVibeEnd === "number") KDGameData.TimeSinceLastVibeEnd = {};

			if (!KDGameData.AlreadyOpened) KDGameData.AlreadyOpened = [];

			if (saveData.perks) {
				KDUnlockedPerks = saveData.perks;
				KDLoadPerks();
			}
			KDUnlockPerk();

			KDInitInventory();
			for (let item of saveData.inventory) {
				if (item.type == Restraint) {
					let restraint = KinkyDungeonGetRestraintByName(item.name);
					if (restraint) {
						KinkyDungeonAddRestraint(restraint, 0, true, item.lock, undefined, undefined, undefined, undefined, item.faction); // Add the item
						let createdrestraint = KinkyDungeonGetRestraintItem(restraint.Group);
						if (createdrestraint) createdrestraint.lock = item.lock; // Lock if applicable
						if (createdrestraint) createdrestraint.events = item.events; // events if applicable
					}
				}
			}
			for (let item of saveData.inventory) {
				KinkyDungeonInventoryAdd(item);
			}

			KinkyDungeonSpells = [];
			for (let spell of saveData.spells) {
				let sp = KinkyDungeonFindSpell(spell);
				if (sp) KinkyDungeonSpells.push(sp);
			}


			if (saveData.KinkyDungeonEffectTiles) KinkyDungeonEffectTiles = saveData.KinkyDungeonEffectTiles;
			if (saveData.KinkyDungeonTiles) KinkyDungeonTiles = saveData.KinkyDungeonTiles;
			if (saveData.KinkyDungeonTilesSkin) KinkyDungeonTilesSkin = saveData.KinkyDungeonTilesSkin;
			if (saveData.KinkyDungeonTilesMemory) KinkyDungeonTilesMemory = saveData.KinkyDungeonTilesMemory;
			if (saveData.KinkyDungeonRandomPathablePoints) KinkyDungeonRandomPathablePoints = saveData.KinkyDungeonRandomPathablePoints;
			if (saveData.KinkyDungeonPlayerEntity) KinkyDungeonPlayerEntity = saveData.KinkyDungeonPlayerEntity;
			if (saveData.KinkyDungeonEntities) KinkyDungeonEntities = saveData.KinkyDungeonEntities;
			KDUpdateEnemyCache = true;
			if (saveData.KinkyDungeonBullets) KinkyDungeonBullets = saveData.KinkyDungeonBullets;
			if (saveData.KinkyDungeonStartPosition) KinkyDungeonStartPosition = saveData.KinkyDungeonStartPosition;
			if (saveData.KinkyDungeonEndPosition) KinkyDungeonEndPosition = saveData.KinkyDungeonEndPosition;
			if (saveData.KinkyDungeonGrid) {
				KinkyDungeonGrid = saveData.KinkyDungeonGrid;
				KinkyDungeonGridWidth = saveData.KinkyDungeonGridWidth;
				KinkyDungeonGridHeight = saveData.KinkyDungeonGridHeight;
			}
			KinkyDungeonResetFog();

			if (saveData.KinkyDungeonFogGrid) KinkyDungeonFogGrid = saveData.KinkyDungeonFogGrid;

			KinkyDungeonSetMaxStats();
			KinkyDungeonCheckClothesLoss = true;
			KDNaked = false;
			KinkyDungeonDressPlayer();
			KDRefresh = true;
			if (KDGameData.Journey)
				KDJourney = KDGameData.Journey;
			if (saveData.mapIndex && !saveData.mapIndex.length) KinkyDungeonMapIndex = saveData.mapIndex;

			if (String)
				localStorage.setItem('KinkyDungeonSave', String);

			if (saveData.KDGameData && saveData.KDGameData.LastMapSeed) KDsetSeed(saveData.KDGameData.LastMapSeed);

			if (saveData.KinkyDungeonGrid) {
				KDUpdateVision();
			}
			KinkyDungeonFloaters = [];
			return true;
		}
	}
	return false;
}

let KinkyDungeonSeed = (Math.random() * 4294967296).toString();
let KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());

/**
 *
 * @param {boolean} Native Decides whether or not to use native KDRandom to randomize
 */
function KDrandomizeSeed(Native) {
	let rand = Native ? KDRandom : () => {return Math.random();};
	KinkyDungeonSeed = (rand() * 4294967296).toString();
	for (let i = 0; i < 20; i++) {
		let index = rand() * KinkyDungeonSeed.length;
		KinkyDungeonSeed = KinkyDungeonSeed.replaceAt(index, String.fromCharCode(65 + Math.floor(rand()*50)) + String.fromCharCode(65 + Math.floor(rand()*50)));
	}
	KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());
	for (let i = 0; i < 1000; i++) {
		KDRandom();
	}
}

function KDsetSeed(string) {
	KinkyDungeonSeed = string;
	KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());
	for (let i = 0; i < 1000; i++) {
		KDRandom();
	}
}

/**
 * It takes a string and returns a function that returns a random number
 * @param str - The string to hash.
 * @returns A function that returns a random number.
 */
function xmur3(str) {
	let h = 1779033703 ^ str.length;
	for(let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	} return function() {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}

/**
 * It takes four 32-bit integers and returns a function that returns a random number between 0 and 1
 * @param a - The first parameter.
 * @param b - 0x9e3779b9
 * @param c - 0x9e3779b9
 * @param d - The seed.
 * @returns A function that returns a random number between 0 and 1.
 */
function sfc32(a, b, c, d) {
	return function() {
		a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ b >>> 9;
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		d = d + 1 | 0;
		t = t + d | 0;
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	};
}

/**
 * @type {Map<string, HTMLAudioElement>}
 */
let kdSoundCache = new Map();

/**
 *
 * @param {string} Path
 * @param {number} [volume]
 */
function AudioPlayInstantSoundKD(Path, volume) {
	const vol = volume != null ? volume : Player.AudioSettings.Volume;
	if (vol > 0) {
		let src = KDModFiles[Path] || Path;
		let audio = kdSoundCache.has(src) ? kdSoundCache.get(src) : new Audio();
		if (!kdSoundCache.has(src))  {
			audio.src = src;
			kdSoundCache.set(src, audio);
		} else {
			audio.pause();
			audio.currentTime = 0;
		}
		audio.volume = Math.min(vol, 1);
		audio.play();
	}
}

/**
 * From https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 */
function hashCode(s) {
	for(var i = 0, h = 0; i < s.length; i++)
		h = Math.imul(31, h) + s.charCodeAt(i) | 0;
	return h;
}

function TextGetKD(Text) {
	if (TextGet(Text))
		return TextGet(Text);
	else return KDLoadingTextKeys[Text] || "Missing text";
}
