"use strict";

/**
 * Determines if the enemy (which can be hostile) is aggressive, i.e. will pursue the player or ignore
 * @param [enemy]
 * @param [player]
 */
function KinkyDungeonAggressive(enemy?: entity, player?: entity): boolean {
	if (!player || player.player) {
		// Player mode
		if (enemy && enemy.hostile > 0) return true;
		if (!KDGameData.PrisonerState || KDGameData.PrisonerState == "chase") return KDHostile(enemy);
		if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.4) return KDHostile(enemy);
		if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.1
			&& KDGameData.PrisonerState != 'jail'
			&& (KDGameData.PrisonerState != 'parole' || !KinkyDungeonPlayerInCell(true, true)))
			return KDHostile(enemy);
		return false;
	}
	// Non player mode
	return KDHostile(enemy, player);
}

/**
 * Returns whether or not the enemy is ALLIED, i.e it will follow the player
 * @param enemy
 * @returns {boolean}
 */
function KDAllied(enemy: entity): boolean {
	return !(enemy.rage > 0) && !(enemy.hostile > 0) && KDFactionAllied("Player", enemy, undefined,
		KDOpinionRepMod(enemy, KDPlayer()));
}

/**
 * Returns whether the enemy is HOSTILE to the player (if no optional argument) or the optional enemy
 * @param enemy
 * @param [enemy2]
 */
function KDHostile(enemy: entity, enemy2?: entity): boolean {
	if (enemy == enemy2) return false;
	return (enemy.rage > 0) ||
		(
			!(!enemy2 && enemy.ceasefire > 0)
			&& !(enemy2 && enemy2.ceasefire > 0)
			&& (
				(!enemy2
					&& (KDFactionHostile("Player", enemy, KDOpinionRepMod(enemy, enemy2 || KDPlayer()))
					|| enemy.hostile > 0)
					|| (enemy2 && ((KDGetFaction(enemy2) == "Player" && enemy.hostile > 0)
					|| KDFactionHostile(KDGetFaction(enemy), enemy2, KDOpinionRepMod(enemy, enemy2 || KDPlayer())))))));
}

/**
 * @param enemy
 * @param player
 * @returns The modifier to reputation based on the NPC's opinion
 */
function KDOpinionRepMod(enemy: entity, player: entity): number {
	if (!player?.player) return 0;
	let op = KDGetModifiedOpinionID(enemy.id, true, true, true, 0);
	if (op) {
		return 0.1 * Math.max(-3, Math.min(20, op/KDOpinionThreshold));
	}
	return 0;
}

/**
 * @param value
 */
function KDIsServant(value: KDCollectionEntry): boolean {
	return value && value.status == "Servant";
}

/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param enemy
 */
function KDGetFaction(enemy: entity): string {
	if (!enemy) return undefined;
	if (enemy.player) return "Player";
	if (enemy.rage > 0) return "Rage";
	if (enemy.faction) return enemy.faction;
	if (KDGameData.Collection && KDIsServant(KDGameData.Collection[enemy.id + ""])) return "Player";
	let E = enemy.Enemy;
	if ((E && E.allied)
		|| enemy.allied
		|| KDIsInParty(enemy))
		return "Player";
	if (E && E.faction) return E.faction;
	return "Enemy";
}

/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param enemy
 */
function KDGetFactionOriginal(enemy: entity): string {
	if (enemy.player) return "Player";
	if (enemy.faction) return enemy.faction;
	if (KDGameData.Collection && KDIsServant(KDGameData.Collection[enemy.id + ""])) return "Player";
	let E = enemy.Enemy;
	if (E && E.faction) return E.faction;
	return "Enemy";
}

/**
 * Consults the faction table and decides if the two mentioned factions are hostile
 * @param a - Faction 1
 * @param b - Faction 2
 * @param [mod] - modifier to faction rep - constrained to positive
 * @param [modfree] - modifier to faction rep - free
 */
function KDFactionHostile(a: string, b: string | entity, mod: number = 0, modfree: number = 0): boolean {
	if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0) return true;
	if (!(typeof b === "string") && b.rage > 0) return true;
	if (a == "Player" && !(typeof b === "string") && b.allied > 0) return false;
	if (!(typeof b === "string")) b = KDGetFaction(b);
	if (a == "Rage" || b == "Rage") return true;
	if (a == "Player" && b == "Enemy") return true;
	if (b == "Player" && a == "Enemy") return true;
	if (KDFactionRelation(a, b) + Math.max(0, mod) + modfree <= -0.5) return true;
	if (a == b) return false;
	return false;
}

/**
 * Consults the faction table and decides if the two mentioned factions are allied
 * @param a - Faction 1
 * @param b - Faction 2
 * @param [threshold] - Faction 2
 * @param [mod]
 */
function KDFactionAllied(a: string, b: string | entity, threshold: number = 0.7, _mod: number = 0): boolean {
	if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0) return false;
	if (!(typeof b === "string") && b.rage > 0) return false;
	if (a == "Player" && !(typeof b === "string") && b.allied > 0) return true;
	if (!(typeof b === "string")) b = KDGetFaction(b);
	if (a == "Rage" || b == "Rage") return false;
	if (a == "Player" && b == "Player") return true;
	if (b == "Enemy" && a == "Enemy") return true;
	if (KDFactionRelation(a, !(typeof b === "string") ? KDGetFaction(b) : b) >= threshold) return true;
	if (a == b) return true;
	return false;
}

/**
 * Consults the faction table and decides if the two mentioned factions are favorable (i.e no friendly fire)
 * @param a - Faction 1
 * @param b - Faction 2
 */
function KDFactionFavorable(a: string, b: string | entity): boolean {
	return KDFactionAllied(a, b, 0.099);
}


/**
 * @param list
 * @param Floor
 * @param Checkpoint
 * @param tags
 * @param bonustags
 * @param [X]
 * @param [Y]
 */
function KDGetFactionProps(list: string[], Floor: number, Checkpoint: string, tags: string[], bonustags: Record<string, {bonus: number, mult: number}>, X: number = 0, Y: number = 0): Record<string, number> {
	let mp: Record<string, number> = {};
	for (let faction of list) {
		if (KDFactionProperties[faction]) {
			mp[faction] = KDFactionProperties[faction].weight(Floor, Checkpoint, tags, bonustags, X, Y);
		}
	}
	return mp;
}

/**
 * Gets the honor from faction a toward faction b
 * @param a
 * @param b
 */
function KDGetHonor(a: string, b: string): number {
	if (KDFactionProperties[a]) {
		if (KDFactionProperties[a].honor_specific[b]) {
			return KDFactionProperties[a].honor_specific[b];
		}
		return KDFactionProperties[a].honor;
	}
	return -1;
}
