/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "SwimsuitUnder",
	Folder: "Swimsuit",
	Parent: "Swimsuit",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Swimsuit", Layer: "Bodysuit", Pri: 5,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
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
	Name: "Swimsuit",
	Folder: "Swimsuit",
	Parent: "Swimsuit",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Swimsuit", Layer: "BodysuitOver", Pri: 5,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			Poses: ToMap([...LEGPOSES]),
		},
		{ Name: "SwimsuitChest", Layer: "SuitChestOver", Pri: 5,
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Swimsuit",
		},
	])
});

AddModel(GetModelRestraintVersion("Swimsuit", true));


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
			//swaplayerpose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
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
			MorphPoses: {Closed: "Closed"},
			//swaplayerpose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
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
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		/*{ Name: "LegSockLeft", Layer: "BodysuitLower", Pri: 80,
			NoOverride: true,
			TieToLayer: "SockLeft",
			InheritColor: "SockLeft",
			Poses: ToMap([...STANDPOSES, "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},*/
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
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		/*{ Name: "LegSockRight", Layer: "BodysuitLower", Pri: 80,
			NoOverride: true,
			TieToLayer: "SockRight",
			InheritColor: "SockRight",
			Poses: ToMap([...STANDPOSES, "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},*/
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
	Name: "BunnyLeotardUnder",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "Bodysuit", Pri: -1,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			MorphPoses: {Closed: "Closed"}
		},
		{ Name: "LeotardChest", Layer: "SuitChest", Pri: 1.5,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Leotard",
		},
	])
});
AddModel({
	Name: "BunnyLeotardHighUnder",
	Folder: "Bunny",
	Parent: "BunnyLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "HighLeotard", Layer: "Bodysuit", Pri: -0.9,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			MorphPoses: {Closed: "Closed"}
		},
		{ Name: "LeotardChest", Layer: "SuitChest", Pri: 1.6,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Leotard",
		},
	])
});


AddModel({
	Name: "BunnyLeotard",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "BodysuitOver", Pri: -1,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			MorphPoses: {Closed: "Closed"}
		},
		{ Name: "LeotardChest", Layer: "SuitChestOver", Pri: 1.5,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Leotard",
		},
	])
});
AddModel({
	Name: "BunnyLeotardHigh",
	Folder: "Bunny",
	Parent: "BunnyLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "HighLeotard", Layer: "BodysuitOver", Pri: -0.9,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			MorphPoses: {Closed: "Closed"}
		},
		{ Name: "LeotardChest", Layer: "SuitChestOver", Pri: 1.6,
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



AddModel({
	Name: "LeatherLeotardTop",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "LeotardChest", Layer: "SuitChestOver", Pri: 45,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Leather",
		},
	])
});
AddModel({
	Name: "LeatherLeotardBottom",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "BodysuitOver", Pri: 30,
			InheritColor: "Leather",
			MorphPoses: {Closed: "Closed"}
		},
	])
});
AddModel({
	Name: "LeatherLeotardCorset",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "LeotardCorset", Layer: "Bustier", Pri: -20,
			InheritColor: "Corset",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
			NoOverride: true,
		},
		{ Name: "Laces", Layer: "BodysuitOver", Pri: 30.1,
			InheritColor: "Laces",
			TieToLayer: "Leotard",
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "LeatherLeotard",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherLeotardTop"),
		...GetModelLayers("LeatherLeotardBottom"),
		...GetModelLayers("LeatherLeotardCorset"),
	])
});


AddModel({
	Name: "LeatherLeotardStrapsUpper",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "StrapsChest", Layer: "SuitChestOver", Pri: 45.1,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Straps",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "LeatherLeotardStrapsLower",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "StrapsLower", Layer: "BodysuitOver", Pri: 30.1,
			InheritColor: "Straps",
			NoOverride: true,
			MorphPoses: {Closed: "Closed"}
		},
		{ Name: "StrapsHardware", Layer: "BodysuitOver", Pri: 30.2,
			InheritColor: "Hardware",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "LeatherLeotardStrapsLowerClean",
	Folder: "LeatherLeotard",
	Parent: "LeatherLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "StrapsLowerClean", Layer: "BodysuitOver", Pri: 30.1,
			InheritColor: "Straps",
			NoOverride: true,
			MorphPoses: {Closed: "Closed"}
		},
		{ Name: "StrapsHardware", Layer: "BodysuitOver", Pri: 30.2,
			InheritColor: "Hardware",
			NoOverride: true,
		},
	])
});

