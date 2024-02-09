/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */



AddModel({
	Name: "Bubble",
	Folder: "Bubble",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Latex"],
	AddPose: ["BubbleHogtie", "PreferKneel", "ShiftRight"],
	Layers: ToLayerMap([
		{ Name: "Bubble", Layer: "FurnitureFront", Pri: -40,
			Invariant: true,
			OffsetY: 350,
			EraseSprite: "Bubble",
			EraseLayers: ToMap(["Bubble"]),
		},
	])
});

AddModel({
	Name: "SlimeBubble",
	Folder: "Bubble",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Latex"],
	AddPose: ["BubbleHogtie", "PreferKneel", "ShiftRight"],
	Filters: {
		Bubble: {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":1.2166666666666668,"red":1.7000000000000002,"green":0.5166666666666666,"blue":2.3833333333333333,"alpha":1},
	},
	Layers: ToLayerMap([
		{ Name: "Bubble", Layer: "FurnitureFront", Pri: -40,
			Invariant: true,
			OffsetY: 350,
			EraseSprite: "Bubble",
			EraseLayers: ToMap(["Bubble"]),
		},
	])
});
AddModel({
	Name: "BubbleSquishy",
	Folder: "Bubble",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Latex"],
	AddPose: ["UprightHogtie", "PreferKneel", "ShiftRight"],
	Layers: ToLayerMap([
		{ Name: "BubbleSquishy", Layer: "FurnitureFront", Pri: -50,
			Invariant: true,
			OffsetY: 350,
			EraseSprite: "Bubble",
			EraseLayers: ToMap(["Bubble"]),
		},
		{ Name: "BubbleSquishyBack", Layer: "FurnitureBack", Pri: 50,
			Invariant: true,
			NoErase: true,
			OffsetY: 350,
		},
	])
});
AddModel({
	Name: "LatexSphere",
	Folder: "Bubble",
	TopLevel: true,
	Group: "Devices",
	Restraint: true,
	Categories: ["Restraints","Furniture", "Latex"],
	AddPose: ["UprightHogtie", "PreferKneel", "ShiftRight"],
	Layers: ToLayerMap([
		{ Name: "LatexSphere", Layer: "FurnitureFront", Pri: 21,
			Invariant: true,
			OffsetY: 350,
			Poses: {Menu: true},
			HidePoses: ToMap(["Xray"]),
		},
		{ Name: "LatexSphereCutaway", Layer: "FurnitureFront", Pri: 20,
			Invariant: true,
			OffsetY: 350,
			NoErase: true,
		},
		{ Name: "LatexSphereCutawayBack", Layer: "FurnitureBack", Pri: -20,
			Invariant: true,
			OffsetY: 350,
			NoErase: true,
			EraseSprite: "Bubble2",
			EraseLayers: ToMap(["Bubble"]),
		},
	])
});


AddModel({
	Name: "BubbleHead",
	Folder: "Bubble",
	TopLevel: true,
	Restraint: true,
	Categories: ["Restraints", "Latex"],
	Filters: {
		Bubble: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5},
	},
	Layers: ToLayerMap([
		{ Name: "Head", Layer: "InflatableHead", Pri: 50,
			Invariant: true,
			EraseSprite: "BubbleHead",
			EraseInvariant: true,
			EraseLayers: ToMap(["HairHelmet"]),
			InheritColor: "Bubble",
		},
	])
});
AddModel(GetModelFashionVersion("BubbleHead", true));
AddModel({
	Name: "BubbleArms",
	Folder: "Bubble",
	TopLevel: false,
	Parent: "BubbleHead",
	Restraint: true,
	Categories: ["Restraints", "Latex"],
	Filters: {
		Bubble: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5},
	},
	Layers: ToLayerMap([
		{ Name: "Arms", Layer: "InflatableArms", Pri: 50,
			Invariant: true,
			InheritColor: "Bubble",
		},
	])
});
AddModel({
	Name: "BubbleLegs",
	Folder: "Bubble",
	TopLevel: false,
	Parent: "BubbleHead",
	Categories: ["Restraints", "Latex"],
	Filters: {
		Bubble: {"gamma":1,"saturation":1,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":0.5},
	},
	Layers: ToLayerMap([
		{ Name: "Legs", Layer: "InflatableLegs", Pri: 50,
			Invariant: true,
			InheritColor: "Bubble",
		},
	])
});
AddModel(GetModelFashionVersion("BubbleLegs", true));