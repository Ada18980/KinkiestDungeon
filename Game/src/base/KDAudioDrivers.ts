// @ts-nocheck
let KDWebAudio: AudioContext = null;


declare const OGVCompat: any
declare const OGVPlayer: any
let OGVSupported = false;
(() => {
	if (isSafari) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
	
		script.type = 'text/javascript';
	
		script.src = "Scripts/lib/ogvjs-1.9.0/ogv.js";
	
		head.appendChild(script).onload = () => {
			
			OGVSupported = OGVCompat.supported('OGVPlayer');
		};
	
	}
	
})();

