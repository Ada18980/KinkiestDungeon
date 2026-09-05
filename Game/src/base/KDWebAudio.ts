
let kdSoundCache: Map<string, HTMLAudioElement> = new Map();


const KDWebAudioSFXBuffers: Map<string, Promise<AudioBuffer>> = new Map();
const KDWebAudioSFXVoices: Set<WebAudioWrapper> = new Set();
let KDWebAudioMaxVoices = 64;
const KDWebAudioSFXErrors: Set<string> = new Set();

let KDWebAudiooldOnload = window.onload;

window.addEventListener('load', () => {
	
	// @ts-ignore
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	KDWebAudio = new OggmentedAudioContext();

});
	

function GetMusicAudio() {
    let element = null;
	element = GetNewAudio();
    return element;
}
function GetNewAudio(src?: string) {
	if (src) {
		if (KDWebAudioSFXVoices.size >= KDWebAudioMaxVoices) {
			for (let oldest of KDWebAudioSFXVoices.values()) {
				oldest.end();
				KDWebAudioSFXVoices.delete(oldest);
				break;
			}
		}
	}
    let element = null;
    if (KDWebAudio) {
        element = new WebAudioWrapper();
    } else if (OGVSupported) {
		element = new OGVPlayer();
	} else {
		element = new Audio();
	}
	if (src && element) {
		KDWebAudioSFXVoices.add(element);
	}
    return element;
}

function KDLoadWebAudioSFX(src: string): Promise<AudioBuffer> {
	let pending = KDWebAudioSFXBuffers.get(src);
	if (!pending) {
		pending = fetch(src)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP ${response.status} while loading ${src}`);
				}
				return response.arrayBuffer();
			})
			.then((data) => KDWebAudio.decodeAudioData(data));
		KDWebAudioSFXBuffers.set(src, pending);
	}
	return pending;
}

class WebAudioWrapper {
	private vol = 1;
    public node: Promise<AudioBufferSourceNode> = null;

	private point: KDPoint = null;
    public nodes: any[] = null;
    public panvalue = 0;
    /** Must set before location */
    public rolloff = 0;
    public panner: PannerNode = null;
    public lpf: BiquadFilterNode = null;
    public hpf: BiquadFilterNode = null;
    public gain: GainNode = null;
	public paused: boolean = false;
	private startTime = 0;
	private source: string = null;

    private refreshNodeGraph() {
        if (this.nodes) {
			if (this.node)
           		this.node.then((node) => node.disconnect());
            for (let node of this.nodes) {
                node.disconnect();
            }
            let last = KDWebAudio.destination;
            for (let i = this.nodes.length - 1; i >= 0; i--) {
				let node = this.nodes[i];
                node.connect(last);
                last = node;
            }
			if (this.node)
            	this.node.then((node) => node.connect(last));
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
				this.nodes.push(panner);
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
				this.nodes.push(filter);
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
		
        if (this.gain) {
            this.gain.gain.setValueAtTime(value, this.currentTime + 0.01);
        } else {
            // creates and adds a panner node
            let filter = new GainNode(KDWebAudio, {
                gain: value,
            });
            if (this.nodes) {
                this.nodes = this.nodes.filter((node) => {
                    return node != this.gain;
                })
				this.nodes.unshift(filter);
            } else {
                this.nodes = [filter];
            }
            this.refreshNodeGraph() 
            this.gain = filter;
        }
	}
	private looping: boolean;
	get loop(): boolean {
		return this.looping;
	}
	set loop(value: boolean) {
		this.looping = value;
		this.node.then((node) => node.loop = value);
	}

	get currentTime(): number {
		return KDWebAudio.currentTime - this.startTime;
	}
	set currentTime(value: number) {
		if (value == 0) this.startTime = 0;
		else this.startTime = KDWebAudio.currentTime + value;
	}
	listener = null;
	public addEventListener(type, listener) {
		if (type == 'ended') {
			this.listener = listener;
			this.node.then((node) => {node.onended = listener});

		} else {
			this.node.then((node) => node.addEventListener(type, listener));
		}
	}

	public play(): Promise<void> {
		let startZero = false;
		if (this.startTime == 0) {
			startZero = true;
			this.startTime = KDWebAudio.currentTime;
		}
		this.paused = false;
		
		if (this.node != null) {
			return this.node.then((node) => {
				if (this.started) {
					node.stop();
					node.disconnect();
				}
			})
			.then(() => {
				this.node = this.getNode();
				this.node.then((node) => {
					if (this.looping) node.loop = true;
					node.start(startZero ? 0 : (this.startTime - KDWebAudio.currentTime));
					this.started = true;
					node.connect(KDWebAudio.destination);
					this.refreshNodeGraph();
				})
			}
		)

		}

		return new Promise<void>((resolve) => {
			resolve(this.node.then((node) => {
				this.node.then((node) => {
					if (this.looping) node.loop = true;
					node.start(startZero ? 0 : (this.startTime - KDWebAudio.currentTime));
					this.started = true;
					node.connect(KDWebAudio.destination);
					this.refreshNodeGraph();
				});
			}));
		});
		
	}
	private started = false;
	public pause() {
		this.paused = true;
		
		if (this.node != null) {
			this.node.then((node) => {
				if (this.started) {
					node.stop();
					node.disconnect();
				}
			})
			.then(() => this.node = this.getNode())
		}
	}

	end() {
		if (this.node != null)
			this.node.then((node) => {
				if (this.started) {
					node.stop();
					node.disconnect();
				}
			})
		
        if (this.nodes)
            for (let node of this.nodes) {
                node.disconnect();
            }
		this.nodes = null;
		this.panner = null;
		this.lpf = null;
		this.hpf = null;
		this.gain = null;
		this.ended = true;
	}
	ended = false;

	get src(): string {
		return this.source;
	}
	set src(value: string) {
        this.source = value;
		
		this.node = this.getNode();
	}

    set temp(value: boolean) {
		if (value) this.node.then((node) => {node.onended = () => {this.end()}});
    }

	async getNode(): Promise<AudioBufferSourceNode> {
		if (this.node != null)
			await this.node.then((node) => {
					if (this.started) {
						node.stop();
						node.disconnect();
					}
				})
		this.started = false;
		this.node = new Promise(async (resolve, reject) => {
			await KDLoadWebAudioSFX(this.source).then((buffer) => {
				let node = new AudioBufferSourceNode(KDWebAudio, {
					buffer: buffer
				});
				if (this.listener) {
					node.onended = this.listener;
				}
				resolve(node);
			}).catch((error) => {
				KDWebAudioSFXBuffers.delete(this.source);
				if (!KDWebAudioSFXErrors.has(this.source)) {
					KDWebAudioSFXErrors.add(this.source);
					console.warn(`Unable to play sound effect ${this.source}:`, error);
				}
				reject(new AudioBufferSourceNode(KDWebAudio));
			});
		});
		
		return this.node;
	}

	constructor() {
	}
}
