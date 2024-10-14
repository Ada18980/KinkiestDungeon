"use strict";

// Modders look here!
/**
 * Dummy function. You can modify this function as part of your mod like so:
 * let _KDModsAfterGameStart = KDModsAfterGameStart;
 * KDModsAfterGameStart = () => {
 * [Your stuff here]
 * _KDModsAfterGameStart();
 * }
 * It is declared with `let` intentionally to allow the above, without suggesting a type error
 */
let KDModsAfterGameStart = () => {};
/**
 * Dummy function. You can modify this function as part of your mod like so:
 * let _KDModsAfterLoad = KDModsAfterLoad;
 * KDModsAfterLoad = () => {
 * [Your stuff here]
 * _KDModsAfterLoad();
 * }
 * It is declared with `let` intentionally to allow the above, without suggesting a type error
 */
let KDModsAfterLoad = () => {};



let maxSaveSlots = 4;

let KDFullscreen = false;
let KDExitButton = false;

let KDPaletteWidth = 6;

let KDDefaultPalette = "";
let KDCULLTIME = 10000; // Garbage collection
let KDLoadingFinishedSet = false;

// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

let KDStandardRenderException = {
	Consent: [],
	Intro: [],
	Logo: [],
	Game: ["Game"],
	Stats: [],
	TileEditor: [],
	Wardrobe: [],

};

let KDClipboardDisabled = window.location.host.includes('itch.zone');
(async function() {
	let queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
	try {
		let permissionStatus = await navigator.permissions.query(queryOpts as PermissionDescriptor);
		permissionStatus.onchange = () => {
			//console.log(permissionStatus.state);
			if (permissionStatus.state == 'denied') KDClipboardDisabled = true;
		};
	} catch (e) {
		// Handle
		KDClipboardDisabled = true;
	}
})();



let CanvasWidth = 2000;
let CanvasHeight = 1000;
let KDStartTime = 0;
let KDEasterEgg = Math.random() < 0.01;

/** These languages have characters which are rendered bigger than English. */
let KDBigLanguages = ["CN", "KR", "JP"];
let KDBigLanguages2 = ["Chinese", "Korean", "Japanese"];
/** Language List */
let KDLanguages = ["", "CN", "KR", "JP", "RU", "ES"];

let KinkyDungeonPlayerNeedsRefresh = false;
let KinkyDungeonNextRefreshCheck = 0;

// Check URL to see if indev branch
const pp = new URLSearchParams(window.location.search);
let param_branch = pp.has('branch') ? pp.get('branch') : "";
let param_test = pp.has('test') ? pp.get('test') : "";
let param_localhost = pp.has('localhost') ? pp.get('localhost') : "";
let TestMode = param_test || param_branch || param_localhost || ServerURL == 'https://bc-server-test.herokuapp.com/';

let KDDebugMode = TestMode != false;
let KDDebug = false;
let KDDebugPerks = false;
let KDDebugGold = false;
let KDDebugLink = false;

let KDAllModFiles = [];
let KDModFiles = {};

let VersionMajor = -1;
let VersionMinor = -1;
let VersionPatch = -1;

let KinkyDungeonPerksConfig = "1";
let KinkyDungeonSpellsConfig = "1";

let KDUnlockedPerks = [];

let KinkyDungeonBackground = "BrickWall";

let KinkyDungeonPlayer: Character = null;
let KDSpeakerNPC = null;
let KinkyDungeonState = "Logo";

let KDIntroProgress = [0, 0, 0, 0];
let KDIntroStage = -1;

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


let KDLoadingFinished = false;
let KDLoadingDone = 1;
let KDLoadingMax = 1;

//let KinkyDungeonKeyLower = [87+32, 65+32, 83+32, 68+32, 81+32, 45+32, 90+32, 43+32]; // WASD
let KinkyDungeonKey = ['W', 'A', 'S', 'D', 'Q', 'E', 'Z', 'C'];
//let KinkyDungeonKeyNumpad = [56, 52, 50, 54, 55, 57, 49, 51]; // Numpad
let KinkyDungeonKeySpell = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']; // 1 2 3 4 5 6 7
let KinkyDungeonKeySpellConfig = ['<', '@', '#'];
let KinkyDungeonKeyWait = ['X'];
let KinkyDungeonKeySkip = ['Space'];
let KinkyDungeonKeyEnter = ['Enter'];
let KinkyDungeonKeySprint = ['ShiftLeft'];
let KinkyDungeonKeyWeapon = ['R',];
let KinkyDungeonKeyUpcast = ['ControlLeft', 'AltLeft'];
let KinkyDungeonKeyMenu = ['V', 'I', 'U', 'M', 'L', '*', '-', '_', "Home"]; // QuikInv, Inventory, Reputation, Magic, Log, Quest, Collection, Pause
let KinkyDungeonKeyToggle = ['O', 'P', 'B', 'Backspace', '=', "ShiftRight", 'T', '?', '/', "'"]; // Log, Passing, Door, Auto Struggle, Auto Pathfind, Inspect, Wait till interrupted, Make Noise, Crouch
let KinkyDungeonKeySpellPage = ['`'];
let KinkyDungeonKeySwitchWeapon = ['F', 'G', 'H', 'J']; // Swap, Offhand, OffhandPrevious
let KinkyDungeonKeySwitchLoadout = ['[', ']', '\\'];
let KinkyDungeonKeyLogFilter = ['{', '}', ':', '"'];
let KinkyDungeonKeyMap = ['+', '<', '>'];

let KDLoadingTextKeys: Record<string, string> = {};

let kdSpecialModePerks = [
	"arousalMode",
	"easyMode",
	"norescueMode",
	"arousalModePlug",
	"arousalModePiercing",
	"arousalModePlugNoFront",
];


let KinkyDungeonGraphicsQuality = true;

let KDToggleGroups = ["Main", "GFX", "UI", "Clothes", "Keybindings"];

let KDToggles = {
	SoundOffWhenMin: true,
	SpellBook: false,
	ShowRestraintOnHover: false,
	HiResModel: false,
	Fullscreen: false,
	SkipIntro: false,
	SkipTutorial: false,
	VibeSounds: true,
	Music: true,
	Sound: true,
	HighResDisplacement: false,
	Bloom: true,
	StunFlash: true,
	ParticlesFX: true,
	ArousalHearts: true,
	VibeHearts: true,
	GagParticles: true,
	FancyWalls: true,
	FancyShadows: true,
	LightmapFilter: true,
	EnemyAnimations: true,
	RetroAnim: false,
	DrawArmor: true,
	DynamicArmor: false,
	HideFloatingWeapon: false,
	CrotchRopeOption: false,
	ChastityOption: false,
	ChastityOption2: false,
	ChastityBraOption: false,
	SimpleColorPicker: true,
	TransparentUI: false,
	Center: false,
	TurnCounter: false,
	ShowNPCStatuses: true,
	ShowSpellRange: true,
	ForceWarnings: false,
	//Drool: true,
	EnableMinimap: true,
	BuffSide: true,
	ShowPath: true,
	ShowFacing: false,
	ShowSameCatSpells: true,
	PlayerAura: false,
	EnemyAura: true,
	OutlineAura: true,
	GreyscaleBlindness: true,
	NearestNeighbor: true,
	LazyWalk: false,
	ShiftLatch: true,
	Nipples: false,
	NippleToysOption: false,
	NippleToysHide: false,
	NipplePiercingsHide: false,
	//AutoCrouchOnTrip: true,
	FlipStatusBars: false,
	ForcePalette: false,
	AutoLoadMods: false,
	FlipPlayer: true,
	FlipPlayerAuto: false,
	Helper: true,
	FastFloaters: false,
	NoDmgFloaters: false,
	NoForceGreet: false,
	StruggleBars: true,
	ShowJailedNPCSprites: true,
	ShowZoom: true,
	Backgrounds: true,
	RawDP: false,
	OnlySelfQuickInv: false,
	OverrideOutfit: false,
	SaveOutfit: true,
	ModCompat: false,

	ApplyPaletteRestraint: true,
	//ApplyPaletteOutfit: true,
	ApplyPaletteTransform: true,

	IgnoreApplyCharPalette: true,
	AlwaysApplyCharPalette: true,
	DefaultApplyCharPalette: false,
	Autoloot: true,
};

let KDToggleCategories = {
	RawDP: "UI",
	Backgrounds: "GFX",
	ShowZoom: "UI",
	ShowJailedNPCSprites: "GFX",
	StruggleBars: "UI",
	SpellBook: "UI",
	FastFloaters: "UI",
	NoDmgFloaters: "UI",
	RetroAnim: "GFX",
	HiResModel: "GFX",
	HighResDisplacement: "GFX",
	Bloom: "GFX",
	StunFlash: "UI",
	ParticlesFX: "GFX",
	ArousalHearts: "Clothes",
	VibeHearts: "Clothes",
	GagParticles: "Clothes",
	FancyWalls: "GFX",
	FancyShadows: "GFX",
	LightmapFilter: "GFX",
	EnemyAnimations: "GFX",
	DrawArmor: "Clothes",
	CrotchRopeOption: "Clothes",
	ChastityOption: "Clothes",
	ChastityOption2: "Clothes",
	ChastityBraOption: "Clothes",
	SimpleColorPicker: "Clothes",
	Nipples: "Clothes",
	NippleToysOption: "Clothes",
	NippleToysHide: "Clothes",
	NipplePiercingsHide: "Clothes",
	TransparentUI: "UI",
	Center: "UI",
	TurnCounter: "UI",
	ShowNPCStatuses: "UI",
	ShowSpellRange: "UI",
	ForceWarnings: "UI",
	//Drool: true,
	EnableMinimap: "UI",
	NoForceGreet: "UI",
	BuffSide: "UI",
	ShowPath: "UI",
	ShowFacing: "UI",
	ShowSameCatSpells: "UI",
	PlayerAura: "UI",
	EnemyAura: "UI",
	OutlineAura: "UI",
	NearestNeighbor: "GFX",
	Helper: "UI",
	FlipStatusBars: "UI",
	ShowRestraintOnHover: "UI",
	ForcePalette: "Clothes",
	//LazyWalk: "Controls",
	//ShiftLatch: "Controls",
	FlipPlayer: "Clothes",
	FlipPlayerAuto: "Clothes",
	GreyscaleBlindness: "GFX",
	DynamicArmor: "Clothes",
	OnlySelfQuickInv: "UI",
	HideFloatingWeapon: "Clothes",

	ApplyPaletteRestraint: "none",
	//ApplyPaletteOutfit: "none",
	ApplyPaletteTransform: "none",

	IgnoreApplyCharPalette: "none",
	AlwaysApplyCharPalette: "none",
	DefaultApplyCharPalette: "none",
	Autoloot: "UI",
};

let KDDefaultKB = {
	Down: KinkyDungeonKey[2],
	DownLeft: KinkyDungeonKey[6],
	DownRight: KinkyDungeonKey[7],
	Left: KinkyDungeonKey[1],
	Right: KinkyDungeonKey[3],
	Up: KinkyDungeonKey[0],
	UpLeft: KinkyDungeonKey[4],
	UpRight: KinkyDungeonKey[5],

	SpellWeapon: KinkyDungeonKeyWeapon[0],

	Spell1: KinkyDungeonKeySpell[0],
	Spell2: KinkyDungeonKeySpell[1],
	Spell3: KinkyDungeonKeySpell[2],
	Spell4: KinkyDungeonKeySpell[3],
	Spell5: KinkyDungeonKeySpell[4],
	Spell6: KinkyDungeonKeySpell[5],
	Spell7: KinkyDungeonKeySpell[6],
	Spell8: KinkyDungeonKeySpell[7],
	Spell9: KinkyDungeonKeySpell[8],
	Spell0: KinkyDungeonKeySpell[9],



	Wait: KinkyDungeonKeyWait[0],
	WaitInterrupt: KinkyDungeonKeyToggle[6],
	Skip: KinkyDungeonKeySkip[0],
	Enter: KinkyDungeonKeyEnter[0],

	Pass: KinkyDungeonKeyToggle[1],
	Door: KinkyDungeonKeyToggle[2],
	Sprint: KinkyDungeonKeySprint[0],
	MakeNoise: KinkyDungeonKeyToggle[7],
	PlaySelf: KinkyDungeonKeyToggle[8],
	Crouch: KinkyDungeonKeyToggle[9],

	Upcast: KinkyDungeonKeyUpcast[0],
	UpcastCancel: KinkyDungeonKeyUpcast[1],
	SpellPage: KinkyDungeonKeySpellPage[0],


	QInventory: KinkyDungeonKeyMenu[0],
	Inventory: KinkyDungeonKeyMenu[1],
	Reputation: KinkyDungeonKeyMenu[2],
	Magic: KinkyDungeonKeyMenu[3],
	Log: KinkyDungeonKeyMenu[4],
	Quest: KinkyDungeonKeyMenu[5],
	Collection: KinkyDungeonKeyMenu[6],
	Facilities: KinkyDungeonKeyMenu[7],
	Restart: KinkyDungeonKeyMenu[8],


	SwitchWeapon: KinkyDungeonKeySwitchWeapon[0],
	SwitchWeaponOffhand: KinkyDungeonKeySwitchWeapon[1],
	SwitchWeaponOffhandPrevious: KinkyDungeonKeySwitchWeapon[2],
	SwitchWeaponOffhandPrevious2: KinkyDungeonKeySwitchWeapon[3],
	SwitchLoadout1: KinkyDungeonKeySwitchLoadout[0],
	SwitchLoadout2: KinkyDungeonKeySwitchLoadout[1],
	SwitchLoadout3: KinkyDungeonKeySwitchLoadout[2],
	SpellConfig1: KinkyDungeonKeySpellConfig[0],
	SpellConfig2: KinkyDungeonKeySpellConfig[1],
	SpellConfig3: KinkyDungeonKeySpellConfig[2],

	AStruggle: KinkyDungeonKeyToggle[3],
	APathfind: KinkyDungeonKeyToggle[4],
	AInspect: KinkyDungeonKeyToggle[5],

	BulletTransparency: KinkyDungeonKeyToggle[10],
	Map: KinkyDungeonKeyMap[0],
	MsgLog: KinkyDungeonKeyToggle[0],
	ZoomOut: KinkyDungeonKeyMap[1],
	ZoomIn: KinkyDungeonKeyMap[2],
};

let KDZoomIndex = 4;
let KDZoomLevels = [6, 4, 2, 0, -1, -2, -3];

let KinkyDungeonRootDirectory = "Game/";

//"Screens/MiniGame/KinkyDungeon/";
let KinkyDungeonGameData = null; // Data sent by other player
let KinkyDungeonGameDataNullTimer = 4000; // If data is null, we query this often
let KinkyDungeonGameDataNullTimerTime = 0;
let KinkyDungeonStreamingPlayers = []; // List of players to stream to

let KinkyDungeonInitTime = 0;

let KinkyDungeonSleepTime = 0;
let KinkyDungeonFreezeTime = 1000;
let KinkyDungeonPlaySelfTime = 300;
let KinkyDungeonOrgasmTime = 1000;
let KinkyDungeonAutoWait = false;
let KinkyDungeonAutoWaitStruggle = false;

let KinkyDungeonConfigAppearance = false;

const Consumable = "consumable";
const Restraint = "restraint";
const LooseRestraint = "looserestraint";
const Outfit = "outfit";
const Accessory = "accessory";
const Weapon = "weapon";
const Misc = "misc";
const Armor = "armor";

let KinkyDungeonStatsChoice = new Map();

let KDJourney = "";

let KDOptOut = false;

let KDDefaultMaxParty = 3;


let KDDefaultJourney = ["grv", "cat", "jng", "tmp", "bel"];
let KDDefaultAlt = ["tmb", "lib", "cry", "ore", "bel"];


interface KDGameDataBase {
	PersistentItems: Record<string, Record<string, number>>,
	JourneyProgression:		string[],
	AttachedWep:			string,
	InventoryAction:		string,
	InventoryActionManaCost:	number,
	SellMarkup:			number,
	CurseLevel:			number,
	UsingConsumable:		string,
	BondageTarget:			number,
	FoodTarget:			number,
	KeysNeeded:			boolean,
	JailRemoveRestraintsTimer:	number;
	KinkyDungeonSpawnJailers:	number;
	KinkyDungeonSpawnJailersMax:	number;
	KinkyDungeonLeashedPlayer:	number;
	KinkyDungeonLeashingEnemy:	number;
	JailGuard:			number;
	GuardTimer:			number;
	GuardTimerMax:			number;
	GuardSpawnTimer:		number;
	GuardSpawnTimerMax:		number;
	GuardSpawnTimerMin:		number;
	KinkyDungeonMaxPrisonReduction:	number;
	KinkyDungeonPrisonReduction:	number;
	KinkyDungeonPrisonExtraGhostRep: number;
	PrisonGoodBehaviorFromLeash:	number;
	KinkyDungeonJailTourTimer:	number;
	KinkyDungeonJailTourTimerMin:	number;
	KinkyDungeonJailTourTimerMax:	number;
	KinkyDungeonPenanceCostCurrent:	number;
	KinkyDungeonAngel:		number;
	KDPenanceStage:			number;
	SpawnedPartyPrisoners:		Record<string, number>;
	KDPenanceStageEnd:		number;
	AngelCurrentRep:		string;
	KDPenanceMode:			string;
	OrgasmStage:			number;
	OrgasmTurns:			number;
	OrgasmStamina:			number;
	SleepTurns:			number;
	SlowMoveTurns:			number;
	PlaySelfTurns:			number;
	RescueFlag:			boolean;
	KinkyDungeonPenance:		boolean;
	GuardApplyTime:			number;
	WarningLevel:			number;
	AncientEnergyLevel:		number;
	OrigEnergyLevel:		number;
	LastMP:				number;
	LastAP:				number;
	LastSP:				number;
	LastWP:				number;
	Outfit:				string,
	Champion:			string,
	ChampionCurrent:		number,
	LastMapSeed:			string,
	AlreadyOpened:			{x: number, y:number}[],
	Journey:			string,
	CheckpointIndices:		number[],
	PrisonerState:			string,
	TimesJailed:			number,
	JailTurns:			number,
	JailKey:			boolean,
	CurrentDialog:			string,
	CurrentDialogStage:		string,
	OrgasmNextStageTimer:		number,
	DistractionCooldown:		number,
	ConfirmAttack:			boolean,
	CurrentDialogMsg:		string,
	CurrentDialogMsgSpeaker:	string,
	CurrentDialogMsgPersonality:	string,
	CurrentDialogMsgID:		number,
	CurrentDialogMsgData:		Record<string, string>,
	CurrentDialogMsgValue:		Record<string, number>,
	AlertTimer:			number,
	RespawnQueue:			{enemy: string, faction: string}[],
	HeartTaken:			boolean,
	CurrentVibration:		KinkyVibration,
	Edged:				boolean,
	TimeSinceLastVibeStart:		Record<string, number>,
	TimeSinceLastVibeEnd:		Record<string, number>,
	OfferFatigue:			number,
	Favors:				Record<string, number>,
	RoomType:			string,
	MapMod:				string,
	HunterTimer:			number,
	Hunters:			number[],
	Quests:				string[],
	QuestData:			Record<string, any>,
	RevealedTiles:			Record<string, number>,
	RevealedFog:			Record<string, number>,
	PriorJailbreaks:		number,
	PriorJailbreaksDecay:		number,
	PreviousWeapon:			string[],
	PreviousWeaponLock:		boolean[],
	StaminaPause:			number,
	StaminaSlow:			number,
	ManaSlow:			number,
	TempFlagFloorTicks:		Record<string, number>,
	KneelTurns:			number,
	AllowedSpellPages :		Record<string, string[]>,
	KeyringLocations :		{x: number, y: number}[],
	HiddenItems :			Record<string, boolean>,
	ItemPriority :			Record<string, number>,
	CagedTime :			number,
	DelayedActions:			KDDelayedAction[],
	OfferCount:			number,
	ItemID:				number,
	Offhand:			string,
	OffhandOld:			string,
	OffhandReturn:			string,
	ShopkeeperFee:			number,
	DollCount:			number,
	ChestsGenerated:		string[],
	DollRoomCount:			number,
	CollectedHearts:		number,
	CollectedOrbs:			number,
	otherPlaying:			number,
	Training:			Record<string, KDTrainingRecord>,
	QuickLoadout:			KDPresetLoadout[],
	CurrentLoadout:			number,
	HighestLevelCurrent:		number,
	HighestLevel:			number,
	KDChasingEnemies:		entity[],
	ShopRewardProgram:		number,
	ShopRewardProgramThreshold:	number,
	ShopkeepersMurdered: number,
	tickAlertTimer:			boolean,
	HostileFactions:		string[],
	MovePoints:			number,
	Wait:				number,
	Class:				string,
	Party:				entity[],
	CapturedParty:			entity[],
	PlayerName:			string,
	QuickLoadout_Weapon:		boolean,
	QuickLoadout_Merge:		boolean,
	ItemsSold:			Record<string, number>,
	MaxParty:			number,
	Crouch:				boolean,
	FocusControlToggle:		Record<string, boolean>,
	FloorRobotType:			Record<string, string>,
	EpicenterLevel:			number,
	BlockTokens:			number,
	DodgeTokens:			number,
	ShieldTokens:			number,
	BlockTokensMax:			number,
	DodgeTokensMax:			number,
	ShieldTokensMax:		number,
	Shield:				number,
	ShieldDamage:			number,
	Balance:			number,
	BalancePause:			boolean,
	NPCRestraints:			Record<string, Record<string, NPCRestraint>>
	Collection:			Record<string, KDCollectionEntry>,
	CollectionSorted:		KDCollectionEntry[],
	HeelPower:			number,
	visionAdjust:			number,
	visionAdjustBlind:		number,
	visionBlind:			number,
	CollectionGuests:		number,
	SelectedEscapeMethod:		string,
	Restriction:			number,
	JourneyX:			number,
	JourneyY:			number,
	ShortcutIndex:			number,
	JourneyMap:			KDJourneyMap,
	JourneyTarget:			{x: number, y: number},
	LastDragon:			string,
	ElevatorsUnlocked:		Record<number, string | boolean>,
	TeleportLocations:		Record<string, {x: number, y: number, type: string, checkpoint: string, level: number}>,
	MaxVisionDist:			number,
	MinVisionDist:			number,
	NightVision:			number,
	LockoutChance:			number,
	StatMaxBonus:			Record<string, number>,
	LogFilters:			Record<string, boolean>,
	NoForceGreet:			boolean,
	InteractTargetX:		number,
	InteractTargetY:		number,
	RegimentID:			number,
	Containers: Record<string, KDContainer>,
	FacilitiesData:			FacilitiesData,
	Regiments:			Record<string, KDRegiment>,
	QuickLoadouts:			Record<string, string[]>,
};

let KDGameDataBase: KDGameDataBase = {
	Containers: {},
	PersistentItems: {},
	Regiments: {},
	FacilitiesData: null,
	InteractTargetX: 0,
	InteractTargetY: 0,
	NoForceGreet: false,
	LogFilters: {
		Combat: true,
		Self: true,
		Action: true,
		Struggle: true,
		Ambient: true,
		Dialogue: false,
		Items: true,
		Kills: true,
	},
	LockoutChance: 0,
	ShortcutIndex: -1,
	JourneyProgression: [...KDDefaultJourney],
	JourneyTarget: null,
	JourneyX: 0,
	JourneyY: 0,
	JourneyMap: {},
	AttachedWep: "",
	Collection: {},
	NPCRestraints: {},
	CollectionSorted: [],
	RevealedTiles: {},
	RevealedFog: {},
	Balance: 1,
	BalancePause: false,
	HeelPower: 1,
	SlowMoveTurns: 0,
	Shield: 0,
	ShieldDamage: 0,
	PlayerName: "Ada",
	Party: [],
	CapturedParty: [],
	BlockTokens: 0,
	DodgeTokens: 0,
	ShieldTokens: 0,
	BlockTokensMax: 0,
	DodgeTokensMax: 0,
	ShieldTokensMax: 0,
	MaxParty: KDDefaultMaxParty,
	QuickLoadout_Weapon: true,
	QuickLoadout_Merge: true,
	FocusControlToggle: {},
	TeleportLocations: {},

	ItemsSold: {},
	CurseLevel: 0,
	UsingConsumable: "",
	MovePoints: 0,
	InventoryAction: "",
	InventoryActionManaCost: 0,
	SellMarkup: 1,
	BondageTarget: -1,
	FoodTarget: -1,
	ShopRewardProgram: 0,
	ShopRewardProgramThreshold: 500,

	ShopkeepersMurdered: 0,

	QuickLoadouts: {},
	CurrentLoadout: 0,
	Training: {},
	SpawnedPartyPrisoners: {},
	CollectedOrbs: 0,
	CollectedHearts: 0,
	DollRoomCount: 0,
	ChestsGenerated: [],
	DollCount: 0,

	ElevatorsUnlocked: {},

	CagedTime: 0,
	HiddenItems: {},
	ItemPriority: {},
	KeyringLocations: [],
	AllowedSpellPages: {},
	PriorJailbreaks: 0,
	PriorJailbreaksDecay: 0,
	KeysNeeded: false,
	RoomType: "",
	MapMod: "",

	Quests: [],
	QuestData: {},

	HunterTimer: 0,
	Hunters: [],

	AlertTimer: 0,
	OrgasmNextStageTimer: 0,
	DistractionCooldown: 0,

	JailRemoveRestraintsTimer: 0,
	KinkyDungeonSpawnJailers: 0,
	KinkyDungeonSpawnJailersMax: 5,
	KinkyDungeonLeashedPlayer: 0,
	KinkyDungeonLeashingEnemy: 0,

	JailGuard: 0,
	GuardTimer: 0,
	GuardTimerMax: 35,
	GuardSpawnTimer: 0,
	GuardSpawnTimerMax: 80,
	GuardSpawnTimerMin: 50,
	KinkyDungeonMaxPrisonReduction: 10,
	KinkyDungeonPrisonReduction: 0,
	KinkyDungeonPrisonExtraGhostRep: 0,
	PrisonGoodBehaviorFromLeash: 0,

	KinkyDungeonJailTourTimer: 0,
	KinkyDungeonJailTourTimerMin: 40,
	KinkyDungeonJailTourTimerMax: 60,

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
	Offhand: "",
	OffhandOld: "",
	OffhandReturn: "",

	Favors: {},
	PreviousWeapon: ["Unarmed", "Unarmed", "Unarmed", "Unarmed"],
	PreviousWeaponLock: [false, false, false, false],
	QuickLoadout: [],

	StaminaPause: 0,
	StaminaSlow: 0,
	ManaSlow: 0,
	KneelTurns: 0,
	DelayedActions: [],

	OfferCount: 0,

	KDChasingEnemies: [],

	RegimentID: 0,
	ItemID: 0,
	ShopkeeperFee: 0,
	otherPlaying: 0,
	HighestLevel: 1,
	HighestLevelCurrent: 1,
	tickAlertTimer: false,
	HostileFactions: [],
	Wait: 0,
	Class: "",
	EpicenterLevel: 0,
	CollectionGuests: 0,

	FloorRobotType: {},
	SelectedEscapeMethod: "Key",

	Crouch: false,
	visionAdjust: 1, // Eyes start out fully light adjusted
	visionAdjustBlind: 1, // Slowly follows actual visionadjust, used to determine if blindness occurs
	visionBlind: 0, // Penalty to vision radius based on overbright
	Restriction: 0,
	LastDragon: "",

	MaxVisionDist: 8,
	MinVisionDist: 2.9,
	NightVision: 2.9,

	StatMaxBonus: {
		AP: 0,
		SP: 0,
		MP: 0,
		WP: 0,
	},
};

let KDGameData: KDGameDataBase = Object.assign({}, KDGameDataBase);


function KinkyDungeonLeashingEnemy() {
	if (KDGameData.KinkyDungeonLeashingEnemy || KDUpdateEnemyCache) {
		return KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
	}
	if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
		return null;
	} else if (KinkyDungeonPlayerEntity.leash?.entity) {
		return KinkyDungeonFindID(KinkyDungeonPlayerEntity.leash?.entity);
	}
	return null;
}
let KDJailGuard = null;

function KinkyDungeonJailGuard(): entity {
	return KDLookupID(KDGameData.JailGuard);
}

let KDAngel = null;
function KinkyDungeonAngel() {
	if (KDGameData.KinkyDungeonAngel) {
		if (!KDAngel || KDUpdateEnemyCache) {
			KDAngel = KinkyDungeonFindID(KDGameData.KinkyDungeonAngel);
		}
	} else {
		KDAngel = null;
	}
	return KDAngel;
}

function KDUnlockPerk (Perk: string = "") {
	if (Perk && !KDUnlockedPerks.includes(Perk)) {
		KDSendMusicToast(TextGet("KDPerkUnlockedToast") + TextGet("KinkyDungeonStat" + (KinkyDungeonStatsPresets[Perk]?.id || Perk)));
		KDUnlockedPerks.push(Perk);
	}
	KDLoadPerks();
	localStorage.setItem("KDUnlockedPerks", JSON.stringify(KDUnlockedPerks));
}

function KDLoadPerks() {

	KDCategories = Object.assign([], KDCategoriesStart);
	for (let c of KDCategories) {
		c.buffs = [];
		c.debuffs = [];
	}

	for (let stat of Object.entries(KinkyDungeonStatsPresets)) {
		for (let c of KDCategories) {
			if (stat[1].category == c.name) {
				if (!stat[1].buff && (stat[1].debuff || KDGetPerkCost(stat[1]) < 0))
					c.debuffs.push(stat);
				else
					c.buffs.push(stat);
			}
		}
	}


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

let KDBGColor = "";

function KDMapInit(list: any): Record<any, any> {
	let map = {};
	for (let l of list) {
		map[l] = true;
	}
	return map;
}

function KDistEuclidean(x: number, y: number): number {
	return Math.sqrt(x*x + y*y);
}

function KDistChebyshev(x: number, y: number): number {
	return Math.max(Math.abs(x), Math.abs(y));
}


function KDistTaxicab(x: number, y: number): number {
	return Math.abs(x) + Math.abs(y);
}

function KDLoadToggles() {
	KDDefaultPalette = localStorage.getItem("KDDefaultPalette") || "";

	let loaded = localStorage.getItem("KDToggles") ? JSON.parse(localStorage.getItem("KDToggles")) : {};
	for (let t of Object.keys(KDToggles)) {
		if (loaded[t] != undefined)
			KDToggles[t] = loaded[t];
	}
}
function KDSaveToggles() {
	localStorage.setItem("KDToggles", JSON.stringify(KDToggles));
}

async function KDMigrateSaveToNewSystem() {
	// Refresh saves
	for (var i = 1; i < 5; i++) {
		let num = (i);
		await KinkyDungeonDBLoad(num).then((code) => {
			loadedsaveslots[num - 1] = code;
		});
	}
	// Check for save 1
	if (!loadedsaveslots[0]) {
		KinkyDungeonDBSave(1, localStorage.getItem('KinkyDungeonSave'));
	}
}

/**
 * Loads the kinky dungeon game
 */
function KinkyDungeonLoad(): void {

	try {
		//@ts-ignore
		let API = window.kdAPI;
		if (API) {
			KDExitButton = true;
		}
	} catch (err) {
		console.log(err);
		if (!window.location.host?.includes("127.0.0.1"))
			KDClipboardDisabled = true;
	}
	// Preload
	KDDraw(kdcanvas, kdpixisprites, "bg", "Backgrounds/BrickWall.png", 0, 0, CanvasWidth, CanvasHeight, undefined, {
		zIndex: -115,
	});

	KinkyDungeonSetupCrashHandler();

	KDStartTime = CommonTime();

	// Override right click and make it trigger the Skip key
	// Normally we don't override right click on websites but this is a game
	if (!CommonIsMobile)
		document.addEventListener('contextmenu', event => {
			// @ts-ignore
			if (CommonIsMobile || document.activeElement?.type == "text" || document.activeElement?.type == "textarea") {
				// Trigger mouse clicked
				//MouseClicked = true;
			} else {
				event.preventDefault();
				let code = KinkyDungeonKeySkip[0];
				if (!KinkyDungeonKeybindingCurrentKey) {
					KinkyDungeonKeybindingCurrentKey = code;
					KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime() + 100;
					// We also press it for 100 msec
					(async function() {
						KinkyDungeonGameKey.keyPressed[9] = true;
						KDConfirmDeleteSave = false;
						await sleep(100);
						KinkyDungeonGameKey.keyPressed[9] = false;
					})();
				}
			}
		});

	for (let entry of Object.entries(KDLoadingTextKeys)) {
		addTextKey(entry[0], entry[1]);
	}

	KDLoadPerks();

	CurrentDarkFactor = 0;

	KinkyDungeonPlayerNeedsRefresh = false;

	KinkyDungeonInitTime = CommonTime();
	KinkyDungeonGameKey.load();

	if (!KinkyDungeonIsPlayer()) KinkyDungeonGameRunning = false;
	//if (!KDPatched && KinkyDungeonState == 'Consent') KinkyDungeonState = "Menu";
	//if (!Player.KinkyDungeonSave) Player.KinkyDungeonSave = {};

	if (!KinkyDungeonGameRunning) {
		if (!KinkyDungeonPlayer) { // new game
			KDrandomizeSeed(false);
			if (KDPatched) {
				// Default player character for legacy reasons
				KinkyDungeonPlayer = suppressCanvasUpdate(() => CharacterLoadNPC(0, localStorage.getItem("PlayerName") || "Ada"));
			}

			KDLoadToggles();


			KinkyDungeonBones = localStorage.getItem("KinkyDungeonBones") != undefined ? localStorage.getItem("KinkyDungeonBones") : KinkyDungeonBones;
			KDBGColor = localStorage.getItem("KDBGColor") != undefined ? localStorage.getItem("KDBGColor") : "#000000";

			if (localStorage.getItem("KDResolution")) {
				let parsed = parseInt(localStorage.getItem("KDResolution"));
				if (parsed != undefined) {
					KDResolutionListIndex = parsed;
					KDResolution = KDResolutionList[KDResolutionListIndex];
				}
			}
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
			if (localStorage.getItem("KDSfxVolume")) {
				let parsed = parseInt(localStorage.getItem("KDSfxVolume"));
				if (parsed != undefined) {
					KDSfxVolumeListIndex = parsed;
					KDSfxVolume = KDSfxVolumeList[KDSfxVolumeListIndex];
				}
			}
			if (localStorage.getItem("KDAnimSpeed")) {
				let parsed = parseInt(localStorage.getItem("KDAnimSpeed"));
				if (parsed != undefined) {
					KDAnimSpeedListIndex = parsed;
					KDAnimSpeed = KDAnimSpeedList[KDAnimSpeedListIndex] || 0;
				}
			}
			if (localStorage.getItem("KDSelectedFont")) {
				let parsed = parseInt(localStorage.getItem("KDSelectedFont"));
				if (parsed != undefined) {
					KDSelectedFontListIndex = parsed;
					KDSelectedFont = KDFonts.get(KDSelectedFontList[KDSelectedFontListIndex])?.alias || KDFontName;
				}
			}
			if (localStorage.getItem("KDButtonFont")) {
				let parsed = parseInt(localStorage.getItem("KDButtonFont"));
				if (parsed != undefined) {
					KDButtonFontListIndex = parsed;
					KDButtonFont = KDFonts.get(KDButtonFontList[KDButtonFontListIndex])?.alias || KDFontName;
				}
			}
			if (localStorage.getItem("KDGamma")) {
				let parsed = parseInt(localStorage.getItem("KDGamma"));
				if (parsed != undefined) {
					KDGammaListIndex = parsed;
					KDGamma = KDGammaList[KDGammaListIndex] || 0;
					kdgammafilterstore[0] = KDGamma;
				}
			}
			if (localStorage.getItem("zoomLvl") != undefined) {
				let parsed = parseInt(localStorage.getItem("zoomLvl"));
				if (parsed != undefined) {
					KDZoomIndex = parsed;
				}
			}



			if (localStorage.getItem('KDLastSaveSlot') == undefined
				&& localStorage.getItem('KinkyDungeonSave')) {
				localStorage.setItem('KDLastSaveSlot', "1");
				KDMigrateSaveToNewSystem();
			}


			KinkyDungeonSexyMode = localStorage.getItem("KinkyDungeonSexyMode") != undefined ? localStorage.getItem("KinkyDungeonSexyMode") == "True" : true;
			KinkyDungeonClassMode = localStorage.getItem("KinkyDungeonClassMode") != undefined ? localStorage.getItem("KinkyDungeonClassMode") : "Mage";
			KinkyDungeonSexyPiercing = localStorage.getItem("KinkyDungeonSexyPiercing") != undefined ? localStorage.getItem("KinkyDungeonSexyPiercing") == "True" : false;
			KinkyDungeonSexyPlug = localStorage.getItem("KinkyDungeonSexyPlug") != undefined ? localStorage.getItem("KinkyDungeonSexyPlug") == "True" : false;
			KinkyDungeonSexyPlugFront = localStorage.getItem("KinkyDungeonSexyPlugFront") != undefined ? localStorage.getItem("KinkyDungeonSexyPlugFront") == "True" : false;
			KinkyDungeonProgressionMode = localStorage.getItem("KinkyDungeonProgressionMode") != undefined ? localStorage.getItem("KinkyDungeonProgressionMode") : "Key";
			KinkyDungeonSaveMode = localStorage.getItem("KinkyDungeonSaveMode") != undefined ? localStorage.getItem("KinkyDungeonSaveMode") == "True" : false;
			KinkyDungeonHardMode = localStorage.getItem("KinkyDungeonHardMode") != undefined ? localStorage.getItem("KinkyDungeonHardMode") == "True" : false;
			KinkyDungeonExtremeMode = localStorage.getItem("KinkyDungeonExtremeMode") != undefined ? localStorage.getItem("KinkyDungeonExtremeMode") == "True" : false;
			KinkyDungeonPerksMode = localStorage.getItem("KinkyDungeonPerksMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonPerksMode")) || 0 : 0;
			KinkyDungeonPerkProgressionMode = localStorage.getItem("KinkyDungeonPerkProgressionMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonPerkProgressionMode")) || 0 : 1;
			KinkyDungeonPerkBondageMode = localStorage.getItem("KinkyDungeonPerkBondageMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonPerkBondageMode")) || 0 : 1;
			KinkyDungeonPerkBondageVisMode = localStorage.getItem("KinkyDungeonPerkBondageVisMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonPerkBondageVisMode")) || 0 : 2;
			KinkyDungeonRandomMode = localStorage.getItem("KinkyDungeonRandomMode") != undefined ? localStorage.getItem("KinkyDungeonRandomMode") == "True" : false;
			KinkyDungeonEasyMode = localStorage.getItem("KinkyDungeonEasyMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonEasyMode")) || 0 : 0;
			KinkyDungeonItemMode = localStorage.getItem("KinkyDungeonItemMode") != undefined ? parseInt(localStorage.getItem("KinkyDungeonItemMode")) || 0 : 0;

			KinkyDungeonNewDress = true;
			KDCurrentOutfit = parseInt(localStorage.getItem("kdcurrentoutfit") || 0);
			let appearance = DecompressB64(localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit));
			if (!appearance
				// No appearance, or legacy
				|| (StandalonePatched && JSON.parse(appearance).length && JSON.parse(appearance)[0]?.Asset)) {
				KinkyDungeonNewDress = false;
				if (StandalonePatched)
					appearance = DecompressB64("NobwRAsg9gJgpgGzALjAIVgTzAGjAEQEsAzYwgYwFcEAXbZABjwGEoEoAnFAuYgQ2o0wAXxzho8JKgDSUQgFFMcAM64CJMlVr0mYVuy6p8vAbTUAxQrTgdVycIpUpwAcz4Bbd3xQBGAHQMAGzBIaGhAOx4ynw0lBwxhFAAdii65Mk08cpCyP4AzACseABGHIQuABY0SSp2/gAcRWAccDCpfnn1ed09vb14Li1wKYx+BWETIZFgxQiUcCh5fgCcTXwIAA4V3rmiYI7KAEzOYG6eO/5BkxPT0bHxNIkjaRlZOflNpeVVNcp1fo08C02qNOn1wT0BkNnmNrjcSnMFsglqs8OsthdhFixJBYIhuLJCGgOFAAO6qPBEUgUQQ6FhsTjcYz8QQiHESfEyOTQSg0CpqKmaWmpekGJkmVmicR4qRgQloObKfmUjQ07QivQMww8FlmKW4yTcACCFSgLgWKupWjoGv0jKMErMeEs1lsJxNZqRrg8XnahQYAcDQaDeSiMTiCWSvjw6SSmT42WjMzKlWqtSTwN8fjhEyagzgw3ahx8OYiCPmRZLpeC03R218WP1HNlaD45AA1gBlePfISWoXqxii+060x9sAumg2OzgVsd7vxXsnM6+0EFYMbwOhsB3COPKO5GOvBPvEopn7pw/NVpZ6shPPQyt3wLTWYV0bF5+1zb13bY6WGqgC58L2rZJC4FLqFawpDpqYoOrq46TtOJzAaBfDgTOpw+jsDAdOum4btuu4PE8SaxvGiZXl8qa/HUQI3rk2bPg+BYwp+d6voiT6cWiP6Yv+BqcugGEwIQNAYFANCQYKao2rBdragAxKQqnEBYVhTm69hgJ2ppwAAMrwOTeucWYACyERuPhhvckYwgwEJOduFFvFmBRdM5/TJr2dG3p5XndAxII2acj7UdxV51pieB6VAcAAEpLjpK4XH4llWUGoUkfZ7SOYF3muSe7kBYFZ6+Ze/iBKVXnBUm+aFhF76hdFDaCc23AAOrieQFQKlAlDKBaUEDvJuiKdwKlqepTYyl1PUVKwthwOOsnWnScEjlNakaa6WFLUNJnYWZTHmU0OX7jC5lfkecZudR55pn8GaMaFDUjKFb5Ii1/FtbNgGQCBMCdu2hAcKtqrrbaWqTdN6nOppKE6SDYNHalSYXWRH4FT05m3ZRp4+bRlV1Ve71Jl97lrL9TEMFW1aNuyc2oBAQOdlAHYyZDMHjTDqDbapu1aVh7MdklqbLjhGPhqRB4vHdxUPRVz1XpmZPhZ9kU/RiDaxRz7ZGcQaNS1emNy/j92fY9fmq69UJsRTWt8Trf7/cJwEbBsmBoIQoNJIQArc4OvPwaOkpMwDBkxHAAAexLeP2ckbRNCFjiIAC6QA");
			}

			CharacterAppearanceRestore(KinkyDungeonPlayer, appearance, false, true);

			if (KDPatched)
				suppressCanvasUpdate(() => CharacterReleaseTotal(KinkyDungeonPlayer));
			else
				CharacterReleaseTotal(KinkyDungeonPlayer);


			CharacterRefresh(KinkyDungeonPlayer);


			KinkyDungeonInitializeDresses();
			KinkyDungeonDressSet();

			if (KDPatched)
				suppressCanvasUpdate(() => CharacterNaked(KinkyDungeonPlayer));
			else
				CharacterNaked(KinkyDungeonPlayer);

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();

			KDInitProtectedGroups(KinkyDungeonPlayer);

		}

		if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
			KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
			KinkyDungeonKeybindingsTemp = {};
			Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			console.log(KinkyDungeonKeybindings);
		}
		else {
			console.log("Failed to load keybindings");
			KDSetDefaultKeybindings();
		}

		if (KinkyDungeonIsPlayer()) {
			//if (!KDPatched && KinkyDungeonState == "Consent")
			//KinkyDungeonState = "Menu";
			KinkyDungeonGameData = null;

			//CharacterAppearancePreviousEmoticon = WardrobeGetExpression(Player).Emoticon;
			//ServerSend("ChatRoomCharacterExpressionUpdate", { Name: "Gaming", Group: "Emoticon", Appearance: ServerAppearanceBundle(Player.Appearance) });
		} else {
			KinkyDungeonState = "Game";
			if (!KinkyDungeonGameData) {
				MiniGameKinkyDungeonLevel = 1;
				KinkyDungeonInitialize(1);
			}
		}

	}
}

/**
 * Restricts Devious Dungeon Challenge to only occur when inside the arcade
 * @returns - If the player is in the arcade
 */
function KinkyDungeonDeviousDungeonAvailable(): boolean {
	return KinkyDungeonIsPlayer() && (DialogGamingPreviousRoom == "Arcade" || MiniGameReturnFunction == "ArcadeKinkyDungeonEnd") && !KDPatched;
}

/**
 * Returns whether or not the player is the one playing, which determines whether or not to draw the UI and struggle groups
 * @returns - If the player is the game player
 */
function KinkyDungeonIsPlayer(): boolean {
	return true;//(!KinkyDungeonPlayerCharacter || KinkyDungeonPlayerCharacter == Player) ;
}

/**
 * Runs the kinky dungeon game and draws its components on screen
 * @returns {void} - Nothing
 */

let KinkyDungeonCreditsPos = 0;
let KDMaxPatronPerPage = 4;
let KDMaxPatron = 5;
let KinkyDungeonPatronPos = 0;
let KinkyDungeonFastWait = true;
let KinkyDungeonTempWait = false;
let KinkyDungeonSexyMode = false;
let KinkyDungeonClassMode = "Mage";
let KinkyDungeonRandomMode = false;
let KinkyDungeonProgressionMode = "Key";
let KinkyDungeonItemMode = 0;
let KinkyDungeonEasyMode = 0;
let KinkyDungeonSaveMode = false;
let KinkyDungeonHardMode = false;
let KinkyDungeonExtremeMode = false;
let KinkyDungeonPerksMode = 0;
let KinkyDungeonPerkProgressionMode = 1;
let KinkyDungeonPerkBondageMode = 1;
let KinkyDungeonPerkBondageVisMode = 2;
let KinkyDungeonSexyPiercing = false;
let KinkyDungeonSexyPlug = false;
let KinkyDungeonSexyPlugFront = false;
let KDOldValue = "";
let KDOldSaveCodeValue = "";
let KDOriginalValue = "";

let KDResetOutfitToggleFlag = false;

let KDRestart = false;

let fpscounter = 0;
let lastfps = 0;
let dispfps = 60;

async function sleep(msec: number) {
	return new Promise(resolve => setTimeout(resolve, msec));
}

let KDMarkAsCache = [];

let lastGlobalRefresh = 0;
let GlobalRefreshInterval = 2000;
let KDGlobalRefresh = false;
let KDGlobalFilterCacheRefresh = true;

let KDLogoStartTime = 0;
let KDLogoEndTime = 2500;
let KDLogoEndTime2 = 800;

function KDOpenFullscreen() {
	try {
		// @ts-ignore
		let API = window.kdAPI;
		if (API?.setFullscreen) API.setFullscreen();
	} catch (err) {
		console.log(err);
	}
}

function KDCloseFullscreen() {
	try {
		// @ts-ignore
		let API = window.kdAPI;
		if (API?.setWindowed) API.setWindowed();
	} catch (err) {
		console.log(err);
	}
}


function KinkyDungeonRun() {
	if (KDSaveQueue.length > 0 && !KDSaveBusy) {
		KDSaveBusy = true;
		let ss = KDSaveSlot;
		KDSendMusicToast(TextGet("KDSaving"));
		KinkyDungeonCompressSave(KDSaveQueue.splice(0, 1)[0]).then(
			(data) => {
					localStorage.setItem('KinkyDungeonSave', data);
					if (ss != undefined) {
						KinkyDungeonDBSave(ss, data);
					}
				}
			).finally(() => {
				KDSaveBusy = false;
				KDSendMusicToast(TextGet("KDSaved"), -4000);
			});
	}

	if (VersionMajor < 0) {
		let parseString = TextGet("KDVersionStr");
		if (parseString && parseString != "KDVersionStr") {
			let arr = parseString.split('.');


			try {
				VersionMajor = parseInt(arr[0]);
			} catch {
				VersionMajor = 0;
			}
			try {
				VersionMinor = parseInt(arr[1]);
			} catch {
				VersionMinor = 0;
			}
			try {
				if (arr[2].includes('.')) {
					arr[2] = arr[2].substring(0, arr[2].indexOf('.'));
				}
				if (arr[2].includes('-')) {
					arr[2] = arr[2].substring(0, arr[2].indexOf('-'));
				}
				VersionPatch = parseInt(arr[2]);
			} catch {
				VersionPatch = 0;
			}


			if (KDToggles.AutoLoadMods) {
				if (!KDGetMods) {
					KDGetMods = true;
					KDGetModsLoad(true);
				}
			}
		}
	}


	KDJourneyGraphics.clear();
	KDJourneyGraphicsLower.clear();
	KDJourneyGraphicsUpper.clear();

	if (StandalonePatched) {
		if (KDFullscreen && !KDToggles.Fullscreen) {
			KDCloseFullscreen();
			KDFullscreen = false;
		} else if (!KDFullscreen && KDToggles.Fullscreen) {
			KDOpenFullscreen();
			KDFullscreen = true;
		}
	}

	if (!KDLogoStartTime) KDLogoStartTime = CommonTime();

	if (KinkyDungeonPlayer?.Appearance) {
		for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
			if (KinkyDungeonPlayer.Appearance[A]?.Asset?.Name?.includes("Penis")) {
				KinkyDungeonPlayer.Appearance.splice(A, 1);
				A--;
			}
		}
	}
	if (StandalonePatched && KDCurrentModels) {
		let refresh = false;
		if (CommonTime() > lastGlobalRefresh + GlobalRefreshInterval) {
			lastGlobalRefresh = CommonTime();
			//console.log("refresh");
			refresh = true;
			KDGlobalFilterCacheRefresh = true;
		}

		for (let ent of KDCurrentModels.entries()) {
			let MC = ent[1];

			// Cull containers that werent drawn this turn
			for (let Container of MC.Containers.entries()) {

				if (!MC.ContainersDrawn.has(Container[0]) && Container[1]) {
					Container[1].Mesh.parent.removeChild(Container[1].Container);
					MC.Containers.delete(Container[0]);
					KDContainerClear(Container[1]);
				} else if (refresh && (ent[0] == KinkyDungeonPlayer || ent[0] == KDSpeakerNPC))
					// We only refresh NPCs that are front and center, for optimization reasons
					MC.Update.delete(Container[0]);
			}

			MC.ContainersDrawn.clear();
		}
	}




	// Reset the sprites drawn cache
	kdSpritesDrawn = new Map();

	KDLastButtonsCache = KDButtonsCache;
	KDButtonsCache = {};
	KDUpdateVibeSounds();
	KDUpdateMusic();

	if (!KDPatched)
		DrawButtonVis(1885, 25, 90, 90, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Exit.png");

	// eslint-disable-next-line no-constant-condition
	if (true || KDToggles.Fullscreen) {
		KinkyDungeonGridWidthDisplay = 2000/KinkyDungeonGridSizeDisplay;//17;
		KinkyDungeonGridHeightDisplay = 1000/KinkyDungeonGridSizeDisplay;//9;
		canvasOffsetX = 0;
		canvasOffsetY = 0;
		KinkyDungeonCanvas.width = 2000;
		KinkyDungeonCanvas.height = 1000;
	} else {

		// @ts-ignore
		KinkyDungeonGridWidthDisplay = 16;
		KinkyDungeonGridHeightDisplay = 9;
		canvasOffsetX = canvasOffsetX_ui;
		canvasOffsetY = canvasOffsetY_ui;
		KinkyDungeonCanvas.width = KinkyDungeonGridSizeDisplay * KinkyDungeonGridWidthDisplay;
		KinkyDungeonCanvas.height = KinkyDungeonGridSizeDisplay * KinkyDungeonGridHeightDisplay;
	}
	// Check to see whether the player (outside of KD) needs a refresh
	KinkyDungeonCheckPlayerRefresh();


	if ((KinkyDungeonState != "Game" || KinkyDungeonDrawState != "Game") && KinkyDungeonState != "TileEditor") {
		let BG = (KinkyDungeonState == "Consent" || KinkyDungeonState == "Intro" || KinkyDungeonState == "Logo" || KinkyDungeonState == "Game") ? "Logo" : "BrickWall";
		if (StandalonePatched) {
			KDDraw(kdcanvas, kdpixisprites, "bg", "Backgrounds/" + BG + (StandalonePatched ? ".png" : ".jpg"), 0, 0, CanvasWidth, CanvasHeight, undefined, {
				zIndex: -115,
			});
		} else {
			DrawImage("Backgrounds/" + BG + ".jpg", 0, 0);
		}
		kdgameboard.visible = false;
		kdgamefog.visible = false;
		kdminimap.visible = false;
	} else {
		kdgameboard.visible = true;
		kdminimap.visible = KinkyDungeonState != "TileEditor";
		kdgamefog.visible = KinkyDungeonState != "TileEditor";
	}
	// Draw the characters
	if (!KDStandardRenderException[KinkyDungeonState]
		|| (KDStandardRenderException[KinkyDungeonState].length > 0
			&& !KDStandardRenderException[KinkyDungeonState][KinkyDungeonDrawState])) {
		if (KDBGColor) {
			FillRectKD(kdcanvas, kdpixisprites, "playerbg", {
				Left: 0,
				Top: 0,
				Width: KinkyDungeonDrawState == "Game" ? 500 : 2000,
				Height: 1000,
				Color: KDBGColor,
				zIndex: KinkyDungeonDrawState == "Game" ? -1 : -1000,
				alpha: StandalonePatched ? KDUIAlpha : 0.01,
			});
		}
		let Char = (KinkyDungeonState == "LoadOutfit" ? KDSpeakerNPC : null) || KinkyDungeonPlayer;
		DrawCharacter(Char, 0, 0, 1, undefined, undefined, undefined, undefined, undefined, KinkyDungeonPlayer == Char ? KDToggles.FlipPlayer : false);
	}

	if (CommonIsMobile && mouseDown && !KDMouseInPlayableArea()) {
		KDDraw(kdcanvas, kdpixisprites, "cursor", KinkyDungeonRootDirectory + "Cursor.png", MouseX, MouseY, 72, 72, undefined, {
			zIndex: 300,
		});
	}

	if (KDRender[KinkyDungeonState]) {
		KDRender[KinkyDungeonState]();
	} else
	if (KinkyDungeonState == "Logo") {
		if (CommonTime() > KDLogoStartTime + KDLogoEndTime) {
			KinkyDungeonState = "Consent";
			KDLogoStartTime = CommonTime() + 400;
		} else {
			// Draw the strait-laced logo
			KDDraw(kdcanvas, kdpixisprites, "logo", "Logo.png", 500, 0, 1000, 1000, undefined, {
				zIndex: 0,
				alpha: 0.5 - 0.5*Math.cos(Math.PI * 2 * (CommonTime() - KDLogoStartTime) / KDLogoEndTime),
			});
		}
	} else
	if (KinkyDungeonState == "Mods") {

		DrawButtonKDEx("mods_back", (_bdata) => {
			KinkyDungeonState = "Menu";
			KDExecuteMods();
			return true;
		}, true, 975, 850, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "",
		undefined, undefined, undefined, undefined,
		undefined, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
			hotkeyPress: KinkyDungeonKeySkip[0],
		});

		(!KDExecuted)
			DrawButtonKDEx("mods_load", (_bdata) => {
				getFileInput();
				return true;
			}, true, 975, 250, 350, 64, TextGet("KinkyDungeonLoadMod"), "#ffffff", "");
		DrawTextKD(TextGet("KinkyDungeonLoadModWarning1"), 1175, 100, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonLoadModWarning2"), 1175, 150, "#ffffff", KDTextGray2);

		KDDrawMods();

	} else if (KinkyDungeonState == "Credits") {
		let credits = TextGet("KinkyDungeonCreditsList" + KinkyDungeonCreditsPos).split('|');
		let i = 0;
		for (let c of credits) {
			DrawTextKD(c, 550, 25 + 40 * i, "#ffffff", KDTextGray2, undefined, "left");
			i++;
		}

		DrawButtonVis(1870, 930, 110, 64, TextGet("KinkyDungeonBack"), "#ffffff", "");
		DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
	} else if (KinkyDungeonState == "Patrons") {
		let credits = KDPatrons;//TextGet("KinkyDungeonPatronsList" + x).split('|');
		DrawTextKD(TextGet("KinkyDungeonPatronsList"), 550, 25, "#ffffff", KDTextGray2, undefined, "left");
		let col = 0;
		let iter = 1;
		let height = 30;
		let maxPatron = Math.floor(975/height);
		let maxcolumn = 6;
		let colwidth = 250;
		for (let i = KinkyDungeonPatronPos * maxPatron; i < credits.length; i++) {
			let c = credits[i];
			let yy = 25 + height * iter;
			DrawTextFitKD(c, 550 + colwidth * (col), yy, colwidth - 10, "#ffffff", KDTextGray2, 24, "left", 40);
			iter++;
			if (iter > maxPatron) {
				iter = 1;
				col += 1;
			}
			if (col > maxcolumn) break;
		}


		DrawButtonVis(1870, 930, 110, 64, TextGet("KinkyDungeonBack"), "#ffffff", "");
		DrawButtonKDEx("patronnext", (_bdata) => {
			if (KinkyDungeonPatronPos * maxPatron < credits.length - maxPatron * maxPatron) KinkyDungeonPatronPos += 1;
			else KinkyDungeonPatronPos = 0;
			return true;
		}, true, 1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
		//DrawButtonVis(1730, 930, 110, 64, TextGet("KinkyDungeonNext"), "#ffffff", "");
	} else if (KinkyDungeonState == "Menu") {
		if (CommonTime() < KDLogoStartTime + KDLogoEndTime2) {
			CommonTime(); // ...
			FillRectKD(kdcanvas, kdpixisprites, "greyfade", {
				Left: 0, Top: 0, Width: 2000,
				Height: 1000,
				Color: "#383F4F", alpha: Math.max(0, 1 - (CommonTime() - KDLogoStartTime) / KDLogoEndTime2), zIndex: 200
			});
		}
		KinkyDungeonGameFlag = false;
		DrawCheckboxVis(1700, 25, 64, 64, TextGet("KDToggleSound"), KDSoundEnabled(), false, "#ffffff");
		// Draw temp start screen
		if (KDLose) {
			DrawTextKD(TextGet("End"), 1000, 250, "#ffffff", KDTextGray2);
			//DrawTextKD(TextGet("End2"), 1000, 310, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("End3"), 1000, 290, "#ffffff", KDTextGray2);
		} else if (!KDPatched) {
			//DrawTextKD(TextGet("Intro"), 1250, 250, "#ffffff", KDTextGray2);
			//DrawTextKD(TextGet("Intro2"), 1250, 300, "#ffffff", KDTextGray2);
			//DrawTextKD(TextGet("Intro3"), 1250, 350, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("Intro4BC"), 1000, 960, "#ffffff", KDTextGray2);
		}

		//let str = TextGet("KinkyDungeon") + " v" + TextGet("KDVersionStr");
		//DrawTextKD(str.substring(0, Math.min(str.length, Math.round((CommonTime()-KDStartTime)/100))), 1000, 80, "#ffffff", KDTextGray2, 84);

		KDDraw(kdcanvas, kdpixisprites, "logo", KinkyDungeonRootDirectory + "SimpleLogo.png", 1000 - 350, 0, 350 * 2, 150 * 2);
		DrawTextKD(KDPatched ? (TextGet("KDVersion") + " " + TextGet("KDVersionStr")) : TextGet("KDLogo2"), 1000, 300, "#fff6bc", KDTextGray2, 24);
		//DrawTextKD(TextGet("KinkyDungeon") + " v" + TextGet("KDVersionStr"), 1000, 200, "#ffffff", KDTextGray2);

		if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable() && !KDPatched)
			DrawTextKD(TextGet("DeviousChallenge"), 1000, 925, "#fff6bc", KDTextGray2);


		DrawButtonKDEx("GameContinue", () => {
			KDExecuteModsAndStart();
			// Set the save slot - if the player last loaded a save from slot 2, this will continue saving to slot 2.
			KDSaveSlot = (localStorage.getItem('KDLastSaveSlot') !== null) ? parseInt(localStorage.getItem('KDLastSaveSlot')) : 0;

			return true;
		}, localStorage.getItem('KinkyDungeonSave') != '', 1000-350/2, 360, 350, 64, TextGet("GameContinue"), localStorage.getItem('KinkyDungeonSave') ? "#ffffff" : "pink", "");
		DrawButtonKDEx("GameStart", () => {
			KinkyDungeonState = "Name";
			KDSaveSlot = (localStorage.getItem('KDLastSaveSlot') !== null) ? parseInt(localStorage.getItem('KDLastSaveSlot')) : 4;
			let emptySlot = undefined;
			for (var i = 1; i < 5; i++) {
				let num = (i);
				KinkyDungeonDBLoad(num).then((code) => {
					loadedsaveslots[num - 1] = code;
					let decoded = LZString.decompressFromBase64(code);
					if (decoded && JSON.parse(decoded)?.KDGameData?.PlayerName) loadedsaveNames[num - 1] =
						JSON.parse(decoded)?.KDGameData?.PlayerName;
					if (!emptySlot && !code) {
						emptySlot = num;
						KDSaveSlot = emptySlot;
					}
				});
			}
			return true;
		}, true, 1000-350/2, 440, 350, 64, TextGet("GameStart"), "#ffffff", "");
		DrawButtonKDEx("LoadGame", () => {
			/*KinkyDungeonState = "Load";*/
			KinkyDungeonState = "LoadSlots";

			KDConfirmDeleteSave = false;
			KDPreviewModel = Object.assign({}, KinkyDungeonPlayer);
			KDPreviewModel.ID = KinkyDungeonPlayer.ID + 1; // Ensure a unique id.
			KinkyDungeonDBLoad(0).then((code) => {
				KDSlot0 = code;
			});
			for (var i = 1; i < 5; i++) {
				let num = (i);
				KinkyDungeonDBLoad(num).then((code) => {
					loadedsaveslots[num - 1] = code;
				});
			}

			loadedSaveforPreview = null;
			KDExecuteMods();
			ElementCreateTextArea("saveInputField");
			return true;
		}, true, 1000-350/2, 520, 350, 64, TextGet("LoadGame"), "#ffffff", "");
		/*DrawButtonKDEx("GameConfigKeys", () => {
			KinkyDungeonState = "Keybindings";

			if (!KinkyDungeonKeybindings)
				KDSetDefaultKeybindings();
			else {
				KinkyDungeonKeybindingsTemp = {};
				Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			}
			return true;
		}, true, 1000-350/2, 600, 350, 64, TextGet("GameConfigKeys"), "#ffffff", "");*/

		if (KinkyDungeonKeybindingsTemp?.Spell1 && KinkyDungeonKeybindingsTemp.Spell1.length > 1 && (KinkyDungeonKeybindingsTemp.Spell1.includes("Digit") || KinkyDungeonKeybindingsTemp.Spell1.includes("Key")))
			DrawTextFitKD(TextGet("KDKeysUpdate" + (KDEasterEgg ? "EasterEgg" : "")), 1000-350/2, 600 + 32, 500, "#ffffff", undefined, 18, "right");
		else if (Object.keys(KDDefaultKB).some((key) => {return KinkyDungeonKeybindingsTemp && !KinkyDungeonKeybindingsTemp[key];})) {
			DrawTextFitKD(TextGet("KDKeysNoBound" + (KDEasterEgg ? "EasterEgg" : "")), 1000-350/2, 600 + 32, 500, "#ffffff", undefined, 18, "right");
		}
		DrawButtonKDEx("GameToggles", () => {
			KinkyDungeonState = "Toggles";
			return true;
		}, true, 1000-350/2, 600, 350, 64, TextGet("GameToggles"), "#ffffff", "");

		let ii = 680;
		if (KDExitButton) {
			DrawButtonKDEx("KDExitButton", () => {
				//@ts-ignore
				let API = window.kdAPI;
				if (API?.close) API.close();
				return true;
			}, true, 1000-350/2, ii, 350, 64, TextGet("KDExit"), "#ffffff", "");
			ii += 80;
		}
		if (TestMode) {
			DrawButtonKDEx("TileEditor", () => {
				KDInitTileEditor();
				KinkyDungeonState = "TileEditor";
				return true;
			}, true, 1000-350/2, ii, 350, 64, "Tile Editor", "#ffffff", "");
		}


		DrawButtonKDEx("GoToWardrobe", (_bdata) => {

			if (StandalonePatched) {
				KDSpeakerNPC = null;
				KinkyDungeonState = "Wardrobe";
				KDCanRevertFlag = false;
				KDWardrobeCallback = null;
				KDWardrobeRevertCallback = null;
				KDPlayerSetPose = false;
				KDInitCurrentPose();
				KinkyDungeonInitializeDresses();
				KDUpdateModelList();
				KDRefreshOutfitInfo();
				let itt = localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);
				let orig = itt ?
					JSON.parse(LZString.decompressFromBase64(itt)).appearance
					|| itt : "";
				let current = LZString.compressToBase64(AppearanceItemStringify(KinkyDungeonPlayer.Appearance));
				if (orig != current) KDOriginalValue = orig;
			}
			let appearance = DecompressB64(localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit));
			if (appearance) {
				CharacterAppearanceRestore(KinkyDungeonPlayer, appearance, false, true);
				let parsed = JSON.parse(appearance);
				if (parsed.metadata) {
					KinkyDungeonPlayer.Palette = parsed.metadata.palette;
				}

				CharacterRefresh(KinkyDungeonPlayer);
			}
			KinkyDungeonNewDress = true;

			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressPlayer();
			KinkyDungeonConfigAppearance = true;
			if (appearance) {
				CharacterAppearanceRestore(KinkyDungeonPlayer, appearance, false, true);
				let parsed = JSON.parse(appearance);
				if (parsed.metadata) {
					KinkyDungeonPlayer.Palette = parsed.metadata.palette;
				}
				CharacterRefresh(KinkyDungeonPlayer);
			}
			return true;
		}, true, 30, 942, 440, 50, TextGet("KinkyDungeonDressPlayer"), "#ffffff", "");


		DrawButtonVis(1850, 942, 135, 50, TextGet("KinkyDungeonCredits"), "#ffffff", "");
		DrawButtonVis(1700, 942, 135, 50, TextGet("KinkyDungeonPatrons"), "#ffffff", "");

		if (!StandalonePatched) {
			DrawButtonKDEx("Deviantart", (_bdata) => {
				let url = 'https://www.deviantart.com/ada18980';
				window.open(url, '_blank');
				return true;
			}, true, 1700, 694, 280, 50, TextGet("KinkyDungeonDeviantart"), "#ffffff", "");

			DrawButtonKDEx("Patreon", (_bdata) => {
				let url = 'https://www.patreon.com/ada18980';
				KDSendEvent('patreon');
				window.open(url, '_blank');
				return true;
			}, true, 1700, 754, 280, 50, TextGet("KinkyDungeonPatreon"), "#ffeecc", "");

		}


		if (KDPatched || StandalonePatched) {
			DrawTextKD(TextGet("Language") + " ->", 1675, 898, "#ffffff", KDTextGray2, undefined, "right");
			DrawButtonVis(1700, 874, 280, 50, localStorage.getItem("BondageClubLanguage") || "EN", "#ffffff", "");
		}

		if (KDPatched) {

			DrawButtonKDEx("mods_button", (_bdata) => {
				KinkyDungeonState = "Mods";
				return true;
			}, true, 1700, 814, 280, 50,
			!KDExecuted ?
				 TextGet("KDMods") :
				((KDModFileCount === 1) ?
					`${KDModFileCount} ${TextGet("KDModsLoaded").replace("s","")}` :
					`${KDModFileCount} ${TextGet("KDModsLoaded")}`),
				`#ffffff`, "");

			if (Object.keys(KDModConfigs).length > 0) {
				DrawButtonKDEx("modconfigs_button", (_bdata) => {
					KinkyDungeonState = "ModConfig";
					return true;
				}, true, 1700, 755, 280, 50, TextGet("KDModConfigsButton"), "#ffffff", "");
			}
		}

		if (KDRestart)
			DrawTextKD(TextGet("RestartNeeded" + (localStorage.getItem("BondageClubLanguage") || "EN")), 1840, 600, "#ffffff", KDTextGray2);
	} else if (KinkyDungeonState == "Consent") {
		/*if (CommonTime() < KDLogoStartTime + KDLogoEndTime2) {
			CommonTime(); // ...
			FillRectKD(kdcanvas, kdpixisprites, "greyfade", {
				Left: 0, Top: 0, Width: 2000,
				Height: 1000,
				Color: "#383F4F", alpha: Math.max(0, 1 - (CommonTime() - KDLogoStartTime) / KDLogoEndTime2), zIndex: 200
			});
		}*/
		//let str = TextGet("KinkyDungeon") + " v" + TextGet("KDVersionStr");
		//DrawTextKD(str.substring(0, Math.min(str.length, Math.round((CommonTime()-KDStartTime)/100))), 1000, 80, "#ffffff", KDTextGray2, 84);
		//DrawTextKD(TextGet("KDLogo2"), 1000, 180, "#ffffff", KDTextGray2);

		if (!KDLoadingFinished) {
			DrawTextKD(CurrentLoading, 1000, 900, "#ffffff", KDTextGray2);
			DrawTextKD(TextGet("KDLoading") + Math.round(100 * KDLoadingDone / KDLoadingMax) + "%", 1000, 950, "#ffffff", KDTextGray2);
		} else {
			KDOptOut = true;
			let cb = () => {
				//let Char = KinkyDungeonPlayer;
				//DrawCharacter(Char, 0, 0, 0.01, undefined, undefined, undefined, undefined, undefined, KinkyDungeonPlayer == Char ? KDToggles.FlipPlayer : false);

				if (KDToggles.SkipIntro) KinkyDungeonState = "Menu"; else KinkyDungeonState = "Intro";
			};
			setTimeout(cb, 100);

			CharacterReleaseTotal(KinkyDungeonPlayer);
			KinkyDungeonDressSet();
			CharacterNaked(KinkyDungeonPlayer);
			KinkyDungeonInitializeDresses();
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KDInitProtectedGroups(KinkyDungeonPlayer);
			CharacterRefresh(KinkyDungeonPlayer);
			// Draw the PC for one
			KDLogoStartTime = CommonTime() + 400;
			/*

				DrawButtonVis(1000-450/2, 720, 450, 64, TextGet("KDOptIn"), KDLoadingFinished ? "#ffffff" : "#888888", "");
				DrawButtonVis(1000-450/2, 820, 450, 64, TextGet("KDOptOut"), KDLoadingFinished ? "#ffffff" : "#888888", "");

				DrawTextKD(TextGet("KinkyDungeonConsent"), 1000, 450, "#ffffff", KDTextGray2);
				DrawTextKD(TextGet("KinkyDungeonConsent2"), 1000, 500, "#ffffff", KDTextGray2);
				DrawTextKD(TextGet("KinkyDungeonConsent3"), 1000, 550, "#ffffff", KDTextGray2);
				*/

		}
		if (KDLoadingDone >= KDLoadingMax) {

			/*for (let c of PIXI.Cache._cache.keys()) {
				KDTex(c);
			}*/
			if (!KDLoadingFinishedSet) {
				KDLoadingFinishedSet = true;
				setTimeout(() => {
					if (KDLoadingDone >= KDLoadingMax)
						KDLoadingFinished = true;
					else KDLoadingFinishedSet = false;
				}, 1000);
			}
		}

	} else if (KinkyDungeonState == "Intro") {
		if (KDIntroStage < 0) KDIntroStage = 0;// Placeholder
		let currentProgress = KDIntroStage < KDIntroProgress.length ? KDIntroProgress[KDIntroStage] : 1.5;
		if (currentProgress < 3) {
			if (KDIntroStage < KDIntroProgress.length)
				KDIntroProgress[KDIntroStage] += KDDrawDelta*0.001;
		}
		else KDIntroStage += 1;

		for (let i = 0; i < KDIntroProgress.length; i++) {
			let progress = KDIntroProgress[i];
			if (progress > 0) {
				let textSplit = TextGet("KDIntroScene" + (i + 1)).split('|');
				let ii = 0;
				for (let s of textSplit) {
					DrawTextKD(s, 1000, 150 + 200 * i + 33*ii, "#ffffff", KDTextGray2, 24, undefined, undefined, Math.max(0.01, Math.min(progress - ii * 0.33, 0.999)));
					ii += 1;
				}
			}
		}



	} else if (KinkyDungeonState == "TileEditor") {
		KDDrawTileEditor();
	} else if (KinkyDungeonState == "Load") {
		DrawButtonVis(875, 750, 350, 64, TextGet("KinkyDungeonLoadConfirm"), "#ffffff", "");

		DrawButtonKDEx(
			"KinkyDungeonLoadBack", () => {
				KinkyDungeonState = "Menu";
				KDRestoreOutfit();
				ElementRemove("saveInputField");
				return true;
			}, true, 1275, 750, 350, 64,
			TextGet("KinkyDungeonLoadBack"),
			"#ffffff", "", undefined, undefined, undefined, undefined,
			undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
				hotkeyPress: KinkyDungeonKeySkip[0],
			}
		);

		let newValue = ElementValue("saveInputField");
		if (newValue != KDOldSaveCodeValue) {

			KDOldSaveCodeValue = newValue;
			let itt = localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);
			let orig = itt ?
				JSON.parse(LZString.decompressFromBase64(itt)).appearance
				|| itt : "";
			if (orig != ElementValue("saveInputField")) KDOriginalValue = orig;
			let decompressed = DecompressB64(ElementValue("saveInputField"));
			if (decompressed) {
				let origAppearance = KinkyDungeonPlayer.Appearance;
				try {
					let decodeSave = JSON.parse(decompressed);
					if (decodeSave?.saveStat?.appearance) {
						if (decodeSave.saveStat.poses) {
							KDCurrentModels.get(KinkyDungeonPlayer).Poses = decodeSave.saveStat.poses;
						}
						let appearanceFromSave = JSON.stringify(decodeSave.saveStat.appearance);
						CharacterAppearanceRestore(KinkyDungeonPlayer, appearanceFromSave, false, false);
						KinkyDungeonPlayer.Palette = decodeSave.saveStat.Palette;
						CharacterRefresh(KinkyDungeonPlayer);
						UpdateModels(KinkyDungeonPlayer);
						//KDInitProtectedGroups(KinkyDungeonPlayer);
						//KinkyDungeonDressPlayer(KinkyDungeonPlayer, false);

						if (KinkyDungeonPlayer.Appearance.length == 0)
							throw new DOMException();
					}

				} catch (e) {
					console.log("Invalid outfit loaded from save");
					KinkyDungeonPlayer.Appearance = origAppearance;
				}
			}
		}

		DrawButtonKDEx(
			"loadFromFile", () => {
				getFileInput(KDLoadSave);
				return true;
			}, true, 875, 650, 750, 64, TextGet("KinkyDungeonLoadFromFile") + ": " + KDSaveName, "#ffffff", ""
		);

		ElementPosition("saveInputField", 1250, 450, 1000, 230);
	} else if (KinkyDungeonState == "LoadOutfit") {
		DrawButtonVis(1275, 750, 350, 64, TextGet("KDWardrobeBackTo" + (StandalonePatched ? "Wardrobe" : "Menu")), "#ffffff", "");

		let Char = KDSpeakerNPC || KinkyDungeonPlayer;
		if (Char == KinkyDungeonPlayer)
			DrawButtonVis(875, 750, 350, 64, TextGet("LoadOutfit"), "#ffffff", "");
		if (StandalonePatched) {

			DrawButtonKDEx(
				"loadFromFile", () => {
					getFileInput(KDLoadOutfit);
					return true;
				}, true, 875, 650, 750, 64, TextGet("KinkyDungeonLoadFromFile") + ": " + KDSaveName, "#ffffff", ""
			);

			DrawButtonKDEx("loadclothes", (_b) => {
				KDSaveCodeOutfit(Char, true);
				KinkyDungeonState = "Wardrobe";
				KDCanRevertFlag = false;
				//KDWardrobeCallback = null;
				//KDWardrobeRevertCallback = null;

				ElementRemove("saveInputField");
				return true;}, true, 875, 820, 350, 64, TextGet("LoadOutfitClothes"), "#ffffff", "");



		}

		let newValue = ElementValue("saveInputField");
		if (newValue != KDOldValue) {

			let itt = localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);
			let orig = itt ?
				JSON.parse(LZString.decompressFromBase64(itt)).appearance
				|| itt : "";
			if (orig != ElementValue("saveInputField")) KDOriginalValue = orig;
			let decompressed = DecompressB64(ElementValue("saveInputField"));
			if (decompressed) {
				let origAppearance = Char.Appearance;
				try {
					console.log("Trying BC code...");
					CharacterAppearanceRestore(Char, decompressed, true, false);
					CharacterRefresh(Char);
					KDOldValue = newValue;
					KDInitProtectedGroups(Char);
					KinkyDungeonDressPlayer(Char, true);

					if (Char.Appearance.length == 0)
						throw new DOMException();
				} catch (e) {
					console.log("Trying BCX code...");
					// If we fail, it might be a BCX code. try it!
					Char.Appearance = origAppearance;
					try {
						let parsed = JSON.parse(decompressed);
						if (parsed.length > 0) {
							if (!StandalonePatched) {
								for (let g of parsed) {
									InventoryWear(Char, g.Name, g.Group, g.Color);
								}
								CharacterRefresh(Char);
								ElementValue("saveInputField", LZString.compressToBase64(
									AppearanceItemStringify(Char.Appearance)));
							}
							KDOldValue = newValue;
							KDInitProtectedGroups(Char);
						} else {
							console.log("Invalid code. Maybe its corrupt?");
						}
					} catch (error) {
						console.log("Invalid code.");
					}
				}
			}
		}

		ElementPosition("saveInputField", 1250, 350, 1000, 230);


		KDTextField("savename", 1275, 550, 350, 64, undefined, KDOutfitInfo[KDCurrentOutfit] || "", "100");

		if (ElementValue("saveInputField"))
			DrawButtonKDEx(
				"saveToFile", () => {
					downloadFile(
						(ElementValue("savename") || KDOutfitInfo[KDCurrentOutfit] || "Outfit") + KDOUTFITEXTENSION,
						ElementValue("saveInputField"));
					return true;
				}, true, 875, 550, 350, 64, TextGet("KinkyDungeonSaveToFile"), "#ffffff", ""
			);

	} else if (KinkyDungeonState == "Challenge") {
		//DrawTextKD(TextGet("KinkyDungeonChallenge"), 1250, 80, "#ffffff", KDTextGray1, 48);
		KDDrawGameSetupTabs();

		let II = 0;
		let spacing = 75;

		DrawTextFitKD(TextGet("KDHardMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		DrawButtonKDEx("KinkyDungeonHardMode0", (_bdata) => {
			KinkyDungeonExtremeMode = false;
			KinkyDungeonHardMode = false;
			localStorage.setItem("KinkyDungeonHardMode", KinkyDungeonHardMode ? "True" : "False");
			localStorage.setItem("KinkyDungeonExtremeMode", KinkyDungeonExtremeMode ? "True" : "False");
			return true;
		}, true, 875, 190 + II*spacing, 360, 50, TextGet("KinkyDungeonHardMode0"), !KinkyDungeonHardMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonHardMode")) {
			DrawTextFitKD(TextGet("KinkyDungeonHardModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonHardMode1", (_bdata) => {
			if (KinkyDungeonHardMode) {
				KinkyDungeonExtremeMode = true;
			}
			KinkyDungeonHardMode = true;
			localStorage.setItem("KinkyDungeonHardMode", KinkyDungeonHardMode ? "True" : "False");
			localStorage.setItem("KinkyDungeonExtremeMode", KinkyDungeonExtremeMode ? "True" : "False");
			return true;
		}, true, 1265, 190 + II*spacing, 360, 50, TextGet(KinkyDungeonExtremeMode ? "KinkyDungeonExtremeMode" : "KinkyDungeonHardMode1"), KinkyDungeonHardMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonHardMode1")) {
			DrawTextFitKD(TextGet(KinkyDungeonExtremeMode ? "KinkyDungeonExtremeModeDesc" : "KinkyDungeonHardModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}
		II++;


		DrawTextFitKD(TextGet("KDEasyMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonEasyMode0", (_bdata) => {
			KinkyDungeonEasyMode = 0;
			localStorage.setItem("KinkyDungeonEasyMode", KinkyDungeonEasyMode + "");
			return true;
		}, true, 875, 190 + II*spacing, 225, 50, TextGet("KinkyDungeonEasyMode0"), KinkyDungeonEasyMode == 0 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonEasyMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonEasyModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonEasyMode1", (_bdata) => {
			KinkyDungeonEasyMode = 1;
			localStorage.setItem("KinkyDungeonEasyMode", KinkyDungeonEasyMode + "");
			return true;
		}, true, 1137, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonEasyMode1"), KinkyDungeonEasyMode == 1 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonEasyMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonEasyModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonEasyMode2", (_bdata) => {
			KinkyDungeonEasyMode = 2;
			localStorage.setItem("KinkyDungeonEasyMode", KinkyDungeonEasyMode + "");
			return true;
		}, true, 1400, 190 + II*spacing, 225, 50, TextGet("KinkyDungeonEasyMode2"), KinkyDungeonEasyMode == 2 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonEasyMode2")) {
			DrawTextFitKD(TextGet("KinkyDungeonEasyModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}
		II++;



		DrawTextFitKD(TextGet("KDSaveMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonSaveMode0", (_bdata) => {
			KinkyDungeonSaveMode = false;
			localStorage.setItem("KinkyDungeonSaveMode", KinkyDungeonSaveMode ? "True" : "False");
			return true;
		}, true, 875, 190 + II*spacing, 360, 50, TextGet("KinkyDungeonSaveMode0"), !KinkyDungeonSaveMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonSaveMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonSaveModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonSaveMode1", (_bdata) => {
			KinkyDungeonSaveMode = true;
			localStorage.setItem("KinkyDungeonSaveMode", KinkyDungeonSaveMode ? "True" : "False");
			return true;
		}, true, 1265, 190 + II*spacing, 360, 50, TextGet("KinkyDungeonSaveMode1"), KinkyDungeonSaveMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonSaveMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonSaveModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		II++;

		DrawTextFitKD(TextGet("KDPerksMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		DrawButtonKDEx("KinkyDungeonPerksMode0", (_bdata) => {
			KinkyDungeonPerksMode = 0;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 875, 190 + II*spacing, 175, 50, TextGet("KinkyDungeonPerksMode0"), KinkyDungeonPerksMode == 0 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerksMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonPerksMode1", (_bdata) => {
			KinkyDungeonPerksMode = 1;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 1070, 190 + II*spacing, 170, 50, TextGet("KinkyDungeonPerksMode1"), KinkyDungeonPerksMode == 1 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerksMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonPerksMode2", (_bdata) => {
			KinkyDungeonPerksMode = 2;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 1265, 190 + II*spacing, 170, 50, TextGet("KinkyDungeonPerksMode2"), KinkyDungeonPerksMode == 2 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerksMode2")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonKDEx("KinkyDungeonPerksMode3", (_bdata) => {
			KinkyDungeonPerksMode = 3;
			localStorage.setItem("KinkyDungeonPerksMode", KinkyDungeonPerksMode + "");
			return true;
		}, true, 1455, 190 + II*spacing, 170, 50, TextGet("KinkyDungeonPerksMode3"), KinkyDungeonPerksMode == 3 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerksMode3")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerksModeDesc3"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}



		II++;

		DrawTextFitKD(TextGet("KDPerkProgressionMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		DrawButtonKDEx("KinkyDungeonPerkProgressionMode0", (_bdata) => {
			KinkyDungeonPerkProgressionMode = 0;
			localStorage.setItem("KinkyDungeonPerkProgressionMode", KinkyDungeonPerkProgressionMode + "");
			return true;
		}, true, 875, 190 + II*spacing, 175, 50, TextGet("KinkyDungeonPerkProgressionMode0"), KinkyDungeonPerkProgressionMode == 0 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerkProgressionMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerkProgressionModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonPerkProgressionMode1", (_bdata) => {
			KinkyDungeonPerkProgressionMode = 1;
			localStorage.setItem("KinkyDungeonPerkProgressionMode", KinkyDungeonPerkProgressionMode + "");
			return true;
		}, true, 1070, 190 + II*spacing, 170, 50, TextGet("KinkyDungeonPerkProgressionMode1"), KinkyDungeonPerkProgressionMode == 1 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerkProgressionMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerkProgressionModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonPerkProgressionMode2", (_bdata) => {
			KinkyDungeonPerkProgressionMode = 2;
			localStorage.setItem("KinkyDungeonPerkProgressionMode", KinkyDungeonPerkProgressionMode + "");
			return true;
		}, true, 1265, 190 + II*spacing, 170, 50, TextGet("KinkyDungeonPerkProgressionMode2"), KinkyDungeonPerkProgressionMode == 2 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerkProgressionMode2")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerkProgressionModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}
		DrawButtonKDEx("KinkyDungeonPerkProgressionMode3", (_bdata) => {
			KinkyDungeonPerkProgressionMode = 3;
			localStorage.setItem("KinkyDungeonPerkProgressionMode", KinkyDungeonPerkProgressionMode + "");
			return true;
		}, true, 1455, 190 + II*spacing, 170, 50, TextGet("KinkyDungeonPerkProgressionMode3"), KinkyDungeonPerkProgressionMode == 3 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonPerkProgressionMode3")) {
			DrawTextFitKD(TextGet("KinkyDungeonPerkProgressionModeDesc3"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}


		II++;

		if (KinkyDungeonPerkProgressionMode > 0) {
			DrawTextFitKD(TextGet("KDPerkBondageMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

			DrawButtonKDEx("KinkyDungeonPerkBondageMode0", (_bdata) => {
				KinkyDungeonPerkBondageMode = 0;
				localStorage.setItem("KinkyDungeonPerkBondageMode", KinkyDungeonPerkBondageMode + "");
				return true;
			}, true, 875, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonPerkBondageMode0"), KinkyDungeonPerkBondageMode == 0 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
			if (MouseInKD("KinkyDungeonPerkBondageMode0")) {
				DrawTextFitKD(TextGet("KinkyDungeonPerkBondageModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}

			DrawButtonKDEx("KinkyDungeonPerkBondageMode1", (_bdata) => {
				KinkyDungeonPerkBondageMode = 1;
				localStorage.setItem("KinkyDungeonPerkBondageMode", KinkyDungeonPerkBondageMode + "");
				return true;
			}, true, 1137, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonPerkBondageMode1"), KinkyDungeonPerkBondageMode == 1 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
			if (MouseInKD("KinkyDungeonPerkBondageMode1")) {
				DrawTextFitKD(TextGet("KinkyDungeonPerkBondageModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}

			DrawButtonKDEx("KinkyDungeonPerkBondageMode2", (_bdata) => {
				KinkyDungeonPerkBondageMode = 2;
				localStorage.setItem("KinkyDungeonPerkBondageMode", KinkyDungeonPerkBondageMode + "");
				return true;
			}, true, 1400, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonPerkBondageMode2"), KinkyDungeonPerkBondageMode == 2 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
			if (MouseInKD("KinkyDungeonPerkBondageMode2")) {
				DrawTextFitKD(TextGet("KinkyDungeonPerkBondageModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}
		}


		II++;

		if (KinkyDungeonPerkBondageMode > 0 && KinkyDungeonPerkProgressionMode > 0) {
			DrawTextFitKD(TextGet("KDPerkBondageVisMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

			DrawButtonKDEx("KinkyDungeonPerkBondageVisMode0", (_bdata) => {
				KinkyDungeonPerkBondageVisMode = 0;
				localStorage.setItem("KinkyDungeonPerkBondageVisMode", KinkyDungeonPerkBondageVisMode + "");
				return true;
			}, true, 1400, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonPerkBondageVisMode0"), KinkyDungeonPerkBondageVisMode == 0 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
			if (MouseInKD("KinkyDungeonPerkBondageVisMode0")) {
				DrawTextFitKD(TextGet("KinkyDungeonPerkBondageVisModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}

			DrawButtonKDEx("KinkyDungeonPerkBondageVisMode1", (_bdata) => {
				KinkyDungeonPerkBondageVisMode = 1;
				localStorage.setItem("KinkyDungeonPerkBondageVisMode", KinkyDungeonPerkBondageVisMode + "");
				return true;
			}, true, 1137, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonPerkBondageVisMode1"), KinkyDungeonPerkBondageVisMode == 1 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
			if (MouseInKD("KinkyDungeonPerkBondageVisMode1")) {
				DrawTextFitKD(TextGet("KinkyDungeonPerkBondageVisModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}

			DrawButtonKDEx("KinkyDungeonPerkBondageVisMode2", (_bdata) => {
				KinkyDungeonPerkBondageVisMode = 2;
				localStorage.setItem("KinkyDungeonPerkBondageVisMode", KinkyDungeonPerkBondageVisMode + "");
				return true;
			}, true, 875, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonPerkBondageVisMode2"), KinkyDungeonPerkBondageVisMode == 2 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
			if (MouseInKD("KinkyDungeonPerkBondageVisMode2")) {
				DrawTextFitKD(TextGet("KinkyDungeonPerkBondageVisModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}
		}

		II++;


		DrawTextFitKD(TextGet("KDItemMode"), 875 - 50, 190 + II*spacing + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		DrawButtonKDEx("KinkyDungeonItemMode0", (_bdata) => {
			KinkyDungeonItemMode = 0;
			localStorage.setItem("KinkyDungeonItemMode", KinkyDungeonItemMode + "");
			return true;
		}, true, 875, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonItemMode0"), KinkyDungeonItemMode == 0 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonItemMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonItemModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonItemMode1", (_bdata) => {
			KinkyDungeonItemMode = 1;
			localStorage.setItem("KinkyDungeonItemMode", KinkyDungeonItemMode + "");
			return true;
		}, true, 1400, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonItemMode1"), KinkyDungeonItemMode == 1 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonItemMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonItemModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonItemMode2", (_bdata) => {
			KinkyDungeonItemMode = 2;
			localStorage.setItem("KinkyDungeonItemMode", KinkyDungeonItemMode + "");
			return true;
		}, true, 1137, 190 + II*spacing, 226, 50, TextGet("KinkyDungeonItemMode2"), KinkyDungeonItemMode == 2 ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonItemMode2")) {
			DrawTextFitKD(TextGet("KinkyDungeonItemModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}





	} else if (KinkyDungeonState == "Diff") {
		KDDrawGameSetupTabs();
		//DrawTextKD(TextGet("KinkyDungeonDifficulty"), 1250, 80, "#ffffff", KDTextGray1, 48);
		//DrawButtonVis(875, 350, 750, 64, TextGet("KinkyDungeonDifficulty0"), "#ffffff", "");
		//DrawButtonVis(875, 450, 750, 64, TextGet("KinkyDungeonDifficulty3"), "#ffffff", "");
		//DrawButtonVis(875, 550, 750, 64, TextGet("KinkyDungeonDifficulty1"), "#ffffff", "");
		DrawButtonKDEx("startQuick", () => {
			KinkyDungeonStatsChoice = new Map();
			KDUpdatePlugSettings(true);
			KDLose = false;
			KinkyDungeonStartNewGame();
			if (!KDToggles.SkipTutorial) {
				KDStartDialog("Tutorial");
			}
			return true;
		}, true, 875, 650, 750, 64, TextGet("KinkyDungeonStartGameQuick"), "#ffffff", "");
		DrawButtonKDEx("startGameKinky", () => {
			KinkyDungeonStatsChoice = new Map();
			for (let kink of KDKinkyPerks) {
				KinkyDungeonStatsChoice.set(kink, true);
			}
			KDUpdatePlugSettings(true);
			KDLose = false;
			KinkyDungeonStartNewGame();
			if (!KDToggles.SkipTutorial) {
				KDStartDialog("Tutorial");
			}
			return true;
		}, true, 875, 720, 750, 64, TextGet("KinkyDungeonStartGameKinky"), "#ffffff", "");
		DrawButtonKDEx("startGame", () => {
			KinkyDungeonState = "Stats";
			KDUpdatePlugSettings(true);
			return true;
		}, true, 875, 790, 750, 64, TextGet("KinkyDungeonStartGameAdv"), "#ffffff", "");



		if (MouseIn(875, 650, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDesc"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		} else if (MouseIn(875, 720, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDescKinky"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		} else if (MouseIn(875, 790, 750, 64)) {
			DrawTextFitKD(TextGet("KinkyDungeonStartGameDescAdc"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}


		let buttonswidth = 168;
		let buttonsheight = 50;
		let buttonspad = 25;
		let buttonsypad = 10;
		let buttonsstart = 875;
		let X = 0;
		let Y = 0;

		DrawTextFitKD(TextGet("KDClasses"), 875 - 50, 190 + 22, 300, "#ffffff", KDTextGray1, undefined, "right");

		let classCount = Object.keys(KDClassStart).length;
		for (let i = 0; i < classCount; i++) {
			X = i % 4;
			Y = Math.floor(i / 4);

			DrawButtonKDEx("Class" + i, (_bdata) => {
				KinkyDungeonClassMode = Object.keys(KDClassStart)[i];
				localStorage.setItem("KinkyDungeonClassMode", "" + KinkyDungeonClassMode);
				return true;
			}, (!KDClassReqs[Object.keys(KDClassStart)[i]]) || KDClassReqs[Object.keys(KDClassStart)[i]](),
			buttonsstart + (buttonspad + buttonswidth) * X, 190 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight, TextGet("KinkyDungeonClassMode" + i),
				((!KDClassReqs[Object.keys(KDClassStart)[i]]) || KDClassReqs[Object.keys(KDClassStart)[i]]()) ?
				(KinkyDungeonClassMode == Object.keys(KDClassStart)[i] ? "#ffffff" : "#888888")
				: "#ff5555", "", undefined, undefined, true, KDButtonColor);
			if (MouseIn(buttonsstart + (buttonspad + buttonswidth) * X, 190 + Y*(buttonsheight + buttonsypad), buttonswidth, buttonsheight)) {
				DrawTextFitKD(TextGet("KinkyDungeonClassModeDesc" + i), 1250, 120, 1000, "#ffffff", KDTextGray0);
			}
		}



		DrawTextFitKD(TextGet("KDSexyMode"), 875 - 50, 420 + 22, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonSexyMode0", (_bdata) => {
			KinkyDungeonSexyMode = false;
			KDUpdatePlugSettings(true);
			localStorage.setItem("KinkyDungeonSexyMode", KinkyDungeonSexyMode ? "True" : "False");
			return true;
		}, true, 875, 420, 275, 50, TextGet("KinkyDungeonSexyMode0"), !KinkyDungeonSexyMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonSexyMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonSexyModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonSexyMode1", (_bdata) => {
			KinkyDungeonSexyMode = true;
			KDUpdatePlugSettings(true);
			localStorage.setItem("KinkyDungeonSexyMode", KinkyDungeonSexyMode ? "True" : "False");
			return true;
		}, true, 1175, 420, 275, 50, TextGet("KinkyDungeonSexyMode1"), KinkyDungeonSexyMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonSexyMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonSexyModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawTextFitKD(TextGet("KDRandomMode"), 875 - 50, 500 + 22, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonRandomMode0", (_bdata) => {
			KinkyDungeonRandomMode = false;
			localStorage.setItem("KinkyDungeonRandomMode", KinkyDungeonRandomMode ? "True" : "False");
			return true;
		}, true, 875, 500, 275, 50, TextGet("KinkyDungeonRandomMode0"), !KinkyDungeonRandomMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonRandomMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonRandomModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonRandomMode1", (_bdata) => {
			KinkyDungeonRandomMode = true;
			localStorage.setItem("KinkyDungeonRandomMode", KinkyDungeonRandomMode ? "True" : "False");
			return true;
		}, true, 1175, 500, 275, 50, TextGet("KinkyDungeonRandomMode1"), KinkyDungeonRandomMode ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonRandomMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonRandomModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}


		if (KinkyDungeonSexyMode) {

			DrawCheckboxKDEx("KinkyDungeonSexyPlugsFront", (_bdata) => {
				KinkyDungeonSexyPlugFront = !KinkyDungeonSexyPlugFront;
				localStorage.setItem("KinkyDungeonSexyPlugFront", KinkyDungeonSexyPlugFront ? "True" : "False");
				return true;
			}, true, 1500, 420, 64, 64, TextGet("KinkyDungeonSexyPlugsFront"), !KinkyDungeonSexyPlugFront, false, "#ffffff");
			DrawCheckboxKDEx("KinkyDungeonSexyPlugs", (_bdata) => {
				KinkyDungeonSexyPlug = !KinkyDungeonSexyPlug;
				localStorage.setItem("KinkyDungeonSexyPlug", KinkyDungeonSexyPlug ? "True" : "False");
				return true;
			}, true, 1500, 490, 64, 64, TextGet("KinkyDungeonSexyPlugs"), KinkyDungeonSexyPlug, false, "#ffffff");

			/*DrawCheckboxKDEx("KinkyDungeonSexyPiercings", (bdata) => {
				KinkyDungeonSexyPiercing = !KinkyDungeonSexyPiercing;
				localStorage.setItem("KinkyDungeonSexyPiercing", KinkyDungeonSexyPiercing ? "True" : "False");
				return true;
			}, true, 1500, 430, 64, 64, TextGet("KinkyDungeonSexyPiercings"), KinkyDungeonSexyPiercing, false, "#ffffff");*/
		}
		// Sorry Aelie-- removed this b/c now its all handled in the logic for the roguelike map selector
		/*
		DrawTextFitKD(TextGet("KDProgressionMode"), 875 - 50, 580 + 22, 300, "#ffffff", KDTextGray1, undefined, "right");


		DrawButtonKDEx("KinkyDungeonProgressionMode0", (bdata) => {
			KinkyDungeonProgressionMode = "Key";
			localStorage.setItem("KinkyDungeonProgressionMode", "Key");
			return true;
		}, true, 875, 580, 175, 50, TextGet("KinkyDungeonProgressionMode0"), KinkyDungeonProgressionMode == "Key" ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonProgressionMode0")) {
			DrawTextFitKD(TextGet("KinkyDungeonProgressionModeDesc0"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonProgressionMode1", (bdata) => {
			KinkyDungeonProgressionMode = "Random";
			localStorage.setItem("KinkyDungeonProgressionMode", "Random");
			return true;
		}, true, 1075, 580, 175, 50, TextGet("KinkyDungeonProgressionMode1"), KinkyDungeonProgressionMode == "Random" ? "#ffffff" : "#888888", "", undefined, undefined, true, KDButtonColor);
		if (MouseInKD("KinkyDungeonProgressionMode1")) {
			DrawTextFitKD(TextGet("KinkyDungeonProgressionModeDesc1"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

		DrawButtonKDEx("KinkyDungeonProgressionMode2", (bdata) => {
			KinkyDungeonProgressionMode = "Select";
			localStorage.setItem("KinkyDungeonProgressionMode", "Select");
			return true;
		}, KinkyDungeonPerkProgressionMode != 0, 1275, 580, 175, 50, TextGet("KinkyDungeonProgressionMode2"), KinkyDungeonPerkProgressionMode == 0 ? "#ff5555" : (KinkyDungeonProgressionMode == "Select" ? "#ffffff" : "#888888"), "", undefined, undefined, true, KDButtonColor);
		if (MouseIn(1275, 580, 175, 50)) {
			DrawTextFitKD(TextGet("KinkyDungeonProgressionModeDesc2"), 1250, 120, 1000, "#ffffff", KDTextGray0);
		}

	*/


	} if (KinkyDungeonState == "Name") {

		DrawTextFitKD(TextGet("KDName"), 975 + 550/2, 300, 550, "#ffffff", KDTextGray1, 32, "center");

		let NF = KDTextField("PlayerNameField",
			975, 450, 550, 64
		);
		if (NF.Created) {
			ElementValue("PlayerNameField",
				localStorage.getItem("PlayerName") || "Ada"
			);
		}


		DrawButtonKDEx("randomName", () => {


			let name = "Ada";

			let nameList = KDDefaultNames[Math.floor(Math.random() * KDDefaultNames.length)];
			if (nameList && KDNameList[nameList]) {
				name = KDNameList[nameList][Math.floor(Math.random() * KDDefaultNames.length)];
			}
			ElementValue("PlayerNameField", name);
			return true;
		}, true, 1550, 450, 200, 64, TextGet("KDRandom"), "#ffffff", "");

		// Left to decrement
		DrawButtonKDEx(`SaveButtonL`, (_bdata) => {
			if (KDSaveSlot > 1) {
				KDSaveSlot--;
			}
			KDConfirmDeleteSave = false;
			return true;
		}, true, 1350, 550, 64, 64, '<', "#ffffff");
		// Label for the button
		DrawTextFitKD(TextGet("KDChooseSlot"), 1150, 585, 360, "#ffffff", undefined, 30);
		DrawTextFitKD(`${KDSaveSlot}`, 1430, 585, 360, "#ffffff", undefined, 30);
		// Right to increment
		DrawButtonKDEx(`SaveButton4`, (_bdata) => {
			if (KDSaveSlot < maxSaveSlots) {
				KDSaveSlot++;
			}
			KDConfirmDeleteSave = false;
			return true;
		}, true, 1450, 550, 64, 64, '>', "#ffffff");

		// If the save slot is occupied, warn the player!
		let danger = false;
		if (loadedsaveslots[KDSaveSlot-1]) {
			danger = true;
			DrawTextFitKD(TextGet("KDWillOverride").replace("NME",
				loadedsaveNames[KDSaveSlot-1] ? loadedsaveNames[KDSaveSlot-1] : ""
			), 1550, 585, 440, "#ff5555", undefined, 36, "left");
		} else {
			KDConfirmDeleteSave = false;
		}

		DrawButtonKDEx("selectName", () => {

			if (danger && !KDConfirmDeleteSave) {
				KDConfirmDeleteSave = true;
			} else {
				KDConfirmDeleteSave = false;
				localStorage.setItem("PlayerName", ElementValue("PlayerNameField") || "Ada");
				localStorage.setItem("KDLastSaveSlot", KDSaveSlot.toString());
				KDGameData.PlayerName = ElementValue("PlayerNameField") || "Ada";
				KinkyDungeonPlayer.Name = KDGameData.PlayerName;
				KinkyDungeonState = "Diff";

				KDExecuteMods();
				KinkyDungeonLoadStats();
			}

			return true;
		}, true, (KDConfirmDeleteSave ? (Math.random() > 0.5 ? -1 : 1) : 0) + 875, KDConfirmDeleteSave ?
			(Math.random() > 0.5 ? -1 : 1) + 750 : 650, 750, 64, TextGet(KDConfirmDeleteSave ?
			"KDConfirmREALLY" : "KDConfirm"), KDConfirmDeleteSave ? "#ff5555" : "#ffffff", "");

		DrawButtonKDEx("backButton", (_b) => {
			KinkyDungeonState = "Menu";
			return true;
		}, true, 1075, 900, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "",
		undefined, undefined, undefined, undefined,
		undefined, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
			hotkeyPress: KinkyDungeonKeySkip[0],
		});


	} else if (KinkyDungeonState == "Wardrobe") {
		KDDrawWardrobe("menu", KDSpeakerNPC);
	} else if (KinkyDungeonState == "Stats") {

		let tooltip = KinkyDungeonDrawPerks(false);
		DrawTextKD(TextGet("KinkyDungeonStats"), 1000, 30, "#ffffff", KDTextGray2);
		//DrawTextKD(TextGet("KinkyDungeonStats2"), 1000, 80, "#ffffff", KDTextGray2);
		if (!tooltip) {
			let points = KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice);
			//let hardmode = points >= KDHardModeThresh ? TextGet("KDHardMode") : "";
			DrawTextKD(TextGet("KinkyDungeonStatPoints").replace("AMOUNT", "" + points), 1000, 150, "#ffffff", KDTextGray2);
		}

		let minPoints = 0;

		DrawButtonKDEx("KDPerksStart", (_bdata) => {
			if (KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) >= minPoints) {
				KDLose = false;
				KinkyDungeonStartNewGame();

				if (!KDToggles.SkipTutorial) {
					KDStartDialog("Tutorial");
				}
			}
			return true;
		}, true, 875, 920, 350, 64, TextGet("KinkyDungeonStartGame"), KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) >= minPoints ? "#ffffff" : "pink", "");

		DrawButtonKDEx("KDPerksBack", (_bdata) => {
			KinkyDungeonState = "Menu";
			return true;
		}, true, 1275, 920, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "", undefined, undefined, undefined, undefined,
		undefined, undefined, {
			hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
			hotkeyPress: KinkyDungeonKeySkip[0],
		});

		DrawButtonKDEx("KDPerksClear", (_bdata) => {
			KinkyDungeonStatsChoice = new Map();
			KDUpdatePlugSettings(true);
			return true;
		}, true, 40, 920, 190, 64, TextGet("KinkyDungeonClearAll"), "#ffffff", "");

		DrawButtonKDEx("KDPerkConfig1", (_bdata) => {
			KinkyDungeonPerksConfig = "1";
			KinkyDungeonLoadStats();
			return true;
		}, true, 270, 930, 100, 54, TextGet("KinkyDungeonConfig") + "1", KinkyDungeonPerksConfig == "1" ? "#ffffff" : "#888888", "");

		DrawButtonKDEx("KDPerkConfig2", (_bdata) => {
			KinkyDungeonPerksConfig = "2";
			KinkyDungeonLoadStats();
			return true;
		}, true, 380, 930, 100, 54, TextGet("KinkyDungeonConfig") + "2", KinkyDungeonPerksConfig == "2" ? "#ffffff" : "#888888", "");

		DrawButtonKDEx("KDPerkConfig3", (_bdata) => {
			KinkyDungeonPerksConfig = "3";
			KinkyDungeonLoadStats();
			return true;
		}, true, 490, 930, 100, 54, TextGet("KinkyDungeonConfig") + "3", KinkyDungeonPerksConfig == "3" ? "#ffffff" : "#888888", "");


		let TF = KDTextField("PerksFilter", 600, 930, 210, 54, "text", "", "45");
		if (TF.Created) {
			TF.Element.oninput = (_event: InputEvent) => {
				KDPerksFilter = ElementValue("PerksFilter");
				KDPerksIndex = 0;
			};
		}
		DrawTextFitKD(TextGet("KinkyDungeonFilter"), 600 + 210/2, 930 + 54/2, 210, "#aaaaaa");

		if (!KDClipboardDisabled)
			DrawButtonKDEx("copyperks", (_bdata) => {
				let txt = "";
				for (let k of KinkyDungeonStatsChoice.keys()) {
					if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "\n" : "") + k;
				}
				navigator.clipboard.writeText(txt);
				return true;
			}, true, 1850, 930, 140, 54, TextGet("KinkyDungeonCopyPerks"), "#ffffff", "");
		else {
			let CF = KDTextField("KDCopyPerks", 1700, 930, 280, 54, undefined, undefined, "10000");
			if (CF.Created) {
				CF.Element.oninput = (_event: InputEvent) => {
					let text = ElementValue("KDCopyPerks");
					try {
						let list = text.split('|');
						let changed = 1;
						let iter = 0;
						while (changed > 0 && iter < 1000) {
							changed = 0;
							for (let l of list) {
								let lp = l.replace('\r','');// List processed
								// Find the perk that matches the name
								for (let perk of Object.entries(KinkyDungeonStatsPresets)) {
									if (perk[0] == lp && KDValidatePerk(perk[1])) {
										KinkyDungeonStatsChoice.set(perk[0], true);
										changed += 1;
									}
								}
							}
							iter += 1;
						}
					} catch (err) {
						console.log("Invalid perks");
					}

				};
			}
		}

		if (!KDClipboardDisabled)
			DrawButtonKDEx("pasteperks", (_bdata) => {
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
									if (perk[0] == lp && KDValidatePerk(perk[1])) {
										KinkyDungeonStatsChoice.set(perk[0], true);
										changed += 1;
									}
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
		DrawTextKD(TextGet("KinkyDungeonSaveIntro1"), 1250, 475, "#ffffff", KDTextGray2);
		/*DrawTextKD(TextGet("KinkyDungeonSaveIntro"), 1250, 475, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro2"), 1250, 550, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro3"), 1250, 625, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("KinkyDungeonSaveIntro4"), 1250, 700, "#ffffff", KDTextGray2);*/

		ElementPosition("saveDataField", 1250, 150, 1000, 230);

		KDTextField("savename", 1275, 650, 350, 64, undefined, KDGameData.PlayerName, "100");

		if (ElementValue("saveDataField"))
			DrawButtonKDEx(
				"saveToFile", () => {
					downloadFile((ElementValue("savename") || KDGameData.PlayerName || "Save") + KDSAVEEXTENSION, ElementValue("saveDataField"));
					return true;
				}, true, 875, 650, 350, 64, TextGet("KinkyDungeonSaveToFile"), "#ffffff", ""
			);


		//DrawButtonVis(875, 750, 350, 64, TextGet("KinkyDungeonGameSave"), "#ffffff", "");
		DrawButtonVis(875, 750, 750, 64, TextGet("KinkyDungeonGameContinue"), "#ffffff", "");
	} else if (KinkyDungeonState == "Game") {
		KinkyDungeonGameRunning = true;
		KinkyDungeonGameFlag = true;
		KinkyDungeonDrawGame();
		if (KinkyDungeonInputQueue.length < 1) {
			let _CharacterRefresh = CharacterRefresh;
			let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
			CharacterRefresh = () => {KDRefresh = true;};
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
					KDGameData.KneelTurns = 1;
				}
			} else if (KDGameData.PlaySelfTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KDSendInput("tick", {delta: 1}, false, true);
					KDGameData.PlaySelfTurns -= 1;
					KDGameData.BalancePause = true;
					KinkyDungeonSleepTime = CommonTime() + (KinkyDungeonFlags.get("PlayerOrgasm") ? KinkyDungeonOrgasmTime : KinkyDungeonPlaySelfTime) * (0.25 + KDAnimSpeed * 0.75);
				}
				if (KDGameData.SleepTurns == 0) {
					KinkyDungeonChangeStamina(0);
				}
			} else if (KinkyDungeonStatFreeze > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KinkyDungeonStatFreeze -= 1;
					KDGameData.BalancePause = true;
					KDSendInput("tick", {delta: 1, NoUpdate: false, NoMsgTick: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + KinkyDungeonFreezeTime * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KDGameData.SlowMoveTurns > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					KDGameData.SlowMoveTurns -= 1;
					KDGameData.BalancePause = true;
					KDSendInput("tick", {delta: 1, NoUpdate: false, NoMsgTick: true}, false, true);
					KinkyDungeonSleepTime = CommonTime() + 150 * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonFastMove && KinkyDungeonFastMovePath && KinkyDungeonFastMovePath.length > 0) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					if (KinkyDungeonFastMovePath.length > 0) {
						let next = KinkyDungeonFastMovePath[0];
						//KinkyDungeonFastMovePath.splice(0, 1);
						if (Math.max(Math.abs(next.x-KinkyDungeonPlayerEntity.x), Math.abs(next.y-KinkyDungeonPlayerEntity.y)) < 1.5) {
							let MP = KDGameData.MovePoints;
							if (KDSendInput("move", {dir: {x:next.x-KinkyDungeonPlayerEntity.x, y:next.y-KinkyDungeonPlayerEntity.y}, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, false)
								== "move" || MP == KDGameData.MovePoints) {
								KinkyDungeonFastMovePath.splice(0, 1);
							}
						}
						else KinkyDungeonFastMovePath = [];
					}
					KinkyDungeonSleepTime = CommonTime() + 100 * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonFastStruggle && KinkyDungeonFastStruggleType && KinkyDungeonFastStruggleGroup) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					let result = KDSendInput("struggle", {group: KinkyDungeonFastStruggleGroup, type: KinkyDungeonFastStruggleType}, false, true);
					if (result != "Fail" || !KinkyDungeonHasStamina(2.5)) {
						KinkyDungeonFastStruggleType = "";
						KinkyDungeonFastStruggleGroup = "";
					}
					KinkyDungeonSleepTime = CommonTime() + (KinkyDungeonInDanger() ? 250 : 0) + 250 * (0.25 + KDAnimSpeed * 0.75);
				}
			} else if (KinkyDungeonAutoWait) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					let lastStamina = KinkyDungeonStatStamina;
					KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
					if (KinkyDungeonFastStruggle && KinkyDungeonStatStamina == KinkyDungeonStatStaminaMax && lastStamina < KinkyDungeonStatStamina) {
						if (KinkyDungeonTempWait && !KDGameData.KinkyDungeonLeashedPlayer && !KinkyDungeonInDanger())
							KDDisableAutoWait();
					}
					KinkyDungeonSleepTime = CommonTime() + (KinkyDungeonFastWait ? 100 : 300);
				}
			} else if (KinkyDungeonAutoWaitStruggle) {
				if (CommonTime() > KinkyDungeonSleepTime) {
					//KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);

					if (!(KDGameData.DelayedActions?.length > 0)) {
						KDHandleAutoStruggle(KinkyDungeonPlayerEntity);
					}
					if (KinkyDungeonInDanger())
						KDDisableAutoWait();
					KinkyDungeonSleepTime = CommonTime() + (300 + Math.min(1200, KDAutoStruggleData.lastDelay * 270)) * (0.5 + KDAnimSpeed * 0.5);
				}
			} else KinkyDungeonSleepTime = CommonTime() + 100;
			CharacterRefresh = _CharacterRefresh;
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		} else KinkyDungeonSleepTime = CommonTime() + 100;

	} else if (KinkyDungeonState == "End") {
		KinkyDungeonGameRunning = false;
		// Draw temp start screen
		DrawTextKD(TextGet("EndWin"), 1250, 400, "#ffffff", KDTextGray2);
		DrawTextKD(TextGet("EndWin2"), 1250, 500, "#ffffff", KDTextGray2);

		DrawButtonVis(1075, 650, 350, 64, TextGet("KinkyDungeonNewGamePlus"), "#ffffff", "");
		DrawButtonVis(1075, 750, 350, 64, TextGet("GameReturnToMenu"), "#ffffff", "");
	} else if (KinkyDungeonState == "Toggles") {
		KDDrawToggleTabs(500);

		if (KDToggleTab == "Keybindings") {
			// Draw temp start screen
			DrawButtonKDEx("KBBack", () => {
				KinkyDungeonKeybindings = Object.assign({}, KinkyDungeonKeybindingsTemp);
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
				KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindings);
				if (KinkyDungeonGameFlag) {
					KinkyDungeonState = "Game";
				} else KinkyDungeonState = "Menu";
				//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
				return true;
			}, true, 1450, 700, 350, 64, TextGet("GameReturnToMenu2"), "#ffffff", "");

			// Draw temp start screen
			DrawButtonKDEx("KDReset", () => {
				KinkyDungeonKeybindingsTemp = Object.assign({}, KDDefaultKB);
				return true;
			}, true, 1450, 500, 350, 64, TextGet("KDResetKeys"), "#ffffff", "");


			// Draw key buttons

			let maxY = 850;

			let sY = 80;

			let X = 500;
			let Y = sY;
			let dX = 300;
			let dY = 40;
			let pad = 1;
			let xpad = 15;

			for (let key of Object.keys(KDDefaultKB)) {
				DrawButtonKDEx("KB" + key, () => {KinkyDungeonKeybindingsTemp[key] = KinkyDungeonKeybindingCurrentKey; return true;}, KinkyDungeonKeybindingCurrentKey != '',
					X, Y, dX, dY, TextGet("KinkyDungeonKey" + key) + ": '" + (KinkyDungeonKeybindingsTemp[key]) + "'",
					KinkyDungeonKeybindingsTemp[key] == KinkyDungeonKeybindingCurrentKey ? "#ffffff" : "#aaaaaa", "", undefined, undefined, true, KDButtonColor);

				Y += dY + pad;
				if (Y > maxY) {
					Y = sY;
					X += dX + xpad;
				}
			}

			if (KinkyDungeonKeybindingCurrentKey)
				DrawTextKD(TextGet("KinkyDungeonCurrentPress") + ": '" + (KinkyDungeonKeybindingCurrentKey) + "'", 1250, 900, "#ffffff", KDTextGray2);

			DrawTextKD(TextGet("KinkyDungeonCurrentPressInfo"), 1250, 950, "#ffffff", KDTextGray2);
		} else {
			let XX = KDToggleTab == "Main" ? 940 : 540;
			let YYstart = 60;
			let YYmax = 800;
			let YY = YYstart;
			let YYd = 74;
			let XXd = 450;
			let toggles = Object.keys(KDToggles);
			//MainCanvas.textAlign = "left";
			for (let toggle of toggles.filter((tog) => {return KDToggleCategories[tog] == KDToggleTab || (!KDToggleCategories[tog] && KDToggleTab == "Main");})) {
				// Draw temp start screen
				DrawCheckboxKDEx("toggle" + toggle, () => {
					KDToggles[toggle] = !KDToggles[toggle];
					KDSaveToggles();
					return true;
				}, true, XX, YY, 64, 64, TextGet("KDToggle" + toggle), KDToggles[toggle], false, "#ffffff", undefined, {
					maxWidth: 350,
					fontSize: 24,
					scaleImage: true,
				});

				YY += YYd;
				if (YY > YYmax) {
					YY = YYstart;
					XX += XXd;
				}
			}
			//MainCanvas.textAlign = "center";

			YY = YYstart + 50;
			YYd = 80;
			let CombarXX = 550;

			if (KDToggleTab == "Main") {
				if (StandalonePatched) {
					DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDResolution" + (KDResolutionConfirm ? "Confirm" : "")) + " " + Math.round(KDResolution * 100) + "%", "#ffffff", "",
						() => KDResolutionList[(KDResolutionListIndex + KDResolutionList.length - 1) % KDResolutionList.length] * 100 + "%",
						() => KDResolutionList[(KDResolutionListIndex + 1) % KDResolutionList.length] * 100 + "%");
					YY += YYd;
					DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDGamma") + " " + (Math.round(KDGamma * 100) + "%"), "#ffffff", "",
						() => KDGammaList[(KDGammaListIndex + KDGammaList.length - 1) % KDGammaList.length] * 100 + "%",
						() => KDGammaList[(KDGammaListIndex + 1) % KDGammaList.length] * 100 + "%");
					YY += YYd * 2;
				}

				DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDVibeVolume") + " " + (KDVibeVolume * 100 + "%"), "#ffffff", "",
					() => KDVibeVolumeList[(KDVibeVolumeListIndex + KDVibeVolumeList.length - 1) % KDVibeVolumeList.length] * 100 + "%",
					() => KDVibeVolumeList[(KDVibeVolumeListIndex + 1) % KDVibeVolumeList.length] * 100 + "%");
				YY += YYd;
				DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDMusicVolume") + " " + (KDMusicVolume * 100 + "%"), "#ffffff", "",
					() => KDMusicVolumeList[(KDMusicVolumeListIndex + KDMusicVolumeList.length - 1) % KDMusicVolumeList.length] * 100 + "%",
					() => KDMusicVolumeList[(KDMusicVolumeListIndex + 1) % KDMusicVolumeList.length] * 100 + "%");
				YY += YYd;
				DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDSfxVolume") + " " + (KDSfxVolume * 100 + "%"), "#ffffff", "",
					() => KDSfxVolumeList[(KDSfxVolumeListIndex + KDSfxVolumeList.length - 1) % KDSfxVolumeList.length] * 100 + "%",
					() => KDSfxVolumeList[(KDSfxVolumeListIndex + 1) % KDSfxVolumeList.length] * 100 + "%");
				YY += YYd;
				DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDAnimSpeed") + " " + (KDAnimSpeed * 100 + "%"), "#ffffff", "",
					() => KDAnimSpeedList[(KDAnimSpeedListIndex + KDAnimSpeedList.length - 1) % KDAnimSpeedList.length] * 100 + "%",
					() => KDAnimSpeedList[(KDAnimSpeedListIndex + 1) % KDAnimSpeedList.length] * 100 + "%");
				YY += YYd;
				DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDSelectedFont") + " " + (KDSelectedFont), "#ffffff", "",
					() => KDSelectedFontList[(KDSelectedFontListIndex + KDSelectedFontList.length - 1) % KDSelectedFontList.length],
					() => KDSelectedFontList[(KDSelectedFontListIndex + 1) % KDSelectedFontList.length]);
				YY += YYd;
				DrawBackNextButtonVis(CombarXX, YY, 350, 64, TextGet("KDButtonFont") + " " + (KDButtonFont), "#ffffff", "",
					() => KDButtonFontList[(KDButtonFontListIndex + KDButtonFontList.length - 1) % KDButtonFontList.length],
					() => KDButtonFontList[(KDButtonFontListIndex + 1) % KDButtonFontList.length], undefined, undefined, undefined, {
						font: KDButtonFont
					});
				YY += YYd;






			} else if (KDToggleTab == "Clothes") {
				let scale = 72;
				let x = 1500;
				let y = 100;
				let w = KDPaletteWidth;
				DrawTextFitKD(TextGet("KDBackgroundColor"), x + scale*(0.5 + w)/2, y, scale*w, "#ffffff", KDTextGray0, 20);


				let CF = KDTextField("KDBGColor", x + scale*(0.5 + w)/2 - 100, y + 24, 200, 30, undefined, KDBGColor + "", "7");
				if (CF.Created) {
					CF.Element.oninput = (_event: InputEvent) => {
						let value = ElementValue("KDBGColor");
						try {
							if (/^#[0-9A-F]{6}$/i.test(value)) {
								KDBGColor = value;
								localStorage.setItem("KDBGColor", KDBGColor);
							} else {
								KDBGColor = "";
							}
						} catch (err) {
							console.log("Invalid color");
						}

					};
				}


				KDDrawPalettes(x, 250, w, scale, undefined, undefined);

				let options = [
					{name: "ApplyPaletteRestraint"},
					{name: "ApplyPaletteTransform"},
					{},
				];

				let ii = 0;
				let spacing = 70;
				for (let o of options) {
					if (o.name) {
						DrawCheckboxKDEx("toggle" + o.name, () => {
							// @ts-ignore
							if (o.cb) o.cb();
							else {
								KDToggles[o.name] = !KDToggles[o.name];
								KDSaveToggles();
							}
							return true;
						}, true, x, 600 + ii * spacing, 64, 64,
						TextGet("KDToggle" + o.name),
						KDToggles[o.name], false, "#ffffff", undefined, {
							maxWidth: 350,
							fontSize: 24,
							scaleImage: true,
						});
					}
					ii++;
				}
			}
			DrawButtonKDEx("KBBackOptions", () => {
				KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
				if (KinkyDungeonGameFlag) {
					KinkyDungeonState = "Game";
				} else KinkyDungeonState = "Menu";
				//ServerAccountUpdate.QueueData({ KinkyDungeonKeybindings: KinkyDungeonKeybindings });
				return true;
			}, true, 975, 880, 550, 64, TextGet("GameReturnToMenuFromOptions"), "#ffffff", "", undefined, undefined, undefined, undefined,
			undefined, undefined, {
				hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
				hotkeyPress: KinkyDungeonKeySkip[0],
			}
			);

		}
	} else if (KinkyDungeonState == "ModConfig") {
		KDDrawModConfigs();
	} else if (KinkyDungeonState == "LoadSlots") {
		KDDrawLoadMenu();
	}


	// Cull temp elements
	KDCullTempElements();

	//if (KDDebugMode) {
	//DrawTextKD(dispfps, 20, 20, "#ffffff", undefined, undefined, "left");
	//}
	// Cull the sprites that werent rendered or updated this frame
	KDCullSprites();




	KDDrawDelta = performance.now() - lastfps;
	fpscounter++;
	if (fpscounter > 10) {
		fpscounter = 0;
		dispfps = Math.round(1000 / Math.max(KDDrawDelta, 1));
	}

	lastfps = performance.now();
	KDUpdateParticles(KDDrawDelta);

	KDDrawMusic(KDDrawDelta);

	if (StandalonePatched) {
		/*if (KinkyDungeonState == "Game") {
			if (!kdTrackGameParticles) {
				kdcanvas.addChild(kdparticles);
				kdTrackGameParticles = true;
			}
		} else {
			if (kdTrackGameParticles) {
				kdcanvas.removeChild(kdparticles);
				kdTrackGameParticles = false;
			}
		}*/
	} else {
		// Draw the context layer even if we haven't updated it
		if (pixirenderer) {
			pixirenderer.render(kdcanvas, {
				clear: false,
				antialias: !CommonIsMobile,
				useContextAlpha: false,
			});
			pixirenderer.render(kdui, {
				clear: false,
				antialias: !CommonIsMobile,
				useContextAlpha: false,
			});
		}
	}


	if (!(KinkyDungeonState == "Toggles" && KDToggleTab == "Keybindings")) {
		if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
			for (let [k, v] of Object.entries(KDButtonsCache)) {
				if (v.hotkeyPress == KinkyDungeonKeybindingCurrentKey) {
					KDClickButton(k);
					return true;
				}
			}

			for (let keybinding of Object.values(KDKeyCheckers)) {
				if (keybinding()) return true;
			}


			if (KinkyDungeonKeybindingCurrentKey)
				KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
			KinkyDungeonKeybindingCurrentKey = '';
		}
	}

	//MainCanvas.textBaseline = "middle";

	KDLastButtonsCache = {};
	//MouseClicked = false;

	if ((!KDDebugMode && KinkyDungeonDrawState == "Restart") || (KDDebugMode && (KinkyDungeonDrawState != "Restart" || KinkyDungeonState != "Game"))) {
		ElementRemove("DebugEnemy");
		ElementRemove("DebugItem");
	}

	KDDoGraphicsSanitize();
}

let KDDrawDelta = 0;

let kdTrackGameBoard = false;
let kdTrackGameFog = false;
let kdTrackGameParticles = false;

let KDlastCull = new Map();

function KDCullSprites(): void {
	if (!KDlastCull.get(kdpixisprites)) KDlastCull.set(kdpixisprites, 0);
	let cull = CommonTime() > (KDlastCull.get(kdpixisprites) || 0) + KDCULLTIME;
	for (let sprite of kdpixisprites.entries()) {
		if (!kdSpritesDrawn.has(sprite[0])) {
			if (cull) {
				if (sprite[1].parent) {
					sprite[1].parent.removeChild(sprite[1]);
				}
				if (kdprimitiveparams.has(sprite[0])) kdprimitiveparams.delete(sprite[0]);
				kdpixisprites.delete(sprite[0]);
				if (sprite[1].destroy)
					sprite[1].destroy();
			} else sprite[1].visible = false;
		}
	}
}
function KDCullSpritesList(list: Map<string, any>): void {
	if (!KDlastCull.get(list)) KDlastCull.set(list, 0);
	let cull = CommonTime() > (KDlastCull.get(list) || 0) + KDCULLTIME;
	for (let sprite of list.entries()) {
		if (!kdSpritesDrawn.has(sprite[0])) {
			if (cull) {
				sprite[1].parent.removeChild(sprite[1]);
				if (kdprimitiveparams.has(sprite[0])) kdprimitiveparams.delete(sprite[0]);
				list.delete(sprite[0]);
				sprite[1].destroy();
			} else sprite[1].visible = false;
		}
	}
}

let KDButtonsCache: Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata: any) => boolean, priority: number, scrollfunc?: (amount: number) => void, hotkeyPress?: string}> = {
};

let KDLastButtonsCache: Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata?: any) => boolean, priority: number}> = {
};

/**
 * Draws a button component
 * @param name - Name of the button element
 * @param enabled - Whether or not you can click on it
 * @param Left - Position of the component from the left of the canvas
 * @param Top - Position of the component from the top of the canvas
 * @param Width - Width of the component
 * @param Height - Height of the component
 * @param Label - Text to display in the button
 * @param Color - Color of the component
 * @param [Image] - URL of the image to draw inside the button, if applicable
 * @param [HoveringText] - Text of the tooltip, if applicable
 * @param [Disabled] - Disables the hovering options if set to true
 * @param [NoBorder] - Disables the border and stuff
 * @returns - Nothing
 */
function DrawButtonKD (
	name:		string,
	enabled:	boolean,
	Left:		number,
	Top:		number,
	Width:		number,
	Height:		number,
	Label:		string,
	Color:		string,
	Image?:		string,
	HoveringText?:	string,
	Disabled?:	boolean,
	NoBorder?:	boolean
): void
{
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		priority: 0,
	};
}


/**
 * Draws a button component
 * @param name - Name of the button element
 * @param func - Whether or not you can click on it
 * @param enabled - Whether or not you can click on it
 * @param Left - Position of the component from the left of the canvas
 * @param Top - Position of the component from the top of the canvas
 * @param Width - Width of the component
 * @param Height - Height of the component
 * @param Label - Text to display in the button
 * @param Color - Color of the component
 * @param [Image] - URL of the image to draw inside the button, if applicable
 * @param [HoveringText] - Text of the tooltip, if applicable
 * @param [Disabled] - Disables the hovering options if set to true
 * @param [NoBorder] - Disables border
 * @param [FillColor] - BG color
 * @param [FontSize] - Font size
 * @param [ShiftText] - Shift text to make room for the button
 * @param [options] - Additional options
 * @param [options.noTextBG] - Dont show text backgrounds
 * @param [options.alpha] - Dont show text backgrounds
 * @param [options.zIndex] - zIndex
 * @param [options.scaleImage] - zIndex
 * @param [options.centered] - centered
 * @param [options.centerText] - centered
 * @param [options.tint] - tint
 * @param [options.hotkey] - hotkey
 * @param [options.hotkeyPress] - hotkey
 * @param [options.filters] - filters
 * @returns - Whether or not the mouse is in the button
 */
function DrawButtonKDEx (
	name:		string,
	func:		(bdata: any) => any,
	enabled:	boolean,
	Left:		number,
	Top:		number,
	Width:		number,
	Height:		number,
	Label:		string,
	Color:		string,
	Image?:		string,
	HoveringText?:	string,
	Disabled?:	boolean,
	NoBorder?:	boolean,
	FillColor?:	string,
	FontSize?:	number,
	ShiftText?:	boolean,
	options?:	any,
): boolean
{
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, undefined, options?.zIndex, options);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		func,
		priority: (options?.zIndex || 0),
		hotkeyPress: options?.hotkeyPress,
	};
	return MouseIn(Left,Top,Width,Height);
}



/**
 * Draws a button component
 * @param name - Name of the button element
 * @param func - Whether or not you can click on it
 * @param enabled - Whether or not you can click on it
 * @param Left - Position of the component from the left of the canvas
 * @param Top - Position of the component from the top of the canvas
 * @param Width - Width of the component
 * @param Height - Height of the component
 * @param Label - Text to display in the button
 * @param Color - Color of the component
 * @param [Image] - URL of the image to draw inside the button, if applicable
 * @param [HoveringText] - Text of the tooltip, if applicable
 * @param [Disabled] - Disables the hovering options if set to true
 * @param [NoBorder] - Disables border
 * @param [FillColor] - BG color
 * @param [FontSize] - Font size
 * @param [ShiftText] - Shift text to make room for the button
 * @param [options] - Additional options
 * @param [options.noTextBG] - Dont show text backgrounds
 * @param [options.alpha] - Dont show text backgrounds
 * @param [options.zIndex] - zIndex
 * @param [options.scaleImage] - zIndex
 * @param [options.centered] - centered
 * @param [options.centerText] - centered
 * @param [options.tint] - tint
 * @param [options.hotkey] - hotkey
 * @param [options.hotkeyPress] - hotkey
 * @returns - Whether or not the mouse is in the button
 */
function DrawButtonKDExScroll (
	name:		string,
	scrollfunc:	(amount: number) => boolean | void,
	func:		(bdata: any) => boolean,
	enabled:	boolean,
	Left:		number,
	Top:		number,
	Width:		number,
	Height:		number,
	Label:		string,
	Color:		string,
	Image?:		string,
	HoveringText?:	string,
	Disabled?:	boolean,
	NoBorder?:	boolean,
	FillColor?:	string,
	FontSize?:	number,
	ShiftText?:	boolean,
	options?:	any,
): boolean
{
	DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, undefined, options?.zIndex, options);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		func,
		priority: (options?.zIndex || 0),
		scrollfunc: scrollfunc,
		hotkeyPress: options?.hotkeyPress,
	};
	return MouseIn(Left,Top,Width,Height);
}

/**
 * Draws a button component
 * @param Container - Container to draw to
 * @param name - Name of the button element
 * @param func - Whether or not you can click on it
 * @param enabled - Whether or not you can click on it
 * @param Left - Position of the component from the left of the canvas
 * @param Top - Position of the component from the top of the canvas
 * @param Width - Width of the component
 * @param Height - Height of the component
 * @param Label - Text to display in the button
 * @param Color - Color of the component
 * @param [Image] - URL of the image to draw inside the button, if applicable
 * @param [HoveringText] - Text of the tooltip, if applicable
 * @param [Disabled] - Disables the hovering options if set to true
 * @param [NoBorder] - Disables border
 * @param [FillColor] - BG color
 * @param [FontSize] - Font size
 * @param [ShiftText] - Shift text to make room for the button
 * @param [options] - Additional options
 * @param [options.noTextBG] - Dont show text backgrounds
 * @param [options.alpha] - Dont show text backgrounds
 * @param [options.zIndex] - zIndex
 * @param [options.hotkey] - hotkey
 * @param [options.hotkeyPress] - hotkey
 * @param [options.unique] - This button is unique, so X and Y are not differentiators
 * @returns - Whether or not the mouse is in the button
 */
function DrawButtonKDExTo (
	Container:	any,
	name:		string,
	func:		(bdata: any) => boolean,
	enabled:	boolean,
	Left:		number,
	Top:		number,
	Width:		number,
	Height:		number,
	Label:		string,
	Color:		string,
	Image?:		string,
	HoveringText?:	string,
	Disabled?:	boolean,
	NoBorder?:	boolean,
	FillColor?:	string,
	FontSize?:	number,
	ShiftText?:	boolean,
	options?:	any,
): boolean
{
	DrawButtonVisTo(Container, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, undefined, options?.zIndex, options);
	KDButtonsCache[name] = {
		Left,
		Top,
		Width,
		Height,
		enabled,
		func,
		priority: (options?.zIndex || 0),
		hotkeyPress: options?.hotkeyPress,
	};
	return MouseIn(Left,Top,Width,Height);
}

function KDMouseWheel (event: WheelEvent): void {
	if (!KDProcessButtonScroll(event.deltaY)) {
		// If we fail we dilate the buttons vertically
		if (KDProcessButtonScroll(event.deltaY, 15)) return;
	} else return;
	if (KDFunctionOptionsScroll(event.deltaY)) return;
	if (KDFunctionCollectionScroll(event.deltaY)) return;
	if (KDFunctionFacilitiesScroll(event.deltaY)) return;
	if (KDFunctionContainerScroll(event.deltaY)) return;
	if (KDFunctionDialogueScroll(event.deltaY)) return;
	if (KDFunctionPerksScroll(event.deltaY || event.deltaX)) return;
	if (KDFunctionQuestScroll(event.deltaY || event.deltaX)) return;
	if (KDFunctionMagicPageScroll(event.deltaY || event.deltaX)) return;
	if (KDFunctionMagicSpellPageScroll(event.deltaY || event.deltaX)) return;
	if (KDFunctionInventoryScroll(event.deltaY || event.deltaX)) return;
	if (KDFunctionMsgScroll(event.deltaY)) return;
	if (KDFunctionRestraintIndexScroll(event.deltaY)) return;
	if (KDFunctionShopScroll(event.deltaY)) return;
	if (KDFunctionSpellPageScroll(event.deltaY || event.deltaX)) return;
}

function KDFunctionOptionsScroll(amount: number): boolean {
	if (KinkyDungeonState == "Toggles") {
		let index = KDToggleGroups.indexOf(KDToggleTab);
		if (amount > 0) {
			if (index >= 0) index += 1;
			if (index >= KDToggleGroups.length) index = 0;
		} else {
			if (index >= 0) index -= 1;
			if (index < 0) index = KDToggleGroups.length-1;
		}
		if (index >= 0)
			KDToggleTab = KDToggleGroups[index];
		return true;
	}
	return false;
}
function KDFunctionPerksScroll(amount: number): boolean {
	if (KinkyDungeonState == "Stats" || KinkyDungeonDrawState == "Perks2" ) {
		if (amount > 0) {
			KDClickButton("perks>");
		} else {
			KDClickButton("perks<");
		}
		return true;
	}
	return false;
}
function KDFunctionQuestScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Quest") {
		if (amount > 0) {
			KDClickButton("questDown");
		} else {
			KDClickButton("questUp");
		}
		return true;
	}
	return false;
}
function KDFunctionCollectionScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && (KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage")) {
		if (amount > 0) {
			KDClickButton("collDOWN");
		} else {
			KDClickButton("collUP");
		}
		return true;
	}
	return false;
}
function KDFunctionFacilitiesScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Facilities") {
		if (amount > 0) {
			KDClickButton("facDown");
		} else {
			KDClickButton("facUp");
		}
		return true;
	}
	return false;
}
function KDFunctionContainerScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Container") {
		if (amount > 0) {
			KDClickButton("conDown");
		} else {
			KDClickButton("conUp");
		}
		return true;
	}
	return false;
}
function KDFunctionSpellPageScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" ) {
		if (amount > 0) {
			KDCycleSpellPage(false, true);
		} else {
			KDCycleSpellPage(true, true);
		}
		return true;
	}
	return false;
}
function KDFunctionMagicPageScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Magic" ) {
		if (amount > 0) {
			KDClickButton("magicnextpage");
		} else {
			KDClickButton("magiclastpage");
		}
		return true;
	}
	return false;
}
function KDFunctionMagicSpellPageScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "MagicSpells") {
		if (MouseY < 225) {
			if (amount > 0) {
				KinkyDungeonCurrentSpellsPage += 1;
				if (KinkyDungeonCurrentSpellsPage >= KinkyDungeonLearnableSpells.length - 1) KinkyDungeonCurrentSpellsPage = KinkyDungeonLearnableSpells.length - 1;
			} else {
				KinkyDungeonCurrentSpellsPage -= 1;
				if (KinkyDungeonCurrentSpellsPage < 0) KinkyDungeonCurrentSpellsPage = 0;
			}
		}

		return true;
	}
	return false;
}
function KDFunctionInventoryScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Inventory" ) {
		if (amount > 0) {
			KDClickButton("invnextpage");
		} else {
			KDClickButton("invlastpage");
		}
		return true;
	}
	return false;
}
function KDFunctionMsgScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonMessageToggle) {
		if (amount > 0) {
			KDClickButton("logscrolldown");
		} else {
			KDClickButton("logscrollup");
		}
		return true;
	}
	return false;
}
function KDFunctionRestraintIndexScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonDrawStruggleHover && currentDrawnSG && currentDrawnSGLength) {
		if (amount > 0) {
			if ((KDStruggleGroupLinkIndex[currentDrawnSG.group] < currentDrawnSGLength - 1)) KDStruggleGroupLinkIndex[currentDrawnSG.group] += 1;
		} else {
			if ((KDStruggleGroupLinkIndex[currentDrawnSG.group] > 0)) KDStruggleGroupLinkIndex[currentDrawnSG.group] -= 1;
		}
		return true;
	}
	return false;
}
function KDFunctionDialogueScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KDGameData.CurrentDialog) {
		if (amount > 0) {
			KDClickButton("dialogueDOWN");
		} else {
			KDClickButton("dialogueUP");
		}
		return true;
	}
	return false;
}
function KDFunctionShopScroll(amount: number): boolean {
	if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonTargetTile?.Type == "Shrine" && KinkyDungeonTargetTile.Name == "Commerce") {
		if (amount < 0) {
			KinkyDungeonShopIndex = (KinkyDungeonShopIndex + 1) % KDMapData.ShopItems.length;
			KDShopBuyConfirm = false;
			return true;
		} else {
			KinkyDungeonShopIndex = KinkyDungeonShopIndex - 1;
			if (KinkyDungeonShopIndex < 0) KinkyDungeonShopIndex = KDMapData.ShopItems.length - 1;
			KDShopBuyConfirm = false;
			return true;
		}
	}
	return false;
}


function KDProcessButtonScroll(amount: number, padV: number = 0): boolean {
	let buttons = [];
	for (let button of Object.entries(KDButtonsCache)) {
		if (button[1].enabled && button[1].scrollfunc) {
			if (MouseInKD(button[0], 0, padV)) {
				buttons.push(button[1]);
			}
		}
	}
	if (buttons.length > 0) {
		buttons = buttons.sort((a, b) => {return b.priority - a.priority;});
		buttons[0].scrollfunc(amount);
		return true;
	}


	return false;
}

function KDProcessButtons() {
	//KDFocusControls = "";
	let buttons = [];
	for (let button of Object.entries(KDButtonsCache)) {
		if (button[1].enabled && button[1].func) {
			if (MouseInKD(button[0])) {
				buttons.push(button[1]);
			}
		}
	}
	if (buttons.length > 0) {
		buttons = buttons.sort((a, b) => {return b.priority - a.priority;});
		return buttons[0].func();
	}

	return false;
}

/**
 * Buttons are clickable one frame later, please factor this in to UI design (especially when enforcing validation)
 */
function KDClickButton(name: string): boolean {
	let button = KDButtonsCache[name] || KDLastButtonsCache[name];
	if (button && button.enabled) {
		return button.func();
	}
	return false;
}

function MouseInKD(name: string, padX: number = 0, padV: number = 0) {
	let button = KDButtonsCache[name];
	if (button && button.enabled) {
		return MouseIn(button.Left - padX, button.Top - padV, button.Width + 2*padX, button.Height + 2*padV);
	}
	return false;
}

function KinkyDungeonGetTraitsCount() {
	return Array.from(KinkyDungeonStatsChoice.keys()).filter((element) => {return !element.includes('arousalMode');}).length;
}

function KDSendTrait(_trait) {
	// Banish Google
}

function KDSendSpell(_spell) {
	// Banish Google
}

function KDSendSpellCast(_spell) {
	// Banish Google
}
function KDSendWeapon(_weapon) {
	// Banish Google
}

// @ts-ignore
function KDSendStatus(_type, _data?, _data2?) {
	// Banish Google from existence
}
// @ts-ignore
function KDSendEvent(_type) {
	// Banish Google from existence
}

function KinkyDungeonLoadStats() {
	KinkyDungeonStatsChoice = new Map();
	KDUpdatePlugSettings(false);
	let statsChoice = localStorage.getItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig);
	if (statsChoice) {
		let statsArray = JSON.parse(statsChoice);
		if (statsArray) {
			for (let s of statsArray) {
				if (!kdSpecialModePerks.includes(s) && KinkyDungeonStatsPresets[s] && KDValidatePerk(KinkyDungeonStatsPresets[s]))
					KinkyDungeonStatsChoice.set(s, true);
			}
		}
	}
	KDUpdatePlugSettings(true);
}

let KinkyDungeonGameFlag = false;


function KDInitializeJourney(Journey: string, Level: number = 0) {
	KDCurrentWorldSlot = {x: 0, y: Level || 0};
	KDWorldMap = {};
	let newIndex: string[] = [];

	if (Journey)
		KDGameData.Journey = Journey;

	if (KDGameData.Journey == "Random") {

		// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		let randList = [...KDDefaultJourney, ...KDDefaultAlt];
		for (let i = randList.length - 1; i >= 0; i--) {
			let j = Math.floor(KDRandom() * (i + 1));
			let temp = randList[i];
			randList[i] = randList[j];
			randList[j] = temp;
		}
		for (let i = 0; i < KDDefaultJourney.length; i++) {
			newIndex.push(randList[i]);
		}
	} else if (KDGameData.Journey == "Harder") {
		for (let i = 0; i < KDDefaultJourney.length; i++) {
			//newIndex[KDDefaultAlt[i]] = KDDefaultJourney[i];
			newIndex = [...KDDefaultAlt];
		}
	} else if (KDGameData.Journey == "Explorer") {
		newIndex = [...KDDefaultJourney];
		newIndex[0] = 'jng';
		newIndex[1] = 'grv';
		newIndex[2] = 'tmp';
		newIndex[3] = 'ore';
		newIndex[4] = 'bel';
	} else if (KDGameData.Journey == "Doll") {
		newIndex = [...KDDefaultJourney];
		newIndex[0] = 'bel';
		newIndex[1] = 'bel';
		newIndex[2] = 'bel';
		newIndex[3] = 'cry';
		newIndex[4] = 'cat';
	} else if (KDGameData.Journey == "Temple") {
		newIndex = [...KDDefaultJourney];
		newIndex[0] = 'tmp';
		newIndex[1] = 'lib';
		newIndex[2] = 'tmb';
		newIndex[3] = 'cat';
		newIndex[4] = 'jng';
	} else if (KDGameData.Journey == "Test") {
		newIndex = [...KDDefaultJourney];
		newIndex[0] = 'bel';
	} else {
		newIndex = [...KDDefaultJourney];
	}

	KDGameData.JourneyProgression = newIndex;

	KinkyDungeonMapIndex = {};

	for (let map of KDDefaultJourney) {
		KinkyDungeonMapIndex[map] = map;
	}
	for (let map of KDDefaultAlt) {
		KinkyDungeonMapIndex[map] = map;
	}


	// Option to shuffle the dungeon types besides the initial one (graveyard)
	/*

		let newIndex = {};

		for (let map of KDDefaultJourney) {
			newIndex[map] = map;
		}
		for (let map of KDDefaultAlt) {
			newIndex[map] = map;
		}

		if (Journey)
			KDGameData.Journey = Journey;

	if (KDGameData.Journey == "Random") {

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
		newIndex.cat = 'grv';
		newIndex.lib = 'cat';
		newIndex.jng = 'tmp';
		newIndex.cry = 'lib';
		newIndex.tmp = 'ore';
		newIndex.ore = 'tmb';
		newIndex.bel = 'bel';
	} else if (KDGameData.Journey == "Doll") {
		newIndex.grv = 'bel';
		newIndex.tmb = 'tmp';
		newIndex.cat = 'bel';
		newIndex.lib = 'ore';
		newIndex.jng = 'bel';
		newIndex.cry = 'lib';
		newIndex.tmp = 'cry';
		newIndex.ore = 'tmb';
		newIndex.bel = 'cat';
	} else if (KDGameData.Journey == "Temple") {
		newIndex.grv = 'tmp';
		newIndex.tmb = 'ore';
		newIndex.cat = 'lib';
		newIndex.lib = 'ore';
		newIndex.jng = 'tmb';
		newIndex.cry = 'bel';
		newIndex.tmp = 'cat';
		newIndex.ore = 'cry';
		newIndex.bel = 'jng';
	} else if (KDGameData.Journey == "Test") {
		newIndex.grv = 'bel';
		newIndex.tmb = 'bel';
	}

	KinkyDungeonMapIndex = newIndex;
	*/



	KDInitJourneyMap(Level);
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
		KinkyDungeonKeybindings.Spell8,
		KinkyDungeonKeybindings.Spell9,
		KinkyDungeonKeybindings.Spell0,
	]; // ! @ #
	KinkyDungeonKeyUpcast = [KinkyDungeonKeybindings.Upcast, KinkyDungeonKeybindings.UpcastCancel];
	KinkyDungeonKeySpellConfig = [
		KinkyDungeonKeybindings.SpellConfig1,
		KinkyDungeonKeybindings.SpellConfig2,
		KinkyDungeonKeybindings.SpellConfig3,
	];
	KinkyDungeonKeyWait = [KinkyDungeonKeybindings.Wait];
	KinkyDungeonKeySkip = [KinkyDungeonKeybindings.Skip];
	KinkyDungeonKeyWeapon = [KinkyDungeonKeybindings.SpellWeapon]; // 8 (57)
	KinkyDungeonKeyMenu = [
		KinkyDungeonKeybindings.QInventory,
		KinkyDungeonKeybindings.Inventory,
		KinkyDungeonKeybindings.Reputation,
		KinkyDungeonKeybindings.Magic,
		KinkyDungeonKeybindings.Log,
		KinkyDungeonKeybindings.Quest,
		KinkyDungeonKeybindings.Collection,
	];
	KinkyDungeonKeyToggle = [
		KinkyDungeonKeybindings.MsgLog,
		KinkyDungeonKeybindings.Pass,
		KinkyDungeonKeybindings.Door,
		KinkyDungeonKeybindings.AStruggle,
		KinkyDungeonKeybindings.APathfind,
		KinkyDungeonKeybindings.AInspect,
		KinkyDungeonKeybindings.WaitInterrupt,
		KinkyDungeonKeybindings.MakeNoise,
		KinkyDungeonKeybindings.PlaySelf,
		KinkyDungeonKeybindings.Crouch,
		KinkyDungeonKeybindings.BulletTransparency,
	];

	KinkyDungeonKeyMap = [KinkyDungeonKeybindings.Map, KinkyDungeonKeybindings.ZoomOut, KinkyDungeonKeybindings.ZoomIn];
	KinkyDungeonKeyEnter = [KinkyDungeonKeybindings.Enter];
	KinkyDungeonKeySpellPage = [KinkyDungeonKeybindings.SpellPage];
	KinkyDungeonKeySwitchWeapon = [KinkyDungeonKeybindings.SwitchWeapon, KinkyDungeonKeybindings.SwitchWeaponOffhand, KinkyDungeonKeybindings.SwitchWeaponOffhandPrevious, KinkyDungeonKeybindings.SwitchWeaponOffhandPrevious2];
	KinkyDungeonKeySprint = [KinkyDungeonKeybindings.Sprint];
	KinkyDungeonKeySwitchLoadout = [KinkyDungeonKeybindings.SwitchLoadout1, KinkyDungeonKeybindings.SwitchLoadout2, KinkyDungeonKeybindings.SwitchLoadout3];

	KinkyDungeonGameKey.KEY_WAIT = (KinkyDungeonKeybindings.Wait);
	KinkyDungeonGameKey.KEY_SKIP = (KinkyDungeonKeybindings.Skip);
}

let afterLoaded = false;

let KDGameSaveDBStoreName = "KinkyDungeonSave";

/**
 * Open a new database if it doesn't exist and give a db object that automatically increments when modifying stuff.
 * Returns a thenable with the database once it's open.
 */
function KinkyDungeonDBOpen(): Promise<IDBDatabase> {
	// Return a promise so we can guarantee the db is open!
	return new Promise<IDBDatabase>((res, _rej) => {
		// Open the KinkyDungeonSave DB, creating one if it doesn't already exist.
		const request = indexedDB.open(KDGameSaveDBStoreName); // Open without a version parameter to get the most current version.
		let db: IDBDatabase;

		// Whenever an update is made, increment the version number.
		request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
			// @ts-ignore
			db = event.target.result;
			if (!db.objectStoreNames.contains(KDGameSaveDBStoreName)) {
				db.createObjectStore(KDGameSaveDBStoreName, { autoIncrement: true });
			}
		};

		// Return the event results when it's successful
		request.onsuccess = (event: Event) => {
			db = (event.target as IDBOpenDBRequest).result;

			// Give back a db object so we can manipulate it.
			res(db);
		};

		// Throw an error if it breaks
		request.onerror = (event: Event) => {
			console.error("IndexedDB error");
			console.log(event);
			res(db);
		};
	});
}

/**
 * Save a game to the database.
 */
function KinkyDungeonDBSave(saveslot: number, gamecode?: string) {
	let save: string = undefined;
	if (saveslot == undefined) {
		console.error("Save slot is not defined");
		return; // This is an invalid call or the save slot has not been set.
	}
	if (gamecode == undefined) {
		// We are going to use the current game state as a save code.
		save = LZString.compressToBase64(JSON.stringify(KinkyDungeonGenerateSaveData()));
	}
	else {
		save = gamecode;
	}

	// Get the savegame database
	KinkyDungeonDBOpen().then((db) => {
		// Create a transaction
		const transaction = db.transaction(KDGameSaveDBStoreName, "readwrite");
		const store = transaction.objectStore(KDGameSaveDBStoreName);
		const data = { content: save };
		const request = store.put(data, `save_${saveslot}`);

		request.onsuccess = () => {
			console.log(`Game saved to save_${saveslot}`, request.result);
		};
		request.onerror = () => {
			console.error("Could not add data to the store");
		};
		transaction.oncomplete = () => {
			db.close();
			return true;
		};
	});
}

/**
 * Load a game from the database - Returns a thenable with the gamedata string, false if nothing loaded.
 */
function KinkyDungeonDBLoad(saveslot: number): Promise<string | null> {
	return new Promise((res, _rej) => {
		if (saveslot == undefined) {
			console.error("Save slot is not defined");
			return; // This is an invalid call or the save slot has not been set.
		}

		// Get the savegame database
		KinkyDungeonDBOpen().then((db) => {
			// Create a transaction
			const transaction = db.transaction(KDGameSaveDBStoreName, "readonly");
			const store = transaction.objectStore(KDGameSaveDBStoreName);
			const request = store.get(`save_${saveslot}`);

			request.onsuccess = () => {
				if (request.result) {
					console.log(`Successfully loaded save game in slot ${saveslot}`);
					let outstring = Object.assign({}, request.result).content;
					res(outstring);
				}
				else {
					console.log(`Successfully loaded, but no save data present in slot ${saveslot}`);
					res(null);
				}
			};
			request.onerror = () => {
				console.error(`Could not fetch data in slot save_${saveslot}`);
				res(null);
			};
		});
	});
}

/**
 * Delete a saved game in a slot.
 */
function KinkyDungeonDBDelete(saveslot: number) {
	return new Promise((res, _rej) => {
		if (saveslot == undefined) {
			console.error("Save slot is not defined");
			return; // This is an invalid call or the save slot has not been set.
		}

		// Get the savegame database
		KinkyDungeonDBOpen().then((db) => {
			// Create a transaction
			const transaction = db.transaction(KDGameSaveDBStoreName, "readwrite");
			const store = transaction.objectStore(KDGameSaveDBStoreName);
			const request = store.delete(`save_${saveslot}`);

			request.onsuccess = () => {
				console.log(`Slot ${saveslot} deleted successfully`);
				res(true);
			};
			request.onerror = () => {
				console.error(`Error deleting slot ${saveslot}`);
				res(false);
			};
		});
	});
}

let LoadMenuCurrentSave: string;
let LoadMenuCurrentSlot: number;
let loadedsaveslots: string[] = [];
let loadedsaveNames: string[] = [];
for (let i = 0; i < maxSaveSlots; i++) {
	loadedsaveslots.push(null);
	loadedsaveNames.push("");
}

let loadedSaveforPreview: KinkyDungeonSave = null;
let KDPreviewModel = null;
let KDSaveSlot = 1;

// Moved these to text doc -Ada

let ModelPreviewLoaded = false;
let KDDeleteSaveIndex = -1;

let KDSlot0 = "";

// Load Menu function
function KDDrawLoadMenu() {
	let YYstart = 140;
	let YY = YYstart;
	let YYd = 74;
	YY = YYstart + 50;
	YYd = 80;
	let CombarXX = 520;
	// Save slots buttons
	DrawTextFitKD(TextGet("PlayGameWithCurrentCode"), 1250, YYstart - 70, 1000, "#ffffff", undefined, 40);
	for (let i = 1; i < 5; i++) {
		let num = (i);
		// Slot button
		DrawButtonKDEx(TextGet("KDSaveSlotButton") + num, () => {
			console.log("Pressed button for save slot " + num);
			loadedSaveforPreview = null;
			LoadMenuCurrentSlot = num;
			LoadMenuCurrentSave = loadedsaveslots[num - 1];
			loadedSaveforPreview = KinkyDungeonLoadPreview(LoadMenuCurrentSave);

			// @ts-ignore
			if (!loadedSaveforPreview.invalid) {
				// Dress the KDPreviewModel
				ModelPreviewLoaded = false;
				KinkyDungeonDressModelPreview();
			}

			KDConfirmDeleteSave = false;

			KDSaveSlot = num;

			return true;
		}, true, CombarXX + 100, YY, 300, 64, TextGet("KDSaveSlotButton") + i, "#ffffff", "");
		// Selected arrow if the currently selected slot matches
		if (num == LoadMenuCurrentSlot) {
			DrawTextFitKD(`<--`, CombarXX + 430, YY + 35, 50, "#ffffff", undefined, 40);
		}
		// Delete button only if the slot has data
		if (loadedsaveslots[num - 1]) {
			DrawButtonKDEx("KDDeleteSlotButton" + i, (_b) => {
				if (!KDConfirmDeleteSave || KDDeleteSaveIndex != num) {
					KDConfirmDeleteSave = true;
					KDDeleteSaveIndex = num;
				} else {
					KDConfirmDeleteSave = false;
					KinkyDungeonDBDelete(num);
					loadedsaveslots[num - 1] = null;
				}
				return true;
			}, true,
			CombarXX + 15 - ((KDDeleteSaveIndex == num && KDConfirmDeleteSave) ? 100 + (Math.random() < 0.5 ? -1 : 1) : 0),
			YY - ((KDDeleteSaveIndex == num && KDConfirmDeleteSave) ? (Math.random() < 0.5 ? -1 : 1) : 0),
			64, 64, (KDDeleteSaveIndex == num && KDConfirmDeleteSave) ? "!" : "", "#ffffff", KinkyDungeonRootDirectory + "UI/X.png",
			undefined, undefined, undefined, undefined, 36, true, {
				centered: true,
			});
			if ((KDDeleteSaveIndex == num && KDConfirmDeleteSave)) {
				DrawTextFitKD(
					TextGet("KDDelete"),
					CombarXX + 42,
					YY + 32,
					120,
					"#ff5555",
				);
			}
		// @ts-ignore
		} else if (LoadMenuCurrentSlot == -1 && loadedSaveforPreview && !loadedSaveforPreview?.invalid) {
			// Import button
			if (
				DrawButtonKDEx("KDImportSlotButton" + i, (_b) => {
					if (!loadedsaveslots[num - 1]) {
						loadedsaveslots[num - 1] = ElementValue("saveInputField");
						KinkyDungeonDBSave(num, newValue = loadedsaveslots[num - 1]);
						LoadMenuCurrentSlot = num;
					}
					return true;
				}, true,
				CombarXX + 15,
				YY,
				64, 64, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Plus.png",
				undefined, undefined, undefined, undefined, 36, undefined, {
					centered: true,
				})
			) {
				DrawTextFitKD(
					TextGet("KDImport"),
					CombarXX + 5,
					YY + 32,
					300,
					"#ffffff",
					KDTextGray05,
					24, "right"
				);
			}
		}
		YY += YYd;
	}
	// Pastebox for code
	ElementPosition("saveInputField", CombarXX + 215, YY + 165, 400, 300);
	let newValue = ElementValue("saveInputField");
	// Load from Code button
	DrawButtonKDEx("LoadFromCodeButton", () => {
		KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
		LoadMenuCurrentSlot = undefined;
		if (newValue) {
			loadedSaveforPreview = KinkyDungeonLoadPreview(newValue);
			if (loadedSaveforPreview) LoadMenuCurrentSlot = -1;
		} else if (KDSlot0) {
			loadedSaveforPreview = KinkyDungeonLoadPreview(KDSlot0);
			if (loadedSaveforPreview) LoadMenuCurrentSlot = 0;
			LoadMenuCurrentSave = KDSlot0;
		}
		else {
			loadedSaveforPreview = null;
			LoadMenuCurrentSlot = -1;
		}
		if (loadedSaveforPreview) {
			LoadMenuCurrentSave = newValue ? newValue : KDSlot0;

			// @ts-ignore
			if (!loadedSaveforPreview.invalid) {
				// Dress the KDPreviewModel
				ModelPreviewLoaded = false;
				KinkyDungeonDressModelPreview();
			}

			KDSaveSlot = 0;
		}
		return true;
	}, true, CombarXX + 220, 880, 180, 64,
	TextGet((!newValue && KDSlot0) ?
		"LoadFromCodeButton0" :
		"LoadFromCodeButton"), "#ffffff", "");
	// Load from File button
	DrawButtonKDEx("LoadFromFileButton", () => {
		getFileInput(KDLoadSave);
		return true;
	}, true, CombarXX + 20, 880, 180, 64, TextGet("LoadFromFileButton"), "#ffffff", "");
	// Draw Save Slot details display
	FillRectKD(kdcanvas, kdpixisprites, "maintogglebg", {
		Left: CombarXX + 500,
		Top: YYstart - 10,
		Width: 900,
		Height: 700,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "maintogglebg2", {
		Left: CombarXX + 500,
		Top: YYstart - 10,
		Width: 900,
		Height: 700,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});
	// Save Slot Text
	if (LoadMenuCurrentSlot == -1) {
		DrawTextFitKD(TextGet("KDSaveFromCode"), CombarXX + 680, YYstart + 40, 400, "#ffffff", undefined, 40);
		DrawTextFitKD(`<--`, CombarXX + 430, YY + 180, 50, "#ffffff", undefined, 40);
	}
	else if (LoadMenuCurrentSlot != undefined) {
		DrawTextFitKD(`${TextGet("KDSaveSlotButton")}${LoadMenuCurrentSlot}`, CombarXX + 680, YYstart + 40, 400, "#ffffff", undefined, 40);
	}
	if (loadedSaveforPreview?.KDGameData) {
		// Player Name and Class
		DrawTextFitKD(loadedSaveforPreview.KDGameData.PlayerName, CombarXX + 680, YYstart + 630, 400, "#ffffff", undefined, 40);
		if (loadedSaveforPreview.KDGameData.Class)
			DrawTextFitKD(
				TextGet("KinkyDungeonStatMC_" + loadedSaveforPreview.KDGameData.Class),
				CombarXX + 680, YYstart + 665, 400, "#ffffff", undefined, 28);

		// Player Paper Doll
		if (ModelPreviewLoaded) {
			if (!KDCurrentModels.get(KDPreviewModel)) {
				DrawCharacter(KDPreviewModel, CombarXX + 530, YYstart + 35, 0.6, undefined, undefined, undefined, undefined, 100, true);

				KinkyDungeonDressPlayer(KDPreviewModel, false, true, undefined,
					loadedSaveforPreview.inventoryarray.restraint,
					KinkyDungeonUpdateRestraints(KDPreviewModel, 0, 0,
						loadedSaveforPreview.inventoryarray.restraint),
					KDToggles.ForcePalette ? KDDefaultPalette : undefined, true);
			}
			DrawCharacter(KDPreviewModel, CombarXX + 530, YYstart + 35, 0.6, undefined, undefined, undefined, undefined, 100, true);

		}
		// New Game Text
		DrawTextFitKD(TextGet("KDSlotLocFormat")
			.replace("FLR", "" + loadedSaveforPreview.level)
			.replace("DGN", TextGet("DungeonName" + loadedSaveforPreview.checkpoint))
			+ ((loadedSaveforPreview.npp > 0) ? TextGet("KDSlotLocNG")
				.replace("AMNT", "" + loadedSaveforPreview.npp) : ""), CombarXX + 1100, YYstart + 40, 450, "#ffffff", undefined, 40);

		// Difficulty
		let difficultytext = "KDHardMode0";
		if (loadedSaveforPreview.hardmode == true) {
			difficultytext = "KDHardMode1";
		}
		if (loadedSaveforPreview.extrememode == true) {
			difficultytext = "KDHardMode2";
		}
		DrawTextFitKD(`${TextGet("KDJourney" + (loadedSaveforPreview.journey || "None"))}${TextGet(difficultytext)}`,
			CombarXX + 1100, YYstart + 90, 450, "#ffffff", undefined, 40);

		// Save Code Seed
		DrawTextFitKD(TextGet("KDMapSeed") + `${loadedSaveforPreview.seed}`, CombarXX + 1100, YYstart + 140, 400, "#ffffff", undefined, 40);



		// Draw misc challenge settings
		let challengeInfo = [""];
		let challengeheight = 0;
		let challengeIndex = 0;
		let challengeMaxPerRow = 2;

		challengeInfo[challengeheight] = challengeInfo[challengeIndex] + TextGet("KinkyDungeonSexyMode" + (loadedSaveforPreview.arousalMode ? "1" : "0"));
		challengeIndex++;

		if (loadedSaveforPreview.random) {
			if (challengeIndex >= challengeMaxPerRow) {
				challengeheight++;
				challengeInfo.push("");
			}
			if (challengeInfo[challengeheight]) challengeInfo[challengeheight] = challengeInfo[challengeheight] + ", ";
			challengeInfo[challengeheight] = challengeInfo[challengeheight] + TextGet("KinkyDungeonRandomMode1");
			challengeIndex++;
		}
		if (loadedSaveforPreview.savemode) {
			if (challengeIndex >= challengeMaxPerRow) {
				challengeheight++;
				challengeInfo.push("");
			}
			if (challengeInfo[challengeheight]) challengeInfo[challengeheight] = challengeInfo[challengeheight] + ", ";
			challengeInfo[challengeheight] = challengeInfo[challengeheight] + TextGet("KinkyDungeonSaveMode" + (loadedSaveforPreview.savemode ? "1" : "0"));
			challengeIndex++;
		}

		for (let i = 0; i <= challengeheight; i++) {
			DrawTextFitKD(challengeInfo[i], CombarXX + 1100,
				YYstart + 260 - (challengeheight + 1) * 20 + i * 40,
				400, "#ffffff", undefined, 32);
		}



		let itemOffset = 575;
		// Gold Held by the Player
		KDDraw(kdcanvas, kdpixisprites, "gold", KinkyDungeonRootDirectory + "Items/Gold.png",
			CombarXX + 880, YYstart + itemOffset, 100, 100, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.gold}`, CombarXX + 930, YYstart + itemOffset + 80, 200, "#ffffff", "#333333",
			24, undefined, 90);

		// Lockpicks held by the Player
		KDDraw(kdcanvas, kdpixisprites, "picks", KinkyDungeonRootDirectory + "Items/Pick.png",
			CombarXX + 970, YYstart + itemOffset, 100, 100, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.picks}`, CombarXX + 1020, YYstart + itemOffset + 80, 200, "#ffffff", "#333333",
			24, undefined, 90);

		// Red Keys held by the Player
		KDDraw(kdcanvas, kdpixisprites, "rkeys", KinkyDungeonRootDirectory + "Items/RedKey.png",
			CombarXX + 1060, YYstart + itemOffset, 100, 100, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.rkeys}`, CombarXX + 1110, YYstart + itemOffset + 80, 200, "#ffffff", "#333333",
			24, undefined, 90);

		// Blue Keys held by the Player
		KDDraw(kdcanvas, kdpixisprites, "bkeys", KinkyDungeonRootDirectory + "Items/BlueKey.png",
			CombarXX + 1150, YYstart + itemOffset, 100, 100, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.bkeys}`, CombarXX + 1200, YYstart + itemOffset + 80, 200, "#ffffff", "#333333",
			24, undefined, 90);

		// Blue Keys held by the Player
		KDDraw(kdcanvas, kdpixisprites, "MistressKeys", KinkyDungeonRootDirectory + "Items/MistressKey.png",
			CombarXX + 1240, YYstart + itemOffset, 100, 100, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.mistresskey}`, CombarXX + 1290, YYstart + itemOffset + 80, 200, "#ffffff", "#333333",
			24, undefined, 90);


		let barOffset = itemOffset - 47;

		// Draw bars below the stat text.
		let heightPerBar = 45;
		let barwidth = 400;
		let barborder = 2;
		let offsetmult = 50;
		let offsetcount = 0;

		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarSPBack`, {
			Left: CombarXX + 900 + (offsetcount * offsetmult),
			Top: barOffset + (offsetcount * offsetmult) - heightPerBar/2,
			Width: barwidth,
			Height: heightPerBar,
			Color: "#0d0d0d",
			LineWidth: 1,
			zIndex: 57,
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarSPBack2`, {
			Left: CombarXX + 900 + (offsetcount * offsetmult) + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: barwidth - (barborder * 2),
			Height: heightPerBar - (barborder * 2),
			Color: "#283540",
			LineWidth: 1,
			zIndex: 58,
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarSPBack3`, {
			Left: CombarXX + 900 + (offsetcount * offsetmult) + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: Math.floor((barwidth - (barborder * 2)) * (Math.floor(loadedSaveforPreview.stamina * 10))
				/ ((loadedSaveforPreview.KDGameData.StatMaxBonus?.SP + 10) * 10)),
			Height: heightPerBar - (barborder * 2),
			Color: "#4fd658",
			LineWidth: 1,
			zIndex: 59,
		});

		DrawTextFitKD(`Stamina: ${Math.floor(loadedSaveforPreview.stamina * 10)}/${(loadedSaveforPreview.KDGameData.StatMaxBonus?.SP + 10) * 10}`,
			CombarXX + 1100, barOffset + (offsetcount * offsetmult), 400, "#ffffff", undefined, 32);

		// Stamina Potions Held by the Player
		KDDraw(kdcanvas, kdpixisprites, "PotionStamina", KinkyDungeonRootDirectory + "UI/UsePotionStamina.png",
			CombarXX + 1310, barOffset + (offsetcount * offsetmult) - 13, 44, 26, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.potions.stamina}`, CombarXX + 1360, barOffset + (offsetcount * offsetmult), 200, "#ffffff", "#333333",
			24, undefined, 90);


		offsetcount++;
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarMPBack`, {
			Left: CombarXX + 900,
			Top: barOffset + (offsetcount * offsetmult) - heightPerBar/2,
			Width: barwidth,
			Height: heightPerBar,
			Color: "#0d0d0d",
			LineWidth: 1,
			zIndex: 57 + (offsetcount * 5),
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarMPBack2`, {
			Left: CombarXX + 900 + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: barwidth - (barborder * 2),
			Height: heightPerBar - (barborder * 2),
			Color: "#4fa4b8",
			LineWidth: 1,
			zIndex: 58 + (offsetcount * 5),
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarMPBack3`, {
			Left: CombarXX + 900 + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: Math.floor((barwidth - (barborder * 2)) * (Math.floor(loadedSaveforPreview.mana * 10))
				/ ((loadedSaveforPreview.KDGameData.StatMaxBonus?.MP + 10) * 10)),
			Height: heightPerBar - (barborder * 2),
			Color: "#4c6885",
			LineWidth: 1,
			zIndex: 59 + (offsetcount * 5),
		});

		DrawTextFitKD(`Mana: ${Math.floor(loadedSaveforPreview.mana * 10)}/${(loadedSaveforPreview.KDGameData.StatMaxBonus?.MP + 10) * 10}`,
			CombarXX + 1100, barOffset + (offsetcount * offsetmult), 400, "#ffffff", undefined, 32);

		// Mana Potions Held by the Player
		KDDraw(kdcanvas, kdpixisprites, "PotionMana", KinkyDungeonRootDirectory + "UI/UsePotionMana.png",
			CombarXX + 1310, barOffset + (offsetcount * offsetmult) - 13, 44, 26, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.potions.mana}`, CombarXX + 1360, barOffset + (offsetcount * offsetmult), 200, "#ffffff", "#333333",
			24, undefined, 90);


		offsetcount++;
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarWPBack`, {
			Left: CombarXX + 900,
			Top: barOffset + (offsetcount * offsetmult) - heightPerBar/2,
			Width: barwidth,
			Height: heightPerBar,
			Color: "#0d0d0d",
			LineWidth: 1,
			zIndex: 57 + (offsetcount * 5),
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarWPBack2`, {
			Left: CombarXX + 900 + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: barwidth - (barborder * 2),
			Height: heightPerBar - (barborder * 2),
			Color: "#222222",
			LineWidth: 1,
			zIndex: 58 + (offsetcount * 5),
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarWPBack3`, {
			Left: CombarXX + 900 + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: Math.floor((barwidth - (barborder * 2)) * (Math.floor(loadedSaveforPreview.willpower * 10))
				/ ((loadedSaveforPreview.KDGameData.StatMaxBonus?.WP + 10) * 10)),
			Height: heightPerBar - (barborder * 2),
			Color: "#ff4444",
			LineWidth: 1,
			zIndex: 59 + (offsetcount * 5),
		});

		DrawTextFitKD(`Willpower: ${Math.floor(loadedSaveforPreview.willpower * 10)}/${(loadedSaveforPreview.KDGameData.StatMaxBonus?.WP + 10) * 10}`,
			CombarXX + 1100, barOffset + (offsetcount * offsetmult), 400, "#ffffff", undefined, 32);

		// Will Potions Held by the Player
		KDDraw(kdcanvas, kdpixisprites, "PotionWill", KinkyDungeonRootDirectory + "UI/UsePotionWill.png",
			CombarXX + 1310, barOffset + (offsetcount * offsetmult) - 13, 44, 26, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.potions.will}`, CombarXX + 1360, barOffset + (offsetcount * offsetmult), 200, "#ffffff", "#333333",
			24, undefined, 90);


		offsetcount++;
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarDPBack`, {
			Left: CombarXX + 900,
			Top: barOffset + (offsetcount * offsetmult) - heightPerBar/2,
			Width: barwidth,
			Height: heightPerBar,
			Color: "#0d0d0d",
			LineWidth: 1,
			zIndex: 57 + (offsetcount * 5),
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarDPBack2`, {
			Left: CombarXX + 900 + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: barwidth - (barborder * 2),
			Height: heightPerBar - (barborder * 2),
			Color: "#692464",
			LineWidth: 1,
			zIndex: 58 + (offsetcount * 5),
		});
		FillRectKD(kdcanvas, kdpixisprites, `KDPreviewBarDPBack3`, {
			Left: CombarXX + 900 + barborder,
			Top: barOffset + (offsetcount * offsetmult) + barborder - heightPerBar/2,
			Width: Math.floor((barwidth - (barborder * 2)) * (Math.floor(loadedSaveforPreview.distraction * 10))
				/ ((loadedSaveforPreview.KDGameData.StatMaxBonus?.AP + 10) * 10)),
			Height: heightPerBar - (barborder * 2),
			Color: "#ff5277",
			LineWidth: 1,
			zIndex: 59 + (offsetcount * 5),
		});

		DrawTextFitKD(`Distraction: ${Math.floor(loadedSaveforPreview.distraction * 10)}/${(loadedSaveforPreview.KDGameData.StatMaxBonus?.AP + 10) * 10}`,
			CombarXX + 1100, barOffset + (offsetcount * offsetmult), 400, "#ffffff", undefined, 32);

		// Frigid Potions Held by the Player
		KDDraw(kdcanvas, kdpixisprites, "PotionDistraction", KinkyDungeonRootDirectory + "UI/UsePotionFrigid.png",
			CombarXX + 1310, barOffset + (offsetcount * offsetmult) - 13, 44, 26, undefined, {
				zIndex: 90
			});
		DrawTextFitKD(`${loadedSaveforPreview.potions.dist}`, CombarXX + 1360, barOffset + (offsetcount * offsetmult), 200, "#ffffff", "#333333",
			24, undefined, 90);

	}
	// @ts-ignore
	else if (loadedSaveforPreview?.nodata) {
		DrawTextFitKD(TextGet("KDNoData"), CombarXX + 1100, YYstart + 40, 450, "#ffffff", undefined, 40);
		DrawTextFitKD(`?`, CombarXX + 680, YYstart + 350, 450, "#ffffff", undefined, 128);
	// @ts-ignore
	} else if (loadedSaveforPreview?.invalid) {
		DrawTextFitKD(TextGet("KDInvalid"), CombarXX + 1100, YYstart + 40, 450, "#ffffff", undefined, 40);
		DrawTextFitKD(`?`, CombarXX + 680, YYstart + 350, 450, "#ffffff", undefined, 128);
	}
	// Return to main menu
	DrawButtonKDEx("KDBackOptions", () => {
		KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
		KinkyDungeonState = "Menu";
		ElementRemove("saveInputField");
		return true;
	}, true, 975, 880, 550, 64, TextGet("GameReturnToMenuFromOptions"), "#ffffff", "",
	undefined, undefined, undefined, undefined, undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
		hotkeyPress: KinkyDungeonKeySkip[0],
	});
	// Play Game with current save data!
	DrawButtonKDEx("KDLoadGame", () => {
		if (LoadMenuCurrentSave != "") {
			KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
			KinkyDungeonNewGame = 0;
			KDMapData.Grid = "";
			KinkyDungeonInitialize(1, true);
			MiniGameKinkyDungeonCheckpoint = "grv";
			if (KinkyDungeonLoadGame(LoadMenuCurrentSave)) {
				KDSendEvent('loadGame');
				//KDInitializeJourney(KDJourney);
				if (KDMapData.Grid == "")
					KinkyDungeonCreateMap(KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)],
						KDMapData.RoomType || "", KDMapData.MapMod || "", MiniGameKinkyDungeonLevel, false, true);
				KinkyDungeonState = "Game";
				if (KinkyDungeonKeybindings) {
					KDCommitKeybindings();
				}
				KDModsAfterGameStart();
			}
			LoadMenuCurrentSave = undefined;
			LoadMenuCurrentSlot = undefined;
			ElementRemove("saveInputField");
		}
		return true;
	}, (((LoadMenuCurrentSave != undefined) && (LoadMenuCurrentSave != "")) ? true : false), 1570, 880, 350, 64,

		LoadMenuCurrentSlot > 0 ? TextGet("KDPlayWithSlot") + LoadMenuCurrentSlot
	: TextGet("KDPlayWithoutSlot"),
	(((LoadMenuCurrentSave != undefined) && (LoadMenuCurrentSave != "")) ? "#ffffff" : "#888888"), "");
}

function KinkyDungeonDressModelPreview() {
	return new Promise((res, _rej) => {
		KDPreviewModel = Object.assign({}, KinkyDungeonPlayer);
		KDPreviewModel.ID++;
		if (loadedSaveforPreview.saveStat?.appearance) {
			KDPreviewModel.Appearance = JSON.parse(JSON.stringify(loadedSaveforPreview.saveStat.appearance));
			if (KDCurrentModels.get(KDPreviewModel))
				KDCurrentModels.get(KDPreviewModel).Poses = loadedSaveforPreview.saveStat.poses;

			UpdateModels(KDPreviewModel);
		}
		//CharacterAppearanceRestore(KDPreviewModel, DecompressB64(localStorage.getItem(`kinkydungeonappearance${KDCurrentOutfit}`)))
		//setTimeout(() => {
		KDRefreshCharacter.set(KDPreviewModel, true);
		KinkyDungeonDressPlayer(KDPreviewModel, false, true, undefined,
			loadedSaveforPreview.inventoryarray.restraint,
			KinkyDungeonUpdateRestraints(KDPreviewModel, 0, 0,
				loadedSaveforPreview.inventoryarray.restraint),
			KDToggles.ForcePalette ? KDDefaultPalette : undefined, true);
		ModelPreviewLoaded = true;
		res(true);
		//}, 50);
	});
}

/**
 * Generate Preview data function
 */
function KinkyDungeonLoadPreview(String: string): KinkyDungeonSave {
	if (!String) {
		return {
			// @ts-ignore
			nodata: true,
			invalid: true,
		};
	}
	try {
		let str: string = DecompressB64(String.trim());
		let returndata: KinkyDungeonSave = null;

		// We do a little JS witchery here
		returndata = {} as KinkyDungeonSave;

		if (str) {
			let saveData = JSON.parse(str);
			if (    saveData
			    &&  saveData.spells != undefined
			    &&  saveData.level != undefined
			    &&  saveData.checkpoint != undefined
			    &&  saveData.inventory != undefined
			    &&  saveData.costs != undefined
			    &&  saveData.rep != undefined
			    &&  saveData.dress != undefined)
			{
				returndata.errorloading = false;
				returndata.modsmissing = false;

				if (saveData.KinkyDungeonCurrentTick) returndata.KinkyDungeonCurrentTick = saveData.KinkyDungeonCurrentTick;

				// No need for this?
				//if (saveData.flags && saveData.flags.length) returndata.flags = new Map(saveData.flags);
				returndata.level = saveData.level;
				if (Array.from(Object.keys(KinkyDungeonMapParams)).includes(saveData.checkpoint))
					returndata.checkpoint = saveData.checkpoint;
				else returndata.checkpoint = "grv";
				//KinkyDungeonShrineCosts = saveData.costs;
				//KinkyDungeonGoddessRep = saveData.rep;
				returndata.dress = saveData.dress;
				if (saveData.seed) returndata.seed = saveData.seed;
				if (saveData.pcosts) returndata.pcosts = saveData.pcosts;
				//if (saveData.choices) KinkyDungeonSpellChoices = saveData.choices;
				//if (saveData.choices_wep) KinkyDungeonWeaponChoices = saveData.choices_wep;
				//if (saveData.choices_arm) KinkyDungeonArmorChoices = saveData.choices_arm;
				//if (saveData.choices_con) KinkyDungeonConsumableChoices = saveData.choices_con;
				//if (saveData.choices2) KinkyDungeonSpellChoicesToggle = saveData.choices2;
				//if (saveData.buffs) KinkyDungeonPlayerBuffs = saveData.buffs;
				if (saveData.gold != undefined) returndata.gold = saveData.gold;
				//if (saveData.id != undefined) KinkyDungeonEnemyID = saveData.id;
				//if (saveData.idspell != undefined) KinkyDungeonSpellID = saveData.idspell;
				if (saveData.points != undefined) returndata.points = saveData.points;
				//if (saveData.lostitems != undefined) KinkyDungeonLostItems = saveData.lostitems;
				if (saveData.rescued != undefined) returndata.rescued = saveData.rescued;
				if (saveData.aid != undefined) returndata.aid = saveData.aid;
				//if (saveData.KDCurrentWorldSlot) KDCurrentWorldSlot = saveData.KDCurrentWorldSlot;


				// These are ignored for compatibility reasons
				if (saveData.stats) {
					if (saveData.stats.picks != undefined) returndata.picks = saveData.stats.picks;
					if (saveData.stats.keys != undefined) returndata.rkeys = saveData.stats.keys;
					if (saveData.stats.bkeys != undefined) returndata.bkeys = saveData.stats.bkeys;
					if (saveData.stats.mana != undefined) returndata.mana = saveData.stats.mana;
					if (saveData.stats.manapool != undefined) returndata.manapool = saveData.stats.manapool;
					if (saveData.stats.stamina != undefined) returndata.stamina = saveData.stats.stamina;
					if (saveData.stats.willpower != undefined) returndata.willpower = saveData.stats.willpower;
					if (saveData.stats.distraction != undefined) returndata.distraction = saveData.stats.distraction;
					if (saveData.stats.distractionlower != undefined) returndata.distractionlower = saveData.stats.distractionlower;
					//if (saveData.stats.wep != undefined) KDSetWeapon(saveData.stats.wep);
					if (saveData.stats.npp != undefined) returndata.npp = saveData.stats.npp;


				//KDOrigStamina = KinkyDungeonStatStamina*10;
				//KDOrigWill = KinkyDungeonStatWill*10;
				//KDOrigMana = KinkyDungeonStatMana*10;
				//KDOrigDistraction = KinkyDungeonStatDistraction*10;
				} else {
					if (saveData.picks != undefined) returndata.picks = saveData.picks;
					if (saveData.rkeys != undefined) returndata.rkeys = saveData.rkeys;
					if (saveData.bkeys != undefined) returndata.bkeys = saveData.bkeys;
					if (saveData.mana != undefined) returndata.mana = saveData.mana;
					if (saveData.manapool != undefined) returndata.manapool = saveData.manapool;
					if (saveData.stamina != undefined) returndata.stamina = saveData.stamina;
					if (saveData.willpower != undefined) returndata.willpower = saveData.willpower;
					if (saveData.distraction != undefined) returndata.distraction = saveData.distraction;
					if (saveData.distractionlower != undefined) returndata.distractionlower = saveData.distractionlower;
					if (saveData.npp != undefined) returndata.npp = saveData.npp;
				}
				returndata.KDGameData = JSON.parse(JSON.stringify(KDGameDataBase));
				if (saveData.KDGameData != undefined) returndata.KDGameData = Object.assign({}, saveData.KDGameData);


				//InitFacilities();

				//KDEventData = JSON.parse(JSON.stringify(KDEventDataBase));
				//if (saveData.KDEventData != undefined) KDEventData = Object.assign({}, saveData.KDEventData);
				if (saveData.inventoryVariants) returndata.inventoryVariants = saveData.inventoryVariants;
				if (saveData.weaponVariants) returndata.weaponVariants = saveData.weaponVariants;
				if (saveData.consumableVariants) returndata.consumableVariants = saveData.consumableVariants;

				if (saveData.statchoice != undefined) {
					returndata.statchoice = saveData.statchoice;
					let statsMap = new Map(returndata.statchoice);

					returndata.arousalMode = statsMap.get("arousalMode");
					returndata.itemMode = statsMap.get("itemMode") ? 1 : 0;
					returndata.plug = statsMap.get("arousalModePlug");
					returndata.plugFront = statsMap.get("arousalModePlugNoFront");
					returndata.piercing = statsMap.get("arousalModePiercing");
					returndata.random = statsMap.get("randomMode");
					returndata.savemode = statsMap.get("saveMode");
					returndata.hardmode = statsMap.get("hardMode");
					returndata.extrememode = statsMap.get("extremeMode");
					//KinkyDungeonPerksMode = KinkyDungeonStatsChoice.get("perksMode");
					returndata.perksmode = statsMap.get("hardperksMode") ? 2 : (statsMap.get("perksMode") ? 1 : 0);
					returndata.easymode = statsMap.get("norescueMode") ? 2 : (statsMap.get("easyMode") ? 1 : 0);
					returndata.progressionmode = statsMap.get("escapekey") ? "Key" : statsMap.get("escaperandom") ? "Random" : statsMap.get("escapeselect") ? "Select" : "Key";

				}
				//if (saveData.uniqueHits != undefined) KDUniqueBulletHits = new Map(saveData.uniqueHits);




				//if (saveData.faction != undefined) KinkyDungeonFactionRelations = saveData.faction;
				//KDInitFactions();
				//if (typeof KDGameData.TimeSinceLastVibeStart === "number") KDGameData.TimeSinceLastVibeStart = {};
				//if (typeof KDGameData.TimeSinceLastVibeEnd === "number") KDGameData.TimeSinceLastVibeEnd = {};

				//if (!KDGameData.AlreadyOpened) KDGameData.AlreadyOpened = [];

				//if (saveData.perks) {
				//KDUnlockedPerks = saveData.perks;
				//KDLoadPerks();
				//}
				//KDUnlockPerk();
				let inventoryarray = {
					consumable: [],
					restraint: [],
					looserestraint: [],
					weapon: [],
					outfit: []
				};

				for (let item of saveData.inventory) {
					try {
						inventoryarray[item.type].push({
							name: item.name,
							quantity: item.quantity,
							id: item.id
						});
					}
					catch (err) {
						console.log("Error adding item");
						console.log(item);
						returndata.errorloading = true;
					}
				}
				returndata.inventoryarray = inventoryarray;
				returndata.outfitForPreview = [];

				// Now we have all the restraints in inventory, lets try to parse any variants for the paper doll preview.
				inventoryarray.restraint.forEach((item) => {
					let outputname = item.name;
					// Check if the item name is on the inventory variants
					if (returndata.inventoryVariants[item.name]) {
					// Modify the item name in place
						outputname = returndata.inventoryVariants[item.name].template;
					}
					// This should give us an array of base item names we can reference later.
					returndata.outfitForPreview.push(outputname);
				});

				// Find out how many Mistress Keys the save has.
				returndata.mistresskey = 0;
				let mistresskeysobj = returndata.inventoryarray.consumable.find((item) => item.name === "MistressKey");
				if (mistresskeysobj != undefined) {
					returndata.mistresskey = mistresskeysobj.quantity;
				}
				// Find out how many potions the save has.
				returndata.potions = {
					stamina: 0,
					mana: 0,
					will: 0,
					dist: 0
				};
				let potionsstamina = returndata.inventoryarray.consumable.find((item) => item.name === "PotionStamina");
				if (potionsstamina != undefined) {
					returndata.potions.stamina = potionsstamina.quantity;
				}
				let potionsmana = returndata.inventoryarray.consumable.find((item) => item.name === "PotionMana");
				if (potionsmana != undefined) {
					returndata.potions.mana = potionsmana.quantity;
				}
				let potionswill = returndata.inventoryarray.consumable.find((item) => item.name === "PotionWill");
				if (potionswill != undefined) {
					returndata.potions.will = potionswill.quantity;
				}
				let potionsdist = returndata.inventoryarray.consumable.find((item) => item.name === "PotionFrigid");
				if (potionsdist != undefined) {
					returndata.potions.dist = potionsdist.quantity;
				}

				returndata.journey = saveData.KDGameData.Journey;

				returndata.saveStat = saveData.saveStat;

				return returndata;
			}
		}
		else {
			return {
				// @ts-ignore
				invalid: true
			};
		}
	}
	catch (err) {
		console.log(err);
		return {
			// @ts-ignore
			invalid: true
		};
	}
}

function KinkyDungeonStartNewGame(Load: boolean = false) {
	KinkyDungeonSendEvent("beforeNewGame", {Load: Load});
	KinkyDungeonNewGame = 0;
	let cp = KinkyDungeonMapIndex.grv;
	KDUpdateHardMode();
	KinkyDungeonInitialize(1, Load);
	MiniGameKinkyDungeonCheckpoint = "grv";
	KDMapData.Grid = "";
	if (Load) {
		KinkyDungeonLoadGame();
		KDSendEvent('loadGame');
	} else {
		KDSendEvent('newGame');
		KDGameData.RoomType = "JourneyFloor";//KinkyDungeonStatsChoice.get("easyMode") ? "ShopStart" : "JourneyFloor";
		MiniGameKinkyDungeonLevel = 0;
		KDInitializeJourney("");



		if (KDTileToTest) {
			KinkyDungeonMapIndex.grv = cp;
		}

		KDGameData.PlayerName = localStorage.getItem("PlayerName") || "Ada";
		KinkyDungeonPlayer.Name = KDGameData.PlayerName;
	}
	if (!KDMapData.Grid) {
		KinkyDungeonCreateMap(KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)], "JourneyFloor", "", MiniGameKinkyDungeonLevel, false, Load);
		KDInitPerks();
	}
	KinkyDungeonState = "Game";

	if (KinkyDungeonKeybindings) {
		KDCommitKeybindings();
	}
	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");



	KDModsAfterGameStart();
	KinkyDungeonSendEvent("afterNewGame", {Load: Load});
}

function KDUpdatePlugSettings(evalHardMode: boolean) {
	KinkyDungeonStatsChoice.set("arousalMode", KinkyDungeonSexyMode ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePlug", KinkyDungeonSexyPlug ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePlugNoFront", KinkyDungeonSexyPlugFront ? true : undefined);
	KinkyDungeonStatsChoice.set("arousalModePiercing", KinkyDungeonSexyPiercing ? true : undefined);

	KinkyDungeonStatsChoice.set("randomMode", KinkyDungeonRandomMode ? true : undefined);
	KinkyDungeonStatsChoice.set("itemMode", KinkyDungeonItemMode == 1 ? true : undefined);
	KinkyDungeonStatsChoice.set("itemPartialMode", KinkyDungeonItemMode == 2 ? true : undefined);
	KinkyDungeonStatsChoice.set("saveMode", KinkyDungeonSaveMode ? true : undefined);
	KinkyDungeonStatsChoice.set("hardMode", KinkyDungeonHardMode ? true : undefined);
	KinkyDungeonStatsChoice.set("extremeMode", KinkyDungeonExtremeMode ? true : undefined);
	KinkyDungeonStatsChoice.set("hardperksMode", KinkyDungeonPerksMode == 2 ? true : undefined);
	KinkyDungeonStatsChoice.set("vhardperksMode", KinkyDungeonPerksMode == 3 ? true : undefined);
	KinkyDungeonStatsChoice.set("perksMode", KinkyDungeonPerksMode == 1 ? true : undefined);
	KinkyDungeonStatsChoice.set("easyMode", KinkyDungeonEasyMode == 1 ? true : undefined);
	KinkyDungeonStatsChoice.set("norescueMode", KinkyDungeonEasyMode == 2 ? true : undefined);

	KinkyDungeonStatsChoice.set("noperks", KinkyDungeonPerkProgressionMode == 0 ? true : undefined);
	KinkyDungeonStatsChoice.set("perksmandatory", KinkyDungeonPerkProgressionMode >= 2 ? true : undefined);
	KinkyDungeonStatsChoice.set("perksdebuff", KinkyDungeonPerkProgressionMode == 3 ? true : undefined);
	KinkyDungeonStatsChoice.set("perkBondage", KinkyDungeonPerkBondageMode == 2 ? true : undefined);
	KinkyDungeonStatsChoice.set("perkNoBondage", KinkyDungeonPerkBondageMode == 0 ? true : undefined);

	KinkyDungeonStatsChoice.set("hideperkbondage", KinkyDungeonPerkBondageVisMode == 0 ? true : undefined);
	KinkyDungeonStatsChoice.set("partialhideperkbondage", KinkyDungeonPerkBondageVisMode == 1 ? true : undefined);

	KinkyDungeonStatsChoice.set("escapekey", KinkyDungeonProgressionMode == "Key" ? true : undefined);
	KinkyDungeonStatsChoice.set("escaperandom", KinkyDungeonProgressionMode == "Random" ? true : undefined);
	//KinkyDungeonStatsChoice.set("escapeselect", KinkyDungeonProgressionMode == "Select" ? true : undefined);



	if (KDClassReqs[KinkyDungeonClassMode] && !KDClassReqs[KinkyDungeonClassMode]()) {
		// disable the class if we don't meet its requirements
		KinkyDungeonClassMode = "Peasant";
	}
	let classCount = Object.keys(KDClassStart).length;
	for (let i = 0; i < classCount; i++) {
		KinkyDungeonStatsChoice.set("classMode", KinkyDungeonClassMode == Object.keys(KDClassStart)[i] ? true : undefined);
	}

	if (evalHardMode) {
		KDUpdateHardMode();
	}
}

/** Deprecated */
function KDUpdateHardMode() {
	//let points = KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice);
	//KinkyDungeonStatsChoice.set("hardMode", points >= KDHardModeThresh ? true : undefined);
}

let KDHardModeThresh = 10;
let KDAwaitingModLoad = false;

function KinkyDungeonHandleClick() {
	allowMusic = true;
	KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
	if (KDAwaitingModLoad) return true;
	if (KDProcessButtons()) return true;

	if (MouseIn(1885, 25, 90, 90) && (!KDPatched)) {
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

		KDUpdatePlugSettings(true);
	} else if (KinkyDungeonState == "Stats") {

		// Removed and moved to DrawButtonKDEx
	} else if (KinkyDungeonState == "TileEditor") {
		KDHandleTileEditor();
	}  else if (KinkyDungeonState == "Load"){
		if (MouseIn(875, 750, 350, 64)) {
			KinkyDungeonNewGame = 0;
			KDMapData.Grid = "";
			if (!KDToggles.OverrideOutfit)
				KinkyDungeonConfigAppearance = false;
			KinkyDungeonInitialize(1, true);
			MiniGameKinkyDungeonCheckpoint = "grv";
			if (KinkyDungeonLoadGame(ElementValue("saveInputField"))) {
				KDSendEvent('loadGame');
				//KDInitializeJourney(KDJourney);
				if (KDMapData.Grid == "") KinkyDungeonCreateMap(KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)], KDMapData.RoomType || "", KDMapData.MapMod || "", MiniGameKinkyDungeonLevel, false, true);
				ElementRemove("saveInputField");
				KinkyDungeonState = "Game";

				if (KinkyDungeonKeybindings) {
					KDCommitKeybindings();
				}
				KDModsAfterGameStart();
			}
			return true;
		}
	} else if (KinkyDungeonState == "LoadOutfit"){
		let Char = KDSpeakerNPC || KinkyDungeonPlayer;
		if (MouseIn(875, 750, 350, 64) && Char == KinkyDungeonPlayer) {
			KDSaveCodeOutfit(Char);
			CharacterReleaseTotal(Char);
			if (Char == KinkyDungeonPlayer)
				KinkyDungeonDressSet();
			KDRefreshCharacter.set(Char, true);
			KinkyDungeonDressPlayer(Char, true);
			KinkyDungeonState = "Wardrobe";
			KDCanRevertFlag = false;
			//KDWardrobeCallback = null;
			//KDWardrobeRevertCallback = null;

			// Return to menu
			ElementRemove("saveInputField");
			return true;
		} else if (MouseIn(1275, 750, 350, 64)) {
			if (StandalonePatched) {
				KDRestoreOutfit();
				KinkyDungeonState = "Wardrobe";
				KDCanRevertFlag = false;
				KDWardrobeCallback = null;
				KDWardrobeRevertCallback = null;
			} else {
				KinkyDungeonState = "Menu";
			}
			ElementRemove("saveInputField");
			return true;
		}
	} else if (KinkyDungeonState == "Consent") {
		return true;
	} else if (KinkyDungeonState == "Menu" || KinkyDungeonState == "Lose") {


		if (MouseIn(1700, 25, 64, 64)) {
			KDToggles.Sound = !KDToggles.Sound;
			KDSaveToggles();
		}

		if (MouseIn(1100, 150, 100, 100)) {
			TestMode = !TestMode;
		}

		if (MouseIn(1700, 874, 280, 50)) {
			let langIndex = KDLanguages.indexOf(localStorage.getItem("BondageClubLanguage")) || 0;
			let newIndex = (langIndex + 1) % KDLanguages.length;
			localStorage.setItem("BondageClubLanguage", KDLanguages[newIndex]);
			localStorage.setItem("LanguageChange","1")
			KDRestart = true;
			return true;
		}

		if (MouseIn(1850, 930, 135, 64)) {
			KinkyDungeonState = "Credits";
			return true;
		}
		if (MouseIn(1700, 930, 135, 64)) {
			KinkyDungeonState = "Patrons";
			return true;
		}
	} else if (KinkyDungeonState == "Save") {
		if (!KinkyDungeonIsPlayer()) KinkyDungeonState = "Game";
		if (MouseIn(1075, 750, 350, 64)) {
			KinkyDungeonState = "Game";
			ElementRemove("saveDataField");
			return true;
		}
	} else if (KinkyDungeonState == "Game") {
		if (KinkyDungeonIsPlayer()) KinkyDungeonClickGame();
	} else if (KinkyDungeonState == "Keybindings") {
		// Replaced by DrawButtonKDEx
	} else if (KinkyDungeonState == "Toggles") {
		let YYstart = 60;
		let YY = YYstart;
		let YYd = 54;

		YY = YYstart + 50;
		YYd = 80;

		let CombarXX = 550;

		if (KDToggleTab == "Main") {
			if (StandalonePatched) {
				if (MouseIn(CombarXX, YY, 350, 64)) {
					if (MouseX <= CombarXX + 350/2) KDResolutionListIndex = (KDResolutionList.length + KDResolutionListIndex - 1) % KDResolutionList.length;
					else KDResolutionListIndex = (KDResolutionListIndex + 1) % KDResolutionList.length;
					KDResolution = KDResolutionList[KDResolutionListIndex];
					KDResolutionConfirm = true;
					localStorage.setItem("KDResolution", "" + KDResolutionListIndex);
				}
				YY += YYd;
				if (MouseIn(CombarXX, YY, 350, 64)) {
					if (MouseX <= CombarXX + 350/2) KDGammaListIndex = (KDGammaList.length + KDGammaListIndex - 1) % KDGammaList.length;
					else KDGammaListIndex = (KDGammaListIndex + 1) % KDGammaList.length;
					KDGamma = KDGammaList[KDGammaListIndex] || 0;
					localStorage.setItem("KDGamma", "" + KDGammaListIndex);
					kdgammafilterstore[0] = KDGamma;
				}
				YY += YYd*2;
			}

			if (MouseIn(CombarXX, YY, 350, 64)) {
				if (MouseX <= CombarXX + 350/2) KDVibeVolumeListIndex = (KDVibeVolumeList.length + KDVibeVolumeListIndex - 1) % KDVibeVolumeList.length;
				else KDVibeVolumeListIndex = (KDVibeVolumeListIndex + 1) % KDVibeVolumeList.length;
				KDVibeVolume = KDVibeVolumeList[KDVibeVolumeListIndex];
				localStorage.setItem("KDVibeVolume", "" + KDVibeVolumeListIndex);
			}
			YY += YYd;
			if (MouseIn(CombarXX, YY, 350, 64)) {
				if (MouseX <= CombarXX + 350/2) KDMusicVolumeListIndex = (KDMusicVolumeList.length + KDMusicVolumeListIndex - 1) % KDMusicVolumeList.length;
				else KDMusicVolumeListIndex = (KDMusicVolumeListIndex + 1) % KDMusicVolumeList.length;
				KDMusicVolume = KDMusicVolumeList[KDMusicVolumeListIndex];
				localStorage.setItem("KDMusicVolume", "" + KDMusicVolumeListIndex);
			}
			YY += YYd;
			if (MouseIn(CombarXX, YY, 350, 64)) {
				if (MouseX <= CombarXX + 350/2) KDSfxVolumeListIndex = (KDSfxVolumeList.length + KDSfxVolumeListIndex - 1) % KDSfxVolumeList.length;
				else KDSfxVolumeListIndex = (KDSfxVolumeListIndex + 1) % KDSfxVolumeList.length;
				KDSfxVolume = KDSfxVolumeList[KDSfxVolumeListIndex];
				localStorage.setItem("KDSfxVolume", "" + KDSfxVolumeListIndex);
			}
			YY += YYd;
			if (MouseIn(CombarXX, YY, 350, 64)) {
				if (MouseX <= CombarXX + 350/2) KDAnimSpeedListIndex = (KDAnimSpeedList.length + KDAnimSpeedListIndex - 1) % KDAnimSpeedList.length;
				else KDAnimSpeedListIndex = (KDAnimSpeedListIndex + 1) % KDAnimSpeedList.length;
				KDAnimSpeed = KDAnimSpeedList[KDAnimSpeedListIndex] || 0;
				localStorage.setItem("KDAnimSpeed", "" + KDAnimSpeedListIndex);
			}
			YY += YYd;
			if (MouseIn(CombarXX, YY, 350, 64)) {
				if (MouseX <= CombarXX + 350/2) KDSelectedFontListIndex = (KDSelectedFontList.length + KDSelectedFontListIndex - 1) % KDSelectedFontList.length;
				else KDSelectedFontListIndex = (KDSelectedFontListIndex + 1) % KDSelectedFontList.length;
				KDSelectedFont = KDFonts.get(KDSelectedFontList[KDSelectedFontListIndex])?.alias || KDFontName;
				localStorage.setItem("KDSelectedFont", "" + KDSelectedFontListIndex);
			}
			YY += YYd;
			if (MouseIn(CombarXX, YY, 350, 64)) {
				if (MouseX <= CombarXX + 350/2) KDButtonFontListIndex = (KDButtonFontList.length + KDButtonFontListIndex - 1) % KDButtonFontList.length;
				else KDButtonFontListIndex = (KDButtonFontListIndex + 1) % KDButtonFontList.length;
				KDButtonFont = KDFonts.get(KDButtonFontList[KDButtonFontListIndex])?.alias || KDFontName;
				localStorage.setItem("KDButtonFont", "" + KDButtonFontListIndex);
			}
			YY += YYd;
		}


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
 */
function KinkyDungeonClick(): void {
	//
}

function KDClick() {
	//let origState = KinkyDungeonState;
	//let origDrawState = KinkyDungeonDrawState;
	if (KinkyDungeonState == "Logo") {
		//KinkyDungeonState = "Consent";
		//KDLogoStartTime = CommonTime();
		return true;
	}
	else
	if (KinkyDungeonState == "Intro") {
		if (CommonTime() < KDLogoStartTime + KDLogoEndTime2) {
			CommonTime(); // ...
			FillRectKD(kdcanvas, kdpixisprites, "greyfade", {
				Left: 0, Top: 0, Width: 2000,
				Height: 1000,
				Color: "#383F4F", alpha: Math.max(0, 1 - (CommonTime() - KDLogoStartTime) / KDLogoEndTime2), zIndex: 200
			});
		}
		let currentProgress = KDIntroStage < KDIntroProgress.length ? KDIntroProgress[KDIntroStage] : 1;
		if (currentProgress < 3) {
			for (let i = 0; i <= KDIntroStage && i < KDIntroProgress.length; i++) {
				KDIntroProgress[i] = 3;
			}

		}
		KDIntroStage += 1;
		if (KDIntroStage > KDIntroProgress.length) {
			KinkyDungeonState = "Menu";
			// Draw the PC for one
			let Char = (KinkyDungeonState == "LoadOutfit" ? KDSpeakerNPC : null) || KinkyDungeonPlayer;
			DrawCharacter(Char, 0, 0, .01, undefined, undefined, undefined, undefined, undefined, KinkyDungeonPlayer == Char ? KDToggles.FlipPlayer : false);
			KDLogoStartTime = CommonTime();
		}
		else if (KDIntroStage < KDIntroProgress.length) {
			KDIntroProgress[KDIntroStage] = -0.33; // UI delay
		}
		else
			KDIntroProgress[KDIntroStage - 1] = 4; // UI delay
	} else
	if (KinkyDungeonHandleClick()) {
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
	}
	if (KinkyDungeonReplaceConfirm > 0) KinkyDungeonReplaceConfirm -= 1;

	//if (origState != KinkyDungeonState || origDrawState != origDrawState) {
	lastGlobalRefresh = CommonTime() - GlobalRefreshInterval + 100;
	//}
}

/**
 * Handles exit during the kinky dungeon game
 */
function KinkyDungeonExit(): void {
	KinkyDungeonGameKey.removeKeyListener();
	CommonDynamicFunction(MiniGameReturnFunction + "()");

	// Refresh the player character if needed
	if (ArcadeDeviousChallenge && KinkyDungeonPlayerNeedsRefresh) {
		if (ServerPlayerIsInChatRoom()) {
			ChatRoomCharacterUpdate(DefaultPlayer);
		} else {
			CharacterRefresh(DefaultPlayer);
		}
	}

	if (CharacterAppearancePreviousEmoticon) {
		CharacterSetFacialExpression(DefaultPlayer, "Emoticon", CharacterAppearancePreviousEmoticon);
		CharacterAppearancePreviousEmoticon = "";
	}

	if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
		KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
		DialogSetReputation("Gaming", KinkyDungeonRep);
	}

	if (CurrentScreen == "ChatRoom" && KinkyDungeonState != "Menu" && KDLose) {
		let Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(DefaultPlayer), MemberNumber: DefaultPlayer.MemberNumber },
			{ Tag: "KinkyDungeonLevel", Text: String(MiniGameKinkyDungeonLevel)},
		];
		ChatRoomPublishCustomAction("KinkyDungeonLose", false, Dictionary);
	}
	CharacterRefresh(DefaultPlayer, true);

	KinkyDungeonTeardownCrashHandler();
}




/**
 * Handles key presses during the mini game. (Both keyboard and mobile)
 */
function KinkyDungeonKeyDown(): void {
	// n/a
}



let mouseDown = false;
let MouseClicked = false;

window.addEventListener('click', function(event) {
	MouseMove(event);
	if (!CommonIsMobile || !MouseClicked) {
		//let touch = event.touches[0];
		KDClick();
	}
	MouseClicked = true;
	mouseDown = false;
	//CommonClick(event);
});
window.addEventListener('mousedown', function() {
	mouseDown = true;
	if (!CommonIsMobile)
		MouseClicked = true;
});
window.addEventListener('touchstart', function(event) {
	MouseClicked = true;
	if (CommonIsMobile) {
		let touch = event.touches[0];
		if (PIXICanvas) {
			MouseX = Math.round((touch.pageX - PIXICanvas.offsetLeft) * 2000 / PIXICanvas.clientWidth);
			MouseY = Math.round((touch.pageY - PIXICanvas.offsetTop) * 1000 / PIXICanvas.clientHeight);
		} else if (MainCanvas) {
			MouseX = Math.round((touch.pageX - MainCanvas.canvas.offsetLeft) * 2000 / MainCanvas.canvas.clientWidth);
			MouseY = Math.round((touch.pageY - MainCanvas.canvas.offsetTop) * 1000 / MainCanvas.canvas.clientHeight);
		}
		//CommonClick(event);
		CommonTouchList = event.touches;
		mouseDown = true;
		MouseClicked = false;
	}
});

window.addEventListener('touchmove', function(event) {
	let touch = event.touches[0];
	let startedInPlayableArea = KDMouseInPlayableArea();
	if (PIXICanvas) {
		MouseX = Math.round((touch.pageX - PIXICanvas.offsetLeft) * 2000 / PIXICanvas.clientWidth);
		MouseY = Math.round((touch.pageY - PIXICanvas.offsetTop) * 1000 / PIXICanvas.clientHeight);
	} else if (MainCanvas) {
		MouseX = Math.round((touch.pageX - MainCanvas.canvas.offsetLeft) * 2000 / MainCanvas.canvas.clientWidth);
		MouseY = Math.round((touch.pageY - MainCanvas.canvas.offsetTop) * 1000 / MainCanvas.canvas.clientHeight);
	}
	if ((startedInPlayableArea && !KDMouseInPlayableArea() && !KinkyDungeonTargetingSpell) || (!startedInPlayableArea && KDMouseInPlayableArea())) {
		MouseClicked = true; // To prevent KDClick on end
	}
});
window.addEventListener('touchend', function(_event: TouchEvent) {
	if (CommonIsMobile && mouseDown && !MouseClicked) {
		KDClick();
		MouseClicked = true;
	} else MouseClicked = false;
});
window.addEventListener('mouseup', function() {
	mouseDown = false;
	if (!CommonIsMobile)
		MouseClicked = false;
});
window.addEventListener('wheel', function(event) {
	KDMouseWheel(event);
});


/**
 * Game keyboard input handler object. Contains the functions and properties required to handle key press events.
 * @constant
 */
let KinkyDungeonGameKey: any = {
	keyPressed : [false, false, false, false, false, false, false, false, false],

	KEY_UP:		'KeyB',
	KEY_DOWN:	'KeyV',
	KEY_LEFT:	'KeyC',
	KEY_RIGHT:	'KeyX',
	KEY_UPLEFT:	'KeyC',
	KEY_UPRIGHT:	'KeyB',
	KEY_DOWNLEFT:	'KeyX',
	KEY_DOWNRIGHT:	'KeyV',
	KEY_WAIT:	'KeyV',
	KEY_SKIP:	'KeyEnter',

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
		handleEvent : function (event: KeyboardEvent) {
			let code = !(event.code.includes("Digit") || (event.key.length == 1 && event.code != "Space")) ? event.code : event.key.toUpperCase();
			if (!KDLastKeyTime[code] || (!code.includes("Shift") && event.shiftKey)) {
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
						KDConfirmDeleteSave = false;
					}
					break;
			}
		}
	},
	keyUpEvent : {
		handleEvent : function (event: KeyboardEvent) {
			let code = !(event.code.includes("Digit") || (event.key.length == 1 && event.code != "Space")) ? event.code : event.key.toUpperCase();

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
 */
function KinkyDungeonGenerateSaveData(): KinkyDungeonSave {
	let save = {} as KinkyDungeonSave;
	save.version = TextGet("KDVersionStr");
	save.level = MiniGameKinkyDungeonLevel;
	save.checkpoint = MiniGameKinkyDungeonCheckpoint;
	save.rep = KinkyDungeonGoddessRep;
	save.costs = KinkyDungeonShrineCosts;
	save.pcosts = KinkyDungeonPenanceCosts;
	save.dress = KinkyDungeonCurrentDress;
	save.gold = KinkyDungeonGold;
	save.points = KinkyDungeonSpellPoints;
	save.id = KinkyDungeonEnemyID;
	save.idspell = KinkyDungeonSpellID;
	save.choices = KinkyDungeonSpellChoices;
	save.choices_wep = KinkyDungeonWeaponChoices;
	save.choices_arm = KinkyDungeonArmorChoices;
	save.choices_con = KinkyDungeonConsumableChoices;
	save.choices2 = KinkyDungeonSpellChoicesToggle;
	save.buffs = KinkyDungeonPlayerBuffs;
	save.lostitems = KinkyDungeonLostItems;
	save.rescued = KinkyDungeonRescued;
	save.aid = KinkyDungeonAid;
	save.seed = KinkyDungeonSeed;
	save.statchoice = Array.from(KinkyDungeonStatsChoice);
	//save.mapIndex = KinkyDungeonMapIndex;

	save.flags = Array.from(KinkyDungeonFlags);
	save.KDCommanderRoles = Array.from(KDCommanderRoles);
	save.faction = KinkyDungeonFactionRelations;
	save.perks = KDUnlockedPerks;
	save.inventoryVariants = KinkyDungeonRestraintVariants;
	save.weaponVariants = KinkyDungeonWeaponVariants;
	save.consumableVariants = KinkyDungeonConsumableVariants;
	save.uniqueHits = Array.from(KDUniqueBulletHits);

	save.KinkyDungeonCurrentTick = KinkyDungeonCurrentTick;

	save.saveStat = {
		appearance: JSON.parse(JSON.stringify(KinkyDungeonPlayer.Appearance)),
		default: JSON.parse(JSON.stringify(KDGetDressList().Default)),
		poses: JSON.parse(JSON.stringify(KDCurrentModels.get(KinkyDungeonPlayer).Poses)),
		Palette: KinkyDungeonPlayer.Palette,

		outfit: KDGameData.Outfit,
		name: KDGameData.PlayerName,
		level: MiniGameKinkyDungeonLevel,
		sp: Math.round(KinkyDungeonStatStamina * 10) + '/' + KinkyDungeonStatStaminaMax * 10,
		mp: Math.round(KinkyDungeonStatMana * 10) + '/' + KinkyDungeonStatManaMax * 10,
		wp: Math.round(KinkyDungeonStatWill * 10) + '/' + KinkyDungeonStatWillMax * 10,
		dp: Math.round(KinkyDungeonStatDistraction * 10) + '/' + KinkyDungeonStatDistractionMax * 10,
	};

	let spells = [];
	let newInv: item[] = [];

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
	KDMapData.RandomPathablePoints = {};
	save.KDMapData = KDMapData;
	KinkyDungeonGenNavMap();
	save.KDEventData = KDEventData;
	save.KDWorldMap = KDWorldMap;
	save.KDCurrentWorldSlot = KDCurrentWorldSlot;
	save.KinkyDungeonPlayerEntity = KinkyDungeonPlayerEntity;

	save.KDPersonalAlt = JSON.stringify(KDPersonalAlt);
	save.KDPersistentNPCs = JSON.stringify(KDPersistentNPCs);
	save.KDDeletedIDs = JSON.stringify(KDDeletedIDs);


	save.picks = KinkyDungeonItemCount("Pick");
	save.rkeys = KinkyDungeonItemCount("RedKey");
	save.bkeys = KinkyDungeonItemCount("BlueKey");
	save.mana = KinkyDungeonStatMana;
	save.manapool = KinkyDungeonStatManaPool;
	save.stamina = KinkyDungeonStatStamina;
	save.willpower = KinkyDungeonStatWill;
	save.distraction = KinkyDungeonStatDistraction;
	save.distractionlower = KinkyDungeonStatDistractionLower;
	save.wep = KinkyDungeonPlayerWeapon;
	save.npp = KinkyDungeonNewGame;
	save.diff = KinkyDungeonStatsChoice.get("randomMode");

	return save;
}

let KDSaveQueue: KinkyDungeonSave[] = [];
let KDSaveBusy = false;

function KinkyDungeonSaveGame(ToString: boolean = false): KinkyDungeonSave {
	// Make a deep copy
	let save = JSON.parse(JSON.stringify(KinkyDungeonGenerateSaveData()));

	if (!ToString) {
		KDSaveQueue.push(save);
	}

	return save;
}

async function KinkyDungeonCompressSave(save: any) {
	return LZString.compressToBase64(JSON.stringify(save));
}

// N4IgNgpgbhYgXARgDQgMYAsJoNYAcB7ASwDsAXBABlQCcI8FQBxDAgZwvgFoBWakAAo0ibAiQg0EvfgBkIAQzJZJ8fgFkIZeXFWoASgTwQqqAOpEwO/gFFIAWwjk2JkAGExAKwCudFwElLLzYiMSoAX1Q0djJneGAIkAIaACNYgG0AXUisDnSskAATOjZYkAARCAAzeS8wClQAcwIwApdCUhiEAGZUSBgwWNBbCAcnBBQ3Tx9jJFQAsCCQknGEtiNLPNRSGHIkgE8ENNAokjYvO3lkyEYQEnkHBEECMiW1eTuQBIBHL3eXsgOSAixzEZwuVxmoDuD3gTxeYgAylo7KR5J9UD8/kQAStkCDTudLtc4rd7jM4UsAGLCBpEVrfX7kbGAxDAkAAdwUhGWJOh5IA0iQiJVjGE2cUyDR5B0bnzHmUvGgyAAVeRGOQNZwJF4NDBkcQlca9Ai4R7o0ASqUy3lk+WKlVqiCUiCaNTnOwHbVEXX6iCG2bgE04M1hDJhIA=
function KinkyDungeonLoadGame(String: string = "") {
	localStorage.setItem('KDLastSaveSlot', "" + KDSaveSlot);
	KinkyDungeonSendEvent("beforeLoadGame", {});
	let str = String ? DecompressB64(String.trim()) : (localStorage.getItem('KinkyDungeonSave') ? DecompressB64(localStorage.getItem('KinkyDungeonSave')) : "");
	if (str) {
		let saveData = JSON.parse(str);
		if (    saveData
		    &&  saveData.spells != undefined
		    &&  saveData.level != undefined
		    &&  saveData.checkpoint != undefined
		    &&  saveData.inventory != undefined
		    &&  saveData.costs != undefined
		    &&  saveData.rep != undefined
		    &&  saveData.dress != undefined)
		{
			if (!KDToggles.OverrideOutfit && saveData.saveStat) {
				if (saveData.saveStat.default) {
					KDGetDressList().Default = saveData.saveStat.default;
				}
				KinkyDungeonPlayer.Palette = saveData.saveStat.Palette;
			}

			KDPathfindingCacheFails = 0;
			KDPathfindingCacheHits = 0;
			KDPathCache = new Map();
			KDThoughtBubbles = new Map();

			KDMapData.Entities = [];
			KDCommanderRoles = new Map();
			KDUpdateEnemyCache = true;
			if (saveData.flags && saveData.flags.length) KinkyDungeonFlags = new Map(saveData.flags);
			MiniGameKinkyDungeonLevel = saveData.level;
			if (Array.from(Object.keys(KinkyDungeonMapParams)).includes(saveData.checkpoint))
				MiniGameKinkyDungeonCheckpoint = saveData.checkpoint;
			else MiniGameKinkyDungeonCheckpoint = "grv";
			KinkyDungeonShrineCosts = saveData.costs;
			KinkyDungeonGoddessRep = saveData.rep;
			KinkyDungeonCurrentDress = saveData.dress;
			KDGameData.KinkyDungeonSpawnJailers = 0;
			KDGameData.KinkyDungeonSpawnJailersMax = 0;
			if (saveData.KinkyDungeonCurrentTick) KinkyDungeonCurrentTick = saveData.KinkyDungeonCurrentTick;
			if (saveData.seed) KDsetSeed(saveData.seed);
			if (saveData.pcosts) KinkyDungeonPenanceCosts = saveData.pcosts;
			if (saveData.choices) KinkyDungeonSpellChoices = saveData.choices;
			if (saveData.choices_wep) KinkyDungeonWeaponChoices = saveData.choices_wep;
			if (saveData.choices_arm) KinkyDungeonArmorChoices = saveData.choices_arm;
			if (saveData.choices_con) KinkyDungeonConsumableChoices = saveData.choices_con;
			if (saveData.choices2) KinkyDungeonSpellChoicesToggle = saveData.choices2;
			if (saveData.buffs) KinkyDungeonPlayerBuffs = saveData.buffs;
			if (saveData.gold != undefined) KinkyDungeonGold = saveData.gold;
			if (saveData.id != undefined) KinkyDungeonEnemyID = saveData.id;
			if (saveData.idspell != undefined) KinkyDungeonSpellID = saveData.idspell;
			if (saveData.points != undefined) KinkyDungeonSpellPoints = saveData.points;
			if (saveData.lostitems != undefined) KinkyDungeonLostItems = saveData.lostitems;
			if (saveData.rescued != undefined) KinkyDungeonRescued = saveData.rescued;
			if (saveData.aid != undefined) KinkyDungeonAid = saveData.aid;
			if (saveData.KDCurrentWorldSlot) KDCurrentWorldSlot = saveData.KDCurrentWorldSlot;

			KDOrigStamina = KinkyDungeonStatStamina*10;
			KDOrigWill = KinkyDungeonStatWill*10;
			KDOrigMana = KinkyDungeonStatMana*10;
			KDOrigDistraction = KinkyDungeonStatDistraction*10;
			KDGameData = JSON.parse(JSON.stringify(KDGameDataBase));
			if (saveData.KDGameData != undefined) KDGameData = Object.assign({}, saveData.KDGameData);

			if (!KDGameData.Containers) KDGameData.Containers = {};

			InitFacilities();

			KDEventData = JSON.parse(JSON.stringify(KDEventDataBase));
			if (saveData.KDEventData != undefined) KDEventData = Object.assign({}, saveData.KDEventData);
			if (saveData.inventoryVariants) KinkyDungeonRestraintVariants = saveData.inventoryVariants;
			if (saveData.weaponVariants) KinkyDungeonWeaponVariants = saveData.weaponVariants;
			if (saveData.consumableVariants) KinkyDungeonConsumableVariants = saveData.consumableVariants;

			if (saveData.statchoice != undefined) KinkyDungeonStatsChoice = new Map(saveData.statchoice);
			if (saveData.uniqueHits != undefined) KDUniqueBulletHits = new Map(saveData.uniqueHits);


			KinkyDungeonSexyMode = KinkyDungeonStatsChoice.get("arousalMode");
			KinkyDungeonItemMode = KinkyDungeonStatsChoice.get("itemMode") ? 1 : 0;
			KinkyDungeonSexyPlug = KinkyDungeonStatsChoice.get("arousalModePlug");
			KinkyDungeonSexyPlugFront = KinkyDungeonStatsChoice.get("arousalModePlugNoFront");
			KinkyDungeonSexyPiercing = KinkyDungeonStatsChoice.get("arousalModePiercing");
			KinkyDungeonRandomMode = KinkyDungeonStatsChoice.get("randomMode");
			KinkyDungeonSaveMode = KinkyDungeonStatsChoice.get("saveMode");
			KinkyDungeonHardMode = KinkyDungeonStatsChoice.get("hardMode");
			KinkyDungeonExtremeMode = KinkyDungeonStatsChoice.get("extremeMode");
			//KinkyDungeonPerksMode = KinkyDungeonStatsChoice.get("perksMode");
			KinkyDungeonPerksMode = KinkyDungeonStatsChoice.get("hardperksMode") ? 2 : (KinkyDungeonStatsChoice.get("perksMode") ? 1 : 0);
			KinkyDungeonEasyMode = KinkyDungeonStatsChoice.get("norescueMode") ? 2 : (KinkyDungeonStatsChoice.get("easyMode") ? 1 : 0);
			KinkyDungeonProgressionMode = KinkyDungeonStatsChoice.get("escapekey") ? "Key" : KinkyDungeonStatsChoice.get("escaperandom") ? "Random" : KinkyDungeonStatsChoice.get("escapeselect") ? "Select" : "Key";


			if (!KDToggles.OverrideOutfit && saveData.saveStat) {
				if (saveData.saveStat.poses || saveData.saveStat.appearance || saveData.saveStat.default) {
					KinkyDungeonPlayer.Appearance = JSON.parse(JSON.stringify(saveData.saveStat.appearance));
					KDGetDressList().Default = saveData.saveStat.default;
					KDCurrentModels.get(KinkyDungeonPlayer).Poses = saveData.saveStat.poses;
					KinkyDungeonPlayer.Palette = saveData.saveStat.Palette;
					UpdateModels(KinkyDungeonPlayer);
				}
			}
			if (saveData.stats) {
				if (saveData.stats.mana != undefined) KinkyDungeonStatMana = saveData.stats.mana;
				if (saveData.stats.manapool != undefined) KinkyDungeonStatManaPool = saveData.stats.manapool;
				if (saveData.stats.stamina != undefined) KinkyDungeonStatStamina = saveData.stats.stamina;
				if (saveData.stats.willpower != undefined) KinkyDungeonStatWill = saveData.stats.willpower;
				if (saveData.stats.distraction != undefined) KinkyDungeonStatDistraction = saveData.stats.distraction;
				if (saveData.stats.distractionlower != undefined) KinkyDungeonStatDistractionLower = saveData.stats.distractionlower;
				if (saveData.stats.wep != undefined) KDSetWeapon(saveData.stats.wep);
				if (saveData.stats.npp != undefined) KinkyDungeonNewGame = saveData.stats.npp;
			} else {

				if (saveData.mana != undefined) KinkyDungeonStatMana = saveData.mana;
				if (saveData.manapool != undefined) KinkyDungeonStatManaPool = saveData.manapool;
				if (saveData.stamina != undefined) KinkyDungeonStatStamina = saveData.stamina;
				if (saveData.willpower != undefined) KinkyDungeonStatWill = saveData.willpower;
				if (saveData.distraction != undefined) KinkyDungeonStatDistraction = saveData.distraction;
				if (saveData.distractionlower != undefined) KinkyDungeonStatDistractionLower = saveData.distractionlower;
				if (saveData.wep != undefined) KDSetWeapon(saveData.wep);
				if (saveData.npp != undefined) KinkyDungeonNewGame = saveData.npp;
			}

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
						KinkyDungeonAddRestraint(restraint, 0, true, item.lock, undefined, undefined, undefined, undefined, item.faction, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true); // Add the item
						let createdrestraint = KinkyDungeonGetRestraintItem(restraint.Group);
						if (createdrestraint) createdrestraint.lock = item.lock; // Lock if applicable
						if (createdrestraint) createdrestraint.events = item.events; // events if applicable
						if (item.dynamicLink) {
							let host = item;
							let link = item.dynamicLink;
							while (link) {
								if (!KinkyDungeonGetRestraintByName(link.name)) {
									//host = link; do not chjange the host
									link = link.dynamicLink;
									host.dynamicLink = link;
								} else {
									host = link;
									link = link.dynamicLink;
								}

							}
						}
						KinkyDungeonInventoryAdd(item);
					}
				} else {
					if (KDConsumable(item) != undefined || KDWeapon(item) != undefined || KDRestraint(item) != undefined || KDOutfit(item) != undefined)
						KinkyDungeonInventoryAdd(item);
				}
				KDUpdateItemEventCache = true;
			}

			if (saveData.stats) {
				if (saveData.stats.picks != undefined && !KinkyDungeonItemCount("Pick"))
					KDAddConsumable("Pick", saveData.stats.picks);
				if (saveData.stats.keys != undefined && !KinkyDungeonItemCount("RedKey"))
					KDAddConsumable("RedKey", saveData.stats.keys);
				if (saveData.stats.bkeys != undefined && !KinkyDungeonItemCount("BlueKey"))
					KDAddConsumable("BlueKey", saveData.stats.bkeys);
			} else {

				if (saveData.picks != undefined && !KinkyDungeonItemCount("Pick"))
					KDAddConsumable("Pick", saveData.picks);
				if (saveData.rkeys != undefined && !KinkyDungeonItemCount("RedKey"))
					KDAddConsumable("RedKey", saveData.rkeys);
				if (saveData.bkeys != undefined && !KinkyDungeonItemCount("BlueKey"))
					KDAddConsumable("BlueKey", saveData.bkeys);
			}

			KinkyDungeonSpells = [];
			KDRefreshSpellCache = true;
			for (let spell of saveData.spells) {
				let sp = KinkyDungeonFindSpell(spell);
				if (sp) KDPushSpell(sp);
			}

			if (KDHasSpell("BattleRhythm") && !KDHasSpell("FighterOffhand")) {
				let sp = KinkyDungeonFindSpell("FighterOffhand");
				if (sp) KDPushSpell(sp);
			}

			if (saveData.KDWorldMap) KDWorldMap = JSON.parse(JSON.stringify(saveData.KDWorldMap));
			if (saveData.KDPersistentNPCs) KDPersistentNPCs = JSON.parse(saveData.KDPersistentNPCs);
			if (saveData.KDDeletedIDs) KDDeletedIDs = JSON.parse(saveData.KDDeletedIDs);
			if (saveData.KDPersonalAlt) KDPersonalAlt = JSON.parse(saveData.KDPersonalAlt);

			if (saveData.KinkyDungeonPlayerEntity) KinkyDungeonPlayerEntity = saveData.KinkyDungeonPlayerEntity;
			if (saveData.KDMapData) {
				KDMapData = Object.assign(KDDefaultMapData("", ""), JSON.parse(JSON.stringify(saveData.KDMapData)));
				if (!KDMapData.Traffic || KDMapData.Traffic.length == 0) KDGenerateBaseTraffic();
				KinkyDungeonGenNavMap();
			} else {
				if (saveData.KinkyDungeonEffectTiles) KDMapData.EffectTiles = saveData.KinkyDungeonEffectTiles;
				if (saveData.KinkyDungeonTiles) KDMapData.Tiles = saveData.KinkyDungeonTiles;
				if (saveData.KinkyDungeonTilesSkin) KDMapData.TilesSkin = saveData.KinkyDungeonTilesSkin;
				if (saveData.KinkyDungeonTilesMemory) KDMapData.TilesMemory = saveData.KinkyDungeonTilesMemory;
				if (saveData.KinkyDungeonRandomPathablePoints) KDMapData.RandomPathablePoints = saveData.KinkyDungeonRandomPathablePoints;
				if (saveData.KinkyDungeonRandomPathablePoints) RandomPathList = Object.values(saveData.KinkyDungeonRandomPathablePoints);
				if (saveData.KinkyDungeonEntities) KDMapData.Entities = saveData.KinkyDungeonEntities;
				if (saveData.KinkyDungeonBullets) KDMapData.Bullets = saveData.KinkyDungeonBullets;
				if (saveData.KinkyDungeonStartPosition) KDMapData.StartPosition = saveData.KinkyDungeonStartPosition;
				if (saveData.KinkyDungeonEndPosition) KDMapData.EndPosition = saveData.KinkyDungeonEndPosition;
				if (saveData.KinkyDungeonGrid) {
					KDMapData.Grid = saveData.KinkyDungeonGrid;
					KDMapData.GridWidth = saveData.KinkyDungeonGridWidth;
					KDMapData.GridHeight = saveData.KinkyDungeonGridHeight;
				}
				KinkyDungeonResetFog();
				if (saveData.KinkyDungeonFogGrid) KDMapData.FogGrid = saveData.KinkyDungeonFogGrid;
			}
			KinkyDungeonLeashingEnemy();
			KinkyDungeonJailGuard();
			if (saveData.KDCommanderRoles) KDCommanderRoles = new Map(saveData.KDCommanderRoles);

			KDUpdateEnemyCache = true;

			// bandaid
			for (let enemy of KDMapData.Entities) {
				if (enemy.buffs) {
					for (let b of Object.keys(enemy.buffs)) {
						if (!enemy.buffs[b]) {
							delete enemy.buffs[b];
						}
					}
				}
			}

			if (typeof KDGameData.PreviousWeapon == 'string') KDGameData.PreviousWeapon = ["Unarmed", "Unarmed", "Unarmed", "Unarmed"];

			KinkyDungeonSetMaxStats();
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KDNaked = false;
			KinkyDungeonDressPlayer();
			KDRefresh = true;
			KDUpdateEnemyCache = true;
			if (KDGameData.Journey)
				KDJourney = KDGameData.Journey;
			//if (saveData.mapIndex && !saveData.mapIndex.length) KinkyDungeonMapIndex = saveData.mapIndex;

			if (!KDGameData.SlowMoveTurns) KDGameData.SlowMoveTurns = 0;
			if (String)
				localStorage.setItem('KinkyDungeonSave', String);

			if (saveData.KDGameData && saveData.KDGameData.LastMapSeed) KDsetSeed(saveData.KDGameData.LastMapSeed);

			if (!KinkyDungeonMapIndex.grv || !KDGameData.JourneyProgression)
				KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);

			if (!KDGameData.JourneyMap) {
				KDInitJourneyMap(MiniGameKinkyDungeonLevel);
			}

			if (saveData.KDMapData || saveData.KinkyDungeonGrid) {
				KDUpdateVision();
			}
			KinkyDungeonFloaters = [];
			KDFixNeeds();
			KDSortCollection();
			KinkyDungeonAdvanceTime(0, true, true);
			KinkyDungeonSendEvent("afterLoadGame", {});
			return true;
		}
	}
	return false;
}

let KinkyDungeonSeed = (Math.random() * 4294967296).toString();
let KDRandom = sfc32(xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)(), xmur3(KinkyDungeonSeed)());

/**
 * @param {boolean} Native Decides whether or not to use native KDRandom to randomize
 */
function KDrandomizeSeed(Native: boolean) {
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

function KDsetSeed(str: string) {
	KinkyDungeonSeed = str;
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
function xmur3(str: string) {
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
function sfc32(a: number, b: number, c: number, d: number) {
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

let kdSoundCache: Map<string, HTMLAudioElement> = new Map();

function AudioPlayInstantSoundKD(Path: string, volume?: number) {
	if (!KDSoundEnabled()) return false;
	const vol = KDSfxVolume * (typeof volume != 'undefined' ? volume : 1);
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
function hashCode(s: string) {
	let h = 0;
	for(let i = 0; i < s.length; i++)
		h = Math.imul(31, h) + s.charCodeAt(i) | 0;
	return h;
}

function TextGetKD(Text: string) {
	if (TextGet(Text))
		return TextGet(Text);
	else return KDLoadingTextKeys[Text] || "Missing text";
}


function KinkyDungeonCheckPlayerRefresh() {
	if (!ArcadeDeviousChallenge || CommonTime() < KinkyDungeonNextRefreshCheck) {
		return;
	}

	// We've exceeded the refresh check time - check again in 1 second
	KinkyDungeonNextRefreshCheck = CommonTime() + 1000;

	if (!KinkyDungeonPlayerNeedsRefresh) {
		return;
	}

	KinkyDungeonPlayerNeedsRefresh = false;

	if (ServerPlayerIsInChatRoom()) {
		ChatRoomCharacterUpdate(DefaultPlayer);
	} else {
		CharacterRefresh(DefaultPlayer);
	}
}

function CJKcheck(text: string, p: number = 0, o: string = "search"): RegExpMatchArray | boolean
{
	if (o == "search")
	{
		//Find all English characters and space
		if (p == 1){ return text.match(/[a-zA-Z0-9\s\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+/g);}
		//Find all characters except English characters
		if (p == 2){ return text.match(/^[a-zA-Z\s\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]+(<3)?$/g);}
		//Find all CJK Symbols and Punctuation
		if (p == 3){ return text.match(/[\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\uff1f\uff01\uffe5\u3000-\u303f]+/g);}
		//Find all CJK characters
		else { return text.match(/[\u3000-\u9fff\ue000-\uf8ff\uff01-\uffdc\uac00-\ud7af]+/g);}
	} else if (o == "test")
	{
		//Check CJK Symbols and Punctuation
		if (p == 3){ return (/[\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\uff1f\uff01\uffe5\u3000-\u303f]+/g).test(text);}
	}
}

function KinkyDungeonGetCanvas(id: string): HTMLCanvasElement {
	const canvas = document.getElementById(id);
	if (!(canvas instanceof HTMLCanvasElement)) throw new Error(`Not a canvas element: ${canvas.id}`);
	return canvas;
}



function KDDrawGameSetupTabs(_xOffset: number = 0) {
	if (KDGameData.PlayerName) {
		DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, "#ffffff", KDTextGray0, 32, "center", 20);
	}
	DrawButtonKDEx("TabDiff", (_b) => {
		KinkyDungeonState = "Diff";
		return true;
	}, true, 500, 10, 740, 40, TextGet("KDDiffTab_Diff"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonState != "Diff", KDButtonColor);
	DrawButtonKDEx("TabChallenge", (_b) => {
		KinkyDungeonState = "Challenge";
		return true;
	}, true, 1250, 10, 740, 40, TextGet("KDDiffTab_Challenge"), "#ffffff", undefined, undefined, undefined,
	KinkyDungeonState != "Challenge", KDButtonColor);


	DrawButtonKDEx("backButton", (_b) => {
		KinkyDungeonState = "Menu";
		return true;
	}, true, 1075, 900, 350, 64, TextGet("KinkyDungeonLoadBack"), "#ffffff", "", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
		hotkeyPress: KinkyDungeonKeySkip[0],
	});
}



function DecompressB64(str: string): string {
	if (!str || !str.trim) return str;
	return LZString.decompressFromBase64("".concat(...str.trim().split('\n')));
}

let KDToggleTab = "Main";

function KDDrawToggleTabs(xOffset: number) {
	let w = 1990 - xOffset;
	FillRectKD(kdcanvas, kdpixisprites, "maintogglebg", {
		Left: xOffset,
		Top: canvasOffsetY_ui - 150,
		Width: w,
		Height: 970,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.3
	});
	DrawRectKD(kdcanvas, kdpixisprites, "maintogglebg2", {
		Left: xOffset,
		Top: canvasOffsetY_ui - 150,
		Width: w,
		Height: 970,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});
	let list = KDToggleGroups;
	let II = 0;
	for (let tab of list) {
		DrawButtonKDEx("TabTog" + tab, (_b) => {
			KDToggleTab = tab;
			return true;
		}, true, xOffset + II * w / list.length, 10, w / list.length - 4, 40,
		TextGet("KDToggleTab" + tab), "#ffffff", undefined, undefined, undefined,
		KDToggleTab != tab, KDButtonColor);
		II++;
	}
}

function KinkyDungeonMultiplayerUpdate(_delay) {
	// Do nothing. Placeholder for when/if there is ever any MP functionality
}

let saveFile = null;
let KDSAVEEXTENSION = '.kdsave';
let KDOUTFITEXTENSION = '.kdoutfit';
let KDOUTFITBACKUP = '.kdcharbackup';
let KDSaveName = "";

function KDLoadSave(files) {
	for (let f of files) {
		if (f && f.name) {
			if (f.name.endsWith(KDSAVEEXTENSION) || f.name.endsWith('.txt')) {
				let str = "";
				KDSaveName = f.name;
				try {
					const reader = new FileReader();
					reader.addEventListener('load', (event) => {
						str = event.target.result.toString();
						ElementValue("saveInputField",
							str
						);
					});
					reader.readAsText(f);
				} catch (err) {
					console.log (err);
				}
				return;
			}
		}
	}
}


function downloadFile(filename: string, text: string) {
	const blob = new Blob([text], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.textContent = 'Download Save';

	// Trigger a click event on the link to prompt the user to download
	const clickEvent = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true,
	});
	link.dispatchEvent(clickEvent);

	// Clean up the object URL after download
	URL.revokeObjectURL(url);
}

function KDChangeZoom(change: number) {
	KDZoomIndex += change;
	if (KDZoomIndex < 0) KDZoomIndex = 0;
	else if (KDZoomIndex > KDZoomLevels.length - 1) KDZoomIndex = KDZoomLevels.length - 1;

	KinkyDungeonUpdateLightGrid = true;
	KDRedrawFog = 2;
	setTimeout(() => {KinkyDungeonAdvanceTime(0);}, 100);

	localStorage.setItem('zoomLvl', KDZoomIndex + "");


	KinkyDungeonSendActionMessage(10, TextGet("ZoomSet").replace("PCNT",
		"" + Math.round(100*(72 + KDZoomLevels[KDZoomIndex] * 12)/72)
	), "#ffffff", 1);
}

let KDMinimized = false;
let KDFocusSounds = setInterval(() => {
    if (document.hasFocus()) {
		KDMinimized = false;
    }
    else {
        KDMinimized = true;
    }
}, 100);

function KDSoundEnabled() {
	return KDToggles.Sound && (!KDToggles.SoundOffWhenMin || !KDMinimized);
}