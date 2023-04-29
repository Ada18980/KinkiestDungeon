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
			AnchorModX: MODELWIDTH/641,
			AnchorModY: MODELHEIGHT/664,
			Invariant: true,
			MorphPoses: {MouthNeutral: "_TeethDeep", MouthSurprised: "_Teeth", MouthPout: "_TeethDeep", MouthDistracted: "_Teeth"},
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap",
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641,
			AnchorModY: MODELHEIGHT/664,
			Invariant: true,
		},
	])
});
AddModel(GetModelWithExtraLayers("BallGagHarness", "BallGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "BallHarness",
		OffsetX: 942,
		OffsetY: 200,
		AnchorModX: MODELWIDTH/641,
		AnchorModY: MODELHEIGHT/664,
		Invariant: true,
	},
]));
AddModel(GetModelWithExtraLayers("BallGagHarnessSecure", "BallGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 20,
		Sprite: "BallSideStrap",
		OffsetX: 942,
		OffsetY: 200,
		AnchorModX: MODELWIDTH/641,
		AnchorModY: MODELHEIGHT/664,
		Invariant: true,
	},
]));

AddModel({
	Name: "RopeBoxtie1",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Boxties"],
	Layers: ToLayerMap([
		{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap([...ARMPOSES]),
		},
	])
});


AddModel(GetModelWithExtraLayers("RopeBoxtie2", "RopeBoxtie1", [
	{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
		Poses: ToMap([...ARMPOSES]),
	},
]));


AddModel(GetModelWithExtraLayers("RopeBoxtie3", "RopeBoxtie2", [
	{ Name: "ArmHarness", Layer: "ChestStraps", Pri: -1,
		Poses: ToMap([...ARMPOSES]),
		Invariant: true,
	},
]));
