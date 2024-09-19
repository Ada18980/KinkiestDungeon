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
	AddPoseConditional: {
		RestrainingShoes: ["TapeBoots"],
	},
	RemovePoses: ["RestrainingShoes"],
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "WrappingLegs", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed"]),
			//GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "TapeAnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeCalf"]),
			InheritColor: "Tape",
			NoOverride: true,
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
		{ Name: "Ankles", Layer: "WrappingAnklesOver", Pri: 40,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
			NoOverride: true,
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
		{ Name: "Legs", Layer: "WrappingLegsOver2", Pri: 45,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
			NoOverride: true,
		},
		{ Name: "RightLegs", Layer: "WrappingLegsOver2", Pri: 45,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
			NoOverride: true,
		},
		{ Name: "StrapCover", Layer: "OverCrotchStrapMid", Pri: 5,
			TieToLayer: "Legs",
			Poses: ToMap(["Closed", "Hogtie"]),
			RequirePoses: ToMap(["CrotchStrap"]),
			HidePoses: ToMap(["Skirt"]),
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
	Name: "TapeMedArms",
	Folder: "TapeMed",
	Parent: "TapeMed",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape", "FlattenedUnderbust"],
	Layers: ToLayerMap([
		{ Name: "Top", Layer: "WrappingTorsoMid", Pri: 40,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
			NoOverride: true,
		},
		{ Name: "Chest", Layer: "WrappingChest", Pri: 40,
			Invariant: true,
			InheritColor: "Tape",
			NoOverride: true,

			//CrossHideOverride: true,
			//HideOverrideLayerMulti: ["ChestBinding"],
			//ForceSingleOverride: true,
		},
		{ Name: "ArmLeft", Layer: "WrapArms", Pri: 45, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,

			DisplacementSprite: "TapeMedLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
		{ Name: "ArmRight", Layer: "WrapArms", Pri: 45, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,

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
	Name: "TapeFullArms",
	Folder: "TapeMed",
	Parent: "TapeMed",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "TopFull", Layer: "WrappingTorsoMid", Pri: 40,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
		},
		{ Name: "ChestFull", Layer: "WrappingChest", Pri: 49,
			Invariant: true,
			InheritColor: "Tape",

			//CrossHideOverride: true,
			//HideOverrideLayerMulti: ["ChestBinding"],
			//ForceSingleOverride: true,
		},
		{ Name: "ArmFullLeft", Layer: "WrappingChest", Pri: 45, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "WrapForeArms", Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeFullLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
		{ Name: "ArmFullRight", Layer: "WrappingChest", Pri: 45, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "WrapForeArms", Crossed: "BindCrossArms"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeFullRight",
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
	Name: "TapeMedHandLeft",
	Folder: "TapeMed",
	Parent: "TapeMedArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseHandLeft"],
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "MittenLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "ForeMittenLeft"},
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
		{ Name: "HandRight", Layer: "MittenRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "ForeMittenRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});