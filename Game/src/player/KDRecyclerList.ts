interface KDBlueprint {
	name: string,
	item: string,
	type: string,
	applyvariant?: string,
	recyclecost?: Record<string, number>,
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
		]
	},
	Rope: {
		name: "Rope",
		prereq: () => {return true;},
		items: [
			{
				name: "RopeSnakeArmsBoxtie",
				item: "RopeSnakeArmsBoxtie",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 12,
				},
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
			{
				name: "LatexStraitjacket",
				item: "LatexStraitjacket",
				type: Restraint,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 14,
				},
				prereq: () => {return true;},
			},
		]
	},
}