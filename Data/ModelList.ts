/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "Catsuit",
	TopLevel: true,
	Categories: ["Suits"],
	Folder: "Catsuit",
	Group: "Catsuit",
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES], "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			AppendPose: ToMapDupe(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES], "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front", "Crossed"]),
			AppendPose: ToMapDupe(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ShoulderRight", Layer: "ShoulderRight", Pri: 0,
			InheritColor: "TorsoUpper",
			Poses: ToMap([...SHOULDERPOSES]),
		},
		{ Name: "ShoulderLeft", Layer: "ShoulderLeft", Pri: 0,
			InheritColor: "TorsoUpper",
			Poses: ToMap([...SHOULDERPOSES]),
		},

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
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "TorsoLower", Layer: "TorsoLower", Pri: 1,
			MorphPoses: {Closed: "Closed", Spread: "Spread", Hogtie: "Closed"},
		},
		{ Name: "TorsoUpper", Layer: "TorsoUpper", Pri: 1,
		},
		{ Name: "Chest", Layer: "Chest", Pri: 1,
			InheritColor: "TorsoUpper",
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootRight", Layer: "FootRight", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTRIGHTPOSES),
		},
		{ Name: "FootRightKneel", Layer: "FootRightKneel", Pri: 1,
			InheritColor: "TorsoLower",
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			MorphPoses: {Kneel: ""},
		},
		{ Name: "FootLeft", Layer: "FootLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
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
		{ Name: "Butt", Layer: "Butt", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(KNEELPOSES),
		},
	])
});

AddModel({
	Name: "Labcoat",
	Folder: "Labcoat",
	TopLevel: true,
	Categories: ["Tops", "Accessories"],
	Layers: ToLayerMap([
		// Duplicate yoked is to override Closed override
		{ Name: "Shoulders", Layer: "Shoulders", Pri: 10,
			Poses: ToMap(["Yoked", "Up", "Spread", "Closed", "Kneel", "KneelClosed"]),
			InheritColor: "Coat",
			MorphPoses: {Yoked: "Yoked", Closed: "Spread"},
		},
		{ Name: "ShouldersHogtie", Layer: "Shoulders", Pri: 10,
			Poses: ToMapSubtract([...ARMPOSES, "Hogtie"], ["Wristtie", "Yoked", "Up"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			HidePoses: ToMap(["Spread", "Closed", "Yoked", "Up"]),
			InheritColor: "Coat",
			MorphPoses: {Boxtie: "Free", Free: "Free", Hogtie: ""},
		},
		{ Name: "Coat", Layer: "Coat", Pri: 0,
			Poses: ToMap(["Kneel", "KneelClosed", "Yoked", "Spread", "Closed"]),
			HidePoses: ToMap(["Hogtie"]),
			MorphPoses: {Closed: "Spread"},
		},
		// This one is weird, its just a special case
		{ Name: "CoatHogtieFree", Layer: "Cape", Pri: 0,
			Poses: ToMap(["Hogtie"]),
			HidePoses: ToMap(["Wristtie"]),
			InheritColor: "Coat",
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "Cape", Layer: "Cape", Pri: 0,
			Poses: ToMap(["Hogtie", "Kneel", "KneelClosed", "Yoked", "Spread", "Closed"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			MorphPoses: {Closed: "Spread"},
		},
	])
});

AddModel({
	Name: "Cape",
	Folder: "Cape",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		// Duplicate yoked is to override Closed override
		{ Name: "Shoulders", Layer: "Shoulders", Pri: 10,
			Poses: ToMap(["Yoked", "Up", "Spread", "Closed", "Kneel", "KneelClosed"]),
			InheritColor: "Front",
			MorphPoses: {Yoked: "Yoked", Closed: "Spread"},
		},
		{ Name: "ShouldersHogtie", Layer: "Shoulders", Pri: 10,
			Poses: ToMapSubtract([...ARMPOSES, "Hogtie"], ["Wristtie", "Yoked", "Up"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			HidePoses: ToMap(["Spread", "Closed", "Yoked", "Up"]),
			InheritColor: "Front",
			MorphPoses: {Boxtie: "Free", Free: "Free", Hogtie: ""},
		},
		{ Name: "Cape", Layer: "Cape", Pri: 0,
			Poses: ToMap(["Hogtie", "Kneel", "KneelClosed", "Yoked", "Spread", "Closed"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			MorphPoses: {Closed: "Spread"},
			InheritColor: "Back",
		},
	])
});


AddModel({
	Name: "Pauldrons",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "Pauldrons", Layer: "Shoulders", Pri: 8,
			Poses: ToMapSubtract([...ARMPOSES], [...HIDEARMPOSES, "Up"], "Hogtie"),
			MorphPoses: {Yoked: "Yoked", Hogtie: "Hogtie", Wristtie: "Free", Boxtie: "Free", Front: "Free"},
			HideWhenOverridden: true,
		},
	])
});
AddModel({
	Name: "Breastplate",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "Breastplate", Layer: "Chestplate", Pri: 25,
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Hogtie"},
			Invariant: true,
			DisplacementSprite: "Breastplate",
			DisplaceAmount: 20,
			DisplaceLayers: ToMap(["Breastplate"]),
		},
	])
});


AddModel({
	Name: "PlateBoots",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "BootLeft", Layer: "ShoeLeft", Pri: 25,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			HideWhenOverridden: true,
			NoDisplace: true,
			DisplacementSprite: "Boots",
			DisplaceAmount: 10,
			DisplaceLayers: ToMap(["Boots"]),
		},
		{ Name: "BootRight", Layer: "ShoeRight", Pri: 25,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
			NoDisplace: true,
		},
		{ Name: "BootRightKneel", Layer: "ShoeRightKneel", Pri: 25,
			Poses: ToMap(["Kneel"]),
			HidePoses: ToMap(["FeetLinked"]),
			HideWhenOverridden: true,
			InheritColor: "BootRight",
			Invariant: true,
		},
		{ Name: "BootLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 25,
			Poses: ToMap(["Hogtie"]),
			HideWhenOverridden: true,
			InheritColor: "BootLeft",
			Invariant: true,
		},
	])
});


AddModel({
	Name: "GauntletLeft",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GauntletLeft", Layer: "GloveLeft", Pri: 15,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			SwapLayerPose: {Front: "ForeGloveLeft", Crossed: "CrossGloveLeft"},
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
	])
});


AddModel({
	Name: "GauntletRight",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GauntletRight", Layer: "GloveRight", Pri: 15,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Up"]),
			SwapLayerPose: {Front: "ForeGloveRight", Crossed: "CrossGloveRight"},
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
	])
});

AddModel({
	Name: "Gauntlets",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("GauntletRight"),
		...GetModelLayers("GauntletLeft"),
	])
});

AddModel({
	Name: "PlateArmor",
	Folder: "ArmorPlate",
	TopLevel: true,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		...GetModelLayers("Breastplate"),
		...GetModelLayers("Pauldrons"),
		...GetModelLayers("PlateBoots"),
		...GetModelLayers("Gauntlets"),
	])
});

AddModel({
	Name: "ChainShirt",
	Folder: "ArmorChain",
	Parent: "ChainArmor",
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "Shirt", Layer: "CorsetLiner", Pri: 5,
			SwapLayerPose: {Kneel: "CorsetLinerLower", KneelClosed: "CorsetLinerLower"},
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Hogtie: "Hogtie"},
			Invariant: true,
		},
		{ Name: "ShirtChest", Layer: "ShirtChest", Pri: 5,
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Hogtie: "Hogtie"},
			InheritColor: "Shirt",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "ChainSkirt",
	Folder: "ArmorChain",
	Parent: "ChainArmor",
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "OverSkirt", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Hogtie: "Hogtie", Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
	])
});


AddModel({
	Name: "ChainArmor",
	Folder: "ArmorChain",
	TopLevel: true,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		...GetModelLayers("ChainShirt"),
		...GetModelLayers("ChainSkirt"),
	])
});

AddModel({
	Name: "BanditShorts",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Pants"],
	AddPose: ["Pants"],
	Layers: ToLayerMap([
		{ Name: "Shorts", Layer: "Pants", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
		{ Name: "ShortsLeft", Layer: "PantLeft", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});


AddModel({
	Name: "BanditPouch",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Pouch", Layer: "PantsAccRight", Pri: 14,
			Poses: ToMap([...LEGPOSES]),
		},
	])
});

AddModel({
	Name: "BanditKnee",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Knee", Layer: "KneeAccLeft", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "BanditChoker",
	Folder: "Bandit",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Choker", Layer: "Collar", Pri: 3,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "BanditLeftWrist",
	Folder: "Bandit",
	Parent: "BanditWrist",
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "WristLeft", Layer: "WristLeft", Pri: 7,
			Poses: ToMapSubtract([...ARMPOSES], [...WRISTHIDELEFT]),
		},
	])
});

AddModel({
	Name: "BanditRightWrist",
	Folder: "Bandit",
	Parent: "BanditWrist",
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "WristRight", Layer: "WristRight", Pri: 7,
			Poses: ToMapSubtract([...ARMPOSES], [...WRISTHIDERIGHT]),
		},
	])
});

AddModel({
	Name: "BanditWrist",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("BanditLeftWrist"),
		...GetModelLayers("BanditRightWrist"),
	])
});



AddModel({
	Name: "BanditBoots",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			NoDisplace: true,
			HideWhenOverridden: true,
			DisplacementSprite: "BootsShort",
			DisplaceAmount: 30,
			DisplaceLayers: ToMap(["Boots"]),
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			NoDisplace: true,
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "ShoeRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			NoDisplace: true,
			InheritColor: "ShoeRight",
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			NoDisplace: true,
			InheritColor: "ShoeLeft",
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "BanditBreastplate",
	Folder: "Bandit",
	Parent: "Bandit",
	Categories: ["Armor"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "Breastplate", Layer: "Chestplate", Pri: 24,
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Hogtie"},
			Invariant: true,
		},
	])
});

AddModel({
	Name: "Bandit",
	Folder: "Bandit",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("BanditShorts"),
		...GetModelLayers("BanditBreastplate"),
		...GetModelLayers("BanditWrist"),
		...GetModelLayers("BanditShoes"),
		...GetModelLayers("BanditPouch"),
		...GetModelLayers("BanditKnee"),
		...GetModelLayers("BanditChoker"),
	])
});



AddModel({
	Name: "MaidSkirt",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Skirts"],
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 14,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			SwapLayerPose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "Stripe", Layer: "Skirt", Pri: 14.1,
			TieToLayer: "Skirt",
			NoOverride: true,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			SwapLayerPose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 7,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
		{ Name: "StripeOver", Layer: "Skirt", Pri: 7.1,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Stripe",
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
	])
});

AddModel({
	Name: "MaidApron",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Apron", Layer: "BeltDeco", Pri: 30,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
	])
});
AddModel({
	Name: "MaidBlouse",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	RemovePoses: ["EncaseTorsoUpper"],
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "Blouse", Layer: "CorsetLiner", Pri: 3,
			SwapLayerPose: {Kneel: "CorsetLinerLower", KneelClosed: "CorsetLinerLower"},
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "BlouseBust", Layer: "ShirtChest", Pri: 3,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			InheritColor: "Blouse",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
		},
	])
});
AddModel({
	Name: "MaidBow",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Bow", Layer: "CollarAcc", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
		},
	])
});
AddModel({
	Name: "MaidCorset",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "Corset", Layer: "Bustier", Pri: 1,
			SwapLayerPose: {Pants: "CorsetUnder"},
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
	])
});
AddModel({
	Name: "MaidCorsetFull",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidCorset"),
		{ Name: "CorsetStraps", Layer: "Straps", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Boxtie: "Boxtie", Wristtie: "Boxtie"},
			Invariant: true,
		},
	])
});



AddModel({
	Name: "StockingLeft",
	Folder: "Maid",
	Parent: "Stockings",
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: 1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
		{ Name: "StripeSockRight", Layer: "StockingRight", Pri: 1.1,
			NoOverride: true, TieToLayer: "SockRight",
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
	])
});
AddModel({
	Name: "StockingRight",
	Folder: "Maid",
	Parent: "Stockings",
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: 1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: 1,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
		{ Name: "StripeSockRight", Layer: "StockingRight", Pri: 1.1,
			NoOverride: true, TieToLayer: "SockRight",
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
	])
});



AddModel({
	Name: "MaidSockLeft",
	Folder: "Maid",
	Parent: "MaidSocks",
	Layers: ToLayerMap([
		...GetModelLayers("StockingLeft"),
		{ Name: "StripeSockLeft", Layer: "StockingLeft", Pri: 1.1,
			NoOverride: true, TieToLayer: "SockLeft",
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
	])
});
AddModel({
	Name: "MaidSockRight",
	Folder: "Maid",
	Parent: "MaidSocks",
	Layers: ToLayerMap([

		...GetModelLayers("StockingRight"),
		{ Name: "StripeSockRight", Layer: "StockingRight", Pri: 1.1,
			NoOverride: true, TieToLayer: "SockRight",
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
	])
});

AddModel({
	Name: "MaidShoes",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "ShoeRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "Stockings",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("StockingRight"),
		...GetModelLayers("StockingLeft"),
	])
});

AddModel({
	Name: "MaidSocks",
	Folder: "Maid",
	Parent: "Maid",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidSockRight"),
		...GetModelLayers("MaidSockLeft"),
	])
});

AddModel({
	Name: "Maid",
	Folder: "Maid",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidSkirt"),
		...GetModelLayers("MaidBlouse"),
		...GetModelLayers("MaidCorsetFull"),
		...GetModelLayers("MaidSocks"),
		...GetModelLayers("MaidShoes"),
		...GetModelLayers("MaidBow"),
	])
});



AddModel({
	Name: "WitchBlouse",
	Folder: "Witch",
	Parent: "Witch",
	TopLevel: true,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "BlouseLeft", Layer: "SleeveLeft", Pri: 4,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			//AppendPose: ToMapDupe(["RopesUpper"], {TorsoUpperTight: "Tight"}),
		},
		{ Name: "BlouseRight", Layer: "SleeveRight", Pri: 4,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			//AppendPose: ToMapDupe(["RopesUpper"], {TorsoUpperTight: "Tight"}),
		},
		{ Name: "BlouseLiner", Layer: "CorsetLiner", Pri: 4,
			SwapLayerPose: {Kneel: "CorsetLinerLower", KneelClosed: "CorsetLinerLower"},
			Invariant: true,
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
		},
		{ Name: "BlouseBust", Layer: "ShirtChest", Pri: 4,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			InheritColor: "Blouse",
			MorphPoses: {Up: "Up"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "WitchCorset",
	Folder: "Witch",
	Parent: "Witch",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "Corset", Layer: "Bustier", Pri: 1,
			SwapLayerPose: {Pants: "CorsetUnder"},
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
	])
});

AddModel({
	Name: "WitchHat",
	Folder: "Witch",
	Parent: "Witch",
	TopLevel: true,
	Categories: ["Hats"],
	Layers: ToLayerMap([
		{ Name: "WitchHat", Layer: "Hat", Pri: 70,
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "WitchHatBack", Layer: "HatBack", Pri: 70,
			HideWhenOverridden: true,
			Invariant: true,
		},
	])
});
AddModel({
	Name: "ApprenticeHat",
	Folder: "Witch",
	Parent: "Witch",
	TopLevel: true,
	Categories: ["Hats"],
	Layers: ToLayerMap([
		{ Name: "ApprenticeHat", Layer: "Hat", Pri: 40,
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "ApprenticeHatPuff", Layer: "Hat", Pri: 40.1,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "WitchShoes",
	Folder: "Witch",
	Parent: "Witch",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "ShoeRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "WitchSkirt",
	Folder: "Witch",
	Parent: "Witch",
	TopLevel: true,
	Categories: ["Skirts"],
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 14,
			SwapLayerPose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Closed", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 14,
			Poses: ToMap([...KNEELPOSES]),
			TieToLayer: "Skirt",
			NoOverride: true,
			AppendPose: ToMapDupe(["CrotchStrap"]),
			InheritColor: "Skirt",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
		{ Name: "SkirtRuffleOver", Layer: "Skirt", Pri: 14.1,
			Poses: ToMap([...KNEELPOSES]),
			TieToLayer: "Skirt",
			NoOverride: true,
			AppendPose: ToMapDupe(["CrotchStrap"]),
			InheritColor: "Ruffle",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
		{ Name: "SkirtBelt", Layer: "Skirt", Pri: 14.1,
			SwapLayerPose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Belt",
			MorphPoses: {Hogtie: "Closed", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtRuffle", Layer: "Skirt", Pri: 14.1,
			SwapLayerPose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Ruffle",
			MorphPoses: {Hogtie: "Closed", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "Witch",
	Folder: "Witch",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("WitchSkirt"),
		...GetModelLayers("WitchCorset"),
		...GetModelLayers("WitchBlouse"),
		...GetModelLayers("WitchHat"),
		...GetModelLayers("WitchShoes"),
	])
});




AddModel({
	Name: "WarriorBoots",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			AppendPose: ToMapDupe(["RopesAnkle"]),
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			AppendPose: ToMapDupe(["RopesAnkle"]),
		},
		{ Name: "ShoeRightKneel", Layer: "ShoeRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "SportsBra",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "Bra", Layer: "BraChest", Pri: 5.5,
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Yoked: "Yoked"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "WarriorBustier",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "Bustier", Layer: "Bustier", Pri: 15,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "BustierChest", Layer: "ShirtChest", Pri: 15,
			Invariant: true,
			InheritColor: "Bustier",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "WarriorBelt",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "Belt", Pri: 15,
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper", "TorsoLower"],
			HideWhenOverridden: true,
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
	])
});

AddModel({
	Name: "DragonNecklace",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Necklace", Layer: "Necklace", Pri: 5,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Necklace", Layer: "NecklaceCharm", Pri: 5,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});
AddModel({
	Name: "DragonArmband",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Armband", Layer: "Sleeves", Pri: 3,
			Poses: ToMap(["Yoked", "Wristtie", "Free", "Boxtie", "Front", "Crossed"]),
			MorphPoses: {Yoked: "Yoked", Boxtie: "Boxtie", Free: "Free", Wristtie: "Wristtie", Front: "Boxtie"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
			Invariant: true,
		},
	])
});
AddModel({
	Name: "DragonCollar",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 5,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "WarriorSkirt",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Skirts"],
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 7,
			SwapLayerPose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 7,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			InheritColor: "Skirt",
			//Invariant: true,
		},
	])
});

AddModel({
	Name: "Dragonheart",
	Folder: "Warrior",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("WarriorSkirt"),
		...GetModelLayers("WarriorBustier"),
		...GetModelLayers("WarriorBelt"),
		...GetModelLayers("SportsBra"),
		...GetModelLayers("WarriorBoots"),
		...GetModelLayers("DragonCollar"),
		...GetModelLayers("DragonNecklace"),
		...GetModelLayers("DragonArmband"),
	])
});


AddModel({
	Name: "Dragonheart",
	Folder: "Warrior",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("WarriorSkirt"),
		...GetModelLayers("WarriorBustier"),
		...GetModelLayers("WarriorBelt"),
		...GetModelLayers("SportsBra"),
		...GetModelLayers("WarriorBoots"),
		...GetModelLayers("DragonCollar"),
		...GetModelLayers("DragonNecklace"),
		...GetModelLayers("DragonArmband"),
	])
});




AddModel({
	Name: "ZombieHat",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Hats"],
	Layers: ToLayerMap([
		{ Name: "ZombieHat", Layer: "Hat", Pri: 40,
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "ZombieHatBand", Layer: "Hat", Pri: 41,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
		},
	])
});


AddModel({
	Name: "ZombieChestTalisman",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "ZombieChestTalisman", Layer: "ChestDeco", Pri: 70,
			NoOverride: true,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
		},
	])
});


AddModel({
	Name: "ZombieTalisman",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "ZombieTalisman", Layer: "HatDeco", Pri: 90,
			NoOverride: true,
			Invariant: true,
		},
	])
});
AddModel({
	Name: "ZombieTalismanBent",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "ZombieTalismanBent", Layer: "HeadbandDeco", Pri: 90,
			NoOverride: true,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "Sandals",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "ShoeRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "RobeBra",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "Bra", Layer: "Bra", Pri: 50,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Chest", Layer: "BraChest", Pri: 50,
			Invariant: true,
			InheritColor: "Bra",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "RobeSleeveLeft",
	Folder: "Robes",
	Parent: "RobeSleeves",
	Categories: ["Sleeves"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
			//AppendPose: ToMapDupe(["RopesUpper"], {ArmLeftTight: "Tight"}),
		},
	])
});
AddModel({
	Name: "RobeSleeveRight",
	Folder: "Robes",
	Parent: "RobeSleeves",
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "SleeveRight", Layer: "SleeveRight", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
			//AppendPose: ToMapDupe(["RopesUpper"], {ArmRightTight: "Tight"}),
		},
	])
});


AddModel({
	Name: "RobeSleeves",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("RobeSleeveLeft"),
		...GetModelLayers("RobeSleeveRight"),
	])
});



AddModel({
	Name: "RobeSleeveDecoLeft",
	Folder: "Robes",
	Parent: "RobeSleevesDeco",
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "SleeveDecoLeft", Layer: "SleeveDecoLeft", Pri: 40,
			Poses: ToMap(["Free", "Yoked", "Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
			HideWhenOverridden: true,
		},
	])
});
AddModel({
	Name: "RobeSleeveDecoRight",
	Folder: "Robes",
	Parent: "RobeSleevesDeco",
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "SleeveDecoRight", Layer: "SleeveDecoRight", Pri: 40,
			Poses: ToMap(["Free", "Yoked", "Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			GlobalDefaultOverride: ToMap(["Front"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "RobeSleevesDeco",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("RobeSleeveDecoLeft"),
		...GetModelLayers("RobeSleeveDecoRight"),
	])
});

AddModel({
	Name: "Ribbon",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "RibbonBelt", Layer: "BeltUnder", Pri: 30,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "RibbonBack", Layer: "BeltBack", Pri: 30,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
		},
		{ Name: "RibbonFarBack", Layer: "BeltFarBack", Pri: 30,
			Sprite: "RibbonBack",
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie"]),
			Invariant: true,
			InheritColor: "RibbonBack",
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
		},
	])
});


AddModel({
	Name: "RobeSkirt",
	Folder: "Robes",
	Parent: "Robes",
	TopLevel: true,
	Categories: ["Skirts"],
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 7,
			SwapLayerPose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Closed: "Closed", Hogtie: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 7,
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
	Name: "Robes",
	Folder: "Robes",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("Sandals"),
		...GetModelLayers("RobeSleeves"),
		...GetModelLayers("RobeSleevesDeco"),
		...GetModelLayers("RobeSkirt"),
		...GetModelLayers("RobeBra"),
		...GetModelLayers("Ribbon"),
	])
});

