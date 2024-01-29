/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "LeatherMittenLeft",
	Folder: "Mittens",
	Parent: "LeatherMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		{ Name: "LeatherLeft", Layer: "MittenLeft", Pri: 100,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			InheritColor: "Mitten",
			EraseSprite: "Mitts",
			EraseLayers: ToMap(["Mitts"]),
		},
		{ Name: "BandLeft", Layer: "MittenLeft", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			TieToLayer: "LeatherLeft",
			NoOverride: true,
			InheritColor: "Band",
		},
		{ Name: "LockLeft", Layer: "MittenLeft", Pri: 100.2,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			TieToLayer: "LeatherLeft",
			NoOverride: true,
			InheritColor: "Lock",
		},


	])
});

AddModel({
	Name: "LeatherMittenRight",
	Folder: "Mittens",
	Parent: "LeatherMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		{ Name: "LeatherRight", Layer: "MittenRight", Pri: 100,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			InheritColor: "Mitten",
		},
		{ Name: "BandRight", Layer: "MittenRight", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LeatherRight",
			NoOverride: true,
			InheritColor: "Band",
		},
		{ Name: "LockRight", Layer: "MittenRight", Pri: 100.2,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LeatherRight",
			NoOverride: true,
			InheritColor: "Lock",
		},
	])
});

AddModel({
	Name: "LeatherPawMittenLeft",
	Folder: "Mittens",
	Parent: "LeatherMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherMittenLeft"),
		{ Name: "PawLeft", Layer: "MittenLeft", Pri: 100.3,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			TieToLayer: "LeatherLeft",
			NoOverride: true,
			InheritColor: "Paw",
		},
	])
});
AddModel({
	Name: "LeatherPawMittenRight",
	Folder: "Mittens",
	Parent: "LeatherMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherMittenRight"),
		{ Name: "PawRight", Layer: "MittenRight", Pri: 100.3,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LeatherRight",
			NoOverride: true,
			InheritColor: "Paw",
		},
	])
});

AddModel({
	Name: "LatexMittenLeft",
	Folder: "Mittens",
	Parent: "LatexMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		{ Name: "LatexLeft", Layer: "MittenLeft", Pri: 100,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			InheritColor: "Mitten",
			EraseSprite: "Mitts",
			EraseLayers: ToMap(["Mitts"]),
		},
		{ Name: "ZipperLeft", Layer: "MittenLeft", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			TieToLayer: "LatexLeft",
			NoOverride: true,
			InheritColor: "Zipper",
		},

	])
});

AddModel({
	Name: "LatexMittenRight",
	Folder: "Mittens",
	Parent: "LatexMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		{ Name: "LatexRight", Layer: "MittenRight", Pri: 100,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			InheritColor: "Mitten",
		},
		{ Name: "ZipperRight", Layer: "MittenRight", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LatexRight",
			NoOverride: true,
			InheritColor: "Zipper",
		},
	])
});


AddModel({
	Name: "LeatherMittens",
	Folder: "Mittens",
	TopLevel: true,
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherMittenLeft"),
		...GetModelLayers("LeatherMittenRight"),
	])
});

AddModel({
	Name: "LeatherPawMittens",
	Folder: "Mittens",
	TopLevel: false,
	Parent: "LeatherMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		...GetModelLayers("LeatherPawMittenLeft"),
		...GetModelLayers("LeatherPawMittenRight"),
	])
});

AddModel({
	Name: "LatexMittens",
	Folder: "Mittens",
	TopLevel: true,
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		...GetModelLayers("LatexMittenLeft"),
		...GetModelLayers("LatexMittenRight"),
	])
});

AddModel({
	Name: "LongMittenLeft",
	Folder: "Mittens",
	Parent: "LongMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		{ Name: "LongMittenLeft", Layer: "MittenLeft", Pri: 100,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Mitten",
			EraseSprite: "Mitts",
			EraseLayers: ToMap(["Mitts"]),
		},
		{ Name: "ForeLongMittenLeft", Layer: "ForeMittenLeft", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "Mitten",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft"},
		},
		{ Name: "BandLeft", Layer: "MittenLeft", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			TieToLayer: "LongMittenLeft",
			NoOverride: true,
			InheritColor: "Band",
		},
		{ Name: "LockLeft", Layer: "MittenLeft", Pri: 100.2,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenLeft", Front: "ForeMittenLeft"},
			TieToLayer: "LongMittenLeft",
			NoOverride: true,
			InheritColor: "Lock",
		},
	])
});

AddModel({
	Name: "LongMittenRight",
	Folder: "Mittens",
	Parent: "LongMittens",
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		{ Name: "LongMittenRight", Layer: "MittenRight", Pri: 100,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Mitten",
			EraseSprite: "Mitts",
			EraseLayers: ToMap(["Mitts"]),
		},
		{ Name: "ForeLongMittenRight", Layer: "ForeMittenRight", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "Mitten",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
		},
		{ Name: "BandRight", Layer: "MittenRight", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LongMittenRight",
			NoOverride: true,
			InheritColor: "Band",
		},
		{ Name: "LockRight", Layer: "MittenRight", Pri: 100.2,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LongMittenRight",
			NoOverride: true,
			InheritColor: "Lock",
		},
	])
});

AddModel({
	Name: "LongMittens",
	Folder: "Mittens",
	TopLevel: true,
	Categories: ["Gloves", "Mittens", "Restraints"],
	Restraint: true,
	AddPose: ["Mittens"],
	Layers: ToLayerMap([
		...GetModelLayers("LongMittenLeft"),
		...GetModelLayers("LongMittenRight"),
	])
});


AddModel(GetModelFashionVersion("LeatherMittenRight", true));
AddModel(GetModelFashionVersion("LeatherMittenLeft", true));
AddModel(GetModelFashionVersion("LeatherMittens", true));
AddModel(GetModelFashionVersion("LeatherPawMittenRight", true));
AddModel(GetModelFashionVersion("LeatherPawMittenLeft", true));
AddModel(GetModelFashionVersion("LeatherPawMittens", true));
AddModel(GetModelFashionVersion("LatexMittenRight", true));
AddModel(GetModelFashionVersion("LatexMittenLeft", true));
AddModel(GetModelFashionVersion("LatexMittens", true));
AddModel(GetModelFashionVersion("LongMittenRight", true));
AddModel(GetModelFashionVersion("LongMittenLeft", true));
AddModel(GetModelFashionVersion("LongMittens", true));
