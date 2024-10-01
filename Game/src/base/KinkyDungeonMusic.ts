"use strict";

/** These tracks will loop with a certain chance of forcibly continuing the loop. 0 = no loop*/
let KDMusicLoopTracksChance = {
	"AREA1-GRAVEYARD.ogg": 0.5,
	"AREA2-ANCIENTTOMBS.ogg": 0.5,
	"GENERIC-DOLLRACK.ogg": 0.5,
	"AREA4-MAGICLIBRARY.ogg": 0.5,
	"AREA5-UNDERGROUNDJUNGLE.ogg": 0.5,
	"AREA6-CRYSTALCAVE.ogg": 0.5,
	"AREA7-LOSTTEMPLE.ogg": 0.5,
	"AREA8-ORRERY.ogg": 0.7,
	"AREA9-BELLOWS.ogg": 0.5,
	"Shopping.ogg": 0.15,
	"slimy_science_1.ogg": 0.15,
};

let KDMusicUpdateTime = 0;
let KDMusicUpdateDuration = 5000;
let KDMusicY = 0;
let KDMusicYMax = 50;
let KDMusicYSpeed = 0.15;
let KDMusicToast = "";

let WriteMusicToast = false;

function KDSendMusicToast(song: string, extraLen = 0): void {
	if (!WriteMusicToast) {
		// This is to avoid race conditions since this is often used to notify of async e.g. save notifications
		WriteMusicToast = true;
		KDMusicToast = song;
		KDMusicUpdateTime = CommonTime() + extraLen;
		WriteMusicToast = false;
	}
}

function KDDrawMusic(delta: number): void {
	if (CommonTime() - KDMusicUpdateTime < KDMusicUpdateDuration) {
		if (KDMusicY < KDMusicYMax) {
			KDMusicY = Math.max(0, Math.min(KDMusicY + delta*KDMusicYSpeed, KDMusicYMax));
		}
	} else {
		if (KDMusicY > 0) {
			KDMusicY = Math.max(0, Math.min(KDMusicY - delta*KDMusicYSpeed, KDMusicYMax));
		}
	}
	if (KDMusicY > 0) {
		FillRectKD(
			kdcanvas, kdpixisprites, "musictoast", {
				Left: 500,
				Top: KDMusicY - KDMusicYMax,
				Width: 1000,
				Height: KDMusicYMax,
				Color: "#000000",
				alpha: 0.8,
				zIndex: 209.9,
			}
		);
		DrawTextFitKD(KDMusicToast, 1000, KDMusicY - KDMusicYMax/2, 1000, "#ffffff", "#000000", 32, "center", 210);
	}
}

let KDCurrentSong = "";
let KDNewSong = "GENERIC-DOLLRACK.ogg";
let KDLastSong = "";
let KDCurrentLoops = 0;
let KDCurrentFade = 1;
let KDMusicFadeTime = 2500; // 2 seconds
let KDMusicFadeInTime = 2500; // 2 seconds
let KDMusicTickRate = 100;
let KDCurrentMusicSound: HTMLAudioElement = null;
let KDCurrentMusicSoundUpdate = null;
let allowMusic = navigator.userAgent.includes('Electron');

function KDGetCurrentCheckpoint() {
	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
	return altType?.skin ? altType.skin : (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);
}
function KDGetMusicCheckpoint() {
	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
	if (altType?.musicParams) return altType.musicParams;
	if (altType?.skin && !altType.useDefaultMusic) return altType.skin;
	return (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint) || 'menu';
}

let lastKDMusicTick = 0;

function KDUpdateMusic() {

	if (allowMusic) {
		KDCurrentMusicSoundUpdate = false;
		let KDMusic = KinkyDungeonMapParams[KDGetMusicCheckpoint()].music;

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



		let globalVolume = KDSoundEnabled() && KDToggles.Music ? KDMusicVolume * KDMusicVolumeMult : 0;
		if (globalVolume > 0 && (!KDCurrentMusicSound || KDCurrentMusicSound.ended || KDCurrentMusicSound.paused || (!KDCurrentSong && KDCurrentFade == 0))) {
			KDPlayMusic(KDNewSong, globalVolume);
		}
		else if (KDCurrentMusicSound && KDCurrentSong && !Object.keys(KDMusic).includes(KDCurrentSong)) {
			if (!KDCurrentMusicSoundUpdate)
				KDEndMusic();
		}

		if (KDCurrentMusicSound) {
			KDCurrentMusicSound.volume = Math.min(globalVolume, 1) * KDCurrentFade;
		}

		lastKDMusicTick = performance.now();
	}


}

let KDMusicBusy = false;

function KDPlayMusic(Sound: string, Volume?: number) {
	if (KDMusicBusy) return;
	KDMusicBusy = true;
	// Start the new sound
	let audio = KDCurrentMusicSound || new Audio();
	let vol = (typeof Volume != 'undefined' ? Volume : 1.0);
	KDCurrentMusicSound = audio;
	KDCurrentMusicSoundUpdate = true;
	if (KDPatched) {
		audio.crossOrigin = "Anonymous";
		audio.src = "Music/" + (KDModFiles[Sound] || Sound);
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
	audio.play().then(() => {
		KDCurrentLoops = 0;
		//KDCurrentFade = 1;

		KDLastSong = Sound;
		KDCurrentSong = Sound;
		KDSendMusicToast(TextGet(Sound));
		KDNewSong = "";
		KDMusicBusy = false;
	}).catch((error) => {
		if (error.name === 'NotAllowedError') {
			// Music will try to play again after a user gesture (onclick event)
			console.log('Autoplay is blocked by browser policy.');
			allowMusic = false;
			KDMusicBusy = false;
		} else {
			console.log('An error occurred while trying to play ' + Sound + " -- ", error.message);
			KDSendMusicToast("Error playing " + Sound + ": " + error.message); // This shouldn't happen, but now you'll get a bug report.
			KDMusicBusy = false;
		}
	});
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
