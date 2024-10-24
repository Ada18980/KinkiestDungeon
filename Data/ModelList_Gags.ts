/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "MaidGag",
	Folder: "GagFrilly",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "FrillyPanel", Layer: "Gag", Pri: 13,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Panel",
		},
		{ Name: "FrillyStraps", Layer: "GagStraps", Pri: 16,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "FrillyHardware", Layer: "GagStraps", Pri: 14,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Hardware",
		},
		{ Name: "FrillyHighlights", Layer: "GagStraps", Pri: 14,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Highlights",
		},
	])
});
AddModel(GetModelFashionVersion("MaidGag", true));

AddModel({
	Name: "DusterGag",
	Folder: "GagFrilly",
	TopLevel: false,
	Group: "Mouth",
	Parent: "MaidGag",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceGag", "StuffMouth"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidGag"),
		{ Name: "Duster", Layer: "MouthProp", Pri: 15,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "GhostGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: -50,
			Sprite: "GhostBall",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: -50,
			Sprite: "GhostBallStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});
AddModel(GetModelFashionVersion("DusterGag", true));

AddModel({
	Name: "BallGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 1,
			Sprite: "Ball",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			MorphPoses: {MouthNeutral: "_TeethDeep", MouthSurprised: "_Teeth", MouthPout: "_TeethDeep", MouthDistracted: "_Teeth"},
		},
		{ Name: "BallTeeth", Layer: "Gag", Pri: 1.1,
			Sprite: "Ball",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			TieToLayer: "Ball",
			Poses: {MouthNeutral: true, MouthSurprised: true, MouthPout: true, MouthDistracted: true},
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
AddModel(GetModelFashionVersion("BallGag", true));
AddModel(GetModelFashionVersion("BallGagHarness", true));
AddModel(GetModelFashionVersion("BallGagHarnessSecure", true));


AddModel({
	Name: "LargeBallGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag", "StuffMouth"],
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
		AppendPose: {FaceBigGag: "Large"},
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
	Name: "CrystalBallGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 2,
			Sprite: "CrystalBall",
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

AddModel({
	Name: "CrystalBallGagSmooth",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 2,
			Sprite: "CrystalBall",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 13,
			Sprite: "BigBallStrap",
			Folder: "GagMetal",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "PanelGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceCoverGag", "StuffMouth"],
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
AddModel(GetModelFashionVersion("PanelGag", true));
AddModel(GetModelFashionVersion("PanelGagHarness", true));
AddModel(GetModelFashionVersion("PanelGagHarnessSecure", true));


AddModel({
	Name: "MuzzleGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceCoverGag", "StuffMouth"],
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
AddModel(GetModelFashionVersion("MuzzleGag", true));
AddModel(GetModelFashionVersion("MuzzleGagHarness", true));
AddModel(GetModelFashionVersion("MuzzleGagHarnessSecure", true));



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


AddModel(GetModelWithExtraLayers("PlugPanelGag", "PanelGag", [
	...GetModelLayers("PlugGagPlug"),
], "PanelGag", false));
AddModel(GetModelWithExtraLayers("PlugPanelGagHarness", "PanelGagHarness", [
	...GetModelLayers("PlugGagPlug"),
], "PanelGag", false));
AddModel(GetModelWithExtraLayers("PlugPanelGagHarnessSecure", "PanelGagHarnessSecure", [
	...GetModelLayers("PlugGagPlug"),
], "PanelGag", false));

AddModel(GetModelFashionVersion("PlugMuzzleGag", true));
AddModel(GetModelFashionVersion("PlugMuzzleGagHarness", true));
AddModel(GetModelFashionVersion("PlugMuzzleGagHarnessSecure", true));
AddModel(GetModelFashionVersion("PlugPanelGag", true));
AddModel(GetModelFashionVersion("PlugPanelGagHarness", true));
AddModel(GetModelFashionVersion("PlugPanelGagHarnessSecure", true));



AddModel({
	Name: "Stuffing",
	Folder: "GagTape",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["StuffMouth", "FaceGag"],
	Layers: ToLayerMap([
		{ Name: "Stuffing", Layer: "GagUnder", Pri: -100,
			HidePoses: ToMap(["HideMouth"]),
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
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
	AddPose: ["FaceCoverGag"],
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
	Layers: ToLayerMap([
		{ Name: "Wrap", Layer: "GagFlat", Pri: -50,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});


AddModel({
	Name: "TapeFullOver",
	Folder: "GagTape",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Full", Layer: "GagOver", Pri: -50,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeWrapOver",
	Folder: "GagTape",
	TopLevel: false,
	Parent: "TapeFull",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	Layers: ToLayerMap([
		{ Name: "Wrap", Layer: "GagOver", Pri: -45,
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
AddModel(GetModelFashionVersion("TapeCleave", true));



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
	AddPose: ["HideMouth", "StuffMouth", "FaceGag"],
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
	AddPose: ["HideMouth", "StuffMouth", "FaceGag"],
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
	AddPose: ["FaceCoverGag"],
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
	AddPose: ["FaceCoverGag"],
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
AddModel(GetModelFashionVersion("ClothKnot", true));
AddModel(GetModelFashionVersion("ClothCleaveThick", true));
AddModel(GetModelFashionVersion("ClothCleave", true));
AddModel(GetModelFashionVersion("ClothOTN", true));
AddModel(GetModelFashionVersion("ClothOTM", true));

AddModel({
	Name: "GagLatex",
	Folder: "GagLatex",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "OTN", Layer: "GagFlat", Pri: 20,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Latex",
			AppendPose: {StuffMouth: "Flat"}
		},
	])
});



AddModel({
	Name: "GagLatexFlat",
	Folder: "GagLatex",
	Parent: "GagLatex",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "OTNFlat", Layer: "GagFlat", Pri: 30,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Latex",
		},
	])
});

AddModel(GetModelWithExtraLayers("GagLatexFlatHarness", "GagLatexFlat", [
	{ Name: "Harness", Layer: "GagFlatStraps", Pri: 19,
		Sprite: "Harness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "GagLatex", false));
AddModel(GetModelWithExtraLayers("GagLatexFlatHarnessSecure", "GagLatexFlatHarness", [
	{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "SideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "GagLatex", false));


AddModel({
	Name: "GagLatexMute",
	Folder: "GagLatex",
	Parent: "GagLatex",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "OTNFlat", Layer: "GagFlat", Pri: 30,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Latex",
		},
		{ Name: "MuteLogo", Layer: "GagFlat", Pri: 30.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "OTNFlat",
			InheritColor: "Symbol",
		},
	])
});

AddModel(GetModelWithExtraLayers("GagLatexMuteHarness", "GagLatexMute", [
	{ Name: "Harness", Layer: "GagFlatStraps", Pri: 19,
		Sprite: "Harness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "GagLatex", false));
AddModel(GetModelWithExtraLayers("GagLatexMuteHarnessSecure", "GagLatexMuteHarness", [
	{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "SideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "GagLatex", false));

AddModel(GetModelFashionVersion("GagLatex", true));
AddModel(GetModelFashionVersion("GagLatexFlat", true));
AddModel(GetModelFashionVersion("GagLatexFlatHarness", true));
AddModel(GetModelFashionVersion("GagLatexFlatHarnessSecure", true));
AddModel(GetModelFashionVersion("GagLatexMute", true));
AddModel(GetModelFashionVersion("GagLatexMuteHarness", true));
AddModel(GetModelFashionVersion("GagLatexMuteHarnessSecure", true));

AddModel({
	Name: "GagLatexPlug",
	Folder: "GagLatex",
	Parent: "GagLatex",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		...GetModelLayers("GagLatexFlat"),
		{ Name: "Plug", Layer: "GagFlatStraps", Pri: 40,
			Sprite: "LatexPlug",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			SwapLayerPose: {XrayFace: "GagStraps"},
		},
	])
});

AddModel(GetModelWithExtraLayers("GagLatexPlugHarness", "GagLatexPlug", [
	{ Name: "Harness", Layer: "GagFlatStraps", Pri: 19,
		Sprite: "Harness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "GagLatex", false));
AddModel(GetModelWithExtraLayers("GagLatexPlugHarnessSecure", "GagLatexPlugHarness", [
	{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "SideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "GagLatex", false));

AddModel(GetModelFashionVersion("GagLatexPlug", true));
AddModel(GetModelFashionVersion("GagLatexPlugHarness", true));
AddModel(GetModelFashionVersion("GagLatexPlugHarnessSecure", true));

AddModel({
	Name: "LatexNeckCorset",
	Folder: "GagLatex",
	TopLevel: true,
	Categories: ["Accessories", "Latex"],
	Layers: ToLayerMap([
		{ Name: "NeckCorset", Layer: "NeckCorset", Pri: -40,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Neck",
		},
		{ Name: "NeckCorsetRim", Layer: "NeckCorset", Pri: -39.9,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "NeckCorset",
			InheritColor: "Rim",
		},
	])
});

AddModel({
	Name: "LatexNeckCorsetGag",
	Folder: "GagLatex",
	Parent: "LatexNeckCorset",
	TopLevel: false,
	Categories: ["Accessories","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexNeckCorset"),
		//...GetModelLayers("GagLatexFlat"),
		{ Name: "OTNFlat", Layer: "GagMuzzle", Pri: -20,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Latex",
		},
	])
});

AddModel(GetModelRestraintVersion("LatexNeckCorset", true));
AddModel(GetModelRestraintVersion("LatexNeckCorsetGag", true));


AddModel({
	Name: "NeckCorset",
	Folder: "GagLatex",
	TopLevel: true,
	Categories: ["Accessories", "Latex"],
	Layers: ToLayerMap([
		{ Name: "NeckCorset2", Layer: "NeckCorset", Pri: -40,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Neck",
		},
		{ Name: "NeckCorsetRim2", Layer: "NeckCorset", Pri: -40.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "NeckCorset2",
			InheritColor: "Rim",
		},
	])
});
AddModel({
	Name: "ShinyLatexMuzzle",
	Folder: "GagLatex",
	Parent: "NeckCorset",
	TopLevel: false,
	Categories: ["Accessories","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "NeckCorsetGag2", Layer: "GagMuzzle", Pri: -20,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Gag",
		},
		{ Name: "NeckCorsetGagRim2", Layer: "GagMuzzle", Pri: -20.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rim",
			TieToLayer: "NeckCorsetGag2",
		},
	])
});

AddModel({
	Name: "NeckCorsetGag",
	Folder: "GagLatex",
	Parent: "NeckCorset",
	TopLevel: false,
	Categories: ["Accessories","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		...GetModelLayers("NeckCorset"),
		...GetModelLayers("ShinyLatexMuzzle"),
	])
});

AddModel(GetModelRestraintVersion("ShinyLatexMuzzle", true));
AddModel(GetModelRestraintVersion("NeckCorset", true));
AddModel(GetModelRestraintVersion("NeckCorsetGag", true));



AddModel({
	Name: "LatexNeckCorsetPlugGag",
	Folder: "GagLatex",
	Parent: "LatexNeckCorsetRestraint",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraint", "Accessories","Gags","Latex"],
	AddPose: ["FaceCoverGag"],
	AddPoseConditional: {
		Xray: ["HideMouth",],
	},
	Layers: ToLayerMap([
		...GetModelLayers("LatexNeckCorsetGag"),
		//...GetModelLayers("GagLatexFlat"),
		{ Name: "Plug", Layer: "GagMuzzleStraps", Pri: 40,
			Sprite: "LatexPlug",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			SwapLayerPose: {XrayFace: "GagStraps"},
		},
	])
});
AddModel(GetModelFashionVersion("LatexNeckCorsetPlugGag", true));


AddModel({
	Name: "GagMetal",
	Folder: "GagMetal",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Metal"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "OTN", Layer: "GagFlat", Pri: 30,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Metal",
		},
	])
});

AddModel({
	Name: "GagFabric",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Fabric"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "FabricMuzzle", Layer: "GagFlat", Pri: 45,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Fabric",
		},
	])
});
AddModel(GetModelFashionVersion("GagFabric", true));
AddModel(GetModelFashionVersion("GagMetal", true));


AddModel({
	Name: "KittyMuzzle",
	Folder: "GagLeather",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Parent: "GagFabric",
	Categories: ["Restraints","Gags","Fabric"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		...GetModelLayers("GagFabric"),
		{ Name: "KittyMouth", Layer: "GagFlat", Pri: 45.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "FabricMuzzle",
		},
		{ Name: "Whiskers", Layer: "GagFlat", Pri: 45.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "FabricMuzzle",
		},
	])
});
AddModel({
	Name: "KittyHarnessPanelGag",
	Folder: "GagLeather",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Parent: "GagFabric",
	Categories: ["Restraints","Gags","Fabric"],
	AddPose: ["FaceCoverGag"],
	Filters: {
		Panel: {"gamma":0.9833333333333333,"saturation":1,"contrast":0.8,"brightness":3.1,"red":1,"green":1,"blue":1,"alpha":1},
		Strap: {"gamma":0.8,"saturation":1,"contrast":0.9666666666666667,"brightness":2.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		Harness: {"gamma":0.8,"saturation":1,"contrast":0.9666666666666667,"brightness":2.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		SideStrap: {"gamma":0.8,"saturation":1,"contrast":0.9666666666666667,"brightness":2.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("PanelGagHarnessSecure"),
		{ Name: "KittyMouth", Layer: "GagFlat", Pri: 45.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "FabricMuzzle",
		},
	])
});
AddModel(GetModelFashionVersion("KittyMuzzle", true));
AddModel(GetModelFashionVersion("KittyHarnessPanelGag", true));


AddModel({
	Name: "GagComfy",
	Folder: "GagLeather",
	TopLevel: false,
	Group: "Mouth",
	Parent: "GagFabric",
	Restraint: true,
	Categories: ["Restraints","Gags","Fabric"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "FabricMuzzle", Layer: "GagFlat", Pri: 45,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Fabric",
		},
	])
});



AddModel({
	Name: "GagMetalRiveted",
	Folder: "GagMetal",
	Parent: "GagMetal",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Metal"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		...GetModelLayers("GagMetal"),
		{ Name: "OTNRivets", Layer: "GagFlat", Pri: 30.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Rivets",
			TieToLayer: "OTN",
			NoOverride: true,
		},
	])
});

AddModel(GetModelFashionVersion("GagMetalRiveted", true));


AddModel({
	Name: "GagMetalRivetedStrap",
	Folder: "GagMetal",
	Parent: "GagMetal",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags","Metal"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		...GetModelLayers("GagMetalRiveted"),
		{ Name: "OTNStrap", Layer: "GagFlat", Pri: 30.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Strap",
			TieToLayer: "OTN",
			NoOverride: true,
		},
		{ Name: "OTNStrapRivets", Layer: "GagFlat", Pri: 30.2,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "StrapRivets",
			TieToLayer: "OTN",
			NoOverride: true,
		},
	])
});

AddModel(GetModelFashionVersion("GagMetalRivetedStrap", true));


AddModel({
	Name: "SmoothBallGag",
	Folder: "GagMetal",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 1,
			Sprite: "Ball",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			MorphPoses: {MouthNeutral: "_TeethDeep", MouthSurprised: "_Teeth", MouthPout: "_TeethDeep", MouthDistracted: "_Teeth"},
		},
		{ Name: "BallTeeth", Layer: "Gag", Pri: 1.1,
			Sprite: "Ball",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			TieToLayer: "Ball",
			Poses: {MouthNeutral: true, MouthSurprised: true, MouthPout: true, MouthDistracted: true},
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
AddModel(GetModelWithExtraLayers("SmoothBallGagHarness", "SmoothBallGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "BallHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		AppendPose: {FaceBigGag: "Large"},
	},
], "SmoothBallGag", false));
AddModel(GetModelWithExtraLayers("SmoothBallGagHarnessSecure", "SmoothBallGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 20,
		Sprite: "BallSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SmoothBallGag", false));

AddModel(GetModelFashionVersion("SmoothBallGag", true));

AddModel({
	Name: "SmoothLargeBallGag",
	Folder: "GagMetal",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 3,
			Sprite: "BigBall",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BigBallStrap",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("SmoothLargeBallGagHarness", "SmoothLargeBallGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 17,
		Sprite: "BallHarness",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		AppendPose: {FaceBigGag: "Large"},
	},
], "SmoothLargeBallGag", false));
AddModel(GetModelWithExtraLayers("SmoothLargeBallGagHarnessSecure", "SmoothLargeBallGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 22,
		Sprite: "BallSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SmoothLargeBallGag", false));


AddModel({
	Name: "SegmentedLargeBallGag",
	Folder: "GagMetal",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 2,
			Sprite: "BigBall",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 14,
			Sprite: "BigBallStrapSegmented",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("SegmentedLargeBallGagHarness", "SegmentedLargeBallGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 16,
		Sprite: "BallHarnessSegmented",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		AppendPose: {FaceBigGag: "Large"},
	},
], "SegmentedLargeBallGag", false));
AddModel(GetModelWithExtraLayers("SegmentedLargeBallGagHarnessSecure", "SegmentedLargeBallGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 21,
		Sprite: "BallSideStrapSegmented",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SegmentedLargeBallGag", false));

AddModel(GetModelWithExtraLayers("SciFiBallGag", "SegmentedLargeBallGagHarness", [
{ Name: "TopRim", Layer: "GagStraps", Pri: 21.1,
		Sprite: "Rim",
		NoOverride: true,
		TieToLayer: "Display",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
	{ Name: "Display", Layer: "GagStraps", Pri: 21,
		Sprite: "Display",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], undefined, true));

AddModel(GetModelWithExtraLayers("EnhancedSciFiBallGag", "SciFiBallGag", [
	{ Name: "Mask", Layer: "GagStraps", Pri: 19,
		Sprite: "HarnessMask",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiBallGag", false));

AddModel(GetModelWithExtraLayers("AdvancedSciFiBallGag", "EnhancedSciFiBallGag", [
	{ Name: "HarnessRim", Layer: "GagStraps", Pri: 21.1,
		Sprite: "HarnessRim",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
	{ Name: "HarnessDisplay", Layer: "GagStraps", Pri: 21,
		Sprite: "HarnessDisplay",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiBallGag", false));

AddModel(GetModelWithExtraLayers("UltimateSciFiBallGag", "AdvancedSciFiBallGag", [

	{ Name: "Muzzle", Layer: "GagStraps", Pri: 17,
		Sprite: "SciFiMuzzle",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiBallGag", false, {
	AddPose: ["HideMouth", "StuffMouth", "FaceCoverGag"],
}));
AddModel(GetModelWithExtraLayers("UltimateSciFiBallGag2", "AdvancedSciFiBallGag", [

	{ Name: "Muzzle", Layer: "GagStraps", Pri: 17,
		Sprite: "SciFiMuzzle2",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiBallGag", false, {
	AddPose: ["HideMouth", "StuffMouth", "FaceCoverGag"],
}));



AddModel({
	Name: "SegmentedLargePanelGag",
	Folder: "GagMetal",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Panel", Layer: "GagFlatStraps", Pri: 17,
			Sprite: "SciFiPanel",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Strap", Layer: "GagFlatStraps", Pri: 14,
			Sprite: "BigBallStrapSegmented",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
		{ Name: "Mask", Layer: "GagFlatStraps", Pri: 19,
			Sprite: "HarnessMask",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("SegmentedLargePanelGagHarness", "SegmentedLargePanelGag", [
	{ Name: "Harness", Layer: "GagFlatStraps", Pri: 16,
		Sprite: "BallHarnessSegmented",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		AppendPose: {FaceBigGag: "Large"},
	},
], "SegmentedLargePanelGag", false));
AddModel(GetModelWithExtraLayers("SegmentedLargePanelGagHarnessSecure", "SegmentedLargePanelGagHarness", [
	{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "BallSideStrapSegmented",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SegmentedLargePanelGag", false));

AddModel(GetModelWithExtraLayers("SciFiPanelGag", "SegmentedLargePanelGagHarness", [
{ Name: "TopRim", Layer: "GagFlatStraps", Pri: 21.1,
		Sprite: "Rim",
		NoOverride: true,
		TieToLayer: "Display",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
	{ Name: "Display", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "Display",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], undefined, true));

AddModel(GetModelWithExtraLayers("AdvancedSciFiPanelGag", "SciFiPanelGag", [
	{ Name: "HarnessRim", Layer: "GagFlatStraps", Pri: 21.1,
		Sprite: "HarnessRim",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
	{ Name: "HarnessDisplay", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "HarnessDisplay",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiPanelGag", false));

AddModel(GetModelWithExtraLayers("UltimateSciFiPanelGag", "AdvancedSciFiPanelGag", [

	{ Name: "Muzzle", Layer: "GagFlatStraps", Pri: 17,
		Sprite: "SciFiMuzzle",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiPanelGag", false, {
	AddPose: ["StuffMouth", "FaceCoverGag"],
}));
AddModel(GetModelWithExtraLayers("UltimateSciFiPanelGag2", "AdvancedSciFiPanelGag", [

	{ Name: "Muzzle", Layer: "GagFlatStraps", Pri: 17,
		Sprite: "SciFiMuzzle2",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SciFiPanelGag", false, {
	AddPose: ["StuffMouth", "FaceCoverGag"],
}));

AddModel(GetModelFashionVersion("SegmentedLargePanelGag", true));
AddModel(GetModelFashionVersion("SegmentedLargePanelGagHarness", true));
AddModel(GetModelFashionVersion("SciFiPanelGag", true));
AddModel(GetModelFashionVersion("AdvancedSciFiPanelGag", true));
AddModel(GetModelFashionVersion("UltimateSciFiPanelGag", true));
AddModel(GetModelFashionVersion("UltimateSciFiPanelGag2", true));





AddModel({
	Name: "SegmentedPlugGag",
	Folder: "GagMetal",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth", "FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Panel", Layer: "GagFlatStraps", Pri: 17,
			Sprite: "SciFiPanel",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			SwapLayerPose: {XrayFace: "GagStraps"},
		},
		{ Name: "Strap", Layer: "GagFlatStraps", Pri: 14,
			Sprite: "BigBallStrapSegmented",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			SwapLayerPose: {XrayFace: "GagStraps"},
		},
		{ Name: "Mask", Layer: "GagFlatStraps", Pri: 19,
			Sprite: "HarnessMask",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			SwapLayerPose: {XrayFace: "GagStraps"},
		},
		{ Name: "Plug", Layer: "GagFlatStraps", Pri: 40,
			Sprite: "SciFiPlug",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			SwapLayerPose: {XrayFace: "GagStraps"},
		},
	])
});

AddModel(GetModelFashionVersion("SegmentedPlugGag", true));

AddModel(GetModelWithExtraLayers("SegmentedPlugGagHarness", "SegmentedPlugGag", [
	{ Name: "Harness", Layer: "GagFlatStraps", Pri: 16,
		Sprite: "BallHarnessSegmented",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
		AppendPose: {FaceBigGag: "Large"},
	},
], "SegmentedPlugGag", false));
AddModel(GetModelWithExtraLayers("SegmentedPlugGagHarnessSecure", "SegmentedPlugGagHarness", [
	{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "BallSideStrapSegmented",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
], "SegmentedPlugGag", false));

AddModel(GetModelWithExtraLayers("SciFiPlugGag", "SegmentedPlugGagHarness", [
{ Name: "TopRim", Layer: "GagFlatStraps", Pri: 21.1,
		Sprite: "Rim",
		NoOverride: true,
		TieToLayer: "Display",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
	{ Name: "Display", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "Display",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
], undefined, true));

AddModel(GetModelWithExtraLayers("AdvancedSciFiPlugGag", "SciFiPlugGag", [
	{ Name: "HarnessRim", Layer: "GagFlatStraps", Pri: 21.1,
		Sprite: "HarnessRim",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
	{ Name: "HarnessDisplay", Layer: "GagFlatStraps", Pri: 21,
		Sprite: "HarnessDisplay",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
], "SciFiPlugGag", false));

AddModel(GetModelWithExtraLayers("UltimateSciFiPlugGag", "AdvancedSciFiPlugGag", [

	{ Name: "Muzzle", Layer: "GagFlatStraps", Pri: 17,
		Sprite: "SciFiMuzzle",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
], "SciFiPlugGag", false, {
	AddPose: ["HideMouth", "StuffMouth", "FaceCoverGag"],
}));
AddModel(GetModelWithExtraLayers("UltimateSciFiPlugGag2", "AdvancedSciFiPlugGag", [

	{ Name: "Muzzle", Layer: "GagFlatStraps", Pri: 17,
		Sprite: "SciFiMuzzle2",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		SwapLayerPose: {XrayFace: "GagStraps"},
	},
], "SciFiPlugGag", false, {
	AddPose: ["HideMouth", "StuffMouth", "FaceCoverGag"],
}));


AddModel({
	Name: "SimpleSciFiMuzzle",
	Folder: "GagMetal",
	TopLevel: true,
	Parent: "SciFiBallGag",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{
			Name: "HarnessRim", Layer: "GagMuzzleStraps", Pri: 110.1,
			Sprite: "HarnessRim",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			TieToLayer: "HarnessDisplay",
			NoOverride: true,
		},
		{
			Name: "HarnessDisplay", Layer: "GagMuzzleStraps", Pri: 110,
			Sprite: "HarnessDisplay",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},

		{
			Name: "Muzzle", Layer: "GagMuzzle", Pri: 110,
			Sprite: "SciFiMuzzle",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});
AddModel(GetModelFashionVersion("SimpleSciFiMuzzle", true));

AddModel(GetModelWithExtraLayers("AdvancedSciFiMuzzle", "SimpleSciFiMuzzle", [
	{ Name: "Mask", Layer: "GagMuzzleStraps", Pri: 19,
		Sprite: "HarnessMask",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SimpleSciFiMuzzle", false));

AddModel(GetModelFashionVersion("AdvancedSciFiMuzzle", true));

AddModel(GetModelWithExtraLayers("SciFiPlugMuzzle", "SimpleSciFiMuzzle", [
	{ Name: "Plug", Layer: "GagMuzzleStraps", Pri: 110.1,
		Sprite: "SciFiPlug",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		NoOverride: true,
		TieToLayer: "Muzzle",
	},
], "SimpleSciFiMuzzle", false));
AddModel(GetModelWithExtraLayers("AdvancedSciFiPlugMuzzle", "AdvancedSciFiMuzzle", [
	{ Name: "Plug", Layer: "GagMuzzleStraps", Pri: 110.1,
		Sprite: "SciFiPlug",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
		NoOverride: true,
		TieToLayer: "Muzzle",
	},
], "SimpleSciFiMuzzle", false));

AddModel(GetModelFashionVersion("SciFiPlugMuzzle", true));
AddModel(GetModelFashionVersion("AdvancedSciFiPlugMuzzle", true));

// Transparent
AddModel({
	Name: "SimpleSciFiMuzzle2",
	Folder: "GagMetal",
	TopLevel: false,
	Parent: "SimpleSciFiMuzzle",
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{
			Name: "HarnessRim", Layer: "GagMuzzleStraps", Pri: 110.1,
			Sprite: "HarnessRim",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			TieToLayer: "HarnessDisplay",
			NoOverride: true,
		},
		{
			Name: "HarnessDisplay", Layer: "GagMuzzleStraps", Pri: 110,
			Sprite: "HarnessDisplay",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},

		{
			Name: "Muzzle", Layer: "GagFlatStraps", Pri: 17,
			Sprite: "SciFiMuzzle2",
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelWithExtraLayers("AdvancedSciFiMuzzle2", "SimpleSciFiMuzzle", [
	{ Name: "Mask", Layer: "GagMuzzleStraps", Pri: 100,
		Sprite: "HarnessMask",
		OffsetX: 942,
		OffsetY: 200,
		Invariant: true,
	},
], "SimpleSciFiMuzzle", false));

AddModel(GetModelFashionVersion("SimpleSciFiMuzzle", true));
AddModel(GetModelFashionVersion("AdvancedSciFiMuzzle2", true));





AddModel({
	Name: "GagNecklace",
	Folder: "GagLeather",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Accessories"],
	Layers: ToLayerMap([
		{ Name: "GagNecklaceBall", Layer: "Collar", Pri: 250.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "GagNecklace",
			InheritColor: "Ball",
		},
		{ Name: "GagNecklace", Layer: "Collar", Pri: 250,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Strap",
		},
	])
});

AddModel(GetModelFashionVersion("GagNecklace", true));


AddModel({
	Name: "CrystalGagNecklace",
	Folder: "GagLeather",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Accessories"],
	Layers: ToLayerMap([
		{ Name: "CrystalGagNecklaceBall", Layer: "Collar", Pri: 250.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "GagNecklace",
			InheritColor: "Ball",
		},
		{ Name: "GagNecklace", Layer: "Collar", Pri: 250,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Strap",
		},
	])
});

AddModel(GetModelFashionVersion("CrystalGagNecklace", true));