function KDDrawManagement(x: number, y: number, width: number): number {
	let dd = 215;
	if (y + dd < 940) {
		let yy = y;

		yy += KDDrawServantPrisonerList("Management", x + 50, yy + 70, width, 80,
			KDFacilityTypes.Management.servantPrisonerCallback);

		let rate = KDGetManagementEfficiency();
		let ii = 0;
		//DrawTextFitKD(TextGet("KDManagement1"),
		//	x + 50, yy + 80 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");
		DrawTextFitKD(TextGet("KDManagement2")
			.replace("AMNT", (rate > 0 ? "+" : "") + Math.round((rate - 1)*100) + ""),
			x + 50, yy + 80 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");


	}
	return dd;
}

/** Gets the efficiency bonus */
function KDGetManagementEfficiency(): number {
	let data = {
		efficiency: 1,
		gainMult: KinkyDungeonFlags.get("manageEfficiencyLoss") ? 0 : 1
	};

	let facility = "Management";

	if (KDGameData.FacilitiesData["Servants_" + facility])
	for (let servant of KDGameData.FacilitiesData["Servants_" + facility]) {
		let value = KDGameData.Collection[servant + ""];
		if (value) {
			let mult = data.efficiency;
			let x = (1+KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type)));
			data.efficiency += mult * 0.1 * (0.65+0.25*x+0.125*x*x);
		}
	}
	KinkyDungeonSendEvent("calcManagement", data);

	return data.efficiency;
}