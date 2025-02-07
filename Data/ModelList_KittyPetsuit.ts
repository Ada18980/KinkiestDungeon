/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
	Name: "KittyPetsuit",
	Folder: "KittyPetsuit",
	Parent: "KittyPetsuit",
	TopLevel: true,
	Categories: ["Restraints"],
	Restraint: true,
	AddPose: ["HideArms", "EncaseArmLeft", "EncaseArmRight", "EncaseUpper", "EncaseLower", "ForceKneel", "Petsuit"],
	HideLayerGroups: ["PetsuitArms"],
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "BindForeArms", Pri: -31,
			Invariant: true,
			Poses: ToMap(["Front"]),
		},
		{ Name: "ArmsPaws", Layer: "BindForeArms", Pri: -30.9,
			Invariant: true,
			Poses: ToMap(["Front"]),
			TieToLayer: "Arms",
		},
		{ Name: "Legs", Layer: "PetsuitLegs", Pri: -5,
			Poses: ToMap(["KneelClosed", "Kneel", "Hogtie"]),
			GlobalDefaultOverride: ToMap(["KneelClosed", "Hogtie"]),
		},
		{ Name: "LeftLegs", Layer: "PetsuitLegs", Pri: -5,
			Poses: ToMap(["KneelClosed", "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Legs",
			DisplaceAmount: 50,
			DisplacementInvariant: true,
			DisplaceLayers: ToMap(["Petsuit"]),
			DisplacementSprite: "PetsuitSquish",
		},
		{ Name: "LeftLegsPaws", Layer: "PetsuitLegs", Pri: -4.9,
			Poses: ToMap(["KneelClosed", "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "FeetPaws",
			NoOverride: true,
			TieToLayer: "LeftLegs",

		},
		{ Name: "FootRightKneel", Layer: "SockRightKneel", Pri: 25,
			Poses: ToMap(["KneelClosed", "Kneel"]),
			GlobalDefaultOverride: ToMap(["KneelClosed"]),
			InheritColor: "Legs",
			HideWhenOverridden: true,
		},
		{ Name: "FootLeftHogtie", Layer: "SockLeftHogtie", Pri: 25,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "Legs",
			HideWhenOverridden: true,
		},
		{ Name: "FootLeftHogtiePaws", Layer: "SockLeftHogtie", Pri: 25.1,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "FeetPaws",
			NoOverride: true,
			TieToLayer: "FootLeftHogtie",
		},

		{ Name: "Leotard", Layer: "BodysuitOver", Pri: 50,
			HideWhenOverridden: true,
			MorphPoses: {Hogtie: "Hogtie"},
			InheritColor: "LowerBody",
		},
		{ Name: "LeotardChest", Layer: "SuitChestOver", Pri: 50,
			HideWhenOverridden: true,
			InheritColor: "UpperBody",
		},
		{ Name: "Collar", Layer: "Collar", Pri: -100,
			InheritColor: "Collar",
			NoOverride: true,
		},
	])
});



AddModel({
	Name: "KittyPetSockLeft",
	Folder: "KittyPetSocks",
	Parent: "KittyPetSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingLeft: true,},
			DisplacementSprite: "SockLSquish_Long",
			DisplaceAmount: 10,
		},
		{ Name: "SockLeftPaws", Layer: "StockingLeft", Pri: -2.9,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			TieToLayer: "SockLeft",
			InheritColor: "PawLeft",
			NoOverride: true,
		},
		{ Name: "FootLeftHogtie", Layer: "SockLeftHogtie", Pri: -3.5,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
		{ Name: "FootLeftHogtiePaws", Layer: "SockLeftHogtie", Pri: -3.4,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "PawLeft",
			Invariant: true,
			TieToLayer: "FootLeftHogtie",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "KittyPetSockRight",
	Folder: "KittyPetSocks",
	Parent: "KittyPetSocks",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingRight: true,},
			DisplacementSprite: "SockRSquish_Long",
			DisplaceAmount: 10,
		},
		{ Name: "FootRightKneel", Layer: "SockRightKneel", Pri: -1.5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
		},
	])
});

AddModel({
	Name: "KittyPetSocks",
	Folder: "KittyPetSocks",
	Parent: "KittyPetLeotard",
	TopLevel: true,
	Categories: ["Socks"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetSockRight"),
		...GetModelLayers("KittyPetSockLeft"),
	])
});

AddModel(GetModelRestraintVersion("KittyPetSocks", true));



AddModel({
	Name: "KittyPetPawLeft",
	Folder: "KittyPetPaws",
	Parent: "KittyPetPaws",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingLeft: true,},
			DisplacementSprite: "SockLSquish_Long",
			DisplaceAmount: 10,
		},
		{ Name: "SockLeftPaws", Layer: "StockingLeft", Pri: -2.9,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			TieToLayer: "SockLeft",
			InheritColor: "PawLeft",
			NoOverride: true,
		},
		{ Name: "FootLeftHogtie", Layer: "SockLeftHogtie", Pri: -3.5,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
		{ Name: "FootLeftHogtiePaws", Layer: "SockLeftHogtie", Pri: -3.4,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "PawLeft",
			Invariant: true,
			TieToLayer: "FootLeftHogtie",
			NoOverride: true,
		},


		...GetModelLayers("KittyPawCuffsThighLeft",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
		...GetModelLayers("KittyPawCuffsAnklesLeft",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
	])
});
AddModel({
	Name: "KittyPetPawRight",
	Folder: "KittyPetPaws",
	Parent: "KittyPetPaws",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingRight: true,},
			DisplacementSprite: "SockRSquish_Long",
			DisplaceAmount: 10,
		},
		{ Name: "FootRightKneel", Layer: "SockRightKneel", Pri: -1.5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
			HideWhenOverridden: true,
		},
		...GetModelLayers("KittyPawCuffsThighRight",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
		...GetModelLayers("KittyPawCuffsAnklesRight",
			undefined, undefined, undefined, undefined, undefined, "KittyPawCuffs"),
	])
});

AddModel({
	Name: "KittyPetPaws",
	Folder: "KittyPetPaws",
	Parent: "KittyPetLeotard",
	TopLevel: true,
	Categories: ["Socks", "Cosplay"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetPawRight"),
		...GetModelLayers("KittyPetPawLeft"),
	])
});

AddModel(GetModelRestraintVersion("KittyPetPaws", true));



AddModel({
	Name: "KittyPetPawShortLeft",
	Folder: "KittyPetPawsShort",
	Parent: "KittyPetPaws",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: -3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingLeft: true,},
			DisplacementSprite: "SockLSquish_Long",
			DisplaceAmount: 10,
		},
		{ Name: "SockLeftPaws", Layer: "StockingLeft", Pri: -2.9,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			TieToLayer: "SockLeft",
			InheritColor: "PawLeft",
			NoOverride: true,
		},
		{ Name: "FootLeftHogtie", Layer: "SockLeftHogtie", Pri: -3.5,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
		},
		{ Name: "FootLeftHogtiePaws", Layer: "SockLeftHogtie", Pri: -3.4,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "PawLeft",
			Invariant: true,
			TieToLayer: "FootLeftHogtie",
			NoOverride: true,
		},
	])
});
AddModel({
	Name: "KittyPetPawShortRight",
	Folder: "KittyPetPawsShort",
	Parent: "KittyPetPaws",
	Categories: ["Socks"],
	TopLevel: false,
	Layers: ToLayerMap([
		{ Name: "SockRight", Layer: "StockingRight", Pri: -3,
			Poses: ToMap([...LEGPOSES]),
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			DisplaceLayers: {StockingRight: true,},
			DisplacementSprite: "SockRSquish_Long",
			DisplaceAmount: 10,
		},
		{ Name: "FootRightKneel", Layer: "SockRightKneel", Pri: -1.5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});

AddModel({
	Name: "KittyPetPawsShort",
	Folder: "KittyPetPawsShort",
	Parent: "KittyPetPaws",
	TopLevel: false,
	Categories: ["Socks", "Cosplay"],
	Layers: ToLayerMap([
		...GetModelLayers("KittyPetPawShortRight"),
		...GetModelLayers("KittyPetPawShortLeft"),
	])
});

AddModel(GetModelRestraintVersion("KittyPetPawsShort", true));