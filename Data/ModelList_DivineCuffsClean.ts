/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "DivineCuffsCleanWristLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesWristLeft", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesWristLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesWristLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesWristLeft", "", "LockBand", "LockBand", 8.82),
	])
});
AddModel({
	Name: "DivineCuffsCleanWristRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesWristRight", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesWristRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesWristRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesWristRight", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsCleanWrists",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsCleanWristLeft"),
		...GetModelLayers("DivineCuffsCleanWristRight"),
	])
});



AddModel({
	Name: "DivineCuffsCleanElbowLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesElbowLeft", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesElbowLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesElbowLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesElbowLeft", "", "LockBand", "LockBand", 8.82),
	])
});
AddModel({
	Name: "DivineCuffsCleanElbowRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesElbowRight", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesElbowRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesElbowRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesElbowRight", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsCleanElbows",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsCleanElbowLeft"),
		...GetModelLayers("DivineCuffsCleanElbowRight"),
	])
});

AddModel({
	Name: "DivineCuffsCleanArms",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Parent: "Cuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsCleanWrists"),
		...GetModelLayers("DivineCuffsCleanElbows"),
	])
});

AddModel({
	Name: "DivineCuffsCleanAnklesLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesAnklesLeft", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesAnklesLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesAnklesLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesAnklesLeft", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsCleanAnklesRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesAnklesRight", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesAnklesRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesAnklesRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesAnklesRight", "", "LockBand", "LockBand", 8.82),
	])
});


AddModel({
	Name: "DivineCuffsCleanAnkles",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsCleanAnklesRight"),
		...GetModelLayers("DivineCuffsCleanAnklesLeft"),
	])
});



AddModel({
	Name: "DivineCuffsCleanThighLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesThighLeft", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesThighLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesThighLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesThighLeft", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsCleanThighRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesThighRight", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("ShacklesThighRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesThighRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesThighRight", "", "LockBand", "LockBand", 8.82),
	])
});


AddModel({
	Name: "DivineCuffsCleanThigh",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft", "LowCuffs"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsCleanThighRight"),
		...GetModelLayers("DivineCuffsCleanThighLeft"),
	])
});


AddModel({
	Name: "DivineCollarClean",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "BaseMetal", 8.8),
		...GetModelLayers("IronCollar", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("IronCollar", "", "Lock", "Lock", 8.86),
		...GetModelLayers("IronCollar", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("IronCollar", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineBeltClean",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "BaseMetal", 8.8),
		...GetModelLayers("IronBelt", "", "DecoClean", "Band", 8.7),
		...GetModelLayers("IronBelt", "", "Lock", "Lock", 8.86),
		...GetModelLayers("IronBelt", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("IronBelt", "", "LockBand", "LockBand", 8.82),
	])
});




AddModel(GetModelFashionVersion("DivineCollarClean", true));
AddModel(GetModelFashionVersion("DivineBeltClean", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanWristLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanWristRight", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanWrists", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanElbowLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanElbowRight", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanElbows", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanArms", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanAnklesLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanAnklesRight", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanAnkles", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanThighLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanThighRight", true));
AddModel(GetModelFashionVersion("DivineCuffsCleanThigh", true));