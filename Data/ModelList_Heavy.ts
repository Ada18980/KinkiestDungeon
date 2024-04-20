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
	AddPose: ["HideHands", "EncaseArmLeft", "EncaseArmRight"],
	Categories: ["Restraints", "Jacket", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HidePoses: ToMap(["WrapArms"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		{ Name: "BeltsArms", Layer: "BindArmLeft", Pri: 3,
			NoOverride: true,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
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
			NoOverride: true,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "BeltsArms",
			HidePoses: ToMap(["WrapArms"]),
		},
		{ Name: "StrapsChest", Layer: "BindChest", Pri: -10,
			NoOverride: true,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "BeltsChest",
			HidePoses: ToMap(["WrapChest"]),
		},
		{ Name: "StrapsUnderbust", Layer: "StrapsUnderbust", Pri: -10,
			NoOverride: true,
			Invariant: true,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			InheritColor: "BeltsChest",
		},
	])
});


AddModel({
	Name: "JacketLowerStraps",
	Folder: "Jacket",
	TopLevel: false,
	Parent: "Jacket",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "BeltsTorsoLower", Layer: "HarnessMid", Pri: 70,
			NoOverride: true,
			MorphPoses: {Crossed: "Crossed", Wristtie: "Wristtie", Boxtie: "Boxtie"},
			InheritColor: "BeltsLower",
		},
		{ Name: "CrotchBelts", Layer: "HarnessMid", Pri: 70,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			InheritColor: "BeltsLower",
			Invariant: true,
		},
	])
});


AddModel({
	Name: "JacketExtraStraps",
	Folder: "Jacket",
	TopLevel: false,
	Parent: "Jacket",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "StrapsTorsoLowerExtra", Layer: "HarnessMid", Pri: 70.1,
			NoOverride: true,
			Invariant: true,
			InheritColor: "BeltsLower",
		},
		{ Name: "CrotchBeltExtra", Layer: "HarnessMid", Pri: 69.91,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			InheritColor: "BeltsLower",
			Invariant: true,
		},
		{ Name: "StrapsChestExtra", Layer: "BindChest", Pri: -9.9,
			NoOverride: true,
			HidePoses: ToMap(["WrapChest"]),
			Invariant: true,
			InheritColor: "BeltsChest",
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
	])
});


AddModel({
	Name: "JacketHeavyStraps",
	Folder: "Jacket",
	TopLevel: false,
	Parent: "Jacket",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketStraps"),
		...GetModelLayers("JacketLowerStraps"),
	])
});

AddModel({
	Name: "Jacket",
	Folder: "Jacket",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest", "HideHands", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketStraps"),
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			HidePoses: ToMap(["WrapArms"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		{ Name: "Chest", Layer: "SuitChestOver", Pri: 80,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			HidePoses: ToMap(["WrapChest"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
	])
});

AddModel({
	Name: "JacketLower",
	Folder: "Jacket",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		{ Name: "BinderTorsoLower", Layer: "Corset", Pri: 30,
			InheritColor: "Lower",
			Invariant: true,
		},
		{ Name: "Crotch", Layer: "HarnessMid", Pri: -10.1,
			InheritColor: "Lower",
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			NoOverride: true,
			TieToLayer: "CrotchBelts",
			Invariant: true,
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
	AddPose: ["EncaseTorsoUpper", "EncaseChest", "HideHands", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("Jacket"),
		...GetModelLayers("JacketLower"),
		...GetModelLayers("JacketLowerStraps"),
	])
});

AddModel({
	Name: "JacketExtra",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest", "HideHands", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketHeavy"),
		...GetModelLayers("JacketExtraStraps"),
	])
});

AddModel({
	Name: "JacketArmbinderSecure",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "SleeveLeft", Pri: 90,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "SleevesCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HidePoses: ToMap(["WrapArms"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		...GetModelLayers("JacketStraps"),
	])
});

AddModel({
	Name: "JacketHeavyArmbinder",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketArmbinderSecure"),
		...GetModelLayers("JacketLowerStraps"),
	])
});


AddModel({
	Name: "JacketExtraArmbinder",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketHeavyArmbinder"),
		...GetModelLayers("JacketExtraStraps"),
	])
});



AddModel({
	Name: "JacketBolero",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "EncaseArmLeft", "EncaseArmRight"],
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
			DisplaceAmount: 70,
			NoOverride: true,
			DisplaceLayers: ToMap(["ArmsAll"]),
			InheritColor: "Chest",
		},
		...GetModelLayers("JacketStraps"),
	])
});

AddModel({
	Name: "JacketHeavyBolero",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketBolero"),
		...GetModelLayers("JacketLower"),
		...GetModelLayers("JacketLowerStraps"),
	])
});

AddModel({
	Name: "JacketExtraBolero",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketHeavyBolero"),
		...GetModelLayers("JacketExtraStraps"),
	])
});


AddModel({
	Name: "JacketLeotard",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Jacket", "Leather"],
	AddPose: ["HideHands", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketBolero"),

		{ Name: "LatexLower", Layer: "Bodysuit", Pri: 13,
			//swaplayerpose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
		},
		{ Name: "LatexChest", Layer: "SuitChest", Pri: 14,
			InheritColor: "LatexUpper",
		},
		{ Name: "LatexUpper", Layer: "Bodysuit", Pri: 14,
		},
	])
});

AddModel({
	Name: "JacketHeavyLeotard",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Jacket", "Leather", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketLeotard"),
		...GetModelLayers("JacketLowerStraps"),
	])
});

AddModel({
	Name: "JacketExtraLeotard",
	Folder: "Jacket",
	Parent: "Jacket",
	TopLevel: false,
	Restraint: true,
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Jacket", "Leather", "CrotchStrap", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("JacketHeavyLeotard"),
		...GetModelLayers("JacketExtraStraps"),
	])
});

AddModel({
	Name: "Legbinder",
	Folder: "Legbinder",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Legbinder", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legbinder", Layer: "LegbinderLegsOver", Pri: -20,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			HideWhenOverridden: true,
			InheritColor: "Binder",
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["Legbinder"]),
			DisplacementSprite: "LegbinderSquish",

		},
		{ Name: "LegLegbinder", Layer: "LegbinderAnklesOver", Pri: -20,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "LegbinderLegsOver", KneelClosed: "LegbinderLegsOver"},
			InheritColor: "Binder",
		},
		{ Name: "RightLegbinder", Layer: "LegbinderLegsOver", Pri: -20,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			TieToLayer: "Legbinder",
			InheritColor: "Binder",

		},
		{ Name: "LegRightLegbinder", Layer: "LegbinderAnklesOver", Pri: -20,
			SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(["Closed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			TieToLayer: "LegLegbinder",
			InheritColor: "Binder",

		},
		{ Name: "LacesLegbinder", Layer: "LegbinderLegsOver", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			NoOverride: true,
			TieToLayer: "Legbinder",
			InheritColor: "Laces",
		},
		{ Name: "RightLacesLegbinder", Layer: "LegbinderLegsOver", Pri: 10,
			Poses: ToMap(["KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			NoOverride: true,
			TieToLayer: "Legbinder",
			InheritColor: "Laces",
		},
		{ Name: "LegLacesLegbinder", Layer: "LegbinderAnklesOver", Pri: 10,
			Poses: ToMap(["Closed"]),
			NoOverride: true,
			TieToLayer: "Legbinder",
			InheritColor: "Laces",
		},
	])
});
