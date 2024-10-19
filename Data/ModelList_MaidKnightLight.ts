/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "LightMaidKnight_Dress",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
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
		{ Name: "DressDeco", Layer: "SkirtOver", Pri: 2.1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			NoOverride: true,
			TieToLayer: "DressSkirt",
		},
		{ Name: "DressDecoBack", Layer: "SkirtOver", Pri: 2.1,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			NoOverride: true,
			TieToLayer: "DressSkirt",
		},
	])
});



AddModel({
	Name: "LightMaidKnight_Apron",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "ApronChest", Layer: "ChestDeco", Pri: -30,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			MorphPoses: {
				Boxtie: "Boxtie",
				Wristtie: "Boxtie",
				Crossed: "Crossed",
				Front: "Front",
				Yoked: "Yoked",
				Up: "Up",
			},
		},
		{ Name: "Apron", Layer: "Apron", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			Invariant: true,
		},
		{ Name: "ApronBack", Layer: "BeltBack", Pri: -15,
			Invariant: true,
			InheritColor: "Back",
		},

	])
});
AddModel({
	Name: "LightMaidKnight_Flower",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Flower", Layer: "BeltCharmSide", Pri: 25,
			Invariant: true,
			NoOverride: true,
			HideWhenOverridden: true,
		},
		{ Name: "FlowerLeaves", Layer: "BeltCharmSide", Pri: 24,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Flower",
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
		{ Name: "Apron", Layer: "Apron", Pri: 30,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
	])
});

AddModel({
	Name: "LightMaidKnight_Bra",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Bras"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "DressChest", Layer: "BraChest", Pri: -30,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			//Invariant: true,
		},

	])
});

AddModel({
	Name: "LightMaidKnight_Top",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "DressChest", Layer: "ShirtChest", Pri: 25,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			InheritColor: "Dress",
			MorphPoses: {Front: "Boxtie", Crossed: "Boxtie"},
		},
	])
});


AddModel({
	Name: "LightMaidKnight_SleeveLeft",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "SleeveLeft", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "ForeArmLeft", Layer: "ForeSleeveLeft", Pri: 60,
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
	Name: "LightMaidKnight_SleeveRight",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "SleeveRight", Pri: 60,
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
		{ Name: "ForeArmRight", Layer: "ForeSleeveRight", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "SleeveRight",
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
	Name: "LightMaidKnight_Sleeves",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("LightMaidKnight_SleeveLeft"),
		...GetModelLayers("LightMaidKnight_SleeveRight"),
	])
});



AddModel({
	Name: "LightMaidKnight_SockRight",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: 4,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),

		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: 4,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
	])
});
AddModel({
	Name: "LightMaidKnight_SockLeft",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: 4,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),

		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: 4,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});



AddModel({
	Name: "LightMaidKnight_Socks",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("LightMaidKnight_SockLeft"),
		...GetModelLayers("LightMaidKnight_SockRight"),
	])
});


AddModel({
	Name: "LightMaidKnight_GloveLeft",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "GloveLeft", Pri: -4,
			Poses: ToMapSubtract([...ARMPOSES], ["Crossed", "Boxtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Front: "ForeGloveLeft"},
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "LightMaidKnight_GloveRight",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "GloveRight", Pri: -4,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight", Front: "ForeGloveRight"},
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "LightMaidKnight_Gloves",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("LightMaidKnight_GloveLeft"),
		...GetModelLayers("LightMaidKnight_GloveRight"),
	])
});


AddModel({
	Name: "LightMaidKnight_GuardLeft",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Accessories", "Armor"],
	Layers: ToLayerMap([
		{ Name: "GuardLeft", Layer: "BindWristLeft", Pri: 20,
			Poses: ToMapSubtract([...ARMPOSES], ["Boxtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Front: "BindForeWristLeft"},
			NoOverride: true,
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
			EraseSprite: "GuardLeft",
			ErasePoses: ["Free", "Yoked", "Front"],
			EraseLayers: ToMap(["BindWristLeft"]),
		},
		{ Name: "GuardCuffLeft", Layer: "BindWristLeft", Pri: -20,
			Poses: ToMapSubtract([...ARMPOSES], ["Boxtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Front: "BindForeWristLeft"},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
		},
		{ Name: "GuardCuff2Left", Layer: "BindArmLeft", Pri: -20,
			Poses: ToMapSubtract([...ARMPOSES], ["Boxtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Front: "BindForeArmLeft"},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
		},
	])
});

AddModel({
	Name: "LightMaidKnight_GuardRight",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Accessories", "Armor"],
	Layers: ToLayerMap([
		{ Name: "GuardRight", Layer: "BindWristRight", Pri: 20,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossWristRight", Front: "BindForeWristRight"},
			NoOverride: true,
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
			EraseSprite: "GuardRight",
			ErasePoses: ["Free", "Yoked", "Front"],
			EraseLayers: ToMap(["BindWristRight"]),
		},
		{ Name: "GuardCuffRight", Layer: "BindWristRight", Pri: -20,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossWristRight", Front: "BindForeWristRight"},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
		},
		{ Name: "GuardCuff2Right", Layer: "BindArmRight", Pri: -20,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "BindCrossArmRight", Front: "BindForeArmRight"},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "GlovesArmor", "SuppressDynamic"],
			],
		},
	])
});


AddModel({
	Name: "LightMaidKnight_Guards",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Accessories", "Armor"],
	Layers: ToLayerMap([
		...GetModelLayers("LightMaidKnight_GuardLeft"),
		...GetModelLayers("LightMaidKnight_GuardRight"),
	])
});




AddModel({
	Name: "LightMaidKnight_Boots",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "BootLeft", Layer: "ShoeLeft", Pri: 8,
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
		{ Name: "BootRight", Layer: "ShoeRight", Pri: 8,
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
		{ Name: "BootRightKneel", Layer: "ShoeRightKneel", Pri: 8,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			HideWhenOverridden: true,
		},
		{ Name: "FootBootLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 8,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Feet"],
			HideWhenOverridden: true,
		},
	])
});




AddModel({
	Name: "LightMaidKnight_Pauldron",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	Categories: ["Armor"],
	Layers: ToLayerMap([
		{ Name: "PauldronLeft", Layer: "Shoulders", Pri: 150,
			Invariant: true,
			MorphPoses: {
				Yoked: "Yoked",
				Hogtie: "Hogtie",
				Wristtie: "Wristtie",
				Boxtie: "Boxtie",
				Front: "Front",
				Crossed: "Crossed"
			},
			HideWhenOverridden: true,
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
		{ Name: "PauldronStrap", Layer: "UpperArmStraps", Pri: -30,
			Invariant: true,
			MorphPoses: {
				Yoked: "Yoked",
				Hogtie: "Hogtie",
				Wristtie: "Wristtie",
				Boxtie: "Boxtie",
				Front: "Front",
				Crossed: "Crossed"
			},
			HidePoseConditional: [
				["DynamicArmor", "ArmArmor", "SuppressDynamic"],
			],
		},
	])
});

AddModel({
	Name: "LightMaidKnight",
	Folder: "MaidKnightLight",
	Parent: "LightMaidKnight",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("LightMaidKnight_Dress"),
		...GetModelLayers("LightMaidKnight_Sleeves"),
		...GetModelLayers("LightMaidKnight_Apron"),
		...GetModelLayers("LightMaidKnight_Flower"),
		...GetModelLayers("LightMaidKnight_Pauldron"),
		...GetModelLayers("LightMaidKnight_Socks"),
		...GetModelLayers("LightMaidKnight_Boots"),
		...GetModelLayers("LightMaidKnight_Guards"),
		...GetModelLayers("LightMaidKnightHairband"),
	])
});