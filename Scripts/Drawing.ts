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
	PIXICanvas = KinkyDungeonGetCanvas("MainCanvas");
}

/**
 * Returns the image file from cache or build it from the source
 * @param Source - URL of the image
 * @returns Image file
 */
function DrawGetImage(Source: string): HTMLImageElement {
	// Search in the cache to find the image and make sure this image is valid
	let Img = DrawCacheImage.get(Source);
	if (!Img) {
		Img = new Image;
		DrawCacheImage.set(Source, Img);
		// Keep track of image load state
		const IsAsset = (Source.indexOf("Assets") >= 0);
		if (IsAsset) {
			++DrawCacheTotalImages;
			Img.addEventListener("load", function () {
				DrawGetImageOnLoad();
			});
		}

		Img.addEventListener("error", function () {
			DrawGetImageOnError(Img, IsAsset);
		});

		// Start loading
		Img.src = KDModFiles[Source] || Source;
	}

	// returns the final image
	return Img;
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
