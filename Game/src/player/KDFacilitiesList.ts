
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
			let dd = KDMapData.RoomType == "Summit" ? 400 : 300;
			if (y + dd < 940) {
				let rID = 0;
				let spacing = 180;
				let res = Object.keys(RecyclerResources);
				let rates = KDGetRecyclerRate(KDGameData.FacilitiesData.Servants_Recycler);
				let yy = y;

				yy += KDDrawServantPrisonerList("Recycler", x, yy + 70, width);

				for (let resource of res) {
					KDDraw(kdcanvas, kdpixisprites, "fac_rec_res_" + resource,
						KinkyDungeonRootDirectory + "UI/Resource/" + resource + ".png",
						x + 560 - spacing*0.5*res.length + (spacing * rID), yy + 50, 72, 72
					);
					DrawTextFitKD(Math.floor(KDGameData.FacilitiesData["Recycler_" + resource] || 0) + "",
						x + 560 + 70 - spacing*0.5*res.length + (spacing * rID), yy + 76, spacing - 80, "#ffffff", KDTextGray0, 32, "left");
					DrawTextFitKD("+" + rates[resource] + ` (${Math.floor(KDGameData.FacilitiesData["RecyclerInput_" + resource] || 0)})`,
						x + 560 + 70 - spacing*0.5*res.length + (spacing * rID), yy + 76 + 32, spacing - 80, rates[resource] > 0 ? "#ffffff" : "#aaaaaa", KDTextGray0, 18, "left");
					rID++;
				}

				if (KDMapData.RoomType == "Summit") {
					DrawButtonKDEx(
						"recycleButton",
						() => {
							KDGameData.InventoryAction = "Recycle";
							KinkyDungeonDrawState = "Inventory";
							KinkyDungeonCurrentFilter = LooseRestraint;
							return true;
						}, KDMapData.RoomType == "Summit",
						x + width/2 - 150, yy + 150, 300, 80, TextGet("KDRecycleButton"),
						"#ffffff", KinkyDungeonRootDirectory + 'InventoryAction/Recycle.png',
						undefined, false, false, undefined, undefined, true
					);


				} else {
					DrawTextFitKD(TextGet("KDFacilityLocal"), x + 560, y + 160, 1050 - 160, "#ffffff", KDTextGray0, 32, "center");
				}

			}
			return dd;
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