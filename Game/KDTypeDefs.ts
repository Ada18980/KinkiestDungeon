type Named = {
	name: string,
}

interface NamedAndTyped extends Named {
	/** Type of the item*/
	type?: string,
}

/** Kinky Dungeon Typedefs*/
interface item extends NamedAndTyped {
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
	inventoryAs?: string,
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
	/** Used for Gold locks only, determines which floor the lock will release*/
	lockTimer?: number,
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

interface consumable {
	name: string,
	rarity: number,
	type: string,
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
	Asset: string,
}

interface KDRestraintPropsBase {
	/** Used in standalone to replace Color */
	Filters?: Record<string, LayerFilter>,
	/** TODO Used in standalone to indicate which faction colors map to which filter
	 * color is the faction color type
	 * override is whether the faction color overrides the filter. If true it will replace the filter in the model. If false it will apply it over the model's filter.
	*/
	FactionFilters?: Record<string, {color: string, override: boolean}>,
	/** This item is unaffected by shrines */
	noShrine?:boolean,
	/** This item is beneficial and player wont try to struggle from it */
	good?: boolean,

	inventory?: boolean,
	power?: number,
	weight?: number,
	minLevel?: number,
	allFloors?: boolean,

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

	/** These items can only be applied if an enemy has the items in her inventory or the unlimited enemy tag */
	limited?: boolean,
	/** Forced to allow these, mainly leashes and collars */
	unlimited?: boolean,

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
	 * This item only provides protection if its group is being targeted
	 */
	protectionCursed?: boolean;
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
	/** This item can be rendered when linked */
	renderWhenLinked?: string[];
	// Player must have one of these PlayerTags to equip
	requireSingleTagToEquip?: string[];
	/** This item always renders when linked */
	alwaysRender?: boolean,
	/** When the mentioned items are rendered, changes the type */
	changeRenderType?: Record<string, string>;
	/** Stacking category, used to determine if you can have multiple of these items in a stack */
	linkCategory?: string;
	/** Stacking size, can't exceed 1 */
	linkSize?: number;
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
	/** Used for when the visual asset in BC is different from the actual group of the item*/
	AssetGroup?: string,
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
	/** Blocking feet is for restraints that tie the legs together, forcing the player into SLow Level 2 or higher */
	blockfeet?: boolean,
	/** Your total gag level is the sum of the gag values of all your variables. Ball gags have 0.3-0.75 based on size and harness, muzzles are 1.0 */
	gag?: number,
	/** Higher value = higher vision loss */
	blindfold?: number
	/** Maximum stamina percentage the player can have in order for the restraint to be applied. 0.25-0.35 for really strict stuff, 0.9 for stuff like ball gags, none for quick restraints like cuffs */
	maxwill?: number,
	Type?: string,
	/** Item is removed when the wearer goes to prison */
	removePrison?: boolean,
	/** Changes the dialogue text when you fail to remove the item */
	failSuffix?: Record<string, string>,
	/** Changes the dialogue text when you try to struggle completely */
	specStruggleTypes?: string[],
	/** List of Groups removed */
	remove?: string[],
	/** List of tags removed */
	removeShrine?: string[],
	slimeLevel?: number,
	addTag?: string[],
	addPose?: string[],
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
	/** The item can be linked by anything */
	LinkAll?: boolean,
	/** The item cannot be linked over anything */
	NoLinkOver?: boolean,
	/** Power to display, not actual power */
	displayPower?: number,
};

interface restraint extends KDRestraintProps {
	power: number,
	/** Base weight of the restraint, required */
	weight: number,
	minLevel: number,

	Color: string[] | string,

	escapeChance: any,

	enemyTags: Record<string, number>,
	/** Multiplies the weight AFTER, useful for minimizing things */
	enemyTagsMult?: Record<string, number>,
	playerTags: Record<string, number>,
	shrine: string[],
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
	doorchance: number,
	nodoorchance : number,
	doorlockchance : number,
	doorlocktrapchance? : number,
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

	shortcuts: {Level: number, checkpoint: string, chance:number}[	],
	mainpath: {Level: number, checkpoint: string, chance?: number}[],

	traps: {Name: string, Enemy?: string, Spell?: string, extraTag?: string, Level: number, Power: number, Weight: number, strict?: true}[],

	min_width : number,
	max_width : number,
	min_height : number,
	max_height : number,

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
	/** Standalone club asset */
	Model: string,
	/** Filters */
	Filters?: Record<string, LayerFilter>,
	/** Faction color index */
	factionColor?: number[][],
}

interface KDLoadout {name: string, tags?: string[], singletag: string[], singletag2?: string[], forbidtags: string[], chance: number, items?: string[], restraintMult?: number, multiplier?: number};

interface enemy extends KDHasTags {
	/** This enemy will always kite the player even if player is harmless*/
	alwaysKite?: boolean,
	/** This enemy will give an intro when it first sees you*/
	intro?: string,


	/** These enemies always carry these items at the start */
	startingItems?: string[]

	/** Restraint filters */
	RestraintFilter?: {
		/** Starts with more restraints!! */
		bonusRestraints?: number,
		/** This enemy can apply restraints without needing them in her pockets */
		unlimitedRestraints?: boolean,
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
		/** Sound multiplier while moving, default 1 */
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
	/** Hit chance = 1 / (1 + evasion) */
	evasion?: number,
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
	/** */
	bound?: string,
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
	specialMinrange?: number,
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
	/** Sfx when an attack lands*/
	hitsfx?: string,
	/** All lockable restraints will use this lock*/
	useLock?: string,
	/** Uses this lock when using the lock attack */
	attackLock?: string,
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
	/** This enemy does not channel its spells */
	noChannel?: boolean,
	/** Focuses player over summmons, ignores decoys */
	focusPlayer?: boolean;
	/** Cant be swapped by another enemy pathing */
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

interface weapon {
	arousalMode?: boolean,
	name: string;
	dmg: number;
	chance: number;
	type: string;
	bind?: number;
	crit?: number;
	bindcrit?: number;
	bindType?: string;
	distract?: number;
	bindEff?: number;
	distractEff?: number;
	light?: boolean;
	heavy?: boolean;
	boundBonus?: number;
	tease?: boolean;
	rarity: number;
	staminacost?: number;
	magic?: boolean;
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
	novulnerable?: boolean;
	tags?: string[];
	special?: {
		type: string,
		spell?: string,
		prereq?: string,
		selfCast?: boolean,
		requiresEnergy?: boolean,
		energyCost?: number,
		range?: number,};
}

interface KinkyDungeonEvent {
	trim?: boolean,
	cost?: number,
	cursetype?: string,
	/** This is from a temporary event curse */
	curse?: boolean,
	tags?: string[],
	duration?: number,
	always?: boolean,
	bindEff?: number,
	type: string;
	trigger: string;
	restraint?: string;
	sfx?: string;
	power?: number;
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
	time?: number;
	bindType?: string;
	chance?: number;
	buff?: any;
	lock?: string;
	msg?: string;
	prereq?: string;
	color?: string;
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

interface entity {
	visual_hp?: number,
	visual_boundlevel?: number,
	visual_distraction?: number,
	visual_lifetime?: number,

	/** The enemy will follow enemies defined by this block*/
	master?: masterInfo,

	// Direction
	flip?: boolean,

	// Custom play line
	playLine?: string,
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
	Enemy: enemy,
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
	noDrop?: boolean,
	droppedItems?: boolean,
	specialdialogue?: string,
	aggro?: number,
	id?: number,
	hp: number,
	AI?: string,
	moved?: boolean,
	playerdmg?: number,
	idle?: boolean,
	summoned?: boolean,
	boundLevel?: number,
	specialBoundLevel?: Record<string, number>,
	distraction?: number,
	lifetime?: number,
	maxlifetime?: number,
	attackPoints?: number,
	movePoints?: number,
	aware?: boolean,
	vp?: number,
	tracking?: boolean,
	revealed?: boolean,
	ambushtrigger?: boolean,
	castCooldown?: number,
	castCooldownSpecial?: number,
	specialCharges?: number,
	usingSpecial?: boolean,
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
	path?: {x: number, y: number}[],
	gx?: number,
	gy?: number,
	gxx?: number,
	gyy?: number,
	rage?: number,
	hostile?: number,
	faction?: string,
	allied?: number,
	ceasefire?: number,
	bind?: number,
	blind?: number,
	disarm?: number,
	slow?: number,
	freeze?: number,
	stun?: number,
	silence?: number,
	vulnerable?: number,
	buffs?: any,
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
}

type KinkyDungeonDress = {
	Item: string;
	Group: string;
	Color: string | string[];
	Filters?: Record<string, LayerFilter>;
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
	skin?: string,
	/** random = basic effect where it fades in and has a chance to fade out again */
	fade?: string,
	statuses?: Record<string, number>,
};

/** For spells */
interface effectTileRef {
    name: string,
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
	/** Crit damage multiplier of the spell */
	crit?: number;
	/** Sound efgfect that plays when you miscast */
	miscastSfx?: string,
	/** This spell doesnt hurt the target upon directly hitting, only the AoE */
	noDirectDamage?: true,
	/** This spell does not leave a warning to the player */
	hideWarnings?: boolean,
	/** This spell does leave a warning to the player */
	alwaysWarn?:boolean,
	/** Marks a spell as non-magical, so traps dont leave a rune on the ground */
	nonmagical?: boolean,
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
	effectTileDurationModDoT?: number,
	effectTileDensityDoT?: number,
	effectTileDensity?: number,

	/** Hides this spell in the spell screen */
	hide?: boolean,

	shotgunCount?: number,
	shotgunSpread?: number,
	shotgunDistance?: number,
	shotgunSpeedBonus?: number,

	distractEff?: number,
	bindEff?: number,

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
	/** spell required to unlock this one */
	prerequisite?: string | string[];
	/** blocked if you have this spell */
	blockedBy?: string[];
	/** Spell is hidden if you didnt learn it */
	hideUnlearnable?: boolean,
	/** Spell is hidden if you didnt learn this spell */
	hideWithout?: string,
	/** Spell is hidden if you DID learn it */
	hideLearned?: boolean,
	/** Automatically learns the spells when you learn it (thru magic screen) */
	autoLearn?: string[],
	/** This spell wont trigger an aggro action */
	noAggro?: boolean;
	/** Whether the spell defaults to the Player faction */
	allySpell?: boolean;
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
	/** size of sprite */
	size?: number;
	/** Prevents multiple instances of the spell from doing damage on the same turn from the same bullet to the same enemy */
	noUniqueHits?: boolean;
	/** AoE */
	aoe?: number;
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
	/** Specific to a class */
	classSpecific?: string;
	/** Verbal, arms, or legs */
	components?: string[];
	/** Spell level */
	level: number;
	/** Whether the spell is passive (like the summon count up) or active like the bolt or toggle spells*/
	passive?: boolean;
	/** An active spell but it has passive effects */
	mixedPassive?: boolean;
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
	/** Spell can be dodged */
	evadeable?: boolean;
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
	/** CastInWalls */
	CastInWalls?: boolean;
	/** noTargetEnemies */
	noTargetEnemies?: boolean;
	/** Exception list for NoTargetEnemies */
	exceptionFactions?: string[];
	/** noTargetAllies */
	noTargetAllies?: boolean;
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

interface KDPoint {x: number, y: number}
interface KDJailPoint extends KDPoint {type: string, radius: number, requireLeash?: boolean, requireFurniture?: boolean, direction?:{x: number, y: number}, restraint?:string, restrainttags?:string[]}

interface KinkyDialogue {
	/** REPLACETEXT -> Replacement */
	data?: Record<string, string>;
	/** Tags for filtering */
	tags?: string[];
	/** Shows the quick inventory */
	inventory?: boolean;
	/** Function to play when clicked. If not specified, nothing happens.  Bool is whether or not to abort current click*/
	clickFunction?: (gagged: boolean, player: entity) => boolean | undefined;
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
}

interface KinkyVibration {
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

interface KDInventoryActionDef {
	valid: (player: entity, item: item) => boolean;
	click: (player: entity, item: item) => void;
	cancel: (player: entity, delta: number) => boolean;
}

interface KinkyDungeonSave {
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
	inventoryVariants: Record<string, KDInventoryVariant>;
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
	flags: [string, number][];
	stats: {
		picks: number;
		keys: number;
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
	};
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

interface KDMapDataType {
	Checkpoint: string,
	Title: string,


	GroundItems: {x: number, y: number, name: string, amount?: number} [];

	Grid: string;
	GridWidth: number;
	GridHeight: number;
	FogGrid: any[];


	MainPath: string,
	ShortcutPath: string,

	Tiles: Record<string, any>;
	TilesSkin: Record<string, any>;
	TilesMemory: Record<string, any>;
	EffectTiles: Record<string, Record<string, effectTile>>;
	RandomPathablePoints: Record<string, {x: number, y: number, tags?:string[]}>;
	Entities: entity[];
	Bullets: any[];
	StartPosition: {x: number, y: number};
	EndPosition: {x: number, y: number};
	ShortcutPosition: {x: number, y: number};

	PatrolPoints: {x: number, y: number}[];

	MapBrightness: number;

	ConstantX: boolean;

	RoomType: string,
	MapMod: string,


	JailPoints: KDJailPoint[],

	ShopItems: shopItem[],
	PoolUses: number,
	PoolUsesGrace: number,

	CategoryIndex: Record<string, {category: string, tags: string[]}>,

	JailFaction: string[],
	GuardFaction: string[],
	MapFaction: string,
}


type MapMod = {
	name: string,
	roomType: string,
	jailType?: string,
	guardType?: string,
	weight: number,
	tags: string[],
	faction?: string,
	tagsOverride?: string[],
	bonusTags: Record<string, {bonus: number, mult: number}>,
	spawnBoxes?: any[],
	bonussetpieces?: {Type: string, Weight: number}[],
	altRoom: string,
}

type AIType = {
	noOverride?: boolean,
	/** allows you to set an alternative AI type when requested */
	override?: Record<string, string>,
	/** The AI will only wander to visible points */
	strictwander?: boolean,
	/** This enemy is stealthy until the ambush is triggered */
	ambush?: boolean,
	/** This is the tile for the AI which registers as tooltip */
	ambushtile?: string,
	/** Happens at the start immediately after AI is assigned*/
	init: (enemy, player, aidata) => void,
	/** Happens before movement. Return true to skip movement loop*/
	beforemove: (enemy, player, aidata) => boolean,
	/** Whether the enemy chases the target if it sees them */
	chase: (enemy, player, aidata) => boolean,
	/** Similar to chase but not quite.
	 * Will the enemy choose to go to the last seen target location?
	 * If it sees the target
	 * Can be false if you want an enemy to be more reserved about where it goes*/
	trackvisibletarget: (enemy, player, aidata) => boolean,
	/** Whether enemy will chase the player across a long distance */
	persist: (enemy, player, aidata) => boolean,
	/** Whether the enemy moves toward gx */
	move: (enemy, player, aidata) => boolean,
	/** whether the enemy obeys commands like Follow Me and such */
	follower: (enemy, player, aidata) => boolean,
	/** Whether the enemy follows sound sources or not */
	followsound: (enemy, player, aidata) => boolean,
	/** Whether enemy will randomly wander to nearby points*/
	wander_near: (enemy, player, aidata) => boolean,
	/** Whether enemy will randomly choose points on the map to wander to */
	wander_far: (enemy, player, aidata) => boolean,
	/** Function to replace wandernear. Return true to cancel stock func, false otherwise*/
	wandernear_func?: (enemy, player, aidata) => boolean,
	/** Function to replace wanderfar. Return true to cancel stock func, false otherwise*/
	wanderfar_func?: (enemy, player, aidata) => boolean,
	/** Whether it sets gx to gxx when idle, and gy to gyy */
	resetguardposition: (enemy, player, aidata) => boolean,
	/** Whether enemy attacks */
	attack: (enemy, player, aidata) => boolean,
	/** whether enemy casts spells */
	spell: (enemy, player, aidata) => boolean,
	/** This function executes before wander location changes. Return True to override wander behavior */
	aftermove: (enemy, player, aidata) => boolean,
	/** This executes after enemy is determined to be idle or not. If true, prevents spells.*/
	afteridle?: (enemy, player, aidata) => boolean,
	/** Returns the current wander long delay.*/
	wanderDelay_long?: (enemy, aidata) => number,
	/** Returns the current wander short delay.*/
	wanderDelay_short?: (enemy, aidata) => number,

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
};

/** Container for KD AI data
 * Persistently stored as AIData variable for use in some
 */
interface KDAIData extends KDAITriggerData {
	/** The target of the AI, NOT the KinkyDungeonPlayerEntity but rather a target entity which CAN be the player */
	player?: entity,

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
	/** The enemy actually aggros the target and will cast spells */
	wantsToCast?: boolean,
	/** The enemy wants to pull the player instead of just attacking */
	wantsToLeash?: boolean,
	/** The enemy wants to leash the player, but prefers to pull instead of attack */
	focusOnLeash?: boolean,
	/** Enemy will move toward its target rather than its gx/gy position */
	moveTowardPlayer?: boolean,

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
	maintain?: (enemy: entity, delta: number, AIData?: any) => boolean,
	/** Run before the move loop */
	beforeMove?: (enemy: entity, AIData: any, delta: number) => boolean,
	/** Run before the attack loop */
	beforeAttack?: (enemy: entity, AIData: any, delta: number) => boolean,
	/** Run before the spell loop */
	beforeSpell?: (enemy: entity, AIData: any, delta: number) => boolean,
}

type KDLockType = {
	consume_key: boolean;
	lockmult: number;

	penalty?: Record<string, number>;

	pickable: boolean;
	pick_speed: number;
	pick_diff: number;
	pick_lim?: number;
	canPick: (data: any) => boolean;
	doPick: (data: any) => boolean;
	failPick: (data: any) => string;
	breakChance: (data: any) => boolean;
	unlockable: boolean;
	key: string;
	canUnlock: (data: any) => boolean;
	doUnlock: (data: any) => boolean;
	failUnlock: (data: any) => string;
	removeKeys: (data: any) => void;

	levelStart: (item) => void;
	shrineImmune: boolean;

	commandlevel: number;
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
	toy: number,
	plug: number,
	belt: number,
}

type KDMapTile = {
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
	/** This curse keeps events with the curse property from vanishing */
	activatecurse?: boolean,
	/** custom icon for removing (failure) */
	customIcon_RemoveFailure?: string,
	/** custom icon for removing (success) */
	customIcon_RemoveSuccess?: string,
	/** TODO NOT IMPLEMENTED for a future RemoveCursesWithShrine function */
	shrineRemove?: string[],
	level: number,
	weight: (item, allHex?) => number,
	customStruggle?: (item: item, Curse?: string) => void,
	customInfo?: (item: item, Curse?: string) => void,
	onApply?: (item: item, host?: item) => void,
	condition: (item: item) => boolean,
	remove: (item: item, host: item) => void, events?: KinkyDungeonEvent[]
}

type KDInventoryVariant = {
	/** The curse to apply with this inventory variant */
	curse?: string,
	/** extra events added on */
	events: KinkyDungeonEvent[],
	/** The original restraint this is based on */
	template: string,
	/** If true, this item will not be forcibly kept whenever being added or removed */
	noKeep?: boolean,
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
};
type KDEventData_PostApply = {player: entity, item: item|null, host: item, keep: boolean, Link: boolean}
type KDEventData_CurseCount = {restraints: {item: item, host: item}[], count: number, activatedOnly: boolean}

type KDExpression = {
	priority: number;
	stackable?: boolean,
	criteria: (C: any) => boolean;
	expression: (C: any) => {
		EyesPose: string,
		Eyes2Pose: string,
		BrowsPose: string,
		Brows2Pose: string,
		BlushPose: string,
		MouthPose: string,
	};
}

interface KDPresetLoadout {
	weapon_current: string,
	weapon_other: string,
	armor: string[],
}

interface KDTrainingRecord {
	turns_trained: number,
	turns_skipped: number,
	turns_total: number,
	training_points: number,
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

interface KDSpecialEnemyBuff {
	filter: (enemy: entity, type: string[]) => boolean;
	weight: (enemy: entity, type: string[]) => number;
	apply: (enemy: entity, type: string[]) => void;
}

interface KDFactionProps {
	/** Negative - will join their allies on sight against you
	 * Neutral - will only join if they see you attacking their ally or their ally is otherwise neutral with you
	 * Positive - will only join if their ally would otherwise be neutral with you
	 */
	honor: number,
	/** Honor toward specific factions */
	honor_specific: Record<string, number>,
	/** Weight to have them show up in a given floor type and floor count (and in future floor X and floor Y) */
	weight: (Floor: number, Checkpoint: string, tags: string[], X: number, Y: number) => number,
}

type KDTile = any;

type KDTrapType = (tile: KDTile, entity: entity, x: number, y: number) => {msg: string, triggered: boolean}

type KDSprites = {[_: string]: (x: number, y: number, fog: boolean, noReplace: string) => string}

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
type PIXIPlane = import('pixi.js').SimplePlane;
type PIXIBuffer = import('pixi.js').Buffer;
type IArrayBuffer = import('pixi.js').IArrayBuffer;
type PIXIArray = import('pixi.js').ITypedArray;
type PIXIAdjustmentFilter = import('pixi-filters').AdjustmentFilter;
type PIXIFilter = import('pixi.js').Filter;


