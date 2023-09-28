"use strict";


let KinkyDungeonAttackTwiceFlag = false;
let KinkyDungeonSlimeParts = [
	{group: "ItemHead", restraint: "SlimeHead", noUnmasked: true},
	{group: "ItemMouth", restraint: "SlimeMouth"},
	{group: "ItemArms", restraint: "SlimeArms"},
	{group: "ItemHands", restraint: "SlimeHands"},
	{group: "ItemLegs", restraint: "SlimeLegs"},
	{group: "ItemFeet", restraint: "SlimeFeet"},
	{group: "ItemBoots", restraint: "SlimeBoots"},
];
let KDAlertCD = 5;

let KDEventDataReset = {

};


let KDEventDataBase = {
	SlimeLevel: 0,
	SlimeLevelStart: 0,
};
let KDEventData = Object.assign({}, KDEventDataBase);

function KDMapHasEvent(map, event) {
	return map[event] != undefined;
}

function KinkyDungeonSendEvent(Event, data, forceSpell) {
	KinkyDungeonSendMagicEvent(Event, data, forceSpell);
	KinkyDungeonSendWeaponEvent(Event, data);
	KinkyDungeonSendInventorySelectedEvent(Event, data);
	KinkyDungeonSendInventoryIconEvent(Event, data);
	KinkyDungeonSendInventoryEvent(Event, data);
	KinkyDungeonSendBulletEvent(Event, data.bullet, data);
	KinkyDungeonSendBuffEvent(Event, data);
	KinkyDungeonSendOutfitEvent(Event, data);
	KinkyDungeonSendEnemyEvent(Event, data);
	KinkyDungeonHandleGenericEvent(Event, data);
}
/** Called during initialization */
function KinkyDungeonResetEventVariables() {
	KinkyDungeonHandleGenericEvent("resetEventVar", {});
}
/** Called every tick */
function KinkyDungeonResetEventVariablesTick(delta) {
	KDEventDataReset = {};
	KinkyDungeonAttackTwiceFlag = false;

	KinkyDungeonHandleGenericEvent("resetEventVarTick", {delta: delta});
}


/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, item, *): void>>}
 */
let KDEventMapInventoryIcon = {
	"icon": {
		"tintIcon": (e, item, data) => {
			if (item == data.item) {
				if (e.power > data.power) {
					data.power = e.power;
					if (e.color)
						data.color = e.color;
					if (e.bgcolor)
						data.bgcolor = e.bgcolor;
				}
			}
		},
	},
};
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} kinkyDungeonEvent
 * @param {item} item
 * @param {*} data
 */
function KinkyDungeonHandleInventoryIconEvent(Event, kinkyDungeonEvent, item, data) {
	if (Event === kinkyDungeonEvent.trigger && KDEventMapInventoryIcon[Event] && KDEventMapInventoryIcon[Event][kinkyDungeonEvent.type]) {
		KDEventMapInventoryIcon[Event][kinkyDungeonEvent.type](kinkyDungeonEvent, item, data);
	}
}

/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, item, *): void>>}
 */
let KDEventMapInventorySelected = {
	"inventoryTooltip": {
		"varModifier": (e, item, data) => {
			if (item == data.item) {
				data.extraLines.push(TextGet("KDVariableModifier_" + e.msg)
					.replace("AMNT", `${e.power >= 0 ? "+" : ""}${Math.round(e.power)}`)
					.replace("TYPE", `${e.kind}`));
				data.extraLineColor.push(e.color || "#ffffff");
				data.extraLineColorBG.push(e.bgcolor || "#000000");
			}
		},
	},
};
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} kinkyDungeonEvent
 * @param {item} item
 * @param {*} data
 */
function KinkyDungeonHandleInventorySelectedEvent(Event, kinkyDungeonEvent, item, data) {
	if (Event === kinkyDungeonEvent.trigger && KDEventMapInventorySelected[Event] && KDEventMapInventorySelected[Event][kinkyDungeonEvent.type]) {
		KDEventMapInventorySelected[Event][kinkyDungeonEvent.type](kinkyDungeonEvent, item, data);
	}
}


/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, item, *): void>>}
 */
let KDEventMapInventory = {
	"curseCount": {
		/**
		 * @param {KDEventData_CurseCount} data
		*/
		"add": (e, item, data) => {
			if (!data.activatedOnly || (KDGetCurse(item) && KDCurses[KDGetCurse(item)].activatecurse)) {
				data.count += e.power;
			}
		}
	},
	"postApply": {
		/**
		 * @param {KDEventData_PostApply} data
		*/
		"ControlHarness": (e, item, data) => {
			let itemAdded = data.item;
			let itemtags = KDRestraint(itemAdded)?.shrine;
			console.log(itemtags);
			// Ignore anything that isnt futuristic
			if (itemtags?.includes("Cyber")) {
				/*KinkyDungeonSendTextMessage(4,
					TextGet("KDControlHarnessTest"),
					"#ffffff",
					1,
				);*/

				for (let category of Object.values(KDControlHarnessCategories)) {
					if (category.activateTags.some((tag) => {return itemtags.includes(tag);})) {
						let restMap = new Map();
						for (let tag of category.activateTags) {
							for (let inv of KinkyDungeonGetRestraintsWithShrine(tag, false, true)) {
								if (!restMap.has(inv)) {
									restMap.set(inv, true);
								}
							}
						}
						category.updateFunction(e, item, data, [...restMap.keys()]);
						if (restMap.size == category.activateCount) {
							// ACTIVATE
							category.activateFunction(e, item, data, [...restMap.keys()]);
						}
					}
				}
			}
		},
		"EngageCurse": (e, item, data) => {
			if (item == data.item)
				KinkyDungeonSendEvent("EngageCurse", {});
		},
	},
	"calcOrgThresh": {
		"CurseSensitivity": (e, item, data) => {
			if (data.player == KinkyDungeonPlayerEntity) {
				data.threshold *= e.power;
			}
		}
	},
	"afterCalcManaPool": {
		"MultManaPoolRegen": (e, item, data) => {
			data.manaPoolRegen *= e.power;
		},
	},
	"calcMultMana": {
		"ManaCost": (e, item, data) => {
			data.cost = Math.max(data.cost * e.power, 0);
		},
	},
	"edge": {
		"CursedDenial": (e, item, data) => {
			KinkyDungeonSendTextMessage(5, TextGet("KDCursedDenialDeny" + Math.floor(KDRandom() * e.count)), "#9074ab", 10);
		},
	},
	"orgasm": {
		"CursedDenial": (e, item, data) => {
			KinkyDungeonSendTextMessage(5, TextGet("KDCursedDenialAllow" + Math.floor(KDRandom() * e.count)), "#9074ab", 10);
		},
		"CursedHeal": (e, item, data) => {
			if (item && KDGetCurse(item) == "CursedDamage" && KDIsEdged(KinkyDungeonPlayerEntity)) {
				let alreadyDone = KDItemDataQuery(item, "cursedDamage") || 0;
				if (alreadyDone > 0) {
					KinkyDungeonSendTextMessage(4, TextGet("KDCursedHeal"), "#9074ab", 2);
					alreadyDone = Math.max(0, alreadyDone - e.power*data.delta);
					KDItemDataSet(item, "cursedDamage", alreadyDone);
					KDItemDataSet(item, "cursedDamageCheckpoint", Math.floor(1+alreadyDone/10)*10);
				}
			}
		},
		"CurseSubmission": (e, item, data) => {
			if (data.player == KinkyDungeonPlayerEntity) {
				KinkyDungeonChangeRep("Ghost", e.power);
				KinkyDungeonSendTextMessage(3, TextGet("KDSubmissionCurseApply")
					.replace("RESTRAINTNAME", TextGet("Restraint" + item.name))
				, "#ceaaed", 10);
			}
		},
		"PunishEvent": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);

				KinkyDungeonSendEvent("punish", Object.assign({
					item: item,
					type: "orgasm",
					kind: e.kind || "low",
				}, data));

				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
	},
	"capture": {
		"ManaBounty": (e, item, data) => {
			if (data.attacker && data.attacker.player && data.enemy) {
				KinkyDungeonChangeMana(0, false, e.power);
			}
		}
	},
	"calcPlayChance": {
		"CurseAttraction": (e, item, data) => {
			if (data.enemy) {
				data.playChance += e.power;
				if (!data.enemy.playWithPlayer && data.enemy.playWithPlayerCD > 5) {
					data.enemy.playWithPlayerCD = 5;
				}
			}
		}
	},
	"changeDistraction": {
		"multDistractionPos": (e, item, data) => {
			if (data.Amount > 0)
				data.Amount *= e.power;
		},
	},
	"changeWill": {
		"multWillPos": (e, item, data) => {
			if (data.Amount > 0)
				data.Amount *= e.power;
		},
	},
	"changeStamina": {
		"multStaminaPos": (e, item, data) => {
			if (data.Amount > 0)
				data.Amount *= e.power;
		},
	},
	"getLights": {
		"ItemLight": (e, item, data) => {
			if (!e.prereq || KDCheckPrereq(undefined, e.prereq, e, data))
				data.lights.push({brightness: e.power, x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y,
					color: string2hex(e.color || "#ffffff")});
		},
	},
	"onWear": {
		"setSkinColor": (e, item, data) => {
			if (item == data.item) {
				data.color[0] = "#9A7F76";
				if (StandalonePatched) {
					if (KinkyDungeonPlayer && KinkyDungeonPlayer.Appearance) {
						let color = "#ff5555";//InventoryGet(KinkyDungeonPlayer, "BodyUpper").Color;
						if (color == "Asian") {
							data.color[0] = "#8B7B70";
						} else if (color == "Black") {
							data.color[0] = "#684832";
						}
					}
				} else {
					if (KinkyDungeonPlayer && KinkyDungeonPlayer.Appearance) {
						let color = InventoryGet(KinkyDungeonPlayer, "BodyUpper").Color;
						if (color == "Asian") {
							data.color[0] = "#8B7B70";
						} else if (color == "Black") {
							data.color[0] = "#684832";
						}
					}
				}
			}
		}
	},
	"afterDress": {
		"PrisonerJacket": (e, item, data) => {
			for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
				let asset = KinkyDungeonPlayer.Appearance[A].Asset;
				if (asset?.Name == KDRestraint(item).Asset) {
					KinkyDungeonPlayer.Appearance[A].Property = {
						"Text": "PATIENT",
						"Type": "ShortsAndStraps",
						"Block": [
							"ItemNipples",
							"ItemNipplesPiercings",
							"ItemTorso",
							"ItemBreast",
							"ItemHands",
							"ItemVulva",
							"ItemVulvaPiercings",
							"ItemButt",
							"ItemPelvis"
						],
						"Hide": [
							"Cloth",
							"ClothLower",
							"ItemNipplesPiercings",
							"ItemVulva",
							"ItemVulvaPiercings",
							"ItemButt",
							"Panties",
							"Corset"
						],
						"HideItemExclude": [
							"ClothLowerJeans1",
							"ClothLowerJeans2",
							"ClothLowerLatexPants1",
							"ClothLowerLeggings1",
							"ClothLowerLeggings2",
							"PantiesHarnessPanties1",
							"PantiesHarnessPanties2"
						]
					};
				}
			}
		},
	},
	"kill": {
		"MikoGhost": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (data.enemy && data.enemy.lifetime == undefined && data.enemy.playerdmg && !data.enemy.Enemy.tags.ghost && !data.enemy.Enemy.tags.construct) {
					KinkyDungeonSummonEnemy(data.enemy.x, data.enemy.y, "MikoGhost", 1, 1.5, true);
					KinkyDungeonSendTextMessage(5, TextGet("KDMikoCollarSummmon"), "purple", 2);
				}
			}
		},
		"DollmakerMask": (e, item, data) => {
			// if (item.player == data.player)
			if (data.enemy?.Enemy.tags.escapeddoll) KinkyDungeonSetFlag("DollmakerGrace", 70);
		},
		"CursedPunishment": (e, item, data) => {
			if (data.enemy && data.enemy.lifetime == undefined && data.enemy.playerdmg && data.enemy.Enemy.bound && !data.enemy.Enemy.nonHumanoid) {
				KDStunTurns(e.time, false);
				KinkyDungeonSendTextMessage(8, TextGet("KDCursedPunishment"), "#9074ab", e.time);
				KinkyDungeonMakeNoise(e.dist, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			}
		},
	},
	"drawSGTooltip": {
		"curseInfo": (e, item, data) => {
			if (item == data.item || KDRestraint(item)?.Group == data.group) {
				let curse = KDGetCurse(item);
				let pre = item == data.item ? "" : "[" + TextGet("Restraint" + item.name) + "] ";
				if (curse && KDCurses[curse].activatecurse && (!e.prereq || KDCheckPrereq(undefined, e.prereq, e, data))) {
					data.extraLines.push(pre + TextGet("curseInfo" + e.msg));
				} else {
					data.extraLines.push(pre + TextGet("curseInfoDormant"));
				}
				data.extraLineColor.push(e.color);
			}
		},

	},
	"perksBonus": {
		"spellDamage": (e, item, data) => {
			KDDamageAmpPerksSpell += e.power;
		},
	},
	"calcBlind": {
		"DollmakerMask": (e, item, data) => {
			if (!KinkyDungeonFlags.get("DollmakerGrace")) {
				// if item.player == data.player
				data.blindness = Math.max(data.blindness, 5);
				KinkyDungeonSendTextMessage(2, TextGet("KDDollmakerMaskDim"), "#ff5555", 2, true);
			}
		},
	},

	"draw": {
		"DollmakerMask": (e, item, data) => {
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;
			for (let enemy of KDMapData.Entities) {
				if (enemy.Enemy.tags.escapeddoll
					&& KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y) < 12) {
					KDDraw(kdcanvas, kdpixisprites, enemy.id + "_dolltarg", KinkyDungeonRootDirectory + "UI/DollmakerTarget.png",
						(enemy.visual_x - data.CamX - data.CamX_offset - 0.5) * KinkyDungeonGridSizeDisplay,
						(enemy.visual_y - data.CamY - data.CamY_offset - 0.5) * KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize * 2, KinkyDungeonSpriteSize * 2, undefined, {
							zIndex: 10,
						});
				}
			}

		},
	},
	"afterPlayerDamage": {
		"iceMelt": (e, item, data) => {
			if (KinkyDungeonMeltDamageTypes.includes(KDDamageEquivalencies[data.type] || data.type) && data.dmg > 0) {
				let alreadyDone = KDItemDataQuery(item, "iceMelt") || 0;
				if (alreadyDone < e.count) {
					alreadyDone += e.mult * data.dmg;
					KDItemDataSet(item, "iceMelt", alreadyDone);
					KinkyDungeonSendTextMessage(4, TextGet("KDIceMeltProgress").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				} else {
					KDCreateEffectTile(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
						name: "Water",
						duration: 12,
					}, 8);
					KDRemoveThisItem(item);
					KinkyDungeonSendTextMessage(4, TextGet("KDIceMelt").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			} else if (KinkyDungeonFreezeDamageTypes.includes(KDDamageEquivalencies[data.type] || data.type) && data.dmg > 0) {
				let alreadyDone = KDItemDataQuery(item, "iceMelt") || 0;
				if (alreadyDone > 0) {
					alreadyDone = Math.max(0, alreadyDone - e.subMult * data.dmg);
					KDItemDataSet(item, "iceMelt", alreadyDone);
					KinkyDungeonSendTextMessage(4, TextGet("KDIceMeltCancelProgress").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},
		"cursedDamage": (e, item, data) => {
			if (data.dmg > 0) {
				/** @type {number} */
				let alreadyDone = KDItemDataQuery(item, "cursedDamage") || 0;
				let count = KDItemDataQuery(item, "cursedDamageHP") || Math.round(e.power + KDRandom() * e.limit);
				KDItemDataSet(item, "cursedDamageHP", count);
				if (alreadyDone + e.mult * data.dmg < count) {
					alreadyDone += e.mult * data.dmg;
					KDItemDataSet(item, "cursedDamage", alreadyDone);
					if (alreadyDone >= KDItemDataQuery(item, "cursedDamageCheckpoint") || 0) {
						KinkyDungeonSendTextMessage(4, TextGet("KDcurseDamageDamage"), "#9074ab", 2, false, true);
					}
					KDItemDataSet(item, "cursedDamageCheckpoint", Math.floor(1+alreadyDone/10)*10);
				} else {
					KDCreateEffectTile(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
						name: "Smoke",
						duration: 3,
					}, 3);
					item.curse = undefined;
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonCurseUnlockCursedDamage").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},
		"CursedDistract": (e, item, data) => {
			if (data.dmg > 0) {
				if (data.dmg >= 3 || !KinkyDungeonPlayerBuffs.CursedDistract)
					KinkyDungeonSendTextMessage(2, TextGet("KDCursedDistractActivate"), "#9074ab", e.time);
				KinkyDungeonChangeDistraction(data.dmg * (e.mult || 0), false, 0.1);
				KinkyDungeonApplyBuffToEntity(data.player || KinkyDungeonPlayerEntity,
					{
						id: "CursedDistract",
						aura: "#9074ab",
						duration: e.time,
						power: e.power,
						type: "restore_ap",
					}
				);
			}
		},
	},
	"CurseTransform": {
		"transform": (e, item, data) => {
			// You can call CurseTransform with a forceItems to force one or more item to transform regardless of chance
			if (!e.chance || KDRandom() < e.chance || (data.forceItems && data.forceItems.includes(item))) {
				// In this first section we get the various lists
				let listname = e.cursetype || KDRestraint(data.curseditem)?.name || "Common";
				if (data.noDupe) {
					// TODO make it so no curses are duped
				}
				let selection = KDGetByWeight(KinkyDungeonGetHexByListWeighted(data.hexlist || listname, KDRestraint(item).name, false, data.hexlevelmin || 0, data.hexlevelmax || 10));
				let curse = KDGetByWeight(KinkyDungeonGetCurseByListWeighted([data.curselist || listname], KDRestraint(item).name, false, 0, 1000));

				// Load the current inventory variant
				/** @type {KDInventoryVariant} */
				let newvariant = JSON.parse(JSON.stringify(KinkyDungeonInventoryVariants[item.inventoryAs || item.name] || {}));
				/** @type {restraint} - New restraint to transform to*/
				let newRestraint = null;
				if (data.newRestraintTags) {
					newRestraint = KinkyDungeonGetRestraint({tags: [...data.newRestraintTags],},
						KDGetEffLevel(),
						KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], true, "",
						false, false, false, undefined, undefined, {
							allowedGroups: [KDRestraint(item).Group],
						}, undefined,
						curse || "");
				}
				// Add the new curse
				if (newRestraint) {
					newvariant.template = newRestraint.name;
				}
				newvariant.events = [...(newvariant.events || [])];
				// Trim off the transformation...
				if (!data.trimTrigger)
					newvariant.events = newvariant.events.filter((event) => {return event.trigger != "CurseTransform";});
				newvariant.events = [...newvariant.events, ...KDEventHexModular[selection].events];
				if (data.trimTrigger)
					newvariant.events = newvariant.events.filter((event) => {return event.trigger != "CurseTransform";});
				if (curse) {
					newvariant.curse = curse;
				}
				// Apply the item!
				let msg = data.msg || "KDCurseTransform";
				if (newRestraint) {
					KinkyDungeonSendTextMessage(10, TextGet(msg + "New")
						.replace("OLDITM", TextGet("Restraint" + KDRestraint(item).name))
						.replace("NEWITM", TextGet("Restraint" + newvariant.template)),
					"#ffffff", 2);
				} else {
					KinkyDungeonSendTextMessage(10, TextGet(msg)
						.replace("OLDITM", TextGet("Restraint" + KDRestraint(item).name)),
					"#ffffff", 2);
				}
				KDMorphToInventoryVariant(item, newvariant, "", curse);
			}
		},
	},
	"EngageCurse": {
		"CursedCollar": (e, item, data) => {
			let itemsEligible = [];
			for (let inv of KinkyDungeonAllRestraintDynamic()) {
				let it = inv.item;
				if (it.events?.some((event) => {return event.trigger == "CurseTransform";})) {
					itemsEligible.push(it);
				}
			}
			KinkyDungeonSendEvent("CurseTransform", {curseditem: item, newRestraintTags: e.tags, forceItems: [itemsEligible[Math.floor(KDRandom()*itemsEligible.length)]], trimTrigger: e.trim, msg: e.msg, ...data});
		},
	},
	"tick": {
		"CursedHeal": (e, item, data) => {
			if (item && KDGetCurse(item) == "CursedDamage" && KDIsEdged(KinkyDungeonPlayerEntity)) {
				let alreadyDone = KDItemDataQuery(item, "cursedDamage") || 0;
				if (alreadyDone > 0) {
					alreadyDone = Math.max(0, alreadyDone - e.power*data.delta);
					KDItemDataSet(item, "cursedDamage", alreadyDone);
					KDItemDataSet(item, "cursedDamageCheckpoint", Math.floor(1+alreadyDone/10)*10);
				}
			}
		},
		"CursedCorruption": (e, item, data) => {
			KinkyDungeonSetFlag("CurseTypeCorruption", 2);
			if (item && KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) < KDShadowThreshold) {
				let buff = KinkyDungeonPlayerBuffs.Corrupted;
				let buff2 = KinkyDungeonPlayerBuffs.Corrupted2;
				if (!buff || !buff2) {
					buff = KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "Corrupted",
						aura: "#9074ab",
						type: "StatGainWill",
						aurasprite: "Null",
						power: -0.01,
						duration: 9999,
						text: "-1%",
						events: [
							{trigger: "tick", type: "Corrupted", power: 0.01},
						],
					});
					buff2 = KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "Corrupted2",
						type: "StrugglePower",
						power: -0.01,
						duration: 9999,
						events: [
							{trigger: "tick", type: "Corrupted", power: 0.01},
						],
					});
				} else {
					buff.power = Math.max(e.limit || -0.9, buff.power - 0.01* (e.power) * data.delta);
					buff.text = Math.round(buff.power * 100) + "%";
					buff.duration = 9999;

					buff2.power = Math.max(e.limit || -0.9, buff.power - 0.01* (e.power) * data.delta);
					buff2.text = Math.round(buff.power * 100) + "%";
					buff2.duration = 9999;
				}
			}
		},
		"TriggerCurseTransform": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				// Trigger a transform event.
				KinkyDungeonSendEvent("CurseTransform", {curseditem: item, newRestraintTags: e.tags, trimTrigger: e.trim, msg: e.msg, ...data});
			}
		},
		"iceMelt": (e, item, data) => {
			let alreadyDone = KDItemDataQuery(item, "iceMelt") || 0;
			if (alreadyDone < e.count) {
				alreadyDone += e.power;
				KDItemDataSet(item, "iceMelt", alreadyDone);
			} else {
				KDCreateEffectTile(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
					name: "Water",
					duration: 12,
				}, 8);
				KDRemoveThisItem(item);
				KinkyDungeonSendTextMessage(4, TextGet("KDIceMelt").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
			}
		},
		"AntiMagicGag": (e, item, data) => {
			let alreadyDone = KDItemDataQuery(item, "manaDrained") || 0;
			if (alreadyDone < e.count) {
				if (KinkyDungeonStatMana + KinkyDungeonStatManaPool > 0) {
					alreadyDone += Math.min(KinkyDungeonStatMana + KinkyDungeonStatManaPool, e.power);
					KinkyDungeonChangeMana(-e.power);
					KDItemDataSet(item, "manaDrained", alreadyDone);
				}
			} else {KDChangeItemName(item, item.type, "MagicGag2");}
		},
		"DollmakerMask": (e, item, data) => {
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;
			if (KDRandom() < 0.1) {
				let count = 0;
				for (let en of KDMapData.Entities) {
					if (en.Enemy.tags.escapeddoll) count += 1;
				}
				if (count < 10) {
					// Spawn a new doll
					let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, 6, 10);
					if (point) {
						DialogueCreateEnemy(point.x, point.y, "DollmakerTarget");
					}
				}
			}
		},
		"RemoveOnBuffName": (e, item, data) => {
			if (KinkyDungeonPlayerBuffs[e.kind] && (!e.chance || KDRandom() < e.chance)) {
				item.curse = "";
				KinkyDungeonLock(item, "");
				KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgType").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
			}
		},
		"armorBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Armor", type: "Armor", power: e.power, duration: 2,});
		},
		"spellWardBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "SpellResist", type: "SpellResist", power: e.power, duration: 2,});
		},
		"sneakBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Sneak", type: "SlowDetection", power: e.power, duration: 2,});
		},
		"evasionBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Evasion", type: "Evasion", power: e.power, duration: 2,});
		},
		"blockBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Block", type: "Block", power: e.power, duration: 2,});
		},
		"buff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + e.buff, type: e.buff, power: e.power, duration: 2,
				tags: e.tags,
				currentCount: e.mult ? -1 : undefined,
				maxCount: e.mult,});
		},
		"restraintBlock": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Block", type: "RestraintBlock", power: e.power, duration: 2,});
		},
		"ShadowHandTether": (e, item, data) => {
			let enemy = (item.tx && item.ty) ? KinkyDungeonEnemyAt(item.tx, item.ty) : undefined;
			if (KinkyDungeonFlags.get("ShadowDommed") || (KDGameData.KinkyDungeonLeashedPlayer > 0 && KinkyDungeonLeashingEnemy() && enemy != KinkyDungeonLeashingEnemy())) {
				item.tx = undefined;
				item.ty = undefined;
			} else {
				if (item.tx && item.ty && (!enemy || (e.requiredTag && !enemy.Enemy.tags[e.requiredTag]))) {
					item.tx = undefined;
					item.ty = undefined;
					return;
				} else {
					// The shadow hands will link to a nearby enemy if possible
					for (enemy of KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, e.dist)) {
						if (!e.requiredTag || enemy.Enemy.tags[e.requiredTag]) {
							item.tx = enemy.x;
							item.ty = enemy.y;
						}
					}
				}
			}
		},
		"Buff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.buffType,
				type: e.buffType,
				power: e.power,
				tags: e.tags,
				currentCount: e.mult ? -1 : undefined,
				maxCount: e.mult,
				duration: 2
			});
		},
		"PeriodicTeasing": (e, item, data) => {
			if (!data.delta) return;
			if (!e.chance || KDRandom() < e.chance) {
				if (!KDGameData.CurrentVibration && KDIsVibeCD(e.cooldown)) {
					KinkyDungeonStartVibration(item.name, "normal", KDGetVibeLocation(item), e.power, e.time, undefined, undefined, undefined, undefined, e.edgeOnly);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		"PeriodicDenial": (e, item, data) => {
			if (!data.delta) return;
			if (!e.chance || KDRandom() < e.chance) {
				if (!KDGameData.CurrentVibration && KDIsVibeCD(e.cooldown)) {
					KinkyDungeonStartVibration(item.name, "normal", KDGetVibeLocation(item), e.power, e.time, undefined, 12, undefined, undefined, undefined, false, 0.5, 1.0);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				} else {
					KinkyDungeonAddVibeModifier(item.name, "tease", KDRestraint(item).Group, 0, 9, e.power, false, true, false, false, true, 0.4, 1.0);
				}
			}
		},
		"AccuracyBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "Accuracy",
				duration: 1,
				power: e.power
			});
		},
		"spellRange": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "spellRange",
				duration: 1,
				power: e.power
			});
		},
		"SneakBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "Sneak",
				duration: 1,
				power: e.power
			});
		},
		"EvasionBuff": (e, item, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "Evasion",
				duration: 1,
				power: e.power
			});
		},
		"AllyHealingAura": (e, item, data) => {
			if (!data.delta) return;
			let healed = false;
			for (let enemy of KDMapData.Entities) {
				if (KDAllied(enemy) && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					let origHP = enemy.hp;
					enemy.hp = Math.min(enemy.hp + e.power, enemy.Enemy.maxhp);
					if (enemy.hp - origHP > 0) {
						KinkyDungeonSendFloater(enemy, `+${Math.round((enemy.hp - origHP) * 10)}`, "#44ff77", 3);
						healed = true;
					}
				}
			}
			if (healed) {
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"EnchantedAnkleCuffs2": (e, item, data) => {
			KinkyDungeonRemoveRestraint(KDRestraint(item).Group);
			KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName("EnchantedAnkleCuffs"), 0, true, undefined, false, undefined, undefined, undefined, item.faction);
		},
		"EnchantedAnkleCuffs": (e, item, data) => {
			if (KDGameData.AncientEnergyLevel <= 0.0000001) {
				KinkyDungeonRemoveRestraint(KDRestraint(item).Group);
				KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName("EnchantedAnkleCuffs2"), 0, true, undefined, false, undefined, undefined, undefined, item.faction);
			}
		},
		"RegenMana": (e, item, data) => {
			if (!e.limit || KinkyDungeonStatMana / KinkyDungeonStatManaMax < e.limit) {
				if (e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				KinkyDungeonChangeMana(e.power);
			}
		},
		"RegenStamina": (e, item, data) => {
			if (!e.limit || KinkyDungeonStatStamina / KinkyDungeonStatStaminaMax < e.limit) {
				if (e.energyCost && KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				KinkyDungeonChangeStamina(e.power);
			}
		},
		"ApplySlowLevelBuff": (e, item, data) => {
			if (item.type === Restraint) {
				if (KinkyDungeonPlayerBuffs[item.name + e.type + e.trigger]) delete KinkyDungeonPlayerBuffs[item.name + e.type + e.trigger];
				KinkyDungeonCalculateSlowLevel(0);
				if (KinkyDungeonSlowLevel > 0) {
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: (e.original || "") + item.name + e.type + e.trigger,
						type: "SlowLevel",
						duration: 2,
						power: e.power
					});
				}
			}
		},
		"AlertEnemies": (e, item, data) => {
			if (!data.delta) return;
			if (!e.chance || KDRandom() < e.chance) {
				KinkyDungeonAlert = Math.max(KinkyDungeonAlert, e.power);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonAlertEnemies").replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"iceDrain": (e, item, data) => {
			if (!data.delta) return;
			if (e.power) {
				KinkyDungeonChangeMana(e.power);
				KinkyDungeonChangeStamina(e.power);
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonIceDrain"), "lightblue", 2, true);
			}
		},
		"crystalDrain": (e, item, data) => {
			if (!data.delta) return;
			if (e.power) {
				KinkyDungeonChangeMana(e.power);
				KinkyDungeonChangeDistraction(-e.power * 3 * KDBuffResist(KinkyDungeonPlayerBuffs, "soul"), false, 0.1);
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrystalDrain"), "lightblue", 2, true);
			}
		},
		"tickleDrain": (e, item, data) => {
			if (!data.delta) return;
			if (KinkyDungeonFlags.get("tickleDrain")) return;
			if (e.power) {
				KinkyDungeonSetFlag("tickleDrain", 3 + Math.floor(KDRandom() * 4));
				KinkyDungeonChangeDistraction(-e.power * KDBuffResist(KinkyDungeonPlayerBuffs, "tickle"), false, 0.01);
				KinkyDungeonSendTextMessage(0.5, TextGet("KinkyDungeonTickleDrain"), "lightblue", 2, true);
			}
		},
		"barrelDebuff": (e, item, data) => {
			if (!data.delta) return;
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Counterbarrel", type: "SlowDetection", duration: 1, power: -10, player: true, enemies: true, endSleep: true, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Counterbarrel3", type: "Sneak", duration: 1, power: -10, player: true, enemies: true, endSleep: true, tags: ["Sneak", "move", "cast"]});
		},
		"cageDebuff": (e, item, data) => {
			if (!data.delta) return;
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Countercage", type: "SlowDetection", duration: 1, power: -5, player: true, enemies: true, endSleep: true, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Countercage2", type: "Sneak", duration: 1, power: -10, player: true, enemies: true, endSleep: true, tags: ["Sneak", "move", "cast"]});
		},
		"callGuard": (e, item, data) => {
			if (!data.delta) return;
			if (!KinkyDungeonFlags.has("GuardCalled") && KDRandom() < 0.25) {
				KinkyDungeonSetFlag("GuardCalled", 35);
				console.log("Attempting to call guard");
				if (KDMapData.Entities.length < 400) {
					console.log("Called guard");
					KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, true);
				}
			}
		},
		"callGuardFurniture": (e, item, data) => {
			if (!data.delta) return;
			if (!KinkyDungeonFlags.has("GuardCalled") && KDRandom() < (e.chance ? e.chance : 0.1)) {
				KinkyDungeonSetFlag("GuardCalled", 35);
				console.log("Attempting to call guard");
				if (KDMapData.Entities.length < 400 || KDGameData.CagedTime > KDMaxCageTime) {
					console.log("Called guard");
					let requireTags = null;
					if (KinkyDungeonFlags.has("callGuardJailerOnly")) {
						requireTags = ["jailer"];
					}
					let ee = KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, true, requireTags);
					if (ee) {
						let point = KinkyDungeonGetRandomEnemyPoint(true);
						if (point) {
							ee.x = point.x;
							ee.y = point.y;
						}
					}
					//if (ee && (KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail')) {
					ee.IntentAction = 'freeFurniture';
					ee.playWithPlayer = 12;
					//if (KDGameData.CagedTime > KDMaxCageTime * 10) {
					//}
					/*} else {
						ee.gx = KinkyDungeonPlayerEntity.x;
						ee.gy = KinkyDungeonPlayerEntity.y;
						ee.gxx = KinkyDungeonPlayerEntity.x;
						ee.gyy = KinkyDungeonPlayerEntity.y;
					}*/

				}
			}
			let guard = KinkyDungeonJailGuard();
			if (guard && !KinkyDungeonFlags.has("guardTP") && KDGameData.CagedTime > KDMaxCageTime && KDistChebyshev(guard.x - KinkyDungeonPlayerEntity.x, guard.y - KinkyDungeonPlayerEntity.y) > 4) {
				DialogueBringSpecific(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, guard);
				KinkyDungeonSetFlag("guardTP", 20);
			}
		},
		"slimeSpread": (e, item, data) => {
			if (!data.delta) return;
			let mult = 0.4 * Math.max(0.25, Math.min(2.0,
				KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist"))));
			KDEventData.SlimeLevel = Math.max(KDEventData.SlimeLevel, KDEventData.SlimeLevelStart + e.power * mult);
			if (KDEventData.SlimeLevel >= 0.99999) {
				KDEventData.SlimeLevel = 0;
				KDEventData.SlimeLevelStart = -100;
				if (KDAdvanceSlime(true, e.restraint || "")) {
					KDEventData.SlimeLevel = Math.min(KDEventData.SlimeLevel, 0.5);
					KDEventData.SlimeLevelStart = Math.min(KDEventData.SlimeLevelStart, 0.5);
				}
			}
		}
	},
	"tickAfter": {
		"RemoveOnETTag": (e, item, data) => {
			let tiles = KDEffectTileTags(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (e.tags.some((t) => {return tiles[t] != undefined;}) ) {
				// Increase damage count
				let count = KDItemDataQuery(item, e.kind) || 0;
				count = count + e.power;
				KDItemDataSet(item, e.kind, count);
				// Evaluate damage count
				if (!e.count || count >= e.count) {
					item.curse = "";
					KinkyDungeonLock(item, "");
					KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgType").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				} else {
					KinkyDungeonSendTextMessage(3, TextGet("KDRemoveOnDmgTypeChill").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2, true);
				}
			}
		},
		"CursedSubmission": (e, item, data) => {
			if (KinkyDungeonStatWill < 0.1) {
				if (KinkyDungeonLastTurnAction == "Move"
					&& KDEntityBuffedStat(KinkyDungeonPlayerEntity, "ForcedSubmission", true) > 0
					&& KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, e.dist, KinkyDungeonPlayerEntity).length == 0) {
					// Condition for if you are near an enemy
					KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["CursedSubmission"]);
					// Submit!!!
					KinkyDungeonSendTextMessage(7, TextGet("KDCursedSubmission"), "#9074ab", 3);
					KDPlayerEffectRestrain(undefined, e.count, e.tags, "Ghost", false, true, false, false);
				} else if (KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y,
					KDEntityBuffedStat(KinkyDungeonPlayerEntity, "ForcedSubmission") ? e.dist : 1.5,
					KinkyDungeonPlayerEntity).length > 0) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "ForcedSubmission",
						type: "ForcedSubmission",
						aura: "#ff5555",
						aurasprite: "Null",
						power: 1,
						duration: 2,
						text: " ",
						tags: ["CursedSubmission"],
					});
				}
			}
		},
	},
	"calcDisplayDamage": {
		"BoostDamage": (e, item, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + e.power);
			}
		},
		"AmpDamage": (e, item, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + (KinkyDungeonPlayerDamage.dmg || 0) * e.power);
			}
		},
	},
	"remove": {
		"slimeStop": (e, item, data) => {
			if (data.item === item) KDEventData.SlimeLevel = 0;
		},
		"unlinkItem": (e, item, data) => {
			if (data.item === item && !data.add && !data.shrine) {
				console.log("Deprecated function");
				console.log(Event, e, item, data);
				console.trace();
			}
		},
	},
	"postUnlock": {
		"RequireLocked": (e, item, data) => {
			if (data.item == item && !item.lock && !item.curse) {
				KinkyDungeonRemoveRestraintSpecific(item, true, false, false);
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffsNoLock")
					.replace("RSTNME", TextGet("Restraint" + item.name)), "lightgreen", 2);
			}
		},
	},
	"postRemoval": {
		"replaceItem": (e, item, data) => {
			if (data.item === item && !data.add && !data.shrine && e.list) {
				for (let restraint of e.list) {
					KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(restraint), e.power, true, e.lock, data.keep);
				}
			}
		},
		"RequireBaseArmCuffs": (e, item, data) => {
			if (data.item !== item && KDRestraint(item).Group) {
				let cuffsbase = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("ArmCuffsBase"))) {
						cuffsbase = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 20; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("ArmCuffsBase"))) {
								cuffsbase = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 200;
						}
					}
				}
				if (!cuffsbase) {
					KinkyDungeonRemoveRestraintSpecific(item, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffs"), "lightgreen", 2);
				}
			}
		},
		"RequireCollar": (e, item, data) => {
			if (data.item !== item && KDRestraint(item).Group) {
				let collar = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("Collars"))) {
						collar = true;
						break;
					}
				}
				if (!collar) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false);
				}
			}
		},
		"RequireBaseAnkleCuffs": (e, item, data) => {
			if (data.item !== item && KDRestraint(item).Group) {
				let cuffsbase = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("AnkleCuffsBase"))) {
						cuffsbase = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 20; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("AnkleCuffsBase"))) {
								cuffsbase = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 200;
						}
					}
				}
				if (!cuffsbase) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffs"), "lightgreen", 2);
				}
			}
		},
		"RequireBaseLegCuffs": (e, item, data) => {
			if (data.item !== item && KDRestraint(item).Group) {
				let cuffsbase = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("LegCuffsBase"))) {
						cuffsbase = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 20; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("LegCuffsBase"))) {
								cuffsbase = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 200;
						}
					}
				}
				if (!cuffsbase) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffs"), "lightgreen", 2);
				}
			}
		},
		"armbinderHarness": (e, item, data) => {
			if (data.item !== item && KDRestraint(item).Group) {
				let armbinder = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("Armbinders") || KDRestraint(inv).shrine.includes("Boxbinders"))) {
						armbinder = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 10; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("Armbinders") || KDRestraint(link).shrine.includes("Boxbinders"))) {
								armbinder = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 10;
						}
					}
				}
				if (!armbinder) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveArmbinderHarness"), "lightgreen", 2);
				}
			}
		}
	},
	"tryOrgasm": {
		"CursedDenial": (e, item, data) => {
			if (KinkyDungeonStatWill > 0.1) {
				if (data.auto <= 1)
					KinkyDungeonChangeWill(-e.power);
			} else {
				data.chance *= 0;
			}
		},
		"ForcedOrgasmPower": (e, item, data) => {
			data.eventBonus += e.power;
		},
		"ForcedOrgasmMin": (e, item, data) => {
			if (data.amount < e.power) {
				data.amount = e.power;
				KinkyDungeonSendTextMessage(6, TextGet("KDForcedOrgasmMin"), "#ffaaaa", 5);
			}
		},
	},
	"hit": {
		"linkItem": (e, item, data) => {
			if ((data.attack && data.attack.includes("Bind") && (!data.enemy || data.enemy.Enemy.bound) && !data.attack.includes("Suicide"))) {
				let added = false;
				if (data.restraintsAdded) {
					for (let r of data.restraintsAdded) {
						if (r.name === item.name) {
							added = true;
							break;
						}
					}
				}
				if (!added) {
					let subMult = 1;
					let chance = e.chance ? e.chance : 1.0;
					if (e.subMult !== undefined) {
						let rep = (KinkyDungeonGoddessRep.Ghost + 50) / 100;
						subMult = 1.0 + e.subMult * rep;
					}
					if (e.tags?.includes("lowwill") && KinkyDungeonStatWill < 0.1) chance = 1.0;
					if (item && KDRestraint(item).Link && (KDRandom() < chance * subMult) && (!e.noLeash || KDGameData.KinkyDungeonLeashedPlayer < 1)) {
						let newRestraint = KinkyDungeonGetRestraintByName(KDRestraint(item).Link);
						//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
						if (KDToggles.Sound && e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
						KinkyDungeonAddRestraint(newRestraint, item.tightness, true, "", false, undefined, undefined, undefined, item.faction);
					}
				}
			}
		}
	},
	"beforePlayerDamage": {
		"RemoveOnDmg": (e, item, data) => {
			let t = data.type;
			if (KDDamageEquivalencies[data.type]) t = KDDamageEquivalencies[data.type];
			if (data.type && t == e.damage && data.dmg) {
				if (!e.power || data.dmg >= e.power) {
					// Increase damage count
					let count = KDItemDataQuery(item, e.kind) || 0;
					count = count + Math.max((data.dmg * (e.mult || 1)) || 1, 1);
					KDItemDataSet(item, e.kind, count);
					// Evaluate damage count
					if (!e.count || count >= e.count) {
						item.curse = "";
						KinkyDungeonLock(item, "");
						KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgType").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
					} else {
						KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgTypePartial").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
					}
				}
			}
		},
		"linkItemOnDamageType": (e, item, data) => {
			if (data.type && data.type == e.damage && data.dmg) {
				let subMult = 1;
				let chance = e.chance ? e.chance : 1.0;
				if (item && KDRestraint(item).Link && KDRandom() < chance * subMult) {
					let prereq = KDEventPrereq(e.requiredTag);
					if (prereq) {
						let newRestraint = KinkyDungeonGetRestraintByName(KDRestraint(item).Link);
						//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
						if (KDToggles.Sound && e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
						KinkyDungeonAddRestraint(newRestraint, item.tightness, true, "", false, undefined, undefined, undefined, item.faction);
					}
				}
			}
		},
		"lockItemOnDamageType": (e, item, data) => {
			if (data.type && data.type == e.damage && data.dmg && !KDGetCurse(item)) {
				let subMult = 1;
				let chance = e.chance ? e.chance : 1.0;
				if (item && KinkyDungeonGetLockMult(e.lock) > KinkyDungeonGetLockMult(item.lock) && KDRandom() < chance * subMult) {
					let prereq = KDEventPrereq(e.requiredTag);
					if (prereq) {
						KinkyDungeonLock(item, e.lock);
					}
				}
			}
		},
	},
	"missPlayer": {
		"EnergyCost": (e, item, data) => {
			if (e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
		}
	},
	"missEnemy": {
		"EnergyCost": (e, item, data) => {
			if (e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
		}
	},
	"calcEvasion": {
		"HandsFree": (e, item, data) => {
			if (data.flags.KDEvasionHands) {
				data.flags.KDEvasionHands = false;
				if (data.cost && e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"ArmsFree": (e, item, data) => {
			if (data.flags.KDEvasionArms) {
				data.flags.KDEvasionArms = false;
				if (data.cost && e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"BlindFighting": (e, item, data) => {
			if (data.flags.KDEvasionSight) {
				data.flags.KDEvasionSight = false;
				if (data.cost && e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		}
	},
	"beforePlayerAttack": {
		"BoostDamage": (e, item, data) => {
			if (KDCheckPrereq(data.target, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + e.power);
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"AmpDamage": (e, item, data) => {
			if (KDCheckPrereq(data.target, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + (KinkyDungeonPlayerDamage.dmg || 0) * e.power);
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
	},
	"beforeDamage": {
		"ModifyDamageFlat": (e, item, data) => {
			if (data.damage > 0) {
				if (!e.chance || KDRandom() < e.chance) {
					data.damage = Math.max(data.damage + e.power, 0);
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				}
			}
		},
	},
	"beforeDamageEnemy": {
		"MultiplyDamageStealth": (e, item, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && !data.enemy.aware) {
				if (!e.chance || KDRandom() < e.chance) {
					let dmg = Math.max(0, Math.min(data.enemy.hp, data.dmg));
					if (e.energyCost && e.power > 1) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost * dmg * (e.power - 1));
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		},
		"AddDamageStealth": (e, item, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && !data.enemy.aware) {
				if (!e.chance || KDRandom() < e.chance) {
					if (e.energyCost && e.power > 1) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost * (e.power - 1));
					data.dmg = Math.max(data.dmg + e.power, 0);
				}
			}
		},
		"MultiplyDamageStatus": (e, item, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && (KinkyDungeonHasStatus(data.enemy))) {
				if (!e.chance || KDRandom() < e.chance) {
					let dmg = Math.max(0, Math.min(data.enemy.hp, data.dmg));
					if (e.energyCost && e.power > 1) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost * dmg * (e.power - 1));
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		},
		"MultiplyDamageMagic": (e, item, data) => {
			if (data.dmg > 0 && data.incomingDamage && !KinkyDungeonMeleeDamageTypes.includes(data.incomingDamage.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					let dmg = Math.max(0, Math.min(data.enemy.hp, data.dmg));
					if (e.energyCost && e.power > 1) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost * dmg * (e.power - 1));
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		}
	},
	"defeat": {
		"linkItem": (e, item, data) => {
			if (item && KDRestraint(item).Link && (KDRandom() < e.chance)) {
				let newRestraint = KinkyDungeonGetRestraintByName(KDRestraint(item).Link);
				KinkyDungeonAddRestraint(newRestraint, item.tightness, true, "", false, undefined, undefined, undefined, item.faction);
				//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
			}
		},
		"Kittify": (e, item, data) => {
			// get defeat, upgrade suit
			KinkyDungeonRemoveRestraint("ItemArms",false,false,true,false);
			KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName("KittyPetSuit"), 15, undefined, undefined, undefined, undefined, undefined, undefined, item.faction);
			// leash if collared
			let collared = KinkyDungeonGetRestraintItem("ItemNeck");
			if(collared != undefined){
				KinkyDungeonAddRestraint(KinkyDungeonGetRestraintByName("BasicLeash"), 1, false, "Red", undefined, undefined, undefined, undefined, item.faction);
			}
		},
	},
	"struggle": {
		"crotchrope": (e, item, data) => {
			if (data.restraint && data.restraint.type === Restraint && KDRestraint(data.restraint).crotchrope && data.struggleType === "Struggle" && data.struggleType === "Remove") {
				KinkyDungeonChangeDistraction(1, false, 0.5);
				KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCrotchRope").replace("RestraintName", TextGet("Restraint" + data.restraint.name)), "pink", 3);
			}
		},
		"VibeOnStruggle": (e, item, data) => {
			if ((!e.chance || KDRandom() < e.chance) && data.struggleType === "Struggle") {
				if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);

				KinkyDungeonSendEvent("punish", Object.assign({
					item: item,
					type: "struggle",
					kind: e.kind || "low",
				}, data));
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"celestialRopePunish": (e, item, data) => {
			if (data.restraint && item === data.restraint) {
				KinkyDungeonChangeDistraction(3);
				KinkyDungeonChangeMana(-1);
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind + 1, 2);

				for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
					if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name === "Eyes" || KinkyDungeonPlayer.Appearance[A].Asset.Group.Name === "Eyes2") {
						let property = KinkyDungeonPlayer.Appearance[A].Property;
						if (!property || property.Expression !== "Surprised") {
							KinkyDungeonPlayer.Appearance[A].Property = {Expression: "Surprised"};
							KDRefresh = true;
						}
					}
				}
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCelestialPunish" + Math.floor(KDRandom() * 3)), "#ff0000", 2);
			}
		},
		"crystalPunish": (e, item, data) => {
			if (data.restraint && item === data.restraint) {
				KinkyDungeonChangeDistraction(1, false, 0.1);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCrystalPunish" + Math.floor(KDRandom() * 3)), "#ff0000", 2);
			}
		},
		"PunishPlayer": (e, item, data) => {
			if (data.restraint && item === data.restraint) {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > 2 && KDRandom() < e.warningchance)) {
					if (e.stun && KDGameData.WarningLevel > 2) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > 2 ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		}
	},
	"beforeStruggleCalc": {
		"boostWater": (e, item, data) => {
			if (item == data.restraint && KinkyDungeonPlayerBuffs.Drenched && KinkyDungeonPlayerBuffs.Drenched.duration > 0) {
				data.escapeChance += e.power;
				let msg = e.msg ? e.msg : "KinkyDungeonDrenchedSlimeBuff";
				if (msg) {
					KinkyDungeonSendTextMessage(5, TextGet(msg).replace("RestraintName", TextGet("Restraint" + data.restraint.name)), "lightgreen", 2);
				}
			}
		},
		"ShockForStruggle": (e, item, data) => {
			if (data.struggleType === "Struggle") {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > 2 && KDRandom() < e.warningchance) || data.group == "ItemNeck") {
					if (e.stun && KDGameData.WarningLevel > 2) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					data.escapePenalty += e.bind ? e.bind : 0.1;
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > 2 ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		"elbowCuffsBlock": (e, item, data) => {
			if (data.restraint && item != data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KDRestraint(data.restraint).shrine.includes("ArmCuffsBase")) {
				data.escapePenalty += e.power ? e.power : 1.0;
				KinkyDungeonSendTextMessage(10, TextGet("KDElbowCuffsBlock" + Math.floor(KDRandom() * 3)), "#ff0000", 2);
			}
		},
		"vibeStruggle": (e, item, data) => {
			if (KinkyDungeonHasCrotchRope && !KinkyDungeonPlayerTags.get("ChastityLower") && data.restraint && item == data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && (KinkyDungeonIsHandsBound(false, false, 0.45) || KinkyDungeonIsArmsBound())) {
				data.escapePenalty += data.escapeChance;
				KinkyDungeonSendTextMessage(10, TextGet("KDCrotchRopeBlock" + Math.floor(KDRandom() * 3)), "#ff0000", 2);
			}
		},
		"struggleDebuff": (e, item, data) => {
			if (e.StruggleType == data.struggleType && data.restraint && item != data.restraint && KDRestraint(data.restraint)?.shrine?.includes(e.requiredTag)) {
				data.escapePenalty += e.power;
				if (e.msg)
					KinkyDungeonSendTextMessage(2, TextGet(e.msg), "#ff5555", 2);
			}
		},
		"obsidianDebuff": (e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item != data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KDRestraint(data.restraint).shrine.includes("Obsidian")) {
				data.escapePenalty += e.power ? e.power : 0.075;
				KinkyDungeonSendTextMessage(5, TextGet("KDObsidianDebuff" + Math.floor(KDRandom() * 3)), "#8800aa", 2, true);
			}
		},
		"latexDebuff": (e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item != data.restraint && KDRestraint(data.restraint).shrine.includes("Latex")) {
				data.escapePenalty += e.power ? e.power : 0.075;
				KinkyDungeonSendTextMessage(5, TextGet("KDLatexDebuff" + Math.floor(KDRandom() * 3)), "#38a2c3", 2, true);
			}
		},
		"shadowBuff": (e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item == data.restraint) {

				let brightness = KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				if (brightness > 4) {
					data.escapeChance += 0.1 * brightness;
					KinkyDungeonSendTextMessage(7, TextGet("KDShadowBuff"), "#99ff99", 2, true);
				}


			}
		},
		"wristCuffsBlock": (e, item, data) => {
			if (data.restraint && item != data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KDRestraint(data.restraint).shrine.includes("ArmCuffsBase")) {
				data.escapePenalty += e.power ? e.power : 0.075;
				KinkyDungeonSendTextMessage(5, TextGet("KDWristCuffsBlock" + Math.floor(KDRandom() * 3)), "#ff0000", 2);
			}
		},
	},
	"sprint": {
		"MotionSensitive": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);

				KinkyDungeonSendEvent("punish", Object.assign({
					item: item,
					type: "sprint",
					kind: e.kind || "low",
				}, data));
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
	},
	"playerAttack": {
		"ElementalEffect": (e, item, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if ((!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, e.power <= 0.1, undefined, undefined, undefined, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"MotionSensitive": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);

				KinkyDungeonSendEvent("punish", Object.assign({
					item: item,
					type: "attack",
					kind: e.kind || "low",
				}, data));

				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"ShadowHeel": (e, item, data) => {
			if (data.targetX && data.targetY && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy))) {
				KinkyDungeonCastSpell(data.targetX, data.targetY, KinkyDungeonFindSpell("HeelShadowStrike", true), undefined, undefined, undefined);
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"AlertEnemies": (e, item, data) => {
			if (KDAlertCD < 1 && data.enemy && (!e.chance || KDRandom() < e.chance)) { // (data.damage && data.damage.damage && data.enemy.hp > data.enemy.Enemy.maxhp - data.damage.damage*2 - 1)
				KinkyDungeonAlert = Math.max(KinkyDungeonAlert, e.power);
				KDAlertCD = 5;
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonAlertEnemies").replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"PunishPlayer": (e, item, data) => {
			if (item.type === Restraint && data.targetX && data.targetY && data.enemy && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy)) && (!KinkyDungeonHiddenFactions.includes(KDGetFaction(data.enemy)) || KDGetFaction(data.enemy) == "Enemy")) {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > 2 && KDRandom() < e.warningchance)) {
					if (e.stun && KDGameData.WarningLevel > 2) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > 2 ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		"cursePunish": (e, item, data) => {
			if (item.type === Restraint && data.targetX && data.targetY && data.enemy && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy)) && (!KinkyDungeonHiddenFactions.includes(KDGetFaction(data.enemy)) || KDGetFaction(data.enemy) == "Enemy")) {
				if (!e.chance || KDRandom() < e.chance) {
					if (e.stun) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					if (!data.cursePunish) {
						KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
						if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
					data.cursePunish = true;
				}
			}
		},
		"armorNoise": (e, item, data) => {
			if (item.type === Restraint && data.targetX && data.targetY && data.enemy && !data.armorNoise) {
				if (!e.chance || KDRandom() < e.chance ) {
					KinkyDungeonMakeNoise(e.dist, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");

					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${TextGet("KDArmorNoise")}`, "#ffffff", 5);
					data.armorNoise = true;
				}
			}
		},
	},
	"calcMiscast": {
		"ReduceMiscastFlat": (e, item, data) => {
			if (data.miscastChance > 0) {
				data.miscastChance -= e.power;
			}
		}
	},
	"remoteVibe": {
		"RemoteActivatedVibe": (e, item, data) => {
			if (!KDGameData.CurrentVibration) {
				KinkyDungeonStartVibration(item.name, "tease", KDGetVibeLocation(item), e.power, e.time, undefined, undefined, undefined, undefined, e.edgeOnly);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonStartVibeRemote").replace("EnemyName", TextGet("Name" + data.enemy)), "pink", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		}
	},
	"remotePunish": {
		"RemoteActivatedShock": (e, item, data) => {
			/** @type {entity} */
			const enemy = data.enemy;
			if (!enemy || KDRandom() >= (enemy.Enemy.RemoteControl?.punishRemoteChance || 0.25) || KDEnemyHasFlag(enemy, "remoteShockCooldown") || (e.noLeash && KDGameData.KinkyDungeonLeashedPlayer >= 1)) {
				return;
			}
			// 7 tick cooldown stops it feeling overly spammy
			KinkyDungeonSetEnemyFlag(enemy, "remoteShockCooldown", 7);
			if (e.stun) {
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
				KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
			}
			KinkyDungeonDealDamage({damage: e.power, type: e.damage});
			const msg = TextGet(e.msg ? e.msg : "KinkyDungeonRemoteShock")
				.replace("RestraintName", TextGet(`Restraint${item.name}`))
				.replace("EnemyName", TextGet(`Name${enemy.Enemy.name}`));
			KinkyDungeonSendTextMessage(5, msg, "#ff8800", 2);
			if (e.sfx) KinkyDungeonPlaySound(`${KinkyDungeonRootDirectory}/Audio/${e.sfx}.ogg`);
		},
		"RemoteLinkItem": (e, item, data) => {
			const enemy = data.enemy;
			if (KDRandom() >= (enemy.Enemy.RemoteControl?.punishRemoteChance || 0.1) || (e.noLeash && KDGameData.KinkyDungeonLeashedPlayer >= 1)) {
				return;
			}

			const newRestraint = KinkyDungeonGetRestraintByName(KDRestraint(item).Link);
			if (e.sfx) KinkyDungeonPlaySound(`${KinkyDungeonRootDirectory}/Audio/${e.sfx}.ogg`);

			KinkyDungeonAddRestraint(newRestraint, item.tightness, true, "", false, undefined, undefined, undefined, item.faction, undefined, undefined, undefined, false);

			if (e.enemyDialogue) {
				const dialogue = KinkyDungeonGetTextForEnemy(e.enemyDialogue, enemy);
				KinkyDungeonSendDialogue(enemy, dialogue, KDGetColor(enemy), 2, 4);
			}

			if (e.msg) {
				const msg = TextGet(e.msg)
					.replace("RestraintName", TextGet(`Restraint${item.name}`))
					.replace("EnemyName", TextGet(`Name${enemy.Enemy.name}`));
				KinkyDungeonSendTextMessage(5, msg, "#ff8800", 2);
			}
		}
	},
	"playerMove": {
		"removeOnMove": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (!e.prereq || KDCheckPrereq(KinkyDungeonPlayerEntity)) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false);
				}
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
	},
	"punish": {
		/** If this item is the one to do it it will vibe */
		"PunishSelf": (e, item, data) => {
			if (item == data.item && (!e.kind || data.kind == e.kind) && (!e.requireTags || e.requireTags.includes(data.kind)) && (!e.filterTags || !e.filterTags.includes(data.kind))) {
				if (!e.chance || KDRandom() < e.chance) {
					if (!KDGameData.CurrentVibration) {
						KinkyDungeonStartVibration(item.name, "tease", KDGetVibeLocation(item), e.power, e.time, undefined, undefined, undefined, undefined, e.edgeOnly);
					} else {
						KinkyDungeonAddVibeModifier(item.name, "reinforce", KDRestraint(item).Group, 1, e.time);
					}
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		/** If this item is the one to do it it will vibe */
		"PunishShock": (e, item, data) => {
			if (item == data.item && (!e.kind || data.kind == e.kind) && (!e.requireTags || e.requireTags.includes(data.kind)) && (!e.filterTags || !e.filterTags.includes(data.kind))) {
				if (!e.chance || KDRandom() < e.chance) {
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
	},

	"playSelf": {
		"PunishEvent": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);
				KinkyDungeonSendEvent("punish", Object.assign({
					item: item,
					type: "playSelf",
					kind: e.kind || "low",
				}, data));

				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
	},
	"playerCast": {
		"MagicallySensitive": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (e.msg && (e.always || !KDGameData.CurrentVibration)) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#aaaaaa", 1);

				KinkyDungeonSendEvent("punish", Object.assign({
					item: item,
					type: "cast",
					kind: e.kind || "low",
				}, data));

				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"AlertEnemies": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				KinkyDungeonAlert = Math.max(KinkyDungeonAlert, e.power);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonAlertEnemies").replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"PunishPlayer": (e, item, data) => {
			if (data.spell && item.type === Restraint && (!e.punishComponent || (data.spell.components && data.spell.components.includes(e.punishComponent)))) {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > 2 && KDRandom() < e.warningchance)) {
					if (e.stun && KDGameData.WarningLevel > 2) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > 2 ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		"cursePunish": (e, item, data) => {
			if (data.spell && item.type === Restraint && (!e.punishComponent || (data.spell.components && data.spell.components.includes(e.punishComponent)))) {
				if (!e.chance || KDRandom() < e.chance ) {
					if (e.stun) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					if (!data.cursePunish) {
						KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
						if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
					data.cursePunish = true;
				}
			}
		},
		"armorNoise": (e, item, data) => {
			if (data.spell && item.type === Restraint && (!e.punishComponent || (data.spell.components && data.spell.components.includes(e.punishComponent))) && !data.armorNoise) {
				if (!e.chance || KDRandom() < e.chance ) {
					KinkyDungeonMakeNoise(e.dist, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8800", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");

					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${TextGet("KDArmorNoise")}`, "#ffffff", 5);
					data.armorNoise = true;
				}
			}
		},
	}
};

/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} kinkyDungeonEvent
 * @param {item} item
 * @param {*} data
 */
function KinkyDungeonHandleInventoryEvent(Event, kinkyDungeonEvent, item, data) {
	if (Event === kinkyDungeonEvent.trigger && KDEventMapInventory[Event] && KDEventMapInventory[Event][kinkyDungeonEvent.type]) {
		KDEventMapInventory[Event][kinkyDungeonEvent.type](kinkyDungeonEvent, item, data);
	}
}


/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, entity, *): void>>}
 */
const KDEventMapBuff = {
	"expireBuff": {
		"ChaoticOverflow": (e, buff, entity, data) => {
			if (buff == data.buff) {
				let restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints", "crystalRestraintsHeavy"]}, KDGetEffLevel() + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
					true, "Gold", false, false, false);

				if (restraintToAdd) {
					KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
					if (e.count > 1)
						for (let i = 1; i < (e.count || 1); i++) {
							restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints", "crystalRestraintsHeavy"]}, KDGetEffLevel() + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
								true, "Gold", false, false, false);
							if (restraintToAdd) KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
						}

					KinkyDungeonSendTextMessage(10, TextGet("KDChaoticOverflow_End"), "#ff8888", 4);
				}
			}
		},
	},
	"beforeDamageEnemy": {
		"Conduction": (e, buff, entity, data) => {
			if (data.enemy == entity && (!data.flags || !data.flags.includes("EchoDamage")) && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					let maxSprites = 7;
					let sprites = 0;
					for (let enemy of KDMapData.Entities) {
						if (enemy.buffs && enemy.buffs.Conduction && enemy != data.enemy && enemy.hp > 0 && KDistEuclidean(enemy.x - data.enemy.x, enemy.y - data.enemy.y) <= e.aoe) {
							KinkyDungeonDamageEnemy(enemy, {
								type: e.damage,
								damage: data.dmg * e.power,
								flags: ["EchoDamage"]
							}, false, true, undefined, undefined, undefined, "Rage");
							KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Conduction.ogg");
							let dist = KDistEuclidean(enemy.x - data.enemy.x, enemy.y - data.enemy.y);
							let tx = enemy.x;
							let ty = enemy.y;
							if (dist > 0 && sprites < maxSprites)
								for (let d = dist/2.99; d < dist; d += dist/2.99) {
									let xx = entity.x + d * (tx - entity.x);
									let yy = entity.y + d * (ty - entity.y);
									let newB = {born: 0, time:1 + Math.round(KDRandom()*1), x:Math.round(xx), y:Math.round(yy), vx:0, vy:0, xx:xx, yy:yy, spriteID: KinkyDungeonGetEnemyID() + "ElectricEffect" + CommonTime(),
										bullet:{faction: "Rage", spell:undefined, damage: undefined, lifetime: 2, passthrough:true, name:"ElectricEffect", width:1, height:1}};
									KDMapData.Bullets.push(newB);
									KinkyDungeonUpdateSingleBulletVisual(newB, false);
									sprites += 1;
								}
						}
					}
					if (KinkyDungeonPlayerBuffs.Conduction && KDistEuclidean(data.enemy.x - KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - data.enemy.y) <= e.aoe) {
						KinkyDungeonSendTextMessage(6, TextGet("KDConductionDamageTaken").replace("DAMAGEDEALT", "" + data.dmg * e.power), "#ff0000", 2);
						KinkyDungeonDealDamage({
							type: e.damage,
							damage: data.dmg * e.power,
							flags: ["EchoDamage"],
						});
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Conduction.ogg");
						let dist = KDistEuclidean(KinkyDungeonPlayerEntity.x - data.enemy.x, KinkyDungeonPlayerEntity.y - data.enemy.y);
						let tx = KinkyDungeonPlayerEntity.x;
						let ty = KinkyDungeonPlayerEntity.y;
						if (dist > 0)
							for (let d = dist/2.99; d < dist; d += dist/2.99) {
								let xx = entity.x + d * (tx - entity.x);
								let yy = entity.y + d * (ty - entity.y);
								let newB = {born: 0, time:1 + Math.round(KDRandom()*1), x:Math.round(xx), y:Math.round(yy), vx:0, vy:0, xx:xx, yy:yy, spriteID: KinkyDungeonGetEnemyID() + "ElectricEffect" + CommonTime(),
									bullet:{faction: "Rage", spell:undefined, damage: undefined, lifetime: 2, passthrough:true, name:"ElectricEffect", width:1, height:1}};
								KDMapData.Bullets.push(newB);
								KinkyDungeonUpdateSingleBulletVisual(newB, false);
							}
					}
				}
			}
		},
		"EchoDamage": (e, buff, entity, data) => {
			if (data.enemy == entity && (!data.flags || (!data.flags.includes("EchoDamage"))) && data.dmg > 0 && (!e.damageTrigger || data.type == e.damageTrigger)) {
				KinkyDungeonDamageEnemy(entity, {
					type: e.damage,
					damage: data.dmg * e.power,
					flags: ["EchoDamage"]
				}, false, false, undefined, undefined, undefined, data.faction);
			}
		},
		"Volcanism": (e, buff, entity, data) => {
			if (data.enemy == entity && (!data.flags || (!data.flags.includes("VolcanicDamage") && !data.flags.includes("BurningDamage"))) && data.dmg > 0 && (data.type == "fire")) {
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("VolcanicStrike", true), undefined, undefined, undefined, "Rock");
				data.enemy.hp = 0;
			}
		},
		"Flammable": (e, buff, entity, data) => {
			if ((!data.flags || !data.flags.includes("BurningDamage")) && !KDEntityHasBuff(entity, "Drenched") && data.dmg > 0 && (data.type == "fire")) {
				KinkyDungeonApplyBuffToEntity(entity, KDBurning);
			}
		},
	},
	"beforePlayerDamage": {
		"Flammable": (e, buff, entity, data) => {
			if ((!data.flags || !data.flags.includes("BurningDamage")) && !KDEntityHasBuff(entity, "Drenched") && data.dmg > 0 && (data.type == "fire")) {
				KinkyDungeonApplyBuffToEntity(entity, KDBurning);
			}
		},
		"Conduction": (e, buff, entity, data) => {
			if ((!data.flags || !data.flags.includes("EchoDamage")) && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					for (let enemy of KDMapData.Entities) {
						if (enemy.buffs && enemy.buffs.Conduction && enemy.hp > 0 && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
							KinkyDungeonDamageEnemy(enemy, {
								type: e.damage,
								damage: data.dmg * e.power,
								flags: ["EchoDamage"]
							}, false, true, undefined, undefined, undefined, "Rage");
							let dist = KDistEuclidean(enemy.x - entity.x, enemy.y - entity.y);
							let tx = enemy.x;
							let ty = enemy.y;
							if (dist > 0)
								for (let d = 0; d <= dist; d += dist/3.01) {
									let xx = entity.x + d * (tx - entity.x);
									let yy = entity.y + d * (ty - entity.y);
									let newB = {born: 0, time:1 + Math.round(KDRandom()*1), x:Math.round(xx), y:Math.round(yy), vx:0, vy:0, xx:xx, yy:yy, spriteID: KinkyDungeonGetEnemyID() + "ElectricEffect" + CommonTime(),
										bullet:{faction: "Rage", spell:undefined, damage: undefined, lifetime: 2, passthrough:true, name:"ElectricEffect", width:1, height:1}};
									KDMapData.Bullets.push(newB);
									KinkyDungeonUpdateSingleBulletVisual(newB, false);
								}
						}
					}
				}
			}
		},
		"EchoDamage": (e, buff, entity, data) => {
			if ((!data.flags || !data.flags.includes("EchoDamage")) && data.dmg > 0 && (!e.damageTrigger || e.damageTrigger == data.type)) {
				KinkyDungeonSendTextMessage(6, TextGet("KDBurningFanFlamesDamageTaken").replace("DAMAGEDEALT", "" + data.dmg * e.power), "#ff0000", 2);
				KinkyDungeonDealDamage({
					type: e.damage,
					damage: data.dmg * e.power,
					flags: ["EchoDamage"],
				});
			}
		},
	},
	"beforeAttack": {
		"CounterattackDamage": (e, buff, entity, data) => {
			if (data.attacker && data.target == entity
				&& data.eventable
				&& (!(e.prereq == "hit") || (!data.missed && data.hit))
				&& (!(e.prereq == "hit-hostile") || (!data.missed && data.hit && !data.attacker.playWithPlayer
				// Player attacking = hostile?
				// Enemy attacking enemy? hostile
				&& (data.attacker.player || !data.target.player || KinkyDungeonAggressive(data.attacker))))) {
				if (data.attacker.player) {
					KinkyDungeonDealDamage({damage: e.power, type: e.damage, crit: e.crit, bindcrit: e.bindcrit, bind: e.bind, time: e.time, bindType: e.bindType,});
				} else {
					KinkyDungeonDamageEnemy(data.attacker, {damage: e.power, type: e.damage, crit: e.crit, bindcrit: e.bindcrit, bind: e.bind, bindType: e.bindType, time: e.time}, false, true, undefined, undefined, entity);
				}
				if (e.requiredTag)
					KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, e.requiredTag, 1);
			}
		},
		"CounterattackSpell": (e, buff, entity, data) => {
			if (data.attacker && data.target == entity
				&& data.eventable
				&& (!(e.prereq == "hit") || (!data.missed && data.hit))
				&& (!(e.prereq == "hit-hostile") || (!data.missed && data.hit && !data.attacker.playWithPlayer
				// Player attacking = hostile?
				// Enemy attacking enemy? hostile
				&& (data.attacker.player || !data.target.player || KinkyDungeonAggressive(data.attacker))))) {
				KinkyDungeonCastSpell(data.attacker.x, data.attacker.y, KinkyDungeonFindSpell(e.spell, true), undefined, undefined, undefined, entity.player ? "Player" : KDGetFaction(entity));
				if (e.requiredTag)
					KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, e.requiredTag, 1);
			}
		},
	},
	"afterDamageEnemy": {
		"ShrineElements": (e, buff, entity, data) => {
			if (data.enemy && data.enemy.hp > 0.52 && KDHostile(data.enemy) && data.faction == "Player" && !KDEventDataReset.ShrineElements && data.spell) {
				KDEventDataReset.ShrineElements = true;
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "shrineElements", 1);
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell(e.spell, true), undefined, undefined, undefined, "Player");

			}
		},
	},
	"playerAttack": {
		"ElementalEffect": (e, buff, entity, data) => {
			if (buff.duration > 0 && data.enemy && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
				if (!e.prereq || KDCheckPrereq(entity, e.prereq)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, false, e.power <= 0.5, undefined, undefined, undefined, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"ShadowStep": (e, buff, entity, data) => {
			if (data.enemy && KDHostile(data.enemy) && !KinkyDungeonPlayerBuffs.ShadowStep) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShadowStep", type: "SlowDetection", duration: e.time * 2, power: 0.667, player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["SlowDetection", "hit", "cast"]});
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShadowStep2", type: "Sneak", duration: e.time, power: Math.min(20, e.time * 2), player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["Sneak", "hit", "cast"]});
				if (e.requiredTag)
					KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, e.requiredTag, 1);
			}
		},
		"ApplyDisarm": (e, buff, entity, data) => {
			if (data.enemy && data.enemy == entity && data.enemy.Enemy.bound && (!e.prereq || KDCheckPrereq(data.enemy, e.prereq))) {
				let time = e.time || 0;
				if (!time && entity.buffs) time = KinkyDungeonGetBuffedStat(entity.buffs, "DisarmOnAttack");
				if (time > 0) {
					KDDisarmEnemy(data.enemy, time);
				}
			}
		},
	},
	"calcMana": {
		"Tablet": (e, buff, entity, data) => {
			if (data.spell != KinkyDungeonTargetingSpellItem && data.spell.tags && data.spell.tags.includes(e.requiredTag) || (data.spell.school && data.spell.school.toLowerCase() == e.requiredTag)) {
				data.cost = Math.max(data.cost * e.power, 0);
			}
		},
		"AvatarFire": (e, buff, entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("fire")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
		"AvatarAir": (e, buff, entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("air")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
		"AvatarWater": (e, buff, entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("water")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
		"AvatarEarth": (e, buff, entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("earth")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
	},
	"tick": {
		"Corrupted": (e, buff, entity, data) => {
			if (entity.player) {
				if (KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) > KDShadowThreshold) {
					buff.power = Math.min(0, buff.power + (e.power
						* Math.min(10, KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) / KDShadowThreshold)
					) * data.delta);
					buff.text = Math.round(buff.power * 100) + "%";
					if (buff.power < 0) {
						buff.duration = 9999;
					} else {
						buff.duration = 0;
					}
				}
			}
		},
		"ShadowDommed": (e, buff, entity, data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						buff.duration = 0;
					}
					KinkyDungeonSetFlag("PlayerDommed", 2);
				}
			}
		},
		"Haunting": (e, buff, entity, data) => {
			if (buff.power > 0 && entity.player) {
				let tags = ["comfyRestraints", "trap"];
				let restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(), KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], true, "Purple");
				if (!KinkyDungeonFlags.has("GhostHaunted") && !(KDNearbyEnemies(entity.x, entity.y, 1.5).filter((enemy) => {
					return KinkyDungeonAggressive(enemy);
				}).length > 0) && restraintAdd) {
					if (KDRandom() < 0.1 && KDNearbyEnemies(entity.x, entity.y, e.dist).filter((enemy) => {
						return KinkyDungeonAggressive(enemy);
					}).length > 0) {
						buff.power -= 1;
						KinkyDungeonAddRestraintIfWeaker(restraintAdd, KDGetEffLevel(),true, "Purple", true);
						KinkyDungeonSendTextMessage(5, TextGet("KDHaunting").replace("RestraintAdded", TextGet("Restraint" + restraintAdd.name)), "#ff5555", 1);
						if (e.count > 1) {
							for (let i = 1; i < e.count; i++) {
								restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], true, "Purple");
								KinkyDungeonAddRestraintIfWeaker(restraintAdd, KDGetEffLevel(),true, "Purple", true);
								KinkyDungeonSendTextMessage(5, TextGet("KDHaunting").replace("RestraintAdded", TextGet("Restraint" + restraintAdd.name)), "#ff5555", 1);
							}
						}
						KinkyDungeonSetFlag("GhostHaunted", 2 + Math.round(KDRandom() * 3));
					}
				}
			} else {
				buff.duration = 0;
			}
		},
		"Cursed": (e, buff, entity, data) => {
			if (buff.power > 0 && entity.player) {
				if (KinkyDungeonStatDistraction > 0.99 * KinkyDungeonStatDistractionMax) {
					let tags = ["obsidianRestraints", "shadowlatexRestraints", "shadowlatexRestraintsHeavy"];
					let restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], true, "Purple");
					if (restraintAdd) {
						if (KDRandom() < 0.2) {
							buff.power -= 1;
							KinkyDungeonAddRestraintIfWeaker(restraintAdd, KDGetEffLevel(),true, "Purple", true);
							KinkyDungeonSendTextMessage(5, TextGet("KDObserverCursed").replace("RestraintAdded", TextGet("Restraint" + restraintAdd.name)), "#ff5555", 1);
							if (e.count > 1) {
								for (let i = 1; i < e.count; i++) {
									restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], true, "Purple");
									KinkyDungeonAddRestraintIfWeaker(restraintAdd, KDGetEffLevel(),true, "Purple", true);
									KinkyDungeonSendTextMessage(5, TextGet("KDObserverCursed").replace("RestraintAdded", TextGet("Restraint" + restraintAdd.name)), "#ff5555", 1);
								}
							}
							KinkyDungeonSetFlag("ObserverCursed", 2 + Math.round(KDRandom() * 3));
						}
					}
				}
			} else {
				buff.duration = 0;
			}
		},
		"BoundByFate": (e, buff, entity, data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					if (!KDEffectTileTags(entity.x, entity.y).fate) {
						buff.duration = 0;
						KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, "soul", {name: "StarBondage", count: e.count, kind: e.kind, power: e.power});
						KDRemoveAoEEffectTiles(entity.x, entity.y, ["fate"], 1.5);
					}
				}
			}
		},
		"ApplyConduction": (e, buff, entity, data) => {
			let bb = Object.assign({}, KDConduction);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplySlowed": (e, buff, entity, data) => {
			let bb = Object.assign({}, KDSlowed);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplyVuln": (e, buff, entity, data) => {
			if (!entity.player) {
				if (!entity.vulnerable) entity.vulnerable = 1;
			}
		},
		"ApplyAttackSlow": (e, buff, entity, data) => {
			let bb = Object.assign({}, KDAttackSlow);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplySilence": (e, buff, entity, data) => {
			if (!buff.duration) return;
			if (!entity.player && entity.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(entity, e.prereq))
					KDSilenceEnemy(entity, e.duration);
			}
		},
		"ApplyGlueVuln": (e, buff, entity, data) => {
			let bb = Object.assign({}, KDGlueVulnLow);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"RemoveDrench": (e, buff, entity, data) => {
			if (!KDWettable(entity)) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs.Drenched;
					delete KinkyDungeonPlayerBuffs.Drenched2;
					delete KinkyDungeonPlayerBuffs.Drenched3;
				} else {
					delete entity.buffs.Drenched;
					delete entity.buffs.Drenched2;
					delete entity.buffs.Drenched3;
				}
			}
		},
		"RemoveConduction": (e, buff, entity, data) => {
			if (!KDConducting(entity)) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs.Conduction;
				} else {
					delete entity.buffs.Conduction;
				}
			}
		},
		"RemoveSlimeWalk": (e, buff, entity, data) => {
			if (KDSlimeImmuneEntity(entity)) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs[buff.id];
				} else {
					delete entity.buffs[buff.id];
				}
			}
		},
		"RemoveNoPlug": (e, buff, entity, data) => {
			if (!(KDEntityBuffedStat(entity, "Plug") > 0) && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs[buff.id];
				} else {
					delete entity.buffs[buff.id];
				}
			}
		},
		"ExtendDisabledOrHelpless": (e, buff, entity, data) => {
			if (!entity.player && (KinkyDungeonIsDisabled(entity) || KDHelpless(entity)) && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				buff.duration += data.delta;
			}
		},
		"ExtendDisabledOrHelplessOrChastity": (e, buff, entity, data) => {
			if (!entity.player && (KDEntityBuffedStat(entity, "Chastity") || KinkyDungeonIsDisabled(entity) || KDHelpless(entity)) && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				buff.duration += data.delta;
			}
		},
		"RemoveAuraHelpless": (e, buff, entity, data) => {
			if (!entity.player && KDHelpless(entity) && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				delete buff.aura;
			}
		},
		"RemoveFree": (e, buff, entity, data) => {
			if (!(entity.boundLevel > 0) && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs[buff.id];
				} else {
					delete entity.buffs[buff.id];
				}
			}
		},
		"RemoveFreeStrict": (e, buff, entity, data) => {
			if (!(entity.boundLevel > 0 || KinkyDungeonHasStatus(entity)) && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs[buff.id];
				} else {
					delete entity.buffs[buff.id];
				}
			}
		},
		"Distract": (e, buff, entity, data) => {
			if (entity.Enemy?.bound && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				if (!entity.distraction) entity.distraction = data.delta * e.power;
				else entity.distraction += data.delta * e.power;
			}
		},
		"RemoveBurning": (e, buff, entity, data) => {
			let drench = KDEntityGetBuff(entity, "Drenched");
			if (drench && drench.duration > data.delta) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs.Burning;
				} else {
					delete entity.buffs.Burning;
				}
				drench.duration -= data.delta;
			}
		},
		"RemoveRestraint": (e, buff, entity, data) => {
			// Removes restraint debuffs once the enemy has struggled out
			if (buff && buff.duration > data.delta && !entity.player) {
				if (!entity.Enemy.bound || entity.boundLevel <= 0.01)
					delete entity.buffs[buff.id];
			}
		},
		"ElementalEffect": (e, buff, entity, data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					KinkyDungeonDealDamage({
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
						flags: ["BurningDamage"]
					});
				} else {
					KinkyDungeonDamageEnemy(entity, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
						flags: ["BurningDamage"]
					}, false, true, undefined, undefined, undefined);
				}
			}
		},
	},

	"afterEnemyTick": {
		"nurseAura": (e, buff, enemy, data) => {
			KDEventMapEnemy[e.trigger][e.type](e, enemy, data);
		},
		// Simple spell checkerboard pattern
		"spellX": (e, buff, enemy, data) => {
			KDEventMapEnemy[e.trigger][e.type](e, enemy, data);
		},
		// Has 4 missiles, launches 1 at a time, reloads every e.time turns
		"Missiles": (e, buff, enemy, data) => {
			if (data.delta
				&& KinkyDungeonCanCastSpells(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {

				let nearby = (e.always || enemy.aware || enemy.vp > 0.5) ? KDNearbyEnemies(enemy.x, enemy.y, e.dist, enemy) : [];
				if ((e.always || enemy.aware || enemy.vp > 0.5)
					&& (e.always || nearby.length > 0 || KinkyDungeonAggressive(enemy))) {
					if (buff.power > 0) {
						let player = KinkyDungeonPlayerEntity;
						let playerdist = KDistChebyshev(enemy.x - player.x, enemy.y - player.y);
						if (nearby.length > 0) {
							nearby = nearby.filter((en) => {
								return KDistChebyshev(enemy.x - en.x, enemy.y - en.y) < playerdist;
							});
							if (nearby.length > 0) {
								player = nearby[Math.floor(KDRandom() * nearby.length)];
							}
						}

						if (KinkyDungeonCheckLOS(enemy, player, KDistChebyshev(enemy.x - player.x, enemy.y - player.y), 11 - Math.min(4, buff.power), false, true, 2)) {
							let origin = enemy;
							let spell = KinkyDungeonFindSpell(e.spell, true);
							let b = KinkyDungeonLaunchBullet(origin.x, origin.y,
								player.x,player.y,
								0.5, {noSprite: spell.noSprite, faction: KDGetFaction(enemy), name:spell.name, block: spell.block, width:spell.size, height:spell.size, summon:spell.summon,
									targetX: player.x, targetY: player.y, cast: Object.assign({}, spell.spellcast),
									source: enemy.id, dot: spell.dot,
									bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
									bulletSpin: spell.bulletSpin,
									effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
									effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
									passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
									pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
									lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: spell.range, hit:spell.onhit,
									damage: {evadeable: spell.evadeable, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}, false);
							b.visual_x = origin.x;
							b.visual_y = origin.y;
							let dist = KDistEuclidean(player.x - origin.x, player.y - origin.y);
							b.vy = 0.5 * (player.y - origin.y)/dist;
							b.vx = 0.5 * (player.x - origin.x)/dist;

							buff.power -= 1;
							KinkyDungeonSetEnemyFlag(enemy, "MissilesReload", e.time);
						}
					}
				}

				if (buff.power < (e.count || 4) && !KDEnemyHasFlag(enemy, "MissilesReload") && enemy.attackPoints < 1) {
					buff.power += 1;
					KinkyDungeonSetEnemyFlag(enemy, "MissilesReload", e.time);
				}
				buff.aurasprite = "Missiles" + Math.floor(buff.power);
			}
		},
		"Airbender": (e, buff, enemy, data) => {
			if (data.delta
				&& KinkyDungeonCanCastSpells(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {

				let nearby = (e.always || enemy.aware || enemy.vp > 0.5) ? KDNearbyEnemies(enemy.x, enemy.y, e.dist, enemy) : [];
				if ((e.always || enemy.aware || enemy.vp > 0.5)
					&& (e.always || nearby.length > 0 || KinkyDungeonAggressive(enemy))) {
					if (buff.power > 0) {
						let player = KinkyDungeonPlayerEntity;
						let playerdist = KDistChebyshev(enemy.x - player.x, enemy.y - player.y);
						if (nearby.length > 0) {
							nearby = nearby.filter((en) => {
								return KDistChebyshev(enemy.x - en.x, enemy.y - en.y) < playerdist;
							});
							if (nearby.length > 0) {
								player = nearby[Math.floor(KDRandom() * nearby.length)];
							}
						}

						if (KinkyDungeonCheckLOS(enemy, player, KDistChebyshev(enemy.x - player.x, enemy.y - player.y), 3, false, true, 2)) {
							let origin = enemy;
							let spell = KinkyDungeonFindSpell(e.spell, true);
							let b = KinkyDungeonLaunchBullet(origin.x, origin.y,
								player.x,player.y,
								0.5, {noSprite: spell.noSprite, faction: KDGetFaction(enemy), name:spell.name, block: spell.block, width:spell.size, height:spell.size, summon:spell.summon,
									targetX: player.x, targetY: player.y,//cast: Object.assign({}, spell.spellcast),
									source: enemy.id, dot: spell.dot,
									bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
									bulletSpin: spell.bulletSpin,
									effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
									effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
									passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
									pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
									lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: spell.range, hit:spell.onhit,
									damage: {evadeable: spell.evadeable, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags},
									spell: spell}, false);
							b.visual_x = origin.x;
							b.visual_y = origin.y;
							let dist = KDistEuclidean(player.x - origin.x, player.y - origin.y);
							b.vy = spell.speed * (player.y - origin.y)/dist;
							b.vx = spell.speed * (player.x - origin.x)/dist;

							buff.power -= 1;
							KinkyDungeonSetEnemyFlag(enemy, "AirbenderReload", e.time);
						}
					}
				}

				if (buff.power < (e.count || 2) && !KDEnemyHasFlag(enemy, "AirbenderReload")) {
					buff.power += 1;
					KinkyDungeonSetEnemyFlag(enemy, "AirbenderReload", e.time);
				}
				buff.aurasprite = "Airbender" + Math.floor(buff.power);
			}
		},
	},

	"tickAfter": {
		"ApplyConduction": (e, buff, entity, data) => {
			if (!buff.duration) return;
			let bb = Object.assign({}, KDConduction);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplySlowed": (e, buff, entity, data) => {
			if (!buff.duration) return;
			let bb = Object.assign({}, KDSlowed);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplyVuln": (e, buff, entity, data) => {
			if (!entity.player) {
				if (!entity.vulnerable) entity.vulnerable = 1;
			}
		},
		"ApplyAttackSlow": (e, buff, entity, data) => {
			if (!buff.duration) return;
			let bb = Object.assign({}, KDAttackSlow);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplySilence": (e, buff, entity, data) => {
			if (!buff.duration) return;
			if (!entity.player && entity.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(entity, e.prereq))
					KDSilenceEnemy(entity, e.duration);
			}
		},
		"ApplyGlueVuln": (e, buff, entity, data) => {
			if (!buff.duration) return;
			let bb = Object.assign({}, KDGlueVulnLow);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
	},
};

/**
 *
 * @param {string} Event
 * @param {any} buff
 * @param {any} entity
 * @param {*} data
 */
function KinkyDungeonHandleBuffEvent(Event, e, buff, entity, data) {
	if (Event === e.trigger && KDEventMapBuff[Event] && KDEventMapBuff[Event][e.type]) {
		KDEventMapBuff[Event][e.type](e, buff, entity, data);
	}
}


/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, *): void>>}
 */
let KDEventMapOutfit = {
	"calcEvasion": {
		"AccuracyBuff": (e, outfit, data) => {
			if (data.enemy && data.enemy.Enemy && data.enemy.Enemy.tags[e.requiredTag]) {
				data.hitmult *= e.power;
			}
		},
	},
	"tick": {
		"sneakBuff": (e, outfit, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: outfit.name + "Sneak", type: "SlowDetection", power: e.power, duration: 2,});
		},
	},
};

/**
 *
 * @param {string} Event
 * @param {any} outfit
 * @param {*} data
 */
function KinkyDungeonHandleOutfitEvent(Event, e, outfit, data) {
	if (Event === e.trigger && KDEventMapOutfit[Event] && KDEventMapOutfit[Event][e.type]) {
		KDEventMapOutfit[Event][e.type](e, outfit, data);
	}
}

/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, *): void>>}
 */
let KDEventMapSpell = {
	"affinity": {
		/**
		 * @param {KDEventData_affinity} data
		*/
		"RogueEscape": (e, spell, data) => {
			if (data.affinity == "Edge" || data.affinity == "Hook") {
				let nb = KDNearbyEnemies(data.entity.x, data.entity.y, e.dist).filter((enemy) => {
					return !enemy.Enemy.tags.ghost;
				});
				if (nb.length > 0) data.forceTrue = 2;
			}
		},
	},
	"postApply": {
		/**
		 * @param {KDEventData_PostApply} data
		*/
		"RogueEscape": (e, spell, data) => {
			if (KinkyDungeonFlags.get("SelfBondage")) {
				let buff = KDEntityGetBuff(data.player, "RogueEscape");
				if (buff)
					buff.duration = 0;
				buff = KDEntityGetBuff(data.player, "RogueEscape2");
				if (buff)
					buff.duration = 0;
			} else {
				KinkyDungeonApplyBuffToEntity(data.player, {
					id: "RogueEscape",
					type: "FastStruggle",
					aura: "#88ff88",
					buffSprite: true,
					power: e.power,
					duration: e.time,
				});
				KinkyDungeonApplyBuffToEntity(data.player, {
					id: "RogueEscape2",
					type: "BoostStruggle",
					power: 0.2,
					duration: e.time,
				});
			}
		},
	},
	"beforeCrit": {
		"RogueTraps2": (e, spell, data) => {
			if (data.faction == "Player" && data.spell && data.spell.tags?.includes("trap")) {
				data.forceCrit = true;
			}
		}
	},
	"postQuest": {
	},
	"blockPlayer": {
		"Riposte": (e, spell, data) => {
			KinkyDungeonDamageEnemy(data.enemy, {
				type: "stun",
				damage: 0,
				time: 3,
			}, false, true, undefined, undefined, undefined);
			if (!data.enemy?.vulnerable) {
				data.enemy.vulnerable = 1;
			}
		}
	},
	"beforeCast": {
		"RogueTraps": (e, spell, data) => {
			if (data.spell && data.spell.tags?.includes("trapReducible") && data.channel) {
				data.channel = 0;
			}
		}
	},
	"calcComp": {
		"OneWithSlime": (e, spell, data) => {
			if (data.spell && data.spell.tags && data.failed.length > 0 && (data.spell.tags.includes("slime") || data.spell.tags.includes("latex"))) {
				let tiles = KDGetEffectTiles(data.x, data.y);
				for (let t of Object.values(tiles)) {
					if (t.tags && (t.tags.includes("slime") || t.tags.includes("latex"))) {
						data.failed = [];
						return;
					}
				}
			}
		},
	},
	"canSprint": {
		"VaultBasic": (e, spell, data) => {
			if (!data.passThru) {
				let enemy = KinkyDungeonEntityAt(data.nextPosx, data.nextPosy);
				if (enemy && !enemy?.player && !KDIsImmobile(enemy) && (enemy.vulnerable || KinkyDungeonIsSlowed(enemy) || KinkyDungeonIsDisabled(enemy))) {
					data.passThru = true;
				}
			}
		},
		"Vault": (e, spell, data) => {
			if (!data.passThru) {
				let enemy = KinkyDungeonEntityAt(data.nextPosx, data.nextPosy);
				if (enemy && !enemy?.player && !KDIsImmobile(enemy)) {
					data.passThru = true;
				}
			}
		},
	},
	"perkOrb": {
		"Cursed": (e, spell, data) => {
			if (data.perks && data.perks.includes("Cursed")) {
				for (let shrine in KinkyDungeonShrineBaseCosts) {
					KinkyDungeonGoddessRep[shrine] = -50;
				}
			}
		},
	},
	"calcEdgeDrain": {
		"ChangeEdgeDrain": (e, spell, data) => {
			data.edgeDrain *= e.mult || 1;
			data.edgeDrain += e.power || 0;
		},
	},
	"calcMaxStats": {
		"IronWill": (e, spell, data) => {
			if (KinkyDungeonStatWill >= 9.999)
				data.staminaRate += e.power;
		},
		"SteadfastGuard": (e, spell, data) => {
			if (!e.power || KinkyDungeonStatWill >= e.power)
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "SteadfastGuard",
					type: "RestraintBlock",
					power: (KinkyDungeonStatWill - (e.power || 0)) * e.mult,
					duration: 2
				});
		},
		"IncreaseManaPool": (e, spell, data) => {
			KinkyDungeonStatManaPoolMax += e.power;
		},
	},
	"calcInvolOrgasmChance": {
		"OrgasmResist": (e, spell, data) => {
			if (KinkyDungeonStatWill >= 0.1 && !KinkyDungeonPlayerBuffs?.d_OrgasmResist) {
				data.invol_chance *= e.power;
			}
		},
	},

	"orgasm": {
		"RestoreOrgasmMana": (e, spell, data) => {
			if (KinkyDungeonStatWill > 0) {
				let willPercentage = data.wpcost < 0 ? -KinkyDungeonStatWill/data.wpcost : 1.0;
				if (willPercentage > 0)
					KinkyDungeonChangeMana(0, false, e.power * willPercentage);
				KinkyDungeonChangeMana(e.power, false, 0, false, willPercentage > 0.5);
			}
		},
		"OrgasmDamageBuff": (e, spell, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: spell.name + "DamageBuff",
				type: "magicDamageBuff",
				power: e.power,
				duration: e.time + (data.stunTime || 0)
			});
		},
		"ChangeOrgasmStamina": (e, spell, data) => {
			KDGameData.OrgasmStamina *= e.mult || 1;
			KDGameData.OrgasmStamina += e.power || 0;
		},
	},
	"tryOrgasm": {
		"ChangeWPCost": (e, spell, data) => {
			data.wpcost *= e.mult || 1;
			data.wpcost += e.power || 0;
		},
		"ChangeSPCost": (e, spell, data) => {
			data.spcost *= e.mult || 1;
			data.spcost += e.power || 0;
		},
	},
	"deny": {
		"RestoreDenyMana": (e, spell, data) => {
			let willPercentage = data.edgewpcost < 0 ? -KinkyDungeonStatWill/data.edgewpcost : 1.0;
			if (willPercentage > 0)
				KinkyDungeonChangeMana(0, false, e.power * willPercentage);
			KinkyDungeonChangeMana(e.power, false, 0, false, willPercentage > 0.5);
		},
	},
	"calcMultMana": {
		"StaffUser1": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.magic)
				data.cost = Math.max(data.cost * e.power, 0);
		},
	},
	"beforeMultMana": {
		"StaffUser3": (e, spell, data) => {
			if (data.spell && data.spell.upcastFrom)
				data.cost = data.cost * e.power;
		},
	},
	"calcMana": {
		"StaffUser2": (e, spell, data) => {
			if (data.spell && !data.spell.passive && data.spell.type != 'passive')
				data.cost = Math.max(data.cost - e.power, Math.min(data.cost, 1));
		},
	},
	"afterMultMana": {
		"ManaRegen": (e, spell, data) => {
			if (!KinkyDungeonPlayerBuffs.ManaRegenSuspend) {
				if (data.spell && (!data.spell.passive && !data.passive))
					data.cost = Math.max(0, data.cost - KinkyDungeonStatManaMax*e.mult);
			}
		},
	},
	"calcMiscast": {
		"DistractionCast": (e, spell, data) => {
			if (KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax > 0.99 || KinkyDungeonPlayerBuffs.DistractionCast) data.miscastChance -= 1.0;
		},
	},
	"duringPlayerDamage": {
		"ArcaneBarrier": (e, spell, data) => {
			if (data.dmg > 0) {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "ArcaneEnergy");
				let amount = KDEntityBuffedStat(player, "ArcaneEnergy");
				let efficiency = KinkyDungeonMultiplicativeStat(-e.power + KDEntityBuffedStat(player, "EfficiencyArcaneEnergy"));

				let dmgBefore = data.dmg;
				data.dmg = Math.max(0, data.dmg - Math.max(0, amount * (e.mult || 1)));

				if (buff) {
					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round((dmgBefore - data.dmg)*efficiency*10)} ${TextGet("KDArcaneEnergy")}`, "#8888ff", 3);
					buff.power = Math.max(0, buff.power - (dmgBefore - data.dmg)*efficiency);
					if (buff.power <= 0) buff.duration = 0;
					buff.text = Math.round(10 * KDEntityBuffedStat(player, "ArcaneEnergy"));
				}
			}
		}
	},
	"doAttackCalculation": {
		"BattleRhythm": (e, spell, data) => {
			if (data.target?.player && data.attacker) {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "BattleRhythm");
				let power = KDEntityBuffedStat(player, "BattleRhythm");
				let efficiency = 2.5 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "EfficiencyBattleRhythm"));
				let mult = power;
				let wouldHit = (data.EvasionRoll > data.BaseEvasion*KinkyDungeonMultiplicativeStat(data.accuracy - 1) - data.playerEvasion)
					&& (data.BlockRoll > data.BaseBlock*KinkyDungeonMultiplicativeStat(data.accuracy - 1) - data.playerBlock);
				data.accuracy = Math.max(0, data.accuracy-mult);
				let wouldHit2 = (data.EvasionRoll > data.BaseEvasion*KinkyDungeonMultiplicativeStat(data.accuracy - 1) - data.playerEvasion)
					&& (data.BlockRoll > data.BaseBlock*KinkyDungeonMultiplicativeStat(data.accuracy - 1) - data.playerBlock);
				if (power > 0 && wouldHit && !wouldHit2 && KDGameData.AncientEnergyLevel >= (e.energyCost || 0)) {
					if (buff) {
						let enemyPower = (data.attacker.Enemy?.power || 1) * 0.01;
						KinkyDungeonSendTextMessage(4, TextGet("KDBattleRhythmDodge"), "#ff8800", 2);
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round(efficiency*enemyPower*100)} ${TextGet("KDBattleRhythm")}`, "#ff8800", 3);
						buff.power = Math.max(0, buff.power - efficiency*enemyPower);
						if (buff.power <= 0) buff.duration = 0;
						buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					}
				}
			}
		},
	},
	"afterPlayerCast": {
		"ManaRegenSuspend": (e, spell, data) => {
			if (!KDEntityHasBuff(KinkyDungeonPlayerEntity, "ManaRegenSuspend") || !KDHasSpell("ManaRegenPlus2")) {
				let duration = KDHasSpell("ManaRegenFast2") ? e.time*0.25 : (KDHasSpell("ManaRegenFast") ? e.time*0.625 : e.time);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ManaRegenSuspend", type: "ManaRegenSuspend", power: 1, duration: Math.ceil(duration), aura: "#ff5555", buffSprite: true,
				});
			}
		},
	},
	"afterSpellTrigger": {
		"ManaRegenSuspend": (e, spell, data) => {
			if (!KDEntityHasBuff(KinkyDungeonPlayerEntity, "ManaRegenSuspend") || !KDHasSpell("ManaRegenPlus2")) {
				let duration = KDHasSpell("ManaRegenFast2") ? e.time*0.25 : (KDHasSpell("ManaRegenFast") ? e.time*0.625 : e.time);
				if (!data.notToggle) duration *= 0.5;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ManaRegenSuspend", type: "ManaRegenSuspend", power: 1, duration: Math.ceil(duration), aura: "#ff5555", buffSprite: true,
				});
			}
		},
	},
	"spellTrigger": {
		"ArcaneStore": (e, spell, data) => {
			if (!data.spell) return;
			if (!data.castID) data.castID = KinkyDungeonGetSpellID();
			if (!data.manacost) data.manacost = KinkyDungeonGetManaCost(data.spell, data.notPassive, !data.notToggle);
			if (data.manacost > 0 && !KinkyDungeonFlags.get("ArcaneStore" + data.castID)) {
				let player = KinkyDungeonPlayerEntity;
				let mult = 0.4 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "MultArcaneEnergy"));
				let powerAdded = data.manacost * mult;

				KDAddArcaneEnergy(player, powerAdded);

				// Set a flag to prevent duplicating this event
				KinkyDungeonSetFlag("ArcaneStore" + data.castID, 1);
			}
		},
	},
	"playerCast": {
		"ArcaneStore": (e, spell, data) => {
			if (data.spell && data.manacost > 0 && !KinkyDungeonFlags.get("ArcaneStore" + data.castID)) {
				let player = KinkyDungeonPlayerEntity;
				let mult = 0.4 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "MultArcaneEnergy"));
				let powerAdded = data.manacost * mult;

				KDAddArcaneEnergy(player, powerAdded);

				// Set a flag to prevent duplicating this event
				KinkyDungeonSetFlag("ArcaneStore" + data.castID, 1);
			}
		},
		"ArcaneBlast": (e, spell, data) => {
			if (data.spell && data.spell.name == "ArcaneBlast") {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "ArcaneEnergy");
				let power = KDEntityBuffedStat(player, "ArcaneEnergy");
				let efficiency = KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "EfficiencyArcaneEnergy"));
				if (power > 0 && data.bulletfired && KDGameData.AncientEnergyLevel >= (e.energyCost || 0)) {
					let damage = Math.min(KinkyDungeonStatManaMax * e.mult, power);

					data.bulletfired.bullet.damage.damage = damage;
					if (buff) {
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round(efficiency*damage*10)} ${TextGet("KDArcaneEnergy")}`, "#8888ff", 3);
						buff.power = Math.max(0, buff.power - efficiency*damage);
						if (buff.power <= 0) buff.duration = 0;
						buff.text = Math.round(10 * KDEntityBuffedStat(player, "ArcaneEnergy"));
					}
				}
			}
		},
		"ArrowFireSpell": (e, spell, data) => {
			if (data.bulletfired && data.bulletfired.bullet?.spell?.tags?.some((t) => {return e.tags.includes(t);}) && KDGameData.AncientEnergyLevel > (e.energyCost || 0)) {
				KinkyDungeonChangeCharge((-e.energyCost || 0));
				data.bulletfired.bullet.spell = KinkyDungeonFindSpell(e.spell, true);
				data.bulletfired.bullet.name = e.spell;
				if (data.bulletfired.bullet.damage)
				{
					if (e.power != undefined)
						data.bulletfired.bullet.damage.damage += e.power;
					if (e.damage != undefined)
						data.bulletfired.bullet.damage.type = e.damage;
					if (e.bind != undefined)
						data.bulletfired.bullet.damage.bind = e.bind;
					if (e.bindEff != undefined)
						data.bulletfired.bullet.damage.bindEff = e.bindEff;
					if (e.bindType != undefined)
						data.bulletfired.bullet.damage.bindType = e.bindType;
					data.bulletfired.bullet.damage.time = e.time;
				}
				// Unique to FireSpell
				if (e.aoe != undefined) {
					data.bulletfired.bullet.hit = "aoe";
				}
				data.bulletfired.bullet.height = 3;
				data.bulletfired.bullet.width = 3;
				data.bulletfired.bullet.pierceEnemies = undefined;
				data.bulletfired.bullet.piercing = undefined;
				data.bulletfired.bullet.bulletColor = 0xffaa44;
				data.bulletfired.bullet.bulletLight = 5;
				data.bulletfired.bullet.hitColor = 0xffaa44;
				data.bulletfired.bullet.hitLight = 5;

			}
		},
		"ArrowVineSpell": (e, spell, data) => {
			if (data.bulletfired && data.bulletfired.bullet?.spell?.tags?.some((t) => {return e.tags.includes(t);}) && KDGameData.AncientEnergyLevel > (e.energyCost || 0)) {
				KinkyDungeonChangeCharge((-e.energyCost || 0));
				data.bulletfired.bullet.spell = KinkyDungeonFindSpell(e.spell, true);
				data.bulletfired.bullet.name = e.spell;
				if (data.bulletfired.bullet.damage)
				{
					if (e.power != undefined)
						data.bulletfired.bullet.damage.damage += e.power;
					if (e.damage != undefined)
						data.bulletfired.bullet.damage.type = e.damage;
					if (e.bind != undefined)
						data.bulletfired.bullet.damage.bind = e.bind;
					if (e.bindEff != undefined)
						data.bulletfired.bullet.damage.bindEff = e.bindEff;
					if (e.bindType != undefined)
						data.bulletfired.bullet.damage.bindType = e.bindType;
					data.bulletfired.bullet.damage.time = e.time;
				}
				// Unique to VineSpell
				data.bulletfired.bullet.pierceEnemies = undefined;
				data.bulletfired.bullet.piercing = undefined;
				data.bulletfired.bullet.bulletColor = 0x55ff55;
				data.bulletfired.bullet.hitColor = 0x55ff55;
				data.bulletfired.bullet.hitLight = 5;

			}
		},
		"DistractionCast": (e, spell, data) => {
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.99 || KinkyDungeonPlayerBuffs.DistractionCast) {
				let tb = KinkyDungeonGetManaCost(data.spell) * 0.6;
				KinkyDungeonTeaseLevelBypass += tb;
				KDGameData.OrgasmStage = Math.min((KDGameData.OrgasmStage + Math.ceil(tb)) || tb, KinkyDungeonMaxOrgasmStage);
			}
		},
		"LightningRod": (e, spell, data) => {
			if (data.spell && data.spell.tags && data.spell.manacost > 0 && (data.spell.tags.includes("air") || data.spell.tags.includes("electric"))) {
				let bb = Object.assign({}, KDConduction);
				bb.duration = 4;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "LightningRod", type: "electricDamageResist", aura: "#ffff00", power: e.power, player: true, duration: 4,
				});
			}
		},
		"LeatherBurst": (e, spell, data) => {
			if (data.spell && data.spell.tags && (data.spell.tags.includes("leather") && data.spell.tags.includes("burst"))) {
				let power = KDEntityBuffedStat(KinkyDungeonPlayerEntity, "LeatherBurst");
				if (power < e.power) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "LeatherBurst", type: "LeatherBurst", aura: "#ffffff", power: power + 1, player: true, duration: 1.1
					});
					if (power > 0)
						data.delta = 0;
				} else {
					KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "LeatherBurst");
				}
			}
		},
	},
	"calcEvasion": {
		"HandsFree": (e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell)) && data.flags.KDEvasionHands) {
				data.flags.KDEvasionHands = false;
			}
		},
		"ArmsFree": (e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell)) && data.flags.KDEvasionArms) {
				data.flags.KDEvasionArms = false;
			}
		},
	},
	"calcManaPool": {
		"EdgeRegenBoost": (e, spell, data) => {
			if (KDIsEdged(KinkyDungeonPlayerEntity)) {
				data.manaPoolRegen += e.power;
			}
		},
	},
	"tick": {
		"ArcaneEnergyBondageResist": (e, spell, data) => {
			let player = KinkyDungeonPlayerEntity;
			let buff = KDEntityGetBuff(player, spell.name + "AEBR");
			let amount = Math.min(e.power, e.mult * KDEntityBuffedStat(player, "ArcaneEnergy"));
			if (!buff) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
					{id: spell.name + "AEBR", type: "RestraintBlock", duration: 2, power: amount/10}
				);
			} else {
				buff.power = amount;
				buff.duration = 2;
			}
		},
		"BREvasionBlock": (e, spell, data) => {
			let player = KinkyDungeonPlayerEntity;
			if (KDEntityBuffedStat(player, "BattleRhythm") > e.mult) {
				KinkyDungeonApplyBuffToEntity(player,
					{id: spell.name + "BREvasion", type: "Evasion", duration: 2, power: e.power}
				);
				KinkyDungeonApplyBuffToEntity(player,
					{id: spell.name + "BRBlock", type: "Block", duration: 2, power: e.power}
				);
			}
		},
		"BRDecay": (e, spell, data) => {
			let player = KinkyDungeonPlayerEntity;
			if (KDEntityBuffedStat(player, "BattleRhythm") > 0 && !KinkyDungeonFlags.get("PlayerCombat")) {
				let buff = KDEntityGetBuff(player, "BattleRhythm");
				if (buff) {
					buff.power = Math.max(0, buff.power - data.delta*e.power);
					buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round((e.power)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8800", 3);
					if (buff.power == 0) buff.duration = 0;
				}
			}
		},
		"OrgasmResistBuff": (e, spell, data) => {
			if (!KinkyDungeonPlayerBuffs?.d_OrgasmResist)
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
					{id: "e_OrgasmResist", aura: "#ffffff", aurasprite: "Null", type: "e_OrgasmResist", duration: 2, power: 1, buffSprite: true,
						click: "OrgasmResist",
						player: true, enemies: true}
				);
		},
		"ManaRegenOld": (e, spell, data) => {
			if (KinkyDungeonStatMana + KinkyDungeonStatManaPool < KinkyDungeonStatManaMax * e.mult && !KinkyDungeonPlayerBuffs.ManaRegenSuspend) {

				KinkyDungeonChangeMana(e.power, false, 0, false, false);
				if (KinkyDungeonStatMana > KinkyDungeonStatManaMax * e.mult) KinkyDungeonStatMana = KinkyDungeonStatManaMax * e.mult;
			}
			if (KinkyDungeonStatMana + KinkyDungeonStatManaPool <= KinkyDungeonStatManaMax * e.mult) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
					{id: "InnerPowerArcaneStore", aura: "#ff5555", aurasprite: "Null", type: "DisableArcaneStore", duration: 2, power: 1, buffSprite: true}
				);
			}
		},
		"SatisfiedDamageBuff": (e, spell, data) => {
			if (KDGameData.OrgasmStamina > 0 && (!KinkyDungeonPlayerBuffs || !KinkyDungeonPlayerBuffs[spell.name + "DamageBuff"] || KinkyDungeonPlayerBuffs[spell.name + "DamageBuff"].duration == 0))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: spell.name + "DamageBuffMinor",
					type: "magicDamageBuff",
					power: e.power,
					duration: 2
				});
		},
		"RestoreEdgeMana": (e, spell, data) => {
			if (KDIsEdged(KinkyDungeonPlayerEntity) && data.delta > 0) {
				KinkyDungeonChangeMana(e.power, true, 0, false, KinkyDungeonStatWill > 0);
				if (KinkyDungeonStatWill > 0) {
					KinkyDungeonChangeMana(0, true, e.power);
				}
			}
		},
		"Parry": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.power, duration: 2,});
			}
		},
		"WillParry": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && !KinkyDungeonPlayerDamage.light) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.mult * KinkyDungeonStatWillMax, duration: 2,});
			}
		},
		"SteelParry": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && KinkyDungeonMeleeDamageTypes.includes(KinkyDungeonPlayerDamage.type)) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.mult * KinkyDungeonStatWillMax, duration: 2,});
			}
		},
		"GuardBoost": (e, spell, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: .1 + 0.5 * KinkyDungeonStatWill/KinkyDungeonStatWillMax, duration: 2,});
		},
		"DaggerParry": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && KinkyDungeonPlayerDamage.light) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.power, duration: 2,});
			}
		},
		"ClaymoreParry": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && KinkyDungeonPlayerDamage.heavy) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.power, duration: 2,});
			}
		},
		"DistractionCast": (e, spell, data) => {
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.99)
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "DistractionCast", type: "sfx", power: 1, duration: 4, sfxApply: "PowerMagic", aura: "#ff8888", aurasprite: "Heart"
				});
		},
		"Buff": (e, spell, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: spell.name + e.buffType,
					type: e.buffType,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: 2
				});
		},
		"SlimeMimic": (e, spell, data) => {
			let tags = KDEffectTileTags(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			let condition = KinkyDungeonLastAction == "Wait" && (tags.slime || tags.latex);
			let altcondition = (KinkyDungeonPlayerTags.get("Latex") || KinkyDungeonPlayerTags.get("Slime"))
				&& KinkyDungeonIsArmsBound(false, false)
				&& KinkyDungeonGagTotal() > 0.05
				&& KinkyDungeonSlowLevel > 0;
			if (condition || altcondition) {
				let power = 4;
				let groups = {};
				for (let inv of KinkyDungeonAllRestraintDynamic()) {
					if (!groups[KDRestraint(inv.item).Group]
						&& (KDRestraint(inv.item).shrine?.includes("Latex") || KDRestraint(inv.item).shrine?.includes("Slime"))) {
						groups[KDRestraint(inv.item).Group] = true;
						power += 4;
					}
				}
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
					{id: "SlimeMimic", aura: "#ff00ff", type: "SlowDetection", duration: 2, power: Math.min(24, power),
						click: "SlimeMimic", disabletypes: ["d_SlimeMimic"],
						player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["SlowDetection", "move", "cast", "attack"]}
				);
			}
		},
		"AccuracyBuff": (e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true))) {
				//KDBlindnessCap = Math.min(KDBlindnessCap, e.power);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: spell.name + e.type + e.trigger,
					type: "Accuracy",
					duration: 1,
					power: e.power,
				});
			}
		},
		"Analyze": (e, spell, data) => {
			let activate = false;
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true)) && !KinkyDungeonPlayerBuffs.Analyze) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Analyze", aura:"#ff5555", type: "MagicalSight", power: e.power, duration: e.time});
				activate = true;
			}
			if (KinkyDungeonPlayerBuffs.Analyze && KinkyDungeonPlayerBuffs.Analyze.duration > 1) {
				// Nothing!
			} else if (!activate) {
				KinkyDungeonDisableSpell("Analyze");
				KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "Analyze");
			}
		},
	},
	"calcStats": {
		"Blindness": (e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true))) {
				//KDBlindnessCap = Math.min(KDBlindnessCap, e.power);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: spell.name + e.type + e.trigger,
					type: "Blindness",
					duration: e.time ? e.time : 0,
					power: -1
				});
			}
		},
	},
	"beforeMove": {
		"FleetFooted": (e, spell, data) => {
			if (!data.IsSpell && !KinkyDungeonNoMoveFlag && KinkyDungeonSlowLevel > 1 && KinkyDungeonHasStamina(1.1) && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true))) {
				let manacost = -KinkyDungeonGetManaCost(spell, true);
				e.prevSlowLevel = KinkyDungeonSlowLevel;
				KinkyDungeonSlowLevel = Math.max(0, KinkyDungeonSlowLevel - e.power);
				if (KinkyDungeonHasMana(1.5) && KDGameData.MovePoints < 0) {
					KDGameData.MovePoints = Math.min(0, KDGameData.MovePoints + 1);
					manacost -= 1.5;
					KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonFleetFootedIgnoreSlow"), "lightgreen", 2);
				}
				else KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonFleetFooted"), "lightgreen", 2, false, true);
				KinkyDungeonChangeMana(manacost);
			}
		},
	},
	"afterMove": {
		"FleetFooted": (e, spell, data) => {
			if (e.prevSlowLevel && !data.IsSpell && KinkyDungeonSlowLevel < e.prevSlowLevel) {
				KinkyDungeonSlowLevel = e.prevSlowLevel;
				e.prevSlowLevel = undefined;
			}
		},
	},
	"beforeTrap": {
		"FleetFooted": (e, spell, data) => {
			if (data.flags.AllowTraps && !data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true))) {
				if (KDRandom() < e.chance) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, true));
					data.flags.AllowTraps = false;
					KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonFleetFootedIgnoreTrap"), "lightgreen", 2);
				} else {
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonFleetFootedIgnoreTrapFail"), "lightgreen", 2);
				}
			}
		},
	},
	"afterDamageEnemy": {
		"IcePrison": (e, spell, data) => {
			if (data.enemy && data.froze) {
				if ((!e.chance || KDRandom() < e.chance)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: "ice",
						damage: 0,
						time: 0,
						bind: data.froze + data.enemy.Enemy.maxhp * 0.1,
						bindType: "Ice",
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					if (KDHelpless(data.enemy) && !(data.enemy.freeze > 300)) data.enemy.freeze = 300;
				}
			}
		},
	},
	"duringCrit": {
		"RogueTargets": (e, spell, data) => {
			if (data.dmg > 0 && data.critical && data.enemy && !data.customCrit && KDHostile(data.enemy) && !KDEnemyHasFlag(data.enemy, "RogueTarget")) {
				data.crit *= e.mult;
				data.bindcrit *= e.mult;
				KinkyDungeonSetEnemyFlag(data.enemy, "RogueTarget", -1);
				KDDamageQueue.push({floater: TextGet("KDRogueCritical"), Entity: data.enemy, Color: "#ff5555", Delay: data.Delay});
				data.customCrit = true;
			}
		},
		"RogueBind": (e, spell, data) => {
			if (data.dmg > 0 && data.critical && data.enemy && !data.customCrit && KDHostile(data.enemy)) {
				if (data.bind || KinkyDungeonBindingDamageTypes.includes(data.type) || data.bindEff) {
					KDDamageQueue.push({floater: TextGet("KDBindCritical"), Entity: data.enemy, Color: "#ff55aa", Delay: data.Delay});
					data.customCrit = true;
				}

			}
		},
	},

	"beforeDamageEnemy": {

		"MultiplyDamageStealth": (e, spell, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && !data.enemy.aware && data.spell == spell) {
				if ((!e.humanOnly || data.enemy.Enemy.bound) && (!e.chance || KDRandom() < e.chance)) {
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		},
		"Peasant": (e, spell, data) => {
			if (data.dmg > 0 && data.enemy && data.enemy.Enemy.tags.plant) {
				data.dmg = Math.max(data.dmg * e.mult, 0);
			}
		},
		"MakeVulnerable": (e, spell, data) => {
			if (data.enemy && data.spell == spell) {
				if ((!e.humanOnly || data.enemy.Enemy.bound) && (!e.chance || KDRandom() < e.chance) && !data.enemy.Enemy.tags.nonvulnerable) {
					if (!data.enemy.vulnerable) data.enemy.vulnerable = 0;
					data.enemy.vulnerable = Math.max(0, e.time);
				}
			}
		},
		"TemperaturePlay": (e, spell, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && ["fire", "frost", "ice"].includes(data.type)) {
				if ((!e.humanOnly || data.enemy.Enemy.bound) && (!e.chance || KDRandom() < e.chance)) {
					let percent = Math.min(1, KDBoundEffects(data.enemy) / 4);
					data.dmg = Math.max(data.dmg * (1 + e.power * percent), 0);
				}
			}
		},
		"Burning": (e, spell, data) => {
			if (data.enemy && (!data.flags || !data.flags.includes("BurningDamage")) && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if ((!e.chance || KDRandom() < e.chance)) {
					KinkyDungeonApplyBuffToEntity(data.enemy, KDBurning);
				}
			}
		},
	},
	"calcDamage": {
		"HandsFree": (e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags.KDDamageHands) {
				data.flags.KDDamageHands = false;
			}
		},
		"ArmsFree": (e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags.KDDamageArms) {
				data.flags.KDDamageArms = false;
			}
		},
	},
	"getWeapon": {
		"HandsFree": (e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags && !data.flags.HandsFree) {
				data.flags.HandsFree = true;
			}
		},
	},
	"beforePlayerAttack" : {
		"Shatter": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && (KinkyDungeonPlayerDamage.name == "IceBreaker") && data.enemy && data.enemy.freeze > 0 && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true))) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, true));
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("ShatterStrike", true), undefined, undefined, undefined);
				//KDTriggerSpell(spell, data, false, true);
			}
		},
		"BoostDamage": (e, spell, data) => {
			if (data.eva && KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				if (KDCheckPrereq(null, e.prereq, e, data)) {
					KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
					data.buffdmg = Math.max(0, data.buffdmg + e.power);
					KDTriggerSpell(spell, data, false, false);
				}
			}
		},
		/*"CritBoost": (e, spell, data) => {
			if (data.eva&& !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				if (KDCheckPrereq(null, e.prereq, e, data)) {
					let power = Math.max(0, Math.max((Math.max(KinkyDungeonPlayerDamage.chance || 0, KinkyDungeonGetEvasion()) - 1)*e.power));
					data.buffdmg = Math.max(0, data.buffdmg + (KinkyDungeonPlayerDamage.dmg || 0) * power);
				}
			}
		},*/
	},
	"calcDisplayDamage": {
		"BoostDamage": (e, spell, data) => {
			if (KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true))) {
				if (KDCheckPrereq(null, e.prereq, e, data)) {
					data.buffdmg = Math.max(0, data.buffdmg + e.power);
				}
			}
		},
		/*"CritBoost": (e, spell, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data)) {
				let power = Math.max(0, Math.max(((KinkyDungeonPlayerDamage.chance || 0) - 1)*e.power));
				data.buffdmg = Math.max(0, data.buffdmg + (KinkyDungeonPlayerDamage.dmg || 0) * power);
			}
		},*/
	},
	"calcBindCrit": {
		"RogueBind": (e, spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				data.critboost += e.power;
			}
		},
	},
	"calcCrit": {
		"CritBoost": (e, spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				let power = Math.max(0, Math.max(((data.accuracy || 0) - 1)*e.power));
				data.critboost = Math.max(0, data.critboost + power);
			}
		},
		"MagicalOverload": (e, spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				data.critmult *= 1 + (e.power * KinkyDungeonStatDistraction / 10);
			}
		},
	},
	"tickAfter": {
		"Frustration": (e, spell, data) => {
			for (let en of KDMapData.Entities) {
				if (en.Enemy.bound && !en.Enemy.nonHumanoid && en.buffs && KDEntityBuffedStat(en, "Chastity")) {
					if (KDHelpless(en)) {
						let Enemy = KinkyDungeonGetEnemyByName("PetChastity");
						let doll = {
							summoned: true,
							faction: "Rage",
							Enemy: Enemy,
							id: KinkyDungeonGetEnemyID(),
							x: en.x,
							y: en.y,
							hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
							movePoints: 0,
							attackPoints: 0
						};
						KDAddEntity(doll);
						en.hp = 0;
					}
				}
			}
		},
	},
	"beforePlayerLaunchAttack": {
		"BattleRhythmStore": (e, spell, data) => {
			if (data.target && -data.attackCost > 0 && !KinkyDungeonFlags.get("BRStore" + data.target.id)) {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "BattleRhythm");
				let max = KinkyDungeonMultiplicativeStat(1 + KDEntityBuffedStat(player, "MaxBattleRhythm"));
				let mult = 0.2 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "MultBattleRhythm"));
				let powerAdded = 0.1 * -data.attackCost * mult;
				if (!buff) {
					powerAdded = Math.min(powerAdded, max);
					KinkyDungeonApplyBuffToEntity(player,
						{
							id: "BattleRhythm",
							type: "BattleRhythm",
							aura: "#ff8800",
							aurasprite: "Null",
							buffSprite: true,
							//buffSprite: true,
							power: powerAdded,
							duration: 9999,
							text: Math.round(100 * powerAdded),
						}
					);
					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `+${Math.round(powerAdded*100)} ${TextGet("KDBattleRhythm")}`, "#ff8800", 3);
				} else {
					let origPower = buff.power;
					buff.power += powerAdded;
					buff.power = Math.min(buff.power, max);
					buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `+${Math.round((buff.power - origPower)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8800", 3);
				}

				// Set a flag to prevent duplicating this event
				KinkyDungeonSetFlag("ArcaneStore" + data.castID, 1);
			}
		},
	},
	"playerAttack": {
		"FlameBlade": (e, spell, data) => {
			if (KinkyDungeonPlayerDamage && ((KinkyDungeonPlayerDamage.name && KinkyDungeonPlayerDamage.name != "Unarmed") || KinkyDungeonStatsChoice.get("Brawler")) && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.targetX && data.targetY && (data.enemy && KDHostile(data.enemy))) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
				KinkyDungeonCastSpell(data.targetX, data.targetY, KinkyDungeonFindSpell("FlameStrike", true), undefined, undefined, undefined);
				KDTriggerSpell(spell, data, false, false);
			}
		},
		"ManaRegenSuspend": (e, spell, data) => {
			if (!KDHasSpell("ManaRegenPlus")) {
				let time = e.time;
				if (KDHasSpell("ManaRegenFast2")) time *= 0.25;
				else if (KDHasSpell("ManaRegenFast")) time *= 0.625;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ManaRegenSuspend", type: "ManaRegenSuspend", power: 1, duration: Math.ceil(time), aura: "#ff5555", buffSprite: true,
				});
			}
		},
		"ElementalEffect": (e, spell, data) => {
			if (KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
				KDTriggerSpell(spell, data, false, false);
				KinkyDungeonDamageEnemy(data.enemy, {
					type: e.damage,
					damage: e.power,
					time: e.time,
					bind: e.bind,
					bindType: e.bindType,
				}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity);
			}
		},
		"EffectTile": (e, spell, data) => {
			if (KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
				KDTriggerSpell(spell, data, false, false);
				KDCreateEffectTile(data.targetX, data.targetY, {
					name: e.kind,
					duration: e.duration,
				}, e.variance);
			}
		},
		"FloatingWeapon": (e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.targetX && data.targetY && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy))) {
				let chanceWith = KinkyDungeonPlayerDamage.chance;
				let weapon = KinkyDungeonPlayerDamage;
				let chanceWithout = KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon(true,undefined, weapon), true).chance;
				KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon(undefined, undefined, weapon));
				if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && chanceWithout < chanceWith) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
					KDTriggerSpell(spell, data, false, false);
				}
			}
		},
	},
	"beforeStruggleCalc": {
		"ModifyStruggle": (e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.escapeChance != undefined && (!e.StruggleType || e.StruggleType == data.struggleType)) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
				KDTriggerSpell(spell, data, false, false);
				if (e.mult && data.escapeChance > 0)
					data.escapeChance *= e.mult;
				if (e.power)
					data.escapeChance += e.power;
				if (e.msg) {
					KinkyDungeonSendTextMessage(10 * e.power, TextGet(e.msg), "lightgreen", 2);
				}
			}
		},
		"WillStruggle": (e, spell, data) => {
			if (data.escapeChance != undefined && (!e.StruggleType || e.StruggleType == data.struggleType)) {
				if (!e.power || KinkyDungeonStatWill > e.power) {
					let boost = (KinkyDungeonStatWill - (e.power || 0)) * e.mult;
					data.escapeChance += boost;
					if (e.msg)
						KinkyDungeonSendTextMessage(10 * boost, TextGet(e.msg).replace("AMOUNT", "" + Math.round(100*boost)), "lightgreen", 2);
				}
			}
		},
	},
	"vision": {
		"TrueSight": (e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true)) && data.flags) {
				if (data.update) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, true) * data.update);
				}
				data.flags.SeeThroughWalls = Math.max(data.flags.SeeThroughWalls, 2);
			}
		},
	},
	"calcVision": {
		"Multiply": (e, spell, data) => {
			data.visionMult *= e.mult;
		},
		"Add": (e, spell, data) => {
			data.max += e.power;
		},
	},
	"calcHearing": {
		"Multiply": (e, spell, data) => {
			data.hearingMult *= e.mult;
		},
	},
	"draw": {
		/*"EnemySense": (e, spell, data) => {
			let activate = false;
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell)) && !KinkyDungeonPlayerBuffs.EnemySense) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell) * data.update);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "EnemySense", type: "EnemySense", duration: 13});
				activate = true;
			}
			if (KinkyDungeonPlayerBuffs.EnemySense && KinkyDungeonPlayerBuffs.EnemySense.duration > 1)
				for (let enemy of KDMapData.Entities) {
					if (!KinkyDungeonVisionGet(enemy.x, enemy.y)
						&& Math.sqrt((KinkyDungeonPlayerEntity.x - enemy.x) * (KinkyDungeonPlayerEntity.x - enemy.x) + (KinkyDungeonPlayerEntity.y - enemy.y) * (KinkyDungeonPlayerEntity.y - enemy.y)) < e.dist) {
						let color = "#882222";
						if (enemy.Enemy.stealth > 0 || KDAmbushAI(enemy)) color = "#441111";
						if (color == "#882222" || Math.sqrt((KinkyDungeonPlayerEntity.x - enemy.x) * (KinkyDungeonPlayerEntity.x - enemy.x) + (KinkyDungeonPlayerEntity.y - enemy.y) * (KinkyDungeonPlayerEntity.y - enemy.y)) < e.distStealth)
							KDDraw(kdcanvas, kdpixisprites, enemy.id + "_sense", KinkyDungeonRootDirectory + "Aura.png",
								(enemy.visual_x - data.CamX - data.CamX_offset) * KinkyDungeonGridSizeDisplay,
								(enemy.visual_y - data.CamY - data.CamY_offset) * KinkyDungeonGridSizeDisplay,
								KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
									tint: string2hex(color),
								});
					}
				}
			else if (!activate) {
				KinkyDungeonDisableSpell("EnemySense");
				KinkyDungeonExpireBuff(KinkyDungeonPlayerBuffs, "EnemySense");
			}
		},*/
	},
	"getLights": {
		"Light": (e, spell, data) => {
			let activate = false;
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && !KinkyDungeonPlayerBuffs.Light) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Light", type: "Light", duration: e.time, aura: "#ffffff"});
				KDTriggerSpell(spell, data, false, true);
				activate = true;
				KinkyDungeonUpdateLightGrid = true;
			}
			if (KinkyDungeonPlayerBuffs.Light && KinkyDungeonPlayerBuffs.Light.duration > 1) {
				data.lights.push({brightness: e.power, x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y,
					color: string2hex(e.color || "#ffffff")});
			} else if (!activate) {
				KinkyDungeonDisableSpell("Light");
				KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "Light");
			}
		},
	},
	"toggleSpell": {
		"ExclusiveTag": (e, spell, data) => {
			if (spell && spell.name == data.spell?.name && KinkyDungeonSpellChoicesToggle[data.index] && !data.recursion?.includes(spell.name))
				for (let i = 0; i < KinkyDungeonSpellChoices.length; i++) {
					let spellOther = KinkyDungeonSpells[KinkyDungeonSpellChoices[i]];
					if (spellOther?.name != spell.name)
						for (let tag of e.tags) {
							if (KinkyDungeonSpellChoicesToggle[i] && spellOther?.tags?.includes(tag)) {
								KinkyDungeonSpellChoicesToggle[i] = false;
								data.recursion = data.recursion ? [spell.name, ...data.recursion] : [spell.name];
								KinkyDungeonSendEvent("toggleSpell", {index: i, spell: KinkyDungeonSpells[KinkyDungeonSpellChoices[i]], recursion: data.recursion}, KinkyDungeonSpells[KinkyDungeonSpellChoices[i]]);
							}
						}

				}
		},
		"ChaoticOverflow": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "ChaoticOverflow");
				if (!buff) {
					let amount = KinkyDungeonStatWillMax*e.mult;
					if (KinkyDungeonStatWill >= amount-0.01) {
						if (KinkyDungeonGetRestraint({tags: ["crystalRestraints", "crystalRestraintsHeavy"]}, KDGetEffLevel() + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
							true, "Gold", false, false, false) != undefined) {
							KinkyDungeonApplyBuffToEntity(player, {
								id: spell.name + "1",
								type: "NoLegsComp",
								duration: e.time,
								power: 1,
							});
							KinkyDungeonApplyBuffToEntity(player, {
								id: spell.name + "2",
								type: "NoArmsComp",
								duration: e.time,
								power: 1,
							});
							KinkyDungeonApplyBuffToEntity(player, {
								id: spell.name + "3",
								type: "NoVerbalComp",
								duration: e.time,
								power: 1,
							});
							KinkyDungeonApplyBuffToEntity(player, {
								id: spell.name,
								type: "NoVerbalComp",
								duration: e.time+1,
								power: 1,
								aura: "#ff8888",
								buffSprite: true,
								events: [
									{trigger: "expireBuff", type: "ChaoticOverflow", count: 1},
								],
							});



							KinkyDungeonChangeMana(KinkyDungeonStatManaMax, false, 0, false, false);
							KinkyDungeonChangeWill(-amount);
						} else {
							KinkyDungeonSendTextMessage(10, TextGet("KDChaoticOverflow_NoBind"), "#ff8888", 2, true);
						}
					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDChaoticOverflow_No"), "#ff8888", 2, true);
					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDChaoticOverflow_Already"), "#ff8888", 2, true);
				}

			}
		},
		"AkashicConflux": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				let power = KDEntityBuffedStat(player, "ArcaneEnergy");
				let efficiency = KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "EfficiencyArcaneEnergy"));
				if (power > e.power) {
					let buff = KDEntityGetBuff(player, "ArcaneEnergy");

					if (buff) {
						KinkyDungeonApplyBuffToEntity(player, {
							id: spell.name,
							type: "NoLegsComp",
							duration: e.time,
							power: 1,
							aura: "#aaffaa",
							buffSprite: true,
						});
						KinkyDungeonApplyBuffToEntity(player, {
							id: spell.name + "2",
							type: "NoArmsComp",
							duration: e.time,
							power: 1,
						});
						KinkyDungeonApplyBuffToEntity(player, {
							id: spell.name + "3",
							type: "NoVerbalComp",
							duration: e.time,
							power: 1,
						});

						KinkyDungeonChangeMana(efficiency*e.power, false, 0, false, true);
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round(efficiency*e.power*10)} ${TextGet("KDArcaneEnergy")}`, "#8888ff", 3);
						buff.power = Math.max(0, buff.power - efficiency*e.power);
						if (buff.power <= 0) buff.duration = 0;
						buff.text = Math.round(10 * KDEntityBuffedStat(player, "ArcaneEnergy"));
					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDAkashicConflux_No").replace("AMNT", "" + Math.round(10*(e.power * efficiency))), "#9074ab", 2, true);

				}

			}
		},
		"ManaRecharge": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;
				if (KinkyDungeonStatMana < KinkyDungeonStatManaMax) {
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonChangeWill(-KinkyDungeonStatWill*e.mult);
					if (KinkyDungeonStatWill > 0) {
						KinkyDungeonChangeMana(KinkyDungeonStatManaMax, true, 0, false, false);
						KinkyDungeonSendTextMessage(5, TextGet("KDManaRecharge_Success"), "#9074ab", 10);
					} else {
						let restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
							true, "Gold", false, false, false);

						if (restraintToAdd) {
							KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
							if (e.count > 1)
								for (let i = 1; i < (e.count || 1); i++) {
									restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
										true, "Gold", false, false, false);
									if (restraintToAdd) KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
								}

							KinkyDungeonChangeMana(KinkyDungeonStatManaMax, true, 0, false, false);
							KinkyDungeonSendTextMessage(10, TextGet("KDManaRecharge_Mixed"), "#9074ab", 10);
						} else {
							KinkyDungeonSendTextMessage(5, TextGet("KDManaRecharge_Fail"), "#9074ab", 10);
						}
					}
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDArcaneRecharge_No"), "#9074ab", 10);
				}
			}
		},
		"LimitSurge": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;
				if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax) {
					let willPercentage = KinkyDungeonStatWill/e.power;
					KinkyDungeonChangeWill(-e.power);
					if (willPercentage >= 1) {
						KinkyDungeonChangeStamina(Math.min(willPercentage, 1.0) * e.mult * KinkyDungeonStatStaminaMax);
						KinkyDungeonSendTextMessage(5, TextGet("KDLimitSurge_Success"), "#ff8800", 10);
					} else {
						KinkyDungeonChangeStamina(Math.min(willPercentage, 1.0) * e.mult * KinkyDungeonStatStaminaMax);
						KDStunTurns(e.time);
						KinkyDungeonSendTextMessage(5, TextGet("KDLimitSurge_Fail"), "#ff5555", 10);
					}
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDLimitSurge_No"), "#ff8800", 10);
				}
			}
		},
		"Light": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonUpdateLightGrid = true;
				if (KinkyDungeonPlayerBuffs.Light && KinkyDungeonPlayerBuffs.Light.duration > 1) {
					KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "Light");
				}
			}
		},
		"Analyze": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				if (KinkyDungeonPlayerBuffs.Analyze && KinkyDungeonPlayerBuffs.Analyze.duration > 1) {
					KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "Analyze");
				}
				KinkyDungeonAdvanceTime(0, true, true);

			}
		},
		"PassTime": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonAdvanceTime(e.time, true, true);

			}
		},
	},
	"enemyStatusEnd": {
		"Shatter": (e, spell, data) => {
			if (data.enemy && data.status == "freeze" && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.enemy.playerdmg && KDHostile(data.enemy) && KDistChebyshev(data.enemy.x - KinkyDungeonPlayerEntity.x, data.enemy.y - KinkyDungeonPlayerEntity.y) < 10) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("ShatterStrike", true), undefined, undefined, undefined);
				//KDTriggerSpell(spell, data, false, false);
			}
		}
	},
	"kill": {
		"Shatter": (e, spell, data) => {
			if (data.enemy && data.enemy.freeze > 0 && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true)) && data.enemy.playerdmg && KDHostile(data.enemy) && KDistChebyshev(data.enemy.x - KinkyDungeonPlayerEntity.x, data.enemy.y - KinkyDungeonPlayerEntity.y) < 10) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, true));
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("ShatterStrike", true), undefined, undefined, undefined);
				//KDTriggerSpell(spell, data, false, false);
			}
		},
		"ManaHarvesting": (e, spell, data) => {
			if (data.enemy && data.enemy.playerdmg && KDHostile(data.enemy) && KDistChebyshev(data.enemy.x - KinkyDungeonPlayerEntity.x, data.enemy.y - KinkyDungeonPlayerEntity.y) < 10) {
				let regen = 0;
				if (data.enemy.Enemy.unlockCommandLevel > 0) regen = 10;
				else if (KDIsHumanoid(data.enemy)) regen = 1;
				if (regen > 0) {
					let player = KinkyDungeonPlayerEntity;
					let mult = 0.1 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "MultArcaneEnergy"));
					KDAddArcaneEnergy(player, regen * mult);
				}
			}
		},
	},
};

/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {any} spell
 * @param {*} data
 */
function KinkyDungeonHandleMagicEvent(Event, e, spell, data) {
	if (Event === e.trigger && KDEventMapSpell[Event] && KDEventMapSpell[Event][e.type]) {
		KDEventMapSpell[Event][e.type](e, spell, data);
	}
}


/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, weapon, *): void>>}
 */
let KDEventMapWeapon = {
	"beforePlayerDamage": {
		"StormBreakerCharge": (e, weapon, data) => {
			if (data.dmg > 0 && (!e.damageTrigger || e.damageTrigger == data.type)) {
				let turns = data.dmg * e.power;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "StormCharge",
					type: "StormCharge",
					aura: e.color,
					power: 1,
					duration: Math.ceil(Math.min(30, turns)),
				});
			}
		},
	},
	"spellCast": {
		"BondageBustBoost": (e, weapon, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (data.spell && data.spell.name == "BondageBustBeam" && data.bulletfired) {
					if (data.bulletfired.bullet && data.bulletfired.bullet.damage) {
						let dmgMult = e.power;
						let charge = KinkyDungeonPlayerBuffs[weapon.name + "Charge"] ? KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration : 0;
						if (charge >= 9) dmgMult *= 2;
						data.bulletfired.bullet.damage.damage = data.bulletfired.bullet.damage.damage + dmgMult * charge;
						data.bulletfired.bullet.damage.bind = (data.bulletfired.bullet.damage.bind || 0) + dmgMult * charge;
						KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration = 0;

						if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost * charge);
						if (e.sfx && charge > 9) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}

			}
		},
	},
	"playerCastSpecial": {
		"Unload": (e, weapon, data) => {
			let player = data.player || KinkyDungeonPlayerEntity;
			if (!e.prereq || !KDPrereqs[e.prereq] || KDPrereqs[e.prereq](player, e, data)) {
				let buff = KDEntityGetBuff(player, weapon.name + "Load");
				if (buff) {
					buff.power *= e.mult;
					buff.power += e.power;
				}
			}
		},
	},
	"afterPlayerAttack": {
		"DoubleStrike": (e, weapon, data) => {
			if (!KinkyDungeonAttackTwiceFlag && (!e.chance || KDRandom() < e.chance)) {
				if (data.enemy && data.enemy.hp > 0 && !(KDHelpless(data.enemy) && data.enemy.hp < 0.6)) {
					KinkyDungeonAttackTwiceFlag = true;
					KinkyDungeonLaunchAttack(data.enemy, 1);
					KinkyDungeonAttackTwiceFlag = false;
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				}
			}
		},
		"ConvertBindingToDamage": (e, weapon, data) => {
			if ((!e.chance || KDRandom() < e.chance)) {
				if (data.enemy && data.enemy.hp > 0 && !(KDHelpless(data.enemy) && data.enemy.hp < 0.6) && data.enemy.boundLevel > 0) {
					let bonus = Math.min(data.enemy.boundLevel, e.bind);
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: bonus * e.power,
						time: e.time
					}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);

					KDReduceBinding(data.enemy, bonus);
					if (data.enemy.hp <= 0 && KDHelpless(data.enemy)) data.enemy.hp = 0.01;
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				}
			}
		},
	},
	"getLights": {
		"WeaponLight": (e, spell, data) => {
			data.lights.push({brightness: e.power, x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y,
				color: string2hex(e.color || "#ffffff")});
		},
	},
	"tick": {
		"blockBuff": (e, weapon, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: weapon.name + "Block", type: "Block", power: e.power, duration: 2,});
		},
		"slowLevel": (e, weapon, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: weapon.name + "SlowLevel", type: "SlowLevel", power: e.power, duration: 2,});
		},
		"spellWardBuff": (e, weapon, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: weapon.name + "SpellResist", type: "SpellResist", power: e.power, duration: 2,});
		},
		"sneakBuff": (e, weapon, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: weapon.name + "Sneak", type: "SlowDetection", power: e.power, duration: 2,});
		},
		"evasionBuff": (e, weapon, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: weapon.name + "Evasion", type: "Evasion", power: e.power, duration: 2,});
		},
		"armorBuff": (e, weapon, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: weapon.name + "Armor", type: "Armor", power: e.power, duration: 2,});
		},
		"Charge": (e, weapon, data) => {
			if (KDGameData.AncientEnergyLevel > 0 && KinkyDungeonSlowMoveTurns < 1) {
				let currentCharge = KinkyDungeonPlayerBuffs[weapon.name + "Charge"] ? KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration : 0;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: weapon.name + "Charge",
					type: e.buffType,
					aura: e.color,
					power: 1,
					duration: Math.min(e.power, currentCharge + 2),
				});
				if (KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration > e.power - 1) {
					KinkyDungeonPlayerBuffs[weapon.name + "Charge"].aurasprite = undefined;
				} else {
					KinkyDungeonPlayerBuffs[weapon.name + "Charge"].aurasprite = weapon.name;
				}
			}
		},
		"Patience": (e, weapon, data) => {
			if (KinkyDungeonSlowMoveTurns < 1) {
				let currentCharge = KinkyDungeonPlayerBuffs[weapon.name + "Charge"] ? KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration : 0;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: weapon.name + "Charge",
					type: e.buffType,
					aura: e.color,
					power: 1,
					duration: Math.min(e.power, currentCharge + 2),
				});
				if (KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration > e.power - 1) {
					KinkyDungeonPlayerBuffs[weapon.name + "Charge"].aura = e.color;
				} else {
					KinkyDungeonPlayerBuffs[weapon.name + "Charge"].aura = "#888888";
				}
			}
		},
		"Reload": (e, weapon, data) => {
			let player = data.player || KinkyDungeonPlayerEntity;
			if (KinkyDungeonSlowMoveTurns < 1 && (!e.prereq || !KDPrereqs[e.prereq] || KDPrereqs[e.prereq](player, e, data))) {
				let currentLoad = KDEntityBuffedStat(player, weapon.name + "Load") || 0;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: weapon.name + "Load",
					type: weapon.name + "Load",
					aura: e.color,
					aurasprite: "Reload",
					//buffSprite: true,
					power: Math.min(e.power, currentLoad + data.delta),
					duration: 7,
				});
				if (currentLoad >= e.power) {
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].aura = undefined;
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].duration = 9999;
				} else {
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].aura = e.color;
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].duration = 7;
				}
			}
		},
		"Buff": (e, weapon, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: weapon.name + e.buffType,
					type: e.buffType,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: 2
				});
		},
		"BuffMulti": (e, weapon, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				for (let buff of e.buffTypes)
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: weapon.name + buff,
						type: buff,
						power: e.power,
						tags: e.tags,
						currentCount: e.mult ? -1 : undefined,
						maxCount: e.mult,
						duration: 2
					});
		},

		"AoEDamageFrozen": (e, weapon, data) => {
			let trigger = false;
			for (let enemy of KDMapData.Entities) {
				if (KDHostile(enemy) && enemy.freeze > 0 && (!e.chance || KDRandom() < e.chance) && enemy.hp > 0 && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					trigger = true;
				}
			}
			if (trigger) {
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"AoEDamageBurning": (e, weapon, data) => {
			let trigger = false;
			for (let enemy of KDMapData.Entities) {
				if (KDHostile(enemy) && KDEntityHasBuff(enemy, "Burning") && (!e.chance || KDRandom() < e.chance) && enemy.hp > 0 && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						flags: ["BurningDamage"],
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					trigger = true;
				}
			}
			if (trigger) {
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"AoEDamage": (e, weapon, data) => {
			let trigger = false;
			for (let enemy of KDMapData.Entities) {
				if (KDHostile(enemy) && (!e.chance || KDRandom() < e.chance) && enemy.hp > 0 && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					trigger = true;
				}
			}
			if (trigger) {
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
	},
	"beforePlayerAttack": {
		"KatanaBoost": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.Damage && data.Damage.damage) {
				if (data.enemy && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.chance || KDRandom() < e.chance) {
						let dmgMult = e.power;
						let charge = KinkyDungeonPlayerBuffs[weapon.name + "Charge"] ? KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration : 0;
						if (charge >= 9) dmgMult *= 2;
						data.Damage.damage = data.Damage.damage + dmgMult * charge;
						if (KinkyDungeonPlayerBuffs[weapon.name + "Charge"]) KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration = 0;

						if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost * charge);
						if (e.sfx && charge > 9) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"DamageMultInShadow": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.Damage && data.Damage.damage) {
				if (data.enemy && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if ((!e.chance || KDRandom() < e.chance) && (KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) <= 1.5 || KinkyDungeonBrightnessGet(data.enemy.x, data.enemy.y) <= 1.5)) {
						let dmgMult = e.power;
						data.Damage.damage = data.Damage.damage * dmgMult;

						if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
						if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"ChangeDamageUnaware": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && data.Damage && data.Damage.damage > 0 && !data.enemy.Enemy.tags.nobrain) {
				if ((!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware) {
						data.Damage.damage = e.power;
						data.Damage.type = e.damage;
						data.Damage.time = e.time;
						data.Damage.bind = e.bind;
					}
				}
			}
		},
		"ChangeDamageVulnerable": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && data.Damage && data.Damage.damage > 0 && !data.enemy.Enemy.tags.nonvulnerable) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (data.enemy.vulnerable > 0) {
						data.Damage.damage = e.power;
						data.Damage.type = e.damage;
						data.Damage.time = e.time;
						data.Damage.bind = e.bind;
					}
				}
			}
		},
	},
	"playerMove": {
		"DealDamageToTaped": (e, weapon, data) => {
			let enemies = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, e.dist || 1.5);
			for (let enemy of enemies) {
				if ((!e.chance || KDRandom() < e.chance) && enemy.hp > 0 && !KDHelpless(enemy) && KDHostile(enemy) && KDEntityHasBuffTags(enemy, "taped")) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						// Double damage if sprinting!!
						damage: e.power * Math.min(Math.max(1, data.dist || 1), 2),
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						bindType: e.bindType,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
	},
	"playerAttack": {
		"ApplyTaped": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					let bb = Object.assign({}, KDTaped);
					if (e.duration) bb.duration = e.duration;
					if (e.power) bb.power = e.power;

					if (!data.enemy.buffs) data.enemy.buffs = {};
					KinkyDungeonApplyBuffToEntity(data.enemy, bb);
				}
			}
		},
		"ApplyToy": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && KDCanBind(data.enemy) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					let bb = Object.assign({}, KDToy);
					if (e.duration) bb.duration = e.duration;
					if (e.power) bb.power = e.power;

					if (!data.enemy.buffs) data.enemy.buffs = {};
					KinkyDungeonApplyBuffToEntity(data.enemy, bb);
				}
			}
		},
		"ActivateVibration": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && data.enemy.Enemy.bound && KDEnemyCanBeVibed(data.enemy) && (!e.chance || KDRandom() < e.chance)) {
					KDApplyGenBuffs(data.enemy, "Vibrate1", 90);
				}
			}
		},
		"ElementalEffect": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"MagicRope": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!KinkyDungeonHasMana(e.cost)) {
						let restrained = KDPlayerEffectRestrain(undefined, 2, ["rest_rope_weakmagic"], "Player", true, false, false, false, false);
						if (restrained.length > 0) {
							KinkyDungeonSendTextMessage(8, TextGet("KDMagicRopeBackfire"), "#92e8c0", 2);
						}
					}
					KinkyDungeonChangeMana(-e.cost);
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"StormBreakerDamage": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				let enemies = KDNearbyEnemies(data.enemy.x, data.enemy.y, e.aoe);
				for (let en of enemies) {
					if (en && KDHostile(en) && (!e.chance || KDRandom() < e.chance) && en.hp > 0 && !KDHelpless(en) && KinkyDungeonPlayerBuffs.StormCharge) {
						let mult = 0.2 * Math.min(5, KinkyDungeonPlayerBuffs.StormCharge.duration);
						let damage = e.power * mult;
						KinkyDungeonDamageEnemy(en, {
							type: e.damage,
							damage: damage,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, en == data.enemy && data.vulnConsumed);
						KDCreateEffectTile(en.x, en.y, {
							name: "Sparks",
							duration: 2,
						}, 2);
					}
				}
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"ApplyBuff": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance)) {
					if (!data.enemy.buffs) data.enemy.buffs = {};
					KinkyDungeonApplyBuffToEntity(data.enemy, e.buff);
				}
			}
		},
		"Cleave": (e, weapon, data) => {
			if (data.enemy && !data.disarm) {
				for (let enemy of KDMapData.Entities) {
					if (enemy != data.enemy && KDHostile(enemy) && !KDHelpless(data.enemy)) {
						let dist = Math.max(Math.abs(enemy.x - KinkyDungeonPlayerEntity.x), Math.abs(enemy.y - KinkyDungeonPlayerEntity.y));
						if (dist < 1.5 && KinkyDungeonEvasion(enemy) && Math.max(Math.abs(enemy.x - data.enemy.x), Math.abs(enemy.y - data.enemy.y))) {
							KinkyDungeonDamageEnemy(enemy, {
								type: e.damage,
								damage: e.power,
								time: e.time
							}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
						}
					}
				}
			}
		},
		"CastSpell": (e, weapon, data) => {
			if (data.enemy && !data.disarm && !KDHelpless(data.enemy)) {
				let spell = KinkyDungeonFindSpell(e.spell, true);
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, spell, {
					x: KinkyDungeonPlayerEntity.x,
					y: KinkyDungeonPlayerEntity.y
				}, {x: data.enemy.x, y: data.enemy.y}, undefined);
				if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
			}
		},
		"Pierce": (e, weapon, data) => {
			if (data.enemy && !data.disarm) {
				let dist = e.dist ? e.dist : 1;
				for (let i = 1; i <= dist; i++) {
					let xx = data.enemy.x + i * (data.enemy.x - KinkyDungeonPlayerEntity.x);
					let yy = data.enemy.y + i * (data.enemy.y - KinkyDungeonPlayerEntity.y);
					for (let enemy of KDMapData.Entities) {
						if (enemy != data.enemy && KDHostile(enemy) && !KDHelpless(data.enemy)) {
							if (KinkyDungeonEvasion(enemy) && enemy.x == xx && enemy.y == yy) {
								KinkyDungeonDamageEnemy(enemy, {
									type: e.damage,
									damage: e.power
								}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
							}
						}
					}
				}
			}
		},
		"DamageToTag": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy && data.enemy.Enemy.tags[e.requiredTag] && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"DamageToSummons": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy && data.enemy.lifetime > 0 && data.enemy.lifetime < 9999 && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"ElementalOnVulnerable": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nonvulnerable) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (data.enemy.vulnerable > 0) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalOnUnaware": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nobrain) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalDreamcatcher": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware && !data.enemy.Enemy.tags.nobrain) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					} else if (data.enemy.vulnerable > 0 && !data.enemy.Enemy.tags.nonvulnerable) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power * 0.5,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalUnaware": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nobrain) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalVulnerable": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nonvulnerable) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (data.enemy.vulnerable > 0) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindType: e.bindType,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"Dreamcatcher": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware && !data.enemy.Enemy.tags.Temporary) {
						let point = KinkyDungeonGetNearbyPoint(data.enemy.x,  data.enemy.y, true, undefined, true);
						if (point) {
							let Enemy = KinkyDungeonGetEnemyByName("ShadowWarrior");
							KDAddEntity({
								summoned: true,
								rage: Enemy.summonRage ? 9999 : undefined,
								Enemy: Enemy,
								id: KinkyDungeonGetEnemyID(),
								x: point.x,
								y: point.y,
								hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
								movePoints: 0,
								attackPoints: 0,
								lifetime: e.time,
								maxlifetime: e.time,
							});
							if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
						}
					}
				}
			}
		},
		"Knockback": (e, weapon, data) => {
			if (e.dist && data.enemy && data.targetX && data.targetY && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy.Enemy && !data.enemy.Enemy.tags.unflinching && !data.enemy.Enemy.tags.stunresist && !data.enemy.Enemy.tags.unstoppable && !data.enemy.Enemy.tags.noknockback && !KDIsImmobile(data.enemy)) {
					let newX = data.targetX + Math.round(e.dist * (data.targetX - KinkyDungeonPlayerEntity.x));
					let newY = data.targetY + Math.round(e.dist * (data.targetY - KinkyDungeonPlayerEntity.y));
					if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
						&& (e.dist == 1 || KinkyDungeonCheckProjectileClearance(data.enemy.x, data.enemy.y, newX, newY))) {
						KDMoveEntity(data.enemy, newX, newY, false);
					}
				}
			}
		},
	},
	"beforeDamageEnemy": {
		"MultiplyTime": (e, weapon, data) => {
			if (data.time > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					data.time = Math.ceil(data.time * e.power);
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				}
			}
		},
		"MultiplyDamageFrozen": (e, weapon, data) => {
			if (data.enemy && data.enemy.freeze > 0 && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					data.dmg = Math.ceil(data.dmg * e.power);
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				}
			}
		},
		"EchoDamage": (e, weapon, data) => {
			if (data.enemy && (!data.flags || !data.flags.includes("EchoDamage")) && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					let trigger = false;
					for (let enemy of KDMapData.Entities) {
						if ((enemy.rage || (KDAllied(enemy) && KDAllied(data.enemy)) || (KDHostile(enemy) && KDHostile(data.enemy))) && enemy != data.enemy && !KDHelpless(enemy) && enemy.hp > 0 && KDistEuclidean(enemy.x - data.enemy.x, enemy.y - data.enemy.y) <= e.aoe) {
							KinkyDungeonDamageEnemy(enemy, {
								type: e.damage,
								damage: e.power,
								time: e.time,
								flags: ["EchoDamage"]
							}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
							trigger = true;
						}
					}
					if (trigger) {
						if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
					}
				}
			}
		},
	},
	"capture": {
		"Dollmaker": (e, weapon, data) => {
			if (data.attacker && data.attacker.player && data.enemy && !KDAllied(data.enemy)) {
				if (!e.chance || KDRandom() < e.chance) {
					let Enemy = KinkyDungeonGetEnemyByName("AllyDoll");
					let doll = {
						summoned: true,
						rage: Enemy.summonRage ? 9999 : undefined,
						Enemy: Enemy,
						id: KinkyDungeonGetEnemyID(),
						x: data.enemy.x,
						y: data.enemy.y,
						hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp,
						movePoints: 0,
						attackPoints: 0
					};
					let dollCount = KDMapData.Entities.filter((entity) => {
						return entity.Enemy.name == "AllyDoll" && KDAllied(entity);
					}).length;
					if (dollCount > e.power) {
						doll.faction = "Enemy";
						doll.boundLevel = doll.hp * 11;
						KinkyDungeonSendTextMessage(8, TextGet("KDDollmakerTooManyDolls"), "lightgreen", 2);
					}
					KDAddEntity(doll);
					if (e.energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - e.energyCost);
				}
			}
		},
	},
	"afterDamageEnemy": {

	},
};

/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {weapon} weapon
 * @param {*} data
 */
function KinkyDungeonHandleWeaponEvent(Event, e, weapon, data) {
	if (Event === e.trigger && KDEventMapWeapon[Event] && KDEventMapWeapon[Event][e.type]) {
		KDEventMapWeapon[Event][e.type](e, weapon, data);
	}
}


/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, *): void>>}
 */
let KDEventMapBullet = {
	"beforeBulletHit": {
		"DropKnife": (e, b, data) => {
			let point = {x: b.x, y: b.y};
			if (!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(point.x, point.y))) {
				if (b.vx || b.vy) {
					let speed = KDistEuclidean(b.vx, b.vy);
					if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(Math.round(b.x - b.vx / speed), Math.round(b.y - b.vy / speed)))) {
						point = {x: Math.round(b.x - b.vx / speed), y: Math.round(b.y - b.vy / speed)};
					}
					else if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(Math.floor(b.x - b.vx / speed), Math.floor(b.y - b.vy / speed)))) {
						point = {x: Math.floor(b.x - b.vx / speed), y: Math.floor(b.y - b.vy / speed)};
					}
					else {
						point = {x: Math.ceil(b.x - b.vx / speed), y: Math.ceil(b.y - b.vy / speed)};
					}
				}
			}
			KinkyDungeonDropItem({name: "Knife"}, point, KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(point.x, point.y)), true, true);
		},
	},
	"bulletHitEnemy": {
		"Knockback": (e, b, data) => {
			if (b && data.enemy && !data.enemy.Enemy.tags.noknockback && !KDIsImmobile(data.enemy)) {
				let pushPower = KDPushModifier(e.power, data.enemy, false);

				if (pushPower > 0) {
					let dist = e.dist;
					if (pushPower > dist) dist *= 2;
					for (let i = 0; i < dist; i++) {
						let newX = data.enemy.x + Math.round(1 * Math.sign(b.vx));
						let newY = data.enemy.y + Math.round(1 * Math.sign(b.vy));
						if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
						&& (e.dist == 1 || KinkyDungeonCheckProjectileClearance(data.enemy.x, data.enemy.y, newX, newY))) {
							KDMoveEntity(data.enemy, newX, newY, false);
						}
					}

				}
			}
		},
		"GreaterRage": (e, b, data) => {
			if (b && data.enemy && !(data.enemy.Enemy.tags.soulimmune)) {
				let time = 300;
				if (data.enemy.Enemy.tags.soulresist) time *= 0.5;
				else if (data.enemy.Enemy.tags.soulweakness) time *= 2;
				else if (data.enemy.Enemy.tags.soulsevereweakness) time *= 4;
				if (data.enemy.Enemy.tags.boss) time *= 0.033;
				else if (data.enemy.Enemy.tags.miniboss) time *= 0.1;
				if (time > 100) time = 9999;

				if (!data.enemy.rage) data.enemy.rage = time;
				else data.enemy.rage = Math.max(data.enemy.rage, time);

				KDAddThought(data.enemy.id, "Play", 11, time);
			}
		},
		"ElementalOnSlowOrBind": (e, b, data) => {
			if (b && data.enemy && (KinkyDungeonIsSlowed(data.enemy) || data.enemy.bind > 0)) {
				KinkyDungeonDamageEnemy(data.enemy, {
					type: e.damage,
					damage: e.power,
					time: e.time,
					bind: e.bind,
					bindType: e.bindType,
				}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
			}
		},
		"ApplyGenBuff": (e, b, data) => {
			if (b && data.enemy) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq))
					KDApplyGenBuffs(data.enemy, e.buff, e.time);
			}
		},
		"PlugEnemy": (e, b, data) => {
			if (b && data.enemy) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
					if (data.enemy.Enemy?.bound && (data.enemy.boundLevel > 0 || KDEntityGetBuff(data.enemy, "Chastity"))) {
						KDPlugEnemy(data.enemy);
					}
				}
			}
		},
		"LatexWall": (e, b, data) => {
			if (b && data.enemy) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
					if (!KDEnemyHasFlag(data.enemy, "latexWall")) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							bind: e.bind,
							bindType: e.bindType,
						}, true, false, b.bullet.spell, b, undefined, b.delay, true);
						KDBlindEnemy(data.enemy, e.time);
						KinkyDungeonSetEnemyFlag(data.enemy, "latexWall", 21);
					}
				}
			}
		},
		"EncaseBound": (e, b, data) => {
			if (b && data.enemy && data.enemy.Enemy) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
					if (data.enemy.Enemy.bound && (data.enemy.boundLevel >= data.enemy.maxhp || KDHelpless(data.enemy))) {
						KinkyDungeonApplyBuffToEntity(data.enemy, KDEncased);
					}
				}
			}
		},
		"SilenceHumanoid": (e, b, data) => {
			if (b && data.enemy && data.enemy.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq))
					KDSilenceEnemy(data.enemy, e.time);
			}
		},
		"BlindHumanoid": (e, b, data) => {
			if (b && data.enemy && data.enemy.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq))
					KDBlindEnemy(data.enemy, e.time);
			}
		},
		"DisarmHumanoid": (e, b, data) => {
			if (b && data.enemy && data.enemy.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq))
					KDDisarmEnemy(data.enemy, e.time);
			}
		},
		"DisarmDebuff": (e, b, data) => {
			if (b && data.enemy && data.enemy.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
					KinkyDungeonApplyBuffToEntity(data.enemy, KDRestraintDisarmLight);
				}
			}
		},
		"ElementalIfNotSilenced": (e, b, data) => {
			if (b && data.enemy) {
				if (!(data.enemy.silence > 0)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},
		"ElementalIfNotBlinded": (e, b, data) => {
			if (b && data.enemy) {
				if (!(data.enemy.blind > 0)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},
		"ElementalIfNotDisarmed": (e, b, data) => {
			if (b && data.enemy) {
				if (!(data.enemy.disarm > 0)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},
		"ElementalIfNotSnared": (e, b, data) => {
			if (b && data.enemy) {
				if (!(data.enemy.bind > 0)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},
		"ElementalIfHalfBound": (e, b, data) => {
			if (b && data.enemy) {
				if (KDBoundEffects(data.enemy) > 1) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindType: e.bindType,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},
		"Elemental": (e, b, data) => {
			if (b && data.enemy) {
				KinkyDungeonDamageEnemy(data.enemy, {
					type: e.damage,
					damage: e.power,
					time: e.time,
					bind: e.bind,
					bindType: e.bindType,
				}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
			}
		},
		"BoundBonus": (e, b, data) => {
			if (b && data.enemy) {
				let mult = KDBoundEffects(data.enemy);
				if (mult > 0) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power ? e.power * mult : undefined,
						time: e.time,
						bind: e.bind ? e.bind * mult : undefined,
						bindType: e.bindType,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},
		"ElementalOnSlowOrBindOrDrench": (e, b, data) => {
			if (b && data.enemy && (KinkyDungeonIsSlowed(data.enemy) || data.enemy.bind > 0 || (data.enemy.buffs && data.enemy.buffs.Drenched))) {
				KinkyDungeonDamageEnemy(data.enemy, {
					type: e.damage,
					damage: e.power,
					time: e.time,
					bind: e.bind,
					bindType: e.bindType,
				}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
			}
		},
		"ElementalOnDrench": (e, b, data) => {
			if (b && data.enemy && (data.enemy.buffs && data.enemy.buffs.Drenched)) {
				KinkyDungeonDamageEnemy(data.enemy, {
					type: e.damage,
					damage: e.power,
					time: e.time,
					bind: e.bind,
					bindType: e.bindType,
				}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
			}
		},
	},
	"bulletTick": {
		"ZoneOfPurity": (e, b, data) => {
			let enemies = KDNearbyEnemies(b.x, b.y, e.aoe);
			if (enemies.length > 0) {
				for (let en of enemies) {
					if (en && en.Enemy.bound && en.boundLevel > e.power) {
						KinkyDungeonApplyBuffToEntity(en, KDChastity);
					}
				}
			}
			if (KDistChebyshev(KinkyDungeonPlayerEntity.x - b.x, KinkyDungeonPlayerEntity.y - b.y) <= e.aoe) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["magicBeltForced"]}, MiniGameKinkyDungeonLevel + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KinkyDungeonSendActionMessage(3, TextGet("KDZoneOfPuritySelf"), "#88AAFF", 2);
					KinkyDungeonAddRestraintIfWeaker(restraintAdd, 0, false, undefined, false, false, undefined, undefined);
				}
			}
		},
		"ZoneOfExcitement": (e, b, data) => {
			let enemies = KDNearbyEnemies(b.x, b.y, e.aoe);
			if (enemies.length > 0) {
				for (let en of enemies) {
					if (en && en.Enemy.bound) {
						KinkyDungeonApplyBuffToEntity(en, KDToy);
					}
				}
			}
			if (KDistChebyshev(KinkyDungeonPlayerEntity.x - b.x, KinkyDungeonPlayerEntity.y - b.y) <= e.aoe) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["genericToys"]}, MiniGameKinkyDungeonLevel + 10, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]);
				if (restraintAdd) {
					KinkyDungeonSendActionMessage(3, TextGet("KDZoneOfExcitementSelf"), "#88AAFF", 2);
					KinkyDungeonAddRestraintIfWeaker(restraintAdd, 0, false, undefined, false, false, undefined, undefined);
				}
			}
		},
		"CastSpellNearbyEnemy": (e, b, data) => {
			if (data.delta > 0) {
				let born = b.born ? 0 : 1;
				let enemies = KDNearbyEnemies(b.x + b.vx * data.delta * born, b.y + b.vy * data.delta * born, e.aoe).filter((enemy) => {
					return (KDHostile(enemy) || (b.x == enemy.x && b.y == enemy.y && !KDAllied(enemy)));
				});
				if (e.player && KDistEuclidean(b.x + b.vx * data.delta * born, b.y + b.vy * data.delta * born) < e.aoe) {
					enemies.push(KinkyDungeonPlayerEntity);
				}
				if (enemies.length > 0) {
					let enemy = enemies[Math.floor(KDRandom() * enemies.length)];
					KinkyDungeonCastSpell(enemy.x, enemy.y, KinkyDungeonFindSpell(e.spell, true), undefined, undefined, undefined, b.bullet.faction);
				}
			}
		},
	},
	"bulletAfterTick": {
		"RubberMissileHoming": (e, b, data) => {
			if (data.delta > 0 && b.bullet.targetX != undefined && b.bullet.targetY != undefined) {
				// Scan for targets near the target location
				if (b.bullet.faction && !(e.kind == "dumb")) {
					let minDist = 1000;
					let entity = null;
					let playerDist = 1000;
					if (KDFactionHostile(b.bullet.faction, "Player")) {
						playerDist = KDistEuclidean(KinkyDungeonPlayerEntity.x - b.bullet.targetX, KinkyDungeonPlayerEntity.y - b.bullet.targetY);
						if (playerDist <= e.dist) {
							entity = KinkyDungeonPlayerEntity;
							minDist = playerDist;
						}
					}

					let enemies = KDNearbyEnemies(b.bullet.targetX, b.bullet.targetY, e.dist);
					for (let en of enemies) {
						if (!KDHelpless(en) && KDFactionHostile(b.bullet.faction, en)) {
							playerDist = KDistEuclidean(en.x - b.bullet.targetX, en.y - b.bullet.targetY);
							if (playerDist < minDist) {
								entity = en;
								minDist = playerDist;
							}
						}
					}
					if (entity) {
						// Move the missile's target location toward it
						if (b.bullet.targetX > entity.x) {
							b.bullet.targetX = Math.max(entity.x, b.bullet.targetX - data.delta * e.power);
						} else if (b.bullet.targetX < entity.x) {
							b.bullet.targetX = Math.min(entity.x, b.bullet.targetX + data.delta * e.power);
						}
						if (b.bullet.targetY > entity.y) {
							b.bullet.targetY = Math.max(entity.y, b.bullet.targetY - data.delta * e.power);
						} else if (b.bullet.targetX < entity.y) {
							b.bullet.targetY = Math.min(entity.y, b.bullet.targetY + data.delta * e.power);
						}
					}
				}
				let speed = KDistEuclidean(b.vx, b.vy);

				// Missile tracking
				let direction = Math.atan2(b.bullet.targetY - b.y, b.bullet.targetX - b.x);
				let vx = Math.cos(direction) * speed;
				let vy = Math.sin(direction) * speed;
				let vxx = b.vx;
				let vyy = b.vy;
				if (b.vx > vx) vxx = Math.max(vx, b.vx - data.delta * e.power);
				else if (b.vx < vx) vxx = Math.min(vx, b.vx + data.delta * e.power);
				if (b.vy > vy) vyy = Math.max(vy, b.vy - data.delta * e.power);
				else if (b.vy < vy) vyy = Math.min(vy, b.vy + data.delta * e.power);

				if (!e.limit || KDistEuclidean(vxx, vyy) >= e.limit) {
					b.vx = vxx;
					b.vy = vyy;
				}

				// Accelerate the missile
				if (e.count) {
					speed += e.count;
				}
				direction = Math.atan2(b.vy, b.vx);
				b.vx = Math.cos(direction) * speed;
				b.vy = Math.sin(direction) * speed;
			}
		},
	}
};

/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {any} b
 * @param {*} data
 */
function KinkyDungeonHandleBulletEvent(Event, e, b, data) {
	if (Event === e.trigger && b.bullet && KDEventMapBullet[Event] && KDEventMapBullet[Event][e.type]) {
		KDEventMapBullet[Event][e.type](e, b, data);
	}
}




/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, entity, *): void>>}
 */
let KDEventMapEnemy = {
	"passout": {
		"delete": (e, enemy, data) => {
			if (!e.chance || KDRandom() < e.chance)
				enemy.hp = 0;
		}
	},
	"defeat": {
		"delete": (e, enemy, data) => {
			if (!e.chance || KDRandom() < e.chance)
				enemy.hp = 0;
		}
	},
	"enemyCast": {
		"RandomRespawn": (e, enemy, data) => {
			if (data.enemy == enemy && KDMapData.Entities.length < 300) {
				let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, 10, 10);
				if (point) {
					let ee = DialogueCreateEnemy(point.x, point.y, enemy.Enemy.name);
					ee.faction = enemy.faction;
				}
			}
		},
	},
	"calcManaPool": {
		"PetManaRegen": (e, enemy, data) => {
			if (KDAllied(enemy) && KDistChebyshev(enemy.x - data.player.x, enemy.y - data.player.y) < e.dist) {
				data.manaPoolRegen += e.power;
			}
		},
	},
	"tick": {
		"EpicenterAssignHP": (e, enemy, data) => {
			if (!KDEnemyHasFlag(enemy, "assignedHP")) {
				let factor = 0.1 + 1.9*(KDGameData.HighestLevel || 1) / (KinkyDungeonMaxLevel - 1);

				enemy.Enemy = JSON.parse(JSON.stringify(enemy.Enemy));
				enemy.Enemy.maxhp = enemy.Enemy.maxhp*factor;

				KinkyDungeonSetEnemyFlag(enemy, "assignedHP", -1);
			}
		},
		"AdventurerAssignFaction": (e, enemy, data) => {
			if (!enemy.faction) {
				let nearbyEnemies = KDNearbyEnemies(enemy.x, enemy.y, e.dist);
				for (let en of nearbyEnemies) {
					if (e.tags.includes(KDGetFaction(en))) {
						enemy.faction = KDGetFaction(en);
						break;
					}
				}
				if (!enemy.faction) enemy.faction = "Adventurer";
			}
		},
		"DeleteCurse": (e, enemy, data) => {
			if (!KDCheckPrereq(undefined, "AlreadyCursed", e, data)) {
				enemy.hp = 0;
				let suff = "NoCurse";
				if (KinkyDungeonPlayerTags.get("Cursed")
					|| (e.tags && !KinkyDungeonGetRestraint({tags: [...e.tags],},
						MiniGameKinkyDungeonLevel,
						KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], true, ""))
				) suff = "Invalid";
				KinkyDungeonSendTextMessage(5, TextGet("KDEpicenterAbort" + suff + "_" + enemy.Enemy.name), "#9074ab", 10);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Fwoosh.ogg", enemy);
			}
		},
		"DisplayAura": (e, enemy, data) => {
			let enemies = KDNearbyEnemies(enemy.x, enemy.y, e.dist, enemy);
			for (let en of enemies) {
				KinkyDungeonApplyBuffToEntity(en, KDDollDebuff);
				KinkyDungeonApplyBuffToEntity(en, KDDollDebuff2);
			}
		},
		"suicideWhenBound": (e, enemy, data) => {
			if (KDHelpless(enemy)) {
				enemy.hp = 0;
			}
		},
		"secretToy": (e, enemy, data) => {
			if (enemy.hp > 0) {
				KinkyDungeonApplyBuffToEntity(enemy, KDToySecret);
			}
		},
	},
	"getLights": {
		"enemyTorch": (e, enemy, data) => {
			data.lights.push({brightness: e.power, x: enemy.x, y: enemy.y,
				visualxoffset: 0.25 * (enemy.fx - enemy.x) || 0,
				visualyoffset: 0.25 * (enemy.fy - enemy.y) || 0,
				color: string2hex(e.color || "#ffffff")});
		},
	},
	"beforeDamage": {
		"shadowEngulf": (e, enemy, data) => {
			if (data.enemy == enemy && data.target == KinkyDungeonPlayerEntity && data.restraintsAdded && data.restraintsAdded.length == 0 && !KinkyDungeonFlags.get("shadowEngulf")) {
				if (data.enemy == enemy && data.target == KinkyDungeonPlayerEntity && data.restraintsAdded && data.restraintsAdded.length == 0 && !KinkyDungeonFlags.get("shadowEngulf")) {
					KDTripleBuffKill("ShadowEngulf", KinkyDungeonPlayerEntity, 9, (tt) => {
						if (KDGameData.RoomType != "DemonTransition")
							KDEnterDemonTransition();
						else
							KinkyDungeonPassOut();
					}, "Blindness",
					(target) => {
						// Create a portal
						let point = KinkyDungeonGetNearbyPoint(enemy.x, enemy.y, true);
						if (point) {
							/** Create the portal */
							KDCreateEffectTile(point.x, point.y, {
								name: "Portals/DarkPortal",
							}, 0);
						}
					});
				}
			}
		},
		"shadowDomme": (e, enemy, data) => {
			if (data.enemy == enemy && data.target == KinkyDungeonPlayerEntity && data.restraintsAdded && data.restraintsAdded.length == 0 && !KinkyDungeonFlags.get("shadowEngulf")) {
				KDTripleBuffKill("ShadowEngulf", KinkyDungeonPlayerEntity, 9, (tt) => {
					// Passes out the player, but does NOT teleport
					KinkyDungeonPassOut(true);
					KDBreakTether(KinkyDungeonPlayerEntity);

					// Instead it applies a debuff, and leash
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
						{id: "ShadowDommed", type: "Flag", duration: 9999, power: 1, maxCount: 1, currentCount: 1, tags: ["attack", "cast"], events: [
							{type: "ShadowDommed", trigger: "tick"},
						]}
					);

					if (!KinkyDungeonGetRestraintItem("ItemNeck")) {
						KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("ObsidianCollar"), 0, true, "Purple");
					}
					if (!KinkyDungeonGetRestraintItem("ItemNeckRestraints") && KinkyDungeonGetRestraintItem("ItemNeck")) {
						KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BasicLeash"), 0, true, "Purple");
					}

					KinkyDungeonAttachTetherToEntity(3.5, enemy);
				}, "Blindness");
			}
		},
	},
	"death": {
		"frogDies": (e, enemy, data) => {
			if (enemy.Enemy.name == "Conjurer" && data.enemy.Enemy.name == "Frog" && !KinkyDungeonFlags.get("frogDied")
				&& KDistChebyshev(enemy.x - data.enemy.x, enemy.y - data.enemy.y) < 10
				&& (!e.chance || KDRandom() < e.chance) && (!e.prereq || KDPrereqs[e.prereq](enemy, e, data))) {
				KinkyDungeonSetFlag("frogDied", 1);
				KinkyDungeonSendDialogue(enemy, TextGet("KDConjurerFrogDied_" + (enemy.playLine || "Witch")), KDGetColor(enemy), 6, 10);
			}
		},
		"createEffectTile": (e, enemy, data) => {
			if (enemy == data.enemy && (!e.chance || KDRandom() < e.chance) && (!e.prereq || KDPrereqs[e.prereq](enemy, e, data))) {
				let count = e.power ? e.power : 1;
				let rad = e.aoe ? e.aoe : 1.5;
				let minrad = e.dist;
				for (let i = 0; i < count; i++) {
					let slots = [];
					for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
						for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
							if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
								if ((enemy.x + X > 0 && enemy.y + Y > 0 && enemy.x + X < KDMapData.GridWidth && enemy.y + Y < KDMapData.GridHeight)
									&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + X, enemy.y + Y)))
									slots.push({x:X, y:Y});
							}
						}

					if (slots.length > 0) {
						let slot = slots[Math.floor(KDRandom() * slots.length)];
						if (slot) {
							KDCreateEffectTile(enemy.x + slot.x, enemy.y + slot.y, {
								name: e.kind,
								duration: e.time,
							}, e.variance);
						}
					}

				}
			}
		},
	},
	"spellCast": {
		"ropeKrakenSummonTentacle": (e, enemy, data) => {
			if (enemy == data.enemy && data.spell?.name == "SummonRopeTentacle") {
				enemy.hp = Math.max(enemy.hp - enemy.Enemy.maxhp * KDMagicDefs.RopeKraken_TentacleCost, Math.min(enemy.hp, enemy.Enemy.maxhp * KDMagicDefs.RopeKraken_TentacleThreshold));
			}
		},
		"slimeKrakenSummonMinion": (e, enemy, data) => {
			if (enemy == data.enemy && data.spell?.name == "SummonSlimeMinion") {
				enemy.hp = Math.max(enemy.hp - enemy.Enemy.maxhp * KDMagicDefs.SlimeKraken_TentacleCost, Math.min(enemy.hp, enemy.Enemy.maxhp * KDMagicDefs.SlimeKraken_TentacleThreshold));
			}
		},
		"sarcoKrakenSummonTentacle": (e, enemy, data) => {
			if (enemy == data.enemy && data.spell?.name == "SummonSarcoTentacle") {
				enemy.hp = Math.max(enemy.hp - enemy.Enemy.maxhp * KDMagicDefs.SarcoKraken_TentacleCost, Math.min(enemy.hp, enemy.Enemy.maxhp * KDMagicDefs.SarcoKraken_TentacleThreshold));
			}
		},
	},
	"afterDamageEnemy": {
		"bleedEffectTile": (e, enemy, data) => {
			if (data.dmg > 0 && enemy == data.enemy) {
				if (!e.chance || KDRandom() < e.chance) {
					let count = e.power ? e.power : 1;
					let rad = e.aoe ? e.aoe : 1.5;
					let minrad = e.dist;
					for (let i = 0; i < count; i++) {
						let slots = [];
						for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
							for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
								if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
									if ((enemy.x + X > 0 && enemy.y + Y > 0 && enemy.x + X < KDMapData.GridWidth && enemy.y + Y < KDMapData.GridHeight)
										&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + X, enemy.y + Y)))
										slots.push({x:X, y:Y});
								}
							}

						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							if (slot) {
								KDCreateEffectTile(enemy.x + slot.x, enemy.y + slot.y, {
									name: e.kind,
									duration: e.duration
								}, e.time);
							}
						}

					}
				}
			}
		},
	},
	"duringDamageEnemy": {
		"damageThreshold": (e, enemy, data) => {
			if (enemy == data.enemy && data.dmgDealt < e.power) {
				data.dmgDealt = 0;
			}
		},
	},

	"afterEnemyTick": {
		"ShopkeeperRescueAI": (e, enemy, data) => {
			// We heal nearby allies and self
			if (data.delta && !KDHelpless(enemy) && !KinkyDungeonIsDisabled(enemy) && KDEnemyHasFlag(enemy, "RescuingPlayer")
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
				KinkyDungeonSetEnemyFlag(enemy, "failpath", 0);
				KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
				KinkyDungeonSetEnemyFlag(enemy, "longPath", 3);
				if (!e.chance || KDRandom() < e.chance) {
					if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						// Apply eager buff to make the shopkeeper fast
						KinkyDungeonApplyBuffToEntity(enemy, KDEager);
						// Go to leash the player
						enemy.gx = KinkyDungeonPlayerEntity.x;
						enemy.gy = KinkyDungeonPlayerEntity.y;
						if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
							// Attach leash
							let newAdd = KinkyDungeonGetRestraint({tags: ["leashing"]}, 0, 'grv');
							if (newAdd) {
								KinkyDungeonAddRestraintIfWeaker(newAdd, 0, true, undefined, false, false, undefined, "Prisoner");
							}
							if (KinkyDungeonAttachTetherToEntity(2.5, enemy)) {
								KinkyDungeonSendTextMessage(9, TextGet("KDShopkeeperLeash"), "#ffffff", 4);
							}
						}
					} else {
						KinkyDungeonSetEnemyFlag(enemy, "NoFollow", 3);
						// Drag the player to the start position
						enemy.gx = KDMapData.StartPosition.x;
						enemy.gy = KDMapData.StartPosition.y;
						if (KDistChebyshev(enemy.x - KDMapData.StartPosition.x, enemy.y - KDMapData.StartPosition.y) < 1.5
							&& KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 2.5) {
							KinkyDungeonSendTextMessage(10, TextGet("KDShopkeeperTeleportToStart"), "#ffffff", 4);
							//KDGameData.RoomType = "ShopStart";
							//KDGameData.MapMod = ""; // Reset the map mod
							MiniGameKinkyDungeonLevel = 0;
							KDCurrentWorldSlot = {x: 0, y: 0};
							let params = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]];
							KinkyDungeonCreateMap(params, "ShopStart", "", MiniGameKinkyDungeonLevel, undefined, undefined, undefined, undefined, false, undefined);
							KDStartDialog("ShopkeeperTeleport", enemy.Enemy.name, true, "", enemy);
						}
					}
				}
			}
		},
		"dollmakerMissiles": (e, enemy, data) => {
			if (data.delta && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let player = KinkyDungeonPlayerEntity;
					if (!KDHelpless(enemy) && !KDEnemyHasFlag(enemy, "dollmakerMissiles") && enemy.aware && KDHostile(enemy) && KDistEuclidean(enemy.x - player.x, enemy.y-player.y) > 2.5) {
						let origins = [
							{x:player.x + e.dist, y: player.y},
							{x:player.x - e.dist, y: player.y},
							{x:player.x, y: player.y+e.dist},
							{x:player.x, y: player.y-e.dist},
							{x:player.x+e.dist, y: player.y+e.dist},
							{x:player.x+e.dist, y: player.y-e.dist},
							{x:player.x-e.dist, y: player.y+e.dist},
							{x:player.x-e.dist, y: player.y-e.dist},
							{x:player.x+e.dist, y: player.y+e.dist/2},
							{x:player.x+e.dist, y: player.y-e.dist/2},
							{x:player.x-e.dist, y: player.y+e.dist/2},
							{x:player.x-e.dist, y: player.y-e.dist/2},
							{x:player.x+e.dist/2, y: player.y+e.dist},
							{x:player.x+e.dist/2, y: player.y-e.dist},
							{x:player.x-e.dist/2, y: player.y+e.dist},
							{x:player.x-e.dist/2, y: player.y-e.dist},
						];


						origins = origins.filter((origin) => {
							return KinkyDungeonNoEnemy(origin.x, origin.y)
							&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(origin.x, origin.y))
							&& KinkyDungeonCheckPath(origin.x, origin.y, player.x, player.y, true, false, 1);
						});
						let finalorigin = [];
						for (let i =0; i < e.count; i++) {
							let index = Math.floor(KDRandom()*origins.length);
							if (origins[index]) {
								finalorigin.push(origins[index]);
								origins.splice(index, 1);
							}
						}
						for (let origin of finalorigin) {
							let spell = KinkyDungeonFindSpell(e.kind, true);
							let b = KinkyDungeonLaunchBullet(origin.x, origin.y,
								player.x,player.y,
								0.5, {noSprite: spell.noSprite, faction: "Ambush", name:spell.name, block: spell.block, width:spell.size, height:spell.size, summon:spell.summon,
									targetX: player.x, targetY: player.y, cast: Object.assign({}, spell.spellcast),
									source: enemy.id, dot: spell.dot,
									bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
									bulletSpin: spell.bulletSpin,
									effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
									effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
									passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
									pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
									lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: spell.range, hit:spell.onhit,
									damage: {evadeable: spell.evadeable, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}, false);
							b.visual_x = origin.x;
							b.visual_y = origin.y;
							let dist = KDistEuclidean(player.x - origin.x, player.y - origin.y);
							b.vy = 0.5 * (player.y - origin.y)/dist;
							b.vx = 0.5 * (player.x - origin.x)/dist;
						}

						if (finalorigin.length > 0) {
							KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Missile.ogg", enemy);
							KinkyDungeonSetEnemyFlag(enemy, "dollmakerMissiles", e.time);
						}


					}
				}
			}
		},
		"nurseAura": (e, enemy, data) => {
			// We heal nearby allies and self
			if (data.delta && KinkyDungeonCanCastSpells(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let nearby = KDNearbyNeutrals(enemy.x, enemy.y, e.dist, enemy);
					for (let en of nearby) {
						if (en.hp > 0.52) en.hp = Math.min(en.hp + e.power, en.Enemy.maxhp);
					}
				}
			}
		},
		"shadowDebuff": (e, enemy, data) => {
			// We heal nearby allies and self
			if (((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				let light = KinkyDungeonBrightnessGet(enemy.x, enemy.y);
				if (light >= 4.5) {
					KinkyDungeonApplyBuffToEntity(enemy, {id: "ShadowDebuff1", aura: "#ff5555", type: "MoveSpeed", duration: 1, power: -0.7, tags: ["speed"]});
					KinkyDungeonApplyBuffToEntity(enemy, {id: "ShadowDebuff2", aura: "#ff5555", type: "AttackSpeed", duration: 1, power: -0.5, tags: ["speed"]});
				} else if (light > 3) {
					KinkyDungeonApplyBuffToEntity(enemy, {id: "ShadowDebuff1", aura: "#ff5555", type: "MoveSpeed", duration: 1, power: -0.4, tags: ["speed"]});
				}
			}
		},
		"shadowDommeRefresh": (e, enemy, data) => {
			if (KinkyDungeonFlags.get("ShadowDommed")) {
				KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
			}
		},
		"wolfShieldDroneAura": (e, enemy, data) => {
			// We apply a buff to nearby allies, but not self
			if (data.delta && KinkyDungeonCanCastSpells(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let nearby = KDNearbyNeutrals(enemy.x, enemy.y, e.dist, enemy);
					for (let en of nearby) {
						if (en != enemy && en.hp > 0.52 && KDMatchTags(["nevermere", "wolfgirl", "alchemist", "dressmaker", "bountyhunter"], en)) {
							KinkyDungeonApplyBuffToEntity(en, {
								id: "WolfDroneArmor", aura: "#00ffff", type: "Armor", duration: 1.1, power: e.power, player: false, enemies: true, tags: ["defense", "armor"]
							});
							KinkyDungeonApplyBuffToEntity(en, {
								id: "WolfDroneSpellResist", type: "SpellResist", duration: 1.1, power: e.power, player: false, enemies: true, tags: ["defense", "spellresist"]
							});
						}
					}
				}
			}
		},
		"maidforceHeadAura": (e, enemy, data) => {
			// We apply a buff to nearby allies, but not self
			if (data.delta && KinkyDungeonCanCastSpells(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))
				&& KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 2.5) {
				if (!e.chance || KDRandom() < e.chance) {
					if (enemy.aware && KinkyDungeonAggressive(enemy) && (KDPlayerIsStunned())) {
						KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, "charm", {name: "MaidChastity", power: 2, damage: "charm"});
					}
				}
			}
		},
		"electrifyLocal": (e, enemy, data) => {
			if (data.delta && (enemy.aware || enemy.vp > 0.5) && (KDNearbyEnemies(enemy.x, enemy.y, 1.5, enemy).length > 0 || KinkyDungeonAggressive(enemy)) && KinkyDungeonCanCastSpells(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let count = e.power ? e.power : 1;
					let rad = e.aoe ? e.aoe : 1.5;
					let minrad = 0.5;
					for (let i = 0; i < count; i++) {
						let slots = [];
						for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
							for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
								if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
									if ((enemy.x + X > 0 && enemy.y + Y > 0 && enemy.x + X < KDMapData.GridWidth && enemy.y + Y < KDMapData.GridHeight)
										&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + X, enemy.y + Y)))
										slots.push({x:X, y:Y});
								}
							}

						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							if (slot) {
								KinkyDungeonCastSpell(enemy.x + slot.x, enemy.y + slot.y, KinkyDungeonFindSpell("WitchElectrify", true), enemy, undefined, undefined);
							}
						}

					}
				}
			}
		},
		// Simple spell checkerboard pattern
		"spellX": (e, enemy, data) => {
			if (data.delta
				&& (e.always || enemy.aware || enemy.vp > 0.5)
				&& (e.always || KDNearbyEnemies(enemy.x, enemy.y, 1.5, enemy).length > 0|| KinkyDungeonAggressive(enemy))
				&& KinkyDungeonCanCastSpells(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!KDEnemyHasFlag(enemy, e.spell + "spellXCD") && (!e.chance || KDRandom() < e.chance)) {
					let slots = [];
					if (KDEnemyHasFlag(enemy, e.spell + "spellXAlt")) {
						slots = [{x: -1, y: -1}, {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}];
						KinkyDungeonSetEnemyFlag(enemy, e.spell + "spellXAlt", 0);
					} else {
						slots = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
						KinkyDungeonSetEnemyFlag(enemy, e.spell + "spellXAlt", -1);
					}
					slots = slots.filter((slot) => {
						return (enemy.x + slot.x > 0 && enemy.y + slot.y > 0 && enemy.x + slot.x < KDMapData.GridWidth && enemy.y + slot.y < KDMapData.GridHeight)
							&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + slot.x, enemy.y + slot.y));
					});
					KinkyDungeonSetEnemyFlag(enemy, e.spell + "spellXCD", e.time);
					if (slots.length > 0) {
						let cnt = 0;
						for (let S of slots) {
							let slot = e.count ? slots[Math.floor(KDRandom() * slots.length)] : S;
							KinkyDungeonCastSpell(enemy.x + slot.x, enemy.y + slot.y, KinkyDungeonFindSpell(e.spell, true), enemy, undefined, undefined);
							cnt += 1;
							if (cnt >= e.count) break;
						}
					}
				}
			}
		},
		"createEffectTile": (e, enemy, data) => {
			if (data.delta &&((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let count = e.power ? e.power : 1;
					let rad = e.aoe ? e.aoe : 1.5;
					let minrad = e.dist;
					for (let i = 0; i < count; i++) {
						let slots = [];
						for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
							for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
								if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
									if ((enemy.x + X > 0 && enemy.y + Y > 0 && enemy.x + X < KDMapData.GridWidth && enemy.y + Y < KDMapData.GridHeight)
										&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + X, enemy.y + Y)))
										slots.push({x:X, y:Y});
								}
							}

						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							if (slot) {
								KDCreateEffectTile(enemy.x + slot.x, enemy.y + slot.y, {
									name: e.kind,
								}, e.time);
							}
						}

					}
				}
			}
		},
		"createWater": (e, enemy, data) => {
			if (data.delta && !(enemy.freeze > 0) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let count = e.power ? e.power : 1;
					let rad = e.aoe ? e.aoe : 1.5;
					let minrad = e.dist;
					for (let i = 0; i < count; i++) {
						let slots = [];
						for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
							for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
								if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
									if ((enemy.x + X > 0 && enemy.y + Y > 0 && enemy.x + X < KDMapData.GridWidth && enemy.y + Y < KDMapData.GridHeight)
										&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + X, enemy.y + Y)))
										slots.push({x:X, y:Y});
								}
							}

						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							if (slot) {
								KDCreateEffectTile(enemy.x + slot.x, enemy.y + slot.y, {
									name: "Water",
									duration: 12,
								}, 8);
							}
						}

					}
				}
			}
		},
		"createIce": (e, enemy, data) => {
			if (data.delta && !(enemy.freeze > 0) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let count = e.power ? e.power : 1;
					let rad = e.aoe ? e.aoe : 1.5;
					let minrad = e.dist;
					for (let i = 0; i < count; i++) {
						let slots = [];
						for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
							for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
								if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
									if ((enemy.x + X > 0 && enemy.y + Y > 0 && enemy.x + X < KDMapData.GridWidth && enemy.y + Y < KDMapData.GridHeight)
										&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(enemy.x + X, enemy.y + Y)))
										slots.push({x:X, y:Y});
								}
							}

						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							if (slot) {
								KDCreateEffectTile(enemy.x + slot.x, enemy.y + slot.y, {
									name: "Ice",
									duration: 6,
								}, 4);
							}
						}

					}
				}
			}
		},
		"ApplyConductionAoE": (e, enemy, data) => {
			if (data.delta > 0 && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				let bb = Object.assign({}, KDConduction);
				bb.duration = 1;
				let enemies = KDNearbyEnemies(enemy.x, enemy.y, e.aoe);
				for (let entity of enemies) {
					if (!entity.buffs) entity.buffs = {};
					KinkyDungeonApplyBuffToEntity(entity, bb);
				}
				if (KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < e.aoe) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
				}
			}
		},
		"CastSpellNearbyEnemy": (e, enemy, data) => {
			if (data.delta > 0 && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				let enemies = KDNearbyEnemies(enemy.x, enemy.y, e.aoe).filter((enemy2) => {
					return (KDHostile(enemy2) || (enemy.x == enemy2.x && enemy.y == enemy2.y && KDFactionRelation(KDGetFaction(enemy2), KDGetFaction(enemy)) < 0.5));
				});
				if (e.player && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < e.aoe) {
					enemies.push(KinkyDungeonPlayerEntity);
				}
				if (enemies.length > 0) {
					let enemy2 = enemies[Math.floor(KDRandom() * enemies.length)];
					KinkyDungeonCastSpell(enemy2.x, enemy2.y, KinkyDungeonFindSpell(e.spell, true), undefined, undefined, undefined, KDGetFaction(enemy));
				}
			}
		},
	},
};

/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {entity} enemy
 * @param {*} data
 */
function KinkyDungeonHandleEnemyEvent(Event, e, enemy, data) {
	if (Event === e.trigger && KDEventMapEnemy[Event] && KDEventMapEnemy[Event][e.type]) {
		KDEventMapEnemy[Event][e.type](e, enemy, data);
	}
}



/**
 * @type {Object.<string, Object.<string, function(string, *): void>>}
 */
let KDEventMapGeneric = {
	"calcEnemyTags": {
		"perkTags": (e, data) => {
			// This event adds tags to enemy tag determination based on perk prefs
			if (KinkyDungeonStatsChoice.get("TapePref")) data.tags.push("tapePref");
			else if (KinkyDungeonStatsChoice.get("TapeOptout")) data.tags.push("tapeOptout");
		}
	},
	"postMapgen": {
		"resetDollRoom": (e, data) => {
			//if (!KDGameData.RoomType || !(alts[KDGameData.RoomType].data?.dollroom)) {
			//KDGameData.DollRoomCount = 0;
			//}
		}
	},
	"orgasm": {
		"tickNeeds": (e, data) => {
			KDNeedsOrgasm(data);
		}
	},
	"playSelf": {
		"tickNeeds": (e, data) => {
			KDNeedsPlaySelf(data);
		}
	},
	"edge": {
		"tickNeeds": (e, data) => {
			KDNeedsEdge(data);
		}
	},
	"deny": {
		"tickNeeds": (e, data) => {
			KDNeedsDeny(data);
		}
	},
	"defeat": {
		"dollRoomRemove": (e, enemy, data) => {
			// Removes the excess dollsmiths that are spawned when you escape the dollroom
			if (KDGameData.RoomType && alts[KDGameData.RoomType].data?.dollroom) {
				for (let en of KDMapData.Entities) {
					if (en.Enemy.tags.dollsmith) {
						en.noDrop = true;
						en.hp = 0;
						KDClearItems(en);
					}
				}
			}
		}
	},
	"beforeHandleStairs": {
		"resetDollRoom": (e, data) => {
			if (KDGameData.RoomType && alts[KDGameData.RoomType].data?.dollroom) {
				KDGameData.DollRoomCount += 1;
				if (KDGameData.DollRoomCount >= 3) {
					// Allow player to pass unless returning to previous
					if (KinkyDungeonFlags.get("NoDollRoomBypass")) {
						data.overrideProgression = true;
						data.overrideRoomType = true;
						data.mapMod = "";
						KDGameData.RoomType = "";
					}
				} else {
					data.overrideRoomType = true;
					data.overrideProgression = true;
					data.mapMod = "";
					KDGameData.RoomType = "DollRoom";
				}

			}
		},
		"NoRepeatTunnels": (e, data) => {
			// The player can never backtrack to a tunnel
			if (data.toTile == 'S' && data.tile?.RoomType == "Tunnel") {
				data.overrideRoomType = true;
				KDGameData.RoomType = "";
			}
		},
		"Shop": (e, data) => {
			// The player can never backtrack to a tunnel
			if (data.toTile == 'S' && data.tile?.RoomType == "JourneyFloor") {
				//data.overrideRoomType = true;
				data.tile.RoomType = "ShopStart";
			}
		},
		"SkipOldPerkRooms": (e, data) => {
			// The player can never backtrack to old perk rooms
			if (data.toTile != 'S' && !data.tile?.RoomType && MiniGameKinkyDungeonLevel < KDGameData.HighestLevelCurrent) {
				data.overrideRoomType = true;
				KDGameData.RoomType = "";
				data.AdvanceAmount = 1;
			}
		},
	},
	"drawSGTooltip": {
		"goddessBonus": (e, data) => {
			if (data.item && KDRestraint(data.item)?.shrine) {
				let bonus = KDGetItemGoddessBonus(data.item);

				if (bonus) {
					data.extraLines.push(TextGet("KDGoddessStat_" + (bonus > 0 ? "Bonus" : "Penalty")) + Math.round(100 * bonus) + "%");
					data.extraLineColor.push(KDGetPosNegColor(bonus));
				}
			}
		},
	},
	"playerMove": {
		"Conveyor": (e, data) => {
			for (let player of [KinkyDungeonPlayerEntity]) {
				if (KinkyDungeonMapGet(player.x, player.y) == 'V')
					KDConveyor(1, player.x, player.y);
			}

		},
		"noisyTerrain": (e, data) => {
			if (data.sprint && !data.cancelmove) {
				let moves = [
					{x: data.moveX, y: data.moveY, str: data.moveX + "," + data.moveY},
				];
				for (let m of moves)
					if (KinkyDungeonEffectTilesGet(m.str)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(m.str))) {
							if (tile.tags && tile.tags.includes("noisy")) {
								KinkyDungeonMakeNoise(5, m.x, m.y);
								KinkyDungeonSendTextMessage(3, TextGet("KDNoisyTerrain"), "#ff8800", 3, false, true);
							}
						}
					}
			}
		},
	},
	"resetEventVar": {
		/**
		 * Helper event to clear out variables that are meant to always be reset every floor
		 * You can add your own event like this one
		 */
		"resetVars": (e, data) => {
			KDEventData.SlimeLevel = 0;
		},
	},
	"resetEventVarTick": {
		/**
		 * Helper event to clear out variables that are meant to always be reset every floor
		 * You can add your own event like this one
		 */
		"resetVars": (e, data) => {
			if (KDEventData.SlimeLevel < 0)
				KDEventData.SlimeLevel = 0;
			KDEventData.SlimeLevelStart = KDEventData.SlimeLevel;
			if (KDAlertCD > 0) KDAlertCD -= data.delta;

			if (KinkyDungeonLastTurnAction != "Attack" && KDGameData.WarningLevel > 0) {
				if (KDRandom() < 0.25) KDGameData.WarningLevel -= data.delta;
				if (KDGameData.WarningLevel > 5) KDGameData.WarningLevel = 5;
			}
		},
	},
	"draw": {
		"HighProfile": (e, data) => {
			if (!KinkyDungeonStatsChoice.get("HighProfile")) return;
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;
			for (let enemy of KDMapData.Entities) {
				if (KDEntityHasBuff(enemy, "HighValue")
					&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0
					//&& KDCanSeeEnemy(enemy)
				) {
					KDDraw(kdcanvas, kdpixisprites, enemy.id + "_hvtarg", KinkyDungeonRootDirectory + "UI/HighValueTarget.png",
						(enemy.visual_x - data.CamX - data.CamX_offset - 0.5) * KinkyDungeonGridSizeDisplay,
						(enemy.visual_y - data.CamY - data.CamY_offset - 0.5) * KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize * 2, KinkyDungeonSpriteSize * 2, undefined, {
							zIndex: 10,
						});
				}
			}

		},
	},
	/** Stuff that occurs after the quest stuff is generated */
	"postQuest": {
		/**
		 * Helper event to clear out flags that are meant to always be reset every floor
		 * You can add your own event like this one
		 */
		"resetFlags": (e, data) => {
			KinkyDungeonSetFlag("slept", 0);
		},
		/** Updates gold locks */
		"lockStart": (e, data) => {
			for (let tuple of KinkyDungeonAllRestraintDynamic()) {
				let inv = tuple.item;
				if (inv.lock && KDLocks[inv.lock] && KDLocks[inv.lock].levelStart) {
					KDLocks[inv.lock].levelStart(inv);
				}
			}
		},
		/** High Profile perk */
		"HighProfile": (e, data) => {
			if (!KinkyDungeonStatsChoice.get("HighProfile")) return;
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;
			// Select some enemies and make them high value
			let eligible = [];
			for (let enemy of KDMapData.Entities) {
				// Avoid stuff like minor rope snakes, summons, allies, immobile stuff, bosses, and prisoners
				if (enemy.Enemy.tags.leashing && !enemy.summoned && !enemy.lifetime && !enemy.Enemy.tags.stageBoss && !KDIsImmobile(enemy) && !KDEnemyHasFlag(enemy, "imprisoned") && !KDAllied(enemy) && (!enemy.Enemy.tags.minor || enemy.Enemy.bound)) {
					let chance = 0.1;
					if (!enemy.Enemy.tags.minor) {
						chance = 0.2;
					}
					if (enemy.Enemy.tags.elite) {
						chance = 0.4;
					}
					if (enemy.Enemy.tags.miniboss) {
						chance = 0.7;
					}
					if (enemy.Enemy.tags.boss) {
						chance = 1.0;
					}
					if (KDRandom() < chance) eligible.push(enemy);
				}
			}
			let maxHV = Math.max(KDMapData.Entities.length * 0.1, eligible.length * 0.5);
			for (let i = 0; i < maxHV && eligible.length > 0; i++) {
				let index = Math.floor(KDRandom()*eligible.length);
				let enemy = eligible[index];
				eligible.splice(index, 1);

				// Select this enemy
				KDMakeHighValue(enemy);
			}
		},
		/** For new game plus, we make the game harder by replacing basic enemies with harder ones */
		"NGPlusReplace": (ev, data) => {
			if (!KinkyDungeonNewGame) return;
			let chance = 1 - (0.8**KinkyDungeonNewGame);
			let bosschance = 1 - (0.9**KinkyDungeonNewGame);
			let regbuffchance = 1 - (0.95**KinkyDungeonNewGame);


			let entities = Object.assign([], KDMapData.Entities);
			for (let e of entities) {
				if (KDRandom() < chance && !KDEntityHasBuff(e, "HighValue")) {
					let Enemy = null;
					if (KDHardModeReplace[e.Enemy.name]) Enemy = KinkyDungeonGetEnemyByName(KDHardModeReplace[e.Enemy.name]);
					if (Enemy) {
						KDSpliceIndex(KDMapData.Entities.indexOf(e), 1);
						e.Enemy = JSON.parse(JSON.stringify(Enemy));
						KDAddEntity(e);

						if (!e.CustomName)
							KDProcessCustomPatron(Enemy, e, 0.2);
						KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
						let shop = KinkyDungeonGetShopForEnemy(e, false);
						if (shop) {
							KinkyDungeonSetEnemyFlag(e, "Shop", -1);
							KinkyDungeonSetEnemyFlag(e, shop, -1);
						}
						let loadout = KinkyDungeonGetLoadoutForEnemy(e, false);
						KDSetLoadout(e, loadout);
					}
					if (KDRandom() < bosschance || e.Enemy.tags.stageBoss) {
						let buff = KDGetByWeight(KDGetSpecialBuffList(e, ["NGP_Boss"]));
						if (buff) {
							KDSpecialBuffs[buff].apply(e, ["NGP_Boss"]);
						}

						e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
						e.Enemy.power *= 1.5;
						e.Enemy.maxhp = e.Enemy.maxhp*2;
					} else if (KDRandom() < regbuffchance) {
						let buff = KDGetByWeight(KDGetSpecialBuffList(e, ["NGP_Reg"]));
						if (buff) {
							KDSpecialBuffs[buff].apply(e, ["NGP_Reg"]);
						}
					}
					e.hp = e.Enemy.maxhp;
				}


			}
		},
		"HardModeReplace": (ev, data) => {
			if (!KinkyDungeonStatsChoice.get("hardMode")) return;
			let chance = 0.2;
			let bosschance = 0.3;
			let bosshpchance = 0.4;

			let boss = ["Hardmode_Boss"];
			let reg = ["Hardmode_Reg"];

			if (KinkyDungeonStatsChoice.get("extremeMode")) {
				chance = 1.0;
				bosschance = 0.4;
				bosshpchance = 1.0;
				boss.push("ExtremeBoss", "Extreme");
				reg.push("ExtremeReg", "Extreme");
			}

			let entities = Object.assign([], KDMapData.Entities);
			for (let e of entities) {
				if (KDRandom() < chance && !KDEntityHasBuff(e, "HighValue")) {
					let Enemy = null;
					if (KDHardModeReplace[e.Enemy.name]) Enemy = KinkyDungeonGetEnemyByName(KDHardModeReplace[e.Enemy.name]);
					if (Enemy) {
						KDSpliceIndex(KDMapData.Entities.indexOf(e), 1);
						e.Enemy = JSON.parse(JSON.stringify(Enemy));
						KDAddEntity(e);

						if (!e.CustomName)
							KDProcessCustomPatron(Enemy, e, 0.2);
						KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
						let shop = KinkyDungeonGetShopForEnemy(e, false);
						if (shop) {
							KinkyDungeonSetEnemyFlag(e, "Shop", -1);
							KinkyDungeonSetEnemyFlag(e, shop, -1);
						}
						let loadout = KinkyDungeonGetLoadoutForEnemy(e, false);
						KDSetLoadout(e, loadout);
					}
					let bossBuff = false;
					if (KDRandom() < bosschance || e.Enemy.tags.stageBoss) {
						let buff = KDGetByWeight(KDGetSpecialBuffList(e, boss));
						if (buff) {
							KDSpecialBuffs[buff].apply(e, boss);
						}
						bossBuff = true;

						if (KDRandom() < bosshpchance) {
							e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
							e.Enemy.power *= 1.5;
							e.Enemy.maxhp = e.Enemy.maxhp*2;
						}
					}
					if (!bossBuff || KinkyDungeonStatsChoice.get("extremeMode")) {
						let buff = KDGetByWeight(KDGetSpecialBuffList(e, reg));
						if (buff) {
							KDSpecialBuffs[buff].apply(e, reg);
						}
					}
					e.hp = e.Enemy.maxhp;
				}


			}
		},
	},
	"hit": {
		"StunBondage": (e, data) => {
			if (data.player == KinkyDungeonPlayerEntity && data.restraintsAdded?.length > 0 && KinkyDungeonStatsChoice.has("StunBondage")) {
				KDStunTurns(data.restraintsAdded.length, false);
			}
		},
	},
	"boundBySpell": {
		"StunBondage": (e, data) => {
			if (data.player == KinkyDungeonPlayerEntity && data.restraintsAdded?.length > 0 && KinkyDungeonStatsChoice.has("StunBondage")) {
				KDStunTurns(data.restraintsAdded.length, false);
			}
		},
	},
	"tickFlags": {
		"TempFlagFloorTicks": (e, data) => {
			if (KDGameData.TempFlagFloorTicks)
				for (let f of Object.entries(KDGameData.TempFlagFloorTicks)) {
					if (!KinkyDungeonFlags.get(f[0])) delete KDGameData.TempFlagFloorTicks[f[0]];
					else {
						if (f[1] > data.delta) KDGameData.TempFlagFloorTicks[f[0]] = KDGameData.TempFlagFloorTicks[f[0]] - data.delta;
						else {
							KinkyDungeonSetFlag(f[0], 0);
							delete KDGameData.TempFlagFloorTicks[f[0]];
						}
					}
				}
		}
	},
	/*"calcDisplayDamage": {
		"BoostDamage": (e, data) => {
			if (KinkyDungeonStatMana >= KinkyDungeonStatMana * 0.999 && KinkyDungeonStatsChoice.has("GroundedInReality")) {
				data.buffdmg = Math.max(0, data.buffdmg + KinkyDungeonPlayerDamage.dmg * 0.3);
			}
		},
	},*/
	"playerAttack": {
		"GroundedInReality": (e, data) => {
			if (KinkyDungeonPlayerDamage && KinkyDungeonStatMana >= KinkyDungeonStatManaMax * 0.999 && KinkyDungeonStatsChoice.has("GroundedInReality")) {
				if (!data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: "electric",
						damage: KinkyDungeonPlayerDamage.dmg * 0.3,
					}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
	},
	"calcMultMana": {
		"ImmovableObject": (e, data) => {
			if (KinkyDungeonStatWill >= KinkyDungeonStatWillMax * 0.90 && KinkyDungeonStatsChoice.has("ImmovableObject")) {
				if (data.spell && data.spell.tags && data.spell.tags.includes("buff") && data.spell.tags.includes("earth"))
					data.cost = data.cost * 0.5;
			}
		},
	},
	"canSprint": {
		"NovicePet": (e, data) => {
			if (KinkyDungeonStatsChoice.has("NovicePet")) {
				if (KinkyDungeonPlayerTags.get("Petsuits")) {
					data.mustStand = false;
				} else if (KinkyDungeonFlags.get("NovicePet3")) {
					data.canSprint = false;
				}
			}
		}
	},
	"tick": {
		"HighProfile": (e, data) => {
			if (!KinkyDungeonStatsChoice.get("HighProfile")) return;
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;

			let player = KinkyDungeonPlayerEntity;
			let nearby = KDNearbyEnemies(player.x, player.y, 12);
			for (let enemy of nearby) {
				if (KDEntityHasBuff(enemy, "HighValue")) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
						{id: "HighValueFound", type: "HighValueFound", duration: 2, power: 0, buffSprite: true, aura: "#ffff00"}
					);
					return;
				}
			}
		},
		"DollRoomUpdate": (e, data) => {
			if (KDGameData.RoomType && alts[KDGameData.RoomType].data?.dollroom) {
				// Spawn shopkeeper

				if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.OffLimits
					&& KDCanSpawnShopkeeper(true)
					&& KDRandom() < 0.1) KDStartDialog("ShopkeeperRescue", "ShopkeeperRescue", true, "", undefined);

				let spawn = true;
				let eligible = false;
				for (let player of [KinkyDungeonPlayerEntity]) {
					if (spawn && KDistEuclidean(player.x - KDMapData.StartPosition.x, player.y - KDMapData.StartPosition.y) < 10) {
						spawn = false;
					}
					if (spawn && !eligible && !KinkyDungeonTilesGet(player.x + "," + player.y)?.OffLimits) {
						eligible = true;
					}
				}
				if (eligible && spawn && !KinkyDungeonFlags.get("spawnDollsmith")) {
					let count = 0;
					for (let en of KDMapData.Entities) {
						if (en.Enemy.tags.dollsmith) count += 1;
					}
					if (count < 5) {
						KinkyDungeonSetFlag("spawnDollsmith", 15);
						let en = DialogueCreateEnemy(KDMapData.StartPosition.x, KDMapData.StartPosition.y, "Dollsmith");
						en.summoned = true;
						en.noDrop = true;
					}
				}
			}
		},
		"SecondWind": (e, data) => {
			if (KinkyDungeonStatsChoice.has("SecondWind")) {

				let amount = 0.1;
				if (KinkyDungeonFlags.get("SecondWind1")) amount += 0.15;

				if (KinkyDungeonStatWill < KinkyDungeonStatWillMax * amount
					&& !KinkyDungeonIsArmsBound(false, false)
					&& !KinkyDungeonIsHandsBound(false, false, 0.01)
					&& KinkyDungeonSlowLevel < 1
					&& KinkyDungeonGagTotal(false) < 0.01
					&& KinkyDungeonGetBlindLevel() < 1)
				{
					KinkyDungeonChangeWill(0.2, false);
				}
				if (!KinkyDungeonFlags.get("SecondWindSpell")) {
					KinkyDungeonSetFlag("SecondWindSpell", -1);
					KinkyDungeonSpells.push(KinkyDungeonFindSpell("SecondWind0"));
				}
				if (!KinkyDungeonFlags.get("SecondWind1")) {
					if (KDHasSpell("SecondWind1")) {
						KinkyDungeonSetFlag("SecondWind1", -1);
					}
				}
			}
		},
		"NovicePet": (e, data) => {
			if (KinkyDungeonStatsChoice.has("NovicePet")) {

				let amount = 0;
				if (KinkyDungeonFlags.get("NovicePet1")) amount += 1;
				if (KinkyDungeonFlags.get("NovicePet2")) amount += 1;
				if (KinkyDungeonFlags.get("NovicePet3")) amount += 1;

				if (KinkyDungeonPlayerTags.get("Petsuits")) {
					if (amount > 0)
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
							id: "NovicePet",
							type: "SlowLevel",
							power: -amount,
							duration: 2,
							aura: "#ffffff",
							aurasprite: "Null",
							buffSprite: true,
						});
				} else if (KinkyDungeonFlags.get("NovicePet3")) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "NovicePetBad2",
						type: "SlowLevel",
						power: 2,
						duration: 2,
					});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "NovicePetVeryBad",
						type: "SprintEfficiency",
						power: -1.0,
						duration: 2,
						aura: "#ffffff",
						aurasprite: "Null",
						buffSprite: true,
					});
				} else if (KinkyDungeonFlags.get("NovicePet2")) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "NovicePetBad2",
						type: "SlowLevel",
						power: 1,
						duration: 2,
					});
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "NovicePetBad",
						type: "SprintEfficiency",
						power: -1.0,
						duration: 2,
						aura: "#ffffff",
						aurasprite: "Null",
						buffSprite: true,
					});
				} else if (KinkyDungeonFlags.get("NovicePet1")) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "NovicePetBad",
						type: "SprintEfficiency",
						power: -0.3,
						duration: 2,
						aura: "#ffffff",
						aurasprite: "Null",
						buffSprite: true,
					});
				}

				if (!KinkyDungeonFlags.get("NovicePetSpell")) {
					KinkyDungeonSetFlag("NovicePetSpell", -1);
					KinkyDungeonSpells.push(KinkyDungeonFindSpell("NovicePet0"));
				}
				if (!KinkyDungeonFlags.get("NovicePet1")) {
					if (KDHasSpell("NovicePet1")) {
						KinkyDungeonSetFlag("NovicePet1", -1);
					}
				}
				if (!KinkyDungeonFlags.get("NovicePet2")) {
					if (KDHasSpell("NovicePet2")) {
						KinkyDungeonSetFlag("NovicePet2", -1);
					}
				}
				if (!KinkyDungeonFlags.get("NovicePet3")) {
					if (KDHasSpell("NovicePet3")) {
						KinkyDungeonSetFlag("NovicePet3", -1);
					}
				}
				if (!KinkyDungeonFlags.get("NovicePetX")) {
					if (KDHasSpell("NovicePetX")) {
						KinkyDungeonSetFlag("NovicePetX", -1);
						KinkyDungeonStatsChoice.delete("NovicePet");
					}
				}
			}
		},
		"BurningDesire": (e, data) => {
			if (KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax * 0.7 && KinkyDungeonStatsChoice.has("BurningDesire")) {
				let px = KinkyDungeonPlayerEntity.x - 1 + Math.round(2 * KDRandom());
				let py = KinkyDungeonPlayerEntity.y - 1 + Math.round(2 * KDRandom());
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(px, py)))
					KDCreateEffectTile(px, py, {
						name: "Ember",
						duration: 4
					}, 1);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "BurningDesire",
					type: "fireDamageBuff",
					power: 0.4,
					duration: 2
				});

			}
		},
		"Needs": (e, data) => {
			if (KinkyDungeonStatsChoice.get("Needs")) {
				if (data.delta > 0 && !(KDGameData.OrgasmStamina > 0)) {
					if (KinkyDungeonStatDistractionLower < KinkyDungeonStatDistractionLowerCap * KinkyDungeonStatDistractionMax) {
						KinkyDungeonStatDistractionLower = Math.min(KinkyDungeonStatDistractionLower + data.delta*0.01, KinkyDungeonStatDistractionLowerCap * KinkyDungeonStatDistractionMax);
					}
				}
			}
		},
		"LikeTheWind": (e, data) => {
			if (KinkyDungeonStatStamina >= KinkyDungeonStatStaminaMax * 0.95 && KinkyDungeonStatsChoice.has("LikeTheWind")) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "LikeTheWind",
					type: "Evasion",
					power: 0.3,
					duration: 2
				});
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "LikeTheWind2",
					type: "SlowLevel",
					power: -1,
					duration: 2
				});

			}
		},
		"ImmovableObject": (e, data) => {
			if (KinkyDungeonStatWill >= KinkyDungeonStatWillMax * 0.90 && KinkyDungeonStatsChoice.has("ImmovableObject")) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ImmovableObject",
					type: "RestraintBlock",
					power: 15,
					duration: 2
				});

			}
		},
		"LeastResistance": (e, data) => {
			if (KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.01 && KinkyDungeonStatsChoice.has("LeastResistance")) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "LeastResistance",
					type: "Evasion",
					power: 0.35,
					duration: 2
				});
			}
		},

		"FrigidPersonality": (e, data) => {
			if (KinkyDungeonStatDistraction <= KinkyDungeonStatDistractionMax * 0.01 && KinkyDungeonStatsChoice.has("FrigidPersonality")) {
				let px = KinkyDungeonPlayerEntity.x - 1 + Math.round(2 * KDRandom());
				let py = KinkyDungeonPlayerEntity.y - 1 + Math.round(2 * KDRandom());
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(px, py)))
					KDCreateEffectTile(px, py, {
						name: "Ice",
						duration: 4
					}, 1);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "FrigidPersonality",
					type: "iceDamageBuff",
					power: 0.1,
					duration: 2
				});
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "FrigidPersonality2",
					type: "frostDamageBuff",
					power: 0.1,
					duration: 2
				});
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, KDNoChillNoAura);

			}
		},
	},
	"playerCast": {
		"ArousingMagic": (e, data) => {
			if (KinkyDungeonStatsChoice.get("ArousingMagic")) {
				KinkyDungeonChangeDistraction(KinkyDungeonGetManaCost(data.spell), false, 0.1);
			}
		},
		"Clearheaded": (e, data) => {
			if (KinkyDungeonStatsChoice.get("Clearheaded")) {
				KinkyDungeonChangeDistraction(-KinkyDungeonGetManaCost(data.spell), false, 0.1);
			}
		},
	},
	"beforeDamage": {
		"LeastResistance": (e, data) => {
			if (KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.01 && KinkyDungeonStatsChoice.has("LeastResistance")) {
				if (data.attacker && data.target.player && data.bound && data.eventable && (data.attacker.player || !data.target.player || KinkyDungeonAggressive(data.attacker))) {
					if (data.attacker.player) {
						KinkyDungeonDealDamage({damage: KinkyDungeonStatWillMax*0.1, type: "acid"});
					} else {
						KinkyDungeonDamageEnemy(data.attacker, {damage: KinkyDungeonStatWillMax*0.20, type: "acid"}, false, false, undefined, undefined, KinkyDungeonPlayerEntity);
					}
				}
			}
		},
	},
	"perksStruggleCalc": {
		"CursedLocks": (e, data) => {
			if (KinkyDungeonStatsChoice.get("CursedLocks") && data.struggleType == "Cut" && data.restraint.lock) {
				data.escapeChance = -100;
				if (data.Msg) {
					KinkyDungeonSendTextMessage(10, TextGet("KDCursedLocks"), "#aa4488", 1.1);
				}
			}
		},
	},
	"beforeChest": {
		"shadowChest": (e, data) => {
			if ((data.chestType == "shadow" || data.chestType == "lessershadow") && KDCanCurse(["ChestCollar"])) {
				// Shadow chests spawn cursed epicenter
				KDSummonCurseTrap(data.x, data.y);
			}
		},
		"lessergoldChest": (e, data) => {
			if ((data.chestType == "lessergold" || data.chestType == "gold") && KDCanCurse(["ChestCollar"])) {
				// Shadow chests spawn cursed epicenter
				KDSummonCurseTrap(data.x, data.y);
			}
		},
	},
	"kill": {
		"HighProfile": (e, data) => {
			if (data.enemy && KDEntityHasBuff(data.enemy, "HighValue")) {
				KinkyDungeonAddGold(Math.round(data.enemy.Enemy.maxhp*5));
			}
		}
	},
	"specialChests": {
		"hardmode": (e, data) => {
			if (KinkyDungeonStatsChoice.get("hardMode")) {
				data.specialChests.shadow = (data.specialChests.shadow || 0) + 2;
				data.specialChests.blue = (data.specialChests.blue || 0) + 1;
			}
		},
		"demontransition": (e, data) => {
			if (data.altType?.name == "DemonTransition") data.specialChests.lessershadow = 10;
		},
		"bluechest": (e, data) => {
			if (!data.altType) data.specialChests.blue = (data.specialChests.blue || 0) + 1;
		},
	},
	"genSpecialChest": {
		"blue": (e, data) => {
			if (data.type == "blue") {
				data.lock = "Blue";
				data.guaranteedTrap = true;
			}
		},
		"shadow": (e, data) => {
			if (data.type == "shadow" || data.type == "lessershadow") {
				data.lock = undefined;
				data.guaranteedTrap = true;
			}
		},
	},
	"addEntity": {
		"EnemyResist": (e, data) => {
			if (KinkyDungeonStatsChoice.get("EnemyResist") && KDGetFaction(data.enemy) != "Player") {
				data.type = JSON.parse(JSON.stringify(data.enemy.Enemy));
				data.type.maxhp *= KDEnemyResistHPMult;
				data.enemy.hp *= KDEnemyResistHPMult;
				data.enemy.Enemy = data.type;
			}
		},
		"ResilientFoes": (e, data) => {
			if (KinkyDungeonStatsChoice.get("ResilientFoes") && KDGetFaction(data.enemy) != "Player") {
				data.type = JSON.parse(JSON.stringify(data.enemy.Enemy));
				data.type.maxhp *= KDResilientHPMult;
				data.enemy.hp *= KDResilientHPMult;
				data.enemy.Enemy = data.type;
			}
		},
		"Stealthy": (e, data) => {
			if (KinkyDungeonStatsChoice.get("Stealthy") && KDGetFaction(data.enemy) != "Player") {
				data.type = JSON.parse(JSON.stringify(data.enemy.Enemy));
				data.type.maxhp *= KDStealthyHPMult;
				data.enemy.hp *= KDStealthyHPMult;
				data.enemy.Enemy = data.type;
			}
		},
	},
	"calcVision": {
		"ArchersEye": (e, data) => {
			if (KinkyDungeonStatsChoice.get("ArchersEye")) {
				data.max += 2;
			}
		},
		"Nearsighted": (e, data) => {
			if (KinkyDungeonStatsChoice.get("Nearsighted")) {
				data.max *= 0.5;
			}
		},
	},
	"vision": {
		"NightOwl": (e, data) => {
			if (KinkyDungeonStatsChoice.get("NightOwl")) {
				data.flags.nightVision *= 2.5;
			}
		},
		"Nearsighted": (e, data) => {
			if (KinkyDungeonStatsChoice.get("Nearsighted")) {
				data.flags.nightVision *= 0.7;
			}
		},
	},
	"calcHearing": {
		"KeenHearing": (e, data) => {
			if (KinkyDungeonStatsChoice.get("KeenHearing")) {
				data.hearingMult *= 2;
			}
		},
	},
	"afterNoise": {
		// Shockwave rendering code
		"shockwave": (e, data) => {
			if (data.particle) {
				if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
				KDEventData.shockwaves.push(data);
			}
		}
	},
	"afterDrawFrame": {
		// Shockwave rendering code
		"shockwave": (e, data) => {
			if (KDEventData.shockwaves) {
				if (KDToggles.ParticlesFX)
					for (let s of KDEventData.shockwaves) {
						KDAddShockwave((s.x - data.CamX + 0.5) * KinkyDungeonGridSizeDisplay, (s.y - data.CamY + 0.5) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay * (s.radius + 1) * 2, s.sprite);
					}
				KDEventData.shockwaves = [];
			}

		}
	},
};

/**
 *
 * @param {string} Event
 * @param {*} data
 */
function KinkyDungeonHandleGenericEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapGeneric, Event)) return;
	if (KDEventMapGeneric[Event] && KDEventMapGeneric[Event]) {
		for (let e of Object.keys(KDEventMapGeneric[Event]))
			KDEventMapGeneric[Event][e](e, data);
	}
}




function KDEventPrereq(e, item, tags) {
	if (tags) {
		if (!tags.length) {
			tags = [tags];
		}
		for (let t of tags) {
			if (t == "locked") {
				return item.lock;
			}
		}
	}
	return true;
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDIsHumanoid(enemy) {
	return (enemy?.player) || (enemy?.Enemy.bound && !enemy.Enemy.nonHumanoid);
}

/**
 * For spells that arent cast, like toggles and flame blade
 * @param {*} data
 * @param {*} notPassive
 * @param {*} notToggle
 */
function KDTriggerSpell(spell, data, notPassive, notToggle) {
	if (!data.spell) data.spell = spell;
	if (notPassive) data.notPassive = true;
	if (notToggle) data.notToggle = true;
	KinkyDungeonSendEvent("spellTrigger", data);
	KinkyDungeonSendEvent("afterSpellTrigger", data);

	if (spell && spell.school) KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "trigger_" + spell.school.toLowerCase(), 1);
	KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "trigger", 1);
	if (spell.tags) {
		for (let t of spell.tags) {
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "trigger_" + t, 1);
		}
	}
}

function KDAddArcaneEnergy(player, powerAdded) {
	let max = KinkyDungeonStatManaMax + KDEntityBuffedStat(player, "MaxArcaneEnergy");
	let buff = KDEntityGetBuff(player, "ArcaneEnergy");
	if (!buff) {
		powerAdded = Math.min(powerAdded, max);
		KinkyDungeonApplyBuffToEntity(player,
			{
				id: "ArcaneEnergy",
				type: "ArcaneEnergy",
				aura: "#8888ff",
				aurasprite: "Null",
				buffSprite: true,
				//buffSprite: true,
				power: powerAdded,
				duration: 9999,
				text: Math.round(10 * powerAdded),
			}
		);
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `+${Math.round(powerAdded*10)} ${TextGet("KDArcaneEnergy")}`, "#8888ff", 3);
	} else {
		let origPower = buff.power;
		buff.power += powerAdded;
		buff.power = Math.min(buff.power, max);
		buff.text = Math.round(10 * KDEntityBuffedStat(player, "ArcaneEnergy"));
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `+${Math.round((buff.power - origPower)*10)} ${TextGet("KDArcaneEnergy")}`, "#8888ff", 3);
	}

}

let KDHardModeReplace = {
	"WitchShock": "WitchMagnet",
	"WitchChain": "WitchMetal",
	"Drone": "CaptureBot",
	"CaptureBot": "Cyborg",
	"EnforcerBot": "BotMissile",
	"Alchemist": "Alkahestor",
	"WolfgirlPet": "WolfGuard",
	"WolfApprentice": "WolfOperative",
	"WolfTapeDrones": "WolfShieldDrone",
	"Bandit": "BanditHunter",
	"BanditHunter": "BanditGrappler",
	"BanditGrappler": "BanditChief",
	"SmallSlime": "SlimeAdv",
	"FastSlime": "LatexCube",
	"LatexCubeSmall": "LatexCubeMetal",
	"Dragon": "DragonShield",
	"DragonShield": "DragonLeader",
	"ElementalFire": "ElementalWater",
	"Pixie": "ElfRanger",
	"Statue": "StatueDart",
	"SoulCrystal": "SoulCrystalActive",
	"ShadowHand": "ShadowGhast",
	"ShadowGhast": "CorruptedAdventurer",
	"Gag": "AnimArmbinder",
	"Scarves": "MonsterRope",
	"RopeSnake": "ElementalRope",
	"LearnedRope": "ElementalLeather",
	"Apprentice": "WitchRope",
	"Apprentice2": "Conjurer",
	"HighWizard": "Fungal",
	"Dressmaker": "Librarian",
	"Cleric": "Mummy",
	"BlindZombie": "NawashiZombie",
	"FastZombie": "SamuraiZombie",
	"Ninja": "Nawashi",
	"Maidforce": "MaidforceStalker",
	"MaidforcePara": "MaidforceHead",
	"LesserSkeleton": "GreaterSkeleton",
	"Skeleton": "HeavySkeleton",
	"OldDrone": "OldTapeDrone",
};