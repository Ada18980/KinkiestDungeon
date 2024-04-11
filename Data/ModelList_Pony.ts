/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "QuakeCollar",
	Folder: "Pony",
	Parent: "QuakeCollar",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 100,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "CollarTag", Layer: "CollarAcc", Pri: 100,
			MorphPoses: {Hogtie: "Hogtie"},
			HideWhenOverridden: true,
		},
	])
});


AddModel(GetModelRestraintVersion("QuakeCollar", true));
