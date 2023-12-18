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
			HidePoses: {HideModuleMiddle: true},
		},
		{ Name: "CollarTag", Layer: "Collar", Pri: 40.2,
			Invariant: true,
			InheritColor: "Tag",
			TieToLayer: "Collar",
			NoOverride: true,
			HidePoses: {HideModuleMiddle: true},
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
			HidePoses: {HideModuleMiddle: true},
		},
		{ Name: "FCollarTag", Layer: "Collar", Pri: 40.2,
			Invariant: true,
			InheritColor: "Tag",
			TieToLayer: "Collar",
			NoOverride: true,
			HidePoses: {HideModuleMiddle: true},
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
		{ Name: "HarnessLower", Layer: "HarnessLower", Pri: 30,
			Invariant: true,
			InheritColor: "Lining",
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
		{ Name: "HarnessBandLower", Layer: "HarnessLower", Pri: 30.1,
			Invariant: true,
			InheritColor: "Band",
			TieToLayer: "HarnessLower",
			NoOverride: true,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
		{ Name: "HarnessHardwareLower", Layer: "HarnessLower", Pri: 30.2,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "HarnessLower",
			NoOverride: true,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
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


AddModel({
	Name: "WolfGloveLeft",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "GloveLeft", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "ForeGloveLeft", Layer: "ForeGloveLeft", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
		},
		{ Name: "RimGloveLeft", Layer: "GloveLeft", Pri: -.9,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "RimLeft",
			NoOverride: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "RimForeGloveLeft", Layer: "ForeGloveLeft", Pri: -.9,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "RimLeft",
			NoOverride: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
		},
		{ Name: "BandGloveLeft", Layer: "GloveLeft", Pri: -.8,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "BandLeft",
			NoOverride: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "BandForeGloveLeft", Layer: "ForeGloveLeft", Pri: -.8,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "BandLeft",
			NoOverride: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
		},
	])
});

AddModel({
	Name: "WolfGloveRight",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "GloveRight", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "ForeGloveRight", Layer: "ForeGloveRight", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
		},
		{ Name: "RimGloveRight", Layer: "GloveRight", Pri: -.9,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			InheritColor: "RimRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "RimForeGloveRight", Layer: "ForeGloveRight", Pri: -.9,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "RimRight",
			NoOverride: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
		},
		{ Name: "BandGloveRight", Layer: "GloveRight", Pri: -.8,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			InheritColor: "BandRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "BandForeGloveRight", Layer: "ForeGloveRight", Pri: -.8,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "BandRight",
			NoOverride: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
		},
	])
});

AddModel({
	Name: "WolfGloves",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfGloveLeft"),
		...GetModelLayers("WolfGloveRight"),
	])
});


AddModel({
	Name: "WolfSockLeft",
	Folder: "WolfCatsuit",
	Parent: "WolfSocks",
	Layers: ToLayerMap([
		{ Name: "LegLeft", Layer: "StockingLeft", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
	])
});
AddModel({
	Name: "WolfSockRight",
	Folder: "WolfCatsuit",
	Parent: "WolfSocks",
	Layers: ToLayerMap([
		{ Name: "LegRight", Layer: "StockingRight", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
	])
});

AddModel({
	Name: "WolfSocks",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfSockRight"),
		...GetModelLayers("WolfSockLeft"),
	])
});

AddModel(GetModelRestraintVersion("WolfSocks", true));



AddModel({
	Name: "WolfTorsoLower",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	TopLevel: false,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "Bodysuit", Pri: 10,
			Invariant: true,
			SwapLayerPose: {Kneel: "BodysuitLower", KneelClosed: "BodysuitLower"},
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel", }
		},
	])
});


AddModel({
	Name: "WolfTorsoUpper",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Underwear", "Tops"],
	Layers: ToLayerMap([
		{ Name: "Chest", Layer: "SuitChest", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["ShirtCutoffBra"]),
		},
		{ Name: "TorsoUpper", Layer: "Bodysuit", Pri: 30,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
			InheritColor: "Cloth",
		},
	])
});



AddModel({
	Name: "WolfHeels",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidShoes", undefined, undefined, undefined, 8),
	])
});

AddModel({
	Name: "Wolf",
	Folder: "WolfCatsuit",
	Parent: "Wolf",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("WolfSocks"),
		...GetModelLayers("WolfGloves"),
		...GetModelLayers("WolfTorsoUpper"),
		...GetModelLayers("WolfTorsoLower"),
		...GetModelLayers("WolfHeels"),
	])
});