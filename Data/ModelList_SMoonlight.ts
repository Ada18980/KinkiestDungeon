/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "PostureCollarBasic",
	Folder: "SMoonlight",
	Parent: "PostureCollarBasic",
	TopLevel: false,
	Restraint: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "PostureCollar", Layer: "Collar", Pri: -5.1,
			Invariant: true,
			InheritColor: "Band",
		},
		{ Name: "PostureCollarRim", Layer: "Collar", Pri: -5,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rim",
			TieToLayer: "PostureCollar",
		},
	])
});
AddModel({
	Name: "PostureCollar",
	Folder: "SMoonlight",
	Parent: "PostureCollar",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("PostureCollarBasic"),
		{ Name: "PostureCollarLoop", Layer: "Collar", Pri: -5,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Loop",
			TieToLayer: "PostureCollarHardware",
		},
		{ Name: "PostureCollarHardware", Layer: "Collar", Pri: -2,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Hardware",
		},
	])
});
AddModel(GetModelFashionVersion("PostureCollarBasic", true))
AddModel(GetModelFashionVersion("PostureCollar", true))


AddModel({
	Name: "ReverseBinder",
	Folder: "SMoonlight",
	Parent: "ReverseBinder",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "ReversePrayer", "Leather"],
	Layers: ToLayerMap([
		{ Name: "ReverseBinderLeft", Layer: "BindArmLeft", Pri: 90,
			Poses: ToMap(["Wristtie"]),
			HidePoses: ToMap(["WrapArms"]),
			Invariant: true,
			EraseSprite: "ReversePrayer",
			EraseInvariant: true,
			EraseLayers: ToMap(["ArmsAll"]),
			InheritColor: "Binder",
		},
		{ Name: "ReverseBinderRight", Layer: "BindArmRight", Pri: 90,
			Poses: ToMap(["Wristtie"]),
			HidePoses: ToMap(["WrapArms"]),
			Invariant: true,
			InheritColor: "Binder",
		},
		{ Name: "ReverseBinderStraps", Layer: "BindChest", Pri: 3,
			NoOverride: true,
			InheritColor: "Straps",
			HidePoses: ToMap(["WrapArms"]),
			Poses: ToMap(["Wristtie"]),
			Invariant: true,
		},
		{ Name: "ReverseBinderHardware", Layer: "BindChest", Pri: 3.1,
			NoOverride: true,
			InheritColor: "Hardware",
			HidePoses: ToMap(["WrapArms"]),
			Poses: ToMap(["Wristtie"]),
			Invariant: true,
		},
	])
});
