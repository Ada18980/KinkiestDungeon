/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BeltsArms1",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms1", Layer: "BindChest", Pri: 50,
			InheritColor: "Belt",
			Invariant: true,
		},
		{ Name: "LeftArm1", Layer: "BindArmLeft", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
		{ Name: "RightArm1", Layer: "BindArmRight", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
	])
});
AddModel({
	Name: "BeltsArms2",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms2", Layer: "StrapsUnderbust", Pri: 60,
			InheritColor: "Belt",
			Invariant: true,
		},
		{ Name: "LeftArm2", Layer: "BindArmLeft", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
		{ Name: "RightArm2", Layer: "BindArmRight", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
	])
});

AddModel({
	Name: "BeltsArmsAll",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("BeltsArms1"),
		...GetModelLayers("BeltsArms2"),
	])
});




AddModel({
	Name: "BeltsLegs1",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legs1", Layer: "Thighs", Pri: 60,
			Poses: ToMapSubtract([...LEGPOSES], ["Spread"]),
			InheritColor: "Belt",
		},
		{ Name: "RightLegs1", Layer: "BindThighRight", Pri: 60,
			Poses: ToMap(["Kneel", "KneelClosed"]),
			InheritColor: "Belt",
		},
	])
});
AddModel({
	Name: "BeltsLegs2",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legs2", Layer: "Thighs", Pri: 60,
			Poses: ToMapSubtract([...LEGPOSES], ["Spread"]),
			InheritColor: "Belt",
		},
		{ Name: "RightLegs2", Layer: "BindThighRight", Pri: 60,
			Poses: ToMap(["Kneel", "KneelClosed"]),
			InheritColor: "Belt",
		},
	])
});

AddModel({
	Name: "BeltsLegsAll",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("BeltsLegs1"),
		...GetModelLayers("BeltsLegs2"),
	])
});


AddModel({
	Name: "BeltsFeet1",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Feet1", Layer: "AnklesOver", Pri: 60,
			Poses: ToMap([...CLOSEDPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Belt",
		},
	])
});
AddModel({
	Name: "BeltsFeet2",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Feet2", Layer: "AnklesOver", Pri: 60,
			Poses: ToMap([...CLOSEDPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Belt",
		},
	])
});

AddModel({
	Name: "BeltsFeetAll",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("BeltsFeet1"),
		...GetModelLayers("BeltsFeet2"),
	])
});


AddModel({
	Name: "Belt",
	Folder: "Belts",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "HarnessMid", Pri: 50,
			Invariant: true,
			InheritColor: "Belt",
		},
	])
});