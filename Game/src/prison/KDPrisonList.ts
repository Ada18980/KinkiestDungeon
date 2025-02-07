'use strict';

let KDCYBERPOWER = 19;
let KDJAILPOWER = 12;
let KDPRISONGROUPS = [
	[
		"ItemHead",
		"ItemEars",
	],
	[
		"ItemMouth",
	],
	[
		"ItemNeck",
	],
	[
		"ItemArms",
		"ItemHands",
	],
	[
		"ItemTorso",
		"ItemBreast",
		"ItemPelvis",
	],
	[
		"ItemNipples",
		"ItemVulva",
		"ItemButt",
		"ItemVulvaPiercings",
	],
	[
		"ItemLegs",
		"ItemFeet",
		"ItemBoots",
	],
	[
		"ItemDevices",
	],
];

/**
 */
let KDPrisonTypes: Record<string, KDPrisonType> = {
	Summit: {
		name: "Summit",
		default_state: "BusinessAsUsual",
		starting_state: "BusinessAsUsual",
		update: (delta) => {
			KinkyDungeonSetFlag("noPlay", 12);
			let player = KDPlayer();

			if (player.x == 18 && player.y == 20 && KinkyDungeonGetRestraintItem("ItemDevices")) {
				if (KDRandom() < 0.2 && !KinkyDungeonEntityAt(18, 21)) {
					KinkyDungeonSendTextMessage(10, TextGet("KDSummitSafeguard"), "#88ff88", 10);
					KDMovePlayer(18, 21, false);
				}
			}

			// Escapees
			for (let entity of KDMapData.Entities) {
				if (!KDHelpless(entity) && !KDIsHopeless(entity)
					&& KDGameData.Collection[entity.id + ""]?.escaped) {
						if (KDistChebyshev(entity.x - 11, entity.y - 21) > 0.5) {
							entity.gx = 11;
							entity.gy = 21;
							entity.gxx = 11;
							entity.gyy = 21;
						} else {
							// Despawn and remove from collection
							KDNPCEscape(entity);
						}
				}
			}
		},
		states: {
			BusinessAsUsual: {name: "BusinessAsUsual",
				init: (params) => {

					return "";
				},
				update: (delta) => {
					let player = KinkyDungeonPlayerEntity;
					return "BusinessAsUsual";
				},
			},
			Rebel: {name: "Rebel",
				init: (params) => {
					return "";
				},
				update: (delta) => {
					return "BusinessAsUsual";
				},
				updateStack: (delta) => {
					KinkyDungeonSetFlag("noPlay", 10);
				},
			},

		},
	},
};

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDLostJailTrack(player) {
	let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
	let rad = 4;
	if (label && KDistChebyshev(player.x - label.x, player.y - label.y) < rad) return "InTraining";
	if (KinkyDungeonPlayerTags.get("Furniture")) return "Furniture";
	if (!KinkyDungeonLeashingEnemy()) {
		let unaware = true;
		for (let en of KDMapData.Entities) {
			if (en.aware && KDGetFaction(en) == "Enemy" && !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) ) {
				unaware = false;
			}
		}
		if (unaware) {
			// We dont do anything
			return "Unaware";
		}
	}
	return "";
}

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDLostJailTrackCell(player) {
	let label = KDMapData.Labels?.Training ? KDMapData.Labels.Training[0] : null;
	let rad = 4;
	if (label && KDistChebyshev(player.x - label.x, player.y - label.y) < rad) return "InTraining";
	if (KinkyDungeonInJail(KDJailFilters)) return "InCell";
	if (KinkyDungeonPlayerTags.get("Furniture")) return "Furniture";
	if (!KinkyDungeonLeashingEnemy()) {
		let unaware = true;
		for (let en of KDMapData.Entities) {
			if (en.aware && KDGetFaction(en) == "Enemy" && !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) ) {
				unaware = false;
			}
		}
		if (unaware) {
			// We dont do anything
			return "Unaware";
		}
	}
	return "";
}




function KDGetJailEnemy() {
	// Jail tag
	let jt = KDMapData.JailFaction?.length > 0
	? KinkyDungeonFactionJailTag[
		KDMapData.JailFaction[Math.floor(KDRandom() * KDMapData.JailFaction.length)]
	] : "jailer";
	let Enemy = KinkyDungeonGetEnemy(["jailGuard", jt],
		KDGetEffLevel(),
		(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
		'0', [jt, "jailer"], undefined, undefined,
		["gagged"]);
	if (!Enemy) {
		jt = KDMapData.JailFaction?.length > 0
		? KinkyDungeonFactionTag[
			KDMapData.JailFaction[Math.floor(KDRandom() * KDMapData.JailFaction.length)]
		] : "jailer";
		Enemy = KinkyDungeonGetEnemy(["jailGuard", jt],
			KDGetEffLevel(),
			(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
			'0', [jt, "jailer"], undefined, undefined,
			["gagged"]);
		if (!Enemy) {
			jt = "genericJailer";
			Enemy = KinkyDungeonGetEnemy(["jailGuard", jt],
				KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				'0', [jt, "jailer"]);
		}
	}
	return Enemy;
}