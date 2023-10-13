/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "RibbonCrosstie1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Crossties"],
	Layers: ToLayerMap([
		{ Name: "ArmStrap", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Crossed"]),
			MorphPoses: {Crossed:"Crossed"},
			DisplacementSprite: "ArmStrap",
			DisplacementMorph: {Crossed:"Crossed"},
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
	])
});

AddModel({
	Name: "RibbonBoxtie1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		/*{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Boxtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},*/
	])
});


AddModel({
	Name: "RibbonWristtie1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Wristties"],
	Layers: ToLayerMap([
		/*{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},*/
		{ Name: "ForeArm1", Layer: "ForeArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
	])
});

// Cosmetic only
AddModel({
	Name: "RibbonChestStraps1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["RibbonsLower"],
	Layers: ToLayerMap([
		{ Name: "Arm1", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		/*{ Name: "Arm1Over", Layer: "StrapsUnderbustOver", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
		},*/
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		{ Name: "ForeArm2", Layer: "ForeArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
	])
});
AddModel({
	Name: "RibbonChestStraps2",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["RibbonsUpper"],
	Layers: ToLayerMap([
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		{ Name: "ForeArm2", Layer: "ForeArmBondageLeft", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		{ Name: "ArmHarness", Layer: "ChestStraps", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Up"]),
			DisplacementSprite: "ArmHarnessSquish",
			DisplaceLayers: ToMap(["Ribbon1"]),
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
	Name: "RibbonCuffs",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Handcuffed"],
	Layers: ToLayerMap([
		{ Name: "Cuffs", Layer: "ForeWrists", Pri: 0,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			DisplacementSprite: "CuffsSquish",
			DisplaceLayers: ToMap(["RibbonFore"]),
		},
	])
});

AddModel({
	Name: "RibbonBelt",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "BeltBondage", Pri: 0,
			Invariant: true,
			DisplacementSprite: "BeltSquish",
			DisplaceLayers: ToMap(["RibbonCalf"]),
		},
	])
});

AddModel({
	Name: "RibbonHarness",
	Folder: "Ribbon",
	Parent: "Ribbon",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Harness", Layer: "HarnessOver", Pri: 0,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RibbonTorso"]),
		},
		{ Name: "HarnessLower", Layer: "HarnessMid", Pri: 0,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RibbonTorso"]),
		},
	])
});
AddModel({
	Name: "RibbonCrotch",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "CrotchRibbon", Layer: "HarnessLower", Pri: 1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "CrotchRibbonSquish",
			DisplaceLayers: ToMap(["RibbonTorso"]),

		},
	])
});

AddModel({
	Name: "RibbonToes",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Toe", Layer: "OverShoes", Pri: 10,
			Poses: ToMap(["Closed"]),
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ToeTie"],
		},
	])
});

AddModel({
	Name: "RibbonFeet",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["FeetLinked", "RibbonsAnkle"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "OverShoes", Pri: 11,
			Poses: ToMap(["Closed", "KneelClosed"]),
			DisplacementSprite: "AnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
			AppendPose: {EncaseFeet: "Over"},
			NoAppendDisplacement: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("RibbonFeetHeavy", "RibbonFeet", [
	...GetModelLayers("RibbonToes"),
], "RibbonHarness", false));


AddModel({
	Name: "RibbonAnkles1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["FeetLinked", "RibbonsAnkle"],
	Layers: ToLayerMap([
		{ Name: "Calf1", Layer: "Ankles1", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "Calf1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
			AppendPose: {EncaseAnkles: "Over"},
			NoAppendDisplacement: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("RibbonAnkles2", "RibbonAnkles1", [
	{ Name: "Calf2", Layer: "Ankles2", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonCalf"]),
		AppendPose: {EncaseAnkles: "Over"},
		NoAppendDisplacement: true,
	},
], "RibbonHarness", false));


AddModel(GetModelWithExtraLayers("RibbonAnkles3", "RibbonAnkles2", [
	{ Name: "Calf3", Layer: "Ankles3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonCalf"]),
		AppendPose: {EncaseAnkles: "Over"},
		NoAppendDisplacement: true,
	},
], "RibbonHarness", false));



AddModel({
	Name: "RibbonLegs1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Thigh1", Layer: "Thighs1", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementMorph: {Hogtie: "Hogtie"},
			DisplacementSprite: "Thigh1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonThighs"]),
			AppendPose: {EncaseLegs: "Over"},
			NoAppendDisplacement: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("RibbonLegs2", "RibbonLegs1", [
	{ Name: "Thigh2", Layer: "Thighs2", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonThighs"]),
		AppendPose: {EncaseLegs: "Over"},
		NoAppendDisplacement: true,
	},
], "RibbonHarness", false));


AddModel(GetModelWithExtraLayers("RibbonLegs3", "RibbonLegs2", [
	{ Name: "Thigh3", Layer: "Thighs3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonThighs"]),
		AppendPose: {EncaseLegs: "Over"},
		NoAppendDisplacement: true,
	},
], "RibbonHarness", false));
