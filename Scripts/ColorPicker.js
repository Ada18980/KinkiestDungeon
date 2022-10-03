"use strict";
/**
 * A hexadecimal color code
 * @typedef {string} HexColor
 */

/**
 * A HSV color value
 * @typedef {{ H: number, S: number, V: number }} HSVColor
 */

/**
 * The color picker callback called when selection completes.
 *
 * @callback ColorPickerCallbackType
 * @param {string} Color
 * @return {void}
 */

var ColorPickerX, ColorPickerY, ColorPickerWidth, ColorPickerHeight;
var ColorPickerInitialHSV, ColorPickerLastHSV, ColorPickerHSV, ColorPickerSourceElement;
/** @type ColorPickerCallbackType */
let ColorPickerCallback;
var ColorPickerCSS;
var ColorPickerIsDefault;
var ColorPickerSelectedFavoriteIndex = null; //A number 0-5
var ColorPickerFavoritesPage = 0; //current page of favorite colors displayed.
var DefaultSavedColors = [];

var ColorPickerHueBarHeight = 40;
var ColorPickerSVPanelGap = 20;
var ColorPickerPaletteHeight = 100;
var ColorPickerPaletteGap = 20;
var ColorPickerFavoritesPaletteHeight = 100;
var ColorPickerFavoritesPaletteGap = 20;

var ColorPickerLayout = {
	HueBarOffset: NaN,
	HueBarHeight: NaN,
	SVPanelOffset: NaN,
	SVPanelHeight: NaN,
	PaletteOffset: NaN,
	PaletteHeight: NaN,
	FavoritesPaletteOffset: NaN,
	FavoritesPaletteHeight: NaN,
	ButtonOffset: NaN,
	NextButtonX: NaN,
	SaveButtonX: NaN,
	PrevButtonX: NaN
};

const ColorPickerNumSaved = 18; //number of colors a player is allowed to save, should be multiple of 6

/**
 * Attaches event listeners required for the color picker to the canvas
 * @returns {void} - Nothing
 */
function ColorPickerAttachEventListener() {
	var CanvasElement = document.getElementById("MainCanvas");
	if (!CommonIsMobile) {
		CanvasElement.addEventListener("mousedown", ColorPickerStartPick);
	}
	CanvasElement.addEventListener("touchstart", ColorPickerStartPick);
}

/**
 * Removes the color picker related event listeners from the canvas
 * @returns {void} - Nothing
 */
function ColorPickerRemoveEventListener() {
	var CanvasElement = document.getElementById("MainCanvas");
	CanvasElement.removeEventListener("mousedown", ColorPickerStartPick);
	CanvasElement.removeEventListener("touchstart", ColorPickerStartPick);
}

/**
 * When the touch/mouse event begins to be registered. On mobile we only fire it once
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
function ColorPickerStartPick(Event) {
	// Only fires at first touch on mobile devices
	if (Event.changedTouches) {
		if (Event.changedTouches.length > 1) return;
	}

	var SVPanelOffset = ColorPickerLayout.SVPanelOffset;
	var SVPanelHeight = ColorPickerLayout.SVPanelHeight;
	var PaletteOffset = ColorPickerLayout.PaletteOffset;
	var PaletteHeight = ColorPickerLayout.PaletteHeight;
	var FavoritesPaletteOffset = ColorPickerLayout.FavoritesPaletteOffset;
	var FavoritesPaletteHeight = ColorPickerLayout.FavoritesPaletteHeight;

	var C = ColorPickerGetCoordinates(Event);
	var X = C.X;
	var Y = C.Y;
	if (X >= ColorPickerX && X < ColorPickerX + ColorPickerWidth) {
		if (Y >= ColorPickerY && Y < ColorPickerY + ColorPickerHueBarHeight) {
			document.addEventListener("mousemove", ColorPickerPickHue);
			document.addEventListener("touchmove", ColorPickerPickHue);
			ColorPickerPickHue(Event);
		} else if (Y >= SVPanelOffset && Y < SVPanelOffset + SVPanelHeight) {
			document.addEventListener("mousemove", ColorPickerPickSV);
			document.addEventListener("touchmove", ColorPickerPickSV);
			ColorPickerPickSV(Event);
		} else if (Y >= PaletteOffset && Y < PaletteOffset + PaletteHeight) {
			if (X > ColorPickerX + (ColorPickerWidth / 2)){
				ColorPickerSelectFromPalette(Event);
			} else {
				ColorPickerSelectButton(Event);
			}
		} else if (Y >= FavoritesPaletteOffset && Y < FavoritesPaletteOffset + FavoritesPaletteHeight) {
			ColorPickerSelectFromFavorites(Event);
		}

		document.addEventListener("mouseup", ColorPickerEndPick);
		document.addEventListener("touchend", ColorPickerEndPick);

	} else {
		ColorPickerSelectedFavoriteIndex = null;
	}
}

/**
 * When we stop registering the touch/mouse event, to remove the attached event listeners
 * @returns {void} - Nothing
 */
function ColorPickerEndPick() {
	document.removeEventListener("mousemove", ColorPickerPickHue);
	document.removeEventListener("mousemove", ColorPickerPickSV);
	document.removeEventListener("mouseup", ColorPickerEndPick);

	document.removeEventListener("touchmove", ColorPickerPickHue);
	document.removeEventListener("touchmove", ColorPickerPickSV);
	document.removeEventListener("touchend", ColorPickerEndPick);
}

/**
 * Gets the coordinates of the current event on the canvas
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {{X: number, Y: number}} - Coordinates of the click/touch event on the canvas
 */
function ColorPickerGetCoordinates(Event) {
	if (Event.changedTouches) {
		// Mobile
		var Touch = Event.changedTouches[0];
		TouchMove(Touch);
	} else {
		// PC
		MouseMove(Event);
	}

	return { X: MouseX, Y: MouseY };
}

/**
 * Sets the picked hue based on the Event coordinates on the canvas
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
function ColorPickerPickHue(Event) {
	var C = ColorPickerGetCoordinates(Event);
	ColorPickerHSV.H = Math.max(0, Math.min(1, (C.X - ColorPickerX) / ColorPickerWidth));
	ColorPickerNotify();
}

/**
 * Sets the picked saturation (SV) based on the Event coordinates on the canvas
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
function ColorPickerPickSV(Event) {
	var C = ColorPickerGetCoordinates(Event);
	var SVPanelOffset = ColorPickerLayout.SVPanelOffset;
	var SVPanelHeight = ColorPickerLayout.SVPanelHeight;

	var S = (C.X - ColorPickerX) / ColorPickerWidth;
	var V = 1 - (C.Y - SVPanelOffset) / SVPanelHeight;
	ColorPickerHSV.S = Math.max(0, Math.min(1, S));
	ColorPickerHSV.V = Math.max(0, Math.min(1, V));
	ColorPickerNotify();
}

/**
 * Sets the picked HSV from the color palette
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
function ColorPickerSelectFromPalette(Event) {
	var C = ColorPickerGetCoordinates(Event);
	var P = Math.max(0, Math.min(1, (C.X - ColorPickerX) / ColorPickerWidth));
	var HSV = P > 0.75 ? ColorPickerInitialHSV : ColorPickerLastHSV;
	ColorPickerHSV = Object.assign({}, HSV);
	ColorPickerNotify();
}

/**
 * Handles clicking on the favorite colors palette
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
function ColorPickerSelectFromFavorites(Event) {
	var C = ColorPickerGetCoordinates(Event);
	var P = Math.max(0, Math.min(1, (C.X - ColorPickerX) / ColorPickerWidth));
	var SelectedIndex = Math.min(Math.floor(P * 6), 5);

	if (SelectedIndex == ColorPickerSelectedFavoriteIndex){
		ColorPickerHSV = Object.assign({}, Player.SavedColors[ColorPickerSelectedFavoriteIndex + (ColorPickerFavoritesPage * 6)]);
		ColorPickerNotify();
		ColorPickerSelectedFavoriteIndex = null;
	} else {
		ColorPickerSelectedFavoriteIndex = SelectedIndex;
	}
}

/**
 * Handles the previous, next, and save button functionality for the color picker.
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
function ColorPickerSelectButton(Event) {
	var C = ColorPickerGetCoordinates(Event);
	var X = C.X;
	var Y = C.Y;

	if(Y > ColorPickerLayout.ButtonOffset && Y < ColorPickerLayout.ButtonOffset + 90){
		if (X > ColorPickerLayout.NextButtonX && X < ColorPickerLayout.NextButtonX + 90){
			ColorPickerFavoritesPage = (ColorPickerFavoritesPage + 1) % Math.round(ColorPickerNumSaved / 6);
			ColorPickerSelectedFavoriteIndex = null;
		} else if (X > ColorPickerLayout.SaveButtonX && X < ColorPickerLayout.SaveButtonX + 90){
			if (!(ColorPickerSelectedFavoriteIndex === null)) {
				Player.SavedColors[ColorPickerSelectedFavoriteIndex + (ColorPickerFavoritesPage * 6)] = Object.assign({}, ColorPickerHSV);
				ServerSend("AccountUpdate", { SavedColors: Player.SavedColors });
			}
		} else if (X > ColorPickerLayout.PrevButtonX && X < ColorPickerLayout.PrevButtonX + 90){
			var NumPages = Math.round(ColorPickerNumSaved / 6);
			ColorPickerFavoritesPage = (((ColorPickerFavoritesPage - 1) % NumPages) + NumPages) % NumPages;
			ColorPickerSelectedFavoriteIndex = null;
		}
	}
}

/**
 * Alters the color picker display based on the selected value
 * @param {boolean} [sourceElementChanged=false] - True if the color was updated by the text input element
 * @returns {void} - Nothing
 */
function ColorPickerNotify(sourceElementChanged = false) {
	ColorPickerLastHSV = Object.assign({}, ColorPickerHSV);
	if (!sourceElementChanged) ColorPickerCSS = ColorPickerHSVToCSS(ColorPickerHSV);
	if (ColorPickerCallback) {
		ColorPickerCallback(ColorPickerCSS);
	}

	if (!sourceElementChanged && ColorPickerSourceElement) {
		ColorPickerSourceElement.value = ColorPickerCSS;
	}
}

/**
 * Removes the color picker and its listeners from the canvas
 * @return {void} - Nothing
 */
function ColorPickerHide() {
	ColorPickerSourceElement = null;
	ColorPickerInitialHSV = null;
	ColorPickerLastHSV = null;
	ColorPickerCallback = null;
	ColorPickerRemoveEventListener();
}

/**
 * Checks if two hex color codes are equal, will convert short hand hex codes (#FFF is equal to #FFFFFF)
 * @param {HexColor} Color1 - First color to compare
 * @param {HexColor} Color2 - Second color to compare
 * @returns {boolean} - Returns TRUE if the two colors are the same
 */
function ColorPickerCSSColorEquals(Color1, Color2) {
	Color1 = Color1.toUpperCase();
	Color2 = Color2.toUpperCase();
	if (!CommonIsColor(Color1) || !CommonIsColor(Color2)) return false;
	// convert short hand hex color to standard format
	if (Color1.length == 4) Color1 = "#" + Color1[1] + Color1[1] + Color1[2] + Color1[2] + Color1[3] + Color1[3];
	if (Color2.length == 4) Color2 = "#" + Color2[1] + Color2[1] + Color2[2] + Color2[2] + Color2[3] + Color2[3];
	return Color1 === Color2;
}

/**
 * Draws the color picker on the canvas
 * @param {number} X - Coordinate on the X axis
 * @param {number} Y - Coordinate on the Y axis
 * @param {number} Width - Width of the color picker
 * @param {number} Height - Height of the color picker
 * @param {HTMLInputElement} Src - Input element that can contain a hex color code
 * @param {ColorPickerCallbackType} [Callback] - Callback to execute when the selected color changes
 * @returns {void} - Nothing
 */
function ColorPickerDraw(X, Y, Width, Height, Src, Callback) {

	// Calculate Layout
	ColorPickerLayout.HueBarHeight = ColorPickerHueBarHeight;
	ColorPickerLayout.HueBarOffset = Y;
	ColorPickerLayout.FavoritesPaletteHeight = ColorPickerFavoritesPaletteHeight;
	ColorPickerLayout.FavoritesPaletteOffset = Y + Height - ColorPickerLayout.FavoritesPaletteHeight;
	ColorPickerLayout.PaletteHeight = ColorPickerPaletteHeight;
	ColorPickerLayout.PaletteOffset = Y + Height - ColorPickerLayout.PaletteHeight - ColorPickerLayout.FavoritesPaletteHeight - ColorPickerFavoritesPaletteGap;
	ColorPickerLayout.SVPanelHeight = Height - ColorPickerLayout.HueBarHeight - ColorPickerLayout.PaletteHeight - ColorPickerSVPanelGap - ColorPickerPaletteGap - ColorPickerLayout.FavoritesPaletteHeight - ColorPickerFavoritesPaletteGap;
	ColorPickerLayout.SVPanelOffset = ColorPickerLayout.HueBarOffset + ColorPickerHueBarHeight + ColorPickerSVPanelGap;
	ColorPickerLayout.ButtonOffset = ColorPickerLayout.PaletteOffset + ((ColorPickerLayout.PaletteHeight - 90) / 2);
	ColorPickerLayout.SaveButtonX = X + (((ColorPickerWidth / 6) - 90) / 2);
	ColorPickerLayout.PrevButtonX = X + (ColorPickerWidth / 6) + (((ColorPickerWidth / 6) - 90) / 2);
	ColorPickerLayout.NextButtonX = X + (ColorPickerWidth / 3) + (((ColorPickerWidth / 6) - 90) / 2);

	var SVPanelOffset = ColorPickerLayout.SVPanelOffset;
	var SVPanelHeight = ColorPickerLayout.SVPanelHeight;
	var PaletteOffset = ColorPickerLayout.PaletteOffset;
	var PaletteHeight = ColorPickerLayout.PaletteHeight;
	var FavoritesPaletteOffset = ColorPickerLayout.FavoritesPaletteOffset;
	var FavoritesPaletteHeight = ColorPickerLayout.FavoritesPaletteHeight;
	var ButtonOffset = ColorPickerLayout.ButtonOffset;
	var NextButtonX = ColorPickerLayout.NextButtonX;
	var SaveButtonX = ColorPickerLayout.SaveButtonX;
	var PrevButtonX = ColorPickerLayout.PrevButtonX;

	var HSV;
	if (ColorPickerInitialHSV == null) {
		// Get initial color value based on type of source
		var Color;
		if (Src instanceof HTMLInputElement) {
			ColorPickerSourceElement = Src;
			Color = Src.value.trim();
		} else {
			if (ColorPickerSourceElement != null) {
				ColorPickerSourceElement = null;
			}
			Color = Src;
		}

		HSV = ColorPickerCSSToHSV(Color);
		ColorPickerInitialHSV = Object.assign({}, HSV);
		ColorPickerLastHSV =  Object.assign({}, HSV);
		ColorPickerHSV =  Object.assign({}, HSV);
		ColorPickerCSS = Color;
		ColorPickerRemoveEventListener();   // remove possible duplicated attached event listener, just in case
		ColorPickerAttachEventListener();
	} else {
		// Watch source element change
		if (ColorPickerSourceElement != null) {
			var UserInputColor = ColorPickerSourceElement.value.trim().toUpperCase();
			if (CommonIsColor(UserInputColor)) {
				ColorPickerIsDefault = false;
				if (!ColorPickerCSSColorEquals(UserInputColor, ColorPickerCSS)) {
					ColorPickerCSS = UserInputColor;
					ColorPickerHSV = ColorPickerCSSToHSV(UserInputColor, ColorPickerHSV);
					ColorPickerNotify(true);
				}
			} else if (UserInputColor === "DEFAULT" && !ColorPickerIsDefault) {
				ColorPickerIsDefault = true;
				if (ColorPickerCallback) ColorPickerCallback("Default");
			}
		}
		// Use user updated HSV
		HSV = ColorPickerHSV;
	}

	// Draw Hue Control
	var Grad;
	Grad = MainCanvas.createLinearGradient(X, Y, X + Width, Y);
	Grad.addColorStop(0.00, "#f00");
	Grad.addColorStop(0.16, "#ff0");
	Grad.addColorStop(0.33, "#0f0");
	Grad.addColorStop(0.50, "#0ff");
	Grad.addColorStop(0.66, "#00f");
	Grad.addColorStop(0.83, "#f0f");
	Grad.addColorStop(1.00, "#f00");
	MainCanvas.fillStyle = Grad;
	MainCanvas.fillRect(X, Y, Width, ColorPickerHueBarHeight);

	// Draw S/V Panel
	DrawRect(X, SVPanelOffset, Width, SVPanelHeight, ColorPickerHSVToCSS({ H: HSV.H, S: 1, V: 1 }));

	Grad = MainCanvas.createLinearGradient(X, SVPanelOffset, X + Width, SVPanelOffset);
	Grad.addColorStop(0, "rgba(255, 255, 255, 1)");
	Grad.addColorStop(1, "rgba(255, 255, 255, 0)");
	MainCanvas.fillStyle = Grad;
	MainCanvas.fillRect(X, SVPanelOffset, Width, SVPanelHeight);

	Grad = MainCanvas.createLinearGradient(X, SVPanelOffset, X, SVPanelOffset + SVPanelHeight);
	Grad.addColorStop(0, "rgba(0, 0, 0, 0)");
	Grad.addColorStop(1, "rgba(0, 0, 0, 1)");
	MainCanvas.fillStyle = Grad;
	MainCanvas.fillRect(X, SVPanelOffset, Width, SVPanelHeight);

	if (!ColorPickerIsDefault) {
		var CSS = ColorPickerHSVToCSS(HSV);
		DrawCircle(X + HSV.S * Width, SVPanelOffset + (1 - HSV.V) * SVPanelHeight, 8, 16, CSS);
		DrawCircle(X + HSV.S * Width, SVPanelOffset + (1 - HSV.V) * SVPanelHeight, 14, 4, (HSV.V > 0.8 && HSV.S < 0.2) ? "#333333" : "#FFFFFF");
	}
	// Draw Hue Picker
	DrawEmptyRect(X + HSV.H * (Width - 20), Y, 20, ColorPickerHueBarHeight, "#FFFFFF");

	//Draw Buttons (90 by 90 px) centered
	let SavedTextAlign = MainCanvas.textAlign;
	MainCanvas.textAlign = "center";
	DrawButton(SaveButtonX, ButtonOffset, 90, 90, "", "White", "Icons/Save.png", DialogFindPlayer("ColorSave"));
	DrawButton(PrevButtonX, ButtonOffset, 90, 90, "", "White", "Icons/Prev.png", DialogFindPlayer("PrevPage"));
	DrawButton(NextButtonX, ButtonOffset, 90, 90, "", "White", "Icons/Next.png", DialogFindPlayer("NextPage"));
	MainCanvas.textAlign = SavedTextAlign;

	// Draw Palette
	DrawRect(X + (ColorPickerWidth / 2), PaletteOffset, ColorPickerWidth / 4, PaletteHeight, ColorPickerHSVToCSS(ColorPickerLastHSV));
	DrawRect(X + ((ColorPickerWidth / 4) * 3), PaletteOffset, ColorPickerWidth / 4, PaletteHeight, ColorPickerHSVToCSS(ColorPickerInitialHSV));

	// Draw Favorites Palette
	DrawRect(X, FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, ColorPickerHSVToCSS(Player.SavedColors[0 + (ColorPickerFavoritesPage * 6)]));
	DrawRect(X + (ColorPickerWidth / 6), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, ColorPickerHSVToCSS(Player.SavedColors[1 + (ColorPickerFavoritesPage * 6)]));
	DrawRect(X + ((ColorPickerWidth / 6) * 2), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, ColorPickerHSVToCSS(Player.SavedColors[2 + (ColorPickerFavoritesPage * 6)]));
	DrawRect(X + ((ColorPickerWidth / 6) * 3), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, ColorPickerHSVToCSS(Player.SavedColors[3 + (ColorPickerFavoritesPage * 6)]));
	DrawRect(X + ((ColorPickerWidth / 6) * 4), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, ColorPickerHSVToCSS(Player.SavedColors[4 + (ColorPickerFavoritesPage * 6)]));
	DrawRect(X + ((ColorPickerWidth / 6) * 5), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, ColorPickerHSVToCSS(Player.SavedColors[5 + (ColorPickerFavoritesPage * 6)]));
	if (ColorPickerSelectedFavoriteIndex !== null) //if a saved color is selected
	{
		var FavoriteColorX = X + ((ColorPickerWidth / 6) * ColorPickerSelectedFavoriteIndex);

		if (MouseX > FavoriteColorX && MouseX < FavoriteColorX + (ColorPickerWidth / 6) && MouseY > FavoritesPaletteOffset && MouseY < FavoritesPaletteOffset + FavoritesPaletteHeight) {
			// If mouse is hovering over selected favorite color slot, change color of highlight.
			DrawEmptyRect(X + ((ColorPickerWidth / 6) * ColorPickerSelectedFavoriteIndex), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, "darkcyan", 10);
		} else { // Highlight selected favorite color slot.
			DrawEmptyRect(X + ((ColorPickerWidth / 6) * ColorPickerSelectedFavoriteIndex), FavoritesPaletteOffset, ColorPickerWidth / 6, FavoritesPaletteHeight, "cyan", 10);
		}
	}

	ColorPickerX = X;
	ColorPickerY = Y;
	ColorPickerWidth = Width;
	ColorPickerHeight = Height;
	ColorPickerCallback = Callback;
}

/**
 * Parses a hex color code and converts it to a HSV object
 * @param {HexColor} Color - Hex color code
 * @param {HSVColor} [DefaultHSV] - The HSV to output if the color is not valid
 * @returns {HSVColor} - The HSV color from a hex color code
 * @see {@link https://gist.github.com/mjackson/5311256}
 */
function ColorPickerCSSToHSV(Color, DefaultHSV) {
	Color = Color || "#FFFFFF";
	var M = Color.match(/^#(([0-9a-f]{3})|([0-9a-f]{6}))$/i);
	var R, G, B;
	if (M) {
		var GRP = M[1];
		if (GRP.length == 3) {
			R = Number.parseInt(GRP[0] + GRP[0], 16) / 255;
			G = Number.parseInt(GRP[1] + GRP[1], 16) / 255;
			B = Number.parseInt(GRP[2] + GRP[2], 16) / 255;
		} else if (GRP.length == 6) {
			R = Number.parseInt(GRP[0] + GRP[1], 16) / 255;
			G = Number.parseInt(GRP[2] + GRP[3], 16) / 255;
			B = Number.parseInt(GRP[4] + GRP[5], 16) / 255;
		}
	}

	if (isNaN(R) || isNaN(G) || isNaN(B)) {
		return DefaultHSV ? DefaultHSV : { H: 0, S: 0, V: 1 };
	}

	var Max = Math.max(R, G, B);
	var Min = Math.min(R, G, B);
	var D = Max - Min;
	var H = 0;
	var S = (Max == 0) ? 0 : D / Max;
	var V = Max;

	if (D == 0) {
		H = 0;
	} else {
		if (Max == R) {
			H = (G - B) / D + (G < B ? 6 : 0);
		} else if (Max == G) {
			H = (B - R) / D + 2;
		} else {
			H = (R - G) / D + 4;
		}
		H /= 6;
	}

	return { H: H, S: S, V: V };
}

/**
 * Converts a HSV object into a valid hex code to use in the css
 * @param {HSVColor} HSV - HSV value to convert
 * @returns {HexColor} - Hex color code corresponding to the given HSV
 */
function ColorPickerHSVToCSS(HSV) {
	var R, G, B;
	var H = HSV.H, S = HSV.S, V = HSV.V;
	var I = Math.floor(H * 6);
	var F = H * 6 - I;
	var P = V * (1 - S);
	var Q = V * (1 - F * S);
	var T = V * (1 - (1 - F) * S);

	switch (I % 6) {
		case 0: R = V; G = T; B = P; break;
		case 1: R = Q; G = V; B = P; break;
		case 2: R = P; G = V; B = T; break;
		case 3: R = P; G = Q; B = V; break;
		case 4: R = T; G = P; B = V; break;
		case 5: R = V; G = P; B = Q; break;
	}

	var RS = Math.floor(R * 255).toString(16).toUpperCase();
	var GS = Math.floor(G * 255).toString(16).toUpperCase();
	var BS = Math.floor(B * 255).toString(16).toUpperCase();

	if (RS.length == 1) RS = "0" + RS;
	if (GS.length == 1) GS = "0" + GS;
	if (BS.length == 1) BS = "0" + BS;

	return "#" + RS + GS + BS;
}

/**
 * Returns the array of default colors for the list of favorite colors.
 * @returns {HSVColor[]} - Array of default colors
 */
function GetDefaultSavedColors() {

	if (DefaultSavedColors.length == 0) { //sets custom default values if not set yet
		DefaultSavedColors[0] = {H: 0, S: 0, V: 0.12549019607843137};
		DefaultSavedColors[1] = {H: 0, S: 0, V: 0.5019607843137255};
		DefaultSavedColors[2] = {H: 0, S: 0, V: 0.7333333333333333};
		DefaultSavedColors[3] = {H: 0, S: 0.24705882352941172, V: 0.6666666666666666};
		DefaultSavedColors[4] = {H: 0.3333333333333333, S: 0.24705882352941172, V: 0.6666666666666666};
		DefaultSavedColors[5] = {H: 0.6666666666666666, S: 0.24705882352941172, V: 0.6666666666666666};
		DefaultSavedColors[6] = {H: 0.16666666666666666, S: 0.24705882352941172, V: 0.6666666666666666};
		DefaultSavedColors[7] = {H: 0.5, S: 0.24705882352941172, V: 0.6666666666666666};
		DefaultSavedColors[8] = {H: 0.8333333333333334, S: 0.24705882352941172, V: 0.6666666666666666};
		DefaultSavedColors[9] = {H: 0, S: 0.7500000000000001, V: 0.8};
		DefaultSavedColors[10] = {H: 0.3333333333333333, S: 0.7500000000000001, V: 0.8};
		DefaultSavedColors[11] = {H: 0.6666666666666666, S: 0.7500000000000001, V: 0.8};
		DefaultSavedColors[12] = {H: 0.16666666666666666, S: 0.7500000000000001, V: 0.8};
		DefaultSavedColors[13] = {H: 0.5, S: 0.7500000000000001, V: 0.8};
		DefaultSavedColors[14] = {H: 0.8333333333333334, S: 0.7500000000000001, V: 0.8};
		DefaultSavedColors[15] = {H: 0, S: 0, V: 0.12549019607843137};
		DefaultSavedColors[16] = {H: 0, S: 0, V: 0.5019607843137255};
		DefaultSavedColors[17] = {H: 0, S: 0, V: 0.7333333333333333};
		DefaultSavedColors[18] = {H: 0, S: 0.24705882352941172, V: 0.6666666666666666};

		for (let i = 0; i < ColorPickerNumSaved; i++) { //fill rest of slots with white
			if (typeof DefaultSavedColors[i] != "object") {
				DefaultSavedColors[i] = {H: 0, S: 0, V: 1};
			}
		}
	}

	var SavedColors = [];
	for (let i = 0; i < ColorPickerNumSaved; i++) {
		SavedColors[i] = Object.assign({}, DefaultSavedColors[i]);
	}
	return SavedColors;
}
