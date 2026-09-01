
let kdSoundCache: Map<string, HTMLAudioElement> = new Map();

let KDWebAudiooldOnload = window.onload;


window.addEventListener('load', () => {
	
	if (!AllowFMOD) {
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
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
    if (KDWebAudio) {
        element = new WebAudioWrapper();
    } else if (OGVSupported) {
		element = new OGVPlayer();
	} else {
		element = new Audio();
	}
    return element;
}



class WebAudioWrapper {
	private vol = 1;
	public sound: HTMLAudioElement = null;
    public node: MediaElementAudioSourceNode = null;

	private point: KDPoint = null;
    public nodes: any[] = null;
    public panvalue = 0;
    /** Must set before location */
    public rolloff = 0;
    public panner: PannerNode = null;
    public lpf: BiquadFilterNode = null;
    public hpf: BiquadFilterNode = null;

    private refreshNodeGraph() {
        if (this.nodes) {
            this.node.disconnect();
            for (let node of this.nodes) {
                node.disconnect();
            }
            let last = KDWebAudio.destination;
            for (let node of this.nodes.reverse()) {
                node.connect(last);
                last = node;
            }
            this.node.connect(last);
        }

    }

	set location(value: KDPoint) {
		this.point = value;
        

        if (this.panner) {
            this.panner.positionX.setValueAtTime(Math.max(-1, Math.min(1, this.point.x * 0.2)), 0);
            this.panner.positionY.setValueAtTime(Math.max(-1, Math.min(1, this.point.y * 0.2)), 0);
        } else {
            // creates and adds a panner node
            let panner = new PannerNode(KDWebAudio, {
                panningModel: "HRTF",
                positionX: Math.max(-1, Math.min(1, this.point.x * 0.2)),
                positionY: Math.max(-1, Math.min(1, this.point.y * 0.2)),
                rolloffFactor: this.rolloff,
            });
            if (this.nodes) {
                this.nodes = this.nodes.filter((node) => {
                    return node != this.panner;
                })
            } else {
                this.nodes = [panner];
            }
            this.refreshNodeGraph() 
            this.panner = panner;
        }
	}
    

	set vibe(height: number) {        
        
        if (this.lpf) {
            this.lpf.frequency.setValueAtTime(150 - height * 90, 0);
        } else {
            // creates and adds a panner node
            let filter = new BiquadFilterNode(KDWebAudio, {
                frequency: 150 - height * 90,
                type: "lowpass",
                gain: 0,
                Q: 5,
            });
            if (this.nodes) {
                this.nodes = this.nodes.filter((node) => {
                    return node != this.lpf;
                })
            } else {
                this.nodes = [filter];
            }
            this.refreshNodeGraph() 
            this.lpf = filter;
        }
	}
    

	get volume(): number {
		return this.vol;
	}
	set volume(value: number) {
		this.vol = value;
        this.sound.volume = value;
	}
	get loop(): boolean {
		return this.sound.loop;
	}
	set loop(value: boolean) {
        this.sound.loop = true;
	}

	get currentTime(): number {
		return this.sound.currentTime;
	}
	set currentTime(value: number) {
		this.sound.currentTime = value;
	}
	public addEventListener(type, listener) {
		this.sound.addEventListener(type, listener);
	}

	public play() {
		return this.sound.play();
	}
	public pause() {
        this.sound.pause();
	}
	get paused(): boolean{
		return this.sound.paused;
	}

	end() {
		this.sound.remove();
		this.node.disconnect();
        if (this.nodes)
            for (let node of this.nodes) {
                node.disconnect();
            }
	}
	ended = false;

	get src(): string {
		return this.sound.src;
	}
	set src(value: string) {
        this.sound.src = value;
	}

    set temp(value: boolean) {
		this.sound.addEventListener('ended', (element) => {
			this.sound.remove();
			this.node.disconnect();
            if (this.nodes)
                for (let node of this.nodes) {
                    node.disconnect();
                }
            });
    }

	constructor() {
        this.sound = new Audio();
        this.node = new MediaElementAudioSourceNode(KDWebAudio, {
          mediaElement: this.sound,
        });
        this.node.connect(KDWebAudio.destination);
	}
}
