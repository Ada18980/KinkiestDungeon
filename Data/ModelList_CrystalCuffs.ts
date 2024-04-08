/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "CrystalCuffsWristLeft",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "BaseMetal", 0.1),
	])
});
AddModel({
	Name: "CrystalCuffsWristRight",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "BaseMetal", 0.1),
	])
});

AddModel({
	Name: "CrystalCuffsWrists",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("CrystalCuffsWristLeft"),
		...GetModelLayers("CrystalCuffsWristRight"),
	])
});



AddModel({
	Name: "CrystalCuffsElbowLeft",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "BaseMetal", 0.1),
	])
});
AddModel({
	Name: "CrystalCuffsElbowRight",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "BaseMetal", 0.1),
	])
});

AddModel({
	Name: "CrystalCuffsElbows",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("CrystalCuffsElbowLeft"),
		...GetModelLayers("CrystalCuffsElbowRight"),
	])
});

AddModel({
	Name: "CrystalCuffsArms",
	Folder: "CrystalCuffs",
	TopLevel: true,
	Parent: "Cuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("CrystalCuffsWrists"),
		...GetModelLayers("CrystalCuffsElbows"),
	])
});

AddModel({
	Name: "CrystalCuffsAnklesLeft",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "BaseMetal", 0.1),
	])
});

AddModel({
	Name: "CrystalCuffsAnklesRight",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "BaseMetal", 0.1)
	])
});


AddModel({
	Name: "CrystalCuffsAnkles",
	Folder: "CrystalCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("CrystalCuffsAnklesRight"),
		...GetModelLayers("CrystalCuffsAnklesLeft"),
	])
});



AddModel({
	Name: "CrystalCuffsThighLeft",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "BaseMetal", 0.1),
	])
});

AddModel({
	Name: "CrystalCuffsThighRight",
	Folder: "CrystalCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "BaseMetal", 0.1),
	])
});


AddModel({
	Name: "CrystalCuffsThigh",
	Folder: "CrystalCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("CrystalCuffsThighRight"),
		...GetModelLayers("CrystalCuffsThighLeft"),
	])
});


AddModel({
	Name: "CrystalCollar",
	Folder: "CrystalCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "BaseMetal", 0.1),
	])
});

AddModel({
	Name: "CrystalBelt",
	Folder: "CrystalCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "BaseMetal", 0.1),
	])
});




AddModel(GetModelFashionVersion("CrystalCollar", true));
AddModel(GetModelFashionVersion("CrystalBelt", true));
AddModel(GetModelFashionVersion("CrystalCuffsWristLeft", true));
AddModel(GetModelFashionVersion("CrystalCuffsWristRight", true));
AddModel(GetModelFashionVersion("CrystalCuffsWrists", true));
AddModel(GetModelFashionVersion("CrystalCuffsElbowLeft", true));
AddModel(GetModelFashionVersion("CrystalCuffsElbowRight", true));
AddModel(GetModelFashionVersion("CrystalCuffsElbows", true));
AddModel(GetModelFashionVersion("CrystalCuffsArms", true));
AddModel(GetModelFashionVersion("CrystalCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("CrystalCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("CrystalCuffsAnkles", true));
AddModel(GetModelFashionVersion("CrystalCuffsThighLeft", true));
AddModel(GetModelFashionVersion("CrystalCuffsThighRight", true));
AddModel(GetModelFashionVersion("CrystalCuffsThigh", true));