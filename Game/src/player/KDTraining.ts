'use strict';
let KDBaseTrainingMinRatioPercent = 0.5;

let KDTrainingTypes = [
	"Heels",
	"Corset",
];

let KDTrainingTypeProperties: Record<string, KDTrainingProps> = {
	Heels: {
		color: KDBaseTeal,
		prereq: (player) => {return true;},
		effectVal: (player) => {
			let mult = 100 * KDHeelTrainingMult(player, KDHeelTrainingEffectMultBase, false);
			return "-" + Math.round(100 - 100 * mult) + "%";
		}
		
	},
	Corset: {
		color: KDBaseGreen,
		prereq: (player) => {return true;},
		effectVal: (player) => {
			return "-" + Math.round(-100 * (1 - KDCorsetSPReductionMult(player, false))) + "%";
		},
	},
}

interface KDTrainingProps {
	color: string,
	showBuff?: boolean,
	dontShowProgress?: boolean,
	prereq: (player: entity) => boolean,
	effectVal: (player: entity) => string,
	
	calc_xpnext?: (player: entity) => number,
	calc_xpmax?: (player: entity) => number,
	
	
}

function KDGetHeelTraining(buffs: boolean = true): number {
	if (!KDGameData.Training) KDGameData.Training = {};
	return (KDGameData.Training?.Heels?.training_stage || 0) + (buffs ? KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "HeelTraining") : 0);
}

function KDTrip(delta: number) {
	KinkyDungeonSendTextMessage(10, TextGet("KDTrip"), KDBaseRed, 5);
	KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns + delta, delta + KDTripDuration());
	KDGameData.Balance = KDGetRecoverBalance();
	KinkyDungeonMakeNoise(4, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
}

function KDGetRecoverBalance(): number {
	return (0.1 + 0.4 * KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax) * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "TripBalanceRecovery"));
}

function KDGetBalanceRate(): number {
	let mult = 1;
	if (KinkyDungeonCanStand() && KinkyDungeonGetAffinity(false, "Wall", undefined, undefined)) {
		mult *= 2;
	}
	return mult * (0.15 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RegenBalance")) * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RegenBalanceMult"));
}
function KDTripDuration(): number {
	let mult = 4 / (4 + KDGetHeelTraining());
	return Math.max(2, Math.round(5 * mult));
}

let KDHeelTrainingEffectMultBase = 1;

function KDGetBalanceCost(trig: string, player: entity): number {
	let mult = KDHeelTrainingEffectMultBase;//KinkyDungeonStatsChoice.has("HeelWalker") ? 0.5 : 1;
	if (KinkyDungeonStatsChoice.get("PoorBalance")) mult *= 1.7;
	if (!KinkyDungeonIsArmsBound()) mult *= 0.6;

	if (trig && KDBalanceLossHalvedByWall[trig]) {
		if (KinkyDungeonGetAffinity(false, "Wall", undefined, undefined)) {
			mult *= 0.6;
		}
	}

	return KDGameData.HeelPowerEffective * (KDHeelTrainingMult(player, mult) - (0.001));
}

function KDHeelTrainingMult(player: entity, mult: number, buffs: boolean = true) {
	let training = KDGetHeelTraining(buffs);
	return 0.01*mult*10/(10+training);
}

/** 50 bondage resist halves the balance cost of resisting, per power */
let KDBaseBondageResistBalanceFactor = 5;
let KDBaseBondageResistBalanceAmount = 0.025;

function KDGetBalanceCost_BondageResist(resist: number, ignored: number, power: number): number {
	let numerator = KDBaseBondageResistBalanceFactor;
	let denominator = KDBaseBondageResistBalanceFactor + Math.max(resist - ignored, 0);

	let ratio = numerator / denominator;


	power = Math.min(Math.max(0, power), 25);
	if (power < 10) power = Math.ceil(power >= 1.1 ? power*0.33 + 6.67 : 2); // averages
	return ratio * KDBaseBondageResistBalanceAmount * power;
}

function KDGetTrainingPercentage(name: string, data: KDTrainingRecord, player: entity, useMin: boolean = false, noSoftScale = false) {
	if (!data) return 0;
	let tt = (Math.max(0, data.turns_trained * 1.11
		- data.turns_skipped)/data.turns_total);
	if (useMin && data.turns_total > 0) {
		tt = Math.max(tt, KDGetTrainingMinRatioPercent(name, data, player)
		* (data.best_ratio||0)) * Math.max(0, 1 - data.turns_skipped/Math.max(data.turns_total, data.turns_skipped + data.turns_trained))
	}
	let trainingPercentage = Math.min(1, 
		data.turns_total/(noSoftScale ? 1 : KDTrainingSoftScale))
		* tt;

	if (KinkyDungeonStatsChoice.get("Mastery" + name)) trainingPercentage *= 0.4;
	return trainingPercentage;
}


function KDGetTrainingMinRatioPercent(name: string, data: KDTrainingRecord, player: entity) {
	return KDBaseTrainingMinRatioPercent;
}

function KDGetTrainingMinRatioPercentTick(name: string, data: KDTrainingRecord, player: entity) {
	return data.turns_total/(data.turns_total + KDTrainingSoftScale);
}

/**
 * Goes thru all training categories and advances them by an amount, and resets the turns
 */
function KDAdvanceTraining(player: entity): void {
	if (!KDGameData.Training) KDGameData.Training = {};
	for (let entry of Object.keys(KDGameData.Training)) {
		KDAdvanceSingleTraining(entry, player);
		

	}
	TickProgressRecord();
}

function KDAdvanceSingleTraining(training: string, player: entity) {
	let data = KDGameData.Training[training];
	//let training = entry[0];
	if (data.turns_total == 0) return; // No advance
	let trainingPercentage = KDGetTrainingPercentage(
		training, data, player, true);
	data.training_points += 1 * trainingPercentage;
	data.turns_total = 0;
	data.turns_skipped = 0;
	data.turns_trained = 0;
	data.best_ratio = 0;

	KDCheckLevelUp(training, player);
	
}

function KDCheckLevelUp(training: string, player: entity) {
	let data = KDGameData.Training[training];
	while (data.training_points > data.training_stage + 1) {

		KinkyDungeonSendFloater({x: 1100, y: 600 - KDRecentRepIndex * 40}, 
			TextGet("KDLevelUpStat", {
				STAT: TextGet("KDProgressItem_Training" + training)
			}), KDBaseWhite, 5, true);
		KDRecentRepIndex += 1;

		data.training_stage += 1;
		data.training_points -= data.training_stage;

		LevelUpProgressRecord("Training", training);
	}
}

/**
 * for player ONLY
 * @param Name
 * @param trained
 * @param skipped
 * @param total
 * @param bonus - Multiplier for turns trained or skipped
 */
function KDTickTraining(Name: string, trained: boolean,
	skipped: boolean, total: number, bonus: number = 1, player?: entity): void {
	if (!player) player = KDPlayer();
	if (!KDGameData.Training) KDGameData.Training = {};
	if (!KDGameData.Training[Name]) {
		KDGameData.Training[Name] = {
			best_ratio: 0,
			training_points: 0,
			training_stage: 0,
			turns_skipped: 0,
			turns_total: 0,
			turns_trained: 0,
		};
	}
	KDGameData.Training[Name].turns_trained += trained ? total * bonus : 0;
	KDGameData.Training[Name].turns_skipped += skipped ? total * bonus : 0;
	KDGameData.Training[Name].turns_total += total;
	if (!KDGameData.Training[Name].best_ratio) KDGameData.Training[Name].best_ratio = 0;
	if (trained && KDGameData.Training[Name].turns_total > 0) {
		KDGameData.Training[Name].best_ratio = Math.max(KDGameData.Training[Name].best_ratio || 0,
			KDGetTrainingMinRatioPercentTick(Name, KDGameData.Training[Name], player) *
			KDGetTrainingPercentage(Name, {
				best_ratio: 0,
				training_points: KDGameData.Training[Name].training_points,
				training_stage: KDGameData.Training[Name].training_stage,
				turns_skipped: 0,
				turns_total: total,
				turns_trained: total * bonus,
			}, player, false, true));
	}
}

/**
 * for player ONLY
 * @param Name
 * @param trained
 * @param skipped
 * @param total
 * @param bonus - Multiplier for turns trained or skipped
 */
function KDAddFlatTraining(Name: string, amount: number, player?: entity): void {
	if (!player) player = KDPlayer();
	if (!KDGameData.Training) KDGameData.Training = {};
	if (!KDGameData.Training[Name]) {
		KDGameData.Training[Name] = {
			best_ratio: 0,
			training_points: 0,
			training_stage: 0,
			turns_skipped: 0,
			turns_total: 0,
			turns_trained: 0,
		};
	}
	if (amount > 0)
		KDGameData.Training[Name].training_points += amount;
	else 
		KDGameData.Training[Name].training_points = Math.max(KDGameData.Training[Name].training_points - amount);
	
	KDCheckLevelUp(Name, player);
}


/** This many training turns are requred, any less is scaled down by this amount */
let KDTrainingSoftScale = 10;


function KDAddLeashWalkXP(player: entity) {
	let xp = 1 + .25 * KDGameData.Training["Heels"]?.training_stage;
	if (AddProgressFloor("Training", "Heels", 
		{
			key: "Heels_LeashWalk",
			tag: "LeashWalk",
			data: {
				level: KDGameData.Training["Heels"]?.training_stage,
				floor: KDGameData.HighestLevelCurrent,
			},
			desc: "Heels_LeashWalk",
			value: Math.round(xp * 100)}, false)) {
			KDAddFlatTraining("Heels", xp);
		}
}