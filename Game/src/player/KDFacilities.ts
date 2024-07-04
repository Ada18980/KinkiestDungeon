let FacilitiesIndex = 0;


interface FacilitiesData {
	Recycler_Rope: number,
	Recycler_Latex: number,
	Recycler_Metal: number,
	Recycler_Leather: number,
	Recycler_Rune: number,
	RecyclerInput_Rope: number,
	RecyclerInput_Latex: number,
	RecyclerInput_Metal: number,
	RecyclerInput_Leather: number,
	RecyclerInput_Rune: number,
	Servants_Recycler: number[],
	Prisoners_Recycler: number[],
};

let FacilitiesDataBase : FacilitiesData = {
	Recycler_Rope: 0,
	Recycler_Latex: 0,
	Recycler_Metal: 0,
	Recycler_Leather: 0,
	Recycler_Rune: 0,
	RecyclerInput_Rope: 0,
	RecyclerInput_Latex: 0,
	RecyclerInput_Metal: 0,
	RecyclerInput_Leather: 0,
	RecyclerInput_Rune: 0,

	Servants_Recycler: [],
	Prisoners_Recycler: [],
};

function InitFacilities() {
	if (!KDGameData.FacilitiesData) {
		KDGameData.FacilitiesData = JSON.parse(JSON.stringify(FacilitiesDataBase));
	} else {
		let data = KDGameData.FacilitiesData;
		for (let entry of Object.entries(FacilitiesDataBase)) {
			if (data[entry[0]] == undefined) data[entry[0]] = JSON.parse(JSON.stringify(entry[1]));
		}
	}
}

function KDUpdateFacilities(delta: number) {
	let listUpdate = Object.entries(KDFacilityTypes).filter((entry) => {
		return entry[1].prereq();
	});
	for (let fac of listUpdate) {
		fac[1].update(delta);
	}
}

function KinkyDungeonDrawFacilities(xOffset = -125) {
	let x = 1225 + xOffset;

	if (!KinkyDungeonFlags.get("1stSummit")) {
		DrawTextFitKD(TextGet("KDFacilitiesLocked"), x, 300, 1050, "#ffffff", KDTextGray0, 24);
	} else {
		KDDrawFacilitiesList(xOffset);
	}


	KDDrawInventoryTabs(xOffset);
}


function KDDrawFacilitiesList(xOffset) {

	let padding = 100;
	let YY = 170;
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
		let dist = facility[1].draw(XX, YY, width);
		if (YY + dist > 980) {
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
			hotkey: KDHotkeyToText(KinkyDungeonKey[0]),
			hotkeyPress: KinkyDungeonKey[0],
		});
			DrawButtonKDEx("facDown", (b) => {
				FacilitiesIndex += 1;
				return true;
			}, broken, 1650, 850, 150, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png",
		undefined, undefined, !broken, KDButtonColor, undefined, undefined, {
			centered: true,
			hotkey: KDHotkeyToText(KinkyDungeonKey[2]),
			hotkeyPress: KinkyDungeonKey[2],
		});
	}

	if (FacilitiesIndex > 0 || broken) {
		KDDraw(kdcanvas, kdpixisprites, "facScrollBar",
			KinkyDungeonRootDirectory + "UI/Checked.png",
			1695, 175 + 590*(FacilitiesIndex/Math.max(1, listRender.length - rendered)), 60, 60
		);
	}
}

function KDGetServantEnemy(servant: KDCollectionEntry): enemy {
	if (servant && servant.status == "Servant") {
		return servant.Enemy || KinkyDungeonGetEnemyByName(servant.type);
	}
	return null;
}


function KDDrawServantPrisonerList(facility: string, x: number, y: number, width: number) : number {
	let yy = 0;

	let fac = KDFacilityTypes[facility];
	if (fac) {
		let ms = fac.maxServants();
		let mp = fac.maxPrisoners();
		let w = 72;
		let spacing = 110;
		if (ms > 0) {
			DrawTextFitKD(TextGet("KDServants") + ": ", x + width/2 - (spacing * (ms - 1) + w)/2 - 5, y + yy + 36,
			500, "#ffffff", KDTextGray0, 24, "right");
			let servants = KDGameData.FacilitiesData["Servants_" + facility];
			for (let i = 0; i < ms; i++) {
				let servant = servants[i];
				DrawButtonKDEx(facility + "serv" + i, (b) => {
					KDCurrentFacilityTarget = facility;
					KDCurrentFacilityCollectionType = "Servants";
					KinkyDungeonDrawState = "Collection";
					return true;
				}, true, x + width/2 - (spacing * (ms - 1) + w)/2 + i * spacing, y + yy, w, w, "", "#ffffff", KDCollectionImage(servant),
				undefined, undefined, !servant, KDButtonColor, undefined, undefined, {
					centered: true,
				});
			}

			yy += 100;
		}
		if (mp > 0) {
			DrawTextFitKD(TextGet("KDPrisoners") + ": ", x + width/2 - (spacing * (mp - 1) + w)/2 - 5, y + yy + 36,
			500, "#ffffff", KDTextGray0, 24, "right");
			let prisoners = KDGameData.FacilitiesData["Prisoners_" + facility];
			for (let i = 0; i < mp; i++) {
				let prisoner = prisoners[i];
				DrawButtonKDEx(facility + "pris" + i, (b) => {
					KDCurrentFacilityTarget = facility;
					KDCurrentFacilityCollectionType = "Prisoners";
					KinkyDungeonDrawState = "Collection";
					return true;
				}, true, x + width/2 - (spacing * (mp - 1) + w)/2 + i * spacing, y + yy, w, w, "", "#ffffff", KDCollectionImage(prisoner),
				undefined, undefined, !prisoner, KDButtonColor, undefined, undefined, {
					centered: true,
				});
			}

			yy += 110;
		}
	}

	return yy;
}