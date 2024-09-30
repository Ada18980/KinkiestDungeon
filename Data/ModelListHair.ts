/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "HairBow",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Bow", Layer: "HatBack", Pri: -100,
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "HairBowFrilly",
	Parent: "Maid",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		...GetModelLayers("HairBow"),
		{ Name: "BowFrills", Layer: "HatBack", Pri: -100.1,
			NoOverride: true,
			TieToLayer: "Bow",
		},
	])
});

AddModel({
	Name: "Hairband",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Hairband", Layer: "HairFront", Pri: 20,
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "Hairband2",
	Folder: "GagLeather",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Hairband", Layer: "HairFront", Pri: 20,
			Sprite: "BallSideStrap",
			NoOverride: true,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "MaidHairband",
	Parent: "Hairband",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Hairband", Layer: "HairFront", Pri: 20,
			NoOverride: true,
		},
		{ Name: "MaidFrill", Layer: "HairFront", Pri: 20.1,
			NoOverride: true, TieToLayer: "Hairband",
			InheritColor: "Frill",
		},
	])
});

AddModel({
	Name: "LightMaidKnightHairband",
	Parent: "LightMaidKnight",
	Folder: "MaidKnightLight",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Headband", Layer: "HairFront", Pri: 15,
			NoOverride: true,
		},
		{ Name: "HeadbandFrill", Layer: "HairFront", Pri: 15.1,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Frill",
		},
		{ Name: "HeadbandRibbon", Layer: "HairFront", Pri: 15.1,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Ribbon",
		},
	])
});

AddModel({
	Name: "Braid",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Braid", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "Braid_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "Braid",
		},
		{ Name: "BraidBack", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "BraidCustom",
	Parent: "Braid",
	Folder: "Hair",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "BraidCustom", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "BraidCustom_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "BraidCustom",
		},
	])
});
AddModel({
	Name: "BraidCustomBack",
	Parent: "Braid",
	Folder: "Hair",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BraidCustomBack", Layer: "HairBack", Pri: -1,
		},
		{ Name: "BraidCustomBraid", Layer: "Hair", Pri: -1,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
	])
});
AddModel({
	Name: "BraidCustomBackNoBraid",
	Parent: "Braid",
	Folder: "Hair",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BraidCustomBack", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "BackStraight",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BackStraight", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "Curly",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Curly", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "Curly_Overstrap", Layer: "HairFront", Pri: 0,
			InheritColor: "Curly",
		},
	])
});
AddModel({
	Name: "Fluffy",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Fuzzy", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Fuzzy",
		},
		{ Name: "Fuzzy_Overstrap", Layer: "HairFront", Pri: 0,
			InheritColor: "Fuzzy",
		},
	])
});
AddModel({
	Name: "FrontStraight",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "FrontStraight", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "FrontStraight_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "FrontStraight",
		},
	])
});
AddModel({
	Name: "Straight",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Straight", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "Straight_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "Straight",
		},
	])
});
AddModel({
	Name: "StraightBangs",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "StraightBangs", Layer: "Hair", Pri: 0,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "StraightBangs_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "StraightBangs",
		},
	])
});
AddModel({
	Name: "MessyBack",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "Messy", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "ShortMessyBack",
	Parent: "MessyBack",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BackShortMessy", Layer: "HairBack", Pri: 0,
		},
		{ Name: "BackShortMessyUnderlight", Layer: "HairBack", Pri: -0.1,
		  NoOverride: true, TieToLayer: "BackShortMessy",
		},
	])
});
AddModel({
	Name: "ShortCurlyBack",
	Parent: "Curly",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BackShortCurly", Layer: "HairBack", Pri: 0,
		},
		{ Name: "BackShortCurlyUnderlight", Layer: "HairBack", Pri: -0.1,
		  NoOverride: true, TieToLayer: "BackShortCurly",
		},
	])
});
AddModel({
	Name: "Ponytail",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "Ponytail", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "FluffyPonytail",
	Parent: "Ponytail",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "Ponytail2", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "TwintailLeft",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "TwintailLeft", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "TwintailRight",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "TwintailRight", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "Ahoge",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles"],
	Layers: ToLayerMap([
		{ Name: "Ahoge", Layer: "Ahoge", Pri: 0,
			HideWhenOverridden: true,
			HideOverrideLayer: "Hat",
		},
	])
});
