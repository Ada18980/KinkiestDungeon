"use strict";
var AppearanceBackground = "Dressing";
var CharacterAppearanceOffset = 0;
var CharacterAppearanceNumPerPage = 9;
var CharacterAppearanceHeaderText = "";
var CharacterAppearanceHeaderTextTime = 0;
var CharacterAppearanceBackup = null;
var CharacterAppearanceInProgressBackup = null;
var CharacterAppearanceAssets = [];
var CharacterAppearanceColorPickerGroupName = "";
var CharacterAppearanceColorPickerBackup = "";
var CharacterAppearanceColorPickerRefreshTimer = null;
/** @type {Character | null} */
var CharacterAppearanceSelection = null;
var CharacterAppearanceReturnRoom = "MainHall";
var CharacterAppearanceReturnModule = "Room";
var CharacterAppearanceWardrobeOffset = 0;
var CharacterAppearanceWardrobeText = "";
var CharacterAppearanceWardrobeName = "";
var CharacterAppearanceForceUpCharacter = -1;
var CharacterAppearancePreviousEmoticon = "";
var CharacterAppearanceMode = "";
var CharacterAppearanceMenuMode = "";
var CharacterAppearanceCloth = null;
var AppearanceMenu = [];
var AppearancePreviews = [];
var AppearanceUseCharacterInPreviewsSetting = false;

const CanvasUpperOverflow = 700;
const CanvasLowerOverflow = 150;
const CanvasDrawHeight = 1000 + CanvasUpperOverflow + CanvasLowerOverflow;

const AppearancePermissionColors = {
	red: ["pink", "red"],
	amber: ["#fed8b1", "orange"],
	green: ["lime", "green"],
};

/**
 * Builds all the assets that can be used to dress up the character
 * @param {Character} C - The character whose appearance is modified
 * @returns {void} - Nothing
 */
function CharacterAppearanceBuildAssets(C) {

	// Adds all items with 0 value and from the appearance category
	CharacterAppearanceAssets = [];
	for (let A = 0; A < Asset.length; A++)
		if ((Asset[A].Value == 0) && (Asset[A].Group.Family == C.AssetFamily) && (Asset[A].Group.Category == "Appearance"))
			CharacterAppearanceAssets.push(Asset[A]);
	for (let A = 0; A < C.Inventory.length; A++)
		if ((C.Inventory[A].Asset != null) && (C.Inventory[A].Asset.Group.Family == C.AssetFamily) && (C.Inventory[A].Asset.Group.Category == "Appearance"))
			CharacterAppearanceAssets.push(C.Inventory[A].Asset);

}

/**
 * Makes sure the character appearance is valid from inventory and asset requirement. This function is called during the login process.
 * @param {Character} C - The character whose appearance is checked
 * @returns {void} - Nothing
 */
function CharacterAppearanceValidate(C) {

	// Remove any appearance item that's not in inventory
	var Refresh = false;
	for (let A = C.Appearance.length - 1; A >= 0; A--)
		if ((C.Appearance[A].Asset.Value != 0) && (C.Appearance[A].Asset.Group.Category == "Appearance") && !InventoryAvailable(C, C.Appearance[A].Asset.Name, C.Appearance[A].Asset.Group.Name)) {
			C.Appearance.splice(A, 1);
			Refresh = true;
		}

	// Remove items flagged as "Remove At Login"
	if (LogQuery("Committed", "Asylum") || !Player.GameplaySettings || !Player.GameplaySettings.DisableAutoRemoveLogin)
		for (let A = C.Appearance.length - 1; A >= 0; A--)
			if (C.Appearance[A] && C.Appearance[A].Asset.RemoveAtLogin) {
				InventoryRemove(C, C.Appearance[A].Asset.Group.Name, false);
				Refresh = true;
			}

	// Dress back if there are missing appearance items
	for (let A = 0; A < AssetGroup.length; A++)
		if (!AssetGroup[A].AllowNone && (CharacterAppearanceGetCurrentValue(C, AssetGroup[A].Name, "Name") == "None"))
			for (let B = 0; B < Asset.length; B++)
				if (Asset[B].Group.Name == AssetGroup[A].Name) {
					C.Appearance.push({ Asset: Asset[B], Color: Asset[B].Group.ColorSchema[0] });
					Refresh = true;
					break;
				}

	// If we must refresh the character and push the appearance to the server
	if (Refresh) CharacterRefresh(C);

}

/**
 * Resets the character to it's default appearance
 * @param {Character} C - The character to redress to its default appearance
 * @returns {void} - Nothing
 */
function CharacterAppearanceSetDefault(C) {

	// Resets the current appearance and prepares the assets
	if (!AppearanceGroupAllowed(C, "ALL")) return;
	C.Appearance = [];
	C.Pose = [];
	if (CharacterAppearanceAssets.length == 0) CharacterAppearanceBuildAssets(C);

	// For each items in the character appearance assets
	for (let I = 0; I < CharacterAppearanceAssets.length; I++)
		if (CharacterAppearanceAssets[I].Group.IsDefault) {

			// If there's no item in a slot, the first one becomes the default
			var MustWear = true;
			for (let A = 0; A < C.Appearance.length; A++)
				if (C.Appearance[A].Asset.Group.Name == CharacterAppearanceAssets[I].Group.Name)
					MustWear = false;

			// No item, we wear it with the default color
			if (MustWear) {
				var NA = {
					Asset: CharacterAppearanceAssets[I],
					Color: CharacterAppearanceAssets[I].Group.ColorSchema[0]
				};
				C.Appearance.push(NA);
			}

		}

	// Loads the new character canvas
	CharacterLoadCanvas(C);

}

/**
 * Checks wether an item group is required for this asset
 * @param {Character} C - The character, whose assets are used for the check
 * @param {string} GroupName - The name of the group to check
 * @returns {boolean} - Returns TRUE if the item group is required from
 */
function CharacterAppearanceRequired(C, GroupName) {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset.Require != null) && (C.Appearance[A].Asset.Require.indexOf(GroupName) >= 0))
			return true;
	return false;
}

/**
 * Checks, wether the item group must be hidden for a certain asset
 * @param {Character} C - The character, whose assets are used for the check
 * @param {string} GroupName - The name of the group to check
 * @returns {boolean} - Returns TRUE if the item group must be hidden and not chosen
 */
function CharacterAppearanceMustHide(C, GroupName) {
	for (let A = 0; A < C.Appearance.length; A++) {
		if ((C.Appearance[A].Asset.Hide != null) && (C.Appearance[A].Asset.Hide.indexOf(GroupName) >= 0)) return true;
		if ((C.Appearance[A].Property != null) && (C.Appearance[A].Property.Hide != null) && (C.Appearance[A].Property.Hide.indexOf(GroupName) >= 0)) return true;
	}
	return false;
}

/**
 * Sets a full random set of items for a character. Only items that do not have the "Random" property set to false will be used.
 * @param {Character} C - The character to dress
 * @param {boolean} [ClothOnly=false] - Defines, if only clothes should be used
 * @returns {void} - Nothing
 */
function CharacterAppearanceFullRandom(C, ClothOnly=false) {

	// Clear the current appearance
	for (let A = C.Appearance.length - 1; A >= 0; A--)
		if (C.Appearance[A].Asset.Group.Category == "Appearance")
			if ((!ClothOnly || (C.Appearance[A].Asset.Group.AllowNone)) && AppearanceGroupAllowed(C, C.Appearance[A].Asset.Group.Name))
				C.Appearance.splice(A, 1);

	// For each item group (non default items only show at a 8% rate, if it can occasionally happen)
	for (let A = 0; A < AssetGroup.length; A++)
		if ((AssetGroup[A].Category == "Appearance") && (AssetGroup[A].IsDefault || (AssetGroup[A].Random && Math.random() < 0.08) || CharacterAppearanceRequired(C, AssetGroup[A].Name)) && (!CharacterAppearanceMustHide(C, AssetGroup[A].Name) || !AssetGroup[A].AllowNone) && (CharacterAppearanceGetCurrentValue(C, AssetGroup[A].Name, "Name") == "None") && AppearanceGroupAllowed(C, AssetGroup[A].Name)) {

			// Get the parent size
			var ParentSize = "";
			if (AssetGroup[A].ParentSize != "")
				ParentSize = CharacterAppearanceGetCurrentValue(C, AssetGroup[A].ParentSize, "Name");

			// Check for a parent
			var R = [];
			for (let I = 0; I < CharacterAppearanceAssets.length; I++)
				if ((CharacterAppearanceAssets[I].Group.Name == AssetGroup[A].Name) && (CharacterAppearanceAssets[I].ParentItem != null) && ((ParentSize == "") || (CharacterAppearanceAssets[I].Name == ParentSize)))
					for (let P = 0; P < C.Appearance.length; P++)
						if (C.Appearance[P].Asset.Name == CharacterAppearanceAssets[I].ParentItem)
							R.push(CharacterAppearanceAssets[I]);

			// Since there was no parent, get all the possible items
			if (R.length == 0)
				for (let I = 0; I < CharacterAppearanceAssets.length; I++)
					if ((CharacterAppearanceAssets[I].Group.Name == AssetGroup[A].Name) && CharacterAppearanceAssets[I].Random && (CharacterAppearanceAssets[I].ParentItem == null) && ((ParentSize == "") || (CharacterAppearanceAssets[I].Name == ParentSize)))
						R.push(CharacterAppearanceAssets[I]);

			// Picks a random item and color and add it
			if (R.length > 0) {
				var SelectedAsset = InventoryGetRandom(C, AssetGroup[A].Name, R);
				// If we found no asset, just move to next group
				if (!SelectedAsset)
					continue;
				/** @type {string|string[]} */
				var SelectedColor = SelectedAsset.Group.ColorSchema[Math.floor(Math.random() * SelectedAsset.Group.ColorSchema.length)];
				if ((SelectedAsset.Group.ColorSchema[0] == "Default") && (Math.random() < 0.5)) SelectedColor = "Default";
				if (SelectedAsset.Group.InheritColor != null) SelectedColor = "Default";
				else if (SelectedAsset.Group.ParentColor != "")
					if (CharacterAppearanceGetCurrentValue(C, SelectedAsset.Group.ParentColor, "Color") != "None")
						SelectedColor = CharacterAppearanceGetCurrentValue(C, SelectedAsset.Group.ParentColor, "Color");
				// Rare chance of keeping eyes of a different color
				if (SelectedAsset.Group.Name == "Eyes2" && Math.random() < 0.995)
					for (let A = 0; A < C.Appearance.length; A++)
						if (C.Appearance[A].Asset.Group.Name == "Eyes")
							SelectedColor = C.Appearance[A].Color;
				if (SelectedColor == "Default" && SelectedAsset.DefaultColor != null) SelectedColor = SelectedAsset.DefaultColor;
				/** @type {Item} */
				var NA = {
					Asset: SelectedAsset,
					Color: SelectedColor
				};
				C.Appearance.push(NA);
			}

		}

	// Refreshes the character
	CharacterRefresh(C, false);
}

/**
 * Removes all items that can be removed, making the character naked. Checks for a blocking of CosPlayItem removal.
 * @param {Character} C - The character to undress
 * @returns {void} - Nothing
 */
function CharacterAppearanceNaked(C) {

	// For each item group (non default items only show at a 20% rate)
	for (let A = C.Appearance.length - 1; A >= 0; A--)
		if (C.Appearance[A].Asset.Group.AllowNone && (C.Appearance[A].Asset.Group.Category == "Appearance") && (!C.IsOnline() || !(C.OnlineSharedSettings.BlockBodyCosplay && (C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group != null) && C.Appearance[A].Asset.Group.BodyCosplay)))
			C.Appearance.splice(A, 1);

	// Loads the new character canvas
	CharacterLoadCanvas(C);

}

/**
 * Removes one layer of clothing: outer clothes, then underwear, then body-cosplay clothes, then nothing
 * @param {Character} C - The character to undress
 * @returns {void} - Nothing
 */
function CharacterAppearanceStripLayer(C) {
	var HasClothes = false;
	var HasUnderwear = false;
	var HasBodyCosplay = false;

	// Find out what the top layer currently is
	for (let A = 0; A < C.Appearance.length; A++) {
		if (!WardrobeGroupAccessible(C, C.Appearance[A].Asset.Group)) continue;
		if (!AppearanceGroupAllowed(C, C.Appearance[A].Asset.Group.Name)) continue;
		if (C.Appearance[A].Asset.Group.BodyCosplay || C.Appearance[A].Asset.BodyCosplay) HasBodyCosplay = true;
		else if (C.Appearance[A].Asset.Group.Underwear) HasUnderwear = true;
		else if (C.Appearance[A].Asset.Group.Clothing) { HasClothes = true; break; }
	}

	// Check if there's anything to remove
	if (!HasClothes && !HasUnderwear && !HasBodyCosplay) return;

	// Ensure only the top layer is 'true'
	HasBodyCosplay = HasBodyCosplay && !HasUnderwear && !HasClothes;
	HasUnderwear = HasUnderwear && !HasClothes;

	// Remove assets from the top layer only
	var RemoveAsset = false;
	for (let A = C.Appearance.length - 1; A >= 0; A--) {
		RemoveAsset = false;
		if (!WardrobeGroupAccessible(C, C.Appearance[A].Asset.Group)) continue;
		if (!AppearanceGroupAllowed(C, C.Appearance[A].Asset.Group.Name)) continue;
		if (C.Appearance[A].Asset.Group.BodyCosplay || C.Appearance[A].Asset.BodyCosplay) {
			if (HasBodyCosplay) RemoveAsset = true;
		}
		else if (C.Appearance[A].Asset.Group.Underwear) {
			if (HasUnderwear) RemoveAsset = true;
		}
		else if (C.Appearance[A].Asset.Group.Clothing) {
			if (HasClothes) RemoveAsset = true;
		}
		if (RemoveAsset) {
			C.Appearance.splice(A, 1);
		}
	}

	// Loads the new character canvas
	CharacterLoadCanvas(C);
}

/**
 * Builds a filtered and sorted set of appearance layers, each representing a drawable layer of a character's current appearance. Layers
 * that will not be drawn (because their asset is not visible or they do not permit the current asset type) are filtered out at this stage.
 * @param {Character} C - The character to build the layers for
 * @return {AssetLayer[]} - A sorted set of layers, sorted by layer drawing priority
 */
function CharacterAppearanceSortLayers(C) {
	var groupAlphas = {};
	var layers = C.DrawAppearance.reduce((layersAcc, item) => {
		var asset = item.Asset;
		// Only include layers for visible assets
		if (asset.Visible && CharacterAppearanceVisible(C, asset.Name, asset.Group.Name) && InventoryChatRoomAllow(asset.Category)) {
			// Check if we need to draw a different variation (from type property)
			var type = (item.Property && item.Property.Type) || "";
			var layersToDraw = asset.Layer
				// Only include layers that permit the current type (if AllowTypes is not defined, also include the layer)
				.filter(layer => !layer.AllowTypes || layer.AllowTypes.includes(type))
				// Hide the layer if its HideAs proxy asset should be hidden
				.filter(layer => !layer.HideAs || CharacterAppearanceVisible(C, layer.HideAs.Asset, layer.HideAs.Group))
				// Hide the layer if it should be hidden for the current pose
				.filter(layer => !layer.HideForPose || !layer.HideForPose.includes(CommonDrawResolveAssetPose(C, asset, layer)))
				.map(layer => {
					var drawLayer = Object.assign({}, layer);
					// Store any group-level alpha mask definitions
					drawLayer.Alpha.forEach(alphaDef => {
						if ((alphaDef.Group && alphaDef.Group.length) && (!alphaDef.Type || !Array.isArray(alphaDef.Type) || alphaDef.Type.includes(type))) {
							alphaDef.Group.forEach(groupName => {
								groupAlphas[groupName] = groupAlphas[groupName] || [];
								groupAlphas[groupName].push({Pose: alphaDef.Pose, Masks: alphaDef.Masks});
							});
						}
					});
					// If the item has an OverridePriority property, it completely overrides the layer priority
					if (item.Property && typeof item.Property.OverridePriority === "number") drawLayer.Priority = item.Property.OverridePriority;
					return drawLayer;
				});
			Array.prototype.push.apply(layersAcc, layersToDraw);
		}
		return layersAcc;
	}, []);

	// Run back over the layers to apply the group-level alpha mask definitions to the appropriate layers
	layers.forEach(layer => {
		// If the layer has a HideAs proxy group name, apply those alphas rather than the actual group alphas
		const groupName = (layer.HideAs && layer.HideAs.Group) || layer.Asset.Group.Name;
		layer.GroupAlpha = [];
		if (groupAlphas[groupName]) {
			Array.prototype.push.apply(layer.GroupAlpha, groupAlphas[groupName]);
		}
	});

	return layers.sort((l1, l2) => {
		// If priorities are different, sort by priority
		if (l1.Priority !== l2.Priority) return l1.Priority - l2.Priority;
		// If the priorities are identical and the layers belong to the same Asset, ensure layer order is preserved
		if (l1.Asset === l2.Asset) return l1.Asset.Layer.indexOf(l1) - l1.Asset.Layer.indexOf(l2);
		// If priorities are identical, sort alphabetically to maintain consistency
		return (l1.Asset.Group.Name + l1.Asset.Name).localeCompare(l2.Asset.Group.Name + l2.Asset.Name);
	});
}

/**
 * Determines whether an item or a whole item group is visible or not
 * @param {Character} C - The character whose assets are checked
 * @param {string} AssetName - The name of the asset to check
 * @param {string} GroupName - The name of the item group to check
 * @param {boolean} Recursive - If TRUE, then other items which are themselves hidden will not hide this item. Parameterising this prevents
 *     infinite loops.
 * @returns {boolean} - Returns TRUE if we can show the item or the item group
 */
function CharacterAppearanceVisible(C, AssetName, GroupName, Recursive = true) {
	if (CharacterAppearanceItemIsHidden(AssetName, GroupName)) {
		C.HasHiddenItems = true;
		return false;
	}

	if (!C.DrawAppearance) C.DrawAppearance = C.Appearance;

	const assetToCheck = AssetGet(C.AssetFamily, GroupName, AssetName);
	if (assetToCheck) {
		const Pose = CommonDrawResolveAssetPose(C, assetToCheck);
		if (Pose && assetToCheck.HideForPose.includes(Pose)) return false;
	}

	for (const item of C.DrawAppearance) {
		if (CharacterAppearanceItemIsHidden(item.Asset.Name, item.Asset.Group.Name)) continue;
		let HidingItem = false;
		let HideItemExclude = InventoryGetItemProperty(item, "HideItemExclude");
		if (HideItemExclude == null) HideItemExclude = [];
		const Excluded = HideItemExclude.includes(GroupName + AssetName);
		if ((item.Asset.Hide != null) && (item.Asset.Hide.indexOf(GroupName) >= 0) && !Excluded) HidingItem = true;
		else if (!Excluded && item.Asset.HideItemAttribute.length && assetToCheck && assetToCheck.Attribute.length) {
			HidingItem = item.Asset.HideItemAttribute.some((val) => assetToCheck.Attribute.indexOf(val) !== -1);
		}
		else if ((item.Property != null) && (item.Property.Hide != null) && (item.Property.Hide.indexOf(GroupName) >= 0) && !Excluded) HidingItem = true;
		else if ((item.Asset.HideItem != null) && (item.Asset.HideItem.indexOf(GroupName + AssetName) >= 0)) HidingItem = true;
		else if ((item.Property != null) && (item.Property.HideItem != null) && (item.Property.HideItem.indexOf(GroupName + AssetName) >= 0)) HidingItem = true;
		if (HidingItem) {
			if (Recursive) {
				if (CharacterAppearanceVisible(C, item.Asset.Name, item.Asset.Group.Name, false)) {
					return false;
				}
			}
			else return false;
		}
	}

	if (C.Pose != null)
		for (let A = 0; A < C.Pose.length; A++)
			for (let P = 0; P < Pose.length; P++)
				if (Pose[P].Name === C.Pose[A])
					if ((Pose[P].Hide != null) && (Pose[P].Hide.indexOf(GroupName) >= 0))
						return false;
	return true;
}

/**
 * Determines whether the player has set this item to not appear on screen
 * @param {string} AssetName - The name of the asset to check
 * @param {string} GroupName - The name of the item group to check
 * @returns {boolean} - TRUE if the item is hidden
 */
function CharacterAppearanceItemIsHidden(AssetName, GroupName) {
	for (var H = 0; H < Player.HiddenItems.length; H++)
		if (Player.HiddenItems[H].Name == AssetName && Player.HiddenItems[H].Group == GroupName)
			return true;
	return false;
}

/**
 * Calculates and sets the height modifier which affects the character's vertical position on screen
 * @param {Character} C - The character whose height modifier must be calculated
 * @returns {void} - Nothing
 */
function CharacterAppearanceSetHeightModifiers(C) {
	if (CharacterAppearanceForceUpCharacter != C.MemberNumber) {
		let Height = 0;
		let HeightRatioProportion = 1;

		// Check if there is any setting to override the standard asset height modifiers
		let HeightOverrides = [];
		let PoseOverrides = Pose.filter(P => C.Pose != null && C.Pose.indexOf(P.Name) >= 0 && P.OverrideHeight != null).map(P => P.OverrideHeight);
		let AssetOverrides = C.DrawAppearance.filter(A => A.Asset.OverrideHeight != null).map(A => A.Asset.OverrideHeight);
		let PropertyOverrides = C.DrawAppearance.filter(A => A.Property && A.Property.OverrideHeight != null).map(A => A.Property.OverrideHeight);
		HeightOverrides = HeightOverrides.concat(PoseOverrides, AssetOverrides, PropertyOverrides);

		if (HeightOverrides.length > 0) {
			// Use the override with highest priority
			let TopOverride = HeightOverrides.reduce((a, b) => a.Priority >= b.Priority ? a : b);
			Height = TopOverride.Height || 0;
			if (TopOverride.HeightRatioProportion != null) HeightRatioProportion = TopOverride.HeightRatioProportion;
		}
		else {
			// Adjust the height based on modifiers on the assets
			for (let A = 0; A < C.DrawAppearance.length; A++)
				if (CharacterAppearanceVisible(C, C.DrawAppearance[A].Asset.Name, C.DrawAppearance[A].Asset.Group.Name)) {
					if (C.DrawAppearance[A].Property && C.DrawAppearance[A].Property.HeightModifier != null) Height += C.DrawAppearance[A].Property.HeightModifier;
					else Height += C.DrawAppearance[A].Asset.HeightModifier;
				}
		}

		// Limit values affectable by Property settings in case invalid values were set via console
		if (Height > CanvasLowerOverflow) Height = CanvasLowerOverflow;
		if (Height < -CanvasUpperOverflow) Height = -CanvasUpperOverflow;
		if (HeightRatioProportion > 1) HeightRatioProportion = 1;
		if (HeightRatioProportion < 0) HeightRatioProportion = 0;

		// Set the final modifier values for the character
		C.HeightModifier = Height;
		C.HeightRatioProportion = HeightRatioProportion;
	}

	// Set the height ratio here to avoid lookin it up when drawing. The setting can make all characters full height
	C.HeightRatio = Player.VisualSettings && Player.VisualSettings.ForceFullHeight ? 1 : CharacterAppearanceGetCurrentValue(C, "Height", "Zoom");
}

/**
 * Draws the character canvas
 * @param {Character} C - The character to draw
 * @returns {void} - Nothing
 */
function CharacterAppearanceBuildCanvas(C) {
	// Revert to 2D canvas if webgl isn't active or its context has been lost
	if (GLVersion === "No WebGL" || !GLDrawCanvas || !GLDrawCanvas.GL || GLDrawCanvas.GL.isContextLost()) {
		CommonDrawCanvasPrepare(C);
		CommonDrawAppearanceBuild(C, {
			clearRect: (x, y, w, h) => C.Canvas.getContext("2d").clearRect(x, y, w, h),
			clearRectBlink: (x, y, w, h) => C.CanvasBlink.getContext("2d").clearRect(x, y, w, h),
			drawImage: (src, x, y, alphaMasks, opacity, rotate) => DrawImageCanvas(src, C.Canvas.getContext("2d"), x, y, alphaMasks, opacity, rotate),
			drawImageBlink: (src, x, y, alphaMasks, opacity, rotate) => DrawImageCanvas(src, C.CanvasBlink.getContext("2d"), x, y, alphaMasks, opacity, rotate),
			drawImageColorize: (src, x, y, color, fullAlpha, alphaMasks, opacity, rotate) => DrawImageCanvasColorize(src, C.Canvas.getContext("2d"), x, y, 1, color, fullAlpha, alphaMasks, opacity, rotate),
			drawImageColorizeBlink: (src, x, y, color, fullAlpha, alphaMasks, opacity, rotate) => DrawImageCanvasColorize(src, C.CanvasBlink.getContext("2d"), x, y, 1, color, fullAlpha, alphaMasks, opacity, rotate),
			drawCanvas: (Img, x, y, alphaMasks) => DrawCanvas(Img, C.Canvas.getContext("2d"), x, y, alphaMasks),
			drawCanvasBlink: (Img, x, y, alphaMasks) => DrawCanvas(Img, C.CanvasBlink.getContext("2d"), x, y, alphaMasks),
		});
	} else {
		GLDrawAppearanceBuild(C);
	}
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
	AppearanceUseCharacterInPreviewsSetting = Player.VisualSettings ? Player.VisualSettings.UseCharacterInPreviews : AppearanceUseCharacterInPreviewsSetting;
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
				AppearanceMenu.push(LogQuery("Wardrobe", "PrivateRoom") ? "Wardrobe" : "WardrobeDisabled");
				if (!LogQuery("Wardrobe", "PrivateRoom") && AppearanceGroupAllowed(C, "ALL")) AppearanceMenu.push("Reset");
				if (!DialogItemPermissionMode) AppearanceMenu.push("WearRandom");
				AppearanceMenu.push("Random");
			} else AppearanceMenu.push(LogQuery("Wardrobe", "PrivateRoom") ? "Wardrobe" : "WardrobeDisabled");
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
	if (CurrentScreen != "Appearance") return true;
	if (!C.IsPlayer()) return true;
	if (Player.IsOwned() == false) return true;
	const Dict = [
		["A", "Cloth"],
		["B", "ClothAccessory"],
		["C", "Necklace"],
		["D", "Suit"],
		["E", "ClothLower"],
		["F", "SuitLower"],
		["G", "Bra"],
		["H", "Corset"],
		["I", "Panties"],
		["J", "Socks"],
		["K", "RightAnklet"],
		["L", "LeftAnklet"],
		["M", "Garters"],
		["N", "Shoes"],
		["O", "Hat"],
		["P", "HairAccessory3"],
		["Q", "HairAccessory1"],
		["R", "HairAccessory2"],
		["S", "Gloves"],
		["T", "Bracelet"],
		["U", "Glasses"],
		["V", "Mask"],
		["W", "TailStraps"],
		["X", "Wings"],
		["0", "Height"],
		["1", "BodyUpper"],
		["2", "BodyLower"],
		["3", "HairFront"],
		["4", "HairBack"],
		["5", "Eyes"],
		["6", "Eyes2"],
		["7", "Mouth"],
		["8", "Nipples"],
		["9", "Pussy"]
	];
	if (GroupName == "ALL") {
		for (let D of Dict)
			if (LogContain("BlockAppearance", "OwnerRule", D[0]))
				return false;
	} else {
		for (let D of Dict)
			if (D[1] == GroupName)
				return !LogContain("BlockAppearance", "OwnerRule", D[0]);
	}
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
	// Sets the difficulty factor
	if (DifficultyFactor == null) DifficultyFactor = 0;

	// Removes the previous if we need to
	const ID = CharacterAppearanceGetCurrentValue(C, Group, "ID");
	var ItemColor;
	if (ID != "None") {
		if (CurrentScreen == "Appearance") {
			ItemColor = CharacterAppearanceGetCurrentValue(C, Group, "Color");
			if ((ItemColor == null || ItemColor == "Default" || ItemColor == "None") && ItemAsset != null && ItemAsset.DefaultColor != null) ItemColor = ItemAsset.DefaultColor;
		}
		C.Appearance.splice(ID, 1);
	} else if (ItemAsset != null) ItemColor = ItemAsset.DefaultColor ? ItemAsset.DefaultColor : ItemAsset.Group.ColorSchema[0];

	// Add the new item to the character appearance
	if (ItemAsset != null) {
		/** @type {Item} */
		const NA = {
			Asset: ItemAsset,
			Difficulty: parseInt((ItemAsset.Difficulty == null) ? 0 : ItemAsset.Difficulty) + parseInt(DifficultyFactor),
			Color: ((NewColor == null) ? ItemColor : NewColor),
			Property: ItemAsset.CharacterRestricted ? {ItemMemberNumber: ItemMemberNumber == null ? -1 : ItemMemberNumber} : undefined
		};
		C.Appearance.push(NA);
	}

	// Draw the character canvas and calculate the effects on the character
	if (Refresh == null || Refresh) CharacterRefresh(C, false);

}

/**
 * Cycle in the appearance assets to find the next item in a group and wear it
 * @param {Character} C - The character whose assets are used
 * @param {string} Group - The name of the group to cycle
 * @param {boolean} [Forward=true] - Sets the direction of the cycling
 * @param {boolean} [Description = false] - Determines, wether the description of the item should be returned or not.
 * @returns {string} - The Description of the worn item
 */
function CharacterAppearanceNextItem(C, Group, Forward, Description) {
	var Current = CharacterAppearanceGetCurrentValue(C, Group, "Name");
	var CAA = CharacterAppearanceAssets.filter(a => a.Group.Name == Group);
	if (Description == true && CAA.length == 0) return "None";
	if (Current != "None") {
		// If we found the item we move forward or backward if possible
		var I = CAA.findIndex(a => a.Name == Current);
		if (I >= 0) {
			if (Forward == null || Forward) {
				if (I + 1 < CAA.length) {
					if (Description == true) return CAA[I + 1].Description;
					CharacterAppearanceSetItem(C, Group, CAA[I + 1]);
					return;
				}
			} else {
				if (I - 1 >= 0) {
					if (Description == true) return CAA[I - 1].Description;
					CharacterAppearanceSetItem(C, Group, CAA[I - 1]);
					return;
				}
			}
		}
	}
	// Since we didn't found any item, we pick "None" if we had an item or the first or last item
	var AG = AssetGroup.find(g => g.Name == Group);
	if (Current != "None" && AG != null && AG.AllowNone) {
		if (Description == true) return "None";
		CharacterAppearanceSetItem(C, Group, null);
	} else if (Forward == null || Forward) {
		if (Description == true) return CAA[0].Description;
		CharacterAppearanceSetItem(C, Group, CAA[0]);
	} else {
		if (Description == true) return CAA[CAA.length - 1].Description;
		CharacterAppearanceSetItem(C, Group, CAA[CAA.length - 1]);
	}
	if (Description == true) return "None";
}

/**
 * Find the next color for the item
 * @param {Character} C - The character whose items are cycled
 * @param {string} Group - The name of the group for which we are color cycling
 * @returns {void} - Nothing
 */
function CharacterAppearanceNextColor(C, Group) {

	// For each item, we first find the item and pick the next one
	let Color = CharacterAppearanceGetCurrentValue(C, Group, "Color");
	const G = AssetGroupGet(C.AssetFamily, Group);
	if (!G) return;

	// Finds the next color
	let Pos = G.ColorSchema.indexOf(Color) + 1;
	if ((Pos < 0) || (Pos >= G.ColorSchema.length)) Pos = 0;
	Color = G.ColorSchema[Pos];

	// Sets the color
	for (Pos = 0; Pos < C.Appearance.length; Pos++)
		if ((C.Appearance[Pos].Asset.Group.Name == Group) && (C.Appearance[Pos].Asset.Group.Family == C.AssetFamily)) {
			if (Color == "Default" && C.Appearance[Pos].Asset.DefaultColor != null) Color = C.Appearance[Pos].Asset.DefaultColor;
			C.Appearance[Pos].Color = Color;
		}

	// Reloads the character canvas
	CharacterLoadCanvas(C);
}

/**
 * Moves the offset to get new character appearance items
 * @param {Character} C - The character whose visible groups are used for calculation
 * @param {number} Move - The amount the next asset group should be moved before it is displayed
 * @returns {void} - Nothing
 */
function CharacterAppearanceMoveOffset(C, Move) {

	// Calculate the new offset
	CharacterAppearanceOffset = CharacterAppearanceOffset + Move;
	if (CharacterAppearanceOffset >= AssetGroup.length) CharacterAppearanceOffset = 0;
	if ((AssetGroup[CharacterAppearanceOffset].Category != "Appearance") || !AssetGroup[CharacterAppearanceOffset].AllowCustomize) CharacterAppearanceOffset = 0;
	if (CharacterAppearanceOffset < 0) CharacterAppearanceOffset = Math.floor(AssetGroup.length / CharacterAppearanceNumPerPage) * CharacterAppearanceNumPerPage;

}

/**
 * Sets the color for a specific group
 * @param {Character} C - The character whose item group should be colored
 * @param {string} Color - The color (in the format "#rrggbb") to be applied to the group
 * @param {string} Group - The name of the group, whose color should be changed
 * @returns {void} - Nothing
 */
function CharacterAppearanceSetColorForGroup(C, Color, Group) {
	for (let A = 0; A < C.Appearance.length; A++)
		if (C.Appearance[A].Asset.Group.Name == Group)
			C.Appearance[A].Color = Color;
	CharacterLoadCanvas(C);
}

/**
 * Handle the clicks in the character appearance selection screen. The function name is created dynamically.
 * @returns {void} - Nothing
 */
function AppearanceClick() {
	var C = CharacterAppearanceSelection;

	ClearButtons();
	// When there is an extended item
	if (DialogFocusItem != null) {
		CommonDynamicFunction("Inventory" + DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Click()");
	}

	// In item coloring mode
	else if (CharacterAppearanceMode == "Color") {
		ItemColorClick(CharacterAppearanceSelection, CharacterAppearanceColorPickerGroupName, 1200, 25, 775, 950, true);
	}

	// Selecting a button in the row at the top
	else if (MouseYIn(25, 90)) AppearanceMenuClick(C);

	// In regular dress-up mode
	else if (CharacterAppearanceMode == "") {

		// If we must remove/restore to default the item
		if ((MouseX >= 1210) && (MouseX < 1275) && (MouseY >= 145) && (MouseY < 975))
			for (let A = CharacterAppearanceOffset; A < AssetGroup.length && A < CharacterAppearanceOffset + CharacterAppearanceNumPerPage; A++)
				if ((AssetGroup[A].Family == C.AssetFamily) && (AssetGroup[A].Category == "Appearance") && WardrobeGroupAccessible(C, AssetGroup[A]) && AssetGroup[A].AllowNone && (InventoryGet(C, AssetGroup[A].Name) != null))
					if ((MouseY >= 145 + (A - CharacterAppearanceOffset) * 95) && (MouseY <= 210 + (A - CharacterAppearanceOffset) * 95)) 
						if (AppearanceGroupAllowed(C, AssetGroup[A].Name)) {
							InventoryRemove(C, AssetGroup[A].Name, false);
							CharacterRefresh(C, false);
						}

		// If we must enter the cloth selection mode
		if ((MouseX >= 1300) && (MouseX < 1700) && (MouseY >= 145) && (MouseY < 975)) {
			C.FocusGroup = null;
			for (let A = CharacterAppearanceOffset; A < AssetGroup.length && A < CharacterAppearanceOffset + CharacterAppearanceNumPerPage; A++)
				if ((AssetGroup[A].Family == C.AssetFamily) && (AssetGroup[A].Category == "Appearance") && WardrobeGroupAccessible(C, AssetGroup[A]))
					if (MouseYIn(145 + (A - CharacterAppearanceOffset) * 95, 65))
						if (AppearanceGroupAllowed(C, AssetGroup[A].Name)) {
							if (!AssetGroup[A].AllowNone && !AppearancePreviewUseCharacter(AssetGroup[A])) {
								CharacterAppearanceNextItem(C, AssetGroup[A].Name, MouseX > 1500);
							}
							else {
								if (MouseXIn(1300, 65)) CharacterAppearanceNextItem(C, AssetGroup[A].Name, false);
								else if (MouseXIn(1635, 65)) CharacterAppearanceNextItem(C, AssetGroup[A].Name, true);
								else {
									// Open the clothing group screen
									C.FocusGroup = AssetGroup[A];
									DialogInventoryBuild(C, null, true);
									CharacterAppearanceCloth = InventoryGet(C, C.FocusGroup.Name);
									CharacterAppearanceMode = "Cloth";
									return;
								}
							}
						}

		}

		// If we must switch to the next color in the assets
		if ((MouseX >= 1725) && (MouseX < 1885) && (MouseY >= 145) && (MouseY < 975))
			for (let A = CharacterAppearanceOffset; A < AssetGroup.length && A < CharacterAppearanceOffset + CharacterAppearanceNumPerPage; A++) {
				const Item = InventoryGet(C, AssetGroup[A].Name);
				if ((AssetGroup[A].Family == C.AssetFamily) && (AssetGroup[A].Category == "Appearance") && WardrobeGroupAccessible(C, AssetGroup[A]) && Item && (Item.Asset.ColorableLayerCount > 0 || Item.Asset.Group.ColorSchema.length > 1) && !InventoryBlockedOrLimited(C, Item))
					if ((MouseY >= 145 + (A - CharacterAppearanceOffset) * 95) && (MouseY <= 210 + (A - CharacterAppearanceOffset) * 95))
						if (AppearanceGroupAllowed(C, AssetGroup[A].Name))
							CharacterAppearanceNextColor(C, AssetGroup[A].Name);
			}

		// If we must open the color panel
		if (MouseIn(1910, 145, 65, 830))
			for (let A = CharacterAppearanceOffset; A < AssetGroup.length && A < CharacterAppearanceOffset + CharacterAppearanceNumPerPage; A++) {
				const Item = InventoryGet(C, AssetGroup[A].Name);
				if ((AssetGroup[A].Family == C.AssetFamily) && (AssetGroup[A].Category == "Appearance") && WardrobeGroupAccessible(C, AssetGroup[A]) && AssetGroup[A].AllowColorize && Item && Item.Asset.ColorableLayerCount > 0 && !InventoryBlockedOrLimited(C, Item))
					if ((MouseY >= 145 + (A - CharacterAppearanceOffset) * 95) && (MouseY <= 210 + (A - CharacterAppearanceOffset) * 95))
						if (AppearanceGroupAllowed(C, AssetGroup[A].Name))
							AppearanceItemColor(C, Item, AssetGroup[A].Name, "");
			}
		return;

	}

	// In wardrobe mode
	else if (CharacterAppearanceMode == "Wardrobe") {

		// In warehouse mode, we draw the 12 possible warehouse slots for the character to save & load
		if ((MouseX >= 1300) && (MouseX < 1800) && (MouseY >= 430) && (MouseY < 970))
			for (let W = CharacterAppearanceWardrobeOffset; W < Player.Wardrobe.length && W < CharacterAppearanceWardrobeOffset + 6; W++)
				if ((MouseY >= 430 + (W - CharacterAppearanceWardrobeOffset) * 95) && (MouseY <= 495 + (W - CharacterAppearanceWardrobeOffset) * 95)) {
					WardrobeFastLoad(C, W, false);
					ElementValue("InputWardrobeName", Player.WardrobeCharacterNames[W]);
				}
		if ((MouseX >= 1820) && (MouseX < 1975) && (MouseY >= 430) && (MouseY < 970))
			for (let W = CharacterAppearanceWardrobeOffset; W < Player.Wardrobe.length && W < CharacterAppearanceWardrobeOffset + 6; W++)
				if ((MouseY >= 430 + (W - CharacterAppearanceWardrobeOffset) * 95) && (MouseY <= 495 + (W - CharacterAppearanceWardrobeOffset) * 95)) {
					WardrobeFastSave(C, W);
					var LS = /^[a-zA-Z0-9 ]+$/;
					var Name = ElementValue("InputWardrobeName").trim();
					if (Name.match(LS) || Name.length == 0) {
						WardrobeSetCharacterName(W, Name);
						CharacterAppearanceWardrobeText = TextGet("WardrobeNameInfo");
					} else {
						CharacterAppearanceWardrobeText = TextGet("WardrobeNameError");
					}
				}
		return;

	}

	// In cloth selection mode
	else if (CharacterAppearanceMode == "Cloth") {

		// Prepares a 3x3 square of clothes to present all the possible options
		var X = 1250;
		var Y = 125;
		for (let I = DialogInventoryOffset; (I < DialogInventory.length) && (I < DialogInventoryOffset + 9); I++) {
			if ((MouseX >= X) && (MouseX < X + 225) && (MouseY >= Y) && (MouseY < Y + 275)) {
				var Item = DialogInventory[I];
				const CurrentItem = InventoryGet(C, C.FocusGroup.Name);
				const worn = (CurrentItem && (CurrentItem.Asset.Name == Item.Asset.Name));

				// In permission mode, we toggle the settings for an item
				if (DialogItemPermissionMode) {
					DialogInventoryTogglePermission(Item, worn);
				} else {
					if (InventoryBlockedOrLimited(C, Item)) return;
					if (InventoryAllow(C, Item.Asset)) {
						if (worn && CurrentItem.Asset.Extended) {
							DialogExtendItem(CurrentItem);
						} else {
							CharacterAppearanceSetItem(C, C.FocusGroup.Name, DialogInventory[I].Asset);
							DialogInventoryBuild(C, DialogInventoryOffset);
							AppearanceMenuBuild(C);
						}
					} else {
						CharacterAppearanceHeaderTextTime = DialogTextDefaultTimer;
						CharacterAppearanceHeaderText = DialogText;
					}
				}
				return;
			}
			X = X + 250;
			if (X > 1800) {
				X = 1250;
				Y = Y + 300;
			}
		}

	}
}

/**
 * Handles the Click events for the top-row buttons in the Appearance screen
 * @param {Character} C - The character the appearance is being set for
 * @returns {void} - Nothing
 */
function AppearanceMenuClick(C) {
	const X = 2000 - AppearanceMenu.length * 117;
	for (let B = 0; B < AppearanceMenu.length; B++) {
		if (MouseXIn(X + 117 * B, 90)) {
			let Button = AppearanceMenu[B];
			switch (CharacterAppearanceMode) {
				case "":
					if (Button === "Reset") CharacterAppearanceSetDefault(C);
					if (Button === "Wardrobe") CharacterAppearanceWardrobeLoad(C);
					if (Button === "WearRandom") CharacterAppearanceFullRandom(C, true);
					if (Button === "Random") CharacterAppearanceFullRandom(C);
					if (Button === "Naked") CharacterAppearanceStripLayer(C);
					if (Button === "Character")  AppearanceUseCharacterInPreviewsSetting = !AppearanceUseCharacterInPreviewsSetting;
					if (Button === "Next") CharacterAppearanceMoveOffset(C, CharacterAppearanceNumPerPage);
					if (Button === "Cancel") CharacterAppearanceExit(C);
					if (Button === "Accept") CharacterAppearanceReady(C);
					if (Button === "WardrobeDisabled") CharacterAppearanceHeaderText = TextGet("WardrobeDisabled");
					break;
				case "Wardrobe":
					switch (Button) {
						case "Prev":
							CharacterAppearanceWardrobeOffset -= 6;
							if (CharacterAppearanceWardrobeOffset < 0) CharacterAppearanceWardrobeOffset = Math.max(0, Player.Wardrobe.length - 6);
							break;
						case "Next":
							CharacterAppearanceWardrobeOffset += 6;
							if (CharacterAppearanceWardrobeOffset >= Player.Wardrobe.length) CharacterAppearanceWardrobeOffset = 0;
							break;
						case "Naked":
							CharacterAppearanceStripLayer(C);
							break;
						case "Cancel":
							CharacterAppearanceRestore(C, CharacterAppearanceInProgressBackup);
							CharacterRefresh(C, false);
							CharacterAppearanceWardrobeName = "";
							CharacterAppearanceInProgressBackup = null;
							AppearanceExit();
							break;
						case "Accept":
							CharacterAppearanceWardrobeName = ElementValue("InputWardrobeName");
							CharacterAppearanceInProgressBackup = null;
							AppearanceExit();
							break;
					}
					break;
				case "Cloth":
					// Extends the current item
					if (Button === "Use") {
						var Item = InventoryGet(C, C.FocusGroup.Name);
						if (Item && Item.Asset.Extended) DialogExtendItem(Item);
					}

					// Picks and colors a random item from the group
					if (Button === "WearRandom") InventoryWearRandom(C, C.FocusGroup.Name, null, true, true);

					// Opens permission mode
					if (Button === "DialogPermissionMode") {
						DialogItemPermissionMode = true;
						DialogInventoryBuild(C);
					}

					// Strips the current item
					if (Button === "Naked") CharacterAppearanceSetItem(C, C.FocusGroup.Name, null);

					// Jumps to the cloth page
					if (Button === "Next") {
						DialogInventoryOffset = DialogInventoryOffset + 9;
						if (DialogInventoryOffset >= DialogInventory.length) DialogInventoryOffset = 0;
					}

					// Opens the color picker
					if (Button === "ColorPick" || Button === "MultiColorPick") {
						let Item = InventoryGet(C, C.FocusGroup.Name);
						AppearanceItemColor(C, Item, C.FocusGroup.Name, "Cloth");
					}

					// Cancels the selected cloth and reverts it back
					if (Button === "Cancel") {
						CharacterAppearanceSetItem(C, C.FocusGroup.Name, ((CharacterAppearanceCloth != null) && (CharacterAppearanceCloth.Asset != null)) ? CharacterAppearanceCloth.Asset : null, ((CharacterAppearanceCloth != null) && (CharacterAppearanceCloth.Color != null)) ? CharacterAppearanceCloth.Color : null);
						if (CharacterAppearanceCloth != null && CharacterAppearanceCloth.Property != null) {
							InventoryGet(C, C.FocusGroup.Name).Property = CharacterAppearanceCloth.Property;
							CharacterRefresh(C, false);
						}
						if (AppearancePreviewUseCharacter(C.FocusGroup)) AppearancePreviewCleanup();
						AppearanceExit();
					}

					// Accepts the new selection
					if (Button === "Accept") {
						if (DialogItemPermissionMode) {
							DialogItemPermissionMode = false;
							AppearanceMenuBuild(C);
							DialogInventoryBuild(C);
						}
						else {
							if (AppearancePreviewUseCharacter(C.FocusGroup)) AppearancePreviewCleanup();
							AppearanceExit();
						}
					}

					// Rebuild the menu buttons as selecting a button here can change what should appear
					AppearanceMenuBuild(C);

					break;
			}
		}
	}
}

/**
 * Handle the exiting of the appearance screen. The function name is created dynamically.
 * @returns {void} - Nothing
 */
function AppearanceExit() {
	// We quit the extended item menu instead, if applicable.
	if (CharacterAppearanceMode == "Cloth" && DialogFocusItem) {
		DialogLeaveFocusItem();
		return;
	}

	if (CharacterAppearanceMode === "Color") {
		return ItemColorExitClick();
	}

	if (CharacterAppearanceMode != "") {
		CharacterAppearanceMode = "";
		CharacterAppearanceHeaderText = "";
		ElementRemove("InputWardrobeName");
	} else CharacterAppearanceExit(CharacterAppearanceSelection);

	CharacterAppearanceSelection.FocusGroup = null;
}

/**
 * Restore the characters appearance backup, if the exit button is clicked
 * @param {Character} C - The character, whose appearance backup should be used
 * @returns {void} - Nothing
 */
function CharacterAppearanceExit(C) {
	ElementRemove("InputWardrobeName");
	CharacterAppearanceMode = "";
	CharacterAppearanceRestore(C, CharacterAppearanceBackup);
	CharacterLoadCanvas(C);
	if (C.AccountName != "") CommonSetScreen(CharacterAppearanceReturnModule, CharacterAppearanceReturnRoom);
	else CommonSetScreen("Character", "Login");
	CharacterAppearanceReturnRoom = "MainHall";
	CharacterAppearanceReturnModule = "Room";
	CharacterAppearanceHeaderText = "";
	AppearancePreviewCleanup();
	CharacterAppearanceWardrobeName = "";
	if (Player.VisualSettings && AppearanceUseCharacterInPreviewsSetting !== Player.VisualSettings.UseCharacterInPreviews) {
		Player.VisualSettings.UseCharacterInPreviews = AppearanceUseCharacterInPreviewsSetting;
		ServerAccountUpdate.QueueData({ VisualSettings: Player.VisualSettings });
	}
}

/**
 * Handle the confirmation click in the wardrobe screen.
 * @param {Character} C - The character who has been changed
 * @returns {void} - Nothing
 */
function CharacterAppearanceReady(C) {
	// Exits wardrobe mode
	ElementRemove("InputWardrobeName");
	CharacterAppearanceMode = "";
	CharacterAppearanceHeaderText = "";

	// If there's no error, we continue to the login or main hall if already logged
	if (C.AccountName != "") {
		ServerPlayerAppearanceSync();
		if ((CharacterAppearanceReturnRoom == "ChatRoom") && (C.ID != 0)) {
			var Dictionary = [];
			Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
			Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
			ServerSend("ChatRoomChat", { Content: "ChangeClothes", Type: "Action", Dictionary: Dictionary });
			ChatRoomCharacterUpdate(C);
		}
		CommonSetScreen(CharacterAppearanceReturnModule, CharacterAppearanceReturnRoom);
		CharacterAppearanceReturnRoom = "MainHall";
		CharacterAppearanceReturnModule = "Room";
		if (Player.VisualSettings && AppearanceUseCharacterInPreviewsSetting !== Player.VisualSettings.UseCharacterInPreviews) {
			Player.VisualSettings.UseCharacterInPreviews = AppearanceUseCharacterInPreviewsSetting;
			ServerAccountUpdate.QueueData({ VisualSettings: Player.VisualSettings });
		}
	} else CommonSetScreen("Character", "Creation");

}

/**
 * Copy the appearance from a character to another
 * @param {Character} FromC - The character to copy from
 * @param {Character} ToC - The character to copy to
 */
function CharacterAppearanceCopy(FromC, ToC) {

	// Removes any previous appearance asset
	for (let A = ToC.Appearance.length - 1; A >= 0; A--)
		if ((ToC.Appearance[A].Asset != null) && (ToC.Appearance[A].Asset.Group.Category == "Appearance")) {
			ToC.Appearance.splice(A, 1);
		}

	// Adds all appearance assets from the first character to the second
	for (let A = 0; A < FromC.Appearance.length; A++)
		if ((FromC.Appearance[A].Asset != null) && (FromC.Appearance[A].Asset.Group.Category == "Appearance"))
			ToC.Appearance.push(FromC.Appearance[A]);

	// Refreshes the second character and saves it if it's the player
	CharacterRefresh(ToC);
	if (ToC.ID == 0) ServerPlayerAppearanceSync();

}

/**
 * Loads the appearance editing screen for a character
 * @param {Character} C - The character for whom the appearance screen should be loaded
 * @returns {void} - nothing
 */
function CharacterAppearanceLoadCharacter(C) {
	CharacterAppearanceSelection = C;
	CharacterAppearanceReturnRoom = CurrentScreen;
	CharacterAppearanceReturnModule = CurrentModule;
	if (CharacterAppearanceReturnRoom == "ChatRoom") {
		ChatRoomStatusUpdate("Wardrobe");
	}
	CommonSetScreen("Character", "Appearance");
}

/**
 * Load wardrobe menu in appearance selection screen
 * @param {Character} C - The character whose wardrobe should be loaded
 * @returns {void} - Nothing
 */
function CharacterAppearanceWardrobeLoad(C) {
	if ((Player.Wardrobe == null) || (Player.Wardrobe.length < 12))
		WardrobeLoadCharacters(true);
	else
		WardrobeLoadCharacterNames();
	ElementCreateInput("InputWardrobeName", "text", CharacterAppearanceWardrobeName || C.Name, "20");
	CharacterAppearanceMode = "Wardrobe";
	// Always open the wardrobe on the first page
	CharacterAppearanceWardrobeOffset = 0;
	CharacterAppearanceWardrobeText = TextGet("WardrobeNameInfo");
	CharacterAppearanceInProgressBackup = CharacterAppearanceStringify(C);
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
	return JSON.stringify(Item, (key, value) => {
		if (key === "Asset") {
			return value.Group.Family + "/" + value.Group.Name + "/" + value.Name;
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
	return JSON.parse(stringified, (key, value) => {
		if (key === "Asset") {
			const FGA = value.split("/");
			return AssetGet(FGA[0], FGA[1], FGA[2]);
		}
		return value;
	});
}

/**
 * Opens the color picker for a selected item
 * @param {Character} C - The character the appearance is being changed for
 * @param {Item} Item - The currently selected item
 * @param {string} AssetGroup - The focused group
 * @param {string} CurrentMode - The mode to revert to on exiting the color picker
 * @returns {void}
 */
function AppearanceItemColor(C, Item, AssetGroup, CurrentMode) {
	// Keeps the previous color in backup and creates a text box to enter the color
	CharacterAppearanceMode = "Color";
	CharacterAppearanceColorPickerGroupName = AssetGroup;
	CharacterAppearanceColorPickerBackup = CharacterAppearanceGetCurrentValue(C, CharacterAppearanceColorPickerGroupName, "Color");
	ItemColorLoad(C, Item, 1200, 25, 775, 950, true);
	ItemColorOnExit(() => {
		CharacterAppearanceMode = CurrentMode;
		if (AppearancePreviewUseCharacter(C.FocusGroup)) {
			const item = InventoryGet(C, C.FocusGroup.Name);
			const isDifferentColor = item && CharacterAppearanceColorPickerBackup !== item.Color;
			const isRemoved = !item && CharacterAppearanceColorPickerBackup !== "None";
			if (isDifferentColor || isRemoved) {
				AppearancePreviewBuild(C, true);
			}
		}
	});
}

/**
 * Combine two sets of appearance changes from the same base, favouring the newer changes where conflicting
 * @param {Item[]} BaseAppearance - The previous appearance before either of the other two sets of changes were made
 * @param {Item[]} PrevAppearance - The first set of appearance changes
 * @param {Item[]} NewAppearance - The second set of appearance changes, overriding any conflicts with the first
 * @returns {Item[]} - The final merged appearance
 */
function CharacterAppearanceResolveAppearance(BaseAppearance, PrevAppearance, NewAppearance) {
	for (const group of AssetGroup) {
		if (group.Category == "Appearance") {
			const baseItem = BaseAppearance.find(A => A.Asset.Group.Name == group.Name);
			const prevItem = PrevAppearance.find(A => A.Asset.Group.Name == group.Name);
			const newItem = NewAppearance.find(A => A.Asset.Group.Name == group.Name);
			const resolvedItem = CharacterAppearanceResolveItem(baseItem, prevItem, newItem);

			// Remove and replace the group's item
			PrevAppearance = PrevAppearance.filter(A => A.Asset.Group.Name !== group.Name);
			if (resolvedItem) {
				PrevAppearance = PrevAppearance.concat(resolvedItem);
			}
		}
	}

	return PrevAppearance;
}

/**
 * Select from two potential changes to an item, preferring the newer if different to the original item
 * @param {Item} BaseItem - The item before any changes were made
 * @param {Item} PrevItem - The first item change
 * @param {Item} NewItem - The second item change
 * @return {Item} - The item to keep
 */
function CharacterAppearanceResolveItem(BaseItem, PrevItem, NewItem) {
	if (BaseItem == null) {
		// Add the new item if added, otherwise use the previous item whether one was added or still empty
		return NewItem || PrevItem;
	} else if (NewItem == null) {
		// Remove the item if the newest change removed it
		return NewItem;
	} else if (AppearanceItemStringify(BaseItem) != AppearanceItemStringify(NewItem)) {
		// Use the newest item if changed from the original at all. In future could possibly compare/merge settings instead
		return NewItem;
	} else {
		// Otherwise keep the previous change
		return PrevItem;
	}
}

/**
 * Merge the incoming appearance changes from the online sync to the currently selected appearance
 * @param {Character} C - The character with changes to merge
 * @param {Item[]} currentAppearance - The appearance before the sync's changes are applied
 * @returns {void} - Nothing
 */
function CharacterAppearanceResolveSync(C, currentAppearance) {
	if (CurrentScreen == "Appearance" && C.ID == CharacterAppearanceSelection.ID) {
		const baseAppearance = AppearanceItemParse(CharacterAppearanceBackup);

		// Update the individual clothing item to revert to upon exiting the group's menu
		if (CharacterAppearanceCloth != null) {
			const baseCloth = baseAppearance.find(A => A.Asset.Group.Name == CharacterAppearanceCloth.Asset.Group.Name);
			const incomingCloth = C.Appearance.find(A => A.Asset.Group.Name == CharacterAppearanceCloth.Asset.Group.Name);
			CharacterAppearanceCloth = CharacterAppearanceResolveItem(baseCloth, incomingCloth, CharacterAppearanceCloth);
		}

		// Update the appearance backup to use the synced version
		CharacterAppearanceBackup = AppearanceItemStringify(C.Appearance);
		// Merge the synced appearance with the ongoing appearance edits
		C.Appearance = CharacterAppearanceResolveAppearance(baseAppearance, C.Appearance, currentAppearance);
	}
}
