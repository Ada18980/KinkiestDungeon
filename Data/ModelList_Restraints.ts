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
			Poses: ToMap(["Boxtie"]),
		},
	])
});

AddModel({
	Name: "RopeWristtie1",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Wristties"],
	Layers: ToLayerMap([
		{ Name: "Arm1", Layer: "StrapsUnderbust", Pri: 0,
			Poses: ToMap(["Wristtie"]),
		},
	])
});

// Cosmetic only
AddModel({
	Name: "RopeChestStraps1",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["RopesLower"],
	Layers: ToLayerMap([
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
		},
	])
});
AddModel({
	Name: "RopeChestStraps2",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["RopesUpper"],
	Layers: ToLayerMap([
		{ Name: "Arm2", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap(["Boxtie", "Wristtie"]),
		},
		{ Name: "ArmHarness", Layer: "ChestStraps", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
	])
});


AddModel({
	Name: "RopeCuffs",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["Handcuffed"],
	Layers: ToLayerMap([
		{ Name: "Cuffs", Layer: "ForeWrists", Pri: 0,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

AddModel({
	Name: "RopeBelt",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "BeltBondage", Pri: 0,
			Invariant: true,
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
		{ Name: "Harness", Layer: "Harness", Pri: 0,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
	])
});
AddModel({
	Name: "RopeCrotch",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Crotchrope", Layer: "HarnessLower", Pri: 1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
	])
});

AddModel({
	Name: "RopeToes",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Toe", Layer: "OverSocks", Pri: 10,
			Poses: ToMap(["Closed"]),
			CrossHideOverride: true,
			HideOverrideLayerMulti: ["ShoeLeft", "ShoeRight", "ShoeLeftHogtie", "ShoeRightKneel"],
		},
	])
});

AddModel({
	Name: "RopeFeet",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "OverSocks", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed"]),
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeFeetHeavy", "RopeFeet", [
	...GetModelLayers("RopeToes"),
]));


AddModel({
	Name: "RopeAnkles1",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Calf1", Layer: "Ankles1", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeAnkles2", "RopeAnkles1", [
	{ Name: "Calf2", Layer: "Ankles2", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
	},
]));


AddModel(GetModelWithExtraLayers("RopeAnkles3", "RopeAnkles2", [
	{ Name: "Calf3", Layer: "Ankles3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
	},
]));



AddModel({
	Name: "RopeLegs1",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Rope"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Thigh1", Layer: "Thighs1", Pri: 1,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
		},
	])
});

AddModel(GetModelWithExtraLayers("RopeLegs2", "RopeLegs1", [
	{ Name: "Thigh2", Layer: "Thighs2", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
	},
]));


AddModel(GetModelWithExtraLayers("RopeLegs3", "RopeLegs2", [
	{ Name: "Thigh3", Layer: "Thighs3", Pri: 1,
		Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		GlobalDefaultOverride: ToMap(["KneelClosed"]),
	},
]));