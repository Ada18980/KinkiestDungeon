let KDCollectionReleaseSelection: Record<string, boolean> = {};

KDCollectionTabDraw.Release = (value, buttonSpacing, III, x, y) => {
	let tooltip = false;
	if (DrawButtonKDEx("KDReleaseRelease", (b) => {

		KDSendInput("releaseNPC", {
			selection: KDCollectionReleaseSelection,
		});

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Dollify" + ".ogg");

		// DamageWeak
		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/Buttons/Release.png",
	undefined, undefined, Object.keys(KDCollectionReleaseSelection).length == 0,
	(Object.keys(KDCollectionReleaseSelection).length == 0) ? "#ff5555" : KDButtonColor, undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyUpcast[0]),
		hotkeyPress: KinkyDungeonKeyUpcast[0],
	})) {
		tooltip = true;
		DrawTextFitKD(TextGet("KDReleaseRelease"), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}

	let ransomValue = 0;
	for (let v of Object.keys(KDCollectionReleaseSelection)) {
		if (KDCanRansom(parseInt(v))) {
			ransomValue += KDRansomValue(parseInt(v));
		}
	}

	DrawTextFitKD("" + Math.round(ransomValue), x + 10 + buttonSpacing*III + 40, y + 68 + 730 - 10 - 80, 500, "#ffffff",
		KDTextGray0, 18);

	if (DrawButtonKDEx("KDReleaseRansom", (b) => {

		if (ransomValue > 0)
			KDSendInput("ransomNPC", {
				selection: KDCollectionReleaseSelection,
			});

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Coin" + ".ogg");

		// DamageWeak
		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/Buttons/Ransom.png",
	undefined, undefined, Object.keys(KDCollectionReleaseSelection).length == 0,
	(ransomValue == 0 || Object.keys(KDCollectionReleaseSelection).length == 0) ? "#ff5555" : KDButtonColor, undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyUpcast[1]),
		hotkeyPress: KinkyDungeonKeyUpcast[1],
	})) {
		tooltip = true;
		DrawTextFitKD(TextGet("KDReleaseRansom").replace("GP", "" + Math.round(ransomValue)), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}


	if (DrawButtonKDEx("KDReleaseUnMarkAll", (b) => {

		KDCollectionReleaseSelection = {};

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Damage" + ".ogg");

		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/Buttons/UnmarkAll.png",
	undefined, undefined, Object.keys(KDCollectionReleaseSelection).length == 0,
	(Object.keys(KDCollectionReleaseSelection).length == 0) ? "#ff5555" : KDButtonColor, undefined, undefined, {

	})) {
		tooltip = true;
		DrawTextFitKD(TextGet("KDReleaseUnMarkAll"), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}
	if (DrawButtonKDEx("KDReleaseMarkAll", (b) => {

		KDCollectionReleaseSelection = {};

		for (let v of KDDrawnCollectionInventory) {
			if (KDCanRelease(v.id))
				KDCollectionReleaseSelection[v.id] = true;
		}

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Danger" + ".ogg");

		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/Buttons/MarkAll.png",
	undefined, undefined, Object.keys(KDCollectionReleaseSelection).length == KDDrawnCollectionInventory.length,
	(Object.keys(KDCollectionReleaseSelection).length == KDDrawnCollectionInventory.length) ? "#ff5555" : KDButtonColor, undefined, undefined, {

	})) {
		tooltip = true;
		DrawTextFitKD(TextGet("KDReleaseMarkAll"), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}

	if (DrawButtonKDEx("KDReleaseMarkUnmark", (b) => {

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
			+ (!KDCollectionReleaseSelection[value.id] ? "DangerWeak" : "DamageWeak") + ".ogg");

		if (KDCollectionReleaseSelection[value.id]) delete KDCollectionReleaseSelection[value.id];
		else if (KDCanRelease(value.id)) KDCollectionReleaseSelection[value.id] = true;


		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory
		+ "UI/Buttons/" + (KDCollectionReleaseSelection[value.id] ? "Unmark" : "Mark") + ".png",
	undefined, undefined, false,
	KDButtonColor, undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyEnter[0]),
		hotkeyPress: KinkyDungeonKeyEnter[0],
	})) {
		tooltip = true;
		DrawTextFitKD(TextGet("KDRelease" + (KDCollectionReleaseSelection[value.id] ? "Unmark" : "Mark")), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}

	if (!tooltip) {
		DrawTextFitKD(TextGet("KDRansomValue").replace("GP",
			KDCanRansom(value.id) ? ("" + Math.round(KDRansomValue(value.id))) : TextGet("KDNA")), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}
	DrawTextFitKD(TextGet("KDCurrentGold").replace("GP", "" + Math.round(KinkyDungeonGold)), x + 220, y + 785, 500, "#ffffff",
			KDTextGray0);


	return III;
};

KDCollectionTabScreen.Release = (x, xOffset) => {
	KDDrawCollectionInventory(x + xOffset, 150, (value, x, y) => {
		if (KDCollectionReleaseSelection[value.id])
			KDDraw(kdcanvas, kdpixisprites, value.name + "_crossout," + value.id,
				KinkyDungeonRootDirectory + "UI/Crossout.png",
				x + 36,
				y + 36,
				72, 72, undefined, {
					zIndex: 111
				}, true);
	});
	KDDrawCollectionFilters(1750, 920);
	KDDrawCollectionTabOptions(1000, 920);
}

function KDCanRelease(id: number) {
	let v = KDGameData.Collection[id + ""];
	return v && !v.status && !v.escaped; // Prisoners only
}
function KDCanRansom(id: number) {
	let v = KDGameData.Collection[id + ""];
	return v && !v.status && !v.escaped && !KDGetGlobalEntity(id) && !KDNPCUnavailable(id, v.status) && v.Faction && !KinkyDungeonHiddenFactions.has(v.Faction); // Prisoners only
}
function KDRansomValue(id: number) {
	let v = KDGameData.Collection[id + ""];
	if (!v) return 0;
	let rank = KDEnemyTypeRank(KinkyDungeonGetEnemyByName(v.type));
	return 10 + rank*rank*30 + rank * 50;
}


function KDIsInPlayerBase(id: number) {
	return (KDIsNPCPersistent(id) && KDGetPersistentNPC(id)?.room == "Summit")
		|| (KDGameData.Collection[id + ""] && !KDIsNPCPersistent(id));
}