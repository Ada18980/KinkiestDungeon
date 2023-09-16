"use strict";

let KDNeedsParams = {
	FrustrationPerTurn: 0.01,
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


function KDTickNeeds(delta) {
	KinkyDungeonGoddessRep.Passion = Math.max(-50, Math.min(50,
		KinkyDungeonGoddessRep.Passion + delta*
			(
				KDNeedsParams.PassionPerTurn
				+ KDNeedsParams.PassionPerDesire * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax
				+ KDNeedsParams.PassionPerVibeLevel * KinkyDungeonVibeLevel
			)));
	KinkyDungeonGoddessRep.Frustration = Math.max(-50, Math.min(50, KinkyDungeonGoddessRep.Frustration + delta*
		(
			KDNeedsParams.FrustrationPerTurn
			+ KDNeedsParams.FrustrationPerDesire * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax
			+ KDNeedsParams.FrustrationPerVibeLevel * KinkyDungeonVibeLevel
		)));
}

/**
 *
 * @param {any} data
 * @param {number} mult
 */
function KDNeedsPlaySelf(data, mult = 1) {
	KinkyDungeonChangeRep("Passion", (KDNeedsParams.PassionPerPlay - 0.01*(0.1 + 0.4 * KDRandom())*KDNeedsParams.PassionPerPlay*(KinkyDungeonGoddessRep.Passion + 50)));
	//KinkyDungeonChangeRep("Frustration", -(KDNeedsParams.FrustrationPerOrgasm + 3*KDNeedsParams.FrustrationPerOrgasm*(KinkyDungeonGoddessRep.Frustration + 50)));
}


/**
 *
 * @param {any} data
 * @param {number} mult
 */
function KDNeedsOrgasm(data, mult = 1) {
	KinkyDungeonChangeRep("Passion", (KDNeedsParams.PassionPerOrgasm + 0.01*(1 + 2 * KDRandom())*KDNeedsParams.PassionPerOrgasm*(50 - KinkyDungeonGoddessRep.Passion)));
	KinkyDungeonChangeRep("Frustration", -(KDNeedsParams.FrustrationPerOrgasm + 0.01*(1 + 2 * KDRandom())*KDNeedsParams.FrustrationPerOrgasm*(KinkyDungeonGoddessRep.Frustration + 50)));
}

/**
 *
 * @param {any} data
 * @param {number} mult
 */
function KDNeedsEdge(data, mult = 1) {
	KinkyDungeonChangeRep("Passion", -(1 + (2 + 4 * KDRandom()) * 0.01*(50 - KinkyDungeonGoddessRep.Frustration)));
	KinkyDungeonChangeRep("Frustration", (5 + (3 + 3 * KDRandom()) * 0.01*(KinkyDungeonGoddessRep.Passion + 50)));
}

/**
 *
 * @param {any} data
 * @param {number} mult
 */
function KDNeedsDeny(data, mult = 1) {
	KinkyDungeonChangeRep("Passion", -(2 + (4 + 8 * KDRandom()) * 0.01*(50 - KinkyDungeonGoddessRep.Frustration)));
	KinkyDungeonChangeRep("Frustration", (15 + (20 * KDRandom()) * 0.01*(KinkyDungeonGoddessRep.Passion + 50)));
}