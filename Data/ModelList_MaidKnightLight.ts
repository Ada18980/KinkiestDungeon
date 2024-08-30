/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "LightMaidKnight_Dress",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Tops", "Dresses", "Skirts"],
	//RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "Dress", Layer: "Shirt", Pri: 1,
			InheritColor: "Dress",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			DisplaceAmount: 125,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "TightUpperSquish",
			DisplacementInvariant: true,
			Invariant: true,
		},
		{ Name: "DressChest", Layer: "ShirtChest", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			InheritColor: "Dress",
			MorphPoses: {Front: "Boxtie", Crossed: "Boxtie"},
		},
		{ Name: "DressSkirt", Layer: "OverSkirt", Pri: 2,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			HidePoses: ToMap(["EncaseTorsoLower"]),
			InheritColor: "Skirt",
		},
		{ Name: "DressDeco", Layer: "OverSkirt", Pri: 2.1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			NoOverride: true,
			TieToLayer: "DressSkirt",
		},
		{ Name: "DressDecoBack", Layer: "OverSkirt", Pri: 2.1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			NoOverride: true,
			TieToLayer: "DressSkirt",
		},
	])
});




AddModel({
	Name: "LightMaidKnight_Bra",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight_Dress",
	TopLevel: true,
	Categories: ["Bras"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "DressChest", Layer: "BraChest", Pri: -30,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			//Invariant: true,
		},

	])
});

AddModel({
	Name: "LightMaidKnight_Top",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight_Dress",
	TopLevel: true,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "DressChest", Layer: "ShirtChest", Pri: 25,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "LightMaidKnight_SleeveLeft",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight_Dress",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "SleeveLeft", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "ForeArmLeft", Layer: "ForeSleeveLeft", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveLeft"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},

	])
});

AddModel({
	Name: "LightMaidKnight_SleeveRight",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight_Dress",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "SleeveRight", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
			EraseSprite: "LightMaidRightArmErase",
			EraseLayers: {MaidArmPoofRight: true},
			EraseAmount: 100,
			EraseZBonus: 8600,
			EraseInvariant: true,
		},
		{ Name: "ForeArmRight", Layer: "ForeSleeveRight", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveRight"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "ShoulderRight", Layer: "UpSleeveRight", Pri: 60,
			HideWhenOverridden: true,
			InheritColor: "SleeveRight",
			Poses: ToMap([...SHOULDERPOSES]),
		},
	])
});


AddModel({
	Name: "LightMaidKnight_Sleeves",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight_Dress",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("LightMaidKnight_SleeveLeft"),
		...GetModelLayers("LightMaidKnight_SleeveRight"),
	])
});