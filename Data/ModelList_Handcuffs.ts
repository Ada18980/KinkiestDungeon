/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "Legirons",
	Folder: "Handcuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Cuffs", "Legirons"],
	AddPose: ["LegCuffed"],
	Layers: ToLayerMap([
		{ Name: "LegironsLeft", Layer: "AnkleLeft", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...ANKLELEFTPOSES]),
		},
		{ Name: "LegironsRight", Layer: "AnkleRight", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "BaseMetal",
			Poses: ToMap([...ANKLERIGHTPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "AnkleRightKneel"},
		},
	])
});

