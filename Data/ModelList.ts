/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */
AddModel({
	Name: "KoiEyes",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	Group: "Eyes",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(EYE2POSES),
		},
	])
});

AddModel({
	Name: "KoiBrows",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Brows", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(BROWPOSES),
		},
		{ Name: "Brows2", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(BROW2POSES),
		},
	])
});

AddModel({
	Name: "KoiMouth",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	Group: "Mouth",
	Categories: ["Mouth","Face"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "Mouth", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(MOUTHPOSES),
			HidePoses: ToMap(["HideMouth"]),
		},
	])
});
AddModel({
	Name: "KoiBlush",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	Group: "Blush",
	Categories: ["Face"],
	Layers: ToLayerMap([
		{ Name: "Blush", Layer: "Blush", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Poses: ToMap(BLUSHPOSES),
		},
	])
});


AddModel({
	Name: "Braid",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles"],
	Layers: ToLayerMap([
		{ Name: "Braid", Layer: "Hair", Pri: 0,
		},
		{ Name: "Braid_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "Braid",
		},
		{ Name: "BraidBack", Layer: "HairBack", Pri: 0,
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
	Layers: ToLayerMap([
		{ Name: "Curly", Layer: "Hair", Pri: 0,
		},
		{ Name: "Curly_Overstrap", Layer: "HairFront", Pri: 0, InheritColor: "Curly",
		},
	])
});
AddModel({
	Name: "FrontStraight",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	Layers: ToLayerMap([
		{ Name: "FrontStraight", Layer: "Hair", Pri: 0,
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
	Layers: ToLayerMap([
		{ Name: "Straight", Layer: "Hair", Pri: 0,
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
	Layers: ToLayerMap([
		{ Name: "StraightBangs", Layer: "Hair", Pri: 0,
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
	Name: "TwintailLeft",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "TwintailLeft", Layer: "HairFront", Pri: 0,
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
		{ Name: "Ahoge", Layer: "Hair", Pri: 0,
			HideWhenOverridden: true,
			HideOverrideLayer: "Hat",
		},
	])
});

AddModel({
	Name: "Body",
	Group: "Body",
	TopLevel: true,
	Protected: true,
	Categories: ["Body"],
	Folder: "Body",
	Layers: ToLayerMap([
		{ Name: "Head", Layer: "Head", Pri: 0,
		},
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ShoulderRight", Layer: "ShoulderRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap([...SHOULDERPOSES]),
		},
		{ Name: "ShoulderLeft", Layer: "ShoulderLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap([...SHOULDERPOSES]),
		},
		{ Name: "ForeArmRight", Layer: "ForeArmRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeArmLeft", Layer: "ForeArmLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandRight", Layer: "HandRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(HANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandLeft", Layer: "HandLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(HANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeHandRight", Layer: "ForeHandRight", Pri: 0,
			Sprite: "HandRight",
			InheritColor: "Torso",
			Poses: ToMap(FOREHANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeHandLeft", Layer: "ForeHandLeft", Pri: 0,
			Sprite: "HandLeft",
			InheritColor: "Torso",
			Poses: ToMap(FOREHANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "Torso", Layer: "Torso", Pri: 0,
		},
		{ Name: "Chest", Layer: "Chest", Pri: 0,
			InheritColor: "Torso",
		},
		/*{ Name: "FootRight", Layer: "FootRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(FOOTRIGHTPOSES),
		},*/
		{ Name: "FootRightKneel", Sprite: "FootRight", Layer: "FootRightKneel", Pri: 0,
			InheritColor: "Torso",
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
		},
		/*{ Name: "FootLeft", Layer: "FootLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},*/
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "Butt", Layer: "Butt", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(KNEELPOSES),
		},
	])
});
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
			GlobalDefaultOverride: ToMap(["Hogtie", "Front"]),
			AppendPose: ToMap(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMapSubtract(ARMPOSES, [...HIDEARMPOSES], "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front"]),
			AppendPose: ToMap(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ShoulderRight", Layer: "ShoulderRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap([...SHOULDERPOSES]),
		},
		{ Name: "ShoulderLeft", Layer: "ShoulderLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap([...SHOULDERPOSES]),
		},

		{ Name: "ForeArmRight", Layer: "ForeArmRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeArmLeft", Layer: "ForeArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandRight", Layer: "HandRight", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(HANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandLeft", Layer: "HandLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(HANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeHandRight", Layer: "ForeHandRight", Pri: 1,
			Sprite: "HandRight",
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREHANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeHandLeft", Layer: "ForeHandLeft", Pri: 1,
			Sprite: "HandLeft",
			InheritColor: "TorsoUpper",
			Poses: ToMap(FOREHANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "TorsoLower", Layer: "TorsoLower", Pri: 1,
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
	Categories: ["Tops"],
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
		},
		{ Name: "BootRight", Layer: "ShoeRight", Pri: 25,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
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
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front"]),
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
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front"]),
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
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Hogtie: "Hogtie"},
			Invariant: true,
		},
		{ Name: "ShirtChest", Layer: "Chest", Pri: 5,
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Hogtie: "Hogtie"},
			InheritColor: "Shirt",
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
	Layers: ToLayerMap([
		{ Name: "Shorts", Layer: "Pants", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
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
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMap(["CrotchStrap"]),
			Invariant: true,
		},
		{ Name: "SkirtKneel_LeftLegCrotchStrap", Layer: "SkirtPoofyLeftLeg", Pri: 7,
			Poses: ToMap([...KNEELPOSES]),
			RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			Invariant: true,
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
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "Blouse", Layer: "CorsetLiner", Pri: 3,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "BlouseBust", Layer: "Chest", Pri: 3,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			InheritColor: "Blouse",
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
		{ Name: "Corset", Layer: "CorsetOver", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
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
	Name: "MaidSockLeft",
	Folder: "Maid",
	Parent: "MaidSocks",
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
	])
});
AddModel({
	Name: "MaidSockRight",
	Folder: "Maid",
	Parent: "MaidSocks",
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
	Layers: ToLayerMap([
		{ Name: "Blouse", Layer: "Shirt", Pri: 4,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			AppendPose: ToMap(["RopesUpper"]),
		},
		{ Name: "BlouseLiner", Layer: "CorsetLiner", Pri: 4,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "BlouseBust", Layer: "Chest", Pri: 4,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			InheritColor: "Blouse",
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
		{ Name: "Corset", Layer: "CorsetOver", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			Invariant: true,
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
		{ Name: "Skirt", Layer: "SkirtPoofy", Pri: 14,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMap(["CrotchStrap"]),
			Invariant: true,
		},
		{ Name: "SkirtKneel_LeftLeg", Layer: "SkirtPoofyLeftLeg", Pri: 14,
			Poses: ToMap([...KNEELPOSES]),
			HideWhenOverridden: true,
			AppendPose: ToMap(["CrotchStrap"]),
			InheritColor: "Skirt",
			Invariant: true,
		},
		{ Name: "SkirtKneelRuffle_LeftLeg", Layer: "SkirtPoofyLeftLeg", Pri: 14.1,
			Poses: ToMap([...KNEELPOSES]),
			TieToLayer: "SkirtKneel_LeftLeg", NoOverride: true,
			AppendPose: ToMap(["CrotchStrap"]),
			InheritColor: "Skirt",
			Invariant: true,
		},
		{ Name: "SkirtBelt", Layer: "Skirt", Pri: 14.1,
			Poses: ToMap([...LEGPOSES]),
			TieToLayer: "Skirt", NoOverride: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
		{ Name: "SkirtRuffle", Layer: "SkirtPoofy", Pri: 14.1,
			Poses: ToMap([...LEGPOSES]),
			TieToLayer: "Skirt", NoOverride: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMap(["CrotchStrap"]),
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
	Name: "SportsBra",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "Bra", Layer: "Chest", Pri: 5,
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Yoked: "Yoked"},
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
		{ Name: "BustierChest", Layer: "Chest", Pri: 15,
			Invariant: true,
			InheritColor: "Bustier",
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
			HideWhenOverridden: true,
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
			Poses: ToMap(["Yoked", "Wristtie", "Free", "Boxtie", "Front"]),
			MorphPoses: {Yoked: "Yoked", Boxtie: "Boxtie", Free: "Free", Wristtie: "Wristtie", Front: "Boxtie"},
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
		{ Name: "Skirt", Layer: "SkirtPoofy", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMap(["CrotchStrap"]),
			Invariant: true,
		},
		{ Name: "SkirtKneel_LeftLegCrotchStrap", Layer: "SkirtPoofyLeftLeg", Pri: 7,
			Poses: ToMap([...KNEELPOSES]),
			RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			Invariant: true,
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
		{ Name: "Chest", Layer: "Chest", Pri: 50,
			Invariant: true,
			InheritColor: "Bra",
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
			GlobalDefaultOverride: ToMap(["Front"]),
			HideWhenOverridden: true,
			AppendPose: ToMap(["RopesUpper"]),
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
			GlobalDefaultOverride: ToMap(["Front"]),
			HideWhenOverridden: true,
			AppendPose: ToMap(["RopesUpper"]),
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
			Poses: ToMap(["Free", "Yoked", "Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
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
			Poses: ToMap(["Free", "Yoked", "Front"]),
			GlobalDefaultOverride: ToMap(["Front"]),
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
		{ Name: "RibbonBelt", Layer: "Belt", Pri: 30,
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
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Closed: "Closed", Hogtie: "Closed", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMap(["CrotchStrap"]),
			Invariant: true,
		},
		{ Name: "SkirtKneel_LeftLegCrotchStrap", Layer: "SkirtPoofyLeftLeg", Pri: 7,
			Poses: ToMap([...KNEELPOSES]),
			RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			Invariant: true,
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



AddModel({
	Name: "BunnySockLeft",
	Folder: "Bunny",
	Parent: "BunnySocks",
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: -1,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
	])
});
AddModel({
	Name: "BunnySockRight",
	Folder: "Bunny",
	Parent: "BunnySocks",
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: 1.5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});

AddModel({
	Name: "BunnySocks",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("BunnySockRight"),
		...GetModelLayers("BunnySockLeft"),
	])
});



AddModel({
	Name: "BunnyGloveLeft",
	Folder: "Bunny",
	Parent: "Bunny",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "GloveLeft", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

AddModel({
	Name: "BunnyGloveRight",
	Folder: "Bunny",
	Parent: "Bunny",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "GloveRight", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
	])
});

AddModel({
	Name: "BunnyGloves",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("BunnyGloveLeft"),
		...GetModelLayers("BunnyGloveRight"),
	])
});

AddModel({
	Name: "BunnyLeotard",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "Bodysuit", Pri: -1,
			Poses: ToMap([...LEGPOSES]),
		},
		{ Name: "LeotardChest", Layer: "Chest", Pri: 1.5,
			Invariant: true,
			InheritColor: "Leotard",
		},
	])
});

AddModel({
	Name: "Bunny",
	Folder: "Bunny",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("BunnyLeotard"),
		...GetModelLayers("BunnyGloves"),
		...GetModelLayers("BunnySocks"),
	])
});
