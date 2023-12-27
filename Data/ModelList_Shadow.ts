/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "ShadowHandsArms1",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms1", Layer: "BindChest", Pri: 50,
			DisplacementSprite: "Arm2Squish",
			DisplacementMorph: {Boxtie: "Boxtie",Wristtie: "Wristtie",Front: "Boxtie",Crossed: "Boxtie",},
			Poses: ToMap(["Boxtie", "Wristtie", "Front", "Crossed"]),
			DisplaceLayers: ToMap(["Ribbon1"]),
			Invariant: true,
			InheritColor: "Shadow",
		},
		/*{ Name: "LeftArm1", Layer: "BindArmLeft", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
		{ Name: "RightArm1", Layer: "BindArmRight", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},*/
	])
});
AddModel({
	Name: "ShadowHandsArms2",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Arms2", Layer: "StrapsUnderbust", Pri: 60,
			InheritColor: "Shadow",
			Invariant: true,
			DisplacementSprite: "Arm1Squish",
			DisplacementMorph: {Boxtie: "Boxtie",Wristtie: "Wristtie",Front: "Boxtie",Crossed: "Boxtie",},
			Poses: ToMap(["Boxtie", "Wristtie", "Front", "Crossed"]),
			DisplaceLayers: ToMap(["Ribbon1"]),
		},
		{ Name: "LeftArm2", Layer: "BindArmLeft", Pri: 60,
			InheritColor: "Shadow",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
		/*{ Name: "RightArm2", Layer: "BindArmRight", Pri: 60,
			InheritColor: "Belt",
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},*/
	])
});

AddModel({
	Name: "ShadowHandsArmsAll",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("ShadowHandsArms1"),
		...GetModelLayers("ShadowHandsArms2"),
	])
});




AddModel({
	Name: "ShadowHandsLegs1",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legs1", Layer: "Thighs", Pri: 60,
			Poses: ToMapSubtract([...LEGPOSES], ["Spread"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Shadow",
			DisplacementMorph: {Hogtie: "Hogtie", KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltLegs1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonThighs"]),
		},
		{ Name: "RightLegs1", Layer: "BindThighRight", Pri: 60,
			Poses: ToMap(["Kneel", "KneelClosed"]),
			InheritColor: "Belt",
		},
	])
});
AddModel({
	Name: "ShadowHandsLegs2",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Legs2", Layer: "Thighs", Pri: 60,
			Poses: ToMapSubtract([...LEGPOSES], ["Spread"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Shadow",
			DisplacementMorph: {Hogtie: "Hogtie", KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltLegs2Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonThighs"]),
		},
		{ Name: "RightLegs2", Layer: "BindThighRight", Pri: 60,
			Poses: ToMap(["Kneel", "KneelClosed"]),
			InheritColor: "Belt",
		},
	])
});

AddModel({
	Name: "ShadowHandsLegsAll",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		...GetModelLayers("ShadowHandsLegs1"),
		...GetModelLayers("ShadowHandsLegs2"),
	])
});


AddModel({
	Name: "ShadowHandsFeet",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Leather"],
	Layers: ToLayerMap([
		{ Name: "Feet1", Layer: "AnklesOver", Pri: 60,
			Poses: ToMapSubtract([...CLOSEDPOSES], ["Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Shadow",
			DisplacementMorph: {KneelClosed: "KneelClosed"},
			DisplacementSprite: "BeltFeet1Squish",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["RibbonCalf"]),
		},
	])
});





AddModel({
	Name: "ShadowHandsMouth",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints","Gags"],
	AddPose: ["FaceGag"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "GagOver", Pri: 9,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			InheritColor: "Shadow",
		},
	])
});



AddModel({
	Name: "ShadowHandsEyes",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Blindfolds"],
	AddPose: ["Blindfolds"],
	Layers: ToLayerMap([
		{ Name: "Eyes", Layer: "Hood", Pri: 90,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Shadow",
		},
	])
});

AddModel({
	Name: "ShadowHandsCrotch",
	Folder: "ShadowHands",
	Parent: "ShadowHandsArmsAll",
	TopLevel: false,
	Restraint: true,
	Categories: ["Restraints", "Ribbon"],
	AddPose: ["CrotchStrap"],
	Layers: ToLayerMap([
		{ Name: "Crotch", Layer: "HarnessMid", Pri: -105,
			//MorphPoses: {Kneel: "Kneel", KneelClosed: "Kneel"},
			Invariant: true,
			InheritColor: "Ribbon",
			DisplacementInvariant: true,
			DisplacementSprite: "CrotchropeSquished",
			DisplaceLayers: ToMap(["RibbonTorso"]),

		},
		{ Name: "CrotchStrap", Layer: "HarnessMid", Pri: -105.1,
			SwapLayerPose: {Kneel: "HarnessLower", KneelClosed: "HarnessLower"},
			Invariant: true,
			InheritColor: "Ribbon",
		},
	])
});
