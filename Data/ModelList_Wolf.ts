/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "WolfPanties",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "Panties", Layer: "Panties", Pri: 10,
			Invariant: true,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
	])
});

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
		},
		{ Name: "ModuleDisplay", Layer: "CollarAcc", Pri: 40.1,
			Invariant: true,
			InheritColor: "Display",
			TieToLayer: "Module",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "WolfCollar",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 40,
			Invariant: true,
			InheritColor: "Lining",
		},
		{ Name: "CollarBand", Layer: "Collar", Pri: 40.1,
			Invariant: true,
			InheritColor: "Band",
			TieToLayer: "Collar",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "WolfCollarTag",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfCollar"),
		{ Name: "CollarHardware", Layer: "Collar", Pri: 40.3,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "Collar",
			NoOverride: true,
		},
		{ Name: "CollarTag", Layer: "Collar", Pri: 40.2,
			Invariant: true,
			InheritColor: "Tag",
			TieToLayer: "Collar",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "WolfCollarSmall",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "FCollar", Layer: "Collar", Pri: 40,
			Invariant: true,
			InheritColor: "Lining",
		},
		{ Name: "FCollarBand", Layer: "Collar", Pri: 40.1,
			Invariant: true,
			InheritColor: "Band",
			TieToLayer: "Collar",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "WolfCollarSmallTag",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfCollarSmall"),
		{ Name: "FCollarHardware", Layer: "Collar", Pri: 40.3,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "Collar",
			NoOverride: true,
		},
		{ Name: "FCollarTag", Layer: "Collar", Pri: 40.2,
			Invariant: true,
			InheritColor: "Tag",
			TieToLayer: "Collar",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "WolfHarnessUpper",
	Folder: "Wolf",
	Parent: "WolfHarness",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "HarnessUpper", Layer: "BindChest", Pri: 35,
			Invariant: true,
			InheritColor: "Lining",
		},
		{ Name: "HarnessBandUpper", Layer: "BindChest", Pri: 35.1,
			Invariant: true,
			InheritColor: "Band",
			TieToLayer: "HarnessUpper",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "WolfHarnessBelt",
	Folder: "Wolf",
	Parent: "WolfHarness",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfHarnessBelt"),
		{ Name: "BeltMid", Layer: "HarnessMid", Pri: 35,
			Invariant: true,
			InheritColor: "Lining",
		},
		{ Name: "BeltBandMid", Layer: "HarnessMid", Pri: 35.1,
			Invariant: true,
			InheritColor: "Band",
			TieToLayer: "BeltMid",
			NoOverride: true,
		},
		{ Name: "BeltHardwareMid", Layer: "HarnessMid", Pri: 35.2,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "BeltMid",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "WolfHarnessLower",
	Folder: "Wolf",
	Parent: "WolfHarness",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfHarnessBelt"),
		{ Name: "HarnessMid", Layer: "HarnessMid", Pri: 30,
			Invariant: true,
			InheritColor: "Lining",
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", }
		},
		{ Name: "HarnessHardwareMid", Layer: "HarnessMid", Pri: 30.1,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "HarnessMid",
			NoOverride: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", }
		},
		{ Name: "HarnessLower", Layer: "HarnessMid", Pri: 30,
			Invariant: true,
			InheritColor: "Lining",
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
		{ Name: "HarnessBandLower", Layer: "HarnessMid", Pri: 30.1,
			Invariant: true,
			InheritColor: "Band",
			TieToLayer: "HarnessLower",
			NoOverride: true,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
		{ Name: "HarnessHardwareLower", Layer: "HarnessMid", Pri: 30.2,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "HarnessLower",
			NoOverride: true,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
	])
});

AddModel({
	Name: "WolfHarness",
	Folder: "Wolf",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfHarnessBelt"),
		...GetModelLayers("WolfHarnessUpper"),
		...GetModelLayers("WolfHarnessLower"),
	])
});



AddModel({
	Name: "WolfCuffsAnklesLeft",
	Folder: "Wolf",
	TopLevel: false,
	Parent: "WolfCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesAnklesLeft", "Band", "", "Band", 0.4),
	])
});

AddModel({
	Name: "WolfCuffsAnklesRight",
	Folder: "Wolf",
	TopLevel: false,
	Parent: "WolfCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesAnklesRight", "Band", "", "Band", 0.4),
	])
});


AddModel({
	Name: "WolfCuffsAnkles",
	Folder: "Wolf",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfCuffsAnklesRight"),
		...GetModelLayers("WolfCuffsAnklesLeft"),
	])
});

AddModel(GetModelRestraintVersion("WolfCollar", true));
AddModel(GetModelRestraintVersion("WolfCollarTag", true));
AddModel(GetModelRestraintVersion("WolfCollarSmall", true));
AddModel(GetModelRestraintVersion("WolfCollarSmallTag", true));
AddModel(GetModelRestraintVersion("WolfPanties", true));
AddModel(GetModelRestraintVersion("WolfHarnessLower", true));
AddModel(GetModelRestraintVersion("WolfHarnessUpper", true));
AddModel(GetModelRestraintVersion("WolfHarnessBelt", true));
AddModel(GetModelRestraintVersion("WolfHarness", true));