/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "SleepsackLegbinder",
	Folder: "Sleepsack",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Legbinder", "Sleepsack"],
	Layers: ToLayerMap([
		{ Name: "LegLeft", Layer: "LegbinderLegsOver", Pri: 30,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			HideWhenOverridden: true,
			InheritColor: "Binder",
			DisplaceAmount: 100,
			DisplaceLayers: ToMap(["Legbinder"]),
			DisplacementSprite: "LegbinderSquish",

		},
		{ Name: "LegLowerLeft", Layer: "LegbinderAnklesOver", Pri: 30,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "LegbinderLegsOver", KneelClosed: "LegbinderLegsOver"},
			InheritColor: "Binder",
		},
		{ Name: "LegRight", Layer: "LegbinderLegsOver", Pri: 30,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			TieToLayer: "LegLeft",
			InheritColor: "Binder",

		},
		{ Name: "LegLowerRight", Layer: "LegbinderAnklesOver", Pri: 30,
			SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			TieToLayer: "LegLowerLeft",
			InheritColor: "Binder",

		},

		// belts
		
		{ Name: "LegLeftBelts", Layer: "LegbinderLegsOver", Pri: 30.1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			HideWhenOverridden: true,
			InheritColor: "Straps",
			TieToLayer: "LegLeft",
			NoOverride: true,

		},
		{ Name: "LegLowerLeftBelts", Layer: "LegbinderAnklesOver", Pri: 30.1,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "LegbinderLegsOver", KneelClosed: "LegbinderLegsOver"},
			InheritColor: "Straps",
			TieToLayer: "LegLowerLeft",
			NoOverride: true,
		},
		{ Name: "LegRightBelts", Layer: "LegbinderLegsOver", Pri: 30.1,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Straps",
			TieToLayer: "LegLeft",
			NoOverride: true,

		},
		{ Name: "LegLowerRightBelts", Layer: "LegbinderAnklesOver", Pri: 30.1,
			SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			InheritColor: "Straps",
			TieToLayer: "LegLowerLeft",
			NoOverride: true,

		},
		// hw
		
		{ Name: "LegLeftMetal", Layer: "LegbinderLegsOver", Pri: 30.2,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			HideWhenOverridden: true,
			InheritColor: "Hardware",
			TieToLayer: "LegLeft",
			NoOverride: true,

		},
		{ Name: "LegLowerLeftMetal", Layer: "LegbinderAnklesOver", Pri: 30.2,
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "LegbinderLegsOver", KneelClosed: "LegbinderLegsOver"},
			InheritColor: "Hardware",
			TieToLayer: "LegLowerLeft",
			NoOverride: true,
		},
		{ Name: "LegRightMetal", Layer: "LegbinderLegsOver", Pri: 30.2,
			//SwapLayerPose: {Kneel: "WrappingLegsRightOver", KneelClosed: "WrappingLegsRightOver"},
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Hardware",
			TieToLayer: "LegLeft",
			NoOverride: true,

		},
		{ Name: "LegLowerRightMetal", Layer: "LegbinderAnklesOver", Pri: 30.2,
			SwapLayerPose: {Kneel: "WrappingLegsRight", KneelClosed: "WrappingLegsRight"},
			Poses: ToMap(LEGPOSES),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			InheritColor: "Hardware",
			TieToLayer: "LegLowerLeft",
			NoOverride: true,

		},
	])
});
