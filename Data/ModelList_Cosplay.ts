/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "BunnyEars",
	Folder: "Bunny",
	Parent: "Bunny",
	TopLevel: true,
	Protected: true,
	Categories: ["Ears", "Bunny", "Face"],
	AddPose: ["AnimalEars", "Bunny"],
	Layers: ToLayerMap([
		{ Name: "Ears", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
		},
		{ Name: "EarsInner", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Ears",
			NoOverride: true,
		},
	])
});