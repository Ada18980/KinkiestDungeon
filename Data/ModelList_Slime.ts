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
		{ Name: "FaceMouth", Layer: "GagFlat", Pri: -60,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Slime",
			AddPriWithPose: {
				ItemMouthRubberOver: 45,
			},
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
		{ Name: "FaceEyes", Layer: "Blindfold", Pri: -25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Slime",
			AddPriWithPose: {
				ItemHeadRubberOver: 45,
			},
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
	AddPoseConditional: {
		Xray: ["HoodMask",],
	},
	Layers: ToLayerMap([
		{ Name: "FaceFull", Layer: "Hood", Pri: -30,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Slime",
			AddPriWithPose: {
				ItemHeadRubberOver: 14,
			},
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
		{ Name: "FootLeft", Layer: "WrappingLegsUnder", Pri: 150,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			NoOverride: true,
			InheritColor: "Slime",
			ApplyFilterToLayerGroup: ToMap(["SlimeFeet", "BelowShoes"]),
			AddPriWithPose: {
				ItemBootsRubberOver: 45,
			},
			DisplaceLayers: ToMap(["Heels"]),
			DisplaceAmount: 100,
			DisplacementSprite: "SlimeLeft",
			DisplacementPoses: ["Closed"],
		},
		{ Name: "FootRight", Layer: "WrappingLegsRight", Pri: -150,
			//SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(["Closed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			InheritColor: "Slime",
			ApplyFilterToLayerGroup: ToMap(["SlimeFeet", "BelowShoes"]),
			AddPriWithPose: {
				ItemBootsRubberOver: 45,
			},
			DisplaceLayers: ToMap(["HeelRight"]),
			DisplaceAmount: 100,
			DisplacementSprite: "SlimeRight",
			DisplacementPoses: ["Closed"],
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
		{ Name: "TorsoLower", Layer: "WrappingTorsoLower", Pri: 54,
			//swaplayerpose: {Kneel: "WrappingTorso", KneelClosed: "WrappingTorso"},
			Invariant: true,
			ApplyFilterToLayerGroup: ToMap(["SlimeTorsoLower"]),
			InheritColor: "Slime",
			MorphPoses: {KneelClosed: "Kneel"},
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemLegsRubberOver: 45,
			},
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
		{ Name: "LegLeft", Layer: "WrappingLegsOver2", Pri: 24,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeLegs"]),
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemLegsRubberOver: 45,
			},
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["SlimeThighs"]),
			DisplacementSprite: "SlimeThighs",
		},
		{ Name: "LegRight", Layer: "WrappingLegsOver2", Pri: 24,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeLegs"]),
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemLegsRubberOver: 45,
			},
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
	AddPose: ["FeetLinked", "EncaseTorsoLower", "EncaseLegs"],
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
		{ Name: "AnkleLeft", Layer: "WrappingAnklesOver", Pri: 15,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeFeet", "BelowShoes"]),
			SwapLayerPose: {Kneel: "WrappingLegsOver", KneelClosed: "WrappingLegsOver"},
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemFeetRubberOver: 45,
			},
		},
		{ Name: "AnkleRight", Layer: "WrappingAnklesOver", Pri: 15,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			ApplyFilterToLayerGroup: ToMap(["SlimeFeet", "BelowShoes"]),
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemFeetRubberOver: 45,
			},
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
		{ Name: "ArmLeft", Layer: "WrapArms", Pri: 15,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
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
		{ Name: "ArmRight", Layer: "WrapArms", Pri: 15,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "WrapForeArms", Crossed: "WrapCrossArms"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
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
		{ Name: "TorsoUpper", Layer: "WrappingTorsoMid", Pri: 15,
			Invariant: true,
			HideOverrideLayerMulti: ["TopBinding"],
			InheritColor: "Slime",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
			EraseLayers: ToMap(["BustierPoses"]),
			EraseInvariant: true,
			EraseSprite: "SlimeCorsetErase",
		},
		{ Name: "Chest", Layer: "WrappingChest", Pri: 15,
			Invariant: true,
			CrossHideOverride: true,
			HideWhenOverridden: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
			InheritColor: "Slime",
			MorphPoses: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
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
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest", "WrapArms", "WrapChest"],
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
		{ Name: "HandLeft", Layer: "MittenLeft", Pri: 15,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie", "Yoked"]),
			SwapLayerPose: {Front: "ForeMittenLeft"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Slime",
			EraseSprite: "Mitts",
			EraseLayers: ToMap(["Mitts"]),
			AddPriWithPose: {
				ItemHandsRubberOver: 45,
			},
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
		{ Name: "HandRight", Layer: "MittenRight", Pri: 15,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie", "Yoked"]),
			SwapLayerPose: {Front: "ForeMittenRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Slime",
			AddPriWithPose: {
				ItemHandsRubberOver: 45,
			},
		},
	])
});


AddModel({
	Name: "SlimeHands",
	Folder: "Slime",
	Parent: "SlimeArms",
	TopLevel: false,
	Restraint: true,
	Filters: {
		"Slime": slimefilter,
	},
	Categories: ["Restraints", "Slime"],
	AddPose: ["EncaseHandRight", "EncaseHandLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("SlimeHandLeft"),
		...GetModelLayers("SlimeHandRight"),
	])
});