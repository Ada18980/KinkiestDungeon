/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */




AddModel({
	Name: "JacketArmbinder",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HidePoses: ToMap(["WrapArms"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 60,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		{ Name: "BeltsArms", Layer: "BindArmLeft", Pri: 3,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
	])
});

AddModel({
	Name: "Jacket",
	Folder: "Jacket",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			HidePoses: ToMap(["WrapArms"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		{ Name: "BeltsArms", Layer: "BindArmLeft", Pri: 3,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			HidePoses: ToMap(["WrapArms"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		{ Name: "Chest", Layer: "BraChest", Pri: 80,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			HidePoses: ToMap(["WrapChest"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		{ Name: "BeltsChest", Layer: "BindChest", Pri: -10,
			HidePoses: ToMap(["WrapChest"]),
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		
		{ Name: "StrapsUnderbust", Layer: "StrapsUnderbust", Pri: -10,
			Invariant: true,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			InheritColor: "BeltsChest",
		},
	])
});


AddModel({
	Name: "JacketHeavy",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		...GetModelLayers("Jacket"),

		{ Name: "BinderTorsoLower", Layer: "Corset", Pri: -10,
			InheritColor: "Lower",
			Invariant: true,
		},
		{ Name: "BeltsTorsoLower", Layer: "HarnessMid", Pri: -10,
			MorphPoses: {Crossed: "Crossed", Wristtie: "Wristtie", Boxtie: "Boxtie"},
			InheritColor: "BeltsLower",
		},
		{ Name: "Crotch", Layer: "HarnessMid", Pri: -10.1,
			InheritColor: "Lower",
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			NoOverride: true,
			TieToLayer: "CrotchBelts",
			Invariant: true,
		},
		{ Name: "CrotchBelts", Layer: "HarnessMid", Pri: -10,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			InheritColor: "BeltsLower",
			Invariant: true,
		},
	])
});

AddModel({
	Name: "JacketStraps",
	Folder: "Jacket",
	TopLevel: false,
	Parent: "Jacket",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	Layers: ToLayerMap([
		{ Name: "StrapsArms", Layer: "BindArmLeft", Pri: 3,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "BeltsArms",
			HidePoses: ToMap(["WrapArms"]),
		},
		{ Name: "StrapsChest", Layer: "BindChest", Pri: -10,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "BeltsChest",
			HidePoses: ToMap(["WrapChest"]),
		},
		{ Name: "StrapsUnderbust", Layer: "StrapsUnderbust", Pri: -10,
			Invariant: true,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			InheritColor: "BeltsChest",
		},
	])
});


AddModel({
	Name: "JacketArmbinderSecure",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HidePoses: ToMap(["WrapArms"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 60,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		...GetModelLayers("JacketStraps"),
	])
});

AddModel({
	Name: "JacketBolero",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HidePoses: ToMap(["WrapArms"]),
		},
		{ Name: "ChestBolero", Layer: "ShirtChest", Pri: 80,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			HidePoses: ToMap(["WrapChest"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 50,
			NoOverride: true,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		...GetModelLayers("JacketStraps"),
	])
});
AddModel({
	Name: "JacketLeotard",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketBolero"),

		{ Name: "LatexLower", Layer: "Bodysuit", Pri: 13,
			SwapLayerPose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
		},
		{ Name: "LatexChest", Layer: "SuitChest", Pri: 14,
			InheritColor: "LatexUpper",
		},
		{ Name: "LatexUpper", Layer: "Bodysuit", Pri: 14,
		},
	])
});


AddModel({
	Name: "Legbinder",
	Folder: "Legbinder",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Legbinder", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legbinder", Layer: "WrappingLegsOver", Pri: -20,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			HideWhenOverridden: true,
			InheritColor: "Binder",

		},
		{ Name: "LegLegbinder", Layer: "WrappingAnklesOver", Pri: -20,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Binder",
		},
		{ Name: "RightLegbinder", Layer: "WrappingLegsOver", Pri: -20,
			SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			TieToLayer: "Legbinder",
			InheritColor: "Binder",

		},
		{ Name: "LegRightLegbinder", Layer: "WrappingAnklesOver", Pri: -20,
			SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(["Closed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			TieToLayer: "LegLegbinder",
			InheritColor: "Binder",

		},
		{ Name: "LacesLegbinder", Layer: "WrappingLegsOver", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			TieToLayer: "Legbinder",
			InheritColor: "Laces",
		},
	])
});
