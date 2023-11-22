/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */





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
	Name: "FutureCollar",
	Folder: "Collars",
	Parent: "CyberDoll",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Future", Layer: "Collar", Pri: 30,
			Invariant: true,
			InheritColor: "Base",
			HideWhenOverridden: true,
		},
		{ Name: "FutureBand", Layer: "Collar", Pri: 30.1,
			Invariant: true,
			InheritColor: "Band",
			NoOverride: true,
			TieToLayer: "Future",
		},
		{ Name: "FutureDisplay", Layer: "Collar", Pri: 30.2,
			Invariant: true,
			InheritColor: "Display",
			NoOverride: true,
			TieToLayer: "Future",
		},
		{ Name: "FutureRim", Layer: "Collar", Pri: 30.3,
			Invariant: true,
			InheritColor: "Rim",
			NoOverride: true,
			TieToLayer: "Future",
		},
		{ Name: "FutureLock", Layer: "Collar", Pri: 30.3,
			Invariant: true,
			InheritColor: "Lock",
			LockLayer: true,
			NoOverride: true,
			TieToLayer: "Future",
		},
	])
});

AddModel(GetModelRestraintVersion("FutureCollar", false),);


AddModel({
	Name: "ShockModule",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints"],
	Layers: ToLayerMap([
		{ Name: "Module", Layer: "CollarAcc", Pri: 40,
			Invariant: true,
			InheritColor: "Module",
			HidePoses: {HideModuleLeft: true},
		},
		{ Name: "ModuleDisplay", Layer: "CollarAcc", Pri: 40.1,
			Invariant: true,
			InheritColor: "Display",
			TieToLayer: "Module",
			NoOverride: true,
			HidePoses: {HideModuleLeft: true},
		},
	])
});


AddModel({
	Name: "TrackingModule",
	Folder: "Collars",
	Parent: "Collars",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints"],
	Layers: ToLayerMap([
		{ Name: "TrackingModule", Layer: "CollarAcc", Pri: 40.1,
			Invariant: true,
			InheritColor: "Module",
			HidePoses: {HideModuleRight: true},
		},
		{ Name: "TrackingModuleDisplay", Layer: "CollarAcc", Pri: 40,
			Invariant: true,
			InheritColor: "Display",
			TieToLayer: "Module",
			NoOverride: true,
			HidePoses: {HideModuleRight: true},
		},
	])
});