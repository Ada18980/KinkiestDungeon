"use strict";
/**
 * The main game canvas where everything will be drawn
 * @type {CanvasRenderingContext2D}
 */
let MainCanvas;
/** @type {CanvasRenderingContext2D} */
let TempCanvas;
/** @type {CanvasRenderingContext2D} */
let ColorCanvas;
/** @type {CanvasRenderingContext2D} */
let CharacterCanvas;

let BlindFlash = false;
let DrawingBlindFlashTimer = 0;

// A bank of all the chached images
/** @type {Map<string, HTMLImageElement>} */
const DrawCacheImage = new Map;
let DrawCacheLoadedImages = 0;
let DrawCacheTotalImages = 0;

// Last dark factor for blindflash
let DrawLastDarkFactor = 0;

/**
 * A list of the characters that are drawn every frame
 * @type {Character[]}
 */
let DrawLastCharacters = [];

/**
 * A list of elements to draw at the end of the drawing process.
 * Mostly used for hovering button labels.
 * @type {Function[]}
 */
let DrawHoverElements = [];


/**
 * Converts a hex color string to a RGB color
 * @param {string} color - Hex color to conver
 * @returns {RGBColor} - RGB color
 */
function DrawHexToRGB(color) {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	color = color.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : {
		r: 0,
		g: 0,
		b: 0
	};
}

/**
 * Converts a RGB color to a hex color string
 * @param {number[]} color - RGB color to conver
 * @returns {string} - Hex color string
 */
function DrawRGBToHex(color) {
	const rgb = color[2] | (color[1] << 8) | (color[0] << 16);
	return '#' + (0x1000000 + rgb).toString(16).slice(1).toUpperCase();
}

let PIXIApp = null;
let PIXICanvas = null;

/**
 * Loads the canvas to draw on with its style and event listeners.
 * @returns {void} - Nothing
 */
function DrawLoad() {
	//document.body.appendChild(PIXIApp.view);

	PIXIApp = new PIXI.Application({
		view: PIXICanvas,
		background: '#1099bb'
	});
	PIXICanvas = document.getElementById("MainCanvas");
	// OLD BC
	// Creates the objects used in the game
	//MainCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("MainCanvas")).getContext("2d");
	//document.getElementById("MainCanvas").addEventListener("keypress", KeyDown);
	//document.getElementById("MainCanvas").tabIndex = 1000;

	// Font is fixed for now, color can be set
	//MainCanvas.font = CommonGetFont(36);
	//MainCanvas.textAlign = "center";
	//MainCanvas.textBaseline = "middle";
}




/**
 * Draws a basic circle
 * @param {number} CenterX - Position of the center of the circle on the X axis
 * @param {number} CenterY - Position of the center of the circle on the Y axis
 * @param {number} Radius - Radius of the circle to draw
 * @param {number} LineWidth - Width of the line
 * @param {string} LineColor - Color of the circle's line
 * @param {string} [FillColor] - Color of the space inside the circle
 * @param {CanvasRenderingContext2D} [Canvas] - The canvas element to draw onto, defaults to MainCanvas
 * @returns {void} - Nothing
 */
function DrawCircle(CenterX, CenterY, Radius, LineWidth, LineColor, FillColor, Canvas) {
	if (!Canvas) Canvas = MainCanvas;
	Canvas.beginPath();
	Canvas.arc(CenterX, CenterY, Radius, 0, 2 * Math.PI, false);
	if (FillColor) {
		Canvas.fillStyle = FillColor;
		Canvas.fill();
	}
	Canvas.lineWidth = LineWidth;
	Canvas.strokeStyle = LineColor;
	Canvas.stroke();
}

/**
 * Draws a progress bar with color
 * @param {number} x - Position of the bar on the X axis
 * @param {number} y - Position of the bar on the Y axis
 * @param {number} w - Width of the bar
 * @param {number} h - Height of the bar
 * @param {number} value - Current progress to display on the bar
 * @param {string} [foreground="#66FF66"] - Color of the first part of the bar
 * @param {string} [background="red"] - Color of the bar background
 * @returns {void} - Nothing
 */
function DrawProgressBar(x, y, w, h, value, foreground = "#66FF66", background = "red") {
	if (value < 0) value = 0;
	if (value > 100) value = 100;
	DrawRectKD(kdcanvas, kdpixisprites, `progbar,${x}_${y}_${w}_${h}_${value}`, {
		Left: x,
		Top: y,
		Width: w,
		Height: h,
		Color: "#ffffff",
		LineWidth: 1,
		zIndex: 100,
	});
	DrawRectKD(kdcanvas, kdpixisprites, `progbar2,${x}_${y}_${w}_${h}_${value}`, {
		Left: x + 2,
		Top: y + 2,
		Width: Math.floor((w - 4) * value / 100),
		Height: h - 4,
		Color: foreground,
		LineWidth: 1,
		zIndex: 100,
	});
	DrawRectKD(kdcanvas, kdpixisprites, `progbar3,${x}_${y}_${w}_${h}_${value}`, {
		Left:Math.floor(x + 2 + (w - 4) * value / 100),
		Top: y + 2,
		Width: Math.floor((w - 4) * (100 - value) / 100),
		Height: h - 4,
		Color: background,
		LineWidth: 1,
		zIndex: 100,
	});
}

/**
 * Constantly looping draw process. Draws beeps, handles the screen size, handles the current blindfold state and draws the current screen.
 * @param {number} time - The current time for frame
 * @returns {void} - Nothing
 */
function DrawProcess(time) {
	// Clear the list of characters that were drawn last frame
	DrawLastCharacters = [];

	KinkyDungeonRun();

	// Draw Hovering text so they can be above everything else
	DrawProcessHoverElements();
}

/**
 * Draws every element that is considered a "hover" element such has button tooltips.
 * @returns {void} - Nothing
 */
function DrawProcessHoverElements() {
	for (let E = 0; E < DrawHoverElements.length; E++)
		if (typeof DrawHoverElements[0] === "function")
			(DrawHoverElements.shift())();
}
