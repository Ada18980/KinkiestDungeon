
let kdSoundCache: Map<string, HTMLAudioElement> = new Map();

let KDWebAudiooldOnload = window.onload;

window.addEventListener('load', () => {
	
	if (!AllowFMOD) {
		KDWebAudio = new AudioContext();
	}

});
	

function GetNewAudio() {
    let element = null;
	if (CommonIsFMOD) {
		element = new KDFModWrapper();
	} else element = GetMusicAudio();
    return element;
}
function GetMusicAudio() {
    let element = null;
	if (OGVSupported) {
		element = new OGVPlayer();
	} else {
		element = new Audio();
	}
    if (element && KDWebAudio && !OGVSupported) {
        //KDWebAudio.createMediaElementSource(element) // TODO
    }
    return element;
}
