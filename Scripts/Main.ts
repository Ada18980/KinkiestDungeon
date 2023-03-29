// While we want KD to be backwards compatible with BC, we want to avoid making modifications that are standalone specific to the KD code itself
// These bootstraps must be loaded last, as they replace BC specific KD functionality
///
// There are a lot of `as any` hacks here, most of them are because we need to do global replacements, and typescript emits 'use strict' by default 
(window as any).KinkyDungeonMainRun = () => {};
(window as any).KinkyDungeonMainClick = () => {};
(window as any).KinkyDungeonMultiplayerUpdate = () => {};

function ActivityArousalItem(Source: any, Target: any, Asset: any): void {}
function ActivityAllowedForGroup(C: any, Group: any, _: boolean = true): void {}
function ChatRoomPublishAction(C: any, Action: any, PrevItem: any, NextItem: any): void {}
function ChatRoomPublishCustomAction(msg: string, LeaveDialog: boolean, Dictionary: any): void {}
function ChatRoomCharacterItemUpdate(C: any, Group: any): void {}
function ChatRoomMessage(data: any): void {}
function ChatRoomStimulationMessage(msg: string): void {}
function DialogFind(C: any, KeyWord1: string, KeyWord2: string = null, ReturnPrevious: boolean = true): any {}
function DialogLeave(): void {}
function DialogClick(): void {}
function DialogLeaveItemMenu(): void {}
function InventoryItemPelvisMetalChastityBeltNpcDialog(C: any, option: any): void {}
function PlatformDialogController(Buttons: any): any {}
function PlatformController(Buttons: any): any {}
function StruggleKeyDown(): void {}

let ChatRoomData = null;
let ChatRoomCharacter = null;
let ChatRoomChatLog = [];
let ChatRoomLastMessage = [];
let ChatRoomSpace = ''; 
let ChatRoomTargetMemberNumber = null;
let PreferenceMessage = "";
let ArcadeKinkyDungeonEnd = () => {}
let StruggleLockPickProgressCurrentTries = 0;
let StruggleProgressPrevItem = null;
let StruggleProgressStruggleCount = 0;
let ActivityOrgasmGameTimer = 0;
let PreferenceCalibrationStage = 0;
let MainHallStrongLocks = null;

const _CharacterAppearanceSetDefault = CharacterAppearanceSetDefault;
const _CharacterAppearanceFullRandom = CharacterAppearanceFullRandom;
const _CharacterLoadCanvas = CharacterLoadCanvas;
const _CharacterRefresh = CharacterRefresh;

function suppressCanvasUpdate<T>(fn: () => T): T {
	(CharacterAppearanceSetDefault as any) = () => {};
	(CharacterAppearanceFullRandom as any) = () => {};
	(CharacterLoadCanvas as any) = () => {};
	(CharacterRefresh as any) = () => {};
	let ret = fn();
	(CharacterAppearanceSetDefault as any) = _CharacterAppearanceSetDefault;
	(CharacterAppearanceFullRandom as any) = _CharacterAppearanceFullRandom;
	(CharacterLoadCanvas as any) = _CharacterLoadCanvas;
	(CharacterRefresh as any) = _CharacterRefresh;
	return ret;
}

window.onload = function() {
	KinkyDungeonRootDirectory = "Game/";

	// window.onload in index.html
	ServerURL = "foobar";
	CommonIsMobile = CommonDetectMobile();
	TranslationLoad();
	DrawLoad();
	AssetLoadAll();
	ControllerActive = false;
	let _TextLoad = TextLoad; // Avoid nonexistent text query
	(TextLoad as any) = () => {};
	CommonSetScreen("KinkyDungeon", "KinkyDungeonMain");
	(TextLoad as any) = _TextLoad;
	MainRun(0);

	// LoginLoad
	Character = [];
	CharacterNextId = 1;
	suppressCanvasUpdate(() => CharacterReset(0, "Female3DCG"));

	Player.ArousalSettings = {} as any;
	Player.ArousalSettings.VFXFilter = "VFXFilterHeavy";
	Player.OnlineSharedSettings = {} as any;
	Player.OnlineSharedSettings.ItemsAffectExpressions = true
	Player.AudioSettings = {} as any;
	Player.AudioSettings.Volume = 1;
	Player.ImmersionSettings = {} as any;

	CharacterLoadCSVDialog(Player);

	CharacterAppearanceSetDefault(Player);
	CurrentCharacter = null;
	MiniGameStart("KinkyDungeon", 1, "ArcadeKinkyDungeonEnd");

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
};

/**
 * Main game running state, runs the drawing
 */
function MainRun(Timestamp: number): void {
	DrawProcess(Timestamp);
	TimerProcess(Timestamp);
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
 * Handler for document-wide keydown event
 */
function DocumentKeyDown(event: KeyboardEvent): void {
	if (event.repeat) return;
	if (event.key == "Escape") {
		if (CurrentScreenFunctions.Exit) {
			CurrentScreenFunctions.Exit();
		} else if ((CurrentCharacter == null) && (CurrentScreen == "ChatRoom") && (document.getElementById("TextAreaChatLog") != null)) {
			ElementScrollToEnd("TextAreaChatLog");
		}
	} else if (event.key == "Tab") {
		KeyDown(event);
	}
}

/**
 * When the user clicks, we fire the click event for other screens
 */
function Click(event: MouseEvent): void {
	if (!CommonIsMobile) {
		MouseMove(event);
		CommonClick(event);
	}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 */
function TouchStart(event: TouchEvent): void {
	if (CommonIsMobile && MainCanvas) {
		TouchMove(event.touches[0]);
		CommonClick(event);
		CommonTouchList = event.touches;
	}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 */
function TouchEnd(event: TouchEvent): void {
	if (CommonIsMobile && MainCanvas)
		CommonTouchList = event.touches;
}

/**
 * When touch moves, we keep it's position for other scripts
 */
function TouchMove(touch: Touch): void {
	if (MainCanvas) {
		MouseX = Math.round((touch.pageX - MainCanvas.canvas.offsetLeft) * 2000 / MainCanvas.canvas.clientWidth);
		MouseY = Math.round((touch.pageY - MainCanvas.canvas.offsetTop) * 1000 / MainCanvas.canvas.clientHeight);
	}
}

/**
 * When mouse move, we keep the mouse position for other scripts
 */
function MouseMove(event: MouseEvent): void {
	if (MainCanvas) {
		MouseX = Math.round(event.offsetX * 2000 / MainCanvas.canvas.clientWidth);
		MouseY = Math.round(event.offsetY * 1000 / MainCanvas.canvas.clientHeight);
	}
}

/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 */
function LoseFocus(event: MouseEvent): void {
	if (event.relatedTarget || (event as any).toElement) { // `toElement` is for IE compatibility
		MouseX = -1;
		MouseY = -1;
	}
}