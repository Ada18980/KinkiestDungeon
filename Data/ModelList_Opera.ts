/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "OperaGloveLeft",
	Folder: "OperaGloves",
	Parent: "OperaGloves",
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
	Name: "OperaGloveRight",
	Folder: "OperaGloves",
	Parent: "OperaGloves",
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
	Name: "OperaGloves",
	Folder: "OperaGloves",
	Parent: "OperaGloves",
	TopLevel: true,
	Categories: ["Gloves"],
	Layers: ToLayerMap([
		...GetModelLayers("OperaGloveLeft"),
		...GetModelLayers("OperaGloveRight"),
	])
});

AddModel(GetModelRestraintVersion("OperaGloves", true));
