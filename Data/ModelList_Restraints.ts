/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */


AddModel({
	Name: "BallGag",
	Folder: "GagLeather",
	TopLevel: true,
	Group: "Mouth",
	Categories: ["Restraints","Gags"],
	AddPose: ["HideMouth"],
	Layers: ToLayerMap([
		{ Name: "Ball", Layer: "Gag", Pri: 1,
			Sprite: "Ball",
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Invariant: true,
			MorphPoses: {MouthFrown: "_Teeth", MouthPout: "_Teeth", MouthNormal: "_Teeth"},
		},
		{ Name: "Strap", Layer: "GagStraps", Pri: 1,
			Sprite: "BallStrap",
			OffsetX: 942,
			OffsetY: 200,
			AnchorModX: MODELWIDTH/641, // Dont know sprite dimensions until loaded...
			AnchorModY: MODELHEIGHT/664,
			Invariant: true,
		},
	])
});

AddModel({
	Name: "RopeArms",
	Folder: "Rope",
	Parent: "Rope",
	TopLevel: true,
	Categories: ["Restraints"],
	Layers: ToLayerMap([
		{ Name: "ChestUpper", Layer: "ChestStraps", Pri: 0,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
		{ Name: "ShoulderStraps", Layer: "ChestStraps", Pri: 1,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
		{ Name: "ChestLower", Layer: "Underbust", Pri: 0,
			Poses: ToMap([...ARMPOSES]),
			Invariant: true,
		},
		{ Name: "Arms", Layer: "Underarms", Pri: 0,
			Poses: ToMap(["Wristtie", "Boxtie"]),
		},
	])
});
