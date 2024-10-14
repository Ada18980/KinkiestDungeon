/**
 * The main game canvas where everything will be drawn
 * @type {CanvasRenderingContext2D}
 */
let MainCanvas: CanvasRenderingContext2D;
let TempCanvas: CanvasRenderingContext2D;
let ColorCanvas: CanvasRenderingContext2D;
let CharacterCanvas: CanvasRenderingContext2D;

let BlindFlash = false;
let DrawingBlindFlashTimer = 0;

// A bank of all the chached images
const DrawCacheImage: Map<string, HTMLImageElement> = new Map();
let DrawCacheLoadedImages = 0;
let DrawCacheTotalImages = 0;

// Last dark factor for blindflash
let DrawLastDarkFactor = 0;

/**
 * A list of the characters that are drawn every frame
 */
let DrawLastCharacters: Character[] = [];

/**
 * A list of elements to draw at the end of the drawing process.
 * Mostly used for hovering button labels.
 */
let DrawHoverElements: Function[] = [];


/**
 * Converts a hex color string to a RGB color
 * @param color - Hex color to conver
 * @returns RGB color
 */
function DrawHexToRGB(color: string): RGBColor {
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
 * @param color - RGB color to conver
 * @returns Hex color string
 */
function DrawRGBToHex(color: number[]): string {
	const rgb = color[2] | (color[1] << 8) | (color[0] << 16);
	return '#' + (0x1000000 + rgb).toString(16).slice(1).toUpperCase();
}

//let PIXIApp = null;
let PIXICanvas = null;

/**
 * Loads the canvas to draw on with its style and event listeners.
 */
function DrawLoad(): void {
	//document.body.appendChild(PIXIApp.view);

	/*PIXIApp = new PIXI.Application({
		view: PIXICanvas,
		background: '#1099bb'
	});*/
	PIXICanvas = KinkyDungeonGetCanvas("MainCanvas");
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
 * Reloads all character canvas once all images are loaded
 */
function DrawGetImageOnLoad(): void {
	++DrawCacheLoadedImages;
	if (DrawCacheLoadedImages == DrawCacheTotalImages) CharacterLoadCanvasAll();
}

/**
 * Attempts to redownload an image if it previously failed to load
 * @param Img - Image tag that failed to load
 * @param IsAsset - Whether or not the image is part of an asset
 */
function DrawGetImageOnError(Img: HTMLImageElement & { errorcount?: number }, IsAsset: boolean): void {
	if (Img.errorcount == null) Img.errorcount = 0;
	Img.errorcount += 1;
	if (Img.errorcount < 3) {
		// eslint-disable-next-line no-self-assign
		Img.src = Img.src;
	} else {
		// Load failed. Display the error in the console and mark it as done.
		console.log("Error loading image " + Img.src);
		if (IsAsset) DrawGetImageOnLoad();
	}
}



/**
 * Draws a basic circle
 * @param CenterX - Position of the center of the circle on the X axis
 * @param CenterY - Position of the center of the circle on the Y axis
 * @param Radius - Radius of the circle to draw
 * @param LineWidth - Width of the line
 * @param LineColor - Color of the circle's line
 * @param FillColor - Color of the space inside the circle
 * @param Canvas - The canvas element to draw onto, defaults to MainCanvas
 */
function DrawCircle(CenterX: number, CenterY: number, Radius: number, LineWidth: number, LineColor: string, FillColor: string = null, Canvas: CanvasRenderingContext2D = null): void {
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
 * @param x - Position of the bar on the X axis
 * @param y - Position of the bar on the Y axis
 * @param w - Width of the bar
 * @param h - Height of the bar
 * @param value - Current progress to display on the bar
 * @param foreground - Color of the first part of the bar
 * @param background - Color of the bar background
 * @returns Nothing
 */
function DrawProgressBar(x: number, y: number, w: number, h: number, value: number, foreground: string = "#66FF66", background: string = "red"): void {
	if (value < 0) value = 0;
	if (value > 100) value = 100;
	DrawRectKD(kdcanvas, kdpixisprites, `progbar,${x}_${y}_${w}_${h}_${value}`, {
		Left: x,
		Top: y,
		Width: w,
		Height: h,
		Color: "#aaaaaa",
		LineWidth: 2,
		zIndex: 100.02,
	});
	FillRectKD(kdcanvas, kdpixisprites, `progbar2,${x}_${y}_${w}_${h}_${value}`, {
		Left: x + 2,
		Top: y + 2,
		Width: Math.floor((w - 4) * value / 100),
		Height: h - 4,
		Color: foreground,
		LineWidth: 1,
		zIndex: 100.01,
	});
	FillRectKD(kdcanvas, kdpixisprites, `progbar3,${x}_${y}_${w}_${h}_${value}`, {
		Left:Math.floor(x + 2 + (w - 4) * value / 100),
		Top: y + 2,
		Width: Math.floor((w - 4) * (100 - value) / 100),
		Height: h - 4,
		Color: background,
		LineWidth: 1,
		zIndex: 100,
		alpha: 0.8,
	});
}

/**
 * Constantly looping draw process. Draws beeps, handles the screen size, handles the current blindfold state and draws the current screen.
 * @param time - The current time for frame
 */
function DrawProcess(time: number): void {
	// Clear the list of characters that were drawn last frame
	DrawLastCharacters = [];

	KinkyDungeonRun();

	// Draw Hovering text so they can be above everything else
	DrawProcessHoverElements();
}

/**
 * Draws every element that is considered a "hover" element such has button tooltips.
 */
function DrawProcessHoverElements(): void {
	for (let E = 0; E < DrawHoverElements.length; E++)
		if (typeof DrawHoverElements[0] === "function")
			(DrawHoverElements.shift())();
}
