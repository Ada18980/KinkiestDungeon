"use strict";

/**
 * An enum for the possible vibrator modes
 * @readonly
 * @enum {string}
 */
var VibratorMode = {
	OFF: "Off",
	LOW: "Low",
	MEDIUM: "Medium",
	HIGH: "High",
	MAXIMUM: "Maximum",
	RANDOM: "Random",
	ESCALATE: "Escalate",
	TEASE: "Tease",
	DENY: "Deny",
	EDGE: "Edge",
};

/**
 * An enum for the possible vibrator states when a vibrator is in a state machine mode
 * @type {{DEFAULT: "Default", DENY: "Deny", ORGASM: "Orgasm", REST: "Rest"}}
 */
var VibratorModeState = {
	DEFAULT: "Default",
	DENY: "Deny",
	ORGASM: "Orgasm",
	REST: "Rest",
};

/**
 * An enum for the vibrator configuration sets that a vibrator can have
 * @type {{STANDARD: "Standard", ADVANCED: "Advanced"}}
 */
var VibratorModeSet = {
	STANDARD: "Standard",
	ADVANCED: "Advanced",
};

/**
 * A record of the various available vibrator sets of vibrator modes
 *
 * Note: Those really are ExtendedItemOption, but the ability for the advanced
 *       modes to automatically chose an intensity require a type override.
 *       VibratorModeSetDynamicProperties that those dynamic properties will
 *       get turned into the appropriate type.
 *
 * @type {{
 *     Standard: ExtendedItemOption[],
 *     Advanced: (ExtendedItemOption | {
 *         Property: {
 *             Mode: VibratorMode,
 *             Intensity: number | (() => number),
 *             Effect: EffectName[] | ((Intensity: number) => EffectName[]),
 *         }
 *     })[]
 * }}
 * @constant
 */
var VibratorModeOptions = {
	[VibratorModeSet.STANDARD]: [
		{
			Name: "TurnOff",
			Property: {
				Mode: VibratorMode.OFF,
				Intensity: -1,
				Effect: ["Egged"],
			},
		},
		{
			Name: "Low",
			Property: {
				Mode: VibratorMode.LOW,
				Intensity: 0,
				Effect: ["Egged", "Vibrating"],
			},
		},
		{
			Name: "Medium",
			Property: {
				Mode: VibratorMode.MEDIUM,
				Intensity: 1,
				Effect: ["Egged", "Vibrating"],
			},
		},
		{
			Name: "High",
			Property: {
				Mode: VibratorMode.HIGH,
				Intensity: 2,
				Effect: ["Egged", "Vibrating"],
			},
		},
		{
			Name: "Maximum",
			Property: {
				Mode: VibratorMode.MAXIMUM,
				Intensity: 3,
				Effect: ["Egged", "Vibrating"],
			},
		},
	],
	[VibratorModeSet.ADVANCED]: [
		{
			Name: "Random",
			Property: {
				Mode: VibratorMode.RANDOM,
				Intensity: () => CommonRandomItemFromList(null, [-1, 0, 1, 2, 3]),
				Effect: (Intensity) => Intensity >= 0 ? ["Egged", "Vibrating"] : ["Egged"],
			},
		},
		{
			Name: "Escalate",
			Property: {
				Mode: VibratorMode.ESCALATE,
				Intensity: 0,
				Effect: ["Egged", "Vibrating"],
			},
		},
		{
			Name: "Tease",
			Property: {
				Mode: VibratorMode.TEASE,
				Intensity: () => CommonRandomItemFromList(-1, [0, 1, 2, 3]),
				Effect: ["Egged", "Vibrating"],
			},
		},
		{
			Name: "Deny",
			Property: {
				Mode: VibratorMode.DENY,
				Intensity: () => CommonRandomItemFromList(-1, [0, 1, 2, 3]),
				Effect: ["Egged", "Vibrating", "Edged"],
			},
		},
		{
			Name: "Edge",
			Property: {
				Mode: VibratorMode.EDGE,
				Intensity: CommonRandomItemFromList(null, [0, 1]),
				Effect: ["Egged", "Vibrating", "Edged"],
			},
		},
	],
};

/**
 * A lookup for the vibrator configurations for each registered vibrator item
 * @const
 * @type {Record<string, VibratingItemData>}
 */
const VibratorModeDataLookup = {};

/**
 * Registers a vibrator item. This automatically creates the item's load, draw, click and scriptDraw functions.
 * @param {Asset} asset - The asset being registered
 * @param {VibratingItemConfig | undefined} config - The item's vibrator item configuration
 * @returns {void} - Nothing
 */
function VibratorModeRegister(asset, config) {
	const data = VibratorModeCreateData(asset, {
		Options: [VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]
	});
	VibratorModeCreateLoadFunction(data);
	VibratorModeCreateDrawFunction(data);
	VibratorModeCreateClickFunction(data);
	VibratorModeCreateScriptDrawFunction(data);
	VibratorModeSetAssetProperties(data);
}

/**
 * Generates an asset's vibrating item data
 * @param {Asset} asset - The asset to generate vibrating item data for
 * @param {VibratingItemConfig} config - The item's extended item configuration
 * @returns {VibratingItemData} - The generated vibrating item data for the asset
 */
function VibratorModeCreateData(asset, {
	Options = [VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]
} = {}) {
	const key = `${asset.Group.Name}${asset.Name}`;
	return VibratorModeDataLookup[key] = {
		key,
		asset,
		options: Options,
		functionPrefix: `Inventory${key}`,
		dynamicAssetsFunctionPrefix: `Assets${key}`,
	};
}

/**
 * Creates an asset's extended item load function
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeCreateLoadFunction({ options, functionPrefix }) {
	const loadFunctionName = `${functionPrefix}Load`;
	window[loadFunctionName] = function() {
		VibratorModeLoad(options);
	};
}

/**
 * Creates an asset's extended item draw function
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeCreateDrawFunction({ options, functionPrefix }) {
	const drawFunctionName = `${functionPrefix}Draw`;
	window[drawFunctionName] = function() {
		VibratorModeDraw(options);
	};
}

/**
 * Creates an asset's extended item click function
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeCreateClickFunction({ options, functionPrefix }) {
	const clickFunctionName = `${functionPrefix}Click`;
	window[clickFunctionName] = function() {
		VibratorModeClick(options);
	};
}

/**
 * Creates an asset's dynamic script draw function
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeCreateScriptDrawFunction({ dynamicAssetsFunctionPrefix }) {
	const scriptDrawFunctionName = `${dynamicAssetsFunctionPrefix}ScriptDraw`;
	window[scriptDrawFunctionName] = VibratorModeScriptDraw;
}

/**
 * Sets asset properties common to all vibrating items
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeSetAssetProperties(data) {
	const { asset } = data;
	asset.DynamicScriptDraw = true;
	VibratorModeSetAllowEffect(data);
	VibratorModeSetEffect(data);
}

/**
 * Sets the AllowEffect property for a vibrating item
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeSetAllowEffect({asset, options}) {
	asset.AllowEffect = Array.isArray(asset.AllowEffect) ? [...asset.AllowEffect] : [];
	CommonArrayConcatDedupe(asset.AllowEffect, ["Egged", "Vibrating"]);
	if (options.includes(VibratorModeSet.ADVANCED)) {
		CommonArrayConcatDedupe(asset.AllowEffect, ["Edged"]);
	}
}

/**
 * Sets the Effect property for a vibrating item
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
function VibratorModeSetEffect({asset}) {
	asset.Effect = Array.isArray(asset.Effect) ? [...asset.Effect] : [];
	CommonArrayConcatDedupe(asset.Effect, ["Egged"]);
}

/**
 * Common load function for vibrators
 * @param {VibratorModeSet[]} [Options] - The vibrator mode sets to load the item with
 * @returns {void} - Nothing
 */
function VibratorModeLoad(Options) {
	var Property = DialogFocusItem.Property;
	if (!Property || !Property.Mode) {
		Options = (Options && Options.length) ? Options : [VibratorModeSet.STANDARD];
		var FirstOption = VibratorModeOptions[Options[0]][0] || VibratorModeOptions[VibratorModeSet.STANDARD][0];
		VibratorModeSetProperty(DialogFocusItem, FirstOption.Property);
		var C = CharacterGetCurrent();
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
	}
}

/**
 * Common draw function for vibrators
 * @param {VibratorModeSet[]} Options - The vibrator mode sets to draw for the item
 * @returns {void} - Nothing
 */
function VibratorModeDraw(Options) {
	VibratorModeDrawHeader();
	VibratorModeDrawControls(Options);
}

/**
 * Common draw function for drawing the header of the extended item menu screen for a vibrator
 * @returns {void} - Nothing
 */
function VibratorModeDrawHeader() {
	const Asset = DialogFocusItem.Asset;
	const Vibrating = DialogFocusItem.Property && DialogFocusItem.Property.Intensity != null && DialogFocusItem.Property.Intensity >= 0;
	const Locked = InventoryItemHasEffect(DialogFocusItem, "Lock", true);
	DrawAssetPreview(1387, 100, Asset, { Vibrating, Icons: Locked ? ["Locked"] : undefined });
}

/**
 * Common draw function for drawing the control sets of the extended item menu screen for a vibrator
 * @param {VibratorModeSet[]} Options - The vibrator mode sets to draw for the item
 * @param {number} [Y] - The y-coordinate at which to start drawing the controls
 * @returns {void} - Nothing
 */
function VibratorModeDrawControls(Options, Y) {
	Y = typeof Y === "number" ? Y : 450;
	let C = CharacterGetCurrent();
	Options = Options || [VibratorModeSet.STANDARD];
	var Property = DialogFocusItem.Property;
	if (Property == null) return;
	var ItemIntensity = DialogFindPlayer("Intensity" + Property.Intensity.toString()).replace("Item", DialogFocusItem.Asset.Description);
	DrawText(ItemIntensity, 1500, Y, "white", "gray");

	Options.forEach((OptionName) => {
		var OptionGroup = VibratorModeOptions[OptionName];
		OptionGroup.forEach((Option, I) => {
			var X = 1175 + (I % 3) * 225;
			if (I % 3 === 0) Y += 75;
			var Color = Property.Mode === Option.Property.Mode ? "#888" : (!(OptionName == VibratorModeSet.ADVANCED && C.ArousalSettings && C.ArousalSettings.DisableAdvancedVibes) ? "White" : "Pink");
			DrawButton(X, Y, 200, 55, DialogFindPlayer(Option.Name), Color);
		});
		Y += 40;
	});
}

/**
 * Common click function for vibrators
 * @param {VibratorModeSet[]} Options - The vibrator mode sets for the item
 * @param {number} [Y] - The y-coordinate at which the extended item controls were drawn
 * @returns {void} - Nothing
 */
function VibratorModeClick(Options, Y) {
	Y = typeof Y === "number" ? Y : 450;
	let C = CharacterGetCurrent();
	// Exit Button
	if (MouseIn(1885, 25, 90, 85)) DialogFocusItem = null;

	Options.some((OptionName) => {
		var OptionGroup = VibratorModeOptions[OptionName];
		var Handled = OptionGroup.some((Option, I) => {
			var X = 1175 + (I % 3) * 225;
			if (I % 3 === 0) Y += 75;
			if (MouseIn(X, Y, 200, 55)) {
				if ((Option.Property != null) && (DialogFocusItem.Property != null) && (Option.Property.Mode !== DialogFocusItem.Property.Mode) && !(OptionName == VibratorModeSet.ADVANCED && C.ArousalSettings && C.ArousalSettings.DisableAdvancedVibes))
					VibratorModeSetMode(Option);
				return true;
			}
		});
		Y += 40;
		return Handled;
	});
}

/**
 * Gets a vibrator mode from VibratorModeOptions
 * @param {VibratorMode} ModeName - The name of the mode from VibratorMode, e.g. VibratorMode.OFF
 * @returns {ExtendedItemOption} - The option gotten
 */
function VibratorModeGetOption(ModeName) {
	var result = null;

	[VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED].some((OptionName) => {
		var OptionGroup = VibratorModeOptions[OptionName];
		var Handled = OptionGroup.some((Option, I) => {
			if ((Option.Property != null) && (Option.Property.Mode == ModeName)) {
				result = Option;
				return true;
			}
			return false;
		});
		return Handled;
	});

	if (result) return result;
	return VibratorModeOptions.Standard[0];

}



/**
 * Sets a new mode for a vibrating item and publishes a corresponding chatroom message
 * @param {ExtendedItemOption} Option - The extended item option defining the new mode to be set
 * @returns {void} - Nothing
 */
function VibratorModeSetMode(Option) {
	var C = CharacterGetCurrent();
	DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
	var OldIntensity = DialogFocusItem.Property.Intensity;
	VibratorModeSetProperty(DialogFocusItem, Option.Property);
	CharacterRefresh(C);
	ChatRoomCharacterItemUpdate(C, C.FocusGroup.Name);

	var Message;
	/** @type {ChatMessageDictionary} */
	var Dictionary = [
		{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "AssetName", AssetName: DialogFocusItem.Asset.Name },
	];

	if (DialogFocusItem.Property.Intensity !== OldIntensity) {
		var Direction = DialogFocusItem.Property.Intensity > OldIntensity ? "Increase" : "Decrease";
		Message = "Vibe" + Direction + "To" + DialogFocusItem.Property.Intensity;
	} else {
		Message = "VibeModeChange";
		Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
	}

	ChatRoomPublishCustomAction(Message, false, Dictionary);
}



/**
 * Helper function to set dynamic properties on an item
 * @param {object} Property - The Property object to initialise
 * @returns {void} - Nothing
 */
function VibratorModeSetDynamicProperties(Property) {
	const NewProperty = Object.assign({}, Property);
	if (typeof NewProperty.Intensity === "function") NewProperty.Intensity = NewProperty.Intensity();
	if (typeof NewProperty.Effect === "function") NewProperty.Effect = NewProperty.Effect(NewProperty.Intensity);
	else NewProperty.Effect = JSON.parse(JSON.stringify(Property.Effect || []));
	return NewProperty;
}

/**
 * Common dynamic script draw function for vibrators. This function is called every frame. TO make use of dynamic script draw on vibrators,
 * ensure your item has a `Assets<AssetGroup><AssetName>ScriptDraw` function defined that calls this function, and that your asset
 * definition in Female3DCG.js has `DynamicScriptDraw: true` set. See the Heart Piercings for examples.
 * @type {DynamicScriptDrawCallback}
 */
function VibratorModeScriptDraw(Data) {
	var C = Data.C;
	// Only run vibrator updates on the player and NPCs
	if (C.ID !== 0 && C.MemberNumber !== null) return;

	var Item = Data.Item;
	// No need to update the vibrator if it has no mode
	if (!Item.Property || !Item.Property.Mode) return;

	var PersistentData = Data.PersistentData();
	var ModeChanged = Item.Property.Mode !== PersistentData.Mode;
	if (ModeChanged || typeof PersistentData.ChangeTime !== "number") PersistentData.ChangeTime = CommonTime() + 60000;
	if (ModeChanged || typeof PersistentData.LastChange !== "number") PersistentData.LastChange = CommonTime();
	if (ModeChanged) PersistentData.Mode = Item.Property.Mode;

	if (CommonTime() > PersistentData.ChangeTime) {
		CommonCallFunctionByName("VibratorModeUpdate" + Item.Property.Mode, Item, C, PersistentData);
		PersistentData.Mode = Item.Property.Mode;
	}
}

/**
 * Vibrator update function for the Random mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {object} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
function VibratorModeUpdateRandom(Item, C, PersistentData) {
	var OneMinute = 60000;
	var OldIntensity = Item.Property.Intensity;
	var Intensity = CommonRandomItemFromList(OldIntensity, [-1, 0, 1, 2, 3]);
	var Effect = Intensity === -1 ? ["Egged"] : ["Egged", "Vibrating"];
	VibratorModeSetProperty(Item, { Intensity, Effect });
	// Next update in 1-3 minutes
	PersistentData.ChangeTime = Math.floor(CommonTime() + OneMinute + Math.random() * 2 * OneMinute);
	VibratorModePublish(C, Item, OldIntensity, Intensity);
}

/**
 * Vibrator update function for the Escalate mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {object} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
function VibratorModeUpdateEscalate(Item, C, PersistentData) {
	var OldIntensity = Item.Property.Intensity;
	var Intensity = (OldIntensity + 1) % 4;
	// As intensity increases, time between updates decreases
	var TimeFactor = Math.pow((5 - Intensity), 1.8);
	var TimeToNextUpdate = (8000 + Math.random() * 4000) * TimeFactor;
	VibratorModeSetProperty(Item, { Intensity, Effect: ["Egged", "Vibrating"] });
	PersistentData.ChangeTime = Math.floor(CommonTime() + TimeToNextUpdate);
	VibratorModePublish(C, Item, OldIntensity, Intensity);
}

/**
 * Vibrator update function for the Tease mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {object} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
function VibratorModeUpdateTease(Item, C, PersistentData) {
	// Tease mode allows orgasm and denial states once arousal gets high enough
	VibratorModeUpdateStateBased(Item, C, PersistentData, [VibratorModeState.DENY, VibratorModeState.ORGASM]);
}

/**
 * Vibrator update function for the Deny mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {object} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
function VibratorModeUpdateDeny(Item, C, PersistentData) {
	// Deny mode only allows the denial state on high arousal
	VibratorModeUpdateStateBased(Item, C, PersistentData, [VibratorModeState.DENY]);
}

/**
 * Vibrator update function for the Edge mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {object} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
function VibratorModeUpdateEdge(Item, C, PersistentData) {
	var OneMinute = 60000;
	var OldIntensity = Item.Property.Intensity;
	var Intensity = Math.min(Item.Property.Intensity + 1, 3);
	VibratorModeSetProperty(Item, { Intensity, Effect: ["Egged", "Vibrating", "Edged"] });
	if (Intensity === 3) {
		// If we've hit max intensity, no more changes needed
		PersistentData.ChangeTime = Infinity;
	} else {
		// Next update 1-2 minutes from now
		PersistentData.ChangeTime = Math.floor(CommonTime() + OneMinute + Math.random() * OneMinute);
	}
	VibratorModePublish(C, Item, OldIntensity, Intensity);
}

/**
 * Vibrator update function for vibrator state machine modes
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {object} PersistentData - Persistent animation data for the item
 * @param {VibratorModeState[]} TransitionsFromDefault - The possible vibrator states that may be transitioned to from
 * the default state
 * @returns {void} - Nothing
 */
function VibratorModeUpdateStateBased(Item, C, PersistentData, TransitionsFromDefault) {
	var Arousal = C.ArousalSettings.Progress;
	var TimeSinceLastChange = CommonTime() - PersistentData.LastChange;
	var OldState = Item.Property.State || VibratorModeState.DEFAULT;
	var OldIntensity = Item.Property.Intensity;

	var NewStateAndIntensity = CommonCallFunctionByName(
		"VibratorModeStateUpdate" + OldState,
		C,
		Arousal,
		TimeSinceLastChange,
		OldIntensity,
		TransitionsFromDefault
	);
	var State = NewStateAndIntensity.State;
	var Intensity = NewStateAndIntensity.Intensity;

	if (!State) State = VibratorModeState.DEFAULT;
	if (typeof Intensity !== "number" || Intensity < -1 || Intensity > 3) Intensity = OldIntensity;

	var Effect = ["Egged"];
	if (State === VibratorModeState.DENY || Item.Property.Mode === VibratorMode.DENY) Effect.push("Edged");
	if (Intensity !== -1) Effect.push("Vibrating");

	VibratorModeSetProperty(Item, { State, Intensity, Effect });
	Object.assign(PersistentData, {
		ChangeTime: CommonTime() + 5000,
		LastChange: Intensity !== OldIntensity ? CommonTime() : PersistentData.LastChange,
	});

	VibratorModePublish(C, Item, OldIntensity, Intensity);
}

/**
 * Vibrator update function for vibrator state machine modes in the Default state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * @param {VibratorModeState[]} TransitionsFromDefault - The possible vibrator states that may be transitioned to from
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
function VibratorModeStateUpdateDefault(C, Arousal, TimeSinceLastChange, OldIntensity, TransitionsFromDefault) {
	var OneMinute = 60000;
	/** @type {VibratorModeState} */
	var State = VibratorModeState.DEFAULT;
	var Intensity = OldIntensity;
	// If arousal is high, decide whether to deny or orgasm, based on provided transitions
	if (Arousal > 90) State = CommonRandomItemFromList(VibratorModeState.DEFAULT, TransitionsFromDefault);
	// If it's been at least a minute since the last intensity change, there's a small chance to change intensity
	if (TimeSinceLastChange > OneMinute && Math.random() < 0.1) Intensity = CommonRandomItemFromList(OldIntensity, [0, 1, 2, 3]);
	return { State, Intensity };
}

/**
 * Vibrator update function for vibrator state machine modes in the Deny state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
function VibratorModeStateUpdateDeny(C, Arousal, TimeSinceLastChange, OldIntensity) {
	var OneMinute = 60000;
	/** @type {VibratorModeState} */
	var State = VibratorModeState.DENY;
	var Intensity = OldIntensity;
	if (Arousal >= 95 && TimeSinceLastChange > OneMinute && Math.random() < 0.2) {
		if (Player.IsEdged()) {
			// In deny mode, there's a small chance to change to give a fake orgasm and then go to rest mode after a minute
			// Here we give the fake orgasm, passing a special parameter that indicates we bypass the usual restriction on Edge
			ActivityOrgasmPrepare(C, true);
		}

		// Set the vibrator to rest
		State = VibratorModeState.REST;
		Intensity = -1;
	} else if (Arousal >= 95) {
		// If arousal is too high, change intensity back down to tease
		Intensity = 0;
	} else if (TimeSinceLastChange > OneMinute && Math.random() < 0.1) {
		// Otherwise, there's a small chance to change intensity if it's been more than a minute since the last change
		Intensity = CommonRandomItemFromList(OldIntensity, [0, 1, 2, 3]);
	}
	return { State, Intensity };
}

/**
 * Vibrator update function for vibrator state machine modes in the Orgasm state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
function VibratorModeStateUpdateOrgasm(C, Arousal, TimeSinceLastChange, OldIntensity) {
	var OneMinute = 60000;
	/** @type {VibratorModeState} */
	var State = VibratorModeState.ORGASM;
	var Intensity = OldIntensity;
	if (C.ArousalSettings.OrgasmStage > 0) {
		// If we're in orgasm mode and the player is either resisting or mid-orgasm, change back to either rest or default mode
		State = Math.random() < 0.75 ? VibratorModeState.REST : VibratorModeState.DEFAULT;
	} else if (TimeSinceLastChange > OneMinute && Math.random() < 0.1) {
		// Otherwise, if it's been over a minute since the last intensity change, there's a small chance to change intensity
		Intensity = CommonRandomItemFromList(OldIntensity, [0, 1, 2, 3]);
	}
	return { State, Intensity };
}

/**
 * Vibrator update function for vibrator state machine modes in the Rest state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
function VibratorModeStateUpdateRest(C, Arousal, TimeSinceLastChange, OldIntensity) {
	var FiveMinutes = 5 * 60000;
	var TenMinutes = 10 * 60000;
	/** @type {VibratorModeState} */
	var State = VibratorModeState.REST;
	/** @type {VibratorIntensity} */
	var Intensity = -1;
	if (TimeSinceLastChange > FiveMinutes && Math.random() < Math.pow((TimeSinceLastChange - FiveMinutes) / TenMinutes, 2)) {
		// Rest between 5 and 15 minutes (probably of change gets increasingly more likely as time approaches 15 minutes)
		State = VibratorModeState.DEFAULT;
		Intensity = CommonRandomItemFromList(OldIntensity, [0, 1, 2, 3]);
	}
	return { State, Intensity };
}

/**
 * Correctly sets the Property on a vibrator according to the new property. This function preserves persistent effects on the item like lock
 * effects.
 * @param {Item} Item - The item on which to set the new properties
 * @param {object} Property - The new properties to set. The Property object may include dynamic setter functions
 * @returns {void} - Nothing
 */
function VibratorModeSetProperty(Item, Property) {
	Property = VibratorModeSetDynamicProperties(Property);
	if (Item.Property && Array.isArray(Item.Property.Effect)) {
		Item.Property.Effect.forEach(Effect => {
			if (!["Egged", "Vibrating", "Edged"].includes(Effect)) {
				Property.Effect.push(Effect);
			}
		});
	}
	Item.Property = Object.assign({}, Item.Property, Property);
}

/**
 * Publishes a chatroom message for an automatic change in vibrator intensity. Does nothing if the vibrator's intensity
 * did not change.
 * @param {Character} C - The character that the vibrator is equipped on
 * @param {Item} Item - The vibrator item
 * @param {number} OldIntensity - The previous intensity of the vibrator
 * @param {number} Intensity - The new intensity of the vibrator
 * @returns {void} - Nothing
 */
function VibratorModePublish(C, Item, OldIntensity, Intensity) {
	// If the intensity hasn't changed, don't publish a chat message
	if (OldIntensity === Intensity) return;

	var Direction = Intensity > OldIntensity ? "Increase" : "Decrease";
	/** @type {ChatMessageDictionary} */
	var Dictionary = [
		{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "AssetName", AssetName: Item.Asset.Name },
		{ Automatic: true },
	];
	if (Item.Property.ItemMemberNumber) Dictionary.push({ Tag: "ItemMemberNumber", MemberNumber: Item.Property.ItemMemberNumber });
	if (CurrentScreen == "ChatRoom") {
		ServerSend("ChatRoomChat", { Content: "Vibe" + Direction + "To" + Intensity, Type: "Action", Dictionary });
		CharacterLoadEffect(C);
		ChatRoomCharacterItemUpdate(C, Item.Asset.Group.Name);
		ActivityChatRoomArousalSync(C);
	}
}
