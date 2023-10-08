/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "TapeBoots",
	Folder: "TapeLight",
	Parent: "TapeBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "Feet", Layer: "OverShoes", Pri: 10,
			Poses: ToMap(["Closed", "KneelClosed"]),
			//GlobalDefaultOverride: ToMap(["KneelClosed"]),
			DisplacementSprite: "TapeAnklesSquish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RopeCalf"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeAnkles",
	Folder: "TapeLight",
	Parent: "TapeBottom",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "Ankles", Layer: "Ankles1", Pri: 0,
			Poses: ToMap(["Closed", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
	])
});


AddModel({
	Name: "TapeLegs",
	Folder: "TapeLight",
	TopLevel: false,
	Parent: "TapeBottom",
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "WrappingLegs", Pri: -5,
			Poses: ToMap(["Closed", "KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeBottom",
	Folder: "TapeLight",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	AddPose: ["FeetLinked"],
	Layers: ToLayerMap([
		//
	])
});

AddModel({
	Name: "TapeTorsoUpper",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "Top", Layer: "WrappingTorso", Pri: -4,
			Poses: ToMap(["Boxtie", "Crossed", "Wristtie"]),
			GlobalDefaultOverride: ToMap(["Crossed"]),
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeArmLeft",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "ArmLeft", Layer: "WrappingTorsoOver", Pri: -5, // BindArmLeft
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmLeft", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeLightLeft",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeArmRight",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "ArmRight", Layer: "WrappingTorsoOver", Pri: -5, // BindArmRight
			Poses: ToMap(["Boxtie", "Front", "Crossed", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeArmRight", Crossed: "BindCrossArmRight"},
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),

			DisplacementSprite: "TapeLightRight",
			DisplaceLayers: ToMap(["ArmsAllAndHarness"]),
			DisplacementMorph: {Crossed: "Crossed", Boxtie: "Boxtie", Wristtie: "Wristtie"},
			DisplacementInvariant: true,
			DisplaceAmount: 100,

			NoDisplace: true,
			InheritColor: "Tape",
		},
	])
});

AddModel({
	Name: "TapeArms",
	Folder: "TapeLight",
	Parent: "Tape",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		...GetModelLayers("TapeArmLeft"),
		...GetModelLayers("TapeArmRight"),
		...GetModelLayers("TapeTorsoUpper"),
	])
});


AddModel({
	Name: "TapeHandLeft",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "HandLeft", Layer: "BindHandLeft", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandLeft"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});
AddModel({
	Name: "TapeHandRight",
	Folder: "TapeLight",
	Parent: "TapeArms",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Tape"],
	Layers: ToLayerMap([
		{ Name: "HandRight", Layer: "BindHandRight", Pri: -5,
			Poses: ToMap(["Free", "Boxtie", "Front", "Up", "Wristtie"]),
			SwapLayerPose: {Front: "BindForeHandRight"},
			GlobalDefaultOverride: ToMap(["Front"]),
			InheritColor: "Tape",
		},
	])
});