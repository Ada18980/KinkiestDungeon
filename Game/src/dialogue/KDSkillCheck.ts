enum KDSkillCheckType {
	Fitness = "Fitness",
	Agility = "Agility",
}

let KDSkillCheckTypes : Record<KDSkillCheckType, ((en: entity, player: entity, target: entity, diffMod: number) => number)> = {
	Fitness: (en: entity, player: entity, target: entity, diffMod: number) => {
		return 1 - 1 / Math.max(0.1, 1 + KDFitnessMult(player))
			+ KDEntityBuffedStat(player, "meleeDamageBuff")
			- diffMod;
	},
	Agility: (en: entity, player: entity, target: entity, diffMod: number) => {
		return 1 - 1 / Math.max(0.1, 1 + KDReflexMult(player))
			+ KDEntityBuffedStat(player, "Evasion")
			- diffMod
			+ (target ? 0.5 * KDGetSlowMult(target) : 0);
	},
};

function KDGetSkillCheck(en: entity, player: entity, target: entity, type: KDSkillCheckType, diffMod: number = 0): number {
	return KDSkillCheckTypes[type](en, player, target, diffMod);
}