/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "HighSecCuffsWristLeft",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristLeft", "", "", "Cuff", 4),
		...GetModelLayers("ShacklesWristLeft", "Band", "", "Band", 4.1),
		...GetModelLayers("ShacklesWristLeft", "Hardware", "", "Hardware", 4.1),
	])
});
AddModel({
	Name: "HighSecCuffsWristRight",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesWristRight", "", "", "Cuff", 4),
		...GetModelLayers("ShacklesWristRight", "Band", "", "Band", 4.1),
		...GetModelLayers("ShacklesWristRight", "Hardware", "", "Hardware", 4.1),
	])
});

AddModel({
	Name: "HighSecCuffsWrists",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsArms",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("HighSecCuffsWristLeft"),
		...GetModelLayers("HighSecCuffsWristRight"),
	])
});

AddModel({
	Name: "HighSecCuffsArms",
	Folder: "HighSecCuffs",
	TopLevel: true,
	Restraint: true,
	Parent: "HighSecCuffs",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("HighSecCuffsWrists"),
		//...GetModelLayers("HighSecCuffsElbows"),
	])
});

AddModel({
	Name: "HighSecCuffsAnklesLeft",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesLeft", "", "", "Cuff", 4).map(
			(cuff) => {
				cuff.AppendPose = {AnkleLink: "Chained"}
				return cuff;
			}
		),
		...GetModelLayers("ShacklesAnklesLeft", "Band", "", "Band", 4.1).map(
			(cuff) => {
				cuff.AppendPose = {AnkleLink: "Chained"}
				return cuff;
			}
		),
		...GetModelLayers("ShacklesAnklesLeft", "Hardware", "", "Hardware", 4.1).map(
			(cuff) => {
				cuff.AppendPose = {AnkleLink: "Chained"}
				return cuff;
			}
		),
	])
});

AddModel({
	Name: "HighSecCuffsAnklesRight",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsAnkles",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesAnklesRight", "", "", "Cuff", 4).map(
			(cuff) => {
				cuff.AppendPose = {AnkleLink: "Chained"}
				return cuff;
			}
		),
		...GetModelLayers("ShacklesAnklesRight", "Band", "", "Band", 4.1).map(
			(cuff) => {
				cuff.AppendPose = {AnkleLink: "Chained"}
				return cuff;
			}
		),
		...GetModelLayers("ShacklesAnklesRight", "Hardware", "", "Hardware", 4.1).map(
			(cuff) => {
				cuff.AppendPose = {AnkleLink: "Chained"}
				return cuff;
			}
		),
	])
});


AddModel({
	Name: "HighSecCuffsAnkles",
	Folder: "HighSecCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["AnkleRight", "AnkleLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("HighSecCuffsAnklesRight"),
		...GetModelLayers("HighSecCuffsAnklesLeft"),
		{ Name: "AnkleLink", Layer: "BindChainLinksUnder", Pri: 2,
			Poses: ToMap(["Spread"]),
			RequirePoses: {AnkleLink: true},
			HideWhenOverridden: true,
		},
	])
});



AddModel({
	Name: "HighSecCuffsThighLeft",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighLeft", "", "", "Cuff", 4),
		...GetModelLayers("ShacklesThighLeft", "Band", "", "Band", 4.1),
		...GetModelLayers("ShacklesThighLeft", "Hardware", "", "Hardware", 4.1),
	])
});

AddModel({
	Name: "HighSecCuffsThighRight",
	Folder: "HighSecCuffs",
	TopLevel: false,
	Restraint: true,
	Parent: "HighSecCuffsThigh",
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight"],
	Layers: ToLayerMap([
		...GetModelLayers("ShacklesThighRight", "", "", "Cuff", 4),
		...GetModelLayers("ShacklesThighRight", "Band", "", "Band", 4.1),
		...GetModelLayers("ShacklesThighRight", "Hardware", "", "Hardware", 4.1),
	])
});


AddModel({
	Name: "HighSecCuffsThigh",
	Folder: "HighSecCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft"],
	Layers: ToLayerMap([
		...GetModelLayers("HighSecCuffsThighRight"),
		...GetModelLayers("HighSecCuffsThighLeft"),
		{ Name: "ThighLink", Layer: "BindChainLinksUnder", Pri: 2,
			Poses: ToMap(["Spread"]),
			HideWhenOverridden: true,
			RequirePoses: {ThighLink: true},
		},
	])
});


AddModel({
	Name: "HighSecCuffsFull",
	Folder: "HighSecCuffs",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints","Cuffs"],
	AddPose: ["ThighRight", "ThighLeft", "AnkleRight", "AnkleLeft", "ElbowLeft", "ElbowRight", "WristLeft", "WristRight"],
	Layers: ToLayerMap([
		...GetModelLayers("HighSecCuffsThighRight"),
		...GetModelLayers("HighSecCuffsThighLeft"),
		...GetModelLayers("HighSecCuffsAnklesRight"),
		...GetModelLayers("HighSecCuffsAnklesLeft"),
		...GetModelLayers("HighSecCuffsWrists"),
		
	])
});

AddModel(GetModelFashionVersion("HighSecCuffsWristLeft", true));
AddModel(GetModelFashionVersion("HighSecCuffsWristRight", true));
AddModel(GetModelFashionVersion("HighSecCuffsWrists", true));
AddModel(GetModelFashionVersion("HighSecCuffsAnklesLeft", true));
AddModel(GetModelFashionVersion("HighSecCuffsAnklesRight", true));
AddModel(GetModelFashionVersion("HighSecCuffsAnkles", true));
AddModel(GetModelFashionVersion("HighSecCuffsThighLeft", true));
AddModel(GetModelFashionVersion("HighSecCuffsThighRight", true));
AddModel(GetModelFashionVersion("HighSecCuffsThigh", true));