/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "PointyAntennae",
	Folder: "Pointy",
	TopLevel: false, Parent: "ElfEars",
	Protected: true,
	Categories: ["Ears", "Insect", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Insect", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "AnthenaL", Layer: "AnimalEars", Pri: 30,
			Invariant: true,
			InheritColor: "Left",
			OffsetX: 527,
			OffsetY: 80,
		},
		{ Name: "AnthenaR", Layer: "AnimalEars", Pri: 30,
			Invariant: true,
			InheritColor: "Right",
			OffsetX: 527,
			OffsetY: 80,
		},
	])
});
AddModel({
	Name: "PointyHorns",
	Folder: "Pointy",
	TopLevel: false, Parent: "ElfEars",
	Protected: true,
	Categories: ["Ears", "Insect", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Insect", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "HornL", Layer: "AnimalEars", Pri: -50,
			Invariant: true,
			InheritColor: "Left",
			NoOverride: true,
			OffsetX: 527,
			OffsetY: 80,
		},
		{ Name: "HornR", Layer: "AnimalEars", Pri: -50,
			Invariant: true,
			InheritColor: "Right",
			NoOverride: true,
			OffsetX: 527,
			OffsetY: 80,
		},
	])
});


AddModel({
	Name: "PointyTail",
	Folder: "Pointy",
	TopLevel: false, Parent: "WolfTail",
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Cosplay"],
	AddPose: ["Tails", "Insect", "Cosplay"],
	Layers: ToLayerMap([{
				Name: "Tail",
				Layer: "Tail",
				Pri: 30,
				Invariant: true,
				OffsetX: 527,
				OffsetY: 80,
			}
		])
});

AddModel({
	Name: "BunnyEars",
	Folder: "Bunny",
	Parent2: ["Bunny"],
	TopLevel: false, Parent: "ElfEars",
	Protected: true,
	Group: "Ears",
	Categories: ["Ears", "Bunny", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Bunny", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "Ears", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			InheritColor: "Ears",
		},
		{ Name: "EarsInner", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Ears",
			NoOverride: true,
			InheritColor: "InnerEars",
		},
		{ Name: "EarsFront", Layer: "AnimalEarsFront", Pri: 10,
			Invariant: true,
			InheritColor: "EarsFront",
		},
	])
});

AddModel({
	Name: "BunnyEars1",
	Folder: "BunnyEars",
	Parent: "BunnyEars",
	Protected: true,
	Group: "Ears",
	Categories: ["Ears", "Bunny", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Bunny", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "Ear1Right", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			OffsetY: -160,
			InheritColor: "Ears",
		},
		{ Name: "Inner1Right", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Ear1Right",
			NoOverride: true,
			OffsetY: -160,
			InheritColor: "InnerEars",
		},
		{ Name: "Ear1Left", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			OffsetY: -160,
			InheritColor: "Ears",
		},
		{ Name: "Inner1Left", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Ear1Left",
			NoOverride: true,
			OffsetY: -160,
			InheritColor: "InnerEars",
		},
	])
});
AddModel({
	Name: "BunnyEars2",
	Folder: "BunnyEars",
	Parent: "BunnyEars",
	Group: "Ears",
	Protected: true,
	Categories: ["Ears", "Bunny", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Bunny", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "HalfFlopEar1Right", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			OffsetY: -160,
			InheritColor: "Ears",
		},
		{ Name: "HalfFlopInner1Right", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "HalfFlopEar1Right",
			NoOverride: true,
			OffsetY: -160,
			InheritColor: "InnerEars",
		},
		{ Name: "HalfFlopEar1Left", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			OffsetY: -160,
			InheritColor: "Ears",
		},
		{ Name: "HalfFlopInner1Left", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "HalfFlopInner1Left",
			NoOverride: true,
			OffsetY: -160,
			InheritColor: "InnerEars",
		},
	])
});
AddModel({
	Name: "BunnyEars3",
	Folder: "BunnyEars",
	TopLevel: false, Parent: "ElfEars",
	Protected: true,
	Categories: ["Ears", "Bunny", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Bunny", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "FlopEar1Right", Layer: "AnimalEarsFront", Pri: 10,
			Invariant: true,
			OffsetY: -160,
			InheritColor: "Ears",
		},
		{ Name: "FlopEar1RightBG", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "FlopEar1Right",
			NoOverride: true,
			OffsetY: -160,
			InheritColor: "InnerEars",
		},
		{ Name: "FlopEar1Left", Layer: "AnimalEarsMid", Pri: 10,
			Invariant: true,
			OffsetY: -160,
			InheritColor: "Ears",
		},
		{ Name: "FlopInner1Left", Layer: "AnimalEarsMid", Pri: 10.1,
			Invariant: true,
			TieToLayer: "FlopEar1Left",
			NoOverride: true,
			OffsetY: -160,
			InheritColor: "InnerEars",
		},
	])
});

AddModel({
	Name: "MouseEars",
	Folder: "Mouse",
	TopLevel: false, Parent: "ElfEars",
	Group: "Ears",
	Protected: true,
	Categories: ["Ears", "Mouse", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Mouse", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "EarLeftRim", Layer: "AnimalEarsMid", Pri: 5,
			Invariant: true,
			InheritColor: "LeftRim",
			OffsetX: 940,
			OffsetY: 200,
		},
		{ Name: "InnerLeft", Layer: "AnimalEarsMid", Pri: 5.1,
			Invariant: true,
			TieToLayer: "EarLeftRim",
			NoOverride: true,
			InheritColor: "LeftInner",
			OffsetX: 940,
			OffsetY: 200,
		},
		{ Name: "PuffLeft", Layer: "AnimalEarsMid", Pri: 5.2,
			Invariant: true,
			TieToLayer: "EarLeftRim",
			NoOverride: true,
			InheritColor: "LeftPuff",
			OffsetX: 940,
			OffsetY: 200,
		},
		{ Name: "EarRightRim", Layer: "AnimalEars", Pri: 5,
			Invariant: true,
			InheritColor: "RightRim",
			OffsetX: 940,
			OffsetY: 200,
		},
		{ Name: "InnerRight", Layer: "AnimalEars", Pri: 5.1,
			Invariant: true,
			TieToLayer: "EarRightRim",
			NoOverride: true,
			InheritColor: "RightInner",
			OffsetX: 940,
			OffsetY: 200,
		},
		{ Name: "PuffRight", Layer: "AnimalEars", Pri: 5.2,
			Invariant: true,
			TieToLayer: "EarRightRim",
			NoOverride: true,
			InheritColor: "RightPuff",
			OffsetX: 940,
			OffsetY: 200,
		},
	])
});


AddModel({
	Name: "KittyEars",
	Folder: "Ears",
	TopLevel: false, Parent: "ElfEars",
	Group: "Ears",
	Protected: true,
	Categories: ["Ears", "Kitty", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Kitty", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "Kitty", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			InheritColor: "Ears",
		},
		{ Name: "KittyInner", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Kitty",
			NoOverride: true,
			InheritColor: "InnerEars",
		},
	])
});

AddModel({
	Name: "WolfEars",
	Folder: "Ears",
	TopLevel: false, Parent: "ElfEars",
	Group: "Ears",
	Protected: true,
	Categories: ["Ears", "Wolf", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Wolf", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "Wolf", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			InheritColor: "Ears",
		},
		{ Name: "WolfInner", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Wolf",
			NoOverride: true,
			InheritColor: "InnerEars",
		},
	])
});

AddModel({
	Name: "WolfEars2",
	Folder: "Wolfgirl",
	Parent: "WolfEars",
	Protected: true,
	Group: "Ears",
	Categories: ["Ears", "Wolf", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Wolf", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "EarLeft", Layer: "AnimalEars", Pri: 9,
			Invariant: true,
			OffsetX: 920,
			OffsetY: 50,
		},
		{ Name: "EarRight", Layer: "AnimalEars", Pri: 9,
			Invariant: true,
			OffsetX: 920,
			OffsetY: 50,
		},
	])
});



AddModel({
	Name: "HairclipDual",
	Folder: "Wolfgirl",
	TopLevel: true,
	Protected: true,
	Parent: "HairclipDual",
	Categories: ["Hairstyles", "Accessories", "Hairpins"],
	Layers: ToLayerMap([
		{ Name: "HairclipLower", Layer: "HairFront", Pri: 25,
			NoOverride: true,
			OffsetX: 942,
			OffsetY: 50,
		},
		{ Name: "HairclipUpper", Layer: "HairFront", Pri: 25,
			NoOverride: true,
			OffsetX: 942,
			OffsetY: 50,
		},
	])
});

AddModel({
	Name: "FoxEars",
	Folder: "Ears",
	TopLevel: false, Parent: "ElfEars",
	Protected: true,
	Group: "Ears",
	Categories: ["Ears", "Fox", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Fox", "Cosplay"],
	RemovePoses: ["FullHood"],
	Layers: ToLayerMap([
		{ Name: "Fox", Layer: "AnimalEars", Pri: 10,
			Invariant: true,
			InheritColor: "Ears",
		},
		{ Name: "FoxInner", Layer: "AnimalEars", Pri: 10.1,
			Invariant: true,
			TieToLayer: "Fox",
			NoOverride: true,
			InheritColor: "InnerEars",
		},
	])
});


AddModel({
	Name: "WolfTail",
	Folder: "Tails",
	Parent: "Wolf",
	TopLevel: true,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Wolf", "Cosplay"],
	AddPose: ["Tails", "Wolf", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Wolf", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});


AddModel({
	Name: "MouseTail",
	Folder: "Mouse",
	TopLevel: false, Parent: "WolfTail",
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Mouse", "Cosplay"],
	AddPose: ["Tails", "Mouse", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "TailBack", Layer: "TailNoRot", Pri: 50,
			Poses: ToMap(LEGPOSES),
			Invariant: true,
			InheritColor: "Tail",
			MorphPoses: {Kneel: "Kneel", "KneelClosed": "Kneel", Hogtie: "Hogtie"},
		},
		{ Name: "TailFront", Layer: "TailFront", Pri: 50,
			Poses: ToMapSubtract(LEGPOSES, ["Hogtie"]),
			InheritColor: "Tail",
			Invariant: true,
			MorphPoses: {Kneel: "Kneel", "KneelClosed": "Kneel"},
		},
	])
});

AddModel({
	Name: "KittyTail",
	Folder: "Tails",
	Parent: "Kitty",
	Parent2: ["WolfTail"],
	TopLevel: true,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Kitty", "Cosplay"],
	AddPose: ["Tails", "Kitty", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Kitty", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Kitty2Tail",
	Folder: "Tails",
	Parent: "KittyTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Kitty", "Cosplay"],
	AddPose: ["Tails", "Kitty", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Kitty", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail1",
		},
		{ Name: "Kitty2", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail2",
		},
	])
});

AddModel({
	Name: "FoxTail",
	Folder: "Tails",
	Parent: "Fox",
	Parent2: ["WolfTail"],
	TopLevel: true,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Fox", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});

AddModel({
	Name: "Fox2Tail",
	Folder: "Tails",
	Parent: "FoxTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Fox", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail1",
		},
		{ Name: "Fox2", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail2",
		},
	])
});
AddModel({
	Name: "Fox3Tail",
	Folder: "Tails",
	Parent: "FoxTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Fox3", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Fox4Tail",
	Folder: "Tails",
	Parent: "FoxTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox"],
	Layers: ToLayerMap([
		{ Name: "Fox4", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Fox5Tail",
	Folder: "Tails",
	Parent: "FoxTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Fox5", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Fox6Tail",
	Folder: "Tails",
	Parent: "FoxTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Fox6", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Fox7Tail",
	Folder: "Tails",
	Parent: "FoxTail",
	TopLevel: false,
	Protected: true,
	Group: "Tail",
	Categories: ["Tails", "Fox", "Cosplay"],
	AddPose: ["Tails", "Fox", "Cosplay"],
	Layers: ToLayerMap([
		{ Name: "Fox7", Layer: "Tail", Pri: 0,
			Invariant: true,
			InheritColor: "Tail",
		},
	])
});