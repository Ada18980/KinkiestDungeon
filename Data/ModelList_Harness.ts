/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "HarnessTop",
	Folder: "Harness",
	TopLevel: false,
	Parent: "Harness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	Layers: ToLayerMap([
		{ Name: "BeltsTop", Layer: "BindChest", Pri: -10,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Up"]),
			InheritColor: "Straps",
		},
		{ Name: "HardwareTop", Layer: "BindChest", Pri: -10.1,
			InheritColor: "Hardware",
			TieToLayer: "BeltsTop",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "HarnessMid",
	Folder: "Harness",
	TopLevel: false,
	Parent: "Harness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	Layers: ToLayerMap([
		{ Name: "BeltsMid", Layer: "HarnessMid", Pri: 10,
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "HardwareMid", Layer: "HarnessMid", Pri: 9.9,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "BeltsMid",
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "HarnessStrap",
	Folder: "Harness",
	TopLevel: false,
	Parent: "Harness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "BeltsStrap", Layer: "HarnessMid", Pri: 10,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Straps",
			MorphPoses: {Closed: "Closed", Hogtie: "Closed"},
		},
		{ Name: "HardwareStrap", Layer: "HarnessMid", Pri: 9.9,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "BeltsStrap",
			NoOverride: true,
		},
	])
});





AddModel({
	Name: "Harness",
	Folder: "Harness",
	TopLevel: true,
	Parent: "Harness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		...GetModelLayers("HarnessTop"),

		{ Name: "BeltsOverbust", Layer: "BindChest", Pri: -10,
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "BeltsUnderbust", Layer: "StrapsUnderbust", Pri: 10,
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "HardwareUnderbustOver", Layer: "BindChest", Pri: -10.1,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "BeltsUnderbust",
			NoOverride: true,
		},
		{ Name: "HardwareUnderbust", Layer: "StrapsUnderbust", Pri: 9.9,
			Invariant: true,
			InheritColor: "Hardware",
			TieToLayer: "BeltsUnderbust",
			NoOverride: true,
		},

		...GetModelLayers("HarnessMid"),
		...GetModelLayers("HarnessStrap"),
	])
});
