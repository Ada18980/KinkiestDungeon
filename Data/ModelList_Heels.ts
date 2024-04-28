/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BalletHeels",
	Folder: "Heels",
	TopLevel: true,
	Restraint: false,
	Categories: ["Shoes", "Heels"],
	AddPose: ["Ballet"],
	Layers: ToLayerMap([
		{ Name: "BalletLeft", Layer: "ShoeLeftOver", Pri: 50, // Bondage overrides plate mail
			HideWhenOverridden: true,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			DisplacementSprite: "Ballet",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["BalletHeels"]),
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread"},
			EraseSprite: "BalletErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["BalletHeels"]),
		},
		{ Name: "BalletRight", Layer: "ShoeRightOver", Pri: 50, // Bondage overrides plate mail
			HideWhenOverridden: true,
			InheritColor: "Shoe",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "BalletRightErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["BalletHeelRight"]),
		},


		{ Name: "BalletSoleLeft", Layer: "ShoeLeftOver", Pri: 50.1,
			HideWhenOverridden: true,
			InheritColor: "Sole",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			NoOverride: true,
			TieToLayer: "BalletLeft",

			DisplacementSprite: "BalletCuffs",
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["BalletHeelsCuffs"]),
		},
		{ Name: "BalletSoleRight", Layer: "ShoeRightOver", Pri: 50.1,
			HideWhenOverridden: true,
			InheritColor: "Sole",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			NoOverride: true,
			TieToLayer: "BalletRight",
		},


		{ Name: "BalletLaceLeft", Layer: "ShoeLeftOver", Pri: 50.2,
			HideWhenOverridden: true,
			InheritColor: "Laces",
			Poses: ToMap(["Closed", "Spread"]),
			NoOverride: true,
			TieToLayer: "BalletLeft",
		},
		{ Name: "BalletLaceRight", Layer: "ShoeRightOver", Pri: 50.2,
			HideWhenOverridden: true,
			InheritColor: "Laces",
			Poses: ToMap(["Closed", "Spread"]),
			NoOverride: true,
			TieToLayer: "BalletRight",
		},
	])
});


AddModel({
	Name: "FlatBalletHeels",
	Folder: "Heels",
	TopLevel: false,
	Parent: "BalletHeels",
	Restraint: false,
	Categories: ["Shoes", "Heels"],
	AddPose: ["Ballet"],
	Layers: ToLayerMap([
		{ Name: "FlatBalletLeft", Layer: "ShoeLeftOver", Pri: 51, // Bondage overrides plate mail
			HideWhenOverridden: true,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			DisplacementSprite: "Ballet",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["BalletHeels"]),
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread"},
			EraseSprite: "BalletErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["BalletHeels"]),
		},
		{ Name: "FlatBalletRight", Layer: "ShoeRightOver", Pri: 51, // Bondage overrides plate mail
			HideWhenOverridden: true,
			InheritColor: "Shoe",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "BalletRightErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["BalletHeelRight"]),
		},


		{ Name: "BalletSoleLeft", Layer: "ShoeLeftOver", Pri: 51.1,
			InheritColor: "Sole",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			NoOverride: true,
			TieToLayer: "FlatBalletLeft",
			DisplacementSprite: "BalletCuffs",
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["BalletHeelsCuffs"]),
		},
		{ Name: "BalletSoleRight", Layer: "ShoeRightOver", Pri: 51.1,
			InheritColor: "Sole",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			NoOverride: true,
			TieToLayer: "FlatBalletRight",
		},
	])
});
AddModel({
	Name: "ShinyBalletHeels",
	Folder: "Heels",
	TopLevel: false,
	Parent: "BalletHeels",
	Restraint: false,
	Categories: ["Shoes", "Heels"],
	AddPose: ["Ballet"],
	Layers: ToLayerMap([
		{ Name: "ShinyBalletLeft", Layer: "ShoeLeftOver", Pri: 52, // Bondage overrides plate mail
			HideWhenOverridden: true,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			DisplacementSprite: "Ballet",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["BalletHeels"]),
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread"},
			EraseSprite: "BalletErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["BalletHeels"]),
		},
		{ Name: "ShinyBalletRight", Layer: "ShoeRightOver", Pri: 52, // Bondage overrides plate mail
			HideWhenOverridden: true,
			InheritColor: "Shoe",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "BalletRightErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["BalletHeelRight"]),
		},


		{ Name: "BalletSoleLeft", Layer: "ShoeLeftOver", Pri: 52.1,
			HideWhenOverridden: true,
			InheritColor: "Sole",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			NoOverride: true,
			TieToLayer: "ShinyBalletLeft",
			DisplacementSprite: "BalletCuffs",
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["BalletHeelsCuffs"]),
		},
		{ Name: "BalletSoleRight", Layer: "ShoeRightOver", Pri: 52.1,
			HideWhenOverridden: true,
			InheritColor: "Sole",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			NoOverride: true,
			TieToLayer: "ShinyBalletRight",
		},
	])
});



AddModel(GetModelRestraintVersion("BalletHeels", true));
AddModel(GetModelRestraintVersion("FlatBalletHeels", true));
AddModel(GetModelRestraintVersion("ShinyBalletHeels", true));


AddModel({
	Name: "LeatherHeels",
	Folder: "Heels",
	TopLevel: true,
	Restraint: false,
	Categories: ["Shoes"],
	AddPose: ["Heels"],
	Layers: ToLayerMap([
		{ Name: "LeatherLeft", Layer: "ShoeLeft", Pri: 30,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...LEGPOSES]),
			SwapLayerPose: {Hogtie: "ShoeLeftHogtie"},
			DisplacementSprite: "Heels",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["Heels"]),
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread"},
			EraseSprite: "HeelsErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["Heels"]),
		},
		{ Name: "LeatherRight", Layer: "ShoeRight", Pri: 30,
			InheritColor: "Shoe",
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "HeelsRightErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["HeelRight"]),
		},
		{ Name: "LeatherLegLeft", Layer: "OverShoes", Pri: 31,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			Poses: ToMap(["Hogtie"]),
		},
		{ Name: "LeatherLegRight", Layer: "ShoeRight", Pri: 31,
			InheritColor: "Shoe",
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
	])
});




AddModel({
	Name: "TallHeels",
	Folder: "Heels",
	TopLevel: true,
	Restraint: false,
	Categories: ["Shoes"],
	AddPose: ["Heels"],
	Layers: ToLayerMap([
		{ Name: "TallLeft", Layer: "ShoeLeft", Pri: 26,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...LEGPOSES]),
			SwapLayerPose: {Hogtie: "ShoeLeftHogtie"},
			DisplacementSprite: "Heels",
			DisplaceAmount: 50,
			DisplaceLayers: ToMap(["Heels"]),
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread"},
			EraseSprite: "HeelsErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["Heels"]),
		},
		{ Name: "TallRight", Layer: "ShoeRight", Pri: 26,
			InheritColor: "Shoe",
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "HeelsRightErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["HeelRight"]),
		},
		{ Name: "TallLegLeft", Layer: "OverSocks", Pri: 27,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
		},
		{ Name: "TallLegRight", Layer: "ShoeRightUnder", Pri: 27,
			InheritColor: "Shoe",
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
	])
});


AddModel({
	Name: "TallHeelsRestraint",
	Folder: "Heels",
	TopLevel: true,
	Restraint: true,
	Categories: ["Shoes"],
	AddPose: ["Heels"],
	Layers: ToLayerMap([
		...GetModelLayers("TallHeels"),
	])
});



AddModel({
	Name: "TallBalletHeels",
	Folder: "TallBallet",
	TopLevel: true,
	Restraint: false,
	Categories: ["Shoes"],
	AddPose: ["Heels", "FeetCovered"],
	Layers: ToLayerMap([
		{ Name: "TallLeft", Layer: "ShoeLeft", Pri: 26,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...LEGPOSES]),
			SwapLayerPose: {Hogtie: "ShoeLeftHogtie"},


			DisplacementSprite: "Ballet",
			DisplaceAmount: 150,
			DisplaceLayers: ToMap(["Heels"]),
			EraseInvariant: true,
			EraseMorph: {Spread: "Spread"},
			EraseSprite: "BalletErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["Heels"]),
		},
		{ Name: "TallRight", Layer: "ShoeRight", Pri: 26,
			InheritColor: "Shoe",
			Poses: ToMapSubtract([...LEGPOSES], ["Hogtie", "KneelClosed"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			EraseInvariant: true,
			EraseMorph: {Closed: "Closed"},
			EraseSprite: "BalletRightErase",
			EraseAmount: 100,
			EraseLayers: ToMap(["HeelRight"]),
		},
		{ Name: "TallLegLeft", Layer: "OverShoes", Pri: 27,
			InheritColor: "Shoe",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
		},
		{ Name: "TallLegRight", Layer: "ShoeRightUnder", Pri: 27,
			InheritColor: "Shoe",
			Poses: ToMap(["Kneel", "KneelClosed", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["Hogtie"]),
		},
	])
});


AddModel({
	Name: "TallBalletHeelsRestraint",
	Folder: "TallBallet",
	TopLevel: true,
	Restraint: true,
	Categories: ["Shoes"],
	AddPose: ["Heels"],
	Layers: ToLayerMap([
		...GetModelLayers("TallHeels"),
	])
});

