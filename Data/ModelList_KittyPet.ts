/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "KittyPetLeotardUnder",
	Folder: "KittyPet",
	Parent: "KittyPetLeotard",
	TopLevel: false,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "Bodysuit", Pri: 3,
			HideWhenOverridden: true,
			MorphPoses: {Closed: "Closed", Hogtie: "Closed"},
		},
		{ Name: "LeotardStripes", Layer: "Bodysuit", Pri: 3.1,
			NoOverride: true,
			TieToLayer: "Leotard",
			InheritColor: "Stripes",
		},
		{ Name: "LeotardChest", Layer: "SuitChest", Pri: 3,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			HideWhenOverridden: true,
			InheritColor: "LeotardUpper",
			MorphPoses: {Boxtie: "Tied", Front: "Tied", Crossed: "Tied", Wristtie: "Tied", Up: "Up",},
		},
		{ Name: "LeotardChestStripes", Layer: "SuitChest", Pri: 3.1,
			NoOverride: true,
			InheritColor: "StripesUpper",
			TieToLayer: "LeotardChest",
		},
	])
});
AddModel({
	Name: "KittyPetLeotard",
	Folder: "KittyPet",
	Parent: "KittyPetLeotard",
	TopLevel: true,
	Categories: ["Bodysuits"],
	Layers: ToLayerMap([
		{ Name: "Leotard", Layer: "BodysuitOver", Pri: 3,
			HideWhenOverridden: true,
			MorphPoses: {Closed: "Closed", Hogtie: "Closed"},
		},
		{ Name: "LeotardStripes", Layer: "BodysuitOver", Pri: 3.1,
			NoOverride: true,
			TieToLayer: "Leotard",
			InheritColor: "Stripes",
		},
		{ Name: "LeotardChest", Layer: "SuitChestOver", Pri: 3,
			HidePrefixPose: ["Encase"],	HidePrefixPoseSuffix: ["TorsoUpper"],
			MorphPoses: {Boxtie: "Tied", Front: "Tied", Crossed: "Tied", Wristtie: "Tied", Up: "Up",},
			HideWhenOverridden: true,
			InheritColor: "LeotardUpper",
		},
		{ Name: "LeotardChestStripes", Layer: "SuitChestOver", Pri: 3.1,
			NoOverride: true,
			InheritColor: "StripesUpper",
			TieToLayer: "LeotardChest",
		},
	])
});

AddModel(GetModelRestraintVersion("KittyPetLeotard", true));


AddModel({
	Name: "KittyPetUniformCollar",
	Folder: "KittyPet",
	Parent: "KittyPetLeotard",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "LeotardChestCollar", Layer: "BustierCollar", Pri: 25,
			HideWhenOverridden: true,
			NoOverride: true,
			InheritColor: "CollarRight",
			MorphPoses: {Up: "Up",},
		},
		{ Name: "LeotardChestCollarLeft", Layer: "BustierCollar", Pri: 25,
			NoOverride: true,
			InheritColor: "CollarLeft",
			TieToLayer: "LeotardChestCollar",
			MorphPoses: {Boxtie: "Tied", Front: "Tied", Crossed: "Tied", Wristtie: "Tied", Up: "Tied",},
		},
		{ Name: "LeotardChestCollarStripes", Layer: "BustierCollar", Pri: 25.1,
			NoOverride: true,
			InheritColor: "StripesRight",
			TieToLayer: "LeotardChestCollar",
			MorphPoses: { Up: "Up",},
		},
		{ Name: "LeotardChestCollarStripesLeft", Layer: "BustierCollar", Pri: 25.1,
			NoOverride: true,
			InheritColor: "StripesLeft",
			TieToLayer: "LeotardChestCollarLeft",
			MorphPoses: {Boxtie: "Tied", Front: "Tied", Crossed: "Tied", Wristtie: "Tied", Up: "Tied",},
		},


		{ Name: "CollarDeco", Layer: "BindChest", Pri: -40,
			InheritColor: "Tag",
			HideWhenOverridden: true,
		},
		{ Name: "CollarDecoSymbol", Layer: "BindChest", Pri: -39.1,
			InheritColor: "Symbol",
			TieToLayer: "CollarDeco",
			NoOverride: true,
		},


		{ Name: "ShoulderCuffLeft", Layer: "SuitChestOver", Pri: 2.8,
			NoOverride: true,
			InheritColor: "LeftShoulder",
			TieToLayer: "LeotardChestCollarLeft",
		},
		{ Name: "ShoulderCuffStripeLeft", Layer: "SuitChestOver", Pri: 2.9,
			NoOverride: true,
			InheritColor: "LeftShoulderStripe",
			TieToLayer: "ShoulderCuffLeft",
		},
		{ Name: "ShoulderCuffRight", Layer: "SuitChestOver", Pri: 2.8,
			NoOverride: true,
			InheritColor: "RightShoulder",
			TieToLayer: "LeotardChestCollar",
		},
		{ Name: "ShoulderCuffStripeRight", Layer: "SuitChestOver", Pri: 2.9,
			NoOverride: true,
			InheritColor: "RightShoulderStripe",
			TieToLayer: "LeotardChestCollar",
		},
	])
});



AddModel({
	Name: "KittyPetTail",
	Folder: "KittyPet",
	Parent: "KittyPet",
	TopLevel: true,
	Protected: true,
	Categories: ["Tails", "Kitty", "Cosplay"],
	AddPose: ["Tails", "Kitty", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Tail", Layer: "Tail", Pri: 5,
			Invariant: true,
			InheritColor: "Tail",
			NoOverride: true,
		},
		{ Name: "TailStripe", Layer: "Tail", Pri: 5.1,
			Invariant: true,
			InheritColor: "Stripe",
			TieToLayer: "Tail",
			NoOverride: true,
		},
	])
});


AddModel({
	Name: "KittyPetBlindfold",
	Folder: "KittyPet",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "BlindfoldRim", Layer: "Blindfold", Pri: 40,
			Invariant: true,
			InheritColor: "Rim",
		},
		{ Name: "Blindfold", Layer: "Blindfold", Pri: 40.1,
			Invariant: true,
			TieToLayer: "BlindfoldRim",
		},
		{ Name: "BlindfoldBrow", Layer: "Blindfold", Pri: 40.2,
			Invariant: true,
			TieToLayer: "BlindfoldRim",
			InheritColor: "Brows",
		},
	])
});


AddModel(GetModelFashionVersion("KittyPetBlindfold", true));


AddModel({
	Name: "KittyPetSteelCollar",
	Folder: "KittyPet",
	Parent: "KittyPetLeotard",
	TopLevel: true,
	Categories: ["Restraints", "Collars", "Accessories"],
	Filters: {
		Stripe: {"gamma":1,"saturation":0,"contrast":1.59,"brightness":1,"red":1.2352941176470589,"green":0.7058823529411765,"blue":1.1176470588235294,"alpha":1},
	},
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: -10,
			InheritColor: "BaseMetal",
		},
		{ Name: "CollarStripe", Layer: "Collar", Pri: -9.9,
			InheritColor: "Stripe",
			TieToLayer: "Collar",
			NoOverride: true,
		},
	])
});

AddModel(GetModelFashionVersion("KittyPetSteelCollar", true));



AddModel({
	Name: "KittyPetMittenLeft",
	Folder: "KittyPetPaws",
	Parent: "KittyPetPaws",
	Categories: ["Mittens", "Restraints"],
	Layers: ToLayerMap([
		{ Name: "GloveLeft", Layer: "MittenLeft", Pri: -1,
			Poses: ToMap([...ARMPOSES]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Mitten",
			EraseSprite: "MittL",
			EraseLayers: ToMap(["MittL"]),
		},
		{ Name: "GloveLeftPaw", Layer: "MittenLeft", Pri: -0.9,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Crossed", "Up"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			NoOverride: true,
			TieToLayer: "GloveLeft",
		},
		{ Name: "ForeGloveLeft", Layer: "ForeMittenLeft", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveLeft",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
			EraseSprite: "MittL",
			EraseLayers: ToMap(["MittL"]),
		},
		{ Name: "ForeGloveLeftPaw", Layer: "ForeMittenLeft", Pri: -0.9,
			Poses: ToMapSubtract([...FOREARMPOSES], ["Crossed"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "GloveLeft",
			SwapLayerPose: {Crossed: "CrossGloveLeft"},
			NoOverride: true,
			TieToLayer: "ForeGloveLeft",
		},
		...GetModelLayers("KittyPawCuffsWristLeft",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
		...GetModelLayers("KittyPawCuffsElbowLeft",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
	])
});

AddModel({
	Name: "KittyPetMittenRight",
	Folder: "KittyPetPaws",
	Parent: "KittyPetPaws",
	Categories: ["Mittens", "Restraints"],
	Layers: ToLayerMap([
		{ Name: "GloveRight", Layer: "MittenRight", Pri: -1,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			EraseSprite: "MittR",
			EraseLayers: ToMap(["MittR"]),
		},
		{ Name: "GloveRightPaw", Layer: "MittenRight", Pri: -0.9,
			Poses: ToMapSubtract([...ARMPOSES], ["Wristtie", "Boxtie", "Crossed", "Up"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			NoOverride: true,
			TieToLayer: "GloveRight",
		},
		{ Name: "ForeGloveRight", Layer: "ForeMittenRight", Pri: -1,
			Poses: ToMap([...FOREARMPOSES]),
			InheritColor: "GloveRight",
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			SwapLayerPose: {Crossed: "CrossGloveRight"},
			EraseSprite: "MittR",
			EraseLayers: ToMap(["MittR"]),
		},
		{ Name: "ForeGloveRightPaw", Layer: "ForeMittenRight", Pri: -0.9,
			Poses: ToMapSubtract([...FOREARMPOSES], ["Crossed"]),
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "GloveRight",
			SwapLayerPose: {Crossed: "CrossGloveRight"},
			NoOverride: true,
			TieToLayer: "ForeGloveRight",
		},
		...GetModelLayers("KittyPawCuffsWristRight",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
		...GetModelLayers("KittyPawCuffsElbowRight",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),


	])
});

AddModel({
	Name: "KittyPetMittens",
	Folder: "KittyPetPaws",
	Parent: "KittyPetLeotard",
	TopLevel: true,
	Categories: ["Mittens", "Restraints"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetMittenLeft"),
		...GetModelLayers("KittyPetMittenRight"),
	])
});

AddModel(GetModelFashionVersion("KittyPetMittenLeft", true));
AddModel(GetModelFashionVersion("KittyPetMittenRight", true));
AddModel(GetModelFashionVersion("KittyPetMittens", true));



AddModel({
	Name: "KittyPetEars1",
	Folder: "KittyPet",
	Parent: "KittyPetEarmuffs",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Ears1L", Layer: "Circlet", Pri: 40,
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Ears1R", Layer: "Circlet", Pri: 40.1,
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Ears1InnerL", Layer: "Circlet", Pri: 40,
			TieToLayer: "Ears1L",
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Ears1InnerR", Layer: "Circlet", Pri: 40.1,
			TieToLayer: "Ears1R",
			NoOverride: true,
			Invariant: true,
		},
	])
});


AddModel({
	Name: "KittyPetEars2",
	Folder: "KittyPet",
	Parent: "KittyPetEarmuffs",
	TopLevel: false,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Ears2L", Layer: "Circlet", Pri: 40,
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Ears2R", Layer: "Circlet", Pri: 40.1,
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Ears2InnerL", Layer: "Circlet", Pri: 40,
			TieToLayer: "Ears2L",
			NoOverride: true,
			Invariant: true,
		},
		{ Name: "Ears2InnerR", Layer: "Circlet", Pri: 40.1,
			TieToLayer: "Ears2R",
			NoOverride: true,
			Invariant: true,
		},
	])
});


AddModel({
	Name: "KittyPetEarmuffs",
	Folder: "KittyPet",
	Parent: "KittyPetEarmuffs",
	TopLevel: true,
	Categories: ["Accessories"],
	Layers: ToLayerMap([
		{ Name: "Band", Layer: "Circlet", Pri: 35,
			HideWhenOverridden: true,
			Invariant: true,
			InheritColor: "Band",
		},
		{ Name: "EarmuffersL", Layer: "Circlet", Pri: 35.1,
			TieToLayer: "Band",
			NoOverride: true,
			Invariant: true,
			InheritColor: "EarmuffL",
		},
		{ Name: "EarmuffersR", Layer: "CircletUnder", Pri: -35,
			NoOverride: true,
			Invariant: true,
			InheritColor: "EarmuffR",
		},
	])
});

AddModel(GetModelRestraintVersion("KittyPetEarmuffs", true));
AddModel(GetModelRestraintVersion("KittyPetEars1", true));
AddModel(GetModelRestraintVersion("KittyPetEars2", true));


AddModel({
	Name: "KittyPetGag",
	Folder: "KittyPet",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Gags","Leather"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "Gag", Layer: "GagMuzzle", Pri: 30,
			InheritColor: "Gag",
		},
		{ Name: "GagCollar", Layer: "NeckCorset", Pri: -50,
			InheritColor: "Collar",
		},
	])
});
AddModel({
	Name: "KittyPetGagSeamless",
	Folder: "KittyPet",
	TopLevel: false,
	Parent: "KittyPetGag",
	Restraint: true,
	Categories: ["Restraints","Gags","Leather"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "GagSeamless", Layer: "GagMuzzle", Pri: 30,
			InheritColor: "Gag",
		},
		{ Name: "GagCollar", Layer: "NeckCorset", Pri: -50,
			InheritColor: "Collar",
		},
	])
});
AddModel({
	Name: "KittyPetGagMouth",
	Folder: "KittyPet",
	TopLevel: false,
	Parent: "KittyPetGag",
	Restraint: true,
	Categories: ["Restraints","Gags","Leather"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "GagMouth", Layer: "GagMuzzle", Pri: 30,
			InheritColor: "Gag",
		},
		{ Name: "GagCollar", Layer: "NeckCorset", Pri: -50,
			InheritColor: "Collar",
		},
	])
});
AddModel({
	Name: "KittyPetGagMouthSeamless",
	Folder: "KittyPet",
	TopLevel: false,
	Parent: "KittyPetGag",
	Restraint: true,
	Categories: ["Restraints","Gags","Leather"],
	AddPose: ["FaceCoverGag"],
	Layers: ToLayerMap([
		{ Name: "GagMouthSeamless", Layer: "GagMuzzle", Pri: 30,
			InheritColor: "Gag",
		},
		{ Name: "GagCollar", Layer: "NeckCorset", Pri: -50,
			InheritColor: "Collar",
		},
	])
});
AddModel(GetModelFashionVersion("KittyPetGag", true));
AddModel(GetModelFashionVersion("KittyPetGagSeamless", true));
AddModel(GetModelFashionVersion("KittyPetGagMouth", true));
AddModel(GetModelFashionVersion("KittyPetGagMouthSeamless", true));
