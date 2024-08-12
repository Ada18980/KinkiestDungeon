/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "LeatherMask",
	Folder: "Hood",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Hoods"],
	AddPose: ["HideEars", "FaceCoverGag", "Hooded"],
	HideLayers: ["Brows"],
	AddPoseConditional: {
		Xray: ["HoodMask",],
	},
	Layers: ToLayerMap([
		{ Name: "Hood", Layer: "Hood", Pri: 50,
			Invariant: true,
		},
		{ Name: "Gag", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "Blindfold", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
		},
	])
});
AddModel(GetModelFashionVersion("LeatherMask", true));


AddModel({
	Name: "LeatherHood",
	Folder: "Hood",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Hoods"],
	AddPose: ["HideEars", "FaceCoverGag", "Hooded"],
	HideLayers: ["HairFront", "HairOver", "Brows", "Ears"],
	AddPoseConditional: {
		Xray: ["HoodMask",],
	},
	Layers: ToLayerMap([
		{ Name: "Hood", Layer: "Hood", Pri: 50,
			Invariant: true,
		},
		{ Name: "Gag", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "Blindfold", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "WolfEars", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
			RequirePoses: {"Wolf": true},
		},
		{ Name: "KittyEars", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
			RequirePoses: {"Kitty": true},
		},
		{ Name: "BunnyEars", Layer: "Hood", Pri: 50.1,
			Invariant: true,
			NoOverride: true,
			RequirePoses: {"Bunny": true},
		},
	])
});
AddModel(GetModelFashionVersion("LeatherHood", true));
