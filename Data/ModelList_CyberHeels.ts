/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "CyberBalletHeels",
	Folder: "CyberHeels",
	TopLevel: true,
	Parent: "BalletHeels",
	Categories: ["Shoes", "Heels"],
	AddPose: ["Ballet"],
	RemovePoses: ["TapeBoots"],
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
			EraseZBonus: 100,
		},



		{ Name: "GlowBalletLeft", Layer: "ShoeLeftOver", Pri: 52.1,
			HideWhenOverridden: true,
			InheritColor: "Glow",
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			Poses: ToMap([...CALFLEFTPOSES]),
			NoOverride: true,
			TieToLayer: "ShinyBalletLeft",

			DisplacementSprite: "BalletCuffs",
			DisplaceZBonus: 10000,
			DisplaceAmount: 70,
			DisplaceLayers: ToMap(["BalletHeelsCuffs"]),
		},
		{ Name: "GlowBalletRight", Layer: "ShoeRightOver", Pri: 52.1,
			HideWhenOverridden: true,
			InheritColor: "Glow",
			Poses: ToMap([...CALFRIGHTPOSES, "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
			SwapLayerPose: {Kneel: "ShoeRightKneel"},
			NoOverride: true,
			TieToLayer: "ShinyBalletRight",
		},
	])
});


AddModel(GetModelRestraintVersion("CyberBalletHeels", true,
	["RestrainingShoes"],
	["TapeBoots"]));

