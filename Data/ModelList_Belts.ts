/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BeltsArms1",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms1", Layer: "BindChest", Pri: 50,
			InheritColor: "Belt",
			DisplacementSprite: "Arm2Squish",
			DisplacementMorph: {Boxtie: "Boxtie",Wristtie: "Wristtie",Front: "Boxtie",Crossed: "Boxtie",},
			DisplaceLayers: ToMap(["Ribbon1"]),
			Invariant: true,
			NoOverride: true,
		},
		{ Name: "LeftArm1", Layer: "BindArmLeft", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
			NoOverride: true,
		},
		{ Name: "RightArm1", Layer: "BindArmRight", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "BeltsArms2",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms2", Layer: "StrapsUnderbust", Pri: 60,
			InheritColor: "Belt",
			Invariant: true,
			NoOverride: true,
			DisplacementSprite: "Arm1Squish",
			DisplacementMorph: {Boxtie: "Boxtie",Wristtie: "Wristtie",Front: "Boxtie",Crossed: "Boxtie",},
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		{ Name: "LeftArm2", Layer: "BindArmLeft", Pri: 60,
			InheritColor: "Belt",
			NoOverride: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
		{ Name: "RightArm2", Layer: "BindArmRight", Pri: 60,
			InheritColor: "Belt",
			NoOverride: true,
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
	])
});

AddModel({
	Name: "BeltsArmsAll",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("BeltsArms1"),
		...GetModelLayers("BeltsArms2"),
	])
});




AddModel({
	Name: "BeltsLegs1",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legs1", Layer: "Thighs", Pri: 60,
			Poses: ToMapSubtract([...LEGPOSES], ["Spread"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Belt",
			DisplacementMorph: {Hogtie: "Hogtie", KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltLegs1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonThighs"]),
			NoOverride: true,
		},
		{ Name: "RightLegs1", Layer: "BindThighRight", Pri: 60,
			Poses: ToMap(["Kneel", "KneelClosed"]),
			InheritColor: "Belt",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "BeltsLegs2",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legs2", Layer: "Thighs", Pri: 60,
			Poses: ToMapSubtract([...LEGPOSES], ["Spread"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Belt",
			DisplacementMorph: {Hogtie: "Hogtie", KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltLegs2Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonThighs"]),
			NoOverride: true,
		},
		{ Name: "RightLegs2", Layer: "BindThighRight", Pri: 60,
			Poses: ToMap(["Kneel", "KneelClosed"]),
			InheritColor: "Belt",
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "BeltsLegsAll",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("BeltsLegs1"),
		...GetModelLayers("BeltsLegs2"),
	])
});


AddModel({
	Name: "BeltsFeet1",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Feet1", Layer: "AnklesOver", Pri: 60,
			Poses: ToMapSubtract([...CLOSEDPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Belt",
			DisplacementMorph: {KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltFeet1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "BeltsFeet2",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Feet2", Layer: "AnklesOver", Pri: 60,
			Poses: ToMapSubtract([...CLOSEDPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Belt",
			DisplacementMorph: {KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltFeet2Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "BeltsFeetAll",
	Folder: "Belts",
	Parent: "Belt",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("BeltsFeet1"),
		...GetModelLayers("BeltsFeet2"),
	])
});


AddModel({
	Name: "Belt",
	Folder: "Belts",
	TopLevel: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Belt", Layer: "HarnessMid", Pri: 50,
			Invariant: true,
			InheritColor: "Belt",
			DisplacementSprite: "BeltSquish",
			DisplaceLayers: ToMap(["RibbonCalf"]),
			NoOverride: true,
		},
	])
});