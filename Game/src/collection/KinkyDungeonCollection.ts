"use strict";

let KDCollectionTab = "";

let KDCurrentFacilityTarget = "";
let KDCurrentFacilityCollectionType: string[] = [];
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

let KDCollectionTabButtons = [
	"AutoBind",
	"Release",
];

let KDCollFilter = "";

type CollectionFilterItem = {
	Current:    number;
	Options:    string[];
	FilterCode: Record<string, (value: KDCollectionEntry) => boolean>;
}

let KDCollectionFilters: Record<string, CollectionFilterItem> = {
	Opinion: {
		Current: 0,
		Options: ["", "Positive", "Negative"],
		FilterCode: {
			"": (_value) => {return true;},
			Negative: (value) => {return !value.Opinion || value.Opinion < 0;},
			Positive: (value) => {return value.Opinion > 0;},
		},
	},
	Escape: {
		Current: 0,
		Options: ["", "EscapeRisk", "Escaped", "Imprisoned"],
		FilterCode: {
			"": (_value) => {return true;},
			Safe: (value) => {return !KDNPCUnavailable(value.id, value.status);},
			EscapeRisk: (value) => {return !value.escaped && value.escapegrace;},
			Escaped: (value) => {return value.escaped;},
			Imprisoned: (value) => {return KDGetGlobalEntity(value.id) && KDIsImprisoned(KDGetGlobalEntity(value.id));},
		},
	},
	Binding: {
		Current: 0,
		Options: ["", "Bound", "Free"],
		FilterCode: {
			"": (_value) => {return true;},
			Bound: (value) => {return KDGetNPCRestraints(value.id) && Object.values(KDGetNPCRestraints(value.id)).length > 0;},
			Free: (value) => {return !KDGetNPCRestraints(value.id) || Object.values(KDGetNPCRestraints(value.id)).length == 0;},
		},
	},
	Availability: {
		Current: 0,
		Options: ["", "Available", "Unavailable"],
		FilterCode: {
			"": (_value) => {return true;},
			Available: (value) => {return !KDNPCUnavailable(value.id, value.status);},
			Unavailable: (value) => {return KDNPCUnavailable(value.id, value.status);},
		},
	},
	Rank: {
		Current: 0,
		Options: ["", "Rank0", "Rank1", "Rank2", "Rank3", "Rank4", "Rank5"],
		FilterCode: {
			"": (_value) => {return true;},
			Rank0: (value) => {return 0 == KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));},
			Rank1: (value) => {return 1 == KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));},
			Rank2: (value) => {return 2 == KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));},
			Rank3: (value) => {return 3 == KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));},
			Rank4: (value) => {return 4 == KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));},
			Rank5: (value) => {return 5 == KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));},
		},
	},
	/*Favorites: {
		Current: 0,
		Options: ["", "Favorite", "NonFavorite"],
		FilterCode: {
			"": (value) => {return true;},
			Favorite: (value) => {return !KDNPCUnavailable(value.id, value.status);},
			NonFavorite: (value) => {return KDNPCUnavailable(value.id, value.status);},
		},
	},*/
};

function KDDrawCollectionFilters(x: number, y: number) {
	let spacing = 80;
	let II = 0;
	for (let filter of Object.entries(KDCollectionFilters)) {
		if (DrawButtonKDEx("KDCollFilter" + filter[0], (_b) => {
			filter[1].Current += 1;
			if (filter[1].Current >= filter[1].Options.length) {
				filter[1].Current = 0;
			}
			return true;
		}, true, x - spacing * II++, y, 72, 72, "", "#ffffff",
		KinkyDungeonRootDirectory
			+ "UI/CollectionFilter/" + (filter[1].Options[filter[1].Current] || filter[1].Options[1]) + ".png", undefined, undefined,
		!filter[1].Current, KDButtonColor)) {
			DrawTextFitKD(TextGet("KDCollectionFilter" + filter[0])
				+ TextGet("KDCollectionFilter" + filter[1].Options[filter[1].Current]),
			x - spacing * II + spacing + 36, y - 20, 500, "#ffffff", KDTextGray0,);
		}
	}
}

function KDDrawCollectionTabOptions(x: number, y: number) {
	let spacing = 80;
	let II = 0;
	for (let tab of KDCollectionTabButtons) {
		if (DrawButtonKDEx("KDCollTabSet" + tab, (_b) => {
			if (KDCollectionTab) KDCollectionTab = "";
			else KDCollectionTab = tab;
			return true;
		}, true, x + spacing * II++, y, 72, 72, "", "#ffffff",
		KinkyDungeonRootDirectory
			+ "UI/CollectionTab/" + tab + ".png", undefined, undefined,
		KDCollectionTab != tab, KDButtonColor, undefined, undefined, {
			centered: true,
		})) {
			DrawTextFitKD(TextGet("KDCollectionTab_" + tab),
				x + spacing * II + spacing + 36, y - 20, 500, "#ffffff", KDTextGray0,);
		}
	}
}

function KinkyDungeonDrawCollection(xOffset: number = -125) {

	let x = 1225 + xOffset;
	if (!KDGameData.Collection) KDGameData.Collection = {};

	if (KDCurrentRestrainingTarget && KDGameData.Collection["" + KDCurrentRestrainingTarget]) {
		KDDrawCollectionRestrain(KDCurrentRestrainingTarget, x + xOffset, 150);
	} else {
		if (Object.entries(KDGameData.Collection).length == 0) {
			DrawTextFitKD(TextGet("KDCollectionEmpty"), x, 300, 1050, "#ffffff", KDTextGray0, 24);
		} else {
			if (KDCollectionTabScreen[KDCollectionTab]) {
				KDCollectionTabScreen[KDCollectionTab](x, xOffset);
			} else {
				KDDrawCollectionInventory(x + xOffset, 150);
				KDDrawCollectionFilters(1750, 920);
				KDDrawCollectionTabOptions(1000, 920);
			}
		}
	}

	KinkyDungeonDrawMessages(true, 550, true, 600);
	KDDrawInventoryTabs(xOffset);
}
function KinkyDungeonDrawBondage(xOffset = -125) {
	let x = 1225 + xOffset;
	if (!KDGameData.Collection) KDGameData.Collection = {};
	let en = KDCurrentRestrainingTarget ? KDGetGlobalEntity(KDCurrentRestrainingTarget) : null;
	if (en && KDCanBind(en)) {
		KDDrawCollectionRestrain(KDCurrentRestrainingTarget, x + xOffset, 150);
	} else {
		KinkyDungeonDrawState = "Game";
	}

	KinkyDungeonDrawMessages(true, 550, true, 600);
	//KDDrawInventoryTabs(xOffset);
}

/**
 * @param id
 */
function KDCollectionImage(id: number): string {
	let value = KDGameData.Collection["" + id];
	if (value) {
		let sp = (value.sprite || value.type);
		let dir = "Enemies/";
		let enemyType = value.Enemy || KinkyDungeonGetEnemyByName(value.type);
		if (!value.status && !value.escaped) {
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
 * @param id
 * @param amount
 */
function KDAddOpinionPersistent(id: number, amount: number): void {
	let opinion = undefined;
	if (KDIsNPCPersistent(id)) {
		KDUpdatePersistentNPC(id);
		opinion = KDAddOpinion(KDGetPersistentNPC(id).entity, amount);
		KDRefreshPersistentNPC(id);
	} else if (KinkyDungeonFindID(id)) {
		opinion = KDAddOpinion(KinkyDungeonFindID(id), amount);
	} else if (KDGameData.Collection[id + ""]) {
		if (opinion != undefined) {
			KDGameData.Collection[id + ""].Opinion = opinion;
		} else {
			KDAddOpinionCollection(KDGameData.Collection[id + ""], amount);
		}
	}
}



/**
 * Gets the opinion, unmodified by various factors
 * @param id
 * @param [allowFaction] Optionally apply faction rep modifier
 * @param [allowSub] Optionally apply sub modifier
 * @param [allowPerk] Optionally apply perk modifiers
 * @param [allowOnlyPosNegFaction] positive: allows only positive faction rep, negative: allows only negative faction rep
 */
function KDGetModifiedOpinionID(id: number, allowFaction: boolean = true, allowSub: boolean = true, allowPerk: boolean = true, allowOnlyPosNegFaction: number = 0): number {
	if (KDIsNPCPersistent(id)) {
		let enemy = KDGetPersistentNPC(id).entity;
		let op = enemy.opinion || KDGameData.Collection[enemy.id]?.Opinion || 0;

		if (allowFaction) {
			let faction = KDGetFaction(enemy);
			let rel = KDFactionRelation("Player", faction);
			op += (rel > 0 ? 10 : 20) * (!allowOnlyPosNegFaction ? rel :
			(allowOnlyPosNegFaction > 0 ? Math.max(rel, 0)
				: Math.min(rel, 0)
			)
			);
		}
		if (allowSub && KinkyDungeonStatsChoice.get("Dominant") && enemy.personality && KDLoosePersonalities.includes(enemy.personality)) op += 12;
		if (allowPerk && KinkyDungeonStatsChoice.get("Oppression")) op -= 15;

		return op;
	} else if (KinkyDungeonFindID(id)) {
		return KDGetModifiedOpinion(KinkyDungeonFindID(id), allowFaction, allowSub, allowPerk);
	} else if (KDGameData.Collection[id + ""]) {
		let faction = KDIsServant(KDGameData.Collection[id + ""]) ? "Player" : KDGameData.Collection[id + ""].Faction;
		let op = KDGameData.Collection[id + ""].Opinion || 0;
		if (allowFaction) {
			let rel = KDFactionRelation("Player", faction);
			op += (rel > 0 ? 10 : 20) * (!allowOnlyPosNegFaction ? rel :
			(allowOnlyPosNegFaction > 0 ? Math.max(rel, 0)
				: Math.min(rel, 0)
			)
			);
		}
		if (!KDGameData.Collection[id + ""].personality) {
			KDGameData.Collection[id + ""].personality =
				KDGetPersonalityType(KinkyDungeonGetEnemyByName(KDGameData.Collection[id + ""].type));
		}
		if (allowSub && KinkyDungeonStatsChoice.get("Dominant")
			&& KDGameData.Collection[id + ""].personality
			&& KDLoosePersonalities.includes(KDGameData.Collection[id + ""].personality)) op += 12;
		if (allowPerk && KinkyDungeonStatsChoice.get("Oppression")) op -= 15;

		return op;
	}
}

/**
 *
 * @param enemy
 */
function KDCapturable(enemy: entity): boolean {
	return enemy?.Enemy.bound && !enemy.Enemy.allied && !(KDNoCaptureTypes.some((tag) => {return enemy.Enemy.tags[tag];}));
}

/**
 * @param enemy
 */
function KDCapturableType(enemy: enemy): boolean {
	return !(KDNoCaptureTypes.some((tag) => {return enemy.tags[tag];}));
}

/**
 * @param enemy
 * @param [type]
 * @param [status]
 * @param [servantclass]
 * @param [type]
 */
function KDAddCollection(enemy: entity, type?: string, status?: string, servantclass?: string) {
	if (!KDGameData.Collection) KDGameData.Collection = {};
	if (!KDGameData.CollectionSorted) KDSortCollection();

	if (!KDCapturable(enemy)) return;

	if (!KDGameData.Collection["" + enemy.id]) {
		// Add her
		let entry: KDCollectionEntry = {
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
			escaped: undefined,
			flags: undefined,
			personality: enemy.personality != undefined ? enemy.personality : KDGetPersonalityType(enemy.Enemy)
		};
		enemy.CustomName = entry.name;
		enemy.CustomNameColor = entry.color;

		// Custom outfit
		if (!status && enemy.outfitBound) entry.outfit = enemy.outfitBound;
		else if (enemy.outfit) entry.outfit = enemy.outfit;

		// Custom style
		if (enemy.style) {
			let style = KDModelStyles[enemy.style];
			if (style) {
				if (!entry.bodystyle && style.Bodystyle) {
					entry.bodystyle = style.Bodystyle[Math.floor(Math.random() * style.Bodystyle.length)];
				}
				if (!entry.hairstyle && style.Hairstyle) {
					entry.hairstyle = style.Hairstyle[Math.floor(Math.random() * style.Hairstyle.length)];
				}
				if (!entry.facestyle && style.Facestyle) {
					entry.facestyle = style.Facestyle[Math.floor(Math.random() * style.Facestyle.length)];
				}
				if (!entry.cosplaystyle && style.Cosplay) {
					entry.cosplaystyle = style.Cosplay[Math.floor(Math.random() * style.Cosplay.length)];
				}
			}
		}

		KDUpdatePersistentNPC(enemy.id);
		KDGameData.Collection["" + enemy.id] = entry;
		KDGameData.CollectionSorted.unshift(entry);
		KDSortCollection();
	} else {
		// Update her
		let entry = KDGameData.Collection["" + enemy.id];
		entry.escaped = undefined;
		entry.escapegrace = undefined;
		if (status != undefined) {
			entry.status = status;
		}
		if (servantclass != undefined) {
			entry.class = servantclass;
		}
		if (type != undefined) {
			entry.type = type;
		}
		KDUpdatePersistentNPC(enemy.id);
	}
}



function KDUpdateCollectionFlags(delta: number) {
	for (let npc of Object.values(KDGameData.Collection)) {
		if (npc.flags) {
			let newF: Record<string, number> = {};
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
 * @param entity
 */
function KDGetCharacter(entity: entity): Character {
	if (entity?.id == KDPlayer().id) {
		return KinkyDungeonPlayer;
	}
	return KDNPCChar.get(entity.id);
}
/**
 * @param C
 */
function KDGetCharacterID(C: Character): number {
	if (C == KinkyDungeonPlayer) {
		return KDPlayer().id;
	}
	return KDNPCChar_ID.get(C);
}
/**
 * @param C
 */
function KDGetCharacterEntity(C: Character): entity {
	if (C == KinkyDungeonPlayer) {
		return KDPlayer();
	}
	if (KDNPCChar_ID.get(C))
		return KinkyDungeonFindID( KDNPCChar_ID.get(C));
	return undefined;
}

/**
 * @param value
 * @param x
 * @param y
 * @param index
 * @param [tab]
 */
function KDDrawSelectedCollectionMember(value: KDCollectionEntry, x: number, y: number, index: number, tab: string = "") {

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

	KDDraw(kdcanvas, kdpixisprites, value.name + "_rank," + value.id,
		KinkyDungeonRootDirectory + "UI/Rank/Rank" + KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type)) + ".png",
		x + 10,
		y + 10,
		72, 72, undefined, {
			zIndex: 110
		});


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
	DrawTextFitKD(TextGet("Name" + enemyType.name), x + 220, y + 500 - 25 + 20*II++, 500, "#ffffff", KDTextGray05, 24);

	if (value.Faction && !KDFactionNoCollection.includes(value.Faction) && (KinkyDungeonTooltipFactions.includes(value.Faction) || !KinkyDungeonHiddenFactions.has(value.Faction)))
		DrawTextFitKD(TextGet("KDFormerFaction") + TextGet("KinkyDungeonFaction" + value.Faction), x + 20, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18, "left");
	else II++;

	let opinion = Math.max(-3, Math.min(3, Math.round(KDGetModifiedOpinionID(value.id)/KDOpinionThreshold)));
	let str = TextGet("KDNPCOpinion") + TextGet("KDTooltipOpinion"+opinion) + ` (${Math.round(KDGetModifiedOpinionID(value.id))})`;
	DrawTextFitKD(str, x + 20, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18, "left");

	if (KDIsNPCPersistent(value.id)) {
		if (KDGetPersistentNPC(value.id)?.captured) {
			str = TextGet((KDGetPersistentNPC(value.id)?.captureFaction) ? "KDLastNPCLocationCaptured" : "KDLastNPCLocationCapturedNone")
				.replace("FCTN", TextGet("KinkyDungeonFaction" + KDGetPersistentNPC(value.id)?.captureFaction));
			DrawTextFitKD(str, x + 20, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18, "left");
		}
	}



	let npcLoc = KDGetNPCLocation(value.id);
	if (npcLoc) {
		let currLoc = KDGetCurrentLocation();
		let dungeon = npcLoc.room || KDGameData.JourneyMap[npcLoc.mapX + ',' + npcLoc.mapY]?.Checkpoint || 'grv';
		str = TextGet((KinkyDungeonFindID(value.id) && KDCompareLocation(currLoc, npcLoc)) ? "KDLastNPCLocationSame" : "KDLastNPCLocation")
			.replace("FLR", npcLoc.mapY + "")
			.replace("LOC", TextGet("DungeonName" + dungeon));
		DrawTextFitKD(str, x + 20, y + 500 + 20*II++, 500, "#ffffff", KDTextGray05, 18, "left");
	}


	if (KDDrawNPCBars(value, x + 0, y + 730, 440) > 0)
		if (KDGameData.Collection[value.id + ""] && value.escapegrace) {
			let icon = "escapegrace";
			KDDraw(kdcanvas, kdpixisprites, value.name + "_escp," + value.id,
				KinkyDungeonRootDirectory + "UI/" + icon + ".png",
				x - 72,
				y + 730,
				72, 72, undefined, {
					zIndex: 110
				});
		}

	if (!KDNPCChar.get(value.id)) {
		KDSpeakerNPC = suppressCanvasUpdate(() => CharacterLoadNPC(value.id, value.name, value.Palette));
		KDNPCChar.set(value.id, KDSpeakerNPC);
		KDNPCChar_ID.set(KDSpeakerNPC, value.id);
		KDNPCStyle.set(KDSpeakerNPC, value);
		if (!value.bodystyle && !value.facestyle && !value.hairstyle) {
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
			KinkyDungeonSetDress(
				value.outfit || enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit,
				value.outfit || enemyType?.outfit || KinkyDungeonGetEnemyByName(value.type)?.outfit,
				KDSpeakerNPC, true);
		}
		KDRefreshCharacter.set(KDSpeakerNPC, true);
	} else {
		KDSpeakerNPC = KDNPCChar.get(value.id);
		KDNPCChar_ID.set(KDSpeakerNPC, value.id);
	}

	if (KDSpeakerNPC) {
		if (KinkyDungeonCheckClothesLoss || KDRefreshCharacter.get(KDSpeakerNPC)) {
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
		let buttonSpacing = 85;
		if (!KDCollectionTab && KDGameData.Collection[value.id + ""] && DrawButtonKDEx("dressNPC", (_b) => {
			if (KDSoundEnabled())
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LightJingle" + ".ogg");
			//KDSpeakerNPC = null;
			KinkyDungeonState = "Wardrobe";
			KDCanRevertFlag = value.customOutfit != undefined;
			ForceRefreshModels(KDSpeakerNPC);
			KDOriginalValue = "";
			CharacterReleaseTotal(KDSpeakerNPC);
			KDWardrobeCallback = () => {
				let value2 = value;
				//if (KDOriginalValue) {
				value2.customOutfit = LZString.compressToBase64(AppearanceItemStringify(KDSpeakerNPC.Appearance));
				value2.Palette = KDSpeakerNPC.Palette;

				KDRefreshCharacter.set(KDSpeakerNPC, true);
				//}
			};
			if (value.customOutfit) {
				let outfit = value.customOutfit;
				KDWardrobeRevertCallback = () => {
					if (outfit)
						CharacterAppearanceRestore(KDSpeakerNPC, DecompressB64(outfit),false, true);
					CharacterRefresh(KDSpeakerNPC);
					KDInitProtectedGroups(KDSpeakerNPC);
					KDRefreshCharacter.set(KDSpeakerNPC, true);
					KinkyDungeonDressPlayer(KDSpeakerNPC, true);
				};
				KDWardrobeResetCallback = () => {
					delete value.customOutfit;
				};
			} else {
				KDWardrobeRevertCallback = () => {
					delete value.customOutfit;
					KDRefreshCharacter.set(KDSpeakerNPC, true);
					KinkyDungeonDressPlayer(KDSpeakerNPC, true);
				};
				KDWardrobeResetCallback = null;
			}

			KDPlayerSetPose = false;
			KDInitCurrentPose(true,KDSpeakerNPC);
			KinkyDungeonInitializeDresses();
			KDUpdateModelList();
			KDRefreshOutfitInfo();
			let itt = localStorage.getItem("kinkydungeonappearance" + KDCurrentOutfit);
			let orig = itt ?
				JSON.parse(LZString.decompressFromBase64(itt)).appearance
				|| itt : "";
			let current = LZString.compressToBase64(AppearanceItemStringify(KinkyDungeonPlayer.Appearance));
			if (orig != current) KDOriginalValue = orig;
			ForceRefreshModelsAsync(KDSpeakerNPC);
			//KinkyDungeonDressPlayer(KDSpeakerNPC, true, true);
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Dress.png")) {
			DrawTextFitKD(TextGet("KDDressNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		}

		III = KDCollectionTabDraw[tab || "Default"](value, buttonSpacing, III, x, y);

		let assigned = !(!value.Facility);
		let valid = KDCurrentFacilityCollectionType.some((type) => {
			return KDFacilityCollectionDataTypeMap[type] == value.status;
		}) && KDCurrentFacilityCollectionType.some((type) => {
			return KDValidateServant(value, KDCurrentFacilityTarget, type);
		});


		let collType = valid ? KDCurrentFacilityCollectionType.find((type) => {
			return KDFacilityCollectionDataTypeMap[type] == value.status;
		}) : "";

		if (KDGameData.Collection[value.id + ""] && KDCurrentFacilityTarget) {
			let dd = KDGameData.FacilitiesData[collType + "_" + KDCurrentFacilityTarget];
			let fac = KDFacilityTypes[KDCurrentFacilityTarget];
			if (dd && fac
				&& fac["max" + collType]
				&& (assigned
					||  dd.length < fac["max" + collType]()
				)) {

				KDDraw(kdcanvas, kdpixisprites, "facilityAssignIcon",
					KinkyDungeonRootDirectory + `UI/Facility_${(assigned || !valid) ?"X" :
						collType
					}.png`,
					x + 10 + buttonSpacing*III, y + 730 - 10 - 80, 80, 80, undefined, {
						zIndex: 160,
					}
				);
				if (DrawButtonKDEx("facilityAssign", (_b) => {
					if (!valid) return false;
					if (!assigned) {
						let data = KDGameData.FacilitiesData[collType + "_" + KDCurrentFacilityTarget];
						if (data && (!KDFacilityCollectionCallback || KDFacilityCollectionCallback(value.id))) {
							data.push(value.id);
							value.Facility = KDCurrentFacilityTarget;
						}
					} else {
						let listRender = Object.entries(KDFacilityTypes).filter((entry) => {
							return entry[1].prereq();
						});
						for (let f of listRender) {
							for (let dt of KDFacilityCollectionDataTypes) {
								let data: number[] = KDGameData.FacilitiesData[dt + "_" + f[0]];
								if (data?.includes(value.id)) {
									delete value.Facility;
									data.splice(data.indexOf(value.id), 1);
									break;
								}
							}
						}
						// Failsafe
						delete value.Facility;
					}

					KDValidateAllFacilities();
					return true;
				}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff",
				KinkyDungeonRootDirectory + `UI/Facility/${value.Facility || KDCurrentFacilityTarget}.png`,
				undefined, undefined, !valid, (!valid) ? "#ff5555" : undefined)) {
					DrawTextFitKD(TextGet(`KDCollection${assigned ? "Remove" : "Assign"}`) + TextGet("KDFacility_" + (assigned ? value.Facility : KDCurrentFacilityTarget)),
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
 * @param id
 * @param x
 * @param y
 */
function KDDrawCollectionRestrain(id: number, x: number, y: number) {
	if (!KDGameData.CollectionSorted) KDSortCollection();

	KDDrawCollectionRestrainMain(id, x, y);
	if (KDGetGlobalEntity(id) || KDGameData.Collection[id + ""])
		KDDrawSelectedCollectionMember((KDGameData.Collection[id + ""] && !KDNPCUnavailable(id, KDGameData.Collection[id + ""].status)) ?
		KDGameData.Collection[id + ""] : KDGetVirtualCollectionEntry(id), x - 460, 150, 0, "Restrain");
}

/**
 * Gets the collection entry, or a virtual one if one doesnt exist
 * @param id
 */
function KDGetVirtualCollectionEntry(id: number): KDCollectionEntry {
	if (KDGameData.Collection["" + id]) return KDGameData.Collection["" + id];

	let enemy = KDGetGlobalEntity(id);
	let entry: KDCollectionEntry = {
		id: enemy.id,
		name: KDIsNPCPersistent(id) ?
			KDGetPersistentNPC(enemy.id).Name
			: enemy.CustomName || TextGet("Name" + enemy.Enemy.name),
		sprite: (enemy.CustomSprite) || enemy.Enemy.name,
		// @ts-ignore
		customSprite: (enemy.CustomSprite),
		color: enemy.CustomNameColor || "#ffffff",
		Faction: KDGetFaction(enemy) || KDGetFactionOriginal(enemy),
		class: "stranger",
		Training: -100,
		status: "stranger",
		oldstatus: "stranger",
		type: enemy.Enemy.name,
		Enemy: enemy.modified ? enemy.Enemy : undefined,
		Willpower: 100 * (enemy.hp / enemy.Enemy.maxhp),
		Facility: undefined,
		flags: undefined,
	};

	// Custom outfit
	if (enemy.outfit) entry.outfit = enemy.outfit;

	// Custom style
	if (enemy.style) {
		let style = KDModelStyles[enemy.style];
		if (style) {
			if (!entry.bodystyle && style.Bodystyle) {
				entry.bodystyle = style.Bodystyle[Math.floor(Math.random() * style.Bodystyle.length)];
			}
			if (!entry.hairstyle && style.Hairstyle) {
				entry.hairstyle = style.Hairstyle[Math.floor(Math.random() * style.Hairstyle.length)];
			}
			if (!entry.facestyle && style.Facestyle) {
				entry.facestyle = style.Facestyle[Math.floor(Math.random() * style.Facestyle.length)];
			}
			if (!entry.cosplaystyle && style.Cosplay) {
				entry.cosplaystyle = style.Cosplay[Math.floor(Math.random() * style.Cosplay.length)];
			}
		}
	}

	return entry;
}

/**
 * @param id
 * @param x
 * @param y
 */
function KDDrawCollectionRestrainMain(id: number, x: number, y: number) {
	let restraints = KDGetNPCRestraints(id);
	KDDrawNPCRestrain(id, restraints, x, y);
}

function KDIsImprisonedByEnemy(id: number) {
	return KDIsImprisoned(KDGetGlobalEntity(id))
	&& !KDIsInPlayerBase(id);
}

/**
 * @param id
 * @param status
 */
function KDNPCUnavailable(id: number, status: string): boolean {
	return KDGameData.Collection[id + ""]?.escaped || (KDIsNPCPersistent(id) &&
		(
			//KDGameData.NPCRestraints[id + ""]?.Device != undefined
			KDGetPersistentNPC(id).captured
			|| !(KDGetPersistentNPC(id).collect || (status && !KDIsInPartyID(id)))
		))
		|| (status && KDIsInCapturedPartyID(id))
		|| (KDGetGlobalEntity(id) &&
			(KDIsImprisonedByEnemy(id))
			|| (KinkyDungeonFindID(id)
			&& !KDIsImprisoned(KinkyDungeonFindID(id)) && KDHostile(KinkyDungeonFindID(id))));

}

let KDNPCChar: Map<number, Character> = new Map();
let KDNPCChar_ID: Map<Character, number> = new Map();
let KDNPCStyle = new Map();
let KDCollectionSelected = 0;
let KDCollectionIndex = 0;
let KDCollectionGuestRows = 2;
let KDCollectionRows = 6;
let KDCollectionColumns = 10;
let KDCollectionSpacing = 80;

let KDDrawnCollectionInventory: KDCollectionEntry[] = [];

function KDDrawCollectionInventory(x: number, y: number, drawCallback?: (value: KDCollectionEntry, X: number, Y: number) => void) {
	if (!KDGameData.CollectionSorted) KDSortCollection();

	let XX = x;
	let YY = y + KDCollectionSpacing * (KDCollectionGuestRows + 1);
	let column = 0;
	let row = 0;

	let II = 0;
	let selectedIndex = 0;


	if (KDCollectionIndex + KDCollectionRows * KDCollectionColumns < KDGameData.CollectionSorted.length) {
		DrawButtonKDEx("collDOWN", (_b) => {
			KDCollectionIndex = Math.max(
				0,
				Math.min(
					KDCollectionIndex + KDCollectionColumns,
					Math.floor(KDGameData.CollectionSorted.length / KDCollectionColumns) * KDCollectionColumns));
			return true;
		},true,
		1700, 870, 125, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png",
		"", false, false, KDButtonColor, undefined, undefined, {centered: true}
		);
	}
	if (KDCollectionIndex > 0) {
		DrawButtonKDEx("collUP", (_b) => {
			KDCollectionIndex = Math.max(
				0,
				Math.min(
					KDCollectionIndex - KDCollectionColumns,
					Math.floor(KDGameData.CollectionSorted.length / KDCollectionColumns) * KDCollectionColumns));
			return true;
		},true,
		1700, 100, 125, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png",
		"", false, false, KDButtonColor, undefined, undefined, {centered: true}
		);

	}

	KDDraw(kdcanvas, kdpixisprites, "collScrollBar",
		KinkyDungeonRootDirectory + "UI/Checked.png",
		1775, 125 + 590*(KDCollectionIndex/Math.max(1, KDGameData.CollectionSorted.length - KDCollectionIndex)), 60, 60
	);
	if (!KDGameData.NPCRestraints) KDGameData.NPCRestraints = {};

	let ww = 800;
	let xpad = 24;
	for (let i = 0; i < KDCollectionTabStatusOptions.length; i++) {
		let option = KDCollectionTabStatusOptions[i];
		DrawButtonKDEx("collectionTab" + option, (_b) => {
			KDCollectionTabStatus = option;
			return true;
		},true,
		x + xpad/2 + KDCollectionColumns * KDCollectionSpacing/2 - 400 + i * ww/KDCollectionTabStatusOptions.length,
		y - KDCollectionSpacing + 12 + (1+ KDCollectionGuestRows)*KDCollectionSpacing,
		ww/KDCollectionTabStatusOptions.length - xpad, 50, TextGet("KDCollectionTabStatusOption_" + option), "#ffffff", "",
		"", false, KDCollectionTabStatus != option, KDButtonColor, undefined, undefined, {centered: true}
		);
	}


	let TF = KDTextField("CollFilter",
		x + xpad/2 + KDCollectionColumns * KDCollectionSpacing/2
		- 200,
		y - KDCollectionSpacing + 20, 400, 45, "text", "", "45");
	if (TF.Created) {
		//KDCollFilter = "";
		ElementValue("CollFilter", KDCollFilter || "");
		TF.Element.oninput = (_event) => {
			KDCollFilter = ElementValue("CollFilter");
			KDCollectionIndex = 0;
		};
	}

	// Collection
	let guests = [];
	let filters = [];
	for (let f of Object.values(KDCollectionFilters)) {
		if (f.Current && f.Options[f.Current]) {
			filters.push(f.FilterCode[f.Options[f.Current]]);
		}
	}
	let rendered = [];
	let cf = KDCollFilter ? KDCollFilter.toLocaleUpperCase() : null;
	// Iterate thru the collection, parting out the notable ones to the top
	for (let value of KDGameData.CollectionSorted) {
		if (value.status) KDGetPersistentNPC(value.id); // All guests and servants are persistent
		if (cf && !((
			value.name.toLocaleUpperCase()
				.includes(cf)
		) || (
			value.type?.toLocaleUpperCase()
				.includes(cf)
		) || (
			TextGet("Name" + value.type).toLocaleUpperCase()
				.includes(cf)
		) || (
			value.Faction && TextGet("KinkyDungeonFaction" + value.Faction).toLocaleUpperCase()
				.includes(cf)
		))) {
			continue;
		}
		if (value.status == "Servant") {
			guests.push(value);
			continue;
		}
		if (value.status != KDCollectionTabStatus) continue;


		if (KDCollectionSelected == value.id) selectedIndex = II + 1;

		if (filters.length > 0 && filters.some((filter) => {return !filter(value);})) continue;

		if (II++ < KDCollectionIndex || row >= KDCollectionRows) continue;

		rendered.push(value);

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


		if (DrawButtonKDEx(value.name + "_coll," + value.id, (_data) => {
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

		if (drawCallback) drawCallback(value, XX, YY);

		if (KDNPCUnavailable(value.id, value.status) || value.escapegrace) {
			let icon = KDGetPersistentNPC(value.id)?.captured
				? "Inspect"
				: ((value.escaped ? "escaped"
				: (value.escapegrace ? "escapegrace" : "jail")));
			KDDraw(kdcanvas, kdpixisprites, value.name + "_jail," + value.id,
				KinkyDungeonRootDirectory + "UI/" + icon + ".png",
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
		if (value.Facility) {
			KDDraw(kdcanvas, kdpixisprites, value.name + "_fac," + value.id,
				KinkyDungeonRootDirectory + "UI/Facility/" + value.Facility + ".png",
				XX,
				YY + 36,
				36, 36, undefined, {
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


			if (DrawButtonKDEx(value.name + "_guest," + value.id, (_data) => {
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

			if (drawCallback) drawCallback(value, XX, YY);


			if (KDNPCUnavailable(value.id, value.status) || value.escapegrace) {
				let icon = KDGetPersistentNPC(value.id)?.captured
					? "Inspect"
					: ((value.escaped ? "escaped"
					: (value.escapegrace ? "escapegrace" : "jail")));
				KDDraw(kdcanvas, kdpixisprites, value.name + "_jail," + value.id,
					KinkyDungeonRootDirectory + "UI/" + icon + ".png",
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


	KDDrawnCollectionInventory = rendered;
}

/**
 * @param value
 */
function KDValidateEscapeGrace(value: KDCollectionEntry) {
	if (KDWantsToEscape(value)) {
		let entity = KDGetGlobalEntity(value.id);
		let bondageAmount = Math.min(entity?.boundLevel || 0,
			KDGetExpectedBondageAmountTotal(value.id, entity));
		let enemy = KinkyDungeonGetEnemyByName(value.type);
		if (bondageAmount < enemy.maxhp * KDNPCStruggleThreshMultType(enemy)) {
			value.escapegrace = true;
		} else value.escapegrace = undefined;
	} else value.escapegrace = undefined;
}

function KDSortCollection() {
	KDValidateAllFacilities();
	if (!KDGameData.Collection) {
		KDGameData.Collection = {};
	}

	for (let value of Object.values(KDGameData.Collection)) {
		KDValidateEscapeGrace(value);
	}




	KDGameData.CollectionGuests = 0;
	KDGameData.CollectionSorted = Object.values(KDGameData.Collection).sort(
		(a, b) => {
			let apri = KDEnemyTypeRank(KinkyDungeonGetEnemyByName(a.type));
			let bpri = KDEnemyTypeRank(KinkyDungeonGetEnemyByName(b.type));
			if (KDNPCUnavailable(a.id, a.status)) apri -= 100;
			if (KDNPCUnavailable(b.id, b.status)) bpri -= 100;
			if (a.escaped) apri -= 20;
			else if (a.escapegrace) apri -= 10;
			if (b.escaped) bpri -= 20;
			else if (b.escapegrace) bpri -= 10;
			if (a.status) apri += 1000;
			if (b.status) bpri += 1000;
			return bpri-apri;
		}
	);
	for (let a of KDGameData.CollectionSorted) {
		if (a.status == "Servant") KDGameData.CollectionGuests++;
	}

}

/**
 * @param enemy
 */
function KDGenEnemyName(enemy: entity): string {
	if (enemy?.Enemy?.nonHumanoid) return TextGet("Name" + enemy.Enemy.name);
	let faction = KDGetFaction(enemy) || KDGetFactionOriginal(enemy);
	let nameList = KDFactionProperties[faction]?.nameList ? KDFactionProperties[faction].nameList[Math.floor(Math.random() * KDFactionProperties[faction].nameList.length)] : faction;
	if (enemy.Enemy?.nameList) nameList = enemy.Enemy?.nameList;
	if (KDNameList[nameList]) return KDNameList[nameList][Math.floor(KDNameList[nameList].length * KDRandom())];
	else return KDNameList.default[Math.floor(KDNameList.default.length * KDRandom())];
}

/**
 * @deprecated
 * @param enemy
 */
function KDGetEnemyName(enemy: entity): string {
	return KDGenEnemyName(enemy);
}


let KDCollectionTabScreen = {

};

let KDCollectionTabDraw: Record<string, KDCollectionTabDrawDef> = {
	Imprison: (value, buttonSpacing, III, x, y) => {
		let entity = KinkyDungeonFindID(value.id) || KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
		if (DrawButtonKDEx("ImprisonNPC", (_b) => {

			if (entity || KDNPCUnavailable(value.id, value.status)) {
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
					(value.Enemy || KinkyDungeonGetEnemyByName(value.type)).name, value.id, true);
				if (en) {
					KDImprisonEnemy(en, true, "PrisonerJailOwn", {
						name: rest.name,
						lock: "White",
						id: KinkyDungeonGetItemID(),
						faction: KDDefaultNPCBindPalette,
					});
					//en.ceasefire = 9999;
					en.playWithPlayer = 0;
					if (KDNPCChar.get(en.id))
						KDRefreshCharacter.set(KDNPCChar.get(en.id), true);
					KDUpdatePersistentNPC(en.id, true);
					//KinkyDungeonDrawState = "Game";
					KinkyDungeonAdvanceTime(1);
				}
			}

			if (KDSoundEnabled())
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockHeavy" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/Imprison.png",
		undefined, undefined, entity != undefined,
			KDNPCUnavailable(value.id, value.status) ? "#ff5555" : KDButtonColor)) {
			DrawTextFitKD(TextGet("KDImprison"), x + 220, y + 750, 500, "#ffffff",
				KDTextGray0);
		}
		return III;
	},
	Dropoff: (value, buttonSpacing, III, x, y) => {
		let entity = KinkyDungeonFindID(value.id) || KinkyDungeonEntityAt(KDGameData.InteractTargetX, KDGameData.InteractTargetY);
		if (DrawButtonKDEx("DropoffNPC", (_b) => {

			if (entity || KDNPCUnavailable(value.id, value.status)) {
				return false;
			}

			let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (nearestJail && nearestJail.x == KDGameData.InteractTargetX && nearestJail.y == KDGameData.InteractTargetY) {
				let rest = KinkyDungeonGetRestraint({tags: nearestJail.restrainttags},
					KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
					true,
					"",
					true,
					false,
					false, undefined, true);
				if (rest) {
					let en = DialogueCreateEnemy(KDGameData.InteractTargetX, KDGameData.InteractTargetY,
						(value.Enemy || KinkyDungeonGetEnemyByName(value.type)).name, value.id, true);
					if (en) {
						KDBreakTether(en);
						KDMoveEntity(en,
							KDGameData.InteractTargetX + (nearestJail.direction?.x || 0),
							KDGameData.InteractTargetY + (nearestJail.direction?.y || 0), false);
						KDSetNPCRestraint(en.id, "Device", {
							name: rest.name,
							lock: "White",
							id: KinkyDungeonGetItemID(),
							faction: KDDefaultNPCBindPalette,
						});
						KDNPCRestraintTieUp(en.id, {
							name: rest.name,
							lock: "White",
							id: KinkyDungeonGetItemID(),
							faction: KDDefaultNPCBindPalette,
						}, 1);
						//en.ceasefire = 9999;
						en.playWithPlayer = 0;
						if (KDNPCChar.get(en.id))
							KDRefreshCharacter.set(KDNPCChar.get(en.id), true);
						KDUpdatePersistentNPC(en.id, true);
						//KinkyDungeonDrawState = "Game";
						KinkyDungeonAdvanceTime(1);
					}
				}

				if (KDSoundEnabled())
					AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockHeavy" + ".ogg");
			}

			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/Imprison.png",
		undefined, undefined, entity != undefined,
			KDNPCUnavailable(value.id, value.status) ? "#ff5555" : KDButtonColor)) {
			DrawTextFitKD(TextGet("KDImprison"), x + 220, y + 750, 500, "#ffffff",
				KDTextGray0);
		}
		return III;
	},
	Restrain: (value, buttonSpacing, III, x, y) => {
		if (KDGameData.Collection[value.id + ""] && DrawButtonKDEx("RestrainFree", (_b) => {
			if (!KDIsNPCPersistent(value.id) || KDGetPersistentNPC(value.id).collect)
				KDSendInput("freeNPCRestraint", {
					npc: value.id,
					player: KDPlayer().id,
				});
			else {
				KinkyDungeonSendTextMessage(10, TextGet("KDCantFree"), "#ffffff", 2, true, true);
			}
			if (KDSoundEnabled())
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Struggle" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/RestrainFree.png",
		undefined, undefined, false, (!KDIsNPCPersistent(value.id) || KDGetPersistentNPC(value.id).collect) ?
		KDButtonColor : "#ff5555")) {
			DrawTextFitKD(TextGet("KDFreePrisoner"), x + 220, y + 750, 500, "#ffffff",
				KDTextGray0);
		}
		if (DrawButtonKDEx("returnToCollectionRestrain", (_b) => {
			KDCurrentRestrainingTarget = 0;
			if (KDSoundEnabled())
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
		if (KDPromotableStatus.includes(value.status) && DrawButtonKDEx("promoteNPC", (_b) => {
			if (!(KDGameData.CollectionGuests >= KDCollectionGuestRows*KDCollectionColumns)) {
				if (KDCanPromote(value)) {
					KDPromote(value);

					KDSortCollection();
					if (KDSoundEnabled())
						AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Magic" + ".ogg");
				}
			}
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Promote.png",
		undefined, undefined, false, (!KDCanPromote(value) || KDGameData.CollectionGuests >= KDCollectionGuestRows*KDCollectionColumns) ? "#ff5555" : "")) {
			DrawTextFitKD(TextGet(KDCanPromote(value) ? "KDPromoteNPC" : "KDPromoteNotEnough"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		} else if (value.status == "Servant" && DrawButtonKDEx("demoteNPC", (_b) => {
			value.status = value.oldstatus || "";
			delete value.Facility;
			KDSortCollection();
			if (KDSoundEnabled())
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Damage" + ".ogg");
			return true;
		}, true, x + 10 + buttonSpacing*III++, y + 730 - 10 - 80, 80, 80, "", "#ffffff", KinkyDungeonRootDirectory + "UI/Demote.png",
		undefined, undefined, false)) {
			DrawTextFitKD(TextGet("KDDemoteNPC"), x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		}


		if ((!value.status
			|| Object.values(KDGetNPCRestraints(value.id)).length > 0
			|| KDIsOKWithRestraining(value))
			&& !KDNPCUnavailable(value.id, value.status))
			if (DrawButtonKDEx("CollectionRestrain", (_b) => {
				KDCurrentRestrainingTarget = value.id;
				if (KDSoundEnabled())
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

/**
 * @param value
 * @param x
 * @param y
 * @param width
 * @returns II
 */
function KDDrawNPCBars(value: KDCollectionEntry, x: number, y: number, width: number): number {
	let enemy = KDGetGlobalEntity(value.id);
	if (!enemy) return 0;

	KDEaseBars(enemy, KDDrawDelta || 0);

	let oldEnemy = enemy.Enemy;
	KDUnPackEnemy(enemy);

	let defaultSpeed = KDIsImprisoned(enemy) || !KinkyDungeonFindID(enemy.id);

	let tooltip = "";
	let tooltipcolor = "#ffffff";
	let tooltipAmt = 0;
	let II = 0;
	let height = 12;
	let spacing = height + 2;
	let yy = 0;
	let maxBars = KDNPCStruggleThreshMult(enemy);
	// Draw binding bars
	//let helpless = KDHelpless(enemy);
	let bindAmpMod = 1;//KDGetBindAmp(enemy, bindAmpMfodBase);
	if (enemy.boundLevel != undefined && enemy.boundLevel > 0) {
		let visualbond = bindAmpMod * enemy.visual_boundlevel;
		let bindingBars = maxBars;//Math.ceil( visualbond / enemy.Enemy.maxhp);
		let SM = KDGetEnemyStruggleMod(enemy, true, defaultSpeed);
		let futureBound: Record<string, number> = KDPredictStruggle(enemy, SM, 1);
		yy += Math.min(maxBars, bindingBars) * spacing - 10;
		for (let i = 0; i < bindingBars && i < maxBars; i++) {
			if (i > 0) II++;
			let mod = visualbond - bindAmpMod * futureBound.boundLevel;
			// Part that will be struggled out of
			KinkyDungeonBarTo(kdcanvas, x, y + yy - spacing*II,
				width, height, Math.min(1, (visualbond - i * enemy.Enemy.maxhp) / enemy.Enemy.maxhp) * 100, "#ffffff", "#222222");
			// Separator between part that will be struggled and not
			KinkyDungeonBarTo(kdcanvas, 1 + x, y + yy - spacing*II,
				width, height, Math.min(1, (visualbond - mod - i * enemy.Enemy.maxhp) / enemy.Enemy.maxhp) * 100, "#444444", "none");

		}
		II -= Math.max(0, Math.min(bindingBars-1, maxBars-1));
		// Temp value of bondage level, decremented based on special bound level and priority
		let bb = 0;
		let bcolor = "#ffae70";
		let bondage = [];
		if (futureBound.specialBoundLevel) {
			for (let b of Object.entries(futureBound.specialBoundLevel)) {
				bondage.push({name: b[0], amount: b[1] * bindAmpMod, level: 0, pri: KDSpecialBondage[b[0]].priority});
			}
			bondage = bondage.sort((a, b) => {
				return b.pri - a.pri;
			});
		} else {
			bondage.push({name: "Normal", amount: 0, level: futureBound.boundLevel, pri: 0});
		}

		for (let b of bondage) {
			if (!b.level) {
				b.level = bb + b.amount;
				bb = b.level;
			}
		}
		for (let i = 0; i < bindingBars && i < maxBars; i++) {
			if (i > 0) II++;
			// Determine current bondage type
			let bars = false;
			for (let bi = bondage.length - 1; bi >= 0; bi--) {
				let b = bondage[bi];
				// Filter out anything that doesnt fit currently
				if (b.level > i * enemy.Enemy.maxhp) {
					bcolor = KDSpecialBondage[b.name] ? KDSpecialBondage[b.name].color : "#ffae70";
					// Struggle bars themselves
					if (MouseIn(x, y + yy - spacing*II,width, height)) {
						tooltip = "KDBindType_" + b.name;
						tooltipcolor = bcolor;
						tooltipAmt = b.level;
					}
					KinkyDungeonBarTo(kdcanvas, x, y + yy - spacing*II,
						width, height, Math.min(1, (Math.max(0, b.level - i * enemy.Enemy.maxhp)) / enemy.Enemy.maxhp) * 100, bcolor, "none",
						undefined, undefined, bars ? [0.25, 0.5, 0.75] : undefined, bars ? "#85522c" : undefined, bars ? "#85522c" : undefined, 57.5 + b.pri*0.01);
					bars = true;
				}

			}

		}
		enemy.Enemy = oldEnemy;
		if (tooltip) {
			DrawTextFitKD(TextGet(tooltip) + ` (${Math.round(10 * tooltipAmt)})`, MouseX, MouseY - 25, 250, tooltipcolor, "#000000");
		}
		return bindingBars;
	}
	enemy.Enemy = oldEnemy;
	return 0;
}

/**
 * Whether or not you can promote to servant
 * @param value
 */
function KDCanPromote(value: KDCollectionEntry): boolean {
	return KDGetModifiedOpinionID(value.id) > 0 || value.Opinion > 0;
}

function KDPromote(value: KDCollectionEntry) {
	value.status = "Servant";
	if (KDIsNPCPersistent(value.id)) {
		KDGetPersistentNPC(value.id).collect = true;
		if (KDGetPersistentNPC(value.id).entity)
			delete KDGetPersistentNPC(value.id).entity.hostile;
		KDUpdatePersistentNPC(value.id);
	}
	delete value.Facility;
}
