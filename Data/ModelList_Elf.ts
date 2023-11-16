/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "ElfPanties",
	Folder: "Elf",
	Parent: "Elf",
	TopLevel: true,
	Categories: ["Underwear"],
	Layers: ToLayerMap([
		{ Name: "Panties", Layer: "Panties", Pri: -30,
			Invariant: true,
			SwapLayerPose: {Kneel: "PantiesLower", KneelClosed: "PantiesLower"},
		},
	])
});