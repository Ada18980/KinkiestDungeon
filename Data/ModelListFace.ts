/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */
AddModel({
	Name: "KoiEyes",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});

AddModel({
	Name: "HumanEyes",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "Human", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "Human", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});
AddModel({
	Name: "BlankEyes",
	Folder: "FaceKoiBlank",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});

AddModel({
	Name: "KoiBrows",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	//Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Brows", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(BROWPOSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
		{ Name: "Brows2", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(BROW2POSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
	])
});
AddModel({
	Name: "DaiBrows1",
	Folder: "EyesDai1",
	TopLevel: true,
	Protected: true,
	//Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Brows", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROWPOSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
		{ Name: "Brows2", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROW2POSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
	])
});
AddModel({
	Name: "DaiBrows2",
	Folder: "EyesDai2",
	TopLevel: true,
	Protected: true,
	//Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Brows", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROWPOSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
		{ Name: "Brows2", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROW2POSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
	])
});

AddModel({
	Name: "Glabella",
	Folder: "EyesDai1",
	TopLevel: true,
	Protected: true,
	//Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Ridge", Layer: "Brows", Pri: 0,
			Poses: ToMap(["Brows2Angry", "BrowsAngry", "Brows2Sad", "BrowsSad"]),
			MorphPoses: {
				Brows2Angry: "Angry",
				BrowsAngry: "Angry",
				Brows2Sad: "Sad",
				BrowsSad: "Sad",
			},
			HidePoses: ToMap(["EncaseHead"]),
		},
	])
});

AddModel({
	Name: "Mascara",
	Folder: "Wolfgirl",
	TopLevel: true,
	Protected: true,
	Categories: ["Makeup","Face"],
	Layers: ToLayerMap([
		{ Name: "MascaraL", Layer: "Head", Pri: 5,
			Invariant: true,
			HidePoses: ToMap(["EncaseHead"]),
			NoOverride: true,
			OffsetX: 920,
			OffsetY: 50,
		},
		{ Name: "MascaraR", Layer: "Head", Pri: 5,
			Invariant: true,
			HidePoses: ToMap(["EncaseHead"]),
			NoOverride: true,
			OffsetX: 920,
			OffsetY: 50,
		},
	])
});

AddModel({
	Name: "Scar",
	Folder: "Wolfgirl",
	TopLevel: true,
	Protected: true,
	Categories: ["Scar","Face"],
	Layers: ToLayerMap([
		{ Name: "Scar", Layer: "Head", Pri: 10,
			Invariant: true,
			HidePoses: ToMap(["EncaseHead"]),
			NoOverride: true,
			OffsetX: 920,
			OffsetY: 50,
		},
	])
});



AddModel({
	Name: "KoiMouth",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	Group: "Mouth",
	Categories: ["Mouth","Face"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "Mouth", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(MOUTHPOSES),
			HidePoses: ToMap(["HideMouth"]),
		},
	])
});
AddModel({
	Name: "KoiBlush",
	Folder: "FaceKoi",
	TopLevel: true,
	Protected: true,
	//Group: "Blush",
	Categories: ["Face"],
	Layers: ToLayerMap([
		{ Name: "Blush", Layer: "Blush", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(BLUSHPOSES),
		},
	])
});

AddModel({
	Name: "Fear",
	Folder: "Expressions",
	TopLevel: true,
	Protected: true,
	//Group: "Blush",
	Categories: ["Face"],
	Layers: ToLayerMap([
		{ Name: "Fear", Layer: "Fear", Pri: 0,
			Invariant: true,
			RequirePoses: {FearPose: true},
		},
	])
});



AddModel({
	Name: "KjusEyes",
	Folder: "FaceKjus",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});



AddModel({
	Name: "KjusEyes2",
	Folder: "EyesK2",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});

AddModel({
	Name: "KjusEyes3",
	Folder: "EyesK3",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});
AddModel({
	Name: "KjusEyes4",
	Folder: "EyesK4",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "", // Because pose is called EyesNeutral lol
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});


AddModel({
	Name: "KjusBrows",
	Folder: "FaceKjus",
	TopLevel: true,
	Protected: true,
	//Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Brows", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROWPOSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
		{ Name: "Brows2", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROW2POSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
	])
});

AddModel({
	Name: "KjusMouth",
	Folder: "FaceKjus",
	TopLevel: true,
	Protected: true,
	Group: "Mouth",
	Categories: ["Mouth","Face"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "Mouth", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			Poses: ToMap(MOUTHPOSES),
			HidePoses: ToMap(["HideMouth"]),
		},
	])
});

AddModel({
	Name: "FangMouth",
	Folder: "FaceFang",
	TopLevel: true,
	Protected: true,
	Group: "Mouth",
	Categories: ["Mouth","Face"],
	AddPose: ["Fang"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "Mouth", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			Poses: ToMap(MOUTHPOSES),
			HidePoses: ToMap(["HideMouth"]),
		},
	])
});


AddModel({
	Name: "FangMouth_Double",
	Folder: "FaceFang2",
	TopLevel: true,
	Protected: true,
	Group: "Mouth",
	Categories: ["Mouth","Face"],
	AddPose: ["2Fang"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "Mouth", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			Poses: ToMap(MOUTHPOSES),
			HidePoses: ToMap(["HideMouth"]),
		},
	])
});

AddModel({
	Name: "FanglessMouth",
	Folder: "FaceFangless",
	TopLevel: true,
	Protected: true,
	Group: "Mouth",
	Categories: ["Mouth","Face"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "Mouth", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			Poses: ToMap(MOUTHPOSES),
			HidePoses: ToMap(["HideMouth"]),
		},
	])
});
AddModel({
	Name: "KjusBlush",
	Folder: "FaceKjus",
	TopLevel: true,
	Protected: true,
	//Group: "Blush",
	Categories: ["Face"],
	Layers: ToLayerMap([
		{ Name: "Blush", Layer: "Blush", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			Poses: ToMap(BLUSHPOSES),
		},
	])
});

AddModel({
	Name: "DaskBrows",
	Folder: "FaceDask",
	TopLevel: true,
	Protected: true,
	//Group: "Brows",
	Categories: ["Eyes","Face"],
	Layers: ToLayerMap([
		{ Name: "Brows", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROWPOSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
		{ Name: "Brows2", Layer: "Brows", Pri: 0,
			Sprite: "", // Because pose is called BrowsNeutral lol
			Poses: ToMap(BROW2POSES),
			HidePoses: ToMap(["EncaseHead"]),
		},
	])
});

AddModel({
	Name: "DaskEyes",
	Folder: "FaceDask",
	TopLevel: true,
	Protected: true,
	//Group: "Eyes",
	Categories: ["Eyes","Face"],
	AddPose: ["Eyes"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Eyes", Pri: 0,
			Sprite: "",
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Eyes2", Layer: "Eyes", Pri: 0,
			Sprite: "",
			OffsetX: 942,
			OffsetY: 200,
			Poses: ToMap(EYE2POSES),
		},
		{ Name: "Whites", Layer: "Eyes", Pri: -1,
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYEPOSES),
		},
		{ Name: "Whites2", Layer: "Eyes", Pri: -1,
			Sprite: "Whites",
			OffsetX: 942,
			OffsetY: 200,
			NoColorize: true,
			Poses: ToMap(EYE2POSES),
		},
	])
});




AddModel({
	Name: "ElfEars",
	TopLevel: true,
	Protected: true,
	Categories: ["Body", "Face", "Cosplay"],
	AddPose: ["Cosplay"],
	Folder: "Ears",
	RemovePoses: ["HideEars"],
	Layers: ToLayerMap([
		{ Name: "ElfFront", Layer: "Head", Pri: 0.1,
			NoOverride: true,
			ImportColorFromGroup: ["Body", "Head"],
		},
		{ Name: "ElfBack", Layer: "Head", Pri: -0.1,
			NoOverride: true,
			ImportColorFromGroup: ["Body", "Head"],
		},
	])
});
AddModel({
	Name: "ElfEarsLong",
	Parent: "ElfEars",
	TopLevel: false,
	Protected: true,
	Categories: ["Body", "Face", "Cosplay"],
	AddPose: ["Cosplay"],
	Folder: "Ears",
	RemovePoses: ["HideEars"],
	Layers: ToLayerMap([
		{ Name: "ElfLongFront", Layer: "Head", Pri: 0.1,
			NoOverride: true,
			ImportColorFromGroup: ["Body", "Head"],
		},
		{ Name: "ElfLongBack", Layer: "Head", Pri: -0.1,
			NoOverride: true,
			ImportColorFromGroup: ["Body", "Head"],
		},
	])
});
AddModel({
	Name: "ElfEarsFloppy",
	Parent: "ElfEars",
	TopLevel: false,
	Protected: true,
	Categories: ["Body", "Face", "Cosplay"],
	AddPose: ["Cosplay"],
	Folder: "Ears",
	RemovePoses: ["HideEars"],
	Layers: ToLayerMap([
		{ Name: "ElfFloppyFront", Layer: "Head", Pri: 0.1,
			NoOverride: true,
			ImportColorFromGroup: ["Body", "Head"],
		},
		{ Name: "ElfFloppyBack", Layer: "Head", Pri: -0.1,
			NoOverride: true,
			ImportColorFromGroup: ["Body", "Head"],
		},
	])
});
AddModel({
	Name: "ElfEarrings",
	Parent: "Earrings",
	TopLevel: false,
	Protected: true,
	Categories: ["Face", "Accessories"],
	Folder: "Ears",
	RemovePoses: ["HideEars"],
	Layers: ToLayerMap([
		{ Name: "ElfEarringsFront", Layer: "Head", Pri: 0.2,
			NoOverride: true,
			InheritColor: "EarringLeft",
		},
		{ Name: "ElfEarringsBack", Layer: "Head", Pri: 0,
			NoOverride: true,
			InheritColor: "EarringRight",
		},
	])
});
AddModel({
	Name: "Earrings",
	Parent: "Earrings",
	TopLevel: true,
	Protected: true,
	Categories: ["Face", "Accessories"],
	Folder: "Ears",
	RemovePoses: ["HideEars"],
	Layers: ToLayerMap([
		{ Name: "Earrings", Layer: "Head", Pri: 0.2,
			NoOverride: true,
			InheritColor: "EarringLeft",
		},
		{ Name: "EarringsBack", Layer: "Head", Pri: -0.1,
			NoOverride: true,
			InheritColor: "EarringRight",
		},
	])
});