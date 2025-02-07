/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "YukataWaist",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "Waist", Layer: "Bustier", Pri: -1,
			Invariant: true,
			InheritColor: "Waistband",
		},
		{ Name: "WaistBand", Layer: "Bustier", Pri: 70.1,
			Invariant: true,
			NoOverride: true,
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
			InheritColor: "WaistbandBelts",
		},
	])
});

AddModel({
	Name: "YukataWaistPattern",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Corsets"],
	Layers: ToLayerMap([
		{ Name: "WaistPattern", Layer: "Bustier", Pri: -1,
			Invariant: true,
			InheritColor: "Waistband",
		},
		{ Name: "WaistBand", Layer: "Bustier", Pri: 70.1,
			Invariant: true,
			NoOverride: true,
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["CorsetTorso"]),
			DisplacementSprite: "CorsetSquish",
			DisplacementInvariant: true,
			InheritColor: "WaistbandBelts",
		},
	])
});




AddModel({
	Name: "YukataTop",
	Folder: "Yukata",
	Parent: "YukataShirt",
	TopLevel: false,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "Shirt", Layer: "Shirt", Pri: 24,
			InheritColor: "Top",
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel",},
		},
		{ Name: "ShirtChest", Layer: "ShirtChest", Pri: 34,
			InheritColor: "Top",
			Poses: ToMap([...ARMPOSES]),
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			Invariant: true,
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			AppendPose: {Chesttied: "Chesttied"},
		},
	])
});


AddModel({
	Name: "YukataSleeveLeft",
	Folder: "Yukata",
	Parent: "YukataSleeves",
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
	])
});
AddModel({
	Name: "YukataSleeveRight",
	Folder: "Yukata",
	Parent: "YukataSleeves",
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		{ Name: "SleeveRight", Layer: "SleeveRight", Pri: 40,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			HideWhenOverridden: true,
			SwapLayerPose: {Up: "UpSleeveRight"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},

	])
});



AddModel({
	Name: "YukataSleeves",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("YukataSleeveLeft"),
		...GetModelLayers("YukataSleeveRight"),
	])
});

AddModel({
	Name: "YukataShirt",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		...GetModelLayers("YukataTop"),
		...GetModelLayers("YukataSleeves"),
	])
});


AddModel({
	Name: "YukataSkirt",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 9,
			//swaplayerpose: {Kneel: "SkirtOverLower", KneelClosed: "SkirtOverLower"},
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			//HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Closed", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
			HidePoses: {"SkimpyLower": true},
		},
		{ Name: "SkirtOver", Layer: "SkirtOver", Pri: 9,
			Poses: ToMap([...KNEELPOSES]),
			TieToLayer: "Skirt",
			NoOverride: true,
			AppendPose: ToMapDupe(["CrotchStrap"]),
			InheritColor: "Skirt",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//Invariant: true,
		},
	])
});

AddModel({
	Name: "Yukata",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("YukataWaist"),
		...GetModelLayers("YukataShirt"),
		...GetModelLayers("YukataSkirt"),

	])
});


AddModel({
	Name: "YukataPattern",
	Folder: "Yukata",
	Parent: "Yukata",
	TopLevel: true,
	Categories: ["Uniforms"],
	Layers: ToLayerMap([
		...GetModelLayers("YukataWaistPattern"),

	])
});
