"use strict";

let bosses = {
	"Fuuka": {
		boss: "Fuuka",
		bossroom: true,
		width: 13,
		height: 13,
		setpieces: {
			"GuaranteedCell": 1000,
			"FuukaAltar": 1000,
		},
		genType: "Chamber",
		spawns: false,
		chests: false,
		shrines: true,
		chargers: true,
		torches: true,
		heart: false,
		specialtiles: true,
		shortcut: false,
		enemies: false,
		nokeys: true,
		nojail: false,
	},

	"Dollmaker": {
		boss: "Dollmaker",
		bossroom: true,
		jailType: "dollsmith",
		guardType: "dollsmith",
		width: 21,
		height: 21,
		setpieces: {
		},
		genType: "Dollmaker",
		spawns: false,
		chests: false,
		shrines: false,
		noWear: true,
		chargers: false,
		notorches: true,
		heart: false,
		specialtiles: true,
		shortcut: false,
		enemies: false,
		nokeys: true,
		nojail: true,
		noClutter: true,
		nostairs: true,
		nostartstairs: true,
		nobrick: true,
		nolore: true,
		skin: 'bel',
		noboring: true, // Skip generating boringness
	},
};

function KinkyDungeonBossFloor(Floor) {
	if (Floor == 4) return bosses.Fuuka;
	if (Floor == 20) return bosses.Dollmaker;
	return null;
}