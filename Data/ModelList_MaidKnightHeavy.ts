/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "HeavyMaidKnight_Dress",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
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
	Name: "HeavyMaidKnight_ApronBottom",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Apron",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Apron", Layer: "BeltDeco", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
		},
		{ Name: "ApronBelt", Layer: "Belt", Pri: 14,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
		{ Name: "ApronMiniBow", Layer: "BeltDeco", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronCross", Layer: "BeltDeco", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronStripe", Layer: "BeltDeco", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronPattern", Layer: "BeltDeco", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},

	])
});

AddModel({
	Name: "HeavyMaidKnight_ApronTop",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Apron",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "ApronChest", Layer: "ChestDeco", Pri: -30,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "ApronChestRuffles", Layer: "ChestDeco", Pri: -29.9,
			InheritColor: "TopRuffles",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			NoOverride: true,
			TieToLayer: "ApronChest",
			MorphPoses: {
				Free: "Free",
				Boxtie: "Boxtie",
				Wristtie: "Boxtie",
				Crossed: "Crossed",
				Front: "Front",
				Yoked: "Yoked",
				Up: "Up",
			},
		},
		{ Name: "ApronChestBelts", Layer: "ChestDeco", Pri: -29.8,
			InheritColor: "TopBelts",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			NoOverride: true,
			TieToLayer: "ApronChest",
			MorphPoses: {
				Up: "Up",
			},
		},


	])
});

AddModel({
	Name: "HeavyMaidKnight_Apron",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_ApronTop"),
		...GetModelLayers("HeavyMaidKnight_ApronBottom"),

	])
});



AddModel({
	Name: "HeavyMaidKnight_WaistBelts",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Waist",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Belts", Layer: "Belt", Pri: 25,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "BeltsHardware", Layer: "Belt", Pri: 25.1,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
			TieToLayer: "Belts",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "HeavyMaidKnight_WaistPouches",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Waist",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Pouches", Layer: "BeltDeco", Pri: 35,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_Waist",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_WaistPouches"),
		...GetModelLayers("HeavyMaidKnight_WaistBelts"),

	])
});

