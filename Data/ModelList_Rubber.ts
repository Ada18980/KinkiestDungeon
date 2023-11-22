/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "RubberMouth",
	Folder: "Rubber",
	Parent: "RubberHead",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseMouth"],
	Layers: ToLayerMap([
		{ Name: "FaceMouth", Layer: "GagWrap", Pri: 9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberEyes",
	Folder: "Rubber",
	Parent: "RubberHead",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseEyes"],
	Layers: ToLayerMap([
		{ Name: "FaceEyes", Layer: "BlindfoldWrap", Pri: 9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberHead",
	Folder: "Rubber",
	Parent: "Rubber",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseEyes", "EncaseMouth", "EncaseHead"],
	Layers: ToLayerMap([
		{ Name: "FaceFull", Layer: "Mask", Pri: 9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberBoots",
	Folder: "Rubber",
	Parent: "RubberLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseFeet"],
	Layers: ToLayerMap([
		{ Name: "FootLeft", Layer: "ShoeLeftUnder", Pri: -50,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			InheritColor: "Rubber",
		},
		{ Name: "FootRight", Layer: "ShoeRightUnder", Pri: -50,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberTorsoLower",
	Folder: "Rubber",
	Parent: "RubberLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseTorsoLower"],
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "WrappingTorso", Pri: -6,
			SwapLayerPose: {Kneel: "WrappingTorso", KneelClosed: "WrappingTorso"},
			Invariant: true,
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberThighs",
	Folder: "Rubber",
	Parent: "RubberLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["FeetLinked", "EncaseLegs"],
	Layers: ToLayerMap([
		{ Name: "LegLeft", Layer: "ShoeLeftOver", Pri: 11,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
		},
		{ Name: "LegRight", Layer: "ShoeRightOver", Pri: 11,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
		},
	])
});


AddModel({
	Name: "RubberLegs",
	Folder: "Rubber",
	Parent: "Rubber",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["FeetLinked", "TorsoLowerTight", "EncaseTorsoLower", "EncaseLegs"],
	Layers: ToLayerMap([
		...GetModelLayers("RubberThighs"),
		...GetModelLayers("RubberTorsoLower"),
	])
});


AddModel({
	Name: "RubberFeet",
	Folder: "Rubber",
	Parent: "RubberLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["FeetLinked", "EncaseAnkles"],
	Layers: ToLayerMap([
		{ Name: "AnkleLeft", Layer: "ShoeLeftOver", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
		},
		{ Name: "AnkleRight", Layer: "ShoeRightOver", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberArmLeft",
	Folder: "Rubber",
	Parent: "RubberArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseArmLeft"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "BindArmLeft", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Rubber",
		},
	])
});
AddModel({
	Name: "RubberArmRight",
	Folder: "Rubber",
	Parent: "RubberArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseArmRight"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "BindArmRight", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Rubber",
		},
	])
});

AddModel({
	Name: "RubberTorsoUpper",
	Folder: "Rubber",
	Parent: "RubberArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		{ Name: "TorsoUpper", Layer: "WrappingTorsoMid", Pri: -5,
			Invariant: true,
			HideOverrideLayerMulti: ["TopBinding"],
			InheritColor: "Rubber",
		},
		{ Name: "Chest", Layer: "BindChest", Pri: 101,
			Invariant: true,
			InheritColor: "Rubber",

			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
		},
	])
});


AddModel({
	Name: "RubberArms",
	Folder: "Rubber",
	Parent: "Rubber",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		...GetModelLayers("RubberArmLeft"),
		...GetModelLayers("RubberArmRight"),
		...GetModelLayers("RubberTorsoUpper"),
	])
});


AddModel({
	Name: "RubberHandLeft",
	Folder: "Rubber",
	Parent: "RubberArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseHandLeft"],
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "BindHandLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandLeft"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Rubber",
		},
	])
});
AddModel({
	Name: "RubberHandRight",
	Folder: "Rubber",
	Parent: "RubberArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseHandRight"],
	Layers: ToLayerMap([
		{ Name: "HandRight", Layer: "BindHandRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Rubber",
		},
	])
});