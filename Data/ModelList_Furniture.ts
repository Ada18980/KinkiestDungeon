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
		{ Name: "CageFront", Layer: "FurnitureFront", Pri: -50,
			Invariant: true,
		},
		{ Name: "CageBack", Layer: "FurnitureBack", Pri: 50,
			Invariant: true,
		},
	])
});
