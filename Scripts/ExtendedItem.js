"use strict";
/**
 * Utility file for handling extended items
 */

/**
 * A lookup for the current pagination offset for all extended item options. Offsets are only recorded if the extended
 * item requires pagination. Example format:
 * ```json
 * {
 *     "ItemArms/HempRope": 4,
 *     "ItemArms/Web": 0
 * }
 * ```
 * @type {Record<string, number>}
 * @constant
 */
var ExtendedItemOffsets = {};

/** The X & Y co-ordinates of each option's button, based on the number to be displayed per page. */
const ExtendedXY = [
	[], //0 placeholder
	[[1385, 500]], //1 option per page
	[[1185, 500], [1590, 500]], //2 options per page
	[[1080, 500], [1385, 500], [1695, 500]], //3 options per page
	[[1185, 400], [1590, 400], [1185, 700], [1590, 700]], //4 options per page
	[[1080, 400], [1385, 400], [1695, 400], [1185, 700], [1590, 700]], //5 options per page
	[[1080, 400], [1385, 400], [1695, 400], [1080, 700], [1385, 700], [1695, 700]], //6 options per page
	[[1020, 400], [1265, 400], [1510, 400], [1755, 400], [1080, 700], [1385, 700], [1695, 700]], //7 options per page
	[[1020, 400], [1265, 400], [1510, 400], [1755, 400], [1020, 700], [1265, 700], [1510, 700], [1755, 700]], //8 options per page
];

/** The X & Y co-ordinates of each option's button, based on the number to be displayed per page. */
const ExtendedXYWithoutImages = [
	[], //0 placeholder
	[[1400, 450]], //1 option per page
	[[1175, 450], [1425, 450]], //2 options per page
	[[1175, 450], [1425, 450], [1675, 450]], //3 options per page
	[[1175, 450], [1425, 450], [1175, 525], [1425, 525]], //4 options per page
	[[1175, 450], [1425, 450], [1675, 450], [1175, 525], [1425, 525]], //5 options per page
	[[1175, 450], [1425, 450], [1675, 450], [1175, 525], [1425, 525], [1675, 525]], //6 options per page
	[[1050, 450], [1200, 450], [1450, 450], [1700, 450], [1050, 525], [1200, 525], [1425, 525]], //7 options per page
	[[1050, 450], [1200, 450], [1450, 450], [1700, 450], [1050, 525], [1200, 525], [1425, 525], [1675, 525]], //8 options per page
];

/** The X & Y co-ordinates of each option's button, based on the number to be displayed per page. */
const ExtendedXYClothes = [
	[], //0 placeholder
	[[1385, 450]], //1 option per page
	[[1220, 450], [1550, 450]], //2 options per page
	[[1140, 450], [1385, 450], [1630, 450]], //3 options per page
	[[1220, 400], [1550, 400], [1220, 700], [1550, 700]], //4 options per page
	[[1140, 400], [1385, 400], [1630, 400], [1220, 700], [1550, 700]], //5 options per page
	[[1140, 400], [1385, 400], [1630, 400], [1140, 700], [1385, 700], [1630, 700]], //6 options per page
];

/** Memoization of the requirements check */
const ExtendedItemRequirementCheckMessageMemo = CommonMemoize(ExtendedItemRequirementCheckMessage);

/**
 * The current display mode
 * @type {boolean}
 */
var ExtendedItemPermissionMode = false;

/**
 * Tracks whether a selected option's subscreen is active - if active, the value is the name of the current subscreen's
 * corresponding option
 * @type {string|null}
 */
var ExtendedItemSubscreen = null;

/**
 * Loads the item extension properties
 * @param {ExtendedItemOption[]} Options - An Array of type definitions for each allowed extended type. The first item
 *     in the array should be the default option.
 * @param {string} DialogKey - The dialog key for the message to display prompting the player to select an extended
 *     type
 * @returns {void} Nothing
 */
function ExtendedItemLoad(Options, DialogKey) {
	if (!DialogFocusItem.Property) {
		const C = CharacterGetCurrent();
		// Default to the first option if no property is set
		let InitialProperty = Options[0].Property;
		DialogFocusItem.Property = JSON.parse(JSON.stringify(Options[0].Property));

		// If the default type is not the null type, check whether the default type is blocked
		if (InitialProperty && InitialProperty.Type && InventoryBlockedOrLimited(C, DialogFocusItem, InitialProperty.Type)) {
			// If the first option is blocked by the character, switch to the null type option
			const InitialOption = Options.find(O => O.Property.Type == null);
			if (InitialOption) InitialProperty = InitialOption.Property;
		}

		// If there is an initial property, set it and update the character
		if (InitialProperty) {
			DialogFocusItem.Property = JSON.parse(JSON.stringify(InitialProperty));
			CharacterRefresh(C);
		}
	}

	if (ExtendedItemSubscreen) {
		CommonCallFunctionByNameWarn(ExtendedItemFunctionPrefix() + ExtendedItemSubscreen + "Load");
		return;
	}

	if (ExtendedItemOffsets[ExtendedItemOffsetKey()] == null) ExtendedItemSetOffset(0);
}

/**
 * Draws the extended item type selection screen
 * @param {ExtendedItemOption[]} Options - An Array of type definitions for each allowed extended type. The first item
 *     in the array should be the default option.
 * @param {string} DialogPrefix - The prefix to the dialog keys for the display strings describing each extended type.
 *     The full dialog key will be <Prefix><Option.Name>
 * @param {number} [OptionsPerPage] - The number of options displayed on each page
 * @param {boolean} [ShowImages=true] - Denotes wether images should be shown for the specific item
 * @returns {void} Nothing
 */
function ExtendedItemDraw(Options, DialogPrefix, OptionsPerPage, ShowImages = true) {

}

/**
 * Determine the background color for the item option's button
 * @param {Character} C - The character wearing the item
 * @param {ExtendedItemOption} Option - A type for the extended item
 * @param {ExtendedItemOption} CurrentOption - The currently selected option for the item
 * @param {boolean} Hover - TRUE if the mouse cursor is on the button
 * @param {boolean} IsSelected - TRUE if the item's current type matches Option
 * @returns {string} The name or hex code of the color
 */
function ExtendedItemGetButtonColor(C, Option, CurrentOption, Hover, IsSelected) {
	return "#ffffff";
}

/**
 * Handles clicks on the extended item type selection screen
 * @param {ExtendedItemOption[]} Options - An Array of type definitions for each allowed extended type. The first item
 *     in the array should be the default option.
 * @param {number} [OptionsPerPage] - The number of options displayed on each page
 * @param {boolean} [ShowImages=true] - Denotes wether images are shown for the specific item
 * @returns {void} Nothing
 */
function ExtendedItemClick(Options, OptionsPerPage, ShowImages = true) {

}

/**
 * Handler function for setting the type of an extended item
 * @param {Character} C - The character wearing the item
 * @param {ExtendedItemOption[]} Options - An Array of type definitions for each allowed extended type. The first item
 *     in the array should be the default option.
 * @param {ExtendedItemOption} Option - The selected type definition
 * @returns {void} Nothing
 */
function ExtendedItemSetType(C, Options, Option) {
	DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
	const FunctionPrefix = ExtendedItemFunctionPrefix() + (ExtendedItemSubscreen || "");

	if (CurrentScreen == "ChatRoom") {
		// Call the item's load function
		CommonCallFunctionByName(FunctionPrefix + "Load");
	}

	const IsCloth = DialogFocusItem.Asset.Group.Clothing;
	const previousOption = TypedItemFindPreviousOption(DialogFocusItem, Options);

	TypedItemSetOption(C, DialogFocusItem, Options, Option, !IsCloth); // Do not sync appearance while in the wardrobe

	// For a restraint, we might publish an action, change the expression or change the dialog of a NPC
	if (!IsCloth) {
		// If the item triggers an expression, start the expression change
		if (Option.Expression) {
			InventoryExpressionTriggerApply(C, Option.Expression);
		}
		if (CurrentScreen === "ChatRoom") {
			// If we're in a chatroom, call the item's publish function to publish a message to the chatroom
			CommonCallFunctionByName(FunctionPrefix + "PublishAction", C, Option, previousOption);
		} else {
			CommonCallFunctionByName(FunctionPrefix + "Exit");
			DialogFocusItem = null;
			if (C.ID === 0) {
				// Player is using the item on herself
				//DialogMenuButtonBuild(C);
			} else {
				// Otherwise, call the item's NPC dialog function, if one exists
				//CommonCallFunctionByName(FunctionPrefix + "NpcDialog", C, Option, previousOption);
				C.FocusGroup = null;
			}
		}
	}
}

/**
 * Handler function called when an option on the type selection screen is clicked
 * @param {Character} C - The character wearing the item
 * @param {ExtendedItemOption[]} Options - An Array of type definitions for each allowed extended type. The first item
 *     in the array should be the default option.
 * @param {ExtendedItemOption} Option - The selected type definition
 * @returns {void} Nothing
 */
function ExtendedItemHandleOptionClick(C, Options, Option) {
	if (ExtendedItemPermissionMode) {
		if (Option.Property.Type == null) return;
		const worn = C.ID == 0 && DialogFocusItem.Property.Type == Option.Property.Type;
		InventoryTogglePermission(DialogFocusItem, Option.Property.Type, worn);
	} else {
		if (DialogFocusItem.Property.Type === Option.Property.Type && !Option.HasSubscreen) {
			return;
		}

		const CurrentType = DialogFocusItem.Property.Type || null;
		const CurrentOption = Options.find(O => O.Property.Type === CurrentType);
		// use the unmemoized function to ensure we make a final check to the requirements
		const RequirementMessage = ExtendedItemRequirementCheckMessage(Option, CurrentOption);
		if (RequirementMessage) {
			DialogExtendedMessage = RequirementMessage;
		} else if (Option.HasSubscreen) {
			//ExtendedItemSubscreen = Option.Name;
			//CommonCallFunctionByNameWarn(ExtendedItemFunctionPrefix() + ExtendedItemSubscreen + "Load", C, Option);
		} else {
			ExtendedItemSetType(C, Options, Option);
		}
	}
}

/**
 * Checks whether the player meets the requirements for an extended type option. This will check against their Bondage
 * skill if applying the item to another character, or their Self Bondage skill if applying the item to themselves.
 * @param {ExtendedItemOption|ModularItemOption} Option - The selected type definition
 * @param {ExtendedItemOption|ModularItemOption} CurrentOption - The current type definition
 * @returns {string|null} null if the player meets the option requirements. Otherwise a string message informing them
 * of the requirements they do not meet
 */
function ExtendedItemRequirementCheckMessage(Option, CurrentOption) {
	const C = CharacterGetCurrent();
	return TypedItemValidateOption(C, DialogFocusItem, Option, CurrentOption)
		|| ExtendedItemCheckSelfSelect(C, Option)
		|| ExtendedItemCheckSkillRequirements(C, DialogFocusItem, Option);
}

/**
 * Checks whether the player is able to select an option based on it's self-selection criteria (whether or not the
 * wearer may select the option)
 * @param {Character} C - The character on whom the bondage is applied
 * @param {ExtendedItemOption | ModularItemOption} Option - The option whose requirements should be checked against
 * @returns {string | undefined} - undefined if the
 */
function ExtendedItemCheckSelfSelect(C, Option) {
	return "foo";
}

/**
 * Checks whether the player meets an option's self-bondage/bondage skill level requirements
 * @param {Character} C - The character on whom the bondage is applied
 * @param {Item} Item - The item whose options are being checked
 * @param {ExtendedItemOption|ModularItemOption} Option - The option whose requirements should be checked against
 * @returns {string|undefined} - undefined if the player meets the option's skill level requirements. Otherwise returns
 * a string message informing them of the requirements they do not meet.
 */
function ExtendedItemCheckSkillRequirements(C, Item, Option) {
	return "foo";
}

/**
 * Checks whether a change from the given current option to the newly selected option is valid.
 * @param {Character} C - The character wearing the item
 * @param {Item} Item - The extended item to validate
 * @param {ExtendedItemOption|ModularItemOption} Option - The selected option
 * @param {ExtendedItemOption|ModularItemOption} CurrentOption - The currently applied option on the item
 * @returns {string} - Returns a non-empty message string if the item failed validation, or an empty string otherwise
 */
function ExtendedItemValidate(C, Item, { Prerequisite, Property }, CurrentOption) {
	return "";
}

/**
 * Simple getter for the function prefix used for the currently focused extended item - used for calling standard
 * extended item functions (e.g. if the currently focused it is the hemp rope arm restraint, this will return
 * "InventoryItemArmsHempRope", allowing functions like InventoryItemArmsHempRopeLoad to be called)
 * @returns {string} The extended item function prefix for the currently focused item
 */
function ExtendedItemFunctionPrefix() {
	var Asset = DialogFocusItem.Asset;
	return "Inventory" + Asset.Group.Name + Asset.Name;
}

/**
 * Simple getter for the key of the currently focused extended item in the ExtendedItemOffsets lookup
 * @returns {string} The offset lookup key for the currently focused extended item
 */
function ExtendedItemOffsetKey() {
	var Asset = DialogFocusItem.Asset;
	return Asset.Group.Name + "/" + Asset.Name;
}

/**
 * Gets the pagination offset of the currently focused extended item
 * @returns {number} The pagination offset for the currently focused extended item
 */
function ExtendedItemGetOffset() {
	return ExtendedItemOffsets[ExtendedItemOffsetKey()];
}

/**
 * Sets the pagination offset for the currently focused extended item
 * @param {number} Offset - The new offset to set
 * @returns {void} Nothing
 */
function ExtendedItemSetOffset(Offset) {
	ExtendedItemOffsets[ExtendedItemOffsetKey()] = Offset;
}

/**
 * Maps a chat tag to a dictionary entry for use in item chatroom messages.
 * @param {Character} C - The target character
 * @param {Asset} asset - The asset for the typed item
 * @param {CommonChatTags} tag - The tag to map to a dictionary entry
 * @returns {object} - The constructed dictionary entry for the tag
 */
function ExtendedItemMapChatTagToDictionaryEntry(C, asset, tag) {
	switch (tag) {
		case CommonChatTags.SOURCE_CHAR:
			return { Tag: tag, Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber };
		case CommonChatTags.DEST_CHAR:
		case CommonChatTags.DEST_CHAR_NAME:
		case CommonChatTags.TARGET_CHAR:
		case CommonChatTags.TARGET_CHAR_NAME:
			return { Tag: tag, Text: CharacterNickname(C), MemberNumber: C.MemberNumber };
		case CommonChatTags.ASSET_NAME:
			return { Tag: tag, AssetName: asset.Name };
		default:
			return null;
	}
}
