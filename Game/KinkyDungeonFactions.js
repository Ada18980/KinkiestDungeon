"use strict";

/**
 * Determines if the enemy (which can be hostile) is aggressive, i.e. will pursue the player or ignore
 * @param {entity} [enemy]
 * @returns {boolean}
 */
function KinkyDungeonAggressive(enemy) {
	if (enemy && enemy.hostile > 0) return true;
	if (!KDGameData.PrisonerState || KDGameData.PrisonerState == "chase") return KDHostile(enemy);
	if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.4) return KDHostile(enemy);
	if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.1 && KDGameData.PrisonerState != 'jail' && (KDGameData.PrisonerState != 'parole' || !KinkyDungeonPlayerInCell(true, true))) return KDHostile(enemy);
	return false;
}

/**
 * Returns whether or not the enemy is ALLIED, i.e it will follow the player
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDAllied(enemy) {
	return !(enemy.rage > 0) && !(enemy.hostile > 0) && KDFactionAllied("Player", enemy);
}

/**
 * Returns whether the enemy is HOSTILE to the player (if no optional argument) or the optional enemy
 * @param {entity} enemy
 * @param {entity} [enemy2]
 * @returns {boolean}
 */
function KDHostile(enemy, enemy2) {
	if (enemy == enemy2) return false;
	return (enemy.rage > 0) ||
		(
			!(!enemy2 && enemy.ceasefire > 0)
			&& (
				(!enemy2
					&& (KDFactionHostile("Player", enemy) || enemy.hostile > 0)
					|| (enemy2 && ((KDGetFaction(enemy2) == "Player" && enemy.hostile > 0) || KDFactionHostile(KDGetFaction(enemy), enemy2))))));
}

/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetFaction(enemy) {
	if (!enemy) return undefined;
	if (enemy.player) return "Player";
	let E = enemy.Enemy;
	if (enemy.rage > 0) return "Rage";
	if (enemy.faction) return enemy.faction;
	if ((E && E.allied) || ((enemy.allied || (E && E.faction && KDFactionAllied("Player", E.faction) && !KDEnemyHasFlag(enemy, "NoFollow"))) && !enemy.faction && !KDEnemyHasFlag(enemy, "Shop"))) return "Player";
	if (E && E.faction) return E.faction;
	return "Enemy";
}

/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetFactionOriginal(enemy) {
	let E = enemy.Enemy;
	if (enemy.faction) return enemy.faction;
	if (E && E.faction) return E.faction;
	return "Enemy";
}

/**
 * Consults the faction table and decides if the two mentioned factions are hostile
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @returns {boolean}
 */
function KDFactionHostile(a, b) {
	if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0) return true;
	if (!(typeof b === "string") && b.rage > 0) return true;
	if (a == "Player" && !(typeof b === "string") && b.allied > 0) return false;
	if (!(typeof b === "string")) b = KDGetFaction(b);
	if (a == "Rage" || b == "Rage") return true;
	if (a == "Player" && b == "Enemy") return true;
	if (b == "Player" && a == "Enemy") return true;
	if (KDFactionRelation(a, b) <= -0.5) return true;
	if (a == b) return false;
	return false;
}

/**
 * Consults the faction table and decides if the two mentioned factions are allied
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @param {number} [threshold] - Faction 2
 * @returns {boolean}
 */
function KDFactionAllied(a, b, threshold = 0.7) {
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
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @returns {boolean}
 */
function KDFactionFavorable(a, b) {
	return KDFactionAllied(a, b, 0.099);
}

