// @ts-nocheck
let KDWebAudio = null;
let AllowFMOD = (KDSearchParams.has('fmod') ? KDSearchParams.get('fmod') : "");


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


// Simple error checking function for all FMOD return values.
function KDCheckFMODResult(result): boolean
{
    if (result != FMOD.RESULT.OK)
    {
        var msg = "Error!!! '" + KDFMOD.ErrorString(result) + "'";

        alert(msg);

        throw msg;
		return false;
    }
	return true;
}


async function FMODAfter() {
	console.log("Running FMOD Init")
	let output : any = {};
	let result = KDFMOD.System_Create(output);
	KDCheckFMODResult(result);
	if (output.val != null) KDFmodSystem = output.val;

	
    result = KDFmodSystem.init(1024, FMOD.INITFLAGS.NORMAL, null);
	
	KDCheckFMODResult(result);
	
	CommonIsFMOD = true;
	console.log("FMOD Init successful")
};  
var KDFMOD: FMOD = {
	onRuntimeInitialized: FMODAfter,
	// @ts-ignore
	INITIAL_MEMORY: 64*1024*1024,
	// @ts-ignore
	window: window
};
var KDFmodSystem: FMOD.System = null;

let KDFmod_Sound_Cache: Record<string, FMOD.Sound> = {};

window.addEventListener('load', () => {
	
	if (AllowFMOD) {
		//@ts-ignore
		let API = window.kdAPI;
		if (API || TestMode)
			FMODModule(KDFMOD);
	}

});
	
class KDFModWrapper {
	private vol = 1;
	private source = "";
	public sound: any = null;
	private channel: FMOD.Channel = null;
	private cb = null;
	private looped: boolean;

	private point: KDPoint = null;

	set location(value: KDPoint) {
		this.point = value;
	}

	get volume(): number {
		return this.vol;
	}
	set volume(value: number) {
		this.vol = value;

		if (this.channel) {
			// @ts-ignore
			this.channel.setVolume(this.vol);
		}
	}
	get loop(): boolean {
		return this.looped;
	}
	set loop(value: boolean) {
		this.looped = value;
	}

	
	get currentTime(): number {
		if (this.channel) {
			let output: any = {};
			// @ts-ignore
			let result = this.channel.getPosition(output, FMOD.TIMEUNIT.MS);
			KDCheckFMODResult(result);
			return output.val * 0.001;
		}
		return 0;
	}
	set currentTime(value: number) {
		if (this.channel) {
			// @ts-ignore
			let result = this.channel.setPosition(value * 1000, FMOD.TIMEUNIT.MS);
			KDCheckFMODResult(result);
		}
	}
	public addEventListener(type, listener) {
		if (!this.channel) return;
		if (type == 'ended') {
			this.cb = listener;
		}
	}

	public play() {
		let value = this.src;
		
		var channelOut: any = {};


    	var outval: any = {};
		var result;

		let gSound = kdSoundCache[value];

		let doIt = () => {
			result = KDFmodSystem.playSound(gSound,
			null, true, channelOut);
			if (KDCheckFMODResult(result)) {
				this.channel = channelOut.val;
				//@ts-ignore
				this.channel.setVolume(this.vol);

				if (this.looped) {
					// @ts-ignore
					this.channel.setLoopCount(-1);
					this.looped = false;
				}

				if (this.point) {
					// @ts-ignore
					let result = this.channel.setPan(Math.max(-1, Math.min(1, this.point.x * 0.2)));
					KDCheckFMODResult(result);
					this.point = null;
				}

				if (this.cb) {
					// @ts-ignore
					result = this.channel.setCallback((channelcontrol, controltype, callbacktype, commanddata1, commanddata2) => 
						{
							if (callbacktype === FMOD.CHANNELCONTROL_CALLBACK_TYPE.END)
							{
								this.cb();
								console.log("End")
								this.channel = null;
							}

							return FMOD.RESULT.OK;
						});
					KDCheckFMODResult(result);
					this.cb = null;
				} else {
					// @ts-ignore
					result = this.channel.setCallback((channelcontrol, controltype, callbacktype, commanddata1, commanddata2) => 
						{
							if (callbacktype === FMOD.CHANNELCONTROL_CALLBACK_TYPE.END)
							{
								console.log("End")
								this.channel = null;
							}

							return FMOD.RESULT.OK;
						});
					KDCheckFMODResult(result);
				}

				
				// @ts-ignore
				result = this.channel.setPaused(false);
				KDCheckFMODResult(result);

			}
		}

		if (!gSound) {
			fetch(value)
				.then(res => res.blob())
				.then((blob) => {
					var exinfo = KDFMOD.CREATESOUNDEXINFO();
					// Create a sound that loops
					let fr = new FileReader();
					fr.addEventListener('load', (event) => {
						//@ts-ignore
						let chars: any = new Uint8Array(event.target.result);
						exinfo.length = chars.length;

						result = KDFmodSystem.createSound(chars.buffer, FMOD.MODE.LOOP_OFF | FMOD.MODE.OPENMEMORY, exinfo, outval);
						delete chars.buffer;
						if (!KDCheckFMODResult(result)) return;
						gSound = outval.val;
						

						doIt();
						kdSoundCache[value] = outval.val;
					})
					fr.readAsArrayBuffer(blob);
				})
			
			
		} else doIt();
		return new Promise((resolve, reject)=> {
			//dummy
			resolve(null)
			});
	}
	public pause() {
		
		if (this.channel) {
			// @ts-ignore
			let result = this.channel.setPaused(true);
			KDCheckFMODResult(result);
		}
	}
	get paused(): boolean{
		
		if (this.channel) {
			let output: any = {};
			// @ts-ignore
			let result = this.channel.getPaused(output);
			KDCheckFMODResult(result);
			return output.val;
		}
		return true;
	}

	end() {
		if (this.channel) {
			let result = this.channel.stop();
			KDCheckFMODResult(result);
			this.ended = true;
		}
	}
	ended = false;

	get src(): string {
		return this.source;
	}
	set src(value: string) {
		this.source = value;

    	var outval: any = {};
		var result;

		let gSound = kdSoundCache[value];

		if (!gSound) {
			fetch(value)
				.then(res => res.blob())
				.then((blob) => {
					var exinfo = KDFMOD.CREATESOUNDEXINFO();
					// Create a sound that loops
					let fr = new FileReader();
					fr.addEventListener('load', (event) => {
						//@ts-ignore
						let chars: any = new Uint8Array(event.target.result);
						exinfo.length = chars.length;


						exinfo.userdata = 12345;
						result = KDFmodSystem.createSound(chars.buffer, FMOD.MODE.LOOP_OFF | FMOD.MODE.OPENMEMORY, exinfo, outval);
						delete chars.buffer;
						if (!KDCheckFMODResult(result)) return;
						gSound = outval.val;
						

						kdSoundCache[value] = outval.val;
					})
					fr.readAsArrayBuffer(blob);
				})
			
			
		}

	}

	KDFModWrapper() {

	}
}
