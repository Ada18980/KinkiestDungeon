/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "NeoLinkArmLeft",
	Folder: "SteelCuffBands",
	TopLevel: false,
	Parent: "NeoLinkArms",
	Restraint: true,
	Categories: ["Restraints", "Links"],
	AddPose: ["NeoLinkWristLeft"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "LooseStraps", Pri: 5,
			Poses: ToMap(["Free", "Front", "Crossed"]),
			GlobalDefaultOverride: {Front: true, Crossed: true},
			SwapLayerPose: {Front: "ForeLooseStraps", Crossed: "ForeLooseStraps"},
			InheritColor: "LinkLeft",
			HideWhenOverridden: true,
			HidePoses: {"EncaseArmLeft": true, "EncaseArms": true},
			RequirePoses: {"NeoBelt": true},
			AppendPose: {"NeoWaistBelt": "Belt"},
		},
		{ Name: "ArmLeftHardware", Layer: "LooseStraps", Pri: 5.1,
			Poses: ToMap(["Free", "Front", "Crossed"]),
			GlobalDefaultOverride: {Front: true, Crossed: true},
			SwapLayerPose: {Front: "ForeLooseStraps", Crossed: "ForeLooseStraps"},
			InheritColor: "HardwareLeft",
			NoOverride: true,
			TieToLayer: "ArmLeft",
			AppendPose: {"NeoWaistBelt": "Belt"},
		},
	])
});
AddModel({
	Name: "NeoLinkArmRight",
	Folder: "SteelCuffBands",
	TopLevel: false,
	Parent: "NeoLinkArms",
	Restraint: true,
	Categories: ["Restraints","Links"],
	AddPose: ["NeoLinkWristRight"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "LooseStraps", Pri: 5,
			Poses: ToMap(["Free", "Front", "Crossed"]),
			GlobalDefaultOverride: {Front: true, Crossed: true},
			SwapLayerPose: {Front: "ForeLooseStraps", Crossed: "ForeLooseStraps"},
			InheritColor: "LinkRight",
			HideWhenOverridden: true,
			HidePoses: {"EncaseArmRight": true, "EncaseArms": true},
			RequirePoses: {"NeoBelt": true},
			AppendPose: {"NeoWaistBelt": "Belt"},
		},
		{ Name: "ArmRightHardware", Layer: "LooseStraps", Pri: 5.1,
			Poses: ToMap(["Free", "Front", "Crossed"]),
			GlobalDefaultOverride: {Front: true, Crossed: true},
			SwapLayerPose: {Front: "ForeLooseStraps", Crossed: "ForeLooseStraps"},
			InheritColor: "HardwareRight",
			NoOverride: true,
			TieToLayer: "ArmRight",
			AppendPose: {"NeoWaistBelt": "Belt"},
		},
	])
});
AddModel({
	Name: "NeoLinkArms",
	Folder: "SteelCuffBands",
	TopLevel: true,
	Parent: "NeoLinkArms",
	Restraint: true,
	Categories: ["Restraints","Links"],
	AddPose: ["NeoLinkWristRight", "NeoLinkWristLeft", "DiscourageYoked"],
	Layers: ToLayerMap([
		...GetModelLayers("NeoLinkArmLeft"),
		...GetModelLayers("NeoLinkArmRight"),
	])
});




AddModel(GetModelFashionVersion("NeoLinkArmLeft", true));
AddModel(GetModelFashionVersion("NeoLinkArmRight", true));
AddModel(GetModelFashionVersion("NeoLinkArms", true));






AddModel({
	Name: "NeoLinkThighLeft",
	Folder: "SteelCuffBands",
	TopLevel: false,
	Parent: "NeoLinkThighs",
	Restraint: true,
	Categories: ["Restraints", "Links"],
	AddPose: ["NeoLinkThighLeft"],
	Layers: ToLayerMap([
		{ Name: "ThighLeft", Layer: "OverGarters", Pri: 30,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighLinkLeft",
			NoOverride: true,

			HidePoses: {"EncaseTorsoLower": true},
			RequirePoses: {"NeoBelt": true},
			AppendPose: {"NeoChastityBelt": "", "NeoWaistBelt": "Belt"},
			SwapLayerPose: {"ChastityOption2": "OverGarters", "NeoChastityBelt": "Garters"},
		},
		{ Name: "ThighLeftHardware", Layer: "OverGarters", Pri: 30.1,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighHardwareLeft",
			NoOverride: true,
			TieToLayer: "ThighLeft",
			AppendPose: {"NeoChastityBelt": "", "NeoWaistBelt": "Belt"},
			SwapLayerPose: {"ChastityOption2": "OverGarters", "NeoChastityBelt": "Garters"},
		},
	])
});
AddModel({
	Name: "NeoLinkThighRight",
	Folder: "SteelCuffBands",
	TopLevel: false,
	Parent: "NeoLinkThighs",
	Restraint: true,
	Categories: ["Restraints","Links"],
	AddPose: ["NeoLinkThighRight"],
	Layers: ToLayerMap([
		{ Name: "ThighRight", Layer: "OverGarters", Pri: 30,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighLinkRight",
			NoOverride: true,
			HidePoses: {"EncaseTorsoLower": true},
			RequirePoses: {"NeoBelt": true},
			AppendPose: {"NeoChastityBelt": "", "NeoWaistBelt": "Belt"},
			SwapLayerPose: {"ChastityOption2": "OverGarters", "NeoChastityBelt": "Garters"},
		},
		{ Name: "ThighRightHardware", Layer: "OverGarters", Pri: 30.1,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighHardwareRight",
			NoOverride: true,
			TieToLayer: "ThighRight",
			AppendPose: {"NeoChastityBelt": "", "NeoWaistBelt": "Belt"},
			SwapLayerPose: {"ChastityOption2": "OverGarters", "NeoChastityBelt": "Garters"},
		},
	])
});
AddModel({
	Name: "NeoLinkThighs",
	Folder: "SteelCuffBands",
	TopLevel: true,
	Parent: "NeoLinkThighs",
	Restraint: true,
	Categories: ["Restraints","Links"],
	AddPose: ["NeoLinkThighRight", "NeoLinkThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("NeoLinkThighLeft"),
		...GetModelLayers("NeoLinkThighRight"),
	])
});





AddModel({
	Name: "FashionNeoLinkThighLeft",
	Folder: "SteelCuffBands",
	TopLevel: false,
	Parent: "NeoLinkThighs",
	Categories: ["FashionRestraints", "Links"],
	AddPose: ["NeoLinkThighLeft"],
	Layers: ToLayerMap([
		{ Name: "ThighLeft", Layer: "OverGarters", Pri: 30,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighLinkLeft",
			NoOverride: true,
		},
		{ Name: "ThighLeftHardware", Layer: "OverGarters", Pri: 30.1,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighHardwareLeft",
			NoOverride: true,
			TieToLayer: "ThighLeft",
		},
	])
});
AddModel({
	Name: "FashionNeoLinkThighRight",
	Folder: "SteelCuffBands",
	TopLevel: false,
	Parent: "NeoLinkThighs",
	Categories: ["FashionRestraints","Links"],
	AddPose: ["NeoLinkThighRight"],
	Layers: ToLayerMap([
		{ Name: "ThighRight", Layer: "OverGarters", Pri: 30,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighLinkRight",
			NoOverride: true,
		},
		{ Name: "ThighRightHardware", Layer: "OverGarters", Pri: 30.1,
			Poses: ToMap(["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"]),
			InheritColor: "ThighHardwareRight",
			NoOverride: true,
			TieToLayer: "ThighRight",
		},
	])
});
AddModel({
	Name: "FashionNeoLinkThighs",
	Folder: "SteelCuffBands",
	TopLevel: true,
	Parent: "NeoLinkThighs",
	Categories: ["FashionRestraints","Links"],
	AddPose: ["NeoLinkThighRight", "NeoLinkThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("FashionNeoLinkThighLeft"),
		...GetModelLayers("FashionNeoLinkThighRight"),
	])
});







AddModel({
	Name: "NeoThighLink",
	Folder: "SteelCuffBands",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs", "Links"],
	AddPose: ["ThighLink"],
	Layers: ToLayerMap([
		{ Name: "ThighLink", Layer: "BindChainLinksUnderThigh", Pri: 1.5,
			Poses: ToMap(["Spread"]),
			Invariant: true,
			//AppendPose: {"HighCuffs": "High"}, // "LowCuffs": "",
			HideWhenOverridden: true,
		},
		{ Name: "ThighLinkHardware", Layer: "BindChainLinksUnderThigh", Pri: 1.6,
			Poses: ToMap(["Spread"]),
			Invariant: true,
			//AppendPose: {"HighCuffs": "High"}, // "LowCuffs": "",
			NoOverride: true,
			TieToLayer: "ThighLink",
		},
	])
});

AddModel({
	Name: "NeoAnkleLink",
	Folder: "SteelCuffBands",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs", "Links"],
	AddPose: ["AnkleLink"],
	Layers: ToLayerMap([
		{ Name: "AnkleLink", Layer: "BindChainLinksUnder", Pri: 1.5,
			Poses: ToMap(["Spread"]),
			HideWhenOverridden: true,
			Invariant: true,
		},
		{ Name: "AnkleLinkHardware", Layer: "BindChainLinksUnder", Pri: 1.6,
			Poses: ToMap(["Spread"]),
			NoOverride: true,
			Invariant: true,
			TieToLayer: "AnkleLink",
		},
	])
});

AddModel(GetModelFashionVersion("NeoThighLink", true));
AddModel(GetModelFashionVersion("NeoAnkleLink", true));

AddModel({
	Name: "SteelCuffsWristLeft",
	Folder: "SteelCuffs",
	TopLevel: false,
	Parent: "CuffsArms",
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "NeoWristLeft"],
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
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight", "NeoWristRight"],
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
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight", "NeoWristRight", "NeoWristLeft"],
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
	Restraint: true,
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
	Restraint: true,
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
	Restraint: true,
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
	Restraint: true,
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight", "NeoWristLeft", "NeoWristRight"],
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
	Restraint: true,
	AddPose: ["AnkleLeft", "NeoAnkleLeft"],
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
	Restraint: true,
	AddPose: ["AnkleRight", "NeoAnkleRight"],
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
	Restraint: true,
	AddPose: ["AnkleRight", "AnkleLeft", "NeoAnkleLeft", "NeoAnkleRight"],
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
	Restraint: true,
	AddPose: ["ThighLeft", "NeoThighLeft"],
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
	Restraint: true,
	AddPose: ["ThighRight", "NeoThighRight"],
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
	Restraint: true,
	AddPose: ["ThighRight", "ThighLeft", "HighCuffs", "NeoThighLeft", "NeoThighRight"],
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
	AddPose: ["NeoBelt", "NeoWaistBelt"],
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