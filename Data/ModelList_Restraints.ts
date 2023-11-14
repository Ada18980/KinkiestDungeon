/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */




AddModel({
	Name: "StardustCollar",
	Folder: "Warrior",
	Parent: "Dragonheart",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 50,
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "SteelYoke",
	Folder: "Yoke",
	Parent: "Yoke",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Metal", "Yokes"],
	AddPose: ["Yokes"],
	Layers: ToLayerMap([
		{ Name: "Steel", Layer: "Yoke", Pri: 10,
			Invariant: true,
			HideWhenOverridden: true,
			DisplacementSprite: "Yoke",
			DisplaceLayers: ToMap(["Yoke"]),
			DisplaceAmount: 40,
		},
		{ Name: "SteelBar", Layer: "Yoke", Pri: 10.1,
			Invariant: true,
			HideWhenOverridden: true,
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "SmoothArmbinder",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		{ Name: "BinderLeft", Layer: "BindArmLeft", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Binder",
			DisplacementSprite: "BinderLeft",
			DisplaceLayers: ToMap(["Arms"]),
			DisplaceAmount: 100,
		},
		{ Name: "BinderRight", Layer: "BindArmRight", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Boxtie", "Wristtie"]),
			InheritColor: "Binder",
			DisplacementSprite: "BinderRight",
			DisplaceLayers: ToMap(["Arms"]),
			DisplaceAmount: 100,
		},
	])
});



AddModel({
	Name: "Armbinder",
	Folder: "Armbinder",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather", "Armbinders"],
	AddPose: ["HideHands"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "StrapsLeft", Layer: "BindArmLeft", Pri: 31,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			NoOverride: true,
			InheritColor: "BinderStraps",
		},
		{ Name: "StrapsRight", Layer: "BindArmRight", Pri: 31,
			HideWhenOverridden: true,
			Poses: ToMap(["Boxtie"]),
			NoOverride: true,
			InheritColor: "BinderStraps",
		},
	])
});



AddModel({
	Name: "ArmbinderCross",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "Cross", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "SmoothArmbinderCross",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Cross", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "ArmbinderSecure",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "Secure", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "SmoothArmbinderSecure",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Secure", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "ArmbinderGwen",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "Gwen", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});


AddModel({
	Name: "SmoothArmbinderGwen",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Armbinders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Gwen", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});


