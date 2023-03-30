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
	])
});

AddModel({
	Name: "KoiBrows",
	Folder: "FaceKoi",
	TopLevel: true,
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
		},
	])
});
AddModel({
	Name: "KoiBlush",
	Folder: "FaceKoi",
	TopLevel: true,
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
	Group: "Hair",
	Categories: ["Hairstyles"],
	Layers: ToLayerMap([
		{ Name: "Braid", Layer: "Hair", Pri: 0,
		},
		{ Name: "BraidBack", Layer: "HairBack", Pri: 0,
		},
	])
});
AddModel({
	Name: "Ahoge",
	Folder: "Hair",
	TopLevel: true,
	Group: "Hair",
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
	TopLevel: true,
	Categories: ["Body"],
	Folder: "Body",
	Layers: ToLayerMap([
		{ Name: "Head", Layer: "Head", Pri: 0,
		},
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(ARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(ARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
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
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "Torso", Layer: "Torso", Pri: 0,
		},
		{ Name: "Chest", Layer: "Chest", Pri: 0,
			InheritColor: "Torso",
		},
		{ Name: "FootRight", Layer: "FootRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(FOOTRIGHTPOSES),
		},
		{ Name: "FootRightKneel", Sprite: "FootRight", Layer: "FootRightKneel", Pri: 0,
			InheritColor: "Torso",
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
		},
		{ Name: "FootLeft", Layer: "FootLeft", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 0,
			InheritColor: "Torso",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
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
			Poses: ToMap(ARMPOSES, "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front"]),
			AppendPose: ToMap(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 1,
			InheritColor: "TorsoUpper",
			Poses: ToMap(ARMPOSES, "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie", "Front"]),
			AppendPose: ToMap(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
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
			GlobalDefaultOverride: ToMap(["Hogtie"]),
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
		{ Name: "FootLeft", Layer: "FootLeft", Pri: 0,
			InheritColor: "TorsoLower",
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 1,
			InheritColor: "TorsoLower",
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
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
	Categories: ["Clothes"],
	Layers: ToLayerMap([
		// Duplicate yoked is to override Closed override
		{ Name: "Shoulders", Layer: "Shoulders", Pri: 10,
			Poses: ToMap(["Yoked", "Spread", "Closed", "Kneel"]),
			MorphPoses: {Yoked: "Yoked", Closed: "Spread"},
		},
		{ Name: "ShouldersHogtie", Layer: "Shoulders", Pri: 10,
			Poses: ToMapSubtract([...ARMPOSES, "Hogtie"], ["Wristtie", "Yoked"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			HidePoses: ToMap(["Spread", "Closed", "Yoked"]),
			MorphPoses: {Boxtie: "Free", Free: "Free", Hogtie: ""},
		},
		{ Name: "Coat", Layer: "Coat", Pri: 0,
			Poses: ToMap(["Kneel", "Yoked", "Spread", "Closed"]),
			HidePoses: ToMap(["Hogtie"]),
			MorphPoses: {Closed: "Spread"},
		},
		// This one is weird, its just a special case
		{ Name: "CoatHogtieFree", Layer: "Cape", Pri: 0,
			Poses: ToMap(["Hogtie"]),
			HidePoses: ToMap(["Wristtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "Cape", Layer: "Cape", Pri: 0,
			Poses: ToMap(["Hogtie", "Kneel", "Yoked", "Spread", "Closed"]),
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
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Yoked: "Yoked", Hogtie: "Hogtie", Wristtie: "Free", Boxtie: "Free"},
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
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "BootLeft", Layer: "ShoeLeft", Pri: 25,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			HideWhenOverridden: true,
		},
		{ Name: "BootRight", Layer: "ShoeRight", Pri: 25,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel"]),
			HideWhenOverridden: true,
		},
		{ Name: "BootRightKneel", Layer: "FootRightKneel", Pri: 25,
			Poses: ToMap(["Kneel"]),
			HidePoses: ToMap(["FeetLinked"]),
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "BootLeftHogtie", Layer: "FootLeftHogtie", Pri: 25,
			Poses: ToMap(["Hogtie"]),
			HideWhenOverridden: true,
			Invariant: true,
		},
	])
});


AddModel({
	Name: "Gauntlets",
	Folder: "ArmorPlate",
	Parent: "PlateArmor",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GauntletLeft", Layer: "GloveLeft", Pri: 15,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie"]),
			HideWhenOverridden: true,
		},
		{ Name: "GauntletRight", Layer: "GloveRight", Pri: 15,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			HideWhenOverridden: true,
		},
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
		{ Name: "ShirtChest", Layer: "Chest", Pri: 5,
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Hogtie: "Hogtie"},
			Invariant: true,
		},
		{ Name: "Shirt", Layer: "CorsetLiner", Pri: 5,
			Poses: ToMap([...ARMPOSES, "Hogtie"]),
			MorphPoses: {Hogtie: "Hogtie"},
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
		{ Name: "Skirt", Layer: "Greaves", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Hogtie: "Hogtie", Kneel: "Kneel"},
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
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		{ Name: "Shorts", Layer: "Pants", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			//MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});

AddModel({
	Name: "BanditBreastplate",
	Folder: "Bandit",
	Parent: "Bandit",
	Categories: ["Uniforms"],
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
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel"},
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
			MorphPoses: {Kneel: "Kneel"},
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
		{ Name: "Corset", Layer: "Corset", Pri: 1,
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
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootSockLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
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
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootSockRightKneel", Layer: "FootRightKneel", Pri: 1,
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
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
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
		},
		{ Name: "BlouseLiner", Layer: "CorsetLiner", Pri: 4,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "BlouseBust", Layer: "Chest", Pri: 4,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
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
		{ Name: "Corset", Layer: "Corset", Pri: 1,
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
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
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
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel"},
			Invariant: true,
		},
		{ Name: "SkirtBelt", Layer: "Skirt", Pri: 14.1,
			Poses: ToMap([...LEGPOSES]),
			TieToLayer: "Skirt", NoOverride: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel"},
			Invariant: true,
		},
		{ Name: "SkirtRuffle", Layer: "Skirt", Pri: 14.1,
			Poses: ToMap([...LEGPOSES]),
			TieToLayer: "Skirt", NoOverride: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed", Kneel: "Kneel"},
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
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
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
		{ Name: "BustierChest", Layer: "Chest", Pri: 15,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Bustier", Layer: "Bustier", Pri: 15,
			Invariant: true,
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
		{ Name: "Skirt", Layer: "Skirt", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel"},
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
			MorphPoses: {Kneel: "Kneel"},
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
		{ Name: "ZombieTalisman", Layer: "Circlet", Pri: 90,
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
		{ Name: "ZombieTalismanBent", Layer: "Circlet", Pri: 90,
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
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel"]),
			HideWhenOverridden: true,
		},
		{ Name: "ShoeRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
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
		{ Name: "Bra", Layer: "Chest", Pri: 50,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "RobeSleeveLeft",
	Folder: "Robes",
	Parent: "RobeSleeves",
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front"]),
			HideWhenOverridden: true,
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
			MorphPoses: {Kneel: "Kneel", Hogtie: "Hogtie"},
		},
		{ Name: "RibbonFarBack", Layer: "BeltFarBack", Pri: 30,
			Sprite: "RibbonBack",
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie"]),
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Hogtie"},
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
			MorphPoses: {Kneel: "Kneel"},
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
	Name: "RopeArms",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Categories: ["Restraints"],
	Layers: ToLayerMap([
		{ Name: "ChestUpper", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
		{ Name: "ShoulderStraps", Layer: "ChestStraps", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
		{ Name: "ChestLower", Layer: "Underbust", Pri: 0,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
		{ Name: "Arms", Layer: "Underarms", Pri: 0,
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
	])
});
