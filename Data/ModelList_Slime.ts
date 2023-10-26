/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

let slimefilter = {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":1.2166666666666668,"red":1.7000000000000002,"green":0.5166666666666666,"blue":2.3833333333333333,"alpha":1};



AddModel({
	Name: "SlimeMouth",
	Folder: "Slime",
	Parent: "SlimeHead",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseMouth"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "FaceMouth", Layer: "GagWrap", Pri: 9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeEyes",
	Folder: "Slime",
	Parent: "SlimeHead",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseEyes"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "FaceEyes", Layer: "BlindfoldWrap", Pri: 9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeHead",
	Folder: "Slime",
	Parent: "Slime",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseEyes", "EncaseMouth", "EncaseHead"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "FaceFull", Layer: "Mask", Pri: 9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeBoots",
	Folder: "Slime",
	Parent: "SlimeLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseFeet"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "OverShoes", Pri: 9,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeTorsoLower",
	Folder: "Slime",
	Parent: "SlimeLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseTorsoLower"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "WrappingTorsoMid", Pri: -6,
			SwapLayerPose: {Kneel: "WrappingTorso", KneelClosed: "WrappingTorso"},
			Invariant: true,
			ApplyFilterToLayerGroup: ToMap(["SlimeTorsoLower"]),
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeThighs",
	Folder: "Slime",
	Parent: "SlimeLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["FeetLinked", "EncaseLegs"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "OverShoes", Pri: 11,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeLegs"]),
			InheritColor: "Slime",
		},
	])
});


AddModel({
	Name: "SlimeLegs",
	Folder: "Slime",
	Parent: "Slime",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["FeetLinked", "TorsoLowerTight", "EncaseTorsoLower", "EncaseLegs"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		...GetModelLayers("SlimeThighs"),
		...GetModelLayers("SlimeTorsoLower"),
	])
});


AddModel({
	Name: "SlimeFeet",
	Folder: "Slime",
	Parent: "SlimeLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["FeetLinked", "EncaseAnkles"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "OverShoes", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeFeet", "Shoes"]),
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeArmLeft",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseArmLeft"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "BindArmLeft", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Slime",
		},
	])
});
AddModel({
	Name: "SlimeArmRight",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseArmRight"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "BindArmRight", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Slime",
		},
	])
});

AddModel({
	Name: "SlimeTorsoUpper",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Filters: {
		"Slime": slimefilter,
	},
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		{ Name: "TorsoUpper", Layer: "WrappingTorsoMid", Pri: -5,
			Invariant: true,
			HideOverrideLayerMulti: ["TopBinding"],
			InheritColor: "Slime",
		},
		{ Name: "Chest", Layer: "BindChest", Pri: 101,
			Invariant: true,
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
			InheritColor: "Slime",
		},
	])
});


AddModel({
	Name: "SlimeArms",
	Folder: "Slime",
	Parent: "Slime",
	TopLevel: true,
	Restraint: true,
	Filters: {
		"Slime": slimefilter,
	},
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		...GetModelLayers("SlimeArmLeft"),
		...GetModelLayers("SlimeArmRight"),
		...GetModelLayers("SlimeTorsoUpper"),
	])
});


AddModel({
	Name: "SlimeHandLeft",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseHandLeft"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "BindHandLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandLeft"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Slime",
		},
	])
});
AddModel({
	Name: "SlimeHandRight",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseHandRight"],
	Filters: {
		"Slime": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "HandRight", Layer: "BindHandRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Slime",
		},
	])
});