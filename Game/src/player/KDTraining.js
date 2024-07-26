'use strict';

let KDTrainingTypes = [
	"Heels",
];

function KDGetHeelTraining() {
	if (!KDGameData.Training) KDGameData.Training = {};
	return (KDGameData.Training?.Heels?.training_stage || 0) + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "HeelTraining");
}

function KDTrip(delta) {
	KinkyDungeonSendTextMessage(10, TextGet("KDTrip"), "#ff5555", 5);
	KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns + delta, delta + KDTripDuration());
	KDGameData.Balance = KDGetRecoverBalance();
	KinkyDungeonMakeNoise(4, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
}

function KDGetRecoverBalance() {
	return (0.1 + 0.4 * KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax) * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "TripBalanceRecovery"));
}

function KDGetBalanceRate() {
	return (0.15 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RegenBalance")) * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RegenBalanceMult"));
}
function KDTripDuration() {
	let mult = 4 / (4 + KDGetHeelTraining());
	return Math.max(2, Math.round(5 * mult));
}

function KDGetBalanceCost() {
	let mult = 1;//KinkyDungeonStatsChoice.has("HeelWalker") ? 0.5 : 1;
	if (KinkyDungeonStatsChoice.get("PoorBalance")) mult *= 1.7;
	if (!KinkyDungeonIsArmsBound()) mult *= 0.5;

	let training = KDGetHeelTraining();
	return KDGameData.HeelPower * (0.01*mult*5/(5+training) - (0.001));
}

/**
 * Goes thru all training categories and advances them by an amount, and resets the turns
 */
function KDAdvanceTraining() {
	if (!KDGameData.Training) KDGameData.Training = {};
	for (let entry of Object.entries(KDGameData.Training)) {
		//let training = entry[0];
		let data = entry[1];
		if (data.turns_total == 0) continue; // No advance
		let trainingPercentage = Math.min(1, data.turns_total/KDTrainingSoftScale)
			* (Math.max(0, data.turns_trained * 1.11 - data.turns_skipped)/data.turns_total);
		if (KinkyDungeonStatsChoice.get("Mastery" + entry[0])) trainingPercentage *= 0.4;
		data.training_points += 1 * trainingPercentage;
		data.turns_total = 0;
		data.turns_skipped = 0;
		data.turns_trained = 0;

		while (data.training_points > data.training_stage + 1) {
			data.training_stage += 1;
			data.training_points -= data.training_stage;
		}
	}
}

/**
 *
 * @param {string} Name
 * @param {boolean} trained
 * @param {boolean} skipped
 * @param {number} total
 * @param {number} bonus - Multiplier for turns trained or skipped
 */
function KDTickTraining(Name, trained, skipped, total, bonus = 1) {
	if (!KDGameData.Training) KDGameData.Training = {};
	if (!KDGameData.Training[Name]) {
		KDGameData.Training[Name] = {
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
}

/** This many training turns are requred, any less is scaled down by this amount */
let KDTrainingSoftScale = 10;