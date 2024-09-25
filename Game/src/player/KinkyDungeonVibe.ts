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


let KDResolutionConfirm = false;
let KDResolution = 2;
let KDResolutionList = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
let KDResolutionListIndex = KDResolutionList.length-1;

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

let KDGamma = 1;
let KDGammaListIndex = 0;
let KDGammaList = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, .6, .7, .8, .9];

function KDStopAllVibeSounds(Exceptions?: string[]) {
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

function KDUpdateVibeSound(Location: string, Sound: string, Volume: number) {
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
			let vol = (Volume != undefined ? Volume : 1.0);
			if (KDVibeSounds[Location].vol) vol *= KDVibeSounds[Location].vol;
			KDVibeSounds[Location].Audio = audio;
			KDVibeSounds[Location].update = true;
			if (KDPatched) {
				audio.crossOrigin = "Anonymous";
				audio.src = Sound;
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
		KDVibeSounds[Location].Audio.volume = Math.min(Volume * (KDVibeSounds[Location].vol ? KDVibeSounds[Location].vol : 1.0), 1);
	}
}

function KDUpdateVibeSounds() {
	for (let v of Object.entries(KDVibeSounds)) {
		v[1].update = false;
	}
	let vibe = KDGameData.CurrentVibration;
	let sound = KDGameData.CurrentVibration?.sound || "Vibe1";
	if (vibe && KinkyDungeonState == "Game" && KDSoundEnabled()) {
		let globalVolume = KDToggles.VibeSounds ? KDVibeVolume * (KinkyDungeonDrawState == "Game" ? 1 : 0.5) : 0;
		let locations = KDSumVibeLocations();
		KDStopAllVibeSounds(locations);

		let vibeModSoundWeight = 0;

		if (vibe.VibeModifiers) {
			for (let mod of vibe.VibeModifiers) {
				if (mod.intensityMod > vibeModSoundWeight || mod.intensitySetpoint > vibeModSoundWeight) {
					vibeModSoundWeight = Math.max(mod.intensityMod, mod.intensitySetpoint);
					sound = mod.sound || "Vibe1";
				}
			}
		}

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
				if (vibe.location.length > 0 && vibe.location[0] == location) {
					//let finalSound = sound;//(KDVibeSoundRedirect[location] && KDVibeSound[KDVibeSoundRedirect[location]]) ? KDVibeSound[KDVibeSoundRedirect[location]] : "Vibe1";
					KDUpdateVibeSound(KDVibeSoundRedirect[location] ? KDVibeSoundRedirect[location] : "ItemVulva", KinkyDungeonRootDirectory + `Audio/${sound}_${power}.ogg`, globalVolume);
				}
			} else
				KDUpdateVibeSound(KDVibeSoundRedirect[location] ? KDVibeSoundRedirect[location] : "ItemVulva", "", globalVolume);
		}

	} else {
		KDStopAllVibeSounds();
	}
}

function KDSumVibeLocations(): string[] {
	if (KDGameData.CurrentVibration) {
		let groups: string[] = [];
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

/**
 * Gets a list of the groups that should be vibrating here. It is the item's group, plus any 'linked' vibrators
 * @param item
 */
function KDGetVibeLocation(item: item): string[] {
	let restraint = KDRestraint(item);
	let groups = [restraint.vibeLocation ? restraint.vibeLocation : restraint.Group];
	if (restraint.linkedVibeTags) {
		for (let tag of restraint.linkedVibeTags) {
			for (let inv of KinkyDungeonAllRestraintDynamic()) {
				let res = KDRestraint(inv.item);
				if (res.linkedVibeTags && res.linkedVibeTags.includes(tag) && !groups.includes(res.vibeLocation ? res.vibeLocation : res.Group)) {
					groups.push(res.vibeLocation ? res.vibeLocation : res.Group);
				}
			}
		}
	}

	return groups;
}

function KDRandomizeVibeSound() {
	let data = {
		lastVibeSound: KDGameData.CurrentVibration?.sound || "Vibe1",
		currentVibeSound: "Vibe" + Math.ceil(KDRandom() * 3),
	};
	KinkyDungeonSendEvent("vibeSound", data);
	return data.currentVibeSound;
}


/**
 * Starts a vibration, overriding
 * @param source
 * @param name
 * @param locations
 * @param intensity
 * @param duration
 * @param [numLoops]
 * @param [denyTime ]
 * @param [denialsLeft ]
 * @param [edgeTime ]
 * @param [edgeOnly ]
 * @param [alwaysDeny ]
 * @param [denialChance ]
 * @param [denialChanceLikely ]
 * @param [tickEdgeAtMaxArousal ]
 * @param [vibeMods ]
 */
function KinkyDungeonStartVibration (
	source:                 string,
	name:                   string,
	locations:              string[],
	intensity:              number,
	duration:               number,
	numLoops?:              number,
	denyTime?:              number,
	denialsLeft?:           number,
	edgeTime?:              number,
	edgeOnly?:              boolean,
	alwaysDeny?:            boolean,
	denialChance?:          number,
	denialChanceLikely?:    number,
	tickEdgeAtMaxArousal?:  boolean,
	vibeMods?:              VibeMod[]
)
{
	if (KDGameData.CurrentVibration) {
		KinkyDungeonSetFlag("VibeContinued", 3);
		if (!KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonStartVibeContinue"), "#FFaadd", 2)) KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStartVibeContinue"), "#FFaadd", 2, true, true);
	} else {
		KinkyDungeonSetFlag("VibeStarted", 8);
	}
	KDGameData.CurrentVibration = {
		sound: KDRandomizeVibeSound(),
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
 * @param cooldown
 */
function KDIsVibeCD(cooldown: Record<string, number>): boolean {
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

/**
 * @param source
 * @param name
 * @param location
 * @param intensityMod
 * @param [duration]
 * @param [intensitySetpoint]
 * @param [edgeOnly]
 * @param [forceDeny]
 * @param [bypassDeny]
 * @param [bypassEdge]
 * @param [extendDuration]
 * @param [denyChanceMod]
 * @param [denyChanceLikelyMod]
 */
function KinkyDungeonAddVibeModifier (
	source:                string,
	name:                  string,
	location:              string,
	intensityMod:          number,
	duration?:             number,
	intensitySetpoint?:    number,
	edgeOnly?:             boolean,
	forceDeny?:            boolean,
	bypassDeny?:           boolean,
	bypassEdge?:           boolean,
	extendDuration?:       boolean,
	denyChanceMod?:        number,
	denyChanceLikelyMod?:  number
)
{
	if (KDGameData.CurrentVibration) {
		for (let mod of KDGameData.CurrentVibration.VibeModifiers) {
			if (mod.name == name && mod.source == source) {
				KDGameData.CurrentVibration.VibeModifiers.splice(KDGameData.CurrentVibration.VibeModifiers.indexOf(mod));
				break;
			}
		}
		KDGameData.CurrentVibration.VibeModifiers.push({
			source: source,
			sound: KDRandomizeVibeSound(),
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
function KinkyDungeonGetDenyChance(chance: number): number {
	if (!KDGameData.CurrentVibration) return 0;
	let data = {
		denyChance: KDGameData.CurrentVibration.denialChance ? KDGameData.CurrentVibration.denialChance : 0.0,
		denyChanceLikelyMod: 0,
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

function KinkyDungeonVibratorsDeny(chance: number): boolean {
	let data = {toDeny: false};
	let allowDeny = KDRandom() < KinkyDungeonGetDenyChance(chance);
	if (allowDeny) {
		data.toDeny = true;
		KinkyDungeonSendEvent("getDeny", data);
	}
	return data.toDeny;
}

function KinkyDungeonCalculateVibeLevel(delta: number) {
	let oldVibe = KinkyDungeonVibeLevel;
	KinkyDungeonVibeLevel = 0;
	KinkyDungeonOrgasmVibeLevel = 0;
	KinkyDungeonStatPlugLevel = 0;
	KinkyDungeonPlugCount = 0;
	let sumplug = 0;
	for (let item of KinkyDungeonAllRestraintDynamic()) {
		if (item && KDRestraint(item.item)) {
			if (KDRestraint(item.item).plugSize) {
				let size = KDRestraint(item.item).plugSize;
				sumplug += size/2;
				KinkyDungeonStatPlugLevel = Math.max(KinkyDungeonStatPlugLevel, size);
				KinkyDungeonPlugCount += 1;
			}
		}
	}
	sumplug += KinkyDungeonStatPlugLevel/2;
	if (sumplug > KinkyDungeonStatPlugLevel) KinkyDungeonStatPlugLevel = sumplug;

	KDGameData.Edged = false;
	let cease = true;

	if (KDGameData.CurrentVibration) {

		for (let r of KinkyDungeonAllRestraintDynamic()) {
			if (KDGameData.CurrentVibration.source == r.item.name) {
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
				if (intensityMod < intensityModMin) intensityMod = intensityModMin;
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
