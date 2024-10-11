"use strict";

let KDDialogueData = {
	CurrentDialogueIndex: 0,
};

/**
 * Milliseconds during which clicks are ignored to avoid inadverdent clicking
 */
let KDDialogueDelay = 400;


/**
 * @param Min
 * @param Avg
 * @param Max
 * @param [Enemy]
 */
function KDPersonalitySpread(Min: number, Avg: number, Max: number, Enemy?: entity): number {
	return KDStrictPersonalities.includes(Enemy?.personality || KDGameData.CurrentDialogMsgPersonality) ? Max :
		(!KDLoosePersonalities.includes(Enemy?.personality || KDGameData.CurrentDialogMsgPersonality) ? Avg :
		Min);
}

function KinkyDungeonCanPutNewDialogue(): boolean {
	return !KDGameData.CurrentDialog && !KinkyDungeonFlags.get("NoDialogue");
}

function KDBasicCheck(PositiveReps: string[], NegativeReps: string[], Modifier: number = 0): number {
	let value = Modifier;
	if (KinkyDungeonFlags.has("OfferRefused")) value -= 15;
	if (KinkyDungeonFlags.has("OfferRefusedLight")) value -= 15;
	// Being low willpower makes it harder
	if (KinkyDungeonStatWill < 10) value -= Math.max(0, 5 * (10 - KinkyDungeonStatWill));
	for (let rep of PositiveReps) {
		if (KinkyDungeonGoddessRep[rep] != undefined) value += 50 + KinkyDungeonGoddessRep[rep];
	}
	for (let rep of NegativeReps) {
		if (KinkyDungeonGoddessRep[rep] != undefined) value -= 50 + KinkyDungeonGoddessRep[rep];
	}
	return value;
}

function KDDialogueApplyPersonality(allowed: string[]) {
	if (allowed.includes(KDGameData.CurrentDialogMsgPersonality)) KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + KDGameData.CurrentDialogMsgPersonality;
}

function KDGetDialogue(): KinkyDialogue {
	let dialogue = KDDialogue[KDGameData.CurrentDialog];
	if (KDGameData.CurrentDialogStage && dialogue?.options) {
		let stages = KDGameData.CurrentDialogStage.split("_");
		for (let i = 0; i < stages.length; i++) {
			if (dialogue.options[stages[i]])
				dialogue = dialogue.options[stages[i]];
			else {
				// Break the dialogue
				console.log("Error in dialogue " + KDGameData.CurrentDialog + ", stage = " + KDGameData.CurrentDialogStage);
				KDGameData.CurrentDialog = "";
				break;
			}
		}
	}
	return dialogue;
}

let KDMaxDialogue = 7;
let KDOptionOffset = 0;


function KDDrawDialogue(delta: number): void {
	KDDraw(kdcanvas, kdpixisprites, "dialogbg", KinkyDungeonRootDirectory + "DialogBackground.png", 500, 0, 1000, 1000, undefined, {
		zIndex: 111,
	});

	if (KDGameData.CurrentDialog && !(KDGameData.SlowMoveTurns > 0)) {
		KinkyDungeonDrawState = "Game";

		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		// Get the current dialogue and traverse down the tree
		let dialogue = KDGetDialogue();
		let gagged = KDDialogueGagged();
		// Now that we have the dialogue, we check if we have a message
		if (dialogue.response && !KDGameData.CurrentDialogMsg) KDGameData.CurrentDialogMsg = dialogue.response;
		if (KDGameData.CurrentDialogMsg == "Default") KDGameData.CurrentDialogMsg = KDGameData.CurrentDialog + KDGameData.CurrentDialogStage;
		if (gagged && dialogue.responseGag) KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gag";

		gagged = KDDialogueGagged();

		if (!dialogue.drawFunction || !dialogue.drawFunction(gagged, KinkyDungeonPlayerEntity, delta)) {
			// Type the message
			let text = TextGet("r" + KDGameData.CurrentDialogMsg).split("|");
			for (let i = 0; i < text.length; i++) {
				let tt = text[i];
				if (KDGameData.CurrentDialogMsgData) {
					for (let d of Object.entries(KDGameData.CurrentDialogMsgData)) {
						tt = tt.replace(d[0], d[1]);
					}
				}
				DrawTextFitKD(tt.replace("SPEAKER", TextGet("Name" + KDGameData.CurrentDialogMsgSpeaker)),
					1000, 300 + 50 * i - 25 * text.length, 900, "white", "black", undefined, undefined, 115);
			}

			// Draw the options
			if (dialogue.options) {
				let entries = Object.entries(dialogue.options);

				let II = -KDOptionOffset;
				for (let i = 0; i < entries.length && II < KDMaxDialogue; i++) {
					if ((!entries[i][1].prerequisiteFunction || entries[i][1].prerequisiteFunction(gagged, KinkyDungeonPlayerEntity))
						&& (!entries[i][1].gagRequired || gagged)
						&& (!entries[i][1].gagDisabled || !gagged)) {
						if (II >= 0) {
							let playertext = entries[i][1].playertext;
							if (playertext == "Default") playertext = KDGameData.CurrentDialog + KDGameData.CurrentDialogStage + "_" + entries[i][0];
							if (entries[i][1].gag && KDDialogueGagged()) playertext = playertext + "Gag";

							let tt = TextGet("d" + playertext);
							if (KDGameData.CurrentDialogMsgData) {
								for (let d of Object.entries(KDGameData.CurrentDialogMsgData)) {
									tt = tt.replace(d[0], d[1]);
								}
							}
							let notGrey = !entries[i][1].greyoutFunction || entries[i][1].greyoutFunction(gagged, KinkyDungeonPlayerEntity);
							DrawButtonKDEx(KDOptionOffset + "dialogue" + II, (_bdata) => {
								if (notGrey) {
									KDOptionOffset = 0;
									KDDialogueData.CurrentDialogueIndex = 0;
									KDSendInput("dialogue", {dialogue: KDGameData.CurrentDialog, dialogueStage: KDGameData.CurrentDialogStage + ((KDGameData.CurrentDialogStage) ? "_" : "") + entries[i][0], click: true, enemy: KDGetSpeaker()?.id});
								}
								return true;
							}, KinkyDungeonDialogueTimer < CommonTime(), 700, 450 + II * 60, 600, 50,
							(notGrey || KDDialogueData.CurrentDialogueIndex != II) ? tt : TextGet(entries[i][1].greyoutTooltip), (notGrey && KinkyDungeonDialogueTimer < CommonTime()) ? "#ffffff" : "#888888", undefined,
							undefined, undefined, undefined,
							KDDialogueData.CurrentDialogueIndex == II ? KDTextGray3 : undefined, undefined, undefined, {
								zIndex: 122,
							});
							if (MouseIn(700, 450 + II * 60, 600, 50)) KDDialogueData.CurrentDialogueIndex = II;
						}

						II += 1;
					}
				}
				if (II >= KDMaxDialogue || KDOptionOffset > 0) {
					if (KDOptionOffset > 0)
						DrawButtonKDEx("dialogueUP", (_bdata) => {
							if (KDOptionOffset > 0) {
								KDOptionOffset -= 1;
								//if (KDDialogueData.CurrentDialogueIndex > 0)
								//KDDialogueData.CurrentDialogueIndex -= 1;
							}
							return true;
						}, KDOptionOffset > 0, 1350, 450, 90, 40, "", KDOptionOffset > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png",
						undefined, undefined, undefined, undefined, undefined, undefined, {
							zIndex: 122,
						});
					if (II >= KDMaxDialogue)
						DrawButtonKDEx("dialogueDOWN", (_bdata) => {
							if (II >= KDMaxDialogue) {
								KDOptionOffset += 1;
								//KDDialogueData.CurrentDialogueIndex += 1;
							}
							return true;
						}, II >= KDMaxDialogue, 1350, 450 + (KDMaxDialogue - 1) * 60 + 10, 90, 40, "", II >= KDMaxDialogue ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png",
						undefined, undefined, undefined, undefined, undefined, undefined, {
							zIndex: 122,
						});
				}
				if (KDDialogueData.CurrentDialogueIndex > II - 1) {
					KDDialogueData.CurrentDialogueIndex = II - 1;
				}
				if (KDDialogueData.CurrentDialogueIndex < 0) {
					KDDialogueData.CurrentDialogueIndex = 0;
				}
			}
		}

	} else if (!KDGameData.CurrentDialog) {
		// Clear data
		KDGameData.CurrentDialogMsgData = {};
		KDGameData.CurrentDialogMsgValue = {};
	}
}

/**
 * @param Amount
 */
function KDIncreaseOfferFatigue(Amount: number): void {
	if (!KDGameData.OfferFatigue) {
		KDGameData.OfferFatigue = 0;
	}
	KDGameData.OfferFatigue = Math.max(0, KDGameData.OfferFatigue + Amount);

	if (Amount > 0) KinkyDungeonSetFlag("OfferRefused", KDOfferCooldown * 2);
	if (Amount > 0) KinkyDungeonSetFlag("OfferRefusedLight", KDOfferCooldown * 5);
}

/**
 * @param enemy
 */
function KDEnemyHelpfulness(enemy: entity): number {
	if (!enemy.personality) return 1.0;
	if (KDStrictPersonalities.includes(enemy.personality)) return 0.33;
	if (KDLoosePersonalities.includes(enemy.personality)) return 1.75;
}

function KDGetSpeaker(): entity {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		return enemy;
	}
	return null;
}

/**
 * Same as KDGetSpeaker
 */
function KDDialogueEnemy(): entity {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		return enemy;
	}
	return null;
}



function KDGetSpeakerFaction(): string {
	let speaker = KDGetSpeaker();
	return speaker ? KDGetFactionOriginal(speaker) : undefined;
}

/**
 * @param Amount
 */
function KDPleaseSpeaker(Amount: number) {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		KDAddOpinionPersistent(enemy.id, Amount * 100);
		let faction = KDGetFactionOriginal(enemy);
		if (!KinkyDungeonHiddenFactions.has(faction)) {
			if (!KDEntityHasFlag(enemy, "PleasedRep")) {
				KinkyDungeonChangeFactionRep(faction, 0.01);
				KDSetIDFlag(enemy.id, "PleasedRep", -1);
			}
		}
	}
}

/**
 * @param enemy
 * @param Amount
 */
function KDAddOpinion(enemy: entity, Amount: number): number {
	if (!enemy) return;
	let a = Math.min(1000, Math.abs(Amount));
	while (a > 0 && (Amount < 0 || (enemy.opinion || 0) < Amount * 10)) {
		enemy.opinion =
			(enemy.opinion || KDGameData.Collection[enemy.id]?.Opinion || 0)
				+ Math.min(10, a)
					* Math.min(10, a)
					/ (Amount > 0 ?
						(Math.min(10, a) + Math.max(0, enemy.opinion || 0))
						: -(Math.min(10, a) + Math.max(0, -enemy.opinion || 0)));
		a -= 10;
	}
	if (KDGameData.Collection[enemy.id]) KDGameData.Collection[enemy.id].Opinion = enemy.opinion;
	if (enemy.opinion > 0) {
		// After being made happier they will reconsider their hostilities
		enemy.hostile = undefined;
		enemy.rage = undefined;
	}
	return enemy.opinion || 0;
}
/**
 * @param enemy
 * @param Amount
 */
function KDAddOpinionCollection(enemy: KDCollectionEntry, Amount: number): number {
	if (!enemy) return;
	let a = Math.min(1000, Math.abs(Amount));
	while (a > 0 && (Amount < 0 || (enemy.Opinion || 0) < Amount * 10)) {
		enemy.Opinion =
			(enemy.Opinion || 0)
				+ Math.min(10, a)
					* Math.min(10, a)
					/ (Amount > 0 ? (Math.min(10, a) + (enemy.Opinion || 0)) : -1);
		a -= 10;
	}
	return enemy.Opinion || 0;
}

function KDAllySpeaker(Turns: number, Follow: boolean) {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		if (!KDEntityHasFlag(enemy, "helped")) {
			KinkyDungeonSetEnemyFlag(enemy, "helped", -1);
			KDAddOpinionPersistent(enemy.id, 100);
		}
		if (!(enemy.hostile > 0)) {
			enemy.allied = Turns;
			if (Follow) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 0);
			}
		}
	}
}

/**
 * @param [Turns]
 * @param [NoAlertFlag]
 */
function KDAggroSpeaker(Turns: number = 300, NoAlertFlag: boolean = false) {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		if (!(enemy.hostile > 0)) {
			enemy.hostile = Turns;
		} else enemy.hostile = Math.max(enemy.hostile, Turns);
		if (NoAlertFlag) {
			KinkyDungeonSetEnemyFlag(enemy, "nosignalothers", Turns);
		}
	}
}


// Success chance for a basic dialogue
function KDBasicDialogueSuccessChance(checkResult: number): number {
	return Math.max(0, Math.min(1.0, checkResult/100));
}

// Success chance for a basic dialogue
function KDAgilityDialogueSuccessChance(checkResult: number): number {
	let evasion = KinkyDungeonPlayerEvasion();
	return Math.max(0, Math.min(1.0, (checkResult/100 - (KDGameData.OfferFatigue ? KDGameData.OfferFatigue /100 : 0) + 0.2 * Math.max(0, 3 - KinkyDungeonSlowLevel)) * evasion));
}

// Success chance for an offensive dialogue
function KDOffensiveDialogueSuccessChance(checkResult: number): number {
	let accuracy = KinkyDungeonGetEvasion();
	return Math.max(0, Math.min(1.0, (checkResult/100 - (KDGameData.OfferFatigue ? KDGameData.OfferFatigue / 100 : 0)
		- 0.15 + 0.3 * Math.max(0, 3 - KinkyDungeonSlowLevel)) * accuracy));
}

let KinkyDungeonDialogueTimer = 0;

/**
 * @param Dialogue
 * @param [Speaker]
 * @param [Click]
 * @param [Personality]
 * @param [enemy]
 */
function KDStartDialog(Dialogue: string, Speaker?: string, Click?: boolean, Personality?: string, enemy?: entity) {
	KinkyDungeonInterruptSleep();
	KDDisableAutoWait();
	KinkyDungeonDialogueTimer = CommonTime() + KDDialogueDelay + KDGameData.SlowMoveTurns * 200;
	KDOptionOffset = 0;
	KinkyDungeonFastMovePath = [];
	KinkyDungeonDrawState = "Game";
	KDDialogueData.CurrentDialogueIndex = 0;


	KDDoDialogue({dialogue: Dialogue, dialogueStage: "", click: Click, speaker: Speaker, personality: Personality, enemy: enemy ? enemy.id : undefined});
	KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	KinkyDungeonDressPlayer();
}


function KDDoDialogue(data: any) {
	KDDelayedActionPrune(["Action", "Dialogue"]);
	if (!KDGameData.CurrentDialogMsgData) KDGameData.CurrentDialogMsgData = {};
	if (!KDGameData.CurrentDialogMsgValue) KDGameData.CurrentDialogMsgValue = {};

	KDGameData.CurrentDialog = data.dialogue;
	KDGameData.CurrentDialogStage = data.dialogueStage;
	if (data.speaker) {
		let oldSpeaker = KDGameData.CurrentDialogMsgSpeaker;
		KDGameData.CurrentDialogMsgSpeaker = data.speaker;
		if (KDGameData.CurrentDialogMsgSpeaker != oldSpeaker)
			KDGameData.CurrentDialogMsgPersonality = ""; // Reset when speaker changes
	}
	if (data.enemy) {
		KDGameData.CurrentDialogMsgID = data.enemy;
	} else {
		KDGameData.CurrentDialogMsgID = 0;
	}
	if (data.personality)
		KDGameData.CurrentDialogMsgPersonality = data.personality;

	let dialogue = KDGetDialogue();
	if (!dialogue) {// Means we exited {
		KDGameData.CurrentDialog = "";
		KDGameData.CurrentDialogStage = "";
		return;
	}
	let ggagged = KDDialogueGagged();
	if (dialogue.data) KDGameData.CurrentDialogMsgData = dialogue.data;
	if (dialogue.response) KDGameData.CurrentDialogMsg = dialogue.response;
	if (dialogue.response == "Default") KDGameData.CurrentDialogMsg = KDGameData.CurrentDialog + KDGameData.CurrentDialogStage;
	if (dialogue.personalities) {
		KDDialogueApplyPersonality(dialogue.personalities);
	}
	if (ggagged && dialogue.responseGag) KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gag";
	let abort = false;
	if (data.click) {
		let gagged = KDDialogueGagged();
		if (dialogue.gagFunction && gagged) {
			abort = dialogue.gagFunction(KinkyDungeonPlayerEntity);
		} else if (dialogue.clickFunction) {
			abort = dialogue.clickFunction(gagged, KinkyDungeonPlayerEntity);
		}
	}
	if (!abort) {
		let gagged = KDDialogueGagged();
		if (dialogue.exitDialogue) {
			KDGameData.CurrentDialog = "";
			KDGameData.CurrentDialogStage = "";
		} else {
			let modded = false;
			if (dialogue.leadsTo != undefined) {
				KDGameData.CurrentDialog = dialogue.leadsTo;
				KDGameData.CurrentDialogStage = "";
				modded = true;
			}
			if (dialogue.leadsToStage != undefined) {
				KDGameData.CurrentDialogStage = dialogue.leadsToStage;
				modded = true;
			}
			if (modded && !dialogue.dontTouchText) {
				dialogue = KDGetDialogue();
				if (dialogue.response) KDGameData.CurrentDialogMsg = dialogue.response;
				if (dialogue.response == "Default") KDGameData.CurrentDialogMsg = KDGameData.CurrentDialog + KDGameData.CurrentDialogStage;
				if (gagged && dialogue.responseGag) KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + "Gag";
			}
		}
	}
}

/**
 * @param Dialogue
 * @param [Speaker]
 * @param [Click]
 * @param [Personality]
 * @param [enemy]
 */
function KDStartDialogInput(Dialogue: string, Speaker?: string, Click?: boolean, Personality?: string, enemy?: entity) {
	KinkyDungeonInterruptSleep();
	KDDisableAutoWait();
	KinkyDungeonDialogueTimer = CommonTime() + 700 + KDGameData.SlowMoveTurns * 200;
	KDOptionOffset = 0;
	KinkyDungeonFastMovePath = [];
	KinkyDungeonDrawState = "Game";
	KDDialogueData.CurrentDialogueIndex = 0;
	KDSendInput("dialogue", {dialogue: Dialogue, dialogueStage: "", click: Click, speaker: Speaker, personality: Personality, enemy: enemy ? enemy.id : undefined});

	KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	KinkyDungeonDressPlayer();
}

function KDDialogueGagged() {
	let dialogue = KDGetDialogue();
	let threshold = dialogue?.gagThreshold ? dialogue.gagThreshold : (KinkyDungeonStatsChoice.get("SmoothTalker") ? 0.99 : 0.01);
	if (KinkyDungeonGagTotal() >= threshold) return true;
	return false;
}

function KDHandleDialogue() {
	if (KDGameData.CurrentDialog && KinkyDungeonDialogueTimer < CommonTime()) {
		KinkyDungeonInterruptSleep();
		// Get the current dialogue and traverse down the tree
		let dialogue = KDGetDialogue();

		if (dialogue.inventory)
			KinkyDungeonhandleQuickInv(true);
	}

	return false;
}


/**
 * @param x
 * @param y
 * @param Name
 * @param [persistentid]
 * @param [noLoadout]
 */
function DialogueCreateEnemy(x: number, y: number, Name: string, persistentid?: number, noLoadout?: boolean): entity {
	if (KinkyDungeonEnemyAt(x, y)) KDKickEnemy(KinkyDungeonEnemyAt(x, y));
	let Enemy = KinkyDungeonGetEnemyByName(Name);
	let e = {summoned: true, Enemy: Enemy, id: persistentid || KinkyDungeonGetEnemyID(),
		x:x, y:y,
		visual_x: x, visual_y: y,
		hp: (Enemy && Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};

	return KDAddEntity(e, persistentid != undefined, undefined, noLoadout);
}


function KDAllyDialogue(name: string, requireTags: string[], requireSingleTag: string[], excludeTags: string[], weight: number): KinkyDialogue {
	/**
		 */
	let dialog: KinkyDialogue = {
		response: "Default",
		options: {},
	};


	dialog.options.Leash = {playertext: name + "Leash", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (enemy.leash) return false;
				if (KinkyDungeonInventoryGetConsumable("LeashItem")
					|| KDGetNPCRestraints(enemy.id) && Object.values(KDGetNPCRestraints(enemy.id))
						.some((rest) => {return KDRestraint(rest)?.leash;})) {
					if (!KDLeashReason.PlayerLeash(enemy)) return false;
					return true;
				}
				return false;
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (KDGetLeashedToCount(enemy) >= 3) {
					KinkyDungeonSendActionMessage(7, TextGet("KDTooManyLeashes"), "#e64539", 1);
				} else if (!(enemy.leash?.reason == "PlayerLeash")) {
					KinkyDungeonSendActionMessage(7, TextGet("KDLeashSpell").replace("ENMY", KDGetEnemyTypeName(enemy)), "#63ab3f", 1);
					KinkyDungeonAttachTetherToEntity(1.5, KDPlayer(), enemy, "PlayerLeash", "#e64539", 7);
				}
			}
			return false;
		},
		leadsToStage: "",
	};

	dialog.options.ReleaseLeash = {playertext: name + "ReleaseLeash", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (enemy.leash?.reason == "PlayerLeash") return true;
				return false;
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KDBreakTether(enemy);
			}
			return false;
		},
		leadsToStage: "",
	};
	dialog.options.Shop = {playertext: name + "Shop", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				for (let shop of Object.values(KDShops)) {
					if (KDEnemyHasFlag(enemy, shop.name)) {
						KDStartDialog(shop.name, enemy.Enemy.name, true, enemy.personality, enemy);
						return true;
					}
				}
			}
		},
		exitDialogue: true,
	};
	dialog.options.ShopBuy = {playertext: name + "ShopBuy", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return enemy.items?.length > 0;
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KDStartDialog("ShopBuy", enemy.Enemy.name, true, enemy.personality, enemy);
				return true;
			}
			return false;
		},
		exitDialogue: true,
	};
	dialog.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
			}
			return false;
		},
	};
	dialog.options.Attack = {playertext: name + "Attack", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (!enemy || (enemy.aware && !enemy.playWithPlayer)) return true;
			return false;
		},
		options: {
			"Confirm": {playertext: name + "Attack_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!enemy.Enemy.allied) {
							let faction = KDGetFactionOriginal(enemy);
							if (faction == "Player") {
								enemy.faction = "Enemy"; // They become an enemy
							} else if (!KinkyDungeonHiddenFactions.has(faction) && !enemy.Enemy.tags?.scenery) {
								KinkyDungeonChangeRep("Ghost", -5);
								KinkyDungeonChangeFactionRep(faction, -0.06);
							}
							KDMakeHostile(enemy);
						} else {
							enemy.hp = 0;
						}
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: name + "Attack_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.AttackPlay = {playertext: name + "AttackPlay", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.playWithPlayer) return true;
			return false;
		},
		options: {
			"Confirm": {playertext: name + "Attack_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!enemy.Enemy.allied) {
							KDMakeHostile(enemy);
							let faction = KDGetFactionOriginal(enemy);
							if (!KinkyDungeonHiddenFactions.has(faction)) {
								KinkyDungeonChangeRep("Ghost", -5);
							}
						} else {
							enemy.hp = 0;
						}
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: name + "AttackPlay_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.AttackUnaware = {playertext: name + "AttackUnaware", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && (enemy.aware || enemy.playWithPlayer)) return false;
			return true;
		},
		options: {
			"Confirm": {playertext: name + "AttackUnaware_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!enemy.Enemy.allied) {
							KDMakeHostile(enemy);
							enemy.stun = Math.max(enemy.stun || 0, 1);
							enemy.vulnerable = Math.max(enemy.vulnerable || 0, 1);
						} else {
							enemy.hp = 0;
						}
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: name + "AttackUnaware_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};

	dialog.options.Food = {playertext: name + "Food", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return enemy.hp < enemy.Enemy.maxhp;
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KDGameData.InventoryAction = "Food";
				KDGameData.FoodTarget = enemy.id;
				KinkyDungeonDrawState = "Inventory";
				KinkyDungeonCurrentFilter = Consumable;
				KinkyDungeonSendTextMessage(8, TextGet("KDFoodTarget"), "#ffffff", 1, true);

			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.Flirt = {playertext: name + "Flirt", response: "Default",
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy)
				KDGameData.CurrentDialogMsg = name + "Flirt" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
			return false;
		},
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy)
				return KDPlayPossible(enemy);
			return false;
		},
		options: {
			"Leave": {playertext: "Leave", response: "Default",
				leadsToStage: "",
			},
			LinkRequestArms: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let r = KinkyDungeonGetRestraint({tags: ["armLink"]}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(),
							(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));

						if (r && KDCanAddRestraint(r, true, undefined, false, undefined, true, true)) {
							return true;
						}
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let r = KinkyDungeonGetRestraint({tags: ["armLink"]}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(),
							(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
						if (r && KDCanAddRestraint(r, true, undefined, false, undefined, true, true)) {
							KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);

						}

						KinkyDungeonChangeRep("Ghost", 3);

						// Make the enemy see you
						enemy.vp = Math.max(enemy.vp || 0, 3);
						KDStunTurns(1, true);
					}
					KDGameData.CurrentDialogMsg = name + "Flirt" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
					return false;
				},
				leadsToStage: "", dontTouchText: true, exitDialogue: true,
			},
			LinkRequestLegs: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let r = KinkyDungeonGetRestraint({tags: ["legLink", "feetLink"]}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(),
							(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));

						if (r && KDCanAddRestraint(r, true, undefined, false, undefined, true, true)) {
							return true;
						}
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let r = KinkyDungeonGetRestraint({tags: ["legLink", "feetLink"]}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(),
							(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
						if (r && KDCanAddRestraint(r, true, undefined, false, undefined, true, true)) {
							KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);

						}
						KinkyDungeonChangeRep("Ghost", 3);

						// Make the enemy see you
						enemy.vp = Math.max(enemy.vp || 0, 3);
						KDStunTurns(1, true);

					}
					KDGameData.CurrentDialogMsg = name + "Flirt" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
					return false;
				},
				leadsToStage: "", dontTouchText: true, exitDialogue: true,
			},
			PlayRequest: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						return (KinkyDungeonCanPlay(enemy)) && !enemy.playWithPlayer;
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KinkyDungeonSetEnemyFlag(enemy, "forcePlay", 20);
						KinkyDungeonSetEnemyFlag(enemy, "noHarshPlay", 20);
						KinkyDungeonSetEnemyFlag(enemy, "allyPlay", 80);
						enemy.aware = true;
						enemy.gx = enemy.x;
						enemy.gy = enemy.y;
						enemy.path = undefined;
						enemy.playWithPlayerCD = 0;
						// Make the enemy see you
						enemy.vp = Math.max(enemy.vp || 0, 3);
						KDStunTurns(1, true);
					}
					KDGameData.CurrentDialogMsg = name + "Flirt" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
					return false;
				},
				leadsToStage: "", dontTouchText: true, exitDialogue: true,
			},
			Release: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						return (KDIsDistracted(enemy)) && !enemy.playWithPlayer;
					}
					return false;
				},
				options: {
					"Wand": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return KinkyDungeonInventoryGet("VibeWand") != undefined && !KinkyDungeonIsHandsBound(true, true, 0.99);
						},
						clickFunction: (_gagged, _player) => {
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
								KDEnemyRelease(enemy);
								KDAddOpinionPersistent(KDGetSpeaker().id, 3);
							}
							KDGameData.CurrentDialogMsg = name + "Release_Success" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
							return false;
						},
						leadsToStage: "", dontTouchText: true, exitDialogue: true,
					},
					"Cuddle": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							return true;
						},
						clickFunction: (_gagged, _player) => {
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
								KDEnemyRelease(enemy);
								KDStunTurns(2, true);
								KDAddOpinionPersistent(KDGetSpeaker().id, 3);
							}
							KDGameData.CurrentDialogMsg = name + "Release_Success" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
							return false;
						},
						leadsToStage: "", dontTouchText: true, exitDialogue: true,
					},
					"Vibe": {
						playertext: "Default", response: "Default",
						prerequisiteFunction: (_gagged, _player) => {
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							return KDEntityBuffedStat(enemy, "Plug") && KinkyDungeonInventoryGet("VibeRemote") != undefined && !KinkyDungeonIsHandsBound(true, true, 0.99);
						},
						clickFunction: (_gagged, _player) => {
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
								KDEnemyRelease(enemy);
								KDStunTurns(2, true);
								KDAddOpinionPersistent(KDGetSpeaker().id, 3);
							}
							KDGameData.CurrentDialogMsg = name + "Release_Success" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
							return false;
						},
						leadsToStage: "", dontTouchText: true, exitDialogue: true,
					},
				}
			},
			BondageOffer: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker && KDEnemyCanTalk(enemy)) {
						KinkyDungeonSetEnemyFlag(enemy, "allyOffer", 1);
						let dialogue = KDGetDialogueTrigger(enemy, {
							aggressive: false,
							playAllowed: true,
							playerDist: 1,
							canTalk: true,
							allowPlayExceptionSub: true,
							ignoreNoAlly: true,
							ignoreCombat: true,
						}, ["BondageOffer"]);
						KinkyDungeonSetEnemyFlag(enemy, "allyOffer", 0);
						return dialogue != "";
					}
					return false;
				},
				options: {
					"Yes": {playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
								KinkyDungeonSetEnemyFlag(enemy, "allyOffer", 1);
								let dialogue = KDGetDialogueTrigger(enemy, {
									aggressive: false,
									playAllowed: true,
									playerDist: 1,
									canTalk: true,
									allowPlayExceptionSub: true,
									ignoreNoAlly: true,
									ignoreCombat: true,
								}, ["BondageOffer"]);
								if (dialogue) {
									KDStartDialog(dialogue,enemy.Enemy.name, true, enemy.personality, enemy);
									return true;
								}
							}
							return false;
						},
						exitDialogue: true,
					},
					"No": {playertext: "Default", response: "Default",
						leadsToStage: "Flirt",
					},
				},
			},
			LeashWalk: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (enemy == KinkyDungeonJailGuard() || enemy == KinkyDungeonLeashingEnemy()) return false;
						return (KinkyDungeonCanPlay(enemy) && KinkyDungeonPlayerTags.get("Collars") && KinkyDungeonGetRestraintItem("ItemNeckRestraints") && !enemy.playWithPlayer) == true;
					}
					return false;
				},
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KinkyDungeonSetEnemyFlag(enemy, "allowLeashWalk", -1);

						enemy.aware = true;
						enemy.gx = enemy.x;
						enemy.gy = enemy.y;
						enemy.path = undefined;
						// Make the enemy see you

						let duration = 60 + Math.round(KDRandom()*40);
						KinkyDungeonSetEnemyFlag(enemy, "notouchie", duration);
						KinkyDungeonSetFlag("TempLeash", duration);
						KinkyDungeonSetFlag("TempLeashCD", duration + 1);
						KinkyDungeonSetFlag("noResetIntent", 12);
						enemy.playWithPlayer = 12;
						enemy.playWithPlayerCD = 40;
						enemy.IntentAction = 'TempLeash';
						KDTickTraining("Heels", KDGameData.HeelPower > 0,
							KDGameData.HeelPower <= 0, 4, 25);
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + (KDEnemyCanTalk(enemy) ? KDJailPersonality(enemy) : "Gagged") + "LeashTime").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 14, 10);
						KDAddThought(enemy.id, "Play", 7, enemy.playWithPlayer);

						enemy.vp = Math.max(enemy.vp || 0, 3);
						KDStunTurns(1, true);
					}
					KDGameData.CurrentDialogMsg = name + "Flirt" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
					return false;
				},
				leadsToStage: "", dontTouchText: true, exitDialogue: true,
			},
		}
	};
	dialog.options.LetMePass = {playertext: name + "LetMePass", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KinkyDungeonFlags.has("passthrough");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (KinkyDungeonFlags.has("LetMePass")) {
					KinkyDungeonSetEnemyFlag(enemy, "passthrough", 8);
					KDGameData.CurrentDialog = "";
					KDGameData.CurrentDialogStage = "";
					KinkyDungeonSetFlag("LetMePass", 30);
				}
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "LetMePass_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KinkyDungeonSetEnemyFlag(enemy, "passthrough", 8);
						if (KinkyDungeonFlags.has("LetMePass")) {
							KDGameData.CurrentDialog = "";
							KDGameData.CurrentDialogStage = "";
						}
						KinkyDungeonSetFlag("LetMePass", 30);
					}
					return false;
				},
				exitDialogue: true,
			},
			"ConfirmAll": {playertext: name + "LetMePass_ConfirmAll", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KinkyDungeonSetFlag("Passthrough", 8);
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: name + "LetMePass_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.StopFollowingMe = {playertext: name + "StopFollowingMe", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDAllied(enemy) && !KDEnemyHasFlag(enemy, "NoFollow");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 9999);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.FollowMe = {playertext: name + "FollowMe", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDAllied(enemy) && KDEnemyHasFlag(enemy, "NoFollow") && !KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (!KDEnemyHasFlag(enemy, "NoStay")
					&& (KDRandom() < (70 - KinkyDungeonGoddessRep.Ghost + KDGetModifiedOpinion(enemy) + (KinkyDungeonStatsChoice.get("Dominant") ? 50 : 0))/100 * 0.35 * KDEnemyHelpfulness(enemy) || enemy.Enemy.allied)
				) {
					KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 0);
				} else {
					KDGameData.CurrentDialogMsg = name + "StayHere_Fail";
					KinkyDungeonSetEnemyFlag(enemy, "NoStay", 100);
				}
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.DontStayHere = {playertext: name + "DontStayHere", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && KDEnemyHasFlag(enemy, "StayHere");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "StayHere", 0);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.StayHere = {playertext: name + "StayHere", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && !KDEnemyHasFlag(enemy, "StayHere") && !KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (!KDEnemyHasFlag(enemy, "NoStay") && (KDRandom() < (50 - KinkyDungeonGoddessRep.Ghost + KDGetModifiedOpinion(enemy) + (KinkyDungeonStatsChoice.get("Dominant") ? 50 : 0))/100 * KDEnemyHelpfulness(enemy) * (KDAllied(enemy) ? 4.0 : 0.25) || enemy.Enemy.allied)) {
					KinkyDungeonSetEnemyFlag(enemy, "StayHere", -1);
					enemy.gx = enemy.x;
					enemy.gy = enemy.y;
				} else {
					KDGameData.CurrentDialogMsg = name + "StayHere_Fail";
					KinkyDungeonSetEnemyFlag(enemy, "NoStay", 100);
				}
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.Aggressive = {playertext: name + "Aggressive", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && KDEnemyHasFlag(enemy, "Defensive");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Defensive", 0);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.Defensive = {playertext: name + "Defensive", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && !KDEnemyHasFlag(enemy, "Defensive") && !KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Defensive", -1);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.HelpMe = {playertext: name + "HelpMe", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDHelpless(enemy)
				&& !KDEnemyHasFlag(enemy, "NoHelp") && !KDEnemyHasFlag(enemy, "HelpMe") && KinkyDungeonAllRestraint().length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "HelpMe_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!KDEnemyHasFlag(enemy, "NoHelp")
							&& KDRandom() < (KDPersonalitySpread(125, 85, 25) - KinkyDungeonGoddessRep.Ghost + KDGetModifiedOpinion(enemy) + (KinkyDungeonStatsChoice.get("Dominant") ? 25 : 0))/100 * (KDPersonalitySpread(0.0, -0.25, -0.5) + (KDAllied(enemy) ? 2.0 : 1.0))
						) {
							KinkyDungeonChangeRep("Ghost", 3);
							KinkyDungeonSetEnemyFlag(enemy, "HelpMe", 30);
							KinkyDungeonSetEnemyFlag(enemy, "wander", 30);
						} else {
							KDGameData.CurrentDialogMsg = name + "HelpMe_Fail";
							KinkyDungeonSetEnemyFlag(enemy, "NoHelp", 100);

							KinkyDungeonSetEnemyFlag(enemy, "playLikely", 10);
							KinkyDungeonChangeRep("Ghost", 1);
						}
					}
					return false;
				},
				leadsToStage: "",
				dontTouchText: true,
			},
			"Leave": {playertext: name + "HelpMe_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.HelpMeCommandWord = {playertext: name + "HelpMeCommandWord", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker && enemy.Enemy.unlockCommandLevel > 0) {
				return !KDHostile(enemy) && enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDHelpless(enemy)
				&& !KDEnemyHasFlag(enemy, "NoHelpCommandWord") && !KDEnemyHasFlag(enemy, "commandword")
				&& KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "HelpMeCommandWord_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!KDEnemyHasFlag(enemy, "NoHelpCommandWord")
							&& KDRandom() < (KDPersonalitySpread(125, 85, 25) - KinkyDungeonGoddessRep.Ghost + KDGetModifiedOpinion(enemy) + (KinkyDungeonStatsChoice.get("Dominant") ? 25 : 0))/100 * (KDPersonalitySpread(0.0, -0.25, -0.5) + (KDAllied(enemy) ? 2.0 : 1.0))
						) {
							KinkyDungeonChangeRep("Ghost", 3);
							if (KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0) {
								for (let r of KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks, true)) {
									KinkyDungeonLock(r, "");
								}
							}
							const unlockSpell = KinkyDungeonFindSpell("EffectEnemyCM" + (enemy?.Enemy?.unlockCommandLevel || 1), true) || KinkyDungeonFindSpell("EffectEnemyCM1", true);
							KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, unlockSpell, undefined, undefined, undefined);

							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
							KinkyDungeonSetEnemyFlag(enemy, "commandword", enemy.Enemy.unlockCommandCD || 90);
						} else {
							KDGameData.CurrentDialogMsg = name + "HelpMeCommandWord_Fail";
							KinkyDungeonSetEnemyFlag(enemy, "NoHelpCommandWord", 100);
							KinkyDungeonChangeRep("Ghost", 1);
						}
					}
					return false;
				},
				leadsToStage: "",
				dontTouchText: true,
			},
			"Leave": {playertext: name + "HelpMeCommandWord_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.HelpMeKey = {playertext: name + "HelpMeKey", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDHelpless(enemy)
				&& !KDEnemyHasFlag(enemy, "NoHelpKey") && enemy.items && enemy.items.includes("RedKey") && KinkyDungeonPlayerGetRestraintsWithLocks(KDKeyedLocks).length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "HelpMeKey_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!KDEnemyHasFlag(enemy, "NoHelpKey")
							&& KDRandom() < (KDPersonalitySpread(125, 85, 25) - KinkyDungeonGoddessRep.Ghost + KDGetModifiedOpinion(enemy) + (KinkyDungeonStatsChoice.get("Dominant") ? 25 : 0))/100 * (KDPersonalitySpread(0.0, -0.25, -0.5) + (KDAllied(enemy) ? 2.0 : 1.0))
						) {
							KinkyDungeonChangeRep("Ghost", 3);
							KDAddConsumable("RedKey", 1);
							if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
							enemy.items.splice(enemy.items.indexOf("RedKey"), 1);
						} else {
							KDGameData.CurrentDialogMsg = name + "HelpMeKey_Fail";
							KinkyDungeonSetEnemyFlag(enemy, "NoHelpKey", 100);
							KinkyDungeonChangeRep("Ghost", 1);
						}
					}
					return false;
				},
				leadsToStage: "",
				dontTouchText: true,
			},
			"Leave": {playertext: name + "HelpMeKey_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.DontHelpMe = {playertext: name + "DontHelpMe", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDEnemyHasFlag(enemy, "NoHelp") && KDEnemyHasFlag(enemy, "HelpMe") && KinkyDungeonAllRestraint().length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "DontHelpMe_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KinkyDungeonSetEnemyFlag(enemy, "HelpMe", 0);
						KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: name + "DontHelpMe_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	dialog.options.JoinParty = {playertext: name + "JoinParty", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			if (KDGameData.Party?.length >= KDGameData.MaxParty) return false;
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDAllied(enemy)
					&& !KDIsInParty(enemy)
					&& !KDEnemyHasFlag(enemy, "shop")
					&& !enemy.Enemy.tags?.peaceful
					&& !enemy.maxlifetime
					&& KDCapturable(enemy)
					&& !enemy.Enemy.allied;
				// No shopkeepers, noncombatants, or summons...
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 0);
				KDAddToParty(enemy);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.RemoveParty = {playertext: name + "RemoveParty", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDIsInParty(enemy);
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", -1);
				KDRemoveFromParty(enemy, false);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	KDAllyDialog[name] = {name: name, tags: requireTags, singletag: requireSingleTag, excludeTags: excludeTags, weight: weight};
	return dialog;
}


let KDPrisonRescues: Record<string, {speaker: string, faction: string}> = {};


/**
 * @param name
 * @param faction
 * @param enemytypes
 */
function KDPrisonerRescue(name: string, faction: string, enemytypes: string[]): KinkyDialogue {
	let dialogue: KinkyDialogue = {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonInterruptSleep();
			let door = KDGetJailDoor(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (door) {
				if (door.tile) {
					door.tile.OGLock = door.tile.Lock;
					door.tile.Lock = undefined;
					KDUpdateDoorNavMap();
				}
				KinkyDungeonMapSet(door.x, door.y, 'd');
				let e = DialogueCreateEnemy(door.x, door.y, enemytypes[0]);
				e.allied = 9999;
				e.faction = "Player";
				KDGameData.CurrentDialogMsgSpeaker = e.Enemy.name;

				let reinforcementCount = Math.floor(1 + KDRandom() * (KDGameData.PriorJailbreaks ? (Math.min(5, KDGameData.PriorJailbreaks) + 1) : 1));
				KDGameData.PriorJailbreaks += 1;
				for (let i = 0; i < reinforcementCount; i++) {
					let pp = KinkyDungeonGetNearbyPoint(door.x, door.y, true, undefined, undefined);
					if (pp) {
						let ee = DialogueCreateEnemy(pp.x, pp.y, enemytypes[1] || enemytypes[0]);
						ee.allied = 9999;
						ee.faction = "Player";
					}
				}
			}
			KDGameData.GuardSpawnTimer = 50 + Math.floor(KDRandom() * 10);
			return false;
		},
		options: {
			"Leave": {
				playertext: "Leave", response: "Default",
				exitDialogue: true,
			},
		}
	};
	KDPrisonRescues[name] = {
		speaker: enemytypes[0],
		faction: faction,
	};
	return dialogue;
}

// ["wolfGear", "wolfRestraints"]
function KDRecruitDialogue (
	name:                  string,
	faction:               string,
	outfitName:            string,
	goddess:               string,
	restraints:            string[],
	restraintscount:       number,
	restraintsAngry:       string[],
	restraintscountAngry:  number,
	requireTags:           string[],
	requireSingleTag:      string[],
	excludeTags:           string[],
	chance:                number
): KinkyDialogue
{
	/**
	 */
	let recruit: KinkyDialogue = {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag(name, -1, 1);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							KDPleaseSpeaker(0.5);
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							KinkyDungeonChangeRep("Ghost", 2);
							for (let i = 0; i < restraintscount; i++) {
								let r = KinkyDungeonGetRestraint({tags: restraints}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
								if (r) KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
							}
							let outfit = {name: outfitName, type: Outfit, id: KinkyDungeonGetItemID()};
							if (!KinkyDungeonInventoryGet(outfitName)) KinkyDungeonInventoryAdd(outfit);
							//if (KinkyDungeonInventoryGet("OutfitDefault")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("OutfitDefault"));
							KinkyDungeonSetDress(outfitName, outfitName);
							KinkyDungeonSetFlag("Recruit_" + name, -1);
							KinkyDungeonSetFlag("Recruited", -1);
							KDChangeFactionRelation("Player", faction, 0.4, true);
							KDChangeFactionRelation("Player", faction, -0.2);
							KDGameData.SlowMoveTurns = 3;
							KinkyDungeonSleepTime = CommonTime() + 200;
							KinkyDungeonSetFlag(name, -1, 1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							let diff = KinkyDungeonStatsChoice.has("Dominant") ? 0 : 35;
							if (KDBasicCheck([goddess], ["Ghost"]) <= diff) {
								KDGameData.CurrentDialogStage = "Force";
								KDGameData.CurrentDialogMsg = name + "ForceYes";
								KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck([goddess], ["Ghost"]));
								KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
							}
							KinkyDungeonChangeRep("Ghost", -1);
							KinkyDungeonSetFlag(name, -1, 1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"No": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					let diff = KinkyDungeonStatsChoice.has("Dominant") ? 0 : 45;
					if (KDBasicCheck(["Metal"], ["Ghost"]) <= diff) {
						KDGameData.CurrentDialogStage = "Force";
						KDGameData.CurrentDialogMsg = "";
						KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck([goddess], ["Ghost"]));
						KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
					}
					KinkyDungeonChangeRep("Ghost", -1);
					KinkyDungeonSetFlag(name, -1, 1);
					return false;
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Force": {gag: true, playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							KDPleaseSpeaker(0.08);
							KinkyDungeonChangeRep("Ghost", 2);
							let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
							for (let i = 0; i < restraintscount; i++) {
								let r = KinkyDungeonGetRestraint({tags: restraints}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
								if (r) KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
							}
							let outfit = {name: outfitName, type: Outfit, id: KinkyDungeonGetItemID()};
							if (!KinkyDungeonInventoryGet(outfitName)) KinkyDungeonInventoryAdd(outfit);
							//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
							KinkyDungeonSetDress(outfitName, outfitName);
							KinkyDungeonSetFlag("Recruit_" + name, -1);
							KinkyDungeonSetFlag("Recruited", -1);
							KDChangeFactionRelation("Player", faction, 0.4, true);
							KDChangeFactionRelation("Player", faction, -0.2);
							KDGameData.SlowMoveTurns = 3;
							KinkyDungeonSleepTime = CommonTime() + 200;
							KinkyDungeonSetFlag(name, -1, 1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							let percent = KDGameData.CurrentDialogMsgValue.Percent;
							KinkyDungeonChangeRep("Ghost", -1);
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = name + "Force_Failure";
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								for (let i = 0; i < restraintscountAngry; i++) {
									let r = KinkyDungeonGetRestraint({tags: restraintsAngry}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
									if (r) KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
								}
								let outfit = {name: outfitName, type: Outfit, id: KinkyDungeonGetItemID()};
								if (!KinkyDungeonInventoryGet(outfitName)) KinkyDungeonInventoryAdd(outfit);
								//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
								KinkyDungeonSetDress(outfitName, outfitName);
								KDGameData.SlowMoveTurns = 3;
								KinkyDungeonSleepTime = CommonTime() + 200;
							} else {
								KDIncreaseOfferFatigue(10);
								let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
								if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
									KDMakeHostile(enemy);
									//KinkyDungeonChangeRep(goddess, -2);
								}
							}
							KinkyDungeonSetFlag(name, -1, 1);
							return false;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},},
				},
			},
		}
	};

	KDRecruitDialog[name] = {name: name, outfit: outfitName, tags: requireTags, singletag: requireSingleTag, excludeTags: excludeTags, chance: chance};
	KDDialogueTriggers[name] = KDRecruitTrigger(name, KDRecruitDialog[name]);
	return recruit;
}

let KDMaxSellItems = 6;
// A shop where the NPC buys items
function KDShopDialogue(name: string, items: string[], requireTags: string[], requireSingleTag: string[], chance: number, itemsdrop: string[]): KinkyDialogue {
	let shop: KinkyDialogue = {
		inventory: true,
		response: "Default",
		clickFunction: (_gagged, _player) => {
			/*let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Shop", 0);
			}*/
			let bonus = 1;
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				bonus = 1 / KDGetShopCost(enemy, true);
			}
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				KDGameData.CurrentDialogMsgData["Item"+i] = KDGetItemNameString(item);
				KDGameData.CurrentDialogMsgValue["ItemCost"+i] = Math.round(Math.min(bonus, 3.0) * KinkyDungeonItemCost(KDItem({name: item}), true, true));
				KDGameData.CurrentDialogMsgData["ItemCost"+i] = "" + KDGameData.CurrentDialogMsgValue["ItemCost"+i];
			}
			return false;
		},
		options: {},
	};
	shop.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
				KinkyDungeonSetEnemyFlag(enemy, "NoTalk", 8);
			}
			return false;
		},
	};
	shop.options.Buy = {playertext: "ItemShopBuy", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (enemy.items?.length > 0) return true;
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let e = KDGetSpeaker();
			KDStartDialog("ShopBuy", e.Enemy.name, true, e.personality, e);
			return true;
		},
	};
	shop.options.Attack = {gag: true, playertext: "ItemShopAttack", response: "Default",
		options: {
			"Confirm": {playertext: "ItemShopAttack_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDMakeHostile(enemy);
						KinkyDungeonChangeRep("Ghost", -5);
						if (!KinkyDungeonHiddenFactions.has(KDGetFactionOriginal(enemy)))
							KinkyDungeonChangeFactionRep(KDGetFactionOriginal(enemy), -0.06);
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: "ItemShopAttack_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};

	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		shop.options["Item" + i] = {playertext: "ItemShop" + i, response: name + item,
			prerequisiteFunction: (_gagged, _player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				return KinkyDungeonInventoryGetSafe(item) != undefined && enemy && !KDHelpless(enemy);
			},
			greyoutFunction: (_gagged, _player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					return KDGameData.CurrentDialogMsgValue["ItemCost"+i] < enemy.gold;
				}
				return false;
			},
			greyoutTooltip: "KDNotEnoughMoneyVendor",
			clickFunction: (_gagged, _player) => {
				let itemInv = KinkyDungeonInventoryGetSafe(item);
				if (itemInv.type == Consumable)
					KinkyDungeonChangeConsumable(KDConsumable(itemInv), -1);
				else KinkyDungeonInventoryRemoveSafe(itemInv);
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					let faction = KDGetFactionOriginal(enemy);
					if (!KinkyDungeonHiddenFactions.has(faction)) {
						KinkyDungeonChangeFactionRep(faction, Math.max(0.0001, KDGameData.CurrentDialogMsgValue["ItemCost"+i] * 0.00005));
					}
					if (!enemy.items) enemy.items = [];
					enemy.items.push(itemInv.name);
				}
				KinkyDungeonAddGold(KDGameData.CurrentDialogMsgValue["ItemCost"+i]);
				KDPleaseSpeaker(0.05 * (KDGameData.CurrentDialogMsgValue["ItemCost"+i]/100));
				enemy.gold = enemy.gold ? Math.max(0, enemy.gold - KDGameData.CurrentDialogMsgValue["ItemCost"+i]) : 0;
				return false;
			},
			leadsToStage: "", dontTouchText: true,
		};
	}
	KDShops[name] = {name: name, tags: requireTags, singletag: requireSingleTag, chance: chance, items: items, itemsdrop: itemsdrop};
	return shop;
}

// The dialogue for allies sellin g you their inventory
function KDShopBuyDialogue(name: string): KinkyDialogue {
	let shop: KinkyDialogue = {
		inventory: true,
		response: "Default",
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			let items: string[] = [];
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (enemy.items?.length > 0) items = enemy.items;
			}
			// Non-shopkeepers gouge you
			let shopCost = KDGetShopCost(enemy, false);
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let itemMult = shopCost;
				KDGameData.CurrentDialogMsgData["ITM_"+i+"_"] = KDGetItemNameString(item);
				KDGameData.CurrentDialogMsgValue["IC_"+i+"_"] = Math.round(itemMult *
					KinkyDungeonItemCost(KDItem({name: item})));
				KDGameData.CurrentDialogMsgData["IC_"+i+"_"] = "" + KDGameData.CurrentDialogMsgValue["IC_"+i+"_"];
				//}
			}
			return false;
		},
		options: {},
	};
	shop.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
				KinkyDungeonSetEnemyFlag(enemy, "NoTalk", 8);
			}
			return false;
		},
	};
	shop.options.Sell = {playertext: "ShopBuySell", response: "Default",
		prerequisiteFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				for (let shp of Object.values(KDShops)) {
					if (KDEnemyHasFlag(enemy, shp.name)) {
						KDStartDialog(shp.name, enemy.Enemy.name, true, enemy.personality, enemy);
						return true;
					}
				}
			}
		},
	};
	shop.options.Attack = {gag: true, playertext: "ItemShopAttack", response: "Default",
		options: {
			"Confirm": {playertext: "ItemShopAttack_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDMakeHostile(enemy);
						KinkyDungeonChangeRep("Ghost", -5);
						if (!KinkyDungeonHiddenFactions.has(KDGetFactionOriginal(enemy)))
							KinkyDungeonChangeFactionRep(KDGetFactionOriginal(enemy), -0.06);
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: "ItemShopAttack_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};
	let maxNum = 100;
	// Delayed so we can load the dialogue first
	let _KDModsAfterLoad = KDModsAfterLoad;
	KDModsAfterLoad = () => {
		for (let i = 0; i < maxNum; i++) {
			addTextKey("dShopBuyItem" + i, TextGet("dShopBuy")
				.replace("#", "_"+i+"_")
				.replace("#", "_"+i+"_")
			);
		}
		_KDModsAfterLoad();
	};
	for (let i = 0; i < maxNum; i++) {
		shop.options["Item" + i] = {playertext: "ShopBuyItem" + i, response: name + "Item",
			prerequisiteFunction: (_gagged, _player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				let items: string[] = [];
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					if (enemy.items?.length > 0) items = enemy.items;
				}
				if (items.length > i) {
					let item = items[i];

					// Don't sell what we want to buy
					let shops = Object.values(KDShops).filter((shp) => {return KDEnemyHasFlag(enemy, shp.name);});

					for (let shp of shops) {
						if (shp.items?.includes(item)) return false;
					}

					let itemInv = KinkyDungeonInventoryGet(item);
					return (item && (!itemInv || itemInv.type == Consumable || itemInv.type == LooseRestraint));
				}
				return false;
			},
			clickFunction: (_gagged, _player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				let items: string[] = [];
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					if (enemy.items?.length > 0) items = enemy.items;
				}
				let item = items[i];
				let tooSubby = ((KinkyDungeonGoddessRep.Ghost + 50) / 10) > KDItemSubThreshold(item);
				if (!tooSubby && KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue["IC_"+i + "_"]) {
					KinkyDungeonItemEvent({name: item, amount: 1}, true);

					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let faction = KDGetFactionOriginal(enemy);
						if (!KinkyDungeonHiddenFactions.has(faction)) {
							KinkyDungeonChangeFactionRep(faction, Math.max(0.00005, KDGameData.CurrentDialogMsgValue["IC_"+i + "_"] * 0.00005));
						}
						enemy.items.splice(i, 1);
					}
					KinkyDungeonAddGold(-KDGameData.CurrentDialogMsgValue["IC_"+i + "_"]);
					KDPleaseSpeaker(0.025 * (KDGameData.CurrentDialogMsgValue["ItemCost"+i]/100));

					// Refresh list
					let shopCost = KDGetShopCost(enemy, false);
					for (let ii = 0; ii < enemy.items.length; ii++) {
						item = enemy.items[ii];
						let itemMult = shopCost;
						KDGameData.CurrentDialogMsgData["ITM_"+ii+"_"] = KDGetItemNameString(item);
						KDGameData.CurrentDialogMsgValue["IC_"+ii+"_"] = Math.round(itemMult *
							KinkyDungeonItemCost(KDItem({name: item})));
						KDGameData.CurrentDialogMsgData["IC_"+ii+"_"] = "" + KDGameData.CurrentDialogMsgValue["IC_"+ii+"_"];
						//}
					}
				} else {
					if (tooSubby) {
						KDGameData.CurrentDialogMsg = "ShopBuy_Fail";
					} else {
						KDGameData.CurrentDialogMsg = "ShopBuy_NoMoney";
					}
					if (enemy && KDShopPersonalities.includes(KDGetPersonality(enemy))) KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + KDGetPersonality(enemy);
				}
				return false;
			},
			leadsToStage: "", dontTouchText: true,
		};
	}
	//KDShops[name] = {name: name, tags: requireTags, singletag: requireSingleTag, chance: chance};
	return shop;
}

let KDOfferCooldown = 20;

type refuseFunc = (firstRefused: boolean) => boolean;

/**
 * @param setupFunction - firstRefused is if the player said no first. Happens after the user clicks
 * @param yesFunction - firstRefused is if the player said no then yes. Happens whenever the user submits
 * @param noFunction - firstRefused is if the player said no then no. Happens whenever the user successfully avoids
 * @param domFunction - firstRefused is if the player said no then no. Happens when the user clicks the Dominant response
 */
function KDYesNoTemplate(setupFunction: refuseFunc, yesFunction: refuseFunc, noFunction: refuseFunc, domFunction: refuseFunc): KinkyDialogue {
	/**
	 */
	let dialogue: KinkyDialogue = {
		tags: ["BondageOffer"],
		response: "Default",
		clickFunction: (_gagged, _player) => {
			KinkyDungeonSetFlag("BondageOffer", KDOfferCooldown);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					return setupFunction(false);
				},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							return yesFunction(false);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							return noFunction(false);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (_gagged, _player) => {
							return domFunction(false);
						},
						prerequisiteFunction: (_gagged, _player) => {
							return !KinkyDungeonStatsChoice.get("Undeniable") && KDGetSpeaker()?.Enemy?.bound != undefined;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"No": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (_gagged, _player) => {
					return setupFunction(true);
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Force": {gag: true, playertext: "Default", response: "Default",
				prerequisiteFunction: (_gagged, _player) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							return yesFunction(true);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (_gagged, _player) => {
							return noFunction(true);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (_gagged, _player) => {
							return domFunction(true);
						},
						prerequisiteFunction: (_gagged, _player) => {
							return KDGetSpeaker()?.Enemy?.bound != undefined;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
		}
	};


	return dialogue;
}


/**
 * @param name
 * @param goddess
 * @param restraintTags
 * @param allowedPrisonStates
 * @param allowedPersonalities
 * @param requireTagsSingle
 * @param requireTagsSingle2
 * @param requireTags
 * @param excludeTags
 * @param requireFlags
 * @param excludeFlags
 * @param Lock
 * @param WeightMult
 */
function KDDialogueTriggerOffer (
	name:                  string,
	goddess:               string[],
	restraintTags:         string[],
	allowedPrisonStates:   string[],
	allowedPersonalities:  string[],
	requireTagsSingle:     string[],
	requireTagsSingle2:    string[],
	requireTags:           string[],
	excludeTags:           string[],
	requireFlags:          string[],
	excludeFlags:          string[],
	Lock:                  string =  "Red",
	WeightMult:            number =  1.0
): KinkyDialogueTrigger
{
	let trigger: KinkyDialogueTrigger = {
		dialogue: name,
		allowedPrisonStates: allowedPrisonStates,
		allowedPersonalities: allowedPersonalities,
		requireTagsSingle: requireTagsSingle,
		requireTagsSingle2: requireTagsSingle2,
		requireTags: requireTags,
		excludeTags: excludeTags,
		playRequired: true,
		nonHostile: true,
		noCombat: true,
		noAlly: true,
		talk: true,
		blockDuringPlaytime: false,
		onlyDuringPlay: true,
		allowPlayExceptionSub: true,
		prerequisite: (enemy, dist, AIData) => {
			return (KDDefaultPrereqs(enemy,
				AIData,
				dist,1.5,0.1,restraintTags,
				KDEnemyHasFlag(enemy, "allyOffer") || KDEnemyHasFlag(enemy, "forceOffer"), Lock));
		},
		weight: (_enemy, _dist) => {
			if (requireFlags && !requireFlags.some((element) => KinkyDungeonFlags.get(element))) {
				return 0;
			}
			if (excludeFlags && excludeFlags.some((element) => KinkyDungeonFlags.get(element))) {
				return 0;
			}
			return WeightMult * (1 + 0.4 * Math.max(...goddess.map((element) => {return (Math.abs(KinkyDungeonGoddessRep[element])/100);})));
		},
	};
	return trigger;
}

/**
 *
 * @param {string} name
 * @param {string[]} goddess
 * @param {string[]} antigoddess
 * @param {string[]} restraint
 * @param {number[]} diffSpread - 0 is yesfunction diff, 2 is nofunction diff, 1 is yesfunction dom (should be lower), 3 is nofunction dom (should be lower)
 * @param {number[]} OffdiffSpread - 0 is submissive diff, 1 is normal diff, 2 is dom diff, 3 is dom diff if you have dom personality (should be between 1 and 2)
 * @param {number} [count]
 * @param {number} [countAngry]
 * @param {string} [Lock]
 * @param {boolean} [Ally]
 * @param {{name: string, duration: number, floors?: number}[]} [Flags] - Sets flags on setup
 * @returns {KinkyDialogue}
 */
function KDYesNoBasic (
	name:           string,
	goddess:        string[],
	antigoddess:    string[],
	restraint:      string[],
	diffSpread:     number[],
	OffdiffSpread:  number[],
	count:          number = 1,
	countAngry:     number = 1,
	Lock:           string = "Red",
	Ally:           boolean = false,
	Flags:          { name: string, duration: number, floors?: number }[] = [],
	CurseList:      string = "", // Overrides Lock
): KinkyDialogue
{
	return KDYesNoTemplate(
		(refused) => { // Setup function. This is run when you click Yes or No in the start of the dialogue
			for (let f of Flags) {
				KinkyDungeonSetFlag(f.name, f.duration, f.floors);
			}
			// This is the restraint that the dialogue offers to add. It's selected from a set of tags. You can change the tags to change the restraint
			let r = KinkyDungeonGetRestraint(
				{tags: restraint},
				KDGetEffLevel() * 1.5 + KDGetOfferLevelMod(),
				(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				undefined,
				Lock,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				{
					allowLowPower: true
				});
			if (r) {
				KDGameData.CurrentDialogMsgData = {
					"Data_r": r.name,
					"RESTRAINT": KDGetRestraintName(r),
				};

				// Percent chance your dominant action ("Why don't you wear it instead?") succeeds
				// Based on a difficulty that is the sum of four lines
				// Dominant perk should help with this
				KDGameData.CurrentDialogMsgValue.PercentOff =
					KDOffensiveDialogueSuccessChance(KDBasicCheck(goddess, [])
					- (KDDialogueGagged() ? 60 : 40)
					- (KinkyDungeonStatsChoice.get("Undeniable") ? 100 : 0)
					- (KinkyDungeonStatsChoice.has("Dominant") ? 0 : 40)
					- KDPersonalitySpread(OffdiffSpread[0], OffdiffSpread[1], KinkyDungeonStatsChoice.has("Dominant") ? OffdiffSpread[3] : OffdiffSpread[2]));
				// Set the string to replace in the UI
				KDGameData.CurrentDialogMsgData.OFFPERC = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.PercentOff)}%`;
			}

			// If the player hits No first, this happens
			if (refused) {
				// Set up the difficulty of the check
				// This check basically determines if we switch to the Force stage where the speaker tries to force you
				let diff = KinkyDungeonStatsChoice.has("Dominant") ? diffSpread[1] : diffSpread[0];
				if (KinkyDungeonStatsChoice.get("Undeniable")) diff += 140;
				// Failure condition
				if (KDBasicCheck(goddess, antigoddess) <= diff) {
					KDGameData.CurrentDialogStage = "Force";
					KDGameData.CurrentDialogMsg = name + "ForceYes"; // This is different from OfferLatexForce_Yes, it's a more reluctant dialogue...
					// Set up percentage chance to resist
					KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(goddess, antigoddess, KinkyDungeonStatsChoice.get("Undeniable") ? -70 : 0));
					KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
				} else {
					// You succeed but get fatigue
					KDIncreaseOfferFatigue(10);
				}
				KinkyDungeonChangeRep(antigoddess[0], -1); // Reduce submission because of refusal
				KDAddOpinionPersistent(KDGetSpeaker().id, -5);
			}
			return false;
		},(refused) => { // Yes function. This happens if the user submits willingly
			if (!KinkyDungeonFlags.get("BoundOfferRep" + goddess[0])) {
				KinkyDungeonChangeRep(goddess[0], 1.5);
				KinkyDungeonSetFlag("BoundOfferRep" + goddess[0], -1, 1);
			}

			if (Ally)
				KDAllySpeaker(9999, true);
			else
				KDPleaseSpeaker(refused ? 0.012 : 0.024); // Less reputation if you refused
			KinkyDungeonChangeRep(antigoddess[0], refused ? 1 : 2); // Less submission if you refused
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			let curse: string = undefined;
			if (CurseList) {
				curse = KDGetByWeight(
					KinkyDungeonGetCurseByListWeighted(
						[CurseList],
						KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r).name,
						false,
						0,
						1000));

			}
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true, curse ? undefined : Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
				curse);
			KDAddOffer(1);
			let num = count;
			// Apply additional restraints
			if (num > 1) {
				let r = KinkyDungeonGetRestraint({tags: restraint},
					MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(),
					(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), undefined,
					curse ? undefined : Lock,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					curse,
					undefined,
					undefined,
					{
						allowLowPower: true
					});
				if (r)
					KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true,
				curse ? undefined : Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, curse);
			}
			return false;
		},(refused) => { // No function. This happens when the user refuses.
			// The first half is basically the same as the setup function, but only if the user did not refuse the first yes/no
			if (!refused) {
				// This check basically determines if we switch to the Force stage where the speaker tries to force you
				let diff = KinkyDungeonStatsChoice.has("Dominant") ? diffSpread[3] : diffSpread[2]; // Slightly harder because we refused
				if (KinkyDungeonStatsChoice.get("Undeniable")) diff += 140;
				// Failure condition
				if (KDBasicCheck(goddess, antigoddess) <= diff) {
					KDGameData.CurrentDialogStage = "Force";
					KDGameData.CurrentDialogMsg = "";
					// Set up percentage chance to resist
					KDGameData.CurrentDialogMsgValue.Percent = KDAgilityDialogueSuccessChance(KDBasicCheck(goddess, antigoddess, KinkyDungeonStatsChoice.get("Undeniable") ? -70 : 0));
					KDGameData.CurrentDialogMsgData.PERCENT = `${Math.round(100 * KDGameData.CurrentDialogMsgValue.Percent)}%`;
				} else {
					KDIncreaseOfferFatigue(10);
				}
				KinkyDungeonChangeRep(antigoddess[0], -1);
				KDAddOpinionPersistent(KDGetSpeaker().id, -5);
			} else { // If the user refuses we use the already generated success chance and calculate the result
				let percent = KDGameData.CurrentDialogMsgValue.Percent;
				KDAddOpinionPersistent(KDGetSpeaker().id, -5);
				if (KDRandom() > percent) { // We failed! You get tied tight
					KDIncreaseOfferFatigue(-20);
					KDGameData.CurrentDialogMsg = name + "Force_Failure";
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					let curse: string = undefined;
					if (CurseList) {
						curse = KDGetByWeight(
							KinkyDungeonGetCurseByListWeighted(
								[CurseList],
								KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r).name,
								false,
								0,
								1000));

					}
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true,
					curse ? undefined : Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, curse);
					KDAddOffer(1);
					let num = refused ? countAngry : count;
					// Apply additional restraints
					if (num > 1) {
						let r = KinkyDungeonGetRestraint({tags: restraint}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), undefined,
						curse ? undefined : Lock,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							undefined,
							curse,
							undefined,
							undefined,
							{
								allowLowPower: true
							});
						if (r)
							KinkyDungeonAddRestraintIfWeaker(r, ((enemy ? Math.min(10, enemy.Enemy.power) + KDEnemyRank(enemy) : 0) || 0), true,
						curse ? undefined : Lock, true, false, undefined,
						KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
						curse);
					}
				} else {
					KDIncreaseOfferFatigue(10);
				}
			}
			return false;
		},(_refused) => { // Dom function. This is what happens when you try the dominant option
			// We use the already generated percent chance
			let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
			if (KDRandom() > percent) {
				// If we fail, we aggro the enemy
				KDIncreaseOfferFatigue(-20);
				KDGameData.CurrentDialogMsg = "OfferDominantFailure";
				KDAggroSpeaker(100, true);
				KDAddOpinionPersistent(KDGetSpeaker().id, -12);
			} else {
				// If we succeed, we get the speaker enemy and bind them
				KDIncreaseOfferFatigue(10);
				KDAddOpinionPersistent(KDGetSpeaker().id, 25);
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					enemy.playWithPlayer = 0;
					enemy.playWithPlayerCD = 999;
					let amount = 10;
					if (!enemy.boundLevel) enemy.boundLevel = amount;
					else enemy.boundLevel += amount;
				}
				KinkyDungeonChangeRep(antigoddess[0], -4); // Reduce submission because dom
			}
			return false;
		});
}

/**
 * A shop where the seller sells items
 */
function KDSaleShop(name: string, items: string[], requireTags: string[], requireSingleTag: string[], chance: number, markup: number, itemsdrop?: string[], multiplier: number = 1): KinkyDialogue {
	if (!markup) markup = 1.0;
	let shop: KinkyDialogue = {
		response: "Default",
		clickFunction: (_gagged, _player) => {
			/*let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Shop", 0);
			}*/
			/*if (KDDialogueEnemy()) {
				let enemy = KDDialogueEnemy();
				if (!enemy.items)
					enemy.items = items;
			}*/
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				KDGameData.CurrentDialogMsgData["Item"+i] = KDGetItemNameString(item);
				KDGameData.CurrentDialogMsgValue["ItemCost"+i] = Math.round(KinkyDungeonItemCost(KDItem({name: item})) * markup);
				KDGameData.CurrentDialogMsgData["ItemCost"+i] = "" + KDGameData.CurrentDialogMsgValue["ItemCost"+i];
			}
			return false;
		},
		options: {},
	};
	shop.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (_gagged, _player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
				KinkyDungeonSetEnemyFlag(enemy, "NoTalk", 8);
			}
			return false;
		},
	};
	shop.options.Attack = {gag: true, playertext: "ItemShopAttack", response: "Default",
		options: {
			"Confirm": {playertext: "ItemShopAttack_Confirm", response: "Default",
				clickFunction: (_gagged, _player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDMakeHostile(enemy);
						KinkyDungeonChangeRep("Ghost", -5);
						if (!KinkyDungeonHiddenFactions.has(KDGetFactionOriginal(enemy)))
							KinkyDungeonChangeFactionRep(KDGetFactionOriginal(enemy), -0.06);
					}
					return false;
				},
				exitDialogue: true,
			},
			"Leave": {playertext: "ItemShopAttack_Leave", response: "Default",
				leadsToStage: "",
			},
		}
	};

	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		shop.options["Item" + i] = {playertext: "ItemShopBuy" + i, response: name + item,
			prerequisiteFunction: (_gagged, _player) => {
				return true;//KinkyDungeonInventoryGet(item) != undefined;
			},
			clickFunction: (_gagged, _player) => {
				let buy = false;
				if (KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue["ItemCost"+i]) {
					buy = true;
					if (!KDGiveItem(item, multiplier)) {
						KDGameData.CurrentDialogMsg = name + "_AlreadyHave";
						buy = false;
					}


					/*if (KDRestraint({name: item})) {
						// Sell the player a restraint
						let rest = KinkyDungeonGetRestraintByName(item);
						let Rname = rest.inventoryAs || rest.name;
						if (!KinkyDungeonInventoryGetLoose(Rname)) {
							KinkyDungeonInventoryAdd({name: Rname, type: LooseRestraint, events:rest.events, quantity: 1, id: KinkyDungeonGetItemID()});
						} else {
							if (!KinkyDungeonInventoryGetLoose(Rname).quantity) KinkyDungeonInventoryGetLoose(Rname).quantity = 0;
							KinkyDungeonInventoryGetLoose(Rname).quantity += 1;
						}
					} else if (KinkyDungeonFindBasic(item)) {
						KDAddBasic(KinkyDungeonFindBasic(item));
					} else if (KDConsumable({name: item})) {
						KinkyDungeonChangeConsumable(KDConsumable({name: item}), 1);
					} else if (KDWeapon({name: item})) {
						if (!KinkyDungeonInventoryGetWeapon(item)) {
							KinkyDungeonInventoryAddWeapon(item);
						} else {

						}
					}*/
				} else {
					KDGameData.CurrentDialogMsg = name + "_NoMoney";
				}

				if (buy) {
					KinkyDungeonAddGold(-KDGameData.CurrentDialogMsgValue["ItemCost"+i]);
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDPleaseSpeaker(0.05 * (KDGameData.CurrentDialogMsgValue["ItemCost"+i]/100));
						let faction = KDGetFactionOriginal(enemy);
						if (!KinkyDungeonHiddenFactions.has(faction)) {
							KinkyDungeonChangeFactionRep(faction, Math.max(0.0001, KDGameData.CurrentDialogMsgValue["ItemCost"+i] * 0.00025));
						}
					}
				}
				return false;
			},
			leadsToStage: "", dontTouchText: true,
		};
	}
	KDShops[name] = {name: name, tags: requireTags, singletag: requireSingleTag, chance: chance, items: items, itemsdrop: itemsdrop || items};
	return shop;
}

/*

					"Leave": {playertext: "Leave", exitDialogue: true}
				clickFunction: (_gagged, _player) => {KinkyDungeonStartChase(undefined, "Refusal");},

clickFunction: (_gagged, _player) => {
	KinkyDungeonChangeRep("Ghost", 3);
},*/

/**
 * Yoinks a nearby enemy and brings them next to x
 *
 * @param x
 * @param y
 * @param radius
 * @param [unaware]
 */
function DialogueBringNearbyEnemy(x: number, y: number, radius: number, unaware?: boolean): entity {
	let nearby = KDNearbyEnemies(x, y, radius);
	for (let e of nearby) {
		if (!KDHelpless(e)
			//&& KDistChebyshev(x - e.x, y - e.y) <= radius
			&& KinkyDungeonAggressive(e)
			&& !KDIsImmobile(e) && !e.Enemy.tags.temporary
			&& (!KDAIType[KDGetAI(e)]?.ambush || e.ambushtrigger)
			&& (!unaware || !e.aware)) {
			let point = KinkyDungeonNoEnemy(x, y, true) ? {x:x, y:y} : KinkyDungeonGetNearbyPoint(x, y, true);
			if (point) {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonDiscovered"), "#ff5277", 1);
				KDMoveEntity(e, point.x, point.y, true);
				return e;
			}
		}
	}
	return null;
}

/**
 * Yoinks a nearby enemy and brings them next to x
 *
 * @param x
 * @param y
 * @param enemy
 */
function DialogueBringSpecific(x: number, y: number, enemy: entity): entity {
	if (enemy) {
		let point = KinkyDungeonNoEnemy(x, y, true) ? {x:x, y:y} : KinkyDungeonGetNearbyPoint(x, y, true);
		if (point) {
			KDMoveEntity(enemy, point.x, point.y, true);
			enemy.path = undefined;
			enemy.gx = x;
			enemy.gy = y;
			return enemy;
		}
	}
	return null;
}

/**
 * Returns if you are submissive enough to be played with by this enemy
 * @param enemy
 */
function KDIsSubmissiveEnough(_enemy: entity): boolean {
	let diff = KDPersonalitySpread(20, -20, -51);
	if (KinkyDungeonGoddessRep.Ghost >= diff) return true;
	return false;
}


/**
 * @param enemy
 * @param [allowFaction] Optionally apply faction rep modifier
 * @param [allowSub] Optionally apply sub modifier
 * @param [allowPerk] Optionally apply perk modifiers
 * @param [allowOnlyPosNegFaction]
 */
function KDGetModifiedOpinion(enemy: entity, allowFaction: boolean = true, allowSub: boolean = true, allowPerk: boolean = true, allowOnlyPosNegFaction: number = 0): number {
	if (!enemy) return 0;
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
}

/**
 * @param Amount
 */
function KDAddOffer(Amount: number) {
	if (!KDGameData.OfferCount) KDGameData.OfferCount = 0;
	KDGameData.OfferCount += Amount;
}

function KDGetOfferLevelMod(): number {
	return Math.round(0.25 * (KDGameData.OfferCount || 0));
}

/**
 * @param player
 */
function KDRunChefChance(player: entity) {
	if (!KinkyDungeonFlags.get("SpawnedChef")) {
		let x = player.x;
		let y = player.y;
		if (KDRandom() < KDDialogueParams.ChefChance && KinkyDungeonGagTotal() == 0) {
			let point = KinkyDungeonGetNearbyPoint(x, y, true);
			if (point) {
				KinkyDungeonSetFlag("SpawnedChef", -1, 1);
				let e = DialogueCreateEnemy(point.x, point.y, "Chef");
				if (e) {
					KinkyDungeonSendTextMessage(10, TextGet("KDSpawnChef"), "#ff5277", 1);
					e.aware = true;
					e.faction = "Ambush";
				}
			}
		}
	}
}

/**
 * @param item
 * @param [nomult]
 */
function KDItemSubThreshold(item: string, nomult?: boolean): number {
	let mult = 1.0;
	if (!nomult) {
		if (KinkyDungeonStatsChoice.get("Oppression")) mult = 0.25;
		else if (KinkyDungeonStatsChoice.get("Dominant")) mult = 5;
	}
	if (item == "RedKey") return mult*0.4;
	if (item == "Pick") return mult*0.75;
	if (item == "BlueKey") return mult*0.1;
	if (KinkyDungeonFindConsumable(item)?.sub) return Math.max(0, 1 - mult*KinkyDungeonFindConsumable(item).rarity * KinkyDungeonFindConsumable(item).sub);
	if (KinkyDungeonFindWeapon(item)?.cutBonus) return Math.max(0, 1 - mult*KinkyDungeonFindWeapon(item)?.cutBonus*3);
}

function KDGetShopCost(enemy: entity, sell: boolean): number {
	let shopCost = KDEnemyHasFlag(enemy, "Shop") ? (sell ? 0.5 : 0.5) : 1.5 + (0.1 * MiniGameKinkyDungeonLevel);
	shopCost *= KinkyDungeonMultiplicativeStat(0.02*(KDGetModifiedOpinion(enemy) + (KDEnemyHasFlag(enemy, "Shop") ? 30 : 0)));
	shopCost += 1;
	return shopCost;
}

function KDAggroMapFaction() {
	if (KDMapData.JailFaction && KDMapData.JailFaction[0])
		KinkyDungeonAggroFaction(KDMapData.JailFaction[0]);
}
