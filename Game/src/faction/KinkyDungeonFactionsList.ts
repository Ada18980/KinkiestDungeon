"use strict";

let KinkyDungeonFactionColors = {
	"Jail": ["#8A120C"],
	"Slime": ["#9B49BD", "#9B49BD"],
	"Latex": ["#9B49BD", "#9B49BD"],
	"Dressmaker": ["#6B48E0", "#F8BD01"],
	"Alchemist": ["#4c6885", "#7bef41"],
	"Elf": ["#4fd658", "#F8BD01"],
	"Bountyhunter": ["#252525", "#bfbfbf"],
	"AncientRobot": ["#444444", "#4fa4b8"],
	"Dollsmith": ["#444444", "#b1062a", "#ff5277"],
	"Mushy": ["#bfbfbf", "#92c1e8"],
	"Apprentice": ["#686f99", "#ff5277"],
	"Witch": ["#222222", "#8359b3"],
};

let KDFactionNoCollection = ["Ambush"];

let KinkyDungeonFactionFilters: Record<string, Record<string, LayerFilter>> = {
	"Jail": {
		Catsuit: {"gamma":1.0166666666666666,"saturation":0,"contrast":0.8833333333333333,"brightness":1.5666666666666669,"red":4.216666666666667,"green":0.7166666666666667,"blue":0.7000000000000001,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.6833333333333333,"saturation":0,"contrast":2.55,"brightness":0.41666666666666663,"red":2.5333333333333337,"green":0.7666666666666666,"blue":0.8500000000000001,"alpha":1},
	},
	"Maidforce": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1,"brightness":0.18333333333333335,"red":1.2,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1.2,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1.0980392156862746,"alpha":1},
		Highlight: {"gamma":1.9,"saturation":0,"contrast":1,"brightness":1.5666666666666669,"red":1,"green":1,"blue":1.1,"alpha":1},
	},
	"Bountyhunter": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.7333333333333334,"saturation":0,"contrast":2.3499999999999996,"brightness":0.8166666666666667,"red":1.7833333333333334,"green":0.9666666666666667,"blue":0.6,"alpha":1},
	},
	"Warden": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.0,"contrast":1.0,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.7333333333333334,"saturation":0,"contrast":2.3499999999999996,"brightness":0.8166666666666667,"red":1.7833333333333334,"green":0.9666666666666667,"blue":0.6,"alpha":1},
	},
	"Elemental2": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":0.6,"saturation":0,"contrast":1.2666666666666668,"brightness":0.44999999999999996,"red":1.5833333333333333,"green":0.43333333333333335,"blue":0.7000000000000001,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":1.0333333333333332,"red":1.2,"green":0.9333333333333333,"blue":0.4666666666666667,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1,"brightness":1.6666666666666665,"red":1,"green":1,"blue":1,"alpha":1},
	},
	"Elemental": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1.5833333333333333,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":0.95,"brightness":1.35,"red":0.7833333333333334,"green":0.7833333333333334,"blue":0.8,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1,"brightness":1.6500000000000001,"red":1.1166666666666667,"green":0.8833333333333333,"blue":0.6833333333333333,"alpha":1},
	},
	"Miku": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0.03333333333333333,"contrast":1.1333333333333333,"brightness":0.6833333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.016666666666666666,"contrast":0.8166666666666667,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":0.25,"green":1.3833333333333333,"blue":0.8,"alpha":1},
	},
	"Nevermere": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":0.8,"red":0.7833333333333334,"green":0.9166666666666666,"blue":0.95,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0.016666666666666666,"contrast":1,"brightness":1.25,"red":0.8833333333333333,"green":1,"blue":1.1500000000000001,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1,"brightness":1.35,"red":0.8333333333333333,"green":1.3833333333333333,"blue":0.4,"alpha":1},
	},
	"Dressmaker": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":0.91,"brightness":1,"red":2.1372549019607843,"green":1.1764705882352942,"blue":3.1176470588235294,"alpha":1},
		DarkNeutral: {"gamma":0.8333333333333333,"saturation":0.1,"contrast":1.03,"brightness":1,"red":2.372549019607843,"green":1.7058823529411764,"blue":3.2941176470588234,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.83,"brightness":1,"red":5,"green":0.5686274509803921,"blue":1.8823529411764706,"alpha":1},
		Highlight: {"gamma":0.5333333333333333,"saturation":0,"contrast":2.05,"brightness":1.2833333333333332,"red":1,"green":1,"blue":1,"alpha":1},
	},
	"Dollsmith": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":0.8300000000000001,"brightness":1,"red":1.2549019607843137,"green":1,"blue":4,"alpha":1},
		// Tis inverted, light is dark and dark is light
		LightNeutral: {"gamma":0.8,"saturation":0.1,"contrast":2.05,"brightness":0.5333333333333333,"red":1,"green":1,"blue":1,"alpha":1},
		Highlight: {"gamma":0.7833333333333334,"saturation":0,"contrast":2.8666666666666667,"brightness":1.1833333333333333,"red":2.4166666666666665,"green":0.6166666666666667,"blue":1.76,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0.0,"contrast":1.15,"brightness":0.7,"red":1.2166666666666665,"green":0.65,"blue":1.76,"alpha":1},
	},
	"Latex": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":0.9299999999999999,"brightness":1,"red":4.509803921568627,"green":0.8431372549019608,"blue":4.745098039215686,"alpha":1},
		DarkNeutral: {"gamma":0.8333333333333333,"saturation":0,"contrast":1.2,"brightness":1.2,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":0.9299999999999999,"brightness":1,"red":4.549019607843137,"green":1.0392156862745099,"blue":4.764705882352941,"alpha":1},
		Highlight: {"gamma":1,"saturation":0.11666666666666667,"contrast":1.3,"brightness":1.1166666666666667,"red":1,"green":1,"blue":1,"alpha":1},
	},
	"Rubber": {
		Catsuit: {"gamma":2.7666666666666666,"saturation":0,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
		DarkNeutral: {"gamma":1.3566666666666665,"saturation":0,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
		LightNeutral: {"gamma":1.6500000000000001,"saturation":1,"contrast":1,"brightness":1.2333333333333334,"red":0.44999999999999996,"green":1.3166666666666664,"blue":2.4,"alpha":1},
		Highlight: {"gamma":2.05,"saturation":0.016666666666666666,"contrast":0.8,"brightness":1.5,"red":0.8999999999999999,"green":1.1833333333333333,"blue":1.75,"alpha":1},
	},
	"Slime": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":0.9299999999999999,"brightness":1,"red":4.980392156862745,"green":0.6078431372549019,"blue":5,"alpha":1},
		DarkNeutral: {"gamma":0.8,"saturation":0.1,"contrast":0.8666666666666667,"brightness":1.4166666666666665,"red":2.05,"green":1,"blue":2.15,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":0.9299999999999999,"brightness":1,"red":4.549019607843137,"green":1.0392156862745099,"blue":4.764705882352941,"alpha":1},
		Highlight: {"gamma":0.8,"saturation":0,"contrast":0.8666666666666667,"brightness":1.4166666666666665,"red":2.05,"green":1,"blue":2.15,"alpha":1},
	},
	"Alchemist": {
		Catsuit: {"gamma":1.7666666666666666,"saturation":0.016666666666666666,"contrast":0.6833333333333333,"brightness":1.9,"red":1,"green":1,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":0.8333333333333333,"saturation":0,"contrast":0.9666666666666667,"brightness":0.6166666666666667,"red":1,"green":1,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.1833333333333333,"brightness":0.6666666666666666,"red":0.5294117647058824,"green":1.7450980392156863,"blue":3.9019607843137254,"alpha":1},
		//Catsuit: {"gamma":2.7666666666666666,"saturation":1.6833333333333333,"contrast":0.8,"brightness":1.5,"red":0.6333333333333334,"green":1.1833333333333333,"blue":2.033333333333333,"alpha":1},
		Highlight: {"gamma":0.65,"saturation":0.06666666666666667,"contrast":2.283333333333333,"brightness":1,"red":0.5833333333333334,"green":1.55,"blue":0.8166666666666667,"alpha":1},
	},
	"Apprentice": {
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":0.7666666666666666,"red":1,"green":1,"blue":1,"alpha":1},
		Catsuit: {"gamma":1,"saturation":0,"contrast":1.0499999999999998,"brightness":1,"red":2.019607843137255,"green":3.0980392156862746,"blue":4.137254901960785,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.1833333333333333,"brightness":0.6666666666666666,"red":0.5294117647058824,"green":1.1666666666666667,"blue":3.9019607843137254,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":1,"red":0.5294117647058824,"green":1.0784313725490196,"blue":1.0196078431372548,"alpha":1},
	},
	"Witch": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":1.0499999999999998,"brightness":1,"red":2.8823529411764706,"green":2.196078431372549,"blue":3.980392156862745,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0.1,"contrast":0.7,"brightness":1,"red":0.8823529411764706,"green":0.7058823529411765,"blue":0.8823529411764706,"alpha":1},
		LightNeutral: {"gamma":0.43333333333333335,"saturation":0,"contrast":2.3166666666666664,"brightness":0.9666666666666667,"red":0.6,"green":0.6833333333333333,"blue":1.5333333333333332,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":2.216666666666667,"brightness":1.35,"red":0.41666666666666663,"green":0.35000000000000003,"blue":0.8666666666666667,"alpha":1},
	},
	"Curse": {
		Catsuit: {"gamma":1.8333333333333333,"saturation":0,"contrast":0.7833333333333334,"brightness":0.3833333333333333,"red":2.3000000000000003,"green":1,"blue":4.833333333333333,"alpha":1},
		DarkNeutral: {"gamma":0.6666666666666666,"saturation":0,"contrast":0.95,"brightness":1,"red":1.5098039215686274,"green":1.8431372549019607,"blue":3.7254901960784315,"alpha":1},
		LightNeutral: {"gamma":1.4666666666666668,"saturation":0,"contrast":2.3166666666666664,"brightness":0.9666666666666667,"red":0.6,"green":0.6833333333333333,"blue":1.5333333333333332,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1.4833333333333334,"brightness":1.0833333333333335,"red":1.0666666666666667,"green":0.6666666666666666,"blue":0.8666666666666667,"alpha":1},
	},
	"AncientRobot": {
		Catsuit: {"gamma":1.0166666666666666,"saturation":0,"contrast":0.8999999999999999,"brightness":1.4000000000000001,"red":0.7666666666666666,"green":1,"blue":4.833333333333333,"alpha":1},
		DarkNeutral: {"gamma":1.5,"saturation":0,"contrast":2.1166666666666667,"brightness":0.9833333333333333,"red":0.7666666666666667,"green":1,"blue":4.4166666666666665,"alpha":1},
		LightNeutral: {"gamma":0.7666666666666666,"saturation":0,"contrast":2.1166666666666667,"brightness":0.8833333333333333,"red":0.3666666666666667,"green":0.6666666666666666,"blue":2.4166666666666665,"alpha":1},
		Highlight: {"gamma":0.5333333333333333,"saturation":0,"contrast":2.6500000000000004,"brightness":0.95,"red":1.85,"green":0.633333333333334,"blue":0.7666666666666666,"alpha":1},
	},
	"Mushy": {
		Catsuit: {"gamma":1.0166666666666666,"saturation":0,"contrast":0.8999999999999999,"brightness":1.4000000000000001,"red":1.7333333333333334,"green":2.5166666666666666,"blue":1.55,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1,"brightness":0.6333333333333334,"red":1.3,"green":1,"blue":1.5333333333333332,"alpha":1},
		LightNeutral: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":1.4166666666666665,"red":0.55,"green":1.4666666666666668,"blue":1.2333333333333334,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1.0833333333333335,"brightness":1.6833333333333333,"red":0.55,"green":1.9666666666666666,"blue":1.8333333333333333,"alpha":1},
	},
	"Bast": {
		Catsuit: {"gamma":1.0166666666666666,"saturation":0,"contrast":0.8999999999999999,"brightness":1.4000000000000001,"red":4,"green":2.5166666666666666,"blue":1.55,"alpha":1},
		// DarkNeutral is much lighter than usual
		DarkNeutral: {"gamma":1.3166666666666664,"saturation":0,"contrast":1.6500000000000001,"brightness":0.7333333333333333,"red":1.3666666666666667,"green":1.2333333333333334,"blue":1,"alpha":1},
		LightNeutral: {"gamma":1.3166666666666664,"saturation":0,"contrast":1.1833333333333333,"brightness":0.7333333333333333,"red":1.4166666666666665,"green":1.2333333333333334,"blue":1,"alpha":1},
		Highlight: {"gamma":1,"saturation":0,"contrast":1,"brightness":0.8,"red":1,"green":2.4,"blue":1,"alpha":1},
	},
	"Elf": {
		Catsuit: {"gamma":1.0166666666666666,"saturation":0,"contrast":0.8999999999999999,"brightness":1.4000000000000001,"red":1.7333333333333334,"green":2.5166666666666666,"blue":1.55,"alpha":1},
		//Catsuit: {"gamma":1,"saturation":0,"contrast":1,"brightness":1,"red":1,"green":2.4,"blue":1,"alpha":1},
		DarkNeutral: {"gamma":1.1500000000000001,"saturation":0,"contrast":1.5833333333333333,"brightness":0.7000000000000001,"red":1,"green":2.4,"blue":1.3,"alpha":1},
		LightNeutral: {"gamma":0.4666666666666667,"saturation":0,"contrast":1.1166666666666667,"brightness":0.5666666666666667,"red":1.0666666666666667,"green":1.6166666666666665,"blue":1.1833333333333333,"alpha":1},
		Highlight: {"gamma":0.8333333333333333,"saturation":0,"contrast":0.65,"brightness":1.1166666666666667,"red":1.3666666666666667,"green":1.2333333333333334,"blue":1,"alpha":1},
	},
	"Goddess": {
		Catsuit: {"gamma":1,"saturation":0,"contrast":0.8666666666666667,"brightness":1.7666666666666666,"red":3.5166666666666666,"green":2.9333333333333336,"blue":1.6,"alpha":1},
		DarkNeutral: {"gamma":1,"saturation":0,"contrast":1.09,"brightness":0.6833333333333333,"red":1.4901960784313726,"green":1.5490196078431373,"blue":1.607843137254902,"alpha":1},
		LightNeutral: {"gamma":1.5333333333333332,"saturation":0.016666666666666666,"contrast":1.7833333333333334,"brightness":0.5333333333333333,"red":1.6666666666666665,"green":1.6166666666666665,"blue":1.6333333333333333,"alpha":1},
		Highlight: {"gamma":1,"saturation":0.016666666666666666,"contrast":1.5166666666666666,"brightness":0.5333333333333333,"red":2.9333333333333336,"green":2.166666666666667,"blue":1.6333333333333333,"alpha":1},
	},
};

/**
 */
let KDFactionProperties: Record<string, KDFactionProps> = {
	Dressmaker: {
		honor: -1,
		jailBackupFaction: "Apprentice",
		honor_specific: {
			Witch: 1,
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 5;
			if (tags.includes("dressmaker")) w += 40;
			if (tags.includes("magical")) w += 5;
			if (tags.includes("book")) w += 5;
			if (tags.includes("manakin")) w += 15;
			if (tags.includes("dollsmith")) w += 10;
			return w;
		},
		jailOutfit: "Bikini",
	},
	Bountyhunter: {
		nameList: ["bountyhunter"],
		jailBackupFaction: "Maidforce",
		honor: 1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 10;
			if (tags.includes("bountyhunter")) w += 40;
			if (tags.includes("ninja")) w += 20;
			if (tags.includes("police")) w += 20;
			if (tags.includes("human")) w += 5;
			if (tags.includes("tech")) w += 5;
			return w;
		},
		jailOutfit: "LatexPrisoner",
	},
	AncientRobot: {
		honor: 0,
		honor_specific: {
			Dollsmith: -1,
		},
		customDefeat: "DollStorage",
		customHiSecDialogue: (enemy) => {
			if (KDGetEnemyPlayLine(enemy).includes("Robot")) {
				KinkyDungeonSendDialogue(enemy, TextGet("KDJailerHiSecDialogue" + KDGetEnemyPlayLine(enemy)),
					KDGetColor(enemy), 8, 10, true);
				KinkyDungeonSetFlag("LeashToPrison", -1);
				if (enemy?.hostile) {
					enemy.hostile = 300;
				}
				KinkyDungeonStartChase(undefined, "Jailbreak");
			}
			else {
				return "CyberHiSec";
			}
			return "";
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 0;
			if (tags.includes("robot")) w += 100;
			if (tags.includes("oldrobot")) w += 10;
			if (tags.includes("electric")) w += 5;
			if (tags.includes("estim")) w += 5;
			if (tags.includes("metal")) w += 5;
			if (tags.includes("factory")) w += 15;
			if (tags.includes("industrial")) w += 15;
			return w;
		},
		jailOutfit: "CyberDoll",
	},
	Elf: {
		honor: 1,
		honor_specific: {
			Plant: 0,
			Nature: 0,
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 0;
			if (tags.includes("elf")) w += 50;
			if (tags.includes("nature")) w += 40;
			if (tags.includes("magical")) w += 20;
			if (tags.includes("jungle")) w += 10;
			return w;
		},
		jailOutfit: "Elven",
	},
	Bast: {
		honor: 0,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 0;
			if (tags.includes("bast")) w += 100;
			if (tags.includes("mummy")) w += 50;
			if (tags.includes("egyptian")) w += 10;
			return w;
		},
		jailOutfit: "Bast",
	},
	Maidforce: {
		honor: 1,
		jailBackupFaction: "Bountyhunter",
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 5;
			if (tags.includes("maid")) w += 100;
			if (tags.includes("slime")) w += 20;
			if (tags.includes("urban")) w += 5;
			if (tags.includes("library")) w += 20;
			if (tags.includes("tech")) w += 5;
			return w;
		},
		jailOutfit: "Maid",
	},
	Dragon: {
		honor: 1,
		jailBackupFaction: "Bountyhunter",
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 5;
			if (tags.includes("dragon")) w += 40;
			if (tags.includes("elemental")) w += 15;
			if (tags.includes("magical")) w += 5;
			if (tags.includes("adventurer")) w += 5;
			if (tags.includes("crystalline")) w += 5;
			return w;
		},
		jailOutfit: "Dragon",
	},
	Elemental: {
		honor: -1,
		jailBackupFaction: "Witch",
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 0;
			if (tags.includes("elemental")) w += 40;
			if (tags.includes("magical")) w += 20;
			if (tags.includes("book")) w += 10;
			if (tags.includes("library")) w += 10;
			if (tags.includes("witch")) w += 20;
			if (tags.includes("shadow")) w += 5;
			if (tags.includes("angel")) w += 5;
			return w;
		},
		jailOutfit: "Obsidian",
	},
	Apprentice: {
		honor: 1,
		jailBackupFaction: "Dragon",
		honor_specific: {
			Witch: 0,
			Wizard: -1,
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 5;
			if (tags.includes("apprentice")) w += 40;
			if (tags.includes("witch")) w += 25;
			if (tags.includes("library")) w += 20;
			if (tags.includes("magical")) w += 20;
			if (tags.includes("book")) w += 15;
			return w;
		},
		jailOutfit: "Lingerie",
	},
	Nevermere: {
		honor: -1,
		jailBackupFaction: "Dressmaker",
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 5;
			if (tags.includes("nevermere")) w += 40;
			if (tags.includes("metal")) w += 15;
			if (tags.includes("crystalline")) w += 10;
			if (tags.includes("wolfgirl")) w += 5;
			if (tags.includes("tech")) w += 5;
			return w;
		},
		jailOutfit: "Wolfgirl",
	},
	Alchemist: {
		honor: 0,
		jailBackupFaction: "Apprentice",
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 5;
			if (tags.includes("alchemist")) w += 40;
			if (tags.includes("latex")) w += 25;
			if (tags.includes("tech")) w += 15;
			if (tags.includes("slime")) w += 15;
			if (tags.includes("library")) w += 20;
			if (tags.includes("magical")) w += 5;
			return w;
		},
		jailOutfit: "BlueSuit",
	},
	Bandit: {
		honor: -1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, tags, _bonustags, _X, _Y) => {
			let w = 20;
			if (tags.includes("bandit")) w += 40;
			if (tags.includes("cavern")) w += 15;
			if (tags.includes("jungle")) w += 5;
			if (tags.includes("nature")) w += 5;
			return w;
		},
		jailOutfit: "Prisoner",
	},

	Virus: {
		honor: 0,
		honor_specific: {
			AncientRobot: -1,
			Dollsmith: 1,
		},
		customDefeat: "DollStorage",
		customHiSecDialogue: (enemy) => {
			if (KDGetEnemyPlayLine(enemy).includes("Robot")) {
				KinkyDungeonSendDialogue(enemy, TextGet("KDJailerHiSecDialogue" + KDGetEnemyPlayLine(enemy)),
					KDGetColor(enemy), 8, 10, true);
				KinkyDungeonSetFlag("LeashToPrison", -1);
				if (enemy?.hostile) {
					enemy.hostile = 300;
				}
				KinkyDungeonStartChase(undefined, "Jailbreak");
			}
			else {
				return "CyberHiSec";
			}
			return "";
		},
		weight: (_Floor, _Checkpoint, _tags, _bonustags, _X, _Y) => {
			return 0;
		},
		jailAlliedFaction: "Dollsmith",
		jailBackupFaction: "Dollsmith",
		jailOutfit: "CyberDoll",

	},

	Owners: {
		customDefeat: "ElementalSlave",
		jailAlliedFaction: "Elemental",
		jailBackupFaction: "Witch",
		honor: 1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, _tags, _bonustags, _X, _Y) => {
			return 0;
		},
		jailOutfit: "Obsidian",
	},
	WolfgirlHunters: {
		customDefeat: "WolfgirlHunters",
		jailAlliedFaction: "Nevermere",
		jailBackupFaction: "Bandit",
		honor: 1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, _tags, _bonustags, _X, _Y) => {
			return 0;
		},
		jailOutfit: "Nevermere",
	},
	Delinquent: {
		customDefeat: "MaidSweeper",
		jailAlliedFaction: "Maidforce",
		jailBackupFaction: "Bountyhunter",
		honor: 1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, _tags, _bonustags, _X, _Y) => {
			return 0;
		},
		jailOutfit: "Lingerie",
	},
	RopeDojo: {
		customDefeat: "RopeDojo",
		jailAlliedFaction: "Apprentice",
		jailBackupFaction: "Bountyhunter",
		honor: 1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, _tags, _bonustags, _X, _Y) => {
			return 0;
		},
		jailOutfit: "Bikini",
	},
	DollShoppe: {
		customDefeat: "DollShoppe",
		jailAlliedFaction: "Dressmaker",
		jailBackupFaction: "Apprentice",
		honor: -1,
		honor_specific: {
		},
		weight: (_Floor, _Checkpoint, _tags, _bonustags, _X, _Y) => {
			return 0;
		},
		jailOutfit: "BindingDress",
	},
};

/** Hidden factions do not auto-rep change when you attack them */
let KDHiddenFactions = [
	"Plant",
	"Natural",
	"Barrel",
	"Door",
	"Player",
	"Enemy",
	"Jail",
	"Prisoner",
	"Beast",
	"DragonQueen",
	"Slime",
	"Latex",
	"Mold",
	"KinkyConstruct",
	"Boss",
	"Ambush",
	"Rage",
	"Ghost",
	"Trap",
	"Rebel",
	"Rock",
	"Delinquent",
	"Virus",
	"ShadowClan",
	"Dollsmith",
	"Warden",
	"DollShoppe",
	"RopeDojo",
	"Fuuka",
	"DubiousWitch",
	"Extraplanar",
	"Owners",
	"Debate",
	"Wolfhunter",
	"Chase",
	"Mushy",
	"Witch",
	"Curse",
	"Observer",
	"Door",
	"Adventurer",
];

let KinkyDungeonHiddenFactions: Map<string, boolean> = new Map();
for (let f of KDHiddenFactions) {
	KinkyDungeonHiddenFactions.set(f, true);
}

function KinkyDungeonHiddenFactionsPush(str: any) {
	KinkyDungeonHiddenFactions.set(str, true);
}



let KDFactionSecurityMod = {
	Dressmaker: {
		level_magic: 1,
		level_key: 1,
	},
	Witch: {
		level_magic: 1,
		level_key: 1,
	},
	Elemental: {
		level_magic: 2,
	},
	Mushy: {
		level_magic: 1,
		level_tech: 0,
	},
	Apprentice: {
		level_magic: 0,
		level_key: -1,
	},
	Elf: {
		level_magic: 1,
		level_key: 1,
	},
	Bast: {
		level_magic: 1,
	},
	AncientRobot: {
		level_tech: 2,
		level_key: 1,
	},
	Nevermere: {
		level_tech: 1,
		level_key: 1,
	},
	Maidforce: {
		level_tech: 0,
		level_magic: -1,
		level_key: 1,
	},
	Alchemist: {
		level_tech: 1,
		level_magic: -1,
	},
	Bountyhunter: {
		level_tech: 0,
		level_key: 2,
	},
};

let KDBaseSecurity = {
	level_key: 0,
};

let KDPiousFactions = {
	"Angel": 1.0,
};

/** Shows tooltips for these factions even though they are hidden */
let KinkyDungeonTooltipFactions = [
	"Rebel",
	"Ambush",
	"Delinquent",
	"DubiousWitch",
	"Extraplanar",
	"Owners",
	"Virus",
	"ShadowClan",
	"DollShoppe",
	"RopeDojo",
	"Dollsmith",
	"Warden",
	"Fuuka",
	"Debate",
	"Wolfhunter",
	"Rock",
	"Rage",
	"Curse",
	"Observer",
];

/** Tag for these factions, these also can have increased chances to appear on a map */
let KinkyDungeonFactionTag = {
	Bountyhunter: "bountyhunter",
	Bandit: "bandit",
	Alchemist: "alchemist",
	Nevermere: "nevermere",
	Apprentice: "apprentice",
	RopeDojo: "apprentice",
	Dressmaker: "dressmaker",
	DollShoppe: "dressmaker",
	//Witch: "witch",
	Elemental: "elemental",
	Owners: "elemental",
	Dragon: "dragon",
	Maidforce: "maid",
	Delinquent: "maid",
	Bast: "mummy",
	Elf: "elf",
	//Mushy: "mushy",
	AncientRobot: "robot",
	ShadowClan: "shadow",
	Debate: "elf",
	Wolfhunter: "nevermere",
	Extraplanar: "demon",
	DubiousWitch: "mage",
	Virus: "robot",
	Dollsmith: "dollsmith",
	Warden: "warden",
};

let KinkyDungeonFactionRelationsBase = {
	"Player": {
		Enemy: -1.0,
		Jail: -1.0,
		Chase: -1,
		Prisoner: 0.1,

		// Wild factions
		KinkyConstruct: -0.9,
		Plant: -0.9,
		Slime: -1.0,
		Latex: -1.0,
		Mold: -1.0,
		Beast: -0.6,
		DragonQueen: -1,

		// Mainline factions
		Bountyhunter: -0.3,
		Bandit: -0.7,
		Alchemist: -0.2,
		Nevermere: -0.1,
		Apprentice: 0.2,
		Dressmaker: -0.4,
		Witch: -0.8,
		Elemental: -0.6,
		Dragon: 0.1,
		Maidforce: -0.1,
		Bast: -0.6,
		Elf: -0.3,
		Mushy: -0.6,
		AncientRobot: -0.2,

		// Special factions
		Angel: 0.1,
		Demon: -0.25,
	},
	"Angel": {
		Demon: -1.0,
		Ghost: -0.7,
		Elemental: 0.15,
		Dragon: 0.05,
		AncientRobot: -0.25,
		Nevermere: -0.1,
		Enemy: 0.1,
	},
	"Natural": {
		Player: -1,
		Jail: -1,
		Chase: -1,
	},
	"Barrel": {
		Jail: -1,
		Chase: -1,
	},
	"Door": {
		Player: -1,
		Jail: -1,
		Chase: -1,
	},
	"Ghost": {
		Player: -1.0,
		Jail: -0.25,
		Chase: -1,
	},
	"Observer": {
		Player: -1.0,
		Jail: -1,
		Chase: -1,
	},
	"Rock": {
		Player: -1.0,
		Jail: -0.1,
		Chase: -1,
	},
	"Rebel": {
		Jail: -0.1,
		Chase: -1,
	},
	"Adventurer": {
		Jail: -0.1,
		Chase: -1,
	},
	"Demon": {
		Elf: -1.0,
		Bast: -1.0,
		Witch: 0.25,
		Jail: -0.25,
		Chase: -1,

		Bountyhunter: -0.5,
		Bandit: -0.5,
		Alchemist: -0.5,
		Nevermere: -0.5,
		Apprentice: -0.5,
		Dressmaker: -0.5,
		Elemental: -0.1,
		Dragon: -1.0,
		Maidforce: -0.5,
		Mushy: -0.5,
		AncientRobot: -0.45,
	},
	"Enemy": {
		KinkyConstruct: .1,
		Dragon: .1,
		Bountyhunter: .1,
		Bandit: .1,
		Alchemist: .1,
		Nevermere: .1,
		Apprentice: .1,
		Dressmaker: .1,
		Witch: .1,
		Elemental: .1,
		Maidforce: .1,
		Bast: .1,
		Elf: .1,
		Mushy: .1,
		AncientRobot: .1,
	},
	dollsmith: {}, // Dummy to help peoples old saves
	"Dollsmith": {
		KinkyConstruct: .1,
		Dragon: -0.5,
		Bountyhunter: .1,
		Bandit: .1,
		Alchemist: .1,
		Nevermere: 0.3,
		Apprentice: .1,
		Dressmaker: .1,
		Witch: .1,
		Elemental: -0.1,
		Maidforce: -0.2,
		Bast: -0.1,
		Elf: -0.1,
		Mushy: -0.1,
		AncientRobot: -0.3,

		Player: -1,
	},
	"Warden": {
		KinkyConstruct: .1,
		AncientRobot: -0.3,

		Player: -1,
		Jail: 0.5,
	},
	"Virus": {
		Player: -1,
		Chase: -1,
		Jail: -0.25,
	},
	"DubiousWitch": {
		Player: -1,
		Witch: 1,
		Chase: -1,
		Jail: -0.25,
	},
	"Extraplanar": {
		Player: -1,
		Demon: 1,
		Chase: -1,
		Jail: -0.25,
	},
	"Owners": {
		Player: -1,
		Demon: -1,
		Elemental: 0.6,
		Chase: -1,
		Jail: -0.25,
	},
	"Delinquent": {
		Player: -1,
		Maidforce: -1,
		Chase: -1,
		Jail: -0.25,
	},
	"ShadowClan": {
		Player: -1,
		Demon: 1,
		Angel: -1,
		Chase: -1,
		Jail: -0.25,
	},
	"Fuuka": {
		Player: -1,
		Chase: -1,
		Jail: -0.25,
	},
	"RopeDojo": {
		Player: -1,
		Chase: -1,
		Jail: -0.25,
	},
	"DollShoppe": {
		Player: -1,
		Chase: -1,
		Dressmaker: 0.5,
		Jail: -0.25,
	},
	"Debate": {
		Player: 0,
		Chase: -1,
		Jail: -0.25,
	},
	"Wolfhunter": {
		Player: -1,
		Nevermere: -1,
		Chase: -1,
		Jail: -0.25,
	},
	"Trap": {
		Enemy: -1.0,
		Jail: -1.0,
		Prisoner: 1,
		Ambush: 1,
		Boss: -1,

		// Wild factions
		KinkyConstruct: -1,
		Plant: -1,
		Slime: -1,
		Mold: -1,
		Beast: -1,
		DragonQueen: -1,

		Bountyhunter: -1,
		Bandit: -1,
		Alchemist: -1,
		Nevermere: -1,
		Apprentice: -1,
		Dressmaker: -1,
		Witch: -1,
		Elemental: -1,
		Dragon: -1,
		Maidforce: -1,
		Bast: -1,
		Elf: -1,
		Mushy: -1,
		AncientRobot: -1,

		// Hidden Factions
		Delinquent: -1,
		"Virus": -1,
		"ShadowClan": -1,
		"DollShoppe": -1,
		RopeDojo: -1,
		Fuuka: -1,
		"DubiousWitch": -1,
		"Extraplanar": -1,
		"Owners": -1,
		"Debate": -1,
		Dollsmith: -1,
		"Wolfhunter": -1,

		Observer: 1,

		// Special factions
		Angel: -1,
		Demon: -1,


		Chase: -1,
	},
	"Boss": {
		Chase: -1,
		Enemy: 0.6,
	},
	"Chase": {
		// Dummy faction, used for deciding if a faction will make you go On The Run
	},
	"Ambush": {
		Player: -1.0,
		Jail: -0.25,

		Chase: -1,
	},
	"Curse": {
		Player: -1.0,
		Jail: -0.4,

		Chase: -1,
	},
	"Prisoner": {
	},
	"Jail": {
		// Dummy faction, used for deciding if a faction will attack you as a prisoner
	},
	"Slime": {
		Jail: -1,
		Chase: -1,

		Bountyhunter: -0.5,
		Bandit: -0.6,
		Alchemist: -0.8,
		Nevermere: -0.55,
		Apprentice: -0.55,
		Dressmaker: -0.4,
		Elemental: -0.4,
		Dragon: -1.0,
		Maidforce: -1.0,
		Bast: -0.1,
		Elf: -0.1,
		Mushy: 0.1,
	},
	"Latex": {
		Jail: -1,
		Chase: -1,

		Maidforce: -1.0,
	},
	"Mold": {
		Jail: -1,
		Chase: -1,

		Enemy: -0.5,
		Bountyhunter: -0.5,
		Bandit: -0.6,
		Alchemist: -0.8,
		Nevermere: -0.55,
		Apprentice: -0.55,
		Dressmaker: -0.5,
		Witch: -0.5,
		Elemental: -0.5,
		Dragon: -1.0,
		Maidforce: -1.0,
		Bast: -0.5,
		Elf: -0.5,
		Mushy: -0.5,
		AncientRobot: -1.0,
	},
	"Beast": {
		Jail: -1,
		Chase: -1,

		Bountyhunter: -0.4,
		Bandit: -0.4,
		Alchemist: -0.4,
		Nevermere: -0.4,
		Apprentice: -0.4,
		Dressmaker: -0.4,
		Witch: -0.1,
		Elemental: -0.4,
		Dragon: -1.0,
		Maidforce: -0.4,
		Mushy: -0.4,
		AncientRobot: -1.0,
	},
	"DragonQueen": {
		Jail: -1,
		Chase: -1,

		Bountyhunter: -0.4,
		Bandit: -0.4,
		Alchemist: -0.4,
		Nevermere: -0.4,
		Apprentice: -0.4,
		Dressmaker: -0.4,
		Witch: -0.1,
		Elemental: -1,
		Dragon: -1.0,
		Maidforce: -0.4,
		Mushy: -0.4,
		AncientRobot: -1.0,
	},
	"KinkyConstruct": {
		Jail: -0.25,
		Chase: -1,

		Apprentice: -0.55,
		Dragon: -1.0,
	},
	"Plant": {
		Jail: -1,
		Chase: -1,
	},
	"Nevermere": {
		"Alchemist": 0.4,
		"Bast": -0.55,
		"Mushy": -0.4,
		"Bandit": 0.25,
		"Apprentice": 0,
		"AncientRobot": -0.51,
	},
	"Alchemist": {
		"Bandit": 0.15,
		"AncientRobot": -0.55,
		"Dressmaker": -0.25,
	},
	"Bountyhunter": {
		"Jail": 0.8,
		"Dragon": 0.5,
		"Bandit": -0.55,
		"Maidforce": -0.15,
		"Witch": -0.4,
		"Dressmaker": 0.4,
		"Nevermere": 0.4,
	},
	"Elf": {
		"Mushy": 0.4,
		"Beast": 0.2,
		"Plant": 0.2,
	},
	"Bast": {
		"Elf": -1.0,
		"Witch": -0.4,
		"Beast": 0.2,
	},
	"Bandit": {
		"Mushy": -0.6,
		"Apprentice": -0.1,
		"Witch": 0.15,
	},
	"Elemental": {
		"KinkyConstruct": 0.55,
		"Bandit": -0.15,
		"Elf": 0.5,
		"Bast": -0.35,
		"Dragon": -0.5,
		"AncientRobot": -0.15,
	},
	"AncientRobot": {
		"Bast": 0.55,
		"Elf": -0.6,
		//"Maidforce": 0.55,
		//"Dragon": 0.45,
		//"Dressmaker": 0.55,
		//"Apprentice": 0.52,
	},
	"Dragon": {
		"Jail": 1.0,
		"Apprentice": 0.4,
		"Bandit": -0.6,
		"Witch": -0.4,
		"Alchemist": -0.15,
		"Beast": -1.0,
		"Mushy": -0.15,
	},
	"Mushy": {
		"Alchemist": -0.55,
		"Elemental": 0.25,
	},
	"Witch": {
		"Elf": -1.0,
	},
	"Dressmaker": {
		"Witch": 0.15,
		"Nevermere": 0.55,
		"Bandit": -0.5,
		"Dragon": -0.5,
	},
	"Apprentice": {
		"Jail": 1.0,
		"Elf":  0.75,
	},
	"Necromancer": {
		"Jail": 0.55,
		"Witch":  0.55,
		"Apprentice":  -.2,
		"Dragon":  -.4,
		"Maidforce":  -.4,
		"Alchemist": .05,
		"Nevermere": -.2,
	},
	"Maidforce": {
		"Alchemist": 0.55,
		"Jail": 0.55,
		"Dragon": 0.55,
		"Apprentice": 0.55,
		"Bandit": -0.6,
		"Witch": -0.4,
	},
};

let KinkyDungeonFactionRelations = Object.assign({}, KinkyDungeonFactionRelationsBase);

function KDFactionRelation(a: string, b: string): number {
	if (a == "Rage" || b == "Rage") return -1.0;
	if (a == b) return 1.0;
	if (KDFactionRelations.get(a) && KDFactionRelations.get(a).get(b)) {
		return KDFactionRelations.get(a).get(b);
	}
	return 0.0;
}

let KDFactionRelations: Map<string, Map<string, number>> = new Map();

function KDInitFactions(Reset?: boolean) {
	if (Reset) {
		KinkyDungeonFactionRelations = Object.assign({}, KinkyDungeonFactionRelationsBase);
		for (let relation of Object.entries(KinkyDungeonFactionRelationsBase)) {
			KinkyDungeonFactionRelations[relation[0]] = Object.assign({}, KinkyDungeonFactionRelationsBase[relation[0]]);
		}
	}

	for (let f of Object.keys(KinkyDungeonFactionRelationsBase)) {
		if (!KinkyDungeonFactionRelations[f])
			KinkyDungeonFactionRelations[f] = Object.assign(KinkyDungeonFactionRelationsBase[f]);
	}

	KDFactionRelations = new Map();
	// For each faction in faction relations we create all the maps
	for (let f1 of Object.entries(KinkyDungeonFactionRelationsBase)) {
		let fmap = new Map();

		KDFactionRelations.set(f1[0], fmap);
	}
	// Next we create the faction relationships
	for (let f1 of Object.entries(KinkyDungeonFactionRelations)) {
		let fmap = KDFactionRelations.get(f1[0]);
		if (fmap)
			for (let f2 of Object.entries(f1[1])) {
				// Set mutual opinions
				fmap.set(f2[0], f2[1]);
				if (!KDFactionRelations.get(f2[0])) {
					console.log("Could not find faction " + f2[0]);
				} else {
					KDFactionRelations.get(f2[0]).set(f1[0], f2[1]);
				}
			}
	}
}

/**
 * Sets faction relation and refreshes the map
 * @param a
 * @param b
 * @param relation
 */
function KDSetFactionRelation(a: string, b: string, relation: number) {
	if (a == "Rage" || b == "Rage") return;
	if (KinkyDungeonFactionRelations[a])
		KinkyDungeonFactionRelations[a][b] = Math.max(-1, Math.min(1, relation));
	if (KinkyDungeonFactionRelations[b])
		KinkyDungeonFactionRelations[b][a] = Math.max(-1, Math.min(1, relation));
	KDInitFactions();
}

/**
 * Changes faction relation and refreshes the map
 * @param a
 * @param b
 * @param amount
 * @param [AffectRivals]
 */
function KDChangeFactionRelation(a: string, b: string, amount: number, AffectRivals?: boolean) {
	if (a == "Rage" || b == "Rage") return;
	if ((a != "Player" && KinkyDungeonHiddenFactions.has(a)) || (b != "Player" && KinkyDungeonHiddenFactions.has(b))) return;
	if (!KinkyDungeonFactionRelations[a]) KinkyDungeonFactionRelations[a] = KinkyDungeonFactionRelationsBase[a] || 0;
	if (!KinkyDungeonFactionRelations[b]) KinkyDungeonFactionRelations[b] = KinkyDungeonFactionRelationsBase[b] || 0;

	let amountSetTo = 0;
	let amountSet = false;

	if (KinkyDungeonFactionRelations[a]) {
		if (!KinkyDungeonFactionRelations[a][b] && KinkyDungeonFactionRelations[b][a])
			KinkyDungeonFactionRelations[a][b] = KinkyDungeonFactionRelations[b][a];
		else if (!KinkyDungeonFactionRelations[a][b]) KinkyDungeonFactionRelations[a][b] = 0;
		amountSetTo = Math.max(-1, Math.min(1, KinkyDungeonFactionRelations[a][b] + amount));
		KinkyDungeonFactionRelations[a][b] = amountSetTo;
		amountSet = true;
	}

	if (KinkyDungeonFactionRelations[b]) {
		if (!KinkyDungeonFactionRelations[b][a] && KinkyDungeonFactionRelations[a][b])
			KinkyDungeonFactionRelations[b][a] = KinkyDungeonFactionRelations[a][b];
		else if (!KinkyDungeonFactionRelations[b][a]) KinkyDungeonFactionRelations[b][a] = 0;
		KinkyDungeonFactionRelations[b][a] = amountSet ? amountSetTo : Math.max(-1, Math.min(1, KinkyDungeonFactionRelations[b][a] + amount));
	}

	if (AffectRivals && a == "Player") {
		for (let faction of Object.keys(KinkyDungeonFactionRelations)) {
			if (!KinkyDungeonHiddenFactions.has(faction) && faction != a && faction != b) {
				let relation = KDFactionRelation(b, faction);
				KDChangeFactionRelation("Player", faction, amount * relation);
			}
		}
	}
	KDInitFactions();
}
