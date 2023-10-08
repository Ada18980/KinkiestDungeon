/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "TapeMedBoots",
	Folder: "TapeMed",
	Parent: "TapeMedBottom",
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
	Name: "TapeMedAnkles",
	Folder: "TapeMed",
	Parent: "TapeMedBottom",
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
	Name: "TapeMedLegs",
	Folder: "TapeMed",
	TopLevel: false,
	Parent: "TapeMedBottom",
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseLegs"],
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "WrappingLegs", Pri: -5,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
		{ Name: "StrapCover", Layer: "OverCrotchStrap", Pri: -5,
			Poses: ToMap(["Closed", "Hogtie"]),
			RequirePoses: ToMap(["CrotchStrap"]),
			InheritColor: "Tape",
			Invariant: true,
		},
	])
});

AddModel({
	Name: "TapeMedBottom",
	Folder: "TapeMed",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseLegs"],
	Layers: ToLayerMap([
		/*{ Name: "Bottom", Layer: "WrappingTorso", Pri: -5,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},*/
	])
});
/*
AddModel({
	Name: "TapeMedArmLeft",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
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
	Name: "TapeMedArmRight",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
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
	Name: "TapeMedTorsoUpper",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "Top", Layer: "WrappingTorso", Pri: -4,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
		},
		{ Name: "Chest", Layer: "BindChest", Pri: 102,
			Invariant: true,
			InheritColor: "Tape",

			//CrossHideOverride: true,
			//HideOverrideLayerMulti: ["ChestBinding"],
			//ForceSingleOverride: true,
		},
	])
});

AddModel({
	Name: "TapeMedArmLeft",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "WrappingTorsoOver", Pri: -5, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeMedLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeMedArmRight",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "WrappingTorsoOver", Pri: -5, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeMedRight",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeMedArms",
	Folder: "TapeMed",
	Parent: "TapeMed",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeMedArmLeft"),
		...GetModelLayers("TapeMedArmRight"),
		...GetModelLayers("TapeMedTorsoUpper"),
	])
});


AddModel({
	Name: "TapeMedHandLeft",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
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
	Name: "TapeMedHandRight",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
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