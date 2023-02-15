"use strict";

/** These tracks will loop with a certain chance of forcibly continuing the loop. 0 = no loop*/
let KDMusicLoopTracksChance = {
	"AREA1-GRAVEYARD.ogg": 0.5,
	"AREA2-ANCIENTTOMBS.ogg": 0.5,
	"GENERIC-DOLLRACK.ogg": 0.15,
	"AREA4-MAGICLIBRARY.ogg": 0.5,
	"AREA5-UNDERGROUNDJUNGLE.ogg": 0.5,
	"AREA6-CRYSTALCAVE.ogg": 0.5,
	"AREA7-LOSTTEMPLE.ogg": 0.5,
	"AREA8-ORRERY.ogg": 0.7,
	"AREA9-BELLOWS.ogg": 0.5,
};

let KDCurrentSong = "";
let KDNewSong = "AREA1-GRAVEYARD.ogg";
let KDLastSong = "";
let KDCurrentLoops = 0;
let KDCurrentFade = 1;
let KDMusicFadeTime = 2500; // 2 seconds
let KDMusicFadeInTime = 2500; // 2 seconds
let KDMusicTickRate = 100;
/** @type {HTMLAudioElement} */
let KDCurrentMusicSound = null;
let KDCurrentMusicSoundUpdate = null;

function KDGetCheckpoint() {
	return KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || 'grv';
}

let lastKDMusicTick = 0;

function KDUpdateMusic() {

	if (KDPatched) {
		KDCurrentMusicSoundUpdate = false;
		let KDMusic = KinkyDungeonMapParams[KDGetCheckpoint()].music;

		if (!KDNewSong) {
			let iter = 0;
			let maxiter = 2; // 1 reroll
			KDNewSong = KDLastSong;
			while (iter < maxiter && KDNewSong == KDLastSong) {
				KDNewSong = KDGetByWeight(KDMusic);
				iter++;
			}
		}
		if (performance.now() - lastKDMusicTick < KDMusicTickRate) return;
		if (KDCurrentMusicSound) {
			if (!KDCurrentSong && KDNewSong != KDLastSong) {
				if (KDCurrentFade > 0) {
					let dd = (performance.now() - lastKDMusicTick) / KDMusicFadeTime;
					KDCurrentFade = Math.max(0, KDCurrentFade - dd);
				}
			} else {
				if (KDCurrentFade < 1) {
					let dd = (performance.now() - lastKDMusicTick) / KDMusicFadeInTime;
					KDCurrentFade = Math.min(1, KDCurrentFade + dd);
				}
			}
		}



		let globalVolume = KDToggles.Sound && KDToggles.Music ? KDMusicVolume * KDMusicVolumeMult : 0;
		if (globalVolume > 0 && (!KDCurrentMusicSound || KDCurrentMusicSound.ended || KDCurrentMusicSound.paused || (!KDCurrentSong && KDCurrentFade == 0))) {
			KDPlayMusic(KDNewSong, globalVolume);
		}
		else if (KDCurrentMusicSound && KDCurrentSong && !Object.keys(KDMusic).includes(KDCurrentSong)) {
			if (!KDCurrentMusicSoundUpdate)
				KDEndMusic();
		}

		if (KDCurrentMusicSound) {
			KDCurrentMusicSound.volume = Math.min(Player.AudioSettings.Volume * globalVolume, 1) * KDCurrentFade;
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
		lastKDMusicTick = performance.now() - 100;
		// Current audio is now stale--chance of not being stale though
		if (KDRandom() < KDMusicLoopTracksChance[KDCurrentSong]) {
			KDCurrentLoops += 1;
		} else {
			KDCurrentSong = "";
			KDNewSong = "";
		}
	}, false);
	audio.play();
	KDCurrentLoops = 0;
	//KDCurrentFade = 1;

	KDLastSong = Sound;
	KDCurrentSong = Sound;
	KDNewSong = "";
}

function KDEndMusic() {
	KDCurrentSong = "";
	KDNewSong = "";
	if (KDCurrentMusicSound) {
		KDCurrentMusicSound.pause();
		KDCurrentMusicSound.currentTime = 0;
		KDCurrentMusicSoundUpdate = true;
	}
}