"use strict";

function KinkyDungeonSendBuffEvent(Event: string, data: any) {
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

	for (let ent of KDMapData.Entities) {
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

/**
 * Decreases time left in buffs and also applies effects
 * @param entity
 * @param delta
 * @param endFloor
 */
function KinkyDungeonTickBuffs(entity: entity, delta: number, endFloor: boolean): void {
	let list = null;
	if (entity == KinkyDungeonPlayerEntity)
		list = KinkyDungeonPlayerBuffs;
	else if (entity.buffs) list = entity.buffs;
	for (const [key, v] of Object.entries(list)) {
		const value: any = v;
		if (value) {
			if (value.endFloor && endFloor) KinkyDungeonExpireBuff(entity, key);
			else if (value.endSleep && KDGameData.SleepTurns > 1) KinkyDungeonExpireBuff(entity, key);
			else if (!value.duration || value.duration < 0) KinkyDungeonExpireBuff(entity, key);
			else {
				if (value.type == "restore_mp") KinkyDungeonChangeMana(value.power);
				else if (value.type == "restore_wp") KinkyDungeonChangeWill(value.power);
				else if (value.type == "restore_sp") KinkyDungeonChangeStamina(value.power);
				else if (value.type == "restore_ap") KinkyDungeonChangeDistraction(value.power, true);

				else if (value.type == "SpellCastConstant" && value.spell && entity) {
					KinkyDungeonCastSpell(entity.x, entity.y, KinkyDungeonFindSpell(value.spell, true), undefined, undefined, undefined);
				}

				else if (value.type == "Flag") {
					KinkyDungeonSetFlag(value.id, 1 + delta);
				}
				else if (KDCustomBuff[value.type]) {
					KDCustomBuff[value.type](entity, value);
				}


				if (!(value.infinite))
					value.duration -= delta;
			}
		}
	}
}

/**
 * @param entity
 * @param tag
 * @param Amount
 */
function KinkyDungeonTickBuffTag(entity: entity, tag: string, Amount: number = 1): void {
	let list = null;
	if (entity == KinkyDungeonPlayerEntity)
		list = KinkyDungeonPlayerBuffs;
	else if (entity.buffs) list = entity.buffs;
	if (list)
		for (const [key, v] of Object.entries(list)) {
			const value: any = v;
			if (value) {
				if (value.maxCount && value.tags?.includes(tag)) {
					if (!value.currentCount) value.currentCount = 0;
					value.currentCount += Amount;
					if (value.currentCount >= value.maxCount) KinkyDungeonExpireBuff(entity, key);
				}
			}
		}
}

/**
 * @param entity
 * @param tag
 */
function KDEntityHasBuffTags(entity: entity, tag: string): boolean {
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
 * @param entity
 * @param tag
 * @returns {Record<string, any>}
 */
function KDGetBuffsWithTag(entity: entity, tag: string): Record<string, any> {
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
 * @param entity
 * @param tags
 */
function KinkyDungeonRemoveBuffsWithTag(entity: entity, tags: string[]) {
	let list = null;
	if (entity && entity.player) {
		list = KinkyDungeonPlayerBuffs;
	} else if (entity?.buffs) list = entity.buffs;
	if (list)
		for (const [key, v] of Object.entries(list)) {
			const value: any = v;
			if (value) {
				for (let t of tags)
					if (value.tags && value.tags.includes(t)) {
						KinkyDungeonExpireBuff(entity, key);
					}
			}
		}
}

// Updates buffs for all creatures
function KinkyDungeonUpdateBuffs(delta: number, endFloor: boolean) {
	// Tick down buffs the buffs
	KinkyDungeonSendEvent("tickBuffs", {delta: delta});
	KinkyDungeonTickBuffs(KinkyDungeonPlayerEntity, delta, endFloor);
	for (let enemy of KDMapData.Entities) {
		if (!enemy.buffs) enemy.buffs = {};
		KinkyDungeonTickBuffs(enemy, delta, endFloor);
	}

	// Apply the buffs from bullets
	for (let b of KDMapData.Bullets) {
		if (b.bullet.spell && b.bullet.spell.buffs) { // Apply the buff
			for (let buff of b.bullet.spell.buffs) {

				if (buff.player && buff.range >= Math.sqrt((KinkyDungeonPlayerEntity.x - b.x) * (KinkyDungeonPlayerEntity.x - b.x) + (KinkyDungeonPlayerEntity.y - b.y) * (KinkyDungeonPlayerEntity.y - b.y))) {
					KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff);
				}
				if (buff.enemies) {
					let nearby = KDNearbyEnemies(b.x, b.y, buff.range);
					for (let enemy of nearby) {
						if ((KDHostile(enemy) || !buff.noAlly)
							&& (KDAllied(enemy) || !buff.onlyAlly)
							&& (!b.bullet.spell.filterTags || b.bullet.spell.filterTags.some((tag: string) => {return enemy.Enemy.tags[tag];}))
							//&& buff.range >= Math.sqrt((enemy.x - b.x) * (enemy.x - b.x) + (enemy.y - b.y) * (enemy.y - b.y))
						) {
							KinkyDungeonApplyBuffToEntity(enemy, buff);
						}
					}

				}
			}
		}
	}

	KDUpdatePlayerShield();
}

function KDUpdatePlayerShield(PlayerBuffs?: any): void {
	if (!PlayerBuffs) PlayerBuffs = KinkyDungeonPlayerBuffs;
	let buffs = Object.values(PlayerBuffs);//Object.values(KinkyDungeonPlayerBuffs).sort((a, b) => {return (a.power || 0) - (b.power || 0);});
	KDGameData.Shield = 0;

	for (const bb of buffs) {
		const b: any = bb;
		if (b.type == "Shield" && b.power > 0)
			KDGameData.Shield += b.power;
	}
}


function KDDamagePlayerShield(Amount: number, Player: entity) {
	if (!Player) Player = KinkyDungeonPlayerEntity;
	let PlayerBuffs = KinkyDungeonPlayerBuffs;
	let buffs = Object.values(PlayerBuffs).filter((b) => {return b.type == "Shield";}).sort((a, b) => {return (a.power || 0) - (b.power || 0);});

	KDGameData.ShieldDamage = (KDGameData.ShieldDamage || 0) + Amount;

	for (let b of buffs) {
		if (b.type == "Shield" && b.power > 0) {
			b.power -= Amount;
			if (b.power < 0) {
				Amount = -b.power;
				b.power = 0;
			}
		}
	}

	KDUpdatePlayerShield(PlayerBuffs);
}

function KDBuffEnabled(list: Record<string, any>, buff: any, onlyPositiveDuration: boolean) {
	return (!onlyPositiveDuration || buff.duration > 0)
		&& (!buff.disabletypes || !buff.disabletypes.some((tag: string) => {
			return list[tag] != undefined;
		}));
}

function KinkyDungeonGetBuffedStat(list: Record<string, any>, Stat: any, onlyPositiveDuration?: boolean): number {
	let stat = 0;
	if (list)
		for (let buff of Object.values(list)) {
			if (buff && buff.type == Stat
				&& KDBuffEnabled(list, buff, onlyPositiveDuration)) {
				stat += buff.power;
			}
		}
	return stat;
}
function KinkyDungeonGetMaxBuffedStat(list: Record<string, any>, Stat: any, onlyPositiveDuration: boolean): number {
	let stat = 0;
	if (list)
		for (let buff of Object.values(list)) {
			if (buff && buff.type == Stat && KDBuffEnabled(list, buff, onlyPositiveDuration)) {
				stat = Math.max(stat, buff.power);
			}
		}
	return stat;
}

/**
 * @param entity
 * @param key
 */
function KinkyDungeonExpireBuff(entity: entity, key: string): void {
	let list = null;
	if (entity == KinkyDungeonPlayerEntity)
		list = KinkyDungeonPlayerBuffs;
	else if (entity.buffs) list = entity.buffs;
	if (list && list[key]) {
		let data = {
			entity: entity,
			buff: list[key],
		};
		KinkyDungeonSendEvent("expireBuff", data);
		delete list[key];
	}
}

/**
 * @param entity
 * @param origbuff
 * @param [changes]
 */
function KinkyDungeonApplyBuffToEntity(entity: entity, origbuff: any, changes?: any) {
	if (entity && entity.player) {
		return KDApplyBuff(KinkyDungeonPlayerBuffs, origbuff, changes, entity);
	} else if (entity) {
		if (!entity.buffs) entity.buffs = {};
		return KDApplyBuff(entity.buffs, origbuff, changes, entity);
	}
	return null;
}

function KDApplyBuff(list: Record<string, any>, origbuff: any, changes: any, entity: entity): any {
	if (!origbuff) return null;
	let buff: any = {};
	Object.assign(buff, origbuff);
	if (changes)
		Object.assign(buff, changes);
	let id = buff.id ? buff.id : buff.name;

	if (list[id] && buff.cancelOnReapply) {
		KinkyDungeonExpireBuff(entity, id);
		return null;
	} else {
		if (!list[id] && buff.sfxApply) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + buff.sfxApply + ".ogg");
		if (!list[id] || (list[id].power >= 0 && buff.power >= list[id].power) || (list[id].power < 0 && ((buff.power > 0 && buff.power >= list[id].power) || buff.power <= list[id].power))) list[id] = buff;
		if ((list[id].power && buff.power == list[id].power && buff.duration >= list[id].duration)) list[id].duration = buff.duration;

		if (buff.tags)
			for (let tag of buff.tags) {
				if (tag == "darkness" && list == KinkyDungeonPlayerBuffs) {
					KinkyDungeonBlindLevelBase = Math.max(KinkyDungeonBlindLevelBase, 1);
				} else if (tag == "heavydarkness" && list == KinkyDungeonPlayerBuffs) {
					KinkyDungeonBlindLevelBase = Math.max(KinkyDungeonBlindLevelBase, 2);
				}
			}
		return buff;
	}
}

function KinkyDungeonGetbuff(list: Record<string, any>, Buff: string): any {
	if (list && list[Buff]) return list[Buff];
	else return null;
}

function KinkyDungeonHasBuff(list: Record<string, any>, Buff: string, excludeNoDuration?: boolean): boolean {
	if (list && list[Buff] && (!excludeNoDuration || list[Buff].duration > 0)) return true;
	else return false;
}

/**
 * @param entity
 * @param buff
 * @param [excludeNoDuration]
 */
function KDEntityHasBuff(entity: entity, buff: string, excludeNoDuration: boolean = false): boolean {
	if (entity.player) {
		return KinkyDungeonHasBuff(KinkyDungeonPlayerBuffs, buff, excludeNoDuration);
	} else return KinkyDungeonHasBuff(entity.buffs, buff, excludeNoDuration);
}

/**
 * @param entity
 * @param stat
 * @param [onlyPositiveDuration]
 */
function KDEntityBuffedStat(entity: entity, stat: string, onlyPositiveDuration?: boolean): number {
	if (!entity) return 0;
	if (entity.player) {
		return KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat, onlyPositiveDuration);
	} else return KinkyDungeonGetBuffedStat(entity.buffs, stat, onlyPositiveDuration);
}

/**
 * @param entity
 * @param stat
 * @param [onlyPositiveDuration]
 */
function KDEntityMaxBuffedStat(entity: entity, stat: string, onlyPositiveDuration?: boolean): number {
	if (entity.player) {
		return KinkyDungeonGetMaxBuffedStat(KinkyDungeonPlayerBuffs, stat, onlyPositiveDuration);
	} else return KinkyDungeonGetMaxBuffedStat(entity.buffs, stat, onlyPositiveDuration);
}

/**
 * @param entity
 */
function KDEntityGetBuff(entity: entity, buff: string): any {
	if (entity.player) {
		return KinkyDungeonGetbuff(KinkyDungeonPlayerBuffs, buff);
	} else return KinkyDungeonGetbuff(entity.buffs, buff);
}
