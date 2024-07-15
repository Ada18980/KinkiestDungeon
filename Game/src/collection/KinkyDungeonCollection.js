"use strict";

let KDCollectionTab = "";

let KDCurrentFacilityTarget = "";
let KDCurrentFacilityCollectionType = "";
let KDCurrentRestrainingTarget = 0;

let KDCollectionTabStatus = "";
let KDCollectionTabStatusOptions = ["", "Guest"];
let KDPromotableStatus = ["", "Guest"];

let KDFacilityCollectionDataTypes = [
	"Prisoners",
	"Servants",
];
let KDFacilityCollectionDataTypeMap = {
	"Prisoners": "",
	"Servants": "Servant"
};

function KinkyDungeonDrawCollection(xOffset = -125) {
	let x = 1225 + xOffset;
	if (!KDGameData.Collection) KDGameData.Collection = {};

	if (KDCurrentRestrainingTarget && KDGameData.Collection["" + KDCurrentRestrainingTarget]) {
		KDDrawCollectionRestrain(KDCurrentRestrainingTarget, x + xOffset, 150);
	} else {
		if (Object.entries(KDGameData.Collection).length == 0) {
			DrawTextFitKD(TextGet("KDCollectionEmpty"), x, 300, 1050, "#ffffff", KDTextGray0, 24);
		} else {
			KDDrawCollectionInventory(x + xOffset, 150);
		}
	}


	KDDrawInventoryTabs(xOffset);
}

/**
 *
 * @param {number} id
 * @returns {string}
 */
function KDCollectionImage(id) {
	let value = KDGameData.Collection["" + id];
	if (value) {
		let sp = (value.sprite || value.type);
		let dir = "Enemies/";
		let enemyType = value.Enemy || KinkyDungeonGetEnemyByName(value.type);
		if (!value.status) {
			// Prisoner
			dir = value.customSprite ? "Enemies/CustomSpriteBound/" : "EnemiesBound/";
			if (!value.customSprite) sp = enemyType.bound;
		} else {
			dir = value.customSprite ? "Enemies/CustomSprite/" : "Enemies/";
		}
		return KinkyDungeonRootDirectory + dir + sp + '.png';
	}
	return "";
}

/**
 *
 * @param {number} id
 * @param {number} amount
 */
function KDAddOpinionPersistent(id, amount) {
	if (KDIsNPCPersistent(id)) {
		KDUpdatePersistentNPC(id);
		KDAddOpinion(KDGetPersistentNPC(id).entity, amount);
		KDRefreshPersistentNPC(id);
	} else {
		KDAddOpinion(KinkyDungeonFindID(id), amount);
	}
}


/**
 *
 * @param {number} id
 * @returns {number}
 */
function KDGetModifiedOpinionID(id) {
	if (KDIsNPCPersistent(id)) {
		let enemy = KDGetPersistentNPC(id).entity;
		let op = enemy.opinion || 0;

		op += 30 * KDFactionRelation("Player", KDGetFaction(enemy));
		if (KinkyDungeonStatsChoice.get("Dominant") && enemy.personality && KDLoosePersonalities.includes(enemy.personality)) op += 12;
		if (KinkyDungeonStatsChoice.get("Oppression")) op -= 15;

		return op;
	} else {
		return KDGetModifiedOpinion(KinkyDungeonFindID(id));
	}

}

/**
 *
 * @param {entity} enemy
 * @param {string} [status]
 * @param {string} [status]
 * @param {string} [servantclass]
 * @param {string} [type]
 */
function KDAddCollection(enemy, type, status, servantclass) {
	if (!KDGameData.Collection) KDGameData.Collection = {};
	if (!KDGameData.CollectionSorted) KDSortCollection();

	if (KDNoCaptureTypes.some((tag) => {return enemy.Enemy.tags[tag];})) {
		return;
	}

	if (!KDGameData.Collection["" + enemy.id]) {
		// Add her
		/** @type {KDCollectionEntry} */
		let entry = {
			id: enemy.id,
			name: KDGetPersistentNPC(enemy.id).Name,
			sprite: (enemy.CustomSprite) || enemy.Enemy.name,
			// @ts-ignore
			customSprite: (enemy.CustomSprite),
			color: enemy.CustomNameColor || "#ffffff",
			Faction: KDGetFaction(enemy) || KDGetFactionOriginal(enemy),
			class: servantclass || "prisoner",
			Training: -(10 + 10 * KDRandom()) * KDEnemyRank(enemy) - 25,
			status: status || "",
			oldstatus: status || "",
			type: enemy.Enemy.name,
			Enemy: enemy.modified ? enemy.Enemy : undefined,
			Willpower: 100,
			Facility: undefined,
			flags: undefined,
		};
		enemy.CustomName = entry.name;
		enemy.CustomNameColor = entry.color;
		KDUpdatePersistentNPC(enemy.id);
		KDGameData.Collection["" + enemy.id] = entry;
		KDGameData.CollectionSorted.unshift(entry);
		KDSortCollection();
	} else {
		// Update her
		let entry = KDGameData.Collection["" + enemy.id];
		if (status != undefined) {
			entry.status = status;
		}
		if (servantclass != undefined) {
			entry.class = servantclass;
		}
		if (type != undefined) {
			entry.type = type;
		}
	}
}



function KDUpdateCollectionFlags(delta) {
	for (let npc of Object.values(KDGameData.Collection)) {
		if (npc.flags) {
			/** @type {Record<string, number>} */
			let newF = {};
			for (let entry of Object.entries(npc.flags)) {
				if (entry[1] > delta) newF[entry[0]] = entry[1] - delta;
				else if (entry[1] == -1) newF[entry[0]] = -1;
			}

			if (Object.entries(newF).length == 0) delete npc.flags;
			else npc.flags = newF;
		}
	}
}

/**
 *
 * @param {entity} entity
 * @returns {Character}
 */
function KDGetCharacter(entity) {
	if (entity?.id == KDPlayer().id) {
		return KinkyDungeonPlayer;
	}
	return KDNPCChar.get(entity.id);
}
/**
 *
 * @param {Character} C
 * @returns {number}
 */
function KDGetCharacterID(C) {
	if (C == KinkyDungeonPlayer) {
		return KDPlayer().id;
	}
	return KDNPCChar_ID.get(C);
}
/**
 *
 * @param {Character} C
 * @returns {entity}
 */
function KDGetCharacterEntity(C) {
	if (C == KinkyDungeonPlayer) {
		return KDPlayer();
	}
	if (KDNPCChar_ID.get(C))
		return KinkyDungeonFindID( KDNPCChar_ID.get(C));
	return undefined;
}

/**
 *
 * @param {KDCollectionEntry} value
 * @param {number} x
 * @param {number} y
 * @param {number} index
 * @param {string} tab
 */
function KDDrawSelectedCollectionMember(value, x, y, index, tab = "") {

	FillRectKD(kdcanvas, kdpixisprites, "collectionselectionbg", {
		Left: x,
		Top: y,
		Width: 440,
		Height: 730,
		Color: "#000000",
		LineWidth: 1,
		zIndex: -20,
		alpha: 0.5
	});
	DrawRectKD(kdcanvas, kdpixisprites, "collectionselectionbg2", {
		Left: x,
		Top: y,
		Width: 440,
		Height: 730,
		Color: "#888888",
		LineWidth: 1,
		zIndex: -19,
		alpha: 0.9
	});


	let sp = (value.sprite || value.type);
	let dir = "Enemies/";
	let enemyType = value.Enemy || KinkyDungeonGetEnemyByName(value.type);

	if (!value.status) {
		// Prisoner
		dir = value.customSprite ? "Enemies/CustomSpriteBound/" : "EnemiesBound/";
		if (!value.customSprite) sp = enemyType.bound;
	} else {
		dir = value.customSprite ? "Enemies/CustomSprite/" : "Enemies/";
	}

	DrawTextFitKD(value.name, x + 220, y + 50, 500, "#ffffff", (value.color && value.color != "#ffffff") ? value.color : KDTextGray05, 36);

	if (tab) {
		DrawTextFitKD(TextGet("KDDrawSelectedTab_" + tab).replace("NUMR", "" + index).replace("TTL", "" + Object.values(KDGameData.Collection).length), x + 220, y + 15, 500, "#ffffff", KDTextGray05, 18);
	} else
	if (index)
		DrawTextFitKD(TextGet("KDPrisonerNum_" + KDCollectionTabStatus).replace("NUMR", "" + index).replace("TTL", "" + Object.values(KDGameData.Collection).length), x + 220, y + 15, 500, "#ffffff", KDTextGray05, 18);

	let II = 0;
	DrawTextFitKD(TextGet("Name" + enemyType.name), x + 220, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18);

	if (value.Faction && !KDFactionNoCollection.includes(value.Faction) && (KinkyDungeonTooltipFactions.includes(value.Faction) || !KinkyDungeonHiddenFactions.includes(value.Faction)))
		DrawTextFitKD(TextGet("KDFormerFaction") + TextGet("KinkyDungeonFaction" + value.Faction), x + 220, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18);

	let opinion = Math.max(-3, Math.min(3, Math.round(KDGetModifiedOpinionID(value.id)/10)));
	let str = TextGet("KDTooltipOpinion"+opinion);
	DrawTextFitKD(str, x + 220, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18);


	if (!KDNPCChar.get(value.id)) {
		KDSpeakerNPC = suppressCanvasUpdate(() => CharacterLoadNPC("coll" + value.id));
		KDNPCChar.set(value.id, KDSpeakerNPC);
		KDNPCChar_ID.set(KDSpeakerNPC, value.id);
		KDNPCStyle.set(KDSpeakerNPC, value);
		if (!value.bodystyle || !value.facestyle || !value.hairstyle || value.cosplaystyle == undefined) {
			if (enemyType?.style || KinkyDungeonGetEnemyByName(value.type)?.style) {
				if (KDModelStyles[enemyType?.style || KinkyDungeonGetEnemyByName(value.type)?.style]) {
					let style = KDModelStyles[enemyType?.style || KinkyDungeonGetEnemyByName(value.type)?.style];
					if (!value.bodystyle && style.Bodystyle) {
						value.bodystyle = style.Bodystyle[Math.floor(Math.random() * style.Bodystyle.length)];
					}
					if (!value.hairstyle && style.Hairstyle) {
						value.hairstyle = style.Hairstyle[Math.floor(Math.random() * style.Hairstyle.length)];
					}
					if (!value.facestyle && style.Facestyle) {
						value.facestyle = style.Facestyle[Math.floor(Math.random() * style.Facestyle.length)];
					}
					if (!value.cosplaystyle && style.Cosplay) {
						value.cosplaystyle = style.Cosplay[Math.floor(Math.random() * style.Cosplay.length)];
					}

				}
			}
		}
		if (enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit) {
			KinkyDungeonSetDress(enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit, enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit, KDSpeakerNPC, true);
		}
		KinkyDungeonCheckClothesLoss = true;
	} else {
		KDSpeakerNPC = KDNPCChar.get(value.id);
		KDNPCChar_ID.set(KDSpeakerNPC, value.id);
	}

	if (KDSpeakerNPC) {
		if (KinkyDungeonCheckClothesLoss) {
			if (!NPCTags.get(KDSpeakerNPC)) {
				NPCTags.set(KDSpeakerNPC, new Map());
			}
			NPCTags.set(KDSpeakerNPC, KinkyDungeonUpdateRestraints(KDSpeakerNPC, value.id, 0));
		}
		KinkyDungeonDressPlayer(KDSpeakerNPC, false, false, KDGameData.NPCRestraints ? KDGameData.NPCRestraints[value.id + ''] : undefined);
		DrawCharacter(KDSpeakerNPC,
			x + 20 + 100,
			y + 80,
			400/1000, true, undefined, PIXI.SCALE_MODES.NEAREST, [], undefined, false);

		let III = 0;
		let buttonSpacing = 90;
		if (DrawButtonKDEx("dressNPC", (b) => {
			if (KDToggles.Sound)
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LightJingle" + ".ogg");
			//KDSpeakerNPC = null;
			KinkyDungeonState = "Wardrobe";
			ForceRefreshModels(KDSpeakerNPC);
			KDOriginalValue = "";
			CharacterReleaseTotal(KDSpeakerNPC);
			KDWardrobeCallback = () => {
				let value2 = value;
				//if (KDOriginalValue) {
				value2.customOutfit = LZString.compressToBase64(CharacterAppearanceStringify(KDSpeakerNPC));
				//}
			};
			if (value.customOutfit) {
				let outfit = value.customOutfit;
				KDWardrobeRevertCallback = () => {
					CharacterAppearanceRestore(KDSpeakerNPC, DecompressB64(outfit));
					CharacterRefresh(KDSpeakerNPC);
					KDInitProtectedGroups(KDSpeakerNPC);
					KinkyDungeonDressPlayer(KDSpeakerNPC, true);
				};
				KDWardrobeResetCallback = () => {
					delete value.customOutfit;
				};
			} else {
				KDWardrobeRevertCallback = null;
				KDWardrobeResetCallback = null;
			}

			KDPlayerSetPose = false;
			KDInitCurrentPose();
			KinkyDungeonInitializeDresses();
			KDUpdateModelList();
			KDRefreshOutfitInfo();
			let orig = localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);
			let current = LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer));
			if (orig != current) KDOriginalValue = orig;
			ForceRefreshModelsAsync(KDSpeakerNPC);
			//KinkyDungeonDressPlayer(KDSpeakerNPC, true, true);
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Dress.png")) {
			DrawTextFitKD(TextGet("KDDressNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		}

		III = KDCollectionTabDraw[tab || "Default"](value, buttonSpacing, III, x, y);

		let assigned = !(!value.Facility);
		let valid = KDValidateServant(value, KDCurrentFacilityTarget, KDCurrentFacilityCollectionType);

		if (KDCurrentFacilityTarget) {
			let dd = KDGameData.FacilitiesData[KDCurrentFacilityCollectionType + "_" + KDCurrentFacilityTarget];
			let fac = KDFacilityTypes[KDCurrentFacilityTarget];
			if (dd && fac && fac["max" + KDCurrentFacilityCollectionType] && (assigned || dd.length < fac["max" + KDCurrentFacilityCollectionType]())) {

				KDDraw(kdcanvas, kdpixisprites, "facilityAssignIcon",
					KinkyDungeonRootDirectory + `UI/Facility_${(assigned || !valid) ?"X" : KDCurrentFacilityCollectionType}.png`,
					x + 10 + buttonSpacing*III, y + 730 - 10 - 80, 80, 80, undefined, {
						zIndex: 160,
					}
				);
				if (DrawButtonKDEx("facilityAssign", (b) => {
					if (!valid) return false;
					if (!assigned) {
						let data = KDGameData.FacilitiesData[KDCurrentFacilityCollectionType + "_" + KDCurrentFacilityTarget];
						if (data) {
							data.push(value.id);
							value.Facility = KDCurrentFacilityTarget;
						}
					} else {
						let listRender = Object.entries(KDFacilityTypes).filter((entry) => {
							return entry[1].prereq();
						});
						for (let f of listRender) {
							for (let dt of KDFacilityCollectionDataTypes) {
								/**
								 * @type {number[]}
								 */
								let data = KDGameData.FacilitiesData[dt + "_" + f[0]];
								if (data?.includes(value.id)) {
									value.Facility = undefined;
									data.splice(data.indexOf(value.id), 1);
									break;
								}
							}
						}
					}

					KDValidateAllFacilities();
					return true;
				}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff",
				KinkyDungeonRootDirectory + `UI/Facility/${value.Facility || KDCurrentFacilityTarget}.png`, undefined, undefined, !valid, (!valid) ? "#ff5555" : undefined)) {
					DrawTextFitKD(TextGet(`KDCollection${assigned ? "Remove" : "Assign"}`) + TextGet("KDFacility_" + KDCurrentFacilityTarget),
						x + 220, y + 750, 500, "#ffffff", KDTextGray0);
				}
			}

		}

	} else {
		KDDraw(kdcanvas, kdpixisprites, value.name + "_coll," + value.id, KinkyDungeonRootDirectory + dir + sp + ".png",
			x + 20,
			y + 80,
			400, 400, undefined);
	}


}

/**
 *
 * @param {number} id
 * @param {number} x
 * @param {number} y
 */
function KDDrawCollectionRestrain(id, x, y) {
	if (!KDGameData.CollectionSorted) KDSortCollection();

	KDDrawCollectionRestrainMain(id, x, y);
	KDDrawSelectedCollectionMember(KDGameData.Collection["" + id], x - 460, 150, 0, "Restrain");
}

/**
 *
 * @param {number} id
 * @param {number} x
 * @param {number} y
 */
function KDDrawCollectionRestrainMain(id, x, y) {
	let restraints = KDGetNPCRestraints(id);
	KDDrawNPCRestrain(id, restraints, x, y);


}

/**
 *
 * @param {number} id
 * @param {string} status
 * @returns {boolean}
 */
function KDNPCUnavailable(id, status) {
	return KDGameData.NPCRestraints[id + ""]?.Device != undefined
		|| (KDIsNPCPersistent(id) && KDGetPersistentNPC(id).captured)
		|| (status && KDIsInCapturedPartyID(id))
		|| (KDGetGlobalEntity(id) && KDEntityHasFlag(KDGetGlobalEntity(id), "imprisoned"));

}

/**
 * @type {Map<number, Character>}
 */
let KDNPCChar = new Map();
/**
 * @type {Map<Character, number>}
 */
let KDNPCChar_ID = new Map();
let KDNPCStyle = new Map();
let KDCollectionSelected = 0;
let KDCollectionIndex = 0;
let KDCollectionGuestRows = 2;
let KDCollectionRows = 6;
let KDCollectionColumns = 10;
let KDCollectionSpacing = 80;

function KDDrawCollectionInventory(x, y) {
	if (!KDGameData.CollectionSorted) KDSortCollection();

	let XX = x;
	let YY = y + KDCollectionSpacing * (KDCollectionGuestRows + 1);
	let column = 0;
	let row = 0;

	let II = 0;
	let selectedIndex = 0;


	if (KDCollectionIndex + KDCollectionRows * KDCollectionColumns < KDGameData.CollectionSorted.length) {
		DrawButtonKDEx("collDOWN", (b) => {
			KDCollectionIndex = Math.max(
				0,
				Math.min(
					KDCollectionIndex + KDCollectionColumns,
					Math.floor(KDGameData.CollectionSorted.length / KDCollectionColumns) * KDCollectionColumns));
			return true;
		},true,
		x + KDCollectionColumns * KDCollectionSpacing/2 - 1.5*KDCollectionSpacing,
		y + (KDCollectionRows + 1 + KDCollectionGuestRows) * KDCollectionSpacing + 42,
		KDCollectionSpacing * 3, 36, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png",
		"", false, false, KDButtonColor, undefined, undefined, {centered: true}
		);
	}
	if (KDCollectionIndex > 0) {
		DrawButtonKDEx("collUP", (b) => {
			KDCollectionIndex = Math.max(
				0,
				Math.min(
					KDCollectionIndex - KDCollectionColumns,
					Math.floor(KDGameData.CollectionSorted.length / KDCollectionColumns) * KDCollectionColumns));
			return true;
		},true,
		x + KDCollectionColumns * KDCollectionSpacing/2 - 1.5*KDCollectionSpacing,
		y + (KDCollectionRows + 1 + KDCollectionGuestRows) * KDCollectionSpacing,
		KDCollectionSpacing * 3, 36, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png",
		"", false, false, KDButtonColor, undefined, undefined, {centered: true}
		);
	}
	if (!KDGameData.NPCRestraints) KDGameData.NPCRestraints = {};

	let ww = 800;
	let xpad = 24;
	for (let i = 0; i < KDCollectionTabStatusOptions.length; i++) {
		let option = KDCollectionTabStatusOptions[i];
		DrawButtonKDEx("collectionTab" + option, (b) => {
			KDCollectionTabStatus = option;
			return true;
		},true,
		x + xpad/2 + KDCollectionColumns * KDCollectionSpacing/2 - 400 + i * ww/KDCollectionTabStatusOptions.length,
		y - KDCollectionSpacing + 12 + (1+ KDCollectionGuestRows)*KDCollectionSpacing,
		ww/KDCollectionTabStatusOptions.length - xpad, 50, TextGet("KDCollectionTabStatusOption_" + option), "#ffffff", "",
		"", false, KDCollectionTabStatus != option, KDButtonColor, undefined, undefined, {centered: true}
		);
	}


	// Collection
	let guests = [];
	// Iterate thru the collection, parting out the notable ones to the top
	for (let value of KDGameData.CollectionSorted) {
		if (value.status == "Servant") {
			guests.push(value);
			continue;
		}
		if (value.status != KDCollectionTabStatus) continue;

		if (KDCollectionSelected == value.id) selectedIndex = II + 1;
		if (II++ < KDCollectionIndex || row >= KDCollectionRows) continue;


		let sp = (value.sprite || value.type);
		let dir = "Enemies/";
		let enemyType = value.Enemy || KinkyDungeonGetEnemyByName(value.type);

		if (!value.status) {
			// Prisoner
			dir = value.customSprite ? "Enemies/CustomSpriteBound/" : "EnemiesBound/";
			if (!value.customSprite) sp = enemyType.bound;
		} else {
			dir = value.customSprite ? "Enemies/CustomSprite/" : "Enemies/";
		}


		if (DrawButtonKDEx(value.name + "_coll," + value.id, (data) => {
			KDCollectionSelected = value.id;
			return true;
		}, true,
		XX,
		YY,
		79, 79, "", "#ffffff", KinkyDungeonRootDirectory + dir + sp + ".png",
		"", false, KDCollectionSelected != value.id, KDButtonColor, undefined, undefined, {centered: true}
		)) {
			DrawTextFitKD(value.name, MouseX, MouseY - 50, 800, "#ffffff", (value.color && value.color != "#ffffff") ? value.color : KDTextGray05, 24);
		}

		if (KDNPCUnavailable(value.id, value.status)) {
			KDDraw(kdcanvas, kdpixisprites, value.name + "_jail," + value.id,
				KinkyDungeonRootDirectory + "UI/Jail.png",
				XX + 36,
				YY + 36,
				36, 36, undefined, {
					zIndex: 110
				});
		} else if (value.status && KDIsInPartyID(value.id)) {
			KDDraw(kdcanvas, kdpixisprites, value.name + "_party," + value.id,
				KinkyDungeonRootDirectory + "UI/Star.png",
				XX + 48,
				YY + 48,
				28, 28, undefined, {
					zIndex: 110
				});
		}
		/*KDDraw(kdcanvas, kdpixisprites, value.name + "_coll," + value.id, KinkyDungeonRootDirectory + dir + sp + ".png",
			XX,
			YY,
			72, 72, undefined);*/

		column++;
		if (column >= KDCollectionColumns) {
			column = 0;
			row++;
			XX = x;
			YY += KDCollectionSpacing;
		} else XX += KDCollectionSpacing;
	}
	// Iterate thru guests array
	YY = y;
	XX = x;
	column = 0;
	row = 0;
	for (let i = 0; i < KDCollectionColumns * KDCollectionGuestRows; i++) {
		if (i < guests.length) {
			// We have a member
			let value = guests[i];
			let sp = (value.sprite || value.type);
			let dir = "Enemies/";
			let enemyType = value.Enemy || KinkyDungeonGetEnemyByName(value.type);

			if (!value.status) {
				// Prisoner
				dir = value.customSprite ? "Enemies/CustomSpriteBound/" : "EnemiesBound/";
				if (!value.customSprite) sp = enemyType.bound;
			} else {
				dir = value.customSprite ? "Enemies/CustomSprite/" : "Enemies/";
			}


			if (DrawButtonKDEx(value.name + "_guest," + value.id, (data) => {
				KDCollectionSelected = value.id;
				return true;
			}, true,
			XX,
			YY,
			79, 79, "", "#ffffff", KinkyDungeonRootDirectory + dir + sp + ".png",
			"", false, KDCollectionSelected != value.id, KDButtonColor, undefined, undefined, {centered: true}
			)) {
				DrawTextFitKD(value.name, MouseX, MouseY - 50, 800, "#ffffff", (value.color && value.color != "#ffffff") ? value.color : KDTextGray05, 24);
			}


			if (KDNPCUnavailable(value.id, value.status)) {
				KDDraw(kdcanvas, kdpixisprites, value.name + "_jail," + value.id,
					KinkyDungeonRootDirectory + "UI/Jail.png",
					XX + 42,
					YY + 42,
					36, 36, undefined, {
						zIndex: 110
					});
			} else if (value.status && KDIsInPartyID(value.id)) {
				KDDraw(kdcanvas, kdpixisprites, value.name + "_party," + value.id,
					KinkyDungeonRootDirectory + "UI/Star.png",
					XX + 48,
					YY + 48,
					28, 28, undefined, {
						zIndex: 110
					});
			}
		} else {
			// Render empty square
			FillRectKD(kdcanvas, kdpixisprites, "guestslot_" + i, {
				Left: XX,
				Top: YY,
				Width: 79,
				Height: 79,
				Color: "#000000",
				LineWidth: 1,
				zIndex: -20,
				alpha: 0.5
			});
		}

		column++;
		if (column >= KDCollectionColumns) {
			column = 0;
			row++;
			XX = x;
			YY += KDCollectionSpacing;
		} else XX += KDCollectionSpacing;
	}

	if (KDCollectionSelected && KDGameData.Collection[KDCollectionSelected]) {
		KDDrawSelectedCollectionMember(KDGameData.Collection[KDCollectionSelected], x - 460, 150, selectedIndex, KDCollectionTab);
	} else DrawTextFitKD(TextGet("KDCollectionSelect"), x - 240, 500, 500, "#ffffff", KDTextGray0, 24);

}

function KDSortCollection() {
	KDValidateAllFacilities();
	if (!KDGameData.Collection) {
		KDGameData.Collection = {};
	}
	KDGameData.CollectionGuests = 0;
	KDGameData.CollectionSorted = Object.values(KDGameData.Collection).sort(
		(a, b) => {
			let apri = 0;
			let bpri = 0;
			if (a.status) apri = 100;
			if (b.status) bpri = 100;
			return bpri-apri;
		}
	);
	for (let a of KDGameData.CollectionSorted) {
		if (a.status) KDGameData.CollectionGuests++;
	}

}

/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetEnemyName(enemy) {
	let faction = KDGetFaction(enemy) || KDGetFactionOriginal(enemy);
	let nameList = KDFactionProperties[faction]?.nameList ? KDFactionProperties[faction].nameList[Math.floor(Math.random() * KDFactionProperties[faction].nameList.length)] : faction;
	if (enemy.Enemy?.nameList) nameList = enemy.Enemy?.nameList;
	if (KDNameList[nameList]) return KDNameList[nameList][Math.floor(KDNameList[nameList].length * KDRandom())];
	else return KDNameList.default[Math.floor(KDNameList.default.length * KDRandom())];
}


let KDCollectionTabDraw = {
	Imprison: (value, buttonSpacing, III, x, y) => {
		let entity = KinkyDungeonFindID(value.id) || KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
		if (DrawButtonKDEx("ImprisonNPC", (b) => {

			if (entity) {
				return false;
			}

			let tile = KinkyDungeonTilesGet(KDGameData.InteractTargetX + ',' + KDGameData.InteractTargetY);
			let furn = KDFurniture[tile.Furniture];
			let rest = KinkyDungeonGetRestraint(
				{tags: [furn.restraintTag]}, MiniGameKinkyDungeonLevel,
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				true,
				"",
				true,
				false,
				false, undefined, true);
			if (rest) {
				let en = DialogueCreateEnemy(KDGameData.InteractTargetX, KDGameData.InteractTargetY,
					(value.Enemy || KinkyDungeonGetEnemyByName(value.type)).name, value.id);
				KDImprisonEnemy(en, true, "PrisonerJail", {
					name: rest.name,
					lock: "White",
					id: KinkyDungeonGetItemID(),
					faction: KDDefaultNPCBindPalette,
				});
				en.ceasefire = 9999;
				KinkyDungeonCheckClothesLoss = true;
				//KinkyDungeonDrawState = "Game";
			}

			if (KDToggles.Sound)
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockHeavy" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/Imprison.png",
		undefined, undefined, entity != undefined, entity != undefined ? "#ff5555" : KDButtonColor)) {
			DrawTextFitKD(TextGet("KDImprison"), x + 220, y + 750, 500, "#ffffff",
				KDTextGray0);
		}
		return III;
	},
	Restrain: (value, buttonSpacing, III, x, y) => {
		if (DrawButtonKDEx("RestrainFree", (b) => {
			KDSendInput("freeNPCRestraint", {
				npc: value.id,
			});
			if (KDToggles.Sound)
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Struggle" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/RestrainFree.png",
		undefined, undefined, false)) {
			DrawTextFitKD(TextGet("KDFreePrisoner"), x + 220, y + 750, 500, "#ffffff",
				KDTextGray0);
		}
		if (DrawButtonKDEx("returnToCollectionRestrain", (b) => {
			KDCurrentRestrainingTarget = 0;
			if (KDToggles.Sound)
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockLight" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/RestrainBack.png",
		undefined, undefined, false)) {
			DrawTextFitKD(TextGet("KDRestrainNPCBack"), x + 220, y + 750, 500, "#ffffff",
				KDTextGray0);
		}
		return III;
	},
	Default: (value, buttonSpacing, III, x, y) => {
		if (KDPromotableStatus.includes(value.status) && DrawButtonKDEx("promoteNPC", (b) => {
			if (!(KDGameData.CollectionGuests >= KDCollectionGuestRows*KDCollectionColumns)) {
				value.status = "Servant";
				KDSortCollection();
				if (KDToggles.Sound)
					AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
			}
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Promote.png",
		undefined, undefined, false, KDGameData.CollectionGuests >= KDCollectionGuestRows*KDCollectionColumns ? "#ff5555" : "")) {
			DrawTextFitKD(TextGet("KDPromoteNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		} else if (value.status == "Servant" && DrawButtonKDEx("demoteNPC", (b) => {
			value.status = value.oldstatus || "";
			KDSortCollection();
			if (KDToggles.Sound)
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Damage" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Demote.png",
		undefined, undefined, false)) {
			DrawTextFitKD(TextGet("KDDemoteNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		}


		if (!value.status && !KDNPCUnavailable(value.id, value.status))
			if (DrawButtonKDEx("CollectionRestrain", (b) => {
				KDCurrentRestrainingTarget = value.id;
				if (KDToggles.Sound)
					AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Chain" + ".ogg");
				return true;
			}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
			"", "#ffffff", KinkyDungeonRootDirectory + "UI/Restrain.png",
			undefined, undefined, false)) {
				DrawTextFitKD(TextGet("KDRestrainNPC"), x + 220, y + 750, 500, "#ffffff",
					KDTextGray0);
			}
		return III;
	}
};