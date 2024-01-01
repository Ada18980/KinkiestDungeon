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
			InheritColor: "Rope",
		},
		{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Rope",
		},
		{ Name: "ForeArm1", Layer: "BindArmLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Rope",
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
		...GetModelLayers("RopeCrosstie1"),
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
		...GetModelLayers("RopeCrosstie1"),
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
		/*{ Name: "Arm1", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},*/
		/*{ Name: "Arm1Over", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
		},*/
		/*{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Rope",
		},*/
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Rope",
		},
		{ Name: "ForeArm2", Layer: "BindArmLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
			InheritColor: "Rope",
		},
	])
});


AddModel({
	Name: "RopeBoxtie2",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		...GetModelLayers("RopeBoxtie1"),
		...GetModelLayers("RopeChestStraps1"),
	])
});
AddModel({
	Name: "RopeWristtie2",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Wristties"],
	Layers: ToLayerMap([
		...GetModelLayers("RopeWristtie1"),
		...GetModelLayers("RopeChestStraps1"),
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
		/*{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
		{ Name: "ForeArm2", Layer: "LowerArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},*/
		{ Name: "ArmHarness", Layer: "ChestStraps", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Up"]),
			DisplacementSprite: "ArmHarnessSquish",
			DisplaceLayers: ToMap(["Rope1"]),
			Invariant: true,
			InheritColor: "Rope",
		},
		{ Name: "ArmStrapHarness", Layer: "ChestStraps", Pri: -2,
			Poses: ToMap(["Crossed"]),
			MorphPoses: {Crossed:"Crossed"},
			InheritColor: "Rope",
		},
		{ Name: "ArmHarnessUp", Sprite: "ArmHarness", Layer: "ChestStraps", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
			InheritColor: "Rope",
		},
	])
});


AddModel({
	Name: "RopeBoxtie3",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		...GetModelLayers("RopeBoxtie2"),
		...GetModelLayers("RopeChestStraps2"),
	])
});
AddModel({
	Name: "RopeWristtie3",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Wristties"],
	Layers: ToLayerMap([
		...GetModelLayers("RopeWristtie2"),
		...GetModelLayers("RopeChestStraps2"),
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
			Poses: ToMap(["Front", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "StrapsUnderbustOver"},
			DisplacementSprite: "CuffsSquish",
			DisplaceLayers: ToMap(["RopeFore"]),
			InheritColor: "Rope",
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
			InheritColor: "Rope",
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
	AddPose: ["CrotchStrap", "Chesttied"],
	Layers: ToLayerMap([
		{ Name: "Harness", Layer: "HarnessOver", Pri: 0,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RopeTorso"]),
			InheritColor: "Rope",
		},
		{ Name: "HarnessLower", Layer: "HarnessMid", Pri: -50,
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RopeTorso"]),
			InheritColor: "Rope",
		},
		{ Name: "HarnessLowerStrap", Layer: "HarnessMid", Pri: -50.1,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Rope",
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
		{ Name: "Crotchrope", Layer: "HarnessMid", Pri: -100,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "CrotchropeSquished",
			DisplaceLayers: ToMap(["RopeTorso"]),
			InheritColor: "Rope",

		},
		{ Name: "CrotchropeStrap", Layer: "HarnessMid", Pri: -101,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Rope",
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
		{ Name: "Toe", Layer: "OverShoes", Pri: 10,
			Poses: ToMap(["Closed"]),
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ToeTie"],
			InheritColor: "Rope",
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
			InheritColor: "Rope",
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
			InheritColor: "Rope",
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
		InheritColor: "Rope",
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
		InheritColor: "Rope",
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
		{ Name: "Thigh1", Layer: "Thighs1", Pri: 0,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementMorph: {Hogtie: "Hogtie"},
			DisplacementSprite: "Thigh1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeThighs"]),
			AppendPose: {EncaseLegs: "Over"},
			NoAppendDisplacement: true,
			InheritColor: "Rope",
		},
		{ Name: "RightThigh1", Layer: "Thighs1", Pri: 0,
			Poses: ToMap(["KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Rope",
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeLegs2", "RopeLegs1", [
	{ Name: "Thigh2", Layer: "Thighs2", Pri: 0,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RopeThighs"]),
		AppendPose: {EncaseLegs: "Over"},
		NoAppendDisplacement: true,
		InheritColor: "Rope",
	},
	{ Name: "RightThigh2", Layer: "Thighs2", Pri: 0,
		Poses: ToMap(["KneelClosed"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		InheritColor: "Rope",
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
		InheritColor: "Rope",
	},
	{ Name: "RightThigh3", Layer: "Thighs3", Pri: 0,
		Poses: ToMap(["KneelClosed"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		InheritColor: "Rope",
	},
], "RopeHarness", false));
