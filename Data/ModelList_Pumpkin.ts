/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "PumpkinBra",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "Bra", Layer: "BraChest", Pri: 35,
			Invariant: true,
			InheritColor: "Leaf",
			Sprite: "LeafBra",
			NoOverride: true,
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
		{ Name: "VineBra", Layer: "BraChest", Pri: 35.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Vine",
			TieToLayer: "Bra",
		},
		{ Name: "LeafBraDeco", Layer: "BraChestDeco", Pri: 35,
			Invariant: true,
			InheritColor: "LeafUpper",
			NoOverride: true,
		},
		{ Name: "VineBraDeco", Layer: "BraChestDeco", Pri: 35.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "VineUpper",
			TieToLayer: "Bra",
		},
		{ Name: "VineUnderbust", Layer: "Bra", Pri: 35,
			Invariant: true,
			NoOverride: true,
			InheritColor: "VineLower",
		},
	])
});
AddModel(GetModelRestraintVersion("PumpkinBra", false));

AddModel({
	Name: "PumpkinPanties",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		{ Name: "LeafPanties", Layer: "Panties", Pri: 25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Leaf",
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"}
		},
		{ Name: "VinePanties", Layer: "Panties", Pri: 24.8,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Vine",
			TieToLayer: "LeafPanties",
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"}
		},
	])
});
AddModel(GetModelRestraintVersion("PumpkinPanties", false));


AddModel({
	Name: "PumpkinFlower",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "HeadFlower", Layer: "Hat", Pri: 5,
			Invariant: true,
			InheritColor: "Flower",
			NoOverride: true,
			HideWhenOverridden: true,
		},
	])
});
AddModel({
	Name: "PumpkinNecklace",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "LeafCollar", Layer: "Collar", Pri: -20,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Leaf",
		},
		{ Name: "VineCollar", Layer: "Collar", Pri: -19.7,
			Invariant: true,
			InheritColor: "Leaf",
			NoOverride: true,
			TieToLayer: "LeafCollar"
		},
		{ Name: "FlowerCollar", Layer: "Collar", Pri: -19.9,
			Invariant: true,
			InheritColor: "Leaf",
			NoOverride: true,
			TieToLayer: "LeafCollar"
		},
		{ Name: "BudCollar", Layer: "Collar", Pri: -19.8,
			Invariant: true,
			InheritColor: "Leaf",
			NoOverride: true,
			TieToLayer: "LeafCollar"
		},
	])
});

AddModel({
	Name: "PumpkinNecklaceRestraint",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories", "Restraints"],
	Layers: ToLayerMap([
		{ Name: "LeafCollar", Layer: "Collar", Pri: 20,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Leaf",
		},
		{ Name: "VineCollar", Layer: "Collar", Pri: 20.1,
			Invariant: true,
			InheritColor: "Leaf",
			NoOverride: true,
			TieToLayer: "LeafCollar"
		},
		{ Name: "FlowerCollar", Layer: "Collar", Pri: 20.3,
			Invariant: true,
			InheritColor: "Leaf",
			NoOverride: true,
			TieToLayer: "LeafCollar"
		},
		{ Name: "BudCollar", Layer: "Collar", Pri: 20.2,
			Invariant: true,
			InheritColor: "Leaf",
			NoOverride: true,
			TieToLayer: "LeafCollar"
		},
	])
});




AddModel({
	Name: "PumpkinBlindfold",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "LeafBlindfold", Layer: "Blindfold", Pri: -10,
			Invariant: true,
			InheritColor: "Leaf",
		},
		{ Name: "VineBlindfold", Layer: "Blindfold", Pri: -9.9,
			Invariant: true,
			InheritColor: "Vine",
			NoOverride: true,
			TieToLayer: "LeafBlindfold",
		},
	])
});
AddModel(GetModelFashionVersion("PumpkinBlindfold", false));

AddModel({
	Name: "PumpkinGag",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "PumpkinGag", Layer: "Gag", Pri: -5,
			Invariant: true,
			InheritColor: "Pumpkin",
			DisplacementSprite: "FaceGag",
			DisplaceAmount: 20,
			DisplaceZBonus: 8000,
			DisplaceSource: ["FaceGag"],
			DisplaceLayers: ToMap(["FaceGag"]),
			DisplaceOptIn: [true],
			HideWhenOverridden: true,
		},
		{ Name: "LeafGag", Layer: "GagStraps", Pri: -5.2,
			Invariant: true,
			TieToLayer: "PumpkinGag",
			InheritColor: "Leaf",
		},
		{ Name: "VineGag", Layer: "GagStraps", Pri: -5.1,
			Invariant: true,
			TieToLayer: "PumpkinGag",
			InheritColor: "Vine",
		},
	])
});
AddModel(GetModelFashionVersion("PumpkinGag", false));

AddModel({
	Name: "PumpkinVines",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("PumpkinBra"),
		...GetModelLayers("PumpkinPanties"),
		...GetModelLayers("PumpkinFlower"),
		...GetModelLayers("PumpkinNecklace"),
	])
});
