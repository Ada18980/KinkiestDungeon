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
	AddPose: ["HideMouth", "FaceGag"],
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
	Name: "LargeBallGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 1,
			Sprite: "BigBall",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 13,
			Sprite: "BigBallStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});
AddModel(GetModelWithExtraLayers("LargeBallGagHarness", "LargeBallGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 15,
		Sprite: "BallHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "LargeBallGag", false));
AddModel(GetModelWithExtraLayers("LargeBallGagHarnessSecure", "LargeBallGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 20,
		Sprite: "BallSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "LargeBallGag", false));

AddModel({
	Name: "PanelGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Panel", Layer: "GagFlat", Pri: 5,
			Sprite: "Panel",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 17,
			Sprite: "BallStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});
AddModel(GetModelWithExtraLayers("PanelGagHarness", "PanelGag", [
	{ Name: "Harness", Layer: "GagFlatStraps", Pri: 19,
		Sprite: "PanelHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "PanelGag", false));
AddModel(GetModelWithExtraLayers("PanelGagHarnessSecure", "PanelGagHarness", [
	{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
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
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Muzzle", Layer: "GagMuzzle", Pri: 3,
			Sprite: "Muzzle",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagMuzzleStraps", Pri: 15,
			Sprite: "MuzzleStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("MuzzleGagHarness", "MuzzleGag", [
	{ Name: "Harness", Layer: "GagMuzzleStraps", Pri: 18,
		Sprite: "MuzzleHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "MuzzleGag", false));
AddModel(GetModelWithExtraLayers("MuzzleGagHarnessSecure", "MuzzleGagHarness", [
	{ Name: "SideStrap", Layer: "GagMuzzleStraps", Pri: 22,
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
		{ Name: "Plug", Layer: "GagMuzzle", Pri: 14,
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
	Name: "Stuffing",
	Folder: "GagTape",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceGag"],
	Layers: ToLayerMap([
		{ Name: "Stuffing", Layer: "GagUnder", Pri: -100,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "TapeFace",
	Folder: "GagTape",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags", "Blindfolds", "Masks"],
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Face", Layer: "Mask", Pri: -50,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeFull",
	Folder: "GagTape",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Full", Layer: "GagMuzzle", Pri: -50,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeWrap",
	Folder: "GagTape",
	TopLevel: false,
	Parent: "TapeFull",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Wrap", Layer: "GagFlat", Pri: 0,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeCleave",
	Folder: "GagTape",
	TopLevel: false,
	Parent: "TapeFull",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Cleave", Layer: "Gag", Pri: -100,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});



AddModel({
	Name: "ClothCleave",
	Folder: "GagCloth",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Cleave", Layer: "Gag", Pri: -25,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Cloth",
		},
	])
});
AddModel({
	Name: "ClothCleaveThick",
	Folder: "GagCloth",
	TopLevel: false,
	Parent: "ClothCleave",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "CleaveThick", Layer: "Gag", Pri: -20,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Cloth",
		},
	])
});

AddModel({
	Name: "ClothKnot",
	Folder: "GagCloth",
	TopLevel: false,
	Parent: "ClothCleave",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Knot", Layer: "Gag", Pri: 0,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Cloth",
		},
	])
});

AddModel({
	Name: "ClothOTN",
	Folder: "GagCloth",
	TopLevel: false,
	Parent: "ClothCleave",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "OTN", Layer: "GagMuzzle", Pri: -30,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Cloth",
		},
	])
});

AddModel({
	Name: "ClothOTM",
	Folder: "GagCloth",
	TopLevel: false,
	Parent: "ClothCleave",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "OTM", Layer: "GagFlat", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Cloth",
		},
	])
});



AddModel({
	Name: "BlindfoldBasic",
	Folder: "Blindfold",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Basic", Layer: "Blindfold", Pri: 0,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Blindfold",
		},
		{ Name: "BasicRim", Layer: "Blindfold", Pri: 0.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			NoOverride: true,
			InheritColor: "Rim",
		},
	])
});


AddModel({
	Name: "BlindfoldTape",
	Folder: "Blindfold",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Tape", Layer: "Blindfold", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Tape",
		},
	])
});


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


