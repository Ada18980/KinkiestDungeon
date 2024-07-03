/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "ClothCollar",
	Folder: "Ninja",
	Parent: "Ninja",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 10,
			Invariant: true,
		},
	])
});
AddModel({
	Name: "ClothCollarTag",
	Folder: "Ninja",
	Parent: "ClothCollar",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("ClothCollar"),
		{ Name: "CollarTag", Layer: "Collar", Pri: 10.1,
			Invariant: true,
			NoOverride: true, TieToLayer: "Collar",
		},
	])
});


AddModel({
	Name: "ClothBelt",
	Folder: "Ninja",
	Parent: "Ninja",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "Bustier", Pri: 1,
			//SwapLayerPose: {Pants: "CorsetUnder"},
			HideWhenOverridden: true,
			Invariant: true,
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
	])
});

AddModel({
	Name: "ClothBeltLines",
	Folder: "Ninja",
	Parent: "Ninja",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		...GetModelLayers("ClothBelt"),
		{ Name: "BeltLines", Layer: "Bustier", Pri: 1.1,
			NoOverride: true, TieToLayer: "Belt",
			//SwapLayerPose: {Pants: "CorsetUnder"},
			Invariant: true,
		},
	])
});



AddModel({
	Name: "ClothTop",
	Folder: "Ninja",
	Parent: "ClothTop",
	TopLevel: true,
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "TopChest", Layer: "ShirtChest", Pri:40,
			Invariant: true,
			InheritColor: "Base",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopShoulders", Layer: "ShirtChest", Pri:39.9,
			Invariant: true,
			InheritColor: "Shoulders",
			NoOverride: true,
			TieToLayer: "TopChest",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
		},
		{ Name: "Top", Layer: "Shirt", Pri: 40,
			Invariant: true,
			InheritColor: "Base",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},

	])
});
AddModel({
	Name: "ClothBra",
	Folder: "Ninja",
	Parent: "ClothTop",
	TopLevel: true,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "TopChest", Layer: "BraChest", Pri:40,
			Invariant: true,
			InheritColor: "Base",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "Top", Layer: "Bra", Pri: 40,
			Invariant: true,
			InheritColor: "Base",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},

	])
});

AddModel({
	Name: "ClothTopBand",
	Folder: "Ninja",
	Parent: "ClothTop",
	TopLevel: false,
	Categories: ["Tops"],
	Layers: ToLayerMap([
		...GetModelLayers("ClothTop"),
		{ Name: "TopBandChest", Layer: "ShirtChest", Pri:41,
			Invariant: true,
			InheritColor: "Band",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopBandRimChest", Layer: "ShirtChest", Pri:41.1,
			Invariant: true,
			InheritColor: "Rim",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopBand", Layer: "Shirt", Pri: 41,
			Invariant: true,
			InheritColor: "Band",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopBandRim", Layer: "Shirt", Pri: 41.1,
			Invariant: true,
			InheritColor: "Rim",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
	])
});
AddModel({
	Name: "ClothBraBand",
	Folder: "Ninja",
	Parent: "ClothBra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		...GetModelLayers("ClothBra"),
		{ Name: "TopBandChest", Layer: "BraChest", Pri:41,
			Invariant: true,
			InheritColor: "Band",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopBandRimChest", Layer: "BraChest", Pri:41.1,
			Invariant: true,
			InheritColor: "Rim",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopBand", Layer: "Bra", Pri: 41,
			Invariant: true,
			InheritColor: "Band",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
		{ Name: "TopBandRim", Layer: "Bra", Pri: 41.1,
			Invariant: true,
			InheritColor: "Rim",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
		},
	])
});



AddModel({
	Name: "NinjaSkirt",
	Folder: "Ninja",
	Parent: "Ninja",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 15,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			//swaplayerpose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtBand", Layer: "Skirt", Pri: 15.1,
			TieToLayer: "Skirt",
			NoOverride: true,
			InheritColor: "Band",
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			//swaplayerpose: {Kneel: "SkirtLower", KneelClosed: "SkirtLower"},
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 8,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Skirt",
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
		{ Name: "SkirtBandOver", Layer: "SkirtOver", Pri: 8.1,
			Poses: ToMap([...KNEELPOSES]),
			//RequirePoses: ToMap(["CrotchStrap"]),
			TieToLayer: "Skirt", NoOverride: true,
			InheritColor: "Band",
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
	])
});



AddModel({
	Name: "NinjaSockLeft",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: 2,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			SwapLayerPose: {Hogtie: "SockLeftHogtie", KneelClosed: "StockingLeftKneel"},
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "NinjaSockRight",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: 2,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			SwapLayerPose: {Kneel: "SockRightKneel"},
			NoOverride: true,
		},

	])
});


AddModel({
	Name: "NinjaThighLeft",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "ThighLeft", Layer: "StockingLeft", Pri: 3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "NinjaThighRight",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "ThighRight", Layer: "StockingRight", Pri: 3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},

	])
});


AddModel({
	Name: "NinjaKneeLeft",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "KneeLeft", Layer: "StockingLeft", Pri: 4,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "NinjaKneeRight",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "KneeRight", Layer: "StockingRight", Pri: 4,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			NoOverride: true,
		},

	])
});


AddModel({
	Name: "NinjaSocks",
	Folder: "Ninja",
	Parent: "Ninja",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("NinjaSockLeft"),
		...GetModelLayers("NinjaSockRight"),
	])
});
AddModel({
	Name: "NinjaThighs",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	TopLevel: false,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("NinjaThighLeft"),
		...GetModelLayers("NinjaThighRight"),
	])
});
AddModel({
	Name: "NinjaKnees",
	Folder: "Ninja",
	Parent: "NinjaSocks",
	TopLevel: false,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("NinjaKneeLeft"),
		...GetModelLayers("NinjaKneeRight"),
	])
});


AddModel({
	Name: "NinjaShoes",
	Folder: "Ninja",
	Parent: "Ninja",
	TopLevel: true,
	Categories: ["Shoes"],
	Layers: ToLayerMap([
		...GetModelLayers("MaidShoes", undefined, undefined, undefined, -1),
	])
});


AddModel({
	Name: "Ninja",
	Folder: "Ninja",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("ClothTopBand"),
		...GetModelLayers("NinjaSkirt"),
		...GetModelLayers("ClothCollarTag"),
		...GetModelLayers("ClothBeltLines"),
		...GetModelLayers("NinjaThighs"),
		...GetModelLayers("NinjaKnees"),
		...GetModelLayers("NinjaSocks"),
		...GetModelLayers("NinjaShoes"),
	])
});