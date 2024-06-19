
interface Facility {
	/** Returns the height of the box to render */
	draw: (x: number, y: number) => number,
	prereq: () => boolean,
	goldCost: () => number,
	maxPrisoner: () => number,
	maxServant: () => number,
	defaultData: Record<string, any>
};

let KDFacilityTypes: Record<string, Facility> = {
	Management: {
		draw: (x, y) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoner: () => {return 0;},
		maxServant: () => {return 3;},
		defaultData: {},
	},
	TrainingDojo: {

		draw: (x, y) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoner: () => {return 0;},
		maxServant: () => {return 3;},
		defaultData: {},
	},
	RescueTeam: {

		draw: (x, y) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoner: () => {return 0;},
		maxServant: () => {return 3;},
		defaultData: {},
	},
	AlchemyLab: {

		draw: (x, y) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoner: () => {return 0;},
		maxServant: () => {return 3;},
		defaultData: {},
	},
	Recycler: {

		draw: (x, y) => {
			let dd = 200;
			if (y + dd < 940) {
				let rID = 0;
				let spacing = 180;
				let res = ["Rope", "Leather", "Metal", "Latex"];
				for (let resource of res) {
					KDDraw(kdcanvas, kdpixisprites, "fac_rec_res_" + resource,
						KinkyDungeonRootDirectory + "UI/Resource/" + resource + ".png",
						x + 560 - spacing*0.5*res.length + (spacing * rID), y + 50, 72, 72
					);
					DrawTextFitKD(Math.floor(KDGameData.FacilitiesData["Recycler_" + resource] || 0) + "",
						x + 560 + 70 - spacing*0.5*res.length + (spacing * rID), y + 86, spacing - 80, "#ffffff", KDTextGray0, 32, "left");
					rID++;
				}

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoner: () => {return 0;},
		maxServant: () => {return 3;},
		defaultData: {},
	},
	CuddleLounge: {

		draw: (x, y) => {
			let dd = 100;
			if (y + dd < 940) {

			}
			return dd;
		},
		prereq: () => {return true;},
		goldCost: () => {return 0;},
		maxPrisoner: () => {return 0;},
		maxServant: () => {return 3;},
		defaultData: {},
	},
};