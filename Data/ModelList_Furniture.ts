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
			EraseSprite: "FutureBox",
			EraseLayers: ToMap(["All"]),
			EraseAmount: 100,
			EraseInvariant: true,
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
	AddPose: ["SuspendedHogtie", "ForceStand"],
	Layers: ToLayerMap([
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
