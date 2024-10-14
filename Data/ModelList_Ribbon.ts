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
		{ Name: "ArmStrap", Layer: "StrapsUnderbustOver", Pri: 4,
			Poses: ToMap(["Crossed"]),
			MorphPoses: {Crossed:"Crossed"},
			DisplacementSprite: "ArmStrap",
			DisplacementMorph: {Crossed:"Crossed"},
			DisplaceLayers: ToMap(["Ribbon1"]),
			InheritColor: "Ribbon",
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
		{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 4,
			Poses: ToMap(["Boxtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
			InheritColor: "Ribbon",
		},
	])
});


AddModel({
	Name: "RibbonWristtie1",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Wristties", "Chesttied"],
	Layers: ToLayerMap([
		/*{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 4,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},*/
		{ Name: "ForeArm1", Layer: "BindArmLeft", Pri: 4,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
			InheritColor: "Ribbon",
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
		/*{ Name: "Arm1", Layer: "StrapsUnderbustOver", Pri: 4,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},*/
		/*{ Name: "Arm1Over", Layer: "StrapsUnderbustOver", Pri: 4,
			Poses: ToMap(["Boxtie", "Wristtie"]),
		},*/
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 4,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
			InheritColor: "Ribbon",
		},
		{ Name: "ForeArm2", Layer: "BindArmLeft", Pri: 4,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
			InheritColor: "Ribbon",
		},
	])
});


AddModel({
	Name: "RibbonBoxtie2",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		...GetModelLayers("RibbonBoxtie1"),
		...GetModelLayers("RibbonChestStraps1"),
	])
});


AddModel({
	Name: "RibbonWristtie2",
	Folder: "Ribbon",
	Parent: "RibbonHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["Wristties"],
	Layers: ToLayerMap([
		...GetModelLayers("RibbonWristtie1"),
		...GetModelLayers("RibbonChestStraps1"),
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
		/*{ Name: "Arm2", Layer: "ChestStraps", Pri: 4,
			Poses: ToMap(["Boxtie", "Wristtie", "Crossed"]),
			DisplacementSprite: "Arm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		{ Name: "ForeArm2", Layer: "LowerArmBondageLeft", Pri: 4,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "ForeArm2Squish",
			DisplaceLayers: ToMap(["Ribbon1"]),
		},*/
		{ Name: "ArmHarness", Layer: "ChestStraps", Pri: 3,
			Poses: ToMapSubtract([...ARMPOSES], ["Up"]),
			DisplacementSprite: "ArmHarnessSquish",
			DisplaceLayers: ToMap(["Ribbon1"]),
			Invariant: true,
			InheritColor: "Ribbon",
		},
		{ Name: "ArmHarnessUnderbust", Layer: "StrapsUnderbust", Pri: 2,
			Invariant: true,
			InheritColor: "Ribbon",
		},
		{ Name: "ArmStrap", Layer: "ChestStraps", Pri: 2,
			Poses: ToMap(["Crossed"]),
			MorphPoses: {Crossed:"Crossed"},
			InheritColor: "Ribbon",
		},
		{ Name: "ArmHarnessUp", Sprite: "ArmHarness", Layer: "ChestStraps", Pri: 3,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
			InheritColor: "Ribbon",
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
		{ Name: "Cuffs", Layer: "ForeWrists", Pri: 4,
			Poses: ToMap(["Front", "Crossed"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "StrapsUnderbustOver"},
			DisplacementSprite: "CuffsSquish",
			DisplaceLayers: ToMap(["RibbonFore"]),
			InheritColor: "Ribbon",
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
		{ Name: "Belt", Layer: "BeltBondage", Pri: 4,
			Invariant: true,
			DisplacementSprite: "BeltSquish",
			DisplaceLayers: ToMap(["RibbonCalf"]),
			InheritColor: "Ribbon",
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
		{ Name: "Harness", Layer: "HarnessOver", Pri: 4,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RibbonTorso"]),
			InheritColor: "Ribbon",
		},
		{ Name: "HarnessMid", Layer: "HarnessMid", Pri: 4,
			Invariant: true,
			AppendPose: {FlattenedUnderbust: "Flattened"},
			DisplacementInvariant: true,
			DisplacementSprite: "HarnessSquish",
			DisplaceLayers: ToMap(["RibbonTorso"]),
			InheritColor: "Ribbon",
		},
		{ Name: "HarnessLower", Layer: "HarnessMid", Pri: 4,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			InheritColor: "Ribbon",
			//DisplacementInvariant: true,
			//DisplacementSprite: "HarnessSquish",
			//DisplaceLayers: ToMap(["RibbonTorso"]),
		},
		{ Name: "HarnessLowerStrap", Layer: "HarnessMid", Pri: 4,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Ribbon",
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
	AddPoseConditional: {
		OptionCrotchRope: ["CrotchStrap"],
	},
	AddPoseIf: {
		//ChastityBelt: ["OptionCrotchRope"],
	},
	Layers: ToLayerMap([
		{ Name: "Crotch", Layer: "HarnessMid", Pri: -95,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			SwapLayerPose: {OptionCrotchRope: "CrotchRope"},
			Invariant: true,
			InheritColor: "Ribbon",
			DisplacementInvariant: true,
			DisplacementSprite: "CrotchropeSquished",
			DisplaceLayers: ToMap(["RibbonTorso"]),

		},
		{ Name: "CrotchStrap", Layer: "HarnessMid", Pri: -95.1,
			SwapLayerPose: {OptionCrotchRope: "CrotchRope"},
			Invariant: true,
			InheritColor: "Ribbon",
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
		{ Name: "Toe", Layer: "OverShoes", Pri: 14,
			Poses: ToMap(["Closed"]),
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ToeTie"],
			InheritColor: "Ribbon",
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
		{ Name: "Feet", Layer: "OverShoes", Pri: 15,
			Poses: ToMap(["Closed", "KneelClosed"]),
			DisplacementSprite: "AnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
			InheritColor: "Ribbon",
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
		{ Name: "Calf1", Layer: "Ankles1", Pri: 5,
			Poses: ToMap(["Closed", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "Calf1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
			InheritColor: "Ribbon",
		},
	])
});

AddModel(GetModelWithExtraLayers("RibbonAnkles2", "RibbonAnkles1", [
	{ Name: "Calf2", Layer: "Ankles2", Pri: 5,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonCalf"]),
		InheritColor: "Ribbon",
	},
], "RibbonHarness", false));


AddModel(GetModelWithExtraLayers("RibbonAnkles3", "RibbonAnkles2", [
	{ Name: "Calf3", Layer: "Ankles3", Pri: 5,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonCalf"]),
		InheritColor: "Ribbon",
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
		{ Name: "Thigh1", Layer: "Thighs1", Pri: 5,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementMorph: {Hogtie: "Hogtie"},
			DisplacementSprite: "Thigh1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonThighs"]),
			InheritColor: "Ribbon",
		},
		{ Name: "RightThigh1", Layer: "RightThighs1", Pri: 5,
			Poses: ToMap(["KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Ribbon",
		},
	])
});

AddModel(GetModelWithExtraLayers("RibbonLegs2", "RibbonLegs1", [
	{ Name: "Thigh2", Layer: "Thighs2", Pri: 5,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh2Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonThighs"]),
		InheritColor: "Ribbon",
	},
	{ Name: "RightThigh2", Layer: "RightThighs2", Pri: 5,
		Poses: ToMap(["KneelClosed"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		InheritColor: "Ribbon",
	},
], "RibbonHarness", false));


AddModel(GetModelWithExtraLayers("RibbonLegs3", "RibbonLegs2", [
	{ Name: "Thigh3", Layer: "Thighs3", Pri: 5,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		DisplacementMorph: {Hogtie: "Hogtie"},
		DisplacementSprite: "Thigh3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RibbonThighs"]),
		InheritColor: "Ribbon",
	},
	{ Name: "RightThigh3", Layer: "RightThighs3", Pri: 5,
		Poses: ToMap(["KneelClosed"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
		InheritColor: "Ribbon",
	},
], "RibbonHarness", false));

AddModel(GetModelFashionVersion("RibbonHarness", true));
AddModel(GetModelFashionVersion("RibbonCrotch", true));