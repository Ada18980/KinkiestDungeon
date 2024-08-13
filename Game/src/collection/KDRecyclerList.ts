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
	Leather: {
		name: "Leather",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("TrapArmbinder", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapBoxbinder", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapLegbinder", "Leather", "", undefined, undefined, {Metal: 1}),
			KDAutoGenRestraintBlueprint("TrapHarness", "Leather", "", undefined, undefined, {Leather: -2, Metal: 2}),
			KDAutoGenRestraintBlueprint("LeatherArmCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("LeatherLegCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("LeatherAnkleCuffs", "Leather", ""),
			KDAutoGenRestraintBlueprint("TrapGag", "Leather", ""),
			KDAutoGenRestraintBlueprint("PanelGag", "Leather", ""),
			KDAutoGenRestraintBlueprint("MagicPetsuit", "Leather", ""),
			KDAutoGenRestraintBlueprint("KittyPetSuit", "Leather", ""),
			KDAutoGenRestraintBlueprint("KittySuit", "Leather", ""),
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
	Metal: {
		name: "Metal",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("WolfPetsuit", "Leather", ""),
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
		]
	},
	Latex: {
		name: "Latex",
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
			KDAutoGenRestraintBlueprint("KiguMask", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexStraitjacket", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexArmbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexBoxbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexLegbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexCatsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("HeavyLatexCatsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexCorset", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexPetsuit", "Latex", ""),
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
		]
	},
}