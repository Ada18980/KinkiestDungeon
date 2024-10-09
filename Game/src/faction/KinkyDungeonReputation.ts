"use strict";

const KDANGER = -19;
const KDRAGE = -31;
const KDPLEASED = 15;
const KDFRIENDLY = 35;

let KDStatRep = ["Ghost", "Prisoner", "Passion", "Frustration"];

let KDRepColor = {
	Passion: "#ff5555",
	Frustration: "#ff9999",
};
let KDRepNameColor = {
	Leather: "#3e0000",
	Latex: "#692464",
	Rope: "#494f11",
	Metal: "#2f68cc",
	Will: "#2f573d",
	Elements: "#ad2f45",
	Conjure: "#2f4a3d",
	Illusion: "#551d78",
};

let KDFactionGoddess = {
	"Metal": {
		"Angel": 0.002,
		"Demon": -0.001,
		"Nevermere": -0.001,
		"AncientRobot": 0.007,
		"Elemental": 0.001,
	},
	"Rope": {
		"Angel": 0.002,
		"Demon": -0.001,
		"KinkyConstruct": 0.005,
		"Dressmaker": 0.005,
		"Bountyhunter": 0.002,
		"Bast": 0.0025,
		"AncientRobot": 0.001,
	},
	"Elements": {
		"Angel": 0.007,
		"Demon": -0.001,
		"Witch": 0.003,
		"Apprentice": 0.0015,
		"Elemental": 0.01,
		//"Mushy": 0.001,
		"AncientRobot": -0.001,
	},
	"Leather": {
		"Angel": 0.002,
		"Demon": -0.001,
		"Elf": 0.001,
		"Dragon": 0.005,
		"Bandit": 0.01,
		"Elemental": 0.002,
		"AncientRobot": 0.001,
	},
	"Latex": {
		"Angel": 0.002,
		"Demon": -0.001,
		"Maidforce": 0.0015,
		"Alchemist": 0.01,
		"Nevermere": 0.003,
		"AncientRobot": 0.001,
	},
	"Will": {
		"Angel": 0.007,
		"Demon": -0.005,
		"Elf": 0.005,
		//"Mushy": 0.0035,
		"Bast": 0.005,
		"Apprentice": 0.001,
		"AncientRobot": -0.001,
	},
	"Conjure": {
		"Angel": 0.007,
		"Demon": -0.001,
		"Alchemist": 0.002,
		"Witch": 0.003,
		"Apprentice": 0.0015,
		"Dressmaker": 0.005,
		"AncientRobot": -0.001,
	},
	"Illusion": {
		"Angel": 0.007,
		"Demon": -0.001,
		"Witch": 0.003,
		"Apprentice": 0.0015,
		"Maidforce": 0.007,
		"Bountyhunter": 0.002,
		"AncientRobot": -0.001,
		//"Ghost": 0.005,
	},
};

let KinkyDungeonGoddessRep: Record<string, number> = {};

let KinkyDungeonRescued: Record<string, boolean> = {};
let KinkyDungeonAid: Record<string, boolean> = {};

let KDRepSelectionMode = "";

let KDBlessedRewards: Record<string, string[]> = {
	"Latex": ["TheEncaser"],
	"Rope": ["MoiraiScissors"],
	"Metal": ["BondageBuster"],
	"Leather": ["Dragonslaver"],
	"Will": ["MessengerOfLove"],
	"Elements": ["FourSeasons",],
	"Conjure": ["Arbiter"],
	"Illusion": ["Dreamcatcher"],
};

/**
 * Returns whether or not the player meets a requirement for a pearl reward chest
 */
function KDPearlRequirement(): boolean {
	let has = false;
	for (let rep of Object.entries(KinkyDungeonGoddessRep)) {
		let rewards = KDBlessedRewards[rep[0]];
		if (rewards) {
			let missing = true;
			for (let r of rewards) {
				if (KinkyDungeonInventoryGet(r)) {
					missing = false;
					break;
				}
				for (let c of Object.values(KDGameData.Containers)) {
					if (c.location?.mapY < 1 && c.items[r]) {
						missing = false;
						break;
					}
				}
				if (missing) break;
			}
			if (missing && rep[1] > 45) {
				has = true;
				break;
			}
		}

	}
	return has;
}

/**
 * Returns whether or not the player meets a requirement for ANY pearl reward
 */
function KDGetBlessings(): string[] {
	let blessings = [];
	for (let rep of Object.entries(KinkyDungeonGoddessRep)) {
		let rewards = KDBlessedRewards[rep[0]];
		if (rewards) {
			if (rep[1] > 45) {
				blessings.push(rep[0]);
				break;
			}
		}

	}
	return blessings;
}

function KinkyDungeonInitReputation() {
	KinkyDungeonGoddessRep = {"Ghost" : -50, "Prisoner" : -50, "Frustration" : -50, "Passion" : -50};
	for (let shrine in KinkyDungeonShrineBaseCosts) {
		KinkyDungeonGoddessRep[shrine] = KinkyDungeonStatsChoice.get("Cursed") ? -25 : 0;
	}
	if (KinkyDungeonStatsChoice.get("Wanted")) KinkyDungeonChangeRep("Prisoner", 100);
	if (KinkyDungeonStatsChoice.get("Submissive")) KinkyDungeonChangeRep("Ghost", 100);

	if (KinkyDungeonStatsChoice.get("Unchained")) KinkyDungeonChangeRep("Metal", 10);
	if (KinkyDungeonStatsChoice.get("Artist")) KinkyDungeonChangeRep("Rope", 10);
	if (KinkyDungeonStatsChoice.get("Slippery")) KinkyDungeonChangeRep("Latex", 10);
	if (KinkyDungeonStatsChoice.get("Escapee")) KinkyDungeonChangeRep("Leather", 10);

	if (KinkyDungeonStatsChoice.get("Damsel")) KinkyDungeonChangeRep("Metal", -10);
	if (KinkyDungeonStatsChoice.get("Bunny")) KinkyDungeonChangeRep("Rope", -10);
	if (KinkyDungeonStatsChoice.get("Doll")) KinkyDungeonChangeRep("Latex", -10);
	if (KinkyDungeonStatsChoice.get("Dragon")) KinkyDungeonChangeRep("Leather", -10);
}

/**
 * @param Amount
 */
function KinkyDungeonRepName(Amount: number): string {
	let name = "";

	if (Amount >= 10) name = "Thankful";
	if (Amount >= 30) name = "Pleased";
	if (Amount >= 45) name = "Blessed";
	if (Amount < KDANGER) name = "Angered";
	if (Amount < KDRAGE) name = "Enraged";
	if (Amount < -45) name = "Cursed";

	return TextGet("KinkyDungeonRepName" + name);
}


/**
 * @param Amount
 */
function KinkyDungeonRepNameFaction(Amount: number): string {
	let name = "";

	if (Amount > 0.2) name = "Thankful";
	if (Amount >= 0.4) name = "Pleased";
	if (Amount > 0.7) name = "Blessed";
	if (Amount < -0.1) name = "Angered";
	if (Amount <= -0.5) name = "Enraged";
	if (Amount < -0.9) name = "Cursed";

	return TextGet("KinkyDungeonRepNameFaction" + name);
}

/**
 * @param Rep
 * @param Amount
 */
function KinkyDungeonChangeFactionRep(Rep: string, Amount: number): boolean {
	let data = {
		Rep: Rep,
		Amount: Amount,
	};
	KinkyDungeonSendEvent("changeFactionRep", data);
	Rep = data.Rep;
	Amount = data.Amount;
	let last = KDFactionRelation("Player", Rep);
	KDChangeFactionRelation("Player", Rep, Amount);
	let curr = KDFactionRelation("Player", Rep);

	if (curr != last) {
		let amount = 0.5*(Amount > 0 ? Math.ceil : Math.floor)((curr - last)*10000)/100; // 0.5% due to the fact that the scale is -1 to +1 but it gets mapped from 0 to 100%
		KinkyDungeonSendFloater({x: 1100, y: 800 - KDRecentRepIndex * 40}, `${amount > 0 ? '+' : ''}${amount}% ${TextGet("KinkyDungeonFaction" + Rep)} rep`, "white", 5, true);
		KDRecentRepIndex += 1;
	}

	return false;
}

/**
 * @param Rep
 * @param Amount
 */
function KinkyDungeonChangeRep(Rep: string, Amount: number): boolean {
	let data = {
		Rep: Rep,
		Amount: Amount,
	};
	KinkyDungeonSendEvent("changeRep", data);
	Rep = data.Rep;
	Amount = data.Amount;
	if (KinkyDungeonGoddessRep[Rep] != undefined) {
		let last = KinkyDungeonGoddessRep[Rep];
		let minimum = (Rep == "Ghost" && KinkyDungeonStatsChoice.get("Submissive")) || (Rep == "Prisoner" && KinkyDungeonStatsChoice.get("Wanted")) ? 20: -50;
		let maximum = (KinkyDungeonStatsChoice.get("Cursed") && !KDStatRep.includes(Rep)) ? -25: 50;
		//let target = -50;
		//let interval = 0.02;
		let start = KinkyDungeonGoddessRep[Rep];
		//if (Amount >= 0) target = 50;
		/*for (let i = 0; i < Math.abs(Amount); i++) {
			KinkyDungeonGoddessRep[Rep] += (target - KinkyDungeonGoddessRep[Rep]) * interval;
		}*/
		KinkyDungeonGoddessRep[Rep] += Amount;
		KinkyDungeonGoddessRep[Rep] = Math.min(maximum, Math.max(minimum, KinkyDungeonGoddessRep[Rep]));
		if (Math.abs(KinkyDungeonGoddessRep[Rep] - start) > 0.1) {
			let value = KinkyDungeonGoddessRep[Rep] - start;
			let amount = Math.round((value)*10)/10;
			KinkyDungeonSendFloater({x: 700, y: 800 - KDRecentRepIndex * 40}, `${amount > 0 ? '+' : ''}${amount}% ${TextGet("KinkyDungeonShrine" + Rep)} ${!KDStatRep.includes(Rep) ? TextGet("KDRep") : ""}`, "white", 5, true);
			KDRecentRepIndex += 1;
		}

		if (KDFactionGoddess[Rep]) {
			for (const [k, v] of Object.entries(KDFactionGoddess[Rep]) as [string, number][]) {
				let mult = (Amount > 0 ? 1 : 1);
				if (Amount > 0) {
					const relation = KDFactionRelation("Player", k);
					if (relation <= -0.25)      mult *= 0.5;
					else if (relation <= -0.1)  mult *= 0.75;
					else if (relation >= 0.55)  mult *= 0;
					else if (relation >= 0.35)  mult *= 0.25;
					else if (relation >= 0.25)  mult *= 0.5;
					else if (relation >= 0.1)   mult *= 0.75;
				}
				KDChangeFactionRelation("Player", k, v * mult * Amount);
			}
		}

		if (KinkyDungeonGoddessRep[Rep] != last) return true;
		return false;
	}
	return false;
}

function KinkyDungeonHandleReputation(): boolean {
	return true;
}

function KinkyDungeonDrawReputation() {

	let xOffset = -125;
	KDDrawLoreRepTabs(xOffset);
	//KinkyDungeonDrawMessages(true);

	let i = 0;
	let XX = 0;
	let spacing = 600 / Object.keys(KinkyDungeonGoddessRep).length;
	let yPad = 50;
	let tooltip = "";

	if (!KDRepSelectionMode) {
		tooltip = KinkyDungeonDrawFactionRep();
	}

	for (let rep in KinkyDungeonGoddessRep) {
		let value = KinkyDungeonGoddessRep[rep];

		if (rep) {
			let color = "#e7cf1a";
			let goddessColor = "white";
			let goddessSuff = "";
			if (KDRepColor[rep]) color = KDRepColor[rep];
			else {
				if (value < -10) {
					if (value < -30) color = "#ff5277";
					else color = "#ff8933";
				} else if (value >= 10) {
					if (value >= 30) color = "#4fd658";
					else color = "#9bd45d";
				}
			}



			if (tooltip) {
				goddessColor = "#888888";
				if (KDFactionGoddess[rep] && KDFactionGoddess[rep][tooltip] != 0) {
					goddessColor = KDFactionGoddess[rep][tooltip] > 0 ? "#ffffff" : (KDFactionGoddess[rep][tooltip] < 0 ? "#ff5555" : "#999999");
					if (KDFactionGoddess[rep][tooltip] >= 0.006) goddessSuff = "+++";
					else if (KDFactionGoddess[rep][tooltip] >= 0.003) goddessSuff = "++";
					else if (KDFactionGoddess[rep][tooltip] >= 0.00001) goddessSuff = "+";
					else if (KDFactionGoddess[rep][tooltip] <= -0.00001) goddessSuff = "-";
					else if (KDFactionGoddess[rep][tooltip] <= 0.004) goddessSuff = "--";
					else if (KDFactionGoddess[rep][tooltip] <= 0.006) goddessSuff = "---";
				}
			}
			let suff = "";
			if (!KDStatRep.includes(rep)) suff = "" + KinkyDungeonRepName(value);
			DrawTextKD(TextGet("KinkyDungeonShrine" + rep) + goddessSuff, canvasOffsetX_ui + xOffset + XX + 20, yPad + canvasOffsetY_ui + spacing * i, goddessColor, KDRepNameColor[rep] || "#000000", undefined, "left");
			if (suff) {
				DrawTextFitKD(suff, canvasOffsetX_ui + xOffset + 275 + XX + 240, yPad + canvasOffsetY_ui + spacing * i, 100, "white", "black", undefined, "left");
			}
			DrawProgressBar(canvasOffsetX_ui + xOffset + 275 + XX, yPad + canvasOffsetY_ui + spacing * i - spacing/4, 200, spacing/2, 50 +
				(rep == "Prisoner" ? KDGetEffSecurityLevel(undefined, true) :
				value), color, KDTextGray2);
			if (KinkyDungeonShrineBaseCosts[rep])
				KDDrawRestraintBonus(rep, canvasOffsetX_ui + xOffset + 275 + XX - 50, yPad + canvasOffsetY_ui + spacing * i, undefined, 24);

			if (MouseIn(canvasOffsetX_ui + xOffset + XX, yPad + canvasOffsetY_ui + spacing * i - 1 - spacing/2, 500, spacing - 2)) {
				DrawTextFitKD(TextGet("KDRepDescription" + rep).replace("MNFCTN", TextGet("KinkyDungeonFaction" + KDGetMainFaction())), 1100, 880, 1250, "#ffffff", "#000000");
			}
			let v2 = Math.round(KDGetEffSecurityLevel() - value);
			let numSuff = rep == "Prisoner" ? `${v2 >= 0 ? '+' + v2 : v2} ` : " ";
			DrawTextKD(" " + (Math.round(value)+50) + numSuff, canvasOffsetX_ui + xOffset + 275 + XX + 100,  2+yPad + canvasOffsetY_ui + spacing * i, "white", "black");

			if (KDFactionRepIndex < 0.1) {
				if (KDRepSelectionMode == "") {
					/*DrawButtonKDEx("rescueswitch", (bdata) => {
						if (KinkyDungeonAllRestraint().length > 0)
							KDRepSelectionMode = "Rescue";
						return true;
					}, true, 600, 800, 250, 50, TextGet("KinkyDungeonAskRescue"), KinkyDungeonAllRestraint().length > 0 ? "white" : "#999999");
					//DrawButtonVis(1200, 800, 250, 50, TextGet("KinkyDungeonAskPenance"), "white");
					//DrawButtonVis(900, 800, 250, 50, TextGet("KinkyDungeonAskAid"), "white");
					DrawButtonKDEx("champswitch", (bdata) => {
						KDRepSelectionMode = "Champion";
						return true;
					}, true, 900, 800, 250, 50, TextGet("KinkyDungeonAskChampion"), "white");*/
				} else {
					DrawButtonKDEx("backtorep", (_bdata) => {
						KDRepSelectionMode = "";
						return true;
					}, true, 600, 800, 550, 50, TextGet("KinkyDungeonBack"), "white");
				}

				if (KinkyDungeonShrineBaseCosts[rep]) {
					//DrawButtonVis(canvasOffsetX_ui + xOffset + 275 + XX + 400, yPad + canvasOffsetY_ui + spacing * i - 20, 100, 40, TextGet("KinkyDungeonAid"), value > 10 ? "white" : "pink");
					if (KDRepSelectionMode == "Rescue") {
						DrawButtonKDEx("rep_rescue" + rep, (_bdata) => {
							if (KinkyDungeonCanRescue(rep, value)) {
								if (KDSendInput("rescue", {rep: rep, value: value}) != "FailRescue") {
									KinkyDungeonDrawState = "Game";
									KDRepSelectionMode = "";
								}
							}
							return true;
						}, true, canvasOffsetX_ui + xOffset + 275 + XX + 520, yPad + canvasOffsetY_ui + spacing * i - 20, 150, 40, TextGet("KinkyDungeonRescue"), (KinkyDungeonCanRescue(rep, value)) ? "white" : (KinkyDungeonAllRestraint().length > 0 && !KinkyDungeonRescued[rep] ? "pink" : "#999999"));
						if (MouseIn(canvasOffsetX_ui + xOffset + 275 + XX + 520, yPad + canvasOffsetY_ui + spacing * i - 20, 150, 40)) {
							DrawTextFitKD(TextGet("KinkyDungeonRescueDesc"), 1100, 880, 1250, "white", "black");
							// Rescue
						}
					}
					if (KDRepSelectionMode == "Champion") {
						let isChampion = KDGameData.Champion == rep;
						DrawButtonKDEx("rep_champ" + rep, (_bdata) => {
							KDSendInput("champion", {rep: rep, value: value});
							return true;
						}, true, canvasOffsetX_ui + xOffset + 275 + XX + 520, yPad + canvasOffsetY_ui + spacing * i - 20, 150, 40, TextGet(isChampion ? "KinkyDungeonChampionCurrent" : "KinkyDungeonChampionSwitch"),
							(isChampion) ? "white" : "#999999");
						if (MouseIn(canvasOffsetX_ui + xOffset + 275 + XX + 520, yPad + canvasOffsetY_ui + spacing * i - 20, 150, 40)) {
							DrawTextFitKD(TextGet("KinkyDungeonChampionDesc"), 1100, 880, 1250, "white", "black");
							// Rescue
						}
					}

					//DrawButtonVis(canvasOffsetX_ui + xOffset + 275 + XX + 690, yPad + canvasOffsetY_ui + spacing * i - 20, 150, 40, TextGet("KinkyDungeonPenance"), "white");
				}
			} else KDRepSelectionMode = "";

			i++;
		}
	}
}

let KDFactionRepIndex = 0;
let KDMaxFactionsPerBar = 14;

function KinkyDungeonDrawFactionRep() {
	let xOffset = -100;
	let i = 0;
	let XX = 675;
	let spacing = 42;
	let yPad = 45;
	let barSpacing = 375;
	let tooltip = "";

	let index = 0;

	for (let e of Object.keys(KinkyDungeonFactionRelations.Player)) {
		let rep = e;
		if (rep && !KinkyDungeonHiddenFactions.has(rep)) {
			index++;
			if (index < KDFactionRepIndex * KDMaxFactionsPerBar + 1) continue;
			if (index > KDFactionRepIndex * KDMaxFactionsPerBar + KDMaxFactionsPerBar) continue;
			if (!tooltip && MouseIn(canvasOffsetX_ui + xOffset + XX, yPad + canvasOffsetY_ui + spacing * i - spacing/2, barSpacing + 200, yPad)) {
				tooltip = rep;
			}
			i++;
		}
	}
	i = 0;
	index = 0;

	DrawButtonKDEx("FactionIndexUp", () => {
		KDFactionRepIndex -= 0.5;
		return true;
	}, KDFactionRepIndex > 0,
	1802 + xOffset, 140, 90, 40, "", KDFactionRepIndex > 0 ? "white" : "#888888", KinkyDungeonRootDirectory + "Up.png");

	DrawButtonKDEx("FactionIndexDown", () => {
		KDFactionRepIndex += 0.5;
		return true;
	}, KDFactionRepIndex < (Object.keys(KinkyDungeonFactionRelations.Player).length - KDHiddenFactions.length) / KDMaxFactionsPerBar,
	1802 + xOffset, 790, 90, 40, "", KDFactionRepIndex < (Object.keys(KinkyDungeonFactionRelations.Player).length - KDHiddenFactions.length) / KDMaxFactionsPerBar ? "white" : "#888888", KinkyDungeonRootDirectory + "Down.png");

	let text = false;

	for (let e of Object.keys(KinkyDungeonFactionRelations.Player)) {
		let rep = e;

		if (rep && !KinkyDungeonHiddenFactions.has(rep)) {
			index++;
			if (index < KDFactionRepIndex * KDMaxFactionsPerBar + 1) continue;
			if (index > KDFactionRepIndex * KDMaxFactionsPerBar + KDMaxFactionsPerBar) continue;

			let value = KinkyDungeonFactionRelations.Player[rep];
			let color = "#e7cf1a";
			if (value <= -0.1) {
				if (value <= -0.5) color = "#ff5277";
				else color = "#ff8933";
			} else if (value >= 0.1) {
				if (value >= 0.5) color = "#4fd658";
				else color = "#9bd45d";
			}
			let suff = KinkyDungeonRepNameFaction(value);
			let tcolor = "white";
			switch (rep) {
				case "Bountyhunter": tcolor ="#448844"; break;
				case "Bandit": tcolor ="orange"; break;
				case "Alchemist": tcolor ="lightgreen"; break;
				case "Nevermere": tcolor ="teal"; break;
				case "Apprentice": tcolor ="lightblue"; break;
				case "Dressmaker": tcolor ="#ceaaed"; break;
				case "Witch": tcolor ="purple"; break;
				case 'Elemental': tcolor ="#f1641f"; break;
				case 'Dragon': tcolor ="#b9451d"; break;
				case 'Maidforce': tcolor ="white"; break;
				case "Bast": tcolor ="#ff5277"; break;
				case "Elf": tcolor ="#42a459"; break;
				//case 'Mushy': tcolor ="cyan"; break;
				case 'AncientRobot': tcolor ="grey"; break;
			}

			if (MouseIn(canvasOffsetX_ui + xOffset + XX, yPad + canvasOffsetY_ui + spacing * i - spacing/2, barSpacing + 200, yPad)) {
				let allytext = "";
				let enemytext = "";
				let friendstext = "";
				for (let ee of Object.keys(KinkyDungeonFactionRelations.Player)) {
					if (!KinkyDungeonHiddenFactions.has(ee)) {
						if (rep != ee && KDFactionRelation(rep, ee) >= 0.5) {
							if (allytext) allytext += ", ";
							allytext += TextGet("KinkyDungeonFaction" + ee);
						}
						if (rep != ee && KDFactionRelation(rep, ee) > 0.15 && KDFactionRelation(rep, ee) < 0.5) {
							if (friendstext) friendstext += ", ";
							friendstext += TextGet("KinkyDungeonFaction" + ee);
						}
						if (rep != ee && KDFactionRelation(rep, ee) <= -0.5) {
							if (enemytext) enemytext += ", ";
							enemytext += TextGet("KinkyDungeonFaction" + ee);
						}
					}
				}
				let loc = {x: 1175, y: 812, fit: 600};
				if (KDFactionRepIndex > 0.1) {
					loc = {x: canvasOffsetX_ui + xOffset, y: 820, fit: 1400};
				}
				if (!text) {
					if (enemytext) {
						text = true;
						DrawTextFitKD(TextGet("KDFriendsWith") + friendstext, loc.x, loc.y, loc.fit, "white", KDTextGray1, 20, "left");
					}
					if (allytext) {
						text = true;
						DrawTextFitKD(TextGet("KDAlliedWith") + allytext, loc.x, loc.y + 30, loc.fit, "white", KDTextGray1, 20, "left");
					}
					if (enemytext) {
						text = true;
						DrawTextFitKD(TextGet("KDHostileWith") + enemytext, loc.x, loc.y + 60, loc.fit, "white", KDTextGray1, 20, "left");
					}
				}

			}

			if (tooltip && tooltip != rep) {
				tcolor = "gray";
				if (KDFactionRelation(rep, tooltip) <= -0.5) tcolor = "#ff5277";
				else if (KDFactionRelation(rep, tooltip) <= -0.25) tcolor = "orange";
				else if (KDFactionRelation(rep, tooltip) <= -0.1) tcolor = "yellow";
				else if (KDFactionRelation(rep, tooltip) >= 0.5) tcolor = "cyan";
				else if (KDFactionRelation(rep, tooltip) >= 0.25) tcolor = "#569eb8";
				else if (KDFactionRelation(rep, tooltip) >= 0.1) tcolor = "#597085";
			} else if (tooltip == rep) {
				tcolor = "white";
			}

			DrawTextKD(TextGet("KinkyDungeonFaction" + rep), canvasOffsetX_ui + xOffset + XX, yPad + canvasOffsetY_ui + spacing * i, tcolor, KDTextGray1, undefined, "left");
			if (suff) {
				DrawTextFitKD(suff, canvasOffsetX_ui + xOffset + barSpacing + XX + 250, yPad + canvasOffsetY_ui + spacing * i, 100, "white", "black", undefined, "left");
			}
			DrawProgressBar(canvasOffsetX_ui + xOffset + barSpacing + XX, yPad + canvasOffsetY_ui + spacing * i - spacing/4, 200, spacing/2, 50 + value * 50, color, KDTextGray2);

			DrawTextKD(" " + (Math.round(value * 50)+50) + " ", canvasOffsetX_ui + xOffset + barSpacing + XX + 100,  1+yPad + canvasOffsetY_ui + spacing * i, "white", "black");


			i++;
			if (i > KDMaxFactionsPerBar + 1) {
				break;
			}
		}

	}
	return tooltip;
}

/**
 * Current costs multipliers for shrines
 */
let KinkyDungeonPenanceCosts: Record<string, number> = {};
let KinkyDungeonPenanceRepBonus = 5;
let KinkyDungeonPenanceRepBonusFail = 1;
let KinkyDungeonPenanceCostGrowth = 50;
let KinkyDungeonPenanceCostDefault = 200;

/**
 * @param rep
 */
function KinkyDungeonPenanceCost(rep: string): number {
	if (KinkyDungeonGoddessRep[rep]) {
		if (KinkyDungeonPenanceCosts[rep]) {
			return KinkyDungeonPenanceCosts[rep];
		}
	}
	return KinkyDungeonPenanceCostDefault;
}

/**
 * @param rep
 * @param value
 */
function KinkyDungeonCanPenance(_rep: string, value: number): boolean {
	return value < 40 && !KDGameData.KinkyDungeonPenance && KDMapData.Bullets.length < 1;
}

/**
 * @param rep
 * @param value
 */
function KinkyDungeonAidManaCost(_rep: string, value: number): number {
	let percent = (value + 50)/100;
	return Math.ceil((1 - KinkyDungeonStatMana/KinkyDungeonStatManaMax) * 15 * Math.max(0.3, Math.min(1, 1.3 - percent)));
}

/**
 * @param rep
 * @param value
 */
function KinkyDungeonAidManaAmount(_rep: string, _value: number): number {
	return KinkyDungeonStatManaMax - KinkyDungeonStatMana;//1 + Math.floor(19 * (value + 50) / 100);
}

/**
 * @param rep
 * @param value
 */
function KinkyDungeonCanAidMana(_rep: string, value: number): boolean {
	return value > -30 && KinkyDungeonStatMana < KinkyDungeonStatManaMax;
}

function KinkyDungeonRescueTiles(): { x: number, y: number }[] {
	let tiles: { x: number, y: number }[] = [];
	for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++)
		for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
			if (X != 0 || Y != 0) {
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && KinkyDungeonNoEnemy(X, Y, true)) {
					tiles.push({x:X, y:Y});
				}
			}
		}
	return tiles;
}

/**
 * @param rep
 * @param value
 */
function KinkyDungeonCanRescue(rep: string, value: number): boolean {
	return KinkyDungeonAllRestraint().length > 0 && value > KDRAGE && !KinkyDungeonRescued[rep] && KinkyDungeonRescueTiles().length > 0;
}

/**
 * @param delta
 */
function KinkyDungeonUpdateAngel(_delta: number): void {
	// Remove it
	if (KinkyDungeonFlags.get("AngelHelp") > 0 && KinkyDungeonFlags.get("AngelHelp") < 5) {
		for (let t of Object.entries(KDMapData.Tiles)) {
			if (t[1].Type == "Angel") {
				let x = parseInt(t[0].split(',')[0]);
				let y = parseInt(t[0].split(',')[1]);
				if (x && y) {
					if (t[0] == KinkyDungeonTargetTile) {
						KinkyDungeonTargetTile = null;
						KinkyDungeonTargetTileLocation = "";
					}
					KinkyDungeonTilesDelete(t[0]);
					KinkyDungeonMapSet(x, y, '0');
				}
			}
		}
	}
}

/**
 * @param x
 * @param y
 */
function KinkyDungeonCreateAngel(x: number, y: number) {
	let point = KinkyDungeonGetNearbyPoint(x, y, true, undefined, true);
	if (point) {
		let Enemy = KinkyDungeonGetEnemyByName("Angel");
		let angel = {summoned: true, Enemy: Enemy, id: KinkyDungeonGetEnemyID(),
			x:point.x, y:point.y, gx: point.x, gy: point.y,
			hp: (Enemy && Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};
		KDGameData.KinkyDungeonAngel = angel.id;
		KDAddEntity(angel);
	}
}
