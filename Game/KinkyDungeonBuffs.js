"use strict";

function KinkyDungeonSendBuffEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapBuff, Event)) return;
	for (let buff of Object.values(KinkyDungeonPlayerBuffs)) {
		if (buff && buff.events) {
			for (let e of buff.events) {
				if (e.trigger == Event) {
					KinkyDungeonHandleBuffEvent(Event, e, buff, KinkyDungeonPlayerEntity, data);
				}
			}
		}
	}
	for (let ent of KinkyDungeonEntities) {
		if (ent.buffs) {
			for (let buff of Object.values(ent.buffs)) {
				if (buff && buff.events) {
					for (let e of buff.events) {
						if (e.trigger == Event) {
							KinkyDungeonHandleBuffEvent(Event, e, buff, ent, data);
						}
					}
				}
			}
		}
	}
}

// Decreases time left in buffs and also applies effects
function KinkyDungeonTickBuffs(list, delta, endFloor, entity) {
	for (const [key, value] of Object.entries(list)) {
		if (value) {
			if (value.endFloor && endFloor) KinkyDungeonExpireBuff(list, key);
			else if (value.endSleep && KDGameData.SleepTurns > 1) KinkyDungeonExpireBuff(list, key);
			else if (!value.duration || value.duration < 0) KinkyDungeonExpireBuff(list, key);
			else {
				if (value.type == "restore_mp") KinkyDungeonChangeMana(value.power);
				if (value.type == "restore_wp") KinkyDungeonChangeWill(value.power);
				if (value.type == "restore_sp") KinkyDungeonChangeStamina(value.power);
				if (value.type == "restore_ap") KinkyDungeonChangeDistraction(value.power, true);

				if (value.type == "SpellCastConstant" && value.spell && entity) {
					KinkyDungeonCastSpell(entity.x, entity.y, KinkyDungeonFindSpell(value.spell, true), undefined, undefined, undefined);
				}

				if (value.type == "Flag") {
					KinkyDungeonSetFlag(value.id, 1 + delta);
				}

				if (!(value.infinite))
					value.duration -= delta;
			}
		}
	}
}

function KinkyDungeonTickBuffTag(list, tag, Amount = 1) {
	if (list)
		for (const [key, value] of Object.entries(list)) {
			if (value) {
				if (value.maxCount && value.tags.includes(tag)) {
					if (!value.currentCount) value.currentCount = 0;
					value.currentCount += Amount;
					if (value.currentCount >= value.maxCount) KinkyDungeonExpireBuff(list, key);
				}
			}
		}
}

/**
 *
 * @param {entity} entity
 * @param {string} tag
 * @returns {boolean}
 */
function KDEntityHasBuffTags(entity, tag) {
	let list = entity.player ? KinkyDungeonPlayerBuffs : entity.buffs;
	if (list) {
		for (const buff of Object.values(list)) {
			if (buff) {
				if (buff.tags && buff.tags.includes(tag)) return true;
			}
		}
	}
	return false;
}
/**
 *
 * @param {entity} entity
 * @param {string} tag
 * @returns {Record<string, any>}
 */
function KDGetBuffsWithTag(entity, tag) {
	let ret = {};
	let list = entity.player ? KinkyDungeonPlayerBuffs : entity.buffs;
	if (list) {
		for (const [key, buff] of Object.entries(list)) {
			if (buff) {
				if (buff.tags && buff.tags.includes(tag)) ret[key] = buff;
			}
		}
	}
	return ret;
}

/**
 *
 * @param {entity} entity
 * @param {string[]} tags
 */
function KinkyDungeonRemoveBuffsWithTag(entity, tags) {
	let list = null;
	if (entity && entity.player) {
		list = KinkyDungeonPlayerBuffs;
	} else if (entity.buffs) list = entity.buffs;
	if (list)
		for (const [key, value] of Object.entries(list)) {
			if (value) {
				for (let t of tags)
					if (value.tags && value.tags.includes(t)) {
						KinkyDungeonExpireBuff(list, key);
					}
			}
		}
}

// Updates buffs for all creatures
function KinkyDungeonUpdateBuffs(delta, endFloor) {
	// Tick down buffs the buffs
	KinkyDungeonSendEvent("tickBuffs", {delta: delta});
	KinkyDungeonTickBuffs(KinkyDungeonPlayerBuffs, delta, endFloor, KinkyDungeonPlayerEntity);
	for (let enemy of KinkyDungeonEntities) {
		if (!enemy.buffs) enemy.buffs = {};
		KinkyDungeonTickBuffs(enemy.buffs, delta, endFloor, enemy);
	}

	// Apply the buffs from bullets
	for (let b of KinkyDungeonBullets) {
		if (b.bullet.spell && b.bullet.spell.buffs) { // Apply the buff
			for (let buff of b.bullet.spell.buffs) {

				if (buff.player && buff.range >= Math.sqrt((KinkyDungeonPlayerEntity.x - b.x) * (KinkyDungeonPlayerEntity.x - b.x) + (KinkyDungeonPlayerEntity.y - b.y) * (KinkyDungeonPlayerEntity.y - b.y))) {
					KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, buff);
				}
				if (buff.enemies) {
					for (let enemy of KinkyDungeonEntities) {
						if ((KDHostile(enemy) || !buff.noAlly)
							&& (KDAllied(enemy) || !buff.onlyAlly)
							&& (!b.bullet.spell.filterTags || b.bullet.spell.filterTags.some((tag) => {return enemy.Enemy.tags[tag];}))
							&& buff.range >= Math.sqrt((enemy.x - b.x) * (enemy.x - b.x) + (enemy.y - b.y) * (enemy.y - b.y))) {
							KinkyDungeonApplyBuff(enemy.buffs, buff);
						}
					}

				}
			}
		}
	}
}

function KinkyDungeonGetBuffedStat(list, Stat, onlyPositiveDuration) {
	let stat = 0;
	if (list)
		for (let buff of Object.values(list)) {
			if (buff && buff.type == Stat && (!onlyPositiveDuration || buff.duration > 0)) {
				stat += buff.power;
			}
		}
	return stat;
}

function KinkyDungeonExpireBuff(list, key) {
	delete list[key];
}

function KinkyDungeonApplyBuffToEntity(entity, origbuff, changes) {
	if (entity && entity.player) {
		KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, origbuff, changes);
	} else if (entity) {
		if (!entity.buffs) entity.buffs = {};
		KinkyDungeonApplyBuff(entity.buffs, origbuff, changes);
	}
}

function KinkyDungeonApplyBuff(list, origbuff, changes) {
	if (!origbuff) return;
	let buff = {};
	Object.assign(buff, origbuff);
	if (changes)
		Object.assign(buff, changes);
	let id = buff.id ? buff.id : buff.name;

	if (list[id] && buff.cancelOnReapply) {
		KinkyDungeonExpireBuff(list, id);
	} else {
		if (!list[id] && buff.sfxApply) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + buff.sfxApply + ".ogg");
		if (!list[id] || (list[id].power > 0 && buff.power >= list[id].power) || (list[id].power < 0 && ((buff.power > 0 && buff.power >= list[id].power) || buff.power <= list[id].power))) list[id] = buff;
		if ((list[id].power && buff.power == list[id].power && buff.duration >= list[id].duration)) list[id].duration = buff.duration;

		if (buff.tags)
			for (let tag of buff.tags) {
				if (tag == "darkness" && list == KinkyDungeonPlayerBuffs) {
					KinkyDungeonBlindLevelBase = Math.max(KinkyDungeonBlindLevelBase, 1);
				} else if (tag == "heavydarkness" && list == KinkyDungeonPlayerBuffs) {
					KinkyDungeonBlindLevelBase = Math.max(KinkyDungeonBlindLevelBase, 2);
				}
			}
	}
}

function KinkyDungeonGetbuff(list, Buff) {
	if (list && list[Buff]) return list[Buff];
	else return null;
}

function KinkyDungeonHasBuff(list, Buff) {
	if (list && list[Buff]) return true;
	else return false;
}

function KDEntityHasBuff(entity, buff) {
	if (entity.player) {
		return KinkyDungeonHasBuff(KinkyDungeonPlayerBuffs, buff);
	} else return KinkyDungeonHasBuff(entity.buffs, buff);
}
function KDEntityBuffedStat(entity, stat) {
	if (entity.player) {
		return KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat);
	} else return KinkyDungeonGetBuffedStat(entity.buffs, stat);
}

function KDEntityGetBuff(entity, buff) {
	if (entity.player) {
		return KinkyDungeonGetbuff(KinkyDungeonPlayerBuffs, buff);
	} else return KinkyDungeonGetbuff(entity.buffs, buff);
}