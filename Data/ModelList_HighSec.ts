/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "HighSecBlindfold",
	Folder: "HighSec",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Blindfold", Layer: "Blindfold", Pri: 40,
			Invariant: true,
			InheritColor: "Blindfold",
		},
		{ Name: "BlindfoldStrap", Layer: "Blindfold", Pri: 40.1,
			Invariant: true,
			InheritColor: "Strap",
			TieToLayer: "Blindfold",
			NoOverride: true,
		},
		{ Name: "BlindfoldHarnessUpper", Layer: "BlindfoldStraps", Pri: 40,
			Invariant: true,
			InheritColor: "Harness",
			HideWhenOverridden: true,
		},
		{ Name: "BlindfoldHarnessRivetsUpper", Layer: "BlindfoldStraps", Pri: 40.1,
			Invariant: true,
			InheritColor: "Rivets",
			NoOverride: true,
			TieToLayer: "BlindfoldHarnessUpper",
		},
		{ Name: "BlindfoldHarnessLowerL", Layer: "GagFlatStraps", Pri: 30,
			Invariant: true,
			InheritColor: "HarnessL",
			NoOverride: true,
		},
		{ Name: "BlindfoldHarnessLowerR", Layer: "GagFlatStraps", Pri: 30,
			Invariant: true,
			InheritColor: "HarnessR",
			NoOverride: true,
		},
		{ Name: "BlindfoldHarnessLowerRivetsL", Layer: "GagFlatStraps", Pri: 30.1,
			Invariant: true,
			InheritColor: "RivetsL",
			TieToLayer: "BlindfoldHarnessLowerL",
			NoOverride: true,
		},
		{ Name: "BlindfoldHarnessLowerRivetsR", Layer: "GagFlatStraps", Pri: 30.1,
			Invariant: true,
			InheritColor: "RivetsR",
			TieToLayer: "BlindfoldHarnessLowerR",
			NoOverride: true,
		},
	])
});


AddModel(GetModelFashionVersion("HighSecBlindfold", true));


AddModel({
	Name: "HighSecCollar",
	Folder: "HighSec",
	TopLevel: true,
	Restraint: true,
	Categories: ["Accessories", "Collars"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "NeckCorset", Pri: -25,
			Invariant: true,
			InheritColor: "Band",
			MorphPoses: {UprightHogtie: "", SuspendedHogtie: "", Hogtie: "Hogtie"},
		},
		{ Name: "CollarChest", Layer: "NeckCorset", Pri: -25,
			Invariant: true,
			InheritColor: "Collar",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Front: "Tied", Wristtie: "Tied", Crossed: "Tied",
				Hogtie: "Hogtie"},
		},
		{ Name: "CollarChestRim", Layer: "NeckCorset", Pri: -24.9,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Rim",
			TieToLayer: "CollarChest",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Front: "Tied", Wristtie: "Tied", Crossed: "Tied",
				Hogtie: "Hogtie"},
		},
		{ Name: "CollarChestHardware", Layer: "NeckCorset", Pri: -24.8,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Ring",
			TieToLayer: "CollarChest",
		},
		{ Name: "CollarChestStraps", Layer: "NeckCorset", Pri: -24.8,
			Invariant: true,
			NoOverride: true,
			InheritColor: "Straps",
			TieToLayer: "CollarChest",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Front: "Tied", Wristtie: "Tied", Crossed: "Tied",
				Hogtie: "Hogtie"},
		},
		{ Name: "CollarChestStrapsHardware", Layer: "NeckCorset", Pri: -24.7,
			Invariant: true,
			NoOverride: true,
			InheritColor: "StrapsHardware",
			TieToLayer: "CollarChest",
			MorphPoses: {Up: "Up", Boxtie: "Tied", Front: "Tied", Wristtie: "Tied", Crossed: "Tied",
				Hogtie: "Hogtie"},
		},
	])
});


AddModel(GetModelFashionVersion("HighSecCollar", true));


