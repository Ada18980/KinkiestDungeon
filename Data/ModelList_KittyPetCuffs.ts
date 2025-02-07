/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "KittyPetCuffsWristLeft",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesWristLeft", "Band", "", "Band", 0.4),
	])
});
AddModel({
	Name: "KittyPetCuffsWristRight",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesWristRight", "Band", "", "Band", 0.4),
	])
});

AddModel({
	Name: "KittyPetCuffsWrists",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetCuffsWristLeft"),
		...GetModelLayers("KittyPetCuffsWristRight"),
	])
});



AddModel({
	Name: "KittyPetCuffsElbowLeft",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		{ Name: "ElbowLeft", Layer: "BindElbowLeft", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			DisplacementSprite: "ElbowCuffLeft",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
			HidePoses: ToMap(["EncaseArmLeft"]),
		},

		{ Name: "BandElbowLeft", Layer: "BindElbowLeft", Pri: 1.4,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Band",
			HidePoses: ToMap(["EncaseArmLeft"]),
			TieToLayer: "ElbowLeft",
			NoOverride: true,
		},

	])
});
AddModel({
	Name: "KittyPetCuffsElbowRight",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		{ Name: "ElbowRight", Layer: "BindElbowRight", Pri: 1,
			Poses: ToMapSubtract([...ARMPOSES], ["Free"]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			DisplacementSprite: "ElbowCuffRight",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 100,
			InheritColor: "BaseMetal",
			HidePoses: ToMap(["EncaseArmRight"]),
		},

		{ Name: "BandElbowRight", Layer: "BindElbowRight", Pri: 1.4,
			Poses: ToMapSubtract([...ARMPOSES], ["Free"]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			InheritColor: "Band",
			HidePoses: ToMap(["EncaseArmRight"]),
			TieToLayer: "ElbowRight",
			NoOverride: true,
		},

	])
});

AddModel({
	Name: "KittyPetCuffsElbows",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetCuffsElbowLeft"),
		...GetModelLayers("KittyPetCuffsElbowRight"),
	])
});

AddModel({
	Name: "KittyPetCuffsArms",
	Folder: "KittyPetCuffs",
	TopLevel: true,
	Parent: "KittyPetCuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetCuffsWrists"),
		...GetModelLayers("KittyPetCuffsElbows"),
	])
});

AddModel({
	Name: "KittyPetCuffsAnklesLeft",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesAnklesLeft", "Band", "", "Band", 0.4),
	])
});

AddModel({
	Name: "KittyPetCuffsAnklesRight",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesAnklesRight", "Band", "", "Band", 0.4),
	])
});


AddModel({
	Name: "KittyPetCuffsAnkles",
	Folder: "KittyPetCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetCuffsAnklesRight"),
		...GetModelLayers("KittyPetCuffsAnklesLeft"),
	])
});



AddModel({
	Name: "KittyPetCuffsThighLeft",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "Cuff"),
		...GetModelLayers("ShacklesThighLeft", "Band", "", "Band", 0.4),
	])
});

AddModel({
	Name: "KittyPetCuffsThighRight",
	Folder: "KittyPetCuffs",
	TopLevel: false,
	Parent: "KittyPetCuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "Cuff"),
		...GetModelLayers("ShacklesThighRight", "Band", "", "Band", 0.4),
	])
});


AddModel({
	Name: "KittyPetCuffsThigh",
	Folder: "KittyPetCuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetCuffsThighRight"),
		...GetModelLayers("KittyPetCuffsThighLeft"),
	])
});


AddModel({
	Name: "KittyPetCuffsCollar",
	Folder: "KittyPetCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("IronCollar", "", "", "Cuff"),
		...GetModelLayers("IronCollar", "Band", "", "Band", 0.4),
	])
});




AddModel(GetModelFashionVersion("KittyPetCuffsCollar", true));
AddModel(GetModelFashionVersion("KittyPetCuffsWristLeft", true));
AddModel(GetModelFashionVersion("KittyPetCuffsWristRight", true));
AddModel(GetModelFashionVersion("KittyPetCuffsWrists", true));
AddModel(GetModelFashionVersion("KittyPetCuffsElbowLeft", true));
AddModel(GetModelFashionVersion("KittyPetCuffsElbowRight", true));
AddModel(GetModelFashionVersion("KittyPetCuffsElbows", true));
AddModel(GetModelFashionVersion("KittyPetCuffsArms", true));
AddModel(GetModelFashionVersion("KittyPetCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("KittyPetCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("KittyPetCuffsAnkles", true));
AddModel(GetModelFashionVersion("KittyPetCuffsThighLeft", true));
AddModel(GetModelFashionVersion("KittyPetCuffsThighRight", true));
AddModel(GetModelFashionVersion("KittyPetCuffsThigh", true));