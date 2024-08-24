/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "ElfPanties",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		{ Name: "Panties", Layer: "Panties", Pri: -30,
			Invariant: true,
			//swaplayerpose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
		},
	])
});
AddModel({
	Name: "ElfTop",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Underwear", "Panties", "Tops"],
	Layers: ToLayerMap([
		{ Name: "Chest", Layer: "ShirtChest", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["ShirtCutoffBra"]),
		},
		{ Name: "Bra", Layer: "Shirt", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
		},
	])
});
AddModel({
	Name: "ElfBra",
	Folder: "Elf",
	Parent: "ElfTop",
	TopLevel: false,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		{ Name: "Chest", Layer: "BraChest", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
		},
		{ Name: "Bra", Layer: "Bra", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
		},
	])
});

AddModel({
	Name: "ElfCollar",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 15,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "ElfCollarRestraint",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: -10,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "CollarHardware", Layer: "CollarRing", Pri: -5,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "Collar",
			NoOverride: true,
			HidePoses: {HideModuleMiddle: true},
		},
	])
});


AddModel({
	Name: "ElfCirclet",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Accessories", "Hairstyles"],
	Layers: ToLayerMap([
		{ Name: "Circlet", Layer: "Circlet", Pri: 20,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Gem", Layer: "Circlet", Pri: 20.1,
			Sprite: "CircletGem",
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Circlet",
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "ElfSkirtBack",
	Folder: "Elf",
	Parent: "ElfSkirt",
	TopLevel: false,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "SkirtBack", Layer: "SkirtBack", Pri: -100,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
		},
	])
});

AddModel({
	Name: "ElfSkirt",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 100,
			//swaplayerpose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			Invariant: true,
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
		},
		{ Name: "SkirtBand", Layer: "Skirt", Pri: 99.9,
			Invariant: true,
			TieToLayer: "Skirt", NoOverride: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
		},
		{ Name: "SkirtBack", Layer: "SkirtBack", Pri: -100,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			TieToLayer: "Skirt", NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
		},
	])
});


AddModel({
	Name: "Sandals",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidShoes", undefined, undefined, undefined, -7),
	])
});

AddModel({
	Name: "ElfShoes",
	Folder: "Elf",
	Parent: "Sandals",
	TopLevel: false,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		...GetModelLayers("Sandals", undefined, undefined, undefined, -7),
		{ Name: "CrystalShoeLeft", Layer: "ShoeLeft", Pri: -6,
			Poses: ToMap(["Closed", "Spread"]),
			HideWhenOverridden: true,
			TieToLayer: "ShoeLeft", NoOverride: true,
		},
		{ Name: "CrystalShoeRight", Layer: "ShoeRight", Pri: 6,
			Poses: ToMap(["Closed", "Spread"]),
			HideWhenOverridden: true,
			TieToLayer: "ShoeRight", NoOverride: true,
		},
	])
});



AddModel({
	Name: "ElfBandLeft",
	Folder: "Elf",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Accessories"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		{ Name: "BandLeft", Layer: "BindElbowLeft", Pri: -100,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			DisplacementSprite: "ElbowCuffLeft",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 50,
		},
	])
});
AddModel({
	Name: "ElfBandRight",
	Folder: "Elf",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Accessories"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		{ Name: "BandRight", Layer: "BindElbowRight", Pri: -100,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			MorphPoses: {Crossed: "Front", Front: "Front"},
			DisplacementSprite: "ElbowCuffRight",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 100,
		},
	])
});

AddModel({
	Name: "ElfBands",
	Folder: "Elf",
	TopLevel: true,
	Parent: "Elf",
	Categories: ["Accessories"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ElfBandLeft"),
		...GetModelLayers("ElfBandRight"),
	])
});



AddModel({
	Name: "Elf",
	Folder: "Elf",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("ElfSkirt"),
		...GetModelLayers("ElfTop"),
		...GetModelLayers("ElfBands"),
		...GetModelLayers("ElfCirclet"),
		...GetModelLayers("ElfShoes"),
		...GetModelLayers("ElfPanties"),
		...GetModelLayers("ElfCollar"),
	])
});