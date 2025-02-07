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
	Parent: "Hairband",
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
	Name: "FrillyHeadband",
	Parent: "Hairband",
	Folder: "Hat",
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Headband", Layer: "HairFront", Pri: 70,
			NoOverride: true,
		},
		{ Name: "HeadbandFrill", Layer: "HairFront", Pri: 70.2,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Frill",
		},
		{ Name: "HeadbandBand", Layer: "HairFront", Pri: 70.1,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Band",
		},
		{ Name: "HeadbandBow", Layer: "HairFront", Pri: 70.3,
			NoOverride: true, TieToLayer: "HaiHeadbandrband",
			InheritColor: "Bow",
		},
	])
});
AddModel({
	Name: "BowHeadband",
	Parent: "Hairband",
	Folder: "Hat",
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "BowHeadband", Layer: "HairFront", Pri: 65,
			NoOverride: true,
		},
		{ Name: "BowHeadbandFrill", Layer: "HairFront", Pri: 65.1,
			NoOverride: true, TieToLayer: "BowHeadband",
			InheritColor: "Frill",
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
	Name: "BackHime",
	Folder: "Hair",
	TopLevel: false,
	Parent: "BackStraight",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "HimeBack", Layer: "HairBack", Pri: 5,
		},
	])
});
AddModel({
	Name: "BackShort",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BackShort", Layer: "HairBack", Pri: 15,
		},
	])
});
AddModel({
	Name: "BackFlat",
	Folder: "Hair",
	TopLevel: false,
	Parent: "BackShort",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BackFlat", Layer: "HairBack", Pri: 12,
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
	Parent: "Curly",
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
	TopLevel: false,
	Protected: true,
	Parent: "Straight",
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
	Name: "Bob",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Parent: "Straight",
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Bob", Layer: "Hair", Pri: 7,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "BobFront", Layer: "HairFront", Pri: 7,
		},
	])
});
AddModel({
	Name: "FrontStraight2",
	Folder: "Hair",
	TopLevel: false,
	Parent: "Straight",
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "FrontStraight2", Layer: "Hair", Pri: 3,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "FrontStraight2_Front", Layer: "HairFront", Pri: 3,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Bangs",
		},
		{ Name: "FrontStraight2_Overstrap", Layer: "HairFront", Pri: 3,
			InheritColor: "Bangs",
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
	Name: "FrontSwept",
	Folder: "Hair",
	Parent: "Curly",
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "FrontSwept", Layer: "Hair", Pri: -20,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "FrontSweptSide", Layer: "Hair", Pri: -20, InheritColor: "SideBang",
			SwapLayerPose: {HoodMask: "HairOver"},
		},
	])
});
AddModel({
	Name: "Vents",
	Folder: "Hair",
	Parent: "StraightBangs",
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "VentL", Layer: "Hair", Pri: 15,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "VentR", Layer: "Hair", Pri: 15,
			SwapLayerPose: {HoodMask: "HairOver"},
		},
		{ Name: "VentsInnerR", Layer: "Hair", Pri: 15.1,
			SwapLayerPose: {HoodMask: "HairOver"},
			TieToLayer: "VentR",
		},
		{ Name: "VentsInnerL", Layer: "Hair", Pri: 15.1,
			SwapLayerPose: {HoodMask: "HairOver"},
			TieToLayer: "VentL",
		},
		{ Name: "VentsFront", Layer: "HairFront", Pri: 15,
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
	Parent: "MessyBack",
	Folder: "Hair",
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
		{ Name: "Ponytail", Layer: "HairPonytail", Pri: 0,
		},
	])
});
AddModel({
	Name: "BigBraidBack",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Parent: "Braid",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "BigBraidBack", Layer: "HairBack", Pri: -20,
		},
	])
});
AddModel({
	Name: "CurlyPonytail",
	Folder: "Hair",
	TopLevel: false,
	Parent: "Ponytail",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "CurlyPonytail", Layer: "HairPonytail", Pri: 0,
		},
	])
});
AddModel({
	Name: "FluffyPonytail",
	Parent: "Ponytail",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "Ponytail2", Layer: "HairPonytail", Pri: 0,
		},
	])
});

AddModel({
	Name: "DrillLeft",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Parent: "Twindrills",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "DrillLeft", Layer: "HairPonytail", Pri: 4,
		},
	])
});
AddModel({
	Name: "DrillRight",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Parent: "Twindrills",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "DrillRight", Layer: "HairPonytail", Pri: 4,
		},
	])
});
AddModel({
	Name: "TwintailLeft",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Parent: "Twintails",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "TwintailLeft", Layer: "HairPonytail", Pri: 0,
		},
	])
});
AddModel({
	Name: "TwintailRight",
	Folder: "Hair",
	TopLevel: false,
	Protected: true,
	Parent: "Twintails",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "TwintailRight", Layer: "HairPonytail", Pri: 0,
		},
	])
});
AddModel({
	Name: "Twindrills",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Parent: "Ponytail",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		...GetModelLayers("DrillLeft"),
		...GetModelLayers("DrillRight"),
	])
});
AddModel({
	Name: "Twintails",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Parent: "Ponytail",
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		...GetModelLayers("TwintailLeft"),
		...GetModelLayers("TwintailRight"),
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

AddModel({
	Name: "PointyAhoge",
	Folder: "Pointy",
	Parent: "Ahoge",
	Protected: true,
	Categories: ["Hairstyles"],
	Layers: ToLayerMap([
		{ Name: "Ahoge", Layer: "Ahoge", Pri: 0,
			HideWhenOverridden: true,
			HideOverrideLayer: "Hat",
			OffsetX: 527,
			OffsetY: 80,
		},
	])
});



AddModel({
	Name: "RoundHat",
	Folder: "Hat",
	Parent: "RoundHat",
	TopLevel: true,
	Categories: ["Hats"],
	Layers: ToLayerMap([
		{ Name: "Hat", Layer: "Hat", Pri: 35,
			Invariant: true,
			InheritColor: "Rim",
		},
		{ Name: "HatTop", Layer: "Hat", Pri: 35.5,
			HideWhenOverridden: true,
			Invariant: true,
			InheritColor: "Top",
		},
		{ Name: "Ribbon", Layer: "Hat", Pri: 36,
			TieToLayer: "HatTop",
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "HatBack", Layer: "HatBack", Pri: 35,
			Invariant: true,
			InheritColor: "Rim",
			TieToLayer: "Hat",
			NoOverride: true,
		},
	])
});



AddModel({
	Name: "TopHatSmall",
	Folder: "Hat",
	Parent: "TopHatSmall",
	TopLevel: true,
	Categories: ["Hats"],
	Layers: ToLayerMap([
		{ Name: "TopHatSmall", Layer: "Hat", Pri: 5,
			HideWhenOverridden: true,
			Invariant: true,
			InheritColor: "Rim",
		},
		{ Name: "TopHatSmallBow", Layer: "Hat", Pri: 5.1,
			Invariant: true,
			InheritColor: "Ribbon",
			NoOverride: true,
			TieToLayer: "TopHatSmall",
		},
	])
});


AddModel({
	Name: "HeavyMaidKnightHairband",
	Parent: "HeavyMaidKnight",
	Parent2: ["Hairband"],
	Folder: "MaidKnightHeavy",
	TopLevel: false,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "Headband", Layer: "HairFront", Pri: 17,
			NoOverride: true,
		},
		{ Name: "HeadbandFrill", Layer: "HairFront", Pri: 17.1,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Frill",
		},
		{ Name: "HeadbandRibbon", Layer: "HairFront", Pri: 17.1,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Ribbon",
		},
		{ Name: "HeadbandRibbonBack", Layer: "Head", Pri: -1,
			NoOverride: true, TieToLayer: "Headband",
			InheritColor: "Ribbon",
		},
	])
});

AddModel({
	Name: "LightMaidKnightHairband",
	Parent: "LightMaidKnight",
	Parent2: ["Hairband"],
	Folder: "MaidKnightLight",
	TopLevel: false,
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
