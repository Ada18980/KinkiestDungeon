"use strict";

/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "Body",
	Folder: "Body",
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 100,
		},
		{ Name: "Head", Layer: "Head", Pri: 0,
		},
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 0,
			Poses: ToMap(ARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 0,
			Poses: ToMap(ARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeArmRight", Layer: "ForeArmRight", Pri: 0,
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "ForeArmLeft", Layer: "ForeArmLeft", Pri: 0,
			Poses: ToMap(FOREARMPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandRight", Layer: "HandRight", Pri: 0,
			Poses: ToMap(HANDRIGHTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "HandLeft", Layer: "HandLeft", Pri: 0,
			Poses: ToMap(HANDLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Front"]),
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 0,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "Torso", Layer: "Torso", Pri: 0,
		},
		{ Name: "Chest", Layer: "Chest", Pri: 0,
		},
		{ Name: "FootRight", Layer: "FootRight", Pri: 0,
			Poses: ToMap(FOOTRIGHTPOSES),
		},
		{ Name: "FootRightKneel", Sprite: "FootRight", Layer: "FootRightKneel", Pri: 0,
			Poses: ToMap(["Kneel"]),
		},
		{ Name: "FootLeft", Layer: "FootLeft", Pri: 0,
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 0,
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 0,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "Butt", Layer: "Butt", Pri: 0,
			Poses: ToMap(KNEELPOSES),
		},
	])
});
AddModel({
	Name: "Catsuit",
	Folder: "Catsuit",
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "ArmRight", Pri: 1,
			Poses: ToMap(ARMPOSES, "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			AppendPose: ToMap(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "ArmLeft", Layer: "ArmLeft", Pri: 1,
			Poses: ToMap(ARMPOSES, "Hogtie"),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			AppendPose: ToMap(["Hogtie"]),
			AppendPoseRequire: ToMap(["Wristtie"]),
		},
		{ Name: "HandRight", Layer: "HandRight", Pri: 1,
			Poses: ToMap(HANDRIGHTPOSES),
		},
		{ Name: "HandLeft", Layer: "HandLeft", Pri: 1,
			Poses: ToMap(HANDLEFTPOSES),
		},
		{ Name: "LegLeft", Layer: "LegLeft", Pri: 1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "TorsoLower", Layer: "TorsoLower", Pri: 1,
		},
		{ Name: "TorsoUpper", Layer: "TorsoUpper", Pri: 1,
		},
		{ Name: "Chest", Layer: "Chest", Pri: 1,
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootRight", Layer: "FootRight", Pri: 1,
			Poses: ToMap(FOOTRIGHTPOSES),
		},
		{ Name: "FootRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			MorphPoses: {Kneel: ""},
		},
		{ Name: "FootLeft", Layer: "FootLeft", Pri: 0,
			Poses: ToMap(FOOTLEFTPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			MorphPoses: {Hogtie: ""},
		},
		{ Name: "LegRight", Layer: "LegRight", Pri: 1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "Butt", Layer: "Butt", Pri: 1,
			Poses: ToMap(KNEELPOSES),
		},
	])
});

AddModel({
	Name: "Labcoat",
	Folder: "Labcoat",
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
	Name: "ChainShirt",
	Folder: "ArmorChain",
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
	Name: "HeavyArmor",
	Folder: "ArmorPlate",
	Layers: ToLayerMap([
		...GetModelLayers("Breastplate"),
		...GetModelLayers("Pauldrons"),
	])
});

AddModel({
	Name: "BanditShorts",
	Folder: "Bandit",
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
	Layers: ToLayerMap([
		...GetModelLayers("BanditShorts"),
		...GetModelLayers("BanditBreastplate"),
	])
});



AddModel({
	Name: "MaidSkirt",
	Folder: "Maid",
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
	Layers: ToLayerMap([
		{ Name: "Apron", Layer: "SkirtDeco", Pri: 30,
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
	Layers: ToLayerMap([
		{ Name: "Blouse", Layer: "CorsetLining", Pri: 3,
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
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: 1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootSockLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
		},
	])
});
AddModel({
	Name: "MaidSockRight",
	Folder: "Maid",
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: 1,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
		{ Name: "FootSockRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
		},
	])
});

AddModel({
	Name: "MaidShoes",
	Folder: "Maid",
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 1,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel"]),
		},
		{ Name: "ShoeRightKneel", Layer: "FootRightKneel", Pri: 1,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "FootLeftHogtie", Pri: 1,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
		},
	])
});

AddModel({
	Name: "MaidSocks",
	Folder: "Maid",
	Layers: ToLayerMap([
		...GetModelLayers("MaidSockRight"),
		...GetModelLayers("MaidSockLeft"),
	])
});

AddModel({
	Name: "Maid",
	Folder: "Maid",
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
	Name: "RopeArms",
	Folder: "Rope",
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
