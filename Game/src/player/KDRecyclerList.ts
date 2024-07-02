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
	items: Record<string, KDBlueprint>,
}

let KDRecyclerCategories: Record<string, KDBlueprintCategory> = {
	Leather: {
		name: "Leather",
		prereq: () => {return true;},
		items: {
			TrapArmbinder: {
				name: "TrapArmbinder",
				item: "TrapArmbinder",
				type: Restraint,
				recyclecategory: "Leather",
				recyclecost: {
					Leather: 15,
					Metal: 1,
				},
				prereq: () => {return true;},
			},
		}
	},
	Rope: {
		name: "Rope",
		prereq: () => {return true;},
		items: {
			RopeSnakeArmsBoxtie: {
				name: "RopeSnakeArmsBoxtie",
				item: "RopeSnakeArmsBoxtie",
				type: Restraint,
				recyclecategory: "Rope",
				recyclecost: {
					Rope: 12,
				},
				prereq: () => {return true;},
			},
		}
	},
	Metal: {
		name: "Metal",
		prereq: () => {return true;},
		items: {
			TrapCuffs: {
				name: "TrapCuffs",
				item: "TrapCuffs",
				type: Restraint,
				recyclecategory: "Metal",
				recyclecost: {
					Metal: 5,
				},
				prereq: () => {return true;},
			},
		}
	},
	Latex: {
		name: "Latex",
		prereq: () => {return true;},
		items: {
			LatexStraitjacket: {
				name: "LatexStraitjacket",
				item: "LatexStraitjacket",
				type: Restraint,
				recyclecategory: "Latex",
				recyclecost: {
					Latex: 14,
				},
				prereq: () => {return true;},
			},
		}
	},
}