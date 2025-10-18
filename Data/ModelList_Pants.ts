/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BanditShorts",
	Folder: "Bandit",
	Parent: "Bandit",
	TopLevel: true,
	Categories: ["Pants"],
	AddPose: ["Pants"],
	Layers: ToLayerMap([
		{ Name: "Shorts", Layer: "Shorts", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
		{ Name: "ShortsLeft", Layer: "ShortsLeft", Pri: 7,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: {"KneelClosed": true},
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
			//MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});





AddModel({
	Name: "LeatherShorts",
	Folder: "LeatherPants",
	Parent: "LeatherPants",
	Categories: ["Panties"],
	TopLevel: true,
	Layers: ToLayerMap([
		{ Name: "Shorts", Layer: "Shorts", Pri: 5.1,
			Poses: ToMap([...LEGPOSES]),
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoLower"],
		},
		{ Name: "ShortsBelt", Layer: "Shorts", Pri: 5.15,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Shorts",
			InheritColor: "Belt",
		},
		{ Name: "ShortsBeltButton", Layer: "Shorts", Pri: 5.2,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Shorts",
			InheritColor: "Button",
		},
	])
});



AddModel({
	Name: "LeatherPants",
	Folder: "LeatherPants",
	Parent: "LeatherPants",
	Categories: ["Pants"],
	AddPose: ["Pants", "LongPants"],
	TopLevel: true,
	Layers: ToLayerMap([
		...GetModelLayers("LeatherShorts"),

		
		{ Name: "SockLeft", Layer: "TightPantsLeft", Pri: 5,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingLeft: true,},
			DisplacementSprite: "SockLSquish_Long",
			DisplaceAmount: 10,

		},
		{ Name: "FootSockLeftHogtie", Layer: "TightPantsLeftHogtie", Pri: 5,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "LegLeft",
			Invariant: true,
		},
		{ Name: "SockRight", Layer: "TightPantsRight", Pri: 5,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingRight: true,},
			DisplacementSprite: "SockRSquish_Long",
			DisplaceAmount: 10,

		},
		{ Name: "FootSockRightKneel", Layer: "TightPantsRightKneel", Pri: 5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});