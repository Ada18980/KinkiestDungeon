/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "DivineGag",
	Folder: "DivineGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceBigGag", "StuffMouth", "HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 50,
			Invariant: true,
			InheritColor: "Ball",
		},
		{ Name: "Teeth", Layer: "Gag", Pri: 50.1,
			Invariant: true,
			NoColorize: true,
			TieToLayer: "Ball",
		},
		{ Name: "Harness", Layer: "GagStraps", Pri: 50,
			Invariant: true,
			InheritColor: "Harness",
		},
		{ Name: "Gold", Layer: "GagStraps", Pri: 50.2,
			Invariant: true,
			InheritColor: "Clips",
		},
		{ Name: "Metallic", Layer: "GagStraps", Pri: 50.1,
			Invariant: true,
			InheritColor: "Hardware",
		},
	])
});
AddModel(GetModelFashionVersion("DivineGag", true));


AddModel({
	Name: "DivineGagClean",
	Folder: "DivineGag",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceBigGag", "StuffMouth", "HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 50,
			Invariant: true,
			InheritColor: "Ball",
		},
		{ Name: "Teeth", Layer: "Gag", Pri: 50.1,
			Invariant: true,
			NoColorize: true,
			TieToLayer: "Ball",
		},
		{ Name: "Harness", Layer: "GagStraps", Pri: 50,
			Invariant: true,
			InheritColor: "Harness",
		},
		{ Name: "GoldClean", Layer: "GagStraps", Pri: 50.2,
			Invariant: true,
			InheritColor: "Clips",
		},
		{ Name: "Metallic", Layer: "GagStraps", Pri: 50.1,
			Invariant: true,
			InheritColor: "Hardware",
		},
	])
});
AddModel(GetModelFashionVersion("DivineGagClean", false));




AddModel({
	Name: "DivineMuzzle",
	Folder: "DivineGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Muzzle", Layer: "GagMuzzle", Pri: 50,
			Invariant: true,
			InheritColor: "Muzzle",
		},
		{ Name: "MuzzleRim", Layer: "GagMuzzle", Pri: 50.1,
			Invariant: true,
			InheritColor: "Rim",
			TieToLayer: "Muzzle",
		},
		{ Name: "MuzzleGold", Layer: "GagMuzzle", Pri: 50.2,
			Invariant: true,
			InheritColor: "Clips",
		},
		{ Name: "MuzzleHarness", Layer: "GagStrapsUnder", Pri: 50,
			Invariant: true,
			InheritColor: "Harness",
		},
		{ Name: "MuzzleCollar", Layer: "Collar", Pri: -50,
			Invariant: true,
			InheritColor: "Collar",
		},
	])
});
AddModel(GetModelFashionVersion("DivineMuzzle", true));


AddModel({
	Name: "DivineMuzzleClean",
	Folder: "DivineGag",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceBigGag", "StuffMouth"],
	Layers: ToLayerMap([
		{ Name: "Muzzle", Layer: "GagMuzzle", Pri: 50,
			Invariant: true,
			InheritColor: "Muzzle",
		},
		{ Name: "MuzzleRim", Layer: "GagMuzzle", Pri: 50.1,
			Invariant: true,
			InheritColor: "Rim",
			TieToLayer: "Muzzle",
		},
		{ Name: "MuzzleGoldClean", Layer: "GagMuzzle", Pri: 50.2,
			Invariant: true,
			InheritColor: "Clips",
		},
		{ Name: "MuzzleHarness", Layer: "GagStrapsUnder", Pri: 50,
			Invariant: true,
			InheritColor: "Harness",
		},
		{ Name: "MuzzleCollar", Layer: "Collar", Pri: -50,
			Invariant: true,
			InheritColor: "Collar",
		},
	])
});
AddModel(GetModelFashionVersion("DivineMuzzleClean", false));
