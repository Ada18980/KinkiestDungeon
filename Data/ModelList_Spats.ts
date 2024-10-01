/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "Spats",
	Folder: "Spats",
	Parent: "Spats",
	TopLevel: true,
	Categories: ["Pants"],
	AddPose: ["Spats"],
	Layers: ToLayerMap([
		{ Name: "Spats", Layer: "Shorts", Pri: 4,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			MorphPoses: {KneelClosed: "KneelClosed"},
		},
		/*{ Name: "ShortsLeft", Layer: "ShortsLeft", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},*/
	])
});
