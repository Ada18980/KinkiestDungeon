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
			DisplaceAmount: 100,
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