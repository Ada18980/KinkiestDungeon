/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "LaceCorset",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "LaceCorset", Layer: "Bustier", Pri: 20.1,
			Invariant: true,
			InheritColor: "Base",
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
		{ Name: "LaceCorsetHardware", Layer: "Bustier", Pri: 20,
			Invariant: true,
			TieToLayer: "LaceCorset",
			NoOverride: true,
			InheritColor: "Hardware",
		},
		{ Name: "LaceCorsetStripes", Layer: "Bustier", Pri: 20,
			Invariant: true,
			TieToLayer: "LaceCorset",
			NoOverride: true,
			InheritColor: "Stripes",
		},
		{ Name: "LaceCorsetCrystal", Layer: "Bustier", Pri: 20,
			Invariant: true,
			TieToLayer: "LaceCorset",
			NoOverride: true,
			InheritColor: "Crystal",
		},
	])
});
AddModel({
	Name: "LaceBra",
	Folder: "Dress",
	TopLevel: true,
	Parent: "LaceCorset",
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "LaceChest", Layer: "BraChest", Pri: 10.1,
			Invariant: true,
			InheritColor: "BraBase",
		},
		{ Name: "LaceChestCups", Layer: "BraChest", Pri: 10,
			Invariant: true,
			TieToLayer: "LaceChest",
			NoOverride: true,
			InheritColor: "BraCups",
		},
		{ Name: "LaceChestStripes", Layer: "BraChest", Pri: 10,
			Invariant: true,
			TieToLayer: "LaceChest",
			NoOverride: true,
			InheritColor: "BraStripes",
		},
	])
});
AddModel({
	Name: "LaceBustier",
	Folder: "Dress",
	TopLevel: true,
	Parent: "LaceCorset",
	Categories: ["Bras", "Tops"],
	Layers: ToLayerMap([
		{ Name: "LaceChest", Layer: "BustierChest", Pri: 10.1,
			Invariant: true,
			InheritColor: "BraBase",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
		{ Name: "LaceChestCups", Layer: "BustierChest", Pri: 10,
			Invariant: true,
			TieToLayer: "LaceChest",
			NoOverride: true,
			InheritColor: "BraCups",
		},
		{ Name: "LaceChestStripes", Layer: "BustierChest", Pri: 10,
			Invariant: true,
			TieToLayer: "LaceChest",
			NoOverride: true,
			InheritColor: "BraStripes",
		},
	])
});
AddModel({
	Name: "LaceDeco",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "LaceChestDeco", Layer: "NecklaceCharm", Pri: -20,
			Invariant: true,
			InheritColor: "DecoBase",
		},
		{ Name: "LaceChestDecoCrystal", Layer: "NecklaceCharm", Pri: -20.1,
			Invariant: true,
			TieToLayer: "LaceChestDeco",
			NoOverride: true,
			InheritColor: "DecoCrystal",
		},
		{ Name: "LaceChestDecoHardware", Layer: "NecklaceCharm", Pri: -20.1,
			Invariant: true,
			TieToLayer: "LaceChestDeco",
			NoOverride: true,
			InheritColor: "DecoHardware",
		},
	])
});
AddModel({
	Name: "LaceBraDeco",
	Folder: "Dress",
	TopLevel: false,
	Parent: "LaceCorset",
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("LaceBustier"),
		...GetModelLayers("LaceDeco"),
	])
});
AddModel(GetModelRestraintVersion("LaceCorset", true));
AddModel(GetModelRestraintVersion("LaceBustier", true));
AddModel(GetModelRestraintVersion("LaceBraDeco", true));



AddModel({
	Name: "BowCorsetBow",
	Folder: "Dress",
	TopLevel: true,
	Parent: "BowCorset",
	Categories: ["Accessories"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "BowCorsetBow", Layer: "NecklaceCharm", Pri: -9,
			Invariant: true,
			InheritColor: "Bow",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "BowCorsetBust",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets", "Bras"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "BowCorsetBust", Layer: "BustierChest", Pri: 40.1,
			Invariant: true,
			InheritColor: "CorsetBust",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
		{ Name: "BowCorsetBustRuffle", Layer: "BustierChest", Pri: 40.1,
			Invariant: true,
			InheritColor: "RuffleBust",
			NoOverride: true,
			TieToLayer: "BowCorsetBust"
		},
	])
});
AddModel({
	Name: "BowCorsetBustBow",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets", "Bras"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("BowCorsetBust"),
		...GetModelLayers("BowCorsetBow"),
	])
});


AddModel({
	Name: "BowCorset",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "BowCorset", Layer: "Bustier", Pri: 40.1,
			Invariant: true,
			InheritColor: "Corset",
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
		{ Name: "BowCorsetRuffle", Layer: "Bustier", Pri: 40.1,
			Invariant: true,
			InheritColor: "Ruffle",
			NoOverride: true,
			TieToLayer: "BowCorset"
		},
	])
});
AddModel({
	Name: "BowCorsetLong",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "BowCorsetLong", Layer: "Bustier", Pri: 40.1,
			Invariant: true,
			SwapLayerPose: {Pants: "CorsetUnder", Kneel: "CorsetUnder", KneelClosed: "CorsetUnder"},
			InheritColor: "Corset",
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
		{ Name: "BowCorsetLongRuffle", Layer: "Bustier", Pri: 40.1,
			SwapLayerPose: {Pants: "CorsetUnder", Kneel: "CorsetUnder", KneelClosed: "CorsetUnder"},
			Invariant: true,
			InheritColor: "Ruffle",
			NoOverride: true,
			TieToLayer: "BowCorsetLong"
		},
	])
});
AddModel({
	Name: "BowCorsetOverbust",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("BowCorsetBust"),
		...GetModelLayers("BowCorset"),
	])
});
AddModel({
	Name: "BowCorsetLongOverbust",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("BowCorsetBust"),
		...GetModelLayers("BowCorsetLong"),
	])
});
AddModel({
	Name: "BowCorsetOverbustBow",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("BowCorsetBust"),
		...GetModelLayers("BowCorset"),
		...GetModelLayers("BowCorsetBow"),
	])
});

AddModel({
	Name: "BowCorsetLongOverbustBow",
	Folder: "Dress",
	Parent: "BowCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("BowCorsetBust"),
		...GetModelLayers("BowCorsetLong"),
		...GetModelLayers("BowCorsetBow"),
	])
});


AddModel(GetModelRestraintVersion("BowCorset", true));
AddModel(GetModelRestraintVersion("BowCorsetBow", true));
AddModel(GetModelRestraintVersion("BowCorsetOverbust", true));
AddModel(GetModelRestraintVersion("BowCorsetOverbustBow", true));
AddModel(GetModelRestraintVersion("BowCorsetLongOverbust", true));
AddModel(GetModelRestraintVersion("BowCorsetLongOverbustBow", true));


AddModel({
	Name: "LatexCorset",
	Folder: "Corsets",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "HeavyCorset", Layer: "Bustier", Pri: 30.1,
			Invariant: true,
			InheritColor: "Corset",
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
	])
});
AddModel({
	Name: "LatexBra",
	Folder: "Corsets",
	TopLevel: true,
	Parent: "LatexCorset",
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "ChestHeavyCorset", Layer: "BraChest", Pri: 17.1,
			Invariant: true,
			InheritColor: "Bra",
		},
	])
});
AddModel({
	Name: "LatexBraStraps",
	Folder: "Corsets",
	TopLevel: false,
	Parent: "LatexBra",
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "StrapsHeavyCorset", Layer: "BraChest", Pri: 17,
			Invariant: true,
			InheritColor: "Straps",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "LatexBraStrapsCross",
	Folder: "Corsets",
	TopLevel: false,
	Parent: "LatexBra",
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "CrossHeavyCorset", Layer: "BraChest", Pri: 17,
			Invariant: true,
			InheritColor: "Straps",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "LatexBustier",
	Folder: "Corsets",
	TopLevel: true,
	Parent: "LatexCorset",
	Categories: ["Tops", "Bras"],
	Layers: ToLayerMap([
		{ Name: "ChestHeavyCorset", Layer: "BustierChest", Pri: 17.1,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
	])
});

AddModel({
	Name: "LatexCorsetFull",
	Folder: "Corsets",
	Parent: "LatexCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexCorset"),
		...GetModelLayers("LatexBustier"),
	])
});
AddModel({
	Name: "LatexCorsetStrap",
	Folder: "Corsets",
	Parent: "LatexCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexCorset"),
		{ Name: "StrapsHeavyCorset", Layer: "ChestStraps", Pri: 17.1,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
	])
});
AddModel({
	Name: "LatexCorsetFullStrap",
	Folder: "Corsets",
	Parent: "LatexCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexCorset"),
		...GetModelLayers("LatexBustier"),
		{ Name: "StrapsHeavyCorset", Layer: "ChestStraps", Pri: 17.1,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
	])
});
AddModel({
	Name: "LatexCorsetCross",
	Folder: "Corsets",
	Parent: "LatexCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexCorset"),
		{ Name: "CrossHeavyCorset", Layer: "ChestStraps", Pri: 17.1,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
	])
});
AddModel({
	Name: "LatexCorsetFullCross",
	Folder: "Corsets",
	Parent: "LatexCorset",
	TopLevel: false,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexCorset"),
		...GetModelLayers("LatexBustier"),
		{ Name: "CrossHeavyCorset", Layer: "ChestStraps", Pri: 17.1,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest",
			EraseLayers: ToMap(["CorsetBra"]),
		},
	])
});
AddModel(GetModelRestraintVersion("LatexCorset", true));
AddModel(GetModelRestraintVersion("LatexBustier", true));
AddModel(GetModelRestraintVersion("LatexCorsetFull", true));
AddModel(GetModelRestraintVersion("LatexCorsetStrap", true));
AddModel(GetModelRestraintVersion("LatexCorsetCross", true));
AddModel(GetModelRestraintVersion("LatexCorsetFullStrap", true));
AddModel(GetModelRestraintVersion("LatexCorsetFullCross", true));



AddModel({
	Name: "LacePanties",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "LaceCrotchPanel", Layer: "Panties", Pri: 30,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
			Invariant: true,
			InheritColor: "Panties",
		},
		{ Name: "LaceCrotchPanelTrim", Layer: "Panties", Pri: 30.2,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
			Invariant: true,
			DisplacementInvariant: true,
			NoOverride: true,
			TieToLayer: "LaceCrotchPanel",
			InheritColor: "Trim",
		},
		{ Name: "LaceCrotchPanelLace", Layer: "Panties", Pri: 30.1,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
			Invariant: true,
			DisplacementInvariant: true,
			NoOverride: true,
			TieToLayer: "LaceCrotchPanel",
			InheritColor: "Lace",
		},
	])
});


AddModel({
	Name: "LaceCrotchPanel",
	Folder: "Dress",
	Parent: "LacePanties",
	TopLevel: false,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "LaceCrotchPanel", Layer: "CrotchPanelMid", Pri: 30,
			SwapLayerPose: {Kneel: "CrotchPanelLower", KneelClosed: "CrotchPanelLower"},
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			InheritColor: "Panties",
		},
		{ Name: "LaceCrotchPanelTrim", Layer: "CrotchPanelMid", Pri: 30.2,
			SwapLayerPose: {Kneel: "CrotchPanelLower", KneelClosed: "CrotchPanelLower"},
			Invariant: true,
			DisplacementInvariant: true,
			NoOverride: true,
			TieToLayer: "LaceCrotchPanel",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			InheritColor: "Trim",
		},
		{ Name: "LaceCrotchPanelLace", Layer: "CrotchPanelMid", Pri: 30.1,
			SwapLayerPose: {Kneel: "CrotchPanelLower", KneelClosed: "CrotchPanelLower"},
			Invariant: true,
			DisplacementInvariant: true,
			NoOverride: true,
			TieToLayer: "LaceCrotchPanel",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			InheritColor: "Lace",
		},
	])
});



AddModel({
	Name: "DressSkirt",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 9,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			SwapLayerPose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: {Hogtie: "CrotchStrap", CrotchStrap: "CrotchStrap"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 3,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
	])
});


AddModel({
	Name: "DressSkirtSplit",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "SkirtBack", Pri: 9,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			//SwapLayerPose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: {Hogtie: "CrotchStrap", CrotchStrap: "CrotchStrap"},
			InheritColor: "SkirtBack",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtSplit", Layer: "Skirt", Pri: 14,
			Poses: ToMap([...LEGPOSES]), NoOverride: true,
			SwapLayerPose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			InheritColor: "Skirt",
			Invariant: true,
		},
		{ Name: "SkirtSplitOver", Layer: "SkirtOver", Pri: 17,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
	])
});

AddModel({
	Name: "BindingDress",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Restraints"],
	//AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		...GetModelLayers("LaceCorset"),
		...GetModelLayers("DressSkirtSplit"),
		...GetModelLayers("LaceCrotchPanel"),


	])
});


AddModel({
	Name: "BlouseCollar",
	Folder: "Dress",
	Parent: "DressBlouse",
	TopLevel: true,
	Categories: ["Accessories"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{
			Name: "BlouseCollar", Layer: "ShirtCollar", Pri: 10,
			InheritColor: "Collar",
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Up: "Up", Boxtie: "Boxtie", Wristtie: "Boxtie", Crossed: "Boxtie", Front: "Boxtie",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "DressBlouseBust",
	Folder: "Dress",
	Parent: "DressBlouse",
	TopLevel: false,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "BlouseTorso", Layer: "Shirt", Pri: 1,
			InheritColor: "Blouse",
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel",},
		},
		{ Name: "BlouseSkirt", Layer: "SkirtOver", Pri: 100,
			NoOverride: true,
			//InheritColor: "Skirt",
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			SwapLayerPose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel",},
		},
		{ Name: "BlouseSkirtOverKneel", Layer: "SkirtOver", Pri: 100,
			Poses: ToMap([...KNEELPOSES]),
			Invariant: true,
			InheritColor: "BlouseSkirt",
			NoOverride: true,
			//NoOverride: true,
			TieToLayer: "BlouseSkirt",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
		},
		{ Name: "BlouseBust", Layer: "ShirtChest", Pri: 1,
			InheritColor: "Blouse",
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Up: "Up", Boxtie: "Boxtie", Wristtie: "Boxtie", Crossed: "Boxtie", Front: "Boxtie",},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			AppendPose: {Chesttied: "Chesttied"},
			Invariant: true,
		},
		{ Name: "BlouseNeck", Layer: "ShirtChest", Pri: 1.1,
			InheritColor: "Neck",
			TieToLayer: "BlouseBust",
			NoOverride: true,
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Up: "Up", Boxtie: "Boxtie", Wristtie: "Boxtie", Crossed: "Boxtie", Front: "Boxtie",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
		},
		...GetModelLayers("BlouseCollar"),
	])
});


AddModel({
	Name: "DressBlouseBustCropped",
	Folder: "Dress",
	Parent: "DressBlouse",
	TopLevel: false,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "CroppedBlouseTorso", Layer: "Shirt", Pri: 1,
			InheritColor: "Blouse",
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel",},
		},
		{ Name: "BlouseBust", Layer: "ShirtChest", Pri: 1,
			InheritColor: "Blouse",
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Up: "Up", Boxtie: "Boxtie", Wristtie: "Boxtie", Crossed: "Boxtie", Front: "Boxtie",},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			AppendPose: {Chesttied: "Chesttied"},
			Invariant: true,
		},
		{ Name: "BlouseNeck", Layer: "ShirtChest", Pri: 1.1,
			InheritColor: "Neck",
			TieToLayer: "BlouseBust",
			NoOverride: true,
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Up: "Up", Boxtie: "Boxtie", Wristtie: "Boxtie", Crossed: "Boxtie", Front: "Boxtie",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
		},
		...GetModelLayers("BlouseCollar"),
	])
});

AddModel({
	Name: "DressBlouseSleeveLeft",
	Folder: "Dress",
	Parent: "DressBlouseSleeves",
	Categories: ["Sleeves"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "BlouseArmLeft", Layer: "SleeveLeft", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "BlouseForeArmLeft", Layer: "ForeSleeveLeft", Pri: 40,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveLeft"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
	])
});
AddModel({
	Name: "DressBlouseSleeveRight",
	Folder: "Dress",
	Parent: "DressBlouseSleeves",
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "BlouseArmRight", Layer: "SleeveRight", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "BlouseForeArmRight", Layer: "ForeSleeveRight", Pri: 40,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveRight"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
	])
});


AddModel({
	Name: "DressBlouseSleeves",
	Folder: "Dress",
	Parent: "DressBlouse",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("DressBlouseSleeveLeft"),
		...GetModelLayers("DressBlouseSleeveRight"),
	])
});

AddModel({
	Name: "DressBlouse",
	Folder: "Dress",
	Parent: "DressBlouse",
	TopLevel: true,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		...GetModelLayers("DressBlouseSleeveLeft"),
		...GetModelLayers("DressBlouseSleeveRight"),
		...GetModelLayers("DressBlouseBust"),

	])
});




AddModel({
	Name: "Glasses",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "Glasses", Layer: "Glasses", Pri: 20,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "GlassesLens", Layer: "Glasses", Pri: 20.1,
			InheritColor: "Lens",
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Glasses",
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "MonocleLeft",
	Folder: "Dress",
	Parent: "Glasses",
	TopLevel: false,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "MonocleLeft", Layer: "Glasses", Pri: 25,
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "MonocleLensLeft", Layer: "Glasses", Pri: 25.1,
			InheritColor: "LensLeft",
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Glasses",
		},
	])
});
AddModel({
	Name: "MonocleRight",
	Folder: "Dress",
	Parent: "Glasses",
	TopLevel: false,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "MonocleRight", Layer: "Glasses", Pri: 25,
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "MonocleLensRight", Layer: "Glasses", Pri: 25.1,
			InheritColor: "LensRight",
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Glasses",
		},
	])
});


AddModel({
	Name: "DressShoes",
	Folder: "Dress",
	Parent: "Dress",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidShoes", undefined, undefined, undefined, -1),
	])
});


AddModel({
	Name: "Dress",
	Folder: "Dress",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("DressSkirt"),
		...GetModelLayers("DressBlouse"),
		...GetModelLayers("LacePanties"),
		...GetModelLayers("LaceCorset"),
		...GetModelLayers("LaceBra"),
	])
});