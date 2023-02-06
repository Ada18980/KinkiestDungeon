'use strict';


// While we want KD to be backwards compatible with BC, we want to avoid making modifications that are standalone specific to the KD code itself
// These bootstraps must be loaded last, as they replace BC specific KD functionality

const _CharacterAppearanceSetDefault = CharacterAppearanceSetDefault;
const _CharacterLoadCanvas = CharacterLoadCanvas;
const _CharacterRefresh = CharacterRefresh;

function AssetGet(arg1, arg2, arg3) {
	return undefined;
}

function suppressCanvasUpdate(fn) {
	let ret = fn();
	return ret;
}

window.onload = function() {
	KinkyDungeonRootDirectory = "Game/";

	// window.onload in index.html
	ServerURL = "foobar";
	CommonIsMobile = CommonDetectMobile();
	TranslationLoad();
	DrawLoad();
	MiniGameStart("KinkyDungeon", 1, "ArcadeKinkyDungeonEnd");

	// LoginLoad
	Character = [];
	CharacterNextId = 1;
	CharacterReset(0, "Female3DCG");

	// @ts-ignore
	Player.ArousalSettings = {};
	Player.ArousalSettings.VFXFilter = "VFXFilterHeavy";
	// @ts-ignore
	Player.OnlineSharedSettings = {};
	Player.OnlineSharedSettings.ItemsAffectExpressions = true;
	// @ts-ignore
	Player.AudioSettings = {};
	Player.AudioSettings.Volume = 1;
	// @ts-ignore
	Player.ImmersionSettings = {};

	CurrentCharacter = null;

	// Default keybindings, these are initialized as part of the Player
	KinkyDungeonKeybindings = {
		Down: "KeyS",
		DownLeft: "KeyZ",
		DownRight: "KeyC",
		Left: "KeyA",
		Right: "KeyD",
		Skip: "Space",
		Spell1: "Digit1",
		Spell2: "Digit2",
		Spell3: "Digit3",
		Spell4: "Digit4",
		Spell5: "Digit5",
		Up: "KeyW",
		UpLeft: "KeyQ",
		UpRight: "KeyE",
		Wait: "KeyX",
	};
	if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
		KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
	}

	KinkyDungeonLoad();

	MainRun(0);
};

let TimerRunInterval = 0;
let TimerLastTime = 0;
let CurrentTime = 0;
let TimerLastCycleCall = 0;

/**
 * Main game running state, runs the drawing
 * @param {number} Timestamp
 */
function MainRun(Timestamp) {
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
 * @param {KeyboardEvent} event
 */
function KeyDown(event) {
	if (event.repeat) return;
	KeyPress = event.keyCode || event.which;
	CommonKeyDown(event);
}

/**
 * When the user clicks, we fire the click event for other screens
 * @param {MouseEvent} event
 */
function Click(event) {
	if (!CommonIsMobile) {
		MouseMove(event);
		CommonClick(event);
	}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 * @param {TouchEvent} event
 */
function TouchStart(event) {
	if (CommonIsMobile && MainCanvas) {
		TouchMove(event.touches[0]);
		CommonClick(event);
		CommonTouchList = event.touches;
	}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 * @param {TouchEvent} event
 */
function TouchEnd(event) {
	if (CommonIsMobile && MainCanvas)
		CommonTouchList = event.touches;
}

/**
 * When touch moves, we keep it's position for other scripts
 * @param {Touch} touch
 */
function TouchMove(touch) {
	if (MainCanvas) {
		MouseX = Math.round((touch.pageX - MainCanvas.canvas.offsetLeft) * 2000 / MainCanvas.canvas.clientWidth);
		MouseY = Math.round((touch.pageY - MainCanvas.canvas.offsetTop) * 1000 / MainCanvas.canvas.clientHeight);
	}
}

/**
 * When mouse move, we keep the mouse position for other scripts
 * @param {MouseEvent} event
 */
function MouseMove(event) {
	if (MainCanvas) {
		MouseX = Math.round(event.offsetX * 2000 / MainCanvas.canvas.clientWidth);
		MouseY = Math.round(event.offsetY * 1000 / MainCanvas.canvas.clientHeight);
	}
}

/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 * @param {MouseEvent} event
 */
function LoseFocus(event) {
	// @ts-ignore
	if (event.relatedTarget || event.toElement) {
		MouseX = -1;
		MouseY = -1;
	}
}