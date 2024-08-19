/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "SailorCollar",
	Folder: "Sailor",
	Parent: "Sailor",
	TopLevel: true,
	Categories: ["Accessories"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{
			Name: "Collar", Layer: "ShirtCollar", Pri: 10,
			InheritColor: "Collar",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
		},
		{
			Name: "CollarStripe", Layer: "ShirtCollar", Pri: 10.1,
			InheritColor: "CollarStripe",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Collar",
		},
	])
});


AddModel({
	Name: "SailorCollarFull",
	Folder: "Sailor",
	Parent: "SailorCollar",
	TopLevel: false,
	Categories: ["Accessories"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		...GetModelLayers("SailorCollar"),
		{
			Name: "Bust", Layer: "ShirtChest", Pri: -100,
			InheritColor: "Bust",
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
		},
		{
			Name: "BustStripe", Layer: "ShirtChest", Pri: -99.9,
			InheritColor: "Bust",
			NoOverride: true,
			TieToLayer: "Bust",
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "SailorBow",
	Folder: "Sailor",
	Parent: "Sailor",
	TopLevel: true,
	Categories: ["Accessories"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{
			Name: "Ribbon", Layer: "BustierCollar", Pri: 50,
			InheritColor: "Collar",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["Chest"],
			NoOverride: true,
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "SailorTop",
	Folder: "Sailor",
	Parent: "Sailor",
	TopLevel: false,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		{ Name: "Shirt", Layer: "Shirt", Pri: 5,
			InheritColor: "Shirt",
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel",},
		},
		{ Name: "ShirtChest", Layer: "ShirtChest", Pri: 14,
			InheritColor: "Shirt",
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
	Name: "SailorSleeveLeft",
	Folder: "Sailor",
	Parent: "SailorSleeves",
	Categories: ["Sleeves"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "SleeveLeft", Layer: "SleeveLeft", Pri: -5,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "Sleeves",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			Invariant: true,
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
		},
		{ Name: "HemLeft", Layer: "SleeveLeft", Pri: -4.9,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveHems",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			Invariant: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmLeft"],
			NoOverride: true,
			TieToLayer: "SleeveLeft",
		},
	])
});
AddModel({
	Name: "SailorSleeveRight",
	Folder: "Sailor",
	Parent: "SailorSleeves",
	Categories: ["Tops"],
	Layers: ToLayerMap([
		{ Name: "SleeveRight", Layer: "SleeveRight", Pri: -5,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "Sleeves",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			Invariant: true,
			SwapLayerPose: {Up: "UpSleeveRight"},
			HideWhenOverridden: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
		},
		{ Name: "HemRight", Layer: "SleeveRight", Pri: -4.9,
			Poses: ToMap([...ARMPOSES]),
			InheritColor: "SleeveHems",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Wristtie: "Tied", Crossed: "Tied", Front: "Tied", Yoked: "Yoked",},
			Invariant: true,
			SwapLayerPose: {Up: "UpSleeveRight"},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["ArmRight"],
			NoOverride: true,
			TieToLayer: "SleeveRight",
		},
	])
});


AddModel({
	Name: "SailorSleeves",
	Folder: "Sailor",
	Parent: "Sailor",
	TopLevel: true,
	Categories: ["Sleeves"],
	Layers: ToLayerMap([
		...GetModelLayers("SailorSleeveLeft"),
		...GetModelLayers("SailorSleeveRight"),
	])
});

AddModel({
	Name: "SailorShirt",
	Folder: "Sailor",
	Parent: "Sailor",
	TopLevel: true,
	Categories: ["Tops"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		...GetModelLayers("SailorSleeves"),
		...GetModelLayers("SailorTop"),
	])
});

AddModel({
	Name: "Sailor",
	Folder: "Sailor",
	Parent: "Sailor",
	TopLevel: true,
	Categories: ["Uniforms"],
	RemovePoses: ["EncaseTorsoUpper"],
	Layers: ToLayerMap([
		...GetModelLayers("SailorSleeves"),
		...GetModelLayers("SailorTop"),
		...GetModelLayers("SailorCollarFull"),
		...GetModelLayers("SailorBow"),

	])
});
