//import * as PIXI from "pixi.js"
//import { Viewport } from "../node_modules/pixi-viewport/dist/Viewport";

const PIXIWidth = 2000;
const PIXIHeight = 1000;

// @ts-ignore
let kdui = new PIXI.Graphics();
let kdcanvas = new PIXI.Container();

let KDResolutionConfirm = false;
let KDResolution = 2;
let KDResolutionList = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
let KDResolutionListIndex = KDResolutionList.length-1;

let KDVibeVolume = 1;
let KDVibeVolumeListIndex = 0;
let KDVibeVolumeList = [1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

let KDMusicVolumeMult = 0.25; // Global mult
let KDMusicVolume = 1;
let KDMusicVolumeListIndex = 0;
let KDMusicVolumeList = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0, 0.1, 0.2];

let KDSfxVolume = 1;
let KDSfxVolumeListIndex = 0;
let KDSfxVolumeList = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0, 0.1, 0.2];

let KDAnimSpeed = 1;
let KDAnimSpeedListIndex = 0;
let KDAnimSpeedList = [1, 1.25, 1.5, 2.0, 0, 0.25, 0.5, 0.75,];

let KDGamma = 1;
let KDGammaListIndex = 0;
let KDGammaList = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, .6, .7, .8, .9];

let KDBoardFilters = [];


// PIXI experimental
/** @type HTMLCanvasElement */
let pixiview = null;
let pixirenderer = null;
let pixirendererKD = null;
let kdgamefog = new PIXI.Graphics();
//let kdgamefogmask = new PIXI.Graphics();
let kdgamefogsmoothDark = new PIXI.Container();
kdgamefogsmoothDark.zIndex = -1.05;
let kdgamefogsmooth = new PIXI.Container();
kdgamefogsmooth.zIndex = -1.1;
//kdgamefogsmooth.mask = kdgamefogmask;
kdgamefog.zIndex = -1;
let kdgamesound = new PIXI.Container();
kdgamesound.zIndex = 1;
let kdoutlinefilter = StandalonePatched ? new PIXI.filters.OutlineFilter(2, 0xffffff, 0.1, 0.5, true) : undefined;
//let kdVisionBlurfilter = StandalonePatched ? new PIXI.filters.KawaseBlurFilter(10, 1) : undefined;


let KDOutlineFilterCache = new Map();

let kdminimap = new PIXI.Graphics();
kdminimap.x = 500;
kdminimap.y = 10;
kdminimap.zIndex = 80;

let kdmapboard = new PIXI.Container();
kdmapboard.zIndex = -2;
kdmapboard.filterArea = new PIXI.Rectangle(0, 0, 2000, 1000);

let kdlightmap : PIXITexture = null;
let kdlightmapGFX : PIXIGraphics = null;

let kdbrightnessmap : PIXITexture = null;
let kdbrightnessmapGFX : PIXIContainer = null;

let res = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];

//kdlightmapGFX.filterArea = new PIXI.Rectangle(0, 0, 2000, 1000);





let kddarkdesaturatefilter = null;


let kdfogfilter = null;

//kdfogfilter.resolution = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
const gammaUniform = new PIXI.UniformGroup({
	gamma:{ value: 1, type: 'f32' },
});

let kdgammafilter = null;

let kdmultiplyfilter = null;



let kdenemyboard = new PIXI.Container();
kdenemyboard.zIndex = 0;
kdenemyboard.sortableChildren = true;
let kdenemystatusboard = new PIXI.Container();
kdenemystatusboard.zIndex = 4;
kdenemystatusboard.sortableChildren = true;
let kdbulletboard = new PIXI.Container();
kdbulletboard.zIndex = 2.3;
kdbulletboard.sortableChildren = true;
let kdeffecttileboard = new PIXI.Container();
kdeffecttileboard.zIndex = -0.1;
kdeffecttileboard.sortableChildren = true;
let kdUItext = new PIXI.Container();
kdUItext.zIndex = 60;
kdUItext.sortableChildren = true;
let kdstatusboard = new PIXI.Container();
kdstatusboard.zIndex = 5;
kdstatusboard.sortableChildren = true;
let kdfloatercanvas = new PIXI.Container();
kdfloatercanvas.zIndex = 200;
kdfloatercanvas.sortableChildren = false;
kdstatusboard.addChild(kdfloatercanvas);

let kddialoguecanvas = new PIXI.Container();
kddialoguecanvas.zIndex = 60;
kddialoguecanvas.sortableChildren = false;
kdstatusboard.addChild(kddialoguecanvas);
let kdenemydialoguecanvas = new PIXI.Container();
kdenemydialoguecanvas.zIndex = 60;
kdenemydialoguecanvas.sortableChildren = false;
kdstatusboard.addChild(kdenemydialoguecanvas);


let kditemsboard = new PIXI.Container();
kditemsboard.zIndex = -2;
kditemsboard.sortableChildren = false;
let kdwarningboard = new PIXI.Container();
kdwarningboard.zIndex = -0.3;
kdwarningboard.sortableChildren = true;
let kdwarningboardOver = new PIXI.Container();
kdwarningboardOver.zIndex = 2.22;
kdwarningboardOver.sortableChildren = false;
// @ts-ignore
let kdgameboard = new PIXI.Container();
kdgameboard.sortableChildren = true;
kdgameboard.zIndex = -50;
kdgameboard.addChild(kdmapboard);
kdgameboard.addChild(kdwarningboard);
kdgameboard.addChild(kdbulletboard);
kdgameboard.addChild(kdenemyboard);
kdgameboard.addChild(kdeffecttileboard);
kdgameboard.addChild(kdgamesound);
kdgameboard.addChild(kdwarningboardOver);
kdgameboard.addChild(kditemsboard);


//kdcanvas.addChild(new PIXI.Sprite(kdlightmap));

let statusOffset = 0;

kdgameboard.addChild(kdgamefogsmooth);
kdgameboard.addChild(kdgamefogsmoothDark);

statusOffset -= 20;
kdgameboard.addChild(kdgamefog);
//kdgameboard.addChild(kdgamefogmask);



let kdparticles = new PIXI.Container();
kdparticles.zIndex = 10;
kdparticles.sortableChildren = false;


kdbrightnessmapGFX = new PIXI.Container();
kdbrightnessmap = PIXI.RenderTexture.create({ width: res > 1 ? 2047 : 2000, height: res > 1 ? 1023 : 1000,});

kdlightmapGFX = new PIXI.Graphics();
kdlightmap = PIXI.RenderTexture.create({ width: res > 1 ? 2047 : 2000, height: res > 1 ? 1023 : 1000,});


let resolution = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
var PIXIapp = new PIXI.Application();

let loaded = false;

(async () => {
    await PIXIapp.init({
		//view: document.getElementById("MainCanvas"),
		antialias: false,
		powerPreference: 'high-performance',
		resolution: resolution,//KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0],
		width: PIXIWidth,
		height: PIXIHeight,
	});
	loaded = true;
    // do pixi things



	kddarkdesaturatefilter = new PIXI.Filter({
		glProgram: PIXI.GlProgram.from({
			fragment: KDShaders.Darkness.code,
			vertex: KDShaders.DefaultVertex.code,
		}),
		resources: {
			numUniforms: new PIXI.UniformGroup({
				radius: { value: .02*72/2000, type: 'f32' },
				weight: { value: 0.24, type: 'f32' },
				mult: { value: 1.1, type: 'f32' },
				lum_cutoff: { value: 0.65, type: 'f32' },
				lum_cutoff_rate: { value: 3.5, type: 'f32' },
				brightness: { value: 1, type: 'f32' },
				brightness_rate: { value: 0.7, type: 'f32' },
				contrast: { value: 1, type: 'f32' },
				contrast_rate: { value: 0.03, type: 'f32' },
			})
		},
	});

	kdfogfilter = new PIXI.Filter({
		glProgram: PIXI.GlProgram.from({
			fragment: KDShaders.FogFilter.code,
			vertex: KDShaders.DefaultVertex.code,
		}),
		resources: {
			lightmap: kdlightmap.source,
			numUniforms: new PIXI.UniformGroup({
				brightness: { value: 1, type: 'f32' },
				brightness_rate: { value: 0., type: 'f32' },
				contrast: { value: 1, type: 'f32' },
				contrast_rate: { value: 0.03, type: 'f32' },
				saturation: { value: 0, type: 'f32' },
			})
		},
	});

	kdgammafilter = new PIXI.Filter({
		glProgram: PIXI.GlProgram.from({
			fragment: KDShaders.GammaFilter.code,
			vertex: KDShaders.DefaultVertex.code,
		}),
		resources: {
			numUniforms: gammaUniform,
		},
	});

	kdmultiplyfilter = new PIXI.Filter({
		glProgram: PIXI.GlProgram.from({
			fragment: KDShaders.MultiplyFilter.code,
			vertex: KDShaders.DefaultVertex.code,
		}),
		resources: {
			lightmap: kdbrightnessmap.source,
		},
	});


	document.body.appendChild(PIXIapp.canvas as any);

	PIXIapp.stage.addChild(kdcanvas);
	PIXIapp.stage.addChild(kdui);


	kdcanvas.addChild(kdgameboard);
	kdcanvas.sortableChildren = true;
	kdcanvas.addChild(kdstatusboard);
	kdcanvas.addChild(kdenemystatusboard);
	kdcanvas.addChild(kdUItext);
	kdcanvas.addChild(kdminimap);
	kdcanvas.addChild(kdparticles);


	kdgamesound.filters = [kdoutlinefilter];
	KDBoardFilters = [kdmultiplyfilter, kdfogfilter];

	kdmapboard.filters = [
		...KDBoardFilters,
		kdgammafilter,
	];
})();



//PIXI.settings.RESOLUTION = resolution;
//PIXI.settings.FILTER_RESOLUTION = resolution;
/*
const viewport = new Viewport({
	worldWidth: 5000,
	worldHeight: 5000,
	screenWidth: window.innerWidth,
	screenHeight: window.innerHeight,
	events: PIXIapp.renderer.events,
  });*/



let ticker = PIXI.Ticker.shared;

window.onload = function() {
	KinkyDungeonRootDirectory = "Game/";
	pixiview = KinkyDungeonGetCanvas("MainCanvas");

	// window.onload in index.html
	CommonIsMobile = CommonDetectMobile();
	TranslationLoad();
	DrawLoad();
	CommonSetScreen("MiniGame", "KinkyDungeon");

	// LoginLoad
	Character = [];
	CharacterNextId = 1;
	CharacterReset(0, "Female3DCG");

	Player.ArousalSettings = { VFXFilter: "VFXFilterHeavy" };
	Player.OnlineSharedSettings = { ItemsAffectExpressions: true };
	Player.AudioSettings = { Volume: 1 };

	CurrentCharacter = null;

	// Default keybindings, these are initialized as part of the Player
	KDSetDefaultKeybindings();
	KinkyDungeonKeybindings = KinkyDungeonKeybindingsTemp;
	if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
		KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
	}

	KinkyDungeonLoad();

	ticker.add(() => {
		let Timestamp = performance.now();
		DrawProcess(Timestamp);

		// Increments the time from the last frame
		TimerRunInterval = Timestamp - TimerLastTime;
		TimerLastTime = Timestamp;
		CurrentTime = CurrentTime + TimerRunInterval;

		// At each 1700 ms, we check for timed events (equivalent of 100 cycles at 60FPS)
		if (TimerLastCycleCall + 1700 <= CommonTime()) {
			TimerLastCycleCall = CommonTime();
		}
	});

	//MainRun(0);
};

let TimerRunInterval: number = 0;
let TimerLastTime: number = 0;
let CurrentTime: number = 0;
let TimerLastCycleCall: number = 0;

/**
 * Main game running state, runs the drawing
 */
function MainRun(Timestamp: number): void {
	DrawProcess(Timestamp);

	// Increments the time from the last frame
	TimerRunInterval = Timestamp - TimerLastTime;
	TimerLastTime = Timestamp;
	CurrentTime = CurrentTime + TimerRunInterval;

	// At each 1700 ms, we check for timed events (equivalent of 100 cycles at 60FPS)
	if (TimerLastCycleCall + 1700 <= CommonTime()) {
		TimerLastCycleCall = CommonTime();
	}

	// Launches the main again for the next frame
	requestAnimationFrame(MainRun);
}

/**
 * When the user presses a key, we send the KeyDown event to the current screen if it can accept it
 */
function KeyDown(event: KeyboardEvent): void {
	if (event.repeat) return;
	KeyPress = event.keyCode || event.which;
	CommonKeyDown(event);
}

/**
 * When the user clicks, we fire the click event for other screens
 */
function Click(event: MouseEvent): void {
	//if (!CommonIsMobile) {
	//MouseMove(event);
	//CommonClick(event);
	//}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 */
function TouchStart(event: TouchEvent): void {
	/*if (CommonIsMobile && PIXICanvas) {
		TouchMove(event.touches[0]);
		//CommonClick(event);
		CommonTouchList = event.touches;
		mouseDown = true;
	}*/
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 */
function TouchEnd(event: TouchEvent): void {
	//if (CommonIsMobile && PIXICanvas) {
	//CommonTouchList = event.touches;
	//mouseDown = false;
	//}
}

/**
 * When touch moves, we keep it's position for other scripts
 */
function TouchMove(touch: Touch): void {
	//if (PIXICanvas) {
	//MouseX = Math.round((touch.pageX - PIXICanvas.offsetLeft) * 2000 / PIXICanvas.clientWidth);
	//MouseY = Math.round((touch.pageY - PIXICanvas.offsetTop) * 1000 / PIXICanvas.clientHeight);
	//}
}

/**
 * When mouse move, we keep the mouse position for other scripts
 */
function MouseMove(event: MouseEvent): void {
	if (PIXICanvas && (document.activeElement?.id == "MainCanvas" || document.activeElement?.id == PIXICanvas?.id || document.activeElement?.id == '')) {
		MouseX = Math.round(event.offsetX * 2000 / PIXICanvas.clientWidth);
		MouseY = Math.round(event.offsetY * 1000 / PIXICanvas.clientHeight);
	}
}

/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 */
function LoseFocus(event: MouseEvent): void {
	if (event.relatedTarget || (event as any).toElement /* toElement is for IE browser compat */) {
		MouseX = -1;
		MouseY = -1;
	}
}
