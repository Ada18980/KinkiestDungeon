/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "MiniCape",
	Folder: "RobeOfChastity",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Cape", Layer: "Cape", Pri: 35,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
		},
	])
});



AddModel({
	Name: "Epaulettes",
	Folder: "RobeOfChastity",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Pauldrons", Layer: "Shoulders", Pri: 8,
			Poses: ToMapSubtract([...ARMPOSES], [...HIDEARMPOSES, "Up"]),
			MorphPoses: {Yoked: "Yoked", Wristtie: "Tied", Boxtie: "Tied", Front: "Tied", Crossed: "Tied"},
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "TheRobeOfChastity",
	Folder: "RobeOfChastity",
	Parent: "RobeOfChastity",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Base", Layer: "BodysuitOver", Pri: 90,
			Poses: ToMap([...LEGPOSES]),
			InheritColor: "Lines",
			HideWhenOverridden: true,
		},
		{ Name: "ChestBase", Layer: "SuitChestOver", Pri: 90,
			//Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Lines",
			HideWhenOverridden: true,
		},
		{ Name: "Frill", Layer: "BodysuitOver", Pri: 90,
			Poses: ToMap([...LEGPOSES]),
			InheritColor: "Frill",
			TieToLayer: "Base",
			NoOverride: true,
		},
		{ Name: "ChestFrill", Layer: "SuitChestOver", Pri: 89.9,
			//Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Frill",
			TieToLayer: "ChestBase",
			NoOverride: true,
		},
		{ Name: "Gold", Layer: "BodysuitOver", Pri: 89.9,
			Poses: ToMap([...LEGPOSES]),
			InheritColor: "Gold",
			TieToLayer: "Base",
			NoOverride: true,
		},
		{ Name: "ChestGold", Layer: "SuitChestOver", Pri: 89.9,
			//Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Gold",
			TieToLayer: "ChestBase",
			NoOverride: true,
		},
		{ Name: "Plate", Layer: "BodysuitOver", Pri: 89.9,
			Poses: ToMap([...LEGPOSES]),
			InheritColor: "Plate",
			TieToLayer: "Base",
			NoOverride: true,
		},
		{ Name: "ChestPlate", Layer: "SuitChestOver", Pri: 89.9,
			//Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "ChestPlate",
			TieToLayer: "ChestBase",
			NoOverride: true,
		},
		{ Name: "GoldBase", Layer: "BodysuitOver", Pri: 89.8,
			Poses: ToMap([...LEGPOSES]),
			InheritColor: "GoldBase",
			TieToLayer: "Base",
			NoOverride: true,
		},
		{ Name: "ChestGoldBase", Layer: "SuitChestOver", Pri: 89.8,
			//Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "GoldBase",
			TieToLayer: "ChestBase",
			NoOverride: true,
		},
		{ Name: "Fabric", Layer: "BodysuitOver", Pri: 89.8,
			Poses: ToMap([...LEGPOSES]),
			InheritColor: "Fabric",
			TieToLayer: "Base",
			NoOverride: true,
		},
		{ Name: "ChestFabric", Layer: "SuitChestOver", Pri: 89.8,
			//Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			InheritColor: "Fabric",
			TieToLayer: "ChestBase",
			NoOverride: true,
		},

		...GetModelLayers("MiniCape"),
		...GetModelLayers("Epaulettes"),


	])
});


AddModel(GetModelRestraintVersion("TheRobeOfChastity", true));

