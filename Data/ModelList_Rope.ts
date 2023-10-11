/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "RopeCrosstie1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Crossties"],
	Layers: ToLayerMap([
		{ Name: "ArmStrap", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Crossed"]),
			MorphPoses: {Crossed:"Crossed"},
			DisplacementSprite: "ArmStrap",
			DisplacementMorph: {Crossed:"Crossed"},
			DisplaceLayers: ToMap(["Rope1"]),
		},
	])
});
AddModel({
	Name: "RopeBoxtie1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		/*{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Boxtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},*/
	])
});


AddModel({
	Name: "RopeWristtie1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Wristties"],
	Layers: ToLayerMap([
		/*{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},*/
		{ Name: "ForeArm1", Layer: "ForeArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
	])
});

// Cosmetic only
AddModel({
	Name: "RopeChestStraps1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["RopesLower"],
	Layers: ToLayerMap([
		{ Name: "Arm1", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
		/*{ Name: "Arm1Over", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
		},*/
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
		{ Name: "ForeArm2", Layer: "ForeArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
	])
});
AddModel({
	Name: "RopeChestStraps2",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["RopesUpper"],
	Layers: ToLayerMap([
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
		{ Name: "ForeArm2", Layer: "ForeArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
		{ Name: "ArmHarness", Layer: "ChestStraps", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Up"]),
			DisplacementSprite: "ArmHarnessSquish",
			DisplaceLayers: ToMap(["Rope1"]),
			Invariant: true,
		},
		{ Name: "ArmStrapHarness", Layer: "ChestStraps", Pri: -2,
			Poses: ToMap(["Crossed"]),
			MorphPoses: {Crossed:"Crossed"},
		},
		{ Name: "ArmHarnessUp", Sprite: "ArmHarness", Layer: "ChestStraps", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
	])
});


AddModel({
	Name: "RopeCuffs",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Handcuffed"],
	Layers: ToLayerMap([
		{ Name: "Cuffs", Layer: "ForeWrists", Pri: 0,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			DisplacementSprite: "CuffsSquish",
			DisplaceLayers: ToMap(["RopeFore"]),
		},
	])
});

AddModel({
	Name: "RopeBelt",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "BeltBondage", Pri: 0,
			Invariant: true,
			DisplacementSprite: "BeltSquish",
			DisplaceLayers: ToMap(["RopeCalf"]),
		},
	])
});

AddModel({
	Name: "RopeHarness",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Harness", Layer: "HarnessOver", Pri: 0,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RopeTorso"]),
		},
		{ Name: "HarnessLower", Layer: "HarnessMid", Pri: 0,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RopeTorso"]),
		},
	])
});
AddModel({
	Name: "RopeCrotch",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Crotchrope", Layer: "HarnessLower", Pri: 1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "CrotchropeSquish",
			DisplaceLayers: ToMap(["RopeTorso"]),

		},
	])
});

AddModel({
	Name: "RopeToes",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Toe", Layer: "OverSocks", Pri: 10,
			Poses: ToMap(["Closed"]),
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ToeTie"],
		},
	])
});

AddModel({
	Name: "RopeFeet",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked", "RopesAnkle"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "OverShoes", Pri: 11,
			Poses: ToMap(["Closed", "KneelClosed"]),
			DisplacementSprite: "AnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeCalf"]),
			AppendPose: {EncaseFeet: "Over"},
			NoAppendDisplacement: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeFeetHeavy", "RopeFeet", [
	...GetModelLayers("RopeToes"),
], "RopeHarness", false));


AddModel({
	Name: "RopeAnkles1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked", "RopesAnkle"],
	Layers: ToLayerMap([
		{ Name: "Calf1", Layer: "Ankles1", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "Calf1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeCalf"]),
			AppendPose: {EncaseAnkles: "Over"},
			NoAppendDisplacement: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeAnkles2", "RopeAnkles1", [
	{ Name: "Calf2", Layer: "Ankles2", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RopeCalf"]),
		AppendPose: {EncaseAnkles: "Over"},
		NoAppendDisplacement: true,
	},
], "RopeHarness", false));


AddModel(GetModelWithExtraLayers("RopeAnkles3", "RopeAnkles2", [
	{ Name: "Calf3", Layer: "Ankles3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RopeCalf"]),
		AppendPose: {EncaseAnkles: "Over"},
		NoAppendDisplacement: true,
	},
], "RopeHarness", false));



AddModel({
	Name: "RopeLegs1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Thigh1", Layer: "Thighs1", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementMorph: {Hogtie: "Hogtie"},
			DisplacementSprite: "Thigh1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeThighs"]),
			AppendPose: {EncaseLegs: "Over"},
			NoAppendDisplacement: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeLegs2", "RopeLegs1", [
	{ Name: "Thigh2", Layer: "Thighs2", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RopeThighs"]),
		AppendPose: {EncaseLegs: "Over"},
		NoAppendDisplacement: true,
	},
], "RopeHarness", false));


AddModel(GetModelWithExtraLayers("RopeLegs3", "RopeLegs2", [
	{ Name: "Thigh3", Layer: "Thighs3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RopeThighs"]),
		AppendPose: {EncaseLegs: "Over"},
		NoAppendDisplacement: true,
	},
], "RopeHarness", false));
