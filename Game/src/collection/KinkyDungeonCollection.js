"use strict";

let KDCurrentFacilityTarget = "";
let KDCurrentFacilityCollectionType = "";
let KDCurrentRestrainingTarget = 0;

let KDFacilityCollectionDataTypes = [
	"Prisoners",
	"Servants",
];

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
			name: KDGetPersistentNPC(enemy).Name,
			sprite: (enemy.CustomSprite) || enemy.Enemy.name,
			// @ts-ignore
			customSprite: (enemy.CustomSprite),
			color: enemy.CustomNameColor || "#ffffff",
			Faction: KDGetFaction(enemy) || KDGetFactionOriginal(enemy),
			Opinion: enemy.opinion || -100,
			class: servantclass || "prisoner",
			Training: -(10 + 10 * KDRandom()) * KDEnemyRank(enemy) - 25,
			status: status || "",
			type: enemy.Enemy.name,
			Enemy: enemy.modified ? enemy.Enemy : undefined,
			Willpower: 100,
			Facility: undefined,
		};
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
		DrawTextFitKD(TextGet("KDPrisonerNum").replace("NUMR", "" + index).replace("TTL", "" + Object.values(KDGameData.Collection).length), x + 220, y + 15, 500, "#ffffff", KDTextGray05, 18);

	let II = 0;
	DrawTextFitKD(TextGet("Name" + enemyType.name), x + 220, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18);

	if (value.Faction && !KDFactionNoCollection.includes(value.Faction) && (KinkyDungeonTooltipFactions.includes(value.Faction) || !KinkyDungeonHiddenFactions.includes(value.Faction)))
		DrawTextFitKD(TextGet("KDFormerFaction") + TextGet("KinkyDungeonFaction" + value.Faction), x + 220, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18);

	if (!KDNPCChar.get(value.id)) {
		KDSpeakerNPC = suppressCanvasUpdate(() => CharacterLoadNPC("coll" + value.id));
		KDNPCChar.set(value.id, KDSpeakerNPC);
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
			//KDSpeakerNPC = null;
			KinkyDungeonState = "Wardrobe";
			ForceRefreshModels(KDSpeakerNPC);
			KDOriginalValue = "";
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

		if (!value.status && DrawButtonKDEx("promoteNPC", (b) => {
			if (!(KDGameData.CollectionGuests >= KDCollectionGuestRows*KDCollectionColumns)) {
				value.status = "Servant";
				KDSortCollection();
			}
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Promote.png",
		undefined, undefined, false, KDGameData.CollectionGuests >= KDCollectionGuestRows*KDCollectionColumns ? "#ff5555" : "")) {
			DrawTextFitKD(TextGet("KDPromoteNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		} else if (value.status == "Servant" && DrawButtonKDEx("demoteNPC", (b) => {
			value.status = "";
			KDSortCollection();
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Demote.png",
		undefined, undefined, false)) {
			DrawTextFitKD(TextGet("KDDemoteNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		}
		if (tab == "Restrain") {
			if (DrawButtonKDEx("returnToCollectionRestrain", (b) => {
				KDCurrentRestrainingTarget = 0;
				return true;
			}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
			"", "#ffffff", KinkyDungeonRootDirectory + "UI/RestrainBack.png",
			undefined, undefined, false)) {
				DrawTextFitKD(TextGet("KDRestrainNPCBack"), x + 220, y + 750, 500, "#ffffff",
					KDTextGray0);
			}
		} else {
			if (DrawButtonKDEx("CollectionRestrain", (b) => {
				KDCurrentRestrainingTarget = value.id;
				return true;
			}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
			"", "#ffffff", KinkyDungeonRootDirectory + "UI/Restrain.png",
			undefined, undefined, false)) {
				DrawTextFitKD(TextGet("KDRestrainNPC"), x + 220, y + 750, 500, "#ffffff",
					KDTextGray0);
			}
		}

		let assigned = !(!value.Facility);

		if (KDCurrentFacilityTarget) {
			let dd = KDGameData.FacilitiesData[KDCurrentFacilityCollectionType + "_" + KDCurrentFacilityTarget];
			let fac = KDFacilityTypes[KDCurrentFacilityTarget];
			if (dd && fac && fac["max" + KDCurrentFacilityCollectionType] && dd.length < fac["max" + KDCurrentFacilityCollectionType]()) {
				KDDraw(kdcanvas, kdpixisprites, "facilityAssignIcon",
					KinkyDungeonRootDirectory + `UI/Facility_${assigned ?"X" : KDCurrentFacilityCollectionType}.png`,
					x + 10 + buttonSpacing*III, y + 730 - 10 - 80, 80, 80, undefined, {
						zIndex: 160,
					}
				);
				if (DrawButtonKDEx("facilityAssign", (b) => {
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
					return true;
				}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff",
				KinkyDungeonRootDirectory + `UI/Facility/${value.Facility || KDCurrentFacilityTarget}.png`)) {
					DrawTextFitKD(TextGet(`KDCollection${assigned ? "Remove" : "Assign"}_` + KDCurrentFacilityTarget + "_" + KDCurrentFacilityCollectionType), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
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

let KDNPCChar = new Map();
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
		y + (KDCollectionRows + 1 + KDCollectionGuestRows) * KDCollectionSpacing,
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
		y - KDCollectionSpacing + 36 + (1+ KDCollectionGuestRows)*KDCollectionSpacing,
		KDCollectionSpacing * 3, 36, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png",
		"", false, false, KDButtonColor, undefined, undefined, {centered: true}
		);
	}

	// Collection
	let guests = [];
	// Iterate thru the collection, parting out the notable ones to the top
	for (let value of KDGameData.CollectionSorted) {
		if (value.status) {
			guests.push(value);
			continue;
		}

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
		KDDrawSelectedCollectionMember(KDGameData.Collection[KDCollectionSelected], x - 460, 150, selectedIndex);
	} else DrawTextFitKD(TextGet("KDCollectionSelect"), x - 240, 500, 500, "#ffffff", KDTextGray0, 24);

}

function KDSortCollection() {
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
