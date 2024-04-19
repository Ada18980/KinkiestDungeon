/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "SteelCuffsWristLeft",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesWristLeft", "Rim", "", "Rim", 0.5),
	])
});
AddModel({
	Name: "SteelCuffsWristRight",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesWristRight", "Rim", "", "Rim", 0.5),
	])
});

AddModel({
	Name: "SteelCuffsWrists",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("SteelCuffsWristLeft"),
		...GetModelLayers("SteelCuffsWristRight"),
	])
});



AddModel({
	Name: "SteelCuffsElbowLeft",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesElbowLeft", "Rim", "", "Rim", 0.5),
	])
});
AddModel({
	Name: "SteelCuffsElbowRight",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesElbowRight", "Rim", "", "Rim", 0.5),
	])
});

AddModel({
	Name: "SteelCuffsElbows",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("SteelCuffsElbowLeft"),
		...GetModelLayers("SteelCuffsElbowRight"),
	])
});

AddModel({
	Name: "SteelCuffsArms",
	Folder: "SteelCuffs",
	TopLevel: true,
	Parent: "Cuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("SteelCuffsWrists"),
		...GetModelLayers("SteelCuffsElbows"),
	])
});

AddModel({
	Name: "SteelCuffsAnklesLeft",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesAnklesLeft", "Rim", "", "Rim", 0.5),
	])
});

AddModel({
	Name: "SteelCuffsAnklesRight",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesAnklesRight", "Rim", "", "Rim", 0.5),
	])
});


AddModel({
	Name: "SteelCuffsAnkles",
	Folder: "SteelCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("SteelCuffsAnklesRight"),
		...GetModelLayers("SteelCuffsAnklesLeft"),
	])
});



AddModel({
	Name: "SteelCuffsThighLeft",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesThighLeft", "Rim", "", "Rim", 0.5),
	])
});

AddModel({
	Name: "SteelCuffsThighRight",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "BaseMetal", 0.6),
		...GetModelLayers("ShacklesThighRight", "Rim", "", "Rim", 0.5),
	])
});


AddModel({
	Name: "SteelCuffsThigh",
	Folder: "SteelCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft", "LowCuffs"],
	Layers: ToLayerMap([
		...GetModelLayers("SteelCuffsThighRight"),
		...GetModelLayers("SteelCuffsThighLeft"),
	])
});


AddModel({
	Name: "NeoSteelCollar",
	Folder: "SteelCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "BaseMetal", 0.6),
		...GetModelLayers("IronCollar", "Rim", "", "Rim", 0.5),
	])
});

AddModel({
	Name: "NeoSteelBelt",
	Folder: "SteelCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "BaseMetal", 0.6),
		...GetModelLayers("IronBelt", "Rim", "", "Rim", 0.5),
	])
});




AddModel(GetModelFashionVersion("NeoSteelCollar", true));
AddModel(GetModelFashionVersion("NeoSteelBelt", true));
AddModel(GetModelFashionVersion("SteelCuffsWristLeft", true));
AddModel(GetModelFashionVersion("SteelCuffsWristRight", true));
AddModel(GetModelFashionVersion("SteelCuffsWrists", true));
AddModel(GetModelFashionVersion("SteelCuffsElbowLeft", true));
AddModel(GetModelFashionVersion("SteelCuffsElbowRight", true));
AddModel(GetModelFashionVersion("SteelCuffsElbows", true));
AddModel(GetModelFashionVersion("SteelCuffsArms", true));
AddModel(GetModelFashionVersion("SteelCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("SteelCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("SteelCuffsAnkles", true));
AddModel(GetModelFashionVersion("SteelCuffsThighLeft", true));
AddModel(GetModelFashionVersion("SteelCuffsThighRight", true));
AddModel(GetModelFashionVersion("SteelCuffsThigh", true));