// Main variables
let DefaultPlayer: PlayerCharacter;
let KeyPress: number | string = "";
let CurrentModule: string;
let CurrentScreen: string;
let CurrentCharacter: Character | null = null;
let CurrentOnlinePlayers = 0;
let CurrentDarkFactor = 1.0;
let CommonIsMobile = false;
let CommonCSVCache: {[_: string]: string[][]} = {};
let CutsceneStage = 0;

let CommonPhotoMode = false;
let GameVersion = "R0";
const GameVersionFormat = /^R([0-9]+)(?:(Alpha|Beta)([0-9]+)?)?$/;
let CommonVersionUpdated = false;
let CommonTouchList = null;

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
 * @param n - Variable to check for
 * @returns Returns TRUE if the variable is a finite number
 */
function CommonIsNumeric(n: any): boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Gets the current time as a string
 * @returns Returns the current date and time in a yyyy-mm-dd hh:mm:ss format
 */
function CommonGetFormatDate(): string {
	let d = new Date();
	let yyyy = d.getFullYear();
	let mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
	let dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
	let hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	let ss = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * Detects if the user is on a mobile browser
 * @returns Returns TRUE if the user is on a mobile browser
 */
function CommonDetectMobile(): boolean {

	// First check
	let mobile = ['iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile', 'mobile/', 'webos', 'kindle'];
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
 * @returns Browser info
 */
function CommonGetBrowser(): {Name: string, Version: string} {
	let ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
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
 * @param str - Content of the CSV
 * @returns Array representing each line of the parsed content, each line itself is split by commands and stored within an array.
 */
function CommonParseCSV(str: string): string[][] {
	let arr: string[][] = [];
	let quote = false;  // true means we're inside a quoted field
	let c: number;
	let col: number;
	// We remove whitespace on start and end
	str = str.replace(/\r\n/g, '\n').trim();

	// iterate over each character, keep track of current row and column (of the returned array)
	for (let row = col = c = 0; c < str.length; c++) {
		let cc = str[c], nc = str[c + 1];        // current character, next character
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
 * @param Array - Name of where the cached text is stored
 * @param Path - Path/Group in which the screen is located
 * @param Screen - Screen for which the file is for
 * @param File - Name of the file to get
 */
function CommonReadCSV(Array: string, Path: string, Screen: string, File: string): void {

	// Changed from a single path to various arguments and internally concatenate them
	// This ternary operator is used to keep backward compatibility
	let FullPath = "Screens/" + Path + "/" + Screen + "/" + File + ".csv";
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
	let TranslationPath = FullPath.replace(".csv", "_" + TranslationLanguage + ".txt");
	if (TranslationAvailable(TranslationPath))
		CommonGet(TranslationPath, function () {
			if (this.status == 200) TranslationCache[TranslationPath] = TranslationParseTXT(this.responseText);
		});

}

/**
 * AJAX utility to get a file and return its content. By default will retry requests 10 times
 * @param Path - Path of the resource to request
 * @param Callback - Callback to execute once the resource is received
 * @param RetriesLeft - How many more times to retry if the request fails - after this hits zero, an error will be logged
 */
function CommonGet(Path: string, Callback: (this: XMLHttpRequest, xhr: XMLHttpRequest) => void, RetriesLeft: number = 10): void {
	let xhr = new XMLHttpRequest();
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
 * @param Path - The path of the resource to request
 * @param Callback - Callback to execute once the resource is received
 * @param RetriesLeft - How many more times to retry - after this hits zero, an error will be logged
 */
function CommonGetRetry(Path: string, Callback: (this: XMLHttpRequest, xhr: XMLHttpRequest) => void, RetriesLeft: number = 10): void {
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
 * @param event - The event that triggered this
 */
function CommonClick(event: MouseEvent | TouchEvent): void {
	//KinkyDungeonClick();
}

/**
 * Returns TRUE if a section of the screen is currently touched on a mobile device
 * @param X - The X position
 * @param Y - The Y position
 * @param W - The width of the square
 * @param H - The height of the square
 * @param TL - Can give a specific touch event instead of the default one
 */
function CommonTouchActive(X: number, Y: number, W: number, H: number, TL: any): boolean {
	if (!CommonIsMobile) return false;
	if (TL == null) TL = CommonTouchList;
	if (TL != null)
		for (let Touch of TL) {
			let TouchX = Math.round((Touch.pageX - PIXICanvas.offsetLeft) * 2000 / PIXICanvas.clientWidth);
			let TouchY = Math.round((Touch.pageY - PIXICanvas.offsetTop) * 1000 / PIXICanvas.clientHeight);
			if ((TouchX >= X) && (TouchX <= X + W) && (TouchY >= Y) && (TouchY <= Y + H))
				return true;
		}
	return false;
}

/**
 * @param event - The event that triggered this
 */
function CommonKeyDown(event: KeyboardEvent): void {
	KinkyDungeonKeyDown();
}

/**
 * Calls a basic dynamic function if it exists, for complex functions, use: CommonDynamicFunctionParams
 * @param FunctionName - Name of the function to call
 */
function CommonDynamicFunction(FunctionName: string): void {
	if (typeof window[FunctionName.substr(0, FunctionName.indexOf("("))] === "function")
		window[FunctionName.replace("()", "")]();
	else
		console.log("Trying to launch invalid function: " + FunctionName);
}


/**
 * Calls a dynamic function with parameters (if it exists), also allow ! in front to reverse the result. The dynamic function is the provided function name in the dialog option object and it is prefixed by the current screen.
 * @param FunctionName - Function name to call dynamically
 * @returns Returns what the dynamic function returns or FALSE if the function does not exist
 */
function CommonDynamicFunctionParams(FunctionName: string): any {

	// Gets the reverse (!) sign
	let Reverse = false;
	if (FunctionName.substring(0, 1) == "!") Reverse = true;
	FunctionName = FunctionName.replace("!", "");

	// Gets the real function name and parameters
	let ParamCount = 1;
	if (FunctionName.indexOf("()") >= 0) ParamCount = 0;
	else ParamCount = FunctionName.split(",").length;
	let openParenthesisIndex = FunctionName.indexOf("(");
	let closedParenthesisIndex = FunctionName.indexOf(")", openParenthesisIndex);
	let Params = FunctionName.substring(openParenthesisIndex + 1, closedParenthesisIndex).split(",");
	for (let P = 0; P < Params.length; P++)
		Params[P] = Params[P].trim().replace('"', '').replace('"', '');
	FunctionName = FunctionName.substring(0, openParenthesisIndex);
	if ((FunctionName.indexOf("Dialog") != 0) && (FunctionName.indexOf("Inventory") != 0) && (FunctionName.indexOf(CurrentScreen) != 0)) FunctionName = CurrentScreen + FunctionName;

	// If it's really a function, we continue
	if (typeof window[FunctionName] === "function") {

		// Launches the function with the params and returns the result
		let Result = true;
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
 * @param FunctionName - The name of the global function to call
 * @param args - zero or more arguments to be passed to the function (optional)
 * @returns Returns the result of the function call, or undefined if the function name isn't valid
 */
function CommonCallFunctionByName(FunctionName: string, ...args: any) {
	let Function = window[FunctionName];
	if (typeof Function === "function") {
		let args = Array.prototype.slice.call(arguments, 1);
		return Function.apply(null, args);
	}
}

/**
 * Behaves exactly like CommonCallFunctionByName, but logs a warning if the function name is invalid.
 * @param FunctionName - The name of the global function to call
 * @param args - zero or more arguments to be passed to the function (optional)
 * @returns Returns the result of the function call, or undefined if the function name isn't valid
 */
function CommonCallFunctionByNameWarn(FunctionName: string, ...args: any) {
	let Function = window[FunctionName];
	if (typeof Function === "function") {
		let args = Array.prototype.slice.call(arguments, 1);
		return Function.apply(null, args);
	} else {
		console.warn(`Attempted to call invalid function "${FunctionName}"`);
	}
}

/**
 * Sets the current screen and calls the loading script if needed
 * @param NewModule - Module of the screen to display
 * @param NewScreen - Screen to display
 */
function CommonSetScreen(NewModule: string, NewScreen: string): void {

	CurrentModule = NewModule;
	CurrentScreen = NewScreen;

	CurrentDarkFactor = 1.0;
	TextLoad();
}

/**
 * Gets the current time in ms
 */
function CommonTime(): number {
	return Date.now();
}

/**
 * Checks if a given value is a valid HEX color code
 * @param Value - Potential HEX color code
 * @returns Returns TRUE if the string is a valid HEX color
 */
function CommonIsColor(Value: string): boolean {
	if ((Value == null) || (Value.length < 3)) return false;
	//convert short hand hex color to standard format
	if (/^#[0-9A-F]{3}$/i.test(Value)) Value = "#" + Value[1] + Value[1] + Value[2] + Value[2] + Value[3] + Value[3];
	return /^#[0-9A-F]{6}$/i.test(Value);
}

/**
 * Checks whether an item's color has a valid value that can be interpreted by the drawing
 * functions. Valid values are null, undefined, strings, and an array containing any of the
 * aforementioned types.
 * @param Color - The Color value to check
 * @returns Returns TRUE if the color is a valid item color
 */
function CommonColorIsValid(Color: any): boolean {
	if (Color == null || typeof Color === "string") return true;
	if (Array.isArray(Color)) return Color.every(C => C == null || typeof C === "string");
	return false;
}

/**
 * Get a random item from a list while making sure not to pick the previous one.
 * @param ItemPrevious - Previously selected item from the given list
 * @param ItemList - List for which to pick a random item from
 * @returns The randomly selected item from the list
 */
function CommonRandomItemFromList<T>(ItemPrevious: T, ItemList: T[]): T {
	let NewItem = ItemPrevious;
	if (!ItemList) return undefined;
	while (NewItem == ItemPrevious)
		NewItem = ItemList[Math.floor(Math.random() * ItemList.length)];
	return NewItem;
}



/**
 * Checks whether two item colors are equal. An item color may either be a string or an array of strings.
 * @param C1 - The first color to check
 * @param C2 - The second color to check
 * @returns TRUE if C1 and C2 represent the same item color, FALSE otherwise
 */
function CommonColorsEqual(C1: string | string[], C2: string | string[]): boolean {
	if (Array.isArray(C1) && Array.isArray(C2)) {
		return CommonArraysEqual(C1, C2);
	}
	return C1 === C2;
}

/**
 * Checks whether two arrays are equal. The arrays are considered equal if they have the same length and contain the same items in the same
 * order, as determined by === comparison
 * @param a1 - The first array to compare
 * @param a2 - The second array to compare
 * @returns TRUE if both arrays have the same length and contain the same items in the same order, FALSE otherwise
 */
function CommonArraysEqual(a1: any[], a2: any[]): boolean {
	return a1.length === a2.length && a1.every((item, i) => item === a2[i]);
}




/**
 * Takes an array of items and converts it to record format
 * @param arr The array of items
 * @returns Output in object format
 */
function CommonPackItemArray(arr: {Group: string; Name: string; Type?: string | null}[]): {[group: string]: {[name: string]: string[]}} {
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
 * @param arr Object defining items
 * @return The array of items
 */
function CommonUnpackItemArray(arr: {[group: string]: {[name: string]: string[]}}): {Group: string; Name: string; Type?: string}[] {
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
 * A simple deep equality check function which checks whether two objects are equal. The function traverses recursively
 * into objects and arrays to check for equality. Primitives and simple types are considered equal as defined by `===`.
 * @param obj1 - The first object to compare
 * @param obj2 - The second object to compare
 * @returns TRUE if both objects are equal, up to arbitrarily deeply nested property values, FALSE
 * otherwise.
 */
function CommonDeepEqual(obj1: any, obj2: any): boolean {
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
 * @param dest - The destination array
 * @param src - The source array
 * @returns The destination array
 */
function CommonArrayConcatDedupe<T>(dest: T[], src: T[]): T[] {
	if (Array.isArray(src) && Array.isArray(dest)) {
		for (const item of src) {
			if (!dest.includes(item)) dest.push(item);
		}
	}
	return dest;
}

/**
 * Common noop function
 */
function CommonNoop(): void {
	// Noop function
}

/**
 * Redirects the address to HTTPS for all production environments, returns the proper heroku server
 * @returns Returns the proper server to use in production or test
 */
function CommonGetServer(): string {
	if ((location.href.indexOf("bondageprojects") < 0) && (location.href.indexOf("bondage-europe") < 0)) return "https://bc-server-test.herokuapp.com/";
	if (location.protocol !== 'https:') location.replace(`https:${location.href.substring(location.protocol.length)}`);
	return "https://bondage-club-server.herokuapp.com/";
}
