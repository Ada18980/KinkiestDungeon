/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "Bra",
	Folder: "Bra",
	Parent: "Bra",
	TopLevel: true,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "Bra", Layer: "BraChest", Pri: -35,
			Invariant: true,
			InheritColor: "Cups",
			EraseAmount: 100,
			EraseSprite: "LaceChest", EraseInvariant: true,
			EraseLayers: ToMap(["CorsetBra"]),
		},
		{ Name: "BraRim", Layer: "BraChest", Pri: -34.9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rim",
			TieToLayer: "Bra",
		},
		{ Name: "InnerLines", Layer: "BraChest", Pri: -34.7,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Seams",
			TieToLayer: "Bra",
		},
		{ Name: "BraUnder", Layer: "Bra", Pri: -35,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Under",
		},
		{ Name: "BraUnderRim", Layer: "Bra", Pri: -34.9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rim",
			TieToLayer: "BraUnder",
		},
	])
});


AddModel({
	Name: "BraStriped",
	Folder: "Bra",
	Parent: "Bra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		...GetModelLayers("Bra"),
		{ Name: "Stripes", Layer: "BraChest", Pri: -34.8,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "BraCherry",
	Folder: "Bra",
	Parent: "Bra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		...GetModelLayers("Bra"),
		{ Name: "Cherry", Layer: "BraChest", Pri: -34.8,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "BraRose",
	Folder: "Bra",
	Parent: "Bra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		...GetModelLayers("Bra"),
		{ Name: "Rose", Layer: "BraChest", Pri: -34.8,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "BraInvertedRose",
	Folder: "Bra",
	Parent: "Bra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		...GetModelLayers("Bra"),
		{ Name: "InvertedRose", Layer: "BraChest", Pri: -34.8,
			Invariant: true,
		},
	])
});



AddModel({
	Name: "BraStraps",
	Folder: "Bra",
	Parent: "Bra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "Straps", Layer: "BraChest", Pri: -35,
			Invariant: true,
			MorphPoses: {Boxtie: "Tied", Crossed: "Tied", Front: "Tied", Wristtie: "Tied", Up: "Up"},
		},
	])
});




AddModel({
	Name: "GothicBra",
	Folder: "Gothic",
	Parent: "GothicBra",
	TopLevel: true,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "Under/Bra", Layer: "BraChest", Pri: 5,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest", EraseInvariant: true,
			EraseLayers: ToMap(["CorsetBra"]),
		},
		{ Name: "Under/BraRim", Layer: "BraChest", Pri: 5.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Edges",
			TieToLayer: "Under/Bra",
		},
		{ Name: "Under/BraLace", Layer: "BraChest", Pri: 5.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Lace",
			TieToLayer: "Under/Bra",
		},
		{ Name: "Under/BraStraps", Layer: "BraChest", Pri: 5.2,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Straps",
			TieToLayer: "Under/Bra",
			MorphPoses: {Boxtie: "Tied", Crossed: "Tied", Front: "Tied", Wristtie: "Tied", Up: "Up"},
		},
		{ Name: "Under/BraLaces", Layer: "BraChest", Pri: 5.1,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Lacing",
			TieToLayer: "Under/Bra",
			//HideWhenOverridden: true,
		},
		{ Name: "Under/BraBows", Layer: "BraChest", Pri: 5.2,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Bows",
			TieToLayer: "Under/Bra",
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "GothicBraFrills",
	Folder: "Gothic",
	Parent: "GothicBra",
	TopLevel: false,
	Categories: ["Bras"],
	Layers: ToLayerMap([
		{ Name: "Under/Bra", Layer: "BraChest", Pri: 5.5,
			Invariant: true,
			InheritColor: "Bra",
			EraseAmount: 100,
			EraseSprite: "LaceChest", EraseInvariant: true,
			EraseLayers: ToMap(["CorsetBra"]),
		},
		{ Name: "Under/BraFrills", Layer: "BraChest", Pri: 5.55,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Frills",
			TieToLayer: "Under/Bra",
		},
		{ Name: "Under/BraStraps", Layer: "BraChest", Pri: 5.6,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Straps",
			TieToLayer: "Under/Bra",
			MorphPoses: {Boxtie: "Tied", Crossed: "Tied", Front: "Tied", Wristtie: "Tied", Up: "Up"},
		},
		{ Name: "Under/BraLaces", Layer: "BraChest", Pri: 5.55,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Lacing",
			TieToLayer: "Under/Bra",
			//HideWhenOverridden: true,
		},
		{ Name: "Under/BraBows", Layer: "BraChest", Pri: 5.6,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Bows",
			TieToLayer: "Under/Bra",
			HideWhenOverridden: true,
		},
	])
});
