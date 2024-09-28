interface KDBlueprint {
	name: string,
	item: string,
	type: string,
	applyvariant?: string,
	recyclecost?: Record<string, number>,
	count?: number,
	recyclecategory?: string,
	prereq: () => boolean,
}
interface KDBlueprintCategory {
	name: string,
	prereq: () => boolean,
	items: KDBlueprint[],
}

KinkyDungeonRefreshRestraintsCache();

let KDRecyclerCategories: Record<string, KDBlueprintCategory> = {
	Armor: {
		name: "Armor",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("MageArmor", "Armor", "", 1, {Rope: 50, Rune: 5}),
			KDAutoGenRestraintBlueprint("MagicArmbands", "Armor", "", 1, {Metal: 30, Rune: 2}),
			KDAutoGenRestraintBlueprint("SteelSkirt", "Armor", "", 1, {Metal: 150}),
			KDAutoGenRestraintBlueprint("SteelSkirt2", "Armor", "", 1, {Metal: 100}),
			KDAutoGenRestraintBlueprint("ChainTunic", "Armor", "", 1, {Metal: 200}),
			KDAutoGenRestraintBlueprint("ChainBikini", "Armor", "", 1, {Metal: 150}),
			KDAutoGenRestraintBlueprint("SteelArmor", "Armor", "", 1, {Metal: 300}),
			KDAutoGenRestraintBlueprint("Swimsuit", "Armor", "", 1, {Latex: 250}),

			KDAutoGenRestraintBlueprint("GagNecklace", "Armor", "", 1, {Latex: 15}),
		]
	},
	Leather: {
		name: "Leather",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("TrapArmbinder", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapArmbinderHarness", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapBoxbinder", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapLegbinder", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapHarness", "Leather", "", undefined, undefined, {Leather: -2, Metal: 2}),
			KDAutoGenRestraintBlueprint("TrapMittens", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapBoots", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapGag", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapBlindfold", "Leather", ""),
			KDAutoGenRestraintBlueprint("PanelGag", "Leather", ""),
			KDAutoGenRestraintBlueprint("PanelPlugGag", "Leather", ""),
			KDAutoGenRestraintBlueprint("PanelPlugGagHarness", "Leather", ""),
			KDAutoGenRestraintBlueprint("HarnessGag", "Leather", ""),
			KDAutoGenRestraintBlueprint("MagicPetsuit", "Leather", ""),

			KDAutoGenRestraintBlueprint("KittyGag", "Rope", ""),
			KDAutoGenRestraintBlueprint("KittyMuzzle", "Rope", ""),
			KDAutoGenRestraintBlueprint("KittyBlindfold", "Rope", ""),
			KDAutoGenRestraintBlueprint("KittyPaws", "Rope", ""),
			KDAutoGenRestraintBlueprint("KittyPetSuit", "Leather", ""),
			KDAutoGenRestraintBlueprint("KittySuit", "Leather", ""),

			KDAutoGenRestraintBlueprint("LeatherHood", "Leather", ""),
			KDAutoGenRestraintBlueprint("LeatherMask", "Leather", ""),
		]
	},
	Leather2: {
		name: "Leather2",
		prereq: () => {return true;},
		items: [


			KDAutoGenRestraintBlueprint("HighsecArmbinder", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("HighsecBoxbinder", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("HighsecStraitjacket", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("HighsecTransportJacket", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("HighsecBallGag", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("HighsecMuzzle", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("HighsecLegbinder", "Leather", "", 1.5),

			KDAutoGenRestraintBlueprint("AsylumJacket", "Dress", "", 2,
				undefined, {Rope: 3}),
			KDAutoGenRestraintBlueprint("TransportJacket", "Dress", "", 3,
				undefined, {Rope: 3}),
			KDAutoGenRestraintBlueprint("AsylumLegbinder", "Dress", "", 3,
				undefined, {Rope: 3}),

			KDAutoGenRestraintBlueprint("LeatherArmCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("LeatherLegCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("LeatherAnkleCuffs", "Leather", ""),

			KDAutoGenRestraintBlueprint("AsylumArmCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("AsylumLegCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("AsylumAnkleCuffs", "Leather", ""),

			KDAutoGenRestraintBlueprint("ScaleArmCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("ScaleLegCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("ScaleAnkleCuffs", "Leather", ""),
		]
	},
	Rope: {
		name: "Rope",
		prereq: () => {return true;},
		items: [
			{
				name: "RopeSnakeRaw",
				item: "RopeSnakeRaw",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 100,
				},
				count: 25,
				prereq: () => {return true;},
			},
			{
				name: "WeakMagicRopeRaw",
				item: "WeakMagicRopeRaw",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 100,
					Rune: 1,
				},
				count: 25,
				prereq: () => {return true;},
			},
			{
				name: "StrongMagicRopeRaw",
				item: "StrongMagicRopeRaw",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 100,
					Rune: 2,
				},
				count: 25,
				prereq: () => {return true;},
			},
			{
				name: "CelestialRopeRaw",
				item: "CelestialRopeRaw",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 80,
					Rune: 3,
				},
				count: 25,
				prereq: () => {return true;},
			},
			{
				name: "MithrilRopeRaw",
				item: "MithrilRopeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Metal",
				recyclecost: {
					Rope: 30,
					Metal: 30,
				},
				prereq: () => {return true;},
			},
			{
				name: "Stuffing",
				item: "Stuffing",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 1,
				},
				count: 5,
				prereq: () => {return true;},
			},

			KDAutoGenRestraintBlueprint("ClothGag", "Rope", ""),
			KDAutoGenRestraintBlueprint("ClothGag2", "Rope", ""),
			KDAutoGenRestraintBlueprint("ClothGag3", "Rope", ""),
			KDAutoGenRestraintBlueprint("ClothGagOver", "Rope", ""),
			KDAutoGenRestraintBlueprint("ClothBlindfold", "Rope", ""),
		]
	},
	Metal: {
		name: "Metal",
		prereq: () => {return true;},
		items: [


			KDAutoGenRestraintBlueprint("TrapCuffs", "Leather", "", 1.2),
			KDAutoGenRestraintBlueprint("ThumbCuffsNew", "Leather", "", 0.8),
			KDAutoGenRestraintBlueprint("HighsecShackles", "Leather", "", 1.5),
			KDAutoGenRestraintBlueprint("Irish8Cuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapLegirons", "Leather", ""),
			KDAutoGenRestraintBlueprint("LegShackles", "Leather", ""),
			KDAutoGenRestraintBlueprint("FeetShackles", "Leather", ""),
			KDAutoGenRestraintBlueprint("AnkleIrish8Cuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("ExpBoots", "Leather", ""),
			KDAutoGenRestraintBlueprint("SteelArmCuffs", "Leather", ""),

			KDAutoGenRestraintBlueprint("MithrilCollar", "Leather", "", 1, {
				Metal: 10,
			}),
			KDAutoGenRestraintBlueprint("MithrilArmCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("MithrilLegCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("MithrilAnkleCuffs", "Leather", ""),

		]
	},
	Metal2: {
		name: "Metal2",
		prereq: () => {return true;},
		items: [

			KDAutoGenRestraintBlueprint("BlacksteelArmCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("BlacksteelLegCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("BlacksteelAnkleCuffs", "Leather", ""),


			KDAutoGenRestraintBlueprint("ObsidianCollar", "Leather", "", 1, undefined,
				{Rune: 1}, 10
			),
			KDAutoGenRestraintBlueprint("ObsidianArmCuffs", "Leather", "", 1, undefined,
				{Rune: 1}, 10),
			KDAutoGenRestraintBlueprint("ObsidianLegCuffs", "Leather", "", 1, undefined,
				{Rune: 1}, 10),
			KDAutoGenRestraintBlueprint("ObsidianAnkleCuffs", "Leather", "", 1, undefined,
				{Rune: 1}, 10),


			KDAutoGenRestraintBlueprint("SteelMuzzleGag", "Leather", ""),
		]
	},
	Chastity: {
		name: "Chastity",
		prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},
		items: [

			KDAutoGenRestraintBlueprint("TrapBelt", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapBeltProto", "Leather", "", 3),
			KDAutoGenRestraintBlueprint("TrapBelt2", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapBra", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapBra2", "Leather", ""),
			KDAutoGenRestraintBlueprint("PrisonBelt", "Leather", ""),
			KDAutoGenRestraintBlueprint("PrisonBelt2", "Leather", ""),

			KDAutoGenRestraintBlueprint("MagicBelt", "Leather", "", undefined, {
				Metal: 30,
				Rune: 1,
			}),

			KDAutoGenRestraintBlueprint("BlacksteelBelt", "Leather", ""),
			KDAutoGenRestraintBlueprint("BlacksteelBra", "Leather", ""),

			KDAutoGenRestraintBlueprint("CyberBelt", "Cyber", "", 2,
				undefined, {Latex: 5}),
			KDAutoGenRestraintBlueprint("CyberBra", "Cyber", "", 2,
				undefined, {Latex: 5}),
		]
	},

	Cyber: {
		name: "Cyber",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("CyberMuzzle", "Cyber", "", 1.4,
				undefined, {Latex: 1}),
			KDAutoGenRestraintBlueprint("CyberPlugGag", "Cyber", "", 1.4,
				undefined, {Latex: 2}),
			KDAutoGenRestraintBlueprint("CyberBallGag", "Cyber", "", 1.4,
				undefined, {Latex: 2}),
			KDAutoGenRestraintBlueprint("CyberDollJacket", "Cyber", "", 1.4,
				undefined, {Latex: 4}),
			KDAutoGenRestraintBlueprint("CyberHeels", "Cyber", "", 2,
				undefined, undefined),
			KDAutoGenRestraintBlueprint("CyberAnkleCuffs", "Cyber", "", 2,
				undefined, undefined),
			KDAutoGenRestraintBlueprint("CyberArmCuffs", "Cyber", "", 2,
				undefined, undefined),
			KDAutoGenRestraintBlueprint("CyberLongMittens", "Cyber", "", 1.4,
				undefined, {Latex: 4}),
			KDAutoGenRestraintBlueprint("CyberMittens", "Cyber", "", 1.4,
				undefined, {Latex: 2}),
			KDAutoGenRestraintBlueprint("ControlHarness", "Cyber", "", 2,
				undefined, {Rune: 1}),
			KDAutoGenRestraintBlueprint("TrackingCollar", "Cyber", "", 1.5,
				undefined, {Rune: 1}),
			//KDAutoGenRestraintBlueprint("CyberLinkCollar", "Cyber", "", 1,
			//	undefined, {Rune: 10}),
		]
	},
	Wolf: {
		name: "Wolf",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("WolfCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("WolfArmbinder", "Wolf", "", 1.4,
				undefined, {Latex: 1}),
			KDAutoGenRestraintBlueprint("WolfStrongArmbinder", "Wolf", "", 1.7,
				undefined, {Latex: 1}),
			KDAutoGenRestraintBlueprint("WolfAnkleCuffs", "Wolf", "", undefined,
				undefined, undefined),
			KDAutoGenRestraintBlueprint("WolfHarness", "Wolf", "", undefined,
				undefined, {Rope: 4}),
			KDAutoGenRestraintBlueprint("WolfMittens", "Wolf", "", undefined,
				undefined, undefined),
			KDAutoGenRestraintBlueprint("WolfBallGag", "Wolf", "", undefined,
				undefined, {Latex: 2}),
			KDAutoGenRestraintBlueprint("WolfCollar", "Wolf", "", 2,
				undefined, undefined),
			KDAutoGenRestraintBlueprint("WolfLeash", "Wolf", "", 0.5,
				undefined, {Rope: 4}),
			KDAutoGenRestraintBlueprint("WolfPanties", "Wolf", "", 1,
				{Latex: 10}),
			KDAutoGenRestraintBlueprint("WolfPetsuit", "Leather", ""),
		]
	},
	Dress: {
		name: "Dress",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("ObsidianLeash", "Dress", "", 1,
				{Rope: 20, Rune: 1}, undefined, 20),
			KDAutoGenRestraintBlueprint("BindingDress", "Dress", "", 1,
				{Rope: 50, Latex: 10}),
			KDAutoGenRestraintBlueprint("DressGag", "Dress", "", 1,
				undefined, {Rope: 3}),
			KDAutoGenRestraintBlueprint("DressMuzzle", "Dress", "", 1,
				undefined, {Rope: 4}),
			KDAutoGenRestraintBlueprint("DressCorset", "Dress", "", 1,
				undefined, {Metal: 1, Rope: 6}),
			KDAutoGenRestraintBlueprint("DressBra", "Dress", "", 1,
				undefined, {Rope: 3}),
			{
				name: "RibbonRaw",
				item: "RibbonRaw",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 25,
					Rune: 3,
				},
				count: 30,
				prereq: () => {return true;},
			},
		]
	},
	Module: {
		name: "Module",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("ShockModule", "Wolf", "", undefined,
				{Rune: 1, Metal: 1}, undefined),
			KDAutoGenRestraintBlueprint("TrackingModule", "Wolf", "", undefined,
				{Rune: 1, Metal: 1}, undefined),
		]
	},

	Latex: {
		name: "Latex",
		prereq: () => {return true;},
		items: [
			{
				name: "HardSlimeRaw",
				item: "HardSlimeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 50,
				},
				prereq: () => {return true;},
			},
			{
				name: "HardProtoSlimeRaw",
				item: "HardProtoSlimeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 30,
				},
				prereq: () => {return true;},
			},
			KDAutoGenRestraintBlueprint("KiguMask", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexStraitjacket", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexTransportJacket", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexArmbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexBoxbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexLegbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexCatsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("HeavyLatexCatsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexCorset", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexPetsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexBallGag", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexBallGagLarge", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexOTNGag", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexOTNGagHeavy", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexMittens", "Latex", ""),
			KDAutoGenRestraintBlueprint("ExpArmbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("ExpArmbinderHarness", "Latex", ""),
			KDAutoGenRestraintBlueprint("ExpCollar", "Latex", ""),


			{
				name: "MagicGag",
				item: "MagicGag",
				type: Restraint,
				count: 10,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 40,
					Rune: 1
				},
				prereq: () => {return true;},
			},
			{
				name: "MagicGagLarge",
				item: "MagicGagLarge",
				type: Restraint,
				count: 10,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 100,
					Rune: 1
				},
				prereq: () => {return true;},
			},
		]
	},
	Tape: {
		name: "Tape",
		prereq: () => {return true;},
		items: [

			{
				name: "VinylTapeRaw",
				item: "VinylTapeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 50,
				},
				prereq: () => {return true;},
			},
			{
				name: "DuctTapeRaw",
				item: "DuctTapeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 20,
				},
				prereq: () => {return true;},
			},
			{
				name: "AutoTapeRaw",
				item: "AutoTapeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Metal",
				recyclecost: {
					Metal: 10,
					Latex: 40,
				},
				prereq: () => {return true;},
			},
			{
				name: "MysticDuctTapeRaw",
				item: "MysticDuctTapeRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 50,
					Rune: 1,
				},
				prereq: () => {return true;},
			},
			{
				name: "CharmRaw",
				item: "CharmRaw",
				type: Restraint,
				count: 25,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 30,
					Rune: 1,
				},
				prereq: () => {return true;},
			},
		]
	},
	Toys: {
		name: "Toys",
		prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},
		items: [
			{
				name: "TrapVibe",
				item: "TrapVibe",
				type: Restraint,
				count: 10,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},
			},
			{
				name: "TrapVibeProto",
				item: "TrapVibeProto",
				type: Restraint,
				count: 4,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},
			},
			{
				name: "MaidVibe",
				item: "MaidVibe",
				type: Restraint,
				count: 8,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 12,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},
			},
			{
				name: "TrapPlug",
				item: "TrapPlug",
				type: Restraint,
				count: 10,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode") && !KinkyDungeonStatsChoice.get("arousalModePlugNoFront");},
			},
			{
				name: "TrapPlug2",
				item: "TrapPlug2",
				type: Restraint,
				count: 8,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode") && !KinkyDungeonStatsChoice.get("arousalModePlugNoFront");},
			},
			{
				name: "TrapPlug3",
				item: "TrapPlug3",
				type: Restraint,
				count: 7,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode") && !KinkyDungeonStatsChoice.get("arousalModePlugNoFront");},
			},
			{
				name: "TrapPlug4",
				item: "TrapPlug4",
				type: Restraint,
				count: 4,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode") && !KinkyDungeonStatsChoice.get("arousalModePlugNoFront");},
			},
			{
				name: "TrapPlug5",
				item: "TrapPlug5",
				type: Restraint,
				count: 3,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode") && !KinkyDungeonStatsChoice.get("arousalModePlugNoFront");},
			},
			{
				name: "RearVibe1",
				item: "RearVibe1",
				type: Restraint,
				count: 10,
				recyclecategory: "Toys",
				recyclecost: {
					Latex: 10,
					Rune: 1,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalModePlug");},
			},
			{
				name: "SteelPlugF",
				item: "SteelPlugF",
				type: Restraint,
				count: 1,
				recyclecategory: "Toys",
				recyclecost: {
					Metal: 4,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode") && !KinkyDungeonStatsChoice.get("arousalModePlugNoFront");},
			},
			{
				name: "SteelPlugR",
				item: "SteelPlugR",
				type: Restraint,
				count: 1,
				recyclecategory: "Toys",
				recyclecost: {
					Metal: 4,
				},
				prereq: () => {return KinkyDungeonStatsChoice.get("arousalModePlug");},
			},

		]
	},
}