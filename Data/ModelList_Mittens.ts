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
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			InheritColor: "Mitten",
		},
		{ Name: "BandRight", Layer: "MittenRight", Pri: 100.1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Up"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossMittenRight", Front: "ForeMittenRight"},
			TieToLayer: "LeatherRigt",
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
