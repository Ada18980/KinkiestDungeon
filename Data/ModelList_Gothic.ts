/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "GothicSkirt",
	Folder: "Gothic",
	Parent: "GothicSkirt",
	TopLevel: true,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		{ Name: "Skirt", Layer: "Skirt", Pri: 45,
			MorphPoses: {Hogtie: "", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "WaistbandClips", Layer: "Skirt", Pri: 45.1,
			TieToLayer: "Skirt",
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Buttons", Layer: "Skirt", Pri: 45.2,
			TieToLayer: "Skirt",
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Lines", Layer: "Skirt", Pri: 45.4,
			MorphPoses: {Hogtie: "", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			Poses: ToMap([...LEGPOSES]),
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "HemLower", Layer: "Skirt", Pri: 45.2,
			MorphPoses: {Hogtie: "", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			Poses: ToMap([...LEGPOSES]),
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "HemLowerBack", Layer: "SkirtBack", Pri: -45.2,
			AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			Poses: ToMap(["Spread"]),
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
			InheritColor: "HemLower",
		},
		{ Name: "HemUpper", Layer: "Skirt", Pri: 45.2,
			MorphPoses: {Hogtie: "", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			Poses: ToMap([...LEGPOSES]),
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
	])
});

AddModel({
	Name: "GothicSkirtLace",
	Folder: "Gothic",
	Parent: "GothicSkirt",
	TopLevel: false,
	Categories: ["Skirts"],
	AddPoseConditional: {
		EncaseTorsoLower: ["Skirt"]
	},
	Layers: ToLayerMap([
		...GetModelLayers("GothicSkirt"),
		{ Name: "LaceLower", Layer: "Skirt", Pri: 45.3,
			MorphPoses: {Hogtie: "", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			Poses: ToMap([...LEGPOSES]),
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
		{ Name: "LaceUpper", Layer: "Skirt", Pri: 45.3,
			MorphPoses: {Hogtie: "", Closed: "", Kneel: "Kneel", KneelClosed: "Kneel"},
			AppendPose: ToMapDupe(["CrotchStrap"]),
			TieToLayer: "Skirt",
			Poses: ToMap([...LEGPOSES]),
			NoOverride: true,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			Invariant: true,
		},
	])
});