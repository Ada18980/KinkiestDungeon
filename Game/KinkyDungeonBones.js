"use strict";

let KinkyDungeonBones = {

};

let KDPatronAdventurers = [
];

let KDPatronCustomEnemies = new Map([
	["Wolfgirl", [
		{name: "Miny", color: "#9c2a70", prisoner: false, free: true, customPlayLine: "", customIntro: "You should join my pack!", customSprite: ""},
		{name: "Sivasa", color: "#8888ff", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Alexandra", color: "#6241e1", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Nekora", color: "#42a459", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Emeia", color: "#00A7FF", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Dana", color: "#4444ff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Yami", color: "#88ff88", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Animi", color: "#ff9999", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Ladica", color: "#44ff44", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "FlameTail", color: "#ff5555", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Nobu", color: "#00FFFF", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "NobIngridu", color: "#4EB85D", prisoner: false, free: true, customPlayLine: "", customIntro: "Hey hey people, it's ya girl, Ingrid!", customSprite: ""},
		{name: "Moranql", color: "#ff5555", prisoner: true, free: false, customPlayLine: "", customIntro: "0x0", customSprite: ""},
		{name: "Harumi", color: "#F223D4", prisoner: true, free: true, customPlayLine: "", customIntro: "This is an uncivilized place, I have some things to give you...", customSprite: ""},
		{name: "Joelle", color: "#4f60b8", prisoner: true, free: false, customPlayLine: "", customIntro: "Bork!", customSprite: ""},
	],
	],
	["WolfgirlPet", [
		{name: "Demetria", color: "#c9d4fd", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Arii", color: "#ff88ff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Aleiza", color: "#32d8ff", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Dana", color: "#000B77", prisoner: true, free: true, customPlayLine: "", customIntro: "*stands there... MENACINGLY*", customSprite: ""},
	],
	],
	["Nurse", [
		{name: "Rena", color: "#a452ff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Str Nurse", color: "#ffffff", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Fableite", color: "#999999", prisoner: false, free: true, customPlayLine: "", customIntro: "Care for an Examination?", customSprite: ""},
	],
	],
	["ElementalLatex", [
		{name: "Samsy", color: "#2f847f", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Dragon", [
		{name: "Garss", color: "#ff8888", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Conjurer", [
		{name: "Stela", color: "#9c2767", prisoner: false, free: true, customPlayLine: "Selly", customIntro: "I am Stela. But to you, sweetie? Call me Mistress.", customSprite: "Selly",
			pets: {
				"Frog": [
					{name: "Parov", color: "#781d4f", prisoner: false, free: true, customPlayLine: "", customIntro: "Glorp glorpy glorp.", customSprite: "Parov"},
				]
			},
		},
		{name: "Sariel", color: "#aa88ff", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: "",
			pets: {
				"Frog": [
					{name: "Fred", color: "#88ff88", prisoner: false, free: true, customPlayLine: "", customIntro: "Glorp glorpy glorp.", customSprite: ""},
				]
			},
		},
		{name: "Warren Rabbit", color: "#8888ff", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: "",
			pets: {
				"Frog": [
					{name: "Fred", color: "#8888ff", prisoner: false, free: true, customPlayLine: "", customIntro: "Glorp glorpy glorp.", customSprite: ""},
				]
			},
		},
		{name: "Kathy", color: "#aaff88", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: "",
			pets: {
				"Frog": [
					{name: "Fred", color: "#88ff88", prisoner: false, free: true, customPlayLine: "", customIntro: "Glorp glorpy glorp.", customSprite: ""},
				]
			},
		},
		{name: "Luna", color: "#ffaa88", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: "",
			pets: {
				"Frog": [
					{name: "Fred", color: "#88ff88", prisoner: false, free: true, customPlayLine: "", customIntro: "Glorp glorpy glorp.", customSprite: ""},
				]
			},
		},
	],
	],
	["DragonShadow", [
		{name: "Gwen", color: "#7b43ef", prisoner: false, free: true, customPlayLine: "DragonShadowGwen", customIntro: "", customSprite: ""},
	],
	],
	["Adventurer_Brat_Fighter", [
		{name: "Rook", color: "#ff5555", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: "Rook"},
	],
	],
	["DragonLeaderDuelist", [
		{name: "Kaitlyn", color: "#ff5555", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["NinjaStalker", [
		{name: "Alisa", color: "#575699", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: "Alisa"},
	],
	],
	["Ninja", [
		{name: "Alisa", color: "#575699", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: "Alisa"},
		{name: "Rizo", color: "#ff5555", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: "Alisa"},
		{name: "Rizo", color: "#ff5555", prisoner: true, free: true, customPlayLine: "", customIntro: "Another day, another hunt.", customSprite: "Alisa"},
	],
	],
	["SlimeAdv", [
		{name: "Rena", color: "#C8C8FF", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Rappy The Toy", color: "#C759FF", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Yolana", color: "#92e8c0", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["SmallSlime", [
		{name: "TY", color: "#ff5555", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["WitchRope", [
		{name: "Kamikaze roper", color: "#ffae70", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Lami", color: "#7d1dff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["MaidforceStalker", [
		{name: "Chandra", color: "#340000", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["ApprenticeSlime", [
		{name: "Gabrielle", color: "#ffff00", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Alchemist", [
		{name: "Morgan", color: "#6241e1", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Myth", color: "#22ffff", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Dressmaker", [
		{name: "A Lazy Dressmaker", color: "#fad6ff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Alice", color: "#ee99ee", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Maidforce", [
		{name: "Ester", color: "#97edca", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Rest", color: "#999999", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Rika Mercury", color: "#92e8e5", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Maidlinmo", color: "#ff5555", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "April", color: "#4444ff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Aika", color: "#be52e6", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Kiera", color: "#310051", prisoner: true, free: false, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Lam", color: "#ffff22", prisoner: true, free: true, customPlayLine: "", customIntro: "Lam, at your service!", customSprite: ""},
	],
	],
	["MaidforceHead", [
		{name: "FrostLunar", color: "#0055ff", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Marine", color: "#4477ff", prisoner: true, free: true, customPlayLine: "", customIntro: "Hi! I'm Marine Kelley. 'Miss Marine', to you.", customSprite: ""},
	],
	],
	["WitchFlame", [
		{name: "Myrtrice", color: "#d30000", prisoner: false, free: true, customPlayLine: "", customIntro: "All creatures are made to bow to me.", customSprite: "Myrtrice"},
	],
	],
	["WitchIce", [
		{name: "Verina", color: "#44ff66", prisoner: true, free: false, customPlayLine: "", customIntro: "Have you seen my girlfriend around here?", customSprite: ""},
	],
	],
	["WitchShock", [
		{name: "Persephone", color: "#ff8888", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["WitchEarth", [
		{name: "Persephone", color: "#ff8888", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["WitchSlime", [
		{name: "Kathy Narlato", color: "#4e3da9", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Claire", color: "#55ff55", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["WitchWater", [
		{name: "Marine", color: "#4fa4b8", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["ElementalEarth", [
		{name: "Entombment", color: "#ffae70", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["BanditPet", [
		{name: "Liz", color: "#d480bb", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Jinxy", color: "#7d27a5", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
		{name: "Genna", color: "#42bfe8", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["ElfRanger", [
		{name: "Valeria", color: "#ebaaf4", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Elf", [
		{name: "Ferahla", color: "#44ff44", prisoner: true, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
	["Dollsmith", [
		{name: "Kiera", color: "#310051", prisoner: false, free: true, customPlayLine: "", customIntro: "", customSprite: ""},
	],
	],
]);


let KDPatronsSpecial = {
	"Anonymous ": 2,
	"cyberjoel": 2,
	"finn ": 2,
	"Samantha Lear": 2,
	"Private ": 2,
	"Chet Vargas": 2,
	"Siegfried Kübler": 2,
	"Song": 2,
	"The-Fisher-King": 2,
	"Churro": 2,
	"Laioken ": 2,
	"Dex♪ ": 1,
	"Anthony Royle": 1,
	"Shogo ": 1,
	"Gamefan ": 1,
	"Blox ": 1,
	"Jerome Peterson": 1,
	"selly-grim ": 1,
	"Alexis Octavia": 1,
	"Noxgarm ": 1,
	"Slacker": 1,
	"Hellgete ": 1,
	"Flame ": 1,
	"WATA ": 1,
	"FrenzyFlame": 1,
	"Kieraakari ": 1,
	"Loudest_Quiet_Person": 1,
	"Rest": 1,
	"atetete ": 1,
	"Mechio ": 1,
	"Dazman1234 ": 1,
	"Thefabulousglaceon": 1,
	"Rika": 1,
	"0xA4C1B842": 1,
	"LukeB ": 1,
	"devan ": 1,
	"Physicsphail": 1,
	"Miro": 1,
	"Loony ": 1,
	"WhiteSniper": 1,
	"Thatguu": 1,
	"Somprad ": 1,
	"Geng114514 ": 1,
	"John  Toenniessen": 1,
	"Cat Hawke": 1,
	"Míša": 1,
	"RappyTheToy ": 1,
	"Diablo200": 1,
	"Cerb ": 1,
	"isaiah lewis": 1,
	"Mellenia": 1,
	"LordFabricator": 1,
	"Zero K": 1,
	"Dakra ": 1,
	"Victor ": 1,
	"damit damit": 1,
	"nnm711 ": 1,
	"Dragokahn": 1,
	"Meekohi": 1,
	"Phoenix ": 1,
	"zipidyzap ": 1,
	"Cera": 1,
	"CuvyanTaylor ": 1,
	"anton allison": 1,
	"Shrimpy ": 1,
	"Tatsuya Shiba": 1,
	"Snekus ": 1,
	"nuzzels": 1,
	"Minescence ": 1,
	"HanQing Zhao": 1,
	"James Kirkman": 1,
	"OTKTamashii ": 1,
	"darklink11 ": 1,
	"Hannes": 1,
	"Arentios ": 1,
	"Nymjii": 1,
	"Linex": 1,
	"Mister Mythe": 1,
	"CMDR Salen": 1,
	"bl ah": 1,
	"Salmon": 1,
	"Trinan": 1,
	"sqrt10pi": 1,
	"hopefast ": 1,
	"jeepk36": 1,
	"Shakymunch": 1,
	"Samsy": 1,
	"Pyros51 ": 1,
	"Aussie895": 1,
	"Hungvipbcsok": 1,
	"hideki hirose": 1,
	"Girador ": 1,
	"Traynfreek ": 1,
	"GRASS": 1,
	"Heavy Blues": 1,
	"Pyron ": 1,
	"Kritsanapong Jarutatpimol": 1,
	"Hanqing Zhao": 1,
	"Yagami Yami": 1,
	"Wossa ": 1,
	"FlameTail": 1,
	"火披薩 水": 1,
	"Sewdah nim": 1,
	"Crimson": 1,
	"X27": 1,
	"Nyarlato": 1,
	"Nightkin": 1,
	"Sylicix": 1,
	"Null Fame": 1,
	"AdventCirno ": 1,
	"Sera The Crocsune": 1,
	"Masaki Hara": 1,
	"Eric Rothman": 1,
	"영승 박": 1,
	"Claire Stephens": 1,
	"koch ": 1,
	"Joecoolzx": 1,
	"森 韩": 1,
	"ComradeArmtyom ": 1,
	"Hjake2 ": 1,
	"Chen yu": 1,
	"Sinohisaki": 1,
	"linlizheng ": 1,
	"john1304": 1,
	"Zora": 1,
	"suddys ": 1,
	"Robert Gomez": 1,
	"亦斌 陳": 1,
	"Feltenix": 1,
	"Aika ": 1,
	"sCaREaGle": 1,
	"Mike Salot": 1,
	"Roger Gamer": 1,
};

let KDPatrons = [
	"Anonymous",
	"cyberjoel",
	"朱文清",
	"Victoria Dudley",
	"Lowezar ",
	"Cailin Launt",
	"杨勇 杨",
	"Drup ",
	"Alvareonius",
	"John Crosby",
	"JamesWang ",
	"Bullethell ",
	"lushichuanshuo",
	"niwakaame ",
	"Leo Clio",
	"Meow327 ",
	"Wolfman ",
	"KTBDG ",
	"McBuglefiners76",
	"Regenald",
	"Smog47 ",
	"lugual-lupen",
	"Doidoxyz",
	"KombatWombat ",
	"fenceclimber",
	"Zhangwei ",
	"felipe escobar gomes",
	"ヌ ホ",
	"death14 ",
	"Hannichibi",
	"Hologram Knight",
	"Cicero Kingson ",
	"1 1",
	"Benneu",
	"Varo",
	"NoName2000",
	"Jonathan",
	"KrowMD",
	"Akacia",
	"リあЯЙКШЖДェロычゥクъ",
	"PlatiS ",
	"Mina",
	"Cameron Knowles",
	"ez06358 ",
	"goddislikem ",
	"Chris Barnes",
	"Kikaiman ",
	"Melody ",
	"家華 李",
	"霞晖灬 ",
	"siro0v0",
	"Swave ",
	"Renzo ",
	"芸 百合",
	"Reaganomics",
	"Abruptlee",
	"Johannes",
	"Ling",
	"Matatus Gratorus",
	"Jun S",
	"Mike Watts",
	"Wang5",
	"greatwulf",
	"Bababbak",
	"Goodcat",
	"禹天 吴",
	"Lucas Lampe",
	" 91林先生",
	"Sperv",
	"Reizi=Tigerfish",
	"Stars",
	"Cicero",
	"TotallyNotADuck ",
	"Salvador Melo",
	"kiriharuka",
	"Tony Johnson",
	"DeadMaster216 ",
	"Roy ",
	"panhua ",
	"suoluoke ",
	"八格野鹿",
	"伩 訒",
	"ank D",
	"car qin",
	"David J. Quandt",
	"FigelNarage ",
	"Nokona99",
	"yan yang",
	"CCCguda",
	"DeltaCoder",
	"FD Hou",
	"Carlos Esteve",
	"TheRemenant",
	"Noel",
	"omdik",
	"CLUBT ",
	"Michal Režný",
	"Jioshi ",
	"Rizomind",
	"Eric ",
	"Lami",
	"Spatchadoo ",
	"Fieldofbunnys",
	"Sigma",
	"Approver",
	"Gabriel",
	"Told King",
	"Logan Gartland",
	"Takuan5932",
	"Helba",
	"泫 叶",
	"luke hollywood",
	"Sean mcbride",
	"Hotohari ",
	"adamant_faith",
	"xinlin",
	"Jäger Wolf",
	"Kuroham ",
	"Pizzasgood ",
	"Uriahjs 01",
	"jiazhou liu",
	"晨 彭",
	"Ardmagar ",
	"OTO",
	"BlackSnowWolf",
	"moranql",
	"Zach",
	"Alan Arroyo",
	"卿熙 徐",
	"B.C. ",
	"Bastien Pierru",
	"花以寒 ",
	"BoneDaddyReaper",
	"Benedito Wang",
	"Paul .",
	"Yuichiro Szabo",
	"usndee ",
	"Mark ICT",
	"Mikhail Petrovic",
	"Arkus86",
	"Sydney Shackelford",
	"Claire",
	"Tyson Batten",
	"Ibford ",
	"ぱっち 嘘月",
	"Calum Wright",
	"Draco Redbolt",
	"Rangeronfire",
	"Frank Zhang",
	"yan meng",
	"Shenshi",
	"Robert Beardsley",
	"ShinFenix",
	"FrostLunar",
	"Travis Frazier",
	"RL_2728",
	"Salmon",
	"SaiZaro",
	"Trinan",
	"Roger Gamer",
	"Aika ",
	"CorruptNightmare",
	"James McI",
	"Rustfall",
	"Karel Novotný",
	"Lelel",
	"Mike Salot",
	"playjouer",
	"mebsu",
	"Knocksinna",
	"Lazulilly",
	"nubbs99 ",
	"Zora",
	"2561333707",
	"sCaREaGle",
	"PRAYMAY ",
	"sqrt10pi",
	"hopefast ",
	"Nightkin",
	"Nyarlato",
	"suddys",
];

/**
 *
 * @param {enemy} Enemy
 * @param {entity} e
 * @param {number} chanceBoost
 * @returns {any}
 */
function KDProcessCustomPatron(Enemy, e, chanceBoost) {
	let chance = 0.05 + (chanceBoost || 0); // Lower chance if 'subordinate'
	if (!e.CustomName && KDPatronCustomEnemies.get(Enemy.name) && KDRandom() < chance) {
		let customs = KDPatronCustomEnemies.get(Enemy.name).filter((element) => {
			return (element.prisoner && KDEnemyHasFlag(e, "imprisoned")) || (element.free && !KDEnemyHasFlag(e, "imprisoned"));
		});
		if (customs.length > 0) {
			let custom = customs[Math.floor(customs.length * KDRandom())];
			e.CustomName = custom.name;
			e.CustomNameColor = custom.color;
			e.CustomSprite = custom.customSprite;
			if (custom.customPlayLine) {
				e.playLine = custom.customPlayLine;
			}
			if (custom.customIntro) {
				e.intro = custom.customIntro;
			}
			return custom;
		}
	}
	return undefined;
}


/**
 *
 * @param {any[]} pets
 * @param {entity} e
 * @param {number} index
 * @returns {any}
 */
function KDProcessCustomPatronPet(pets, e, index) {
	if (pets) {
		let customs = pets[e.Enemy.name];
		if (customs?.length > 0 && index < customs.length) {
			let custom = customs[index];
			e.CustomName = custom.name;
			e.CustomNameColor = custom.color;
			e.CustomSprite = custom.customSprite;
			if (custom.customPlayLine) {
				e.playLine = custom.customPlayLine;
			}
			if (custom.customIntro) {
				e.intro = custom.customIntro;
			}
			return custom;
		}
	}
	return undefined;
}