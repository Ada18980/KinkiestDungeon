
interface Facility {
	/** Returns the height of the box to render */
	draw: (x: number, y: number, wdith: number) => number,
	update: (delta: number) => boolean,
	priority: number,
	prereq: () => boolean,
	goldCost: () => number,
	maxPrisoners: () => number,
	maxServants: () => number,
	events?: KinkyDungeonEvent[],
	defaultData: Record<string, any>
};

let KDFacilityTypes: Record<string, Facility> = {
	Management: {
		priority: -100,
		update: (delta) => {
			return false;
		},
		draw: (x, y, width) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
	},
	Recycler: {
		priority: 30,
		update: (delta) => {
			if (delta > 0 && KDGameData.FacilitiesData.Servants_Recycler.length > 0) {
				let resources = KDGetRecyclerRate(KDGameData.FacilitiesData.Servants_Recycler);
				for (let entry of Object.entries(resources)) {
					KDGameData.FacilitiesData["Recycler_" + entry[0]] = Math.round(KDGameData.FacilitiesData["Recycler_" + entry[0]] + entry[1]);
					KDGameData.FacilitiesData["RecyclerInput_" + entry[0]] = Math.round(KDGameData.FacilitiesData["RecyclerInput_" + entry[0]] - entry[1]);
				}
			}

			return false;
		},

		draw: (x, y, width) => {

			return KDDrawRecycler(x, y, width);
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
	},
	AlchemyLab: {
		priority: 50,
		update: (delta) => {
			return false;
		},

		draw: (x, y, width) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
	},

	TrainingDojo: {
		priority: 10,
		update: (delta) => {
			return false;
		},

		draw: (x, y, width) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
	},
	RescueTeam: {
		priority: 10,
		update: (delta) => {
			return false;
		},

		draw: (x, y, width) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
	},
	CuddleLounge: {
		priority: -50,
		update: (delta) => {
			return false;
		},

		draw: (x, y, width) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
	},
};