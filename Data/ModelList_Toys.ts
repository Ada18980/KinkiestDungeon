/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "NippleClamps",
	Folder: "Nipples",
	Parent: "NippleClamps",
	TopLevel: true,
	Categories: ["Toys", "Clamps"],
	Filters: {"Clamps":{"gamma":0.5666666666666667,"saturation":0.25,"contrast":0.95,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"ClampsBullet":{"gamma":1,"saturation":1,"contrast":2.2,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}},
	Layers: ToLayerMap([
		{ Name: "Clamps", Layer: "NippleToys", Pri: 50,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Base",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
		{ Name: "ClampsBullet", Layer: "NippleToys", Pri: 49.9,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Clamps",
			InheritColor: "Vibe",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
	])
});
AddModel(GetModelRestraintVersion("NippleClamps", true));

AddModel({
	Name: "RingVibes",
	Folder: "Nipples",
	Parent: "NippleClamps",
	TopLevel: true,
	Categories: ["Toys", "Clamps"],
	//Filters: {"Clamps":{"gamma":0.5666666666666667,"saturation":0.25,"contrast":0.95,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"ClampsBullet":{"gamma":1,"saturation":1,"contrast":2.2,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}},
	Layers: ToLayerMap([
		{ Name: "Rings", Layer: "NippleToys", Pri: 10,
			Invariant: true,
			InheritColor: "Base",
			NoOverride: true,
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
		{ Name: "RingsBullet", Layer: "NippleToys", Pri: 9.9,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Clamps",
			InheritColor: "Vibe",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
	])
});
AddModel(GetModelRestraintVersion("RingVibes", true));

AddModel({
	Name: "NippleWeights",
	Folder: "Nipples",
	Parent: "NippleClamps",
	TopLevel: true,
	Categories: ["Toys", "Clamps"],
	//Filters: {"Clamps":{"gamma":0.5666666666666667,"saturation":0.25,"contrast":0.95,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"ClampsBullet":{"gamma":1,"saturation":1,"contrast":2.2,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}},
	Layers: ToLayerMap([
		{ Name: "Weights", Layer: "NippleToys", Pri: 40,
			Invariant: true,
			InheritColor: "Base",
			HideWhenOverridden: true,
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
	])
});
AddModel(GetModelRestraintVersion("NippleWeights", true));

AddModel({
	Name: "VibePiercings",
	Folder: "Nipples",
	Parent: "NippleClamps",
	TopLevel: true,
	Categories: ["Toys", "Piercings"],
	//Filters: {"Clamps":{"gamma":0.5666666666666667,"saturation":0.25,"contrast":0.95,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"ClampsBullet":{"gamma":1,"saturation":1,"contrast":2.2,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}},
	Layers: ToLayerMap([
		{ Name: "VibePiercings", Layer: "NippleToys", Pri: 40,
			Invariant: true,
			HideWhenOverridden: true,
			InheritColor: "Base",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNipplePiercings: true}
		},
		{ Name: "VibePiercingsBullet", Layer: "NippleToys", Pri: 39.9,
			Invariant: true,
			NoOverride: true,
			TieToLayer: "Clamps",
			InheritColor: "Vibe",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNipplePiercings: true}
		},
		// Replace with clamps
		{ Name: "Clamps", Layer: "NippleToys", Pri: 50,
			Invariant: true,
			Poses: {HideNipplePiercings: true},
			HideWhenOverridden: true,
			InheritColor: "Base",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
		{ Name: "ClampsBullet", Layer: "NippleToys", Pri: 49.9,
			Invariant: true,
			Poses: {HideNipplePiercings: true},
			NoOverride: true,
			TieToLayer: "Clamps",
			InheritColor: "Vibe",
			SwapLayerPose: {NippleToysOption: "NippleToysOption"},
			HidePoses: {HideNippleToys: true}
		},
	])
});
AddModel(GetModelRestraintVersion("VibePiercings", true));