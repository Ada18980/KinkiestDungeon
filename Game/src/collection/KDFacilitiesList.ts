
interface Facility {
	/** Returns the height of the box to render */
	draw: (x: number, y: number, wdith: number) => number,
	update: (delta: number) => boolean,
	priority: number,
	prereq: () => boolean,
	locked?: () => boolean,
	/** Can draw a ping or anything really, on the quick bar. Good for notifications */
	ping?: (XXQuik: number, YYQuik: number, quikCurrentCol: number, quikSpacing: number, quikSize: number) => void,
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
			return KDDrawManagement(x, y, width);
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 3;},
		defaultData: {},
		ping: (XXQuik: number, YYQuik: number, quikCurrentCol: number, quikSpacing: number, quikSize: number) => {
			let facility = "Management";
			DrawTextFitKD((KDGameData.FacilitiesData["Servants_" + facility]?.length || 0) + "",
				XXQuik + quikCurrentCol * quikSpacing, YYQuik + 9, quikSize * 0.8, "#ffffff", KDTextGray0,
				18, "left", 111
			);
		},
	},

	CuddleLounge: {
		priority: -50,
		update: (delta) => {
			let rate = KDCuddleLoungeGain();
			let facility = "CuddleLounge";
			for (let servant of KDGameData.FacilitiesData["Servants_" + facility]) {
				let value = KDGameData.Collection[servant + ""];
				if (value) {
					KDAddOpinionPersistent(value.id, rate.servants);
				}
			}
			for (let prisoner of KDGameData.FacilitiesData["Prisoners_" + facility]) {
				let value = KDGameData.Collection[prisoner + ""];
				if (value) {
					KDAddOpinionPersistent(value.id, rate.prisoners);
				}
			}

			return false;
		},

		ping: (XXQuik: number, YYQuik: number, quikCurrentCol: number, quikSpacing: number, quikSize: number) => {
			let facility = "CuddleLounge";
			DrawTextFitKD(
				(KDGameData.FacilitiesData["Servants_" + facility]?.length || 0)
				+ " + "
				+ (KDGameData.FacilitiesData["Prisoners_" + facility]?.length || 0),
				XXQuik + quikCurrentCol * quikSpacing, YYQuik + 9, quikSize * 0.8, "#ffffff", KDTextGray0,
				18, "left", 111
			);
		},
		draw: (x, y, width) => {

			return KDDrawCuddleLounge(x, y, width);
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 8;},
		maxServants: () => {return 8;},
		defaultData: {},
	},
	Warden: {
		priority: 0,
		update: (delta) => {
			KDUpdateWarden(delta);
			return false;
		},
		draw: (x, y, width) => {
			return KDDrawWarden(x, y, width);
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoners: () => {return 0;},
		maxServants: () => {return 1;},
		defaultData: {},
		ping: (XXQuik: number, YYQuik: number, quikCurrentCol: number, quikSpacing: number, quikSize: number) => {
			let facility = "Warden";
			DrawTextFitKD((KDGameData.FacilitiesData["Servants_" + facility]?.length || 0) + "",
				XXQuik + quikCurrentCol * quikSpacing, YYQuik + 9, quikSize * 0.8, "#ffffff", KDTextGray0,
				18, "left", 111
			);
		},
	},
	Recycler: {
		priority: 30,
		update: (delta) => {
			if (delta > 0) {
				let resources = KDGetRecyclerRate(KDGameData.FacilitiesData.Servants_Recycler);
				for (let entry of Object.entries(resources)) {
					KDGameData.FacilitiesData["Recycler_" + entry[0]] = Math.round(KDGameData.FacilitiesData["Recycler_" + entry[0]] + entry[1]);
					KDGameData.FacilitiesData["RecyclerInput_" + entry[0]] = Math.round(KDGameData.FacilitiesData["RecyclerInput_" + entry[0]] - entry[1]);
				}
			}

			return false;
		},

		ping: (XXQuik: number, YYQuik: number, quikCurrentCol: number, quikSpacing: number, quikSize: number) => {
			let rates = KDGetRecyclerRate(KDGameData.FacilitiesData.Servants_Recycler);
			let notIdle = false;
			for (let resource of Object.values(rates)) {
				if (resource > 0) {
					notIdle = true;
					break;
				}
			}
			if (!notIdle) {
				DrawTextFitKD(
					TextGet("Idle"),
					XXQuik + quikCurrentCol * quikSpacing, YYQuik + 6, quikSize, "#ffffff", KDTextGray0,
					12, "left", 111
				);
			}

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
	/*AlchemyLab: {
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
	},*/
};