function KDDrawWarden(x: number, y: number, width: number): number {
	let dd = 285;
	if (y + dd < 940) {
		let yy = y;

		yy += KDDrawServantPrisonerList("Warden", x + 50, yy + 70, width, 80);


		let ii = 0;
		DrawTextFitKD(TextGet("KDWardenTightened")
			.replace("AMNT", "" + KDGameData.FacilitiesData.Warden_TightenedCount),
				x + 50, yy + 80 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");
		if (!KDGetContainer("WardenChest") || Object.values(KDGetContainer("WardenChest").items).length == 0)
			DrawTextFitKD(TextGet("KDWardenNoRestraints"),
				x + 50, yy + 80 + 30*ii++, width-100, "#ffffff", KDTextGray0, 18, "left");

		DrawButtonKDEx(
			"chestbutton", () => {
				KDUI_ContainerBackScreen = KinkyDungeonDrawState;
				KinkyDungeonDrawState = "Container",
				KDUI_CurrentContainer = "WardenChest";
			}, true, x + 900, yy + 60, 80, 80, "", "#ffffff",
			KinkyDungeonRootDirectory + "UI/Safe.png", undefined, undefined, undefined, undefined, undefined, undefined, {
				centered: true,
			}
		)
	}
	return dd;
}
