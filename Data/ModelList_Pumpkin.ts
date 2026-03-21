/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "PumpkinVineArms",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "VineArmLeft", Layer: "BindElbowLeft", Pri: 105,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Vines",
			NoOverride: true,
			DisplaceLayers: {Rope1: true},
			DisplacementSprite: "VineArmLeft",
			DisplaceAmount: 250,
		},
		{ Name: "VineArmRight", Layer: "BindElbowRight", Pri: 105,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Vines",
			NoOverride: true,
			
			DisplaceLayers: {Rope1: true},
			DisplacementSprite: "VineArmRight",
			DisplaceAmount: 250,
		},
		{ Name: "VineForeArmRight", Layer: "BindForeArmRight", Pri: 105,
			Poses: ToMap([...FOREARMPOSES]),
			GlobalDefaultOverride: ToMap([...FOREARMPOSES]),
			InheritColor: "Vines",
			NoOverride: true,
			SwapLayerPose: {Crossed: "BindCrossArmRight"},
		},
		{ Name: "VineForeArmLeft", Layer: "BindForeArmLeft", Pri: 105,
			Poses: ToMap([...FOREARMPOSES]),
			GlobalDefaultOverride: ToMap([...FOREARMPOSES]),
			InheritColor: "Vines",
			NoOverride: true,
			SwapLayerPose: {Crossed: "BindCrossArmLeft"},
		},
		{ Name: "FlowerForeArmRight", Layer: "BindForeArmRight", Pri: 105.2,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap([...FOREARMPOSES]),
			InheritColor: "Flower",
			NoOverride: true,
			SwapLayerPose: {Crossed: "BindCrossArmRight"},
		},
		{ Name: "FlowerForeArmLeft", Layer: "BindForeArmLeft", Pri: 105.2,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap([...FOREARMPOSES]),
			InheritColor: "Flower",
			NoOverride: true,
			SwapLayerPose: {Crossed: "BindCrossArmLeft"},
		},
		{ Name: "BudForeArmRight", Layer: "BindForeArmRight", Pri: 105.2,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap([...FOREARMPOSES]),
			InheritColor: "Bud",
			NoOverride: true,
			SwapLayerPose: {Crossed: "BindCrossArmRight"},
		},
		{ Name: "BudForeArmLeft", Layer: "BindForeArmLeft", Pri: 105.2,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap([...FOREARMPOSES]),
			InheritColor: "Bud",
			NoOverride: true,
			SwapLayerPose: {Crossed: "BindCrossArmRight"},
		},
		{ Name: "FlowerArmRight", Layer: "BindElbowRight", Pri: 105.2,
			Poses: ToMap(["Free"]),
			InheritColor: "Flower",
			TieToLayer: "VineArmRight",
			NoOverride: true,
		},
		{ Name: "BudArmRight", Layer: "BindElbowRight", Pri: 105.1,
			Poses: ToMap(["Free"]),
			InheritColor: "Bud",
			TieToLayer: "VineArmRight",
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "PumpkinVineLegs",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "VineLegLeft", Layer: "Thighs1", Pri: 105,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Vines",
			NoOverride: true,
			SwapLayerPose: {Spread: "ThighLeftOver", Kneel: "ThighLeftOver"},
		},
		{ Name: "VineLegRight", Layer: "RightThighs1", Pri: 105,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Vines",
			NoOverride: true,
			SwapLayerPose: {Spread: "ThighRightOver", Kneel: "ThighRightOver"},
		},
		
		{ Name: "FlowerLegLeft", Layer: "Thighs1", Pri: 105.2,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Flower",
			TieToLayer: "VineLegLeft",
			NoOverride: true,
			SwapLayerPose: {Spread: "ThighLeftOver", Kneel: "ThighLeftOver"},
		},
		{ Name: "BudLegLeft", Layer: "Thighs1", Pri: 105.1,
			Poses: ToMap(["Closed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Bud",
			TieToLayer: "VineLegLeft",
			NoOverride: true,
			SwapLayerPose: {Spread: "ThighLeftOver", Kneel: "ThighLeftOver"},
		},

		{ Name: "FlowerLegRight", Layer: "RightThighs1", Pri: 105.2,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Flower",
			TieToLayer: "VineLegRight",
			NoOverride: true,
			SwapLayerPose: {Spread: "ThighRightOver", Kneel: "ThighRightOver"},
		},
		{ Name: "BudLegRight", Layer: "RightThighs1", Pri: 105.1,
			Poses: ToMap([]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Bud",
			TieToLayer: "VineLegRight",
			NoOverride: true,
			SwapLayerPose: {Spread: "ThighLeftOver", Kneel: "ThighLeftOver"},
		},


		
	])
});


AddModel({
	Name: "PumpkinVineFeet",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		



		{ Name: "VineLegLeftLower", Layer: "Ankles1", Pri: 105,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Vines",
			NoOverride: true,
		},
		{ Name: "VineLegRightLower", Layer: "RightAnkles1", Pri: 105,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Vines",
			NoOverride: true,
		},
		
		{ Name: "FlowerLegLeftLower", Layer: "Ankles1", Pri: 105.2,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Flower",
			TieToLayer: "VineLegLeftLower",
			NoOverride: true,
		},
		{ Name: "BudLegLeftLower", Layer: "Ankles1", Pri: 105.1,
			Poses: ToMapSubtract(["Closed"], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Bud",
			TieToLayer: "VineLegLeftLower",
			NoOverride: true,
		},

		{ Name: "FlowerLegRightLower", Layer: "RightAnkles1", Pri: 105.2,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Flower",
			TieToLayer: "VineLegRightLower",
			NoOverride: true,
		},
		{ Name: "BudLegRightLower", Layer: "RightAnkles1", Pri: 105.1,
			Poses: ToMapSubtract([], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Bud",
			TieToLayer: "VineLegRightLower",
			NoOverride: true,
		},

		
	])
});


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
	Name: "PumpkinVineHarness",
	Folder: "Pumpkin",
	Parent: "PumpkinVines",
	TopLevel: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([

		{ Name: "VineHarnessUnderbust", Layer: "StrapsUnderbust", Pri: 70,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Vine",
			NoOverride: true,
		},



		{ Name: "VineHarness", Layer: "ChestStraps", Pri: 70,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Vine",
			NoOverride: true,
		},

		{ Name: "VineHarnessMiddle", Layer: "ChestStraps", Pri: 70.05,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "VineMIddle",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "LeafHarnessL", Layer: "ChestStraps", Pri: 70.1,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "LeafL",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "LeafHarnessR", Layer: "ChestStraps", Pri: 70.1,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "LeafR",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "FlowerHarness", Layer: "ChestStraps", Pri: 70.1,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "Flower",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "FlowerHarnessL", Layer: "ChestStraps", Pri: 70.1,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "FlowerL",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "FlowerHarnessR", Layer: "ChestStraps", Pri: 70.1,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "FlowerR",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "BudHarnessL", Layer: "ChestStraps", Pri: 70.2,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "BudL",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		{ Name: "BudHarnessR", Layer: "ChestStraps", Pri: 70.2,
			Poses: ToMap([...ARMPOSES]), Invariant: true,
			InheritColor: "BudR",
			NoOverride: true,
			TieToLayer: "VineHarness",
		},
		
	])
});
AddModel(GetModelFashionVersion("PumpkinVineHarness", true));

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
	AddPose: ["HideMouth", "StuffMouth", "BallMouth"],
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
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("PumpkinBra"),
		...GetModelLayers("PumpkinPanties"),
		...GetModelLayers("PumpkinFlower"),
		...GetModelLayers("PumpkinNecklace"),
	])
});
