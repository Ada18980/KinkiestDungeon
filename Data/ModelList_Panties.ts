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
	Categories: ["Underwear", "Panties"],
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
	TopLevel: true,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		{ Name: "Bow", Layer: "Panties", Pri: -24.7,
			Invariant: true,
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "PantiesStriped",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: false,
	Categories: ["Underwear", "Panties"],
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
	Name: "PantiesInvertedRose",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: false,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		...GetModelLayers("Panties"),
		{ Name: "InvertedRose", Layer: "Panties", Pri: -24.9,
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
	Name: "PantiesCherry",
	Folder: "Panties",
	Parent: "Panties",
	TopLevel: false,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		...GetModelLayers("Panties"),
		{ Name: "Cherry", Layer: "Panties", Pri: -24.9,
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
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		...GetModelLayers("Panties"),
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



AddModel({
	Name: "PantiesHigh",
	Folder: "PantiesHigh",
	Parent: "PantiesHigh",
	TopLevel: true,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		{ Name: "Base", Layer: "Panties", Pri: -29,
			Invariant: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed"},
		},
		{ Name: "Lines", Layer: "Panties", Pri: -28.8,
			Invariant: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed"},
			NoOverride: true,
			InheritColor: "Seams",
			TieToLayer: "Base",
		},
	])
});

AddModel({
	Name: "PantiesHighStriped",
	Folder: "PantiesHigh",
	Parent: "PantiesHigh",
	TopLevel: false,
	Categories: ["Underwear", "Panties"],
	Layers: ToLayerMap([
		...GetModelLayers("PantiesHigh"),
		{ Name: "Stripes", Layer: "Panties", Pri: -28.9,
			Invariant: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed"},
			NoOverride: true,
			TieToLayer: "Base",
		},
		{ Name: "Lines", Layer: "Panties", Pri: -28.8,
			Invariant: true,
			MorphPoses: {Hogtie: "Closed", Closed: "Closed"},
			NoOverride: true,
			InheritColor: "Seams",
			TieToLayer: "Base",
		},
	])
});