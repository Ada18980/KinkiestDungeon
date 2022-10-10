'use strict';

KinkyDungeonEnemies.push(
	{name: "AngrySkeleton", bound: "Skeleton", playLine: "Skeleton", hitsfx: "AngryHit", clusterWith: "skeleton", tags: KDMapInit(["leashing", "skeleton", "gagged", "melee", "ropeRestraints", "leatherRestraints", "clothRestraints", "coldresist", "crushweakness", "search"]), ignorechance: 0, armor: 0, followRange: 1, AI: "hunt",
		visionRadius: 4, maxhp: 5, minLevel:1, weight:8, movePoints: 2, attackPoints: 3, attack: "MeleeBind", attackWidth: 1, attackRange: 1, power: 1, dmgType: "grope", fullBoundBonus: 1.0,
		terrainTags: {"secondhalf":4, "increasingWeight":-0.5}, shrines: ["Leather"], floors:KDMapInit(["cat", "tmb"]), dropTable: [{name: "Gold", amountMin: 5, amountMax: 10, weight: 10}]},
);

addTextKey("NameAngrySkeleton",
	"Angry Skeleton");
addTextKey("KillAngrySkeleton",
	"The angry skeleton is very mad at you.");
addTextKey("AttackAngrySkeletonBind",
	"The angry skeleton ties you up! (+RestraintAdded)");
addTextKey("AttackAngrySkeleton",
	"The angry skeleton squeezes your body! (DamageDealt)");