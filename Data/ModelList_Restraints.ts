/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BallGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 1,
			Sprite: "Ball",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			MorphPoses: {MouthNeutral: "_TeethDeep", MouthSurprised: "_Teeth", MouthPout: "_TeethDeep", MouthDistracted: "_Teeth"},
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});
AddModel(GetModelWithExtraLayers("BallGagHarness", "BallGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "BallHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "BallGag", false));
AddModel(GetModelWithExtraLayers("BallGagHarnessSecure", "BallGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 20,
		Sprite: "BallSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "BallGag", false));



AddModel({
	Name: "PanelGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Panel", Layer: "GagFlat", Pri: 1,
			Sprite: "Panel",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});
AddModel(GetModelWithExtraLayers("PanelGagHarness", "PanelGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "PanelHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "PanelGag", false));
AddModel(GetModelWithExtraLayers("PanelGagHarnessSecure", "PanelGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 21,
		Sprite: "PanelSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "PanelGag", false));



AddModel({
	Name: "MuzzleGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Muzzle", Layer: "GagFlat", Pri: 3,
			Sprite: "Muzzle",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "MuzzleStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("MuzzleGagHarness", "MuzzleGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "MuzzleHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "MuzzleGag", false));
AddModel(GetModelWithExtraLayers("MuzzleGagHarnessSecure", "MuzzleGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 22,
		Sprite: "MuzzleSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "MuzzleGag", false));



AddModel({
	Name: "PlugGagPlug",
	Folder: "Dummy",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: [],
	Layers: ToLayerMap([
		{ Name: "Plug", Layer: "GagFlat", Pri: 4,
			Sprite: "Plug",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("PlugMuzzleGag", "MuzzleGag", [
	...GetModelLayers("PlugGagPlug"),
], "MuzzleGag", false));
AddModel(GetModelWithExtraLayers("PlugMuzzleGagHarness", "MuzzleGagHarness", [
	...GetModelLayers("PlugGagPlug"),
], "MuzzleGag", false));
AddModel(GetModelWithExtraLayers("PlugMuzzleGagHarnessSecure", "MuzzleGagHarnessSecure", [
	...GetModelLayers("PlugGagPlug"),
], "MuzzleGag", false));


AddModel({
	Name: "RopeBoxtie1",
	Folder: "Rope",
	Parent: "RopeHarness",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Boxtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
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
		{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Wristtie"]),
			DisplacementSprite: "Arm1Squish",
			DisplaceLayers: ToMap(["Rope1"]),
		},
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
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
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
			Poses: ToMap(["Boxtie", "Wristtie"]),
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
	//AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Harness", Layer: "HarnessOver", Pri: 0,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
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
		{ Name: "Crotchrope", Layer: "HarnessMid", Pri: 1,
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
		{ Name: "Ankles", Layer: "OverShoes", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed"]),
			DisplacementSprite: "AnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeCalf"]),
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
	},
], "RopeHarness", false));


AddModel(GetModelWithExtraLayers("RopeAnkles3", "RopeAnkles2", [
	{ Name: "Calf3", Layer: "Ankles3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		DisplacementSprite: "Calf3Squish",
		DisplaceAmount: 50,
		DisplaceLayers: ToMap(["RopeCalf"]),
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
	},
], "RopeHarness", false));


AddModel({
	Name: "StardustCollar",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 50,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "SteelYoke",
	Folder: "Yoke",
	Parent: "Yoke",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Metal", "Yokes"],
	AddPose: ["Yokes"],
	Layers: ToLayerMap([
		{ Name: "Steel", Layer: "Yoke", Pri: 10,
			Invariant: true,
			HideWhenOverridden: true,
			DisplacementSprite: "Yoke",
			DisplaceLayers: ToMap(["Yoke"]),
			DisplaceAmount: 40,
		},
		{ Name: "SteelBar", Layer: "Yoke", Pri: 10.1,
			Invariant: true,
			HideWhenOverridden: true,
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "SmoothArmbinder",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		{ Name: "BinderLeft", Layer: "BindArmLeft", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Binder",
			DisplacementSprite: "BinderLeft",
			DisplaceLayers: ToMap(["Arms"]),
			DisplaceAmount: 100,
		},
		{ Name: "BinderRight", Layer: "BindArmRight", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Boxtie", "Wristtie"]),
			InheritColor: "Binder",
			DisplacementSprite: "BinderRight",
			DisplaceLayers: ToMap(["Arms"]),
			DisplaceAmount: 100,
		},
	])
});



AddModel({
	Name: "Armbinder",
	Folder: "Armbinder",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather", "Armbinders"],
	AddPose: ["HideHands"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "StrapsLeft", Layer: "BindArmLeft", Pri: 31,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			NoOverride: true,
			InheritColor: "BinderStraps",
		},
		{ Name: "StrapsRight", Layer: "BindArmRight", Pri: 31,
			HideWhenOverridden: true,
			Poses: ToMap(["Boxtie"]),
			NoOverride: true,
			InheritColor: "BinderStraps",
		},
	])
});



AddModel({
	Name: "ArmbinderCross",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "Cross", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "SmoothArmbinderCross",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Cross", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "ArmbinderSecure",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "Secure", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "SmoothArmbinderSecure",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Secure", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "ArmbinderGwen",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "Gwen", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});


AddModel({
	Name: "SmoothArmbinderGwen",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Gwen", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});
