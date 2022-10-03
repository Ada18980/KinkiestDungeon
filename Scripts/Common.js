// Main variables
"use strict";
/** @type {PlayerCharacter} */
var Player;
/** @type {number|string} */
var KeyPress = "";
var CurrentModule;
/** @type {string} */
var CurrentScreen;
/** @type {ScreenFunctions} */
var CurrentScreenFunctions;
/** @type {Character|NPCCharacter|null} */
var CurrentCharacter = null;
var CurrentOnlinePlayers = 0;
var CurrentDarkFactor = 1.0;
var CommonIsMobile = false;
/** @type {Record<string, string[][]>} */
var CommonCSVCache = {};
var CutsceneStage = 0;

var CommonPhotoMode = false;
var GameVersion = "R0";
const GameVersionFormat = /^R([0-9]+)(?:(Alpha|Beta)([0-9]+)?)?$/;
var CommonVersionUpdated = false;
var CommonTouchList = null;

/**
 * An enum encapsulating possible chatroom message substitution tags. Character name substitution tags are interpreted
 * in chatrooms as follows (assuming the character name is Ben987):
 * SOURCE_CHAR: "Ben987"
 * DEST_CHAR: "Ben987's" (if character is not self), "her" (if character is self)
 * DEST_CHAR_NAME: "Ben987's"
 * TARGET_CHAR: "Ben987" (if character is not self), "herself" (if character is self)
 * TARGET_CHAR_NAME: "Ben987"
 * Additionally, sending the following tags will ensure that asset names in messages are correctly translated by
 * recipients:
 * ASSET_NAME: (substituted with the localized name of the asset, if available)
 * @type {Record<"SOURCE_CHAR"|"DEST_CHAR"|"DEST_CHAR_NAME"|"TARGET_CHAR"|"TARGET_CHAR_NAME"|"ASSET_NAME", CommonChatTags>}
 */
const CommonChatTags = {
	SOURCE_CHAR: "SourceCharacter",
	DEST_CHAR: "DestinationCharacter",
	DEST_CHAR_NAME: "DestinationCharacterName",
	TARGET_CHAR: "TargetCharacter",
	TARGET_CHAR_NAME: "TargetCharacterName",
	ASSET_NAME: "AssetName",
};

String.prototype.replaceAt=function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
};

/**
 * A map of keys to common font stack definitions. Each stack definition is a
 * two-item array whose first item is an ordered list of fonts, and whose
 * second item is the generic fallback font family (e.g. sans-serif, serif,
 * etc.)
 * @constant
 * @type {Object.<String, [String[], String]>}
 */
const CommonFontStacks = {
	Arial: [["Arial"], "sans-serif"],
	TimesNewRoman: [["Times New Roman", "Times"], "serif"],
	Papyrus: [["Papyrus", "Ink Free", "Segoe Script", "Gabriola"], "fantasy"],
	ComicSans: [["Comic Sans MS", "Comic Sans", "Brush Script MT", "Segoe Print"], "cursive"],
	Impact: [["Impact", "Arial Black", "Franklin Gothic", "Arial"], "sans-serif"],
	HelveticaNeue: [["Helvetica Neue", "Helvetica", "Arial"], "sans-serif"],
	Verdana: [["Verdana", "Helvetica Neue", "Arial"], "sans-serif"],
	CenturyGothic: [["Century Gothic", "Apple Gothic", "AppleGothic", "Futura"], "sans-serif"],
	Georgia: [["Georgia", "Times"], "serif"],
	CourierNew: [["Courier New", "Courier"], "monospace"],
	Copperplate: [["Copperplate", "Copperplate Gothic Light"], "fantasy"],
};

/**
 * Checks if a variable is a number
 * @param {*} n - Variable to check for
 * @returns {boolean} - Returns TRUE if the variable is a finite number
 */
function CommonIsNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Gets the current time as a string
 * @returns {string} - Returns the current date and time in a yyyy-mm-dd hh:mm:ss format
 */
function CommonGetFormatDate() {
	var d = new Date();
	var yyyy = d.getFullYear();
	var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
	var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
	var hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	var ss = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * Detects if the user is on a mobile browser
 * @returns {boolean} - Returns TRUE if the user is on a mobile browser
 */
function CommonDetectMobile() {

	// First check
	var mobile = ['iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile', 'mobile/', 'webos', 'kindle'];
	for (let i in mobile) if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) return true;

	// IPad pro check
	if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) return true;

	// Second check
	if (sessionStorage.desktop) return false;
	else if (localStorage.mobile) return true;

	// If nothing is found, we assume desktop
	return false;

}

/**
 * Gets the current browser name and version
 * @returns {{Name: string, Version: string}} - Browser info
 */
function CommonGetBrowser() {
	var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return { Name: "IE", Version: (tem[1] || "N/A") };
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\bOPR|Edge\/(\d+)/);
		if (tem != null) return { Name: "Opera", Version: tem[1] || "N/A" };
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
	return { Name: M[0] || "N/A", Version: M[1] || "N/A" };
}

/**
 * Parse a CSV file content into an array
 * @param {string} str - Content of the CSV
 * @returns {string[][]} Array representing each line of the parsed content, each line itself is split by commands and stored within an array.
 */
function CommonParseCSV(str) {
	/** @type {string[][]} */
	var arr = [];
	var quote = false;  // true means we're inside a quoted field
	var c;
	var col;
	// We remove whitespace on start and end
	str = str.replace(/\r\n/g, '\n').trim();

	// iterate over each character, keep track of current row and column (of the returned array)
	for (let row = col = c = 0; c < str.length; c++) {
		var cc = str[c], nc = str[c + 1];        // current character, next character
		arr[row] = arr[row] || [];             // create a new row if necessary
		arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

		// If the current character is a quotation mark, and we're inside a
		// quoted field, and the next character is also a quotation mark,
		// add a quotation mark to the current column and skip the next character
		if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

		// If it's just one quotation mark, begin/end quoted field
		if (cc == '"') { quote = !quote; continue; }

		// If it's a comma and we're not in a quoted field, move on to the next column
		if (cc == ',' && !quote) { ++col; continue; }

		// If it's a newline and we're not in a quoted field, move on to the next
		// row and move to column 0 of that new row
		if (cc == '\n' && !quote) { ++row; col = 0; continue; }

		// Otherwise, append the current character to the current column
		arr[row][col] += cc;
	}
	return arr;
}

/**
 *  Read a CSV file from cache, or fetch it from the server
 * @param {string} Array - Name of where the cached text is stored
 * @param {string} Path - Path/Group in which the screen is located
 * @param {string} Screen - Screen for which the file is for
 * @param {string} File - Name of the file to get
 * @returns {void} - Nothing
 */
function CommonReadCSV(Array, Path, Screen, File) {

	// Changed from a single path to various arguments and internally concatenate them
	// This ternary operator is used to keep backward compatibility
	var FullPath = "Screens/" + Path + "/" + Screen + "/" + File + ".csv";
	if (CommonCSVCache[FullPath]) {
		window[Array] = CommonCSVCache[FullPath];
		return;
	}

	// Opens the file, parse it and returns the result in an Object
	CommonGet(FullPath, function () {
		if (this.status == 200) {
			CommonCSVCache[FullPath] = CommonParseCSV(this.responseText);
			window[Array] = CommonCSVCache[FullPath];
		}
	});

	// If a translation file is available, we open the txt file and keep it in cache
	var TranslationPath = FullPath.replace(".csv", "_" + TranslationLanguage + ".txt");
	if (TranslationAvailable(TranslationPath))
		CommonGet(TranslationPath, function () {
			if (this.status == 200) TranslationCache[TranslationPath] = TranslationParseTXT(this.responseText);
		});

}

/**
 * AJAX utility to get a file and return its content. By default will retry requests 10 times
 * @param {string} Path - Path of the resource to request
 * @param {(this: XMLHttpRequest, xhr: XMLHttpRequest) => void} Callback - Callback to execute once the resource is received
 * @param {number} [RetriesLeft] - How many more times to retry if the request fails - after this hits zero, an error will be logged
 * @returns {void} - Nothing
 */
function CommonGet(Path, Callback, RetriesLeft) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", Path);
	xhr.onloadend = function() {
		// For non-error responses, call the callback
		if (this.status < 400) Callback.bind(this)(xhr);
		// Otherwise, retry
		else CommonGetRetry(Path, Callback, RetriesLeft);
	};
	xhr.onerror = function() { CommonGetRetry(Path, Callback, RetriesLeft); };
	xhr.send(null);
}

/**
 * Retry handler for CommonGet requests. Exponentially backs off retry attempts up to a limit of 1 minute. By default,
 * retries up to a maximum of 10 times.
 * @param {string} Path - The path of the resource to request
 * @param {(this: XMLHttpRequest, xhr: XMLHttpRequest) => void} Callback - Callback to execute once the resource is received
 * @param {number} [RetriesLeft] - How many more times to retry - after this hits zero, an error will be logged
 * @returns {void} - Nothing
 */
function CommonGetRetry(Path, Callback, RetriesLeft) {
	if (typeof RetriesLeft !== "number") RetriesLeft = 10;
	if (RetriesLeft <= 0) {
		console.error(`GET request to ${Path} failed - no more retries`);
	} else {
		const retrySeconds = Math.min(Math.pow(2, Math.max(0, 10 - RetriesLeft)), 60);
		console.warn(`GET request to ${Path} failed - retrying in ${retrySeconds} second${retrySeconds === 1 ? "" : "s"}...`);
		setTimeout(() => CommonGet(Path, Callback, RetriesLeft - 1), retrySeconds * 1000);
	}
}

/**
 * Catches the clicks on the main screen and forwards it to the current screen click function if it exists, otherwise it sends it to the dialog click function
 * @param {MouseEvent | TouchEvent} event - The event that triggered this
 * @returns {void} - Nothing
 */
function CommonClick(event) {
	ServerClickBeep();
	if (CurrentCharacter == null)
		CurrentScreenFunctions.Click(event);
	else
		DialogClick();
}

/**
 * Returns TRUE if a section of the screen is currently touched on a mobile device
 * @param {number} X - The X position
 * @param {number} Y - The Y position
 * @param {number} W - The width of the square
 * @param {number} H - The height of the square
 * @param {object} TL - Can give a specific touch event instead of the default one
 * @returns {boolean}
 */
function CommonTouchActive(X, Y, W, H, TL) {
	if (!CommonIsMobile) return false;
	if (TL == null) TL = CommonTouchList;
	if (TL != null)
		for (let Touch of TL) {
			let TouchX = Math.round((Touch.pageX - MainCanvas.canvas.offsetLeft) * 2000 / MainCanvas.canvas.clientWidth);
			let TouchY = Math.round((Touch.pageY - MainCanvas.canvas.offsetTop) * 1000 / MainCanvas.canvas.clientHeight);
			if ((TouchX >= X) && (TouchX <= X + W) && (TouchY >= Y) && (TouchY <= Y + H))
				return true;
		}
	return false;
}

/**
 * Catches key presses on the main screen and forwards it to the current screen key down function if it exists, otherwise it sends it to the dialog key down function
 * @param {KeyboardEvent} event - The event that triggered this
 * @returns {void} - Nothing
 */
function CommonKeyDown(event) {
	if (CurrentCharacter == null) {
		if (CurrentScreenFunctions.KeyDown)
			CurrentScreenFunctions.KeyDown(event);
		if (ControllerActive == true) {
			ControllerSupportKeyDown();
		}
	}
	else {
		StruggleKeyDown();
		if (ControllerActive == true) {
			ControllerSupportKeyDown();
		}
	}
}

/**
 * Calls a basic dynamic function if it exists, for complex functions, use: CommonDynamicFunctionParams
 * @param {string} FunctionName - Name of the function to call
 * @returns {void} - Nothing
 */
function CommonDynamicFunction(FunctionName) {
	if (typeof window[FunctionName.substr(0, FunctionName.indexOf("("))] === "function")
		window[FunctionName.replace("()", "")]();
	else
		console.log("Trying to launch invalid function: " + FunctionName);
}


/**
 * Calls a dynamic function with parameters (if it exists), also allow ! in front to reverse the result. The dynamic function is the provided function name in the dialog option object and it is prefixed by the current screen.
 * @param {string} FunctionName - Function name to call dynamically
 * @returns {*} - Returns what the dynamic function returns or FALSE if the function does not exist
 */
function CommonDynamicFunctionParams(FunctionName) {

	// Gets the reverse (!) sign
	var Reverse = false;
	if (FunctionName.substring(0, 1) == "!") Reverse = true;
	FunctionName = FunctionName.replace("!", "");

	// Gets the real function name and parameters
	var ParamCount = 1;
	if (FunctionName.indexOf("()") >= 0) ParamCount = 0;
	else ParamCount = FunctionName.split(",").length;
	var openParenthesisIndex = FunctionName.indexOf("(");
	var closedParenthesisIndex = FunctionName.indexOf(")", openParenthesisIndex);
	var Params = FunctionName.substring(openParenthesisIndex + 1, closedParenthesisIndex).split(",");
	for (let P = 0; P < Params.length; P++)
		Params[P] = Params[P].trim().replace('"', '').replace('"', '');
	FunctionName = FunctionName.substring(0, openParenthesisIndex);
	if ((FunctionName.indexOf("Dialog") != 0) && (FunctionName.indexOf("Inventory") != 0) && (FunctionName.indexOf(CurrentScreen) != 0)) FunctionName = CurrentScreen + FunctionName;

	// If it's really a function, we continue
	if (typeof window[FunctionName] === "function") {

		// Launches the function with the params and returns the result
		var Result = true;
		if (ParamCount == 0) Result = window[FunctionName]();
		if (ParamCount == 1) Result = window[FunctionName](Params[0]);
		if (ParamCount == 2) Result = window[FunctionName](Params[0], Params[1]);
		if (ParamCount == 3) Result = window[FunctionName](Params[0], Params[1], Params[2]);
		if (Reverse) return !Result;
		else return Result;

	} else {

		// Log the error in the console
		console.log("Trying to launch invalid function: " + FunctionName);
		return false;

	}

}


/**
 *  Calls a named global function with the passed in arguments, if the named function exists. Differs from
 *  CommonDynamicFunctionParams in that arguments are not parsed from the passed in FunctionName string, but
 *  passed directly into the function call, allowing for more complex JS objects to be passed in. This
 *  function will not log to console if the provided function name does not exist as a global function.
 * @param {string} FunctionName - The name of the global function to call
 * @param {any[]} [args] - zero or more arguments to be passed to the function (optional)
 * @returns {any} - returns the result of the function call, or undefined if the function name isn't valid
 */
function CommonCallFunctionByName(FunctionName/*, ...args */) {
	var Function = window[FunctionName];
	if (typeof Function === "function") {
		var args = Array.prototype.slice.call(arguments, 1);
		return Function.apply(null, args);
	}
}

/**
 * Behaves exactly like CommonCallFunctionByName, but logs a warning if the function name is invalid.
 * @param {string} FunctionName - The name of the global function to call
 * @param {any[]} [args] - zero or more arguments to be passed to the function (optional)
 * @returns {any} - returns the result of the function call, or undefined if the function name isn't valid
 */
function CommonCallFunctionByNameWarn(FunctionName/*, ...args */) {
	var Function = window[FunctionName];
	if (typeof Function === "function") {
		var args = Array.prototype.slice.call(arguments, 1);
		return Function.apply(null, args);
	} else {
		console.warn(`Attempted to call invalid function "${FunctionName}"`);
	}
}

/**
 * Sets the current screen and calls the loading script if needed
 * @param {string} NewModule - Module of the screen to display
 * @param {string} NewScreen - Screen to display
 * @returns {void} - Nothing
 */
function CommonSetScreen(NewModule, NewScreen) {
	const prevScreen = CurrentScreen;

	if (CurrentScreenFunctions && CurrentScreenFunctions.Unload) {
		CurrentScreenFunctions.Unload();
	}
	if (ControllerActive == true) {
		ClearButtons();
	}


	// Check for required functions
	if (typeof window[`${NewScreen}Run`] !== "function") {
		throw Error(`Screen "${NewScreen}": Missing required Run function`);
	}
	if (typeof window[`${NewScreen}Click`] !== "function") {
		throw Error(`Screen "${NewScreen}": Missing required Click function`);
	}

	CurrentModule = NewModule;
	CurrentScreen = NewScreen;
	CurrentScreenFunctions = {
		Run: window[`${NewScreen}Run`],
		Click: window[`${NewScreen}Click`],
		Load: typeof window[`${NewScreen}Load`] === "function" ? window[`${NewScreen}Load`] : undefined,
		Unload: typeof window[`${NewScreen}Unload`] === "function" ? window[`${NewScreen}Unload`] : undefined,
		Resize: typeof window[`${NewScreen}Resize`] === "function" ? window[`${NewScreen}Resize`] : undefined,
		KeyDown: typeof window[`${NewScreen}KeyDown`] === "function" ? window[`${NewScreen}KeyDown`] : undefined,
		Exit: typeof window[`${NewScreen}Exit`] === "function" ? window[`${NewScreen}Exit`] : undefined
	};

	CurrentDarkFactor = 1.0;
	CommonGetFont.clearCache();
	CommonGetFontName.clearCache();
	TextLoad();

	if (CurrentScreenFunctions.Load) {
		CurrentScreenFunctions.Load();
	}
	if (CurrentScreenFunctions.Resize) {
		CurrentScreenFunctions.Resize(true);
	}

	if (prevScreen == "ChatSearch" || prevScreen == "ChatCreate")
		ChatRoomStimulationMessage("Walk");
}

/**
 * Gets the current time in ms
 * @returns {number} - Date in ms
 */
function CommonTime() {
	return Date.now();
}

/**
 * Checks if a given value is a valid HEX color code
 * @param {string} Value - Potential HEX color code
 * @returns {boolean} - Returns TRUE if the string is a valid HEX color
 */
function CommonIsColor(Value) {
	if ((Value == null) || (Value.length < 3)) return false;
	//convert short hand hex color to standard format
	if (/^#[0-9A-F]{3}$/i.test(Value)) Value = "#" + Value[1] + Value[1] + Value[2] + Value[2] + Value[3] + Value[3];
	return /^#[0-9A-F]{6}$/i.test(Value);
}

/**
 * Checks whether an item's color has a valid value that can be interpreted by the drawing
 * functions. Valid values are null, undefined, strings, and an array containing any of the
 * aforementioned types.
 * @param {*} Color - The Color value to check
 * @returns {boolean} - Returns TRUE if the color is a valid item color
 */
function CommonColorIsValid(Color) {
	if (Color == null || typeof Color === "string") return true;
	if (Array.isArray(Color)) return Color.every(C => C == null || typeof C === "string");
	return false;
}

/**
 * Get a random item from a list while making sure not to pick the previous one.
 * @template T
 * @param {T} ItemPrevious - Previously selected item from the given list
 * @param {T[]} ItemList - List for which to pick a random item from
 * @returns {T} - The randomly selected item from the list
 */
function CommonRandomItemFromList(ItemPrevious, ItemList) {
	var NewItem = ItemPrevious;
	while (NewItem == ItemPrevious)
		NewItem = ItemList[Math.floor(Math.random() * ItemList.length)];
	return NewItem;
}

/**
 * Converts a string of numbers split by commas to an array, sanitizes the array by removing all NaN or undefined elements.
 * @param {string} s - String of numbers split by commas
 * @returns {number[]} - Array of valid numbers from the given string
 */
function CommonConvertStringToArray(s) {
	var arr = [];
	if (s != "") {
		arr = s.split(',').reduce((list, curr) => {
			if (!(!curr || Number.isNaN(Number(curr)))) list.push(Number(curr));
			return list;
		}, []);
	}
	return arr;
}

/**
 * Converts an array to a string separated by commas (equivalent of .join(","))
 * @param {Array} Arr - Array to convert to a joined string
 * @returns {string} - String of all the array items joined together
 */
function CommonConvertArrayToString(Arr) {
	var S = "";
	for (let P = 0; P < Arr.length; P++) {
		if (P != 0) S = S + ",";
		S = S + Arr[P].toString();
	}
	return S;
}

/**
 * Checks whether two item colors are equal. An item color may either be a string or an array of strings.
 * @param {string|string[]} C1 - The first color to check
 * @param {string|string[]} C2 - The second color to check
 * @returns {boolean} - TRUE if C1 and C2 represent the same item color, FALSE otherwise
 */
function CommonColorsEqual(C1, C2) {
	if (Array.isArray(C1) && Array.isArray(C2)) {
		return CommonArraysEqual(C1, C2);
	}
	return C1 === C2;
}

/**
 * Checks whether two arrays are equal. The arrays are considered equal if they have the same length and contain the same items in the same
 * order, as determined by === comparison
 * @param {*[]} a1 - The first array to compare
 * @param {*[]} a2 - The second array to compare
 * @returns {boolean} - TRUE if both arrays have the same length and contain the same items in the same order, FALSE otherwise
 */
function CommonArraysEqual(a1, a2) {
	return a1.length === a2.length && a1.every((item, i) => item === a2[i]);
}

/**
 * Creates a debounced wrapper for the provided function with the provided wait time. The wrapped function will not be called as long as
 * the debounced function continues to be called. If the debounced function is called, and then not called again within the wait time, the
 * wrapped function will be called.
 * @param {function} func - The function to debounce
 * @returns {function} - A debounced version of the provided function
 */
function CommonDebounce(func) {
	let timeout, args, context, timestamp, result, wait;

	function later() {
		const last = CommonTime() - timestamp;
		if (last >= 0 && last < wait) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			result = func.apply(context, args);
			context = args = null;
		}
	}

	return function (waitInterval/*, ...args */) {
		context = this;
		wait = waitInterval;
		args = Array.prototype.slice.call(arguments, 1);
		timestamp = CommonTime();
		if (!timeout) {
			timeout = setTimeout(later, wait);
		}
		return result;
	};
}

/**
 * Creates a throttling wrapper for the provided function with the provided wait time. If the wrapped function has been successfully called
 * within the wait time, further call attempts will be delayed until the wait time has passed.
 * @param {function} func - The function to throttle
 * @returns {function} - A throttled version of the provided function
 */
function CommonThrottle(func) {
	let timeout, args, context, timestamp = 0, result;

	function run() {
		timeout = null;
		result = func.apply(context, args);
		timestamp = CommonTime();
	}

	return function (wait/*, ...args */) {
		context = this;
		args = Array.prototype.slice.call(arguments, 1);
		if (!timeout) {
			const last = CommonTime() - timestamp;
			if (last >= 0 && last < wait) {
				timeout = setTimeout(run, wait - last);
			} else {
				run();
			}
		}
		return result;
	};
}

/**
 * Creates a wrapper for a function to limit how often it can be called. The player-defined wait interval setting determines the
 * allowed frequency. Below 100 ms the function will be throttled and above will be debounced.
 * @param {function} func - The function to limit calls of
 * @param {number} [minWait=0] - A lower bound for how long the wait interval can be, 0 by default
 * @param {number} [maxWait=1000] - An upper bound for how long the wait interval can be, 1 second by default
 * @returns {function} - A debounced or throttled version of the function
 */
function CommonLimitFunction(func, minWait = 0, maxWait = 1000) {
	const funcDebounced = CommonDebounce(func);
	const funcThrottled = CommonThrottle(func);

	return function () {
		const wait = Math.min(
			Math.max(
				Player.GraphicsSettings ? Player.GraphicsSettings.AnimationQuality : 100, minWait
			),
			maxWait,
		);
		const args = [wait].concat(Array.from(arguments));
		return wait < 100 ? funcThrottled.apply(this, args) : funcDebounced.apply(this, args);
	};
}

/**
 * Creates a simple memoizer.
 * The memoized function does calculate its result exactly once and from that point on, uses
 * the result stored in a local cache to speed up things.
 * @template {Function} T
 * @param {T} func - The function to memoize
 * @returns {MemoizedFunction<T>} - The result of the memoized function
 */
function CommonMemoize(func) {
	var memo = {};

	/** @type {MemoizedFunction<T>} */
	// @ts-ignore
	var memoized = function () {
		var index = [];
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] === "object") {
				index.push(JSON.stringify(arguments[i]));
			} else {
				index.push(String(arguments[i]));
			}
		} // for
		if (!(index in memo)) {
			memo[index] = func.apply(this, arguments);
		}
		return memo[index];
	}; // function

	// add a clear cache method
	memoized.clearCache = function () {
		memo = {};
	};
	return memoized;
} // CommonMemoize

/**
 * Memoized getter function. Returns a font string specifying the player's
 * preferred font and the provided size. This is memoized as it is called on
 * every frame in many cases.
 * @param {number} size - The font size that should be specified in the
 * returned font string
 * @returns {string} - A font string specifying the requested font size and
 * the player's preferred font stack. For example:
 * 12px "Courier New", "Courier", monospace
 */
const CommonGetFont = CommonMemoize((size) => {
	return `${size}px ${CommonGetFontName()}`;
});

/**
 * Memoized getter function. Returns a font string specifying the player's
 * preferred font stack. This is memoized as it is called on every frame in
 * many cases.
 * @returns {string} - A font string specifying the player's preferred font
 * stack. For example:
 * "Courier New", "Courier", monospace
 */
const CommonGetFontName = CommonMemoize(() => {
	const pref = Player && Player.GraphicsSettings && Player.GraphicsSettings.Font;
	const fontStack = CommonFontStacks[pref] || CommonFontStacks.Arial;
	const font = fontStack[0].map(fontName => `"${fontName}"`).join(", ");
	return `${font}, ${fontStack[1]}`;
});

/**
 * Take a screenshot of specified area in "photo mode" and open the image in a new tab
 * @param {number} Left - Position of the area to capture from the left of the canvas
 * @param {number} Top - Position of the area to capture from the top of the canvas
 * @param {number} Width - Width of the area to capture
 * @param {number} Height - Height of the area to capture
 * @returns {void} - Nothing
 */
function CommonTakePhoto(Left, Top, Width, Height) {
	CommonPhotoMode = true;

	// Ensure everything is redrawn once in photo-mode
	DrawProcess(0);

	// Capture screen as image URL
	const ImgData = /** @type {HTMLCanvasElement} */ (document.getElementById("MainCanvas")).getContext('2d').getImageData(Left, Top, Width, Height);
	let PhotoCanvas = document.createElement('canvas');
	PhotoCanvas.width = Width;
	PhotoCanvas.height = Height;
	PhotoCanvas.getContext('2d').putImageData(ImgData, 0, 0);
	const PhotoImg = PhotoCanvas.toDataURL("image/png");

	// Open the image in a new window
	let newWindow = window.open('about:blank', '_blank');
	if (newWindow) {
		newWindow.document.write("<img src='" + PhotoImg + "' alt='from canvas'/>");
		newWindow.document.close();
	} else {
		console.warn("Popups blocked: Cannot open photo in new tab.");
	}

	CommonPhotoMode = false;
}

/**
 * Takes an array of items and converts it to record format
 * @param { { Group: string; Name: string; Type?: string|null }[] } arr The array of items
 * @returns { { [group: string]: { [name: string]: string[] } } } Output in object foramat
 */
function CommonPackItemArray(arr) {
	/** @type { Record<string, Record<string, string[]>> } */
	const res = {};
	for (const I of arr) {
		let G = res[I.Group];
		if (G === undefined) {
			G = res[I.Group] = {};
		}
		let A = G[I.Name];
		if (A === undefined) {
			A = G[I.Name] = [];
		}
		const T = I.Type || "";
		if (!A.includes(T)) {
			A.push(T);
		}
	}
	return res;
}

/**
 * Takes an record format of items and converts it to array
 * @param { { [group: string]: { [name: string]: string[] } } } arr Object defining items
 * @return { { Group: string; Name: string; Type?: string }[] } The array of items
 */
function CommonUnpackItemArray(arr) {
	const res = [];
	for (const G of Object.keys(arr)) {
		for (const A of Object.keys(arr[G])) {
			for (const T of arr[G][A]) {
				res.push({ Group: G, Name: A, Type: T ? T : undefined });
			}
		}
	}
	return res;
}

/**
 * Compares two version numbers and returns -1/0/1 if Other number is smaller/same/larger than Current one
 * @param {string} Current Current version number
 * @param {string} Other Other version number
 * @returns {-1|0|1} Comparison result
 */
function CommonCompareVersion(Current, Other) {
	const CurrentMatch = GameVersionFormat.exec(Current);
	const OtherMatch = GameVersionFormat.exec(Other);
	if (CurrentMatch == null || OtherMatch == null || isNaN(CurrentMatch[1]) || isNaN(OtherMatch[1])) return -1;
	const CurrentVer = [
		Number.parseInt(CurrentMatch[1]),
		CurrentMatch[2] === "Alpha" ? 1 : CurrentMatch[2] === "Beta" ? 2 : 3,
		Number.parseInt(CurrentMatch[3]) || 0
	];
	const OtherVer = [
		Number.parseInt(OtherMatch[1]),
		OtherMatch[2] === "Alpha" ? 1 : OtherMatch[2] === "Beta" ? 2 : 3,
		Number.parseInt(OtherMatch[3]) || 0
	];
	for (let i = 0; i < 3; i++) {
		if (CurrentVer[i] !== OtherVer[i]) {
			return /** @type {-1|0|1} */ (Math.sign(OtherVer[i] - CurrentVer[i]));
		}
	}
	return 0;
}

/**
 * A simple deep equality check function which checks whether two objects are equal. The function traverses recursively
 * into objects and arrays to check for equality. Primitives and simple types are considered equal as defined by `===`.
 * @param {*} obj1 - The first object to compare
 * @param {*} obj2 - The second object to compare
 * @returns {boolean} - TRUE if both objects are equal, up to arbitrarily deeply nested property values, FALSE
 * otherwise.
 */
function CommonDeepEqual(obj1, obj2) {
	if (obj1 === obj2) {
		return true;
	}

	if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
		// If the objects do not share a prototype, they are not equal
		if (Object.getPrototypeOf(obj1) !== Object.getPrototypeOf(obj2)) {
			return false;
		}

		// Get the keys for the objects
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		// If the objects have different numbers of keys, they are not equal
		if (keys1.length !== keys2.length) {
			return false;
		}

		// Sort the keys
		keys1.sort();
		keys2.sort();
		return keys1.every((key, i) => {
			// If the keys are different, the objects are not equal
			if (key !== keys2[i]) {
				return false;
			}
			// Otherwise, compare the values
			return CommonDeepEqual(obj1[key], obj2[key]);
		});
	}

	return false;
}

/**
 * Adds all items from the source array to the destination array if they aren't already included
 * @param {*[]} dest - The destination array
 * @param {*[]} src - The source array
 * @returns {*[]} - The destination array
 */
function CommonArrayConcatDedupe(dest, src) {
	if (Array.isArray(src) && Array.isArray(dest)) {
		for (const item of src) {
			if (!dest.includes(item)) dest.push(item);
		}
	}
	return dest;
}

/**
 * Common function for removing a padlock from an item and publishing a corresponding chat message (must be called with
 * the item's group focused)
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} Item - The item to unlock
 * @returns {void} - Nothing
 */
function CommonPadlockUnlock(C, Item) {
	for (let A = 0; A < C.Appearance.length; A++) {
		if (C.Appearance[A].Asset.Group.Name === C.FocusGroup.Name) {
			C.Appearance[A] = Item;
			break;
		}
	}
	InventoryUnlock(C, C.FocusGroup.Name);
	ChatRoomPublishAction(C, Item, null, true, "ActionUnlock");
}

/**
 * Common noop function
 * @returns {void} - Nothing
 */
function CommonNoop() {
	// Noop function
}

/**
 * Redirects the address to HTTPS for all production environments, returns the proper heroku server
 * @returns {String} - Returns the proper server to use in production or test
 */
function CommonGetServer() {
	if ((location.href.indexOf("bondageprojects") < 0) && (location.href.indexOf("bondage-europe") < 0)) return "https://bc-server-test.herokuapp.com/";
	if (location.protocol !== 'https:') location.replace(`https:${location.href.substring(location.protocol.length)}`);
	return "https://bondage-club-server.herokuapp.com/";
}
