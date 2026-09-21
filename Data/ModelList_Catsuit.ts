"use strict";

AddModel({
	Name: "CatsuitLower",
	TopLevel: false,
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Parent: "Catsuit",
	Layers: ToLayerMap([
		{ Name: "TorsoLower", Layer: "TorsoLower", Pri: 1,
			InheritColor: "TorsoLower",
			MorphPoses: {Closed: "Closed", Spread: "Spread", Hogtie: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
		},
		/* { Name: "FootRight", Layer: "FootRight", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTRIGHTPOSES),
		}, */
		{ Name: "FootRightKneel", Layer: "FootRightKneel", Pri: 1,
			InheritColor: "TorsoLower",
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			MorphPoses: {Kneel: ""},
		},
		/* { Name: "FootLeft", Layer: "FootLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		}, */
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "Butt", Layer: "Butt", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(KNEELPOSES),
		},
	])
});

AddModel({
	Name: "CatsuitLowerLowRise",
	TopLevel: false,
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Parent: "Catsuit",
	Layers: ToLayerMap([
		{ Name: "TorsoLowerLowRise", Layer: "TorsoLower", Pri: 1,
			InheritColor: "TorsoLower",
			MorphPoses: {Closed: "Closed", Spread: "Spread", Hogtie: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
		},
		/**
		{ Name: "FootRight", Layer: "FootRight", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTRIGHTPOSES),
		}, */
		{ Name: "FootRightKneel", Layer: "FootRightKneel", Pri: 1,
			InheritColor: "TorsoLower",
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			MorphPoses: {Kneel: ""},
		},
		/*
		{ Name: "FootLeft", Layer: "FootLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		}, */
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		// { Name: "Butt", Layer: "Butt", Pri: 1,
		// 	InheritColor: "TorsoLower",
		// 	Poses: ToMap(KNEELPOSES),
		// },
	])
});
AddModel({
	Name: "CatsuitLowerLeotard",
	TopLevel: true,
	Categories: ["Suits", "Underwear", "Panties"],
	Folder: "LatexCatsuit",
	Parent: "Catsuit",
	Layers: ToLayerMap([
		{ Name: "TorsoLowerLeotard", Layer: "Bodysuit", Pri: -20,
			InheritColor: "Latex",
		},
	])
});

AddModel({
	Name: "CatsuitUpper",
	TopLevel: false,
	Parent: "Catsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			//AppendPose: ToMapDupe(["Hogtie"]),
			//AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			ErasePoses: ["HideHands"],
			EraseLayers: {RightHand: true},
			EraseSprite: "HideBoxtieHand",
			EraseInvariant: true,
			//AppendPose: ToMapDupe(["Hogtie"]),
			//AppendPoseRequire: ToMap(["Wristtie"]),
		},/*
		{ Name: "ShoulderRight", Layer: "ShoulderRight", Pri: 0,
			InheritColor: "TorsoUpper",
			Poses: ToMap([...SHOULDERPOSES]),
		},
		{ Name: "ShoulderLeft", Layer: "ShoulderLeft", Pri: 0,
			InheritColor: "TorsoUpper",
			Poses: ToMap([...SHOULDERPOSES]),
		},*/

		{ Name: "ForeArmRight", Layer: "ForeArmRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossArmRight"},
		},
		{ Name: "ForeArmLeft", Layer: "ForeArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossArmLeft"},
		},
		{ Name: "HandRight", Layer: "HandRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(HANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandRight"]),
		},
		{ Name: "HandLeft", Layer: "HandLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(HANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandLeft"]),
		},
		{ Name: "ForeHandRight", Layer: "ForeHandRight", Pri: 1,
			Sprite: "HandRight",
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREHANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandRight"]),
		},
		{ Name: "ForeHandLeft", Layer: "ForeHandLeft", Pri: 1,
			Sprite: "HandLeft",
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREHANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandLeft"]),
		},
		{ Name: "TorsoUpper", Layer: "TorsoUpper", Pri: 1,
			InheritColor: "TorsoUpper",
			AppendPose: {Up: "Up"},
		},
		{ Name: "Chest", Layer: "CatsuitChest", Pri: 1,
			InheritColor: "TorsoUpper",
			//GlobalDefaultOverride: ToMap(["Hogtie"]),
		},

	])
});
AddModel({
	Name: "SleevelessCatsuitUpper",
	TopLevel: false,
	Parent: "Catsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		{ Name: "SleevelessTorsoUpper", Layer: "TorsoUpper", Pri: 1,
			InheritColor: "TorsoUpper",
		},
		{ Name: "Chest", Layer: "CatsuitChest", Pri: 1,
			InheritColor: "TorsoUpper",
			//GlobalDefaultOverride: ToMap(["Hogtie"]),
		},

	])
});


AddModel({
	Name: "CatsuitTop",
	TopLevel: true,
	Parent: "Catsuit",
	Categories: ["Suits", "Tops", "Bras"],
	Folder: "LatexCatsuit",
	Layers: ToLayerMap([
		{ Name: "SleevelessTop", Layer: "Bodysuit", Pri: -4,
			InheritColor: "Latex",
		},
		{ Name: "SleevelessTopChest", Layer: "SuitChest", Pri: -4,
			InheritColor: "Latex",
		},

	])
});
AddModel({
	Name: "CatsuitTopV",
	TopLevel: true,
	Parent: "Catsuit",
	Categories: ["Suits", "Tops", "Bras"],
	Folder: "LatexCatsuit",
	Layers: ToLayerMap([
		{ Name: "SleevelessTopV", Layer: "Bodysuit", Pri: -3.5,
			InheritColor: "Latex",
		},
		{ Name: "SleevelessTopVChest", Layer: "SuitChest", Pri: -3.5,
			InheritColor: "Latex",
		},

	])
});

AddModel({
	Name: "CatsuitUpperCropped",
	TopLevel: false,
	Parent: "Catsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			//AppendPose: ToMapDupe(["Hogtie"]),
			//AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			ErasePoses: ["HideHands"],
			EraseLayers: {RightHand: true},
			EraseSprite: "HideBoxtieHand",
			EraseInvariant: true,
			//AppendPose: ToMapDupe(["Hogtie"]),
			//AppendPoseRequire: ToMap(["Wristtie"]),
		},/*
		{ Name: "ShoulderRight", Layer: "ShoulderRight", Pri: 0,
			InheritColor: "TorsoUpper",
			Poses: ToMap([...SHOULDERPOSES]),
		},
		{ Name: "ShoulderLeft", Layer: "ShoulderLeft", Pri: 0,
			InheritColor: "TorsoUpper",
			Poses: ToMap([...SHOULDERPOSES]),
		},*/

		{ Name: "ForeArmRight", Layer: "ForeArmRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossArmRight"},
		},
		{ Name: "ForeArmLeft", Layer: "ForeArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossArmLeft"},
		},
		{ Name: "HandRight", Layer: "HandRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(HANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandRight"]),
		},
		{ Name: "HandLeft", Layer: "HandLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(HANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandLeft"]),
		},
		{ Name: "ForeHandRight", Layer: "ForeHandRight", Pri: 1,
			Sprite: "HandRight",
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREHANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandRight"]),
		},
		{ Name: "ForeHandLeft", Layer: "ForeHandLeft", Pri: 1,
			Sprite: "HandLeft",
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREHANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePoses: ToMap(["HideHands", "EncaseHandLeft"]),
		},
		{ Name: "TorsoUpperCrop", Layer: "TorsoUpper", Pri: 1,
			InheritColor: "TorsoUpper",
			AppendPose: {Up: "Up"},
		},
		{ Name: "Chest", Layer: "CatsuitChest", Pri: 1,
			InheritColor: "TorsoUpper",
			//GlobalDefaultOverride: ToMap(["Hogtie"]),
		},

	])
});


AddModel({
	Name: "Catsuit",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Group: "Catsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		...GetModelLayers("CatsuitUpper"),
		...GetModelLayers("CatsuitLower"),
	])
});

AddModel({
	Name: "CatsuitRestraint",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Group: "Catsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		...GetModelLayers("CatsuitUpper", undefined, undefined, undefined, 0.1),
		...GetModelLayers("CatsuitLower", undefined, undefined, undefined, 0.1),
	])
});




AddModel({
	Name: "TransparentCatsuitUpper",
	TopLevel: false,
	Parent: "TransparentCatsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Filters: {
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
	},
	Layers: ToLayerMap([
		...GetModelLayersNoOverrideCB("CatsuitUpper", (layer) => {
			if (layer.Name == "Chest" || layer.Name == "TorsoUpper") {
				layer.Sprite = "Trans" + layer.Name;
			}
		}),
	]),
});
AddModel({
	Name: "TransparentCatsuitUpperCropped",
	TopLevel: false,
	Parent: "TransparentCatsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Filters: {
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
	},
	Layers: ToLayerMap([
		...GetModelLayersNoOverrideCB("CatsuitUpperCropped", (layer) => {
			if (layer.Name == "Chest" || layer.Name == "TorsoUpper") {
				layer.Sprite = "Trans" + layer.Name;
			}
		}),
	]),
});

AddModel({
	Name: "TransparentCatsuitLower",
	TopLevel: false,
	Parent: "TransparentCatsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Filters: {
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
	},
	Layers: ToLayerMap([
		...GetModelLayersNoOverride("CatsuitLower"),
	]),
});


AddModel({
	Name: "TransparentCatsuitLowerLeotard",
	TopLevel: true,
	Categories: ["Suits", "Underwear", "Panties"],
	Folder: "LatexCatsuit",
	Parent: "Catsuit",
	Filters: {
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
	},
	Layers: ToLayerMap([
		{ Name: "TorsoLowerLeotard", Layer: "Bodysuit", Pri: -20,
			InheritColor: "Latex",
			//MorphPoses: {Closed: "Closed", Spread: "Spread", Hogtie: "Closed"},
		},
	])
});

AddModel({
	Name: "TransparentCatsuitLowerLowRise",
	TopLevel: false,
	Parent: "TransparentCatsuit",
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Filters: {
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
	},
	Layers: ToLayerMap([
		...GetModelLayersNoOverride("CatsuitLowerLowRise"),
	]),
});

AddModel({
	Name: "TransparentCatsuit",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "LatexCatsuit",
	Group: "Catsuit",
	Filters: {
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5333333333333333},
	},
	Layers: ToLayerMap([
		...GetModelLayersNoOverrideCB("Catsuit", (layer) => {
			if (layer.Name == "Chest" || layer.Name == "TorsoUpper") {
				layer.Sprite = "Trans" + layer.Name;
			}
		}),
	]),
});


/*** leather ***/


AddModel({
	Name: "LeatherCatsuitLower",
	TopLevel: false,
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	Parent: "LeatherCatsuit",
	Layers: ToLayerMap([
		{
			Name: "TorsoLower",
			Layer: "TorsoLower",
			Pri: 1,
			MorphPoses: {Closed: "Closed", Spread: "Spread", Hogtie: "Hogtie", Kneel: "Kneel", KneelClosed: "Kneel"},
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquishTight",
			DisplacementInvariant: true,
		},
		{
			Name: "LegRight",
			Layer: "LegRight",
			Pri: 1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},
		{
			Name: "LegLeft",
			Layer: "LegLeft",
			Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},
		{
			Name: "Butt",
			Layer: "Butt",
			Pri: 1,
			InheritColor: "LegLeft",
			Poses: ToMap(KNEELPOSES),
		},
	]),
});

AddModel({
	Name: "LeatherCatsuitUpper",
	TopLevel: false,
	Parent: "LeatherCatsuit",
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		{
			Name: "ArmRight",
			Layer: "ArmRight",
			Pri: 1,
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
		},
		{
			Name: "ArmLeft",
			Layer: "ArmLeft",
			Pri: 1,
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
		},
		{
			Name: "ForeArmRight",
			Layer: "ForeArmRight",
			Pri: 1,
			InheritColor: "ArmRight",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{
			Name: "ForeArmLeft",
			Layer: "ForeArmLeft",
			Pri: 1,
			InheritColor: "ArmLeft",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{
			Name: "TorsoUpper",
			Layer: "TorsoUpper",
			Pri: 1,
			InheritColor: "TorsoUpper",
			AppendPose: {Up: "Up", Crossed: "Crossed", Front: "Front", Boxtie: "Boxtie", Wristtie: "Wristtie", Yoked: "Yoked"},
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquishTight",
			DisplacementInvariant: true,
		},
		{
			Name: "Chest",
			Layer: "CatsuitChest",
			Pri: 1,
			InheritColor: "TorsoUpper",
		},
	]),
});


AddModel({
	Name: "LeatherCatsuit",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	Group: "LeatherCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherCatsuitUpper"),
		...GetModelLayers("LeatherCatsuitLower"),
	]),
});


AddModel({
	Name: "TransparentLeatherCatsuitLower",
	TopLevel: false,
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	Parent: "LeatherCatsuit",
	Filters: {
		LegLeft: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		LegRight: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0}
	},
	Layers: ToLayerMap([
		{
			Name: "TorsoLower",
			Layer: "TorsoLower",
			Pri: 1,
			InheritColor: "TorsoLower",
			MorphPoses: {Closed: "Closed", Spread: "Spread", Hogtie: "Hogtie", Kneel: "Kneel", KneelClosed: "Kneel"},
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquishTight",
			DisplacementInvariant: true,
			NoOverride: true,
		},
		{
			Name: "LegRight",
			Layer: "LegRight",
			Pri: 1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},
		{
			Name: "LegLeft",
			Layer: "LegLeft",
			Pri: 1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},
		{
			Name: "Butt",
			Layer: "Butt",
			Pri: 1,
			InheritColor: "LegLeft",
			Poses: ToMap(KNEELPOSES),
			NoOverride: true,
		},
	]),
});

AddModel({
	Name: "TransparentLeatherCatsuitUpper",
	TopLevel: false,
	Parent: "LeatherCatsuit",
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	AddPose: ["HideNipples"],
	Filters: {
		ArmRight: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		ArmLeft: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0}
	},
	Layers: ToLayerMap([
		{
			Name: "ArmRight",
			Layer: "ArmRight",
			Pri: 1,
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			NoOverride: true,
		},
		{
			Name: "ArmLeft",
			Layer: "ArmLeft",
			Pri: 1,
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			NoOverride: true,
		},
		{
			Name: "ForeArmRight",
			Layer: "ForeArmRight",
			Pri: 1,
			InheritColor: "ArmRight",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,
		},
		{
			Name: "ForeArmLeft",
			Layer: "ForeArmLeft",
			Pri: 1,
			InheritColor: "ArmLeft",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,
		},
		{
			Name: "TorsoUpper",
			Layer: "TorsoUpper",
			Pri: 1,
			InheritColor: "TorsoUpper",
			AppendPose: {Up: "Up", Crossed: "Crossed", Front: "Front", Boxtie: "Boxtie", Wristtie: "Wristtie", Yoked: "Yoked"},
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquishTight",
			DisplacementInvariant: true,
			NoOverride: true,
		},
		{
			Name: "Chest",
			Layer: "CatsuitChest",
			Pri: 1,
			InheritColor: "TorsoUpper",
			NoOverride: true,
		},
	]),
});


AddModel({
	Name: "TransparentLeatherCatsuit",
	TopLevel: false,
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	Group: "LeatherCatsuit",
	AddPose: ["HideNipples"],
	Filters: {
		ArmRight: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		ArmLeft: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		LegLeft: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		LegRight: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		TorsoUpper: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0},
		TorsoLower: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.65,"hue":-1,"colorize":0}
	},
	Layers: ToLayerMap([
		...GetModelLayers("TransparentLeatherCatsuitUpper"),
		...GetModelLayers("TransparentLeatherCatsuitLower"),
	]),
});

AddModel({
	Name: "LeatherCatsuitRestraint",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	Group: "LeatherCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherCatsuitUpper", undefined, undefined, undefined, 0.1),
		...GetModelLayers("LeatherCatsuitLower", undefined, undefined, undefined, 0.1),
	]),
});

AddModel({
	Name: "LeatherCatsuitLeotard",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "LeatherCatsuit",
	Group: "LeatherCatsuit",
	AddPose: ["HideNipples"],
	Layers: ToLayerMap([
		{
			Name: "LeotardUpper",
			Layer: "TorsoUpper",
			Pri: 1,
			InheritColor: "TorsoUpper",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquishTight",
			DisplacementInvariant: true,
		},
		{
			Name: "LeotardLower",
			Layer: "TorsoLower",
			Pri: 1,
			InheritColor: "TorsoLower",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquishTight",
			DisplacementInvariant: true,
		},
		{
			Name: "Chest",
			Layer: "CatsuitChest",
			Pri: 1,
			InheritColor: "TorsoUpper",
		},
	]),
});
