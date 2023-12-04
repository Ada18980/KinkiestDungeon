/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "Swimsuit",
	Folder: "Swimsuit",
	Parent: "Swimsuit",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Swimsuit", Layer: "Bodysuit", Pri: 5,
			SwapLayerPose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			Poses: ToMap([...LEGPOSES]),
		},
		{ Name: "SwimsuitChest", Layer: "SuitChest", Pri: 5,
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Swimsuit",
		},
	])
});


AddModel({
	Name: "StrappyBra",
	Folder: "Swimsuit",
	Parent: "StrappySwimsuit",
	TopLevel: true,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "ChestStrappy", Layer: "SuitChest", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "Bra",
		},
	])
});

AddModel({
	Name: "VBikini",
	Folder: "Swimsuit",
	Parent: "StrappySwimsuit",
	TopLevel: true,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "VBikini", Layer: "Panties", Pri: 39,
			Invariant: true,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
			MorphPoses: {Closed: "Closed", Hogtie: "Closed"},
		},
	])
});

AddModel({
	Name: "StrappyBikini",
	Folder: "Swimsuit",
	Parent: "StrappySwimsuit",
	TopLevel: true,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "StrappyLower", Layer: "Panties", Pri: 40,
			Invariant: true,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
		},
	])
});

AddModel({
	Name: "StrappyHarness",
	Folder: "Swimsuit",
	Parent: "StrappySwimsuit",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "Strappy", Layer: "Bodysuit", Pri: 40,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
		},
	])
});


AddModel({
	Name: "StrappySwimsuit",
	Folder: "Swimsuit",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		...GetModelLayers("StrappyBra"),
		...GetModelLayers("StrappyHarness"),
		...GetModelLayers("StrappyBikini"),
	])
});



AddModel({
	Name: "BunnySockLeft",
	Folder: "Bunny",
	Parent: "BunnySocks",
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: -1,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
	])
});
AddModel({
	Name: "BunnySockRight",
	Folder: "Bunny",
	Parent: "BunnySocks",
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: 1.5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});

AddModel({
	Name: "BunnySocks",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("BunnySockRight"),
		...GetModelLayers("BunnySockLeft"),
	])
});

AddModel(GetModelRestraintVersion("BunnySocks", true));



AddModel({
	Name: "BunnyGloveLeft",
	Folder: "Bunny",
	Parent: "Bunny",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "GloveLeft", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "ForeGloveLeft", Layer: "ForeGloveLeft", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
		},
	])
});

AddModel({
	Name: "BunnyGloveRight",
	Folder: "Bunny",
	Parent: "Bunny",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "GloveRight", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "ForeGloveRight", Layer: "ForeGloveRight", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
		},
	])
});

AddModel({
	Name: "BunnyGloves",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("BunnyGloveLeft"),
		...GetModelLayers("BunnyGloveRight"),
	])
});

AddModel(GetModelRestraintVersion("BunnyGloves", true));

AddModel({
	Name: "BunnyLeotard",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "Bodysuit", Pri: -1,
			SwapLayerPose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			Poses: ToMap([...LEGPOSES]),
		},
		{ Name: "LeotardChest", Layer: "SuitChest", Pri: 1.5,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Leotard",
		},
	])
});

AddModel({
	Name: "Bunny",
	Folder: "Bunny",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("BunnyLeotard"),
		...GetModelLayers("BunnyGloves"),
		...GetModelLayers("BunnySocks"),
	])
});
