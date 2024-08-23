/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "Panties",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: true,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "Base", Layer: "Panties", Pri: -25,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel"},
		},
		{ Name: "Lines", Layer: "Panties", Pri: -24.8,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel"},
			NoOverride: true,
			InheritColor: "Seams",
			TieToLayer: "Base",
		},
	])
});


AddModel({
	Name: "PantiesBow",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: false,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		...GetModelLayers("Panties"),
		{ Name: "Bow", Layer: "Panties", Pri: -24.7,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Base",
		},
	])
});


AddModel({
	Name: "PantiesStriped",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: false,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		...GetModelLayers("Panties"),
		{ Name: "Stripes", Layer: "Panties", Pri: -24.9,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel"},
			NoOverride: true,
			TieToLayer: "Base",
		},
		{ Name: "Lines", Layer: "Panties", Pri: -24.8,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel"},
			NoOverride: true,
			InheritColor: "Seams",
			TieToLayer: "Base",
		},
	])
});

AddModel({
	Name: "PantiesBowStriped",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: false,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		...GetModelLayers("PantiesBow"),
		{ Name: "Stripes", Layer: "Panties", Pri: -24.9,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel"},
			NoOverride: true,
			TieToLayer: "Base",
		},
		{ Name: "Lines", Layer: "Panties", Pri: -24.8,
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", Hogtie: "Closed", Closed: "Closed", KneelClosed: "Kneel"},
			NoOverride: true,
			InheritColor: "Seams",
			TieToLayer: "Base",
		},
	])
});
