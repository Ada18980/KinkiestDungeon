"use strict";

function KinkyDungeonDrawCollection(xOffset = -125) {
	let x = 1225 + xOffset;
	if (!KDGameData.Collection) KDGameData.Collection = {};

	if (Object.entries(KDGameData.Collection).length == 0) {
		DrawTextFitKD(TextGet("KDCollectionEmpty"), x, 300, 800, "#ffffff", KDTextGray0, 24);
	} else {
		KDDrawCollectionInventory(x + xOffset, 150);
	}


	KDDrawLoreRepTabs(xOffset);
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

	if (KDNoCaptureTypes.some((tag) => {return enemy.Enemy.tags[tag];})) {
		return;
	}

	if (!KDGameData.Collection["" + enemy.id]) {
		// Add her
		/** @type {KDCollectionEntry} */
		let entry = {
			id: enemy.id,
			name: enemy.CustomName || KDGetEnemyName(enemy),
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
		};
		KDGameData.Collection["" + enemy.id] = entry;
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
 */
function KDDrawSelectedCollectionMember(value, x, y, index) {

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
	DrawTextFitKD(TextGet("KDPrisonerNum").replace("NUMR", "" + index).replace("TTL", "" + Object.values(KDGameData.Collection).length), x + 220, y + 15, 500, "#ffffff", KDTextGray05, 18);

	if (value.Faction && (KinkyDungeonTooltipFactions.includes(value.Faction) || !KinkyDungeonHiddenFactions.includes(value.Faction)))
		DrawTextFitKD(TextGet("KDFormerFaction") + TextGet("KinkyDungeonFaction" + value.Faction), x + 220, y + 500, 500, "#ffffff", KDTextGray05, 18);

	if (!KDNPCChar.get(value.id)) {
		KDSpeakerNPC = suppressCanvasUpdate(() => CharacterLoadNPC("coll" + value.id));
		KDNPCChar.set(value.id, KDSpeakerNPC);
		KDNPCStyle.set(KDSpeakerNPC, value);
		if (!value.bodystyle || !value.facestyle || !value.hairstyle) {
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
		KinkyDungeonDressPlayer(KDSpeakerNPC, true);
		DrawCharacter(KDSpeakerNPC,
			x + 20 + 100,
			y + 80,
			400/1000, true, undefined, PIXI.SCALE_MODES.NEAREST, [], undefined, false);
	} else {
		KDDraw(kdcanvas, kdpixisprites, value.name + "_coll," + value.id, KinkyDungeonRootDirectory + dir + sp + ".png",
			x + 20,
			y + 80,
			400, 400, undefined);
	}


}

let KDNPCChar = new Map();
let KDNPCStyle = new Map();

let KDCollectionSelected = 0;
let KDCollectionIndex = 0;
let KDCollectionRows = 9;
let KDCollectionColumns = 10;
let KDCollectionSpacing = 80;

function KDDrawCollectionInventory(x, y) {
	let XX = x;
	let YY = y;
	let column = 0;
	let row = 0;

	let II = 0;
	let selectedIndex = 0;


	if (KDCollectionIndex + KDCollectionRows * KDCollectionColumns < Object.values(KDGameData.Collection).length) {
		DrawButtonKDEx("collDOWN", (b) => {
			KDCollectionIndex = Math.max(
				0,
				Math.min(
					KDCollectionIndex + KDCollectionColumns,
					Math.floor(Object.values(KDGameData.Collection).length / KDCollectionColumns) * KDCollectionColumns));
			return true;
		},true,
		x + KDCollectionColumns * KDCollectionSpacing/2 - 1.5*KDCollectionSpacing,
		y + KDCollectionRows * KDCollectionSpacing,
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
					Math.floor(Object.values(KDGameData.Collection).length / KDCollectionColumns) * KDCollectionColumns));
			return true;
		},true,
		x + KDCollectionColumns * KDCollectionSpacing/2 - 1.5*KDCollectionSpacing,
		y - KDCollectionSpacing + 36,
		KDCollectionSpacing * 3, 36, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png",
		"", false, false, KDButtonColor, undefined, undefined, {centered: true}
		);
	}

	for (let value of Object.values(KDGameData.Collection)) {
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

	if (KDCollectionSelected && KDGameData.Collection[KDCollectionSelected]) {
		KDDrawSelectedCollectionMember(KDGameData.Collection[KDCollectionSelected], x - 460, 150, selectedIndex);
	} else DrawTextFitKD(TextGet("KDCollectionSelect"), x - 240, 500, 500, "#ffffff", KDTextGray0, 24);

}

function KDGetEnemyName(enemy) {
	let faction = KDGetFaction(enemy) || KDGetFactionOriginal(enemy);
	if (KDNameList[faction]) return KDNameList[faction][Math.floor(KDNameList[faction].length * KDRandom())];
	else return KDNameList.default[Math.floor(KDNameList.default.length * KDRandom())];
}

let KDNameList = {
	default: [
		"Emma",
		"Olivia",
		"Ava",
		"Isabella",
		"Sophia",
		"Mia",
		"Amelia",
		"Harper",
		"Evelyn",
		"Abigail",
		"Emily",
		"Ella",
		"Scarlett",
		"Grace",
		"Chloe",
		"Lily",
		"Avery",
		"Sofia",
		"Riley",
		"Aria",
		"Zoe",
		"Stella",
		"Hazel",
		"Luna",
		"Nora",
		"Nova",
		"Penelope",
		"Mila",
		"Aurora",
		"Sarah",
		"Hailey",
		"Layla",
		"Eleanor",
		"Violet",
		"Sadie",
		"Aubrey",
		"Brooklyn",
		"Paisley",
		"Madison",
		"Scarlet",
		"Lillian",
		"Victoria",
		"Natalie",
		"Katherine",
		"Zara",
		"Camila",
		"Genesis",
		"Leah",
		"Alexa",
		"Allison",
		"Hana",
		"Yuki",
		"Aya",
		"Miyuki",
		"Sakura",
		"Haruka",
		"Natsumi",
		"Kaori",
		"Emi",
		"Aiko",
		"Riko",
		"Yui",
		"Sora",
		"Nana",
		"Kana",
		"Mio",
		"Rina",
		"Kotone",
		"Rika",
		"Mei",
		"Yuna",
		"Kokoro",
		"Nozomi",
		"Mari",
		"Ayumi",
		"Yuri",
		"Asuka",
		"Ai",
		"Kairi",
		"Miku",
		"Tomoko",
		"Misaki",
		"Yoko",
		"Natsu",
		"Asumi",
		"Maki",
		"Nao",
		"Reina",
		"Yuriko",
		"Izumi",
		"Satsuki",
		"Akari",
		"Hinata",
		"Mayu",
		"Kazumi",
		"Rin",
		"Yuki",
		"Mana",
		"Hikari",
		"Sayuri",
	],
};