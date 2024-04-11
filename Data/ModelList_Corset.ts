/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BuckleCorset",
	Folder: "Corsets",
	Parent: "BuckleCorset",
	TopLevel: true,
	Categories: ["Corsets"],
	AddPose: ["Corset"],
	Layers: ToLayerMap([
		{ Name: "BuckleCorset", Layer: "Bustier", Pri: 50,
			Invariant: true,
			InheritColor: "Corset",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
		},
		{ Name: "BuckleCorsetBuckles", Layer: "Bustier", Pri: 50.1,
			Invariant: true,
			InheritColor: "Buckles",
			TieToLayer: "BuckleCorset",
		},
		{ Name: "BuckleCorsetHardware", Layer: "Bustier", Pri: 50.2,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "BuckleCorset",
		},
	])
});

AddModel(GetModelRestraintVersion("BuckleCorset", true));