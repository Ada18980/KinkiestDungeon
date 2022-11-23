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

function KDGetCheckpoint() {
	return KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || 'grv';
}

let lastKDMusicTick = 0;

function KDUpdateMusic() {

	if (KDPatched) {
		if (performance.now() - lastKDMusicTick < 100) return;

		let globalVolume = KDMusicVolume * KDMusicVolumeMult;
		if (!KDCurrentMusicSound || KDCurrentMusicSound.ended || KDCurrentMusicSound.paused || !KDCurrentSong) {
			KDPlayMusic(KDMusic[KDGetCheckpoint()][Math.floor(KDRandom() * KDMusic[KDGetCheckpoint()].length)], globalVolume);
		}
		else if (KDCurrentMusicSound && KDCurrentSong && !KDMusic[KDGetCheckpoint()].includes(KDCurrentSong)) {
			KDEndMusic();
		}

		if (KDCurrentMusicSound) {
			KDCurrentMusicSound.volume = Math.min(Player.AudioSettings.Volume * globalVolume, 1);
		}

		lastKDMusicTick = performance.now();
	}


}

function KDPlayMusic(Sound, Volume) {
	// Start the new sound
	let audio = KDCurrentMusicSound || new Audio();
	let vol = Player.AudioSettings.Volume * (Volume != undefined ? Volume : 1.0);
	KDCurrentMusicSound = audio;
	KDCurrentMusicSoundUpdate = true;
	if (ServerURL == 'foobar') {
		audio.crossOrigin = "Anonymous";
		// @ts-ignore
		audio.src = remap("Music/" + (KDModFiles[Sound] || Sound));
	} else
		audio.src = "Music/" + (KDModFiles[Sound] || Sound);
	audio.volume = Math.min(vol, 1);
	audio.loop = false;
	audio.addEventListener('ended', function () {
		this.currentTime = 0;
		this.play();
		lastKDMusicTick = 0;
		KDCurrentSong = "";
	}, false);
	audio.play();
	KDCurrentSong = Sound;
}

function KDEndMusic() {
	KDCurrentSong = "";
	if (KDCurrentMusicSound) {
		KDCurrentMusicSound.pause();
		KDCurrentMusicSound.currentTime = 0;
		KDCurrentMusicSoundUpdate = true;
	}
}