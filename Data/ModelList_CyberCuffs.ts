/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "CyberCuffsWristLeft",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesWristLeft", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesWristLeft", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesWristLeft", "Lock", "", "Lock", 0.7),
	])
});
AddModel({
	Name: "CyberCuffsWristRight",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesWristRight", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesWristRight", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesWristRight", "Lock", "", "Lock", 0.7),
	])
});

AddModel({
	Name: "CyberCuffsWrists",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("CyberCuffsWristLeft"),
		...GetModelLayers("CyberCuffsWristRight"),
	])
});



AddModel({
	Name: "CyberCuffsElbowLeft",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesElbowLeft", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesElbowLeft", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesElbowLeft", "Lock", "", "Lock", 0.7),
	])
});
AddModel({
	Name: "CyberCuffsElbowRight",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowRight", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesElbowRight", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesElbowRight", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesElbowRight", "Lock", "", "Lock", 0.7),
	])
});

AddModel({
	Name: "CyberCuffsElbows",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("CyberCuffsElbowLeft"),
		...GetModelLayers("CyberCuffsElbowRight"),
	])
});

AddModel({
	Name: "CyberCuffsArms",
	Folder: "CyberCuffs",
	TopLevel: true,
	Parent: "Cuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("CyberCuffsWrists"),
		...GetModelLayers("CyberCuffsElbows"),
	])
});

AddModel({
	Name: "CyberCuffsAnklesLeft",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesAnklesLeft", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesAnklesLeft", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesAnklesLeft", "Lock", "", "Lock", 0.7),
	])
});

AddModel({
	Name: "CyberCuffsAnklesRight",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesAnklesRight", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesAnklesRight", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesAnklesRight", "Lock", "", "Lock", 0.7),
	])
});


AddModel({
	Name: "CyberCuffsAnkles",
	Folder: "CyberCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("CyberCuffsAnklesRight"),
		...GetModelLayers("CyberCuffsAnklesLeft"),
	])
});



AddModel({
	Name: "CyberCuffsThighLeft",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesThighLeft", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesThighLeft", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesThighLeft", "Lock", "", "Lock", 0.7),
	])
});

AddModel({
	Name: "CyberCuffsThighRight",
	Folder: "CyberCuffs",
	TopLevel: false,
	Parent: "CuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "BaseMetal", 0.4),
		...GetModelLayers("ShacklesThighRight", "Screen", "", "Screen", 0.65),
		...GetModelLayers("ShacklesThighRight", "Display", "", "Display", 0.67),
		...GetModelLayers("ShacklesThighRight", "Lock", "", "Lock", 0.7),
	])
});


AddModel({
	Name: "CyberCuffsThigh",
	Folder: "CyberCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft", "HighCuffs"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("CyberCuffsThighRight"),
		...GetModelLayers("CyberCuffsThighLeft"),
	])
});


AddModel({
	Name: "NeoCyberCollar",
	Folder: "CyberCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "BaseMetal", 0.4),
		...GetModelLayers("IronCollar", "Screen", "", "Screen", 0.65),
		...GetModelLayers("IronCollar", "Display", "", "Display", 0.67),
		...GetModelLayers("IronCollar", "Lock", "", "Lock", 0.7),
	])
});

AddModel({
	Name: "NeoCyberBelt",
	Folder: "CyberCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Filters: {
		Display: {"gamma":1,"saturation":1,"contrast":1.6500000000000001,"brightness":0.8,"red":1,"green":1,"blue":1,"alpha":1},
	},
	Layers: ToLayerMap([
		...GetModelLayers("IronBelt", "", "", "BaseMetal", 0.4),
		...GetModelLayers("IronBelt", "Screen", "", "Screen", 0.65),
		...GetModelLayers("IronBelt", "Display", "", "Display", 0.67),
		...GetModelLayers("IronBelt", "Lock", "", "Lock", 0.7),
	])
});




AddModel(GetModelFashionVersion("NeoCyberCollar", true));
AddModel(GetModelFashionVersion("NeoCyberBelt", true));
AddModel(GetModelFashionVersion("CyberCuffsWristLeft", true));
AddModel(GetModelFashionVersion("CyberCuffsWristRight", true));
AddModel(GetModelFashionVersion("CyberCuffsWrists", true));
AddModel(GetModelFashionVersion("CyberCuffsElbowLeft", true));
AddModel(GetModelFashionVersion("CyberCuffsElbowRight", true));
AddModel(GetModelFashionVersion("CyberCuffsElbows", true));
AddModel(GetModelFashionVersion("CyberCuffsArms", true));
AddModel(GetModelFashionVersion("CyberCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("CyberCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("CyberCuffsAnkles", true));
AddModel(GetModelFashionVersion("CyberCuffsThighLeft", true));
AddModel(GetModelFashionVersion("CyberCuffsThighRight", true));
AddModel(GetModelFashionVersion("CyberCuffsThigh", true));