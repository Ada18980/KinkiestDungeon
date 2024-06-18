let FacilitiesIndex = 0;

interface FacilitiesData {
	Recycler_Rope: number,
	Recycler_Latex: number,
	Recycler_Metal: number,
	Recycler_Leather: number,
};

function InitFacilities() {
	if (!KDGameData.FacilitiesData) {
		KDGameData.FacilitiesData = {
			Recycler_Rope: 0,
			Recycler_Latex: 0,
			Recycler_Metal: 0,
			Recycler_Leather: 0,
		};
	} else {
		let data = KDGameData.FacilitiesData;
		if (data.Recycler_Rope == undefined) data.Recycler_Rope = 0;
		if (data.Recycler_Latex == undefined) data.Recycler_Latex = 0;
		if (data.Recycler_Metal == undefined) data.Recycler_Metal = 0;
		if (data.Recycler_Leather == undefined) data.Recycler_Leather = 0;
	}
}

function KinkyDungeonDrawFacilities(xOffset = -125) {
	let x = 1225 + xOffset;

	if (!KinkyDungeonFlags.get("1stSummit")) {
		DrawTextFitKD(TextGet("KDFacilitiesLocked"), x, 300, 1050, "#ffffff", KDTextGray0, 24);
	} else {
		KDDrawFacilitiesList(xOffset);
	}


	KDDrawLoreRepTabs(xOffset);
}


function KDDrawFacilitiesList(xOffset) {

	let padding = 100;
	let YY = 200;
	let XX = 550 + 125 + xOffset;
	let width = 1050;

	let listRender = Object.entries(KDFacilityTypes).filter((entry) => {
		return entry[1].prereq();
	});

	if (FacilitiesIndex >= listRender.length - 1) {
		FacilitiesIndex = listRender.length - 1;
	}

	let II = 0;
	let broken = false;
	let rendered = 0;
	for (let facility of listRender) {
		if (II++ < FacilitiesIndex) {
			continue;
		}
		let dist = facility[1].draw(XX, YY);
		if (YY + dist > 940) {
			broken = true;
			break;
		}

		FillRectKD(kdcanvas, kdpixisprites, "facrec" + facility[0], {
			Left: XX,
			Top: YY,
			Width: width,
			Height: dist,
			Color: "#000000",
			LineWidth: 1,
			zIndex: -18,
			alpha: 0.3
		});
		DrawRectKD(kdcanvas, kdpixisprites, "facrec2" + facility[0], {
			Left: XX,
			Top: YY,
			Width: width,
			Height: dist,
			Color: "#000000",
			LineWidth: 1,
			zIndex: -18,
			alpha: 0.9
		});

		KDDraw(kdcanvas, kdpixisprites, "facicon" + facility[0],
			KinkyDungeonRootDirectory + "UI/Facility/" + facility[0] + ".png",
			XX + 1, YY - 76, 72, 72
		);
		DrawTextFitKD(TextGet("KDFacility_" + facility[0]), XX + 80, YY - 40, width - 160, "#ffffff", KDTextGray0, 32, "left");
		let yyy = 0;
		for (let str of TextGet("KDFacilityDesc_" + facility[0]).split('|'))
			DrawTextFitKD(str, XX + 25, YY + 16 + 22*(yyy++), width - 50, "#ffffff", KDTextGray0, 18, "left");


		YY += dist + padding;
		rendered ++;
	}

	if (FacilitiesIndex > 0 || broken) {
		DrawButtonKDEx("facUp", (b) => {
			FacilitiesIndex -= 1;
			return true;
		}, FacilitiesIndex > 0, 1650, 110, 150, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png",
		undefined, undefined, !(FacilitiesIndex > 0), KDButtonColor, undefined, undefined, {
			centered: true,
		});
			DrawButtonKDEx("facDown", (b) => {
				FacilitiesIndex += 1;
				return true;
			}, broken, 1650, 850, 150, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png",
		undefined, undefined, !broken, KDButtonColor, undefined, undefined, {
			centered: true,
		});
	}

	if (FacilitiesIndex > 0 || broken) {
		KDDraw(kdcanvas, kdpixisprites, "facScrollBar",
			KinkyDungeonRootDirectory + "UI/Checked.png",
			1695, 175 + 590*(FacilitiesIndex/Math.max(1, listRender.length - rendered)), 60, 60
		);
	}
}