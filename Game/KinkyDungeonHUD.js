"use strict";
let KinkyDungeonStruggleGroups = [];
let KinkyDungeonStruggleGroupsBase = [
	"ItemH",
	"ItemDevices",
	"ItemM",
	"ItemEars",
	"ItemArms",
	"ItemNeck",
	"ItemHands",
	"ItemNeckRestraints",
	"ItemBreast",
	"ItemNipples",
	"ItemTorso",
	"ItemButt",
	"ItemVulva",
	"ItemVulvaPiercings",
	"ItemPelvis",
	"ItemLegs",
	"ItemFeet",
	"ItemBoots",
];
let KinkyDungeonDrawStruggle = 1;
let KinkyDungeonDrawStruggleHover = false;
let KinkyDungeonDrawState = "Game";
let KinkyDungeonDrawStatesModal = ["Heart", "Orb"];
let KinkyDungeonSpellValid = false;
let KinkyDungeonCamX = 0;
let KinkyDungeonCamY = 0;
let KinkyDungeonTargetX = 0;
let KinkyDungeonTargetY = 0;
let KinkyDungeonLastDraw = 0;
let KinkyDungeonLastDraw2 = 0;
let KinkyDungeonDrawDelta = 0;

const KinkyDungeonLastChatTimeout = 10000;

let KinkyDungeonStatBarHeight = 50;
let KinkyDungeonToggleAutoDoor = false;
let KinkyDungeonToggleAutoPass = false;
let KinkyDungeonToggleAutoSprint = false;
let KinkyDungeonInspect = false;

let KinkyDungeonFastMove = true;
let KinkyDungeonFastMovePath = [];
let KinkyDungeonFastStruggle = false;
let KinkyDungeonFastStruggleType = "";
let KinkyDungeonFastStruggleGroup = "";

/**
 *
 * @param {item} item
 * @param {boolean} [includeItem]
 * @returns {item[]}
 */
function KDDynamicLinkList(item, includeItem) {
	let ret = [];
	if (includeItem) ret.push(item);
	if (item && item.dynamicLink) {
		let link = item.dynamicLink;
		while (link) {
			ret.push(link);
			link = link.dynamicLink;
		}
	}
	return ret;
}

/**
 * Returns a list of items on the 'surface' of a dynamic link, i.e items that can be accessed
 * @param {item} item
 * @returns {item[]}
 */
function KDDynamicLinkListSurface(item) {
	// First we get the whole stack
	let stack = [];
	if (item && item.dynamicLink) {
		let last = item;
		let link = item.dynamicLink;
		while (link) {
			stack.push({item: link, host: last});
			link = link.dynamicLink;
			last = link;
		}
	}
	let ret = [item];
	// Now that we have the stack we sum things up
	for (let tuple of stack) {
		let inv = tuple.item;
		let host = tuple.host;
		if (
			(!KDRestraint(host).inaccessible)
			&& ((KDRestraint(host).accessible) || (KDRestraint(inv).renderWhenLinked && KDRestraint(item).shrine && KDRestraint(inv).renderWhenLinked.some((link) => {return KDRestraint(item).shrine.includes(link);})))
		) {
			ret.push(inv);
		}
	}
	return ret;
}

/**
 *
 * @param {restraint} restraint
 * @returns {number}
 */
function KDLinkSize(restraint) {
	return restraint.linkSize ? restraint.linkSize : 1;
}

/**
 *
 * @param {item} item
 * @param {string} linkCategory
 * @returns {number}
 */
function KDLinkCategorySize(item, linkCategory) {
	let total = 0;
	// First we get the whole stack
	let stack = [item];
	if (item && item.dynamicLink) {
		let link = item.dynamicLink;
		while (link) {
			stack.push(link);
			link = link.dynamicLink;
		}
	}
	// Now that we have the stack we sum things up
	for (let inv of stack) {
		if (KDRestraint(inv).linkCategory == linkCategory) {
			total += KDLinkSize(KDRestraint(inv));
		}
	}
	return total;
}

let KDBuffSprites = {
	"Camo": true,
	"Drenched": true,
	"StoneSkin": true,
	"Conduction": true,
	"Ignite": true,
	"Burning": true,
	"Unsteady": true,
	"Unsteady2": true,
	"Chilled": true,
	"ChillWalk": true,
	"Slimed": true,
	"LightningRod": true,
	"PoisonDagger": true,
	"Cutting": true,
	"Slippery": true,
	"ScrollVerbal": true,
	"ScrollArms": true,
	"ScrollLegs": true,
	"Empower": true,
	"SlimeMimic": true,
	"DisenchantSelf": true,
	"LeatherBurst": true,

	"TabletElements": true,
	"TabletConjure": true,
	"TabletIllusion": true,
	"TabletRope": true,
	"TabletWill": true,
	"TabletMetal": true,
	"TabletLatex": true,
	"TabletLeather": true,

	"AvatarFire": true,
	"AvatarWater": true,
	"AvatarEarth": true,
	"AvatarAir": true,

	"DistractionCast": true,

	//KinkyDungeonBuffShrineElements,"Arcane Power: Deals bonus damage when you hit an enemy."
	//KinkyDungeonBuffShrineConjure,"Arcane Protection: Reduces damage taken, and deals retaliation damage."
	//KinkyDungeonBuffShrineIllusion,"Arcane Cunning: You turn invisible briefly after attacking."

	//KinkyDungeonBuffSlimeForm,"Slime Form: You gain bonuses and can slip through bars!"
	//KinkyDungeonBuffShroud2,"Shroud: Visibility decreased, evasion increased."
	//KinkyDungeonBuffShadowBlade,"Darkblade: Increased damage."
	//KinkyDungeonBuffShield,"Runic Ward: Increased Spell Ward."
	//KinkyDungeonBuffInvisibility,"Invisibility: It is very difficult for enemies to see you."
	//KinkyDungeonBuffLesserInvisibility,"Lesser Invisibility: It is harder for enemies to see you."
	//KinkyDungeonBuffCutting,"FULL POWER: Cutting power increased!!!"
	//KinkyDungeonBuffSlippery,"Graceful: Struggling power increased."
	//KinkyDungeonBuffIronBlood,"Iron Blood: Reduced melee cost, increased mana costs."
	//KinkyDungeonBuffSleepy,"Sleepy: You are sluggish and have a hard time keeping your eyes open."
	//KinkyDungeonBuffEvasion,"Afterimage: Evasion greatly increased."

	//KinkyDungeonBuffStraitjacketBolt,"Locked Down: Struggling power is greatly reduced."
	//KinkyDungeonBuffLockdown,"Locked Down: Struggling power is greatly reduced."

	//KinkyDungeonBuffScrollVerbal,"Verbose: You can cast verbal spells while gagged."
	//KinkyDungeonBuffScrollArms,"Dextrous: You can cast arm spells while tied up."
	//KinkyDungeonBuffScrollLegs,"Spell Dance: You can cast leg spells while tied up."

	//KinkyDungeonBuffBondageBusterCharge,"Bondage Buster: Lazor is charging..."
	//KinkyDungeonBuffKatanaCharge,"Katana: Patience is key..."
	//KinkyDungeonBuffStormCharge,"Stormbreaker: You have the Power."
};

let KDStatsSkipLine = {
	"info": 1,
	"status": 1,
	"dmg": 1,
};
let KDStatsSkipLineBefore = {
	"kinky": 1,
};

let KDStatsOrder = {
	"info": 10000,
	"help": 3500, // Always good, so since they are buffs they should be high priority
	"status": 7000,
	"buffs": 1000,
	"dmg": 2000,
	"kinky": -1000,
};

function KinkyDungeonDrawInputs() {
	/**
	 * @type {Record<string, {text: string, icon?: string, count?: string, category: string, priority?: number, color: string, bgcolor: string, countcolor?: string}>}
	 */
	let statsDraw = {};

	if (ServerURL == "foobar") DrawButtonVis(1880, 82, 100, 50, TextGet("KinkyDungeonRestart"), "#ffffff");
	else DrawButtonVis(1750, 20, 100, 50, TextGet("KinkyDungeonRestart"), "#ffffff");

	//let X1 = 1640;
	//let X2 = 1360;
	//let X3 = 1090;

	let i = 0;

	if (KinkyDungeonPlayerDamage) {
		let accuracy = KinkyDungeonGetEvasion();
		//if (accuracy != 1.0) {
		let weapon = KinkyDungeonWeapons[KinkyDungeonPlayerWeapon] || KinkyDungeonPlayerDamage;
		statsDraw.accuracy = {
			text: TextGet("KinkyDungeonAccuracy") + Math.round(accuracy * 100) + "%",
			count: Math.round(accuracy * 100) + "%",
			icon: "infoAccuracy",//accuracy > weapon.chance * 1.01 ? "infoAccuracyBuff" : (accuracy < weapon.chance * 0.99 ? "infoAccuracyDebuff" : "infoAccuracy"),
			countcolor: accuracy > weapon.chance * 1.01 ? "#c4efaa" : (accuracy < weapon.chance * 0.99 ? "#ff5555" : "#ffffff"),
			category: "info", color: "#ffffff", bgcolor: "#000000", priority: 10
		};
		//}
	}
	//if (KinkyDungeonMiscastChance > 0) {
	statsDraw.miscast = {
		text: TextGet("StatMiscastChance") + Math.round(KinkyDungeonMiscastChance * 100) + "%",
		count: Math.round(KinkyDungeonMiscastChance * 100) + "%",
		icon: "infoMiscast",
		countcolor: KinkyDungeonMiscastChance > 0 ? "#ff5555" : "#ffffff",
		category: "info", color: "#ffffff", bgcolor: "#000000", priority: 9
	};
	//}
	let evasion = KinkyDungeonPlayerEvasion();
	//if (evasion != 1.0) {
	statsDraw.evasion = {
		text: TextGet("StatEvasion").replace("Percent", ("") + Math.round((1 - evasion) * 100)),
		count: ("") + Math.round((1 - evasion) * 100) + "%",
		icon: "infoEvasion",
		countcolor: evasion < 1 ? "#65d45d" : (evasion == 1 ? "#ffffff" : "#ff5555"),
		category: "info", color: "#ffffff", bgcolor: "#000000", priority: 8
	};
	//}



	let jailstatus = "KinkyDungeonPlayerNotJailed";
	if (KDGameData.PrisonerState == 'jail') {
		jailstatus = "KinkyDungeonPlayerJail";
	} else if (KDGameData.PrisonerState == 'parole') {
		jailstatus = "KinkyDungeonPlayerParole";
	} else if (KDGameData.PrisonerState == 'chase') {
		jailstatus = "KinkyDungeonPlayerChase";
	}
	if (jailstatus == "KinkyDungeonPlayerJail") {
		statsDraw.jail = {
			text: TextGet(jailstatus),
			icon: "infoJailPrisoner",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 12
		};
	} else if (jailstatus == "KinkyDungeonPlayerParole") {
		statsDraw.jail = {
			text: TextGet(jailstatus),
			icon: "infoJailSubmissive",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 12
		};
	} else if (jailstatus == "KinkyDungeonPlayerChase") {
		statsDraw.jail = {
			text: TextGet(jailstatus),
			icon: "infoJailPrisoner",
			category: "help", color: "#ffffff", bgcolor: "#000000", priority: 12
		};
	}

	let escape = KDCanEscape();
	statsDraw.key = {
		text: TextGet(escape ? "StatKeyEscapeKey" : "StatKeyEscapeNoKey"),
		icon: escape ? "infoKey" : "infoNoKey",
		category: "info", color: "#ffffff", bgcolor: "#000000", priority: 5
	};



	if (KinkyDungeonIsHandsBound(false, false)) {
		statsDraw.b_hands = {text: TextGet("KDStatHands"), category: "status", icon: "boundHands", color: "#ff5555", bgcolor: "#333333", priority: 10};
	} else {
		statsDraw.b_hands = {text: TextGet("KDStatFreeHands"), category: "status", icon: "status/freeHands", color: "#55ff55", bgcolor: "#333333", priority: 10};
	}
	if (KinkyDungeonIsArmsBound(false, false)) {
		statsDraw.b_arms = {text: TextGet("KDStatArms"), category: "status", icon: "boundArms", color: "#ff5555", bgcolor: "#333333", priority: 11};
	} else {
		statsDraw.b_arms = {text: TextGet("KDStatFreeArms"), category: "status", icon: "status/freeArms", color: "#55ff55", bgcolor: "#333333", priority: 11};
	}
	let gag = KinkyDungeonGagTotal(false);
	if (gag >= 0.99) {
		statsDraw.b_gag = {text: TextGet("KDStatGagFull"), category: "status", icon: "boundGagFull", color: "#ff5555", bgcolor: "#333333", priority: 7};
	} else if (gag > 0) {
		statsDraw.b_gag = {text: TextGet("KDStatGag"), category: "status", icon: "boundGag", color: "#ff5555", bgcolor: "#333333", priority: 7};
	} else {
		statsDraw.b_gag = {text: TextGet("KDStatFreeMouth"), category: "status", icon: "status/freeMouth", color: "#55ff55", bgcolor: "#333333", priority: 7};
	}
	if (KinkyDungeonBlindLevel > 0 || KinkyDungeonStatBlind > 0) {
		statsDraw.b_blind = {text: TextGet("KDStatBlind"), category: "status", icon: "boundBlind", color: "#ff5555", bgcolor: "#333333", priority: 8};
	} else {
		statsDraw.b_blind = {text: TextGet("KDStatFreeEyes"), category: "status", icon: "status/freeEyes", color: "#55ff55", bgcolor: "#333333", priority: 8};
	}
	if (KinkyDungeonMovePoints < 0) {
		statsDraw.b_speed = {text: TextGet("KDStatStun"), category: "status", icon: "boundStun", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel > 9) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedImmobile"), category: "status", icon: "boundImmobile", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel > 2) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedVerySlow"), category: "status", icon: "boundSlow3", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel == 2) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedSlow"), category: "status", icon: "boundSlow2", color: "#ff5555", bgcolor: "#333333", priority: 9};
	} else if (KinkyDungeonSlowLevel > 0) {
		statsDraw.b_speed = {text: TextGet("KDStatSpeedSlightlySlow"), category: "status", icon: "boundSlow1", color: "#ffff00", bgcolor: "#333333", priority: 9};
	} else {
		statsDraw.b_speed = {text: TextGet("KDStatFreeLegs"), category: "status", icon: "status/freeLegs", color: "#55ff55", bgcolor: "#333333", priority: 9};
	}
	if (KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) < 1.5) {
		statsDraw.shadow = {text: TextGet("KinkyDungeonPlayerShadow"), icon: "shadow", category: "status", color: "#a3a7c2", bgcolor: "#5e52ff", priority: 1};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerShadow"), X1, 900 - i * 35, 200, KDTextGray0, "#5e52ff", ); i++;
	}
	let sneak = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak", true);
	if (sneak > 2.5) {
		statsDraw.sneak = {text: TextGet("KinkyDungeonPlayerSneak"), category: "status", icon: "invisible", color: "#ceaaed", bgcolor: "#333333", priority: 2};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerSneak"), X1, 900 - i * 35, 200, KDTextGray0,"#ceaaed"); i++;
	} else {
		let visibility = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection"));
		if (visibility != 1.0) {
			statsDraw.visibility = {
				text: TextGet("KinkyDungeonPlayerVisibility") + Math.round(visibility * 100) + "%",
				count: Math.round(visibility * 100) + "%",
				icon: "visibility",
				countcolor: visibility < 1 ? "#c4efaa" : "#ff5555",
				category: "status", color: "#ceaaed", bgcolor: KDTextGray0, priority: 2
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerVisibility") + Math.round(visibility * 100) + "%", X1, 900 - i * 35, 200, KDTextGray0, "#ceaaed"); i++;
		}
	}
	let help = KinkyDungeonHasAllyHelp() || KinkyDungeonHasGhostHelp();
	if (help) {
		statsDraw.hashelp = {text: TextGet("KinkyDungeonPlayerHelp"), icon: "Help", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerHelp"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
	} else {
		if (KinkyDungeonGetAffinity(false, "Hook")) {
			statsDraw.helphook = {text: TextGet("KinkyDungeonPlayerHook"), icon: "HelpHook", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerHook"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonGetAffinity(false, "Sharp") || KinkyDungeonWeaponCanCut(true)) {
			statsDraw.helpsharp = {text: TextGet("KinkyDungeonPlayerSharp"), icon: "HelpSharp", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSharp"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonGetAffinity(false, "Edge")) {
			statsDraw.helpedge = {text: TextGet("KinkyDungeonPlayerEdge"), icon: "HelpCorner", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerEdge"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonGetAffinity(false, "Sticky")) {
			statsDraw.helpsticky = {text: TextGet("KinkyDungeonPlayerSticky"), icon: "HelpSticky", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSticky"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
		if (KinkyDungeonWallCrackAndKnife(false)) {
			statsDraw.helpcrack = {text: TextGet("KinkyDungeonPlayerCrack"), icon: "HelpCrack", category: "help", color: "#ffffff", bgcolor: "#333333", priority: 5};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerSticky"), X1, 900 - i * 35, 200, "#ffffff", "#333333"); i++;
		}
	}

	if (KinkyDungeonFlags.has("Quickness")) {
		statsDraw.quickness = {text: TextGet("KinkyDungeonPlayerQuickness"), icon: "quickness", category: "buffs", color: "#ffff00", bgcolor: "#333333", priority: 100};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerQuickness"), X1, 900 - i * 35, 200, "#ffff00", "#333333"); i++;
	}
	i = 0;

	let armor = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor");
	if (armor != 0) {
		statsDraw.armor = {text: TextGet("KinkyDungeonPlayerArmor") + Math.round(armor*10), count: (armor > 0 ? "+" : "") + Math.round(armor*10), category: "buffs", icon: "armor", color: "#fca570", bgcolor: "#333333", priority: armor};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerArmor") + Math.round(armor*10), X2, 900 - i * 25, 200, "#fca570", "#333333"); i++; i++;
	}
	let spellarmor = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist");
	if (spellarmor != 0) {
		statsDraw.spellarmor = {text: TextGet("KinkyDungeonPlayerSpellResist") + Math.round(spellarmor*10), count: (spellarmor > 0 ? "+" : "") + Math.round(spellarmor*10), category: "buffs", icon: "spellarmor", color: "#73efe8", bgcolor: "#333333", priority: spellarmor + 1};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerSpellResist") + Math.round(spellarmor*10), X2, 900 - i * 25, 200, "#73efe8", "#333333"); i++; i++;
	}
	let restraintblock = KDRestraintBlockPower(KinkyDungeonGetPlayerStat("RestraintBlock"), 10);
	if (restraintblock < 1)
		statsDraw.restraintblock = {
			text: TextGet("StatRestraintBlock").replace("Percent", ("") + Math.round((1 - restraintblock) * 100)),
			count: ("") + Math.round((1 - restraintblock) * 100) + "%",
			icon: "restraintblock",
			countcolor: "#65d45d",
			category: "buffs", color: "#ffffff", bgcolor: "#000000", priority: 20
		};
	let damageReduction = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageReduction");
	if (damageReduction > 0) {
		statsDraw.damageReduction = {
			text: TextGet("KinkyDungeonPlayerReduction") + Math.round(damageReduction*10),
			count: "-" + Math.round(damageReduction*10),
			category: "buffs", color: "#73efe8", bgcolor: "#333333", icon: "damageresist", priority: damageReduction * 3
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerReduction") + Math.round(damageReduction*10), X2, 900 - i * 25, 150, "#73efe8", "#333333"); i++; i++;
	}
	if (KinkyDungeonPlayerDamage) {
		let data = {
			buffdmg: 0,
			Damage: KinkyDungeonPlayerDamage,
		};
		KinkyDungeonSendEvent("calcDisplayDamage", data);
		let meleeDamage = (KinkyDungeonPlayerDamage.dmg) + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") + data.buffdmg;
		statsDraw.meleeDamage = {
			text: TextGet("KinkyDungeonPlayerDamage")
				.replace("DAMAGEDEALT", "" + Math.round(meleeDamage*10))
				.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + KinkyDungeonPlayerDamage.type)),
			count: "" + Math.round(meleeDamage*10),
			category: "info", color: "#ffffff", bgcolor: "#333333", icon: "infoDamageMelee", priority: 10.1
		};
	}
	let bindAmp = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp");
	if (bindAmp > 0) {
		statsDraw.bindAmp = {
			text: TextGet("KinkyDungeonPlayerBindBuff").replace("PERCENT", Math.round(bindAmp * 100) + "%"),
			count: "+" + Math.round(bindAmp * 100) + "%",
			countcolor: "#ffffff",
			icon: "dmgPlus/dmgbind",
			category: "dmg", color: "#ffae70", bgcolor: "#333333", priority: 5 + bindAmp * 20
		};
	}
	let magicResist = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "magicDamageResist"));
	let meleeResist = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "meleeDamageResist"));
	for (let dt of Object.values(KinkyDungeonDamageTypes)) {
		let color = dt.color;
		let type = dt.name;
		let DR = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, type + "DamageResist");
		let resist = KinkyDungeonMultiplicativeStat(DR);
		let boost = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, type + "DamageBuff");
		let melee = KinkyDungeonMeleeDamageTypes.includes(type);
		switch (type) {
			case "melee": boost += KDDamageAmpPerks + KDDamageAmpPerksMelee; break;
			case "magic": boost += KDDamageAmpPerks + KDDamageAmpPerksMagic; break;
			case "spell": boost += KDDamageAmpPerksSpell; break;
		}
		if (resist != 1.0) {
			statsDraw[type + "_resist"] = {
				text: TextGet("KinkyDungeonPlayerDamageResist")
					.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type).toLocaleLowerCase())
					.replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type).toLocaleLowerCase())
					.replace("DAMAGECATEGORY", TextGet(melee ? "KinkyDungeonDamageTypemelee" : "KinkyDungeonDamageTypemagic").toLocaleLowerCase())
					.replace("PERCENT1", Math.round(resist * (melee ? meleeResist : magicResist) * 100) + "%")
					.replace("PERCENT2", Math.round(DR * 100) + "%")
					.replace("PERCENT3", Math.round((melee ? meleeResist : magicResist) * 100) + "%"),
				count: (resist > 1 ? '+' : "") + Math.round(resist * 100 - 100) + "%",
				countcolor: resist < 1 ? "#c4efaa" : "#ff5555",
				icon: "dmg" + type,
				category: "dmg", color: color, bgcolor: "#333333", priority: resist * 10
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerDamageResist").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type)) + Math.round(resist * 100) + "%", X2, 900 - i * 25, 150, color, "#333333"); i++;
		}

		if (boost > 0) {
			statsDraw[type + "_buff"] = {
				text: TextGet("KinkyDungeonPlayerDamageBuff").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type)).replace("PERCENT", Math.round(boost * 100) + "%"),
				count: "+" + Math.round(boost * 100) + "%",
				countcolor: "#ffffff",
				icon: "dmgPlus/dmg" + type,
				category: "dmg", color: color, bgcolor: "#333333", priority: 5 + boost * 10
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerDamageResist").replace("DAMAGETYPE", TextGet("KinkyDungeonDamageType" + type)) + Math.round(resist * 100) + "%", X2, 900 - i * 25, 150, color, "#333333"); i++;
		}
	}

	i = 0;
	if (KinkyDungeonPlugCount > 0) {
		statsDraw.plugs = {
			text: TextGet("KinkyDungeonPlayerPlugged"),
			icon: "Plugged",
			category: "kinky", color: "#ff8888", bgcolor: "#333333", priority: 1,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerPlugged"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
		if (KinkyDungeonPlugCount > 1) {
			statsDraw.plugs = {
				text: TextGet("KinkyDungeonPlayerPluggedExtreme"),
				icon: "PluggedFull",
				category: "kinky", color: "#ff8888", bgcolor: "#333333", priority: 2,
			};
			//DrawTextFitKD(TextGet("KinkyDungeonPlayerPluggedExtreme"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
		}
	}
	if (KinkyDungeonVibeLevel > 0) {
		let locations = KDSumVibeLocations();
		let suff = "";
		if (locations.length == 1 && locations[0] == "ItemVulva") {
			suff = "";
		} else {
			let sum = "";
			if (locations.length > 3)
				sum = TextGet("KinkyDungeonPlayerVibratedLocationMultiple");
			else for (let l of locations) {
				if (sum) sum = sum + ", ";
				sum = sum + TextGet("KinkyDungeonPlayerVibratedLocation" + l);
			}
			suff = ` (${sum})`;
		}
		statsDraw.vibe = {
			text: TextGet("KinkyDungeonPlayerVibrated" + Math.max(0, Math.min(Math.floor(KinkyDungeonVibeLevel), 5))) + suff,
			category: "kinky", color: "#ff8888", bgcolor: "#333333", priority: 11,
			icon: "Vibe" + Math.max(0, Math.min(Math.floor(KinkyDungeonVibeLevel), 5)),
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerVibrated" + Math.max(0, Math.min(Math.floor(KinkyDungeonVibeLevel), 5))) + suff, X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
	}
	if (KDGameData.OrgasmStamina > 0) {
		statsDraw.sex = {
			text: TextGet("KinkyDungeonPlayerStatisfied"),
			icon: "Satisfied",
			category: "kinky", color: "#ff88aa", bgcolor: "#333333", priority: 7,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerStatisfied"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
	} else if (KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsCrave) {
		statsDraw.sex = {
			text: TextGet("KinkyDungeonPlayerEdged"),
			icon: "Edged",
			category: "kinky", color: "#ff0000", bgcolor: "#333333", priority: 7,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerEdged"), X3, 900 - i * 35, 260, "#ff0000", "#333333"); i++;
	}
	if (KDGameData.CurrentVibration  && KDGameData.CurrentVibration.denyTimeLeft > 0) {
		statsDraw.deny = {
			text: TextGet("KinkyDungeonPlayerDenied"),
			icon: "Denied",
			category: "kinky", color: "#ff0000", bgcolor: "#333333", priority: 12,
		};
		//DrawTextFitKD(TextGet("KinkyDungeonPlayerDenied"), X3, 900 - i * 35, 260, "#ff8888", "#333333"); i++;
	}

	i = 0;
	for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
		if ((b.aura || b.labelcolor) && b.duration > 0) {
			let count = b.maxCount > 1 ? b.maxCount - (b.currentCount ? b.currentCount : 0) : 0;
			let pri = 0;
			if (b.duration) pri += Math.min(90, b.duration);
			if (count) pri += Math.min(10, count);
			statsDraw[b.id] = {
				text: TextGet("KinkyDungeonBuff" + b.id) + (count ? ` ${count}/${b.maxCount}` : "") + ((b.duration > 1 && b.duration < 1000) ? ` (${b.duration})` : ""),
				count: (count ? `${count}/${b.maxCount}` : "") + ((b.duration > 1 && b.duration < 1000) ? ((count ? " " : "") + `${b.duration}`) : ""),
				icon: KDBuffSprites[b.id] ? "buff/buff" + b.id : undefined,
				//countcolor: b.aura ? b.aura : b.labelcolor,
				category: "buffs", color: b.aura ? b.aura : b.labelcolor, bgcolor: "#333333", priority: pri,
			};
			//DrawTextFitKD(TextGet("KinkyDungeonBuff" + b.id) + (count ? ` ${count}/${b.maxCount}` : "") + ((b.duration > 1 && b.duration < 1000) ? ` (${b.duration})` : ""), 790, 900 - i * 35, 275, b.aura ? b.aura : b.labelcolor, "#333333"); i++;
		}

	}

	i = 0;
	for (let perk of KinkyDungeonStatsChoice.keys()) {
		if (KDPerkIcons[perk] && KDPerkIcons[perk]()) {
			statsDraw["p" + perk] = {
				text: TextGet("KinkyDungeonStatDesc" + KinkyDungeonStatsPresets[perk].id),
				count: KDPerkCount[perk] ? KDPerkCount[perk]() : undefined,
				icon: "perk/perk" + perk,
				//countcolor: b.aura ? b.aura : b.labelcolor,
				category: "perks", color: "#ffffff", bgcolor: "#333333", priority: 0,
			};
		}
	}

	let II = 0;
	let spriteSize = 46;
	let sorted = Object.values(statsDraw).sort((a, b) => {
		return (b.priority + KDStatsOrder[b.category]) - (a.priority + KDStatsOrder[a.category]);
	});
	let minYY = 510;
	let minXX = 1750;
	let maxXX = 2000 - 5 - spriteSize;
	let YY = minYY;
	let textWidth = 44;
	let XX = minXX;
	let XXspacing = spriteSize + 3;
	let YYspacing = spriteSize + 3;
	let currCategory = "";
	for (let stat of sorted) {
		if (XX > minXX && (KDStatsSkipLine[currCategory] || KDStatsSkipLineBefore[stat.category]) && currCategory != stat.category) {
			XX = minXX;
			YY += YYspacing;
		}
		currCategory = stat.category;

		if (stat.count)
			DrawTextFitKD(stat.count, XX + spriteSize/2, YY + spriteSize/2 - 10, textWidth, stat.countcolor || "#ffffff", "#000000", 16, undefined, 114, 0.8, 5);
		KDDraw(kdcanvas, kdpixisprites, "stat" + II, KinkyDungeonRootDirectory + "Buffs/" + (stat.icon || "buff/buff") + ".png",
			XX, YY - Math.ceil(spriteSize/2), undefined, undefined);

		if (MouseIn(XX, YY - Math.ceil(spriteSize/2), spriteSize, spriteSize)) {
			DrawTextFitKD(stat.text, XX - 10, YY, 1250, stat.color, "#000000", 22, "right", 160, 1.0, 8);
		}
		XX += XXspacing;
		if (XX > maxXX) {
			XX = minXX;
			YY += YYspacing;
		}
		II++;
	}

	// Draw the struggle buttons if applicable
	KinkyDungeonDrawStruggleHover = false;
	if (!KinkyDungeonShowInventory && ((KinkyDungeonDrawStruggle > 0 || MouseIn(0, 0, 500, 1000)) && KinkyDungeonStruggleGroups))
		for (let sg of KinkyDungeonStruggleGroups) {
			let ButtonWidth = 60;
			let x = 5 + ((!sg.left) ? (490 - ButtonWidth) : 0);
			let y = 42 + sg.y * (ButtonWidth + 46);

			let item = KinkyDungeonGetRestraintItem(sg.group);
			let drawLayers = 0;

			let MY = 200;
			let surfaceItems = [];
			let dynamicList = [];
			let noRefreshlists = false;
			if (KDStruggleGroupLinkIndex[sg.group] && item && item.dynamicLink) {
				surfaceItems = KDDynamicLinkListSurface(item);
				dynamicList = KDDynamicLinkList(item, true);
				noRefreshlists = true;
				if (!KDStruggleGroupLinkIndex[sg.group] || KDStruggleGroupLinkIndex[sg.group] >= surfaceItems.length) {
					KDStruggleGroupLinkIndex[sg.group] = 0;
				}
				item = surfaceItems[KDStruggleGroupLinkIndex[sg.group]];
			}
			if (MouseIn(((!sg.left) ? (260) : 0), y-48, 230, (ButtonWidth + 45)) && sg) {
				let data = {
					struggleGroup: sg,
					struggleIndex: KDStruggleGroupLinkIndex ? KDStruggleGroupLinkIndex[sg.group] : 0,
					surfaceItems: surfaceItems,
					dynamicList: dynamicList,
					extraLines: [],
					extraLineColor: [],
				};
				KinkyDungeonSendEvent("drawSGTooltip", data);
				let lastO = 0;

				if (data.extraLines.length > 0) {
					for (let lineIndex = 0; lineIndex < data.extraLines.length; lineIndex++) {
						DrawTextKD(data.extraLines[lineIndex], 530, MY + lastO * 45, data.extraLineColor[lineIndex] || "#ffffff", "#333333", undefined, "left");
						lastO += 1;
					}
				}

				// 0 = no draw
				// 1 = grey
				// 2 = white
				if (dynamicList.length > 0 || (item && item.dynamicLink)) {
					if (!noRefreshlists) {
						surfaceItems = KDDynamicLinkListSurface(item);
						dynamicList = KDDynamicLinkList(item, true);
					}
					if (surfaceItems.length <= 1) {
						// Delete if there are no additional surface items
						delete KDStruggleGroupLinkIndex[sg.group];
						drawLayers = 1;
					} else {
						if (!KDStruggleGroupLinkIndex[sg.group] || KDStruggleGroupLinkIndex[sg.group] >= surfaceItems.length) {
							KDStruggleGroupLinkIndex[sg.group] = 0;
						}
						item = surfaceItems[KDStruggleGroupLinkIndex[sg.group]];

						drawLayers = 2;
					}

					let O = 1;
					MainCanvas.textAlign = "left";
					let drawn = false;
					for (let d of dynamicList) {
						if (d != item)//KDRestraint(item) && (!KDRestraint(item).UnLink || d.name != KDRestraint(item).UnLink))
						{
							drawn = true;
							let msg = TextGet("Restraint" + d.name);
							DrawTextKD(msg, 530, MY + O * 45, "#ffffff", "#333333");
							O++;
						}
					}
					lastO = O;
					O = 0;
					if (drawn) {
						DrawTextKD(TextGet("KinkyDungeonItemsUnderneath"), 530, MY + O * 45, "#ffffff", "#333333");
					}
					O = lastO + 1;
					MainCanvas.textAlign = "center";
				}
				if (lastO) lastO += 1;
				if (item && KDRestraint(item) && KinkyDungeonStrictness(false, KDRestraint(item).Group)) {
					let strictItems = KinkyDungeonGetStrictnessItems(KDRestraint(item).Group);
					let O = lastO + 1;
					MainCanvas.textAlign = "left";
					let drawn = false;
					for (let s of strictItems) {
						drawn = true;
						let msg = TextGet("Restraint" + s);
						DrawTextKD(msg, 530, MY + O * 45, "#ffffff", "#333333");
						O++;
					}
					O = lastO;
					if (drawn) {
						DrawTextKD(TextGet("KinkyDungeonItemsStrictness"), 530, MY + O * 45, "#ffffff", "#333333");
					}
					MainCanvas.textAlign = "center";
				}
			}

			if (sg.left) {
				MainCanvas.textAlign = "left";
			} else {
				MainCanvas.textAlign = "right";
			}

			let color = "#ffffff";
			let locktext = "";
			if (item && item.lock) {color = "#ffaadd";}

			let GroupText = (sg.name && item) ? ("Restraint" + item.name) : ("KinkyDungeonGroup"+ sg.group); // The name of the group to draw.

			DrawTextFitKD(TextGet(GroupText) + locktext, x + ((!sg.left) ? ButtonWidth - (drawLayers ? ButtonWidth : 0) : 0), y-24, 240 - (drawLayers ? ButtonWidth : 0), color, "#333333");
			MainCanvas.textAlign = "center";

			if (drawLayers) {
				DrawButtonKDEx("surfaceItems"+sg.group, (bdata) => {
					if (surfaceItems.length > 1 && MouseInKD("surfaceItems"+sg.group)) {
						if (!KDStruggleGroupLinkIndex[sg.group]) KDStruggleGroupLinkIndex[sg.group] = 1;
						else KDStruggleGroupLinkIndex[sg.group] = KDStruggleGroupLinkIndex[sg.group] + 1;
					}
					return true;
				}, drawLayers == 2, x + (sg.left ? 240 - ButtonWidth : 12), y - ButtonWidth/2 - 20, 48, 48, "", drawLayers == 2 ? "#ffffff" : "#888888", KinkyDungeonRootDirectory + "Layers.png", "");
			}

			i = 0;
			if (item && (MouseIn(((!sg.left) ? (260) : 0), y-48, 230, (ButtonWidth + 70)) || KinkyDungeonDrawStruggle > 1)) {
				let r = KDRestraint(item);

				if (!KinkyDungeonDrawStruggleHover) {
					KinkyDungeonDrawStruggleHover = true;
				}

				let buttons = ["Struggle", "CurseInfo", "CurseUnlock", "Cut", "Remove", "Pick"];

				if (KinkyDungeonControlsEnabled())
					for (let button_index = 0; button_index < buttons.length; button_index++) {
						let btn = buttons[sg.left ? button_index : (buttons.length - 1 - button_index)];
						if (btn == "Struggle") {
							DrawButtonVis(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "Struggle.png", "", undefined, undefined, KDButtonColorIntense); i++;
						} else if ((item.curse || r.curse) && btn == "CurseInfo") {
							DrawButtonVis(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "CurseInfo.png", "", undefined, undefined, KDButtonColorIntense); i++;
						} else if ((item.curse || r.curse) && btn == "CurseUnlock" && KinkyDungeonCurseAvailable(item, (item.curse || r.curse))) {
							DrawButtonVis(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "CurseUnlock.png", "", undefined, undefined, KDButtonColorIntense); i++;
						} else if (!(item.curse || r.curse) && !sg.blocked && btn == "Remove") {
							let toolSprite = (item.lock) ? KDGetLockVisual(item) : "Buckle.png";
							DrawButtonVis(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + toolSprite, "", undefined, undefined, KDButtonColorIntense); i++;
						} else if (!(item.curse || r.curse) && !sg.blocked && btn == "Cut"
							&& (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) || KinkyDungeonGetAffinity(false, "Sharp"))
							&& !sg.noCut) {
							let name = ((KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && !KinkyDungeonPlayerDamage.unarmed) ? "Items/" + KinkyDungeonPlayerDamage.name + ".png" : "Cut.png");
							DrawButtonVis(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "",
									(sg.magic) ? "#8394ff" : "#ffffff", KinkyDungeonRootDirectory + name, "", undefined, undefined, KDButtonColorIntense, undefined, undefined, true);
							i++;
						} else if (!(item.curse || r.curse) && !sg.blocked && btn == "Pick" && KinkyDungeonLockpicks > 0 && item.lock) {
							DrawButtonVis(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "UseTool.png", "", undefined, undefined, KDButtonColorIntense); i++;
						}
					}
			}
		}


	if (KinkyDungeonDrawStruggle > 0) DrawButtonVis(510, 925, 120, 60, "", KinkyDungeonStruggleGroups.length > 0 ? "#ffffff" : "#333333", KinkyDungeonRootDirectory + "Hide" + (KinkyDungeonDrawStruggle > 1 ? "Full" : "True") + ".png", "");
	else DrawButtonVis(510, 925, 120, 60, "", KinkyDungeonStruggleGroups.length > 0 ? "#ffffff" : "#333333", KinkyDungeonRootDirectory + "HideFalse.png", "");

	DrawButtonVis(510, 825, 60, 90, "", "#ffffff", KinkyDungeonRootDirectory + (KinkyDungeonShowInventory ? "BackpackOpen.png" : "Backpack.png"), "");
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.special) {
		if (MouseIn(580, 825, 50, 90)) DrawTextFitKD(TextGet("KinkyDungeonSpecial" + KinkyDungeonPlayerDamage.name), MouseX, MouseY - 150, 750, "#ffffff", "#333333");
		DrawButtonVis(580, 825, 50, 90, "", "#ffffff", KinkyDungeonRootDirectory + "Ranged.png", "");
	}


	if (KinkyDungeonTargetTile) {
		if (KinkyDungeonTargetTile.Type == "Lock" && KinkyDungeonTargetTile.Lock) {
			let action = false;
			if (KinkyDungeonLockpicks > 0 && (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue"))) {
				DrawButtonVis(KDModalArea_x + 313, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonPickDoor"), "#ffffff", "", "");
				action = true;
				KDModalArea = true;
			}

			if (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue")) {
				DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoor"),
				(KinkyDungeonTargetTile.Lock.includes("Red") && KinkyDungeonRedKeys > 0)
				|| (KinkyDungeonTargetTile.Lock.includes("Blue") && KinkyDungeonBlueKeys > 0) ? "#ffffff" : "#ff0000", "", "");
				action = true;
				KDModalArea = true;
			}
			if ((KinkyDungeonTargetTile.Lock.includes("Purple"))) {
				let spell = KinkyDungeonFindSpell("CommandWord", true);
				DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
				(KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff0000",
				"", "");
				action = true;
				KDModalArea = true;
			}

			if (!action) DrawTextKD(TextGet("KinkyDungeonLockedDoor"), KDModalArea_x + 300, KDModalArea_y + 50, "#ffffff", "#333333");

			if (KinkyDungeonTargetTile.Lock.includes("Red"))
				DrawTextKD(TextGet("KinkyRedLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
			else if (KinkyDungeonTargetTile.Lock.includes("Blue"))
				DrawTextKD(TextGet("KinkyBlueLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
			else if (KinkyDungeonTargetTile.Lock.includes("Purple"))
				DrawTextKD(TextGet("KinkyPurpleLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
		} else if (KinkyDungeonTargetTile.Type == "Shrine") {
			KinkyDungeonDrawShrine();
		} else if (KDObjectDraw[KinkyDungeonTargetTile.Type]) {
			KDObjectDraw[KinkyDungeonTargetTile.Type]();
		} else if (KinkyDungeonTargetTile.Type == "Door") {
			if (KinkyDungeonTargetTile.Lock) {
				let action = false;
				if (KinkyDungeonLockpicks > 0 && (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue"))) {
					DrawButtonVis(KDModalArea_x + 313, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonPickDoor"), "#ffffff", "", "");
					action = true;
					KDModalArea = true;
				}

				if (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue")) {
					DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoor"),
					(KinkyDungeonTargetTile.Lock.includes("Red") && KinkyDungeonRedKeys > 0)
					|| (KinkyDungeonTargetTile.Lock.includes("Blue") && KinkyDungeonBlueKeys > 0) ? "#ffffff" : "#ff0000", "", "");
					action = true;
					KDModalArea = true;
				}

				if ((KinkyDungeonTargetTile.Lock.includes("Purple"))) {
					let spell = KinkyDungeonFindSpell("CommandWord", true);
					DrawButtonVis(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60, TextGet("KinkyDungeonUnlockDoorPurple"),
					(KinkyDungeonStatMana >= KinkyDungeonGetManaCost(spell)) ? "#ffffff" : "#ff0000",
					"", "");
					action = true;
					KDModalArea = true;
				}

				if (!action) DrawTextKD(TextGet("KinkyDungeonLockedDoor"), KDModalArea_x + 300, KDModalArea_y + 50, "#ffffff", "#333333");

				if (KinkyDungeonTargetTile.Lock.includes("Red"))
					DrawTextKD(TextGet("KinkyRedLock"), KDModalArea_x + 25, KDModalArea_y + 50, "#ffffff", "#333333");
				else if (KinkyDungeonTargetTile.Lock.includes("Blue"))
					DrawTextKD(TextGet("KinkyBlueLock"), KDModalArea_x + 25, KDModalArea_y + 50, "#ffffff", "#333333");
				else if (KinkyDungeonTargetTile.Lock.includes("Purple"))
					DrawTextKD(TextGet("KinkyPurpleLock"), KDModalArea_x + 50, KDModalArea_y + 50, "#ffffff", "#333333");
			} else {
				KDModalArea = true;
				DrawButtonVis(KDModalArea_x + 25, KDModalArea_y + 25, 250, 60, TextGet("KinkyDungeonCloseDoor"), "#ffffff");
			}
		}
	}

	let bx = 650 + 15;
	let bwidth = 165;
	let bspacing = 5;
	let bindex = 0;
	DrawButtonKDEx("goInv", (bdata) => {
		KinkyDungeonDrawState = "Inventory";
		return true;
	}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonInventory"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_inventory.png", undefined, undefined, false, "", 24, true); bindex++;
	DrawButtonKDEx("goRep", (bdata) => {
		KinkyDungeonDrawState = "Reputation";
		return true;
	}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonReputation"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_reputation.png", undefined, undefined, false, "", 24, true); bindex++;
	DrawButtonKDEx("goSpells", (bdata) => {
		KinkyDungeonDrawState = "MagicSpells";
		return true;
	}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, TextGet("KinkyDungeonMagic"), "#ffffff", KinkyDungeonRootDirectory + "UI/button_spells.png", undefined, undefined, false, "", 24, true); bindex++;

	let logtxt = KinkyDungeonNewLoreList.length > 0 ? TextGet("KinkyDungeonLogbookN").replace("N", KinkyDungeonNewLoreList.length): TextGet("KinkyDungeonLogbook");
	DrawButtonKDEx("goLog", (bdata) => {
		KinkyDungeonDrawState = "Logbook";
		KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
		return true;
	}, true, bx + bindex * (bwidth + bspacing), 925, bwidth, 60, logtxt, "#ffffff", KinkyDungeonRootDirectory + "UI/button_logbook.png", undefined, undefined, false, "", 24, true); bindex++;


	bx = 650 + bindex * (bwidth + bspacing) + 45;
	bwidth = 145;
	bspacing = 5;
	bindex = 0;

	if (KinkyDungeonSpellChoices.length > KinkyDungeonSpellChoiceCountPerPage) {
		DrawButtonKDEx("CycleSpellButton", () => {
			KDCycleSpellPage();
			return true;
		}, true, 1650, 95, 90, 35, `pg. ${KDSpellPage}`, "#ffffff");
	}
	for (let ii = KinkyDungeonSpellChoiceCount - 1; ii > 0; ii--) {
		if (!(KinkyDungeonSpellChoices[ii] >= 0)) KinkyDungeonSpellChoices = KinkyDungeonSpellChoices.slice(0, ii);
		else break;
	}

	let KDUpcastLevel = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower");

	if (KinkyDungeonSpellChoices.length > 0) {
		let empowerY = Math.min(7, KinkyDungeonSpellChoices.length);
		let empowerYY = empowerY * KinkyDungeonSpellChoiceOffset + 140;
		let hasUpcast = KDCanUpcast();
		let padY = 90 + (KinkyDungeonSpellChoices.length > KinkyDungeonSpellChoiceCountPerPage ? 0 : 40);
		let pages = Math.floor(KinkyDungeonSpellChoices.length / KinkyDungeonSpellChoiceCountPerPage);
		let pageExtra = 40;
		FillRectKD(
			kdcanvas, kdpixisprites, "spellbg", {
				Left: 1600 - pages * pageExtra, Top: padY, Width: 145 + pages * pageExtra,
				Height: empowerYY - padY + 80,
				Color: "#000000", alpha: 0.4, zIndex: 70
			}
		);
		DrawButtonKDEx("empowerSpell",
			(bdata) => {
				KDSendInput("upcast", {});
				return true;
			}, true,
			1700 - 80, empowerYY, 76, 76, "", "",
			KinkyDungeonRootDirectory + "/Spells/" + KDEmpowerSprite + (hasUpcast ? "" : "Fail") + ".png", undefined, false, true,
		);
		if (KDUpcastLevel > 0)
			DrawButtonKDEx("empowerSpellCancel",
				(bdata) => {
					KDSendInput("upcastcancel", {});
					return true;
				}, true,
				1700 - 80, empowerYY + KinkyDungeonSpellChoiceOffset, 76, 76, "", "",
				KinkyDungeonRootDirectory + "/Spells/" + KDEmpowerSprite + "Cancel" + ".png", undefined, false, true,
			);
		if (MouseIn(1700 - 80, empowerYY, 76, 76)) {
			DrawTextFitKD(TextGet("KDSpellEmpower" + (hasUpcast ? "" : "Fail")), 1700 - 100, empowerYY + 40, 1000, "#ffffff", undefined, undefined, "right");
		}
		if (MouseIn(1700 - 80, empowerYY + KinkyDungeonSpellChoiceOffset, 76, 76)) {
			DrawTextFitKD(TextGet("KDSpellEmpowerCancel"), 1700 - 100, empowerYY + 40 + KinkyDungeonSpellChoiceOffset, 1000, "#ffffff", undefined, undefined, "right");
		}
	}


	for (i = 0; i < KinkyDungeonSpellChoiceCountPerPage; i++) {
		let index = i + KDSpellPage * KinkyDungeonSpellChoiceCountPerPage;
		let buttonWidth = 40;
		let buttonPad = 80;
		if (KinkyDungeonSpellChoices[i])
			DrawButtonVis(1650 + (90 - buttonWidth), 140 + i*KinkyDungeonSpellChoiceOffset, buttonWidth, buttonWidth, "", "#ffffff", KinkyDungeonRootDirectory + "ChangeSpell.png", undefined, undefined, true);
		let tooltip = false;
		let buttonDim = {
			x: 1700 - buttonPad,
			y: 140 + i*KinkyDungeonSpellChoiceOffset,
			w: 76,
			h: 76,
			wsmall: 46,
			hsmall: 46,
		};


		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[index]] && !KinkyDungeonSpells[KinkyDungeonSpellChoices[index]].passive) {
			let spell = KDGetUpcast(KinkyDungeonSpells[KinkyDungeonSpellChoices[index]].name, KDUpcastLevel) || KinkyDungeonSpells[KinkyDungeonSpellChoices[index]];//KinkyDungeonSpells[KinkyDungeonSpellChoices[index]];
			let components = KinkyDungeonGetCompList(spell);
			let comp = "";


			if (spell.components && spell.components.length > 0) comp = components;
			// Render MP cost
			let cost = Math.round(KinkyDungeonGetManaCost(spell) * 10) + "m";
			DrawTextFitKD(cost, 1650 + (89 - buttonWidth/2), 140 + i*KinkyDungeonSpellChoiceOffset + buttonWidth*1.4, buttonWidth * 0.35 * Math.min(3, cost.length), "#ccddFF", "#333333");

			MainCanvas.textAlign = "center";

			// Draw the main spell icon
			if (spell.type == "passive" && KinkyDungeonSpellChoicesToggle[index]) {
				FillRectKD(kdcanvas, kdpixisprites, "rectspell" + i, {
					Left: 1700 - buttonPad - 4,
					Top: 140 - 4 + i*KinkyDungeonSpellChoiceOffset,
					Width: 84,
					Height: 84,
					Color: "#dbdbdb",
					zIndex: 70,
				});
				FillRectKD(kdcanvas, kdpixisprites, "rectspell2" + i, {
					Left: 1700 - buttonPad - 4 + 5,
					Top: 140 - 4 + i*KinkyDungeonSpellChoiceOffset + 5,
					Width: 74,
					Height: 74,
					Color: "#101010",
					zIndex: 70,
				});
			}
			DrawButtonKD("SpellCast" + index, true, buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, "", "rgba(0, 0, 0, 0)", KinkyDungeonRootDirectory + "Spells/" + spell.name + ".png", "", false, true);
			if ((KinkyDungeoCheckComponents(spell).length > 0 || (spell.components.includes("Verbal") && KinkyDungeonGagTotal() > 0 && !spell.noMiscast))) {
				let sp = "SpellFail";
				if (spell.components.includes("Verbal") && KinkyDungeonGagTotal() < 1 && !KinkyDungeonStatsChoice.get("Incantation")) {
					sp = "SpellFailPartial";
				}
				KDDraw(kdcanvas, kdpixisprites, "spellFail" + "SpellCast" + i, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
					buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h, undefined, {
						zIndex: 115,
					});
				//DrawImage(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2, buttonDim.y + 2,);
			}
			if (KDHasUpcast(spell.name)) {
				KDDraw(kdcanvas, kdpixisprites, "spellCanUpcast" + i, KinkyDungeonRootDirectory + "Spells/" + "CanUpcast" + ".png",
					buttonDim.x, buttonDim.y, 72, 72, undefined, {
						zIndex: 114,
					});
			}

			if (MouseIn(buttonDim.x, buttonDim.y, buttonDim.w, buttonDim.h)) {
				MainCanvas.textAlign = "right";
				DrawTextFitKD(TextGet("KinkyDungeonSpell"+ spell.name), 1700 - buttonPad - 30, 140 + buttonPad/2 + i*KinkyDungeonSpellChoiceOffset, 300, "#ffffff", "#333333");
				MainCanvas.textAlign = "center";
				DrawTextFitKD(comp, 1700 - 2 - buttonPad / 2, 200 + i*KinkyDungeonSpellChoiceOffset, Math.min(10 + comp.length * 8, buttonPad), "#ffffff", KDTextGray0);
				tooltip = true;
			}
			// Render number
			DrawTextFitKD((i+1) + "", buttonDim.x + 10, buttonDim.y + 13, 10, "#ffffff", KDTextGray0);


			//let cost = KinkyDungeonGetManaCost(spell) + TextGet("KinkyDungeonManaCost") + comp;
		}
		if (!tooltip) {
			let icon = 0;
			// Draw icons for the other pages, if applicable
			for (let page = 1; page <= Math.floor((KinkyDungeonSpellChoices.length - 1) / KinkyDungeonSpellChoiceCountPerPage); page += 1) {
				let pg = KDSpellPage + page;
				if (pg > Math.floor(KinkyDungeonSpellChoices.length / KinkyDungeonSpellChoiceCountPerPage)) pg -= 1 + Math.floor((KinkyDungeonSpellChoices.length - 1) / KinkyDungeonSpellChoiceCountPerPage);

				// Now we have our page...
				let indexPaged = (i + pg * KinkyDungeonSpellChoiceCountPerPage) % (KinkyDungeonSpellChoiceCount);
				let spellPaged = KinkyDungeonSpells[KinkyDungeonSpellChoices[indexPaged]];
				if (spellPaged) {
					// Draw the main spell icon
					if (spellPaged.type == "passive" && KinkyDungeonSpellChoicesToggle[indexPaged]) {
						FillRectKD(kdcanvas, kdpixisprites, page + "pgspell" + i, {
							Left: 1700 - buttonPad - 4 - buttonDim.wsmall * page,
							Top: 140 - 4 + i*KinkyDungeonSpellChoiceOffset,
							Width: 54,
							Height: 54,
							Color: "#333333",
							zIndex: 70,
						});
						FillRectKD(kdcanvas, kdpixisprites, page + "pgspell2" + i, {
							Left: 1700 - buttonPad - 4 - buttonDim.wsmall * page + 5,
							Top: 140 - 4 + i*KinkyDungeonSpellChoiceOffset + 5,
							Width: 44,
							Height: 44,
							Color: KDTextGray0,
							zIndex: 70,
						});
					}
					icon += 1;
					DrawButtonKD("SpellCast" + indexPaged, true, buttonDim.x - buttonDim.wsmall * page, buttonDim.y, buttonDim.wsmall, buttonDim.hsmall, "",
						"rgba(0, 0, 0, 0)", "", "", false, true);
					KDDraw(kdcanvas, kdpixisprites, "spellIcon" + icon + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + spellPaged.name + ".png"
						,buttonDim.x - buttonDim.wsmall * page, buttonDim.y, buttonDim.wsmall, buttonDim.hsmall, undefined, {
							zIndex: 114,
						});
					//DrawImageEx(KinkyDungeonRootDirectory + "Spells/" + spellPaged.name + ".png", buttonDim.x - buttonDim.wsmall * page, buttonDim.y, {
					//Width: buttonDim.wsmall,
					//Height: buttonDim.hsmall,
					//});
					if ((KinkyDungeoCheckComponents(spellPaged).length > 0 || (spellPaged.components.includes("Verbal") && KinkyDungeonGagTotal() > 0 && !spellPaged.noMiscast))) {
						let sp = "SpellFail";
						if (spellPaged.components.includes("Verbal") && KinkyDungeonGagTotal() < 1 && !KinkyDungeonStatsChoice.get("Incantation")) {
							sp = "SpellFailPartial";
						}
						KDDraw(kdcanvas, kdpixisprites, "spellFail" + icon + "," + page + "," + indexPaged, KinkyDungeonRootDirectory + "Spells/" + sp + ".png",
							buttonDim.x + 2 - buttonDim.wsmall * page, buttonDim.y + 2, buttonDim.wsmall, buttonDim.hsmall, undefined, {
								zIndex: 115,
							});

						//DrawImageEx(KinkyDungeonRootDirectory + "Spells/" + sp + ".png", buttonDim.x + 2 - buttonDim.wsmall * page, buttonDim.y + 2, {
						//Width: buttonDim.wsmall,
						//Height: buttonDim.hsmall,
						//});
					}
				}
			}
		}
	}
	KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelayPing);

}

function KDCycleSpellPage(reverse) {
	if (reverse) {
		if (KDSpellPage <= 0) {
			KDSpellPage = KinkyDungeonSpellChoices.length - 1;
		} else KDSpellPage -= 1;
	} else if (KDSpellPage * KinkyDungeonSpellChoiceCountPerPage + KinkyDungeonSpellChoiceCountPerPage >= KinkyDungeonSpellChoices.length) {
		KDSpellPage = 0;
	} else KDSpellPage += 1;
}

function KinkyDungeonDrawProgress(x, y, amount, totalIcons, maxWidth, sprite) {
	let iconCount = 6;
	let scale = maxWidth / (72 * iconCount);
	let interval = 1/iconCount;
	let numIcons = amount / interval;
	let xOffset = (6 - totalIcons) * maxWidth / 6 / 2;
	for (let icon = 0; icon < totalIcons; icon += 1) {
		DrawImageZoomCanvas(KinkyDungeonRootDirectory + "Icons/" + sprite +"Empty.png", MainCanvas, 0, 0, 72, 72, xOffset + x + 72 * scale * icon, y, 72*scale, 72*scale, false);
	}
	for (let icon = 0; icon < numIcons && numIcons > 0; icon += 1) {
		DrawImageZoomCanvas(KinkyDungeonRootDirectory + "Icons/" + sprite + ((icon + 0.5 <= numIcons) ? "Full.png" : "Half.png"), MainCanvas, 0, 0, 72, 72, xOffset + x + 72 * scale * icon, y, 72*scale, 72*scale, false);
	}
}

function KinkyDungeonCanSleep() {
	if (KDGameData.CurrentVibration) return false;
	else return true;
}

function KDLinspace(min, max, steps) {
	if (steps == 0 || Number.isNaN(steps)) return [];
	let spaces = [];
	for (let i = 0; i < steps; i+= 1) {
		spaces.push(min + i * (max - min) / steps);
	}
	return spaces;
}

function KDSteps(max, step, maxStep = 20) {
	if (step == 0 || Number.isNaN(step)) return [];
	let spaces = [];
	for (let i = 0; i < Math.ceil(Math.abs(max / step)) && i < maxStep; i+= 1) {
		spaces.push(step > 0 ? step * i : max + step * i);
	}
	return spaces;
}

function KinkyDungeonDrawStats(x, y, width, heightPerBar) {
	// Draw labels
	let buttonWidth = 48;
	let suff = (!KinkyDungeonCanDrink()) ? "Unavailable" : "";
	if (suff == "Unavailable") {
		let allowPotions = KinkyDungeonPotionCollar();
		if (allowPotions)
			suff = "Inject";
	}
	let buttonOff = 5;
	let offBarHeight = heightPerBar*0.12;

	let distRate = KDGetDistractionRate(0);

	// Draw distraction
	KinkyDungeonBar(x, y + heightPerBar*0.45, width, heightPerBar*0.45, 100*KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax, "#ff5277",
		"#692464", KDGameData.LastAP/KinkyDungeonStatDistractionMax * 100, "#ffa1b4",
		distRate < 0 ? KDSteps(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax, KDGetDistractionRate(0)/KinkyDungeonStatDistractionMax, 3) : undefined, distRate < 0 ? "#692464" : undefined, distRate < 0 ? "#692464" : undefined);
	//KinkyDungeonBar(x, y + heightPerBar*0.9 - offBarHeight, width, offBarHeight, 100*KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax, "#ffa4b8", "none", undefined, undefined, undefined, undefined, undefined, 56);
	if (KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax >= 0.05)
		KDDraw(kdcanvas, kdpixisprites, "dist_lower", KinkyDungeonRootDirectory + "UI/Heart.png",
			x - heightPerBar*0.32 + width * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax,
			y + heightPerBar*0.53,
			undefined, undefined, undefined, {
				zIndex: 150,
			});
	MainCanvas.textAlign = "right";
	DrawTextFitKD(TextGet("StatDistraction").replace("PERCENT", "" + Math.round(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100)), x+width, y + 10, width - 2*buttonWidth, (KinkyDungeonStatDistraction > 0) ? "#ffffff" : "pink", "#333333", 24);
	DrawButtonVis(x, y - buttonOff, buttonWidth, buttonWidth, "", (KinkyDungeonStatDistraction > 0 && KinkyDungeonItemCount("PotionFrigid")) ? "#333333" : "Pink",
		KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Frigid") + suff + ".png", "", false, true);
	MainCanvas.textAlign = "left";
	DrawTextFitKD("x" + KinkyDungeonItemCount("PotionFrigid"), x + buttonWidth, y+10, buttonWidth, "#ffffff", "#333333", 18);

	let attackCost = Math.min(-0.5, KDAttackCost());
	// Draw Stamina/Mana
	KinkyDungeonBar(x, y + heightPerBar*1.45, width, heightPerBar*0.45, 100*KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax,
		"#63ab3f", "#283540", KDGameData.LastSP/KinkyDungeonStatStaminaMax * 100, "#ffee83",
		KDSteps(KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax, attackCost/KinkyDungeonStatStaminaMax), "#283540", "#63ab3f");
	MainCanvas.textAlign = "right";
	DrawTextFitKD(TextGet("StatStamina").replace("MAX", KinkyDungeonStatStaminaMax*10 + "").replace("CURRENT", Math.floor(KinkyDungeonStatStamina*10) + ""), x+width, y + 10 + heightPerBar, width - 2*buttonWidth, (KinkyDungeonStatStamina > 0.5) ? "#ffffff" : "pink", "#333333", 24);
	DrawButtonVis(x, y+heightPerBar - buttonOff, buttonWidth, buttonWidth, "", (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax && KinkyDungeonItemCount("PotionStamina")) ? "#AAFFAA" : "#333333",
		KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Stamina") + suff + ".png", "", false, true);
	MainCanvas.textAlign = "left";
	DrawTextFitKD("x" + KinkyDungeonItemCount("PotionStamina"), x + buttonWidth, y+1*heightPerBar+10, buttonWidth, "#ffffff", "#333333", 18);


	// Draw mana
	KinkyDungeonBar(x, y + heightPerBar*2.45, width, heightPerBar*0.45, 100*KinkyDungeonStatMana/KinkyDungeonStatManaMax,
		"#4fa4b8", "#4c6885", KDGameData.LastMP/KinkyDungeonStatManaMax * 100, "#92e8c0",
		KDLinspace(0, 1, Math.ceil(KinkyDungeonStatManaMax/5)), "#4c6885", "#4fa4b8");
	KinkyDungeonBar(x, y + heightPerBar*2.9 - offBarHeight, width, offBarHeight, 100*KinkyDungeonStatManaPool/KinkyDungeonStatManaPoolMax, "#efefff", "none", undefined, undefined, undefined, undefined, undefined, 56);
	MainCanvas.textAlign = "right";

	DrawTextFitKD(TextGet("StatMana").replace("MAX", KinkyDungeonStatManaMax*10 + "").replace("CURRENT", Math.floor(KinkyDungeonStatMana*10) + ""), x+width, y + 10 + heightPerBar * 2, width - 2*buttonWidth, (KinkyDungeonStatMana > 0.5) ? "#ffffff" : "pink", "#333333", 24);
	DrawButtonVis(x, y+2*heightPerBar - buttonOff, buttonWidth, buttonWidth, "", (KinkyDungeonStatMana < KinkyDungeonStatManaMax && KinkyDungeonItemCount("PotionMana")) ? "#AAAAFF" : "#333333",
		KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Mana") + suff + ".png", "", false, true);
	MainCanvas.textAlign = "left";
	DrawTextFitKD("x" + KinkyDungeonItemCount("PotionMana"), x + buttonWidth, y+2*heightPerBar+10, buttonWidth, "#ffffff", "#333333", 18);


	// Draw will
	KinkyDungeonBar(x, y + heightPerBar*3.45, width, heightPerBar*0.45, 100*KinkyDungeonStatWill/KinkyDungeonStatWillMax, "#ff4444", "#222222",
		KDGameData.LastWP/KinkyDungeonStatWillMax * 100, "#aa0000",
		KDLinspace(0, 1, 4), "#222222", "#ff4444");
	MainCanvas.textAlign = "right";
	DrawTextFitKD(TextGet("StatWill").replace("MAX", KinkyDungeonStatWillMax*10 + "").replace("CURRENT", Math.floor(KinkyDungeonStatWill*10) + ""), x+width, y + 10 + heightPerBar * 3, width - 2*buttonWidth, (KinkyDungeonStatWill > 0.5) ? "#ffffff" : "pink", "#333333", 24);
	DrawButtonVis(x, y+3*heightPerBar - buttonOff, buttonWidth, buttonWidth, "", (KinkyDungeonStatWill < KinkyDungeonStatWillMax && KinkyDungeonItemCount("PotionWill")) ? "#ff4444" : "#333333",
		KinkyDungeonRootDirectory + "UI/UsePotion" + ((suff == "Unavailable") ? "" : "Will") + suff + ".png", "", false, true);
	MainCanvas.textAlign = "left";
	DrawTextFitKD("x" + KinkyDungeonItemCount("PotionWill"), x + buttonWidth, y+3*heightPerBar+10, buttonWidth, "#ffffff", "#333333", 18);


	// Draw ancient
	if (KDGameData.AncientEnergyLevel > 0 || KinkyDungeonInventoryGet("AncientPowerSource")) {
		KinkyDungeonBar(x, y + heightPerBar*4.45, width, heightPerBar*0.45, 100*KDGameData.AncientEnergyLevel, "#ffee83", "#3b2027", 100*KDGameData.OrigEnergyLevel, "#ffffff");
		MainCanvas.textAlign = "right";
		DrawTextFitKD(TextGet("StatAncient").replace("PERCENT", Math.round(KDGameData.AncientEnergyLevel*1000) + ""), x+width, y + 10 + heightPerBar * 4, width - 2*buttonWidth, (KDGameData.AncientEnergyLevel > 0.01) ? "#ffffff" : "pink", "#333333", 24);
		DrawButtonKDEx("potionAncient",
			(bdata) => {
				KDSendInput("consumable", {item: "AncientPowerSource", quantity: 1});
				return true;
			}, KDGameData.AncientEnergyLevel < 1.0 && KinkyDungeonItemCount("AncientPowerSource"), x, y+4*heightPerBar - buttonOff, buttonWidth, buttonWidth, "",
			(KDGameData.AncientEnergyLevel < 1.0 && KinkyDungeonItemCount("AncientPowerSource")) ? "#ffee83" : "#333333",
			KinkyDungeonRootDirectory + "UI/UsePotionAncientInject.png", "", false, true);
		MainCanvas.textAlign = "left";
		DrawTextFitKD("x" + KinkyDungeonItemCount("AncientPowerSource"), x + buttonWidth, y+4*heightPerBar+10, buttonWidth, "#ffffff", "#333333", 18);
	}
	let ttOffset = 250;

	if (MouseIn(x, y + heightPerBar*0.45, width, heightPerBar*0.45)) {
		DrawTextFitKD(TextGet("TooltipDistraction"), x-ttOffset, MouseY, 1000, "#ffffff", "#333333", 20, "right");
	}
	if (MouseIn(x, y + heightPerBar*1.45, width, heightPerBar*0.45)) {
		DrawTextFitKD(TextGet("TooltipStamina"), x-ttOffset, MouseY, 1000, "#ffffff", "#333333", 20, "right");
	}
	if (MouseIn(x, y + heightPerBar*2.45, width, heightPerBar*0.45)) {
		DrawTextFitKD(TextGet("TooltipMana"), x-ttOffset, MouseY, 1000, "#ffffff", "#333333", 20, "right");
	}
	if (MouseIn(x, y + heightPerBar*3.45, width, heightPerBar*0.45)) {
		DrawTextFitKD(TextGet("TooltipWill"), x-ttOffset, MouseY, 1000, "#ffffff", "#333333", 20, "right");
	}
	if ((KDGameData.AncientEnergyLevel > 0 || KinkyDungeonInventoryGet("AncientPowerSource")) && MouseIn(x, y + heightPerBar*4.45, width, heightPerBar*0.45)) {
		DrawTextFitKD(TextGet("TooltipCharge"), x-ttOffset, MouseY, 1000, "#ffffff", "#333333", 20, "right");
	}

	MainCanvas.textAlign = "center";


	let i = 4.6;

	let itemsAdj = 20;

	itemsAdj = 25;

	MainCanvas.textAlign = "center";
	let fs = 18;

	let textheight = 15;

	//DrawRectKD(kdcanvas, kdpixisprites, TODOID,x, y + 40 - 40 + i * heightPerBar + itemsAdj, 240, 80, "rgba(0, 0, 0, 0.2)");

	DrawImageEx(KinkyDungeonRootDirectory + "Items/Pick.png", x, y + 40 - 25 + i * heightPerBar + itemsAdj, {Width: 50, Height: 50});
	DrawTextFitKD("" + KinkyDungeonLockpicks, x+25, y + textheight + i * heightPerBar + itemsAdj, 50, "#ffffff", "#333333", fs);
	if (MouseIn(x, y + 40 - 40 + i * heightPerBar + itemsAdj, 50, 50)) DrawTextKD(TextGet("KinkyDungeonInventoryItemLockpick"), MouseX - 10, MouseY, "#ffffff", "#333333");

	DrawImageEx(KinkyDungeonRootDirectory + "Items/RedKey.png", x+50, y + 40 - 25 + i * heightPerBar + itemsAdj, {Width: 50, Height: 50});
	DrawTextFitKD("" + KinkyDungeonRedKeys, x+50+25, y + textheight + i * heightPerBar + itemsAdj, 50, "#ffffff", "#333333", fs);
	if (MouseIn(x+50, y + 40 - 40 + i * heightPerBar + itemsAdj, 50, 50)) DrawTextKD(TextGet("KinkyDungeonInventoryItemRedKey"), MouseX - 10, MouseY, "#ffffff", "#333333");

	if (KinkyDungeonBlueKeys > 0) {
		DrawImageEx(KinkyDungeonRootDirectory + "Items/BlueKey.png", x+100, y + 40 - 25 + i * heightPerBar + itemsAdj, {Width: 50, Height: 50});
		DrawTextFitKD("" + KinkyDungeonBlueKeys, x+50+50+25, y + textheight + i * heightPerBar + itemsAdj, 50, "#ffffff", "#333333", fs);
		if (MouseIn(x+100, y + 40 - 40 + i * heightPerBar + itemsAdj, 50, 50)) DrawTextKD(TextGet("KinkyDungeonInventoryItemMagicKey"), MouseX - 10, MouseY, "#ffffff", "#333333");
	}

	DrawImageEx(KinkyDungeonRootDirectory + "Items/Gold.png", x+150, y + 40 - 40 + i * heightPerBar + itemsAdj, {Width: 80, Height: 80});

	DrawTextFitKD("" + KinkyDungeonGold, x+50+50+50+40, y + textheight + i * heightPerBar + itemsAdj, 50, "#ffffff", "#333333", fs);
	if (MouseIn(x+150, y + 40 - 40 + i * heightPerBar + itemsAdj, 80, 80)) DrawTextKD(TextGet("KinkyDungeonInventoryItemGold"), MouseX - 10, MouseY, "#ffffff", "#333333");

	MainCanvas.textAlign = "center";

	/*
	let statAdj = 98;
	let stati = 0;
	let statspacing = 40;
	DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet("StatMiscastChance").replace("Percent", Math.round(100 * Math.max(0, KinkyDungeonMiscastChance)) + "%"),
		(KinkyDungeonMiscastChance > 0.5) ? "#ff0000" : ((KinkyDungeonMiscastChance > 0) ? "pink" : "#ffffff"), KinkyDungeonRootDirectory + "UI/miscast.png", undefined, undefined, true, "", 24, true); stati++;
	if (KinkyDungeonPlayerDamage) {
		DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet("KinkyDungeonAccuracy") + Math.round(KinkyDungeonGetEvasion() * 100) + "%",
			(KinkyDungeonGetEvasion() < KinkyDungeonPlayerDamage.chance * 0.99) ? "#ff0000" :
			(KinkyDungeonGetEvasion() > KinkyDungeonPlayerDamage.chance * 1.01) ? "lightgreen" : "#ffffff", KinkyDungeonRootDirectory + "UI/accuracy.png", undefined, undefined, true, "", 24, true); stati++;
	}
	let evasion = KinkyDungeonPlayerEvasion();
	DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet("StatEvasion").replace("Percent", ("") + Math.round((1 - evasion) * 100)),
		(evasion > 1) ? "#ff0000" : (evasion < 1 ? "lightgreen" : "#ffffff"), KinkyDungeonRootDirectory + "UI/evasion.png", undefined, undefined, true, "", 24, true); stati++;
	let speed = TextGet("StatSpeed" + (KinkyDungeonSlowLevel > 9 ? "Immobile" : (KinkyDungeonMovePoints < 0 ? "Stun" : (KinkyDungeonSlowLevel > 2 ? "VerySlow" : (KinkyDungeonSlowLevel > 1 ? "Slow" : "Normal")))));
	DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet("StatSpeed").replace("SPD", speed),
		(KinkyDungeonMiscastChance > 0.5) ? "#ff0000" : ((KinkyDungeonSlowLevel > 1 || KinkyDungeonMovePoints < 0) ? (KinkyDungeonSlowLevel < 10 ? "pink" : "#ff0000") : "#ffffff"), KinkyDungeonRootDirectory + "UI/speed.png", undefined, undefined, true, "", 24, true); stati++;
	let radius = KinkyDungeonGetVisionRadius();
	DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet("StatVision").replace("RADIUS", "" + radius),
		(KinkyDungeonMiscastChance > 0.5) ? "#ff0000" : ((radius < 6) ? (radius > 3 ? "pink" : "#ff0000") : "#ffffff"), KinkyDungeonRootDirectory + "UI/vision.png", undefined, undefined, true, "", 24, true); stati++;
	let jailstatus = "KinkyDungeonPlayerNotJailed";
	if (KDGameData.PrisonerState == 'jail') {
		jailstatus = "KinkyDungeonPlayerJail";
	} else if (KDGameData.PrisonerState == 'parole') {
		jailstatus = "KinkyDungeonPlayerParole";
	} else if (KDGameData.PrisonerState == 'chase') {
		jailstatus = "KinkyDungeonPlayerChase";
	}
	DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet(jailstatus),
			(!KDGameData.PrisonerState) ? "#ffffff" : (KDGameData.PrisonerState == "parole" ? "lightgreen" : (KDGameData.PrisonerState == "jail" ? "yellow" : "#ff0000")), KinkyDungeonRootDirectory + "UI/jail.png", undefined, undefined, true, "", 24, true); stati++;
	DrawButtonVis(x + 10, y + statAdj + statspacing * stati + i * heightPerBar, width - 15, 40, TextGet("StatKey" + (KDCanEscape() ? "Escape" : "")),
		KDCanEscape() ? "lightgreen" : "#ffffff", KinkyDungeonRootDirectory + "UI/key.png", undefined, undefined, true, "", 24, true); stati++;
	*/
	let switchAdj = 460;//395;
	let actionButtonAdj = 460;
	let actionBarWidth = 64;
	let actionBarSpacing = actionBarWidth + 5;
	let actionBarII = 0;
	let actionBarXX = 1360;
	let actionBarYY = 925;

	DrawButtonKDEx("switchWeapon", (bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		KDSwitchWeapon();
		return true;
	}, KDGameData.PreviousWeapon != undefined, x, y+i*heightPerBar + switchAdj, width + 5, 60, "", "#ffffff", undefined, undefined, undefined, true);

	if (KDGameData.PreviousWeapon)
		DrawImageZoomCanvas(KinkyDungeonRootDirectory + "/Items/" + KDGameData.PreviousWeapon + ".png", MainCanvas, 0, 0, 72, 72, x + width - 40 + 10, y + switchAdj + 10 + i * heightPerBar, 40, 40);
	if (KinkyDungeonPlayerWeapon) {
		DrawTextFitKD(TextGet("StatWeapon") + TextGet("KinkyDungeonInventoryItem" + KinkyDungeonPlayerWeapon), x + (width - 80)/2, y + switchAdj + 30 + i * heightPerBar, width - 80, "#ffffff", "#333333", 24);
		DrawImageZoomCanvas(KinkyDungeonRootDirectory + "/Items/" + KinkyDungeonPlayerWeapon + ".png", MainCanvas, 0, 0, 72, 72, x + width - 100 + 20, y + switchAdj + i * heightPerBar, 60, 60);
	} //else  KinkyDungeonNoWeapon

	let playColor = "#283540";

	if (KinkyDungeonCanTryOrgasm()) {
		playColor = "#ff5277";
	} else if (KinkyDungeonCanPlayWithSelf()) {
		if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * KinkyDungeonDistractionSleepDeprivationThreshold) playColor = "#4b1d52";
		else if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.5) playColor = "#692464";
		else if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.75) playColor = "#9c2a70";
		else playColor = "#cc2f7b";
	} else playColor = "#283540";
	DrawButtonKDEx("PlayButton", (bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		if (KinkyDungeonCanTryOrgasm()) {
			// Done, converted to input
			KDSendInput("tryOrgasm", {});
		} else if (KinkyDungeonCanPlayWithSelf()) {
			// Done, converted to input
			KDSendInput("tryPlay", {});
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KDNotFeeling"), "#ff0000", 1, false, true);
		}
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60, "", playColor,
	KinkyDungeonRootDirectory + (KinkyDungeonCanTryOrgasm() ? "UI/LetGo.png" : (KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsCrave ? "UI/Edged.png" : "UI/Play.png")), undefined, undefined, !KinkyDungeonCanTryOrgasm()); // KinkyDungeonCanTryOrgasm() ? TextGet("KinkyDungeonTryOrgasm") : TextGet("KinkyDungeonPlayWithSelf")
	/*
	DrawButtonKDEx("SleepButton", (bdata) => {
		if (KinkyDungeonCanSleep()) {
			KDSendInput("sleep", {});
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("KDCantSleep"), "#ff0000", 1);
		}
		return true;
	}, true, x + 160, y+i*heightPerBar + actionButtonAdj, 75, 64, "", sleepColor, KinkyDungeonRootDirectory + (KinkyDungeonCanSleep() ? "UI/Sleep.png" : (KDGameData.CurrentVibration ? "UI/SleepVibe.png" : "UI/SleepFail.png"))); // TextGet("KinkyDungeonSleep")
	*/

	DrawButtonKDEx("WaitButton", (bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		if (KinkyDungeonAutoWait) {
			KinkyDungeonAutoWait = false;
			KinkyDungeonTempWait = false;
			KinkyDungeonAutoWaitSuppress = false;
		} else {
			KinkyDungeonAutoWait = true;
			KinkyDungeonTempWait = true;
			KinkyDungeonAutoWaitSuppress = true;
			KinkyDungeonSleepTime = CommonTime() + 100;
		}
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60, "", "",
	KinkyDungeonRootDirectory + (KDGameData.KinkyDungeonLeashedPlayer ? "UI/WaitJail.png" : "UI/Wait.png"), undefined, undefined, !KinkyDungeonAutoWait);
	DrawButtonKDEx("HelpButton", (bdata) => {
		if (!KinkyDungeonControlsEnabled()) return false;
		KDSendInput("noise", {});
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60, "", "#aaaaaa",
	KinkyDungeonRootDirectory + ("UI/Help.png"), undefined, undefined, true); // TextGet("KinkyDungeonSleep")
	DrawButtonKDEx("togglePass", (bdata) => {
		KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass;
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60, "", "",
	KinkyDungeonRootDirectory + (KinkyDungeonToggleAutoPass ? "UI/Pass.png" : "UI/NoPass.png"), undefined, undefined, !KinkyDungeonToggleAutoPass);

	DrawButtonKDEx("toggleSprint", () => {KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint; return true;},
		true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60,
		"", "", KinkyDungeonRootDirectory + (KinkyDungeonToggleAutoSprint ? "UI/Sprint.png" : "UI/NoSprint.png"), undefined, undefined, !KinkyDungeonToggleAutoSprint);
	//if (KinkyDungeonToggleAutoSprint)
	//DrawImage(KinkyDungeonRootDirectory + "SprintWarning.png", bx + bindex * (bwidth + bspacing), 905); bindex++;

	DrawButtonKDEx("toggleDoor", (bdata) => {
		KinkyDungeonToggleAutoDoor = !KinkyDungeonToggleAutoDoor;
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonToggleAutoDoor ? "UI/DoorClose.png" : "UI/Door.png"), undefined, undefined, !KinkyDungeonToggleAutoDoor);

	DrawButtonKDEx("toggleAutoStruggle", (bdata) => {
		if (!KinkyDungeonFastStruggleSuppress)
			KinkyDungeonFastStruggle = !KinkyDungeonFastStruggle;
		KinkyDungeonFastStruggleSuppress = false;
		KinkyDungeonFastStruggleGroup = "";
		KinkyDungeonFastStruggleType = "";
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonFastStruggle ? "AutoStruggle" : "AutoStruggleOff") + ".png", undefined, undefined, !KinkyDungeonFastStruggle);
	DrawButtonKDEx("toggleFastMove", (bdata) => {
		if (!KinkyDungeonFastMoveSuppress)
			KinkyDungeonFastMove = !KinkyDungeonFastMove;
		KinkyDungeonFastMoveSuppress = false;
		KinkyDungeonFastMovePath = [];
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonFastMove ? "FastMove" : "FastMoveOff") + ".png", undefined, undefined, !KinkyDungeonFastMove);
	DrawButtonKDEx("toggleInspect", (bdata) => {
		KinkyDungeonInspect = !KinkyDungeonInspect;
		return true;
	}, true, actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, actionBarWidth, 60,
	"", "", KinkyDungeonRootDirectory + (KinkyDungeonInspect ? "UI/Inspect" : "UI/Inspect") + ".png", undefined, undefined, !KinkyDungeonInspect);

	//DrawButtonVis(1925, 925, 60, 60, "", KDTextGray2, KinkyDungeonRootDirectory + (KinkyDungeonFastMove ? "FastMove" : "FastMoveOff") + ".png");
	//DrawButtonVis(1860, 925, 60, 60, "", KDTextGray2, KinkyDungeonRootDirectory + (KinkyDungeonFastStruggle ? "AutoStruggle" : "AutoStruggleOff") + ".png");

	//if (MouseIn(x, y+i*heightPerBar + actionButtonAdj - 250, 260, 64) || MouseIn(1855, 925, 200, 60)) {
	let str = "";
	actionBarII = 0;
	if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = KinkyDungeonCanTryOrgasm() ? "KDLetGo" : "KDPlay";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDWait";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDHelp";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDPass";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDSprint";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDDoor";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDAutoStruggle";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "KDAutoPath";}
	// eslint-disable-next-line no-dupe-else-if
	else if (MouseIn(actionBarXX + actionBarSpacing*actionBarII++, actionBarYY, 75, 64)) {str = "Inspect";}

	else if (MouseIn(x, y+i*heightPerBar + switchAdj, width + 5, 60)) {
		str = "KDSwitchWeapon";
		if (KinkyDungeonPlayerWeapon) {
			let inv = KinkyDungeonInventoryGet(KinkyDungeonPlayerWeapon);
			if (inv) KinkyDungeonDrawInventorySelected(KDGetItemPreview(inv));
		}
	}
	if (str) {
		DrawTextFitKD(TextGet(str), Math.min(1900, MouseX), y+i*heightPerBar + actionButtonAdj - 15, 250, "#ffffff", undefined, 18);
	}

	//}
}

function KinkyDungeonActivateWeaponSpell(instant) {
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.special) {
		let energyCost = KinkyDungeonPlayerDamage.special.energyCost;
		if (KDGameData.AncientEnergyLevel < energyCost) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonInsufficientEnergy"), "#ff0000", 1);
			return true;
		}
		if (KinkyDungeonPlayerDamage.special.selfCast) {
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDStartSpellcast(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true), undefined, undefined, undefined);
			KinkyDungeonTargetingSpellWeapon = null;
			//KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, , undefined, undefined, undefined);
		} else if (!instant) {
			KinkyDungeonTargetingSpell = KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true);
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
		} else {
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDStartSpellcast(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true), undefined, KinkyDungeonPlayerEntity, undefined);
			//KinkyDungeonCastSpell(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.special.spell, true), undefined, KinkyDungeonPlayerEntity, undefined);
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
		}
		return true;
	}
	return false;
}

function KinkyDungeonRangedAttack() {
	if (!KinkyDungeonPlayerDamage.special) return;
	if (KinkyDungeonPlayerDamage.special.type) {
		if (KinkyDungeonPlayerDamage.special.type == "hitorspell") {
			KinkyDungeonTargetingSpell = {name: "WeaponAttack", components: [], level:1, type:"special", special: "weaponAttackOrSpell", noMiscast: true,
				onhit:"", time:25, power: 0, range: KinkyDungeonPlayerDamage.special.range ? KinkyDungeonPlayerDamage.special.range : 1.5, size: 1, damage: ""};
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			return true;
		} else if (KinkyDungeonPlayerDamage.special.type == "attack") {
			KinkyDungeonTargetingSpell = {name: "WeaponAttack", components: [], level:1, type:"special", special: "weaponAttack", noMiscast: true,
				onhit:"", time:25, power: 0, range: KinkyDungeonPlayerDamage.special.range ? KinkyDungeonPlayerDamage.special.range : 1.5, size: 1, damage: ""};
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			return true;
		} else if (KinkyDungeonPlayerDamage.special.type == "ignite") {
			KDCreateEffectTile(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
				name: "Ignition",
				duration: 1,
			}, 0);
			return true;
		} /*else if (KinkyDungeonPlayerDamage.special.type == "attack") {
			KinkyDungeonTargetingSpell = {name: "WeaponAttack", components: [], level:1, type:"special", special: "weaponAttack", noMiscast: true,
				onhit:"", time:25, power: 0, range: KinkyDungeonPlayerDamage.special.range ? KinkyDungeonPlayerDamage.special.range : 1.5, size: 1, damage: ""};
			KinkyDungeonTargetingSpellWeapon = KinkyDungeonPlayerDamage;
			return true;
		}*/ else {
			return KinkyDungeonActivateWeaponSpell();
		}

	}
	return false;
}

let KDModalArea_x = 600;
let KDModalArea_y = 700;
let KDModalArea_width = 800;
let KDModalArea_height = 100;
let KDModalArea = true;
let KDConfirmDeleteSave = false;

function KinkyDungeonHandleHUD() {
	let buttonWidth = 48;
	if (KinkyDungeonDrawState == "Game") {
		if (KinkyDungeonShowInventory) {
			// Done, converted to input
			KinkyDungeonhandleQuickInv();
			return true;
		}
		if (KinkyDungeonMessageToggle) {
			/*if (KinkyDungeonMessageLog.length > KDMaxLog) {
				if (MouseIn(500 + 1250/2 - 200, KDLogTopPad + KDLogHeight + 50, 90, 40)) {
					if (KDLogIndex > 0)
						KDLogIndex = Math.max(0, KDLogIndex - KDLogIndexInc);
					return true;
				} else if (MouseIn(500 + 1250/2 + 100, KDLogTopPad + KDLogHeight + 50, 90, 40)) {
					if (KDLogIndex < KinkyDungeonMessageLog.length - KDMaxLog)
						KDLogIndex = Math.min(Math.max(0, KinkyDungeonMessageLog.length - KDMaxLog), KDLogIndex + KDLogIndexInc);
					return true;
				}
			}*/
			if (MouseIn(500, KDLogTopPad, 1250, KDLogHeight + 175)) {
				return true;
			}
		}
		/*if (KinkyDungeonIsPlayer() && MouseIn(1925, 925, 60, 60)) {
			if (!KinkyDungeonFastMoveSuppress)
				KinkyDungeonFastMove = !KinkyDungeonFastMove;
			KinkyDungeonFastMoveSuppress = false;
			KinkyDungeonFastMovePath = [];
			return true;
		} else if (KinkyDungeonIsPlayer() && MouseIn(1860, 925, 60, 60)) {
			if (!KinkyDungeonFastStruggleSuppress)
				KinkyDungeonFastStruggle = !KinkyDungeonFastStruggle;
			KinkyDungeonFastStruggleSuppress = false;
			KinkyDungeonFastStruggleGroup = "";
			KinkyDungeonFastStruggleType = "";
			return true;
		}*/

		if (KinkyDungeonIsPlayer() && MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height))
			KinkyDungeonSetTargetLocation();

		// Old Nav bar
		/*if (MouseIn(650, 925, 165, 60)) { KinkyDungeonDrawState = "Inventory"; return true;}
		else if (MouseIn(990, 935, 165, 50)) {
			KinkyDungeonDrawState = "Logbook";
			KinkyDungeonUpdateLore(localStorage.getItem("kinkydungeonexploredlore") ? JSON.parse(localStorage.getItem("kinkydungeonexploredlore")) : []);
			return true;}
		else if (MouseIn(820, 925, 165, 60)) { KinkyDungeonDrawState = "Reputation"; return true;}
		else
		if (MouseIn(1630, 925, 200, 60)) {
			KinkyDungeonDrawState = "MagicSpells";
			return true;}*/

		if (MouseIn(510, 925, 120, 60)) {
			KinkyDungeonDrawStruggle += 1;
			if (KinkyDungeonDrawStruggle > 2) KinkyDungeonDrawStruggle = 0;
			return true;
		} else if (MouseIn(510, 825, 60, 90)) {
			KinkyDungeonShowInventory = !KinkyDungeonShowInventory;
			return true;
		} else if (KinkyDungeonIsPlayer() && MouseIn(580, 825, 50, 90) && KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.special) {
			// Done, converted to input
			return KinkyDungeonRangedAttack();
		}

		if ((ServerURL == "foobar" && MouseIn(1880, 82, 100, 50)) || (ServerURL != "foobar" && MouseIn(1750, 20, 100, 50))) {
			KinkyDungeonDrawState = "Restart";
			KDConfirmDeleteSave = false;
			if (KDDebugMode) {
				ElementCreateTextArea("DebugEnemy");
				ElementValue("DebugEnemy", "Maidforce");
				ElementCreateTextArea("DebugItem");
				ElementValue("DebugItem", "TrapArmbinder");
			}
			return true;
		}

		// Done, converted to input
		if (!KinkyDungeonTargetingSpell) {
			KinkyDungeonSpellPress = "";
			if (KinkyDungeonHandleSpell()) return true;
		} else {
			KinkyDungeonSpellPress = "";
		}

		if (KinkyDungeonIsPlayer() && KinkyDungeonTargetTile) {
			if (KinkyDungeonTargetTile.Type &&
				((KinkyDungeonTargetTile.Type == "Lock" && KinkyDungeonTargetTile.Lock) || (KinkyDungeonTargetTile.Type == "Door" && KinkyDungeonTargetTile.Lock))) {
				if (KinkyDungeonLockpicks > 0 && (KinkyDungeonTargetTile.Lock.includes("Red") || KinkyDungeonTargetTile.Lock.includes("Blue")) && MouseIn(KDModalArea_x + 313, KDModalArea_y + 25, 112, 60)) {
					// Done, converted to input
					KDSendInput("pick", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}

				if (((KinkyDungeonTargetTile.Lock.includes("Red") && KinkyDungeonRedKeys > 0)
					|| (KinkyDungeonTargetTile.Lock.includes("Blue") && KinkyDungeonBlueKeys > 0)) && MouseIn(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60)) {
					// Done, converted to input
					KDSendInput("unlock", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}
				if (((KinkyDungeonTargetTile.Lock.includes("Purple") && KinkyDungeonStatMana > KinkyDungeonGetManaCost(KinkyDungeonFindSpell("CommandWord", true)))) && MouseIn(KDModalArea_x + 175, KDModalArea_y + 25, 112, 60)) {
					// Done, converted to input
					KDSendInput("commandunlock", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}
			} else if (KinkyDungeonTargetTile.Type == "Shrine") {
				// Done, converted to input
				if (KinkyDungeonHandleShrine()) {
					return true;
					// if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
				}
			} else if (KDObjectHandle[KinkyDungeonTargetTile.Type]) {
				return KDObjectHandle[KinkyDungeonTargetTile.Type]();
			} else if (KinkyDungeonTargetTile.Type == "Door") {
				if (MouseIn(KDModalArea_x + 25, KDModalArea_y + 25, 350, 60)) {
					// Done, converted to input
					KDSendInput("closeDoor", {targetTile: KinkyDungeonTargetTileLocation});
					return true;
				}
			}
		} else {
			/*if (MouseIn(1160, 935, 145, 50)) {
				KinkyDungeonToggleAutoDoor = !KinkyDungeonToggleAutoDoor;
				return true;
			} else if (MouseIn(1310, 935, 145, 50)) {
				KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass;
				return true;
			}*/
		}

		// Done, converted to input
		if (KinkyDungeonStruggleGroups && KinkyDungeonDrawStruggleHover)
			for (let sg of KinkyDungeonStruggleGroups) {
				let ButtonWidth = 60;
				let x = 5 + ((!sg.left) ? (490 - ButtonWidth) : 0);
				let y = 42 + sg.y * (ButtonWidth + 46);

				let i = 0;
				let buttons = ["Struggle", "CurseInfo", "CurseUnlock", "Cut", "Remove", "Pick"];

				let item = KinkyDungeonGetRestraintItem(sg.group);
				let surfaceItems = KDDynamicLinkListSurface(item);


				if (KDStruggleGroupLinkIndex[sg.group]) {
					if (!KDStruggleGroupLinkIndex[sg.group] || KDStruggleGroupLinkIndex[sg.group] >= surfaceItems.length) {
						KDStruggleGroupLinkIndex[sg.group] = 0;
					}
					item = surfaceItems[KDStruggleGroupLinkIndex[sg.group]];
				}
				let r = KDRestraint(item);

				if (KinkyDungeonControlsEnabled())
					for (let button_index = 0; button_index < buttons.length; button_index++) {
						let btn = buttons[sg.left ? button_index : (buttons.length - 1 - button_index)];
						if (btn == "Struggle") {
							if (MouseIn(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth)) {
								if ((item.curse || r.curse)) KDSendInput("struggleCurse", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (item.curse || r.curse)});
								else {
									if (KinkyDungeonFastStruggle) {
										KinkyDungeonFastStruggleGroup = sg.group;
										KinkyDungeonFastStruggleType = "Struggle";
									} else
										KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Struggle"});
										//KinkyDungeonStruggle(sg, "Struggle");
								} return true;
							} i++;
						} else if ((item.curse || r.curse) && btn == "CurseInfo") {
							if (MouseIn(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth)) {KinkyDungeonCurseInfo(item, (item.curse || r.curse)); return true;} i++;
						} else if ((item.curse || r.curse) && btn == "CurseUnlock" && KinkyDungeonCurseAvailable(sg, (item.curse || r.curse))) {
							if (MouseIn(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth) && KinkyDungeonCurseAvailable(item, (item.curse || r.curse))) {
								KDSendInput("curseUnlock", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (item.curse || r.curse)});
								return true;} i++;
						} else if (!(item.curse || r.curse) && !sg.blocked && btn == "Remove") {
							if (MouseIn(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth) && item.lock != "Jammed") {
								if (KinkyDungeonFastStruggle) {
									KinkyDungeonFastStruggleGroup = sg.group;
									KinkyDungeonFastStruggleType = (item.lock) ? "Unlock" : "Remove";
								} else
									KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: (item.lock) ? "Unlock" : "Remove"});
								return true;
							} i++;
						} else if (!(item.curse || r.curse) && !sg.blocked && btn == "Cut"
							&& (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) || KinkyDungeonGetAffinity(false, "Sharp"))
							&& !sg.noCut) {
							if (MouseIn(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth)) {
								if (KinkyDungeonFastStruggle) {
									KinkyDungeonFastStruggleGroup = sg.group;
									KinkyDungeonFastStruggleType = "Cut";
								} else
									KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Cut"});
									//KinkyDungeonStruggle(sg, "Cut");
								return true;
							} i++;
						} else if (!(item.curse || r.curse) && !sg.blocked && btn == "Pick" && KinkyDungeonLockpicks > 0 && item.lock) {
							if (KinkyDungeonLockpicks > 0 && item.lock) {
								if (MouseIn(x + ((!sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth)) {
									if (KinkyDungeonFastStruggle) {
										KinkyDungeonFastStruggleGroup = sg.group;
										KinkyDungeonFastStruggleType = "Pick";
									} else
										KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Pick"});
										//KinkyDungeonStruggle(sg, "Pick");
									return true;
								} i++;
							}
						}
					}
			}

		let xxx = 1750;
		let yyy = 164;
		if (MouseIn(xxx, yyy + 0 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth) && KinkyDungeonItemCount("PotionFrigid") && KinkyDungeonStatDistraction > 0) {
			if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
				// Done, converted to input
				KDSendInput("consumable", {item: "PotionFrigid", quantity: 1});
			else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
			return true;
		} else if (MouseIn(xxx, yyy + 1 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth) && KinkyDungeonItemCount("PotionStamina") && KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax) {
			if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
				// Done, converted to input
				KDSendInput("consumable", {item: "PotionStamina", quantity: 1});
			else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
			return true;
		} else if (MouseIn(xxx, yyy + 2 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth) && KinkyDungeonItemCount("PotionMana") && (KinkyDungeonStatMana < KinkyDungeonStatManaMax || KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax)) {
			if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
				// Done, converted to input
				KDSendInput("consumable", {item: "PotionMana", quantity: 1});
			else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
			return true;
		} if (MouseIn(xxx, yyy + 3 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth) && KinkyDungeonItemCount("PotionWill") && KinkyDungeonStatWill < KinkyDungeonStatWillMax) {
			if (KinkyDungeonCanTalk(true) || KinkyDungeonPotionCollar())
				// Done, converted to input
				KDSendInput("consumable", {item: "PotionWill", quantity: 1});
			else KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "orange", 1);
			return true;
		} else if (MouseIn(xxx, yyy + 0 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth)) return true;
		else if (MouseIn(xxx, yyy + 1 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth)) return true;
		else if (MouseIn(xxx, yyy + 2 * KinkyDungeonStatBarHeight, buttonWidth, buttonWidth)) return true;
	} else if (KinkyDungeonDrawState == "Orb") {
		// Done, converted to input
		return KinkyDungeonHandleOrb();
	} else if (KinkyDungeonDrawState == "Heart") {
		// Done, converted to input
		return KinkyDungeonHandleHeart();
	} else if (KinkyDungeonDrawState == "Magic") {
		// Done, converted to input
		return KinkyDungeonHandleMagic();
	} else if (KinkyDungeonDrawState == "MagicSpells") {
		// Nothing to convert
		return KinkyDungeonHandleMagicSpells();
	} else if (KinkyDungeonDrawState == "Inventory") {
		// Done, converted to input
		return KinkyDungeonHandleInventory();
	} else if (KinkyDungeonDrawState == "Logbook") {
		// Done, converted to input
		return KinkyDungeonHandleLore();
	} else if (KinkyDungeonDrawState == "Reputation") {
		// Done, converted to input
		return KinkyDungeonHandleReputation();
	} else if (KinkyDungeonDrawState == "Lore") {
		// Done, converted to input
		return KinkyDungeonHandleLore();
	} else if (KinkyDungeonDrawState == "Perks2") {
		if (MouseIn(1650, 920, 300, 64)) {
			KinkyDungeonDrawState = "Restart";
			KDConfirmDeleteSave = false;
			if (KDDebugMode) {
				ElementCreateTextArea("DebugEnemy");
				ElementValue("DebugEnemy", "Maidforce");
				ElementCreateTextArea("DebugItem");
				ElementValue("DebugItem", "TrapArmbinder");
			}
			return true;
		}
	} else if (KinkyDungeonDrawState == "Restart") {
		if (MouseIn(600, 20, 64, 64)) {
			if (TestMode) {
				KDDebugMode = !KDDebugMode;
				ElementCreateTextArea("DebugEnemy");
				ElementValue("DebugEnemy", "Maidforce");
				ElementCreateTextArea("DebugItem");
				ElementValue("DebugItem", "TrapArmbinder");
				return true;
			}
		}
		if (KDDebugMode) {
			if (MouseIn(1100, 20, 64, 64)) {
				KDDebug = !KDDebug;
				return true;
			} else
			if (MouseIn(1100, 100, 64, 64)) {
				KDDebugPerks = !KDDebugPerks;
				return true;
			} else
			if (MouseIn(1100, 180, 64, 64)) {
				if (KDDebugGold) {
					KDDebugGold = false;
					KinkyDungeonGold = 0;
				} else {
					KDDebugGold = true;
					KinkyDungeonGold = 100000;
				}
				return true;
			} else
			if (MouseIn(1500, 100, 100, 64)) {
				let enemy = KinkyDungeonEnemies.find((element) => {return element.name.toLowerCase() == ElementValue("DebugEnemy").toLowerCase();});
				if (enemy) {
					KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, enemy.name, 1, 1.5);
				}
				return true;
			}else
			if (MouseIn(1600, 100, 100, 64)) {
				let enemy = KinkyDungeonEnemies.find((element) => {return element.name.toLowerCase() == ElementValue("DebugEnemy").toLowerCase();});
				if (enemy) {
					let e = DialogueCreateEnemy(KinkyDungeonPlayerEntity.x -1, KinkyDungeonPlayerEntity.y, enemy.name);
					e.allied = 9999;
				}
				return true;
			}else
			if (MouseIn(1700, 100, 100, 64)) {
				let enemy = KinkyDungeonEnemies.find((element) => {return element.name.toLowerCase() == ElementValue("DebugEnemy").toLowerCase();});
				if (enemy) {
					let e = DialogueCreateEnemy(KinkyDungeonPlayerEntity.x -1, KinkyDungeonPlayerEntity.y, enemy.name);
					e.ceasefire = 1000;
					let shop = KinkyDungeonGetShopForEnemy(e, true);
					if (shop) {
						KinkyDungeonSetEnemyFlag(e, "Shop", -1);
						KinkyDungeonSetEnemyFlag(e, shop, -1);
					}
				}
				return true;
			} else
			if (MouseIn(1500, 260, 300, 64)) {
				let item = null;
				if (KinkyDungeonConsumables[ElementValue("DebugItem")]) KinkyDungeonChangeConsumable(KinkyDungeonConsumables[ElementValue("DebugItem")], 10);
				else if (KinkyDungeonWeapons[ElementValue("DebugItem")]) KinkyDungeonInventoryAddWeapon(ElementValue("DebugItem"));
				else if (KinkyDungeonGetRestraintByName(ElementValue("DebugItem"))) {
					let restraint = KinkyDungeonGetRestraintByName(ElementValue("DebugItem"));
					KinkyDungeonInventoryAdd({name: ElementValue("DebugItem"), type: LooseRestraint, events: restraint.events, quantity: 10});
				} else if (KinkyDungeonOutfitsBase.filter((outfit) => {return outfit.name == ElementValue("DebugItem");}).length > 0) {
					KinkyDungeonInventoryAdd({name: KinkyDungeonOutfitsBase.filter((outfit) => {return outfit.name == ElementValue("DebugItem");})[0].name, type: Outfit});
				}

				if (item)
					KinkyDungeonInventoryAdd(item);
				return true;
			}
			if (MouseIn(1500, 320, 300, 64)) {
				let saveData = KinkyDungeonSaveGame(true);
				KinkyDungeonState = "Save";
				ElementCreateTextArea("saveDataField");
				ElementValue("saveDataField", saveData);
				return true;
			}
			if (MouseIn(1100, 260, 300, 64)) {

				KDMovePlayer(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, false);
				KDGameData.JailKey = true;
				KinkyDungeonUpdateLightGrid = true;
				return true;
			} else
			if (MouseIn(1100, 320, 300, 64)) {
				KDGameData.PrisonerState = 'parole';
				return true;
			}
		}

		if (MouseIn(600, 420, 350, 64)) {
			if (MouseX <= 600 + 350/2) KDVibeVolumeListIndex = (KDVibeVolumeList.length + KDVibeVolumeListIndex - 1) % KDVibeVolumeList.length;
			else KDVibeVolumeListIndex = (KDVibeVolumeListIndex + 1) % KDVibeVolumeList.length;
			KDVibeVolume = KDVibeVolumeList[KDVibeVolumeListIndex];
			localStorage.setItem("KDVibeVolume", "" + KDVibeVolumeListIndex);
		}
		if (MouseIn(600, 500, 350, 64)) {
			if (MouseX <= 600 + 350/2) KDMusicVolumeListIndex = (KDMusicVolumeList.length + KDMusicVolumeListIndex - 1) % KDMusicVolumeList.length;
			else KDMusicVolumeListIndex = (KDMusicVolumeListIndex + 1) % KDMusicVolumeList.length;
			KDMusicVolume = KDMusicVolumeList[KDMusicVolumeListIndex];
			localStorage.setItem("KDMusicVolume", "" + KDMusicVolumeListIndex);
		}
		if (MouseIn(600, 580, 350, 64)) {
			if (MouseX <= 600 + 350/2) KDAnimSpeedListIndex = (KDAnimSpeedList.length + KDAnimSpeedListIndex - 1) % KDAnimSpeedList.length;
			else KDAnimSpeedListIndex = (KDAnimSpeedListIndex + 1) % KDAnimSpeedList.length;
			KDAnimSpeed = KDAnimSpeedList[KDAnimSpeedListIndex];
			localStorage.setItem("KDAnimSpeed", "" + KDAnimSpeedListIndex);
		}

		if (MouseIn(1650, 900, 300, 64)) {
			KinkyDungeonDrawState = "Perks2";
			return true;
		}


		if (MouseIn(600, 100, 64, 64)) {
			KinkyDungeonSound = !KinkyDungeonSound;
			localStorage.setItem("KinkyDungeonSound", KinkyDungeonSound ? "True" : "False");
			return true;
		}
		if (MouseIn(600, 260, 64, 64)) {
			KinkyDungeonFullscreen = !KinkyDungeonFullscreen;
			if (pixirendererKD)
				pixirendererKD.destroy();
			pixirendererKD = null;
			localStorage.setItem("KinkyDungeonFullscreen", KinkyDungeonFullscreen ? "True" : "False");
			return true;
		}
		if (MouseIn(600, 180, 64, 64)) {
			KinkyDungeonDrool = !KinkyDungeonDrool;
			localStorage.setItem("KinkyDungeonDrool", KinkyDungeonDrool ? "True" : "False");
			return true;
		}
		if (!KDDebug && MouseIn(1000, 180, 64, 64)) {
			KinkyDungeonArmor = !KinkyDungeonArmor;
			localStorage.setItem("KinkyDungeonArmor", KinkyDungeonArmor ? "True" : "False");
			return true;
		}
		if (MouseIn(600, 340, 64, 64) && (ServerURL == "foobar")) {
			KinkyDungeonGraphicsQuality = !KinkyDungeonGraphicsQuality;
			localStorage.setItem("KinkyDungeonDrool", KinkyDungeonGraphicsQuality ? "True" : "False");
			if (KinkyDungeonGraphicsQuality) {
				// @ts-ignore
				if (!Player.GraphicsSettings) Player.GraphicsSettings = {};
				Player.GraphicsSettings.AnimationQuality = 0;
			} else {
				// @ts-ignore
				if (!Player.GraphicsSettings) Player.GraphicsSettings = {};
				Player.GraphicsSettings.AnimationQuality = 10000;
			}
			return true;
		}
		//if (MouseIn(600, 650, 64, 64)) {
		//KinkyDungeonFastWait = !KinkyDungeonFastWait;
		//return true;
		//}
		// Done, converted to input
		if (KinkyDungeonIsPlayer() && MouseIn(975, 800, 550, 64) && KDGameData.PrisonerState != 'jail' && KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)) {

			if (KDConfirmDeleteSave) {
				KDSendInput("defeat", {});
				KinkyDungeonDrawState = "Game";
			} else {
				KDConfirmDeleteSave = true;
			}
			return true;
		}
		if (MouseIn(1075, 450, 350, 64)) {
			KinkyDungeonState = "Keybindings";
			if (!KinkyDungeonKeybindings)
				KDSetDefaultKeybindings();
			else {
				KinkyDungeonKeybindingsTemp = {};
				Object.assign(KinkyDungeonKeybindingsTemp, KinkyDungeonKeybindings);
			}
			return true;
		}
		// Done, converted to input
		if (KinkyDungeonIsPlayer() && MouseIn(975, 900, 550, 64)) {
			if (KDConfirmDeleteSave) {
				KDSendInput("lose", {});
				//Player.KinkyDungeonSave = {};
				//ServerAccountUpdate.QueueData({KinkyDungeonSave : Player.KinkyDungeonSave});
				// Update bones here once we create them
				localStorage.setItem('KinkyDungeonSave', "");
			} else {
				KDConfirmDeleteSave = true;
			}


			return true;
		} else if (MouseIn(975, 550, 550, 64)) {
			KinkyDungeonDrawState = "Game";
			return true;
		} else if (KinkyDungeonIsPlayer() && MouseIn(975, 650, 550, 64)) {
			KinkyDungeonSaveGame();
			KinkyDungeonState = "Menu";
			//KinkyDungeonAutoWait = true;
			//KinkyDungeonTempWait = false;
			//KinkyDungeonAutoWaitSuppress = true;
			//KinkyDungeonSleepTime = CommonTime() + 500;
			return true;
		}
		KDConfirmDeleteSave = false;
		return true;
	}

	if (KDModalArea && MouseIn(KDModalArea_x, KDModalArea_y, KDModalArea_width, KDModalArea_height)) return true;
	if (MouseIn(0, 0, 500, 1000)) return true;
	if (MouseIn(1650, 0, 350, 1000)) return true;
	KDModalArea = false;
	return false;
}

let KDStruggleGroupLinkIndex = {};

function KinkyDungeonUpdateStruggleGroups() {
	let struggleGroups = KinkyDungeonStruggleGroupsBase;
	KinkyDungeonStruggleGroups = [];

	KinkyDungeonCheckClothesLoss = true;

	for (let S = 0; S < struggleGroups.length; S++) {
		let sg = struggleGroups[S];
		let Group = sg;
		if (sg == "ItemM") {
			//if (InventoryGet(KinkyDungeonPlayer, "ItemMouth3")) Group = "ItemMouth3";
			//else if (InventoryGet(KinkyDungeonPlayer, "ItemMouth2")) Group = "ItemMouth2";
			//else Group = "ItemMouth";
			Group = "ItemMouth";
		}
		if (sg == "ItemH") {
			//if (KinkyDungeonGetRestraintItem("ItemHood")) Group = "ItemHood";
			//else Group = "ItemHead";
			Group = "ItemHead";
		}

		let restraint = KinkyDungeonGetRestraintItem(Group);

		if (restraint) {
			KinkyDungeonStruggleGroups.push(
				{
					group:Group,
					left: S % 2 == 0,
					y: Math.floor(S/2),
					icon:sg,
					name:(KDRestraint(restraint)) ? KDRestraint(restraint).name : "",
					lock:restraint.lock,
					magic:KDRestraint(restraint) ? KDRestraint(restraint).magic : undefined,
					noCut:KDRestraint(restraint) && KDRestraint(restraint).escapeChance && !KDRestraint(restraint).escapeChance.Cut,
					curse:KDRestraint(restraint)? (restraint.curse || KDRestraint(restraint).curse) : undefined,
					blocked: !KDRestraint(restraint).alwaysStruggleable && KDGroupBlocked(Group)});
		}
	}
}
