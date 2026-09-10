// @ts-nocheck
let KDWebAudio: OggmentedAudioContextAudioContext = null;


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



/** jfrancos Oggmented library, MIT license */
const SILENCE_OGG_DATA_URI = 'Game/Audio/Null.ogg';

class OggmentedAudioContext extends (window.AudioContext || window.webkitAudioContext) {
  constructor(options = {}) {
    super(options);
    Object.setPrototypeOf(this, OggmentedAudioContext.prototype);
    this._silenceUri = options.silenceUri || SILENCE_OGG_DATA_URI;
  }

  // Detects which decoding engine the browser uses via silent .ogg
  nativeVorbisLevel() {
    return new Promise(resolve => {
      fetch(this._silenceUri)
        .then(response => response.arrayBuffer())
        .then(buffer =>
          super.decodeAudioData(
            buffer,
            decodedBuffer => resolve(decodedBuffer.length === 1 ? 'gecko' : 'blink'),
            () => resolve('webkit')
          )
        );
    });
  }

  // tries the native implementation first,
  // if that fails, we use oggmented to load
  // If safari, it always uses oggmented and we pray default works if that fails
  decodeAudioData(buffer, callback) {
    const decode = resolve => {
      if (isSafari) {
        OggmentedWASM().then(oggmented => {
          try {
            oggmented.decodeOggData(buffer, resolve);
          } catch {
            console.log("error loading:");
            console.log(buffer);
            super.decodeAudioData(buffer, resolve)
          }
        });
      } else {
        super.decodeAudioData(buffer, resolve).then(() => {return;}, (rejected) => {
          if (rejected) {
            OggmentedWASM().then(oggmented => {
              try {
                oggmented.decodeOggData(buffer, resolve);
              } catch {
                console.log("error loading:");
                console.log(buffer);
              }
              });
          }
        });
      }
    };

    if (callback) {
      decode(callback);
    } else {
      return new Promise(decode);
    }
  }
}