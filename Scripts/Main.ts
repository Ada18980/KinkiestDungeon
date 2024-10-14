//import * as PIXI from "pixi.js"
//import { Viewport } from "../node_modules/pixi-viewport/dist/Viewport";

const PIXIWidth = 2000;
const PIXIHeight = 1000;

let resolution = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
var PIXIapp = new PIXI.Application({
	//view: document.getElementById("MainCanvas"),
	antialias: false,
	powerPreference: 'high-performance',
	resolution: resolution,//KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0],
	width: PIXIWidth,
	height: PIXIHeight,
});

//PIXI.settings.RESOLUTION = resolution;
PIXI.settings.FILTER_RESOLUTION = resolution;
/*
const viewport = new Viewport({
	worldWidth: 5000,
	worldHeight: 5000,
	screenWidth: window.innerWidth,
	screenHeight: window.innerHeight,
	events: PIXIapp.renderer.events,
  });*/


document.body.appendChild(PIXIapp.view as any);

/*kdcanvas.scale.x = resolution;
kdcanvas.scale.y = resolution;
kdui.scale.x = resolution;
kdui.scale.y = resolution;*/

PIXIapp.stage.addChild(kdcanvas);
PIXIapp.stage.addChild(kdui);

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
	CharacterReset(0);


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

	PIXIapp.stage.interactiveChildren = false;

	(PIXIapp.renderer as PIXIRenderer).gl.canvas.addEventListener('webglcontextlost', () => {
		console.error('WebGl context lost');

		//load();
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
