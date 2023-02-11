// While we want KD to be backwards compatible with BC, we want to avoid making modifications that are standalone specific to the KD code itself
// These bootstraps must be loaded last, as they replace BC specific KD functionality
KinkyDungeonMainRun = () => {};
KinkyDungeonMainClick = () => {};

ChatRoomChatLog = [];
ChatRoomLastMessage = [];

PreferenceMessage = "";

ChatRoomCharacterUpdate = () => {};
ChatRoomCharacterItemUpdate = () => {};

ArcadeKinkyDungeonEnd = () => {}
KinkyDungeonMultiplayerUpdate = () => {};

ArcadeDeviousDungeonChallenge = false;

const _CharacterAppearanceSetDefault = CharacterAppearanceSetDefault;
const _CharacterAppearanceFullRandom = CharacterAppearanceFullRandom;
const _CharacterLoadCanvas = CharacterLoadCanvas;
const _CharacterRefresh = CharacterRefresh;

function suppressCanvasUpdate(fn) {
	CharacterAppearanceSetDefault = () => {};
	CharacterAppearanceFullRandom = () => {};
	CharacterLoadCanvas = () => {};
	CharacterRefresh = () => {};
	let ret = fn();
	CharacterAppearanceSetDefault = _CharacterAppearanceSetDefault;
	CharacterAppearanceFullRandom = _CharacterAppearanceFullRandom;
	CharacterLoadCanvas = _CharacterLoadCanvas;
	CharacterRefresh = _CharacterRefresh;
	return ret;
}

window.onload = function() {
	ArcadeDeviousDungeonChallenge = false;
	KinkyDungeonRootDirectory = "Game/";

	// window.onload in index.html
	ServerURL = "foobar";
	CommonIsMobile = CommonDetectMobile();
	TranslationLoad();
	DrawLoad();
	AssetLoadAll();
	ControllerActive = false;
	let _TextLoad = TextLoad; // Avoid nonexistent text query
	TextLoad = () => {};
	CommonSetScreen("KinkyDungeon", "KinkyDungeonMain");
	TextLoad = _TextLoad;
	MainRun(0);

	// LoginLoad
	Character = [];
	CharacterNextId = 1;
	suppressCanvasUpdate(() => CharacterReset(0, "Female3DCG"));

	Player.ArousalSettings = {};
	Player.ArousalSettings.VFXFilter = "VFXFilterHeavy";
	Player.OnlineSharedSettings = {};
	Player.OnlineSharedSettings.ItemsAffectExpressions = true
	Player.AudioSettings = {};
	Player.AudioSettings.Volume = 1;
	Player.ImmersionSettings = {};

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
 * @param {number} Timestamp
 */
function MainRun(Timestamp) {
	DrawProcess(Timestamp);
	TimerProcess(Timestamp);
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
 * Handler for document-wide keydown event
 * @param {KeyboardEvent} event
 */
function DocumentKeyDown(event) {
	if (event.repeat) return;
	if (event.key == "Escape") {
		if (CurrentScreenFunctions.Exit) {
			CurrentScreenFunctions.Exit();
		} else if ((CurrentCharacter != null) && Array.isArray(DialogMenuButton) && (DialogMenuButton.indexOf("Exit") >= 0)) {
			if (!DialogLeaveFocusItem())
				DialogLeaveItemMenu();
		} else if ((CurrentCharacter != null) && (CurrentScreen == "ChatRoom")) {
			DialogLeave();
		} else if ((CurrentCharacter == null) && (CurrentScreen == "ChatRoom") && (document.getElementById("TextAreaChatLog") != null)) {
			ElementScrollToEnd("TextAreaChatLog");
		}
	} else if (event.key == "Tab") {
		KeyDown(event);
	}
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
	if (event.relatedTarget || event.toElement) {
		MouseX = -1;
		MouseY = -1;
	}
}