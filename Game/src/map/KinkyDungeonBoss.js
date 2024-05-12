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
		shrines: false,
		chargers: true,
		torches: true,
		heart: false,
		specialtiles: true,
		shortcut: false,
		enemies: false,
		nokeys: true,
		nojail: false,
		makeMain: true,
		noQuests: true,
		escapeMethod: "Boss",
		forceCheckpoint: "grv",
	},

	"Dollmaker": {
		boss: "Dollmaker",
		bossroom: true,
		jailType: "Dollsmith",
		guardType: "Dollsmith",
		width: 21,
		height: 21,
		setpieces: {
		},
		genType: "Dollmaker",
		musicParams: "Dollmaker",
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
		makeMain: true,
		noQuests: true,
		escapeMethod: "Boss",
		forceCheckpoint: "bel",
	},
	"TheWarden": {
		boss: "TheWarden",
		bossroom: true,
		jailType: "Warden",
		guardType: "Warden",
		width: 21,
		height: 21,
		setpieces: {
		},
		genType: "Warden",
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
		skin: 'cat',
		noboring: true, // Skip generating boringness
		makeMain: true,
		noQuests: true,
		escapeMethod: "Boss",
		forceCheckpoint: "cat",
	},
};

function KinkyDungeonBossFloor(Floor) {
	if (Floor == 4) return bosses.Fuuka;
	if (Floor == 8) return bosses.TheWarden;
	//if (Floor == 12) return bosses.SilverWitch;
	if (Floor == 20) return bosses.Dollmaker;
	//if (Floor == 20) return bosses.Rana;
	return null;
}