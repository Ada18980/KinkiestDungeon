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
		"Mouth": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "FaceMouth", Layer: "GagWrap", Pri: 9,
			Invariant: true,
			NoOverride: true,
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
		"Eyes": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "FaceEyes", Layer: "BlindfoldWrap", Pri: 9,
			Invariant: true,
			NoOverride: true,
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
		"Eyes": slimefilter,
		"Mouth": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "FaceFull", Layer: "Mask", Pri: 9,
			Invariant: true,
			NoOverride: true,
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
		"Feet": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "OverSocks", Pri: 9,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
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
		"TorsoLower": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "WrappingTorso", Pri: -6,
			Invariant: true,
			ApplyFilterToLayerGroup: ToMap(["SlimeTorsoLower"]),
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
	AddPose: ["FeetLinked"],
	Filters: {
		"Legs": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "OverSocks", Pri: 11,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeLegs"]),
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
	AddPose: ["FeetLinked", "TorsoLowerTight", "EncaseTorsoLower"],
	Filters: {
		"Legs": slimefilter,
		"TorsoLower": slimefilter,
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
	AddPose: ["FeetLinked"],
	Filters: {
		"Ankles": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "OverSocks", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeFeet", "Shoes"]),
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
		"Arms": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "BindArmLeft", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Arms",
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
		"Arms": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "BindArmRight", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Arms",
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
		"TorsoUpper": slimefilter,
	},
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseTorsoUpper", "EncaseChest"],
	Layers: ToLayerMap([
		{ Name: "TorsoUpper", Layer: "WrappingTorso", Pri: -5,
			Invariant: true,
		},
		{ Name: "Chest", Layer: "BindChest", Pri: 101,
			Invariant: true,
			InheritColor: "TorsoUpper",

			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
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
		"TorsoUpper": slimefilter,
		"Arms": slimefilter,
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
		"Hands": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "BindHandLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandLeft"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Hands",
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
		"Hands": slimefilter,
	},
	Layers: ToLayerMap([
		{ Name: "HandRight", Layer: "BindHandRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandRight"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Hands",
		},
	])
});