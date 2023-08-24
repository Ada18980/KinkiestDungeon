/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "SlimeLegs",
	Folder: "Slime",
	Parent: "Slime",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "OverSocks", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
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
	AddPose: ["ArmLeftTight", "EncaseArmLeft"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "BindArmLeft", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft"},
			GlobalDefaultOverride: ToMap(["Front"]),
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
	AddPose: ["ArmRightTight", "EncaseArmRight"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "BindArmRight", Pri: -5,
			Poses: ToMap(["Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight"},
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

AddModel({
	Name: "SlimeTorsoUpper",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["TorsoUpperTight", "EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "TorsoUpper", Layer: "WrappingTorso", Pri: -5,
			Invariant: true,
		},
		{ Name: "Chest", Layer: "WrappingChest", Pri: -5,
			Invariant: true,
		},
	])
});
AddModel({
	Name: "SlimeTorsoLower",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["TorsoLowerTight", "EncaseTorsoLower"],
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "WrappingTorso", Pri: -6,
			Invariant: true,
		},
	])
});


AddModel({
	Name: "SlimeArms",
	Folder: "Slime",
	Parent: "Slime",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Slime"],
	AddPose: ["ArmLeftTight", "ArmRightTight", "EncaseArmLeft", "EncaseArmRight"],
	Layers: ToLayerMap([
		...GetModelLayers("SlimeArmLeft"),
		...GetModelLayers("SlimeArmRight"),
		...GetModelLayers("SlimeTorsoUpper"),
	])
});