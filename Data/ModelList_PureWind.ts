/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */

AddModel({
    Name: "NightWhip",
    Folder: "Weapon",
    TopLevel: true,
    Protected: false,
    Categories: ["Weapon"],
    Layers: ToLayerMap([{
                Name: "NightWhip",
                Layer: "Weapon",
                Pri: 0,
                NoOverride: true,
                Poses: {
                    Free: true
                },
            }, {
                Name: "NightWhipLight",
                Layer: "Weapon",
                Pri: 1,
                NoOverride: true,
                Poses: {
                    Free: true
                },
                TieToLayer: "NightWhip"
            }
        ]),
    "Filters": {
        "NightWhip": {
            "gamma": 1,
            "saturation": 1,
            "contrast": 1.5666666666666669,
            "brightness": 1.05,
            "red": 1,
            "green": 1,
            "blue": 1,
            "alpha": 1
        }
    }
});
AddModel({
	Name: "LatexWhip",
	Folder: "Weapon",
	TopLevel: true,
	Protected: false,
	Categories: ["Weapon"],
	Layers: ToLayerMap([{
				Name: "LatexWhip",
				Layer: "Weapon",
				Pri: 0,
				NoOverride: true,
				Poses: {
					Free: true
				},
			},
		]),
	"Filters": {
		"LatexWhip": {
			"gamma": 1,
			"saturation": 0,
			"contrast": 1.25,
			"brightness": 1,
			"red": 1,
			"green": 1,
			"blue": 1,
			"alpha": 1
		}
	}
});

AddModel({
	Name: "KittyLatexEar",
	Folder: "KittyLatex",
	Parent: "KittyLatex",
	TopLevel: false,
	Protected: true,
	Categories: ["Ears", "Kitty", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Kitty", "Cosplay"],
	Layers: ToLayerMap([{
				Name: "KittyLatexEar",
				Layer: "AnimalEars",
				Pri: 11,
				Invariant: true,
				InheritColor: "Ears",
			}, {
				Name: "KittyLatexEarLight",
				Layer: "AnimalEars",
				Pri: 11.1,
				Invariant: true,
				TieToLayer: "KittyLatexEar",
				NoOverride: true,
				InheritColor: "InnerEarsLight",
			}, {
				Name: "KittyLatexEarMuff",
				Layer: "HairFront",
				Pri: 21,
				Invariant: true,
			}, {
				Name: "KittyLatexEarMuffLight2",
				Layer: "HairFront",
				Pri: 21.1,
				Invariant: true,
				TieToLayer: "KittyLatexEarMuff",
				NoOverride: true,
			}, {
				Name: "KittyLatexEarMuffLight1",
				Layer: "HairFront",
				Pri: 21.2,
				Invariant: true,
				TieToLayer: "KittyLatexEarMuff",
				NoOverride: true,
			},
		])
});

AddModel({
	Name: "KittyLatexTail",
	Folder: "KittyLatex",
	Parent: "KittyLatex",
	TopLevel: false,
	Protected: true,
	Categories: ["Tails", "Kitty", "Cosplay"],
	AddPose: ["Tails", "Kitty"],
	Layers: ToLayerMap([{
				Name: "KittyLatexTail",
				Layer: "Tail",
				Pri: 1,
				Invariant: true,
			}, {
				Name: "KittyLatexTailLight",
				Layer: "Tail",
				Pri: 1.1,
				Invariant: true,
				TieToLayer: "KittyLatexTail"
			},
		])
});

AddModel({
	Name: "KittyLatexTail2",
	Folder: "KittyLatex",
	Parent: "KittyLatex",
	TopLevel: false,
	Protected: true,
	Categories: ["Tails", "Kitty", "Cosplay"],
	AddPose: ["Tails", "Kitty"],
	Layers: ToLayerMap([{
				Name: "KittyLatexTail",
				Layer: "Tail",
				Pri: 1,
				Invariant: true,
			}, {
				Name: "KittyLatexTail2",
				Layer: "Tail",
				Pri: 1.1,
				Invariant: true,
			}, {
				Name: "KittyLatexTailLight",
				Layer: "Tail",
				Pri: 1.2,
				Invariant: true,
				TieToLayer: "KittyLatexTail"
			}, {
				Name: "KittyLatexTail2Light",
				Layer: "Tail",
				Pri: 1.3,
				Invariant: true,
				TieToLayer: "KittyLatexTail2"
			},
		])
});

AddModel({
	Name: "KittyLatex",
	Folder: "KittyLatex",
	TopLevel: true,
	Protected: true,
	Categories: ["Cosplay"],
	Layers: ToLayerMap([
			...GetModelLayers("KittyLatexEar"),
			...GetModelLayers("KittyLatexTail"),
			...GetModelLayers("KittyLatexTail2"),
		])
});

AddModel({
	Name: "SuccubusWing",
	Folder: "Succubus",
	Parent: "Succubus",
	TopLevel: false,
	Protected: true,
	Categories: ["Cosplay"],
	AddPose: ["Wings", "Demon", "Cosplay"],
	Layers: ToLayerMap([{
				Name: "SuccubusWingBase",
				Layer: "Wings",
				Pri: 1,
				Invariant: true,
			}, {
				Name: "SuccubusWingBack",
				Layer: "Wings",
				Pri: 1.1,
				Invariant: true,
				TieToLayer: "SuccubusWingBase",
				NoOverride: true,
			}, {
				Name: "SuccubusWingLight",
				Layer: "Wings",
				Pri: 1.2,
				Invariant: true,
				TieToLayer: "SuccubusWingBase",
				NoOverride: true,
			},
		])
});

AddModel({
	Name: "SuccubusHorn",
	Folder: "Succubus",
	Parent: "Succubus",
	TopLevel: false,
	Protected: true,
	Categories: ["Ears", "Face", "Cosplay"],
	AddPose: ["AnimalEars", "Demon", "Cosplay"],
	Layers: ToLayerMap([{
				Name: "SuccubusHornRight",
				Layer: "AnimalEars",
				Pri: 10,
				Invariant: true
			}, {
				Name: "SuccubusHornLeft",
				Layer: "AnimalEarsFront",
				Pri: 10.1,
				Invariant: true,
				TieToLayer: "SuccubusHornRight"
			}, {
				Name: "SuccubusHornLight",
				Layer: "AnimalEarsFront",
				Pri: 10.2,
				Invariant: true,
				TieToLayer: "SuccubusHornRight"
			},
		])
});

AddModel({
	Name: "SuccubusTail",
	Folder: "Succubus",
	Parent: "Succubus",
	TopLevel: false,
	Protected: true,
	Categories: ["Tails", "Face", "Cosplay"],
	AddPose: ["Tails", "Demon", "Cosplay"],
	Layers: ToLayerMap([{
				Name: "SuccubusTail",
				Layer: "Tail",
				Pri: 10,
				Invariant: true
			}, {
				Name: "SuccubusTailLight",
				Layer: "Tail",
				Pri: 10.1,
				Invariant: true,
				TieToLayer: "SuccubusTail"
			}
		])
});
AddModel({
	Name: "SuccubusClaws",
	Folder: "Succubus",
	Parent: "Succubus",
	TopLevel: false,
	Categories: ["Gloves", "Cosplay"],
	Protected: true,
	Layers: ToLayerMap([
		{ Name: "SuccubusClawLeft", Layer: "GloveLeft", Pri: 14,
			Poses: {Free: true, Yoked: true, Front: true, Wristtie: true},
			SwapLayerPose: { Front: "ForeGloveLeft", Crossed: "CrossGloveLeft" },
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
		{ Name: "SuccubusClawRight", Layer: "GloveRight", Pri: 14,
			Poses: {Free: true, Yoked: true, Front: true,  Wristtie: true},
			SwapLayerPose: { Front: "ForeGloveRight", Crossed: "CrossGloveRight" },
			HideWhenOverridden: true,
			GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
		},
	])
});
AddModel({
	Name: "SuccubusFeet",
	Folder: "Succubus",
	Parent: "Succubus",
	TopLevel: true,
	Categories: ["Cosplay"],
	Protected: true,
	Layers: ToLayerMap([
		{ Name: "SockLeft", Layer: "StockingLeft", Pri: 5.1,
			Poses: {Spread:true, Closed:true, Kneel:true, KneelClosed:true},
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "FootSockLeftHogtie", Layer: "SockLeftHogtie", Pri: 5.1,
			Poses: ToMap(["Hogtie"]),
			InheritColor: "SockLeft",
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "SockRight", Layer: "StockingRight", Pri: 5,
			Poses: {Spread:true, Closed:true},
			GlobalDefaultOverride: ToMap(["Hogtie", "KneelClosed"]),
			HideWhenOverridden: true,
		},
		{ Name: "FootSockRightKneel", Layer: "SockRightKneel", Pri: 5,
			HidePoses: ToMap(["FeetLinked"]),
			Poses: ToMap(["Kneel"]),
			InheritColor: "SockRight",
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});
AddModel({
	Name: "Succubus",
	Folder: "Succubus",
	TopLevel: true,
	Protected: true,
	Categories: ["Cosplay"],
	AddPose: ["AnimalEars", "Demon", "Tails", "Wings", "Cosplay"],
	Layers: ToLayerMap([
			...GetModelLayers("SuccubusHorn"),
			...GetModelLayers("SuccubusTail"),
			...GetModelLayers("SuccubusWing"),
			...GetModelLayers("SuccubusClaws"),
			...GetModelLayers("SuccubusFeet"),
		])
});