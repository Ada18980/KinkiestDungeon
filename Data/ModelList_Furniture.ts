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
	AddPose: ["Caged"],
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
	Name: "Sarcophagus",
	Folder: "Furniture",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Display"],
	AddPose: ["Display", "UprightHogtie", "LiftKneel"],
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
	AddPose: ["UprightHogtie", "ForceStand"],
	Layers: ToLayerMap([
		{ Name: "DisplayFront", Layer: "FurnitureFront", Pri: -50,
			Invariant: true,
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
	AddPose: ["UprightHogtie", "ForceStand"],
	Layers: ToLayerMap([
		{ Name: "OneBarFront", Layer: "TorsoLower", Pri: -50,
			Poses: ToMap(["Closed", "Spread"]),
		},
		{ Name: "OneBarBack", Layer: "FurnitureBack", Pri: 50,
			Poses: ToMap(["Closed", "Spread"]),
		},
	])
});
