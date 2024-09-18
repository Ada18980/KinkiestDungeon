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
		{ Name: "FaceMouth", Layer: "GagOver", Pri: -60,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rubber",
			AddPriWithPose: {
				ItemMouthRubberOver: 45,
			},
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
		{ Name: "FaceEyes", Layer: "Blindfold", Pri: -25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rubber",
			AddPriWithPose: {
				ItemHeadRubberOver: 45,
			},
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
	AddPoseConditional: {
		Xray: ["HoodMask",],
	},
	Layers: ToLayerMap([
		{ Name: "FaceFull", Layer: "Hood", Pri: -25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rubber",
			AddPriWithPose: {
				ItemHeadRubberOver: 10,
			},
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
		{ Name: "FootLeft", Layer: "WrappingLegsUnder", Pri: 50,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			InheritColor: "Rubber",
			AddPriWithPose: {
				ItemBootsRubberOver: 45,
			},
			DisplaceLayers: ToMap(["Heels"]),
			DisplaceAmount: 100,
			DisplacementSprite: "SlimeLeft",
			DisplacementPoses: ["Closed"],
		},
		{ Name: "FootRight", Layer: "WrappingLegsRight", Pri: 50,
			//SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(["Closed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			NoOverride: true,
			InheritColor: "Rubber",
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
	Name: "RubberTorsoLower",
	Folder: "Rubber",
	Parent: "RubberLegs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseTorsoLower"],
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "WrappingTorsoLower", Pri: 54,
			//swaplayerpose: {Kneel: "WrappingTorso", KneelClosed: "WrappingTorso"},
			Invariant: true,
			InheritColor: "Rubber",
			MorphPoses: {KneelClosed: "Kneel"},
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemLegsRubberOver: 45,
			},
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
		{ Name: "LegLeft", Layer: "WrappingLegsOver2", Pri: 25,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemLegsRubberOver: 45,
			},
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["SlimeThighs"]),
			DisplacementSprite: "SlimeThighs",
		},
		{ Name: "LegRight", Layer: "WrappingLegsOver2", Pri: 25,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemLegsRubberOver: 45,
			},
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
	AddPose: ["FeetLinked", "EncaseTorsoLower", "EncaseLegs"],
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
		{ Name: "AnkleLeft", Layer: "WrappingAnklesOver", Pri: 25,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "WrappingLegsOver", KneelClosed: "WrappingLegsOver"},
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemFeetRubberOver: 45,
			},
		},
		{ Name: "AnkleRight", Layer: "WrappingAnklesOver", Pri: 25,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemFeetRubberOver: 45,
			},
		},
	])
});


AddModel({
	Name: "Hobbleskirt",
	Folder: "Rubber",
	Parent: "Rubber",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["FeetLinked", "EncaseTorsoLower", "EncaseLegs", "FeetLinked", "EncaseAnkles"],
	Layers: ToLayerMap([
		...GetModelLayers("RubberThighs"),
		...GetModelLayers("RubberTorsoLower"),
		...GetModelLayers("RubberFeet"),
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
		{ Name: "ArmLeft", Layer: "WrapArms", Pri: 25,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "WrapForeArms", Crossed: "WrapCrossArms"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
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
		{ Name: "ArmRight", Layer: "WrapArms", Pri: 25,
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "WrapForeArms", Crossed: "WrapCrossArms"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
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
		{ Name: "TorsoUpper", Layer: "WrappingTorsoMid", Pri: 25,
			Invariant: true,
			HideOverrideLayerMulti: ["TopBinding"],
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
			EraseLayers: ToMap(["BustierPoses"]),
			EraseInvariant: true,
			EraseSprite: "SlimeCorsetErase",
		},
		{ Name: "Chest", Layer: "WrappingChest", Pri: 25,
			Invariant: true,
			InheritColor: "Rubber",
			HideWhenOverridden: true,
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ChestBinding"],
			ForceSingleOverride: true,
			MorphPoses: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			AddPriWithPose: {
				ItemArmsRubberOver: 45,
			},
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
	AddPose: ["EncaseArmLeft", "EncaseArmRight", "EncaseTorsoUpper", "EncaseChest", "WrapArms", "WrapChest"],
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
		{ Name: "HandLeft", Layer: "MittenLeft", Pri: 25,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie", "Yoked"]),
			SwapLayerPose: {Front: "ForeMittenLeft"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Rubber",
			EraseSprite: "Mitts",
			EraseLayers: ToMap(["Mitts"]),
			AddPriWithPose: {
				ItemHandsRubberOver: 45,
			},
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
		{ Name: "HandRight", Layer: "MittenRight", Pri: 25,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie", "Yoked"]),
			SwapLayerPose: {Front: "ForeMittenRight"},
			HidePoses: ToMap(["HideHands"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Rubber",
			AddPriWithPose: {
				ItemHandsRubberOver: 45,
			},
		},
	])
});



AddModel({
	Name: "RubberHands",
	Folder: "Rubber",
	Parent: "RubberArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rubber"],
	AddPose: ["EncaseHandRight", "EncaseHandLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("RubberHandLeft"),
		...GetModelLayers("RubberHandRight"),
	])
});