/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

let tapefilter = {"gamma":1,"saturation":0.0,"contrast":2,"brightness":3,"red":1,"green":1,"blue":1,"alpha":1};

AddModel({
	Name: "TapeHeavyBoots",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseFeet"],
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "OverShoes", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed"]),
			//GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "TapeAnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeCalf"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeHeavyAnkles",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseAnkles"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "Ankles1", Pri: 0,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
	])
});


AddModel({
	Name: "TapeHeavyLegs",
	Folder: "TapeHeavy",
	TopLevel: false,
	Parent: "TapeHeavyBottom",
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseTorsoLower", "EncaseLegs"],
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "WrappingLegs", Pri: -5,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
		{ Name: "StrapCover", Layer: "OverCrotchStrapMid", Pri: -5,
			Poses: ToMap(["Closed", "Hogtie"]),
			RequirePoses: ToMap(["CrotchStrap"]),
			InheritColor: "Tape",
			Invariant: true,
		},
	])
});

AddModel({
	Name: "TapeHeavyBottom",
	Folder: "TapeHeavy",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseTorsoLower", "EncaseLegs"],
	Layers: ToLayerMap([
		{ Name: "Bottom", Layer: "WrappingTorso", Pri: -5,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
	])
});
/*
AddModel({
	Name: "TapeHeavyArmLeft",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseArmLeft"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "BindArmLeft", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeHeavyArmRight",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseArmRight"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "BindArmRight", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Tape",
		},
	])
});*/


AddModel({
	Name: "TapeHeavyArms",
	Folder: "TapeHeavy",
	Parent: "TapeHeavy",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		{ Name: "Top", Layer: "WrappingTorso", Pri: -4,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HideOverrideLayerMulti: ["TopBinding"],
			InheritColor: "Tape",
		},
		{ Name: "Chest", Layer: "BindChest", Pri: 102,
			Invariant: true,
			InheritColor: "Tape",

			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
		},
		{ Name: "ArmLeft", Layer: "WrappingTorsoOver", Pri: -5, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeHeavyLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
		{ Name: "ArmRight", Layer: "WrappingTorsoOver", Pri: -5, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeHeavyRight",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
	])
});


AddModel({
	Name: "TapeHeavyHandLeft",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseHandLeft"],
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "BindHandLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandLeft"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeHeavyHandRight",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseHandRight"],
	Layers: ToLayerMap([
		{ Name: "HandRight", Layer: "BindHandRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});