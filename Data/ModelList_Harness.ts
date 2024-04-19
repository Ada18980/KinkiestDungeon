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
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Straps",
			MorphPoses: {Closed: "Closed", Hogtie: "Closed"},
		},
		{ Name: "HardwareStrap", Layer: "HarnessMid", Pri: 9.9,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
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



AddModel(GetModelFashionVersion("HarnessTop", true));
AddModel(GetModelFashionVersion("HarnessMid", true));
AddModel(GetModelFashionVersion("HarnessStrap", true));
AddModel(GetModelFashionVersion("Harness", true));


AddModel({
	Name: "FutureHarnessChest",
	Folder: "FutureHarness",
	TopLevel: false,
	Parent: "FutureHarness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Leather"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		{ Name: "StrapsChest", Layer: "BindChest", Pri: 60,
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "DisplayChest", Layer: "BindChest", Pri: 60.2,
			Invariant: true,
			InheritColor: "Display",
			TieToLayer: "StrapsChest",
			NoOverride: true,
		},
		{ Name: "LockChest", Layer: "BindChest", Pri: 60.3,
			Invariant: true,
			InheritColor: "Lock",
			TieToLayer: "StrapsChest",
			NoOverride: true,
			LockLayer: true,
		},
		{ Name: "MetalChest", Layer: "BindChest", Pri: 60.1,
			Invariant: true,
			InheritColor: "Metal",
			TieToLayer: "StrapsChest",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "FutureHarnessMid",
	Parent: "FutureHarness",
	TopLevel: false,
	Folder: "FutureHarness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Metal"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		{ Name: "StrapsMid", Layer: "HarnessMid", Pri: 60,
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "DisplayMid", Layer: "HarnessMid", Pri: 60.2,
			Invariant: true,
			InheritColor: "Display",
			TieToLayer: "StrapsMid",
			NoOverride: true,
		},
		{ Name: "LockMid", Layer: "HarnessMid", Pri: 60.3,
			Invariant: true,
			InheritColor: "Lock",
			TieToLayer: "StrapsMid",
			NoOverride: true,
			LockLayer: true,
		},
		{ Name: "MetalMid", Layer: "HarnessMid", Pri: 60.1,
			Invariant: true,
			InheritColor: "Metal",
			TieToLayer: "StrapsMid",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "FutureHarnessLower",
	Parent: "FutureHarness",
	TopLevel: false,
	Folder: "FutureHarness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Metal"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		{ Name: "StrapsLower", Layer: "HarnessMid", Pri: 59,
		//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Straps",
		},
		{ Name: "DisplayLower", Layer: "HarnessMid", Pri: 59.2,
		//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Display",
			TieToLayer: "StrapsMid",
			NoOverride: true,
		},
		{ Name: "LockLower", Layer: "HarnessMid", Pri: 59.3,
			//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Lock",
			TieToLayer: "StrapsMid",
			NoOverride: true,
			LockLayer: true,
		},
		{ Name: "MetalLower", Layer: "HarnessMid", Pri: 59.1,
		//SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Metal",
			TieToLayer: "StrapsMid",
			NoOverride: true,
		},
	])
});




AddModel({
	Name: "FutureHarness",
	Folder: "FutureHarness",
	TopLevel: true,
	Parent: "FutureHarness",
	Restraint: true,
	Categories: ["Restraints", "Harness", "Metal"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		...GetModelLayers("FutureHarnessLower"),
		...GetModelLayers("FutureHarnessMid"),
		...GetModelLayers("FutureHarnessChest"),
	])
});



AddModel(GetModelFashionVersion("FutureHarnessLower", true));
AddModel(GetModelFashionVersion("FutureHarnessMid", true));
AddModel(GetModelFashionVersion("FutureHarnessChest", true));
AddModel(GetModelFashionVersion("FutureHarness", true));