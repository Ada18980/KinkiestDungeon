"use strict";

let KinkyDungeonBones = {

};

let KDPatronAdventurers = [
];

let KDPatronCustomEnemies = new Map([
	["Wolfgirl", [
		{name: "Sivasa", color: "#9c2a70", prisoner: false, free: true, customSprite: ""},
		{name: "Alexandra", color: "#6241e1", prisoner: true, free: true, customSprite: ""},
		{name: "Nekora", color: "#42a459", prisoner: true, free: true, customSprite: ""},
		{name: "Emeia", color: "#00A7FF", prisoner: true, free: true, customSprite: ""},
		{name: "Dana", color: "#4444ff", prisoner: true, free: true, customSprite: ""},
		{name: "Yami", color: "#88ff88", prisoner: true, free: true, customSprite: ""},
		{name: "Animi", color: "#ff9999", prisoner: true, free: false, customSprite: ""},
		{name: "Ladica", color: "#44ff44", prisoner: false, free: true, customSprite: ""},
	],
	],
	["WolfgirlPet", [
		{name: "Demetria", color: "#c9d4fd", prisoner: true, free: false, customSprite: ""},
		{name: "Arii", color: "#ff88ff", prisoner: true, free: true, customSprite: ""},
	],
	],
	["Nurse", [
		{name: "Rena", color: "#a452ff", prisoner: true, free: true, customSprite: ""},
		{name: "Str Nurse", color: "#ffffff", prisoner: false, free: true, customSprite: ""},
	],
	],
	["ElementalLatex", [
		{name: "Samsy", color: "#2f847f", prisoner: false, free: true, customSprite: ""},
	],
	],
	["Dragon", [
		{name: "Garss", color: "#ff8888", prisoner: true, free: false, customSprite: ""},
	],
	],
	["DragonLeaderDuelist", [
		{name: "Kaitlyn", color: "#ff5555", prisoner: true, free: true, customSprite: ""},
	],
	],
	["SlimeAdv", [
		{name: "Rena", color: "#C8C8FF", prisoner: true, free: true, customSprite: ""},
		{name: "Rappy The Toy", color: "#C759FF", prisoner: true, free: false, customSprite: ""},
	],
	],
	["SmallSlime", [
		{name: "TY", color: "#ff5555", prisoner: false, free: true, customSprite: ""},
	],
	],
	["WitchRope", [
		{name: "Kamikaze roper", color: "#ffae70", prisoner: true, free: false, customSprite: ""},
	],
	],
	["MaidforceStalker", [
		{name: "Chandra", color: "#340000", prisoner: true, free: true, customSprite: ""},
	],
	],
	["ApprenticeSlime", [
		{name: "Gabrielle", color: "#ffff00", prisoner: true, free: true, customSprite: ""},
	],
	],
	["Alchemist", [
		{name: "Morgan", color: "#6241e1", prisoner: true, free: true, customSprite: ""},
		{name: "Myth", color: "#22ffff", prisoner: false, free: true, customSprite: ""},
	],
	],
	["Dressmaker", [
		{name: "A Lazy Dressmaker", color: "#fad6ff", prisoner: true, free: true, customSprite: ""},
	],
	],
	["Maidforce", [
		{name: "Ester", color: "#97edca", prisoner: true, free: false, customSprite: ""},
		{name: "Rest", color: "#999999", prisoner: false, free: true, customSprite: ""},
		{name: "Rika Mercury", color: "#92e8e5", prisoner: true, free: false, customSprite: ""},
		{name: "Maidlinmo", color: "#ff5555", prisoner: true, free: true, customSprite: ""},
		{name: "April", color: "#4444ff", prisoner: true, free: true, customSprite: ""},
	],
	],
	["WitchFlame", [
		{name: "Myrtrice", color: "#d30000", prisoner: false, free: true, customSprite: "Myrtrice"},
	],
	],
	["BanditPet", [
		{name: "Liz", color: "#d480bb", prisoner: true, free: true, customSprite: ""},
		{name: "Jinxy", color: "#7d27a5", prisoner: true, free: true, customSprite: ""},
		{name: "Genna", color: "#42bfe8", prisoner: true, free: true, customSprite: ""},
	],
	],
	["ElfRanger", [
		{name: "Valeria", color: "#ebaaf4", prisoner: true, free: true, customSprite: ""},
	],
	],
	["Elf", [
		{name: "Ferahla", color: "#44ff44", prisoner: true, free: true, customSprite: ""},
	],
	],
	["Dollsmith", [
		{name: "Kiera", color: "#310051", prisoner: false, free: true, customSprite: ""},
	],
	],
]);

/**
 *
 * @param {enemy} Enemy
 * @param {entity} e
 */
function KDProcessCustomPatron(Enemy, e) {
	if (KDPatronCustomEnemies.get(Enemy.name) && KDRandom() < 0.05) {
		let customs = KDPatronCustomEnemies.get(Enemy.name).filter((element) => {
			return (element.prisoner && Enemy.specialdialogue && Enemy.specialdialogue.includes("Prisoner")) || (element.free && !Enemy.specialdialogue);
		});
		if (customs.length > 0) {
			let custom = customs[Math.floor(customs.length * KDRandom())];
			e.CustomName = custom.name;
			e.CustomNameColor = custom.color;
			e.CustomSprite = custom.customSprite;
		}
	}
}