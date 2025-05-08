/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "KittyPawCuffsWristLeft",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "Cuff", 1),
		...GetModelLayers("ShacklesWristLeft", "Band", "", "Band", 1.1),
		...GetModelLayers("ShacklesWristLeft", "Lock", "", "Lock", 1.15),
	])
});
AddModel({
	Name: "KittyPawCuffsWristRight",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "Cuff", 1),
		...GetModelLayers("ShacklesWristRight", "Band", "", "Band", 1.1),
		...GetModelLayers("ShacklesWristRight", "Lock", "", "Lock", 1.15),
	])
});

AddModel({
	Name: "KittyPawCuffsWrists",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPawCuffsWristLeft"),
		...GetModelLayers("KittyPawCuffsWristRight"),
	])
});



AddModel({
	Name: "KittyPawCuffsElbowLeft",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		{ Name: "ElbowLeft", Layer: "BindElbowLeft", Pri: 2,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			DisplacementSprite: "ElbowCuffLeft",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
			HidePoses: ToMap(["EncaseArmLeft"]),
		},

		{ Name: "BandElbowLeft", Layer: "BindElbowLeft", Pri: 2.4,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Band",
			HidePoses: ToMap(["EncaseArmLeft"]),
			TieToLayer: "ElbowLeft",
			NoOverride: true,
		},

		{ Name: "LockElbowLeft", Layer: "BindElbowLeft", Pri: 2.5,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Lock",
			HidePoses: ToMap(["EncaseArmLeft"]),
			TieToLayer: "ElbowLeft",
			NoOverride: true,
		},

	])
});
AddModel({
	Name: "KittyPawCuffsElbowRight",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		{ Name: "ElbowRight", Layer: "BindElbowRight", Pri: 2,
			Poses: ToMapSubtract([...ARMPOSES], ["Free"]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			DisplacementSprite: "ElbowCuffRight",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 100,
			InheritColor: "BaseMetal",
			HidePoses: ToMap(["EncaseArmRight"]),
		},

		{ Name: "BandElbowRight", Layer: "BindElbowRight", Pri: 2.4,
			Poses: ToMapSubtract([...ARMPOSES], ["Free"]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Band",
			HidePoses: ToMap(["EncaseArmRight"]),
			TieToLayer: "ElbowRight",
			NoOverride: true,
		},

		{ Name: "LockElbowRight", Layer: "BindElbowRight", Pri: 2.5,
			Poses: ToMapSubtract([...ARMPOSES], ["Free"]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Lock",
			HidePoses: ToMap(["EncaseArmRight"]),
			TieToLayer: "ElbowRight",
			NoOverride: true,
		},

	])
});

AddModel({
	Name: "KittyPawCuffsElbows",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPawCuffsElbowLeft"),
		...GetModelLayers("KittyPawCuffsElbowRight"),
	])
});

AddModel({
	Name: "KittyPawCuffsArms",
	Folder: "KittyPawCuffs",
	TopLevel: true,
	Restraint: true,
	Parent: "KittyPawCuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPawCuffsWrists"),
		...GetModelLayers("KittyPawCuffsElbows"),
	])
});

AddModel({
	Name: "KittyPawCuffsAnklesLeft",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "Cuff", 1),
		...GetModelLayers("ShacklesAnklesLeft", "Band", "", "Band", 1.1),
		...GetModelLayers("ShacklesAnklesLeft", "Lock", "", "Lock", 1.15),
	])
});

AddModel({
	Name: "KittyPawCuffsAnklesRight",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "Cuff", 1),
		...GetModelLayers("ShacklesAnklesRight", "Band", "", "Band", 1.1),
		...GetModelLayers("ShacklesAnklesRight", "Lock", "", "Lock", 1.15),
	])
});


AddModel({
	Name: "KittyPawCuffsAnkles",
	Folder: "KittyPawCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPawCuffsAnklesRight"),
		...GetModelLayers("KittyPawCuffsAnklesLeft"),
	])
});



AddModel({
	Name: "KittyPawCuffsThighLeft",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "Cuff", 1),
		...GetModelLayers("ShacklesThighLeft", "Band", "", "Band", 1.1),
		...GetModelLayers("ShacklesThighLeft", "Lock", "", "Lock", 1.15),
	])
});

AddModel({
	Name: "KittyPawCuffsThighRight",
	Folder: "KittyPawCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "KittyPawCuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "Cuff", 1),
		...GetModelLayers("ShacklesThighRight", "Band", "", "Band", 1.1),
		...GetModelLayers("ShacklesThighRight", "Lock", "", "Lock", 1.15),
	])
});


AddModel({
	Name: "KittyPawCuffsThigh",
	Folder: "KittyPawCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPawCuffsThighRight"),
		...GetModelLayers("KittyPawCuffsThighLeft"),
	])
});

AddModel(GetModelFashionVersion("KittyPawCuffsWristLeft", true));
AddModel(GetModelFashionVersion("KittyPawCuffsWristRight", true));
AddModel(GetModelFashionVersion("KittyPawCuffsWrists", true));
AddModel(GetModelFashionVersion("KittyPawCuffsElbowLeft", true));
AddModel(GetModelFashionVersion("KittyPawCuffsElbowRight", true));
AddModel(GetModelFashionVersion("KittyPawCuffsElbows", true));
AddModel(GetModelFashionVersion("KittyPawCuffsArms", true));
AddModel(GetModelFashionVersion("KittyPawCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("KittyPawCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("KittyPawCuffsAnkles", true));
AddModel(GetModelFashionVersion("KittyPawCuffsThighLeft", true));
AddModel(GetModelFashionVersion("KittyPawCuffsThighRight", true));
AddModel(GetModelFashionVersion("KittyPawCuffsThigh", true));