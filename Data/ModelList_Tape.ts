/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "TapeBoots",
	Folder: "Tape",
	Parent: "TapeBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseFeet"],
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "BindFeet", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeAnkles",
	Folder: "Tape",
	Parent: "TapeBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseFeet"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "OverSocks", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
	])
});


AddModel({
	Name: "TapeBottom",
	Folder: "Tape",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked", "EncaseTorsoLower"],
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
	Name: "TapeArmLeft",
	Folder: "Tape",
	Parent: "TapeArms",
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
	Name: "TapeArmRight",
	Folder: "Tape",
	Parent: "TapeArms",
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
	Name: "TapeTorsoUpper",
	Folder: "Tape",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		{ Name: "Top", Layer: "WrappingTorso", Pri: -4,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
		},
		{ Name: "Chest", Layer: "BindChest", Pri: 102,
			Invariant: true,
			InheritColor: "Tape",

			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
		},
	])
});


AddModel({
	Name: "TapeArms",
	Folder: "Tape",
	Parent: "Tape",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		//...GetModelLayers("TapeArmLeft"),
		//...GetModelLayers("TapeArmRight"),
		...GetModelLayers("TapeTorsoUpper"),
	])
});


AddModel({
	Name: "TapeHandLeft",
	Folder: "Tape",
	Parent: "TapeArms",
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
	Name: "TapeHandRight",
	Folder: "Tape",
	Parent: "TapeArms",
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