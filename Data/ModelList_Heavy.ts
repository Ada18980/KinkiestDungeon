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
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		{ Name: "BeltsArms", Layer: "BindArmLeft", Pri: 3,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		{ Name: "Chest", Layer: "BraChest", Pri: 80,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		{ Name: "BeltsChest", Layer: "BindChest", Pri: -10,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
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
	Categories: ["Restraints", "Straps", "Leather"],
	Layers: ToLayerMap([
		{ Name: "StrapsArms", Layer: "BindArmLeft", Pri: 3,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "BeltsArms",
		},
		{ Name: "StrapsChest", Layer: "BindChest", Pri: -10,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "BeltsChest",
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
		},
		{ Name: "ChestBolero", Layer: "BraChest", Pri: 80,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			DisplacementSprite: "Jacket",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["ArmsAll"]),
		},
		...GetModelLayers("JacketStraps"),
	])
});