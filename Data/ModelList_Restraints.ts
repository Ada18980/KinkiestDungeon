/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */




AddModel({
	Name: "StardustCollar",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 50,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "SteelYoke",
	Folder: "Yoke",
	Parent: "Yoke",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Metal", "Yokes"],
	AddPose: ["Yokes"],
	Layers: ToLayerMap([
		{ Name: "Steel", Layer: "Yoke", Pri: 10,
			Invariant: true,
			HideWhenOverridden: true,
			DisplacementSprite: "Yoke",
			DisplaceLayers: ToMap(["Yoke"]),
			DisplaceAmount: 40,
		},
		{ Name: "SteelBar", Layer: "Yoke", Pri: 10.1,
			Invariant: true,
			HideWhenOverridden: true,
			NoOverride: true,
		},
	])
});
