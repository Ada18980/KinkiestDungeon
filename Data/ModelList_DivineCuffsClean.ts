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
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesWristLeft", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesWristLeft", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesWristLeft", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesWristLeft", "", "LockBand", "LockBand", 1.6),
	])
});
AddModel({
	Name: "DivineCuffsCleanWristRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesWristRight", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesWristRight", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesWristRight", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesWristRight", "", "LockBand", "LockBand", 1.6),
	])
});

AddModel({
	Name: "DivineCuffsCleanWrists",
	Folder: "DivineCuffs",
	TopLevel: false,
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
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesElbowLeft", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesElbowLeft", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesElbowLeft", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesElbowLeft", "", "LockBand", "LockBand", 1.6),
	])
});
AddModel({
	Name: "DivineCuffsCleanElbowRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesElbowRight", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesElbowRight", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesElbowRight", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesElbowRight", "", "LockBand", "LockBand", 1.6),
	])
});

AddModel({
	Name: "DivineCuffsCleanElbows",
	Folder: "DivineCuffs",
	TopLevel: false,
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
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesAnklesLeft", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesAnklesLeft", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesAnklesLeft", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesAnklesLeft", "", "LockBand", "LockBand", 1.6),
	])
});

AddModel({
	Name: "DivineCuffsCleanAnklesRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesAnklesRight", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesAnklesRight", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesAnklesRight", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesAnklesRight", "", "LockBand", "LockBand", 1.6),
	])
});


AddModel({
	Name: "DivineCuffsCleanAnkles",
	Folder: "DivineCuffs",
	TopLevel: true,
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
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesThighLeft", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesThighLeft", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesThighLeft", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesThighLeft", "", "LockBand", "LockBand", 1.6),
	])
});

AddModel({
	Name: "DivineCuffsCleanThighRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "BaseMetal", 0.8),
		...GetModelLayers("ShacklesThighRight", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("ShacklesThighRight", "", "Lock", "Lock", 1.8),
		...GetModelLayers("ShacklesThighRight", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("ShacklesThighRight", "", "LockBand", "LockBand", 1.6),
	])
});


AddModel({
	Name: "DivineCuffsCleanThigh",
	Folder: "DivineCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft"],
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
		...GetModelLayers("IronCollar", "", "", "BaseMetal", 0.8),
		...GetModelLayers("IronCollar", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("IronCollar", "", "Lock", "Lock", 1.8),
		...GetModelLayers("IronCollar", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("IronCollar", "", "LockBand", "LockBand", 1.6),
	])
});

AddModel({
	Name: "DivineBeltClean",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "BaseMetal", 0.8),
		...GetModelLayers("IronBelt", "", "DecoClean", "Band", 0.7),
		...GetModelLayers("IronBelt", "", "Lock", "Lock", 1.8),
		...GetModelLayers("IronBelt", "", "LockPlate", "LockPlate", 1.7),
		...GetModelLayers("IronBelt", "", "LockBand", "LockBand", 1.6),
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