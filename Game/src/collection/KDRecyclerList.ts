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
		]
	},
	Metal: {
		name: "Metal",
		prereq: () => {return true;},
		items: [
			{
				name: "TrapCuffs",
				item: "TrapCuffs",
				type: Restraint,
				recyclecategory: "Metal",
				recyclecost: {
					Metal: 5,
				},
				prereq: () => {return true;},
			},
		]
	},
	Latex: {
		name: "Latex",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("KiguMask", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexStraitjacket", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexArmbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexBoxbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexLegbinder", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexCatsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("HeavyLatexCatsuit", "Latex", ""),
			KDAutoGenRestraintBlueprint("LatexCorset", "Latex", ""),
		]
	},
	Armor: {
		name: "Armor",
		prereq: () => {return true;},
		items: [
			KDAutoGenRestraintBlueprint("MageArmor", "Armor", "", undefined, {Rope: 50, Rune: 5}),
			KDAutoGenRestraintBlueprint("MagicArmbands", "Armor", "", undefined, {Metal: 30, Rune: 2}),
			KDAutoGenRestraintBlueprint("SteelSkirt", "Armor", "", undefined, {Metal: 150}),
			KDAutoGenRestraintBlueprint("SteelSkirt2", "Armor", "", undefined, {Metal: 100}),
			KDAutoGenRestraintBlueprint("ChainTunic", "Armor", "", undefined, {Metal: 200}),
			KDAutoGenRestraintBlueprint("ChainBikini", "Armor", "", undefined, {Metal: 150}),
			KDAutoGenRestraintBlueprint("SteelArmor", "Armor", "", undefined, {Metal: 300}),



		]
	},
}