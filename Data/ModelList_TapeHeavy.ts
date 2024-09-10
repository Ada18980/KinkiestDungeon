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
	AddPoseConditional: {
		RestrainingShoes: ["TapeBoots"],
	},
	RemovePoses: ["RestrainingShoes"],
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "WrappingLegs", Pri: 50,
			Poses: ToMap(["Closed", "KneelClosed","Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
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
		{ Name: "Ankles", Layer: "WrappingAnklesOver", Pri: 50,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
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
	AddPose: ["FeetLinked", "EncaseLegs"],
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "WrappingLegsOver2", Pri: 50,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["SlimeThighs"]),
			DisplacementSprite: "SlimeThighs",
		},
		{ Name: "RightLegs", Layer: "WrappingLegsOver2", Pri: 50,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
		},
		{ Name: "StrapCover", Layer: "OverCrotchStrapMid", Pri: 5,
			Poses: ToMap(["Closed", "Hogtie"]),
			RequirePoses: ToMap(["CrotchStrap"]),
			HidePoses: ToMap(["Skirt"]),
			InheritColor: "Tape",
			Invariant: true,
			TieToLayer: "Legs",
		},
	])
});

AddModel({
	Name: "TapeHeavyBottom",
	Folder: "TapeHeavy",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseLegs"],
	Layers: ToLayerMap([
		{ Name: "Bottom", Layer: "WrappingTorsoMid", Pri: 50,
			//swaplayerpose: {Kneel: "WrappingTorso", KneelClosed: "WrappingTorso"},
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "TapeHeavyBottomFull",
	Folder: "TapeHeavy",
	TopLevel: false,
	Parent: "TapeHeavyBottom",
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseTorsoLower", "EncaseLegs"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeHeavyBottom"),
		...GetModelLayers("TapeHeavyLegs"),

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
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest", "FlattenedUnderbust", "WrapArms"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 0,
			Invariant: true,
			InheritColor: "Tape",
		},
		{ Name: "Top", Layer: "WrappingTorsoMid", Pri: 50,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			HideOverrideLayerMulti: ["TopBinding"],
			InheritColor: "Tape",
			HideWhenOverridden: true,
		},
		{ Name: "Chest", Layer: "WrappingChest", Pri: 50,
			Invariant: true,
			InheritColor: "Tape",
			HideWhenOverridden: true,

			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
		},
		{ Name: "ArmLeft", Layer: "WrapArms", Pri: 50, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,

			DisplacementSprite: "TapeHeavyLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
		{ Name: "ArmRight", Layer: "WrapArms", Pri: 50, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,

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
	Name: "TapeHeavyArmsFull",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest", "FlattenedUnderbust", "WrapArms", "WrapChest"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeHeavyArms"),
		...GetModelLayers("TapeFullArms"),
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
		{ Name: "HandLeft", Layer: "MittenLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie", "Yoked"]),
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
		{ Name: "HandRight", Layer: "MittenRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie", "Yoked"]),
			SwapLayerPose: {Front: "BindForeHandRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeHeavyHands",
	Folder: "TapeHeavy",
	Parent: "TapeHeavyArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseHandRight", "EncaseHandLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeHeavyHandLeft"),
		...GetModelLayers("TapeHeavyHandRight"),
	])
});