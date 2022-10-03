"use strict";

/**
 * TypedItem.js
 * ------------
 * This file contains utilities related to typed extended items (items that allow switching between a selection of
 * different states). It is generally not necessary to call functions in this file directly - these are called from
 * Asset.js when an item is first registered.
 *
 * All dialogue for typed items should be added to `Dialog_Player.csv`. To implement a typed item, you need the
 * following dialogue entries (these dialogue keys can also be configured through the item's configuration if custom
 * dialogue keys are needed):
 *  * "<GroupName><AssetName>Select" - This is the text that will be displayed at the top of the extended item screen
 *    (usually a prompt for the player to select a type)
 *  * For each type:
 *    * "<GroupName><AssetName><TypeName>" - This is the display name for the given type
 *  * If the item's chat setting is configured to `TO_ONLY`, you will need a chatroom message for each type, which will
 *    be sent when that type is selected. It should have the format "<GroupName><AssetName>Set<TypeName>" (e.g.
 *    "ItemArmsLatexBoxtieLeotardSetPolished" - "SourceCharacter polishes the latex of DestinationCharacter leotard
 *    until it's shiny")
 *  * If the item's chat setting is configured to `FROM_TO`, you will need a chatroom message for each possible type
 *    pairing, which will be sent when the item's type changes from the first type to the second type. It should have
 *    the format "<GroupName><AssetName>Set<Type1>To<Type2>".
 */

/**
 * A lookup for the typed item configurations for each registered typed item
 * @const
 * @type {Record<string, TypedItemData>}
 * @see {@link TypedItemData}
 */
const TypedItemDataLookup = {};

/**
 * An enum encapsulating the possible chatroom message settings for typed items
 * - TO_ONLY - The item has one chatroom message per type (indicating that the type has been selected)
 * - FROM_TO - The item has a chatroom message for from/to type pairing
 * - SILENT - The item doesn't publish an action when a type is selected.
 * @type {Record<"TO_ONLY"|"FROM_TO"|"SILENT", TypedItemChatSetting>}
 */
const TypedItemChatSetting = {
	TO_ONLY: "toOnly",
	FROM_TO: "fromTo",
	SILENT: "silent",
};

/**
 * Registers a typed extended item. This automatically creates the item's load, draw and click functions. It will also
 * generate the asset's AllowType array.
 * @param {Asset} asset - The asset being registered
 * @param {TypedItemConfig | undefined} config - The item's typed item configuration
 * @returns {void} - Nothing
 */
function TypedItemRegister(asset, config) {
	const data = TypedItemCreateTypedItemData(asset, config);
	TypedItemCreateLoadFunction(data);
	TypedItemCreateDrawFunction(data);
	TypedItemCreateClickFunction(data);
	TypedItemCreateExitFunction(data);
	TypedItemCreateValidateFunction(data);
	TypedItemCreatePublishFunction(data);
	TypedItemCreateNpcDialogFunction(data);
	TypedItemGenerateAllowType(data);
	TypedItemGenerateAllowEffect(data);
	TypedItemGenerateAllowBlock(data);
	TypedItemGenerateAllowTint(data);
	TypedItemGenerateAllowLockType(data);
	TypedItemRegisterSubscreens(asset, config);
}

/**
 * Generates an asset's typed item data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {TypedItemConfig} config - The item's extended item configuration
 * @returns {TypedItemData} - The generated typed item data for the asset
 */
function TypedItemCreateTypedItemData(asset,
	{ Options, Dialog, ChatTags, Dictionary, ChatSetting, DrawImages, ChangeWhenLocked, Validate, ScriptHooks }
) {
	Dialog = Dialog || {};
	const key = `${asset.Group.Name}${asset.Name}`;
	return TypedItemDataLookup[key] = {
		asset,
		options: Options,
		key,
		functionPrefix: `Inventory${key}`,
		dialog: {
			load: Dialog.Load || `${key}Select`,
			typePrefix: Dialog.TypePrefix || key,
			chatPrefix: Dialog.ChatPrefix || `${key}Set`,
			npcPrefix: Dialog.NpcPrefix || key,
		},
		chatTags: Array.isArray(ChatTags) ? ChatTags : [
			CommonChatTags.SOURCE_CHAR,
			CommonChatTags.DEST_CHAR,
		],
		scriptHooks: {
			load: ScriptHooks ? ScriptHooks.Load : undefined,
			click: ScriptHooks ? ScriptHooks.Click : undefined,
			draw: ScriptHooks ? ScriptHooks.Draw : undefined,
			exit: ScriptHooks ? ScriptHooks.Exit : undefined,
			validate: ScriptHooks ? ScriptHooks.Validate : undefined,
		},
		dictionary: Dictionary || [],
		chatSetting: ChatSetting || TypedItemChatSetting.TO_ONLY,
		drawImages: typeof DrawImages === "boolean" ? DrawImages : true,
		changeWhenLocked: typeof ChangeWhenLocked === "boolean" ? ChangeWhenLocked : true,
		validate: Validate,
	};
}

/**
 * Creates an asset's extended item load function
 * @param {TypedItemData} data - The typed item data for the asset
 * @returns {void} - Nothing
 */
function TypedItemCreateLoadFunction({ options, functionPrefix, dialog, scriptHooks }) {
	const loadFunctionName = `${functionPrefix}Load`;
	const loadFunction = function () {
		ExtendedItemLoad(options, dialog.load);
	};
	if (scriptHooks && scriptHooks.load) {
		window[loadFunctionName] = function () {
			scriptHooks.load(loadFunction);
		};
	} else window[loadFunctionName] = loadFunction;
}

/**
 * Creates an asset's extended item draw function
 * @param {TypedItemData} data - The typed item data for the asset
 * @returns {void} - Nothing
 */
function TypedItemCreateDrawFunction({ options, functionPrefix, dialog, drawImages, scriptHooks }) {
	const drawFunctionName = `${functionPrefix}Draw`;
	const drawFunction = function () {
		ExtendedItemDraw(options, dialog.typePrefix, null, drawImages);
	};
	if (scriptHooks && scriptHooks.draw) {
		window[drawFunctionName] = function () {
			scriptHooks.draw(drawFunction);
		};
	} else window[drawFunctionName] = drawFunction;
}

/**
 * Creates an asset's extended item click function
 * @param {TypedItemData} data - The typed item data for the asset
 * @returns {void} - Nothing
 */
function TypedItemCreateClickFunction({ options, functionPrefix, drawImages, scriptHooks }) {
	const clickFunctionName = `${functionPrefix}Click`;
	const clickFunction = function () {
		ExtendedItemClick(options, null, drawImages);
	};
	if (scriptHooks && scriptHooks.click) {
		window[clickFunctionName] = function () {
			scriptHooks.click(clickFunction);
		};
	} else window[clickFunctionName] = clickFunction;
}

/**
 * Creates an asset's extended item exit function
 * @param {TypedItemData} data - The typed item data for the asset
 * @returns {void} - Nothing
 */
function TypedItemCreateExitFunction({ functionPrefix, scriptHooks}) {
	const exitFunctionName = `${functionPrefix}Exit`;
	if (scriptHooks && scriptHooks.exit) {
		window[exitFunctionName] = function () {
			scriptHooks.exit();
		};
	}
}

/**
 *
 * @param {TypedItemData} data - The typed item data for the asset
 */
function TypedItemCreateValidateFunction({ changeWhenLocked, options, functionPrefix, validate, scriptHooks }) {
	const validateFunctionName = `${functionPrefix}Validate`;
	const validateFunction = function (C, item, option, currentOption) {
		let message = "";

		if (typeof validate === "function") {
			message = validate(C, item, option, currentOption);
		}

		return message;
	};
	if (scriptHooks && scriptHooks.validate) {
		window[validateFunctionName] = function (C, item, option, currentOption) {
			scriptHooks.validate(validateFunction, C, item, option, currentOption);
		};
	} else window[validateFunctionName] = validateFunction;
}

/**
 * Creates an asset's extended item chatroom message publishing function
 * @param {TypedItemData} typedItemData - The typed item data for the asset
 * @returns {void} - Nothing
 */
function TypedItemCreatePublishFunction(typedItemData) {
	const { options, functionPrefix, dialog, chatSetting } = typedItemData;
	if (chatSetting === TypedItemChatSetting.SILENT) return;
	const publishFunctionName = `${functionPrefix}PublishAction`;
	window[publishFunctionName] = function (C, newOption, previousOption) {
		/** @type ExtendedItemChatData<ExtendedItemOption> */
		const chatData = {
			C,
			previousOption,
			newOption,
			previousIndex: options.indexOf(previousOption),
			newIndex:  options.indexOf(newOption),
		};

		let msg = dialog.chatPrefix;
		if (typeof msg === "function") {
			msg = msg(chatData);
		}

		if (chatSetting === TypedItemChatSetting.FROM_TO) msg += `${previousOption.Name}To`;
		msg += newOption.Name;
	};
}

/**
 * Creates an asset's extended item NPC dialog function
 * @param {TypedItemData} data - The typed item data for the asset
 * @returns {void} - Nothing
 */
function TypedItemCreateNpcDialogFunction({ asset, functionPrefix, dialog }) {
	const npcDialogFunctionName = `${functionPrefix}NpcDialog`;
	window[npcDialogFunctionName] = function (C, option) {
	};
}

/**
 * Generates an asset's AllowType property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
function TypedItemGenerateAllowType({ asset, options }) {
	asset.AllowType = options
		.map((option) => option.Property.Type)
		.filter(Boolean);
}

/**
 * Generates an asset's AllowEffect property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
function TypedItemGenerateAllowEffect({asset, options}) {
	asset.AllowEffect = Array.isArray(asset.Effect) ? asset.Effect.slice() : [];
	for (const option of options) {
		CommonArrayConcatDedupe(asset.AllowEffect, option.Property.Effect);
	}
}

/**
 * Generates an asset's AllowBlock property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
function TypedItemGenerateAllowBlock({asset, options}) {
	asset.AllowBlock = Array.isArray(asset.Block) ? asset.Block.slice() : [];
	for (const option of options) {
		CommonArrayConcatDedupe(asset.AllowBlock, option.Property.Block);
	}
}

/**
 * Generates an asset's AllowTint property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
function TypedItemGenerateAllowTint({asset, options}) {
	if (asset.AllowTint) {
		return;
	}
	for (const option of options) {
		if (option.Property && Array.isArray(option.Property.Tint) && option.Property.Tint.length > 0) {
			asset.AllowTint = true;
			return;
		}
	}
}

/**
 * Generates an asset's AllowLockType property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
function TypedItemGenerateAllowLockType({asset, options}) {
	const allowLockType = [];
	for (const option of options) {
		const type = option.Property && option.Property.Type;
		const allowLock = typeof option.AllowLock === "boolean" ? option.AllowLock : asset.AllowLock;
		if (allowLock) {
			// "" is used to represent the null type in AllowLockType arrays
			allowLockType.push(type != null ? type : "");
		}
	}
	TypedItemSetAllowLockType(asset, allowLockType, options.length);
}

/**
 * Sets the AllowLock and AllowLockType properties on an asset based on an AllowLockType array and the total number of
 * possible types.
 * @param {Asset} asset - The asset to set properties on
 * @param {string[]} allowLockType - The AllowLockType array indicating which of the asset's types permit locks
 * @param {number} typeCount - The total number of types available on the asset
 * @returns {void} - Nothing
 */
function TypedItemSetAllowLockType(asset, allowLockType, typeCount) {
	if (allowLockType.length === 0) {
		// If no types are allowed to lock, set AllowLock to false for quick checking
		asset.AllowLock = false;
		asset.AllowLockType = null;
	} else if (allowLockType.length === typeCount) {
		// If all types are allowed to lock, set AllowLock to true for quick checking
		asset.AllowLock = true;
		asset.AllowLockType = null;
	} else {
		// If it's somewhere in between, set an explicit AllowLockType array
		asset.AllowLockType = allowLockType;
	}
}

/**
 * @param {Asset} asset - The asset whose subscreen is being registered
 * @param {TypedItemConfig} config - The parent item's typed item configuration
 */
function TypedItemRegisterSubscreens(asset, config) {
	return config.Options
		.filter(option => option.Archetype !== undefined)
		.forEach((option, i, options) => {
			switch (option.Archetype) {
				case ExtendedArchetype.VARIABLEHEIGHT:
					VariableHeightRegister(asset, /** @type {VariableHeightConfig} */(option.ArchetypeConfig), option.Property, options);
					break;
			}
		});
}

/**
 * Constructs the chat message dictionary for the typed item based on the items configuration data.
 * @param {ExtendedItemChatData<ExtendedItemOption>} ChatData - The chat data that triggered the message.
 * @param {TypedItemData} data - The typed item data for the asset
 * @returns {object[]} - The dictionary for the item based on its required chat tags
 */
function TypedItemBuildChatMessageDictionary(ChatData, { asset, chatTags, dictionary }) {
	const BuiltDictionary = chatTags
		.map((tag) => ExtendedItemMapChatTagToDictionaryEntry(ChatData.C, asset, tag))
		.filter(Boolean);

	dictionary.forEach(entry => BuiltDictionary.push(entry(ChatData)));

	return BuiltDictionary;
}

/**
 * Returns the options configuration array for a typed item
 * @param {string} groupName - The name of the asset group
 * @param {string} assetName - The name of the asset
 * @returns {ExtendedItemOption[]|null} - The options array for the item, or null if no typed item data was found
 */
function TypedItemGetOptions(groupName, assetName) {
	const data = TypedItemDataLookup[`${groupName}${assetName}`];
	return data ? data.options : null;
}

/**
 * Returns a list of typed item option names available for the given asset, or an empty array if the asset is not typed
 * @param {string} groupName - The name of the asset group
 * @param {string} assetName - The name of the asset
 * @returns {string[]} - The option names available for the asset, or an empty array if the asset is not typed or no
 * typed item data was found
 */
function TypedItemGetOptionNames(groupName, assetName) {
	const options = TypedItemGetOptions(groupName, assetName);
	return options ? options.map(option => option.Name) : [];
}

/**
 * Returns the named option configuration object for a typed item
 * @param {string} groupName - The name of the asset group
 * @param {string} assetName - The name of the asset
 * @param {string} optionName - The name of the option
 * @returns {ExtendedItemOption|null} - The named option configuration object, or null if none was found
 */
function TypedItemGetOption(groupName, assetName, optionName) {
	const options = TypedItemGetOptions(groupName, assetName);
	return options ? options.find(option => option.Name === optionName) : null;
}

/**
 * Validates a selected option. A typed item may provide a custom validation function. Returning a non-empty string from
 * the validation function indicates that the new option is not compatible with the character's current state (generally
 * due to prerequisites or other requirements).
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose options are being validated
 * @param {ExtendedItemOption|ModularItemOption} option - The new option
 * @param {ExtendedItemOption|ModularItemOption} previousOption - The previously applied option
 * @returns {string|undefined} - undefined or an empty string if the validation passes. Otherwise, returns a string
 * message informing the player of the requirements that are not met.
 */
function TypedItemValidateOption(C, item, option, previousOption) {
	const validationFunctionName = `Inventory${item.Asset.Group.Name}${item.Asset.Name}Validate`;
	let validationMessage = CommonCallFunctionByName(validationFunctionName, C, item, option, previousOption);
	if (!validationMessage || typeof validationMessage !== "string") {
		validationMessage = ExtendedItemValidate(C, item, option, previousOption);
	}
	return validationMessage;
}

/**
 * Sets a typed item's type and properties to the option whose name matches the provided option name parameter.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item|string} itemOrGroupName - The item whose type to set, or the group name for the item
 * @param {string} optionName - The name of the option to set
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @returns {string|undefined} - undefined or an empty string if the type was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
function TypedItemSetOptionByName(C, itemOrGroupName, optionName, push = false) {
	const item = typeof itemOrGroupName === "string" ? InventoryGet(C, itemOrGroupName) : itemOrGroupName;

	if (!item) return;

	const assetName = item.Asset.Name;
	const groupName = item.Asset.Group.Name;
	const warningMessage = `Cannot set option for ${groupName}:${assetName} to ${optionName}`;

	if (item.Asset.Archetype !== ExtendedArchetype.TYPED) {
		const msg = `${warningMessage}: item does not use the typed archetype`;
		console.warn(msg);
		return msg;
	}

	const options = TypedItemGetOptions(groupName, assetName);
	const option = options.find(o => o.Name === optionName);

	if (!option) {
		const msg = `${warningMessage}: option "${optionName}" does not exist`;
		console.warn(msg);
		return msg;
	}

	return TypedItemSetOption(C, item, options, option, push);
}

/**
 * Sets a typed item's type and properties to the option provided.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose type to set
 * @param {ExtendedItemOption[]} options - The typed item options for the item
 * @param {ExtendedItemOption} option - The option to set
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @returns {string|undefined} - undefined or an empty string if the type was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
function TypedItemSetOption(C, item, options, option, push = false) {
	if (!item || !options || !option) return;

	const previousProperty = item.Property || options[0].Property;
	const previousOption = TypedItemFindPreviousOption(item, options);

	const requirementMessage = TypedItemValidateOption(C, item, option, previousOption);
	if (requirementMessage) {
		return requirementMessage;
	}

	// Create a new Property object based on the previous one
	const newProperty = Object.assign({}, previousProperty);
	// Delete properties added by the previous option
	for (const key of Object.keys(previousOption.Property)) {
		delete newProperty[key];
	}
	// Clone the new properties and use them to extend the existing properties
	Object.assign(newProperty, JSON.parse(JSON.stringify(option.Property)));

	// If the item is locked, ensure it has the "Lock" effect
	if (newProperty.LockedBy && !(newProperty.Effect || []).includes("Lock")) {
		newProperty.Effect = (newProperty.Effect || []);
		newProperty.Effect.push("Lock");
	}

	item.Property = newProperty;

	if (!InventoryDoesItemAllowLock(item)) {
		// If the new type does not permit locking, remove the lock
		ValidationDeleteLock(item.Property, false);
	}

	CharacterRefresh(C, push);
}

/**
 * Finds the currently set option on the given typed item
 * @param {Item} item - The equipped item
 * @param {ExtendedItemOption[]} options - The list of available options for the item
 * @returns {ExtendedItemOption} - The option which is currently applied to the item, or the first item in the options
 * array if no type is set.
 */
function TypedItemFindPreviousOption(item, options) {
	const previousProperty = item.Property || options[0].Property;
	const previousType = previousProperty.Type;
	return options.find(o => o.Property.Type === previousType) || options[0];
}

/**
 * Sets a typed item's type to a random option, respecting prerequisites and option validation.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item|string} itemOrGroupName - The item whose type to set, or the group name for the item
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @returns {string|undefined} - undefined or an empty string if the type was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
function TypedItemSetRandomOption(C, itemOrGroupName, push = false) {
	const item = typeof itemOrGroupName === "string" ? InventoryGet(C, itemOrGroupName) : itemOrGroupName;

	if (!item || item.Asset.Archetype !== ExtendedArchetype.TYPED) {
		console.warn("Cannot set random option: item does not exist or does not use the typed archetype");
		return;
	}

	/** @type {ExtendedItemOption[]} */
	const allOptions = TypedItemGetOptions(item.Asset.Group.Name, item.Asset.Name);
	// Avoid blocked & non-random options
	const availableOptions = allOptions
		.filter(option => option.Random !== false)
		.filter(option => !InventoryBlockedOrLimited(C, item, option.Property.Type));

	/** @type {ExtendedItemOption} */
	let option;
	if (availableOptions.length === 0) {
		// If no options are available, use the null type
		option = allOptions.find(O => O.Property.Type == null);
	} else {
		option = CommonRandomItemFromList(null, availableOptions);
	}
	return TypedItemSetOption(C, item, availableOptions, option, push);
}
