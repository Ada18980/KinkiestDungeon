/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "TapeFace",
	Folder: "GagTape",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags", "Blindfolds", "Masks"],
	AddPose: ["HideMouth", "FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Face", Layer: "Mask", Pri: -50,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "BlindfoldBasic",
	Folder: "Blindfold",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Basic", Layer: "Blindfold", Pri: 0,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Blindfold",
		},
		{ Name: "BasicRim", Layer: "Blindfold", Pri: 0.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			NoOverride: true,
			InheritColor: "Rim",
		},
	])
});

AddModel({
	Name: "BlindfoldLeather",
	Folder: "Blindfold",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "LeatherBase", Layer: "Blindfold", Pri: 2,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Blindfold",
		},
		{ Name: "LeatherRim", Layer: "Blindfold", Pri: 2.1,
			Invariant: true,
			HideWhenOverridden: true,
			NoOverride: true,
			InheritColor: "Rim",
		},
	])
});


AddModel({
	Name: "BlindfoldTape",
	Folder: "Blindfold",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Tape", Layer: "Blindfold", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Tape",
		},
	])
});
