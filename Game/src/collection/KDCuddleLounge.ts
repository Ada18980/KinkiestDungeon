function KDDrawCuddleLounge(x: number, y: number, width: number): number {
	let dd = 370;
	if (y + dd < 940) {
		let yy = y;

		yy += KDDrawServantPrisonerList("CuddleLounge", x + 50, yy + 70, width, 80);

		let rate = KDCuddleLoungeGain();
		let ii = 0;
		DrawTextFitKD(TextGet("KDCuddleLounge1")
			.replace("AMNT", Math.round(rate.servantPoints*10) + "")
			.replace("OPN", Math.round(rate.servants*10)/10 + "")
			,
			x + 50, yy + 70 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");
		DrawTextFitKD(TextGet("KDCuddleLounge2")
			.replace("AMNT", Math.round(rate.prisonerPoints*10) + "")
			.replace("OPN", Math.round(rate.prisoners*10)/10 + "")
			,
			x + 50, yy + 70 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");
		DrawTextFitKD(TextGet("KDCuddleLoungeInfo"),
			x + 50, yy + 70 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");

	}
	return dd;
}


let KDCuddleLoungePersonalityMult = {
	Servant: {
		Brat: 0.75,
		Sub: 0.5,
		Dom: 2.0,
	},
	Prisoner: {
		Brat: 1.5,
		Sub: 2.0,
		Dom: 0.25,
	},
};

function KDCuddleLoungeGain(): {servants: number, prisoners: number, servantPoints: number, prisonerPoints: number} {
	let data = {
		servants: 0,
		prisoners: 0,
		servantPoints: 0,
		prisonerPoints: 0,
		efficiency: KDGetManagementEfficiency(),
	};

	let facility = "CuddleLounge";

	if (KDGameData.FacilitiesData["Servants_" + facility])
	for (let servant of KDGameData.FacilitiesData["Servants_" + facility]) {
		let value = KDGameData.Collection[servant + ""];
		if (value) {
			let mult = data.efficiency;
			let countMult = (3 / (2 + KDGameData.FacilitiesData["Servants_" + facility].length));
			let personality = "";
			if (KDIsNPCPersistent(value.id) && KDGetPersistentNPC(value.id).entity?.personality) {
				personality = KDGetPersistentNPC(value.id).entity?.personality;
			}
			if (personality && KDCuddleLoungePersonalityMult.Servant[personality]) {
				mult *= KDCuddleLoungePersonalityMult.Servant[personality];
			}
			let x = (1+KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type)));
			data.servants += countMult*mult * 0.1 * (0.65+0.25*x+0.125*x*x);
			data.prisoners += countMult*mult *1.0 * (0.65+0.25*x+0.125*x*x);
			data.servantPoints += mult * 0.1 * (0.65+0.25*x+0.125*x*x);
			data.prisonerPoints += mult *1.0 * (0.65+0.25*x+0.125*x*x);
		}
	}
	for (let servant of KDGameData.FacilitiesData["Prisoners_" + facility]) {
		let value = KDGameData.Collection[servant + ""];
		if (value) {
			let mult = data.efficiency;
			let countMult = (6 / (5 + KDGameData.FacilitiesData["Prisoners_" + facility].length));
			let personality = "";
			if (KDIsNPCPersistent(value.id) && KDGetPersistentNPC(value.id).entity?.personality) {
				personality = KDGetPersistentNPC(value.id).entity?.personality;
			}
			if (personality && KDCuddleLoungePersonalityMult.Prisoner[personality]) {
				mult *= KDCuddleLoungePersonalityMult.Prisoner[personality];
			}
			let x = (1+KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type)));
			data.servants += countMult*mult * 1.0 * (0.65+0.25*x+0.125*x*x);
			data.prisoners += countMult*mult *0.1 * (0.65+0.25*x+0.125*x*x);
			data.servantPoints += mult * 1.0 * (0.65+0.25*x+0.125*x*x);
			data.prisonerPoints += mult *0.1 * (0.65+0.25*x+0.125*x*x);
		}
	}

	KinkyDungeonSendEvent("calcCuddleLounge", data);


	return data;
}