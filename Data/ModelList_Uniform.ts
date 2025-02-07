/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "MilitaryJacket_Sleeveless",
	Folder: "Uniform",
	Parent: "MilitaryJacket",
	TopLevel: false,
	Categories: ["Tops", "Jackets"],
	//RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "Dress", Layer: "Shirt", Pri: 30,
			InheritColor: "JacketBottom",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			Invariant: true,
		},
		{ Name: "DressChest", Layer: "ShirtChest", Pri: 30,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			InheritColor: "Jacket",
		},
		{ Name: "DressSkirt", Layer: "SkirtOver", Pri: 31,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel", Hogtie: "Hogtie"},
			HidePoses: ToMap(["EncaseTorsoLower"]),
			InheritColor: "JacketBottom",
		},
	])
});



AddModel({
	Name: "MilitaryUniform_SleeveLeft",
	Folder: "Uniform",
	Parent: "MilitaryJacket",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "JacketSleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "ArmLeft", Layer: "SleeveLeft", Pri: 50,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "JacketSleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			TieToLayer: "SleeveLeft",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "ForeArmLeft", Layer: "ForeSleeveLeft", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "JacketSleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveLeft"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},

	])
});

AddModel({
	Name: "MilitaryUniform_SleeveRight",
	Folder: "Uniform",
	Parent: "MilitaryJacket",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "SleeveRight", Layer: "SleeveRight", Pri: 60,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "JacketSleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "ArmRight", Layer: "SleeveRight", Pri: 50,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "JacketSleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			TieToLayer: "SleeveRight",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],

		},
		{ Name: "ForeArmRight", Layer: "ForeSleeveRight", Pri: 60,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "JacketSleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveRight"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "ShoulderRight", Layer: "UpSleeveRight", Pri: 60,
			HideWhenOverridden: true,
			InheritColor: "JacketSleeveRight",
			Poses: ToMap([...SHOULDERPOSES]),
		},
	])
});


AddModel({
	Name: "MilitaryUniform_Sleeves",
	Folder: "Uniform",
	Parent: "MilitaryJacket",
	TopLevel: false,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("MilitaryUniform_SleeveLeft"),
		...GetModelLayers("MilitaryUniform_SleeveRight"),
	])
});


AddModel({
	Name: "MilitaryJacket",
	Folder: "Uniform",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Tops", "Jackets", "Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("MilitaryUniform_Sleeves"),
		...GetModelLayers("MilitaryJacket_Sleeveless"),
	])
});




AddModel({
	Name: "WhiteGloveLeft",
	Folder: "UniformShirt",
	Parent: "WhiteGloves",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "GloveLeft", Pri: 3,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "ForeGloveLeft", Layer: "ForeGloveLeft", Pri: 3,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
		},
	])
});

AddModel({
	Name: "WhiteGloveRight",
	Folder: "UniformShirt",
	Parent: "WhiteGloves",
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "GloveRight", Pri: 3,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "ForeGloveRight", Layer: "ForeGloveRight", Pri: 3,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
		},
	])
});


AddModel({
	Name: "WhiteGloves",
	Folder: "UniformShirt",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("WhiteGloveLeft"),
		...GetModelLayers("WhiteGloveRight"),
	])
});



AddModel({
	Name: "UniformShirt_Sleeveless",
	Folder: "UniformShirt",
	Parent: "UniformShirt",
	TopLevel: false,
	Categories: ["Tops", "Jackets"],
	//RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "Dress", Layer: "Shirt", Pri: -5,
			InheritColor: "ShirtBottom",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
		},
		{ Name: "DressChest", Layer: "ShirtChest", Pri: -5,
			Poses: ToMap([...ARMPOSES]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			HidePoses: ToMap(["EncaseTorsoUpper"]),
			InheritColor: "Shirt",
		},
	])
});



AddModel({
	Name: "UniformShirt_SleeveLeft",
	Folder: "UniformShirt",
	Parent: "UniformShirt",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: 10,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "ForeArmLeft", Layer: "ForeSleeveLeft", Pri: 10,
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
	Name: "UniformShirt_SleeveRight",
	Folder: "UniformShirt",
	Parent: "UniformShirt",
	TopLevel: false,
	Categories: ["Sleeves"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "SleeveRight", Layer: "SleeveRight", Pri: 10,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "ForeArmRight", Layer: "ForeSleeveRight", Pri: 10,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "SleeveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossSleeveRight"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "ShoulderRight", Layer: "UpSleeveRight", Pri: 10,
			HideWhenOverridden: true,
			InheritColor: "SleeveRight",
			Poses: ToMap([...SHOULDERPOSES]),
		},
	])
});


AddModel({
	Name: "UniformShirt_Sleeves",
	Folder: "UniformShirt",
	Parent: "UniformShirt",
	TopLevel: false,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("UniformShirt_SleeveLeft"),
		...GetModelLayers("UniformShirt_SleeveRight"),
	])
});


AddModel({
	Name: "UniformShirt",
	Folder: "UniformShirt",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Tops", "Shirts", "Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("UniformShirt_Sleeves"),
		...GetModelLayers("UniformShirt_Sleeveless"),
	])
});

AddModel({
	Name: "MilitaryUniform_Hat",
	Folder: "Uniform",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Hats"],
	Layers: ToLayerMap([
		{ Name: "Hat", Layer: "Hat", Pri: 30,
			HideWhenOverridden: true,
			Invariant: true,
			EraseLayers: {EarsHelmet: true},
			EraseAmount: 100,
			EraseSprite: "SovietHatErase",
		},
		{ Name: "HatRim", Layer: "Hat", Pri: 30.2,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
			InheritColor: "Rim",
		},
		{ Name: "HatCap", Layer: "Hat", Pri: 30.1,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
			InheritColor: "Cap",
		},
		{ Name: "HatGloriousInsignia", Layer: "Hat", Pri: 30.3,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
			InheritColor: "Circle",
		},
		{ Name: "HatGloriousInsigniaHS", Layer: "Hat", Pri: 30.4,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
			InheritColor: "Secret",
			RequirePoses: {"Marhnth": true},
		},
	])
});



AddModel({
	Name: "MilitaryUniform_Skirt",
	Folder: "Uniform",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: -4,
			//swaplayerpose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			//HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			//AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
			HidePoses: {"SkimpyLower": true},
		},
		{ Name: "SkirtBand", Layer: "Skirt", Pri: -3.9,
			//swaplayerpose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			//HideWhenOverridden: true,
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			//AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			InheritColor: "Band",
			Invariant: true,
		},
	])
});


AddModel({
	Name: "MilitaryUniform_Shoes",
	Folder: "Uniform",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		{ Name: "ShoeLeft", Layer: "ShoeLeft", Pri: 17,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			HideWhenOverridden: true,

			DisplaceLayers: {ShoeLeft: true,},
			DisplacementSprite: "SockLSquish_Short",
			DisplaceAmount: 10,
		},
		{ Name: "ShoeRight", Layer: "ShoeRight", Pri: 17,
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "Kneel", "KneelClosed"]),
			HideWhenOverridden: true,

			DisplaceLayers: {ShoeRight: true,},
			DisplacementSprite: "SockRSquish_Short",
			DisplaceAmount: 10,
		},
		{ Name: "ShoeRightKneel", Layer: "ShoeRightKneel", Pri: 17,
			Poses: ToMap(["Kneel"]),
			Invariant: true,
			InheritColor: "ShoeRight",
			HideWhenOverridden: true,
		},
		{ Name: "ShoeLeftHogtie", Layer: "ShoeLeftHogtie", Pri: 17,
			Poses: ToMap(["Hogtie"]),
			Invariant: true,
			InheritColor: "ShoeLeft",
			HideWhenOverridden: true,
		},
	])
});



AddModel({
	Name: "MilitaryUniform_TightsShorts",
	Folder: "Uniform",
	Parent: "Tights",
	Categories: ["Panties"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "Pantyhose", Layer: "BodysuitLower", Pri: -30,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});

AddModel({
	Name: "MilitaryUniform_SockLeft",
	Folder: "Uniform",
	Parent: "Tights",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -30,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingLeft: true,},
			DisplacementSprite: "SockLSquish_Long",
			DisplaceAmount: 30,

		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: -30,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
	])
});
AddModel({
	Name: "MilitaryUniform_SockRight",
	Folder: "Uniform",
	Parent: "Tights",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -30,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingRight: true,},
			DisplacementSprite: "SockRSquish_Long",
			DisplaceAmount: 30,

		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: -30,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});




AddModel({
	Name: "Tights",
	Folder: "Uniform",
	Parent: "MilitaryUniform",
	Categories: ["Socks", "Panties"],
	TopLevel: true,
	Layers: ToLayerMap([
		...GetModelLayers("MilitaryUniform_TightsShorts"),
		...GetModelLayers("MilitaryUniform_SockLeft"),
		...GetModelLayers("MilitaryUniform_SockRight"),
	])
});



AddModel({
	Name: "MilitaryUniform",
	Folder: "Uniform",
	Parent: "MilitaryUniform",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("MilitaryJacket"),
		...GetModelLayers("UniformShirt", "Shirt", undefined, undefined, undefined, undefined,
			"UniformShirt"
		),
		...GetModelLayers("WhiteGloves", undefined, undefined, undefined, undefined, undefined,
			"UniformShirt"
		),
		...GetModelLayers("Tights"),
		...GetModelLayers("MilitaryUniform_Shoes"),
		...GetModelLayers("MilitaryUniform_Skirt"),
		...GetModelLayers("MilitaryUniform_Hairpin"),
		...GetModelLayers("MilitaryUniform_Hat"),
		...GetModelLayers("MilitaryEarphones"),



		{ Name: "Headgear", Layer: "Circlet", Pri: 40,
			HideWhenOverridden: true,
			NoOverride: true,
			Invariant: true,
			InheritColor: "Band",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "HeadgearUnit", Layer: "Circlet", Pri: 40.1,
			TieToLayer: "Headgear",
			NoOverride: true,
			Invariant: true,
			InheritColor: "Unit",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "HeadgearBack", Layer: "CircletUnder", Pri: -40,
			NoOverride: true,
			Invariant: true,
			InheritColor: "Inner",
			RequirePoses: {"Marhnth": true},
		},

		{ Name: "BeltPouch", Layer: "ChestStraps", Pri: 50,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Pouch",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "BeltPouchRim", Layer: "ChestStraps", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "BeltPouch",
			RequirePoses: {"Marhnth": true},
		},

		{ Name: "WebbingUnderbust", Layer: "ChestStraps", Pri: 25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "UnderbustStrap",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "WebbingUnderbustHardware", Layer: "ChestStraps", Pri: 25.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "WebbingUnderbust",
			InheritColor: "UnderbustHardware",
			RequirePoses: {"Marhnth": true},
		},

		{ Name: "HeadgearEars", Layer: "Circlet", Pri: 40.1,
			TieToLayer: "Headgear",
			NoOverride: true,
			Invariant: true,
			InheritColor: "Ears",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "HeadgearEarsInner", Layer: "Circlet", Pri: 40.2,
			TieToLayer: "Headgear",
			NoOverride: true,
			Invariant: true,
			InheritColor: "EarsInner",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "Webbing", Layer: "UpperArmStraps", Pri: 25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_Strap",
			RequirePoses: {"Marhnth": true},
			MorphPoses: {Wristtie: "Wristtie", Up: "Up"},
		},
		{ Name: "WebbingSide", Layer: "ChestStraps", Pri: 25.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_Side",
			TieToLayer: "Webbing",
			RequirePoses: {"Marhnth": true},
			MorphPoses: {Boxtie: "Tied", Wristtie: "Tied", Front: "Tied", Crossed: "Tied", Up: "Up", Yoked: "Yoked"},
		},
		{ Name: "WebbingHardware", Layer: "UpperArmStraps", Pri: 25.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_Hardware",
			TieToLayer: "Webbing",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "WebbingName", Layer: "UpperArmStraps", Pri: 25.1,
			Invariant: true,
			NoOverride: true,
			RequirePoses: {"Marhnth": true},
			InheritColor: "Name",
			TieToLayer: "Webbing",
		},
		{ Name: "WebbingUnderbust", Layer: "ChestStraps", Pri: 25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_UnderbustStrap",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "WebbingUnderbustHardware", Layer: "ChestStraps", Pri: 25.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "WebbingUnderbust",
			InheritColor: "Secret_UnderbustHardware",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "SearchlightPouch", Layer: "UpperArmStraps", Pri: 50,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_Pouch",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "Searchlight", Layer: "ChestOverHair", Pri: 50.2,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_Light",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "SearchlightBase", Layer: "UpperArmStraps", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Secret_Base",
			RequirePoses: {"Marhnth": true},
		},
		{ Name: "SearchlightLens", Layer: "ChestOverHair", Pri: 50,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Searchlight",
			InheritColor: "Secret_Lens",
			RequirePoses: {"Marhnth": true},
		},
	])
});