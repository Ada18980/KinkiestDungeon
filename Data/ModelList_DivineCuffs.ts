/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "DivineCuffsWristLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesWristLeft", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesWristLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesWristLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesWristLeft", "", "LockBand", "LockBand", 8.82),
	])
});
AddModel({
	Name: "DivineCuffsWristRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesWristRight", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesWristRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesWristRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesWristRight", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsWrists",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsWristLeft"),
		...GetModelLayers("DivineCuffsWristRight"),
	])
});



AddModel({
	Name: "DivineCuffsElbowLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesElbowLeft", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesElbowLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesElbowLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesElbowLeft", "", "LockBand", "LockBand", 8.82),
	])
});
AddModel({
	Name: "DivineCuffsElbowRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesElbowRight", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesElbowRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesElbowRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesElbowRight", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsElbows",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsElbowLeft"),
		...GetModelLayers("DivineCuffsElbowRight"),
	])
});

AddModel({
	Name: "DivineCuffsArms",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Parent: "Cuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsWrists"),
		...GetModelLayers("DivineCuffsElbows"),
	])
});

AddModel({
	Name: "DivineCuffsAnklesLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesAnklesLeft", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesAnklesLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesAnklesLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesAnklesLeft", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsAnklesRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesAnklesRight", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesAnklesRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesAnklesRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesAnklesRight", "", "LockBand", "LockBand", 8.82),
	])
});


AddModel({
	Name: "DivineCuffsAnkles",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsAnklesRight"),
		...GetModelLayers("DivineCuffsAnklesLeft"),
	])
});



AddModel({
	Name: "DivineCuffsThighLeft",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesThighLeft", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesThighLeft", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesThighLeft", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesThighLeft", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineCuffsThighRight",
	Folder: "DivineCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "BaseMetal", 8.8),
		...GetModelLayers("ShacklesThighRight", "", "Deco", "Band", 8.7),
		...GetModelLayers("ShacklesThighRight", "", "Lock", "Lock", 8.86),
		...GetModelLayers("ShacklesThighRight", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("ShacklesThighRight", "", "LockBand", "LockBand", 8.82),
	])
});


AddModel({
	Name: "DivineCuffsThigh",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft", "LowCuffs"],
	Layers: ToLayerMap([
		...GetModelLayers("DivineCuffsThighRight"),
		...GetModelLayers("DivineCuffsThighLeft"),
	])
});


AddModel({
	Name: "DivineCollar",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "BaseMetal", 8.8),
		...GetModelLayers("IronCollar", "", "Deco", "Band", 8.7),
		...GetModelLayers("IronCollar", "", "Lock", "Lock", 8.86),
		...GetModelLayers("IronCollar", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("IronCollar", "", "LockBand", "LockBand", 8.82),
	])
});

AddModel({
	Name: "DivineBelt",
	Folder: "DivineCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "BaseMetal", 8.8),
		...GetModelLayers("IronBelt", "", "Deco", "Band", 8.7),
		...GetModelLayers("IronBelt", "", "Lock", "Lock", 8.86),
		...GetModelLayers("IronBelt", "", "LockPlate", "LockPlate", 8.84),
		...GetModelLayers("IronBelt", "", "LockBand", "LockBand", 8.82),
	])
});




AddModel(GetModelFashionVersion("DivineCollar", true));
AddModel(GetModelFashionVersion("DivineBelt", true));
AddModel(GetModelFashionVersion("DivineCuffsWristLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsWristRight", true));
AddModel(GetModelFashionVersion("DivineCuffsWrists", true));
AddModel(GetModelFashionVersion("DivineCuffsElbowLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsElbowRight", true));
AddModel(GetModelFashionVersion("DivineCuffsElbows", true));
AddModel(GetModelFashionVersion("DivineCuffsArms", true));
AddModel(GetModelFashionVersion("DivineCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("DivineCuffsAnkles", true));
AddModel(GetModelFashionVersion("DivineCuffsThighLeft", true));
AddModel(GetModelFashionVersion("DivineCuffsThighRight", true));
AddModel(GetModelFashionVersion("DivineCuffsThigh", true));