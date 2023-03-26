"use strict";


/*
KinkyDungeonPlayerVibratedLocationItemNipplesPiercings,Nipples
KinkyDungeonPlayerVibratedLocationItemNipples,Nipples
KinkyDungeonPlayerVibratedLocationItemBreast,Breasts
KinkyDungeonPlayerVibratedLocationItemPelvis,Panties
KinkyDungeonPlayerVibratedLocationItemVulvaPiercings,Piercing
KinkyDungeonPlayerVibratedLocationItemVulva,Front
KinkyDungeonPlayerVibratedLocationItemButt,Rear
KinkyDungeonPlayerVibratedLocationItemBoots,Feet*/

let KDVibeSounds = {
	"ItemVulva": {sound: "", Audio: null, update: false},
	"ItemButt": {sound: "", Audio: null, update: false},
	"ItemNipples": {sound: "", Audio: null, update: false, vol: 0.5},
};

let KDVibeSoundRedirect = {
	"ItemVulva": "ItemVulva",
	"ItemVulvaPiercings": "ItemNipples", // TODO add softer piercings sound
	"ItemButt": "ItemButt",
	"ItemNipplesPiercings": "ItemNipples",
	"ItemNipples": "ItemNipples",
	"ItemPelvis": "ItemNipples",
	"ItemBreast": "ItemNipples", // TODO add massager sound
	"ItemBoots": "ItemNipples", // TODO add foot tickler sound
};

let KDVibeSound = {
	"ItemVulva": "Vibe1",
	//"ItemVulvaPiercings": "ItemNipples", // TODO add softer piercings sound
	"ItemButt": "Vibe2",
	//"ItemNipplesPiercings": "ItemNipples",
	"ItemNipples": "Vibe3",
	//"ItemBreast": "ItemNipples", // TODO add massager sound
	//"ItemBoots": "ItemNipples", // TODO add foot tickler sound
};


let KDVibeVolume = 1;
let KDVibeVolumeListIndex = 0;
let KDVibeVolumeList = [1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

let KDMusicVolumeMult = 0.25; // Global mult
let KDMusicVolume = 1;
let KDMusicVolumeListIndex = 0;
let KDMusicVolumeList = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0, 0.1, 0.2];

let KDSfxVolume = 1;
let KDSfxVolumeListIndex = 0;
let KDSfxVolumeList = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0, 0.1, 0.2];

let KDAnimSpeed = 1;
let KDAnimSpeedListIndex = 0;
let KDAnimSpeedList = [1, 1.25, 1.5, 2.0, 0, 0.25, 0.5, 0.75,];

function KDStopAllVibeSounds(Exceptions) {
	let EE = [];
	if (Exceptions)
		for (let e of Exceptions) {
			EE.push(KDVibeSoundRedirect[e] ? KDVibeSoundRedirect[e] : e);
		}
	for (let loc of Object.entries(KDVibeSounds)) {
		if (!Exceptions || !EE.includes(loc[0])) {
			if (!loc[1].update) {
				let audio = loc[1];
				if (audio.sound) audio.sound = "";
				if (audio.Audio) {
					audio.Audio.pause();
					audio.Audio.currentTime = 0;
				}
				loc[1].update = true;
			}
		}
	}
}

function KDUpdateVibeSound(Location, Sound, Volume) {
	let prev = "";
	if (KDVibeSounds[Location]) {
		prev = KDVibeSounds[Location].sound;
	}
	if (KDVibeSounds[Location])
		KDVibeSounds[Location].sound = Sound;
	else return;

	if (prev != Sound) {
		if (prev && KDVibeSounds[Location].Audio && !KDVibeSounds[Location].update) {
			// Stop the previous sound
			KDVibeSounds[Location].Audio.pause();
			KDVibeSounds[Location].Audio.currentTime = 0;
			//KDVibeSounds[Location].update = true;
		}
		if (Sound && !KDVibeSounds[Location].update) {
			// Start the new sound
			let audio = new Audio();
			let vol = Player.AudioSettings.Volume * (Volume != undefined ? Volume : 1.0);
			if (KDVibeSounds[Location].vol) vol *= KDVibeSounds[Location].vol;
			KDVibeSounds[Location].Audio = audio;
			KDVibeSounds[Location].update = true;
			if (ServerURL == 'foobar') {
				audio.crossOrigin = "Anonymous";
				// @ts-ignore
				audio.src = remap(Sound);
			} else
				audio.src = KDModFiles[Sound] || Sound;
			audio.volume = Math.min(vol, 1);
			audio.loop = true;
			audio.play();
		}
	}
	if (!Sound && KDVibeSounds[Location].Audio && !KDVibeSounds[Location].update) {
		// Stop the previous sound
		KDVibeSounds[Location].Audio.pause();
		KDVibeSounds[Location].Audio.currentTime = 0;
		KDVibeSounds[Location].update = true;
	}
	if (Volume != undefined && KDVibeSounds[Location] && KDVibeSounds[Location].Audio) {
		KDVibeSounds[Location].Audio.volume = Math.min(Player.AudioSettings.Volume * Volume * (KDVibeSounds[Location].vol ? KDVibeSounds[Location].vol : 1.0), 1);
	}
}

function KDUpdateVibeSounds() {
	for (let v of Object.entries(KDVibeSounds)) {
		v[1].update = false;
	}
	let vibe = KDGameData.CurrentVibration;
	if (vibe && KinkyDungeonState == "Game" && KDToggles.Sound) {
		let globalVolume = KDToggles.VibeSounds ? KDVibeVolume * (KinkyDungeonDrawState == "Game" ? 1 : 0.5) : 0;
		let locations = KDSumVibeLocations();
		KDStopAllVibeSounds(locations);

		for (let location of locations) {
			let power = "Weak";
			if (vibe.location && vibe.location.includes(location)) {
				if (vibe.intensity >= 3) power = "Strong";
				else if (vibe.intensity >= 2) power = "Medium";
			} else if (vibe.VibeModifiers) {
				for (let mod of vibe.VibeModifiers) {
					if (mod.location == location) {
						if (mod.intensityMod >= 3 || mod.intensitySetpoint >= 3) power = "Strong";
						else if (mod.intensityMod >= 2 || mod.intensitySetpoint >= 2) power = "Medium";
					}
				}
			}
			if (KinkyDungeonVibeLevel <= 0) {
				power = "Off";
			}
			if (power != "Off") {
				let sound = (KDVibeSoundRedirect[location] && KDVibeSound[KDVibeSoundRedirect[location]]) ? KDVibeSound[KDVibeSoundRedirect[location]] : "Vibe1";
				KDUpdateVibeSound(KDVibeSoundRedirect[location] ? KDVibeSoundRedirect[location] : "ItemVulva", KinkyDungeonRootDirectory + `Audio/${sound}_${power}.ogg`, globalVolume);
			} else
				KDUpdateVibeSound(KDVibeSoundRedirect[location] ? KDVibeSoundRedirect[location] : "ItemVulva", "", globalVolume);
		}

	} else {
		KDStopAllVibeSounds();
	}
}

function KDSumVibeLocations() {
	if (KDGameData.CurrentVibration) {
		let groups = [];
		for (let g of KDGameData.CurrentVibration.location) {
			groups.push(g);
		}
		for (let mod of KDGameData.CurrentVibration.VibeModifiers) {
			if (!groups.includes(mod.location))
				groups.push(mod.location);
		}
		return groups;
	}
	return [];
}

/** Gets a list of the groups that should be vibrating here. It is the item's group, plus any 'linked' vibrators */
function KDGetVibeLocation(item) {
	let restraint = KDRestraint(item);
	let groups = [restraint.vibeLocation ? restraint.vibeLocation : restraint.Group];
	if (restraint.linkedVibeTags) {
		for (let tag of restraint.linkedVibeTags) {
			for (let inv of KinkyDungeonAllRestraint()) {
				let res = KDRestraint(inv);
				if (res.linkedVibeTags && res.linkedVibeTags.includes(tag) && !groups.includes(res.vibeLocation ? res.vibeLocation : res.Group)) {
					groups.push(res.vibeLocation ? res.vibeLocation : res.Group);
				}
			}
		}
	}

	return groups;
}


/**
 * Starts a vibration, overriding
 * @param {string} source
 * @param {string} name
 * @param {number} intensity
 * @param {number} duration
 * @param {number} [numLoops]
 * @param {number} [denyTime ]
 * @param {number} [denialsLeft ]
 * @param {number} [edgeTime ]
 * @param {boolean} [edgeOnly ]
 * @param {boolean} [alwaysDeny ]
 * @param {number} [denialChance ]
 * @param {number} [denialChanceLikely ]
 * @param {boolean} [tickEdgeAtMaxArousal ]
 * @param {VibeMod[]} [vibeMods ]
 */
function KinkyDungeonStartVibration(source, name, locations, intensity, duration, numLoops, denyTime, denialsLeft, edgeTime, edgeOnly, alwaysDeny, denialChance, denialChanceLikely, tickEdgeAtMaxArousal, vibeMods) {
	if (KDGameData.CurrentVibration) {
		KinkyDungeonSetFlag("VibeContinued", 3);
		if (!KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonStartVibeContinue"), "#FFaadd", 2)) KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStartVibeContinue"), "#FFaadd", 2, true, true);
	} else {
		KinkyDungeonSetFlag("VibeStarted", 8);
	}
	KDGameData.CurrentVibration = {
		source: source,
		name: name,
		location: locations,
		intensity: intensity,
		duration: duration,
		durationLeft: duration,
		loopsLeft: numLoops,
		denyTime: denyTime,
		denyTimeLeft: 0,
		edgeTime: edgeTime,
		edgeTimeLeft: edgeTime,
		edgeOnly: edgeOnly,
		alwaysDeny: alwaysDeny,
		tickEdgeAtMaxArousal: tickEdgeAtMaxArousal,
		denialChance: denialChance,
		denialChanceLikely: denialChanceLikely,
		denialsLeft: denialsLeft,
		VibeModifiers: vibeMods ? vibeMods : [],
	};

	if (!KDGameData.TimeSinceLastVibeStart) KDGameData.TimeSinceLastVibeStart = {};
	KDGameData.TimeSinceLastVibeStart[name] = 0;
}

/**
 *
 * @param {Record<string, number>} cooldown
 * @returns {boolean}
 */
function KDIsVibeCD(cooldown) {
	if (!KDGameData.TimeSinceLastVibeStart) KDGameData.TimeSinceLastVibeStart = {};
	if (!KDGameData.TimeSinceLastVibeEnd) KDGameData.TimeSinceLastVibeEnd = {};
	let pass = true;
	for (let cd of Object.entries(cooldown)) {
		if (KDGameData.TimeSinceLastVibeStart[cd[0]] && KDGameData.TimeSinceLastVibeStart[cd[0]] < cd[1] && KDGameData.TimeSinceLastVibeEnd[cd[0]] && KDGameData.TimeSinceLastVibeEnd[cd[0]] < cd[1]) {
			pass = false;
			break;
		}
	}
	return pass;
}

function KinkyDungeonAddVibeModifier(source, name, location, intensityMod, duration, intensitySetpoint, edgeOnly, forceDeny, bypassDeny, bypassEdge, extendDuration, denyChanceMod, denyChanceLikelyMod) {
	if (KDGameData.CurrentVibration) {
		for (let mod of KDGameData.CurrentVibration.VibeModifiers) {
			if (mod.name == name && mod.source == source) {
				KDGameData.CurrentVibration.VibeModifiers.splice(KDGameData.CurrentVibration.VibeModifiers.indexOf(mod));
				break;
			}
		}
		KDGameData.CurrentVibration.VibeModifiers.push({
			source: source,
			name: name,
			location: location,
			intensityMod: intensityMod,
			duration: duration,
			durationLeft: duration,

			intensitySetpoint: intensitySetpoint,
			edgeOnly: edgeOnly,
			forceDeny: forceDeny,
			bypassDeny: bypassDeny,
			bypassEdge: bypassEdge,
			extendDuration: extendDuration,
			denyChanceMod: denyChanceMod,
			denyChanceLikelyMod: denyChanceLikelyMod,
		});
	}
}

/*
 * Gets the average deny chance of restraints
 */
function KinkyDungeonGetDenyChance(chance) {
	if (!KDGameData.CurrentVibration) return 0;
	let data = {
		denyChance: KDGameData.CurrentVibration.denialChance ? KDGameData.CurrentVibration.denialChance : 0.0,
		orgasmChance: chance,
	};
	if (chance > 0) {
		if (KDGameData.CurrentVibration.denialChanceLikely) data.denyChance = KDGameData.CurrentVibration.denialChanceLikely;
	}
	let forceDeny = false;
	if (KDGameData.CurrentVibration.VibeModifiers) {
		for (let mod of KDGameData.CurrentVibration.VibeModifiers) {
			if (chance > 0 && mod.denyChanceLikelyMod) data.denyChanceLikelyMod += mod.denyChanceMod;
			else if (mod.denyChanceMod) data.denyChance += mod.denyChanceMod;
			if (mod.forceDeny) forceDeny = true;
		}
	}

	if (!forceDeny && KDGameData.CurrentVibration.denialsLeft != undefined && KDGameData.CurrentVibration.denialsLeft <= 0) {
		data.denyChance = 0;
	}
	KinkyDungeonSendEvent("getDenyChance", data);
	return data.denyChance;
}

function KinkyDungeonVibratorsDeny(chance) {
	let data = {toDeny: false};
	let allowDeny = KDRandom() < KinkyDungeonGetDenyChance(chance);
	if (allowDeny) {
		data.toDeny = true;
		KinkyDungeonSendEvent("getDeny", data);
	}
	return data.toDeny;
}

function KinkyDungeonCalculateVibeLevel(delta) {
	let oldVibe = KinkyDungeonVibeLevel;
	KinkyDungeonVibeLevel = 0;
	KinkyDungeonOrgasmVibeLevel = 0;
	KinkyDungeonStatPlugLevel = 0;
	KinkyDungeonPlugCount = 0;
	for (let item of KinkyDungeonAllRestraint()) {
		if (item && KDRestraint(item)) {
			if (KDRestraint(item).plugSize) {
				let size = KDRestraint(item).plugSize;
				KinkyDungeonStatPlugLevel = Math.max(KinkyDungeonStatPlugLevel + size/2, size);
				KinkyDungeonPlugCount += 1;
			}
		}
	}

	KDGameData.Edged = false;
	let cease = true;

	if (KDGameData.CurrentVibration) {

		for (let r of KinkyDungeonAllRestraint()) {
			if (KDGameData.CurrentVibration.source == r.name) {
				cease = false;
				break;
			}
		}

		if (cease) {
			if (!KDGameData.TimeSinceLastVibeEnd) KDGameData.TimeSinceLastVibeEnd = {};
			KDGameData.TimeSinceLastVibeEnd[KDGameData.CurrentVibration.name] = 0;
			KDGameData.CurrentVibration = null;
		}
	}

	if (KDGameData.CurrentVibration) {
		let vibration = KDGameData.CurrentVibration;

		if (vibration.durationLeft > 0) {
			let edge = false;
			let bypassDeny = false;
			let bypassEdge = false;
			let extendDuration = false;
			KinkyDungeonVibeLevel = vibration.intensity;

			if (vibration.VibeModifiers) {
				let intensityMod = 0;
				let intensityModMax = 0;
				let intensityModMin = 0;
				for (let mod of vibration.VibeModifiers) {
					if (mod.durationLeft > 0) {
						mod.durationLeft -= delta;
						if (mod.edgeOnly) {
							edge = true;
						}
						if (mod.bypassDeny) {
							bypassDeny = true;
						}
						if (mod.bypassEdge) {
							bypassEdge = true;
						}
						if (mod.extendDuration) {
							extendDuration = true;
						}
						if (mod.intensityMod > intensityModMax) intensityModMax = mod.intensityMod;
						if (mod.intensityMod < intensityModMin) intensityModMin = mod.intensityMod;
						intensityMod += mod.intensityMod;
					} else {
						vibration.VibeModifiers.splice(vibration.VibeModifiers.indexOf(mod));
					}
				}
				if (intensityMod > intensityModMax) intensityMod = intensityModMax;
				if (intensityMod > intensityModMin) intensityMod = intensityModMin;
				if (intensityMod) {
					KinkyDungeonVibeLevel = Math.max(1, KinkyDungeonVibeLevel + intensityMod);
				}
			}

			if (!extendDuration)
				vibration.durationLeft -= delta;
			if (vibration.denyTimeLeft > 0) {
				vibration.denyTimeLeft -= delta;
				if (!bypassDeny) {
					KinkyDungeonVibeLevel = 0;
				}
			} else if (vibration.edgeTimeLeft > 0 && (!vibration.tickEdgeAtMaxArousal || KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax * 0.99)) {
				vibration.edgeTimeLeft -= delta;
				edge = true;
			}

			if (edge && !bypassEdge) {
				KDGameData.Edged = true;
			} else {
				KinkyDungeonOrgasmVibeLevel = Math.max(KinkyDungeonOrgasmVibeLevel || 0, vibration.intensity);
			}
		} else {
			KinkyDungeonEndVibration();
		}
	}

	if (oldVibe > 0 && KinkyDungeonVibeLevel == 0) {
		if (cease) if (!KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonEndVibeCease"), "#FFaadd", 2)) KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonEndVibeCease"), "#FFaadd", 2, true, true);
		if (!KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonEndVibe"), "#FFaadd", 2)) KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonEndVibe"), "#FFaadd", 2, true, true);
	} else if (oldVibe == 0 && KinkyDungeonVibeLevel > 0) {
		if (!KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonStartVibe"), "#FFaadd", 2)) KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStartVibe"), "#FFaadd", 2, true, true);
	}
}

function KinkyDungeonEndVibration() {
	if (KDGameData.CurrentVibration) {
		let vibe = KDGameData.CurrentVibration;

		if (vibe.loopsLeft > 0) {
			vibe.loopsLeft -= 1;
			vibe.durationLeft = vibe.duration;
		} else {
			if (!KDGameData.TimeSinceLastVibeEnd) KDGameData.TimeSinceLastVibeEnd = {};
			KDGameData.TimeSinceLastVibeEnd[KDGameData.CurrentVibration.name] = 0;
			KDGameData.CurrentVibration = null;
		}
	}
}

function KinkyDungeonCanOrgasm() {
	return !KDGameData.Edged || KinkyDungeonChastityMult() < 0.9;
}