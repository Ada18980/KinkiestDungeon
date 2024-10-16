type Named = {
	name: string,
	inventoryVariant?: string,
}

interface NamedAndTyped extends Named {
	/** Type of the item*/
	type?: string,
}

interface KDOutfitMetadata {
	name: string,
	palette: string,
}

/** Kinky Dungeon Typedefs*/
interface item extends NamedAndTyped {
	/** Which NPC its on */
	onEntity?: number,
	/** Is magically conjured. Cannot be added back to inventory */
	conjured?: boolean,
	/* ID of the item */
	id: number,
	/** Used in order to boost performance */
	linkCache?: string[],
	/** If the item has a different curse from the base curse */
	curse?: string,
	/** Name of the item*/
	name: string,
	/** Type of the item*/
	type?: string,
	/** Faction of the applied item */
	faction?: string,
	/** When added to the inventory, is added as a different item instead. Good for cursed items! */
	inventoryVariant?: string,
	/** Events associated with the item*/
	//weapon?: KinkyDungeonWeapon, /** Item weapon data, if applicable*/
	//consumable?: any, /** Item consumable data, if applicable*/
	events?: KinkyDungeonEvent[],
	/** Number of consumables in the inventory*/
	quantity?: number,
	//looserestraint?: any, /** Loose restraint data, if applicable*/
	//restraint?: any, /** Which restraint the item is associated with*/
	/** Type of lock, Red, Blue, or Gold (potentially more in future)*/
	lock?: string,
	/** Bool to describe if the item is tethered to the leashing enemy*/
	tetherToLeasher?: boolean,
	/** Bool to describe if the item is tethered to KinkyDungeonJailGuard()*/
	tetherToGuard?: boolean,
	/** ID of leashing enemy*/
	tetherEntity?: number,
	/** Leashing location*/
	tetherLocation?: {x: number, y: number},
	/** Location of the tether*/
	tx?: number,
	/** Location of the tether*/
	ty?: number,
	/** Length of the tether*/
	tetherLength?: number,
	/** Stores the previously linked item*/
	dynamicLink?: item,
	/** Generic item data, able to be manipulated thru events*/
	data?: Record<string, any>,
	/** Escape progress tracking*/
	pickProgress?: number,
	/** Escape progress tracking*/
	struggleProgress?: number,
	/** Escape progress tracking*/
	cutProgress?: number,
	/** Escape progress tracking*/
	unlockProgress?: number,
	/** Number of escape attempts, integer*/
	attempts?: number,
	/** Can be used to make an item tighter and harder to escape, reduces with each escape attempt*/
	tightness?: number,
	/** Determines the current trap attached to the restraint*/
	trap?: string,
	/** Can make the item itself show in quick inv*/
	showInQuickInv?: boolean,
}

interface consumable extends NamedAndTyped {
	name: string,
	/** 1 - (Rarity * sub value) = sub threshold */
	sub?: number,
	rarity: number,
	type: string,
	/** used solely for shop */
	uniqueTags?: string[],
	shop?: boolean,
	spell?: string,
	potion?: boolean,
	noHands?: boolean,
	arousalMode?: boolean,
	/** Data var */
	data?: Record<string, string|number>,
	/** Requirement that overrides all other requirements */
	prereq?: string,
	/** Requirement in addition to all other requirements such as not being gagged for potions, bound, etc */
	postreq?: string,
	/** Minimum effectiveness when gagged */
	gagFloor?: number,
	/** Max gag amount to use */
	gagMax?: number,
	/** delay before use */
	delay?: number,
	needMouth?: boolean,
	/** Max strictness allowed before the item cant be used */
	maxStrictness?: number,
	mp_instant?: number,
	mpool_instant?: number,
	wp_instant?: number,
	sp_instant?: number,
	ap_instant?: number,
	mp_gradual?: number,
	wp_gradual?: number,
	sp_gradual?: number,
	ap_gradual?: number,
	arousalRatio?: number,
	scaleWithMaxMP?: boolean,
	scaleWithMaxSP?: boolean,
	scaleWithMaxAP?: boolean,
	scaleWithMaxWP?: boolean,
	duration?: number,
	power?: number,
	amount?: number,
	rechargeCost?: number,
	aura?: string,
	buff?: string,
	costMod?: number,
	shrine?: string,
	sfx?: string,
	noConsumeOnUse?: boolean,
	useQuantity?: number,
	/** Support for multiple effects */
	sideEffects?: string[],
}

type KDHasTags = {
	tags: any
}

interface KDRestraintProps extends KDRestraintPropsBase {
	name: string,
	Group: string,
}

interface KDRestraintPropsBase {
	/** Type of gag this turns into when used to gag the player */
	necklaceGagType?: string,
	/** Used in standalone to replace Color */
	Filters?: Record<string, LayerFilter>,
	/** Used in standalone to replace Properties */
	Properties?: Record<string, LayerProperties>,
	/** Forces this restraint to always be conjured when applied to NPCs*/
	forceConjure?: boolean,
	/** TODO Used in standalone to indicate which faction colors map to which filter
	 * color is the faction color type
	 * override is whether the faction color overrides the filter. If true it will replace the filter in the model. If false it will apply it over the model's filter. Currently unused
	*/
	factionFilters?: Record<string, {color: string, override: boolean}>,
	/** This item is unaffected by shrines */
	noShrine?:boolean,
	/** This item is beneficial and player wont try to struggle from it */
	good?: boolean,

	inventory?: boolean,
	power?: number,
	weight?: number,
	minLevel?: number,
	allFloors?: boolean,
	cloneTag?: string,

	escapeChance?: any,

	events?: KinkyDungeonEvent[],
	enemyTags?: Record<string, number>,
	enemyTagsMult?: Record<string, number>,
	playerTags?: Record<string, number>,
	playerTagsMult?: Record<string, number>,
	/** Like playerTags, but applies if there is NOT the playertag */
	playerTagsMissing?: Record<string, number>,
	/** Like playerTags, but applies if there is NOT the playertag*/
	playerTagsMissingMult?: Record<string, number>,
	shrine?: string[],

	debris?: string,
	debrisChance?: number,

	/** This item is not kept in the lost items chest unless it is magical */
	noRecover?: boolean,

	/** These items can only be applied if an enemy has the items in her inventory or the unlimited enemy tag */
	limited?: boolean,
	/** Forced to allow these, mainly leashes and collars */
	unlimited?: boolean,
	/** Struggling out of this item breaks it permanently. You can avoid this by using Remove to get the last bit if possible */
	struggleBreak?: boolean,

	/** Security levels for chastity. Non-tech belts should have a Tech security of undefined. Magic belts should have undefined for key and tech.
	 * KEY can be circumvented by having a key. Normally you cant remove a plug but you can spend a key to unlock a plug slot for 30 turns or until you are hit or a restraint is removed in that slot.
	 * 	Key difficulty of 1 can simply be lockpicked, taking a bit of time.
	 * 	Key difficulty of 3 becomes a blue key.
	 * MAGIC can be circumvented thru CMD: Unlock
	 * Tech cannot be circumvented by the player. TODO add keycard to allow this.
	 * Undefined means the specified method can not be used
	 * Chastity without Security ignores the security system
	 * NPC ability to unlock is OR. Having the ability to unlock just one of the security levels means the NPC can unlock.
	*/
	Security?: {
		/** Key security level, for low-tech non-mage factions */
		level_key?: number,
		/** Tech security level, for robots and wolfgirls */
		level_tech?: number,
		/** Magic security level, for mage factions */
		level_magic?: number,
	},

	npcBondageMult?: number,
	npcBondageType?: string,
	/**
	 * Subjective modifier for how pissed off an enemy has to be in order to use this item on you. Good for items that "tighten" for example.
	 * The effects are not straightforward, but some of the things a higher aggro level will do in the future (TODO) are:
	 * - reduce likelihood of duplicates
	 * - reduce likelihood of the item if another item in the same slot already shares some enemyTags with the item
	 * - reduce likelihood of stacking or linking under another item in the same slot
	 *
	 * General range is 0-10 with 0 being the default and 10 being a last resort high security measure
	 */
	aggroLevel?: number,

	/** Affinity type: Hook, Edge, or Sharp, Sticky, defaults are Hook (struggle), Sharp (Cut), Edge (Pick), Sticky (Unlock), and none (Pick)*/
	affinity?: {
		Struggle?: string[],
		Cut?: string[],
		Remove?: string[],
		Pick?: string[],
		Unlock?: string[],
	},
	/**
	 * Makes it so its never impossible to struggle with these methods, usually best combined with struggleMinSpeed
	 */
	alwaysEscapable?: string[];
	/**
	 * Makes it so enemies, if they would remove this item to place another restraint on, will simply remove this item instead
	 * Higher number means resistance to multibind
	 */
	protection?: number;
	/**
	 * This item is cursed but still provides protection
	 */
	protectionCursed?: boolean;
	/**
	 * This item provides protection even if its group is NOT being targeted
	 */
	protectionTotal?: boolean;
	/** Determines if the item appears in aroused mode only */
	arousalMode?: boolean,
	/** This item lets you access linked items under it */
	accessible?: boolean,
	/** This item lets you CANT access linked items under it */
	inaccessible?: boolean,
	/** This item lets you ignore its inaccessibility for the sake of trussing up the player */
	deepAccessible?: boolean,
	/** WIP, does nothing yet. Should allow you to access the item under even inaccessible stuff */
	alwaysAccessible?: boolean,
	/** Always inaccessible if something is on top of it */
	alwaysInaccessible?: boolean,
	/** Recycler resources yielded when recycled (not crafted, though craft bp will mimic this by default) */
	recycleresource?: Record<string, number>,
	/** This item can be rendered when linked */
	renderWhenLinked?: string[];
	// Player must have one of these PlayerTags to equip
	requireSingleTagToEquip?: string[];
	noRecycle?: boolean,
	/** Disassembles into a raw item */
	disassembleAs?: string,
	/** Disassembles into a raw item */
	disassembleCount?: number,
	// Player must have all of these PlayerTags to equip
	requireAllTagsToEquip?: string[];
	/** This item always renders when linked */
	alwaysRender?: boolean,
	/** When the mentioned items are rendered, changes the type */
	changeRenderType?: Record<string, string>;
	/** AFTER a link, the items will get sorted based on if the order makes sense and there are no inaccessible things blocking. */
	linkPriority?: number;
	/** Stacking category, used to determine if you can have multiple of these items in a stack */
	linkCategory?: string;
	/** Stacking size, can't exceed 1 */
	linkSize?: number;
	/** Stacking category, used to determine if you can have multiple of these items in a stack */
	linkCategories?: string[];
	/** Stacking size, can't exceed 1 */
	linkSizes?: number[];
	/** Even with the link size, this one can't be duplicated */
	noDupe?: boolean;
	/** Enemies ignore you while you are wearing it */
	ignoreNear?: boolean,
	/** Enemies wont cast spells or ranged attacks while you are wearing it */
	ignoreSpells?: boolean,
	/** Can always struggle even if it's blocked */
	alwaysStruggleable?: boolean,
	/** Model to use in standalone. Defaults to Asset */
	Model?: string,
	Asset?: string,
	/** Sell price of the item */
	value?: number,
	/** Used for when the visual asset in BC is different from the actual group of the item*/
	AssetGroup?: string,
	/** Dont render item if has the tags */
	hideTags?: string[],
	Color?: string[] | string,
	/** Maximum level, wont be used at this or higher. Inclusive. */
	maxLevel?: number,
	/** Determines the floors the restraint can appear on */
	floors?: Record<string, boolean>,
	/** Overrides escapeChance when you have a ghost helping*/
	helpChance?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},
	/** Determines the penalty to the escape chance at the limit--full struggle progress when struggling, and 0 for cut/remove/unlock/pick*/
	limitChance?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},
	speedMult?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},
	struggleMinSpeed?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},
	struggleMaxSpeed?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},
	/** Multiplier to struggle power */
	struggleMult?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},
	/** Multiplier to limit chance */
	limitMult?: {
		Struggle?: number,
		Cut?: number,
		Remove?: number,
		Pick?: number,
		Unlock?: number,
	},

	/** Sound when using an escape method*/
	sfxEscape?: {
		Struggle?: string,
		Cut?: string,
		Remove?: string,
		Pick?: string,
		Unlock?: string,
		NoStamina?: string,
		NoWill?: string,
		NoMagic?: string,
		MagicCut?: string,
		PickBreak?: string,
		KnifeBreak?: string,
		KnifeDrop?: string,
		KeyDrop?: string,
		PickDrop?: string,
		Blocked?: string,
	},
	sfxFinishEscape?: {
		Struggle?: string,
		Cut?: string,
		Remove?: string,
		Pick?: string,
		Unlock?: string,
		Destroy?: string,
	}
	/** Remove sound */
	sfxRemove?: string,
	/** Equip sound */
	sfx?: string,
	/* useful for easily extending sounds */
	sfxGroup?: string,
	/** The vibrator will start vibing whenever another linked vibe starts */
	linkedVibeTags?: string[],
	vibeLocation?: string,
	showInQuickInv?: boolean,
	/** The item is a chastity belt */
	chastity?: boolean,
	/** The item is a chastity bra */
	chastitybra?: boolean,
	/** The item is a piercing */
	piercing?: boolean,
	/** The item rubs against the crotch when you move or struggle*/
	crotchrope?: boolean,
	/** The item provides distraction when you walk around*/
	plugSize?: number,
	/** Binding arms hurts a lot of things but isn't as punishing as hands */
	bindarms?: boolean,
	/** Hands count as bound for struggling purposes */
	restricthands?: number,
	/** Binding hands prevents use of weapons and picks */
	bindhands?: number,
	/** harnesses allow enemies to grab you and slow you */
	harness?: boolean,
	/** hobble is the simplest kind of slowing restraint, increasing slow by this amount*/
	hobble?: number,
	/** Multiplier to the max heel level */
	heelpower?: number,
	/** Blocking feet is for restraints that tie the legs together, forcing the player into SLow Level 2 or higher */
	blockfeet?: boolean,
	/** restricvtion bonus */
	restriction?: number,
	/** Your total gag level is the sum of the gag values of all your variables. Ball gags have 0.3-0.75 based on size and harness, muzzles are 1.0 */
	gag?: number,
	/** Higher value = higher vision loss */
	blindfold?: number
	/** Maximum stamina percentage the player can have in order for the restraint to be applied. 0.25-0.35 for really strict stuff, 0.9 for stuff like ball gags, none for quick restraints like cuffs */
	maxwill?: number,
	Type?: string,
	/** Item is removed when the wearer goes to prison */
	removePrison?: boolean,
	/** stronger version */
	forceRemovePrison?: boolean,
	/** Changes the dialogue text when you fail to remove the item */
	failSuffix?: Record<string, string>,
	/** Custom equip message */
	customEquip?: string,
	/** Custom success message */
	customEscapeSucc?: string,
	/** Changes the dialogue text when you try to struggle completely */
	specStruggleTypes?: string[],
	/** List of Groups removed */
	remove?: string[],
	/** List of tags removed */
	removeShrine?: string[],
	slimeLevel?: number,
	addTag?: string[],
	addPose?: string[],
	/** Adds a pose (standalonepatched only) if this is the top level restraint */
	addPoseIfTopLevel?: string[],
	forbidPose?: string[],
	removePose?: string[],
	OverridePriority?: number,
	Modules?: number[],
	/** When added to the inventory, is added as a different item instead. Good for multiple stages of the same item, like cuffs */
	inventoryAs?: string,
	/** When added to the inventory by self, is added as a different item instead. Good for multiple stages of the same item, like cuffs */
	inventoryAsSelf?: string,
	/** The item is always kept in your inventory no matter how it gets removed, so long as you don't cut it */
	alwaysKeep?: boolean,
	/** The jailer won't remove these */
	noJailRemove?: boolean,
	/** Increases the difficulty of other items */
	strictness?: number,
	/** Overrides the existing strictness zones for the item's group */
	strictnessZones?: string[],
	/** Can be linked by items with this shrine category */
	LinkableBy?: string[],
	DefaultLock?: string,
	HideDefaultLock?: boolean,
	Link?: string,
	UnLink?: string,
	/** Removes when the player is leashed */
	removeOnLeash?: boolean,
	/** player is enclosed */
	enclose?: boolean,
	/** ignore the player if player is 0 stamina and the enemy is non leashing */
	ignoreIfNotLeash?: boolean,
	/** Default tether length */
	tether?: number,
	leash?: boolean,
	/** The vibe can be remote controlled by enemies */
	allowRemote?: boolean,
	/** Multiplies the escape chance */
	escapeMult?: number,
	/** Outfit to force */
	forceOutfit?: string,
	/** Outfit to force (priority default = base power) */
	forceOutfitPriority?: number,
	/** Clothes for dressing */
	alwaysDress?: overrideDisplayItem[],
	/** Clothes for dressing */
	alwaysDressModel?: alwaysDressModel[],
	/** The item always bypasses covering items, such as dresses and chastity belts */
	bypass?: boolean,
	/** The item can only be cut with magical implements */
	magic?: boolean,
	/** The item is regarded as a non-binding item, so the game knows how to handle it. Used for stuff like cuffs which are not binding by default */
	nonbinding?: boolean,
	/** The item is regarded as a binding item, so the game knows how to handle it. Used for stuff that should be considered binding but aren't due to KDIsBinding() not recognizing it */
	binding?: boolean,
	/** Instantly forces a high slow level, for stuff like slime */
	freeze?: boolean,
	/** Immobilizes the player */
	immobile?: boolean,
	/** The item CAN be trapped, which triggers when you struggle out */
	trappable?: boolean,
	/** The item can only be removed through a special condition known as a curse */
	curse?: string,
	/** The extra difficulty the item adds to the global difficulty var */
	difficultyBonus?: number,
	/** Whether or not the angels will take it off when you call them */
	divine?: boolean,
	/** If this is enabled, then you can spend ancient energy to use a potion at no reduction to potion effectiveness while gagged */
	potionCollar?: boolean,
	/** Always allows potions while this restraint is on */
	allowPotions?: boolean,
	/** Allows the user to walk across slime */
	slimeWalk?: boolean,
	/** Allows the user to walk across soap */
	soapWalk?: boolean,
	/** Allows the user to walk across ice (unused) */
	iceWalk?: boolean,
	/** Amount of ancient energy it draws per turn */
	enchantedDrain?: number,
	/** Whether or not this is an Ancient item, prison respects it */
	enchanted?: boolean,
	/** Whether or not this is special in some way*/
	special?: boolean,
	/** Faction color index */
	factionColor?: number[][],

	/** Determines if it gets hidden by the 'Hide Armor' option */
	armor?: boolean,
	/** The item can be linked by anything on top*/
	LinkAll?: boolean,
	/** The item can be linked over anything below*/
	AlwaysLinkable?: boolean,
	/** The item always renders items below*/
	UnderlinkedAlwaysRender?: boolean,
	/** The item cannot be linked over anything */
	NoLinkOver?: boolean,
	/** Power to display, not actual power */
	displayPower?: number,
};

interface restraint extends KDRestraintProps {
	power: number,
	preview?: string,
	/** Special condition for quick binding! */
	quickBindCondition?: string,
	/** Multiplier to bondage strength if target isn't disabled */
	quickBindMult?: number,
	/** Base weight of the restraint, required */
	weight: number,
	minLevel: number,

	deaf?: number,

	Color?: string[] | string,

	/** Descriptor for tightness, e.g. Secure, Thick */
	tightType?: string,

	escapeChance: any,

	enemyTags: Record<string, number>,
	/** Multiplies the weight AFTER, useful for minimizing things */
	enemyTagsMult?: Record<string, number>,
	playerTags: Record<string, number>,
	shrine: string[],
	/** These tags cause the restraint to appear on all floors regardless of map*/
	ignoreFloorTags?: string[],
	/** These tags cause the restraint to appear on all floors regardless of minlevel*/
	ignoreMinLevelTags?: string[],
	/** These tags cause the restraint to appear on all floors regardless of maxlevel*/
	ignoreMaxLevelTags?: string[],
	/**
	 * A map of:
	 * key - Name of the ApplyVariant
	 * value - weight modifiers
	 */
	ApplyVariants?: Record<string, {weightMod: number, weightMult: number, playerTags?: Record<string, number>, playerTagsMult?: Record<string, number>, playerTagsMissing?: Record<string, number>, playerTagsMissingMult?: Record<string, number>, enemyTags: Record<string, number>, enemyTagsMult?: Record<string, number>}>,
}

interface KDEscapeChanceList {
	Struggle?: number,
	Cut?: number,
	Remove?: number,
	Pick?: number,
	Unlock?: number,
}

type outfitKey = string

type mapKey = string

interface floorParams {
	/** Weighted list of successor tileset, positive X */
	successorPositive: Record<string, number>;
	/** Weighted list of successor tileset, negative X */
	successorNegative: Record<string, number>;
	/** Weighted list of successor tileset, same X */
	successorSame: Record<string, number>;

	color: string,
	/** List of factions allowed to be primary or secondary here */
	factionList?: string[];
	/** This code is run after a worldgen */
	worldGenCode?: () => void;
	tagModifiers?: Record<string, number>;
	globalTags?: Record<string, boolean>;
	shadowColor?: number,
	lightColor?: number,
	background : string,
	openness : number, // Openness of rooms
	density : number, // Density of tunnels (inverse of room spawn chance)
	torchchance?: number,
	torchlitchance?: number,
	music: Record<string, number>,
	specialChests?: Record<string, number>,
	/** Will add more/less torches on the main path */
	torchchanceboring?: number,
	torchreplace?: {
		sprite: string,
		unlitsprite?: string,
		brightness: number,
	},
	/** These tiles wont alter wall tiles in this tileset */
	noReplace?: string,
	/** Chance of shrine having mana */
	manaChance?: number,
	crackchance : number,
	foodChance? : number,
	barchance : number,
	brightness : number,
	chestcount : number,
	shrinecount : number,
	shrinechance : number,
	ghostchance : number,
	/** Chance to have a closed door */
	doorchance: number,

	/** Chance to have an open door */
	nodoorchance : number,
	doorlockchance : number,
	/** Chance to replace a trap on a door tile with a doortrap instead of deleting the door. Default to trapchance */
	doorlocktrapchance? : number,
	/** Chance to replace a door with a lock */
	doortrapchance? : number,
	minortrapChance? : number,
	chargerchance?: number,
	litchargerchance?: number,
	chargercount?: number,
	trapchance : number,
	barrelChance? : number,
	grateChance : number,
	rubblechance : number,
	brickchance : number,
	cacheInterval : number,
	cageChance? : number,

	wallhookchance? : number,
	ceilinghookchance? : number,

	hallopenness? : number,

	/** FOrces all setpieces to use POIs, useful for tunnel type maps with thick walls to prevent entombe pieces*/
	forcePOI?: boolean,

	gaschance?: number,
	gasdensity?: number,
	gastype?: string,

	wallRubblechance?: number,

	lockmult?: number,

	floodchance? : number,
	forbiddenChance : number, // If a forbidden gold chance is generated. Otherwise a silver chest will appear
	forbiddenGreaterChance : number, // Chance after a forbidden area is generated with a restraint, otherwise its a lesser gold chest

	setpieces?: {Type: string, Weight: number}[],

	//shortcuts: {Level: number, checkpoint: string, chance:number}[	],
	//mainpath: {Level: number, checkpoint: string, chance?: number}[],

	traps: {Name: string, Faction?: string, Enemy?: string, Spell?: string, extraTag?: string, Level: number, Power: number, Weight: number, strict?: true, teleportTime?: number, filterTag?: string, filterBackup?: string, arousalMode?: boolean}[],

	min_width : number,
	max_width : number,
	min_height : number,
	max_height : number,
	deadend? : number,

	ShopExclusives? : string[],
	ShopExclusivesArousal? : string[],

	enemyTags: string[],
	"defeat_outfit": outfitKey,
	/**
	 * key required for jailers INSTEAD of "jailer"
	 */
	jailType?: string,
	guardType?: string,
	"shrines": {Type: string, Weight: number}[]
}

interface overrideDisplayItem {
	/** Bondage club asset */
	Item: string,
	/** Group */
	Group: string,
	/** Standalone model */
	Model?: string,
	/** Color */
	Color: string[]|string,
	/** Filters */
	Filters?: Record<string, LayerFilter>,
	/** Faction color index */
	factionColor?: number[][],
	/** Faction filter index */
	factionFilters?: Record<string, {color: string, override: boolean}>,
	/** Property for BC compat */
	Property?: any,
	/** Whether or not it overrides items already on */
	override?: boolean,
	/** Uses the player's hair color as the item color */
	useHairColor?: boolean,
	/** Used for overriding BC priority */
	OverridePriority?: number[]|number,
}
interface alwaysDressModel {
	/** Force faction if restraint doesnt have it */
	faction?: string,
	/** Standalone 5.0+ asset */
	Model: string,
	/** Group */
	Group?: string,
	/** Filters */
	Properties?: Record<string, LayerProperties>,
	/** Filters */
	Filters?: Record<string, LayerFilter>,
	/** Faction filter index */
	factionFilters?: Record<string, {color: string, override: boolean}>,
	/** Inherits the filters of the main */
	inheritFilters?: boolean,
	/** Whether or not it overrides items already on */
	override?: boolean,
	/** Uses the player's hair color as the item color */
	useHairColor?: boolean,
}

interface KDLoadout {name: string, tags?: string[], singletag: string[], singletag2?: string[], forbidtags: string[], chance: number, items?: string[], restraintMult?: number, multiplier?: number};

interface enemy extends KDHasTags {
	/** This enemy will always kite the player even if player is harmless*/
	alwaysKite?: boolean,
	/** This enemy will give an intro when it first sees you*/
	intro?: string,

	nameList?: string,

	/** Multiplier to tease damage */
	teaseMod?: number,

	/** These enemies always carry these items at the start */
	startingItems?: string[]

	/** Sound effects */
	SFX?: {
		/** Sound effect for dying */
		death?: string,
	},

	/** Restraint filters */
	RestraintFilter?: {
		/** Increases effective level */
		levelBonus?: number,
		/** Starts with more restraints!! */
		bonusRestraints?: number,
		/** This enemy can apply restraints without needing them in her pockets */
		unlimitedRestraints?: boolean,
		/** Forces stock, even if restraints are unlimited */
		forceStock?: boolean,
		/** Restraints applied must all be from inventory */
		invRestraintsOnly?: boolean,
		/** Restraints applied must all be limited */
		limitedRestraintsOnly?: boolean,
		/** Restraints with more power than this must be in inventory. Default is 3*/
		powerThresh?: number,
		/** These wont be added to the initial inventory 3*/
		ignoreInitial?: string[],
		/** These wont be added to the initial inventory 3*/
		ignoreInitialTag?: string[],
		/** This enemy won't restock restraints out of sight */
		noRestock?: boolean,
		/** Enemy will restock to this percentage */
		restockPercent?: number,
		/** These enemies always restock these restraint items if they dont have them */
		requiredItems?: string[]
	},



	/** Magical properties */
	Magic?: {
		/** Specific cooldown for each spell. For example, Fuuka's FuukaOrb can only be done every 10 turns */
		castCooldownUnique?: Record<string, number>,
		/** Priority for a spell choice */
		priority?: Record<string, number>,
	},

	/** Security levels for accessing chastity */
	Security?: {
		/** Key security level, for low-tech non-mage factions */
		level_key?: number,
		/** Tech security level, for robots and wolfgirls */
		level_tech?: number,
		/** Magic security level, for mage factions */
		level_magic?: number,
	},

	/** Graphical peculiarities */
	GFX?: {
		/** Custom sprite while lying in wait */
		AmbushSprite?: string,
		/** custom sprite width*/
		spriteWidth?: number,
		/** custom sprite height*/
		spriteHeight?: number,
		/** This enemy is affected by lighting */
		lighting?: boolean,

	},
	/** Sound properties */
	Sound?: {
		/** Sound multiplier while moving, default 6 */
		moveAmount?: number,
		/** Constant sound amount */
		baseAmount?: number,
		/** Cast sound amount */
		castAmount?: number,
		/** Attack sound amount */
		attackAmount?: number,
		/** alert sound amount */
		alertAmount?: number,
		/** Decay per turn */
		decay?: number,
	},

	/** Behavior tags */
	Behavior?: {
		/** This enemy will hold still when near the player */
		holdStillWhenNear?: boolean,
		/** If this is true, the intent is that it behaves more as an allied enemy rather than a summon */
		behaveAsEnemy?: boolean,
		/** This enemy will always want to add more restraints~ */
		thorough?: number,
		/** Can't play */
		noPlay?: boolean,
		/** Wont stop tying you until these groups are bound */
		ensureGroupTied?: string[],
		/** Wont stop tying you until these playertags are fulfilled */
		ensurePlayerTag?: string[],
		/** Wont stop tying you until these groups are bound (arousal mode only)*/
		ensureGroupTiedArousal?: string[],
		/** Wont stop tying you until these playertags are fulfilled (arousal mode only)*/
		ensurePlayerTagArousal?: string[],
	}

	/** This enemy wont appear outside of its designated floors even if it shares the tag */
	noOverrideFloor?: boolean,
	/** This tag will be added to the selection tags if the enemy has it, for loot and ambush spawning purposes */
	summonTags?: string[],
	/** This tag will be added to the selection tags if the enemy has it, for loot and ambush spawning purposes. Multiple copies will be pushed*/
	summonTagsMulti?: string[],
	/** If true, this enemy will always be bound to the enemy that summons it */
	alwaysBound?: boolean,
	/** These enemies wont appear in distracted mode */
	arousalMode?: boolean,
	name: string,
	/** Special dialogue played when clicked on instead of standard ally dialogue */
	specialdialogue?: string,
	/** Overrides the default weight reduction for being outside of a miniboss/boss/minor/elite box */
	outOfBoxWeightMult?: number,
	/** Tags, used for determining weaknesses, spawning, restraints applied, and rank*/
	tags: Record<string, boolean>,
	/** Spell resist, formula is spell damage taken = 1 / (1 + spell resist) */
	spellResist?: number,
	/** Whether or not the enemy is friendly to the player and attacks enemies */
	allied?: boolean,
	/** Enemies will prioritize this enemy less than other enemies. Used by allies only. */
	lowpriority? : boolean,
	/** lookup condition in KDPathConditions,
	 * basically allows enemies to path through an immobile enemy under certain circumstances */
	pathcondition?: string,
	/** Generates token chance = 1 - 1 / (1 + evasion) */
	evasion?: number,
	/** Generates token chance = 1 - 1 / (1 + block) */
	block?: number,
	/** Amount enemy blocks */
	blockAmount?: number,
	maxdodge?: number,
	maxblock?: number,
	preferDodge?: boolean,
	preferBlock?: boolean,
	/** */
	armor?: number,
	/** Starting data */
	data?: Record<string,string>,
	/** HIde timer */
	hidetimerbar?: boolean,
	Attack?: {
		mustBindorFail?: boolean,
	},
	/** Contains data pertaining to the creature's awareness */
	Awareness?: {
		/** Optional tag to override chase radius */
		chaseradius?: number,
		/** Creature hearing multiplier */
		hearingMult?: number,
		/** Creature hearing base */
		hearingRadius?: number,
		/** Creature vision base, affects awareness gain */
		vision?: number,
		/** multiplies sneak threshold */
		senseSpeed?: number,
	}
	/** Contains data pertaining to the creature's effect on reputation and its behaviors from it */
	Reputation?: {
		/** Optional tag to make an enemy not give up rep when killed */
		noRepLoss?: boolean,
	},
	/** */
	followRange?: number,
	/** wander = wanders randomly
	 * hunt = wanders, then follows the player
	 * guard = follows a specific point
	 * ambush = waits for the player to come near before becoming active
	 * patrol = walks between predefined global points on the map
	*/
	AI?: string,
	/** HP regen per turn*/
	regen?: number,
	/** */
	visionRadius?: number,
	/** Enemy will not get a vision bonus in one direction*/
	nonDirectional?: boolean,
	/** Enemy will not flip based on the enemy direction*/
	noFlip?: boolean,
	/** Max enemy hp*/
	maxhp?: number,
	/** Max enemy mana */
	maxmana?: number,
	/** enemy mana regen per turn */
	manaregen?: number,
	/** Shield enemy starts with */
	shield?: number,
	/** Shield enemy starts with */
	shieldregen?: number,
	/** Number of turns an enemy can sprint for */
	stamina?: number,
	/** Sprint speed multiplier. Default 1.5*/
	sprintspeed?: number,
	/** HP the enemy starts at */
	startinghp?: number,
	/** */
	minLevel?: number,
	/** */
	maxLevel?: number,
	/** */
	weight?: number,
	/** */
	movePoints?: number,
	/** */
	attackPoints?: number,
	/** String declaring what types of attacks this unit has */
	attack?: string,
	/** */
	attackRange?: number,
	/** */
	terrainTags?: Record<string, number>,
	/** Multiplies the weight AFTER modifiers */
	weightMult?: number,
	/** */
	floors?: Record<string, boolean>,
	/** Enemy events */
	events?: KinkyDungeonEvent[];
	/** */
	allFloors?: boolean,
	/** */
	noblockplayer?: boolean,
	/** */
	triggersTraps?: boolean,
	/** The enemy follows the player at the end of the level */
	keepLevel?: boolean,
	/** Boost to accuracy, 1 + (1 + accuracy)*/
	accuracy?: number,
	/** Blindsight toward the player but not other enemies. Mainly used by allies so they know where the player is. */
	playerBlindSight?: number,
	/** */
	attackWidth?: number,
	/** */
	power?: number,
	/** */
	dmgType?: string,
	/** Tease attacks list to use */
	teaseAttacks?: string,
	/** */
	bound?: string,
	/** Outfit for paperdoll */
	outfit?: string,
	/** Outfit for paperdoll */
	style?: string,
	/** Enemy is not a humanoid, used for skeletons */
	nonHumanoid?: boolean,
	/** */
	color?: string,
	/** counts toward the player's permanent summmon limit */
	CountLimit?: boolean,
	/** Does not target silenced enemies */
	noTargetSilenced?: boolean,
	/** */
	silenceTime?: number,
	/** List of spells*/
	spells?: string[],
	/** starting buffs */
	startBuffs?: any[],
	/** This enemy will not miscast spells when distracted*/
	noMiscast?: boolean,
	/** Sound effect when miscasting */
	miscastsfx?: string,
	/** Message when miscasting */
	miscastmsg?: string,
	/** This enemy knows the unlock command up to this level*/
	unlockCommandLevel?: number,
	/** This enemy must wait this long between unlock command attempts. Default is 90*/
	unlockCommandCD?: number,
	/** Enemy will self cast these */
	selfCast?: Record<string, boolean>,
	/** */
	spellCooldownMult?: number,
	/** */
	spellCooldownMod?: number,
	/** */
	kite?: number,
	/** */
	playerFollowRange?: number,
	/** */
	minSpellRange?: number,
	/** */
	stopToCast?: boolean,
	/** Shows a marker when the creature has a spell ready */
	spellRdy?: boolean,
	/** Casts while moving */
	castWhileMoving?: boolean,
	/** Enemy does not attack */
	noAttack?: boolean,
	/** Disarm counter increased by this fraction when attacked. When it reaches 1, the player's next attack will miss, otherweise it will reduce by this amount per turn */
	disarm?: number,
	/** Boost to power when target is not the player or when the enemy cant tie up the player */
	fullBoundBonus?: number,
	/** Loot*/
	dropTable?: any[],
	/** */
	attackWhileMoving?: boolean,
	/** Doesnt cast spells when the player is out of stamina */
	noSpellsLowSP?: boolean,
	/** Rep changes on death */
	rep?: Record<string, number>,
	/** Rep changes on death */
	factionrep?: Record<string, number>;
	/** Chance to generate as a guard instead */
	guardChance?: number;
	/** When generating clusters of enemies, the clustering units must have this tag*/
	clusterWith?: string,
	/** Chance to ignore the player if the enemy has an ignore tag like ignorenoSP */
	ignorechance?: number,
	/** The enemy count is incremented by this amount when the enemy is spawned during map gen*/
	difficulty?: number,
	/** The enemy will not attack if the path to the player is blocked, and will move closer*/
	projectileAttack?: boolean,
	/** The enemy will use 'buff' tagged spells on allies*/
	buffallies?: boolean,
	/** Special attack property*/
	stunTime?: number,
	/** Stamina damage per hit */
	staminaDamage?: number,
	/** Special attack property. Cooldown of the special attack.*/
	specialCD?: number,
	/** Special attack property. Added to the special attack in addition to the enemy's default attack*/
	specialAttack?: string,
	/** Special attacks ignore stamina requirements */
	specialIgnoreStam?: boolean,
	/** Special attack property. Removed these types from the main attack when special attacking.*/
	specialRemove?: string,
	/** Adds additional restraint tags when special attacking*/
	specialExtraTags?: string[],
	/** removes the specified restraint tags when special attacking*/
	specialRemoveTags?: string[],
	/** Uses a special message for Special attacks */
	specialMsg?: boolean,
	/** specifies a condition for using a special attack*/
	specialCondition?: string,
	/** Special attack property*/
	specialPower?: number,
	/** Special attack property*/
	specialDamage?: string,
	/** Special attack property. Special attack will go on CD when the enemy uses it, not when it hits*/
	specialCDonAttack?: boolean,
	/** Special attack property*/
	specialWidth?: number,
	/** Special attack property*/
	specialRange?: number,
	/** Which shrines the enemy is associated with*/
	shrines?: string[],
	/** */
	followLeashedOnly?: boolean,
	/** */
	blindSight?: number,
	/** */
	specialCharges?: number,
	/** */
	strictAttackLOS?: boolean,
	/** */
	specialAttackPoints?: number,
	/** */
	stealth?: number,
	/** After being seen the enemy can go back into stealth if the player moves away*/
	noReveal?: boolean,
	/** */
	ambushRadius?: number,
	/** For AI = 'ambush', this enemy will wander until it sees the player and triggers the ambush. Mostly used for invisible enemies. */
	wanderTillSees?: boolean,
	/** For kiting enemies, this enemy moves in to attack Only When the player is Disabled. Used on enemies like the Maidforce stalker who stay away from the enemy but have powerful disabling effects like flash bombs*/
	dontKiteWhenDisabled?: boolean,
	/** The special attack only binds on kneeling players*/
	bindOnDisableSpecial?: boolean,
	/** The regular attack only binds on kneeling players*/
	bindOnDisable?: boolean,
	/** Enemy will still try to bind even if (bindOnDisable) is true, if the player isn't actively fighting*/
	smartBind?: boolean,
	/** Sfx when an attack lands*/
	hitsfx?: string,
	/** All lockable restraints will use this lock*/
	useLock?: string,
	/** Uses this lock when using the lock attack */
	attackLock?: string,
	/** Faction that is always applied by this unit's restraints */
	applyFaction?: string,
	/** Faction that is default applied by this unit's restraints */
	defaultFaction?: string,
	/** Minimum range for attack warning tiles, used to prevent high range enemies from attacking all around them*/
	tilesMinRange?: number,
	/** Minimum range to try attacking */
	attackMinRange?: number,
	/** Minimum range to try attacking */
	specialMinRange?: number,
	/** */
	noKiteWhenHarmless?: boolean,
	/** */
	noSpellsWhenHarmless?: boolean,
	/** */
	ignoreStaminaForBinds?: boolean,
	/** */
	sneakThreshold?: number,
	RemoteControl?: {
		/** */
		remote?: number,
		/** */
		remoteAmount?: number,
		/** If the enemy has a remote that can control punishing items (e.g. shock collars), the range that they can control items from */
		punishRemote?: number,
		/** The chance per tick that the enemy will use their remote remote to punish the player when they are within range */
		punishRemoteChance?: number,
	}
	/** Crit strike modifier of the enemy's attacks */
	crit?: number,
	/** */
	bypass?: boolean,
	/** */
	multiBind?: number,
	/** */
	noLeashUnlessExhausted?: boolean,
	/** */
	ethereal?: boolean,
	/** This enemy always dodges regular attacks */
	alwaysEvade?: boolean,
	/** This enemy always blocks regular attacks */
	alwaysBlock?: boolean,
	/** Info for enemy resistance */
	Resistance?: {
		/** Applies a resistance profile to the enemy, which is a preset set of tags */
		profile?: string[],
		/** This enemy cannot dodge if the attacking weapon is magical */
		alwaysHitByMagic?: boolean,
		/** This enemy cannot BLOCK if the attacking weapon is magical */
		alwaysBypassedByMagic?: boolean,
		/** Physical block: applied only when not disabled or vulnerable */
		block_phys?: number,
		/** Magic block: applied only when not disabled or vulnerable */
		block_magic?: number,
		/** Crits are half as effective when enemy is aware */
		toughArmor?: boolean,
		/** Same as tough armor, but also applies while unaware */
		toughArmorAlways?: boolean,
	},
	/** */
	summonRage?: boolean,
	/** */
	noAlert?: boolean,
	/** The enemy will follow enemies defined by this block*/
	master?: masterInfo,
	/** */
	pullTowardSelf?: boolean,
	/** */
	pullDist?: number,
	/** */
	summon?: any[],
	/** */
	sneakthreshold?: number,
	/** */
	blockVisionWhileStationary?: boolean,
	/** */
	squeeze?: boolean,
	earthmove?: boolean,
	/** Enemy will not chase player for being unrestrained. Use on enemies like drones who have lines but dont bind readily */
	noChaseUnrestrained?: boolean,
	/** */
	suicideOnSpell?: boolean,
	/** */
	suicideOnAdd?: boolean,
	/** */
	suicideOnEffect?: boolean,
	/** */
	suicideOnLock?: boolean,
	/** Hostile even on parole */
	alwaysHostile?: boolean,
	/** */
	specialsfx?: string,
	/** Stuns the enemy when the special attack goes on CD without a hit */
	stunOnSpecialCD?: number,
	/** Dash info */
	Dash?: {
		/** Does not dash to the player if the dash is stepped out of the way of*/
		noDashOnSidestep?: boolean,
		/** Does not dash to the player if the dash is dodged*/
		noDashOnMiss?: boolean,
		/** Does not dash to the player if the dash is blocked*/
		noDashOnBlock?: boolean,
		/** Forces the event to play when a dash misses, even if there are no eventable attack types*/
		EventOnDashMiss?: boolean,
		/** Forces the event to play when a dash is blocked, even if there are no eventable attack types*/
		EventOnDashBlock?: boolean,
	},
	attackBonus?: number,
	/** */
	cohesion?: number,
	/** */
	noSpellLeashing?: boolean,
	/** */
	projectileTargeting?: boolean,
	/** */
	ondeath?: any[],
	/** */
	blindTime?: number,
	/** */
	tilesMinRangeSpecial?: number,
	/** */
	convertTiles?: any[],
	/** the enemy sends a special message when pulling the player */
	pullMsg?: boolean,
	/** */
	dashThruWalls?: boolean,
	/** */
	dashThrough?: boolean,
	/** */
	cohesionRange?: number,
	/** */
	kiteChance?: number,
	/** this enemy ignores the player when these flags are set*/
	ignoreflag?: string[],
	/** flags set when the player is hit but no binding occurs*/
	failAttackflag?: string[],
	failAttackflagChance?: number,
	/** How long to set the flag for */
	failAttackflagDuration?: number,
	/** */
	visionSummoned?: number,
	/** */
	dependent?: boolean,
	/** */
	nopickpocket?: boolean,
	/** */
	attackThruBars?: boolean,
	/** */
	noCancelAttack?: boolean,
	/** */
	keys?: boolean,
	/** If this enemy is always enraged */
	rage?: boolean,
	/** Starting lifetime of enemy*/
	lifespan?: number,
	/** This enemy cant be swapped */
	noDisplace?: boolean,
	/** The enemy will cast spells even if you are in parole */
	spellWhileParole?: boolean,
	/** This line is a suffic to the line they say when they want to play with you */
	playLine?: string,
	/** Blocks vision */
	blockVision?: boolean,
	/** Hit SFX for enemy special attack */
	hitsfxSpecial?: string,
	/** Effect when the enemy misses */
	misssfx?: string,
	/** Effect when the enemy blocks */
	blocksfx?: string,
	/** SFX on certain cues */
	cueSfx?: {
		/** When the enemy takes no damage from a melee attack */
		Block?: string,
		/** When the enemy takes no damage from a magic attack */
		Resist?: string,
		/** When the enemy takes damage in general */
		Damage?: string,
		/** When the player misses it */
		Miss?: string,
	},
	/** The enemyeffect when player is hit */
	effect?: any,
	/** Cant cast spells while winding up an attack */
	noSpellDuringAttack?: boolean,
	/** Base faction of this enemy, overridden by the entity faction */
	faction?: string,
	/** Can rescue with the following */
	rescueTo?: {
		Unlock?: string,
		Remove?: string,
		Slime?: string,
	},
	/** This enemy does not channel its spells */
	noChannel?: boolean,
	/** Focuses player over summmons, ignores decoys */
	focusPlayer?: boolean;
	/** Cant be swapped by another enemy pathing, even if the enemy is a jailer or leasher.
	 * For barricades and other dynamically placed barriers, use "immobile" so it doesnt block important enemies
	 */
	immobile?: boolean;
	/** Stops casting spells after there are this many enemies */
	enemyCountSpellLimit?: number;
	/** List of animations to be applied */
	Animations?: string[];

}

interface shopItem {
	cost: any;
	rarity: any;
	costMod?: any;
	shoptype: string;
	consumable?: string;
	quantity?: number;
	name: any;
}

interface weapon extends damageInfo, NamedAndTyped {
	ignoreshield?: boolean,
	shield_crit?: boolean, // Crit thru shield
	shield_stun?: boolean, // stun thru shield
	shield_freeze?: boolean, // freeze thru shield
	shield_bind?: boolean, // bind thru shield
	shield_snare?: boolean, // snare thru shield
	shield_slow?: boolean, // slow thru shield
	shield_distract?: boolean, // Distract thru shield
	shield_vuln?: boolean,
	arousalMode?: boolean,
	/** Modifies the cost by changing the rarity for cost purposes only */
	costMod?: number,
	name: string;
	damage: number;
	chance: number;
	type: string;


	/** Multiplies the damage when over 50% stamina */
	stam50mult?: number,

	evadeable?: boolean,
	nokill?: boolean,
	bind?: number;
	nodisarm?: boolean,
	/** Will add conjured bindings */
	addBind?: boolean;
	/** For rendering on player portrait */
	angle?: number,
	crit?: number;
	bindcrit?: number;
	bindType?: string;
	distract?: number;
	bindEff?: number;
	distractEff?: number;
	desireMult?: number;
	light?: boolean;
	heavy?: boolean;
	massive?: boolean;
	boundBonus?: number;
	tease?: boolean;
	rarity: number;
	staminacost?: number;
	time?: number,
	magic?: boolean;
	/** Determines if the weapon is a gun/staff type (does damage regardless of binding)
	 * or a whack type that needs force to be effective*/
	noDamagePenalty?: boolean,
	cutBonus?: number;
	playSelfBonus?: number;
	playSelfMsg?: string;
	playSelfSound?: string;
	unarmed: boolean;
	shop: boolean;
	noequip?: boolean;
	sfx: string;
	events?: KinkyDungeonEvent[];
	noHands?: boolean;
	silent?: boolean;
	/** Weapon cant be used with arm bondage */
	clumsy?: boolean;
	/** Skip turns after attacking */
	channel?: number;
	/** Slows player after attacking */
	channelslow?: boolean;
	novulnerable?: boolean;
	nocrit?: boolean;
	noblock?: boolean,
	tags?: string[];
	special?: {
		type: string,
		spell?: string,
		prereq?: string,
		selfCast?: boolean,
		requiresEnergy?: boolean,
		energyCost?: number,
		range?: number,};
	/** Can be used with Floating weapon even with no hands */
	telekinetic?: boolean,
}


interface KinkyDungeonEvent {
	/** This is an integer. if an event has this the game skips it and comes back after executing everything else.
	 * Best to keep it low for performance reasons, if in a draw loop.
	 */


	cloneTags?: string[],
	frequencyMax?: number,
	frequencyMin?: number,
	frequencyStep?: number,
	frequencyTag?: string,

	delayedOrder?: number;
	/** A dynamic event is specified as 'dynamic' and is specified under ItemMap.dynamic
	 * (replace ItemMap with the event map you need)
	 * This lets you use the same code for multiple events, which is risky but convenient
	*/
	dynamic?: boolean,
	trim?: boolean,
	cost?: number,
	offhand?: boolean,
	offhandonly?: boolean,
	cursetype?: string,
	/** This is from a temporary event curse */
	curse?: boolean,
	/**
	 * For Dynamic events there is no easy way of getting the 'target' of a targeted event,
	 * for example bulletHitEnemy or playerAttack
	 * targetType specifies the key in the event data that leads to an entity target
	 *
	 * Certain constants apply:
	 * KDPLAYER - the current player entity
	 * KDGUARD - the current jail guard
	 * KDLEASHER - the current leasher
	 * KDNEAREST - the nearest entity to the player
	 * KDNEARESTHOSTILE - the nearest hostile enemy
	 */
	targetType?: string,
	/**
	 * For Dynamic events there is no easy way of getting the 'attacker' of a targeted event,
	 * for example bulletHitEnemy or playerAttack
	 * attackerType specifies the key in the event data that leads to an entity which is responsible for the event
	 *
	 * Certain constants apply:
	 * KDPLAYER - the current player entity
	 * KDGUARD - the current jail guard
	 * KDLEASHER - the current leasher
	 * KDNEAREST - the nearest entity to the player
	 * KDNEARESTHOSTILE - the nearest hostile enemy
	 */
	attackerType?: string,
	tags?: string[],
	duration?: number,
	always?: boolean,
	bindEff?: number,
	type: string;
	requireFlag?: string;
	trigger: string;
	threshold?: number,
	restraint?: string;
	sfx?: string;
	power?: number;
	keepLock?: boolean,
	distractEff?: number;
	desireMult?: number;
	count?: number;
	player?: boolean;
	bind?: number;
	crit?: number;
	bindcrit?: number;
	distract?: number;
	mult?: number;
	kind?: string;
	original?: string;
	variance?: number;
	damage?: string;
	buffTypes?: string[];
	damageTrigger?: string;
	dist?: number;
	aoe?: number;
	buffType?: string;
	bullet?: boolean,
	melee?: boolean,
	time?: number;
	bindType?: string;
	addBind?: boolean,
	chance?: number;
	buff?: any;
	lock?: string;
	desc?: string;
	buffSprite?: string;
	msg?: string;
	/** Like a prereq, but always active even if the event doesnt specify*/
	condition?: string;
	/** Specifies a prereq that the event itself can use */
	prereq?: string;
	color?: string;
	filter?: LayerFilter;
	bgcolor?: string;
	/** Vibe */
	edgeOnly?: boolean;
	/** Vibe */
	cooldown?: Record<string, number>;
	/** A required enemy tag */
	requiredTag?: string;
	/** Generic required tags */
	requireTags?: string[];
	/** Generic filtered tags */
	filterTags?: string[];
	/** Type of struggle that this event triggers on */
	StruggleType?: string;
	requireEnergy?: boolean;
	/** Limit of whatever thius event modifies */
	limit?: number
	energyCost?: number;
	/** The event gets copied to any restraint if the item is linked */
	inheritLinked?: boolean;
	/** Spell to cast at the target */
	spell?: string;
	/** Chance to trigger is 1+(submissive % * subMult)*/
	subMult?: number;
	/** Won't trigger while being leashed */
	noLeash?: boolean;
	/** Stun duration */
	stun?: number;
	/** Chance the player will get warned instead of punshed */
	warningchance?: number;
	/** triggers from this component */
	punishComponent?: string;
	/** List of restraints or other string params */
	list?: string[];
	/** Whether or not the event only triggers on human targets */
	humanOnly?: boolean;
	/** Distance having to do with stealth */
	distStealth?: number;
	/** Dialogue key an enemy should send */
	enemyDialogue?: string;

	escapeMethod?: string;
	enemy?: string;

	// MUTABLE QUANTITIES
	prevSlowLevel?: number;
}


type masterInfo = {
	type: string,
	range: number,
	loose?: boolean,
	aggressive?: boolean,
	dependent?: boolean,
	maxDist?: number,
	masterTag?: string,
}

interface String {
    KDReplaceOrAddDmg(dmg: string, replaceString?: string): string;
}

interface entity {
	refreshSprite?: boolean,
	FacilityAction?: string,

	strugglePoints?: number,

	/** Optional leash data, used for both NPC and player */
	leash?: KDLeashData,
	blockedordodged?: number,
	blocks?: number,
	dodges?: number,
	shield?: number,

	visual_hp?: number,
	visual_boundlevel?: number,
	visual_distraction?: number,
	visual_lifetime?: number,

	/** The enemy will follow enemies defined by this block*/
	master?: masterInfo,

	// Direction
	flip?: boolean,

	sprinted?: boolean,
	exertion?: number,

	// Custom play line
	playLine?: string,
	// Custom outfit
	outfit?: string,
	// Custom outfit when captured
	outfitBound?: string,
	// Custom style
	style?: string,
	// Custom intro
	intro?: string,

	// Animations
	offX?: number,
	offY?: number,
	scaleX?: number,
	scaleY?: number,
	animTime?: number,
	/** Spawn location */
	spawnX?: number,
	/** Spawn location */
	spawnY?: number,
	/** Opinion of you. Positive is good. */
	opinion?: number,
	/** Determines if an enemy can be dommed or not */
	domVariance?: number,
	hideTimer?: boolean,
	Enemy?: enemy,

	/** Amount of sound the entity is currently producing */
	sound?: number,
	/** List an enemy ID. Enemy will be bound to this one and dies if not found. BoundTo of -1 indicates bound to the player, and will expire if the player is jailed or passes out*/
	boundTo?: number,
	/** This enemy is weakly bound and simply stunning the caster will delete it */
	weakBinding?: boolean,
	player?: boolean,
	/** This enemy has keys to red locked doors */
	keys?: boolean,
	/** Additional Ondeath, e.g quest markers or rep */
	ondeath?: any[],
	/** Used for misc data */
	data?: Record<string, string>,
	/** Rep changes on death */
	rep?: Record<string, number>,
	/** Rep changes on death */
	factionrep?: Record<string, number>;
	dialogue?: string,
	dialogueDuration?: number,
	dialogueColor?: string,
	dialoguePriority?: number,
	CustomName?: string,
	CustomSprite?: string,
	CustomNameColor?: string,
	rescue?: boolean,
	personality?: string,
	patrolIndex?: number,
	flags?: Record<string, number>,
	gold?: number,
	noDrop?: boolean,
	droppedItems?: boolean,
	specialdialogue?: string,
	aggro?: number,
	id?: number,
	hp?: number,
	mana?: number,
	AI?: string,
	moved?: boolean,
	playerdmg?: number,
	idle?: boolean,
	summoned?: boolean,
	boundLevel?: number,
	specialBoundLevel?: Record<string, number>,
	distraction?: number,
	desire?: number,
	lifetime?: number,
	maxlifetime?: number,
	attackPoints?: number,
	attackBonus?: number,
	movePoints?: number,
	aware?: boolean,
	vp?: number,
	tracking?: boolean,
	revealed?: boolean,
	ambushtrigger?: boolean,
	castCooldown?: number,
	castCooldownSpecial?: number,
	castCooldownUnique?: Record<string, number>,
	specialCharges?: number,
	usingSpecial?: boolean,
	ignore?: boolean,
	specialCD?: number,
	disarmflag?: number,
	channel?: number,
	items?: string[],
	tempitems?: string[],
	x: number,
	y: number,
	lastx?: number,
	lasty?: number,
	fx?: number,
	fy?: number,
	action?: string,
	path?: {x: number, y: number}[],
	gx?: number,
	gy?: number,
	gxx?: number,
	gyy?: number,
	rage?: number,
	hostile?: number,
	/** Indicates that an enemy has been modified and does not eliminate enemy data */
	modified?: boolean,
	faction?: string,
	allied?: number,
	ceasefire?: number,
	bind?: number,
	/** Makes the enemy temporarily immobavle */
	immobile?: number,
	blind?: number,
	disarm?: number,
	slow?: number,
	freeze?: number,
	teleporting?: number,
	teleportingmax?: number,
	stun?: number,
	silence?: number,
	vulnerable?: number,
	buffs?: Record<string, any>,
	warningTiles?: any,
	visual_x?: number,
	visual_y?: number,
	Analyze?: boolean,
	/** Number of turns the enemy is temporarily hostile for */
	playWithPlayer?: number,
	playWithPlayerCD?: number,

	IntentAction?: string,
	IntentLeashPoint?: {x: number, y: number, type: string, radius: number},

	CurrentAction?: string,
	RemainingJailLeashTourWaypoints?: number,
	NextJailLeashTourWaypointX?: number,
	NextJailLeashTourWaypointY?: number,
	KinkyDungeonJailTourInfractions?: number,
	/**  Used by guards.  */
	CurrentRestraintSwapGroup?: string,
}

type KinkyDungeonDress = {
	Item: string;
	Group?: string;
	Color: string | string[];
	Filters?: Record<string, LayerFilter>;
	Properties?: Record<string, LayerProperties>;

	Lost: boolean;
	NoLose?: boolean;
	Property?: any,
	OverridePriority?: number;
	Skirt?: boolean;
}[]

interface KinkyDialogueTrigger {
	dialogue: string;
	allowedPrisonStates?: string[];
	/** Only allows the following personalities to do it */
	allowedPersonalities?: string[];
	blockDuringPlaytime?: boolean;
	/** Whether or not the enemy must be able to talk */
	talk?: boolean,
	noAlly?: boolean,
	/** Exclude if enemy has one of these tags */
	excludeTags?: string[];
	/** Require all of these tags */
	requireTags?: string[];
	/** Require one of these tags */
	requireTagsSingle?: string[];
	/** Require one of these tags */
	requireTagsSingle2?: string[];
	/** Require play to be POSSIBLE */
	playRequired?: boolean;
	/** Require play to be ONGOING */
	onlyDuringPlay?: boolean;
	/** Allow this to happen even out of playtime if the player is submissive enough */
	allowPlayExceptionSub?: boolean;
	/** If any NPC is in combat in last 3 turns this wont happen */
	noCombat?: boolean;
	/** Prevents this from happening if the target is hostile */
	nonHostile?: boolean;
	prerequisite: (enemy: entity, dist: number, AIData: any) => boolean;
	weight: (enemy: entity, dist: number) => number;
}

interface effectTile {
    x?: number,
    y?: number,
    infinite?: boolean,
	lightColor?: number,
	//shadowColor?: number,
	yoffset?: number,
	xoffset?: number,
    name: string,
	/** Has all the functions of this one */
	functionName?: string,
    duration: number,
    priority: number,
	data?: any,
	/** For tiles which can be used to help escape */
	affinities?: string[],
	/** For tiles which can be used to help escape, but only while standing */
	affinitiesStanding?: string[],
	drawOver?: boolean,
	tags: string[],
	pauseDuration?: number,
	pauseSprite?: string,
	brightness?: number,
	/** Deletes the effect tile if it's not on a movable tile */
	noWalls?: boolean,
	/** Radius within which the tile does NOT block vision */
	visionBlockRadius?: number,
	skin?: string,
	/** random = basic effect where it fades in and has a chance to fade out again */
	fade?: string,
	statuses?: Record<string, number>,
	/** Spin to the effect tile sprite */
	spin?: number,
	spinAngle?: number,

};

/** For spells */
interface effectTileRef {
    name: string,
    infinite?: boolean,
    duration?: number,
	data?: any,
	pauseDuration?: number,
	pauseSprite?: string,
	skin?: string,
	statuses?: Record<string, number>,
};

type KDPerk = {
	/** Determines if this one goes in the debuffs tree */
	debuff?: boolean,
	/** Determines if this one goes in the buffs tree */
	buff?: boolean,
	category: string,
	id: string | number,
	cost: number,
	block?: string[],
	tags?: string[],
	blocktags?: string[],
	blockclass?: string[],
	locked?: boolean,
	outfit?: string,
	require?: string,
	costGroup?: string,
	startPriority?: number,
	requireArousal?: boolean,
}

interface spell {

	/** bind tags for the spell/bullet */
	bindTags?: string[],

	ignoreshield?: boolean,
	shield_crit?: boolean, // Crit thru shield
	shield_stun?: boolean, // stun thru shield
	shield_freeze?: boolean, // freeze thru shield
	shield_bind?: boolean, // bind thru shield
	shield_snare?: boolean, // snare thru shield
	shield_slow?: boolean, // slow thru shield
	shield_distract?: boolean, // Distract thru shield
	shield_vuln?: boolean,

	/** Crit damage multiplier of the spell */
	crit?: number;
	/** Sound efgfect that plays when you miscast */
	miscastSfx?: string,
	/** This spell doesnt hurt the target upon directly hitting, only the AoE */
	noDirectDamage?: true,
	/** This spell doesnt apply the hit effect on collision*/
	noDirectHit?: true,
	/** This spell does not leave a warning to the player */
	hideWarnings?: boolean,
	/** This spell does leave a warning to the player */
	alwaysWarn?:boolean,
	/** Marks the spell as a command word spell to enemies */
	commandword?: boolean,
	/** The spell is used to buff allies */
	buffallies?: boolean,
	/** caster will also target themselves */
	selfbuff?: boolean,
	/** Type of binding applied to the power */
	bindType?: string,
	/** Stops the spell from moving more than 1 tile */
	slowStart?: boolean,
	/** Spinrate of the bullet */
	bulletSpin?: number,
	/** Spinrate of the bullet hit */
	hitSpin?: number,
	/** Forces spell to move more than 1 tile at beginning */
	fastStart?: boolean,
	/** Affects aoe type
	 * acceptable values are:
	 * vert - creates a vertical line
	 * horiz - creates a horizontal line
	 * box - uses chebyshev distance
	 * cross - creates a vertical and horizontal line
	 */
	aoetype?: string,
	aoetypetrail?: string,
	secondaryhit?: string,
	upcastFrom?: string,
	upcastLevel?: number,
	hitColor?: number;
	bulletColor?: number;
	trailColor?: number;
	hitLight?: number;
	bulletLight?: number;
	trailLight?: number;
	goToPage?: number;
	tags?: string[];
	effectTile?: effectTileRef,
	effectTileAoE?: number,
	effectTileDurationMod?: number,
	effectTilePre?: effectTileRef,
	effectTileDurationModPre?: number,
	effectTileLinger?: effectTileRef,
	effectTileDurationModLinger?: number,
	effectTileDensityLinger?: number,
	effectTileTrail?: effectTileRef,
	effectTileDurationModTrail?: number,
	effectTileDensityTrail?: number,
	effectTileTrailAoE?: number,
	effectTileDoT?: effectTileRef,
	effectTileDoT2?: effectTileRef,
	effectTileDistDoT?: number,
	effectTileDurationModDoT?: number,
	effectTileDensityDoT?: number,
	effectTileDensity?: number,

	/** Hides this spell in the spell screen */
	hide?: boolean,

	shotgunCount?: number,
	shotgunFan?: boolean,
	shotgunSpread?: number,
	shotgunDistance?: number,
	shotgunSpeedBonus?: number,

	distractEff?: number,
	desireMult?: number,
	bindEff?: number,

	nonmagical?: boolean,

	damageFlags?: string[],
	/** Wont spawn a trail on the player, ever */
	noTrailOnPlayer?: boolean,
	/** Wont spawn a trail on any entity, ever */
	noTrailOnEntity?: boolean,
	/** Wont spawn a trail on any allied entity, ever */
	noTrailOnAlly?: boolean,
	/** Color of the spell and bullet warningsd */
	color?: string,
	/** Buffs applied by the hit will effect everyone */
	buffAll?: boolean,
	name: string;
	customCost?: string,
	/** Spell does not advance time */
	quick?: boolean;
	addBind?: boolean,
	/** spell required to unlock this one */
	prerequisite?: string | string[];
	/** blocked if you have this spell */
	blockedBy?: string[];
	/** Spell is hidden if you didnt learn it */
	hideUnlearnable?: boolean,
	/** Spell is hidden if you didnt learn this spell */
	hideWithout?: string,
	/** Spell is hidden if you learned a specific spell */
	hideWith?: string,
	/** Spell is hidden if you DID learn it */
	hideLearned?: boolean,
	/** Automatically learns the spells when you learn it (thru magic screen) */
	autoLearn?: string[],
	/** Automatically learns the spell pages when you learn it (thru magic screen) */
	learnPage?: string[],
	/** This spell wont trigger an aggro action */
	noAggro?: boolean;
	/** Whether the spell defaults to the Player faction */
	allySpell?: boolean;
	/** This spell wont friendly fire the player */
	noFF?: boolean;
	/** Spell overrides the faction */
	faction?: string;
	/** Whether the spell defaults to the Enemy faction */
	enemySpell?: boolean;
	/** Whether the spell has a direction offset when fired */
	noDirectionOffset?: boolean,
	/** Hide the spell if arousal mode is off */
	arousalMode?: boolean;
	/** Conjure, Illusion, Elements */
	school?: string;
	/** if the type is special, this is the special type */
	special?: string;
	/** Damage of the spell */
	power?: number;
	/** Amount of aoe power */
	aoedamage?: number;
	/** Damage type */
	damage?: string;
	/** Is the damage teasing */
	tease?: boolean;
	/** size of sprite */
	size?: number;
	/** Prevents multiple instances of the spell from doing damage on the same turn from the same bullet to the same enemy */
	noUniqueHits?: boolean;
	/** AoE */
	aoe?: number;
	/** AoE of bullet itself (only for bolts) */
	bulletAoE?: number;
	/** bind */
	bind?: number;
	/** bind crit mult*/
	bindcrit?: number;
	/** distract */
	distract?: number;
	/** Bonus daMAGE TO BOUND TATRGETS */
	boundBonus?: number;
	/** outfit applied (special parameter) */
	outfit?: string;
	/** speed */
	speed?: number;
	knifecost?: number;
	staminacost?: number;
	manacost: number;
	chargecost?: number;
	minRange?: number;
	noSprite?: boolean;
	/** Learn these flags permanently */
	learnFlags?: string[],
	/** Increases the more you do */
	increasingCost?: boolean,
	decreaseCost?: boolean,
	/** Specific to a class */
	classSpecific?: string;
	/** Verbal, arms, or legs */
	components?: string[];
	/** The bullet's position is always fixed toward the caster */
	followCaster?: boolean,
	/** Spell level */
	level: number;
	/** Whether the spell is passive (like the summon count up) or active like the bolt or toggle spells*/
	passive?: boolean;
	/** An active spell but it has passive effects */
	mixedPassive?: boolean;
	/** Active spell for mana cost purposes, only used to override behavior of passive and toggle spells */
	active?: boolean;
	/** costOnToggle */
	costOnToggle?: boolean;
	/** Type of the spell */
	type: string;
	/** Type of effect on hit */
	onhit?: string;
	/** Duration of the status effect applied */
	time?: number;
	/** For Inert spells, this is the lifetime of the main bullet */
	delay?: number;
	/** Random added onto delay */
	delayRandom?: number;
	/** castRange */
	castRange?: number;
	/** Spell range */
	range?: number;
	/** lifetime of the Hit bullet created by the spell, not the bullet itself in the case of an "inert" bullet*/
	lifetime?: number;
	/** Specifically for the bullet lifetime, currently unused */
	bulletLifetime?: number;
	/** channel turns */
	channel?: number;
	/** Noise spell makes on cast */
	noise?: number;
	/** block */
	block?: number;
	/** played on cast */
	sfx?: string;
	/** Played on damage dealt */
	hitsfx?: string;
	/** Played on bullet impact */
	landsfx?: string;
	/** trailEvadeable */
	trailEvadeable?: boolean;
	/** trailNoblock */
	trailNoblock?: boolean;
	/** trailPower */
	trailPower?: number;
	/** trailHit */
	trailHit?: string;
	/** trailLifetime */
	trailLifetime?: number;
	/** trailTime */
	trailTime?: number;
	/** Random number to increase lifetime by */
	lifetimeHitBonus?: number;
	/** Random number to increase trail lifetime by */
	trailLifetimeBonus?: number;
	/** Playereffect of the trail */
	trailPlayerEffect?: any;
	/** trailChance */
	trailChance?: number;
	/** Creates trails on the projectiles itself too */
	trailOnSelf?: boolean;
	/** trailDamage */
	trailDamage?: string;
	/** trailspawnaoe */
	trailspawnaoe?: number;
	/** Casts a spell as a trail */
	trailcast?: any;
	/** trail */
	trail?: string;
	/** Spell points cost to buy */
	spellPointCost?: number;
	/** Whether the spell heals or not */
	heal?: boolean;
	/** Whether AI treats as a buff */
	buff?: boolean;
	/** The spell needs this condition for an enemy to cast it*/
	castCondition?: string;
	/** Player can only cast spell on a creature or player */
	mustTarget?: boolean;
	/** Player cant target player */
	noTargetPlayer?: boolean;
	/** Only target walls */
	WallsOnly?: boolean;
	/** Spell can be dodged, default cantt be dodged */
	evadeable?: boolean;
	/** Spell can NOT be blocked. default can be blocked */
	noblock?: boolean;
	/** Targeting location */
	meleeOrigin?: boolean;
	/** Cant hit the same enemy twice per turrn, impoprtant for piercing spells */
	noDoubleHit?: boolean;
	/** Doesnt do spellcast on the hit */
	noCastOnHit?: boolean;
	/** Casts a spellcast during the delay */
	castDuringDelay?: boolean;
	/** Casts spell */
	spellcast?: any;
	/** Casts spell on cast */
	extraCast?: any;
	/** spell cast on hit */
	spellcasthit?: any;
	/** List of buffs applied by the spell */
	buffs?: any[];
	/** Whether the spell is off by default */
	defaultOff?: boolean;
	/** List of events  applied by the spell */
	events?: KinkyDungeonEvent[];
	/** List of events  applied by the spell to its hit */
	hitevents?: KinkyDungeonEvent[];
	/** spell pierces */
	piercing?: boolean;
	/** spell pierces enemies */
	pierceEnemies?: boolean;
	/** spell pierces */
	passthrough?: boolean;
	/** Deals DoT */
	dot?: boolean;
	/** spell pierces */
	noTerrainHit?: boolean;
	/** spell pierces */
	noEnemyCollision?: boolean;
	/** If an enemy has one of these tags it will get hit no matter what*/
	alwaysCollideTags?: string[],
	/** trail pierces */
	piercingTrail?: boolean;
	/** nonVolatile */
	nonVolatile?: boolean;
	/** likely to cause chain reactions */
	volatile?: boolean;
	/** likely to cause chain reactions */
	volatilehit?: boolean;
	/** Can only block these types of spells */
	blockType?: string[],
	/** Cancels automove when cast */
	cancelAutoMove?: boolean;
	/** requireLOS */
	requireLOS?: boolean;
	/** selfTargetOnly */
	selfTargetOnly?: boolean;
	/** AI will only target creatures with this tag */
	filterTags?: string[];
	/** Whether or not sends a message on cast */
	msg?: boolean;
	/** Suppress summon message */
	noSumMsg?: boolean;
	/** Targeted like a bolt, showing the aim line */
	projectileTargeting?: boolean;
	/** Adds additional distance on the cast when targeted by an enemy */
	extraDist?: number
	/** CastInWalls */
	CastInWalls?: boolean;
	/** Allows casting into fog of war */
	CastInDark?: boolean;
	/** noTargetEnemies */
	noTargetEnemies?: boolean;
	/** Exception list for NoTargetEnemies */
	exceptionFactions?: string[];
	/**  */
	noTargetAllies?: boolean;
	/** Can only target the player */
	targetPlayerOnly?: boolean;
	/** Sets the enemy's specialCD shared between others */
	specialCD?: number;
	/** AI wont choose this as first choice */
	noFirstChoice?: boolean;
	/** Player effect */
	playerEffect?: any;
	/** Doesnt send cast message */
	noCastMsg?: boolean;
	/** Casts on self always */
	selfcast?: boolean;
	/** Cant miscast */
	noMiscast?: boolean;
	/** summon */
	summon?: any[];
	/** Spell does not show up in the spells scrreen until learned */
	secret?: boolean;
	/** Enemies summoned by this spell will have their default faction and not the caster's faction */
	defaultFaction?: boolean;

}

interface KDQuest {
	name: string;
	npc: string;
	visible: boolean;
	nocancel?: boolean,
	tick?: (delta: number) => void;
	worldgenstart?: () => void;
	accept?: () => void;
	weight: (RoomType: any, MapMod: any, data: any, currentQuestList?: any) => number;
	prerequisite: (RoomType: any, MapMod: any, data: any, currentQuestList: any) => boolean;
	tags?: string[],
};

interface KDPoint {x: number, y: number}
interface KDJailPoint extends KDPoint {type: string, radius: number, requireLeash?: boolean, requireFurniture?: boolean, direction?:{x: number, y: number}, restraint?:string, restrainttags?:string[]}

interface KinkyDialogue {
	/** REPLACETEXT -> Replacement */
	data?: Record<string, string>;
	/** Tags for filtering */
	tags?: string[];
	singletag?: string[];
	excludeTags?: string[];
	/** Shows the quick inventory */
	inventory?: boolean;
	/** Function to play when clicked. If not specified, nothing happens.  Bool is whether or not to abort current click*/
	clickFunction?: (gagged: boolean, player: entity) => boolean | undefined;
	/** Draw function. Fires each frame. Good for highlighting things, drawing extra buttons, etc. Boolean = true will prevent the rest of dialogue from being drawn, use with caution*/
	drawFunction?: (gagged: boolean, player: entity, delta: number) => boolean;
	/** Function to play when clicked, if considered gagged. If not specified, will use the default function. */
	gagFunction?: (player: entity) => boolean | undefined;
	/** Will not appear unless function returns true */
	prerequisiteFunction?: (gagged: boolean, player: entity) => boolean;
	/** Will appear greyed out unless true */
	greyoutFunction?: (gagged: boolean, player: entity) => boolean;
	greyoutTooltip?: string;
	/** List of personalities supported by this dialogue */
	personalities?: string[];
	/** Jumps to the specified dialogue when clicked, after setting the response string*/
	leadsTo?: string;
	leadsToStage?: string;
	/** Pressing the skip key will click this option */
	skip?: boolean;
	/** After leading to another dialogue, the response will NOT be updated */
	dontTouchText?: boolean;
	exitDialogue?: boolean;
	/** The response the NPC will give when this dialogue is clicked. If response is "null", then it keeps the original, "" uses pregenerated
	 * The string name will be "r" + response with a couple of enemy-specific variations
	 */
	response?: string;
	/** Whether or not the response is different if you are gagged */
	responseGag?: boolean;
	/** The option for you to select for this dialogue. "" means pregenerated, OK to put "" for top-level KinkyDialogues
	 * The string name will be "d" + response
	 */
	playertext?: string;
	/** Whether or not this line has a gag-specific dialogue line */
	gag?: boolean;
	/** Threshold at which the player is considered gagged for this dialogue. Default is 0.01*/
	gagThreshold?: number;
	/** Whether or not this option appears while gagged */
	gagDisabled?: boolean;
	/** Whether or not this option appears while ungagged */
	gagRequired?: boolean;
	/** Options to display */
	options?: Record<string, KinkyDialogue>;
	/** Name of a dialogue to get extra options from. Merges them, preferring this dialogue's options if the name is the same */
	extraOptions?: string;

	outfit?: string;
	chance?: number;
}

interface KinkyVibration {
	sound: string,
	// Basic Factors
	/** Item applying this vibration */
	source: string,
	/** Identification */
	name: string,
	intensity: number,
	/** Location(s) of the vibration */
	location: string[],

	// Total duration
	duration: number,
	durationLeft: number,

	// Denial
	/** Will turn off for this long when being denied */
	denyTime?: number,
	denyTimeLeft?: number,

	/** Will deny this many times. */
	denialsLeft?: number,
	/** Always denies instead of orgasm. Overrides edgeOnly in the vibration itself but gets overridden by vibe modifiers */
	alwaysDeny?: boolean,
	/** Chance to deny. 0 or undefined means 100%*/
	denialChance?: number,
	/** Chance to deny if the player is likely to orgasm. 0 or undefined means 100%*/
	denialChanceLikely?: number,

	// Edging
	/** After this much time the orgasms will be unlocked*/
	edgeTime?: number,
	edgeTimeLeft?: number,
	/** The vibration will sense when the player is at max arousal and only decrement the timer then */
	tickEdgeAtMaxArousal?: boolean,


	/** Will repeat this many times */
	loopsLeft?: number,

	/** Orgasm will always be impossible */
	edgeOnly?: boolean,

	/** Table of modifiers */
	VibeModifiers: VibeMod[],
}

interface VibeMod {
	sound: string,
	/** Source of the modifier */
	source: string,
	/** Identifier of the modifier */
	name: string,
	/** Location of the modifier */
	location: string,
	/** Duration of the vibe modifier */
	duration: number,
	durationLeft: number,
	/** Change to intensity, cannot go below 1, capped at the value of the highest/lowest mod*/
	intensityMod: number,
	/** Forces intensity*/
	intensitySetpoint?: number,
	edgeOnly?: boolean,
	forceDeny?: boolean,
	bypassDeny?: boolean,
	bypassEdge?: boolean,
	/** Duration does not tick down while this vibe mod is on */
	extendDuration?: boolean,
	/** Increments the deny chance */
	denyChanceMod?: number,
	/** Increments the deny chance */
	denyChanceLikelyMod?: number,
}

interface KDStruggleData {
	minSpeed: number;
	handBondage: number;
	armsBound: boolean;
	handsBound: boolean;
	failSuffix: string;
	restraint: item,
	struggleType: string,
	struggleGroup: string,
	escapeChance: number,
	cutBonus: number,
	origEscapeChance: number,
	origLimitChance: number,
	helpChance: number,
	limitChance: number,
	strict: number,
	cutSpeed: number,
	affinity: string,
	hasAffinity: boolean,
	restraintEscapeChance: number,
	cost: number,
	noise: number,
	wcost: number,
	escapePenalty: number,
	willEscapePenalty: number,
	canCut: boolean,
	canCutMagic: boolean,
	toolBonus: number,
	toolMult: number,
	buffBonus: number,
	buffMult: number,
	restriction: number,
	struggleTime: number,
	speedMult: number,
	escapeSpeed: number,
	query: boolean,
	maxLimit: number,
	result: string,
	lockType: KDLockType,

	extraLim: number,
	extraLimPenalty: number,
	extraLimThreshold: number,

	upfrontWill?: boolean,
}

interface KDFilteredInventoryItem {
    name: any;
    item: any;
    preview: string;
    preview2?: string;
    previewcolor?: string;
    previewcolorbg?: string;
    key?: string;
}

interface KDInventoryActionDef {
	text?: (player: entity, item: item) => string;
	label?: (player: entity, item: item) => string;
	itemlabel?: (player: entity, item: item) => string;
	labelcolor?: (player: entity, item: item) => string;
	itemlabelcolor?: (player: entity, item: item) => string;
	show?: (player: entity, item: item) => boolean;
	valid: (player: entity, item: item) => boolean;
	click: (player: entity, item: item,) => void;
	cancel: (player: entity, delta: number) => boolean;
	icon: (player: entity, item: item) => string;
	hotkey?: () => string,
	hotkeyPress?: () => string,
	alsoShow?: string[],
}

interface KinkyDungeonSave {
	/** Metadata */
	saveStat: {
		appearance: any[],
		default: string,
		poses: Record<string, boolean>,
		Palette: string,


		outfit: string,
		name: string,
		level: number,
		sp: string,
		mp: string,
		wp: string,
		dp: string,
	}

	KinkyDungeonCurrentTick: number,

	errorloading: boolean,
	modsmissing: boolean,


	version: string,
	KinkyDungeonPlayerEntity: any;
	level: number;
	checkpoint: string;
	rep: Record<string, number>;
	costs: Record<string, number>;
	pcosts: Record<string, number>;
	orbs: number[];
	chests: number[];
	dress: string;
	gold: number;
	points: number;
	progression: string;
	inventoryVariants: Record<string, KDRestraintVariant>;
	consumableVariants: Record<string, KDConsumableVariant>;
	weaponVariants: Record<string, KDWeaponVariant>;
	grounditems: any;
	perks: string[];
	levels: {
		Elements: number;
		Conjure: number;
		Illusion: number;
	};
	rescued: Record<string, boolean>;
	aid: Record<string, boolean>;
	seed: string;
	statchoice: [string, boolean][];
	mapIndex: Record<string, string>;
	id: number;
	idspell: number;
	choices: number[];
	choices_wep: string[];
	choices_arm: string[];
	choices_con: string[];
	choices2: boolean[];
	buffs: Record<string, any>;
	lostitems: any[];
	caches: number[];
	hearts: number[];
	spells: string[];
	inventory: item[];
	KDGameData: KDGameDataBase;
	KDMapData: KDMapDataType;
	KDWorldMap: Record<string, KDWorldSlot>;
	KDEventData: Object;
	KDCurrentWorldSlot: {x: number, y: number};
	KDPersistentNPCs: string,
	KDDeletedIDs: string,
	KDPersonalAlt: string,
	flags: [string, number][];
	uniqueHits: [string, boolean][];
	KDCommanderRoles: [number, string][];
	picks: number;
	rkeys: number;
	bkeys: number;
	mana: number;
	manapool: number;
	stamina: number;
	willpower: number;
	distraction: number;
	distractionlower: number;
	wep: any;
	npp: number;
	diff: number;


	// These are used only for preview purposes?
	// TODO make this cleaner
	inventoryarray?: {
		consumable: item[],
		restraint: item[],
		looserestraint: item[],
		weapon: item[],
		outfit: item[]
	};
	potions?: {
		stamina: number,
		mana: number,
		will: number,
		dist: number,
	},
	journey?: string,
	mistresskey?: number,
	outfitForPreview?: string[],
	arousalMode?: boolean,
	itemMode?: number,
	plug?: boolean,
	plugFront?: boolean,
	piercing?: boolean,
	random?: boolean,
	savemode?: boolean,
	hardmode?: boolean,
	extrememode?: boolean,
	//KinkyDungeonPerksMode = KinkyDungeonStatsChoice.get("perksMode");
	perksmode?: number,
	easymode?: number,
	progressionmode?: string,

	faction: Record<string, Record<string, number>>;
}

interface KDWorldSlot {
	data: Record<string, KDMapDataType>;
	x: number;
	y: number;
	color: string;
	name: string;
	main: string;
}

/**
 * A helper class for storing 'points of interest' that can be interacted with thru scripts, or just for notation
 */
interface KDLabel {
	name: string,
	type: string,
	faction?: string,
	x: number,
	y: number,
	/** Whether guard type enemies will switch to guarding this if nearby */
	guard?: boolean,
	/** Whether enemies will preferentially pick the point if its free */
	interesting?: boolean,

	/** NPC currently assigned to this point (-1 if none) */
	assigned: number,
}

interface RepopQueueData {
	x: number,
	y: number,
	time: number,
	entity: entity,
	/** Allow placing the object at a slightly different location */
	loose?: boolean,
}

interface KDMapDataType {
	RepopulateQueue: RepopQueueData[],
	Checkpoint: string,
	Title: string,
	PrisonState: string,
	PrisonStateStack: string[],
	PrisonType: string,

	Labels: Record<string, KDLabel[]>,

	flags?: string[],
	data: Record<string, any>,

	Regiments: Record<string, number>,


	GroundItems: {x: number, y: number, name: string, amount?: number} [];

	Grid: string;
	Traffic: number[][];
	GridWidth: number;
	GridHeight: number;
	FogGrid: any[];


	//MainPath: string,
	//ShortcutPath: string,

	Tiles: Record<string, any>;
	TilesSkin: Record<string, any>;
	TilesMemory: Record<string, any>;
	EffectTiles: Record<string, Record<string, effectTile>>;
	RandomPathablePoints: Record<string, {x: number, y: number, tags?:string[]}>;
	Entities: entity[];
	Bullets: any[];
	StartPosition: {x: number, y: number};
	EndPosition: {x: number, y: number};
	ShortcutPositions: {x: number, y: number}[];

	PatrolPoints: {x: number, y: number}[];

	MapBrightness: number;

	ConstantX: boolean;

	RoomType: string,
	MapMod: string,

	EscapeMethod: string,
	KillTarget: string,
	KillQuota: number,
	TrapQuota: number,
	TrapsTriggered: number,
	ChestQuota: number,
	ChestsOpened: number,
	QuestQuota: number,
	QuestsAccepted: number,
	KeyQuota: number,
	KeysHeld: number,

	JailPoints: KDJailPoint[],

	ShopItems: shopItem[],
	PoolUses: number,
	PoolUsesGrace: number,

	CategoryIndex: Record<string, {category: string, tags: string[]}>,

	JailFaction: string[],
	GuardFaction: string[],
	MapFaction: string,
}



type KDSideRoom = {
	name: string,
	faction?: string,
	weight: number,
	tags?: string[],
	/** Rolled once each time it gets a map mod */
	chance: number,
	/**
	 *
	 * @param slot Journey slot of the tile to be generated for
	 * @param side true = top side, false = bot side
	 * @returns {number} - Multiplier to chance
	 */
	filter: (slot: KDJourneySlot, side: boolean) => number,
	mapMod: string,
	altRoom: string,
	escapeMethod?: string,
	/** Returns whether it succeeded */
	stairCreation: (tile: any, x: number, y: number) => boolean,
}


type MapMod = {
	name: string,
	roomType: string,
	jailType?: string,
	guardType?: string,
	weight: number,
	/**
	 *
	 * @param slot Journey slot of the tile to be generated for
	 * @returns {number} - multiplier to WEIGHT
	 */
	filter: (slot: KDJourneySlot) => number,
	tags: string[],
	faction?: string,
	tagsOverride?: string[],
	bonusTags: Record<string, {bonus: number, mult: number}>,
	spawnBoxes?: any[],
	bonussetpieces?: {Type: string, Weight: number}[],
	altRoom: string,
	escapeMethod?: string,
	noPersistentPrisoners?: boolean,
}

type AIType = {
	/** Indicates that this enemy AI cannot be overridden */
	noOverride?: boolean,
	/** allows you to set an alternative AI type when requested */
	override?: Record<string, string>,
	/** The AI will only wander to visible points */
	strictwander?: boolean,
	/** Indicates that this is a protective AI */
	guard?: boolean,
	/** This enemy is stealthy until the ambush is triggered */
	ambush?: boolean,
	/** This is the tile for the AI which registers as tooltip */
	ambushtile?: string,
	/** Happens at the start immediately after AI is assigned*/
	init: (enemy: entity, player: entity, aidata: KDAIData) => void,
	/** Happens before movement. Return true to skip movement loop*/
	beforemove: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether the enemy chases the target if it sees them */
	chase: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Similar to chase but not quite.
	 * Will the enemy choose to go to the last seen target location?
	 * If it sees the target
	 * Can be false if you want an enemy to be more reserved about where it goes*/
	trackvisibletarget: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether enemy will chase the player across a long distance */
	persist: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether the enemy moves toward gx */
	move: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** whether the enemy obeys commands like Follow Me and such */
	follower: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether the enemy follows sound sources or not */
	followsound: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether enemy will randomly wander to nearby points*/
	wander_near: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether enemy will randomly choose points on the map to wander to */
	wander_far: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Function to replace wandernear. Return true to cancel stock func, false otherwise*/
	wandernear_func?: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Function to replace wanderfar. Return true to cancel stock func, false otherwise*/
	wanderfar_func?: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether it sets gx to gxx when idle, and gy to gyy */
	resetguardposition: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Whether enemy attacks */
	attack: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** whether enemy casts spells */
	spell: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** This function executes before wander location changes. Return True to override wander behavior */
	aftermove: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** This executes after enemy is determined to be idle or not. If true, prevents spells.*/
	afteridle?: (enemy: entity, player: entity, aidata: KDAIData) => boolean,
	/** Returns the current wander long delay.*/
	wanderDelay_long?: (enemy: entity, aidata?: KDAIData) => number,
	/** Returns the current wander short delay.*/
	wanderDelay_short?: (enemy: entity, aidata?: KDAIData) => number,

}

interface KDRuneCountData {
	maxRunes: number,
	runes: number,
	explodeChance: number,
	/** Type = bullet */
	runeList: any[],
}

interface KDAITriggerData {
	/** Determines that the AI can play with the player and initiate a play event */
	playAllowed?: boolean,
	/** A SUBSET of hostile. In some cases an enemy will be hostile but not aggressive.
	 * neutrals and allies cannot be aggressive */
	aggressive?: boolean,
	playerDist?: number,

	allowPlayExceptionSub?: boolean,
	ignoreNoAlly?: boolean,
	ignoreCombat?: boolean,
	canTalk?: boolean,
};

/** Container for KD AI data
 * Persistently stored as AIData variable for use in some
 */
interface KDAIData extends KDAITriggerData {
	playerItems?: item[],
	/** The target of the AI, NOT the KinkyDungeonPlayerEntity but rather a target entity which CAN be the player */
	player?: entity,
	/** Whether or not the enemy can talk */
	canTalk?: boolean,

	/** Whether to do a defeat or not */
	defeat?: boolean,
	/** Whether this enemy is idle or not. Gets set to true by default and false if the enemy does ANYTHING */
	idle?: boolean,
	/** Indicates that the enemy has moved, therefore cant attack or cast unless it has the necessary properties */
	moved?: boolean,
	/** Refresh the warning tiles due to whatever reason */
	refreshWarningTiles?: boolean,

	/** Enemy will ignore the player, i.e. will not attack the player or chase the player or do anything to the player */
	ignore?: boolean,
	/** Player is rather tied up and not considered a big threat generally */
	harmless?: boolean,
	/** Enemy belongs to a hostile faction */
	hostile?: boolean,

	/** Enemy belongs to an allied faction */
	allied?: boolean,
	/** This enemy is feeling dominated by the player and will generally act submissive */
	domMe?: boolean,

	/** Hit SFX */
	hitsfx?: string,

	/** Enemy is pretty distracted */
	highdistraction?: boolean,
	/** Enemy is totally distracted */
	distracted?: boolean,
	/** Level of bondage on this enemy, 0-4 */
	bindLevel?: number,

	/** Enemy can ignore locks when opening doors */
	ignoreLocks?: boolean,
	/** Movable tiles for the enemy */
	MovableTiles?: string,
	/** Tiles that the enemy will try to avoid if possible but can still move into if needed */
	AvoidTiles?: string,

	// Enemy attack stats
	/** Enemy attack type, changes based on special, etc */
	attack?: string,
	range?: number,
	width?: number,
	accuracy?: number,
	damage?: string,
	power?: number,
	/** Enemy has a vibe remote and will vibe the player if it hits the player */
	vibe?: boolean,

	/** Enemy is CAPABLE of leashing, it is a leashing enemy */
	leashing?: boolean,
	/** Enemy would add a leash if it would be aggressive to the player */
	addLeash?: boolean,
	/** Desired restraining level of the player.
	 * If the player is this restrained,
	 * then the enemy will not add any new bindings and will focus on leashing */
	targetRestraintLevel?: number,
	/** What happens if the player is below the target restraint level */
	addMoreRestraints?: boolean,

	/** The enemy is ABLE to aggro the target, either due to aggression or dominant play */
	canAggro?: boolean,
	/** The enemy actually aggros the target and will make attacks */
	wantsToAttack?: boolean,
	wantsToTease?: boolean,
	/** The enemy actually aggros the target and will cast spells */
	wantsToCast?: boolean,
	/** The enemy wants to pull the player instead of just attacking */
	wantsToLeash?: boolean,
	/** The enemy wants to leash the player, but prefers to pull instead of attack */
	focusOnLeash?: boolean,
	/** Enemy will move toward its target rather than its gx/gy position */
	moveTowardPlayer?: boolean,
	/** Enemy will wait a bit before forcing leash again */
	SlowLeash?: boolean,

	/** The enemy plans to leash the player,
	 * important to declare b/c otherwise enemy can close cages, etc during play*/
	intentToLeash?: boolean,
	/** The player is wearing a leash restraint and can be leash pulled */
	leashed?: boolean,
	/** Enemy stops moving when in range of the player */
	holdStillWhenNear?: boolean,

	/** Position to leash/pull the player to */
	leashPos?: {x: number, y: number},
	/** nearest jail to take the player to */
	nearestJail?: {x: number, y: number, type: string, radius: number},

	/** Enemy to follow */
	master?: entity,
	/** Chance that the enemy will kite */
	kiteChance?: number,
	/** Enemy has decided to kite */
	kite?: boolean,
	/** This variable is supposed to make the enemy not take potshots at you while in furniture*/
	ignoreRanged?: boolean,

	/** It's time to change patrol points */
	patrolChange?: boolean,
	/** This enemy is an ALLY and will follow the player */
	allyFollowPlayer?: boolean,
	/** an override situation to not follow the player
	 * Usually done by neutral enemies or allies that the player has told to hold still
	 */
	dontFollow?: boolean,

	// Vision and awareness stuff
	visionMod?: number,
	followRange?: number,
	visionRadius?: number,
	chaseRadius?: number,
	blindSight?: number,
	sneakMult?: number,
	directionOffset?: number,

	playerDistDirectional?: number,
	canSensePlayer?: boolean,
	canSeePlayer?: boolean,
	canSeePlayerChase?: boolean,
	canSeePlayerMedium?: boolean,
	canSeePlayerClose?: boolean,
	canSeePlayerVeryClose?: boolean,
	canShootPlayer?: boolean,

	/** Chance of starting a play event */
	playChance?: number,
	/** Indicates that a play event has started */
	startedDialogue?: boolean,
	/** Play event that has started */
	playEvent?: boolean,
}

interface KDJailRestraint {Name: string, Level: number, Variant?: string, Condition?: string, Priority?: string, Lock?: string};

type EnemyEvent = {
	/** Extremely important for leash events */
	overrideIgnore?: boolean,
	forceattack?: boolean,
	aggressive?: boolean,
	nonaggressive?: boolean,
	play?: boolean,
	noplay?: boolean,
	/** This event wont get cleared by mass resets, like when you are deposited into a cage */
	noMassReset?: boolean,
	/** Determines if the enemy will attack you */
	decideAttack?: (enemy: entity, target: entity, AIData: any, allied: boolean, hostile: boolean, aggressive: boolean) => boolean,
	/** Determines if the enemy will cast spells */
	decideSpell?: (enemy: entity, target: entity, AIData: any, allied: boolean, hostile: boolean, aggressive: boolean) => boolean,
	/** Determines weight */
	weight: (enemy: entity, AIData: any, allied: boolean, hostile: boolean, aggressive: boolean) => number,
	/** Run when triggered */
	trigger: (enemy: entity, AIData: any) => void,
	/** Run when leashes to the leash point */
	arrive?: (enemy: entity, AIData: any) => boolean,
	/** Run each turn at the end */
	maintain?: (enemy: entity, delta: number, AIData?: KDAIData) => boolean,
	/** Run before the move loop */
	beforeMove?: (enemy: entity, AIData: any, delta: number) => boolean,
	/** Run before the attack loop */
	beforeAttack?: (enemy: entity, AIData: any, delta: number) => boolean,
	/** Run before the spell loop */
	beforeSpell?: (enemy: entity, AIData: any, delta: number) => boolean,
}

type KDLockType = {
	specialActions?: (tile: any, entity: entity) => void;
	canNPCPass: (xx: number, yy: number, MapTile: object, Enemy: entity) => boolean;

	filter: (Guaranteed: boolean, Floor: number, AllowGold: boolean, Type: string, data: any) => boolean;
	weight: (Guaranteed: boolean, Floor: number, AllowGold: boolean, Type: string, data: any) => number;

	consume_key: boolean;
	lockmult: number;

	penalty?: Record<string, number>;

	/* For chests, etc*/
	pickable: boolean;
	/** Replace the pick icon with hacking */
	hackPick?: boolean;
	pick_speed: number;
	pick_diff: number;
	pick_lim?: number;
	/** For restraints */
	canPick: (data: any) => boolean;
	doPick: (data: any) => boolean;
	failPick: (data: any) => string;
	breakChance: (data: any) => boolean;
	unlockable: boolean;
	unlock_diff?: number;
	key: string;
	canUnlock: (data: any) => boolean;
	doUnlock: (data: any) => boolean;
	doLock?: (data: any) => void;
	failUnlock: (data: any) => string;
	removeKeys: (data: any) => void;

	levelStart: (item) => void;
	shrineImmune: boolean;

	commandlevel: number;
	commandable: boolean;
	command_lesser: () => number;
	command_greater: () => number;
	command_supreme: () => number;

	loot_special: boolean;
	loot_locked: boolean;
}

type KDBondageStatus = {
	silence: number,
	bind: number,
	slow: number,
	blind: number,
	disarm: number,
	reduceaccuracy: number,
	toy: number,
	plug: number,
	belt: number,
	immobile: number,
}

type KDMapTile = {
	Labels?: Record<string, KDLabel[]>,
    name: string;
    w: number;
    h: number;
	primInd: string,
    index: Record<string, string>;
    flexEdge?: Record<string, string>;
    flexEdgeSuper?: Record<string, string>;
    scale: number;
    category: string;
    weight: number;
    grid: string;
    POI: any[];
    Keyring?: any[];
	Jail: any[];
    Tiles: Record<string, any>;
    effectTiles: Record<string, Record<string, effectTile>>;
    Skin: Record<string, any>;
	/** List of inaccessible entrance pairs */
	inaccessible: {indX1: number, indY1: number, dir1: string, indX2: number, indY2: number, dir2: string}[];
	/** tags */
	tags: string[],
	/** tags that make weight 0 if they exist */
	forbidTags?: string[],
	/** tags required or else bad things happen */
	requireTags?: string[],
	/** tags for following 3 */
	indexTags: string[],
	/** tags and max counts before this tile is no longer considered */
	maxTags: number[],
	/** tags and weight bonus */
	bonusTags: number[],
	/** tags and weight mult */
	multTags: number[],
	/** NEGATION operator, triggers the mult if there is NOT a tag */
	notTags?: any[],
}

interface KDBondage {
	color: string,
	/** Multiplier for enemy bondage */
	enemyBondageMult: number,
	/** Order in which enemies will struggle */
	priority: number,
	/** Multiplier for struggle rate */
	struggleRate: number,
	/** Multiplier for the max health component of struggle */
	healthStruggleBoost: number,
	/** Multiplier for the power component of struggle */
	powerStruggleBoost: number,
	/** Multiplier for command level */
	mageStruggleBoost?: number,

	/** Affected by latex solvents */
	latex?: boolean,
}

interface KDCursedVar {
	variant: (restraint: restraint, newRestraintName: string) => any,
	level: number,
}

interface KDDelayedAction {
	data: any,
	time: number,
	commit: string,
	update?: string,
	/** Cancel this in certain cases */
	tags: string[],
}

interface KDBondageMachineFunc {
	eligible_player: (tile, x, y, entity) => boolean;
	eligible_enemy: (tile, x, y, entity) => boolean;

	function_player: (tile, delta, x, y, entity) => boolean;
	function_enemy: (tile, delta, x, y, entity) => boolean;
}

interface KDDroppedItemProp {
	/** When blindfolded, this item will be invisible if your blind level is equal to this or higher */
	tinyness?: number,
	/** This item will be kept when moving between floors*/
	persistent?: boolean,
}

type KDParticleData = {
	camX?: number,
	camY?: number,

	zIndex: number,
	fadeEase?: string,
	time: number,
	phase?: number,

	scale?: number,
	scale_delta?: number,

	rotation?: number,
	rotation_spread?: number,

	vy?: number,
	vy_spread?: number,
	vx?: number,
	vx_spread?: number,
	sin_period?: number,
	sin_period_spread?: number,
	sin_x?: number,
	sin_x_spread?: number,
	sin_y?: number,
	sin_y_spread?: number,
	/** Lifetime in ms */
	lifetime: number,
	lifetime_spread?: number,
}

type KDParticleEmitterData = {
	rate: number,
	cd: number,

	camX?: number,
	camY?: number,

	zIndex: number,
	fadeEase?: string,
	time: number,
	phase?: number,

	scale?: number,
	scale_delta?: number,

	rotation?: number,
	rotation_spread?: number,

	noFace?: boolean,

	vy?: number,
	vy_spread?: number,
	vx?: number,
	vx_spread?: number,
	sin_period?: number,
	sin_period_spread?: number,
	sin_x?: number,
	sin_x_spread?: number,
	sin_y?: number,
	sin_y_spread?: number,
	/** Lifetime in ms */
	lifetime: number,
	lifetime_spread?: number,
}

interface KDCursedDef {
	/** Restraints with this curse are unremovable via shrine */
	noShrine?: boolean,
	/** This curse is treated as a type of lock, for display purposes */
	lock?: boolean,
	/** Power multiplier of the curse, similar to a lock's lockmult */
	powerMult?: number,
	/** Fixed power increase */
	powerBoost?: number,
	/** This curse keeps events with the curse property from vanishing */
	activatecurse?: boolean,
	/** custom icon for removing (failure) */
	customIcon_RemoveFailure?: string,
	/** custom icon for removing (success) */
	customIcon_RemoveSuccess?: string,
	/** custom icon for the struggle groups display */
	customIcon_hud?: string,
	/** TODO NOT IMPLEMENTED for a future RemoveCursesWithShrine function */
	shrineRemove?: string[],
	level: number,
	weight: (item, allHex?) => number,
	customStruggle?: (item: item, Curse?: string) => void,
	customInfo?: (item: item, Curse?: string) => void,
	onApply?: (item: item, host?: item) => void,
	condition: (item: item) => boolean,
	remove: (item: item, host: item, specialMethod: boolean) => void, events?: KinkyDungeonEvent[]
}

type KDRestraintVariant = {
	/** Name prefix */
	prefix?: string,
	/** Name suffix */
	suffix?: string,
	/** The curse to apply with this inventory variant */
	curse?: string,
	/** The lock to apply with this inventory variant */
	lock?: string,
	/** extra events added on */
	events: KinkyDungeonEvent[],
	/** The original restraint this is based on */
	template: string,
	/** If true, this item will not be forcibly kept whenever being added or removed */
	noKeep?: boolean,
	/** Power of the variant */
	power?: number,
}
type KDWeaponVariant = {
	/** Name prefix */
	prefix?: string,
	/** Name suffix */
	suffix?: string,
	/** extra events added on */
	events: KinkyDungeonEvent[],
	/** The original weapon this is based on */
	template: string,
}
type KDConsumableVariant = {
	/** Name prefix */
	prefix?: string,
	/** Name suffix */
	suffix?: string,
	/** extra events added on */
	events: KinkyDungeonEvent[],
	/** The original consumable this is based on */
	template: string,
}

interface KDSpellComponent {
	/** Returns true if the component is ignored in this case even for partial applications */
	ignore: (spell: spell, x: number, y: number) => boolean,
	/** Returns true if the spell can be cast, or false otherwise */
	check: (spell: spell, x: number, y: number) => boolean,
	/** Run when the spell is cast */
	cast?: (spell: spell, data: any) => void,
	/** Get the name of the component when hovering over spell icon */
	stringShort: (ret: string) => string,
	/** Get the name of the component in the spell description */
	stringLong: (spell: spell) => string,

	/** Returns the component's partial miscast chance, such as from being gagged or wearing heels */
	partialMiscastChance: (spell: spell, x: number, y: number) => number,
	/** Returns the message suffix for failing due to a partial miscast chance */
	partialMiscastType: (spell: spell, x: number, y: number) => string,

}

type SpecialCondition = {
	resetCD: boolean,
	criteria: (enemy: entity, AIData: any) => boolean,
}

type KDEventData_affinity = {
    entity: entity;
    forceTrue: number;
    forceFalse: number;
    affinity: string;
    group: string;
    Message: boolean;
    canStand: boolean;
    msgedstand: boolean;
	groupIsHigh: boolean;
};
type KDEventData_PostApply = {player: entity, item: item|null, host: item, keep: boolean, Link: boolean, UnLink: boolean}
type KDEventData_CurseCount = {restraints: {item: item, host: item}[], count: number, activatedOnly: boolean}

interface KDExpressionType {
	EyesPose: string,
	Eyes2Pose: string,
	BrowsPose: string,
	Brows2Pose: string,
	BlushPose: string,
	MouthPose: string,
}

type KDExpression = {
	priority: number;
	stackable?: boolean,
	criteria: (C: any, flags: Map<string, number>) => boolean;
	expression: (C: any, flags: Map<string, number>) => KDExpressionType
}

interface KDPrisonState {
	name: string,
	/** Doesnt do anything, but marks this as a substate which goes to the last state */
	/** Unused */
	substate?: boolean,
	/** If CurrentTick > TimeSinceLastStateChange + substateTimeout it goes to a refresh state */
	/** Unused */
	substateTimeout?: number,
	/** Unused */
	refreshState?: string,
	/** Returns a state. Runs as soon as the map is created */
	init: (MapParams: floorParams) => string,
	/** Each turn this function runs and returns a state */
	update: (delta: number) => string,
	/** Each turn this function runs, but only if its in the stack*/
	updateStack?: (delta: number) => void,
	/** Runs when the state is left*/
	finally?: (delta: number, currentState: string, stackPop: boolean) => void,



}
interface KDPrisonType {
	name: string,
	states: Record<string, KDPrisonState>,
	starting_state: string,
	default_state: string,

	/** Each turn this function runs. If a state is returned it sets the state*/
	update: (delta: number) => string | void;
}

interface KDPresetLoadout {
	weapon_current: string,
	weapon_other: string,
	armor: string[],
}

interface KDTrainingRecord {
	/** Turns in this floor's session that have been trained */
	turns_trained: number,
	/** Sessions where an opportunity to train was presented but player circumvented it */
	turns_skipped: number,
	/** Sessions where an opportunity to train was presented */
	turns_total: number,
	/** Current training amount */
	training_points: number,
	/** Current training level, basically floor(training_points) */
	training_stage: number,
}

interface KDRopeType {
	tags: string[],
}

interface KDSealGroup {
	/** Whether the seal group is disabled based on the arousal mode */
	arousalMode?: boolean,
	/** Level of difficulty of the seal group */
	level: number,
	/** Prevents this seal group from being a greater seal */
	disallowGreater?: boolean,
	/** Prevents this seal group from being a lesser seal */
	disallowLesser?: boolean,
	/** The seals in this seal group */
	seals: KDSeal[],
}

interface KDSFXGroup {
	/** Sound when using an escape method*/
	sfxEscape?: {
		Struggle?: string,
		Cut?: string,
		Remove?: string,
		Pick?: string,
		Unlock?: string,
		NoStamina?: string,
		NoWill?: string,
		NoMagic?: string,
		MagicCut?: string,
		PickBreak?: string,
		KnifeBreak?: string,
		KnifeDrop?: string,
		KeyDrop?: string,
		PickDrop?: string,
		Blocked?: string,
	},
	sfxFinishEscape?: {
		Struggle?: string,
		Cut?: string,
		Remove?: string,
		Pick?: string,
		Unlock?: string,
		Destroy?: string,
	}
	/** Remove sound */
	sfxRemove?: string,
	/** Equip sound */
	sfx?: string,
}

interface KDEnemyAction {
	/** Enemy will not willingly let go of leashes during this action */
	holdleash?: boolean;
	/** Enemy will sprint during this action */
	sprint?: boolean;
	end?: (enemy) => void;
	filter?: (enemy) => boolean;
	maintain: (enemy, delta) => boolean;
}

interface KDSeal {
	/** Name of the seal buff */
	name: string,
	/** Color of the seal buff */
	aura: string,
	/** Sprite of the seal buff */
	aurasprite: string,
	/** Events of the seal buff */
	events: KinkyDungeonEvent[],
}

interface KDBoobyTrap {
	minlevel: number,
	filter: (enemy: entity, x: number, y: number, checkpoint: boolean, type: string[]) => boolean;
	weight: (enemy: entity, x: number, y: number, checkpoint: boolean, type: string[]) => number;
	lifetime?: number;
}

interface ApplyVariant {
	nonstackable?: boolean,
	hexes: string[],
	enchants: string[],
	level: number,
	powerBonus: number,
	curse?: string,
	noKeep?: boolean,
	prefix?: string,
	suffix?: string,
	minfloor: number,
	maxfloor?: number,
}

interface SpecialStat {
	PerFloor: (player: entity, amount: number) => number, // Amount lost per floor
	BuffEvents?: (player: entity) => KinkyDungeonEvent[],
}

enum PosNeutNeg {
	positive=1,
	neutral=0,
	negative=-1,
}

enum ModifierEnum {
	restraint,
	weapon,
	consumable,
}

interface KDEnchantmentType {
	level: number,
	filter: (item: string, allEnchant: string[], data: KDHexEnchantWeightData) => boolean,
	weight: (item: string, allEnchant: string[], data: KDHexEnchantWeightData) => number,
	events: (item: string, Loot: any, curse: string, primaryEnchantment: string, enchantments: string[], data?: KDHexEnchantEventsData) => KinkyDungeonEvent[]
}

interface KDHexEnchantEventsData {
	variant: {events: KinkyDungeonEvent[], template: string},
}
interface KDHexEnchantWeightData {
	item: string,
}

interface KDEnchantment {
	tags: string[],
	prefix?: string,
	suffix?: string,
	types: Record<ModifierEnum, KDEnchantmentType>,
}

interface KDModifierConditionData {
	element?: string,
	Loot: string,
	curse: string,
	primaryEnchantment: string,
	enchantments: string[],
}

interface KDModifierEffectType {
	level: number,
	onSelect?: (item: string, data: KDModifierConditionData) => void;
	filter: (item: string, positive: PosNeutNeg, data: KDModifierConditionData) => boolean;
	weight: (item: string, positive: PosNeutNeg, data: KDModifierConditionData) => number;
	events: (item: string, positive: PosNeutNeg, data: KDModifierConditionData) => KinkyDungeonEvent[];
}

interface KDModifierEffect {
	tags: string[],
	types: Record<ModifierEnum, KDModifierEffectType>
}

interface KDModifierConditionType {
	level: number,
	filter: (item: string, effect_positive: KDModifierEffect[], effect_neutral: KDModifierEffect[], effect_negative: KDModifierEffect[], data: KDModifierConditionData) => boolean;
	weight: (item: string, effect_positive: KDModifierEffect[], effect_neutral: KDModifierEffect[], effect_negative: KDModifierEffect[], data: KDModifierConditionData) => number;
	events: (item: string, effect_positive: KDModifierEffect[], effect_neutral: KDModifierEffect[], effect_negative: KDModifierEffect[], data: KDModifierConditionData) => KinkyDungeonEvent[];
}

interface KDModifierCondition {
	tags: string[],
	types: Record<ModifierEnum, KDModifierConditionType>
}


interface KDSpecialEnemyBuff {
	filter: (enemy: entity, type: string[]) => boolean;
	weight: (enemy: entity, type: string[]) => number;
	apply: (enemy: entity, type: string[]) => void;
}

type KDCommanderOrderData = {
	delta: number,
	VavgWeight: number,

	globalIgnore: boolean,

	fleeThresh: number,
	combat: boolean,
	// Temp vars
	aggressive: boolean,
	invalidChoke: Record<string, boolean>,
}

interface KDCommanderOrder {
	filter: (enemy: entity, data: KDCommanderOrderData) => boolean;
	weight: (enemy: entity, data: KDCommanderOrderData) => number;
	apply: (enemy: entity, data: KDCommanderOrderData) => void;
	maintain: (enemy: entity, data: KDCommanderOrderData) => boolean;
	update: (enemy: entity, data: KDCommanderOrderData) => void;
	remove: (enemy: entity, data: KDCommanderOrderData) => void;

	global_before: (data: KDCommanderOrderData) => void;
	global_after: (data: KDCommanderOrderData) => void;
}

type KDCollectionTabDrawDef = (value: KDCollectionEntry, buttonSpacing: number, III: number, x: number, y: number) => number

interface KDCollectionEntry {
	name: string,
	color: string,
	type: string,
	sprite: string,
	Facility: string,
	customSprite: boolean,
	escaped?: boolean,
	escapegrace?: boolean,
	personality: string,

	/** Optional NPC palette */
	Palette?: string,

	spawned?: boolean,

	id: number,
	Enemy?: enemy, // for unique ones
	/** Todo remove this and replace with persistent NPC flag */
	flags?: Record<string, number>,
	customOutfit?: string,
	outfit?: string,
	hairstyle?: string,
	bodystyle?: string,
	facestyle?: string,
	cosplaystyle?: string,

	/** Status: Guest, Prisoner, Servant, or Manager */
	status: string,
	oldstatus: string,
	class: string,

	Faction: string,
	Opinion: number,
	Training: number,
	Willpower: number,
}

interface KDFactionProps {
	nameList?: string[],
	/** Negative - will join their allies on sight against you
	 * Neutral - will only join if they see you attacking their ally or their ally is otherwise neutral with you
	 * Positive - will only join if their ally would otherwise be neutral with you
	 */
	honor: number,
	/** Honor toward specific factions */
	honor_specific: Record<string, number>,
	/** Weight to have them show up in a given floor type and floor count (and in future floor X and floor Y) */
	weight: (Floor: number, Checkpoint: string, tags: string[], bonustags: Record<string, {bonus: number, mult: number}>, X: number, Y: number) => number,
	/** Executes once when starting high sec dialogue */
	customHiSecDialogue?: (guard: entity) => string,
	/** Custom defeat to use */
	customDefeat?: string,
	/** Custom jail allied faction to use */
	jailAlliedFaction?: string,
	/** Backup incase cant find strictly using jailAlliedFaction */
	jailBackupFaction?: string,
	/** Custom jail outfit to use */
	jailOutfit: string,
}

type KDJailGetGroupsReturn = {
	groupsToStrip: string[],
	itemsToApply: {item: string, variant: string}[],
	itemsToKeep: Record<string, boolean>,
	itemsToStrip: Record<string, boolean>,
};

interface KDLeashData {
	priority: number,
	length: number,
	x: number,
	y: number,
	entity?: number,
	reason?: string,
	restraintID?: number,
	color?: string,
};

type Lore = {
	//text: string,
	condition?: () => boolean,
	image?: string,
	/** Don't show in the list, just make available */
	noShow?: boolean,
}

type KDJourneySlot = {
	visited: boolean,

	x: number;
	y: number;
	color: string;
	type: string;
	RoomType: string;
	MapMod: string;
	EscapeMethod: string;
	Faction: string;
	SideRooms: string[];
	Checkpoint: string;
	Connections: {x: number, y: number}[];
	/** Prevents from getting culled */
	protected?: boolean;
};
type KDJourneyMap = {[_: string]:  KDJourneySlot};

type outfit = {name: string, dress: string, shop: boolean, rarity: number, events?: KinkyDungeonEvent[], costMod?: number, palette?: string};

type KDTile = any;

type KDTrapType = (tile: KDTile, entity: entity, x: number, y: number) => {msg: string, triggered: boolean}

type KDSprites = {[_: string]: (x: number, y: number, fog: boolean, noReplace: string) => string}
type KDTeaseAttackListsType = {[_: string]: string[]}
type KDTeaseAttacksType = {[_: string]: KDTeaseAttack}
type KDTeaseAttack = {
	name: string,
	priority: number,
	blockable: boolean,
	dodgeable: boolean,
	/** Allows this to be added to the list */
	filter: (enemy: entity, player: entity, AIData: KDAIData) => boolean,
	/** Returns true if it connects, false otherwise if blocked/ignored somehow */
	apply: (enemy: entity, player: entity, AIData: any, blocked: boolean, evaded: boolean, damageMod: number) => boolean,
};

declare const zip: any;
declare const guessLanguage: {
	detect(text: string): string;
	info(text: string): [string, string, string];
	code(text: string): [number];
	name(text: string): string;
};

declare const PIXI: typeof import('pixi.js') & typeof import('pixi.js-legacy') & {
	// Filters says it's deprecated and should be referenced `PIXI.<filter>` rather than `PIXI.filters.<filter>`
	// But that doesn't work, and this does.
	filters: typeof import('pixi-filters'),
};

// We can't refer to a type as `PIXI.Container`, nor `typeof PIXI.Container`, but `import(pixi.js).Container` does work
type PIXIContainer = import('pixi.js').Container;
type PIXIMesh = import('pixi.js').Mesh;
type PIXIRenderTexture = import('pixi.js').RenderTexture;
type PIXITexture = import('pixi.js').Texture;
type PIXISprite = import('pixi.js').Sprite;


type PIXIPlane = import('pixi.js').SimplePlane;
type PIXIBuffer = import('pixi.js').Buffer;
type IArrayBuffer = import('pixi.js').IArrayBuffer;
type PIXIArray = import('pixi.js').ITypedArray;
type PIXIAdjustmentFilter = import('pixi-filters').AdjustmentFilter;
type PIXIFilter = import('pixi.js').Filter;

//type PIXIExtensionType = import('pixi.js').ExtensionType;
//type PIXIUnresolvedAsset = import('pixi.js').Assets;

type PIXIMatrix = import('pixi.js').Matrix;
type PIXIPoint = import('pixi.js').Point;
type PIXIRenderer = import('pixi.js').Renderer;

type ISpriteMaskTarget = import('pixi.js').ISpriteMaskTarget;

type PIXICLEAR_MODES = import('pixi.js').CLEAR_MODES;
type PIXIFilterSystem = import('pixi.js').FilterSystem;

type PIXIUnresolvedAsset = any; // The dreaded
