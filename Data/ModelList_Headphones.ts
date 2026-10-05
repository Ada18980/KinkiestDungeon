/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "Headphones",
	Folder: "Headphones",
	TopLevel: true,
	Group: "Headphones",
	Categories: ["Headphones"],
	AddPose: ["Headband"],
	Layers: ToLayerMap([
		{ Name: "Band", Layer: "Headband", Pri: 10,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Mic", Layer: "Mic", Pri: 10,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Headphone", Layer: "HeadphoneFront", Pri: 10,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "HeadphoneGlow1", Layer: "HeadphoneFront", Pri: 10.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Headphone"
		},
		{ Name: "HeadphoneGlow2", Layer: "HeadphoneFront", Pri: 10.15,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Headphone"
		},
		{ Name: "MicGlow", Layer: "HeadphoneMicFront", Pri: 10.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Mic",
		},
	])
});
AddModel(GetModelRestraintVersion("LeatherMask", true));
