/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "TapeBoots",
	Folder: "TapeLight",
	Parent: "TapeBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
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
	Name: "TapeAnkles",
	Folder: "TapeLight",
	Parent: "TapeBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "WrappingAnklesOver", Pri: 35,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			NoOverride: true,
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "TapeLegs",
	Folder: "TapeLight",
	TopLevel: false,
	Parent: "TapeBottom",
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "WrappingLegsOver2", Pri: 5,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			NoOverride: true,
		},
		{ Name: "RightLegs", Layer: "WrappingLegsOver2", Pri: 5,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "TapeBottom",
	Folder: "TapeLight",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		//
	])
});

AddModel({
	Name: "TapeTorsoUpper",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape", "FlattenedUnderbust"],
	Layers: ToLayerMap([
		{ Name: "Top", Layer: "WrappingTorsoMid", Pri: 29,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeArmLeft",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "WrapArms", Pri: 30, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeLightLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoOverride: true,

			NoDisplace: true,
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeArmRight",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "WrapArms", Pri: 30, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeLightRight",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			NoOverride: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeArms",
	Folder: "TapeLight",
	Parent: "Tape",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape", "FlattenedUnderbust"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeArmLeft"),
		...GetModelLayers("TapeArmRight"),
		...GetModelLayers("TapeTorsoUpper"),
	])
});

AddModel({
	Name: "TapeStrapArms",
	Folder: "TapeMed",
	Parent: "TapeMed",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape", "FlattenedUnderbust"],
	Layers: ToLayerMap([
		{ Name: "TopStrap", Layer: "WrappingChest", Pri: 32,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
			NoOverride: true,
		},
		{ Name: "ChestStrap", Layer: "WrappingChest", Pri: 35,
			Invariant: true,
			InheritColor: "Tape",
			NoOverride: true,
			TieToLayer: "TopStrap",

			//CrossHideOverride: true,
			//HideOverrideLayerMulti: ["ChestBinding"],
			//ForceSingleOverride: true,
		},
		{ Name: "ArmStrapLeft", Layer: "WrappingChest", Pri: 35, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,
			TieToLayer: "TopStrap",

			DisplacementSprite: "TapeTopLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
		{ Name: "ArmStrapRight", Layer: "WrappingChest", Pri: 35, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,
			TieToLayer: "TopStrap",

			DisplacementSprite: "TapeTopRight",
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
	Name: "TapeStrappedArms",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeArms"),
		...GetModelLayers("TapeStrapArms"),
	])
});

AddModel({
	Name: "TapeHandLeft",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "MittenLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "ForeMittenLeft"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeHandRight",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "HandRight", Layer: "MittenRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "ForeMittenRight"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});