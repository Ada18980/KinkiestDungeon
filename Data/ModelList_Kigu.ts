/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "KiguMask",
	Folder: "Kigu",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Accessories"],
	AddPose: ["FaceCoverGag", "Hooded"],
	AddPoseConditional: {
		Xray: ["HoodMask",],
	},
	HideLayers: [
		"Brows", // Brows should get hidden with mask
		"MouthProp",
	],
	ImportBodyFilters: true,
	Layers: ToLayerMap([
		{ Name: "Mask", Layer: "Hood", Pri: -10,
			HidePoses: {Xray: true},
			InheritColor: "Head",
			AppendPose: {FaceCoverGag: "", FaceBigGag: "Gag", FaceGag: "Gag"},
		},
		{ Name: "Eyes", Layer: "Hood", Pri: -9.8,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			ImportColorFromCategory: ["Eyes", "Eyes"],
		},
		{ Name: "Eyes2", Layer: "Hood", Pri: -9.8,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			ImportColorFromCategory: ["Eyes", "Eyes2"],
		},
		{ Name: "Lock", Layer: "Hood", Pri: -10.1,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			LockLayer: true,
		},
		{ Name: "EyesWhites", Layer: "Hood", Pri: -9.9,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
		},
		{ Name: "Mouth", Layer: "Hood", Pri: -9.9,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
		},
	])
});


AddModel(GetModelFashionVersion("KiguMask", true));



AddModel({
	Name: "KiguMaskSmile",
	Folder: "Kigu",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Accessories"],
	AddPose: ["FaceCoverGag", "Hooded"],
	AddPoseConditional: {
		Xray: ["HoodMask",],
	},
	HideLayers: [
		"Brows", // Brows should get hidden with mask
		"MouthProp",
	],
	ImportBodyFilters: true,
	Layers: ToLayerMap([
		{ Name: "Mask", Layer: "Hood", Pri: -10,
			HidePoses: {Xray: true},
			InheritColor: "Head",
			AppendPose: {FaceCoverGag: "", FaceBigGag: "Gag", FaceGag: "Gag"},
		},
		{ Name: "Eyes", Layer: "Hood", Pri: -9.8,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			ImportColorFromCategory: ["Eyes", "Eyes"],
		},
		{ Name: "Eyes2", Layer: "Hood", Pri: -9.8,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			ImportColorFromCategory: ["Eyes", "Eyes2"],
		},
		{ Name: "Lock", Layer: "Hood", Pri: -10.1,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			LockLayer: true,
		},
		{ Name: "EyesWhites", Layer: "Hood", Pri: -9.9,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
		},
		{ Name: "MouthSmile", Layer: "Hood", Pri: -9.9,
			NoOverride: true,
			HidePoses: {Xray: true},
			TieToLayer: "Mask",
			OffsetX: 942,
			OffsetY: 200,
		},
	])
});


AddModel(GetModelFashionVersion("KiguMaskSmile", true));
