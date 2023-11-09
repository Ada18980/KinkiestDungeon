/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



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
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},
		{ Name: "BeltsArms", Layer: "BindArmLeft", Pri: 3,
			Poses: ToMap(["Wristtie", "Boxtie", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Crossed"]),
		},

		{ Name: "Chest", Layer: "SuitChest", Pri: -80,
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
