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
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesWristLeft", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesWristLeft", "Hardware", "", "Hardware", 0.4),
	])
});
AddModel({
	Name: "CuffsWristRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesWristRight", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesWristRight", "Hardware", "", "Hardware", 0.4),
	])
});

AddModel({
	Name: "CuffsWrists",
	Folder: "LeatherCuffs",
	TopLevel: false,
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
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesElbowLeft", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesElbowLeft", "Hardware", "", "Hardware", 0.4),
	])
});
AddModel({
	Name: "CuffsElbowRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesElbowRight", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesElbowRight", "Hardware", "", "Hardware", 0.4),
	])
});

AddModel({
	Name: "CuffsElbows",
	Folder: "LeatherCuffs",
	TopLevel: false,
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
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesAnklesLeft", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesAnklesLeft", "Hardware", "", "Hardware", 0.4),
	])
});

AddModel({
	Name: "CuffsAnklesRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesAnklesRight", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesAnklesRight", "Hardware", "", "Hardware", 0.4),
	])
});


AddModel({
	Name: "CuffsAnkles",
	Folder: "LeatherCuffs",
	TopLevel: true,
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
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesThighLeft", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesThighLeft", "Hardware", "", "Hardware", 0.4),
	])
});

AddModel({
	Name: "CuffsThighRight",
	Folder: "LeatherCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesThighRight", "Band", "", "Band", 0.4),
		...GetModelLayers("ShacklesThighRight", "Hardware", "", "Hardware", 0.4),
	])
});


AddModel({
	Name: "CuffsThigh",
	Folder: "LeatherCuffs",
	TopLevel: true,
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
		...GetModelLayers("IronCollar", "", "", "Cuff"),
		...GetModelLayers("IronCollar", "Band", "", "Band", 0.4),
		...GetModelLayers("IronCollar", "Hardware", "", "Hardware", 0.4),
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
		...GetModelLayers("IronCollar", "", "", "Cuff"),
		...GetModelLayers("IronCollar", "Band", "", "Band", 0.4),
		...GetModelLayers("IronCollar", "Hardware", "", "Hardware", 0.4),
		...GetModelLayers("IronCollar", "Bell", "", "Bell", 0.5, "CollarAcc"),
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
		...GetModelLayers("IronCollar", "", "", "Cuff"),
		...GetModelLayers("IronCollar", "Band", "", "Band", 0.4),
		...GetModelLayers("IronCollar", "Hardware", "", "Hardware", 0.4),
		...GetModelLayers("IronCollar", "BowBell", "", "Bell", 0.6, "CollarAcc"),
		...GetModelLayers("IronCollar", "Bow", "", "Bow", 0.5, "CollarAcc"),
	])
});

AddModel({
	Name: "LeatherBelt",
	Folder: "LeatherCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "Cuff"),
		...GetModelLayers("IronBelt", "Band", "", "Band", 0.4),
		...GetModelLayers("IronBelt", "Hardware", "", "Hardware", 0.4),
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