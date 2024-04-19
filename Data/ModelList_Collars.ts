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
		{ Name: "Collar", Layer: "Collar", Pri: 20,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});



AddModel({
	Name: "Leash",
	Folder: "Leash",
	Parent: "Leash",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints"],
	Layers: ToLayerMap([
		{ Name: "Leash", Layer: "Leash", Pri: 0,
			Invariant: true,
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie", HandsBound: "", Pulled: "", HandsBehind: "",
				Free: "Free", Crossed: "Crossed", Front: "Front"},
			AppendPose: {Pulled: "Pulled"},
		},
	])
});

AddModel(GetModelFashionVersion("Leash", true));

AddModel({
	Name: "MikoCollar",
	Folder: "Collars",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints"],
	Filters: {
		Neck: {"gamma":1,"saturation":0,"contrast":1.3,"brightness":1.3,"red":1,"green":1,"blue":1,"alpha":1},
		Rim: {"gamma":1,"saturation":0.05,"contrast":1,"brightness":0.95,"red":1,"green":1,"blue":1,"alpha":1},
		Collar: {"gamma":1,"saturation":0.06666666666666667,"contrast":0.6666666666666666,"brightness":0.5333333333333333,"red":2.7666666666666666,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		{ Name: "DragonCollar", Layer: "Collar", Pri: 70,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Collar",
		},
		...GetModelLayers("LatexNeckCorset"),
	])
});


AddModel({
	Name: "FutureCollar",
	Folder: "Collars",
	Parent: "CyberDoll",
	TopLevel: true,
	Categories: ["Accessories"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
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
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
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
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
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