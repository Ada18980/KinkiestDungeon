"use strict";
let KinkyDungeonManaCost = 10; // The base mana cost of a spell, multiplied by the spell's level

let KDEmpowerSprite = "Empower";
let KDMaxEmpower = 3; // Max upcast level

let KinkyDungeonBookScale = 1.3;

let KinkyDungeonMysticSeals = 0; // Mystic seals are used to unlock a spell from one of 3 books:
// 0 Ars Pyrotecnica - Elemental magic such as fireballs, ice, wind, etc
// 1 Codex Imaginus - Conjuring things such as weapons and restraints, and also enchanting (and disenchanting)
// 2 Clavicula Romantica - Illusory magic, disorientation and affecting enemy AI

// Magic book image source: https://www.pinterest.es/pin/54324739242326557/

// Note that you have these 3 books in your inventory at the start; you select the page open in each of them but you need to have hands free or else you can only turn to a random page at a time. If you are blind, you also can't see any page after you turn the page

let KinkyDungeonCurrentBook = "Elements";
let KinkyDungeonCurrentPage = 0;
let KinkyDungeonCurrentSpellsPage = 0;
let KinkyDungeonBooks = ["Elements", "Conjure", "Illusion"];
let KinkyDungeonPreviewSpell = null;

let KinkyDungeonSpellChoices = [0, 1, 2];
let KinkyDungeonSpellChoicesToggle = [true, true];
let KinkyDungeonSpellChoiceCount = 21;
let KinkyDungeonSpellChoiceCountPerPage = 7;
let KDSpellPage = 0;

let KinkyDungeonSpellOffset = 100;
let KinkyDungeonSpellChoiceOffset = 80;

let KDPlayerHitBy = [];

let KinkyDungeonMiscastPityModifier = 0; // Current value
let KinkyDungeonMiscastPityModifierIncrementPercentage = 0.5; // Percent of the base hit chance to add

function KinkyDungeonSearchSpell(list, name) {
	for (let spell of list) {
		if (spell.name == name) return spell;
	}
	return null;
}

function KinkyDungeonFindSpell(name, SearchEnemies) {
	if (SearchEnemies) {
		let spell = KinkyDungeonSearchSpell(KinkyDungeonSpellListEnemies, name);
		if (spell) return spell;
	}
	let spell2 = KinkyDungeonSearchSpell(KinkyDungeonSpellsStart, name);
	if (spell2) return spell2;
	for (let key in KinkyDungeonSpellList) {
		let list = KinkyDungeonSpellList[key];
		let spell = KinkyDungeonSearchSpell(list, name);
		if (spell) return spell;
	}
	return KinkyDungeonSearchSpell(KinkyDungeonSpells, name);
}

function KinkyDungeonDisableSpell(Name) {
	for (let i = 0; i < KinkyDungeonSpellChoices.length; i++) {
		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]] && KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].name == Name) {
			KinkyDungeonSpellChoicesToggle[i] = false;
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		}
	}
}

let KinkyDungeonSpellPress = "";

function KinkyDungeonResetMagic() {
	KinkyDungeonSpellChoices = [0, 1];
	KinkyDungeonSpellChoicesToggle = [true, true];
	KinkyDungeonSpellChoiceCount = 21;
	KinkyDungeonSpells = [];
	Object.assign(KinkyDungeonSpells, KinkyDungeonSpellsStart); // Copy the dictionary
	KinkyDungeonMysticSeals = 1.3;
	KinkyDungeonSpellPress = "";
	KinkyDungeonCurrentPage = 0;
	KinkyDungeonCurrentSpellsPage = 0;
	KinkyDungeonSpellPoints = 3;
	if (KinkyDungeonStatsChoice.get("randomMode")) {
		KinkyDungeonSpells.push({name: "ApprenticeFire", hideLearned: true, hideUnlearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeWater", hideLearned: true, hideUnlearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeEarth", hideLearned: true, hideUnlearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeAir", hideLearned: true, hideUnlearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeIce", hideLearned: true, hideUnlearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeLightning", hideLearned: true, hideUnlearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);

		KinkyDungeonSpells.push({name: "ApprenticeLeather", hideLearned: true, hideUnlearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeRope", hideLearned: true, hideUnlearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeMetal", hideLearned: true, hideUnlearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeSummon", hideLearned: true, hideUnlearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeLatex", hideLearned: true, hideUnlearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticePhysics", hideLearned: true, hideUnlearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);

		KinkyDungeonSpells.push({name: "ApprenticeShadow", hideLearned: true, hideUnlearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeLight", hideLearned: true, hideUnlearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeMystery", hideLearned: true, hideUnlearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeKnowledge", hideLearned: true, hideUnlearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);
		KinkyDungeonSpells.push({name: "ApprenticeProjection", hideLearned: true, hideUnlearned: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},);


		//KinkyDungeonSpells.push({name: "SpellChoiceUp1", school: "Any", manacost: 0, components: [], spellPointCost: 1, level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"});
		//KinkyDungeonSpells.push({name: "SpellChoiceUp2", school: "Any", manacost: 0, components: [], spellPointCost: 1, level:4, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"});
		//KinkyDungeonSpells.push({name: "SpellChoiceUp3", school: "Any", manacost: 0, components: [], spellPointCost: 1, level:5, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"});
	}
}

/**
 *
 * @param {string} name
 * @returns {boolean}
 */
function KDHasSpell(name) {
	for (let s of KinkyDungeonSpells) {
		if (s.name == name) return true;
	}
	return false;
}

/**
 *
 * @param {string} name
 * @param {number} Level - Spell level. Set to -1 to allow any level
 * @returns {spell}
 */
function KDGetUpcast(name, Level) {
	if (Level < 0) {
		for (let sp of KinkyDungeonSpells) {
			if (sp.upcastFrom && sp.upcastFrom == name) {
				return sp;
			}
		}
	} else {
		for (let i = Level; i > 0; i--) {
			for (let sp of KinkyDungeonSpells) {
				if (i == sp.upcastLevel && sp.upcastFrom && sp.upcastFrom == name) {
					return sp;
				}
			}
		}
	}
	return null;
}

/**
 *
 * @param {string} name
 * @returns {boolean}
 */
function KDHasUpcast(name) {
	for (let sp of KinkyDungeonSpells) {
		if (sp.upcastFrom && sp.upcastFrom == name) {
			return true;
		}
	}
	return false;
}
/**
 *
 * @returns {boolean}
 */
function KDCanUpcast() {
	for (let i of KinkyDungeonSpellChoices) {
		let spell = KinkyDungeonSpells[i];
		if (spell) {
			let upcast = KDGetUpcast(spell.name, -1);
			if (upcast) {
				return true;
			}
		}

	}
	return false;
}

function KDEmpower(data, entity) {
	let Level = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower");
	if (!KDCanUpcast()) {
		KinkyDungeonSendActionMessage(10, TextGet("KDSpellEmpowerFail"), "#ffffff", 1);
	} else {
		KinkyDungeonTargetingSpell = null;
		// Success, we upcast
		let newLevel = Math.min(KDMaxEmpower, Level + 1);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Empower",
			aura: "#aaaaff",
			type: "SpellEmpower",
			maxCount: 1,
			currentCount: 1,
			power: newLevel,
			duration: 13,
			tags: ["cast", "upcast"],
		});
		KinkyDungeonSendActionMessage(5, TextGet("KDSpellEmpowerMsg").replace("LEVEL", "" + newLevel), "#aaaaff", 2);
		KinkyDungeonAdvanceTime(1, true);
	}
}

function KinkyDungeoCheckComponents(spell, x, y) {
	let failedcomp = [];
	if (spell.components.includes("Verbal") && !KinkyDungeonCanTalk(true) && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoVerbalComp") > 0)) failedcomp.push("Verbal");
	if (spell.components.includes("Arms") && KinkyDungeonIsArmsBound() && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoArmsComp") > 0)) failedcomp.push("Arms");
	if (spell.components.includes("Legs") && (KinkyDungeonSlowLevel > 1 || KinkyDungeonLegsBlocked()) && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoLegsComp") > 0)) failedcomp.push("Legs");

	let data = {
		spell: spell,
		failed: failedcomp,
		x: x || KinkyDungeonPlayerEntity.x,
		y: y || KinkyDungeonPlayerEntity.y};
	KinkyDungeonSendEvent("calcComp", data);
	return data.failed;
}

function KinkyDungeonHandleSpellChoice(SpellChoice) {
	let spell = KinkyDungeonHandleSpellCast(KDGetUpcast(KinkyDungeonSpells[SpellChoice].name,
		KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellEmpower")) || KinkyDungeonSpells[SpellChoice]);
	return spell;
}

function KDSpellIgnoreComp(spell) {
	return (KinkyDungeonStatsChoice.get("Slayer") && spell.school == "Elements")
	|| (KinkyDungeonStatsChoice.get("Conjurer") && spell.school == "Conjure")
	|| (KinkyDungeonStatsChoice.get("Magician") && spell.school == "Illusion");
}

function KinkyDungeonHandleSpellCast(spell) {
	if (KinkyDungeoCheckComponents(spell).length == 0 || (
		KDSpellIgnoreComp(spell)
	)) {
		if (KinkyDungeonHasMana(KinkyDungeonGetManaCost(spell))
			&& (!spell.staminacost || KinkyDungeonHasStamina(spell.staminacost)))
			return spell;
		else KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonNoMana"), "#ff0000", 1);
	} else {
		KinkyDungeonTargetingSpell = null;
		KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonComponentsFail" + KinkyDungeoCheckComponents(spell)[0]), "#ff0000", 1);
	}
	return null;
}

function KinkyDungeonClickSpell(i) {
	let spell = null;
	let clicked = false;
	if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]]) {
		if (KinkyDungeonSpells[KinkyDungeonSpellChoices[i]] && KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].type == "passive") {
			KDSendInput("toggleSpell", {i: i});
			if (KinkyDungeonSpellChoicesToggle[i] && KinkyDungeonSpells[KinkyDungeonSpellChoices[i]].cancelAutoMove) {
				KinkyDungeonFastMove = false;
				KinkyDungeonFastMoveSuppress = false;
			}
			KinkyDungeonSpellPress = "";
			clicked = true;
		} else {
			spell = KinkyDungeonHandleSpellChoice(KinkyDungeonSpellChoices[i]);
			clicked = true;
		}
	}
	return {spell: spell, clicked: clicked};
}

let KDSwapSpell = -1;

function KinkyDungeonHandleSpell() {
	let spell = null;
	let clicked = false;
	for (let i = 0; i < KinkyDungeonSpellChoiceCountPerPage; i++) {
		let index = i + KDSpellPage*KinkyDungeonSpellChoiceCountPerPage;
		let buttonWidth = 40;
		if (MouseIn(1650 + (90 - buttonWidth), 180 + i*KinkyDungeonSpellChoiceOffset - buttonWidth, buttonWidth, buttonWidth) && KinkyDungeonSpellChoices[i]) {
			KinkyDungeonDrawState = "MagicSpells";
			KDSwapSpell = index;
			return true;
		}
		if (KinkyDungeonSpellPress == KinkyDungeonKeySpell[i]) {
			let result = KinkyDungeonClickSpell(index);
			spell = result.spell;
			clicked = result.clicked;
		}
	}
	for (let ii = 0; ii < KinkyDungeonSpellChoiceCount; ii++) {
		if (MouseInKD("SpellCast" + ii)) {
			let result = KinkyDungeonClickSpell(ii);
			spell = result.spell;
			clicked = result.clicked;
		}
	}
	if (spell) {
		// Otherwise.
		KinkyDungeonTargetingSpell = spell;
		KDModalArea = false;
		KinkyDungeonTargetTile = null;
		KinkyDungeonTargetTileLocation = null;
		KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSpellTarget" + spell.name).replace("SpellArea", "" + Math.floor(spell.aoe)), "white", 0.1, true);
		return true;
	}
	if (clicked) return true;
	return false;
}

function KinkyDungeonGetManaCost(Spell) {
	let data = {
		spell: Spell,
		cost: Spell.manacost,
		costscale: KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ManaCostMult")),
		lvlcostscale: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ManaCostLevelMult"),
	};
	KinkyDungeonSendEvent("calcMana", data);
	if (data.costscale) data.cost = Math.floor(data.cost * data.costscale);
	//if (data.costscale > 0) data.cost = Math.max(0, data.cost); // Keep it from rounding to 0
	if (data.lvlcostscale && Spell.level && Spell.manacost) data.cost += Spell.level * data.lvlcostscale;
	KinkyDungeonSendEvent("beforeMultMana", data);
	KinkyDungeonSendEvent("afterCalcMana", data);

	if (KinkyDungeonStatsChoice.get("Slayer") && Spell.school == "Elements" && KinkyDungeoCheckComponents(Spell).length > 0) data.cost *= 2;
	if (KinkyDungeonStatsChoice.get("Conjurer") && Spell.school == "Conjure" && KinkyDungeoCheckComponents(Spell).length > 0) data.cost *= 2;
	if (KinkyDungeonStatsChoice.get("Magician") && Spell.school == "Illusion" && KinkyDungeoCheckComponents(Spell).length > 0) data.cost *= 2;

	return data.cost;
}

function KinkyDungeonGetCost(Spell) {
	let cost = Spell.level;
	if (Spell.level > 1 && !Spell.passive && KinkyDungeonStatsChoice.get("Novice")) cost *= 2;
	if (Spell.spellPointCost) return Spell.spellPointCost;
	return cost;
}

function KinkyDungeonMakeNoise(radius, noiseX, noiseY) {
	for (let e of KinkyDungeonEntities) {
		if (!e.aware && !e.Enemy.tags.deaf && !KDAmbushAI(e) && KDistChebyshev(e.x - noiseX, e.y - noiseY) <= radius) {
			e.gx = noiseX;
			e.gy = noiseY;
			KDAddThought(e.id, "Search", 2, 1 + KDistChebyshev(e.x - noiseX, e.y - noiseY));
		}
	}
}

/**
 *
 * @param {number} targetX
 * @param {number} targetY
 * @param {spell} spell
 * @param {*} enemy
 * @param {*} player
 * @param {*} bullet
 * @param {string} [forceFaction]
 * @returns {{result: string, data: any}}
 */
function KinkyDungeonCastSpell(targetX, targetY, spell, enemy, player, bullet, forceFaction) {
	let entity = KinkyDungeonPlayerEntity;
	let moveDirection = KinkyDungeonMoveDirection;
	let flags = {
		miscastChance: KinkyDungeonMiscastChance,
	};

	let faction = spell.allySpell ? "Player" : spell.enemySpell ? "Enemy" : "Player";
	if (forceFaction) faction = forceFaction;
	else {
		if (!enemy && !bullet && player) faction = "Player";
		else if (enemy) {
			let f = KDGetFaction(enemy);
			if (f) faction = f;
		} else if (bullet && bullet.bullet) {
			let f = bullet.bullet.faction;
			if (f) faction = f;
		}
		if (spell.faction) faction = spell.faction;
	}


	let gaggedMiscastFlag = false;
	if (!enemy && !bullet && player && spell.components && spell.components.includes("Verbal") && !KDSpellIgnoreComp(spell) && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "NoVerbalComp") > 0)) {
		let gagTotal = (KinkyDungeonStatsChoice.get("Incantation") && KinkyDungeonGagTotal() > 0) ? 1.0 : KinkyDungeonGagTotal();
		flags.miscastChance = flags.miscastChance + Math.max(0, 1 - flags.miscastChance) * Math.min(1, gagTotal);
		if (gagTotal > 0)
			gaggedMiscastFlag = true;
	}

	let data = {
		spell: spell,
		bulletfired: null,
		target: null,
		targetX: targetX,
		targetY: targetY,
		originX: KinkyDungeonPlayerEntity.x,
		originY: KinkyDungeonPlayerEntity.y,
		flags: flags,
		enemy: enemy,
		bullet: bullet,
		player: player,
		delta: 1,
	};



	if (!enemy && !bullet && player) {
		KinkyDungeonSendEvent("beforeCast", data);
	}
	let tX = targetX;
	let tY = targetY;
	let miscast = false;
	let selfCast = !enemy && !bullet && player && targetX == KinkyDungeonPlayerEntity.x && targetY == KinkyDungeonPlayerEntity.y;
	if (!enemy && !player && !bullet) {
		moveDirection = {x:0, y:0, delta:1};
	}

	let noiseX = targetX;
	let noiseY = targetY;

	if (enemy && player) {
		entity = enemy;
		moveDirection = KinkyDungeonGetDirection(player.x - entity.x, player.y - entity.y);
		flags.miscastChance = 0;
	}
	if (bullet) {
		entity = bullet;
		if (bullet.bullet.cast) {
			moveDirection = {x:bullet.bullet.cast.mx, y:bullet.bullet.cast.my, delta: 1};
		} else {
			moveDirection = {x:0, y:0, delta: 0};
		}
		flags.miscastChance = 0;
	}
	if (!spell.noMiscast && !enemy && !bullet && player && Math.min(1, KDRandom() + KinkyDungeonMiscastPityModifier) < flags.miscastChance) {
		// Increment the pity timer
		KinkyDungeonMiscastPityModifier += KinkyDungeonMiscastPityModifierIncrementPercentage * Math.max(1 - flags.miscastChance, 0);

		if (gaggedMiscastFlag)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellMiscastGagged"), "#FF8800", 2);
		else
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonSpellMiscast"), "#FF8800", 2);

		moveDirection = {x:0, y:0, delta:1};
		tX = entity.x;
		tY = entity.y;
		miscast = true;
		return {result: "Miscast", data: data};
	}



	let spellRange = spell.range * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "spellRange"));

	if (spell.type != "bolt" && spell.effectTilePre) {
		KDCreateAoEEffectTiles(tX,tY, spell.effectTilePre, spell.effectTileDurationModPre, (spell.aoe) ? spell.aoe : 0.5);
	}

	let originaltX = tX;
	let originaltY = tY;
	let originalSpeed = spell.speed;
	let castCount = spell.shotgunCount ? spell.shotgunCount : 1;
	for (let castI = 0; castI < castCount; castI++) {
		// Reset tx
		tX = originaltX;
		tY = originaltY;
		// Project out to shotgundistance
		if (spell.shotgunDistance) {
			let dx = tX - entity.x;
			let dy = tY - entity.y;
			let dmult = KDistEuclidean(dx, dy);
			if (dmult != 0) dmult = 1/dmult;

			tX = entity.x + dx*dmult * spell.shotgunDistance;
			tY = entity.y + dy*dmult * spell.shotgunDistance;
		}
		// Add spread
		if (spell.shotgunSpread) {
			tX += spell.shotgunSpread * (KDRandom() - 0.5);
			tY += spell.shotgunSpread * (KDRandom() - 0.5);
		}

		let speed = originalSpeed;
		// Add speedSpread
		if (spell.shotgunSpeedBonus && castCount > 1) {
			speed += spell.shotgunSpeedBonus * (castI / (castCount - 1));
		}


		let cast = spell.spellcast ? Object.assign({}, spell.spellcast) : undefined;

		if (cast) {
			if (cast.target == "target") {
				if (tX == entity.x + moveDirection.x && tY == entity.y + moveDirection.y && !cast.noTargetMoveDir) {
					cast.tx = tX + moveDirection.x;
					cast.ty = tY + moveDirection.y;
				} else {
					cast.tx = tX;
					cast.ty = tY;
				}
			} else if (cast.target == "origin") {
				cast.tx = entity.x;
				cast.ty = entity.y;
			}
			if (cast.directional) {
				if (cast.randomDirection) {
					let slots = [];
					for (let XX = -1; XX <= 1; XX++) {
						for (let YY = -1; YY <= 1; YY++) {
							if ((XX != 0 || YY != 0) && KinkyDungeonNoEnemy(entity.x + XX, entity.y + YY, true) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(entity.x + XX, entity.y + YY))) slots.push({x:XX, y:YY});
						}
					}
					if (slots.length > 0) {
						let slot = slots[Math.floor(KDRandom() * slots.length)];
						cast.mx = slot.x;
						cast.my = slot.y;
						moveDirection.x = slot.x;
						moveDirection.y = slot.y;
					} else {
						cast.mx = moveDirection.x;
						cast.my = moveDirection.y;
					}
				} else if (cast.randomDirectionPartial || cast.randomDirectionFallback) {
					if (cast.randomDirectionFallback && (!cast.alwaysRandomBuff || !KDEntityHasBuff(entity, cast.alwaysRandomBuff))
						&& KinkyDungeonNoEnemy(entity.x + moveDirection.x, entity.y + moveDirection.y, true)
						&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(entity.x + moveDirection.x, entity.y + moveDirection.y))) {

						cast.mx = moveDirection.x;
						cast.my = moveDirection.y;
					} else {
						let slots = [];
						let dist = KDistEuclidean(entity.x - tX, entity.y - tY);
						for (let XX = -1; XX <= 1; XX++) {
							for (let YY = -1; YY <= 1; YY++) {
								if ((XX != 0 || YY != 0) && KinkyDungeonNoEnemy(entity.x + XX, entity.y + YY, true) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(entity.x + XX, entity.y + YY))
									&& (entity.x + XX != tX || entity.y + YY != tY)
									&& KDistEuclidean(entity.x + XX - tX, entity.y + YY - tY) <= dist + 0.1) slots.push({x:XX, y:YY});
							}
						}
						if (slots.length > 0) {
							let slot = slots[Math.floor(KDRandom() * slots.length)];
							cast.mx = slot.x;
							cast.my = slot.y;
							moveDirection.x = slot.x;
							moveDirection.y = slot.y;
						} else {
							cast.mx = moveDirection.x;
							cast.my = moveDirection.y;
							if (entity.x + cast.mx == tX && entity.y + cast.my == tY) {
								cast.tx += moveDirection.x;
								cast.ty += moveDirection.y;
							}
						}
					}
				} else {
					cast.mx = moveDirection.x;
					cast.my = moveDirection.y;
				}

			}
			if (cast.aimAtTarget && KinkyDungeonEnemyAt(targetX, targetY) && KDCanSeeEnemy(KinkyDungeonEnemyAt(targetX, targetY), KDistEuclidean(entity.x - targetX, entity.y - targetY))) {
				cast.targetID = KinkyDungeonEnemyAt(targetX, targetY).id;
			}
		}


		if (spell.type == "bolt") {
			let size = (spell.size) ? spell.size : 1;
			let xx = entity.x;
			let yy = entity.y;
			noiseX = entity.x;
			noiseY = entity.y;
			if (!bullet || (bullet.spell && bullet.spell.cast && bullet.spell.cast.offset)) {
				xx += moveDirection.x;
				yy += moveDirection.y;
			}
			if (spell.effectTilePre) {
				KDCreateAoEEffectTiles(tX-entity.x,tY - entity.y, spell.effectTilePre, spell.effectTileDurationModPre, (spell.aoe) ? spell.aoe : 0.5);
			}
			let b = KinkyDungeonLaunchBullet(xx, yy,
				tX-entity.x,tY - entity.y,
				speed, {noSprite: spell.noSprite, faction: faction, name:spell.name, block: spell.block, width:size, height:size, summon:spell.summon, source: entity?.player ? -1 : entity?.id, cast: cast, dot: spell.dot,
					bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
					bulletSpin: spell.bulletSpin,
					effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
					effectTileTrail: spell.effectTileTrail, effectTileDurationModTrail: spell.effectTileDurationModTrail, effectTileTrailAoE: spell.effectTileTrailAoE,
					passthrough: spell.noTerrainHit, noEnemyCollision: spell.noEnemyCollision, alwaysCollideTags: spell.alwaysCollideTags, nonVolatile:spell.nonVolatile, noDoubleHit: spell.noDoubleHit,
					pierceEnemies: spell.pierceEnemies, piercing: spell.piercing, events: spell.events,
					lifetime:miscast || selfCast ? 1 : (spell.bulletLifetime ? spell.bulletLifetime : 1000), origin: {x: entity.x, y: entity.y}, range: spellRange, hit:spell.onhit,
					damage: {evadeable: spell.evadeable, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}, miscast);
			b.visual_x = entity.x;
			b.visual_y = entity.y;
			data.bulletfired = b;
		} else if (spell.type == "inert" || spell.type == "dot") {
			let sz = spell.size;
			if (!sz) sz = 1;
			if (spell.meleeOrigin) {
				tX = entity.x + moveDirection.x;
				tY = entity.y + moveDirection.y;
			}
			let b = KinkyDungeonLaunchBullet(tX, tY,
				moveDirection.x,moveDirection.y,
				0, {
					noSprite: spell.noSprite, faction: faction, name:spell.name, block: spell.block, width:sz, height:sz, summon:spell.summon, source: entity?.player ? -1 : entity?.id, lifetime:spell.delay +
						(spell.delayRandom ? Math.floor(KDRandom() * spell.delayRandom) : 0), cast: cast, dot: spell.dot, events: spell.events, alwaysCollideTags: spell.alwaysCollideTags,
					bulletColor: spell.bulletColor, bulletLight: spell.bulletLight,
					bulletSpin: spell.bulletSpin,
					passthrough:(spell.CastInWalls || spell.WallsOnly || spell.noTerrainHit), hit:spell.onhit, noDoubleHit: spell.noDoubleHit, effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
					damage: spell.type == "inert" ? null : {evadeable: spell.evadeable, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell
				}, miscast);
			data.bulletfired = b;
		} else if (spell.type == "hit") {
			let sz = spell.size;
			if (!sz) sz = 1;
			if (spell.meleeOrigin) {
				tX = entity.x + moveDirection.x;
				tY = entity.y + moveDirection.y;
			}
			let b = {x: tX, y:tY,
				vx: moveDirection.x,vy: moveDirection.y, born: 1,
				bullet: {noSprite: spell.noSprite, faction: faction, name:spell.name, block: spell.block, width:sz, height:sz, summon:spell.summon, source: entity?.player ? -1 : entity?.id, lifetime:spell.lifetime, cast: cast, dot: spell.dot, events: spell.events, aoe: spell.aoe,
					passthrough:(spell.CastInWalls || spell.WallsOnly || spell.noTerrainHit), hit:spell.onhit, noDoubleHit: spell.noDoubleHit, effectTile: spell.effectTile, effectTileDurationMod: spell.effectTileDurationMod,
					damage: {evadeable: spell.evadeable, damage:spell.power, type:spell.damage, distract: spell.distract, distractEff: spell.distractEff, bindEff: spell.bindEff, bind: spell.bind, bindType: spell.bindType, boundBonus: spell.boundBonus, time:spell.time, flags:spell.damageFlags}, spell: spell}};
			KinkyDungeonBulletHit(b, 1);
			data.bulletfired = b;
		} else if (spell.type == "buff") {
			let aoe = spell.aoe;
			let casted = false;
			if (!aoe) aoe = 0.1;
			if (Math.sqrt((KinkyDungeonPlayerEntity.x - targetX) * (KinkyDungeonPlayerEntity.x - targetX) + (KinkyDungeonPlayerEntity.y - targetY) * (KinkyDungeonPlayerEntity.y - targetY)) <= aoe) {
				for (let buff of spell.buffs) {
					if (buff.player) {
						KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff);
						if (KinkyDungeonPlayerEntity.x == targetX && KinkyDungeonPlayerEntity.y == targetY) data.target = KinkyDungeonPlayerEntity;
						casted = true;
					}
				}
			}
			for (let e of KinkyDungeonEntities) {
				if (Math.sqrt((e.x - targetX) * (e.x - targetX) + (e.y - targetY) * (e.y - targetY)) <= aoe) {
					for (let buff of spell.buffs) {
						if (!spell.filterTags || KDMatchTags(spell.filterTags, e)) {
							if (!e.buffs) e.buffs = {};
							KinkyDungeonApplyBuff(e.buffs, buff);
							if (e.x == targetX && e.y == targetY) data.target = e;
							casted = true;
						}
					}
				}
			}
			if (!casted)
				return {result: "Fail", data: data};
		} else if (spell.type == "special") {
			let ret = KinkyDungeonSpellSpecials[spell.special](spell, data, targetX, targetY, tX, tY, entity, enemy, moveDirection, bullet, miscast, faction, cast, selfCast);
			if (ret) {
				if (!enemy && !bullet && player) {
					KinkyDungeonSendEvent("playerCast", data);
				}
				return {result: ret, data: data};
			}
		}
	}

	tX = originaltX;
	tY = originaltY;

	if (spell.extraCast) {
		for (let extraCast of spell.extraCast)
			KinkyDungeonCastSpell(targetX, targetY, KinkyDungeonFindSpell(extraCast.spell, true), undefined, undefined, undefined);
	}

	if (spell.noise) {
		KinkyDungeonMakeNoise(spell.noise, noiseX, noiseY);
	}

	if (!enemy && !bullet && player) { // Costs for the player
		KinkyDungeonSetFlag("PlayerCombat", 20);

		if (KinkyDungeonTargetingSpellItem) {
			KinkyDungeonChangeConsumable(KinkyDungeonTargetingSpellItem, -(KinkyDungeonTargetingSpellItem.useQuantity ? KinkyDungeonTargetingSpellItem.useQuantity : 1));
			KinkyDungeonTargetingSpellItem = null;
			if (!spell.noAggro)
				KinkyDungeonAggroAction('item', {});
		} else if (KinkyDungeonTargetingSpellWeapon) {
			let special = KinkyDungeonPlayerDamage ? KinkyDungeonPlayerDamage.special : null;
			if (special) {
				let energyCost = KinkyDungeonPlayerDamage.special.energyCost;
				if (KDGameData.AncientEnergyLevel < energyCost) return;
				if (energyCost) KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - energyCost);
			}
			KinkyDungeonTargetingSpellItem = null;
			if (!spell.noAggro)
				KinkyDungeonAggroAction('item', {});
		} else {
			if (!spell.noAggro)
				KinkyDungeonAggroAction('magic', {});
			if (spell.school) KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "cast_" + spell.school.toLowerCase(), 1);
		}
		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonSpellCast"+spell.name), "#88AAFF", 2 + (spell.channel ? spell.channel - 1 : 0));
		KDSendSpellCast(spell.name);

		KinkyDungeonSendEvent("playerCast", data);

		//let cost = spell.staminacost ? spell.staminacost : KinkyDungeonGetCost(spell.level);

		//KinkyDungeonStatWillpowerExhaustion += spell.exhaustion + 1;
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "cast", 1);
		if (spell.tags) {
			for (let t of spell.tags) {
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "cast_" + t, 1);
			}
		}
		KinkyDungeonChangeMana(-KinkyDungeonGetManaCost(spell));
		if (spell.staminacost) KinkyDungeonChangeStamina(-spell.staminacost);
		if (spell.channel) {
			KinkyDungeonSlowMoveTurns = Math.max(KinkyDungeonSlowMoveTurns, spell.channel);
			KinkyDungeonSleepTime = CommonTime() + 200;
		}
		if (spell.noise) {
			if (spell.components && spell.components.includes("Verbal"))
				KinkyDungeonAlert = 3;//Math.max(spell.noise, KinkyDungeonAlert);
		}
		KinkyDungeonLastAction = "Spell";
		KinkyDungeonMiscastPityModifier = 0;
	} else {
		KinkyDungeonSendEvent("spellCast", data);
	}

	return {result: "Cast", data: data};
}

function KinkyDungeonClickSpellChoice(I, CurrentSpell) {
	// Set spell choice
	KDSendInput("spellChoice", {I:I, CurrentSpell: CurrentSpell});
	if (KinkyDungeonTextMessageTime > 0 && KinkyDungeonTextMessagePriority > 3)
		KinkyDungeonDrawState = "Game";
	if (KinkyDungeonSpellChoicesToggle[I] && KinkyDungeonSpells[KinkyDungeonSpellChoices[I]].cancelAutoMove) {
		KinkyDungeonFastMove = false;
		KinkyDungeonFastMoveSuppress = false;
	}
}

function KinkyDungeonHandleMagic() {
	//if (KinkyDungeonPlayer.CanInteract()) { // Allow turning pages
	if (KinkyDungeonCurrentPage > 0 && MouseIn(canvasOffsetX_ui + 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60)) {
		if (KinkyDungeonPreviewSpell) KinkyDungeonPreviewSpell = undefined;
		else {
			KinkyDungeonCurrentPage -= 1;
			for (let i = 0; i < 30; i++)
				if (KinkyDungeonCurrentPage > 0 && KinkyDungeonSpells[KinkyDungeonCurrentPage] && (KinkyDungeonSpells[KinkyDungeonCurrentPage].hide)) KinkyDungeonCurrentPage -= 1;
		}
		return true;
	}
	if (KinkyDungeonCurrentPage < KinkyDungeonSpells.length-1 && MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale - 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60)) {
		if (KinkyDungeonPreviewSpell) KinkyDungeonPreviewSpell = undefined;
		else {
			KinkyDungeonCurrentPage += 1;
			for (let i = 0; i < 30; i++)
				if (KinkyDungeonSpells[KinkyDungeonCurrentPage] && KinkyDungeonSpells[KinkyDungeonCurrentPage].hide) KinkyDungeonCurrentPage += 1;
		}
		return true;
	}

	if (KinkyDungeonSpells[KinkyDungeonCurrentPage] && !KinkyDungeonPreviewSpell) {

		if (MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale * 0.5 - 200, canvasOffsetY_ui - 70 + 483*KinkyDungeonBookScale, 400, 60)) {
			KDSendInput("spellCastFromBook", {CurrentSpell: KinkyDungeonCurrentPage});
			KinkyDungeonTargetingSpell = KinkyDungeonHandleSpellCast(KinkyDungeonSpells[KinkyDungeonCurrentPage]);
			KDModalArea = false;
			KinkyDungeonTargetTile = null;
			KinkyDungeonTargetTileLocation = null;
			KinkyDungeonDrawState = "Game";
		}
	} else if (KinkyDungeonPreviewSpell && MouseIn(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 40, canvasOffsetY_ui + 125, 225, 60)) {
		if (KinkyDungeonPreviewSpell.hideLearned) KinkyDungeonDrawState = "MagicSpells";
		KDSendInput("spellLearn", {SpellName: KinkyDungeonPreviewSpell.name});
		return true;
	}

	return true;
}

function KDGetPrerequisite(spell) {
	if (!spell.prerequisite) return "";
	if (typeof spell.prerequisite === "string") {
		return TextGet("KinkyDungeonSpell" + spell.prerequisite);
	}
	let str = "";
	for (let pr of spell.prerequisite) {
		if (!str) {
			str = TextGet("KinkyDungeonSpell" + pr);
		} else {
			str = str + "/" + TextGet("KinkyDungeonSpell" + pr);
		}
	}
	return str;
}

function KinkyDungeonCheckSpellPrerequisite(spell) {
	if (!spell || !spell.prerequisite) return true;
	if (spell.upcastFrom && !KDHasSpell(spell.upcastFrom)) return false;
	if (typeof spell.prerequisite === "string") {
		let spell_prereq = KinkyDungeonSearchSpell(KinkyDungeonSpells, spell.prerequisite);
		if (spell_prereq) return true;
		return false;
	} else {
		for (let pr of spell.prerequisite) {
			let spell_prereq = KinkyDungeonSearchSpell(KinkyDungeonSpells, pr);
			if (spell_prereq) return true;
		}
		return false;
	}
}

// Patch un-translated english string display issue in chinese Language game mode
// the using detect lib from https://github.com/richtr/guessLanguage.js
// i rewrite the origin lib useless callback mode to return mode
// now only fix chinese
function KinkyDungeonDetectLanguageForMaxWidth(str, maxWidthTranslate, maxWidthEnglish) {
	try {
		if (TranslationLanguage === 'CN') {
			let languageName = guessLanguage.name(str);
			// console.log('KinkyDungeonDetectLanguageForMaxWidth languageName', languageName);
			if (languageName === "unknown") {
				return maxWidthTranslate;
			} else if (languageName === "Chinese") {
				return maxWidthTranslate;
			} else if (languageName === "English") {
				return maxWidthEnglish;
			} else {
				// if not Chinese then all are english fallback
				return maxWidthEnglish;
			}
		} else {
			return maxWidthTranslate;
		}
	} catch (e) {
		return maxWidthTranslate;
	}
}

// https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function KinkyDungeonWordWrap(str, maxWidthTranslate, maxWidthEnglish) {
	let newLineStr = "\n";
	let res = '';
	// console.log('KinkyDungeonDetectLanguageForMaxWidth before', str, maxWidth);
	let	maxWidth = KinkyDungeonDetectLanguageForMaxWidth(str, maxWidthTranslate, maxWidthEnglish);
	// console.log('KinkyDungeonDetectLanguageForMaxWidth after', maxWidth);
	while (str.length > maxWidth) {
		let found = false;
		// Inserts new line at first whitespace of the line
		for (let i = maxWidth - 1; i >= 0; i--) {
			if (KinkyDungeonTestWhite(str.charAt(i))) {
				res = res + [str.slice(0, i), newLineStr].join('');
				str = str.slice(i + 1);
				found = true;
				break;
			}
		}
		// Inserts new line at maxWidth position, the word is too long to wrap
		if (!found) {
			res += [str.slice(0, maxWidth), newLineStr].join('');
			str = str.slice(maxWidth);
		}

	}

	return res + str;
}

function KinkyDungeonTestWhite(x) {
	let white = new RegExp(/^\s$/);
	return white.test(x.charAt(0));
}

function KDSchoolColor(school) {
	switch (school) {
		case "Elements": return "#ff4444";
		case "Conjure": return "#77cc99";
		case "Illusion": return "#8877ff";
	}

	return KDTextTan;
}

function KinkyDungeonDrawMagic() {
	KinkyDungeonDrawMessages(true);
	DrawImageZoomCanvas(KinkyDungeonRootDirectory + "MagicBook.png", MainCanvas, 0, 0, 640, 483, canvasOffsetX_ui, canvasOffsetY_ui, 640*KinkyDungeonBookScale, 483*KinkyDungeonBookScale, false);

	if (KinkyDungeonSpells[KinkyDungeonCurrentPage] || KinkyDungeonPreviewSpell) {
		let spell = KinkyDungeonPreviewSpell ? KinkyDungeonPreviewSpell : KinkyDungeonSpells[KinkyDungeonCurrentPage];

		let SchoolColor = KDTextTan;
		if (spell.school) SchoolColor = KDSchoolColor(spell.school);

		DrawTextKD(TextGet("KinkyDungeonSpell"+ spell.name), canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5, "#000000", SchoolColor);
		DrawTextKD(TextGet("KinkyDungeonSpellsSchool" + spell.school), canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + 40, "#000000", SchoolColor);

		if (spell.prerequisite) {
			DrawTextKD(TextGet("KDPrerequisite"), canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6, KDTextGray0, KDTextTan);
			DrawTextFitKD(KDGetPrerequisite(spell), canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.6 + 40, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan);
		}

		if (spell.upcastFrom) {
			DrawTextFitKD(TextGet("KDUpcastFrom").replace("SPELL", TextGet("KinkyDungeonSpell" + spell.upcastFrom)),
				canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.4 + 40, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan);
			DrawTextFitKD(TextGet("KDUpcastLevel").replace("LEVEL", "" + spell.upcastLevel),
				canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale*0.4, 640*KinkyDungeonBookScale * 0.35, KDTextGray0, KDTextTan);
		}

		if (KinkyDungeonPreviewSpell) DrawTextKD(TextGet("KinkyDungeonMagicCost") + KinkyDungeonGetCost(spell), canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 150, KDTextGray0, KDTextTan);
		DrawTextKD(TextGet("KinkyDungeonMagicManaCost") + (spell.manacost * 10), canvasOffsetX_ui + 640*KinkyDungeonBookScale/3.35, canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 195, KDTextGray0, KDTextTan);
		let wrapAmount = TranslationLanguage == 'CN' ? 9 : 22;
		let textSplit = KinkyDungeonWordWrap(TextGet("KinkyDungeonSpellDescription"+ spell.name).replace("DamageDealt", "" + (spell.power * 10)).replace("Duration", spell.time).replace("LifeTime", spell.lifetime).replace("DelayTime", spell.delay).replace("BlockAmount", "" + (10 * spell.block)), wrapAmount, 22).split('\n');
		let i = 0;
		for (let N = 0; N < textSplit.length; N++) {
			DrawTextKD(textSplit[N],
				canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1/3.3), canvasOffsetY_ui + 483*KinkyDungeonBookScale/5 + i * 40, KDTextGray0, KDTextTan); i++;}

		i = 0;
		if (spell.components.includes("Verbal")) {DrawTextKD(TextGet("KinkyDungeonComponentsVerbal"), canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 215 - 40*i, KDTextGray0, KDTextTan); i++;}
		if (spell.components.includes("Arms")) {DrawTextKD(TextGet("KinkyDungeonComponentsArms"), canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 215  - 40*i, KDTextGray0, KDTextTan); i++;}
		if (spell.components.includes("Legs")) {DrawTextKD(TextGet("KinkyDungeonComponentsLegs"), canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 215 - 40*i, KDTextGray0, KDTextTan); i++;}
		DrawTextKD(TextGet("KinkyDungeonComponents"), canvasOffsetX_ui + 640*KinkyDungeonBookScale*(1-1/3.35), canvasOffsetY_ui + 483*KinkyDungeonBookScale/2 + 215 - 40*i, "#000000", KDTextTan); i = 1;

		if (!KinkyDungeonPreviewSpell) {

			if (!spell.passive && !spell.upcastFrom) {
				let w = 225;
				let h = 50;
				let x_start = canvasOffsetX_ui + 640*KinkyDungeonBookScale + 40;
				let y_start = canvasOffsetY_ui + 150;
				for (let I = 0; I < KinkyDungeonSpellChoiceCount; I++) {
					let x = x_start + w * Math.floor(I / KinkyDungeonSpellChoiceCountPerPage);
					let y = y_start + h * (I % KinkyDungeonSpellChoiceCountPerPage);

					if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]])
						DrawImageEx(KinkyDungeonRootDirectory + "Spells/" + KinkyDungeonSpells[KinkyDungeonSpellChoices[I]].name + ".png", x - h, y, {
							Width: h,
							Height: h,
						});
					DrawTextFitKD(`${1 + (I % KinkyDungeonSpellChoiceCountPerPage)}`, x - h, y + h*0.5, h*0.25, "#efefef", "#888888");
					DrawButtonKDEx("SpellSlotBook" + I, (bdata) => {
						if (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] == spell) {
							KDSendInput("spellRemove", {I:I});
						} else {
							if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
								KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
							}
							KinkyDungeonClickSpellChoice(I, KinkyDungeonCurrentPage);
						}
						return true;
					}, true, x, y, w - 25 - h, h - 5, (KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] ? (TextGet("KinkyDungeonSpell" + KinkyDungeonSpells[KinkyDungeonSpellChoices[I]].name)) : ""),
						KinkyDungeonSpells[KinkyDungeonSpellChoices[I]] && KinkyDungeonSpells[KinkyDungeonSpellChoices[I]].name == spell.name ? "White" : KDTextGray3, "", "");
				}
			}


			if (!spell.passive && !(spell.type == "passive") && !spell.upcastFrom)
				DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale * 0.5 - 200, canvasOffsetY_ui - 70 + 483*KinkyDungeonBookScale, 400, 60, TextGet("KinkyDungeonSpellCastFromBook")
					.replace("XXX", KinkyDungeonStatsChoice.has("Disorganized") ? "3" : (KinkyDungeonStatsChoice.has("QuickDraw") ? "No" : "1")), "White", "", "", false, true, KDButtonColor);
		} else {
			let cost = KinkyDungeonGetCost(spell);
			DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale + 40, canvasOffsetY_ui + 125, 225, 60, TextGet("KinkyDungeonSpellsBuy"),
				(KinkyDungeonSpellPoints >= cost && KinkyDungeonCheckSpellPrerequisite(spell)) ? "White" : "Pink", "", "");
		}
	}

	if (KinkyDungeonCurrentPage > 0) {
		DrawButtonVis(canvasOffsetX_ui + 100, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookLastPage"), "White", "", "", false, true, KDButtonColor);
	}
	if (KinkyDungeonCurrentPage < KinkyDungeonSpells.length-1) {
		DrawButtonVis(canvasOffsetX_ui + 640*KinkyDungeonBookScale - 325, canvasOffsetY_ui + 483*KinkyDungeonBookScale, 250, 60, TextGet("KinkyDungeonBookNextPage"), "White", "", "", false, true, KDButtonColor);
	}
	if (KDSwapSpell != -1) {
		DrawTextKD(TextGet("KinkyDungeonMagicSpellsQuick").replace("SPELLNAME", TextGet("KinkyDungeonSpell" + KinkyDungeonSpells[KinkyDungeonSpellChoices[KDSwapSpell]].name)), canvasOffsetX_ui + 600, 900, "white", KDTextGray0);
	} else {
		DrawTextKD(TextGet("KinkyDungeonSpellsLevels")
			.replace("SPELLPOINTS", "" + KinkyDungeonSpellPoints), canvasOffsetX_ui + 600, 890, "white", KDTextGray0);
	}

}


let selectedFilters = ["learnable"];
let genericfilters = ['learnable', 'unlearned', 'noupgrade', 'yesupgrade', "upcast"];

let KDSpellListIndex = 0;
let KDSpellListIndexVis = 0;
let KDMaxSpellPerColumn = 8;
let KDMaxSpellYY = 480;

function KDFilterSpellPages() {
	if (!KDGameData.HiddenSpellPages) return KinkyDungeonLearnableSpells;
	let pages = [];
	for (let i = 0; i < KinkyDungeonLearnableSpells.length; i++) {
		if (!KDGameData.HiddenSpellPages[KinkyDungeonSpellPages[i]]) {
			pages.push(KinkyDungeonLearnableSpells[i]);
		}
	}
	return pages;
}
function KDFilterSpellPageNames() {
	if (!KDGameData.HiddenSpellPages) return KinkyDungeonSpellPages;
	let pages = [];
	for (let i = 0; i < KinkyDungeonLearnableSpells.length; i++) {
		if (!KDGameData.HiddenSpellPages[KinkyDungeonSpellPages[i]]) {
			pages.push(KinkyDungeonSpellPages[i]);
		}
	}
	return pages;
}

function KDCorrectCurrentSpellPage(pages) {
	let ret = 0;
	for (let i = 0; i < KinkyDungeonCurrentSpellsPage; i++) {
		if (!KDGameData.HiddenSpellPages[KinkyDungeonSpellPages[i]]) {
			ret += 1;
		}
	}
	return ret;
}

function KinkyDungeonListSpells(Mode) {
	let i = 0;
	//let ii = 0;
	//let maxY = 560;
	let XX = 0;
	let spacing = 60;
	let subspell_reduction = 20;
	let ypadding = 10;
	let yPad = 120 + MagicSpellsUIShift;
	let buttonwidth = 280;
	let xpadding = 20;
	let col = 0;
	let ypadding_min = -2;

	let weight = 5;
	KDSpellListIndexVis = (KDSpellListIndex + KDSpellListIndexVis * (weight-1)) / weight;

	let pages = KDFilterSpellPages();
	let currentPage = KinkyDungeonCurrentSpellsPage;
	let spellPages = pages[currentPage];
	let pageNames = KDFilterSpellPageNames();
	let columnLabels = KDColumnLabels[currentPage];
	let extraFilters = filtersExtra[currentPage];

	// Draw filters
	if (Mode == "Draw") {
		let x = 4 * (buttonwidth + xpadding);
		let y = 25 + canvasOffsetY_ui;
		let filterlist = Object.assign([], filters);
		if (extraFilters) {
			for (let ff of extraFilters) {
				filterlist.push(ff);
			}
		}
		// Now we have our total filters, time to draw
		for (let f of filterlist) {
			let ticked = selectedFilters.includes(f);
			DrawButtonKDEx("filter" + f, (bdata) => {
				if (selectedFilters.includes(f))
					selectedFilters.splice(selectedFilters.indexOf(f), 1);
				else
					selectedFilters.push(f);
				return true;
			}, true, canvasOffsetX_ui + x, y, buttonwidth, 36, TextGet("KinkyDungeonFilter" + f), selectedFilters.includes(f) ? "#ffffff" : "#999999", ticked ? (KinkyDungeonRootDirectory + "UI/Tick.png") : "", "", false, true);
			y += 42;
		}
	}

	if (columnLabels) {
		for (let column = 0; column < columnLabels.length; column++) {
			let x = canvasOffsetX_ui + column * (buttonwidth + xpadding);
			let y = yPad - 40 + canvasOffsetY_ui;
			DrawTextKD(TextGet("KinkyDungeonColumn" + columnLabels[column]), x + buttonwidth/2, y + 20, "#ffffff", KDTextGray0);
		}
	}


	let longestList = 0;
	for (let pg of spellPages) {
		longestList = Math.max(longestList, pg.length);
	}
	if (KDSpellListIndex > longestList) KDSpellListIndex = 0;

	DrawButtonKDEx("spellsUp", (bdata) => {
		KDSpellListIndex = Math.max(0, KDSpellListIndex - 3);
		return true;
	}, KDSpellListIndex > 0, 910, 800, 90, 40, "", KDSpellListIndex > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");
	DrawButtonKDEx("spellsDown", (bdata) => {
		KDSpellListIndex = Math.max(0, Math.min(longestList - KDMaxSpellPerColumn + 1, KDSpellListIndex + 3));
		return true;
	}, KDSpellListIndex < longestList - KDMaxSpellPerColumn + 1, 1160, 800, 90, 40, "", KDSpellListIndex < longestList - KDMaxSpellPerColumn + 1 ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");

	// Draw the spells themselves
	for (let pg of spellPages) {
		let column = col;//Math.floor((spacing * i) / (maxY));
		i = 0;
		let iii = 0;

		let YY = 0;
		for (let sp of pg) {
			let spell = KinkyDungeonFindSpell(sp, false);
			let prereq = spell ? KinkyDungeonCheckSpellPrerequisite(spell) : false;
			let prereqHost = spell ? (spell.upcastFrom && KinkyDungeonCheckSpellPrerequisite(KinkyDungeonFindSpell(spell.upcastFrom))) : false;
			let learned = spell ? KinkyDungeonSpellIndex(spell.name) >= 0 : false;
			let upgrade = spell ? spell.passive : false;
			let passive = spell ? spell.type == "passive" : false;
			let upcast = spell ? spell.upcastFrom : false;
			if (spell
				&& (KDSwapSpell == -1 || KinkyDungeonSpellIndex(spell.name) >= 0)
				//&& i < KDMaxSpellPerColumn
				&& YY < KDMaxSpellYY + spacing
				&& (!spell.hideLearned || !learned)
				&& (!spell.hideUnlearnable || prereq || learned)
				&& (selectedFilters.length == 0 || (selectedFilters.every((element) => {return genericfilters.includes(element) || (spell.tags && spell.tags.includes(element));})))
				&& (!selectedFilters.includes("learnable") || (prereq || learned || prereqHost))
				&& (!selectedFilters.includes("unlearned") || (!learned))
				&& (!selectedFilters.includes("noupgrade") || (!upgrade && !upcast))
				&& (!selectedFilters.includes("yesupgrade") || (upgrade || passive))
				&& (!selectedFilters.includes("upcast") || (upcast))) {

				if (iii < Math.round(KDSpellListIndexVis)) {
					iii += 1;
					continue;
				}
				XX = column * (buttonwidth + xpadding);
				//ii = i;// - column * Math.ceil(maxY / spacing);

				if (!spell.upcastFrom && i > 0) {
					YY += ypadding;
				}

				let cost = KinkyDungeonGetCost(spell);
				let suff = `${cost}`;
				let yy = yPad + canvasOffsetY_ui + YY + (spell.upcastFrom ? 2 : 0);
				let h = spacing - ypadding + (spell.upcastFrom ? -subspell_reduction : 0);
				let w = buttonwidth + (spell.upcastFrom ? -30 : 0);
				let xx = canvasOffsetX_ui + XX + (spell.upcastFrom ? 30 : 0);

				if (Mode == "Draw") {
					let color = KDSwapSpell == -1 ? "#bbbbbb" : "#777777";
					let index = KinkyDungeonSpellIndex(spell.name);
					if (index >= 0 && (KDSwapSpell == -1 || !KinkyDungeonSpellChoices.includes(index))) {
						color = "#ffffff";
						suff = "";
					} else if (!KinkyDungeonCheckSpellPrerequisite(spell)) {
						color = "#777777";
						//suff = "";
					}
					if (!spell.passive)
						KDDraw(kdcanvas, kdpixisprites, "spIcon" + spell.name, KinkyDungeonRootDirectory + "Spells/" + spell.name + ".png",
							xx,
							yy,
							h,
							h,
						);
					if (index >= 0)
						KDDraw(kdcanvas, kdpixisprites, "spIconTick" + spell.name, KinkyDungeonRootDirectory + "UI/" + "CheckSmall" + ".png",
							xx + w - 30,
							yy + h/2-15,
							30,
							30,
						);
					DrawButtonVis(xx,
						yy,
						w,
						h,
						"", color,
						"", "", false, true, (index >= 0) ? "rgba(7, 7, 7, 0.9)" : "rgba(4, 4, 4, 0.9)", // Image: KinkyDungeonSpellChoices.includes(index) ? (KinkyDungeonRootDirectory + "UI/Tick.png") : ""
						(spell.upcastFrom ? 20 : 24));
					DrawTextFitKD(TextGet("KinkyDungeonSpell" + spell.name),
						xx + h + 2 + (spell.upcastFrom ? 0 : 8),
						yy + h/2,
						w - h*1.75, color, undefined, (spell.upcastFrom ? 18 : 22), "left", undefined, undefined, false);
					DrawTextFitKD(suff,
						xx + w - 8,
						yy + h/2,
						h, KinkyDungeonSpellPoints >= cost ? color : "#ff5555", undefined, 20, "right", undefined, undefined, false);
				} else if (Mode == "Click") {
					if (MouseIn(canvasOffsetX_ui + XX, yPad + canvasOffsetY_ui + YY, buttonwidth, spacing - ypadding)) return spell;
				}
				i++;
				YY += h + ypadding_min;
			}
		}
		col++;
	}

	let procList = pageNames;
	let adjLists = GetAdjacentList(procList, currentPage, 1);
	let left = adjLists.left;
	let right = adjLists.right;

	drawVertList(left.reverse(), canvasOffsetX_ui + 200/2 + 100, 100, 200, 25, 5, 18, (data) => {
		return (bdata) => {
			KinkyDungeonCurrentSpellsPage = procList.indexOf(data.name);
			return true;
		};
	}, "KinkyDungeonSpellsPage");
	drawVertList(right, canvasOffsetX_ui - 200/2 + 1050, 100, 200, 25, 5, 18, (data) => {
		return (bdata) => {
			KinkyDungeonCurrentSpellsPage = procList.indexOf(data.name);
			return true;
		};
	}, "KinkyDungeonSpellsPage");

	return undefined;
}

let MagicSpellsUIShift = -80;

function KinkyDungeonDrawMagicSpells() {

	KinkyDungeonListSpells("Draw");
	MainCanvas.textAlign = "center";


	let pages = KDFilterSpellPages();
	let currentPage = KinkyDungeonCurrentSpellsPage;//KDCorrectCurrentSpellPage(pages);
	let pageNames = KDFilterSpellPageNames();

	DrawTextKD(
		TextGet("KinkyDungeonSpellsPage").replace("NUM", "" + (currentPage + 1)).replace("TOTAL", "" + (pages.length)) + ": " + TextGet("KinkyDungeonSpellsPage" + pageNames[currentPage]),
		canvasOffsetX_ui + 575, canvasOffsetY_ui + 25 + MagicSpellsUIShift, "white", KDTextGray0);
	//DrawTextKD(TextGet("KinkyDungeonSpellsPoints") + KinkyDungeonSpellPoints, 650, 900, "white", KDTextGray0);

	MainCanvas.beginPath();
	MainCanvas.lineWidth = 3;
	MainCanvas.strokeStyle = KDBorderColor;
	MainCanvas.moveTo(canvasOffsetX_ui, canvasOffsetY_ui + 70 + MagicSpellsUIShift);
	MainCanvas.lineTo(canvasOffsetX_ui + 1150, canvasOffsetY_ui + 70 + MagicSpellsUIShift);
	MainCanvas.stroke();
	MainCanvas.closePath();

	MainCanvas.textAlign = "center";
	if (KDSwapSpell != -1) {
		DrawTextKD(TextGet(
			"KinkyDungeonMagicSpellsQuick").replace(
			"SPELLNAME",
				(KinkyDungeonSpells[KinkyDungeonSpellChoices[KDSwapSpell]]) ?
				TextGet("KinkyDungeonSpell" + KinkyDungeonSpells[KinkyDungeonSpellChoices[KDSwapSpell]].name)
				: TextGet("KinkyDungeonSpellNone")),
		canvasOffsetX_ui + 600, 900, "white", KDTextGray0);
	} else {
		DrawTextKD(TextGet("KinkyDungeonSpellsLevels")
			.replace("SPELLPOINTS", "" + KinkyDungeonSpellPoints), canvasOffsetX_ui + 600, 890, "white", KDTextGray0);
	}
	DrawButtonVis(canvasOffsetX_ui + 0, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageBackFast"), "White", "", "", false, false, KDButtonColor);
	DrawButtonVis(canvasOffsetX_ui + 1100, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageNextFast"), "White", "", "", false, false, KDButtonColor);
	DrawButtonVis(canvasOffsetX_ui + 55, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageBack"), "White", "", "", false, false, KDButtonColor);
	DrawButtonVis(canvasOffsetX_ui + 1045, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50, TextGet("KinkyDungeonSpellsPageNext"), "White", "", "", false, false, KDButtonColor);
}


function KinkyDungeonHandleMagicSpells() {


	let pages = KDFilterSpellPages();

	if (MouseIn(canvasOffsetX_ui + 50, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage > 0) KinkyDungeonCurrentSpellsPage -= 1;
		else KinkyDungeonCurrentSpellsPage = pages.length - 1;
		KDSpellListIndex = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		return true;
	} else if (MouseIn(canvasOffsetX_ui + 1045, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage < pages.length - 1) KinkyDungeonCurrentSpellsPage += 1;
		else KinkyDungeonCurrentSpellsPage = 0;
		KDSpellListIndex = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		return true;
	} else if (MouseIn(canvasOffsetX_ui + 0, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage > 0) {
			if (KinkyDungeonCurrentSpellsPage > 2) KinkyDungeonCurrentSpellsPage -= 3;
			else KinkyDungeonCurrentSpellsPage = 0;
		} else KinkyDungeonCurrentSpellsPage = pages.length - 1;
		KDSpellListIndex = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		return true;
	} else if (MouseIn(canvasOffsetX_ui + 1100, canvasOffsetY_ui + MagicSpellsUIShift, 50, 50)) {
		if (KinkyDungeonCurrentSpellsPage < pages.length - 1)  {
			if (KinkyDungeonCurrentSpellsPage < pages.length - 3) KinkyDungeonCurrentSpellsPage += 3;
			else KinkyDungeonCurrentSpellsPage = pages.length - 1;
		}
		else KinkyDungeonCurrentSpellsPage = 0;
		selectedFilters = selectedFilters.filter((filter) => {
			return filters.includes(filter);
		});
		KDSpellListIndex = 0;
		return true;
	}

	let spell = KinkyDungeonListSpells("Click");
	if (spell) {
		if (KDSwapSpell == -1) {
			KinkyDungeonSetPreviewSpell(spell);
		} else if (!spell.upcastFrom) {
			let index = KinkyDungeonSpellIndex(spell.name);
			if (!KinkyDungeonSpellChoices.includes(index)) {
				KinkyDungeonClickSpellChoice(KDSwapSpell, index);
				KinkyDungeonDrawState = "Game";
			}
		}
		return true;
	}

	return true;
}

function KinkyDungeonSpellIndex(Name) {
	for (let i = 0; i < KinkyDungeonSpells.length; i++) {
		if (KinkyDungeonSpells[i].name == Name) return i;
	}
	return -1;
}

function KinkyDungeonSetPreviewSpell(spell) {
	let index = KinkyDungeonSpellIndex(spell.name);
	KinkyDungeonPreviewSpell = index >= 0 ? null : spell;
	if (!KinkyDungeonPreviewSpell) KinkyDungeonCurrentPage = index;
	KinkyDungeonDrawState = "Magic";
}

function KinkyDungeonGetCompList(spell) {
	let ret = "";
	if (spell.components)
		for (let c of spell.components) {
			if (ret) ret = ret + "/";
			if (c == "Verbal") ret = ret + (ret ? "V" : "Verbal");
			else if (c == "Arms") ret = ret + (ret ? "A" : "Arms");
			else if (c == "Legs") ret = ret + (ret ? "L" : "Legs");
		}

	//if (ret)
	//return "(" + ret + ")";
	//else
	return ret;
}

function KinkyDungeonSendMagicEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapSpell, Event)) return;
	for (let i = 0; i < KinkyDungeonSpellChoices.length; i++) {
		let spell = KinkyDungeonSpells[KinkyDungeonSpellChoices[i]];
		if (spell && spell.events) {
			for (let e of spell.events) {
				if (e.trigger == Event && (KinkyDungeonSpellChoicesToggle[i] || e.always)) {
					KinkyDungeonHandleMagicEvent(Event, e, spell, data);
				}
			}
		}
	}
	for (let i = 0; i < KinkyDungeonSpells.length; i++) {
		let spell = KinkyDungeonSpells[i];
		if (spell && spell.passive && spell.events) {
			for (let e of spell.events) {
				if (e.trigger == Event) {
					KinkyDungeonHandleMagicEvent(Event, e, spell, data);
				}
			}
		}
	}
}


function KDCastSpellToEnemies(fn, tX, tY, spell) {
	let enList = KDNearbyEnemies(tX, tY, spell.aoe);
	let cast = false;

	if (enList.length > 0) {
		for (let en of enList) {
			if (fn(en)) cast = true;
		}
	}

	return cast;
}

/**
 * Returns true if the enemy matches one of the tags
 * @param {string[]} tags
 * @param {entity} entity
 * @returns {boolean}
 */
function KDMatchTags(tags, entity) {
	if (tags) {
		for (let tag of tags) {
			if (entity?.Enemy?.tags[tag]) return true;
		}
	}
	return false;
}
