/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "Legirons",
	Folder: "Handcuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Legirons"],
	AddPose: ["LegCuffed"],
	Layers: ToLayerMap([
		{ Name: "LegironsLeft", Layer: "AnkleLeft", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...ANKLELEFTPOSES]),
		},
		{ Name: "LegironsRight", Layer: "AnkleRight", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap([...ANKLERIGHTPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "AnkleRightKneel"},
		},
	])
});

AddModel({
	Name: "Irish8Ankle",
	Folder: "Handcuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Legirons"],
	AddPose: ["LegCuffed"],
	Layers: ToLayerMap([
		{ Name: "Irish8AnkleLeft", Layer: "AnkleLeft", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
		},
		{ Name: "Irish8AnkleRight", Layer: "AnkleRight", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap(["Closed"]),
			SwapLayerPose: {Kneel: "AnkleRightKneel"},
		},
	])
});



AddModel({
	Name: "HandCuffs",
	Folder: "Handcuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Handcuffs"],
	AddPose: ["HandCuffed"],
	Layers: ToLayerMap([
		{ Name: "CuffsLock", Layer: "BindForeWristLeft", Pri: 40.1,
			HideWhenOverridden: true,
			NoOverride: true,
			TieToLayer: "HandCuffs",
			InheritColor: "Lock",
			LockLayer: true,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandCuffs", Layer: "BindForeWristLeft", Pri: 25,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});



AddModel({
	Name: "HingedCuffs",
	Folder: "Handcuffs",
	Parent: "HandCuffs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Handcuffs"],
	AddPose: ["HandCuffed"],
	Layers: ToLayerMap([
		{ Name: "CuffsLock", Layer: "BindForeWristLeft", Pri: 40.1,
			HideWhenOverridden: true,
			NoOverride: true,
			TieToLayer: "HingedCuffs",
			InheritColor: "Lock",
			LockLayer: true,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HingedCuffs", Layer: "BindForeWristLeft", Pri: 30,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});
AddModel({
	Name: "Irish8Cuffs",
	Folder: "Handcuffs",
	Parent: "HandCuffs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Handcuffs"],
	AddPose: ["HandCuffed"],
	Layers: ToLayerMap([
		{ Name: "CuffsLock", Layer: "BindForeWristLeft", Pri: 40.1,
			HideWhenOverridden: true,
			NoOverride: true,
			TieToLayer: "Irish8Cuffs",
			InheritColor: "Lock",
			LockLayer: true,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "Irish8Cuffs", Layer: "BindForeWristLeft", Pri: 35,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

AddModel({
	Name: "WolfCuffs",
	Folder: "Handcuffs",
	Parent: "HandCuffs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Handcuffs"],
	AddPose: ["HandCuffed"],
	Layers: ToLayerMap([
		/*{ Name: "CuffsLock", Layer: "BindForeWristLeft", Pri: 40.1,
			HideWhenOverridden: true,
			NoOverride: true,
			TieToLayer: "WolfCuffs",
			InheritColor: "Lock",
			LockLayer: true,
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},*/
		{ Name: "WolfCuffs", Layer: "BindForeWristLeft", Pri: 40,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "WolfCuffsChain", Layer: "BindForeWristLeft", Pri: 39.9,
			HideWhenOverridden: true,
			NoOverride: true,
			InheritColor: "Chain",
			TieToLayer: "WolfCuffs",
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

AddModel({
	Name: "Thumbcuffs",
	Folder: "Handcuffs",
	Parent: "HandCuffs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Handcuffs"],
	AddPose: ["HandCuffed"],
	Layers: ToLayerMap([
		{ Name: "Thumbcuffs", Layer: "BindForeHandLeft", Pri: -50,
			NoOverride: true,
			InheritColor: "BaseMetal",
			Poses: ToMap(["Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

