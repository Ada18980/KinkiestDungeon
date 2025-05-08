/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "CuffsWristLeft",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesWristLeft", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesWristLeft", "Hardware", "", "Hardware", 2.1),
	])
});
AddModel({
	Name: "CuffsWristRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesWristRight", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesWristRight", "Hardware", "", "Hardware", 2.1),
	])
});

AddModel({
	Name: "CuffsWrists",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("CuffsWristLeft"),
		...GetModelLayers("CuffsWristRight"),
	])
});



AddModel({
	Name: "CuffsElbowLeft",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesElbowLeft", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesElbowLeft", "Hardware", "", "Hardware", 2.1),
	])
});
AddModel({
	Name: "CuffsElbowRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesElbowRight", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesElbowRight", "Hardware", "", "Hardware", 2.1),
	])
});

AddModel({
	Name: "CuffsElbows",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("CuffsElbowLeft"),
		...GetModelLayers("CuffsElbowRight"),
	])
});

AddModel({
	Name: "CuffsArms",
	Folder: "LeatherCuffs",
	TopLevel: true,
	Restraint: true,
	Parent: "Cuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("CuffsWrists"),
		...GetModelLayers("CuffsElbows"),
	])
});

AddModel({
	Name: "CuffsAnklesLeft",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesAnklesLeft", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesAnklesLeft", "Hardware", "", "Hardware", 2.1),
	])
});

AddModel({
	Name: "CuffsAnklesRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesAnklesRight", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesAnklesRight", "Hardware", "", "Hardware", 2.1),
	])
});


AddModel({
	Name: "CuffsAnkles",
	Folder: "LeatherCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("CuffsAnklesRight"),
		...GetModelLayers("CuffsAnklesLeft"),
	])
});



AddModel({
	Name: "CuffsThighLeft",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesThighLeft", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesThighLeft", "Hardware", "", "Hardware", 2.1),
	])
});

AddModel({
	Name: "CuffsThighRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "Cuff", 2),
		...GetModelLayers("ShacklesThighRight", "Band", "", "Band", 2.1),
		...GetModelLayers("ShacklesThighRight", "Hardware", "", "Hardware", 2.1),
	])
});


AddModel({
	Name: "CuffsThigh",
	Folder: "LeatherCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("CuffsThighRight"),
		...GetModelLayers("CuffsThighLeft"),
	])
});


AddModel({
	Name: "LeatherCollar",
	Folder: "LeatherCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "Cuff", 2),
		...GetModelLayers("IronCollar", "Band", "", "Band", 2.1),
		...GetModelLayers("IronCollar", "Hardware", "", "Hardware", 2.1),
	])
});

AddModel({
	Name: "LeatherCollarBell",
	Folder: "LeatherCuffs",
	Parent: "LeatherCollar",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "Cuff", 2),
		...GetModelLayers("IronCollar", "Band", "", "Band", 2.1),
		...GetModelLayers("IronCollar", "Hardware", "", "Hardware", 2.1),
		...GetModelLayers("IronCollar", "Bell", "", "Bell", 2.5, "CollarAcc"),
	])
});
AddModel({
	Name: "LeatherCollarBow",
	Folder: "LeatherCuffs",
	Parent: "LeatherCollar",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "Cuff", 2),
		...GetModelLayers("IronCollar", "Band", "", "Band", 2.1),
		...GetModelLayers("IronCollar", "Hardware", "", "Hardware", 2.1),
		...GetModelLayers("IronCollar", "BowBell", "", "Bell", 2.6, "CollarAcc"),
		...GetModelLayers("IronCollar", "Bow", "", "Bow", 2.5, "CollarAcc"),
	])
});

AddModel({
	Name: "LeatherBelt",
	Folder: "LeatherCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "Cuff", 2),
		...GetModelLayers("IronBelt", "Band", "", "Band", 2.1),
		...GetModelLayers("IronBelt", "Hardware", "", "Hardware", 2.1),
	])
});




AddModel(GetModelFashionVersion("LeatherCollar", true));
AddModel(GetModelFashionVersion("LeatherBelt", true));
AddModel(GetModelFashionVersion("LeatherCollarBell", true));
AddModel(GetModelFashionVersion("LeatherCollarBow", true));
AddModel(GetModelFashionVersion("CuffsWristLeft", true));
AddModel(GetModelFashionVersion("CuffsWristRight", true));
AddModel(GetModelFashionVersion("CuffsWrists", true));
AddModel(GetModelFashionVersion("CuffsElbowLeft", true));
AddModel(GetModelFashionVersion("CuffsElbowRight", true));
AddModel(GetModelFashionVersion("CuffsElbows", true));
AddModel(GetModelFashionVersion("CuffsArms", true));
AddModel(GetModelFashionVersion("CuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("CuffsAnklesRight", true));
AddModel(GetModelFashionVersion("CuffsAnkles", true));
AddModel(GetModelFashionVersion("CuffsThighLeft", true));
AddModel(GetModelFashionVersion("CuffsThighRight", true));
AddModel(GetModelFashionVersion("CuffsThigh", true));