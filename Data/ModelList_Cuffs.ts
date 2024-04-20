/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "ShacklesWristLeft",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		{ Name: "WristLeft", Layer: "BindWristLeft", Pri: 1,
			Poses: ToMapSubtract([...ARMPOSES], [...WRISTHIDELEFT]),
			SwapLayerPose: {Front: "BindForeWristLeft"},
			GlobalDefaultOverride: ToMap(["Front"]),
			DisplacementSprite: "CuffLeft",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 90,
			InheritColor: "BaseMetal",
		},
	])
});
AddModel({
	Name: "ShacklesWristRight",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		{ Name: "WristRight", Layer: "BindWristRight", Pri: 1,
			Poses: ToMapSubtract([...ARMPOSES], [...WRISTHIDERIGHT]),
			SwapLayerPose: {Front: "BindForeWristRight", Crossed: "BindCrossWristRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			DisplacementSprite: "CuffRight",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 90,
			InheritColor: "BaseMetal",
		},
	])
});

AddModel({
	Name: "ShacklesWrists",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft"),
		...GetModelLayers("ShacklesWristRight"),
	])
});



AddModel({
	Name: "ShacklesElbowLeft",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft"],
	Layers: ToLayerMap([
		{ Name: "ElbowLeft", Layer: "BindElbowLeft", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			SwapLayerPose: {Front: "BindForeElbowLeft", Crossed: "BindCrossElbowLeft", Up: "BindForeElbowLeft"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
			MorphPoses: {Crossed: "Front"},
			DisplacementSprite: "ElbowCuffLeft",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
			HidePoses: ToMap(["EncaseArmLeft"]),
		},
	])
});
AddModel({
	Name: "ShacklesElbowRight",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowRight"],
	Layers: ToLayerMap([
		{ Name: "ElbowRight", Layer: "BindElbowRight", Pri: 1,
			Poses: ToMapSubtract([...ARMPOSES], ["Free"]),
			SwapLayerPose: {Front: "BindForeElbowRight", Crossed: "BindCrossElbowRight", Up: "BindForeElbowRight"},
			GlobalDefaultOverride: ToMap(["Front"]),
			MorphPoses: {Crossed: "Front"},
			DisplacementSprite: "ElbowCuffRight",
			DisplaceLayers: ToMap(["Cuffs"]),
			DisplaceAmount: 100,
			InheritColor: "BaseMetal",
			HidePoses: ToMap(["EncaseArmRight"]),
		},
	])
});

AddModel({
	Name: "ShacklesElbows",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesElbowLeft"),
		...GetModelLayers("ShacklesElbowRight"),
	])
});

AddModel({
	Name: "ShacklesArms",
	Folder: "Cuffs",
	TopLevel: true,
	Parent: "Shackles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft"),
		...GetModelLayers("ShacklesWristRight"),
		...GetModelLayers("ShacklesElbowLeft"),
		...GetModelLayers("ShacklesElbowRight"),
	])
});

AddModel({
	Name: "ShacklesAnklesLeft",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		{ Name: "AnkleLeft", Layer: "AnkleLeft", Pri: 30,
			Poses: ToMap([...FOOTLEFTPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "AnkleCuffLeft",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
		},
	])
});

AddModel({
	Name: "ShacklesAnklesRight",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		{ Name: "AnkleRight", Layer: "AnkleRight", Pri: 30,
			Poses: ToMap([...FOOTRIGHTPOSES]),
			DisplacementSprite: "AnkleCuffRight",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
		},
	])
});


AddModel({
	Name: "ShacklesAnkles",
	Folder: "Cuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight"),
		...GetModelLayers("ShacklesAnklesLeft"),
	])
});



AddModel({
	Name: "ShacklesThighLeft",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		{ Name: "ThighLeft", Layer: "ThighLeft", Pri: 30,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "ThighCuffsLeft",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
		},
	])
});

AddModel({
	Name: "ShacklesThighRight",
	Folder: "Cuffs",
	TopLevel: false,
	Parent: "ShacklesThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		{ Name: "ThighRight", Layer: "ThighRight", Pri: 30,
			Poses: ToMap([...LEGPOSES]),
			DisplacementSprite: "ThighCuffsRight",
			DisplaceLayers: ToMap(["LegCuffs"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
		},
	])
});


AddModel({
	Name: "ShacklesThigh",
	Folder: "Cuffs",
	TopLevel: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft", "LowCuffs"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight"),
		...GetModelLayers("ShacklesThighLeft"),
	])
});

AddModel({
	Name: "ThighLink",
	Folder: "Cuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs", "Links"],
	AddPose: ["ThighLink"],
	Layers: ToLayerMap([
		{ Name: "ThighLink", Layer: "BindChainLinksUnder", Pri: 0,
			Poses: ToMap(["Spread"]),
			AppendPose: {"HighCuffs": "High"}, // "LowCuffs": "",
		},
	])
});

AddModel({
	Name: "AnkleLink",
	Folder: "Cuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs", "Links"],
	AddPose: ["AnkleLink"],
	Layers: ToLayerMap([
		{ Name: "AnkleLink", Layer: "BindChainLinksUnder", Pri: 0,
			Poses: ToMap(["Spread"]),
		},
	])
});

AddModel({
	Name: "IronCollar",
	Folder: "Cuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 20,
			Invariant: true,
			InheritColor: "BaseMetal",
		},
	])
});

AddModel({
	Name: "IronCollarClip",
	Folder: "Cuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		{ Name: "Collar", Layer: "Collar", Pri: 20,
			Invariant: true,
			InheritColor: "BaseMetal",
		},
		{ Name: "CollarHardware", Layer: "Collar", Pri: 20,
			Invariant: true,
			InheritColor: "Hardware",
		},
	])
});


AddModel({
	Name: "SteelCollar",
	Folder: "Cuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		{ Name: "SteelCollar", Layer: "Collar", Pri: 25,
			Invariant: true,
			InheritColor: "BaseMetal",
		},
	])
});

AddModel({
	Name: "SteelCollarRunes",
	Parent: "SteelCollar",
	Folder: "Cuffs",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		...GetModelLayers("SteelCollar"),
		{ Name: "SteelCollarRunes", Layer: "Collar", Pri: 25.1,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "SteelCollar",
			InheritColor: "Runes",
		},
	])
});


AddModel({
	Name: "IronBelt",
	Folder: "Cuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Accessories"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "BeltBondage", Pri: 25,
			Invariant: true,
			DisplacementSprite: "Belt",
			DisplaceLayers: ToMap(["RopeTorso"]),
			DisplaceAmount: 50,
			InheritColor: "BaseMetal",
		},
	])
});




AddModel(GetModelFashionVersion("IronCollar", true));
AddModel(GetModelFashionVersion("IronCollarClip", true));
AddModel(GetModelFashionVersion("IronBelt", true));
AddModel(GetModelFashionVersion("SteelCollarRunes", true));
AddModel(GetModelFashionVersion("SteelCollar", true));
AddModel(GetModelFashionVersion("ShacklesWristLeft", true));
AddModel(GetModelFashionVersion("ShacklesWristRight", true));
AddModel(GetModelFashionVersion("ShacklesWrists", true));
AddModel(GetModelFashionVersion("ShacklesElbowLeft", true));
AddModel(GetModelFashionVersion("ShacklesElbowRight", true));
AddModel(GetModelFashionVersion("ShacklesElbows", true));
AddModel(GetModelFashionVersion("ShacklesArms", true));
AddModel(GetModelFashionVersion("ShacklesAnklesLeft", true));
AddModel(GetModelFashionVersion("ShacklesAnklesRight", true));
AddModel(GetModelFashionVersion("ShacklesAnkles", true));
AddModel(GetModelFashionVersion("ShacklesThighLeft", true));
AddModel(GetModelFashionVersion("ShacklesThighRight", true));
AddModel(GetModelFashionVersion("ShacklesThigh", true));
AddModel(GetModelFashionVersion("ThighLink", true));
AddModel(GetModelFashionVersion("AnkleLink", true));

