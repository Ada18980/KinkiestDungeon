function KDDrawManagement(x: number, y: number, width: number): number {
	let dd = 400;
	if (y + dd < 940) {
		let yy = y;

		yy += KDDrawServantPrisonerList("Management", x + 50, yy + 70, width, 80);

		let rate = KDGetManagementEfficiency();
		let ii = 0;
		DrawTextFitKD(TextGet("KDManagement1"),
			x + 50, yy + 100 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");
		DrawTextFitKD(TextGet("KDManagement2").replace("AMNT", Math.round(rate*10)/10 + ""),
			x + 50, yy + 100 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");


	}
	return dd;
}

/** Gets the efficiency bonus */
function KDGetManagementEfficiency(): number {
	return 0;
}