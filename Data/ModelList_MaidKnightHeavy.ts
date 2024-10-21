/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "HeavyMaidKnight_Dress",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Tops", "Dresses", "Skirts"],
	//RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "Dress", Layer: "Shirt", Pri: 1,
			InheritColor: "Dress",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			DisplaceAmount: 125,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "TightUpperSquish",
			DisplacementInvariant: true,
			Invariant: true,
		},
		{ Name: "DressChest", Layer: "ShirtChest", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			InheritColor: "Dress",
			MorphPoses: {Front: "Boxtie", Crossed: "Boxtie"},
		},
		{ Name: "DressSkirt", Layer: "SkirtOver", Pri: 2,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			HidePoses: ToMap(["EncaseTorsoLower"]),
			InheritColor: "Skirt",
		},
		{ Name: "DressSkirtHem", Layer: "SkirtOver", Pri: 1.9,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			InheritColor: "SkirtHem",
			TieToLayer: "DressSkirt",
			NoOverride: true,
		},
		{ Name: "DressSkirtStripe", Layer: "SkirtOver", Pri: 2.1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			InheritColor: "SkirtStripe",
			TieToLayer: "DressSkirt",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_SleeveLeft",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "SleeveLeftStripe", Layer: "SleeveLeft", Pri: 60.1,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveLeftStripe",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,
			TieToLayer: "SleeveLeft",
		},
		{ Name: "ArmLeft", Layer: "TightSleeveLeft", Pri: 50,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "ArmLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "ForeArmLeft", Layer: "ForeSleeveLeft", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "ArmLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveLeft"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},

	])
});

AddModel({
	Name: "HeavyMaidKnight_SleeveRight",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "SleeveRight", Layer: "SleeveRight", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
			EraseSprite: "LightMaidRightArmErase",
			EraseLayers: {MaidArmPoofRight: true},
			EraseAmount: 100,
			EraseZBonus: 8600,
			EraseInvariant: true,
		},
		{ Name: "SleeveRightStripe", Layer: "SleeveRight", Pri: 60.1,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveRightStripe",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			NoOverride: true,
			TieToLayer: "SleeveRight",
		},
		{ Name: "ArmRight", Layer: "TightSleeveRight", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "ArmRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],

		},
		{ Name: "ForeArmRight", Layer: "ForeSleeveRight", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "ArmRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveRight"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "ShoulderRight", Layer: "UpSleeveRight", Pri: 60,
			HideWhenOverridden: true,
			InheritColor: "SleeveRight",
			Poses: ToMap([...SHOULDERPOSES]),
		},
	])
});


AddModel({
	Name: "HeavyMaidKnight_ChestArmor",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "ChestArmor", Layer: "Chestplate", Pri: 35,
			HideWhenOverridden: true,
			Invariant: true,
			NoOverride: true,
			HidePoseConditional: [
				["DynamicArmor", "ChestArmor", "SuppressDynamic"],
			],
		},
	])
});


AddModel({
	Name: "HeavyMaidKnight_GloveLeft",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "GloveLeft", Pri: -3,
			Poses: ToMapSubtract([...ARMPOSES], ["Crossed", "Boxtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Front: "ForeGloveLeft"},
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_GloveRight",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "GloveRight", Pri: -3,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight", Front: "ForeGloveRight"},
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "HeavyMaidKnight_Gloves",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_GloveLeft"),
		...GetModelLayers("HeavyMaidKnight_GloveRight"),
	])
});




AddModel({
	Name: "HeavyMaidKnight_GauntletLeft",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Gauntlets",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GauntletLeft", Layer: "GloveLeft", Pri: 35,
			Poses: ToMapSubtract([...ARMPOSES], ["Boxtie"]),
			SwapLayerPose: {Front: "ForeGloveLeft", Crossed: "CrossGloveLeft"},
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
		},
	])
});


AddModel({
	Name: "HeavyMaidKnight_GauntletRight",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Gauntlets",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GauntletRight", Layer: "GloveRight", Pri: 35,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			SwapLayerPose: {Front: "ForeGloveRight", Crossed: "CrossGloveRight"},
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_Gauntlets",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_GauntletLeft"),
		...GetModelLayers("HeavyMaidKnight_GauntletRight"),
	])
});



AddModel({
	Name: "HeavyMaidKnight_PauldronLeft",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Pauldrons",
	TopLevel: false,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "PauldronLeft", Layer: "Shoulders", Pri: 150,
			Invariant: true,
			MorphPoses: {
				Yoked: "Yoked",
				Up: "Up",
			},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
		{ Name: "PauldronLeftStraps", Layer: "UpperArmStraps", Pri: -30,
			Invariant: true,
			MorphPoses: {
				Yoked: "Yoked",
				Up: "Up",
			},
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
		{ Name: "PauldronLeftHardware", Layer: "Shoulders", Pri: 151,
			Invariant: true,
			TieToLayer: "PauldronLeft",
			NoOverride: true,
			MorphPoses: {
				Yoked: "Yoked",
				Up: "Up",
			},
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_PauldronRight",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Pauldrons",
	TopLevel: false,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "PauldronRight", Layer: "Shoulders", Pri: 150,
			Invariant: true,
			MorphPoses: {
				Yoked: "Yoked",
				Up: "Up",
			},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
		{ Name: "PauldronRightStraps", Layer: "UpperArmStrapsBack", Pri: -30,
			Invariant: true,
			MorphPoses: {
				Yoked: "Yoked",
				Up: "Up",
			},
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
	])
});



AddModel({
	Name: "HeavyMaidKnight_Pauldrons",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_PauldronLeft"),
		...GetModelLayers("HeavyMaidKnight_PauldronRight"),
	])
});


AddModel({
	Name: "HeavyMaidKnight_SideArmor",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "SideArmor", Layer: "BeltArmor", Pri: 35,
			HideWhenOverridden: true,
			Invariant: true,
			NoOverride: true,
			HidePoseConditional: [
				["DynamicArmor", "TorsoArmor", "SuppressDynamic"],
			],
		},
	])
});


AddModel({
	Name: "HeavyMaidKnight_Corset",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "Corset", Layer: "OverCorset", Pri: 20,
			Invariant: true,
			InheritColor: "Corset",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
			NoOverride: true,
			HideWhenOverridden: true,
		},
	])
});

AddModel(GetModelRestraintVersion("HeavyMaidKnight_Corset", true));

AddModel({
	Name: "HeavyMaidKnight_Sleeves",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_SleeveLeft"),
		...GetModelLayers("HeavyMaidKnight_SleeveRight"),
	])
});



AddModel({
	Name: "HeavyMaidKnight_ApronBottom",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Apron",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Apron", Layer: "Apron", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
		},
		{ Name: "ApronBelt", Layer: "Apron", Pri: 14,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronMiniBow", Layer: "Apron", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronCross", Layer: "Apron", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronStripe", Layer: "Apron", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},
		{ Name: "ApronPattern", Layer: "Apron", Pri: 15.1,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Apron",
		},

	])
});

AddModel({
	Name: "HeavyMaidKnight_ApronTop",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Apron",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "ApronChest", Layer: "ChestDeco", Pri: -30,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "ApronChestRuffles", Layer: "ChestDeco", Pri: -29.9,
			InheritColor: "TopRuffles",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			NoOverride: true,
			TieToLayer: "ApronChest",
			MorphPoses: {
				Free: "Free",
				Boxtie: "Boxtie",
				Wristtie: "Boxtie",
				Crossed: "Crossed",
				Front: "Front",
				Yoked: "Yoked",
				Up: "Up",
			},
		},
		{ Name: "ApronChestBelts", Layer: "ChestDeco", Pri: -29.8,
			InheritColor: "TopBelts",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			NoOverride: true,
			TieToLayer: "ApronChest",
			MorphPoses: {
				Up: "Up",
			},
		},


	])
});

AddModel({
	Name: "HeavyMaidKnight_Apron",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_ApronTop"),
		...GetModelLayers("HeavyMaidKnight_ApronBottom"),

	])
});



AddModel({
	Name: "HeavyMaidKnight_WaistBelts",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Waist",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Belts", Layer: "Belt", Pri: 25,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "BeltsHardware", Layer: "Belt", Pri: 25.1,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
			TieToLayer: "Belts",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "HeavyMaidKnight_WaistPouches",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Waist",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Pouches", Layer: "BeltDeco", Pri: 35,
			Poses: ToMap([...LEGPOSES]),
			Invariant: true,
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_Waist",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_WaistPouches"),
		...GetModelLayers("HeavyMaidKnight_WaistBelts"),

	])
});



AddModel({
	Name: "HeavyMaidKnight_Boots",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "BootLeft", Layer: "ShoeLeft", Pri: 131,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],

			DisplacementPosesExclude: ["Hogtie"],
			ErasePosesExclude: ["Hogtie"],

			DisplacementSprite: "Heels2",
			DisplaceAmount: 80,
			DisplaceLayers: ToMap(["Heels"]),
			DisplaceZBonus: 10000,
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread", Closed: "Closed"},
			EraseSprite: "HeelsErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["Heels"]),
		},
		{ Name: "BootRight", Layer: "ShoeRight", Pri: 131,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],

			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "HeelsRightErase2",
			EraseAmount: 100,
			EraseLayers: ToMap(["HeelRight"]),
			EraseZBonus: 100,
		},
		{ Name: "BootRightKneel", Layer: "ShoeRightKneel", Pri: 131,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			HideWhenOverridden: true,
		},
		{ Name: "FootBootLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 131,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			HideWhenOverridden: true,
		},

		{ Name: "BootLegLeft", Layer: "OverShoes", Pri: 131,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
		},
		{ Name: "BootLegRight", Layer: "ShoeRight", Pri:131,
			InheritColor: "Shoe",
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		},
	])
});



AddModel({
	Name: "HeavyMaidKnight_PantyhoseShorts",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Pantyhose",
	Categories: ["Panties"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "Pantyhose", Layer: "OverSocks", Pri: -40,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});

AddModel({
	Name: "HeavyMaidKnight_SockLeft",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Pantyhose",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -40,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),

		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: -40,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
	])
});
AddModel({
	Name: "HeavyMaidKnight_SockRight",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight_Pantyhose",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -40,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),

		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: -40,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});




AddModel({
	Name: "Pantyhose",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	Categories: ["Socks", "Panties"],
	TopLevel: true,
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_PantyhoseShorts"),
		...GetModelLayers("HeavyMaidKnight_SockLeft"),
		...GetModelLayers("HeavyMaidKnight_SockRight"),
	])
});

AddModel({
	Name: "HeavyMaidKnight",
	Folder: "MaidKnightHeavy",
	Parent: "HeavyMaidKnight",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("HeavyMaidKnight_Dress"),
		...GetModelLayers("HeavyMaidKnight_Sleeves"),
		...GetModelLayers("HeavyMaidKnight_ApronBottom"),
		...GetModelLayers("HeavyMaidKnight_ApronTop"),
		...GetModelLayers("HeavyMaidKnight_Pauldrons"),
		...GetModelLayers("HeavyMaidKnight_Gauntlets"),
		...GetModelLayers("HeavyMaidKnight_Waist"),
		...GetModelLayers("HeavyMaidKnight_SideArmor"),
		...GetModelLayers("HeavyMaidKnight_ChestArmor"),
		...GetModelLayers("HeavyMaidKnight_Corset"),
		...GetModelLayers("HeavyMaidKnight_Boots"),
		...GetModelLayers("Pantyhose"),
		...GetModelLayers("HeavyMaidKnightHairband"),
	])
});