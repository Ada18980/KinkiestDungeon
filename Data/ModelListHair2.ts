/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "AuraHair",
	Folder: "Hair2",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "HairAura_Front", Layer: "Hair", Pri: 1,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Front",
		},
		{ Name: "HairAura", Layer: "HairFront", Pri: 4,
			InheritColor: "Sides",
		},
	])
});



AddModel({
	Name: "AuraBang_Left",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "AuraHair",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "HairAura_Left", Layer: "Hair", Pri: -100,
			InheritColor: "Bang",
		},
		{ Name: "HairAura_LeftB", Layer: "Hair", Pri: -105,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "AuraBang_Right",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "AuraHair",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "HairAura_Right", Layer: "Hair", Pri: -100,
			InheritColor: "Bang",
		},
		{ Name: "HairAura_RightB", Layer: "Hair", Pri: -105,
			InheritColor: "Tail",
		},
	])
});



AddModel({
	Name: "AuraBang_Left_Back",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "AuraHair",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "HairAura_Left", Layer: "Hair", Pri: -100,
			InheritColor: "Bang",
		},
		{ Name: "HairAura_LeftB", Layer: "HairBack", Pri: -5,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "AuraBang_Right_Back",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "AuraHair",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "HairAura_Right", Layer: "Hair", Pri: 0,
			InheritColor: "Bang",
		},
		{ Name: "HairAura_RightB", Layer: "HairBack", Pri: -5,
			InheritColor: "Tail",
		},
	])
});


AddModel({
	Name: "Hair2",
	Folder: "Hair2",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair2_Front", Layer: "Hair", Pri: 9,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Front",
		},
		{ Name: "Hair2_FrontB", Layer: "HairFront", Pri: -5,
			InheritColor: "LeftSideBang",
		},
		{ Name: "Hair2_FrontC", Layer: "HairFront", Pri: -5,
			InheritColor: "RightSideBang",
		},
	])
});
AddModel({
	Name: "Hair2_LeftPuff",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair2",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "Hair2_Left", Layer: "Hair", Pri: 40,
			InheritColor: "LeftPuff",
		},
	])
});
AddModel({
	Name: "Hair2_RightPuff",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair2",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	Layers: ToLayerMap([
		{ Name: "Hair2_Right", Layer: "Hair", Pri: 40,
			InheritColor: "RightPuff",
		},
	])
});


AddModel({
	Name: "Hair3",
	Folder: "Hair2",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair3_FrontA", Layer: "Hair", Pri: 9,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Hair",
		},
		{ Name: "Hair3_FrontC", Layer: "HairFront", Pri: 30,
			InheritColor: "Bangs",
		},
		{ Name: "Hair3_FrontD", Layer: "HairFront", Pri: 31,
			InheritColor: "Under",
			TieToLayer: "Hair3_FrontC",
		},
	])
});
AddModel({
	Name: "Hair3_Short",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair3_Long",
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair3_FrontA", Layer: "Hair", Pri: 9,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Hair",
		},
		{ Name: "Hair3_FrontC", Layer: "HairFront", Pri: 30,
			InheritColor: "Bangs",
		},
		{ Name: "Hair3_FrontD", Layer: "HairFront", Pri: 31,
			InheritColor: "Under",
			TieToLayer: "Hair3_FrontC",
		},
	])
});
AddModel({
	Name: "Hair3_Bangs",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair3_Long",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair3_FrontE", Layer: "HairFront", Pri: 40,
			InheritColor: "Bangs",
		},
	])
});
AddModel({
	Name: "Hair3Back",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair3_Long",
	Protected: true,
	Categories: ["Hairstyles", "BackHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair3_Back", Layer: "HairBack", Pri: -40,
			InheritColor: "Back",
		},
	])
});


AddModel({
	Name: "Hair4",
	Folder: "Hair2",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair4_Front", Layer: "Hair", Pri: 4,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Hair",
		},
		{ Name: "Hair4_FrontB", Layer: "HairFront", Pri: 5,
			InheritColor: "Front",
		},
	])
});

AddModel({
	Name: "Hair4_TailLeft",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair4",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair4_Left", Layer: "HairBack", Pri: -5,
			InheritColor: "Tail",
		},
		{ Name: "Hair4_LeftB", Layer: "HairBack", Pri: -4.9,
			InheritColor: "Highlight",
		},
	])
});
AddModel({
	Name: "Hair4_TailRight",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair4",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair4_Right", Layer: "HairBack", Pri: -5,
			InheritColor: "Tail",
		},
		{ Name: "Hair4_RightB", Layer: "HairBack", Pri: -4.9,
			InheritColor: "Highlight",
		},
	])
});


AddModel({
	Name: "Hair5",
	Folder: "Hair2",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair5_Front", Layer: "Hair", Pri: 4,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Hair",
		},
		{ Name: "Hair5_FrontB", Layer: "HairFront", Pri: 5,
			InheritColor: "FrontLeft",
		},
		{ Name: "Hair5_FrontC", Layer: "HairFront", Pri: 5.2,
			InheritColor: "Under",
		},
	])
});
AddModel({
	Name: "Hair5_Highlight",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair5",
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair5_FrontD", Layer: "HairFront", Pri: 6,
			InheritColor: "HighlightLeft",
		},
		{ Name: "Hair5_FrontE", Layer: "HairFront", Pri: 6,
			InheritColor: "HighlightRight",
		},
	])
});

AddModel({
	Name: "Hair5_TailLeft",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair5",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair5_Left", Layer: "HairBack", Pri: -4,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Hair5_TailRight",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair5",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair5_Right", Layer: "HairBack", Pri: -4,
			InheritColor: "Tail",
		},
	])
});



AddModel({
	Name: "Hair6",
	Folder: "Hair2",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "FrontHair"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair6_Front", Layer: "Hair", Pri: 7,
			SwapLayerPose: {HoodMask: "HairOver"},
			InheritColor: "Hair",
		},
		{ Name: "Hair6_FrontB", Layer: "HairFront", Pri: 8,
			InheritColor: "FrontLeft",
		},
	])
});


AddModel({
	Name: "Hair6_TailLeft",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair6",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair6_Left", Layer: "HairBack", Pri: 30,
			InheritColor: "Tail",
		},
	])
});
AddModel({
	Name: "Hair6_TailRight",
	Folder: "Hair2",
	TopLevel: false,
	Parent: "Hair6",
	Protected: true,
	Categories: ["Hairstyles"],
	AddPose: ["Hair"],
	Layers: ToLayerMap([
		{ Name: "Hair6_Right", Layer: "HairBack", Pri: 30,
			InheritColor: "Tail",
		},
	])
});