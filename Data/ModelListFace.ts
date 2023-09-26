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
	Group: "Eyes",
	Categories: ["Eyes","Face"],
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
	Group: "Brows",
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
	Group: "Blush",
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
	Name: "KjusEyes",
	Folder: "FaceKjus",
	TopLevel: true,
	Protected: true,
	Group: "Eyes",
	Categories: ["Eyes","Face"],
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
	Group: "Brows",
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
	Name: "KjusBlush",
	Folder: "FaceKjus",
	TopLevel: true,
	Protected: true,
	Group: "Blush",
	Categories: ["Face"],
	Layers: ToLayerMap([
		{ Name: "Blush", Layer: "Blush", Pri: 0,
			Sprite: "", // Because pose is called MouthNeutral lol
			Poses: ToMap(BLUSHPOSES),
		},
	])
});



