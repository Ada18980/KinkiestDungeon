/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "Cage",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Cages"],
	AddPose: ["Caged", "UprightHogtie", "KneelDown"],
	Layers: ToLayerMap([
		{ Name: "CageFront", Layer: "FurnitureFront", Pri: 50,
			Invariant: true,
		},
		{ Name: "CageBack", Layer: "FurnitureBack", Pri: -50,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "FutureBox",
	Folder: "FutureBox",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Cages"],
	AddPose: ["Enclosed", "UprightHogtie", "KneelDown"],
	Layers: ToLayerMap([
		{ Name: "Rim", Layer: "FurnitureFront", Pri: 20,
			Invariant: true,
			EraseSprite: "FutureBox",
			EraseLayers: ToMap(["All"]),
			EraseAmount: 100,
			EraseInvariant: true,
			HidePoses: ToMap(["Sprite"]),
		},
		{ Name: "Display", Layer: "FurnitureFront", Pri: 20.1,
			Invariant: true,
			TieToLayer: "Rim",
		},
		{ Name: "Lock", Layer: "FurnitureFront", Pri: 20.2,
			Invariant: true,
			TieToLayer: "Rim",
		},
		{ Name: "Door", Layer: "FurnitureFront", Pri: 20.2,
			Invariant: true,
			Poses: ToMap(["Menu"]),
		},
		{ Name: "DoorWindow", Layer: "FurnitureFront", Pri: 20.1,
			Invariant: true,
			TieToLayer: "Door",
		},
		{ Name: "DoorNumeral", Layer: "FurnitureFront", Pri: 20.3,
			Invariant: true,
			TieToLayer: "Door",
		},
		{ Name: "BackFade", Layer: "FurnitureBack", Pri: -19.9,
			Invariant: true,
			TieToLayer: "Back",
		},
		{ Name: "Back", Layer: "FurnitureBack", Pri: -20,
			Invariant: true,
			HidePoses: ToMap(["Sprite"]),
		},
	])
});

AddModel({
	Name: "Sarcophagus",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Display"],
	AddPose: ["Display", "SuspendedHogtie", "LiftKneel", "HideBigProps"],
	Layers: ToLayerMap([
		{ Name: "SarcoFront", Layer: "FurnitureFront", Pri: 30,
			Invariant: true,
			EraseSprite: "Sarco",
			EraseLayers: ToMap(["All"]),
			EraseAmount: 100,
			EraseInvariant: true,
		},
		{ Name: "SarcoWebs", Layer: "FurnitureBack", Pri: -30,
			Invariant: true,
		},
		{ Name: "SarcoBack", Layer: "FurnitureBack", Pri: -50,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "Bed",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Display"],
	AddPose: ["Display", "LiftKneel"],
	Layers: ToLayerMap([
		{ Name: "Bed", Layer: "FurnitureBackLinked", Pri: -100,
			Invariant: true,
			MorphPoses: {UprightHogtie: "", SuspendedHogtie: "", Hogtie: "Hogtie"}
		},
	])
});


AddModel({
	Name: "BondageBed",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Display"],
	AddPose: ["Display", "LiftKneel", "HandsBehind"],
	Layers: ToLayerMap([
		...GetModelLayers("Bed"),

		{ Name: "StrapsBack", Layer: "FurnitureLinked", Pri: -20,
			Invariant: true,
			TieToLayer: "Bed",
			RequirePoses: {SleepsackTop: true},
			Folder: "SleepsackJacket",
			InheritColor: "Straps",

		},
		{ Name: "StrapsTied", Layer: "FurnitureLinked", Pri: 30,
			Invariant: true,
			TieToLayer: "Bed",
			RequirePoses: {SleepsackTop: true},
			HidePoses: {Crossed: true},
			Folder: "SleepsackJacket",
			InheritColor: "Straps",

		},
		{ Name: "StrapsCrossed", Layer: "FurnitureLinked", Pri: 30,
			Invariant: true,
			TieToLayer: "Bed",
			RequirePoses: {Crossed: true, SleepsackTop: true},
			Folder: "SleepsackJacket",
			InheritColor: "Straps",

		},
		{ Name: "StrapsAnkles", Layer: "FurnitureLinked", Pri: 20,
			Invariant: true,
			TieToLayer: "Bed",
			RequirePoses: {SleepsackBottom: true},
			Folder: "SleepsackJacket",
			InheritColor: "Straps",

		},
		{ Name: "BedStraps", Layer: "FurnitureLinked", Pri: 20,
			Invariant: true,
			TieToLayer: "Bed",
			HidePoses: {Hogtie: true, SleepsackTop: true, SleepsackBottom: true},
			InheritColor: "Straps",

		},
		{ Name: "BedStrapsHogtie", Layer: "FurnitureLinked", Pri: 20,
			Invariant: true,
			TieToLayer: "Bed",
			Poses: {Hogtie: true},
			HidePoses: {SleepsackTop: true, SleepsackBottom: true},
			MorphPoses: {Boxtie: "Boxtie", Front: "Boxtie", Crossed: "Boxtie",
				UprightHogtie: "", SuspendedHogtie: ""},
			DisplacementSprite: "BedStrapsHogtie",
			DisplaceLayers: ToMap(["Ribbon1"]),
			DisplacementMorph: {Boxtie: "Boxtie", Front: "Boxtie", Crossed: "Boxtie"},
			DisplaceAmount: 100,
			DisplacementInvariant: true,
			InheritColor: "Straps",
		},
	])
});

AddModel({
	Name: "LatexCube",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Latex"],
	AddPose: ["UprightHogtie", "ForceKneel"],
	Layers: ToLayerMap([
		{ Name: "LatexCube", Layer: "FurnitureFront", Pri: -40,
			Invariant: true,
		},
		{ Name: "LatexCubeBack", Layer: "FurnitureBack", Pri: 40,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "SaddleMachine",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture"],
	AddPose: ["Saddled", "ForceKneel", "Unhobble", "DontLinkFeet", "DontBindLegs"],
	AddPoseIf: {
		LongSkirt: ["CrotchStrap"],
		
	},
	HideLayerGroups: ["FootRightKneel"],
	Layers: ToLayerMap([
		{ Name: "Saddle", Layer: "Saddle", Pri: 40,
			Invariant: true,
			EraseLayerGroups:{SkirtLower: true, Skirt: true, SkirtOver: true,},
			
			EraseSprite: "EraseSaddle",
			EraseInvariant: true,
			EraseZBonus: 1000,
			
		},
		{ Name: "SaddleFront", Layer: "Saddle", Pri: 39.9,
			Invariant: true,
			TieToLayer: "Saddle",
			NoOverride: true,
		},
		{ Name: "SaddleHardware", Layer: "Saddle", Pri: 39.9,
			Invariant: true,
			TieToLayer: "Saddle",
			NoOverride: true,
		},
		{ Name: "SaddleDisplay", Layer: "Saddle", Pri: 39.9,
			Invariant: true,
			TieToLayer: "Saddle",
			NoOverride: true,
		},
		{ Name: "SaddleSeat", Layer: "Saddle", Pri: 39.9,
			Invariant: true,
			TieToLayer: "Saddle",
			NoOverride: true,
		},
	])
});



AddModel({
	Name: "CrystalEncase",
	Folder: "Crystal",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Crystal"],
	AddPose: ["SuspendedHogtie"],
	Layers: ToLayerMap([
		{ Name: "EncaseOver", Layer: "FurnitureFront", Pri: -40,
			Invariant: true,
			EraseSprite: "CrystalErase",
			EraseLayers: ToMap(["All"]),
			EraseAmount: 100,
			EraseInvariant: true,

		},
		{ Name: "EncaseUnder", Layer: "FurnitureBack", Pri: 40,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "Barrel",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture"],
	AddPose: ["UprightHogtie", "ForceKneel"],
	Layers: ToLayerMap([
		{ Name: "Barrel", Layer: "FurnitureBack", Pri: 80,
			Invariant: true,
		},
	])
});


AddModel({
	Name: "DisplayStand",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Stands"],
	AddPose: ["SuspendedHogtie", "BlockKneel", "ForceStand", "FeetLinked", "HideBigProps"],
	Layers: ToLayerMap([
		{ Name: "DisplayFront", Layer: "FurnitureFront", Pri: -50,
			Invariant: true,
			MorphPoses: {Hogtie: "Hogtie"},
		},
	])
});

AddModel({
	Name: "OneBarPrison",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Stands"],
	AddPose: ["SuspendedHogtie", "ForceStand", "OneBarLegWarp"],
	Layers: ToLayerMap([
		{ Name: "OneBarTop", Layer: "WrappingTorsoUnder", Pri: -249,
			Poses: ToMap(["Closed", "Spread"]),
			RequirePoses: ToMap(["ChastityBelts"]),
			AppendPose: {Ballet: "Heels"},
			NoOverride: true,
		},
		{ Name: "OneBarFront", Layer: "Torso", Pri: -50,
			Poses: ToMap(["Closed", "Spread"]),
			AppendPose: {Ballet: "Heels"},
		},
		{ Name: "OneBarBack", Layer: "FurnitureBack", Pri: 50,
			Poses: ToMap(["Closed", "Spread"]),
			AppendPose: {Ballet: "Heels"},
		},
	])
});



AddModel({
	Name: "DollStand",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Stands"],
	AddPose: ["SuspendedHogtie", "ForceStand", "OneBarLegWarp"],
	Layers: ToLayerMap([
		{ Name: "DollStand", Layer: "DollStandFront", Pri: -249,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			NoOverride: true,
		},
		{ Name: "OneBarFront", Layer: "Torso", Pri: -50,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			AppendPose: {Ballet: "Heels"},
		},
		{ Name: "OneBarBack", Layer: "FurnitureBack", Pri: 50,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			AppendPose: {Ballet: "Heels"},
		},
	])
});





AddModel({
	Name: "DollStandSpreader",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Stands"],
	AddPose: ["SuspendedHogtie", "ForceStand", "Spreader", "WideSpread"],
	Layers: ToLayerMap([
		{ Name: "DollStand", Layer: "DollStandFront", Pri: -249,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			NoOverride: true,
		},
		{ Name: "OneBarFront", Layer: "Torso", Pri: -50,
			Poses: ToMap(["Closed", "Spread"]),
			AppendPose: {Ballet: "Heels"},
		},
		{ Name: "OneBarLarge", Layer: "FurnitureBack", Pri: 50,
			
			AppendPose: {Ballet: "Heels"},
		},

		{ Name: "ShortLeft", Layer: "AnkleLeftOver", Pri: 30,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "AnkleCuffLeft",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
		},
		{ Name: "ShortRight", Layer: "AnkleRightOver", Pri: 30,
			Invariant: true,
			Poses: ToMap(["Spread"]),
			HideWhenOverridden: true,
			DisplacementSprite: "AnkleCuffRight",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
		},
		{ Name: "Bar", Layer: "SpreaderBar", Pri: 30,
			Invariant: true,
			Poses: ToMap(["Spread"]),
			HideWhenOverridden: true,
		},
	])
});



AddModel({
	Name: "OneBarPrisonSpreader",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Stands"],
	AddPose: ["SuspendedHogtie", "ForceStand", "Spreader", "WideSpread"],
	Layers: ToLayerMap([
		{ Name: "OneBarTop", Layer: "WrappingTorsoUnder", Pri: -249,
			Poses: ToMap(["Closed", "Spread"]),
			RequirePoses: ToMap(["ChastityBelts"]),
			AppendPose: {Ballet: "Heels"},
			NoOverride: true,
		},
		{ Name: "OneBarFront", Layer: "Torso", Pri: -50,
			Poses: ToMap(["Closed", "Spread"]),
			AppendPose: {Ballet: "Heels"},
		},
		{ Name: "OneBarLarge", Layer: "FurnitureBack", Pri: 50,
			AppendPose: {Ballet: "Heels"},
		},

		{ Name: "ShortLeft", Layer: "AnkleLeftOver", Pri: 30,
			Poses: ToMap([...LEGPOSES]),
			HideWhenOverridden: true,
			
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "AnkleCuffLeft",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
		},
		{ Name: "ShortRight", Layer: "AnkleRightOver", Pri: 30,
			Invariant: true,
			Poses: ToMap(["Spread"]),
			HideWhenOverridden: true,
			DisplacementSprite: "AnkleCuffRight",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
		},
		{ Name: "Bar", Layer: "SpreaderBar", Pri: 30,
			Invariant: true,
			Poses: ToMap(["Spread"]),
			HideWhenOverridden: true,
		},
	])
});


AddModel({
	Name: "OneBarPrisonLatex",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Stands"],
	AddPose: ["SuspendedHogtie", "ForceStand", "OneBarLegWarp"],
	Filters: {"OneBarTop":{"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.3333333333333333,"green":0.7450980392156863,"blue":1.6666666666666667,"alpha":1},"OneBarFront":{"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.3333333333333333,"green":0.7450980392156863,"blue":1.6666666666666667,"alpha":1},"OneBarBack":{"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.3333333333333333,"green":0.7450980392156863,"blue":1.6666666666666667,"alpha":1}},
	Layers: ToLayerMap([
		{ Name: "OneBarTop", Layer: "WrappingTorsoUnder", Pri: -249,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			AppendPose: {Ballet: "Heels"},
			NoOverride: true,
		},
		{ Name: "OneBarFront", Layer: "Torso", Pri: -50,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			AppendPose: {Ballet: "Heels"},
		},
		{ Name: "OneBarBack", Layer: "FurnitureBack", Pri: 50,
			Poses: ToMap(["Closed", "Spread", "Hogtie"]),
			MorphPoses: {"Hogtie": "Spread"},
			AppendPose: {Ballet: "Heels"},
		},
	])
});



AddModel({
	Name: "PuppetStrings",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Strings"],
	Layers: ToLayerMap([
		{ Name: "PuppetStrings", Layer: "FurnitureBack", Pri: 100,
			Invariant: true,
		},
	])
});