"use strict";

/**
 * ModularItem.js
 * --------------
 * This file contains utilities related to modular extended items (for example the High Security Straitjacket). It is
 * generally not necessary to call functions in this file directly - these are called from Asset.js when an item is
 * first registered.
 *
 * A modular item is a typed item, but each type may be comprised of several independent "modules". For example, the
 * High Security Straitjacket has 3 different modules: crotch panel (c), arms (a), and crotch straps (s), and each
 * module can be configured independently. The resulting type then uses an abbreviated format which represents the
 * module values comprising that type. Each module contains a number of options that may be chosen for that module.
 *
 * For example "c0a1s2" - represents the type where the crotch panel module uses option 0, the arms module uses option
 * 1, and the crotch straps module uses option 2. The properties of the type will be derived from a combination of the
 * properties of each of the type's module options. For example, difficulty will be calculated by summing up the
 * difficulties for each of its module options.
 *
 * All dialogue for modular items should be added to `Dialog_Player.csv`. To implement a modular item, you need the
 * following dialogue entries:
 * * "<GroupName><AssetName>SelectBase" - This is the text that will be displayed on the module selection screen (e.g.
 *   `ItemArmsHighSecurityStraitJacketSelectBase` - "Configure Straitjacket")
 * * For each module:
 *   * "<GroupName><AssetName>Select<ModuleName>" - This is the text that will be displayed on the module's subscreen
 *     (e.g. `ItemArmsHighSecurityStraitJacketSelectCrotch` - "Configure crotch panel")
 *   * "<GroupName><AssetName>Module<ModuleName>" - This is the text that will be used to describe the module (under
 *     the module's button) in the module selection screen (e.g. `ItemArmsHighSecurityStraitJacketModuleCrotch` -
 *     "Crotch Panel")
 * * For each option:
 *   * "<GroupName><AssetName>Option<ModuleKey><OptionNumber>" - This is the text that will be used to describe the
 *     option (under the option's button) in the module subscreen for the module containing that option (e.g.
 *     `ItemArmsHighSecurityStraitJacketOptionc0` - "No crotch panel")
 * * If the item's chat setting is configured to `PER_MODULE`, you will need a chatroom message for each module,
 *   which will be sent when that module changes. It should have the format "<GroupName><AssetName>Set<ModuleName>"
 *   (e.g. `ItemArmsHighSecurityStraitJacketSetCrotch` - "SourceCharacter changed the crotch panel on
 *   DestinationCharacter straitjacket")
 * * If the item's chat setting is configured to `PER_OPTION`, you will need a chatroom message for each option, which
 *   will be sent when that option is selected. It should have the format
 *   "<GroupName><AssetName>Set<ModuleKey><OptionNumber>" (e.g. `ItemArmsHighSecurityStraitJacketSetc0` -
 *   "SourceCharacter removes the crotch panel from DestinationCharacter straitjacket")
 */

/**
 * The keyword used for the base menu on modular items
 * @const {string}
 */
const ModularItemBase = "Base";

/**
 * A lookup for the modular item configurations for each registered modular item
 * @const
 * @type {Record<string, ModularItemData>}
 * @see {@link ModularItemData}
 */
const ModularItemDataLookup = {};

/**
 * An enum encapsulating the possible chatroom message settings for modular items
 * - PER_MODULE - The item has one chatroom message per module (messages for individual options within a module are all
 * the same)
 * - PER_OPTION - The item has one chatroom message per option (for finer granularity - each individual option within a
 * module can have its own chatroom message)
 * @type {Record<"PER_MODULE"|"PER_OPTION", ModularItemChatSetting>}
 */
const ModularItemChatSetting = {
	PER_MODULE: "perModule",
	PER_OPTION: "perOption",
};

/**
 * How many modules/options to show per page of the modular item screen
 * @const {number}
 */
const ModularItemsPerPage = 8;

/** Memoized requirements check function */
const ModularItemRequirementCheckMessageMemo = CommonMemoize(ModularItemRequirementMessageCheck);

/**
 * Registers a modular extended item. This automatically creates the item's load, draw and click functions. It will
 * also generate the asset's AllowType array, as AllowType arrays on modular items can get long due to the
 * multiplicative nature of the item's types, and also converts the AllowModuleTypes property on any asset layers into
 * an AllowTypes property, if present.
 * @param {Asset} asset - The asset being registered
 * @param {ModularItemConfig | undefined} config - The item's modular item configuration
 * @returns {void} - Nothing
 */
function ModularItemRegister(asset, config) {
	const data = ModularItemCreateModularData(asset, config);
	ModularItemCreateLoadFunction(data);
	ModularItemCreateDrawFunction(data);
	ModularItemCreateClickFunction(data);
	ModularItemCreateExitFunction(data);
	//ModularItemGenerateValidationProperties(data);
}

/**
 * Creates an asset's extended item load function
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateLoadFunction(data) {
	const loadFunctionName = `${data.functionPrefix}Load`;
	const loadFunction = function () {
		if (!DialogFocusItem.Property) {
			const C = CharacterGetCurrent();
			const currentModuleValues = ModularItemParseCurrent(data);
			DialogFocusItem.Property = ModularItemMergeModuleValues(data, currentModuleValues);
			CharacterRefresh(C);
		}
	};
	if (data.scriptHooks && data.scriptHooks.load) {
		window[loadFunctionName] = function () {
			data.scriptHooks.load(loadFunction);
		};
	} else window[loadFunctionName] = loadFunction;
}

/**
 * Creates an asset's extended item draw function
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateDrawFunction(data) {
	const drawFunctionName = `${data.functionPrefix}Draw`;
	const drawFunction = function () {
		const currentModule = data.currentModule || ModularItemBase;
		const drawFunction = data.drawFunctions[currentModule];
		return drawFunction();
	};
	if (data.scriptHooks && data.scriptHooks.draw) {
		window[drawFunctionName] = function () {
			data.scriptHooks.draw(drawFunction);
		};
	} else window[drawFunctionName] = drawFunction;
}

/**
 * Creates an asset's extended item click function
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateClickFunction(data) {
	const clickFunctionName = `${data.functionPrefix}Click`;
	const clickFunction = function () {
		const currentModule = data.currentModule || ModularItemBase;
		const clickFunction = data.clickFunctions[currentModule];
		return clickFunction();
	};
	if (data.scriptHooks && data.scriptHooks.click) {
		window[clickFunctionName] = function () {
			data.scriptHooks.click(clickFunction);
		};
	} else window[clickFunctionName] = clickFunction;
}

/**
 * Creates an asset's extended item exit function
 * @param {ModularItemData} data - The typed item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateExitFunction(data) {
	const exitFunctionName = `${data.functionPrefix}Exit`;
	if (data.scriptHooks && data.scriptHooks.exit) {
		window[exitFunctionName] = function () {
			data.scriptHooks.exit();
		};
	}
}

/**
 * Generates an asset's modular item data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {ModularItemConfig} config - The item's extended item configuration
 * @returns {ModularItemData} - The generated modular item data for the asset
 */
function ModularItemCreateModularData(asset,
	{ Modules, ChatSetting, ChatTags, ChangeWhenLocked, Dialog, ScriptHooks }) {
	const key = `${asset.Group.Name}${asset.Name}`;
	Dialog = Dialog || {};
	/** @type {ModularItemData} */
	const data = ModularItemDataLookup[key] = {
		asset,
		chatSetting: ChatSetting || ModularItemChatSetting.PER_OPTION,
		key,
		typeCount: 1,
		functionPrefix: `Inventory${key}`,
		dialogSelectPrefix: Dialog.Select || `${key}Select`,
		dialogModulePrefix: Dialog.ModulePrefix || `${key}Module`,
		dialogOptionPrefix: Dialog.OptionPrefix || `${key}Option`,
		chatMessagePrefix: Dialog.ChatPrefix || `${key}Set`,
		chatTags: Array.isArray(ChatTags) ? ChatTags : [
			CommonChatTags.SOURCE_CHAR,
			CommonChatTags.DEST_CHAR,
		],
		modules: Modules,
		currentModule: ModularItemBase,
		pages: { [ModularItemBase]: 0 },
		drawData: { [ModularItemBase]: ModularItemCreateDrawData(Modules.length) },
		changeWhenLocked: typeof ChangeWhenLocked === "boolean" ? ChangeWhenLocked : true,
		scriptHooks: {
			load: ScriptHooks ? ScriptHooks.Load : undefined,
			click: ScriptHooks ? ScriptHooks.Click : undefined,
			draw: ScriptHooks ? ScriptHooks.Draw : undefined,
			exit: ScriptHooks ? ScriptHooks.Exit : undefined,
		},
		drawFunctions: {},
		clickFunctions: {},
	};
	data.drawFunctions[ModularItemBase] = ModularItemCreateDrawBaseFunction(data);
	data.clickFunctions[ModularItemBase] = ModularItemCreateClickBaseFunction(data);
	for (const module of Modules) {
		data.pages[module.Name] = 0;
		data.drawData[module.Name] = ModularItemCreateDrawData(module.Options.length);
		data.drawFunctions[module.Name] = () => ModularItemDrawModule(module, data);
		data.clickFunctions[module.Name] = () => ModularItemClickModule(module, data);
		data.typeCount *= module.Options.length;
	}
	return data;
}

/**
 * Generates drawing data for a given module. This includes button positions, whether pagination is necessary, and the
 * total page count for that module.
 * @param {number} itemCount - The number of items in the module
 * @returns {{pageCount: number, paginate: boolean, positions: number[][]}} - An object containing required drawing for
 * a module with the given item count.
 */
function ModularItemCreateDrawData(itemCount) {
	const positions = [];
	const left = 1000;
	const width = 1000;
	const buttonWidth = 225;
	const rows = itemCount > ModularItemsPerPage / 2 ? 2 : 1;
	const columns = Math.min(ModularItemsPerPage / 2, Math.ceil(itemCount / rows));
	const top = rows === 1 ? 500 : 400;
	const xPadding = Math.floor((width - columns * buttonWidth) / (columns + 1));
	const xSpacing = buttonWidth + xPadding;
	const ySpacing = 300;

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			positions.push([
				left + xPadding + j * xSpacing,
				top + i * ySpacing,
			]);
		}
	}

	const paginate = itemCount > ModularItemsPerPage;
	const pageCount = Math.ceil(itemCount / ModularItemsPerPage);

	return { paginate, pageCount, positions };
}

/**
 * Creates a modular item's base draw function (for the module selection screen)
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {() => void} - The modular item's base draw function
 */
function ModularItemCreateDrawBaseFunction(data) {
	return () => {
		const currentModuleValues = ModularItemParseCurrent(data);
		const buttonDefinitions = data.modules.map((module, i) => (
			/** @type ModularItemButtonDefinition */([
				`${AssetGetInventoryPath(data.asset)}/${module.Key}${currentModuleValues[i]}.png`,
				`${data.dialogModulePrefix}${module.Name}`,
				CharacterGetCurrent().ID === 0 && module.AllowSelfSelect === false ? "pink" : "white",
			])
		));
		return ModularItemDrawCommon(ModularItemBase, buttonDefinitions, data);
	};
}

/**
 * Maps a modular item option to a button definition for rendering the option's button.
 * @param {ModularItemOption} option - The option to draw a button for
 * @param {number} optionIndex - The option's index within its parent module
 * @param {ModularItemModule} module - A reference to the option's parent module
 * @param {ModularItemData} data - The modular item's data
 * @param {number} currentOptionIndex - The currently selected option index for the module
 * @returns {ModularItemButtonDefinition} - A button definition array representing the provided option
 */
function ModularItemMapOptionToButtonDefinition(option, optionIndex, module,
	{ asset, dialogOptionPrefix, changeWhenLocked }, currentOptionIndex) {
	const optionName = `${module.Key}${optionIndex}`;
	let color = "#fff";
	const currentOption = module.Options[currentOptionIndex];
	if (currentOptionIndex === optionIndex) color = "#888";
	else if (ModularItemRequirementCheckMessageMemo(option, currentOption, changeWhenLocked)) color = "pink";
	return [
		`${AssetGetInventoryPath(asset)}/${optionName}.png`,
		`${dialogOptionPrefix}${optionName}`,
		color,
	];
}

/**
 * Draws a module screen from the provided button definitions and modular item data.
 * @param {string} moduleName - The name of the module whose page is being drawn
 * @param {ModularItemButtonDefinition[]} buttonDefinitions - A list of button definitions to draw
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemDrawCommon(moduleName, buttonDefinitions, { asset, pages, drawData }) {

}

/**
 * Draws the extended item screen for a given module.
 * @param {ModularItemModule} module - The module whose screen to draw
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemDrawModule(module, data) {
	const moduleIndex = data.modules.indexOf(module);
	const currentValues = ModularItemParseCurrent(data);
	const buttonDefinitions = module.Options.map(
		(option, i) => ModularItemMapOptionToButtonDefinition(option, i, module, data, currentValues[moduleIndex]));
	ModularItemDrawCommon(module.Name, buttonDefinitions, data);
}

/**
 * Generates a click function for a modular item's module selection screen
 * @param {ModularItemData} data - The modular item's data
 * @returns {function(): void} - A click handler for the modular item's module selection screen
 */
function ModularItemCreateClickBaseFunction(data) {
	const { paginate, pageCount, positions } = data.drawData[ModularItemBase];
	return () => {
		ModularItemClickCommon(
			{ paginate, positions },
			() => {
				ModularItemRequirementCheckMessageMemo.clearCache();
				DialogFocusItem = null;
			},
			i => {
				const pageNumber = Math.min(pageCount - 1, data.pages[ModularItemBase] || 0);
				const pageStart = pageNumber * ModularItemsPerPage;
				const page = data.modules.slice(pageStart, pageStart + ModularItemsPerPage);
				const module = page[i];
				if (module) {
					if (CharacterGetCurrent().ID === 0 && module.AllowSelfSelect === false) {
						return;
					}
					ModularItemModuleTransition(module.Name, data);
				}
			},
			(delta) => ModularItemChangePage(ModularItemBase, delta, data)
		);
	};
}

/**
 * A generic click handler for a module's screen
 * @param {ModularItemModule} module - The module whose screen we are currently in
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemClickModule(module, data) {
	const { paginate, pageCount, positions } = data.drawData[module.Name];
	ModularItemClickCommon(
		{ paginate, positions },
		() => ModularItemModuleTransition(ModularItemBase, data),
		i => {
			const pageNumber = Math.min(pageCount - 1, data.pages[module.Name] || 0);
			const pageStart = pageNumber * ModularItemsPerPage;
			const page = module.Options.slice(pageStart, pageStart + ModularItemsPerPage);
			const selected = page[i];
			if (selected) ModularItemSetType(module, pageStart + i, data);
		},
		(delta) => ModularItemChangePage(module.Name, delta, data)
	);
}

/**
 * A common click handler for modular item screens. Note that pagination is not currently handled, but will be added
 * in the future.
 * @param {object} drawData
 * @param {boolean} drawData.paginate - Whether or not the current screen needs pagination handling
 * @param {number[][]} drawData.positions - The button positions to handle clicks for
 * @param {function(): void} exitCallback - A callback to be called when the exit button has been clicked
 * @param {function(number): void} itemCallback - A callback to be called when an item has been clicked
 * @param {function(number): void} paginateCallback - A callback to be called when a pagination button has been clicked
 * @returns {void} - Nothing
 */
function ModularItemClickCommon({ paginate, positions }, exitCallback, itemCallback, paginateCallback) {
	if (ExtendedItemSubscreen) {
		CommonCallFunctionByNameWarn(ExtendedItemFunctionPrefix() + ExtendedItemSubscreen + "Click");
		return;
	}

	// Exit button
	if (MouseIn(1885, 25, 90, 90)) {
		return exitCallback();
	} else if (paginate) {
		if (MouseIn(1665, 240, 90, 90)) return paginateCallback(-1);
		else if (MouseIn(1775, 240, 90, 90)) return paginateCallback(1);
	}

	positions.some((p, i) => {
		if (MouseIn(p[0], p[1], 225, 275)) {
			itemCallback(i);
			return true;
		}
	});
}

/**
 * Handles page changing for modules
 * @param {string} moduleName - The name of the module whose page should be modified
 * @param {number} delta - The page delta to apply to the module's current page
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemChangePage(moduleName, delta, data) {
	const { pageCount } = data.drawData[moduleName];
	const currentPage = data.pages[moduleName];
	data.pages[moduleName] = (currentPage + pageCount + delta) % pageCount;
}

/**
 * Transitions between pages within a modular item's extended item menu
 * @param {string} newModule - The name of the new module to transition to
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemModuleTransition(newModule, data) {
	data.currentModule = newModule;
}

/**
 * Parses the focus item's current type into an array representing the currently selected module options
 * @param {ModularItemData} data - The modular item's data
 * @returns {number[]} - An array of numbers representing the currently selected options for each of the item's modules
 */
function ModularItemParseCurrent({ asset, modules }) {
	const type = (DialogFocusItem.Property && DialogFocusItem.Property.Type) || ModularItemConstructType(modules);
	return modules.map(module => {
		const index = type.indexOf(module.Key);
		if (index !== -1) {
			const match = type.substring(index + module.Key.length).match(/^\d+/);
			if (match) {
				return Number(match[0]);
			}
		}
		console.warn(`[${asset.Group.Name}:${asset.Name}] Module ${module.Key} not found in type "${type}"`);
		return 0;
	});
}

/**
 * Merges all of the selected module options for a modular item into a single Property object to set on the item
 * @param {ModularItemData} data - The modular item's data
 * @param {number[]} moduleValues - The numeric values representing the current options for each module
 * @returns {ItemProperties} - A property object created from combining each module of the modular item
 */
function ModularItemMergeModuleValues({ asset, modules }, moduleValues) {
	const options = modules.map((module, i) => module.Options[moduleValues[i] || 0]);
	return options.reduce((mergedProperty, { Property }) => {
		Property = Property || {};
		mergedProperty.Difficulty += (Property.Difficulty || 0);
		if (Property.CustomBlindBackground) mergedProperty.CustomBlindBackground = Property.CustomBlindBackground;
		if (Property.Block) CommonArrayConcatDedupe(mergedProperty.Block, Property.Block);
		if (Property.Effect) CommonArrayConcatDedupe(mergedProperty.Effect, Property.Effect);
		if (Property.Hide) CommonArrayConcatDedupe(mergedProperty.Hide, Property.Hide);
		if (Property.HideItem) CommonArrayConcatDedupe(mergedProperty.HideItem, Property.HideItem);
		if (Property.SetPose) mergedProperty.SetPose = CommonArrayConcatDedupe(mergedProperty.SetPose || [], Property.SetPose);
		if (Property.AllowActivity) CommonArrayConcatDedupe(mergedProperty.AllowActivity, Property.AllowActivity);
		if (Property.Attribute) CommonArrayConcatDedupe(mergedProperty.Attribute, Property.Attribute);
		if (typeof Property.OverridePriority === "number") mergedProperty.OverridePriority = Property.OverridePriority;
		if (typeof Property.HeightModifier === "number") mergedProperty.HeightModifier = (mergedProperty.HeightModifier || 0) + Property.HeightModifier;
		if (Property.OverrideHeight) mergedProperty.OverrideHeight = ModularItemMergeOverrideHeight(mergedProperty.OverrideHeight, Property.OverrideHeight);
		if (asset.AllowTint && Property.Tint) mergedProperty.Tint = CommonArrayConcatDedupe(mergedProperty.Tint, Property.Tint);
		return mergedProperty;
	}, /** @type ItemProperties */({
		Type: ModularItemConstructType(modules, moduleValues),
		Difficulty: 0,
		CustomBlindBackground: asset.CustomBlindBackground,
		Block: Array.isArray(asset.Block) ? asset.Block.slice() : [],
		Effect: Array.isArray(asset.Effect) ? asset.Effect.slice() : [],
		Hide: Array.isArray(asset.Hide) ? asset.Hide.slice() : [],
		HideItem: Array.isArray(asset.HideItem) ? asset.HideItem.slice() : [],
		AllowActivity: Array.isArray(asset.AllowActivity) ? asset.AllowActivity.slice() : [],
		Attribute: Array.isArray(asset.Attribute) ? asset.Attribute.slice() : [],
		Tint: asset.AllowTint ? Array.isArray(asset.Tint) ? asset.Tint.slice() : [] : undefined,
	}));
}

/**
 * Generates the type string for a modular item from its modules and their current values.
 * @param {AssetOverrideHeight} currentValue - The OverrideHeight for the future item
 * @param {AssetOverrideHeight} newValue - The OverrideHeight being merged
 * @returns {AssetOverrideHeight | undefined} - A string type generated from the selected option values for each module
 */
function ModularItemMergeOverrideHeight(currentValue, newValue) {
	if (typeof newValue.Height === "number" && typeof newValue.Priority === "number" &&
	(!currentValue || (currentValue.Priority < currentValue.Priority)))
		return {Height: newValue.Height, Priority: newValue.Priority};
	return currentValue;
}

/**
 * Generates the type string for a modular item from its modules and their current values.
 * @param {ModularItemModule[]} modules - The modules array for the modular item
 * @param {number[]} [values] - The numeric values representing the current options for each module
 * @returns {string} - A string type generated from the selected option values for each module
 */
function ModularItemConstructType(modules, values) {
	values = values || [];
	let type = "";
	modules.forEach((module, i) => {
		type += module.Key;
		type += (values[i] || 0);
	});
	return type;
}

/**
 * Sets a modular item's type based on a change in a module's option selection.
 * @param {ModularItemModule} module - The module that changed
 * @param {number} index - The index of the newly chosen option within the module
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemSetType(module, index, data) {
	const C = CharacterGetCurrent();
	DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
	const option = module.Options[index];
	const currentModuleValues = ModularItemParseCurrent(data);
	const moduleIndex = data.modules.indexOf(module);
	const currentOption = module.Options[currentModuleValues[moduleIndex]];

	// Make a final requirement check before actually modifying the item
	const requirementMessage = ModularItemRequirementMessageCheck(option, currentOption, data.changeWhenLocked);
	if (requirementMessage) {
		DialogExtendedMessage = requirementMessage;
		return;
	}

	let changed = false;
	const newModuleValues = currentModuleValues.map((value, i) => {
		if (i === moduleIndex && index !== value) {
			changed = true;
			return index;
		}
		return value;
	});

	if (changed) {
		// Take a snapshot of the property values that are applied by the current type
		const currentProperty = ModularItemMergeModuleValues(data, currentModuleValues);

		// Create a shallow copy of the old property, and remove any module-defined keys from it (should only leave any
		// lock-related keys behind)
		const newProperty = Object.assign({}, DialogFocusItem.Property);
		for (const key of Object.keys(currentProperty)) {
			delete newProperty[key];
		}

		// Assign the new property data
		DialogFocusItem.Property = Object.assign(newProperty, ModularItemMergeModuleValues(data, newModuleValues));

		// Reinstate the Lock effect if there's a lock
		if (newProperty.LockedBy && !(newProperty.Effect || []).includes("Lock")) {
			newProperty.Effect = (newProperty.Effect || []);
			newProperty.Effect.push("Lock");
		}

		if (!InventoryDoesItemAllowLock(DialogFocusItem)) {
			// If the new type does not permit locking, remove the lock
			ValidationDeleteLock(DialogFocusItem.Property, false);
		}

		CharacterRefresh(C);
	}

	// If the module's option has a subscreen, transition to that screen instead of the main page of the item.
	if (option.HasSubscreen) {
		ExtendedItemSubscreen = module.Name + index;
		CommonCallFunctionByNameWarn(ExtendedItemFunctionPrefix() + ExtendedItemSubscreen + "Load", C);
	} else {
		ModularItemModuleTransition(ModularItemBase, data);
	}
}

/**
 * Publishes the chatroom message for a modular item when one of its modules has changed.
 * @param {ModularItemModule} module - The module that changed
 * @param {number} previousIndex - The index of the previously selected option within the module
 * @param {number} index - The index of the newly chosen option within the module
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemChatRoomMessage(module, previousIndex, index, { asset, chatSetting, chatTags, chatMessagePrefix }) {

}

/**
 * Generates an array of all types available for an asset based on its modular item data, filtered by the provided
 * predicate function, if needed.
 * @param {ModularItemData} data - The modular item's data
 * @param {(typeObject: Record<string, number>) => boolean} [predicate] - An optional predicate for filtering the
 * resulting types
 * @returns {string[]} - The generated array of types
 */
function ModularItemGenerateTypeList({ modules }, predicate) {
	let allowType = [{}];
	modules.forEach((module) => {
		let newCombinations = [];
		module.Options.forEach((option, i) => {
			const newTypes = allowType.map(moduleValues => Object.assign({}, moduleValues, { [module.Key]: i }));
			newCombinations = newCombinations.concat(newTypes);
		});
		allowType = newCombinations;
	});
	if (predicate) allowType = allowType.filter(predicate);
	return allowType.map(combination => {
		return modules.map(module => `${module.Key}${combination[module.Key]}`).join("");
	});
}

/**
 * Generates and sets the AllowLock and AllowLockType properties for an asset based on its modular item data. For types
 * where two independent options declare conflicting AllowLock properties (i.e. one option declares AllowLock: false and
 * another declares AllowLock: true), the resulting type will permit locking (i.e. true overrides false).
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemGenerateAllowLockType(data) {
	const {asset, modules, typeCount} = data;
	/** @type {Record<string, boolean | null>} */
	const optionAllowLockMap = {};
	// Create a mapping of partial types (i.e. the "type" for a single module) to their AllowLock values. If the
	// corresponding option doesn't explicitly set AllowLock, set the value to null to distinguish between explicit
	// and inherited AllowLock (if present, explicit should override inherited)
	for (const module of modules) {
		for (const [index, option] of Object.entries(module.Options)) {
			optionAllowLockMap[`${module.Key}${index}`] = typeof option.AllowLock === "boolean" ? option.AllowLock : null;
		}
	}

	const allowLockType = ModularItemGenerateTypeList(data, (combination) => {
		const typeParts = Object.keys(combination).map((key) => `${key}${combination[key]}`);
		// Fallback allowLock value for the type if no option explicitly sets it to true
		let allowLock = asset.AllowLock;
		for (const typePart of typeParts) {
			const optionAllowLock = optionAllowLockMap[typePart];
			if (optionAllowLock) {
				// If one of the type's options explicitly sets AllowLock: true, the type permits locks
				return true;
			} else if (optionAllowLock === false) {
				// If an option explicitly sets AllowLock: false, it overrides the asset-level AllowLock
				allowLock = false;
			}
		}

		// If no option set it to true, then return the fallback value (either the asset-level AllowLock, or false if an
		// option explicitly overrode it
		return allowLock;
	});

	TypedItemSetAllowLockType(asset, allowLockType, typeCount);
}

/**
 * Generates and sets the AllowTypes property on an asset layer based on its AllowModuleTypes property.
 * @param {AssetLayer} layer - The layer to generate AllowTypes for
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemGenerateLayerAllowTypes(layer, data) {
	if (Array.isArray(layer.AllowModuleTypes)) {
		layer.AllowTypes = true;
		layer.ReverseAllowEmptyType = layer.AllowModuleTypes.some(t => t.includes('0'));
		layer.ReverseAllowTypes = layer.AllowModuleTypes;
		/*
		Let's generate every possible value of this cartesian product!
		SAID NO ONE EVER.

		const allowedModuleCombinations = layer.AllowModuleTypes.map((shorthand) => {
			const regex = /([a-zA-Z]+)(\d+)/g;
			const values = [];
			let match;
			while ((match = regex.exec(shorthand))) {
				values.push([match[1], Number.parseInt(match[2])]);
			}
			return values;
		});

		const GeneratedAllowTypes = ModularItemGenerateTypeList(data, (combination) => {
			return allowedModuleCombinations.some(allowedCombination => {
				return allowedCombination.every(combo => combination[combo[0]] === combo[1]);
			});
		});

		// Append to the existing AllowTypes
		layer.AllowTypes = Array.isArray(layer.AllowTypes) ? layer.AllowTypes : [];
		layer.AllowTypes = layer.AllowTypes.concat(GeneratedAllowTypes);

		// When option 0 is an allowed module, it means the undefined/null type is allowed.
		if (allowedModuleCombinations.find(arr => arr.find(combo => combo[1] === 0))) {
			layer.AllowTypes.push("");
		}
		*/
	}
}

/**
 * Checks whether the given option can be selected on the currently selected modular item
 * @param {ModularItemOption} option - The selected option
 * @param {ModularItemOption} currentOption - The currently active option
 * @param {boolean} changeWhenLocked - Whether or not the item can be changed when locked
 * @returns {string|null} - Returns a string user message if the option's requirements have not been met, otherwise
 * returns nothing
 */
function ModularItemRequirementMessageCheck(option, currentOption, changeWhenLocked) {
	return "foo";
}

/**
 * Generates and assigns a modular asset's AllowType, AllowEffect and AllowBlock properties, along with the AllowTypes
 * properties on the asset layers based on the values set in its module definitions.
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemGenerateValidationProperties(data) {
	const {asset, modules} = data;
	//asset.AllowType = ModularItemGenerateTypeList(data); // Only used in validation
	asset.AllowEffect = Array.isArray(asset.AllowEffect) ? asset.AllowEffect.slice() : [];
	CommonArrayConcatDedupe(asset.AllowEffect, asset.Effect);
	asset.AllowBlock = Array.isArray(asset.Block) ? asset.Block.slice() : [];
	for (const module of modules) {
		for (const {Property} of module.Options) {
			if (Property) {
				if (Property.Effect) CommonArrayConcatDedupe(asset.AllowEffect, Property.Effect);
				if (Property.Block) CommonArrayConcatDedupe(asset.AllowBlock, Property.Block);
				if (Property.Tint && Array.isArray(Property.Tint) && Property.Tint.length > 0) asset.AllowTint = true;
			}
		}
	}
	asset.Layer.forEach((layer) => ModularItemGenerateLayerAllowTypes(layer, data));
	//ModularItemGenerateAllowLockType(data); // No locks
}
