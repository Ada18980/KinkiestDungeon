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
	AddPose: ["FaceCoverGag"],
	AddPoseConditional: {
		Xray: ["HoodMask"],
	},
	Layers: ToLayerMap([
		{ Name: "Face", Layer: "Hood", Pri: -20,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "ClothBlindfold",
	Folder: "Blindfold",
	TopLevel: true,
	Group: "Blindfold",
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Cloth", Layer: "Blindfold", Pri: -10,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
		},
	])
});

AddModel(GetModelFashionVersion("ClothBlindfold", true));
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
			TieToLayer: "Basic",
			NoOverride: true,
			InheritColor: "Rim",
		},
	])
});

AddModel(GetModelFashionVersion("BlindfoldBasic", true));
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
			TieToLayer: "LeatherBase",
			NoOverride: true,
			InheritColor: "Rim",
		},
	])
});
AddModel({
	Name: "KittyBlindfold",
	Folder: "Blindfold",
	TopLevel: false,
	Restraint: true,
	Parent: "BlindfoldLeather",
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Filters: {
		Blindfold: {"gamma":0.9833333333333333,"saturation":1,"contrast":0.8,"brightness":3.1,"red":1,"green":1,"blue":1,"alpha":1},
		KittyEyes: {"gamma":1,"saturation":1,"contrast":0.55,"brightness":1.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("BlindfoldLeather"),
		{ Name: "KittyEyes", Layer: "Blindfold", Pri: 2.1,
			Invariant: true,
			TieToLayer: "LeatherBase",
			NoOverride: true,
		},
	])
});


AddModel(GetModelFashionVersion("BlindfoldLeather", true));
AddModel(GetModelFashionVersion("KittyBlindfold", true));
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

AddModel(GetModelFashionVersion("BlindfoldTape", true));