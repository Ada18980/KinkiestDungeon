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
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "Panties", Layer: "Panties", Pri: -30,
			Invariant: true,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
		},
	])
});
AddModel({
	Name: "ElfTop",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Underwear", "Tops"],
	Layers: ToLayerMap([
		{ Name: "Chest", Layer: "ShirtChest", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
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
	Categories: ["Underwear"],
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
		{ Name: "Collar", Layer: "Collar", Pri: 35,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});
AddModel(GetModelRestraintVersion("ElfCollar", true));


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