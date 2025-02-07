// Leashconditions are to prevent stuff like bosses from trying to leash you immediately

interface LeashCondition {
	check: (enemy: entity, player: entity) => boolean,
}
let KDLeashConditions: Record<string, LeashCondition> = {
	dollmakerLeash: {
		check: (enemy, player) => {
			return !!KinkyDungeonFlags.get("BossUnlocked");
		}
	},
	wardenLeash: {
		check: (enemy, player) => {
			return !!KinkyDungeonFlags.get("BossUnlocked");
		}
	},
	fuukaLeash: {
		check: (enemy, player) => {
			return !!KinkyDungeonFlags.get("BossUnlocked");
		}
	},
}