/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "ChastityBra",
	Folder: "Chastity",
	Parent: "ChastityBra",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "ChastityBra", "Metal"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "BraCups", Layer: "BraChest", Pri: -40.1,
			Invariant: true,
			InheritColor: "Steel",
		},
		{ Name: "BraLining", Layer: "BraChest", Pri: -40,
			Invariant: true,
			TieToLayer: "BraCups",
			NoOverride: true,
			InheritColor: "Lining",
		},
		{ Name: "BraChain", Layer: "BraChest", Pri: -25,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Chain",
		},
		{ Name: "BraLock", Layer: "BraChest", Pri: -39,
			Invariant: true,
			TieToLayer: "BraCups",
			NoOverride: true,
			InheritColor: "Lock",
		},
	])
});


AddModel({
	Name: "HeartBelt",
	Folder: "Chastity",
	Parent: "HeartBelt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "ChastityBelt", "Metal"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "HarnessMid", Pri: -40.1,
			Invariant: true,
			DisplacementInvariant: true,
			DisplacementSprite: "CrotchRopeSquish",
			DisplaceLayers: ToMap(["RibbonTorso"]),
			InheritColor: "Steel",
		},
		{ Name: "BeltLining", Layer: "HarnessMid", Pri: -40,
			Invariant: true,
			DisplacementInvariant: true,
			NoOverride: true,
			TieToLayer: "Belt",
			InheritColor: "Lining",
		},
		{ Name: "BeltLock", Layer: "HarnessMid", Pri: -39,
			Invariant: true,
			DisplacementInvariant: true,
			InheritColor: "Lock",
		},
		{ Name: "BeltStrap", Layer: "HarnessMid", Pri: -50.1,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Steel",
		},
		{ Name: "BeltStrapLining", Layer: "HarnessMid", Pri: -50,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			NoOverride: true,
			TieToLayer: "BeltStrap",
			InheritColor: "Lining",
		},
	])
});
