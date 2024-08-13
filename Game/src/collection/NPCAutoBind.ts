let KDAutoBindRestraints: Record<string, NPCRestraint> = null;
let KDAutoBindRestraintsName = "";

KDCollectionTabDraw.AutoBind = (value, buttonSpacing, III, x, y) => {
	let entity = KinkyDungeonFindID(value.id) || KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
	if (DrawButtonKDEx("NPCCopyBondage", (b) => {

		if (!KDGetNPCRestraints(value.id) || Object.values(KDGetNPCRestraints(value.id)).length == 0) {
			return false;
		}

		KDAutoBindRestraints = JSON.parse(JSON.stringify(KDGetNPCRestraints(value.id)));
		KDAutoBindRestraintsName = (KDGameData.Collection[value.id + ""] || KDGetVirtualCollectionEntry(value.id)).name;

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockLight" + ".ogg");
		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/AutoBindCopy.png",
	undefined, undefined, entity != undefined,
	(!KDGetNPCRestraints(value.id) || Object.values(KDGetNPCRestraints(value.id)).length == 0) ? "#ff5555" : KDButtonColor, undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyUpcast[0]),
		hotkeyPress: KinkyDungeonKeyUpcast[0],
	})) {
		DrawTextFitKD(TextGet("KDAutoBindCopy"), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}
	if (DrawButtonKDEx("NPCPasteBondage", (b) => {

		if (KDAutoBindRestraints) {
			let restraints = KDAutoBindRestraints;
			if (restraints) {
				/*for (let inv of Object.entries(restraints)) {
					KDInputSetNPCRestraint({
						slot: inv[0],
						id: -1,
						restraint: "",
						restraintid: -1,
						lock: "",
						npc: value.id
					});
				}*/
				// Readd
				for (let inv of Object.entries(restraints)) {
					if (KinkyDungeonInventoryGetSafe(inv[1].name) && KinkyDungeonInventoryGetSafe(inv[1].name).quantity != 0)
						KDInputSetNPCRestraint({
							slot: inv[0],
							id: undefined,
							faction: inv[1].faction,
							restraint: inv[1].name,
							restraintid: inv[1].id,
							lock: inv[1].lock,
							npc: value.id
						});
				}
				KDValidateEscapeGrace(value);
			}
			KinkyDungeonCheckClothesLoss = true;
		}

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockLight" + ".ogg");
		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/AutoBindPaste.png",
	undefined, undefined, entity != undefined,
	(!KDAutoBindRestraints) ? "#ff5555" : KDButtonColor, undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyEnter[0]),
		hotkeyPress: KinkyDungeonKeyEnter[0],
	})) {
		let missingAll = KDAutoBindRestraints ? Object.values(KDAutoBindRestraints).length > 0 : false;
		if (KDAutoBindRestraints)
			for (let inv of Object.entries(KDAutoBindRestraints)) {
				if (KinkyDungeonInventoryGetSafe(inv[1].name) && KinkyDungeonInventoryGetSafe(inv[1].name).quantity != 0) {
					missingAll = false
					break;
				}
			}

		DrawTextFitKD(TextGet(missingAll ? "KDAutoBindPasteNone" : "KDAutoBindPaste").replace("NME", KDAutoBindRestraintsName), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}
	if (KDGameData.Collection[value.id + ""] && DrawButtonKDEx("RestrainFree", (b) => {
		if (!KDIsNPCPersistent(value.id) || KDGetPersistentNPC(value.id).collect)
			KDSendInput("freeNPCRestraint", {
				npc: value.id,
			});
		else {
			KinkyDungeonSendTextMessage(10, TextGet("KDCantFree"), "#ffffff", 2, true, true);
		}
		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Struggle" + ".ogg");
		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/RestrainFree.png",
	undefined, undefined, false, (!KDIsNPCPersistent(value.id) || KDGetPersistentNPC(value.id).collect) ?
	KDButtonColor : "#ff5555", undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeyUpcast[1]),
		hotkeyPress: KinkyDungeonKeyUpcast[1],
	})) {
		DrawTextFitKD(TextGet("KDFreePrisoner"), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}

	if (DrawButtonKDEx("NPCPasteBondageAll", (b) => {

		if (KDAutoBindRestraints) {
			let eligible: KDCollectionEntry[] = [];

			for (let vv of KDDrawnCollectionInventory) {
				if (!KDNPCUnavailable(vv.id, vv.status)) eligible.push(vv);
			}

			for (let v of eligible) {
				let restraints: Record<string, NPCRestraint> = JSON.parse(JSON.stringify(KDAutoBindRestraints));
				if (restraints) {
					/*for (let inv of Object.entries(restraints)) {
						KDInputSetNPCRestraint({
							slot: inv[0],
							id: -1,
							restraint: "",
							restraintid: -1,
							lock: "",
							npc: v.id
						});
					}*/
					for (let inv of Object.entries(restraints)) {
						if (KinkyDungeonInventoryGetSafe(inv[1].name) && KinkyDungeonInventoryGetSafe(inv[1].name).quantity != 0)
							KDInputSetNPCRestraint({
								slot: inv[0],
								id: undefined,
								faction: inv[1].faction,
								restraint: inv[1].name,
								restraintid: inv[1].id,
								lock: inv[1].lock,
								npc: v.id
							});
					}

					KDValidateEscapeGrace(v);
				}
			}
			KinkyDungeonCheckClothesLoss = true;

		}

		if (KDToggles.Sound)
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockLight" + ".ogg");
		return true;
	}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
	"", "#ffffff", KinkyDungeonRootDirectory + "UI/AutoBindPasteAllOver.png",
	undefined, undefined, entity != undefined,
	(!KDAutoBindRestraints) ? "#ff5555" : KDButtonColor)) {
		let missingAll = KDAutoBindRestraints ? Object.values(KDAutoBindRestraints).length > 0 : false;
		if (KDAutoBindRestraints)
			for (let inv of Object.entries(KDAutoBindRestraints)) {
				if (KinkyDungeonInventoryGetSafe(inv[1].name) && KinkyDungeonInventoryGetSafe(inv[1].name).quantity != 0) {
					missingAll = false
					break;
				}
			}
		DrawTextFitKD(TextGet(missingAll ? "KDAutoBindPasteNone" : "KDAutoBindPasteAll").replace("NME", KDAutoBindRestraintsName), x + 220, y + 750, 500, "#ffffff",
			KDTextGray0);
	}

	return III;
};