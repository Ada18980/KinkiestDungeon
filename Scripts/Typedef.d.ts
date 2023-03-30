//#region Common

interface String {
	replaceAt(index: number, character: string): string;
}

declare function parseInt(s: string | number, radix?: number): number;

type MemoizedFunction<T extends Function> = T & {
	/** Clears the cache of the memoized function */
	clearCache(): void;
};

// GL shim
interface WebGL2RenderingContext {
	program?: WebGLProgram;
	programFull?: WebGLProgram;
	programHalf?: WebGLProgram;
	textureCache?: Map<string, any>;
	maskCache?: Map<string, any>;
}

interface WebGLProgram {
	u_alpha?: WebGLUniformLocation;
	u_color?: WebGLUniformLocation;
	a_position?: number;
	a_texcoord?: number;
	u_matrix?: WebGLUniformLocation;
	u_texture?: WebGLUniformLocation;
	u_alpha_texture?: WebGLUniformLocation;
	position_buffer?: WebGLBuffer;
	texcoord_buffer?: WebGLBuffer;
}

interface HTMLCanvasElement {
	GL?: WebGL2RenderingContext;
}

interface HTMLImageElement {
	errorcount?: number;
}

interface HTMLElement {
	setAttribute(qualifiedName: string, value: string | number): void;
}

interface RGBColor {
	r: number;
	g: number;
	b: number;
}

interface RGBAColor extends RGBColor {
	a: number;
}

type RectTuple = [number, number, number, number];

//#endregion

//#region Enums
type ExtendedArchetype = "modular" | "typed" | "vibrating" | "variableheight";

type TypedItemChatSetting = "toOnly" | "fromTo" | "silent";
type ModularItemChatSetting = "perModule" | "perOption";
type CommonChatTags =
	| "SourceCharacter"
	| "DestinationCharacter"
	| "DestinationCharacterName"
	| "TargetCharacter"
	| "TargetCharacterName"
	| "AssetName";

type NotificationAudioType = 0 | 1 | 2;
type NotificationAlertType = 0 | 1 | 3 | 2;

type DialogSortOrder = | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type CharacterType = "online" | "npc" | "simple";

type VibratorIntensity = -1 | 0 | 1 | 2 | 3;

type VibratorMode = "Off" | "Low" | "Medium" | "High" | "Maximum" | "Random" | "Escalate" | "Tease" | "Deny" | "Edge";

type VibratorModeSet = "Standard" | "Advanced";

type VibratorModeState = "Default" | "Deny" | "Orgasm" | "Rest";

type VibratorRemoteAvailability = "Available" | "NoRemote" | "NoRemoteOwnerRuleActive" | "NoLoversRemote" | "RemotesBlocked" | "CannotInteract" | "NoAccess" | "InvalidItem";

type EffectName =
	"Freeze" | "Prone" | "Block" | "Mounted" | "KneelFreeze" | "ForceKneel" | "BlockKneel" |

	"CuffedFeet" | "CuffedLegs" | "CuffedArms" | "IsChained" | "FixedHead" |

	"Shackled" | "Tethered" | "Enclose" | "OneWayEnclose" | "OnBed" | "Lifted" | "Suspended" |

	"Slow" | "FillVulva" | "IsPlugged" |

	"Egged" | "Vibrating" |

	"Edged" | "DenialMode" | "RuinOrgasms" |

	"Remote" | "UseRemote" | "BlockRemotes" |

	"Lock" | "NotSelfPickable" |

	"Chaste" | "BreastChaste" | "ButtChaste" |

	"Leash" | "CrotchRope" |

	"ReceiveShock" | "TriggerShock" |

	"OpenPermission" | "OpenPermissionArm" | "OpenPermissionLeg" | "OpenPermissionChastity" |

	"BlockMouth" | "OpenMouth" |

	"GagVeryLight" | "GagEasy" | "GagLight" | "GagNormal" | "GagMedium" | "GagHeavy" | "GagVeryHeavy" | "GagTotal" | "GagTotal2" |

	"BlindLight" | "BlindNormal" | "BlindHeavy" | "BlindTotal" |
	"BlurLight" | "BlurNormal" | "BlurHeavy" | "BlurTotal" |
	"DeafLight" | "DeafNormal" | "DeafHeavy" | "DeafTotal" |

	"VR" | "VRAvatars" | "KinkyDungeonParty" |

	"LightBall" |

	"RegressedTalk" |

	"HideRestraints" |

	"Unlock-MetalPadlock" | "Unlock-OwnerPadlock" | "Unlock-OwnerTimerPadlock" |
	"Unlock-LoversPadlock" | "Unlock-LoversTimerPadlock" |
	"Unlock-MistressPadlock" | "Unlock-MistressTimerPadlock" |
	"Unlock-PandoraPadlock" | "Unlock-MetalCuffs" | "Unlock-" |

	"ProtrudingMouth" | "Wiggling" |
	""
	;

type AssetGroupItemName =
	'ItemAddon' | 'ItemArms' | 'ItemBoots' | 'ItemBreast' | 'ItemButt' |
	'ItemDevices' | 'ItemEars' | 'ItemFeet' | 'ItemHands' | 'ItemHead' |
	'ItemHood' | 'ItemLegs' | 'ItemMisc' | 'ItemMouth' | 'ItemMouth2' |
	'ItemMouth3' | 'ItemNeck' | 'ItemNeckAccessories' | 'ItemNeckRestraints' |
	'ItemNipples' | 'ItemNipplesPiercings' | 'ItemNose' | 'ItemPelvis' |
	'ItemTorso' | 'ItemTorso2'| 'ItemVulva' | 'ItemVulvaPiercings' |

	'ItemHidden' /* TODO: investigate, not a real group */
	;

type AssetGroupBodyName =
	'Blush' | 'BodyLower' | 'BodyUpper' | 'Bra' | 'Bracelet' | 'Cloth' |
	'ClothAccessory' | 'ClothLower' | 'Corset' | 'Emoticon' | 'Eyebrows' |
	'Eyes' | 'Eyes2' | 'Fluids' | 'Garters' | 'Glasses' | 'Gloves' |
	'HairAccessory1' | 'HairAccessory2' | 'HairAccessory3' | 'HairBack' |
	'HairFront' | 'Hands' | 'Hat' | 'Head' | 'Height' | 'LeftAnklet' | 'Mask' |
	'Mouth' | 'Necklace' | 'Nipples' | 'Panties' | 'Pussy' | 'RightAnklet' |
	'Shoes' | 'Socks' | 'Suit' | 'SuitLower' | 'TailStraps' | 'Wings'
	;

type AssetGroupName = AssetGroupBodyName | AssetGroupItemName;

type AssetPoseName =
	'AllFours' | 'BackBoxTie' | 'BackCuffs' | 'BackElbowTouch' | 'BaseLower' |
	'BaseUpper' | 'Hogtied' | 'Horse' | 'Kneel' | 'KneelingSpread' | 'LegsClosed' |
	'LegsOpen' | 'OverTheHead' | 'Spread' | 'Suspension' | 'SuspensionHogtied' |
	'TapedHands' | 'Yoked' |

	/* FIXME: Those are pose categories */
	'BodyUpper' | 'BodyLower'
	;

type AssetLockType =
	"CombinationPadlock" | "ExclusivePadlock" | "HighSecurityPadlock" |
	"IntricatePadlock" | "LoversPadlock" | "LoversTimerPadlock" |
	"MetalPadlock" | "MistressPadlock" | "MistressTimerPadlock" |
	"OwnerPadlock" | "OwnerTimerPadlock" | "PandoraPadlock" |
	"PasswordPadlock" | "SafewordPadlock" | "TimerPadlock" |
	"TimerPasswordPadlock"
	;

//#endregion

//#region Server Messages

interface IChatRoomGameResponse {
	Data: {
		KinkyDungeon: any;
		OnlineBounty: any;
		/* LARP */
		GameProgress?: "Start" | "Stop" | "Next" | "Skip" | "Action";
		Action?: undefined;
		Target?: number;
		Item?: string;

		/* MagicBattle */
		Spell?: string;
		Time?: number; /* ms */
	}
	Sender: number;
	RNG: number
}

//#endregion

//#region Chat

interface ChatRoom {
	Name: string;
	Description: string;
	Admin: number[];
	Ban: number[];
	Limit: number;
	Game: string;
	Background: string;
	Private: boolean;
	Locked: boolean;
	BlockCategory: string[];
	Language: string;
	Character?: any[]; /* From server, not really a Character object */
}

type StimulationAction = "Kneel" | "Walk" | "Struggle" | "StruggleFail" | "Talk";

interface StimulationEvent {
	/** The chance that this event will trigger at 0 arousal */
	Chance: number;
	/** Scaling factor for chance, depending on the arousal */
	ArousalScaling?: number;
	/** Scaling factor for chance, depending on the vibe intensity */
	VibeScaling?: number;
	/** Scaling factor for chance, depending on the inflation amount */
	InflationScaling?: number;
	/** The chance that this event will trigger when talking */
	TalkChance?: number;
}

type MessageActionType = "Action" | "Chat" | "Whisper" | "Emote" | "Activity" | "Hidden" |
	"LocalMessage" | "ServerMessage" | "Status";

type MessageContentType = string;

interface ChatMessageDictionaryEntry {
	[k: string]: any;
	Tag?: CommonChatTags | string;
	Text?: string;
	MemberNumber?: number;
}

type ChatMessageDictionary = ChatMessageDictionaryEntry[];

interface IChatRoomMessageBasic {
	Content: MessageContentType;
	Sender: number;
	// SourceMemberNumber: number;
}

interface IChatRoomMessage extends IChatRoomMessageBasic {
	Type: MessageActionType;
	Dictionary?: ChatMessageDictionary;
	Timeout?: number;
}

interface IChatRoomSyncBasic {
	SourceMemberNumber: number
}

interface IChatRoomSyncMessage extends IChatRoomSyncBasic, ChatRoom { }

/**
 * A metadata extractor for a given message.
 *
 * @param data - The chat message to extract from.
 * @param sender - The character that sent the message.
 * @return An object with the following keys:
 *  - `metadata`: an object for the extracted metadata (key/value)
 *  - `substitutions`: an array of [tag, substitutions] to perform on the message.
 * @return null if the extraction has nothing to report.
 */
type ChatRoomMessageExtractor =
	(data: IChatRoomMessage, sender: Character) => { metadata: object, substitutions: string[][] } | null;

/**
 * A chat message handler.
 *
 * This is used in ChatRoomMessage to perform filtering and actions on
 * the recieved message. You can register one of those with
 * ChatRoomRegisterMessageHandler if you need to peek at incoming messages.
 *
 * Message processing is done in three phases:
 * - all pre-handlers are called
 * - metadata extraction & tag substitutions are collected
 *   from the message's dictionary, then latter are applied to
 *   the message's contents.
 * - finally, post-handlers are called.
 *
 * The handler's priority determines when the handler will get executed:
 * - Negative values make the handler run before metadata extraction
 * - Positive values make it run afterward.
 * In both cases, lower values mean higher priority, so -100 handler will
 * run before a -1, and a 1 handler will run before a 100.
 *
 * The return from the callback determines what will happen: if it's true,
 * message processing will stop, making the filter act like a handler.
 * If it's false, then it will continue. You can also return an object with
 * a `msg` property if the handler is a transformation and wishes to update
 * the message's contents inflight and/or a `skip` property if you'd like
 * to cause a subsequent handler to not be called.
 *
 * A few notable priority values are:
 *
 * -200: ghosted player cutoff
 * -1: default Hidden message processing (and cutoff)
 * 0: emotes reformatting
 * 100: sensory-deprivation processing
 * 200: automatic actions on others' cutoff
 * 300: sensory-deprivation cutoff.
 * 500: usually output handlers. That's when audio, notifications and the
 *      message being added to the chat happens.
 *
 * Hidden messages never make it to post-processing.
 *
 */
interface ChatRoomMessageHandler {
	/** A short description of what the handler does. For debugging purposes */
	Description?: string;

	/**
	 * This handler's priority, used to determine when the code should run.
	 */
	Priority: number;

	/**
	 * Actual action to perform.
	 * @param data - The chat message to handle.
	 * @param sender - The character that sent the message.
	 * @param msg - The formatted string extracted from the message.
	 *              If the handler is in "post" mode, all substitutions have been performed.
	 * @param metadata - The collected metadata from the message's dictionary, only available in "post" mode.
	 * @returns {boolean} true if the message was handled and the processing should stop, false otherwise.
	 */
	Callback: (data: IChatRoomMessage, sender: Character, msg: string, metadata?: any) => boolean | { msg?: string; skip?: (handler: ChatRoomMessageHandler) => boolean };
}

//#endregion

//#region FriendList

interface IFriendListBeepLogMessage {
	MemberNumber?: number; /* undefined for NPCs */
	MemberName: string;
	ChatRoomName?: string;
	Private: boolean;
	ChatRoomSpace?: string;
	Sent: boolean;
	Time: Date;
	Message?: string;
}

//#endregion

//#region Assets

type IAssetFamily = "Female3DCG";

interface AssetGroup {
	Family: IAssetFamily;
	Name: AssetGroupName;
	Description: string;
	Asset: Asset[];
	ParentGroupName: string;
	Category: 'Appearance' | 'Item';
	IsDefault: boolean;
	IsRestraint: boolean;
	AllowNone: boolean;
	AllowColorize: boolean;
	AllowCustomize: boolean;
	Random?: boolean;
	ColorSchema: string[];
	ParentSize: string;
	ParentColor: string;
	Clothing: boolean;
	Underwear: boolean;
	BodyCosplay: boolean;
	Hide?: string[];
	Block?: AssetGroupItemName[];
	Zone?: [number, number, number, number][];
	SetPose?: string[];
	AllowPose: string[];
	AllowExpression?: string[];
	Effect?: EffectName[];
	MirrorGroup: string;
	RemoveItemOnRemove: { Group: string; Name: string; Type?: string }[];
	DrawingPriority: number;
	DrawingLeft: number;
	DrawingTop: number;
	DrawingFullAlpha: boolean;
	DrawingBlink: boolean;
	InheritColor?: string;
	FreezeActivePose: string[];
	PreviewZone?: RectTuple;
	DynamicGroupName: AssetGroupName;
	MirrorActivitiesFrom: string | null;

	/** A dict mapping colors to custom filename suffices.
	The "HEX_COLOR" key is special-cased to apply to all color hex codes. */
	ColorSuffix?: { [_: string]: string };
}

/** An object defining a drawable layer of an asset */
interface AssetLayer {
	/** The name of the layer - may be null if the asset only contains a single default layer */
	Name: string | null;
	/** whether or not this layer can be colored */
	AllowColorize: boolean;
	/** if not null, specifies that this layer should always copy the color of the named layer */
	CopyLayerColor: string | null;
	/** specifies the name of a color group that this layer belongs to. Any layers within the same color group can be colored together via the item color UI */
	ColorGroup?: string;
	/** whether or not this layer can be colored in the coloring UI */
	HideColoring: boolean;
	/** A list of allowed extended item types that this layer permits - the layer will only be drawn if
	the item type matches one of these types. If null, the layer is considered to permit all extended types. */
	AllowTypes: string[] | null;
	/** whether or not the layer has separate assets per type. If not, the extended type will not be included in
	the URL when fetching the layer's image */
	HasType: boolean;
	/** The name of the parent group for this layer. If null, the layer has no parent group. If
	undefined, the layer inherits its parent group from it's asset/group. */
	ParentGroupName?: string | null;
	/** An array of poses that this layer permits. If set, it will override the poses permitted
	by the parent asset/group. */
	AllowPose: string[] | null;
	/** An array of poses that this layer should be hidden for. */
	HideForPose: string[];
	/** An array of objects mapping poses to other poses to determine their draw folder */
	PoseMapping?: { [index: string]: string };
	/** The drawing priority of this layer. Inherited from the parent asset/group if not specified in the layer
	definition. */
	Priority: number;
	InheritColor?: string;
	Alpha: AlphaDefinition[];
	/** The asset that this layer belongs to */
	Asset: Asset;
	DrawingLeft?: number;
	DrawingTop?: number;
	HideAs?: { Group: string; Asset?: string };
	/** That layer is drawing at a fixed Y position */
	FixedPosition?: boolean;
	HasImage: boolean;
	Opacity: number;
	MinOpacity: number;
	MaxOpacity: number;
	LockLayer: boolean;
	MirrorExpression?: string;
	AllowModuleTypes?: string[];
	/** The coloring index for this layer */
	ColorIndex: number;
	/** Any group-specific alpha masks that should be applied when drawing the layer. Only available on layers that have
	been created prior to drawing */
	GroupAlpha?: AlphaDefinition[];
	/** A module for which the layer can have types. */
	ModuleType: string[] | null;
}

/** An object defining a group of alpha masks to be applied when drawing an asset layer */
interface AlphaDefinition {
	/** A list of the group names that the given alpha masks should be applied to. If empty or not present, the
alpha masks will be applied to every layer underneath the present one. */
	Group?: string[];
	/** A list of the poses that the given alpha masks should be applied to. If empty or not present, the alpha
masks will be applied regardless of character pose. */
	Pose?: string[];
	/** A list of the extended types that the given alpha masks should be applied to. If empty or not present, the alpha
masks will be applied regardless of the extended type. */
	Type?: string[];
	/** A list of alpha mask definitions. A definition is a 4-tuple of numbers defining the top left coordinate of
a rectangle and the rectangle's width and height - e.g. [left, top, width, height] */
	Masks: RectTuple[];
}

interface TintDefinition {
	Color: number | string;
	Strength: number;
	DefaultColor?: string;
}

interface ResolvedTintDefinition extends TintDefinition {
	Item: Item;
}

interface ExpressionTrigger {
	Group: string;
	Name: string;
	Timer: number;
}

interface Asset {
	Name: string;
	Description: string;
	Group: AssetGroup;
	ParentItem?: string;
	ParentGroupName?: string | null;
	Enable: boolean;
	Visible: boolean;
	Wear: boolean;
	Activity: string | null;
	AllowActivity?: string[];
	AllowActivityOn?: AssetGroupName[];
	BuyGroup?: string;
	PrerequisiteBuyGroups?: string[];
	Effect?: EffectName[];
	Bonus?: string;
	Block?: AssetGroupItemName[];
	Expose: string[];
	Hide?: string[];
	HideItem?: string[];
	HideItemExclude: string[];
	HideItemAttribute: string[];
	Require?: string[];
	SetPose?: string[];
	AllowPose: string[] | null;
	HideForPose: string[];
	PoseMapping?: { [index: string]: string };
	AllowActivePose?: string[];
	WhitelistActivePose?: string[];
	Value: number;
	Difficulty: number;
	SelfBondage: number;
	SelfUnlock: boolean;
	ExclusiveUnlock: boolean;
	Random: boolean;
	RemoveAtLogin: boolean;
	WearTime: number;
	RemoveTime: number;
	RemoveTimer: number;
	MaxTimer: number;
	DrawingPriority?: number;
	DrawingLeft?: number;
	DrawingTop?: number;
	HeightModifier: number;
	ZoomModifier: number;
	Alpha?: AlphaDefinition[];
	Prerequisite?: string | string[];
	Extended: boolean;
	AlwaysExtend: boolean;
	AlwaysInteract: boolean;
	AllowLock: boolean;
	LayerVisibility: boolean;
	IsLock: boolean;
	PickDifficulty: number;
	OwnerOnly: boolean;
	LoverOnly: boolean;
	ExpressionTrigger?: ExpressionTrigger[];
	RemoveItemOnRemove: { Name: string; Group: string; Type?: string; }[];
	AllowEffect?: EffectName[];
	AllowBlock?: AssetGroupItemName[];
	AllowType?: string[];
	DefaultColor?: ItemColor;
	Opacity: number;
	MinOpacity: number;
	MaxOpacity: number;
	Audio?: string;
	Category?: string[];
	Fetish?: string[];
	CustomBlindBackground?: string;
	ArousalZone: string;
	IsRestraint: boolean;
	BodyCosplay: boolean;
	OverrideBlinking: boolean;
	DialogSortOverride?: DialogSortOrder;
	DynamicDescription: (C: Character) => string;
	DynamicPreviewImage: (C: Character) => string;
	DynamicAllowInventoryAdd: (C: Character) => boolean;
	DynamicExpressionTrigger: (C: Character) => ExpressionTrigger[] | null | undefined;
	DynamicName: (C: Character) => string;
	DynamicGroupName: AssetGroupName;
	DynamicActivity: (C: Character) => string | null | undefined;
	DynamicAudio: ((C: Character) => string) | null;
	CharacterRestricted: boolean;
	AllowRemoveExclusive: boolean;
	InheritColor?: string;
	DynamicBeforeDraw: boolean;
	DynamicAfterDraw: boolean;
	DynamicScriptDraw: boolean;
	HasType: boolean;
	AllowLockType?: string[];
	AllowColorizeAll: boolean;
	AvailableLocations: string[];
	OverrideHeight?: AssetOverrideHeight;
	FreezeActivePose: string[];
	DrawLocks: boolean;
	AllowExpression?: string[];
	MirrorExpression?: string;
	FixedPosition: boolean;
	Layer: AssetLayer[];
	ColorableLayerCount: number;
	Archetype?: string;
	Attribute: string[];
	PreviewIcons: any[];
	Tint: TintDefinition[];
	AllowTint: boolean;
	DefaultTint?: string;
	CraftGroup: string;
	ColorSuffix: { [_: string]: string};
}

//#endregion

/** An ItemBundle is a minified version of the normal Item */
interface ItemBundle {
	Group: string;
	Name: string;
	Difficulty?: number;
	Color?: ItemColor;
	Property?: ItemProperties;
	Craft?: any;
}

/** An AppearanceBundle is whole minified appearance of a character */
type AppearanceBundle = ItemBundle[];

interface Pose {
	Name: string;
	Category?: 'BodyUpper' | 'BodyLower' | 'BodyFull';
	AllowMenu?: true;
	/** Only show in menu if an asset supports it */
	AllowMenuTransient?: true;
	OverrideHeight?: AssetOverrideHeight;
	Hide?: string[];
	MovePosition?: { Group: string; X: number; Y: number; }[];
}

type ItemColor = string | string[];

/** An item is a pair of asset and its dynamic properties that define a worn asset. */
interface Item {
	Asset?: Asset;
	Model?: Model;
	Color?: ItemColor;
	Filters?: Record<string, LayerFilter>;
	Difficulty?: number;
	Property?: ItemProperties;
}

interface ScreenFunctions {
	// Required
	/**
	 * Called each frame
	 * @param {number} time - The current time for frame
	 */
	Run(time: number): void;
	/**
	 * Called when user clicks on the canvas
	 * @param {MouseEvent | TouchEvent} event - The event that triggered this
	 */
	Click(event: MouseEvent | TouchEvent): void;

	// Optional
	/** Called when screen is loaded using `CommonSetScreen` */
	Load?(): void;
	/** Called when this screen is being replaced */
	Unload?(): void;
	/**
	 * Called when screen size or position changes or after screen load
	 * @param {boolean} load - If the reason for call was load (`true`) or window resize (`false`)
	 */
	Resize?(load: boolean): void;
	/**
	 * Called when user presses any key
	 * @param {KeyboardEvent} event - The event that triggered this
	 */
	KeyDown?(event: KeyboardEvent): void;
	/** Called when user presses Esc */
	Exit?(): void;
}

//#region Characters

interface Character {
	IsKneeling(): unknown;
	ID: number;
	/** Only on `Player` */
	OnlineID?: string;
	Type: CharacterType;
	Name: string;
	Nickname?: string;
	AssetFamily: IAssetFamily | string;
	AccountName: string;
	Owner: string;
	Lover: string;
	Money: number;
	Inventory: InventoryItem[];
	Appearance: Item[];
	Stage: string;
	CurrentDialog: string;
	Dialog: any[];
	Reputation: any[];
	Skill: any[];
	Pose: string[];
	Effect: string[];
	Tints: ResolvedTintDefinition[];
	FocusGroup: AssetGroup | null;
	Canvas: HTMLCanvasElement | null;
	CanvasBlink: HTMLCanvasElement | null;
	MustDraw: boolean;
	BlinkFactor: number;
	AllowItem: boolean;
	BlockItems: any[];
	FavoriteItems: any[];
	LimitedItems: any[];
	WhiteList: number[];
	HeightRatio?: number;
	HeightModifier: number;
	MemberNumber?: number;

	ArousalSettings?: {
		Active: string;
		Visible: string;
		ShowOtherMeter: boolean;
		AffectExpression: boolean;
		AffectStutter: string;
		VFX: string;
		VFXVibrator: string;
		VFXFilter: string;
		Progress: number;
		ProgressTimer: number;
		VibratorLevel: number;
		ChangeTime: number;
		Activity: any[];
		Zone: any[];
		Fetish: any[];
		OrgasmTimer?: number;
		OrgasmStage?: number;
		OrgasmCount?: number;
		DisableAdvancedVibes: boolean;
	};
	AppearanceFull?: Item[];
	// Online character properties
	Title?: string;
	ActivePose?: any;
	LabelColor?: any;
	Creation?: any;
	Description?: any;
	OnlineSharedSettings?: {
		AllowFullWardrobeAccess: boolean;
		BlockBodyCosplay: boolean;
		AllowPlayerLeashing: boolean;
		DisablePickingLocksOnSelf: boolean;
		GameVersion: string;
		ItemsAffectExpressions: boolean;
	};
	Game?: {
		LARP?: GameLARPParameters,
		MagicBattle?: GameMagicBattleParameters,
		GGTS?: GameGGTSParameters,
	};
	BlackList: number[];
	RunScripts?: boolean;
	HasScriptedAssets?: boolean;
	Cage?: true | null;
	Difficulty?: {
		Level: number;
		LastChange?: number;
	};
	ArousalZoom?: boolean;
	FixedImage?: string;
	Rule?: any[];
	Status?: string | null;
	StatusTimer?: number;
	Crafting?: CraftingItem[];
	IsEnclose: () => boolean;
}

type NPCArchetype =
	/* Pandora NPCs */
	"MemberNew"|"MemberOld"|"Cosplay"|"Mistress"|"Slave"|"Maid"|"Guard"|
	/* Pandora Special */
	"Victim"|"Target"|"Chest";

/** NPC Character extension */
// FIXME: That one should find its way down to NPCCharacter, but
// there's too many accesses to those properties from Character
// to do so.
interface Character {
	/** NPC type: Slave, Maid, etc. */
	Archetype?: NPCArchetype;
	Love?: number; /** The NPC's love value */
	WillRelease?(): boolean; /** Shop NPC-only: will it release the player when asked */
}

/** NPC-only */
interface NPCCharacter extends Character {
	Archetype?: NPCArchetype;
	Trait?: NPCTrait[];
	Event?: NPCTrait[];
	Love?: number;
}

/** College */
interface NPCCharacter {
	GoneAway?: boolean;
}

/** Asylum */
interface NPCCharacter {
	RunAway?: boolean;
}

/** Sarah */
interface Character {
	OrgasmMeter?: number;
	OrgasmDone?: boolean;
}

interface KidnapCard {
	Move: number;
	Value?: number;
}

/** Kidnap minigame */
interface Character {
	KidnapWillpower?: number;
	KidnapMaxWillpower?: number;
	KidnapCard?: KidnapCard[];
	KidnapStat?: [number, number, number, number];
}

/** Pandora NPCs */
interface Character {
	Recruit?: number;
	RecruitOdds?: number;
	RandomOdds?: number;
	QuizLog?: number[];
	QuizFail?: number;
	AllowMove?: boolean;
	DrinkValue?: number;
	TriggerIntro?: boolean;
	FromPandora?: boolean;
}

/** Magic School */
interface Character {
	House?: string;
}

/** MovieStudio */
interface Character {
	Friendship?: string;
	InterviewCleanCount?: number;
}

/** Slave market */
interface Character {
	ExpectedTraining?: number;
	CurrentTraining?: number;
	TrainingIntensity?: number;
	TrainingCount?: number;
	TrainingCountLow?: number;
	TrainingCountHigh?: number;
	TrainingCountPerfect?: number;
}

interface PlayerCharacter extends Character {
	// PreferenceInitPlayer() must be updated with defaults, when adding a new setting
	ChatSettings?: {
		ColorActions: boolean;
		ColorActivities: boolean;
		ColorEmotes: boolean;
		ColorNames: boolean;
		ColorTheme: string;
		DisplayTimestamps: boolean;
		EnterLeave: string;
		FontSize: string;
		MemberNumbers: string;
		MuStylePoses: boolean;
		ShowActivities: boolean;
		ShowAutomaticMessages: boolean;
		ShowBeepChat: boolean;
		ShowChatHelp: boolean;
		ShrinkNonDialogue: boolean;
		WhiteSpace: string;
		/** @deprecated */
		AutoBanBlackList?: any;
		/** @deprecated */
		AutoBanGhostList?: any;
		/** @deprecated */
		SearchFriendsFirst?: any;
		/** @deprecated */
		DisableAnimations?: any;
		/** @deprecated */
		SearchShowsFullRooms?: any;
	};
	VisualSettings?: {
		ForceFullHeight?: boolean;
		UseCharacterInPreviews?: boolean;
		MainHallBackground?: string;
		PrivateRoomBackground?: string;
	};
	AudioSettings?: {
		Volume: number;
		PlayBeeps: boolean;
		/** Play items sounds in chatrooms */
		PlayItem: boolean;
		/** Play sounds only if the player is involved */
		PlayItemPlayerOnly: boolean;
		Notifications: boolean;
	};
	GameplaySettings?: {
		SensDepChatLog: string;
		BlindDisableExamine: boolean;
		DisableAutoRemoveLogin: boolean;
		ImmersionLockSetting: boolean;
		EnableSafeword: boolean;
		DisableAutoMaid: boolean;
		OfflineLockedRestrained: boolean;
	};
	ImmersionSettings?: {
		BlockGaggedOOC: boolean;
		StimulationEvents: boolean;
		ReturnToChatRoom: boolean;
		ReturnToChatRoomAdmin: boolean;
		SenseDepMessages: boolean;
		ChatRoomMuffle: boolean;
		BlindAdjacent: boolean;
		AllowTints: boolean;
	};
	RestrictionSettings?: {
		BypassStruggle: boolean;
		SlowImmunity: boolean;
		BypassNPCPunishments: boolean;
	};
	OnlineSettings?: {
		AutoBanBlackList: boolean;
		AutoBanGhostList: boolean;
		DisableAnimations: boolean;
		SearchShowsFullRooms: boolean;
		SearchFriendsFirst: boolean;
		SendStatus?: boolean;
		ShowStatus?: boolean;
		EnableAfkTimer: boolean;
	};
	GraphicsSettings?: {
		Font: string;
		InvertRoom: boolean;
		StimulationFlashes: boolean;
		DoBlindFlash: boolean;
		AnimationQuality: number;
		StimulationFlash: boolean;
		SmoothZoom: boolean;
		CenterChatrooms: boolean;
		AllowBlur: boolean;
	}
	NotificationSettings?: {
		/** @deprecated */
		Audio?: boolean;
		Beeps: NotificationSetting;
		/** @deprecated */
		Chat?: any;
		ChatMessage: NotificationSetting & {
			/** @deprecated */
			IncludeActions?: any;
			Mention?: boolean;
			Normal?: boolean;
			Whisper?: boolean;
			Activity?: boolean;
		};
		/** @deprecated */
		ChatActions?: any;
		ChatJoin: NotificationSetting & {
			/** @deprecated */
			Enabled?: any;
			Owner?: boolean;
			Lovers?: boolean;
			Friendlist?: boolean;
			Subs?: boolean;
		};
		Disconnect: NotificationSetting;
		Larp: NotificationSetting;
		Test: NotificationSetting;
	};
	GhostList?: number[];
	Wardrobe?: any[][];
	WardrobeCharacterNames?: string[];
	SavedExpressions?: ({ Group: string, CurrentExpression?: string }[] | null)[];
	FriendList?: number[];
	FriendNames?: Map<number, string>;
	SubmissivesList?: Set<number>;
	ChatSearchFilterTerms?: string;
}

/** Pandora Player extension */
interface PlayerCharacter {
	Infiltration?: {
		Punishment?: {
			Minutes: number;
			Timer?: number;
			Background: string;
			Difficulty: number;
			FightDone?: boolean;
		}
		Perks?: string;
	}
}

/** Kinky Dungeon Player extension */
interface PlayerCharacter {
	KinkyDungeonKeybindings?: any;
	KinkyDungeonExploredLore?: any[];
}

interface NPCTrait {
	Name: string;
	Value: number;
}

//#endregion

//#region Extended items

interface AssetOverrideHeight {
	Height: number;
	Priority: number;
	HeightRatioProportion?: number;
}

/**
 * Base properties for extended items
 *
 * Those are the properties the main game code enforces.
 */
interface ItemPropertiesBase {
	Type?: string | null;
	Expression?: string;
	Difficulty?: number;
	OverrideHeight?: AssetOverrideHeight;
	HeightModifier?: number;
	OverridePriority?: unknown;
	DefaultColor?: string;

	Modules?: number[];

	Attribute?: string[];

	AllowActivity?: string[];
	AllowActivityOn?: AssetGroupName[];

	/** Items hidden by this one */
	HideItem?: string[];
	HideItemExclude?: string[];
	Hide?: AssetGroupName[];

	/** The groups that this item blocks */
	Block?: AssetGroupItemName[];

	Effect?: EffectName[];
	OverrideAssetEffect?: boolean;

	Tint?: TintDefinition[];

	/* Pose-related properties */

	SetPose?: AssetPoseName[];
	AllowActivePose?: AssetPoseName[];
	AllowPose?: AssetPoseName[];
	WhitelistActivePose?: AssetPoseName[];
	FreezeActivePose?: AssetPoseName[];

	/* Vibratory-related properties */
	Mode?: VibratorMode;
	Intensity?: number;
	State?: VibratorModeState;
}

/**
 * Custom properties for extended items
 *
 * Those are properties that are asset-specific, so the handling might be done
 * per-item.
 */
interface ItemPropertiesCustom {
	ItemMemberNumber?: number;

	MemberNumber?: number;

	SelfUnlock?: boolean;

	//#region Lock properties
	/** Asset name of the lock */
	LockedBy?: AssetLockType;
	LockMemberNumber?: number | string;
	/** @see BC_Asset.MaxTimer */
	RemoveTimer?: number;
	/** `/^[A-Z]{1,8}$/`, Used by `PasswordPadlock`, `SafewordPadlock` and `TimerPasswordPadlock` lock */
	Password?: string;
	/** Comma separated numbers */
	LockPickSeed?: string;
	/** `/^[0-9]{4}$/`, Used by `CombinationPadlock` lock */
	CombinationNumber?: string;
	/** Comma separated numbers; used by `HighSecurityPadlock` */
	MemberNumberListKeys?: string;
	/** Used by `PasswordPadlock`, `SafewordPadlock` and `TimerPasswordPadlock` locks */
	Hint?: string;
	/** Used by `PasswordPadlock`, `SafewordPadlock` and `TimerPasswordPadlock` locks; if the lock has been set with password */
	LockSet?: boolean;
	/** Whether to remove item on timer lock unlock; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPadlock`, `TimerPasswordPadlock` */
	RemoveItem?: boolean;
	/** Only for `PasswordPadlock` */
	RemoveOnUnlock?: boolean;
	/** Whether time is shown or "Unknown time left"; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPasswordPadlock` */
	ShowTimer?: boolean;
	/** Enable input; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPasswordPadlock` */
	EnableRandomInput?: boolean;
	/** List of people who publicly modified time on lock; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPasswordPadlock` */
	MemberNumberList?: number[];
	//#endregion

	InflateLevel?: number;

	SuctionLevel?: number;

	/** 1st line of text for user-entered text data */
	Text?: string;
	/** 2nd line of text for user-entered text data */
	Text2?: string;

	LockButt?: boolean;

	/* Futuristic Set open permissions */

	OpenPermission?: boolean;
	OpenPermissionArm?: boolean;
	OpenPermissionLeg?: boolean;
	OpenPermissionChastity?: boolean;

	/** The futuristic bra's heart rate value */
	HeartRate?: number;
	/** Is the futuristic bra's heart icon shown */
	HeartIcon?: boolean;

	/* Futuristic gag & panel gag settings */
	AutoPunish?: number;
	AutoPunishUndoTime?: number;
	AutoPunishUndoTimeSetting?: number;
	OriginalSetting?: "Padded" | "LightBall" | "Ball" | "Plug";
	ChatMessage?: boolean;
	BlinkState?: number;
	Option?: ExtendedItemOption;

	BlockRemotes?: boolean;

	/* Futuristic chastity settings */

	PunishStruggle?: boolean;
	PunishStruggleOther?: boolean;
	PunishOrgasm?: boolean;
	PunishStandup?: boolean;
	PunishSpeech?: number;
	PunishRequiredSpeech?: number;
	PunishRequiredSpeechWord?: string;
	PunishProhibitedSpeech?: number;
	PunishProhibitedSpeechWords?: string;
	NextShockTime?: number;

	PublicModeCurrent?: number;
	PublicModePermission?: number;

	/** The futuristic vibrator's trigger words */
	TriggerValues?: string;
	AccessMode?: string;

	/* Pleasure panties settings */
	ShockLevel?: number;
	LockCrotch?: boolean;
	OrgasmLock?: number;

	/** The number of inserted beads */
	InsertedBeads?: number;

	/** Whether the item displays a chat message or not */
	ShowText?: boolean;

	/** How sensitive the item is to whatever its reacting to */
	Sensitivity?: number;

	/** The asset's draw opacity */
	Opacity?: number;

	CustomBlindBackground?: string;

	/** Number of times the item was triggered; often used by shock collars */
	TriggerCount?: number;

	/** Number of times the suitcase got cracked */
	Iterations?: number;

	/** Allows reverting back to these properties on exiting an extended menu */
	Revert?: boolean;
}

interface ItemProperties extends ItemPropertiesBase, ItemPropertiesCustom { }

/**
 * An object containing the extended item definition for an asset.
 * @template Archetype, Config
 */
interface ExtendedItemAssetConfig<Archetype extends ExtendedArchetype, Config> {
	/** The extended item archetype that this asset uses. */
	Archetype: Archetype;
	/** The specific configuration for the item (type will vary based on the item's archetype) */
	Config?: Config;
	/** The group name and asset name of a configuration to copy - useful if multiple items share the same config */
	CopyConfig?: { GroupName?: string, AssetName: string };
}

/**
 * Valid extended item configuration types
 */
type AssetArchetypeConfig = TypedItemAssetConfig | ModularItemAssetConfig | VibratingItemAssetConfig | VariableHeightAssetConfig;

/**
 * An object containing extended item definitions for a group.
 * Maps asset names within the group to their extended item configuration
 * @see {@link ExtendedItemAssetConfig}
 */
type ExtendedItemGroupConfig = Record<string, AssetArchetypeConfig>;

/**
 * An object containing extended item configurations keyed by group name.
 * @see {@link ExtendedItemAssetConfig}
 */
type ExtendedItemConfig = Record<string, ExtendedItemGroupConfig>;

/** Defines a single extended item option */
interface ExtendedItemOption {
	/** The name of the type - used for the preview icon and the translation key in the CSV */
	Name: string;
	/** The required bondage skill level for this option */
	BondageLevel?: number;
	/** The required self-bondage skill level for this option when using it on oneself */
	SelfBondageLevel?: number;
	/** The required prerequisites that must be met before this option can be selected */
	Prerequisite?: string | string[];
	/** A custom background for this option that overrides the default */
	CustomBlindBackground?: string;
	/** Whether the option permits locking - if not set, defaults to the AllowLock property of the parent asset */
	AllowLock?: boolean;
	/**
	 * Whether or not it should be possible to change from this option to another
	 * option while the item is locked (if set to `false`, the player must be able to unlock the item to change its type) -
	 * defaults to `true`
	 */
	ChangeWhenLocked?: boolean;
	/** The Property object to be applied when this option is used */
	Property?: ItemProperties;
	/**
	 * Trigger this expression when changing to this option
	 *
	 * FIXME: **Currently broken!**
	 */
	Expression?: ExpressionTrigger[];
	/** Whether or not the option should open a subscreen in the extended item menu */
	HasSubscreen?: boolean;
	/** Whether or not this option can be selected randomly */
	Random?: boolean;
	/** Whether or not this option can be selected by the wearer */
	AllowSelfSelect?: boolean;
	/** If the option has a subscreen, this can set a particular archetype to use */
	Archetype?: ExtendedArchetype;
	/** If the option has an archetype, sets the config to use */
	ArchetypeConfig?: TypedItemConfig | ModularItemConfig | VibratingItemConfig | VariableHeightConfig
}

/**
 * An object containing data about the type change that triggered the chat message
 * @param {Character} C - A reference to the character wearing the item
 * @param {OptionType} previousOption - The previously selected type option
 * @param {OptionType} newOption - The newly selected type option
 * @param {number} previousIndex - The index of the previously selected type option in the item's options
 * config
 * @param {number} newIndex - The index of the newly selected type option in the item's options config
 * @template OptionType
 */
interface ExtendedItemChatData<OptionType> {
	C: Character;
	previousOption: OptionType;
	newOption: OptionType;
	previousIndex: number;
	newIndex: number;
}

/**
 * @param {OptionType} chatData - An object containing data about the type change that triggered the chat message
 * @returns {string} - The chat prefix that should be used for this type change
 * @template OptionType
 */
type ExtendedItemChatCallback<OptionType> = (
	chatData: ExtendedItemChatData<OptionType>,
) => string;

/**
 * @param {Character} C - A reference to the character wearing the item
 * @param {Item} Item - The equipped item
 * @param {OptionType} Option - The newly selected option
 * @param {OptionType} CurrentOption - The currently selected option
 * @returns {string} - Returns a non-empty message string if the item failed validation, or an empty string otherwise
 * @template OptionType
 */
type ExtendedItemValidateCallback<OptionType> = (
	C: Character,
	Item: Item,
	Option: OptionType,
	CurrentOption: OptionType,
) => string;

/**
 * @param {ExtendedItemValidateCallback<OptionType>} - The hooked validate function
 * @param {Character} C - A reference to the character wearing the item
 * @param {Item} Item - The equipped item
 * @param {OptionType} Option - The newly selected option
 * @param {OptionType} CurrentOption - The currently selected option
 * @returns {string} - Returns a non-empty message string if the item failed validation, or an empty string otherwise
 * @template OptionType
 */
type ExtendedItemValidateScriptHookCallback<OptionType> = (
	next: ExtendedItemValidateCallback<OptionType>,
	C: Character,
	Item: Item,
	Option: OptionType,
	CurrentOption: OptionType,
) => string;

//#endregion

//#region Modular items

/** An object containing the extended item definition for a modular asset. */
type ModularItemAssetConfig = ExtendedItemAssetConfig<"modular", ModularItemConfig>;

/** An object defining all of the required configuration for registering a modular item */
interface ModularItemConfig {
	/** The module definitions for the item */
	Modules: ModularItemModule[];
	/**
	 * The item's chatroom message setting. Determines the level of
	 * granularity for chatroom messages when the item's module values change.
	 */
	ChatSetting?: ModularItemChatSetting;
	/**
	 * An optional array of chat tags that should be included in the dictionary of
	 * the chatroom message when the item's type is changed.
	 * Defaults to {@link CommonChatTags.SOURCE_CHAR} and {@link CommonChatTags.DEST_CHAR}
	 */
	ChatTags?: CommonChatTags[];
	/**
	 * A boolean indicating whether or not the item's type can be changed while the
	 * item is locked (if set to false, the player must be able to unlock the item to change its type). Defaults to `true`
	 */
	ChangeWhenLocked?: boolean;
	/** The optional text configuration for the item. Custom text keys can be configured within this object */
	Dialog?: ModularItemDialogConfig;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored
	 */
	ScriptHooks?: {
		Load?: (next: () => void) => void;
		Click?: (next: () => void) => void;
		Draw?: (next: () => void) => void;
		Exit?: () => void;
		Validate?: ExtendedItemValidateScriptHookCallback<ModularItemOption>;
	};
}

interface ModularItemDialogConfig {
	/**
	 * The key for the text that will be displayed on the base modular item screen (usually a prompt for the player to
	 * configure modules). Defaults to `"<groupName><assetName>Select"`
	 */
	Select?: string;
	/**
	 * A prefix for text keys for the display names of the item's modules. This will be suffixed with the module name to
	 * get the final key (i.e. `"<modulePrefix><moduleName>"`). Defaults to `"<groupName><assetName>Module"`.
	 */
	ModulePrefix?: string;
	/**
	 * A prefix for text keys for the display names of the item's options. This will be suffixed with the option key
	 * (i.e. `"<optionPrefix><optionKey>"`. The option key is the module key followed by the option's index within its
	 * parent module (e.g. `"a3"`). Defaults to `"<groupName><assetName>Option"`.
	 */
	OptionPrefix?: string;
	/**
	 * A prefix for text keys for chat messages triggered
	 */
	ChatPrefix?: string | ExtendedItemChatCallback<ModularItemOption>;
}

/** An object describing a single module for a modular item. */
interface ModularItemModule {
	/** The name of this module - this is usually a human-readable string describing what the
	 * module represents (e.g. Straps). It is used for display text keys, and should be unique across all of the modules
	 * for the item.
	 */
	Name: string;
	/** The unique key for this module - this is used as a prefix to designate option names. Each
	 * options in the module will be named with the module's key, followed by the index of the option within the module's
	 * Options array. Keys should be alphabetical only (a-z, A-Z)
	 */
	Key: string;
	/** The list of option definitions that can be chosen within this module. */
	Options: ModularItemOption[];
	/** Whether or not this module can be selected by the wearer */
	AllowSelfSelect?: boolean;
}

/** An object describing a single option within a module for a modular item. */
interface ModularItemOption {
	/** The additional difficulty associated with this option - defaults to 0 */
	Difficulty?: number;
	/** The required bondage skill level for this option */
	BondageLevel?: number;
	/** The required self-bondage skill level for this option when using it on oneself */
	SelfBondageLevel?: number;
	/** The required prerequisites that must be met before this option can be selected */
	Prerequisite?: string | string[];
	/** A custom background for this option that overrides the default */
	CustomBlindBackground?: string;
	/** A list of groups that this option blocks - defaults to [] */
	Block?: string[];
	/** A list of groups that this option hides - defaults to [] */
	Hide?: string[];
	/** A list of items that this option hides */
	HideItem?: string[];
	/** The Property object to be applied when this option is used */
	Property?: ItemProperties;
	/** Whether the option permits locking - if not set, defaults to the AllowLock property of the parent asset */
	AllowLock?: boolean;
	/**
	 * Whether or not it should be possible to change from this option to another
	 * option while the item is locked (if set to `false`, the player must be able to unlock the item to change its type) -
	 * defaults to `true`
	 */
	ChangeWhenLocked?: boolean;
	/** Whether or not the option should open a subscreen in the extended item menu */
	HasSubscreen?: boolean;
	/** Override height, uses the highest priority of all modules*/
	OverrideHeight?: AssetOverrideHeight;
	/** Whether or not this option can be selected by the wearer */
	AllowSelfSelect?: boolean;
	/** Whether that option moves the character up */
	HeightModifier?: number;
	/** Whether that option applies effects */
	Effect?: string[];
	/** Whether the option forces a given pose */
	SetPose?: string;
	/** If set, the option changes the asset's default priority */
	OverridePriority?: number;
	/** A list of activities enabled by that module */
	AllowActivity?: string[];
}

/** An object containing modular item configuration for an asset. Contains all of the necessary information for the
 * item's load, draw & click handlers.
 */
interface ModularItemData {
	/** A reference to the asset that this configuration is tied to */
	asset: Asset;
	/** The item's chatroom message setting. Determines the level of
	 * granularity for chatroom messages when the item's module values change.
	 */
	chatSetting: ModularItemChatSetting;
	/**
	 * An array of the chat message tags that should be included in the item's
	 * chatroom messages. Defaults to [{@link CommonChatTags.SOURCE_CHAR}, {@link CommonChatTags.DEST_CHAR}]
	 */
	chatTags: CommonChatTags[];
	/** The identifying key for the asset, in the format "<GroupName><AssetName>" */
	key: string;
	/** The total number of types permitted by the item */
	typeCount: number;
	/** The prefix for generated functions */
	functionPrefix: string;
	/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
	dialogSelectPrefix: string;
	/** The dialogue prefix for the name of each module */
	dialogModulePrefix: string;
	/** The dialogue prefix for the name of each option */
	dialogOptionPrefix: string;
	/** The dialogue prefix that will be used for each of the item's chatroom messages */
	chatMessagePrefix: string | ExtendedItemChatCallback<ModularItemOption>;
	/** The module definitions for the modular item */
	modules: ModularItemModule[];
	/** Name of currently active module */
	currentModule: string;
	/** A lookup for the current page in the extended item menu for each of the item's modules */
	pages: Record<string, number>;
	/** A lookup for the draw data for each of the item's modules */
	drawData: Record<string, { pageCount: number, paginate: boolean, positions: number[][] }>;
	/** A lookup for the draw functions for each of the item's modules */
	drawFunctions: Record<string, () => void>;
	/** A lookup for the click functions for each of the item's modules */
	clickFunctions: Record<string, () => void>;
	/**
	 * A boolean indicating whether or not the item's type can be changed while the
	 * item is locked (if set to `false`, the player must be able to unlock the item to change its type). Defaults to `true`
	 */
	changeWhenLocked: boolean;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored
	 */
	scriptHooks?: {
		load?: (next: () => void) => void,
		click?: (next: () => void) => void,
		draw?: (next: () => void) => void,
		exit?: () => void,
		validate?: ExtendedItemValidateScriptHookCallback<ModularItemOption>,
	};
}

/** A 3-tuple (or 2-tuple) containing data for drawing a button in a modular item screen. A button definition takes the
 * format:
 * ```
 * [imageUrl, textKey, background]
 * ```
 * The imageUrl is the URL for the image that should be drawn in the button.
 * The textKey is the CSV key for the text that should be displayed in the button.
 * The background is an optional CSS color string defining the background color for the button.
 */
type ModularItemButtonDefinition = [string, string] | [string, string, string];

//#endregion

//#region Typed items

/** An object containing the extended item definition for a modular asset. */
type TypedItemAssetConfig = ExtendedItemAssetConfig<"typed", TypedItemConfig>;

/** An object defining all of the required configuration for registering a typed item */
interface TypedItemConfig {
	/** The list of extended item options available for the item */
	Options: ExtendedItemOption[];
	/** The optional text configuration for the item. Custom text keys can be configured within this object */
	Dialog?: TypedItemDialogConfig;
	/**
	 * An optional array of chat tags that should be included in the dictionary of
	 * the chatroom message when the item's type is changed.
	 * Defaults to {@link CommonChatTags.SOURCE_CHAR} and {@link CommonChatTags.DEST_CHAR}
	 */
	ChatTags?: CommonChatTags[];
	/**
	 * The chat message setting for the item. This can be provided to allow
	 * finer-grained chatroom message keys for the item. Defaults to {@link TypedItemChatSetting.TO_ONLY}
	 */
	ChatSetting?: TypedItemChatSetting;
	/** A boolean indicating whether or not images should be drawn in this item's extended item menu. Defaults to `true` */
	DrawImages?: boolean;
	/**
	 * A boolean indicating whether or not the item's type can be changed while the
	 * item is locked (if set to `false`, the player must be able to unlock the item to change its type). Defaults to `true`
	 */
	ChangeWhenLocked?: boolean;
	/**
	 * An optional validation callback function which can be used by
	 * items to run additional validation for cases that aren't covered by configuration
	 */
	Validate?: ExtendedItemValidateCallback<ExtendedItemOption>;
	/**
	 * Contains custom dictionary entries in the event that the base ones do not suffice.
	 */
	Dictionary?: TypedItemDictionaryCallback[];
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored
	 */
	ScriptHooks?: {
		Load?: (next: () => void) => void,
		Click?: (next: () => void) => void,
		Draw?: (next: () => void) => void,
		Exit?: () => void,
		Validate?: ExtendedItemValidateScriptHookCallback<ExtendedItemOption>,
	};
}

interface TypedItemDialogConfig {
	/**
	 * The key for the text that will be displayed at the top of the extended item screen
	 * (usually a prompt for the player to select a type). Defaults to `"<groupName><assetName>Select"`
	 */
	Load?: string;
	/**
	 * A prefix for text keys for the display names of the item's individual types. This
	 * will be suffixed with the option name to get the final key (i.e. `"<typePrefix><optionName>"`). Defaults to
	 * `"<groupName><assetName>"`
	 */
	TypePrefix?: string;
	/**
	 * A prefix for text keys for chat messages triggered by the item. Chat message keys
	 * will include the name of the new option, and depending on the chat setting, the name of the previous option:
	 * - For chat setting `FROM_TO`: `<chatPrefix><oldOptionName>To<newOptionName>`
	 * - For chat setting `TO_ONLY`: `<chatPrefix><newOptionName>`
	 * Defaults to `"<GroupName><AssetName>Set"`
	 */
	ChatPrefix?: string | ExtendedItemChatCallback<ExtendedItemOption>;
	/**
	 * A prefix for text keys for NPC dialog. This will be suffixed with the option name
	 * to get the final NPC dialogue key (i.e. `"<npcPrefix><optionName>"`. Defaults to `"<groupName><assetName>"`
	 */
	NpcPrefix?: string;
}

/**
 * An object containing typed item configuration for an asset. Contains all of the necessary information for the item's
 * load, draw & click handlers.
 */
interface TypedItemData {
	/** The asset reference */
	asset: Asset;
	/** The list of extended item options available for the item */
	options: ExtendedItemOption[];
	/** A key uniquely identifying the asset */
	key: string;
	/** The common prefix used for all extended item functions associated with the asset */
	functionPrefix: string;
	/** A record containing various dialog keys used by the extended item screen */
	dialog: {
		/** The dialog key for the item's load text (usually a prompt to select the type) */
		load: string;
		/** The prefix used for dialog keys representing the display names of the item's types */
		typePrefix: string;
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chatPrefix: string | ExtendedItemChatCallback<ExtendedItemOption>;
		/** The prefix used for dialog keys representing an NPC's reactions to item type changes */
		npcPrefix: string;
	};
	/**
	 * An array of the chat message tags that should be included in the item's
	 * chatroom messages. Defaults to [{@link CommonChatTags.SOURCE_CHAR}, {@link CommonChatTags.DEST_CHAR}]
	 */
	chatTags: CommonChatTags[];
	/**
	 * Contains custom dictionary entries in the event that the base ones do not suffice.
	 */
	dictionary?: TypedItemDictionaryCallback[];
	/**
	 * The chat message setting for the item. This can be provided to allow
	 * finer-grained chatroom message keys for the item. Defaults to {@link TypedItemChatSetting.TO_ONLY}
	 */
	chatSetting?: TypedItemChatSetting;
	/** A boolean indicating whether or not images should be drawn in this item's extended item menu. Defaults to `true` */
	drawImages?: boolean;
	/**
	 * A boolean indicating whether or not the item's type can be changed while the
	 * item is locked (if set to false, the player must be able to unlock the item to change its type). Defaults to `true`
	 */
	changeWhenLocked?: boolean;
	/**
	 * An optional validation callback function which can be used by
	 * items to run additional validation for cases that aren't covered by configuration
	 */
	validate?: ExtendedItemValidateCallback<ExtendedItemOption>;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored
	 */
	scriptHooks?: {
		load?: (next: () => void) => void,
		click?: (next: () => void) => void,
		draw?: (next: () => void) => void,
		exit?: () => void,
		validate?: ExtendedItemValidateScriptHookCallback<ExtendedItemOption>,
	};
}

/**
 * @param {object} chatData - An object containing data about the type change that triggered the chat message
 * @param {Character} chatData.C - A reference to the character wearing the item
 * @param {ExtendedItemOption} chatData.previousOption - The previously selected type option
 * @param {ExtendedItemOption} chatData.newOption - The newly selected type option
 * @param {number} chatData.previousIndex - The index of the previously selected type option in the item's options
 * config
 * @param {number} chatData.newIndex - The index of the newly selected type option in the item's options config
 * @returns {[{ Tag: string, Text: string }]} - The dictionary entry to append to the dictionary.
 */
type TypedItemDictionaryCallback = (
	chatData: ExtendedItemChatData<ExtendedItemOption>
) => { Tag: string, Text: string };

/**
 * A parameter object containing information used to validate and sanitize character appearance update diffs. An
 * appearance update has a source character (the player that sent the update) and a target character (the character
 * being updated). What is allowed in an update varies depending on the status of the target character in relation to
 * the source character (i.e. whether they are the target's lover/owner, or the target themselves, and also whether or
 * not they have been whitelisted by the target).
 */
interface AppearanceUpdateParameters {
	/** The character whose appearance is being updated */
	C: Character;
	/** Whether or not the source player is the same as the target player */
	fromSelf: boolean;
	/**
	 * Whether or not the source player has permissions to use owner-only items (i.e. they are either the target
	 * themselves, or the target's owner)
	 */
	fromOwner: boolean;
	/**
	 * Whether or not the source player has permissions to use lover-only items (i.e. they are the target themselves,
	 * one of the target's lovers, or the target's owner, provided the target's lover rules permit their owner using
	 * lover-only items)
	 */
	fromLover: boolean;
	/** The member number of the source player */
	sourceMemberNumber: number;
}

/**
 * A wrapper object containing the results of a diff resolution. This includes the final item that the diff resolved to
 * (or null if the diff resulted in no item, for example in the case of item removal), along with a valid flag which
 * indicates whether or not the diff was fully valid or not.
 */
interface ItemDiffResolution {
	/**
	 * The resulting item after resolution of the item diff, or null if the diff resulted in no item being equipped in
	 * the given group
	 */
	item: Item | null;
	/**
	 * Whether or not the diff was fully valid. In most cases, an invalid diff will result in the whole appearance
	 * update being rolled back, but in some cases the change will be accepted, but some properties may be modified to
	 * keep the resulting item valid - in both situations, the valid flag will be returned as false, indicating that a
	 * remedial appearance update should be made by the target player.
	 */
	valid: boolean;
}

/**
 * A wrapper object containing the results of an appearance validation. Contains a sanitized appearance array and a
 * valid flag which indicates whether or not the appearance was fully valid or not.
 */
interface AppearanceValidationWrapper {
	/** The resulting appearance after validation */
	appearance: Item[];
	/**
	 * Whether or not the appearance was valid. A value of false indicates that the appearance has been modified, and a
	 * remedial appearance update should be made by the target player.
	 */
	valid: boolean;
}

//#endregion

//#region Vibrating Items

/** An object containing the extended item definition for a vibrating asset. */
type VibratingItemAssetConfig = ExtendedItemAssetConfig<"vibrating", VibratingItemConfig>;

/** An object defining all of the required configuration for registering a vibrator item */
interface VibratingItemConfig {
	/** The list of vibrator mode sets that are available on this item */
	Options?: VibratorModeSet[];
}

interface VibratingItemData {
	/** A key uniquely identifying the asset */
	key: string;
	/** The asset reference */
	asset: Asset;
	/** The list of extended item options available for the item */
	options: VibratorModeSet[];
	/** The common prefix used for all extended item screen functions associated with the asset */
	functionPrefix: string;
	/** The common prefix used for all dynamic asset hook functions for the asset */
	dynamicAssetsFunctionPrefix: string;
}

/**
 * A wrapper object defining a vibrator state and intensity
 */
interface StateAndIntensity {
	/** The vibrator state */
	State: VibratorModeState;
	/** The vibrator intensity */
	Intensity: VibratorIntensity;
}

//#endregion

//#region Variable Height items

/** An object containing the extended item definition for a variable height asset. */
type VariableHeightAssetConfig = ExtendedItemAssetConfig<"variableheight", VariableHeightConfig>;

interface VariableHeightConfig {
	/** The highest Y co-ordinate that can be set  */
	MaxHeight: number;
	/** The lowest Y co-ordinate that can be set  */
	MinHeight: number;
	/** Settings for the range input element the user can use to change the height */
	Slider: VariableHeightSliderConfig;
	/** A record containing various dialog keys used by the extended item screen */
	Dialog: VariableHeightDialogConfig;
	/**
	 * An array of the chat message tags that should be included in the item's
	 * chatroom messages. Defaults to [{@link CommonChatTags.SOURCE_CHAR}, {@link CommonChatTags.DEST_CHAR}]
	 */
	ChatTags?: CommonChatTags[];
	/** The function that handles finding the current variable height setting */
	GetHeightFunction?: Function;
	/** The function that handles applying the height setting to the character */
	SetHeightFunction?: Function;
	/** The default properties for the item, if not provided from an extended item option */
	Property?: ItemProperties;
}

interface VariableHeightSliderConfig {
	/** The name of a supported thumbnail image in \CSS\Styles.css that will show the current position on the slider */
	Icon: string;
	/** The Y co-ordinate of the topmost point of the slider */
	Top: number;
	/** The height in pixels of the slider */
	Height: number;
}

interface VariableHeightDialogConfig {
	/**
	 * A prefix for text keys for chat messages triggered by the item. Chat message keys
	 * will include the name of the new option, and depending on the chat setting, the name of the previous option:
	 * - For chat setting `FROM_TO`: `<chatPrefix><oldOptionName>To<newOptionName>`
	 * - For chat setting `TO_ONLY`: `<chatPrefix><newOptionName>`
	 * Defaults to `"<GroupName><AssetName>Set"`
	 */
	ChatPrefix?: string | ExtendedItemChatCallback<ExtendedItemOption>;
	/**
	 * A prefix for text keys for NPC dialog. This will be suffixed with the option name
	 * to get the final NPC dialogue key (i.e. `"<npcPrefix><optionName>"`. Defaults to `"<groupName><assetName>"`
	 */
	NpcPrefix?: string;
}

/**
 * An object containing typed item configuration for an asset. Contains all of the necessary information for the item's
 * load, draw & click handlers.
 */
interface VariableHeightData {
	/** The asset reference */
	asset: Asset;
	/** A key uniquely identifying the asset */
	key: string;
	/** The common prefix used for all extended item functions associated with the asset */
	functionPrefix: string;
	/** The highest Y co-ordinate that can be set  */
	maxHeight: number;
	/** The lowest Y co-ordinate that can be set  */
	minHeight: number;
	/** Settings for the range input element the user can use to change the height */
	slider: VariableHeightSliderConfig;
	/** The initial property to apply */
	defaultProperty: ItemProperties;
	/** A record containing various dialog keys used by the extended item screen */
	dialog: {
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chatPrefix: string | ExtendedItemChatCallback<ExtendedItemOption>;
		/** The prefix used for dialog keys representing an NPC's reactions to item type changes */
		npcPrefix: string;
	};
	/**
	 * An array of the chat message tags that should be included in the item's
	 * chatroom messages. Defaults to [{@link CommonChatTags.SOURCE_CHAR}, {@link CommonChatTags.DEST_CHAR}]
	 */
	chatTags: CommonChatTags[];
	/** The function that handles finding the current variable height setting */
	getHeight: Function;
	/** The function that handles applying the height setting to the character */
	setHeight: Function;
	/** The list of extended item options the current option was selected from, if applicable */
	parentOptions: ExtendedItemOption[];
}

//#endregion

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface ICommand {
	Tag: string;
	Description?: string;
	Reference?: string;
	Action?: (this: Optional<ICommand, 'Tag'>, args: string, msg: string, parsed: string[]) => void
	Prerequisite?: (this: Optional<ICommand, 'Tag'>) => boolean;
	AutoComplete?: (this: Optional<ICommand, 'Tag'>, parsed: string[], low: string, msg: string) => void;
	Clear?: false;
}

type PokerPlayerType = "None" | "Set" | "Character";
type PokerPlayerFamily = "None" | "Player";

interface PokerPlayer {
	Type: PokerPlayerType;
	Family: PokerPlayerFamily;
	Name: string;
	Chip: number;

	/* Runtime values */
	Difficulty?: number;
	Hand?: any[];
	HandValue?: number;
	Cloth?: Item;
	ClothLower?: Item;
	ClothAccessory?: Item;
	Panties?: Item;
	Bra?: Item;
	Character?: Character;
	Data?: {
		cache: Record<any, any>;
	};
	Image?: void;
	TextColor?: string;
	TextSingle?: string;
	TextMultiple?: string;
	WebLink?: string;
	Alternate?: void;
}

// #region Online Games

/**
 * Online game status values.
 *
 * @property "" - The game is in the setup phase.
 * @property "Running" - The game is currently running.
 *
 * @fix FIXME: "" should really be renamed Setup
 */
type OnlineGameStatus = "" | "Running";

interface GameLARPParameters {
	Status: OnlineGameStatus;
	Class: string;
	Team: string;
	TimerDelay: number;
	Level: {
		Name: string;
		Level: number;
		Progress: number;
	}[];
}

interface GameMagicBattleParameters {
	Status: OnlineGameStatus;
	House: string;
	TeamType: "FreeForAll" | "House";
}

interface GameGGTSParameters {
	Level: number;
	Time: number;
	Strike: number;
	Rule: string[];
}

// #endregion

// #region Audio

type AudioSoundEffect = [string, number];

interface AudioEffect {
	/** The sound effect name */
	Name: string;

	/** The sound file, or files to choose from randomly */
	File: string | string[];
}

/**
 * Sound effect detector for chat messages.
 */
interface AudioChatAction {
	/** Is that action applicable for that chat message? */
	IsAction: (data: IChatRoomMessage) => boolean;

	/** Extracts the actual sound effect from the chat message */
	GetSoundEffect: (data: IChatRoomMessage) => (AudioSoundEffect | string | null);
}

// #endregion

// #region Character drawing

/**
 * A callback function used for clearing a rectangular area of a canvas
 * @param {number} x - The x coordinate of the left of the rectangle to clear
 * @param {number} y - The y coordinate of the top of the rectangle to clear
 * @param {number} w - The width of the rectangle to clear
 * @param {number} h - The height of the rectangle to clear
 */
type ClearRectCallback = (x: number, y: number, w: number, h: number) => void;

/**
 * A callback function used to draw a canvas on a canvas
 * @param {HTMLImageElement | HTMLCanvasElement} Img - The canvas to draw
 * @param {number} x - The x coordinate to draw the canvas at
 * @param {number} y - The y coordinate to draw the canvas at
 */
type DrawCanvasCallback = (
	img: HTMLImageElement | HTMLCanvasElement,
	x: number,
	y: number,
	alphaMasks?: RectTuple[],
) => void;

/**
 * A callback function used to draw an image to a canvas
 * @param {string} src - The URL of the image to draw
 * @param {number} x - The x coordinate to draw the image at
 * @param {number} y - The y coordinate to draw the image at
 * @param {RectTuple[]} [alphaMasks] - A list of alpha masks to apply to the image when drawing
 * @param {number} [opacity=1] - The opacity at which to draw the image with
 * @param {boolean} [rotate=false] - If the image should be rotated by 180 degrees
 */
type DrawImageCallback = (
	src: string,
	x: number,
	y: number,
	alphasMasks: RectTuple[],
	opacity?: number,
	rotate?: boolean,
) => void;

/**
 * A callback function used to draw a colorized image to a canvas
 * @callback drawImageColorize
 * @param {string} src - The URL of the image to draw
 * @param {number} x - The x coordinate to draw the image at
 * @param {number} y - The y coordinate to draw the image at
 * @param {string} color - The color to apply to the image
 * @param {boolean} fullAlpha - Whether or not to apply color to the entire image
 * @param {RectTuple[]} [alphaMasks] - A list of alpha masks to apply to the image when drawing
 * @param {number} [opacity=1] - The opacity at which to draw the image with
 * @param {boolean} [rotate=false] - If the image should be rotated by 180 degrees
 */
type DrawImageColorizeCallback = (
	src: string,
	x: number,
	y: number,
	color: string,
	fullAlpha: boolean,
	alphaMasks?: RectTuple[],
	opacity?: number,
	rotate?: boolean,
) => void;

interface CommonDrawCallbacks {
	/**
	 * A callback to clear an area of the main character canvas
	 */
	clearRect: ClearRectCallback;
	/**
	 * A callback to clear an area of the blink character canvas
	 */
	clearRectBlink: ClearRectCallback;
	/**
	 * Function used to draw a canvas on top of the normal canvas
	 */
	drawCanvas: DrawCanvasCallback;
	/**
	 * Function used to draw a canvas on top of the blink canvas
	 */
	drawCanvasBlink: DrawCanvasCallback;
	/**
	 * A callback to draw an image to the main character canvas
	 */
	drawImage: DrawImageCallback;
	/**
	 * A callback to draw an image to the blink character canvas
	 */
	drawImageBlink: DrawImageCallback;
	/**
	 * A callback to draw a colorized image to the main character canvas
	 */
	drawImageColorize: DrawImageColorizeCallback;
	/**
	 * A callback to draw a colorized image to the blink character canvas
	 */
	drawImageColorizeBlink: DrawImageColorizeCallback;
}

interface DynamicDrawingData {
	C: Character;
	X: number;
	Y: number;
	CA: Item;
	GroupName: AssetGroupName;
	Color: string;
	Opacity: number;
	Property: ItemProperties;
	A: Asset;
	G: string;
	AG: AssetGroup;
	L: string;
	Pose: string;
	LayerType: string;
	BlinkExpression: string;
	drawCanvas: DrawCanvasCallback;
	drawCanvasBlink: DrawCanvasCallback;
	AlphaMasks: RectTuple[];
	PersistentData: <T>() => T;
}

/**
 * Drawing overrides that can be returned by a dynamic BeforeDraw function
 */
interface DynamicBeforeDrawOverrides {
	Property?: ItemProperties;
	CA?: Item;
	GroupName?: AssetGroupName;
	Color?: ItemColor;
	Opacity?: number;
	X?: number;
	Y?: number;
	LayerType?: string;
	L?: string;
	AlphaMasks?: RectTuple[];
}

/**
 * A dynamic BeforeDraw callback
 */
type DynamicBeforeDrawCallback = (data: DynamicDrawingData) => DynamicBeforeDrawOverrides;

/**
 * A dynamic AfterDraw callback
 */
type DynamicAfterDrawCallback = (data: DynamicDrawingData) => void;

/**
 * A dynamic ScriptDraw callback
 */
type DynamicScriptDrawCallback = (data: {C: Character, Item: Item, PersistentData: <T>() => T}) => void;

// #endregion

//#region Infiltration/Pandora

type InfiltrationTargetType = "NPC" | "USBKey" | "BDSMPainting" | "GoldCollar" | "GeneralLedger" | "SilverVibrator" | "DiamondRing" | "SignedPhoto" | "PandoraPadlockKeys";

interface InfiltrationMissionTarget {
	Type: InfiltrationTargetType;
	Found: boolean;
	Fail: boolean;
	Name: string;
	PrivateRoom: boolean;
}

type PandoraDirection = "North" | "South" | "East" | "West";
type PandoraFloorDirection = "StairsUp" | "StairsDown" | PandoraDirection;
type PandoraFloors = "Ground" | "Second" | "Underground";

interface PandoraSpecialRoom {
	Floor: "Exit" | "Search" | "Rest" | "Paint";
}

interface PandoraBaseRoom {
	Floor: PandoraFloors;
	Background: string;
	Character: NPCCharacter[];
	Path: (PandoraBaseRoom | PandoraSpecialRoom)[];
	PathMap: PandoraBaseRoom[];
	Direction: string[];
	DirectionMap: string[];

	/* SearchRoom */
	SearchSquare?: {
		X: number;
		Y: number;
		W: number;
		H: number;
	}[];
	ItemX?: number;
	ItemY?: number;

	/* PaintRoom */
	Graffiti?: number;
}

//#endregion

//#region Crafting items

interface CraftingItem {
	Name: string;
	Description: string;
	Property: string;
	Color: string;
	Lock: AssetLockType;
	Item: string;
	Private: boolean;
	Type: string;
}

//#endregion

interface InventoryItem {
	Group: string;
	Name: string;
	Asset: Asset;
}

interface NotificationSetting {
	AlertType: number;
	Audio: number;
}
