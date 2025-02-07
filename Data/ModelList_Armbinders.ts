/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "FestiveArmbinder",
	Folder: "Festive",
	Restraint: true,
	TopLevel: true,
	Parent: "SantaHat",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Latex", "Binders"],
	Layers: ToLayerMap([
		{ Name: "BinderLeft", Layer: "BindArmLeft", Pri: 32.1,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Binder",
			DisplacementSprite: "BinderLeft",
			DisplaceLayers: ToMap(["Arms"]),
			DisplaceAmount: 100,
		},
		{ Name: "BinderRight", Layer: "BindArmRight", Pri: 32.1,
			HideWhenOverridden: true,
			Poses: ToMap(["Boxtie", "Wristtie"]),
			InheritColor: "Binder",
			DisplacementSprite: "BinderRight",
			DisplaceLayers: ToMap(["Arms"]),
			DisplaceAmount: 100,
		},
		{ Name: "BinderStrapLeft", Layer: "BindArmLeft", Pri: 32,
			NoOverride: true,
			TieToLayer: "BinderLeft",
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Strap",
		},
		{ Name: "BinderFluffLeft", Layer: "BindArmLeft", Pri: 32,
			NoOverride: true,
			TieToLayer: "BinderLeft",
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Fluff",
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
	Categories: ["Restraints", "Latex", "Binders"],
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
	Categories: ["Restraints", "Leather", "Binders"],
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
	Categories: ["Restraints", "Leather", "Binders"],
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
	Categories: ["Restraints", "Latex", "Binders"],
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
	Categories: ["Restraints", "Leather", "Binders"],
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
	Categories: ["Restraints", "Latex", "Binders"],
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
	Categories: ["Restraints", "Leather", "Binders"],
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
	Categories: ["Restraints", "Latex", "Binders"],
	Layers: ToLayerMap([
		...GetModelLayers("SmoothArmbinder"),
		{ Name: "Gwen", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
		},
	])
});




AddModel({
	Name: "WolfArmbinder",
	Folder: "Armbinder",
	Restraint: true,
	TopLevel: false,
	Parent: "Armbinder",
	AddPose: ["HideHands"],
	Categories: ["Restraints", "Leather", "Binders"],
	Layers: ToLayerMap([
		...GetModelLayers("Armbinder"),
		{ Name: "WolfHarness", Layer: "BindArms", Pri: 30,
			HideWhenOverridden: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
			InheritColor: "Straps",
			Invariant: true,
		},
	])
});