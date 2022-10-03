//@ts-check
"use strict";

/** @type {Asset[]} */
var Asset = [];
/** @type {AssetGroup[]} */
var AssetGroup = [];
/** @type {Map<string, Asset>} */
var AssetMap = new Map();
/** @type {Map<string, AssetGroup>} */
var AssetGroupMap = new Map();
/** @type {Pose[]} */
var Pose = [];
/** @type {Map<string, AssetGroup[]>} */
var AssetActivityMirrorGroups = new Map();

/**
 * Adds a new asset group to the main list
 * @param {IAssetFamily} Family
 * @param {AssetGroupDefinition} GroupDef
 * @returns {AssetGroup}
 */
function AssetGroupAdd(Family, GroupDef) {
	/** @type {AssetGroup} */
	var A = {
		Family: Family,
		Name: GroupDef.Group,
		Description: GroupDef.Group,
		Asset: [],
		ParentGroupName: (GroupDef.ParentGroup == null) ? "" : GroupDef.ParentGroup,
		Category: (GroupDef.Category == null) ? "Appearance" : GroupDef.Category,
		IsDefault: (GroupDef.Default == null) ? true : GroupDef.Default,
		IsRestraint: (GroupDef.IsRestraint == null) ? false : GroupDef.IsRestraint,
		AllowNone: (GroupDef.AllowNone == null) ? true : GroupDef.AllowNone,
		AllowColorize: (GroupDef.AllowColorize == null) ? true : GroupDef.AllowColorize,
		AllowCustomize: (GroupDef.AllowCustomize == null) ? true : GroupDef.AllowCustomize,
		Random: (GroupDef.Random == null) ? true : GroupDef.Random,
		ColorSchema: (GroupDef.Color == null) ? ["Default"] : GroupDef.Color,
		ParentSize: (GroupDef.ParentSize == null) ? "" : GroupDef.ParentSize,
		ParentColor: (GroupDef.ParentColor == null) ? "" : GroupDef.ParentColor,
		Clothing: (GroupDef.Clothing == null) ? false : GroupDef.Clothing,
		Underwear: (GroupDef.Underwear == null) ? false : GroupDef.Underwear,
		BodyCosplay: (GroupDef.BodyCosplay == null) ? false : GroupDef.BodyCosplay,
		Hide: GroupDef.Hide,
		Block: GroupDef.Block,
		Zone: GroupDef.Zone,
		SetPose: GroupDef.SetPose,
		AllowPose: Array.isArray(GroupDef.AllowPose) ? GroupDef.AllowPose : [],
		AllowExpression: GroupDef.AllowExpression,
		Effect: Array.isArray(GroupDef.Effect) ? GroupDef.Effect : [],
		MirrorGroup: (GroupDef.MirrorGroup == null) ? "" : GroupDef.MirrorGroup,
		RemoveItemOnRemove: (GroupDef.RemoveItemOnRemove == null) ? [] : GroupDef.RemoveItemOnRemove,
		DrawingPriority: (GroupDef.Priority == null) ? AssetGroup.length : GroupDef.Priority,
		DrawingLeft: (GroupDef.Left == null) ? 0 : GroupDef.Left,
		DrawingTop: (GroupDef.Top == null) ? 0 : GroupDef.Top,
		DrawingFullAlpha: (GroupDef.FullAlpha == null) ? true : GroupDef.FullAlpha,
		DrawingBlink: (GroupDef.Blink == null) ? false : GroupDef.Blink,
		InheritColor: GroupDef.InheritColor,
		FreezeActivePose: Array.isArray(GroupDef.FreezeActivePose) ? GroupDef.FreezeActivePose : [],
		PreviewZone: GroupDef.PreviewZone,
		DynamicGroupName: GroupDef.DynamicGroupName || GroupDef.Group,
		MirrorActivitiesFrom: GroupDef.MirrorActivitiesFrom || null,
		ColorSuffix: GroupDef.ColorSuffix,
	};
	AssetGroupMap.set(A.Name, A);
	AssetActivityMirrorGroupSet(A);
	AssetGroup.push(A);
	return A;
}

/**
 * Collects the group equivalence classes defined by the MirrorActivitiesFrom property into a map for easy access to
 * mirror group sets (i.e. all groups that are mirror activities from, or are mirrored by, each other).
 * @param {AssetGroup} group - The group to register
 */
function AssetActivityMirrorGroupSet(group) {
	if (group.MirrorActivitiesFrom) {
		const mirrorGroups = AssetActivityMirrorGroups.get(group.MirrorActivitiesFrom);
		if (mirrorGroups) {
			mirrorGroups.push(group);
			AssetActivityMirrorGroups.set(group.Name, mirrorGroups);
			return;
		}
	}
	AssetActivityMirrorGroups.set(group.Name, [group]);
}

/**
 * Adds a new asset to the main list
 * @param {AssetGroup} Group
 * @param {AssetDefinition} AssetDef
 * @param {ExtendedItemConfig} ExtendedConfig
 * @returns {void} - Nothing
 */
function AssetAdd(Group, AssetDef, ExtendedConfig) {
	/** @type {Asset} */
	var A = Object.assign({
		Name: AssetDef.Name,
		Description: AssetDef.Name,
		Group: Group,
		ParentItem: AssetDef.ParentItem,
		ParentGroupName: AssetDef.ParentGroup,
		Enable: (AssetDef.Enable == null) ? true : AssetDef.Enable,
		Visible: (AssetDef.Visible == null) ? true : AssetDef.Visible,
		Wear: (AssetDef.Wear == null) ? true : AssetDef.Wear,
		Activity: (typeof AssetDef.Activity === "string" ? AssetDef.Activity : null),
		AllowActivity: Array.isArray(AssetDef.AllowActivity) ? AssetDef.AllowActivity : [],
		AllowActivityOn: Array.isArray(AssetDef.AllowActivityOn) ? AssetDef.AllowActivityOn : [],
		BuyGroup: AssetDef.BuyGroup,
		PrerequisiteBuyGroups: AssetDef.PrerequisiteBuyGroups,
		Effect: (AssetDef.Effect == null) ? Group.Effect : AssetDef.Effect,
		Bonus: AssetDef.Bonus,
		Block: (AssetDef.Block == null) ? Group.Block : AssetDef.Block,
		Expose: (AssetDef.Expose == null) ? [] : AssetDef.Expose,
		Hide: (AssetDef.Hide == null) ? Group.Hide : AssetDef.Hide,
		HideItem: AssetDef.HideItem,
		HideItemExclude: AssetDef.HideItemExclude || [],
		HideItemAttribute: AssetDef.HideItemAttribute || [],
		Require: AssetDef.Require,
		SetPose: (AssetDef.SetPose == null) ? Group.SetPose : AssetDef.SetPose,
		AllowActivePose: AssetDef.AllowActivePose,
		WhitelistActivePose: AssetDef.WhitelistActivePose,
		Value: (AssetDef.Value == null) ? 0 : AssetDef.Value,
		Difficulty: (AssetDef.Difficulty == null) ? 0 : AssetDef.Difficulty,
		SelfBondage: (AssetDef.SelfBondage == null) ? 0 : AssetDef.SelfBondage,
		SelfUnlock: (AssetDef.SelfUnlock == null) ? true : AssetDef.SelfUnlock,
		ExclusiveUnlock: (AssetDef.ExclusiveUnlock == null) ? false : AssetDef.ExclusiveUnlock,
		Random: (AssetDef.Random == null) ? true : AssetDef.Random,
		RemoveAtLogin: (AssetDef.RemoveAtLogin == null) ? false : AssetDef.RemoveAtLogin,
		WearTime: (AssetDef.Time == null) ? 0 : AssetDef.Time,
		RemoveTime: (AssetDef.RemoveTime == null) ? ((AssetDef.Time == null) ? 0 : AssetDef.Time) : AssetDef.RemoveTime,
		RemoveTimer: (AssetDef.RemoveTimer == null) ? 0 : AssetDef.RemoveTimer,
		MaxTimer: (AssetDef.MaxTimer == null) ? 0 : AssetDef.MaxTimer,
		DrawingPriority: AssetDef.Priority,
		DrawingLeft: AssetDef.Left,
		DrawingTop: AssetDef.Top,
		HeightModifier: (AssetDef.Height == null) ? 0 : AssetDef.Height,
		ZoomModifier: (AssetDef.Zoom == null) ? 1 : AssetDef.Zoom,
		Alpha: AssetDef.Alpha,
		Prerequisite: AssetDef.Prerequisite,
		Extended: (AssetDef.Extended == null) ? false : AssetDef.Extended,
		AlwaysExtend: (AssetDef.AlwaysExtend == null) ? false : AssetDef.AlwaysExtend,
		AlwaysInteract: (AssetDef.AlwaysInteract == null) ? false : AssetDef.AlwaysInteract,
		AllowLock: typeof AssetDef.AllowLock === "boolean" ? AssetDef.AllowLock : false,
		LayerVisibility: (AssetDef.LayerVisibility == null) ? false : AssetDef.LayerVisibility,
		IsLock: (AssetDef.IsLock == null) ? false : AssetDef.IsLock,
		PickDifficulty: (AssetDef.PickDifficulty == null) ? 0 : AssetDef.PickDifficulty,
		OwnerOnly: (AssetDef.OwnerOnly == null) ? false : AssetDef.OwnerOnly,
		LoverOnly: (AssetDef.LoverOnly == null) ? false : AssetDef.LoverOnly,
		ExpressionTrigger: AssetDef.ExpressionTrigger,
		RemoveItemOnRemove: (AssetDef.RemoveItemOnRemove == null) ? Group.RemoveItemOnRemove : Group.RemoveItemOnRemove.concat(AssetDef.RemoveItemOnRemove),
		AllowEffect: AssetDef.AllowEffect,
		AllowBlock: AssetDef.AllowBlock,
		AllowType: AssetDef.AllowType,
		DefaultColor: AssetDef.DefaultColor,
		Opacity: AssetParseOpacity(AssetDef.Opacity),
		MinOpacity: typeof AssetDef.MinOpacity === "number" ? AssetParseOpacity(AssetDef.MinOpacity) : 1,
		MaxOpacity: typeof AssetDef.MaxOpacity === "number" ? AssetParseOpacity(AssetDef.MaxOpacity) : 1,
		Audio: AssetDef.Audio,
		Category: AssetDef.Category,
		Fetish: AssetDef.Fetish,
		ArousalZone: (AssetDef.ArousalZone == null) ? Group.Name : AssetDef.ArousalZone,
		IsRestraint: (AssetDef.IsRestraint == null) ? ((Group.IsRestraint == null) ? false : Group.IsRestraint) : AssetDef.IsRestraint,
		BodyCosplay: (AssetDef.BodyCosplay == null) ? Group.BodyCosplay : AssetDef.BodyCosplay,
		OverrideBlinking: (AssetDef.OverrideBlinking == null) ? false : AssetDef.OverrideBlinking,
		DialogSortOverride: AssetDef.DialogSortOverride,
		// @ts-ignore: this has no type, because we are in JS file
		DynamicDescription: (typeof AssetDef.DynamicDescription === 'function') ? AssetDef.DynamicDescription : function () { return this.Description; },
		DynamicPreviewImage: (typeof AssetDef.DynamicPreviewImage === 'function') ? AssetDef.DynamicPreviewImage : function () { return ""; },
		DynamicAllowInventoryAdd: (typeof AssetDef.DynamicAllowInventoryAdd === 'function') ? AssetDef.DynamicAllowInventoryAdd : function () { return true; },
		// @ts-ignore: this has no type, because we are in JS file
		DynamicExpressionTrigger: (typeof AssetDef.DynamicExpressionTrigger === 'function') ? AssetDef.DynamicExpressionTrigger : function () { return this.ExpressionTrigger; },
		// @ts-ignore: this has no type, because we are in JS file
		DynamicName: (typeof AssetDef.DynamicName === 'function') ? AssetDef.DynamicName : function () { return this.Name; },
		DynamicGroupName: (AssetDef.DynamicGroupName || Group.DynamicGroupName),
		DynamicActivity: (typeof AssetDef.DynamicActivity === 'function') ? AssetDef.DynamicActivity : function () { return AssetDef.Activity; },
		DynamicAudio: (typeof AssetDef.DynamicAudio === 'function') ? AssetDef.DynamicAudio : null,
		CharacterRestricted: typeof AssetDef.CharacterRestricted === 'boolean' ? AssetDef.CharacterRestricted : false,
		AllowRemoveExclusive: typeof AssetDef.AllowRemoveExclusive === 'boolean' ? AssetDef.AllowRemoveExclusive : false,
		InheritColor: AssetDef.InheritColor,
		DynamicBeforeDraw: (typeof AssetDef.DynamicBeforeDraw === 'boolean') ? AssetDef.DynamicBeforeDraw : false,
		DynamicAfterDraw: (typeof AssetDef.DynamicAfterDraw === 'boolean') ? AssetDef.DynamicAfterDraw : false,
		DynamicScriptDraw: (typeof AssetDef.DynamicScriptDraw === 'boolean') ? AssetDef.DynamicScriptDraw : false,
		HasType: (typeof AssetDef.HasType === 'boolean') ? AssetDef.HasType : true,
		AllowLockType: AssetDef.AllowLockType,
		AllowColorizeAll: typeof AssetDef.AllowColorizeAll === "boolean" ? AssetDef.AllowColorizeAll : true,
		AvailableLocations: AssetDef.AvailableLocations || [],
		OverrideHeight: AssetDef.OverrideHeight,
		FreezeActivePose: Array.isArray(AssetDef.FreezeActivePose) ? AssetDef.FreezeActivePose :
			Array.isArray(Group.FreezeActivePose) ? Group.FreezeActivePose : [],
		DrawLocks: typeof AssetDef.DrawLocks === "boolean" ? AssetDef.DrawLocks : true,
		AllowExpression: AssetDef.AllowExpression,
		MirrorExpression: AssetDef.MirrorExpression,
		FixedPosition: typeof AssetDef.FixedPosition === "boolean" ? AssetDef.FixedPosition : false,
		Layer: [],
		ColorableLayerCount: 0,
		CustomBlindBackground: typeof AssetDef.CustomBlindBackground === 'string' ? AssetDef.CustomBlindBackground : undefined,
		FuturisticRecolor: typeof AssetDef.FuturisticRecolor === 'boolean' ? AssetDef.FuturisticRecolor : false,
		FuturisticRecolorDisplay: typeof AssetDef.FuturisticRecolorDisplay === 'boolean' ? AssetDef.FuturisticRecolorDisplay : false,
		Attribute: AssetDef.Attribute || [],
		PreviewIcons: AssetDef.PreviewIcons || [],
		PoseMapping: AssetDef.PoseMapping || {},
		Tint: Array.isArray(AssetDef.Tint) ? AssetDef.Tint : [],
		AllowTint: Array.isArray(AssetDef.Tint) && AssetDef.Tint.length > 0,
		DefaultTint: typeof AssetDef.DefaultTint === "string" ? AssetDef.DefaultTint : undefined,
		CraftGroup: typeof AssetDef.CraftGroup === "string" ? AssetDef.CraftGroup : AssetDef.Name,
		ColorSuffix: Group.ColorSuffix,
	}, AssetParsePoseProperties(AssetDef, Group.AllowPose.slice()));

	// Ensure opacity value is valid
	if (A.MinOpacity > A.Opacity) A.MinOpacity = A.Opacity;
	if (A.MaxOpacity < A.Opacity) A.MaxOpacity = A.Opacity;

	A.Layer = AssetBuildLayer(AssetDef, A);
	AssetAssignColorIndices(A);
	// Unwearable assets are not visible but can be overwritten
	if (!A.Wear && AssetDef.Visible != true) A.Visible = false;
	Group.Asset.push(A);
	AssetMap.set(Group.Name + "/" + A.Name, A);
	Asset.push(A);
	if (ExtendedConfig) AssetBuildExtended(A, ExtendedConfig);
}

/**
 * Constructs extended item functions for an asset, if extended item configuration exists for the asset.
 * @param {Asset} A - The asset to configure
 * @param {ExtendedItemConfig} ExtendedConfig - The extended item configuration object for the asset's family
 * @returns {void} - Nothing
 */
function AssetBuildExtended(A, ExtendedConfig) {
	let AssetConfig = AssetFindExtendedConfig(ExtendedConfig, A.Group.Name, A.Name);

	if (!AssetConfig) {
		return;
	}

	if (AssetConfig.CopyConfig) {
		const Overrides = AssetConfig.Config;
		const { GroupName, AssetName } = AssetConfig.CopyConfig;
		AssetConfig = AssetFindExtendedConfig(ExtendedConfig, GroupName || A.Group.Name, AssetName);
		if (!AssetConfig) {
			console.error(`CopyConfig ${GroupName || A.Group.Name}:${AssetName} not found for ${A.Group.Name}:${A.Name}`);
			return;
		}
		if (Overrides) {
			const MergedConfig = Object.assign({}, AssetConfig.Config, Overrides);
			AssetConfig = Object.assign({}, AssetConfig, {Config: MergedConfig});
		}
	}

	switch (AssetConfig.Archetype) {
		case ExtendedArchetype.MODULAR:
			ModularItemRegister(A, AssetConfig.Config);
			break;
		case ExtendedArchetype.TYPED:
			TypedItemRegister(A, AssetConfig.Config);
			break;
		case ExtendedArchetype.VIBRATING:
			VibratorModeRegister(A, AssetConfig.Config);
			break;
		case ExtendedArchetype.VARIABLEHEIGHT:
			VariableHeightRegister(A, AssetConfig.Config, AssetConfig.Config ? AssetConfig.Config.Property : undefined);
			break;
	}
	A.Archetype = AssetConfig.Archetype;
}

/**
 * Finds the extended item configuration for the provided group and asset name, if any exists
 * @param {ExtendedItemConfig} ExtendedConfig - The full extended item configuration object
 * @param {string} GroupName - The name of the asset group to find extended configuration for
 * @param {string} AssetName - The name of the asset to find extended configuration fo
 * @returns {AssetArchetypeConfig | undefined} - The extended asset configuration object for the specified asset, if
 * any exists, or undefined otherwise
 */
function AssetFindExtendedConfig(ExtendedConfig, GroupName, AssetName) {
	const GroupConfig = ExtendedConfig[GroupName] || {};
	return GroupConfig[AssetName];
}

/**
 * Builds the layer array for an asset based on the asset definition. One layer is created for each drawable part of
 * the asset (excluding the lock). If the asset definition contains no layer definitions, a default layer definition
 * will be created.
 * @param {AssetDefinition} AssetDefinition - The raw asset definition
 * @param {Asset} A - The built asset
 * @return {AssetLayer[]} - An array of layer objects representing the drawable layers of the asset
 */
function AssetBuildLayer(AssetDefinition, A) {
	var Layers = Array.isArray(AssetDefinition.Layer) ? AssetDefinition.Layer : [{}];
	return Layers.map((Layer, I) => AssetMapLayer(Layer, AssetDefinition, A, I));
}

/**
 * Maps a layer definition to a drawable layer object
 * @param {AssetLayerDefinition} Layer - The raw layer definition
 * @param {AssetDefinition} AssetDefinition - The raw asset definition
 * @param {Asset} A - The built asset
 * @param {number} I - The index of the layer within the asset
 * @return {AssetLayer} - A Layer object representing the drawable properties of the given layer
 */
function AssetMapLayer(Layer, AssetDefinition, A, I) {
	/** @type {AssetLayer} */
	const L = Object.assign({
		Name: Layer.Name || null,
		AllowColorize: AssetLayerAllowColorize(Layer, AssetDefinition, A.Group),
		CopyLayerColor: Layer.CopyLayerColor || null,
		ColorGroup: Layer.ColorGroup,
		HideColoring: typeof Layer.HideColoring === "boolean" ? Layer.HideColoring : false,
		AllowTypes: Array.isArray(Layer.AllowTypes) ? Layer.AllowTypes : null,
		ModuleType: Array.isArray(Layer.ModuleType) ? Layer.ModuleType : null,
		Visibility: typeof Layer.Visibility === "string" ? Layer.Visibility : null,
		HasType: typeof Layer.HasType === "boolean" ? Layer.HasType : A.HasType,
		ParentGroupName: Layer.ParentGroup,
		Priority: Layer.Priority || AssetDefinition.Priority || A.Group.DrawingPriority,
		InheritColor: Layer.InheritColor,
		Alpha: AssetLayerAlpha(Layer, AssetDefinition, I),
		Asset: A,
		DrawingLeft: Layer.Left,
		DrawingTop: Layer.Top,
		HideAs: Layer.HideAs,
		FixedPosition: typeof Layer.FixedPosition === "boolean" ? Layer.FixedPosition : false,
		HasImage: typeof Layer.HasImage === "boolean" ? Layer.HasImage : true,
		Opacity: typeof Layer.Opacity === "number" ? AssetParseOpacity(Layer.Opacity) : 1,
		MinOpacity: typeof Layer.MinOpacity === "number" ? AssetParseOpacity(Layer.Opacity) : A.MinOpacity,
		MaxOpacity: typeof Layer.MaxOpacity === "number" ? AssetParseOpacity(Layer.Opacity) : A.MaxOpacity,
		LockLayer: typeof Layer.LockLayer === "boolean" ? Layer.LockLayer : false,
		MirrorExpression: Layer.MirrorExpression,
		AllowModuleTypes: Layer.AllowModuleTypes,
		ColorIndex: 0,
		PoseMapping: Layer.PoseMapping || A.PoseMapping,
	}, AssetParsePoseProperties(
		Layer,
		Array.isArray(A.AllowPose) ? A.AllowPose.slice() : null)
	);
	if (L.MinOpacity > L.Opacity) L.MinOpacity = L.Opacity;
	if (L.MaxOpacity < L.Opacity) L.MaxOpacity = L.Opacity;
	return L;
}

/**
 * Resolves the AllowPose and HideForPose properties on a layer or an asset
 * @param {Asset | AssetLayerDefinition} obj - The asset or layer object
 * @param {string[] | null} defaultAllowPose - A fallback value for the AllowPose property if it's not defined on the
 * object
 * @return {{AllowPose: string[] | null, HideForPose: string[]}} - A partial object containing AllowPose and HideForPose
 * properties
 */
function AssetParsePoseProperties(obj, defaultAllowPose = null) {
	const HideForPose = Array.isArray(obj.HideForPose) ? obj.HideForPose : [];
	let AllowPose = Array.isArray(obj.AllowPose) ? obj.AllowPose : defaultAllowPose;
	if (HideForPose.length > 0) {
		// Automatically add any entries from HideForPose into AllowPose
		AllowPose = AllowPose || [];
		CommonArrayConcatDedupe(AllowPose, HideForPose);
	}
	return {AllowPose, HideForPose};
}

/**
 * Parses and validates asset's opacity
 * @param {number|undefined} opacity
 * @returns {number}
 */
function AssetParseOpacity(opacity) {
	if (typeof opacity === "number" && !isNaN(opacity)) {
		return Math.max(0, Math.min(1, opacity));
	}
	return 1;
}

/**
 * Determines whether a layer can be colorized, based on the layer definition and its parent asset/group definitions
 * @param {AssetLayerDefinition} Layer - The raw layer definition
 * @param {AssetDefinition} NewAsset - The raw asset definition
 * @param {AssetGroup} Group - The group being processed
 * @return {boolean} - Whether or not the layer should be permit colors
 */
function AssetLayerAllowColorize(Layer, NewAsset, Group) {
	return typeof Layer.AllowColorize === "boolean" ? Layer.AllowColorize :
		typeof NewAsset.AllowColorize === "boolean" ? NewAsset.AllowColorize :
			typeof Group.AllowColorize === "boolean" ? Group.AllowColorize : true;
}

/**
 * Builds the alpha mask definitions for a layer, based on the
 * @param {AssetLayerDefinition} Layer - The raw layer definition
 * @param {AssetDefinition} NewAsset - The raw asset definition
 * @param {number} I - The index of the layer within its asset
 * @return {AlphaDefinition[]} - a list of alpha mask definitions for the layer
 */
function AssetLayerAlpha(Layer, NewAsset, I) {
	var Alpha = Layer.Alpha || [];
	// If the layer is the first layer for an asset, add the asset's alpha masks
	if (I === 0 && NewAsset.Alpha && NewAsset.Alpha.length) {
		Array.prototype.push.apply(Alpha, NewAsset.Alpha);
	}
	return Alpha;
}

/**
 * Assigns color indices to the layers of an asset. These determine which colors get applied to the layer. Also adds
 * a count of colorable layers to the asset definition.
 * @param {Asset} A - The built asset
 * @returns {void} - Nothing
 */
function AssetAssignColorIndices(A) {
	var colorIndex = 0;
	/** @type {Record<string, number>} */
	var colorMap = {};
	A.Layer.forEach(Layer => {
		// If the layer can't be colored, we don't need to set a color index
		if (!Layer.AllowColorize) return;

		var LayerKey = Layer.CopyLayerColor || Layer.Name;
		if (LayerKey === undefined)
			LayerKey = "undefined";
		if (LayerKey === null)
			LayerKey = "null";
		if (typeof colorMap[LayerKey] === "number") {
			Layer.ColorIndex = colorMap[LayerKey];
		} else {
			Layer.ColorIndex = colorMap[LayerKey] = colorIndex;
			colorIndex++;
		}
	});
	A.ColorableLayerCount = colorIndex;
}

/**
 * Builds the asset description from the CSV file
 * @param {IAssetFamily} Family
 * @param {string[][]} CSV
 */
function AssetBuildDescription(Family, CSV) {

	/** @type {Map<string, string>} */
	const map = new Map();

	for (const line of CSV) {
		if (Array.isArray(line) && line.length === 3) {
			if (map.has(`${line[0]}:${line[1]}`)) {
				console.warn("Duplicate Asset Description: ", line);
			}
			map.set(`${line[0]}:${line[1]}`, line[2].trim());
		} else {
			console.warn("Bad Asset Description line: ", line);
		}
	}

	// For each asset group in family
	for (const G of AssetGroup) {
		if (G.Family !== Family)
			continue;

		const res = map.get(`${G.Name}:`);
		if (res === undefined) {
			G.Description = `MISSING ASSETGROUP DESCRIPTION: ${G.Name}`;
		} else {
			G.Description = res;
		}
	}

	// For each asset in the family
	for (const A of Asset) {
		if (A.Group.Family !== Family)
			continue;

		const res = map.get(`${A.Group.Name}:${A.Name}`);
		if (res === undefined) {
			A.Description = `MISSING ASSET DESCRIPTION: ${A.Group.Name}:${A.Name}`;
		} else {
			A.Description = res;
		}
	}

	// Translates the descriptions to a foreign language
	TranslationAsset(Family);

}

/**
 * Loads the description of the assets in a specific language
 * @param {IAssetFamily} Family The asset family to load the description for
 */
function AssetLoadDescription(Family) {

	// Finds the full path of the CSV file to use cache
	var FullPath = "Assets/" + Family + "/" + Family + ".csv";
	if (CommonCSVCache[FullPath]) {
		AssetBuildDescription(Family, CommonCSVCache[FullPath]);
		return;
	}

	// Opens the file, parse it and returns the result it to build the dialog
	CommonGet(FullPath, function () {
		if (this.status == 200) {
			CommonCSVCache[FullPath] = CommonParseCSV(this.responseText);
			AssetBuildDescription(Family, CommonCSVCache[FullPath]);
		}
	});

}

/**
 * Loads a specific asset file
 * @param {AssetGroupDefinition[]} Groups
 * @param {IAssetFamily} Family
 * @param {ExtendedItemConfig} ExtendedConfig
 */
function AssetLoad(Groups, Family, ExtendedConfig) {

	// For each group in the asset file
	for (const group of Groups) {
		// Creates the asset group
		const G = AssetGroupAdd(Family, group);

		// Add each assets in the group 1 by 1
		for (const asset of group.Asset) {
			if (typeof asset === "string")
				AssetAdd(G, { Name: asset }, ExtendedConfig);
			else
				AssetAdd(G, asset, ExtendedConfig);
		}
	}

	// Loads the description of the assets in a specific language
	AssetLoadDescription(Family);

}

// Reset and load all the assets
function AssetLoadAll() {
	Asset = [];
	AssetGroup = [];
	AssetLoad(AssetFemale3DCG, "Female3DCG", AssetFemale3DCGExtended);
	Pose = PoseFemale3DCG;
}

/**
 * Gets a specific asset by family/group/name
 * @param {string} Family - The family to search in (Ignored until other family is added)
 * @param {string} Group - Name of the group of the searched asset
 * @param {string} Name - Name of the searched asset
 * @returns {Asset|null}
 */
function AssetGet(Family, Group, Name) {
	return AssetMap.get(Group + "/" + Name) || null;
}

/**
 * Gets all activities on a family and name
 * @param {string} family - The family to search in
 * @returns {Activity[]}
 */
function AssetAllActivities(family) {
	if (family == "Female3DCG")
		return ActivityFemale3DCG;
	return [];
}

/**
 * Gets an activity asset by family and name
 * @param {string} family - The family to search in
 * @param {string} name - Name of activity to search for
 * @returns {Activity|undefined}
 */
function AssetGetActivity(family, name) {
	return AssetAllActivities(family).find(a => (a.Name === name));
}

/**
 * Get the list of all activities on a group for a given family.
 *
 * @description Note that this just returns activities as defined, no checks are
 * actually done on whether the activity makes sense.
 *
 * @param {string} family
 * @param {string} groupname
 * @param {"self" | "other" | "any"} onSelf
 * @returns {Activity[]}
 */
function AssetActivitiesForGroup(family, groupname, onSelf = "other") {
	const activities = AssetAllActivities(family);
	/** @type {Activity[]} */
	const defined = [];
	activities.forEach(a => {
		/** @type {string[] | undefined} */
		let targets;
		// Get the correct target list
		if (onSelf === "self") {
			targets = (typeof a.TargetSelf === "boolean" ? a.Target : a.TargetSelf);
		} else if (onSelf === "any") {
			targets = a.Target;
			if (Array.isArray(a.TargetSelf))
				targets = targets.concat(a.TargetSelf);
		} else {
			targets = a.Target;
		}
		if (targets && targets.includes(groupname))
			defined.push(a);
	});
	return defined;
}

/**
 * Cleans the given array of assets of any items that no longer exists
 * @param {Array.<{Name: string, Group: string}>} AssetArray - The arrays of items to clean
 * @returns {Array.<{Name: string, Group: string}>} - The cleaned up array
 */
function AssetCleanArray(AssetArray) {
	return AssetArray.filter(({ Group, Name }) => AssetGet('Female3DCG', Group, Name) != null);
}

/**
 * Gets an asset group by the asset family name and group name
 * @param {string} Family - The asset family that the group belongs to (Ignored until other family is added)
 * @param {string} Group - The name of the asset group to find
 * @returns {AssetGroup|null} - The asset group matching the provided family and group name
 */
function AssetGroupGet(Family, Group) {
	return AssetGroupMap.get(Group) || null;
}

/**
 * Utility function for retrieving the preview image directory path for an asset
 * @param {Asset} A - The asset whose preview path to retrieve
 * @returns {string} - The path to the asset's preview image directory
 */
function AssetGetPreviewPath(A) {
	return `Assets/${A.Group.Family}/${A.DynamicGroupName}/Preview`;
}

/**
 * Utility function for retrieving the base path of an asset's inventory directory, where extended item scripts are
 * held
 * @param {Asset} A - The asset whose inventory path to retrieve
 * @returns {string} - The path to the asset's inventory directory
 */
function AssetGetInventoryPath(A) {
	return `Screens/Inventory/${A.DynamicGroupName}/${A.Name}`;
}
