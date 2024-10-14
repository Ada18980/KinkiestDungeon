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
	CurseHintTick: false,
	ActivationsThisTurn: 0,
	shockwaves: undefined,
};
let KDEventData = Object.assign({}, KDEventDataBase);

function KDMapHasEvent(map: Record<string, any>, event: string) {
	return map[event] != undefined;
}

function KinkyDungeonSendEvent(Event: string, data: any, forceSpell?: any) {
	KinkyDungeonSendMagicEvent(Event, data, forceSpell);
	KinkyDungeonSendWeaponEvent(Event, data);
	KinkyDungeonSendInventorySelectedEvent(Event, data);
	KinkyDungeonSendInventoryIconEvent(Event, data);
	KinkyDungeonSendInventoryEvent(Event, data);
	if (data.NPCRestraintEvents)
		KDSendNPCRestraintEvent(Event, data);
	KinkyDungeonSendBulletEvent(Event, data.bullet, data);
	KinkyDungeonSendBuffEvent(Event, data);
	KinkyDungeonSendOutfitEvent(Event, data);
	KinkyDungeonSendEnemyEvent(Event, data);
	KinkyDungeonHandleGenericEvent(Event, data);
	KinkyDungeonSendAltEvent(Event, data);
	KinkyDungeonSendFacilityEvent(Event, data);
}
/** Called during initialization */
function KinkyDungeonResetEventVariables() {
	KinkyDungeonHandleGenericEvent("resetEventVar", {});
}
/** Called every tick */
function KinkyDungeonResetEventVariablesTick(delta: number) {
	KDEventDataReset = {};
	KinkyDungeonAttackTwiceFlag = false;

	KinkyDungeonHandleGenericEvent("resetEventVarTick", {delta: delta});
}


/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 */
let KDEventMapInventoryIcon: Record<string, Record<string, (e: KinkyDungeonEvent, item: item, data: any) => void>> = {
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
 * @param Event
 * @param e
 * @param item
 * @param data
 */
function KinkyDungeonHandleInventoryIconEvent(Event: string, e: KinkyDungeonEvent, item: item, data: any) {
	if (Event === e.trigger && KDEventMapInventoryIcon[Event] && KDEventMapInventoryIcon[Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapInventoryIcon[Event][e.type](e, item, data);
	}
}

/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 */
let KDEventMapInventorySelected: Record<string, Record<string, (e: KinkyDungeonEvent, item: item, data: any) => void>> = {
	"inventoryTooltip": {
		"varModifier": (e, item, data) => {
			if (item == data.item) {
				data.extraLines.push(TextGet("KDVariableModifier_" + e.msg)
					.replace("AMNT", `${e.power >= 0 ? "+" : ""}${Math.round(e.power)}`)
					.replace("DMG", TextGet("KinkyDungeonDamageType" + e.damage))
					.replace("TYPE", `${e.kind}`));
				data.extraLineColor.push(KDBookText); // e.color || "#ffffff"
				let bg = e.bgcolor || "#000000";
				if (!KDToggles.SpellBook) {
					let col = DrawHexToRGB(bg);
					bg = `rgba(${col.r/2}, ${col.g/2}, ${col.b/2}, 0.5)`;
				}
				data.extraLineColorBG.push(bg);
			}
		},
		"conditionModifier": (e, item, data) => {
			if (item == data.item) {
				data.extraLines.push(TextGet("KDModifierCondition_" + e.msg)
					.replace("AMNT", `${e.power >= 0 ? "+" : ""}${Math.round(e.power)}`)
					.replace("DMG", TextGet("KinkyDungeonDamageType" + e.damage))
					.replace("TYPE", `${e.kind}`));
				data.extraLineColor.push(KDBookText); // e.color || "#ffffff"
				let bg = e.bgcolor || "#000000";
				if (!KDToggles.SpellBook) {
					let col = DrawHexToRGB(bg);
					bg = `rgba(${col.r/2}, ${col.g/2}, ${col.b/2}, 0.5)`;
				}
				data.extraLineColorBG.push(bg);
			}
		},
		"effectModifier": (e, item, data) => {
			if (item == data.item) {
				data.extraLines.push(TextGet("KDModifierEffect_" + e.msg)
					.replace("AMNT", `${e.power >= 0 ? "+" : ""}${Math.round(e.power)}`)
					.replace("DRTN", `${Math.round(e.duration)}`)
					.replace("DMG", TextGet("KinkyDungeonDamageType" + e.damage))
					.replace("TYPE", `${e.kind}`));
				data.extraLineColor.push(KDBookText); // e.color || "#ffffff"
				let bg = e.bgcolor || "#000000";
				if (!KDToggles.SpellBook) {
					let col = DrawHexToRGB(bg);
					bg = `rgba(${col.r/2}, ${col.g/2}, ${col.b/2}, 0.5)`;
				}
				data.extraLineColorBG.push(bg);
			}
		},
	},
};

/**
 * @param Event
 * @param kinkyDungeonEvent
 * @param item
 * @param data
 */
function KinkyDungeonHandleInventorySelectedEvent(Event: string, kinkyDungeonEvent: KinkyDungeonEvent, item: item, data: any) {
	if (Event === kinkyDungeonEvent.trigger && KDEventMapInventorySelected[Event] && KDEventMapInventorySelected[Event][kinkyDungeonEvent.type]) {
		KDEventMapInventorySelected[Event][kinkyDungeonEvent.type](kinkyDungeonEvent, item, data);
	}
}

// Brief explanation of dynamic events: Normally, events need to be declared for every case.
// However sometimes you want multiple events to do something generic without respect to the action.
// In this case, you can mark the event as dynamic.
// Dynamic events only have to be declared under the .dynamic object of the event map

/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 */
let KDEventMapInventory: Record<string, Record<string, (e: KinkyDungeonEvent, item: item, data: any) => void>> = {
	"dynamic": {
		"wardenPunish": (_e, item, _data) => {
			let restraintAdd = KinkyDungeonGetRestraint({tags: ["wardenLink"]}, KDGetEffLevel(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				true, "Purple", undefined, undefined, undefined, undefined, undefined, {
					allowedGroups: [KDRestraint(item)?.Group],
				});
			if (restraintAdd) {
				KDPlayerEffectRestrain(undefined, 1, ["wardenLink"], item.faction, false, true, false, false);
			}
		},
		"BuffSelf": (e, item, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data)) {
				let b = {
					id: (e.kind || item.name) + e.buffType,
					type: e.buffType,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: e.time,
				};
				if (e.desc) {
					b['aura'] = e.color || "#ffffff";
					b['esc'] = e.desc;

				}
				if (e.buffSprite != undefined) {
					if (e.buffSprite) {
						b['buffSpriteSpecific'] = e.buffSprite;
					}
					b['buffSprite'] = true;
				}
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, b);
			}
		},
	},
	"beforeEnemyLoop": {
		AntiMagicEnemyDebuff: (e, _item, data) => {
			if (data.Wornitems.includes(_item.id))
				KinkyDungeonApplyBuffToEntity(data.enemy, KDAntiMagicMiscast, {});
		}
	},
	"afterShrineBottle": {},
	"afterShrineDrink": {},
	"spellOrb": {},
	"afterFailGoddessQuest": {},
	"curseCount": {
		"add": (e, item, data: KDEventData_CurseCount) => {
			if (!data.activatedOnly || (KDGetCurse(item) && KDCurses[KDGetCurse(item)].activatecurse)) {
				data.count += e.power;
			}
		}
	},
	"beforeCast": {
		"ReduceMiscastVerbal": (e, _item, data) => {
			if (data.spell) {
				let spell: spell = data.spell;
				if (spell.components?.includes("Verbal")) {
					data.flags.miscastChance -= e.power;
				}
			}
		}
	},
	"postApply": {
		"ControlHarness": (e, item, data: KDEventData_PostApply) => {
			let itemAdded = data.item;
			if (!itemAdded) return;
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
						if (restMap.size == category.activateCount && KDEventData.ActivationsThisTurn < 100) {
							// ACTIVATE
							category.activateFunction(e, item, data, [...restMap.keys()]);
							KDEventData.ActivationsThisTurn = (KDEventData.ActivationsThisTurn || 0) + 1;
						}
					}
				}
			}
		},
		"BubbleCombine": (_e, item, _data: KDEventData_PostApply) => {
			KinkyDungeonUpdateRestraints();
			if ((KinkyDungeonPlayerTags.get("CombineBubble1") || KDRestraint(item)?.shrine?.includes("CombineBubble1"))
				&& (KinkyDungeonPlayerTags.get("CombineBubble2") || KDRestraint(item)?.shrine?.includes("CombineBubble2"))
				&& (KinkyDungeonPlayerTags.get("CombineBubble3") || KDRestraint(item)?.shrine?.includes("CombineBubble3"))) {
				for (let inv of KinkyDungeonAllRestraintDynamic()) {
					let restraint = KDRestraint(inv.item);
					if (restraint) {
						if (restraint.shrine?.includes("CombineBubble1")
								|| restraint.shrine?.includes("CombineBubble2")
								|| restraint.shrine?.includes("CombineBubble3")) {
							KinkyDungeonRemoveRestraintSpecific(inv.item, true, false, true);
						}
					}
				}
				KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("Bubble"), 10, true, "", true);
				KinkyDungeonSendTextMessage(7, TextGet("KDBubbleCombine"), "#4477ee", 4);
			}
		},

		"NoYoke": (_e, item, data) => {
			if (item == data.item && KinkyDungeonPlayerTags.get("Yoked"))
				KinkyDungeonRemoveRestraintSpecific(item, true, false);
		},
		"requireNoGags": (_e, item, data) => {
			if (item != data.item && KinkyDungeonPlayerTags.get("Gags")) {
				KinkyDungeonRemoveRestraintSpecific(item, true, false);
				KinkyDungeonSendTextMessage(4, TextGet("KDGagNecklaceOff"), "#ffffff", 4);
			}
		},
		"EngageCurse": (_e, item, data) => {
			if (item == data.item)
				KinkyDungeonSendEvent("EngageCurse", {});
		},
		"cursePrefix": (_e, item, data) => {
			if (item == data.item) {
				let variant = KinkyDungeonRestraintVariants[item.inventoryVariant || item.name];
				if (variant) {
					if (!variant.suffix)
						variant.suffix = "Cursed";
					else if (!variant.prefix)
						variant.prefix = "Cursed";
				}
			}
		},
	},
	"calcOrgThresh": {
		"CurseSensitivity": (e, _item, data) => {
			if (data.player == KinkyDungeonPlayerEntity) {
				data.threshold *= e.power;
			}
		}
	},
	"afterCalcManaPool": {
		"MultManaPoolRegen": (e, _item, data) => {
			data.manaPoolRegen *= e.power;
		},
	},
	"calcEfficientMana": {
		"ManaCost": (e, _item, data) => {
			data.efficiency += e.power;
		},
	},
	"calcMultMana": {
		"ManaCost": (e, _item, data) => {
			data.cost = Math.max(data.cost * e.power, 0);
		},
	},
	"edge": {
		"CursedDenial": (e, _item, _data) => {
			KinkyDungeonSendTextMessage(5, TextGet("KDCursedDenialDeny" + Math.floor(KDRandom() * e.count)), "#9074ab", 10);
		},
		"IncrementRemovalVar": (e, item, data) => {
			if (data.delta > 0 && KDIsEdged(KinkyDungeonPlayerEntity)) {
				// Increase damage count
				let count = KDItemDataQuery(item, e.kind) || 0;
				count = Math.max(0, count + e.power);
				KDItemDataSet(item, e.kind, count);
				// Evaluate damage count
				if (!e.count || count >= e.count) {
					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonLock(item, "");
					KinkyDungeonSendTextMessage(5, TextGet(e.msg).replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				} else {
					KinkyDungeonSendTextMessage(5, TextGet(e.msg + "Partial").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				}
			}
		},
	},
	"orgasm": {
		"IncrementRemovalVar": (e, item, data) => {
			if (data.delta > 0 && KDIsEdged(KinkyDungeonPlayerEntity)) {
				// Increase damage count
				let count = KDItemDataQuery(item, e.kind) || 0;
				count = Math.max(0, count + e.power);
				KDItemDataSet(item, e.kind, count);
				// Evaluate damage count
				if (!e.count || count >= e.count) {
					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonLock(item, "");
					KinkyDungeonSendTextMessage(5, TextGet(e.msg).replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				} else {

					KinkyDungeonSendTextMessage(5, TextGet(e.msg + "Partial").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				}
			}
		},


		"RobeOfChastity": (e, item, _data) => {
			let player = !(item.onEntity > 0) ? KDPlayer() : KinkyDungeonFindID(item.onEntity);
			if (player) {
				if (player.player && KDRandom() < 0.1)
					KinkyDungeonSendTextMessage(5, TextGet("KDRobeOfChastityFail" + Math.floor(KDRandom() * e.count)),
						"#ffff00", 10);
				KDSetIDFlag(player.id, "disableRobeChast", e.time);
			}
		},
		"CursedDenial": (e, _item, _data) => {
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
	"afterCapture": {
		"SacrificeMage": (e, item, data) => {
			if (data.enemy && data.enemy.Enemy?.tags?.mage) {
				let value = Math.max(1, Math.max(1, KDEnemyRank(data.enemy)) * (data.enemy.Enemy.unlockCommandLevel || 1));
				// Increase damage count
				let count = KDItemDataQuery(item, e.kind) || 0;
				count = count + Math.max((value * (e.mult || 1)) || 1, 1);
				KDItemDataSet(item, e.kind, count);
				// Evaluate damage count
				if (!e.count || count >= e.count) {
					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonLock(item, "");
					KinkyDungeonSendTextMessage(5, TextGet("KDRemoveSacrificeMage").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDRemoveSacrificeMagePartial").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				}
			}
		},
	},
	"capture": {
		"ManaBounty": (e, _item, data) => {
			if (data.attacker && data.attacker.player && data.enemy) {
				KinkyDungeonChangeMana(0, false, e.power);
			}
		},

	},
	"calcPlayChance": {
		"CurseAttraction": (e, _item, data) => {
			if (data.enemy) {
				data.playChance += e.power;
				if (!data.enemy.playWithPlayer && data.enemy.playWithPlayerCD > 5) {
					data.enemy.playWithPlayerCD = 5;
				}
			}
		}
	},
	"changeDistraction": {
		"multDistractionPos": (e, _item, data) => {
			if (data.Amount > 0)
				data.Amount *= e.power;
		},
	},
	"changeWill": {
		"multWillPos": (e, _item, data) => {
			if (data.Amount > 0)
				data.Amount *= e.power;
		},
	},
	"changeStamina": {
		"multStaminaPos": (e, _item, data) => {
			if (data.Cap > 0 && data.regen)
				data.Cap *= e.power;
		},
	},
	"getLights": {
		"ItemLight": (e, _item, data) => {
			if (!e.prereq || KDCheckPrereq(undefined, e.prereq, e, data))
				data.lights.push({brightness: e.power, x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y,
					color: string2hex(e.color || "#ffffff")});
		},
	},
	"onWear": {
		"setSkinColor": (_e, item, data) => {
			if (item == data.item) {
				// Ne
			}
		}
	},
	"afterDress": {
		"PrisonerJacket": (_e, item, _data) => {
			if (!StandalonePatched)
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
		"MikoGhost": (e, _item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (data.enemy && data.enemy.lifetime == undefined && data.enemy.playerdmg && !data.enemy.Enemy.tags.ghost && !data.enemy.Enemy.tags.construct) {
					KinkyDungeonSummonEnemy(data.enemy.x, data.enemy.y, "MikoGhost", 1, 1.5, true);
					KinkyDungeonSendTextMessage(5, TextGet("KDMikoCollarSummmon"), "purple", 2);
				}
			}
		},
		"MikoGhost2": (e, _item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (data.enemy && data.enemy.lifetime == undefined && data.enemy.playerdmg && !data.enemy.Enemy.tags.ghost && !data.enemy.Enemy.tags.construct) {
					KinkyDungeonSummonEnemy(data.enemy.x, data.enemy.y, "MikoGhost", 1, 1.5, true, 40, false, false, "Player");
					KinkyDungeonSendTextMessage(5, TextGet("KDMikoCollarSummmon2"), "purple", 2);
				}
			}
		},
		"DollmakerMask": (_e, _item, data) => {
			// if (item.player == data.player)
			if (data.enemy?.Enemy.tags.escapeddoll) KinkyDungeonSetFlag("DollmakerGrace", 70);
		},
		"CursedPunishment": (e, _item, data) => {
			if (data.enemy && data.enemy.lifetime == undefined && data.enemy.playerdmg && data.enemy.Enemy.bound && !data.enemy.Enemy.nonHumanoid) {
				KDStunTurns(e.time, false);
				KinkyDungeonSendTextMessage(8, TextGet("KDCursedPunishment"), "#9074ab", e.time);
				KinkyDungeonMakeNoise(e.dist, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			}
		},
	},
	"drawBuffIcons": {
		"curseInfo": (e, item, data) => {
			if (KDToggleShowAllBuffs) {
				let curse = KDGetCurse(item);
				let pre = "[" + TextGet("Restraint" + item.name) + "] ";
				if (curse && (e.always || KDCurses[curse].activatecurse) && (!e.prereq || KDCheckPrereq(undefined, e.prereq, e, data))) {
					data.stats[curse + ',' +item.name] = {
						text: pre + TextGet("curseInfo" + e.msg),
						count: "",
						icon: e.buffSprite || ("curse/" + (KDCurses[curse]?.customIcon_hud || "Curse")),
						category: "curse",
						color: e.color, bgcolor: "#333333",
						priority: e.power || 10,
					};
				}
			}
		},
	},
	"drawSGTooltip": {
		"curseInfo": (e, item, data) => {
			if (item == data.item || KDRestraint(item)?.Group == data.group) {
				let curse = KDGetCurse(item);
				let pre = "[" + TextGet("Restraint" + item.name) + "] ";
				if (curse && (e.always || KDCurses[curse].activatecurse) && (!e.prereq || KDCheckPrereq(undefined, e.prereq, e, data))) {
					data.extraLines.push(pre + TextGet("curseInfo" + e.msg));
				} else {
					data.extraLines.push(pre + TextGet("curseInfoDormant"));
				}
				data.extraLineColor.push(e.color);
			}
		},
		"simpleMsg": (e, item, data) => {
			if (item == data.item || KDRestraint(item)?.Group == data.group) {
				data.extraLines.push(TextGet(e.msg));
				data.extraLineColor.push(e.color);
			}
		},
		"StruggleManaBonus": (e, item, data) => {
			if (item == data.item) {
				let bonus = KDGetManaBonus(e.mult, e.power, e.threshold, e.threshold, e.threshold);

				data.extraLines.push(TextGet("KDMana" + (bonus >= 0 ? "Bonus" : "Penalty")) + Math.round(100 * bonus) + "%");
				data.extraLineColor.push("#99aaff");
			}
		},

	},
	"perksBonus": {
		"spellDamage": (e, _item, _data) => {
			KDDamageAmpPerksSpell += e.power;
		},
	},
	"calcBlind": {
		"DollmakerMask": (_e, _item, data) => {
			if (!KinkyDungeonFlags.get("DollmakerGrace")) {
				// if item.player == data.player
				data.blindness = Math.max(data.blindness, 5);
				KinkyDungeonSendTextMessage(2, TextGet("KDDollmakerMaskDim"), "#ff5555", 2, true);
			}
		},
	},

	"draw": {
		"DollmakerMask": (_e, _item, data) => {
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
		"shatter": (e, item, data) => {
			if ((KinkyDungeonShatterDamageTypes.includes(KDDamageEquivalencies[data.type] || data.type) || KinkyDungeonDismantleDamageTypes.includes(KDDamageEquivalencies[data.type] || data.type)) && data.dmg > 0) {
				let alreadyDone = KDItemDataQuery(item, "shatter") || 0;
				if (alreadyDone < e.count) {
					alreadyDone += (KinkyDungeonShatterDamageTypes.includes(KDDamageEquivalencies[data.type] || data.type) ? e.mult : (e.mult*0.1)) * data.dmg;
					KDItemDataSet(item, "shatter", alreadyDone);
					KinkyDungeonSendTextMessage(4, TextGet("KDShatterProgress").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				} else {
					KDRemoveThisItem(item);
					KinkyDungeonSendTextMessage(4, TextGet("KDShatter").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},
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
		"moduleDamage": (e, item, data) => {
			if (['acid'].includes(KDDamageEquivalencies[data.type] || data.type) && data.dmg > 0) {
				let alreadyDone = KDItemDataQuery(item, "moduleDamage") || 0;
				if (alreadyDone < e.count) {
					alreadyDone += e.mult * data.dmg;
					KDItemDataSet(item, "moduleDamage", alreadyDone);
					KinkyDungeonSendTextMessage(4, TextGet("KDDamageModuleProgress").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				} else {
					KDRemoveThisItem(item);
					KinkyDungeonSendTextMessage(4, TextGet("KDDamageModule").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},
		"tetherDamage": (e, item, data) => {
			if (['electric'].includes(KDDamageEquivalencies[data.type] || data.type) && data.dmg > (e.subMult || 0)) {
				let alreadyDone = KDItemDataQuery(item, "tetherDamage") || 0;
				if (alreadyDone < e.count) {
					alreadyDone += e.mult * (data.dmg - (e.subMult || 0));
					KDItemDataSet(item, "tetherDamage", alreadyDone);
					KinkyDungeonSendTextMessage(4, TextGet("KDDamageTetherProgress").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				} else {
					KDCreateEffectTile(KDPlayer().x, KDPlayer().y, {
						name: "Sparks",
						duration: 2,
					}, 2);
					KDRemoveThisItem(item);
					KinkyDungeonSendTextMessage(4, TextGet("KDDamageTether").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},

		"bubblePop": (e, item, data) => {
			if (['pierce'].includes(KDDamageEquivalencies[data.type] || data.type) && data.dmg > 0) {
				let alreadyDone = KDItemDataQuery(item, "popDamage") || 0;
				if (alreadyDone < e.count) {
					alreadyDone += e.mult * data.dmg;
					KDItemDataSet(item, "popDamage", alreadyDone);
					KinkyDungeonMakeNoise(14, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
					KinkyDungeonSendTextMessage(4, TextGet("KDDamageBubbleProgress").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				} else {
					KDRemoveThisItem(item);
					KinkyDungeonSendTextMessage(4, TextGet("KDDamageBubble").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},


		"cursedDamage": (e, item, data) => {
			if (data.dmg > 0 && !["cold", "soul", "charm"].includes(data.type) && !data.flags?.includes("EnvDamage") && KinkyDungeonStatWill > 0) {
				let alreadyDone: number = KDItemDataQuery(item, "cursedDamage") || 0;
				let count = KDItemDataQuery(item, "cursedDamageHP") || Math.round(e.power + KDRandom() * e.limit);
				KDItemDataSet(item, "cursedDamageHP", count);
				let amt = e.mult * data.dmg;
				if (KinkyDungeonStatWill < 1) amt *= 1 * KinkyDungeonStatWill;
				if (alreadyDone + amt < count) {
					alreadyDone += amt;
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
					if (item.curse && KDCurses[item.curse]) {
						KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
					}

					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonCurseUnlockCursedDamage").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
				}
			}
		},
		"CursedDistract": (e, _item, data) => {
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
				KDUpdateItemEventCache = true;
				// In this first section we get the various lists
				let listname = e.cursetype || KDRestraint(data.curseditem)?.name || "Common";
				if (data.noDupe) {
					// TODO make it so no curses are duped
				}
				let selection = KDGetByWeight(KinkyDungeonGetHexByListWeighted(data.hexlist || listname, KDRestraint(item).name, false, data.hexlevelmin || 0, data.hexlevelmax || 10));
				let curse = KDGetByWeight(KinkyDungeonGetCurseByListWeighted([data.curselist || listname], KDRestraint(item).name, false, 0, 1000));

				// Load the current inventory variant
				let newvariant: KDRestraintVariant = JSON.parse(JSON.stringify(KinkyDungeonRestraintVariants[item.inventoryVariant || item.name] || {}));
				/**  New restraint to transform to  */
				let newRestraint: restraint = null;
				if (data.newRestraintTags) {
					newRestraint = KinkyDungeonGetRestraint({tags: [...data.newRestraintTags],},
						KDGetEffLevel(),
						(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "",
						false, false, false, undefined, undefined, {
							allowedGroups: [KDRestraint(item).Group],
						}, undefined,
						curse || "");
				}
				KDUpdateItemEventCache = true;
				// Add the new curse
				if (newRestraint) {
					newvariant.template = newRestraint.name;
				}
				newvariant.events = [...(newvariant.events || [])];
				// Trim off the transformation...
				if (!data.trimTrigger)
					newvariant.events = newvariant.events.filter((event) => {return event.trigger != "CurseTransform";});
				newvariant.events = [...newvariant.events, ...KDEventHexModular[selection].events({variant: newvariant})];
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
				KDUpdateItemEventCache = true;
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
		"InvisibleGhosts": (_e, _item, _data) => {
			for (let entity of KDMapData.Entities) {
				if (entity.Enemy?.tags?.ghost) {
					KinkyDungeonSetEnemyFlag(entity, "hidden", 2);
				}
			}
		},



		"ShrineUnlockWiggle": (e, item, _data) => {
			if (item && KDCurses[e.kind].condition(item)) {
				KinkyDungeonSendTextMessage(1, TextGet("KDShrineUnlockWiggle").replace("RSTRNT", KDGetItemName(item)), "#88ff88", 1, false, true);
				//KinkyDungeonSetFlag("CurseHintTick", 1 + Math.round(KDRandom() * 4));
				//KDEventData.CurseHintTick = true;
				let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
				item.curse = undefined;
				if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
					KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
				}
				KinkyDungeonLock(item, "");
			}
		},
		"RemoveOnEdge": (e, item, data) => {
			if (data.delta > 0 && KDIsEdged(KinkyDungeonPlayerEntity)) {
				// Increase damage count
				let count = KDItemDataQuery(item, e.kind) || 0;
				count = Math.max(0, count + e.power);
				KDItemDataSet(item, e.kind, count);
				// Evaluate damage count
				if (!e.count || count >= e.count) {
					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonLock(item, "");
					KinkyDungeonSendTextMessage(5, TextGet(e.msg).replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				} else if ((!KinkyDungeonFlags.get("CurseHintTick") || KDEventData.CurseHintTick)) {
					KDEventData.CurseHintTick = true;
					KinkyDungeonSetFlag("CurseHintTick", 1 + Math.round(KDRandom() * 4));
					KinkyDungeonSendTextMessage(5, TextGet(e.msg + "Partial").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				}
			}
		},
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
						duration: 9999, infinite: true,
						text: "-1%",
						events: [
							{trigger: "tick", type: "Corrupted", power: 0.01},
						],
					});
					buff2 = KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "Corrupted2",
						type: "StrugglePower",
						power: -0.01,
						duration: 9999, infinite: true,
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

		"wardenMelt": (e, item, _data) => {
			let alreadyDone = KDItemDataQuery(item, "wardenMelt") || 0;
			if (alreadyDone < e.count) {
				alreadyDone += e.power;
				KDItemDataSet(item, "wardenMelt", alreadyDone);
			} else {
				KDRemoveThisItem(item);
				KinkyDungeonSendTextMessage(4, TextGet("KDWardenMelt").replace("RestraintName", TextGet("Restraint"+item.name)), "#88ff88", 2);
			}
		},
		"iceMelt": (e, item, _data) => {
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
		"tetherRegen": (e, item, _data) => {
			let alreadyDone = KDItemDataQuery(item, "tetherDamage") || 0;
			if (alreadyDone > e.count) {
				alreadyDone = Math.max(0, alreadyDone - e.power);
				KDItemDataSet(item, "tetherDamage", alreadyDone);
			}
		},
		"AntiMagicGag": (e, item, _data) => {
			let alreadyDone = KDItemDataQuery(item, "manaDrained") || 0;
			let multiplier = KDItemDataQuery(item, "manaDrainMultiplier");
			if (!multiplier) {
				// Later gags are more powerful
				multiplier = (0.2 + 0.8 * (KDGetEffLevel() / (KinkyDungeonMaxLevel - 1)));
				KDItemDataSet(item, "manaDrainMultiplier", multiplier);
			}
			if (alreadyDone < e.count * multiplier) {
				if (KinkyDungeonStatMana + KinkyDungeonStatManaPool > 0) {
					alreadyDone += Math.min(KinkyDungeonStatMana + KinkyDungeonStatManaPool, e.power);
					KinkyDungeonChangeMana(-e.power);
					KDItemDataSet(item, "manaDrained", alreadyDone);
				}
			} else {
				KinkyDungeonChangeMana(-e.power * multiplier * (e.mult || 0));
			}
			// else {KDChangeItemName(item, item.type, "MagicGag2");}
		},
		"DollmakerMask": (_e, _item, _data) => {
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
		"RemoveOnBuffName": (e, item, _data) => {
			if (KinkyDungeonPlayerBuffs[e.kind] && (!e.chance || KDRandom() < e.chance)) {
				let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
				item.curse = undefined;
				if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
					KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
				}
				KinkyDungeonLock(item, "");
				KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgType").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
			}
		},
		"armorBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Armor", type: "Armor", power: e.power, duration: 2,});
		},
		"spellWardBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "SpellResist", type: "SpellResist", power: e.power, duration: 2,});
		},
		"sneakBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Sneak", type: "SlowDetection", power: e.power, duration: 2,});
		},
		"evasionBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Evasion", type: "Evasion", power: e.power, duration: 2,});
		},
		"blockBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Block", type: "Block", power: e.power, duration: 2,});
		},
		"buff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + e.buff, type: e.buff, power: e.power, duration: 2,
				tags: e.tags,
				currentCount: e.mult ? -1 : undefined,
				maxCount: e.mult,});
		},
		"RestraintBlock": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.original || "") + item.name + "Block", type: "RestraintBlock", power: e.power, duration: 2,});
		},
		"ShadowHandTether": (e, item, _data) => {
			let player = KDPlayer();
			let enemy = (player.leash?.x && player.leash?.y) ? KinkyDungeonEnemyAt(player.leash.x, player.leash.y) : undefined;
			if (KinkyDungeonFlags.get("ShadowDommed") || (KDGameData.KinkyDungeonLeashedPlayer > 0 && KinkyDungeonLeashingEnemy() && enemy != KinkyDungeonLeashingEnemy())) {
				return;
			} else {
				if (player.leash?.x && player.leash?.y && player.leash.restraintID == item.id && player.leash.reason == "ShadowTether" && (!enemy || (e.requiredTag && !enemy.Enemy.tags[e.requiredTag]))) {
					KDBreakTether(player);
				} else {
					// The shadow hands will link to a nearby enemy if possible
					for (enemy of KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, e.dist)) {
						if (!e.requiredTag || enemy.Enemy.tags[e.requiredTag]) {
							KinkyDungeonAttachTetherToEntity(KDRestraint(item).tether || 1.5, enemy, player, "ShadowTether", "#a02fcc", 3, item);
						}
					}
				}
			}
		},
		"Buff": (e, item, _data) => {
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
		"AccuracyBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "Accuracy",
				duration: 1,
				power: e.power
			});
		},
		"spellRange": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "spellRange",
				duration: 1,
				power: e.power
			});
		},
		"SneakBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "Sneak",
				duration: 1,
				power: e.power
			});
		},
		"EvasionBuff": (e, item, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + item.name + e.type + e.trigger,
				type: "Evasion",
				duration: 1,
				power: e.power
			});
		},
		"AllyHealingAura": (e, _item, data) => {
			if (!data.delta) return;
			let healed = false;
			for (let enemy of KDMapData.Entities) {
				if (KDAllied(enemy)
					&& (enemy.hp > 0 || KDHelpless(enemy))
					&& KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					let origHP = enemy.hp;
					enemy.hp = Math.min(enemy.hp + e.power, enemy.Enemy.maxhp);
					if (enemy.hp - origHP > 0) {
						KinkyDungeonSendFloater(enemy, `+${Math.round((enemy.hp - origHP) * 10)}`, "#44ff77", KDToggles.FastFloaters ? 1 : 3);
						healed = true;
					}
				}
			}
			if (healed) {
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);//KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"EnchantedAnkleCuffs2": (_e, item, _data) => {
			KinkyDungeonRemoveRestraint(KDRestraint(item).Group);
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("EnchantedAnkleCuffs"), 0, true, undefined, false, undefined, undefined, item.faction, true);
		},
		"EnchantedAnkleCuffs": (_e, item, _data) => {
			if (KDGameData.AncientEnergyLevel <= 0.0000001) {
				KinkyDungeonRemoveRestraint(KDRestraint(item).Group);
				KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("EnchantedAnkleCuffs2"), 0, true, undefined, false, undefined, undefined, item.faction, true);
			}
		},
		"RegenMana": (e, _item, _data) => {
			if (!e.limit || KinkyDungeonStatMana / KinkyDungeonStatManaMax < e.limit) {
				if (e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);//KinkyDungeonChangeCharge(- e.energyCost);
				KinkyDungeonChangeMana(e.power);
			}
		},
		"RegenStamina": (e, _item, _data) => {
			if (!e.limit || KinkyDungeonStatStamina / KinkyDungeonStatStaminaMax < e.limit) {
				if (e.energyCost && KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);//KinkyDungeonChangeCharge(- e.energyCost);
				KinkyDungeonChangeStamina(e.power);
			}
		},
		"ApplySlowLevelBuff": (e, item, _data) => {
			if (item.type === Restraint) {
				if (KinkyDungeonPlayerBuffs[item.name + e.type + e.trigger]) delete KinkyDungeonPlayerBuffs[item.name + e.type + e.trigger];
				KinkyDungeonCalculateSlowLevel(0);
				if (KinkyDungeonSlowLevel > 0) {
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
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
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonAlertEnemies").replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"iceDrain": (e, _item, data) => {
			if (!data.delta) return;
			if (e.power) {
				KinkyDungeonChangeMana(e.power);
				KinkyDungeonChangeStamina(e.power);
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonIceDrain"), "lightblue", 2, true);
			}
		},
		"crystalDrain": (e, _item, data) => {
			if (!data.delta) return;
			if (e.power) {
				KinkyDungeonChangeMana(e.power);
				KinkyDungeonChangeDistraction(-e.power * KDBuffResist(KinkyDungeonPlayerBuffs, "soul"), false, 0.1);
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrystalDrain"), "lightblue", 2, true);
			}
		},
		"shadowDrain": (e, _item, data) => {
			if (!data.delta) return;
			if (e.power) {
				KinkyDungeonChangeMana(e.power);
				//KinkyDungeonChangeDistraction(-e.power * 3 * KDBuffResist(KinkyDungeonPlayerBuffs, "soul"), false, 0.1);
				KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonShadowDrain"), "lightblue", 2, true);
			}
		},
		"tickleDrain": (e, _item, data) => {
			if (!data.delta) return;
			if (KinkyDungeonFlags.get("tickleDrain")) return;
			if (e.power) {
				KinkyDungeonSetFlag("tickleDrain", 3 + Math.floor(KDRandom() * 4));
				KinkyDungeonChangeDistraction(-e.power * KDBuffResist(KinkyDungeonPlayerBuffs, "tickle"), false, 0.01);
				KinkyDungeonSendTextMessage(0.5, TextGet("KinkyDungeonTickleDrain"), "lightblue", 2, true);
			}
		},
		"barrelDebuff": (_e, _item, data) => {
			if (!data.delta) return;
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Counterbarrel", type: "SlowDetection", duration: 1, power: -10, player: true, enemies: true, endSleep: true, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Counterbarrel3", type: "Sneak", duration: 1, power: -10, player: true, enemies: true, endSleep: true, tags: ["Sneak", "move", "cast"]});
		},
		"cageDebuff": (_e, _item, data) => {
			if (!data.delta) return;
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Countercage", type: "SlowDetection", duration: 1, power: -5, player: true, enemies: true, endSleep: true, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Countercage2", type: "Sneak", duration: 1, power: -10, player: true, enemies: true, endSleep: true, tags: ["Sneak", "move", "cast"]});
		},
		"callGuard": (_e, _item, data) => {
			if (!data.delta) return;
			if (KinkyDungeonFlags.get("SuppressGuardCall")) return;
			if (!KinkyDungeonFlags.has("GuardCalled") && KDRandom() < 0.25) {
				KinkyDungeonSetFlag("GuardCalled", 35);
				console.log("Attempting to call guard");
				if (KDMapData.Entities.length < 400) {
					console.log("Called guard");
					KinkyDungeonCallGuard(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, true);
				}
			}
		},
		"callGuardFurniture": (e, _item, data) => {
			if (!data.delta) return;
			if (KinkyDungeonFlags.get("SuppressGuardCall")) return;
			if (!KinkyDungeonFlags.get("GuardCallBlock")) {
				KinkyDungeonSetFlag("GuardCallBlock", 80);
				if (!KinkyDungeonFlags.get("GuardCalled")) {
					KinkyDungeonSetFlag("GuardCalled", -1);
				} else {
					KinkyDungeonSendTextMessage(11, TextGet("KDCallForHelpHint"), "#ffffff", 35, true);
				}
			}
			if (!KinkyDungeonFlags.has("GuardCalled") && KDRandom() < (e.chance ? e.chance : 0.05)) {
				KinkyDungeonSetFlag("GuardCalled", e.time || 45);
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
							ee.path = undefined;
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

				if (!guard.IntentAction) {
					guard.IntentAction = 'freeFurniture';
					guard.playWithPlayer = 12;
				}
			}
		},
		"slimeSpread": (e, _item, data) => {
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
		},
		"livingRestraints": (e, item, data) => {
			if (data.delta <= 0) return;
			let timer = KDItemDataQuery(item, "livingTimer") || 0;
			let freq = KDItemDataQuery(item, "livingFreq") || e.frequencyMax;
			if (KDEntityBuffedStat(KDPlayer(), "Disenchant") > 0) {
				let val = Math.round(KDEntityBuffedStat(KDPlayer(), "Disenchant") * 20);
				if (timer > -val + 3) {
					KinkyDungeonSendTextMessage(8, TextGet("KDLivingCollarSuspendDisenchant").replace(
						"AMNT", "" + val
					), "#88ff88", 8);
					KDItemDataSet(item, "livingTimer", -val);
				}
				return;
			}
			if (timer < freq) {
				timer = timer + 1;
				KDItemDataSet(item, "livingTimer", timer);
				return;
			}
			KDItemDataSet(item, "livingTimer", 0);

			let newtags = [];
			if (!KDRestraint(item).cloneTag) {
				newtags = e.tags;
			} else {
				newtags.push(KDRestraint(item).cloneTag);
				for (let tag in e.cloneTags) {
					newtags.push(KDRestraint(item).cloneTag + tag);
				}
			}

			let r = KinkyDungeonGetRestraint({tags: newtags}, 24, "grv", true, undefined);
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint, true, undefined, false, undefined, undefined, item.faction || e.kind, true);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonLivingSpread").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)).replace("+RestraintAdded", TextGet("Restraint" + r.name)), "lightblue", 2);
			}

			//Spread accelerates as you get more of that type
			let frequency = e.frequencyMax;

			for (let inv of KinkyDungeonAllRestraintDynamic()) {
				let found = false;
				for (let tag of newtags) {
					if (KDRestraint(inv.item).enemyTags[tag] != undefined) {
						found = true;
						break;
					}
				}
				if (found) {
					frequency *= e.frequencyStep;
				}
			}
			frequency = Math.floor(frequency);

			if (frequency < e.frequencyMin)
				frequency = e.frequencyMin;

			if (!r) {
				frequency = 100;
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonLivingDormant").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightblue", 2);
			}
			KDItemDataSet(item, "livingFreq", frequency);

		},
		"ApplyConduction": (e, _item, _data) => {
			let bb = Object.assign({}, KDConduction);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
		},
	},
	"tickAfter": {
		"RobeOfChastity": (e, item, _data) => {
			let player = !(item.onEntity > 0) ? KDPlayer() : KinkyDungeonFindID(item.onEntity);
			if (player && !KDIDHasFlag(player.id, "disableRobeChast")) {
				let nearbyTargets = KDNearbyEnemies(player.x, player.y, e.dist).filter(
					(en) => {
						return (KDistChebyshev(player.x - en.x, player.y - en.y) < 1.5
							|| KDIDHasFlag(en.id, "RoCflag"))
						&& !KDHelpless(en)
						&& en.hp > 0
						&& !en.Enemy?.tags.nobrain // only affects things that can behold it
						&& KDHostile(en, player.player ? undefined : player);
					}
				);
				for (let en of nearbyTargets) {
					KDCreateEffectTile(en.x, en.y, {
						name: "Radiance",
						duration: 2,
					}, 0);
					KDSetIDFlag(en.id, "RoCflag", 4);
					KinkyDungeonDamageEnemy(en, {
						type: e.damage,
						damage: e.power + e.mult * Math.max(0, KinkyDungeonStatDistractionMax - KinkyDungeonStatDistraction),
						time: e.time,
						bind: e.bind,
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
						nocrit: true,
					}, false, true, undefined, undefined, player,
					undefined, undefined, true, false);
				}

				if (player.player) {
					if (KinkyDungeonStatDistractionLower > 0) {
						KinkyDungeonChangeDesire(KinkyDungeonStatDistractionMax * -0.00025, true);
					}
				}
			}

		},
		"RemoveOnETTag": (e, item, _data) => {
			let tiles = KDEffectTileTags(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (e.tags.some((t) => {return tiles[t] != undefined;}) ) {
				// Increase damage count
				let count = KDItemDataQuery(item, e.kind) || 0;
				count = count + e.power;
				KDItemDataSet(item, e.kind, count);
				// Evaluate damage count
				if (!e.count || count >= e.count) {
					let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
					item.curse = undefined;
					if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
						KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
					}
					KinkyDungeonLock(item, "");
					KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgType").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
				} else {
					KinkyDungeonSendTextMessage(3, TextGet("KDRemoveOnDmgTypeChill").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2, true);
				}
			}
		},
		"CursedSubmission": (e, _item, _data) => {
			if (KinkyDungeonStatWill < 0.1) {
				if (KinkyDungeonLastTurnAction == "Move"
					&& KDEntityBuffedStat(KinkyDungeonPlayerEntity, "ForcedSubmission", true) > 0
					&& KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, e.dist, KinkyDungeonPlayerEntity).length == 0) {
					// Condition for if you are near an enemy
					KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["CursedSubmission"]);
					// Submit!!!
					KinkyDungeonSendTextMessage(7, TextGet("KDCursedSubmission"), "#9074ab", 3);
					KDPlayerEffectRestrain(undefined, e.count, e.tags, "Ghost", false, true, false, false, false);
				} else if (KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y,
					KDEntityBuffedStat(KinkyDungeonPlayerEntity, "ForcedSubmission") ? e.dist : 1.5,
					KinkyDungeonPlayerEntity).filter((en) => {return en.Enemy?.bound && !en.Enemy.nonHumanoid;}).length > 0) {
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
		"BoostDamage": (e, _item, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + e.power);
			}
		},
		"AmpDamage": (e, _item, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + (KinkyDungeonPlayerDamage.damage || 0) * e.power);
			}
		},
	},
	"remove": {
		"slimeStop": (_e, item, data) => {
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
		"RequireLocked": (_e, item, data) => {
			if (data.item == item && !item.lock && !item.curse) {
				KinkyDungeonRemoveRestraintSpecific(item, true, false, false);
				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffsNoLock")
					.replace("RSTNME", TextGet("Restraint" + item.name)), "lightgreen", 2);
			}
		},
	},
	"postRemoval": {
		"replaceItem": (e, item, data) => {
			if (data.item === item && !data.add && !data.shrine && e.list
				&& (!e.requireFlag || KinkyDungeonFlags.get(e.requireFlag)
			)
			) {
				let added = false;
				for (let restraint of e.list) {
					if (KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(restraint),
					e.power, true,
					e.keepLock ? item.lock : e.lock, data.keep, undefined, undefined, item.faction)) {
						added = true;
					}
				}
				if (added) {
					KinkyDungeonSendTextMessage(5, TextGet(e.msg)
						.replace("RSTNME", TextGet("Restraint" + item.name)), "#ffffff", 2);
				}
			}
		},
		"RequireHogtie": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
				let upper = false;
				let lower = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("HogtieUpper"))) {
						upper = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 20; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("HogtieUpper"))) {
								upper = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 200;
						}
					}
				}

				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("HogtieLower"))) {
						lower = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 20; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("HogtieLower"))) {
								lower = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 200;
						}
					}
				}
				if (!upper || !lower) {
					KinkyDungeonRemoveRestraintSpecific(item, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveHogtie"), "lightgreen", 2);
				}
			}
		},
		"RequireBaseArmCuffs": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
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
		"RequireTag": (e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
				let cuffsbase = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes(e.requiredTag))) {
						cuffsbase = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have an armbinder buried in there... somewhere
						for (let i = 0; i < 20; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes(e.requiredTag))) {
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
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffs" + e.requiredTag), "lightgreen", 2);
				}
			}
		},
		"RequireCollar": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
				let collar = false;
				if (data.item && KDRestraint(data.item)?.Group == "ItemNeck") {
					KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints(); // We update the restraints but no time drain on batteries, etc
				}
				if (KinkyDungeonPlayerTags.get("Collars")) collar = true;
				if (!collar) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false);
				}
			}
		},
		"RequireBaseAnkleCuffs": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
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
					KinkyDungeonRemoveRestraintSpecific(item, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffs"), "lightgreen", 2);
				}
			}
		},
		"RequireBaseLegCuffs": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
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
					KinkyDungeonRemoveRestraintSpecific(item, false, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCuffs"), "lightgreen", 2);
				}
			}
		},
		"collarModule": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
				let collar = false;
				for (let inv of KinkyDungeonAllRestraint()) {
					if (KDRestraint(inv).shrine && (KDRestraint(inv).shrine.includes("Collars"))) {
						collar = true;
						break;
					} else if (inv.dynamicLink) {
						let link = inv.dynamicLink;
						// Recursion thru to make sure we have a collar buried in there... somewhere
						for (let i = 0; i < 30; i++) {
							if (link && KDRestraint(link).shrine && (KDRestraint(link).shrine.includes("Collars"))) {
								collar = true;
								break;
							}
							if (link.dynamicLink) link = link.dynamicLink;
							else i = 30;
						}
					}
				}
				if (!collar) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, true, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveCollarModule"), "lightgreen", 2);
				}
			}
		},
		"armbinderHarness": (_e, item, data) => {
			if (!data.add && data.item !== item && KDRestraint(item).Group) {
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
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, true, false, false);
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonRemoveArmbinderHarness"), "lightgreen", 2);
				}
			}
		}
	},
	"tryOrgasm": {
		"CursedDenial": (e, _item, data) => {
			if (KinkyDungeonStatWill > 0.1) {
				if (data.auto <= 1)
					KinkyDungeonChangeWill(-e.power);
			} else {
				data.chance *= 0;
			}
		},
		"DivineBelt": (_e, _item, data) => {
			data.chance *= 0;
			KinkyDungeonEndVibration();
			KinkyDungeonSendTextMessage(6, TextGet("KDDivineBeltDeny"), "#ffff88", 4);
		},
		"DivineBelt2": (_e, _item, data) => {
			data.chance *= 0;
			KinkyDungeonSendTextMessage(6, TextGet("KDDivineBelt2Deny"), "#ffff88", 4);
		},
		"ForcedOrgasmPower": (e, item, data) => {
			if (KDGameData.CurrentVibration) {
				let locations = KDSumVibeLocations();
				if (KDGetVibeLocation(item)?.some((str) => {
					return locations.includes(str);
				}))
					data.eventBonus += e.power;
			}
		},
		"ForcedOrgasmMin": (e, item, data) => {
			if (KDGameData.CurrentVibration) {
				let locations = KDSumVibeLocations();
				if (KDGetVibeLocation(item)?.some((str) => {
					return locations.includes(str);
				}))
					if (data.amount < e.power) {
						data.amount = e.power;
						KinkyDungeonSendTextMessage(6, TextGet("KDForcedOrgasmMin"), "#ffaaaa", 5);
					}
			}

		},
	},
	"hit": {
		"linkItem": (e, item, data) => {
			if ((data.attack && data.attack.includes("Bind") && (!data.enemy || data.enemy.Enemy.bound) && !data.attack.includes("Suicide"))) {
				KDLinkItemEvent(e, item, data);
			}
		},
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
						let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
						item.curse = undefined;
						if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
							KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
						}
						KinkyDungeonLock(item, "");
						KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgType").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
					} else {
						KinkyDungeonSendTextMessage(5, TextGet("KDRemoveOnDmgTypePartial").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightgreen", 2);
					}
				}
			}
		},
		"bounce": (e, item, data) => {
			if (data.type && data.type != "pierce" && data.type != "glue" && !KinkyDungeonTeaseDamageTypes.includes(data.type) && data.dmg) {
				let chance = e.chance ? e.chance * data.dmg : 1.0;
				if (item && KDRandom() < chance) {
					let prereq = KDEventPrereq(e.requiredTag);
					if (prereq) {
						let point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, true, true);
						if (point && !KinkyDungeonEnemyAt(point.x, point.y)) {
							KDMovePlayer(point.x, point.y, false, false, true, true);
							KinkyDungeonSendTextMessage(5, TextGet("KDBubbleBounce"), "#ffffff", 2);

						}
						if (KDSoundEnabled() && e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"linkItemOnDamageType": (e, item, data) => {
			if (data.type && data.type == e.damage && data.dmg) {
				let subMult = 1;
				let chance = e.chance ? e.chance : 1.0;
				if (item && (e.restraint || KDRestraint(item).Link) && KDRandom() < chance * subMult) {
					let prereq = KDEventPrereq(e.requiredTag);
					if (prereq) {
						let newRestraint = KinkyDungeonGetRestraintByName(e.restraint || KDRestraint(item).Link);
						//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
						if (
							KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true)) {
							if (KDSoundEnabled() && e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
						}

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
	"apply": {
		"FilterLayer": (e, _item, data) => {
			data.Filters[e.kind] = e.filter;
		},
	},
	"missPlayer": {
		"EnergyCost": (e, _item, _data) => {
			if (e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);
		}
	},
	"missEnemy": {
		"EnergyCost": (e, _item, _data) => {
			if (e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);
		}
	},
	"calcEvasion": {
		"HandsFree": (e, _item, data) => {
			if (data.flags.KDEvasionHands) {
				data.flags.KDEvasionHands = false;
				if (data.cost && e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"ArmsFree": (e, _item, data) => {
			if (data.flags.KDEvasionArms) {
				data.flags.KDEvasionArms = false;
				if (data.cost && e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"BlindFighting": (e, _item, data) => {
			if (data.flags.KDEvasionSight) {
				data.flags.KDEvasionSight = false;
				if (data.cost && e.energyCost && KinkyDungeonStatMana < KinkyDungeonStatManaMax - 0.01) KinkyDungeonChangeCharge(- e.energyCost);
			}
		}
	},
	"beforePlayerAttack": {
		"BoostDamage": (e, _item, data) => {
			if (KDCheckPrereq(data.target, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + e.power);
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"AmpDamage": (e, _item, data) => {
			if (KDCheckPrereq(data.target, e.prereq, e, data)) {
				data.buffdmg = Math.max(0, data.buffdmg + (data.Damage?.damage || KinkyDungeonPlayerDamage.damage || 0) * e.power);
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
	},
	"beforeDamage": {
		"ModifyDamageFlat": (e, _item, data) => {
			if (data.damage > 0) {
				if (!e.chance || KDRandom() < e.chance) {
					data.damage = Math.max(data.damage + e.power, 0);
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
				}
			}
		},
	},
	"beforeDamageEnemy": {
		"MultiplyDamageStealth": (e, _item, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && !data.enemy.aware) {
				if (!e.chance || KDRandom() < e.chance) {
					let dmg = Math.max(0, Math.min(data.enemy.hp, data.dmg));
					if (e.energyCost && e.power > 1) KinkyDungeonChangeCharge(- e.energyCost * dmg * (e.power - 1));
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		},
		"AddDamageStealth": (e, _item, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && !data.enemy.aware) {
				if (!e.chance || KDRandom() < e.chance) {
					if (e.energyCost && e.power > 1) KinkyDungeonChangeCharge(- e.energyCost * (e.power - 1));
					data.dmg = Math.max(data.dmg + e.power, 0);
				}
			}
		},
		"MultiplyDamageStatus": (e, _item, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && (KinkyDungeonHasStatus(data.enemy))) {
				if (!e.chance || KDRandom() < e.chance) {
					let dmg = Math.max(0, Math.min(data.enemy.hp, data.dmg));
					if (e.energyCost && e.power > 1) KinkyDungeonChangeCharge(- e.energyCost * dmg * (e.power - 1));
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		},
		"MultiplyDamageMagic": (e, _item, data) => {
			if (data.dmg > 0 && data.incomingDamage && !KinkyDungeonMeleeDamageTypes.includes(data.incomingDamage.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					let dmg = Math.max(0, Math.min(data.enemy.hp, data.dmg));
					if (e.energyCost && e.power > 1) KinkyDungeonChangeCharge(- e.energyCost * dmg * (e.power - 1));
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		}
	},
	"calcSneak": {
		FactionStealth: (e, _item, data) => {
			if (data.enemy && (!e.kind || KDGetFaction(data.enemy) == e.kind)) {
				data.sneakThreshold += e.power || 0;
				data.visibility *= e.mult != undefined ? e.mult : 1;
			}
		}

	},
	"defeat": {
		"linkItem": (e, item, _data) => {
			if (item && (e.restraint || KDRestraint(item).Link) && (KDRandom() < e.chance)) {
				let newRestraint = KinkyDungeonGetRestraintByName(e.restraint || KDRestraint(item).Link);
				KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true);
				//KinkyDungeonLinkItem(newRestraint, item, item.tightness, "");
			}
		},
		"Kittify": (_e, item, _data) => {
			// get defeat, upgrade suit
			KinkyDungeonRemoveRestraint("ItemArms",false,false,true,false);
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("KittyPetSuit"), 15, undefined, undefined, undefined, undefined, undefined, item.faction, true);
			// leash if collared
			let collared = KinkyDungeonPlayerTags.get("Collars");
			if(collared != undefined){
				KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BasicLeash"), 1, false, "Red", undefined, undefined, undefined, item.faction, true);
			}
		},
	},
	"struggle": {
		"crotchrope": (_e, _item, data) => {
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
		"celestialRopePunish": (_e, item, data) => {
			if (data.restraint && item === data.restraint) {
				KinkyDungeonChangeDistraction(3);
				KinkyDungeonChangeMana(-1);
				KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind + 1, 2);

				if (!StandalonePatched)
					for (let A = 0; A < KinkyDungeonPlayer.Appearance.length; A++) {
						if (KinkyDungeonPlayer.Appearance[A].Asset.Group.Name === "Eyes" || KinkyDungeonPlayer.Appearance[A].Asset.Group.Name === "Eyes2") {
							let property = KinkyDungeonPlayer.Appearance[A].Property;
							if (!property || property.Expression !== "Surprised") {
								KinkyDungeonPlayer.Appearance[A].Property = {Expression: "Surprised"};
								KDRefresh = true;
							}
						}
					}
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCelestialPunish" + Math.floor(KDRandom() * 3)), "#ff5277", 2);
			}
		},
		"crystalPunish": (_e, item, data) => {
			if (data.restraint && item === data.restraint) {
				KinkyDungeonChangeDistraction(1, false, 0.1);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonCrystalPunish" + Math.floor(KDRandom() * 3)), "#ff5277", 2);
			}
		},
		"PunishPlayer": (e, item, data) => {
			if (data.restraint && item === data.restraint) {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > (e.count || 2) && KDRandom() < e.warningchance)) {
					if (e.stun && KDGameData.WarningLevel > (e.count || 2)) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > (e.count || 2) ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		}
	},
	"beforeStruggleCalc": {
		"UniversalSolvent": (e, item, data) => {
			if (item == data.restraint && (
				data.struggleType == "Struggle"
				||
				data.struggleType == "Cut"
			)) {
				data.escapePenalty -= e.power;
			}
		},
		"StruggleManaBonus": (e, item, data) => {
			if (item == data.restraint) {
				let bonus = KDGetManaBonus(e.mult, e.power, e.threshold, e.threshold, e.threshold);

				data.escapeChance += bonus;

				if (!data.query) {
					let msg = e.msg ? e.msg : ("KDStruggleMana" + (bonus >= 0 ? "Bonus" : "Penalty"));
					if (msg) {
						KinkyDungeonSendTextMessage(5, TextGet(msg).replace("RestraintName", TextGet("Restraint" + data.restraint.name)), bonus > 0 ? "#88ff88" : "#ff5555", 2);
					}
				}
			}
		},
		"boostWater": (e, item, data) => {
			if (item == data.restraint && KinkyDungeonPlayerBuffs.Drenched && KinkyDungeonPlayerBuffs.Drenched.duration > 0) {
				data.escapeChance += e.power;

				if (!data.query) {
					let msg = e.msg ? e.msg : "KinkyDungeonDrenchedSlimeBuff";
					if (msg) {
						KinkyDungeonSendTextMessage(5, TextGet(msg).replace("RestraintName", TextGet("Restraint" + data.restraint.name)), "lightgreen", 2);
					}
				}
			}
		},
		"ShockForStruggle": (e, item, data) => {
			if (!data.query) {
				if (data.struggleType === "Struggle") {
					if (KDRandom() < e.chance || (KDGameData.WarningLevel > (e.count || 2) && KDRandom() < e.warningchance) || data.group == "ItemNeck") {

						data.escapePenalty += e.bind ? e.bind : 0.1;
						KDGameData.WarningLevel += 1;
						if (KinkyDungeonStatsChoice.get("Estim")) {
							if (e.stun && KDGameData.WarningLevel > (e.count || 2)) {
								KinkyDungeonChangeDistraction(5, false, 0.5);
								KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
							}
							KinkyDungeonDealDamage({damage: e.power, type: "estim"});
							KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayerEstim") + (KDGameData.WarningLevel > (e.count || 2) ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
							if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Estim.ogg");
						} else {
							if (e.stun && KDGameData.WarningLevel > (e.count || 2)) {
								KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
								KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
							}
							KinkyDungeonDealDamage({damage: e.power, type: e.damage});
							KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > (e.count || 2) ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
							if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
						}

					}
				}
			}
		},
		"elbowCuffsBlock": (e, item, data) => {

			if (data.restraint && item != data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KDRestraint(data.restraint).shrine.includes("ArmCuffsBase")) {
				data.escapePenalty += e.power ? e.power : 1.0;
				if (!data.query)
					KinkyDungeonSendTextMessage(10, TextGet("KDElbowCuffsBlock" + Math.floor(KDRandom() * 3)), "#ff5277", 2);
			}
		},
		"vibeStruggle": (_e, item, data) => {
			if (KinkyDungeonHasCrotchRope && !KinkyDungeonPlayerTags.get("ChastityLower") && data.restraint && item == data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && (KinkyDungeonIsHandsBound(false, false, 0.45) || KinkyDungeonIsArmsBound())) {
				data.escapePenalty += data.escapeChance;
				if (!data.query)
					KinkyDungeonSendTextMessage(10, TextGet("KDCrotchRopeBlock" + Math.floor(KDRandom() * 3)), "#ff5277", 2);
			}
		},
		"struggleDebuff": (e, item, data) => {
			if (e.StruggleType == data.struggleType && data.restraint && item != data.restraint && KDRestraint(data.restraint)?.shrine?.includes(e.requiredTag)) {
				data.escapePenalty += e.power;
				if (!data.query)
					if (e.msg)
						KinkyDungeonSendTextMessage(2, TextGet(e.msg), "#ff5555", 2);
			}
		},
		"obsidianDebuff": (e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item != data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KDRestraint(data.restraint).shrine.includes("Obsidian")) {
				data.escapePenalty += e.power ? e.power : 0.075;
				if (!data.query)
					KinkyDungeonSendTextMessage(5, TextGet("KDObsidianDebuff" + Math.floor(KDRandom() * 3)), "#8800aa", 2, true);
			}
		},
		"latexDebuff": (e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item != data.restraint && KDRestraint(data.restraint).shrine.includes("Latex")) {
				data.escapePenalty += e.power ? e.power : 0.075;
				if (!data.query)
					KinkyDungeonSendTextMessage(5, TextGet("KDLatexDebuff" + Math.floor(KDRandom() * 3)), "#38a2c3", 2, true);
			}
		},


		"ropeDebuff": (e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item != data.restraint && e.requireTags?.some((tag) => {return KDRestraint(data.restraint).shrine.includes(tag);})) {
				data.escapePenalty += e.power ? e.power : 0.075;
				if (!data.query)
					KinkyDungeonSendTextMessage(5, TextGet("KDRopeDebuff" + Math.floor(KDRandom() * 3)).replace("RSTRN", TextGet("Restraint" + item.name)), "#e0af88", 2, true);
			}
		},

		"shadowBuff": (_e, item, data) => {
			if (data.restraint && data.struggleType === "Struggle" && item == data.restraint) {

				let brightness = KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				if (brightness > 4) {
					data.escapeChance += 0.1 * brightness;
					if (!data.query)
						KinkyDungeonSendTextMessage(7, TextGet("KDShadowBuff"), "#99ff99", 2, true);
				}


			}
		},
		"wristCuffsBlock": (e, item, data) => {
			if (data.restraint && item != data.restraint && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KDRestraint(data.restraint).shrine.includes("ArmCuffsBase")) {
				data.escapePenalty += e.power ? e.power : 0.075;
				if (!data.query)
					KinkyDungeonSendTextMessage(5, TextGet("KDWristCuffsBlock" + Math.floor(KDRandom() * 3)), "#ff5277", 2);
			}
		},
	},
	"sprint": {
		"NippleWeights": (e, item, _data) => {
			if (!e.chance || KDRandom() < e.chance * (KinkyDungeonSlowLevel > 1 ? 2 : 1)) {
				if (e.msg) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#ff8888", 1, false, true);

				KinkyDungeonChangeDistraction(e.power, true, e.mult || 0.4);

				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
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

		"DestroyDirt": (e, _item, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.enemy.Enemy?.tags?.dirt) {
				if ((!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							addBind: e.addBind,
							bindType: e.bindType,
						}, false, e.power <= 0.1, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"DestroyMold": (e, _item, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.enemy.Enemy?.tags?.mold) {
				if ((!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							addBind: e.addBind,
							bindType: e.bindType,
						}, false, e.power <= 0.1, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalEffect": (e, _item, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if ((!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							addBind: e.addBind,
							bindType: e.bindType,
						}, false, e.power <= 0.1, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalEcho": (e, _item, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if ((!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power * (data.damage.damage || KinkyDungeonPlayerDamage.damage || 0),
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							addBind: e.addBind,
							bindType: e.bindType,
						}, false, e.power <= 0.1, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
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
		"NippleWeights": (e, item, _data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (!KinkyDungeonPlayerDamage?.noHands && KinkyDungeonCanUseWeapon(true, undefined, KinkyDungeonPlayerDamage)) {
					if (e.msg) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#ff8888", 1, false, true);

					KinkyDungeonChangeDistraction(e.power, true, e.mult || 0.4);

					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		"ShadowHeel": (e, _item, data) => {
			if (data.targetX && data.targetY && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy))) {
				KinkyDungeonCastSpell(data.targetX, data.targetY, KinkyDungeonFindSpell("HeelShadowStrike", true), undefined, undefined, undefined);
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"AlertEnemies": (e, item, data) => {
			if (KDAlertCD < 1 && data.enemy && (!e.chance || KDRandom() < e.chance)) { // (data.damage && data.damage.damage && data.enemy.hp > data.enemy.Enemy.maxhp - data.damage.damage*2 - 1)
				KinkyDungeonAlert = Math.max(KinkyDungeonAlert, e.power);
				KDAlertCD = 5;
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonAlertEnemies").replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"PunishPlayer": (e, item, data) => {
			if (item.type === Restraint && data.targetX && data.targetY && data.enemy && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy)) && (!KinkyDungeonHiddenFactions.has(KDGetFaction(data.enemy)) || KDGetFaction(data.enemy) == "Enemy")) {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > (e.count || 2) && KDRandom() < e.warningchance)) {
					if (e.stun && KDGameData.WarningLevel > (e.count || 2)) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > (e.count || 2) ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
		"cursePunish": (e, item, data) => {
			if (item.type === Restraint && data.targetX && data.targetY && data.enemy && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy)) && (!KinkyDungeonHiddenFactions.has(KDGetFaction(data.enemy)) || KDGetFaction(data.enemy) == "Enemy")) {
				if (!e.chance || KDRandom() < e.chance) {
					if (e.stun) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					if (!data.cursePunish) {
						KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
						if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
					data.cursePunish = true;
				}
			}
		},
		"armorNoise": (e, item, data) => {
			if (item.type === Restraint && data.targetX && data.targetY && data.enemy && !data.armorNoise) {
				if (!e.chance || KDRandom() < e.chance ) {
					KinkyDungeonMakeNoise(e.dist, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true);
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");

					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${TextGet("KDArmorNoise")}`, "#ffffff", KDToggles.FastFloaters ? 1 : 2);
					data.armorNoise = true;
				}
			}
		},
	},
	"calcMiscast": {
		"ReduceMiscastFlat": (e, _item, data) => {
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
			const enemy: entity = data.enemy;
			if (!enemy || KDRandom() >= (enemy.Enemy.RemoteControl?.punishRemoteChance || 0.25) || KDEnemyHasFlag(enemy, "remoteShockCooldown") || (e.noLeash && KDGameData.KinkyDungeonLeashedPlayer >= 1)) {
				return;
			}
			// 7 tick cooldown stops it feeling overly spammy
			KinkyDungeonSetEnemyFlag(enemy, "remoteShockCooldown", 7);
			if (KinkyDungeonStatsChoice.get("Estim")) {
				if (e.stun) {
					KinkyDungeonChangeDistraction(5, false, 0.5);
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
				}
				KinkyDungeonDealDamage({damage: e.power, type: "estim"});
				const msg = TextGet(e.msg ? e.msg : "KinkyDungeonRemoteShockEstim")
					.replace("RestraintName", TextGet(`Restraint${item.name}`))
					.replace("EnemyName", TextGet(`Name${enemy.Enemy.name}`));
				KinkyDungeonSendTextMessage(5, msg, "#ff8933", 2);
				if (e.sfx) KinkyDungeonPlaySound(`${KinkyDungeonRootDirectory}/Audio/${"Estim"}.ogg`);
			} else {
				if (e.stun) {
					KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
					KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
				}
				KinkyDungeonDealDamage({damage: e.power, type: e.damage});
				const msg = TextGet(e.msg ? e.msg : "KinkyDungeonRemoteShock")
					.replace("RestraintName", TextGet(`Restraint${item.name}`))
					.replace("EnemyName", TextGet(`Name${enemy.Enemy.name}`));
				KinkyDungeonSendTextMessage(5, msg, "#ff8933", 2);
				if (e.sfx) KinkyDungeonPlaySound(`${KinkyDungeonRootDirectory}/Audio/${e.sfx}.ogg`);
			}

		},
		"RemoteControlHarness": (e, item, data) => {
			const enemy = data.enemy;
			if (KDRandom() >= (enemy.Enemy.RemoteControl?.punishRemoteChance || 0.1) || (e.noLeash && KDGameData.KinkyDungeonLeashedPlayer >= 1)) {
				return;
			}

			if (e.sfx) KinkyDungeonPlaySound(`${KinkyDungeonRootDirectory}/Audio/${e.sfx}.ogg`);

			let category = KDControlHarnessCategories[e.kind];

			if (category) {
				category.activateFunction(e, item, data);
			}

			if (e.enemyDialogue) {
				const dialogue = KinkyDungeonGetTextForEnemy(e.enemyDialogue, enemy);
				KinkyDungeonSendDialogue(enemy, dialogue, KDGetColor(enemy), 2, 4);
			}

			if (e.msg) {
				const msg = TextGet(e.msg)
					.replace("RestraintName", TextGet(`Restraint${item.name}`))
					.replace("EnemyName", TextGet(`Name${enemy.Enemy.name}`));
				KinkyDungeonSendTextMessage(5, msg, "#ff8933", 2);
			}
		},
		"RemoteLinkItem": (e, item, data) => {
			const enemy = data.enemy;
			if (KDRandom() >= (enemy.Enemy.RemoteControl?.punishRemoteChance || 0.1) || (e.noLeash && KDGameData.KinkyDungeonLeashedPlayer >= 1)) {
				return;
			}

			const newRestraint = KinkyDungeonGetRestraintByName(e.restraint || KDRestraint(item).Link);
			if (e.sfx) KinkyDungeonPlaySound(`${KinkyDungeonRootDirectory}/Audio/${e.sfx}.ogg`);

			KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true, undefined, undefined, undefined);

			if (e.enemyDialogue) {
				const dialogue = KinkyDungeonGetTextForEnemy(e.enemyDialogue, enemy);
				KinkyDungeonSendDialogue(enemy, dialogue, KDGetColor(enemy), 2, 4);
			}

			if (e.msg) {
				const msg = TextGet(e.msg)
					.replace("RestraintName", TextGet(`Restraint${item.name}`))
					.replace("EnemyName", TextGet(`Name${enemy.Enemy.name}`));
				KinkyDungeonSendTextMessage(5, msg, "#ff8933", 2);
			}
		}
	},
	"playerMove": {
		"removeOnMove": (e, item, _data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (!e.prereq || KDCheckPrereq(KinkyDungeonPlayerEntity)) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false);
				}
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"tipBallsuit": (e, _item, _data) => {
			if (!e.chance || KDRandom() < e.chance) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "tipBallsuit",
					duration: 6,
					type: "SlowLevel",
					power: KinkyDungeonStatStamina > 1 ? 4 : 15,
					pose: "BallsuitTip",
				});
				KinkyDungeonSendActionMessage(10, TextGet("KDBallsuitTip"), "#e7cf1a", 1);
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
		"DivineBra": (e, _item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				data.amount = 0;
				KinkyDungeonSendTextMessage(6, TextGet("KDDivineBraDeny"), "#ffff88", 4);
			}
		},
		"DivineBra2": (e, _item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				KinkyDungeonChangeDistraction(-4 - data.amount, true, 0);
				KinkyDungeonChangeStamina(1 + data.amount * 2, false);
				KinkyDungeonSendTextMessage(6, TextGet("KDDivineBra2Deny"), "#ffff88", 4);
			}
		},
		"QuakeCollar": (e, _item, data) => {
			let amnt = -1 + data.amount * 2;
			if (amnt > 0) {
				if (!e.chance || KDRandom() < e.chance) {
					let distractionStart = KinkyDungeonStatDistraction;
					KinkyDungeonChangeDistraction(1, false, 0.5);
					if (distractionStart < KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLowerCap && KinkyDungeonStatDistraction > distractionStart) {
						KinkyDungeonChangeMana(amnt, false);
						KinkyDungeonSendTextMessage(6, TextGet("KDQuakeCollar"), "#8888ff", 4);
					} else {
						KinkyDungeonSendTextMessage(6, TextGet("KDQuakeCollarFail"), "#8888ff", 4);
					}
					if (!KinkyDungeonFlags.get("QuakeUnlocked")) {
						KDUnlockPerk("QuakeCollar");
						KinkyDungeonSetFlag("QuakeUnlocked", -1);
					}
				}
			}
		},
	},
	"playerCast": {
		"NippleWeights": (e, item, data) => {
			if (!e.chance || KDRandom() < e.chance) {
				if (!data.spell || data.spell.components?.includes("Arms")) {
					if (e.msg) KinkyDungeonSendTextMessage(1, TextGet(e.msg).replace("[RESTRAINTNAME]", TextGet("Restraint" + item.name)), "#ff8888", 1, false, true);

					KinkyDungeonChangeDistraction(e.power, true, e.mult || 0.4);

					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
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
		"RobeOfChastity": (e, item, data) => {
			let player = !(item.onEntity > 0) ? KDPlayer() : KinkyDungeonFindID(item.onEntity);
			if (player) {
				if (player.player && KDRandom() < 0.1) {
					KinkyDungeonSendTextMessage(5, TextGet("KDRobeOfChastityArouse" + Math.floor(KDRandom() * e.count)),
						"#ffff00", 10);
				}
				KinkyDungeonChangeDesire(e.mult * KinkyDungeonGetManaCost(data.spell), false);

			}
		},
		"AlertEnemies": (e, item, _data) => {
			if (!e.chance || KDRandom() < e.chance) {
				KinkyDungeonAlert = Math.max(KinkyDungeonAlert, e.power);
				KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonAlertEnemies").replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
				if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
			}
		},
		"PunishPlayer": (e, item, data) => {
			if (data.spell && item.type === Restraint && (!e.punishComponent || (data.spell.components && data.spell.components.includes(e.punishComponent)))) {
				if (KDRandom() < e.chance || (KDGameData.WarningLevel > (e.count || 2) && KDRandom() < e.warningchance)) {
					if (e.stun && KDGameData.WarningLevel > (e.count || 2)) {
						KinkyDungeonStatBlind = Math.max(KinkyDungeonStatBlind, e.stun);
						KDGameData.MovePoints = Math.max(-1, KDGameData.MovePoints - 1); // This is to prevent stunlock while slowed heavily
					}
					KDGameData.WarningLevel += 1;
					KinkyDungeonDealDamage({damage: e.power, type: e.damage});
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer") + (KDGameData.WarningLevel > (e.count || 2) ? "Harsh" : "")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
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
						KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
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
					KinkyDungeonSendTextMessage(5, TextGet((e.msg ? e.msg : "KinkyDungeonPunishPlayer")).replace("RestraintName", TextGet("Restraint" + item.name)), "#ff8933", 2);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");

					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${TextGet("KDArmorNoise")}`, "#ffffff", KDToggles.FastFloaters ? 1 : 2);
					data.armorNoise = true;
				}
			}
		},
	},
	"calcEscapeMethod": {
		"DollmakerMask": (_e, _item, data) => {
			if (KDGameData.RoomType == "" && !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
				data.escapeMethod = "Kill";
			}
		},
	},
	"calcEscapeKillTarget": {
		"DollmakerMask": (_e, _item, data) => {
			data.enemy = "DollmakerTarget";
		}
	},
};

/**
 * @param Event
 * @param e
 * @param item
 * @param data
 */
function KinkyDungeonHandleInventoryEvent(Event: string, e: KinkyDungeonEvent, item: item, data: any) {
	if (Event === e.trigger && KDEventMapInventory[e.dynamic ? "dynamic" : Event] && KDEventMapInventory[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapInventory[e.dynamic ? "dynamic" : Event][e.type](e, item, data);
	}
}


/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, entity, *): void>>}
 */
const KDEventMapBuff: Record<string, Record<string, (e: KinkyDungeonEvent, buff: any, item: entity, data: any) => void>> = {
	"dynamic": {
		"BuffSelf": (e, buff, entity, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(entity, {
					id: (e.kind || buff.id) + e.buffType,
					type: e.buffType,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: e.time
				});
		},
	},
	"tickFlags": {
		"latexIntegration": (_e, buff, _entity, _data) => {
			buff.duration -= 100;
			if (buff.duration < 100) {
				delete buff.infinite;
				buff.duration = 1;
			}
		},
	},
	"beforeStruggleCalc": {
		"BreakFree": (_e, buff, _entity, data) => {
			if (data.struggleType == "Struggle")
				data.escapePenalty -= buff.power;
		},
		"latexIntegrationDebuff": (e, buff, _entity, data) => {
			if (data.restraint && (data.struggleType === "Struggle" || data.struggleType === "Remove") && KDRestraint(data.restraint).shrine.includes("Cyber")) {
				data.escapePenalty += (e.power || 1) * buff.power;
				if (!data.query)
					KinkyDungeonSendTextMessage(5, TextGet("KDLatexIntegration" + Math.floor(KDRandom() * 3)), "#38a2c3", 2, true);
			}
		},
	},
	"expireBuff": {
		"ChaoticOverflow": (e, buff, _entity, data) => {
			if (buff == data.buff) {
				let restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints", "crystalRestraintsHeavy"]}, KDGetEffLevel() + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
					true, "Gold", false, false, false);

				if (restraintToAdd) {
					KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
					if (e.count > 1)
						for (let i = 1; i < (e.count || 1); i++) {
							restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints", "crystalRestraintsHeavy"]}, KDGetEffLevel() + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
								true, "Gold", false, false, false);
							if (restraintToAdd) KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
						}

					KinkyDungeonSendTextMessage(10, TextGet("KDChaoticOverflow_End"), "#ff8888", 4);
				}
			}
		},
	},
	"beforeDamageEnemy": {
		"Conduction": (e, _buff, entity, data) => {
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
						KinkyDungeonSendTextMessage(6, TextGet("KDConductionDamageTaken").replace("DAMAGEDEALT", "" + data.dmg * e.power), "#ff5277", 2);
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
		"EchoDamage": (e, _buff, entity, data) => {
			if (data.enemy == entity && (!data.flags || (!data.flags.includes("EchoDamage"))) && data.dmg > 0 && (!e.damageTrigger || data.type == e.damageTrigger)) {
				KinkyDungeonDamageEnemy(entity, {
					type: e.damage,
					damage: data.dmg * e.power,
					flags: ["EchoDamage"]
				}, false, false, undefined, undefined, undefined, data.faction);
			}
		},
		"Volcanism": (_e, _buff, entity, data) => {
			if (data.enemy == entity && (!data.flags || (!data.flags.includes("VolcanicDamage") && !data.flags.includes("BurningDamage"))) && data.dmg > 0 && (data.type == "fire")) {
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("VolcanicStrike", true), undefined, undefined, undefined, "Rock");
				data.enemy.hp = 0;
			}
		},
		"Flammable": (_e, _buff, entity, data) => {
			if (entity == data.enemy && (!data.flags || !data.flags.includes("BurningDamage")) && !KDEntityHasBuff(entity, "Drenched") && data.dmg > 0 && (data.type == "fire")) {
				KinkyDungeonApplyBuffToEntity(entity, KDBurning);
			}
		},
	},
	"beforePlayerDamage": {
		"Flammable": (_e, _buff, entity, data) => {
			if (entity == KinkyDungeonPlayerEntity && (!data.flags || !data.flags.includes("BurningDamage")) && !KDEntityHasBuff(entity, "Drenched") && data.dmg > 0 && (data.type == "fire")) {
				KinkyDungeonApplyBuffToEntity(entity, KDBurning);
			}
		},
		"Conduction": (e, _buff, entity, data) => {
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
		"EchoDamage": (e, _buff, _entity, data) => {
			if ((!data.flags || !data.flags.includes("EchoDamage")) && data.dmg > 0 && (!e.damageTrigger || e.damageTrigger == data.type)) {
				KinkyDungeonSendTextMessage(6, TextGet("KDBurningFanFlamesDamageTaken").replace("DAMAGEDEALT", "" + data.dmg * e.power), "#ff5277", 2);
				KinkyDungeonDealDamage({
					type: e.damage,
					damage: data.dmg * e.power,
					flags: ["EchoDamage"],
				});
			}
		},
	},
	"beforeAttack": {
		"CounterattackDamage": (e, _buff, entity, data) => {
			if (data.attacker && data.target == entity
				&& data.eventable
				&& (!(e.prereq == "hit") || (!data.missed && data.hit))
				&& (!(e.prereq == "hit-hostile") || (!data.missed && data.hit && !data.attacker.playWithPlayer
				// Player attacking = hostile?
				// Enemy attacking enemy? hostile
				&& (data.attacker.player || !data.target.player || KinkyDungeonAggressive(data.attacker))))) {
				if (data.attacker.player) {
					KinkyDungeonDealDamage({damage: e.power, type: e.damage, crit: e.crit,
						addBind: e.addBind, bindcrit: e.bindcrit, bind: e.bind, time: e.time, bindType: e.bindType,});
				} else {
					KinkyDungeonDamageEnemy(data.attacker, {damage: e.power, type: e.damage, crit: e.crit, bindcrit: e.bindcrit, bind: e.bind, bindType: e.bindType, time: e.time}, false, true, undefined, undefined, entity);
				}
				if (e.requiredTag)
					KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, e.requiredTag, 1);
			}
		},
		"CounterattackSpell": (e, _buff, entity, data) => {
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
		"ShrineElements": (e, _buff, _entity, data) => {
			if (data.enemy && data.enemy.hp > 0.52 && KDHostile(data.enemy) && data.faction == "Player" && !KDEventDataReset['ShrineElements'] && data.spell) {
				KDEventDataReset['ShrineElements'] = true;
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
						distract: e.distract,
						addBind: e.addBind,
						bindType: e.bindType,
					}, false, e.power <= 1, undefined, undefined, undefined, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"ShadowElementalEffect": (e, buff, entity, data) => {
			if (buff.duration > 0 && data.enemy && data.enemy.hp > 0 && !KDHelpless(data.enemy) && KinkyDungeonBrightnessGet(entity.x, entity.y) <= KDShadowThreshold) {
				if (!e.prereq || KDCheckPrereq(entity, e.prereq)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						distract: e.distract,
						addBind: e.addBind,
						bindType: e.bindType,
					}, false, e.power <= 1, undefined, undefined, undefined, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"ShadowStep": (e, _buff, _entity, data) => {
			if (data.enemy && KDHostile(data.enemy) && !KinkyDungeonPlayerBuffs.ShadowStep) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShadowStep", type: "SlowDetection", duration: e.time * 2, power: 0.667, player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["SlowDetection", "hit", "cast"]});
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "ShadowStep2", type: "Sneak", duration: e.time, power: Math.min(20, e.time * 2), player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["Sneak", "hit", "cast"]});
				if (e.requiredTag)
					KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, e.requiredTag, 1);
			}
		},
		"ApplyDisarm": (e, _buff, entity, data) => {
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
		"Tablet": (e, _buff, _entity, data) => {
			if (data.spell != KinkyDungeonTargetingSpellItem && data.spell.tags && data.spell.tags.includes(e.requiredTag) || (data.spell.school && data.spell.school.toLowerCase() == e.requiredTag)) {
				data.cost = Math.max(data.cost * e.power, 0);
			}
		},
		"AvatarFire": (e, _buff, _entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("fire")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
		"AvatarAir": (e, _buff, _entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("air")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
		"AvatarWater": (e, _buff, _entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("water")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
		"AvatarEarth": (e, _buff, _entity, data) => {
			if (data.spell.tags && data.spell.tags.includes("earth")) {
				data.cost = Math.max(data.cost - e.power, 0);
			}
		},
	},
	"beforeDressRestraints": {
		"LatexIntegration": (_e, buff, entity, data) => {
			if (data.Character == KDGetCharacter(entity)) {
				if (buff.power >= 100) {
					let color = {"gamma":2.7666666666666666,"saturation":1.6833333333333333,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1};
					let palette = "";
					let outfit = KDOutfit({name: KinkyDungeonCurrentDress});
					if ((KDToggles.ForcePalette || outfit?.palette || KinkyDungeonPlayer.Palette)
						&& (KDToggles.ApplyPaletteTransform
						&& (outfit?.palette || KinkyDungeonPlayer.Palette || !KDDefaultPalette || KinkyDungeonFactionFilters[KDDefaultPalette]))) {
							palette = outfit?.palette || KinkyDungeonPlayer.Palette || KDDefaultPalette;
					}
					let efd: alwaysDressModel = {
						Model: "Catsuit",
						faction: palette || "AncientRobot",
						Filters: {
							TorsoLower: color,
							TorsoUpper: color,
						},
						factionFilters: {
							TorsoLower: {color: "Catsuit", override: true},
							TorsoUpper: {color: "Catsuit", override: true},
						},
					};
					data.extraForceDress.push(efd);
				}
			}
		},
	},
	"tick": {
		"TrainingUnit": (_e, _buff, entity, _data) => {
			if (!entity.player) {
				if (!KDMapData.PrisonStateStack.includes("Training")) {
					KDRemoveEntity(entity, false, false, true);
				}
			}
		},

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
		"ShadowDommed": (_e, buff, entity, _data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						buff.duration = 0;
					}
					KinkyDungeonSetFlag("PlayerDommed", 2);
				}
			}
		},
		"Haunting": (e, buff, entity, _data) => {
			if (buff.power > 0 && entity.player) {
				let tags = ["comfyRestraints", "trap"];
				let restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "Purple",
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
								restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "Purple");
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
		"Cursed": (e, buff, entity, _data) => {
			if (buff.power > 0 && entity.player) {
				if (KinkyDungeonStatDistraction > 0.99 * KinkyDungeonStatDistractionMax) {
					let tags = ["obsidianRestraints", "shadowLatexRestraints", "shadowLatexPetsuit", "shadowLatexRestraintsHeavy"];
					let restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
						true, "Purple", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
							ForceDeep: true,
							allowLowPower: true,
						});
					if (restraintAdd) {
						if (KDRandom() < 0.2) {
							if (!KinkyDungeonStatsChoice.get("Haunted")) {
								buff.power -= 1;
							}
							KinkyDungeonAddRestraintIfWeaker(restraintAdd, KDGetEffLevel(),true, "Purple", true, undefined, undefined, "Curse", true);
							KinkyDungeonSendTextMessage(5, TextGet("KDObserverCursed").replace("RestraintAdded", TextGet("Restraint" + restraintAdd.name)), "#ff5555", 1);
							if (e.count > 1) {
								for (let i = 1; i < e.count; i++) {
									restraintAdd = KinkyDungeonGetRestraint({tags: [...tags]}, KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "Purple");
									KinkyDungeonAddRestraintIfWeaker(restraintAdd, KDGetEffLevel(),true, "Purple", true, undefined, undefined, "Curse", true);
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
		"BoundByFate": (e, buff, entity, _data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					if (!KDEffectTileTags(entity.x, entity.y).fate) {
						buff.duration = 0;
						KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, "soul", {name: "StarBondage", count: e.count, kind: e.kind, power: e.power, damage: e.damage});
						KDRemoveAoEEffectTiles(entity.x, entity.y, ["fate"], 1.5);
					}
				}
			}
		},
		"Taunted": (e, buff, entity, _data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					if (!KDEffectTileTags(entity.x, entity.y).taunt) {
						buff.duration = 0;
						KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, "soul", {name: "TauntShame", count: e.count, kind: e.kind, power: e.power, damage: e.damage});
						KDRemoveAoEEffectTiles(entity.x, entity.y, ["taunt"], 10);
					}
				}
			}
		},
		"ApplyConduction": (e, _buff, entity, _data) => {
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
		"ApplySlowed": (e, _buff, entity, _data) => {
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
		"ApplyKnockback": (e, _buff, entity, _data) => {
			let bb = Object.assign({}, KDKnockbackable);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplyVuln": (_e, _buff, entity, _data) => {
			if (!entity.player) {
				if (!entity.vulnerable) entity.vulnerable = 1;
			}
		},
		"ApplyAttackSlow": (e, _buff, entity, _data) => {
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
		"ApplySilence": (e, buff, entity, _data) => {
			if (!buff.duration) return;
			if (!entity.player && entity.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(entity, e.prereq))
					KDSilenceEnemy(entity, e.duration);
			}
		},
		"ApplyGlueVuln": (e, _buff, entity, _data) => {
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
		"RemoveDrench": (_e, _buff, entity, _data) => {
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
		"Evaporate": (e, buff, entity, data) => {
			if (data.delta) {
				let DrySpeed = -1 + KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(entity, "DrySpeed") * (e.mult || 1.0));
				if (DrySpeed != 0) {
					buff.duration = Math.max(0, buff.duration - data.delta * DrySpeed);
				}
			}

		},

		"BreakFree": (_e, _buff, entity, _data) => {
			if (KinkyDungeonStatWill <= 0.01) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs.BreakFree;
				}
			}
		},

		"RemoveConduction": (_e, _buff, entity, _data) => {
			if (!KDConducting(entity)) {
				if (entity.player) {
					delete KinkyDungeonPlayerBuffs.Conduction;
				} else {
					delete entity.buffs.Conduction;
				}
			}
		},
		"RemoveSlimeWalk": (_e, buff, entity, _data) => {
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
		"Distract": (e, _buff, entity, data) => {
			if (entity.Enemy?.bound && (!e.prereq || KDCheckPrereq(entity, e.prereq, e, data))) {
				KDAddDistraction(entity, data.delta * e.power);
			}
		},
		"RemoveBurning": (_e, _buff, entity, data) => {
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
		"RemoveRestraint": (_e, buff, entity, data) => {
			// Removes restraint debuffs once the enemy has struggled out
			if (buff && buff.duration > data.delta && !entity.player) {
				if (!entity.Enemy.bound || entity.boundLevel <= 0.01)
					delete entity.buffs[buff.id];
			}
		},
		"ElementalEffect": (e, buff, entity, _data) => {
			if (buff.duration > 0) {
				if (entity.player) {
					KinkyDungeonDealDamage({
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						distract: e.distract,
						addBind: e.addBind,
						bindType: e.bindType,
						flags: ["BurningDamage"]
					});
				} else {
					KinkyDungeonDamageEnemy(entity, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						distract: e.distract,
						addBind: e.addBind,
						bindType: e.bindType,
						flags: ["BurningDamage"]
					}, false, true, undefined, undefined, undefined);
				}
			}
		},

		"ShadowElementalEffect": (e, buff, entity, _data) => {
			if (KinkyDungeonBrightnessGet(entity.x, entity.y) <= KDShadowThreshold) {
				if (buff.duration > 0) {
					if (entity.player) {
						KinkyDungeonDealDamage({
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
							flags: ["BurningDamage"]
						});
					} else {
						KinkyDungeonDamageEnemy(entity, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
							flags: ["BurningDamage"]
						}, e.power < 1, true, undefined, undefined, undefined);
					}
				}
			}
		},
		"UnShadowElementalEffect": (e, buff, entity, _data) => {
			if (KinkyDungeonBrightnessGet(entity.x, entity.y) > KDShadowThreshold) {
				if (buff.duration > 0) {
					if (entity.player) {
						KinkyDungeonDealDamage({
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
							flags: ["BurningDamage"]
						});
					} else {
						KinkyDungeonDamageEnemy(entity, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
							flags: ["BurningDamage"]
						}, false, true, undefined, undefined, undefined);
					}
				}
			}
		},
	},

	"afterEnemyTick": {


		"nurseAura": (e, _buff, enemy, data) => {
			KDEventMapEnemy[e.trigger][e.type](e, enemy, data);
		},
		// Simple spell checkerboard pattern
		"spellX": (e, _buff, enemy, data) => {
			KDEventMapEnemy[e.trigger][e.type](e, enemy, data);
		},
		// Has 4 missiles, launches 1 at a time, reloads every e.time turns
		"Missiles": (e, buff, enemy, data) => {
			if (data.delta
				&& KinkyDungeonCanCastSpells(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {

				let dist = 11 - Math.min(4, buff.power);
				let nearby = (e.always || enemy.aware || enemy.vp > 0.5) ?
					KDNearbyEnemies(enemy.x, enemy.y, dist, enemy).filter((en) => {
						return !KDHelpless(en);
					}) : [];
				if ((e.always || enemy.aware || enemy.vp > 0.5)
					&& (e.always || nearby.length > 0 || KinkyDungeonAggressive(enemy))) {
					if (buff.power > 0) {
						let player = KDHostile(enemy, KDPlayer()) ? KDPlayer() : null;
						let playerdist = player ? KDistChebyshev(enemy.x - player.x, enemy.y - player.y) : dist + 1;
						if (nearby.length > 0) {
							nearby = nearby.filter((en) => {
								return KDistChebyshev(enemy.x - en.x, enemy.y - en.y) < playerdist;
							});
							if (nearby.length > 0) {
								// 3 attempts to retarget
								for (let i = 0; i < 3; i++) {
									player = nearby[Math.floor(KDRandom() * nearby.length)];
									if (KinkyDungeonCheckLOS(
										enemy,
										player,
										KDistChebyshev(enemy.x - player.x, enemy.y - player.y),
										dist, false, true, 1)) break;
								}
							}
						}

						if (KinkyDungeonCheckLOS(
							enemy,
							player,
							KDistChebyshev(enemy.x - player.x, enemy.y - player.y),
							dist, false, true, 1)) {
							let origin = enemy;
							let spell = KinkyDungeonFindSpell(e.spell, true);
							let b = KinkyDungeonLaunchBullet(origin.x, origin.y,
								player.x,player.y,
								0.5, {noSprite: spell.noSprite, faction: KDGetFaction(enemy), name:spell.name, block: spell.block, volatile: spell.volatile, blockType: spell.blockType,
									volatilehit: spell.volatilehit,
									width:spell.size, height:spell.size, summon:spell.summon,
									targetX: player.x, targetY: player.y, cast: Object.assign({}, spell.spellcast),
									source: enemy.id, dot: spell.dot,
									bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
									bulletSpin: spell.bulletSpin,
									effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
									effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
									passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
									pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
									lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: KDGetSpellRange(spell), hit:spell.onhit,
									damage: {evadeable: spell.evadeable, noblock: spell.noblock,
										ignoreshield: spell?.ignoreshield,
										shield_crit: spell?.shield_crit, // Crit thru shield
										shield_stun: spell?.shield_stun, // stun thru shield
										shield_freeze: spell?.shield_freeze, // freeze thru shield
										shield_bind: spell?.shield_bind, // bind thru shield
										shield_snare: spell?.shield_snare, // snare thru shield
										shield_slow: spell?.shield_slow, // slow thru shield
										shield_distract: spell?.shield_distract, // Distract thru shield
										shield_vuln: spell?.shield_vuln, // Vuln thru shield

										damage:e.power || spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, desireMult: spell.desireMult, bindEff: spell.bindEff,
										bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}, false, enemy.x, enemy.y);
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

				let dist = 3;
				let nearby = (e.always || enemy.aware || enemy.vp > 0.5) ?
					KDNearbyEnemies(enemy.x, enemy.y, dist, enemy).filter((en) => {
						return !KDHelpless(en);
					}) : [];
				if ((e.always || enemy.aware || enemy.vp > 0.5)
					&& (e.always || nearby.length > 0 || KinkyDungeonAggressive(enemy))) {
					if (buff.power > 0) {
						let player = KDHostile(enemy, KDPlayer()) ? KDPlayer() : null;
						let playerdist = player ? KDistChebyshev(enemy.x - player.x, enemy.y - player.y) : dist + 1;
						if (nearby.length > 0) {
							nearby = nearby.filter((en) => {
								return KDistChebyshev(enemy.x - en.x, enemy.y - en.y) < playerdist;
							});
							if (nearby.length > 0) {
								// 2 attempts to retarget
								for (let i = 0; i < 2; i++) {
									player = nearby[Math.floor(KDRandom() * nearby.length)];
									if (KinkyDungeonCheckLOS(
										enemy,
										player,
										KDistChebyshev(enemy.x - player.x, enemy.y - player.y),
										dist, false, true, 1)) break;
								}
							}
						}

						if (KinkyDungeonCheckLOS(enemy, player,
								KDistChebyshev(enemy.x - player.x, enemy.y - player.y), dist, false, true, 1)) {
							let origin = enemy;
							let spell = KinkyDungeonFindSpell(e.spell, true);
							let b = KinkyDungeonLaunchBullet(origin.x, origin.y,
								player.x,player.y,
								0.5, {noSprite: spell.noSprite, faction: KDGetFaction(enemy), name:spell.name, block: spell.block, volatile: spell.volatile, blockType: spell.blockType,
									volatilehit: spell.volatilehit,
									width:spell.size, height:spell.size, summon:spell.summon,
									targetX: player.x, targetY: player.y,//cast: Object.assign({}, spell.spellcast),
									source: enemy.id, dot: spell.dot,
									bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
									bulletSpin: spell.bulletSpin,
									effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
									effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
									passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
									pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
									lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: KDGetSpellRange(spell), hit:spell.onhit,
									damage: {evadeable: spell.evadeable, noblock: spell.noblock,
										ignoreshield: spell?.ignoreshield,
										shield_crit: spell?.shield_crit, // Crit thru shield
										shield_stun: spell?.shield_stun, // stun thru shield
										shield_freeze: spell?.shield_freeze, // freeze thru shield
										shield_bind: spell?.shield_bind, // bind thru shield
										shield_snare: spell?.shield_snare, // snare thru shield
										shield_slow: spell?.shield_slow, // slow thru shield
										shield_distract: spell?.shield_distract, // Distract thru shield
										shield_vuln: spell?.shield_vuln, // Vuln thru shield
										damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, desireMult: spell.desireMult, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags},
									spell: spell}, false, enemy.x, enemy.y);
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
		"ApplyConduction": (e, buff, entity, _data) => {
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
		"ApplySlowed": (e, buff, entity, _data) => {
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
		"ApplyKnockback": (e, _buff, entity, _data) => {
			let bb = Object.assign({}, KDKnockbackable);
			if (e.duration) bb.duration = e.duration;
			if (e.power) bb.power = e.power;
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
			} else {
				if (!entity.buffs) entity.buffs = {};
				KinkyDungeonApplyBuffToEntity(entity, bb);
			}
		},
		"ApplyVuln": (_e, _buff, entity, _data) => {
			if (!entity.player) {
				if (!entity.vulnerable) entity.vulnerable = 1;
			}
		},
		"ApplyAttackSlow": (e, buff, entity, _data) => {
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
		"ApplySilence": (e, buff, entity, _data) => {
			if (!buff.duration) return;
			if (!entity.player && entity.Enemy.bound) {
				if (!e.prereq || KDCheckPrereq(entity, e.prereq))
					KDSilenceEnemy(entity, e.duration);
			}
		},
		"ApplyGlueVuln": (e, buff, entity, _data) => {
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
 * @param Event
 * @param e
 * @param buff
 * @param entity
 * @param data
 */
function KinkyDungeonHandleBuffEvent(Event: string, e: KinkyDungeonEvent, buff: any, entity: entity, data: any) {
	if (Event === e.trigger && KDEventMapBuff[e.dynamic ? "dynamic" : Event] && KDEventMapBuff[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapBuff[e.dynamic ? "dynamic" : Event][e.type](e, buff, entity, data);
	}
}


let KDEventMapOutfit: Record<string, Record<string, (e: KinkyDungeonEvent, outfit: outfit, data: any) => void>> = {
	"calcEvasion": {
		"AccuracyBuff": (e, _outfit, data) => {
			if (data.enemy && data.enemy.Enemy && data.enemy.Enemy.tags[e.requiredTag]) {
				data.hitmult *= e.power;
			}
		},
	},
	"calcSneak": {
		FactionStealth: (e, _outfit, data) => {
			if (data.enemy && (!e.kind || KDGetFaction(data.enemy) == e.kind)) {
				data.sneakThreshold += e.power || 0;
				data.visibility *= e.mult != undefined ? e.mult : 1;
			}
		}

	},
	"tick": {
		"sneakBuff": (e, outfit, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: outfit.name + "Sneak", type: "SlowDetection", power: e.power, duration: 2,});
		},
		"armorBuff": (e, outfit, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: outfit.name + "Armor", type: "Armor", power: e.power, duration: 2,});
		},
		"buff": (e, outfit, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: outfit.name + e.kind, type: e.kind, power: e.power, duration: 2,});
		},
		"damageResist": (e, outfit, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: outfit.name + e.damage + "damageResist", type: e.damage + "DamageResist", power: e.power, duration: 2,});
		},
	},

};

/**
 * @param Event
 * @param e
 * @param outfit
 * @param data
 */
function KinkyDungeonHandleOutfitEvent(Event: string, e: KinkyDungeonEvent, outfit: outfit, data: any) {
	if (Event === e.trigger && KDEventMapOutfit[e.dynamic ? "dynamic" : Event] && KDEventMapOutfit[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapOutfit[e.dynamic ? "dynamic" : Event][e.type](e, outfit, data);
	}
}

let KDEventMapSpell: Record<string, Record<string, (e: KinkyDungeonEvent, spell: spell, data: any) => void>> = {
	"afterChangeCharge": {
		"Gunslinger": (e, _spell, data) => {
			if (-data.change > 0) {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "BattleRhythm");
				let max = 0.4 * KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(player, "MaxBattleRhythm"));
				let mult = e.mult * KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(player, "MultBattleRhythm"));
				let powerAdded = 10 * -data.change * mult;
				if (powerAdded > 0)
					KinkyDungeonSetFlag("BRCombat", 20);
				if (!buff) {
					powerAdded = Math.min(powerAdded, max);
					KinkyDungeonApplyBuffToEntity(player,
						{
							id: "BattleRhythm",
							type: "BattleRhythm",
							aura: "#ff8933",
							aurasprite: "Null",
							buffSprite: true,
							power: powerAdded,
							duration: 9999, infinite: true,
							text: Math.round(100 * powerAdded),
						}
					);
					KinkyDungeonSendFloater(player, `+${Math.round(powerAdded*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
				} else {
					let origPower = buff.power;
					buff.power += powerAdded;
					buff.power = Math.min(buff.power, max);
					buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					KinkyDungeonSendFloater(player, `+${Math.round((buff.power - origPower)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
				}

				// Set a flag to prevent duplicating this event
				//KinkyDungeonSetFlag("BattleRhythm" + data.castID, 1);
			}
		},
	},
	"beforeCalcComp": {
		"ReplaceVerbalIfFail": (e, spell, data) => {
			if (data.spell?.tags?.includes(e.requiredTag)) {
				if (data.spell.components) {
					let failedcomp = [];
					for (let comp of data.spell.components) {
						if (!KDSpellComponentTypes[comp].check(spell, data.x, data.y)) {
							failedcomp.push(comp);
						}
					}
					let castdata = {
						targetX: data.targetX,
						targetY: data.targetY,
						spell: spell,
						components: data.components,
						flags: {
							miscastChance: KinkyDungeonMiscastChance,
						},
						gaggedMiscastFlag: false,
						gaggedMiscastType: "Gagged",
						query: true,
					};
					KDDoGaggedMiscastFlag(castdata);
					let oldMiscast = castdata.flags.miscastChance;

					castdata = {
						targetX: data.targetX,
						targetY: data.targetY,
						spell: spell,
						components: ["Verbal"],
						flags: {
							miscastChance: KinkyDungeonMiscastChance,
						},
						gaggedMiscastFlag: false,
						gaggedMiscastType: "Gagged",
						query: true,
					};
					KDDoGaggedMiscastFlag(castdata);
					let newMiscast = castdata.flags.miscastChance;
					if (failedcomp.length > 0 || oldMiscast > newMiscast) {
						data.components = ["Verbal"];
					}
				}
			}
		},
	},
	"calcSpellRange": {
		"AddRange": (e, _spell, data) => {
			if (data.spell?.tags?.includes(e.requiredTag)) {
				data.range += e.power;
			}
		},
	},
	"afterPlayerAttack": {
		"BattleTrance": (e, _spell, data) => {
			if (!KinkyDungeonAttackTwiceFlag && (!e.chance || KDRandom() < e.chance)
				&& KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BattleRhythm") >= 0.395) {
				if (data.enemy && data.enemy.hp > 0 && !(KDHelpless(data.enemy) && data.enemy.hp < 0.6)) {
					KinkyDungeonAttackTwiceFlag = true;
					KinkyDungeonLaunchAttack(data.enemy, 1);
					KinkyDungeonAttackTwiceFlag = false;
				} else if (data.enemy && (KDHelpless(data.enemy) || data.enemy.hp < 0.6)) {
					if (KDHasSpell("CombatManeuver")) {
						KinkyDungeonApplyBuffToEntity(KDPlayer(), {
							id: "CombatManeuverQuick",
							type: "Quickness",
							duration: 2,
							power: 1,
							endSleep: true, currentCount: -1, maxCount: 1, tags: ["quickness", "move", "attack", "cast"]
						});
						KinkyDungeonSendActionMessage(6, TextGet("KDCombatManeuver"), "#ffff33", 3);
					}
				}
			}
		},
	},
	"canOffhand": {
		"RogueOffhand": (_e, _spell, data) => {
			if (!data.canOffhand && KDHasSpell("RogueOffhand")) {
				if (!(KDWeapon(data.item)?.clumsy || KDWeapon(data.item)?.heavy || KDWeapon(data.item)?.massive)
					|| KDWeapon(data.item)?.tags?.includes("illum")) {
					data.canOffhand = true;
				}
			}
		},
		"WizardOffhand": (_e, _spell, data) => {
			if (!data.canOffhand && KDHasSpell("WizardOffhand")) {
				if (KDWeaponIsMagic(data.item) || KDWeapon(data.item)?.tags?.includes("illum")) {
					data.canOffhand = true;
				}
			}
		},
		"FighterOffhand": (_e, _spell, data) => {
			if (!data.canOffhand) {
				data.canOffhand = true;
			}
		},
	},
	"attackCost": {
		"CombatTraining": (e, _spell, data) => {
			if (KinkyDungeonStatWill > 0) {
				let amount = Math.min(e.power, e.mult * KinkyDungeonStatWill);
				data.mult *= 1 - amount;
			}
		},
	},
	"affinity": {
		"RogueEscape": (e, _spell, data: KDEventData_affinity) => {
			if (data.affinity == "Edge" || data.affinity == "Hook") {
				let nb = KDNearbyEnemies(data.entity.x, data.entity.y, e.dist).filter((enemy) => {
					return !enemy.Enemy.tags.ghost;
				});
				if (nb.length > 0) data.forceTrue = 2;
			}
		},
	},
	"postApply": {
		"RogueEscape": (e, _spell, data: KDEventData_PostApply) => {
			if (KinkyDungeonFlags.get("SelfBondage")) {
				let buff = KDEntityGetBuff(data.player, "RogueEscape");
				if (buff)
					buff.duration = 0;
				buff = KDEntityGetBuff(data.player, "RogueEscape2");
				if (buff)
					buff.duration = 0;
			} else if (!data.Link && !data.UnLink) {
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
					power: 0.2 + KDCalcRestraintBlock() * 0.1,
					duration: e.time,
				});
			}
		},
	},
	"beforeCrit": {
		"RogueTraps2": (_e, _spell, data) => {
			if (data.faction == "Player" && data.spell && data.spell.tags?.includes("trap")) {
				data.forceCrit = true;
			}
		}
	},
	"postQuest": {
	},
	"blockPlayer": {
		"Riposte": (_e, _spell, data) => {
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
		"RogueTraps": (_e, _spell, data) => {
			if (data.spell && data.spell.tags?.includes("trapReducible") && data.channel) {
				data.channel = 0;
			}
		}
	},
	"calcComp": {
		"OneWithSlime": (_e, _spell, data) => {
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
		"Psychokinesis": (_e, _spell, data) => {
			if (data.spell && data.spell.tags && data.failed.length > 0 && data.spell.tags.includes("telekinesis")) {
				if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax - 0.01) {
					data.failed = [];
				}
			}
		},
	},
	"calcCompPartial": {
		"OneWithSlime": (_e, _spell, data) => {
			if (data.spell && data.spell.tags && (data.failed.length > 0 || data.partial.length > 0) && (data.spell.tags.includes("slime") || data.spell.tags.includes("latex"))) {
				let tiles = KDGetEffectTiles(data.x, data.y);
				for (let t of Object.values(tiles)) {
					if (t.tags && (t.tags.includes("slime") || t.tags.includes("latex"))) {
						data.failed = [];
						data.partial = [];
						return;
					}
				}
			}
		},
		"Psychokinesis": (_e, _spell, data) => {
			if (data.spell && data.spell.tags && (data.failed.length > 0 || data.partial.length > 0) && data.spell.tags.includes("telekinesis")) {
				if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax - 0.01) {
					data.failed = [];
					data.partial = [];
				}
			}
		},
	},
	"canSprint": {
		"VaultBasic": (_e, _spell, data) => {
			if (!data.passThru && KinkyDungeonSlowLevel < 2) {
				let enemy = KinkyDungeonEntityAt(data.nextPosx, data.nextPosy);
				if (enemy && !enemy?.player && (KDIsFlying(enemy) || !KDIsImmobile(enemy))
					&& (KDIsFlying(enemy) || enemy.vulnerable || KinkyDungeonIsSlowed(enemy) || KinkyDungeonIsDisabled(enemy))) {
					data.passThru = true;
				}
			}
		},
		"Vault": (_e, _spell, data) => {
			if (!data.passThru && KinkyDungeonSlowLevel < 2) {
				let enemy = KinkyDungeonEntityAt(data.nextPosx, data.nextPosy);
				if (enemy && !enemy?.player && (KDIsFlying(enemy) || !KDIsImmobile(enemy))) {
					data.passThru = true;
				}
			}
		},
	},
	"perkOrb": {
		"Cursed": (_e, _spell, data) => {
			if (data.perks && data.perks.includes("Cursed")) {
				for (let shrine in KinkyDungeonShrineBaseCosts) {
					KinkyDungeonGoddessRep[shrine] = -25;
				}
			}
		},
	},
	"calcEdgeDrain": {
		"ChangeEdgeDrain": (e, _spell, data) => {
			data.edgeDrain *= e.mult || 1;
			data.edgeDrain += e.power || 0;
		},
	},
	"calcMaxStats": {
		"IronWill": (e, _spell, data) => {
			if (KinkyDungeonStatWill >= 9.999)
				data.staminaRate += e.power;
		},
		"SteadfastGuard": (e, _spell, _data) => {
			if (!e.power || KinkyDungeonStatWill >= e.power)
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "SteadfastGuard",
					type: "RestraintBlock",
					power: (KinkyDungeonStatWill - (e.power || 0)) * e.mult,
					duration: 2
				});
		},
		"IncreaseManaPool": (e, _spell, _data) => {
			KinkyDungeonStatManaPoolMax += e.power;
		},
	},
	"calcInvolOrgasmChance": {
		"OrgasmResist": (e, _spell, data) => {
			if (KinkyDungeonStatWill >= 0.1 && !KinkyDungeonPlayerBuffs?.d_OrgasmResist) {
				data.invol_chance *= e.power;
			}
		},
	},

	"orgasm": {
		"RestoreOrgasmMana": (e, _spell, data) => {
			//if (KinkyDungeonStatWill > 0) {
			let willPercentage = data.wpcost < 0 ? -KinkyDungeonStatWill/data.wpcost : 1.0;
			if (willPercentage > 0)
				KinkyDungeonChangeMana(0, false, e.power * willPercentage);
			KinkyDungeonChangeMana(e.power, false, 0, false, willPercentage > 0.5);
			//}
		},
		"OrgasmDamageBuff": (e, spell, data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: spell.name + "DamageBuff",
				type: "magicDamageBuff",
				power: e.power,
				duration: e.time + (data.stunTime || 0)
			});
		},
		"ChangeOrgasmStamina": (e, _spell, _data) => {
			KDGameData.OrgasmStamina *= e.mult || 1;
			KDGameData.OrgasmStamina += e.power || 0;
		},
	},
	"tryOrgasm": {
		"ChangeWPCost": (e, _spell, data) => {
			data.wpcost *= e.mult || 1;
			data.wpcost += e.power || 0;
		},
		"ChangeSPCost": (e, _spell, data) => {
			data.spcost *= e.mult || 1;
			data.spcost += e.power || 0;
		},
	},
	"deny": {
		"RestoreDenyMana": (e, _spell, data) => {
			let willPercentage = data.edgewpcost < 0 ? -KinkyDungeonStatWill/data.edgewpcost : 1.0;
			if (willPercentage > 0)
				KinkyDungeonChangeMana(0, false, e.power * willPercentage);
			KinkyDungeonChangeMana(e.power, false, 0, false, willPercentage > 0.5);
		},
	},
	"calcEfficientMana": {
		"ManaCost": (e, _item, data) => {
			data.efficiency += e.power;
		},
	},
	"calcMultMana": {
		"StaffUser1": (e, _spell, data) => {
			if (KinkyDungeonPlayerDamage && KDWeaponIsMagic({name: KinkyDungeonPlayerWeapon}))
				data.cost = Math.max(data.cost * e.power, 0);
		},
		"StaffUser3": (e, _spell, data) => {
			if (data.spell && data.spell.upcastFrom)
				data.cost = data.cost * e.power;
		},
		"TheShadowWithin": (e, _spell, data) => {
			let player = KinkyDungeonPlayerEntity;
			if (data.spell?.name == "ShadowDance")
				if (!(KinkyDungeonBrightnessGet(player.x, player.y) < KDShadowThreshold || KDNearbyEnemies(player.x, player.y, 1.5).some((en) => {return en.Enemy?.tags?.shadow;})))
					data.cost = Math.max(data.cost*e.mult);
		},
	},
	"beforeMultMana": {
		"KineticMastery": (e, _spell, data) => {
			if (data.spell?.tags?.includes(e.requiredTag) && KinkyDungeonPlayerDamage?.light) {
				data.cost = Math.max(0, data.cost*e.mult);
			}
		},
		"ManaRegen": (e, _spell, data) => {
			if (!KinkyDungeonPlayerBuffs.ManaRegenSuspend || KinkyDungeonPlayerBuffs.ManaRegenSuspend.duration < 1) {
				if (data.spell && (data.spell.active || (!data.spell.passive && !data.passive)))
					data.cost = Math.max(0, data.cost - KinkyDungeonStatManaMax*e.mult);
			}
		},
	},
	"calcMana": {
		"HeavyKinetic": (e, spell, data) => {
			if (data.spell?.name == spell?.name && KinkyDungeonPlayerDamage?.heavy && !KinkyDungeonFlags.get("KineticMastery")) {
				data.cost += e.power;
			}
		},
		"StaffUser2": (e, _spell, data) => {
			if (data.spell && !data.spell.passive && data.spell.type != 'passive')
				data.cost = Math.max(data.cost - e.power, Math.min(data.cost, 1));
		},
	},
	"afterMultMana": {
		//
	},
	"calcMiscast": {
		"DistractionCast": (_e, _spell, data) => {
			if (KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax > 0.99 || KinkyDungeonPlayerBuffs.DistractionCast) data.miscastChance -= 1.0;
		},
	},
	"duringPlayerDamage": {
		"ArcaneBarrier": (_e, _spell, _data) => {
			/*if (data.dmg > 0) {
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
			}*/
		}
	},
	"doAttackCalculation": {
		"BattleRhythm": (e, _spell, data) => {
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
						KinkyDungeonSendTextMessage(4, TextGet("KDBattleRhythmDodge"), "#aaff00", 2);
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round(efficiency*enemyPower*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
						buff.power = Math.max(0, buff.power - efficiency*enemyPower);
						if (buff.power <= 0) buff.duration = 0;
						buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					}
				}
			}
		},
	},
	"afterPlayerCast": {
		"ManaRegenSuspend": (e, _spell, data) => {
			if ((data.spell && data.spell.manacost != 0) && (!(KDEntityHasBuff(KinkyDungeonPlayerEntity, "ManaRegenSuspend", true)) || !KDHasSpell("ManaRegenPlus2"))) {
				let duration = KDHasSpell("ManaRegenFast2") ? e.time*0.375 : (KDHasSpell("ManaRegenFast") ? e.time*0.625 : e.time);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ManaRegenSuspend", type: "ManaRegenSuspend", power: 1, duration: Math.ceil(duration), aura: "#ff5555", buffSprite: true, aurasprite: "AuraX",
				});
			}
		},
		"Psychokinesis": (e, _spell, data) => {
			if (data.spell && data.spell.tags && data.spell.tags.includes("telekinesis")) {
				if (KinkyDungeoCheckComponents(data.spell, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true).failed.length > 0) {
					KinkyDungeonChangeDistraction((data.spell.manacost ? data.spell.manacost : 1) * e.mult);
				}
			}
		},
	},
	"afterSpellTrigger": {
		"ManaRegenSuspend": (e, _spell, data) => {
			if ((data.spell && !data.Passive && data.spell.manacost != 0) && (!KDEntityHasBuff(KinkyDungeonPlayerEntity, "ManaRegenSuspend") || !KDHasSpell("ManaRegenPlus2"))) {
				let duration = KDHasSpell("ManaRegenFast2") ? e.time*0.375 : (KDHasSpell("ManaRegenFast") ? e.time*0.625 : e.time);
				if (data.Toggle) duration *= 0.5;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ManaRegenSuspend", type: "ManaRegenSuspend", power: 1, duration: Math.ceil(duration), aura: "#ff5555", buffSprite: true, aurasprite: "AuraX",
				});
			}
		},
	},
	"spellTrigger": {
		"ArcaneStore": (_e, _spell, data) => {
			if (!data.spell) return;
			if (!data.castID) data.castID = KinkyDungeonGetSpellID();
			if (!data.manacost) data.manacost = KinkyDungeonGetManaCost(data.spell, data.Passive, data.Toggle);
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
		"ArcaneStore": (_e, _spell, data) => {
			if (data.spell && data.manacost > 0 && !KinkyDungeonFlags.get("ArcaneStore" + data.castID)) {
				let player = KinkyDungeonPlayerEntity;
				let mult = 0.4 * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "MultArcaneEnergy"));
				let powerAdded = data.manacost * mult;

				KDAddArcaneEnergy(player, powerAdded);

				// Set a flag to prevent duplicating this event
				KinkyDungeonSetFlag("ArcaneStore" + data.castID, 1);
			}
		},
		"ArcaneBlast": (e, _spell, data) => {
			if (data.spell && data.spell.name == "ArcaneBlast") {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "ArcaneEnergy");
				let power = KDEntityBuffedStat(player, "ArcaneEnergy");
				let efficiency = KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "EfficiencyArcaneEnergy"));
				if (power > 0 && data.bulletfired && KDGameData.AncientEnergyLevel >= (e.energyCost || 0)) {
					let damage = Math.min(KinkyDungeonStatManaMax * e.mult, power);

					data.bulletfired.bullet.damage.damage = damage;
					if (buff) {
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round(efficiency*damage*10)} ${TextGet("KDArcaneEnergy")}`, "#8888ff", KDToggles.FastFloaters ? 0.7 : 1.5);
						buff.power = Math.max(0, buff.power - efficiency*damage);
						if (buff.power <= 0) buff.duration = 0;
						buff.text = Math.round(10 * KDEntityBuffedStat(player, "ArcaneEnergy"));
					}
				}
			}
		},
		"ArrowFireSpell": (e, _spell, data) => {
			if (data.bulletfired && data.bulletfired.bullet?.spell?.tags?.some((t: string) => {return e.tags.includes(t);}) && KDGameData.AncientEnergyLevel > (e.energyCost || 0)) {
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
					if (e.addBind != undefined)
						data.bulletfired.bullet.damage.addBind = e.addBind;
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
		"ArrowVineSpell": (e, _spell, data) => {
			if (data.bulletfired && data.bulletfired.bullet?.spell?.tags?.some((t: string) => {return e.tags.includes(t);}) && KDGameData.AncientEnergyLevel > (e.energyCost || 0)) {
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
					if (e.addBind != undefined)
						data.bulletfired.bullet.damage.addBind = e.addBind;

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
		"DistractionCast": (_e, _spell, data) => {
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.99 || KinkyDungeonPlayerBuffs.DistractionCast) {
				let tb = KinkyDungeonGetManaCost(data.spell) * 0.6;
				KinkyDungeonTeaseLevelBypass += tb;
				KDGameData.OrgasmStage = Math.min((KDGameData.OrgasmStage + Math.ceil(tb)) || tb, KinkyDungeonMaxOrgasmStage);
			}
		},
		"LightningRod": (e, _spell, data) => {
			if (data.spell && data.spell.tags && data.spell.manacost > 0 && (data.spell.tags.includes("air") || data.spell.tags.includes("electric"))) {
				let bb = Object.assign({}, KDConduction);
				bb.duration = 4;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, bb);
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "LightningRod", type: "electricDamageResist", aura: "#e7cf1a", power: e.power, player: true, duration: 4,
				});
			}
		},
		"LeatherBurst": (e, _spell, data) => {
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
		"SagittaAssault": (e, _spell, data) => {
			if (data.spell && data.spell.tags && (data.spell.tags.includes("telekinesis") && data.spell.tags.includes("sagitta"))) {
				let power = KDEntityBuffedStat(KinkyDungeonPlayerEntity, "SagittaAssault");
				if (power < e.power) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "SagittaAssault", type: "SagittaAssault", aura: "#ffffff", power: power + 1, player: true, duration: 1.1, buffsprite: true,
					});
					if (power > 0)
						data.delta = 0;
				} else {
					KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "SagittaAssault");
				}
			}
		},
	},
	"calcPlayerEvasionEvent": {
		"EvasiveManeuvers": (_e, _spell, data) => {
			if (KinkyDungeonStatStamina >= KDEvasiveManeuversCost()) {
				if (data.val > -2) data.val = -2;
			}

		},
	},
	"calcEvasion": {
		"AccuracyBuff": (e, _outfit, data) => {
			if (data.enemy && data.enemy.Enemy) {
				data.hitmult *= e.power;
			}
		},
		"HandsFree": (_e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell)) && data.flags.KDEvasionHands) {
				data.flags.KDEvasionHands = false;
			}
		},
		"ArmsFree": (_e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell)) && data.flags.KDEvasionArms) {
				data.flags.KDEvasionArms = false;
			}
		},
	},
	"calcManaPool": {
		"EdgeRegenBoost": (e, _spell, data) => {
			if (KDIsEdged(KinkyDungeonPlayerEntity)) {
				data.manaPoolRegen += e.power;
			}
		},
	},
	"tick": {
		"ZeroResistance": (_e, _spell, _data) => {
			KinkyDungeonSetFlag("ZeroResistance", 2);
		},
		"ArcaneBarrier": (e, _spell, data) => {
			if (data.delta > 0) {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "ArcaneEnergy");
				let efficiency = KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(player, "EfficiencyArcaneEnergy"));

				let shieldBuff = KDEntityGetBuff(player, "ArcaneEnergyShield");
				let shieldRate = 0.1*e.power * efficiency;
				for (let i = 0; i < (e.count || 1); i++) {
					if (buff?.power > 0) {
						if (!shieldBuff) {
							shieldBuff = KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
								id: "ArcaneEnergyShield",
								type: "Shield",
								power: 0,
								duration: 9999, infinite: true,
								tags: ["shield"],
							});
						}

						if (buff && buff.power >= .1 * e.mult && shieldBuff.power < (0+0.1*KinkyDungeonStatManaMax) * (1 + KDEntityBuffedStat(player, "ArcaneBarrierShield")) && KDGameData.ShieldDamage < 1) {
							buff.power = Math.max(0, buff.power - data.delta * .1 * e.mult);
							shieldBuff.power = Math.min(KinkyDungeonStatManaMax * (0.5 + 0.5*KDEntityBuffedStat(player, "ArcaneBarrierShield")), shieldBuff.power + data.delta*shieldRate);
							if (buff.power <= 0) buff.duration = 0;
							buff.text = Math.round(10 * KDEntityBuffedStat(player, "ArcaneEnergy"));
						}
					}
				}
			}




		},
		"BattleTrance": (e, _weapon, _data) => {
			if (!KinkyDungeonAttackTwiceFlag && (!e.chance || KDRandom() < e.chance) && KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BattleRhythm") >= 0.395) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "BattleTrance",
					type: "indicate",
					power: 1,
					duration: 2,
					aura: "#ff8844",
					buffSprite: true,
				});
			}
		},
		"WizardOffhand": (_e, _spell, _data) => {
			if (!KDHasSpell("FighterOffhand")) {
				if (KDGameData.Offhand && KinkyDungeonInventoryGetWeapon(KDGameData.Offhand)) {
					let weapon = KDWeapon(KinkyDungeonInventoryGetWeapon(KDGameData.Offhand));
					if (weapon?.clumsy || weapon?.heavy || weapon?.massive)
						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
							id: "WizardOffhand",
							type: "SlowLevel",
							power: 1,
							duration: 2
						});
				}
			}
		},
		"CombatTrainingSlowResist": (_e, _spell, _data) => {
			if (KinkyDungeonStatWill >= 0.1) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "CombatTraining",
					type: "SlowLevel",
					power: -1,
					duration: 2
				});
			}
		},
		"Offhand": (_e, _spell, _data) => {
			if (KDGameData.Offhand && (
				!KinkyDungeonInventoryGetWeapon(KDGameData.Offhand)
				|| !KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(KinkyDungeonInventoryGetWeapon(KDGameData.Offhand)))
				|| !KDCanOffhand(KinkyDungeonInventoryGetWeapon(KDGameData.Offhand))
			)) {
				KDGameData.OffhandOld = KDGameData.Offhand;
				KDGameData.Offhand = "";
			}
		},
		"ArcaneEnergyBondageResist": (e, spell, _data) => {
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
		"BREvasionBlock": (e, spell, _data) => {
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
		"BRDecay": (e, _spell, data) => {
			let player = KinkyDungeonPlayerEntity;
			if (KDEntityBuffedStat(player, "BattleRhythm") > 0 && !KinkyDungeonFlags.get("PlayerCombat") && !KinkyDungeonFlags.get("BRCombat")) {
				let buff = KDEntityGetBuff(player, "BattleRhythm");
				if (buff) {
					buff.power = Math.max(0, buff.power - data.delta*e.power);
					buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round((e.power)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 0.1);
					if (buff.power == 0) buff.duration = 0;
				}
			}
		},
		"OrgasmResistBuff": (_e, _spell, _data) => {
			if (!KinkyDungeonPlayerBuffs?.d_OrgasmResist)
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
					{id: "e_OrgasmResist", aura: "#ffffff", aurasprite: "Null", type: "e_OrgasmResist", duration: 2, power: 1, buffSprite: true,
						click: "OrgasmResist",
						player: true, enemies: true}
				);
		},
		"ManaRegenOld": (e, _spell, _data) => {
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
		"SatisfiedDamageBuff": (e, spell, _data) => {
			if (KDGameData.OrgasmStamina > 0 && (!KinkyDungeonPlayerBuffs || !KinkyDungeonPlayerBuffs[spell.name + "DamageBuff"] || KinkyDungeonPlayerBuffs[spell.name + "DamageBuff"].duration == 0))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: spell.name + "DamageBuffMinor",
					type: "magicDamageBuff",
					power: e.power,
					duration: 2
				});
		},
		"RestoreEdgeMana": (e, _spell, data) => {
			if (KDIsEdged(KinkyDungeonPlayerEntity) && data.delta > 0) {
				KinkyDungeonChangeMana(e.power, true, 0, false, KinkyDungeonStatWill > 0);
				if (KinkyDungeonStatWill > 0) {
					KinkyDungeonChangeMana(0, true, e.power);
				}
			}
		},
		"Parry": (e, spell, _data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.power, duration: 2,});
			}
		},
		"WillParry": (e, spell, _data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && !KinkyDungeonPlayerDamage.light) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.mult * KinkyDungeonStatWillMax, duration: 2,});
			}
		},
		"SteelParry": (e, spell, _data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && KinkyDungeonMeleeDamageTypes.includes(KinkyDungeonPlayerDamage.type)) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.mult * KinkyDungeonStatWillMax, duration: 2,});
			}
		},
		"GuardBoost": (_e, spell, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: .15 + 0.15 * KinkyDungeonStatWill/KinkyDungeonStatWillMax, duration: 2,});
		},
		"DaggerParry": (e, spell, _data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && KinkyDungeonPlayerDamage.light) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.power, duration: 2,});
			}
		},
		"ClaymoreParry": (e, spell, _data) => {
			if (KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.noHands && KinkyDungeonPlayerDamage.heavy) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: spell.name + "Block", type: "Block", power: e.power, duration: 2,});
			}
		},
		"DistractionCast": (_e, _spell, _data) => {
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.99)
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "DistractionCast", type: "sfx", power: 1, duration: 3, sfxApply: "PowerMagic", aura: "#ff8888", aurasprite: "Heart"
				});
		},
		"Buff": (e, spell, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: (e.kind || spell.name) + e.buffType,
					type: e.buffType,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: 2
				});
		},
		"SlimeMimic": (_e, _spell, _data) => {
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
		"AccuracyBuff": (e, spell, _data) => {
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
		"Analyze": (e, spell, _data) => {
			let activate = false;
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, false)) && !KinkyDungeonPlayerBuffs.Analyze) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Analyze", buffSprite: true, aura:"#ff5555", type: "MagicalSight", power: e.power, duration: e.time});
				activate = true;
				//KDTriggerSpell(spell, data, false, false);
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
		"Blindness": (e, spell, _data) => {
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
		"FleetFooted": (e, _spell, data) => {
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
		"IcePrison": (e, _spell, data) => {
			if (data.enemy && data.froze) {
				if ((!e.chance || KDRandom() < e.chance) && KDHostile(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: "ice",
						damage: 0,
						time: 0,
						bind: data.froze + Math.max(0, (data.enemy.Enemy.maxhp* 0.2 - (data.enemy.boundLevel || 0))),
						bindType: "Ice",
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					if (KDHelpless(data.enemy) && !(data.enemy.freeze > 300)) data.enemy.freeze = 300;
				}
			}
		},
	},
	"duringCrit": {
		"RogueTargets": (e, _spell, data) => {
			if (data.dmg > 0 && data.critical && data.enemy && !data.customCrit && KDHostile(data.enemy) && !KDEnemyHasFlag(data.enemy, "RogueTarget")) {
				data.crit *= e.mult;
				data.bindcrit *= e.mult;
				KinkyDungeonSetEnemyFlag(data.enemy, "RogueTarget", -1);
				KDDamageQueue.push({floater: TextGet("KDRogueCritical"), Entity: data.enemy, Color: "#ff5555", Delay: data.Delay});
				data.customCrit = true;
			}
		},
		"RogueBind": (_e, _spell, data) => {
			if (data.dmg > 0 && data.critical && data.enemy && !data.customCrit && KDHostile(data.enemy)) {
				if (data.bind || KinkyDungeonBindingDamageTypes.includes(data.type)) {
					KDDamageQueue.push({floater: TextGet("KDBindCritical"), Entity: data.enemy, Color: "#ff55aa", Delay: data.Delay});
					data.customCrit = true;
				}

			}
		},
	},

	"beforeDamageEnemy": {

		"MultiplyDamageStealth": (e, spell, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && !data.enemy.aware && data.spell?.name == spell?.name) {
				if ((!e.humanOnly || data.enemy.Enemy.bound) && (!e.chance || KDRandom() < e.chance)) {
					data.dmg = Math.max(data.dmg * e.power, 0);
				}
			}
		},
		"Peasant": (e, _spell, data) => {
			if (data.dmg > 0 && data.enemy && data.enemy.Enemy.tags.plant) {
				data.dmg = Math.max(data.dmg * e.mult, 0);
			}
		},
		"MakeVulnerable": (e, spell, data) => {
			if (data.enemy && data.spell?.name == spell?.name) {
				if ((!e.humanOnly || data.enemy.Enemy.bound) && (!e.chance || KDRandom() < e.chance) && !data.enemy.Enemy.tags.nonvulnerable) {
					if (!data.enemy.vulnerable) data.enemy.vulnerable = 0;
					data.enemy.vulnerable = Math.max(0, e.time);
				}
			}
		},
		"TemperaturePlay": (e, _spell, data) => {
			if (data.dmg > 0 && data.enemy && KDHostile(data.enemy) && ["fire", "frost", "ice"].includes(data.type)) {
				if ((!e.humanOnly || data.enemy.Enemy.bound) && (!e.chance || KDRandom() < e.chance)) {
					let percent = Math.min(1, KDBoundEffects(data.enemy) / 4);
					data.dmg = Math.max(data.dmg * (1 + e.power * percent), 0);
				}
			}
		},
		"Burning": (e, _spell, data) => {
			if (data.enemy && (!data.flags || !data.flags.includes("BurningDamage")) && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if ((!e.chance || KDRandom() < e.chance)) {
					KinkyDungeonApplyBuffToEntity(data.enemy, KDBurning);
				}
			}
		},
	},
	"calcDamage": {
		"HandsFree": (_e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags.KDDamageHands) {
				data.flags.KDDamageHands = false;
			}
		},
		"ArmsFree": (_e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags.KDDamageArms) {
				data.flags.KDDamageArms = false;
			}
		},

		"UnconventionalWarfare": (_e, _spell, data) => {
			if (!data.IsSpell && !data.forceUse) {
				if (!KinkyDungeonCanUseWeapon(true, undefined, data.weapon)
					&& KDGameData.AttachedWep && data.weapon?.name == KDWeapon({name: KDGameData.AttachedWep})?.name
					&& (data.flags.KDDamageHands || data.flags.KDDamageArms)
					&& (!KinkyDungeonIsArmsBound(false, true) || (KinkyDungeonCanStand() && KinkyDungeonSlowLevel < 2))
					&& (!KDWeapon({name: data.weapon?.name})?.noHands)
					&& !KDWeapon({name: data.weapon?.name})?.unarmed) {
					data.canUse = true;
					data.flags.KDDamageHands = false;
					data.flags.KDDamageArms = false;
					data.accuracyMult = 0.6;
				}
			}
		},
		"GuerillaFighting": (_e, _spell, data) => {
			if (!data.IsSpell && !data.forceUse) {
				if ((!KinkyDungeonCanUseWeapon(true, undefined, data.weapon) || KinkyDungeonIsArmsBound(false, true))
					&& (KinkyDungeonGagTotal() < 0.01) && (data.flags.KDDamageHands || data.flags.KDDamageArms)
					&& (!KDWeapon({name: data.weapon?.name})?.noHands)
					&& !KDWeapon({name: data.weapon?.name})?.unarmed
					&& KDWeapon({name: data.weapon?.name})?.light) {
					data.canUse = true;
					data.flags.KDDamageHands = false;
					data.flags.KDDamageArms = false;
					data.accuracyMult = 0.75;
				}
			}
		},


	},
	"calcDamage2": {
		"FloatingWeapon": (_e, _spell, data) => {
			if (!data.IsSpell && !data.forceUse && (data.flags.KDDamageHands || data.flags.KDDamageArms)) {
				if (!KinkyDungeonCanUseWeapon(true, undefined, data.weapon)
					&& (!KDWeapon({name: data.weapon?.name})?.noHands || KDWeapon({name: data.weapon?.name}).telekinetic)
					&& !KDWeapon({name: data.weapon?.name})?.unarmed) {
					data.canUse = true;
					data.flags.KDDamageHands = false;
					data.flags.KDDamageArms = false;
					data.accuracyMult = 0;
				}
			}
		},
	},
	"getWeapon": {
		"HandsFree": (_e, spell, data) => {
			if (!data.IsSpell && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags && !data.flags.HandsFree) {
				data.flags.HandsFree = true;
			}
		},
		"UnconventionalWarfare": (_e, _spell, data) => {
			if (!data.IsSpell && KDGameData.AttachedWep && data.flags?.weapon?.name == KDWeapon({name: KDGameData.AttachedWep})?.name && !data.flags.HandsFree
				&& (!KinkyDungeonIsArmsBound(false, true) || (KinkyDungeonCanStand() && KinkyDungeonSlowLevel < 2))) {
				data.flags.HandsFree = true;
			}
		},
		"GuerillaFighting": (_e, _spell, data) => {
			if (!data.IsSpell && data.flags?.weapon && KDWeapon({name: data.flags.weapon.name})?.light && !data.flags.HandsFree
				&& (KinkyDungeonGagTotal() < 0.01)) {
				data.flags.HandsFree = true;
			}
		},
	},
	"beforePlayerAttack" : {
		"Shatter": (e, spell, data) => {
			if ((!data.bullet || e.bullet) && KinkyDungeonPlayerDamage && (KinkyDungeonPlayerDamage.name == "IceBreaker") && data.enemy && data.enemy.freeze > 0 && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true))) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, true));
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("ShatterStrike", true), undefined, undefined, undefined);
				KDTriggerSpell(spell, data, true, false);
			}
		},
		"BoostDamage": (e, spell, data) => {
			if ((!data.bullet || e.bullet) && data.eva && KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				if (KDCheckPrereq(null, e.prereq, e, data)) {
					KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
					data.buffdmg = Math.max(0, data.buffdmg + e.power);
					KDTriggerSpell(spell, data, false, true);
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
		"RogueBind": (e, _spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				data.critboost += e.power;
			}
		},
	},
	"calcCrit": {

		"BattleCrit": (e, _spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				data.critmult *= 1 + (e.mult * 100 * KDEntityBuffedStat(KinkyDungeonPlayerEntity, "BattleRhythm"));
			}
		},

		"CritBoost": (e, _spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				let power = Math.max(0, Math.max(((data.accuracy || 0) - 1)*e.power));
				data.critboost = Math.max(0, data.critboost + power);
			}
		},
		"MagicalOverload": (e, _spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				data.critmult *= 1 + (e.power * KinkyDungeonStatDistraction / 10);
			}
		},
	},
	"tickAfter": {
		"EvasiveManeuvers": (_e, spell, data) => {
			let cost = KDEvasiveManeuversCost();
			if (KinkyDungeonStatStamina >= cost) {
				if (data.delta > 0)
					KinkyDungeonChangeStamina(data.delta * (-cost), false, 1, false);
			} else {
				for (let i = 0; i < KinkyDungeonSpellChoices.length; i++) {
					if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]]?.name == spell.name) {
						KinkyDungeonSpellChoicesToggle[i] = false;
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
						KinkyDungeonSendTextMessage(10, TextGet("KDEvasiveManeuversEnd"), "#ff8933", 2);
						return;
					}
				}
			}

		},
		"CombatTrainingSlowRecovery": (_e, _spell, data) => {
			if (data.delta > 0) {
				if (KDGameData.MovePoints < 0) {
					if (!KinkyDungeonFlags.get("CombatTrainingRecov")) {
						KinkyDungeonSetFlag("CombatTrainingRecov", 2);
					} else {
						KDGameData.MovePoints = Math.min(0, KDGameData.MovePoints + 1);
						KinkyDungeonSetFlag("CombatTrainingRecov", 0);
					}
				}
			}
		},
		"Frustration": (_e, _spell, _data) => {
			for (let en of KDMapData.Entities) {
				if (en.Enemy.bound && !en.Enemy.nonHumanoid && en.buffs && KDEntityBuffedStat(en, "Chastity")) {
					if (KDHelpless(en) && !KDIsImprisoned(en)) {
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
		"BattleCost": (e, _spell, data) => {
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				data.attackCost *= Math.max(0, 1 - (e.mult * 100 * KDEntityBuffedStat(KinkyDungeonPlayerEntity, "BattleRhythm")));
			}
		},
		"BattleRhythmStore": (_e, _spell, data) => {
			let atkCost = Math.min(data.attackCost, data.attackCostOrig);
			if (data.target && -atkCost > 0 && !KinkyDungeonFlags.get("BRStore" + data.target.id)) {
				let player = KinkyDungeonPlayerEntity;
				let buff = KDEntityGetBuff(player, "BattleRhythm");
				let max = 0.4 * KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(player, "MaxBattleRhythm"));
				let mult = 0.1 * KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(player, "MultBattleRhythm"));
				let powerAdded = 0.1 * -atkCost * mult;
				if (powerAdded > 0)
					KinkyDungeonSetFlag("BRCombat", 20);
				if (!buff) {
					powerAdded = Math.min(powerAdded, max);
					KinkyDungeonApplyBuffToEntity(player,
						{
							id: "BattleRhythm",
							type: "BattleRhythm",
							aura: "#ff8933",
							aurasprite: "Null",
							buffSprite: true,
							power: powerAdded,
							duration: 9999, infinite: true,
							text: Math.round(100 * powerAdded),
						}
					);
					KinkyDungeonSendFloater(data.target, `+${Math.round(powerAdded*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
				} else {
					let origPower = buff.power;
					buff.power += powerAdded;
					buff.power = Math.min(buff.power, max);
					buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
					KinkyDungeonSendFloater(data.target, `+${Math.round((buff.power - origPower)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
				}

				// Set a flag to prevent duplicating this event
				//KinkyDungeonSetFlag("BattleRhythm" + data.castID, 1);
			}
		},
	},
	"playerAttack": {
		"FlameBlade": (_e, spell, data) => {
			if (!data.bullet && KinkyDungeonPlayerDamage && ((KinkyDungeonPlayerDamage.name && KinkyDungeonPlayerDamage.name != "Unarmed") || KinkyDungeonStatsChoice.get("Brawler")) && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.targetX && data.targetY && (data.enemy && KDHostile(data.enemy))) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
				KinkyDungeonCastSpell(data.targetX, data.targetY, KinkyDungeonFindSpell("FlameStrike", true), undefined, undefined, undefined);
				KDTriggerSpell(spell, data, false, true);
			}
		},
		"ManaRegenSuspend": (e, _spell, data) => {
			if (((!data.bullet || e.bullet) || e.bullet) && !KDHasSpell("ManaRegenPlus")) {
				let time = e.time;
				if (KDHasSpell("ManaRegenFast2")) time *= 0.375;
				else if (KDHasSpell("ManaRegenFast")) time *= 0.625;
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ManaRegenSuspend", type: "ManaRegenSuspend", power: 1, duration: Math.ceil(time), aura: "#ff5555", buffSprite: true, aurasprite: "AuraX",
				});
			}
		},
		"ElementalEffect": (e, spell, data) => {
			if ((!data.bullet || e.bullet) && KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
				KDTriggerSpell(spell, data, false, true);
				KinkyDungeonDamageEnemy(data.enemy, {
					type: e.damage,
					damage: e.power,
					time: e.time,
					bind: e.bind,
					distract: e.distract,
					bindType: e.bindType,
					addBind: e.addBind,
					bindEff: e.bindEff,
				}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity);
			}
		},
		"EffectTile": (e, spell, data) => {
			if (KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
				KDTriggerSpell(spell, data, false, true);
				KDCreateEffectTile(data.targetX, data.targetY, {
					name: e.kind,
					duration: e.duration,
				}, e.variance);
			}
		},
		"EffectTileAoE": (e, spell, data) => {
			if (KinkyDungeonHasMana(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)) && !data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
				KinkyDungeonChangeMana(-(e.cost != undefined ? e.cost : KinkyDungeonGetManaCost(spell, false, true)));
				KDTriggerSpell(spell, data, false, true);
				KDCreateAoEEffectTiles(data.targetX, data.targetY, {
					name: e.kind,
					duration: e.duration,
				}, e.variance, e.aoe);
			}
		},
		"FloatingWeapon": (_e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.targetX && data.targetY && !(data.enemy && data.enemy.Enemy && KDAllied(data.enemy))) {
				let chanceWith = KinkyDungeonPlayerDamage.chance;
				let weapon = KinkyDungeonPlayerDamage;
				let chanceWithout = KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon(true,undefined, weapon), true).chance;
				KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon(undefined, undefined, weapon));
				if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && chanceWithout < chanceWith) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
					KDTriggerSpell(spell, data, false, true);
				}
			}
		},
	},
	"beforeStruggleCalc": {


		"ModifyStruggle": (e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.escapeChance != undefined && (!e.StruggleType || e.StruggleType == data.struggleType)) {
				if (!data.query) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
					KDTriggerSpell(spell, data, false, true);
				}
				if (e.mult && data.escapeChance > 0)
					data.escapeChance *= e.mult;
				if (e.power)
					data.escapeChance += e.power;

				if (!data.query)
					if (e.msg) {
						KinkyDungeonSendTextMessage(10 * e.power, TextGet(e.msg), "lightgreen", 2);
					}
			}
		},
		"WillStruggle": (e, _spell, data) => {
			if (data.escapeChance != undefined && (!e.StruggleType || e.StruggleType == data.struggleType)) {
				if (!e.power || KinkyDungeonStatWill > e.power) {
					let boost = (KinkyDungeonStatWill - (e.power || 0)) * e.mult;
					data.escapeChance += boost;
					if (!data.query)
						if (e.msg)
							KinkyDungeonSendTextMessage(10 * boost, TextGet(e.msg).replace("AMOUNT", "" + Math.round(100*boost)), "lightgreen", 2);
				}
			}
		},
		"ProblemSolving": (e, _spell, data) => {
			if (data.escapeChance != undefined && (!e.StruggleType || e.StruggleType == data.struggleType)) {
				let boost = e.power + KDCalcRestraintBlock() * .1 * e.mult;
				data.toolBonus += boost;
				data.buffBonus += boost;
				data.struggleTime *= 3.0;
				if (!data.query)
					if (e.msg)
						KinkyDungeonSendTextMessage(10 * boost, TextGet(e.msg).replace("AMOUNT", "" + Math.round(100*boost)), "lightgreen", 2);
			}
		},


	},
	"vision": {
		"TrueSight": (_e, spell, data) => {
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.flags) {
				if (data.update > 0 || !KinkyDungeonFlags.get("truesight")) {
					KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
					KDTriggerSpell(spell, data, false, true);
					KinkyDungeonSetFlag("truesight", 1);
				}
				data.flags.SeeThroughWalls = Math.max(data.flags.SeeThroughWalls, 2);
				data.flags.visionAdjust = 0;
			}
		},
	},
	"calcVision": {
		"Multiply": (e, _spell, data) => {
			data.visionMult *= e.mult;
		},
		"Add": (e, _spell, data) => {
			data.max += e.power;
		},
	},
	"calcHearing": {
		"Multiply": (e, _spell, data) => {
			data.hearingMult *= e.mult;
		},
	},
	"draw": {
		"Offhand": (_e, _spell, _data) => {
			if (KDGameData.Offhand || KDGameData.OffhandOld) {
				// Draw the offhand weapon
				/*KDDraw(kdcanvas, kdpixisprites, "kdoffhand", KinkyDungeonRootDirectory + `Items/${KDGameData.Offhand}.png`,
					1400,
					200,
					100, 100, undefined, {
						zIndex: 5,
					});*/
				if (DrawButtonKDEx("offhandswitch", (_b) => {
					/*let dat = {};
					if (KinkyDungeonPlayerDamage) {
						if (KDCanOffhand(KinkyDungeonPlayerDamage)) {
							dat.Offhand = KinkyDungeonPlayerDamage.name;
							dat.OffhandOld = dat.Offhand;
						} else {
							dat.OffhandReturn = KinkyDungeonPlayerDamage.name;
						}
					}
					KDSendInput("switchWeapon", {
						weapon: KDGameData.Offhand || KDGameData.OffhandOld,
						GameData: dat,
						noOld: true,
					});*/
					return true;
				}, true,
				1750,
				600,
				100, 100,
				"", "#ffffff", KinkyDungeonRootDirectory + `Items/${KDWeapon({name: KDGameData.Offhand || KDGameData.OffhandOld})?.name}.png`, "", false, true,
				undefined, undefined, undefined, {tint: KDGameData.Offhand ? "#ffffff" : "#444444", scaleImage: true, zIndex: 5,
					//hotkey: KDHotkeyToText(KinkyDungeonKeySwitchWeapon[1]),
				}
				)) {
					DrawTextFitKD(KDGameData.Offhand ? TextGet("KDoffhandTooltip") : TextGet("KDoffhandOldTooltip"), 1740, 650, 600, "#ffffff", KDTextGray0, 28, "right", 10);

				}

				/*if (KDGameData.OffhandReturn && KDGameData.OffhandReturn != (KDGameData.Offhand || KDGameData.OffhandOld)) {
					// Draw the offhand weapon
					DrawButtonKDEx("offhandswitch2", (b) => {
						KDSendInput("switchWeapon", {weapon: KDGameData.OffhandReturn, noOld: true});
						return true;
					}, true,
					1400,
					300,
					100, 100,
					"", "#ffffff", KinkyDungeonRootDirectory + `Items/${KDGameData.OffhandReturn}.png`, TextGet("KDoffhand2Tooltip"), false, true,
					undefined, undefined, undefined, {scaleImage: true, zIndex: 5,
						//hotkey: KDHotkeyToText(KinkyDungeonKeySwitchWeapon[2]),
					}
					);
				}*/
			} else {
				if (DrawButtonKDEx("offhandreminder", (_b) => {

					return true;
				}, true,
				1750,
				600,
				100, 100,
				"", "#ffffff", KinkyDungeonRootDirectory + `Spells/Offhand.png`, "", false, true,
				undefined, undefined, undefined, {scaleImage: true, zIndex: 5,
					//hotkey: KDHotkeyToText(KinkyDungeonKeySwitchWeapon[1]),
				}
				)) {
					DrawTextFitKD(TextGet("KDoffhandMissingTooltip"), 1740, 650, 600, "#ffffff", KDTextGray0, 28, "right", 10);

				}
			}
		},
		"FloatingWeapon": (_e, _spell, _data) => {
			if (KinkyDungeonPlayerWeapon && !KDToggles.HideFloatingWeapon //  && !KinkyDungeonCanUseWeapon(true, undefined, KDWeapon({name: KinkyDungeonPlayerWeapon})
				&& (!KDWeapon({name: KinkyDungeonPlayerWeapon})?.noHands || KDWeapon({name: KinkyDungeonPlayerWeapon}).telekinetic)
				&& !KDWeapon({name: KinkyDungeonPlayerWeapon})?.unarmed) {
				KDDraw(kdcanvas, kdpixisprites, "kdfloatingwep", KinkyDungeonRootDirectory + `Items/${KDWeapon({name: KinkyDungeonPlayerWeapon})?.name}.png`,
					400, 300 + 50 * Math.sin(2 * Math.PI * (CommonTime() % 3000)/3000),//50,
					//400 + 50 * Math.sin(2 * Math.PI * (CommonTime() % 3000)/3000),
					200, 200, KDWeapon({name: KinkyDungeonPlayerWeapon})?.angle != undefined ? KDWeapon({name: KinkyDungeonPlayerWeapon}).angle : Math.PI/2, {
						zIndex: -1,
					}, true);
			}
		},

	},
	"getLights": {
		"Light": (e, spell, data) => {
			let activate = false;
			if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && !KinkyDungeonPlayerBuffs.Light) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Light", type: "Light", duration: e.time, aura: "#ffffff"});
				//KDTriggerSpell(spell, data, false, true);
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
		"EvasiveManeuvers": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				let cost = KDEvasiveManeuversCost();
				if (KinkyDungeonStatStamina >= cost) {
					KinkyDungeonSendTextMessage(10, TextGet("KDEvasiveManeuversStart"), "#88ff88", 2);
				} else {
					KinkyDungeonSpellChoicesToggle[data.index] = false;
					KinkyDungeonSendTextMessage(10, TextGet("KDEvasiveManeuversFail"), "#ff8933", 2);
				}
			}
		},
		"TrueSight": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonUpdateLightGrid = true;
			}
		},

		"BladeDance": (e, _b, data) => {
			// Deals damage to nearby enemies
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				let player = KinkyDungeonPlayerEntity;
				if (player && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
					let spell = KinkyDungeonFindSpell("BladeDanceBullet", true);
					if (spell) {
						KinkyDungeonCastSpell(player.x, player.y, spell, undefined, undefined, undefined);
					}

					let enemies = KDNearbyEnemies(player.x, player.y, e.dist);

					while (enemies.length > 0) {
						let en = enemies[Math.floor(KDRandom() * enemies.length)];
						if (KDHostile(en) && KinkyDungeonAggressive(en) && !KDHelpless(en) && en.hp > 0) {
							let damage = (KinkyDungeonPlayerDamage?.damage || 1) * e.power;
							KinkyDungeonDamageEnemy(en, {
								type: KinkyDungeonPlayerDamage?.type || "slash",
								damage: damage,
								time: e.time,
								bind: e.bind,
								bindType: KinkyDungeonPlayerDamage?.bindType,
								crit: KinkyDungeonPlayerDamage?.crit || KDDefaultCrit,
								bindcrit: KinkyDungeonPlayerDamage?.bindcrit || KDDefaultBindCrit,
							}, false, true, undefined, undefined, player);
							if (KDGameData.Offhand && KinkyDungeonInventoryGet(KDGameData.Offhand) && KDCanOffhand(KinkyDungeonInventoryGet(KDGameData.Offhand))) {
								let weapon = KDWeapon(KinkyDungeonInventoryGet(KDGameData.Offhand));
								if (weapon?.light) {
									damage = (weapon?.damage || 1) * e.mult;
									KinkyDungeonDamageEnemy(en, {
										type: weapon?.type || "slash",
										damage: damage,
										time: e.time,
										bind: e.bind,
										bindType: weapon?.bindType,
										crit: weapon?.crit || KDDefaultCrit,
										bindcrit: weapon?.bindcrit || KDDefaultBindCrit,
									}, false, true, undefined, undefined, player);
								}
							}
						}
						enemies.splice(enemies.indexOf(en), 1);
					}
				}
			}
		},

		"DistractionBurst": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				if (KinkyDungeonStatDistractionLower >= e.power*0.1) {
					let cost = KinkyDungeonGetManaCost(spell, false, true);
					if (KinkyDungeonHasMana(cost)) {
						let frac = 0.3;
						let amount = Math.min(KinkyDungeonStatDistractionLower, KinkyDungeonStatDistractionMax*frac);
						let desire = Math.max(0.01, -KinkyDungeonChangeDesire(-amount, false));
						if (desire > 0) {
							let nearby = KDNearbyEnemies(player.x, player.y, e.aoe);
							for (let enemy of nearby) {
								if (enemy.hp > 0 && KDHostile(enemy) && !KDHelpless(data.enemy)) {
									KinkyDungeonDamageEnemy(enemy, {
										type: e.damage,
										damage: e.power + e.mult * desire/(frac),
										time: e.time,
										crit: e.crit,
									}, true, false, spell, undefined, player);

									let sp = KinkyDungeonFindSpell("DistractionBurstBullet", true);
									if (sp) {
										KinkyDungeonCastSpell(enemy.x, enemy.y, sp, undefined, undefined, undefined);
									}

								}
							}
						}
						if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
						KDEventData.shockwaves.push({
							x: player.x,
							y: player.y,
							radius: 3,
							sprite: "Particles/ShockwaveDesire.png",
						});

						if (cost > 0)
							KinkyDungeonChangeMana(-cost, false, 0, false, true);
						KDTriggerSpell(spell, data, false, false);
						KinkyDungeonSendActionMessage(10, TextGet("KDDistractionBurst_Yes"), "#ff44ff", 2);
						KinkyDungeonAdvanceTime(1);

					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDDistractionBurst_NoMana"), "#ff8888", 2, true);
					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDDistractionBurst_No"), "#ff8888", 2, true);
				}

			}
		},

		"DistractionShield": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax) {
					let cost = KinkyDungeonGetManaCost(spell, false, true);
					if (KinkyDungeonHasMana(cost)) {
						let amount = KinkyDungeonChangeDistraction(Math.max(KinkyDungeonStatDistractionMax - KinkyDungeonStatDistraction, 0), false, e.mult);

						if (amount > 0) {
							let apply = true;
							if (KinkyDungeonPlayerBuffs.DistractionShield) {
								if (KinkyDungeonPlayerBuffs.DistractionShield.power < amount*e.power)
									KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "DistractionShield");
								else {
									apply = false;
									KinkyDungeonPlayerBuffs.DistractionShield.duration = e.time;
								}
							}
							if (apply) {
								KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
									id: "DistractionShield",
									type: "Shield",
									aura: "#ff44ff",
									buffSprite: true,
									aurasprite: "DistractionShield",
									power: amount * e.power,
									duration: e.time,
								});
							}

							KDUpdatePlayerShield();

							if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
							KDEventData.shockwaves.push({
								x: player.x,
								y: player.y,
								radius: 2,
								sprite: "Particles/ShockwaveShield.png",
							});

						}


						if (cost > 0)
							KinkyDungeonChangeMana(-cost, false, 0, false, true);
						KDTriggerSpell(spell, data, false, false);
						KinkyDungeonSendActionMessage(10, TextGet("KDDistractionShield_Yes").replace("AMNT", "" + Math.round(10 * amount*e.power)), "#ff44ff", 2);
						KinkyDungeonAdvanceTime(1);

					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDDistractionShield_NoMana"), "#ff8888", 2, true);
					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDDistractionShield_No"), "#ff8888", 2, true);
				}

			}
		},

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
						if (KinkyDungeonGetRestraint({tags: ["crystalRestraints", "crystalRestraintsHeavy"]}, KDGetEffLevel() + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
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
		"DesperateStruggle": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				if (KinkyDungeonHasWill(e.cost) && KinkyDungeonStatWill > 0.251 * KinkyDungeonStatWillMax) {
					let eligibleRestraints = [];

					for (let inv of KinkyDungeonAllRestraintDynamic()) {
						let item = inv.item;
						if (!KDGetCurse(item) && item.struggleProgress > 0 && (item.struggleProgress < 0.9 || item.tightness > 0)) {
							let struggleData: KDStruggleData = {} as KDStruggleData;
							KinkyDungeonStruggle(KDRestraint(item).Group, "Struggle", KDGetItemLinkIndex(item), true, struggleData);

							if (struggleData.escapeChance > 0) {
								eligibleRestraints.push({
									item: item,
									escapeChance: struggleData.escapeChance,
									limitChance: struggleData.limitChance,
								});
							}
						}
					}

					if (eligibleRestraints.length > 0) {
						for (let item of eligibleRestraints) {
							let inv = item.item;

							if (inv.struggleProgress < 0.9) {
								let potential = 0.08 * Math.max(0.9 - (inv.struggleProgress));
								inv.struggleProgress = Math.min(0.9, Math.max(0, inv.struggleProgress + potential * (0.5 / eligibleRestraints.length + KDRandom())));
							}

							if (inv.struggleProgress + (inv.cutProgress || 0) > 1) {
								KinkyDungeonRemoveRestraintSpecific(inv, true, false, false);
							} else
							if (inv.tightness > 0
								&& KDRandom() < Math.max(
									0.4,
									item.escapeChance* (2 - 1 / eligibleRestraints.length)) - Math.max(0, item.limitChance * ( 1 - 0.5 / eligibleRestraints.length))) {
								inv.tightness -= 1;
							}
						}


						let amnt = KinkyDungeonChangeWill(-e.cost, false, 0);
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${Math.round(amnt*10)} WP`, "#ff5555", 3);
						KinkyDungeonSendTextMessage(10, TextGet("KDDesperateStruggle_Yes"), "#ff8933", 2, true);
						KinkyDungeonMakeNoise(e.dist, player.x, player.y);
					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDDesperateStruggle_NoRestraints"), "#ff5555", 2, true);
					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDDesperateStruggle_NoWill").replace("AMNT", "" + Math.round(10*(e.cost))), "#ff5555", 2, true);
				}
			}
		},
		"Quickness": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				let cost = KinkyDungeonGetManaCost(spell, false, true);
				if (KinkyDungeoCheckComponents(spell, player.x, player.y).failed.length == 0) {
					if (KinkyDungeonHasMana(cost)) {

						KinkyDungeonApplyBuffToEntity(player, {
							id: spell.name,
							type: "Quickness",
							duration: e.time,
							power: 1,
							endSleep: true, currentCount: -1, maxCount: 3, tags: ["quickness", "move", "attack", "cast"]
						});

						KinkyDungeonSetFlag("Quickness", 1);

						if (cost > 0)
							KinkyDungeonChangeMana(-cost, false, 0, false, true);
						KDTriggerSpell(spell, data, false, false);
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${TextGet("KDQuickness_Floater")}`, "#ffff77", 3);
						KinkyDungeonSendTextMessage(10, TextGet("KDQuickness_Yes"), "#ffff77", 2, true);
					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDQuickness_NoMana"), "#ff5555", 2, true);

					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDQuickness_NoComp"), "#ff5555", 2, true);
				}


			}
		},
		"Quickness2": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				let cost = KinkyDungeonGetManaCost(spell, false, true);
				if (KinkyDungeoCheckComponents(spell, player.x, player.y).failed.length == 0) {
					if (KinkyDungeonHasMana(cost)) {
						KinkyDungeonUpdateLightGrid = true;
						KinkyDungeonApplyBuffToEntity(player, {
							id: spell.name,
							type: "TimeSlow",
							duration: e.time,
							aura: "#ffffff",
							power: e.power,
						});
						KinkyDungeonApplyBuffToEntity(player, {
							id: spell.name + "2",
							type: "StatGainStamina",
							duration: e.time,
							power: -e.mult,
						});

						KinkyDungeonSummonEnemy(player.x, player.y, "TimeGhost", Math.ceil(Math.pow(Math.max(3, cost + 4), 0.7)), 20, false, undefined, false, true, undefined, true, 12, true);

						let timeslow = KDEntityBuffedStat(KinkyDungeonPlayerEntity, "TimeSlow");
						if (timeslow <= e.power)
							KinkyDungeonSetFlag("TimeSlow", timeslow);

						if (cost > 0)
							KinkyDungeonChangeMana(-cost, false, 0, false, true);
						KDTriggerSpell(spell, data, false, false);
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `${TextGet("KD" + spell.name + "_Floater")}`, "#ffff77", 3);
						KinkyDungeonSendTextMessage(10, TextGet("KD" + spell.name + "_Yes"), "#ffff77", 2, true);
						KinkyDungeonAdvanceTime(1);
					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDQuickness_NoMana"), "#ff5555", 2, true);

					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDQuickness_NoComp"), "#ff5555", 2, true);
				}

			}
		},
		"Sonar": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				let cost = KinkyDungeonGetManaCost(spell, false, true);
				if (KinkyDungeoCheckComponents(spell, player.x, player.y).failed.length == 0) {
					if (KinkyDungeonHasMana(cost)) {
						KinkyDungeonUpdateLightGrid = true;
						if (!KDGameData.RevealedTiles) KDGameData.RevealedTiles = {};
						if (!KDGameData.RevealedFog) KDGameData.RevealedFog = {};

						let toAdd = {[player.x + ',' + player.y]: {added: false, x: player.x, y: player.y}};
						for (let i = 1; i < e.dist; i++) {
							for (let value of Object.values(toAdd)) {
								if (!value.added) {
									// We charge value added tax
									KDRevealTile(value.x, value.y, e.dist - i + e.time);
									//if (i < e.dist/2)
									//KDGameData.RevealedFog[value.x + ',' + value.y] = Math.max(1, KDGameData.RevealedFog[value.x + ',' + value.y] || 0);
									for (let x = value.x - 1; x <= value.x + 1; x++)
										for (let y = value.y - 1; y <= value.y + 1; y++) {
											if (!toAdd[x + ',' + y] && KDIsInBounds(x, y, 1) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(x, y))) {
												toAdd[x + ',' + y] = {added: false, x: x, y: y};
											}
										}
								}
							}
						}

						KinkyDungeonMakeNoise(e.dist + 1, player.x, player.y);

						if (cost > 0)
							KinkyDungeonChangeMana(-cost, false, 0, false, true);
						KDTriggerSpell(spell, data, false, true);
						KinkyDungeonSendTextMessage(10, TextGet("KD" + spell.name + "_Yes"), "#ffff77", 2, true);
						KinkyDungeonAdvanceTime(1);
					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDSonar_NoMana"), "#ff5555", 2, true);

					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDSonar_NoComp"), "#ff5555", 2, true);
				}

			}
		},
		"ToolsOfTheTrade": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				KDStartDialog("ToolsOfTheTrade");
			}
		},
		"AllyOnMe": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				for (let en of list)
					if (en && en.buffs?.AllySelect) {
						KinkyDungeonSetEnemyFlag(en, "NoFollow", 0);
					}
			}
		},
		"AllyDisperse": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				for (let en of list)
					if (en && en.buffs?.AllySelect) {
						KinkyDungeonSetEnemyFlag(en, "NoFollow", -1);
					}
			}
		},
		"AllyDefensive": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				let i = 0;
				for (let en of list)
					if (en && en.buffs?.AllySelect) {
						if (!KDEntityHasFlag(en, "Defensive") && (KDRandom() < 0.5 || i == 0)) {
							KinkyDungeonSendDialogue(en,
								TextGet("KinkyDungeonRemindJailChase" + (KDGetEnemyPlayLine(en) ? KDGetEnemyPlayLine(en) : "") + "CommandDefend")
									.replace("EnemyName", TextGet("Name" + en.Enemy.name)), KDGetColor(en),
								7, 7, false, true);
							i++;
						}
						KinkyDungeonSetEnemyFlag(en, "Defensive", -1);
					}
			}
		},
		"AllyAggressive": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				for (let en of list)
					if (en && en.buffs?.AllySelect) {
						KinkyDungeonSetEnemyFlag(en, "Defensive", 0);
					}
			}
		},
		"AllyHold": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				for (let en of list)
					if (en && en.buffs?.AllySelect) {
						KinkyDungeonSetEnemyFlag(en, "StayHere", -1);
					}
			}
		},
		"AllyCancelHold": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				for (let en of list)
					if (en && en.buffs?.AllySelect) {
						KinkyDungeonSetEnemyFlag(en, "StayHere", 0);
					}
			}
		},
		"AllyDeselectAll": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let list = KDMapData.Entities.filter((en) => {
					return KDAllied(en);
				});
				for (let en of list)
					if (en) {
						if (en.buffs?.AllySelect) KinkyDungeonExpireBuff(en, "AllySelect")
					}
			}
		},
		"Offhand": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				KDGameData.InventoryAction = "Offhand";
				KDGameData.Offhand = "";
				KDGameData.OffhandOld = "";
				KinkyDungeonDrawState = "Inventory";
				KinkyDungeonCurrentFilter = Weapon;
			}
		},
		"UnconventionalWarfare": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				KDGameData.InventoryAction = "Attach";
				KinkyDungeonDrawState = "Inventory";
				KinkyDungeonCurrentFilter = Weapon;
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Tape.ogg");
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
						KDTriggerSpell(spell, data, false, false);
					} else {
						let restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
							true, "Gold", false, false, false);

						if (restraintToAdd) {
							KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
							if (e.count > 1)
								for (let i = 1; i < (e.count || 1); i++) {
									restraintToAdd = KinkyDungeonGetRestraint({tags: ["crystalRestraints"]}, MiniGameKinkyDungeonLevel + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
										true, "Gold", false, false, false);
									if (restraintToAdd) KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
								}

							KinkyDungeonChangeMana(KinkyDungeonStatManaMax, true, 0, false, false);
							KinkyDungeonSendTextMessage(10, TextGet("KDManaRecharge_Mixed"), "#9074ab", 10);
							KDTriggerSpell(spell, data, false, false);
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
						KinkyDungeonSendTextMessage(5, TextGet("KDLimitSurge_Success"), "#ff8933", 10);
					} else {
						KinkyDungeonChangeStamina(Math.min(willPercentage, 1.0) * e.mult * KinkyDungeonStatStaminaMax);
						KDStunTurns(e.time);
						KinkyDungeonSendTextMessage(5, TextGet("KDLimitSurge_Fail"), "#ff5555", 10);
					}
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "LimitSurge",
						type: "StatGainStamina",
						aura: "#55ff55",
						//buffSprite: true,
						power: 0.3,
						duration: 20,
					});
					KDTriggerSpell(spell, data, false, false);
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDLimitSurge_No"), "#ff8933", 10);
				}
			}
		},
		"RaiseDefenses": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;
				if (KinkyDungeonStatStamina >= KinkyDungeonGetStaminaCost(spell, false, false)) {
					if (KinkyDungeonPlayerBuffs.RaiseDefenses) {
						KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "RaiseDefenses");
					}

					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: "RaiseDefenses",
						type: "Shield",
						aura: "#ffaa44",
						buffSprite: true,
						power: KinkyDungeonPlayerBlockLinear() * 10 * e.mult,
						duration: e.time,
						tags: ["attack"],
						currentCount: 0,
						maxCount: 1,

					});

					KDUpdatePlayerShield();


					KinkyDungeonChangeStamina(-KinkyDungeonGetStaminaCost(spell, false, false));
					KinkyDungeonSendTextMessage(5, TextGet("KDRaiseDefensesSuccess"), "#ff8933", 10);
					KDTriggerSpell(spell, data, false, false);
					KinkyDungeonAdvanceTime(1);
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDRaiseDefensesFail"), "#ff8933", 10);
				}
			}
		},

		"Enrage": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				if (KinkyDungeonStatStamina > KinkyDungeonGetStaminaCost(spell)) {
					if (!KinkyDungeonFlags.get("Enraged")) {
						if (KinkyDungeonGagTotal() < 0.9) {
							let buff = KDEntityGetBuff(player, "BattleRhythm");
							let max = 0.4 * KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(player, "MaxBattleRhythm"));
							KinkyDungeonMakeNoise(e.dist, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
							KinkyDungeonSetFlag("Enraged", e.time);
							KinkyDungeonChangeStamina(-KinkyDungeonGetStaminaCost(spell), false, 0, true);
							let powerAdded = 0.01 * e.power;
							if (powerAdded > 0)
								KinkyDungeonSetFlag("BRCombat", 20);
							if (!buff) {
								powerAdded = Math.min(powerAdded, max);
								KinkyDungeonApplyBuffToEntity(player,
									{
										id: "BattleRhythm",
										type: "BattleRhythm",
										aura: "#ff8933",
										aurasprite: "Null",
										buffSprite: true,
										power: powerAdded,
										duration: 9999, infinite: true,
										text: Math.round(100 * powerAdded),
									}
								);
								KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `+${Math.round(powerAdded*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
							} else {
								let origPower = buff.power;
								buff.power += powerAdded;
								buff.power = Math.min(buff.power, max);
								buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
								KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `+${Math.round((buff.power - origPower)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 1.5);
							}
							KinkyDungeonSendTextMessage(5, TextGet("KDEnrageSuccess"), "#e7cf1a", 10);
						} else {
							KinkyDungeonSendTextMessage(5, TextGet("KDEnrageFailGagged"), "#ff8933", 10);
						}


					} else {
						KinkyDungeonSendTextMessage(5, TextGet("KDEnrageFailCooldown"), "#ff8933", 10);
					}


				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDEnrageFail"), "#ff8933", 10);
				}


			}
		},
		"BreakFree": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonSpellChoicesToggle[data.index] = false;

				let player = KinkyDungeonPlayerEntity;
				if (KDEntityBuffedStat(player, "BattleRhythm") > e.cost) {
					let buff = KDEntityGetBuff(player, "BattleRhythm");
					if (buff) {
						buff.power = Math.max(0, buff.power - e.cost);
						buff.text = Math.round(100 * KDEntityBuffedStat(player, "BattleRhythm"));
						KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, `-${Math.round((e.cost)*100)} ${TextGet("KDBattleRhythm")}`, "#ff8933", 0.1);
						if (buff.power == 0) buff.duration = 0;
					}

					if (KinkyDungeonStatWill > 0) {
						if (KinkyDungeonPlayerBuffs.BreakFree) {
							KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "BreakFree");
						}

						KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
							id: "BreakFree",
							type: "BreakFree",
							aura: "#ffaa44",
							//buffSprite: true,
							power: e.power + KDCalcRestraintBlock() * 10 * e.mult,
							duration: e.time,
							events: [
								{trigger: "tick", type: "BreakFree"},
								{trigger: "beforeStruggleCalc", type: "BreakFree"},
							]

						});

						KDUpdatePlayerShield();


						KinkyDungeonChangeStamina(-KinkyDungeonGetStaminaCost(spell, false, false));
						KinkyDungeonSendTextMessage(5, TextGet("KDBreakFreeSuccess"), "#ff8933", 10);
						KDTriggerSpell(spell, data, false, false);
						KinkyDungeonAdvanceTime(1);
					} else {
						KinkyDungeonSendTextMessage(5, TextGet("KDBreakFreeFailWP"), "#ff8933", 10);
					}
				} else {
					KinkyDungeonSendTextMessage(5, TextGet("KDBreakFreeFail"), "#ff8933", 10);
				}


			}
		},

		"Light": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {

				KinkyDungeonUpdateLightGrid = true;

				if (KinkyDungeonPlayerBuffs.Light && KinkyDungeonPlayerBuffs.Light.duration > 1) {
					KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "Light");
				} else {

					if (KinkyDungeonSpellChoicesToggle[data.index]) {
						let cost = KinkyDungeonGetManaCost(spell, false, true);
						if (KinkyDungeonHasMana(cost)) {
							if (cost > 0)
								KinkyDungeonChangeMana(-cost, false, 0, false, true);
							KDTriggerSpell(spell, data, false, true);
							KinkyDungeonAdvanceTime(0, true, true);
						}
					}
				}
			}
		},
		"Analyze": (_e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				if (KinkyDungeonPlayerBuffs.Analyze && KinkyDungeonPlayerBuffs.Analyze.duration > 1) {
					KinkyDungeonExpireBuff(KinkyDungeonPlayerEntity, "Analyze");
				} else {

					if (KinkyDungeonSpellChoicesToggle[data.index]) {
						let cost = KinkyDungeonGetManaCost(spell, false, true);
						if (KinkyDungeonHasMana(cost)) {
							if (cost > 0)
								KinkyDungeonChangeMana(-cost, false, 0, false, true);
							KDTriggerSpell(spell, data, false, true);
							KinkyDungeonAdvanceTime(0, true, true);
						}
					}
				}
			}
		},
		"PassTime": (e, spell, data) => {
			if (data.spell?.name == spell?.name) {
				KinkyDungeonAdvanceTime(e.time, true, true);

			}
		},
	},
	"enemyStatusEnd": {
		"Shatter": (_e, spell, data) => {
			if (data.enemy && data.status == "freeze" && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, false, true)) && data.enemy.playerdmg && KDHostile(data.enemy) && KDistChebyshev(data.enemy.x - KinkyDungeonPlayerEntity.x, data.enemy.y - KinkyDungeonPlayerEntity.y) < 10) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, false, true));
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("ShatterStrike", true), undefined, undefined, undefined);
				//KDTriggerSpell(spell, data, false, false);
			}
		}
	},
	"kill": {
		"Sowing": (_e, _spell, data) => {
			if (data.enemy && !KDIsHumanoid(data.enemy) && data.enemy.playerdmg > 0) {
				KDCreateEffectTile(data.enemy.x, data.enemy.y, {
					name: "Vines",
					duration: 20,
				}, 10);
			}
		},
		"Shatter": (_e, spell, data) => {
			if (data.enemy && data.enemy.freeze > 0 && KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell, true)) && data.enemy.playerdmg && KDHostile(data.enemy) && KDistChebyshev(data.enemy.x - KinkyDungeonPlayerEntity.x, data.enemy.y - KinkyDungeonPlayerEntity.y) < 10) {
				KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell, true));
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, KinkyDungeonFindSpell("ShatterStrike", true), undefined, undefined, undefined);
				//KDTriggerSpell(spell, data, false, false);
			}
		},
		"ManaHarvesting": (_e, _spell, data) => {
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
 * @param Event
 * @param e
 * @param spell
 * @param data
 */
function KinkyDungeonHandleMagicEvent(Event: string, e: KinkyDungeonEvent, spell: spell, data: any) {
	if (Event === e.trigger && KDEventMapSpell[e.dynamic ? "dynamic" : Event] && KDEventMapSpell[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapSpell[e.dynamic ? "dynamic" : Event][e.type](e, spell, data);
	}
}


let KDEventMapWeapon: Record<string, Record<string, (e: KinkyDungeonEvent, weapon: weapon, data: any) => void>> = {
	"calcEvasion": {
		"IsMagic": (_e, _weapon, data) => {
			data.flags.isMagic = true;
		},
	},
	"draw": {
		"Float": (_e, _weapon, _data) => {
			if (!KDToggles.HideFloatingWeapon && KinkyDungeonCanUseWeapon(true, undefined, KDWeapon({name: KinkyDungeonPlayerWeapon}))) {
				KDDraw(kdcanvas, kdpixisprites, "kdfloatingwep", KinkyDungeonRootDirectory + `Items/${KDWeapon({name: KinkyDungeonPlayerWeapon})?.name}.png`,
					400, 300 + 50 * Math.sin(2 * Math.PI * (CommonTime() % 3000)/3000),//50,
					//400 + 50 * Math.sin(2 * Math.PI * (CommonTime() % 3000)/3000),
					200, 200, KDWeapon({name: KinkyDungeonPlayerWeapon})?.angle != undefined ? KDWeapon({name: KinkyDungeonPlayerWeapon}).angle : Math.PI/2, {
						zIndex: -1,
					}, true);
			}
		},
	},
	"dynamic": {
		"BuffSelf": (e, weapon, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: (e.kind || weapon.name) + e.buffType,
					type: e.buffType,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: e.time
				});
		},
	},
	"beforePlayerDamage": {
		"StormBreakerCharge": (e, _weapon, data) => {
			if (data.dmg > 0 && (!e.damageTrigger || e.damageTrigger == data.type)) {
				let turns = data.dmg * e.power;
				if (KinkyDungeonPlayerBuffs.StormCharge) {
					turns += KinkyDungeonPlayerBuffs.StormCharge.duration;
				}
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
						if (KinkyDungeonPlayerBuffs[weapon.name + "Charge"])
							KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration = 0;

						if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost * charge);
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
		"ShadowBleed": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.damage && data.damage.damage) {
				if (data.enemy && data.enemy.hp > 0 && !(KDHelpless(data.enemy) && data.enemy.hp < 0.6)) {
					KinkyDungeonApplyBuffToEntity(data.enemy, {
						aura: "#aa00ff",
						power: e.power,
						type: "ShadowBleed",
						id: "ShadowBleed",
						duration: e.time,
						events: [
							{trigger: 'tick', type: 'UnShadowElementalEffect', damage: e.damage, power: 0.5*e.power},
							{trigger: 'tick', type: 'ShadowElementalEffect', damage: e.damage, power: e.power, time: 2},
						]
					});
				}
			}
		},
		"DoubleStrike": (e, _weapon, data) => {
			if (!KinkyDungeonAttackTwiceFlag && (!e.chance || KDRandom() < e.chance)) {
				if (data.enemy && data.enemy.hp > 0 && !(KDHelpless(data.enemy) && data.enemy.hp < 0.6)) {
					KinkyDungeonAttackTwiceFlag = true;
					KinkyDungeonLaunchAttack(data.enemy, 1);
					KinkyDungeonAttackTwiceFlag = false;
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
				}
			}
		},
		"ConvertBindingToDamage": (e, _weapon, data) => {
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
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
				}
			}
		},
	},
	"getLights": {
		"WeaponLight": (e, _weapon, data) => {
			data.lights.push({brightness: e.power, x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y,
				color: string2hex(e.color || "#ffffff")});
		},
		"WeaponLightDirectional": (e, _weapon, data) => {
			let x = KinkyDungeonPlayerEntity.x;
			let y = KinkyDungeonPlayerEntity.y;
			let size = e.power - e.dist/2;
			for (let i = 0; i < e.dist; i++) {

				let x2 = x + KinkyDungeonPlayerEntity.facing_x_last || KinkyDungeonPlayerEntity.facing_x;
				let y2 = y + KinkyDungeonPlayerEntity.facing_y_last || KinkyDungeonPlayerEntity.facing_y;
				if (KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(x2, y2))) {
					x = x2;
					y = y2;
					size += 0.5;
				} else {
					break;
				}
			}
			data.lights.push({brightness: size, x: x, y: y, nobloom: true,
				color: string2hex(e.color || "#ffffff")});
		},

	},
	"tick": {
		"AccuracyBuff": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: (e.original || "") + weapon.name + e.type + e.trigger,
				type: "Accuracy",
				duration: 1,
				power: e.power
			});
		},
		"blockBuff": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "Block", type: "Block", power: e.power, duration: 2,});
		},
		"slowLevel": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "SlowLevel", type: "SlowLevel", power: e.power, duration: 2,});
		},
		"spellWardBuff": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "SpellResist", type: "SpellResist", power: e.power, duration: 2,});
		},
		"sneakBuff": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "Sneak", type: "SlowDetection", power: e.power, duration: 2,});
		},
		"evasionBuff": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "Evasion", type: "Evasion", power: e.power, duration: 2,});
		},
		"critBoost": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "CritBoost", type: "CritBoost", power: e.power, duration: 2,});
		},
		"critMult": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "CritMult", type: "CritMult", power: e.power, duration: 2,});
		},
		"armorBuff": (e, weapon, _data) => {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: (e.kind || weapon.name) + "Armor", type: "Armor", power: e.power, duration: 2,});
		},
		"Charge": (e, weapon, _data) => {
			if (KDGameData.AncientEnergyLevel > 0 && KDGameData.SlowMoveTurns < 1) {
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
		"Patience": (e, weapon, _data) => {
			if (KDGameData.SlowMoveTurns < 1) {
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
			if (KDGameData.SlowMoveTurns < 1 && (!e.prereq || !KDPrereqs[e.prereq] || KDPrereqs[e.prereq](player, e, data))) {
				let originalDuration = KinkyDungeonPlayerBuffs[weapon.name + "Load"]?.duration;
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
					if (originalDuration < 9000)
						KinkyDungeonInterruptSleep(); // End wait if we were reloading
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].aura = undefined;
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].duration = 9999;
				} else {
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].aura = e.color;
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].duration = 7;
					KinkyDungeonPlayerBuffs[weapon.name + "Load"].text = ">" + Math.round(e.power - currentLoad) + "<";
				}
			}
		},
		"Buff": (e, weapon, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: (e.kind || weapon.name) + (e.buffType || e.buff),
					type: e.buffType || e.buff,
					power: e.power,
					tags: e.tags,
					currentCount: e.mult ? -1 : undefined,
					maxCount: e.mult,
					duration: 2
				});
		},
		"buff": (e, weapon, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: (e.kind || weapon.name) + (e.buffType || e.buff),
					type: e.buffType || e.buff,
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
						id: (e.kind || weapon.name) + buff,
						type: buff,
						power: e.power,
						tags: e.tags,
						currentCount: e.mult ? -1 : undefined,
						maxCount: e.mult,
						duration: 2
					});
		},
		"buffmulti": (e, weapon, data) => {
			if (KDCheckPrereq(null, e.prereq, e, data))
				for (let buff of e.buffTypes)
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
						id: (e.kind || weapon.name) + buff,
						type: buff,
						power: e.power,
						tags: e.tags,
						currentCount: e.mult ? -1 : undefined,
						maxCount: e.mult,
						duration: 2
					});
		},

		"AoEDamageFrozen": (e, _weapon, _data) => {
			let trigger = false;
			for (let enemy of KDMapData.Entities) {
				if (KDHostile(enemy) && enemy.freeze > 0 && (!e.chance || KDRandom() < e.chance) && enemy.hp > 0 && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						addBind: e.addBind,
						bindType: e.bindType,
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					trigger = true;
				}
			}
			if (trigger) {
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"AoEDamageBurning": (e, _weapon, _data) => {
			let trigger = false;
			for (let enemy of KDMapData.Entities) {
				if (KDHostile(enemy)
					&& KDEntityHasBuff(enemy, "Burning")
					&& (!e.chance || KDRandom() < e.chance)
					&& enemy.hp > 0
					&& KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
						flags: ["BurningDamage"],
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					trigger = true;
				}
			}
			if (trigger) {
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"AoEDamage": (e, _weapon, _data) => {
			let trigger = false;
			for (let enemy of KDMapData.Entities) {
				if (KDHostile(enemy) && (!e.chance || KDRandom() < e.chance) && enemy.hp > 0 && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
					KinkyDungeonDamageEnemy(enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						addBind: e.addBind,
						bindType: e.bindType,
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
					trigger = true;
				}
			}
			if (trigger) {
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
	},
	"calcCrit": {
		"buffMagicCrit": (e, _weapon, data) => {
			if (!KinkyDungeonMeleeDamageTypes.includes(data.Damage?.type)) {
				data.critboost += e.power;
			}
		},
		"buffWeaponCrit": (e, _weapon, data) => {
			if (data.Damage?.name == KinkyDungeonPlayerDamage?.name) {
				data.critboost += e.power;
			}
		},
	},
	"beforePlayerAttack": {
		"ApplyBuff": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance)) {
					if (!data.enemy.buffs) data.enemy.buffs = {};
					KinkyDungeonApplyBuffToEntity(data.enemy, e.buff);
				}
			}
		},
		"KatanaBoost": (e, weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.Damage && data.Damage.damage) {
				if (data.enemy && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!e.chance || KDRandom() < e.chance) {
						let dmgMult = e.power;
						let charge = KinkyDungeonPlayerBuffs[weapon.name + "Charge"] ? KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration : 0;
						if (charge >= 9) dmgMult *= 2;
						data.Damage.damage = data.Damage.damage + dmgMult * charge;
						if (KinkyDungeonPlayerBuffs[weapon.name + "Charge"]) KinkyDungeonPlayerBuffs[weapon.name + "Charge"].duration = 0;

						if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost * charge);
						if (e.sfx && charge > 9) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"DamageMultInShadow": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.Damage && data.Damage.damage) {
				if (data.enemy && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if ((!e.chance || KDRandom() < e.chance) && (KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) <= 1.5 || KinkyDungeonBrightnessGet(data.enemy.x, data.enemy.y) <= 1.5)) {
						let dmgMult = e.power;
						data.Damage.damage = data.Damage.damage * dmgMult;

						if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
						if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"ChangeDamageUnaware": (e, _weapon, data) => {
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
		"ChangeDamageVulnerable": (e, _weapon, data) => {
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
		"DealDamageToTaped": (e, _weapon, data) => {
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
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity);
					if (e.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
				}
			}
		},
	},
	"playerAttack": {
		"ApplyTaped": (e, _weapon, data) => {
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
		"ApplyToy": (e, _weapon, data) => {
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
		"ActivateVibration": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && data.enemy.Enemy.bound && KDEnemyCanBeVibed(data.enemy) && (!e.chance || KDRandom() < e.chance)) {
					KDApplyGenBuffs(data.enemy, "Vibrate1", 90);
				}
			}
		},


		"ElementalEffectOnDisarm": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.enemy.disarm > 0) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance)
					&& data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					if (e.sfx) {
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},

		"ElementalEffectOnBarricade": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.enemy.Enemy?.tags?.barricade) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					if (e.sfx) {
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"ElementalEffectCrit": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && data.predata?.vulnerable) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					if (e.sfx) {
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"ElementalEffect": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					if (e.sfx) {
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"ElementalEffectStamCost": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy) && KinkyDungeonHasStamina(e.cost)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					KinkyDungeonChangeStamina(-e.cost);
					if (e.sfx) {
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
					}
				}
			}
		},
		"MagicRope": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0 && !KDHelpless(data.enemy)) {
					if (!KinkyDungeonHasMana(e.cost)) {
						let restrained = KDPlayerEffectRestrain(undefined, 2, ["ropeMagicWeak"], "Player", true, false, false, false, false);
						if (restrained.length > 0) {
							KinkyDungeonSendTextMessage(8, TextGet("KDMagicRopeBackfire"), "#92e8c0", 2);
						}
					}
					KinkyDungeonChangeMana(-e.cost);
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						crit: e.crit,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						bindEff: e.bindEff,
						distract: e.distract,
						desireMult: e.desireMult,
						distractEff: e.distractEff,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, e.power < 0.5, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"StormBreakerDamage": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				let enemies = KDNearbyEnemies(data.enemy.x, data.enemy.y, e.aoe);
				for (let en of enemies) {
					if (en && KDHostile(en) && (!e.chance || KDRandom() < e.chance) && en.hp > 0 && !KDHelpless(en) && KinkyDungeonPlayerBuffs.StormCharge) {
						let mult = 0.2 * Math.min(5, KinkyDungeonPlayerBuffs.StormCharge.duration);
						let damage = e.power * mult;
						KinkyDungeonDamageEnemy(en, {
							type: e.damage,
							crit: e.crit,
							damage: damage,
							time: e.time,
							bind: e.bind,
							bindEff: e.bindEff,
							distract: e.distract,
							desireMult: e.desireMult,
							distractEff: e.distractEff,
							bindType: e.bindType,
							addBind: e.addBind,
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
		"ApplyBuff": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm) {
				if (data.enemy && (!e.chance || KDRandom() < e.chance)) {
					if (!data.enemy.buffs) data.enemy.buffs = {};
					KinkyDungeonApplyBuffToEntity(data.enemy, e.buff);
				}
			}
		},
		"Cleave": (e, _weapon, data) => {
			if (data.enemy && !data.disarm) {
				let nearby = KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5);
				for (let enemy of nearby) {
					if (enemy != data.enemy && KDHostile(enemy) && !KDHelpless(data.enemy)) {
						if (KinkyDungeonEvasion(enemy)) {
							KinkyDungeonDamageEnemy(enemy, {
								type: e.damage,
								crit: e.crit,
								damage: e.power,
								time: e.time,
								bind: e.bind,
								bindEff: e.bindEff,
								distract: e.distract,
								desireMult: e.desireMult,
								distractEff: e.distractEff,
								bindType: e.bindType,
								addBind: e.addBind,
							}, false, true, undefined, undefined, KinkyDungeonPlayerEntity);
						}
					}
				}
			}
		},
		"MagicFlail": (e, _weapon, data) => {
			if (data.enemy && !data.disarm) {
				let nearby = KDNearbyEnemies(data.enemy.x, data.enemy.y, 1.5);
				for (let enemy of nearby) {
					if (KDHostile(enemy) && !KDHelpless(enemy)) {
						KinkyDungeonDamageEnemy(enemy, {
							type: e.damage,
							crit: e.crit,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							bindEff: e.bindEff,
							distract: e.distract,
							desireMult: e.desireMult,
							distractEff: e.distractEff,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, enemy != data.enemy, undefined, undefined, KinkyDungeonPlayerEntity);
					}
				}
			}
		},
		"CastSpell": (e, _weapon, data) => {
			if (data.enemy && !data.disarm && !KDHelpless(data.enemy)) {
				let spell = KinkyDungeonFindSpell(e.spell, true);
				KinkyDungeonCastSpell(data.enemy.x, data.enemy.y, spell, {
					x: KinkyDungeonPlayerEntity.x,
					y: KinkyDungeonPlayerEntity.y
				}, {x: data.enemy.x, y: data.enemy.y}, undefined);
				if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
			}
		},
		"Pierce": (e, _weapon, data) => {
			if (data.enemy && !data.disarm) {
				let dist = e.dist ? e.dist : 1;
				// Does not apply to ranged attacks
				if (KDistEuclidean(data.enemy.x - KinkyDungeonPlayerEntity.x, data.enemy.y - KinkyDungeonPlayerEntity.y) > 1.5) return;
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
		"DamageToTag": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy && data.enemy.Enemy.tags[e.requiredTag] && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"DamageToSummons": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy && data.enemy.lifetime > 0 && data.enemy.lifetime < 9999 && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: e.damage,
						damage: e.power,
						time: e.time,
						bind: e.bind,
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
					}, false, true, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
		"ElementalOnVulnerable": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nonvulnerable) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (data.enemy.vulnerable > 0) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalOnUnaware": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nobrain) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalDreamcatcher": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware && !data.enemy.Enemy.tags.nobrain) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					} else if (data.enemy.vulnerable > 0 && !data.enemy.Enemy.tags.nonvulnerable) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power * 0.5,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalUnaware": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nobrain) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (!data.enemy.aware) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"ElementalVulnerable": (e, _weapon, data) => {
			if (data.enemy && !data.miss && !data.disarm && !KDHelpless(data.enemy) && !data.enemy.Enemy.tags.nonvulnerable) {
				if (data.enemy && (!e.requiredTag || data.enemy.Enemy.tags[e.requiredTag]) && (!e.chance || KDRandom() < e.chance) && data.enemy.hp > 0) {
					if (data.enemy.vulnerable > 0) {
						KinkyDungeonDamageEnemy(data.enemy, {
							type: e.damage,
							damage: e.power,
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
						}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
					}
				}
			}
		},
		"Dreamcatcher": (e, _weapon, data) => {
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
							if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
						}
					}
				}
			}
		},
		"Knockback": (e, _weapon, data) => {
			if (e.dist && data.enemy && data.targetX && data.targetY && !data.miss && !data.disarm && !KDHelpless(data.enemy)) {
				if (data.enemy.Enemy && !data.enemy.Enemy.tags.unflinching && !data.enemy.Enemy.tags.stunresist && !data.enemy.Enemy.tags.unstoppable && !data.enemy.Enemy.tags.noknockback && !KDIsImmobile(data.enemy)) {
					let newX = data.targetX + Math.round(e.dist * (data.targetX - KinkyDungeonPlayerEntity.x));
					let newY = data.targetY + Math.round(e.dist * (data.targetY - KinkyDungeonPlayerEntity.y));
					if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
						&& (e.dist == 1 || KinkyDungeonCheckProjectileClearance(data.enemy.x, data.enemy.y, newX, newY, false))) {
						KDMoveEntity(data.enemy, newX, newY, false);
					}
				}
			}
		},
	},
	"beforeDamageEnemy": {
		"MultiplyTime": (e, _weapon, data) => {
			if (data.time > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					data.time = Math.ceil(data.time * e.power);
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
				}
			}
		},
		"MultiplyDamageFrozen": (e, _weapon, data) => {
			if (data.enemy && data.enemy.freeze > 0 && data.dmg > 0 && (!e.damage || e.damage == data.type)) {
				if (!e.chance || KDRandom() < e.chance) {
					data.dmg = Math.ceil(data.dmg * e.power);
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
				}
			}
		},
		"EchoDamage": (e, _weapon, data) => {
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
						if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
					}
				}
			}
		},
	},
	"capture": {
		"Dollmaker": (e, _weapon, data) => {
			if (data.attacker && data.attacker.player && data.enemy && !KDAllied(data.enemy)) {
				if (!e.chance || KDRandom() < e.chance) {
					let Enemy = KinkyDungeonGetEnemyByName("AllyDoll");
					let doll: entity = {
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
					if (e.energyCost) KinkyDungeonChangeCharge(- e.energyCost);
				}
			}
		},
	},
	"afterDamageEnemy": {

	},
};

/**
 * @param Event
 * @param e
 * @param weapon
 * @param data
 */
function KinkyDungeonHandleWeaponEvent(Event: string, e: KinkyDungeonEvent, weapon: weapon, data: any) {
	if (Event === e.trigger && KDEventMapWeapon[e.dynamic ? "dynamic" : Event] && KDEventMapWeapon[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapWeapon[e.dynamic ? "dynamic" : Event][e.type](e, weapon, data);
	}
}


let KDEventMapBullet: Record<string, Record<string, (e: KinkyDungeonEvent, b: any, data: any) => void>> = {
	"countRune": {
		"rune": (_e, b, data: KDRuneCountData) => {
			if (!b.source || !KinkyDungeonFindID(b.source)) {
				data.runes += 1;
				data.runeList.push(b);
			}
		}
	},
	"beforeBulletHit": {
		"DropKnife": (_e, b, _data) => {
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
	"bulletDestroy": {
		"MagicMissileChannel": (e, b, data) => {
			// If we manage to do the whole thing
			if (data.outOfTime && b.bullet?.source) {
				let enemy = KinkyDungeonFindID(b.bullet.source);
				if (enemy && KinkyDungeonCanCastSpells(enemy)) {
					// Spawn many magic missiles!

					let nearby = (e.always || enemy.aware || enemy.vp > 0.5) ?
						KDNearbyEnemies(enemy.x, enemy.y, 8, enemy) : [];

					let player = KDHostile(enemy, KDPlayer()) ? KDPlayer() : null;
					let playerdist = player ? KDistChebyshev(enemy.x - player.x, enemy.y - player.y) : 10;
					if (nearby.length > 0) {
						nearby = nearby.filter((en) => {
							return KDistChebyshev(enemy.x - en.x, enemy.y - en.y) < playerdist;
						});
						if (nearby.length > 0) {
							player = nearby[Math.floor(KDRandom() * nearby.length)];
						}
					}


					let origin = enemy;
					let spell = KinkyDungeonFindSpell(e.spell, true);
					for (let i = 0; i < (e.count || 1); i++) {
						let bb = KinkyDungeonLaunchBullet(origin.x, origin.y,
							player.x,player.y,
							0.5, {noSprite: spell.noSprite, faction: KDGetFaction(enemy), name:spell.name, block: spell.block, volatile: spell.volatile, blockType: spell.blockType,
								volatilehit: spell.volatilehit,
								width:spell.size, height:spell.size, summon:spell.summon,
								targetX: player.x, targetY: player.y, cast: spell.spellcast ? Object.assign({}, spell.spellcast) : undefined,
								source: enemy.id, dot: spell.dot,
								bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
								bulletSpin: spell.bulletSpin,
								effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
								effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
								passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
								pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
								lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: KDGetSpellRange(spell), hit:spell.onhit,
								damage: {evadeable: spell.evadeable, noblock: spell.noblock,
									ignoreshield: spell?.ignoreshield,
									shield_crit: spell?.shield_crit, // Crit thru shield
									shield_stun: spell?.shield_stun, // stun thru shield
									shield_freeze: spell?.shield_freeze, // freeze thru shield
									shield_bind: spell?.shield_bind, // bind thru shield
									shield_snare: spell?.shield_snare, // snare thru shield
									shield_slow: spell?.shield_slow, // slow thru shield
									shield_distract: spell?.shield_distract, // Distract thru shield
									shield_vuln: spell?.shield_vuln, // Vuln thru shield

									damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, desireMult: spell.desireMult, bindEff: spell.bindEff,
									bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}, false, enemy.x, enemy.y);
						bb.visual_x = origin.x;
						bb.visual_y = origin.y;
						bb.xx += (-1 + KDRandom() * 2);
						bb.yy += (-1 + KDRandom() * 2);
						bb.x = Math.round(bb.xx);
						bb.y = Math.round(bb.yy);

						let dx = bb.xx - enemy.x;
						let dy = bb.yy - enemy.y;
						bb.vx = dx * 0.8;
						bb.vy = dy * 0.8;

					}


					KinkyDungeonSetEnemyFlag(enemy, "MagicMissileChannelFinished", e.time);
				}
			}
		},
		"IceBreathChannel": (e, b, data) => {
			// If we manage to do the whole thing
			if (data.outOfTime && b.bullet?.source) {
				let enemy = KinkyDungeonFindID(b.bullet.source);
				if (enemy && KinkyDungeonCanCastSpells(enemy)) {
					// Spawn many magic missiles!
					KinkyDungeonSetEnemyFlag(enemy, "dragonChannel", e.time);
					KinkyDungeonSetEnemyFlag(enemy, "dragonChannelCD", e.time + 5);
				}
			}
		},
		"KineticLance": (_e, b, _data) => {
			if (!KinkyDungeonPlayerWeapon) return;
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
			KinkyDungeonDropItem({name: KinkyDungeonPlayerWeapon}, point, KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(point.x, point.y)), true, true);


			//We dont drop the item if we are earth magic and it was a rock
			//Yay hidden synergies
			if (KinkyDungeonPlayerWeapon != "Rock" || !KDHasSpell("ApprenticeEarth")) {
				let oldweapon = KinkyDungeonPlayerWeapon;
				if (!KDGameData.PreviousWeapon || typeof KDGameData.PreviousWeapon === 'string') KDGameData.PreviousWeapon = [];
				while (KDGameData.PreviousWeapon.length < KDMaxPreviousWeapon) {
					KDGameData.PreviousWeapon.push("Unarmed");
				}
				if (!KDGameData.PreviousWeaponLock || !KDGameData.PreviousWeaponLock[KDWeaponSwitchPref])
					KDGameData.PreviousWeapon[KDWeaponSwitchPref] = oldweapon;
				KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet(KinkyDungeonPlayerWeapon));
				KDSetWeapon("Unarmed");
				KinkyDungeonGetPlayerWeaponDamage();
			}

		},
	},
	"bulletHitEnemy": {
		"KineticLance": (e, b, data) => {
			if (b && data.enemy && !KDHelpless(data.enemy) && data.enemy.hp > 0 && KinkyDungeonPlayerDamage && !KDEnemyHasFlag(data.enemy, "KineticLanceHit")) {
				KinkyDungeonSetEnemyFlag(data.enemy, "KineticLanceHit", 1);
				let mod = (KinkyDungeonFlags.get("KineticMastery") ? 1.5 : 0) + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "KinesisBase");
				let scaling = e.mult * (KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "KinesisScale")));

				let attData: damageInfo = {
					nodisarm: true,

					nocrit: KinkyDungeonPlayerDamage.nocrit,
					noblock: KinkyDungeonPlayerDamage.noblock,
					nokill: KinkyDungeonPlayerDamage.nokill,
					evadeable: false,


					addBind: KinkyDungeonPlayerDamage.addBind,
					bindcrit: KinkyDungeonPlayerDamage.bindcrit,
					crit: KinkyDungeonPlayerDamage.crit,
					sfx: KinkyDungeonPlayerDamage.sfx,
					time: KinkyDungeonPlayerDamage.time,

					damage: e.power + mod + KinkyDungeonPlayerDamage.damage * scaling,
					type: KinkyDungeonPlayerDamage.type,
					distract: KinkyDungeonPlayerDamage.distract,
					distractEff: KinkyDungeonPlayerDamage.distractEff,
					desireMult: KinkyDungeonPlayerDamage.desireMult,
					bind: KinkyDungeonPlayerDamage.bind,
					bindType: KinkyDungeonPlayerDamage.bindType,
					bindEff: KinkyDungeonPlayerDamage.bindEff,
					ignoreshield: KinkyDungeonPlayerDamage.ignoreshield,
					shield_crit: KinkyDungeonPlayerDamage.shield_crit, // Crit thru shield
					shield_stun: KinkyDungeonPlayerDamage.shield_stun, // stun thru shield
					shield_freeze: KinkyDungeonPlayerDamage.shield_freeze, // freeze thru shield
					shield_bind: KinkyDungeonPlayerDamage.shield_bind, // bind thru shield
					shield_snare: KinkyDungeonPlayerDamage.shield_snare, // snare thru shield
					shield_slow: KinkyDungeonPlayerDamage.shield_slow, // slow thru shield
					shield_distract: KinkyDungeonPlayerDamage.shield_distract, // Distract thru shield
					shield_vuln: KinkyDungeonPlayerDamage.shield_vuln, // Vuln thru shield
					boundBonus: KinkyDungeonPlayerDamage.boundBonus,
					novulnerable: KinkyDungeonPlayerDamage.novulnerable,
					tease: KinkyDungeonPlayerDamage.tease}

				if (KinkyDungeonPlayerDamage.stam50mult && KinkyDungeonStatMana/KinkyDungeonStatManaMax >= 0.50) {
					attData.damage *= KinkyDungeonPlayerDamage.stam50mult;
				}
				let dd = {
					target: data.enemy,
					attackCost: 0.0, // Important
					attackCostOrig: 0.0,
					skipTurn: false,
					spellAttack: true,
					attackData: attData
				};
				KinkyDungeonSendEvent("beforePlayerLaunchAttack", dd);

				KinkyDungeonAttackEnemy(data.enemy, dd.attackData, Math.max(2.0, 2 * KinkyDungeonGetEvasion(undefined, false, true, true)));
			}
		},

		"Sagitta": (e, b, data) => {
			if (b && data.enemy && !KDHelpless(data.enemy) && data.enemy.hp > 0 && KinkyDungeonPlayerDamage) {
				let scaling = e.mult * (KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "KinesisScale")));
				let mod = (KinkyDungeonFlags.get("KineticMastery") ? 1.5 : 0) + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "KinesisBase");

				let attData: damageInfo = {
					nodisarm: true,

					nocrit: KinkyDungeonPlayerDamage.nocrit,
					noblock: KinkyDungeonPlayerDamage.noblock,
					nokill: KinkyDungeonPlayerDamage.nokill,
					evadeable: false,

					addBind: KinkyDungeonPlayerDamage.addBind,
					bindcrit: KinkyDungeonPlayerDamage.bindcrit,
					crit: KinkyDungeonPlayerDamage.crit,
					sfx: KinkyDungeonPlayerDamage.sfx,
					time: KinkyDungeonPlayerDamage.time,

					damage: e.power + mod + KinkyDungeonPlayerDamage.damage * scaling,
					type: KinkyDungeonPlayerDamage.type,
					distract: KinkyDungeonPlayerDamage.distract,
					distractEff: KinkyDungeonPlayerDamage.distractEff,
					desireMult: KinkyDungeonPlayerDamage.desireMult,
					bind: KinkyDungeonPlayerDamage.bind,
					bindType: KinkyDungeonPlayerDamage.bindType,
					bindEff: KinkyDungeonPlayerDamage.bindEff,
					ignoreshield: KinkyDungeonPlayerDamage.ignoreshield,
					shield_crit: KinkyDungeonPlayerDamage.shield_crit, // Crit thru shield
					shield_stun: KinkyDungeonPlayerDamage.shield_stun, // stun thru shield
					shield_freeze: KinkyDungeonPlayerDamage.shield_freeze, // freeze thru shield
					shield_bind: KinkyDungeonPlayerDamage.shield_bind, // bind thru shield
					shield_snare: KinkyDungeonPlayerDamage.shield_snare, // snare thru shield
					shield_slow: KinkyDungeonPlayerDamage.shield_slow, // slow thru shield
					shield_distract: KinkyDungeonPlayerDamage.shield_distract, // Distract thru shield
					shield_vuln: KinkyDungeonPlayerDamage.shield_vuln, // Vuln thru shield
					boundBonus: KinkyDungeonPlayerDamage.boundBonus,
					novulnerable: KinkyDungeonPlayerDamage.novulnerable,
					tease: KinkyDungeonPlayerDamage.tease};

				if (KinkyDungeonPlayerDamage.stam50mult && KinkyDungeonStatMana/KinkyDungeonStatManaMax >= 0.50) {
					attData.damage *= KinkyDungeonPlayerDamage.stam50mult;
				}
				let dd = {
					target: data.enemy,
					attackCost: 0.0, // Important
					attackCostOrig: 0.0,
					skipTurn: false,
					spellAttack: true,
					attackData: attData
				};
				KinkyDungeonSendEvent("beforePlayerLaunchAttack", dd);

				KinkyDungeonAttackEnemy(data.enemy, dd.attackData, Math.max(0.8, 0.8 * KinkyDungeonGetEvasion(undefined, false, true, true)), b);
			}
		},
		"Arrow": (e, b, data) => {
			if (b && data.enemy && !KDHelpless(data.enemy) && data.enemy.hp > 0 && b.bullet?.damage) {
				let scaling = (e.mult || 1) * (KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ArrowDamage")));
				let dd = {
					target: data.enemy,
					attackCost: 0.0, // Important
					attackCostOrig: 0.0,
					skipTurn: false,
					spellAttack: true,
					attackData: Object.assign({}, b.bullet.damage),
				};
				dd.attackData.damage *= scaling;
				dd.attackData.nodisarm = true;
				KinkyDungeonSendEvent("beforePlayerLaunchAttack", dd);

				KinkyDungeonAttackEnemy(data.enemy, dd.attackData, Math.max(1, KinkyDungeonGetEvasion(undefined, false, true, false)), b);
			}
		},
		"Blaster": (e, b, data) => {
			if (b && data.enemy && !KDHelpless(data.enemy) && data.enemy.hp > 0 && b.bullet?.damage) {
				let scaling = (e.mult || 1) * (KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BlasterDamage")));
				let dd = {
					target: data.enemy,
					attackCost: 0.0, // Important
					attackCostOrig: 0.0,
					skipTurn: false,
					spellAttack: true,
					attackData: Object.assign({}, b.bullet.damage),
				};
				dd.attackData.damage *= scaling;
				dd.attackData.nodisarm = true;
				KinkyDungeonSendEvent("beforePlayerLaunchAttack", dd);

				KinkyDungeonAttackEnemy(data.enemy, dd.attackData, Math.max(1, KinkyDungeonGetEvasion(undefined, false, true, false)), b);
			}
		},
		"ShadowSlash": (_e, b, data) => {
			if (b && !b.shadowBuff && data.enemy && KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) < KDShadowThreshold) {
				b.shadowBuff = true;
				if (b.bullet?.damage?.damage) b.bullet.damage.damage *= 1.5;
			}
		},
		"BreakArmor": (e, b, data) => {
			if (b && data.enemy) {
				KinkyDungeonApplyBuffToEntity(data.enemy,
					{id: "ExplosiveBreak", type: "ArmorBreak", duration: e.duration || 80, power: -e.power, player: true, enemies: true, tags: ["debuff", "armor"]});
			}
		},

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
						&& (e.dist == 1 || KinkyDungeonCheckProjectileClearance(data.enemy.x, data.enemy.y, newX, newY, false))) {
							KDMoveEntity(data.enemy, newX, newY, false);
						}
					}

				}
			}
		},
		"GreaterRage": (_e, b, data) => {
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
					distract: e.distract,
					bindType: e.bindType,
					addBind: e.addBind,
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
							time: e.time,
							bind: e.bind,
							distract: e.distract,
							bindType: e.bindType,
							addBind: e.addBind,
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
		"BlindAll": (e, b, data) => {
			if (b && data.enemy) {
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
		"RemoveBlock": (e, b, data) => {
			if (b && data.enemy && data.enemy.blocks > 0) {
				if (!e.prereq || KDCheckPrereq(data.enemy, e.prereq)) {
					KinkyDungeonApplyBuffToEntity(data.enemy, {
						id: "RemoveBlock",
						power: -e.power,
						duration: e.time || 10,
						type: "MaxBlock",
						events: [
							{type: "ExtendDisabledOrHelpless", trigger: "tick"},
						],
					});
				}
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
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
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
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
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
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
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
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
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
						distract: e.distract,
						bindType: e.bindType,
						addBind: e.addBind,
					}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
				}
			}
		},

		"EnchantRope": (_e, b, data) => {
			if (b && data.enemy) {
				if (data.enemy.specialBoundLevel?.Rope) {
					KDTieUpEnemy(data.enemy, data.enemy.specialBoundLevel.Rope, "MagicRope", "arcane", true);
					data.enemy.boundLevel -= data.enemy.specialBoundLevel.Rope;
					delete data.enemy.specialBoundLevel.Rope;
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
					distract: e.distract,
					bindType: e.bindType,
					addBind: e.addBind,
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
						addBind: e.addBind,
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
					distract: e.distract,
					addBind: e.addBind,
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
					distract: e.distract,
					addBind: e.addBind,
					bindType: e.bindType,
				}, true, (b.bullet.NoMsg || e.power == 0), b.bullet.spell, b, undefined, b.delay, true);
			}
		},
	},
	"bulletTick": {

		"EndChance": (e, b, _data) => {
			if (b.time < e.count)
				if (KDRandom() < e.chance) {
					b.time = 0;
				}
		},
		"CreateSmoke": (e, b, _data) => {
			KDCreateAoEEffectTiles(b.x, b.y,  {
				name: e.kind || "Smoke",
				duration: e.time || 10,
			}, 3, e.aoe || 1.5, undefined, e.chance || 0.5);
		},
		"MagicMissileChannel": (_e, b, _data) => {
			if (b.bullet?.source) {
				let enemy = KinkyDungeonFindID(b.bullet.source);
				if (enemy) {
					if (KinkyDungeonCanCastSpells(enemy)) {
						KinkyDungeonSetEnemyFlag(enemy, "nocast", 2);
						KinkyDungeonApplyBuffToEntity(enemy, {id: "ChannelSlow", type: "MoveSpeed", duration: 1, power: -1, tags: ["speed"]});
						b.x = enemy.x;
						b.y = enemy.y;
						b.xx = enemy.x;
						b.yy = enemy.y;
						return; // Dont cancel the bullet
					}
				}
			}
			let ind = KDMapData.Bullets.indexOf(b);
			if (ind > -1)
				KDMapData.Bullets.splice(ind, 1);
			KinkyDungeonBulletsID[b.spriteID] = null;
			KinkyDungeonUpdateSingleBulletVisual(b, true, 0);
			KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:false, outOfTime: false});
		},
		"FlashPortal": (e, _b, _data) => {
			let player = KinkyDungeonPlayerEntity;
			if (player) {
				let enemies = KDNearbyEnemies(player.x, player.y, e.dist);
				if (enemies.length > 0) {
					for (let en of enemies) {
						if (en.hp > 0 && !KDIsImmobile(en, true)) {
							KinkyDungeonApplyBuffToEntity(en, {
								id: "FlashPortal",
								aura: "#92e8c0",
								type: "Marker",
								duration: 1,
								power: 1,
							});
						}
					}
				}
			}
		},
		"TransportationPortal": (e, _b, _data) => {
			let player = KinkyDungeonPlayerEntity;
			if (player) {
				let enemies = KDNearbyEnemies(player.x, player.y, e.dist);
				if (enemies.length > 0) {
					for (let en of enemies) {
						if (en.hp > 0 && KDAllied(en) && !KDIsImmobile(en, true)) {
							KinkyDungeonApplyBuffToEntity(en, {
								id: "TransportationPortal",
								aura: "#92e8c0",
								type: "Marker",
								duration: 1,
								power: 1,
							});
						}
					}
				}
			}
		},
		"BanishPortal": (e, _b, _data) => {
			let player = KinkyDungeonPlayerEntity;
			if (player) {
				let enemies = KDNearbyEnemies(player.x, player.y, e.dist);
				if (enemies.length > 0) {
					for (let en of enemies) {
						if (en.hp > 0 && (!KDAllied(en) || KinkyDungeonAggressive(en)) && !KDIsImmobile(en, true)) {
							KinkyDungeonApplyBuffToEntity(en, {
								id: "BanishPortal",
								aura: "#92e8c0",
								type: "Marker",
								duration: 1,
								power: 1,
							});
						}
					}
				}
			}
		},
		"ZoneOfPurity": (e, b, _data) => {
			let enemies = KDNearbyEnemies(b.x, b.y, e.aoe);
			if (enemies.length > 0) {
				for (let en of enemies) {
					if (en && en.Enemy.bound && en.boundLevel > e.power) {
						KinkyDungeonApplyBuffToEntity(en, KDChastity);
					}
				}
			}
			if (KDistEuclidean(KinkyDungeonPlayerEntity.x - b.x, KinkyDungeonPlayerEntity.y - b.y) <= e.aoe) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["magicBeltForced"]}, MiniGameKinkyDungeonLevel + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
				if (restraintAdd) {
					KinkyDungeonSendActionMessage(3, TextGet("KDZoneOfPuritySelf"), "#88AAFF", 2);
					KinkyDungeonAddRestraintIfWeaker(restraintAdd, 0, false, undefined, false, false, undefined, "Divine");
				}
			}
		},
		"ZoneOfExcitement": (e, b, _data) => {
			let enemies = KDNearbyEnemies(b.x, b.y, e.aoe);
			if (enemies.length > 0) {
				for (let en of enemies) {
					if (en && en.Enemy.bound) {
						KinkyDungeonApplyBuffToEntity(en, KDToy);
					}
				}
			}
			if (KDistChebyshev(KinkyDungeonPlayerEntity.x - b.x, KinkyDungeonPlayerEntity.y - b.y) <= e.aoe) {
				let restraintAdd = KinkyDungeonGetRestraint({tags: ["genericToys"]}, MiniGameKinkyDungeonLevel + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint));
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
	"afterBulletHit": {
		"ShadowShroudTele": (e, b, _data) => {
			let enemy = b.bullet?.source > 0 ? KinkyDungeonFindID(b.bullet.source) : null;
			if (!enemy) return;
			if (enemy.attackPoints > 0) return;
			let target = null;
			if (b.bullet.faction) {
				let minDist = 1000;
				let entity = null;
				let playerDist = 1000;
				if (KDFactionHostile(b.bullet.faction, "Player")) {
					playerDist = KDistEuclidean(KinkyDungeonPlayerEntity.x - b.bullet.targetX, KinkyDungeonPlayerEntity.y - b.bullet.targetY);
					if (playerDist <= e.aoe) {
						entity = KinkyDungeonPlayerEntity;
						minDist = playerDist;
					}
				}

				let enemies = KDNearbyEnemies(b.bullet.targetX, b.bullet.targetY, e.aoe);
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
					target = entity;
				}
			}

			if (!target) return;

			let bullets = KDMapData.Bullets.filter((bb) => {return bb.bullet?.spell?.name == "ShadowShroud";});
			let nearest = null;
			let nearestDist = 100;
			for (let bb of bullets) {
				if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(bb.x, bb.y))) {
					let dist = KDistEuclidean(b.x - bb.x, b.y - bb.y);
					let distplayer = KDistEuclidean(target.x - bb.x, target.y - bb.y);
					if (dist <= e.aoe && distplayer < nearestDist
						&& distplayer < KDistEuclidean(target.x - enemy.x, target.y - enemy.y)) {
						nearestDist = distplayer;
						nearest = bb;
					}
				}
			}

			if (nearest) {
				let tdata = {
					x: nearest.x,
					y: nearest.y,
					cancel: false,
					entity: enemy,
					willing: true,
				};
				KinkyDungeonSendEvent("beforeTeleport", tdata);
				if (tdata.cancel) {
					KDMoveEntity(enemy, nearest.x, nearest.y, true);
				}
				KinkyDungeonSendTextMessage(5, TextGet("KDDragonTeleport"), "#814fb8", 1);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Teleport.ogg", enemy);
			}

		},

		"DarkTele": (e, b, _data) => {
			let enemy = b.bullet?.source > 0 ? KinkyDungeonFindID(b.bullet.source) : null;
			if (!enemy) return;
			if (enemy.attackPoints > 0) return;
			let target = null;
			if (b.bullet.faction) {
				let minDist = 1000;
				let entity = null;
				let playerDist = 1000;
				if (KDFactionHostile(b.bullet.faction, "Player")) {
					playerDist = KDistEuclidean(KinkyDungeonPlayerEntity.x - b.bullet.targetX, KinkyDungeonPlayerEntity.y - b.bullet.targetY);
					if (playerDist <= e.aoe) {
						entity = KinkyDungeonPlayerEntity;
						minDist = playerDist;
					}
				}

				let enemies = KDNearbyEnemies(b.bullet.targetX, b.bullet.targetY, e.aoe);
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
					target = entity;
				}
			}

			if (!target) return;

			let point = {
				x: b.x + (target.player ? -target.facing_x : (target.x - target.fx)),
				y: b.y + (target.player ? -target.facing_y : (target.y - target.fy)),
			};
			if (KDistChebyshev(enemy.x - point.x, enemy.y - point.y) > 1.5
				&& KinkyDungeonBrightnessGet(point.x, point.y) <= KDShadowThreshold*2
				&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(point.x, point.y))
				&& !KinkyDungeonEntityAt(point.x, point.y)) {
				let tdata = {
					x: point.x,
					y: point.y,
					cancel: false,
					entity: enemy,
					willing: true,
				};
				KinkyDungeonSendEvent("beforeTeleport", tdata);
				if (tdata.cancel) {
					KDMoveEntity(enemy, point.x, point.y, true);
					//KinkyDungeonSendTextMessage(5, TextGet("KDDragonTeleport"), "#814fb8", 1);
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Teleport.ogg", enemy);
					if (KDRandom() < 0.4)
						KinkyDungeonSendDialogue(
							enemy,
							TextGet("KDTeleportsBehindYou" + Math.floor(KDRandom() * 3)),
							KDGetColor(enemy),
							4,
							10,
						);
					let spell = KinkyDungeonFindSpell("Summon", true);
					if (spell) {
						KinkyDungeonCastSpell(point.x, point.y, spell, undefined, undefined, undefined);
					}
				}
			}

		},

		"CrystalBolt": (_e, b, _data) => {
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
			if (point) {
				let en = KinkyDungeonSummonEnemy(point.x, point.y, "ChaoticCrystal", 1, 0.5);
				if (en.length > 0) {
					en[0].lifetime = 12;
					en[0].maxlifetime = 12;
					en[0].faction = b.bullet?.faction;
				}
			}

		},
		"CrystalShockBolt": (e, b, _data) => {
			// Create the shockwave
			let rad = e.dist;
			let conductionPoints = {};

			let bb = {x: b.x, y: b.y};
			if (!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(bb.x, bb.y))) {
				if (b.vx || b.vy) {
					let speed = KDistEuclidean(b.vx, b.vy);
					if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(Math.round(b.x - b.vx / speed), Math.round(b.y - b.vy / speed)))) {
						bb = {x: Math.round(b.x - b.vx / speed), y: Math.round(b.y - b.vy / speed)};
					}
					else if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(Math.floor(b.x - b.vx / speed), Math.floor(b.y - b.vy / speed)))) {
						bb = {x: Math.floor(b.x - b.vx / speed), y: Math.floor(b.y - b.vy / speed)};
					}
					else {
						bb = {x: Math.ceil(b.x - b.vx / speed), y: Math.ceil(b.y - b.vy / speed)};
					}
				}
			}


			conductionPoints[bb.x + ',' + bb.y] = true;


			for (let i = 0; i < rad; i++) {
				for (let x = -Math.ceil(i); x < Math.ceil(i); x++) {
					for (let y = -Math.ceil(i); y < Math.ceil(i); y++) {
						let dist = KDistEuclidean(x, y);
						if (dist >= i-0.99 && dist <= i+0.99) { // A ring
							let point = {x: bb.x + x, y: bb.y + y};
							if (
								!conductionPoints[(point.x) + ',' + (point.y)]
								&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(point.x, point.y))
								&& (conductionPoints[(point.x + 1) + ',' + (point.y)]
								|| conductionPoints[(point.x - 1) + ',' + (point.y)]
								|| conductionPoints[(point.x) + ',' + (point.y + 1)]
								|| conductionPoints[(point.x) + ',' + (point.y - 1)]
								|| conductionPoints[(point.x + 1) + ',' + (point.y + 1)]
								|| conductionPoints[(point.x - 1) + ',' + (point.y + 1)]
								|| conductionPoints[(point.x + 1) + ',' + (point.y - 1)]
								|| conductionPoints[(point.x - 1) + ',' + (point.y - 1)])
							) {
								// Create it and set the delay!
								conductionPoints[point.x + ',' + point.y] = true;
								let ddata = KinkyDungeonCastSpell(point.x, point.y, KinkyDungeonFindSpell("CrystalShock", true), undefined, undefined, b, b.faction || b.bullet?.faction)?.data;
								if (ddata.bulletfired) {
									ddata.bulletfired.bullet.lifetime = i;
									ddata.bulletfired.time = i;
								}
							}
						}
					}
				}
			}
		},
		"Phase": (_e, _b, _data) => {
			let player = KinkyDungeonPlayerEntity;
			if (player) {
				KinkyDungeonApplyBuffToEntity(player, {
					id: "PhaseEvasion",
					type: "Evasion",
					power: 0.5,
					duration: 3,
					aura: "#ffffff",
				});
			}
		},
		"Crack": (_e, b, data) => {
			KDCrackTile(b.x, b.y, data.allowCrack, data);
		},
		"BladeDance": (e, _b, data) => {
			// Deals damage to nearby enemies
			if (!e.prereq || KDCheckPrereq(null, e.prereq, e, data)) {
				let player = KinkyDungeonPlayerEntity;
				if (player && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
					let spell = KinkyDungeonFindSpell("BladeDanceBullet", true);
					if (spell) {
						KinkyDungeonCastSpell(player.x, player.y, spell, undefined, undefined, undefined);
					}

					let enemies = KDNearbyEnemies(player.x, player.y, e.dist);

					while (enemies.length > 0) {
						let en = enemies[Math.floor(KDRandom() * enemies.length)];
						if (KDHostile(en) && KinkyDungeonAggressive(en) && !KDHelpless(en) && en.hp > 0) {
							let damage = (KinkyDungeonPlayerDamage?.damage || 1) * e.power;
							KinkyDungeonDamageEnemy(en, {
								type: KinkyDungeonPlayerDamage?.type || "slash",
								damage: damage,
								time: e.time,
								bind: e.bind,
								bindType: KinkyDungeonPlayerDamage?.bindType,
								crit: KinkyDungeonPlayerDamage?.crit || KDDefaultCrit,
								bindcrit: KinkyDungeonPlayerDamage?.bindcrit || KDDefaultBindCrit,
							}, false, true, undefined, undefined, player);
							if (KDGameData.Offhand && KinkyDungeonInventoryGet(KDGameData.Offhand) && KDCanOffhand(KinkyDungeonInventoryGet(KDGameData.Offhand))) {
								let weapon = KDWeapon(KinkyDungeonInventoryGet(KDGameData.Offhand));
								if (weapon?.light) {
									damage = (weapon?.damage || 1) * e.mult;
									KinkyDungeonDamageEnemy(en, {
										type: weapon?.type || "slash",
										damage: damage,
										time: e.time,
										bind: e.bind,
										bindType: weapon?.bindType,
										crit: weapon?.crit || KDDefaultCrit,
										bindcrit: weapon?.bindcrit || KDDefaultBindCrit,
									}, false, true, undefined, undefined, player);
								}
							}
						}
						enemies.splice(enemies.indexOf(en), 1);
					}
				}
			}
		},
		"FlashPortal": (_e, _b, _data) => {
			let player = KinkyDungeonPlayerEntity;
			if (player) {
				let enemies = KDMapData.Entities.filter((en) => {
					return en.buffs?.FlashPortal?.duration > 0;
				});

				while (enemies.length > 0) {
					let en = enemies[Math.floor(KDRandom() * enemies.length)];
					let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true, undefined, false, true);
					if (point) {
						let tdata = {
							x: point.x,
							y: point.y,
							cancel: false,
							entity: en,
							willing: false,
						};
						KinkyDungeonSendEvent("beforeTeleport", tdata);

						if (!tdata.cancel) {
							KDMoveEntity(en, point.x, point.y, false, false, true);
						}
					}
					enemies.splice(enemies.indexOf(en), 1);
				}
			}
		},
		"TransportationPortal": (_e, _b, _data) => {
			let player = KinkyDungeonPlayerEntity;
			if (player) {
				let enemies = KDMapData.Entities.filter((en) => {
					return en.buffs?.TransportationPortal?.duration > 0;
				});

				while (enemies.length > 0) {
					let en = enemies[Math.floor(KDRandom() * enemies.length)];
					let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true, undefined, false, true);
					if (point) {
						let tdata = {
							x: point.x,
							y: point.y,
							cancel: false,
							entity: en,
							willing: false,
						};
						KinkyDungeonSendEvent("beforeTeleport", tdata);
						if (tdata.cancel) {
							KDMoveEntity(en, point.x, point.y, false, false, true);
							en.teleporting = Math.max(en.teleporting || 0, 4);
							en.teleportingmax = Math.max(en.teleportingmax || 0, 4);
						}
					}
					enemies.splice(enemies.indexOf(en), 1);
				}
			}
		},
		"BanishPortal": (_e, b, _data) => {
			let player = b;
			if (player) {
				let enemies = KDMapData.Entities.filter((en) => {
					return en.buffs?.BanishPortal?.duration > 0;
				});

				while (enemies.length > 0) {
					let en = enemies[Math.floor(KDRandom() * enemies.length)];
					let point = KinkyDungeonGetNearbyPoint(player.x, player.y, true, undefined, false, true);
					if (point) {
						let tdata = {
							x: point.x,
							y: point.y,
							cancel: false,
							entity: en,
							willing: false,
						};
						KinkyDungeonSendEvent("beforeTeleport", tdata);
						if (tdata.cancel) {
							KDMoveEntity(en, point.x, point.y, false, false, true);
							en.teleporting = Math.max(en.teleporting || 0, 1);
							en.teleportingmax = Math.max(en.teleportingmax || 0, 1);
						}
					}
					enemies.splice(enemies.indexOf(en), 1);
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
						playerDist = KDistEuclidean(KDPlayer().x - b.bullet.targetX, KDPlayer().y - b.bullet.targetY);
						if (playerDist <= e.dist) {
							entity = KDPlayer();
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
						} else if (b.bullet.targetY < entity.y) {
							b.bullet.targetY = Math.min(entity.y, b.bullet.targetY + data.delta * e.power);
						}
					}
				}
				let speed = KDistEuclidean(b.vx, b.vy);

				// Missile tracking
				let direction = Math.atan2(b.bullet.targetY - b.y, b.bullet.targetX - b.x);
				let vx = Math.cos(direction) * Math.max(e.power, speed);
				let vy = Math.sin(direction) * Math.max(e.power, speed);
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
					speed = KDistEuclidean(b.vx, b.vy);
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
 * @param Event
 * @param e
 * @param b
 * @param data
 */
function KinkyDungeonHandleBulletEvent(Event: string, e: KinkyDungeonEvent, b: any, data: any) {
	if (Event === e.trigger && b.bullet && KDEventMapBullet[e.dynamic ? "dynamic" : Event] && KDEventMapBullet[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapBullet[e.dynamic ? "dynamic" : Event][e.type](e, b, data);
	}
}




let KDEventMapEnemy: Record<string, Record<string, (e: KinkyDungeonEvent, enemy: entity, data: any) => void>> = {
	"orgasm": {
		"HolyOrbPunish": (e, enemy, _data) => {
			// We heal nearby allies and self
			if (KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < e.dist) {
				let restraint = KinkyDungeonGetRestraint({tags: ["divinebelt"]}, MiniGameKinkyDungeonLevel, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "");
				if (!restraint) restraint = KinkyDungeonGetRestraint({tags: ["divinebra"]}, MiniGameKinkyDungeonLevel, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "");
				if (restraint) {
					KinkyDungeonAddRestraintIfWeaker(
						restraint,
						20,
						true,
						undefined,
						true,
						false,
						undefined,
						"Angel",
						true,
						undefined,
					);
					KinkyDungeonSendTextMessage(10, TextGet("KDHolyOrbPunish"), "#ffff88", 10);
				}
			}
		},
	},
	"enemyMove": {
		"damageOnMove": (e, enemy, data) => {
			if (enemy == data.enemy)
				KinkyDungeonDamageEnemy(enemy, {damage: enemy.Enemy.maxhp * e.mult + e.power, type: "crush"}, false, true, undefined, undefined, undefined);
		},
		"removeIfRobot": (_e, enemy, data) => {
			if (data.enemy?.Enemy.tags?.robot && KDistChebyshev(data.enemy.x - enemy.x, data.enemy.y - enemy.y) < 1.5) {
				enemy.hp = 0;
			}
		},
	},
	"passout": {
		"delete": (e, enemy, _data) => {
			if (!e.chance || KDRandom() < e.chance)
				enemy.hp = 0;
		}
	},
	"defeat": {
		"delete": (e, enemy, _data) => {
			if (!e.chance || KDRandom() < e.chance)
				enemy.hp = 0;
		}
	},
	"enemyCast": {
		"RandomRespawn": (e, enemy, data) => {
			if (data.enemy == enemy && KDMapData.Entities.length < 300 && (!e.chance || KDRandom() < e.chance)) {
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

		"FuukaManagement": (e, enemy, _data) => {
			if (enemy.hostile && !KDGameData.Collection[enemy.id + ""] && !KDEnemyHasFlag(enemy, "fuukaPillars")) {
				KinkyDungeonSetEnemyFlag(enemy, "fuukaPillars", -1);
				for (let i = 0; i < e.count; i++) {
					let point = KinkyDungeonGetRandomEnemyPointCriteria((x: number, y: number) => {
						return KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(x, y));
					}, true, false, undefined, undefined, 6, false);
					if (point) {
						DialogueCreateEnemy(point.x, point.y, "FuukaPillar");
					}
				}
			}
		},
		"WardenManagement": (e, enemy, _data) => {
			if (enemy.hostile && !KDGameData.Collection[enemy.id + ""]) {
				KDMakeHostile(enemy, KDMaxAlertTimerAggro);


				for (let en of KDMapData.Entities) {
					if (en.Enemy?.tags?.wardenprisoner && !KDEnemyHasFlag(en, "imprisoned")) {
						// Direct enemies toward the player
						if (!en.aware && enemy.aware) {
							en.gx = KinkyDungeonPlayerEntity.x;
							en.gy = KinkyDungeonPlayerEntity.y;
							KDMakeHostile(en, KDMaxAlertTimerAggro);
						}
					}

				}
			}
			if (enemy.hostile && !KDGameData.Collection[enemy.id + ""] && !KDEnemyHasFlag(enemy, "wardenReleasedPrisoners")) {
				KinkyDungeonSetEnemyFlag(enemy, "wardenReleasedPrisoners", -1);
				let count = 0;
				for (let en of KDMapData.Entities) {
					if (en.Enemy?.tags?.wardenprisoner && !KDEnemyHasFlag(en, "imprisoned")) {
						count += 1;
					}
				}
				if (count < e.count || (KinkyDungeonNewGame > 0 && count < 3)) {
					let filter = "";
					if (e.count == 1 && !(KinkyDungeonNewGame > 0)) {
						let rand = [];
						if (KinkyDungeonStatManaMax >= 20) {
							rand.push("WardenMage");
						}
						if (KinkyDungeonStatStaminaMax >= 20) {
							rand.push("WardenArcher");
						}
						if (KinkyDungeonStatWillMax >= 20) {
							rand.push("WardenFighter");
						}

						if (rand.length == 0) rand = ["WardenMage", "WardenFighter", "WardenArcher"];
						filter = CommonRandomItemFromList("", rand);
					}
					for (let en of KDMapData.Entities) {
						if (en.Enemy?.tags?.wardenprisoner) {
							if (count < e.count) {
								if ((!filter || en.Enemy?.name == filter) && KDEnemyHasFlag(en, "imprisoned")) {
									KDFreeNPC(en);
									en.aware = true;
									en.vp = 4;
									en.gx = KinkyDungeonPlayerEntity.x;
									en.gy = KinkyDungeonPlayerEntity.y;
									count += 1;
								}
							}
						}

					}
				}
			}
		},
		"EpicenterAssignHP": (_e, enemy, _data) => {
			if (!KDEnemyHasFlag(enemy, "assignedHP")) {
				let factor = 0.1 + 0.1*Math.round(19*(KDGameData.EpicenterLevel || 1)**0.75) / (KinkyDungeonMaxLevel - 1);

				if (!KDGameData.EpicenterLevel) KDGameData.EpicenterLevel = 0;
				KDGameData.EpicenterLevel += 1;

				enemy.Enemy = JSON.parse(JSON.stringify(enemy.Enemy));
				enemy.Enemy.spellCooldownMult = enemy.Enemy.spellCooldownMult*(1/(1+factor));
				enemy.Enemy.maxhp = enemy.Enemy.maxhp*factor;
				enemy.hp = enemy.Enemy.maxhp;
				enemy.modified = true;

				KinkyDungeonSetEnemyFlag(enemy, "assignedHP", -1);
			}
		},
		"TimeGhostDecay": (e, enemy, data) => {
			if (!KinkyDungeonFlags.get("TimeSlow")) {
				enemy.hp -= data.delta * e.power;
			}
		},
		"AdventurerAssignFaction": (e, enemy, _data) => {
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
		"BossAssignFaction": (e, enemy, _data) => {
			if (!enemy.faction && !KDGameData.Collection[enemy.id + ""] && !KinkyDungeonIsDisabled(enemy) && KDBoundEffects(enemy) < 4) {
				if (enemy.hostile || KDMapData.Entities.some((en) => {return en.Enemy.tags?.stageBoss && en.hostile;})) enemy.faction = e.kind;
			}
		},
		"DeleteCurse": (e, enemy, data) => {
			if (!KDCheckPrereq(undefined, "AlreadyCursed", e, data)) {
				enemy.hp = 0;
				let suff = "NoCurse";
				if (KinkyDungeonPlayerTags.get("Cursed")
					|| (e.tags && !KinkyDungeonGetRestraint({tags: [...e.tags],},
						MiniGameKinkyDungeonLevel,
						(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, ""))
				) suff = "Invalid";
				KinkyDungeonSendTextMessage(5, TextGet("KDEpicenterAbort" + suff + "_" + enemy.Enemy.name), "#9074ab", 10);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Fwoosh.ogg", enemy);
			}
		},

		"LeashWolfgirls": (e, enemy, _data) => {
			if (KDRandom() > (e.chance || 1)) return;
			if (!enemy.idle && KDistChebyshev(enemy.x - enemy.gx, enemy.y - enemy.gy) > 1.5) return;
			if (KDEntityHasFlag(enemy, "tooManyLeash")) return;
			let enemies = KDNearbyEnemies(enemy.x, enemy.y, e.dist);
			let dd = 0;
			let count = KDGetLeashedToCount(enemy);
			if (count < (e.count || 3)) {
				for (let en of enemies) {
					if (KDGetFaction(en) == KDGetFaction(enemy) && en.Enemy?.tags?.submissive && en.Enemy?.tags?.minor) {
						dd = KDistChebyshev(enemy.x - en.x, enemy.y - en.y);
						if (dd < e.dist) {
							if (dd < 1.5) {
								// Attach leash
								KinkyDungeonAttachTetherToEntity(e.dist, enemy, en, "WolfgirlLeash", "#00ff00", 2);
							}
							else {
								// Move toward
								enemy.gx = en.x;
								enemy.gy = en.y;
							}
						}
					}
				}
			} else {
				KinkyDungeonSetEnemyFlag(enemy, "tooManyLeash");
			}
		},
		"DisplayAura": (e, enemy, _data) => {
			let enemies = KDNearbyEnemies(enemy.x, enemy.y, e.dist, enemy);
			for (let en of enemies) {
				KinkyDungeonApplyBuffToEntity(en, KDDollDebuff);
				KinkyDungeonApplyBuffToEntity(en, KDDollDebuff2);
			}
		},
		"suicideWhenBound": (_e, enemy, _data) => {
			if (KDHelpless(enemy)) {
				enemy.hp = 0;
			}
		},
		"secretToy": (_e, enemy, _data) => {
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
		"shadowEngulf": (_e, enemy, data) => {
			if (data.enemy == enemy && data.target == KinkyDungeonPlayerEntity && data.restraintsAdded && data.restraintsAdded.length == 0 && !KinkyDungeonFlags.get("shadowEngulf")) {
				if (data.enemy == enemy && data.target == KinkyDungeonPlayerEntity && data.restraintsAdded && data.restraintsAdded.length == 0 && !KinkyDungeonFlags.get("shadowEngulf")) {
					KDTripleBuffKill("ShadowEngulf", KinkyDungeonPlayerEntity, 9, (_tt) => {
						if (KDGameData.RoomType != "DemonTransition") {
							AIData.defeat = true;
							KDCustomDefeat = "DemonTransition";
							KDCustomDefeatEnemy = enemy;
						} else
							KinkyDungeonPassOut();
					}, "Blindness",
					(_target) => {
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
		"shadowDomme": (_e, enemy, data) => {
			let player = KDPlayer();
			if (data.enemy == enemy && data.target == player && data.restraintsAdded && data.restraintsAdded.length == 0 && !KinkyDungeonFlags.get("shadowEngulf")) {

				KDTripleBuffKill("ShadowEngulf", player, 15, (_tt) => {
					// Passes out the player, but does NOT teleport
					KinkyDungeonPassOut(true);
					KDBreakTether(player);

					// Instead it applies a debuff, and leash
					KinkyDungeonApplyBuffToEntity(player,
						{id: "ShadowDommed", type: "Flag", duration: 9999, infinite: true, power: 1, maxCount: 1, currentCount: 1, tags: ["attack", "cast"], events: [
							{type: "ShadowDommed", trigger: "tick"},
						]}
					);

					if (!KinkyDungeonPlayerTags.get("Collars")) {
						KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("ObsidianCollar"), 0, true, "Purple");
					}
					if (!KinkyDungeonGetRestraintItem("ItemNeckRestraints") && KinkyDungeonPlayerTags.get("Collars")) {
						KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BasicLeash"), 0, true, "Purple");
					}

					KinkyDungeonAttachTetherToEntity(3.5, enemy, player);
				}, "Blindness");
			}
		},
	},
	"death": {
		"RandomRespawn": (e, enemy, data) => {
			if (data.enemy == enemy && KDMapData.Entities.length < 300 && (!e.chance || KDRandom() < e.chance)) {
				let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, 10, 10);
				if (point) {
					let ee = DialogueCreateEnemy(point.x, point.y, enemy.Enemy.name);
					ee.faction = enemy.faction;
				}
			}
		},
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
		"ropeKrakenSummonTentacle": (_e, enemy, data) => {
			if (enemy == data.enemy && data.spell?.name == "SummonRopeTentacle") {
				enemy.hp = Math.max(enemy.hp - enemy.Enemy.maxhp * KDMagicDefs.RopeKraken_TentacleCost, Math.min(enemy.hp, enemy.Enemy.maxhp * KDMagicDefs.RopeKraken_TentacleThreshold));
			}
		},
		"slimeKrakenSummonMinion": (_e, enemy, data) => {
			if (enemy == data.enemy && data.spell?.name == "SummonSlimeMinion") {
				enemy.hp = Math.max(enemy.hp - enemy.Enemy.maxhp * KDMagicDefs.SlimeKraken_TentacleCost, Math.min(enemy.hp, enemy.Enemy.maxhp * KDMagicDefs.SlimeKraken_TentacleThreshold));
			}
		},
		"sarcoKrakenSummonTentacle": (_e, enemy, data) => {
			if (enemy == data.enemy && data.spell?.name == "SummonSarcoTentacle") {
				enemy.hp = Math.max(enemy.hp - enemy.Enemy.maxhp * KDMagicDefs.SarcoKraken_TentacleCost, Math.min(enemy.hp, enemy.Enemy.maxhp * KDMagicDefs.SarcoKraken_TentacleThreshold));
			}
		},
	},
	"afterDamageEnemy": {
		"spellReflect": (e, enemy, data) => {
			if (data.bullet && enemy == data.enemy && KinkyDungeonCanCastSpells(enemy)) {
				let attacker = null;
				if (data.bullet?.bullet?.source) {
					attacker = KinkyDungeonFindID(data.bullet.bullet.source);
				}
				if (attacker && (!e.time || !KDEnemyHasFlag(enemy, "spellReflect" + e.spell))) {
					KinkyDungeonCastSpell(attacker.x, attacker.y, KinkyDungeonFindSpell(e.spell, true), enemy, undefined, undefined);
					if (e.time) {
						KinkyDungeonSetEnemyFlag(enemy, "spellReflect" + e.spell, e.time);
					}
				}
			}
		},
		"FreeWardenPrisoners": (_e, enemy, data) => {
			if (enemy == data.enemy && KDEnemyHasFlag(enemy, "imprisoned") && data.faction == "Player") {
				for (let en of KDMapData.Entities) {
					if (en.Enemy.tags?.warden && KDGetFaction(en) != "Player") {
						en.hostile = 300;
						en.aware = true;
						KDFreeNPC(en);
					}

				}
			}
		},
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
		"ExplosiveBarrel": (e, enemy, data) => {
			if (data.dmg > 0 && ['fire', 'holy', 'electric', 'arcane'].includes(data.type) && enemy == data.enemy) {
				if (enemy.hp <= 0.51 || data.dmg >= e.power || !e.chance || KDRandom() < e.chance) { // Sufficient damage blows it up without a roll
					if (!KDEnemyHasFlag(enemy, "exploded")) {
						enemy.hp = 0;
						KinkyDungeonSendTextMessage(6, TextGet("KDExplosiveBarrelExplode"), "#ffaa44", 4);
						enemy.summoned = true; // To prevent gunpowder
						KinkyDungeonSetEnemyFlag(enemy, "exploded", -1);

						KinkyDungeonCastSpell(enemy.x, enemy.y, KinkyDungeonFindSpell(e.spell, true), enemy, undefined, undefined);
						KDRemoveEntity(enemy);
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
	"afterPlayerAttack": {
		"spellReflect": (e, enemy, data) => {
			if (data.enemy == enemy && data.attacker && KinkyDungeonCanCastSpells(enemy)) {
				if (!e.time || !KDEnemyHasFlag(enemy, "spellReflect" + e.spell)) {
					KinkyDungeonCastSpell(data.attacker.x, data.attacker.y, KinkyDungeonFindSpell(e.spell, true), enemy, undefined, undefined);
					if (e.time) {
						KinkyDungeonSetEnemyFlag(enemy, "spellReflect" + e.spell, e.time);
					}
				}
			}
		},
		"tauntMsg": (e, enemy, data) => {
			if (data.enemy == enemy) {
				KinkyDungeonSendDialogue(enemy, TextGet(e.msg + Math.floor(Math.random() * e.power)), KDGetColor(enemy), e.time || 6, 1, true, true);
			}
		},

	},
	"hit": {
		"spellReflect": (e, enemy, data) => {
			if (data.target == enemy && data.attacker && KinkyDungeonCanCastSpells(enemy)) {
				if (!e.time || !KDEnemyHasFlag(enemy, "spellReflect" + e.spell)) {
					KinkyDungeonCastSpell(data.attacker.x, data.attacker.y, KinkyDungeonFindSpell(e.spell, true), enemy, undefined, undefined);
					if (e.time) {
						KinkyDungeonSetEnemyFlag(enemy, "spellReflect" + e.spell, e.time);
					}
				}
			}
		}
	},
	"afterEnemyTick": {
		//{trigger: "afterEnemyTick", type: "requireNearbyEnemyTag", power: 1.25, dist: 3.5, tags: ["air"]},
		"requireNearbyEnemyTag": (e, enemy, data) => {
			if (data.delta && !KDHelpless(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				let nearby = KDNearbyEnemies(enemy.x, enemy.y, e.dist).filter((en) => {return en.Enemy.tags
					&& !en.Enemy.tags.nobrain
					&& !en.Enemy.tags.nosustain
					&& e.tags.some((tag) => {return en.Enemy.tags[tag] != undefined;});});
				if (nearby.length == 0) {
					enemy.hp -= e.power * data.delta;
				}
			}
		},
		"breakDownForHumanoid": (e, enemy, data) => {
			if (data.delta && !KDHelpless(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				let nearby = KDNearbyEnemies(enemy.x, enemy.y, e.dist).filter((en) => {
					return !KDHelpless(en)
					&& KDIsHumanoid(en);
				});
				if (nearby.length > 0) {
					enemy.hp -= e.power * data.delta;
				}
			}
		},
		"breakDownForDragonQueen": (e, enemy, data) => {
			if (data.delta && !KDHelpless(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				let nearby = KDNearbyEnemies(enemy.x, enemy.y, e.dist).filter((en) => {
					return !KDHelpless(en)
					&& en.Enemy.tags?.dragonqueen;
				});
				if (nearby.length > 0) {
					enemy.hp -= e.power * data.delta;
				}
			}
		},


		"ShopkeeperRescueAI": (e, enemy, data) => {
			// We heal nearby allies and self
			let player = KDPlayer();
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
							if (KinkyDungeonAttachTetherToEntity(2.5, enemy, player)) {
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
							KDRemoveEntity(enemy);
							//KDGameData.RoomType = "ShopStart";
							//KDGameData.MapMod = ""; // Reset the map mod
							MiniGameKinkyDungeonLevel = 0;
							KDCurrentWorldSlot = {x: 0, y: 0};
							let params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
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
								0.5, {noSprite: spell.noSprite, faction: "Ambush", name:spell.name, block: spell.block, volatile: spell.volatile, blockType: spell.blockType,
									volatilehit: spell.volatilehit,
									width:spell.size, height:spell.size, summon:spell.summon,
									targetX: player.x, targetY: player.y, cast: Object.assign({}, spell.spellcast),
									source: enemy.id, dot: spell.dot,
									bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
									bulletSpin: spell.bulletSpin,
									effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
									effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
									passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
									pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
									lifetime: (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: origin.x, y: origin.y}, range: KDGetSpellRange(spell), hit:spell.onhit,
									damage: {evadeable: spell.evadeable, noblock: spell.noblock,
										ignoreshield: spell?.ignoreshield,
										shield_crit: spell?.shield_crit, // Crit thru shield
										shield_stun: spell?.shield_stun, // stun thru shield
										shield_freeze: spell?.shield_freeze, // freeze thru shield
										shield_bind: spell?.shield_bind, // bind thru shield
										shield_snare: spell?.shield_snare, // snare thru shield
										shield_slow: spell?.shield_slow, // slow thru shield
										shield_distract: spell?.shield_distract, // Distract thru shield
										shield_vuln: spell?.shield_vuln, // Vuln thru shield
										damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, desireMult: spell.desireMult, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags},
									spell: spell}, false, enemy.x, enemy.y);
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
		"DragonRegen": (e, enemy, data) => {
			// We heal nearby allies and self
			if (data.delta && !KDHelpless(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (KinkyDungeonPlayerTags.get("Furniture")) {
					enemy.hp = Math.min(enemy.hp + e.power, enemy.Enemy.maxhp);
				}
			}
		},

		"NatureSpiritAura": (e, enemy, data) => {
			// We heal nearby allies and self
			if (data.delta && KinkyDungeonCanCastSpells(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let nearby = KDNearbyEnemies(enemy.x, enemy.y, e.dist);
					for (let en of nearby) {
						if (KDFactionRelation(KDGetFaction(en), KDGetFaction(enemy)) > 0.05)
							if (((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy))) && en.hp > 0.52) en.hp = Math.min(en.hp + e.power, en.Enemy.maxhp);
					}
				}
				let player = KinkyDungeonPlayerEntity;
				if (player.player && data.allied && KDistEuclidean(enemy.x - player.x, enemy.y - player.y) < e.dist) {
					KinkyDungeonChangeStamina(e.power * e.mult, true, 0);
				}
			}
		},


		"HolyOrbAura": (e, enemy, data) => {
			// We heal nearby allies and self
			if (data.delta && KinkyDungeonCanCastSpells(enemy)
				&& enemy.hp > 0
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let nearby = KDNearbyEnemies(enemy.x, enemy.y, e.dist);
					for (let en of nearby) {
						if (en == enemy || en.Enemy.name != "HolyOrb") {
							if (((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy))) && en.hp > 0.52) en.hp = Math.min(en.hp + e.power, en.Enemy.maxhp);
						} else {
							en.hp = Math.max(en.hp - e.power, 0);
						}
					}
				}
			}
		},

		"shadowDebuff": (_e, enemy, data) => {
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
		"shadowDommeRefresh": (_e, enemy, _data) => {
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
						if (en.hp > 0.52 && KDMatchTags(["nevermere", "wolfgirl", "alchemist", "dressmaker", "bountyhunter"], en)) {
							if ((en.Enemy.shield || 0) < e.power) {
								KinkyDungeonApplyBuffToEntity(en, {
									id: "WolfDroneShield", aura: "#00ffff", aurasprite: "EnergyShield", type: "MaxShield", duration: 3, power: e.power - (en.Enemy.shield || 0), player: false, enemies: true, tags: ["defense", "shield"]
								});
							}
							KinkyDungeonApplyBuffToEntity(en, {
								id: "WolfDroneShieldRegen", type: "ShieldRegen", duration: 3, power: e.power * e.mult, player: false, enemies: true, tags: ["defense", "shield"]
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
		"bubbleBarrier": (e, enemy, data) => {
			if (data.delta && (enemy.aware || enemy.vp > 0.5 || e.always) && (e.always|| KDNearbyEnemies(enemy.x, enemy.y, 1.5, enemy).length > 0 || KinkyDungeonAggressive(enemy)) && KinkyDungeonCanCastSpells(enemy) && ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
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
								KinkyDungeonCastSpell(enemy.x + slot.x, enemy.y + slot.y, KinkyDungeonFindSpell("Bubbleexp", true), enemy, undefined, undefined);
							}
						}

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
		"ShadowBubbles": (e, enemy, data) => {
			if (e.time && KDEnemyHasFlag(enemy, e.type)) return;
			if (data.delta
				&& (enemy.aware || enemy.vp > 0.5)
				&& (KDNearbyEnemies(enemy.x, enemy.y, e.dist, enemy).length > 0 || KinkyDungeonAggressive(enemy))
				//&& KinkyDungeonCanCastSpells(enemy)
				&& ((data.allied && KDAllied(enemy)) || (!data.allied && !KDAllied(enemy)))) {
				if (!e.chance || KDRandom() < e.chance) {
					let count = e.power ? e.power : 1;
					let rad = e.aoe ? e.aoe : 1.5;
					let minrad = 0.5;
					let enemies = [...KDNearbyEnemies(enemy.x, enemy.y, e.dist, enemy)];
					if (KinkyDungeonAggressive(enemy) && KDistEuclidean(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) <= e.aoe) {
						enemies.unshift(KinkyDungeonPlayerEntity);
					}
					let currentCount = 0;
					for (let en of enemies) {
						for (let i = 0; i < count; i++) {
							let slots = [];
							for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
								for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
									if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
										if ((en.x + X > 0 && en.y + Y > 0 && en.x + X < KDMapData.GridWidth && en.y + Y < KDMapData.GridHeight)
											&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(en.x + X, en.y + Y))
											&& KinkyDungeonBrightnessGet(en.x + X, en.y + Y) < KDShadowThreshold * 2
											&& KinkyDungeonCheckPath(en.x + X, en.y + Y, en.x, en.y, true, false, 1)
										)
											slots.push({x:X, y:Y});
									}
								}

							if (slots.length > 0) {
								let slot = slots[Math.floor(KDRandom() * slots.length)];
								if (slot) {
									if (e.time)
										KinkyDungeonSetEnemyFlag(enemy, e.type, e.time);
									KinkyDungeonCastSpell(en.x, en.y, KinkyDungeonFindSpell(e.spell, true), undefined, undefined, undefined,
										KDGetFaction(enemy), {
											xx: en.x + slot.x,
											yy: en.y + slot.y,
										}
									);
									currentCount += 1;
									if (currentCount >= count) return;
								}
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
									duration: e.time,
								}, e.variance);
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
 * @param Event
 * @param e
 * @param enemy
 * @param data
 */
function KinkyDungeonHandleEnemyEvent(Event: string, e: KinkyDungeonEvent, enemy: entity, data: any) {
	if (Event === e.trigger && KDEventMapEnemy[e.dynamic ? "dynamic" : Event] && KDEventMapEnemy[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapEnemy[e.dynamic ? "dynamic" : Event][e.type](e, enemy, data);
	}
}



let KDEventMapGeneric: Record<string, Record<string, (e: string, data: any) => void>> = {
	"inventoryTooltip": {
		"stamdmg": (e, data) => {
			if (data.item && data.item.type == Weapon && KDWeapon(data.item)?.stam50mult) {

				data.extraLines.push(TextGet("KDStamDmgBonus")
					.replace("AMNT", KDWeapon(data.item).stam50mult + ""));
				data.extraLineColor.push(KDBookText); // e.color || "#ffffff"
				let bg = "#000000";
				if (!KDToggles.SpellBook) {
					let col = DrawHexToRGB(bg);
					bg = `rgba(${col.r/2}, ${col.g/2}, ${col.b/2}, 0.5)`;
				}
				data.extraLineColorBG.push(bg);
			}
		},
	},
	"perkOrb": {
		"Cursed": (_e, data) => {
			if (data?.perks?.includes("Cursed")) {
				for (let rep of Object.keys(KinkyDungeonShrineBaseCosts)) {
					KinkyDungeonChangeRep(rep, 0);
				}
			}
		},
	},
	"stun": {
		/** Unstoppable, unflinching, relentless */
		"unstp": (_e, data) => {
			KDStunResist(data);
		},
	},
	"freeze": {
		/** Unstoppable, unflinching, relentless */
		"unstp": (_e, data) => {
			KDStunResist(data);
		},
	},
	"bind": {
		/** Unstoppable, unflinching, relentless */
		"unstp": (_e, data) => {
			KDStunResist(data);
		},
	},

	"teleport": {
		"TeleportPlate": (_e, data) => {
			// Creates a wire spark if teleported on
			let etiles = KDGetEffectTiles(data.x, data.y);
			if (etiles) {
				let tilesFiltered = Object.values(etiles)?.filter((tile) => {
					return tile.tags?.includes("teleportwire");
				});
				if (tilesFiltered.length > 0) {
					KDCreateEffectTile(data.x, data.y, {
						name: "WireSparks",
						duration: 2,
					}, 0);
					KinkyDungeonSendTextMessage(10, TextGet("KDTeleportPlateReact"), "#8888ff", 1);
				}
			}

		},
		"TeleportPlateMana": (_e, data) => {
			// Creates a wire spark if teleported on
			let etiles = KDGetEffectTiles(data.x, data.y);
			if (etiles) {
				let count = 5;
				let tilesFiltered = Object.values(etiles)?.filter((tile) => {
					return tile.tags?.includes("teleportcrystal");
				});
				if (tilesFiltered.length > 0) {
					if (data.entity.player) {
						KinkyDungeonChangeMana(-20, false, undefined, true, true);
						let restraintToAdd = KinkyDungeonGetRestraint({
							tags: ["ropeMagicStrong"]}, KDGetEffLevel() + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
						true, "Gold", false, false, false);

						if (restraintToAdd) {
							KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
							if (count > 1)
								for (let i = 1; i < (count || 1); i++) {
									restraintToAdd = KinkyDungeonGetRestraint({
										tags: ["ropeMagicStrong"]}, KDGetEffLevel() + 10, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
									true, "Gold", false, false, false);
									if (restraintToAdd) KinkyDungeonAddRestraintIfWeaker(restraintToAdd, 10, true, "Gold", true, false, undefined, "Observer", true);
								}
						}
					} else {
						KDTieUpEnemy(
							data.entity,
							10, "Magic", undefined, true,
						);
						KDSilenceEnemy(data.entity, 12);
					}
					KinkyDungeonSendTextMessage(10, TextGet("KDTeleportPlateManaReact"), "#8888ff", 1);
				}
			}

		},


	},
	"beforeTeleport": {
		"NoTeleportPlate": (_e, data) => {
			if (!data.cancel && data.entity) {
				// Creates a wire spark if teleported on
				let etiles = KDGetEffectTiles(data.entity.x, data.entity.y);
				if (etiles) {
					let tilesFiltered = Object.values(etiles)?.filter((tile) => {
						return tile.tags?.includes("blockteleport");
					});
					if (tilesFiltered.length > 0) {
						data.cancel = true;
						KinkyDungeonSendEvent("blockTeleport", data);
						KinkyDungeonSendTextMessage(10, TextGet("KDNoTeleportPlateReact"), "#8888ff", 1);
					}
				}
			}
		},
	},
	"blockTeleport": {
		"NoTeleportPlate": (_e, data) => {
			if (data.entity) {
				// Creates a wire spark if teleported on
				let etiles = KDGetEffectTiles(data.entity.x, data.entity.y);
				if (etiles) {
					let tilesFiltered = Object.values(etiles)?.filter((tile) => {
						return tile.tags?.includes("blockteleportwire");
					});
					if (tilesFiltered.length > 0) {
						KDCreateEffectTile(data.entity.x, data.entity.y, {
							name: "WireSparks",
							duration: 2,
						}, 0);
					}
				}
			}
		},
	},

	"beforePlayerLaunchAttack": {
		"ReplacePerks": (_e, data) => {
			if (KinkyDungeonPlayerDamage.unarmed && KDIsHumanoid(data.target)) {
				if (!KinkyDungeonIsArmsBound()) {
					if (KinkyDungeonStatsChoice.get("UnarmedGrope")) {data.attackData.type = "grope"; data.attackData.sfx = "Damage";}
					else if (KinkyDungeonStatsChoice.get("UnarmedPain")) data.attackData.type = "pain";
					else if (KinkyDungeonStatsChoice.get("UnarmedTickle")) {data.attackData.type = "tickle"; data.attackData.sfx = "Tickle";}
				} else KinkyDungeonSendActionMessage(7, TextGet("KDKick"), "#ffaa88", 1, true);


				if (KinkyDungeonStatsChoice.get("UnarmedSuck")) {
					data.attackData.dmg *= 0.5;
					data.attackCost *= 2;
				}
			}
		},
	},
	"calcEnemyTags": {
		"perkTags": (_e, data) => {
			// This event adds tags to enemy tag determination based on perk prefs
			if (KinkyDungeonStatsChoice.get("TapePref")) data.tags.push("tapePref");
			else if (KinkyDungeonStatsChoice.get("TapeOptout")) data.tags.push("tapeOptout");
			if (KinkyDungeonStatsChoice.get("SlimePref")) data.tags.push("slimePref");
			else if (KinkyDungeonStatsChoice.get("SlimeOptout")) data.tags.push("slimeOptout");
			if (KinkyDungeonStatsChoice.get("BubblePref")) data.tags.push("bubblePref");
			else if (KinkyDungeonStatsChoice.get("BubbleOptout")) data.tags.push("bubbleOptout");
		}
	},
	"postMapgen": {
		"resetDollRoom": (_e, _data) => {
			//if (!KDGameData.RoomType || !(alts[KDGameData.RoomType].data?.dollroom)) {
			//KDGameData.DollRoomCount = 0;
			//}
		}
	},
	"orgasm": {
		"tickNeeds": (_e, data) => {
			KDNeedsOrgasm(data);
		}
	},
	"playSelf": {
		"tickNeeds": (_e, data) => {
			KDNeedsPlaySelf(data);
		}
	},
	"edge": {
		"tickNeeds": (_e, data) => {
			KDNeedsEdge(data);
		}
	},
	"deny": {
		"tickNeeds": (_e, data) => {
			KDNeedsDeny(data);
		}
	},
	"defeat": {
		"dollRoomRemove": (_e, _data) => {
			// Removes the excess dollsmiths that are spawned when you escape the dollroom
			if (KDGameData.RoomType && KinkyDungeonAltFloor(KDGameData.RoomType).data?.dollroom) {
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
	"beforeStairCancelFilter": {
		"PerkRoom": (_e, data) => {
			if (!data.cancelfilter && data.altRoom?.requireJourneyTarget) data.cancelfilter = "JourneyChoice";
		},
	},
	"beforeHandleStairs": {
		"resetDollRoom": (_e, data) => {
			if (KDGameData.RoomType && KinkyDungeonAltFloor(KDGameData.RoomType).data?.dollroom) {
				KDGameData.DollRoomCount += 1;
				if (KDGameData.DollRoomCount >= 3) {
					// Allow player to pass unless returning to previous
					if (KinkyDungeonFlags.get("NoDollRoomBypass")) {
						data.overrideProgression = true;
						data.overrideRoomType = true;
						let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
						if (journeySlot) {
							KDGameData.RoomType = journeySlot.RoomType;
							data.mapMod = journeySlot.MapMod;
						} else {
							KDGameData.RoomType = "";
							data.mapMod = "";
						}
					}
				} else {
					data.overrideRoomType = true;
					data.overrideProgression = true;
					data.mapMod = "";
					KDGameData.RoomType = "DollRoom";
				}

			}
		},
		"NoRepeatTunnels": (_e, data) => {
			// The player can never backtrack to a tunnel
			if (data.toTile == 'S' && data.tile?.RoomType == "PerkRoom") {
				data.overrideRoomType = true;
				let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
				if (journeySlot) {
					KDGameData.RoomType = journeySlot.RoomType;
				} else {
					KDGameData.RoomType = "";
				}
			}
		},
		"endfloorfix": (_e, data) => {
			// Bugfix for a case that can happen 5.1 -> 5.2
			if (data.toTile == 'S' && data.tile?.RoomType == "Tunnel") {
				data.tile.RoomType = "";
			}
		},
		"Shop": (_e, data) => {
			// The player can never backtrack to a tunnel
			if (data.toTile == 'S' && data.tile?.RoomType == "JourneyFloor") {
				//data.overrideRoomType = true;
				data.tile.RoomType = "ShopStart";
			}
		},
		"SkipOldPerkRooms": (_e, data) => {
			// The player can never backtrack to old perk rooms
			if (data.toTile != 'S' && !data.tile?.RoomType && MiniGameKinkyDungeonLevel < KDGameData.HighestLevelCurrent) {
				data.overrideRoomType = true;
				KDGameData.RoomType = "";
				data.AdvanceAmount = 1;
			}
		},
	},
	"drawSGTooltip": {
		"goddessBonus": (_e, data) => {
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
		"Conveyor": (_e, data) => {
			for (let player of [KinkyDungeonPlayerEntity]) {
				if (KinkyDungeonMapGet(player.x, player.y) == 'V' || (!data.willing && KinkyDungeonMapGet(player.x, player.y) == 'v'))
					KDConveyor(1, player.x, player.y, true);
			}

		},
		"noisyTerrain": (_e, data) => {
			if (data.sprint && !data.cancelmove) {
				let moves = [
					{x: data.moveX, y: data.moveY, str: data.moveX + "," + data.moveY},
				];
				for (let m of moves)
					if (KinkyDungeonEffectTilesGet(m.str)) {
						for (let tile of Object.values(KinkyDungeonEffectTilesGet(m.str))) {
							if (tile.tags && tile.tags.includes("noisy")) {
								KinkyDungeonMakeNoise(5, m.x, m.y);
								KinkyDungeonSendTextMessage(3, TextGet("KDNoisyTerrain"), "#ff8933", 3, false, true);
							}
						}
					}
			}
		},
	},
	"beforeMove": {
		"changeFace": (e, intent) => {
			if (KDToggles.FlipPlayerAuto) {
				let movedelta = intent.x - KinkyDungeonPlayerEntity.x;
				if (movedelta > 0) {
					KDToggles.FlipPlayer = true;
				}
				else if (movedelta < 0) {
					KDToggles.FlipPlayer = false;
				}
			}
		}
	},
	"resetEventVar": {
		/**
		 * Helper event to clear out variables that are meant to always be reset every floor
		 * You can add your own event like this one
		 */
		"resetVars": (_e, _data) => {
			KDEventData.SlimeLevel = 0;
		},
	},
	"resetEventVarTick": {
		/**
		 * Helper event to clear out variables that are meant to always be reset every tick
		 * You can add your own event like this one
		 */
		"resetVars": (_e, data) => {
			KDEventData.ActivationsThisTurn = 0;
			KDEventData.CurseHintTick = false;
			if (KDEventData.SlimeLevel < 0)
				KDEventData.SlimeLevel = 0;
			KDEventData.SlimeLevelStart = KDEventData.SlimeLevel;
			if (KDAlertCD > 0) KDAlertCD -= data.delta;

			if (KinkyDungeonLastTurnAction != "Attack" && KDGameData.WarningLevel > 0) {
				if (KDRandom() < 0.25) KDGameData.WarningLevel -= data.delta;
				if (KDGameData.WarningLevel > 10) KDGameData.WarningLevel = 10;
			}
		},
	},
	"draw": {
		"HighProfile": (_e, data) => {
			if (!KinkyDungeonStatsChoice.get("HighProfile")) return;
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;
			for (let enemy of KDMapData.Entities) {
				if (KDEntityHasBuff(enemy, "HighValue")
					&& KinkyDungeonVisionGet(enemy.x, enemy.y) > 0
					//&& KDCanSeeEnemy(enemy)
				) {
					KDDraw(kdcanvas, kdpixisprites, enemy.id + "_hvtarg", KinkyDungeonRootDirectory + "UI/HighValueTarget.png",
						(enemy.visual_x - data.CamX - data.CamX_offset) * KinkyDungeonGridSizeDisplay,
						(enemy.visual_y - data.CamY - data.CamY_offset) * KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
							zIndex: 10,
						});
				}
			}

		},
		"QuestMarker": (_e, data) => {
			for (let enemy of KDMapData.Entities) {
				if (KDEnemyHasFlag(enemy, "questtarget") && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
					KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_questtarg", KinkyDungeonRootDirectory + "UI/DollmakerTarget.png",
						(enemy.visual_x - data.CamX) * KinkyDungeonGridSizeDisplay,
						(enemy.visual_y - data.CamY) * KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
							zIndex: -5,
							tint: 0xff5555,
						});
				}
			}
		},
		"EscapeKillMarker": (_e, data) => {
			let escapeMethod = KDGetEscapeMethod(MiniGameKinkyDungeonLevel);
			if (escapeMethod != "Kill" && escapeMethod != "Miniboss") return;
			for (let enemy of KDMapData.Entities) {
				if (KDEnemyHasFlag(enemy, "killtarget") && KinkyDungeonVisionGet(enemy.x, enemy.y) > 0) {
					KDDraw(kdenemystatusboard, kdpixisprites, enemy.id + "_killtarg", KinkyDungeonRootDirectory + "UI/QuestTarget.png",
						(enemy.visual_x - data.CamX) * KinkyDungeonGridSizeDisplay,
						(enemy.visual_y - data.CamY) * KinkyDungeonGridSizeDisplay,
						KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
							zIndex: -5,
							tint: 0xff5555,
						});
				}
			}
		},
	},
	"drawminimap": {

		"QuestMarker": (_e, data) => {
			for (let enemy of KDMapData.Entities) {
				if (KDEnemyHasFlag(enemy, "questtarget")
					&& (enemy.x - data.x + .5) * data.scale > 0 && (enemy.y - data.y + .5) * data.scale > 0
					&& (enemy.x - data.x + .5) * data.scale < KDMinimapWidth()+21 && (enemy.y - data.y + .5) * data.scale < KDMinimapHeight() + 21) {
					/*KDDraw(kdminimap, kdminimapsprites, enemy.id + "_questtargmm", KinkyDungeonRootDirectory + "UI/DollmakerTarget.png",
						(enemy.x - data.x - 1) * data.scale,
						(enemy.y - data.y - 1) * data.scale,
						data.scale * 2, data.scale * 2, undefined, {
							zIndex: 10,
						});*/
					kdminimap.lineStyle(3, 0);
					kdminimap.beginFill(0xff5555, 1.);
					kdminimap.drawCircle(
						(enemy.x - data.x + .5) * data.scale,
						(enemy.y - data.y + .5) * data.scale,
						data.scale/2);
					kdminimap.endFill();
				}
			}

		},
		"EscapeKillMarker": (_e, data) => {
			let escapeMethod = KDGetEscapeMethod(MiniGameKinkyDungeonLevel);
			if (escapeMethod != "Kill" && escapeMethod != "Miniboss") return;
			for (let enemy of KDMapData.Entities) {
				if (KDEnemyHasFlag(enemy, "killtarget")
					&& (enemy.x - data.x + .5) * data.scale > 0 && (enemy.y - data.y + .5) * data.scale > 0
					&& (enemy.x - data.x + .5) * data.scale < KDMinimapWidth()+21 && (enemy.y - data.y + .5) * data.scale < KDMinimapHeight() + 21) {
					kdminimap.lineStyle(3, 0);
					kdminimap.beginFill(0xff5555, 1.);
					kdminimap.drawCircle(
						(enemy.x - data.x + .5) * data.scale,
						(enemy.y - data.y + .5) * data.scale,
						data.scale/2);
					kdminimap.endFill();
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
		"resetFlags": (_e, _data) => {
			KinkyDungeonSetFlag("slept", 0);
		},
		/** Updates gold locks */
		"lockStart": (_e, _data) => {
			for (let tuple of KinkyDungeonAllRestraintDynamic()) {
				let inv = tuple.item;
				if (inv.lock && KDLocks[inv.lock] && KDLocks[inv.lock].levelStart) {
					KDLocks[inv.lock].levelStart(inv);
				}
			}
		},


		/** High Profile perk */
		"HighProfile": (_e, _data) => {
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
		"NGPlusReplace": (_ev, _data) => {
			if (!KinkyDungeonNewGame) return;
			let chance = 1 - (0.8**KinkyDungeonNewGame);
			let bosschance = 1 - (0.9**KinkyDungeonNewGame);
			let regbuffchance = 1 - (0.95**KinkyDungeonNewGame);


			let entities = Object.assign([], KDMapData.Entities);
			for (let e of entities) {
				if (!KDIsHumanoid(e)) continue;
				if (KDEnemyHasFlag(e, "NGPrep")) continue;
				KinkyDungeonSetEnemyFlag(e, "NGPrep", -1);
				if (KDRandom() < chance && !KDEntityHasBuff(e, "HighValue")) {
					let Enemy = null;
					if (KDHardModeReplace[e.Enemy.name]) Enemy = KinkyDungeonGetEnemyByName(KDHardModeReplace[e.Enemy.name]);
					if (Enemy) {
						KDRemoveEntity(e);
						e.Enemy = JSON.parse(JSON.stringify(Enemy));
						e.modified = true;
						KDAddEntity(e);

						if (!e.CustomName)
							KDProcessCustomPatron(Enemy, e, 0.2);
						KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
						let shop = KinkyDungeonGetShopForEnemy(e, false);
						if (shop) {
							KinkyDungeonSetEnemyFlag(e, "Shop", -1);
							KinkyDungeonSetEnemyFlag(e, shop, -1);
							KDSetShopMoney(e);
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
						e.modified = true;
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
		"HardModeReplace": (_ev, _data) => {
			if (!KinkyDungeonStatsChoice.get("hardMode")) return;
			let multiplier = 0.05 + 0.95 * Math.min(1.5, KDGetEffLevel()/(KinkyDungeonMaxLevel - 1));

			let chance = 0.2 * multiplier;
			let bosschance = 0.3;
			let bosshpchance = 0.4 + 0.6 * multiplier;

			let boss = ["Hardmode_Boss"];
			let reg = ["Hardmode_Reg"];
			let hpmod = 1.0;

			if (KinkyDungeonStatsChoice.get("extremeMode")) {
				chance = 0.1 + 0.9 * multiplier;
				bosschance = 0.4;
				bosshpchance = 1.0;
				hpmod = 2.0;
				boss.push("ExtremeBoss", "Extreme");
				reg.push("ExtremeReg", "Extreme");
			}

			let entities = Object.assign([], KDMapData.Entities);
			for (let e of entities) {
				if (!KDIsHumanoid(e)) continue;
				if (KDEnemyHasFlag(e, "HMrep")) continue;
				KinkyDungeonSetEnemyFlag(e, "HMrep", -1);

				if (KDRandom() < chance && !KDEntityHasBuff(e, "HighValue")) {
					let Enemy = null;
					if (KDHardModeReplace[e.Enemy.name] && KDRandom() < 0.5) Enemy = KinkyDungeonGetEnemyByName(KDHardModeReplace[e.Enemy.name]);
					if (Enemy) {
						KDRemoveEntity(e);
						e.Enemy = JSON.parse(JSON.stringify(Enemy));
						e.modified = true;
						KDAddEntity(e);

						if (!e.CustomName)
							KDProcessCustomPatron(Enemy, e, 0.2);
						KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
						let shop = KinkyDungeonGetShopForEnemy(e, false);
						if (shop) {
							KinkyDungeonSetEnemyFlag(e, "Shop", -1);
							KinkyDungeonSetEnemyFlag(e, shop, -1);
							KDSetShopMoney(e);
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
							e.Enemy.maxhp = Math.max(e.Enemy.maxhp*2, e.Enemy.maxhp + hpmod*1.0 * (1 + KDEnemyRank(e)));
							e.modified = true;
						}
					}
					if (!bossBuff || KinkyDungeonStatsChoice.get("extremeMode") || e.Enemy.tags.stageBoss) {
						let buff = KDGetByWeight(KDGetSpecialBuffList(e, reg));
						if (buff) {
							KDSpecialBuffs[buff].apply(e, reg);
						}
					}
					e.hp = e.Enemy.maxhp;
				} else {
					// Boring enemies have more hp
					e.Enemy = JSON.parse(JSON.stringify(e.Enemy));
					e.Enemy.maxhp = e.Enemy.maxhp + hpmod*1.0 * (1 + KDEnemyRank(e));
					e.modified = true;

					e.hp = e.Enemy.maxhp;
				}


			}
		},
	},
	"hit": {
		"StunBondage": (_e, data) => {
			if (data.player == KinkyDungeonPlayerEntity && data.restraintsAdded?.length > 0 && KinkyDungeonStatsChoice.has("StunBondage")) {
				KDStunTurns(data.restraintsAdded.length, false);
			}
		},
	},
	"boundBySpell": {
		"StunBondage": (_e, data) => {
			if (data.player == KinkyDungeonPlayerEntity && data.restraintsAdded?.length > 0 && KinkyDungeonStatsChoice.has("StunBondage")) {
				KDStunTurns(data.restraintsAdded.length, false);
			}
		},
	},
	"sleep": {
		/**
		 * Updates NPC escape
		 */
		"updateNPCEscape": (_e, _data) => {
			KDCollectionNPCEscapeTicks(12 + Math.floor(KDRandom() * 24));
		},
	},
	"tickFlags": {
		"TempFlagFloorTicks": (_e, data) => {
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
		},
		/**
		 * Updates failities
		 */
		"updateFac": (_e, _data) => {
			KDUpdateFacilities(1);
		},
		/**
		 * Updates NPC escape
		 */
		"updateNPCEscape": (_e, _data) => {
			KDCollectionNPCEscapeTicks(24 + Math.floor(KDRandom() * 36));
		},
		/**
		 * Resets the flags for playing with an NPC
		 */
		"updateNPCOpinionFlags": (_e, _data) => {
			let setIDs = {};

			for (let value of Object.values(KDGameData.Collection)) {
				if (KDCollHasFlag(value.id, "playOpin")) {
					KDSetIDFlag(value.id, "playOpin", 0);
					KDSetIDFlag(value.id, "PleasedRep", 0);
					setIDs[value.id] = true;
				}
			}
			for (let pers of Object.values(KDPersistentNPCs)) {
				if (!setIDs[pers.id]) {
					KDSetIDFlag(pers.id, "playOpin", 0);
					KDSetIDFlag(pers.id, "PleasedRep", 0);

					setIDs[pers.id] = true;
				}
			}
		},
		/** Reduce tightness by 1 per floor */
		"reduceTightness": (_e, data) => {
			if (MiniGameKinkyDungeonLevel > 0 && data?.altType?.tickFlags)
				for (let tuple of KinkyDungeonAllRestraintDynamic()) {
					let inv = tuple.item;
					if (inv.tightness > 0) {
						KinkyDungeonSendTextMessage(1, TextGet("KDTightnessFade")
							.replace("RSTRT", KDGetItemName(inv))
						, "#ffffff", 1);
						inv.tightness = Math.max(0, inv.tightness - 1);
					}
				}
		},
	},
	/*"calcDisplayDamage": {
		"BoostDamage": (e, data) => {
			if (KinkyDungeonStatMana >= KinkyDungeonStatMana * 0.999 && KinkyDungeonStatsChoice.has("GroundedInReality")) {
				data.buffdmg = Math.max(0, data.buffdmg + KinkyDungeonPlayerDamage.dmg * 0.3);
			}
		},
	},*/
	"playerAttack": {
		"trainHeels": (_e, data) => {
			if (KDHostile(data.enemy) && KDIsHumanoid(data.enemy)) {
				KDTickTraining("Heels", KDGameData.HeelPower > 0 && !(KDGameData.KneelTurns > 0), KDGameData.HeelPower <= 0 && !KinkyDungeonGetRestraintItem("ItemBoots"), 1.5);
			}
		},
		"GroundedInReality": (_e, data) => {
			if (KinkyDungeonPlayerDamage && KinkyDungeonStatMana >= KinkyDungeonStatManaMax * 0.999 && KinkyDungeonStatsChoice.has("GroundedInReality")) {
				if (!data.miss && !data.disarm && data.targetX && data.targetY && data.enemy && KDHostile(data.enemy)) {
					KinkyDungeonDamageEnemy(data.enemy, {
						type: "electric",
						damage: (data.damage?.damage || KinkyDungeonPlayerDamage.damage || 0) * 0.3,
					}, false, false, undefined, undefined, KinkyDungeonPlayerEntity, undefined, undefined, data.vulnConsumed);
				}
			}
		},
	},
	"calcMultMana": {
		"ImmovableObject": (_e, data) => {
			if (KinkyDungeonStatWill >= KinkyDungeonStatWillMax * 0.90 && KinkyDungeonStatsChoice.has("ImmovableObject")) {
				if (data.spell && data.spell.tags && data.spell.tags.includes("buff") && data.spell.tags.includes("earth"))
					data.cost = data.cost * 0.5;
			}
		},
	},
	"canSprint": {
		"NovicePet": (_e, data) => {
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
		"trainHeels": (_e, _data) => {
			if (KinkyDungeonLastAction == "Move" && !(KDGameData.KneelTurns > 0)) {
				let danger = KinkyDungeonInDanger();
				let amt = 0.01;
				let mult = (
					(KinkyDungeonLeashingEnemy() && KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, KinkyDungeonLeashingEnemy().x, KinkyDungeonLeashingEnemy().y, KinkyDungeonLeashingEnemy()))
					||
					(KinkyDungeonJailGuard() && KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, KinkyDungeonJailGuard()))
					) ? 1.5 : 1;
				KDTickTraining("Heels", KDGameData.HeelPower > 0,
					KDGameData.HeelPower <= 0 && !danger, amt, mult);
			}
		},
		"runes": (_e, data) => {
			if (data.delta > 0) {
				let dd: KDRuneCountData = {
					explodeChance: 0.15,
					maxRunes: 10,
					runes: 0,
					runeList: [],
				};
				KinkyDungeonSendEvent("countRune", dd);

				if (dd.runeList.length > 0 && dd.runes > dd.maxRunes && KDRandom() < dd.explodeChance) {
					let rune = dd.runeList[Math.floor(dd.runeList.length * KDRandom())];
					rune.time = 0;
				}
			}
		},
		"HighProfile": (_e, _data) => {
			if (!KinkyDungeonStatsChoice.get("HighProfile")) return;
			let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
			if (altType && altType.spawns === false) return;

			let player = KinkyDungeonPlayerEntity;
			let nearby = KDNearbyEnemies(player.x, player.y, 12);
			for (let enemy of nearby) {
				if (KDEntityHasBuff(enemy, "HighValue")) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
						{id: "HighValueFound", type: "HighValueFound", duration: 2, power: 0, buffSprite: true, aura: "#e7cf1a"}
					);
					return;
				}
			}
		},
		"DollRoomUpdate": (_e, _data) => {
			if (KDGameData.RoomType && KinkyDungeonAltFloor(KDGameData.RoomType).data?.dollroom) {
				// Spawn shopkeeper

				if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.OL
					&& KDCanSpawnShopkeeper(true)
					&& KDRandom() < 0.1) KDStartDialog("ShopkeeperRescue", "ShopkeeperRescue", true, "", undefined);

				let spawn = true;
				let eligible = false;
				for (let player of [KinkyDungeonPlayerEntity]) {
					if (spawn && KDistEuclidean(player.x - KDMapData.StartPosition.x, player.y - KDMapData.StartPosition.y) < 10) {
						spawn = false;
					}
					if (spawn && !eligible && !KinkyDungeonTilesGet(player.x + "," + player.y)?.OL) {
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
		"DollStorageUpdate": (_e, _data) => {
			if (KDGameData.RoomType && KinkyDungeonAltFloor(KDGameData.RoomType).data?.dollstorage) {
				// Spawn shopkeeper

				if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.OL
					&& KDCanSpawnShopkeeper(true)
					&& KDRandom() < 0.1) KDStartDialog("ShopkeeperRescue", "ShopkeeperRescue", true, "", undefined);

			}
		},
		"SecondWind": (_e, _data) => {
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
		"NovicePet": (_e, _data) => {
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
		"BurningDesire": (_e, _data) => {
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
					power: 0.25,
					duration: 2
				});

			}
		},
		"Needs": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("Needs")) {
				if (data.delta > 0 && !(KDGameData.OrgasmStamina > 0)) {
					if (KinkyDungeonStatDistractionLower < KinkyDungeonStatDistractionLowerCap * KinkyDungeonStatDistractionMax) {
						KinkyDungeonStatDistractionLower = Math.min(KinkyDungeonStatDistractionLower + data.delta*0.01, KinkyDungeonStatDistractionLowerCap * KinkyDungeonStatDistractionMax);
					}
				}
			}
		},
		"LikeTheWind": (_e, _data) => {
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
		"ImmovableObject": (_e, _data) => {
			if (KinkyDungeonStatWill >= KinkyDungeonStatWillMax * 0.90 && KinkyDungeonStatsChoice.has("ImmovableObject")) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "ImmovableObject",
					type: "RestraintBlock",
					power: 15,
					duration: 2
				});

			}
		},
		"LeastResistance": (_e, _data) => {
			if (KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.01 && KinkyDungeonStatsChoice.has("LeastResistance")) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
					id: "LeastResistance",
					type: "EvasionProtected",
					power: 0.35,
					duration: 2
				});
			}
		},

		"FrigidPersonality": (_e, _data) => {
			if (KinkyDungeonStatDistraction <= KinkyDungeonStatDistractionMax * 0.1 && KinkyDungeonStatsChoice.has("FrigidPersonality")) {
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
		"ArousingMagic": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("ArousingMagic")) {
				KinkyDungeonChangeDistraction(KinkyDungeonGetManaCost(data.spell), false, 0.1);
			}
		},
		"Clearheaded": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("Clearheaded")) {
				KinkyDungeonChangeDistraction(-KinkyDungeonGetManaCost(data.spell), false, 0.1);
			}
		},
	},
	"beforeDamage": {
		"LeastResistance": (_e, data) => {
			if (KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.01 && KinkyDungeonStatsChoice.has("LeastResistance")) {
				if (data.attacker && data.target.player && data.bound && data.eventable && (data.attacker.player || !data.target.player || KinkyDungeonAggressive(data.attacker))) {
					if (data.attacker.player) {
						KinkyDungeonDealDamage({damage: KinkyDungeonStatWillMax*0.1, type: "soap"});
					} else {
						KinkyDungeonDamageEnemy(data.attacker, {damage: KinkyDungeonStatWillMax*0.20, type: "soap"}, false, false, undefined, undefined, KinkyDungeonPlayerEntity);
					}
				}
			}
		},
	},
	"perksStruggleCalc": {
		"CursedLocks": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("CursedLocks") && data.struggleType == "Cut" && data.restraint.lock) {
				data.escapeChance = -100;
				if (data.Msg) {
					KinkyDungeonSendTextMessage(10, TextGet("KDCursedLocks"), "#aa4488", 1.1);
				}
			}
		},
	},
	"beforeChest": {
		"shadowChest": (_e, data) => {
			if ((data.chestType == "shadow" || data.chestType == "lessershadow") && KDCanCurse(["ChestCollar"])) {
				// Shadow chests spawn cursed epicenter
				if (data.chestType == "shadow" || KDRandom() < 0.2)
					KDSummonCurseTrap(data.x, data.y);
			}
		},
		"lessergoldChest": (_e, data) => {
			if ((data.chestType == "lessergold") && KDCanCurse(["ChestCollar"])) {
				// Shadow chests spawn cursed epicenter
				KDSummonCurseTrap(data.x, data.y);
			}
		},
	},
	"kill": {
		"HighProfile": (_e, data) => {
			if (data.enemy && KDEntityHasBuff(data.enemy, "HighValue")) {
				KinkyDungeonAddGold(Math.round(Math.pow(data.enemy.Enemy.maxhp, 0.5)*10));
			}
		}
	},
	"specialChests": {
		"hardmode": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("hardMode")) {
				data.specialChests.shadow = (data.specialChests.shadow || 0) + 2;
				data.specialChests.blue = (data.specialChests.blue || 0) + 1;
			}
		},
		"demontransition": (_e, data) => {
			if (data.altType?.name == "DemonTransition") data.specialChests.lessershadow = 10;
		},
		"bluechest": (_e, data) => {
			if (!data.altType) data.specialChests.blue = (data.specialChests.blue || 0) + 1;
		},
	},
	"genSpecialChest": {
		"blue": (_e, data) => {
			if (data.type == "blue") {
				data.lock = "Blue";
				data.guaranteedTrap = true;
			}
		},
		"shadow": (_e, data) => {
			if (data.type == "shadow" || data.type == "lessershadow") {
				data.lock = undefined;
				data.guaranteedTrap = true;
			}
		},
	},
	"addEntity": {
		"EnemyResist": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("EnemyResist") && KDGetFaction(data.enemy) != "Player") {
				if (!KDEnemyHasFlag(data.enemy, "EnemyResist")) {
					KinkyDungeonSetEnemyFlag(data.enemy, "EnemyResist", -1);
					data.type = JSON.parse(JSON.stringify(data.enemy.Enemy));
					data.type.maxhp *= KDEnemyResistHPMult;
					data.enemy.hp *= KDEnemyResistHPMult;
					data.enemy.Enemy = data.type;
					data.enemy.modified = true;
				}
			}
		},
		"ResilientFoes": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("ResilientFoes") && KDGetFaction(data.enemy) != "Player") {
				if (!KDEnemyHasFlag(data.enemy, "ResilientFoes")) {
					KinkyDungeonSetEnemyFlag(data.enemy, "ResilientFoes", -1);
					data.type = JSON.parse(JSON.stringify(data.enemy.Enemy));
					data.type.maxhp *= KDResilientHPMult;
					data.enemy.hp *= KDResilientHPMult;
					data.enemy.Enemy = data.type;
					data.enemy.modified = true;
				}
			}
		},
		"Stealthy": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("Stealthy") && KDGetFaction(data.enemy) != "Player") {
				if (!KDEnemyHasFlag(data.enemy, "Stealthy")) {
					KinkyDungeonSetEnemyFlag(data.enemy, "Stealthy", -1);
					data.type = JSON.parse(JSON.stringify(data.enemy.Enemy));
					data.type.maxhp *= KDStealthyHPMult;
					data.enemy.hp *= KDStealthyHPMult;
					data.enemy.Enemy = data.type;
					data.enemy.modified = true;
				}
			}
		},
	},
	"calcVision": {
		"ArchersEye": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("ArchersEye")) {
				data.max += Math.max(0, 2 - Math.max(0, KinkyDungeonBlindLevel || 0));
			}
		},
		"Nearsighted": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("Nearsighted")) {
				data.max *= 0.5;
			}
		},
	},
	"vision": {
		"NightOwl": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("NightOwl")) {
				data.flags.nightVision *= 2;
			}
		},
		"NightBlindness": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("NightBlindness")) {
				data.flags.nightVision *= 0.7;
			}
		},
		"Nearsighted": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("Nearsighted")) {
				data.flags.nightVision *= 0.85;
			}
		},
	},
	"calcHearing": {
		"KeenHearing": (_e, data) => {
			if (KinkyDungeonStatsChoice.get("KeenHearing")) {
				data.hearingMult *= 2;
			}
		},
	},
	"afterNoise": {
		// Shockwave rendering code
		"shockwave": (_e, data) => {
			if (data.particle) {
				if (!KDEventData.shockwaves) KDEventData.shockwaves = [];
				KDEventData.shockwaves.push(data);
			}
		}
	},
	"afterDrawFrame": {
		// Shockwave rendering code
		"shockwave": (_e, data) => {
			if (KDEventData.shockwaves) {
				if (KDToggles.ParticlesFX)
					for (let s of KDEventData.shockwaves) {
						KDAddShockwave((s.x - data.CamX + 0.5) * KinkyDungeonGridSizeDisplay, (s.y - data.CamY + 0.5) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay * (s.radius + 1) * 2, s.sprite);
					}
				KDEventData.shockwaves = [];
			}

		}
	},
	"beforeNewGame": {
		// Ran before starting a new game
	},
	"afterNewGame": {
		// Ran immediately after a new game starts
	},
	"beforeLoadGame": {
		// Ran before loading a game
	},
	"afterLoadGame": {
		// Ran after loading a game
	},
	"afterModSettingsLoad": {
		// Ran after loading KDModSettings from Local Storage
	},
	"afterModConfig": {
		// Ran after returning to menu from the mod configuration window.
	}
};

/**
 * @param Event
 * @param data
 */
function KinkyDungeonHandleGenericEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapGeneric, Event)) return;
	if (KDEventMapGeneric[Event] && KDEventMapGeneric[Event]) {
		for (let e of Object.keys(KDEventMapGeneric[Event]))
			KDEventMapGeneric[Event][e](e, data);
	}
}



/*  TODO: Utilize item and tags parameter in future :) */
function KDEventPrereq(_e: string, item?: item, tags?: any) {
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
 * @param enemy
 */
function KDIsHumanoid(enemy: entity): boolean {
	return (enemy?.player) || (enemy?.Enemy.bound && !enemy.Enemy.nonHumanoid);
}

/**
 * For spells that arent cast, like toggles and flame blade
 * @param spell
 * @param data
 * @param Passive
 * @param Toggle
 */
function KDTriggerSpell(spell: spell, data: any, Passive: boolean, Toggle: boolean) {
	if (!data.spell) data.spell = spell;
	if (Passive) data.Passive = true;
	if (Toggle) data.Toggle = true;
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

function KDAddArcaneEnergy(player: entity, powerAdded: number) {
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
				duration: 9999, infinite: true,
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




function KinkyDungeonSendAltEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapAlt, Event)) return;
	let alt = KDGetAltType(MiniGameKinkyDungeonLevel);
	if (alt?.events) {
		for (let e of alt.events) {
			KinkyDungeonHandleAltEvent(Event, e, alt, data);
		}
	}
}


/**
 * @param Event
 * @param e
 * @param alt
 * @param data
 */
function KinkyDungeonHandleAltEvent(Event: string, e: KinkyDungeonEvent, alt: any, data: any) {
	if (Event === e.trigger && KDEventMapAlt[e.dynamic ? "dynamic" : Event] && KDEventMapAlt[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapAlt[e.dynamic ? "dynamic" : Event][e.type](e, alt, data);
	}
}

let KDEventMapAlt: Record<string, Record<string, (e: KinkyDungeonEvent, alt: any, data: any) => void>> = {
	"tick": {
		"PerkRoom": (_e, _alt, _data) => {
			if (KinkyDungeonStatsChoice.get("perksmandatory")) {
				if (KinkyDungeonFlags.get("choseperk")) {
					KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
				}
			}
		}
	},
};





function KinkyDungeonSendFacilityEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapFacility, Event)) return;
	let listUpdate = Object.entries(KDFacilityTypes).filter((entry) => {
		return entry[1].prereq();
	});
	for (let Facility of listUpdate) {
		if (Facility[1].events) {
			for (let e of Facility[1].events) {
				KinkyDungeonHandleFacilityEvent(Event, e, Facility[0], data);
			}
		}
	}
}


/**
 * @param Event
 * @param e
 * @param fac
 * @param data
 */
function KinkyDungeonHandleFacilityEvent(Event: string, e: KinkyDungeonEvent, fac: string, data: any) {
	if (Event === e.trigger && KDEventMapFacility[e.dynamic ? "dynamic" : Event] && KDEventMapFacility[e.dynamic ? "dynamic" : Event][e.type]) {
		if (KDCheckCondition(e, data))
			KDEventMapFacility[e.dynamic ? "dynamic" : Event][e.type](e, fac, data);
	}
}

let KDEventMapFacility: Record<string, Record<string, (e: KinkyDungeonEvent, fac: string, data: any) => void>> = {
};



function KDStunResist(data: any) {
	let amount = 0;
	let time = 0;
	if (data.enemy?.Enemy?.tags.unstoppable) {
		amount = 2;
		time = 10;
	} else if (data.enemy?.Enemy?.tags.unflinching) {
		amount = 1.5;
		time = 8;
	} else if (data.enemy?.Enemy?.tags.relentless) {
		amount = 1;
		time = 3;
	}
	if (amount) {
		KinkyDungeonApplyBuffToEntity(data.enemy, {
			id: "ccArmor",
			power: amount,
			type: "StunResist",
			duration: time,
			aura: "#ffc2a1",
			tags: ["defense", "cc"],
		});
	}
}

function KDAddEvent(map: any, trigger: any, type: any, code: any) {
	if (!map) {
		console.log("Error adding " + trigger + ", " + type);
	}
	if (!map[trigger]) {
		map[trigger] = {};
	}
	map[trigger][type] = code;
}
