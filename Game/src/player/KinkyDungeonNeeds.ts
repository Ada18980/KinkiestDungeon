"use strict";

let KDNeedsParams = {
	FrustrationPerTurn: 0.05,
	FrustrationPerDesire: 0.03,
	FrustrationPerOrgasm: -10,
	FrustrationPerVibeLevel: -0.1,
	PassionPerTurn: -0.1,
	PassionPerDesire: 0.1,
	PassionPerOrgasm: 5,
	PassionPerVibeLevel: 0.1,
	PassionPerPlay: 10,
};

/** Runs upon loading in case old save */
function KDFixNeeds() {
	if (KinkyDungeonGoddessRep.Passion == undefined) KinkyDungeonGoddessRep.Passion = -50;
	if (KinkyDungeonGoddessRep.Frustration == undefined) KinkyDungeonGoddessRep.Frustration = -50;
}


function KDTickNeeds(delta: number) {
	KinkyDungeonGoddessRep.Passion = Math.max(-50, Math.min(50,
		KinkyDungeonGoddessRep.Passion + delta*
			(
				KDNeedsParams.PassionPerTurn
				+ KDNeedsParams.PassionPerDesire * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax
				+ KDNeedsParams.PassionPerVibeLevel * KinkyDungeonVibeLevel
			)));
	KinkyDungeonGoddessRep.Frustration = Math.max(-50,
		Math.min(50, KinkyDungeonGoddessRep.Frustration + delta*
		(
			(KDGameData.OrgasmTurns / KinkyDungeonOrgasmTurnsMax)
			* (KDNeedsParams.FrustrationPerTurn + KDNeedsParams.FrustrationPerVibeLevel * KinkyDungeonVibeLevel)
		)));
}

/**
 * @param data
 * @param mult
 */
function KDNeedsPlaySelf(_data: any, _mult: number = 1) {
	KinkyDungeonChangeRep("Passion", (KDNeedsParams.PassionPerPlay
		- 0.01*(0.1 + 0.4 * KDRandom())*KDNeedsParams.PassionPerPlay*(KinkyDungeonGoddessRep.Passion + 50)
		- 0.01*(0.1 + 0.3 * KDRandom())*KDNeedsParams.PassionPerPlay*(KinkyDungeonGoddessRep.Frustration + 50)));
	//KinkyDungeonChangeRep("Frustration", -(KDNeedsParams.FrustrationPerOrgasm + 3*KDNeedsParams.FrustrationPerOrgasm*(KinkyDungeonGoddessRep.Frustration + 50)));
}


/**
 * @param data
 * @param mult
 */
function KDNeedsOrgasm(_data: any, _mult: number = 1) {
	KinkyDungeonChangeRep("Passion", (KDNeedsParams.PassionPerOrgasm + 0.01*(1 + 2 * KDRandom())*KDNeedsParams.PassionPerOrgasm*(50 - KinkyDungeonGoddessRep.Passion)));
	KinkyDungeonChangeRep("Frustration", (KDNeedsParams.FrustrationPerOrgasm + 0.01*(1 + 2 * KDRandom())*KDNeedsParams.FrustrationPerOrgasm*(KinkyDungeonGoddessRep.Frustration + 50)));
}

/**
 * @param data
 * @param mult
 */
function KDNeedsEdge(_data: any, _mult: number = 1) {
	if (KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsMax * 0.5) {
		KinkyDungeonChangeRep("Passion", -(1 + (2 + 4 * KDRandom()) * 0.01*(50 - KinkyDungeonGoddessRep.Frustration)));
		KinkyDungeonChangeRep("Frustration", (5 + (3 + 3 * KDRandom()) * 0.01*(KinkyDungeonGoddessRep.Passion + 50)));
	}

}

/**
 * @param data
 * @param mult
 */
function KDNeedsDeny(_data: any, _mult: number = 1) {
	KinkyDungeonChangeRep("Passion", -(2 + (8 + 12 * KDRandom()) * 0.01*(50 - KinkyDungeonGoddessRep.Frustration)));
	KinkyDungeonChangeRep("Frustration", (10 + (15 * KDRandom()) * 0.01*(KinkyDungeonGoddessRep.Passion + 50)));
}
