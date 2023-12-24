"use strict";

// Outfit resource, uncached
let KinkyDungeonOutfitsBase = [
	{name: "OutfitDefault", dress: "Default", shop: false, rarity: 1,},// To avoid breaking saves
	{name: "Default", dress: "Default", shop: false, rarity: 1},
	{name: "JailUniform", dress: "JailUniform", shop: false, rarity: 1, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 1.2},
			{type: "damageResist", trigger: 'tick', damage: "tickle", power: -0.1},
			{type: "damageResist", trigger: 'tick', damage: "grope", power: -0.1},
		],
	},
	{name: "Bast", dress: "Bast", shop: false, rarity: 1, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Bast"},
			{type: "damageResist", trigger: 'tick', damage: "tickle", power: -0.2},
			{type: "damageResist", trigger: 'tick', damage: "grope", power: -0.2},
		],
	},
	{name: "Bountyhunter", dress: "Bountyhunter", shop: false, rarity: 1,
		events: [
			{trigger: "tick", type: "sneakBuff", power: 0.1},
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Bountyhunter"},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: 0.2},
			{type: "damageResist", trigger: 'tick', damage: "ice", power: -0.2},
		],},
	{name: "Bikini", dress: "Bikini", shop: false, rarity: 1, 
		events: [
			{type: "damageResist", trigger: 'tick', damage: "ice", power: -0.2},
			{type: "damageResist", trigger: 'tick', damage: "tickle", power: -0.2},
			{type: "damageResist", trigger: 'tick', damage: "grope", power: -0.2},
			{type: "damageResist", trigger: 'tick', damage: "acid", power: 0.3},
		],},
	{name: "Maid", dress: "Maid", shop: false, rarity: 2, 
		events: [
			{trigger: "calcEvasion", type: "AccuracyBuff", requiredTag: "mold", power: 10.0},
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Maidforce"},
		],},
	{name: "Dragon", dress: "Dragon", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Dragon"},
			{type: "damageResist", trigger: 'tick', damage: "fire", power: 0.2},
		],},
	{name: "Elven", dress: "Elven", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Elf"},
			{type: "damageResist", trigger: 'tick', damage: "tickle", power: -0.2},
			{type: "damageResist", trigger: 'tick', damage: "grope", power: -0.2},
		],},
	{name: "Wolfgirl", dress: "Wolfgirl", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Nevermere"},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: 0.2},
		],},
	{name: "CyberDoll", dress: "CyberDoll", shop: false, rarity: 3, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "AncientRobot"},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: 0.2},
		],},
	{name: "BlueSuitPrison", dress: "BlueSuitPrison", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Alchemist"},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: 0.2},
		],},
	{name: "DollSuit", dress: "DollSuit", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Dollsmith"},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: 0.2},
		],},
	{name: "BlueSuit", dress: "BlueSuit", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Alchemist"},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: 0.2},
		],},
	{name: "Obsidian", dress: "Obsidian", shop: false, rarity: 2, 
		events: [
			{type: "FactionStealth", trigger: 'calcSneak', mult: 0.9, kind: "Elemental"},
			{type: "damageResist", trigger: 'tick', damage: "soul", power: -0.3},
			{type: "damageResist", trigger: 'tick', damage: "fire", power: .1},
			{type: "damageResist", trigger: 'tick', damage: "ice", power: .1},
			{type: "damageResist", trigger: 'tick', damage: "acid", power: .1},
			{type: "damageResist", trigger: 'tick', damage: "crush", power: .1},
			{type: "damageResist", trigger: 'tick', damage: "electric", power: .1},
			{type: "damageResist", trigger: 'tick', damage: "stun", power: .1},
		],},
];

/**
 * List off all dresses items
 * @type {Record<string,KinkyDungeonDress>}
 */
let KinkyDungeonDresses = {
	"Default" : KinkyDungeonDefaultDefaultDress,
	"Prisoner" : [
		{Item: "SleevelessCatsuit", Group: "Suit", Color: "#8A120C", Lost: false},
		{Item: "CatsuitPanties", Group: "SuitLower", Color: "#8A120C", Lost: false},
		{Item: "Heels1", Group: "Shoes", Color: "#8A120C", Lost: false},
		{Item: "Socks4", Group: "Socks", Color: "#222222", Lost: false},
	],
	"GreenLeotard" : [
		{Item: "SleevelessCatsuit", Group: "Suit", Color: "#267237", Lost: false},
		{Item: "CatsuitPanties", Group: "SuitLower", Color: "#267237", Lost: false},
	],
	"Leotard" : [
		{Item: "SleevelessCatsuit", Group: "Suit", Color: "#53428D", Lost: false},
		{Item: "CatsuitPanties", Group: "SuitLower", Color: "#53428D", Lost: false},
	],
	"Bikini" : [
		{Item: "KittyPanties1", Group: "Panties", Color: "#050505", Lost: false},
		{Item: "FullLatexBra", Group: "Bra", Color: "Default", Lost: false},
	],
	"Lingerie" : [
		{Item: "LaceBabydoll", Group: "Cloth", Color: "Default", Lost: false},
		{Item: "Bandeau1", Group: "Bra", Color: "Default", Lost: false},
		{Item: "FloralPanties2", Group: "Panties", Color: ['#303030', '#F0F0F0'], Lost: false},
	],
	"LatexPrisoner" : [
		{Item: "LatexPanties2", Group: "Panties", Color: "Default", Lost: false},
		{Item: "LatexCorset1", Group: "Corset", Color: "Default", Lost: false},
		{Item: "FullLatexBra", Group: "Bra", Color: "Default", Lost: false},
		{Item: "Heels1", Group: "Shoes", Color: "#222222", Lost: false},
		{Item: "LatexSocks1", Group: "Socks", Color: "Default", Lost: false},
	],
	"Dungeon" : [
		{Item: "Bandeau1", Group: "Bra", Color: "Default", Lost: false},
		{Item: "Pantyhose1", Group: "SuitLower", Color: "Default", Lost: false},
		{Item: "Corset5", Group: "Corset", Color: "#777777", Lost: false},
		{Item: "AnkleStrapShoes", Group: "Shoes", Color: "#2D2D2D", Lost: false},
		{Item: "FloralPanties2", Group: "Panties", Color: ['#303030', '#F0F0F0'], Lost: false},
	],
	"Bast" : [
		{Item: "Sarashi1", Group: "Bra", Color: "Default", Lost: false},
		{Item: "Panties7", Group: "Panties", Color: "#ffffff", Lost: false},
		{Item: "Sandals", Group: "Shoes", Color: "Default", Lost: false},
		{Item: "FaceVeil", Group: "Mask", Color: "#ffffff", Lost: false},
		{Item: "HaremPants", Group: "ClothLower", Color: "Default", OverridePriority: 28, Lost: false},
	],
	"Dragon" : [
		{Item: "Sarashi1", Group: "Bra", Color: "#444444", Lost: false},
		{Item: "SunstripePanties1", Group: "Panties", Color: "#EC1515", Lost: false},
		{Item: "LatexAnkleShoes", Group: "Shoes", Color: "#AC1818", Lost: false},
		{Item: "Corset4", Group: "Corset", Color: "#AC1818", Lost: false},
		{Item: "LatexTop", Group: "Cloth", Color: "#AC1818", Lost: false},
		{Item: "GarterBelt2", Group: "Garters", Color: "Default", Lost: false},
	],
	"SlimeSuit" : [
		{Item: "SeamlessCatsuit", Group: "Suit", Color: "#7F3C9B", Lost: false},
		{Item: "SeamlessCatsuit", Group: "SuitLower", Color: "#7F3C9B", Lost: false},
		{Item: "Catsuit", Group: "Gloves", Color: "#7F3C9B", Lost: false},
	],
	"ProtoSlimeSuit" : [
		{Item: "SeamlessCatsuit", Group: "Suit", Color: "#404973", Lost: false},
		{Item: "SeamlessCatsuit", Group: "SuitLower", Color: "#404973", Lost: false},
		{Item: "Catsuit", Group: "Gloves", Color: "#404973", Lost: false},
	],
	"BlueSuit" : [
		{Item: "SeamlessCatsuit", Group: "Suit", Color: "#3873C3", Lost: false},
		{Item: "SeamlessCatsuit", Group: "SuitLower", Color: "#3873C3", Lost: false},
		{Item: "Catsuit", Group: "Gloves", Color: "#3873C3", Lost: false},
	],
	"DollSuit" : [
		{Item: "SeamlessCatsuit", Group: "Suit", Color: "#840d26", Lost: false},
		{Item: "SeamlessCatsuit", Group: "SuitLower", Color: "#840d26", Lost: false},
		{Item: "Catsuit", Group: "Gloves", Color: "#840d26", Lost: false},
	],
	"Bountyhunter" : [
		{Item: "SeamlessCatsuit", Group: "Suit", Color: "#222222", Lost: false},
		{Item: "SeamlessCatsuit", Group: "SuitLower", Color: "#222222", Lost: false},
		{Item: "Catsuit", Group: "Gloves", Color: "#222222", Lost: false},
	],
	"BlueSuitPrison" : [
		{Item: "SeamlessCatsuit", Group: "Suit", Color: "#3873C3", Lost: false},
		{Item: "SeamlessCatsuit", Group: "SuitLower", Color: "#3873C3", Lost: false},
		{Item: "Catsuit", Group: "Gloves", Color: "#3873C3", Lost: false},
		{Item: "FaceVeil", Group: "Mask", Color: "#ffffff", Lost: false},
	],
	"Wolfgirl" : [
		{Item: "PilotSuit", Group: "Suit", Color: ['#828FA2', '#323332', '#223525', '#383838', 'Default'], Lost: false},
		{Item: "PilotPanties", Group: "SuitLower", Color: ['#828FA2', '#323332', '#223525'], Lost: false},
		{Item: "LatexSocks1", Group: "Socks", Color: "#AAAAAA", Lost: false},
	],
	"CyberDoll" : [
		{Item: "PilotSuit", Group: "Suit", Color: ['#7e1972', '#222222', '#555555', '#222222', 'Default'], Lost: false},
		{Item: "PilotSuit", Group: "SuitLower", Color: ['#7e1972', '#222222', '#555555'], Lost: false},
		{Item: "PilotSuitGloves", Group: "Gloves", Color: ['#7e1972', '#222222', '#555555'], Lost: false},
	],
	"Maid" : [
		{Item: "SleevelessCatsuit", Group: "Suit", Color: "#aaaaaa", Lost: false},
		{Item: "MaidApron2", Group: "Cloth", Color: "Default", Lost: false},
		{Item: "FullLatexBra2", Group: "Bra", Color: ["#333333", "#aaaaaa"], Lost: false},
		{Item: "Pantyhose2", Group: "SuitLower", Color: "#939393", Lost: false},
		{Item: "LaceBands", Group: "Bracelet", Color: ['Default', '#151515'], Lost: false},
		{Item: "MageSkirt", Group: "ClothLower", Color: ["#676767", "#2E2E2E"], Lost: false},
		{Item: "Corset4", Group: "Corset", Color: "#4B4B4B", Lost: false},
		{Item: "Band1", Group: "Hat", Color: "#767676", Lost: false},
		{Item: "Shoes5", Group: "Shoes", Color: "#575757", Lost: false},
		{Item: "Socks6", Group: "Socks", Color: ['#080808', 'Default'], Lost: false},
		{Item: "FloralPanties2", Group: "Panties", Color: ['#303030', '#F0F0F0'], Lost: false},
	],
	"Elven" : [
		{Item: "Swimsuit1", Group: "Bra", Color: ['#E2E2E2'], Lost: false, NoLose: true},
		{Item: "Corset4", Group: "Corset", Color: ['#FFFFFF'], Lost: false},
		{Item: "Stockings4", Group: "Socks", Color: "#000000", Lost: false},
		{Item: "FaceVeil", Group: "Mask", Color: "Default", Lost: false},
		{Item: "HairFlower1", Group: "HairAccessory3", Color: 'Default', Lost: false},
		{Item: "NecklaceKey", Group: "Necklace", Color: "Default", Lost: false},
		{Item: "MageSkirt", Group: "ClothLower", Color: ['#40824F', '#AF9225'], OverridePriority: 27, Lost: false},
		{Item: "Heels1", Group: "Shoes", Color: "#aaaaaa", Lost: false},
	],
	"Obsidian" : [
		{Item: "SleevelessSlimLatexLeotard", Group: "Suit", Color: ['#4964A5'], Lost: false, NoLose: true},
		{Item: "LatexCorset1", Group: "Corset", Color: ['#4869BD'], Lost: false},
		{Item: "Stockings3", Group: "Socks", Color: "Default", Lost: false},
		{Item: "LatexTop", Group: "Cloth", Color: "#1F175F", Lost: false},
		{Item: "CatsuitPanties", Group: "Panties", Color: '#4964A5', Lost: false},
		{Item: "FuturisticHeels2", Group: "Shoes", Color: ['#1F175F', '#FFFFFF', '#333333', '#333333', '#7A7979', '#aaaaaa'], Lost: false},
		{Item: "LatexSkirt2", Group: "ClothLower", Color: ['#2C4A95'], OverridePriority: 27, Lost: false},
	],
};




if (StandalonePatched) {
	KinkyDungeonDefaultDefaultDress = [{"Item":"BanditBoots","Group":"BanditBoots","Color":"#ffffff","Lost":false,"Filters":{"ShoeLeft":{"gamma":1.4000000000000001,"saturation":0.03333333333333333,"contrast":1.5833333333333333,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},"ShoeRight":{"gamma":1.4000000000000001,"saturation":0.03333333333333333,"contrast":1.5833333333333333,"brightness":1.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"WitchBlouse","Group":"WitchBlouse","Color":"#ffffff","Lost":false},{"Item":"WitchCorset","Group":"WitchCorset","Color":"#ffffff","Lost":false,"Filters":{"Corset":{"gamma":1.45,"saturation":0.4666666666666667,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"MaidSkirt","Group":"MaidSkirt","Color":"#ffffff","Lost":false,"Filters":{"Skirt":{"gamma":1,"saturation":0.23333333333333334,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.55,"alpha":1.0166666666666666}}},{"Item":"MaidSocks","Group":"MaidSocks","Color":"#ffffff","Lost":false,"Filters":{"SockRight":{"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},"SockLeft":{"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1}}},{"Item":"StrappyBikini","Group":"StrappyBikini","Color":"#ffffff","Lost":false},{"Item":"LatexBra","Group":"LatexBra","Color":"#ffffff","Lost":false}]

}