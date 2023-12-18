"use strict";

let KDDialogueData = {
	CurrentDialogueIndex: 0,
};


/**
 *
 * @param {number} Min
 * @param {number} Avg
 * @param {number} Max
 * @param {entity} [Enemy]
 * @returns {number}
 */
function KDPersonalitySpread(Min, Avg, Max, Enemy) {
	return KDStrictPersonalities.includes(Enemy?.personality || KDGameData.CurrentDialogMsgPersonality) ? Max :
		(!KDLoosePersonalities.includes(Enemy?.personality || KDGameData.CurrentDialogMsgPersonality) ? Avg :
		Min);
}

function KinkyDungeonCanPutNewDialogue() {
	return !KDGameData.CurrentDialog && !KinkyDungeonFlags.get("NoDialogue");
}

function KDBasicCheck(PositiveReps, NegativeReps, Modifier = 0) {
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

function KDDialogueApplyPersonality(allowed) {
	if (allowed.includes(KDGameData.CurrentDialogMsgPersonality)) KDGameData.CurrentDialogMsg = KDGameData.CurrentDialogMsg + KDGameData.CurrentDialogMsgPersonality;
}

function KDGetDialogue() {
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


function KDDrawDialogue(delta) {
	KDDraw(kdcanvas, kdpixisprites, "dialogbg", KinkyDungeonRootDirectory + "DialogBackground.png", 500, 0, 1000, 1000, undefined, {
		zIndex: 111,
	});

	if (KDGameData.CurrentDialog && !(KDGameData.SlowMoveTurns > 0)) {
		KinkyDungeonDrawState = "Game";
		// Get the current dialogue and traverse down the tree
		let dialogue = KDGetDialogue();
		// Now that we have the dialogue, we check if we have a message
		if (dialogue.response && !KDGameData.CurrentDialogMsg) KDGameData.CurrentDialogMsg = dialogue.response;
		if (KDGameData.CurrentDialogMsg == "Default") KDGameData.CurrentDialogMsg = KDGameData.CurrentDialog + KDGameData.CurrentDialogStage;

		let gagged = KDDialogueGagged();

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
							DrawButtonKDEx(KDOptionOffset + "dialogue" + II, (bdata) => {
								if (notGrey) {
									KDOptionOffset = 0;
									KDDialogueData.CurrentDialogueIndex = 0;
									KDSendInput("dialogue", {dialogue: KDGameData.CurrentDialog, dialogueStage: KDGameData.CurrentDialogStage + ((KDGameData.CurrentDialogStage) ? "_" : "") + entries[i][0], click: true});
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
						DrawButtonKDEx("dialogueUP", (bdata) => {
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
						DrawButtonKDEx("dialogueDOWN", (bdata) => {
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
 * @param {number} Amount
 */
function KDIncreaseOfferFatigue(Amount) {
	if (!KDGameData.OfferFatigue) {
		KDGameData.OfferFatigue = 0;
	}
	KDGameData.OfferFatigue = Math.max(0, KDGameData.OfferFatigue + Amount);

	if (Amount > 0) KinkyDungeonSetFlag("OfferRefused", KDOfferCooldown * 2);
	if (Amount > 0) KinkyDungeonSetFlag("OfferRefusedLight", KDOfferCooldown * 5);
}

/**
 * @param {entity} enemy
 * @returns {number}
 */
function KDEnemyHelpfulness(enemy) {
	if (!enemy.personality) return 1.0;
	if (KDStrictPersonalities.includes(enemy.personality)) return 0.33;
	if (KDLoosePersonalities.includes(enemy.personality)) return 1.75;
}

/**
 *
 * @returns {entity}
 */
function KDGetSpeaker() {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		return enemy;
	}
	return null;
}

/**
 *
 * @returns {string}
 */
function KDGetSpeakerFaction() {
	let speaker = KDGetSpeaker();
	return speaker ? KDGetFactionOriginal(speaker) : undefined;
}

/**
 *
 * @param {number} Amount
 */
function KDPleaseSpeaker(Amount) {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		KDAddOpinion(enemy, Amount * 100);
		let faction = KDGetFactionOriginal(enemy);
		if (!KinkyDungeonHiddenFactions.includes(faction)) {
			KinkyDungeonChangeFactionRep(faction, Amount);
		}
	}
}

/**
 *
 * @param {entity} enemy
 * @param {number} Amount
 */
function KDAddOpinion(enemy, Amount) {
	if (!enemy) return;
	let a = Math.min(1000, Math.abs(Amount));
	while (a > 0) {
		enemy.opinion = Math.max((enemy.opinion || 0) + Math.min(10, a) * Math.min(10, a) / (Amount > 0 ? (Math.min(10, a) + (enemy.opinion || 0)) : -1), 0);
		a -= 10;
	}
}

function KDAllySpeaker(Turns, Follow) {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		KDAddOpinion(enemy, Turns);
		if (!(enemy.hostile > 0)) {
			enemy.allied = Turns;
			if (Follow) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 0);
			}
		}
	}
}

/**
 *
 * @param {number} Turns
 * @param {boolean} NoAlertFlag
 */
function KDAggroSpeaker(Turns = 300, NoAlertFlag = false) {
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
function KDBasicDialogueSuccessChance(checkResult) {
	return Math.max(0, Math.min(1.0, checkResult/100));
}

// Success chance for a basic dialogue
function KDAgilityDialogueSuccessChance(checkResult) {
	let evasion = KinkyDungeonPlayerEvasion();
	return Math.max(0, Math.min(1.0, (checkResult/100 - (KDGameData.OfferFatigue ? KDGameData.OfferFatigue /100 : 0) + 0.2 * Math.max(0, 3 - KinkyDungeonSlowLevel)) * evasion));
}

// Success chance for an offensive dialogue
function KDOffensiveDialogueSuccessChance(checkResult) {
	let accuracy = KinkyDungeonGetEvasion();
	return Math.max(0, Math.min(1.0, (checkResult/100 - (KDGameData.OfferFatigue ? KDGameData.OfferFatigue / 100 : 0)
		- 0.15 + 0.3 * Math.max(0, 3 - KinkyDungeonSlowLevel)) * accuracy));
}

let KinkyDungeonDialogueTimer = 0;

/**
 *
 * @param {string} Dialogue
 * @param {string} [Speaker]
 * @param {boolean} [Click]
 * @param {string} [Personality]
 * @param {entity} [enemy]
 */
function KDStartDialog(Dialogue, Speaker, Click, Personality, enemy) {
	KinkyDungeonInterruptSleep();
	KDDisableAutoWait();
	KinkyDungeonDialogueTimer = CommonTime() + 700 + KDGameData.SlowMoveTurns * 200;
	KDOptionOffset = 0;
	KinkyDungeonFastMovePath = [];
	KinkyDungeonDrawState = "Game";
	KDDialogueData.CurrentDialogueIndex = 0;


	KDDoDialogue({dialogue: Dialogue, dialogueStage: "", click: Click, speaker: Speaker, personality: Personality, enemy: enemy ? enemy.id : undefined});
}


function KDDoDialogue(data) {
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
	}
	if (data.personality)
		KDGameData.CurrentDialogMsgPersonality = data.personality;

	let dialogue = KDGetDialogue();
	if (!dialogue) {// Means we exited {
		KDGameData.CurrentDialog = "";
		KDGameData.CurrentDialogStage = "";
		return;
	}
	if (dialogue.data) KDGameData.CurrentDialogMsgData = dialogue.data;
	if (dialogue.response) KDGameData.CurrentDialogMsg = dialogue.response;
	if (dialogue.response == "Default") KDGameData.CurrentDialogMsg = KDGameData.CurrentDialog + KDGameData.CurrentDialogStage;
	if (dialogue.personalities) {
		KDDialogueApplyPersonality(dialogue.personalities);
	}
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
			}
		}
	}
}

/**
 *
 * @param {string} Dialogue
 * @param {string} [Speaker]
 * @param {boolean} [Click]
 * @param {string} [Personality]
 * @param {entity} [enemy]
 */
function KDStartDialogInput(Dialogue, Speaker, Click, Personality, enemy) {
	KinkyDungeonInterruptSleep();
	KDDisableAutoWait();
	KinkyDungeonDialogueTimer = CommonTime() + 700 + KDGameData.SlowMoveTurns * 200;
	KDOptionOffset = 0;
	KinkyDungeonFastMovePath = [];
	KinkyDungeonDrawState = "Game";
	KDDialogueData.CurrentDialogueIndex = 0;
	KDSendInput("dialogue", {dialogue: Dialogue, dialogueStage: "", click: Click, speaker: Speaker, personality: Personality, enemy: enemy ? enemy.id : undefined});
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
 *
 * @param {number} x
 * @param {number} y
 * @param {string} Name
 * @returns {entity}
 */
function DialogueCreateEnemy(x, y, Name) {
	if (KinkyDungeonEnemyAt(x, y)) KDKickEnemy(KinkyDungeonEnemyAt(x, y));
	let Enemy = KinkyDungeonGetEnemyByName(Name);
	let e = {summoned: true, Enemy: Enemy, id: KinkyDungeonGetEnemyID(),
		x:x, y:y,
		hp: (Enemy && Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};
	KDAddEntity(e);
	return e;
}

/**
 *
 * @returns {entity}
 */
function KDDialogueEnemy() {
	let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
	if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
		return enemy;
	}
	return null;
}



function KDAllyDialogue(name, requireTags, requireSingleTag, excludeTags, weight) {
	/**
		 * @type {KinkyDialogue}
		 */
	let dialog = {
		response: "Default",
		options: {},
	};

	dialog.options.Shop = {playertext: name + "Shop", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return enemy.items?.length > 0;
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
			}
			return false;
		},
	};
	dialog.options.Attack = {playertext: name + "Attack", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (!enemy || (enemy.aware && !enemy.playWithPlayer)) return true;
			return false;
		},
		options: {
			"Confirm": {playertext: name + "Attack_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!enemy.Enemy.allied) {
							let faction = KDGetFactionOriginal(enemy);
							if (faction == "Player") {
								enemy.faction = "Enemy"; // They become an enemy
							} else if (!KinkyDungeonHiddenFactions.includes(faction) && !enemy.Enemy.tags?.scenery) {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.playWithPlayer) return true;
			return false;
		},
		options: {
			"Confirm": {playertext: name + "Attack_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!enemy.Enemy.allied) {
							KDMakeHostile(enemy);
							let faction = KDGetFactionOriginal(enemy);
							if (!KinkyDungeonHiddenFactions.includes(faction)) {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && (enemy.aware || enemy.playWithPlayer)) return false;
			return true;
		},
		options: {
			"Confirm": {playertext: name + "AttackUnaware_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
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
	dialog.options.Flirt = {playertext: name + "Flirt", response: "Default",
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy)
				KDGameData.CurrentDialogMsg = name + "Flirt" + (!KDEnemyCanTalk(enemy) ? "Gagged" : (enemy.personality || ""));
			return false;
		},
		options: {
			"Leave": {playertext: "Leave", response: "Default",
				leadsToStage: "",
			},
			PlayRequest: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						return KinkyDungeonCanPlay(enemy) && !enemy.playWithPlayer;
					}
					return false;
				},
				clickFunction: (gagged, player) => {
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
			BondageOffer: {
				playertext: "Default", response: "Default", gag: true,
				prerequisiteFunction: (gagged, player) => {
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
						clickFunction: (gagged, player) => {
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
		}
	};
	dialog.options.LetMePass = {playertext: name + "LetMePass", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KinkyDungeonFlags.has("passthrough");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
				clickFunction: (gagged, player) => {
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
				clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDAllied(enemy) && !KDEnemyHasFlag(enemy, "NoFollow");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 9999);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.FollowMe = {playertext: name + "FollowMe", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDAllied(enemy) && KDEnemyHasFlag(enemy, "NoFollow") && !KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && KDEnemyHasFlag(enemy, "StayHere");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "StayHere", 0);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.StayHere = {playertext: name + "StayHere", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && !KDEnemyHasFlag(enemy, "StayHere") && !KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && KDEnemyHasFlag(enemy, "Defensive");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Defensive", 0);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.Defensive = {playertext: name + "Defensive", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && !KDEnemyHasFlag(enemy, "Defensive") && !KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Defensive", -1);
			}
			return false;
		},
		leadsToStage: "", dontTouchText: true,
	};
	dialog.options.HelpMe = {playertext: name + "HelpMe", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDHelpless(enemy)
				&& !KDEnemyHasFlag(enemy, "NoHelp") && !KDEnemyHasFlag(enemy, "HelpMe") && KinkyDungeonAllRestraint().length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "HelpMe_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker && enemy.Enemy.unlockCommandLevel > 0) {
				return !KDHostile(enemy) && enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDHelpless(enemy)
				&& !KDEnemyHasFlag(enemy, "NoHelpCommandWord") && !KDEnemyHasFlag(enemy, "commandword") && KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "HelpMeCommandWord_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
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

							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return !KDHostile(enemy) && enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDHelpless(enemy)
				&& !KDEnemyHasFlag(enemy, "NoHelpKey") && enemy.items && enemy.items.includes("RedKey") && KinkyDungeonPlayerGetRestraintsWithLocks(KDKeyedLocks).length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "HelpMeKey_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						if (!KDEnemyHasFlag(enemy, "NoHelpKey")
							&& KDRandom() < (KDPersonalitySpread(125, 85, 25) - KinkyDungeonGoddessRep.Ghost + KDGetModifiedOpinion(enemy) + (KinkyDungeonStatsChoice.get("Dominant") ? 25 : 0))/100 * (KDPersonalitySpread(0.0, -0.25, -0.5) + (KDAllied(enemy) ? 2.0 : 1.0))
						) {
							KinkyDungeonChangeRep("Ghost", 3);
							KinkyDungeonRedKeys += 1;
							if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return enemy.Enemy.bound && !enemy.Enemy.tags.nohelp && !KDEnemyHasFlag(enemy, "NoHelp") && KDEnemyHasFlag(enemy, "HelpMe") && KinkyDungeonAllRestraint().length > 0;
			}
			return false;
		},
		options: {
			"Confirm": {playertext: name + "DontHelpMe_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			if (KDGameData.Party?.length >= KDGameData.MaxParty) return false;
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDAllied(enemy) && !KDIsInParty(enemy) && !KDEnemyHasFlag(enemy, "shop") && !enemy.Enemy.tags?.peaceful && !enemy.Enemy.allied;
				// No shopkeepers, noncombatants, or summons...
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDIsInParty(enemy);
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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


/**
 * @type {Record<string, {speaker: string, faction: string}>}
 */
let KDPrisonRescues = {};


/**
 *
 * @param {string} name
 * @param {string} faction
 * @param {string[]} enemytypes
 * @returns {KinkyDialogue}
 */
function KDPrisonerRescue(name, faction, enemytypes) {
	/**
	 * @type {KinkyDialogue}
	 */
	let dialogue = {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonInterruptSleep();
			let door = KDGetJailDoor(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (door) {
				if (door.tile) {
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
function KDRecruitDialogue(name, faction, outfitName, goddess, restraints, restraintscount, restraintsAngry, restraintscountAngry, requireTags, requireSingleTag, excludeTags, chance) {
	/**
	 * @type {KinkyDialogue}
	 */
	let recruit = {
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag(name, -1, 1);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							KDPleaseSpeaker(0.1);
							KinkyDungeonChangeRep("Ghost", 2);
							for (let i = 0; i < restraintscount; i++) {
								let r = KinkyDungeonGetRestraint({tags: restraints}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
								if (r) KinkyDungeonAddRestraintIfWeaker(r, 0, true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
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
						clickFunction: (gagged, player) => {
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
				clickFunction: (gagged, player) => {
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
				prerequisiteFunction: (gagged, player) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							KDPleaseSpeaker(0.08);
							KinkyDungeonChangeRep("Ghost", 2);
							for (let i = 0; i < restraintscount; i++) {
								let r = KinkyDungeonGetRestraint({tags: restraints}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
								if (r) KinkyDungeonAddRestraintIfWeaker(r, 0, true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
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
						clickFunction: (gagged, player) => {
							let percent = KDGameData.CurrentDialogMsgValue.Percent;
							KinkyDungeonChangeRep("Ghost", -1);
							if (KDRandom() > percent) {
								// Fail
								KDIncreaseOfferFatigue(-20);
								KDGameData.CurrentDialogMsg = name + "Force_Failure";
								for (let i = 0; i < restraintscountAngry; i++) {
									let r = KinkyDungeonGetRestraint({tags: restraintsAngry}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
									if (r) KinkyDungeonAddRestraintIfWeaker(r, 0, true, undefined, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
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
									KinkyDungeonChangeRep(goddess, -2);
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
function KDShopDialogue(name, items, requireTags, requireSingleTag, chance, itemsdrop) {
	/**
	 * @type {KinkyDialogue}
	 */
	let shop = {
		inventory: true,
		response: "Default",
		clickFunction: (gagged, player) => {
			/*let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "Shop", 0);
			}*/
			let bonus = 1;
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				bonus = 1 / KDGetShopCost(enemy);
			}
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				KDGameData.CurrentDialogMsgData["Item"+i] = TextGet((KinkyDungeonGetRestraintByName(item) ? "Restraint" : "KinkyDungeonInventoryItem") + item);
				KDGameData.CurrentDialogMsgValue["ItemCost"+i] = Math.round(Math.min(bonus, 3.0) * KinkyDungeonItemCost(KinkyDungeonGetRestraintByName(item) || (KinkyDungeonFindConsumable(item) ? KinkyDungeonFindConsumable(item) : KinkyDungeonFindWeapon(item)), true, true));
				KDGameData.CurrentDialogMsgData["ItemCost"+i] = "" + KDGameData.CurrentDialogMsgValue["ItemCost"+i];
				//}
			}
			return false;
		},
		options: {},
	};
	shop.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
				KinkyDungeonSetEnemyFlag(enemy, "NoTalk", 8);
			}
			return false;
		},
	};
	shop.options.Buy = {playertext: "ItemShopBuy", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (enemy.items?.length > 0) return true;
			}
			return false;
		},
		clickFunction: (gagged, player) => {
			let e = KDGetSpeaker();
			KDStartDialog("ShopBuy", e.Enemy.name, true, e.personality, e);
			return true;
		},
	};
	shop.options.Attack = {gag: true, playertext: "ItemShopAttack", response: "Default",
		options: {
			"Confirm": {playertext: "ItemShopAttack_Confirm", response: "Default",
				clickFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDMakeHostile(enemy);
						KinkyDungeonChangeRep("Ghost", -5);
						if (!KinkyDungeonHiddenFactions.includes(KDGetFactionOriginal(enemy)))
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
			prerequisiteFunction: (gagged, player) => {
				return KinkyDungeonInventoryGetSafe(item) != undefined;
			},
			greyoutFunction: (gagged, player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					return KDGameData.CurrentDialogMsgValue["ItemCost"+i] < enemy.gold;
				}
				return false;
			},
			greyoutTooltip: "KDNotEnoughMoneyVendor",
			clickFunction: (gagged, player) => {
				let itemInv = KinkyDungeonInventoryGetSafe(item);
				if (itemInv.type == Consumable)
					KinkyDungeonChangeConsumable(KDConsumable(itemInv), -1);
				else KinkyDungeonInventoryRemoveSafe(itemInv);
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					let faction = KDGetFactionOriginal(enemy);
					if (!KinkyDungeonHiddenFactions.includes(faction)) {
						KinkyDungeonChangeFactionRep(faction, Math.max(0.0001, KDGameData.CurrentDialogMsgValue["ItemCost"+i] * 0.00005));
					}
					if (!enemy.items) enemy.items = [];
					enemy.items.push(itemInv.name);
				}
				KinkyDungeonAddGold(KDGameData.CurrentDialogMsgValue["ItemCost"+i]);
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
function KDShopBuyDialogue(name) {
	/**
	 * @type {KinkyDialogue}
	 */
	let shop = {
		inventory: true,
		response: "Default",
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			let items = [];
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				if (enemy.items?.length > 0) items = enemy.items;
			}
			// Non-shopkeepers gouge you
			let shopCost = KDGetShopCost(enemy);
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let itemMult = shopCost;
				KDGameData.CurrentDialogMsgData["ITM_"+i+"_"] = TextGet((KinkyDungeonGetRestraintByName(item) ? "Restraint" : "KinkyDungeonInventoryItem") + item);
				KDGameData.CurrentDialogMsgValue["IC_"+i+"_"] = Math.round(itemMult *
					KinkyDungeonItemCost(KinkyDungeonGetRestraintByName(item) || (KinkyDungeonFindConsumable(item) ? KinkyDungeonFindConsumable(item) : KinkyDungeonFindWeapon(item))));
				KDGameData.CurrentDialogMsgData["IC_"+i+"_"] = "" + KDGameData.CurrentDialogMsgValue["IC_"+i+"_"];
				//}
			}
			return false;
		},
		options: {},
	};
	shop.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				KinkyDungeonSetEnemyFlag(enemy, "NoShop", 9999);
				KinkyDungeonSetEnemyFlag(enemy, "NoTalk", 8);
			}
			return false;
		},
	};
	shop.options.Sell = {playertext: "ShopBuySell", response: "Default",
		prerequisiteFunction: (gagged, player) => {
			let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
			if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
				return KDEnemyHasFlag(enemy, "Shop");
			}
			return false;
		},
		clickFunction: (gagged, player) => {
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
				clickFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDMakeHostile(enemy);
						KinkyDungeonChangeRep("Ghost", -5);
						if (!KinkyDungeonHiddenFactions.includes(KDGetFactionOriginal(enemy)))
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
			prerequisiteFunction: (gagged, player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				let items = [];
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
			clickFunction: (gagged, player) => {
				let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
				let items = [];
				if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
					if (enemy.items?.length > 0) items = enemy.items;
				}
				let item = items[i];
				let tooSubby = ((KinkyDungeonGoddessRep.Ghost + 50) / 10) > KDItemSubThreshold(item);
				if (!tooSubby && KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue["IC_"+i + "_"]) {
					KinkyDungeonItemEvent({name: item, amount: 1}, true);

					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let faction = KDGetFactionOriginal(enemy);
						if (!KinkyDungeonHiddenFactions.includes(faction)) {
							KinkyDungeonChangeFactionRep(faction, Math.max(0.00005, KDGameData.CurrentDialogMsgValue["IC_"+i + "_"] * 0.000025));
						}
						enemy.items.splice(i, 1);
					}
					KinkyDungeonAddGold(-KDGameData.CurrentDialogMsgValue["IC_"+i + "_"]);

					// Refresh list
					let shopCost = KDGetShopCost(enemy);
					for (let ii = 0; ii < enemy.items.length; ii++) {
						item = enemy.items[ii];
						let itemMult = shopCost;
						KDGameData.CurrentDialogMsgData["ITM_"+ii+"_"] = TextGet((KinkyDungeonGetRestraintByName(item) ? "Restraint" : "KinkyDungeonInventoryItem") + item);
						KDGameData.CurrentDialogMsgValue["IC_"+ii+"_"] = Math.round(itemMult *
							KinkyDungeonItemCost(KinkyDungeonGetRestraintByName(item) || (KinkyDungeonFindConsumable(item) ? KinkyDungeonFindConsumable(item) : KinkyDungeonFindWeapon(item))));
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

/**
 *
 * @param {(firstRefused) => boolean} setupFunction - firstRefused is if the player said no first. Happens after the user clicks
 * @param {(firstRefused) => boolean} yesFunction - firstRefused is if the player said no then yes. Happens whenever the user submits
 * @param {(firstRefused) => boolean} noFunction - firstRefused is if the player said no then no. Happens whenever the user successfully avoids
 * @param {(firstRefused) => boolean} domFunction - firstRefused is if the player said no then no. Happens when the user clicks the Dominant response
 * @returns {KinkyDialogue}
 */
function KDYesNoTemplate(setupFunction, yesFunction, noFunction, domFunction) {
	/**
	 * @type {KinkyDialogue}
	 */
	let dialogue = {
		tags: ["BondageOffer"],
		response: "Default",
		clickFunction: (gagged, player) => {
			KinkyDungeonSetFlag("BondageOffer", KDOfferCooldown);
			return false;
		},
		options: {
			"Yes": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					return setupFunction(false);
				},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							return yesFunction(false);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							return noFunction(false);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged, player) => {
							return domFunction(false);
						},
						prerequisiteFunction: (gagged, player) => {
							return KDGetSpeaker()?.Enemy?.bound != undefined;
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
				},
			},
			"No": {gag: true, playertext: "Default", response: "Default",
				clickFunction: (gagged, player) => {
					return setupFunction(true);
				},
				options: {"Leave": {playertext: "Leave", exitDialogue: true}},
			},
			"Force": {gag: true, playertext: "Default", response: "Default",
				prerequisiteFunction: (gagged, player) => {return false;},
				options: {
					"Yes": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							return yesFunction(true);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},},
					"No": {gag: true, playertext: "Default", response: "Default",
						clickFunction: (gagged, player) => {
							return noFunction(true);
						},
						options: {"Leave": {playertext: "Leave", exitDialogue: true}},
					},
					"Dominant": {gag: true, playertext: "OfferDominant", response: "OfferDominantSuccess",
						clickFunction: (gagged, player) => {
							return domFunction(true);
						},
						prerequisiteFunction: (gagged, player) => {
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
 *
 * @param {string} name
 * @param {string[]} goddess
 * @param {string[]} allowedPrisonStates
 * @param {string[]} allowedPersonalities
 * @param {string[]} requireTagsSingle
 * @param {string[]} requireTags
 * @param {string[]} excludeTags
 * @param {string[]} requireFlags
 * @param {string[]} excludeFlags
 * @param {string[]} restraintTags
 * @param {string} Lock
 * @param {number} WeightMult
 * @returns {KinkyDialogueTrigger}
 */
function KDDialogueTriggerOffer(name, goddess, restraintTags, allowedPrisonStates, allowedPersonalities, requireTagsSingle, requireTagsSingle2, requireTags, excludeTags, requireFlags, excludeFlags, Lock = "Red", WeightMult = 1.0) {
	let trigger = {
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
		weight: (enemy, dist) => {
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
 * @param {number} count
 * @param {number} countAngry
 * @param {string} countAngry
 * @param {boolean} Ally
 * @param {{name: string, duration: number, floors?: number}[]} Flags - Sets flags on setup
 * @returns {KinkyDialogue}
 */
function KDYesNoBasic(name, goddess, antigoddess, restraint, diffSpread, OffdiffSpread, count = 1, countAngry = 1, Lock = "Red", Ally = false, Flags = []) {
	return KDYesNoTemplate(
		(refused) => { // Setup function. This is run when you click Yes or No in the start of the dialogue
			for (let f of Flags) {
				KinkyDungeonSetFlag(f.name, f.duration, f.floors);
			}
			// This is the restraint that the dialogue offers to add. It's selected from a set of tags. You can change the tags to change the restraint
			let r = KinkyDungeonGetRestraint({tags: restraint}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], undefined, Lock);
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
				KDAddOpinion(KDGetSpeaker(), -10);
			}
			return false;
		},(refused) => { // Yes function. This happens if the user submits willingly
			KinkyDungeonChangeRep(goddess[0], 1);
			if (Ally)
				KDAllySpeaker(9999, true);
			else
				KDPleaseSpeaker(refused ? 0.004 : 0.005); // Less reputation if you refused
			KinkyDungeonChangeRep(antigoddess[0], refused ? 1 : 2); // Less submission if you refused
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
			KDAddOffer(1);
			let num = count;
			// Apply additional restraints
			if (num > 1) {
				let r = KinkyDungeonGetRestraint({tags: restraint}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], undefined, Lock);
				if (r)
					KinkyDungeonAddRestraintIfWeaker(r, 0, true, Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
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
				KDAddOpinion(KDGetSpeaker(), -5);
			} else { // If the user refuses we use the already generated success chance and calculate the result
				let percent = KDGameData.CurrentDialogMsgValue.Percent;
				KDAddOpinion(KDGetSpeaker(), -10);
				if (KDRandom() > percent) { // We failed! You get tied tight
					KDIncreaseOfferFatigue(-20);
					KDGameData.CurrentDialogMsg = name + "Force_Failure";
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(KDGameData.CurrentDialogMsgData.Data_r), 0, true, Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
					KDAddOffer(1);
					let num = refused ? countAngry : count;
					// Apply additional restraints
					if (num > 1) {
						let r = KinkyDungeonGetRestraint({tags: restraint}, MiniGameKinkyDungeonLevel * 2 + KDGetOfferLevelMod(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], undefined, Lock);
						if (r)
							KinkyDungeonAddRestraintIfWeaker(r, 0, true, Lock, true, false, undefined, KDGetSpeakerFaction(), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined);
					}
				} else {
					KDIncreaseOfferFatigue(10);
				}
			}
			return false;
		},(refused) => { // Dom function. This is what happens when you try the dominant option
			// We use the already generated percent chance
			let percent = KDGameData.CurrentDialogMsgValue.PercentOff;
			if (KDRandom() > percent) {
				// If we fail, we aggro the enemy
				KDIncreaseOfferFatigue(-20);
				KDGameData.CurrentDialogMsg = "OfferDominantFailure";
				KDAggroSpeaker(100, true);
				KDAddOpinion(KDGetSpeaker(), -20);
			} else {
				// If we succeed, we get the speaker enemy and bind them
				KDIncreaseOfferFatigue(10);
				KDAddOpinion(KDGetSpeaker(), 25);
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
 * @returns {KinkyDialogue}
 */
function KDSaleShop(name, items, requireTags, requireSingleTag, chance, markup, itemsdrop) {
	if (!markup) markup = 1.0;
	let shop = {
		shop: true,
		response: "Default",
		clickFunction: (gagged, player) => {
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
				KDGameData.CurrentDialogMsgData["Item"+i] = TextGet((KinkyDungeonGetRestraintByName(item) ? "Restraint" : "KinkyDungeonInventoryItem") + item);
				KDGameData.CurrentDialogMsgValue["ItemCost"+i] = Math.round(KinkyDungeonItemCost(KinkyDungeonGetRestraintByName(item) || (KinkyDungeonFindConsumableOrBasic(item) ? KinkyDungeonFindConsumableOrBasic(item) : KinkyDungeonFindWeapon(item))) * markup);
				KDGameData.CurrentDialogMsgData["ItemCost"+i] = "" + KDGameData.CurrentDialogMsgValue["ItemCost"+i];
				//}
			}
			return false;
		},
		options: {},
	};
	shop.options.Leave = {playertext: "Leave", exitDialogue: true,
		clickFunction: (gagged, player) => {
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
				clickFunction: (gagged, player) => {
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						KDMakeHostile(enemy);
						KinkyDungeonChangeRep("Ghost", -5);
						if (!KinkyDungeonHiddenFactions.includes(KDGetFactionOriginal(enemy)))
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
			prerequisiteFunction: (gagged, player) => {
				return true;//KinkyDungeonInventoryGet(item) != undefined;
			},
			clickFunction: (gagged, player) => {
				let buy = false;
				if (KinkyDungeonGold >= KDGameData.CurrentDialogMsgValue["ItemCost"+i]) {
					buy = true;
					if (KinkyDungeonGetRestraintByName(item)) {
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
					} else if (KinkyDungeonFindConsumable(item)) {
						KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable(item), 1);
					} else if (KinkyDungeonFindWeapon(item)) {
						if (!KinkyDungeonInventoryGetWeapon(item)) {
							KinkyDungeonInventoryAddWeapon(item);
						} else {
							KDGameData.CurrentDialogMsg = name + "_AlreadyHave";
							buy = false;
						}
					}
				} else {
					KDGameData.CurrentDialogMsg = name + "_NoMoney";
				}

				if (buy) {
					KinkyDungeonAddGold(-KDGameData.CurrentDialogMsgValue["ItemCost"+i]);
					let enemy = KinkyDungeonFindID(KDGameData.CurrentDialogMsgID);
					if (enemy && enemy.Enemy.name == KDGameData.CurrentDialogMsgSpeaker) {
						let faction = KDGetFactionOriginal(enemy);
						if (!KinkyDungeonHiddenFactions.includes(faction)) {
							KinkyDungeonChangeFactionRep(faction, Math.max(0.0001, KDGameData.CurrentDialogMsgValue["ItemCost"+i] * 0.0001));
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
				clickFunction: (gagged, player) => {KinkyDungeonStartChase(undefined, "Refusal");},

clickFunction: (gagged, player) => {
	KinkyDungeonChangeRep("Ghost", 3);
},*/

/** Yoinks a nearby enemy and brings them next to x */
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {boolean} [unaware]
 * @returns {entity}
 */
function DialogueBringNearbyEnemy(x, y, radius, unaware) {
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
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonDiscovered"), "#ff0000", 1);
				KDMoveEntity(e, point.x, point.y, true);
				return e;
			}
		}
	}
	return null;
}

/** Yoinks a nearby enemy and brings them next to x */
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {entity} enemy
 * @returns {entity}
 */
function DialogueBringSpecific(x, y, enemy) {
	if (enemy) {
		let point = KinkyDungeonNoEnemy(x, y, true) ? {x:x, y:y} : KinkyDungeonGetNearbyPoint(x, y, true);
		if (point) {
			KDMoveEntity(enemy, point.x, point.y, true);
			return enemy;
		}
	}
	return null;
}

/**
 * Returns if you are submissive enough to be played with by this enemy
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDIsSubmissiveEnough(enemy) {
	let diff = KDPersonalitySpread(20, -20, -51);
	if (KinkyDungeonGoddessRep.Ghost >= diff) return true;
	return false;
}

/**
 *
 * @param {entity} enemy
 * @returns {number}
 */
function KDGetModifiedOpinion(enemy) {
	let op = enemy.opinion || 0;

	op += 30 * KDFactionRelation("Player", KDGetFaction(enemy));
	if (KinkyDungeonStatsChoice.get("Dominant") && enemy.personality && KDLoosePersonalities.includes(enemy.personality)) op += 12;
	if (KinkyDungeonStatsChoice.get("Oppression")) op -= 15;

	return op;
}

/**
 *
 * @param {number} Amount
 */
function KDAddOffer(Amount) {
	if (!KDGameData.OfferCount) KDGameData.OfferCount = 0;
	KDGameData.OfferCount += Amount;
}

/**
 * @returns {number}
 */
function KDGetOfferLevelMod() {
	return Math.round(0.25 * (KDGameData.OfferCount || 0));
}

/**
 *
 * @param {entity} player
 */
function KDRunChefChance(player) {
	if (!KinkyDungeonFlags.get("SpawnedChef")) {
		let x = player.x;
		let y = player.y;
		if (KDRandom() < KDDialogueParams.ChefChance && KinkyDungeonGagTotal() == 0) {
			let point = KinkyDungeonGetNearbyPoint(x, y, true);
			if (point) {
				KinkyDungeonSetFlag("SpawnedChef", -1, 1);
				let e = DialogueCreateEnemy(point.x, point.y, "Chef");
				if (e) {
					KinkyDungeonSendTextMessage(10, TextGet("KDSpawnChef"), "#ff0000", 1);
					e.aware = true;
					e.faction = "Ambush";
				}
			}
		}
	}
}

/**
 *
 * @param {string} item
 * @returns {number}
 */
function KDItemSubThreshold(item, nomult) {
	let mult = 1.0;
	if (!nomult) {
		if (KinkyDungeonStatsChoice.get("Oppression")) mult = 0.25;
		else if (KinkyDungeonStatsChoice.get("Dominant")) mult = 5;
	}
	if (item == "RedKey") return mult*0.4;
	if (item == "Lockpick") return mult*0.75;
	if (item == "BlueKey") return mult*0.1;
	if (KinkyDungeonFindConsumable(item)?.sub) return Math.max(0, 1 - mult*KinkyDungeonFindConsumable(item).rarity * KinkyDungeonFindConsumable(item).sub);
	if (KinkyDungeonFindWeapon(item)?.cutBonus) return Math.max(0, 1 - mult*KinkyDungeonFindWeapon(item)?.cutBonus*3);
}

function KDGetShopCost(enemy) {
	let shopCost = KDEnemyHasFlag(enemy, "Shop") ? 0.5 : 1.5 + (0.1 * MiniGameKinkyDungeonLevel);
	shopCost *= KinkyDungeonMultiplicativeStat(0.02*KDGetModifiedOpinion(enemy));
	shopCost += 1;
	return shopCost;
}

function KDAggroMapFaction() {
	if (KDMapData.JailFaction && KDMapData.JailFaction[0])
		KinkyDungeonAggroFaction(KDMapData.JailFaction[0]);
}