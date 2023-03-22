"use strict";

let CharacterAppearancePreviousEmoticon = null;

/**
 * Resets the character to it's default appearance
 * @param {Character} C - The character to redress to its default appearance
 * @returns {void} - Nothing
 */
function CharacterAppearanceSetDefault(C) {
	C.Appearance = [];
	C.Pose = [];
}

/**
 * Removes all items that can be removed, making the character naked. Checks for a blocking of CosPlayItem removal.
 * @param {Character} C - The character to undress
 * @returns {void} - Nothing
 */
function CharacterAppearanceNaked(C) {
	for (let A = C.Appearance.length - 1; A >= 0; A--)
		if (!C.Appearance[A].Model?.Protected)
			C.Appearance.splice(A, 1);
}

/**
 * Draws the character canvas
 * @param {Character} C - The character to draw
 * @returns {void} - Nothing
 */
function CharacterAppearanceBuildCanvas(C) {
	return;
}

/**
 * Returns a value from the character current appearance
 * @param {Character} C - The character to get values from
 * @param {string} Group - The name of the group, whose values we want to get
 * @param {string} Type - The name of the value, we want to get
 * @returns {*} - The return value
 */
function CharacterAppearanceGetCurrentValue(C, Group, Type) {

	// Finds the value
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset.Group.Family == C.AssetFamily) && (C.Appearance[A].Asset.Group.Name == Group)) {
			if (Type == "Name") return C.Appearance[A].Asset.Name;
			if (Type == "Description") return C.Appearance[A].Asset.Description;
			if (Type == "Color") return CommonColorsEqual(C.Appearance[A].Color, C.Appearance[A].Asset.DefaultColor) ? "Default" : C.Appearance[A].Color;
			if (Type == "ID") return A;
			if (Type == "Effect") return C.Appearance[A].Asset.Effect;
			if (Type == "Asset") return C.Appearance[A].Asset;
			if (Type == "Full") return C.Appearance[A];
			if (Type == "Zoom") return ((C.Appearance[A].Asset.ZoomModifier == null) || (C.Appearance[A].Asset.ZoomModifier > 1) || (C.Appearance[A].Asset.ZoomModifier < 0.9)) ? 1 : C.Appearance[A].Asset.ZoomModifier;
		}
	return "None";

}

/**
 * Repositions the character horizonally to centre them, since shorter characters will shrink towards the left
 * @param {Character} C - The character to reposition
 * @param {number} HeightRatio - The character's height ratio
 * @returns {number} - The amount to move the character along the X co-ordinate
 */
function CharacterAppearanceXOffset(C, HeightRatio) {
	return 500 * (1 - HeightRatio) / 2;
}

/**
 * Repositions the character vertically towards the bottom of the canvas (the 'floor'), since shorter characters will be shrunk towards the
 * top HeightRatioProportion controls how much of this offset applies with 1 (max) positioning them on the "floor" and 0 (min) leaving them
 * up at the 'ceiling'
 * @param {Character} C - The character to reposition
 * @param {number} HeightRatio - The character's height ratio
 * @param {boolean} [IgnoreUpButton=false] - Whether or not to ignore the up button status
 * @returns {number} - The amounnt to move the character along the Y co-ordinate
 */
function CharacterAppearanceYOffset(C, HeightRatio, IgnoreUpButton) {
	let HeightModifier = C.HeightModifier;
	if (!IgnoreUpButton && CharacterAppearanceForceUpCharacter == C.MemberNumber) {
		HeightModifier = 0;
	}
	return 1000 * (1 - HeightRatio) * C.HeightRatioProportion - HeightModifier * HeightRatio;
}

/**
 * Loads the character appearance screen and keeps a backup of the previous appearance. The function name is created dynamically.
 * @returns {void} - Nothing
 */
function AppearanceLoad() {
	DialogFocusItem = null;
	CharacterAppearanceOffset = 0;
	if (!CharacterAppearanceSelection) CharacterAppearanceSelection = Player;
	var C = CharacterAppearanceSelection;
	CharacterAppearanceBuildAssets(Player);
	CharacterAppearanceBackup = CharacterAppearanceStringify(C);
	AppearanceMenuBuild(C);
	AppearanceUseCharacterInPreviewsSetting = true;
}

/**
 * Build the buttons in the top menu
 * @param {Character} C - The character the appearance is being set for
 * @returns {void} - Nothing
 */
function AppearanceMenuBuild(C) {
	AppearanceMenu = [];

	switch (CharacterAppearanceMode) {
		case "":
			if (C.ID === 0) {
				if (AppearanceGroupAllowed(C, "ALL")) AppearanceMenu.push("Reset");
				if (!DialogItemPermissionMode) AppearanceMenu.push("WearRandom");
				AppearanceMenu.push("Random");
			} else AppearanceMenu.push("WardrobeDisabled");
			AppearanceMenu.push("Naked", "Character", "Next");
			break;
		case "Wardrobe":
			AppearanceMenu.push("Naked", "Prev", "Next");
			break;
		case "Cloth":
			if (!DialogItemPermissionMode) {
				let Item = InventoryGet(C, C.FocusGroup.Name);
				if (Item && Item.Asset.Extended) AppearanceMenu.push(InventoryBlockedOrLimited(C, Item) ? "UseDisabled" : "Use");
				if (C.IsPlayer()) AppearanceMenu.push("WearRandom");
				if (C.IsPlayer()) AppearanceMenu.push("DialogPermissionMode");
				if (C.FocusGroup.AllowNone) AppearanceMenu.push("Naked");
				if (Item && DialogCanColor(C, Item)) {
					let ButtonName = ItemColorIsSimple(Item) ? "ColorPick" : "MultiColorPick";
					if (InventoryBlockedOrLimited(C, Item)) ButtonName += "Disabled";
					AppearanceMenu.push(ButtonName);
				}
			}
			if (DialogInventory.length > 9) AppearanceMenu.push("Next");
			break;
	}

	// Add the exit buttons
	if (CharacterAppearanceMode !== "Color") {
		if (!DialogItemPermissionMode) AppearanceMenu.push("Cancel");
		AppearanceMenu.push("Accept");
	}
}

/**
 * Checks if the appearance is locked for the current player
 * @param {Character} C - The character to validate
 * @param {String} GroupName - The group name to validate, can be "ALL" to check all groups
 * @returns {boolean} - Return TRUE if the appearance group isn't blocked
 */
function AppearanceGroupAllowed(C, GroupName) {
	return true;
}

/**
 * Run the character appearance selection screen. The function name is created dynamically.
 * @returns {void} - Nothing
 */
function AppearanceRun() {

	// Draw the background and the character twice
	var C = CharacterAppearanceSelection;
	if (CharacterAppearanceHeaderTextTime < CommonTime() && CharacterAppearanceMode == "Cloth")
		CharacterAppearanceHeaderText = "";
	if (CharacterAppearanceHeaderText == "") {
		if (C.ID == 0) CharacterAppearanceHeaderText = TextGet("SelectYourAppearance");
		else CharacterAppearanceHeaderText = TextGet("SelectSomeoneAppearance").replace("TargetCharacterName", C.Name);
	}
	DrawCharacter(C, -600, -100 + 4 * C.HeightModifier, 4, false);
	DrawCharacter(C, 750, 0, 1);
	DrawText(CharacterAppearanceHeaderText, 400, 40, "White", "Black");

	// When there is an extended item
	if (DialogFocusItem != null) {
		CommonDynamicFunction("Inventory" + DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Draw()");
		DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png");
		return;
	}

	// As soon as the appearance mode changes, rebuild the menu button list
	if (CharacterAppearanceMenuMode !== CharacterAppearanceMode) {
		CharacterAppearanceMenuMode = CharacterAppearanceMode;
		AppearanceMenuBuild(C);
	}

	// Draw the menu buttons at the top
	AppearanceMenuDraw();

	// In regular dress-up mode
	if (CharacterAppearanceMode == "") {

		// Creates buttons for all groups
		for (let A = CharacterAppearanceOffset; A < AssetGroup.length && A < CharacterAppearanceOffset + CharacterAppearanceNumPerPage; A++)
			if ((AssetGroup[A].Family == C.AssetFamily) && (AssetGroup[A].Category == "Appearance") && AssetGroup[A].AllowCustomize) {
				if (AppearanceGroupAllowed(C, AssetGroup[A].Name)) {
					const Item = InventoryGet(C, AssetGroup[A].Name);
					const ButtonColor = WardrobeGroupAccessible(C, AssetGroup[A]) ? "White" : "#888";
					if (AssetGroup[A].AllowNone && (AssetGroup[A].Category == "Appearance") && (Item != null) && WardrobeGroupAccessible(C, AssetGroup[A]))
						DrawButton(1210, 145 + (A - CharacterAppearanceOffset) * 95, 65, 65, "", ButtonColor, "Icons/Small/Naked.png", TextGet("StripItem"));
					DrawBackNextButton(1300, 145 + (A - CharacterAppearanceOffset) * 95, 400, 65, AssetGroup[A].Description + ": " + CharacterAppearanceGetCurrentValue(C, AssetGroup[A].Name, "Description"), ButtonColor, "",
						() => WardrobeGroupAccessible(C, AssetGroup[A]) ? CharacterAppearanceNextItem(C, AssetGroup[A].Name, false, true) : "",
						() => WardrobeGroupAccessible(C, AssetGroup[A]) ? CharacterAppearanceNextItem(C, AssetGroup[A].Name, true, true) : "",
						!WardrobeGroupAccessible(C, AssetGroup[A]),
						AssetGroup[A].AllowNone || AppearancePreviewUseCharacter(AssetGroup[A]) ? 65 : null);
					var Color = CharacterAppearanceGetCurrentValue(C, AssetGroup[A].Name, "Color");
					const ColorButtonText = ItemColorGetColorButtonText(Color);
					const ColorButtonColor = ColorButtonText.startsWith("#") ? ColorButtonText : "#fff";
					const CanCycleColors = !!Item && WardrobeGroupAccessible(C, AssetGroup[A]) && (Item.Asset.ColorableLayerCount > 0 || Item.Asset.Group.ColorSchema.length > 1) && !InventoryBlockedOrLimited(C, Item);
					const CanPickColor = CanCycleColors && AssetGroup[A].AllowColorize;
					const ColorIsSimple = ItemColorIsSimple(Item);
					DrawButton(1725, 145 + (A - CharacterAppearanceOffset) * 95, 160, 65, ColorButtonText, CanCycleColors ? ColorButtonColor : "#aaa", null, null, !CanCycleColors);
					DrawButton(1910, 145 + (A - CharacterAppearanceOffset) * 95, 65, 65, "", CanPickColor ? "#fff" : "#aaa", CanPickColor ? ColorIsSimple ? "Icons/Color.png" : "Icons/MultiColor.png" : "Icons/ColorBlocked.png", null, !CanPickColor);
				} else DrawText(AssetGroup[A].Description + " " + TextGet("OwnerBlock"), 1600, 177 + (A - CharacterAppearanceOffset) * 95, "White", "Silver");
			}
	}

	// In wardrobe mode
	if (CharacterAppearanceMode == "Wardrobe") {

		// Draw the wardrobe controls
		DrawText(CharacterAppearanceWardrobeText, 1645, 220, "White", "Gray");
		ElementPosition("InputWardrobeName", 1645, 315, 690);

		// Draw 6 wardrobe options
		for (let W = CharacterAppearanceWardrobeOffset; W < Player.Wardrobe.length && W < CharacterAppearanceWardrobeOffset + 6; W++) {
			DrawButton(1300, 430 + (W - CharacterAppearanceWardrobeOffset) * 95, 500, 65, "", "White", "");
			DrawTextFit((W + 1).toString() + (W < 9 ? ":  " : ": ") + Player.WardrobeCharacterNames[W], 1550, 463 + (W - CharacterAppearanceWardrobeOffset) * 95, 496, "Black");
			DrawButton(1820, 430 + (W - CharacterAppearanceWardrobeOffset) * 95, 160, 65, "Save", "White", "");
		}

	}

	// In item coloring mode
	if (CharacterAppearanceMode == "Color") {
		// Leave the color picker if the item is gone.
		if (!InventoryGet(CharacterAppearanceSelection, CharacterAppearanceColorPickerGroupName)) ItemColorCancelAndExit();
		// Draw the color picker
		ItemColorDraw(CharacterAppearanceSelection, CharacterAppearanceColorPickerGroupName, 1200, 25, 775, 950, true);
	}

	// In cloth selection mode
	if (CharacterAppearanceMode == "Cloth") {
		// Prepares a 3x3 square of clothes to present all the possible options
		let X = 1250;
		let Y = 125;
		for (let I = DialogInventoryOffset; (I < DialogInventory.length) && (I < DialogInventoryOffset + 9); I++) {
			const Item = DialogInventory[I];
			const Hover = MouseIn(X, Y, 225, 275) && !CommonIsMobile;
			const Background = AppearanceGetPreviewImageColor(C, Item, Hover);

			if (Item.Hidden) {
				DrawPreviewBox(X, Y, "Icons/HiddenItem.png", Item.Asset.Description, { Background });
			} else if (AppearancePreviewUseCharacter(C.FocusGroup)) {
				const Z = C.FocusGroup.PreviewZone;
				const PreviewCanvas = DrawCharacterSegment(AppearancePreviews[I], Z[0], Z[1], Z[2], Z[3]);
				DrawCanvasPreview(X, Y, PreviewCanvas, Item.Asset.Description, { Background, Vibrating: Item.Vibrating, Icons: Item.Icons });
			} else {
				DrawAssetPreview(X, Y, Item.Asset, { Background, Vibrating: Item.Vibrating, Icons: Item.Icons });
			}

			setButton(X, Y);
			X = X + 250;
			if (X > 1800) {
				X = 1250;
				Y = Y + 300;
			}
		}
	}
}

/**
 * Calculates the background color of the preview image for and item
 * @param {Character} C - The character whose appearance we are viewing
 * @param {DialogInventoryItem} item - The item to calculate the color for
 * @param {boolean} hover - Whether or not the item is currently hovering over the preview image
 * @returns {string} - A CSS color string determining the color that the preview icon should be drawn in
 */
function AppearanceGetPreviewImageColor(C, item, hover) {
	if (DialogItemPermissionMode && C.ID === 0) {
		let permission = "green";
		if (InventoryIsPermissionBlocked(C, item.Asset.Name, item.Asset.Group.Name)) permission = "red";
		else if (InventoryIsPermissionLimited(C, item.Asset.Name, item.Asset.Group.Name)) permission = "amber";
		return item.Worn ? "gray" : AppearancePermissionColors[permission][hover ? 1 : 0];
	} else {
		const Unusable = item.SortOrder.startsWith(DialogSortOrder.Unusable.toString())
			|| item.SortOrder.startsWith(DialogSortOrder.TargetFavoriteUnusable.toString())
			|| item.SortOrder.startsWith(DialogSortOrder.PlayerFavoriteUnusable.toString());
		const Blocked = item.SortOrder.startsWith(DialogSortOrder.Blocked.toString());
		if (hover && !Blocked) return "cyan";
		else if (item.Worn) return "pink";
		else if (Blocked) return "red";
		else if (Unusable) return "gray";
		else if ((item.Craft != null) && (item.Craft.Name != null)) return "#FFFFAF";
		else return "white";
	}
}

/**
 * Draw the top-row menu buttons for the appearance screen
 * @returns {void} - Nothing
 */
function AppearanceMenuDraw() {
	const X = 2000 - AppearanceMenu.length * 117;
	for (let B = 0; B < AppearanceMenu.length; B++) {
		const ButtonName = AppearanceMenu[B].replace(/Disabled$/, "");
		const ButtonSuffix = AppearanceMenu[B] === "Character" && !AppearanceUseCharacterInPreviewsSetting ? "Off" : "";
		const ButtonColor = DialogGetMenuButtonColor(AppearanceMenu[B]);
		const ButtonDisabled = DialogIsMenuButtonDisabled(AppearanceMenu[B]);
		DrawButton(X + 117 * B, 25, 90, 90, "", ButtonColor, "Icons/" + ButtonName + ButtonSuffix + ".png", TextGet(AppearanceMenu[B]), ButtonDisabled);
	}
}

/**
 * Create a list of characters with different items from the group applied, to use as the preview images
 * @param {Character} C - The character that the dialog inventory has been loaded for
 * @param {boolean} buildCanvases - Determines whether the preview canvases need to be (re)built, e.g. for the initial load or due to an appearance change
 * @returns {void} - Nothing
 */
function AppearancePreviewBuild(C, buildCanvases) {
	AppearancePreviews = [];
	if (AppearancePreviewUseCharacter(C.FocusGroup) && DialogInventory) {
		// Create a copy of the character appearance without items
		const baseAppearance = buildCanvases ? C.Appearance.filter(A => A.Asset.Group.Category === "Appearance") : null;
		// If the group being viewed is underwear, remove outer clothes
		if (baseAppearance && (C.FocusGroup.Underwear || C.FocusGroup.Name.startsWith("Suit"))) {
			for (let A = baseAppearance.length - 1; A >= 0; A--) {
				let assetGroup = baseAppearance[A].Asset.Group;
				if (assetGroup.Clothing && !assetGroup.Underwear && !assetGroup.BodyCosplay) {
					baseAppearance.splice(A, 1);
				}
			}
		}
		// Add each preview character to the list, building their canvas if necessary
		DialogInventory.forEach(item => {
			let PreviewChar = CharacterLoadSimple("AppearancePreview-" + item.Asset.Name);
			if (buildCanvases) {
				PreviewChar.Appearance = Array.from(baseAppearance);
				CharacterAppearanceSetItem(PreviewChar, item.Asset.Group.Name, item.Asset, null, null, null, false);
				CharacterRefresh(PreviewChar, false);
			}
			AppearancePreviews.push(PreviewChar);
		});
	}
}

/**
 * Delete all characters created for preview images
 * @returns {void} - Nothing
 */
function AppearancePreviewCleanup() {
	AppearancePreviews = [];
	for (let C = Character.length - 1; C >= 0; C--) {
		if (Character[C].AccountName.startsWith("AppearancePreview-")) {
			CharacterDelete(Character[C].AccountName);
		}
	}
}

/**
 * Returns whether the the 3x3 grid "Cloth" appearance mode should include the character in the preview images
 * @param {AssetGroup} assetGroup - The group to check
 * @returns {boolean} - If TRUE the previews will be drawn with the character
 */
function AppearancePreviewUseCharacter(assetGroup) {
	return AppearanceUseCharacterInPreviewsSetting && assetGroup && typeof assetGroup.PreviewZone !== "undefined";
}

/**
 * Sets an item in the character appearance
 * @param {Character} C - The character whose appearance should be changed
 * @param {string} Group - The name of the corresponding groupr for the item
 * @param {Asset|null} ItemAsset - The asset collection of the item to be changed
 * @param {string|string[]} [NewColor] - The new color (as "#xxyyzz" hex value) for that item
 * @param {number} [DifficultyFactor=0] - The difficulty, on top of the base asset difficulty, that should be assigned
 * to the item
 * @param {number} [ItemMemberNumber=-1] - The member number of the player adding the item - defaults to -1
 * @param {boolean} [Refresh=true] - Determines, wether the character should be redrawn after the item change
 * @returns {void} - Nothing
 */
function CharacterAppearanceSetItem(C, Group, ItemAsset, NewColor, DifficultyFactor, ItemMemberNumber, Refresh) {
	return;
}


/**
 * Serialises a character's appearance into an abbreviated string for backup purposes
 * @param {Character} C - The character whose appearance should be serialised
 * @returns {string} - A serialised version of the character's current appearance
 */
function CharacterAppearanceStringify(C) {
	return AppearanceItemStringify(C.Appearance);
}

function AppearanceItemStringify(Item) {
	for (let r of Item) {
		if (r.Model?.Filters) r.Filters = r.Model.Filters;
	}
	return JSON.stringify(Item, (key, value) => {
		if (key === "Asset") {
			return value.Group.Family + "/" + value.Group.Name + "/" + value.Name;
		}
		if (key === "Model") {
			return value.Name;
		}
		return value;
	});
}

/**
 * Restores a character's appearance from a serialised string generated by CharacterAppearanceStringify
 * @param {Character} C - The character whose appearance should be restored
 * @param {string} backup - The serialised appearance to restore
 * @returns {void} - Nothing
 */
function CharacterAppearanceRestore(C, backup) {
	C.Appearance = AppearanceItemParse(backup);
}

function AppearanceItemParse(stringified) {
	let ret = JSON.parse(stringified, (key, value) => {
		if (key === "Model") {
			return JSON.parse(JSON.stringify(ModelDefs[value]));
		}
		return value;
	});
	for (let r of ret) {
		if (r.Filters && r.Model) r.Model.Filters = r.Filters;
	}
	return ret;
}
