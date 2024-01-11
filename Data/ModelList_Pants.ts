/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BanditShorts",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Pants"],
	AddPose: ["Pants"],
	Layers: ToLayerMap([
		{ Name: "Shorts", Layer: "Shorts", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
		{ Name: "ShortsLeft", Layer: "ShortsLeft", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});

