"use strict";

let KDMusic = {
	'grv': [
		"AREA1-GRAVEYARD.ogg",
	],
	'tmb': [
		"AREA2-ANCIENTTOMBS.ogg",
	],
	'cat': [
		"AREA1-GRAVEYARD.ogg",
	],
	'lib': [
		"AREA4-MAGICLIBRARY.ogg",
	],
	'jng': [
		"AREA1-GRAVEYARD.ogg",
	],
	'cry': [
		"AREA6-CRYSTALCAVE.ogg",
	],
	'tmp': [
		"AREA6-CRYSTALCAVE.ogg",
	],
};

let KDCurrentSong = "";
/** @type {HTMLAudioElement} */
let KDCurrentMusicSound = null;
let KDCurrentMusicSoundUpdate = null;

function KDUpdateMusic() {

	let globalVolume = KDMusicVolume * (KinkyDungeonDrawState == "Game" ? 1 : 0.5) * KDMusicVolumeMult;
	if (KDPatched) {
		if (!KDCurrentMusicSound || KDCurrentMusicSound.ended) {
			KDPLayMusic("Music/" + KDMusic[MiniGameKinkyDungeonCheckpoint][Math.floor(KDRandom() * KDMusic[MiniGameKinkyDungeonCheckpoint].length)], globalVolume);
		} else if (KDCurrentMusicSound.paused) KDCurrentMusicSound.play();

		if (KDCurrentMusicSound) {
			KDCurrentMusicSound.volume = Math.min(Player.AudioSettings.Volume * globalVolume, 1);
		}
	}

}

function KDPLayMusic(Sound, Volume) {
	// Start the new sound
	let audio = new Audio();
	let vol = Player.AudioSettings.Volume * (Volume != undefined ? Volume : 1.0);
	KDCurrentMusicSound = audio;
	KDCurrentMusicSoundUpdate = true;
	if (ServerURL == 'foobar') {
		audio.crossOrigin = "Anonymous";
		// @ts-ignore
		audio.src = remap(Sound);
	} else
		audio.src = KDModFiles[Sound] || Sound;
	audio.volume = Math.min(vol, 1);
	audio.loop = false;
	audio.play();
}